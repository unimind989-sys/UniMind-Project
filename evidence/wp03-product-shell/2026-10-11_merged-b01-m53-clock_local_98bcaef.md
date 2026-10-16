# WP03-T13 — B01/M53 demo calendar repair

The demo now uses one fixed calendar: **1 October 2026, 12:00 UTC**, or 15:00 in Cairo. New receipts show that date in both the campaign and History. Ordinary deadlines remain ahead of it; intentionally expired examples show a past date and deny acceptance/upload. The existing loopback simulation note and campaign date disclosure identify the reference.

Ahmed's continuation authorizes this bounded local repair on `codex/frontend-refinements`, base `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`. Work began on 11 October and was recorded into 12 October Cairo time. No commit or external delivery. M53 is **partially complete**: the crowded/long-content fixture work remains open, along with other B01 issues.

## Cause and repair

The actual campaign accepted a new approved-reference submission but dated its receipt 30 September. A minimal public-UI regression reproduced that exact wrong date twice before implementation. Ranked hypotheses were an old receipt timestamp, separate calendar fixtures and device-dependent date formatting. Inspection confirmed the first two; collection formatting already uses Cairo time.

One immutable synthetic reference now supplies normal campaign/assignment/invitation dates, expired dates, fresh receipts and historical sample timestamps. No real deadline, token, authorization, retention or quota rule uses this clock. Quiz countdowns still measure elapsed time independently. The optional shared collection date context changes presentation only and is omitted in hosted synthetic mode; ordinary/default collection behavior is unchanged. No new hosted clock banner or mode explanation.

Independent review also found stale delivery statements in the downloadable guide. The guide, generated README/walkthrough and JSON now distinguish completed historical WP03-T09/T10 candidates from pending current frontend-refinements acceptance and delivery. Historical accepted IDs are unchanged. JSON changes are limited to the calendar and checkpoint description; the nine ZIP entries exactly match the local pack files. This necessary adjacent correction changes review metadata, not product policy.

## Verification

- Twenty focused browser cases pass: six new EN/AR calendar, normal invitation and expired/replayed journeys, plus fourteen existing upload/admin/mobile-chooser/tracking/access regressions. The final six clock cases pass again after a formatting-only test adjustment.
- Both themes, keyboard and disclosure focus, 1440/390/320px, campaign/History agreement, historical rows, disabled/denied work, safe exits, no horizontal overflow and affected-main Axe are covered. This is not a whole-page accessibility claim.
- Four unit files pass 89 cases, including runtime isolation, existing admin contracts, collection date formatting and the calendar/pack contract. Two existing collection-boundary security cases pass. These are mock/local checks, not real data, provider, persistence, production expiry or concurrency proof.
- Repository/focused lint, normal/fresh TypeScript, module boundaries, source/test/pack formatting, secret scanning, readiness and incremental diff review pass. Original task/runbook prefixes remain intact; their inherited whole-file formatting differences are preserved, while the new completion appends pass separately.
- Inline React review and independent `/root/audit_reconciliation` review are clean. The reviewer checked all fourteen changed runtime/test/package inputs, package parity, hosted guards and protected scope. Prior M52 test bodies and protected source remain unchanged.

Retained rejecting/passing JSON reports, traces, before copies, routing, pack verification and DOM/screenshots live in [the repair folder](<E:/Unimind audits/flow audit/Merged/repairs/B01-M53-clock>). The first preflight command lacked the required specific design rationale syntax and remains retained as an incomplete diagnostic; it never established PASS. Whole-checkout material preflight remains incomplete by design because current candidate acceptance and full delivery proof are held. Local checks above do not substitute for those gates.

## Scope and preservation

Slice design disposition: **OBJECTIVE_PRESERVING**, against DESIGN.md's existing truthful status/recovery, personal deadline and small simulation notice. No CSS or layout redesign. Intent was R2/short; actual public-fixture-pack paths widen routing to R3/protected. The task amendment records the protected planning floor, rollback and trust review. Full candidate remains **MATERIAL/PENDING/NOT_READY**.

The unchanged real server/database guards remain the identity/scope authority. Invented accounts, fixture/scenario, file and metadata remain client-controlled synthetic inputs; dates grant no permission. Executed allowed/denied journeys prove mock behavior, no campaign leakage in denied views and loopback GET/HEAD-only isolation without APIs/cookies/service mutations. No storage URLs, private payloads or paid providers are added.

The [source binding](2026-10-11-merged-b01-m53-clock-source-binding.json) records 376 source/test/fixture/doc inputs at aggregate `55f8c0467f68f962b8782fa03eb54b7c23f7ca648bc3bc728af44f63cd023d58`, baseline preservation, fourteen independently reviewed hashes and retained artifacts. The frozen merged audit, approval export, prior M52 evidence and unrelated work remain intact. Roll back only this slice against the retained before copies, including removal of its two new source/test files and evidence; preserve all prior work.

## Rendered result and next work

[Campaign date context](<E:/Unimind audits/flow audit/Merged/repairs/B01-M53-clock/campaign-after.jpg>) and [expired invitation](<E:/Unimind audits/flow audit/Merged/repairs/B01-M53-clock/expired-invitation-after.jpg>) show the same calendar. History shows the fresh receipt at 15:00 Cairo and keeps the historical tracking rows distinct:

![Corrected receipt and declared demo clock](<E:/Unimind audits/flow audit/Merged/repairs/B01-M53-clock/history-after.jpg>)

M53's long/crowded fixture work remains open. B01 also retains M10 catalog, M51 example/review labels, M67 output examples and M69 reference-origin copy. The next bounded repair is M51. The existing synthetic demo remains on loopback port 3101. No branch change, commit, push, PR, merge or deployment.
