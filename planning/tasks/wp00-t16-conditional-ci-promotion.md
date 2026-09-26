# Task record: WP00-T16 conditional CI promotion

**Task ID:** WP00-T16

**Status:** [x]

**Outcome:** Exact-head required CI skips heavyweight work for proven safe documentation changes, and runs all relevant jobs for application, database, dependency, unknown, and failed-selector changes.

**Owner:** Codex `/root`; Ahmed is the selected chat profile

**Reviewer:** Ahmed; D-22 standing non-financial authorization applies

**Branch:** Implementation `codex/conditional-ci`; closure `codex/conditional-ci-closure`

**Updated (UTC):** 2026-09-26T19:49:00Z

## Derived execution envelope

**Policy version:** 8

**Surfaces:** delivery, tooling, docs

**Risk:** R2

**Planning:** Short

**Worker budget:** 0 used; maximum 1; nesting prohibited

**Capabilities:** release-safety

**Procedural skills:** writing-for-agents

**Routing reason:** Required CI job selection and its protected policy change; product runtime, database schema, and hosted data do not change.

## Manual model work blocks

| Block | Assigned model | Scope and governing inputs | Independent acceptance checks, including failure cases | Assignment reason | Status and evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Sol High | Replay observed CI evidence, narrow safe documentation paths, implement fail-closed selector and guarded workflow, then deliver. | Evidence is current-policy and source-bound; safe docs skip heavy steps while required check names report; application/database/dependency/unknown paths run; selector failure runs full or fails required checks; exact-head CI and protected merge pass. | CI skip semantics and branch protection require one coherent release-safety review. | Complete; PR #55 and main run 36267019639 PASS; docs probe #56 SKIPPED heavyweight jobs; required selector protection confirmed. |

**Next model:** NONE

**Current block:** 1

## Execution contract

**Dependencies:** WP00-T09 central policy, WP00-T15 guarded verification and manual database feedback; exact-head CI history.

**Inputs:** `docs/agents/agent-execution-policy.yaml`, `.github/workflows/ci.yml`, current policy/CI tests, GitHub PR runs 48, 50, 53, and 54.

**Files:** CI selection policy and script, workflow and audit, regression tests, current-policy shadow evidence, workflow/runbook, this record, sanitized delivery evidence.

**Verify:** Current-policy evidence assessment; selector run/skip and failure-case tests; CI workflow audit; protected exact-head PR checks with observed skip and run behavior.

**Pass:** WP00-T16 runbook criteria, including full fallback on uncertainty and preserved branch protection.

**Evidence:** `evidence/wp00-pilot/2026-09-26_conditional-ci-promotion_local_2d4bc5d.md`; historical replay inputs remain in `conditional-ci-shadow-evidence.json`; live PR source/results will be appended before closure.

**Rollback:** Protected revert of policy, selector, and workflow together; no production data or hosted resource changes.

**Hard stop:** Do not omit required check contexts, weaken protected review or exact-head binding, expose secrets, use paid providers, or claim replayed observations are newly run.

## Candidate preparation

**Design disposition:** NOT_APPLICABLE

**Design evidence:** NOT_REQUIRED

**Preparation review:** COMPLETE_INLINE

**Preparation fingerprint:** 251c44347069bb78367cb946c79e5428ac007a72d691649a5dea352fe2dda781

**Unresolved findings:** NONE

**Established facts:** NONE

## Steps

- [x] Validate source-bound broad CI observations and current-policy readiness.
- [x] Implement conservative, exact-candidate CI selection with preserved required checks.
- [x] Prove safe skip, required run, fallback, and manual feedback behavior.
- [x] Deliver exact-head reviewed PR, verify affected GitHub state, close record, clean branches.

## Handoff

**Changed:** ENFORCED selector delivered through protected PR #55, merge c21e1d9. Safe docs probe #56 passed with all heavyweight jobs skipped; invalid fixture naming demonstrated full fallback. Main requires ci-selector plus all original contexts. Historical readiness covers five exact-head broad runs replayed through v8.

**Commands:** Focused tests after final path hardening: 78 PASS, exit 0. Policy v8 validation: PASS (10 historical, 8 conditional cases), exit 0. CI workflow audit, fresh typecheck, readiness and handoff: exit 0. Guarded local gate passed unchanged fingerprint 69b0d133b5fdf2356f556e2660f64a3f6a9a67c48e7008d844caf43586a3511f: 449 unit, 15 integration, 31 security, 3 evaluation, 5 load, 39 browser, build. Initial cold-server broad run failed; warm retry passed. PR #55 full final-head checks PASS; docs probe #56 selector PASS and all three heavyweight jobs SKIPPED. Same executor used authorized aboayman-oss approval for exact head 3105570, then restored unimind989-sys; no independent-review claim. Protected merge c21e1d9; main run 36267019639 application/database/selector PASS. Docs-only closure reuses technical proof and runs lightweight checks.

**Remaining:** NONE after this documentation closure passes its required checks and protected merge; final main synchronization and task branch cleanup follow.

**Next safe action:** Deliver this docs-only closure through the required selector and protected merge; synchronize main and remove task-created branches.

**Reviewer action:** NONE
