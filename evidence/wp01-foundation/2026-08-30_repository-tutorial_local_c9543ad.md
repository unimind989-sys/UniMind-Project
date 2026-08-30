# Gate report: WP01-T10 repository operation tutorial

**Status:** PASS — EXECUTOR, INDEPENDENT REHEARSAL, EXTERNAL CHECKS, AND HUMAN CHECKPOINT COMPLETE

**Environment:** Local workstation, isolated system-temp clean clones, GitHub pull request CI, and protected synthetic Preview deployment

**Candidate commit SHA:** `c9543ada38f682c919e772adb41fa0002e88033b`

**Release/config fingerprint:** `wp01-t10-c9543ad`; mock-only workstation; disposable database/Auth CI; protected synthetic Preview; locked empty Beta

**Migrations:** No migration change; existing versioned foundation migrations only

**Dataset/fixture versions:** Existing committed synthetic foundation fixtures; load profile `unimind-100-student-v1` validated without executing a workload

**Agent executor:** Codex `/root`

**Independent rehearsal:** Codex `/root/wp01_t10_fresh_rehearsal`

**Human reviewer:** Ahmed — authorized the ordinary checkpoint in chat; final GitHub review submitted through the approved contributor account

**Started/finished (UTC):** 2026-08-30T04:04:25Z / 2026-08-30T11:15:50Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Deterministic task selection | Clean repository state recommends dependency-valid WP01-T10 | Source and isolated committed snapshots selected WP01-T10 through the reviewed WP00 mock bridge | PASS | `scripts/show-work-state.ps1`; `scripts/test-agent-handoff.ps1` |
| Current environment workflow | Tutorial names mock workstations, disposable database/Auth CI, protected synthetic Preview, and locked empty Beta without transitional claims | Active tutorial and test-layer guidance match D-21, ADR-0001, the environment matrix, and completed WP01-T08/T09 evidence | PASS | `CONTRIBUTING.md`; `tests/README.md`; `tests/integration/README.md` |
| Command parity | Every `package.json` script is discoverable with purpose and safety context | All 34 package scripts are documented; retired hosted seams have no approved target and are explicitly non-runnable | PASS | Command-parity check; `CONTRIBUTING.md` section 7 |
| Reproducible setup | Fresh install and copied example configuration reach a valid mock app without a real credential | Node `24.19.0`, pnpm `10.34.5`, Supabase CLI `2.115.0`, 649 locked packages, synthetic `.env.local`, and `/ready` `200` were reproduced | PASS | Independent clean-clone transcript; `tests/unit/env.test.ts` |
| Safe workstation loop | Development binds only to loopback and the documented smoke passes | Listener existed only on `127.0.0.1:3000`; no LAN URL/listener; six smoke checks passed; no listener remained after stop | PASS | `pnpm dev`; `pnpm smoke:deployment -- --base-url http://127.0.0.1:3000 --target local`; socket inspection |
| Clean end-of-session recovery | Development-generated types cannot contaminate the production gate | Exact `.next/` cleanup and `next-env.d.ts` restore produced a clean diff before verification | PASS | Independent clean-clone transcript; `CONTRIBUTING.md` section 6 |
| Credential-free merge gate | Full zero-cost verification passes at the final candidate | Formatting, lint, types, boundaries, CI policy, 632-file repository scan, 231 unit tests, integration/security/evaluation/load gates, two Chromium tests, production build, and client-artifact scan passed | PASS | `corepack pnpm verify`, exit 0 |
| Disposable database/Auth path | Pull-request database/Auth CI passes without a persistent target | Application, dependency audit, and disposable `database-ci` jobs passed on the candidate branch | PASS | GitHub pull request #7 checks; prior WP01-T08 evidence |
| Preview/Beta boundaries | Preview stays protected and Beta stays locked | Vercel Preview deployment passed; an unauthenticated smoke failed closed at the protection boundary; no bypass was created and Beta was untouched | PASS | GitHub deployment status; `REQUEST_FAILED` negative probe; WP01-T09 evidence |
| Independent fresh-agent walkthrough | A separate agent follows the tutorial without chat history and closes every ambiguity | Initial rehearsal found four setup/recovery defects; the reruns verified every correction and reported no remaining ambiguity | PASS | Independent reports at `ae81233`, `dbcae55`, and `c9543ad` |
| Rehearsal cleanup | Every disposable clone and downloaded toolchain is removed after testing | Both system-temp roots reported `CLEANUP_CONFIRMED=True`; the earlier repository-local clone is absent; no port-3000 listener remains | PASS | Independent cleanup checks; source-checkout path check |

