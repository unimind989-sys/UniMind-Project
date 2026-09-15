---
name: finalize
description: Autonomously finalize an already-implemented UniMind change through adaptive verification, protected-main delivery, impact-scoped service checks, production promotion when runtime changed, evidence, and branch cleanup. Use only when the user explicitly invokes $finalize; fresh approval is requested only for real-money exposure.
---

# Finalize

Run this workflow only when the user explicitly invokes `$finalize`. Finish the selected UniMind change across the repository and every service it can actually affect; do not turn finalization into unrelated implementation or a blanket infrastructure audit.

This skill refines, but never replaces, `AGENTS.md`, `docs/agents/agent-workflow.md`, or the active task contract. Read those authorities before acting.

## Authorization boundary

Explicit invocation is Ahmed and Ziad's standing authorization for the selected task's complete non-financial finalization. It covers review, pull-request creation and updates, cross-account GitHub approval, merge, migrations, RLS, grants, raw deletion, rights actions, release/unlock, beta go-live, affected-service changes, production promotion, rollback or containment, evidence, and cleanup when those actions are within the task contract and their technical gates pass. Record the selected chat speaker as the invoker and as the relay of both founders' authorization under D-22; provider account identity is not evidence of who authorized the workflow.

Operate autonomously. Do not pause, ask for approval, or request confirmation for a zero-cost action inside this scope. Use the authenticated accounts, tools, repository state, and service access already available; satisfy provider and branch-protection mechanics directly. Invocation supplies human authorization, but it does not waive tests, exact-target checks, security/privacy rules, dependency order, provider terms, branch protection, or evidence.

The only approval boundary is a real-money action: anything that can charge an account, create a financial obligation, begin a paid or auto-billing trial, provision a billable resource, enable a paid provider call, or raise/re-enable a nonzero spending cap. Before that mutation, present the exact provider, environment, action, currency, maximum authorized amount, and rollback, then obtain fresh explicit Ahmed-and-Ziad confirmation. A verified free-tier operation, a zero-cost test, lowering a cap, or disabling paid work is not a real-money action. When cost cannot be proven zero, treat it as real-money exposure and stop before the mutation.

## 1. Resolve the finalization target

Inspect local and remote Git state, the current diff, active task record, applicable runbook task, open pull requests, and existing evidence. Select only the current task's changes and preserve unrelated user work.

Establish these fixed points:

- task or outcome being finalized;
- base branch and candidate commit or uncommitted change set;
- expected runtime, database, infrastructure, and documentation effects;
- required checks, evidence, rollback, and authorization record;
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
- After merge, promote and verify the public artifact under the invocation's standing authorization.

### R2 — Runtime or integration

Application behavior, API routes, dependencies, build/runtime configuration, CI/CD, environment contracts, or integrations.

- Run the required local gate plus tests at every changed public seam.
- Inspect GitHub and Vercel.
- Inspect Supabase only when the diff or affected end-to-end path depends on it.
- Verify preview and production behavior, configuration identity, and relevant logs.

### R3 — Protected or stateful

Database migrations, grants, RLS, authentication, authorization, storage, durable data, destructive operations, rights, provider budgets, release controls, live providers, or beta/go-live state.

- Apply the runbook's complete relevant database, security, rollback, and service verification.
- Use the invocation's standing Ahmed-and-Ziad authorization for non-financial protected actions.
- Prove allowed and forbidden paths, migration safety, state consistency, and rollback or containment.

When classification is uncertain, use the next higher tier. Service relevance is determined by real dependency paths, not by the service merely existing in the UniMind stack.

## 3. Spend verification proportionally

Before calling a test or service, build a verification map: each changed public seam, acceptance criterion, and material risk must point to one check or exact-match existing result. If a proposed check proves nothing unique, remove it.

The local safety floor applies to every tier:

1. Run every check required by the active task contract and `docs/agents/agent-workflow.md`.
2. Run the narrowest file-type or behavior check that can reject the change early.
3. Review `git diff --check`, `git diff --stat`, and the full diff.
4. Scan changed files for secrets, private data, accidental scope, debug artifacts, and unsafe configuration.
5. Use existing green evidence when its commit, environment, configuration, and scope still match exactly.

