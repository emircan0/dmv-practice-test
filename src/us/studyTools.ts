import { analyzeProgress, type TopicInsight } from "./coach.ts";
import { matchesStudyProfile } from "./studyProfiles.ts";
import type { Attempt, CandidateProfile, Mode, Question } from "./model.ts";

export type StudyToolKind = "plan" | "report";
export interface PlanDay {
  day: number;
  date: string;
  mode: Mode;
  topic?: string;
  goal: number;
}
export interface StudyToolArtifact {
  id: string;
  kind: StudyToolKind;
  state: string;
  profile: CandidateProfile;
  createdAt: number;
  sessions: number;
  answered: number;
  correct: number;
  uniqueQuestions: number;
  topics: TopicInsight[];
  days: PlanDay[];
}
export const STUDY_TOOL_COST = 3;

export function buildStudyTool(attempts: Attempt[], state: string, profile: CandidateProfile,
  kind: StudyToolKind, pool: Question[], now = Date.now()): StudyToolArtifact {
  const scoped = attempts.filter((attempt) => attempt.state === state &&
    matchesStudyProfile(profile, attempt.profile) && attempt.questions.some((q) => attempt.answers[q.id] !== undefined));
  const topics = analyzeProgress(scoped, state, profile);
  let answered = 0, correct = 0;
  const unique = new Set<string>();
  for (const attempt of scoped) for (const q of attempt.questions) {
    if (attempt.answers[q.id] === undefined) continue;
    answered++;
    if (attempt.answers[q.id] === q.correctIndex) correct++;
    unique.add(q.id);
  }
  if (answered < 10 || unique.size < 5) throw new Error("study_data_needed");
  if (kind === "plan" && !pool.length) throw new Error("content_needed");
  const available = topics.filter((topic) => pool.some((q) => q.topic === topic.topic));
  const focus = (index: number) => available[index % Math.max(available.length, 1)]?.topic;
  const tasks: { mode: Mode; topic?: string }[] = [
    { mode: "practice", topic: focus(0) }, { mode: "practice", topic: focus(1) },
    { mode: correct < answered ? "mistakes" : "daily" },
    { mode: "practice", topic: focus(2) }, { mode: "practice", topic: focus(0) },
    { mode: "practice" }, { mode: "practice" },
  ];
  return {
    id: `tool-${kind}-${now}-${Math.random().toString(36).slice(2)}`,
    kind, state, profile, createdAt: now, sessions: scoped.length,
    answered, correct, uniqueQuestions: unique.size, topics,
    days: kind === "plan" ? tasks.map((task, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() + index);
      return { ...task, day: index + 1, date: date.toISOString(),
        goal: Math.min(task.mode === "daily" ? 5 : 10,
          pool.filter((q) => !task.topic || q.topic === task.topic).length) };
    }) : [],
  };
}

// Build/validate before spending. Save or credit-write errors restore the old
// in-memory balance/snapshot; no network or asynchronous identity switch here.
export function generateStudyTool<T>(create: () => T, access: {
  premium: boolean; credits: number;
  save: (artifact: T) => void; remove: (artifact: T) => void;
  setCredits: (credits: number) => void;
}): T {
  const artifact = create();
  if (!access.premium && (!Number.isFinite(access.credits) || access.credits < STUDY_TOOL_COST))
    throw new Error("insufficient_credits");
  try {
    access.save(artifact);
    if (!access.premium) access.setCredits(access.credits - STUDY_TOOL_COST);
  } catch (error) {
    access.remove(artifact);
    if (!access.premium) access.setCredits(access.credits);
    throw error;
  }
  return artifact;
}
