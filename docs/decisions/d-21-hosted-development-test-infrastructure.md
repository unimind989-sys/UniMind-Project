# Decision D-21: Zero-cost development, CI, Preview, and Beta infrastructure

**Status:** APPROVED

**Owner:** Ahmed

**Reviewers:** Ziad (project awareness); later protected RLS, deletion, rights, budget, release/unlock, and beta go-live gates require separate Ahmed and Ziad confirmations

**Decision deadline:** N/A — revised direction APPROVED 2026-08-27

**Last reviewed:** 2026-08-27

**Blocks:** WP01-T08 through WP01-T11 must implement and verify the revised topology before WP02 starts

## Context

The workstations cannot run the Docker-based Supabase stack and must never become shared infrastructure dependencies. The first approved workaround used one hosted Supabase project for development and another for CI, with two additional projects proposed for Preview and Beta. That design is isolated but exceeds the two-project Supabase Free allowance.

Ahmed approved a revised plan that remains at zero platform cost as far as possible. Ahmed also reports that he received confirmation from Vercel that the current UniMind phase may use Hobby. The repository does not claim to have inspected that private correspondence; its applicability must be rechecked if the project introduces revenue, payments, advertising, donations, paid contributors, customer work, or another material scope change.

Supabase Auth and PostgreSQL remain the approved database architecture. The two existing Supabase Free projects are sufficient when database/Auth CI is made ephemeral and the persistent projects are reserved for Preview and locked Beta.

## Non-negotiable requirements

- Workstation development runs the Next.js process and deterministic in-process mocks only. It requires no persistent database or infrastructure service.
- Database/Auth CI creates a complete ephemeral Supabase stack on a standard GitHub-hosted Ubuntu runner, applies migrations and synthetic seed data, runs Auth/database/security checks, and destroys the stack with the runner.
- CI does not depend on a founder computer, a persistent hosted database, Supabase branching, or long-lived Supabase credentials.
- The two persistent Supabase Free projects become separate Preview and Beta projects only after ephemeral CI passes and the repurposing procedure rotates credentials and removes the former development/CI scopes.
- Preview is synthetic/mock-only and receives forward migrations. Development/CI destructive reset commands must never target it.
- Beta remains locked and empty of real pilot data until rights, backup/restore, security, release, and two-founder go-live gates pass.
- Preview and Beta keep separate projects, secrets, callbacks, storage, jobs, budgets, and deployment controls. A shared project or branch is insufficient.
- Vercel Hobby may be used only while Ahmed's reported provider confirmation and the plan's eligibility conditions remain applicable. No paid plan, trial, add-on, or billable resource is authorized by this decision.
- `pnpm verify` remains credential-free, mock-only, and zero paid-provider cost.
- Migrations, synthetic seed data, generated types, and security evidence remain reproducible from version control; dashboard-only schema repair is prohibited.

## Options evaluated

| Option | Quality and isolation | Zero-cost fit | Decision |
| --- | --- | --- | --- |
| Four persistent Supabase projects for development, CI, Preview, and Beta | Strong persistent isolation | Exceeds the current two-project Free allowance | Superseded |
| Two persistent Free projects for Preview/Beta plus ephemeral Supabase CI | Preserves Preview/Beta isolation and exercises the real Supabase stack | Fits the current Free allowance and public-repository standard GitHub runner terms | Chosen |
| Share one Supabase project between Preview and Beta | Weakens secrets, reset, data, and release isolation | Fits Free | Rejected |
| Rotate one persistent project among development, CI, Preview, and Beta | Creates unsafe state transitions and unreliable evidence | Fits Free | Rejected |
| Replace Supabase | Requires a new Auth, grants, RLS, migration, and security evaluation | Unknown | Not justified |

## Decision

Use the following zero-cost-first topology:

1. **Workstation development:** local application process plus deterministic mocks; no database service.
2. **Database/Auth CI:** disposable full Supabase stack on a standard GitHub-hosted Ubuntu runner for each gated run.
3. **Preview:** one existing Supabase Free project, repurposed from the current development project after the CI migration is proven; synthetic data and mock providers only.
4. **Beta:** the other existing Supabase Free project, repurposed from the current CI project after the CI migration is proven; locked and empty until later protected gates.
5. **Web deployment:** separate Vercel Hobby projects or equivalently isolated Vercel project scopes for Preview and Beta, subject to the reported provider confirmation and continued eligibility.

The current hosted development and hosted CI projects remain transitional and must not be repurposed until WP01-T08 proves the ephemeral runner path. ADR-0001 records the architecture consequences.

## Consequences

### Benefits

- Keeps the platform plan at zero recurring cost under the currently documented allowances.
- Preserves the essential Preview/Beta database and secret boundary.
- Removes persistent development/CI databases and long-lived CI database credentials.
- Keeps database tests independent of founder computers and exercises migrations, Auth, PostgreSQL, grants, and RLS against a complete Supabase stack.

### Costs and risks

- CI will be slower and more sensitive to runner image, Docker, and dependency-download reliability.
- There is no persistent hosted development database; developers use mocks and diagnose database behavior through CI or a deliberately approved synthetic Preview check.
- Supabase Free does not include branching or automatic backups and may pause inactive projects. Beta may not receive real data until an approved encrypted backup/restore procedure is implemented and rehearsed, or a later paid capacity decision is approved.
- Repurposing the existing projects is a one-time sensitive transition requiring evidence, credential rotation, secret cleanup, and exact target verification.
- Vercel eligibility is conditional. A commercial or organizational scope change triggers review before continued use or deployment.

## Implementation contract

- WP01-T08 replaces the credentialed persistent hosted-CI job with a pinned ephemeral Supabase runner job and proves two clean resets, stable generated types, Auth/database/security checks, isolation, cleanup, and no hosted database secrets.
- Only after WP01-T08 passes may WP01-T09 repurpose the current development project as Preview and the current CI project as locked Beta. Both projects require credential rotation, old secret removal, safe fingerprint recording, and new scope verification.
- Preview uses forward-only migration automation and synthetic/mock-only smoke checks. Beta migration/promotion remains guarded and locked.
- Vercel Preview and Beta configuration must keep environment variables, deployment authority, callbacks, and domains isolated. Pull-request code receives no Beta secrets.
- The environment matrix records the transition state as well as the approved target state without exposing full identifiers or credentials.
- Required evidence includes the runner image and pinned CLI versions, clean-run reproducibility, target cleanup, secret scan, project repurposing checklist, Preview smoke, locked-Beta readiness, and backup/restore blocker state.
- Rollback before repurposing keeps the transitional hosted CI target active. Rollback after repurposing disables the affected deployment, rotates credentials, preserves migrations/evidence, and provisions a clean target only under a newly approved capacity decision; Preview and Beta are never pointed at each other's data.

## Revisit triggers

- Revenue, payments, advertising, donations, paid contributors, customer work, a Vercel policy/confirmation change, or any uncertainty about Hobby eligibility.
- Supabase Free allowance, pausing, backup, branching, CI compatibility, or quota changes.
- Runner unreliability, unacceptable CI duration, inability to test the hosted Supabase behavior faithfully, or a security review failure.
- Beta needs real data before a free encrypted backup/restore path is implemented and rehearsed.
- Approved spend or a replacement infrastructure decision makes a stronger topology available.

## Approval and revision history

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Ahmed | Product/architecture owner | Approved hosted Supabase development and isolated hosted CI; rejected local workstation infrastructure | 2026-08-25 |
| Ahmed | Product/architecture owner | Superseded the four-persistent-project direction with the zero-cost-first topology and reported Vercel confirmation for the current Hobby use | 2026-08-27 |
