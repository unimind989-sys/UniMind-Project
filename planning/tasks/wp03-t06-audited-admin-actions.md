# Task record: WP03-T06 audited admin actions

**Task ID:** WP03-T06

**Status:** [~]

**Outcome:** A verified admin can perform the six scoped governance actions through typed, version-checked mutations and clear bilingual controls; each committed change has same-transaction audit evidence, and protected release or enablement remains closed until its exact prerequisites and two distinct founder confirmations hold.

**Owner:** Codex `/root`; Ahmed is the selected chat profile and human checkpoint

**Reviewer:** Ahmed; D-22 supplies standing Ahmed-and-Ziad authorization for this task's non-financial delivery, but does not itself prove two distinct in-product confirmations

**Branch:** `wp03/audited-admin-actions`

**Updated (UTC):** 2026-09-24T13:42:43Z

## Derived execution envelope

**Policy version:** 7

**Surfaces:** docs, frontend, runtime, auth, data, storage, delivery, tooling

**Risk:** R3

**Planning:** Protected

**Worker budget:** 0 used; maximum 1; nested workers prohibited. No agent delegation is planned.

**Capabilities:** data-integrity, frontend-quality-floor, release-safety, storage-safety, trust-boundaries

**Procedural skills:** Impeccable for the new admin surface; trust-boundaries for protected actions; writing-for-agents for this handoff record; finalize at terminal delivery

**Routing reason:** The new admin surface invokes protected, audited release, rights, raw-hold, and provider controls across authenticated server and database seams. The intent router included pre-existing unrelated edits in its path widening; exclude them from this task's staged diff.

## Manual model work blocks

| Block | Assigned model | Scope and governing inputs | Independent acceptance checks, including failure cases | Assignment reason | Status and evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Sol High | Resolve the action/state matrix, founder-confirmation identity boundary, open-decision gates, current schema/trigger behavior, and admin surface direction using runbook 6.4, master plan 7.2/8.2, D-04/D-05/D-18/D-19/D-22, `CONTEXT.md`, and `DESIGN.md`. Claim the task and leave a durable implementation contract. | Each of the six actions has allowed and rejected prior/next states, required authority, concurrency token, audit and replay behavior; the trust map identifies the public seam; no shared service login or D-22 delivery authorization is mistaken for two runtime approvals; provider and real-data enablement stay closed. | Cross-system trust and product interpretation need Sol judgment before coding. | Complete: action matrix and decision-queue direction below; no code or real enablement. |
| 2 | Luna Max | Implement one coherent migration/domain/application/adapter/server-action/UI slice from Block 1's frozen matrix and selected surface brief, using synthetic fixtures and deterministic mocks only. | Focused allowed/forbidden tests cover every action; two-admin races and stale versions reject; one founder or duplicate confirmations never complete protected transitions; rights/READY/decision gates reject; emergency containment is audited and reversible; no non-admin mutation, leaked private payload, or preview membership. English/Arabic desktop/mobile keyboard, focus, and failure states work. | Large coherent implementation is suitable for Luna once behavior, boundaries, and independent checks are fixed; routine failures have observable causes. | Ready for a fresh Luna Max chat. |
| 3 | Sol High | Review the actual protected diff and UI evidence, resolve findings, run proof preflight and required gates, deliver the exact candidate, verify affected production, close evidence, and clean the branch. | Focused tests and required broad gate pass on the final fingerprint; design acceptance is traceable if material; exact-head CI and branch protection pass; only affected production state is checked; task/runbook/evidence and clean `main` agree. | Protected release, final trust interpretation, and evidence judgment belong with Sol. | Pending Block 2. |

**Next model:** Luna Max in a fresh chat for Block 2.

**Current block:** 2

## Execution contract

**Dependencies:** WP02-T09 and WP03-T01 through WP03-T05 are complete with reviewed evidence; WP03-T05 production proof is `evidence/wp03-product-shell/2026-09-23_batch-leader-collection-release_production_63d8e6a.md`. D-04, D-05, D-18, and D-19 remain open for real provider, spend, storage, and retention choices.

**Inputs:** Runbook WP03-T06 and sections 6.4/6.6/6.7; master-plan admin journey, availability and audit rules; `CONTEXT.md`; `PRODUCT.md`; `DESIGN.md`; D-22; existing release/source/raw/feature-flag/job tables and audit triggers; synthetic fixtures.

**Files:** One forward `supabase/migrations/20260924134026_audited_admin_actions.sql` migration and `src/types/database.generated.ts`; `src/lib/admin/admin-actions.domain.ts`, `admin-actions.application.ts`, `admin-actions.supabase.server.ts`, `admin-readiness.application.ts`; authenticated `src/app/admin/page.tsx`, `src/app/admin/actions.ts`, `src/app/admin/_components/admin-decision-queue.tsx`, `src/app/admin/admin.module.css`, and `src/lib/i18n/admin-copy.ts`; focused unit/security/integration/E2E/SQL tests; `.impeccable/surfaces/src-app-admin-page-tsx.md`; this record, runbook marker, and sanitized WP03 evidence. Existing preview routes may be used for the no-membership test.

