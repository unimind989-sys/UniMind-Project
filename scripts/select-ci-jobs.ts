import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

import {
  inspectPrMergeParents,
  loadCiPathConfig,
  selectCiJobs,
} from "./lib/conditional-ci-selector";

const config = loadCiPathConfig();

const event = process.env.GITHUB_EVENT_NAME;
if (
  event !== "pull_request" &&
  event !== "push" &&
  event !== "workflow_dispatch"
)
  throw new Error(`Unsupported CI event: ${String(event)}`);

let changedPaths: string[] | undefined;
let baseMoved = false;
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
  const verified = inspectPrMergeParents(
    parentLine,
    baseSha ?? "",
    headSha ?? "",
  );
  if (verified.kind === "BASE_MOVED") {
    baseMoved = true;
    console.log(
      `::notice::PR base moved to ${verified.checkedOutBaseSha} after the event; running every job.`,
    );
  } else
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
  config,
  event,
  ...(changedPaths === undefined ? {} : { changedPaths }),
  databaseFeedback:
    event === "workflow_dispatch" && process.env.DATABASE_FEEDBACK === "true",
  baseMoved,
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
