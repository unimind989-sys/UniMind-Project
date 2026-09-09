# Gate evidence: WP02-T09 database package

**Task:** WP02-T09

**Status:** IMPLEMENTATION PASS; delivery closure pending

**Exact implementation candidate:** `dd9ece4700de5aa149dfcf01deac17f14eef1f3a`

**Review surface:** GitHub PR `#24`, `wp02/database-gate` into `main`

**Database fingerprint:** 22 repository migrations; unchanged Supabase Preview head `20260908122500` (`rls_application_boundaries`)

**Runtime fingerprint:** Node.js `24.19.0`; Next.js `16.3.4`; Supabase CLI `2.115.0`; PostgreSQL `17.6`; pgvector `0.8.2`

**Agent executor and technical reviewer:** Codex `/root`

**Protected-gate reviewers:** Ahmed and Ziad, under the standing authorization in the initiating request

**Started (UTC):** 2026-09-09T02:46:00Z

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
| Delivery | PR review/merge, merged-main CI, Production promotion, public verification, and cleanup | PENDING |

## Commands and platform checks

| Check | Sanitized result |
| --- | --- |
| `corepack pnpm verify` | PASS: formatting, lint, strict types, module/SQL/CI policy, 721-file secret scan, 246 unit tests, 15 credential-free integration tests with 2 hosted skips, 22 security tests, evaluation/load contracts, 2 Chromium flows, Next.js `16.3.4` production build, and client-artifact scan |
| `corepack pnpm audit --audit-level high --prod` | PASS: no known production vulnerability |
| Focused retrieval contract | 8/8 tests passed; the corrected assertion also accepted the real plan captured by failed diagnostic run `34307655624` |
| GitHub run `34308323932` | Dependency audit, application, and disposable database/Auth jobs passed at exact candidate `dd9ece4` |
| Disposable database job `102329819928` | Populated upgrade, two resets, migration parity, 24 pgTAP files, races, both plan captures, advisors, generated-type zero diff, 17 database/Auth integration tests, 22 security tests, and cleanup passed |
| GitHub artifacts | Database `10087563533`, digest `sha256:7158457df1692df6d4dc93d99791f7df47055d7a76d468fe7f907afb35ad29c8`; application `10087474088`, digest `sha256:c86bbc45bd9c2a3658a4bd2e0a60baf8dcec33737b5b61a3737e6cb656202953` |
| Retrieval plan | Body execution `11.037 ms`; `source_segments_retrieval_scope_idx`, `segment_embeddings_config_segment_idx`, and version uniqueness paths used; zero temporary blocks |
| Preview dashboard | `unimind-preview` is Healthy on nano compute; latest migration is `rls_application_boundaries`; dashboard advisor reports no issue |
| Exact-candidate Vercel Preview | `dpl_95jAb1CEvE2qUMePYkf95ZBRL2pg` is READY and built from PR candidate `dd9ece4` |
| Authenticated Preview smoke | Live/ready GET `200`, both POST attempts `405`, UniMind rendered, Synthetic only and Mock only present, approved real mode absent |

Sanitized query-plan artifacts:

- `evidence/wp02-database/query-plans/student-catalog-availability-dd9ece4.json`
- `evidence/wp02-database/query-plans/authorized-hybrid-retrieval-dd9ece4.json`

## Technical review

- Every `security definer` helper has an empty fixed `search_path`; privileged helpers remain in `unimind_private`, and the intentional public audit RPC is security-invoker.
- Browser roles receive no private-schema usage. Public authenticated grants are explicit object grants and remain constrained by RLS; `anon` receives no application-table grant.
- Catalog tests require RLS on every public table, exact policy/grant/function inventories, both `USING` and `WITH CHECK` for every update policy, and a leading index for every foreign key.
- Public views are required to be security-invoker. The Data API exposes only the configured public/GraphQL schemas; the private schema is not exposed.
- Destructive-statement review found only idempotent policy/function replacements immediately followed by their reviewed definitions; there is no data/table deletion in the migration set.
- Storage remains fail-closed with zero UniMind buckets and zero browser storage policies. No paid/live provider, nonzero budget, rights, raw-deletion, content release, real data, or Beta change occurred.

## Review and correction loop

1. PR run `34306700880` found newly published critical Next.js and high Sharp advisories. The runtime was moved from Next.js `16.3.1` to patched `16.3.4`; the lockfile now resolves Sharp `0.35.4`, and both audit and full verification pass.
2. Run `34307162293` reached the new fixture and rejected a direct `NEEDS_REVIEW` to `READY` transition. The fixture now follows the production state machine through `PROCESSING`.
3. Run `34307655624` captured a healthy `11 ms` body plan but exposed an overfitted assertion that demanded global HNSW and GIN indexes even when PostgreSQL correctly selected narrower cohort/unit and composite lookup paths. The guard now accepts either reviewed cost-based embedding path while retaining the mandatory scope index, 50-row bound, authorization joins, large-scan rejection, and no-spill checks.
4. Final implementation run `34308323932` passed every job without waiver, skip, test weakening, or migration rewrite.

## Rollback/disable procedure

The gate adds no migration and mutates no hosted database. Revert the plan-capture harness independently if runner compatibility requires it. If a later plan crosses the large-scan or spill guard, keep the affected retrieval caller disabled and use a separately reviewed forward migration or query change; never rewrite applied migration history. Vercel can repoint Production to the recorded prior ready deployment independently of Supabase.

## Delivery closure

Pending the docs-inclusive PR-head run, review/approval, merge, merged-main verification, exact Production deployment, public smoke/browser/log validation, and task-branch cleanup. This section will be replaced with immutable provider and merge identifiers before the task record is marked complete.
