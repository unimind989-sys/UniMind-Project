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
        "HOSTED_JOB_MISSING",
      ]),
    );
    expect(
      auditCiWorkflow(
        unsafe.replace("on: [pull_request_target]", "on: pull_request_target"),
      ),
    ).toContain("FORBIDDEN_TRIGGER");
  });

  it("rejects a hosted database job that can run pull-request code", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const unsafe = workflow.replace(
      "if: github.ref == 'refs/heads/main' && (github.event_name == 'push' || github.event_name == 'workflow_dispatch')",
      "if: github.event_name == 'pull_request'",
    );

    expect(auditCiWorkflow(unsafe)).toContain("HOSTED_TRIGGER_SCOPE_MISSING");
  });

  it("rejects hosted credentials exposed to every job step", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const unsafe = workflow.replace(
      "      UNIMIND_DB_ENVIRONMENT: ci\n",
      [
        "      UNIMIND_DB_ENVIRONMENT: ci",
        "      LEAK_PROBE: ${{secrets.UNIMIND_CI_SUPABASE_ACCESS_TOKEN}}",
        "",
      ].join("\n"),
    );

    expect(auditCiWorkflow(unsafe)).toContain("HOSTED_SECRET_SCOPE_UNSAFE");
  });

  it("rejects the write-all shorthand at job scope", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const unsafe = workflow.replace(
      "  hosted-ci:\n",
      "  hosted-ci:\n    permissions: write-all\n",
    );

    expect(auditCiWorkflow(unsafe)).toContain("WRITE_PERMISSION");
  });

  it("requires pull-request dependency review", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const unsafe = workflow.replace(
      /  dependency-review:[\s\S]*?\n  application:/u,
      "  application:",
    );

    expect(auditCiWorkflow(unsafe)).toContain("DEPENDENCY_REVIEW_MISSING");
  });

  it("requires immutable-lockfile installation in both execution jobs", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const unsafe = workflow.replaceAll(
      "corepack pnpm install --frozen-lockfile",
      "corepack pnpm install",
    );

    expect(auditCiWorkflow(unsafe)).toContain("FROZEN_INSTALL_MISSING");
  });

  it("rejects dependency or build caching from the foundation workflow", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const unsafe = workflow.replace(
      "          node-version-file: .nvmrc\n",
      "          node-version-file: .nvmrc\n          cache: pnpm\n",
    );

    expect(auditCiWorkflow(unsafe)).toContain("CACHE_CONFIGURED");
  });

  it("requires the complete credential-free application gate", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const unsafe = workflow.replace(
      "        run: corepack pnpm verify\n",
      "        run: corepack pnpm typecheck\n",
    );

    expect(auditCiWorkflow(unsafe)).toContain("APPLICATION_GATE_MISSING");
  });

  it("requires the pinned Chromium runtime on the fresh runner", async () => {
    const workflow = await readFile(".github/workflows/ci.yml", "utf8");
    const unsafe = workflow.replace(
      "        run: corepack pnpm exec playwright install --with-deps chromium\n",
      "        run: echo browser-not-installed\n",
    );

    expect(auditCiWorkflow(unsafe)).toContain("CHROMIUM_INSTALL_MISSING");
  });
});
