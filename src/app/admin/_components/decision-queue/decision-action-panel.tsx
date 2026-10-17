import { useRef } from "react";

import type { AdminActionCandidate } from "@/lib/admin/admin-actions.application";
import { getAdminCopy } from "@/lib/i18n/admin-copy";
import { getTextDirection, type Locale } from "@/lib/i18n/locale";

import styles from "../../admin.module.css";
import type { SubmitAdminAction } from "./candidate-presentation";
import { DecisionFeedback } from "./decision-feedback";
import { DecisionFormFields } from "./decision-form-fields";
import { DecisionReviewDialog } from "./decision-review-dialog";
import { DecisionSummary } from "./decision-summary";
import { useDecisionReview } from "./use-decision-review";

/** Detail panel for one selected decision: summary, form and confirmation. */
export function DecisionActionPanel({
  candidate,
  locale,
  submitAction,
  refreshing,
  reloadAction,
}: Readonly<{
  candidate: AdminActionCandidate;
  locale: Locale;
  submitAction: SubmitAdminAction;
  refreshing: boolean;
  reloadAction?: (() => void | Promise<void>) | undefined;
}>) {
  const copy = getAdminCopy(locale);
  const reviewButton = useRef<HTMLButtonElement>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const review = useDecisionReview(candidate, submitAction, copy, {
    reviewButton,
    feedbackRef,
  });
  const direction = getTextDirection(locale);
  const { state, pending } = review;

  return (
    <section
      className={styles.detail}
      aria-labelledby="decision-detail-heading"
    >
      <DecisionSummary
        candidate={candidate}
        locale={locale}
        copy={copy}
        review={review}
      />

      <form
        action={review.formAction}
        className={styles.actionForm}
        onSubmit={review.prepareAction}
        autoComplete="off"
      >
        <DecisionFormFields
          candidate={candidate}
          copy={copy}
          direction={direction}
          review={review}
        />

        <DecisionFeedback
          copy={copy}
          review={review}
          refreshing={refreshing}
          reloadAction={reloadAction}
          feedbackRef={feedbackRef}
        />
        <DecisionReviewDialog
          candidate={candidate}
          locale={locale}
          copy={copy}
          review={review}
          refreshing={refreshing}
          reviewButtonRef={reviewButton}
          confirmButtonRef={confirmButton}
          feedbackRef={feedbackRef}
        />
        <div className={styles.recordActions}>
          <button
            ref={reviewButton}
            className={styles.primaryAction}
            type="button"
            onClick={review.openReview}
            disabled={
              !review.actionable ||
              review.blocked ||
              review.missingExpiry ||
              pending ||
              refreshing ||
              state.status !== "IDLE"
            }
          >
            {refreshing ? copy.checkingState : copy.reviewAction}
          </button>
          <p className={styles.auditNote}>{copy.auditNote}</p>
        </div>
      </form>
    </section>
  );
}
