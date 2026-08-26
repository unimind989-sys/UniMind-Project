import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  renderFoundationEvaluationMarkdown,
  runFoundationEvaluation,
} from "../evals/runners/foundation-evaluation";

const datasetPath = path.resolve(
  process.argv[2] ??
    "evals/datasets/foundation/foundation-availability-v1.jsonl",
);
const outputDirectory = path.resolve(
  process.argv[3] ?? "test-results/evaluation",
);
const report = runFoundationEvaluation(await readFile(datasetPath, "utf8"));

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(
    path.join(outputDirectory, "foundation-evaluation.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  ),
  writeFile(
    path.join(outputDirectory, "foundation-evaluation.md"),
    renderFoundationEvaluationMarkdown(report),
    "utf8",
  ),
]);

if (report.status !== "PASS") {
  throw new Error(
    `Foundation evaluation failed ${String(report.failedCases)} of ${String(report.totalCases)} cases.`,
  );
}
console.log(
  `Foundation evaluation passed ${String(report.passedCases)} versioned synthetic cases.`,
);
