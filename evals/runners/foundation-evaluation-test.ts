import { describe, expect, it } from "vitest";

import { runFoundationEvaluation } from "./foundation-evaluation";

// The versioned dataset itself is run by scripts/run-foundation-evaluation.ts
// as part of `pnpm test:eval`; these tests prove the runner's failure paths.
describe("foundation evaluation runner", () => {
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
