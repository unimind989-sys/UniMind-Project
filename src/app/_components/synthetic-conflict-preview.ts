import type { ProductState } from "./product-services";
import type { Locale, ReviewSession } from "./synthetic-fixtures";

export type ConflictPreviewState = Pick<
  ProductState,
  | "role"
  | "availability"
  | "sessions"
  | "activeSessions"
  | "sharing"
  | "studyLanguage"
  | "qualityConflictSessionId"
>;

export function canReviewConflictPreview(state: ConflictPreviewState): boolean {
  return (
    (state.role === "admin" || state.role === "second-admin") &&
    state.availability.unlocked &&
    state.availability.published &&
    state.availability.sourceActive
  );
}

// This adapter selects one invented conversation. It never generates an answer,
// rewrites an existing conversation/draft, or grants access to a real scope.
export function reviewConflictPreview<T extends ConflictPreviewState>(
  state: T,
  unitId: string,
  locale: Locale,
): T {
  if (!canReviewConflictPreview(state)) return state;
  const existing = state.sessions.find(
    (session) =>
      session.id === state.qualityConflictSessionId &&
      session.scope === unitId &&
      session.answers[0]?.kind === "conflict",
  );
  const id =
    existing?.id ??
    state.sessions.reduce(
      (maximum, session) => Math.max(maximum, session.id),
      0,
    ) + 1;
  if (existing && state.activeSessions[unitId] === id) return state;
  const preview: ReviewSession = {
    id,
    scope: unitId,
    answers: [
      {
        kind: "conflict",
        promptKind: "conflict",
        language: state.studyLanguage ?? locale,
        sessionId: id,
        sharing: state.sharing,
      },
    ],
  };
  return {
    ...state,
    sessions: existing ? state.sessions : [...state.sessions, preview],
    activeSessions: { ...state.activeSessions, [unitId]: id },
    qualityConflictSessionId: id,
  };
}
