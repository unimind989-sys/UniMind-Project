# WP03-T33 production proof

**Status: PASS, with the limits below.** `main` at `606cacec91dba3230cdf48a998802c33dd63a325` (WP03-T33, [#100](https://github.com/unimind989-sys/UniMind-Project/pull/100), 13 of 13 required checks green on the exact head, run [39250352524](https://github.com/unimind989-sys/UniMind-Project/actions/runs/39250352524); `main` run [39251415638](https://github.com/unimind989-sys/UniMind-Project/actions/runs/39251415638) green) now serves [UniMind](https://unimind.space) on `unimind.space`, `www.unimind.space` (308 to the apex) and `project-xwrez.vercel.app`.

## What this release ships

Production last served `09a8149` (WP03-T32). This release adds WP03-T33: the Cobalt motion layer (press feedback, delivery rises, menu entrances, the landing reveal) and the "on the desk" pass on every screen (sheets, the folio edge under page bands, book covers and rows, marked pages, the centred Chat column, the materials grid, the quiz side rail, the sticky admin detail, the Subjects band search) plus the landing's sticky masthead, bilingual section and footer links. `DESIGN.md` records every changed rule. Presentation only: no Server Action, guard, authorization, RLS, storage, CI workflow or configuration change.

## Authorization

- **Approval:** Ahmed approved the rendered candidate `6c3316a` in chat on 19 October 2026 after reviewing the local demo; the later commits on the branch changed only the task record.
- **Promotion:** Ahmed asked in chat on 19 October 2026 to "promote 606cace to production with the usual Vercel procedure and record the evidence".
- **D-22** covers the non-financial lifecycle.
- **Cost:** the Vercel team is on the Hobby plan with no trial (`/v2/teams` read before the deploy and again before the promotion); no paid action, upgrade or billable resource was involved.

## Vercel release

The release followed the procedure of the [WP03 refinement proof](2026-10-18_wp03-refinement_production_680a507.md) and the [WP03-T32 proof](2026-10-18_wp03-t32-follow-ups_production_09a8149.md), with the scripts rebuilt for this release under the ignored `.local/wp03-t33/release/` folder.

- **Target:** Vercel team `unimind2` / `team_rf0YAPUJBDuZQ8ZB2zbx8SO9`, project `unimind-preview` / `prj_pVmnuEUakL8R5ap78cAalBjwymbO`, `autoAssignCustomDomains` false; CLI 59.9.1, authenticated as `unimind989-sys`.
- **Upload:** an exact `git archive` of `606cace` (3,182 files, each blob hashed and equal to `git ls-tree -r`; tree `28f20e872cb3b6035f61e0d5111e226fbb2e5a82`), plus the credential-free `.vercel/project.json`. The tracked `.env.example` is the only env file.
- **Deploy:** `vercel deploy --prod --skip-domain`, with the same mock-only build and runtime overrides as the previous releases: `NEXT_PUBLIC_RELEASE_ID=wp03-t33-felt-refinement-606cace-production`, `PROVIDER_MODE=mock`, `APPROVED_PROVIDER_BUDGET_MINOR=0`, the three provider flags `false`, `NEXT_PUBLIC_TELEMETRY_ENABLED=false`, `NEXT_TELEMETRY_DISABLED=1`, `UNIMIND_SYNTHETIC_DEMO=false`.
- **Configuration:** all 16 required Production configuration names are present on the project (names only; no values were read). No configuration name changed since `09a8149`.

| Binding | Value |
| --- | --- |
| Source | `606cacec91dba3230cdf48a998802c33dd63a325` |
| Artifact | `dpl_9AUDhgcs5TpPYBizMT6PfVwgRkM8`, READY Production, `https://unimind-preview-2ilqjw9hk-unimind2.vercel.app` |
| Release marker | `wp03-t33-felt-refinement-606cace-production` |
| Rollback | `dpl_BSywTFbR58CdAzmj1XonNR8N1JN8` (marker `wp03-t32-follow-ups-09a8149-production`) |

- **Before promotion:** 19 of 19 checks passed on the protected artifact through `vercel curl` (never `--debug`; only parsed results printed): home 200; release, synthetic-only and mock-only markers; `theme-color` `#0c1823`; the landing's account links, slogan and the new bilingual section; the icon; the previous alias still on the rollback target; the release fingerprint (`validateReleaseFingerprint`, 6 of 6: source SHA, environment, release id, required configuration, intended deployment, rollback target); `smoke:deployment` 7 of 7; `/login` 200, private and no-store; `/login?lang=ar` rendered `<html lang="ar" dir="rtl">` on the server; a document load with `?lang=ar` set the `unimind-locale` cookie HttpOnly and Secure; a document load of `/register` with that cookie returned 307 to `/register?lang=ar`; anonymous `/welcome` redirected to `/login` with no profile form; `/synthetic-runtime/admin` 404; the anonymous upload POST 403 `UPLOAD_REJECTED`. The cookie checks send `Sec-Fetch-Dest: document`, as a browser does, because the proxy remembers the language only on document loads.
- **Promotion:** `vercel promote unimind-preview-2ilqjw9hk-unimind2.vercel.app`, after re-reading the team plan, the project scope, the deployment identity (source SHA and tree) and the rollback alias.
- **Public proof:** the same checks on `unimind.space` (20 of 20, including `www.unimind.space` 308 to `https://unimind.space/`) and on `project-xwrez.vercel.app` (19 of 19), with both public aliases pointing at `dpl_9AUDhgcs5TpPYBizMT6PfVwgRkM8`.
- **Browser:** `https://unimind.space/?lang=en` in the built-in browser carries the release marker, the nine landing reveals and the bilingual section.

## Supabase

Skipped: this release changes no auth, data or storage behaviour, and the hosted project's migrations are unchanged since the WP03-T32 proof.

## Limits

- **No signed-in journey.** No signed-in production journey is claimed. The executor did not enter the hosted synthetic passwords on a non-local host. The same tree passed the full demo, real e2e and database e2e suites in exact-head CI.
- **Auto-pause.** The Supabase Free project pauses again after a quiet week; while paused, real accounts cannot sign in. The demo accounts are unaffected.
- **Bypass secret.** `vercel curl` may create or reuse the project's Protection Bypass for Automation secret without showing it; it was never run with `--debug`. The secret printed during WP03-T19 still awaits a founder's revocation.

## Rollback

Run `vercel promote dpl_BSywTFbR58CdAzmj1XonNR8N1JN8`, then revert through pull requests as needed. No database or storage rollback is needed.
