# Task record: WP03-T25 consolidate the Cobalt design system and shared primitives

**Task ID:** WP03-T25

**Status:** [~]

**Outcome:** One shared implementation per DESIGN component in use (language switch, button and action link, submit button, field, notice, page state, segmented control, metadata list, icon sizes), no Open Folio alias token or legacy button look left, and error pages that re-fetch with `retry()` and always offer a safe exit.

**Acceptance:** [runbook WP03-T25](../../docs/runbooks/poc-execution-runbook.md#wp03-t25--consolidate-the-cobalt-design-system-and-shared-primitives)

**Owner:** Claude Code sub-agent under the overseeing session (WP03 delegation; selected speaker Ahmed)

**Branch:** claude/wp03-t25-cobalt-primitives

**Updated (UTC):** 2026-10-18T09:00:00Z

## Contract

**Dependencies:** WP03-T24 (findings DS-01 to DS-34 except DS-17, DS-19, DS-20, DS-24; IX-02, IX-03, IX-07, IX-17, IX-30).

**Inputs:** `DESIGN.md`; mockup `planning/design/premium-overhaul/direction-b.html`; [design-system audit](../../docs/reviews/wp03-refinement/audits/design-system.md); [interactions audit](../../docs/reviews/wp03-refinement/audits/interactions.md); plan decisions D1 and D5.

**Files:** `src/app/_components/**` (primitives, shell, tokens in `globals.css`), role modules under `src/app/{learn,batch-leader,admin,(auth),_synthetic}/**` (presentation only), route `error`/`loading`/`not-found` files, `src/app/layout.tsx`, `src/lib/i18n/locale.ts`, unit tests `localized-href` and `design-tokens`, demo e2e helpers that pinned the old language control or the English-only not-found.

**Protected paths:** none. No Server Action, route guard, auth, RLS, storage, governance or demo-isolation change.

**Verify:** `corepack pnpm format:check`, `lint`, `typecheck`, `typecheck:fresh`, `check:boundaries`, `check:sql`, `scan:secrets`, `lint:agents`, `test:unit`; affected demo specs, then the full demo suite (`PW_WORKERS=2`) on a private port config; `UNIMIND_E2E_PORT=3230 corepack pnpm test:e2e`; `corepack pnpm test:env-build`; rendered captures at 1440/768/390/320, EN/AR, light/dark.

**Pass:** the runbook pass line: one implementation per DESIGN component in use; no alias token or legacy button left; no behaviour change; required CI green.

**Rollback:** revert the squash commit (presentation and tests only; no data or configuration).

**Hard stop:** any change that would alter a Server Action, guard, authorization or demo isolation; a new runtime dependency; any paid action.

## Steps

- [x] Tokens: alias codemod, alias deletion, component tokens, radii tokens, font chain, focus, disabled, guard test.
- [x] `LanguageSwitch` and `localizedHref`; `SegmentedControl` (unit band, access steps, admin resources and count tabs, ChoiceGroup).
- [x] `Button`/`ProductLink` look, `SubmitButton`, `Field`, `Notice`, `PageState`, `MetaList`, icon sizes; role button copies migrated.
- [x] Error, loading and not-found pages on `PageState` with `retry()` and a safe exit.
- [x] Visible fixes; Report, Evidence, Quiz states and campaign invitation migrations; cleanup.
- [x] Demo, main e2e and env-build proof; rendered polish and confirmation rounds; push.
- [ ] Overseeing session: independent review, `Approved commit:`, PR, required CI, merge.

## Decisions

- D1 (plan): compact segmented "EN | ع" (36px chips in 44px hit areas, no track padding) in the Night bar with full accessible names; access pages use the same control as links with full labels and `aria-current="true"`; landing keeps one text link.
- D5 (plan): no hover elevation on covers and Subjects rows, no grey shadow on the selected choice, flat 14px access form page, neutral scrollbar (`--control` on `--surface-2`), admin IDs in Manrope tabular numerals. Settings stays on paper (DS-30: no change).
- `Notice` is static unless `live`; live roles stay on messages that appear after an action (report, invitation, admin saves, Studio progress, quiz score and expiry, auth form summary).
- The proof-line text on the access Night page (`#d4e0ee`) maps to `--on-night`; the slogan uses `--on-night` instead of `#fff`.
- The Arabic web font has no metric-adjusted local fallback, so Latin runs inside Arabic text fall through to Manrope; Manrope keeps its fallback (CLS) and Arabic runs in English text rely on `lang` attributes.
- Error boundaries exit to: root `/` (routes to the role home), unit workspace Subjects, campaign list.
- Left for later tasks: return-link labels such as "Return to Chat · Anatomy" (about 15 pinned journeys; an action label rather than metadata), the Shelf recent-study detail line (T26), composer radii (T26, DS-19), Sign out and New session pending (T29, IX-04; `SubmitButton` is ready), hand-built field hints in intake and admin forms (T29).

## Current state

**Changed:** primitives in `src/app/_components/{button-look.ts,button.module.css,segmented-control,language-switch,notice,field,page-state,meta-list,route-error-state}`; tokens and font chain in `globals.css`; shell, access, landing, admin, leader, study and synthetic surfaces migrated; error, loading and not-found routes on `PageState`; `localizedHref` in `src/lib/i18n/locale.ts`; unit guards `design-tokens` and `localized-href`.

**Proof:** format:check, lint, typecheck, typecheck:fresh, check:boundaries, check:sql (28 migrations), scan:secrets, lint:agents pass; unit 938/938 (4 token-guard and 5 localizedHref cases new). Demo e2e (private port 3202, `PW_WORKERS=2`): rtl + layout matrices 41/49 then the 8 fixes 8/8; full suite 186/194, the 8 fixes `--last-failed` 8/8, then a clean full rerun on the final code 194/194 (22.5 min). Main e2e (`UNIMIND_E2E_PORT=3230`): 39/39 on a clean `.next` (two earlier runs right after the demo server failed 1 and 4 tests from the demo-mode `.next` cache: anonymous unit URLs rendered the synthetic runtime and health returned 404; a clean cache passes all). `test:env-build` passes with the client secret scan. Rendered: 4 capture rounds at 1440/768/390/320, EN/AR, light/dark (`.local/shots/r1`-`r7`, untracked): bar 64px desktop and 768, 52px phones; language control 89x44; no horizontal overflow.

**Review:** self-review; the overseeing session reviews the candidate.

**Approved commit:** PENDING (material UI; the overseeing session approves under the delegation).

**Remaining:** the overseeing session reviews the rendered candidate, records `Approved commit:`, opens the PR and runs required CI.

## Next action

Overseeing session: review the pushed branch `claude/wp03-t25-cobalt-primitives`, approve the rendered candidate, open the PR.
