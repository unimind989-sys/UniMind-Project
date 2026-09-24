import { describe, expect, it, vi } from "vitest";

import {
  AdminActionBoundaryError,
  adminActionRequestSchema,
  type AdminActionRequest,
} from "../../src/lib/admin/admin-actions.domain";
import { runAdminAction } from "../../src/lib/admin/admin-actions.application";
import { loadAdminActionQueue } from "../../src/lib/admin/admin-readiness.application";

const targetId = "a0000000-0000-4000-8000-000000000001";
const correlationId = "a0000000-0000-4000-8000-000000000002";
const idempotencyKey = "a0000000-0000-4000-8000-000000000003";

const requests: readonly AdminActionRequest[] = [
  {
    action: "PUBLISH_UNIT",
    targetId,
    expectedState: "DRAFT",
    expectedVersion: 1,
    reason: "Approve this synthetic unit for the current cohort.",
    correlationId,
    idempotencyKey,
  },
  {
    action: "HIDE_UNIT",
    targetId,
    expectedState: "PUBLISHED",
    expectedVersion: 2,
    reason: "Contain this synthetic unit while review is open.",
    correlationId,
    idempotencyKey,
  },
  {
    action: "UNLOCK_COHORT",
    targetId,
    expectedState: "LOCKED",
    expectedVersion: 0,
    reason: "Release this synthetic cohort after readiness review.",
    correlationId,
    idempotencyKey,
  },
  {
    action: "LOCK_COHORT",
    targetId,
    expectedState: "UNLOCKED",
    expectedVersion: 1,
    reason: "Contain this synthetic cohort during review.",
    correlationId,
    idempotencyKey,
  },
  {
    action: "ACTIVATE_SOURCE",
    targetId,
    expectedState: "INACTIVE",
    expectedVersion: 1,
    reason: "Activate the accepted synthetic source version.",
    correlationId,
    idempotencyKey,
  },
  {
    action: "DEACTIVATE_SOURCE",
    targetId,
    expectedState: "ACTIVE",
    expectedVersion: 2,
    reason: "Remove this synthetic version from availability.",
    correlationId,
    idempotencyKey,
  },
  {
    action: "QUARANTINE_SOURCE",
    targetId,
    expectedState: "FAILED",
    expectedVersion: 1,
    reason: "Quarantine this synthetic source for review.",
    correlationId,
    idempotencyKey,
  },
  {
    action: "RETRY_SOURCE",
    targetId,
    expectedState: "FAILED",
    expectedVersion: 1,
    reason: "Request a deterministic retry for this source.",
    correlationId,
    idempotencyKey,
  },
  {
    action: "PLACE_RAW_HOLD",
    targetId,
    expectedState: "STORED",
    expectedVersion: 1,
    reason: "Preserve this synthetic object for its review window.",
    correlationId,
    idempotencyKey,
    holdExpiresAt: "2030-01-01T00:00:00.000Z",
    reviewAttested: true,
  },
  {
    action: "REMOVE_RAW_HOLD",
    targetId,
    expectedState: "HELD",
    expectedVersion: 2,
    reason: "Remove the synthetic hold after the fresh safety review.",
    correlationId,
    idempotencyKey,
  },
  {
    action: "ENABLE_FLAG",
    targetId,
    expectedState: "DISABLED",
    expectedVersion: 1,
    reason: "Enable this approved deterministic mock artifact.",
    correlationId,
    idempotencyKey,
  },
  {
    action: "DISABLE_FLAG",
    targetId,
    expectedState: "ENABLED",
    expectedVersion: 2,
    reason: "Disable this artifact while its behavior is reviewed.",
    correlationId,
    idempotencyKey,
  },
];

const result = {
  commandId: "a0000000-0000-4000-8000-000000000004",
  status: "APPLIED" as const,
  currentState: "READY",
  nextState: "UPDATED",
  replayed: false,
};

describe("audited admin action request contract", () => {
  it.each(requests)("accepts the bounded $action request shape", (request) => {
    expect(adminActionRequestSchema.safeParse(request).success).toBe(true);
  });

  it.each(requests)("rejects a forged prior state for $action", (request) => {
    expect(
      adminActionRequestSchema.safeParse({
        ...request,
        expectedState: "READY",
      }),
    ).toMatchObject({ success: false });
  });

  it("requires both hold expiry and explicit review attestation", () => {
    const request = requests.find(
      (candidate) => candidate.action === "PLACE_RAW_HOLD",
    );
    expect(request).toBeDefined();
    if (request?.action !== "PLACE_RAW_HOLD") return;

    expect(
      adminActionRequestSchema.safeParse({ ...request, reviewAttested: false })
        .success,
    ).toBe(false);
    expect(
      adminActionRequestSchema.safeParse({
        ...request,
        holdExpiresAt: undefined,
      }).success,
    ).toBe(false);
  });

  it("rejects short reasons, invalid identifiers, and stale-version encodings", () => {
    const request = requests[0];
    expect(
      adminActionRequestSchema.safeParse({ ...request, reason: "no" }).success,
    ).toBe(false);
    expect(
      adminActionRequestSchema.safeParse({ ...request, targetId: "fixture" })
        .success,
    ).toBe(false);
    expect(
      adminActionRequestSchema.safeParse({ ...request, expectedVersion: -1 })
        .success,
    ).toBe(false);
  });
});

