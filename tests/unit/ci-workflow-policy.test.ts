import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";
import { parse } from "yaml";

import { auditCiWorkflow } from "../../scripts/lib/ci-workflow-policy";

describe("CI workflow policy", () => {
  it("rejects floating actions and write permissions", () => {
    const unsafe = `
name: unsafe
on: [pull_request_target]
permissions:
  contents: write
jobs:
  application:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
`;

    expect(auditCiWorkflow(unsafe)).toEqual(
      expect.arrayContaining([
        "FORBIDDEN_TRIGGER",
        "WRITE_PERMISSION",
        "UNPINNED_ACTION",
        "APPLICATION_JOB_MISSING:static",
        "APPLICATION_JOB_MISSING:e2e_demo",
        "APPLICATION_GATE_UNSAFE",
        "DATABASE_CI_JOB_MISSING",
      ]),
    );
    expect(
      auditCiWorkflow(
        unsafe.replace("on: [pull_request_target]", "on: pull_request_target"),
      ),
    ).toContain("FORBIDDEN_TRIGGER");
  });

  it("requires fail-closed selector gating for disposable database CI", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const unsafe = workflow.replace(
      "if: always() && (needs.ci_selector.result != 'success' || needs.ci_selector.outputs.database_ci == 'RUN')",
      "if: github.ref == 'refs/heads/main'",
    );

    expect(auditCiWorkflow(unsafe)).toContain("DATABASE_CI_TRIGGER_UNSAFE");
  });

  it("offers database-only manual feedback without skipping required PR application proof", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const parsed = parse(workflow) as {
      on: {
        workflow_dispatch: {
          inputs: { database_feedback: { default: boolean } };
        };
      };
      jobs: Record<string, { if?: string; needs?: string }>;
    };
    expect(parsed.on.workflow_dispatch.inputs.database_feedback.default).toBe(
      false,
    );
    for (const job of [
      "static",
      "node_tests",
      "e2e",
      "e2e_demo",
      "application",
    ]) {
      expect(parsed.jobs[job]?.if).toBe(
        "always() && (needs.ci_selector.result != 'success' || needs.ci_selector.outputs.application == 'RUN')",
      );
    }
    expect(parsed.jobs["database-ci"]?.if).toBe(
      "always() && (needs.ci_selector.result != 'success' || needs.ci_selector.outputs.database_ci == 'RUN')",
    );
    expect(
      auditCiWorkflow(
        workflow.replaceAll(
          "if: always() && (needs.ci_selector.result != 'success' || needs.ci_selector.outputs.application == 'RUN')",
          "if: inputs.database_feedback",
        ),
      ),
    ).toEqual(
      expect.arrayContaining([
        "APPLICATION_TRIGGER_UNSAFE:static",
        "APPLICATION_TRIGGER_UNSAFE:node_tests",
        "APPLICATION_TRIGGER_UNSAFE:e2e",
        "APPLICATION_TRIGGER_UNSAFE:e2e_demo",
        "APPLICATION_TRIGGER_UNSAFE:application",
      ]),
    );
    expect(
      auditCiWorkflow(
        workflow.replace("        default: false", "        default: true"),
      ),
    ).toContain("DATABASE_FEEDBACK_DISPATCH_UNSAFE");
  });

  it("rejects secrets and protected environments in disposable database CI", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const withSecret = workflow.replace(
      "  database-ci:\n",
      [
        "  database-ci:",
        "    env:",
        "      LEAK_PROBE: ${{ secrets.UNIMIND_CI_SUPABASE_ACCESS_TOKEN }}",
        "",
      ].join("\n"),
    );
    const withEnvironment = workflow.replace(
      "  database-ci:\n",
      "  database-ci:\n    environment: ci\n",
    );

    expect(auditCiWorkflow(withSecret)).toContain("DATABASE_CI_SECRET_PRESENT");
    expect(auditCiWorkflow(withEnvironment)).toContain(
      "DATABASE_CI_ENVIRONMENT_PRESENT",
    );
  });

  it("requires an explicit GitHub-hosted Ubuntu image and cancellable isolation", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");

    expect(
      auditCiWorkflow(workflow.replaceAll("ubuntu-24.04", "self-hosted")),
    ).toEqual(
      expect.arrayContaining([
        "DATABASE_CI_RUNNER_UNSAFE",
        "APPLICATION_RUNNER_UNPINNED:e2e",
        "APPLICATION_RUNNER_UNPINNED:application",
      ]),
    );
    expect(
      auditCiWorkflow(
        workflow.replace(
          "group: database-ci-${{ github.workflow }}-${{ github.ref }}",
          "group: shared-database",
        ),
      ),
    ).toContain("DATABASE_CI_CONCURRENCY_MISSING");
  });

  it("requires the full disposable lifecycle and two resets", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const withoutSecondReset = workflow.replace(
      "          corepack pnpm db:ci:reset\n          corepack pnpm db:ci:reset\n",
      "          corepack pnpm db:ci:reset\n",
    );
    const withoutCleanup = workflow.replace(
      "        if: always()\n        run: corepack pnpm db:ci:stop\n",
      "        run: echo cleanup-removed\n",
    );

    expect(auditCiWorkflow(withoutSecondReset)).toContain(
      "DATABASE_CI_RESET_COUNT_UNSAFE",
    );
    expect(auditCiWorkflow(withoutCleanup)).toContain(
      "DATABASE_CI_CLEANUP_MISSING",
    );
  });

  it("requires a zero-cost pull-request dependency audit", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const unsafe = workflow.replace(
      /  dependency-audit:[\s\S]*?\n  application:/u,
      "  application:",
    );

    expect(auditCiWorkflow(unsafe)).toContain("DEPENDENCY_AUDIT_MISSING");
  });

  it("does not accept the paid dependency review action", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const unsupported = workflow.replace(
      "        run: corepack pnpm audit --audit-level high --prod",
      "        uses: actions/dependency-review-action@a1d282b36b6f3519aa1f3fc636f609c47dddb294",
    );

    expect(auditCiWorkflow(unsupported)).toContain("DEPENDENCY_AUDIT_MISSING");
  });

  it("requires immutable-lockfile installation and Corepack in both execution jobs", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");

    expect(
      auditCiWorkflow(
        workflow.replaceAll(
          "corepack pnpm install --frozen-lockfile",
          "corepack pnpm install",
        ),
      ),
    ).toContain("FROZEN_INSTALL_MISSING");
    expect(
      auditCiWorkflow(
        workflow.replaceAll(
          "      - name: Activate the pinned package manager\n        run: corepack enable\n",
          "",
        ),
      ),
    ).toContain("COREPACK_ENABLE_MISSING");
  });

  it("rejects caching and verify:ci components missing from CI", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");

    expect(
      auditCiWorkflow(
        workflow.replace(
          "          node-version-file: .nvmrc\n",
          "          node-version-file: .nvmrc\n          cache: pnpm\n",
        ),
      ),
    ).toContain("CACHE_CONFIGURED");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "      - name: Lint\n        run: corepack pnpm lint\n",
          "",
        ),
      ),
    ).toContain("VERIFY_CI_COMPONENT_MISSING:lint");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "run: corepack pnpm lint\n",
          "run: corepack pnpm lint --quiet\n",
        ),
      ),
    ).toContain("VERIFY_CI_COMPONENT_MISSING:lint");
    const manifest = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };
    const withScript = (verifyCi: string) =>
      JSON.stringify({
        ...manifest,
        scripts: { ...manifest.scripts, "verify:ci": verifyCi },
      });
    expect(
      auditCiWorkflow(workflow, {
        packageJson: withScript(
          `${manifest.scripts["verify:ci"] ?? ""} && pnpm test:new`,
        ),
      }),
    ).toContain("VERIFY_CI_COMPONENT_MISSING:test:new");
    expect(
      auditCiWorkflow(workflow, {
        packageJson: withScript("pnpm lint; pnpm typecheck"),
      }),
    ).toContain("VERIFY_CI_UNPARSEABLE");
    expect(
      auditCiWorkflow(workflow, {
        packageJson: withScript("pnpm lint && pnpm test:e2e"),
      }),
    ).toEqual([]);
  });

  it("preserves required job names and runs independently after selection", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const parsed = parse(workflow) as {
      jobs: Record<string, { name?: string; needs?: string | string[] }>;
    };
    expect(Object.keys(parsed.jobs)).toEqual(
      expect.arrayContaining([
        "ci_selector",
        "dependency-audit",
        "application",
        "database-ci",
      ]),
    );
    expect(parsed.jobs.ci_selector?.name).toBe("ci-selector");
    expect(parsed.jobs.application?.name).toBeUndefined();
    expect(parsed.jobs["database-ci"]?.needs).toBe("ci_selector");
    expect(parsed.jobs.application?.needs).toEqual([
      "ci_selector",
      "static",
      "node_tests",
      "e2e",
      "e2e_demo",
    ]);
    expect(
      auditCiWorkflow(
        workflow.replace(
          "  database-ci:\n    needs: ci_selector\n",
          "  database-ci:\n    needs: application\n",
        ),
      ),
    ).toContain("DATABASE_CI_TRIGGER_UNSAFE");
  });

  it("rejects unbound, weak, or absent CI selection", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "          fetch-depth: 0",
          "          fetch-depth: 1",
        ),
      ),
    ).toContain("CI_SELECTOR_UNSAFE");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "if: always() && (needs.ci_selector.result != 'success' || needs.ci_selector.outputs.database_ci == 'RUN')",
          "if: needs.ci_selector.outputs.database_ci == 'RUN'",
        ),
      ),
    ).toContain("DATABASE_CI_TRIGGER_UNSAFE");
    expect(
      auditCiWorkflow(
        workflow.replace("  ci_selector:\n", "  removed_selector:\n"),
      ),
    ).toContain("CI_SELECTOR_UNSAFE");
  });

  it("gates each independent diagnostic on setup success without advisory failure", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const parsed = parse(workflow) as {
      jobs: {
        "database-ci": {
          steps: Array<{
            id?: string;
            if?: string;
            run?: string;
            "continue-on-error"?: boolean;
          }>;
        };
      };
    };
    const steps = parsed.jobs["database-ci"].steps;
    const setup = steps.find((step) => step.id === "database_setup");
    expect(setup?.run).toContain("db:ci:migrations");
    const diagnostics = steps.filter((step) =>
      step.if?.includes("database_setup.outcome"),
    );
    expect(diagnostics).toHaveLength(7);
    expect(
      diagnostics.every(
        (step) =>
          step.if ===
            "${{ always() && steps.database_setup.outcome == 'success' }}" &&
          step["continue-on-error"] === undefined,
      ),
    ).toBe(true);
    expect(diagnostics.map((step) => step.run)).toEqual(
      expect.arrayContaining([
        "corepack pnpm db:ci:test",
        "corepack pnpm db:ci:advisors",
        "corepack pnpm db:ci:types",
        "corepack pnpm db:types:check",
        "corepack pnpm test:integration:database",
        "corepack pnpm exec playwright install --with-deps chromium",
        "corepack pnpm test:e2e:database",
      ]),
    );
    expect(
      auditCiWorkflow(
        workflow.replace(
          "      - name: Remove the disposable stack and volumes",
          "      - name: Run security tests again\n        if: ${{ always() && steps.database_setup.outcome == 'success' }}\n        run: corepack pnpm test:security\n      - name: Remove the disposable stack and volumes",
        ),
      ),
    ).toContain("DATABASE_CI_STAGES_UNSAFE");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "steps.database_setup.outcome == 'success'",
          "success()",
        ),
      ),
    ).toContain("DATABASE_CI_STAGES_UNSAFE");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "run: corepack pnpm test:e2e:database",
          "run: corepack pnpm typecheck",
        ),
      ),
    ).toContain("DATABASE_CI_STAGES_UNSAFE");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "run: corepack pnpm db:ci:advisors",
          "continue-on-error: true\n        run: corepack pnpm db:ci:advisors",
        ),
      ),
    ).toContain("DATABASE_CI_STAGES_UNSAFE");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "  database-ci:\n",
          "  database-ci:\n    continue-on-error: true\n",
        ),
      ),
    ).toContain("DATABASE_CI_STAGES_UNSAFE");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "      - name: Remove the disposable stack and volumes",
          "      - name: Hide an earlier failure\n        run: exit 0\n      - name: Remove the disposable stack and volumes",
        ),
      ),
    ).toContain("DATABASE_CI_STAGES_UNSAFE");
  });

  it("requires Chromium and sanitized always-upload reports", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");

    expect(
      auditCiWorkflow(
        workflow.replace(
          "        run: corepack pnpm exec playwright install --with-deps chromium --only-shell\n",
          "        run: echo browser-not-installed\n",
        ),
      ),
    ).toContain("CHROMIUM_INSTALL_MISSING");
    expect(
      auditCiWorkflow(
        workflow.replaceAll(
          "        if: always()\n",
          "        if: success()\n",
        ),
      ),
    ).toEqual(
      expect.arrayContaining([
        "APPLICATION_REPORT_UPLOAD_MISSING:node_tests",
        "APPLICATION_REPORT_UPLOAD_MISSING:e2e",
        "APPLICATION_REPORT_UPLOAD_MISSING:e2e_demo",
        "DATABASE_CI_REPORT_UPLOAD_MISSING",
        "DATABASE_CI_CLEANUP_MISSING",
      ]),
    );

    expect(
      auditCiWorkflow(
        workflow.replace(
          "            src/types/database.generated.ts\n",
          "            .env.local\n",
        ),
      ),
    ).toContain("DATABASE_CI_REPORT_UPLOAD_MISSING");
  });

  it("fails the required application gate unless every application job succeeds", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const parsed = parse(workflow) as {
      jobs: { application: { steps: Array<{ env?: Record<string, string> }> } };
    };
    expect(parsed.jobs.application.steps).toHaveLength(1);
    expect(parsed.jobs.application.steps[0]?.env).toEqual({
      STATIC_RESULT: "${{ needs.static.result }}",
      NODE_TESTS_RESULT: "${{ needs.node_tests.result }}",
      E2E_RESULT: "${{ needs.e2e.result }}",
      E2E_DEMO_RESULT: "${{ needs.e2e_demo.result }}",
    });
    for (const unsafe of [
      workflow.replace(
        "needs: [ci_selector, static, node_tests, e2e, e2e_demo]",
        "needs: [ci_selector, static, node_tests, e2e]",
      ),
      workflow.replace(
        'test "$E2E_DEMO_RESULT" = success || { echo "e2e_demo: $E2E_DEMO_RESULT"; exit 1; }',
        'test "$E2E_DEMO_RESULT" = success || true',
      ),
      workflow.replace(
        "E2E_DEMO_RESULT: ${{ needs.e2e_demo.result }}",
        "E2E_DEMO_RESULT: success",
      ),
      workflow.replace(
        "      - name: Require every application job to pass\n",
        "      - name: Run heavy work in the gate\n        run: corepack pnpm verify:ci\n      - name: Require every application job to pass\n",
      ),
      workflow.replace(
        "      - name: Require every application job to pass\n",
        "      - name: Require every application job to pass\n        continue-on-error: true\n",
      ),
    ]) {
      expect(auditCiWorkflow(unsafe)).toContain("APPLICATION_GATE_UNSAFE");
    }
  });

  it("requires complete fail-slow e2e shards", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");

    expect(
      auditCiWorkflow(
        workflow.replace("shard: [1, 2, 3, 4, 5]", "shard: [1, 2, 4, 5]"),
      ),
    ).toContain("E2E_SHARDING_UNSAFE:e2e_demo");
    expect(
      auditCiWorkflow(workflow.replace("fail-fast: false", "fail-fast: true")),
    ).toContain("E2E_SHARDING_UNSAFE:e2e");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "--fully-parallel --shard=${{ matrix.shard }}/${{ strategy.job-total }}",
          "--fully-parallel --shard=${{ matrix.shard }}/8",
        ),
      ),
    ).toContain("E2E_SHARDING_UNSAFE:e2e_demo");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "group: e2e-${{ matrix.shard }}-${{ github.workflow }}-${{ github.ref }}",
          "group: e2e-${{ github.workflow }}-${{ github.ref }}",
        ),
      ),
    ).toContain("APPLICATION_CONCURRENCY_MISSING:e2e");
  });

  it("rejects masked, conditional, advisory or secret application work", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");

    expect(
      auditCiWorkflow(
        workflow.replace(
          "        run: corepack pnpm lint\n",
          "        run: corepack pnpm lint || true\n",
        ),
      ),
    ).toContain("APPLICATION_COMMAND_UNSAFE:static");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "      - name: Lint\n",
          "      - name: Lint\n        if: github.event_name == 'push'\n",
        ),
      ),
    ).toContain("APPLICATION_STEP_CONDITIONAL:static");
    expect(
      auditCiWorkflow(
        workflow.replace("  e2e:\n", "  e2e:\n    continue-on-error: true\n"),
      ),
    ).toContain("APPLICATION_ADVISORY_FAILURE:e2e");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "  static:\n",
          "  static:\n    env:\n      LEAK_PROBE: ${{ secrets.UNIMIND_CI_SUPABASE_ACCESS_TOKEN }}\n",
        ),
      ),
    ).toContain("APPLICATION_SECRET_PRESENT:static");
    expect(
      auditCiWorkflow(
        workflow.replace(
          "          persist-credentials: false\n",
          "          persist-credentials: true\n",
        ),
      ),
    ).toContain("CHECKOUT_CREDENTIALS_PERSISTED");
  });
});
