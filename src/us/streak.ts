import { matchesStudyProfile } from "./studyProfiles.ts";
import type { Attempt } from "./model.ts";
export function studyStreak(
  attempts: Attempt[],
  state: string,
  profile: string,
  now = new Date(),
): number {
  const day = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const completed = new Set(
    attempts
      .filter(
        (a) =>
          a.state === state &&
          matchesStudyProfile(profile, a.profile) &&
          a.mode === "daily" &&
          a.result.correct + a.result.wrong > 0,
      )
      .map((a) => day(new Date(a.completedAt))),
  );
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  if (!completed.has(day(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (completed.has(day(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
