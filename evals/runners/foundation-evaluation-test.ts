import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { runFoundationEvaluation } from "./foundation-evaluation";

describe("foundation evaluation runner", () => {
  it("consumes versioned JSONL through the public availability seam", async () => {
    const source = await readFile(
      "evals/datasets/foundation/foundation-availability-v1.jsonl",
      "utf8",
    );
    const report = runFoundationEvaluation(source);

    expect(report).toMatchObject({
      schemaVersion: 1,
      datasetId: "foundation-availability-v1",
      totalCases: 3,
      passedCases: 3,
      failedCases: 0,
      status: "PASS",
    });
    expect(report.datasetSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("names the JSONL line when schema validation fails", () => {
    expect(() => runFoundationEvaluation('{"schema_version":1}\n')).toThrow(
      "Evaluation dataset line 1 is invalid",
    );
  });

  it("reports the exact case when an expected boundary is broken", () => {
    const source = `${JSON.stringify({
      schema_version: 1,
      dataset_id: "synthetic-red-proof-v1",
      case_id: "deny-missing-membership",
      input: {
        hasActiveMembership: false,
        cohortReleased: true,
        unitPublished: true,
        hasActiveReadySource: true,
        rightsValid: true,
        curriculumEditionMatches: true,
      },
      expected: { available: true, reasons: [] },
    })}\n`;

    expect(runFoundationEvaluation(source)).toMatchObject({
      status: "FAIL",
      failedCases: 1,
      cases: [
        {
          caseId: "deny-missing-membership",
          status: "FAIL",
          message:
            "Expected available=true with reasons []; received available=false with reasons [membership_missing].",
        },
      ],
    });
  });
});
