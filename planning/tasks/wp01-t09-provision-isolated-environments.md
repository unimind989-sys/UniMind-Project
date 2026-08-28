# Task record: WP01-T09 provision isolated environments

**Task ID:** WP01-T09

**Status:** [~]

**Outcome:** Mock workstation development, disposable database/Auth CI, synthetic Preview, and locked Beta are isolated by runtime, project, deployment scope, namespace, callback, secret, data class, reset authority, owner, health check, promotion, and rollback procedure.

**Owner:** Codex `/root` — agent executor; Ahmed — signed-in human operator; Ahmed and Ziad — shared environment owners

**Reviewer:** Ahmed — ordinary human checkpoint; same-person authorization, operation, and review are approved by D-22

**Branch:** `wp01/environment-provisioning-authorization`

**Updated (UTC):** 2026-08-28

## Execution contract

**Dependencies:** Revised D-21 and ADR-0001 are approved. Historical WP01-T04 through WP01-T07 passed. WP01-T08 is reopened and must prove disposable full-stack Supabase CI before either existing project is repurposed. Ahmed approved the zero-cost-first plan and reports Vercel confirmation for current Hobby use; the eligibility triggers in D-21 must remain closed.

**Inputs:** Runbook WP01-T09; D-21, D-22, and ADR-0001; environment matrix transition plan; versioned migrations/seed/types; synthetic Preview and empty/locked Beta rules; founder-computers-are-development-only constraint.

**Files:** Environment matrix, liveness/readiness routes, deployment/smoke/rollback automation, `docs/runbooks/environment-promotion.md`, task/runbook state, and evidence; external identifiers only when safely public.

**Verify:** WP01-T08 disposable CI PASS; old CI secret removal; credential rotation and safe project-role fingerprints; separate Vercel/Supabase scopes; Preview deploy/smoke and synthetic/mock-only checks; Beta locked and empty; backup gate explicit; secret/topology redaction review; no paid resource.

**Pass:** Preview and Beta use the two separate Supabase Free projects and separate Vercel Hobby project scopes; CI is disposable and cannot reach them; Preview is synthetic/mock-only; Beta is locked/empty with real data blocked on backup and protected gates; an exact tested commit promotes and rolls back without manual schema repair; all runtime components remain operable when both founder computers are off; no paid plan or billable resource is enabled.

**Evidence:** Docs-first topology proof: `evidence/wp01-foundation/2026-08-28_environment-topology_local_5a7e706.md`; historical local conditional slice: `evidence/wp01-foundation/2026-08-27_environment-isolation_local_a7c9d6b.md`; revised external proof: `evidence/wp01-foundation/YYYY-MM-DD_environment-isolation_<preview-or-beta>_<short-sha>.md`

**Rollback:** Before repurposing, leave both projects in their transitional roles. After repurposing, lock/disable the affected deployment, rotate credentials, preserve evidence and versioned migrations, and use forward-only recovery; never point Preview at Beta or Beta at Preview.

**Hard stop:** Do not repurpose the current development or CI project until WP01-T08 disposable CI passes. Do not use a founder computer as infrastructure, share Preview/Beta resources, place real data in Beta, bypass the backup or two-person gates, or start a paid plan, trial, add-on, payment method, usage purchase, or billable resource. Stop deployment and recheck D-21 if Vercel eligibility becomes uncertain.

## 2026-08-27 approved revision

- Ahmed approved the zero-cost-first topology: deterministic workstation mocks, a complete disposable Supabase stack on standard GitHub-hosted CI, and the two existing Supabase Free projects reserved for separate Preview and locked Beta.
- Ahmed reports receiving Vercel confirmation for Hobby in the current project phase. The private confirmation was not inspected or committed. Eligibility must be rechecked before revenue, payments, advertising, donations, paid contributors, customer work, or another material scope/provider-policy change.
- The earlier `$55/month` Supabase Pro plus Vercel Pro proposal is superseded and is not an active blocker or approved spend. Historical evidence mentioning it remains immutable evidence of the earlier checkpoint.
- Supabase Free does not include automatic backups or branching and may pause inactive projects. Beta may be provisioned empty, but real pilot data and go-live remain blocked until an approved encrypted backup/restore procedure is implemented and rehearsed or later paid capacity is approved.
- No project role, workflow, secret, deployment, callback, data, or paid resource was changed by this documentation checkpoint.

## Steps

- [x] Record Ahmed's zero-cost architecture approval, reported Vercel confirmation, shared-account model, provider eligibility triggers, and no-spend boundary.
- [x] Record the target and transition environment matrix, including exact project repurposing order and the Beta backup blocker.
- [~] Keep the existing redacted liveness/readiness routes and local/Preview smoke seam; external Preview proof remains pending.
- [~] Keep the exact-commit Preview/Beta promotion and forward-only rollback procedure; external configuration and rehearsal remain pending.
- [~] WP01-T08 disposable CI passed externally at `c1428f2`; the six obsolete GitHub `ci` secrets/environment and branch-protection update remain before project repurposing.
- [ ] Configure separate Vercel Hobby project scopes and environment secrets without exposing Beta values to pull-request code.
- [ ] Prove Preview synthetic/mock-only behavior, Beta locked/empty state, isolation, rollback, and zero paid-resource state.

## Handoff

**Changed:** Replaced the blocked four-persistent-project paid proposal with the approved two-project zero-cost topology across the governing records. Preserved the existing health/smoke implementation and historical evidence without treating them as proof of the revised external topology.

**Commands:** `scripts/verify-agent-readiness.ps1` passed with 119 names, 37 local links, 22 synchronized decisions, and 102 task contracts. `scripts/show-work-state.ps1` selects reopened WP01-T08. `corepack pnpm verify` passed formatting, lint, strict types, boundaries, CI policy, the 619-file secret scan, 221 unit tests, integration/security/evaluation/load checks, two Playwright checks, the production build, and client-artifact scan. After commit, `scripts/test-agent-handoff.ps1` passed from a clean isolated snapshot and selected WP01-T08. `git show --check` passed. No CI workflow, Supabase/Vercel project, secret, deployment, trial, payment method, paid resource, or external smoke command was changed or run.

**Remaining:** Retire the obsolete hosted-CI GitHub settings, rotate and repurpose the existing development project as Preview and CI project as locked Beta, configure separate Vercel Hobby scopes, run Preview smoke, prove Beta lock/isolation, and record the backup/restore gate state. The read-only dashboard inventory confirms both Free projects are active; development is in Frankfurt and CI is in Ireland.

**Next safe action:** After explicit confirmation, delete only the obsolete GitHub `ci` environment secrets/environment and add `database-ci` to required checks. Then begin the guarded Supabase credential rotation and synthetic-state cleanup; do not place real data in Beta.

**Reviewer action:** Ahmed reviews the architecture/documentation checkpoint and later the ordinary implementation evidence. Separate confirmations from Ahmed and Ziad remain required for protected RLS, deletion, rights, budget/kill-switch, release/unlock, and beta go-live gates.
