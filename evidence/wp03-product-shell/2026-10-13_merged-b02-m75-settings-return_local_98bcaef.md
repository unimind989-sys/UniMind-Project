# WP03-T13 — B02/M75 return from Settings to the same quiz

Settings now returns to the quiz the learner was using, with their answers or submitted results preserved. The link names the tool and subject. Opening Settings during a timed attempt does not pause or restart the timer. The synthetic Study page also recognises Quiz as the recent tool.

**M75 and B02 are LOCALLY_COMPLETE.** B02's M15 exact Chat report selection and M64 quiz-source return retain their earlier proof. B01 remains locally complete; WP03-T13 remains IN_PROGRESS and the whole frontend candidate remains MATERIAL/PENDING/NOT_READY. Work is local and uncommitted on `codex/frontend-refinements`, base `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`.

## Behavior and boundaries

One existing document-local destination now records closed Chat, Studio, Quiz setup, attempt and review routes. Attempt/review routes carry the existing inspection key. Review requires a submitted matching attempt. Evidence, reports, Settings and rejected quiz routes cannot overwrite that destination. The application selector stores no locale, arbitrary query, fragment or supplied return URL.

Settings and the synthetic Study page resolve the destination against an available known cohort/unit and its current quiz object. Stale, missing, replaced, duplicate and foreign objects cannot borrow another attempt. The existing permitted study roles retain their returns, including both Admin accounts; the Batch Leader remains denied. Subject names come from the configured catalog. Language changes rebuild the same link in the current interface language.

Selections, scores and absolute deadlines are unchanged. Returning after an unsubmitted attempt expires uses the existing unscored outcome; submitted results remain immutable. Quiz setup returns to its setup screen, but retaining an edited setup draft is separate B03 work. No new history, progress or persistent preference is added. M09 academic-program reconciliation remains separate. Real Study resume still reads the caller's current-cohort open Chat session; the real reader and all auth/database/storage/source guards are untouched.

The synthetic Study page uses the same one recent destination and names Quiz correctly. The longer Settings label wraps as one phrase with an isolated subject name. Two scoped intrinsic-width/wrapping rules correct observed English overflow at320px with doubled text; no layout/control hierarchy changes. This is OBJECTIVE_PRESERVING against DESIGN exact tool/unit context, native returns, intrinsic wrapping and truthful recent-work scope. Only README/walkthrough change in the nine-member ZIP; JSON/manifests/seven other members remain unchanged.

## Evidence

- **29 distinct native browser cases pass:** eleven new M75 cases (eight EN/AR student journeys plus both Admin roles and a denied Batch Leader) and eighteen existing M64 and label-sensitive Chat/Studio/profile/privacy/keyboard/enlarged-text journeys. The final five role/return cases bind the corrected role predicate. The earlier eight-case result remains valid for the unchanged student path.
- **Nine ordinary-sign-in standard-runtime cases pass:** two new Settings/quiz journeys, six retained M64/M15/M67 journeys and the existing hosted memory/locale/sign-out/refresh/new-document case. No POST/API/RSC/foreign-host requests or page errors occur.
- **100 unit and two workspace-scope security contract cases pass.** The 33 new return-selector cases join all53 prior origin cases and14 unchanged quiz-fixture cases. These are synthetic/mock contract checks, not production authorization proof.
- Settings keyboard, both languages/themes,1440/390/320px and100%/200% root text reflow, affected-main Axe and bounded English/Arabic rendered inspection pass. Enlarged root text does not certify browser zoom, a screen reader or whole-page accessibility.
- Normal/fresh types, repository/final affected lint, boundaries, artifact formatting, secret/readiness, full/incremental diff and preservation checks are bound to the final inputs.

Independent read-only review covers12 exact source/test/guide/package inputs. It corrected the initial student-only return predicate to preserve prior Admin behavior. Inherited changes comprise six native label sites/seven contexts, one hosted label and two visible-element filters in old visual tests. All size, overflow, count, accessibility and other assertions remain. The reviewer ran no tests and inspected no live UI. Initial rejecting, malformed-helper URL, narrow-screen overflow and overly broad old visual-filter results remain in [execution notes](<E:/Unimind audits/flow audit/Merged/repairs/B02-M75-settings-return/execution_notes.md>); they are not erased or reported as initial PASS.

## Review and next repair

![Settings names the matching quiz and subject](<E:/Unimind audits/flow audit/Merged/repairs/B02-M75-settings-return/settings_return_en.png>)

[Arabic retained quiz review](<E:/Unimind audits/flow audit/Merged/repairs/B02-M75-settings-return/quiz_review_ar.png>) and [repair artifacts](<E:/Unimind audits/flow audit/Merged/repairs/B02-M75-settings-return>) retain images, DOM states, before copies, failed/corrected results and pack parity. The [source binding](2026-10-13-merged-b02-m75-settings-return-source-binding.json) preserves the original approval/frozen audit, current proof and all earlier evidence.

Policy v10 whole R3/protected, one read-only worker maximum/used, no nested. Whole preflight is INCOMPLETE for human-design-acceptance; broad CI and external/production proof remain held. The restored demo3101 and verified review tab remain available. Restore only this slice's14 changed before-copy paths/remove its two new evidence files for rollback; preserve inherited task/runbook prefixes and unrelated work. Next B03 through a separate controlled amendment. No branch change, commit, push, PR, merge, deployment or paid action occurred.
