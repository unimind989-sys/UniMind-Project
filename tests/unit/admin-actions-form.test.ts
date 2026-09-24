import { expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  parseAdminActionRequest: vi.fn(),
  submitVerifiedAdminAction: vi.fn(),
}));

vi.mock("@/lib/admin/admin-actions.application", () => ({
  AdminActionBoundaryError: class extends Error {},
  parseAdminActionRequest: mocks.parseAdminActionRequest,
}));
vi.mock("@/lib/admin/admin-actions.supabase.server", () => ({
  submitVerifiedAdminAction: mocks.submitVerifiedAdminAction,
}));

it("rejects a missing expected version before reaching the admin mutation", async () => {
  const { submitAdminAction } = await import("../../src/app/admin/actions");
  const form = new FormData();
  form.set("action", "UNLOCK_COHORT");
  form.set("targetId", "a0000000-0000-4000-8000-000000000001");
  form.set("expectedState", "LOCKED");
  form.set("reason", "Release this synthetic cohort after review.");
  form.set("correlationId", "a0000000-0000-4000-8000-000000000002");
  form.set("idempotencyKey", "a0000000-0000-4000-8000-000000000003");

  await expect(submitAdminAction({ status: "IDLE" }, form)).resolves.toEqual({
    status: "ERROR",
    code: "INVALID_REQUEST",
  });
  expect(mocks.parseAdminActionRequest).not.toHaveBeenCalled();
  expect(mocks.submitVerifiedAdminAction).not.toHaveBeenCalled();
});
