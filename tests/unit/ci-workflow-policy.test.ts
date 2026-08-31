import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { auditCiWorkflow } from "../../scripts/lib/ci-workflow-policy";

describe("CI workflow policy", () => {
  it("accepts the repository workflow contract", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");

    expect(auditCiWorkflow(workflow)).toEqual([]);
  });

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
        "APPLICATION_CONCURRENCY_MISSING",
        "DATABASE_CI_JOB_MISSING",
      ]),
    );
    expect(
      auditCiWorkflow(
        unsafe.replace("on: [pull_request_target]", "on: pull_request_target"),
      ),
    ).toContain("FORBIDDEN_TRIGGER");
  });

  it("requires disposable database CI on pull requests", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const unsafe = workflow.replace(
      "    needs: application\n",
      "    needs: application\n    if: github.ref == 'refs/heads/main'\n",
    );

    expect(auditCiWorkflow(unsafe)).toContain("DATABASE_CI_TRIGGER_UNSAFE");
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
        "APPLICATION_RUNNER_UNPINNED",
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

  it("rejects caching and incomplete application gates", async () => {
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
          "        run: corepack pnpm verify\n",
          "        run: corepack pnpm typecheck\n",
        ),
      ),
    ).toContain("APPLICATION_GATE_MISSING");
  });

  it("requires Chromium and sanitized always-upload reports", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");

    expect(
      auditCiWorkflow(
        workflow.replace(
          "        run: corepack pnpm exec playwright install --with-deps chromium\n",
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
        "APPLICATION_REPORT_UPLOAD_MISSING",
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
});
