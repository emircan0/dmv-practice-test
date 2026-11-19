export interface ReleaseCheck { name: string; ok: boolean; action: string }
export function iosReleaseChecks(env: Record<string, string | undefined>, config: {
  bundleId?: string; easProjectId?: string; ascAppId?: string;
}): ReleaseCheck[] {
  const checks: ReleaseCheck[] = [];
  const add = (name: string, ok: boolean, action: string) => checks.push({ name, ok, action });
  const https = (value?: string) => { try { const url = new URL(value!); return url.protocol === "https:" && !["localhost", "example.com", "example.org"].includes(url.hostname); } catch { return false; } };
  const adApp = (value?: string) => /^ca-app-pub-\d{16}~\d{10}$/.test(value || "") && !value?.includes("3940256099942544");
  const adUnit = (value?: string) => /^ca-app-pub-\d{16}\/\d{10}$/.test(value || "") && !value?.includes("3940256099942544");
  add("US iOS bundle ID", !!config.bundleId && config.bundleId === env.US_IOS_BUNDLE_ID, "Set US_IOS_BUNDLE_ID to the reserved US app identifier.");
  add("US EAS project", !!config.easProjectId && config.easProjectId === env.US_EAS_PROJECT_ID, "Set US_EAS_PROJECT_ID to the verified US EAS project UUID.");
  add("App Store Connect app", !!config.ascAppId && config.ascAppId === env.US_ASC_APP_ID, "Verify the US App Store Connect app ID, then match US_ASC_APP_ID and eas.json submit.production.ios.ascAppId.");
  add("US backend", https(env.EXPO_PUBLIC_US_SUPABASE_URL) && !!env.EXPO_PUBLIC_US_SUPABASE_PUBLISHABLE_KEY, "Configure the US Supabase URL and publishable key.");
  for (const provider of ["GOOGLE", "APPLE", "EMAIL"])
    add(`${provider} sign-in enabled`, env[`EXPO_PUBLIC_US_${provider}_AUTH_ENABLED`] === "true", `Configure and test ${provider} in Supabase before enabling its US auth flag.`);
  add("Account sync", env.EXPO_PUBLIC_US_ACCOUNT_SYNC_ENABLED === "true", "Apply US migrations and enable account sync.");
  add("Account deletion", env.EXPO_PUBLIC_US_DELETE_ACCOUNT_ENABLED === "true", "Deploy/test US account deletion, including Apple token revocation, before enabling it.");
  for (const kind of ["SUPPORT", "PRIVACY", "TERMS"])
    add(`${kind} URL`, https(env[`EXPO_PUBLIC_US_${kind}_URL`]), `Provide a working public HTTPS ${kind.toLowerCase()} URL.`);
  add("Support email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.EXPO_PUBLIC_US_SUPPORT_EMAIL || ""), "Provide the US support email.");
  add("RevenueCat enabled", env.EXPO_PUBLIC_US_BILLING_ENABLED === "true", "Configure and test US RevenueCat before enabling billing.");
  add("RevenueCat iOS production key", /^appl_[A-Za-z0-9]+$/.test(env.EXPO_PUBLIC_US_REVENUECAT_IOS_KEY || ""), "Set the US RevenueCat public Apple SDK key (not a secret or test-store key).");
  add("Premium entitlement", !!env.EXPO_PUBLIC_US_PREMIUM_ENTITLEMENT, "Set the same entitlement ID on both App Store products in RevenueCat.");
  const monthly = env.EXPO_PUBLIC_US_MONTHLY_PRODUCT_ID, lifetime = env.EXPO_PUBLIC_US_LIFETIME_PRODUCT_ID;
  add("Monthly + lifetime products", !!monthly && !!lifetime && monthly !== lifetime, "Configure a monthly auto-renewing product and a distinct lifetime non-consumable.");
  add("AdMob enabled", env.EXPO_PUBLIC_US_ADS_ENABLED === "true", "Configure US AdMob and privacy messaging before enabling ads.");
  add("AdMob production mode", env.EXPO_PUBLIC_US_ADS_TEST_MODE === "false", "Use test ads during development; explicitly set ADS_TEST_MODE=false for production.");
  add("AdMob iOS app", adApp(env.EXPO_PUBLIC_US_ADMOB_IOS_APP_ID), "Set the US AdMob iOS app ID.");
  add("AdMob rewarded unit", adUnit(env.EXPO_PUBLIC_US_ADMOB_IOS_REWARDED_ID), "Set the US rewarded ad unit, with its reward amount configured in AdMob.");
  add("AdMob interstitial unit", adUnit(env.EXPO_PUBLIC_US_ADMOB_IOS_INTERSTITIAL_ID), "Set the US interstitial unit for natural breaks outside exams.");
  return checks;
}
