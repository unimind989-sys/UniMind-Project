# WP03-T20 landing and access pages production proof

**Status: PASS, with the limits below.** PR [#83](https://github.com/unimind989-sys/UniMind-Project/pull/83) squash-merged as `b8f56475b594fae09cf04c2853d7f6ee1e8fd92a`. [UniMind](https://unimind.space) now serves that source on `unimind.space`, `www.unimind.space` (308 to the apex) and `project-xwrez.vercel.app`.

## Authorization and provenance

Ahmed delegated end-to-end responsibility and design approval for WP03-T18 to T21 to the overseeing Claude Code session on 17 October 2026, and is away. D-22 covers the non-financial lifecycle. The Vercel team is on the Hobby plan; no paid action was taken.

- **Approval:** the approval of `d300d28` is the overseer's under that delegation, not a founder review.
- **Review:** the access routes are protected, so an independent review by the `independent-reviewer` agent was required.
  - First pass, `4849cf0..4821e40`: CHANGES REQUIRED, with no auth, consent, hosted-synthetic or data-safety finding. It raised one should-fix, the 40px language links, and five nits.
  - Second pass, `4821e40..d300d28`: PASS WITH NITS. Those nits were closed in `a10695d`.

## Verification before merge

| Proof | Result |
| --- | --- |
| Local checks | `format:check`, `lint`, `tsc`, `check:boundaries`, `scan:secrets`, `lint:agents`, `test:unit` 917/917 |
| Local browser suites | Demo `public`, `auth`, `rtl` 28/28; real `landing-experience` 7/7; real `foundation`, `auth-flows`, `hosted-synthetic-login`, `product-shell-contracts` passing |
| Exact-head CI on #83 | Required checks green on `a10695d`. Two earlier runs each lost one demo test to the known dev-server proxy timeout (`Failed to proxy … socket hang up`), which also fails main since `4849cf0`. That failure is tracked in its own session. |

## Production source, configuration and promotion

- Vercel team `unimind2` / `team_rf0YAPUJBDuZQ8ZB2zbx8SO9`, project `unimind-preview` / `prj_pVmnuEUakL8R5ap78cAalBjwymbO`; CLI 59.9.1 authenticated as `unimind989-sys`.
- Upload: an exact `git archive` of `b8f5647` (3104 files, equal to `git ls-tree -r`) plus the credential-free `.vercel/project.json`; the tracked `.env.example` is the only env file.
- `vercel deploy --prod --skip-domain` with build and runtime overrides: `NEXT_PUBLIC_RELEASE_ID=wp03-t20-landing-access-cobalt-b8f5647-production`, `PROVIDER_MODE=mock`, `APPROVED_PROVIDER_BUDGET_MINOR=0`, all three provider flags `false`, `NEXT_PUBLIC_TELEMETRY_ENABLED=false`.
- All required Production configuration names present (`vercel env ls production`, names only; values not read).

| Binding | Value |
| --- | --- |
| Source | `b8f56475b594fae09cf04c2853d7f6ee1e8fd92a` |
| Artifact | `dpl_E6CwEGXJq3rsdr7akwLyy9ZHZbk9`, READY Production, `https://unimind-preview-j84p9q8gn-unimind2.vercel.app` |
| Release marker | `wp03-t20-landing-access-cobalt-b8f5647-production` |
| Rollback | `dpl_3DVUTtJUuTJTL5QDQzmVfW94vtZG` (previous public artifact, marker `wp03-t19-student-cobalt-4849cf0-production`) |

Before promotion, 12 checks passed on the protected artifact through `vercel curl`:
- liveness and readiness
- application identity and the synthetic-only and mock-only markers
- the release marker and `theme-color` `#0c1823`
- the new L1 landing (sample label and the moment's waiting state) and its account links
- the icon and the new sign-in page
- private, no-store login caching
- the 403 anonymous upload denial

`validateReleaseFingerprint` then passed all six of its checks (source, environment, release, configuration presence, intended target, rollback). `vercel promote dpl_E6CwEGXJq3rsdr7akwLyy9ZHZbk9` moved the public alias.

Public proof on `project-xwrez.vercel.app` and `unimind.space`:
- `smoke:deployment` passed 7/7 on each.
- The release marker and the L1 sample label are present.
- `/login` returns 200 with `private, no-cache, no-store`.
- The anonymous upload POST returns 403.
- `www.unimind.space` returns 308 to `https://unimind.space/`.
- A 1440px screenshot of the live page shows the L1 hero after its moment, with Replay.

## Limits

- No signed-in production journey is claimed. The hosted synthetic accounts use passwords, and the executor did not enter them on a non-local host.
- The Batch Leader and admin screens are rebuilt in WP03-T21 and were not part of this release.
- The Vercel deployment-protection bypass token exposed locally during WP03-T19's proof still awaits rotation by the founders.

## Rollback

Run `vercel promote dpl_3DVUTtJUuTJTL5QDQzmVfW94vtZG` and revert `b8f5647` through a pull request. No database or storage rollback is needed.
