import React, { useRef, useState } from "react";
import { Alert, View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CalendarDays, ChartNoAxesCombined } from "lucide-react-native";
import { usePrep } from "../src/us/store";
import { usePreferences } from "../src/us/preferences";
import { useMonetization } from "../src/us/monetization";
import { useContent } from "../src/us/useContent";
import { useStartStudy } from "../src/us/useStartStudy";
import { buildStudyTool, generateStudyTool, STUDY_TOOL_COST, type StudyToolKind } from "../src/us/studyTools";
import { useT } from "../src/us/i18n";
import { topicInfo } from "../src/us/topics";
import { stateName } from "../src/us/states";
import { Page, Card, Heading, Body, Button, usePalette } from "../src/us/ui";

export default function StudyTools() {
  const params = useLocalSearchParams<{ kind?: string }>();
  const kind: StudyToolKind = params.kind === "report" ? "report" : "plan";
  const s = usePrep(), prefs = usePreferences(), premium = useMonetization(), t = useT(), p = usePalette();
  const { release } = useContent();
  const start = useStartStudy(release);
  const artifact = s.tools.find((tool) => tool.kind === kind && tool.state === s.state && tool.profile === s.profile);
  const billingKnown = process.env.EXPO_PUBLIC_US_BILLING_ENABLED !== "true" || (premium.billingAvailable && !premium.checking && !premium.error);
  const generating = useRef(false);
  const [busy, setBusy] = useState(false);
  const title = t(kind === "plan" ? "studyPlan" : "advancedReport");
  const topicLabel = (topic: string) => { const info = topicInfo(topic); return info ? t(info.label) : topic.replace(/[-_]/g, " "); };
  const generate = () => {
    if (generating.current || !premium.ready || !billingKnown) return;
    generating.current = true; setBusy(true);
    const current = usePrep.getState(), wallet = usePreferences.getState();
    try {
      generateStudyTool(() => buildStudyTool(current.attempts, current.state, current.profile, kind, release?.questions ?? []), {
        premium: useMonetization.getState().active, credits: wallet.credits,
        save: current.saveTool, remove: () => usePrep.setState({ tools: current.tools }),
        setCredits: (credits) => usePreferences.getState().patch({ credits }),
      });
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      Alert.alert(title, t(code === "study_data_needed" ? "studyToolNeedData" : code === "content_needed" ? "pendingBody" : code === "insufficient_credits" ? "studyToolNeedCredits" : "unavailable"));
    } finally { generating.current = false; setBusy(false); }
  };
  return (
    <Page title={title} eyebrow={stateName(s.state)} icon={kind === "plan" ? CalendarDays : ChartNoAxesCombined}>
      <Card>
        <Body>{t(kind === "plan" ? "studyPlanBody" : "advancedReportBody")}</Body>
        <Body>{t("studyToolTerms").replace("{credits}", String(STUDY_TOOL_COST))}</Body>
        {!billingKnown && <Body>{t("studyToolBillingUnknown")}</Body>}
        <Body>{premium.active ? t("studyToolIncluded") : `${prefs.credits} ${t("credits")}`}</Body>
        <Button disabled={busy || !premium.ready || !billingKnown} title={`${t(artifact ? "studyToolGenerateNew" : "studyToolGenerate")} · ${premium.active ? t("studyToolIncluded") : `${STUDY_TOOL_COST} ${t("credits")}`}`} onPress={generate} />
        {!premium.active && <Button secondary title={t("upgrade")} onPress={() => router.push("/premium")} />}
      </Card>
      {artifact ? <>
        <Body>{t("studyToolSnapshot")} · {new Date(artifact.createdAt).toLocaleDateString(s.locale === "tr" ? "tr-TR" : "en-US")}</Body>
        <Card><Heading>{artifact.correct}/{artifact.answered} · {Math.round(artifact.correct / artifact.answered * 100)}%</Heading><Body>{artifact.uniqueQuestions} {t("studyToolUnique")} · {artifact.sessions} {t("sessions")}</Body><Body>{t("noPrediction")}</Body></Card>
        {kind === "plan" ? artifact.days.map((day) => <Card key={day.day}>
          <Heading>{t("studyToolDay")} {day.day} · {new Date(day.date).toLocaleDateString(s.locale === "tr" ? "tr-TR" : "en-US", { month: "short", day: "numeric" })}</Heading>
          <Body>{day.topic ? topicLabel(day.topic) : t(day.mode === "mistakes" ? "mistakes" : day.mode === "daily" ? "daily" : "quick")}</Body>
          <Body>{t("studyToolGoal").replace("{questions}", String(day.goal))}</Body>
          <Button secondary title={t("startNow")} disabled={!release?.questions.some((q) => !day.topic || q.topic === day.topic)} onPress={() => start(day.mode, day.topic)} />
        </Card>) : artifact.topics.map((topic) => <Card key={topic.topic}>
          <Heading>{topicLabel(topic.topic)}</Heading>
          <Body>{topic.answered} {t("answeredQuestions")} · {topic.uniqueQuestions} {t("studyToolUnique")}</Body>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}><Text style={{ color: p.ink, fontWeight: "800" }}>{topic.accuracy}%</Text><Text style={{ color: p.muted }}>{t("studyToolRecent")} {topic.recentAccuracy}%</Text></View>
          <View style={{ height: 7, borderRadius: 5, backgroundColor: p.soft, overflow: "hidden" }}><View style={{ height: 7, width: `${topic.accuracy}%`, backgroundColor: "#6366F1" }} /></View>
          <Body>{t(topic.trend === "improving" ? "studyToolImproving" : topic.trend === "declining" ? "studyToolDeclining" : "studyToolNoTrend")}</Body>
          <Button secondary title={t("practice")} disabled={!release?.questions.some((q) => q.topic === topic.topic)} onPress={() => start("practice", topic.topic)} />
        </Card>)}
      </> : <Card><Body>{t("studyToolNeedData")}</Body><Button secondary title={t("practice")} onPress={() => router.push("/(tabs)/practice")} /></Card>}
      <Body>{t("local")}</Body>
    </Page>
  );
}
