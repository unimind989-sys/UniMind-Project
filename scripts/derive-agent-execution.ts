import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { stringify } from "yaml";

import {
  assessConditionalCiEvidence,
  assessLocalStablePreparation,
  assessEvidenceReceipt,
  buildEvidenceReceipt,
  classifyChangedPaths,
  deriveAgentExecution,
  hashPreparation,
  loadAgentExecutionPolicy,
  selectLocalStableTask,
  type AgentExecutionFlags,
  type AgentExecutionInput,
  type Risk,
  type Surface,
  type DesignDisposition,
} from "./lib/agent-execution-policy";

function valuesAfter(name: string): string[] {
  const values: string[] = [];
  for (let index = 0; index < process.argv.length; index++) {
    if (process.argv[index] === name && process.argv[index + 1] !== undefined) {
      values.push(process.argv[index + 1] as string);
    }
  }
  return values;
}

function valueAfter(name: string): string | undefined {
  return valuesAfter(name)[0];
}

function changedPaths(baseRef = "origin/main", allowExplicit = true): string[] {
  const explicit = allowExplicit ? valuesAfter("--path") : [];
  if (explicit.length > 0) return explicit;
  const output = execFileSync(
    "git",
    baseRef === "origin/main"
      ? ["diff", "--name-only", "--merge-base", "HEAD", baseRef]
      : ["diff", "--name-only", baseRef],
    { encoding: "utf8", windowsHide: true },
  );
  const working = execFileSync("git", ["diff", "--name-only"], {
    encoding: "utf8",
    windowsHide: true,
  });
  const staged = execFileSync("git", ["diff", "--cached", "--name-only"], {
    encoding: "utf8",
    windowsHide: true,
  });
  const untracked = execFileSync(
    "git",
    ["ls-files", "--others", "--exclude-standard"],
    { encoding: "utf8", windowsHide: true },
  );
  return Array.from(
    new Set(
      `${output}\n${working}\n${staged}\n${untracked}`
        .split(/\r?\n/u)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function field(record: string, name: string): string | undefined {
  return record
    .match(new RegExp(`^\\*\\*${name}:\\*\\*[ \\t]*(.+)$`, "mu"))?.[1]
    ?.trim();
}

function canonicalContract(record: string): string {
  return ["Task ID", "Verify", "Pass", "Hard stop"]
    .map((name) => `${name}:${field(record, name) ?? ""}`)
    .join("\n");
}

function preparationFingerprint(
  recordPath: string,
  record: string,
  paths: string[],
): string {
  const head = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
    windowsHide: true,
  }).trim();
  const entries: Array<[string, string]> = paths
    .filter(
      (candidate) =>
        !/^evidence\/[^/]+\/\d{4}-\d{2}-\d{2}_[^/]+\.md$/u.test(candidate) &&
        !/^(test-results|playwright-report)\//u.test(candidate),
    )
    .sort()
    .map((candidate) => {
      if (!existsSync(candidate)) return [candidate, "DELETED"];
      let content = readFileSync(candidate);
      if (path.resolve(candidate) === path.resolve(recordPath)) {
        const normalized = content
          .toString("utf8")
          .replace(
            /^\*\*(Design disposition|Design evidence|Preparation review|Preparation fingerprint|Unresolved findings|Established facts):\*\*.*$/gmu,
            "**$1:** <preparation>",
          );
        content = Buffer.from(normalized);
      }
      const blob = execFileSync("git", ["hash-object", "--stdin"], {
        input: content,
        encoding: "utf8",
        windowsHide: true,
      }).trim();
      return [candidate, blob];
    });
  return hashPreparation(head, entries, canonicalContract(record));
}

function verifyLocal(): never {
  const state = JSON.parse(
    execFileSync(
      "pwsh",
      ["-NoProfile", "-File", "scripts/show-work-state.ps1", "-Format", "Json"],
      { encoding: "utf8", windowsHide: true },
    ),
  ) as {
    activeTaskRecords: Array<{
      taskId: string;
      status: string;
      record: string;
    }>;
  };
  const active = state.activeTaskRecords.filter(
    (item) => item.status === "IN_PROGRESS",
  );
  const explicitTask = valueAfter("--task");
  const selectedId = selectLocalStableTask(
    active.map((item) => item.taskId),
    explicitTask,
  );
  const selected = active.find((item) => item.taskId === selectedId);
  if (selected === undefined)
    throw new Error("Selected task is absent from work state.");
  const record = readFileSync(selected.record, "utf8");
  const required = [
    "Task ID",
    "Verify",
    "Pass",
    "Hard stop",
    "Design disposition",
    "Design evidence",
    "Preparation review",
    "Preparation fingerprint",
    "Unresolved findings",
    "Commands",
  ];
  for (const name of required)
    if (!field(record, name)) throw new Error(`Task record lacks ${name}.`);
  if (field(record, "Task ID") !== selected.taskId)
    throw new Error("Task identity differs from active work state.");
  const changed = changedPaths("origin/main", false);
  const policy = loadAgentExecutionPolicy();
  const receiptReference = field(record, "Design evidence");
  const receiptPath =
    receiptReference?.match(/receipt:([^;\s]+\.json)/u)?.[1] ??
    (receiptReference?.endsWith(".json") ? receiptReference : undefined);
  const receipt = receiptPath
    ? (JSON.parse(readFileSync(receiptPath, "utf8")) as unknown)
    : undefined;
  const acceptedCandidate =
    typeof receipt === "object" &&
    receipt !== null &&
    "candidate" in receipt &&
    typeof receipt.candidate === "string"
      ? receipt.candidate
      : undefined;
  const result = deriveAgentExecution(policy, {
    task: selected.taskId,
    pass: "proof-preflight",
    declaredSurfaces: [],
    changedPaths: changed,
    designDisposition: field(record, "Design disposition") as DesignDisposition,
    ...(receiptReference === undefined
      ? {}
      : { designEvidence: receiptReference }),
    designReceipt: receipt,
    changesSinceAcceptance: acceptedCandidate
      ? changedPaths(acceptedCandidate, false)
      : [],
    candidateHead: execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
      windowsHide: true,
    }).trim(),
    explicitChecks: (field(record, "Verify") ?? "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean),
  });
  const fingerprint = preparationFingerprint(selected.record, record, changed);
  const failures = assessLocalStablePreparation({
    commands: field(record, "Commands") ?? "NOT RUN",
    review: field(record, "Preparation review") ?? "PENDING",
    unresolvedFindings: field(record, "Unresolved findings") ?? "UNKNOWN",
    recordedFingerprint:
      field(record, "Preparation fingerprint") ?? "NOT_READY",
    currentFingerprint: fingerprint,
    proofPreflight: result.proofPreflight,
    requiresIndependentReview: ["Reviewer", "Verify", "Hard stop"].some(
      (name) =>
        /\bindependent review required\b/iu.test(field(record, name) ?? ""),
    ),
  });
  console.log(
    JSON.stringify(
      {
        task: selected.taskId,
        preparationFingerprint: fingerprint,
        proofPreflight: result.proofPreflight,
        ready: failures.length === 0,
        failures,
      },
      null,
      2,
    ),
  );
  if (failures.length > 0) process.exit(1);
  if (!process.argv.includes("--dry-run")) {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };
    const chain = packageJson.scripts?.["verify:ci"];
    if (typeof chain !== "string" || chain.trim().length === 0)
      throw new Error("CI verification chain is missing.");
    const run = spawnSync(chain, {
      stdio: "inherit",
      shell: true,
      windowsHide: true,
    });
    process.exit(run.status ?? 1);
  }
  process.exit(0);
}

