import React, { useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  Check,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from "lucide-react-native";
import { useMonetization } from "../src/us/monetization";
import { Busy, usePalette } from "../src/us/ui";
import { useT } from "../src/us/i18n";
import { integrations } from "../src/us/integrations";

export default function Subscriptions() {
  const premium = useMonetization();
  const t = useT();
  const p = usePalette();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    let alive = true;
    const adapter = integrations.commerce();
    if (adapter) {
      setLoading(true);
      adapter
        .status()
        .catch(() => {})
        .finally(() => {
          if (alive) setLoading(false);
        });
    }
    return () => {
      alive = false;
    };
  }, [premium.ready, premium.billingAvailable, premium.active]);

  const lifetimeId =
    process.env.EXPO_PUBLIC_US_LIFETIME_PRODUCT_ID || "dmv_us_lifetime";
  const isLifetime =
    premium.active &&
    (premium.productId === lifetimeId ||
      premium.productId === "$rc_lifetime" ||
      !premium.expiresAt);

  const handleRestore = async () => {
    const adapter = integrations.commerce();
    if (!adapter) return;
    setRestoring(true);
    try {
      const ok = await adapter.restore();
      if (ok) {
        Alert.alert("Purchases Restored", "Your previous purchases have been restored.");
      } else {
        Alert.alert("No Purchases Found", "No active subscriptions or purchases were found for this Apple ID.");
      }
    } catch {
      Alert.alert("Restore Failed", "Could not restore purchases. Please try again.");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={[st.container, { backgroundColor: p.bg }]}>
      {/* Clean Top Bar with generous padding */}
      <View style={[st.topBar, { borderBottomColor: p.line }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/settings"))}
          style={[st.backBtn, { backgroundColor: p.card, borderColor: p.line }]}
        >
          <ChevronLeft size={22} color={p.ink} />
        </Pressable>
        <Text style={[st.headerTitle, { color: p.ink }]}>
          {t("subscriptions")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading || premium.checking ? (
        <Busy />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.content}>
          {/* Current Plan Card */}
          <View
            style={[
              st.planCard,
              {
                backgroundColor: p.card,
                borderColor: premium.active ? "#10B981" : p.line,
              },
            ]}
          >
            <View style={st.planHeader}>
              <View>
                <Text style={[st.planEyebrow, { color: p.muted }]}>
                  CURRENT STATUS
                </Text>
                <Text style={[st.planTitle, { color: p.ink }]}>
                  {premium.active
                    ? isLifetime
                      ? "Full Access · Lifetime"
                      : "Full Access · Monthly"
                    : "Standard Access"}
                </Text>
              </View>
              <View
                style={[
                  st.badge,
                  {
                    backgroundColor: premium.active
                      ? "#10B98118"
                      : p.soft,
                  },
                ]}
              >
                <Text
                  style={[
                    st.badgeText,
                    { color: premium.active ? "#10B981" : p.muted },
                  ]}
                >
                  {premium.active ? "ACTIVE" : "FREE"}
                </Text>
              </View>
            </View>

            <Text style={[st.planDesc, { color: p.muted }]}>
              {premium.active
                ? isLifetime
                  ? "You have permanent, unrestricted access to all handbook topics, exam simulators, and ad-free studying."
                  : `Your monthly subscription is active${
                      premium.expiresAt
                        ? ` (renews on ${new Date(premium.expiresAt).toLocaleDateString("en-US")})`
                        : ""
                    }.`
                : "You are currently on the Free plan. Upgrade to Full Access to study all state handbook topics, take unlimited timed mock exams, and remove all ads."}
            </Text>

            {/* Action Button - NO PRICES on the button, opens full plans on tap */}
            {!isLifetime && (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/premium")}
                style={({ pressed }) => [
                  st.upgradeBtn,
                  {
                    backgroundColor: "#2563EB",
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
              >
                <Text style={st.upgradeBtnText}>
                  {premium.active ? "Switch to Lifetime Access" : "Upgrade to Full Access"}
                </Text>
                <ChevronRight size={18} color="#FFF" />
              </Pressable>
            )}

            {premium.active && premium.expiresAt && (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  Linking.openURL(
                    premium.managementUrl || "https://apps.apple.com/account/subscriptions"
                  )
                }
                style={[st.manageBtn, { borderColor: p.line }]}
              >
                <Text style={[st.manageBtnText, { color: p.ink }]}>
                  {t("manageSubscription")}
                </Text>
                <ExternalLink size={15} color={p.muted} />
              </Pressable>
            )}
          </View>

          {/* Included Features Section */}
          <View style={[st.featuresCard, { backgroundColor: p.card, borderColor: p.line }]}>
            <Text style={[st.featuresTitle, { color: p.ink }]}>
              {premium.active ? "Your Included Benefits" : "Full Access Includes"}
            </Text>

            {[
              "All 10 Official State Handbook Topics",
              "Unlimited Full-Length DMV Exam Simulators",
              "Targeted Missed Questions & Review",
              "100% Ad-Free Study Experience",
            ].map((feature, i) => (
              <View key={i} style={st.featureItem}>
                <View style={st.checkCircle}>
                  <Check size={14} color="#2563EB" strokeWidth={2.8} />
                </View>
                <Text style={[st.featureText, { color: p.ink }]}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Security & Restore */}
          <View style={st.footerSection}>
            <View style={st.securityNote}>
              <ShieldCheck size={16} color={p.muted} />
              <Text style={[st.securityText, { color: p.muted }]}>
                Secured by Apple App Store billing. Cancel anytime in iOS Settings.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={restoring}
              onPress={handleRestore}
              style={{ padding: 8 }}
            >
              <Text style={[st.restoreText, { color: p.muted }]}>
                {restoring ? "Restoring..." : t("restore")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  content: {
    padding: 20,
    gap: 18,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },
  planCard: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1.5,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  planEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  planDesc: {
    fontSize: 14,
    lineHeight: 21,
  },
  upgradeBtn: {
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  manageBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  manageBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  featuresCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2563EB15",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footerSection: {
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  securityText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  restoreText: {
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
