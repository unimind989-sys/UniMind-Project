import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadAdminActionQueueRpc: vi.fn(),
  requireVerifiedIdentity: vi.fn(),
  submitAdminGovernanceActionRpc: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../../src/lib/auth/verified-identity.server", () => ({
  requireVerifiedIdentity: mocks.requireVerifiedIdentity,
}));
vi.mock("../../src/lib/db/supabase/admin.server", () => ({
  loadAdminActionQueueRpc: mocks.loadAdminActionQueueRpc,
  submitAdminGovernanceActionRpc: mocks.submitAdminGovernanceActionRpc,
}));

const adminId = "a0000000-0000-4000-8000-000000000005";
const targetId = "a0000000-0000-4000-8000-000000000001";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireVerifiedIdentity.mockResolvedValue({ userId: adminId });
  mocks.submitAdminGovernanceActionRpc.mockResolvedValue({
    data: {
      commandId: "a0000000-0000-4000-8000-000000000004",
      status: "APPLIED",
      currentState: "PUBLISHED",
      nextState: "WITHDRAWN",
      replayed: false,
      rawObjectKey: "synthetic/private/key",
    },
    error: null,
  });
});

describe("server-only audited admin RPC adapter", () => {
  it("re-derives the verified actor and calls only the bounded governance RPC", async () => {
    const { submitVerifiedAdminAction } =
      await import("../../src/lib/admin/admin-actions.supabase.server");

    const result = await submitVerifiedAdminAction({
      action: "HIDE_UNIT",
      targetId,
      expectedState: "PUBLISHED",
      expectedVersion: 2,
      reason: "Contain this synthetic unit while review is open.",
      correlationId: "a0000000-0000-4000-8000-000000000002",
      idempotencyKey: "a0000000-0000-4000-8000-000000000003",
    });

    expect(mocks.requireVerifiedIdentity).toHaveBeenCalledTimes(2);
    expect(mocks.submitAdminGovernanceActionRpc).toHaveBeenCalledOnce();
    expect(mocks.submitAdminGovernanceActionRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_actor_id: adminId,
        p_action: "HIDE_UNIT",
        p_target_id: targetId,
        p_expected_version: 2,
        p_expected_state: "PUBLISHED",
      }),
    );
    expect(result).not.toHaveProperty("rawObjectKey");
  });

  it("blocks a principal change between the action boundary and repository call", async () => {
    mocks.requireVerifiedIdentity
      .mockResolvedValueOnce({ userId: adminId })
      .mockResolvedValueOnce({
        userId: "a0000000-0000-4000-8000-000000000007",
      });
    const { submitVerifiedAdminAction } =
      await import("../../src/lib/admin/admin-actions.supabase.server");

    await expect(
      submitVerifiedAdminAction({
        action: "HIDE_UNIT",
        targetId,
        expectedState: "PUBLISHED",
        expectedVersion: 2,
        reason: "Contain this synthetic unit while review is open.",
        correlationId: "a0000000-0000-4000-8000-000000000002",
        idempotencyKey: "a0000000-0000-4000-8000-000000000003",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.submitAdminGovernanceActionRpc).not.toHaveBeenCalled();
  });

  it("maps private database failures to a safe boundary code", async () => {
    mocks.submitAdminGovernanceActionRpc.mockResolvedValue({
      data: null,
      error: { message: "secret diagnostic" },
    });
    const { submitVerifiedAdminAction } =
      await import("../../src/lib/admin/admin-actions.supabase.server");

    await expect(
      submitVerifiedAdminAction({
        action: "HIDE_UNIT",
        targetId,
        expectedState: "PUBLISHED",
        expectedVersion: 2,
        reason: "Contain this synthetic unit while review is open.",
        correlationId: "a0000000-0000-4000-8000-000000000002",
        idempotencyKey: "a0000000-0000-4000-8000-000000000003",
      }),
    ).rejects.toMatchObject({ code: "UNAVAILABLE" });
  });

  it("maps database queue columns into the validated browser candidate", async () => {
    mocks.loadAdminActionQueueRpc.mockResolvedValue({
      data: [
        {
          candidate_id: `unit:hide:${targetId}`,
          action: "HIDE_UNIT",
          target_id: targetId,
          target_label_en: "Synthetic unit",
          target_label_ar: "وحدة تجريبية",
          current_state: "PUBLISHED",
          proposed_state: "WITHDRAWN",
          expected_state: "PUBLISHED",
          expected_version: 2,
          failed_predicates: [],
          protected: false,
          pending_action_id: null,
          reason: null,
          command_state: null,
          initiator_slot: null,
          correlation_id: null,
          object_key: "synthetic/private/key",
        },
      ],
      error: null,
    });
    const { loadVerifiedAdminActionQueue } =
      await import("../../src/lib/admin/admin-actions.supabase.server");

    const queue = await loadVerifiedAdminActionQueue();

    expect(queue).toMatchObject({
      status: "READY",
      candidates: [{ candidateId: `unit:hide:${targetId}` }],
    });
    expect(queue).not.toHaveProperty("object_key");
    if (queue.status === "READY") {
      expect(queue.candidates[0]).not.toHaveProperty("object_key");
    }
  });
});
