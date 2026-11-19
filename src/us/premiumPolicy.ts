import type { Offering } from "./integrations";

export const FREE_TOPICS = new Set([
  "road-signs",
  "signals-markings",
  "right-of-way",
]);

export const FREE_EXAM_LIMIT = 1;
export const TOPIC_CREDIT_COST = 1;
export const EXAM_CREDIT_COST = 2;
export const MISTAKES_CREDIT_COST = 1;

export function isTopicFree(topic?: string): boolean {
  if (!topic) return true;
  return FREE_TOPICS.has(topic);
}

export const FALLBACK_OFFERINGS: Offering[] = [
  {
    id: process.env.EXPO_PUBLIC_US_LIFETIME_PRODUCT_ID || "dmv_us_lifetime",
    kind: "lifetime",
    title: "Unlimited Access",
    description: "One-time purchase. Full access for as long as you need.",
    price: "$6.99",
    priceAmount: 6.99,
    currency: "USD",
  },
  {
    id: process.env.EXPO_PUBLIC_US_MONTHLY_PRODUCT_ID || "dmv_us_monthly",
    kind: "monthly",
    title: "Monthly Access",
    description: "Billed monthly. Cancel anytime in settings.",
    price: "$4.99",
    priceAmount: 4.99,
    currency: "USD",
  },
];
