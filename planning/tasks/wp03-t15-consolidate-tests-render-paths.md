# Task record: WP03-T15 consolidate tests, CI and synthetic render paths

**Task ID:** WP03-T15

**Status:** [x]

**Outcome:** Fewer, sharper tests; CI in parallel jobs; synthetic logic under `src/lib/demo`; `/preview` and the separate loopback render path removed in favour of one synthetic client runtime; no source file over the line limit; repository hygiene done. Product-visible behaviour unchanged except the accessibility and navigation fixes listed under Decisions.

**Acceptance:** [runbook WP03-T15](../../docs/runbooks/poc-execution-runbook.md#wp03-t15--consolidate-tests-ci-and-the-synthetic-render-paths)

**Owner:** Claude Code (orchestrating sub-agents); selected speaker Ahmed, who delegated design choices on 2026-10-16

**Branch:** claude/wp03-t15-consolidate-tests-render-path

**Updated (UTC):** 2026-10-17T12:00:00Z

## Contract

**Dependencies:** WP00-T18; WP03-T11 (hosted synthetic login is a live feature); main `af8d1fb`.

**Inputs:** three read-only audits (2026-10-16): non-e2e tests, e2e and CI timing, render-path map.

**Files:** `tests/**`, `evals/**`, `playwright*.ts`, `vitest.config.ts`, `.github/workflows/ci.yml`, `scripts/lib/ci-workflow-policy.ts`, `docs/agents/ci-paths.yaml`, `package.json`, `src/app/**`, `src/lib/demo/**`, `src/proxy.ts`, module-boundary rules, `eslint.config.mjs`, `supabase/tests/27_*`, `evidence/**` hash manifests, docs naming removed paths.

**Protected paths:** auth (`src/proxy.ts`, auth form intercept, demo gate), CI workflow, pgTAP. Allowed: real routes still require auth; hosted synthetic mode works from the real login. Forbidden: synthetic runtime or fixtures reachable in production outside the hosted credential flow; real route files importing the synthetic runtime; a PR skipping required checks.

**Verify:** `pnpm check`; `pnpm test:node`; `pnpm test:e2e`; `pnpm test:e2e:demo`; database feedback CI; full PR CI.

**Pass:** all green; CI wall time recorded; independent review findings resolved.

**Rollback:** revert the squash commit.

**Hard stop:** any weakening of auth, RLS or hosted-mode isolation; any paid action.

## Steps

- [x] Wave 1: non-e2e test cleanup; synthetic logic to `src/lib/demo`; e2e split and trim; parallel CI; hygiene.
- [x] pgTAP: expired assignment and non-OPEN campaign rejection (database feedback CI run 38956063243 green).
- [x] Wave 2: `/preview` removed; one synthetic client runtime with a route table (database feedback CI run 38967573340 green).
- [x] Wave 3: files over 800 lines split; ESLint `max-lines`; four 200%-text reflow defects fixed.
- [x] Independent review (security, CI, coverage, split equivalence); findings fixed.
- [x] Restore browser coverage that only existed on `/preview` (loopback-only fixtures; hosted mode strips `fixture`).
- [x] Line endings: every tracked file is already LF in the index; nothing to renormalize.
- [ ] PR; required CI; merge; cleanup.

## Decisions

- Hosted synthetic login (WP03-T11) stays; it makes no server requests, so synthetic mode stays a client runtime. Result: two composition roots (real server routes, one synthetic client runtime), not three.
- Real-mode Workspace overview and chat keep their UI; the synthetic Study and Chat screens keep theirs. Unifying them is a founder product decision.
- Accessibility fixes at 320px + 200% text (campaign titles, invitation form, expired page, quiz material library) change nothing at normal size (element boxes compared before/after); treated as non-material.
- Demo rewrites are built from `request.url`: `nextUrl` reports 127.0.0.1 as localhost, so Next proxied every loopback rewrite over HTTP (`ECONNRESET` flakes).
- In-document synthetic navigation now honours `#fragment` targets, matching Next's router (loopback regression found in review).
- `database-ci` now also runs for frontend and `tests/e2e-database` changes, because real-mode UI is browser-tested only there.
- Landing CSS split proven pixel-identical (16 screenshots, en/ar × light/dark × 4 widths, with a control).
- Line-ending normalization runs last.

## Current state

**Changed:** see Steps; gate report `evidence/wp03-product-shell/2026-10-17_wp03-t15-test-consolidation.md`.

**Proof:** static checks, `test:node` (948 passed, 2 skipped), `test:env-build`, and both full browser suites green locally (main 39/39, demo 190/190 on 2 workers); two database feedback CI runs green. Baseline: main 146, demo 284 runs, unit about 1,012.

**Review:** independent review sub-agents; no high findings; medium and low findings fixed.

**Approved commit:** NOT REQUIRED: no intended change at normal sizes; accessibility fixes only at 320px + 200% text.

**Remaining:** NONE once the PR merges; these closure markers become authoritative only then.

## Next action

Open the PR, wait for required CI, squash-merge, record CI wall time, close the runbook task.
