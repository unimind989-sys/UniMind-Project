import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../../src/lib/db/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

const entry = {
  education_stage_id: "stage",
  education_stage_code: "UNIVERSITY",
  education_stage_name_en: "University",
  education_stage_name_ar: "الجامعة",
  education_stage_sort_order: 1,
  institution_id: "institution",
  institution_code: "SYNTHETIC_UNIVERSITY",
  institution_name_en: "Synthetic University",
  institution_name_ar: "جامعة تجريبية",
  program_id: "program",
  program_code: "SYNTHETIC_MEDICINE",
  program_name_en: "Synthetic Medicine",
  program_name_ar: "طب تجريبي",
  program_progression_mode: "TERM_BASED" as const,
  program_default_unit_type: "MODULE" as const,
  unit_label_singular_en: "Module",
  unit_label_plural_en: "Modules",
  unit_label_singular_ar: "وحدة",
  unit_label_plural_ar: "وحدات",
  academic_level_id: "level",
  academic_level_code: "LEVEL_1",
  academic_level_name_en: "Level One",
  academic_level_name_ar: "المستوى الأول",
  academic_level_sort_order: 1,
  term_id: "term",
  term_code: "TERM_1",
  term_name_en: "Term One",
  term_name_ar: "الفصل الأول",
  term_sort_order: 1,
  cohort_id: "cohort",
  cohort_code: "COHORT_2026",
  cohort_name: "Synthetic Cohort",
  curriculum_edition: "synthetic-edition-2026",
  curriculum_unit_id: "unit",
  curriculum_unit_code: "UNIT_A",
  curriculum_unit_type: "MODULE" as const,
  curriculum_unit_title_en: "Synthetic Unit A",
  curriculum_unit_title_ar: "وحدة تجريبية أ",
  curriculum_unit_sort_order: 1,
  source_count: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createServerSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
  mocks.rpc.mockImplementation((functionName: string) => {
    if (functionName === "available_catalog_entries") {
      return Promise.resolve({ data: [entry], error: null });
    }
    return Promise.resolve({ data: "READY", error: null });
  });
});

describe("current-student catalog database adapter", () => {
  it("loads identifiers only through the two caller-scoped catalog functions", async () => {
    const { loadCurrentStudentCatalog } =
      await import("../../src/lib/catalog/catalog-journey.supabase.server");

    const catalog = await loadCurrentStudentCatalog();

    expect(mocks.rpc).toHaveBeenCalledWith("available_catalog_entries");
    expect(mocks.rpc).toHaveBeenCalledWith("current_student_catalog_state");
    expect(catalog.state).toBe("READY");
    expect(catalog.rows).toHaveLength(1);
    expect(catalog.rows[0]?.program.progressionMode).toBe("TERM_BASED");
    expect(catalog.rows[0]?.unit).toEqual({
      id: "unit",
      code: "UNIT_A",
      nameEn: "Synthetic Unit A",
      nameAr: "وحدة تجريبية أ",
      sortOrder: 1,
      unitType: "MODULE",
      sourceCount: 1,
    });
  });

  it("fails closed when rows and safe state disagree", async () => {
    mocks.rpc.mockImplementation((functionName: string) =>
      Promise.resolve(
        functionName === "available_catalog_entries"
          ? { data: [entry], error: null }
          : { data: "COHORT_LOCKED", error: null },
      ),
    );

    const { CatalogDataAccessError, loadCurrentStudentCatalog } =
      await import("../../src/lib/catalog/catalog-journey.supabase.server");

    await expect(loadCurrentStudentCatalog()).rejects.toBeInstanceOf(
      CatalogDataAccessError,
    );
  });

  it("fails closed when the database returns an unknown progression mode", async () => {
    mocks.rpc.mockImplementation((functionName: string) =>
      Promise.resolve(
        functionName === "available_catalog_entries"
          ? {
              data: [{ ...entry, program_progression_mode: "UNSAFE_MODE" }],
              error: null,
            }
          : { data: "READY", error: null },
      ),
    );

    const { loadCurrentStudentCatalog } =
      await import("../../src/lib/catalog/catalog-journey.supabase.server");

    await expect(loadCurrentStudentCatalog()).rejects.toThrow(
      "The authorized catalog could not be loaded.",
    );
  });

  it("rejects unknown state values without returning provider diagnostics", async () => {
    mocks.rpc.mockImplementation((functionName: string) =>
      Promise.resolve(
        functionName === "available_catalog_entries"
          ? { data: [], error: null }
          : { data: "PRIVATE_REASON", error: null },
      ),
    );

    const { loadCurrentStudentCatalog } =
      await import("../../src/lib/catalog/catalog-journey.supabase.server");

    await expect(loadCurrentStudentCatalog()).rejects.toThrow(
      "The authorized catalog could not be loaded.",
    );
  });
});
