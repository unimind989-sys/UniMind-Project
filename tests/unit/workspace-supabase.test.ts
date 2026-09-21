import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../../src/lib/db/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));
vi.mock("../../src/lib/auth/verified-identity.server", () => ({
  requireVerifiedIdentity: vi.fn(),
}));

const row = {
  education_stage_name_en: "University",
  education_stage_name_ar: "الجامعة",
  institution_name_en: "Synthetic University",
  institution_name_ar: "جامعة تجريبية",
  program_name_en: "Medicine",
  program_name_ar: "الطب",
  program_progression_mode: "TERM_BASED",
  unit_label_singular_en: "Module",
  unit_label_plural_en: "Modules",
  unit_label_singular_ar: "وحدة",
  unit_label_plural_ar: "وحدات",
  academic_level_name_en: "First year",
  academic_level_name_ar: "السنة الأولى",
  term_name_en: "Term 1",
  term_name_ar: "الترم الأول",
  cohort_id: "11111111-1111-4111-8111-111111111111",
  cohort_name: "Synthetic cohort",
  curriculum_edition: "synthetic-2026",
  curriculum_unit_id: "22222222-2222-4222-8222-222222222222",
  curriculum_unit_type: "MODULE",
  curriculum_unit_title_en: "Anatomy",
  curriculum_unit_title_ar: "علم التشريح",
  source_count: 3,
  material_updated_at: "2026-09-15T12:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createServerSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
  mocks.rpc.mockResolvedValue({ data: [row], error: null });
});

describe("workspace Supabase adapter", () => {
  it("loads one caller-scoped workspace through the protected RPC", async () => {
    const { supabaseWorkspaceRepository } =
      await import("../../src/lib/workspace/workspace.supabase.server");
    const result = await supabaseWorkspaceRepository.loadScope(
      row.cohort_id,
      row.curriculum_unit_id,
    );
    expect(mocks.rpc).toHaveBeenCalledWith("current_student_workspace", {
      target_cohort_id: row.cohort_id,
      target_curriculum_unit_id: row.curriculum_unit_id,
    });
    expect(result).toMatchObject({
      cohortId: row.cohort_id,
      unitId: row.curriculum_unit_id,
      sourceCount: 3,
      quotaStatus: "UNAVAILABLE",
    });
  });

  it("rejects malformed route IDs before querying the database", async () => {
    const { supabaseWorkspaceRepository } =
      await import("../../src/lib/workspace/workspace.supabase.server");
    await expect(
      supabaseWorkspaceRepository.loadScope("forged", "forged"),
    ).resolves.toBeNull();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("fails closed when the RPC returns duplicate or incomplete scope", async () => {
    mocks.rpc.mockResolvedValue({
      data: [{ ...row, material_updated_at: null }, row],
      error: null,
    });
    const { supabaseWorkspaceRepository } =
      await import("../../src/lib/workspace/workspace.supabase.server");
    await expect(
      supabaseWorkspaceRepository.loadScope(
        row.cohort_id,
        row.curriculum_unit_id,
      ),
    ).rejects.toThrow("authorized workspace");
  });
});
