# Task record: WP01-T11 run package gate

**Task ID:** WP01-T11

**Status:** [?]

**Outcome:** A clean candidate proves the complete WP01 application, database, security, tests, preview, secret hygiene, versions, and agent handoff before WP02 starts.

**Owner:** Codex `/root` after WP01-T04 through WP01-T10 PASS

**Reviewer:** UNASSIGNED — GATE BLOCKED

**Branch:** main (no delivery branch requested)

**Updated (UTC):** 2026-08-20T17:58:00Z

## Execution contract

**Dependencies:** Every WP01-T01 through WP01-T10 task has reviewed PASS evidence; independent reviewers are assigned for database/security/environment gates; preview provisioning is authorized.

**Inputs:** Gate template; clean candidate SHA; complete WP01 evidence; exact runtime/framework/database/extension versions; synthetic preview profile.

**Files:** Final `evidence/wp01-foundation/YYYY-MM-DD_foundation-gate_<environment>_<short-sha>.md` plus only narrow corrections discovered by gate review.

**Verify:** Clean frozen install; provider-network-blocked `pnpm verify`; two database resets; stable generated types; preview deploy/smoke; repository/build/log/evidence secret scan; Supabase breaking-change review; exact version inventory.

**Pass:** The full package reproduces from a clean clone with no dashboard-only state, provider call, secret leak, unauthorized data path, or unresolved executable ambiguity.

**Evidence:** `evidence/wp01-foundation/YYYY-MM-DD_foundation-gate_<environment>_<short-sha>.md`

**Rollback:** Revert only a narrow gate correction or roll preview back to the prior tested commit; database repair remains forward-only.

**Hard stop:** Do not start the gate with an incomplete upstream task, substitute mock database claims for reset/RLS evidence, deploy without authority, expose a secret, approve your own sensitive gate, or unlock WP02 from partial evidence.

## Steps

- [?] Wait for WP01-T04 through WP01-T10 reviewed PASS and required reviewer assignments.
- [ ] Copy and fill the gate template against one candidate SHA.
- [ ] Run clean install/build/test/database/type/secret/version checks.
- [ ] Run the authorized preview smoke and review breaking changes.
- [ ] Obtain all required reviews and record PASS or exact blockers.

## Handoff

**Changed:** No gate started; the complete prerequisite and evidence contract is recorded.

**Commands:** NOT RUN for WP01-T11. WP01-T04 passed on 2026-08-25; WP01-T05/T07/T08/T09/T10 remain incomplete or blocked on downstream prerequisites.

**Remaining:** Entire package gate after every upstream task passes.

**Next safe action:** Select and complete WP01-T05, then follow the remaining WP01 dependency chain; do not advance to WP02.

**Reviewer action:** Assign independent reviewers before database/security/preview evidence is evaluated.
