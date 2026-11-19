import mobileAds, {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  MaxAdContentRating,
  AdEventType,
  RewardedAdEventType,
  RewardedAd,
  InterstitialAd,
  RewardedInterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";
import { Platform } from "react-native";
import { integrations } from "./integrations";
import { useMonetization } from "./monetization";
import { usePrep } from "./store";
import { createAdFrequency, showFullscreen } from "./adPolicy";

export function installAdMob() {
  const testAds = __DEV__ || process.env.EXPO_PUBLIC_US_ADS_TEST_MODE === "true";

  const rewardId = testAds
    ? TestIds.REWARDED
    : Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_US_ADMOB_IOS_REWARDED_ID || process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID
      : process.env.EXPO_PUBLIC_US_ADMOB_ANDROID_REWARDED_ID || process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID;

  const interstitialId = testAds
    ? TestIds.INTERSTITIAL
    : Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_US_ADMOB_IOS_INTERSTITIAL_ID || process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID
      : process.env.EXPO_PUBLIC_US_ADMOB_ANDROID_INTERSTITIAL_ID || process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID;

  const rewardedInterstitialId = testAds
    ? TestIds.REWARDED_INTERSTITIAL
    : Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_US_ADMOB_IOS_REWARDED_INTERSTITIAL_ID || process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED_INTERSTITIAL_ID
      : process.env.EXPO_PUBLIC_US_ADMOB_ANDROID_REWARDED_INTERSTITIAL_ID || process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_INTERSTITIAL_ID;

  if (!rewardId || !interstitialId) throw new Error("ads_not_configured");

  let initializing: Promise<void> | null = null;
  let busy = false;
  const frequency = createAdFrequency();

  const allowed = () => {
    const status = useMonetization.getState();
    const billingKnown =
      process.env.EXPO_PUBLIC_US_BILLING_ENABLED !== "true" ||
      (status.billingAvailable && !status.checking && !status.error);
    return status.ready && billingKnown && !status.active && !usePrep.getState().active;
  };

  const initialize = async () => {
    if (!initializing)
      initializing = (async () => {
        // UMP handles regional consent; no ad requests or SDK measurement before it.
        const info = await AdsConsent.gatherConsent();
        if (!info.canRequestAds) throw new Error("consent_required");
        await mobileAds().setRequestConfiguration({
          maxAdContentRating: MaxAdContentRating.G,
          publisherPrivacyPersonalizationState: "disabled",
        });
        await mobileAds().initialize();
      })().catch((error) => {
        initializing = null;
        throw error;
      });
    await initializing;
    if (!(await AdsConsent.getConsentInfo()).canRequestAds)
      throw new Error("consent_required");
  };

  integrations.setAds({
    // 1. iOS Kredi Videoları (Ödüllü Video - Rewarded)
    reward: async () => {
      if (busy || !allowed()) return { earned: false, credits: 0 };
      busy = true;
      try {
        await initialize();
        if (!allowed()) return { earned: false, credits: 0 };
        const ad = RewardedAd.createForAdRequest(rewardId, {
          requestNonPersonalizedAdsOnly: true,
        });
        const credits = await showFullscreen(
          ad,
          {
            loaded: RewardedAdEventType.LOADED,
            earned: RewardedAdEventType.EARNED_REWARD,
            closed: AdEventType.CLOSED,
            error: AdEventType.ERROR,
          },
          allowed,
        );
        return { earned: credits > 0, credits: credits > 0 ? credits : 3 };
      } finally {
        busy = false;
      }
    },

    // 2. Sınav/Test Bitişi (Öncelik: EhliyetApp_iOS_Odullu_Gecis -> Fallback: EhliyetApp_iOS_Gecis)
    afterStudy: async (id, mode) => {
      if (busy || !allowed() || !frequency(id, mode)) return;
      busy = true;
      try {
        await initialize();
        if (!allowed()) return;

        // Yüksek eCPM Ödüllü Geçiş (Rewarded Interstitial) Önceliği
        if (rewardedInterstitialId) {
          try {
            const rewardedIntAd = RewardedInterstitialAd.createForAdRequest(
              rewardedInterstitialId,
              { requestNonPersonalizedAdsOnly: true },
            );
            await showFullscreen(
              rewardedIntAd,
              {
                loaded: RewardedAdEventType.LOADED,
                closed: AdEventType.CLOSED,
                error: AdEventType.ERROR,
              },
              allowed,
              3500,
            );
            return;
          } catch {
            // Ödüllü geçiş dolmazsa standart geçiş reklamına (fallback) düşer
          }
        }

        // Standart Geçiş Reklamı (Interstitial)
        const ad = InterstitialAd.createForAdRequest(interstitialId, {
          requestNonPersonalizedAdsOnly: true,
        });
        await showFullscreen(
          ad,
          {
            loaded: AdEventType.LOADED,
            closed: AdEventType.CLOSED,
            error: AdEventType.ERROR,
          },
          allowed,
          3000,
        );
      } catch {
        // Reklam yoksa veya hata verirse kullanıcının akışı asla kesilmez
      } finally {
        busy = false;
      }
    },

    privacyOptions: async () => {
      if (busy || usePrep.getState().active) return;
      busy = true;
      try {
        const info = await AdsConsent.requestInfoUpdate();
        if (
          info.privacyOptionsRequirementStatus ===
          AdsConsentPrivacyOptionsRequirementStatus.REQUIRED
        )
          await AdsConsent.showPrivacyOptionsForm();
      } finally {
        busy = false;
      }
    },
  });
}
