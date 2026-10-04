"use client";
import { useState } from "react";
import { AdminDecisionQueue } from "@/app/admin/_components/admin-decision-queue";
import type { AdminActionFormState } from "@/app/admin/actions";
import type { AdminActionCandidate } from "@/lib/admin/admin-actions.application";
import { useProductServices } from "./product-services";
import {
  actionFixtures,
  applySampleAvailability,
  type Locale,
} from "./synthetic-fixtures";
import { ProductLink } from "./product-ui";
import { defaultUnitPath, defaultScope } from "./synthetic-fixtures";
import { useSyntheticNavigation } from "./product-navigation";

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
export function ProductAdmin({
  locale,
  fixture,
}: {
  locale: Locale;
  fixture: string;
}) {
  const { state, update } = useProductServices();
  const hosted = useSyntheticNavigation();
  const [queueVersion, setQueueVersion] = useState(0);
  const slot = state.role === "second-admin" ? "ZIAD" : "AHMED";
  const candidates: AdminActionCandidate[] = actionFixtures.map(
    (action, index) => {
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
        (fixture === "pending" && action.id === "publish")
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
        targetLabelEn: `${defaultScope.unitTitleEn} · ${defaultScope.cohortName}`,
        targetLabelAr: `${defaultScope.unitTitleAr} · ${defaultScope.programNameAr} · ${defaultScope.levelNameAr} · ${defaultScope.termNameAr}`,
        currentState:
          current === "PENDING" || action.id === "retry"
            ? action.before
            : current,
        proposedState: action.after,
        expectedState: current === "PENDING" ? action.before : current,
        expectedVersion: current === action.before ? 2 : 3,
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
      };
    },
  );
  async function submit(
    _previous: AdminActionFormState,
    data: FormData,
  ): Promise<AdminActionFormState> {
    const candidate = candidates.find(
      (item) =>
        item.targetId === data.get("targetId") &&
        item.action === data.get("action"),
    );
    if (!candidate || !["admin", "second-admin"].includes(state.role ?? ""))
      return { status: "ERROR", code: "FORBIDDEN" };
    if (candidate.failedPredicates.length)
      return { status: "ERROR", code: "READINESS_BLOCKED" };
    if (
      fixture === "stale" ||
      Number(data.get("expectedVersion")) !== candidate.expectedVersion
    )
      return { status: "ERROR", code: "STALE_VERSION" };
    if (fixture === "error") return { status: "ERROR", code: "UNAVAILABLE" };
    if (candidate.pendingActionId && candidate.initiatorSlot === slot)
      return { status: "ERROR", code: "DIFFERENT_FOUNDER_REQUIRED" };
    if (
      candidate.action === "PLACE_RAW_HOLD" &&
      ((hosted?.active
        ? !Number.isFinite(Date.parse(String(data.get("holdExpiresAt")))) ||
          Date.parse(String(data.get("holdExpiresAt"))) <= Date.now()
        : data.get("holdExpiresAtLocal") !== "2026-10-03T16:00") ||
        data.get("reviewAttested") !== "true")
    )
      return { status: "ERROR", code: "INVALID_REQUEST" };
    const reason = data.get("reason");
    if (
      hosted?.active
        ? typeof reason !== "string" ||
          reason.trim().length < 8 ||
          reason.trim().length > 500
        : !["Synthetic readiness review.", "مراجعة جاهزية تجريبية."].includes(
            String(reason),
          )
    )
      return { status: "ERROR", code: "INVALID_REQUEST" };
    const definition = actionFixtures[candidates.indexOf(candidate)]!;
    const pending = candidate.protected && !candidate.pendingActionId;
    const next = pending ? "PENDING" : definition.after;
    update((current) => ({
      ...current,
      adminStates: { ...current.adminStates, [definition.id]: next },
      pendingActors: pending
        ? { ...current.pendingActors, [definition.id]: slot }
        : current.pendingActors,
      pendingReasons:
        pending && hosted?.active
          ? {
              ...current.pendingReasons,
              [definition.id]: String(reason).trim(),
            }
          : current.pendingReasons,
      availability: pending
        ? current.availability
        : applySampleAvailability(current, definition.id),
      audit: [
        ...current.audit,
        [
          `Synthetic ${definition.label[0]} · ${next}`,
          `مثال ${definition.label[1]} · ${next}`,
        ],
      ],
    }));
    return {
      status: pending
        ? "PENDING_SECOND_CONFIRMATION"
        : definition.id === "retry"
          ? "PENDING_OWNER_REVIEW"
          : "APPLIED",
    };
  }
  const queue =
    fixture === "forbidden"
      ? { status: "FORBIDDEN" as const }
      : fixture === "error-page"
        ? { status: "UNAVAILABLE" as const }
        : {
            status: "READY" as const,
            candidates: fixture === "empty" ? [] : candidates,
          };
  return (
    <>
      <AdminDecisionQueue
        key={queueVersion}
        initialLocale={locale}
        queue={queue}
        submitAction={submit}
        reloadAction={() => setQueueVersion((value) => value + 1)}
        embedded
        refreshOnSelect={false}
      />
      <div>
        <ProductLink href={defaultUnitPath} locale={locale}>
          {locale === "ar" ? "معاينة الطالب" : "Preview student"}
        </ProductLink>
      </div>
    </>
  );
}
