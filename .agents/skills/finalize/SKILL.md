---
name: finalize
description: Terminally deliver a stable UniMind runbook candidate through central-policy verification, protected main, affected production proof, evidence, closure, and cleanup. Runs automatically for full-lifecycle selected tasks and remains available through explicit $finalize for manual entry or recovery. Fresh confirmation is requested only for real-money exposure.
---

# Finalize

Run this workflow when a selected runbook task reaches a stable candidate under the default full lifecycle, or when the user explicitly invokes `$finalize` to enter or resume it. Respect an explicit `local only`, `draft only`, `do not merge`, `stop before delivery`, or `prepare for review only` scope. Finish the selected change across the repository and every service it can actually affect; do not turn finalization into unrelated implementation or a blanket infrastructure audit.

This skill refines, but never replaces, `AGENTS.md`, `docs/agents/agent-workflow.md`, or the active task contract. Read those authorities before acting.

## Authorization boundary

The approved D-22 project policy is Ahmed and Ziad's standing authorization for a selected task's complete non-financial lifecycle. It is not founder design acceptance. It covers review, pull-request creation and updates, compliant GitHub review, merge, migrations, RLS, grants, raw deletion, rights actions, release/unlock, beta go-live, affected-service changes, production promotion, rollback or containment, evidence, and cleanup when those actions are within the task contract and their technical gates pass. Record the selected chat speaker and the standing authorization under D-22; provider account identity is not evidence of who authorized the workflow. Explicit `$finalize` is an entry signal, not a stronger authorization class.

Operate autonomously. Do not invent an extra project-approval checkpoint for a zero-cost action inside this scope. Use the authenticated accounts, tools, repository state, and service access already available; satisfy provider and branch-protection mechanics directly. When the host platform itself mandates an action-time confirmation, comply and record it as a runtime/tooling limitation rather than claiming zero-human completion. Invocation supplies human authorization, but it does not waive tests, exact-target checks, security/privacy rules, dependency order, provider terms, branch protection, platform safety controls, or evidence.

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

## 2. Derive the final execution envelope

Run the actual-diff pass through `pnpm agent:route` and the authoritative `docs/agents/agent-execution-policy.yaml`. Supply compact semantic surfaces and every changed path or external mutation. The policy owns surface definitions, risk/planning floors, worker limits, capabilities, verification metadata, evidence invalidation, and activation state; manual model assignments live in the task record under `docs/agents/model-work-blocks.md`.

Compare the result with the intent pass recorded in the task. Widen only for newly changed behavior, paths, or external mutations. Protected classification cannot be downgraded. When classification is uncertain or malformed, use conservative proof. Service relevance follows real dependency paths, not the existence of a service in the stack.

## 3. Spend verification proportionally

Before calling a test or service, build a verification map: each changed public seam, acceptance criterion, and material risk must point to one check or exact-match existing result. If a proposed check proves nothing unique, remove it. Follow the preparation and review sequence in `docs/agents/agent-workflow.md`. Finalization uses the same guarded `pnpm verify` readiness assertion for local broad proof; a complete proof inventory alone is insufficient.

The local safety floor applies to every tier:

1. Run every check required by the active task contract and `docs/agents/agent-workflow.md`.
2. Run the narrowest file-type or behavior check that can reject the change early.
3. Review `git diff --check`, `git diff --stat`, and the full diff.
4. Scan changed files for secrets, private data, accidental scope, debug artifacts, and unsafe configuration.
5. Use existing green evidence when its commit, environment, configuration, and scope still match exactly.

For repository-only changes, select focused checks by affected contract: skill or skill-metadata changes use the repository skill validator; routing, task-state, or navigation changes use agent readiness; discovery/resume behavior changes use the isolated handoff rehearsal. Run local `pnpm verify` only when the task contract or central policy selects it because the diff can affect executable scripts, package/build inputs, CI, or the gate itself. Required GitHub CI may provide the full merge gate for a stable documentation/skill candidate. Do not inspect unaffected services.

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

For running CI, keep the structured wait and evidence-retrieval path. Use a coarse bounded wait or wait for a meaningful status/completion revision; do not repeatedly consume unchanged command output merely because a job is still alive. Preserve exact-head CI and retrieve detailed output after a state change, failure, or completion.

## 4. Deliver through protected GitHub

Use the existing reviewable task branch when valid; otherwise create the runbook-named branch without mixing unrelated work. Commit an outcome-oriented change, push it, and create or update one pull request.

Perform a final technical review, wait for required GitHub checks, address legitimate findings, and satisfy the repository's actual review rule. Keep account separation and reviewer independence as separate facts:

- **Distinct-account approval:** the executing agent switches to an authorized reviewer GitHub identity and submits the approval. This may satisfy GitHub account and branch-protection separation, but record it as executor-controlled distinct-account approval.
- **Independent review:** a separate human or separately executing review agent/process examines the exact candidate. Claim or satisfy this gate only with that separate reviewer provenance.

Do not add a worker or mandatory human review merely to strengthen the label. If the task or protected gate explicitly requires independent review, executor-controlled account switching leaves that gate unsatisfied. Do not bypass branch protection for a small change.

