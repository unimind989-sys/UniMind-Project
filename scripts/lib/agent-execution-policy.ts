import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
const activationStates = ["SHADOW", "READY", "ENFORCED", "FALLBACK"] as const;
const activationRuleNames = [
  "routing",
  "worker_policy",
  "verification_selection",
  "evidence_reuse",
  "automatic_finalization",
  "conditional_ci",
] as const;
const agentExecutionFlagNames = [
  "architectureUncertainty",
  "authSemantics",
  "destructiveMigration",
  "domainUncertainty",
  "explicitPlaywrightCli",
  "productionMutation",
  "rls",
  "securityUncertainty",
  "specialistBrowserDebug",
  "userRequestedView",
  "visualImpactUnknown",
] as const;

export type Surface = (typeof surfaceNames)[number];
export type Risk = (typeof riskNames)[number];
export type Planning = (typeof planningNames)[number];
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
  risks?: Risk[];
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

export type ExecutionPass = "intent" | "actual-diff" | "proof-preflight";
export type DesignAcceptanceStatus =
  | "NOT_REQUIRED"
  | "HUMAN_DESIGN_ACCEPTANCE_REQUIRED"
  | "DESIGN_DISPOSITION_REQUIRED"
  | "DESIGN_EVIDENCE_REQUIRED"
  | "ACCEPTED";
export type ProofPreflightStatus = "COMPLETE" | "INCOMPLETE" | "UNKNOWN";
export type DesignDisposition =
  | "NOT_APPLICABLE"
  | "NONVISUAL"
  | "OBJECTIVE_PRESERVING"
  | "APPROVED_REFERENCE"
  | "MATERIAL"
  | "UNKNOWN";

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
    protected_flags: string[];
    deliberate_flags: string[];
  };
  workers: {
    default: number;
    maximum: number;
    nested: boolean;
  };
  browser: {
    internal: "side-browser";
    external_chrome_flags: string[];
    playwright_cli_flags: string[];
  };
  verification: { checks: VerificationCheck[] };
  conditional_ci: {
    evidence_schema_version: number;
    safe_docs_only_patterns: string[];
    force_full_patterns: string[];
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
    worker_policy: ActivationState;
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
  destructiveMigration?: boolean;
  domainUncertainty?: boolean;
  explicitPlaywrightCli?: boolean;
  productionMutation?: boolean;
  rls?: boolean;
  securityUncertainty?: boolean;
  specialistBrowserDebug?: boolean;
  userRequestedView?: boolean;
  visualImpactUnknown?: boolean;
};

export type AgentExecutionInput = {
  task: string;
  pass: ExecutionPass;
  declaredSurfaces: Surface[];
  changedPaths: string[];
  flags?: AgentExecutionFlags;
  requestedRisk?: Risk;
  workerCount?: number;
  nestedWorker?: boolean;
  proceduralSkills?: string[];
  explicitChecks?: string[];
  designDisposition?: DesignDisposition;
  designEvidence?: string;
  designReceipt?: unknown;
  candidateHead?: string;
  changesSinceAcceptance?: string[];
};

