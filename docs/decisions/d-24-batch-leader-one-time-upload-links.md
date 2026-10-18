# Decision D-24: Batch Leaders upload through one-time links, without accounts

**Status:** PROPOSED

**Owner:** Ahmed + Ziad (it revises how D-11's Batch Leader authority is granted)

**Reviewers:** Ziad. A later implementation task needs an independent security review of the link design.

**Decision deadline:** UNSCHEDULED — OWNER INPUT REQUIRED (Ziad's confirmation)

**Last reviewed:** 2026-10-18

**Blocks:** NONE yet. A future runbook task builds the link flow after approval. Until then, the current account-based Batch Leader screens stay as built and are not extended.

## Context

The PoC built Batch Leaders as signed-in accounts. A Batch Leader sees an assigned campaign, accepts the commitments and uploads sources for it. The [master plan](../plans/poc-master-plan.md#73-batch-leader-journey) already starts the journey with "an expiring invitation tied to one campaign and cohort", and D-11 limits the role to campaign-scoped submission and status.

On 18 October 2026, while reviewing the WP03 refinement's open items, Ahmed gave this direction:

- The Batch Leader flow stays separate from student accounts.
- A Batch Leader does not need an account.
- An admin sends a one-time link that lets the Batch Leader upload the data.

Two open items depended on the account model, and this direction answers both:

- **PJ-16:** a Batch Leader who is also a cohort student.
- **The WP03 D9 follow-up:** adding account checks to the database's campaign-assignment rule.

## Non-negotiable requirements

- **What the link grants:** submission and status for exactly one campaign and cohort (D-11). It grants nothing else: no publication, unlock, student chat, provider, cost control, cross-cohort access or admin capability.
- **Link safety:**
  - Single use or explicitly bounded, with expiry.
  - Unguessable, revocable by an admin, and stored only as a hash.
  - Never logged, never in analytics, and never placed where a referrer can carry it.
- **Rights:** the per-source rights declaration and the pre-upload rights gate (D-01) still apply to every file.
- **Upload pipeline:** uploads keep the current intake states and storage boundaries (received is not processed; raw lifecycle D-09).
- **Audit:** every link issue, use, expiry and revocation is audited with the admin who issued it.

## Options evaluated

| Option | Quality/fit | Security/rights | Reliability | Cost | Migration/lock-in | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| A. Keep Batch Leader accounts (current build) | Works; needs sign-up, verification and consent for an occasional task | Account gate in the app (WP03-T27); database rule checks assignment only | Proven in CI and production | Zero | None | WP03-T21, WP03-T27 |
| B. One-time upload links issued by an admin (proposed) | Matches how a class representative actually helps: one task, no account | Narrower surface if the link is scoped, hashed, expiring and revocable; needs a careful design | New flow to build and test | Zero expected; confirm before any paid email or storage feature | Account-based leader screens retire after B ships | Ahmed's direction, 18 Oct 2026 |

## Decision

Proposed: option B. A Batch Leader receives a one-time, expiring, revocable upload link for one campaign from an admin, and needs no UniMind account.

This becomes approved only when Ziad confirms it and the master-plan decision log changes to "Approved direction". The implementing task then defines link lifetime, single-use rules, delivery channel, revocation and the security review.

## Consequences

### Benefits

- No account, verification or consent step for a role that uploads a few times.
- PJ-16 and the D9 database-rule follow-up no longer apply once the account model is retired.

### Costs and risks

- A bearer link can be forwarded. Scope, expiry, single use, revocation and audit must contain that.
- The account-based Batch Leader screens and their tests become a migration to retire, not a dead end to keep growing.
