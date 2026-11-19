import test from "node:test";
import assert from "node:assert/strict";
import { composeRelease } from "../src/us/contentAuthoring.ts";
import { STATES } from "../src/us/states.ts";

const source = (state) => ({ title: `${state} handbook fixture`, url: `https://example.org/${state}`, section: "Test only", reviewedAt: "2026-11-04" });
const content = { id: "shared-1", topic: "road-signs", prompt: "Fixture only", options: ["A", "B"], correctIndex: 0, explanation: "Fixture explanation" };
const draft = (state = "CA", profile = "adult-first") => ({ id: "fixture", version: "test", state, profile, vehicle: "car", language: "en", publishedAt: "2026-11-04", rule: null, questions: [], lessons: [] });
const catalog = { questions: [{ content, applicability: [{ state: "CA", profile: "adult-first", source: source("CA") }, { state: "TX", profile: "adult-first", source: source("TX") }] }], lessons: [] };

test("launch scope contains exactly the agreed eight states in rollout order", () => {
  assert.deepEqual(STATES.map((state) => state.code), ["CA", "TX", "FL", "NY", "PA", "IL", "OH", "GA"]);
});
test("one canonical question resolves to each state's own reviewed source", () => {
  const ca = composeRelease(draft(), catalog);
  const tx = composeRelease(draft("TX"), catalog);
  assert.equal(ca.questions[0].id, tx.questions[0].id);
  assert.equal(ca.questions[0].source.url, "https://example.org/CA");
  assert.equal(tx.questions[0].source.url, "https://example.org/TX");
  assert.equal(ca.rule, null);
  assert.equal(catalog.questions[0].content.source, undefined);
});
test("material is never automatically shared across states or candidate profiles", () => {
  assert.throws(() => composeRelease(draft("NY"), catalog), /no_questions/);
  assert.throws(() => composeRelease(draft("CA", "teen-first"), catalog), /no_questions/);
  assert.throws(() => composeRelease(draft("WA"), catalog), /unsupported_state/);
});
test("missing review data and duplicate shared/local identities block composition", () => {
  const invalid = structuredClone(catalog);
  invalid.questions[0].applicability[0].source.reviewedAt = "";
  assert.throws(() => composeRelease(draft(), invalid), /invalid_release/);
  const duplicate = draft();
  duplicate.questions = [{ ...content, source: source("CA") }];
  assert.throws(() => composeRelease(duplicate, catalog), /invalid_release/);
});
test("a rule from another state cannot be inherited by a composed release", () => {
  const value = draft();
  value.rule = { id: "tx-rule", version: "test", state: "TX", profile: "adult-first", vehicle: "car", questionCount: 1, minimumCorrect: 1, durationSeconds: null, sections: [], verifiedAt: "2026-11-04", sourceUrl: source("TX").url };
  assert.throws(() => composeRelease(value, catalog), /invalid_release/);
});
