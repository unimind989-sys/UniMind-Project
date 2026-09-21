import { readFileSync } from "node:fs";
import path from "node:path";

import {
  deriveAgentExecution,
  loadAgentExecutionPolicy,
  validateAgentExecutionPolicy,
  type AgentExecutionInput,
} from "./lib/agent-execution-policy";

const policy = loadAgentExecutionPolicy();
const failures = validateAgentExecutionPolicy(policy);
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

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  throw new Error(
    `Agent execution policy validation found ${String(failures.length)} failure(s).`,
  );
}

console.log(
  `Agent execution policy v${String(policy.policy_version)} passed schema, reference, and ${String(fixture.cases?.length ?? 0)} historical-case checks; conditional CI remains SHADOW.`,
);

function readable(relativePath: string): boolean {
  try {
    readFileSync(path.resolve(relativePath));
    return true;
  } catch {
    return false;
  }
}
