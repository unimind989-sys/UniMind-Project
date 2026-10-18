import { beforeEach, describe, expect, it, vi } from "vitest";
import { contextFromSelection } from "../../src/lib/account/account.application";
import type { AuthorizedCatalogRow } from "../../src/lib/catalog/catalog-journey.application";

type Result = Readonly<{ data: unknown; error: unknown }>;
type RecordedQuery = {
  table: string;
  filters: unknown[][];
  update?: unknown;
};

const mocks = vi.hoisted(() => ({
  client: vi.fn(),
  identity: vi.fn(),
  access: vi.fn(),
  catalog: vi.fn(),
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
  saveCurrentProfile,
  loadCurrentStudyResume,
} from "../../src/lib/account/account.supabase.server";

const node = (id: string) => ({
  id,
  code: id,
  nameEn: id,
  nameAr: id,
  sortOrder: 1,
});
const row: AuthorizedCatalogRow = {
  stage: node("stage-1"),
  institution: node("institution-1"),
  program: {
    ...node("program-1"),
    progressionMode: "TERM_BASED",
    unitType: "MODULE",
    unitLabelSingularEn: "Module",
    unitLabelPluralEn: "Modules",
    unitLabelSingularAr: "وحدة",
    unitLabelPluralAr: "وحدات",
  },
  level: node("level-1"),
  term: node("term-1"),
  cohort: { ...node("cohort-1"), curriculumEdition: "2026" },
  unit: { ...node("unit-1"), unitType: "MODULE" },
};
const rows = [row];
const context = contextFromSelection({
  stageId: row.stage.id,
  institutionId: row.institution.id,
  programId: row.program.id,
  levelId: row.level.id,
  termId: row.term.id,
  cohortId: row.cohort.id,
})!;
const caller = ["eq", "user_id", "verified-caller"];

/**
 * Records which table each query targets, its filters and any update payload,
 * so assertions cover target, caller scope and written fields rather than the
 * builder call order.
 */
let results: Record<string, Result>;
let queries: RecordedQuery[];
let claimEmail: unknown = "samir@example.invalid";
function fakeClient() {
  return {
    auth: {
      getClaims: async () => ({ data: { claims: { email: claimEmail } } }),
    },
    from(table: string) {
      const query: RecordedQuery = { table, filters: [] };
      queries.push(query);
      const builder: object = new Proxy(
        {},
        {
          get(_target, property) {
            if (property === "then")
              return (resolve: (value: Result) => unknown) =>
                resolve(
                  results[table] ?? {
                    data: null,
                    error: { message: `unexpected ${table}` },
                  },
                );
            return (...args: unknown[]) => {
              if (property === "update") query.update = args[0];
              if (["eq", "is", "in"].includes(String(property)))
                query.filters.push([property, ...args]);
              return builder;
            };
          },
        },
      );
      return builder;
    },
  };
}
const queriesOf = (table: string) =>
  queries.filter((query) => query.table === table);

beforeEach(() => {
  vi.resetAllMocks();
  queries = [];
  results = {
    profiles: {
      data: {
        user_id: "verified-caller",
        display_name: "Sample Student",
        preferred_language: "en",
        academic_context: context,
      },
      error: null,
    },
    user_roles: { data: [{ role: "STUDENT" }], error: null },
  };
  mocks.client.mockImplementation(async () => fakeClient());
  mocks.identity.mockResolvedValue({ userId: "verified-caller" });
  mocks.access.mockResolvedValue({ gate: "READY" });
  mocks.catalog.mockResolvedValue({ rows });
});

describe("existing-session resume boundary", () => {
  const session = {
    id: "30000000-0000-4000-8000-000000000001",
    cohort_id: row.cohort.id,
    curriculum_unit_id: row.unit.id,
  };
  beforeEach(() => {
    results.chat_sessions = { data: session, error: null };
  });
  it("queries only the verified caller's open sessions in currently authorized scope", async () => {
    expect(await loadCurrentStudyResume(rows, row.cohort.id)).toBe(
      `/learn/${row.cohort.id}/${row.unit.id}/chat?session=${session.id}`,
    );
    expect(queries.map((query) => query.table)).toEqual(["chat_sessions"]);
    expect(queriesOf("chat_sessions")[0]!.filters).toEqual(
      expect.arrayContaining([
        caller,
        ["eq", "cohort_id", row.cohort.id],
        ["is", "closed_at", null],
        ["in", "curriculum_unit_id", [row.unit.id]],
      ]),
    );
  });
  it.each([
    null,
    { ...session, cohort_id: "foreign" },
    { ...session, curriculum_unit_id: "revoked" },
    { ...session, id: "../foreign?scope=other" },
  ])(
    "omits unavailable, foreign, revoked or malformed destinations",
    async (data) => {
      results.chat_sessions = { data, error: null };
      expect(await loadCurrentStudyResume(rows, row.cohort.id)).toBeNull();
    },
  );
  it("does not query storage for an unavailable catalog", async () => {
    expect(await loadCurrentStudyResume([], row.cohort.id)).toBeNull();
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("omits the link on identity/database failure without exposing diagnostics", async () => {
    mocks.identity.mockRejectedValue(new Error("PRIVATE_DIAGNOSTIC"));
    expect(await loadCurrentStudyResume(rows, row.cohort.id)).toBeNull();
    expect(mocks.client).not.toHaveBeenCalled();
    mocks.identity.mockResolvedValue({ userId: "verified-caller" });
    results.chat_sessions = {
      data: session,
      error: { message: "PRIVATE_DIAGNOSTIC" },
    };
    expect(await loadCurrentStudyResume(rows, row.cohort.id)).toBeNull();
  });
});

describe("account Supabase trust seams", () => {
  it("reads the caller's profile and current unrevoked roles, including persisted settings", async () => {
    expect(await loadCurrentAccount()).toEqual({
      displayName: "Sample Student",
      email: "samir@example.invalid",
      language: null,
      locale: "en",
      academicContext: context,
      home: "/learn",
    });
    expect(queriesOf("profiles")).toHaveLength(1);
    claimEmail = { forged: true };
    expect((await loadCurrentAccount()).email).toBeNull();
    claimEmail = "samir@example.invalid";
    expect(queriesOf("profiles")[0]!.filters).toContainEqual(caller);
    expect(queriesOf("user_roles")[0]!.filters).toEqual(
      expect.arrayContaining([caller, ["is", "revoked_at", null]]),
    );
  });
  it("derives the Admin destination only from the caller-scoped role query", async () => {
    results.user_roles = { data: [{ role: "ADMIN" }], error: null };
    expect(await currentRoleHome()).toBe("/admin");
    expect(queries.map((query) => query.table)).toEqual(["user_roles"]);
    expect(queriesOf("user_roles")[0]!.filters).toEqual(
      expect.arrayContaining([caller, ["is", "revoked_at", null]]),
    );
  });
  it("does not guess a role when authoritative role lookup fails", async () => {
    results.user_roles = {
      data: null,
      error: { message: "PRIVATE_DIAGNOSTIC" },
    };
    await expect(currentRoleHome()).rejects.toThrow(
      "Account destination unavailable.",
    );
  });
  it("writes only academic hints under verified caller identity", async () => {
    expect(await saveCurrentAcademicSettings(context)).toEqual({
      status: "SAVED",
    });
    const [write] = queriesOf("profiles");
    expect(write!.filters).toContainEqual(caller);
    expect(write!.update).toEqual({
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
  it("writes only the caller's own name and account language", async () => {
    expect(
      await saveCurrentProfile({ displayName: " Samir  Hassan", locale: "ar" }),
    ).toEqual({ status: "SAVED", displayName: "Samir Hassan", locale: "ar" });
    const [write] = queriesOf("profiles");
    expect(write!.filters).toContainEqual(caller);
    expect(write!.update).toEqual({
      display_name: "Samir Hassan",
      preferred_language: "AR_EG",
      updated_at: expect.any(String),
    });
  });
  it("lets a caller who still owes a profile save it, and nobody earlier", async () => {
    mocks.access.mockResolvedValue({ gate: "PROFILE_REQUIRED" });
    expect(
      await saveCurrentProfile({ displayName: "Samir", locale: "en" }),
    ).toMatchObject({ status: "SAVED" });
    for (const gate of ["SIGN_IN", "CONSENT_REQUIRED", "SUSPENDED"]) {
      vi.clearAllMocks();
      mocks.client.mockImplementation(async () => fakeClient());
      mocks.access.mockResolvedValue({ gate });
      expect(
        await saveCurrentProfile({ displayName: "Samir", locale: "en" }),
      ).toEqual({ status: "FORBIDDEN" });
      expect(mocks.client).not.toHaveBeenCalled();
    }
  });
  it("a profile write rejected by the database never reports success", async () => {
    results.profiles = { data: null, error: { message: "PRIVATE_DIAGNOSTIC" } };
    const outcome = await saveCurrentProfile({
      displayName: "Samir",
      locale: "en",
    });
    expect(outcome).toEqual({ status: "UNAVAILABLE" });
    expect(JSON.stringify(outcome)).not.toContain("PRIVATE_DIAGNOSTIC");
  });
  it("a revoked catalog path cannot write stale saved hints", async () => {
    mocks.catalog.mockResolvedValue({ rows: [] });
    expect(await saveCurrentAcademicSettings(context)).toEqual({
      status: "INVALID",
    });
    expect(queries).toEqual([]);
  });
  it("a caller ID supplied by the browser cannot override the verified identity", async () => {
    expect(
      await saveCurrentAcademicSettings({
        ...context,
        userId: "foreign-caller",
      }),
    ).toEqual({ status: "INVALID" });
    expect(queries).toEqual([]);
  });
  it("an RLS rejection never returns success or the provider diagnostic", async () => {
    results.profiles = {
      data: null,
      error: { message: "PRIVATE_DIAGNOSTIC" },
    };
    const outcome = await saveCurrentAcademicSettings(context);
    expect(outcome).toEqual({ status: "UNAVAILABLE" });
    expect(JSON.stringify(outcome)).not.toContain("PRIVATE_DIAGNOSTIC");
  });
});
