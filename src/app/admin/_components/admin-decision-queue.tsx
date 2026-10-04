"use client";

import { useProductRouter } from "@/app/_components/product-navigation";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  type AdminActionCandidate,
  type AdminActionCode,
} from "@/lib/admin/admin-actions.application";
import type { AdminQueueState } from "@/lib/admin/admin-readiness.application";
import { getAdminCopy } from "@/lib/i18n/admin-copy";
import { getTextDirection, type Locale } from "@/lib/i18n/locale";

import { submitAdminAction } from "../actions";
import styles from "../admin.module.css";
import { AdminWorkspace } from "./admin-workspace";

function candidateState(candidate: AdminActionCandidate, locale: Locale) {
  if (candidate.commandState === "PENDING_SECOND_CONFIRMATION") {
    return locale === "ar" ? "تأكيد ثانٍ مطلوب" : "Second confirmation needed";
  }
  if (candidate.commandState === "PENDING_OWNER_REVIEW") {
    return locale === "ar" ? "مراجعة المسؤول مطلوبة" : "Owner review needed";
  }
  return candidate.failedPredicates.length > 0
    ? locale === "ar"
      ? "محجوب بفحوص الجاهزية"
      : "Readiness blocked"
    : locale === "ar"
      ? "بانتظار القرار"
      : "Decision available";
}

function candidateLabel(candidate: AdminActionCandidate, locale: Locale) {
  return locale === "ar" ? candidate.targetLabelAr : candidate.targetLabelEn;
}

function stateLabel(value: string, locale: Locale) {
  const labels: Readonly<Record<string, string>> = getAdminCopy(locale).states;
  return labels[value] ?? value;
}

