import React, { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Alert, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Zap, BrainCircuit, BookOpen, TrendingUp, Star, XCircle, ChevronRight, Trophy, Crown, Target, Flame, Bell, Info, Play, Medal, Car, ShieldCheck, Signpost, Users, MapPin, TrafficCone, Route, CornerUpRight, Gauge, ParkingCircle, WineOff, CloudRain, type LucideIcon } from "lucide-react-native";
import { usePreferences } from "../../src/us/preferences";
import { useMonetization } from "../../src/us/monetization";
import { integrations } from "../../src/us/integrations";
import { studyStreak } from "../../src/us/streak";
import { usePrep } from "../../src/us/store";
import { useAccount } from "../../src/us/auth";
import { useT } from "../../src/us/i18n";
import { EXAM_TOPICS, topicInfo } from "../../src/us/topics";
import { stateName } from "../../src/us/states";
import { useContent } from "../../src/us/useContent";
import { useStartStudy } from "../../src/us/useStartStudy";
import { isTopicFree } from "../../src/us/premiumPolicy";
import { loadRankings, type Ranking } from "../../src/us/leaderboard";
import { Card, Body, Button, Heading, usePalette } from "../../src/us/ui";

const BLUE = "#0066FF";
const PINK = "#FF195C";

function ActionTile({ label, title, body, action, icon: Icon, color, onPress }: {
  label: string; title: string; body: string; action: string; icon: LucideIcon; color: string; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [ds.tile, { backgroundColor: color, opacity: pressed ? 0.85 : 1 }]}>
      <View pointerEvents="none" style={ds.tileArt}><Icon size={100} color="#FFFFFF" strokeWidth={1.5} /></View>
      <Text style={ds.tileBadge}>{label.toLocaleUpperCase()}</Text>
      <View style={{ flex: 1, minHeight: 24 }} />
      <Text style={ds.tileTitle}>{title}</Text>
      <Text style={ds.tileBody}>{body}</Text>
      <View style={ds.row}><Text style={ds.tileAction}>{action}</Text><ChevronRight size={16} color="#FFF" /></View>
    </Pressable>
  );
}

