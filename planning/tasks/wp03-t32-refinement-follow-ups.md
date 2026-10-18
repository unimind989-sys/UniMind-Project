# Task record: WP03-T32 close the WP03 refinement follow-ups

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T32

**Status:** [~]

**Outcome:** The demo admin signs out the way the real admin does. Ahmed's answers to the WP03 open items are recorded, with the later checks listed so they are not forgotten.

**Acceptance:** [WP03-T32](../../docs/runbooks/poc-execution-runbook.md#wp03-t32--close-the-wp03-refinement-follow-ups)

**Owner:** Claude Code (overseeing session); Ahmed selected; Ahmed's chat answers of 18 October 2026

**Branch:** claude/wp03-t32-refinement-follow-ups

**Updated (UTC):** 2026-10-18T23:30Z

## Contract

**Dependencies:** WP03-T31 (merged as `680a507`); the production promotion (`27b1305`).

**Inputs:** Ahmed's answers:
- PJ-19: keep the email flow.
- PJ-21: document it and test later.
- PJ-16 and D9: Batch Leaders need no account, and admins send one-time upload links.
- TC-07: leave it.
- IX-35: remove the demo admin Sign out if it is not needed.
- iPhone: test later.

**Files:**
- `src/app/_synthetic/screen-frame.tsx`
- `src/app/admin/_components/admin-workspace.tsx` and `admin.module.css` (the header-actions slot had no other caller)
- `tests/e2e/support/demo.ts` and `tests/e2e/demo/admin.spec.ts`
- the demo walkthrough and pack
- the final verification
- D-24: record, master-plan log and register

**Protected paths:** none. Presentation in the synthetic runtime and documentation. No Server Action, guard, RLS or data change.

**Verify:** the admin demo specs, `corepack pnpm verify`, required CI, and the production procedure from the [WP03 refinement proof](../../evidence/wp03-product-shell/2026-10-18_wp03-refinement_production_680a507.md).

**Pass:** no header Sign out on the demo admin, and every admin journey passes; the decisions and later checks are recorded; required CI green; production carries the change.

**Rollback:** revert the PR, and promote the previous production artifact.

**Hard stop:** any change to real admin authorization, Batch Leader access or data; any paid action.

## Steps

- [x] Remove the synthetic admin's header Sign out and the unused header-actions slot; the tests sign out from Account → Identity and access.
- [x] Demo walkthrough step for the second-founder confirmation; pack rebuilt with the same entries and dates.
- [x] D-24 proposed: record, master-plan decision log and decision register.
- [x] Final verification: decided items, later checks, still-open items.
- [ ] Verification, PR, required CI, promotion.

## Decisions

- **D-24 is recorded as PROPOSED, not approved.** It changes how D-11's authority is granted, and D-11 is owned by Ahmed and Ziad. It becomes "Approved direction" after Ziad confirms it. Building the link flow is a new runbook task.
- **The real admin band is unchanged.** It never received the actions slot. Only the unused CSS rules for that slot were removed; the grid area names stay.

## Current state

**Changed:** see Steps.

**Proof:** admin demo specs 37/37. `corepack pnpm verify` on `39bb611`: every step passed except one demo test (208/209). `chat.spec.ts` also pressed the removed header Sign out; it now uses the shared helper and passed alone (1/1). The full demo suite reruns in CI.

**Review:** self-review. No protected path.

**Approved commit:** NOT REQUIRED: a demo-only control is removed so the demo matches the approved real admin header.

**Remaining:** verification, PR, CI, promotion. The hosted WP03-T27 migration waits for the paused Supabase project and Ahmed's choice to resume it.

## Next action

Run `corepack pnpm verify`, open the PR, merge on green CI, then promote.
