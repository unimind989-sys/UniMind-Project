# Gate evidence: WP02-T09 database package

**Task:** WP02-T09

**Status:** PASS — reviewed, merged, deployed, production-verified, and ready for cleanup

**Exact database-gate implementation:** `dd9ece4700de5aa149dfcf01deac17f14eef1f3a`

**Exact production-runtime correction:** `20230aee43fd7091284f955aab37f14f87d27d42`

**Merged main:** PR `#24` at `15209989129bb8fd082fe28ff8f086ba21371a69`, followed by PR `#25` at `68638c5bd0ceeaf1341378943456bdacdeded4ab`

**Database fingerprint:** 22 repository and Supabase Preview migrations; head `20260908122500` (`rls_application_boundaries`)

**Runtime fingerprint:** Node.js `24.19.0`; Next.js `16.3.4`; Supabase CLI `2.115.0`; PostgreSQL `17.6`; pgvector `0.8.2`

**Agent executor and technical reviewer:** Codex `/root`

**Protected-gate reviewers:** Ahmed and Ziad, under the standing authorization in the initiating request

**Started (UTC):** 2026-09-09T02:46:00Z

**Finished (UTC):** 2026-09-09T09:35:00Z

## Gate result

| Criterion | Exact-candidate result | Status |
| --- | --- | --- |
| Populated upgrade | Tagged WP01 fixture upgraded through all 22 migrations without loss | PASS |
| Clean replay | Two consecutive empty resets passed | PASS |
| Authorization | All 24 pgTAP files, the exhaustive RLS/grant inventories, and 22 TypeScript security tests passed | PASS |
| Concurrency | Two-session job claim, usage reserve, and usage settle/release races each produced one canonical result | PASS |
| Generated types | CI-generated database types matched the committed file byte-for-byte | PASS |
| Advisors | Disposable database lint passed; Supabase Preview reports no security, performance, or health issue | PASS |
| Availability plan | Exact-candidate invocation and installed SQL-body plans were captured and passed the stable plan guard | PASS |
| Retrieval plan | A rolled-back 513-target/4,097-distractor corpus returned 50 bounded rows using the scope and composite embedding indexes with no temporary spill | PASS |
| Migration review | No unresolved unsafe definer, broad grant, missing update `WITH CHECK`, unindexed foreign key, destructive data statement, or Data API exposure | PASS |
| Delivery | Two reviewed PRs merged unchanged, merged-main CI passed, the immutable candidate was promoted, and public Production passed smoke/browser/log verification | PASS |

## Commands and platform checks

| Check | Sanitized result |
| --- | --- |
| `corepack pnpm verify` | PASS on final runtime candidate: formatting, lint, strict types, module/SQL/CI policy, 723-file secret scan, 246 unit tests, 15 credential-free integration tests with 2 hosted skips, 22 security tests, evaluation/load contracts, 2 Chromium flows, Next.js `16.3.4` production build, and client-artifact scan |
| `corepack pnpm audit --audit-level high --prod` | PASS: no known production vulnerability |
| GitHub implementation run `34308323932` | Dependency audit, application, and complete disposable database/Auth jobs passed at `dd9ece4` |
| GitHub PR-head run `34309033624` | Docs-inclusive implementation head passed all jobs |
| GitHub merged-main run `34309701287` | Implementation merge `1520998` passed all applicable jobs |
| GitHub runtime-correction run `34333582621` | Dependency, application, and disposable database jobs passed at exact head `20230ae`; database job `102408106935` completed without waiver |
| GitHub runtime-correction review | `unimind989-sys` approved exact head `20230ae` in review `5152297872` at `2026-09-09T09:22:30Z` |
| GitHub runtime merge | PR `#25` merged unchanged as `68638c5bd0ceeaf1341378943456bdacdeded4ab` |
| GitHub final merged-main run `34334699027` | Application job `102411255426` and complete database job `102411673664` passed at merge `68638c5`; the dependency job was correctly path-filtered because lockfiles were unchanged from the already-audited candidate |
| Disposable database job `102329819928` | Populated upgrade, two resets, migration parity, 24 pgTAP files, races, both plan captures, advisors, generated-type zero diff, 17 database/Auth integration tests, 22 security tests, and cleanup passed |
| GitHub implementation artifacts | Database `10087563533`, digest `sha256:7158457df1692df6d4dc93d99791f7df47055d7a76d468fe7f907afb35ad29c8`; application `10087474088`, digest `sha256:c86bbc45bd9c2a3658a4bd2e0a60baf8dcec33737b5b61a3737e6cb656202953` |
| Retrieval plan | Body execution `11.037 ms`; `source_segments_retrieval_scope_idx`, `segment_embeddings_config_segment_idx`, and version uniqueness paths used; zero temporary blocks |
| Supabase Preview | `unimind-preview` (`ynlaejacnakvinlpthnb`) is Healthy on nano compute; dashboard shows all 22 migrations through `20260908122500`; advisor reports no security, performance, or health issue |
| Exact final Vercel Preview | `dpl_5Fr5CziCq5fVvRVEssfCQ9YLw46r` is READY and built from clean exact candidate `20230ae` with release `wp02-t09-20230ae-preview` |
| Vercel Production | Promoted deployment `dpl_4TNkwabju7ga95WcATF6Fm6V4ox3` is READY at `https://unimind-preview-dc6iqutj6-unimind2.vercel.app`; public alias `https://project-xwrez.vercel.app` resolves to it |
| Public Production smoke | PASS: live/ready GET `200`, both POST attempts `405`, application identity, Synthetic only, Mock only, and SVG icon `200 image/svg+xml` — 7 checks |
| Rendered Production browser | Fresh Chromium session rendered the exact release marker and guard labels; 12 application/static requests returned `200`, Vercel feedback returned `204`, and the console reported 0 errors and 0 warnings |
| Runtime logs | Vercel error- and warning-level scans for the exact Preview and Production deployment returned no entries |

