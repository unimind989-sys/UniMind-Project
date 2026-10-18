import { useSyncExternalStore } from "react";

import { Field } from "@/app/_components/field";
import { StateIcon } from "@/app/_components/state-pill";
import type { AdminActionCandidate } from "@/lib/admin/admin-actions.application";
import type { TextDirection } from "@/lib/i18n/locale";

import styles from "../../admin.module.css";
import { localExpiryValue, type AdminCopy } from "./candidate-presentation";
import type { DecisionReview } from "./use-decision-review";

const noSubscription = () => () => {};
const deviceTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const serverTimeZone = () => "";

/**
 * The bound command fields plus the reason and raw-hold inputs. Editing any
 * input closes the review and clears the request keys it was bound to.
 * Review checks the inputs and shows localized errors beside them (IX-27).
 */
export function DecisionFormFields({
  candidate,
  copy,
  direction,
  review,
  referenceTime,
}: Readonly<{
  candidate: AdminActionCandidate;
  copy: AdminCopy;
  direction: TextDirection;
  review: DecisionReview;
  /** The demo's fixed clock; real pages use the device clock. */
  referenceTime?: string | undefined;
}>) {
  const {
    secondConfirmation,
    ownerReviewPending,
    boundExpiry,
    resetRequestKey,
    errors,
    clearError,
  } = review;
  // The device zone is only known in the browser; the server renders none.
  const timeZone = useSyncExternalStore(
    noSubscription,
    deviceTimeZone,
    serverTimeZone,
  );
  const readOnlyReason = secondConfirmation || ownerReviewPending;

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
      <Field
        id="decision-reason"
        label={
          <span className={styles.fieldLabel}>
            {copy.reason}
            {readOnlyReason ? null : (
              // `required` already says so to assistive technology.
              <span className={styles.requiredTag} aria-hidden="true">
                {copy.required}
              </span>
            )}
          </span>
        }
        hint={copy.reasonHint}
        error={errors.reason ? copy.reasonError : undefined}
      >
        {(control) =>
          readOnlyReason ? (
            <textarea
              {...control}
              name="reason"
              value={candidate.reason ?? ""}
              readOnly
              rows={3}
              dir={direction}
            />
          ) : (
            <textarea
              {...control}
              name="reason"
              required
              minLength={8}
              maxLength={500}
              placeholder={copy.reasonPlaceholder}
              autoComplete="off"
              value={review.reasonDraft}
              onChange={(event) => {
                review.setReasonDraft(event.currentTarget.value);
                clearError("reason");
                resetRequestKey(event);
              }}
              rows={3}
              dir={direction}
            />
          )
        }
      </Field>

      {candidate.action === "PLACE_RAW_HOLD" && (
        <>
          <Field
            id="decision-hold-expiry"
            label={<span className={styles.fieldLabel}>{copy.holdExpiry}</span>}
            hint={
              timeZone ? (
                <>
                  {copy.expiryZone} <bdi dir="ltr">{timeZone}</bdi>
                </>
              ) : undefined
            }
            error={
              errors.expiry === "required"
                ? copy.expiryRequired
                : errors.expiry === "past"
                  ? copy.expiryPast
                  : undefined
            }
          >
            {(control) => (
              <input
                {...control}
                type="datetime-local"
                name="holdExpiresAtLocal"
                required
                autoComplete="off"
                // The picker starts at the review clock; a time before it is
                // refused on Review (the database also refuses it).
                min={
                  referenceTime ? localExpiryValue(referenceTime) : undefined
                }
                value={
                  boundExpiry
                    ? localExpiryValue(boundExpiry)
                    : review.expiryDraft
                }
                readOnly={secondConfirmation}
                onFocus={(event) => {
                  if (!referenceTime && !secondConfirmation)
                    event.currentTarget.min = localExpiryValue(
                      new Date().toISOString(),
                    );
                }}
                onChange={(event) => {
                  review.setExpiryDraft(event.currentTarget.value);
                  clearError("expiry");
                  resetRequestKey(event);
                }}
              />
            )}
          </Field>
          <div>
            <label className={styles.reviewAttestation}>
              <input
                type="checkbox"
                name="reviewAttested"
                value="true"
                required
                checked={review.reviewAttested}
                aria-invalid={errors.attestation || undefined}
                aria-describedby={
                  errors.attestation ? "decision-attestation-error" : undefined
                }
                onChange={(event) => {
                  review.setReviewAttested(event.currentTarget.checked);
                  clearError("attestation");
                  resetRequestKey(event);
                }}
              />
              <span>{copy.holdReview}</span>
            </label>
            {errors.attestation ? (
              <p id="decision-attestation-error" className={styles.fieldError}>
                <StateIcon tone="bad" />
                <span>{copy.attestationRequired}</span>
              </p>
            ) : null}
          </div>
          <input type="hidden" name="holdExpiresAt" defaultValue="" />
        </>
      )}
    </>
  );
}
