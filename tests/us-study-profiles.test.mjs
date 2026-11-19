import test from "node:test";
import assert from "node:assert/strict";
import { canStartRelease, matchesStudyProfile } from "../src/us/studyProfiles.ts";
import { composeRelease } from "../src/us/contentAuthoring.ts";

test("general study accepts only common practice, with age-specific packages limited to exams", () => {
  const release = (profile, state = "CA") => ({ state, profile });
  assert.equal(canStartRelease("CA", "general-first", release("general-first"), "practice"), true);
  for (const profile of ["adult-first", "teen-first"]) {
    assert.equal(canStartRelease("CA", "general-first", release(profile), "exam"), true);
    for (const mode of ["practice", "daily", "favorites", "mistakes"]) {
      assert.equal(canStartRelease("CA", "general-first", release(profile), mode), false);
    }
  }
  assert.equal(canStartRelease("CA", "general-first", release("teen-first", "NY"), "exam"), false);
  assert.equal(canStartRelease("CA", "adult-first", release("teen-first"), "exam"), false);
});

test("general study retains visibility of historical age-specific attempts", () => {
  for (const profile of ["general-first", "adult-first", "teen-first"]) {
    assert.equal(matchesStudyProfile("general-first", profile), true);
  }
  assert.equal(matchesStudyProfile("adult-first", "teen-first"), false);
});

test("common packages require explicit general applicability instead of relabeling adult content", () => {
  const source = { title: "Fixture", url: "https://example.org/ca", section: "Fixture", reviewedAt: "2026-11-04" };
  const content = { id: "shared-1", topic: "road-signs", prompt: "Fixture", options: ["A", "B"], correctIndex: 0, explanation: "Fixture explanation" };
  const draft = { id: "fixture", version: "test", state: "CA", profile: "general-first", vehicle: "car", language: "en", publishedAt: "2026-11-04", rule: null, questions: [], lessons: [] };
  const catalog = { questions: [{ content, applicability: [{ state: "CA", profile: "adult-first", source }] }], lessons: [] };
  assert.throws(() => composeRelease(draft, catalog), /no_questions/);
  catalog.questions[0].applicability.push({ state: "CA", profile: "general-first", source });
  assert.equal(composeRelease(draft, catalog).questions.length, 1);
});
