# Gate report: WP01-T09 isolated Preview

**Status:** CONDITIONAL PASS

**Environment:** protected external Preview

**Commit SHA:** `40214573fe59ec867732fb3c06c6520fd96e3904`

**Release/config fingerprint:** `wp01-t09-4021457-preview`; Supabase safe fingerprint `sha256:5575d1c3d806`; Vercel target `preview`; provider mode `mock`; approved provider budget `0`; telemetry disabled

**Migrations:** `supabase/migrations/20260824235549_extensions_and_schemas.sql`

**Dataset/fixture versions:** Foundation synthetic schema only; no Auth users, Storage buckets, Edge Functions, or table rows

**Agent executor:** Codex `/root`

**Human reviewer(s):** Ahmed approved the eight-step transition and confirmed the credential-retirement actions on 2026-08-28; ordinary evidence review remains pending

**Started/finished (UTC):** 2026-08-28 / 2026-08-28T19:55:15Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Separate provider scope | Preview has its own Supabase Free project, Vercel Hobby project, keys, callback, database credential, placeholders, and deployment authority | `unimind-preview` is separate from Beta and is the only Vercel project connected to GitHub | PASS | Signed-in provider inspection and CLI scope checks |
| Replacement Supabase keys | Named publishable and secret keys authenticate only to Preview | Both replacement keys returned HTTP 200 from the matching Supabase Auth settings seam before legacy retirement | PASS | Redacted live-key check |
| Legacy credential retirement | Legacy API keys, database password, management token, and transitional workstation profile are retired only after replacement validation | Legacy `anon`/`service_role` disabled; database password rotated and validated; shared retired management token revoked; `.local/supabase/development.env` deleted | PASS | Signed-in provider actions and filesystem absence check |
| Vercel secret scope | Matching database and server values are Preview-only secrets; pull requests receive no Beta values | `DATABASE_URL` and four other server credentials are Secret and Preview-scoped; no Production-scoped variable was added | PASS | Pinned CLI environment listing |
| Exact-commit deployment | Rebuild the reviewed commit after rotation as a Vercel Preview deployment | Protected deployment [endpoint](https://unimind-preview-esvzwcbgg-unimind2.vercel.app) is `READY`, target `preview`, and renders release `wp01-t09-4021457-preview` | PASS | Pinned CLI deployment/inspection and authenticated page inspection |
| Protection | Anonymous visitors cannot reach the application | Anonymous root request returned `302` to Vercel Authentication; authenticated page remained available | PASS | Redacted HTTP status and signed-in browser proof |
| Synthetic/mock-only | Preview displays the approved identity and cannot claim real-provider mode | Page contains `UniMind`, `Synthetic only`, and `Mock only`; no approved-real-mode marker | PASS | Authenticated rendered page inspection |
| Data isolation | No Beta or real data; no reset or manual schema repair | No Auth users, Storage buckets, Edge Functions, or fixture rows; the versioned foundation table remains | PASS | Supabase dashboard inventory |
| Remote six-check health smoke | Live/ready GET 200 with exact body and `no-store`; POST 405; application and mock checks pass | Application and mock checks pass. Direct health navigation is blocked by the in-app browser client, while the credential-free command receives Standard Protection. No bypass secret was created to work around the approved boundary. | PENDING / BLOCKING | Local six-check evidence remains `2026-08-27_environment-isolation_local_a7c9d6b.md` |
| Zero-cost boundary | No paid plan, trial, add-on, production domain, paid provider, or billable resource | Supabase Free plus Vercel Hobby only; provider flags remain mock/false and budget remains zero | PASS | Provider plan/settings inspection and environment fingerprint |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | ---: | --- |
| 2026-08-28 | Matching replacement-key Auth checks | 0 | Publishable and secret keys each returned HTTP 200 from the matching project |
| 2026-08-28 | Signed-in Supabase legacy-key disable and database-password rotation | 0 | New paths validated first; no key/password value was printed or committed |
| 2026-08-28 | Pinned Supabase CLI database lint against the rotated pooler credential | 0 | First attempt occurred during propagation and was rejected; retry after five seconds connected successfully |
| 2026-08-28 | Pinned Vercel CLI `env add DATABASE_URL preview --force --sensitive --project unimind-preview` | 0 | One Preview-scoped Secret entry confirmed; value supplied through stdin and redacted |
| 2026-08-28 | Pinned Vercel CLI `deploy --target preview --force --project unimind-preview` | 0 | Rebuilt exact clean commit `4021457`; final state `READY`, target `preview` |
| 2026-08-28 | Authenticated page and anonymous protection checks | 0 | Release, identity, synthetic/mock markers passed; anonymous root redirected to Vercel Authentication |
| 2026-08-28 | Supabase state inventory | 0 | No users, buckets, functions, or data rows; versioned foundation schema preserved |
| 2026-08-28 | `corepack pnpm verify` | 0 | Format/lint/types/boundaries/CI policy; 629-file secret scan; 230 unit tests; integration/security/evaluation/load; 2 Playwright checks; production build; client-artifact scan |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Publishable key sent to the REST schema root | Do not interpret an endpoint-specific denial as a key failure | REST root returned 401; the supported Auth settings seam returned 200 for the same key | PASS | Replacement-key check |
| Password rotation propagation | Fail closed until the new password authenticates | Initial lint received password-authentication failure; retry after five seconds passed before cleanup continued | PASS | Rotated database check |
| Anonymous deployment access | Protection denies the page | Root redirected to Vercel Authentication | PASS | HTTP 302 proof |
| Protected health automation | Do not weaken protection or create a bypass merely to make the command green | Remote six-check remains explicitly pending | CONDITIONAL | WP01-T09-REMOTE-HEALTH |
| Rollback | Recover by rebuilding an exact reviewed commit under active credentials and use forward-only database repair | The retired-config deployment remains recorded but is not eligible for restore after rotation; no actual failure/rollback exercise was executed | CONDITIONAL | `docs/runbooks/environment-promotion.md` |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T09-REMOTE-HEALTH | Blocking | Standard Protection blocks the credential-free smoke command, and the in-app browser client blocks direct API-route navigation. The approved plan forbids creating an automation-bypass secret. | WP01-T09 executor / Ahmed decision | Before WP01-T09 PASS | Package gate and any claim of remote six-check completion |
| WP01-T09-ROLLBACK | Required rehearsal | Same-commit promotion/rebuild passed, but an actual rollback to the recorded prior protected deployment was not executed. | WP01-T09 executor | Before WP01-T09 PASS | Final environment gate |
| WP01-T09-BYPASS | Resolved | An exploratory Vercel CLI request generated an automation-bypass token automatically. It was revoked immediately; the final project check reported zero bypass entries, and no value was retained. | Codex `/root` | Resolved 2026-08-28 | None |
| WP01-T09-DEPLOY-CLASSIFICATION | Resolved | Early CLI/Git attempts created failed Production-classified records while configuration was incomplete. They failed before the application became ready; no Production deployment/domain became active. Final candidates explicitly use target `preview`. | Codex `/root` | Resolved 2026-08-28 | None |

## Security and privacy review

- [x] Evidence contains no secret, password, token, project reference, internal provider ID, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Replacement public/server keys and rotated database credential were tested only against their matching project; Beta values were never placed in Preview scope.
- [x] Browser/CLI output, repository state, and environment-variable metadata were reviewed without committing values.

## Rollback/disable procedure

Keep Preview protected. Rebuild exact commit `4021457` under the active Preview scope and credentials, then set the resulting exact callback as the Site URL. Use only forward migrations for database compatibility. Do not restore a deployment built with retired credentials, point Preview at Beta, enable legacy keys as a routine rollback, or copy Beta credentials/data.

## Decision

CONDITIONAL PASS for isolated Preview provisioning. Provider separation, replacement credentials, retirement, protected exact-commit deployment, synthetic/mock-only rendering, empty state, and zero-cost boundaries pass. WP01-T09 remains in progress until protected remote health and actual rollback evidence exist.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | CONDITIONAL PASS | 2026-08-28 |
| Ahmed | Human checkpoint | Approved transition/actions; evidence review pending | 2026-08-28 |
