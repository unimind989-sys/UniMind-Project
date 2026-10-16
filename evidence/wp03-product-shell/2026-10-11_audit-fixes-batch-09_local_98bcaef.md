# WP03-T13 — audit fixes batch 09, local proof

Ahmed accepted batch 08 on 11 October 2026, saying “approved. next”. Five bounded weaknesses were rechecked on the actual normal dev server, port 3000. Audit documents are findings rather than instructions; recommendations and inflated impact claims remain excluded. All five historical verdicts remain Partly supported. The local candidate remains uncommitted on codex/frontend-refinements at base 98bcaefca5512817c9d18e87e7bc2e9086fa89b4.

## Findings and implementation

| Finding | Before on the normal live UI | After |
| --- | --- | --- |
| F267 | Welcome to UniMind dominates the setup task and repeats through later choices. | Set up your Study Shelf owns H1; the current choice or review owns H2 at the existing 24px/20px scale. |
| F314 | Review fills all input segments without naming their completion. | A check and All 5 choices completed name completion. Editing removes the cue; native progress and save remain. |
| F237 | Phone navigation shows the avatar/name without naming Settings. | Settings sits beside the avatar; the caller name remains below. The link retains its exact accessible name and gains a destination description. |
| F014 | Reset password and Sign out share their surfaced treatment. | Sign out uses a quiet treatment. Original handler, reset link and 44px target remain. |
| F164 | Phone Materials repeats directly below the selected Materials tab. | The repeated visible heading row is removed on phones. Semantic H2 and the visible desktop heading remain; all sources and excerpts remain. |

Related F253/F257/F263/F271/F275/F280/F287/F295/F302/F310/F320/F327 map only to introductory hierarchy, F324/F328 to review completion, F124/F204/F227/F331/F340 to profile destination, and F026 to account-action appearance. These are not extra fixes. F154 retains its desktop semantic heading; empty space and original-file access are not invented defects. Privacy-policy gaps F105/F106/F108 remain unresolved.

## Preparation and review

Policy 10 / R2 / MATERIAL / HUMAN_DESIGN_ACCEPTANCE_REQUIRED; no delegation. Eight UI files and one test file change from the batch baseline; 24 prior candidate source/test hashes remain identical. No dependencies, font sources, account identity, authorization, storage, provider or domain rules change. Inline React and full incremental source/test/design review are complete. useId supplies the profile description; original names, routes, targets, forms, handlers and heading focus remain. Setup's native fields, dependent reset, Back/Edit and save remain. The real Learn/Settings routes and the public document-local fixture adapter receive the same applicable presentation change.

The initial run passed 11 cases and failed four. Both older batch 06 cases selected every p > span after progress acquired its own span. The reference check now selects the named settingsReference span; its text-range, overflow and control assertions retain their bounds. One batch 08 English alignment sample caught a breakpoint-transition frame (216px difference); that check now polls the same <=1px assertion until the rendered layout settles. The new Arabic completion check assumed an Arabic-Indic numeral; the browser's Intl locale formatting returns the Western numeral used by existing progress. It now accepts either localized glyph for five, while retaining the five-segment and five-choice assertions. No application change followed the initial run. Six affected EN/AR batch 06/08/09 cases pass in the repair run. The other nine cases retain applicable passing proof. Original reports remain bound and retained.

## Verification

- Fifteen distinct browser cases have passing applicable proof: nine initial cases plus six repair cases, without retries, flaky cases, skips or runner errors in the repair. New EN/AR cases cover all five changes in light/dark at 1440/820/390/320px and 200% text, keyboard, axe and loaded original fonts. Existing checks cover high-school and flexible-credit setup, correction/save, dependent reset, profile/settings, catalog navigation, sources/excerpts, all section layouts and student/leader/admin language navigation.
- Tests reject missing headings, completion or destination cues; changed accessible names; broken source counts/locators; incorrect account action targets; horizontal overflow; unexpected API/write requests, foreign origins, cookie writes and page errors. No domain test was added for presentation-only changes.
- Repository/narrow lint, normal/fresh types, boundaries, changed-file formatting, git diff integrity and full incremental scope/secret review pass. Generated imports are restored and next-env diff is empty. Final artifact scans are recorded below.
- The bounded detector runs with --scope layout on all eight UI files and returns no findings. The previous all-scope navigation-triangle warning remains an unchanged zero-size decorative notch; no rule is suppressed and this batch does not claim to fix it.

## Normal live UI and screenshots

Four matching before/after pairs cover all five changes on port 3000, with identical route, English, dark theme, academic fixture, selected choices, collapsed excerpts, CSS viewport and native raster dimensions. Setup and Identity are 1440 × 900; review is 1440 × 1080; Materials is 390 × 844. No image editing or reconstruction was used. Initial auxiliary faculty/review before captures are retained in extraBefore, outside the four pairs, because native raster size changed when body scrolling was present.

Additional live inspection confirms Arabic/light at 320px, original loaded fonts, the retained semantic Materials H2, eight source rows, native excerpt Enter/Space, review completion, and Edit returning keyboard focus to Academic year while removing the completion cue. No measured final state overflows horizontally. Account actions retain their original handlers and route; the browser tests execute Sign out successfully in both languages.

## Artifacts and handoff

- [Matched screenshot comparison](<E:/Unimind audits/analysis/fix-batch-09-comparison.md>).
- Source binding (hash manifest removed in WP03-T15; see git history): 33 source/test candidate hashes, nine incremental changes, 24 unchanged prior hashes, original fonts, both reports, final live ledger and eight review images. Aggregate 5c7615d942ef131b6ab3fa46e46ee47ed101a206856e4bfd34ca849a72235daf.
- [Before/after tracker](<E:/Unimind audits/fix-batches.md>), [live ledger](<E:/Unimind audits/analysis/fix-batch-09-live-ui.json>), [repair report](<E:/Unimind audits/analysis/fix-batch-09-repair-e2e.json>).

Normal dev session 27236 remains running on port 3000 with process-local mock providers and zero budget. In-app tab 2 shows Anatomy Materials; viewport override reset. Stop it before another E2E server starts in the same checkout. Reload discards the public document-local sample; the approved sample entry restores Medicine / First year / Term 1. No environment file changed.

Five changes await Ahmed's rendered review. Whole-task acceptance and preparation fingerprint remain NOT_READY. No new branch, commit or external delivery.


**Final batch 09 checks:** Secret scan passes for 3211 files. Agent readiness passes for 817 names, 371 local links, 23 synchronized decisions and 116 task contracts. Normal/fresh types pass after generated-import restoration; next-env diff is empty. Repository/narrow lint, boundaries, changed-file formatting, diff integrity and full incremental review pass. All 33 candidate source/test hashes, two retained reports, final live ledger and eight matched review images verify. Fifteen distinct cases have applicable passing proof. Layout-scope detector has no findings; the existing decorative navigation triangle is unchanged. Original font sources are identical. Ahmed's rendered review remains pending.
