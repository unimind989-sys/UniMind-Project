# Task record: WP03-T06 audited admin actions

**Task ID:** WP03-T06

**Status:** [~]

**Outcome:** A verified admin can perform the six scoped governance actions through typed, version-checked mutations and clear bilingual controls; each committed change has same-transaction audit evidence, and protected release or enablement remains closed until its exact prerequisites and two distinct founder confirmations hold.

**Owner:** Codex `/root`; Ahmed is the selected chat profile and human checkpoint

**Reviewer:** Ahmed; D-22 supplies standing Ahmed-and-Ziad authorization for this task's non-financial delivery, but does not itself prove two distinct in-product confirmations

**Branch:** `wp03/audited-admin-actions`

**Updated (UTC):** 2026-09-24T16:55:20Z

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
| 2 | Luna Max (planned); current Codex thread by Ahmed's explicit continuation request | Implement one coherent migration/domain/application/adapter/server-action/UI slice from Block 1's frozen matrix and selected surface brief, using synthetic fixtures and deterministic mocks only. | Focused allowed/forbidden tests cover every action; two-admin races and stale versions reject; one founder or duplicate confirmations never complete protected transitions; rights/READY/decision gates reject; emergency containment is audited and reversible; no non-admin mutation, leaked private payload, or preview membership. English/Arabic desktop/mobile keyboard, focus, and failure states work. | Large coherent implementation is suitable for Luna once behavior, boundaries, and independent checks are fixed; routine failures have observable causes. | Implementation and focused checks delivered here. 50 unit tests, 5 security tests, fresh/current typecheck, targeted ESLint, SQL convention audit, agent-readiness, repository secret scan, formatting, and final Impeccable detector pass. Added a 68-assertion synthetic pgTAP suite, but the guarded disposable database runner only permits GitHub-hosted Linux, so that suite has not run here. Bilingual/mobile/keyboard browser proof and the material founder receipt remain for Block 3. |
| 3 | Sol High | Review the actual protected diff and UI evidence, resolve findings, run proof preflight and required gates, deliver the exact candidate, verify affected production, close evidence, and clean the branch. | Focused tests and required broad gate pass on the final fingerprint; design acceptance is traceable if material; exact-head CI and branch protection pass; only affected production state is checked; task/runbook/evidence and clean `main` agree. | Protected release, final trust interpretation, and evidence judgment belong with Sol. | Active: selected-diff review resolved queue RPC shape, protected prerequisite drift, review/focus, unavailable-outcome wording, and boundary findings. Focused local and bilingual synthetic browser proof pass. Material founder receipt, guarded hosted pgTAP, proof preflight, broad verification, CI, and production proof remain pending. |

**Next model:** Continue Block 3 in this task after the founder receipt.

**Current block:** 3

## Execution contract

**Dependencies:** WP02-T09 and WP03-T01 through WP03-T05 are complete with reviewed evidence; WP03-T05 production proof is `evidence/wp03-product-shell/2026-09-23_batch-leader-collection-release_production_63d8e6a.md`. D-04, D-05, D-18, and D-19 remain open for real provider, spend, storage, and retention choices.

**Inputs:** Runbook WP03-T06 and sections 6.4/6.6/6.7; master-plan admin journey, availability and audit rules; `CONTEXT.md`; `PRODUCT.md`; `DESIGN.md`; D-22; existing release/source/raw/feature-flag/job tables and audit triggers; synthetic fixtures.

**Files:** One forward `supabase/migrations/20260924134026_audited_admin_actions.sql` migration and `src/types/database.generated.ts`; `src/lib/admin/admin-actions.domain.ts`, `admin-actions.application.ts`, `admin-actions.supabase.server.ts`, `admin-readiness.application.ts`; authenticated `src/app/admin/page.tsx`, `src/app/admin/actions.ts`, `src/app/admin/_components/admin-decision-queue.tsx`, `src/app/admin/admin.module.css`, and `src/lib/i18n/admin-copy.ts`; the no-write synthetic `src/app/preview/admin/` browser fixture; focused unit/security/E2E/SQL tests; opt-in local webpack E2E launch in `scripts/lib/playwright-server.ts`; `.impeccable/surfaces/src-app-admin-page-tsx.md`; this record, runbook marker, and sanitized WP03 evidence.

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

**Design disposition:** MATERIAL — decision-queue direction selected; rendered candidate captured with synthetic fixtures. Founder acceptance of the exact reviewed commit remains pending before proof preflight or stable broad verification.

**Design evidence:** PENDING (material founder receipt required)

**Preparation review:** COMPLETE_INLINE — all selected migration, application, UI, and test changes reviewed against the frozen action matrix; findings and focused corrections below. This does not claim independent or database review.

**Preparation fingerprint:** NOT_READY

**Unresolved findings:** NONE from current selected-diff and synthetic rendered review. The 71-assertion SQL fixture remains unexecuted because its repository guard permits only the GitHub-hosted Linux disposable Supabase runner; DB behavior is unproven until that run. Material founder acceptance, proof preflight, stable broad verification, exact-head CI, and affected production proof remain gates, not PASS claims.

