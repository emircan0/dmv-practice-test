import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Check, ShieldCheck, X } from "lucide-react-native";
import { Busy, usePalette } from "../src/us/ui";
import { useT } from "../src/us/i18n";
import { integrations, type Offering } from "../src/us/integrations";
import { useMonetization } from "../src/us/monetization";
import { FALLBACK_OFFERINGS } from "../src/us/premiumPolicy";

const FEATURES = [
  {
    title: "All 10 State Handbook Topics",
    detail: "Complete coverage of all knowledge topics tested on the official exam.",
  },
  {
    title: "Unlimited Exam Simulators",
    detail: "Take full-length, timed mock tests with no credit or attempt limits.",
  },
  {
    title: "Targeted Mistakes Review",
    detail: "Automatically revisit and practice questions you missed.",
  },
  {
    title: "100% Ad-Free Experience",
    detail: "Study with zero banner, interstitial, or video ad interruptions.",
  },
];

export default function Premium() {
  const t = useT();
  const p = usePalette();
  const premium = useMonetization();
  // Never show invented prices in production: only live App Store prices.
  const previewOffers = __DEV__ ? FALLBACK_OFFERINGS : [];
  const [offers, setOffers] = useState<Offering[]>(previewOffers);
  const [selected, setSelected] = useState<string>(
    previewOffers[0]?.id ?? "dmv_us_lifetime"
  );
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    const adapter = integrations.commerce();
    if (!premium.ready || !adapter) return;
    setLoading(true);
    adapter
      .offerings()
      .then((items) => {
        if (!alive) return;
        const resolved = items.length > 0 ? items : previewOffers;
        setOffers(resolved);
        const defaultOffer =
          resolved.find((item) => item.kind === "lifetime") ?? resolved[0];
        if (defaultOffer) setSelected(defaultOffer.id);
      })
      .catch(() => {
        if (alive) setOffers(previewOffers);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [premium.ready, premium.billingAvailable, reloadKey]);

  const lifetimeId =
    process.env.EXPO_PUBLIC_US_LIFETIME_PRODUCT_ID || "dmv_us_lifetime";
  const hasLifetime =
    premium.active &&
    (premium.productId === lifetimeId ||
      premium.productId === "$rc_lifetime" ||
      !premium.expiresAt);
  const activeMonthly = premium.active && !hasLifetime;

  const visibleOffers = hasLifetime
    ? []
    : offers.filter((offer) => !activeMonthly || offer.kind === "lifetime");
  const chosen =
    visibleOffers.find((offer) => offer.id === selected) ?? visibleOffers[0];

  const handlePurchase = async (id?: string) => {
    const adapter = integrations.commerce();
    if (!adapter) {
      Alert.alert("Store Unavailable", "In-app purchases are currently unavailable. Please check your internet connection.");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const success = id ? await adapter.purchase(id) : await adapter.restore();
      if (success) {
        Alert.alert(
          "Full Access Enabled",
          "All topics, exam simulators, and study tools are now unlocked.",
          [{ text: "Done", onPress: () => router.back() }]
        );
      } else {
        Alert.alert("Purchase Status", "No active subscription was found or the transaction was cancelled.");
      }
    } catch (error) {
      if (
        !(
          error &&
          typeof error === "object" &&
          "userCancelled" in error &&
          error.userCancelled
        )
      ) {
        Alert.alert("Store Notice", "The purchase could not be completed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={[st.container, { backgroundColor: p.bg }]}
    >
      {/* Top Bar with Clear Dismiss Action */}
      <View style={st.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("back")}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/(tabs)")
          }
          style={[st.closeBtn, { backgroundColor: p.card, borderColor: p.line }]}
        >
          <X size={18} color={p.ink} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={st.scrollContent}
      >
        {/* Header Hero */}
        <View style={st.headerSection}>
          <Text style={[st.eyebrow, { color: "#2563EB" }]}>DMV PRACTICE TEST</Text>
          <Text style={[st.title, { color: p.ink }]}>
            {premium.active ? "Full Access is Active" : "Pass on Your First Try"}
          </Text>
          <Text style={[st.subtitle, { color: p.muted }]}>
            {premium.active
              ? "You have full access to all state topics, exam simulators, and ad-free studying."
              : "Unlock every handbook question, unlimited timed mock exams, and remove all ads."}
          </Text>
        </View>

        {/* Feature Highlights Card (Clean, Professional, No AI Buzzwords) */}
        <View
          style={[
            st.featuresCard,
            { backgroundColor: p.card, borderColor: p.line },
          ]}
        >
          {FEATURES.map((item, idx) => (
            <View
              key={item.title}
              style={[
                st.featureRow,
                idx < FEATURES.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: p.line,
                },
              ]}
            >
              <View style={st.checkIconBox}>
                <Check size={14} color="#2563EB" strokeWidth={3} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[st.featureTitle, { color: p.ink }]}>
                  {item.title}
                </Text>
                <Text style={[st.featureDetail, { color: p.muted }]}>
                  {item.detail}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Plan Selection Cards */}
        {!hasLifetime && (
          <View style={{ gap: 12 }}>
            <Text style={[st.sectionLabel, { color: p.muted }]}>
              CHOOSE YOUR ACCESS
            </Text>

            {loading ? (
              <Busy />
            ) : visibleOffers.length === 0 ? (
              <View
                style={[
                  st.unavailableCard,
                  { backgroundColor: p.card, borderColor: p.line },
                ]}
              >
                <Text style={[st.planTitle, { color: p.ink }]}>
                  Prices unavailable
                </Text>
                <Text style={[st.planSub, { color: p.muted }]}>
                  We couldn't reach the App Store. Check your connection and try
                  again.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setReloadKey((k) => k + 1)}
                  style={[st.retryBtn, { borderColor: p.line }]}
                >
                  <Text style={[st.footerLink, { color: p.ink }]}>Try again</Text>
                </Pressable>
              </View>
            ) : (
              visibleOffers.map((offer) => {
                const isLifetime = offer.kind === "lifetime";
                const isSelected = chosen?.id === offer.id;

                return (
                  <Pressable
                    key={offer.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected, disabled: busy }}
                    disabled={busy}
                    onPress={() => setSelected(offer.id)}
                    style={({ pressed }) => [
                      st.planCard,
                      {
                        backgroundColor: p.card,
                        borderColor: isSelected ? "#2563EB" : p.line,
                        borderWidth: isSelected ? 2 : 1,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    {/* Radio Indicator */}
                    <View
                      style={[
                        st.radio,
                        {
                          borderColor: isSelected ? "#2563EB" : p.muted,
                          backgroundColor: isSelected ? "#2563EB" : "transparent",
                        },
                      ]}
                    >
                      {isSelected && (
                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                      )}
                    </View>

                    {/* Plan Info */}
                    <View style={{ flex: 1, gap: 3 }}>
                      <View style={st.planTitleRow}>
                        <Text style={[st.planTitle, { color: p.ink }]}>
                          {isLifetime ? "Unlimited Access" : "Monthly Pass"}
                        </Text>
                        {isLifetime && (
                          <View style={st.badgePopular}>
                            <Text style={st.badgePopularText}>
                              BEST VALUE · PAY ONCE
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[st.planSub, { color: p.muted }]}>
                        {isLifetime
                          ? "One-time purchase · Lifetime access · No recurring fees"
                          : "Auto-renews monthly · Cancel anytime"}
                      </Text>
                    </View>

                    {/* Price Display */}
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[st.price, { color: p.ink }]}>
                        {offer.price}
                      </Text>
                      <Text style={[st.priceSub, { color: p.muted }]}>
                        {isLifetime ? "once" : "/ mo"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}

            {/* Primary Action Button */}
            {chosen && (
              <View style={{ gap: 8, marginTop: 4 }}>
                <Pressable
                  accessibilityRole="button"
                  disabled={busy || loading || premium.checking}
                  onPress={() => handlePurchase(chosen.id)}
                  style={({ pressed }) => [
                    st.ctaBtn,
                    {
                      backgroundColor: "#2563EB",
                      opacity:
                        busy || loading || premium.checking
                          ? 0.5
                          : pressed
                            ? 0.88
                            : 1,
                    },
                  ]}
                >
                  <Text style={st.ctaBtnText}>
                    {chosen.kind === "lifetime"
                      ? `Continue with Unlimited · ${chosen.price}`
                      : `Continue with Monthly · ${chosen.price}/mo`}
                  </Text>
                </Pressable>

                <View style={st.securityNoteRow}>
                  <ShieldCheck size={14} color={p.muted} />
                  <Text style={[st.ctaNote, { color: p.muted }]}>
                    {chosen.kind === "lifetime"
                      ? "Pay once. Never charged again."
                      : "Billed through Apple App Store. Cancel anytime."}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Legal & Compliance Footer */}
        <View style={st.footer}>
          <View style={st.footerLinks}>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => handlePurchase()}
            >
              <Text style={[st.footerLink, { color: p.muted }]}>
                {t("restore")}
              </Text>
            </Pressable>
            <Text style={{ color: p.line }}>·</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/privacy")}
            >
              <Text style={[st.footerLink, { color: p.muted }]}>
                {t("privacyPolicy")}
              </Text>
            </Pressable>
            <Text style={{ color: p.line }}>·</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/terms")}
            >
              <Text style={[st.footerLink, { color: p.muted }]}>
                {t("terms")}
              </Text>
            </Pressable>
          </View>

          <Text style={[st.legal, { color: p.muted }]}>
            {t("premiumStoreBilling")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  unavailableCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  retryBtn: {
    alignSelf: "flex-start",
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
    gap: 20,
  },
  headerSection: {
    gap: 4,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  featuresCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 13,
  },
  checkIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2563EB15",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  featureDetail: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  planTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  badgePopular: {
    backgroundColor: "#2563EB15",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePopularText: {
    color: "#2563EB",
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  planSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  price: {
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  priceSub: {
    fontSize: 11,
    fontWeight: "500",
  },
  ctaBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaBtnText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "800",
  },
  securityNoteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 2,
  },
  ctaNote: {
    fontSize: 12,
  },
  footer: {
    gap: 10,
    marginTop: 4,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  footerLink: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  legal: {
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: "center",
  },
});
