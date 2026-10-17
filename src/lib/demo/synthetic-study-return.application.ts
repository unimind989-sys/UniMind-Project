import { authorizedAcademicContext } from "@/lib/account/account.application";
import { resolveStudyReturnPath } from "@/lib/study/study-origin.application";
import { recentStudyDetails } from "@/lib/study/recent-work.application";
import {
  reviewCatalogRows,
  sampleScopeAvailable,
  type Locale,
} from "./synthetic-fixtures.application";
import type { ProductState } from "./synthetic-product-state.application";

/** The newest study work the synthetic account may return to, if any. */
export function currentStudyReturn(state: ProductState, now: number) {
  if (!state.role || state.role === "leader") return null;
  const preferred =
    state.role === "student" && state.academicContext
      ? authorizedAcademicContext(
          state.academicContext,
          reviewCatalogRows.filter((row) =>
            sampleScopeAvailable(state, row.cohort.id, row.unit.id),
          ),
        )
      : null;
  if (state.role === "student" && state.academicContext && !preferred)
    return null;
  for (const row of reviewCatalogRows) {
    if (!sampleScopeAvailable(state, row.cohort.id, row.unit.id)) continue;
    if (preferred && !authorizedAcademicContext(preferred, [row])) continue;
    const target = resolveStudyReturnPath(
      state.lastStudyPath,
      `/learn/${row.cohort.id}/${row.unit.id}`,
      state.attempts[row.unit.id],
      now,
    );
    if (target) return { ...target, unit: row.unit };
  }
  return null;
}

export function currentStudyDetails(
  state: ProductState,
  locale: Locale,
  now: number,
) {
  const target = currentStudyReturn(state, now);
  if (!target) return null;
  const unitId = target.unit.id;
  return recentStudyDetails({
    tool: target.tool,
    locale,
    now,
    conversation: state.sessions.find(
      (session) =>
        session.scope === unitId && session.id === state.activeSessions[unitId],
    ),
    artifact: state.artifacts[unitId],
    attempt: state.attempts[unitId],
  });
}
