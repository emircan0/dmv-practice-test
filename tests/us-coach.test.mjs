import test from "node:test";
import assert from "node:assert/strict";
import { analyzeProgress, chooseTask } from "../src/us/coach.ts";
const attempt = (id, state, correct, offset = 0) => ({
  state,
  profile: "adult-first",
  completedAt: id,
  questions: Array.from({ length: 5 }, (_, i) => ({
    id: String(offset + i),
    topic: "signs",
    correctIndex: 0,
  })),
  answers: Object.fromEntries(
    Array.from({ length: 5 }, (_, i) => [
      String(offset + i),
      i < correct ? 0 : 1,
    ]),
  ),
});
test("coach ignores other states and profiles and detects recent decline", () => {
  const data = [
    attempt(1, "CA", 5),
    attempt(2, "CA", 2, 5),
    attempt(3, "NY", 5),
    { ...attempt(4, "CA", 5), profile: "teen-first" },
  ];
  const topics = analyzeProgress(data, "CA", "adult-first");
  assert.equal(topics[0].answered, 10);
  assert.equal(topics[0].accuracy, 70);
  assert.equal(topics[0].recentAccuracy, 40);
  assert.equal(topics[0].trend, "declining");
  assert.equal(chooseTask(topics).kind, "recover");
});
test("repeated questions do not masquerade as broad topic coverage", () => {
  const topics = analyzeProgress(
    [attempt(1, "CA", 5), attempt(2, "CA", 5)],
    "CA",
    "adult-first",
  );
  assert.equal(topics[0].uniqueQuestions, 5);
  assert.equal(topics[0].trend, "steady");
});
test("new learners receive a start task with no invented scores", () => {
  assert.deepEqual(analyzeProgress([], "CA", "adult-first"), []);
  assert.deepEqual(chooseTask([]), { kind: "start" });
});
