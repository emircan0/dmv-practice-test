import { create } from "zustand";
import { Platform, AppState } from "react-native";
import Constants from "expo-constants";
import { useAccount } from "./auth";
import { integrations, type PremiumStatus } from "./integrations";
import { FALLBACK_OFFERINGS } from "./premiumPolicy";

export const useMonetization = create<PremiumStatus & {
  ready: boolean; checking: boolean; billingAvailable: boolean; error: boolean; isPreview?: boolean;
}>(() => ({ ready: false, checking: false, billingAvailable: false, active: false, error: false, isPreview: false }));

function installPreviewCommerce() {
  if (integrations.commerce()) return;
  integrations.setCommerce({
    status: async () => {
      const { active, productId, expiresAt, managementUrl } = useMonetization.getState();
      return { active, productId, expiresAt, managementUrl };
    },
    offerings: async () => FALLBACK_OFFERINGS,
    purchase: async (id: string) => {
      const offer = FALLBACK_OFFERINGS.find((o) => o.id === id) ?? FALLBACK_OFFERINGS[0];
      const isLifetime = offer.kind === "lifetime";
      const expiresAt = isLifetime
        ? undefined
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      useMonetization.setState({
        active: true,
        productId: offer.id,
        expiresAt,
        managementUrl: "https://apps.apple.com/account/subscriptions",
        error: false,
        checking: false,
      });
      return true;
    },
    restore: async () => {
      return useMonetization.getState().active;
    },
  });
  useMonetization.setState({ billingAvailable: true, isPreview: true, error: false, checking: false });
}

let started = false;
export function initializeMonetization() {
  if (started) return;
  started = true;
  if (Platform.OS === "web" || Constants.appOwnership === "expo") {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      installPreviewCommerce();
    }
    useMonetization.setState({ ready: true });
    return;
  }
  // Never import a native SDK in Expo Go or on the web.
  void (async () => {
    if (process.env.EXPO_PUBLIC_US_BILLING_ENABLED === "true") {
      try {
        const { installRevenueCat } = await import("./revenueCat");
        await installRevenueCat();
        useMonetization.setState({ billingAvailable: true, isPreview: false });
      } catch {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          installPreviewCommerce();
        } else {
          useMonetization.setState({ error: true, checking: false });
        }
      }
    } else if (typeof __DEV__ !== "undefined" && __DEV__) {
      installPreviewCommerce();
    }
    if (process.env.EXPO_PUBLIC_US_ADS_ENABLED === "true") {
      try {
        const { installAdMob } = await import("./admob");
        installAdMob();
      } catch {
        // Ads unavailable must never prevent studying or restoring purchases.
      }
    }
    useMonetization.setState({ ready: true });
  })();
}

export async function refreshPremium() {
  const expected = useAccount.getState().session?.user.id;
  try {
    const result = await integrations.commerce()?.status();
    if (result && expected === useAccount.getState().session?.user.id) useMonetization.setState({ ...result, error: false });
  } catch {
    useMonetization.setState({ error: true, checking: false });
  }
}

export function observeCommerceIdentity(sync: () => Promise<void>) {
  useAccount.subscribe((next, previous) => {
    if (next.session?.user.id !== previous.session?.user.id) {
      useMonetization.setState({ active: false, checking: true, productId: undefined, expiresAt: undefined, managementUrl: undefined });
      void sync().catch(() => useMonetization.setState({ error: true, checking: false }));
    }
  });
  AppState.addEventListener("change", (state) => {
    if (state === "active") void sync().catch(() => useMonetization.setState({ error: true, checking: false }));
  });
}
