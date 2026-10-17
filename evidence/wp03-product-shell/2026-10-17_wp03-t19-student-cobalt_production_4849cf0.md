# WP03-T19 Cobalt student flow production proof

**Status: PASS, with the limits below.** PR [#82](https://github.com/unimind989-sys/UniMind-Project/pull/82) squash-merged as `4849cf0b17aeeb38465ff4c6e4ceabe01ccf3325` with all 15 checks green. [UniMind](https://unimind.space) now serves that source on `unimind.space`, `www.unimind.space` (308 to the apex) and `project-xwrez.vercel.app`.

## Authorization and provenance

Ahmed delegated end-to-end responsibility and design approval for WP03-T18 to T21 to the overseeing Claude Code session on 17 October 2026 ("permission and approval to take responsibility for the whole frontend overhaul … finished and merged and shipped and cleaned up") and went away. D-22 covers the non-financial lifecycle. The Vercel team is on the Hobby plan; no paid action was taken.

The approval of the rendered candidate (`2166c3d`) is the overseer's under that delegation, not a founder review. Review was self-review by the same session, including the screens a helper sub-agent restyled in the task worktree; no protected path changed, so no independent review was required.

This deployment also ships WP03-T15 to T18 (merged earlier on 17 October, each with green CI), because production had last been promoted at `45a8c8c` (WP03-T13).

## Verification before merge

| Proof | Result |
| --- | --- |
| Local checks at the candidate | `format:check`, `lint`, `typecheck`, `typecheck:fresh`, `check:boundaries`, `check:sql`, `scan:secrets`, `lint:agents`, `test:unit` 917/917 |
| Local browser suites | Demo e2e 192/192 (second full run; the first had 14 failures, fixed in `d530056`); real e2e 39/39 |
| Exact-head CI on #82 | 15/15 checks green, including `application`, `database-ci`, `dependency-audit` and `ci-selector` |

## Production source, configuration and promotion

- Vercel team `unimind2` / `team_rf0YAPUJBDuZQ8ZB2zbx8SO9`, project `unimind-preview` / `prj_pVmnuEUakL8R5ap78cAalBjwymbO`; CLI 59.9.1 authenticated as `unimind989-sys`.
- Upload: an exact `git archive` of `4849cf0` (3103 files, equal to `git ls-tree -r` of that commit) plus the credential-free `.vercel/project.json`; the tracked `.env.example` is the only env file.
- `vercel deploy --prod --skip-domain` with build and runtime overrides: `NEXT_PUBLIC_RELEASE_ID=wp03-t19-student-cobalt-4849cf0-production`, `PROVIDER_MODE=mock`, `APPROVED_PROVIDER_BUDGET_MINOR=0`, all three provider flags `false`, `NEXT_PUBLIC_TELEMETRY_ENABLED=false`.
- All 15 required Production configuration names present (`vercel env ls production`, names only; values not read).

| Binding | Value |
| --- | --- |
| Source | `4849cf0b17aeeb38465ff4c6e4ceabe01ccf3325` |
| Artifact | `dpl_3DVUTtJUuTJTL5QDQzmVfW94vtZG`, READY Production, `https://unimind-preview-3hs90e78g-unimind2.vercel.app` |
| Release marker | `wp03-t19-student-cobalt-4849cf0-production` |
| Rollback | `dpl_42tzJXb7utNR2te7gcJh7idZfnhU` (previous public artifact, marker `wp03-t13-frontend-refinements-45a8c8c-production`) |

Before promotion the protected artifact was checked through `vercel curl`: liveness, readiness, application identity, synthetic/mock-only markers, release marker, the new build's `theme-color` (`#0c1823`), icon, private/no-store login caching and the 403 anonymous upload denial (9/9). `validateReleaseFingerprint` passed all six checks (source, environment, release, configuration presence, intended target, rollback). `vercel promote dpl_3DVUTtJUuTJTL5QDQzmVfW94vtZG` then moved the public alias.

Public proof on `project-xwrez.vercel.app` and `unimind.space`: `smoke:deployment` passed 7/7 on each, the release marker and the new `theme-color` are present, `/login` returns 200 with `private, no-cache, no-store`, and the anonymous upload POST returns 403. `www.unimind.space` serves the same marker after its 308.

## Limits

- Production sign-in uses hosted synthetic accounts with passwords. The executor did not enter them on a non-local host, so no signed-in production journey is claimed; the same tree passed every rendered case locally and in exact-head CI.
- The public landing still uses its earlier composition with the new tokens until WP03-T20 lands.
- One `vercel curl --debug` call during this proof printed the project's existing deployment-protection bypass token in the local session output. It was not written to any file, command line, commit or log in the repository, and no further debug call was made. Rotating that token in the Vercel project settings is recommended; it is a settings change left to the founders.
- No screen-reader, participant or performance study is claimed.

## Rollback and cleanup

To roll back, run `vercel promote dpl_42tzJXb7utNR2te7gcJh7idZfnhU` and revert `4849cf0` through a pull request. No database or storage rollback is needed. The merged task branch and worktree were removed after this proof.