describe("audited admin action application", () => {
  it.each(requests)(
    "delegates $action with the verified actor",
    async (request) => {
      const submit = vi.fn().mockResolvedValue(result);

      await expect(
        runAdminAction(
          { submit },
          "a0000000-0000-4000-8000-000000000005",
          request,
        ),
      ).resolves.toEqual(result);
      expect(submit).toHaveBeenCalledOnce();
      expect(submit).toHaveBeenCalledWith(
        "a0000000-0000-4000-8000-000000000005",
        request,
      );
    },
  );

  it("rejects an empty actor before reaching the repository", async () => {
    const submit = vi.fn();

    await expect(
      runAdminAction({ submit }, "", requests[0]),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(submit).not.toHaveBeenCalled();
  });

  it("rejects malformed input before reaching the repository", async () => {
    const submit = vi.fn();

    await expect(
      runAdminAction({ submit }, "synthetic-admin", {
        ...requests[0],
        reason: "x",
      }),
    ).rejects.toMatchObject({ code: "INVALID_REQUEST" });
    expect(submit).not.toHaveBeenCalled();
  });

  it("strips database diagnostics and private payload fields from its result", async () => {
    const submit = vi.fn().mockResolvedValue({
      ...result,
      rawObjectKey: "synthetic/private/object-key",
      providerPayload: { privateText: "synthetic source text" },
    });

    const response = await runAdminAction(
      { submit },
      "a0000000-0000-4000-8000-000000000005",
      requests[0],
    );

    expect(response).toEqual(result);
    expect(JSON.stringify(response)).not.toContain(
      "synthetic/private/object-key",
    );
    expect(JSON.stringify(response)).not.toContain("synthetic source text");
  });

  it("fails closed on an invalid repository response", async () => {
    await expect(
      runAdminAction(
        { submit: vi.fn().mockResolvedValue({ status: "PRIVATE_DIAGNOSTIC" }) },
        "a0000000-0000-4000-8000-000000000005",
        requests[0],
      ),
    ).rejects.toBeInstanceOf(AdminActionBoundaryError);
  });
});

const candidateBase = {
  candidateId: "unit:publish:a0000000-0000-4000-8000-000000000001",
  action: "PUBLISH_UNIT",
  targetId,
  targetLabelEn: "Synthetic Unit",
  targetLabelAr: "وحدة تجريبية",
  currentState: "DRAFT",
  proposedState: "PUBLISHED",
  expectedState: "DRAFT",
  expectedVersion: 1,
  failedPredicates: [],
  protected: true,
  pendingActionId: null,
  reason: null,
  commandState: null,
  initiatorSlot: null,
  correlationId: null,
};

describe("audited admin decision queue", () => {
  it("prioritizes pending confirmation and review requests", async () => {
    const repository = {
      loadActionQueue: vi.fn().mockResolvedValue([
        { ...candidateBase, candidateId: "z-ready" },
        {
          ...candidateBase,
          candidateId: "y-review",
          commandState: "PENDING_OWNER_REVIEW",
        },
        {
          ...candidateBase,
          candidateId: "x-confirm",
          commandState: "PENDING_SECOND_CONFIRMATION",
          pendingActionId: "a0000000-0000-4000-8000-000000000006",
          correlationId,
          initiatorSlot: "AHMED",
        },
      ]),
    };

    await expect(
      loadAdminActionQueue(repository, "a0000000-0000-4000-8000-000000000005"),
    ).resolves.toMatchObject({
      status: "READY",
      candidates: [
        { candidateId: "x-confirm", correlationId },
        { candidateId: "y-review" },
        { candidateId: "z-ready" },
      ],
    });
  });

  it("rejects malformed candidates and never queries for an empty actor", async () => {
    const repository = { loadActionQueue: vi.fn().mockResolvedValue([{}]) };

    await expect(loadAdminActionQueue(repository, "admin-id")).resolves.toEqual(
      {
        status: "UNAVAILABLE",
      },
    );
    await expect(loadAdminActionQueue(repository, "")).resolves.toEqual({
      status: "FORBIDDEN",
    });
    expect(repository.loadActionQueue).toHaveBeenCalledOnce();
  });

  it("does not expose an internal exception as queue state", async () => {
    const repository = {
      loadActionQueue: vi
        .fn()
        .mockRejectedValue(new Error("private database detail")),
    };

    await expect(loadAdminActionQueue(repository, "admin-id")).resolves.toEqual(
      {
        status: "UNAVAILABLE",
      },
    );
  });
});
