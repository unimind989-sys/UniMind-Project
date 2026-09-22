import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  assessConditionalCiEvidence,
  assessEvidenceReceipt,
  buildEvidenceReceipt,
  classifyReviewProvenance,
  classifyChangedPaths,
  deriveAgentExecution,
  loadAgentExecutionPolicy,
  planContextRetrieval,
  validateAgentExecutionPolicy,
  type AgentExecutionInput,
} from "../../scripts/lib/agent-execution-policy";

type HistoricalCase = {
  name: string;
  input: AgentExecutionInput;
  expected: {
    surfaces?: string[];
    risk?: string;
    planning?: string;
    modelFloor?: string;
    capabilities?: string[];
    proceduralSkills?: string[];
    proceduralSkillsAbsent?: string[];
    browser?: {
      internal: string;
      externalChrome: boolean;
      playwrightCli: boolean;
    };
  };
};

const policy = loadAgentExecutionPolicy();
const fixture = JSON.parse(
  readFileSync(
    path.resolve("tests/fixtures/agent-execution/historical-cases.json"),
    "utf8",
  ),
) as { cases: HistoricalCase[] };

describe("agent execution policy", () => {
  it("validates the authoritative policy and keeps conditional CI in shadow", () => {
    expect(validateAgentExecutionPolicy(policy)).toEqual([]);
    expect(policy.activation.conditional_ci).toBe("SHADOW");
    expect(policy.activation.routing).toBe("ENFORCED");
  });

  for (const historicalCase of fixture.cases) {
    it(`replays ${historicalCase.name}`, () => {
      const result = deriveAgentExecution(policy, historicalCase.input);
      const expected = historicalCase.expected;

      if (expected.surfaces !== undefined) {
        expect(result.surfaces).toEqual(expected.surfaces);
      }
      if (expected.risk !== undefined) {
        expect(result.risk).toBe(expected.risk);
      }
      if (expected.planning !== undefined) {
        expect(result.planning).toBe(expected.planning);
      }
      if (expected.modelFloor !== undefined) {
        expect(result.modelFloor).toBe(expected.modelFloor);
      }
      if (expected.capabilities !== undefined) {
        expect(result.capabilities).toEqual(
          expect.arrayContaining(expected.capabilities),
        );
      }
      if (expected.proceduralSkills !== undefined) {
        expect(result.proceduralSkills).toEqual(
          expect.arrayContaining(expected.proceduralSkills),
        );
      }
      for (const absent of expected.proceduralSkillsAbsent ?? []) {
        expect(result.proceduralSkills).not.toContain(absent);
      }
      if (expected.browser !== undefined) {
        expect(result.browser).toEqual(expected.browser);
      }
    });
  }

  it("keeps Sol sticky after escalation", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP03-T04",
      pass: "actual-diff",
      declaredSurfaces: ["frontend"],
      changedPaths: ["src/app/unit/page.tsx"],
      previousModelFloor: "sol-high",
    });

    expect(result.modelFloor).toBe("sol-high");
  });

  it("reports an unverifiable active model without pretending to switch it", () => {
    const unverified = deriveAgentExecution(policy, {
      task: "WP03-T04",
      pass: "intent",
      declaredSurfaces: ["frontend"],
      changedPaths: [],
    });
    const insufficient = deriveAgentExecution(policy, {
      task: "WP02-T08",
      pass: "intent",
      declaredSurfaces: ["auth"],
      changedPaths: [],
      activeModel: "luna-max",
    });

    expect(unverified.modelRuntime).toEqual(
      expect.objectContaining({
        requiredFloor: "luna-max",
        status: "unverified",
        action: "report-limitation",
      }),
    );
    expect(insufficient.modelRuntime).toEqual(
      expect.objectContaining({
        requiredFloor: "sol-high",
        activeModel: "luna-max",
        status: "switch-required",
        action: "request-switch",
      }),
    );
  });

  it("classifies receipt deltas without inheriting original task surfaces", () => {
    expect(
      classifyChangedPaths(
        policy,
        ["evidence/wp00-pilot/agent-execution-receipt.json"],
        true,
      ).surfaces,
    ).toEqual(["docs"]);
    expect(
      classifyChangedPaths(policy, ["unknown-control-plane.file"], true)
        .surfaces,
    ).toEqual([
      "docs",
      "frontend",
      "runtime",
      "auth",
      "data",
      "storage",
      "delivery",
      "tooling",
    ]);
  });

  it("keeps intent semantic but widens unknown actual-diff paths conservatively", () => {
    const intent = deriveAgentExecution(policy, {
      task: "WP00-T09",
      pass: "intent",
      declaredSurfaces: ["docs"],
      changedPaths: ["ops/new-runtime.ts"],
    });
    const actualDiff = deriveAgentExecution(policy, {
      task: "WP00-T09",
      pass: "actual-diff",
      declaredSurfaces: ["docs"],
      changedPaths: ["ops/new-runtime.ts"],
    });

    expect(intent.surfaces).toEqual(["docs"]);
    expect(actualDiff.surfaces).toEqual([
      "docs",
      "frontend",
      "runtime",
      "auth",
      "data",
      "storage",
      "delivery",
      "tooling",
    ]);
    expect(actualDiff.risk).toBe("R3");
    expect(actualDiff.reasons).toContain(
      "unknown path widened conservatively: ops/new-runtime.ts",
    );
  });

  it("classifies worker runtime files without losing semantic precision", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP00-T09",
      pass: "actual-diff",
      declaredSurfaces: ["docs"],
      changedPaths: ["workers/ingestion/process-job.ts"],
    });

    expect(result.surfaces).toEqual(["docs", "runtime"]);
    expect(result.risk).toBe("R2");
  });

  it("rejects a second worker and every nested worker", () => {
    expect(() =>
      deriveAgentExecution(policy, {
        task: "WP03-T04",
        pass: "intent",
        declaredSurfaces: ["frontend"],
        changedPaths: [],
        workerCount: 2,
      }),
    ).toThrow(/maximum worker count/i);

    expect(() =>
      deriveAgentExecution(policy, {
        task: "WP03-T04",
        pass: "intent",
        declaredSurfaces: ["frontend"],
        changedPaths: [],
        workerCount: 1,
        nestedWorker: true,
      }),
    ).toThrow(/nested workers/i);
  });

  it("reuses proof after an irrelevant documentation change", () => {
    const assessment = assessEvidenceReceipt(
      policy,
      {
        schemaVersion: policy.evidence.schema_version,
        policyVersion: policy.policy_version,
        task: "WP02-T08",
        candidate: "742e61e",
        proofs: [
          {
            id: "authorization-denial",
            check: "pnpm test:security",
            status: "PASS",
            invalidatedBy: {
              surfaces: ["auth", "data", "storage"],
              pathPatterns: ["^src/lib/auth/", "^supabase/migrations/"],
            },
          },
        ],
      },
      {
        task: "WP02-T08",
        surfaces: ["docs"],
        changedPaths: ["README.md"],
      },
    );

    expect(assessment).toEqual([
      expect.objectContaining({ id: "authorization-denial", state: "REUSE" }),
    ]);
  });

  it("invalidates proof after a relevant auth change", () => {
    const assessment = assessEvidenceReceipt(
      policy,
      {
        schemaVersion: policy.evidence.schema_version,
        policyVersion: policy.policy_version,
        task: "WP02-T08",
        candidate: "742e61e",
        proofs: [
          {
            id: "authorization-denial",
            check: "pnpm test:security",
            status: "PASS",
            invalidatedBy: {
              surfaces: ["auth", "data"],
              pathPatterns: ["^src/lib/auth/"],
            },
          },
        ],
      },
      {
        task: "WP02-T08",
        surfaces: ["auth", "runtime"],
        changedPaths: ["src/lib/auth/resolve-session.ts"],
      },
    );

    expect(assessment).toEqual([
      expect.objectContaining({ id: "authorization-denial", state: "INVALID" }),
    ]);
  });

  it("treats malformed evidence as missing proof", () => {
    expect(
      assessEvidenceReceipt(
        policy,
        { proofs: "not-an-array" },
        {
          task: "WP02-T08",
          surfaces: ["docs"],
          changedPaths: ["README.md"],
        },
      ),
    ).toEqual([expect.objectContaining({ id: "unknown", state: "MISSING" })]);
  });

  it("treats malformed invalidation patterns as missing proof", () => {
    expect(
      assessEvidenceReceipt(
        policy,
        {
          schemaVersion: 1,
          policyVersion: policy.policy_version,
          task: "WP02-T08",
          candidate: "742e61e",
          proofs: [
            {
              id: "authorization-denial",
              check: "pnpm test:security",
              status: "PASS",
              invalidatedBy: {
                surfaces: ["auth"],
                pathPatterns: ["[invalid"],
              },
            },
          ],
        },
        {
          task: "WP02-T08",
          surfaces: ["docs"],
          changedPaths: ["README.md"],
        },
      ),
    ).toEqual([expect.objectContaining({ id: "unknown", state: "MISSING" })]);
  });

  it("treats an unbound candidate identifier as missing proof", () => {
    expect(
      assessEvidenceReceipt(
        policy,
        {
          schemaVersion: 1,
          policyVersion: policy.policy_version,
          task: "WP02-T08",
          candidate: "current",
          proofs: [],
        },
        {
          task: "WP02-T08",
          surfaces: ["docs"],
          changedPaths: ["README.md"],
        },
      ),
    ).toEqual([expect.objectContaining({ id: "unknown", state: "MISSING" })]);
  });

  it("falls back only the contradicted evidence-reuse rule", () => {
    const fallbackPolicy = structuredClone(policy);
    fallbackPolicy.activation.evidence_reuse = "FALLBACK";
    const assessment = assessEvidenceReceipt(
      fallbackPolicy,
      {
        schemaVersion: 1,
        policyVersion: policy.policy_version,
        task: "WP02-T08",
        candidate: "742e61e",
        proofs: [
          {
            id: "authorization-denial",
            check: "pnpm test:security",
            status: "PASS",
            invalidatedBy: { surfaces: ["auth"], pathPatterns: [] },
          },
        ],
      },
      {
        task: "WP02-T08",
        surfaces: ["docs"],
        changedPaths: ["README.md"],
      },
    );

    expect(assessment).toEqual([
      expect.objectContaining({
        id: "authorization-denial",
        state: "MISSING",
      }),
    ]);
  });

  it("uses conservative behavior for non-enforced execution rules", () => {
    const fallbackPolicy = structuredClone(policy);
    fallbackPolicy.activation.routing = "FALLBACK";
    fallbackPolicy.activation.model_routing = "FALLBACK";
    fallbackPolicy.activation.context_routing = "FALLBACK";
    fallbackPolicy.activation.verification_selection = "FALLBACK";
    fallbackPolicy.activation.automatic_finalization = "FALLBACK";
    const result = deriveAgentExecution(fallbackPolicy, {
      task: "WP03-T04",
      pass: "intent",
      declaredSurfaces: ["docs"],
      changedPaths: ["README.md"],
    });

    expect(result.surfaces).toEqual([
      "docs",
      "frontend",
      "runtime",
      "auth",
      "data",
      "storage",
      "delivery",
      "tooling",
    ]);
    expect(result.risk).toBe("R3");
    expect(result.modelFloor).toBe("sol-high");
    expect(result.capabilities).toEqual(
      expect.arrayContaining(["trust-boundaries", "release-safety"]),
    );
    expect(result.verification).toHaveLength(policy.verification.checks.length);
    expect(result.finalization).toEqual({
      state: "FALLBACK",
      mode: "manual-recovery",
    });
  });

  it("reduces worker allowance to zero when worker policy falls back", () => {
    const fallbackPolicy = structuredClone(policy);
    fallbackPolicy.activation.worker_policy = "FALLBACK";
    expect(() =>
      deriveAgentExecution(fallbackPolicy, {
        task: "WP03-T04",
        pass: "intent",
        declaredSurfaces: ["frontend"],
        changedPaths: [],
        workerCount: 1,
      }),
    ).toThrow(/maximum worker count is 0/i);
  });

  it("keeps broad exact-head CI while conditional predictions shadow", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP00-T09",
      pass: "actual-diff",
      declaredSurfaces: ["docs", "tooling"],
      changedPaths: [
        "docs/agents/agent-execution-policy.yaml",
        "scripts/lib/agent-execution-policy.ts",
      ],
    });

    expect(result.verification.map((check) => check.id)).toEqual(
      expect.arrayContaining(["agent-policy", "pnpm-verify", "exact-head-ci"]),
    );
    expect(result.ci).toEqual(
      expect.objectContaining({
        mode: "broad",
        selectorState: "SHADOW",
        predictions: [
          expect.objectContaining({
            id: "dependency-audit",
            action: "WOULD_SKIP",
          }),
          expect.objectContaining({ id: "application", action: "RUN" }),
          expect.objectContaining({ id: "database-ci", action: "WOULD_SKIP" }),
        ],
      }),
    );
  });

  it("allows governed conditional-CI readiness states without enabling them", () => {
    const readyPolicy = structuredClone(policy);
    readyPolicy.activation.conditional_ci = "READY";

    expect(validateAgentExecutionPolicy(readyPolicy)).toEqual([]);
    const result = deriveAgentExecution(readyPolicy, {
      task: "WP00-T09",
      pass: "actual-diff",
      declaredSurfaces: ["docs"],
      changedPaths: ["docs/agents/agent-workflow.md"],
    });

    expect(result.ci).toEqual(
      expect.objectContaining({ mode: "broad", selectorState: "READY" }),
    );
  });

  it("rejects conditional-CI enforcement without a governed workflow fingerprint", () => {
    const enforcedPolicy = structuredClone(policy);
    enforcedPolicy.activation.conditional_ci = "ENFORCED";

    expect(validateAgentExecutionPolicy(enforcedPolicy)).toContain(
      "conditional_ci ENFORCED requires the governed CI workflow SHA-256",
    );
  });

  it("derives READY only from explicit regression and broad-CI evidence", () => {
    const evidence = {
      schemaVersion: 1,
      policyVersion: policy.policy_version,
      regressionCases: [
        "docs-only",
        "dependency-change",
        "application-change",
        "database-change",
        "unknown-path",
      ],
      observations: [
        {
          runId: "docs-run",
          candidate: "1111111",
          input: {
            task: "WP00-T09",
            pass: "actual-diff",
            declaredSurfaces: ["docs"],
            changedPaths: ["README.md"],
          },
          outcomes: {
            "dependency-audit": "PASS",
            application: "PASS",
            "database-ci": "PASS",
          },
        },
        {
          runId: "dependency-run",
          candidate: "2222222",
          input: {
            task: "WP00-T09",
            pass: "actual-diff",
            declaredSurfaces: ["tooling"],
            changedPaths: ["package.json"],
          },
          outcomes: {
            "dependency-audit": "PASS",
            application: "PASS",
            "database-ci": "PASS",
          },
        },
        {
          runId: "database-run",
          candidate: "3333333",
          input: {
            task: "WP02-T08",
            pass: "actual-diff",
            declaredSurfaces: ["data"],
            changedPaths: ["supabase/migrations/20260921000000_gate.sql"],
          },
          outcomes: {
            "dependency-audit": "PASS",
            application: "PASS",
            "database-ci": "PASS",
          },
        },
      ],
    };

    expect(assessConditionalCiEvidence(policy, evidence)).toEqual(
      expect.objectContaining({
        recommendedState: "READY",
        regressionCoverage: true,
        jobs: expect.arrayContaining([
          expect.objectContaining({ id: "dependency-audit", state: "READY" }),
          expect.objectContaining({ id: "application", state: "READY" }),
          expect.objectContaining({ id: "database-ci", state: "READY" }),
        ]),
      }),
    );
  });

  it("falls back only the conditional-CI job with an unsafe skip contradiction", () => {
    const assessment = assessConditionalCiEvidence(policy, {
      schemaVersion: 1,
      policyVersion: policy.policy_version,
      regressionCases: [
        "docs-only",
        "dependency-change",
        "application-change",
        "database-change",
        "unknown-path",
      ],
      observations: [
        {
          runId: "docs-run",
          candidate: "1111111",
          input: {
            task: "WP00-T09",
            pass: "actual-diff",
            declaredSurfaces: ["docs"],
            changedPaths: ["README.md"],
          },
          outcomes: {
            "dependency-audit": "PASS",
            application: "PASS",
            "database-ci": "FAIL",
          },
        },
        {
          runId: "dependency-run",
          candidate: "2222222",
          input: {
            task: "WP00-T09",
            pass: "actual-diff",
            declaredSurfaces: ["tooling"],
            changedPaths: ["package.json"],
          },
          outcomes: {
            "dependency-audit": "PASS",
            application: "PASS",
            "database-ci": "PASS",
          },
        },
        {
          runId: "database-run",
          candidate: "3333333",
          input: {
            task: "WP02-T08",
            pass: "actual-diff",
            declaredSurfaces: ["data"],
            changedPaths: ["supabase/migrations/20260921000000_gate.sql"],
          },
          outcomes: {
            "dependency-audit": "PASS",
            application: "PASS",
            "database-ci": "PASS",
          },
        },
      ],
    });

    expect(assessment.recommendedState).toBe("SHADOW");
    expect(assessment.jobs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "dependency-audit", state: "READY" }),
        expect.objectContaining({ id: "application", state: "READY" }),
        expect.objectContaining({
          id: "database-ci",
          state: "FALLBACK",
          contradictions: 1,
        }),
      ]),
    );
  });

  it("requires founder design acceptance for a material frontend layout change", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP00-T11",
      pass: "actual-diff",
      declaredSurfaces: ["frontend"],
      changedPaths: ["src/app/learn/page.tsx"],
      flags: { designJudgment: true },
    });

    expect(result.designAcceptance).toEqual(
      expect.objectContaining({
        required: true,
        status: "HUMAN_DESIGN_ACCEPTANCE_REQUIRED",
      }),
    );
  });

  it("requires founder design acceptance for a material typography redesign", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP00-T11",
      pass: "actual-diff",
      declaredSurfaces: ["frontend"],
      changedPaths: ["src/app/globals.css"],
      flags: { designJudgment: true },
    });

    expect(result.designAcceptance.status).toBe(
      "HUMAN_DESIGN_ACCEPTANCE_REQUIRED",
    );
  });

  it("does not require design acceptance for backend-only work", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP00-T11",
      pass: "actual-diff",
      declaredSurfaces: ["runtime"],
      changedPaths: ["src/lib/catalog/resolve-unit.ts"],
      flags: { designJudgment: true },
    });

    expect(result.designAcceptance).toEqual(
      expect.objectContaining({ required: false, status: "NOT_REQUIRED" }),
    );
  });

  it("does not add redundant acceptance for tiny or approved-intent visual changes", () => {
    const tinyCorrection = deriveAgentExecution(policy, {
      task: "WP00-T11",
      pass: "actual-diff",
      declaredSurfaces: ["frontend"],
      changedPaths: ["src/app/learn/page.tsx"],
      flags: { designJudgment: false, humanVisualDecision: true },
    });
    const approvedReference = deriveAgentExecution(policy, {
      task: "WP00-T11",
      pass: "actual-diff",
      declaredSurfaces: ["frontend"],
      changedPaths: ["src/app/learn/page.tsx"],
      flags: { designJudgment: false },
    });

    expect(tinyCorrection.designAcceptance.required).toBe(false);
    expect(tinyCorrection.designAcceptance.retained).toBe(true);
    expect(approvedReference.designAcceptance.status).toBe("NOT_REQUIRED");
  });

  it("reports a completed founder acceptance when the current material candidate is approved", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP00-T11",
      pass: "actual-diff",
      declaredSurfaces: ["frontend"],
      changedPaths: ["src/app/learn/page.tsx"],
      flags: { designJudgment: true, humanVisualDecision: true },
    });

    expect(result.designAcceptance).toEqual(
      expect.objectContaining({ required: false, status: "ACCEPTED" }),
    );
  });

  it("blocks stable verification until the material design gate is accepted", () => {
    const pending = deriveAgentExecution(policy, {
      task: "WP00-T11",
      pass: "actual-diff",
      declaredSurfaces: ["frontend"],
      changedPaths: ["src/app/learn/page.tsx"],
      flags: { designJudgment: true },
    });

    expect(pending.proofPreflight).toEqual(
      expect.objectContaining({
        status: "INCOMPLETE",
        stableCandidateAllowed: false,
        missing: expect.arrayContaining(["human-design-acceptance"]),
      }),
    );
  });

  it("does not mark an actual diff stable before the preflight pass runs", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP00-T11",
      pass: "actual-diff",
      declaredSurfaces: ["docs"],
      changedPaths: ["docs/agents/agent-workflow.md"],
    });

    expect(result.proofPreflight).toEqual(
      expect.objectContaining({
        status: "INCOMPLETE",
        stableCandidateAllowed: false,
      }),
    );
  });

  it("inventories proof obligations before stable broad verification", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP00-T11",
      pass: "proof-preflight",
      declaredSurfaces: ["frontend", "runtime"],
      changedPaths: [
        "src/app/learn/page.tsx",
        "src/lib/catalog/resolve-unit.ts",
      ],
      flags: { designJudgment: true, humanVisualDecision: true },
    });

    expect(result.proofPreflight).toEqual(
      expect.objectContaining({
        status: "COMPLETE",
        stableCandidateAllowed: true,
      }),
    );
    expect(result.proofPreflight.obligations.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        "diff-integrity",
        "secret-scan",
        "application-quality",
        "fresh-checkout",
        "frontend-behavior",
        "exact-head-ci",
        "human-design-acceptance",
      ]),
    );
  });

  it("tracks verification selector additions and removals without a second proof mapping", () => {
    const extendedPolicy = structuredClone(policy);
    extendedPolicy.verification.checks.push({
      id: "future-tooling-proof",
      stage: "stable-candidate",
      command: "pnpm future:proof",
      surfaces: ["tooling"],
    });

    const withRequirement = deriveAgentExecution(extendedPolicy, {
      task: "WP00-T12",
      pass: "proof-preflight",
      declaredSurfaces: ["tooling"],
      changedPaths: ["scripts/lib/agent-execution-policy.ts"],
    });
    const withoutRequirement = deriveAgentExecution(policy, {
      task: "WP00-T12",
      pass: "proof-preflight",
      declaredSurfaces: ["tooling"],
      changedPaths: ["scripts/lib/agent-execution-policy.ts"],
    });

    expect(withRequirement.verification.map((check) => check.id)).toContain(
      "future-tooling-proof",
    );
    expect(
      withRequirement.proofPreflight.obligations.map((item) => item.id),
    ).toContain("future-tooling-proof");
    expect(
      withoutRequirement.proofPreflight.obligations.map((item) => item.id),
    ).not.toContain("future-tooling-proof");
  });

  it("fails unknown high-risk proof obligations conservatively", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP00-T11",
      pass: "proof-preflight",
      declaredSurfaces: ["auth"],
      changedPaths: ["ops/unclassified-auth-change.ts"],
      flags: { authSemantics: true },
    });

    expect(result.proofPreflight).toEqual(
      expect.objectContaining({
        status: "UNKNOWN",
        stableCandidateAllowed: false,
      }),
    );
  });

  it("fails known-path proof preflight when visual impact is explicitly unknown", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP00-T12",
      pass: "proof-preflight",
      declaredSurfaces: ["frontend"],
      changedPaths: ["src/app/learn/page.tsx"],
      flags: { visualImpactUnknown: true },
    });

    expect(result.proofPreflight).toEqual(
      expect.objectContaining({
        status: "UNKNOWN",
        stableCandidateAllowed: false,
      }),
    );
  });

  it("generates and reuses real design receipts by semantic visual impact", () => {
    const accepted = deriveAgentExecution(policy, {
      task: "WP00-T12",
      pass: "proof-preflight",
      declaredSurfaces: ["frontend"],
      changedPaths: ["src/app/learn/page.tsx"],
      flags: { designJudgment: true, humanVisualDecision: true },
    });
    const receipt = buildEvidenceReceipt(policy, accepted, "742e61e", [
      "application-quality",
      "frontend-behavior",
    ]);
    const assessDesign = (
      surfaces: (typeof accepted.surfaces)[number][],
      changedPaths: string[],
      flags?: { designJudgment?: boolean; visualImpactUnknown?: boolean },
    ) =>
      assessEvidenceReceipt(policy, receipt, {
        task: "WP00-T12",
        surfaces,
        changedPaths,
        ...(flags === undefined ? {} : { flags }),
      }).find((item) => item.id === "human-design-acceptance");

    expect(
      receipt.proofs.find((proof) => proof.id === "human-design-acceptance")
        ?.invalidatedBy,
    ).toEqual(
      expect.objectContaining({
        surfaces: [],
        semanticFacts: expect.arrayContaining([
          expect.objectContaining({
            flag: "designJudgment",
            result: "INVALID",
          }),
          expect.objectContaining({
            flag: "visualImpactUnknown",
            result: "MISSING",
          }),
        ]),
      }),
    );
    expect(
      assessDesign(["frontend"], ["src/app/learn/page.tsx"], {
        designJudgment: false,
      }),
    ).toEqual(expect.objectContaining({ state: "REUSE" }));
    expect(
      assessDesign(["runtime"], ["src/lib/catalog/resolve-unit.ts"]),
    ).toEqual(expect.objectContaining({ state: "REUSE" }));
    expect(
      assessDesign(["frontend"], ["src/app/learn/page.tsx"], {
        designJudgment: true,
      }),
    ).toEqual(expect.objectContaining({ state: "INVALID" }));
    expect(
      assessEvidenceReceipt(policy, receipt, {
        task: "WP00-T12",
        surfaces: ["docs"],
        changedPaths: ["evidence/wp00-pilot/2026-09-22_closure.md"],
      }).map((item) => item.state),
    ).toEqual(["REUSE", "REUSE", "REUSE"]);
    expect(
      assessDesign(["frontend"], ["src/app/learn/page.tsx"], {
        visualImpactUnknown: true,
      }),
    ).toEqual(expect.objectContaining({ state: "MISSING" }));
    expect(assessDesign(["frontend"], ["unknown/visual-change.asset"])).toEqual(
      expect.objectContaining({ state: "MISSING" }),
    );
  });

  it("distinguishes executor-controlled account approval from independent review", () => {
    expect(
      classifyReviewProvenance({
        authorAccount: "unimind989-sys",
        approvalAccount: "aboayman-oss",
        executor: "codex-root",
        reviewer: "codex-root",
        candidate: "abcdef1",
        reviewedCandidate: "abcdef1",
        reviewCompleted: true,
        requirement: "distinct-account",
      }),
    ).toEqual(
      expect.objectContaining({
        kind: "DISTINCT_ACCOUNT",
        accountSeparated: true,
        reviewerSeparated: false,
        status: "SATISFIED",
      }),
    );
    expect(
      classifyReviewProvenance({
        authorAccount: "unimind989-sys",
        approvalAccount: "aboayman-oss",
        executor: "codex-root",
        reviewer: "codex-root",
        candidate: "abcdef1",
        reviewedCandidate: "abcdef1",
        reviewCompleted: true,
        requirement: "independent",
      }),
    ).toEqual(
      expect.objectContaining({
        kind: "DISTINCT_ACCOUNT",
        status: "MISSING",
      }),
    );
    expect(
      classifyReviewProvenance({
        authorAccount: "unimind989-sys",
        approvalAccount: "aboayman-oss",
        executor: "codex-root",
        reviewer: "human-aboayman",
        candidate: "abcdef1",
        reviewedCandidate: "abcdef1",
        reviewCompleted: true,
        requirement: "independent",
      }),
    ).toEqual(
      expect.objectContaining({ kind: "INDEPENDENT", status: "SATISFIED" }),
    );
    expect(
      classifyReviewProvenance({
        authorAccount: "unimind989-sys",
        approvalAccount: "aboayman-oss",
        executor: "codex-root",
        reviewer: "human-aboayman",
        candidate: "abcdef1",
        reviewedCandidate: "abcdef2",
        reviewCompleted: true,
        requirement: "independent",
      }),
    ).toEqual(
      expect.objectContaining({ exactCandidate: false, status: "MISSING" }),
    );
  });

  it("plans narrower retrieval after a large context read is truncated", () => {
    expect(
      planContextRetrieval(policy, {
        path: "docs/runbooks/poc-execution-runbook.md",
        fileChars: 120_000,
        outputTruncated: true,
        contentChanged: false,
        newQuestion: true,
      }),
    ).toEqual(
      expect.objectContaining({
        action: "targeted-ranges",
        repeatFullRead: false,
      }),
    );
  });
});
