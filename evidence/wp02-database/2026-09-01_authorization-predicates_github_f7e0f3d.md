# Gate report: WP02-T03 reusable authorization predicates

**Task:** WP02-T03

**Environment:** Local zero-cost verification, GitHub disposable Supabase CI, and protected Vercel Preview

**Commit:** `f7e0f3d8c7920e987ddffa9bd1f44c1edaec716f`

**Release/config fingerprint:** GitHub Actions run `33446495666`; database artifact `database-ci-test-reports-33446495666-1` (`sha256:f8126a6f1bb058ada7661a3b6e26477e4eaccaa6a42d63a9ff5f339937f68114`); Vercel deployment `dpl_4sB7Fyvayxknns7W9MGB4t8vN8xK`; providers disabled, mock-only, synthetic-only

**Migration:** `20260831220554_reusable_authorization_predicates.sql`, following the 15 reviewed WP02-T02 migrations

**Agent executor:** Codex `/root`

**Human checkpoint:** PROTECTED RLS GATE PENDING — separate named Ahmed and Ziad confirmations are required for exact commit `f7e0f3d8c7920e987ddffa9bd1f44c1edaec716f` before merge or hosted migration promotion

## Scope and acceptance evidence

| Criterion | Evidence | Result |
| --- | --- | --- |
| Four reusable predicates | `public.is_admin()`, `public.has_active_membership(uuid)`, `public.has_campaign_assignment(uuid)`, and `public.can_access_unit(uuid)` are stable, caller-scoped functions | PASS |
| Safe function boundary | All four functions are `security invoker`, set an empty `search_path`, revoke default/anonymous execution, and grant execution only to `authenticated` callers whose authority is recomputed inside | PASS |
| Authoritative revocation | Role, membership, and assignment checks use `(select auth.uid())` plus database rows and effective-time/state predicates; mutable JWT app metadata is never an authority | PASS |
| Reused policy truth | Cohort, curriculum-unit, campaign, assignment, requested-material, submission, and source-asset policies consume the helpers without weakening release/publication/rights behavior | PASS |
| Update-policy completeness | Database meta-tests prove every UPDATE policy has both `USING` and `WITH CHECK`, plus a SELECT policy for row visibility | PASS |
| Positive and forbidden paths | The 34-assertion pgTAP proof covers active member, expired member, unassigned caller, administrator, nonexistent unit, stale claims, immediate revocation, source visibility, and rejected submission | PASS |
| Migration replay | Populated upgrade, two clean resets, migration listing, all 17 pgTAP files, advisors, generated types, database Auth integration, and security suites pass in disposable CI | PASS |
| Application compatibility | Local and GitHub application gates pass formatting, lint, type checking, boundaries, SQL/CI policy, secret scan, 242 unit tests, integration/security/evaluation/load tests, Chromium E2E, production build, and client-artifact scan | PASS |
| Protected preview | Exact Vercel deployment is READY; live and ready return 200 with `no-store`; POST returns 405; browser rendering is synthetic/mock-only; console and error-log checks are clean | PASS |
| Hosted Supabase promotion | Supabase Preview was inspected as Healthy with no advisor issue and migration head `rls_grants_indexes`; the new protected migration was intentionally not applied | PENDING PROTECTED GATE |
| Merge/production closure | PR #15 is open and technically green; merge, Supabase forward promotion, production deployment, and production flow validation wait for both named confirmations | PENDING PROTECTED GATE |

## Commands and results

| Command or check | Exit/result | Evidence |
| --- | --- | --- |
| `corepack pnpm check:sql` | 0 | SQL convention audit passed for 16 migrations |
| `corepack pnpm verify` | 0 | Complete zero-cost local gate passed on the exact candidate |
| `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | 0 | 141 names, 43 links, 22 synchronized decisions, and 102 task contracts passed |
| `pwsh -NoProfile -File scripts/test-agent-handoff.ps1` | 0 | Isolated committed-snapshot handoff selected WP02-T03 and passed readiness |
| GitHub Actions `33446495666` | success | Dependency audit, application, and database-ci jobs all passed |
| Disposable database sequence | 0 | Start, populated upgrade, two resets, migration parity, pgTAP, advisors, type generation/parity, Auth integration, security, and shutdown passed |
| Vercel protected preview probes | pass | `dpl_4sB7Fyvayxknns7W9MGB4t8vN8xK`: live 200, ready 200, POST 405, synthetic/mock-only page, no browser-console or runtime error logs |
| `git diff origin/main...HEAD --check` | 0 | No whitespace error |

## Review

- Correctness: helper semantics preserve the prior allow/deny rules while fixing cohort-release checks to honor membership start/end windows consistently.
- Security: no helper trusts `auth.role()`, `app_metadata`, or membership in the broad `authenticated` role; anonymous execution is denied and source availability retains release/publication checks.
- Maintainability: repeated administrator, membership, and assignment expressions now have one small caller-scoped definition; availability remains separate for WP02-T05.
- Compatibility: generated public database types are deterministic and CI reports zero diff after regeneration.
- Scope: no real/private data, release/unlock mutation, raw deletion, paid provider, budget, beta access, or hosted schema change occurred.

## Failures and deviations

| ID | Finding | Resolution | State |
| --- | --- | --- | --- |
| Closed-01 | Initial CI run `33445978366` stopped after 23/34 new assertions because synthetic revocation updates lacked required governance audit context. | Added synthetic actor, reason, and correlation context; rerun `33446495666` passed the full database sequence. | CLOSED |
| Accepted-01 | This Windows workstation has no Docker runtime, so the disposable database suite could not run locally. | The repository's pinned GitHub-hosted Supabase job ran populated upgrade, two clean resets, all pgTAP tests, advisors, types, Auth integration, and security successfully. | ACCEPTED, non-blocking |

## Rollback and disable

Before hosted promotion, close PR #15 and delete the task branch if the change is rejected. After a shared database applies the migration, do not edit history or migrate backward: disable the consuming capability and apply a narrowly scoped reviewed forward-repair migration. If only the application deployment regresses, keep providers and budget disabled and move the Vercel production alias to the last reviewed deployment.

## Gate decision

TECHNICAL PASS; PROTECTED REVIEW PENDING. The implementation is ready for the separate named Ahmed and Ziad confirmations on exact commit `f7e0f3d8c7920e987ddffa9bd1f44c1edaec716f`. Until both confirmations are recorded, the migration must not be applied to hosted Supabase, PR #15 must not merge, and the production alias must not move.
