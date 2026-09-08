import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  maybeSingle: vi.fn(),
  rpc: vi.fn(),
  select: vi.fn(),
  from: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../../src/lib/db/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createServerSupabaseClient.mockResolvedValue({
    from: mocks.from,
    rpc: mocks.rpc,
  });
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.select.mockReturnValue({ maybeSingle: mocks.maybeSingle });
  mocks.maybeSingle.mockResolvedValue({
    data: {
      display_name: "Synthetic Student",
      preferred_language: "EN",
    },
    error: null,
  });
  mocks.rpc.mockResolvedValue({
    data: [
      {
        id: "20000000-0000-0000-0000-000000000007",
        cohort_id: "20000000-0000-0000-0000-000000000006",
        code: "UNIT_A",
        unit_type: "MODULE",
        title_en: "Synthetic Unit A",
        title_ar: "وحدة تجريبية أ",
      },
    ],
    error: null,
  });
});

describe("caller-scoped student Supabase access", () => {
  it("reads only the caller's safe profile projection", async () => {
    const { getCurrentStudentProfile } =
      await import("../../src/lib/db/supabase/student-access.server");

    await expect(getCurrentStudentProfile()).resolves.toEqual({
      displayName: "Synthetic Student",
      preferredLanguage: "EN",
    });
    expect(mocks.from).toHaveBeenCalledWith("profiles");
    expect(mocks.select).toHaveBeenCalledWith(
      "display_name, preferred_language",
    );
    expect(mocks.maybeSingle).toHaveBeenCalledOnce();
  });

  it("runs catalog availability as the authenticated caller without admin preview", async () => {
    const { listCurrentStudentAvailableUnits } =
      await import("../../src/lib/db/supabase/student-access.server");

    await expect(listCurrentStudentAvailableUnits()).resolves.toEqual([
      {
        id: "20000000-0000-0000-0000-000000000007",
        cohortId: "20000000-0000-0000-0000-000000000006",
        code: "UNIT_A",
        unitType: "MODULE",
        titleEn: "Synthetic Unit A",
        titleAr: "وحدة تجريبية أ",
      },
    ]);
    expect(mocks.rpc).toHaveBeenCalledWith("available_curriculum_units", {
      admin_preview: false,
    });
  });
});
