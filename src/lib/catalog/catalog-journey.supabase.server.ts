import "server-only";

import { createServerSupabaseClient } from "../db/supabase/server";

import type { CatalogAccessState } from "./catalog-journey.application";
import type {
  AuthorizedCatalogRow,
  CatalogProgressionMode,
} from "./catalog-journey.domain";

export type CurrentStudentCatalog = Readonly<{
  state: CatalogAccessState;
  rows: readonly AuthorizedCatalogRow[];
}>;

const catalogStates = new Set<CatalogAccessState>([
  "READY",
  "NO_MEMBERSHIP",
  "COHORT_LOCKED",
  "NO_CATALOG",
  "UNIT_UNPUBLISHED",
  "READY_SOURCE_MISSING",
]);

const progressionModes = new Set<string>(["TERM_BASED", "FLEXIBLE_CREDIT"]);

export class CatalogDataAccessError extends Error {
  constructor() {
    super("The authorized catalog could not be loaded.");
    this.name = "CatalogDataAccessError";
  }
}

export async function loadCurrentStudentCatalog(): Promise<CurrentStudentCatalog> {
  const client = await createServerSupabaseClient();
  const [entriesResult, stateResult] = await Promise.all([
    client.rpc("available_catalog_entries"),
    client.rpc("current_student_catalog_state"),
  ]);

  if (
    entriesResult.error !== null ||
    entriesResult.data === null ||
    stateResult.error !== null ||
    stateResult.data === null ||
    !catalogStates.has(stateResult.data as CatalogAccessState)
  ) {
    throw new CatalogDataAccessError();
  }

  if (
    entriesResult.data.some(
      (entry) => !progressionModes.has(entry.program_progression_mode),
    )
  ) {
    throw new CatalogDataAccessError();
  }

  const state = stateResult.data as CatalogAccessState;
  if (
    (state === "READY" && entriesResult.data.length === 0) ||
    (state !== "READY" && entriesResult.data.length > 0)
  ) {
    throw new CatalogDataAccessError();
  }

  return {
    state,
    rows: entriesResult.data.map((entry) => ({
      stage: {
        id: entry.education_stage_id,
        code: entry.education_stage_code,
        nameEn: entry.education_stage_name_en,
        nameAr: entry.education_stage_name_ar,
        sortOrder: entry.education_stage_sort_order,
      },
      institution: {
        id: entry.institution_id,
        code: entry.institution_code,
        nameEn: entry.institution_name_en,
        nameAr: entry.institution_name_ar,
        sortOrder: 0,
      },
      program: {
        id: entry.program_id,
        code: entry.program_code,
        nameEn: entry.program_name_en,
        nameAr: entry.program_name_ar,
        sortOrder: 0,
        progressionMode:
          entry.program_progression_mode as CatalogProgressionMode,
        unitType: entry.program_default_unit_type,
        unitLabelSingularEn: entry.unit_label_singular_en,
        unitLabelPluralEn: entry.unit_label_plural_en,
        unitLabelSingularAr: entry.unit_label_singular_ar,
        unitLabelPluralAr: entry.unit_label_plural_ar,
      },
      level: {
        id: entry.academic_level_id,
        code: entry.academic_level_code,
        nameEn: entry.academic_level_name_en,
        nameAr: entry.academic_level_name_ar,
        sortOrder: entry.academic_level_sort_order,
      },
      term: {
        id: entry.term_id,
        code: entry.term_code,
        nameEn: entry.term_name_en,
        nameAr: entry.term_name_ar,
        sortOrder: entry.term_sort_order,
      },
      cohort: {
        id: entry.cohort_id,
        code: entry.cohort_code,
        nameEn: entry.cohort_name,
        nameAr: entry.cohort_name,
        sortOrder: 0,
        curriculumEdition: entry.curriculum_edition,
      },
      unit: {
        id: entry.curriculum_unit_id,
        code: entry.curriculum_unit_code,
        nameEn: entry.curriculum_unit_title_en,
        nameAr: entry.curriculum_unit_title_ar,
        sortOrder: entry.curriculum_unit_sort_order,
        unitType: entry.curriculum_unit_type,
        sourceCount: entry.source_count,
      },
    })),
  };
}
