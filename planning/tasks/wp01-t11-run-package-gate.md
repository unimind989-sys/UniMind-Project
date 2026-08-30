# Task record: WP01-T11 run package gate

**Task ID:** WP01-T11

**Status:** [~]

**Outcome:** A clean candidate proves the complete WP01 application, database, security, tests, preview, secret hygiene, versions, and agent handoff before WP02 starts.

**Owner:** Codex `/root`

**Reviewer:** Ahmed — ordinary package checkpoint authorized in chat on 2026-08-30; protected Beta/release sub-gates remain excluded

**Branch:** `wp01/package-gate`

**Updated (UTC):** 2026-08-30

## Execution contract

**Dependencies:** Every WP01-T01 through WP01-T10 task has reviewed PASS evidence under revised D-21; disposable database/Auth CI and isolated Preview/locked-Beta are proven; required founder checkpoints are named; any protected sub-gate has both founders' confirmations.

**Inputs:** Gate template; clean candidate SHA; complete WP01 evidence; exact runtime/framework/database/extension versions; synthetic preview profile.

**Files:** Final `evidence/wp01-foundation/YYYY-MM-DD_foundation-gate_<environment>_<short-sha>.md` plus only narrow corrections discovered by gate review.

**Verify:** Clean frozen install; provider-network-blocked `pnpm verify`; two disposable-CI database resets; stable generated types; Preview deploy/smoke; locked-Beta isolation and backup-blocker state; repository/build/log/evidence secret scan; Supabase breaking-change review; exact version inventory; no paid resource.

**Pass:** The full package reproduces from a clean clone with no dashboard-only state, provider call, secret leak, unauthorized data path, or unresolved executable ambiguity.

**Evidence:** `evidence/wp01-foundation/2026-08-30_foundation-gate_preview_6db95f0.md`

**Rollback:** Revert only a narrow gate correction or roll preview back to the prior tested commit; database repair remains forward-only.

**Hard stop:** Do not start with an incomplete upstream task, substitute mocks for disposable database/RLS evidence, reset Preview/Beta, deploy without authority or confirmed Hobby eligibility, expose a secret, place real data in Beta without backup/protected gates, approve your own sensitive gate, or unlock WP02 from partial evidence.

## Steps

- [x] Confirm WP01-T04 through WP01-T10 reviewed PASS and required reviewer assignments against updated `main` when claiming the gate.
- [x] Copy and fill the gate template against one candidate SHA.
- [ ] Run clean install/build/test/database/type/secret/version checks.
- [ ] Run the authorized preview smoke and review breaking changes.
- [ ] Obtain all required reviews and record PASS or exact blockers.

## Handoff

**Changed:** Claimed the package gate after confirming WP01-T01 through WP01-T10 reviewed PASS. Live Vercel inspection found the protected Preview healthy and the merged `main` incorrectly routed to an unconfigured Production environment. Added a reviewable Vercel Git policy that disables deployments from `main` while preserving branch and pull-request Previews; correction verification and the full gate are in progress.

**Commands:** Live browser inspection confirmed Preview deployment `0a09653` READY with `GET /` status `200`; merged-main Production deployment `6db95f0` failed closed because required variables are scoped only to Preview while Vercel tracks `main` as Production.

**Remaining:** Verify the Vercel Git policy and disable automatic Production-domain assignment without creating a Production target, then complete clean-clone, disposable database, Preview smoke, secret, version, compatibility-feed, review, and cleanup checks.

**Next safe action:** Keep variables Preview-scoped, deploy this branch as protected Preview, prove `main` deployment suppression after review, and execute the remaining package gate; do not advance to WP02.

**Reviewer action:** Name Ahmed or Ziad for the ordinary package checkpoint and record both founders only for any protected sub-gate before evaluating its evidence.