**Verify:** Focused domain/application/adapter and SQL/RLS tests for all six actions and races; `corepack pnpm check:sql`; `corepack pnpm test:security`; hosted disposable reset/upgrade proof for a migration; English/Arabic admin Playwright and bounded side-browser inspection; Impeccable detector/audit; actual-diff routing and proof preflight; `corepack pnpm verify`; `git diff --check`, `git diff --stat`, full diff and changed-file secret/scope review; exact-head required CI and affected production proof.

**Pass:** Typed server mutations recompute verified actor and current target scope, require a reason/correlation ID/expected version, reject stale or unauthorized calls, and write governed state plus append-only audit atomically. Publication/unlock shows failed readiness predicates and rejects zero active READY sources. Protected activation/rights/release/hold-removal/re-enable paths require distinct verified founder confirmations bound to the exact target/version, with open decisions and nonzero spend blocked. Emergency hide/lock/deactivate/quarantine/disable actions are prompt, audited, and reversible by a later authorized transition. Preview never creates student membership.

**Evidence:** Candidate and protected release bundles under `evidence/wp03-product-shell/`, bound to the reviewed commit and deployment.

**Rollback:** Disable the admin mutation seam and use the last-known-good web deployment; preserve audit/state history and repair database changes through a reviewed forward migration. Emergency containment remains available.

**Hard stop:** No real/private source, real storage/provider enablement, nonzero spending-cap increase or re-enablement, billable resource, or paid call without fresh exact Ahmed-and-Ziad financial confirmation; no real raw deletion or real-data hold policy while D-19 is open; no synthetic or shared service identity treated as two distinct founder approvals; no weakening RLS, audit, readiness, or branch protection; preserve pre-existing unrelated edits.

## Action and state contract

Every request carries `action`, exact target ID, `expected_version`, bounded reason, correlation ID, and an idempotency key. The server derives the actor from verified Auth claims. PostgreSQL locks the target and compares the current version before any write; the committed transition increments its governance version and appends an audit event in the same transaction. An exact replay returns the first result; the same key with changed input fails. A pending protected confirmation binds action, target, expected version, initiating founder principal, reason, and expiry. Any target or prerequisite change invalidates it. An existing shared provider login is not a founder principal.

| Action | Allowed transition and readiness | Containment or rejected path | Protected completion |
| --- | --- | --- | --- |
| Publish/hide curriculum unit | `DRAFT` or `WITHDRAWN` to `PUBLISHED` only with an active READY source version whose rights are currently valid and whose edition matches the cohort; `PUBLISHED` to `WITHDRAWN` hides promptly. | Reject publication with exact failed source/rights/edition/cohort predicate; hide remains available even when readiness fails. No membership row is created. | Publish requires distinct Ahmed and Ziad confirmations; hide is immediate audited containment. |
| Unlock/lock cohort | `LOCKED` to `UNLOCKED` only when the active cohort has at least one publishable unit with an active READY, rights-valid, edition-matching source; `UNLOCKED` to `LOCKED` contains promptly. | Reject unlock with exact failed predicate, including zero READY sources. Preview cannot silently unlock or create membership. | Unlock requires distinct Ahmed and Ziad confirmations; lock is immediate audited containment. |
| Activate/deactivate source version | `INACTIVE`/`DEACTIVATED` to `ACTIVE` only for accepted READY content with currently valid rights and matching edition; `ACTIVE` to `DEACTIVATED` removes it from derived availability promptly. | Reject invalid/revoked/expired rights, wrong edition, unaccepted content, or stale version. Deactivation preserves processed history. | Activation is protected rights/release work; deactivation is immediate audited containment. |
| Quarantine/retry failed source | Quarantine a `FAILED` or `NEEDS_REVIEW` version into an explicit `QUARANTINED` state, deactivate it, and preserve provenance; retry from `FAILED` or `QUARANTINED` creates one durable idempotent retry request. The source remains failed/quarantined until the deterministic worker actually accepts work and moves it to processing. | Reject retry while rights are blocked, a prior request is active, or a real worker/provider is unavailable; never start a paid provider call, report processing before acceptance, or overwrite the original source. | Quarantine is immediate audited containment; retry needs the applicable owner review and remains mock-only while provider/worker decisions are open. |
| Place/remove raw-data hold | On the synthetic profile, place a documented hold on a stored raw object with reason, expiry, and review metadata; remove only after a fresh retention/deletion safety check. | Reject missing owner/review/expiry, absent object, stale state, uncertain processed durability, or any real-data use while D-19 is open. No action directly deletes bytes. | Placement is audited preservation; removal is a protected raw-deletion boundary with distinct confirmations. |
| Enable/disable provider or artifact type | Set a typed flag false immediately; enable only an approved zero-cost mock artifact with valid environment and dependency evidence. | Real-provider enablement, paid work, nonzero cap change, and unapproved artifact/provider configuration remain unavailable while D-04/D-05/D-18 and financial gates are open. | Disable is immediate audited containment; re-enable requires distinct confirmations and the decision/budget gate. |

