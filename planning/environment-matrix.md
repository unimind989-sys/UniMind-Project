# Environment matrix

This matrix records safe environment identities and isolation rules. Full project references, passwords, access tokens, keys, connection strings, private provider correspondence, and backup material stay in approved restricted or ignored stores.

## Approved zero-cost target topology

| Environment | Runtime/data plane | Data classification | Destructive reset | External scope | Owner | Target state |
| --- | --- | --- | --- | --- | --- | --- |
| Workstation development | Next.js process and deterministic in-process mocks; no database service | Synthetic only | N/A | Repository checkout only | Ahmed / Ziad | Available; never shared infrastructure |
| Database/Auth CI | Complete disposable Supabase stack on a GitHub-hosted `ubuntu-24.04` runner | Synthetic only | Yes, inside the disposable runner only | Per-run GitHub Actions job; no persistent Supabase project or long-lived database secret | Ahmed / Ziad; agent executor | External lifecycle passed at `c1428f2`; obsolete GitHub environment/secrets retired and `database-ci` required on `main` |
| Preview | Repurposed Supabase Free project plus protected Vercel Hobby Preview deployment | Synthetic only; mock providers | No development/CI reset command; forward migrations only | Separate Supabase project and separate Vercel Hobby project/scope | Ahmed / Ziad | Provisioned, protected, externally smoke-tested, and rollback-rehearsed |
| Beta | Repurposed Supabase Free project plus protected Vercel Hobby Preview deployment | Empty until backup, rights, security, release, and go-live gates; then rights-approved pilot data only | No development/CI reset command; guarded forward migrations only | Separate Supabase project and separate Vercel Hobby project/scope | Ahmed / Ziad | Provisioned, protected, empty, and locked |

Preview and Beta must also receive separate storage namespaces, callback bases, queue/worker namespaces, environment secrets, and deployment authority as those adapters are selected. Unassigned future resources are not silently shared.

## Transition result — 2026-08-28

| Current resource | Safe fingerprint | Region | Current role | Required transition |
| --- | --- | --- | --- | --- |
| Existing Supabase development project | `sha256:5575d1c3d806` | Central EU (Frankfurt), `eu-central-1` | `unimind-preview`; synthetic/mock-only Preview | Repurposed without reset or schema/data deletion; replacement keys and database credential validated; legacy keys and workstation profile retired |
| Existing Supabase CI project | `sha256:6ad364ad022a` | West EU (Ireland), `eu-west-1` | `unimind-beta`; protected and empty locked Beta | Repurposed without reset or schema/data deletion; replacement keys and database credential validated; legacy keys and workstation profile retired |

Historical WP01-T04/T05/T08 evidence remains valid proof of what those targets did at the recorded commits. It does not prove the revised topology complete. The earlier `$55/month` four-project proposal is superseded, not authorized, and no longer blocks the zero-cost implementation path.

The 2026-08-28 read-only dashboard inventory corrected the historical CI-region label above. The project itself was not moved or changed; the earlier evidence remains accurate for its recorded commands and fingerprints but not for that descriptive region label.

The same inventory found both Supabase projects healthy and empty except for the versioned foundation schema: no Auth users, public tables, Storage buckets, Edge Functions, backups, or data rows require deletion. WP01-T09 therefore performs no database reset or data deletion. It preserves the schema, creates replacement publishable/secret API keys, validates the new deployment scopes, disables the legacy `anon`/`service_role` API keys, rotates database passwords, revokes the retired management token, and then removes the two ignored transitional workstation profiles.

The Vercel inventory found one empty `Unimind` Hobby workspace and no projects. One Hobby workspace can hold the two required isolated project scopes; a second Vercel subscription is not required. The approved binding is:

- `unimind-preview`: connected to the public GitHub repository for reviewed pull-request deployments, with only Preview Supabase configuration and synthetic/mock-only settings.
- `unimind-beta`: no Git integration; exact reviewed commits are deployed explicitly as Vercel preview deployments under Beta-only configuration. Vercel Authentication with Standard Protection keeps those preview/deployment URLs locked on Hobby. No production deployment or production domain is created during WP01-T09.

