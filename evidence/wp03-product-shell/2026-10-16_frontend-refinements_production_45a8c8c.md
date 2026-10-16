# WP03-T13 frontend refinements production proof

**Status: PASS, with rendered-journey limits below.** Protected PR [#73](https://github.com/unimind989-sys/UniMind-Project/pull/73) merged at 2026-10-16T06:18:03Z. Reviewed head `53c56d07770d806cd34327dd2baf8a03ec872ef9` and squash-merged source `45a8c8cfb02ddee346da48fda07a0fd61234ff16` share exact tree `e8966d28f3881b6a5d011929b0f4bc671acc9b12`. [UniMind](https://project-xwrez.vercel.app) now serves that source. WP03-T13 stays in progress: the merged audit remains **55 of 75 findings locally verified, 20 remaining**.

## Authorization and provenance

Selected speaker: Ahmed. He requested committing and merging this branch and invoking finalize after the c1 checkpoint was presented. He then directed: fix everything, change what needs to be changed, and ship, push, merge and clean the branch autonomously while away. D-22 supplies standing non-financial lifecycle authorization. No paid action was taken. The c2 founder receipt (`2026-10-16-frontend-refinements-founder-receipt-c2.json`) binds Ahmed's delegated acceptance to the exact reviewed head. He has not inspected the corrected screens hands-on; the receipt's provenance says so.

Review of the post-c1 corrections was inline by the executor. The separately executing reviewer's NO_BLOCKER covers only the dependency patch and the two hosted-driver corrections, by exact hash. GitHub roles: author and merger `unimind989-sys`; approving account `aboayman-oss` (review at `dc25646`, then again at exact head `53c56d0`). One executor controlled both accounts, so this is distinct-account approval, not independent review. Branch protection (one approval; `application`, `dependency-audit`, `database-ci`, `ci-selector`) was satisfied without bypass. Auto-merge is disabled in repository settings, so the merge was manual.

## What changed after the c1 checkpoint

- Next and `eslint-config-next` 16.3.6 → 16.3.8 with a refreshed lock (sharp 0.35.5, source-map-js 1.2.2). The production audit reports zero vulnerabilities.
- Chat keeps Send in view on short desktop viewports (`.chatLayout` row `minmax(0, 1fr)`, compact empty state). Studio's Generate is sticky to the workspace bottom. Quiz actions stack with Start centred. Source rows are compact (155px). The Sources return and its notice share a two-row grid. Phone settings tabs use a 1.25 line height.
- Phone Chat restores study-language focus when widening past 767px, even after the browser has moved focus to the body.
- The `application` CI job timeout and its policy pin move from 25 to 120 minutes, and the governed workflow SHA-256 follows. The full chain now needs about 60 minutes on a free public-repository runner.
- Test drivers were aligned with the accepted UI. CI-only races were settled: post-resize geometry is polled, axe waits for running animations, paused landing animations are awaited, and demo sign-in retries a pre-hydration click. No threshold was weakened.

## Verification

| Proof | Result |
| --- | --- |
| Guarded local `pnpm verify` at `53c56d0` | Exit 0, `Stable verification passed for 9aec2caf71b756b1627d012f5118c30e1a677d7ff6380251efa985803ec367cf`. Format, lint, both type checks, boundaries, 28 SQL conventions, workflow and policy v10, secret scan, unit 1065, integration 15 (2 existing skips), security 44, evaluation 3 plus foundation, load 5, hosted browser 146, synthetic demo 284, safe production build and client-artifact secret scan. Agent readiness passed separately. |
| Exact-head CI at `53c56d0` | [Run 38852742892](https://github.com/unimind989-sys/UniMind-Project/actions/runs/38852742892): all four required jobs succeeded; `application` took 58m27s. |

Retained failures, none relabelled as passes:
- `878e940`: the dependency audit failed on 3 high advisories, and 2 hosted leader drivers failed.
- First local full chain: the demo suite failed 23 of 284 cases (stale drivers plus four layout budgets).
- `8906a42`: the CI job was cancelled at its 25-minute limit after one B06 focus race.
- `9f6a4d8`: the agent policy failed on the governed workflow hash.
- `7fcd67b`: 280 of 284 demo cases passed; 4 Linux-only failures (tab wrap, settled geometry, axe mid-fade).
- `dc25646`: 283 of 284 demo cases passed; one failure was a Next dev-server rewrite-proxy `ECONNRESET` returning 500. Its re-run failed one landing case on a pending `Animation.pause()`.
- `0808831`: a three-decimal tolerance failed at 0.0023, so the real fix (awaiting `ready`) replaced it.

Several local chains were interrupted when the candidate changed; those are not PASS.

## Service relevance

Hosted Supabase was skipped. No migration, schema, grant, RLS, Auth, storage rule or authorized adapter changed. Disposable database CI passed at the exact head, and production anonymous-denial and auth-cache checks cover the trust seams.

## Production source, configuration and promotion

The Vercel scope was reconfirmed:
- team `unimind2` / `team_rf0YAPUJBDuZQ8ZB2zbx8SO9`, Hobby plan, active, no trial;
- project `unimind-preview` / `prj_pVmnuEUakL8R5ap78cAalBjwymbO`, automatic custom-domain assignment disabled;
- all 16 required Production configuration names present (values not read).

The upload was an exact `git archive` of `45a8c8c`: 3323 files, each verified against its Git blob (0 mismatches). Only credential-free `.vercel/project.json` was added, and the tracked `.env.example` is the only env file. Deployment used pinned CLI 59.9.1 with `--prod --skip-domain`. Build and runtime overrides kept mock mode, zero provider budget, all three provider flags false and telemetry false.

| Binding | Value |
| --- | --- |
| Source / tree | `45a8c8cfb02ddee346da48fda07a0fd61234ff16` / `e8966d28f3881b6a5d011929b0f4bc671acc9b12` |
| Artifact | `dpl_42tzJXb7utNR2te7gcJh7idZfnhU`, READY Production, `https://unimind-preview-5hnnb7emd-unimind2.vercel.app` |
| Public domain | `https://project-xwrez.vercel.app` → intended artifact after promotion |
| Release marker | `wp03-t13-frontend-refinements-45a8c8c-production` |
| Rollback | `dpl_7vzJmYUCUkCQZN1hCwJFsHuuqc2V` (previous public artifact, release marker `wp03-t10-open-folio-1013cd5-production`) |

Pre-promotion, the public alias stayed on rollback. The protected artifact was checked through `vercel curl`, which handles Deployment Protection itself; no bypass secret was read, created, exported or logged. It passed the seven deployment-smoke checks, the release marker, private/no-store login caching and the 403 anonymous upload denial. The repository's `validateReleaseFingerprint` passed all six checks (source, environment, release, configuration presence, intended target, rollback). `vercel promote` then moved the public alias.

Public proof at 2026-10-16T06:30:50Z repeated the same 12 checks against `project-xwrez.vercel.app` and all passed. A bounded log sample for the artifact afterwards held 50 records with zero warning, error, fatal or 5xx entries; the one 403 and two 405 responses are the intended denials. This is a bounded observation, not an availability guarantee.

## Limits

- Production sign-in uses hosted synthetic accounts with passwords. The executor did not enter them on a non-local host, so no production-rendered signed-in journey is claimed for the corrected Chat, Studio, Quiz, Sources or Settings screens. The anonymous `/preview` routes render the older WP03-T04 review surface, not these screens.
- The identical tree passed every rendered and interaction case locally (Windows) and in exact-head CI (Linux). Ahmed's hands-on look at the corrected screens remains open.
- No screen-reader, hardware-keyboard, participant or performance study is claimed.

## Rollback and cleanup

To roll back, run `vercel promote dpl_7vzJmYUCUkCQZN1hCwJFsHuuqc2V` and revert `45a8c8c` through a protected pull request. No database or storage rollback is needed. Cleanup removes only the merged task branch and session-owned staging; unrelated branches and work are kept.
