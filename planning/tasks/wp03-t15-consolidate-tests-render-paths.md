# Task record: WP03-T15 consolidate tests, CI and synthetic render paths

**Task ID:** WP03-T15

**Status:** [~]

**Outcome:** Fewer, sharper tests; CI in parallel jobs; synthetic logic under `src/lib/demo`; `/preview` and the loopback `/synthetic-runtime` path removed in favour of one synthetic client runtime; no source file over the line limit; repository hygiene done. Product-visible behaviour unchanged.

**Acceptance:** [runbook WP03-T15](../../docs/runbooks/poc-execution-runbook.md#wp03-t15--consolidate-tests-ci-and-the-synthetic-render-paths)

**Owner:** Claude Code (orchestrating sub-agents); selected speaker Ahmed, who delegated design choices on 2026-10-16

**Branch:** claude/wp03-t15-consolidate-tests-render-path

**Updated (UTC):** 2026-10-16T18:30:00Z

## Contract

**Dependencies:** WP00-T18; WP03-T11 (hosted synthetic login is a live feature); main `af8d1fb`.

**Inputs:** three read-only audits (2026-10-16): non-e2e tests, e2e and CI timing, render-path map.

**Files:** `tests/**`, `evals/**`, `playwright*.ts`, `vitest.config.ts`, `.github/workflows/ci.yml`, `scripts/lib/ci-workflow-policy.ts`, `package.json`, `src/app/**` (synthetic, preview, product-* composition), `src/lib/demo/**`, `src/proxy.ts`, module-boundary rules, ESLint config, `evidence/**` hash manifests, docs that name removed paths.

**Protected paths:** auth (`src/proxy.ts`, auth forms, `demo-runtime` gate), CI workflow. Allowed: real routes still require auth; hosted synthetic mode works from the real login. Forbidden: `/synthetic-runtime` and any synthetic fixture reachable in production outside the hosted credential flow; real routes importing `src/lib/demo`; a PR skipping required checks.

**Verify:** `pnpm check`; `pnpm test:security`; `pnpm test:e2e`; `pnpm test:e2e:demo`; test-count and title mapping before/after; required CI (including `database-ci`).

**Pass:** all of the above green; CI wall time recorded before and after; independent review with no unresolved findings.

**Rollback:** revert the squash commit.

**Hard stop:** any change to what a real or synthetic user sees or can do; any weakening of auth, RLS or hosted-mode isolation; any paid action.

## Steps

- [ ] Wave 1 (parallel): non-e2e test cleanup; move synthetic logic to `src/lib/demo`; split and trim the e2e suite; parallel CI; repo hygiene except line endings.
- [ ] Integrate wave 1; run unit, security, e2e and demo e2e.
- [ ] Wave 2: remove `/preview`; fold the loopback demo into the hosted runtime; route table replaces the `ProductNativePage` dispatcher; retarget and dedupe specs.
- [ ] Wave 3: split remaining files over 800 lines; ESLint `max-lines`.
- [ ] Normalize line endings; full `pnpm verify`; independent review; PR; CI; merge; cleanup.

## Decisions

- Hosted synthetic login (WP03-T11) stays; it makes no server requests, so synthetic mode cannot sit behind server components. Target is one synthetic client runtime plus the real server routes (two composition roots, not three).
- Real-mode Workspace overview and chat keep their current UI; the synthetic Study and Chat screens keep theirs. Unifying them changes what users see and is left as a founder product decision.
- Line-ending normalization runs last to avoid conflicts with every other edit.

## Current state

**Changed:** runbook entry and this record.

**Proof:** NOT RUN yet.

**Review:** PENDING (independent review required: auth and CI paths).

**Approved commit:** NOT REQUIRED: no intended visible change; any visible change is a defect.

**Remaining:** all waves.

## Next action

Launch wave 1.
