import type { AdminActionCandidate } from "@/lib/admin/admin-actions.application";
import {
  adminDecisionHref,
  selectedAdminDecision,
} from "@/lib/admin/admin-presentation.application";
import type { ProductState } from "./synthetic-product-state.application";
import {
  actionFixtures,
  defaultScope,
  type Locale,
} from "./synthetic-fixtures.application";

export const adminOrigins = [
  "catalog",
  "cohorts",
  "campaigns",
  "sources",
  "jobs",
  "quality",
  "usage",
  "incidents",
] as const;
export type AdminOrigin = (typeof adminOrigins)[number];
type DecisionIdentity = Pick<
  AdminActionCandidate,
  "candidateId" | "action" | "targetId" | "expectedVersion" | "pendingActionId"
>;
export type AdminPreviewContext = {
  role: "admin" | "second-admin";
  cohortId: string;
  unitId: string;
  origin: AdminOrigin | null;
  decision: DecisionIdentity | null;
};
export function selectedAdminOrigin(
  query: Pick<URLSearchParams, "getAll">,
): AdminOrigin | null {
  const values = query.getAll("origin");
  return values.length === 1 &&
    adminOrigins.some((origin) => origin === values[0])
    ? (values[0] as AdminOrigin)
    : null;
}
export function adminResourceHref(origin: AdminOrigin, locale: Locale) {
  return `/admin/${origin}?lang=${locale}`;
}
export function syntheticResourceDecision(
  state: ProductState,
  origin: AdminOrigin,
) {
  // Campaign configuration has no governed campaign action in this queue.
  const names = {
    catalog: "publish",
    cohorts: "lock",
    sources: "quarantine",
    jobs: "retry",
    quality: "hide",
    usage: "disable",
    incidents: "hide",
  } as const;
  if (origin === "campaigns") return null;
  return (
    syntheticAdminCandidates(state).find(
      (candidate) => candidate.candidateId === `sample-${names[origin]}`,
    ) ?? null
  );
}
export function syntheticDecisionHref(
  candidate: AdminActionCandidate,
  locale: Locale,
  origin: AdminOrigin | null,
) {
  return (
    adminDecisionHref(candidate, locale) + (origin ? `&origin=${origin}` : "")
  );
}
export function adminPreviewContext(
  state: ProductState,
  origin: AdminOrigin | null,
  candidate: AdminActionCandidate | null = null,
): AdminPreviewContext | null {
  if (state.role !== "admin" && state.role !== "second-admin") return null;
  return {
    role: state.role,
    cohortId: defaultScope.cohortId,
    unitId: defaultScope.unitId,
    origin,
    decision: candidate
      ? {
          candidateId: candidate.candidateId,
          action: candidate.action,
          targetId: candidate.targetId,
          expectedVersion: candidate.expectedVersion,
          pendingActionId: candidate.pendingActionId,
        }
      : null,
  };
}
export function adminPreviewReturn(
  state: ProductState,
  scope: { cohortId: string; unitId: string },
  locale: Locale,
) {
  const fallback = `/admin?lang=${locale}`;
  const context = state.adminPreview;
  if (
    !context ||
    context.role !== state.role ||
    !state.verified ||
    !state.consent ||
    context.cohortId !== defaultScope.cohortId ||
    context.unitId !== defaultScope.unitId ||
    context.cohortId !== scope.cohortId ||
    context.unitId !== scope.unitId ||
    (context.origin !== null && !adminOrigins.includes(context.origin))
  )
    return fallback;
  if (context.decision) {
    const identity = context.decision;
    const query = new URLSearchParams({
      decision: identity.candidateId,
      action: identity.action,
      target: identity.targetId,
      version: String(identity.expectedVersion),
      ...(identity.pendingActionId
        ? { pending: identity.pendingActionId }
        : {}),
    });
    const candidates = syntheticAdminCandidates(state);
    const selection = selectedAdminDecision(candidates, query);
    const current = candidates.find(
      (candidate) => candidate.candidateId === selection.id,
    );
    return current
      ? syntheticDecisionHref(current, locale, context.origin)
      : fallback;
  }
  return context.origin ? adminResourceHref(context.origin, locale) : fallback;
}

