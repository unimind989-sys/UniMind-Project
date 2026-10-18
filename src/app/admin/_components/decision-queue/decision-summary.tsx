import type { Route } from "next";

import { FrontendIcon } from "@/app/_components/frontend-controls";
import { ProductNavigationLink } from "@/app/_components/product-navigation";
import { StateIcon, StatePill } from "@/app/_components/state-pill";
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
  candidateTone,
  formatExpectedVersion,
  stateLabel,
  type AdminCopy,
} from "./candidate-presentation";
import type { DecisionReview } from "./use-decision-review";

/**
 * Read-only facts about the selected decision, shown above its form: verb and
 * target, current → proposed state, consequence and readiness checks.
 */
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
  const { completed, secondConfirmation, missingExpiry } = review;

  return (
    <>
      <div className={styles.detailHeading}>
        <h2 id="decision-detail-heading" tabIndex={-1}>
          <span className={styles.detailVerb}>
            {copy.verbs[candidate.action]}
          </span>{" "}
          <bdi>{candidateLabel(candidate, locale)}</bdi>
        </h2>
        <div className={styles.detailMeta}>
          <StatePill tone={candidateTone(candidate)}>
            {candidateState(candidate, locale)}
          </StatePill>
          <span>{copy.actions[candidate.action]}</span>
          <span>{copy.targetKinds[adminTargetKind(candidate.action)]}</span>
          {candidate.protected ? (
            <span className={styles.protectedNote}>
              <FrontendIcon name="shield" size={16} />
              {copy.protectedNote}
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.statePair}>
        <dl className={styles.stateCurrent}>
          <dt>{copy.currentState}</dt>
          <dd dir="auto">{stateLabel(candidate.currentState, locale)}</dd>
        </dl>
        <span className={styles.stateArrow} aria-hidden="true">
          <FrontendIcon name="arrow" size={24} />
        </span>
        <dl className={styles.stateProposed}>
          <dt>{copy.proposedState}</dt>
          <dd dir="auto">{stateLabel(candidate.proposedState, locale)}</dd>
        </dl>
      </div>

      <p className={styles.consequence}>
        {copy.consequences[candidate.action]}
      </p>

      <div className={styles.readiness}>
        <h3>{copy.readiness}</h3>
        {completed ? (
          <p>{copy.alreadyInStateBody}</p>
        ) : candidate.failedPredicates.length === 0 ? (
          <ul className={styles.checks}>
            <li data-tone="ok">
              <StateIcon tone="ok" />
              {copy.ready}
            </li>
          </ul>
        ) : (
          <ul className={styles.checks}>
            {candidate.failedPredicates.map((predicate) => (
              <li key={predicate} data-tone="bad">
                <StateIcon tone="bad" />
                {predicateLabels[predicate] ?? predicate}
              </li>
            ))}
          </ul>
        )}
      </div>

      {secondConfirmation && (
        <div className={styles.pendingNote}>
          <p role="status">
            {copy.pendingFounder}
            {candidate.initiatorSlot
              ? `. ${copy.initiatedBy}: ${candidate.initiatorSlot === "AHMED" ? copy.founderAhmed : copy.founderZiad}`
              : ""}
          </p>
          <ProductNavigationLink
            href={adminDecisionHref(candidate, locale) as Route}
          >
            {copy.pendingLink}
          </ProductNavigationLink>
        </div>
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

      <details className={styles.targetDetails}>
        <summary>{copy.targetId}</summary>
        <dl>
          <div>
            <dt>{copy.targetId}</dt>
            <dd>
              <code dir="ltr">{candidate.targetId}</code>
            </dd>
          </div>
          <div>
            <dt>{copy.expectedVersion}</dt>
            <dd>{formatExpectedVersion(candidate.expectedVersion, locale)}</dd>
          </div>
        </dl>
      </details>
    </>
  );
}
