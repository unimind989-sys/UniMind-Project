# Gate report: WP01-T09 isolated locked Beta

**Status:** CONDITIONAL PASS

**Environment:** protected external locked Beta

**Commit SHA:** `40214573fe59ec867732fb3c06c6520fd96e3904`

**Release/config fingerprint:** `wp01-t09-4021457-beta`; Supabase safe fingerprint `sha256:6ad364ad022a`; Vercel target `preview`; provider mode `mock`; approved provider budget `0`; telemetry disabled

**Migrations:** `supabase/migrations/20260824235549_extensions_and_schemas.sql`

**Dataset/fixture versions:** Foundation synthetic schema only; no Auth users, Storage buckets, Edge Functions, or table rows; no real Beta data

**Agent executor:** Codex `/root`

**Human reviewer(s):** Ahmed approved the eight-step transition and confirmed the credential-retirement actions on 2026-08-28; Beta unlock/go-live remains a separate Ahmed-and-Ziad protected gate

**Started/finished (UTC):** 2026-08-28 / 2026-08-28T19:55:15Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Separate provider scope | Beta has its own Supabase Free project, Vercel Hobby project, keys, callback, database credential, placeholders, and deployment authority | `unimind-beta` is separate from Preview and has no Git integration | PASS | Signed-in provider inspection and CLI scope checks |
| Replacement Supabase keys | Named publishable and secret keys authenticate only to Beta | Both replacement keys returned HTTP 200 from the matching Supabase Auth settings seam before legacy retirement | PASS | Redacted live-key check |
| Legacy credential retirement | Legacy API keys, database password, management token, and transitional workstation profile are retired only after replacement validation | Legacy `anon`/`service_role` disabled; database password rotated and validated; shared retired management token revoked; `.local/supabase/ci.env` deleted | PASS | Signed-in provider actions and filesystem absence check |
| Vercel secret scope | Matching database and server values are Beta-only Preview secrets | `DATABASE_URL` and four other server credentials are Secret and Preview-scoped; no Production-scoped variable was added | PASS | Pinned CLI environment listing |
| Exact-commit deployment | Rebuild the exact Preview-tested commit under Beta scope, never Production | Protected deployment [endpoint](https://unimind-beta-ibwh9o9me-unimind2.vercel.app) is `READY`, target `preview`, and renders release `wp01-t09-4021457-beta` | PASS | Pinned CLI deployment/inspection and authenticated page inspection |
| Lock/protection | Beta remains inaccessible to students and has no public production domain | Anonymous root request returned `302` to Vercel Authentication; project remains Git-disconnected and Preview-targeted | PASS | Redacted HTTP status and signed-in provider inspection |
| Empty/isolated data | No real or Preview data and no shared namespace | No Auth users, Storage buckets, Edge Functions, or fixture rows; the versioned foundation table remains | PASS | Supabase dashboard inventory |
| Runtime identity | Locked candidate is the expected commit/configuration | Authenticated page contains `UniMind`, `Synthetic only`, `Mock only`, and `wp01-t09-4021457-beta` | PASS | Authenticated rendered page inspection |
| Locked-Beta health proof | Verify live/ready while protection remains active and without using Preview smoke mode | Root page is ready and protected. Direct health navigation is blocked by the in-app browser client, and no bypass secret was created. | PENDING / BLOCKING | WP01-T09-REMOTE-HEALTH |
| Real-data backup gate | Real Beta data remains blocked until encrypted backup/restore passes or separately approved capacity exists | Beta is empty; backup/restore blocker remains explicit | PASS | Environment matrix and provider inventory |
| Zero-cost boundary | No paid plan, trial, add-on, production domain, paid provider, or billable resource | Supabase Free plus Vercel Hobby only; provider flags remain mock/false and budget remains zero | PASS | Provider plan/settings inspection and environment fingerprint |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | ---: | --- |
| 2026-08-28 | Matching replacement-key Auth checks | 0 | Publishable and secret keys each returned HTTP 200 from the matching project |
| 2026-08-28 | Signed-in Supabase legacy-key disable and database-password rotation | 0 | New paths validated first; no key/password value was printed or committed |
| 2026-08-28 | Pinned Supabase CLI database lint against the rotated pooler credential | 0 | Connected successfully with no credential disclosure |
| 2026-08-28 | Pinned Vercel CLI `env add DATABASE_URL preview --force --sensitive --project unimind-beta` | 0 | One Preview-scoped Secret entry confirmed; value supplied through stdin and redacted |
| 2026-08-28 | Pinned Vercel CLI `deploy --target preview --force --project unimind-beta` | 0 | Rebuilt exact commit `4021457`; final state `READY`, target `preview` |
| 2026-08-28 | Authenticated page and anonymous protection checks | 0 | Release/identity markers passed; anonymous root redirected to Vercel Authentication |
| 2026-08-28 | Supabase state inventory | 0 | No users, buckets, functions, or data rows; versioned foundation schema preserved |
| 2026-08-28 | Retired token/profile cleanup | 0 | Management token absent; `.local/supabase/ci.env` absent |
| 2026-08-28 | `corepack pnpm verify` | 0 | Format/lint/types/boundaries/CI policy; 629-file secret scan; 230 unit tests; integration/security/evaluation/load; 2 Playwright checks; production build; client-artifact scan |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Pull-request code attempts Beta access | Beta secrets and deployment authority are absent from Git-connected Preview | Beta has no Git integration and uses its own Preview-scoped secrets | PASS | Vercel project binding inspection |
| Anonymous Beta access | Protection denies the page | Root redirected to Vercel Authentication | PASS | HTTP 302 proof |
| Beta unlock/production alias | No unlock, Production deployment/domain, or real data in WP01-T09 | Final candidate target is `preview`; Beta remains protected and empty | PASS | Deployment inspection and state inventory |
| Protected health inspection | Do not bypass Standard Protection | Health proof remains pending instead of generating a bypass | CONDITIONAL | WP01-T09-REMOTE-HEALTH |
| Rollback | Recover by rebuilding an exact reviewed commit under active Beta credentials, never copy Preview state | The retired-config deployment remains recorded but is not eligible for restore after rotation; no actual failure/rollback exercise was executed | CONDITIONAL | `docs/runbooks/environment-promotion.md` |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T09-REMOTE-HEALTH | Blocking | Standard Protection and the in-app browser client prevent the required direct health proof without a credential/bypass path. The approved plan forbids creating an automation-bypass secret. | WP01-T09 executor / Ahmed decision | Before WP01-T09 PASS | Package gate and any claim of locked-Beta health completion |
| WP01-T09-ROLLBACK | Required rehearsal | Exact-commit Beta rebuild passed, but an actual rollback to the recorded prior protected Beta deployment was not executed. | WP01-T09 executor | Before WP01-T09 PASS | Final environment gate |
| WP01-T09-BYPASS | Resolved | An exploratory Vercel CLI request generated an automation-bypass token automatically. It was revoked immediately; the final project check reported zero bypass entries, and no value was retained. | Codex `/root` | Resolved 2026-08-28 | None |
| WP01-T09-DEPLOY-CLASSIFICATION | Resolved | Early CLI/Git attempts created failed Production-classified records while configuration was incomplete. They failed before the application became ready; no Production deployment/domain became active. Final candidate explicitly uses target `preview`. | Codex `/root` | Resolved 2026-08-28 | None |

## Security and privacy review

- [x] Evidence contains no secret, password, token, project reference, internal provider ID, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Replacement public/server keys and rotated database credential were tested only against their matching project; Preview values were never placed in Beta scope.
- [x] Beta remains locked, empty, mock-only, and blocked from real data, unlock, release, and go-live.

## Rollback/disable procedure

Keep Beta locked. Rebuild exact commit `4021457` under the active Beta scope and credentials, then set the resulting exact callback as the Site URL. Use only forward migrations for database compatibility. Do not restore a deployment built with retired credentials, unlock Beta, create a Production alias/domain, point Beta at Preview, re-enable legacy keys as a routine rollback, or copy Preview credentials/data.

## Decision

CONDITIONAL PASS for isolated locked-Beta provisioning. Provider separation, replacement credentials, retirement, protected exact-commit deployment, empty state, and zero-cost boundaries pass. WP01-T09 remains in progress until protected health and actual rollback evidence exist. This is not Beta unlock, release, go-live, or authorization for real data.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | CONDITIONAL PASS | 2026-08-28 |
| Ahmed | Human checkpoint | Approved transition/actions; evidence review pending | 2026-08-28 |
| Ahmed + Ziad | Protected Beta unlock/go-live | Not requested; remains blocked | Pending |
