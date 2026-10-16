import { describe, expect, it, vi } from "vitest";

import {
  initializeRealProvider,
  type RealProviderAuthorization,
} from "../../src/lib/ai/initialize-real-provider.application";
import { DeterministicMockAnswerGenerator } from "../../src/lib/ai/mocks/answer-generator.mock.adapter";
import { DeterministicMockEmbeddingProvider } from "../../src/lib/ai/mocks/embedding-provider.mock.adapter";
import { DeterministicMockOcrProvider } from "../../src/lib/ai/mocks/ocr-provider.mock.adapter";
import { DeterministicMockStructuredArtifactGenerator } from "../../src/lib/ai/mocks/structured-artifact-generator.mock.adapter";
import { DeterministicMockTranscriptionProvider } from "../../src/lib/ai/mocks/transcription-provider.mock.adapter";
import { DeterministicMockJobQueueProvider } from "../../src/lib/jobs/mocks/job-queue.mock.adapter";
import { DeterministicMockObjectStorageProvider } from "../../src/lib/storage/mocks/object-storage.mock.adapter";
import {
  deterministicProviderCaseIds,
  type DeterministicProviderCaseId,
} from "../../src/lib/testing/deterministic-provider.mock";
import {
  providerErrorCodes,
  type ProviderCallContext,
  type ProviderErrorCode,
  type ProviderResult,
  type ProviderStatus,
} from "../../src/types/provider";

type ProviderHarness = Readonly<{
  name: string;
  invoke: (context: ProviderCallContext) => Promise<ProviderResult<unknown>>;
}>;

const baseContext: ProviderCallContext = {
  correlationId: "synthetic-correlation",
  idempotencyKey: "synthetic-idempotency",
  timeoutMs: 2_000,
  attempt: 1,
};

const completeRealAuthorization: RealProviderAuthorization = {
  providerMode: "real",
  providerEnabled: true,
  approvedBudgetMinor: 1,
  environmentProfileApproved: true,
  providerConfigApproved: true,
  budgetPolicyApproved: true,
  credentialsPresent: true,
  rightsApproved: true,
  evaluationPassed: true,
  budgetPreflightApproved: true,
  liveCommandConfirmed: true,
  twoPersonApprovalRecorded: true,
};

function harnesses(caseId: DeterministicProviderCaseId): ProviderHarness[] {
  const answer = new DeterministicMockAnswerGenerator(caseId);
  const artifact = new DeterministicMockStructuredArtifactGenerator(caseId);
  const embedding = new DeterministicMockEmbeddingProvider(caseId);
  const transcription = new DeterministicMockTranscriptionProvider(caseId);
  const ocr = new DeterministicMockOcrProvider(caseId);
  const storage = new DeterministicMockObjectStorageProvider(caseId);
  const queue = new DeterministicMockJobQueueProvider(caseId);

  return [
    {
      name: "answer",
      invoke: (context) =>
        answer.generateAnswer(
          {
            question: "Synthetic question?",
            responseLanguage: "en",
            evidence: [
              {
                segmentId: "segment-1",
                sourceVersionId: "source-version-1",
                text: "Synthetic approved evidence.",
              },
            ],
          },
          context,
        ),
    },
    {
      name: "structured-artifact",
      invoke: (context) =>
        artifact.generateArtifact(
          {
            artifactType: "summary",
            schemaVersion: "synthetic-v1",
            instruction: "Use only the supplied evidence.",
            evidence: [
              {
                segmentId: "segment-1",
                sourceVersionId: "source-version-1",
                text: "Synthetic approved evidence.",
              },
            ],
          },
          context,
        ),
    },
    {
      name: "embedding",
      invoke: (context) => embedding.embed({ texts: ["synthetic"] }, context),
    },
    {
      name: "transcription",
      invoke: (context) =>
        transcription.transcribe(
          { audioObjectKey: "synthetic/audio", languageHint: "en" },
          context,
        ),
    },
    {
      name: "ocr",
      invoke: (context) =>
        ocr.recognize(
          {
            documentObjectKey: "synthetic/document",
            pageNumbers: [1],
            languageHints: ["en"],
          },
          context,
        ),
    },
    {
      name: "object-storage",
      invoke: (context) =>
        storage.putObject(
          {
            namespace: "temporary",
            objectKey: "synthetic/object",
            bytes: new Uint8Array([1, 2, 3]),
            contentType: "application/octet-stream",
          },
          context,
        ),
    },
    {
      name: "job-queue",
      invoke: (context) =>
        queue.enqueue(
          {
            jobId: "synthetic-job",
            jobType: "synthetic",
            availableAt: "2026-01-01T00:00:00.000Z",
          },
          context,
        ),
    },
  ];
}

const failureExpectations: Readonly<
  Record<
    Exclude<DeterministicProviderCaseId, "success" | "latency">,
    Readonly<{ status: ProviderStatus; code: ProviderErrorCode }>
  >
