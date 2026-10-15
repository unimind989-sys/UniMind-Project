# WP03-T13 — B01/M53 crowded study example

The demo now includes a prepared Anatomy case with **12 sessions and 24 sources**, including long English and Arabic names. This lets the audit exercise a crowded workspace. It also revealed a practical layout problem: the session list was squeezed between its action buttons. The repaired list gets the full panel width beneath New session and Privacy.

This study-density slice is locally complete. **M53 remains partially complete** until multiple isolated campaigns are exercised; **M67 output variety** remains separate. Work is uncommitted on `codex/frontend-refinements`, base `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`. The whole frontend candidate remains MATERIAL/PENDING/NOT_READY.

## Behavior and boundaries

The prepared case uses the existing local `fixture=dense` entry for the known Anatomy unit, after the normal synthetic account, consent and availability checks. It adds fixed invented records once per document. Existing sessions, selected session, unsent text, study language, privacy and access state survive preparation and subsequent navigation. A fresh unprepared document retains the ordinary sparse example. Hosted entry ignores the fixture; its real server, database, membership and storage guards are unchanged.

Session 12 opens its own replies and evidence, with the correct exchange, locale and return path. Other units cannot reveal those sessions. The first two evidence identities, source titles and excerpts stay unchanged. Deactivating a source leaves historical evidence available while excluding new dependent answers and blocking generation. In the prepared library, one source becomes inactive and the other twenty-three remain ready.

The only layout change moves the existing Privacy link beside New session before history and gives history its own full-width flex row. Long names wrap naturally. No privacy capability or action label changes. This preserves DESIGN.md's intrinsic wrapping and scoped navigation rules; the whole candidate's separate material acceptance remains pending.

The guide explains preparation, reset and limits. Runtime and downloadable manifest agree. Only `preparedStudyDensity` is added to JSON; catalog, calendar and all other previous fields are unchanged. All nine ZIP members match their local files, with changes limited to README, walkthrough and JSON. The generator includes the same manifest for future pack preparation.

## Verification

- **14 final native browser cases pass:** ten new English/Arabic journeys covering density, late-session evidence, drafts/language, deactivation, denied scopes and reflow, plus four existing Mathematics and clock regressions.
- **6 distinct standard-runtime cases pass:** two new hosted-exclusion journeys at corrected final test bytes, plus four prior Mathematics/example journeys from the preceding run. A document reload receives the existing exact missing-page rejection with no source articles. No API, server-action, foreign-host or paid-provider request is made by the synthetic hosted journeys.
- **18 unit and 2 workspace-scope security cases pass.** Repository lint, normal/fresh TypeScript, module boundaries, source/test/guide/pack formatting and diff review are recorded in the binding. Passing unaffected checks are reused with their limits.
- **32 reflow combinations** cover English/Arabic, light/dark, 1440/768/390/320px and normal/doubled root font size. This simulates enlarged text; it is not a real browser-zoom test. Keyboard targeting, full-width history, source title visibility, clipping and horizontal overflow checks pass. Affected-main Axe passes; whole-page accessibility is not certified.
- The side browser confirms the English history, exact session 12 evidence and long Arabic source names. The owned demo is restored on loopback 3101 for review.

The separate reviewer examined fifteen final source/test/guide/pack inputs and preserved all earlier test bodies and 158 prior repository evidence files. Its follow-up saved the final hosted hash and corrected expectation explanation before ending at a usage limit. That exact receipt is retained; the reviewer did not execute tests or inspect the live UI. Executor inline review also covers the small final delta: the test now expects the standard server's existing Page not found response and zero articles after reload. Both cases pass; no product behavior changed in that correction.

Rejecting tests and initial expectation mistakes remain in the repair folder. Arabic glyph ink extending beyond a line box with visible CSS overflow was initially mistaken for clipping; the assertion now checks actual clipping while retaining width, ellipsis and page-overflow checks. The narrow history was a real visual issue: its width assertion failed before the layout repair and passed afterward. The initial hosted reload expectation confused the native demo's login redirect with the standard server's missing-page rejection; the exact standard rejection is now tested. These are recorded separately from demonstrated product defects.

All data and services are local synthetic/mock with invalid service targets and zero provider budget. This is not proof of real retrieval, production capacity or production authorization. The original merged audit and approval are unchanged.

## Rendered result and handoff

![Crowded study history with readable full-width session titles](<E:/Unimind audits/flow audit/Merged/repairs/B01-M53-study-density/density-result-en.jpg>)

[Long Arabic source names](<E:/Unimind audits/flow audit/Merged/repairs/B01-M53-study-density/dense-sources-ar-long.jpg>), [session 12 evidence](<E:/Unimind audits/flow audit/Merged/repairs/B01-M53-study-density/dense-session12-evidence-en.jpg>) and [the repair folder](<E:/Unimind audits/flow audit/Merged/repairs/B01-M53-study-density>) retain screenshots, DOM, before copies, rejected/passing reports and package parity. The [source binding](2026-10-12-merged-b01-m53-study-density-source-binding.json) binds final inputs, review provenance, preserved files and artifact checks.

Policy v10 conservatively retains whole-checkout R3/protected scope, one worker and no nested worker. Whole material acceptance, broad CI and external delivery remain held. Rollback restores only this slice's changed paths from before copies and removes its new helper, unit test and two evidence files, preserving earlier repairs.

The next M53 slice is **multiple campaigns with separate requests, targets and receipts**. M67 follows as a separate output-variety repair. No branch change, commit, push, PR, merge or deployment has occurred.
