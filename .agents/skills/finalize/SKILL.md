---
name: finalize
description: Finalize an already-implemented UniMind change through adaptive verification, protected-main delivery, impact-scoped service checks, production promotion when runtime changed, evidence, and cleanup. Use only when the user explicitly invokes $finalize.
---

# Finalize

Run this workflow only when the user explicitly invokes `$finalize`. Finish the selected UniMind change across the repository and every service it can actually affect; do not turn finalization into unrelated implementation or a blanket infrastructure audit.

This skill refines, but never replaces, `AGENTS.md`, `docs/agents/agent-workflow.md`, the active task contract, or protected human gates. Read those authorities before acting.

## Authorization boundary

Invocation represents Ahmed and Ziad's ordinary approval to finalize the explicitly scoped task through review, pull request, merge, affected non-protected services, and cleanup. Record the explicitly selected chat speaker as the invoker; provider accounts still do not prove which founder is acting.

This ordinary approval does not cross UniMind's protected gates. Record fresh, separate named confirmations from Ahmed and Ziad before any RLS, raw-deletion, rights, budget-kill-switch, release/unlock, or beta-go-live action. Ask immediately before the first unfulfilled protected mutation, after the exact commit, deployment, migration, and consequences are known. Shared accounts and the general invocation cannot replace that artifact-specific checkpoint.

## 1. Resolve the finalization target

Inspect local and remote Git state, the current diff, active task record, applicable runbook task, open pull requests, and existing evidence. Select only the current task's changes and preserve unrelated user work.

Establish these fixed points:

- task or outcome being finalized;
- base branch and candidate commit or uncommitted change set;
- expected runtime, database, infrastructure, and documentation effects;
- required checks, evidence, rollback, and human checkpoint;
- already-completed CI, review, preview, or service verification that can be reused.

If the implementation is incomplete, finish only defects or omissions within the selected task. A new product choice or unrelated architecture change is a new task, not finalization.

## 2. Classify impact

Assign the highest applicable tier. Reclassify whenever a fix changes the diff.

### R0 — Repository only

Documentation, evidence, planning records, or repository skills with no change to application/runtime inputs, dependencies, CI, deployment configuration, environment contracts, migrations, or service configuration.

- Use the repository's required local documentation or skill checks.
- Use GitHub for protected-main delivery.
- Skip Supabase inspection, Vercel dashboard inspection, browser runtime checks, and production promotion.

### R1 — Isolated presentation

User-visible copy, translation, or styling with no behavior, API, authentication, persistence, dependency, environment, or infrastructure change.

- Run the required local gate and focused rendered check of the affected surface.
- Verify the Vercel preview and the exact changed behavior.
- Skip Supabase unless the rendered path exposes a real Supabase regression.
- After merge, treat public-domain promotion as a protected release.

### R2 — Runtime or integration

Application behavior, API routes, dependencies, build/runtime configuration, CI/CD, environment contracts, or integrations.

- Run the required local gate plus tests at every changed public seam.
- Inspect GitHub and Vercel.
- Inspect Supabase only when the diff or affected end-to-end path depends on it.
- Verify preview and production behavior, configuration identity, and relevant logs.

### R3 — Protected or stateful

Database migrations, grants, RLS, authentication, authorization, storage, durable data, destructive operations, rights, provider budgets, release controls, live providers, or beta/go-live state.

- Apply the runbook's complete relevant database, security, rollback, and service verification.
- Require every applicable named protected confirmation.
- Prove allowed and forbidden paths, migration safety, state consistency, and rollback or containment.

When classification is uncertain, use the next higher tier. Service relevance is determined by real dependency paths, not by the service merely existing in the UniMind stack.

## 3. Spend verification proportionally

The local safety floor applies to every tier and does not consume service rate limits:

1. Run every check required by the active task contract and `docs/agents/agent-workflow.md`.
2. Run the narrowest file-type or behavior check that can reject the change early.
3. Review `git diff --check`, `git diff --stat`, and the full diff.
4. Scan changed files for secrets, private data, accidental scope, debug artifacts, and unsafe configuration.
5. Use existing green evidence when its commit, environment, configuration, and scope still match exactly.

For agent-facing documentation or skill changes, run the repository skill validator, agent-readiness check, and isolated handoff rehearsal. Do not inspect Supabase or promote Vercel for an R0 change.

Conserve remote calls:

