import { readFile } from "node:fs/promises";

import { auditCiWorkflow } from "./lib/ci-workflow-policy";

const workflowPath = ".github/workflows/ci.yml";
const violations = auditCiWorkflow(await readFile(workflowPath, "utf8"));
if (violations.length > 0) {
  for (const violation of violations) {
    console.error(`${workflowPath}: ${violation}`);
  }
  throw new Error(
    `CI workflow policy audit found ${String(violations.length)} violation(s).`,
  );
}
console.log("CI workflow syntax and policy audit passed.");
