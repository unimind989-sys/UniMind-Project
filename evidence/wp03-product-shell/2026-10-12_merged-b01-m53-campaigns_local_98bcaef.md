# WP03-T13 — B01/M53 separate campaign examples

The local demo now has **three prepared campaigns**—Anatomy, Biochemistry and Physiology—with separate requests, unfinished queues and upload receipts. Two campaigns can request the same file format without one campaign's submission appearing in the other. History identifies the campaign alongside its requested material.

With the earlier clock and crowded-study repairs, **M53 is locally complete**. **M67 output variety remains next**, and B01 is still in progress. All work remains uncommitted on `codex/frontend-refinements`, base `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`. The whole frontend candidate remains MATERIAL/PENDING/NOT_READY.

## What changed

The prepared leader entry adds two fixed invented assignments to the original Anatomy example. Each has its own exact campaign and requested-item IDs, with three PDF/WAV/PNG requests. Long English and Arabic campaign names use the existing wrapping layout. The ordinary fresh demo keeps one campaign; hosted entry ignores preparation. Unknown, unprepared extra and wrong-role campaign routes expose no upload action. The existing return-path allowlist accepts only the three exact known sample campaign paths.

The local upload adapter now resolves the selected request instead of inferring its identity from a format or ID suffix. Receipts bind the campaign, request, client key and upload identity. Finalization validates the current role, verification, consent and preparation before checking replay. A successful replay must match the same upload, metadata and rights; tampered or revoked requests cannot reuse an earlier success. Each successful operation adds one scoped submission, with fixed clock dates.

Collection memory belongs to the browser document. Each campaign keeps its own files, source origin, request selection, title, description, rights, keys and receipts through campaign, History and Account navigation. Leaving an upload cancels it; returning restores a safe retry state. Failed finalization retains the receipt, so Retry submission performs no new upload. Sign-out/reset clears collection memory and increments a generation guard to invalidate late callbacks. Existing Admin pending-confirmation memory is preserved.

The shared collection form/queue receive optional draft snapshots. Ordinary real callers retain their existing defaults. Real identity, assignment, expiry, server/database mutation, file safety, raw storage and processing contracts are unchanged. Draft retention is a necessary prerequisite for this prepared case; it does not close M39 or establish durable production drafts. The local finalizer is synchronous: the tests prove retained failed-finalization recovery and remount, not an in-flight real server finalization.

The guide and pack describe preparation/reset and those limits. JSON adds only `preparedCampaigns`; every prior field, including calendar/catalog/study-density metadata, is unchanged. All nine ZIP members match local files; only README, walkthrough and JSON differ. The generator includes the same manifest.

## Proof and review

- **20 distinct native browser cases pass** across the 16-case candidate run and the final six affected cases. Eight new EN/AR journeys cover three exact destinations, same-format submission isolation, separate drafts, interrupted upload, retained receipt retry, sign-out and forbidden routes. Twelve existing study-density, source-origin, clock, edited-description and ordinary queue/History/Account cases remain passing. The two retained-receipt cases pass again after a test-only call-signature annotation; four ordinary queue cases cover the restored original Arabic labels and the shared optional draft seam.
- **Six standard-runtime cases pass:** two new hosted campaign exclusions, two existing study-density exclusions and two ordinary source-origin/upload journeys. Client URL tampering cannot activate extra hosted assignments. The synthetic hosted journeys issue no POST/API/RSC/foreign-host requests or page errors.
- **57 focused unit cases and four collection/workspace security cases pass.** This includes exact receipt/replay tampering and revocation after success. Repository lint, normal/fresh TypeScript, module boundaries, final formatting, secret scanning, readiness and diff/preservation checks are recorded in the binding.
- Both languages/themes, keyboard and 1440/390/320px reflow pass at the affected campaign and collection surfaces. Affected-main Axe passes; this is not whole-page accessibility certification. The side browser confirms English/Arabic lists and the third campaign's exact Arabic title/request scope.

Independent read-only review covers the final runtime/test/guide/pack hashes. It identified an inappropriate direct domain import, changed default Arabic request labels and stale guide wording; all were corrected before handoff. The file-size bound now uses the existing application interface, original default labels are asserted exactly, and the guide retains only M67 as outstanding. The reviewer also requested direct revoked-after-success replay cases; six were added and pass. All prior browser test bodies and all 160 earlier repository evidence files remain unchanged.

The original single-campaign rejecting test, new-test locator/route/timing mistakes and TypeScript failures remain retained. Tests were corrected to use the existing open request disclosure, campaign list navigation, the Identity and access tab and an explicit FormData call signature. A newly introduced unavailable-campaign guard initially showed the generic unit message; it now uses the existing account/scope denial wording. The external manifest updater encountered module-format and transient file-write errors; the guide copies and ZIP were subsequently synchronized and verified. No initial all-green run is claimed.

All checks use fixed synthetic files, mock services, invalid service targets and zero provider budget. No private file, real assignment, storage/provider call, production authorization or production capacity is certified. Whole material acceptance, CI and external delivery remain held.

## Review the result

![Three separate prepared campaigns](<E:/Unimind audits/flow audit/Merged/repairs/B01-M53-campaigns/campaigns-final-en.jpg>)

[Arabic assignments](<E:/Unimind audits/flow audit/Merged/repairs/B01-M53-campaigns/campaigns-ar.jpg>), [third campaign requests](<E:/Unimind audits/flow audit/Merged/repairs/B01-M53-campaigns/physiology-ar.jpg>) and [the repair folder](<E:/Unimind audits/flow audit/Merged/repairs/B01-M53-campaigns>) retain DOM, images, reports, failures, before copies and package parity. The [source binding](2026-10-12-merged-b01-m53-campaigns-source-binding.json) preserves the final inputs, review, original audit/approval and unrelated work. The demo is restored on loopback 3101 for review.

Rollback restores only this slice's changed before-copy paths and removes its new helper, unit test and two evidence files. Policy v10 conservatively retains whole-checkout R3/protected scope, one worker and no nested worker. No branch change, commit, push, PR, merge or deployment occurred. Continue with M67 output variety.
