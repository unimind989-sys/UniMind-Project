# WP03-T13 — B01/M69 source origin

The queue now tells a Batch Leader whether each item came **from their device** or **from the configured approved reference**. This remains clear when both items have the same PDF filename. The chooser and origin labels work in English and Arabic; submission and processing/review status remain separate.

M69 is **locally complete**, including the V1/F41 reference-language subcase. Ahmed's continuation authorizes this bounded repair on `codex/frontend-refinements`, base `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`. Changes remain uncommitted. B01 and the whole frontend candidate are still in progress.

## Repair and boundaries

Each queue row stores only its client-side entry origin. Picker/drop selections use DEVICE; the existing configured reference action uses APPROVED_REFERENCE. Duplicate detection keeps the first retained row and its key/origin; ordinary edits, cancellation, retry and receipt updates preserve that origin.

Origin does not enter upload arguments, FormData, receipt checks, durable history or real authorization. The same rights declaration, byte validation, requested-item matching, keys and finalization rules apply. Filenames, source titles and the fixed reference byte factory are unchanged. There is no new URL field, storage lookup or reference approval policy. The existing received, processing/review-pending and student-unavailable stages remain separate from reference origin.

The UI uses one small annotation with existing styles. The reference chooser is translated and omits its old storage-URL implementation wording. Hosted synthetic views receive no additional mode banner or explanation. This is OBJECTIVE_PRESERVING against DESIGN.md's per-file intake state and truthful receipt/review contract; it does not establish whole-candidate material acceptance.

## Verification

- Ten focused native cases pass, including four new EN/AR origin/duplicate/locale/rights/cancel-retry cases and six prior collection/access/M52 regressions. The four M69 cases pass again after a formatter-only test change.
- Five standard-runtime cases pass: hosted EN/AR ordinary-sign-in origin/receipt journeys, plus shared mixed-intake, retained-receipt finalization retry and rights-renewal/invalid-byte regressions.
- Both themes, keyboard, 1440/390/320px, identical filenames with different origins, preserved titles, duplicate row retention, renewed rights, cancellation/retry, denied access/private bytes and separate received/pending stages are covered. Affected-main Axe passes; this is not whole-page accessibility certification.
- Four unit files pass 57 cases. Two existing security files pass four cases. Repository lint, normal/fresh TypeScript, boundaries, source/test/guide/pack formatting and diff checks pass. Final artifact checks in the binding record readiness, secret scanning, preserved prefixes and new append formatting.
- Inline React review and independent `/root/audit_reconciliation` review are clean. Nine exact hashes cover runtime, tests, guides and ZIP. Every prior native/hosted test body is unchanged; all nine pack entries match, with seven unrelated members and fixture JSON unchanged.

The two original rejecting reports remain retained. A first side-browser unprepared entry returned a temporary consent error; prepared entry worked and ordinary unprefilled hosted EN/AR sign-in subsequently passed. No auth cause or repair is inferred. Early viewport screenshots overshot to History and are labelled as context; the final pair captures below show the actual origin comparison.

These are local synthetic/mock checks using the existing pinned safe server configuration, `.invalid` service targets and zero provider budget. The hosted test server exited before the owned loopback demo was restored on 3101. There is no real private input, storage/provider call or production verification.

## Evidence and next work

![The same PDF filename with two distinct origins](<E:/Unimind audits/flow audit/Merged/repairs/B01-M69-origin/origin-result-en-pair.jpg>)

[Arabic comparison](<E:/Unimind audits/flow audit/Merged/repairs/B01-M69-origin/origin-result-ar-pair.jpg>) and [the repair folder](<E:/Unimind audits/flow audit/Merged/repairs/B01-M69-origin>) retain rendered evidence, DOM, before copies, rejecting/passing results, traces, routing, pack parity and incremental/full diffs. The source binding (hash manifest removed in WP03-T15; see git history) records 382 source/test/doc/fixture inputs, independently reviewed hashes and baseline preservation. The frozen merged audit, original approval and all prior product repairs remain intact. A necessary adjacent evidence correction renames one external M51 artifact and updates its matching pointer: the repository scanner had mistaken its filename for a provider key. Every artifact byte and M51 source/test hash remains unchanged; the original binding is retained in the before copies and scanner rules are unchanged.

Actual routing is policy v10 R3/protected with one read-only worker and no nested worker. Whole-checkout material preflight remains incomplete because current founder acceptance and full delivery proof are held. Local proof does not replace those gates. Roll back only this slice's changed paths from before copies and remove its two evidence files, preserving all unrelated work.

B01 retains M10 catalog coherence, M53 dense/long fixtures and M67 output variety. Other M41/B04 mobile status work remains separate. Whole candidate remains MATERIAL/PENDING/NOT_READY. No branch change, commit, push, PR, merge or deployment.
