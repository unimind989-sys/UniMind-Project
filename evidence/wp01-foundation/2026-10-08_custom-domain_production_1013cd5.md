# Custom domain production proof — 2026-10-08

**Status: PASS for website domain setup.** [UniMind](https://unimind.space) serves the previously reviewed application with valid HTTPS. [www.unimind.space](https://www.unimind.space) redirects permanently to the apex. This maintenance maps to WP01-T09; Ahmed authorized autonomous configuration of the already-purchased domain and required main-only repository work.

## Target and source

- Hostinger domain: unimind.space; existing authoritative nameservers atlas.dns-parking.com and hyperion.dns-parking.com retained.
- Vercel team/project: unimind2 / unimind-preview, verified through the authenticated repository-pinned CLI and signed-in dashboard. Hobby plan retained.
- Separate main checkout: E:/UniMind-domain-main at b4cac79cd6a306e5d011e2d69f916c8c17dc6007. The original codex/frontend-refinements checkout and its unfinished edits were preserved.
- Source: 1013cd5961edd9b3eb8670c0363b712e2e0747a0, reviewed under WP03-T10 and contained in main. Executable source/configuration is unchanged from main; no frontend WIP was deployed.
- Rebuilt production deployment: dpl_7vzJmYUCUkCQZN1hCwJFsHuuqc2V, READY. The apex alias was independently resolved to this exact deployment/project through Vercel API. Both new domains and project-xwrez.vercel.app were explicitly rebound to it.
- Public release fingerprint: wp03-t10-open-folio-1013cd5-production. The project variable was reconciled to this already-public fingerprint before the rebuild, avoiding its stale WP03-T05 label.
- Rollback: dpl_4gRN7d4ytvkFGnEaVwEmQBWw92cd remains available. Existing mock mode, budget 0, and disabled generation/embedding/transcription were independently inspected before rebuilding. Beta was neither modified nor released.

## Configuration

| Provider              | Record/setting      | Final value                                                                         |
| --------------------- | ------------------- | ----------------------------------------------------------------------------------- |
| Hostinger             | A @, TTL 300        | 216.198.79.1                                                                        |
| Hostinger             | A @, TTL 300        | 64.29.17.1                                                                          |
| Hostinger             | CNAME www, TTL 300  | 54121ff874de4767.vercel-dns-017.com                                                 |
| Vercel                | www redirect        | unimind.space, HTTP 308                                                             |
| Vercel Production     | APP_ORIGIN          | https://unimind.space                                                               |
| Vercel Preview        | APP_ORIGIN          | Prior https://project-xwrez.vercel.app preserved in its separate scope              |
| Preview Supabase Auth | Site URL            | https://unimind.space                                                               |
| Preview Supabase Auth | Added redirect URLs | https://unimind.space/auth/callback; https://project-xwrez.vercel.app/auth/callback |

Hostinger nameservers and all four pre-existing MX/TXT rows were preserved. The two earlier Supabase redirect entries remain. There are no wildcard grants for new hosts, new credentials, new providers, purchases, renewals, paid trials, or subscription changes. The existing automation bypass used by vercel curl predates this work; no bypass was added or removed.

## Executed proof

Vercel domains verify returned configured-correctly and verified for both names. Authoritative DNS independently returned both apex A records and the intended www CNAME. Default certificate validation succeeded for HTTPS requests; no certificate checks were bypassed. Signed-in Vercel UI reports Valid Configuration for both names and shows the www 308 redirect.

The unchanged main script scripts/run-deployment-smoke.ts ran using pinned Node 24.19.0 and passed all seven checks: liveness/readiness, unsupported-write denial for each, application identity, synthetic/mock-only runtime, and SVG application icon. The additional public proof at 2026-10-08T17:43:00.697Z passed eleven checks:

| Check                                | Observed result                                                             |
| ------------------------------------ | --------------------------------------------------------------------------- |
| Apex landing and release fingerprint | HTTP 200; expected UniMind identity and release                             |
| www path/query preservation          | HTTP 308 to https://unimind.space/login?lang=ar                             |
| HTTP-to-HTTPS upgrade                | HTTP 308 to https://unimind.space/login?lang=en                             |
| Login cache isolation                | HTTP 200; private/no-store                                                  |
| Invalid callback with external next  | HTTP 303 to same-domain verify-email invalid-link page; private/no-store    |
| Invalid recovery callback            | HTTP 303 to same-domain forgot-password invalid-link page; private/no-store |
| Anonymous /learn                     | Streamed redirect to same-domain login                                      |
| Anonymous /admin                     | Streamed redirect to same-domain login                                      |
| Anonymous /batch-leader              | Streamed redirect to same-domain login                                      |
| Public /synthetic-runtime/learn      | HTTP 404                                                                    |
| Anonymous campaign upload POST       | HTTP 403; minimal UPLOAD_REJECTED response                                  |

Browser proof: landing and login render on the new domain; the exact approved synthetic student pair enters the consent screen without backend identity creation. A fresh navigation discards that simulation and anonymous /learn returns to login. No commitment acceptance, real account creation, email send, provider call, or real data was needed.

## Reconciliation and limits

The first DNS edit paused on Hostinger's hosting upsell; choosing No thanks, point my domain completed the requested record change. Adding the second provider-recommended A record required acknowledging Hostinger's duplicate-record notice. The whole zone was never reset.

The CLI env update command changed both scopes of the existing shared APP_ORIGIN variable despite selecting Production. Before rebuilding, it was split into Production and Preview entries and the previous Preview value restored. Attempting to change the new Preview variable from Secret to Config was rejected without mutation; its correct value remains server-side and usable. The public origin carries no secret.

Unauthenticated smoke against the protected deployment URL failed as expected. Authenticated vercel curl then proved readiness and the new canonical callback before public alias binding. A promotion call after explicit alias assignment returned already-current-production (409); no second deployment or promotion was performed.

The first additional proof assumed every protected page emitted an HTTP redirect. Inspection showed the existing Next.js streamed redirect in HTTP 200, containing its framework redirect marker and explicit login refresh. The check was corrected to assert those exact redirect signals, and browser navigation independently confirmed denial. This is a verification expectation correction; application authorization was not changed.

Existing source-bound WP03-T10 application/database proof is reused because executable source is identical. Broad application/database CI was not rerun for external DNS/origin configuration. Live email delivery, mailbox forwarding, and real account journeys were not exercised; the explicit callback configuration and invalid-link/recovery paths were checked. No new user-facing design or frontend approval is claimed.

## Resume and rollback

Repository closure checks passed: full task/evidence diff and secret/scope review, git diff --check, explicit-ignore Markdown formatting, secret scan of 3182 files, and agent readiness covering 793 names, 343 local links, 23 synchronized decisions, and 114 task contracts. Only the task record and this sanitized evidence were changed. Setup browser tabs were closed; the live UniMind tab remains available for review.

No domain setup work remains. The local public proof JSON/script and Vercel screenshot are in E:/UniMind-domain-main/.local/domain-setup. This evidence and the task update remain uncommitted on main; no main protection was bypassed and no PR was needed for the provider configuration.

For future controlled releases, explicitly bind all three public aliases to the reviewed production deployment. Keep the apex canonical origin, the exact Supabase callbacks, and the www redirect. Automatic custom-domain assignment remains at its pre-existing disabled setting.

To undo this connection, restore A @ to 2.57.91.91 (TTL 50), CNAME www to unimind.space (TTL 300), the prior production APP_ORIGIN and Supabase Site URL/allowlist, and rebind public application aliases to the retained rollback deployment. Never reset the DNS zone or touch Beta as part of this rollback.

**Release update (2026-10-16):** Today's `vercel promote` of `dpl_42tzJXb7utNR2te7gcJh7idZfnhU` (release `wp03-t13-frontend-refinements-45a8c8c-production`, merged source `45a8c8c`) moved all three hostnames, unimind.space, www.unimind.space (308 to the apex retained) and project-xwrez.vercel.app, to the new release, and 12 public smoke checks pass on unimind.space; see [the WP03-T13 production proof](../wp03-product-shell/2026-10-16_frontend-refinements_production_45a8c8c.md).
