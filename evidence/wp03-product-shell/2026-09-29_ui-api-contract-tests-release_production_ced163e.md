# Gate report: WP03-T07 UI/API contract tests protected release

**Status:** PASS — synthetic data and mocked providers only

**Source:** PR #58 head `1ee02de2d90c399acc74267499866f2e0d7bae22`; protected merge `ced163e869c66a8c427fe200a152208b3ebff75d`. Both have tree `aeb22c3ba33c87ccbd892f6f3df3e8f6971755f9`.

**Production:** READY deployment `dpl_GWCQ2YxfubZxVsdeRigw4QXUQ5Kw`, `unimind-preview-1zz83pp2c-unimind2.vercel.app`; public alias `project-xwrez.vercel.app`; release `wp03-t07-ced163e-production`.

**Executor and authorization:** Codex `/root`, one Sol High owner, zero workers. Ahmed is the selected speaker. Policy 8: docs/frontend/runtime/auth/delivery/tooling, R3/protected. D-22 authorized the task-scoped non-financial lifecycle. No paid provider, billable resource, nonzero cap, private source or real student data was introduced. Existing linked team `unimind2` and project `unimind-preview` were verified on Hobby before the build.

## Acceptance and proof

| Criterion | Executed evidence and limits |
| --- | --- |
| Role/access and privacy contracts | Exact code passed 12 new browser contracts, focused production guard/upload denial tests and injected-private-field DTO tests. Full browser suite 51/51 and security 44/44 passed locally and in required CI. Existing guarded disposable database suites own actual role/membership/assignment/other-user isolation; preview fixtures never establish authorization. |
| Bilingual accessibility and behavior | Ten critical-screen/locale contracts cover axe WCAG A/AA rules, visible focus and revealed skip links, reflow, 200% text scaling, normal-size 44px touch targets, reduced motion, language/direction and semantic names. Earlier journeys cover keyboard, interrupted/error/status flows. Automated proof is not complete WCAG conformance. |
| Spoken smoke | Ahmed reported “English/Arabic results: pass” on 2026-09-29 in this task conversation, responding to the supplied five-screen Narrator/NVDA checklist and candidate `1ee02de`. Scope: auth, catalog, workspace, submission and admin in both locales. This is human-reported PASS; the executor did not hear speech. Reader/version and exact execution time were not supplied. No source/UI change followed that report. |
| Audit, provenance and supplemental captures | The local report records bounded desktop/mobile EN/AR inspection, the integrated Impeccable audit (18/20), dependency versions/licenses/source provenance and 15 sanitized synthetic captures. Final detector exit 1 had 34 inherited advisories, explicitly dispositioned; it is not labeled a pass. No imported UI/media or runtime dependency was added. |
| Protected GitHub delivery | Required selector/application/dependency/database checks passed on exact head `1ee02de` in run `36285184754`. `aboayman-oss` approved that head in review `5346244366`; author/merger `unimind989-sys` merged PR #58 normally on 2026-09-29. One approving review was required, no rule was bypassed. The same executor controlled both accounts: distinct-account approval, not independent review. Service identities do not identify which founder acted. |
| Merged source and database proof | Merged-main run `36502851660` passed application, database and selector at `ced163e`; dependency audit was intentionally skipped on main after the exact PR-head PASS. Disposable database setup/reset/contracts/advisors/generated-type parity/integration/security and cleanup passed. Live Supabase was skipped because no migration, grant, RLS, Auth, storage or adapter semantics changed. |
| Production source/configuration | Linked project/account, production target, source SHA and tree, required configuration names and READY artifact were verified from authenticated deployment metadata. Protected and public checks validated release `wp03-t07-ced163e-production`, all configuration-presence booleans, intended artifact and rollback target through the existing `validateReleaseFingerprint` module. Sensitive values were never decrypted or exported. |
| Affected public runtime | Protected artifact and public domain each passed the seven existing deployment smoke checks: live/ready GET, forbidden health POST, application response, synthetic/mock-only mode and icon. Alias API resolves the public domain to the exact artifact. Production auth EN desktop (1280px viewport) and catalog/workspace/submission/admin AR mobile (390px) had loaded fonts, correct language/direction and document width below viewport; auth action uses repaired darker cobalt. Five anonymous forged-role URLs reached `/login` in the real browser. Fresh browser warning/error logs were empty. Deployment warning/error and HTTP 500 samples each returned zero entries. |

