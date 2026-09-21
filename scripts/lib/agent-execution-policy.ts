import { readFileSync } from "node:fs";
import path from "node:path";

import { parse } from "yaml";

const surfaceNames = [
  "docs",
  "frontend",
  "runtime",
  "auth",
  "data",
  "storage",
  "delivery",
  "tooling",
] as const;
const riskNames = ["R0", "R1", "R2", "R3"] as const;
const planningNames = ["minimal", "short", "deliberate", "protected"] as const;
const modelNames = ["luna-max", "sol-high"] as const;
const activationStates = ["SHADOW", "READY", "ENFORCED", "FALLBACK"] as const;
const activationRuleNames = [
  "routing",
  "model_routing",
  "worker_policy",
  "context_routing",
  "verification_selection",
  "evidence_reuse",
  "automatic_finalization",
  "conditional_ci",
] as const;

export type Surface = (typeof surfaceNames)[number];
export type Risk = (typeof riskNames)[number];
export type Planning = (typeof planningNames)[number];
export type ModelFloor = (typeof modelNames)[number];
export type ActivationState = (typeof activationStates)[number];

type SurfacePolicy = {
  risk_floor: Risk;
  capabilities: string[];
};

type PathWideningRule = {
  pattern: string;
  surfaces: Surface[];
};

type VerificationCheck = {
  id: string;
  stage: "edit-loop" | "stable-candidate" | "delivery";
  command: string;
  always?: boolean;
  surfaces?: Surface[];
  path_patterns?: string[];
};

export type AgentExecutionPolicy = {
  schema_version: number;
  policy_version: number;
  authority: string[];
  references: Record<string, string>;
  surface_order: Surface[];
  surfaces: Record<Surface, SurfacePolicy>;
  path_widening: PathWideningRule[];
  risk: {
    order: Risk[];
    planning_floor: Record<Risk, Planning>;
    model_floor: Record<Risk, ModelFloor>;
    protected_flags: string[];
    deliberate_flags: string[];
    sol_flags: string[];
  };
  workers: {
    default: number;
    maximum: number;
    nested: boolean;
    default_model: ModelFloor;
  };
  browser: {
    internal: "side-browser";
    external_chrome_flags: string[];
    playwright_cli_flags: string[];
  };
  verification: { checks: VerificationCheck[] };
  evidence: {
    schema_version: number;
    malformed: "missing";
    policy_version_mismatch: "missing";
    default_invalidation: Record<string, Surface[]>;
  };
  activation: Record<string, ActivationState> & {
    routing: ActivationState;
    model_routing: ActivationState;
    worker_policy: ActivationState;
    context_routing: ActivationState;
    verification_selection: ActivationState;
    evidence_reuse: ActivationState;
    automatic_finalization: ActivationState;
    conditional_ci: ActivationState;
  };
  self_correction: Record<string, unknown>;
};

export type AgentExecutionFlags = {
  architectureUncertainty?: boolean;
  authSemantics?: boolean;
  designJudgment?: boolean;
  destructiveMigration?: boolean;
  domainUncertainty?: boolean;
  explicitPlaywrightCli?: boolean;
  humanVisualDecision?: boolean;
  productionMutation?: boolean;
  rls?: boolean;
  securityUncertainty?: boolean;
  specialistBrowserDebug?: boolean;
  userRequestedView?: boolean;
};

export type AgentExecutionInput = {
  task: string;
  pass: "intent" | "actual-diff";
  declaredSurfaces: Surface[];
  changedPaths: string[];
  flags?: AgentExecutionFlags;
  requestedRisk?: Risk;
  previousModelFloor?: ModelFloor;
  workerCount?: number;
  nestedWorker?: boolean;
  proceduralSkills?: string[];
  explicitChecks?: string[];
};

