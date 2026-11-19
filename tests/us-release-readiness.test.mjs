import test from 'node:test';
import assert from 'node:assert/strict';
import { iosReleaseChecks } from '../src/us/releaseReadiness.ts';
const config={bundleId:'com.example.us',easProjectId:'us-project',ascAppId:'1234567890'};
const env={US_IOS_BUNDLE_ID:config.bundleId,US_EAS_PROJECT_ID:config.easProjectId,US_ASC_APP_ID:config.ascAppId,EXPO_PUBLIC_US_SUPABASE_URL:'https://us-fixture.supabase.co',EXPO_PUBLIC_US_SUPABASE_PUBLISHABLE_KEY:'public-fixture',EXPO_PUBLIC_US_GOOGLE_AUTH_ENABLED:'true',EXPO_PUBLIC_US_APPLE_AUTH_ENABLED:'true',EXPO_PUBLIC_US_EMAIL_AUTH_ENABLED:'true',EXPO_PUBLIC_US_ACCOUNT_SYNC_ENABLED:'true',EXPO_PUBLIC_US_DELETE_ACCOUNT_ENABLED:'true',EXPO_PUBLIC_US_SUPPORT_URL:'https://support.test.test/help',EXPO_PUBLIC_US_PRIVACY_URL:'https://support.test.test/privacy',EXPO_PUBLIC_US_TERMS_URL:'https://support.test.test/terms',EXPO_PUBLIC_US_SUPPORT_EMAIL:'support@test.test',EXPO_PUBLIC_US_BILLING_ENABLED:'true',EXPO_PUBLIC_US_REVENUECAT_IOS_KEY:'appl_PUBLICFIXTURE',EXPO_PUBLIC_US_PREMIUM_ENTITLEMENT:'premium',EXPO_PUBLIC_US_MONTHLY_PRODUCT_ID:'us.monthly',EXPO_PUBLIC_US_LIFETIME_PRODUCT_ID:'us.lifetime',EXPO_PUBLIC_US_ADS_ENABLED:'true',EXPO_PUBLIC_US_ADS_TEST_MODE:'false',EXPO_PUBLIC_US_ADMOB_IOS_APP_ID:'ca-app-pub-1111111111111111~2222222222',EXPO_PUBLIC_US_ADMOB_IOS_REWARDED_ID:'ca-app-pub-1111111111111111/3333333333',EXPO_PUBLIC_US_ADMOB_IOS_INTERSTITIAL_ID:'ca-app-pub-1111111111111111/4444444444'};
test('configured US fixture passes local config checks, without claiming native or store verification',()=>{assert.equal(iosReleaseChecks(env,config).every(c=>c.ok),true)});
test('mismatched application targets cannot pass just because legacy values exist',()=>{
 const checks=iosReleaseChecks({...env,US_IOS_BUNDLE_ID:'com.old.tr',US_EAS_PROJECT_ID:'old-project',US_ASC_APP_ID:'9876543210'},config);
 assert.equal(checks.slice(0,3).every(c=>!c.ok),true);
});
test('Google sample ads and RevenueCat test/server keys are not production settings',()=>{
 const checks=iosReleaseChecks({...env,EXPO_PUBLIC_US_ADMOB_IOS_APP_ID:'ca-app-pub-3940256099942544~1458002511',EXPO_PUBLIC_US_ADMOB_IOS_REWARDED_ID:'ca-app-pub-3940256099942544/1712485313',EXPO_PUBLIC_US_ADS_TEST_MODE:'true',EXPO_PUBLIC_US_REVENUECAT_IOS_KEY:'test_ONLY'},config);
 for(const label of ['AdMob iOS app','AdMob rewarded unit','AdMob production mode','RevenueCat iOS production key'])assert.equal(checks.find(c=>c.name===label).ok,false);
});
