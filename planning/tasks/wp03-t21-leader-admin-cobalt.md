# Task record: WP03-T21 rebuild the Batch Leader and admin flows in Cobalt

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T21

**Status:** [~]

**Outcome:** The admin decision queue, admin resource pages and Batch Leader intake and history render as working tools in the approved Cobalt direction, with real counts, believable invented fixtures and every governed-action and intake guard unchanged.

**Acceptance:** [WP03-T21](../../docs/runbooks/poc-execution-runbook.md#wp03-t21--rebuild-the-batch-leader-and-admin-flows-in-the-approved-direction)

**Owner:** Claude Code (delegated worker under the overseeing session); Ahmed delegated approval to the overseer

**Branch:** claude/wp03-t21-leader-admin-cobalt

**Updated (UTC):** 2026-10-17T22:00Z

## Contract

**Dependencies:** WP03-T19 delivered (`4849cf0`, PR #82).

**Inputs:** `DESIGN.md` (Cobalt: admin decision queue, CountTabs, StatePair, StatePill, ListRow, ConfirmAction, Batch Leader intake rules); `planning/design/premium-overhaul/direction-b.html` screen "Admin queue"; the WP03-T19 shell, tokens and kit.

**Files:** `src/app/admin/**`, `src/app/_components/product-{admin,operations,campaigns,resource-list,collection}.tsx`, new shared `state-pill.tsx`, `src/app/batch-leader/**`, synthetic fixtures `src/lib/demo/synthetic-{campaigns,admin-context}.application.ts`, presentation helpers in `src/lib/collection/collection-presentation.application.ts` and `src/lib/i18n/{admin-copy,collection-format}.ts`, walkthrough `docs/reviews/wp03-synthetic-frontend-review.md`, `public/demo-files/`, affected tests.

**Protected paths:** none changed. Admin Server Actions, guards, readiness predicates, distinct-principal confirmation, upload intake validation, storage, RLS and auth stay byte-identical; presentation only.

**Verify:** `corepack pnpm` parts of `check` (format:check, lint, typecheck, typecheck:fresh, check:boundaries, check:sql, scan:secrets, lint:agents, test:unit); demo e2e for admin and leader specs, their layout matrices and RTL (default demo config, port 3102); required CI including real e2e and `database-ci`; rendered review at 1440, 1100, 820, 390, 320px and 200% text, light/dark, EN/AR.

**Pass:** queue counts are real and match the lists; resource pages are working lists; leader band, request rows, per-file queue and History pills render in Cobalt; tests changed only where they pinned old presentation; required CI green; overseer approval recorded.

**Rollback:** revert the PR; no data, schema or configuration change.

**Hard stop:** any Server Action, guard, RLS, storage or validation logic change; new runtime dependency; paid service; real-money action.

## Steps

- [x] Admin: Night band with real count tabs; verb-first queue rows with state pills; detail with state pair, consequence, readiness checks, required reason and "Review and record" with audit note.
- [x] Admin resource pages as working lists on surfaces; explanations become a secondary disclosure; short verb links replace the long one-line action.
- [x] Batch Leader: Night band with campaign, deadline with time left and derived request progress; request rows; intake panel and per-file queue; recorded submissions with state pills and styled disclosures.
- [x] Fixtures: believable invented campaign, request, source and admin target names; demo pack and walkthrough regenerated.
- [ ] Tests updated where they pinned old presentation; checks and demo e2e green.
- [ ] Rendered review and at most two polish rounds.
- [ ] Review, PR, required CI.

## Decisions

- 2026-10-17, Ahmed: delegated approval of the WP03-T18 to T21 rendered candidates to the overseeing Claude Code session while he is away.
- Count tabs are All, Needs you, Waiting, Blocked and Done (the existing presentation groups); each count is the number of rows the tab selects, so the old "Decisions needing action (9)" heading next to "All 12" is gone. "All" stays the default so every decision is reachable without a filter.
- Queue rows lead with a short verb (copy `verbs`); the confirmation keeps the full action label. Waiting time is omitted: candidates carry no timestamp, and DESIGN.md says to omit unavailable values.
- Request progress counts requests the leader may upload to whose latest submission needs nothing more (`collectionRequestProgress`); time left uses the existing presentation clock.

## Current state

**Changed:** see Steps; commits on the branch.

**Proof:** typecheck, lint, test:unit 921/921 (new unit tests for time left and request progress); demo e2e run in progress.

**Review:** not started.

**Approved commit:** PENDING (overseer review under Ahmed's 17 Oct delegation)

**Remaining:** e2e results, rendered review, independent review, PR and CI.

## Next action

Finish the demo e2e run, fix failures, then run the rendered review.
