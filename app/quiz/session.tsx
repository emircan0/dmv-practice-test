import React, { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Redirect } from "expo-router";
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  X,
  XCircle,
} from "lucide-react-native";
import { usePrep, favoriteKey } from "../../src/us/store";
import { useT } from "../../src/us/i18n";
import { topicInfo } from "../../src/us/topics";
import { usePalette } from "../../src/us/ui";

export default function Session() {
  const t = useT();
  const p = usePalette();
  const s = usePrep();
  const a = s.active;
  const [now, setNow] = useState(Date.now());

  const finish = () => {
    const id = usePrep.getState().finish();
    if (id) router.replace({ pathname: "/quiz/result", params: { id } });
  };

  const deadline = a?.rule?.durationSeconds
    ? a.startedAt + a.rule.durationSeconds * 1000
    : null;

  useEffect(() => {
    if (!deadline) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  useEffect(() => {
    if (deadline && now >= deadline) finish();
  }, [deadline, now]);

  if (!a) return <Redirect href="/(tabs)/practice" />;

  const q = a.questions[a.index];
  const selected = a.answers[q.id];
  const isExam = a.mode === "exam";
  const showExplanation = !isExam && selected !== undefined;
  const isFav = s.favorites.includes(favoriteKey(a.state, a.profile, q.id));

  const remaining = deadline
    ? Math.max(0, Math.ceil((deadline - now) / 1000))
    : null;

  const progressPct = Math.round(((a.index + 1) / a.questions.length) * 100);
  const tMeta = topicInfo(q.topic);
  const topicColor = tMeta?.color || "#0066FF";
  const topicLabel = tMeta
    ? t(tMeta.label)
    : q.topic
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

  const answeredCount = Object.keys(a.answers).length;
  const canGoNext = isExam || selected !== undefined;
  const isLast = a.index >= a.questions.length - 1;

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={[st.safe, { backgroundColor: p.bg }]}
    >
      {/* Top Bar */}
      <View style={[st.topBar, { borderBottomColor: p.line }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("close")}
          onPress={() => router.back()}
          style={({ pressed }) => [
            st.iconBtn,
            {
              backgroundColor: p.card,
              borderColor: p.line,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <X size={20} color={p.ink} />
        </Pressable>

        <View style={st.topCenter}>
          <View style={st.modeRow}>
            <View
              style={[
                st.stateBadge,
                { backgroundColor: isExam ? "#4F46E518" : "#0066FF18" },
              ]}
            >
              <Text
                style={[
                  st.stateBadgeText,
                  { color: isExam ? "#4F46E5" : "#0066FF" },
                ]}
              >
                {a.state} · {isExam ? t("exam").toUpperCase() : t("practice").toUpperCase()}
              </Text>
            </View>

            <View
              style={[
                st.timerPill,
                {
                  backgroundColor:
                    remaining !== null && remaining < 300
                      ? "#FFF1F2"
                      : p.soft,
                },
              ]}
            >
              <Clock
                size={13}
                color={
                  remaining !== null && remaining < 300 ? "#E11D48" : p.muted
                }
              />
              <Text
                style={[
                  st.timerText,
                  {
                    color:
                      remaining !== null && remaining < 300
                        ? "#E11D48"
                        : p.muted,
                  },
                ]}
              >
                {remaining !== null
                  ? `${Math.floor(remaining / 60)}:${String(
                      remaining % 60
                    ).padStart(2, "0")}`
                  : t("untimed")}
              </Text>
            </View>
          </View>

          <Text style={[st.counterText, { color: p.ink }]}>
            Question {a.index + 1}{" "}
            <Text style={{ color: p.muted, fontWeight: "600" }}>
              of {a.questions.length}
            </Text>
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(isFav ? "unfavorite" : "favorite")}
          onPress={() => s.toggleFavorite(q.id, a.state, a.profile)}
          style={({ pressed }) => [
            st.iconBtn,
            {
              backgroundColor: isFav
                ? "#FEF3C7"
                : p.card,
              borderColor: isFav ? "#F59E0B" : p.line,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Bookmark
            size={19}
            color={isFav ? "#D97706" : p.muted}
            fill={isFav ? "#F59E0B" : "transparent"}
          />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={st.progressWrap}>
        <View style={[st.progressTrack, { backgroundColor: p.soft }]}>
          <View
            style={[
              st.progressFill,
              {
                width: `${progressPct}%`,
                backgroundColor: isExam ? "#4F46E5" : "#0066FF",
              },
            ]}
          />
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        key={q.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={st.scrollContent}
      >
        {/* Question Card */}
        <View
          style={[
            st.questionCard,
            {
              backgroundColor: p.card,
              borderColor: p.line,
              shadowColor: p.dark ? "#000" : "#0F172A",
            },
          ]}
        >
          <View style={st.cardHeaderRow}>
            <View
              style={[
                st.topicChip,
                {
                  backgroundColor: `${topicColor}16`,
                  borderColor: `${topicColor}35`,
                },
              ]}
            >
              <View
                style={[st.topicDot, { backgroundColor: topicColor }]}
              />
              <Text style={[st.topicChipText, { color: topicColor }]}>
                {topicLabel}
              </Text>
            </View>

            {isFav && (
              <Text style={st.savedTag}>★ Saved</Text>
            )}
          </View>

          <Text style={[st.promptText, { color: p.ink }]}>{q.prompt}</Text>

          {q.imageUrl && (
            <View
              style={[
                st.imageContainer,
                {
                  backgroundColor: p.dark ? "#1E293B" : "#F8FAFC",
                  borderColor: p.line,
                },
              ]}
            >
              <Image
                source={{ uri: q.imageUrl }}
                accessibilityLabel={q.prompt}
                resizeMode="contain"
                style={st.signImage}
              />
            </View>
          )}
        </View>

        {/* Options List */}
        <View style={st.optionsList}>
          {q.options.map((option, index) => {
            const letter = String.fromCharCode(65 + index);
            const isSelected = selected === index;
            const isCorrectOption = index === q.correctIndex;

            let borderColor = p.line;
            let bgColor = p.card;
            let badgeBg = p.soft;
            let badgeText = p.ink;
            let optionTextColor = p.ink;
            let rightIcon: React.ReactNode = null;

            if (showExplanation) {
              if (isCorrectOption) {
                borderColor = "#10B981";
                bgColor = p.dark ? "#064E3B40" : "#ECFDF5";
                badgeBg = "#10B981";
                badgeText = "#FFFFFF";
                optionTextColor = p.dark ? "#A7F3D0" : "#065F46";
                rightIcon = <CheckCircle2 size={22} color="#10B981" />;
              } else if (isSelected && !isCorrectOption) {
                borderColor = "#F43F5E";
                bgColor = p.dark ? "#88133740" : "#FFF1F2";
                badgeBg = "#F43F5E";
                badgeText = "#FFFFFF";
                optionTextColor = p.dark ? "#FECDD3" : "#9F1239";
                rightIcon = <XCircle size={22} color="#F43F5E" />;
              }
            } else if (isSelected) {
              borderColor = "#0066FF";
              bgColor = p.dark ? "#1E3A8A45" : "#EFF6FF";
              badgeBg = "#0066FF";
              badgeText = "#FFFFFF";
              optionTextColor = p.dark ? "#BFDBFE" : "#1E3A8A";
            }

            const disabledOption = !isExam && selected !== undefined;

            return (
              <Pressable
                key={index}
                accessibilityRole="button"
                accessibilityState={{
                  selected: isSelected,
                  disabled: disabledOption,
                }}
                disabled={disabledOption}
                onPress={() => s.answer(index)}
                style={({ pressed }) => [
                  st.optionCard,
                  {
                    backgroundColor: bgColor,
                    borderColor,
                    transform: [{ scale: pressed && !disabledOption ? 0.99 : 1 }],
                  },
                ]}
              >
                <View style={[st.letterBadge, { backgroundColor: badgeBg }]}>
                  <Text style={[st.letterText, { color: badgeText }]}>
                    {letter}
                  </Text>
                </View>

                <Text
                  style={[
                    st.optionText,
                    {
                      color: optionTextColor,
                      fontWeight: isSelected || (showExplanation && isCorrectOption) ? "700" : "600",
                    },
                  ]}
                >
                  {option}
                </Text>

                {rightIcon && <View style={st.rightIconWrap}>{rightIcon}</View>}
              </Pressable>
            );
          })}
        </View>

        {/* Instant Explanation Card (Practice Mode) */}
        {showExplanation && (
          <View
            style={[
              st.explanationCard,
              {
                backgroundColor:
                  selected === q.correctIndex
                    ? p.dark
                      ? "#064E3B30"
                      : "#F0FDF4"
                    : p.dark
                      ? "#88133730"
                      : "#FFF1F2",
                borderColor:
                  selected === q.correctIndex ? "#10B98160" : "#F43F5E60",
              },
            ]}
          >
            <View style={st.expHeader}>
              {selected === q.correctIndex ? (
                <CheckCircle2 size={22} color="#10B981" />
              ) : (
                <Sparkles size={22} color="#F43F5E" />
              )}
              <Text
                style={[
                  st.expTitle,
                  {
                    color:
                      selected === q.correctIndex
                        ? p.dark
                          ? "#6EE7B7"
                          : "#047857"
                        : p.dark
                          ? "#FDA4AF"
                          : "#BE123C",
                  },
                ]}
              >
                {t(selected === q.correctIndex ? "correct" : "incorrect")}
              </Text>
            </View>

            <Text style={[st.expBody, { color: p.ink }]}>{q.explanation}</Text>
          </View>
        )}

        <Text style={[st.autosaveHint, { color: p.muted }]}>
          {t("leaveBody")} · {answeredCount}/{a.questions.length} answered
        </Text>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View
        style={[
          st.bottomBar,
          {
            backgroundColor: p.card,
            borderTopColor: p.line,
          },
        ]}
      >
        {a.index > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={s.previous}
            style={({ pressed }) => [
              st.prevBtn,
              {
                backgroundColor: p.soft,
                borderColor: p.line,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <ChevronLeft size={19} color={p.ink} />
            <Text style={[st.prevBtnText, { color: p.ink }]}>
              {t("previous")}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [
              st.prevBtn,
              {
                backgroundColor: p.soft,
                borderColor: p.line,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Text style={[st.prevBtnText, { color: p.muted }]}>
              {t("close")}
            </Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canGoNext }}
          disabled={!canGoNext}
          onPress={isLast ? finish : s.next}
          style={({ pressed }) => [
            st.nextBtn,
            {
              backgroundColor: isLast
                ? "#059669"
                : isExam
                  ? "#4F46E5"
                  : "#0066FF",
              opacity: !canGoNext ? 0.4 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={st.nextBtnText}>
            {t(isLast ? "finish" : "next")}
          </Text>
          {!isLast && <ChevronRight size={19} color="#FFFFFF" />}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topCenter: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stateBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stateBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 11,
    fontWeight: "700",
  },
  counterText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  progressWrap: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 4,
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 32,
    gap: 16,
  },
  questionCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  topicDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  topicChipText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  savedTag: {
    fontSize: 11,
    fontWeight: "800",
    color: "#D97706",
  },
  promptText: {
    fontSize: 19,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  imageContainer: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  signImage: {
    width: "100%",
    height: 180,
  },
  optionsList: {
    gap: 11,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.8,
    gap: 14,
  },
  letterBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  letterText: {
    fontSize: 15,
    fontWeight: "900",
  },
  optionText: {
    flex: 1,
    fontSize: 15.5,
    lineHeight: 22,
  },
  rightIconWrap: {
    marginLeft: 4,
  },
  explanationCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    gap: 10,
  },
  expHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  expTitle: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  expBody: {
    fontSize: 14.5,
    lineHeight: 22,
    fontWeight: "500",
  },
  autosaveHint: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  prevBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 18,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
  },
  prevBtnText: {
    fontSize: 14,
    fontWeight: "800",
  },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 52,
    borderRadius: 16,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
});
