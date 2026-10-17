import type { Route } from "next";

import { ProductNavigationLink } from "@/app/_components/product-navigation";
import type { AdminActionCandidate } from "@/lib/admin/admin-actions.application";
import {
  adminDecisionHref,
  adminTargetKind,
} from "@/lib/admin/admin-presentation.application";
import type { Locale } from "@/lib/i18n/locale";

import styles from "../../admin.module.css";
import {
  candidateLabel,
  candidateState,
  formatExpectedVersion,
  stateLabel,
  type AdminCopy,
} from "./candidate-presentation";
import type { DecisionReview } from "./use-decision-review";

/** Read-only facts about the selected decision, shown above its form. */
export function DecisionSummary({
  candidate,
  locale,
  copy,
  review,
}: Readonly<{
  candidate: AdminActionCandidate;
  locale: Locale;
  copy: AdminCopy;
  review: DecisionReview;
}>) {
  const predicateLabels = copy.predicates as Readonly<Record<string, string>>;
  const { completed, blocked, secondConfirmation, missingExpiry } = review;

  return (
    <>
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
          <dd>{formatExpectedVersion(candidate.expectedVersion, locale)}</dd>
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
    </>
  );
}