export type AgentExecutionResult = {
  task: string;
  policyVersion: number;
  pass: ExecutionPass;
  surfaces: Surface[];
  risk: Risk;
  planning: Planning;
  worker: { default: number; maximum: number; used: number; nested: false };
  capabilities: string[];
  proceduralSkills: string[];
  browser: {
    internal: "side-browser" | "none";
    externalChrome: boolean;
    playwrightCli: boolean;
  };
  designAcceptance: {
    disposition: DesignDisposition;
    required: boolean;
    retained: boolean;
    status: DesignAcceptanceStatus;
    reason: string;
  };
  proofPreflight: ProofCompletenessPreflight;
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

type EvidenceSemanticFact = {
  flag: keyof AgentExecutionFlags;
  equals: true;
  result: "INVALID" | "MISSING";
};

export type EvidenceProof = {
  id: string;
  check: string;
  status: "PASS";
  invalidatedBy: {
    surfaces: Surface[];
    pathPatterns: string[];
    semanticFacts?: EvidenceSemanticFact[];
  };
  decisionActor?: "Ahmed" | "Ziad";
  decisionReference?: string;
  decisionTimestamp?: string;
  acceptedCandidate?: string;
  acceptedScope?: string;
};

export type EvidenceReceipt = {
  schemaVersion: number;
  policyVersion: number;
  task: string;
  candidate: string;
  proofs: EvidenceProof[];
};

export type ProofObligation = Readonly<{
  id: string;
  kind: "automated" | "human";
  checkIds: readonly string[];
  reason: string;
}>;

export type ProofCompletenessPreflight = Readonly<{
  status: ProofPreflightStatus;
  stableCandidateAllowed: boolean;
  obligations: readonly ProofObligation[];
  missing: readonly string[];
  reasons: readonly string[];
}>;

export function selectLocalStableTask(
  activeTaskIds: readonly string[],
  explicitTask?: string,
): string {
  if (explicitTask !== undefined && activeTaskIds.includes(explicitTask))
    return explicitTask;
  if (explicitTask !== undefined || activeTaskIds.length !== 1) {
    throw new Error(
      `Stable verification needs one active task; found ${activeTaskIds.length}.`,
    );
  }
  return activeTaskIds[0] as string;
}

export function hashPreparation(
  head: string,
  candidatePairs: readonly [string, string][],
  contract: string,
): string {
  const entries = candidatePairs
    .map(([candidatePath, blob]) => `${candidatePath}\0${blob}`)
    .sort();
  const contractHash = createHash("sha256").update(contract).digest("hex");
  return createHash("sha256")
    .update([head, ...entries, contractHash].join("\n"))
    .digest("hex");
}

export function taskVerificationChecks(
  verifyField: string | undefined,
  additionalChecks: readonly string[] = [],
): string[] {
  if (verifyField === undefined || verifyField.trim().length === 0)
    throw new Error("Active task record lacks Verify checks.");
  return Array.from(
    new Set(
      [...verifyField.split(";"), ...additionalChecks]
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function assessLocalStablePreparation(input: {
  commands: string;
  review: string;
  unresolvedFindings: string;
  recordedFingerprint: string;
  currentFingerprint: string;
  proofPreflight: ProofCompletenessPreflight;
  requiresIndependentReview?: boolean;
}): string[] {
  const failures: string[] = [];
  if (input.commands === "NOT RUN" || !/\bexit\s+0\b/iu.test(input.commands))
    failures.push("focused results are not recorded");
  if (
    input.review !== "COMPLETE_INLINE" &&
    input.review !== "COMPLETE_INDEPENDENT"
  )
    failures.push("candidate-changing review is pending");
  if (
    input.requiresIndependentReview &&
    input.review !== "COMPLETE_INDEPENDENT"
  )
    failures.push("the task requires independent preparation review");
  if (input.unresolvedFindings !== "NONE")
    failures.push("review findings remain unresolved");
  if (input.recordedFingerprint !== input.currentFingerprint)
    failures.push("preparation fingerprint is stale");
  if (input.proofPreflight.status !== "COMPLETE")
    failures.push(
      `proof preflight is ${input.proofPreflight.status}: ${input.proofPreflight.missing.join(", ")}`,
    );
  return failures;
}

export function assessLocalStableCompletion(input: {
  startingFingerprint: string;
  finalFingerprint: string;
  exitStatus: number | null;
}): string[] {
  const failures: string[] = [];
  if (input.startingFingerprint !== input.finalFingerprint)
    failures.push("candidate changed during broad verification");
  if (input.exitStatus !== 0)
    failures.push(`broad verification exited ${String(input.exitStatus)}`);
  return failures;
}

export type EvidenceAssessment = {
  id: string;
  state: "REUSE" | "INVALID" | "MISSING";
  reason: string;
  sourceCandidate?: string;
};

export type ReviewRequirement = "distinct-account" | "independent";

export type ReviewProvenance = {
  accountSeparated: boolean;
  reviewerSeparated: boolean;
  exactCandidate: boolean;
  reviewCompleted: boolean;
  kind: "SAME_ACCOUNT" | "DISTINCT_ACCOUNT" | "INDEPENDENT";
  requirement: ReviewRequirement;
  status: "SATISFIED" | "MISSING";
  reason: string;
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
  const conservativePath = normalizedPaths.find((changedPath) => {
    const pathSurfaces = classifyChangedPaths(policy, [changedPath]).surfaces;
    return (
      pathSurfaces.length === 0 ||
      matchesAny(changedPath, policy.conditional_ci.force_full_patterns) ||
      (pathSurfaces.length === 1 &&
        pathSurfaces[0] === "docs" &&
        !matchesAny(changedPath, policy.conditional_ci.safe_docs_only_patterns))
    );
  });
  if (conservativePath !== undefined) {
    return policy.conditional_ci.jobs.map((job) => ({
      id: job.id,
      action: "RUN",
      reason: `conservative full CI for ${conservativePath}`,
    }));
  }
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
  for (const key of [
    "safe_docs_only_patterns",
    "force_full_patterns",
  ] as const) {
    const patterns = policy.conditional_ci[key];
    if (!Array.isArray(patterns) || patterns.length === 0) {
      failures.push(`conditional_ci ${key} must be non-empty`);
      continue;
    }
    for (const pattern of patterns) {
      if (typeof pattern !== "string") {
        failures.push(`conditional_ci ${key} contains a non-string pattern`);
        continue;
      }
      try {
        new RegExp(pattern, "i");
      } catch {
        failures.push(`conditional_ci ${key} contains an invalid pattern`);
      }
    }
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
  for (const check of policy.verification.checks) {
    if (check.risks?.some((risk) => !riskNames.includes(risk)) === true) {
      failures.push(`verification check has invalid risk: ${check.id}`);
    }
  }
  return failures;
}

function unknownChangedPaths(
  policy: AgentExecutionPolicy,
  changedPaths: readonly string[],
): string[] {
  return changedPaths.filter((changedPath) => {
    const normalizedPath = changedPath.replaceAll("\\", "/");
    return !policy.path_widening.some((rule) =>
      new RegExp(rule.pattern, "i").test(normalizedPath),
    );
  });
}

export function buildProofCompletenessPreflight(
  policy: AgentExecutionPolicy,
  input: AgentExecutionInput,
  selectedVerification: AgentExecutionResult["verification"],
  designAcceptance: AgentExecutionResult["designAcceptance"],
): ProofCompletenessPreflight {
  const obligations: ProofObligation[] = selectedVerification.map((check) => ({
    id: check.id,
    kind: "automated",
    checkIds: [check.id],
    reason: `${check.reason}: ${check.command}`,
  }));
  if (designAcceptance.required || designAcceptance.status === "ACCEPTED") {
    obligations.push({
      id: "human-design-acceptance",
      kind: "human",
      checkIds: [],
      reason: designAcceptance.required
        ? "Founder hands-on subjective review is required before stable broad verification."
        : "Founder hands-on subjective review is recorded for the accepted material candidate.",
    });
  }

  const missing = obligations
    .filter(
      (obligation) =>
        obligation.kind === "automated" &&
        (obligation.id.trim().length === 0 || obligation.checkIds.length !== 1),
    )
    .map((obligation) => obligation.id);
  if (designAcceptance.required) missing.push("human-design-acceptance");
  if (designAcceptance.status === "DESIGN_DISPOSITION_REQUIRED")
    missing.push("design-disposition");
  if (designAcceptance.status === "DESIGN_EVIDENCE_REQUIRED")
    missing.push("design-evidence");

  const unknownPaths =
    input.pass === "intent"
      ? []
      : unknownChangedPaths(policy, input.changedPaths);
  const reasons = obligations.map(
    (obligation) => `${obligation.id}: ${obligation.reason}`,
  );
  if (input.pass !== "proof-preflight") {
    reasons.push(
      "proof-completeness preflight must run before stable verification",
    );
  }
  if (unknownPaths.length > 0) {
    reasons.push(
      `unknown paths require conservative proof: ${unknownPaths.join(", ")}`,
    );
  }
  if (input.flags?.visualImpactUnknown === true) {
    reasons.push("unknown visual impact requires conservative proof");
  }
  const uniqueMissing = Array.from(new Set(missing));
  const status: ProofPreflightStatus =
    unknownPaths.length > 0 ||
    input.flags?.visualImpactUnknown === true ||
    designAcceptance.disposition === "UNKNOWN"
      ? "UNKNOWN"
      : input.pass !== "proof-preflight" || uniqueMissing.length > 0
        ? "INCOMPLETE"
        : "COMPLETE";
  return {
    status,
    stableCandidateAllowed: status === "COMPLETE",
    obligations,
    missing: uniqueMissing,
    reasons,
  };
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
    input.pass === "actual-diff" || input.pass === "proof-preflight",
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
  const disposition: DesignDisposition = sortedSurfaces.includes("frontend")
    ? (input.designDisposition ?? "UNKNOWN")
    : "NOT_APPLICABLE";
  if (
    !(
      [
        "NOT_APPLICABLE",
        "NONVISUAL",
        "OBJECTIVE_PRESERVING",
        "APPROVED_REFERENCE",
        "MATERIAL",
        "UNKNOWN",
      ] as string[]
    ).includes(disposition)
  ) {
    throw new Error("Unsupported design disposition.");
  }
  const evidence = input.designEvidence?.trim();
  const evidenceValid =
    disposition === "NONVISUAL"
      ? /^rationale:.{12,}/u.test(evidence ?? "") ||
        /^receipt:[^;]+;\s*rationale:.{12,};\s*baseline:.+/u.test(
          evidence ?? "",
        )
      : disposition === "OBJECTIVE_PRESERVING"
        ? /^rationale:.{12,};\s*baseline:.+/u.test(evidence ?? "")
        : disposition === "APPROVED_REFERENCE"
          ? /^reference:(message:[^\s]+|[^\s]+#[^\s]+)$/u.test(evidence ?? "")
          : true;
  const receipt = parseEvidenceReceipt(input.designReceipt);
  const acceptance = receipt?.proofs.find(
    (proof) => proof.id === "human-design-acceptance",
  );
  const validReceipt =
    receipt?.task === input.task &&
    receipt.policyVersion === policy.policy_version &&
    receipt.schemaVersion === policy.evidence.schema_version &&
    acceptance !== undefined;
  const changedFrontend = classifyChangedPaths(
    policy,
    input.changesSinceAcceptance ?? [],
    true,
  ).surfaces.includes("frontend");
  const accepted =
    validReceipt &&
    !input.flags?.visualImpactUnknown &&
    ((disposition === "MATERIAL" &&
      input.candidateHead === acceptance.acceptedCandidate &&
      !changedFrontend) ||
      (disposition === "NONVISUAL" &&
        evidenceValid &&
        evidence?.includes("baseline:")));
  const required = disposition === "MATERIAL" && !accepted;
  const invalid =
    (disposition === "UNKNOWN" ||
      disposition === "NOT_APPLICABLE" ||
      !evidenceValid) &&
    sortedSurfaces.includes("frontend");
  const designAcceptance: AgentExecutionResult["designAcceptance"] = {
    disposition,
    required,
    retained: Boolean(
      accepted &&
      (disposition === "NONVISUAL" ||
        (input.changesSinceAcceptance?.length ?? 0) > 0),
    ),
    status: accepted
      ? "ACCEPTED"
      : required
        ? "HUMAN_DESIGN_ACCEPTANCE_REQUIRED"
        : invalid
          ? disposition === "UNKNOWN" || disposition === "NOT_APPLICABLE"
            ? "DESIGN_DISPOSITION_REQUIRED"
            : "DESIGN_EVIDENCE_REQUIRED"
          : "NOT_REQUIRED",
    reason:
      disposition === "UNKNOWN"
        ? "Frontend design disposition is missing or unknown."
        : !evidenceValid
          ? "The selected design disposition lacks a specific rationale and baseline/reference."
          : required
            ? "Material design requires a valid founder receipt for the presented candidate."
            : "Design disposition is explicit and supported.",
  };
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

  const capabilitySurfaces = sortedSurfaces;
  const capabilities = Array.from(
    new Set(
      capabilitySurfaces.flatMap(
        (surface) => policy.surfaces[surface].capabilities,
      ),
    ),
  ).sort();
  const proceduralSkills = new Set(input.proceduralSkills ?? []);
  if (disposition === "MATERIAL") {
    proceduralSkills.add("impeccable");
  }

  const verification = policy.verification.checks
    .filter((check) => {
      if (policy.activation.verification_selection !== "ENFORCED") return true;
      if (check.always === true) return true;
      if (check.surfaces?.some((surface) => surfaces.has(surface)) === true) {
        return true;
      }
      if (check.risks?.includes(risk) === true) return true;
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
  const proofPreflight = buildProofCompletenessPreflight(
    policy,
    input,
    verification,
    designAcceptance,
  );
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
        ((designAcceptance.disposition === "MATERIAL" &&
          designAcceptance.required) ||
          policy.browser.external_chrome_flags.some((flag) =>
            flagEnabled(flags, flag),
          )),
      playwrightCli:
        isFrontend &&
        policy.browser.playwright_cli_flags.some((flag) =>
          flagEnabled(flags, flag),
        ),
    },
    designAcceptance,
    proofPreflight,
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
    const semanticFacts = invalidatedBy.semanticFacts;
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
      }) ||
      (semanticFacts !== undefined &&
        (!Array.isArray(semanticFacts) ||
          !semanticFacts.every(
            (fact) =>
              isRecord(fact) &&
              typeof fact.flag === "string" &&
              agentExecutionFlagNames.includes(
                fact.flag as (typeof agentExecutionFlagNames)[number],
              ) &&
              fact.equals === true &&
              (fact.result === "INVALID" || fact.result === "MISSING"),
          )))
    ) {
      return undefined;
    }
    const parsedSemanticFacts = (semanticFacts ?? []) as EvidenceSemanticFact[];
    if (
      proofValue.id === "human-design-acceptance" &&
      value.policyVersion >= 6 &&
      ((proofValue.decisionActor !== "Ahmed" &&
        proofValue.decisionActor !== "Ziad") ||
        typeof proofValue.decisionReference !== "string" ||
        !/^(message:[^\s]+|docs\/decisions\/[a-z0-9-]+\.md#[^\s]+)$/u.test(
          proofValue.decisionReference,
        ) ||
        typeof proofValue.decisionTimestamp !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(
          proofValue.decisionTimestamp,
        ) ||
        Number.isNaN(Date.parse(proofValue.decisionTimestamp)) ||
        typeof proofValue.acceptedCandidate !== "string" ||
        !/^[a-f0-9]{40}$/u.test(proofValue.acceptedCandidate) ||
        proofValue.acceptedCandidate !== value.candidate ||
        typeof proofValue.acceptedScope !== "string" ||
        !/^routes:[^;]+;\s*surfaces:[^;]+;\s*states:[^;]+$/u.test(
          proofValue.acceptedScope,
        ))
    )
      return undefined;
    proofs.push({
      id: proofValue.id,
      check: proofValue.check,
      status: "PASS",
      invalidatedBy: {
        surfaces: invalidatedBy.surfaces as Surface[],
        pathPatterns: invalidatedBy.pathPatterns as string[],
        ...(parsedSemanticFacts.length === 0
          ? {}
          : { semanticFacts: parsedSemanticFacts }),
      },
      ...(proofValue.id === "human-design-acceptance"
        ? {
            decisionActor: proofValue.decisionActor as "Ahmed" | "Ziad",
            decisionReference: proofValue.decisionReference as string,
            decisionTimestamp: proofValue.decisionTimestamp as string,
            acceptedCandidate: proofValue.acceptedCandidate as string,
            acceptedScope: proofValue.acceptedScope as string,
          }
        : {}),
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
  current: {
    task: string;
    surfaces: Surface[];
    changedPaths: string[];
    flags?: AgentExecutionFlags;
    designDisposition?: DesignDisposition;
    designEvidence?: string;
  },
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
    if (
      proof.id === "human-design-acceptance" &&
      current.surfaces.includes("frontend") &&
      current.changedPaths.length > 0
    ) {
      if (
        current.flags?.visualImpactUnknown === true ||
        current.designDisposition === "UNKNOWN" ||
        current.designDisposition === undefined
      ) {
        return {
          id: proof.id,
          state: "MISSING" as const,
          reason: "visual impact is unknown",
          sourceCandidate: receipt.candidate,
        };
      }
      if (current.designDisposition === "MATERIAL") {
        return {
          id: proof.id,
          state: "INVALID" as const,
          reason: "material visual change makes founder acceptance stale",
          sourceCandidate: receipt.candidate,
        };
      }
      if (
        current.designDisposition !== "NONVISUAL" ||
        !current.designEvidence?.includes("rationale:") ||
        !current.designEvidence?.includes("baseline:")
      ) {
        return {
          id: proof.id,
          state: "MISSING" as const,
          reason: "nonvisual correction lacks evidence",
          sourceCandidate: receipt.candidate,
        };
      }
    }
    const semanticResult = proof.invalidatedBy.semanticFacts?.find(
      (fact) => current.flags?.[fact.flag] === fact.equals,
    );
    const unknownVisualPath =
      proof.id === "human-design-acceptance" &&
      current.surfaces.includes("frontend") &&
      unknownChangedPaths(policy, current.changedPaths).length > 0;
    if (
      semanticResult?.result === "MISSING" ||
      unknownVisualPath ||
      (proof.id === "human-design-acceptance" &&
        current.flags?.visualImpactUnknown === true)
    ) {
      return {
        id: proof.id,
        state: "MISSING" as const,
        reason:
          "visual impact is unknown, so design acceptance cannot be reused",
        sourceCandidate: receipt.candidate,
      };
    }
    if (semanticResult?.result === "INVALID") {
      return {
        id: proof.id,
        state: "INVALID" as const,
        reason: "material visual change makes founder design acceptance stale",
        sourceCandidate: receipt.candidate,
      };
    }
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
          reason:
            proof.id === "human-design-acceptance"
              ? "material visual change makes founder design acceptance stale"
              : "a relevant surface or input path changed",
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

function receiptInvalidatorsForCheck(
  policy: AgentExecutionPolicy,
  checkId: string,
): EvidenceProof["invalidatedBy"] {
  const check = policy.verification.checks.find((item) => item.id === checkId);
  if (check === undefined || check.always === true) {
    return { surfaces: [...surfaceNames], pathPatterns: [] };
  }
  return {
    surfaces: [...(check.surfaces ?? [])],
    pathPatterns: [...(check.path_patterns ?? [])],
  };
}

export function buildEvidenceReceipt(
  policy: AgentExecutionPolicy,
  result: AgentExecutionResult,
  candidate: string,
  passedCheckIds: readonly string[],
  designDecision?: {
    decisionActor: "Ahmed" | "Ziad";
    decisionReference: string;
    decisionTimestamp: string;
    acceptedScope: string;
  },
): EvidenceReceipt {
  if (!/^[a-f0-9]{7,40}$/u.test(candidate)) {
    throw new Error("Evidence receipt candidate must be a Git commit SHA.");
  }
  if (
    result.pass !== "proof-preflight" ||
    (result.proofPreflight.status !== "COMPLETE" &&
      !(
        designDecision !== undefined &&
        result.designAcceptance.disposition === "MATERIAL" &&
        result.proofPreflight.status === "INCOMPLETE" &&
        result.proofPreflight.missing.every(
          (item) => item === "human-design-acceptance",
        )
      ))
  ) {
    throw new Error(
      "Evidence receipts require a complete proof-preflight result.",
    );
  }
  const selected = new Map(
    result.verification.map((check) => [check.id, check]),
  );
  const proofs: EvidenceProof[] = Array.from(new Set(passedCheckIds)).map(
    (checkId) => {
      const check = selected.get(checkId);
      if (check === undefined) {
        throw new Error(
          `Cannot receipt unselected verification check: ${checkId}`,
        );
      }
      return {
        id: check.id,
        check: check.command,
        status: "PASS",
        invalidatedBy: receiptInvalidatorsForCheck(policy, check.id),
      };
    },
  );
  if (designDecision !== undefined) {
    if (result.designAcceptance.disposition !== "MATERIAL")
      throw new Error(
        "Founder acceptance can only be issued for material design work.",
      );
    if (!/^[a-f0-9]{40}$/u.test(candidate))
      throw new Error(
        "Founder acceptance requires the full presented commit SHA.",
      );
    if (
      designDecision.decisionActor !== "Ahmed" &&
      designDecision.decisionActor !== "Ziad"
    )
      throw new Error("Founder actor must be Ahmed or Ziad.");
    proofs.push({
      id: "human-design-acceptance",
      check: "founder hands-on design acceptance",
      status: "PASS",
      ...designDecision,
      acceptedCandidate: candidate,
      invalidatedBy: {
        surfaces: [],
        pathPatterns: [],
        semanticFacts: [
          { flag: "visualImpactUnknown", equals: true, result: "MISSING" },
        ],
      },
    });
  }
  const receipt: EvidenceReceipt = {
    schemaVersion: policy.evidence.schema_version,
    policyVersion: policy.policy_version,
    task: result.task,
    candidate,
    proofs,
  };
  if (parseEvidenceReceipt(receipt) === undefined)
    throw new Error("Founder decision reference or scope is incomplete.");
  return receipt;
}

export function classifyReviewProvenance(input: {
  authorAccount: string;
  approvalAccount: string;
  executor: string;
  reviewer: string;
  candidate: string;
  reviewedCandidate: string;
  reviewCompleted: boolean;
  requirement: ReviewRequirement;
}): ReviewProvenance {
  const accountSeparated = input.authorAccount !== input.approvalAccount;
  const reviewerSeparated = input.executor !== input.reviewer;
  const exactCandidate = input.candidate === input.reviewedCandidate;
  const independent =
    reviewerSeparated && exactCandidate && input.reviewCompleted;
  const kind = independent
    ? "INDEPENDENT"
    : accountSeparated
      ? "DISTINCT_ACCOUNT"
      : "SAME_ACCOUNT";
  const status =
    input.requirement === "independent"
      ? independent
        ? "SATISFIED"
        : "MISSING"
      : accountSeparated && exactCandidate && input.reviewCompleted
        ? "SATISFIED"
        : "MISSING";
  return {
    accountSeparated,
    reviewerSeparated,
    exactCandidate,
    reviewCompleted: input.reviewCompleted,
    kind,
    requirement: input.requirement,
    status,
    reason:
      status === "SATISFIED"
        ? input.requirement === "independent"
          ? "A separate reviewer examined the candidate."
          : "A distinct authorized account submitted the approval."
        : !input.reviewCompleted
          ? "No completed review is recorded."
          : !exactCandidate
            ? "The review does not match the exact candidate."
            : input.requirement === "independent"
              ? "The executor cannot satisfy independent review by switching accounts."
              : "The approval account is not distinct from the author account.",
  };
}
