# Gate report: WP03-T06 audited admin actions protected release

**Status:** PASS

**Environment:** GitHub-hosted disposable Supabase CI, Supabase Preview, and Vercel Production; synthetic fixtures and mock providers only

**Commit SHA:** PR #50 head `190f6132914f443b50a1d460b5db32f7d96769eb`; protected merge `8110ab0f2a9ee3899047d5be5c22309624f8fbca`. Both resolve to tree `6db22425af7dd7da8800e8012c8f0d82dd7fea17`.

**Release/config fingerprint:** `wp03-t06-8110ab0-preview`; Vercel Production deployment `dpl_41HGBsNRN5tM2MMoRdozeRRjLgpa`, public alias `project-xwrez.vercel.app`; synthetic-only, mock-only, no new provider or spending configuration

**Migration:** `20260924134026_audited_admin_actions.sql`; normalized SHA-256 `9943e56bdec4a141874feb6d592713251d58f7b77c02f8abf628ecbecbe5476e`; approved Supabase Preview project fingerprint `sha256:5575d1c3d806`

**Agent executor:** Codex `/root`

**Human checkpoint:** Ahmed accepted the exact rendered EN/AR synthetic candidate `b67de4f300fbbae088bfca116452fbae013d259b` in the task conversation, receipt `message:wp03-t06-accept-20260924T172119Z` at `evidence/wp03-product-shell/2026-09-24-wp03-t06-founder-design-receipt.json`. D-22 supplies standing Ahmed-and-Ziad authorization for non-financial delivery. GitHub account `aboayman-oss` gave executor-controlled distinct-account approval to PR #50 head `190f613`; this is account separation, not independent human review or an in-product founder confirmation.

**Started/finished (UTC):** 2026-09-24 / 2026-09-24T23:11:49Z

## Scope and acceptance criteria

| Criterion | Result | Status |
| --- | --- | --- |
| Six governed actions and exact trust boundary | Frozen matrix is implemented by typed domain/application/server seams and one service-role RPC path. Guarded pgTAP proved 71/71 synthetic assertions; local unit, integration, and security layers passed. | PASS |
| Two distinct founder confirmations | Protected candidates bind actor, exact target/version, prerequisites, and fingerprint; one founder, duplicate identity, stale candidate, or changed flag configuration rejects. Preview has zero founder principal and admin command rows, so no live protected transition was invoked. | PASS |
| Closed real and financial exposure | Hosted Preview has zero enabled non-mock feature flags and zero nonzero budget caps. Production home reports Synthetic only and Mock only with the new release ID. No real provider, private source, raw deletion, paid call/resource, or nonzero cap was enabled. | PASS |
| Bilingual and accessible behavior | Local 39/39 browser tests covered EN/AR desktop and 390 px mobile, keyboard/focus, success/error/stale/pending/blocked/containment with no-write deterministic mocks. Ahmed accepted the rendered candidate. Live production EN/AR queue, Arabic RTL, blocked predicate, pending second founder, mock containment success, stale rejection, and recoverable error were inspected; fresh browser logs were empty. | PASS |
| Exact protected source | Required `application`, `dependency-audit`, and `database-ci` passed at PR head `190f613` in run `36045288034`; branch protection reported clean/approved. Protected merge `8110ab0` had identical tree and merged-main CI run `36045868676` passed. | PASS |
| Hosted migration integrity | Exact prior Preview ledger head `20260922143605` and target-object absence were checked. One transaction locked the ledger, rechecked prior head and target absence, applied the reviewed SQL, and inserted its full SQL as the single ledger statement. Editor clipboard round trip matched SHA-256 `c2bbfe47810073ef752c1ea5824693207657a4b639dd16d71cfdd27d0fca060a`. Hosted normalized migration hash matches the repository. | PASS |
| Hosted grants and hygiene | Both new public admin RPCs reject anon/authenticated EXECUTE and allow service_role. Five new private tables have RLS and no anon/authenticated direct SELECT. Fresh Supabase Security Advisor showed 0 errors and 0 warnings. | PASS |
| Affected production routing | Ready Production deployment metadata reports source commit `8110ab0` and reviewed tree; alias resolves to that deployment. Seven public deployment smoke checks passed; anonymous `/admin` redirected to localized sign-in. Error, warning, and HTTP 500 runtime scans returned zero entries. | PASS |

## Commands and durable proof

