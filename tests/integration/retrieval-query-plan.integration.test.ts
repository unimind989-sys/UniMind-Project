import { describe, expect, it } from "vitest";

import { assertReasonableRetrievalPlan } from "../../scripts/lib/retrieval-query-plan";

function representativeInvocation(
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return [
    {
      Plan: {
        "Node Type": "Function Scan",
        "Function Name": "retrieve_authorized_segments",
        "Actual Loops": 1,
        "Actual Rows": 50,
        "Temp Read Blocks": 0,
        "Temp Written Blocks": 0,
        ...overrides,
      },
    },
  ];
}

function representativeBody(overrides: Readonly<Record<string, unknown>> = {}) {
  return [
    {
      Plan: {
        "Node Type": "Limit",
        "Actual Loops": 1,
        "Actual Rows": 50,
        Plans: [
          {
            "Node Type": "Index Scan",
            "Relation Name": "segment_embeddings",
            "Index Name": "segment_embeddings_synthetic_v1_cosine_hnsw_idx",
            "Actual Loops": 1,
            "Actual Rows": 200,
          },
          {
            "Node Type": "Bitmap Heap Scan",
            "Relation Name": "source_segments",
            "Index Name": "source_segments_retrieval_scope_idx",
            "Actual Loops": 1,
            "Actual Rows": 512,
            ...overrides,
          },
          {
            "Node Type": "Bitmap Index Scan",
            "Relation Name": "source_segments",
            "Index Name": "source_segments_content_search_idx",
            "Actual Loops": 1,
            "Actual Rows": 512,
          },
          ...[
            "source_versions",
            "source_assets",
            "curriculum_units",
            "cohorts",
            "cohort_releases",
          ].map((relation) => ({
            "Node Type": "Index Scan",
            "Relation Name": relation,
            "Index Name": `${relation}_representative_idx`,
            "Actual Loops": 1,
            "Actual Rows": 1,
          })),
        ],
      },
    },
  ];
}

describe("authorized hybrid retrieval query-plan contract", () => {
  it("accepts the scoped vector and full-text indexes without disk spill", () => {
    expect(() =>
      assertReasonableRetrievalPlan(
        representativeInvocation(),
        representativeBody(),
      ),
    ).not.toThrow();
  });

  it("rejects repeated retrieval-function execution", () => {
    expect(() =>
      assertReasonableRetrievalPlan(
        representativeInvocation({ "Actual Loops": 2 }),
        representativeBody(),
      ),
    ).toThrow("exactly once");
  });

  it("rejects an unbounded representative result", () => {
    expect(() =>
      assertReasonableRetrievalPlan(
        representativeInvocation({ "Actual Rows": 51 }),
        representativeBody(),
      ),
    ).toThrow("bounded result set");
  });

  it("rejects losing a required retrieval index", () => {
    expect(() =>
      assertReasonableRetrievalPlan(
        representativeInvocation(),
        representativeBody({
          "Index Name": "source_segments_unreviewed_idx",
        }),
      ),
    ).toThrow("source_segments_retrieval_scope_idx");
  });

  it("rejects a full sequential scan of the segment corpus", () => {
    expect(() =>
      assertReasonableRetrievalPlan(
        representativeInvocation(),
        representativeBody({
          "Node Type": "Seq Scan",
          "Actual Rows": 512,
          "Rows Removed by Filter": 4_096,
        }),
      ),
    ).toThrow("sequentially scan");
  });

  it("rejects temporary-block spills", () => {
    expect(() =>
      assertReasonableRetrievalPlan(
        representativeInvocation(),
        representativeBody({ "Temp Written Blocks": 1 }),
      ),
    ).toThrow("temporary blocks");
  });
});