## Commands executed

| Command/test ID | Result | Sanitized report |
| --- | --- | --- |
| `pwsh -NoProfile -File scripts/show-work-state.ps1` | PASS | WP01-T10 selected as `IN_PROGRESS`; stale selector `NONE` defect closed before tutorial work |
| `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | PASS | 130 names, 37 local links, 22 synchronized decisions, and 102 task contracts checked |
| Package-script parity check | PASS | 34/34 package scripts documented |
| `pwsh -NoProfile -File scripts/test-agent-handoff.ps1` | PASS | Isolated committed snapshot stayed clean and selected WP01-T10 |
| Source checkout `corepack pnpm verify` at `c9543ad` | PASS | Complete credential-free, zero-paid gate passed with 231 unit tests and all remaining layers |
| GitHub pull request #7 checks | PASS | Application, dependency audit, disposable database/Auth CI, Vercel deployment, and Vercel Preview Comments passed |
| Protected Preview smoke without access credential | EXPECTED DENIAL | `REQUEST_FAILED`; access protection remained intact and no bypass was created |
| Independent clean clone at `ae81233` | FAIL, CORRECTED | Found pre-install CLI ordering, stale WP01-T08 wording, incomplete synthetic environment, and dev-to-build cleanup defects |
| Independent clean clone at `dbcae55` | PASS WITH ONE AMBIGUITY, CORRECTED | Mock app, six-check smoke, cleanup, full verify, readiness, handoff, and parity passed; default Next listener exposed a LAN address |
| Independent clean clone at `c9543ad` | PASS | Loopback-only development, six-check smoke, exact cleanup, empty diff, clean status, and no remaining ambiguity |

## Defects found and closed

| ID | Finding | Correction | Verification | Status |
| --- | --- | --- | --- | --- |
| WP01-T10-ORDER | Project Supabase CLI was checked before dependency installation | Moved the check after frozen install and documented pinned `2.115.0` | Fresh clone reproduced the command in order | CLOSED |
| WP01-T10-STALE | `.env.example` still described WP01-T08 as pending | Removed retired hosted-target fields and wording | Stale-language scan and independent reading passed | CLOSED |
| WP01-T10-ENV | Copied example left readiness invalid and root rendering broken | Supplied clearly synthetic, non-authorizing mock placeholders and added a unit contract test | `/ready` returned `200`; local smoke passed six checks; unit suite passed | CLOSED |
| WP01-T10-DEV-TYPES | Dev-generated `.next/dev/types` could poison the end-of-session production build | Added exact ignored-output cleanup and tracked `next-env.d.ts` recovery | Cleanup followed by full verify passed from a clean clone | CLOSED |
| WP01-T10-LAN | Next.js defaulted to `0.0.0.0` while the tutorial required no external exposure | Pinned `pnpm dev` to `--hostname 127.0.0.1` | Output and socket inspection showed loopback only | CLOSED |

## Security, privacy, and cleanup review

- [x] No secret, signed URL, private raw content, ordinary chat content, or unredacted personal data is in this report.
- [x] Workstation and verification remained mock-only and zero-paid; provider flags remained false and the approved provider budget remained zero.
- [x] Disposable CI remained runner-local; Preview rejected unauthenticated probing; Beta remained protected, empty, Git-disconnected, and unreleased.
- [x] Repository and client-artifact secret scans passed.
- [x] All test servers were stopped. The exact disposable roots were containment-checked before recursive removal, and all clone, dependency, generated-output, download, and portable-toolchain artifacts were deleted.

## Rollback/disable procedure

Revert the WP01-T10 commits ending at `c9543ad` and the final evidence/state commit. This changes repository documentation, the synthetic example, its contract test, and the workstation listener only; it does not modify database state, credentials, provider state, Preview/Beta data, or release state. Keep Preview protected and Beta locked throughout rollback.

## Decision

WP01-T10 passes. A new human or coding agent can select the task, install the pinned toolchain, copy a complete synthetic configuration, run the loopback-only mock app, execute the local smoke and full verification gate, understand disposable database/Auth CI and protected Preview/locked-Beta boundaries, recover generated Next.js state, and hand off from repository instructions alone. The initial independent failures were corrected and then re-rehearsed successfully; all disposable test roots were removed.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | PASS | 2026-08-30 |
| Codex `/root/wp01_t10_fresh_rehearsal` | Independent fresh agent | PASS | 2026-08-30 |
| Ahmed | Human checkpoint | APPROVED | 2026-08-30 |
