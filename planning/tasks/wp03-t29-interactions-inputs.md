# Task record: WP03-T29 repair interactions and input semantics

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T29

**Status:** [~]

**Outcome:** Every repaired control has an observable, tested outcome: a failed auth action keeps the typed email, New session and Sign out cannot be pressed twice, Batch Leader intake explains its disabled actions and guards the queue, Subjects search announces its count, Quiz numbers accept Arabic-Indic digits, and every input carries the right type, keyboard hint, autocomplete and error wiring.

**Acceptance:** [runbook WP03-T29](../../docs/runbooks/poc-execution-runbook.md#wp03-t29--repair-interactions-and-input-semantics)

**Owner:** Claude Code sub-agent under the overseeing session (WP03 delegation; selected speaker Ahmed)

**Branch:** claude/wp03-t29-interactions-inputs

**Updated (UTC):** 2026-10-18T22:30Z

## Contract

**Dependencies:** WP03-T25 (primitives `SubmitButton`, `Field`, `Notice`), WP03-T26 (shared `Disclosure`, Chat, Shelf, intake). Findings IX-01, IX-04, IX-08, IX-09, IX-11 to IX-16, IX-24 to IX-27, IX-29, IX-31, IX-32, IX-35 and the input inventory.

**Inputs:** [interactions audit](../../docs/reviews/wp03-refinement/audits/interactions.md) (primary spec), [plan](../../docs/reviews/wp03-refinement/plan.md) T29 section, `DESIGN.md`.

**Files:** auth form and the three sign-out forms; Chat sessions menu; Batch Leader intake, queue row and flow hook; leader home; Subjects (`study-shelf`); Quiz setup and `quiz-fixture.application`; Studio; admin decision list and form; synthetic admin operations; landing flashcard; academic settings; report; copy files; tests.

**Protected paths:** none. Auth form presentation only: no Server Action, result shape, guard, RLS, storage or demo-isolation change. WP03-T28 invariants kept (`prefetch={false}` on other-language links, hidden `locale` input in every sign-out form, reserved-domain refusal in the Server Action).

**Verify:** `corepack pnpm check`; unit `quiz-fixture`; affected demo specs, then the full demo suite (`PW_WORKERS=2`, private port 3502); `UNIMIND_E2E_PORT=3530 corepack pnpm test:e2e`; `corepack pnpm test:env-build`; one bounded rendered check at 390 and 1440, EN/AR.

**Pass:** each repaired control has an observable outcome proven by a test; no accessibility, RTL, denial or journey assertion weakened; required CI green.

**Rollback:** revert the squash commit (presentation, client behaviour, copy and tests only; no data or configuration).

**Hard stop:** any change to a Server Action's authorization or result shape, a guard, RLS, storage or demo isolation; a new dependency; any paid action.

## Steps

- [x] Auth inputs: keep the email after a failed action, input semantics, password toggle, consent error wiring; pending Sign out and New session.
- [x] Batch Leader intake: "To submit" checklist, cleared-permission announcement, `beforeunload`, state-only live text, drop zone, focus after Cancel, field wiring.
- [x] Subjects search count and landmark; Quiz numbers with Arabic-Indic digits, validated on blur and Start.
- [x] Studio: locked configuration while preparing, focus after Cancel, Depth and size chevron.
- [x] Admin: empty-state copy by cause, inline decision-form errors, expiry `min` and time zone; synthetic one-effect buttons.
- [x] Remaining inventory: landing flashcard, academic selects, report label, leader campaign rows.
- [x] Tests, full verification, rendered check, push.
- [ ] Overseeing session: review, rendered approval (`Approved commit:`), PR with required CI (including `database-ci`), merge.

## Decisions

- IX-01: the email stays uncontrolled and its `defaultValue` follows the last submitted email (set in `onSubmit`), so React's post-action form reset restores it and clears the passwords. Chosen over a controlled field (the brief's preference) because a controlled field replaces text typed before hydration with the empty state on the next render; no action or result-shape change. A real-mode e2e proves it and fails without the fix.
- IX-04: one `SignOutForm` (hidden `locale` input and `SubmitButton` inside the form, T28 invariant) for consent, welcome and Settings; New session (real) is a `SubmitButton`. Both are real-mode only, so the proof is in the database e2e (CI) with the action response held 1.5 s through `route.fallback()`, keeping the response inspector.
- IX-08: the "To submit" list shows next to Submit while something is missing (description, permission, a ready file) and describes Submit and Retry. No inline description error: a blur error would push the checkbox and Submit down while a press is in flight; the list says it instead.
- IX-09: `beforeunload` while uploading or while a sendable file is unsent; files that can never be sent do not hold the page. In-app navigation is not intercepted.
- IX-13: Quiz numbers are `type="text" inputMode="numeric"` with `parseQuizNumber` (Arabic-Indic and Extended Arabic-Indic digits, Arabic decimal separator); errors appear on blur or Start, Start is no longer disabled by an invalid value (it shows the errors and focuses the first field), arrow keys still step within the range, and a press on the setup actions keeps focus in the field so the blur error cannot move Start under the pointer.
- IX-16: password toggle and landing flashcard keep their switching names and drop `aria-pressed` (the flashcard's flipped look moves to `data-flipped`).
- IX-26: the empty-queue line names its cause: a search miss, a search that misses only in the current filter, or an empty filter.
- IX-27: decision-form errors are inline (`Field`), localized and focus the first field; the hold expiry has `min` at the review clock (the demo's fixed clock, so demo dates stay valid; the device clock on real pages, set on focus) and refuses an earlier time on Review, matching the database; the hint names the device time zone.
- IX-32: the campaign row keeps one link ("Open requests", described by the title); the Subjects "Ready" pill was already gone (T26). IX-29 was done in T27 (Privacy for students only).
- IX-35: the synthetic one-effect buttons (cohort review, campaign creation, saved catalog draft) disable after their effect. The synthetic admin band's Sign out (real admin signs out in Account) is left: removing it rewrites four admin journeys and is demo-shell parity, not an interaction defect.
- Studio "Depth and size" and Chat's two inline disclosures use the shared chevron icon instead of the native marker (both CSS copies kept in step). They stay inline `<details>`: the shared `Disclosure` is for floating menus and closes on outside press.

## Current state

**Changed:** see Files and Decisions; commits `840eb0a` to the branch head. New: `(auth)/_components/sign-out-form.tsx`, `parseQuizNumber`, `tests/e2e/demo/interactions.spec.ts`. Also in scope as small items: the Arabic Report action now stays on the citation row at 360px (MD-10 partial, layout only: 4px column gap and 12px chip padding on phones), product `.field` controls take `Field`'s disabled look, the composer's privacy line describes the message field, and the Arabic report confirmation matches the English one.

**Proof:** `corepack pnpm check` passed (unit 1,046/1,046, 19 new parser cases); `typecheck:fresh` passed. Demo e2e on port 3502, `PW_WORKERS=2`: new interactions spec 8/8; full suite 208/209 (the one failure, a quiz path test pinning the old disabled Start, updated), then `--last-failed` 1/1. Main e2e (`UNIMIND_E2E_PORT=3530`, clean `.next`): 44/44; the new failed-sign-in test fails without the fix (email "" instead of the typed address). `test:env-build` passed with the client secret scan. Database e2e not run locally (CI `database-ci`): it now asserts the pending, disabled Sign out and New session with the action response held 1.5 s. Rendered check (`.local/shots/t29`, untracked): intake, quiz, Studio, admin form, Subjects and registration at 390 and 1440 in EN/AR, no horizontal overflow; Arabic reply actions at 360x640 measured on one row (169 + 4 + 100px in 278px).

**Tests changed (pinned old behaviour):** login `autocomplete` "email" to "username" (IX-14); quiz count/duration role `spinbutton` to `textbox`, `min`/`max` to `inputmode`, disabled Start to Start validation with focus (IX-13); landing flashcard `aria-pressed` to its switching name (IX-16).

**Review:** self-review of the full diff (scope, secrets, T28 invariants); independent review not required (no protected path).

**Approved commit:** PENDING (material UI: small; the overseeing session reviews the rendered candidate).

**Remaining:** IX-35's second half (the synthetic admin band's Sign out versus real admin) left by decision; database e2e proof waits for CI.

## Next action

Overseeing session: review the branch, record `Approved commit:`, open the PR and merge on green required CI.