const actionNames = [
  "PUBLISH_UNIT",
  "HIDE_UNIT",
  "UNLOCK_COHORT",
  "LOCK_COHORT",
  "ACTIVATE_SOURCE",
  "DEACTIVATE_SOURCE",
  "QUARANTINE_SOURCE",
  "RETRY_SOURCE",
  "PLACE_RAW_HOLD",
  "REMOVE_RAW_HOLD",
  "ENABLE_FLAG",
  "DISABLE_FLAG",
] as const;
export function syntheticAdminCandidates(
  state: ProductState,
  fixture = "",
): AdminActionCandidate[] {
  if (state.role !== "admin" && state.role !== "second-admin") return [];
  return actionFixtures.map((action, index) => {
    const derived =
      action.id === "publish"
        ? state.availability.published
          ? "PUBLISHED"
          : "DRAFT"
        : action.id === "hide"
          ? state.availability.published
            ? "PUBLISHED"
            : "WITHDRAWN"
          : action.id === "unlock"
            ? state.availability.unlocked
              ? "UNLOCKED"
              : "LOCKED"
            : action.id === "lock"
              ? state.availability.unlocked
                ? "UNLOCKED"
                : "LOCKED"
              : action.id === "activate"
                ? state.availability.sourceActive
                  ? "ACTIVE"
                  : "INACTIVE"
                : action.id === "deactivate"
                  ? state.availability.sourceActive
                    ? "ACTIVE"
                    : "DEACTIVATED"
                  : action.before;
    const current =
      state.adminStates[action.id] === "PENDING" ||
      (fixture === "pending" && action.id === "publish") ||
      (fixture === "missing-pending-expiry" && action.id === "hold")
        ? "PENDING"
        : [
              "publish",
              "hide",
              "unlock",
              "lock",
              "activate",
              "deactivate",
            ].includes(action.id)
          ? derived
          : (state.adminStates[action.id] ?? derived);
    return {
      candidateId: `sample-${action.id}`,
      action: actionNames[index]!,
      targetId: `a0000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      targetLabelEn: `${["publish", "hide"].includes(action.id) ? "Anatomy unit" : ["unlock", "lock"].includes(action.id) ? "Human Medicine cohort" : ["hold", "remove-hold"].includes(action.id) ? "Synthetic handout raw object" : ["enable", "disable"].includes(action.id) ? "Synthetic study artifact control" : ["quarantine", "retry"].includes(action.id) ? "Synthetic Anatomy recording · failed version" : "Synthetic Anatomy handout · accepted version"} · ${defaultScope.cohortName}`,
      targetLabelAr: `${["publish", "hide"].includes(action.id) ? "وحدة التشريح" : ["unlock", "lock"].includes(action.id) ? "مجموعة الطب البشري" : ["hold", "remove-hold"].includes(action.id) ? "العنصر الخام لملزمة تجريبية" : ["enable", "disable"].includes(action.id) ? "التحكم بأداة مذاكرة تجريبية" : ["quarantine", "retry"].includes(action.id) ? "تسجيل التشريح التجريبي · إصدار فاشل" : "ملزمة التشريح التجريبية · إصدار مقبول"} · ${defaultScope.levelNameAr} · ${defaultScope.termNameAr}`,
      currentState:
        current === "PENDING" || action.id === "retry"
          ? action.before
          : current,
      proposedState: action.after,
      expectedState: current === "PENDING" ? action.before : current,
      expectedVersion:
        current === "PENDING"
          ? (state.pendingVersions?.[action.id] ?? 2)
          : current === action.before
            ? 2
            : 3,
      failedPredicates:
        action.id === "enable"
          ? ["budget.approval_required"]
          : fixture === "blocked"
            ? ["source.active_ready", "source.rights_current"]
            : current === action.after
              ? ["target.already_applied"]
              : [],
      protected: action.protected,
      pendingActionId:
        current === "PENDING"
          ? `b0000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`
          : null,
      reason:
        current === "PENDING"
          ? (state.pendingReasons[action.id] ?? "Synthetic readiness review.")
          : null,
      commandState:
        current === "PENDING"
          ? "PENDING_SECOND_CONFIRMATION"
          : action.id === "retry" && current === action.after
            ? "PENDING_OWNER_REVIEW"
            : null,
      initiatorSlot:
        current === "PENDING"
          ? (state.pendingActors[action.id] ?? "AHMED")
          : null,
      correlationId: null,
      holdExpiresAt:
        current === "PENDING" && action.id === "hold"
          ? (state.pendingHoldExpiries[action.id] ?? null)
          : null,
    };
  });
}
