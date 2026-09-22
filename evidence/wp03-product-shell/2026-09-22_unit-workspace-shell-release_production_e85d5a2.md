# Gate report: WP03-T04 unit workspace shell protected release

**Status:** PASS

**Environment:** Supabase Preview and Vercel Production; deterministic synthetic workspace/catalog fixtures and mock providers only

**Commit SHA:** merged `main` commit `e85d5a237f2886eae3e84575d065a3c99cd17338`; reviewed PR head `dda4069414a339b7cb472525acfee7a8868bc5ee`; both resolve to Git tree `5b9c14dfac8d53230fdba77dd81c92eaa9dafc90`

**Release/config fingerprint:** `wp03-t04-e85d5a2-preview`; Vercel Production deployment `dpl_k6YpGerq6sT7JzbGacfrpQmYYGp9`; Next.js `16.3.4`; synthetic-only; provider mode `mock`; provider budget `0`; generation, embedding, and transcription disabled

**Migration:** `20260921190508_unit_workspace_scope.sql`; SHA-256 `16427548664D931F6BF13FFBDDBC34D505C8FDDA84EE559E0BAA453FF1915CC7`; Supabase Preview project `ynlaejacnakvinlpthnb`

**Agent executor:** Codex `/root`

**Human reviewer:** Ahmed requested end-to-end completion; GitHub owner `unimind989-sys` approved exact head `dda4069`; D-22 supplied the standing Ahmed-and-Ziad authorization for task-scoped non-financial protected delivery

**Started/finished (UTC):** 2026-09-21 / 2026-09-21T21:41:00Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Protected source identity | Reviewed head, merge, and deployment source are exactly bound | `dda4069^{tree}` and `e85d5a2^{tree}` both equal `5b9c14d`; Vercel cloned `dda4069` | PASS | Local Git objects, GitHub status, Vercel build log |
| Protected-main delivery | Exact-head review and required checks pass before merge | PR #39 owner-approved exact head `dda4069`; run `35655296786` passed; merged as `e85d5a2`; merged-main run `35656053522` passed | PASS | GitHub PR and Actions |
| Workspace authorization | Every surface resolves the caller's cohort/unit through server-authoritative scope | Stable security-invoker RPC with empty search path; authenticated execute only; forged, inactive, and release-stale cases reject in pgTAP/application/E2E checks | PASS | 9 new pgTAP assertions, unit/security/E2E gates, hosted metadata |
| Session persistence | Mocked chat start/switch is durable and caller/scope owned | Session creation, refresh persistence, switching, wrong-caller/wrong-unit, and stale-release behavior passed | PASS | Workspace application/adapter and Playwright suites |
| Truthful shell | Overview and child routes expose localized scope and explicit unavailable features | Overview, chat, Studio, quiz, evidence, reporting, source/material/quota state, and safe boundaries rendered without implying unavailable behavior works | PASS | Local 24-case E2E and production rendered checks |
| Arabic font delivery | Arabic must use the intended custom face, not a Latin fallback | Rendered platform-font inspection reported custom `Noto Sans Arabic`; the previous Arabic path had resolved through Manrope fallback as Arial | PASS | Local and production CDP platform-font inspection |
| Arabic visual balance | Arabic must not look materially smaller/weaker than equivalent English | Locale-root typography uses the existing Noto face, 450 body weight, 1.65 line height, `font-size-adjust: 0.56`, and role sizing; Arabic H1 rendered at 36.48 px versus English H1 at 34.4 px while preserving hierarchy | PASS | Computed-style and rendered comparison |
| Responsive typography/layout | Normal/narrow RTL/LTR and mixed content have no clipping or vertical regressions | At 390x844 Arabic: document width 390, minimum interactive control 44 px, zero clipped controls, correct RTL; at 640 px English: document width 640, custom Manrope, correct LTR; desktop Arabic had no overflow; mixed `Anatomy / علم التشريح` remained coherent | PASS | Production Playwright plus local zoom/narrow suite |
| English preservation | English typography remains unchanged and clear | Custom Manrope continued to render with the existing hierarchy and no overflow | PASS | Platform-font/computed-style inspection |
| Hosted migration | Exact SQL and one ledger row apply atomically | Prior head guard held; target ledger/object absence held; ledger now contains one `unit_workspace_scope` statement and function metadata/grants match reviewed SQL | PASS | Signed-in Supabase guarded transaction and postflight |
| Hosted database hygiene | No new high-severity advisor finding | Security Advisor reported 0 errors and 0 warnings after migration | PASS | Supabase Advisors |
| Production routing | Established public domain resolves to the final Ready deployment | `project-xwrez.vercel.app` resolves to `dpl_k6YpGerq6sT7JzbGacfrpQmYYGp9`, target Production, status Ready | PASS | Vercel alias and inspect |
| Release identity and safe mode | Public fingerprint matches this release and runtime remains mock-only | Release is `wp03-t04-e85d5a2-preview`; seven deployment-smoke checks passed | PASS | Public home and smoke gate |
| Protected route | Anonymous `/learn` reaches the localized account gate | `/learn` resolved to `/login?lang=en&next=%2Flearn` and rendered the access flow | PASS | Production Playwright |
| Runtime health | Public contracts and error/warning scans remain clean | Seven smoke checks passed; rendered pages logged no browser errors; deployment-scoped error/warning scans returned no logs | PASS | Public smoke, Playwright, Vercel logs |

