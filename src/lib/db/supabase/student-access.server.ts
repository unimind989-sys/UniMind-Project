import "server-only";

import { createServerSupabaseClient } from "./server";

export type StudentProfile = Readonly<{
  displayName: string;
  preferredLanguage: "EN" | "AR_EG" | "MIXED";
}>;

export type AvailableCurriculumUnit = Readonly<{
  id: string;
  cohortId: string;
  code: string;
  unitType: "MODULE" | "SUBJECT";
  titleEn: string;
  titleAr: string;
}>;

export class StudentDataAccessError extends Error {
  readonly operation: "available-units" | "profile";

  constructor(operation: "available-units" | "profile") {
    super(`Student data access failed: ${operation}.`);
    this.name = "StudentDataAccessError";
    this.operation = operation;
  }
}

export async function getCurrentStudentProfile(): Promise<StudentProfile | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("profiles")
    .select("display_name, preferred_language")
    .maybeSingle();

  if (error !== null) {
    throw new StudentDataAccessError("profile");
  }
  if (data === null) {
    return null;
  }

  return {
    displayName: data.display_name,
    preferredLanguage:
      data.preferred_language as StudentProfile["preferredLanguage"],
  };
}

export async function listCurrentStudentAvailableUnits(): Promise<
  readonly AvailableCurriculumUnit[]
> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("available_curriculum_units", {
    admin_preview: false,
  });

  if (error !== null || data === null) {
    throw new StudentDataAccessError("available-units");
  }

  return data.map((unit) => ({
    id: unit.id,
    cohortId: unit.cohort_id,
    code: unit.code,
    unitType: unit.unit_type,
    titleEn: unit.title_en,
    titleAr: unit.title_ar,
  }));
}