Existing schema conflict to resolve in the forward migration: `source_versions_ready_gate_check` currently requires a READY source to be ACTIVE with VALID rights. That prevents the required deactivation or rights revocation while preserving processed READY history. Separate processing readiness from current activation/rights; keep derived availability and retrieval predicates requiring all three. Update the corresponding SQL tests so READY alone never grants student access.

Runtime founder identity contract: model Ahmed and Ziad as two separately provisioned verified application principals, each bound to one immutable founder slot. A role or caller-supplied name does not establish the slot. Do not seed production principal IDs or infer them from GitHub/Supabase provider-account usage. Until distinct principals are provisioned and verified, protected transitions stay pending or denied. D-22 remains the repository delivery authorization, not an in-product second click.

## Admin surface direction

Ahmed selected **decision queue first** on 2026-09-24 in this task conversation. The new admin landing view leads with decisions needing action, each showing exact target scope, current and proposed state, failed readiness predicates, and pending founder confirmation. Resource navigation for catalog, cohorts, sources, jobs, quality, usage, and incidents remains available. Inherit the approved Study Shelf visual system in `DESIGN.md`; use the Operate mode, explicit text-plus-shape status cues, and one bilingual component tree. The choice fixes information priority, while the rendered material candidate still needs the normal founder acceptance receipt before stable proof.

## Trust map

1. **Authority:** Verified Supabase caller, current admin/founder role and target scope in PostgreSQL, approved decision state, and current committed row version. Provider-account identity and browser-selected founder name are insufficient.
2. **Untrusted inputs:** Route/target IDs, requested action, prior state/version, reason, correlation ID, selected founder label, preview flag, readiness display, client retry, and every browser status.
3. **Recomputation:** Server action obtains the verified caller and invokes a transaction-scoped database command that rechecks role, target scope, exact prior version, rights/readiness/decision gates, and distinct founder principal before state and audit commit.
4. **Allowed path:** A verified admin submits an eligible synthetic-target action with a current version and reason; where protected, a second distinct verified founder confirms the same exact candidate; one atomic transition and audit event result.
5. **Forbidden path:** Non-admin, forged target/founder, stale version, changed rights/readiness, one-founder-only, duplicate or conflicting replay, and open provider/budget/real-data decision paths create no protected transition.
6. **Stale/replay behavior:** Recompute before commit; bind pending confirmations to target, action, and version; invalidate on target/decision change or expiry; exact retry is idempotent, while conflicting retry fails. Disable/lock takes effect promptly on the next server operation.
7. **Exposure:** Browser sees scoped labels, safe statuses, exact failed predicate names, and correlation ID only; it receives no privileged key, raw object key/bytes, private source text, provider payload, worker diagnostics, or another user's state. Audit/logs contain bounded metadata without private content.

## Candidate preparation

**Design disposition:** MATERIAL — decision-queue direction selected; rendered candidate and founder receipt remain pending before candidate proof.

**Design evidence:** PENDING

**Preparation review:** PENDING

**Preparation fingerprint:** NOT_READY

**Unresolved findings:** Rendered material admin candidate and founder acceptance receipt remain pending; Block 2 must implement the fixed trust contract and cannot weaken it.

**Established facts:** NONE

## Steps

- [x] Claim WP03-T06, establish the action/trust/design contract, and hand off a bounded implementation block.
- [ ] Implement the six action paths with transaction-bound authorization, concurrency, confirmation, and audit.
- [ ] Build the bilingual admin controls and prove safe loading, stale, pending, success, error, and containment states.
- [ ] Review the candidate, complete proof and design acceptance, deliver, verify affected production, and close.

## Handoff

**Changed:** Created this controlled task record and the admin surface brief, marked WP03-T06 in progress, recorded Ahmed's decision-queue choice, and fixed six action contracts plus the founder trust boundary; no product behavior has changed.

**Commands:** `scripts/show-work-state.ps1` selected WP03-T06; intent routing under policy v7 returned R3/protected and the listed surfaces; `scripts/verify-agent-readiness.ps1` passed after correcting the record's fact format; targeted Prettier check passed; `git diff --cached --check` passed; full staged diff and scope review completed; repository secret scan passed for 1178 files. Implementation checks NOT RUN.

**Remaining:** Blocks 2 and 3: implement the contract, prove allowed/forbidden paths and UI behavior, obtain material founder receipt, review/deliver/close.

**Next safe action:** Open a fresh GPT-6 Luna Max chat on this branch, read this record, and implement Block 2 with the fixed action matrix and synthetic fixtures.

**Reviewer action:** Decision-queue composition was selected by Ahmed; material rendered candidate still needs traceable acceptance after technical proof.
