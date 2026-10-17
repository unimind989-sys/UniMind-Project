# Task record: WP03-T16 balance demo CI shards

**Task ID:** WP03-T16

**Status:** [x]

**Outcome:** The demo e2e shards finish in similar time, so CI wall time falls from about 14.6 to about 7 minutes with the same 190 demo tests.

**Acceptance:** [runbook WP03-T16](../../docs/runbooks/poc-execution-runbook.md#wp03-t16--balance-demo-ci-shards)

**Owner:** Claude Code (side session started by the WP03 orchestrating session); selected speaker Ahmed

**Branch:** claude/wp03-t16-balance-demo-shards

**Updated (UTC):** 2026-10-17T01:50:00Z

## Contract

**Dependencies:** WP03-T15 (main `a6dfbae`).

**Inputs:** per-test durations from the `e2e-demo-test-reports-{1..4}` artifacts of run 38986179501 (PR #77, final head).

**Files:** `tests/e2e/demo/*layout-matrix*.spec.ts` (regrouped and renamed), `tests/e2e/support/` (route sweep moved into a shared helper), `.github/workflows/ci.yml` (demo shard matrix), `tests/unit/ci-workflow-policy.test.ts`, this record, the runbook.

**Protected paths:** CI workflow. Allowed: the `e2e_demo` matrix gains a fifth shard; the shard command, `fail-fast: false`, concurrency group, report upload and `application` result gate stay as audited by `scripts/lib/ci-workflow-policy.ts`. Forbidden (proved by `tests/unit/ci-workflow-policy.test.ts`): a gapped shard list (`[1, 2, 4]`), a hard-coded shard total, fail-fast shards, or a missing per-shard concurrency group.

**Verify:** `corepack pnpm test:e2e:demo --list` → 190 tests, same titles as main; `corepack pnpm test:node -- tests/unit/ci-workflow-policy.test.ts`; `pnpm check`; the moved specs run green locally; PR CI per-shard times.

**Pass:** all demo shards on the PR's CI within about 2 minutes of each other; total CI wall time about 7 minutes; required checks green.

**Rollback:** revert the squash commit (restores four shards and the original file layout).

**Hard stop:** any dropped, skipped or weakened demo test; any paid action.

## Steps

- [x] Diagnose: Playwright 1.62 `--shard` cuts the test list into contiguous, equal-count slices in file-name order and ignores duration. The four `layout-matrix-*` files (28 tests, 623 s of 1,602 s total) sort next to each other, so shard 2 got all of them: 13.2 min of tests against 3.9 to 5.5 min elsewhere.
- [x] Regroup the layout matrix by role into `admin.`, `leader.`, `shelf.` and `study.layout-matrix.spec.ts`, so each sorts beside different journey specs; move the route sweep into a shared helper so each role file owns its own sweep. Titles stay unchanged.
- [x] Raise demo shards from four to five; update the policy test that edits the matrix line.
- [x] Verify locally; independent review; PR #78; record per-shard times; merge; close.

## Decisions

- Kept Playwright's own `--shard` (no custom file-to-shard table). Its slices follow file order, so the fix is file order. Simulated on run 38986179501's durations: four renamed files alone gave at best a 3-minute spread; regrouping by role with five shards gives 353/273/312/336/329 s of test time and stays under 360 s when six tests are added or removed ahead of a boundary. Six shards did not improve the worst shard.
- Test count stays 190: splitting the 60-second matrix tests would balance better but changes the count, which this task keeps fixed.

## Current state

**Changed:** `layout-matrix-roles` split into `admin.` and `leader.layout-matrix.spec.ts`; `layout-matrix-student` → `shelf.`, `layout-matrix-study` → `study.layout-matrix.spec.ts`; `layout-matrix-routes` removed, its sweep now `support/route-sweep.ts` (`routeSweepTests(role)`) registered by the admin, leader and shelf files; CI `e2e_demo` matrix `[1, 2, 3, 4, 5]`; policy test edits the new matrix line; README and harness comment explain the file-order rule.

**Proof:** `--list` before and after → 190 tests in 16 files, identical titles. The four `*.layout-matrix` files run locally → 28 passed (2 workers, 12.8 min). Simulated on run 38986179501 durations with the real new order → 353/273/312/336/329 s per shard (was 321/781/223/278 for four). `format:check`, `lint`, `typecheck`, `check:boundaries`, `check:sql`, `scan:secrets`, `lint:agents`, `test:unit` (917 passed) green. PR #78 CI run 38991372535 (head `0451cea`), all required checks green: demo shard jobs 7.2 / 4.9 / 6.2 / 6.6 / 6.7 min (test time 380 / 251 / 324 / 352 / 356 s); spread 2.3 min against the about-2 target, because shard 1 holds both admin files (dev-server compile cost made it about 15 s heavier than simulated). Total CI wall time 7.7 min (01:33:28 to 01:41:09 UTC), down from 14.6 min on run 38986179501.

**Review:** independent review by the Claude Code `independent-reviewer` sub-agent of exact candidate `a6dfbae..0451cea`: no findings (test equivalence, workflow policy, policy-test replace target, data safety checked; `ci-workflow-policy` 17/17).

**Approved commit:** NOT REQUIRED: test and CI layout only; no product change.

**Remaining:** NONE once PR #78 merges; these closure markers become authoritative only then. Follow-up: a new demo spec can undo the balance if it sorts next to a `*.layout-matrix` file (rule in `tests/e2e/README.md`).

## Next action

None. Squash-merge PR #78 after required CI on its final head, then remove the branch and worktree.