The repository pins Vercel CLI `59.9.1`. Both Vercel projects were rebuilt from commit `4021457` as Preview-targeted deployments after credential rotation. Preview remains the only Git-connected project; Beta remains Git-disconnected and protected. Provider identifiers, keys, URLs that expose internal topology, and protection-bypass values remain outside Git; no bypass remains active or retained.

## Approval and eligibility checkpoint — 2026-08-27

- Ahmed approved the zero-cost-first D-21 revision and the two-project topology. Codex `/root` remains the agent executor; Ahmed and Ziad remain shared environment owners.
- Ahmed reports receiving Vercel confirmation that Hobby may be used for the current UniMind phase. The private confirmation was not inspected or committed. Continued use requires the confirmation and provider terms to remain applicable.
- Recheck Vercel eligibility before revenue, payments, advertising, donations, paid contributors, customer work, or another material scope/provider-policy change. Stop deployment if eligibility becomes uncertain.
- No paid plan, trial, payment method, add-on, usage purchase, or billable resource is approved. Future spend requires a separate decision and the protected budget confirmations.
- The repository is public. Standard GitHub-hosted runners are used for the proposed ephemeral CI path; no founder workstation becomes a runner or runtime dependency.
- Supabase Free currently provides the two persistent project slots used by UniMind. Branching and automatic backups are not part of the Free plan, and inactive Free projects may pause.
- Beta remains empty of real data until an approved encrypted backup/restore procedure is implemented and rehearsed, or later paid capacity is explicitly approved. This is a hard blocker for real pilot data and beta go-live, not for synthetic provisioning.
- D-22 governs the shared service identity. Provider account activity does not identify the human actor; task and evidence records name the checkpoint.

Official constraints were rechecked on 2026-08-27 and the credential/protection details on 2026-08-28: [Supabase pricing](https://supabase.com/pricing), [Supabase CLI local/CI stack](https://supabase.com/docs/guides/local-development/cli/getting-started), [Supabase branching](https://supabase.com/docs/guides/deployment/branching), [Supabase API-key migration](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys), [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [GitHub runner containers](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/run-jobs-in-a-container), [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Vercel deployment protection](https://vercel.com/docs/deployment-protection), and [Vercel fair-use guidance](https://vercel.com/docs/limits/fair-use-guidelines).

## Existing local health and smoke checkpoint

- `/api/health/live` reports process liveness without entering the Auth proxy or calling an external dependency.
- `/api/health/ready` validates server configuration and returns only `ready` or `not_ready`; it exposes no failing variable name, secret, or topology detail.
- Both routes are uncached and reject unsupported writes with `405`.
- `pnpm smoke:deployment` accepts loopback local targets or remote HTTPS Preview targets, rejects unsafe URLs, and verifies liveness, readiness, write denial, application response, and synthetic/mock-only mode.
- The command passed six checks against a live local Next.js process. On 2026-08-29, the same six outcomes passed against protected external Preview, and locked Beta passed the equivalent health/application checks. Ahmed approved short-lived automation bypass use; the pinned CLI generated it only for the checks, it was revoked immediately afterward, both projects returned to zero bypass entries, and anonymous access again redirected to Vercel Authentication.

## Isolation rules

- Workstations use mocks. Database/Auth CI uses a disposable runner-local stack. Neither may borrow Preview or Beta credentials.
- The transitional `.local/supabase/development.env` and `.local/supabase/ci.env` profiles were deleted after the disposable job passed, both replacement key/database paths were validated, and the retired management token was revoked. They must not be recreated for Preview/Beta access.
- `pnpm verify` remains credential-free, mock-only, and zero paid-provider cost.
- Preview and Beta references are forbidden in destructive development/CI commands and cannot be relabeled to bypass a guard.
- Preview receives synthetic data and mock providers only. Beta remains locked and empty until its protected gates pass.
- Preview and Beta never share a Supabase project, Vercel project scope, secrets, callbacks, storage namespace, queue/worker namespace, or deployment authority.
- Migrations and seed data remain versioned. Preview/Beta schema repair is forward-only; dashboard-only repair is prohibited.
