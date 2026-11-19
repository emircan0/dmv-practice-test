import type { ContentRelease, Mode } from "./model.ts";

// General study combines history in the selected state. Release/session snapshots
// keep their original profile so old results and exam rules remain accurate.
export const matchesStudyProfile = (selected: string, recorded: string) =>
  selected === "general-first" || selected === recorded;

export function canStartRelease(
  state: string,
  profile: string,
  release: ContentRelease,
  mode: Mode,
) {
  return release.state === state && (
    release.profile === profile ||
    (profile === "general-first" && mode === "exam" &&
      ["adult-first", "teen-first"].includes(release.profile))
  );
}
