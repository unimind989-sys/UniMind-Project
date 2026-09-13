# Gate report: WP03-T01 Study Shelf protected production release

**Status:** PASS

**Environment:** Vercel Production serving deterministic synthetic content only

**Commit SHA:** merged `main` commit `142ac61e20e07a0986e3ca05d813e5f3122d4cdf`; promoted source commit `12c60d629fe4c71b0cfc269006cd4da641e1bdd6`; both resolve to Git tree `e082980d238b64e860654e72e953a63264e371fe`

**Release/config fingerprint:** `wp03-t01-12c60d6-preview`; Vercel deployment `dpl_8DuxtrDanzY9WLe5i7iqahXHWDKC`; Next.js `16.3.4`; synthetic-only; `provider-mode=mock`; provider budget `0`; generation, embedding, and transcription disabled

**Migrations:** NONE — this release changes no database schema, grants, policies, or data

**Dataset/fixture versions:** deterministic synthetic Study Shelf fixture v1; 3 shelves; 17 unit tiles; 16 provenance-tracked synthetic raster plates

**Agent executor:** Codex `/root`

**Human reviewers:** Ahmed + Ziad — separate named protected-release confirmations

**Started/finished (UTC):** 2026-09-12 / 2026-09-13T04:41:46Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Protected release authorization | Separate named approval from Ahmed and Ziad | Ahmed approved the production promotion; Ziad separately approved commit `142ac61` and preview deployment `7B9yrSGWwCkZRsjvYV5RxMdy1AED` | PASS | Recorded human checkpoints for this release |
| Reviewed source identity | Production source must equal the reviewed and merged application tree | `12c60d6^{tree}` and `142ac61^{tree}` both equal `e082980d238b64e860654e72e953a63264e371fe` | PASS | Local Git object verification |
| Protected-main delivery | PR merged with required review and checks | PR `#27` is Merged into `main`; GitHub shows the `unimind989-sys` approval, `5 / 5 checks OK`, merge commit `142ac61`, and deleted delivery branch | PASS | `https://github.com/unimind989-sys/UniMind-Project/pull/27` |
| Production routing | Public production domain resolves to the promoted deployment | `project-xwrez.vercel.app` resolves to `dpl_8DuxtrDanzY9WLe5i7iqahXHWDKC`, target Production, status Ready | PASS | Authenticated Vercel CLI inspection and public browser navigation |
| Release identity | Public foundation page renders the current release fingerprint | `Release: wp03-t01-12c60d6-preview` | PASS | Fresh production browser snapshot |
| Bilingual behavior | Exactly one active interface language with correct document direction | Arabic renders `lang=ar`, `dir=rtl`, one Arabic heading and zero English headings; English renders `lang=en`, `dir=ltr`, one English heading and zero Arabic headings/navigation labels | PASS | Public production browser checks |
| Desktop RTL search layout | Icon and localized input do not overlap | Measured icon-to-input gap is 12 px; no framework error overlay | PASS | Public production desktop geometry check and rendered inspection |
| Mobile navigation layout | Six equal centered tabs/icons with no page overflow | At 360×732, document width is 360 px; width spread is 0.015625 px; maximum tab-center drift is 0.0131 px; maximum icon-center drift is 0.007813 px | PASS | Project-pinned Playwright CLI production check and screenshot |
| Early production health | No browser or runtime error signal after Ready | Mobile browser console reports 0 errors and 0 warnings; Vercel error- and warning-level scans return no logs | PASS | Playwright CLI and Vercel CLI |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-09-12 | GitHub PR `#27` protected-main delivery | 0 | Required review recorded, 5/5 checks passed, and merge commit `142ac61` created on `main`. |
| 2026-09-12 | Vercel preview inspection | 0 | Approved preview `7B9yrSGWwCkZRsjvYV5RxMdy1AED` was Ready and sourced from `12c60d6`. |
| 2026-09-12 | Initial Vercel production promotion | 0 | Production build `dpl_EyuNXmBzAGbQwPAAhmKR2UNXvqDV` became Ready; explicit CLI promotion moved the public domain after automatic custom-domain assignment was skipped. |
| 2026-09-13 | `git rev-parse 142ac61^{tree}` and `git rev-parse 12c60d6^{tree}` | 0 | Both commands returned `e082980d238b64e860654e72e953a63264e371fe`. |
| 2026-09-13 | Production release-marker inspection | 0 | Detected the previous WP02 release label on the otherwise correct WP03 build. |
| 2026-09-13 | Vercel Production `NEXT_PUBLIC_RELEASE_ID` override | 0 | Updated only the public release identifier to `wp03-t01-12c60d6-preview`; no secret or provider setting changed. |
| 2026-09-13 | Exact-source production redeploy and promotion | 0 | `dpl_8DuxtrDanzY9WLe5i7iqahXHWDKC` became Ready and was promoted successfully. |
| 2026-09-13 | `vercel inspect https://project-xwrez.vercel.app` | 0 | Public domain resolved to `dpl_8DuxtrDanzY9WLe5i7iqahXHWDKC`, target Production, status Ready. |
| 2026-09-13 | Desktop production browser verification | 0 | Arabic/English exclusivity, `lang`/`dir`, 12 px RTL search separation, route rendering, and absence of framework overlays passed. |
| 2026-09-13 | Project-pinned Playwright mobile production verification | 0 | 360×732 viewport passed equal-column/tab/icon centering, zero overflow, RTL document state, and no framework overlay. |
| 2026-09-13 | Playwright production console scan | 0 | 0 errors and 0 warnings. |
| 2026-09-13 | Vercel `--level error` and `--level warning` scans since one hour | 0 | No runtime error or warning logs found for the final production deployment. |
| 2026-09-13 | `git rev-list --left-right --count origin/main...HEAD` before evidence branch | 0 | `0 0`; local and remote `main` matched before this evidence-only follow-up. |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Automatic custom-domain assignment is disabled | Promotion must not be called complete until the public domain moves | Initial build was Ready but the public domain still returned the old foundation route; explicit `vercel promote` moved it to the new deployment | PASS | `dpl_EyuNXmBzAGbQwPAAhmKR2UNXvqDV` |
| Stale release identifier | Production fingerprint must identify the shipped WP03 tree | Browser exposed the older WP02 identifier; Production-only public config was corrected and the same source tree was rebuilt | PASS | `dpl_8DuxtrDanzY9WLe5i7iqahXHWDKC` |
| Arabic search overlap | Icon must remain separate from helper/input text in RTL | Measured 12 px gap on public production | PASS | Desktop browser geometry |
| RTL mobile tab ordering | Visual centering must hold even when DOM order is reversed | Centers were compared in visual x-order; all six positions and icons remain centered within 0.014 px | PASS | `.playwright-cli/wp03-prod-mobile-check.js` (ignored local artifact) |
| Local pinned-browser dependency refresh | Verification must not leave the workspace without dependencies | Interrupted setup removed ignored `node_modules`; locked dependencies were restored with `pnpm install --frozen-lockfile --prefer-offline` and the pinned mobile verification then passed | PASS | Local package-manager output |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP03-T01-R01 | Closed release defect | Custom production-domain assignment was skipped on build completion; explicit promotion was required. | Codex `/root` | Closed 2026-09-13 | None |
| WP03-T01-R02 | Closed release defect | Production inherited the previous WP02 public release identifier. The Production-only value was corrected and the reviewed source tree was rebuilt and re-promoted. | Codex `/root` | Closed 2026-09-13 | None |
| WP03-T01-R03 | Observability gap | The Hobby project has no external log drain, Web Analytics, or Speed Insights. Vercel CLI and browser console scans are available and clean; richer monitoring remains future work. | Operations owner | Before beta go-live | Beta observability review, not this synthetic release |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] The production environment remains synthetic-only, mock-only, provider-disabled, and zero-budget.
- [x] No database, storage, RLS, rights, raw-deletion, paid-provider, or real-user state changed.
- [x] Only the public `NEXT_PUBLIC_RELEASE_ID` configuration value changed; no secret values were read or printed.
- [x] Browser console, framework-overlay state, and Vercel error/warning logs were inspected.

## Rollback/disable procedure

Promote last-known-good pre-WP03 production deployment `dpl_4TNkwabju7ga95WcATF6Fm6V4ox3`, restore the prior Production `NEXT_PUBLIC_RELEASE_ID`, verify `https://project-xwrez.vercel.app/`, and rerun public browser plus Vercel error/warning scans. This release has no database or storage rollback.

## Decision

The reviewed WP03 source tree is merged to protected `main`, both founders separately approved the protected production release, the public domain resolves to the final Ready deployment, the release fingerprint is current, and the requested English/Arabic, RTL search, and mobile navigation behaviors pass on production. The protected synthetic production release is `PASS`.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | TECHNICAL PASS | 2026-09-13 |
| Ahmed | Protected release reviewer | APPROVED | 2026-09-12 |
| Ziad | Protected release reviewer | APPROVED | 2026-09-13 |
