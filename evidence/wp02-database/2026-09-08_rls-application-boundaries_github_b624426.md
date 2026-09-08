# Gate evidence: WP02-T08 RLS application boundaries

**Task:** WP02-T08

**Status:** PASS

**Exact implementation candidate:** `b624426ca5c30e7a8dd28f1676abd4e24beab9ba`

**Implementation merge:** `f015d3a68ec9ce74b05f01c8c6ff80dd5bba49e4`

**Review surface:** GitHub PR `#22`, `wp02/rls-application-boundaries` into protected `main`

**Release/config fingerprint:** migration `20260908122500`, repository LF SHA-256 `dfa9fc7d58e6fb898880a74c90e1681ec53d15512b94b31c0bad3a2286477aea`; Vercel Production deployment `dpl_9qZPCzBoTUE2iCokboUCHPU8uFkc`; public release marker `wp02-t08-b624426-preview`

**Agent executor:** Codex `/root`

**Human reviewers:** repository owner `unimind989-sys`; Ahmed and Ziad for the protected RLS/grant and shared Preview gates

**Started/finished (UTC):** 2026-09-08T12:16:28Z / 2026-09-08T16:19:15Z

## Scope and decision

| Criterion | Result | Status |
| --- | --- | --- |
| Caller-scoped student access | Profile and available-unit reads use the cookie-backed publishable-key client, accept no user ID, and return bounded DTOs | PASS |
| Privileged boundary | The only raw service-role client is `admin.server.ts`; marker-protected Auth creation/deletion requires actor, reason, and correlation context | PASS |
| Durable privileged audit | A service-role-only, security-invoker RPC validates an active administrator and appends immutable STARTED plus terminal audit events | PASS |
| View safety | Exhaustive database tests reject any public view without `security_invoker=true`; private schema remains unavailable to browser roles | PASS |
| Storage boundary | D-18 remains fail-closed: zero UniMind buckets and zero anon/authenticated object policies; signed upload and upsert paths are denied | PASS |
| Session revocation | Current database access and refresh are revoked immediately; an issued access JWT is never durable authority and is bounded to one hour | PASS |
| Delivery | Exact candidate approved and merged; merged `main`, Supabase Preview, Vercel Production, public smoke, browser, and logs all verified | PASS |

## Commands and platform checks

| Check | Sanitized result |
| --- | --- |
| `corepack pnpm verify` | PASS: format, lint, strict types, module/SQL/CI policy, 714-file secret scan, 246 unit tests, 7 credential-free integration tests, 22 security tests, evaluation/load contracts, 2 Chromium flows, production build, and client-artifact scan |
| Focused local checks | `format:check`, `test:security`, `check:sql`, `typecheck`, `git diff --check`, full diff/stat, and repository secret scan passed |
| PR run `34246359346` | Dependency audit, application, and disposable database/Auth jobs passed at exact candidate `b624426` |
| Disposable database job `102129830236` | Populated upgrade, two resets, 22-migration parity, 24 pgTAP files, advisors, generated-type zero diff, 9 database/Auth integration tests, 22 security tests, and cleanup passed |
| GitHub artifacts | Database artifact `10064384453`, digest `sha256:c362a076eab5382ee324b5b8dfb6929c5c19a15ff44555d29db62d1e138cbfdd`; application artifact `10064195431`, digest `sha256:2a77a6dcedce2a6b8b49fb5f1d84f7e749765cdad57e13518bb90d3e92987ae8` |
| GitHub review and merge | Owner review `5144013891` approved exact `b624426`; PR `#22` merged unchanged as `f015d3a` |
| Merged-main run `34247852416` | Application and disposable database/Auth jobs passed; dependency audit was correctly skipped after the exact PR-head pass |
| Supabase Preview preflight | Prior ledger head `20260907210213`; new RPC absent; zero Storage buckets and zero READY sources |
| Guarded hosted migration | Exact prior-head and object-absence guards passed; migration and ledger row committed atomically; final head `20260908122500` |
| Hosted metadata/invariants | Security invoker, `search_path=""`, anon/authenticated denied, service role allowed, zero unsafe public views, zero Storage buckets/client policies |
| Hosted rollback smoke | Synthetic administrator audit success and non-admin denial passed; rollback left zero Auth user, profile, role, and audit residue |
| Supabase advisors | Security: 0 errors, 0 warnings. Performance: 0 errors, 0 warnings |
| Vercel environment | Required keys present; Production routes to Preview Supabase; provider mode mock; budget 0; providers and public telemetry disabled |
| Exact Vercel deployment | `dpl_9qZPCzBoTUE2iCokboUCHPU8uFkc` is READY/Production and records Git SHA `b624426ca5c30e7a8dd28f1676abd4e24beab9ba` |
| Public deployment smoke | Six checks passed at `https://project-xwrez.vercel.app`: live/ready GET 200, POST 405, correct application identity, synthetic/mock guard |
| Browser and logs | Browser rendered UniMind, Synthetic only, Mock only, and exact T08 release marker with zero console errors; deployment logs contained expected 200/405 requests and zero warning/error/fatal events |

The hosted ledger statement is 2,936 characters with CRLF SHA-256 `b21dea042b83ea0226293dde6270b6d9b7b87342b192054b14ac45bdd292693b`. Normalizing its 118 CRLF line endings to repository LF form yields the 2,818-byte release fingerprint above; the SQL is otherwise identical.

## Review and correction loop

1. Initial run `34227427548` proved the new pgTAP file but found that the older exhaustive public-function inventory omitted the new service-only RPC. A distinct service-role inventory was added without expanding authenticated execution.
2. Run `34245424683` then exposed PostgreSQL's spaced catalog signature rendering. The exact catalog form was fixed; final run `34246359346` passed every job.
3. The first promoted Vercel rebuild inherited superseded commit `bb3694b`. Metadata inspection caught it despite healthy behavior. Production was rebuilt and promoted from exact final candidate `b624426`, and every smoke/browser/log check was repeated against `dpl_9qZPCz...`.

## Security, privacy, and environment review

- No service credential enters browser code or evidence; only public configuration is client-visible.
- No real student/source data, private material, paid provider call, nonzero budget, storage-provider selection, content release, rights mutation, raw deletion, or Beta mutation occurred.
- Preview was changed only by the reviewed forward migration and a transactionally rolled-back synthetic smoke.
- The paused Beta project remained untouched. Superseded Vercel deployments are retained as immutable forensic history but have no production alias.

## Rollback/disable procedure

Do not rewrite or reverse the hosted migration. Disable privileged Auth callers, revert the application to the last reviewed build, and apply a reviewed forward migration that revokes the audit RPC from `service_role` while preserving audit evidence. Vercel can repoint the production alias to prior known-ready deployment `dpl_6uMepeBP1G5bapL9mCt2AbEn5wC3` independently of the database.

## Decision

PASS. WP02-T08 is implemented, reviewed, tested, merged, promoted, production-verified, and clean. Application callers preserve RLS, privileged Auth operations are narrowly audited, unsafe views and Storage access fail closed, and revocation behavior matches the approved policy.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Executor and technical reviewer | PASS | 2026-09-08 |
| `unimind989-sys` | GitHub write-access reviewer | APPROVED exact `b624426` | 2026-09-08 |
| Ahmed | Protected RLS/shared-promotion confirmation | APPROVED | 2026-09-08 |
| Ziad (confirmation relayed by Ahmed) | Protected RLS/shared-promotion confirmation | APPROVED | 2026-09-08 |
