import type { AdminActionCandidate } from "@/lib/admin/admin-actions.application";
import type { TextDirection } from "@/lib/i18n/locale";

import styles from "../../admin.module.css";
import { localExpiryValue, type AdminCopy } from "./candidate-presentation";
import type { DecisionReview } from "./use-decision-review";

/**
 * The bound command fields plus the reason and raw-hold inputs. Editing any
 * input closes the review and clears the request keys it was bound to.
 */
export function DecisionFormFields({
  candidate,
  copy,
  direction,
  review,
}: Readonly<{
  candidate: AdminActionCandidate;
  copy: AdminCopy;
  direction: TextDirection;
  review: DecisionReview;
}>) {
  const {
    secondConfirmation,
    ownerReviewPending,
    boundExpiry,
    resetRequestKey,
  } = review;

  return (
    <>
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
      <input type="hidden" name="correlationId" value={review.correlationId} />
      <input
        type="hidden"
        name="idempotencyKey"
        value={review.idempotencyKey}
      />
      <label className={styles.field}>
        <span className={styles.fieldLabel}>
          {copy.reason}
          {secondConfirmation || ownerReviewPending ? null : (
            <span className={styles.requiredTag}>{copy.required}</span>
          )}
        </span>
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
            value={review.reasonDraft}
            onChange={(event) => {
              review.setReasonDraft(event.currentTarget.value);
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
            <span className={styles.fieldLabel}>{copy.holdExpiry}</span>
            <input
              type="datetime-local"
              name="holdExpiresAtLocal"
              required
              autoComplete="off"
              value={
                boundExpiry ? localExpiryValue(boundExpiry) : review.expiryDraft
              }
              readOnly={secondConfirmation}
              onChange={(event) => {
                review.setExpiryDraft(event.currentTarget.value);
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
              checked={review.reviewAttested}
              onChange={(event) => {
                review.setReviewAttested(event.currentTarget.checked);
                resetRequestKey(event);
              }}
            />
            <span>{copy.holdReview}</span>
          </label>
          <input type="hidden" name="holdExpiresAt" defaultValue="" />
        </>
      )}
    </>
  );
}
