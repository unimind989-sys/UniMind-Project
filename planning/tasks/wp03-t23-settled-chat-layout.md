# Task record: WP03-T23 measure the compact Chat layout after the shell settles

**Task ID:** WP03-T23

**Status:** [~]

**Outcome:** The compact-context Chat journey reads the reading region only after the workspace shell has chosen its flow, so it no longer fails when a CI frame runs late.

**Acceptance:** [runbook WP03-T23](../../docs/runbooks/poc-execution-runbook.md#wp03-t23--measure-the-compact-chat-layout-only-after-the-shell-settles)

**Owner:** Claude Code (side session started by the WP03-T22 session); selected speaker Ahmed

**Branch:** claude/wp03-t23-settled-chat-layout

**Updated (UTC):** 2026-10-17T22:40:00Z

## Contract

**Dependencies:** WP03-T15 (the journey dates from #73 and #77). Independent of WP03-T22 (#85), where the flake surfaced.

**Inputs:** CI run 39071765080, job `e2e-demo (shard 2)` (117510750048), artifact `e2e-demo-test-reports-2-39071765080-1` (trace and screenshot); the synthetic demo on a local port.

**Files:** `tests/e2e/demo/chat.spec.ts` (one journey), this record, the runbook.

**Protected paths:** none.

**Verify:** the journey with late animation frames (local-only init script) fails before the fix and passes after; `--repeat-each=10` of the journey without it; `--list` count unchanged; `pnpm check`; PR CI.

**Pass:** the same three assertions (`visible >= 160`, one scroll owner, no horizontal overflow) on settled geometry; repeated runs and required CI green.

**Rollback:** revert the squash commit (test-only).

**Hard stop:** a settled layout under 160 px or with a second scroll owner (a product bug: stop and report); any weakened assertion; any paid action.

## Steps

- [x] Diagnose from the CI trace and a local reproduction.
- [x] Resize through the shared `resize` helper, which waits two animation frames for the shell's re-measure.
- [ ] Repeated local runs, `pnpm check`, PR, required CI, merge, close.

## Decisions

- Wait for the shell's frame instead of polling the assertions until they pass: a poll could accept a stale layout that happens to pass, while two frames always include the shell's re-measure (rAF callbacks run in order) and the assertions then read one settled state.
- No product change. The shell decides the flow in `requestAnimationFrame` by design (`src/app/_components/app-shell.tsx`); the settled 320x720 layout gives 214 px, so the product layout is correct.

## Current state

**Changed:** the journey's resize loop calls `resize(page, width, height)` from `tests/e2e/support/layout.ts` in place of a bare `page.setViewportSize`; a comment names the race.

**Proof:** Cause: the shell (`app-shell.tsx`) picks `data-workspace-flow` (`pane` or `page`) in a `requestAnimationFrame` after a resize. The test measured about 10 ms after `setViewportSize` and its `toHaveAttribute(/pane|page/)` accepts the stale value. In the CI trace the DOM snapshot right after the failing measurement still has `data-workspace-flow="pane"` at 320x720; the failure screenshot, taken later, shows the settled `page` flow. Locally at 320x720 the reading region is 133 px with the flow forced to `pane` (CI's exact value) and 214 px in the settled `page` flow; 390x844 settles on `pane` with 329 px. Reproduction: an init script that delays every animation-frame callback by 150 ms makes the original journey fail 3/3 with `Received: 133` at line 484; the fixed journey passes 3/3 at 150 ms and 3/3 at 400 ms. With the same 150 ms delay the whole of `chat.spec.ts` passes (12 tests), so no other journey in that file has this race.

**Review:** self-review.

**Approved commit:** NOT REQUIRED: test-only; no product change.

**Remaining:** repeated local runs, `pnpm check`, PR and required CI, merge, closure.

## Next action

Run the journey with `--repeat-each=10`, then `pnpm check`, then open the PR.
