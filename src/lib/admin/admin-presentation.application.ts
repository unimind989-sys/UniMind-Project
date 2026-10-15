import type {
  AdminActionCandidate,
  AdminActionName,
} from "./admin-actions.domain";

// Presentation only. Server action and repository checks remain authoritative.
export function adminAlreadyInState(candidate: AdminActionCandidate) {
  return (
    candidate.commandState !== "PENDING_SECOND_CONFIRMATION" &&
    candidate.commandState !== "PENDING_OWNER_REVIEW" &&
    candidate.failedPredicates.length === 1 &&
    candidate.failedPredicates[0] === "target.already_applied"
  );
}
export function adminDecisionGroup(candidate: AdminActionCandidate) {
  if (
    candidate.commandState === "PENDING_SECOND_CONFIRMATION" ||
    candidate.commandState === "PENDING_OWNER_REVIEW"
  )
    return "pending";
  if (adminAlreadyInState(candidate)) return "completed";
  return candidate.failedPredicates.length ? "blocked" : "available";
}
export function adminTargetKind(action: AdminActionName) {
  if (action.endsWith("_UNIT")) return "UNIT";
  if (action.endsWith("_COHORT")) return "COHORT";
  if (action.endsWith("_SOURCE")) return "SOURCE";
  if (action.endsWith("_HOLD")) return "RAW_OBJECT";
  return "FLAG";
}
export function adminReviewBinding(candidate: AdminActionCandidate) {
  return JSON.stringify([
    candidate.candidateId,
    candidate.action,
    candidate.targetId,
    candidate.expectedState,
    candidate.expectedVersion,
    candidate.currentState,
    candidate.proposedState,
    candidate.pendingActionId,
    candidate.reason,
    candidate.holdExpiresAt ?? null,
    candidate.initiatorSlot,
    candidate.commandState,
    candidate.protected,
    candidate.failedPredicates,
  ]);
}
export function selectedAdminDecision(
  candidates: readonly AdminActionCandidate[],
  query: Pick<URLSearchParams, "getAll">,
) {
  const values = ["decision", "action", "target", "version"].map((field) =>
    query.getAll(field),
  );
  if (values.every((value) => value.length === 0))
    return { id: "", error: query.getAll("pending").length > 0 };
  if (values.some((value) => value.length !== 1))
    return { id: "", error: true };
  const [id, action, target, version] = values.map((value) => value[0]!);
  const selected = candidates.find(
    (candidate) =>
      candidate.candidateId === id &&
      candidate.action === action &&
      candidate.targetId === target &&
      String(candidate.expectedVersion) === version,
  );
  const pending = query.getAll("pending");
  if (
    !selected ||
    pending.length > 1 ||
    (selected.pendingActionId
      ? pending.length !== 1 || pending[0] !== selected.pendingActionId
      : pending.length !== 0)
  )
    return { id: "", error: true };
  return { id: selected.candidateId, error: false };
}
export function adminDecisionHref(
  candidate: AdminActionCandidate,
  locale: "en" | "ar",
) {
  return (
    "/admin?" +
    new URLSearchParams({
      decision: candidate.candidateId,
      action: candidate.action,
      target: candidate.targetId,
      version: String(candidate.expectedVersion),
      lang: locale,
      ...(candidate.pendingActionId
        ? { pending: candidate.pendingActionId }
        : {}),
    }).toString()
  );
}
