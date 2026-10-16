# WP03-T13 revised student workspace — local candidate

Prepared 6 October 2026 at 16:46 UTC by Codex `/root`, selected speaker Ahmed. This records local technical proof for the approved implementation request; rendered founder acceptance remains pending.

## Candidate and authorization

- Branch: `codex/frontend-refinements`; base HEAD: `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`.
- [WP03-T13](../../planning/tasks/wp03-t13-student-entry-navigation.md) is the only selected task. Manual Sol High block 1; no delegation or Desktop-model certification.
- All student changes are uncommitted. Ahmed's hold applies to every continuing agent: commit, push, PR, merge and deployment each require his instruction. Earlier approved landing commits remain intact.
- Final envelope: policy 10, R2/Short, docs/frontend/runtime/tooling. Design disposition MATERIAL, inline review complete, no unresolved technical finding. Founder receipt PENDING; preparation fingerprint NOT_READY. Actual-diff routing reports `HUMAN_DESIGN_ACCEPTANCE_REQUIRED`.
- [Earlier entry evidence](2026-10-06_student-entry_local_98bcaef.md) is explicitly superseded for this revision. Passing proof below belongs to the new source snapshot.

## Implemented behavior

| User requirement | Result and rejecting proof |
| --- | --- |
| Better space use throughout product sections | Shared shell uses the available width with 24px desktop gutters. Shelf catalog no longer reserves an instructional sidebar. Chat uses the full workspace; its preference header fits the panel width. Studio loses its width cap while retaining its capabilities. Quiz setup uses two desktop columns, one on mobile, with a centered Start action. EN/AR geometry checks cover Study, Subjects, Materials, Chat, Studio, Quiz and settings at 1440/768/390/320px, both themes and 200% text, plus internal Chat overflow and WCAG A/AA axe checks. |
| Clean Study and Subjects | Remove Study's redundant tool-guide block and Subjects' Academic settings navigation. Study keeps the existing start/resume purpose; Subjects owns search and current-period catalog. Both locales assert the removed content is absent. |
| Recognizable student profile | Existing caller account name and a circular initial replace the generic Student nav label. Synthetic fixtures use an explicitly public sample name. Existing own-account reads supply real names after the existing guard; no identity/role authority is introduced in the client. Both locales assert name/initial and the single profile destination. |
| Independent settings views | Native tabs expose only the active panel, support deep links and keyboard movement, and preserve unfinished academic edits while switching views. Theme and privacy use radio choices. Academic hierarchy editing keeps its existing selects and validation/save seam. EN/AR tests assert one visible panel, retained draft, keyboard focus and identity actions. |
| Scoped unit switching and material action | Current-cohort authorized subjects alone appear as direct links; switching preserves the active tool and closes the chooser. Tests reject Veterinary/Biology/Flexible fixture leakage and cross-unit Chat mixing. Remove the redundant material-details link because the Materials view already embeds the Sources list; source viewer links remain. Existing preview catalog scope/locale regression passes. |
| Larger Chat and persistent preferences | Full-width transcript and composer; output language appears once in the header and carries across new sessions independently of interface locale. Source citations open the accessible excerpt dialog and restore focus. Citation help appears on first visit and can be dismissed; only an anonymous versioned help-seen flag is written locally. Tests cover citations, focus, new sessions, locale/drafts, interruption and hint dismissal. |
| Configurable quizzes | Native Untimed/Timed and Easy/Medium/Hard choices, numeric count and custom minute duration. Public fixture bank contains six different questions per difficulty; valid count is 1–6, timed duration 1–240 minutes. Choices control question content, attempt size, score denominator and captured deadline. Expiration is checked again on submit. Tests cover invalid input, chosen difficulty/count, three-minute expiration, untimed score/review and centered Start. These fixture bounds do not define future production policy. |
| Preserve prior scope | Progressive setup, editable review, reset/validation, language controls for all product roles and Study/Subjects separation remain verified. Landing and login/access implementation are absent from the diff. Studio functionality stays unchanged. |

## Passing verification

All service inputs are deterministic mocks or public synthetic fixtures; zero paid capacity. No real provider/account/database mutation, new dependency or schema change occurred.

