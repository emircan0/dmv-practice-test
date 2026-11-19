// Service adapters for the new US application only. No Turkish product IDs.
export interface Offering {
  id: string;
  title: string;
  price: string;
  description: string;
  kind: "monthly" | "lifetime";
  priceAmount: number;
  currency: string;
}
export interface PremiumStatus {
  active: boolean;
  productId?: string;
  expiresAt?: string | null;
  managementUrl?: string | null;
}
export interface CommerceAdapter {
  status: () => Promise<PremiumStatus>;
  offerings: () => Promise<Offering[]>;
  purchase: (id: string) => Promise<boolean>;
  restore: () => Promise<boolean>;
}
export interface AdsAdapter {
  reward: () => Promise<{ earned: boolean; credits: number }>;
  afterStudy: (attemptId: string, mode: string) => Promise<void>;
  privacyOptions: () => Promise<void>;
}
let commerce: CommerceAdapter | null = null;
let ads: AdsAdapter | null = null;
export const integrations = {
  setCommerce: (adapter: CommerceAdapter) => {
    commerce = adapter;
  },
  setAds: (adapter: AdsAdapter) => {
    ads = adapter;
  },
  commerce: () => commerce,
  ads: () => ads,
};
