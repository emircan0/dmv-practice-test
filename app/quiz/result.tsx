import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router, Redirect } from "expo-router";
import {
  Award,
  Bookmark,
  CheckCircle2,
  Flag,
  Home,
  MinusCircle,
  Sparkles,
  XCircle,
} from "lucide-react-native";
import { integrations } from "../../src/us/integrations";
import { questionReportUrl } from "../../src/us/questionReport";
import { usePrep, favoriteKey } from "../../src/us/store";
import { useT } from "../../src/us/i18n";
import { stateName } from "../../src/us/states";
import { topicInfo } from "../../src/us/topics";
import { usePalette } from "../../src/us/ui";

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = usePrep();
  const t = useT();
  const p = usePalette();
  const a = s.attempts.find((x) => x.id === id);
  const [leaving, setLeaving] = useState(false);

  if (!a) return <Redirect href="/(tabs)/progress" />;

  const isPractice = a.result.passed === null;
  const passed = a.result.passed === true;

  const heroColor = isPractice
    ? "#0066FF"
    : passed
      ? "#059669"
      : "#E11D48";

  const handleBackHome = async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      await integrations.ads()?.afterStudy(a.id, a.mode);
    } finally {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={[st.safe, { backgroundColor: p.bg }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={st.scroll}
      >
        {/* Hero Score Banner */}
        <View style={[st.heroBanner, { backgroundColor: heroColor }]}>
          <View style={st.heroTopRow}>
            <View style={st.heroBadge}>
              <Text style={st.heroBadgeText}>
                {stateName(a.state).toUpperCase()} · {a.mode.toUpperCase()}
              </Text>
            </View>
            <Text style={st.versionTag}>v{a.releaseVersion}</Text>
          </View>

          <View style={st.scoreRow}>
            <View style={st.scoreCircle}>
              <Text style={[st.scorePct, { color: heroColor }]}>
                {a.result.percentage}%
              </Text>
              <Text style={[st.scoreRatio, { color: heroColor }]}>
                {a.result.correct}/{a.result.total}
              </Text>
            </View>

            <View style={{ flex: 1, gap: 6 }}>
              <View style={st.titleWithIcon}>
                {isPractice ? (
                  <Sparkles size={22} color="#FFF" />
                ) : passed ? (
                  <Award size={24} color="#FFF" />
                ) : (
                  <XCircle size={24} color="#FFF" />
                )}
                <Text style={st.heroTitle}>
                  {t(
                    isPractice
                      ? "practiceResult"
                      : passed
                        ? "passed"
                        : "failed"
                  )}
                </Text>
              </View>
              <Text style={st.heroDisclaimer}>{t("disclaimer")}</Text>
            </View>
          </View>

          {/* Breakdown Pills */}
          <View style={st.statsGrid}>
            <View style={st.statBox}>
              <Text style={st.statNum}>{a.result.correct}</Text>
              <Text style={st.statLabel}>{t("correct")}</Text>
            </View>
            <View style={st.statBox}>
              <Text style={st.statNum}>{a.result.wrong}</Text>
              <Text style={st.statLabel}>{t("wrong")}</Text>
            </View>
            <View style={st.statBox}>
              <Text style={st.statNum}>{a.result.unanswered}</Text>
              <Text style={st.statLabel}>{t("unanswered")}</Text>
            </View>
          </View>
        </View>

        {/* Subsection Quota Card (if any) */}
        {a.result.sections.length > 0 && (
          <View
            style={[
              st.sectionCard,
              { backgroundColor: p.card, borderColor: p.line },
            ]}
          >
            <Text style={[st.sectionHeading, { color: p.ink }]}>
              Official Subsection Quotas
            </Text>
            {a.result.sections.map((sec) => {
              const secMeta = topicInfo(sec.topic);
              const secOk = sec.correct >= sec.required;
              return (
                <View
                  key={sec.topic}
                  style={[
                    st.secRow,
                    { backgroundColor: p.soft, borderColor: p.line },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[st.secTitle, { color: p.ink }]}>
                      {secMeta ? t(secMeta.label) : sec.topic}
                    </Text>
                    <Text style={[st.secSub, { color: p.muted }]}>
                      Minimum required: {sec.required} correct
                    </Text>
                  </View>
                  <View
                    style={[
                      st.secPill,
                      {
                        backgroundColor: secOk ? "#10B98120" : "#F43F5E20",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: secOk ? "#059669" : "#E11D48",
                        fontWeight: "900",
                        fontSize: 13,
                      }}
                    >
                      {sec.correct} / {sec.required}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Back to Home Button */}
        <Pressable
          accessibilityRole="button"
          disabled={leaving}
          onPress={handleBackHome}
          style={({ pressed }) => [
            st.homeBtn,
            {
              backgroundColor: "#0066FF",
              opacity: leaving ? 0.5 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Home size={18} color="#FFF" />
          <Text style={st.homeBtnText}>{t("back")}</Text>
        </Pressable>

        {/* Detailed Question Review */}
        <Text style={[st.reviewHeader, { color: p.ink }]}>
          {t("review")} ({a.questions.length})
        </Text>

        {a.questions.map((q, idx) => {
          const userAns = a.answers[q.id];
          const isUnanswered = userAns === undefined;
          const isRight = userAns === q.correctIndex;
          const isFav = s.favorites.includes(
            favoriteKey(a.state, a.profile, q.id)
          );
          const tMeta = topicInfo(q.topic);
          const topicLabel = tMeta ? t(tMeta.label) : q.topic;

          return (
            <View
              key={q.id}
              style={[
                st.qCard,
                { backgroundColor: p.card, borderColor: p.line },
              ]}
            >
              {/* Status & Topic Row */}
              <View style={st.qTopRow}>
                <View style={st.qBadgeGroup}>
                  <View
                    style={[
                      st.statusPill,
                      {
                        backgroundColor: isUnanswered
                          ? p.soft
                          : isRight
                            ? "#10B98118"
                            : "#F43F5E18",
                      },
                    ]}
                  >
                    {isUnanswered ? (
                      <MinusCircle size={14} color={p.muted} />
                    ) : isRight ? (
                      <CheckCircle2 size={14} color="#10B981" />
                    ) : (
                      <XCircle size={14} color="#F43F5E" />
                    )}
                    <Text
                      style={[
                        st.statusPillText,
                        {
                          color: isUnanswered
                            ? p.muted
                            : isRight
                              ? "#059669"
                              : "#E11D48",
                        },
                      ]}
                    >
                      #{idx + 1} ·{" "}
                      {t(
                        isUnanswered
                          ? "unanswered"
                          : isRight
                            ? "correct"
                            : "incorrect"
                      )}
                    </Text>
                  </View>

                  <Text style={[st.qTopicText, { color: p.muted }]}>
                    {topicLabel}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => s.toggleFavorite(q.id, a.state, a.profile)}
                  style={[
                    st.miniIconBtn,
                    {
                      backgroundColor: isFav ? "#FEF3C7" : p.soft,
                      borderColor: isFav ? "#F59E0B" : p.line,
                    },
                  ]}
                >
                  <Bookmark
                    size={16}
                    color={isFav ? "#D97706" : p.muted}
                    fill={isFav ? "#F59E0B" : "transparent"}
                  />
                </Pressable>
              </View>

              <Text style={[st.qPrompt, { color: p.ink }]}>{q.prompt}</Text>

              {q.imageUrl && (
                <View
                  style={[
                    st.qImgWrap,
                    {
                      backgroundColor: p.dark ? "#1E293B" : "#F8FAFC",
                      borderColor: p.line,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: q.imageUrl }}
                    resizeMode="contain"
                    style={{ width: "100%", height: 140 }}
                  />
                </View>
              )}

              {/* User Answer vs Correct Answer */}
              <View style={st.ansComparison}>
                {!isRight && (
                  <View
                    style={[
                      st.ansBox,
                      {
                        backgroundColor: isUnanswered
                          ? p.soft
                          : p.dark
                            ? "#88133730"
                            : "#FFF1F2",
                        borderColor: isUnanswered ? p.line : "#F43F5E50",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        st.ansBoxLabel,
                        { color: isUnanswered ? p.muted : "#E11D48" },
                      ]}
                    >
                      Your Answer:
                    </Text>
                    <Text style={[st.ansBoxVal, { color: p.ink }]}>
                      {isUnanswered
                        ? t("unanswered")
                        : `${String.fromCharCode(65 + userAns)}. ${
                            q.options[userAns]
                          }`}
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    st.ansBox,
                    {
                      backgroundColor: p.dark ? "#064E3B30" : "#ECFDF5",
                      borderColor: "#10B98150",
                    },
                  ]}
                >
                  <Text style={[st.ansBoxLabel, { color: "#059669" }]}>
                    {t("correct")}:
                  </Text>
                  <Text style={[st.ansBoxVal, { color: p.ink }]}>
                    {String.fromCharCode(65 + q.correctIndex)}.{" "}
                    {q.options[q.correctIndex]}
                  </Text>
                </View>
              </View>

              <Text style={[st.qExplanation, { color: p.muted }]}>
                {q.explanation}
              </Text>

              {/* Footer Actions */}
              <View style={[st.qFooter, { borderTopColor: p.line }]}>
                <View style={{ flex: 1 }} />
                <Pressable
                  accessibilityRole="button"
                  onPress={async () => {
                    const email = process.env.EXPO_PUBLIC_US_SUPPORT_EMAIL;
                    if (!email) {
                      Alert.alert(t("report"), t("contactPending"));
                      return;
                    }
                    try {
                      await Linking.openURL(questionReportUrl(email, a, q));
                    } catch {
                      Alert.alert(t("report"), t("unavailable"));
                    }
                  }}
                  style={[
                    st.qMiniBtn,
                    { backgroundColor: p.soft, borderColor: p.line },
                  ]}
                >
                  <Flag size={11} color={p.muted} />
                  <Text style={[st.qMiniBtnText, { color: p.muted }]}>
                    {t("report")}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: 18,
    paddingBottom: 48,
    gap: 16,
  },
  heroBanner: {
    borderRadius: 28,
    padding: 22,
    gap: 18,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroBadge: {
    backgroundColor: "#FFFFFF24",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  versionTag: {
    color: "#FFFFFFB3",
    fontSize: 11,
    fontWeight: "700",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  scoreCircle: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  scorePct: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  scoreRatio: {
    fontSize: 12,
    fontWeight: "800",
    opacity: 0.85,
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  heroDisclaimer: {
    color: "#FFFFFFD9",
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF1F",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  statNum: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: "#FFFFFFCC",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  sectionCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    gap: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
  },
  secRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  secTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  secSub: {
    fontSize: 12,
    marginTop: 2,
  },
  secPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 18,
  },
  homeBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  reviewHeader: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 6,
    letterSpacing: -0.3,
  },
  qCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  qTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  qBadgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 11.5,
    fontWeight: "800",
  },
  qTopicText: {
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
  },
  miniIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  qPrompt: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "800",
  },
  qImgWrap: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  ansComparison: {
    gap: 8,
  },
  ansBox: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderWidth: 1,
    gap: 2,
  },
  ansBoxLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  ansBoxVal: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  qExplanation: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: "500",
  },
  qFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  qMiniBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  qMiniBtnText: {
    fontSize: 11,
    fontWeight: "800",
  },
});
