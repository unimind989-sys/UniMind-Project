# WP03-T32 production proof and hosted WP03-T27 migration

**Status: PASS.** Two things were done:

- `main` at `09a8149ca75eb62b048f99f3018cf79992c4f286` (WP03-T32, [#98](https://github.com/unimind989-sys/UniMind-Project/pull/98), all 14 checks green) now serves [UniMind](https://unimind.space).
- The WP03-T27 migration `20261018001935_profile_display_name_format.sql` is applied to the hosted Supabase project that production uses.

## Authorization

Ahmed asked for each step in chat on 18 October 2026:

- **Promotion:** he approved promoting the WP03 changes to the live site.
- **WP03-T32:** he asked to remove the demo admin Sign out if it isn't needed.
- **Database:** he asked to resume the paused `unimind-preview` Supabase project (free, no upgrade) and apply the name check with guarded steps. He signed in to the Supabase dashboard himself in the built-in browser; the executor entered no credentials.

D-22 covers the non-financial lifecycle. Both providers are on free plans (Vercel Hobby, Supabase Free), and no paid action, upgrade or billable resource was involved.

## Vercel release

The release followed the procedure in the [WP03 refinement proof](2026-10-18_wp03-refinement_production_680a507.md):

- **Upload:** an exact `git archive` of `09a8149` (3,179 files, equal to `git ls-tree -r`) plus the credential-free `.vercel/project.json`.
- **Deploy:** `vercel deploy --prod --skip-domain`, with the same mock-only overrides as that release.

| Binding | Value |
| --- | --- |
| Source | `09a8149ca75eb62b048f99f3018cf79992c4f286` |
| Artifact | `dpl_BSywTFbR58CdAzmj1XonNR8N1JN8`, `https://unimind-preview-dj5n5zmfk-unimind2.vercel.app` |
| Release marker | `wp03-t32-follow-ups-09a8149-production` |
| Rollback | `dpl_1ZyAFwbfAkcU4r2EjXfMvvDbYVcs` (marker `wp03-refinement-680a507-production`) |

- **Before promotion:** 15 of 15 protected checks passed through `vercel curl` (never `--debug`; only parsed results printed). They were the same checks as the previous release. The anonymous `/welcome` check accepts the redirect that Next streams inside a 200 when the route has a loading state, provided no profile form is in the response.
- **Release fingerprint:** `validateReleaseFingerprint` passed 6 of 6.
- **Promotion:** `vercel promote dpl_BSywTFbR58CdAzmj1XonNR8N1JN8`.
- **Public proof on `unimind.space` and `project-xwrez.vercel.app`:**
  - `smoke:deployment` passed 7/7 on each.
  - The release marker is present on each.
  - `/login` is private and no-store.
  - `www` redirects 308 to the apex.
  - The anonymous upload POST returns 403.
  - `/login?lang=ar` renders Arabic, right to left, on the server.

## Hosted Supabase: resume and migration

- **Target:** project `unimind-preview`, fingerprint `sha256:5575d1c3d806`. That is the approved Preview fingerprint, and it backs the Vercel project `unimind-preview` (see the 2026-09-24 audited-admin-actions release). The organization is on the Free plan.
- **Resume:**
  - The project was paused by Supabase's Free-plan inactivity policy.
  - It was resumed with the dashboard's "Resume project" control. The dialog said only that data is restored to the paused state; it mentioned no plan change or charge.
  - The status then reached Healthy, with the last migration `profile_academic_context`.
- **Method:** each SQL text was opened in the SQL editor through its `content` link. The editor's text was read back and its SHA-256 compared with the prepared file before running:
  - preflight: `ecd99100…69dcc`
  - transaction: `e2636b5c…5f71c`
  - postflight: `074d394e…6d489` and `b07883a7…386fc`

| Step | Result |
| --- | --- |
| Read-only preflight | Ledger head `20260930220000` with 28 rows, equal to the 28 repository migrations before this one. The function and trigger were absent. The ledger columns were `version, statements, name`. There were 0 `public.profiles` rows. |
| Guarded transaction | It locked the ledger. It re-checked the head (`20260930220000`) and that the target objects were absent, raising and rolling back otherwise. It applied the migration text verbatim, inserted the ledger row with the full migration as its single statement, and committed. Result: success. |
| Read-only postflight | Ledger head `20261018001935`. The stored statement's SHA-256 is `cdf4c77c470ce3024563717d95883cd680d43110f7295bd4c680aefeec0e3267`, equal to the repository file. The function is security invoker with `search_path=""`, its ACL is `{postgres=X/postgres}`, and `anon`/`authenticated` EXECUTE is false. The trigger is enabled (`O`): `BEFORE UPDATE OF display_name ON public.profiles FOR EACH ROW`. There are 0 profile rows, so no data was touched. |

The trigger's behaviour, including legacy rows and unchanged names, is proven by pgTAP `30_profile_display_name_format.sql` in `database-ci`. No write was made to hosted data to test it.

## Limits

- **No signed-in journey.** No signed-in production journey is claimed. The executor did not enter the hosted synthetic passwords on a non-local host. The demo admin's header change rests on the exact-source archive and on the demo suite, which passed in CI.
- **Auto-pause.** The Supabase project will pause again after a quiet week (Free plan). While it is paused, real accounts cannot sign in; the demo accounts are unaffected.
- **Bypass secret.** The Vercel bypass secret printed during WP03-T19 still awaits a founder's revocation.

## Rollback

- **Application:** `vercel promote dpl_1ZyAFwbfAkcU4r2EjXfMvvDbYVcs`.
- **Database:** the migration is forward-only. If it must be disabled, a reviewed forward migration drops the trigger. Do not delete the ledger row or edit history.
