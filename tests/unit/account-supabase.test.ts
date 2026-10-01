import { beforeEach, describe, expect, it, vi } from "vitest";
import { syntheticCatalogRows } from "../../src/app/learn/synthetic-catalog";
import { contextFromSelection } from "../../src/lib/account/account.application";

const mocks = vi.hoisted(() => ({
  client: vi.fn(),
  identity: vi.fn(),
  access: vi.fn(),
  catalog: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  is: vi.fn(),
  update: vi.fn(),
  single: vi.fn(),
  in: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  maybeSingle: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("../../src/lib/db/supabase/server", () => ({
  createServerSupabaseClient: mocks.client,
}));
vi.mock("../../src/lib/auth/verified-identity.server", () => ({
  requireVerifiedIdentity: mocks.identity,
}));
vi.mock("../../src/lib/auth/auth-access.supabase.server", () => ({
  getCurrentAuthAccess: mocks.access,
}));
vi.mock("../../src/lib/catalog/catalog-journey.supabase.server", () => ({
  loadCurrentStudentCatalog: mocks.catalog,
}));
import {
  currentRoleHome,
  loadCurrentAccount,
  saveCurrentAcademicSettings,
  loadCurrentStudyResume,
} from "../../src/lib/account/account.supabase.server";
const row = syntheticCatalogRows[0]!;
const context = contextFromSelection({
  stageId: row.stage.id,
  institutionId: row.institution.id,
  programId: row.program.id,
  levelId: row.level.id,
  termId: row.term.id,
  cohortId: row.cohort.id,
})!;
beforeEach(() => {
  vi.resetAllMocks();
  const chain = {
    select: mocks.select,
    eq: mocks.eq,
    is: mocks.is,
    update: mocks.update,
    single: mocks.single,
    in: mocks.in,
    order: mocks.order,
    limit: mocks.limit,
    maybeSingle: mocks.maybeSingle,
  };
  mocks.from.mockReturnValue(chain);
  mocks.select.mockReturnValue(chain);
  mocks.eq.mockReturnValue(chain);
  mocks.update.mockReturnValue(chain);
  mocks.in.mockReturnValue(chain);
  mocks.order.mockReturnValue(chain);
  mocks.limit.mockReturnValue(chain);
  mocks.client.mockResolvedValue({ from: mocks.from });
  mocks.identity.mockResolvedValue({ userId: "verified-caller" });
  mocks.access.mockResolvedValue({ gate: "READY" });
  mocks.catalog.mockResolvedValue({ rows: syntheticCatalogRows });
  mocks.single.mockResolvedValue({
    data: {
      user_id: "verified-caller",
      display_name: "Sample Student",
      preferred_language: "en",
      academic_context: context,
    },
    error: null,
  });
  mocks.is.mockResolvedValue({ data: [{ role: "STUDENT" }], error: null });
});

describe("existing-session resume boundary", () => {
  const session = {
    id: "30000000-0000-4000-8000-000000000001",
    cohort_id: row.cohort.id,
    curriculum_unit_id: row.unit.id,
  };
  beforeEach(() => {
    mocks.is.mockReturnValue({ order: mocks.order });
    mocks.maybeSingle.mockResolvedValue({ data: session, error: null });
  });
  it("queries only the verified caller's open sessions in currently authorized scope", async () => {
    expect(
      await loadCurrentStudyResume(syntheticCatalogRows, row.cohort.id),
    ).toBe(`/learn/${row.cohort.id}/${row.unit.id}/chat?session=${session.id}`);
    expect(mocks.eq.mock.calls).toEqual([
      ["user_id", "verified-caller"],
      ["cohort_id", row.cohort.id],
    ]);
    expect(mocks.is).toHaveBeenCalledWith("closed_at", null);
    expect(mocks.in).toHaveBeenCalledWith(
      "curriculum_unit_id",
      expect.arrayContaining([row.unit.id]),
    );
    expect(mocks.select).toHaveBeenCalledWith(
      "id, cohort_id, curriculum_unit_id",
    );
    expect(mocks.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(mocks.limit).toHaveBeenCalledWith(1);
  });
  it.each([
    null,
    { ...session, cohort_id: "foreign" },
    { ...session, curriculum_unit_id: "revoked" },
    { ...session, id: "../foreign?scope=other" },
  ])(
    "omits unavailable, foreign, revoked or malformed destinations",
    async (data) => {
      mocks.maybeSingle.mockResolvedValue({ data, error: null });
      expect(
        await loadCurrentStudyResume(syntheticCatalogRows, row.cohort.id),
      ).toBeNull();
    },
  );
  it("does not query storage for an unavailable catalog", async () => {
    expect(await loadCurrentStudyResume([], row.cohort.id)).toBeNull();
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("omits the link on identity/database failure without exposing diagnostics", async () => {
    mocks.identity.mockRejectedValue(new Error("PRIVATE_DIAGNOSTIC"));
    expect(
      await loadCurrentStudyResume(syntheticCatalogRows, row.cohort.id),
    ).toBeNull();
    expect(mocks.client).not.toHaveBeenCalled();
    mocks.identity.mockResolvedValue({ userId: "verified-caller" });
    mocks.maybeSingle.mockResolvedValue({
      data: session,
      error: { message: "PRIVATE_DIAGNOSTIC" },
    });
    expect(
      await loadCurrentStudyResume(syntheticCatalogRows, row.cohort.id),
    ).toBeNull();
  });
});
describe("account Supabase trust seams", () => {
  it("reads the caller's profile and current unrevoked roles, including persisted settings", async () => {
    expect(await loadCurrentAccount()).toMatchObject({
      academicContext: context,
      home: "/learn",
    });
    expect(mocks.eq.mock.calls).toEqual([
      ["user_id", "verified-caller"],
      ["user_id", "verified-caller"],
    ]);
    expect(mocks.is).toHaveBeenCalledWith("revoked_at", null);
  });
  it("derives the Admin destination only from the caller-scoped role query", async () => {
    mocks.is.mockResolvedValue({ data: [{ role: "ADMIN" }], error: null });
    expect(await currentRoleHome()).toBe("/admin");
    expect(mocks.eq).toHaveBeenCalledWith("user_id", "verified-caller");
    expect(mocks.is).toHaveBeenCalledWith("revoked_at", null);
    expect(mocks.from).not.toHaveBeenCalledWith("profiles");
  });
  it("does not guess a role when authoritative role lookup fails", async () => {
    mocks.is.mockResolvedValue({
      data: null,
      error: { message: "PRIVATE_DIAGNOSTIC" },
    });
    await expect(currentRoleHome()).rejects.toThrow(
      "Account destination unavailable.",
    );
  });
  it("writes only academic hints under verified caller identity", async () => {
    expect(await saveCurrentAcademicSettings(context)).toEqual({
      status: "SAVED",
    });
    expect(mocks.eq).toHaveBeenCalledWith("user_id", "verified-caller");
    expect(mocks.update).toHaveBeenCalledWith({
      academic_context: context,
      updated_at: expect.any(String),
    });
  });
  it.each([
    "SIGN_IN",
    "CONSENT_REQUIRED",
    "VERIFY_EMAIL",
    "SUSPENDED",
    "DISABLED",
  ])("denies %s before touching profile storage", async (gate) => {
    mocks.access.mockResolvedValue({ gate });
    expect(await saveCurrentAcademicSettings(context)).toEqual({
      status: "FORBIDDEN",
    });
    expect(mocks.client).not.toHaveBeenCalled();
    expect(mocks.catalog).not.toHaveBeenCalled();
  });
  it("a revoked catalog path cannot write stale saved hints", async () => {
    mocks.catalog.mockResolvedValue({ rows: [] });
    expect(await saveCurrentAcademicSettings(context)).toEqual({
      status: "INVALID",
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("a caller ID supplied by the browser cannot override the verified identity", async () => {
    expect(
      await saveCurrentAcademicSettings({
        ...context,
        userId: "foreign-caller",
      }),
    ).toEqual({ status: "INVALID" });
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("an RLS rejection never returns success or the provider diagnostic", async () => {
    mocks.single.mockResolvedValue({
      data: null,
      error: { message: "PRIVATE_DIAGNOSTIC" },
    });
    expect(await saveCurrentAcademicSettings(context)).toEqual({
      status: "UNAVAILABLE",
    });
  });
});
