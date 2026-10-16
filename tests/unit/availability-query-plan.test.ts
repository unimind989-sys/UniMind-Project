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

function representativeBody(overrides: Readonly<Record<string, unknown>> = {}) {
  return [
    {
      Plan: {
        "Node Type": "Sort",
        "Actual Loops": 1,
        "Actual Rows": 513,
        Plans: [
          {
            "Node Type": "Seq Scan",
            "Relation Name": "curriculum_units",
            "Actual Loops": 1,
            "Actual Rows": 513,
          },
          {
            "Node Type": "Index Scan",
            "Relation Name": "source_assets",
            "Actual Loops": 513,
            "Actual Rows": 1,
            ...overrides,
          },
          {
            "Node Type": "Index Scan",
            "Relation Name": "source_versions",
            "Actual Loops": 513,
            "Actual Rows": 1,
          },
        ],
      },
    },
  ];
}

describe("student catalog availability query-plan contract", () => {
  it("accepts one non-spilling invocation on representative synthetic rows", () => {
    expect(() =>
      assertReasonableAvailabilityPlan(
        representativePlan(),
        representativeBody(),
      ),
    ).not.toThrow();
  });

  it("rejects repeated function execution without depending on cost estimates", () => {
    expect(() =>
      assertReasonableAvailabilityPlan(
        representativePlan({ "Actual Loops": 2 }),
        representativeBody(),
      ),
    ).toThrow("exactly once");
  });

  it("rejects temporary-block spills without pinning volatile cost numbers", () => {
    expect(() =>
      assertReasonableAvailabilityPlan(
        representativePlan({ "Temp Written Blocks": 1 }),
        representativeBody(),
      ),
    ).toThrow("temporary blocks");
  });

  it("rejects repeated full source scans inside the installed SQL body", () => {
    expect(() =>
      assertReasonableAvailabilityPlan(
        representativePlan(),
        representativeBody({
          "Node Type": "Seq Scan",
          "Rows Removed by Filter": 512,
        }),
      ),
    ).toThrow("repeatedly scans");
  });

  it("rejects mismatched invocation and installed-body row counts", () => {
    expect(() =>
      assertReasonableAvailabilityPlan(
        representativePlan({ "Actual Rows": 514 }),
        representativeBody(),
      ),
    ).toThrow("row count");
  });

  it("rejects an opaque Function Scan in place of the installed-body plan", () => {
    expect(() =>
      assertReasonableAvailabilityPlan(
        representativePlan(),
        representativePlan(),
      ),
    ).toThrow("missing curriculum_units");
  });
});
