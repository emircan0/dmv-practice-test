import React, { useState } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Signpost,
  Sparkles,
} from "lucide-react-native";
import { useT } from "../../src/us/i18n";
import { usePrep } from "../../src/us/store";
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
  usePalette,
} from "../../src/us/ui";

export default function Learn() {
  const t = useT();
  const p = usePalette();
  const state = usePrep((s) => s.state);
  const { release, loading, error, refresh } = useContent();
  const [signs, setSigns] = useState(false);

  const lessons =
    release?.lessons.filter((l) => !signs || l.topic === "road-signs") ?? [];

  return (
    <Page
      icon={BookOpen}
      eyebrow={stateName(state)}
      title={t("learn")}
      subtitle={t("contentLanguage")}
    >
      {/* Filter Toggle Pills */}
      <View style={[st.filterRow, { backgroundColor: p.soft, borderColor: p.line }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSigns(false)}
          style={[
            st.filterTab,
            !signs && { backgroundColor: p.card, shadowOpacity: 0.08 },
          ]}
        >
          <Sparkles size={15} color={!signs ? "#0066FF" : p.muted} />
          <Text
            style={[
              st.filterText,
              { color: !signs ? p.ink : p.muted, fontWeight: !signs ? "800" : "600" },
            ]}
          >
            {t("allTopics")}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setSigns(true)}
          style={[
            st.filterTab,
            signs && { backgroundColor: p.card, shadowOpacity: 0.08 },
          ]}
        >
          <Signpost size={15} color={signs ? "#0066FF" : p.muted} />
          <Text
            style={[
              st.filterText,
              { color: signs ? p.ink : p.muted, fontWeight: signs ? "800" : "600" },
            ]}
          >
            {t("signs")}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <Busy />
      ) : lessons.length ? (
        lessons.map((l, idx) => {
          const info = topicInfo(l.topic);
          const color = info?.color ?? "#0066FF";
          const topicLabel = info ? t(info.label) : l.topic;

          return (
            <View
              key={l.id}
              style={[
                st.lessonCard,
                { backgroundColor: p.card, borderColor: p.line },
              ]}
            >
              <View style={st.lessonTop}>
                <View
                  style={[
                    st.topicPill,
                    { backgroundColor: `${color}15`, borderColor: `${color}35` },
                  ]}
                >
                  <View style={[st.dot, { backgroundColor: color }]} />
                  <Text style={[st.topicPillText, { color }]}>{topicLabel}</Text>
                </View>

                <Text style={[st.lessonNum, { color: p.muted }]}>
                  Lesson #{idx + 1}
                </Text>
              </View>

              <Text style={[st.lessonTitle, { color: p.ink }]}>{l.title}</Text>

              <Text style={[st.lessonBody, { color: p.ink }]}>{l.body}</Text>

              <View style={[st.lessonFooter, { borderTopColor: p.line }]}>
                <View style={st.sourceRow}>
                  <ShieldCheck size={14} color={p.muted} />
                  <Text
                    numberOfLines={1}
                    style={[st.sourceText, { color: p.muted }]}
                  >
                    {l.source.title} · {l.source.section}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="link"
                  onPress={() => {
                    Linking.openURL(l.source.url).catch(() => {});
                  }}
                  style={[
                    st.sourceBtn,
                    { backgroundColor: p.soft, borderColor: p.line },
                  ]}
                >
                  <Text style={st.sourceBtnText}>{t("source")}</Text>
                  <ExternalLink size={12} color="#0066FF" />
                </Pressable>
              </View>
            </View>
          );
        })
      ) : (
        <Card>
          <Heading>{t("lessons")}</Heading>
          <Body>{error ? t("error") : t("noLessons")}</Body>
          <Button secondary title={t("refresh")} onPress={refresh} />
        </Card>
      )}
    </Page>
  );
}

const st = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  filterText: {
    fontSize: 13,
  },
  lessonCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  lessonTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topicPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  topicPillText: {
    fontSize: 11.5,
    fontWeight: "800",
  },
  lessonNum: {
    fontSize: 12,
    fontWeight: "700",
  },
  lessonTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  lessonBody: {
    fontSize: 14.5,
    lineHeight: 23,
    fontWeight: "500",
    opacity: 0.9,
  },
  lessonFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    gap: 10,
  },
  sourceRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sourceText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  sourceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  sourceBtnText: {
    color: "#0066FF",
    fontSize: 12,
    fontWeight: "800",
  },
});
