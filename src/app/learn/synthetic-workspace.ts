import type { WorkspaceScope } from "@/lib/workspace/workspace.application";

import { syntheticCatalogRows } from "./synthetic-catalog";

export function loadSyntheticWorkspaceScope(
  cohortId: string,
  unitId: string,
): WorkspaceScope | null {
  const row = syntheticCatalogRows.find(
    (entry) => entry.cohort.id === cohortId && entry.unit.id === unitId,
  );
  if (row === undefined) return null;
  return {
    cohortId: row.cohort.id,
    unitId: row.unit.id,
    unitType: row.unit.unitType,
    progressionMode: row.program.progressionMode,
    stageNameEn: row.stage.nameEn,
    stageNameAr: row.stage.nameAr,
    institutionNameEn: row.institution.nameEn,
    institutionNameAr: row.institution.nameAr,
    programNameEn: row.program.nameEn,
    programNameAr: row.program.nameAr,
    levelNameEn: row.level.nameEn,
    levelNameAr: row.level.nameAr,
    termNameEn: row.term.nameEn,
    termNameAr: row.term.nameAr,
    cohortName: row.cohort.nameEn,
    curriculumEdition: row.cohort.curriculumEdition,
    unitTitleEn: row.unit.nameEn,
    unitTitleAr: row.unit.nameAr,
    unitLabelSingularEn: row.program.unitLabelSingularEn,
    unitLabelPluralEn: row.program.unitLabelPluralEn,
    unitLabelSingularAr: row.program.unitLabelSingularAr,
    unitLabelPluralAr: row.program.unitLabelPluralAr,
    sourceCount: row.unit.sourceCount ?? 1,
    materialUpdatedAt: "2026-09-15T12:00:00.000Z",
    sourceStatus: "READY",
    quotaStatus: "UNAVAILABLE",
  };
}
