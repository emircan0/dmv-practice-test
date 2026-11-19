import test from "node:test";
import assert from "node:assert/strict";
import { studyStreak } from "../src/us/streak.ts";
const now = new Date(2026, 9, 30, 12);
const attempt = (day, extra = {}) => ({
  state: "CA",
  profile: "adult-first",
  mode: "daily",
  completedAt: new Date(2026, 9, day, 12).getTime(),
  result: { correct: 3, wrong: 2 },
  ...extra,
});
test("daily streak counts calendar days once and preserves yesterday before today is complete", () => {
  assert.equal(
    studyStreak(
      [attempt(29), attempt(29), attempt(28)],
      "CA",
      "adult-first",
      now,
    ),
    2,
  );
  assert.equal(
    studyStreak(
      [attempt(30), attempt(29), attempt(28)],
      "CA",
      "adult-first",
      now,
    ),
    3,
  );
});
test("streak excludes another state/profile, non-daily sessions and unanswered sessions", () => {
  assert.equal(
    studyStreak(
      [
        attempt(30, { state: "NY" }),
        attempt(29, { profile: "teen-first" }),
        attempt(30, { mode: "practice" }),
        attempt(29, { result: { correct: 0, wrong: 0 } }),
      ],
      "CA",
      "adult-first",
      now,
    ),
    0,
  );
  assert.equal(studyStreak([attempt(27)], "CA", "adult-first", now), 0);
});
