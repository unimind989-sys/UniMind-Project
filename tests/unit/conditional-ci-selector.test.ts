import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  assessConditionalCiEvidence,
  loadAgentExecutionPolicy,
} from "../../scripts/lib/agent-execution-policy";
import {
  assertExactPrMergeParents,
  selectCiJobs,
} from "../../scripts/lib/conditional-ci-selector";

const policy = loadAgentExecutionPolicy();

describe("conditional CI selector", () => {
  it("replays source-bound broad outcomes to READY for every required job", () => {
    const evidence = JSON.parse(
      readFileSync(
        "evidence/wp00-pilot/conditional-ci-shadow-evidence.json",
        "utf8",
      ),
    ) as unknown;
    const readiness = assessConditionalCiEvidence(policy, evidence);
    expect(readiness.recommendedState).toBe("READY");
    expect(readiness.regressionCoverage).toBe(true);
    expect(readiness.jobs).toHaveLength(3);
    expect(
      readiness.jobs.every(
        (job) =>
          job.state === "READY" &&
          job.runEvidence &&
          job.skipEvidence &&
          job.contradictions === 0,
      ),
    ).toBe(true);
  });

  it("skips heavy jobs only for safe documentation", () => {
    expect(
      selectCiJobs({
        policy,
        event: "pull_request",
        changedPaths: [
          "docs/runbooks/poc-execution-runbook.md",
          "planning/tasks/wp00-t16-conditional-ci-promotion.md",
          "evidence/wp00-pilot/proof.md",
        ],
      }),
    ).toMatchObject({
      dependencyAudit: "WOULD_SKIP",
      application: "WOULD_SKIP",
      databaseCi: "WOULD_SKIP",
    });
  });

  it.each([
    "docs/security/rls-matrix.csv",
    "docs/policies/auth-session-revocation.md",
    "planning/load-profile-100-students.yaml",
    ".github/workflows/ci.yml",
    "docs/agents/agent-execution-policy.yaml",
    "src/lib/db/supabase/admin.server.ts",
    "tests/integration/supabase-auth-hosted.test.ts",
    "scripts/lib/ephemeral-supabase.ts",
    "pnpm-lock.yaml",
    "ops/new-runtime.ts",
  ])("runs full CI for protected or uncertain path %s", (changedPath) => {
    expect(
      selectCiJobs({
        policy,
        event: "pull_request",
        changedPaths: [changedPath],
      }),
    ).toMatchObject({
      dependencyAudit: "RUN",
      application: "RUN",
      databaseCi: "RUN",
    });
  });

  it("keeps the dependency, application, and database decisions distinct", () => {
    expect(
      selectCiJobs({
        policy,
        event: "pull_request",
        changedPaths: ["src/lib/catalog/resolve-unit.ts"],
      }),
    ).toMatchObject({
      dependencyAudit: "WOULD_SKIP",
      application: "RUN",
      databaseCi: "WOULD_SKIP",
    });
    expect(
      selectCiJobs({
        policy,
        event: "pull_request",
        changedPaths: ["supabase/migrations/20260921000000_gate.sql"],
      }),
    ).toMatchObject({
      dependencyAudit: "WOULD_SKIP",
      application: "RUN",
      databaseCi: "RUN",
    });
    expect(
      selectCiJobs({
        policy,
        event: "pull_request",
        changedPaths: ["package.json"],
      }),
    ).toMatchObject({
      dependencyAudit: "RUN",
      application: "RUN",
      databaseCi: "RUN",
    });
  });

  it("runs full CI on absent or malformed PR paths and main push", () => {
    for (const changedPaths of [[], ["../other-repo"], ["/absolute"]]) {
      expect(
        selectCiJobs({ policy, event: "pull_request", changedPaths }),
      ).toMatchObject({
        dependencyAudit: "RUN",
        application: "RUN",
        databaseCi: "RUN",
      });
    }
    expect(selectCiJobs({ policy, event: "push" })).toMatchObject({
      dependencyAudit: "RUN",
      application: "RUN",
      databaseCi: "RUN",
    });
  });

  it("preserves opt-in manual database feedback and full default dispatch", () => {
    expect(
      selectCiJobs({
        policy,
        event: "workflow_dispatch",
        databaseFeedback: true,
      }),
    ).toMatchObject({
      dependencyAudit: "WOULD_SKIP",
      application: "WOULD_SKIP",
      databaseCi: "RUN",
    });
    expect(selectCiJobs({ policy, event: "workflow_dispatch" })).toMatchObject({
      dependencyAudit: "RUN",
      application: "RUN",
      databaseCi: "RUN",
    });
  });

  it("rejects a checkout that does not match the exact PR event head", () => {
    const merge = "a".repeat(40);
    const base = "b".repeat(40);
    const head = "c".repeat(40);
    expect(
      assertExactPrMergeParents(`${merge} ${base} ${head}`, base, head),
    ).toEqual({
      baseSha: base,
      headSha: head,
    });
    expect(() =>
      assertExactPrMergeParents(`${merge} ${base} ${head}`, base, merge),
    ).toThrow("does not match event base and head");
    expect(() => assertExactPrMergeParents(merge, base, head)).toThrow(
      "does not match event base and head",
    );
  });
});
