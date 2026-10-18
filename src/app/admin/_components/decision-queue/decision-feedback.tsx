import type { RefObject } from "react";

import { Button } from "@/app/_components/product-ui";
import styles from "../../admin.module.css";
import type { AdminCopy } from "./candidate-presentation";
import type { DecisionReview } from "./use-decision-review";

/**
 * Result and stale-state messaging after a submit. Any non-idle result offers
 * a queue reload because the candidate's version is no longer trustworthy.
 */
export function DecisionFeedback({
  copy,
  review,
  refreshing,
  reloadAction,
  feedbackRef,
}: Readonly<{
  copy: AdminCopy;
  review: DecisionReview;
  refreshing: boolean;
  reloadAction?: (() => void | Promise<void>) | undefined;
  feedbackRef: RefObject<HTMLParagraphElement | null>;
}>) {
  const { state, feedback, blocked, completed, changedAfterReview } = review;

  return (
    <>
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
        <Button
          className={styles.alignStart}
          size="large"
          pending={refreshing}
          onClick={reloadAction ?? (() => window.location.reload())}
        >
          {refreshing ? copy.checkingState : copy.reloadQueue}
        </Button>
      )}
    </>
  );
}
