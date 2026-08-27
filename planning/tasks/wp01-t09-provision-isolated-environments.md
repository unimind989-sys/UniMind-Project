# Task record: WP01-T09 provision isolated environments

**Task ID:** WP01-T09

**Status:** [~]

**Outcome:** Local, preview, and beta environments are isolated by project, namespace, callback, secret scope, data classification, owner, health checks, promotion, and rollback procedure.

**Owner:** Codex `/root` — agent executor; Ahmed — signed-in human operator; Ahmed and Ziad — shared environment owners

**Reviewer:** Ahmed — ordinary human checkpoint; same-person authorization, operation, and review are approved by D-22

**Branch:** `wp01/environment-provisioning-authorization`

**Updated (UTC):** 2026-08-27

## Execution contract

**Dependencies:** WP01-T04 through WP01-T08 reviewed PASS. Ahmed explicitly authorized separate preview and beta Supabase/deployment resources, will perform signed-in operations, and will review the ordinary implementation; Ahmed and Ziad are the shared environment owners. Actual provisioning remains blocked by current free-capacity and Vercel Hobby commercial-use limits until the `$55/month` base proposal and its spend controls receive the required approval, or another compliant zero-cost path is approved; applicable data/provider decisions remain separate gates.

**Inputs:** Runbook WP01-T09; approved D-21 and D-22; approved environment owners/scopes; versioned hosted development/database/Auth/CI contracts; synthetic preview and rights-approved beta data rules; confirmed founder-computers-are-development-process-only constraint.

**Files:** Environment matrix, liveness/readiness routes, deployment/smoke/rollback automation, `docs/runbooks/environment-promotion.md`, task/runbook state, and evidence; external project identifiers only when safely public.

**Verify:** Isolation review; preview deploy/smoke; forbidden-route and mock-mode checks; beta remains locked; secret and topology redaction review.

**Pass:** Preview and beta use separate projects/scopes and approved external hosting; preview is synthetic/mock-only; an approved tested commit can promote and roll back without manual schema repair; all runtime components remain operable when both founder computers are off.

**Evidence:** Local conditional slice: `evidence/wp01-foundation/2026-08-27_environment-isolation_local_a7c9d6b.md`; future external proof: `evidence/wp01-foundation/YYYY-MM-DD_environment-isolation_<preview-or-beta>_<short-sha>.md`

**Rollback:** Roll back the future web/worker release to its prior tested commit and use forward-only database recovery; never point preview at beta data to recover.

**Hard stop:** Do not use a founder computer as a preview/beta host or dependency. The 2026-08-27 authorization covers separate preview/beta resource provisioning and ordinary isolation review only. It does not approve a paid plan, provider spend, real pilot data, beta unlock/go-live, or bypass of any two-person gate. Stop before any paid upgrade, trial, payment method, or billable resource until the exact budget and spend controls receive their required named approvals.

## 2026-08-27 authorization, identity, and capacity checkpoint

