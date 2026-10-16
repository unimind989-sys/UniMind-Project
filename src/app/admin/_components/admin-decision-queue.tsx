"use client";

import { useProductRouter } from "@/app/_components/product-navigation";
import { ProductNavigationLink } from "@/app/_components/product-navigation";
import type { Route } from "next";
import {
  adminAlreadyInState,
  adminDecisionGroup,
  adminTargetKind,
  adminReviewBinding,
  adminDecisionHref,
} from "@/lib/admin/admin-presentation.application";
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
import { ProductDialog } from "@/app/_components/product-dialog";
import { FrontendIcon } from "@/app/_components/frontend-controls";
import { AdminWorkspace } from "./admin-workspace";

function candidateState(candidate: AdminActionCandidate, locale: Locale) {
  if (adminAlreadyInState(candidate))
    return getAdminCopy(locale).alreadyInState;
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

function localExpiryValue(value: string) {
  const date = new Date(value);
  const two = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}T${two(date.getHours())}:${two(date.getMinutes())}`;
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
  reloadAction?: (() => void | Promise<void>) | undefined;
}>) {
  const copy = getAdminCopy(locale);
  const predicateLabels = copy.predicates as Readonly<Record<string, string>>;
  const [state, formAction, pending] = useActionState(submitAction, {
    status: "IDLE" as const,
  });
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewReason, setReviewReason] = useState("");
  const [reviewExpiry, setReviewExpiry] = useState("");
  const [reviewBinding, setReviewBinding] = useState("");
  const [reasonDraft, setReasonDraft] = useState("");
  const [expiryDraft, setExpiryDraft] = useState("");
  const [reviewAttested, setReviewAttested] = useState(false);
  const [correlationId, setCorrelationId] = useState(
    candidate.correlationId ?? "",
  );
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const reviewButton = useRef<HTMLButtonElement>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const direction = getTextDirection(locale);
  const actionable = candidate.commandState !== "PENDING_OWNER_REVIEW";
  const blocked = candidate.failedPredicates.length > 0;
  const completed = adminAlreadyInState(candidate);
  const secondConfirmation = candidate.pendingActionId !== null;
  const boundExpiry = secondConfirmation ? candidate.holdExpiresAt : null;
  const missingExpiry =
    secondConfirmation && candidate.action === "PLACE_RAW_HOLD" && !boundExpiry;
  const changedAfterReview =
    reviewOpen &&
    state.status === "IDLE" &&
    reviewBinding !== adminReviewBinding(candidate);
  const ownerReviewPending = candidate.commandState === "PENDING_OWNER_REVIEW";

  useEffect(() => {
    if (state.status !== "IDLE") feedbackRef.current?.focus();
  }, [state]);

  function openReview() {
    const form = reviewButton.current?.form;
    if (form === undefined || form === null) return;
    const reason = form.elements.namedItem("reason");
    const expiry = form.elements.namedItem("holdExpiresAtLocal");
    if (reason instanceof HTMLTextAreaElement) {
      reason.setCustomValidity(
        reason.value.trim().length < 8 || reason.value.trim().length > 500
          ? copy.reasonHint
          : "",
      );
    }
    if (!form.reportValidity()) return;
    setReviewReason(
      reason instanceof HTMLTextAreaElement ? reason.value.trim() : "",
    );
    setReviewExpiry(expiry instanceof HTMLInputElement ? expiry.value : "");
    setReviewBinding(adminReviewBinding(candidate));
    setReviewOpen(true);
  }

  function closeReview() {
    setReviewOpen(false);
    requestAnimationFrame(() => reviewButton.current?.focus());
  }

  function prepareAction(event: FormEvent<HTMLFormElement>) {
    if (!reviewOpen || changedAfterReview || missingExpiry) {
      event.preventDefault();
      return;
    }
    const form = event.currentTarget;
    const correlation = form.elements.namedItem("correlationId");
    const idempotency = form.elements.namedItem("idempotencyKey");
    if (correlation instanceof HTMLInputElement && correlation.value === "") {
      correlation.value = crypto.randomUUID();
      setCorrelationId(correlation.value);
    }
    if (idempotency instanceof HTMLInputElement && idempotency.value === "") {
      idempotency.value = crypto.randomUUID();
      setIdempotencyKey(idempotency.value);
    }

    if (candidate.action === "PLACE_RAW_HOLD") {
      const localExpiry = form.elements.namedItem("holdExpiresAtLocal");
      const expiry = form.elements.namedItem("holdExpiresAt");
      if (
        localExpiry instanceof HTMLInputElement &&
        expiry instanceof HTMLInputElement &&
        localExpiry.value !== ""
      ) {
        expiry.value = boundExpiry ?? new Date(localExpiry.value).toISOString();
      }
    }
  }

  function resetRequestKey(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setReviewOpen(false);
    event.currentTarget.setCustomValidity("");
    const form = event.currentTarget.form;
    if (form === null) return;
    const correlation = form.elements.namedItem("correlationId");
    const idempotency = form.elements.namedItem("idempotencyKey");
    if (
      correlation instanceof HTMLInputElement &&
      candidate.pendingActionId === null
    ) {
      correlation.value = "";
      setCorrelationId("");
    }
    if (idempotency instanceof HTMLInputElement) {
      idempotency.value = "";
      setIdempotencyKey("");
    }
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
          <h2 id="decision-detail-heading" dir="auto" tabIndex={-1}>
            {candidateLabel(candidate, locale)}
          </h2>
          <p className={styles.actionName}>{copy.actions[candidate.action]}</p>
          <p>{copy.targetKinds[adminTargetKind(candidate.action)]}</p>
        </div>
        <span
          className={styles.statusCue}
          data-tone={
            completed
              ? "ready"
              : blocked
                ? "blocked"
                : secondConfirmation
                  ? "pending"
                  : "ready"
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
        {completed ? (
          <p>{copy.alreadyInStateBody}</p>
        ) : candidate.failedPredicates.length === 0 ? (
          <p className={styles.readyState}>{copy.ready}</p>
        ) : (
          <ul>
            {candidate.failedPredicates.map((predicate) => (
              <li key={predicate}>{predicateLabels[predicate] ?? predicate}</li>
            ))}
          </ul>
        )}
      </div>

      <p>{copy.consequences[candidate.action]}</p>
      <details className={styles.readiness}>
        <summary>{copy.targetId}</summary>
        <code dir="ltr">{candidate.targetId}</code>
      </details>

      {secondConfirmation && (
        <p className={styles.pendingNote} role="status">
          {copy.pendingFounder}
          {candidate.initiatorSlot
            ? ` · ${copy.initiatedBy}: ${candidate.initiatorSlot === "AHMED" ? copy.founderAhmed : copy.founderZiad}`
            : ""}
        </p>
      )}
      {secondConfirmation && (
        <p>
          <ProductNavigationLink
            href={adminDecisionHref(candidate, locale) as Route}
          >
            {copy.pendingLink}
          </ProductNavigationLink>
        </p>
      )}
      {missingExpiry && (
        <p role="alert" className={styles.errorMessage}>
          {copy.missingHoldExpiry}
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
        <input type="hidden" name="correlationId" value={correlationId} />
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
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
              value={reasonDraft}
              onChange={(event) => {
                setReasonDraft(event.currentTarget.value);
                resetRequestKey(event);
              }}
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
                value={
                  boundExpiry ? localExpiryValue(boundExpiry) : expiryDraft
                }
                readOnly={secondConfirmation}
                onChange={(event) => {
                  setExpiryDraft(event.currentTarget.value);
                  resetRequestKey(event);
                }}
              />
            </label>
            <label className={styles.reviewAttestation}>
              <input
                type="checkbox"
                name="reviewAttested"
                value="true"
                required
                checked={reviewAttested}
                onChange={(event) => {
                  setReviewAttested(event.currentTarget.checked);
                  resetRequestKey(event);
                }}
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
        {blocked && !completed && (
          <p className={styles.blockedMessage}>{copy.blocked}</p>
        )}
        {changedAfterReview && (
          <p role="alert" className={styles.errorMessage}>
            {copy.reviewChanged}
          </p>
        )}
        {state.status !== "IDLE" && (
          <button
            className={styles.secondaryAction}
            type="button"
            disabled={refreshing}
            aria-busy={refreshing}
            onClick={reloadAction ?? (() => window.location.reload())}
          >
            {refreshing ? copy.checkingState : copy.reloadQueue}
          </button>
        )}
        <ProductDialog
          open={reviewOpen && state.status === "IDLE"}
          title={copy.reviewHeading}
          closeLabel={copy.cancelReview}
          onClose={closeReview}
          onAfterClose={() => {
            setReviewOpen(false);
            (state.status === "IDLE"
              ? reviewButton
              : feedbackRef
            ).current?.focus({ preventScroll: true });
          }}
          dismissible={!pending}
        >
          <section
            className={styles.reviewPanel}
            aria-label={copy.reviewHeading}
          >
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
              <div>
                <dt>{copy.expectedVersion}</dt>
                <dd>
                  {new Intl.NumberFormat(
                    locale === "ar" ? "ar-EG" : "en",
                  ).format(candidate.expectedVersion)}
                </dd>
              </div>
              {reviewExpiry !== "" && (
                <div>
                  <dt>{copy.holdExpiry}</dt>
                  <dd>{reviewExpiry}</dd>
                </div>
              )}
            </dl>
            <p>{copy.ready}</p>
            {candidate.protected && <p>{copy.separateFounderNotice}</p>}
          </section>
          <div className={styles.reviewActions}>
            <button
              ref={confirmButton}
              className={styles.primaryAction}
              type="submit"
              disabled={
                !actionable ||
                blocked ||
                missingExpiry ||
                changedAfterReview ||
                pending ||
                refreshing ||
                state.status !== "IDLE"
              }
              aria-busy={pending}
            >
              {pending
                ? copy.working
                : `${secondConfirmation ? copy.confirmSecond : candidate.protected ? copy.confirmProtected : copy.confirmAction}: ${copy.actions[candidate.action]}`}
            </button>
          </div>
        </ProductDialog>
        <div className={styles.reviewActions}>
          <button
            ref={reviewButton}
            className={styles.primaryAction}
            type="button"
            onClick={openReview}
            disabled={
              !actionable ||
              blocked ||
              missingExpiry ||
              pending ||
              refreshing ||
              state.status !== "IDLE"
            }
          >
            {refreshing ? copy.checkingState : copy.reviewAction}
          </button>
        </div>
      </form>
    </section>
  );
}

export function AdminDecisionQueue({
  initialLocale,
  queue,
  submitAction = submitAdminAction,
  reloadAction,
  embedded = false,
  refreshOnSelect = true,
  initialSelection,
  recheckComplete = false,
  onSelection,
}: Readonly<{
  initialLocale: Locale;
  queue: AdminQueueState;
  submitAction?: typeof submitAdminAction;
  reloadAction?: () => void | Promise<void>;
  embedded?: boolean;
  refreshOnSelect?: boolean;
  initialSelection?: { id: string; error: boolean };
  recheckComplete?: boolean;
  onSelection?: (candidateId: string) => void;
}>) {
  const router = useProductRouter();
  const [refreshing, startRefresh] = useTransition();
  const locale = initialLocale;
  const copy = getAdminCopy(locale);
  const direction = getTextDirection(locale);
  const candidates = queue.status === "READY" ? queue.candidates : [];
  const [selectedId, setSelectedId] = useState(initialSelection?.id ?? "");
  const [detailOpen, setDetailOpen] = useState(Boolean(initialSelection?.id));
  const [selectionError, setSelectionError] = useState(
    initialSelection?.error ?? false,
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const detail = useRef<HTMLDivElement>(null);
  const group = adminDecisionGroup;
  const matching = candidates.filter((candidate) =>
    `${copy.actions[candidate.action]} ${candidateLabel(candidate, locale)}`
      .toLocaleLowerCase(locale)
      .includes(search.trim().toLocaleLowerCase(locale)),
  );
  const filtered = matching.filter(
    (candidate) => filter === "all" || group(candidate) === filter,
  );
  const selected =
    candidates.find((candidate) => candidate.candidateId === selectedId) ??
    null;
  useEffect(() => {
    onSelection?.(selectedId);
  }, [selectedId, onSelection]);
  useEffect(() => {
    if (selectedId && detailOpen)
      detail.current
        ?.querySelector<HTMLElement>("#decision-detail-heading")
        ?.focus();
  }, [selectedId, detailOpen]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [direction, locale]);
  function selectCandidate(candidateId: string) {
    setSelectedId(candidateId);
    setSelectionError(false);
    setDetailOpen(true);
    requestAnimationFrame(() =>
      detail.current
        ?.querySelector<HTMLElement>("#decision-detail-heading")
        ?.focus(),
    );
    if (refreshOnSelect) startRefresh(() => router.refresh());
  }
  const [rechecked, setRechecked] = useState(false);
  function recheck() {
    startRefresh(async () => {
      if (reloadAction) await reloadAction();
      else router.refresh();
      setRechecked(true);
    });
  }
  const body = (
    <div className={styles.queue}>
      {recheckComplete && <p role="status">{copy.recheckDone}</p>}
      {selectionError && (
        <p role="alert" className={styles.errorMessage}>
          {copy.invalidSelection}
        </p>
      )}
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
          {queue.status === "UNAVAILABLE" && (
            <button
              className={styles.secondaryAction}
              type="button"
              onClick={recheck}
              disabled={refreshing}
              aria-busy={refreshing}
            >
              {refreshing ? copy.checkingState : copy.recheckQueue}
            </button>
          )}
          {rechecked && <p role="status">{copy.unavailableBody}</p>}
        </section>
      ) : candidates.length === 0 ? (
        <section className={styles.emptyState}>
          <h2>{copy.emptyTitle}</h2>
          <p>{copy.emptyBody}</p>
        </section>
      ) : (
        <div className={styles.queueLayout} data-detail-open={detailOpen}>
          <section
            className={styles.queuePane}
            aria-labelledby="decision-list-heading"
          >
            <h2 id="decision-list-heading">
              {copy.decisionsHeading}{" "}
              <span className={styles.queueCountCompact}>
                (
                {new Intl.NumberFormat(locale).format(
                  candidates.filter(
                    (candidate) => !adminAlreadyInState(candidate),
                  ).length,
                )}
                )
              </span>
            </h2>
            <label className={styles.queueSearch}>
              <span>
                {locale === "ar" ? "البحث عن قرار" : "Find a decision"}
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <div
              className={styles.queueFilters}
              aria-label={
                locale === "ar" ? "تصفية القرارات" : "Filter decisions"
              }
            >
              {(
                [
                  ["all", "All", "الكل"],
                  ["available", "Available", "متاح"],
                  ["blocked", "Blocked", "محجوب"],
                  ["pending", "Pending", "معلق"],
                  ["completed", "Completed", "مكتمل"],
                ] as const
              ).map(([id, en, ar]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                >
                  {locale === "ar" ? ar : en}{" "}
                  <span>
                    {new Intl.NumberFormat(locale).format(
                      id === "all"
                        ? matching.length
                        : matching.filter(
                            (candidate) => group(candidate) === id,
                          ).length,
                    )}
                  </span>
                </button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <p role="status">
                {locale === "ar"
                  ? "لا توجد قرارات تطابق البحث."
                  : "No decisions match this search."}
              </p>
            ) : null}
            <div className={styles.mobileDecision}>
              <label htmlFor="admin-decision">
                {locale === "ar" ? "اختر قرارًا" : "Choose a decision"}
              </label>
              <select
                id="admin-decision"
                name="decision"
                disabled={refreshing}
                value={selected?.candidateId ?? ""}
                onChange={(event) => selectCandidate(event.target.value)}
              >
                <option value="">
                  {locale === "ar"
                    ? "اختر قرارًا للمراجعة"
                    : "Choose a decision to review"}
                </option>
                {filtered.map((candidate) => (
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
              {filtered.map((candidate) => (
                <li key={candidate.candidateId}>
                  <button
                    className={styles.decisionButton}
                    data-selected={
                      candidate.candidateId === selected?.candidateId
                    }
                    type="button"
                    disabled={refreshing}
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
                        candidate.failedPredicates.length > 0 &&
                        !adminAlreadyInState(candidate)
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
          <div className={styles.selectedDetail} ref={detail} tabIndex={-1}>
            {selected ? (
              <>
                <button
                  className={styles.detailBack}
                  type="button"
                  onClick={() => {
                    setDetailOpen(false);
                    requestAnimationFrame(() => {
                      const chooser = document.getElementById("admin-decision");
                      if (chooser?.getClientRects().length) chooser.focus();
                      else
                        document
                          .querySelector<HTMLElement>(
                            "#decision-list [aria-pressed='true']",
                          )
                          ?.focus();
                    });
                  }}
                >
                  {locale === "ar"
                    ? "العودة إلى القرارات"
                    : "Back to decisions"}
                </button>
                <ActionPanel
                  key={selected.candidateId}
                  candidate={selected}
                  locale={locale}
                  submitAction={submitAction}
                  refreshing={refreshing}
                  reloadAction={recheck}
                />
              </>
            ) : (
              <section className={styles.decisionEmpty}>
                <FrontendIcon name="shield" />
                <h2>
                  {locale === "ar"
                    ? "اختر قرارًا للمراجعة"
                    : "Choose a decision to review"}
                </h2>
                <p>
                  {locale === "ar"
                    ? "راجع الهدف والنتيجة قبل تسجيل أي تغيير."
                    : "Inspect its target and consequence before recording a change."}
                </p>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
  return embedded ? (
    body
  ) : (
    <AdminWorkspace locale={locale}>{body}</AdminWorkspace>
  );
}
