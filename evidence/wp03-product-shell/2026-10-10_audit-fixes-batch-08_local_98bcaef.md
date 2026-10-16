# WP03-T13 — audit fixes batch 08, local proof

Ahmed accepted batch 07 on 10 October 2026, saying “approved. next batch, also to make it easier for me to review I want before and after screenshots”. Five bounded weaknesses were rechecked on the actual normal dev server, port 3000. The original audits are findings rather than instructions; recommendations and inflated impact claims remain excluded. All five historical verdicts remain Partly supported. Candidate remains uncommitted on codex/frontend-refinements at base 98bcaefca5512817c9d18e87e7bc2e9086fa89b4.

## Findings and implementation

| Finding | Before on the normal live UI | After |
| --- | --- | --- |
| F038 | Inactive Settings tabs are transparent and borderless. | Existing surface, foreground text and 1px control boundary make all four targets visible; selected tab retains its distinct accent. |
| F136 | Subject links have an arrow as their only visible action cue. | Open / فتح appears beside the arrow within the same whole-row link. |
| F274 | Dark selected-language surface is only slightly different from its container. | Accent-soft surface and an existing check icon identify selection; both buttons reserve the icon slot. |
| F156 | Desktop utility title starts 8px beyond the main heading. | Utility and main content share their 24px inset. |
| F365 | Mobile source Return and sample notice occupy separate large rows with default paragraph margins. | Return and unchanged notice form one wrapping context group, using 14px copy, zero paragraph margins and a 44px return target. |

F096/F115 map only to tab affordance; F141 to subject actions; F305 to language selection; F348/F359 only to source row density. Duplicates do not count as additional fixes. Privacy-policy gaps F105/F106/F108 remain unresolved.

## Preparation and review

Policy 10 / R2 / MATERIAL / HUMAN_DESIGN_ACCEPTANCE_REQUIRED. Eight UI files and one test file change from the batch baseline; 24 prior candidate source/test hashes remain identical. No dependencies, font sources, account identity, authorization, storage, source truth, provider or domain rule changes. Inline React review and full incremental source/test/design review are complete. Existing native tabs, full-row links, language names/pressed states, route/hash/draft preservation, source locators/excerpts and Chat/Studio return context remain.

The added language marker initially caused horizontal overflow at 320px with 200% Arabic text. The shared utility row now wraps when necessary. Test transitions now wait for the actual catalog heading, the exact switched unit URL and heading before reopening its native menu, and Studio's actual Shape the result heading/context link before visiting its sources. Assertions retain their original bounds and behavior. Initial proof remains recorded: 6 passed, 11 failed, including the header regression, navigation timing and one cold-start login proxy reset. The complete affected set was rerun after the UI repair: 16 passed, with one new Arabic case following Chat's source link during the Studio transition. A confirmation run failed both cases because I used Studio as the test heading instead of the actual Shape the result copy; that report is retained. Only test synchronization/selector correction changed afterward. Both new EN/AR cases pass in the final confirmation; the other 15 passing cases retain applicable proof without another UI change.

## Verification

- Seventeen distinct cases have passing applicable proof: 15 unaffected repair-run cases plus the two final EN/AR confirmation cases, 80.58 seconds for the confirmation, with zero failures/flaky/skips/runner errors in that final run. Earlier failures remain recorded. The new cases cover all five changes. Affected Settings keyboard/profile/reflow, catalog/resume, source/native-excerpt/context returns and prior batch 07 flows pass. All three role shells preserve language navigation in EN/AR, both themes, 1440/768/390/320px and 200% text.
- New cases cover both themes, EN/AR, 1440/820/390/320px, 200% text, keyboard, axe and loaded original fonts. They reject missing visible cues/selected markers, missing tab boundaries, detached header alignment, missing source notices or incorrect returns, draft loss, horizontal overflow, API/write requests, foreign origins, cookie writes and page errors.
- Repository and narrow lint, normal/fresh types, boundaries, changed-file formatting, diff integrity and full incremental scope/secret review pass. Final generated-import restoration and artifact scans are recorded below.
- Detector reports one pre-existing static false positive at app-shell.module.css:104: a zero-size border triangle for the approved active-navigation notch. It is identical to the baseline and is not a colored card boundary; no detector rule or application styling was suppressed. No new findings.

## Normal live UI and screenshots

Four matched before/after pairs cover all five changes on port 3000. Before images were recaptured after two initial images were cropped while browser resizing settled. Exactly eight UI files were temporarily restored from the pre-batch baseline; backed-up candidate files were restored and verified by hash. Initial images/ledger remain separately retained. Other dirty work was preserved.

Comparison uses identical route, English, dark theme, academic fixture and collapsed excerpts; desktop CSS/raster dimensions are 1440 × 900, Sources 390 × 844. Settings uses the same 390 × 844 CSS viewport and native 380 × 822 raster in both captures. Image bytes are native browser captures, without image editing or reconstruction. Additional live Arabic phone and light-theme checks, native excerpt Enter/Space and exact context return are recorded in the ledger. No measured final state overflows horizontally.

## Artifacts and handoff

- [Matched screenshot comparison](<E:/Unimind audits/analysis/fix-batch-08-comparison.md>).
- Source binding (hash manifest removed in WP03-T15; see git history): 33 source/test candidate hashes, nine incremental changes, 24 unchanged prior hashes, original fonts, all four reports, final live ledger and eight review images. Aggregate 480751b28436d223e319fa7ade0205b8c5b4e0fda50e4072a5dc18df6a0acf57.
- [Before/after tracker](<E:/Unimind audits/fix-batches.md>), [normal live ledger](<E:/Unimind audits/analysis/fix-batch-08-live-ui.json>), [final focused report](<E:/Unimind audits/analysis/fix-batch-08-final-e2e.json>).

Normal dev session 37384 remains running on port 3000 with process-local mock providers and zero budget. In-app tab 1 shows Anatomy Materials; viewport override reset. Stop this session before another E2E server starts in the same checkout. Public document-local fixture is Medicine / First year / Term 1; reload discards it and the approved sample entry restores it. No environment file changed.

Five changes await Ahmed's rendered review. Whole-task acceptance and preparation fingerprint remain NOT_READY. No new branch, commit or external delivery.


**Final batch 08 checks:** Secret scan passes for 3209 files. Agent readiness passes for 815 names, 368 local links, 23 synchronized decisions and 116 task contracts. Normal/fresh types pass after generated import restoration; next-env diff is empty. Changed-file formatting, diff integrity and full incremental scope review pass. All 33 candidate source/test hashes, four retained reports, final live ledger and eight matched review images verify. Seventeen distinct cases have applicable passing proof. The unchanged navigation-triangle detector false positive remains documented without suppression. Original font sources are identical. Ahmed's rendered review remains pending.


## Scoped founder review — batch 08 (11 October 2026)

Ahmed said “approved. next”. This accepts F038/F136/F274/F156/F365 against source aggregate 480751b28436d223e319fa7ade0205b8c5b4e0fda50e4072a5dc18df6a0acf57. Scope: routes:/settings,/learn,/learn/[cohortId]/[unitId],/sources; surfaces:account tab targets, Open cues, shared language selection, header alignment/reflow, source return/notice grouping; states:presented responsive EN/AR public-fixture candidate and matching screenshots. Original batch 08 binding remains unchanged. This is scoped acceptance, not whole WP03-T13 acceptance or commit/external delivery authorization. The next local batch is authorized with before/after screenshots.
