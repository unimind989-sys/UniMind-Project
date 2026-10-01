import { z } from "zod";
import type {
  AuthorizedCatalogRow,
  CatalogSelection,
} from "../catalog/catalog-journey.domain";

const identifier = z.string().min(1).max(128);
export const academicContextSchema = z.strictObject({
  version: z.literal(1),
  stageId: identifier,
  institutionId: identifier,
  programId: identifier,
  levelId: identifier,
  termId: identifier,
  cohortId: identifier,
});
export type AcademicContext = z.infer<typeof academicContextSchema>;

export function readAcademicContext(input: unknown): AcademicContext | null {
  const result = academicContextSchema.safeParse(input);
  return result.success ? result.data : null;
}
export function authorizedAcademicContext(
  input: unknown,
  rows: readonly AuthorizedCatalogRow[],
): AcademicContext | null {
  const context = readAcademicContext(input);
  if (!context) return null;
  return rows.some(
    (row) =>
      row.stage.id === context.stageId &&
      row.institution.id === context.institutionId &&
      row.program.id === context.programId &&
      row.level.id === context.levelId &&
      row.term.id === context.termId &&
      row.cohort.id === context.cohortId,
  )
    ? context
    : null;
}
export function contextFromSelection(
  selection: CatalogSelection,
): AcademicContext | null {
  return readAcademicContext({
    version: 1,
    stageId: selection.stageId,
    institutionId: selection.institutionId,
    programId: selection.programId,
    levelId: selection.levelId,
    termId: selection.termId,
    cohortId: selection.cohortId,
  });
}
export type AccountRole = "STUDENT" | "BATCH_LEADER" | "ADMIN";
export function roleHome(roles: readonly AccountRole[]) {
  return roles.includes("ADMIN")
    ? "/admin"
    : roles.includes("BATCH_LEADER")
      ? "/batch-leader"
      : "/learn";
}
