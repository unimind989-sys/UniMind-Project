# Task record: WP03-T21 rebuild the Batch Leader and admin flows in Cobalt

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T21

**Status:** [~]

**Outcome:** The admin decision queue, admin resource pages and Batch Leader intake and history render as working tools in the approved Cobalt direction, with real counts, believable invented fixtures and every governed-action and intake guard unchanged.

**Acceptance:** [WP03-T21](../../docs/runbooks/poc-execution-runbook.md#wp03-t21--rebuild-the-batch-leader-and-admin-flows-in-the-approved-direction)

**Owner:** Claude Code (delegated worker under the overseeing session); Ahmed delegated approval to the overseer

**Branch:** claude/wp03-t21-leader-admin-cobalt

**Updated (UTC):** 2026-10-17T21:00Z

## Contract

**Dependencies:** WP03-T19 delivered (`4849cf0`, PR #82).

**Inputs:** `DESIGN.md` (Cobalt: admin decision queue, CountTabs, StatePair, StatePill, ListRow, ConfirmAction, Batch Leader intake rules); `planning/design/premium-overhaul/direction-b.html` screen "Admin queue"; the WP03-T19 shell, tokens and kit.

**Files:** `src/app/admin/**`, `src/app/_components/product-admin.tsx`, `product-operations.tsx`, `product-collection.tsx`, `src/app/batch-leader/**`, synthetic fixtures `src/lib/demo/synthetic-{campaigns,admin-context}.application.ts`, `public/demo-files/`, affected tests.

**Protected paths:** none changed. Admin Server Actions, guards, readiness predicates, distinct-principal confirmation, upload intake validation, storage, RLS and auth stay byte-identical; presentation only.

**Verify:** `corepack pnpm` parts of `check` (format:check, lint, typecheck, typecheck:fresh, check:boundaries, check:sql, scan:secrets, lint:agents, test:unit); demo e2e for admin and leader specs and their layout matrices (default demo config, port 3102); real e2e (`UNIMIND_E2E_PORT=3130`); required CI including `database-ci`; rendered review at 1440, 1100, 820, 390, 320px and 200% text, light/dark, EN/AR.

**Pass:** queue counts are real and match the lists; resource pages are working lists; leader band, request rows, per-file queue and History pills render in Cobalt; tests changed only where they pinned old presentation; required CI green; overseer approval recorded.

**Rollback:** revert the PR; no data, schema or configuration change.

**Hard stop:** any Server Action, guard, RLS, storage or validation logic change; new runtime dependency; paid service; real-money action.

## Steps

- [ ] Admin: Night band with real CountTabs; verb-first queue rows with state pills; detail with StatePair, consequence, readiness checks, required reason and "Review and record" with audit note.
- [ ] Admin resource pages as working lists on surfaces; explanations become secondary disclosures; short action links with structured metadata.
- [ ] Batch Leader: Night band with campaign, deadline and time left, derivable request progress; request rows with Upload; per-file intake queue; History rows with state pills; styled disclosures.
- [ ] Fixtures: believable invented campaign, request, source and admin target names; demo pack regenerated.
- [ ] Tests updated where they pinned old presentation; checks and demo e2e green.
- [ ] Rendered review and at most two polish rounds.
- [ ] Independent review, PR, required CI.

## Decisions

- 2026-10-17, Ahmed: delegated approval of the WP03-T18 to T21 rendered candidates to the overseeing Claude Code session while he is away.

## Current state

**Changed:** NOT STARTED

**Proof:** none yet.

**Review:** not started.

**Approved commit:** PENDING (overseer review under Ahmed's 17 Oct delegation)

**Remaining:** everything.

## Next action

Build the admin decision queue in Cobalt.
