import type {
  ExamRule,
  Question,
  Evaluation,
  ContentRelease,
} from "./model.ts";

export function evaluate(
  questions: Question[],
  answers: Record<string, number>,
  rule: ExamRule | null,
): Evaluation {
  const correct = questions.filter(
    (q) => answers[q.id] === q.correctIndex,
  ).length;
  const answered = questions.filter(
    (q) =>
      Number.isInteger(answers[q.id]) &&
      answers[q.id] >= 0 &&
      answers[q.id] < q.options.length,
  ).length;
  const sections = (rule?.sections ?? []).map((s) => ({
    topic: s.topic,
    correct: questions.filter(
      (q) => q.topic === s.topic && answers[q.id] === q.correctIndex,
    ).length,
    required: s.minimumCorrect,
  }));
  const validAssembly =
    !!rule &&
    questions.length === rule.questionCount &&
    new Set(questions.map((q) => q.id)).size === questions.length &&
    rule.sections.every(
      (s) =>
        questions.filter((q) => q.topic === s.topic).length === s.questionCount,
    );
  return {
    correct,
    wrong: answered - correct,
    unanswered: questions.length - answered,
    total: questions.length,
    percentage: questions.length
      ? Math.round((correct / questions.length) * 100)
      : 0,
    passed: rule
      ? validAssembly &&
        correct >= rule.minimumCorrect &&
        sections.every((s) => s.correct >= s.required)
      : null,
    sections,
  };
}
export function shuffle<T>(
  items: T[],
  random: () => number = Math.random,
): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function assembleExam(
  questions: Question[],
  rule: ExamRule,
): Question[] {
  const selected: Question[] = [];
  if (new Set(questions.map((q) => q.id)).size !== questions.length)
    throw new Error("duplicate_questions");
  for (const section of rule.sections) {
    const pool = shuffle(questions.filter((q) => q.topic === section.topic));
    if (pool.length < section.questionCount)
      throw new Error("insufficient_content");
    selected.push(...pool.slice(0, section.questionCount));
  }
  const remaining = rule.questionCount - selected.length;
  const sectionTopics = new Set(rule.sections.map((s) => s.topic));
  const rest = shuffle(questions.filter((q) => !sectionTopics.has(q.topic)));
  if (remaining < 0 || rest.length < remaining)
    throw new Error("insufficient_content");
  return shuffle([...selected, ...rest.slice(0, remaining)]);
}
function object(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function nonempty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
function date(value: unknown): boolean {
  return (
    typeof value === "string" &&
    Number.isFinite(Date.parse(value)) &&
    Date.parse(value) <= Date.now()
  );
}
function source(value: unknown): boolean {
  return (
    object(value) &&
    nonempty(value.title) &&
    nonempty(value.section) &&
    /^https:\/\//.test(value.url) &&
    date(value.reviewedAt)
  );
}
export function isExamRule(
  value: unknown,
  state: string,
  profile: string,
): value is ExamRule {
  if (!object(value)) return false;
  return (
    nonempty(value.id) &&
    nonempty(value.version) &&
    value.state === state &&
    value.vehicle === "car" &&
    value.profile === profile &&
    Number.isInteger(value.questionCount) &&
    value.questionCount > 0 &&
    Number.isInteger(value.minimumCorrect) &&
    value.minimumCorrect > 0 &&
    value.minimumCorrect <= value.questionCount &&
    (value.durationSeconds === null ||
      (Number.isInteger(value.durationSeconds) && value.durationSeconds > 0)) &&
    date(value.verifiedAt) &&
    /^https:\/\//.test(value.sourceUrl) &&
    Array.isArray(value.sections) &&
    new Set(value.sections.map((s: any) => s?.topic)).size ===
      value.sections.length &&
    value.sections.every(
      (s: any) =>
        object(s) &&
        nonempty(s.topic) &&
        Number.isInteger(s.questionCount) &&
        s.questionCount > 0 &&
        Number.isInteger(s.minimumCorrect) &&
        s.minimumCorrect >= 0 &&
        s.minimumCorrect <= s.questionCount,
    ) &&
    value.sections.reduce((sum: number, s: any) => sum + s.questionCount, 0) <=
      value.questionCount
  );
}
// Fail closed: no mixed states, draft rules, incomplete explanations or unreviewed sources.
export function validateRelease(
  value: unknown,
  state: string,
  profile: string,
): ContentRelease {
  if (
    !object(value) ||
    !nonempty(value.id) ||
    !nonempty(value.version) ||
    value.state !== state ||
    value.profile !== profile ||
    value.vehicle !== "car" ||
    value.language !== "en" ||
    !date(value.publishedAt) ||
    !Array.isArray(value.questions) ||
    !Array.isArray(value.lessons) ||
    (value.rule !== null && !isExamRule(value.rule, state, profile))
  )
    throw new Error("invalid_release");
  if (
    new Set(value.questions.map((q: any) => q?.id)).size !==
      value.questions.length ||
    !value.questions.every(
      (q: any) =>
        object(q) &&
        nonempty(q.id) &&
        nonempty(q.topic) &&
        nonempty(q.prompt) &&
        nonempty(q.explanation) &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        q.options.every(nonempty) &&
        new Set(q.options).size === q.options.length &&
        Number.isInteger(q.correctIndex) &&
        q.correctIndex >= 0 &&
        q.correctIndex < q.options.length &&
        source(q.source) &&
        (!q.imageUrl || /^https:\/\//.test(q.imageUrl)),
    ) ||
    !value.lessons.every(
      (l: any) =>
        object(l) &&
        nonempty(l.id) &&
        nonempty(l.topic) &&
        nonempty(l.title) &&
        nonempty(l.body) &&
        source(l.source),
    )
  )
    throw new Error("invalid_release");
  return value as unknown as ContentRelease;
}
