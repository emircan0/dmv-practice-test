import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileQuestion,
  Play,
  RefreshCw,
  ShieldCheck,
  Signpost,
  Trophy,
} from "lucide-react-native";
import { loadRelease } from "../src/us/backend";
import { assembleExam } from "../src/us/engine";
import { usePrep } from "../src/us/store";
import { useT } from "../src/us/i18n";
import { stateName } from "../src/us/states";
import { useMonetization } from "../src/us/monetization";
import { usePreferences } from "../src/us/preferences";
import { EXAM_CREDIT_COST, FREE_EXAM_LIMIT } from "../src/us/premiumPolicy";
import {
  Page,
  Card,
  Body,
  Button,
  Heading,
  Busy,
  usePalette,
} from "../src/us/ui";
import type { ContentRelease } from "../src/us/model";

export default function ExamSetup() {
  const t = useT();
  const p = usePalette();
  const state = usePrep((s) => s.state);
  const [revision, setRevision] = useState(0);
  const key = `${state}:${revision}`;
  const [data, setData] = useState<{
    key: string;
    releases: (ContentRelease | null)[];
    error: boolean;
  }>({ key: "", releases: [], error: false });

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled(
      (["general-first", "adult-first", "teen-first"] as const).map(
        async (profile) => {
          const release = await loadRelease(state, profile);
          if (!release?.rule) return null;
          assembleExam(release.questions, release.rule);
          return release;
        }
      )
    ).then((results) => {
      if (!cancelled)
        setData({
          key,
          releases: results.map((result) =>
            result.status === "fulfilled" ? result.value : null
          ),
          error: results.some((result) => result.status === "rejected"),
        });
    });
    return () => {
      cancelled = true;
    };
  }, [state, key]);

  const loading = data.key !== key;
  const general = !loading ? data.releases[0] : null;
  const specific = !loading ? data.releases.slice(1) : [];

  const start = (release: ContentRelease) => {
    const store = usePrep.getState();
    if (store.active) {
      router.replace("/quiz/session");
      return;
    }

    const isPremium = useMonetization.getState().active;
    const credits = usePreferences.getState().credits;
    const completedExams = store.attempts.filter((a) => a.mode === "exam").length;

    const launchExam = (spendCredits = 0) => {
      try {
        store.start(release, "exam");
        if (spendCredits > 0) {
          usePreferences
            .getState()
            .patch({ credits: Math.max(0, usePreferences.getState().credits - spendCredits) });
        }
        router.replace("/quiz/session");
      } catch {
        Alert.alert(t("contentError"), t("invalid"));
      }
    };

    if (!isPremium && completedExams >= FREE_EXAM_LIMIT) {
      const buttons: {
        text: string;
        style?: "cancel" | "default" | "destructive";
        onPress?: () => void;
      }[] = [{ text: t("cancel"), style: "cancel" }];

      if (credits >= EXAM_CREDIT_COST) {
        buttons.push({
          text: `Use ${EXAM_CREDIT_COST} Credits (${credits} left)`,
          onPress: () => launchExam(EXAM_CREDIT_COST),
        });
      }
      buttons.push({
        text: "Unlock Full Access ($6.99)",
        onPress: () => router.push("/premium"),
      });

      Alert.alert(
        "Free Exam Trial Completed",
        `You've completed your free exam simulator trial. Unlock Full Access ($6.99 one-time) for unlimited exams, or use ${EXAM_CREDIT_COST} Credits (${credits} available) for one exam.`,
        buttons
      );
      return;
    }

    launchExam(0);
  };

  const rule = general?.rule;
  const passPct = rule
    ? Math.round((rule.minimumCorrect / rule.questionCount) * 100)
    : 80;
  const signsQuota = rule?.sections.find((s) => s.topic === "road-signs");

  return (
    <Page title={t("exam")} eyebrow={stateName(state)} icon={Trophy}>
      {loading ? (
        <Busy />
      ) : general && rule ? (
        <View style={{ gap: 16 }}>
          {/* Official Exam Briefing Hero */}
          <View style={st.heroCard}>
            <View style={st.heroBadge}>
              <ShieldCheck size={14} color="#FFF" />
              <Text style={st.heroBadgeText}>
                {stateName(state).toUpperCase()} OFFICIAL FORMAT
              </Text>
            </View>

            <Text style={st.heroTitle}>
              {stateName(state)} DMV Knowledge Exam Simulator
            </Text>
            <Text style={st.heroSub}>{t("commonExamBody")}</Text>

            {/* KPI Specs Grid */}
            <View style={st.specGrid}>
              <View style={st.specBox}>
                <FileQuestion size={18} color="#FFF" />
                <Text style={st.specVal}>{rule.questionCount}</Text>
                <Text style={st.specLabel}>Questions</Text>
              </View>

              <View style={st.specBox}>
                <Award size={18} color="#FFF" />
                <Text style={st.specVal}>
                  {rule.minimumCorrect}/{rule.questionCount} ({passPct}%)
                </Text>
                <Text style={st.specLabel}>To Pass</Text>
              </View>

              <View style={st.specBox}>
                <Clock size={18} color="#FFF" />
                <Text style={st.specVal}>
                  {rule.durationSeconds
                    ? `${Math.round(rule.durationSeconds / 60)} min`
                    : "Untimed"}
                </Text>
                <Text style={st.specLabel}>Time Limit</Text>
              </View>
            </View>

            {signsQuota && (
              <View style={st.quotaBanner}>
                <Signpost size={16} color="#FDE68A" />
                <Text style={st.quotaText}>
                  Includes {signsQuota.questionCount} Road Signs questions (minimum{" "}
                  {signsQuota.minimumCorrect} correct required)
                </Text>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() => start(general)}
              style={({ pressed }) => [
                st.startBtn,
                { opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Play size={18} color="#4F46E5" fill="#4F46E5" />
              <Text style={st.startBtnText}>{t("startNow")}</Text>
              <ChevronRight size={18} color="#4F46E5" />
            </Pressable>
          </View>

          {/* Exam Rules Checklist */}
          <View
            style={[
              st.rulesCard,
              { backgroundColor: p.card, borderColor: p.line },
            ]}
          >
            <Text style={[st.rulesHeading, { color: p.ink }]}>
              Exam Conditions
            </Text>
            <View style={st.ruleItem}>
              <CheckCircle2 size={17} color="#059669" />
              <Text style={[st.ruleText, { color: p.muted }]}>
                Questions are randomly assembled from the verified {stateName(state)} pool ({general.questions.length} total questions).
              </Text>
            </View>
            <View style={st.ruleItem}>
              <CheckCircle2 size={17} color="#059669" />
              <Text style={[st.ruleText, { color: p.muted }]}>
                Explanations are hidden during the exam and shown in full after you finish.
              </Text>
            </View>
          </View>
        </View>
      ) : specific.some(Boolean) ? (
        <Card>
          <Heading>{t("chooseProfile")}</Heading>
          <Body>{t("examAgeBody")}</Body>
          {(["adult-first", "teen-first"] as const).map((profile, index) => (
            <Button
              key={profile}
              title={t(profile === "adult-first" ? "adult" : "teen")}
              disabled={!specific[index]}
              onPress={() => {
                const release = specific[index];
                if (release) start(release);
              }}
            />
          ))}
          {specific.some((release) => !release) && (
            <Body>{t("examProfilePending")}</Body>
          )}
        </Card>
      ) : (
        <Card>
          <Heading>{t("pending")}</Heading>
          <Body>{data.error ? t("error") : t("rulesPending")}</Body>
        </Card>
      )}

      <View style={st.bottomRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setRevision((value) => value + 1)}
          style={[
            st.secBtn,
            { backgroundColor: p.card, borderColor: p.line },
          ]}
        >
          <RefreshCw size={15} color={p.ink} />
          <Text style={[st.secBtnText, { color: p.ink }]}>{t("refresh")}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/(tabs)/practice")}
          style={[
            st.secBtn,
            { backgroundColor: p.card, borderColor: p.line },
          ]}
        >
          <Text style={[st.secBtnText, { color: p.ink }]}>{t("practice")}</Text>
        </Pressable>
      </View>
    </Page>
  );
}

const st = StyleSheet.create({
  heroCard: {
    backgroundColor: "#4F46E5",
    borderRadius: 28,
    padding: 22,
    gap: 16,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF22",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  heroSub: {
    color: "#E0E7FF",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  specGrid: {
    flexDirection: "row",
    gap: 10,
  },
  specBox: {
    flex: 1,
    backgroundColor: "#FFFFFF1A",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 4,
  },
  specVal: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },
  specLabel: {
    color: "#C7D2FE",
    fontSize: 11,
    fontWeight: "700",
  },
  quotaBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3730A3",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  quotaText: {
    flex: 1,
    color: "#FEF3C7",
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 18,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    height: 54,
    borderRadius: 18,
    marginTop: 4,
  },
  startBtnText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "900",
  },
  rulesCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  rulesHeading: {
    fontSize: 15,
    fontWeight: "800",
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  ruleText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    gap: 10,
  },
  secBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
  },
  secBtnText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
