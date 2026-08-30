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

**Evidence:** `evidence/wp01-foundation/2026-08-30_foundation-gate_preview_d7997eb.md`

**Rollback:** Revert only a narrow gate correction or roll preview back to the prior tested commit; database repair remains forward-only.

**Hard stop:** Do not start with an incomplete upstream task, substitute mocks for disposable database/RLS evidence, reset Preview/Beta, deploy without authority or confirmed Hobby eligibility, expose a secret, place real data in Beta without backup/protected gates, approve your own sensitive gate, or unlock WP02 from partial evidence.

## Steps

- [x] Confirm WP01-T04 through WP01-T10 reviewed PASS and required reviewer assignments against updated `main` when claiming the gate.
- [x] Copy and fill the gate template against one candidate SHA.
- [x] Run clean install/build/test/database/type/secret/version checks.
- [x] Run the authorized preview smoke and review breaking changes.
- [ ] Obtain all required reviews and record PASS or exact blockers.

## Handoff

**Changed:** Claimed the package gate after confirming WP01-T01 through WP01-T10 reviewed PASS; closed the stale WP01-T10 post-merge handoff; added a reviewable Vercel Git policy that disables deployments from `main`; disabled automatic Production-domain assignment; and completed the clean-clone, disposable database, protected Preview, secret, version, compatibility, and cleanup checks against candidate `d7997eb`.

**Commands:** Source and exact clean-clone `pnpm verify` passed with 232 unit tests and every remaining zero-cost layer. GitHub run `33323913701` passed dependency audit, application, and disposable database CI with two resets and cleanup. Protected Preview deployment `8cQQwEHwBicq4jCm6PqMcYpz1nBC` was READY and passed all six smoke checks. The sanitized runtime artifact recorded the exact pinned/runtime versions and was deleted locally after digest verification.

**Remaining:** Obtain the required independent approval on the final pull-request head, merge the candidate, prove that the `main` event creates no Vercel Production deployment, and record the final ordinary package-gate decision.

**Next safe action:** Finalize candidate evidence, approve and merge pull request #8, verify `main` deployment suppression and green post-merge CI, then close WP01-T11 on a narrow documentation follow-up; do not advance to WP02 before that proof.

**Reviewer action:** Review and approve the final pull-request head for the ordinary package checkpoint. No protected Beta unlock, release, raw deletion, rights, budget, or go-live sub-gate is included.
