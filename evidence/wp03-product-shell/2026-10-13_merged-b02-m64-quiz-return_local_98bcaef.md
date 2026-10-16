# WP03-T13 — B02/M64 return from sources to the same quiz

Inspecting sources now returns to the same quiz attempt or submitted review. Choices, configuration and score stay with that attempt, and time spent in sources counts against its original deadline. An incomplete or outdated return link gives a clear notice and an Open Quiz exit.

**M64 is LOCALLY_COMPLETE. B02 remains IN_PROGRESS for M75**, the settings-to-quiz return repair. M15 and B01 retain their local completion. WP03-T13 remains IN_PROGRESS and the whole frontend candidate is MATERIAL/PENDING/NOT_READY. Work is local and uncommitted on `codex/frontend-refinements`, base `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`.

## What changed

Starting an attempt creates one document-local inspection key. Inspect sources carries that key and an explicit attempt or review origin. A pure application selector accepts only a single recognized origin and a single key matching this subject's current attempt; review additionally requires submission. The source screen creates a fixed same-subject return destination, and the destination validates the key again. Replacing the attempt, changing subject, ambiguous selectors or opening an old link after a fresh document cannot return to another attempt.

A reserved attempt field without its quiz origin is also unavailable. Quiz context takes precedence over Chat selection, including mixed malformed selectors that name a real earlier Chat answer. These links offer no unrelated Chat report. Ordinary Chat/Studio source links keep their existing behavior; the M15 Chat selector is unchanged. Tokenless ordinary links to the current quiz retain their established meaning. Keys name synthetic objects and grant no permission; supplied return URLs are ignored.

An unsubmitted attempt that expires during a detour immediately uses the existing unscored outcome, with no editable answers or Submit action. A submitted timed review keeps its immutable score after the old deadline. This does not add expired-answer review, durable history or a new scoring rule. The fixed shared source pool remains illustrative rather than question-specific citations. M75 and the B03 expiry/configuration learning-loop work stay separate.

No CSS, layout, fixture quiz bank, scoring/configuration module, real authorization or storage guard changes. The slice is OBJECTIVE_PRESERVING against DESIGN.md's exact scoped quiz/evidence context, native controls and truthful failure states. Guide copies are synchronized; all nine ZIP members match local files, only README/walkthrough change, and JSON/manifests/seven other members remain byte-identical. The guide's obsolete fixed 60-second wording now reflects the existing selected sample duration; no timer policy changes.

## Proof and limits

- **19 distinct native browser cases pass:** eight new EN/AR cases for partial attempts, submitted reviews after the deadline, replacement/stale destinations, timed detours/expiry, missing/duplicate/unknown/foreign/mixed selectors, locale retention and fresh-document reset; eleven existing M15, six-Studio/default quiz/score/source-review and timer/configuration cases. The invalid cases create an owned Chat answer before testing mixed selectors and switch through the public unit menu before testing foreign attempts.
- **Six ordinary-sign-in standard-runtime cases pass:** two new quiz attempt/review journeys and four existing M15/M67 Studio/source/Chat-report journeys. They emit no POST/API/RSC/foreign-host request or page error. The owned 3101 demo is stopped before the safe mock-only 3100 run, then restored.
- **67 unit cases pass:** 53 origin-selector cases, including all 27 inherited M15 cases, plus fourteen unchanged quiz-fixture cases. Two unchanged workspace-scope security contract cases pass. These are synthetic contract checks, not production authorization certification.
- Keyboard return and recovery, both interface languages/themes, 1440/390/320px reflow and affected-main Axe pass. The bounded side-browser inspection covers English quiz sources and Arabic submitted review. No true browser zoom, screen-reader or whole-page accessibility certification is claimed.
- Normal/fresh types, repository and final affected-file lint, boundaries and source formatting pass. Final artifact formatting, secret/readiness, full/incremental diff and preservation checks are recorded in the source binding.

Independent read-only review covers ten exact implementation/test/guide/package inputs and verifies prior-body preservation. It identified the missing-origin/mixed-selector gap, which is corrected and exercised with a real owned Chat target. The only deliberate inherited browser-body change follows the quiz's public Inspect sources link instead of its obsolete generic href; all assertions remain. No reviewer tests or live UI proof are claimed.

Initial rejecting, assertion, mock-clock, route-render, formatter and test-command failures are retained in [execution notes](<E:/Unimind audits/flow audit/Merged/repairs/B02-M64-quiz-return/execution_notes.md>). Two intermediate reports contain failed test expectations; their final corrected cases pass separately. No initial all-green run or whole-candidate PASS is claimed.

## Review and continue

![Quiz sources with the matching attempt return](<E:/Unimind audits/flow audit/Merged/repairs/B02-M64-quiz-return/quiz_sources_en.png>)

[Arabic submitted review](<E:/Unimind audits/flow audit/Merged/repairs/B02-M64-quiz-return/quiz_review_ar.png>) and [the repair folder](<E:/Unimind audits/flow audit/Merged/repairs/B02-M64-quiz-return>) retain images, DOM states, before copies, failed/corrected results and pack parity. The [source binding](2026-10-13-merged-b02-m64-quiz-return-source-binding.json) binds final inputs, original approval/frozen audit, independent review and all prior evidence. The restored loopback demo and a verified review tab remain available.

Policy v10 remains conservatively R3/protected across the inherited checkout, one read-only worker maximum/used, no nested worker. Whole preflight remains INCOMPLETE for human-design-acceptance. Broad CI, commit and every external delivery/production action remain held. Restore only this slice's twelve changed before-copy paths and remove its two new report/binding files for rollback; preserve inherited record prefixes and unrelated work. Next M75 through a separate amendment. No branch change, commit, push, PR, merge, deployment or paid action occurred.
