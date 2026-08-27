# Decision D-19: Retention periods and deletion deadlines

**Status:** OPEN

**Owner:** Security/data owner UNASSIGNED

**Reviewers:** Ahmed + Ziad — protected raw-deletion gate; one founder must also be explicitly named for the security/data review role

**Decision deadline:** UNSCHEDULED — OWNER INPUT REQUIRED

**Last reviewed:** NOT RECORDED

**Blocks:** WP04-T09 (real data), WP06-T07 (real data), WP11-T01

## Context

D-09 approves temporary raw storage and verified deletion after complete durable processed output, but no owner has approved exact real-data periods, hold authority, or escalation deadlines. Deterministic synthetic-test values exist only to let agents implement and verify the state machine safely.

## Non-negotiable requirements

- Every duration has a number, unit, and starting event.
- Successful deletion begins as soon as the processed representation passes; a deadline is never a waiting period.
- Raw bytes are never deleted before verified processed acceptance unless a terminal failed-conversion policy explicitly requires deletion.
- A hold is an auditable governance action with authority, reason, review, and expiry; it is not an editable timestamp shortcut.
- Uncertain provider absence remains a deletion failure and blocks release/READY claims.

## Options evaluated

| Option | Quality/fit | Security/rights | Reliability | Cost | Migration/lock-in | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Owner-approved real profile distinct from the synthetic test profile | Separates test speed from real obligations | Strong; prevents mock values becoming policy | Deterministic configuration seam | Unknown until provider/storage decisions | Low | `planning/raw-data-policy-review.md` |
| Reuse synthetic durations for real data | NOT EVALUATED | Unapproved and unsafe | Risks accidental deletion/retention violations | Unknown | Low | Rejected pending owner review |
| Indefinite raw retention | Preserves replay bytes | Conflicts with D-09 and minimizes neither rights nor breach impact | Simple but policy-noncompliant | Higher storage exposure | High | Rejected by approved direction |

## Decision

OPEN — the real-data profile, security/data owner, reviewers, deadlines, hold authority, and incident recipients have not been supplied. Only the explicit `SYNTHETIC_TEST` profile in the lifecycle draft may be used.

## Consequences

### Benefits

- Agents can implement the interfaces and failure tests without inventing production policy.

### Costs and risks

- Real source upload, real deletion execution, and beta release remain blocked.

## Implementation contract

- Configuration keys: named lifecycle profile with durations and starting events; production startup rejects the synthetic profile.
- Adapter/interface: injectable clock, retention calculator, hold authority, deletion verifier, incident sink, and provider-specific absence semantics.
- Affected migrations/files: WP04-T08/T09/T12, WP06-T07, and release validation.
- Tests/evaluation required: deadline boundaries, hold placement/removal, failed conversion, uncertain absence, overdue incident, takedown, replay, and production-profile rejection.
- Observability required: calculated deadline, profile, attempts, last absence result, hold state, overdue age, and incident correlation ID without private content.
- Rollback/disable action: disable real upload/provider/storage paths and continue with synthetic fixtures.

## Revisit triggers

- Security/data owner assignment, legal/rights requirements, storage-provider selection, backup behavior, incident-channel selection, or source-right changes.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
|  |  |  |  |
