import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  assessConditionalCiEvidence,
  assessEvidenceReceipt,
  assessLocalStablePreparation,
  assessLocalStableCompletion,
  buildEvidenceReceipt,
  classifyReviewProvenance,
  classifyChangedPaths,
  deriveAgentExecution,
  hashPreparation,
  loadAgentExecutionPolicy,
  selectLocalStableTask,
  taskVerificationChecks,
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
  it("validates the authoritative enforced conditional CI policy", () => {
    expect(validateAgentExecutionPolicy(policy)).toEqual([]);
    expect(policy.activation.conditional_ci).toBe("ENFORCED");
    expect(policy.activation.routing).toBe("ENFORCED");
    expect(policy.risk).not.toHaveProperty("model_floor");
    expect(policy.activation).not.toHaveProperty("model_routing");
    expect(policy.workers).not.toHaveProperty("default_model");
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
      if (expected.capabilities !== undefined) {
        expect(result.capabilities).toEqual(
          expect.arrayContaining(expected.capabilities),
        );
      }
      if (expected.proceduralSkills !== undefined) {
        if (
          historicalCase.name ===
          "design direction selectively activates Impeccable"
        ) {
          expect(result.proceduralSkills).not.toContain("impeccable");
          expect(result.designAcceptance.disposition).toBe("UNKNOWN");
        } else {
          expect(result.proceduralSkills).toEqual(
            expect.arrayContaining(expected.proceduralSkills),
          );
        }
      }
      for (const absent of expected.proceduralSkillsAbsent ?? []) {
        expect(result.proceduralSkills).not.toContain(absent);
      }
      if (expected.browser !== undefined) {
        if (
          historicalCase.name ===
          "founder visual decision opens external Chrome"
        ) {
          expect(result.browser.externalChrome).toBe(false);
          expect(result.designAcceptance.disposition).toBe("UNKNOWN");
        } else {
          expect(result.browser).toEqual(expected.browser);
        }
      }
    });
  }

  it("keeps risk and verification independent of manual model assignment", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP03-T04",
      pass: "actual-diff",
      declaredSurfaces: ["auth"],
      changedPaths: ["src/lib/auth/resolve-session.ts"],
    });

    expect(result.risk).toBe("R3");
    expect(result.verification.map((check) => check.id)).toContain(
      "authorization-denial",
    );
    expect(result).not.toHaveProperty("modelFloor");
    expect(result).not.toHaveProperty("modelRuntime");
  });

  it("widens planning for security uncertainty without choosing a model", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP00-T14",
      pass: "intent",
      declaredSurfaces: ["runtime"],
      changedPaths: [],
      flags: { securityUncertainty: true },
    });
    expect(result.risk).toBe("R2");
    expect(result.planning).toBe("deliberate");
    expect(result).not.toHaveProperty("modelFloor");
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

  it("classifies normal application and proof artifacts without unknown widening", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP03-T05",
      pass: "proof-preflight",
      declaredSurfaces: [],
      changedPaths: [
        ".impeccable/surfaces/collection.md",
        "next-env.d.ts",
        "src/app/batch-leader/collection-actions.ts",
        "src/app/preview/batch-leader/preview-collection.server.ts",
        "supabase/tests/27_batch_leader_collection_flow.sql",
      ],
    });

    expect(result.surfaces).toEqual(["docs", "runtime", "data", "tooling"]);
    expect(result.proofPreflight).toEqual(
      expect.objectContaining({
        status: "COMPLETE",
        stableCandidateAllowed: true,
      }),
    );
    expect(result.reasons).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining("unknown path widened conservatively"),
      ]),
    );
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
    const shadowPolicy = structuredClone(policy);
    shadowPolicy.activation.conditional_ci = "SHADOW";
    const result = deriveAgentExecution(shadowPolicy, {
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
            action: "RUN",
          }),
          expect.objectContaining({ id: "application", action: "RUN" }),
          expect.objectContaining({ id: "database-ci", action: "RUN" }),
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
    enforcedPolicy.conditional_ci.enforcement.workflow_sha256 = null;

    expect(validateAgentExecutionPolicy(enforcedPolicy)).toContain(
      "conditional_ci ENFORCED requires the governed CI workflow SHA-256",
    );
  });

  it("derives READY only from explicit regression and broad-CI evidence", () => {
    const evidence = {
      schemaVersion: 1,
      policyVersion: policy.policy_version,
      regressionCases:
        policy.conditional_ci.readiness.required_regression_cases,
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
      regressionCases:
        policy.conditional_ci.readiness.required_regression_cases,
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

  it("derives NOT_APPLICABLE for non-frontend and UNKNOWN for omitted frontend disposition", () => {
    const backend = deriveAgentExecution(policy, {
      task: "WP00-T13",
      pass: "proof-preflight",
      declaredSurfaces: ["runtime"],
      changedPaths: ["src/lib/catalog/resolve-unit.ts"],
    });
    const frontend = deriveAgentExecution(policy, {
      task: "WP00-T13",
      pass: "proof-preflight",
      declaredSurfaces: ["frontend"],
      changedPaths: ["src/app/learn/page.tsx"],
    });
    expect(backend.designAcceptance.disposition).toBe("NOT_APPLICABLE");
    expect(backend.proofPreflight.status).toBe("COMPLETE");
    expect(frontend.designAcceptance.disposition).toBe("UNKNOWN");
    expect(frontend.proofPreflight.status).toBe("UNKNOWN");
    expect(frontend.proofPreflight.missing).toContain("design-disposition");
  });

  it.each([
    [
      "NONVISUAL",
      "rationale:internal type-only correction has no rendered or interaction effect",
    ],
    [
      "OBJECTIVE_PRESERVING",
      "rationale:fixes focus order without redesign; baseline:approved WP03-T04 shell",
    ],
    ["APPROVED_REFERENCE", "reference:docs/decisions/d-23-visual.md#candidate"],
  ] as const)(
    "requires evidence for %s and accepts specific evidence",
    (disposition, evidence) => {
      const input = {
        task: "WP00-T13",
        pass: "proof-preflight" as const,
        declaredSurfaces: ["frontend"] as const,
        changedPaths: ["src/app/learn/page.tsx"],
        designDisposition: disposition,
      };
      expect(
        deriveAgentExecution(policy, {
          ...input,
          declaredSurfaces: [...input.declaredSurfaces],
        }).proofPreflight.status,
      ).toBe("INCOMPLETE");
      expect(
        deriveAgentExecution(policy, {
          ...input,
          declaredSurfaces: [...input.declaredSurfaces],
          designEvidence: evidence,
        }).proofPreflight.status,
      ).toBe("COMPLETE");
    },
  );

  it("rejects NOT_APPLICABLE and old Boolean-only frontend acceptance", () => {
    const base = {
      task: "WP00-T13",
      pass: "proof-preflight" as const,
      declaredSurfaces: ["frontend"] as const,
      changedPaths: ["src/app/learn/page.tsx"],
    };
    expect(
      deriveAgentExecution(policy, {
        ...base,
        declaredSurfaces: [...base.declaredSurfaces],
        designDisposition: "NOT_APPLICABLE",
      }).proofPreflight.status,
    ).toBe("INCOMPLETE");
    expect(
      deriveAgentExecution(policy, {
        ...base,
        declaredSurfaces: [...base.declaredSurfaces],
        flags: { designJudgment: true, humanVisualDecision: true } as never,
      }).proofPreflight.status,
    ).toBe("UNKNOWN");
  });

  it("requires a traceable founder receipt for MATERIAL work and invalidates visual changes", () => {
    const candidate = "a".repeat(40);
    const pending = deriveAgentExecution(policy, {
      task: "WP00-T13",
      pass: "proof-preflight",
      declaredSurfaces: ["frontend"],
      changedPaths: ["src/app/learn/page.tsx"],
      designDisposition: "MATERIAL",
      candidateHead: candidate,
    });
    expect(pending.proofPreflight.missing).toContain("human-design-acceptance");
    const decision = {
      decisionActor: "Ahmed" as const,
      decisionReference: "message:founder-approval-1",
      decisionTimestamp: "2026-09-23T12:00:00Z",
      acceptedScope:
        "routes:/learn; surfaces:desktop,mobile; states:default,loading",
    };
    const receipt = buildEvidenceReceipt(
      policy,
      pending,
      candidate,
      [],
      decision,
    );
    expect(
      receipt.proofs.find((proof) => proof.id === "human-design-acceptance"),
    ).toEqual(
      expect.objectContaining({ ...decision, acceptedCandidate: candidate }),
    );
    const accepted = deriveAgentExecution(policy, {
      task: "WP00-T13",
      pass: "proof-preflight",
      declaredSurfaces: ["frontend"],
      changedPaths: ["src/app/learn/page.tsx"],
      designDisposition: "MATERIAL",
      candidateHead: candidate,
      designReceipt: receipt,
    });
    expect(accepted.proofPreflight.status).toBe("COMPLETE");
    expect(
      deriveAgentExecution(policy, {
        task: "WP00-T13",
        pass: "proof-preflight",
        declaredSurfaces: ["frontend"],
        changedPaths: ["src/app/learn/page.tsx"],
        designDisposition: "MATERIAL",
        candidateHead: candidate,
        designReceipt: receipt,
        changesSinceAcceptance: ["src/app/learn/page.tsx"],
      }).proofPreflight.status,
    ).toBe("INCOMPLETE");
    expect(
      deriveAgentExecution(policy, {
        task: "WP00-T13",
        pass: "proof-preflight",
        declaredSurfaces: ["frontend"],
        changedPaths: ["src/app/learn/page.tsx"],
        designDisposition: "MATERIAL",
        candidateHead: candidate,
        designReceipt: receipt,
        changesSinceAcceptance: ["src/lib/internal.ts"],
      }).designAcceptance.retained,
    ).toBe(true);
    expect(
      deriveAgentExecution(policy, {
        task: "WP00-T13",
        pass: "proof-preflight",
        declaredSurfaces: ["frontend"],
        changedPaths: ["src/app/learn/page.tsx"],
        designDisposition: "NONVISUAL",
        designEvidence:
          "receipt:design.json; rationale:type-only edit; baseline:accepted learn route",
        candidateHead: "b".repeat(40),
        designReceipt: receipt,
        changesSinceAcceptance: ["src/app/learn/page.tsx"],
      }).designAcceptance.retained,
    ).toBe(true);
    expect(
      assessEvidenceReceipt(policy, receipt, {
        task: "WP00-T13",
        surfaces: ["frontend"],
        changedPaths: ["src/app/learn/page.tsx"],
        designDisposition: "NONVISUAL",
        designEvidence:
          "rationale:type-only correction; baseline:accepted learn route",
      }).find((proof) => proof.id === "human-design-acceptance")?.state,
    ).toBe("REUSE");
    expect(
      assessEvidenceReceipt(policy, receipt, {
        task: "WP00-T13",
        surfaces: ["frontend"],
        changedPaths: ["src/app/learn/page.tsx"],
      }).find((proof) => proof.id === "human-design-acceptance")?.state,
    ).toBe("MISSING");
    expect(
      deriveAgentExecution(policy, {
        task: "WP00-T13",
        pass: "proof-preflight",
        declaredSurfaces: ["frontend"],
        changedPaths: ["src/app/learn/page.tsx"],
        designDisposition: "MATERIAL",
        candidateHead: candidate,
        designReceipt: receipt,
        flags: { visualImpactUnknown: true },
      }).proofPreflight.status,
    ).toBe("UNKNOWN");
    const malformed = structuredClone(receipt);
    delete malformed.proofs[0]?.decisionReference;
    expect(
      deriveAgentExecution(policy, {
        task: "WP00-T13",
        pass: "proof-preflight",
        declaredSurfaces: ["frontend"],
        changedPaths: ["src/app/learn/page.tsx"],
        designDisposition: "MATERIAL",
        candidateHead: candidate,
        designReceipt: malformed,
      }).proofPreflight.status,
    ).toBe("INCOMPLETE");
  });

  it("tracks verification selector additions and removals without a second proof mapping", () => {
    const extendedPolicy = structuredClone(policy);
    extendedPolicy.verification.checks.push({
      id: "future-tooling-proof",
      stage: "stable-candidate",
      command: "pnpm future:proof",
      surfaces: ["tooling"],
    });

    const input: AgentExecutionInput = {
      task: "WP00-T13",
      pass: "proof-preflight" as const,
      declaredSurfaces: ["tooling"],
      changedPaths: ["scripts/lib/agent-execution-policy.ts"],
    };
    const withRequirement = deriveAgentExecution(extendedPolicy, input);
    const withoutRequirement = deriveAgentExecution(policy, input);

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

  it("keeps exact task checks in proof preflight", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP00-T13",
      pass: "proof-preflight",
      declaredSurfaces: ["tooling"],
      changedPaths: ["scripts/derive-agent-execution.ts"],
      explicitChecks: ["focused policy tests", "isolated handoff"],
    });
    expect(result.proofPreflight.obligations.map((item) => item.id)).toEqual(
      expect.arrayContaining(["focused policy tests", "isolated handoff"]),
    );
  });

  it("keeps unknown paths conservative", () => {
    const result = deriveAgentExecution(policy, {
      task: "WP00-T13",
      pass: "proof-preflight",
      declaredSurfaces: ["auth"],
      changedPaths: ["unclassified/auth-change.ts"],
      flags: { authSemantics: true },
    });
    expect(result.proofPreflight.status).toBe("UNKNOWN");
  });

  it("rejects absent or ambiguous active tasks and incomplete preparation", () => {
    expect(() => selectLocalStableTask([])).toThrow();
    expect(() => selectLocalStableTask(["WP00-T13", "WP03-T06"])).toThrow();
    expect(selectLocalStableTask(["WP00-T13"])).toBe("WP00-T13");
    expect(selectLocalStableTask(["WP00-T13", "WP03-T06"], "WP00-T13")).toBe(
      "WP00-T13",
    );
    const complete = deriveAgentExecution(policy, {
      task: "WP00-T13",
      pass: "proof-preflight",
      declaredSurfaces: ["tooling"],
      changedPaths: ["scripts/derive-agent-execution.ts"],
    }).proofPreflight;
    const base = {
      commands: "focused policy tests exit 0",
      review: "COMPLETE_INLINE",
      unresolvedFindings: "NONE",
      recordedFingerprint: "a",
      currentFingerprint: "a",
      proofPreflight: complete,
    };
    expect(assessLocalStablePreparation(base)).toEqual([]);
    expect(
      assessLocalStablePreparation({ ...base, review: "PENDING" }),
    ).toContain("candidate-changing review is pending");
    expect(
      assessLocalStablePreparation({
        ...base,
        requiresIndependentReview: true,
      }),
    ).toContain("the task requires independent preparation review");
    expect(
      assessLocalStablePreparation({ ...base, unresolvedFindings: "F-1" }),
    ).toContain("review findings remain unresolved");
    expect(
      assessLocalStablePreparation({ ...base, currentFingerprint: "b" }),
    ).toContain("preparation fingerprint is stale");
    expect(
      assessLocalStablePreparation({ ...base, commands: "NOT RUN" }),
    ).toContain("focused results are not recorded");
    expect(
      assessLocalStablePreparation({
        ...base,
        proofPreflight: { ...complete, status: "UNKNOWN" },
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("proof preflight is UNKNOWN"),
      ]),
    );
  });

  it("rejects broad proof when the candidate changes before the command finishes", () => {
    expect(
      assessLocalStableCompletion({
        startingFingerprint: "candidate-a",
        finalFingerprint: "candidate-a",
        exitStatus: 0,
      }),
    ).toEqual([]);
    expect(
      assessLocalStableCompletion({
        startingFingerprint: "candidate-a",
        finalFingerprint: "candidate-b",
        exitStatus: 0,
      }),
    ).toEqual(["candidate changed during broad verification"]);
    expect(
      assessLocalStableCompletion({
        startingFingerprint: "candidate-a",
        finalFingerprint: "candidate-b",
        exitStatus: 1,
      }),
    ).toEqual([
      "candidate changed during broad verification",
      "broad verification exited 1",
    ]);
  });

  it("includes the task contract in standalone proof preflight", () => {
    expect(
      taskVerificationChecks("focused unit; pnpm verify; focused unit", [
        "database parity",
      ]),
    ).toEqual(["focused unit", "pnpm verify", "database parity"]);
    expect(() => taskVerificationChecks(undefined, ["pnpm verify"])).toThrow(
      "Active task record lacks Verify checks.",
    );
  });

  it("binds preparation to HEAD, candidate blobs, and task contract regardless of path order", () => {
    const head = "a".repeat(40);
    const pairs: [string, string][] = [
      ["scripts/b.ts", "2"],
      ["scripts/a.ts", "1"],
    ];
    const original = hashPreparation(
      head,
      pairs,
      "Task ID:WP00-T13\nVerify:policy\nPass:green\nHard stop:none",
    );
    expect(
      hashPreparation(
        head,
        [...pairs].reverse(),
        "Task ID:WP00-T13\nVerify:policy\nPass:green\nHard stop:none",
      ),
    ).toBe(original);
    expect(
      hashPreparation(
        head,
        [
          ["scripts/b.ts", "changed"],
          ["scripts/a.ts", "1"],
        ],
        "Task ID:WP00-T13\nVerify:policy\nPass:green\nHard stop:none",
      ),
    ).not.toBe(original);
    expect(
      hashPreparation(
        head,
        pairs,
        "Task ID:WP00-T13\nVerify:policy+handoff\nPass:green\nHard stop:none",
      ),
    ).not.toBe(original);
    expect(
      hashPreparation(
        "b".repeat(40),
        pairs,
        "Task ID:WP00-T13\nVerify:policy\nPass:green\nHard stop:none",
      ),
    ).not.toBe(original);
  });

  it("rejects incomplete founder metadata when issuing a receipt", () => {
    const pending = deriveAgentExecution(policy, {
      task: "WP00-T13",
      pass: "proof-preflight",
      declaredSurfaces: ["frontend"],
      changedPaths: ["src/app/learn/page.tsx"],
      designDisposition: "MATERIAL",
    });
    expect(() =>
      buildEvidenceReceipt(policy, pending, "a".repeat(40), [], {
        decisionActor: "Ahmed",
        decisionReference: "",
        decisionTimestamp: "2026-09-23T12:00:00Z",
        acceptedScope: "learn route",
      }),
    ).toThrow();
  });

  it("emits compact current/stale UniMind authority while preserving standalone Impeccable output", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "unimind-context-"));
    try {
      const script = path.resolve(
        ".agents/skills/impeccable/scripts/context.mjs",
      );
      writeFileSync(
        path.join(root, "PRODUCT.md"),
        "# Product\n\nUnique product body marker\n",
      );
      writeFileSync(
        path.join(root, "DESIGN.md"),
        "# Design\n\nUnique design body marker\n",
      );
      const run = () =>
        execFileSync(process.execPath, [script], {
          cwd: root,
          encoding: "utf8",
          env: { ...process.env, IMPECCABLE_NO_UPDATE_CHECK: "1" },
        });
      expect(run()).toContain("Unique product body marker");
      mkdirSync(path.join(root, "docs/agents"), { recursive: true });
      mkdirSync(path.join(root, "planning/tasks"), { recursive: true });
      writeFileSync(
        path.join(root, "docs/agents/agent-execution-policy.yaml"),
        "policy_version: 6\n",
      );
      const hash = execFileSync(
        "git",
        ["hash-object", path.join(root, "PRODUCT.md")],
        { encoding: "utf8" },
      ).trim();
      writeFileSync(
        path.join(root, "planning/tasks/active.md"),
        `**Status:** [~]\n**Established facts:** Current product fact | PRODUCT.md#Product | ${hash} | when scope changes\n**Unresolved findings:** NONE\n`,
      );
      const compact = run();
      expect(compact).toContain("Fact state: CURRENT");
      expect(compact).not.toContain("Unique product body marker");
      expect(compact).not.toContain("Unique design body marker");
      expect(compact).not.toContain("SUBAGENT_AUTHORIZATION");
      writeFileSync(
        path.join(root, "PRODUCT.md"),
        "# Product\n\nChanged product body marker\n",
      );
      expect(run()).toContain("Fact state: MISSING_OR_STALE");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 20_000);

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
});
