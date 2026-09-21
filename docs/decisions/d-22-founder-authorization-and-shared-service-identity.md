# Decision D-22: Founder authorization and autonomous finalization

**Status:** APPROVED

**Owner:** Ahmed + Ziad — shared founder authority

**Reviewers:** Ahmed + Ziad — autonomous-lifecycle revisions relayed by Ahmed

**Decision deadline:** N/A — APPROVED 2026-08-27; REVISED 2026-09-14 and 2026-09-16

**Last reviewed:** 2026-09-16

**Blocks:** NONE — all future tasks and gates must conform

## Context

UniMind is agent-first: coding agents execute repository work and prepare evidence, while Ahmed and Ziad provide human direction and perform unavoidable signed-in actions. The founders intentionally use one shared GitHub, Supabase, and Google service identity and will use shared identities for future services. Ahmed also has a separate GitHub contributor account.

The previous documentation sometimes treated an ordinary reviewer as a separate identity from the requester or signed-in operator. That does not match the founders' operating model. Provider account activity also cannot identify which founder acted because the service identity is shared.

The original protected-gate flow requested artifact-specific approval during `$finalize`. The 2026-09-14 revision made explicit invocation a standing non-financial handoff, but still required a second ceremonial message after routine implementation. WP00-T09 removes that remaining dependency: Ahmed relayed the founders' standing direction that selecting an ordinary runbook task authorizes its complete non-financial lifecycle unless the request narrows scope. `$finalize` remains a manual and recovery entry point. Real-money exposure remains outside standing authorization.

## Non-negotiable requirements

- A selected request names Ahmed or Ziad as the ordinary checkpoint; terminal completion records the evidence-backed result without waiting for a second routine review message.
- Every project reviewer role is filled by Ahmed or Ziad; no outside or third reviewer is required. A task may still require one of them to be explicitly named for an academic, security/data, cost, or operations judgment before that decision can pass.
- The same founder may request, authorize, perform signed-in actions for, and review an ordinary agent-executed task.
- Task and evidence records name the founder who supplied the checkpoint; shared provider audit identity is not used as proof of the human's identity.
- RLS, raw deletion, rights, budget controls, release/unlock, and beta go-live remain protected two-person gates.
- D-22 standing project authorization covers all selected-task protected actions that cannot spend money or create a financial liability. The agent does not request a second approval; explicit `$finalize` records only manual/recovery entry when used.
- A real-money action requires fresh explicit Ahmed-and-Ziad confirmation immediately before the mutation. This includes paid provider calls, billable resources, paid or auto-billing trials, and raising or re-enabling a nonzero spending cap. Lowering a cap or disabling paid work may proceed autonomously.
- Standing authorization never waives technical verification, exact-target checks, privacy/security policy, dependency order, provider terms, branch protection, or evidence.
- Shared credentials, MFA material, recovery codes, tokens, and secrets remain outside Git, evidence, logs, and chat.

## Options evaluated

| Option | Quality/fit | Security/rights | Reliability | Cost | Migration/lock-in | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Require separate personal accounts and a different ordinary reviewer | Strong platform attribution but conflicts with the founders' chosen workflow | Better per-person audit separation | Adds account and access administration | Usually free, with operational overhead | Moderate process lock-in | Rejected by Ahmed on 2026-08-27 |
| Shared service identity plus named human checkpoints | Matches the agent-first workflow and existing accounts | Provider logs cannot distinguish founders; task/evidence records carry the human attribution | One shared credential set is a common failure domain | Lowest practical account overhead | Low; separate identities can be introduced later | Approved by Ahmed on 2026-08-27 |
| Artifact-specific approval prompts during `$finalize` | Strongest last-moment human pause | Preserves direct review but stalls autonomous delivery | Cannot finish while founders are away | No direct cost | High workflow friction | Superseded 2026-09-14 |
| Standing non-financial `$finalize` authorization with a fresh real-money boundary | Matches the intended autonomous handoff while preserving financial control | Technical, security, privacy, and branch-protection gates remain mandatory | Continues through verification, merge, promotion, and cleanup without founder availability | Zero-cost actions continue; financial exposure pauses | Low; revoke by superseding this decision | Approved 2026-09-14 |
| Standing selected-task lifecycle with `$finalize` as manual/recovery entry | Removes the remaining second-message ceremony while preserving explicit opt-outs and the financial boundary | Technical, security, privacy, exact-target, and branch-protection gates remain mandatory | Normal work reaches clean merged state without founder availability | Near-zero orchestration overhead; financial exposure still pauses | Low; revoke or narrow through a superseding decision | Approved 2026-09-16 |

