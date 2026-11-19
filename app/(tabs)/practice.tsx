import React from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  BookOpen,
  Car,
  ChevronRight,
  ClipboardList,
  CloudRain,
  CornerUpRight,
  Crown,
  Flame,
  Gauge,
  History,
  Lock,
  ParkingCircle,
  Play,
  Route,
  ShieldCheck,
  Signpost,
  Star,
  TrafficCone,
  Trash2,
  Trophy,
  Users,
  WineOff,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
import { router } from "expo-router";
import { usePrep } from "../../src/us/store";
import { useT } from "../../src/us/i18n";
import { stateName } from "../../src/us/states";
import { topicInfo } from "../../src/us/topics";
import { useContent } from "../../src/us/useContent";
import {
  Page,
  Card,
  Body,
  Button,
  Heading,
  Busy,
  Hero,
  usePalette,
} from "../../src/us/ui";
import { useStartStudy } from "../../src/us/useStartStudy";
import { useMonetization } from "../../src/us/monetization";
import { FREE_EXAM_LIMIT, isTopicFree } from "../../src/us/premiumPolicy";

const TOPIC_ICONS: Record<string, LucideIcon> = {
  signs: Signpost,
  signals: TrafficCone,
  intersection: Route,
  turns: CornerUpRight,
  speed: Gauge,
  parking: ParkingCircle,
  safety: ShieldCheck,
  alcohol: WineOff,
  conditions: CloudRain,
  sharing: Users,
  rules: Car,
};