- resolve facts from repository state before querying a service;
- prefer one authoritative CLI, API, or connector read over several dashboard visits;
- use the browser only for rendered behavior or signed-in actions unavailable through a safer interface;
- batch independent reads and reuse deployment, commit, run, and project identifiers;
- wait on service events or use increasing intervals instead of busy polling;
- query logs once after the relevant deployment, and again only after a failure or changed artifact;
- stop querying once the required evidence is stable and complete.

Rate limiting changes timing, not safety. Back off and resume from known identifiers; never bypass a required check to make progress.

## 4. Deliver through protected GitHub

Use the existing reviewable task branch when valid; otherwise create the runbook-named branch without mixing unrelated work. Commit an outcome-oriented change, push it, and create or update one pull request.

Perform a final technical review, wait for required GitHub checks, address legitimate findings, and satisfy the repository's review rule. Do not bypass branch protection for a small change.

Use both authenticated GitHub accounts in the normal manual flow:

1. One account creates or owns the pull request.
2. Switch to the other account and submit the formal approving review after inspecting the diff and checks.
3. Return to the author or repository-owner account and merge when every requirement is green.

GitHub does not allow a pull-request author to approve their own pull request. Report the accounts' real roles as author/merger and approving reviewer; never claim that GitHub recorded two approving reviews when it recorded one. If repository rules later require two formal approving reviews, stop until a non-reviewing author identity exists instead of bypassing the rule.

Merge only the reviewed candidate, then fetch and prove that local `main`, remote `main`, and the merge result agree.

GitHub completion requires a merged pull request, green required checks, no relevant unresolved review, and no task-related open or superseded pull request.

## 5. Verify affected services and production

### Supabase

Skip Supabase for R0 and ordinary R1 changes. For R2, inspect it only when a changed dependency or tested user flow reaches Supabase. For R3, verify every affected migration, schema object, grant, RLS policy, Auth behavior, function, trigger, storage rule, and environment using synthetic data and the guarded runbook commands. Never reset or destructively test a shared environment.

### Vercel

UniMind's automatic production-domain assignment is disabled. After a runtime-changing merge:

1. Wait for Vercel to build the merged candidate.
2. Prove the deployment corresponds to the reviewed source and intended environment/configuration.
3. Verify the preview through the changed public seam.
4. Record separate Ahmed and Ziad release confirmations for that exact commit and deployment.
5. Manually promote the verified artifact to `project-xwrez.vercel.app`.
6. Prove the public domain resolves to that deployment, verify the release/configuration fingerprint, run focused production smoke checks, and inspect relevant error signals.

For R0, do not promote a deployment because the runtime product did not change. For R1-R3, never infer production success from a green build or Ready badge alone.

## 6. Recover without widening scope

When a check fails, reproduce the failure, identify the cause, fix it within the selected task, rerun every invalidated check, and reclassify impact. Use bounded retries and preserve the last known identifiers and evidence.

Stop and report the exact blocker when completion requires an unresolved product decision, unavailable access, a paid call or destructive action outside the task's authority, unrelated remediation, or a missing protected confirmation. Never hide, waive, or relabel a failure as unrelated without evidence.

## 7. Record evidence and clean up

Update the task record and create the sanitized commit-specific evidence required by the runbook. Include commands, results, skipped services with impact-based reasons, approvals, deployment identity, rollback, and production proof without copying secrets or private payloads.

After merge and verification:

- delete only merged, obsolete task branches and task-created temporary artifacts;
- close only superseded task pull requests;
- keep unrelated branches, work, data, and service resources intact;
- leave local `main` clean and synchronized with remote `main`.

## Completion report

Lead with `FINALIZED`, `BLOCKED`, or `NOT FINALIZED`, followed by:

- impact tier and why;
- implementation or fixes made during finalization;
- commit, pull request, both GitHub account roles, review, checks, merge, and final `main` identity;
- Supabase status or the precise reason it was skipped;
- Vercel deployment and production status, or the precise reason promotion was skipped;
- production behavior verified when runtime changed;
- evidence and cleanup completed;
- only genuine unresolved limitations or the exact protected action awaiting confirmation.

Completion means the selected change is merged, its affected services are healthy, runtime changes are promoted and verified, required evidence exists, and task-created state is clean. A commit, open pull request, green CI run, or Ready deployment is only an intermediate state.
