import { describe, expect, it } from "vitest";
import type { AdminActionCandidate } from "../../src/lib/admin/admin-actions.domain";
import {
  adminAlreadyInState,
  adminDecisionGroup,
  adminTargetKind,
  adminReviewBinding,
  selectedAdminDecision,
  adminDecisionHref,
} from "../../src/lib/admin/admin-presentation.application";

const candidate: AdminActionCandidate = {
  candidateId: "sample-hold",
  action: "PLACE_RAW_HOLD",
  targetId: "a0000000-0000-4000-8000-000000000009",
  targetLabelEn: "Synthetic handout raw object",
  targetLabelAr: "عنصر خام تجريبي",
  currentState: "NO_HOLD",
  proposedState: "HELD",
  expectedState: "NO_HOLD",
  expectedVersion: 2,
  failedPredicates: [],
  protected: true,
  pendingActionId: null,
  reason: null,
  commandState: null,
  initiatorSlot: null,
  correlationId: null,
  holdExpiresAt: null,
};
describe("admin decision presentation preserves governed boundaries", () => {
  it("treats only a sole already-applied predicate as neutral completion", () => {
    expect(
      adminAlreadyInState({
        ...candidate,
        commandState: "APPLIED",
        failedPredicates: ["target.already_applied"],
      }),
    ).toBe(true);
    expect(
      adminAlreadyInState({
        ...candidate,
        failedPredicates: ["target.already_applied"],
      }),
    ).toBe(true);
    for (const failedPredicates of [
      [],
      ["source.rights_current"],
      ["target.already_applied", "source.rights_current"],
    ])
      expect(adminAlreadyInState({ ...candidate, failedPredicates })).toBe(
        false,
      );
    expect(
      adminDecisionGroup({
        ...candidate,
        failedPredicates: ["target.already_applied"],
      }),
    ).toBe("completed");
    expect(
      adminDecisionGroup({
        ...candidate,
        failedPredicates: ["target.already_applied", "source.rights_current"],
      }),
    ).toBe("blocked");
    for (const commandState of [
      "PENDING_SECOND_CONFIRMATION",
      "PENDING_OWNER_REVIEW",
    ])
      expect(
        adminDecisionGroup({
          ...candidate,
          commandState,
          failedPredicates: ["target.already_applied"],
        }),
      ).toBe("pending");
  });
  it.each([
    ["PUBLISH_UNIT", "UNIT"],
    ["HIDE_UNIT", "UNIT"],
    ["UNLOCK_COHORT", "COHORT"],
    ["LOCK_COHORT", "COHORT"],
    ["ACTIVATE_SOURCE", "SOURCE"],
    ["DEACTIVATE_SOURCE", "SOURCE"],
    ["QUARANTINE_SOURCE", "SOURCE"],
    ["RETRY_SOURCE", "SOURCE"],
    ["PLACE_RAW_HOLD", "RAW_OBJECT"],
    ["REMOVE_RAW_HOLD", "RAW_OBJECT"],
    ["ENABLE_FLAG", "FLAG"],
    ["DISABLE_FLAG", "FLAG"],
  ] as const)("names %s target kind as %s", (action, kind) =>
    expect(adminTargetKind(action)).toBe(kind),
  );
  it("binds current exact identity,state,version,pending reason,expiry,initiator and readiness", () => {
    const captured = adminReviewBinding(candidate);
    for (const change of [
      { targetId: "other" },
      { action: "REMOVE_RAW_HOLD" as const },
      { expectedState: "HELD" },
      { expectedVersion: 3 },
      { currentState: "HELD" },
      { proposedState: "NO_HOLD" },
      { pendingActionId: "other" },
      { reason: "Other proposal" },
      { holdExpiresAt: "2027-01-01T00:00:00.000Z" },
      { initiatorSlot: "ZIAD" as const },
      { commandState: "PENDING_OWNER_REVIEW" },
      { protected: false },
      { failedPredicates: ["source.rights_current"] },
    ])
      expect(adminReviewBinding({ ...candidate, ...change })).not.toBe(
        captured,
      );
    expect(adminReviewBinding({ ...candidate })).toBe(captured);
  });
  it("resolves only a complete current tuple and denies duplicate,foreign,stale and altered selectors", () => {
    const good = new URL(
      adminDecisionHref(candidate, "ar"),
      "https://synthetic.invalid",
    ).searchParams;
    expect(selectedAdminDecision([candidate], good)).toEqual({
      id: "sample-hold",
      error: false,
    });
    expect(selectedAdminDecision([candidate], new URLSearchParams())).toEqual({
      id: "",
      error: false,
    });
    for (const field of ["decision", "action", "target", "version"]) {
      for (const operation of ["delete", "replace", "duplicate"]) {
        const query = new URLSearchParams(good);
        if (operation === "delete") query.delete(field);
        if (operation === "replace") query.set(field, "foreign");
        if (operation === "duplicate") query.append(field, good.get(field)!);
        expect(selectedAdminDecision([candidate], query)).toEqual({
          id: "",
          error: true,
        });
      }
    }
    expect(
      selectedAdminDecision([{ ...candidate, expectedVersion: 3 }], good),
    ).toEqual({ id: "", error: true });
    expect(selectedAdminDecision([], good)).toEqual({ id: "", error: true });
  });
  it("binds a pending link to its exact pending command and rejects a fresh reset candidate", () => {
    const pending = {
      ...candidate,
      pendingActionId: "b0000000-0000-4000-8000-000000000009",
      commandState: "PENDING_SECOND_CONFIRMATION",
    };
    const query = new URL(
      adminDecisionHref(pending, "en"),
      "https://synthetic.invalid",
    ).searchParams;
    expect(selectedAdminDecision([pending], query)).toEqual({
      id: pending.candidateId,
      error: false,
    });
    expect(selectedAdminDecision([candidate], query)).toEqual({
      id: "",
      error: true,
    });
    for (const action of ["delete", "duplicate", "replace"]) {
      const altered = new URLSearchParams(query);
      if (action === "delete") altered.delete("pending");
      if (action === "duplicate")
        altered.append("pending", pending.pendingActionId);
      if (action === "replace") altered.set("pending", "other");
      expect(selectedAdminDecision([pending], altered)).toEqual({
        id: "",
        error: true,
      });
    }
    expect(
      selectedAdminDecision([pending], new URLSearchParams("pending=other")),
    ).toEqual({ id: "", error: true });
  });
});