**Established facts:** NONE

## Steps

- [x] Claim WP03-T06, establish the action/trust/design contract, and hand off a bounded implementation block.
- [x] Implement the six action paths with transaction-bound authorization, concurrency, confirmation, and audit; add synthetic focused and pgTAP coverage (hosted pgTAP execution remains pending).
- [x] Build the bilingual admin controls, including localized state and founder-slot labels plus fail-closed loading/error states.
- [x] Prove English/Arabic responsive, keyboard, stale, pending, success, error, and containment states with synthetic fixtures and deterministic mocks.
- [ ] Obtain the material founder receipt for the exact rendered candidate.
- [ ] Review the candidate, complete proof and design acceptance, deliver, verify affected production, and close.

## Handoff

**Changed:** Block 2 added the forward audited-admin-actions migration, typed domain/application/Supabase seams, authenticated server action, and bilingual decision queue. Block 3 mapped snake-case queue RPC results to the typed safe candidate, added a second scoped review with consequence and predictable focus, corrected unknown-outcome copy, added no-write synthetic preview fixtures, and kept successful action feedback visible until an explicit refresh. Protected pending confirmations now bind a fingerprint of prerequisite row revisions and stale pending commands disappear from the current queue. The 71-assertion SQL fixture includes prerequisite drift checks; it has not run. Local E2E server webpack mode is opt-in for Windows Turbopack instability; default CI launch is unchanged. No production principals, provider approvals, real provider calls, private data, or spend were used.

**Changed files:** `src/app/globals.css`; `src/types/database.generated.ts`; `src/lib/admin/admin-actions.domain.ts`; `src/lib/admin/admin-actions.application.ts`; `src/lib/admin/admin-actions.supabase.server.ts`; `src/lib/admin/admin-readiness.application.ts`; `src/lib/i18n/admin-copy.ts`; `src/app/admin/page.tsx`; `src/app/admin/actions.ts`; `src/app/admin/_components/admin-decision-queue.tsx`; `src/app/admin/admin.module.css`; `src/app/admin/[resource]/page.tsx`; `src/app/preview/admin/page.tsx`; `src/app/preview/admin/actions.ts`; `scripts/lib/playwright-server.ts`; `supabase/migrations/20260924134026_audited_admin_actions.sql`; `supabase/tests/28_audited_admin_actions.sql`; `tests/unit/admin-actions.test.ts`; `tests/unit/admin-actions-supabase.test.ts`; `tests/unit/admin-actions-form.test.ts`; `tests/unit/admin-copy.test.ts`; `tests/security/admin-actions-boundary.test.ts`; `tests/e2e/admin-decision-queue.spec.ts`; three synthetic candidate captures under `evidence/wp03-product-shell/wp03-t06-admin-candidate/`; this task record.

**Commands:** Current `corepack pnpm typecheck`, `corepack pnpm typecheck:fresh`, `corepack pnpm check:sql` (27 migrations), `corepack pnpm check:boundaries`, targeted ESLint and Prettier PASS. Focused Vitest 57/57 PASS (52 unit and 5 security). `corepack pnpm scan:secrets` PASS (1201 files); `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` PASS (206 names, 48 links, 23 decisions, 108 tasks); Impeccable detector PASS (`[]`). Opt-in webpack `corepack pnpm exec playwright test tests/e2e/admin-decision-queue.spec.ts --workers=1` PASS 8/8 with external requests blocked; EN/AR 1440/390 widths have no document overflow. Fresh in-app browser desktop EN queue/protected review and mobile AR pending/detail were inspected with synthetic fixtures; fresh console errors `[]`. The browser full-page RTL capture was discarded because it misframed the horizontally scrollable resource rail; direct viewport captures and DOM width measurement (`390 = 390`) passed. Staged `git diff --check` PASS for 27 selected files; staged stat, text diff, and changed-file scope/secret risk inspected. SQL pgTAP has exactly 71 assertions and was not run locally. No broad verify, proof preflight, hosted DB/CI, production proof, or release is claimed.

**Remaining:** Stage and inspect the exact selected diff, commit the rendered candidate, and present it for a traceable Ahmed/Ziad material design receipt naming that commit and `routes:...; surfaces:...; states:...` scope. Then run proof preflight and stable broad verification. Execute the 71-assertion SQL fixture only in guarded GitHub-hosted Linux disposable Supabase CI, resolve any resulting DB finding, and repeat affected proof/acceptance if the candidate changes materially. Deliver through exact-head required CI/branch protection, verify only affected production state, update runbook/evidence, and close/clean according to workflow. Keep all real-provider/private-data/financial actions closed.

**Next safe action:** Stage only the WP03-T06 files listed above, inspect the full staged diff and secret/scope risk, then commit and show the exact synthetic rendered candidate for founder acceptance. Preserve unrelated pre-existing edits outside the staged diff.

**Reviewer action:** Decision-queue composition was selected by Ahmed; the rendered material candidate now needs a founder-authored acceptance reference naming the presented commit, actor, timestamp, routes, surfaces, and states. The local synthetic preview is not an in-product founder confirmation.
