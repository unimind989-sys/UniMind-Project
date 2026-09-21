import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  assessEvidenceReceipt,
  classifyChangedPaths,
  deriveAgentExecution,
  loadAgentExecutionPolicy,
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
        schemaVersion: 1,
        policyVersion: 1,
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
        schemaVersion: 1,
        policyVersion: 1,
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
          policyVersion: 1,
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
          policyVersion: 1,
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
        policyVersion: 1,
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
      expect.objectContaining({ mode: "broad", selectorState: "SHADOW" }),
    );
  });
});
