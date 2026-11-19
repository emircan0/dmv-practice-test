import type { ConfigContext, ExpoConfig } from "expo/config";
export default ({ config }: ConfigContext): ExpoConfig => {
  const iosAdApp = process.env.EXPO_PUBLIC_US_ADMOB_IOS_APP_ID;
  const androidAdApp = process.env.EXPO_PUBLIC_US_ADMOB_ANDROID_APP_ID;
  if (process.env.EAS_BUILD_PROFILE === "production" && process.env.EXPO_PUBLIC_US_ADS_ENABLED === "true" && !iosAdApp)
    throw new Error("Configure the US AdMob iOS app ID before a production build.");
  return ({
  ...config,
  name: "DMV Practice Test: Smart Prep",
  slug: "dmv-smart-prep",
  scheme: "dmvsmartprep",
  plugins: [
    ...(config.plugins || []),
    ["react-native-google-mobile-ads", {
      iosAppId: iosAdApp || "ca-app-pub-3940256099942544~1458002511",
      androidAppId: androidAdApp || "ca-app-pub-3940256099942544~3347511713",
      delayAppMeasurementInit: true,
      userTrackingUsageDescription: "Your permission helps support practice with relevant advertising.",
    }],
  ],
  ios: {
    ...config.ios,
    bundleIdentifier: process.env.US_IOS_BUNDLE_ID || "com.dmvsmartprep.app",
  },
  android: {
    ...config.android,
    package: process.env.US_ANDROID_PACKAGE || "com.dmvsmartprep.app",
  },
  extra: {
    ...config.extra,
    ...(process.env.US_EAS_PROJECT_ID
      ? { eas: { projectId: process.env.US_EAS_PROJECT_ID } }
      : {}),
  },
  });
};