if (process.argv.includes("--verify-local")) verifyLocal();

const task = valueAfter("--task");
const pass = valueAfter("--pass");
if (
  task === undefined ||
  (pass !== "intent" && pass !== "actual-diff" && pass !== "proof-preflight")
) {
  throw new Error(
    "Usage: pnpm agent:route -- --task WPXX-TYY --pass intent|actual-diff|proof-preflight --surface <surface> [--surface ...] [--flag <name>] [--path <path>] [--receipt <path>] [--emit-receipt-candidate <sha> --passed-check <id> ...] [--ci-evidence <path>] [--format json|yaml]",
  );
}

const flags = Object.fromEntries(
  valuesAfter("--flag").map((name) => [name, true]),
) as AgentExecutionFlags;
if (
  process.argv.includes("--previous-model") ||
  process.argv.includes("--active-model")
) {
  throw new Error(
    "Model selection is manual; record work-block assignments in the task record.",
  );
}
if (
  valuesAfter("--flag").some(
    (name) => name === "designJudgment" || name === "humanVisualDecision",
  )
) {
  throw new Error(
    "Legacy design Booleans cannot establish policy-v6 frontend readiness.",
  );
}
const receiptPath = valueAfter("--receipt");
const receiptValue =
  receiptPath === undefined
    ? undefined
    : (JSON.parse(readFileSync(path.resolve(receiptPath), "utf8")) as unknown);
const acceptedCandidate =
  typeof receiptValue === "object" &&
  receiptValue !== null &&
  "candidate" in receiptValue &&
  typeof receiptValue.candidate === "string"
    ? receiptValue.candidate
    : undefined;