export type AgentExecutionResult = {
  task: string;
  policyVersion: number;
  pass: "intent" | "actual-diff";
  surfaces: Surface[];
  risk: Risk;
  planning: Planning;
  modelFloor: ModelFloor;
  modelRuntimeStatus: "unverified";
  worker: { default: number; maximum: number; used: number; nested: false };
  capabilities: string[];
  proceduralSkills: string[];
  browser: {
    internal: "side-browser" | "none";
    externalChrome: boolean;
    playwrightCli: boolean;
  };
  verification: Array<{
    id: string;
    stage: string;
    command: string;
    reason: string;
  }>;
  ci: {
    mode: "broad";
    selectorState: ActivationState;
    predictionOnly: true;
  };
  finalization: {
    state: ActivationState;
    mode: "automatic" | "manual-recovery";
  };
  reasons: string[];
};

type EvidenceProof = {
  id: string;
  check: string;
  status: "PASS";
  invalidatedBy: {
    surfaces: Surface[];
    pathPatterns: string[];
  };
};

type EvidenceReceipt = {
  schemaVersion: number;
  policyVersion: number;
  task: string;
  candidate: string;
  proofs: EvidenceProof[];
};

export type EvidenceAssessment = {
  id: string;
  state: "REUSE" | "INVALID" | "MISSING";
  reason: string;
  sourceCandidate?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function matchesAny(value: string, patterns: string[]): boolean {
  return patterns.some((pattern) => new RegExp(pattern, "i").test(value));
}

function flagEnabled(flags: AgentExecutionFlags, name: string): boolean {
  return flags[name as keyof AgentExecutionFlags] === true;
}

function maximumByOrder<T extends string>(values: T[], order: readonly T[]): T {
  return values.reduce((maximum, current) =>
    order.indexOf(current) > order.indexOf(maximum) ? current : maximum,
  );
}

export function classifyChangedPaths(
  policy: AgentExecutionPolicy,
  changedPaths: string[],
  conservativeUnknown = false,
): { surfaces: Surface[]; reasons: string[] } {
  const surfaces = new Set<Surface>();
  const reasons: string[] = [];
  for (const changedPath of changedPaths) {
    const normalizedPath = changedPath.replaceAll("\\", "/");
    let matched = false;
    for (const rule of policy.path_widening) {
      if (new RegExp(rule.pattern, "i").test(normalizedPath)) {
        matched = true;
        for (const surface of rule.surfaces) {
          surfaces.add(surface);
          reasons.push(`path widening: ${normalizedPath} -> ${surface}`);
        }
      }
    }
    if (!matched && conservativeUnknown) {
      for (const surface of surfaceNames) surfaces.add(surface);
      reasons.push(`unknown path widened conservatively: ${normalizedPath}`);
    }
  }
  return {
    surfaces: policy.surface_order.filter((surface) => surfaces.has(surface)),
    reasons,
  };
}

export function loadAgentExecutionPolicy(
  policyPath = path.resolve("docs/agents/agent-execution-policy.yaml"),
): AgentExecutionPolicy {
  const parsed: unknown = parse(readFileSync(policyPath, "utf8"));
  if (!isRecord(parsed)) {
    throw new Error("Agent execution policy must be a YAML object.");
  }
  return parsed as AgentExecutionPolicy;
}

export function validateAgentExecutionPolicy(
  policy: AgentExecutionPolicy,
): string[] {
  const failures: string[] = [];
  if (policy.schema_version !== 1) {
    failures.push("schema_version must be 1");
  }
  if (!Number.isInteger(policy.policy_version) || policy.policy_version < 1) {
    failures.push("policy_version must be a positive integer");
  }
  if (JSON.stringify(policy.surface_order) !== JSON.stringify(surfaceNames)) {
    failures.push(
      "surface_order must contain each supported surface exactly once",
    );
  }
  for (const surface of surfaceNames) {
    if (policy.surfaces[surface] === undefined) {
      failures.push(`missing surface policy: ${surface}`);
      continue;
    }
    if (!riskNames.includes(policy.surfaces[surface].risk_floor)) {
      failures.push(`invalid risk floor for surface: ${surface}`);
    }
  }
  if (JSON.stringify(policy.risk.order) !== JSON.stringify(riskNames)) {
    failures.push("risk.order must be R0 through R3");
  }
  for (const risk of riskNames) {
    if (!planningNames.includes(policy.risk.planning_floor[risk])) {
      failures.push(`invalid planning floor for risk: ${risk}`);
    }
    if (!modelNames.includes(policy.risk.model_floor[risk])) {
      failures.push(`invalid model floor for risk: ${risk}`);
    }
  }
  if (policy.workers.default !== 0 || policy.workers.maximum !== 1) {
    failures.push("worker policy must default to zero and allow at most one");
  }
  if (policy.workers.nested !== false) {
    failures.push("nested workers must be disabled");
  }
  for (const rule of activationRuleNames) {
    const state = policy.activation[rule];
    if (!activationStates.includes(state)) {
      failures.push(`invalid activation state for ${rule}: ${state}`);
    }
  }
  if (policy.activation.conditional_ci !== "SHADOW") {
    failures.push("conditional_ci must remain SHADOW during WP00-T09");
  }
  for (const rule of policy.path_widening) {
    try {
      new RegExp(rule.pattern, "i");
    } catch {
      failures.push(`invalid path_widening regex: ${rule.pattern}`);
    }
  }
  const checkIds = policy.verification.checks.map((check) => check.id);
  if (new Set(checkIds).size !== checkIds.length) {
    failures.push("verification check ids must be unique");
  }
  return failures;
}

export function deriveAgentExecution(
  policy: AgentExecutionPolicy,
  input: AgentExecutionInput,
): AgentExecutionResult {
  const policyFailures = validateAgentExecutionPolicy(policy);
  if (policyFailures.length > 0) {
    throw new Error(`Invalid execution policy: ${policyFailures.join("; ")}`);
  }
  if (
    input.declaredSurfaces.some((surface) => !surfaceNames.includes(surface))
  ) {
    throw new Error("Input contains an unsupported execution surface.");
  }
  if (
    input.requestedRisk !== undefined &&
    !riskNames.includes(input.requestedRisk)
  ) {
    throw new Error("Input contains an unsupported risk tier.");
  }
  if (
    input.previousModelFloor !== undefined &&
    !modelNames.includes(input.previousModelFloor)
  ) {
    throw new Error("Input contains an unsupported previous model floor.");
  }
  const workerCount = input.workerCount ?? policy.workers.default;
  if (!Number.isInteger(workerCount) || workerCount < 0) {
    throw new Error("Worker count must be a non-negative integer.");
  }
  const workerMaximum =
    policy.activation.worker_policy === "ENFORCED"
      ? policy.workers.maximum
      : policy.workers.default;
  if (workerCount > workerMaximum) {
    throw new Error(
      `Maximum worker count is ${String(workerMaximum)}; received ${String(workerCount)}.`,
    );
  }
  if (input.nestedWorker === true) {
    throw new Error("Nested workers are prohibited by the execution policy.");
  }

  const surfaces = new Set<Surface>(input.declaredSurfaces);
  const reasons: string[] = input.declaredSurfaces.map(
    (surface) => `semantic classification: ${surface}`,
  );
  const pathClassification = classifyChangedPaths(policy, input.changedPaths);
  for (const surface of pathClassification.surfaces) {
    if (!surfaces.has(surface)) {
      reasons.push(
        ...pathClassification.reasons.filter((reason) =>
          reason.endsWith(` -> ${surface}`),
        ),
      );
    }
    surfaces.add(surface);
  }

  if (policy.activation.routing !== "ENFORCED") {
    for (const surface of surfaceNames) surfaces.add(surface);
    reasons.push(
      `routing ${policy.activation.routing.toLowerCase()} used conservative all-surface classification`,
    );
  }

  const flags = input.flags ?? {};
  if (flags.rls === true || flags.authSemantics === true) {
    surfaces.add("auth");
  }
  if (flags.rls === true || flags.destructiveMigration === true) {
    surfaces.add("data");
  }
  if (flags.productionMutation === true) {
    surfaces.add("delivery");
  }
  if (surfaces.size === 0) {
    throw new Error(
      "At least one semantic or path-derived surface is required.",
    );
  }

  const sortedSurfaces = policy.surface_order.filter((surface) =>
    surfaces.has(surface),
  );
  const risks = sortedSurfaces.map(
    (surface) => policy.surfaces[surface].risk_floor,
  );
  if (input.requestedRisk !== undefined) {
    risks.push(input.requestedRisk);
  }
  if (policy.risk.protected_flags.some((flag) => flagEnabled(flags, flag))) {
    risks.push("R3");
    reasons.push("protected semantic flag activated the R3 floor");
  }
  const risk = maximumByOrder(risks, policy.risk.order);

  let planning = policy.risk.planning_floor[risk];
  if (
    planning !== "protected" &&
    policy.risk.deliberate_flags.some((flag) => flagEnabled(flags, flag))
  ) {
    planning = "deliberate";
  }
  let modelFloor = policy.risk.model_floor[risk];
  if (policy.risk.sol_flags.some((flag) => flagEnabled(flags, flag))) {
    modelFloor = "sol-high";
    reasons.push("material uncertainty activated the Sol floor");
  }
  if (input.previousModelFloor === "sol-high") {
    modelFloor = "sol-high";
    reasons.push("sticky escalation preserved the Sol floor");
  }
  if (policy.activation.model_routing !== "ENFORCED") {
    modelFloor = "sol-high";
    reasons.push(
      `model routing ${policy.activation.model_routing.toLowerCase()} used the Sol floor`,
    );
  }

  const capabilitySurfaces =
    policy.activation.context_routing === "ENFORCED"
      ? sortedSurfaces
      : [...surfaceNames];
  const capabilities = Array.from(
    new Set(
      capabilitySurfaces.flatMap(
        (surface) => policy.surfaces[surface].capabilities,
      ),
    ),
  ).sort();
  const proceduralSkills = new Set(input.proceduralSkills ?? []);
  if (flags.designJudgment === true) {
    proceduralSkills.add("impeccable");
  }

  const verification = policy.verification.checks
    .filter((check) => {
      if (policy.activation.verification_selection !== "ENFORCED") return true;
      if (check.always === true) return true;
      if (check.surfaces?.some((surface) => surfaces.has(surface)) === true) {
        return true;
      }
      return input.changedPaths.some((changedPath) =>
        matchesAny(
          changedPath.replaceAll("\\", "/"),
          check.path_patterns ?? [],
        ),
      );
    })
    .map((check) => ({
      id: check.id,
      stage: check.stage,
      command: check.command,
      reason:
        check.always === true
          ? "universal delivery invariant"
          : "selected by affected surface or path",
    }));
  for (const explicitCheck of input.explicitChecks ?? []) {
    if (!verification.some((check) => check.id === explicitCheck)) {
      verification.push({
        id: explicitCheck,
        stage: "stable-candidate",
        command: explicitCheck,
        reason: "explicit runbook/task requirement",
      });
    }
  }

  const isFrontend = surfaces.has("frontend");
  return {
    task: input.task,
    policyVersion: policy.policy_version,
    pass: input.pass,
    surfaces: sortedSurfaces,
    risk,
    planning,
    modelFloor,
    modelRuntimeStatus: "unverified",
    worker: {
      default: policy.workers.default,
      maximum: workerMaximum,
      used: workerCount,
      nested: false,
    },
    capabilities,
    proceduralSkills: Array.from(proceduralSkills).sort(),
    browser: {
      internal: isFrontend ? policy.browser.internal : "none",
      externalChrome:
        isFrontend &&
        policy.browser.external_chrome_flags.some((flag) =>
          flagEnabled(flags, flag),
        ),
      playwrightCli:
        isFrontend &&
        policy.browser.playwright_cli_flags.some((flag) =>
          flagEnabled(flags, flag),
        ),
    },
    verification,
    ci: {
      mode: "broad",
      selectorState: policy.activation.conditional_ci,
      predictionOnly: true,
    },
    finalization: {
      state: policy.activation.automatic_finalization,
      mode:
        policy.activation.automatic_finalization === "ENFORCED"
          ? "automatic"
          : "manual-recovery",
    },
    reasons,
  };
}

function parseEvidenceReceipt(value: unknown): EvidenceReceipt | undefined {
  if (!isRecord(value) || !Array.isArray(value.proofs)) return undefined;
  if (
    typeof value.schemaVersion !== "number" ||
    typeof value.policyVersion !== "number" ||
    typeof value.task !== "string" ||
    typeof value.candidate !== "string" ||
    !/^[a-f0-9]{7,40}$/u.test(value.candidate)
  ) {
    return undefined;
  }
  const proofs: EvidenceProof[] = [];
  for (const proofValue of value.proofs) {
    if (!isRecord(proofValue) || !isRecord(proofValue.invalidatedBy)) {
      return undefined;
    }
    const invalidatedBy = proofValue.invalidatedBy;
    if (
      typeof proofValue.id !== "string" ||
      typeof proofValue.check !== "string" ||
      proofValue.status !== "PASS" ||
      !Array.isArray(invalidatedBy.surfaces) ||
      !invalidatedBy.surfaces.every(
        (surface) =>
          typeof surface === "string" &&
          surfaceNames.includes(surface as Surface),
      ) ||
      !Array.isArray(invalidatedBy.pathPatterns) ||
      !invalidatedBy.pathPatterns.every((pattern) => {
        if (typeof pattern !== "string") return false;
        try {
          new RegExp(pattern, "i");
          return true;
        } catch {
          return false;
        }
      })
    ) {
      return undefined;
    }
    proofs.push({
      id: proofValue.id,
      check: proofValue.check,
      status: "PASS",
      invalidatedBy: {
        surfaces: invalidatedBy.surfaces as Surface[],
        pathPatterns: invalidatedBy.pathPatterns as string[],
      },
    });
  }
  return {
    schemaVersion: value.schemaVersion,
    policyVersion: value.policyVersion,
    task: value.task,
    candidate: value.candidate,
    proofs,
  };
}

export function assessEvidenceReceipt(
  policy: AgentExecutionPolicy,
  receiptValue: unknown,
  current: { task: string; surfaces: Surface[]; changedPaths: string[] },
): EvidenceAssessment[] {
  const receipt = parseEvidenceReceipt(receiptValue);
  if (receipt === undefined) {
    return [
      {
        id: "unknown",
        state: "MISSING",
        reason: "malformed evidence fails toward fresh proof",
      },
    ];
  }
  if (
    policy.activation.evidence_reuse !== "ENFORCED" ||
    receipt.task !== current.task
  ) {
    return receipt.proofs.map((proof) => ({
      id: proof.id,
      state: "MISSING",
      reason:
        policy.activation.evidence_reuse !== "ENFORCED"
          ? `evidence reuse is ${policy.activation.evidence_reuse.toLowerCase()}`
          : "evidence belongs to a different task",
      sourceCandidate: receipt.candidate,
    }));
  }
  if (
    receipt.schemaVersion !== policy.evidence.schema_version ||
    receipt.policyVersion !== policy.policy_version
  ) {
    return receipt.proofs.map((proof) => ({
      id: proof.id,
      state: "MISSING",
      reason: "evidence schema or policy version does not match",
      sourceCandidate: receipt.candidate,
    }));
  }

  return receipt.proofs.map((proof) => {
    const surfaceChanged = proof.invalidatedBy.surfaces.some((surface) =>
      current.surfaces.includes(surface),
    );
    const pathChanged = current.changedPaths.some((changedPath) =>
      matchesAny(
        changedPath.replaceAll("\\", "/"),
        proof.invalidatedBy.pathPatterns,
      ),
    );
    return surfaceChanged || pathChanged
      ? {
          id: proof.id,
          state: "INVALID" as const,
          reason: "a relevant surface or input path changed",
          sourceCandidate: receipt.candidate,
        }
      : {
          id: proof.id,
          state: "REUSE" as const,
          reason: "no declared invalidating input changed",
          sourceCandidate: receipt.candidate,
        };
  });
}