function ActionPanel({
  candidate,
  locale,
  submitAction,
  refreshing,
  reloadAction,
}: Readonly<{
  candidate: AdminActionCandidate;
  locale: Locale;
  submitAction: typeof submitAdminAction;
  refreshing: boolean;
  reloadAction?: (() => void) | undefined;
}>) {
  const copy = getAdminCopy(locale);
  const predicateLabels = copy.predicates as Readonly<Record<string, string>>;
  const [state, formAction, pending] = useActionState(submitAction, {
    status: "IDLE" as const,
  });
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewReason, setReviewReason] = useState("");
  const [reviewExpiry, setReviewExpiry] = useState("");
  const reviewButton = useRef<HTMLButtonElement>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const direction = getTextDirection(locale);
  const actionable = candidate.commandState !== "PENDING_OWNER_REVIEW";
  const blocked = candidate.failedPredicates.length > 0;
  const secondConfirmation = candidate.pendingActionId !== null;
  const ownerReviewPending = candidate.commandState === "PENDING_OWNER_REVIEW";

  useEffect(() => {
    if (reviewOpen) confirmButton.current?.focus();
  }, [reviewOpen]);

  useEffect(() => {
    if (state.status !== "IDLE") feedbackRef.current?.focus();
  }, [state]);

  function openReview() {
    const form = reviewButton.current?.form;
    if (form === undefined || form === null || !form.reportValidity()) return;
    const reason = form.elements.namedItem("reason");
    const expiry = form.elements.namedItem("holdExpiresAtLocal");
    setReviewReason(reason instanceof HTMLTextAreaElement ? reason.value : "");
    setReviewExpiry(expiry instanceof HTMLInputElement ? expiry.value : "");
    setReviewOpen(true);
  }

  function closeReview() {
    setReviewOpen(false);
    requestAnimationFrame(() => reviewButton.current?.focus());
  }

  function prepareAction(event: FormEvent<HTMLFormElement>) {
    if (!reviewOpen) {
      event.preventDefault();
      return;
    }
    const form = event.currentTarget;
    const correlation = form.elements.namedItem("correlationId");
    const idempotency = form.elements.namedItem("idempotencyKey");
    if (correlation instanceof HTMLInputElement && correlation.value === "") {
      correlation.value = crypto.randomUUID();
    }
    if (idempotency instanceof HTMLInputElement && idempotency.value === "") {
      idempotency.value = crypto.randomUUID();
    }

    if (candidate.action === "PLACE_RAW_HOLD") {
      const localExpiry = form.elements.namedItem("holdExpiresAtLocal");
      const expiry = form.elements.namedItem("holdExpiresAt");
      if (
        localExpiry instanceof HTMLInputElement &&
        expiry instanceof HTMLInputElement &&
        localExpiry.value !== ""
      ) {
        expiry.value = new Date(localExpiry.value).toISOString();
      }
    }
  }

  function resetRequestKey(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setReviewOpen(false);
    const form = event.currentTarget.form;
    if (form === null) return;
    const correlation = form.elements.namedItem("correlationId");
    const idempotency = form.elements.namedItem("idempotencyKey");
    if (
      correlation instanceof HTMLInputElement &&
      candidate.pendingActionId === null
    )
      correlation.value = "";
    if (idempotency instanceof HTMLInputElement) idempotency.value = "";
  }

  let feedback: string | null = null;
  if (state.status === "ERROR") {
    feedback = copy.errors[(state.code ?? "UNAVAILABLE") as AdminActionCode];
  } else if (state.status === "APPLIED") {
    feedback = copy.actionSuccess;
  } else if (state.status === "PENDING_SECOND_CONFIRMATION") {
    feedback = copy.actionPending;
  } else if (state.status === "PENDING_OWNER_REVIEW") {
    feedback = copy.retryPending;
  }

  return (
    <section
      className={styles.detail}
      aria-labelledby="decision-detail-heading"
    >
      <div className={styles.detailHeading}>
        <div>
          <h2 id="decision-detail-heading" dir="auto">
            {candidateLabel(candidate, locale)}
          </h2>
          <p className={styles.actionName}>{copy.actions[candidate.action]}</p>
        </div>
        <span
          className={styles.statusCue}
          data-tone={
            blocked ? "blocked" : secondConfirmation ? "pending" : "ready"
          }
        >
          {candidateState(candidate, locale)}
        </span>
      </div>

      <dl className={styles.stateGrid}>
        <div>
          <dt>{copy.currentState}</dt>
          <dd dir="auto">{stateLabel(candidate.currentState, locale)}</dd>
        </div>
        <div>
          <dt>{copy.proposedState}</dt>
          <dd dir="auto">{stateLabel(candidate.proposedState, locale)}</dd>
        </div>
        <div>
          <dt>{copy.expectedVersion}</dt>
          <dd>
            {new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en").format(
              candidate.expectedVersion,
            )}
          </dd>
        </div>
      </dl>

      <div className={styles.readiness}>
        <h3>{copy.readiness}</h3>
        {candidate.failedPredicates.length === 0 ? (
          <p className={styles.readyState}>{copy.ready}</p>
        ) : (
          <ul>
            {candidate.failedPredicates.map((predicate) => (
              <li key={predicate}>{predicateLabels[predicate] ?? predicate}</li>
            ))}
          </ul>
        )}
      </div>

      {secondConfirmation && (
        <p className={styles.pendingNote} role="status">
          {copy.pendingFounder}
          {candidate.initiatorSlot
            ? ` · ${copy.initiatedBy}: ${candidate.initiatorSlot === "AHMED" ? copy.founderAhmed : copy.founderZiad}`
            : ""}
        </p>
      )}
      {candidate.commandState === "PENDING_OWNER_REVIEW" && (
        <p className={styles.pendingNote} role="status">
          {copy.pendingReview}
        </p>
      )}

      <form
        action={formAction}
        className={styles.actionForm}
        onSubmit={prepareAction}
        autoComplete="off"
      >
        <input type="hidden" name="action" value={candidate.action} />
        <input type="hidden" name="targetId" value={candidate.targetId} />
        <input
          type="hidden"
          name="expectedState"
          value={candidate.expectedState}
        />
        <input
          type="hidden"
          name="expectedVersion"
          value={candidate.expectedVersion}
        />
        <input
          type="hidden"
          name="pendingActionId"
          value={candidate.pendingActionId ?? ""}
        />
        <input
          type="hidden"
          name="correlationId"
          defaultValue={candidate.correlationId ?? ""}
        />
        <input type="hidden" name="idempotencyKey" defaultValue="" />
        <label className={styles.field}>
          <span>{copy.reason}</span>
          {secondConfirmation || ownerReviewPending ? (
            <textarea
              name="reason"
              value={candidate.reason ?? ""}
              readOnly
              rows={3}
              dir={direction}
            />
          ) : (
            <textarea
              name="reason"
              required
              minLength={8}
              maxLength={500}
              placeholder={copy.reasonPlaceholder}
              autoComplete="off"
              onChange={resetRequestKey}
              rows={3}
              dir={direction}
            />
          )}
          <small>{copy.reasonHint}</small>
        </label>

        {candidate.action === "PLACE_RAW_HOLD" && (
          <>
            <label className={styles.field}>
              <span>{copy.holdExpiry}</span>
              <input
                type="datetime-local"
                name="holdExpiresAtLocal"
                required
                autoComplete="off"
                onChange={resetRequestKey}
              />
            </label>
            <label className={styles.reviewAttestation}>
              <input
                type="checkbox"
                name="reviewAttested"
                value="true"
                required
                onChange={resetRequestKey}
              />
              <span>{copy.holdReview}</span>
            </label>
            <input type="hidden" name="holdExpiresAt" defaultValue="" />
          </>
        )}

        {feedback !== null && (
          <p
            ref={feedbackRef}
            tabIndex={-1}
            className={
              state.status === "ERROR"
                ? styles.errorMessage
                : styles.successMessage
            }
            role={state.status === "ERROR" ? "alert" : "status"}
          >
            {feedback}
          </p>
        )}
        {blocked && <p className={styles.blockedMessage}>{copy.blocked}</p>}
        {state.status !== "IDLE" && (
          <button
            className={styles.secondaryAction}
            type="button"
            onClick={reloadAction ?? (() => window.location.reload())}
          >
            {copy.reloadQueue}
          </button>
        )}
        {reviewOpen && (
          <section
            className={styles.reviewPanel}
            aria-label={copy.reviewHeading}
          >
            <h3>{copy.reviewHeading}</h3>
            <p>{copy.consequences[candidate.action]}</p>
            <dl>
              <div>
                <dt>{copy.target}</dt>
                <dd dir="auto">{candidateLabel(candidate, locale)}</dd>
              </div>
              <div>
                <dt>{copy.targetId}</dt>
                <dd>
                  <code dir="ltr">{candidate.targetId}</code>
                </dd>
              </div>
              <div>
                <dt>{copy.currentState}</dt>
                <dd>{stateLabel(candidate.currentState, locale)}</dd>
              </div>
              <div>
                <dt>{copy.proposedState}</dt>
                <dd>{stateLabel(candidate.proposedState, locale)}</dd>
              </div>
              <div>
                <dt>{copy.reason}</dt>
                <dd>{reviewReason}</dd>
              </div>
              {reviewExpiry !== "" && (
                <div>
                  <dt>{copy.holdExpiry}</dt>
                  <dd>{reviewExpiry}</dd>
                </div>
              )}
            </dl>
            {candidate.protected && <p>{copy.separateFounderNotice}</p>}
          </section>
        )}
        <div className={styles.reviewActions}>
          {reviewOpen ? (
            <>
              <button
                className={styles.secondaryAction}
                type="button"
                onClick={closeReview}
                disabled={pending}
              >
                {copy.cancelReview}
              </button>
              <button
                ref={confirmButton}
                className={styles.primaryAction}
                type="submit"
                disabled={
                  !actionable ||
                  blocked ||
                  pending ||
                  refreshing ||
                  state.status !== "IDLE"
                }
                aria-busy={pending}
              >
                {pending
                  ? copy.working
                  : secondConfirmation
                    ? copy.confirmSecond
                    : candidate.protected
                      ? copy.confirmProtected
                      : copy.confirmAction}
              </button>
            </>
          ) : (
            <button
              ref={reviewButton}
              className={styles.primaryAction}
              type="button"
              onClick={openReview}
              disabled={
                !actionable ||
                blocked ||
                pending ||
                refreshing ||
                state.status !== "IDLE"
              }
            >
              {refreshing ? copy.checkingState : copy.reviewAction}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export function AdminDecisionQueue({
  initialLocale,
  queue,
  submitAction = submitAdminAction,
  syntheticPreview = false,
  reloadAction,
  embedded = false,
  refreshOnSelect = true,
}: Readonly<{
  initialLocale: Locale;
  queue: AdminQueueState;
  submitAction?: typeof submitAdminAction;
  syntheticPreview?: boolean;
  reloadAction?: () => void;
  embedded?: boolean;
  refreshOnSelect?: boolean;
}>) {
  const router = useProductRouter();
  const [refreshing, startRefresh] = useTransition();
  const locale = initialLocale;
  const copy = getAdminCopy(locale);
  const direction = getTextDirection(locale);
  const candidates = queue.status === "READY" ? queue.candidates : [];
  const firstCandidate =
    candidates.find(
      (candidate) =>
        candidate.failedPredicates.length === 0 &&
        candidate.commandState !== "PENDING_OWNER_REVIEW",
    ) ?? candidates[0];
  const [selectedId, setSelectedId] = useState(
    firstCandidate?.candidateId ?? "",
  );
  const selected =
    candidates.find((candidate) => candidate.candidateId === selectedId) ??
    firstCandidate ??
    null;
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [direction, locale]);
  function selectCandidate(candidateId: string) {
    setSelectedId(candidateId);
    if (!syntheticPreview && refreshOnSelect)
      startRefresh(() => router.refresh());
  }
  const body = (
    <div className={styles.queue}>
      {queue.status === "FORBIDDEN" || queue.status === "UNAVAILABLE" ? (
        <section className={styles.notice} role="alert">
          <h2>
            {queue.status === "FORBIDDEN"
              ? copy.forbiddenTitle
              : copy.unavailableTitle}
          </h2>
          <p>
            {queue.status === "FORBIDDEN"
              ? copy.forbiddenBody
              : copy.unavailableBody}
          </p>
        </section>
      ) : candidates.length === 0 ? (
        <section className={styles.emptyState}>
          <h2>{copy.emptyTitle}</h2>
          <p>{copy.emptyBody}</p>
        </section>
      ) : (
        <div className={styles.queueLayout}>
          <section
            className={styles.queuePane}
            aria-labelledby="decision-list-heading"
          >
            <h2 id="decision-list-heading">
              {copy.decisionsHeading}{" "}
              <span className={styles.queueCountCompact}>
                ({new Intl.NumberFormat(locale).format(candidates.length)})
              </span>
            </h2>
            <div className={styles.mobileDecision}>
              <label htmlFor="admin-decision">
                {locale === "ar" ? "اختر قرارًا" : "Choose a decision"}
              </label>
              <select
                id="admin-decision"
                name="decision"
                value={selected?.candidateId ?? ""}
                onChange={(event) => selectCandidate(event.target.value)}
              >
                {candidates.map((candidate) => (
                  <option
                    key={candidate.candidateId}
                    value={candidate.candidateId}
                  >
                    {copy.actions[candidate.action]} ·{" "}
                    {candidateLabel(candidate, locale)} ·{" "}
                    {candidateState(candidate, locale)}
                  </option>
                ))}
              </select>
            </div>
            <ul className={styles.decisionList} id="decision-list">
              {candidates.map((candidate) => (
                <li key={candidate.candidateId}>
                  <button
                    className={styles.decisionButton}
                    data-selected={
                      candidate.candidateId === selected?.candidateId
                    }
                    type="button"
                    aria-pressed={
                      candidate.candidateId === selected?.candidateId
                    }
                    onClick={() => selectCandidate(candidate.candidateId)}
                  >
                    <span className={styles.decisionAction}>
                      {copy.actions[candidate.action]}
                    </span>
                    <span className={styles.decisionTarget}>
                      {candidateLabel(candidate, locale)}
                    </span>
                    <span
                      className={styles.listStatus}
                      data-tone={
                        candidate.failedPredicates.length > 0
                          ? "blocked"
                          : "ready"
                      }
                    >
                      {candidateState(candidate, locale)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          {selected ? (
            <ActionPanel
              key={selected.candidateId}
              candidate={selected}
              locale={locale}
              submitAction={submitAction}
              refreshing={refreshing}
              reloadAction={reloadAction}
            />
          ) : null}
        </div>
      )}
    </div>
  );
  return embedded ? (
    body
  ) : (
    <AdminWorkspace
      locale={locale}
      synthetic={syntheticPreview}
      preview={syntheticPreview}
    >
      {body}
    </AdminWorkspace>
  );
}
