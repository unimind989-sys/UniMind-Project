# Decision D-22: Founder authorization and shared service identity

**Status:** APPROVED

**Owner:** Ahmed + Ziad — shared founder authority

**Reviewers:** Ahmed — approval recorded for the shared founder authority

**Decision deadline:** N/A — APPROVED 2026-08-27

**Last reviewed:** 2026-08-27

**Blocks:** NONE — all future tasks and gates must conform

## Context

UniMind is agent-first: coding agents execute repository work and prepare evidence, while Ahmed and Ziad provide human direction and perform unavoidable signed-in actions. The founders intentionally use one shared GitHub, Supabase, and Google service identity and will use shared identities for future services. Ahmed also has a separate GitHub contributor account.

The previous documentation sometimes treated an ordinary reviewer as a separate identity from the requester or signed-in operator. That does not match the founders' operating model. Provider account activity also cannot identify which founder acted because the service identity is shared.

## Non-negotiable requirements

- A named human checkpoint from Ahmed or Ziad remains required for ordinary task completion.
- Every project reviewer role is filled by Ahmed or Ziad; no outside or third reviewer is required. A task may still require one of them to be explicitly named for an academic, security/data, cost, or operations judgment before that decision can pass.
- The same founder may request, authorize, perform signed-in actions for, and review an ordinary agent-executed task.
- Task and evidence records name the founder who supplied the checkpoint; shared provider audit identity is not used as proof of the human's identity.
- RLS, raw deletion, rights, budget kill switches, release/unlock, and beta go-live remain protected gates with separate named confirmations from both Ahmed and Ziad.
- Shared credentials, MFA material, recovery codes, tokens, and secrets remain outside Git, evidence, logs, and chat.

## Options evaluated

| Option | Quality/fit | Security/rights | Reliability | Cost | Migration/lock-in | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Require separate personal accounts and a different ordinary reviewer | Strong platform attribution but conflicts with the founders' chosen workflow | Better per-person audit separation | Adds account and access administration | Usually free, with operational overhead | Moderate process lock-in | Rejected by Ahmed on 2026-08-27 |
| Shared service identity plus named human checkpoints | Matches the agent-first workflow and existing accounts | Provider logs cannot distinguish founders; task/evidence records carry the human attribution | One shared credential set is a common failure domain | Lowest practical account overhead | Low; separate identities can be introduced later | Approved by Ahmed on 2026-08-27 |

## Decision

Use shared founder authority and shared service identities. Agents are the implementation executors. Ahmed or Ziad may supply the human authorization, perform required signed-in operations, inspect evidence, and approve an ordinary gate; these roles do not require different people. All reviewer roles are assigned only to Ahmed or Ziad.

The explicitly protected gates remain two-person decisions. They require two separately recorded human confirmations—one naming Ahmed and one naming Ziad—even when both confirmations occur through the same shared service account or are relayed to an agent.

## Consequences

### Benefits

- Matches how Ahmed and Ziad actually operate and avoids false separate-account prerequisites.
- Keeps humans in the loop without turning ordinary agent work into a second-person staffing dependency.
- Makes agent, human operator, and human checkpoint responsibilities explicit.

### Costs and risks

- Provider and Git account logs cannot prove which founder acted.
- A shared credential compromise can affect both founders at once.
- Per-person revocation and provider-native separation of duties are unavailable.
- Evidence must record the explicitly identified speaker because account identity is insufficient.

## Implementation contract

- Configuration keys: no new committed configuration; all shared credentials remain private.
- Adapter/interface: task records and gate reports name the agent executor and human checkpoint.
- Affected migrations/files: `AGENTS.md`, `CONTEXT.md`, master plan, execution runbook, contributor guide, task/gate templates, environment matrix, and active task records.
- Tests/evaluation required: agent-readiness, isolated handoff, link/name synchronization, secret scan, and the credential-free repository gate.
- Observability required: record the explicitly selected speaker profile and named human checkpoint without credential values.
- Rollback/disable action: supersede D-22 and restore separate account/reviewer requirements before relying on provider-native person attribution.

## Revisit triggers

- A provider requires individual accounts, a security incident involves the shared identity, beta policy requires provider-native separation, or Ahmed and Ziad choose personal identities later.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Ahmed | Shared founder authority | Approved shared service identities and same-founder ordinary human checkpoints; protected gates remain two-person | 2026-08-27 |
