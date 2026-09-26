import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  assessConditionalCiEvidence,
  loadAgentExecutionPolicy,
  validateAgentExecutionPolicy,
} from "./lib/agent-execution-policy";
import {
  assertExactPrMergeParents,
  selectCiJobs,
} from "./lib/conditional-ci-selector";

const policy = loadAgentExecutionPolicy();
const policyFailures = validateAgentExecutionPolicy(policy);
if (policyFailures.length > 0)
  throw new Error(`Invalid agent policy: ${policyFailures.join("; ")}`);
if (policy.activation.conditional_ci !== "ENFORCED")
  throw new Error("Conditional CI selector requires ENFORCED policy state.");

const workflow = readFileSync(
  path.resolve(policy.conditional_ci.enforcement.workflow_path),
);
const actualWorkflowHash = createHash("sha256").update(workflow).digest("hex");
if (actualWorkflowHash !== policy.conditional_ci.enforcement.workflow_sha256)
  throw new Error(
    "CI workflow does not match the governed policy fingerprint.",
  );

const evidence = JSON.parse(
  readFileSync(
    "evidence/wp00-pilot/conditional-ci-shadow-evidence.json",
    "utf8",
  ),
) as unknown;
const readiness = assessConditionalCiEvidence(policy, evidence);
if (readiness.recommendedState !== "READY")
  throw new Error(
    "Conditional CI lacks complete current-policy readiness evidence.",
  );

const event = process.env.GITHUB_EVENT_NAME;
if (
  event !== "pull_request" &&
  event !== "push" &&
  event !== "workflow_dispatch"
)
  throw new Error(`Unsupported CI event: ${String(event)}`);

let changedPaths: string[] | undefined;
if (event === "pull_request") {
  const baseSha = process.env.PR_BASE_SHA;
  const headSha = process.env.PR_HEAD_SHA;
  const parentLine = execFileSync(
    "git",
    ["rev-list", "--parents", "-n", "1", "HEAD"],
    {
      encoding: "utf8",
    },
  );
  const verified = assertExactPrMergeParents(
    parentLine,
    baseSha ?? "",
    headSha ?? "",
  );
  changedPaths = execFileSync(
    "git",
    [
      "diff",
      "--name-only",
      "--no-renames",
      "-z",
      verified.baseSha,
      verified.headSha,
    ],
    { encoding: "utf8" },
  )
    .split("\0")
    .filter(Boolean);
}

const selection = selectCiJobs({
  policy,
  event,
  ...(changedPaths === undefined ? {} : { changedPaths }),
  databaseFeedback:
    event === "workflow_dispatch" && process.env.DATABASE_FEEDBACK === "true",
});
const allSkipped =
  event === "pull_request" &&
  selection.dependencyAudit === "WOULD_SKIP" &&
  selection.application === "WOULD_SKIP" &&
  selection.databaseCi === "WOULD_SKIP";
const output = process.env.GITHUB_OUTPUT;
if (output === undefined || output.length === 0)
  throw new Error("GITHUB_OUTPUT is missing.");
appendFileSync(
  output,
  [
    `dependency_audit=${selection.dependencyAudit}`,
    `application=${selection.application}`,
    `database_ci=${selection.databaseCi}`,
    `all_skipped=${String(allSkipped)}`,
  ].join("\n") + "\n",
);
console.log(
  JSON.stringify({
    event,
    base: event === "pull_request" ? process.env.PR_BASE_SHA : undefined,
    head: event === "pull_request" ? process.env.PR_HEAD_SHA : undefined,
    changedPaths,
    selection,
    allSkipped,
  }),
);