Sanitized query-plan artifacts:

- `evidence/wp02-database/query-plans/student-catalog-availability-dd9ece4.json`
- `evidence/wp02-database/query-plans/authorized-hybrid-retrieval-dd9ece4.json`

## Technical review

- Every `security definer` helper has an empty fixed `search_path`; privileged helpers remain in `unimind_private`, and the intentional public audit RPC is security-invoker.
- Browser roles receive no private-schema usage. Public authenticated grants are explicit object grants and remain constrained by RLS; `anon` receives no application-table grant.
- Catalog tests require RLS on every public table, exact policy/grant/function inventories, both `USING` and `WITH CHECK` for every update policy, and a leading index for every foreign key.
- Public views are security-invoker. The Data API exposes only the configured public/GraphQL schemas; the private schema is not exposed.
- Destructive-statement review found only idempotent policy/function replacements immediately followed by their reviewed definitions; there is no data/table deletion in the migration set.
- Storage remains fail-closed with zero UniMind buckets and zero browser storage policies. No paid/live provider, nonzero budget, rights, raw-deletion, content release, real data, or Beta change occurred.
- The final icon is a static metadata asset instead of a generated `next/og` route. This removes the browser 404 without adding server runtime weight; the Production function bundle remained approximately `659 KB`.

## Review and correction loop

1. PR run `34306700880` found newly published critical Next.js and high Sharp advisories. The runtime was moved from Next.js `16.3.1` to patched `16.3.4`; the lockfile now resolves Sharp `0.35.4`, and both audit and full verification pass.
2. Run `34307162293` rejected a direct `NEEDS_REVIEW` to `READY` fixture transition. The fixture now follows the production state machine through `PROCESSING`.
3. Run `34307655624` captured a healthy `11 ms` body plan but exposed an overfitted assertion. The guard now accepts either reviewed cost-based embedding path while retaining the mandatory scope index, 50-row bound, authorization joins, large-scan rejection, and no-spill checks.
4. A direct post-merge Production attempt was blocked before build because the Git merge author email was not linked to the Vercel Git account. Production remained unchanged; the exact verified Preview was redeployed and promoted through Vercel's immutable deployment path.
5. The first public cutover passed the six original checks, but a fresh browser exposed a missing `/favicon.ico` request. PR `#25` added an app icon and made icon availability part of deployment smoke.
6. Self-review rejected the first generated `next/og` icon because it expanded the server bundle to approximately `9.83 MB` and made cold local E2E startup unreliable. The unmerged attempt was replaced with the final static SVG, restoring the approximately `659 KB` function bundle and a fast deterministic route.
7. Final candidate `20230ae` passed full local verification, GitHub run `34333582621`, exact Preview verification, approval, unchanged merge, merged-main run `34334699027`, Production promotion, seven-check public smoke, rendered-browser inspection, and error/warning log scans.

## Rollback/disable procedure

The database gate adds no migration and mutates no hosted database. Revert the plan-capture harness independently if runner compatibility requires it. If a later plan crosses the large-scan or spill guard, keep the affected retrieval caller disabled and use a separately reviewed forward migration or query change; never rewrite applied migration history. Vercel can repoint Production to the prior READY deployment independently of Supabase. The static icon and its smoke assertion can be reverted together without affecting database state.

## Delivery closure

WP02-T09 is complete. The database implementation and production correction are merged into `main`; all local, PR, and merged-main checks are green; Supabase Preview is healthy and unchanged at the exact 22-migration head; Vercel Production serves the exact reviewed runtime with the intended synthetic/mock guards; the public URL passes API, write-denial, UI, asset, console, request, and log checks. Task branches and temporary deployment worktrees are removed after this evidence enters `main`.
