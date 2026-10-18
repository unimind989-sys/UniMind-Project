# Task record: WP03-T25 consolidate the Cobalt design system and shared primitives

**Task ID:** WP03-T25

**Status:** [~]

**Outcome:** One shared implementation per DESIGN component in use (language switch, button and action link, submit button, field, notice, page state, segmented control, metadata list, icon sizes), no Open Folio alias token or legacy button look left, and error pages that re-fetch with `retry()` and always offer a safe exit.

**Acceptance:** [runbook WP03-T25](../../docs/runbooks/poc-execution-runbook.md#wp03-t25--consolidate-the-cobalt-design-system-and-shared-primitives)

**Owner:** Claude Code sub-agent under the overseeing session (WP03 delegation; selected speaker Ahmed)

**Branch:** claude/wp03-t25-cobalt-primitives

**Updated (UTC):** 2026-10-18T00:00:00Z

## Contract

**Dependencies:** WP03-T24 (findings DS-01 to DS-34 except DS-17, DS-19, DS-20, DS-24; IX-02, IX-03, IX-07, IX-17, IX-30).

**Inputs:** `DESIGN.md`; mockup `planning/design/premium-overhaul/direction-b.html`; [design-system audit](../../docs/reviews/wp03-refinement/audits/design-system.md); [interactions audit](../../docs/reviews/wp03-refinement/audits/interactions.md); plan decisions D1 and D5.

**Files:** `src/app/_components/**` (primitives, shell, tokens in `globals.css`), role modules under `src/app/{learn,batch-leader,admin,(auth),settings,_synthetic}/**` (presentation only), route `error`/`loading`/`not-found` files, `src/lib/i18n/locale.ts`, unit tests for `localizedHref` and the token guard, demo e2e helpers pinning the old language control.

**Protected paths:** none. No Server Action, route guard, auth, RLS, storage, governance or demo-isolation change.

**Verify:** `corepack pnpm format:check`, `lint`, `typecheck`, `typecheck:fresh`, `check:boundaries`, `check:sql`, `scan:secrets`, `lint:agents`, `test:unit`; affected demo specs, then the full demo suite (`PW_WORKERS=2`) on a private port config; `UNIMIND_E2E_PORT=3230 corepack pnpm test:e2e`; `corepack pnpm test:env-build`; rendered captures at 1440/768/390/320, EN/AR, light/dark.

**Pass:** the runbook pass line: one implementation per DESIGN component in use; no alias token or legacy button left; no behaviour change; required CI green.

**Rollback:** revert the squash commit (presentation and tests only; no data or configuration).

**Hard stop:** any change that would alter a Server Action, guard, authorization or demo isolation; a new runtime dependency; any paid action.

## Steps

- [ ] Tokens: alias codemod, alias deletion, new component tokens, guard test.
- [ ] `LanguageSwitch` and `localizedHref`; `SegmentedControl`.
- [ ] `Button`/`ActionLink`, `SubmitButton`, `Field`, `Notice`, `PageState`, `MetaList`, icon sizes.
- [ ] Error, loading and not-found pages on `PageState` with `retry()`.
- [ ] Visible fixes; Report, Evidence, Quiz states and campaign invitation migrations; cleanup.
- [ ] Tests, rendered self-check, push.

## Decisions

- D1 (plan): compact segmented "EN | ع" in the Night bar with full accessible names; full labels on access pages; text link on the landing.
- D5 (plan): no hover elevation on non-floating cards, no grey shadow on the selected choice, flat 14px access form page, neutral scrollbar, admin IDs in Manrope tabular numerals.

## Current state

**Changed:** NOT STARTED

**Proof:** none yet.

**Review:** self-review pending; the overseeing session reviews the candidate.

**Approved commit:** PENDING (material UI; the overseeing session approves under the delegation).

**Remaining:** all steps.

## Next action

Tokens slice.
