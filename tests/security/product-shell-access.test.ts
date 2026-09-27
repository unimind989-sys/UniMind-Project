import { beforeEach, describe, expect, it, vi } from "vitest";

import type { WorkspaceScope } from "../../src/lib/workspace/workspace.application";

const mocks = vi.hoisted(() => ({ access: vi.fn(), loadScope: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("react", () => ({ cache: <T>(fn: T) => fn }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
vi.mock("../../src/lib/auth/auth-access.supabase.server", () => ({
  getCurrentAuthAccess: mocks.access,
}));
vi.mock("../../src/lib/workspace/workspace.supabase.server", () => ({
  supabaseWorkspaceRepository: { loadScope: mocks.loadScope },
}));

const scope: WorkspaceScope = {
  cohortId: "authorized-cohort",
  unitId: "authorized-unit",
  unitType: "MODULE",
  progressionMode: "TERM_BASED",
  stageNameEn: "University",
  stageNameAr: "الجامعة",
  institutionNameEn: "Synthetic University",
  institutionNameAr: "جامعة تجريبية",
  programNameEn: "Medicine",
  programNameAr: "الطب",
  levelNameEn: "First year",
  levelNameAr: "السنة الأولى",
  termNameEn: "Term 1",
  termNameAr: "الترم الأول",
  cohortName: "Synthetic cohort",
  curriculumEdition: "synthetic-2026",
  unitTitleEn: "Anatomy",
  unitTitleAr: "علم التشريح",
  unitLabelSingularEn: "Module",
  unitLabelPluralEn: "Modules",
  unitLabelSingularAr: "وحدة",
  unitLabelPluralAr: "وحدات",
  sourceCount: 3,
  materialUpdatedAt: "2026-09-15T12:00:00.000Z",
  sourceStatus: "READY",
  quotaStatus: "UNAVAILABLE",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.access.mockResolvedValue({ gate: "READY", currentTerms: null });
  mocks.loadScope.mockResolvedValue(scope);
});

describe("production workspace route authorization", () => {
  it.each([
    ["SIGN_IN", "/login?next="],
    ["CONSENT_REQUIRED", "/consent?next="],
    ["VERIFY_EMAIL", "/verify-email?next="],
    ["SUSPENDED", "/login?status=suspended"],
    ["DISABLED", "/login?status=disabled"],
    ["ACCOUNT_PENDING", "/login?status=unavailable"],
    ["UNAVAILABLE", "/login?status=unavailable"],
  ])(
    "rejects %s before loading cohort or unit data",
    async (gate, destination) => {
      mocks.access.mockResolvedValue({ gate, currentTerms: null });
      const { requireAuthorizedWorkspace } =
        await import("../../src/lib/workspace/workspace-route.server");
      await expect(
        requireAuthorizedWorkspace("authorized-cohort", "authorized-unit"),
      ).rejects.toThrow(`REDIRECT:${destination}`);
      expect(mocks.loadScope).not.toHaveBeenCalled();
    },
  );

  it("returns the authoritative scoped workspace for a ready member", async () => {
    const { requireAuthorizedWorkspace } =
      await import("../../src/lib/workspace/workspace-route.server");
    await expect(
      requireAuthorizedWorkspace(scope.cohortId, scope.unitId),
    ).resolves.toEqual(scope);
    expect(mocks.loadScope).toHaveBeenCalledWith(scope.cohortId, scope.unitId);
  });

  it("rejects a denied cohort/unit pair regardless of URL role labels", async () => {
    // Roles are not route authority; the caller-scoped repository decides.
    mocks.loadScope.mockResolvedValue(null);
    const { requireAuthorizedWorkspace } =
      await import("../../src/lib/workspace/workspace-route.server");
    await expect(
      requireAuthorizedWorkspace("another-cohort", "another-unit"),
    ).rejects.toThrow("NOT_FOUND");
  });

  it("rechecks access on the next operation after revocation", async () => {
    const { requireAuthorizedWorkspace } =
      await import("../../src/lib/workspace/workspace-route.server");
    await requireAuthorizedWorkspace(scope.cohortId, scope.unitId);
    mocks.access.mockResolvedValue({ gate: "SUSPENDED", currentTerms: null });
    await expect(
      requireAuthorizedWorkspace(scope.cohortId, scope.unitId),
    ).rejects.toThrow("status=suspended");
    expect(mocks.loadScope).toHaveBeenCalledOnce();
  });

  it("a private upstream diagnostic becomes a generic access failure", async () => {
    mocks.access.mockRejectedValue(new Error("WP03_PRIVATE_SOURCE_CANARY"));
    const { requireAuthorizedWorkspace } =
      await import("../../src/lib/workspace/workspace-route.server");
    await expect(
      requireAuthorizedWorkspace(scope.cohortId, scope.unitId),
    ).rejects.toThrow("REDIRECT:/login?status=unavailable");
    expect(mocks.loadScope).not.toHaveBeenCalled();
  });
});
