import { matchesStudyProfile } from "./studyProfiles.ts";
import type { Attempt } from "./model.ts";
export interface TopicInsight {
  topic: string;
  answered: number;
  uniqueQuestions: number;
  accuracy: number;
  recentAccuracy: number;
  trend: "improving" | "declining" | "steady";
}
// Adapted from the original AI Hoca's practice-analysis and task-selection flow.
// This is local study guidance; it does not estimate a real exam pass probability.
export function analyzeProgress(
  attempts: Attempt[],
  state: string,
  profile: string,
): TopicInsight[] {
  const topics = new Map<string, { id: string; correct: boolean }[]>();
  [...attempts]
    .filter((a) => a.state === state && matchesStudyProfile(profile, a.profile))
    .sort((a, b) => a.completedAt - b.completedAt)
    .forEach((a) =>
      a.questions.forEach((q) => {
        if (a.answers[q.id] === undefined) return;
        const rows = topics.get(q.topic) ?? [];
        rows.push({ id: q.id, correct: a.answers[q.id] === q.correctIndex });
        topics.set(q.topic, rows);
      }),
    );
  return Array.from(topics, ([topic, rows]) => {
    const rate = (items: typeof rows) =>
      Math.round((items.filter((r) => r.correct).length / items.length) * 100);
    const recentAccuracy = rate(rows.slice(-5)),
      previous = rows.slice(-10, -5);
    const difference =
      previous.length === 5 ? recentAccuracy - rate(previous) : 0;
    return {
      topic,
      answered: rows.length,
      uniqueQuestions: new Set(rows.map((r) => r.id)).size,
      accuracy: rate(rows),
      recentAccuracy,
      trend:
        difference >= 20
          ? ("improving" as const)
          : difference <= -20
            ? ("declining" as const)
            : ("steady" as const),
    };
  }).sort((a, b) => a.accuracy - b.accuracy);
}
export function chooseTask(topics: TopicInsight[]): {
  kind: "start" | "calibrate" | "review" | "recover" | "maintain";
  topic?: string;
} {
  const declining = topics.find((x) => x.trend === "declining");
  if (declining) return { kind: "recover", topic: declining.topic };
  const weak = topics.find((x) => x.accuracy < 60 && x.uniqueQuestions >= 5);
  if (weak) return { kind: "review", topic: weak.topic };
  const low = topics.find((x) => x.uniqueQuestions < 5);
  if (low) return { kind: "calibrate", topic: low.topic };
  return topics.length
    ? { kind: "maintain", topic: topics[0].topic }
    : { kind: "start" };
}