- Ahmed authorized separate preview and beta Supabase/deployment resources and will perform and review this next task. Codex `/root` is the agent executor; Ahmed and Ziad are the shared environment owners; Ahmed supplies the ordinary human checkpoint.
- D-22 approves one shared GitHub/Supabase/Google service identity and shared future service accounts, with Ahmed's separate GitHub contributor account as the exception. Account activity is not used to infer whether Ahmed or Ziad acted; the explicitly selected chat profile and task/evidence record provide the human attribution.
- The authorization does not approve paid plans, provider spend, real pilot data, beta unlock/go-live, or bypassing the two-person gates for rights, deletion, budgets/kill switches, release/unlock, or beta go-live.
- Supabase currently grants two active Free projects across organizations where a user is Owner or Administrator. The existing hosted development and hosted CI projects consume the available free allocation, so two additional active preview/beta projects cannot be provisioned within the approved zero-cost envelope.
- The GitHub repository is public, so the previously recorded private-repository collaboration blocker is removed. Vercel Hobby is restricted to non-commercial personal use, so Vercel Pro is the compliant proposal for UniMind unless another approved deployment provider is selected.
- The bounded proposal is `$35/month` for one Supabase Pro organization with two Micro projects plus `$20/month` for Vercel Pro: `$55/month` base before tax, with spend caps/management enabled, no on-demand overage, no add-ons, and no extra deploying seats. This is not approved spend.
- Sources checked on 2026-08-27: [Supabase pricing](https://supabase.com/pricing), [Supabase compute pricing](https://supabase.com/docs/guides/platform/manage-your-usage/compute), [Supabase Billing FAQ](https://supabase.com/docs/guides/platform/billing-faq), [Vercel Hobby terms](https://vercel.com/docs/plans/hobby), and [Vercel Pro pricing](https://vercel.com/docs/plans/pro-plan).
- No project, deployment, secret, callback, data, or paid resource was created by this checkpoint.

## Steps

- [x] Confirm WP01-T04 through WP01-T08 reviewed PASS and record Ahmed's scoped provisioning authorization, signed-in operator role, shared owners, and same-founder ordinary human checkpoint.
- [~] Record the complete workstation-development/hosted-development/hosted-CI/preview/beta isolation matrix, including reset permissions and the noncritical Telegram test-tool boundary. Authorization and capacity blockers are recorded; external identifiers, namespaces, callbacks, and secret scopes remain unassigned until the budget/provider block is resolved.
- [~] Implement redacted liveness/readiness and post-deploy smoke seams. Local public-seam proof passes; external Preview proof remains pending.
- [~] Configure Preview automation and approved Beta promotion/rollback. The provider-neutral exact-commit, scope-isolation, locked-Beta, and forward-only rollback procedure is recorded; provider configuration and rehearsal remain blocked on provisioning.
- [ ] Prove separate projects, safe data profiles, and locked beta.

## Handoff

**Changed:** Recorded Ahmed's scoped authorization and shared-account model, then implemented minimal uncached liveness/readiness routes, excluded them from Auth refresh, added fail-closed configuration readiness, added public-seam E2E coverage, and added a guarded local/Preview deployment smoke command. Recorded the exact `$55/month` compliant Supabase Pro plus Vercel Pro base proposal without treating it as authorization.

**Commands:** Prior authorization/governance checks remain recorded. `corepack pnpm smoke:deployment -- --base-url http://127.0.0.1:3101 --target local` passed six checks against an explicitly synthetic local process. `scripts/verify-agent-readiness.ps1` passed with 117 names, 32 local links, 22 synchronized decisions, and 102 task contracts. `corepack pnpm verify` passed formatting, lint, strict types, boundaries, CI policy, the 617-file secret scan, 221 unit tests, integration/security/evaluation/load checks, two Playwright tests, the production build, and the client-artifact secret scan. `git diff --check` passed. No provisioning, deployment, secret write, paid action, trial, or external smoke command ran.

**Remaining:** Approve the exact `$55/month` base proposal and spend controls, or approve another compliant arrangement that still provides separate Preview/Beta projects and external runtime hosting. Then assign safe identifiers/namespaces/callbacks/secret scopes, provision the resources, configure Git preview automation and tested-artifact Beta promotion/rollback, run the new smoke command against Preview, prove isolation, and keep Beta locked with synthetic/no data until later rights and release gates pass.

**Next safe action:** Obtain explicit approval or rejection of the recorded `$55/month` base proposal and its no-overage controls. Do not click an upgrade, start a trial, add a payment method, create a billable resource, or provision Preview/Beta before that checkpoint.

**Reviewer action:** Ahmed supplies the ordinary human checkpoint after inspecting the implementation and direct evidence; D-22 permits him to be the requester, signed-in operator, and reviewer for this task. Separate named confirmations from Ahmed and Ziad remain required for protected paid-budget, rights/deletion, release/unlock, and beta go-live gates.
