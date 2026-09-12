# Decision D-08: Chat retention and misuse review

**Status:** PROPOSED

**Owner:** Ahmed + Ziad

**Reviewers:** Ahmed + Ziad — one founder must be explicitly named as security/data owner before approval

**Decision deadline:** UNSCHEDULED — OWNER INPUT REQUIRED

**Last reviewed:** 2026-09-10

**Blocks:** WP11-T01

## Context

Students need useful chat history and direct deletion controls. By default, saved chat content is available to Ahmed and Ziad for administration and review. A student may enable a private/no-sharing option; in that mode, founders may review only the specific exchange triggered by a student report, explicit consent, or an approved automated misuse-policy flag. Chat-content retention is separate from minimal append-only usage, security, and billing metadata.

## Non-negotiable requirements

- Saved chats are founder-visible by default, and the product explains this clearly before the first saved chat.
- A student can enable a private/no-sharing mode for future exchanges. The setting's effective time is recorded so earlier and later messages cannot be confused.
- A student can list, read, and delete their saved sessions; deleting content does not alter append-only usage or billing facts.
- `NO_SAVE` content expires after the approved short technical window.
- In private/no-sharing mode, a reviewable exchange may be created only by a student report, explicit student consent, or an automated match against approved, versioned misuse categories and thresholds.
- Founder access to private/no-sharing content is reason-bound, limited to the qualifying exchange, time-limited, least-privilege, and audited. Browsing other private exchanges is forbidden.
- The student-facing setting explains that reports, explicit consent, and qualifying automated safety flags are exceptions to private/no-sharing mode.
- Automated detection retains the minimum content or derived signal needed for triage and cannot silently create indefinite chat retention.
- Exact ordinary, review, metadata, and exception periods must be numeric and synchronized with D-19 before real student data is enabled.

## Options evaluated

| Option | Quality/fit | Security/rights | Reliability | Cost | Migration/lock-in | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Founder-visible saved chats by default, with no student privacy control | Simple manual oversight | Does not provide the requested no-sharing choice | Depends on manual review | High operational burden | High policy risk | Rejected by Ahmed on 2026-09-10 |
| Private chats by default | Strong privacy | Narrow access | Does not match the approved founder-review default | Low | Low | Rejected by Ahmed on 2026-09-10 |
| Founder-visible default plus student private/no-sharing mode with bounded exceptions | Supports ordinary admin review, student choice, and misuse detection | Requires clear disclosure, enforcement, expiry, and audit | Automatable and testable | Moderate | Low with versioned policy | Ahmed direction recorded 2026-09-10 |

## Decision

PROPOSED — saved chat content is available to Ahmed and Ziad by default. Students can enable a private/no-sharing mode for future exchanges. While that mode is active, only the exchange needed to evaluate a student report, explicit consent, or qualifying automated misuse-policy flag becomes reviewable by Ahmed or Ziad, and every access to private/no-sharing content is audited.

The exact retention durations, approved misuse categories, detection thresholds, appeal/false-positive behavior, and named security/data owner remain open. Real student chat content remains disabled until those values and D-19 are approved.

## Consequences

### Benefits

- Founders can review default saved chats and investigate product or misuse concerns.
- Students can choose private/no-sharing mode while UniMind retains bounded safety exceptions.
- Student deletion and future billing/accounting remain separate concerns.

### Costs and risks

- Automated flags can be wrong; the design needs versioned thresholds, false-positive tests, expiry, and a review outcome.
- Default founder visibility creates privacy and trust exposure, so the product needs prominent disclosure, access authorization, audit, and a dependable private/no-sharing control.

## Implementation contract

- Configuration keys: default sharing mode, retention profile, misuse-policy version, category enablement, thresholds, review expiry, and real-data enablement.
- Adapter/interface: time-effective sharing preference, retention scheduler, student deletion, policy classifier, review-case snapshot, founder review authorization, and audit sink.
- Affected migrations/files: WP06-T03 and WP06-T07 chat/reporting records, D-19 retention policy, admin review surfaces, and beta release validation.
- Tests/evaluation required: default founder visibility, private-mode denial, setting-transition boundaries, report/consent/flag exceptions, false positives, expiry, student deletion, consent withdrawal, founder-access audit, and metadata/content separation.
- Observability required: non-content policy category, policy version, trigger, review state, expiry, reviewer identity, and access event; ordinary chat text stays out of logs.
- Rollback/disable action: disable automated flagging and founder review while preserving student deletion and minimal non-content accounting records.

## Revisit triggers

- Material false positives or missed misuse, unauthorized access, a retention breach, a policy-category change, or a change in student expectations.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Ahmed | Product owner | Proposed founder-visible chat by default with a student private/no-sharing option and bounded audited exceptions | 2026-09-10 |
