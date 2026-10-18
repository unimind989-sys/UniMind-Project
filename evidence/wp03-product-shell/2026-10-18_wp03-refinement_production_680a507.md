# WP03 refinement production proof

**Status: PASS, with the limits below.** `main` at `680a507b375af3cf62b9aaffdae7e6a325d20c4f` now serves [UniMind](https://unimind.space) on `unimind.space`, `www.unimind.space` (308 to the apex) and `project-xwrez.vercel.app`. The commit was the WP03-T31 merge, [#96](https://github.com/unimind989-sys/UniMind-Project/pull/96), and its `main` CI run [39127089467](https://github.com/unimind989-sys/UniMind-Project/actions/runs/39127089467) passed.

## What this release ships

Production last served `d64c9e7` (WP03-T21). This release adds:

- **Product changes:**
  - WP03-T25, [#91](https://github.com/unimind989-sys/UniMind-Project/pull/91): shared primitives.
  - WP03-T26, [#94](https://github.com/unimind989-sys/UniMind-Project/pull/94): phone space and declutter.
  - WP03-T27, [#92](https://github.com/unimind989-sys/UniMind-Project/pull/92): profile onboarding and the shared access gate.
  - WP03-T28, [#93](https://github.com/unimind989-sys/UniMind-Project/pull/93): remembered interface language.
  - WP03-T29, [#95](https://github.com/unimind989-sys/UniMind-Project/pull/95): interactions and inputs.
- **Demo, test, CI and docs only:** WP03-T22 to T24, T30 and T31.

Every task merged with green required CI on its exact head, as recorded in the [final verification](../../docs/reviews/wp03-refinement/final-verification.md).

## Authorization

- **Promotion:** Ahmed asked in chat on 18 October 2026 to promote the changes to the live site.
- **D-22** covers the non-financial lifecycle.
- **Cost:** the Vercel team is on the Hobby plan, and no paid action was taken.

## Production source, configuration and promotion

- **Target:** Vercel team `unimind2` / `team_rf0YAPUJBDuZQ8ZB2zbx8SO9`, project `unimind-preview` / `prj_pVmnuEUakL8R5ap78cAalBjwymbO`; CLI 59.9.1, authenticated as `unimind989-sys`.
- **Upload:** an exact `git archive` of `680a507` (3,176 files, equal to `git ls-tree -r`), plus the credential-free `.vercel/project.json`. The tracked `.env.example` is the only env file.
- **Deploy:** `vercel deploy --prod --skip-domain`, with build and runtime overrides:
  - `NEXT_PUBLIC_RELEASE_ID=wp03-refinement-680a507-production`
  - `PROVIDER_MODE=mock`
  - `APPROVED_PROVIDER_BUDGET_MINOR=0`
  - all three provider flags `false`
  - `NEXT_PUBLIC_TELEMETRY_ENABLED=false`
- **Configuration:** every required Production configuration name is present (`vercel env ls production`, names only; no values were read). No configuration name changed since `d64c9e7`. The only `next.config.ts` change applies to the loopback demo only.

| Binding | Value |
| --- | --- |
| Source | `680a507b375af3cf62b9aaffdae7e6a325d20c4f` |
| Artifact | `dpl_1ZyAFwbfAkcU4r2EjXfMvvDbYVcs`, READY Production, `https://unimind-preview-gte804yya-unimind2.vercel.app` |
| Release marker | `wp03-refinement-680a507-production` |
| Rollback | `dpl_HpqAJCgGciWxiu9xhbnkp6yRWHFg` (previous public artifact, marker `wp03-t21-leader-admin-cobalt-d64c9e7-production`) |

Before promotion, the protected artifact passed 15 checks through `vercel curl`, never with `--debug`. Only parsed results were printed.

- **Carried over from earlier releases:**
  - liveness and readiness;
  - the login page: 200, private and no-store;
  - the release marker;
  - the synthetic-only and mock-only markers;
  - `theme-color` `#0c1823`;
  - the landing page with its account links;
  - the icon;
  - the 403 anonymous upload denial.
- **New for this release:**
  - `/login?lang=ar` renders `<html lang="ar" dir="rtl">` on the server.
  - A document load with `?lang=ar` sets the `unimind-locale` cookie as HttpOnly and Secure.
  - A document load of `/register` with that cookie returns 307 to `/register?lang=ar`.
  - Anonymous `/welcome` streams a redirect to `/login`, with no profile form in the response. This is the same streamed-redirect pattern the WP03-T21 record noted for anonymous `/admin`, because the route has a loading state.

`validateReleaseFingerprint` passed all six of its checks: source SHA, environment, release fingerprint, required configuration presence, intended deployment and rollback target. `vercel promote dpl_1ZyAFwbfAkcU4r2EjXfMvvDbYVcs` then moved the public alias.

Public proof on `unimind.space` and `project-xwrez.vercel.app`:

- `smoke:deployment` passed 7/7 on each.
- The release marker is present on each.
- `/login` returns 200 with `private, no-cache, no-store`.
- The anonymous upload POST returns 403.
- `www.unimind.space` returns 308 to `https://unimind.space/`.
- `/login?lang=ar` renders Arabic, right to left, on the server.
- **Browser, after visiting `/login?lang=ar`:** typing `https://unimind.space/register` opened `/register?lang=ar` in Arabic, right to left, from the remembered language.
- **Browser, anonymous `/admin`:** it landed on the Arabic "Sign in to UniMind" page (`/login?lang=ar&next=%2Flearn`) with no admin content. The return path is `/learn`, because the return-path allow-list rejects `/admin`. After sign-in, an admin's role home is `/admin`.

## Limits

- **Database migration not applied.** WP03-T27's migration `20261018001935_profile_display_name_format.sql` has not been applied to the hosted synthetic Supabase project that production uses. This machine has no hosted database credentials (`.local/supabase/development.env` is absent), and the Supabase CLI is not signed in. The migration is additive: a trigger that checks a display name only when it changes. The released code does not depend on it, because names are already validated and normalized in the application. Until it is applied, the database-level name check is absent, and the hosted migration ledger is one migration behind the repository.
- **No signed-in journey.** No signed-in production journey is claimed. The executor did not enter the hosted synthetic passwords on a non-local host. The same tree passed the full demo, real e2e and database e2e suites in exact-head CI and in the final local verify.
- **Bypass secret.** `vercel curl` may create or reuse the project's Protection Bypass for Automation secret without showing it. It was never run with `--debug`. The secret printed during WP03-T19 still awaits a founder's revocation.

## Rollback

Run `vercel promote dpl_HpqAJCgGciWxiu9xhbnkp6yRWHFg`, then revert through pull requests as needed. No database or storage rollback is needed, because this release changed no hosted data or schema.
