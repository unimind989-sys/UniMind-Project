import {
  useActionState,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
} from "react";

import {
  adminAlreadyInState,
  adminReviewBinding,
} from "@/lib/admin/admin-presentation.application";
import type {
  AdminActionCandidate,
  AdminActionCode,
} from "@/lib/admin/admin-actions.application";

import type { AdminCopy, SubmitAdminAction } from "./candidate-presentation";

export type DecisionErrors = {
  reason?: true | undefined;
  expiry?: "required" | "past" | undefined;
  attestation?: true | undefined;
};

/**
 * Owns one decision's review lifecycle: the server action state, the
 * confirmation dialog binding (so a candidate that changes after review cannot
 * be confirmed), the request correlation/idempotency keys and feedback focus.
 * The caller owns the refs so render code never reads them from this result.
 */
export function useDecisionReview(
  candidate: AdminActionCandidate,
  submitAction: SubmitAdminAction,
  copy: AdminCopy,
  refs: Readonly<{
    reviewButton: RefObject<HTMLButtonElement | null>;
    feedbackRef: RefObject<HTMLParagraphElement | null>;
  }>,
  /** The demo's fixed clock for the hold expiry; real pages use now. */
  referenceTime?: string,
) {
  const { reviewButton, feedbackRef } = refs;
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
  const [errors, setErrors] = useState<DecisionErrors>({});
  const [correlationId, setCorrelationId] = useState(
    candidate.correlationId ?? "",
  );
  const [idempotencyKey, setIdempotencyKey] = useState("");
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
  }, [state, feedbackRef]);

  function openReview() {
    const form = reviewButton.current?.form;
    if (form === undefined || form === null) return;
    const reason = form.elements.namedItem("reason");
    const expiry = form.elements.namedItem("holdExpiresAtLocal");
    const attestation = form.elements.namedItem("reviewAttested");
    // Inline, localized errors instead of the browser's validation bubbles
    // (IX-27); focus moves to the first field to fix.
    const next: DecisionErrors = {};
    if (reason instanceof HTMLTextAreaElement && !reason.readOnly) {
      const length = reason.value.trim().length;
      if (length < 8 || length > 500) next.reason = true;
    }
    if (expiry instanceof HTMLInputElement && !expiry.readOnly) {
      if (expiry.value === "") next.expiry = "required";
      else if (
        new Date(expiry.value).getTime() <=
        (referenceTime ? Date.parse(referenceTime) : Date.now())
      )
        next.expiry = "past";
    }
    if (attestation instanceof HTMLInputElement && !attestation.checked)
      next.attestation = true;
    setErrors(next);
    const first = next.reason
      ? reason
      : next.expiry
        ? expiry
        : next.attestation
          ? attestation
          : null;
    if (first instanceof HTMLElement) {
      first.focus();
      return;
    }
    setReviewReason(
      reason instanceof HTMLTextAreaElement ? reason.value.trim() : "",
    );
    setReviewExpiry(expiry instanceof HTMLInputElement ? expiry.value : "");
    setReviewBinding(adminReviewBinding(candidate));
    setReviewOpen(true);
  }

  function clearError(field: keyof DecisionErrors) {
    setErrors((current) =>
      current[field] ? { ...current, [field]: undefined } : current,
    );
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

  return {
    state,
    formAction,
    pending,
    reviewOpen,
    setReviewOpen,
    reviewReason,
    reviewExpiry,
    reasonDraft,
    setReasonDraft,
    expiryDraft,
    setExpiryDraft,
    reviewAttested,
    setReviewAttested,
    correlationId,
    idempotencyKey,
    actionable,
    blocked,
    completed,
    secondConfirmation,
    boundExpiry,
    missingExpiry,
    changedAfterReview,
    ownerReviewPending,
    feedback,
    errors,
    clearError,
    openReview,
    closeReview,
    prepareAction,
    resetRequestKey,
  };
}

export type DecisionReview = ReturnType<typeof useDecisionReview>;
