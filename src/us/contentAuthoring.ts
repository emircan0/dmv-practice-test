import { assembleExam, validateRelease } from "./engine.ts";
import { isTargetState } from "./states.ts";
import type { CandidateProfile, ContentRelease, Lesson, Question, Source } from "./model.ts";

export interface Applicability {
  state: string;
  profile: CandidateProfile;
  source: Source;
}
export interface SharedCatalog {
  questions: { content: Omit<Question, "source">; applicability: Applicability[] }[];
  lessons: { content: Omit<Lesson, "source">; applicability: Applicability[] }[];
}

// Shared material is resolved during authoring. Mobile still receives one reviewed
// state/profile release, never a runtime fallback to another state's package.
export function composeRelease(draft: ContentRelease, catalog: SharedCatalog): ContentRelease {
  if (!isTargetState(draft.state)) throw new Error("unsupported_state");
  if (!["general-first", "adult-first", "teen-first"].includes(draft.profile)) throw new Error("unsupported_profile");
  function resolve<T>(items: { content: T; applicability: Applicability[] }[]) {
    return items.flatMap(({ content, applicability }) => {
      const matches = applicability.filter((entry) =>
        entry.state === draft.state && entry.profile === draft.profile);
      if (matches.length > 1) throw new Error("duplicate_applicability");
      return matches.map(({ source }) => ({ ...content, source }));
    });
  }
  const release = validateRelease({
    ...draft,
    questions: [...resolve(catalog.questions), ...draft.questions],
    lessons: [...resolve(catalog.lessons), ...draft.lessons],
  }, draft.state, draft.profile);
  if (new Set(release.lessons.map((lesson) => lesson.id)).size !== release.lessons.length)
    throw new Error("duplicate_lesson");
  if (!release.questions.length) throw new Error("no_questions");
  if (release.rule) assembleExam(release.questions, release.rule);
  return release;
}
