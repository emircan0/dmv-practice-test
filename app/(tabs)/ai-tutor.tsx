import { router } from "expo-router";
import { matchesStudyProfile } from "../../src/us/studyProfiles";
import React from "react";
import { View, Text } from "react-native";
import {
  BrainCircuit,
  MessageSquare,
  Target,
  TrendingDown,
  BookOpen,
} from "lucide-react-native";
import { usePrep } from "../../src/us/store";
import { useT } from "../../src/us/i18n";
import { useContent } from "../../src/us/useContent";
import { useStartStudy } from "../../src/us/useStartStudy";
import { analyzeProgress, chooseTask } from "../../src/us/coach";
import { SpeedometerGauge } from "../../src/us/SpeedometerGauge";
import {
  Page,
  Card,
  Body,
  Heading,
  Hero,
  Button,
  colors,
  styles,
} from "../../src/us/ui";
export default function Coach() {
  const s = usePrep(),
    t = useT(),
    { release } = useContent(),
    start = useStartStudy(release);
  const topics = analyzeProgress(s.attempts, s.state, s.profile),
    task = chooseTask(topics),
    attempts = s.attempts.filter(
      (a) => a.state === s.state && matchesStudyProfile(s.profile, a.profile),
    ),
    answered = attempts.reduce(
      (n, a) => n + a.result.correct + a.result.wrong,
      0,
    ),
    correct = attempts.reduce((n, a) => n + a.result.correct, 0),
    accuracy = answered ? Math.round((correct / answered) * 100) : 0;
  const message = t(
    task.kind === "start"
      ? "coachIntro"
      : task.kind === "recover"
        ? "coachRecover"
        : task.kind === "review"
          ? "coachWeak"
          : task.kind === "calibrate"
            ? "coachCalibrate"
            : "coachMaintain",
  );
  return (
    <Page title={t("coach")} eyebrow={t("coachEyebrow")} icon={BrainCircuit}>
      <Card>
        <View style={styles.row}>
          <View
            style={{
              padding: 10,
              borderRadius: 13,
              backgroundColor: "#EEF2FF",
            }}
          >
            <MessageSquare color={colors.purple} size={20} />
          </View>
          <Text
            style={[
              styles.eyebrow,
              { color: colors.purple, flex: 1, marginBottom: 0 },
            ]}
          >
            {t("coachAssessment")}
          </Text>
        </View>
        <Body>{message}</Body>
      </Card>
      <Card>
        <Text style={styles.eyebrow}>{t("accuracy")}</Text>
        <SpeedometerGauge
          score={accuracy}
          color={answered ? colors.green : "#94A3B8"}
          label={answered ? t("accuracy") : t("noData")}
          hasData={answered > 0}
        />
        <View style={styles.row}>
          {[
            {
              n: topics.filter(
                (x) => x.accuracy >= 85 && x.uniqueQuestions >= 10,
              ).length,
              label: t("strongTopics"),
              color: "#059669",
              bg: "#ECFDF5",
            },
            {
              n: topics.filter((x) => x.accuracy < 60 && x.uniqueQuestions >= 5)
                .length,
              label: t("focusTopics"),
              color: "#E11D48",
              bg: "#FFF1F2",
            },
            {
              n: topics.length,
              label: t("topics"),
              color: "#475569",
              bg: "#F8FAFC",
            },
          ].map((x) => (
            <View
              key={x.label}
              style={{
                flex: 1,
                alignItems: "center",
                padding: 13,
                borderRadius: 18,
                backgroundColor: x.bg,
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 23, fontWeight: "900", color: x.color }}>
                {x.n}
              </Text>
              <Text style={{ fontSize: 10, fontWeight: "700", color: x.color }}>
                {x.label}
              </Text>
            </View>
          ))}
        </View>
        <Body>{t("noPrediction")}</Body>
      </Card>
      <Hero
        label={t("personalTask")}
        title={task.topic ?? t("quick")}
        body={message}
        action={t("openTask")}
        onPress={() => start("practice", task.topic)}
        icon={task.kind === "recover" ? TrendingDown : Target}
        color={task.kind === "recover" ? "#D97706" : "#4F46E5"}
      />
      <Button secondary title={t("studyPlan")} onPress={() => router.push({ pathname: "/study-tools", params: { kind: "plan" } })} />
      <Heading>{t("topicProgress")}</Heading>
      {topics.length ? (
        topics.map((topic) => (
          <Card key={topic.topic}>
            <Heading>{topic.topic}</Heading>
            <Body>
              {topic.accuracy}% · {topic.uniqueQuestions} {t("total")}
            </Body>
            <View
              style={{
                height: 7,
                borderRadius: 5,
                backgroundColor: "#F1F5F9",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 7,
                  width: `${topic.accuracy}%`,
                  backgroundColor: colors.purple,
                }}
              />
            </View>
            <Button
              secondary
              title={t("practice")}
              onPress={() => start("practice", topic.topic)}
            />
          </Card>
        ))
      ) : (
        <Card>
          <BookOpen color={colors.purple} size={25} />
          <Body>{t("noProgress")}</Body>
        </Card>
      )}
    </Page>
  );
}
