import Purchases, { type CustomerInfo, type PurchasesPackage } from "react-native-purchases";
import { Platform } from "react-native";
import { useAccount } from "./auth";
import { integrations, type Offering } from "./integrations";
import { premiumStatus, storeOfferings } from "./commerceModel";
import { observeCommerceIdentity, useMonetization } from "./monetization";
import { FALLBACK_OFFERINGS } from "./premiumPolicy";

export async function installRevenueCat() {
  const apiKey = Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_US_REVENUECAT_IOS_KEY || process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY
    : process.env.EXPO_PUBLIC_US_REVENUECAT_ANDROID_KEY || process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY;
  const entitlement = process.env.EXPO_PUBLIC_US_PREMIUM_ENTITLEMENT || "premium";
  const monthly = process.env.EXPO_PUBLIC_US_MONTHLY_PRODUCT_ID || "dmv_us_monthly";
  const lifetime = process.env.EXPO_PUBLIC_US_LIFETIME_PRODUCT_ID || "dmv_us_lifetime";
  if (!apiKey || !monthly || !lifetime || monthly === lifetime) throw new Error("purchasePending");
  // Wait for Supabase's persisted session before attaching a purchase identity.
  if (!useAccount.getState().ready) await new Promise<void>((resolve) => {
    const stop = useAccount.subscribe((state) => { if (state.ready) { stop(); resolve(); } });
  });
  const userId = () => useAccount.getState().session?.user.id;
  Purchases.configure({ apiKey, appUserID: userId() });
  let identityQueue = Promise.resolve();
  let identityChanging = false;
  const publish = (info: CustomerInfo) => useMonetization.setState({ ...premiumStatus(info, entitlement), error: false, checking: false });
  const synchronize = () => {
    identityQueue = identityQueue.catch(() => {}).then(async () => {
      identityChanging = true;
      useMonetization.setState({ checking: true });
      try {
        const expected = userId();
        if (expected) {
          if (await Purchases.getAppUserID() !== expected) await Purchases.logIn(expected);
        } else if (!await Purchases.isAnonymous()) await Purchases.logOut();
        const info = await Purchases.getCustomerInfo();
        if (expected === userId()) publish(info);
      } finally { identityChanging = false; }
    });
    return identityQueue;
  };
  let packages: PurchasesPackage[] = [];
  const offerings = async (): Promise<Offering[]> => {
    await synchronize();
    packages = (await Purchases.getOfferings()).current?.availablePackages ?? [];
    const strict = storeOfferings(packages, { monthly, lifetime });
    if (strict.length > 0) return strict;

    // Fallback to standard RevenueCat package types ($rc_monthly / $rc_lifetime) if custom product IDs differ
    const mapped = packages
      .flatMap<Offering>((item) => {
        const product = item.product;
        const kind =
          item.packageType === "LIFETIME" || item.identifier === "$rc_lifetime"
            ? "lifetime"
            : item.packageType === "MONTHLY" || item.identifier === "$rc_monthly"
              ? "monthly"
              : null;
        if (!kind || !Number.isFinite(product.price) || product.price <= 0) return [];
        return [
          {
            id: item.identifier,
            kind,
            title: product.title,
            description: product.description,
            price: product.priceString,
            priceAmount: product.price,
            currency: product.currencyCode,
          },
        ];
      })
      .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "lifetime" ? -1 : 1));
    if (mapped.length > 0) return mapped;
    if (typeof __DEV__ !== "undefined" && __DEV__) return FALLBACK_OFFERINGS;
    return [];
  };
  await synchronize();
  integrations.setCommerce({
    status: async () => {
      await synchronize();
      const { active, productId, expiresAt, managementUrl } = useMonetization.getState();
      return { active, productId, expiresAt, managementUrl };
    },
    offerings,
    purchase: async (id) => {
      const allowed = await offerings();
      if (!allowed.some((offer) => offer.id === id)) throw new Error("invalid_product");
      const item = packages.find((entry) => entry.identifier === id || entry.product.identifier === id);
      if (!item && typeof __DEV__ !== "undefined" && __DEV__) {
        const fallback = FALLBACK_OFFERINGS.find((o) => o.id === id) ?? FALLBACK_OFFERINGS[0];
        useMonetization.setState({
          active: true,
          productId: fallback.id,
          expiresAt: fallback.kind === "lifetime" ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          managementUrl: "https://apps.apple.com/account/subscriptions",
          isPreview: true,
          error: false,
          checking: false,
        });
        return true;
      }
      if (!item) throw new Error("invalid_product");
      const expected = userId();
      const { customerInfo } = await Purchases.purchasePackage(item);
      if (expected !== userId()) { await synchronize(); return false; }
      publish(customerInfo);
      return premiumStatus(customerInfo, entitlement).active;
    },
    restore: async () => {
      await synchronize();
      const expected = userId();
      const info = await Purchases.restorePurchases();
      if (expected !== userId()) { await synchronize(); return false; }
      publish(info);
      return premiumStatus(info, entitlement).active;
    },
  });
  Purchases.addCustomerInfoUpdateListener(() => {
    if (!identityChanging) void synchronize().catch(() => useMonetization.setState({ error: true, checking: false }));
  });
  observeCommerceIdentity(synchronize);
  void synchronize().catch(() => useMonetization.setState({ error: true, checking: false }));
}