export default function Home() {
  const p = usePalette(), t = useT(), prefs = usePreferences(), s = usePrep();
  const premium = useMonetization((state) => state.active);
  const session = useAccount((a) => a.session);
  const { release, error, refresh } = useContent();
  const start = useStartStudy(release);
  const [rewardBusy, setRewardBusy] = useState(false);
  const [ranking, setRanking] = useState<{ key: string; rows: Ranking[]; error: boolean; loading: boolean }>({ key: "", rows: [], error: false, loading: false });
  const rankingKey = `${session?.user.id}:${s.state}:${s.profile}`;
  useFocusEffect(useCallback(() => {
    let alive = true;
    if (!session) return;
    setRanking({ key: rankingKey, rows: [], error: false, loading: true });
    loadRankings(s.state, s.profile, "success", 0).then((rows) => {
      if (alive) setRanking({ key: rankingKey, rows, error: false, loading: false });
    }).catch(() => {
      if (alive) setRanking({ key: rankingKey, rows: [], error: true, loading: false });
    });
    return () => { alive = false; };
  }, [rankingKey, s.state, s.profile, session?.user.id]));
  const rows = ranking.key === rankingKey ? ranking.rows : [];
  const rank = session ? rows.findIndex((row) => row.user_id === session.user.id) : -1;
  const name = session ? prefs.nickname || session.user.user_metadata?.full_name || t("driverName") : t("dashboardGuest");
  const streak = studyStreak(s.attempts, s.state, s.profile);
  const topics = Array.from(new Set(release?.questions.map((q) => q.topic) ?? []));
  const fallbackTopics = EXAM_TOPICS.map((topic) => topic.id);
  const topicIcons: Record<string, LucideIcon> = {
    signs: Signpost, signals: TrafficCone, intersection: Route,
    turns: CornerUpRight, speed: Gauge, parking: ParkingCircle,
    safety: ShieldCheck, alcohol: WineOff, conditions: CloudRain,
    sharing: Users, rules: Car,
  };
  const categoryLabel = (topic: string) => {
    const info = topicInfo(topic);
    return info ? t(info.label) : topic.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  };
  const earn = async () => {
    if (rewardBusy) return;
    const adapter = integrations.ads();
    if (!adapter) { Alert.alert(t("reward"), t("rewardPending")); return; }
    setRewardBusy(true);
    const rewardOwner = usePrep.getState().studyOwner;
    try {
      const result = await adapter.reward();
      if (rewardOwner !== usePrep.getState().studyOwner) return;
      if (result.earned && Number.isFinite(result.credits) && result.credits > 0)
        usePreferences.getState().patch({ credits: usePreferences.getState().credits + Math.floor(result.credits) });
    } catch { Alert.alert(t("reward"), t("unavailable")); }
    finally { setRewardBusy(false); }
  };
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={[ds.header, { backgroundColor: p.bg }]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={ds.eyebrow}>{t("greeting")}</Text>
          <Text numberOfLines={1} style={[ds.name, { color: p.ink }]}>{name}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t("streak")} onPress={() => router.push("/(tabs)/progress")} style={[ds.streak, { backgroundColor: p.card, borderColor: p.line }]}>
          <Zap color="#FF9900" size={20} /><Text style={{ color: p.muted, fontWeight: "700", fontSize: 14 }}>{streak > 0 ? `${streak} ` : ""}{t("streakShort")}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t("notifications")} onPress={() => router.push("/(tabs)/settings")} style={[ds.bell, { backgroundColor: p.card, borderColor: p.line }]}><Bell size={21} color={p.muted} /></Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ds.content}>
        <Card style={ds.creditCard}>
          <View style={ds.row}>
            <View style={[ds.iconBox, { backgroundColor: p.dark ? "#453716" : "#FFFBEB" }]}><Zap size={25} color="#F5A000" fill="#F5A000" /></View>
            <View style={{ flex: 1 }}><Text style={ds.eyebrow}>{t("currentCredits")}</Text><Text style={[ds.creditValue, { color: p.ink }]}>{prefs.credits} {t("credits")}</Text></View>
            <Pressable accessibilityRole="button" disabled={rewardBusy || premium} accessibilityState={{ disabled: rewardBusy || premium }} onPress={earn} style={[ds.earn, { opacity: rewardBusy ? 0.6 : 1 }]}><Play size={13} color="#FFF" fill="#FFF" /><Text style={ds.earnText}>{t(premium ? "premium" : rewardBusy ? "loading" : "earnShort")}</Text></Pressable>
          </View>
          <View style={[ds.creditNote, { backgroundColor: p.soft }]}><Info size={16} color={p.muted} /><Text style={[ds.note, { color: p.muted }]}>{t(premium ? "premiumActivated" : "dashboardCreditBody")}</Text></View>
        </Card>

        <Pressable accessibilityRole="button" onPress={() => router.push("/premium")} style={[ds.promo, { backgroundColor: p.dark ? "#1E293B" : "#0F172A" }]}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={ds.promoBadge}>
              {premium ? "FULL ACCESS ACTIVE" : "FULL ACCESS · $6.99"}
            </Text>
            <Text style={ds.promoTitle}>
              {t(premium ? "premiumActivated" : "dashboardPremiumTitle")}
            </Text>
            <Text style={[ds.promoBody, { color: "#94A3B8" }]}>
              {premium
                ? t("premiumAdFreeBody")
                : "All 10 state handbook topics, unlimited exam simulators, and ad-free study."}
            </Text>
          </View>
          <ChevronRight color="#94A3B8" size={20} />
        </Pressable>

        <View style={[ds.daily, { backgroundColor: p.dark ? "#302319" : "#FFF0E5", borderColor: p.dark ? "#82512E" : "#FFC6A3" }]}>
          <View style={[ds.row, { justifyContent: "space-between", flexWrap: "wrap" }]}><View style={ds.dailyBadge}><Flame size={16} color="#E85A00" /><Text style={[ds.dailyLabel, p.dark && { color: "#FDBA74" }]}>{t("daily").toLocaleUpperCase()}</Text></View><Text style={{ color: p.dark ? "#FDBA74" : "#C45B00", fontSize: 11, fontWeight: "700" }}>{t("fiveQuestions")}</Text></View>
          <Text style={[ds.dailyTitle, { color: p.ink }]}>{t(streak ? "dailyKeepStreak" : "dailyStartStreak")}</Text>
          <Text style={[ds.dailyBody, { color: p.muted }]}>{t("dashboardDailyBody")}</Text>
          <Pressable accessibilityRole="button" onPress={() => start("daily")} style={ds.dailyButton}><Text style={ds.dailyButtonText}>{t("dailyAction")}</Text><ChevronRight size={17} color="#FFF" /></Pressable>
        </View>

        <View style={[ds.row, { alignItems: "stretch" }]}>
          <ActionTile label={t("quick")} title={t("tenQuestions")} body={t("dashboardQuickBody")} action={t(s.active ? "resume" : "startShort")} icon={Zap} color={BLUE} onPress={() => start("practice")} />
          <ActionTile label={t("mistakeBadge")} title={t("myMistakes")} body={t("dashboardMistakesBody")} action={t("reviewShort")} icon={Target} color={PINK} onPress={() => start("mistakes")} />
        </View>

        <Pressable accessibilityRole="button" onPress={() => start("exam")}>
          <Card style={ds.examCard}>
            <View pointerEvents="none" style={ds.examArt}><Trophy size={110} color={p.muted} /></View>
            <View style={ds.row}><View style={ds.dot} /><Text style={ds.eyebrowInline}>{t("examRehearsal")}</Text></View>
            <View style={ds.row}><View style={{ flex: 1, gap: 4 }}><Text style={[ds.sectionTitle, { color: p.ink }]}>{t("dashboardExamTitle")}</Text><Text style={[ds.note, { color: p.muted }]}>{release?.rule ? `${release.rule.questionCount} ${t("questionUnit")} · ${stateName(s.state)}` : t("dashboardExamBody")}</Text></View><View style={[ds.examArrow, { backgroundColor: p.bg, borderColor: p.line }]}><ChevronRight color={p.muted} size={22} /></View></View>
          </Card>
        </Pressable>

        <Heading style={ds.sectionHeading}>{t("shortcuts")}</Heading>
        <View style={[ds.row, { alignItems: "stretch", gap: 8 }]}>
          {[
            { label: t("dashboardStatsTab"), icon: TrendingUp, color: "#7360FF", action: () => router.push("/(tabs)/progress") },
            { label: t("myMistakes"), icon: XCircle, color: PINK, action: () => start("mistakes") },
            { label: t("favoritesShort"), icon: Star, color: "#FF9900", action: () => start("favorites") },
            { label: t("notesShort"), icon: BookOpen, color: "#00BF8F", action: () => router.push("/notes") },
          ].map(({ label, icon: Icon, color, action }) => <Pressable key={label} accessibilityRole="button" onPress={action} style={[ds.shortcut, { backgroundColor: p.card, borderColor: p.line }]}><View style={[ds.shortcutIcon, { backgroundColor: color + "12" }]}><Icon size={23} color={color} /></View><Text style={[ds.shortcutLabel, { color: p.muted }]}>{label}</Text></Pressable>)}
        </View>

        <Card style={ds.rankingCard}>
          <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/leaderboard")} style={ds.row}><View style={[ds.rankIcon, { backgroundColor: p.dark ? "#453716" : "#FFF3C4" }]}><Trophy size={21} color="#F29300" /></View><Text style={[ds.sectionTitle, { flex: 1, color: p.ink }]}>{t("dashboardLeaderboard")}</Text><ChevronRight size={20} color={p.muted} /></Pressable>
          <View style={[ds.rankTable, { backgroundColor: p.bg }]}>
            {rows.length ? rows.slice(0, 3).map((entry, index) => <View key={entry.user_id} style={[ds.rankRow, index > 0 && { borderTopWidth: 1, borderTopColor: p.line }]}><Medal size={20} color={["#F5B400", "#AFC2D4", "#C86618"][index]} /><Text numberOfLines={1} style={[ds.rankName, { color: p.muted }]}>{entry.nickname}</Text><Text style={[ds.rankScore, { color: p.ink }]}>{Math.round(entry.average_score)}%</Text></View>) : <Text style={[ds.note, { color: p.muted }]}>{t(!session ? "dashboardRankingGuest" : ranking.loading ? "loading" : ranking.error ? "error" : "dashboardRankingEmpty")}</Text>}
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/leaderboard")} style={[ds.yourRank, { backgroundColor: p.dark ? "#152C46" : "#EDF6FF" }]}><View style={ds.rankNumber}><Text style={{ color: BLUE, fontWeight: "800" }}>{rank >= 0 ? rank + 1 : "–"}</Text></View><View style={{ flex: 1, gap: 3 }}><Text style={{ color: p.ink, fontWeight: "700", fontSize: 13 }}>{t("yourRank")}</Text><Text style={{ color: p.dark ? "#93C5FD" : BLUE, fontSize: 12 }}>{t(rank >= 0 ? "dashboardRankContinue" : "dashboardRankJoin")}</Text></View></Pressable>
        </Card>

        <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/ai-tutor")} style={ds.coach}>
          <View pointerEvents="none" style={ds.coachArt}><BrainCircuit size={140} color="#FFFFFF" /></View><View style={ds.coachIcon}><BrainCircuit size={29} color="#FFF" /></View><View style={{ flex: 1, gap: 5 }}><Text style={ds.coachTitle}>{t("dashboardCoachTitle")}</Text><Text style={ds.coachBody}>{t("dashboardCoachBody")}</Text></View><ChevronRight size={22} color="#FFF" />
        </Pressable>

        <Card>
          <Heading>{t("studyTools")}</Heading>
          <Body>{t("studyToolTerms").replace("{credits}", "3")}</Body>
          <Button secondary title={t("studyPlan")} onPress={() => router.push({ pathname: "/study-tools", params: { kind: "plan" } })} />
          <Button secondary title={t("advancedReport")} onPress={() => router.push({ pathname: "/study-tools", params: { kind: "report" } })} />
        </Card>
        <Heading style={ds.sectionHeading}>{t("examTopics")}</Heading>
        <Body>{t("examTopicsBody")}</Body>
        <View style={ds.categories}>
          {(topics.length ? topics : fallbackTopics).map((topic) => {
            const info = topicInfo(topic);
            const Icon = info ? topicIcons[info.icon] : BookOpen, color = info?.color ?? BLUE;
            return (
              <Pressable key={topic} accessibilityRole="button" accessibilityState={{ disabled: !topics.length }} disabled={!topics.length} onPress={() => start("practice", topic)} style={[ds.category, { backgroundColor: p.card, borderColor: p.line }]}>
                <View style={[ds.row, { justifyContent: "space-between" }]}>
                  <View style={[ds.categoryIcon, { backgroundColor: color + "10" }]}><Icon color={color} size={24} /></View>
                  <ChevronRight size={19} color="#9AAFCA" />
                </View>
                <Text style={[ds.categoryTitle, { color: p.ink }]}>{categoryLabel(topic)}</Text>
                {!topics.length && <Text style={{ color: p.muted, fontSize: 10 }}>{t("statePreparing")}</Text>}
              </Pressable>
            );
          })}
        </View>
        {!release?.questions.length && <Card><Heading>{t("pending")}</Heading><Body>{t(error ? "error" : "pendingBody")}</Body><Button secondary title={t("refresh")} onPress={refresh} /></Card>}
        <Pressable accessibilityRole="button" onPress={() => router.push("/onboarding")} style={[ds.row, { justifyContent: "center" }]}><MapPin size={14} color={p.muted} /><Text style={{ color: p.muted, fontSize: 12 }}>{stateName(s.state)} · {t("chooseState")}</Text></Pressable>
        <Body>{t("disclaimer")}</Body>
      </ScrollView>
    </SafeAreaView>
  );
}

