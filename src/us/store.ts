import type { StudyToolArtifact } from "./studyTools";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Locale,
  CandidateProfile,
  Attempt,
  ActiveSession,
  Mode,
  ContentRelease,
} from "./model";
import { matchesStudyProfile, canStartRelease } from "./studyProfiles";
import { isTargetState } from "./states";
import { assembleExam, evaluate, shuffle } from "./engine";
export const favoriteKey = (
  state: string,
  profile: CandidateProfile,
  id: string,
) => `${state}:${profile}:${id}`;
interface PrepState {
  studyOwner: string;
  hydrated: boolean;
  locale: Locale;
  state: string;
  profile: CandidateProfile;
  onboarded: boolean;
  favorites: string[];
  attempts: Attempt[];
  tools: StudyToolArtifact[];
  saveTool: (artifact: StudyToolArtifact) => void;
  removeTool: (id: string) => void;
  active: ActiveSession | null;
  setHydrated: () => void;
  configure: (state: string, profile?: CandidateProfile) => void;
  setLocale: (locale: Locale) => void;
  toggleFavorite: (
    id: string,
    state?: string,
    profile?: CandidateProfile,
  ) => void;
  start: (release: ContentRelease, mode: Mode, topic?: string) => void;
  answer: (index: number) => void;
  next: () => void;
  previous: () => void;
  finish: () => string | null;
  discard: () => void;
  clearProgress: () => void;
}
export const usePrep = create<PrepState>()(
  persist(
    (set, get) => ({
      studyOwner: "guest",
      hydrated: false,
      locale: "en",
      state: "CA",
      profile: "general-first",
      onboarded: false,
      favorites: [],
      attempts: [],
      tools: [],
      saveTool: (artifact) => set((state) => ({ tools: [artifact, ...state.tools].slice(0, 20) })),
      removeTool: (id) => set((state) => ({ tools: state.tools.filter((tool) => tool.id !== id) })),
      active: null,
      // Only the current study scope changes; persisted sessions/results retain
      // their original profiles and rule snapshots.
      setHydrated: () => set({ hydrated: true, profile: "general-first" }),
      configure: (state, profile = "general-first") => {
        if (!isTargetState(state)) throw new Error("unsupported_state");
        set({ state, profile, onboarded: true, active: null });
      },
      setLocale: (locale) => set({ locale }),
      toggleFavorite: (id, state, profile) =>
        set((s) => {
          const key = favoriteKey(state ?? s.state, profile ?? s.profile, id);
          return {
            favorites: s.favorites.includes(key)
              ? s.favorites.filter((x) => x !== key)
              : [...s.favorites, key],
          };
        }),
      start: (release, mode, topic) => {
        const s = get();
        if (!canStartRelease(s.state, s.profile, release, mode))
          throw new Error("invalid_release");
        let questions = release.questions;
        if (topic) questions = questions.filter((q) => q.topic === topic);
        if (mode === "favorites")
          questions = questions.filter((q) =>
            ["general-first", "adult-first", "teen-first"].some((profile) =>
              matchesStudyProfile(s.profile, profile) && s.favorites.includes(favoriteKey(s.state, profile as CandidateProfile, q.id))),
          );
        if (mode === "mistakes") {
          const last = new Map<string, boolean>();
          [...s.attempts]
            .filter((a) => a.state === s.state && matchesStudyProfile(s.profile, a.profile))
            .sort((a, b) => a.completedAt - b.completedAt)
            .forEach((a) =>
              a.questions.forEach((q) => {
                if (a.answers[q.id] !== undefined)
                  last.set(q.id, a.answers[q.id] === q.correctIndex);
              }),
            );
          questions = questions.filter((q) => last.get(q.id) === false);
        }
        if (mode === "exam" && !release.rule) throw new Error("rules_pending");
        questions =
          mode === "exam"
            ? assembleExam(questions, release.rule!)
            : shuffle(questions).slice(0, mode === "daily" ? 5 : 10);
        if (!questions.length) throw new Error("no_questions");
        set({
          active: {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2),
            state: s.state,
            profile: release.profile,
            releaseId: release.id,
            releaseVersion: release.version,
            mode,
            startedAt: Date.now(),
            rule: mode === "exam" ? release.rule : null,
            questions,
            answers: {},
            index: 0,
          },
        });
      },
      answer: (index) =>
        set((s) => {
          const a = s.active;
          if (!a) return {};
          const q = a.questions[a.index];
          if (
            !q ||
            !Number.isInteger(index) ||
            index < 0 ||
            index >= q.options.length ||
            (a.mode !== "exam" && a.answers[q.id] !== undefined)
          )
            return {};
          if (
            a.rule?.durationSeconds &&
            Date.now() >= a.startedAt + a.rule.durationSeconds * 1000
          )
            return {};
          return { active: { ...a, answers: { ...a.answers, [q.id]: index } } };
        }),
      next: () =>
        set((s) =>
          s.active
            ? {
                active: {
                  ...s.active,
                  index: Math.min(
                    s.active.index + 1,
                    s.active.questions.length - 1,
                  ),
                },
              }
            : {},
        ),
      previous: () =>
        set((s) =>
          s.active
            ? {
                active: { ...s.active, index: Math.max(0, s.active.index - 1) },
              }
            : {},
        ),
      finish: () => {
        const a = get().active;
        if (!a) return null;
        const attempt: Attempt = {
          ...a,
          completedAt: Date.now(),
          result: evaluate(a.questions, a.answers, a.rule),
        };
        set((s) => ({
          attempts: [attempt, ...s.attempts].slice(0, 100),
          active: null,
        }));
        return attempt.id;
      },
      discard: () => set({ active: null }),
      clearProgress: () => set({ active: null, attempts: [], favorites: [], tools: [] }),
    }),
    {
      name: "dmv-smart-prep:v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        studyOwner: s.studyOwner,
        locale: s.locale,
        state: s.state,
        profile: s.profile,
        onboarded: s.onboarded,
        favorites: s.favorites,
        attempts: s.attempts,
        tools: s.tools,
        active: s.active,
      }),
      onRehydrateStorage: () => () => usePrep.getState().setHydrated(),
    },
  ),
);
