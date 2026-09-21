import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { stringify } from "yaml";

import {
  assessConditionalCiEvidence,
  assessEvidenceReceipt,
  classifyChangedPaths,
  deriveAgentExecution,
  loadAgentExecutionPolicy,
  type AgentExecutionFlags,
  type AgentExecutionInput,
  type ModelFloor,
  type Risk,
  type Surface,
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

function changedPaths(baseRef = "origin/main"): string[] {
  const explicit = valuesAfter("--path");
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
  const untracked = execFileSync(
    "git",
    ["ls-files", "--others", "--exclude-standard"],
    { encoding: "utf8", windowsHide: true },
  );
  return Array.from(
    new Set(
      `${output}\n${working}\n${untracked}`
        .split(/\r?\n/u)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

const task = valueAfter("--task");
const pass = valueAfter("--pass");
if (task === undefined || (pass !== "intent" && pass !== "actual-diff")) {
  throw new Error(
    "Usage: pnpm agent:route -- --task WPXX-TYY --pass intent|actual-diff --surface <surface> [--surface ...] [--flag <name>] [--path <path>] [--active-model luna-max|sol-high] [--receipt <path>] [--ci-evidence <path>] [--format json|yaml]",
  );
}

const flags = Object.fromEntries(
  valuesAfter("--flag").map((name) => [name, true]),
) as AgentExecutionFlags;
const workerCountValue = valueAfter("--worker-count");
const input: AgentExecutionInput = {
  task,
  pass,
  declaredSurfaces: valuesAfter("--surface") as Surface[],
  changedPaths: changedPaths(),
  flags,
  proceduralSkills: valuesAfter("--skill"),
  explicitChecks: valuesAfter("--check"),
  ...(valueAfter("--risk") === undefined
    ? {}
    : { requestedRisk: valueAfter("--risk") as Risk }),
  ...(valueAfter("--previous-model") === undefined
    ? {}
    : { previousModelFloor: valueAfter("--previous-model") as ModelFloor }),
  ...(valueAfter("--active-model") === undefined
    ? {}
    : { activeModel: valueAfter("--active-model") as ModelFloor }),
  ...(workerCountValue === undefined
    ? {}
    : { workerCount: Number.parseInt(workerCountValue, 10) }),
  ...(process.argv.includes("--nested-worker") ? { nestedWorker: true } : {}),
};

const policy = loadAgentExecutionPolicy();
const result = deriveAgentExecution(policy, input);
const receiptPath = valueAfter("--receipt");
const receiptValue =
  receiptPath === undefined
    ? undefined
    : (JSON.parse(readFileSync(path.resolve(receiptPath), "utf8")) as unknown);
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
        }),
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
    ? receiptOutput
    : {
        ...receiptOutput,
        conditionalCiAssessment: assessConditionalCiEvidence(
          policy,
          conditionalCiEvidenceValue,
        ),
      };
if (valueAfter("--format") === "json") {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(stringify(output));
}
