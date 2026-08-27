# Environment matrix

This matrix records safe environment identities and isolation rules. Full project references, passwords, access tokens, keys, and connection strings stay in ignored workstation files or approved CI secret stores.

| Environment | Runtime/data plane | Safe project fingerprint | Region | Data classification | Reset allowed | GitHub integration | Owner | Current state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Workstation development | Next.js process and deterministic mocks only | N/A | Ahmed or Ziad workstation | Synthetic only | N/A | Repository checkout | Ahmed / Ziad | Available; never shared infrastructure |
| Hosted development | Supabase Auth and PostgreSQL | `sha256:5575d1c3d806` | Central EU (Frankfurt), `eu-central-1` | Synthetic only | Yes, guarded `development` confirmation only | Connected; review before automated schema deployment | Ahmed; Ziad project awareness | Provisioned, zero charge |
| Hosted CI | Separate Supabase Auth and PostgreSQL project | `sha256:6ad364ad022a` | Central EU (Frankfurt), `eu-central-1` | Synthetic only | Yes, guarded `ci` confirmation only | Protected GitHub Actions `ci` environment; `main`-only approval gate | Ahmed; Ziad project awareness | Provisioned, zero charge; WP01-T08 PASS |
| Preview | Separate external Supabase project plus external deployment target | Not assigned | Not assigned | Synthetic only | No from development/CI commands | Vercel Pro proposed; target not configured | Ahmed / Ziad shared founder authority; Codex agent executor; Ahmed human operator/reviewer | Provisioning authorized; not provisioned — exact paid proposal awaiting approval |
| Beta | Separate external Supabase project plus external deployment target | Not assigned | Not assigned | Rights-approved pilot data only after later rights/data gates; no real data authorized now | No from development/CI commands | Vercel Pro proposed; target not configured | Ahmed / Ziad shared founder authority; Codex agent executor; Ahmed human operator/reviewer | Provisioning authorized; not provisioned and locked — exact paid proposal awaiting approval |

## WP01-T09 authorization and capacity checkpoint — 2026-08-27

- Ahmed authorized separate preview and beta Supabase/deployment resources and will perform the required signed-in actions and ordinary human review. The current Codex task is the implementation executor; Ahmed and Ziad remain the shared environment owners.
- D-22 records the approved shared service identity: Ahmed and Ziad use the same GitHub/Supabase/Google account and will share future service accounts; Ahmed's separate GitHub contributor account is the exception. The provider account does not identify the acting founder, so task/evidence records name the human checkpoint.
- This authorization does not approve a paid plan, provider spend, real pilot data, beta unlock/go-live, or bypass of the two-person gates for rights, deletion, budgets/kill switches, release/unlock, and beta go-live.
- Supabase documents an entitlement of two active Free projects across organizations where a user is Owner or Administrator. Hosted development and hosted CI already consume the available free allocation. [Official Supabase Billing FAQ](https://supabase.com/docs/guides/platform/billing-faq).
- The GitHub repository is public, so the earlier private-repository collaboration blocker does not apply. Vercel Hobby is nevertheless restricted to non-commercial personal use. UniMind therefore treats Vercel Pro, not Hobby, as the compliant deployment proposal. [Official Vercel Hobby guidance](https://vercel.com/docs/plans/hobby) and [Pro pricing](https://vercel.com/docs/plans/pro-plan).
- Preview and beta project fingerprints, regions, storage namespaces, worker/queue namespaces, callback bases, and secret scopes remain deliberately unassigned. No external resource or secret was created by this checkpoint.
- Stop before an upgrade, trial, payment method, billable resource, or provider spend until the exact budget and spend controls receive their required named approvals.

## Bounded paid proposal — awaiting approval

| Service | Proposed scope | Monthly base before tax | Required spend control |
| --- | --- | ---: | --- |
| Supabase Pro | One paid organization containing separate Preview and Beta projects, both on Micro compute | `$35` (`$25` plan + two `$10` Micro projects - one `$10` monthly compute credit) | Keep the Supabase spend cap enabled; no add-ons, branching compute, custom domains, PITR, or paid overage |
| Vercel Pro | One team with the included deploying seat; Preview and Beta deployments from the same tested repository commit | `$20` platform fee | Configure Spend Management to stop additional usage at the approved limit; no paid add-ons or extra deploying seats |
| **Combined** | Four environment topology remains isolated; existing hosted Development and CI stay on the current Free allocation | **`$55/month` base before tax** | No on-demand overage; any higher limit or add-on requires a new approval |

Supabase documents that Pro starts at `$25/month`, Micro compute is about `$10/month` per project, and a paid organization receives `$10/month` in compute credit. Vercel documents a `$20/month` Pro platform fee with one deploying seat and `$20` usage credit. Prices were rechecked on 2026-08-27 against [Supabase pricing](https://supabase.com/pricing), [Supabase compute pricing](https://supabase.com/docs/guides/platform/manage-your-usage/compute), and [Vercel Pro pricing](https://vercel.com/docs/plans/pro-plan). This is a proposal, not authorization to spend.

## Local health and smoke checkpoint — 2026-08-27

- `/api/health/live` reports process liveness without entering the Auth proxy or calling an external dependency.
- `/api/health/ready` validates server configuration and returns only `ready` or `not_ready`; it exposes no failing variable name, secret, or topology detail.
- Both routes are uncached and reject unsupported writes with `405`.
- `pnpm smoke:deployment` accepts loopback local targets or remote HTTPS previews, rejects unsafe URLs, and verifies liveness, readiness, write denial, the application response, and synthetic/mock-only mode.
- The command passed six checks against a live local Next.js process. External Preview proof remains blocked until the proposed resources and budget are approved and provisioned.

## Isolation rules

- Development and CI use different hosted projects and different database passwords.
- The full project references remain only in `.local/supabase/development.env` and `.local/supabase/ci.env` on an authorized workstation.
- `pnpm verify` never loads either hosted profile and remains credential-free, mock-only, and zero-cost.
- A hosted reset must select exactly `development` or `ci` and provide the matching target-specific confirmation value.
- Preview and beta references are forbidden in the hosted command guard and cannot be relabeled as development or CI.
- The development GitHub connection must not become a dashboard-only schema authority; migrations and seed data remain versioned in this repository.
- Preview and beta must use separate projects, namespaces, callbacks, and secrets. Neither environment may borrow development/CI credentials or share a project with the other.
- Preview remains synthetic and mock-only. Beta remains locked and contains no real pilot data until the separate rights/data and beta-release gates pass.