## Commands and durable proof

| UTC date | Command/test ID | Exit code | Sanitized result |
| --- | --- | --- | --- |
| 2026-09-21 | `corepack pnpm verify` on the implementation candidate | 0 | Formatting, lint, strict typing, boundaries, SQL/policy/secret checks, 344 unit, 15 integration with 2 intentional hosted-only skips, 24 security, 3 evaluation, 5 load, 24 E2E, optimized build, and client-artifact scan passed. |
| 2026-09-21 | Focused workspace Playwright | 0 | 5/5 workspace cases passed, including custom Arabic/English platform fonts, 390 px RTL, 44 px controls, zoom geometry, keyboard focus, and safe denial. |
| 2026-09-21 | GitHub Actions exact-head run `35655296786` | 0 | Dependency audit, application gate, Vercel Preview, disposable upgrade/two resets/migration parity, all pgTAP/advisors, generated types/parity, integration/security, and cleanup passed. |
| 2026-09-21 | PR #39 review and merge | 0 | `unimind989-sys` approved exact head `dda4069` at `2026-09-21T21:14:48Z`; merged at `2026-09-21T21:15:04Z` as `e85d5a2`. |
| 2026-09-21 | GitHub Actions merged-main run `35656053522` | 0 | Merged `main` passed the application and complete disposable database jobs. |
| 2026-09-21 | Supabase guarded migration transaction | 0 | Expected prior head `20260914112000` and target absence held; exact migration and one ledger statement committed once. |
| 2026-09-21 | Supabase metadata/privilege/operational postflight | 0 | Ledger, stable invoker mode, empty search path, authenticated allow, anonymous deny, and empty-result hosted execution passed; the shared environment contains no synthetic workspace fixture. |
| 2026-09-21 | Supabase Security Advisor | 0 | 0 errors and 0 warnings. |
| 2026-09-21 | Vercel promotion/redeploy/alias | 0 | Exact reviewed source was promoted, production fingerprint was corrected to `wp03-t04-e85d5a2-preview`, and final deployment `dpl_k6YpGerq6sT7JzbGacfrpQmYYGp9` reached Ready on the established domain. |
| 2026-09-21 | `corepack pnpm smoke:deployment -- --base-url https://project-xwrez.vercel.app --target preview` | 0 | Seven live/ready, write-denial, application identity, synthetic/mock, and icon checks passed. |
| 2026-09-21 | Production rendered verification | 0 | Arabic and English workspace states, custom fonts, RTL/LTR, normal/narrow geometry, mixed content, protected-route redirect, and browser console checks passed. |
| 2026-09-21 | Final Vercel error/warning scans | 0 | No runtime error or warning logs found for the final production deployment. |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status |
| --- | --- | --- | --- |
| Fresh-checkout route typing | CI must reject types that exist only after a local Next build | Initial CI rejected generated `PageProps`; explicit checked-in route prop types replaced the hidden dependency and the full local/exact-head gates passed | PASS |
| Generated RPC parity | Checked-in types must exactly match disposable generated output | Replacement CI isolated a nullable formatting mismatch; generated type alignment was corrected and final exact-head plus merged-main database CI passed | PASS |
| Protected preview smoke | Preview protection must not be mistaken for app failure | Direct anonymous smoke was rejected; authenticated Vercel requests proved all seven semantics before promotion, then the public-domain smoke passed after aliasing | PASS |
| Stale release fingerprint | Public release identity must bind to this source | First promotion exposed the old WP02 label; the non-secret production config was corrected, the same reviewed source was redeployed, and public identity/smoke/render/log checks reran green | PASS |
| Forged/stale workspace | Private existence and labels must not leak | Forged IDs, inactive membership, unit deactivation, and release changes produced the shared non-identifying unavailable boundary | PASS |
| Production rollback | A failed public check must have a known recovery target | Reassign `project-xwrez.vercel.app` to prior deployment `dpl_3tLLtfqMwoLt1zzJqfc6t7pLysWo`; database repair remains forward-only | PASS |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP03-T04-R01 | Closed | Fresh-checkout route globals and generated RPC type parity caused two rejecting CI runs; both defects were corrected before exact-head review. | Codex `/root` | Closed 2026-09-21 | None |
| WP03-T04-R02 | Closed | The first production promotion retained a stale public release label. Production config was updated and the exact reviewed source was redeployed and reverified. | Codex `/root` | Closed 2026-09-21 | None |
| WP03-T04-R03 | Advisory | Vercel reduces the pinned major.minor.patch Node engine to its supported major selection. Build, smoke, rendering, and runtime logs pass. | Repository maintenance | Before beta hardening | None for T04 |
| WP03-T04-R04 | Advisory | `.impeccable/design.json` is stale and the login surface brief is orphaned; neither is an authority for this task and neither was modified. | Product design maintenance | Before the next material design-direction task | None for T04 |
| WP03-T04-R05 | Limitation | Active model runtime identity could not be independently verified. The protected policy floor was recorded, zero workers were used, and all objective gates passed. | Platform/operator | When runtime identity becomes observable | None for T04 |

