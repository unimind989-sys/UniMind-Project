# ADR-0001: Zero-cost environment topology

**Status:** Accepted

**Date:** 2026-08-27

## Context

UniMind needs isolated database/Auth verification, Preview, and Beta environments without depending on founder computers. Four persistent Supabase projects provide simple separation but exceed the two-project Free allowance. The repository is public, so standard GitHub-hosted runners can execute CI without billed minutes under the current GitHub terms. Supabase CLI can start a complete disposable stack in that runner.

Ahmed approved keeping the infrastructure at zero recurring cost as far as possible and reports receiving Vercel confirmation for Hobby use in the current phase. That confirmation is an eligibility condition, not a permanent exemption from future plan or scope review.

## Decision

Use deterministic mocks for workstation development, a complete ephemeral Supabase stack on standard GitHub-hosted Ubuntu CI runners, and reserve the two persistent Supabase Free projects for separate Preview and locked Beta environments. Repurpose the existing hosted development and CI projects only after ephemeral CI passes and credentials are rotated.

Use separate Vercel Hobby project scopes for Preview and Beta while the reported provider confirmation and noncommercial/free-phase conditions continue to apply. No paid plan, trial, add-on, or billable resource is authorized.

## Alternatives considered

- Keep four persistent Supabase projects: best operational symmetry but requires paid capacity.
- Share Preview and Beta: free but violates the required data, secret, reset, and release boundary.
- Rotate environments through one project: free but makes state and evidence unreliable.
- Replace Supabase: disproportionate architecture and security change.

## Consequences

- CI startup is slower and depends on the GitHub runner's container support, but it is isolated and disposable.
- Developers do not have a persistent database-backed development environment; mocks remain the normal workstation path.
- Preview and Beta stay isolated within the two-project allowance.
- Supabase Free has no automatic backups and may pause inactive projects. Beta remains empty of real data until an encrypted backup/restore procedure is approved and rehearsed or later paid capacity is approved.
- Supabase branching is unavailable and is not part of the plan.
- Vercel eligibility must be reviewed when revenue, payments, advertising, donations, paid contributors, customer work, provider terms, or project scope changes.

## Governing records

- [Decision D-21](../decisions/d-21-hosted-development-test-infrastructure.md)
- [PoC master plan](../plans/poc-master-plan.md)
- [PoC execution runbook](../runbooks/poc-execution-runbook.md)
- [Environment matrix](../../planning/environment-matrix.md)
