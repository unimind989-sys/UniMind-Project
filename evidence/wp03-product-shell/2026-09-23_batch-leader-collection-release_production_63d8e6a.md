# Gate report: WP03-T05 Batch Leader collection protected release

**Status:** PASS

**Environment:** Supabase Preview and Vercel Production; deterministic synthetic collection fixtures and mock storage/providers only

**Commit SHA:** implementation merge `00084ed8c0da98585286795167d8c03c25a1ded0`; final corrective merge `63d8e6a5104a9e2ba8a4f87e58cc72da64099ae8`; reviewed heads `d36356a40b7ac4f99e3ffdfab25b565f0d7a3f31` and `5cb38e01b96adf9eb100c3ec3d35ba4a2ad27686`; the final reviewed head and merge resolve to Git tree `fbfaf45d1c7f73373cfbe6d674214f10bdbc405d`

**Release/config fingerprint:** `wp03-t05-63d8e6a-preview`; Vercel Production deployment `dpl_F5kXv2WUEifs1nWC8RRh5d3uEpWt`; Next.js `16.3.4`; synthetic-only; provider mode `mock`; provider budget `0`; real storage, generation, embedding, and transcription disabled

**Migration:** `20260922143605_batch_leader_collection_flow.sql`; normalized SHA-256 `5861a8d0d065ed2cc6220e3c47108e9650f90f6b785bb55b85c9a4d216571b3e`; Supabase Preview project fingerprint `sha256:5575d1c3d806`

**Agent executor:** Codex `/root`

**Human checkpoint:** Ahmed requested end-to-end completion; `aboayman-oss` supplied executor-controlled distinct-account approvals for the exact PR heads under D-22. These approvals satisfy account separation but are not represented as independent review.

**Started/finished (UTC):** 2026-09-22 / 2026-09-23T00:16:27Z

## Scope and acceptance criteria

| Criterion | Result | Status |
| --- | --- | --- |
| Protected source identity | PR #45 reviewed head `d36356a` merged as `00084ed`; corrective PR #46 reviewed head `5cb38e0` merged as `63d8e6a`; the final deployment reports source `5cb38e0`, whose tree exactly equals the final merge tree | PASS |
| Protected delivery | Exact-head runs `35796018638` and `35799810641`, merged-main runs `35796944487` and `35800406837`, dependency audit, Vercel Preview, and distinct-account approvals passed before each merge | PASS |
| Campaign scope | Only the caller-scoped security-invoker campaign function is executable by `authenticated`; active assignment, open campaign, requested item, wrong-campaign, expired, and revocation cases passed pgTAP/application/security proof | PASS |
| Upload boundary | Browser and server validate allowed PDF/WAV/PNG signatures, declared format, advisory MIME, 10 MB limit, server checksum, cancellation, replacement, and retained retry key | PASS |
| Finalization trust | Registration and finalization are service-role-only public wrappers over internal safe-search-path definers; verified caller, assignment, upload ownership, rights, checksum evidence, idempotency, and revocation are transactionally rechecked | PASS |
| Idempotency | Exact replay returns one submission; conflicting reuse, duplicate selection, abandoned upload, stale assignment, and changed rights reject without an extra durable row | PASS |
| Accessible bilingual flow | File input and drag/drop, progress, cancel, retry, validation summary, replacement guidance, lifecycle states, keyboard flow, and English/Arabic labels passed local and production checks | PASS |
| Responsive/RTL | Production English desktop and 390 px Arabic RTL rendered correctly; Arabic document `clientWidth` and `scrollWidth` were both 380 px | PASS |
| Hydration stability | Production proof detected React hydration error 418 from host-dependent dates; PR #46 fixed campaign display to explicit `Africa/Cairo`, added bilingual regression coverage, and final fresh-tab English/Arabic console scans returned no warning or error | PASS |
| Hosted migration | Exact prior ledger head `20260921190508` and target-object absence held; reviewed SQL and one ledger statement committed atomically; normalized hosted hash equals the repository hash | PASS |
| Hosted privileges | Anonymous/authenticated direct access to `unimind_private.collection_uploads` is false; authenticated direct insert to `source_submissions` is false; only the campaign read is authenticated-executable and mutation wrappers are service-role-only | PASS |
| Hosted database hygiene | Fresh Supabase Security Advisor analysis reported 0 errors and 0 warnings | PASS |
| Production routing | `project-xwrez.vercel.app` resolves to Ready Production deployment `dpl_F5kXv2WUEifs1nWC8RRh5d3uEpWt` | PASS |
| Runtime safety | Seven public smoke checks passed; protected Batch Leader route redirects to localized sign-in; final deployment error, warning, and HTTP 500 scans are empty | PASS |

## Commands and durable proof

