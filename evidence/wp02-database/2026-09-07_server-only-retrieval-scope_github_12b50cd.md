# Gate evidence: WP02-T06 server-only retrieval scope

**Tasks:** WP02-T06 and the reopened WP02-T04 release-visibility repair

**Status:** PASS

**Exact protected implementation candidate:** `12b50cdbf8bd3b93ecf994b2a8dde62105ceedf7`

**Review surface:** GitHub PR `#19`, `wp02/server-only-retrieval-scope` into protected `main`

**Executor / reviewer:** Codex `/root` / Ahmed; Ahmed + Ziad for the protected RLS repair

**Environment:** Synthetic-only workstation verification, GitHub-hosted disposable Supabase/PostgreSQL CI, and authenticated platform inspection. No shared Supabase migration/reset, production deployment, release/unlock, real data, real embedding configuration, provider credential, or paid provider call.

## Outcome

- Forward migration `20260907123954_restrict_student_release_metadata.sql` hides locked cohort/release rows, release reasons, and unavailable curriculum-unit metadata from students while preserving explicit admin access.
- Forward migration `20260907124502_harden_server_only_retrieval_scope.sql` replaces the old vector-only overload with a private service-role-only vector/text retrieval seam.
- The function validates caller, cohort, unit, active embedding config, query vector/text, and limit; recomputes authoritative access; and applies cohort/unit/release/source/rights/edition/segment filters before both candidate limits.
- The approved deterministic synthetic configuration uses a three-dimensional cosine HNSW expression index; full-text candidates use a `simple`-configuration GIN index. D-04 continues to block any real configuration or production index.
- PgTAP covers same-program cross-cohort, separate-program, same-cohort cross-unit, immediate rights revocation, inactive segment/config, forged user, invalid inputs, direct grants, function shape, and live index metadata.

## Review and correction loop

1. Run `34127461202` applied the migrations and upgrade successfully, then exposed a redundant private-schema reference in the caller-scoped public helper plus an invalid READY-state revocation fixture.
2. Candidate `c462f362a5576c49ab88eb345aac7f956665b29a` delegated source visibility through the existing RLS policy and made the revocation transition satisfy the durable READY gate.
3. Run `34128216932` proved the runtime behavior and narrowed the remaining failures to two stale pre-repair expectations and catalog-string formatting assumptions.
4. Exact candidate `12b50cdbf8bd3b93ecf994b2a8dde62105ceedf7` updated those tests without weakening signature, grant, dimension, operator-class, or behavior assertions.
5. Final run `34158635066` passed all required jobs.

## Verification

| Gate | Result |
| --- | --- |
| Local `corepack pnpm verify` | PASS: formatting, lint, types, boundaries, SQL/CI policy, 701-file secret scan, unit 242, integration 7 + 1 guarded hosted skip, security 19, evaluation 3, load contract 5, E2E 2, production build, client-artifact scan |
| Local readiness / handoff rehearsals | PASS: controlled authority links and isolated clean-checkout rehearsal |
| GitHub dependency audit | PASS in run `34158635066`, job `101855621811` |
| GitHub application gate | PASS in run `34158635066`, job `101855622120` |
| Disposable database gate | PASS in run `34158635066`, job `101855918066`: populated upgrade, two clean resets, 20-migration parity, all 271 pgTAP assertions, advisors, generated types/parity, database Auth integration, cleanup |
| Database report artifact | `database-ci-test-reports-34158635066-1`, artifact `10031950204`, SHA-256 `0801c2e8f82ab628e1b95d3fb5ca2c664050b68b0b8227ee2ee4adb45cca472d` |
| Local report artifact | `local-test-reports-34158635066-1`, artifact `10031852224`, SHA-256 `0a09f71c55bc5275649e9d7ca136448502baaefd7ebb4822119e2727565fed68` |
| `git diff --check`, full diff, architecture/scope review | PASS; no secret, credential, private data, paid call, or shared-state change |

## Protected confirmations

On 2026-09-07, Ahmed explicitly authorized completing and merging PR `#19` autonomously and stated that both his and Ziad's confirmations apply to that PR. Under decision D-22, this records Ahmed's own confirmation and Ahmed's named relay of Ziad's separate confirmation. The protected RLS implementation was then frozen at exact candidate `12b50cdbf8bd3b93ecf994b2a8dde62105ceedf7`; no later evidence-only change alters it.

The confirmations cover the forward release-visibility policy repair in this unchanged candidate. They do not authorize a future RLS change, shared Supabase promotion, beta go-live, raw deletion, rights change, budget kill switch, or content release/unlock.

## Platform state at gate close

- GitHub: PR `#19` has all required checks green on the protected implementation candidate. The repository's native Dependabot, secret-scanning, and code-scanning features remain disabled/unconfigured; required dependency/security gates run in repository CI.
- Supabase: Preview was healthy with no advisor findings and remains intentionally promoted only through T03. Beta remains paused and locked. Neither project was mutated.
- Vercel: Preview and Beta protection remain enabled. The current Preview production deployment is healthy and Beta has no production deployment. With Ahmed's separate explicit deletion confirmation, the retained August 31 automation bypass and stale `5aaaf51` deployment were deleted and verified absent without touching current Production or Beta.

WP02-T04 and WP02-T06 are complete. Merge, temporary branch cleanup, final main-CI verification, and removal of obsolete PR preview deployments are delivery cleanup; shared Supabase promotion is intentionally not part of this gate.
