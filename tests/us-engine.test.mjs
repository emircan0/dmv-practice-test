import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluate,
  assembleExam,
  validateRelease,
  isExamRule,
} from "../src/us/engine.ts";
const source = {
  title: "Official handbook",
  url: "https://dmv.ny.gov/book/export/html/1551",
  section: "Chapter 1",
  reviewedAt: "2026-10-30",
};
const q = (id, topic = "rules") => ({
  id: String(id),
  topic,
  prompt: "Fixture only",
  options: ["A", "B", "C"],
  correctIndex: 0,
  explanation: "Fixture explanation",
  source,
});
const rule = {
  id: "ny-fixture",
  version: "test-only",
  state: "NY",
  profile: "adult-first",
  vehicle: "car",
  questionCount: 20,
  minimumCorrect: 14,
  durationSeconds: null,
  sections: [{ topic: "road-signs", questionCount: 4, minimumCorrect: 2 }],
  verifiedAt: "2026-10-30",
  sourceUrl: source.url,
};
const questions = Array.from({ length: 20 }, (_, i) =>
  q(i, i < 4 ? "road-signs" : "rules"),
);
const answers = (ids) => Object.fromEntries(ids.map((i) => [String(i), 0]));
test("NY: total threshold cannot override the signs requirement", () => {
  assert.equal(
    evaluate(
      questions,
      answers([0, ...Array.from({ length: 13 }, (_, i) => i + 4)]),
      rule,
    ).passed,
    false,
  );
  assert.equal(
    evaluate(
      questions,
      answers([0, 1, ...Array.from({ length: 12 }, (_, i) => i + 4)]),
      rule,
    ).passed,
    true,
  );
  assert.equal(
    evaluate(
      questions,
      answers([0, 1, ...Array.from({ length: 11 }, (_, i) => i + 4)]),
      rule,
    ).passed,
    false,
  );
});
test("integer thresholds decide pass even if displayed percentage rounds up", () => {
  const qs = Array.from({ length: 201 }, (_, i) => q(i));
  const r = { ...rule, questionCount: 201, minimumCorrect: 161, sections: [] };
  const result = evaluate(
    qs,
    answers(Array.from({ length: 160 }, (_, i) => i)),
    r,
  );
  assert.equal(result.percentage, 80);
  assert.equal(result.passed, false);
});
test("50-question boundary fixture: 39 fails and 40 passes", () => {
  const qs = Array.from({ length: 50 }, (_, i) => q(i));
  const r = { ...rule, questionCount: 50, minimumCorrect: 40, sections: [] };
  assert.equal(
    evaluate(qs, answers(Array.from({ length: 39 }, (_, i) => i)), r).passed,
    false,
  );
  assert.equal(
    evaluate(qs, answers(Array.from({ length: 40 }, (_, i) => i)), r).passed,
    true,
  );
});
test("exam assembly honors topic quotas without duplicate questions", () => {
  const exam = assembleExam([...questions, q(21, "road-signs"), q(22)], rule);
  assert.equal(exam.length, 20);
  assert.equal(exam.filter((q) => q.topic === "road-signs").length, 4);
  assert.equal(new Set(exam.map((q) => q.id)).size, 20);
  assert.throws(
    () => assembleExam(questions.slice(1), rule),
    /insufficient_content/,
  );
  assert.throws(
    () => assembleExam([...questions, questions[0]], rule),
    /duplicate_questions/,
  );
});
test("practice has no official pass judgment; wrong assembly fails closed", () => {
  assert.equal(evaluate(questions, {}, null).passed, null);
  assert.equal(
    evaluate(
      questions.slice(4),
      answers(Array.from({ length: 20 }, (_, i) => i)),
      rule,
    ).passed,
    false,
  );
});
const release = {
  id: "release",
  version: "1",
  state: "NY",
  profile: "adult-first",
  vehicle: "car",
  language: "en",
  publishedAt: "2026-10-30",
  rule,
  questions,
  lessons: [],
};
test("release boundary rejects mixed states, profiles and missing source metadata", () => {
  assert.equal(validateRelease(release, "NY", "adult-first").id, "release");
  assert.throws(() => validateRelease(release, "CA", "adult-first"));
  assert.throws(() => validateRelease(release, "NY", "teen-first"));
  assert.throws(() =>
    validateRelease(
      { ...release, questions: [{ ...questions[0], source: {} }] },
      "NY",
      "adult-first",
    ),
  );
  assert.throws(() =>
    validateRelease(
      { ...release, questions: [{ ...questions[0], correctIndex: 3 }] },
      "NY",
      "adult-first",
    ),
  );
  assert.throws(() =>
    validateRelease(
      { ...release, questions: [questions[0], questions[0]] },
      "NY",
      "adult-first",
    ),
  );
  assert.throws(() =>
    validateRelease(
      { ...release, rule: { ...rule, verifiedAt: "2099-01-01" } },
      "NY",
      "adult-first",
    ),
  );
});
test("unknown or impossible rules never enable an exam", () => {
  assert.equal(
    isExamRule({ ...rule, minimumCorrect: 21 }, "NY", "adult-first"),
    false,
  );
  assert.equal(
    isExamRule(
      { ...rule, sections: [...rule.sections, ...rule.sections] },
      "NY",
      "adult-first",
    ),
    false,
  );
  assert.equal(
    isExamRule(
      { ...rule, sourceUrl: "http://example.com" },
      "NY",
      "adult-first",
    ),
    false,
  );
});
