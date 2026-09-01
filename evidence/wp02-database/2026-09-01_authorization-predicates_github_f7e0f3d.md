# Gate report: WP02-T03 reusable authorization predicates

**Task:** WP02-T03

**Environment:** Local zero-cost verification, GitHub disposable Supabase CI, protected Vercel Preview, and Supabase Preview (`ynlaejacnakvinlpthnb`)

**Commit:** `f7e0f3d8c7920e987ddffa9bd1f44c1edaec716f`

**Release/config fingerprint:** Final PR-head GitHub Actions run `33460679200`; implementation database artifact `database-ci-test-reports-33446495666-1` (`sha256:f8126a6f1bb058ada7661a3b6e26477e4eaccaa6a42d63a9ff5f339937f68114`); Vercel exact implementation deployment `dpl_4sB7Fyvayxknns7W9MGB4t8vN8xK`; hosted migration SHA-256 `906c853fc0c803bb60c8b4d3cb2a8a94b70db80945084318f2fb6b02d8a5e770`; providers disabled, mock-only, synthetic-only

**Migration:** `20260831220554_reusable_authorization_predicates.sql`, following the 15 reviewed WP02-T02 migrations

**Agent executor:** Codex `/root`

**Human checkpoint:** PROTECTED RLS GATE PASS — Ahmed and Ziad separately confirmed exact commit `f7e0f3d8c7920e987ddffa9bd1f44c1edaec716f` in the task chat on 2026-09-01 UTC

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
| Hosted Supabase promotion | The approved SQL hash was applied atomically behind an exact ledger-head guard; migration `20260831220554_reusable_authorization_predicates` is the hosted head; all four functions have the required metadata and grants, 10 policies reuse helpers, an unknown authenticated caller receives four `false` results, and refreshed security/performance advisors show 0 errors and 0 warnings | PASS |
| Merge/production closure | PR #15 is open, reviewed, protected-gate approved, and technically green; merge, main CI, production deployment, production flow validation, and cleanup remain | IN PROGRESS |

## Commands and results

| Command or check | Exit/result | Evidence |
| --- | --- | --- |
| `corepack pnpm check:sql` | 0 | SQL convention audit passed for 16 migrations |
| `corepack pnpm verify` | 0 | Complete zero-cost local gate passed on the exact candidate |
| `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | 0 | 141 names, 43 links, 22 synchronized decisions, and 102 task contracts passed |
| `pwsh -NoProfile -File scripts/test-agent-handoff.ps1` | 0 | Isolated committed-snapshot handoff selected WP02-T03 and passed readiness |
| GitHub Actions `33446495666` | success | Dependency audit, application, and database-ci jobs all passed |
| GitHub Actions `33460679200` | success | Final PR head passed dependency-audit, application, and database-ci jobs after the protected-confirmation record |
| Disposable database sequence | 0 | Start, populated upgrade, two resets, migration parity, pgTAP, advisors, type generation/parity, Auth integration, security, and shutdown passed |
| Vercel protected preview probes | pass | `dpl_4sB7Fyvayxknns7W9MGB4t8vN8xK`: live 200, ready 200, POST 405, synthetic/mock-only page, no browser-console or runtime error logs |
| Supabase dashboard preflight | pass | Approved project Healthy; exact prior head `20260831064458_rls_grants_indexes`; new helper absent before promotion |
| Atomic hosted migration | pass | Exact reviewed 8,312-byte SQL at SHA-256 `906c853f...e770` applied with a ledger-head guard and ledger insert in one transaction; dashboard reported success |
| Hosted authorization metadata | pass | Four stable security-invoker functions, empty search paths, authenticated execute allowed, anonymous and public execute denied; 10 affected policies reference the helpers |
| Hosted caller denial | pass | Synthetic unknown authenticated caller received `false` from all four predicates without data mutation |
| Hosted advisors | pass | Security and Performance each report 0 errors and 0 warnings after promotion |
| `git diff origin/main...HEAD --check` | 0 | No whitespace error |

## Review

- Correctness: helper semantics preserve the prior allow/deny rules while fixing cohort-release checks to honor membership start/end windows consistently.
- Security: no helper trusts `auth.role()`, `app_metadata`, or membership in the broad `authenticated` role; anonymous execution is denied and source availability retains release/publication checks.
- Maintainability: repeated administrator, membership, and assignment expressions now have one small caller-scoped definition; availability remains separate for WP02-T05.
- Compatibility: generated public database types are deterministic and CI reports zero diff after regeneration.
- Scope: the only hosted mutation was the approved forward migration on the synthetic Supabase Preview project; no real/private data, release/unlock mutation, raw deletion, paid provider, budget, or beta access occurred.

## Failures and deviations

| ID | Finding | Resolution | State |
| --- | --- | --- | --- |
| Closed-01 | Initial CI run `33445978366` stopped after 23/34 new assertions because synthetic revocation updates lacked required governance audit context. | Added synthetic actor, reason, and correlation context; rerun `33446495666` passed the full database sequence. | CLOSED |
| Closed-02 | Vercel correctly refused to export the sensitive hosted `DATABASE_URL`, so the planned CLI dry run could not authenticate. | No database command ran. The signed-in Supabase dashboard was used after connector discovery found no Supabase API tool; an exact prior-head guard, reviewed SQL hash, atomic transaction, ledger verification, metadata checks, caller denial, and refreshed advisors supplied equivalent guarded promotion evidence. | CLOSED |
| Accepted-01 | This Windows workstation has no Docker runtime, so the disposable database suite could not run locally. | The repository's pinned GitHub-hosted Supabase job ran populated upgrade, two clean resets, all pgTAP tests, advisors, types, Auth integration, and security successfully. | ACCEPTED, non-blocking |

## Rollback and disable

The shared Supabase Preview database now contains the migration, so do not edit history or migrate backward: disable the consuming capability and apply a narrowly scoped reviewed forward-repair migration. If only the application deployment regresses, keep providers and budget disabled and move the Vercel production alias to the last reviewed deployment.

## Protected confirmations

- Ahmed: confirmed exact reviewed commit `f7e0f3d8c7920e987ddffa9bd1f44c1edaec716f` in the task chat on 2026-09-01 UTC.
- Ziad: separately confirmed exact reviewed commit `f7e0f3d8c7920e987ddffa9bd1f44c1edaec716f` in the task chat on 2026-09-01 UTC.

## Gate decision

TECHNICAL PASS; PROTECTED REVIEW PASS; HOSTED DATABASE PASS. The exact implementation is approved for PR merge and production validation. Closure remains pending until main CI, production deployment, final end-to-end checks, and cleanup pass.
