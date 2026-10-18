# Task record: WP03-T30 speed up local verification and CI without losing coverage

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T30

**Status:** [~]

**Outcome:** The same tests and gates run in less wall time and compute, locally and in CI, with the one known demo flake fixed and a moved `main` no longer turning the required selector check red.

**Acceptance:** [WP03-T30](../../docs/runbooks/poc-execution-runbook.md#wp03-t30--speed-up-local-verification-and-ci-without-losing-coverage)

**Owner:** Claude Code (overseeing session); Ahmed selected; delegated under the WP03 refinement brief (18 October 2026)

**Branch:** claude/wp03-t30-verification-speed

**Updated (UTC):** 2026-10-18T09:00Z

## Contract

**Dependencies:** WP03-T24 (findings TC-01 to TC-22 in `docs/reviews/wp03-refinement/audits/testing-ci.md`).

**Inputs:** CI runs 39076457286, 39075001940, 39072885508; local baseline `.local/wp03-refinement/verify-baseline.tsv` (founder machine, 4 CPUs); `scripts/lib/ci-workflow-policy.ts`.

**Files:** `.github/workflows/ci.yml`, `scripts/lib/conditional-ci-selector.ts`, `scripts/select-ci-jobs.ts`, new `scripts/run-verify.ts` and `scripts/lib/verification-plan.ts`, `package.json` scripts, `playwright.demo.config.ts`, `playwright.config.ts`, safe-env spawners, `tests/e2e/support/layout.ts`, `tests/e2e/demo/studio-quiz.spec.ts`, `tests/e2e/demo/leader.layout-matrix.spec.ts`, unit tests, `CONTRIBUTING.md`, `tests/e2e/README.md`, the CI and testing report.

**Protected paths:** CI workflow and the job selector. Allowed: two demo workers per shard, one main e2e shard, headless-shell Chromium, a selector that runs every job when only the base moved, no plain `typecheck` step. Forbidden (proved by the policy tests): caches, secrets, write permissions, unpinned actions, `continue-on-error`, a narrowed `verify:ci`, a selector that accepts a different head.

**Verify:** `corepack pnpm check`; `tests/unit/{ci-workflow-policy,conditional-ci-selector,verification-plan}.test.ts`; quiz journey `--repeat-each=10` with an rAF-delay reproduction; full demo with `PW_WORKERS=2 --repeat-each=2`; `corepack pnpm verify` timed against the baseline; two green PR CI runs with per-shard timings.

**Pass:** same 192 demo, 39 main e2e, Node and database tests; CI wall and compute per run lower than the baseline; local verify faster; independent review clean.

**Rollback:** revert the squash commit (configuration and test code only).

**Hard stop:** any change that skips or narrows a gate, adds a cache, or needs a secret; real-money exposure.

## Steps

- [x] TC-02 quiz fake-clock race: wait for the real resize event or resize-observer delivery before advancing the paused clock.
- [x] TC-01/05/06 demo two workers, one e2e shard, `--only-shell`; TC-11 drop plain `typecheck` from `verify:ci` and static, with a unit guard on the build's type check.
- [x] TC-03 selector runs every job when only the base moved; head mismatch still fails.
- [x] TC-08/09/10/12 local runner, CPU-based workers, lint and format caches, telemetry off; TC-04/21/22 docs and step titles.
- [ ] Local proof and timings; independent review; PR with two green CI runs; report.

## Decisions

- Rejected (measured or policy reasons in the audit): dependency and browser caches (policy forbids; under 1.5 compute-minutes), a production-build demo (weakens the T15 demo gate), build reuse across jobs, removing the selector's duplicate workflow check, narrowing the layout matrix, trimming the database stack (needs a D-21 reading).
- Local `pnpm verify` stays the pre-PR rule (D12 in the plan); this task makes it faster instead.

## Current state

**Changed:** see Steps.

**Proof:** quiz journey 3/3 on the demo config; ci-workflow-policy, conditional-ci-selector, verification-plan 48/48; `corepack pnpm verify` through the new runner passed every step in 2,042 s (34.0 min) against the 2,906 s baseline, measured while another task built in parallel on the same 4-CPU machine (192 demo in 27.3 min on 2 workers, 39 main e2e); the tree stays clean (no `next-env.d.ts` change).

**Review:** pending independent review (`independent-reviewer`).

**Approved commit:** NOT REQUIRED: no rendered change.

**Remaining:** proof, review, delivery.

## Next action

Install dependencies in the worktree, run the focused unit tests and the quiz reproduction, then the timed `pnpm verify`.