## Security and privacy review

- [x] No secret, signed URL, private source material, real student data, ordinary chat content, or provider payload appears in this report.
- [x] Workspace metadata remains security-invoker/RLS scoped; anonymous execution is denied and route/query/client state is never authoritative.
- [x] Chat-session persistence remains caller-owned and unit/cohort constrained through application checks and existing RLS.
- [x] Hosted migration metadata, privilege behavior, Security Advisor, public smoke, protected-route rendering, browser console, and runtime logs are clean.
- [x] The release remains synthetic-only, mock-only, provider-disabled, zero-budget, and incurred no paid call or billable resource.

## Rollback/disable procedure

Reassign `project-xwrez.vercel.app` to last-known-good deployment `dpl_3tLLtfqMwoLt1zzJqfc6t7pLysWo`, restore release fingerprint `wp03-t03-1ee9593-preview`, and repeat smoke, protected-route, rendered typography, and error/warning checks. The database migration is forward-only: revoke the new function grant or ship a reviewed forward repair; never remove the migration ledger row or rewrite shared migration history. No provider, paid-call, real-user, publication, or unlock rollback is required.

## Decision

WP03-T04 is complete. The exact reviewed source passed local, exact-head, merged-main, and disposable database gates; merged through protected `main`; applied atomically to Supabase Preview; and shipped as a Ready Vercel Production deployment with a source-bound public fingerprint. The unit workspace authorization/session seams, truthful localized surfaces, safe boundaries, systemic Arabic typography correction, English preservation, responsive geometry, smoke, auth gate, console, and runtime-log checks are green.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | TECHNICAL PASS | 2026-09-21 |
| Ahmed | Requester | END-TO-END COMPLETION REQUESTED | 2026-09-21 |
| `unimind989-sys` | Repository owner reviewer | APPROVED exact head `dda4069` under D-22 | 2026-09-21 |
