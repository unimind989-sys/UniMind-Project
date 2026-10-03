# WP03-T09 frontend overhaul release

**Runtime status: PASS.** PR [#64](https://github.com/unimind989-sys/UniMind-Project/pull/64)
merged reviewed head `890f00faf26fd60f74b5c72fbb3d6925d859d636` as
`f107e4140efc92fd9721ee9535c938e6ee9cdaf3`. Both trees are
`4174a72db1d3671376d6e80eac84a429b3b5cae5`. Production deployment
`dpl_76AWj26YVWDQpBRXx8v9BLz68VyN` serves
[project-xwrez.vercel.app](https://project-xwrez.vercel.app), release
`wp03-t09-f107e41-production`. Documentation-only closure follows; it changes no
runtime input and requires no redeployment. Terminal branch/worktree cleanup is
proved by the subsequent Git state.

Ahmed is the selected speaker. One Codex executor, zero workers, policy 9,
docs/frontend/runtime/auth/data/storage/delivery/tooling, R3/protected. D-22
authorizes this task-scoped non-financial lifecycle. `unimind989-sys`
authored/merged; `aboayman-oss` approved exact head `890f00f` in review 5400829181.
One executor controlled both identities: distinct-account approval, not independent
review. Protection required one approving account and four checks; no bypass was
used. Founder acceptance is separately bound to Phase 1 `ab568b6`, student
`3a2a95d`, leader `4c03b80`, Admin `ec00466` and final design `8ad3a9b`.

## Acceptance and proof

| Seam | Executed proof |
| --- | --- |
| Frozen local candidate | Guarded `pnpm verify` exited 0 at fingerprint `37291eb49d9bb51b06e2ea7a1421042a3952db8c2e083838c1e0abcbb31e2f35`. Format, lint, current/fresh types, architecture, 28 migration conventions, workflow/policy, 2862-file secret scan; 577 unit, 15 local integration with two hosted-only skips, 44 security, three evaluation/three synthetic cases and five load-profile checks passed. Load validation ran no workload. All 57 normal and 41 native synthetic browser cases, production build and client privileged-canary scan passed. Source remained unchanged through completion. |
| Exact-head and main CI | [37122688934](https://github.com/unimind989-sys/UniMind-Project/actions/runs/37122688934) passed selector, dependency audit, application and database CI at `890f00f`. Disposable upgrade, repeated reset, pgTAP, advisors, type parity, 17 database integration, eight authenticated browser and 44 security cases plus cleanup passed. Merged-main [37123975567](https://github.com/unimind989-sys/UniMind-Project/actions/runs/37123975567) also passed. Full diff, stat, whitespace and changed-file secret/scope review completed. |
| Design and visual behavior | Approved source-bound packets retain 30 student, 34 leader, 36 Admin and 29 final inspected views: desktop/phone, Light/Dark, EN/AR, RTL/LTR and relevant populated/loading/error/empty/denied/interrupted states. Later upload repairs had four inspected phone theme/language frames and Arabic desktop review. Final consistency cases passed 7/7. Live public English landing and English/Arabic sign-in received bounded in-app desktop Light inspection; the exact slogan, real preview, form hierarchy and unmirrored logo rendered correctly. No full hosted mobile, real-user or screen-reader certification is asserted. |
| Academic profile persistence | Preview fingerprint `sha256:5575d1c3d806` had the exact 27-version prefix and one missing migration. Pinned CLI dry run and forward application of `20260930220000_profile_academic_context.sql` passed; source blob `1d7ec408ee0cbb1236559721cb2ada246748bba5`. Postflight proved 28 migrations, nullable/no-default JSONB, profile RLS, caller-only column update, no anonymous/status grants, invoker validator with empty search path, no direct caller/anonymous execution and the column-specific before-update trigger. A separate rollback-only synthetic probe proved own read/unchanged update, foreign write denial, pending/nonconsenting preference denial and status escalation denial. Both invented identities/profiles were independently absent afterward. CI-only seed fixtures were not imported into Preview. Complete authorized hierarchy persistence, malformed input, suspended caller and revocation are proven in exact-head disposable CI. |
| Source-safe production | An exact merged Git archive checked all 2862 tracked files / 63,985,702 bytes against Git blobs. Only credential-free `.vercel/project.json` link metadata was added. The tracked public `.env.example` template was retained; no actual environment files, ignored review/test artifacts or credentials entered the archive. Existing Hobby team/project scope, active plan and no trial were observed. `--prod --skip-domain` built under the correct Production environment while the public alias retained the previous release. |
| Before promotion | Source SHA/tree, exact project/team/target and all 16 required configuration names matched. Build/runtime overrides explicitly set mock mode, zero minor budget, three paid-provider flags false, telemetry false and the release ID. Seven deployment-smoke and six release-fingerprint checks passed, plus private/no-store/pragma/expires login caching and bounded 403 anonymous upload denial. Existing authorized deployment access was used in memory; no credential, protection setting, paid provider or resource was created. |
| Public promotion | Pinned CLI promotion succeeded. Alias API binds the public domain to `dpl_76AWj26YVWDQpBRXx8v9BLz68VyN`; the same seven smoke, six fingerprint, cache and 403 checks passed anonymously, without deployment-access credentials. A 40-entry bounded log sample contained zero warning/error/fatal or HTTP 5xx signals. This is a sample, not a universal absence claim. |

## Repairs and retained failures

The approved final design remains the baseline. Release work applied the required
Next.js 16.3.6 security patch, repaired upload keyboard/locale and stale test
contracts, and restored public release/mode verification as non-visible,
server-validated metadata. Its rejecting forged-query/private-canary browser case
passed. No new dependency family or speculative product behavior was introduced.

Ahmed explicitly approved the bounded gate exception: policy 9 corrects the Git
comparison and conservatively classifies supported assets/configuration while
retaining full protected CI. All 60 rejecting regressions pass; unrelated unknown
paths still block. WP00 task/product state and the CI workflow were not reopened.

Historical failed hosted runs and three local `fee5903` attempts retain FAIL,
FAIL and CANCELLED outcomes in the [delivery history](../../planning/design/frontend-overhaul/phase-2-delivery.md).
The first local failure scanned ignored helper sources; they were preserved outside
the checkout and pinned Node/pnpm routing was corrected. The second had one
27.3-second catalog response; its unchanged focused replay passed. The third was
cancelled after 56 normal passes when missing release metadata invalidated that
candidate. The later complete `890f00f` run is the first guarded local broad PASS.

Preview's actual services initially reported UNHEALTHY with HTTP 544 schema probes.
A single restart was prepared behind gates. At execution the database had recovered,
so the guard skipped the write; all five services then reported healthy. No restart
or reset was issued. Two local postflight-helper syntax/type failures occurred
before caller probes; corrected metadata and rollback-only probes passed.

The initial unpromoted smoke received Vercel's 302 sign-in protection, not an
application response; that attempt is FAIL. An existing automation-access
credential supplied the authenticated replay without changing protection. The
browser's unpromoted review met a Vercel MFA gate; source-bound review and subsequent
anonymous live renders provide the stated visual proof. No browser credentials,
session storage, authentication token or signed URL is included in this evidence.

## Logo preservation, rollback and remaining scope

The supplied 94-file copy matches logo branch head `89969da`. The 33-file canonical
production subset and all 25 runtime placements retain exact supplied bytes,
including the complete icon set and license/provenance. Whole-branch cherry-picking
would import rejected exploration. Full history is recoverable from
`E:/UniMind Project/.local/overhaul-cleanup/logo-89969da.bundle` (verified complete
bundle; SHA-256 `55EDB1859589F06E89FC640ADA33196039466DF8CF4690AB07E7D419D1F9563F`).
The entire 100-file branch kit is archived in `open-folio-kit-89969da.zip`
(SHA-256 `62C60CC00CCE11299D68D68CCB7C04C41C37C371D2278C45EDA5CA43629953D0`).
Original artwork, imported copy, untracked review captures and bounded unrelated
task text must remain recoverable during terminal cleanup.

Rollback is the previous verified production artifact
`dpl_CTwSM6GDsKsUns31ikVJxi5eFjP4`, release `wp03-t08-76e92c0-production`.
Promote that artifact and repeat public alias/release/smoke proof if containment is
needed. Retain the nullable profile column/data when reverting application code;
schema/grant reversal requires a separately reviewed forward migration.

WP03-T10 remains next before WP04. Live generation/processing, invitation delivery,
full historical submission persistence and open retention/provider decisions stay
with their runbook owners. The pre-existing suspended-profile catalog RPC finding
is separately recorded; preference write denial is proven. No Telegram, real data,
Beta unlock, new worker/infrastructure, paid trial/resource/provider or nonzero cap
was introduced.
