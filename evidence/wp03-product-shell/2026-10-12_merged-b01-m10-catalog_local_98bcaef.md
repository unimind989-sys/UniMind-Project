# WP03-T13 — B01/M10 mathematics catalog

The Mathematics demo track now offers **Mathematics, Chemistry and Physics** in both configured terms, with matching English and Arabic names. Science still offers Biology, Chemistry and Physics. Opening Mathematics keeps its own track, year, term and unit identity.

M10 is **locally complete** under Ahmed's continuation of the approved audit plan. The branch remains `codex/frontend-refinements`, base `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`. Changes are uncommitted; B01 and the full frontend candidate remain in progress.

## Change and boundaries

The repair separates the two high-school fixture lists. Mathematics receives its own unit ID, code, bilingual name and synthetic description. Chemistry and Physics retain their existing definitions. The presentation uses an existing neutral brand asset; the current shelf still uses its existing book graphic. No layout, control, CSS, real curriculum or membership rule changes.

Stage, institution, program, year, term and cohort identifiers, source counts, university fixtures and the flexible-credit sample are unchanged. Exact cohort/unit lookup resolves the new Mathematics pair and rejects the removed Mathematics Biology route, foreign-cohort pairs and wrong-term pairs. These are fixture/route checks; real server and database authorization remain unchanged.

The guide now names the configured Science and Mathematics tracks instead of promising a Literary track. It identifies the subject lists as invented demo catalogs. The downloadable catalog and representative Mathematics scope match the runtime; all nine ZIP members match their local files. Only the two guide copies and catalog JSON changed inside the ZIP. Calendar/checkpoint metadata and all other JSON fields remain unchanged.

This slice is OBJECTIVE_PRESERVING against DESIGN.md's configured academic terminology and scoped navigation. The whole candidate remains MATERIAL/PENDING/NOT_READY, with founder acceptance and delivery gates held.

## Verification

- Six distinct native browser cases pass: four new EN/AR catalog and invalid-pair journeys, plus two existing academic hierarchy regressions. Both terms, search and empty results, open/return, locale changes, Science switching and downstream resets are covered.
- Seven standard-runtime cases pass: ordinary hosted EN/AR sign-in, the new shared Mathematics shelf case, and four existing Science/university/veterinary/navigation regressions. The two hosted cases pass again at the final formatted test bytes.
- Both themes, keyboard, 1440/390/320px and horizontal overflow checks pass. Affected-main Axe passes; this is not whole-page accessibility certification. The side browser confirms the English/Arabic shelf and Arabic Mathematics page.
- Fourteen focused unit cases and two existing workspace-scope security cases pass. Repository lint, normal/fresh TypeScript, module boundaries and source/test/guide/pack formatting pass. Final evidence, readiness, secret, prefix and diff checks are recorded in the source binding.
- Independent read-only review covers ten runtime/test/guide/pack inputs. All prior browser test bodies are preserved.

The original rejecting unit/browser reports, initial candidate test mismatches and formatting warning remain retained. The new tests were corrected to use the existing Arabic search label and the existing server missing-page rejection. A standard test-server startup timed out before tests ran; its retry and the final hosted rerun passed. No product startup repair or auth change is inferred.

All checks use local synthetic/mock data, `.invalid` service targets and zero provider budget. There was no real private input, provider/storage call or production verification. Each owned standard test server exited before the local demo was restored on 3101.

## Evidence and next work

![Mathematics track with its corrected subject list](<E:/Unimind audits/flow audit/Merged/repairs/B01-M10-catalog/catalog-after-en.jpg>)

[Arabic shelf](<E:/Unimind audits/flow audit/Merged/repairs/B01-M10-catalog/catalog-after-ar.jpg>), [Arabic Mathematics page](<E:/Unimind audits/flow audit/Merged/repairs/B01-M10-catalog/mathematics-open-ar.jpg>) and [the repair folder](<E:/Unimind audits/flow audit/Merged/repairs/B01-M10-catalog>) retain before copies, rendered evidence, DOM, rejecting/passing reports, traces, routing, pack parity and diff review. The source binding (hash manifest removed in WP03-T15; see git history) binds source/test/fixture inputs, the independent review and baseline preservation. The frozen merged audit, original approval and all prior repairs are intact.

Policy v10 derives R3/protected with one read-only worker and no nested worker. Whole-checkout preflight remains incomplete for material acceptance; local proof does not replace full CI or separately authorized delivery. Roll back only this slice's changed paths from the before copies and remove its new unit test and two evidence files, preserving all other work.

B01 retains **M53 dense/long-content fixtures** and **M67 output variety**. Other batches remain separate. No branch change, commit, push, PR, merge or deployment.
