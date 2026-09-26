import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  assessConditionalCiEvidence,
  deriveAgentExecution,
  loadAgentExecutionPolicy,
  validateAgentExecutionPolicy,
  type AgentExecutionInput,
} from "./lib/agent-execution-policy";

const policy = loadAgentExecutionPolicy();
const failures = validateAgentExecutionPolicy(policy);
if (policy.activation.conditional_ci === "ENFORCED") {
  const workflow = readFileSync(
    path.resolve(policy.conditional_ci.enforcement.workflow_path),
  );
  const workflowSha256 = createHash("sha256").update(workflow).digest("hex");
  if (workflowSha256 !== policy.conditional_ci.enforcement.workflow_sha256) {
    failures.push(
      "conditional_ci ENFORCED workflow SHA-256 does not match the governed policy fingerprint",
    );
  }
  try {
    const evidence = JSON.parse(
      readFileSync(
        "evidence/wp00-pilot/conditional-ci-shadow-evidence.json",
        "utf8",
      ),
    ) as unknown;
    if (
      assessConditionalCiEvidence(policy, evidence).recommendedState !== "READY"
    ) {
      failures.push(
        "conditional_ci ENFORCED requires complete current-policy readiness evidence",
      );
    }
  } catch {
    failures.push(
      "conditional_ci ENFORCED readiness evidence is missing or malformed",
    );
  }
}
for (const [name, reference] of Object.entries(policy.references)) {
  if (!path.isAbsolute(reference) && !readable(reference)) {
    failures.push(`missing ${name} reference: ${reference}`);
  }
}

const fixture = JSON.parse(
  readFileSync(
    path.resolve("tests/fixtures/agent-execution/historical-cases.json"),
    "utf8",
  ),
) as { cases?: Array<{ name?: string; input?: AgentExecutionInput }> };
const conditionalCiFixture = JSON.parse(
  readFileSync(
    path.resolve("tests/fixtures/agent-execution/conditional-ci-cases.json"),
    "utf8",
  ),
) as {
  cases?: Array<{
    id?: string;
    input?: AgentExecutionInput;
    expected?: Record<string, "RUN" | "WOULD_SKIP">;
  }>;
};
if (!Array.isArray(fixture.cases) || fixture.cases.length < 10) {
  failures.push("historical regression fixture must contain at least 10 cases");
} else {
  for (const historicalCase of fixture.cases) {
    if (
      historicalCase.name === undefined ||
      historicalCase.input === undefined
    ) {
      failures.push("historical regression case is missing name or input");
      continue;
    }
    try {
      deriveAgentExecution(policy, historicalCase.input);
    } catch (error) {
      failures.push(
        `${historicalCase.name}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

const requiredConditionalCiCases =
  policy.conditional_ci.readiness.required_regression_cases;
if (!Array.isArray(conditionalCiFixture.cases)) {
  failures.push("conditional-CI regression fixture must contain cases");
} else {
  const fixtureCaseIds = conditionalCiFixture.cases
    .map((item) => item.id)
    .filter((item): item is string => item !== undefined)
    .sort();
  if (
    JSON.stringify(fixtureCaseIds) !==
    JSON.stringify([...requiredConditionalCiCases].sort())
  ) {
    failures.push(
      "conditional-CI regression fixture must exactly cover the policy readiness cases",
    );
  }
  for (const regressionCase of conditionalCiFixture.cases) {
    if (
      regressionCase.id === undefined ||
      regressionCase.input === undefined ||
      regressionCase.expected === undefined
    ) {
      failures.push("conditional-CI regression case is incomplete");
      continue;
    }
    try {
      const predictions = Object.fromEntries(
        deriveAgentExecution(policy, regressionCase.input).ci.predictions.map(
          (prediction) => [prediction.id, prediction.action],
        ),
      );
      if (
        JSON.stringify(predictions) !== JSON.stringify(regressionCase.expected)
      ) {
        failures.push(
          `${regressionCase.id}: conditional-CI predictions do not match the regression fixture`,
        );
      }
    } catch (error) {
      failures.push(
        `${regressionCase.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  throw new Error(
    `Agent execution policy validation found ${String(failures.length)} failure(s).`,
  );
}

console.log(
  `Agent execution policy v${String(policy.policy_version)} passed schema, reference, ${String(fixture.cases?.length ?? 0)} historical-case, and ${String(conditionalCiFixture.cases?.length ?? 0)} conditional-CI regression checks; conditional CI is ${policy.activation.conditional_ci}.`,
);

function readable(relativePath: string): boolean {
  try {
    readFileSync(path.resolve(relativePath));
    return true;
  } catch {
    return false;
  }
}