Before opening the side browser for a protected GitHub mutation, probe the authenticated structured GitHub connector and repository-pinned or installed `gh` CLI. Use a structured path only when it can prove the active identity and select the distinct author/reviewer/merger roles without weakening protection. Do not inspect or export tokens, cookies, browser storage, or credentials. Record unavailable authentication, insufficient permissions, or identity-selection limits once and reuse that result until the environment changes.

When structured GitHub and `gh` cannot satisfy the required identity mechanics, use both authenticated GitHub accounts through the in-app side browser:

1. One account creates or owns the pull request.
2. Switch to the other account and submit the formal approving review after inspecting the diff and checks; when the same executing agent controls both steps, record this as distinct-account approval rather than independent review.
3. Return to the author or repository-owner account and merge when every requirement is green.

If the Codex host requires human action-time confirmation for a browser mutation, obtain it at the required moment, resume from the preserved exact-head state, and record the confirmation as an unavoidable platform limitation. It does not count as autonomous zero-human delivery and does not change D-22's project authorization.

GitHub does not allow a pull-request author to approve their own pull request. Report the accounts' real roles as author/merger and approving reviewer; never claim that GitHub recorded two approving reviews when it recorded one. If repository rules later require independent review or more authenticated reviewers than are actually available, exhaust task-scoped compliant provenance and identities, then report an access blocker without asking the user to approve or bypass the rule.

Merge only the reviewed candidate, then fetch and prove that local `main`, remote `main`, and the merge result agree.

GitHub completion requires a merged pull request, green required checks, no relevant unresolved review, and no task-related open or superseded pull request.

## 5. Verify affected services and production

### Supabase

Skip Supabase unless the final envelope or a changed end-to-end dependency reaches its auth, data, or storage surface. For protected Supabase work, verify every affected migration, schema object, grant, RLS policy, Auth behavior, function, trigger, storage rule, and environment using synthetic data and the guarded runbook commands. Never reset or destructively test a shared environment.

### Vercel

UniMind's automatic production-domain assignment is disabled. After a runtime-changing merge:

1. Wait for Vercel to build the merged candidate.
2. Prove the deployment corresponds to the reviewed source and intended environment/configuration.
3. Verify the preview through the changed public seam.
4. Record D-22 standing authorization for that exact commit and deployment; also record `$finalize` when it was the manual/recovery entry point.
5. Before promotion, run the existing deployment-smoke release-fingerprint validation against sanitized facts: reviewed source SHA/tree, expected environment, deployment source identity, public `NEXT_PUBLIC_RELEASE_ID`, required-configuration presence booleans, intended target, and rollback target. Reject any mismatch before mutating the production alias; never print secret values.
6. Manually promote the verified artifact to `project-xwrez.vercel.app`.
7. Prove the public domain resolves to that deployment, rerun the public release/configuration fingerprint and focused production smoke checks, and inspect relevant error signals.

When runtime product state did not change, do not promote a deployment. When it did, never infer production success from a green build or Ready badge alone.

## 6. Recover without widening scope

When a check fails, keep working: reproduce the failure, identify the cause, repair it within scope, rerun every invalidated check, and reclassify impact. Wait with bounded backoff for external state, preserve the last known identifiers and evidence, and use an exercised rollback or containment action when needed. Make bounded reversible choices from the governing material instead of asking for approval.

Stop only before a real-money action awaiting the confirmation defined above, or when completion is technically impossible because required access is unavailable, an external service remains unavailable after bounded retries, the requested operation is outside the selected task, or no safe compliant path exists. Report those conditions as financial, access, external, scope, or safety blockers—never as missing approval. Never hide, waive, or relabel a failed technical gate.

## 7. Record evidence and clean up

Update the task record and create the sanitized commit-specific evidence required by the runbook. Include the policy version and final envelope, commands, reused/invalidated proof, results, skipped services with impact-based reasons, D-22 standing authorization, deployment identity, rollback, and production proof without copying secrets or private payloads.

Only after the merged `main` commit and every affected service are verified:

- switch to `main`, synchronize it to the verified remote merge result, and delete the merged local and remote task branches;
- delete only task-created temporary artifacts and obsolete task branches;
- close only superseded task pull requests;
- keep unrelated branches, work, data, and service resources intact;
- leave local `main` clean and synchronized with remote `main`.

## Completion report

Lead with `FINALIZED`, `BLOCKED`, or `NOT FINALIZED`, followed by:

- final surfaces, risk, planning floor, and manual model work-block status;
- implementation or fixes made during finalization;
- commit, pull request, GitHub account roles, reviewer-process provenance, review requirement/result, checks, merge, and final `main` identity;
- Supabase status or the precise reason it was skipped;
- Vercel deployment and production status, or the precise reason promotion was skipped;
- production behavior verified when runtime changed;
- evidence and cleanup completed;
- only genuine unresolved limitations or the exact real-money action awaiting confirmation.

Completion means the selected change is merged, its affected services are healthy, runtime changes are promoted and verified, required evidence exists, and task-created state is clean. A commit, open pull request, green CI run, or Ready deployment is only an intermediate state.
