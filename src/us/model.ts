export type Locale = "en" | "tr";
export type CandidateProfile = "general-first" | "adult-first" | "teen-first";
export type Mode = "practice" | "exam" | "mistakes" | "favorites" | "daily";
export interface ExamRule {
  id: string;
  version: string;
  state: string;
  vehicle: "car";
  profile: CandidateProfile;
  questionCount: number;
  minimumCorrect: number;
  durationSeconds: number | null;
  sections: { topic: string; questionCount: number; minimumCorrect: number }[];
  verifiedAt: string;
  sourceUrl: string;
}
export interface Source {
  title: string;
  url: string;
  section: string;
  reviewedAt: string;
}
export interface Question {
  id: string;
  topic: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: Source;
  imageUrl?: string;
}
export interface Lesson {
  id: string;
  topic: string;
  title: string;
  body: string;
  source: Source;
}
export interface ContentRelease {
  id: string;
  version: string;
  state: string;
  vehicle: "car";
  profile: CandidateProfile;
  language: "en";
  publishedAt: string;
  rule: ExamRule | null;
  questions: Question[];
  lessons: Lesson[];
}
export interface Evaluation {
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
  percentage: number;
  passed: boolean | null;
  sections: { topic: string; correct: number; required: number }[];
}
export interface Attempt {
  id: string;
  state: string;
  profile: CandidateProfile;
  releaseId: string;
  releaseVersion: string;
  mode: Mode;
  startedAt: number;
  completedAt: number;
  rule: ExamRule | null;
  questions: Question[];
  answers: Record<string, number>;
  result: Evaluation;
}
export interface ActiveSession {
  id: string;
  state: string;
  profile: CandidateProfile;
  releaseId: string;
  releaseVersion: string;
  mode: Mode;
  startedAt: number;
  rule: ExamRule | null;
  questions: Question[];
  answers: Record<string, number>;
  index: number;
}
