# Task record: WP01-T09 provision isolated environments

**Task ID:** WP01-T09

**Status:** [~]

**Outcome:** Local, preview, and beta environments are isolated by project, namespace, callback, secret scope, data classification, owner, health checks, promotion, and rollback procedure.

**Owner:** Codex `/root` — agent executor; Ahmed — signed-in human operator; Ahmed and Ziad — shared environment owners

**Reviewer:** Ahmed — ordinary human checkpoint; same-person authorization, operation, and review are approved by D-22

**Branch:** `wp01/environment-provisioning-authorization`

**Updated (UTC):** 2026-08-27

## Execution contract

**Dependencies:** WP01-T04 through WP01-T08 reviewed PASS. Ahmed explicitly authorized separate preview and beta Supabase/deployment resources, will perform signed-in operations, and will review the ordinary implementation; Ahmed and Ziad are the shared environment owners. Actual Supabase provisioning remains blocked by current free-capacity limits until Ahmed explicitly approves a paid-plan budget or another compliant zero-cost path; applicable data/provider decisions remain separate gates.

**Inputs:** Runbook WP01-T09; approved D-21 and D-22; approved environment owners/scopes; versioned hosted development/database/Auth/CI contracts; synthetic preview and rights-approved beta data rules; confirmed founder-computers-are-development-process-only constraint.

**Files:** Environment matrix, liveness/readiness routes, deployment/smoke/rollback automation, task/runbook state, and evidence; external project identifiers only when safely public.

**Verify:** Isolation review; preview deploy/smoke; forbidden-route and mock-mode checks; beta remains locked; secret and topology redaction review.

**Pass:** Preview and beta use separate projects/scopes and approved external hosting; preview is synthetic/mock-only; an approved tested commit can promote and roll back without manual schema repair; all runtime components remain operable when both founder computers are off.

**Evidence:** `evidence/wp01-foundation/YYYY-MM-DD_environment-isolation_<environment>_<short-sha>.md`

**Rollback:** Roll back the future web/worker release to its prior tested commit and use forward-only database recovery; never point preview at beta data to recover.

**Hard stop:** Do not use a founder computer as a preview/beta host or dependency. The 2026-08-27 authorization covers separate preview/beta resource provisioning and ordinary isolation review only. It does not approve a paid plan, provider spend, real pilot data, beta unlock/go-live, or bypass of any two-person gate. Stop before any paid upgrade or billable resource until Ahmed explicitly approves a budget.

## 2026-08-27 authorization, identity, and capacity checkpoint

- Ahmed authorized separate preview and beta Supabase/deployment resources and will perform and review this next task. Codex `/root` is the agent executor; Ahmed and Ziad are the shared environment owners; Ahmed supplies the ordinary human checkpoint.
- D-22 approves one shared GitHub/Supabase/Google service identity and shared future service accounts, with Ahmed's separate GitHub contributor account as the exception. Account activity is not used to infer whether Ahmed or Ziad acted; the explicitly selected chat profile and task/evidence record provide the human attribution.
- The authorization does not approve paid plans, provider spend, real pilot data, beta unlock/go-live, or bypassing the two-person gates for rights, deletion, budgets/kill switches, release/unlock, or beta go-live.
- Supabase currently grants two active Free projects across organizations where a user is Owner or Administrator. The existing hosted development and hosted CI projects consume the available free allocation, so two additional active preview/beta projects cannot be provisioned within the approved zero-cost envelope.
- The GitHub repository is public. Vercel's public-repository collaboration path removes the previously recorded private-repository blocker; deployment plan eligibility and beta release remain separate gates.
- Sources checked on 2026-08-27: [Supabase Billing FAQ](https://supabase.com/docs/guides/platform/billing-faq) and [Vercel project collaboration](https://vercel.com/docs/deployments/troubleshoot-project-collaboration).
- No project, deployment, secret, callback, data, or paid resource was created by this checkpoint.

## Steps

- [x] Confirm WP01-T04 through WP01-T08 reviewed PASS and record Ahmed's scoped provisioning authorization, signed-in operator role, shared owners, and same-founder ordinary human checkpoint.
- [~] Record the complete workstation-development/hosted-development/hosted-CI/preview/beta isolation matrix, including reset permissions and the noncritical Telegram test-tool boundary. Authorization and capacity blockers are recorded; external identifiers, namespaces, callbacks, and secret scopes remain unassigned until the budget/provider block is resolved.
- [ ] Implement redacted liveness/readiness and post-deploy smoke seams.
- [ ] Configure preview automation and approved beta promotion/rollback.
- [ ] Prove separate projects, safe data profiles, and locked beta.

## Handoff

**Changed:** Recorded Ahmed's scoped authorization for separate preview/beta Supabase and deployment resources, assigned the Codex task as agent executor, assigned Ahmed as signed-in operator and ordinary human reviewer, and retained Ahmed and Ziad as shared environment owners. Recorded D-22's shared-account model, the public-repository Vercel correction, and the current Supabase Free capacity constraint without treating authorization as spend approval.

**Commands:** Reviewed the WP01-T09 task/runbook contract and environment matrix, then verified the current plan limits against official Supabase and Vercel documentation. No provisioning, deployment, secret write, paid action, or runtime smoke command ran.

**Remaining:** Obtain Ahmed's explicit budget approval for the required Supabase capacity, or approve another zero-cost arrangement that still provides separate preview/beta projects. Then assign safe external identifiers/namespaces/callbacks/secret scopes, provision the resources, implement health and deployment automation, prove isolation, and keep beta locked with synthetic/no data until later rights and release gates pass.

**Next safe action:** Present Ahmed with an exact, bounded Supabase and deployment-provider cost proposal. Do not click an upgrade, start a trial, add a payment method, create a billable resource, or provision preview/beta until that budget is explicitly approved.

**Reviewer action:** Ahmed supplies the ordinary human checkpoint after inspecting the implementation and direct evidence; D-22 permits him to be the requester, signed-in operator, and reviewer for this task. Separate named confirmations from Ahmed and Ziad remain required for protected paid-budget, rights/deletion, release/unlock, and beta go-live gates.
