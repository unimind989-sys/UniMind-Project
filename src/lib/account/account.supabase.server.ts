import "server-only";
import { createServerSupabaseClient } from "../db/supabase/server";
import { getCurrentAuthAccess } from "../auth/auth-access.supabase.server";
import { requireVerifiedIdentity } from "../auth/verified-identity.server";
import { loadCurrentStudentCatalog } from "../catalog/catalog-journey.supabase.server";
import {
  readAcademicContext,
  saveAcademicSettings,
  roleHome,
  authorizedStudyResume,
} from "./account.application";
import type { AuthorizedCatalogRow } from "../catalog/catalog-journey.application";

export async function loadCurrentAccount() {
  const identity = await requireVerifiedIdentity();
  const client = await createServerSupabaseClient();
  const [profile, roles] = await Promise.all([
    client
      .from("profiles")
      .select("display_name, preferred_language, academic_context")
      .eq("user_id", identity.userId)
      .single(),
    client
      .from("user_roles")
      .select("role")
      .eq("user_id", identity.userId)
      .is("revoked_at", null),
  ]);
  if (profile.error || roles.error)
    throw new Error("Account settings unavailable.");
  return {
    displayName: profile.data.display_name,
    locale: profile.data.preferred_language,
    academicContext: readAcademicContext(profile.data.academic_context),
    home: roleHome(roles.data.map((item) => item.role)),
  };
}
export async function currentRoleHome() {
  const identity = await requireVerifiedIdentity();
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", identity.userId)
    .is("revoked_at", null);
  if (error) throw new Error("Account destination unavailable.");
  return roleHome(data.map((item) => item.role));
}
export function saveCurrentAcademicSettings(input: unknown) {
  return saveAcademicSettings(
    {
      async eligibleCaller() {
        if ((await getCurrentAuthAccess()).gate !== "READY") return null;
        return (await requireVerifiedIdentity()).userId;
      },
      async catalog() {
        return (await loadCurrentStudentCatalog()).rows;
      },
      async save(caller, context) {
        const client = await createServerSupabaseClient();
        const { data, error } = await client
          .from("profiles")
          .update({
            academic_context: context,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", caller)
          .select("user_id")
          .single();
        if (error || !data)
          throw new Error("Academic settings could not be saved.");
      },
    },
    input,
  );
}

export async function loadCurrentStudyResume(
  rows: readonly AuthorizedCatalogRow[],
  cohortId: string,
) {
  const unitIds = rows
    .filter((row) => row.cohort.id === cohortId)
    .map((row) => row.unit.id);
  if (!unitIds.length) return null;
  try {
    const identity = await requireVerifiedIdentity();
    const client = await createServerSupabaseClient();
    const { data, error } = await client
      .from("chat_sessions")
      .select("id, cohort_id, curriculum_unit_id")
      .eq("user_id", identity.userId)
      .eq("cohort_id", cohortId)
      .in("curriculum_unit_id", unitIds)
      .is("closed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return error ? null : authorizedStudyResume(data, rows, cohortId);
  } catch {
    return null;
  }
}