const ds = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  header: { width: "100%", maxWidth: 620, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24 },
  eyebrow: { color: "#91A6C0", fontSize: 10, fontWeight: "700", letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" },
  name: { fontSize: 29, fontWeight: "800", letterSpacing: -0.7 },
  streak: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, paddingHorizontal: 12, height: 38, borderRadius: 22 },
  bell: { height: 38, width: 38, alignItems: "center", justifyContent: "center", borderRadius: 20, borderWidth: 1 },
  content: { width: "100%", maxWidth: 620, alignSelf: "center", paddingHorizontal: 20, paddingTop: 4, paddingBottom: 30, gap: 20 },
  creditCard: { padding: 16, borderRadius: 22, gap: 14 },
  iconBox: { width: 40, height: 40, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  creditValue: { fontWeight: "800", fontSize: 19 },
  earn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "#00BD8A", paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12 },
  earnText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
  creditNote: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14 },
  note: { fontSize: 12, lineHeight: 17, flexShrink: 1 },
  promo: { backgroundColor: "#FF0050", borderRadius: 27, padding: 20, flexDirection: "row", alignItems: "center", gap: 14, overflow: "hidden", minHeight: 128 },
  promoCircle: { position: "absolute", width: 140, height: 140, right: -15, top: -85, borderRadius: 70, backgroundColor: "#FFFFFF08" },
  promoBadge: { alignSelf: "flex-start", backgroundColor: "#FFFFFF20", borderColor: "#FFFFFF45", borderWidth: 1, borderRadius: 7, paddingHorizontal: 9, paddingVertical: 4, color: "#FFF", fontWeight: "800", fontSize: 10, letterSpacing: 1 },
  promoTitle: { color: "#FFF", fontSize: 21, fontWeight: "800", letterSpacing: -0.4 },
  promoBody: { color: "#FFE1EA", fontSize: 12, lineHeight: 17 },
  crown: { padding: 12, borderRadius: 20, backgroundColor: "#FFFFFF25", borderColor: "#FFFFFF40", borderWidth: 1 },
  daily: { padding: 19, borderRadius: 28, borderWidth: 1, gap: 10 },
  dailyBadge: { flexDirection: "row", gap: 5, alignItems: "center", backgroundColor: "#FF751A20", borderWidth: 1, borderColor: "#FFAE7E", borderRadius: 7, paddingHorizontal: 9, paddingVertical: 6 },
  dailyLabel: { fontSize: 10, color: "#C64800", fontWeight: "800", letterSpacing: 0.7 },
  dailyTitle: { fontSize: 20, lineHeight: 25, fontWeight: "800", letterSpacing: -0.5 },
  dailyBody: { fontSize: 12, lineHeight: 17 },
  dailyButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#FF7900", borderRadius: 13, paddingHorizontal: 16, paddingVertical: 12, alignSelf: "flex-start", marginTop: 4 },
  dailyButtonText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
  tile: { flex: 1, borderRadius: 27, padding: 16, minHeight: 177, overflow: "hidden", gap: 5 },
  tileArt: { position: "absolute", right: -18, bottom: -18, opacity: 0.15 },
  tileBadge: { alignSelf: "flex-start", color: "#FFF", backgroundColor: "#FFFFFF28", borderColor: "#FFFFFF45", borderWidth: 1, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4, fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  tileTitle: { fontSize: 21, fontWeight: "800", color: "#FFF", letterSpacing: -0.5 },
  tileBody: { color: "#FFFFFFB8", fontSize: 12, lineHeight: 16 },
  tileAction: { color: "#FFF", fontWeight: "700", fontSize: 13, marginTop: 3 },
  examCard: { padding: 20, borderRadius: 27, overflow: "hidden", gap: 10 },
  examArt: { position: "absolute", right: -12, top: 4, opacity: 0.08 },
  dot: { height: 7, width: 7, borderRadius: 4, backgroundColor: PINK },
  eyebrowInline: { color: "#91A6C0", fontSize: 10, fontWeight: "700", letterSpacing: 1.1, textTransform: "uppercase" },
  sectionTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.4 },
  examArrow: { height: 43, width: 43, borderRadius: 16, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  sectionHeading: { fontSize: 19, marginTop: 5, marginBottom: -6 },
  shortcut: { flex: 1, minWidth: 0, alignItems: "center", borderWidth: 1, borderRadius: 23, paddingVertical: 15, paddingHorizontal: 3, gap: 10 },
  shortcutIcon: { padding: 10, borderRadius: 17 },
  shortcutLabel: { fontSize: 10, fontWeight: "700", textAlign: "center" },
  rankingCard: { padding: 19, borderRadius: 28, gap: 15, marginTop: 7 },
  rankIcon: { height: 34, width: 34, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  rankTable: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 17 },
  rankRow: { flexDirection: "row", alignItems: "center", gap: 3, paddingVertical: 9 },
  rankName: { flex: 1, fontSize: 14, fontWeight: "600" },
  rankScore: { fontSize: 16, fontWeight: "800" },
  yourRank: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 12 },
  rankNumber: { height: 34, width: 34, borderRadius: 18, backgroundColor: "#BBDFFF", justifyContent: "center", alignItems: "center" },
  coach: { flexDirection: "row", alignItems: "center", gap: 13, padding: 19, borderRadius: 27, backgroundColor: "#5142EF", overflow: "hidden", minHeight: 96, marginTop: 7 },
  coachArt: { position: "absolute", right: -15, top: -28, opacity: 0.12 },
  coachIcon: { padding: 11, borderRadius: 18, backgroundColor: "#FFFFFF25", borderColor: "#FFFFFF30", borderWidth: 1 },
  coachTitle: { color: "#FFF", fontSize: 16, fontWeight: "800", lineHeight: 21 },
  coachBody: { color: "#C5BFFF", fontSize: 12, lineHeight: 17 },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  category: { width: "48%", flexGrow: 1, flexBasis: "45%", padding: 16, borderWidth: 1, borderRadius: 25, gap: 16, minHeight: 125 },
  categoryIcon: { padding: 12, borderRadius: 18 },
  categoryTitle: { fontWeight: "700", fontSize: 14 },
});
