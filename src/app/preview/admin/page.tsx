import type { Metadata } from "next";

import { AdminDecisionQueue } from "@/app/admin/_components/admin-decision-queue";
import type { AdminActionCandidate } from "@/lib/admin/admin-actions.application";
import type { AdminQueueState } from "@/lib/admin/admin-readiness.application";
import { resolveLocale } from "@/lib/i18n/locale";

import { submitSyntheticAdminAction } from "./actions";

export const metadata: Metadata = {
  title: "Synthetic admin decision queue | UniMind",
  robots: { index: false, follow: false },
};

const candidates = {
  containment: {
    candidateId: "synthetic:containment",
    action: "HIDE_UNIT",
    targetId: "a0000000-0000-4000-8000-000000000001",
    targetLabelEn: "Synthetic Anatomy · Cohort A",
    targetLabelAr: "تشريح تجريبي · المجموعة أ",
    currentState: "PUBLISHED",
    proposedState: "WITHDRAWN",
    expectedState: "PUBLISHED",
    expectedVersion: 2,
    failedPredicates: [],
    protected: false,
    pendingActionId: null,
    reason: null,
    commandState: null,
    initiatorSlot: null,
    correlationId: null,
  },
  protected: {
    candidateId: "synthetic:protected",
    action: "PUBLISH_UNIT",
    targetId: "a0000000-0000-4000-8000-000000000002",
    targetLabelEn: "Synthetic Physiology · Cohort A",
    targetLabelAr: "وظائف أعضاء تجريبية · المجموعة أ",
    currentState: "DRAFT",
    proposedState: "PUBLISHED",
    expectedState: "DRAFT",
    expectedVersion: 1,
    failedPredicates: [],
    protected: true,
    pendingActionId: null,
    reason: null,
    commandState: null,
    initiatorSlot: null,
    correlationId: null,
  },
  stale: {
    candidateId: "synthetic:stale",
    action: "LOCK_COHORT",
    targetId: "a0000000-0000-4000-8000-000000000003",
    targetLabelEn: "Synthetic Cohort B",
    targetLabelAr: "المجموعة التجريبية ب",
    currentState: "UNLOCKED",
    proposedState: "LOCKED",
    expectedState: "UNLOCKED",
    expectedVersion: 4,
    failedPredicates: [],
    protected: false,
    pendingActionId: null,
    reason: null,
    commandState: null,
    initiatorSlot: null,
    correlationId: null,
  },
  error: {
    candidateId: "synthetic:error",
    action: "DEACTIVATE_SOURCE",
    targetId: "a0000000-0000-4000-8000-000000000004",
    targetLabelEn: "Synthetic source version",
    targetLabelAr: "إصدار مصدر تجريبي",
    currentState: "ACTIVE",
    proposedState: "DEACTIVATED",
    expectedState: "ACTIVE",
    expectedVersion: 3,
    failedPredicates: [],
    protected: false,
    pendingActionId: null,
    reason: null,
    commandState: null,
    initiatorSlot: null,
    correlationId: null,
  },
} satisfies Record<string, AdminActionCandidate>;

const blocked: AdminActionCandidate = {
  ...candidates.protected,
  candidateId: "synthetic:blocked",
  failedPredicates: ["source.active_ready", "source.rights_current"],
};

const awaitingFounder: AdminActionCandidate = {
  ...candidates.protected,
  candidateId: "synthetic:pending",
  pendingActionId: "a0000000-0000-4000-8000-000000000009",
  reason: "Publish after synthetic readiness review.",
  commandState: "PENDING_SECOND_CONFIRMATION",
  initiatorSlot: "AHMED",
  correlationId: "a0000000-0000-4000-8000-000000000008",
};

export default async function SyntheticAdminPreviewPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const query = await searchParams;
  const locale = resolveLocale(
    Array.isArray(query.lang) ? query.lang[0] : query.lang,
  );
  const requestedState = Array.isArray(query.state)
    ? query.state[0]
    : query.state;
  const selectedCandidate =
    requestedState !== undefined &&
    Object.prototype.hasOwnProperty.call(candidates, requestedState)
      ? candidates[requestedState as keyof typeof candidates]
      : null;
  const queue: AdminQueueState =
    requestedState === "forbidden"
      ? { status: "FORBIDDEN" }
      : requestedState === "unavailable"
        ? { status: "UNAVAILABLE" }
        : {
            status: "READY",
            candidates:
              requestedState === "empty"
                ? []
                : requestedState === "blocked"
                  ? [blocked]
                  : requestedState === "pending"
                    ? [awaitingFounder]
                    : selectedCandidate !== null
                      ? [selectedCandidate]
                      : [
                          candidates.containment,
                          blocked,
                          awaitingFounder,
                          candidates.stale,
                        ],
          };

  return (
    <AdminDecisionQueue
      initialLocale={locale}
      queue={queue}
      submitAction={submitSyntheticAdminAction}
      syntheticPreview
    />
  );
}
