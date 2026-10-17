# WP03-T21 Batch Leader and admin production proof

**Status: PASS, with the limits below.** PR [#84](https://github.com/unimind989-sys/UniMind-Project/pull/84) squash-merged as `d64c9e7f5a69f7b9bc332e6afa2679dafa714da8` with all 15 checks green. [UniMind](https://unimind.space) now serves that source on `unimind.space`, `www.unimind.space` (308 to the apex) and `project-xwrez.vercel.app`.

## Authorization and provenance

Ahmed delegated end-to-end responsibility and design approval for WP03-T18 to T21 to the overseeing Claude Code session on 17 October 2026 and is away. D-22 covers the non-financial lifecycle. The Vercel team is on the Hobby plan; no paid action was taken.

- **Implementation:** a helper sub-agent in its own worktree.
- **Review:** an independent review by the `independent-reviewer` agent approved it with five nits, all fixed before the PR was green.
- **Approval:** the overseeing session approved `c197682` under the delegation (not a founder review). Its rendered review covered the Batch Leader home and campaign intake (desktop and phone), the admin decision queue and sources (desktop and phone), and an open decision in dark Arabic.
- **Before merge:** the branch was brought up to date with `main` (WP03-T20) and its CI rerun green on the combined tree.
- **Scope:** no Server Action, guard, readiness predicate, RLS, storage or validation logic changed.

## Production source, configuration and promotion

- Vercel team `unimind2` / `team_rf0YAPUJBDuZQ8ZB2zbx8SO9`, project `unimind-preview` / `prj_pVmnuEUakL8R5ap78cAalBjwymbO`; CLI 59.9.1 authenticated as `unimind989-sys`.
- Upload: an exact `git archive` of `d64c9e7` (3111 files, equal to `git ls-tree -r`) plus the credential-free `.vercel/project.json`; the tracked `.env.example` is the only env file.
- `vercel deploy --prod --skip-domain` with build and runtime overrides: `NEXT_PUBLIC_RELEASE_ID=wp03-t21-leader-admin-cobalt-d64c9e7-production`, `PROVIDER_MODE=mock`, `APPROVED_PROVIDER_BUDGET_MINOR=0`, all three provider flags `false`, `NEXT_PUBLIC_TELEMETRY_ENABLED=false`.
- All required Production configuration names present (`vercel env ls production`, names only; values not read).

| Binding | Value |
| --- | --- |
| Source | `d64c9e7f5a69f7b9bc332e6afa2679dafa714da8` |
| Artifact | `dpl_HpqAJCgGciWxiu9xhbnkp6yRWHFg`, READY Production, `https://unimind-preview-97bk0hyff-unimind2.vercel.app` |
| Release marker | `wp03-t21-leader-admin-cobalt-d64c9e7-production` |
| Rollback | `dpl_E6CwEGXJq3rsdr7akwLyy9ZHZbk9` (previous public artifact, marker `wp03-t20-landing-access-cobalt-b8f5647-production`) |

Before promotion, 12 checks passed on the protected artifact through `vercel curl`:
- liveness and readiness
- application identity and the synthetic-only and mock-only markers
- the release marker and `theme-color` `#0c1823`
- the L1 landing and its account links
- the icon and the sign-in page
- private, no-store login caching
- the 403 anonymous upload denial

`validateReleaseFingerprint` then passed all six of its checks. `vercel promote dpl_HpqAJCgGciWxiu9xhbnkp6yRWHFg` moved the public alias.

Public proof on `project-xwrez.vercel.app` and `unimind.space`:
- `smoke:deployment` passed 7/7 on each.
- The release marker is present.
- `/login` returns 200 with `private, no-cache, no-store`.
- The anonymous upload POST returns 403.
- `www.unimind.space` returns 308 to `https://unimind.space/`.
- An anonymous browser visit to `/admin` lands on "Sign in to UniMind" (`/login?lang=en&next=%2Fadmin%3Flang%3Den`) and shows no admin content.
- The anonymous `/admin` HTML response is a 200 shell with the page title. It is identical in kind on the WP03-T19 and WP03-T20 artifacts, so this release changed nothing there.

## Limits

- No signed-in production journey is claimed. The leader and admin screens load only after sign-in with hosted synthetic passwords, which the executor did not enter on a non-local host, and their code is in route chunks that anonymous pages do not load. That this release carries them rests on the exact-source archive and the release fingerprint. The same tree passed the full demo and real e2e suites in exact-head CI.
- The Vercel deployment-protection bypass token exposed locally during WP03-T19's proof still awaits rotation by the founders.

## Rollback

Run `vercel promote dpl_E6CwEGXJq3rsdr7akwLyy9ZHZbk9` and revert `d64c9e7` through a pull request. No database or storage rollback is needed.