- **20 distinct native browser cases passed**, aggregated across scoped runs, not a full-suite claim: progressive setup EN/AR (2); product language student/leader/admin (3); setup/edit/theme EN/AR (2); Studio artifacts/default untimed quiz/score/source EN/AR (2); private future exchanges/scoped unit isolation/custom timed expiry (1); direct Send/draft/locale/language/history/Studio interruption EN/AR (2); canceled stream EN/AR (2); revised profile/settings/unit/citation/help EN/AR (2); quiz parameters/invalid/timer/centering EN/AR (2); all-seven-section geometry/reflow/axe EN/AR (2).
- Native commands use `UNIMIND_DEMO_REUSE=1 corepack pnpm exec playwright test --config=playwright.demo.config.ts tests/e2e/native-product-demo.spec.ts` with focused `--grep` expressions. The initial twenty-case run passed fifteen and rejected five. Scoped follow-ups resolved old fixture selectors and asynchronous route assertions. The final profile EN case passed, then AR passed after waiting for the chosen subject heading before returning. No runtime workaround was added for test timing.
- After the CSS-only two-column quiz correction, rerun `--grep 'workspace revision.*quiz count|workspace revision.*all student'`: **4 passed**. After the mobile Chat preference-width correction, rerun `--grep 'workspace revision.*all student'` with stronger internal-overflow assertions: **2 passed**. These replace earlier geometry proof; other passing cases remain valid for unchanged behavior and inputs.
- Normal configuration: `UNIMIND_E2E_USE_WEBPACK=1 corepack pnpm exec playwright test --config=playwright.config.ts tests/e2e/hosted-synthetic-login.spec.ts tests/e2e/study-shelf.spec.ts --grep 'hosted student: study memory|a valid direct deep link remains stable'`: **2 passed**, exit 0. Covers hosted synthetic study memory, locale, sign-out, refresh/new-document isolation and direct preview catalog scope/locale stability.
- `corepack pnpm exec vitest run --project unit tests/unit/quiz-fixture.test.ts tests/unit/account-settings.test.ts tests/unit/account-supabase.test.ts tests/unit/catalog-journey.test.ts tests/unit/synthetic-login.test.ts`: **60 tests / 5 files passed**, exit 0. Quiz proof checks representative counts, different difficulty content, locale-stable scoring, invalid configurations, captured configuration independence and exact deadlines; account/catalog proof preserves authorized behavior.
- `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm typecheck:fresh`: exit 0, repeated after the final CSS/test correction. `corepack pnpm check:boundaries`: exit 0, reused because subsequent CSS, test assertions and documentation change no module/import seam.
- Changed-file Prettier check, final `corepack pnpm scan:secrets`, `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`, actual-diff routing and `git diff --check`: exit 0. Final diff/stat and new source/test files reviewed inline, including changed-file secret and scope risk.
- One bounded Impeccable detector reports one warning: `.side-tab` matches the unchanged `border-inline-end: 6px solid` navigation-selection triangle. It is inherited from the approved baseline, not an introduced card treatment. Retained with a documented rationale; no detector rerun/config repair or skill adaptation.
- Inline React review: native radio semantics and unique IDs; independent own-name context; retained panels use `hidden`; preferences remain document state; deterministic quiz rules live in an application module; no client real-provider/identity authority or ordinary-chat storage. No actionable finding remains.

This proves affected local states, not every platform route or the entire application suite. Broad `pnpm verify`, exact-head CI and external/production proof are deferred to separately authorized delivery.

## Rejections and corrections

Completed type checks initially rejected optional profile prop types, the empty attempt-state type, and an optional Next Link handler passed as explicit `undefined`. Correct types and conditional handler spreading resolved them; both type checks then completed successfully. Early commentary that reported those checks before completion was corrected in the conversation.

The expanded chat header initially squeezed the transcript at a shorter desktop height. Combining header preferences and setting a usable transcript minimum fixed it; citation interaction and geometry cases pass. Initial native tests used obsolete cross-program unit choices, fixed 60-second assumptions and stale selects. They now exercise authorized same-cohort navigation and configured timing. A test that immediately returned before the new subject rendered was corrected to await the selected heading.

The mobile rendered review then found horizontal overflow inside Chat that document-width assertions did not reject. Read-only DOM measurement isolated the 396px preference control inside a 322px header. Constraining its maximum width lets native choices wrap. Geometry tests now reject internal conversation overflow at each tested width and 200% text, rather than only checking the document. Final documentation checks also rejected new evidence names and free-form Established facts; names were corrected to the repository convention and the formal fact field reset to NONE. Readiness then passes.

The generated `next-env.d.ts` drift from serial server transitions was inspected and restored to HEAD; no generated-cache changes are included. Normal tests ran after stopping the first demo server; a fresh task-owned demo was started afterward. Side-browser tabs invalidated during restart were replaced with a fresh tab through the normal synthetic login/consent flow. CSS Fast Refresh resets document-local demo identity; only settled, frozen-candidate captures count as rendered proof.

## Bounded rendered review

Codex side-browser review covers English desktop Chat, independent academic settings and configured quiz; Arabic dark mobile settings and Chat. Quiz's unnecessary vertical stack and a demonstrated internal mobile Chat overflow were corrected, then affected automated checks and bounded rendered confirmations were repeated. Source excerpts, first-visit help and keyboard behavior have direct native test proof. The mobile viewport is reset after review.

Ignored local screenshots in `.local/wp03-t13/review/`:

- `revision-chat-en-desktop.png`
- `revision-settings-en-desktop.png`
- `revision-quiz-en-desktop.png` (final two-column confirmation)
- `revision-settings-ar-dark-mobile.png`
- `revision-chat-ar-dark-mobile.png` (settled workspace)

Preview: `http://127.0.0.1:3101/login?lang=en&email=student@example.invalid`; task-owned demo session 2934 remains running. This is the existing normal synthetic entry, not real authentication. Reload clears document-local study state. Stop this server before starting a competing Next server in the same checkout.

## Binding and handoff

The companion source binding (hash manifest removed in WP03-T15; see git history) records the base HEAD, branch, sorted changed implementation/test paths, their SHA-256 hashes and an aggregate hash. Documentation and evidence are excluded from this implementation binding to avoid self-reference. Reopen only proof whose assertions depend on a changed bound input.

Ahmed's rendered acceptance of this revised material candidate remains pending. Record an exact-scope founder receipt only after he actually accepts it; preparation fingerprint stays NOT_READY until then. Review or apply his next requested revision locally. Commit and every external delivery action remain held. Rollback restores only this slice's uncommitted paths relative to 98bcaef, retaining approved landing commits and unrelated work. Real chat/quiz generation remains unavailable behind the existing production adapters; working sample interactions are fixtures.