> = {
  "rate-limit": { status: "RETRYABLE_FAILURE", code: "RATE_LIMITED" },
  "timeout-before-accept": {
    status: "RETRYABLE_FAILURE",
    code: "TIMEOUT_BEFORE_ACCEPT",
  },
  "timeout-after-accept": {
    status: "OUTCOME_UNKNOWN",
    code: "TIMEOUT_UNKNOWN",
  },
  "malformed-output": {
    status: "TERMINAL_FAILURE",
    code: "MALFORMED_OUTPUT",
  },
  "terminal-rejection": {
    status: "TERMINAL_FAILURE",
    code: "CONTENT_REJECTED",
  },
  "invalid-input": { status: "TERMINAL_FAILURE", code: "INVALID_INPUT" },
  unauthorized: { status: "TERMINAL_FAILURE", code: "UNAUTHORIZED" },
  "rights-blocked": {
    status: "TERMINAL_FAILURE",
    code: "RIGHTS_BLOCKED",
  },
  "budget-blocked": {
    status: "TERMINAL_FAILURE",
    code: "BUDGET_BLOCKED",
  },
  "provider-unavailable": {
    status: "RETRYABLE_FAILURE",
    code: "PROVIDER_UNAVAILABLE",
  },
};

const contractMatrix = deterministicProviderCaseIds.flatMap((caseId) =>
  harnesses(caseId).map((harness) => ({ caseId, harness })),
);

describe("provider mock contract", () => {
  it.each(contractMatrix)(
    "$harness.name produces normalized $caseId metadata",
    async ({ caseId, harness }) => {
      const result = await harness.invoke(baseContext);

      expect(result).toMatchObject({
        configVersion: "mock-v1",
        attempt: 1,
        usage: {
          inputUnits: 0,
          outputUnits: 0,
          calculatedCost: { amountMinor: 0, currency: null },
        },
      });
      expect(result.provider).toMatch(/^mock-/);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);

      if (caseId === "success" || caseId === "latency") {
        expect(result.status).toBe("SUCCEEDED");
        expect(result.providerRequestId).toMatch(/^mock-/);
        expect(result.error).toBeNull();
        return;
      }

      const expected = failureExpectations[caseId];
      expect(result.status).toBe(expected.status);
      expect(result.error?.code).toBe(expected.code);
    },
  );

  it.each(harnesses("success"))(
    "$name is deterministic for the same idempotency context",
    async (harness) => {
      await expect(harness.invoke(baseContext)).resolves.toEqual(
        await harness.invoke(baseContext),
      );
    },
  );

  it.each(harnesses("success"))(
    "$name honors an already-aborted signal before acceptance",
    async (harness) => {
      const controller = new AbortController();
      controller.abort();
      const result = await harness.invoke({
        ...baseContext,
        signal: controller.signal,
      });

      expect(result).toMatchObject({
        status: "RETRYABLE_FAILURE",
        providerRequestId: null,
        error: {
          code: "PROVIDER_UNAVAILABLE",
          acceptance: "NOT_ACCEPTED",
        },
      });
    },
  );

  it("never calls fetch across the complete deterministic case matrix", async () => {
    const fetch = vi.fn(() => {
      throw new Error("Network access is forbidden in provider mocks.");
    });
    vi.stubGlobal("fetch", fetch);

    try {
      for (const { harness } of contractMatrix) {
        await harness.invoke(baseContext);
      }
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("answers cite exactly the supplied evidence segments", async () => {
    const [answer] = harnesses("success");
    await expect(answer?.invoke(baseContext)).resolves.toMatchObject({
      value: { citedSegmentIds: ["segment-1"] },
    });
  });

  it("keeps the required provider error taxonomy explicit", () => {
    expect(providerErrorCodes).toEqual([
      "INVALID_INPUT",
      "UNAUTHORIZED",
      "RIGHTS_BLOCKED",
      "RATE_LIMITED",
      "TIMEOUT_BEFORE_ACCEPT",
      "TIMEOUT_UNKNOWN",
      "PROVIDER_UNAVAILABLE",
      "CONTENT_REJECTED",
      "MALFORMED_OUTPUT",
      "BUDGET_BLOCKED",
    ]);
  });

  it.each([
    ["mock mode", { providerMode: "mock" }],
    ["disabled flag", { providerEnabled: false }],
    ["zero budget", { approvedBudgetMinor: 0 }],
    ["unapproved environment", { environmentProfileApproved: false }],
    ["unapproved provider config", { providerConfigApproved: false }],
    ["unapproved budget policy", { budgetPolicyApproved: false }],
    ["missing credentials", { credentialsPresent: false }],
    ["missing rights", { rightsApproved: false }],
    ["failed evaluation", { evaluationPassed: false }],
    ["failed budget preflight", { budgetPreflightApproved: false }],
    ["unconfirmed live command", { liveCommandConfirmed: false }],
    ["missing two-person approval", { twoPersonApprovalRecorded: false }],
  ] as const)("does not invoke a real initializer under %s", (_, change) => {
    const initializer = vi.fn(() => ({ initialized: true }));
    const authorization: RealProviderAuthorization = {
      ...completeRealAuthorization,
      ...change,
    };

    expect(() => initializeRealProvider(authorization, initializer)).toThrow(
      "Real provider initialization blocked",
    );
    expect(initializer).not.toHaveBeenCalled();
  });

  it("invokes a real initializer only after all local authorization facts pass", () => {
    const initializer = vi.fn(() => ({ initialized: true }));

    expect(
      initializeRealProvider(completeRealAuthorization, initializer),
    ).toEqual({ initialized: true });
    expect(initializer).toHaveBeenCalledOnce();
  });
});
