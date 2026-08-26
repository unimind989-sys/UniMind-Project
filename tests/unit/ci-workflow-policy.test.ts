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
  });
});
