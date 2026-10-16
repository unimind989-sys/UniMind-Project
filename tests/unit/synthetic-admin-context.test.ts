import { describe, expect, it } from "vitest";
import { initialProductState } from "../../src/app/_components/product-services";
import { defaultScope } from "../../src/app/_components/synthetic-fixtures";
import {
  adminOrigins,
  selectedAdminOrigin,
  syntheticResourceDecision,
  syntheticAdminCandidates,
  syntheticDecisionHref,
  adminPreviewContext,
  adminPreviewReturn,
} from "../../src/app/_components/synthetic-admin-context";
const fixture = () => ({
  ...initialProductState(),
  role: "admin" as const,
  consent: true,
});
describe("synthetic admin context is closed and document scoped", () => {
  it("maps supported resources to current exact candidates and never invents a campaign action", () => {
    const state = fixture();
    for (const [origin, action] of [
      ["catalog", "PUBLISH_UNIT"],
      ["cohorts", "LOCK_COHORT"],
      ["sources", "QUARANTINE_SOURCE"],
      ["jobs", "RETRY_SOURCE"],
      ["quality", "HIDE_UNIT"],
      ["usage", "DISABLE_FLAG"],
      ["incidents", "HIDE_UNIT"],
    ] as const)
      expect(syntheticResourceDecision(state, origin)?.action).toBe(action);
    expect(syntheticResourceDecision(state, "campaigns")).toBeNull();
    expect(syntheticAdminCandidates(state)).toHaveLength(12);
  });
  it("preserves completed, protected, owner-review, budget and original pending payload states", () => {
    const state = fixture();
    state.adminStates.hold = "PENDING";
    state.pendingVersions.hold = 7;
    state.pendingReasons.hold = "Preserve this synthetic raw object.";
    state.pendingHoldExpiries.hold = "2027-01-01T00:00:00.000Z";
    state.pendingActors.hold = "ZIAD";
    state.adminStates.retry = "RETRY_REQUESTED";
    const candidates = syntheticAdminCandidates(state);
    expect(candidates.find((c) => c.action === "PLACE_RAW_HOLD")).toMatchObject(
      {
        expectedVersion: 7,
        reason: state.pendingReasons.hold,
        holdExpiresAt: state.pendingHoldExpiries.hold,
        initiatorSlot: "ZIAD",
        commandState: "PENDING_SECOND_CONFIRMATION",
        protected: true,
      },
    );
    expect(
      candidates.find((c) => c.action === "PUBLISH_UNIT")?.failedPredicates,
    ).toEqual(["target.already_applied"]);
    expect(
      candidates.find((c) => c.action === "ENABLE_FLAG")?.failedPredicates,
    ).toEqual(["budget.approval_required"]);
    state.adminStates.retry = "RETRY_PENDING";
    // Use the authoritative fixed action's after state for its owner-review path.
    const retry = candidates.find((c) => c.action === "RETRY_SOURCE")!;
    state.adminStates.retry = retry.proposedState;
    expect(
      syntheticAdminCandidates(state).find((c) => c.action === "RETRY_SOURCE")
        ?.commandState,
    ).toBe("PENDING_OWNER_REVIEW");
  });
  it("accepts one closed origin and rejects arbitrary, malformed or duplicated origins", () => {
    for (const origin of adminOrigins)
      expect(selectedAdminOrigin(new URLSearchParams({ origin }))).toBe(origin);
    for (const query of [
      "",
      "origin=https://foreign.invalid",
      "origin=//foreign.invalid",
      "origin=sources&origin=sources",
      "origin=sources&origin=quality",
      "origin=../../login",
      "origin=sources%3Flang%3Dar",
    ])
      expect(selectedAdminOrigin(new URLSearchParams(query))).toBeNull();
  });
  it.each(["student", "leader", null] as const)(
    "does not create or load an admin candidate for %s",
    (role) => {
      const state = { ...fixture(), role };
      expect(syntheticAdminCandidates(state)).toEqual([]);
      expect(adminPreviewContext(state, "sources")).toBeNull();
    },
  );
  it("retains resource or decision origin across locale without changing the candidate", () => {
    const state = fixture();
    state.adminPreview = adminPreviewContext(state, "quality");
    expect(adminPreviewReturn(state, defaultScope, "ar")).toBe(
      "/admin/quality?lang=ar",
    );
    const candidate = syntheticResourceDecision(state, "sources")!;
    const before = structuredClone(candidate);
    state.adminPreview = adminPreviewContext(state, "sources", candidate);
    expect(adminPreviewReturn(state, defaultScope, "ar")).toBe(
      syntheticDecisionHref(candidate, "ar", "sources"),
    );
    expect(candidate).toEqual(before);
  });
  it.each(["cohortId", "unitId"] as const)(
    "rejects a foreign %s preview",
    (field) => {
      const state = fixture();
      state.adminPreview = adminPreviewContext(state, "sources");
      expect(
        adminPreviewReturn(
          state,
          { ...defaultScope, [field]: "foreign" },
          "en",
        ),
      ).toBe("/admin?lang=en");
    },
  );
  it.each(["verified", "consent"] as const)(
    "does not use return context after %s is lost",
    (field) => {
      const state = fixture();
      state.adminPreview = adminPreviewContext(state, "sources");
      state[field] = false;
      expect(adminPreviewReturn(state, defaultScope, "en")).toBe(
        "/admin?lang=en",
      );
    },
  );
  it("rejects role changes and clears context in a fresh document", () => {
    const state = fixture();
    state.adminPreview = adminPreviewContext(state, "sources");
    expect(
      adminPreviewReturn(
        { ...state, role: "second-admin" },
        defaultScope,
        "en",
      ),
    ).toBe("/admin?lang=en");
    expect(initialProductState().adminPreview).toBeNull();
    expect(initialProductState().catalogChoice).toBe("MODULE");
  });
  it("rejects replaced targets, versions or pending proposals instead of returning to obsolete review", () => {
    for (const field of [
      "targetId",
      "expectedVersion",
      "pendingActionId",
    ] as const) {
      const state = fixture();
      const candidate = syntheticResourceDecision(state, "sources")!;
      state.adminPreview = adminPreviewContext(state, "sources", candidate);
      const identity = state.adminPreview!.decision!;
      const changedIdentity =
        field === "expectedVersion"
          ? { ...identity, expectedVersion: identity.expectedVersion + 1 }
          : { ...identity, [field]: "foreign" };
      state.adminPreview = {
        ...state.adminPreview!,
        decision: changedIdentity,
      };
      expect(adminPreviewReturn(state, defaultScope, "en")).toBe(
        "/admin?lang=en",
      );
    }
    const state = fixture();
    state.adminPreview = adminPreviewContext(
      state,
      "quality",
      syntheticResourceDecision(state, "quality"),
    );
    state.availability.published = false;
    expect(adminPreviewReturn(state, defaultScope, "en")).toBe(
      "/admin?lang=en",
    );
  });
});
