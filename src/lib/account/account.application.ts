import {
  authorizedAcademicContext,
  type AcademicContext,
} from "./account.domain";
import type { AuthorizedCatalogRow } from "../catalog/catalog-journey.application";

export {
  readAcademicContext,
  authorizedAcademicContext,
  contextFromSelection,
  roleHome,
} from "./account.domain";
export type { AcademicContext, AccountRole } from "./account.domain";

export type AcademicSaveState = {
  status: "IDLE" | "SAVED" | "INVALID" | "FORBIDDEN" | "UNAVAILABLE";
};
export interface AcademicSettingsRepository {
  eligibleCaller(): Promise<string | null>;
  catalog(): Promise<readonly AuthorizedCatalogRow[]>;
  save(caller: string, context: AcademicContext): Promise<void>;
}
export async function saveAcademicSettings(
  repository: AcademicSettingsRepository,
  input: unknown,
): Promise<AcademicSaveState> {
  try {
    const caller = await repository.eligibleCaller();
    if (!caller) return { status: "FORBIDDEN" };
    const context = authorizedAcademicContext(
      input,
      await repository.catalog(),
    );
    if (!context) return { status: "INVALID" };
    await repository.save(caller, context);
    return { status: "SAVED" };
  } catch {
    return { status: "UNAVAILABLE" };
  }
}

export function authorizedStudyResume(
  session: { id: string; cohort_id: string; curriculum_unit_id: string } | null,
  rows: readonly AuthorizedCatalogRow[],
  cohortId: string,
): string | null {
  if (
    !session ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu.test(
      session.id,
    ) ||
    session.cohort_id !== cohortId ||
    !rows.some(
      (row) =>
        row.cohort.id === cohortId &&
        row.unit.id === session.curriculum_unit_id,
    )
  )
    return null;
  return `/learn/${encodeURIComponent(cohortId)}/${encodeURIComponent(session.curriculum_unit_id)}/chat?session=${session.id}`;
}
