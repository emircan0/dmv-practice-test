import type { CustomerInfo, PurchasesPackage } from "react-native-purchases";
import type { Offering, PremiumStatus } from "./integrations.ts";

export interface ProductIds { monthly: string; lifetime: string }
export function storeOfferings(packages: PurchasesPackage[], ids: ProductIds): Offering[] {
  // Explicit product allowlist: another app's/current offering's products never
  // become purchasable just because RevenueCat returned them.
  return packages.flatMap<Offering>((item) => {
    const product = item.product;
    const kind = product.identifier === ids.monthly ? "monthly"
      : product.identifier === ids.lifetime ? "lifetime" : null;
    if (!kind || !Number.isFinite(product.price) || product.price <= 0) return [];
    if (kind === "monthly" && (product.subscriptionPeriod !== "P1M" || product.productCategory !== "SUBSCRIPTION")) return [];
    if (kind === "lifetime" && (product.subscriptionPeriod || product.productCategory !== "NON_SUBSCRIPTION")) return [];
    return [{ id: item.identifier, kind, title: product.title,
      description: product.description, price: product.priceString,
      priceAmount: product.price, currency: product.currencyCode }];
  }).sort((a, b) => a.kind === b.kind ? 0 : a.kind === "lifetime" ? -1 : 1);
}
export function premiumStatus(info: CustomerInfo, entitlement: string): PremiumStatus {
  const active = info.entitlements.active[entitlement];
  return {
    active: !!active?.isActive,
    productId: active?.productIdentifier,
    expiresAt: active?.expirationDate,
    managementUrl: info.managementURL,
  };
}
export function lifetimeMonths(offers: Offering[]): number | null {
  const monthly = offers.find((offer) => offer.kind === "monthly");
  const lifetime = offers.find((offer) => offer.kind === "lifetime");
  if (!monthly || !lifetime || monthly.currency !== lifetime.currency || monthly.priceAmount <= 0) return null;
  return Math.round(lifetime.priceAmount / monthly.priceAmount * 10) / 10;
}
