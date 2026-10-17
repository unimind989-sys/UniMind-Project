import type { RefObject } from "react";

import { ProductDialog } from "@/app/_components/product-dialog";
import type { AdminActionCandidate } from "@/lib/admin/admin-actions.application";
import type { Locale } from "@/lib/i18n/locale";

import styles from "../../admin.module.css";
import {
  candidateLabel,
  formatExpectedVersion,
  stateLabel,
  type AdminCopy,
} from "./candidate-presentation";
import type { DecisionReview } from "./use-decision-review";

/**
 * The confirmation step. Its submit button belongs to the surrounding form, so
 * the review must render inside that form. Closing returns focus to the review
 * button, or to the feedback message once a result exists.
 */
export function DecisionReviewDialog({
  candidate,
  locale,
  copy,
  review,
  refreshing,
  reviewButtonRef,
  confirmButtonRef,
  feedbackRef,
}: Readonly<{
  candidate: AdminActionCandidate;
  locale: Locale;
  copy: AdminCopy;
  review: DecisionReview;
  refreshing: boolean;
  reviewButtonRef: RefObject<HTMLButtonElement | null>;
  confirmButtonRef: RefObject<HTMLButtonElement | null>;
  feedbackRef: RefObject<HTMLParagraphElement | null>;
}>) {
  const { state, pending, secondConfirmation } = review;

  return (
    <ProductDialog
      open={review.reviewOpen && state.status === "IDLE"}
      title={copy.reviewHeading}
      closeLabel={copy.cancelReview}
      onClose={review.closeReview}
      onAfterClose={() => {
        review.setReviewOpen(false);
        (state.status === "IDLE"
          ? reviewButtonRef
          : feedbackRef
        ).current?.focus({ preventScroll: true });
      }}
      dismissible={!pending}
    >
      <section className={styles.reviewPanel} aria-label={copy.reviewHeading}>
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
            <dd>{review.reviewReason}</dd>
          </div>
          <div>
            <dt>{copy.expectedVersion}</dt>
            <dd>{formatExpectedVersion(candidate.expectedVersion, locale)}</dd>
          </div>
          {review.reviewExpiry !== "" && (
            <div>
              <dt>{copy.holdExpiry}</dt>
              <dd>{review.reviewExpiry}</dd>
            </div>
          )}
        </dl>
        <p>{copy.ready}</p>
        {candidate.protected && <p>{copy.separateFounderNotice}</p>}
      </section>
      <div className={styles.reviewActions}>
        <button
          ref={confirmButtonRef}
          className={styles.primaryAction}
          type="submit"
          disabled={
            !review.actionable ||
            review.blocked ||
            review.missingExpiry ||
            review.changedAfterReview ||
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
  );
}