const designDispositionArg = valueAfter("--design-disposition");
const designEvidenceArg = valueAfter("--design-evidence");
const workerCountValue = valueAfter("--worker-count");
const input: AgentExecutionInput = {
  task,
  pass,
  declaredSurfaces: valuesAfter("--surface") as Surface[],
  changedPaths: changedPaths(),
  flags,
  proceduralSkills: valuesAfter("--skill"),
  explicitChecks: valuesAfter("--check"),
  ...(designDispositionArg === undefined
    ? {}
    : { designDisposition: designDispositionArg as DesignDisposition }),
  ...(designEvidenceArg === undefined
    ? {}
    : { designEvidence: designEvidenceArg }),
  designReceipt: receiptValue,
  changesSinceAcceptance: acceptedCandidate
    ? changedPaths(acceptedCandidate)
    : [],
  candidateHead: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
    windowsHide: true,
  }).trim(),
  ...(valueAfter("--risk") === undefined
    ? {}
    : { requestedRisk: valueAfter("--risk") as Risk }),
  ...(workerCountValue === undefined
    ? {}
    : { workerCount: Number.parseInt(workerCountValue, 10) }),
  ...(process.argv.includes("--nested-worker") ? { nestedWorker: true } : {}),
};

const policy = loadAgentExecutionPolicy();
const result = deriveAgentExecution(policy, input);
const receiptCandidate =
  typeof receiptValue === "object" &&
  receiptValue !== null &&
  "candidate" in receiptValue &&
  typeof receiptValue.candidate === "string" &&
  /^[a-f0-9]{7,40}$/u.test(receiptValue.candidate)
    ? receiptValue.candidate
    : undefined;
const evidenceChangedPaths =
  receiptCandidate === undefined
    ? input.changedPaths
    : changedPaths(receiptCandidate);
const evidenceSurfaces = classifyChangedPaths(
  policy,
  evidenceChangedPaths,
  true,
).surfaces;
const receiptOutput =
  receiptValue === undefined
    ? result
    : {
        ...result,
        evidence: assessEvidenceReceipt(policy, receiptValue, {
          task,
          surfaces: evidenceSurfaces,
          changedPaths: evidenceChangedPaths,
          flags,
          ...(input.designDisposition === undefined
            ? {}
            : { designDisposition: input.designDisposition }),
          ...(input.designEvidence === undefined
            ? {}
            : { designEvidence: input.designEvidence }),
        }),
      };
const generatedReceiptCandidate = valueAfter("--emit-receipt-candidate");
if (
  generatedReceiptCandidate !== undefined &&
  valueAfter("--decision-actor") !== undefined
) {
  const kind = execFileSync(
    "git",
    ["cat-file", "-t", generatedReceiptCandidate],
    { encoding: "utf8", windowsHide: true },
  ).trim();
  if (kind !== "commit")
    throw new Error("Founder acceptance must name an existing Git commit.");
}
const generatedReceiptOutput =
  generatedReceiptCandidate === undefined
    ? receiptOutput
    : {
        ...receiptOutput,
        generatedReceipt: buildEvidenceReceipt(
          policy,
          result,
          generatedReceiptCandidate,
          valuesAfter("--passed-check"),
          valueAfter("--decision-actor") === undefined
            ? undefined
            : {
                decisionActor: valueAfter("--decision-actor") as
                  "Ahmed" | "Ziad",
                decisionReference: valueAfter("--decision-reference") ?? "",
                decisionTimestamp: valueAfter("--decision-timestamp") ?? "",
                acceptedScope: valueAfter("--accepted-scope") ?? "",
              },
        ),
      };
const conditionalCiEvidencePath = valueAfter("--ci-evidence");
const conditionalCiEvidenceValue =
  conditionalCiEvidencePath === undefined
    ? undefined
    : (JSON.parse(
        readFileSync(path.resolve(conditionalCiEvidencePath), "utf8"),
      ) as unknown);
const output =
  conditionalCiEvidenceValue === undefined
    ? generatedReceiptOutput
    : {
        ...generatedReceiptOutput,
        conditionalCiAssessment: assessConditionalCiEvidence(
          policy,
          conditionalCiEvidenceValue,
        ),
      };
if (pass === "proof-preflight") {
  try {
    const state = JSON.parse(
      execFileSync(
        "pwsh",
        [
          "-NoProfile",
          "-File",
          "scripts/show-work-state.ps1",
          "-Format",
          "Json",
        ],
        { encoding: "utf8", windowsHide: true },
      ),
    ) as { activeTaskRecords: Array<{ taskId: string; record: string }> };
    const active = state.activeTaskRecords.find((item) => item.taskId === task);
    if (active !== undefined) {
      const record = readFileSync(active.record, "utf8");
      Object.assign(output, {
        preparationFingerprint: preparationFingerprint(
          active.record,
          record,
          input.changedPaths,
        ),
      });
    }
  } catch {
    /* A missing task record remains an explicit guard failure. */
  }
}
if (valueAfter("--format") === "json") {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(stringify(output));
}