| UTC date | Command/test ID | Result |
| --- | --- | --- |
| 2026-09-22 | Initial stable-candidate `corepack pnpm verify` | Passed formatting, lint, strict/fresh typing, boundaries, SQL/policy/secret checks, 376 unit, 15 integration plus 2 hosted-only skips, 26 security, 3 evaluation, 5 load, 31 Playwright cases, production build, and client-artifact scan |
| 2026-09-22 | GitHub exact-head run `35796018638` | PR #45 dependency, application, full disposable database/pgTAP/advisor/type-parity, and hosted preview checks passed at `d36356a` |
| 2026-09-22 | PR #45 review and merge | Executor-controlled distinct-account approval recorded; merged as `00084ed` after required checks passed |
| 2026-09-22 | GitHub merged-main run `35796944487` | Application and full disposable database jobs passed at `00084ed` |
| 2026-09-22 | Supabase guarded migration transaction | Expected prior head and target absence held; migration plus one ledger statement committed; head became `20260922143605` |
| 2026-09-22 | Supabase metadata/grant postflight | Hosted normalized hash matched; invoker/definer modes, empty search paths, exact execute grants, and direct-table/write denials passed |
| 2026-09-22 | Supabase Security Advisor rerun | 0 errors and 0 warnings |
| 2026-09-22 | First Vercel production proof | Deployment `dpl_i5qQDyRkEFtJA3RnGJh2HVJCQ4ux` passed smoke and routing but browser console exposed React hydration error 418; closure was stopped |
| 2026-09-22 | Corrective `corepack pnpm verify` | Passed all layers with 378 unit tests and 31 Playwright cases, including the fixed-time-zone regression |
| 2026-09-22 | Corrective focused proof | Collection formatting test and 7/7 collection Playwright cases passed |
| 2026-09-23 | GitHub exact-head run `35799810641` | PR #46 dependency, application, full disposable database, and Vercel Preview checks passed at `5cb38e0` |
| 2026-09-23 | PR #46 review and merge | Executor-controlled distinct-account approval recorded; merged as `63d8e6a` after required checks passed |
| 2026-09-23 | GitHub merged-main run `35800406837` | Application and full disposable database jobs passed at `63d8e6a` |
| 2026-09-23 | Final Vercel production deployment | Exact reviewed source redeployed as `dpl_F5kXv2WUEifs1nWC8RRh5d3uEpWt`, Ready, with release `wp03-t05-63d8e6a-preview`; established public alias moved after protected checks |
| 2026-09-23 | `corepack pnpm smoke:deployment -- --base-url https://project-xwrez.vercel.app --target preview` | Seven public live/ready, write-denial, application identity, synthetic/mock, and icon checks passed |
| 2026-09-23 | Production rendered verification | English desktop and Arabic mobile RTL dates matched Cairo time, no horizontal overflow, no fresh-tab console warnings/errors, and anonymous `/batch-leader` reached `/login?lang=en&next=%2Fbatch-leader` |
| 2026-09-23 | Final Vercel log scans | No error, warning, or HTTP 500 entries for the final deployment |

## Negative, retry, and recovery cases

| Case | Actual | Status |
| --- | --- | --- |
| Caller-RLS containment | Early database CI rejected direct cohort/unit policy widening; the final campaign read stays caller-RLS-scoped without those grants | PASS |
| Private-function reachability | CI rejected wrappers that crossed an ungranted private schema; final public invokers call internal definers only through the service role | PASS |
| Governed audit fixture | CI rejected invalid expiration and missing correlation context fixtures; corrected fixtures prove the intended revocation path | PASS |
| Generated database parity | Authoritative disposable generation rejected stale ordering/nullability; checked-in types were synchronized and exact-head database CI passed | PASS |
| Dashboard editor integrity | The first UI fill corrupted the SQL and PostgreSQL rejected it before execution; the editor was cleared, the complete transaction was clipboard-round-tripped, CRLF-normalized, compared exactly, then run once successfully | PASS |
| Production hydration | Initial public browser proof found error 418; closure stopped, a deterministic time-zone fix passed protected delivery, and the final deployment is console-clean | PASS |
| Rollback | Reassign `project-xwrez.vercel.app` to last-known-good `dpl_k6YpGerq6sT7JzbGacfrpQmYYGp9`; database containment uses revoked execute grants or a reviewed forward repair | PASS |

## Deviations and limitations

- The finish-review worker found trust and state-binding defects that were corrected. Its bounded re-review retry hit the host usage limit, so no independent review claim is made.
- Vercel maps the pinned Node major/minor/patch engine to its supported Node 24 runtime. Builds, public smoke, rendered checks, and runtime logs pass.
- No real storage provider, signed upload target, private material, real student data, paid service, trial, or billable resource was enabled.

## Security and privacy review

- [x] No secret, signed URL, private source text, real student data, provider payload, or unredacted log appears in this report.
- [x] Authenticated callers can read only the caller-scoped campaign seam and cannot execute either upload-registration or finalization mutation directly.
- [x] Service credentials remain server-only; browser payloads expose neither raw object keys nor internal provider/job diagnostics.
- [x] Rights, assignment, campaign/item scope, upload evidence, checksum, actor ownership, and idempotency are revalidated server/database-side.
- [x] Hosted migration metadata, privileges, Security Advisor, public smoke, protected-route rendering, browser console, and runtime logs are clean.
- [x] The release remains synthetic-only, mock-only, provider-disabled, and zero-budget.

## Rollback/disable procedure

Reassign `project-xwrez.vercel.app` to `dpl_k6YpGerq6sT7JzbGacfrpQmYYGp9`, restore release fingerprint `wp03-t04-e85d5a2-preview`, and repeat smoke, protected-route, rendering, console, and error/warning checks. The database migration is forward-only: revoke execute on the collection functions or ship a reviewed forward repair; never remove its ledger row or rewrite shared migration history. No real provider, paid capacity, real-user publication, or Beta unlock rollback is required.

## Decision

WP03-T05 is complete. The final reviewed source passed local, exact-head, merged-main, disposable-database, hosted Supabase, protected-deployment, public smoke, rendered bilingual/responsive, console, and runtime-log gates; merged through protected `main`; and runs on the established public domain in synthetic/mock-only mode. The collection flow is assignment-scoped, evidence-bound, rights-fail-closed, idempotent, accessible, and free of the production hydration defect caught during release proof.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | TECHNICAL PASS | 2026-09-23 |
| Ahmed | Requester | END-TO-END COMPLETION REQUESTED | 2026-09-22 |
| `aboayman-oss` | Distinct executor-controlled GitHub account | APPROVED exact heads under D-22; not independent review | 2026-09-22 / 2026-09-23 |
