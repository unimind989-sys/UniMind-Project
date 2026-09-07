# Gate checkpoint: WP02-T06 server-only retrieval scope

**Task:** WP02-T06, including the forward repair for the reopened WP02-T04 release-visibility finding

**Status:** IN PROGRESS; local credential-free verification passed, while disposable PostgreSQL/pgvector CI and the protected exact-candidate checkpoint remain open

**Implementation candidate:** `a8800e5` (`feat(db): harden server-only retrieval scope`)

**Review surface:** Local branch `wp02/server-only-retrieval-scope`; not pushed and no PR opened because publication authorization has not yet been supplied

**Executor / reviewer:** Codex `/root` / Ahmed as the named requester; Ahmed + Ziad are required separately for the included RLS repair

**Environment:** Synthetic-only workstation checks and authenticated read-only inspection of GitHub, Supabase, and Vercel. No shared Supabase migration/reset, GitHub publication, deployment, release/unlock, real data, provider credential, or paid provider call.

## Review finding and repair

The post-handoff review found that the inherited direct `SELECT` policies on `cohorts`, `cohort_releases`, and `curriculum_units` admitted any active cohort member. That contradicted the master-plan/runbook visibility rule and exposed locked release rows (including free-text reasons) plus unpublished or empty unit metadata.

Forward migration `20260907123954_restrict_student_release_metadata.sql` keeps admin preview intact while requiring:

- active membership plus `UNLOCKED` state for direct cohort/release reads;
- the complete caller-scoped availability predicate for direct curriculum-unit reads;
- no locked release row or reason for student callers.

The T04 task is explicitly reopened until disposable database proof and new Ahmed + Ziad confirmations close this protected change. No applied migration was rewritten.

## Retrieval implementation

- Unrestricted `source_segments` and `segment_embeddings` remain in `unimind_private` without authenticated table grants.
- The old vector-only overload is removed. The replacement private function accepts requesting user, cohort, unit, active embedding config, query vector, query text, and bounded limit.
- The function is `STABLE SECURITY DEFINER` with empty `search_path`; execution is revoked from `PUBLIC`, `anon`, and `authenticated`, then granted only to `service_role`.
- Authoritative user access and cohort/unit/release/source/rights/edition/segment state are recomputed before vector and text candidate limits.
- The only approved synthetic configuration is bound to a partial three-dimensional cosine HNSW expression index. Full-text candidates use a `simple`-configuration GIN index. Reciprocal-rank fusion returns component distance/score/ranks and the merged score.
- Any other embedding configuration fails closed pending D-04 and its own measured forward index migration.
- PgTAP adds same-program cross-cohort and separate-program canaries, a same-cohort cross-unit canary, immediate rights revocation, inactive segment/config, forged user, invalid vector/text/limit, grant, function-shape, and index metadata coverage.

## Verification

| Command / gate | Result |
| --- | --- |
| `corepack pnpm check:sql` | PASS; 20 forward migrations |
| Focused `corepack pnpm test:security -- retrieval-scope-contract.test.ts` | PASS; 4 tests |
| `corepack pnpm verify` | PASS; formatting, lint, types, boundaries, SQL/CI policy, 700-file secret scan, unit 242, integration 7 + 1 guarded hosted skip, security 19, evaluation 3, load contract 5, E2E 2, production build, client-artifact secret scan |
| `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | PASS; 151 names, 45 local links, 22 synchronized decisions, 102 task contracts |
| `pwsh -NoProfile -File scripts/test-agent-handoff.ps1` | PASS; isolated committed snapshot and clean-worktree rehearsal |
| `git diff --check`, full diff, boundaries, secret, architecture, and scope review | PASS for implementation candidate `a8800e5` |
| Hosted Supabase dry-run | NOT RUN; the required ignored `.local/supabase/development.env` profile is absent |
| Disposable database upgrade/reset/migrations/pgTAP/advisors/types/Auth | NOT RUN; this workstation has no Docker-compatible runtime and the branch is not authorized for publication to GitHub CI |

The database migration and 23-assertion pgTAP suite therefore remain candidate code until GitHub's disposable database job executes them. Local structural tests do not substitute for PostgreSQL/pgvector execution.

## Platform review and confirmed cleanup

- GitHub was clean at review time: zero open PRs, only `main` on the remote, branch protection enabled, and latest main CI green. Native Dependabot, secret-scanning, and code-scanning features are disabled/unconfigured; this is advisory because the repository's required dependency/security gates currently execute in CI.
- Supabase Preview was healthy with no advisor findings and migrations ending at the last intentionally promoted T03 migration. Beta remained paused and locked. Neither project was mutated.
- Vercel Preview and Beta protection remained enabled; current Preview production was healthy and Beta had no production deployment. With Ahmed's explicit confirmation on 2026-09-07, the retained August 31 automation-bypass credential and the stale deployment for deliberate leak commit `5aaaf51` were deleted. The bypass list was verified empty and `5aaaf51` was verified absent from active deployments. Current Production and Beta were not touched. The deletions are not instantly reversible; old links to that stale deployment can no longer be used.

## Remaining gate

1. Ahmed explicitly authorizes publishing this branch and opening a Draft PR.
2. GitHub disposable database CI passes populated upgrade, two clean resets, migration parity, all pgTAP tests, advisors, generated types/parity, database Auth integration, and cleanup.
3. Any CI finding is corrected and a final exact candidate is frozen.
4. Ahmed and Ziad each inspect and confirm the exact RLS repair candidate separately.
5. Final evidence/task/runbook state is committed. Merge and shared Supabase promotion remain separate explicit actions.

WP02-T07 must not start until these items close.
