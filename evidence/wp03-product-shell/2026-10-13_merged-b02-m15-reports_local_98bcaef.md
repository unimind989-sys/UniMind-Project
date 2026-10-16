# WP03-T13 — B02/M15 report the selected Chat exchange

Studio's source library no longer offers a report for an earlier Chat answer. Reporting requires an explicitly selected Chat exchange in the current subject. Returning from Studio sources keeps the generated aid and its settings.

**M15 is LOCALLY_COMPLETE. B02 remains IN_PROGRESS**, with M64 quiz-source return next and M75 settings-to-quiz return afterward. This is a narrow existing-contract repair, not a new Studio/source/quiz report type or completion of WP03-T13. The whole frontend candidate remains MATERIAL/PENDING/NOT_READY. Work is local and uncommitted on `codex/frontend-refinements`, base `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`.

## What changed

A pure application selector accepts exactly one canonical positive safe-integer session ID and answer index. Existing Chat links can omit origin; one explicit Chat origin is also accepted. Missing, duplicate, malformed and unsupported origins or identifiers are rejected. Evidence and Report resolve that selection only against sessions belonging to the current subject, and require the selected answer to exist. Neither view falls back to the active session or latest answer.

Studio, embedded Materials and general source views therefore have no unrelated Chat report action. Direct unsupported report/evidence targets expose no submission action or guessed answer. Valid Chat evidence and report links retain their exact selected answer and session/answer return anchor. Report's component key uses the normalized unit/session/answer target: changing the answer resets confirmation and reason; interface language, parameter ordering and unrelated parameters do not select a different object.

The existing reason choices, private-mode qualification, simulated receipt and duplicate-submission protection are unchanged. Only a safe reason is stored in document memory. A fresh document resets that memory; the existing local sign-out/access behavior is unchanged and this slice does not clear all retained review records. No new policy, founder-access grant, endpoint, persistent report, private chat/source text, network request, source locator or provider operation is added. Real workspace identity, membership, release, database and source guards remain untouched; these checks do not certify a real reporting service.

The guide explains supported reporting. README and walkthrough are synchronized; all nine ZIP members match local files, and only those two guide members change. JSON, manifests, dates, catalogs, Studio examples and seven other members remain byte-identical. There is no CSS/layout change. This is OBJECTIVE_PRESERVING against DESIGN.md's exact evidence/report binding, scoped results, native controls and truthful supported actions.

## Proof and limits

- **16 distinct native cases pass:** six new EN/AR cases and ten existing Chat/evidence/report, conflict preview, prepared history, inactive-source and all-six-Studio-format cases. The final two Studio cases and final four target cases are recorded separately. Studio A/B source detours keep the artifact/settings and show no old Chat reporting; generic Materials and quiz source libraries also show no unrelated report. Exact answer selection, locale retention, target-change confirmation reset, receipt isolation and repeat submission are covered.
- Invalid tests enter the actual Report/Evidence view before changing query selectors. They reject missing, duplicate, noncanonical, unsupported, unknown and out-of-range targets. The subject-isolation test switches through the ordinary unit menu to a valid second subject, creates its own answer, then rejects the first subject's session ID. It does not infer isolation from a generic unavailable route.
- **Six standard-runtime hosted cases pass:** two new ordinary-sign-in Studio/Chat-report journeys and four existing exact-conflict-evidence and Studio-return journeys, in both languages. The synthetic flow emits no POST/API/RSC/foreign-host requests or page errors and adds no hosted banner. The owned 3101 demo is stopped before safe mock-only 3100 proof, then restored.
- **27 selector unit cases and two workspace-scope contract security cases pass.** Normal/fresh TypeScript, repository lint, final test lint, boundaries and source formatting pass. Final artifact formatting, secret/readiness and full/incremental diff/preservation checks belong to the binding.
- Report keyboard navigation, both languages/themes and 1440/390/320px reflow pass, with affected-main Axe. This is not browser zoom, screen-reader or whole-page certification. No model, durable privacy/access, production authorization or report-retention proof is claimed.

Independent read-only review covers nine exact implementation/test/guide/package inputs. It confirms unconditional hooks, explicit current-unit lookup, normalized report-key behavior, unchanged privacy/reason/receipt logic, prior test bodies and package parity. Its correction to the amendment's overly broad sign-out-reset wording is resolved. The reviewer does not execute tests or inspect the live UI.

The original EN/AR rejecting cases both found one inappropriate report link. Intermediate reports retain new-test selector and route-render timing mistakes, one observed development rewrite-proxy connection reset during compilation, an incorrect security-file command and a transient formatter write error. Corrections and later checks pass; no initial all-green run, auth repair or guessed proxy cause is claimed. [Execution notes](<E:/Unimind audits/flow audit/Merged/repairs/B02-M15-reports/execution_notes.md>) distinguish those corrections.

## Review and continue

![Studio sources with their own return context](<E:/Unimind audits/flow audit/Merged/repairs/B02-M15-reports/studio_sources_en.png>)

[Selected Chat report](<E:/Unimind audits/flow audit/Merged/repairs/B02-M15-reports/chat_report_ar.png>) and [the repair folder](<E:/Unimind audits/flow audit/Merged/repairs/B02-M15-reports>) retain DOM, images, rejecting/corrected results, before copies and package parity. The [source binding](2026-10-13-merged-b02-m15-reports-source-binding.json) binds current inputs, original approval/frozen audit, independent review and preserved earlier evidence. The loopback demo and a verified review tab remain available.

Policy v10 remains conservatively R3/protected for the inherited whole checkout, one read-only worker maximum/used and no nested worker. Whole preflight remains INCOMPLETE for human-design-acceptance. Broad CI, commit and every external delivery/production action remain held. Rollback restores only this slice's changed before-copy paths, removes its selector/unit/report/binding and restores original task/runbook prefixes; preserve every unrelated repair. Next M64 through a separately scoped amendment. No branch change, commit, push, PR, merge, deployment or paid action occurred.
