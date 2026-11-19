import { matchesStudyProfile } from "../../src/us/studyProfiles";
import { BarChart3 } from "lucide-react-native";
import React from "react";
import { router } from "expo-router";
import { usePrep } from "../../src/us/store";
import { useT } from "../../src/us/i18n";
import { stateName } from "../../src/us/states";
import { Page, Card, Body, Heading, Button } from "../../src/us/ui";
export default function Progress() {
  const t = useT(),
    s = usePrep(),
    attempts = s.attempts.filter(
      (a) => a.state === s.state && matchesStudyProfile(s.profile, a.profile),
    );
  const topics: Record<string, { correct: number; answered: number }> = {};
  attempts.forEach((a) =>
    a.questions.forEach((q) => {
      if (a.answers[q.id] === undefined) return;
      const topic = topics[q.topic] ?? { correct: 0, answered: 0 };
      topic.answered++;
      if (a.answers[q.id] === q.correctIndex) topic.correct++;
      topics[q.topic] = topic;
    }),
  );
  return (
    <Page icon={BarChart3} title={t("progress")} subtitle={stateName(s.state)}>
      <Button secondary title={t("advancedReport")} onPress={() => router.push({ pathname: "/study-tools", params: { kind: "report" } })} />
      <Card>
        <Heading>
          {attempts.length} {t("sessions")}
        </Heading>
        <Body>{t("local")}</Body>
        {!attempts.length && <Body>{t("noProgress")}</Body>}
      </Card>
      {!!attempts.length && (
        <>
          <Card>
            <Heading>{t("topicProgress")}</Heading>
            {Object.entries(topics).map(([topic, n]) => (
              <Body key={topic}>
                {topic} · {n.correct}/{n.answered} ·{" "}
                {Math.round((n.correct / n.answered) * 100)}%
              </Body>
            ))}
            <Body>{t("noPrediction")}</Body>
          </Card>
          <Card>
            <Heading>{t("recent")}</Heading>
            {attempts.slice(0, 10).map((a) => (
              <Button
                key={a.id}
                secondary
                title={`${a.result.correct}/${a.result.total} · ${new Date(a.completedAt).toLocaleDateString(s.locale === "en" ? "en-US" : "tr-TR")}`}
                onPress={() =>
                  router.push({
                    pathname: "/quiz/result",
                    params: { id: a.id },
                  })
                }
              />
            ))}
          </Card>
        </>
      )}
    </Page>
  );
}
