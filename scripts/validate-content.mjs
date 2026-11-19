import { readFileSync } from "node:fs";
import { validateRelease, assembleExam } from "../src/us/engine.ts";
const [file, state, profile] = process.argv.slice(2);
if (!file || !state || !profile) {
  console.error(
    "Usage: npm run validate:content -- release.json CA adult-first",
  );
  process.exit(1);
}
try {
  const release = validateRelease(
    JSON.parse(readFileSync(file, "utf8")),
    state,
    profile,
  );
  if (release.rule) assembleExam(release.questions, release.rule);
  console.log(
    `Valid release: ${release.questions.length} questions, ${release.lessons.length} lessons. No upload performed.`,
  );
} catch (e) {
  console.error(`Validation failed: ${e.message}`);
  process.exit(1);
}
