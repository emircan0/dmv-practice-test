import { readFileSync, writeFileSync } from "node:fs";
import { composeRelease } from "../src/us/contentAuthoring.ts";

const [catalogPath, draftPath, outputPath] = process.argv.slice(2);
if (!catalogPath || !draftPath || !outputPath) {
  console.error("Usage: npm run compose:content -- shared-catalog.json state-draft.json output-release.json");
  process.exit(1);
}
try {
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const draft = JSON.parse(readFileSync(draftPath, "utf8"));
  const release = composeRelease(draft, catalog);
  // Avoid overwriting an existing draft, catalog or release.
  writeFileSync(outputPath, JSON.stringify(release, null, 2) + "\n", { flag: "wx" });
  console.log(`Prepared ${release.state}/${release.profile}: ${release.questions.length} questions, ${release.lessons.length} lessons. No upload performed.`);
} catch (error) {
  console.error(`Composition failed: ${error.message}`);
  process.exit(1);
}
