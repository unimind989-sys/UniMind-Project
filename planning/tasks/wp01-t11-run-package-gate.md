# Task record: WP01-T11 run package gate

**Task ID:** WP01-T11

**Status:** [ ]

**Outcome:** A clean candidate proves the complete WP01 application, database, security, tests, preview, secret hygiene, versions, and agent handoff before WP02 starts.

**Owner:** Unassigned; Codex `/root` may claim after pull request #7 merges

**Reviewer:** Ahmed or Ziad for the ordinary package checkpoint; Ahmed + Ziad for any protected sub-gate

**Branch:** main (no delivery branch requested)

**Updated (UTC):** 2026-08-30

## Execution contract

**Dependencies:** Every WP01-T01 through WP01-T10 task has reviewed PASS evidence under revised D-21; disposable database/Auth CI and isolated Preview/locked-Beta are proven; required founder checkpoints are named; any protected sub-gate has both founders' confirmations.

**Inputs:** Gate template; clean candidate SHA; complete WP01 evidence; exact runtime/framework/database/extension versions; synthetic preview profile.

**Files:** Final `evidence/wp01-foundation/YYYY-MM-DD_foundation-gate_<environment>_<short-sha>.md` plus only narrow corrections discovered by gate review.

**Verify:** Clean frozen install; provider-network-blocked `pnpm verify`; two disposable-CI database resets; stable generated types; Preview deploy/smoke; locked-Beta isolation and backup-blocker state; repository/build/log/evidence secret scan; Supabase breaking-change review; exact version inventory; no paid resource.

**Pass:** The full package reproduces from a clean clone with no dashboard-only state, provider call, secret leak, unauthorized data path, or unresolved executable ambiguity.

**Evidence:** `evidence/wp01-foundation/YYYY-MM-DD_foundation-gate_<environment>_<short-sha>.md`

**Rollback:** Revert only a narrow gate correction or roll preview back to the prior tested commit; database repair remains forward-only.

**Hard stop:** Do not start with an incomplete upstream task, substitute mocks for disposable database/RLS evidence, reset Preview/Beta, deploy without authority or confirmed Hobby eligibility, expose a secret, place real data in Beta without backup/protected gates, approve your own sensitive gate, or unlock WP02 from partial evidence.

## Steps

- [ ] Confirm WP01-T04 through WP01-T10 reviewed PASS and required reviewer assignments against updated `main` when claiming the gate.
- [ ] Copy and fill the gate template against one candidate SHA.
- [ ] Run clean install/build/test/database/type/secret/version checks.
- [ ] Run the authorized preview smoke and review breaking changes.
- [ ] Obtain all required reviews and record PASS or exact blockers.

## Handoff

**Changed:** Synchronized the prerequisite state after reviewed WP01-T08, WP01-T09, and WP01-T10 passed; the package gate itself has not started.

**Commands:** NOT RUN for WP01-T11. Historical WP01-T04/T05/T07 evidence and revised WP01-T08/T09/T10 evidence are available for the gate.

**Remaining:** The entire WP01 package gate against one post-merge candidate SHA.

**Next safe action:** After pull request #7 merges and local `main` is updated, claim WP01-T11, copy the gate template, and run the package gate; do not advance to WP02.

**Reviewer action:** Name Ahmed or Ziad for the ordinary package checkpoint and record both founders only for any protected sub-gate before evaluating its evidence.