export default function Practice() {
  const t = useT();
  const p = usePalette();
  const s = usePrep();
  const premium = useMonetization((state) => state.active);
  const { release, loading, error, refresh } = useContent();
  const start = useStartStudy(release);

  const completedExams = s.attempts.filter((a) => a.mode === "exam").length;
  const freeExamsLeft = Math.max(0, FREE_EXAM_LIMIT - completedExams);

  const topics = Array.from(
    new Set(release?.questions.map((q) => q.topic) ?? [])
  );

  return (
    <Page
      title={t("practice")}
      eyebrow={stateName(s.state)}
      icon={ClipboardList}
    >
      {/* Active Session Banner */}
      {s.active && (
        <View
          style={[
            st.activeCard,
            {
              backgroundColor: p.dark ? "#1E3A8A35" : "#EFF6FF",
              borderColor: "#0066FF55",
            },
          ]}
        >
          <View style={st.activeHeader}>
            <View style={st.activeBadge}>
              <View style={st.pulseDot} />
              <Text style={st.activeBadgeText}>
                {t("active").toUpperCase()} · {s.active.index + 1}/
                {s.active.questions.length}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                Alert.alert(t("discard"), t("clearBody"), [
                  { text: t("cancel") },
                  {
                    text: t("remove"),
                    style: "destructive",
                    onPress: s.discard,
                  },
                ])
              }
              style={st.discardIconBtn}
            >
              <Trash2 size={16} color="#E11D48" />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/quiz/session")}
            style={({ pressed }) => [
              st.resumeBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Play size={16} color="#FFF" fill="#FFF" />
            <Text style={st.resumeBtnText}>{t("resume")}</Text>
            <ChevronRight size={17} color="#FFF" />
          </Pressable>
        </View>
      )}

      {/* Primary Heroes */}
      <Hero
        label={stateName(s.state)}
        title={t("exam")}
        body={t("examBody")}
        action={t("exam")}
        onPress={() => start("exam")}
        icon={Trophy}
        color="#0F172A"
        disabled={!release?.questions.length}
      />

      <View style={st.dualRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!release?.questions.length}
          onPress={() => start("practice")}
          style={({ pressed }) => [
            st.quickTile,
            {
              backgroundColor: "#0066FF",
              opacity: !release?.questions.length ? 0.5 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={st.tileIconCircle}>
            <Zap size={20} color="#0066FF" />
          </View>
          <Text style={st.tileTitle}>{t("quick")}</Text>
          <Text numberOfLines={2} style={st.tileSub}>
            {t("quickBody")}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={!release?.questions.length}
          onPress={() => start("daily")}
          style={({ pressed }) => [
            st.quickTile,
            {
              backgroundColor: "#EA580C",
              opacity: !release?.questions.length ? 0.5 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={st.tileIconCircle}>
            <Flame size={20} color="#EA580C" />
          </View>
          <Text style={st.tileTitle}>{t("daily")}</Text>
          <Text numberOfLines={2} style={st.tileSub}>
            {t("dailyBody")}
          </Text>
        </Pressable>
      </View>

      {/* Quick Tools Row */}
      <View style={st.toolsRow}>
        <Pressable
          accessibilityRole="button"
          disabled={!release?.questions.length}
          onPress={() => start("mistakes")}
          style={[
            st.toolChip,
            { backgroundColor: p.card, borderColor: p.line },
          ]}
        >
          <XCircle size={17} color="#E11D48" />
          <Text style={[st.toolChipText, { color: p.ink }]}>
            {t("mistakes")}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={!release?.questions.length}
          onPress={() => start("favorites")}
          style={[
            st.toolChip,
            { backgroundColor: p.card, borderColor: p.line },
          ]}
        >
          <Star size={17} color="#F59E0B" />
          <Text style={[st.toolChipText, { color: p.ink }]}>
            {t("favorites")}
          </Text>
        </Pressable>
      </View>

      <View style={st.toolsRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/notes")}
          style={[
            st.toolChip,
            { backgroundColor: p.card, borderColor: p.line },
          ]}
        >
          <BookOpen size={17} color="#00A68A" />
          <Text style={[st.toolChipText, { color: p.ink }]}>{t("notes")}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)/progress")}
          style={[
            st.toolChip,
            { backgroundColor: p.card, borderColor: p.line },
          ]}
        >
          <History size={17} color="#6366F1" />
          <Text style={[st.toolChipText, { color: p.ink }]}>
            {t("examHistory")}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <Busy />
      ) : (
        <>
          {!release?.questions.length && (
            <Card>
              <Heading>{t("pending")}</Heading>
              <Body>{error ? t("error") : t("pendingBody")}</Body>
              <Button secondary title={t("refresh")} onPress={refresh} />
            </Card>
          )}

          {!!topics.length && (
            <View style={{ gap: 10, marginTop: 6 }}>
              <Text style={[st.sectionTitle, { color: p.ink }]}>
                {t("allTopics")}
              </Text>

              {topics.map((topic) => {
                const info = topicInfo(topic);
                const color = info?.color ?? "#0066FF";
                const Icon = (info && TOPIC_ICONS[info.icon]) || Car;
                const label = info
                  ? t(info.label)
                  : topic
                      .replace(/[-_]/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase());
                const freeTopic = isTopicFree(topic);
                const locked = !premium && !freeTopic;

                return (
                  <Pressable
                    key={topic}
                    accessibilityRole="button"
                    onPress={() => start("practice", topic)}
                    style={({ pressed }) => [
                      st.topicCard,
                      {
                        backgroundColor: p.card,
                        borderColor: p.line,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        st.topicIconBox,
                        { backgroundColor: `${color}18` },
                      ]}
                    >
                      <Icon size={21} color={color} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[st.topicTitle, { color: p.ink }]}>
                        {label}
                      </Text>
                      <Text style={[st.topicSub, { color: p.muted }]}>
                        {t("untimed")}
                      </Text>
                    </View>

                    {locked ? (
                      <Lock size={16} color={p.muted} />
                    ) : (
                      <ChevronRight size={18} color={p.muted} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          <Body>{t("free")}</Body>
        </>
      )}
    </Page>
  );
}

const st = StyleSheet.create({
  activeCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  activeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#0066FF",
  },
  activeBadgeText: {
    color: "#0066FF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  discardIconBtn: {
    padding: 6,
  },
  resumeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0066FF",
    height: 46,
    borderRadius: 14,
  },
  resumeBtnText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "800",
  },
  dualRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickTile: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  tileIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  tileTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  tileSub: {
    color: "#FFFFFFCC",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  toolsRow: {
    flexDirection: "row",
    gap: 10,
  },
  toolChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  toolChipText: {
    fontSize: 13.5,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  topicCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
  },
  topicIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  topicTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
  },
  topicTitle: {
    fontSize: 15.5,
    fontWeight: "800",
  },
  tierPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tierPillText: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  proBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1E1B4B",
    borderColor: "#4338CA",
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
  },
  proBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#312E81",
    alignItems: "center",
    justifyContent: "center",
  },
  proBannerTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  proBannerSub: {
    color: "#C7D2FE",
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: 2,
  },
  topicSub: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "900",
  },
});
