# Environment matrix

This matrix records safe environment identities and isolation rules. Full project references, passwords, access tokens, keys, and connection strings stay in ignored workstation files or approved CI secret stores.

| Environment | Runtime/data plane | Safe project fingerprint | Region | Data classification | Reset allowed | GitHub integration | Owner | Current state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Workstation development | Next.js process and deterministic mocks only | N/A | Ahmed or Ziad workstation | Synthetic only | N/A | Repository checkout | Ahmed / Ziad | Available; never shared infrastructure |
| Hosted development | Supabase Auth and PostgreSQL | `sha256:5575d1c3d806` | Central EU (Frankfurt), `eu-central-1` | Synthetic only | Yes, guarded `development` confirmation only | Connected; review before automated schema deployment | Ahmed; Ziad project awareness | Provisioned, zero charge |
| Hosted CI | Separate Supabase Auth and PostgreSQL project | `sha256:6ad364ad022a` | Central EU (Frankfurt), `eu-central-1` | Synthetic only | Yes, guarded `ci` confirmation only | None until WP01-T08 | Ahmed; Ziad project awareness | Provisioned, zero charge |
| Preview | Externally hosted, separate project | Not assigned | Not assigned | Synthetic only | No from development/CI commands | Not configured | Unassigned | Not provisioned; blocked on WP01-T09 |
| Beta | Externally hosted, separate project | Not assigned | Not assigned | Rights-approved pilot data only | No from development/CI commands | Not configured | Unassigned | Not provisioned and locked |

## Isolation rules

- Development and CI use different hosted projects and different database passwords.
- The full project references remain only in `.local/supabase/development.env` and `.local/supabase/ci.env` on an authorized workstation.
- `pnpm verify` never loads either hosted profile and remains credential-free, mock-only, and zero-cost.
- A hosted reset must select exactly `development` or `ci` and provide the matching target-specific confirmation value.
- Preview and beta references are forbidden in the hosted command guard and cannot be relabeled as development or CI.
- The development GitHub connection must not become a dashboard-only schema authority; migrations and seed data remain versioned in this repository.
