import { describe, expect, it, vi } from "vitest";

import { DeterministicMockAnswerGenerator } from "../../src/lib/ai/mocks/answer-generator.mock.adapter";

describe("answer generation through the deterministic provider boundary", () => {
  it("returns a grounded synthetic answer with no network or cost", async () => {
    const fetch = vi.fn(() => {
      throw new Error("Integration mock attempted forbidden network access.");
    });
    vi.stubGlobal("fetch", fetch);

    try {
      const provider = new DeterministicMockAnswerGenerator("success");
      const result = await provider.generateAnswer(
        {
          question: "What does the approved synthetic segment state?",
          responseLanguage: "en",
          evidence: [
            {
              segmentId: "segment-synthetic-1",
              sourceVersionId: "source-version-synthetic-1",
              text: "Synthetic approved evidence.",
            },
          ],
        },
        {
          correlationId: "integration-correlation-1",
          idempotencyKey: "integration-idempotency-1",
          timeoutMs: 2_000,
          attempt: 1,
        },
      );

      expect(result).toMatchObject({
        status: "SUCCEEDED",
        value: {
          text: "Synthetic grounded answer.",
          citedSegmentIds: ["segment-synthetic-1"],
        },
        usage: {
          calculatedCost: { amountMinor: 0, currency: null },
        },
      });
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