| UTC date | Command or check | Result |
| --- | --- | --- |
| 2026-09-24 | Local `corepack pnpm verify` on final code/SQL | Formatting, lint, current/fresh TypeScript, boundaries, SQL/policy/secret checks, 433 unit, 15 mock integration with 2 hosted-only skips, 31 security, 3 evaluation, 5 load, 39 browser, production build, and client artifact scan passed. The 71-assertion SQL suite was never run locally. |
| 2026-09-24 | PR #50 exact-head GitHub run `36045288034` at `190f613` | Required application, dependency, and guarded database jobs passed; pgTAP 71/71, advisors, generated-type parity, integration/security, reset/upgrade, and disposable cleanup passed. |
| 2026-09-24 | Protected PR review and merge | `aboayman-oss` approved the exact head under D-22, marked executor-controlled. PR merged without bypass as `8110ab0`; merged tree equals reviewed tree. |
| 2026-09-24 | Merged-main GitHub run `36045868676` | Application and database CI passed on `8110ab0`; dependency audit was skipped by the main-branch workflow after passing on PR head. |
| 2026-09-24 | Supabase Preview guarded SQL editor transaction | Project fingerprint matched `sha256:5575d1c3d806`; prior head and target absence held; transaction returned success. Ledger head became `20260924134026`, one stored statement, normalized hosted SHA-256 matched `9943e56b...be5476e`. |
| 2026-09-24 | Supabase Preview postflight and fresh Security Advisor | Both RPC grants service-role-only; all five new private tables RLS-enabled with direct anon/authenticated read denied; zero founder/command rows; zero enabled non-mock flags and nonzero caps; 0 advisor errors and warnings. |
| 2026-09-24 | Vercel Production deployment and API inspection | Existing Hobby project `unimind-preview` built Next.js 16.3.4 and deployment `dpl_41HGBsNRN5tM2MMoRdozeRRjLgpa` reached READY. Deployment API metadata reports exact source SHA/tree and CLI source. Pre-alias protected-deployment `vercel curl` live/ready and home release/mode checks passed. |
| 2026-09-24 | Public alias, `corepack pnpm smoke:deployment`, live browser, logs | Alias moved from prior `dpl_F5kXv2WUEifs1nWC8RRh5d3uEpWt`; seven public checks passed. EN/AR synthetic preview states and anonymous admin redirect passed; Arabic `dir=rtl`, `lang=ar`, and 1270 px document/client widths matched at a 1280 px viewport. Browser console had no errors; error/warning/HTTP 500 deployment log filters each returned zero entries. |

## Negative, retry, and recovery cases

| Case | Actual | Status |
| --- | --- | --- |
| Guarded SQL editor fidelity | Initial small read-only fill showed Monaco insertion behavior. The migration was pasted through the browser clipboard and copied back; LF-normalized text exactly matched all 164,592 expected characters and transaction hash before execution. | PASS |
| Generic SQL warning | Dashboard warned that the migration included destructive operations because it replaces a constraint. The reviewed forward transaction was confirmed only for the approved synthetic Preview target. | PASS |
| Transient Supabase read-only API failure | First RPC grant query returned `Failed to fetch`; retry returned exact role booleans. Migration ledger/hash and later postflight succeeded. | PASS |
| Vercel CLI late fetch failure | Deploy CLI exited 1 after successful build/output upload with `fetch failed`. Independent deployment API inspection found READY and exact source metadata; protected `vercel curl` health/home checks passed before alias assignment. The original alias stayed on the previous deployment until these checks passed. | PASS |
| Protected runtime state | No production founder principal was seeded. One browser session or shared service identity was not counted as two founders, and no real governed mutation was used as proof. | PASS |
| Rollback target | Previous Ready Production deployment `dpl_F5kXv2WUEifs1nWC8RRh5d3uEpWt` was recorded before moving the public alias. | PASS |

## Deviations and limits

- Live Production visual inspection used an EN/AR desktop viewport; 390 px mobile and keyboard/focus behavior were proved on the exact code with deterministic local browser fixtures. No live mobile viewport claim is made.
- Hosted Preview postflight inspected schema, role grants, RLS, aggregate closed-state counts, and advisor output. It did not execute an admin mutation on a real principal; guarded disposable pgTAP and mock application tests supply that behavioral proof.
- The release remains synthetic and mock only. D-04/D-05/D-18/D-19 continue to block real provider, spend, storage, and retention choices.

## Security and privacy review

- [x] No secret, signed URL, private source text, ordinary chat content, provider payload, or unredacted runtime log appears in this report.
- [x] Allowed and forbidden roles/scopes were checked in hosted grants and guarded disposable database tests.
- [x] Browser output, runtime logs, public routing, and Preview Security Advisor were inspected.
- [x] The design receipt is not treated as either in-product founder confirmation.

## Rollback and disable procedure

Reassign `project-xwrez.vercel.app` to last-known-good Ready deployment `dpl_F5kXv2WUEifs1nWC8RRh5d3uEpWt`, then rerun public smoke, admin redirect, rendered bilingual checks, and runtime error scans. The Preview database migration is forward-only: disable the admin mutation seam or revoke EXECUTE through a reviewed forward repair while preserving ledger, audit, and governed state history. Do not reset Preview, delete the migration ledger entry, or enable real provider/storage/spend paths.

## Decision

WP03-T06 meets its mock-only acceptance and protected release gates. The exact reviewed tree passed local, guarded disposable database, exact-head and merged-main CI, hosted Preview schema/grant/advisor checks, and affected Production smoke/render/log proof. In-product protected transitions remain unavailable until two distinct verified principals confirm an exact eligible candidate.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | TECHNICAL PASS | 2026-09-24 |
| Ahmed | Founder design checkpoint | ACCEPTED rendered synthetic candidate `b67de4f` | 2026-09-24 |
| Ahmed and Ziad | Standing non-financial authorization | D-22 applied to protected delivery; no financial authorization inferred | 2026-09-24 |
| `aboayman-oss` | Distinct executor-controlled GitHub account | APPROVED exact PR #50 head; not independent human review | 2026-09-24 |
