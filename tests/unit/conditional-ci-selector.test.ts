import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  inspectPrMergeParents,
  loadCiPathConfig,
  selectCiJobs,
  validateCiPathConfig,
} from "../../scripts/lib/conditional-ci-selector";

const config = loadCiPathConfig();

type RegressionCase = {
  id: string;
  input: { changedPaths: string[] };
  expected: Record<"dependency-audit" | "application" | "database-ci", string>;
};

const regressionCases = (
  JSON.parse(
    readFileSync("tests/fixtures/ci/conditional-ci-cases.json", "utf8"),
  ) as { cases: RegressionCase[] }
).cases;

describe("conditional CI selector", () => {
  it("loads a valid path config", () => {
    expect(validateCiPathConfig(config)).toEqual([]);
  });

  it.each(regressionCases)("selects jobs for $id", (regression) => {
    expect(
      selectCiJobs({
        config,
        event: "pull_request",
        changedPaths: regression.input.changedPaths,
      }),
    ).toMatchObject({
      dependencyAudit: regression.expected["dependency-audit"],
      application: regression.expected.application,
      databaseCi: regression.expected["database-ci"],
    });
  });

  it("skips heavy jobs only for safe documentation", () => {
    expect(
      selectCiJobs({
        config,
        event: "pull_request",
        changedPaths: [
          "docs/runbooks/poc-execution-runbook.md",
          "planning/tasks/wp00-t18-agent-workflow-v2.md",
          "evidence/wp00-pilot/proof.md",
          "AGENTS.md",
          "CLAUDE.md",
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
    "docs/agents/ci-paths.yaml",
    "src/lib/db/supabase/admin.server.ts",
    "tests/integration/supabase-auth-hosted.test.ts",
    "scripts/lib/ephemeral-supabase.ts",
    "pnpm-lock.yaml",
    "ops/new-runtime.ts",
  ])("runs full CI for protected or uncertain path %s", (changedPath) => {
    expect(
      selectCiJobs({
        config,
        event: "pull_request",
        changedPaths: [changedPath],
      }),
    ).toMatchObject({
      dependencyAudit: "RUN",
      application: "RUN",
      databaseCi: "RUN",
    });
  });

  it("runs the real-mode browser contracts for frontend and e2e-database changes", () => {
    for (const changedPath of [
      "src/app/learn/_components/study-frame.tsx",
      "tests/e2e-database/product-shell.spec.ts",
      "tests/e2e/support/shared-screens.ts",
    ])
      expect(
        selectCiJobs({
          config,
          event: "pull_request",
          changedPaths: [changedPath],
        }),
      ).toMatchObject({
        dependencyAudit: "WOULD_SKIP",
        application: "RUN",
        databaseCi: "RUN",
      });
  });

  it("runs the application job for agent skill changes", () => {
    expect(
      selectCiJobs({
        config,
        event: "pull_request",
        changedPaths: [
          ".agents/skills/tdd/SKILL.md",
          ".claude/skills/tdd/SKILL.md",
        ],
      }),
    ).toMatchObject({
      dependencyAudit: "WOULD_SKIP",
      application: "RUN",
      databaseCi: "WOULD_SKIP",
    });
  });

  it("runs full CI on absent or malformed PR paths and main push", () => {
    for (const changedPaths of [[], ["../other-repo"], ["/absolute"]]) {
      expect(
        selectCiJobs({ config, event: "pull_request", changedPaths }),
      ).toMatchObject({
        dependencyAudit: "RUN",
        application: "RUN",
        databaseCi: "RUN",
      });
    }
    expect(selectCiJobs({ config, event: "push" })).toMatchObject({
      dependencyAudit: "RUN",
      application: "RUN",
      databaseCi: "RUN",
    });
  });

  it("preserves opt-in manual database feedback and full default dispatch", () => {
    expect(
      selectCiJobs({
        config,
        event: "workflow_dispatch",
        databaseFeedback: true,
      }),
    ).toMatchObject({
      dependencyAudit: "WOULD_SKIP",
      application: "WOULD_SKIP",
      databaseCi: "RUN",
    });
    expect(selectCiJobs({ config, event: "workflow_dispatch" })).toMatchObject({
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
      inspectPrMergeParents(`${merge} ${base} ${head}`, base, head),
    ).toEqual({ kind: "EXACT", baseSha: base, headSha: head });
    expect(() =>
      inspectPrMergeParents(`${merge} ${base} ${head}`, base, merge),
    ).toThrow("does not match event base and head");
    expect(() => inspectPrMergeParents(merge, base, head)).toThrow(
      "does not match event base and head",
    );
    expect(() =>
      inspectPrMergeParents(`${merge} ${base} ${head}`, "main", head),
    ).toThrow("missing or malformed");
    expect(() =>
      inspectPrMergeParents(`${merge} ${base} zz`, base, head),
    ).toThrow("does not match event base and head");
  });

  it("runs every job instead of failing when only the PR base moved", () => {
    const merge = "a".repeat(40);
    const base = "b".repeat(40);
    const movedBase = "d".repeat(40);
    const head = "c".repeat(40);
    expect(
      inspectPrMergeParents(`${merge} ${movedBase} ${head}`, base, head),
    ).toEqual({
      kind: "BASE_MOVED",
      headSha: head,
      checkedOutBaseSha: movedBase,
    });
    expect(
      selectCiJobs({
        config,
        event: "pull_request",
        changedPaths: ["docs/README.md"],
        baseMoved: true,
      }),
    ).toMatchObject({
      dependencyAudit: "RUN",
      application: "RUN",
      databaseCi: "RUN",
    });
  });
});
