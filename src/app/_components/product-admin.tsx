"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { selectedAdminDecision } from "@/lib/admin/admin-presentation.application";
import { AdminDecisionQueue } from "@/app/admin/_components/admin-decision-queue";
import type { AdminActionFormState } from "@/app/admin/actions";
import { parseAdminHoldExpiry } from "@/lib/admin/admin-actions.application";
import { useProductServices } from "./product-services";
import {
  actionFixtures,
  applySampleAvailability,
  type Locale,
} from "./synthetic-fixtures";
import { ProductLink } from "./product-ui";
import {
  syntheticAdminCandidates,
  selectedAdminOrigin,
  adminResourceHref,
  adminPreviewContext,
} from "./synthetic-admin-context";
import { resourceNames } from "./synthetic-fixtures";
import { defaultUnitPath } from "./synthetic-fixtures";

export function ProductAdmin({
  locale,
  fixture,
}: {
  locale: Locale;
  fixture: string;
}) {
  const { state, update } = useProductServices();
  const query = useSearchParams();
  const [queueVersion, setQueueVersion] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const origin = selectedAdminOrigin(query);
  const slot = state.role === "second-admin" ? "ZIAD" : "AHMED";
  const candidates = syntheticAdminCandidates(state, fixture);
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
      Number(data.get("expectedVersion")) !== candidate.expectedVersion ||
      data.get("expectedState") !== candidate.expectedState
    )
      return { status: "ERROR", code: "STALE_VERSION" };
    if (fixture === "error") return { status: "ERROR", code: "UNAVAILABLE" };
    if (candidate.pendingActionId && candidate.initiatorSlot === slot)
      return { status: "ERROR", code: "DIFFERENT_FOUNDER_REQUIRED" };
    const holdExpiresAt = parseAdminHoldExpiry(data.get("holdExpiresAt"));
    const reason = data.get("reason");
    if (
      typeof reason !== "string" ||
      reason.trim().length < 8 ||
      reason.trim().length > 500 ||
      (candidate.action === "PLACE_RAW_HOLD" &&
        (holdExpiresAt === null || data.get("reviewAttested") !== "true"))
    )
      return { status: "ERROR", code: "INVALID_REQUEST" };
    if (
      candidate.pendingActionId &&
      (reason.trim() !== candidate.reason ||
        (candidate.action === "PLACE_RAW_HOLD" &&
          holdExpiresAt !== candidate.holdExpiresAt))
    )
      return { status: "ERROR", code: "CONFLICT" };
    const definition = actionFixtures[candidates.indexOf(candidate)]!;
    const pending = candidate.protected && !candidate.pendingActionId;
    const next = pending ? "PENDING" : definition.after;
    update((current) => ({
      ...current,
      adminStates: { ...current.adminStates, [definition.id]: next },
      pendingActors: pending
        ? { ...current.pendingActors, [definition.id]: slot }
        : current.pendingActors,
      pendingVersions: pending
        ? {
            ...current.pendingVersions,
            [definition.id]: candidate.expectedVersion,
          }
        : current.pendingVersions,
      pendingReasons: pending
        ? {
            ...current.pendingReasons,
            [definition.id]: reason.trim(),
          }
        : Object.fromEntries(
            Object.entries(current.pendingReasons).filter(
              ([id]) => id !== definition.id,
            ),
          ),
      pendingHoldExpiries:
        pending && candidate.action === "PLACE_RAW_HOLD"
          ? {
              ...current.pendingHoldExpiries,
              [definition.id]: String(holdExpiresAt),
            }
          : Object.fromEntries(
              Object.entries(current.pendingHoldExpiries).filter(
                ([id]) => id !== definition.id,
              ),
            ),
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
      : fixture === "error-page" && queueVersion === 0
        ? { status: "UNAVAILABLE" as const }
        : {
            status: "READY" as const,
            candidates: fixture === "empty" ? [] : candidates,
          };
  return (
    <>
      <AdminDecisionQueue
        key={`${queueVersion}-${JSON.stringify(["decision", "action", "target", "version", "pending"].map((field) => query.getAll(field)))}`}
        initialLocale={locale}
        queue={queue}
        submitAction={submit}
        reloadAction={async () => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setQueueVersion((value) => value + 1);
        }}
        initialSelection={selectedAdminDecision(candidates, query)}
        recheckComplete={fixture === "error-page" && queueVersion > 0}
        embedded
        refreshOnSelect={false}
        onSelection={setSelectedId}
      />
      <div>
        {origin && (
          <ProductLink href={adminResourceHref(origin, locale)} locale={locale}>
            {locale === "ar"
              ? "العودة إلى " + resourceNames[origin][1]
              : "Return to " + resourceNames[origin][0]}
          </ProductLink>
        )}
        <ProductLink href="/admin" locale={locale}>
          {locale === "ar" ? "كل القرارات" : "All decisions"}
        </ProductLink>
        <ProductLink
          href={defaultUnitPath}
          locale={locale}
          onClick={(event) => {
            if (
              event.defaultPrevented ||
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            )
              return;
            update((current) => ({
              ...current,
              adminPreview: adminPreviewContext(
                current,
                origin,
                candidates.find(
                  (candidate) => candidate.candidateId === selectedId,
                ) ?? null,
              ),
            }));
          }}
        >
          {locale === "ar" ? "معاينة الطالب" : "Preview student"}
        </ProductLink>
      </div>
    </>
  );
}
