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

type ConditionalCiJob = {
  id: string;
  required_surfaces: Surface[];
  path_patterns: string[];
  needs: string[];
};

type ConditionalCiAction = "RUN" | "WOULD_SKIP";
type ConditionalCiOutcome = "PASS" | "FAIL" | "CANCELLED" | "SKIPPED";

export type ConditionalCiPrediction = {
  id: string;
  action: ConditionalCiAction;
  reason: string;
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
  conditional_ci: {
    evidence_schema_version: number;
    jobs: ConditionalCiJob[];
    readiness: {
      required_regression_cases: string[];
      require_run_observation: boolean;
      require_skip_observation: boolean;
      zero_unsafe_skip_contradictions: boolean;
    };
    enforcement: {
      requires_governed_workflow_change: boolean;
      workflow_path: string;
      workflow_sha256: string | null;
    };
  };
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
  activeModel?: ModelFloor;
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
  modelRuntimeStatus: "unverified" | "satisfied" | "switch-required";
  modelRuntime: {
    requiredFloor: ModelFloor;
    activeModel?: ModelFloor;
    status: "unverified" | "satisfied" | "switch-required";
    action: "report-limitation" | "proceed" | "request-switch";
    message: string;
  };
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
    mode: "broad" | "conditional";
    selectorState: ActivationState;
    predictionOnly: boolean;
    predictions: ConditionalCiPrediction[];
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

type ConditionalCiObservation = {
  runId: string;
  candidate: string;
  input: AgentExecutionInput;
  outcomes: Record<string, ConditionalCiOutcome>;
};

type ConditionalCiEvidence = {
  schemaVersion: number;
  policyVersion: number;
  regressionCases: string[];
  observations: ConditionalCiObservation[];
};

export type ConditionalCiAssessment = {
  recommendedState: "SHADOW" | "READY" | "FALLBACK";
  regressionCoverage: boolean;
  jobs: Array<{
    id: string;
    state: "SHADOW" | "READY" | "FALLBACK";
    runEvidence: boolean;
    skipEvidence: boolean;
    contradictions: number;
    reasons: string[];
  }>;
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

export function predictConditionalCiJobs(
  policy: AgentExecutionPolicy,
  surfaces: Surface[],
  changedPaths: string[],
): ConditionalCiPrediction[] {
  if (policy.activation.conditional_ci === "FALLBACK") {
    return policy.conditional_ci.jobs.map((job) => ({
      id: job.id,
      action: "RUN",
      reason: "conditional-CI optimization is in FALLBACK",
    }));
  }

  const normalizedPaths = changedPaths.map((changedPath) =>
    changedPath.replaceAll("\\", "/"),
  );
  const runJobs = new Set<string>();
  const reasons = new Map<string, string>();
  for (const job of policy.conditional_ci.jobs) {
    const matchedSurface = job.required_surfaces.find((surface) =>
      surfaces.includes(surface),
    );
    const matchedPath = normalizedPaths.find((changedPath) =>
      matchesAny(changedPath, job.path_patterns),
    );
    if (matchedSurface !== undefined) {
      runJobs.add(job.id);
      reasons.set(job.id, `required by ${matchedSurface} surface`);
    } else if (matchedPath !== undefined) {
      runJobs.add(job.id);
      reasons.set(job.id, `required by changed path ${matchedPath}`);
    }
  }

  let widened = true;
  while (widened) {
    widened = false;
    for (const job of policy.conditional_ci.jobs) {
      if (!runJobs.has(job.id)) continue;
      for (const dependency of job.needs) {
        if (runJobs.has(dependency)) continue;
        runJobs.add(dependency);
        reasons.set(dependency, `required by ${job.id} dependency`);
        widened = true;
      }
    }
  }

  return policy.conditional_ci.jobs.map((job) => ({
    id: job.id,
    action: runJobs.has(job.id) ? "RUN" : "WOULD_SKIP",
    reason: reasons.get(job.id) ?? "no affected surface, path, or dependency",
  }));
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
  if (policy.conditional_ci.evidence_schema_version !== 1) {
    failures.push("conditional_ci evidence_schema_version must be 1");
  }
  const conditionalJobIds = policy.conditional_ci.jobs.map((job) => job.id);
  const conditionalJobIdSet = new Set(conditionalJobIds);
  if (
    conditionalJobIds.length === 0 ||
    conditionalJobIdSet.size !== conditionalJobIds.length
  ) {
    failures.push("conditional_ci job ids must be non-empty and unique");
  }
  for (const job of policy.conditional_ci.jobs) {
    if (
      job.required_surfaces.some((surface) => !surfaceNames.includes(surface))
    ) {
      failures.push(`conditional_ci job has invalid surface: ${job.id}`);
    }
    if (
      job.needs.some(
        (dependency) =>
          dependency === job.id || !conditionalJobIdSet.has(dependency),
      )
    ) {
      failures.push(`conditional_ci job has invalid dependency: ${job.id}`);
    }
    for (const pattern of job.path_patterns) {
      try {
        new RegExp(pattern, "i");
      } catch {
        failures.push(
          `invalid conditional_ci path regex for ${job.id}: ${pattern}`,
        );
      }
    }
  }
  if (
    policy.conditional_ci.readiness.required_regression_cases.length === 0 ||
    new Set(policy.conditional_ci.readiness.required_regression_cases).size !==
      policy.conditional_ci.readiness.required_regression_cases.length
  ) {
    failures.push(
      "conditional_ci readiness requires unique regression case ids",
    );
  }
  if (
    policy.conditional_ci.enforcement.requires_governed_workflow_change !== true
  ) {
    failures.push(
      "conditional_ci enforcement must require a governed workflow change",
    );
  }
  if (
    policy.activation.conditional_ci === "ENFORCED" &&
    (typeof policy.conditional_ci.enforcement.workflow_sha256 !== "string" ||
      !/^[a-f0-9]{64}$/u.test(
        policy.conditional_ci.enforcement.workflow_sha256,
      ))
  ) {
    failures.push(
      "conditional_ci ENFORCED requires the governed CI workflow SHA-256",
    );
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
  if (
    input.activeModel !== undefined &&
    !modelNames.includes(input.activeModel)
  ) {
    throw new Error("Input contains an unsupported active model.");
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
  const pathClassification = classifyChangedPaths(
    policy,
    input.changedPaths,
    input.pass === "actual-diff",
  );
  reasons.push(
    ...pathClassification.reasons.filter((reason) =>
      reason.startsWith("unknown path widened conservatively:"),
    ),
  );
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
  let modelRuntimeStatus: AgentExecutionResult["modelRuntimeStatus"];
  let modelRuntime: AgentExecutionResult["modelRuntime"];
  if (input.activeModel === undefined) {
    modelRuntimeStatus = "unverified";
    modelRuntime = {
      requiredFloor: modelFloor,
      status: modelRuntimeStatus,
      action: "report-limitation",
      message:
        "The runtime did not expose a verifiable active primary model; report the required floor without claiming a switch.",
    };
  } else if (
    modelNames.indexOf(input.activeModel) < modelNames.indexOf(modelFloor)
  ) {
    modelRuntimeStatus = "switch-required";
    modelRuntime = {
      requiredFloor: modelFloor,
      activeModel: input.activeModel,
      status: modelRuntimeStatus,
      action: "request-switch",
      message:
        "The verified active primary model is below the required floor; request a model switch before implementation.",
    };
  } else {
    modelRuntimeStatus = "satisfied";
    modelRuntime = {
      requiredFloor: modelFloor,
      activeModel: input.activeModel,
      status: modelRuntimeStatus,
      action: "proceed",
      message:
        "The verified active primary model satisfies the required floor.",
    };
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
  const ciPredictions = predictConditionalCiJobs(
    policy,
    sortedSurfaces,
    input.changedPaths,
  );
  return {
    task: input.task,
    policyVersion: policy.policy_version,
    pass: input.pass,
    surfaces: sortedSurfaces,
    risk,
    planning,
    modelFloor,
    modelRuntimeStatus,
    modelRuntime,
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
      mode:
        policy.activation.conditional_ci === "ENFORCED"
          ? "conditional"
          : "broad",
      selectorState: policy.activation.conditional_ci,
      predictionOnly: policy.activation.conditional_ci !== "ENFORCED",
      predictions: ciPredictions,
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

function conservativeConditionalCiAssessment(
  policy: AgentExecutionPolicy,
  reason: string,
): ConditionalCiAssessment {
  return {
    recommendedState: "SHADOW",
    regressionCoverage: false,
    jobs: policy.conditional_ci.jobs.map((job) => ({
      id: job.id,
      state: "SHADOW",
      runEvidence: false,
      skipEvidence: false,
      contradictions: 0,
      reasons: [reason],
    })),
  };
}

export function assessConditionalCiEvidence(
  policy: AgentExecutionPolicy,
  value: unknown,
): ConditionalCiAssessment {
  if (
    !isRecord(value) ||
    value.schemaVersion !== policy.conditional_ci.evidence_schema_version ||
    value.policyVersion !== policy.policy_version ||
    !Array.isArray(value.regressionCases) ||
    !value.regressionCases.every((item) => typeof item === "string") ||
    !Array.isArray(value.observations)
  ) {
    return conservativeConditionalCiAssessment(
      policy,
      "conditional-CI evidence is missing, malformed, or policy-mismatched",
    );
  }

  const evidence = value as ConditionalCiEvidence;
  const regressionCoverage =
    policy.conditional_ci.readiness.required_regression_cases.every((caseId) =>
      evidence.regressionCases.includes(caseId),
    );
  const jobEvidence = new Map(
    policy.conditional_ci.jobs.map((job) => [
      job.id,
      { runEvidence: false, skipEvidence: false, contradictions: 0 },
    ]),
  );

  for (const observation of evidence.observations) {
    if (
      !isRecord(observation) ||
      typeof observation.runId !== "string" ||
      observation.runId.length === 0 ||
      typeof observation.candidate !== "string" ||
      !/^[a-f0-9]{7,40}$/u.test(observation.candidate) ||
      !isRecord(observation.input) ||
      !isRecord(observation.outcomes)
    ) {
      return conservativeConditionalCiAssessment(
        policy,
        "conditional-CI observation is malformed",
      );
    }

    let derived: AgentExecutionResult;
    try {
      derived = deriveAgentExecution(
        policy,
        observation.input as unknown as AgentExecutionInput,
      );
    } catch {
      return conservativeConditionalCiAssessment(
        policy,
        "conditional-CI observation input cannot be derived",
      );
    }

    for (const prediction of derived.ci.predictions) {
      const outcome = observation.outcomes[prediction.id];
      if (outcome === undefined) continue;
      if (
        outcome !== "PASS" &&
        outcome !== "FAIL" &&
        outcome !== "CANCELLED" &&
        outcome !== "SKIPPED"
      ) {
        return conservativeConditionalCiAssessment(
          policy,
          `conditional-CI outcome is invalid for ${prediction.id}`,
        );
      }
      const current = jobEvidence.get(prediction.id);
      if (current === undefined) continue;
      if (prediction.action === "RUN" && outcome === "PASS") {
        current.runEvidence = true;
      }
      if (prediction.action === "WOULD_SKIP" && outcome === "PASS") {
        current.skipEvidence = true;
      }
      if (prediction.action === "WOULD_SKIP" && outcome === "FAIL") {
        current.contradictions += 1;
      }
    }
  }

  const jobs = policy.conditional_ci.jobs.map((job) => {
    const evidenceForJob = jobEvidence.get(job.id) as {
      runEvidence: boolean;
      skipEvidence: boolean;
      contradictions: number;
    };
    const reasons: string[] = [];
    if (!regressionCoverage)
      reasons.push("required selector regressions missing");
    if (
      policy.conditional_ci.readiness.require_run_observation &&
      !evidenceForJob.runEvidence
    ) {
      reasons.push("successful broad-CI run evidence missing");
    }
    if (
      policy.conditional_ci.readiness.require_skip_observation &&
      !evidenceForJob.skipEvidence
    ) {
      reasons.push("successful broad-CI would-skip evidence missing");
    }
    if (evidenceForJob.contradictions > 0) {
      reasons.push("unsafe would-skip contradiction observed");
    }

    const ready =
      regressionCoverage &&
      (!policy.conditional_ci.readiness.require_run_observation ||
        evidenceForJob.runEvidence) &&
      (!policy.conditional_ci.readiness.require_skip_observation ||
        evidenceForJob.skipEvidence);
    const state: ConditionalCiAssessment["jobs"][number]["state"] =
      policy.activation.conditional_ci === "FALLBACK" ||
      (policy.conditional_ci.readiness.zero_unsafe_skip_contradictions &&
        evidenceForJob.contradictions > 0)
        ? "FALLBACK"
        : ready
          ? "READY"
          : "SHADOW";
    if (state === "READY") reasons.push("explicit readiness evidence complete");
    if (
      state === "FALLBACK" &&
      policy.activation.conditional_ci === "FALLBACK"
    ) {
      reasons.push("conditional-CI activation is in FALLBACK");
    }
    return { id: job.id, state, ...evidenceForJob, reasons };
  });

  return {
    recommendedState: jobs.every((job) => job.state === "READY")
      ? "READY"
      : jobs.every((job) => job.state === "FALLBACK")
        ? "FALLBACK"
        : "SHADOW",
    regressionCoverage,
    jobs,
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
