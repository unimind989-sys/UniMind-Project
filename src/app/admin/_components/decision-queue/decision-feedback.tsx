import type { RefObject } from "react";

import { Notice } from "@/app/_components/notice";
import { Button } from "@/app/_components/product-ui";
import type { Locale } from "@/lib/i18n/locale";
import styles from "../../admin.module.css";
import type { AdminCopy } from "./candidate-presentation";
import type { DecisionReview } from "./use-decision-review";

/**
 * Result and stale-state messaging after a submit. Any non-idle result offers
 * a queue reload because the candidate's version is no longer trustworthy.
 */
export function DecisionFeedback({
  locale,
  copy,
  review,
  refreshing,
  reloadAction,
  feedbackRef,
}: Readonly<{
  locale: Locale;
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
        <Notice
          ref={feedbackRef}
          tabIndex={-1}
          locale={locale}
          live
          tone={state.status === "ERROR" ? "error" : "success"}
        >
          {feedback}
        </Notice>
      )}
      {blocked && !completed && (
        <Notice tone="error" locale={locale}>
          {copy.blocked}
        </Notice>
      )}
      {changedAfterReview && (
        <Notice tone="error" live locale={locale}>
          {copy.reviewChanged}
        </Notice>
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
