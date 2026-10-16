import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  loadVerifiedAdminActionQueue,
  submitVerifiedAdminAction,
} from "../../src/lib/admin/admin-actions.supabase.server";

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
const hideRequest = {
  action: "HIDE_UNIT",
  targetId,
  expectedState: "PUBLISHED",
  expectedVersion: 2,
  reason: "Contain this synthetic unit while review is open.",
  correlationId: "a0000000-0000-4000-8000-000000000002",
  idempotencyKey: "a0000000-0000-4000-8000-000000000003",
} as const;

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
    const result = await submitVerifiedAdminAction(hideRequest);

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

  it("rejects an unverified caller before any governance RPC", async () => {
    mocks.requireVerifiedIdentity.mockRejectedValue(new Error("unverified"));

    await expect(submitVerifiedAdminAction(hideRequest)).rejects.toThrow();
    await expect(loadVerifiedAdminActionQueue()).resolves.toEqual({
      status: "FORBIDDEN",
    });
    expect(mocks.submitAdminGovernanceActionRpc).not.toHaveBeenCalled();
    expect(mocks.loadAdminActionQueueRpc).not.toHaveBeenCalled();
  });

  it("blocks a principal change between the action boundary and repository call", async () => {
    mocks.requireVerifiedIdentity
      .mockResolvedValueOnce({ userId: adminId })
      .mockResolvedValueOnce({
        userId: "a0000000-0000-4000-8000-000000000007",
      });

    await expect(submitVerifiedAdminAction(hideRequest)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(mocks.submitAdminGovernanceActionRpc).not.toHaveBeenCalled();
  });

  it.each([
    [
      "a non-admin caller rejected by the database",
      {
        data: null,
        error: { code: "42501", message: "ADMIN_ACTION:FORBIDDEN" },
      },
      "FORBIDDEN",
    ],
    [
      "a stale expected version",
      { data: null, error: { message: "ADMIN_ACTION:STALE_VERSION" } },
      "STALE_VERSION",
    ],
    [
      "private database failures",
      { data: null, error: { message: "secret diagnostic" } },
      "UNAVAILABLE",
    ],
    [
      "a malformed RPC result",
      { data: { status: "SECRET" }, error: null },
      "UNAVAILABLE",
    ],
  ])("maps %s to a safe boundary code", async (_, response, code) => {
    mocks.submitAdminGovernanceActionRpc.mockResolvedValue(response);

    await expect(submitVerifiedAdminAction(hideRequest)).rejects.toMatchObject({
      code,
    });
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

    const queue = await loadVerifiedAdminActionQueue();

    expect(mocks.loadAdminActionQueueRpc).toHaveBeenCalledWith(
      expect.objectContaining({ p_actor_id: adminId }),
    );
    expect(queue).toMatchObject({
      status: "READY",
      candidates: [{ candidateId: `unit:hide:${targetId}` }],
    });
    expect(JSON.stringify(queue)).not.toContain("synthetic/private/key");
  });
});