## Verification reuse and changes

The frozen local `corepack pnpm verify` exited 0 with fingerprint `fef81d7e75b5c8852a6850a5dc4439f67a1a97c70125d2cc001df546b83664ab`: formatting, lint, current/fresh TypeScript, boundaries, SQL/workflow/policy/secret checks; 455 unit, 15 integration with 2 hosted opt-in skips, 44 security, 3 evaluation tests plus 3 synthetic cases, 5 load-profile validation tests, 51 browser journeys, safe production build and client-artifact secret scan. Load validation did not execute a workload. Exact-head and merged-main CI confirmed the final source. Elapsed time and the human-result receipt changed no executable input; passing proof was reused.

The implementation adds pinned dev-only axe tooling and repairs rejecting-check defects in contrast, text reflow, normal-size touch controls and admin keyboard scrolling. It preserves the approved surface direction and trust semantics. Details, failed local attempts, dependency provenance and audit dispositions remain in `evidence/wp03-product-shell/2026-09-27_ui-api-contract-tests_local_7f89ed8.md`; its earlier pending handoff is historical and superseded by this report.

Automatic Git builds for `main` and automatic custom-domain assignment were already disabled. From clean merged `main`, pinned CLI 59.9.1 built the exact source with `--prod --skip-domain`, public release ID overridden for build/runtime, mock mode, zero provider budget and all three paid-provider flags false. Deployment metadata binds SHA/tree to that upload. The CLI assigned the standard internal project alias; a separate API read proved `project-xwrez.vercel.app` still pointed to the rollback artifact until pre-promotion checks passed. `vercel promote` then moved the public alias to the verified artifact; subsequent API, public fingerprint, smoke, rendered and access proof passed. No persistent secret/provider setting or financial enablement was changed.

Closure changes only Markdown evidence, the controlled task record and runbook markers. Formatting, readiness, secret/scope review and exact-head protected closure CI own those edits. They change no executable, dependency, fixture, workflow or deployment input; production remains on `ced163e` without another build/promotion. Closure PR/check/merge and final branch-cleanup state are authoritative in GitHub and Git, rather than a self-referential evidence commit.

## Rejected probes and resolved limitations

| Probe | Disposition |
| --- | --- |
| Initial fingerprint helper required secret values in project metadata | Rejected before promotion. Vercel marks five credential variables sensitive and redacts their values. Corrected the helper to require matching production configuration metadata, deployment environment names and successful strict server readiness. Repeated all seven protected smoke checks and six fingerprint checks: PASS. No secret was fetched. |
| Additional HTTP denial probe required an HTTP 3xx | Rejected because `/learn` streams a 200 response containing a sign-in meta redirect. Pinned Next.js redirect documentation explicitly describes this behavior. Real browser traversal of all five forged-role URLs reached sign-in; no protected access failure or product correction was required. The failed helper's diagnostic regex/shutdown errors were local tooling failures, not production PASS. |
| Screen-reader provenance | Human-reported PASS resolves the required smoke. Reader/version and test execution timestamp are unspecified; neither executor-observed speech nor full accessibility conformance is claimed. |

## Rollback and completion

Rollback target is the prior verified production artifact `dpl_41HGBsNRN5tM2MMoRdozeRRjLgpa`. Promote that artifact to restore `project-xwrez.vercel.app`, then repeat alias/release/smoke and affected routing/error proof. Revert task-scoped runtime/tests/dependency changes only if required; preserve database/audit history. No database rollback is necessary for this task.

WP03-T07 acceptance and affected production proof are complete. The merged implementation branch was removed locally/remotely after production passed. Deliver this documentation-only closure through protected CI, then remove only its task-created branch/temp state and synchronize clean main. WP03-T08 remains the next unstarted task. Real-data/provider/rights/storage/budget decisions remain closed under their existing gates.