For R0 changes, select focused checks by affected contract: skill or skill-metadata changes use the repository skill validator; routing, task-state, or navigation changes use agent readiness; discovery/resume behavior changes use the isolated handoff rehearsal. Run local `pnpm verify` only when the task contract explicitly requires it or the diff can affect executable scripts, package/build inputs, CI, or the gate itself. Required GitHub CI may provide the full merge gate for a stable documentation/skill candidate. Do not inspect Supabase, run rendered browser checks, or promote Vercel for R0.

Once a required check passes, broaden or repeat it only when a relevant diff change, failure, or unresolved risk invalidates that evidence. Do not run a focused command and then a broader command containing the same work unless the broader command is the required final gate. Do not add tests that merely mirror a reversible low-impact change.

Conserve remote calls:

- resolve facts from repository state before querying a service;
- prefer one authoritative CLI, API, or connector read over several dashboard visits;
- use Codex's in-app side browser for internal rendered behavior and signed-in actions unavailable through a safer interface;
- use external Chrome only to present the completed preview, changed route, or UI result to the user;
- batch independent reads and reuse deployment, commit, run, and project identifiers;
- wait on service events or use increasing intervals instead of busy polling;
- query logs once after the relevant deployment, and again only after a failure or changed artifact;
- stop querying once the required evidence is stable and complete.

Rate limiting changes timing, not safety. Back off and resume from known identifiers; never bypass a required check to make progress.

## 4. Deliver through protected GitHub

Use the existing reviewable task branch when valid; otherwise create the runbook-named branch without mixing unrelated work. Commit an outcome-oriented change, push it, and create or update one pull request.

Perform a final technical review, wait for required GitHub checks, address legitimate findings, and satisfy the repository's review rule. Do not bypass branch protection for a small change.

Use both authenticated GitHub accounts through the in-app side browser when the direct GitHub path cannot select the required identity, without returning control to the user:

1. One account creates or owns the pull request.
2. Switch to the other account and submit the formal approving review after inspecting the diff and checks.
3. Return to the author or repository-owner account and merge when every requirement is green.

GitHub does not allow a pull-request author to approve their own pull request. Report the accounts' real roles as author/merger and approving reviewer; never claim that GitHub recorded two approving reviews when it recorded one. If repository rules later require more authenticated reviewers than are available, exhaust task-scoped compliant identities and report an access blocker without asking the user to approve or bypass the rule.

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
4. Record the `$finalize` invocation as Ahmed and Ziad's standing release authorization for that exact commit and deployment.
5. Manually promote the verified artifact to `project-xwrez.vercel.app`.
6. Prove the public domain resolves to that deployment, verify the release/configuration fingerprint, run focused production smoke checks, and inspect relevant error signals.

For R0, do not promote a deployment because the runtime product did not change. For R1-R3, never infer production success from a green build or Ready badge alone.

## 6. Recover without widening scope

When a check fails, keep working: reproduce the failure, identify the cause, repair it within scope, rerun every invalidated check, and reclassify impact. Wait with bounded backoff for external state, preserve the last known identifiers and evidence, and use an exercised rollback or containment action when needed. Make bounded reversible choices from the governing material instead of asking for approval.

Stop only before a real-money action awaiting the confirmation defined above, or when completion is technically impossible because required access is unavailable, an external service remains unavailable after bounded retries, the requested operation is outside the selected task, or no safe compliant path exists. Report those conditions as financial, access, external, scope, or safety blockers—never as missing approval. Never hide, waive, or relabel a failed technical gate.

## 7. Record evidence and clean up

Update the task record and create the sanitized commit-specific evidence required by the runbook. Include commands, results, skipped services with impact-based reasons, the invocation authorization, deployment identity, rollback, and production proof without copying secrets or private payloads.

Only after the merged `main` commit and every affected service are verified:

- switch to `main`, synchronize it to the verified remote merge result, and delete the merged local and remote task branches;
- delete only task-created temporary artifacts and obsolete task branches;
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
- only genuine unresolved limitations or the exact real-money action awaiting confirmation.

Completion means the selected change is merged, its affected services are healthy, runtime changes are promoted and verified, required evidence exists, and task-created state is clean. A commit, open pull request, green CI run, or Ready deployment is only an intermediate state.
