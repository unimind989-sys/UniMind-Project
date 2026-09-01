import { describe, expect, it } from "vitest";

import { assertReasonableAvailabilityPlan } from "../../scripts/lib/availability-query-plan";

function representativePlan(overrides: Readonly<Record<string, unknown>> = {}) {
  return [
    {
      Plan: {
        "Node Type": "Function Scan",
        "Function Name": "available_curriculum_units",
        "Actual Loops": 1,
        "Actual Rows": 513,
        "Temp Read Blocks": 0,
        "Temp Written Blocks": 0,
        ...overrides,
      },
      "Planning Time": 0.1,
      "Execution Time": 1,
    },
  ];
}

describe("student catalog availability query-plan contract", () => {
  it("accepts one non-spilling invocation on representative synthetic rows", () => {
    expect(() =>
      assertReasonableAvailabilityPlan(representativePlan()),
    ).not.toThrow();
  });

  it("rejects repeated function execution without depending on cost estimates", () => {
    expect(() =>
      assertReasonableAvailabilityPlan(
        representativePlan({ "Actual Loops": 2 }),
      ),
    ).toThrow("exactly once");
  });

  it("rejects temporary-block spills without pinning volatile cost numbers", () => {
    expect(() =>
      assertReasonableAvailabilityPlan(
        representativePlan({ "Temp Written Blocks": 1 }),
      ),
    ).toThrow("temporary blocks");
  });
});
