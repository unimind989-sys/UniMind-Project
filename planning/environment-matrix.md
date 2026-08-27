# Environment matrix

This matrix records safe environment identities and isolation rules. Full project references, passwords, access tokens, keys, and connection strings stay in ignored workstation files or approved CI secret stores.

| Environment | Runtime/data plane | Safe project fingerprint | Region | Data classification | Reset allowed | GitHub integration | Owner | Current state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Workstation development | Next.js process and deterministic mocks only | N/A | Ahmed or Ziad workstation | Synthetic only | N/A | Repository checkout | Ahmed / Ziad | Available; never shared infrastructure |
| Hosted development | Supabase Auth and PostgreSQL | `sha256:5575d1c3d806` | Central EU (Frankfurt), `eu-central-1` | Synthetic only | Yes, guarded `development` confirmation only | Connected; review before automated schema deployment | Ahmed; Ziad project awareness | Provisioned, zero charge |
| Hosted CI | Separate Supabase Auth and PostgreSQL project | `sha256:6ad364ad022a` | Central EU (Frankfurt), `eu-central-1` | Synthetic only | Yes, guarded `ci` confirmation only | Protected GitHub Actions `ci` environment; `main`-only approval gate | Ahmed; Ziad project awareness | Provisioned, zero charge; WP01-T08 PASS |
| Preview | Separate external Supabase project plus external deployment target | Not assigned | Not assigned | Synthetic only | No from development/CI commands | Not configured; shared private-repository deployment plan/provider unresolved | Ahmed / Ziad; Ziad executor, Ahmed reviewer | Provisioning authorized; not provisioned — free project allocation exhausted and paid budget unapproved |
| Beta | Separate external Supabase project plus external deployment target | Not assigned | Not assigned | Rights-approved pilot data only after later rights/data gates; no real data authorized now | No from development/CI commands | Not configured; shared private-repository deployment plan/provider unresolved | Ahmed / Ziad; Ziad executor, Ahmed reviewer | Provisioning authorized; not provisioned and locked — free project allocation exhausted and paid budget unapproved |

## WP01-T09 authorization and capacity checkpoint — 2026-08-27

- Ahmed authorized Ziad to provision separate preview and beta Supabase/deployment resources. Ahmed and Ziad are the environment owners; Ziad remains executor/implementation owner; Ahmed is the required human reviewer for the ordinary isolation implementation.
- This authorization does not approve a paid plan, provider spend, real pilot data, beta unlock/go-live, or bypass of the two-person gates for rights, deletion, budgets/kill switches, release/unlock, and beta go-live.
- Supabase documents an entitlement of two active Free projects across organizations where a user is Owner or Administrator. Hosted development and hosted CI already consume the available free allocation. [Official Supabase Billing FAQ](https://supabase.com/docs/guides/platform/billing-faq).
- Vercel documents that Hobby does not support collaboration for private repositories; a shared private-repository workflow needs an approved compatible plan/provider arrangement. [Official Vercel collaboration guidance](https://vercel.com/docs/deployments/troubleshoot-project-collaboration).
- Preview and beta project fingerprints, regions, storage namespaces, worker/queue namespaces, callback bases, and secret scopes remain deliberately unassigned. No external resource or secret was created by this checkpoint.
- Stop before an upgrade, trial, payment method, billable resource, or provider spend until Ahmed approves an exact budget.

## Isolation rules

- Development and CI use different hosted projects and different database passwords.
- The full project references remain only in `.local/supabase/development.env` and `.local/supabase/ci.env` on an authorized workstation.
- `pnpm verify` never loads either hosted profile and remains credential-free, mock-only, and zero-cost.
- A hosted reset must select exactly `development` or `ci` and provide the matching target-specific confirmation value.
- Preview and beta references are forbidden in the hosted command guard and cannot be relabeled as development or CI.
- The development GitHub connection must not become a dashboard-only schema authority; migrations and seed data remain versioned in this repository.
- Preview and beta must use separate projects, namespaces, callbacks, and secrets. Neither environment may borrow development/CI credentials or share a project with the other.
- Preview remains synthetic and mock-only. Beta remains locked and contains no real pilot data until the separate rights/data and beta-release gates pass.
