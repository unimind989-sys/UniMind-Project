import "server-only";

import { z } from "zod";

import { requireVerifiedIdentity } from "../auth/verified-identity.server";
import { createServerSupabaseClient } from "../db/supabase/server";
import {
  WorkspaceDataError,
  type WorkspaceChatSession,
  type WorkspaceRepository,
  type WorkspaceScope,
} from "./workspace.application";

const routeId = z.string().uuid();
const progressionModes = new Set(["TERM_BASED", "FLEXIBLE_CREDIT"]);
const unitTypes = new Set(["MODULE", "SUBJECT"]);
const languageModes = new Set(["EN", "AR_EG", "MIXED"]);

function parseSession(
  row: Readonly<{
    id: string;
    cohort_id: string;
    curriculum_unit_id: string;
    language_mode: string;
    created_at: string;
  }>,
): WorkspaceChatSession {
  if (!languageModes.has(row.language_mode)) {
    throw new WorkspaceDataError();
  }
  return {
    id: row.id,
    cohortId: row.cohort_id,
    unitId: row.curriculum_unit_id,
    languageMode: row.language_mode as WorkspaceChatSession["languageMode"],
    createdAt: row.created_at,
  };
}

export const supabaseWorkspaceRepository: WorkspaceRepository = {
  async loadScope(cohortId, unitId) {
    if (
      !routeId.safeParse(cohortId).success ||
      !routeId.safeParse(unitId).success
    ) {
      return null;
    }

    const client = await createServerSupabaseClient();
    const { data, error } = await client.rpc("current_student_workspace", {
      target_cohort_id: cohortId,
      target_curriculum_unit_id: unitId,
    });
    if (error !== null || data === null) {
      throw new WorkspaceDataError();
    }
    const row = data[0];
    if (row === undefined) return null;
    if (
      data.length !== 1 ||
      !progressionModes.has(row.program_progression_mode) ||
      !unitTypes.has(row.curriculum_unit_type) ||
      row.source_count < 1 ||
      row.material_updated_at === null
    ) {
      throw new WorkspaceDataError();
    }

    return {
      cohortId: row.cohort_id,
      unitId: row.curriculum_unit_id,
      unitType: row.curriculum_unit_type,
      progressionMode:
        row.program_progression_mode as WorkspaceScope["progressionMode"],
      stageNameEn: row.education_stage_name_en,
      stageNameAr: row.education_stage_name_ar,
      institutionNameEn: row.institution_name_en,
      institutionNameAr: row.institution_name_ar,
      programNameEn: row.program_name_en,
      programNameAr: row.program_name_ar,
      levelNameEn: row.academic_level_name_en,
      levelNameAr: row.academic_level_name_ar,
      termNameEn: row.term_name_en,
      termNameAr: row.term_name_ar,
      cohortName: row.cohort_name,
      curriculumEdition: row.curriculum_edition,
      unitTitleEn: row.curriculum_unit_title_en,
      unitTitleAr: row.curriculum_unit_title_ar,
      unitLabelSingularEn: row.unit_label_singular_en,
      unitLabelPluralEn: row.unit_label_plural_en,
      unitLabelSingularAr: row.unit_label_singular_ar,
      unitLabelPluralAr: row.unit_label_plural_ar,
      sourceCount: row.source_count,
      materialUpdatedAt: row.material_updated_at,
      sourceStatus: "READY",
      quotaStatus: "UNAVAILABLE",
    };
  },

  async listOpenChatSessions(scope) {
    const client = await createServerSupabaseClient();
    const { data, error } = await client
      .from("chat_sessions")
      .select("id, cohort_id, curriculum_unit_id, language_mode, created_at")
      .eq("cohort_id", scope.cohortId)
      .eq("curriculum_unit_id", scope.unitId)
      .is("closed_at", null)
      .order("created_at", { ascending: false });
    if (error !== null || data === null) throw new WorkspaceDataError();
    return data.map(parseSession);
  },

  async createChatSession(scope, languageMode) {
    const [{ userId }, client] = await Promise.all([
      requireVerifiedIdentity(),
      createServerSupabaseClient(),
    ]);
    const { data, error } = await client
      .from("chat_sessions")
      .insert({
        user_id: userId,
        cohort_id: scope.cohortId,
        curriculum_unit_id: scope.unitId,
        language_mode: languageMode,
        retention_mode: "MINIMAL",
      })
      .select("id, cohort_id, curriculum_unit_id, language_mode, created_at")
      .single();
    if (error !== null || data === null) throw new WorkspaceDataError();
    return parseSession(data);
  },
};