## Decision

Use shared founder authority and shared service identities. Agents are the implementation executors. Ahmed or Ziad may supply the human authorization, perform required signed-in operations, inspect evidence, and approve an ordinary gate; these roles do not require different people. All reviewer roles are assigned only to Ahmed or Ziad.

The explicitly protected gates remain two-person decisions. D-22 is their standing relayed authorization for every non-financial protected action required by a selected runbook task. It attaches only to the final technically verified candidate and affected-service artifacts; it never waives a gate. A request may narrow delivery with `local only`, `draft only`, `do not merge`, `stop before delivery`, or `prepare for review only`. `$finalize` may explicitly enter or resume terminal delivery, but it is not required. Only a real-money mutation needs fresh, action-specific confirmation.

## Consequences

### Benefits

- Matches how Ahmed and Ziad actually operate and avoids false separate-account prerequisites.
- Keeps humans in the loop without turning ordinary agent work into a second-person staffing dependency.
- Makes agent, human operator, and human checkpoint responsibilities explicit.
- Lets a selected runbook task reach merged, verified, clean `main` while both founders are away.

### Costs and risks

- Provider and Git account logs cannot prove which founder acted.
- A shared credential compromise can affect both founders at once.
- Per-person revocation and provider-native separation of duties are unavailable.
- Evidence must record the explicitly identified speaker because account identity is insufficient.
- A broad standing authorization increases the importance of task scoping, exact-target checks, and technical rollback evidence.

## Implementation contract

- Configuration keys: no new committed configuration; all shared credentials remain private.
- Adapter/interface: task records and gate reports name the agent executor, selected speaker/checkpoint, D-22 standing authorization, and `$finalize` only when it was the manual/recovery entry.
- Affected migrations/files: `AGENTS.md`, `CONTEXT.md`, master plan, execution runbook, contributor guide, task/gate templates, environment matrix, and active task records.
- Tests/evaluation required: agent-readiness, isolated handoff, link/name synchronization, secret scan, and the credential-free repository gate.
- Observability required: record the explicitly selected speaker profile, named checkpoint, policy version, final execution envelope, and whether `$finalize` was used as an entry point, without credential values.
- Rollback/disable action: supersede D-22 to restore artifact-specific protected-gate prompts or separate account/reviewer requirements.

## Revisit triggers

- A provider requires individual accounts, a security incident involves the shared identity, beta policy requires provider-native separation, or Ahmed and Ziad choose personal identities later.
- Terminal finalization crosses its task boundary, proceeds after a failed technical gate, misclassifies a potentially billable action as zero-cost, ignores an explicit delivery opt-out, or cannot reliably clean merged branch state.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Ahmed | Shared founder authority | Approved shared service identities and same-founder ordinary human checkpoints; protected gates remain two-person | 2026-08-27 |
| Ahmed | Autonomous-finalization authority | Approved explicit `$finalize` as both founders' standing authorization for selected-task non-financial delivery; fresh confirmation remains required for real-money actions | 2026-09-14 |
| Ziad | Autonomous-finalization authority | Approved the same revision; confirmation relayed by Ahmed in the authorizing request | 2026-09-14 |
| Ahmed | Autonomous-lifecycle authority | Approved selected-task non-financial completion by default and retained `$finalize` as manual/recovery entry; relayed the standing Ahmed-and-Ziad direction in WP00-T09 | 2026-09-16 |
| Ziad | Autonomous-lifecycle authority | Approved the same standing direction; confirmation relayed by Ahmed in the WP00-T09 authorizing request | 2026-09-16 |
