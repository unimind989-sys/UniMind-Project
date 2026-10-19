# UniMind PoC: Detailed Execution Runbook

**Companion to:** [UniMind PoC master plan](../plans/poc-master-plan.md)

**Owners:** Ahmed and Ziad

**Last updated:** 19 October 2026

**Runbook revision:** 3.0 — every master-plan deliverable has an ordered, executable task ([revision findings](../reviews/runbook-revision-2026-10/findings.md))

**Rule:** Complete work in document order, respect each task's dependencies and decision gates, and attach the listed proof before marking a task or package complete.

## 0. How to execute this runbook

This document is the build plan and the release checklist. The master plan says what UniMind must be; this runbook says in which order to build it and how each step is accepted. The [agent workflow](../agents/workflow.md) says how one task is executed and delivered. A task record under `planning/tasks/` holds the working state of one task. When these sources disagree, the higher authority in `AGENTS.md` wins; say so instead of choosing silently.

A package is complete only when every task in it is `[x]`, its gate passed on an exact commit, and the gate evidence is linked. Code that exists or a screen that looks right is not completion.

### 0.1 Status legend

- `[ ]` not started.
- `[~]` in progress; the task record names the owner and branch.
- `[?]` blocked; the same line names the decision or founder input that unblocks it.
- `[x]` done and proven.
- `[!]` failed gate or release blocker; link the defect.

`pnpm agent:status` derives a task's state from its checkboxes: any `[!]` means failed, any `[?]` means blocked, all `[x]` means done, all `[ ]` means not started, anything else means in progress. Never turn `[ ]` directly into `[x]`: mark `[~]` when claiming a task and `[x]` only after its delivery boundary is proven.

A task that cannot start until a decision owned elsewhere is approved carries that gate as a `[?]` line at the top, so it reads as blocked instead of executable; when the decision is approved, the line becomes `[x]` with the decision link. A task that is itself a decision's resolution path (see the [decision register](../../planning/decision-register.md)) is not blocked by that decision: the agent prepares the options and evidence as ordinary steps and turns the approval step into `[?]` only when it reaches it.

**Selecting a task** (used by the workflow's Pick step):

1. Continue the earliest `[~]` task whose owner is available.
2. Otherwise take the earliest `[ ]` task in document order whose `Depends on` tasks are all `[x]` and which has no `[?]` line. Document order is the execution order. Task IDs are stable labels: they are never renumbered, and a new task takes the next free number in its package.
3. Never cross a blocked task. A task that depends on a `[?]` task is not executable either. Advance an executable prerequisite instead, or pick the earliest task that does not depend on the blocker.
4. A user-named outcome maps to exactly one task. If none fits, add the task to this runbook first.

**Bridges for open decisions:** WP01 onward use synthetic fixtures and deterministic mocks, so the open WP00 decision tasks do not block them. Each open decision blocks only the consumers named in the [decision register](../../planning/decision-register.md), and only for the real choice (real data, a real provider, real money).

### 0.2 Agent execution and human checkpoints

Coding agents execute tasks end to end through the [agent workflow](../agents/workflow.md). The selected Ahmed-or-Ziad speaker is the ordinary checkpoint; routine technical completion does not wait for a second message. Founders resolve product, academic, security/data and rights decisions that repository authority cannot decide, and perform unavoidable signed-in actions; record such a human operator separately.

Ahmed and Ziad share service identities (Ahmed's separate GitHub account is the current exception), so never infer the acting founder from a provider account; record the explicitly selected speaker. D-22 is both founders' standing authorization for every selected-task action that cannot spend money or create a financial liability. Paid calls, billable resources, paid or auto-billing trials, and nonzero cap increases or re-enablement require fresh explicit Ahmed-and-Ziad confirmation immediately before the financial mutation, naming the exact exposure.

### 0.3 Task format

Every open task uses this shape. Completed tasks keep their heading, one checked line and links to their record and evidence; their delivery history lives in the task record, the evidence file and git.

```text
#### WPNN-TNN — Imperative outcome title

**Depends on:** task IDs. **Decision gates:** D-xx or none. **Protected:** none, or the protected paths. **Material UI:** no, or the surfaces. **Real money:** no, or the exposure.

**Outputs:** files, migrations, routes, reports or decisions.

- [?] Decision gate line, one per gate (removed or checked when approved).
- [ ] Ordered steps; each is one reviewable slice.

**Verify:** commands or test suites.

**Pass:** the observable result, with the master plan's numbers where it has them.
```

- **Protected** means a protected path from `AGENTS.md` (auth and authorization, RLS and migrations, storage, CI workflows, production configuration). It needs a written plan before editing, an independent review of the exact diff before merge and a recorded rollback (workflow §2 and §5). D-22 protected actions (rights, raw deletion, release/unlock, beta) proceed only after their technical gate passes.
- **Material UI** means a visible presentation or interaction change to an approved surface. The founder approves the rendered candidate, recorded as `Approved commit:` in the task record.
- **Real money** means the D-22 stop applies: fresh two-founder confirmation immediately before the financial mutation.
- Values a step needs but this runbook cannot fix yet are listed in §2.3 with the task or decision that sets them.

### 0.4 Definition of ready

Do not start a task until all applicable statements are true:

- [ ] Its `Depends on` tasks are complete and it has no open `[?]` gate.
- [ ] The expected output is named as a file, migration, route, report, deployment or decision record.
- [ ] Required inputs and fixtures exist and contain no unapproved private data.
- [ ] Every §2.3 value the task needs is set, or the task uses its documented synthetic default and does not claim the real gate.
- [ ] The executor knows which paid calls, destructive actions, migrations or external releases are prohibited.
- [ ] The verification command and passing result are known.
- [ ] The rollback or disable action is known for any shared-environment change.

### 0.5 Definition of done

A task may be marked complete only when all applicable statements are true:

- [ ] The implementation is committed on a reviewable branch with no unrelated changes.
- [ ] Lint, type checking, relevant unit/integration/security tests and the production build pass (`pnpm verify`).
- [ ] When database behaviour is affected, migrations reset the disposable CI Supabase stack from empty and upgrade a populated synthetic fixture; Preview and Beta are never destructive-test targets.
- [ ] Authorization was tested as an allowed role and at least one forbidden role.
- [ ] Retryable work was replayed with the same idempotency key and created no duplicate state or charge.
- [ ] Logs contain the correlation ID and safe diagnostics, but no secret, raw private content or ordinary chat content.
- [ ] Documentation, environment schema, fixtures and generated database types were updated where affected.
- [ ] The PR maps each acceptance criterion to its proof; a gate report exists in `evidence/` when external or production proof was required.
- [ ] Required CI is green on the exact head, and any genuine product or academic judgment has its named founder decision.

### 0.6 Evidence storage and naming

Store durable proof in the repository when it contains no secret or private data. Store sensitive exports in the approved restricted evidence store and commit only a redacted index. Evidence folders: `evidence/wp00-pilot/`, `wp01-foundation/`, `wp02-database/`, `wp03-product-shell/`, `wp04-ingestion/`, `wp05-retrieval/`, `wp06-chat/`, `wp07-studio/`, `wp08-operations/`, `wp09-load-cost/`, `wp10-veterinary/`, `wp11-beta/` and `wp12-extensions/`.

Name a bundle `YYYY-MM-DD_<gate>_<environment>_<short-sha>.md`. Each bundle contains:

1. Scope and exact acceptance criteria.
2. Commit SHA and migration list.
3. Environment and non-secret configuration fingerprint.
4. Commands executed and their exit codes.
5. Summary metrics and links to raw machine-readable reports.
6. Failures, deviations and linked defects.
7. Agent executor, selected speaker/checkpoint, review provenance and D-22 standing authorization.
8. Rollback/disable instruction.

Never commit `.env*`, access tokens, private raw files, student exports, full chat transcripts, provider request payloads containing source content or unredacted production logs.

### 0.7 Approved baseline and open decisions

The baseline below is approved by the master plan:

| Area | Locked direction |
| --- | --- |
| Web | Next.js App Router, TypeScript, React Server Components by default. Read `node_modules/next/dist/docs/` before using a Next.js API; this version differs from older tutorials. |
| Mutations | Server Actions for ordinary authenticated mutations; Route Handlers for streaming, uploads, provider callbacks and webhooks. |
| Runtime | Node.js, not Edge, for provider SDKs, streaming and processing unless a measured route proves Edge-compatible. |
| Database/Auth | Supabase Auth and PostgreSQL with RLS and explicit grants. |
| Retrieval | PostgreSQL full-text search plus pgvector behind one server-authorized retrieval function and adapter. |
| Business state | PostgreSQL is authoritative for jobs, reservations, budgets, release state, provenance and audit. |
| Storage | Private temporary-raw and durable-processed namespaces behind an adapter. |
| Processing | Independently deployable durable workers with leases, heartbeats, retries and reconciliation. |
| Environments (D-21) | Workstations run the Next.js development process and deterministic mocks only. Database/Auth tests run on a disposable Supabase stack in GitHub Actions. Two persistent Supabase Free projects host synthetic Preview and locked Beta, each with its own Vercel Hobby project scope. No shared component runs on a founder computer. |
| AI boundary | Approved uploaded material only; no web-search or outside-answer branch. |
| Beta | Free controlled beta; no payment receipt or manual payment workflow. |

Open decisions keep a safe placeholder until approved. Status lives in the [master-plan decision log](../plans/poc-master-plan.md#15-decision-log); the [decision register](../../planning/decision-register.md) names owners and every blocked task.

| Decision | Placeholder until approved | Resolved in | First task it blocks |
| --- | --- | --- | --- |
| D-02 Veterinary cohort | Synthetic Veterinary catalog fixtures | WP00-T02 | WP10-T01 |
| D-04 AI providers | Deterministic mocks; `vector(3)` embedding placeholder | WP04-T14 | WP04-T15 |
| D-05 Maximum spend | Every paid flag false; zero caps | WP00-T06 | WP04-T14 |
| D-08 Chat retention and misuse review | Short synthetic retention values; misuse detection disabled | WP06-T07 (record proposed; founders approve) | WP06-T07 |
| D-10 Processed format | Proposed contract used only in documents | WP00-T04 | WP04-T01 |
| D-17 Queue and worker host | Database job table plus in-process test dispatcher | WP04-T17 | WP04-T19 |
| D-18 Object storage provider | Filesystem/in-memory adapter, synthetic data only | WP04-T16 | WP04-T19 |
| D-19 Retention periods and deadlines | Short synthetic-test values | WP00-T04 | WP04-T16 |
| D-20 Notification and incident channels | In-process deterministic test sink | WP08-T05 | WP08-T07 |
| D-24 Batch Leader one-time upload links | Account-based Batch Leader screens stay as built and are not extended | Ziad's confirmation | WP03-T36 |
| D-25 Student cohort membership | Memberships exist only in synthetic seed data; no real student gains access | WP03-T35 | WP11-T02 |
| D-26 Transactional email delivery | Supabase built-in sender for synthetic Preview only | WP08-T05 | WP11-T01 |

Do not hide one of these choices inside source code. Close it with `docs/templates/decision-record.md`, update the master-plan decision log and the register, and record the configuration key the adapter reads.

### 0.8 Platform facts to recheck

Recheck these on the day a task depends on them; record what you found in the task's evidence.

- Node.js 24 LTS is pinned in `.nvmrc` and `package.json#engines`; pnpm is pinned in `packageManager`.
- The Supabase CLI is a pinned development dependency invoked as `pnpm supabase`. D-21 prohibits workstation database infrastructure; the disposable stack runs only on a standard GitHub-hosted Ubuntu runner.
- New `public` tables are not always exposed to the Data API automatically. RLS and SQL `GRANT` are separate requirements; test both.
- Do not pin a version in `CREATE EXTENSION`; record the installed version in evidence instead.
- Use `@supabase/ssr` for cookie sessions. A publishable key may be public; secret and service-role keys are server-only.
- Prefer HNSW for the first pgvector index, benchmark it against exact search, and match the operator class to the query distance operator.
- Supabase database backups do not include Storage objects. Processed objects need their own durability and restore proof.
- Supabase Free projects have no automatic backups, pause after a period of inactivity, and have fixed database size, storage, egress and monthly-active-user allowances. Read the current numbers on the Supabase pricing page before WP04-T15 and WP09-T02.
- Supabase's built-in Auth email sender is meant for testing and has a low hourly limit. Real student onboarding needs a custom SMTP sender (D-26).
- Vercel Hobby use is conditional (D-21): revenue, payments, advertising, paid contributors or another commercial scope change triggers review before further deployment.

References: [Node.js releases](https://nodejs.org/en/about/previous-releases), [Supabase CLI](https://supabase.com/docs/reference/cli/introduction), [Supabase migrations](https://supabase.com/docs/guides/deployment/database-migrations), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase server packages](https://supabase.com/docs/guides/auth/choosing-a-server-package), [Supabase vector indexes](https://supabase.com/docs/guides/ai/vector-indexes), [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Supabase pricing](https://supabase.com/pricing), [Supabase breaking changes](https://supabase.com/changelog?types=breaking-change).

### 0.9 Workstation preflight (Windows/PowerShell)

Run from the repository root:

```powershell
git --version
node --version
corepack --version
corepack pnpm --version
git status --short
```

Node must match `.nvmrc` and pnpm must match `packageManager`. `git status --short` is empty or every existing change has a known owner outside the intended work. Install dependencies with `corepack pnpm install --frozen-lockfile`; never run `npm install`.

Workstations need no database, Docker, WSL2 or other local infrastructure. Database and Auth behaviour is proven by the CI `database-ci` job; for earlier feedback push the branch and dispatch CI with `database_feedback=true`. The retired hosted commands (`pnpm db:reset`, `db:migrations`, `db:push:dry-run`, `db:types`, `test:integration:hosted`) have no approved target; do not run them.

### 0.10 Delivery loop, task records and package gates

Follow the [agent workflow](../agents/workflow.md) for branches, slices, checks, review and delivery. Runbook-specific additions:

- `pnpm verify` stays credential-free, mock-only and zero paid-provider cost, and matches CI. Reuse exact-commit CI evidence instead of rerunning overlapping proof.
- Never repair Preview or Beta by hand after merge; add a migration or configuration change and redeploy through [environment promotion](environment-promotion.md).
- Every task uses [the task-record template](../templates/task-record.md) at `planning/tasks/wpNN-tyy-short-outcome.md`, at or under 120 lines, holding current state only.
- An issue titled only "set up database", "build RAG" or "finish admin" is not executable; decompose it into tasks first.

At the end of every package, run its gate:

1. Freeze the candidate commit SHA.
2. Deploy or reset the package's target environment from version control.
3. Run the package gate from a clean state.
4. Run at least one forbidden path and one retry/recovery path.
5. Compare measured results with the numeric thresholds; "looks good" is not a result.
6. Record every deviation as a defect, risk acceptance or decision. Release blockers cannot be waived informally.
7. Record `PASS`, `FAIL` or `CONDITIONAL PASS`. A genuine product or academic judgment names the deciding founder. A protected non-financial gate records D-22; a real-money mutation requires fresh decisions from Ahmed and Ziad.
8. Mark the gate task `[x]` only after `PASS`. A conditional pass never unlocks a later task that needs the missing behaviour.

### 0.11 Real-data and money boundaries

These first-time events are the riskiest steps of the PoC. Each happens once, in the named task, and only when every listed condition holds.

| First event | Required before it happens | Task |
| --- | --- | --- |
| First paid provider call | D-05 caps approved; WP04-T13 budget guard live; fresh two-founder confirmation naming the maximum spend | WP04-T14 |
| First paid plan, add-on or billable resource (database tier, storage, worker host, email sender) | Fresh two-founder confirmation naming the plan and monthly exposure | WP04-T15 to WP04-T18, WP08-T05 |
| First real private source in any environment | WP04-T19 real-data readiness gate passed | WP04-T20 |
| First real raw deletion | WP04-T09 proven on synthetic data; D-19 values approved; WP04-T19 passed | WP04-T20 |
| First real student account with cohort access | WP11-T01 go decision | WP11-T03 |

Preview never holds real data. Beta holds real sources only after WP04-T19 and real students only after WP11-T01.

### 0.12 Global rollback hierarchy

Use the least destructive safe control first:

1. Disable the affected provider, artifact type, source version, cohort release or feature flag.
2. Stop new job claims while preserving queued records.
3. Roll back the stateless web/worker deployment to the last known-good build.
4. Apply a forward database repair migration. Do not use destructive rollback on a shared database without an exercised plan.
5. Restore into an isolated environment, verify, and only then perform a production restore when required.

Never delete audit, provenance, job-attempt, raw-deletion, provider-cost or usage-ledger evidence to make a retry "clean". Corrections are new append-only events.

## 1. Implementation rules

1. Treat the PoC as the first production release. Do not create disposable architecture, local-only business processes or data models that must be replaced to scale.
2. Use versioned migrations for every database, policy, function, trigger, index and seed change. Never repair shared environments manually without adding the equivalent migration.
3. Enforce authorization in PostgreSQL Row Level Security and server-side services. Hiding a button is not authorization.
4. Add RLS to every exposed table. Write policies to explicit roles such as `TO authenticated`, include ownership/membership predicates, and use both `USING` and `WITH CHECK` for updates.
5. Keep service-role keys, provider keys, storage credentials, webhook secrets and private source objects on the server or worker only.
6. Make accepted work durable before returning success. Long processing is a durable job and never depends on a browser tab or a short web request.
7. Make every worker step idempotent. Retries must not duplicate source versions, processed documents, segments, embeddings, artifacts, usage entries or provider charges.
8. Use one unified source pool per authorized cohort and curriculum unit. Source format and professor-hint status are metadata, not separate knowledge modes.
9. Generate factual content only from the evidence packet retrieved from uploaded approved material. Do not implement web search or any outside-answer fallback.
10. When evidence is missing, return the unavailable-information contract. When it conflicts, show each supported position.
11. Preserve internal evidence provenance for every accepted chat answer and Studio artifact. Page/timestamp display is optional when a reliable locator exists.
12. Treat academic medical and veterinary cases as normal educational questions. Apply the real-patient boundary only when context indicates an actual patient or an urgent personal care request.
13. Delete raw PDF/audio files only after verified durable processed output exists. Verify deletion and append an audit event.
14. Run routine processing, retries, reconciliation, metering and alerts automatically. Ahmed and Ziad make governance and exception decisions, not routine pipeline steps.
15. Use mocks and fixtures during normal development. Turn on paid providers only for approved benchmarks, ingestion and end-to-end evaluation, through the WP04-T13 budget guard.
16. Attach a correlation ID to each request, job, provider call, answer and artifact. Record provider/model version, units, latency, attempt count, result and cost.
17. Do not mark a package complete from screenshots alone. Required tests, reports, migrations and job/audit evidence must exist.
18. Change control: a change to retrieval, chunking, embedding, prompt, policy, model, validator or processing configuration reaches Beta only after the frozen regression suites for the affected stage pass on the exact commit (master plan §7.2 step 10).
19. Product questions found during a task become an open decision or a founder question in the task record. Never answer them inside code.

## 2. Delivery order

### 2.1 Packages

| Order | Package | Depends on | Completion result | State |
| --- | --- | --- | --- | --- |
| 0 | Pilot decision pack | None | Cohorts, rights, sources, budgets, load profile and evaluation sets, or explicit blockers | Workflow tasks done; decision tasks wait for founders |
| 1 | Repository and environments | WP00 mock-only constraints | Repeatable app, migrations, CI, Preview, Beta and mock providers | Done |
| 2 | Database and authorization | Package 1 | Generic catalog, access, content, RAG, Studio, usage and RLS foundation | Done |
| 3 | Product shell and governance controls | Package 2 | Role journeys on synthetic services; catalog, membership and campaign governance | Shell done; governance tasks T34–T36 open |
| 4 | Automated source pipeline and real-data readiness | Packages 1–3 | Synthetic pipeline proven; providers, storage, worker host and backup chosen; Cohort A corpus READY | Open |
| 5 | Retrieval evaluation | Package 4 | Authorized hybrid retrieval meets leakage and evidence targets before chat | Open |
| 6 | Strict-RAG subject chat | Package 5 | Grounded, partial, unavailable, conflict, hint and educational-case behaviour in the real Chat screen | Open |
| 7 | Studio and quiz | Package 6 | Grounded artifacts and the quiz loop in the real Studio and Quiz screens | Open |
| 8 | Operations and automation | Packages 4–7 | Topology, metrics, reconciliation, dashboards, alerts, restore, incidents, security review, success signals | Open |
| 9 | Cost and 100-student validation | Packages 1–8 | The minimum-cost configuration passes the defined workload | Open |
| 10 | Veterinary validation | Packages 4–9 | The second program passes the same gates through configuration only | Open |
| 11 | Private beta | Packages 0–10 | Up to 100 verified students in reviewed waves | Open |
| 12 | Post-PoC preparation | PoC acceptance (WP11-T05) | Payments and video stay extensions behind existing contracts | Open |

Do not start Studio generation before retrieval and strict-RAG contracts pass. Do not invite students before fault recovery, quotas, kill switches, restore and the security review pass.

### 2.2 Critical path

The shortest honest route from today to the beta, with what each step needs from the founders (see §17):

1. **Governance loop** — WP03-T34 (catalog), WP03-T35 (membership, needs D-25), WP03-T36 (campaigns and Batch Leader access, needs D-24).
2. **Synthetic pipeline** — WP04-T01 to WP04-T12 (needs D-10 approved).
3. **Real-data readiness** — WP04-T13 to WP04-T19 (needs D-05, D-04, D-18, D-19, D-17, a restore target, rights-cleared samples).
4. **Cohort A corpus READY** — WP04-T20 (needs WP00-T03 sources and a Batch Leader).
5. **Retrieval baseline** — WP05 (needs the WP00-T20 academic suite).
6. **Grounded chat** — WP06 (needs D-08).
7. **Studio and quiz** — WP07.
8. **Unattended operation** — WP08 (needs D-20, D-26).
9. **Load and cost** — WP09.
10. **Veterinary** — WP10 (needs D-02).
11. **Beta** — WP11.

### 2.3 Values to set

These values appear in later tasks but cannot be fixed by this runbook. Until the setter approves a value, tests use the synthetic default and no task claims the real gate.

| Value | Used by | Set by | Synthetic default until then |
| --- | --- | --- | --- |
| Raw retention period, `delete_after` start event, retry interval, overdue severity | WP04-T09, WP04-T11 | D-19 through WP00-T04 | [Raw-data policy](../policies/raw-data-lifecycle.md) synthetic values |
| Processed-output acceptance: page/audio coverage, non-empty threshold, duplicate ratio, terminology sample rule | WP04-T08 | D-10 through WP00-T04 | Fixture-exact values from WP04-T01 |
| Audio duration accounting tolerance | WP04-T06, WP04-T08 | D-10 | Fixture-exact |
| OCR page triggers (text density, replacement characters, layout anomalies) | WP04-T05 | WP04-T05 measurement, recorded in config | Fixture-derived |
| Per-source limits: bytes, pages, audio duration | WP04-T03, WP03-T36 | WP00-T04 and WP00-T06 | Environment-schema bounds from WP01-T03 |
| Maximum preflight cost per source and per action | WP04-T13 | D-05 | Zero |
| Budget caps: total, weekly, per provider/action, per source; alert recipients | WP04-T13, WP08-T05 | D-05 through WP00-T06 | Zero; in-process sink |
| Lease length, heartbeat interval, maximum attempts, backoff base and cap | WP04-T02 | WP04-T02 engineering choice, recorded in config | Short test values |
| Chunk size range and overlap | WP04-T10 | WP04-T10 initial, WP05-T06 tuned | Fixture values |
| Embedding model, dimensions, distance operator | WP04-T15 | D-04 through WP04-T14 | `vector(3)` mock |
| Retrieval `k`, fusion weights, per-source diversity cap | WP05-T03 | WP05-T06 baseline | Versioned default config |
| Retrieval quality targets (recall@k, MRR) and latency budget | WP05-T06 | WP05-T06 reviewer approval; latency derived from the chat first-token target | No gate claimed |
| Conflict-detection method and threshold | WP05-T04 | WP05-T04 (ADR) | Annotated conflicts only |
| Evidence packet limits (segments, tokens) | WP06-T04 | WP06-T04 with WP04-T14 cost data | Mock values |
| Message length, output tokens, request timeout | WP06-T02, WP07-T02 | WP00-T06 | Environment-schema bounds |
| Per-student daily allowance, rate and concurrency limits | WP06-T02, WP07-T02 | WP00-T06 with D-05 | Synthetic values |
| Claim-validator acceptance rule | WP06-T06 | WP06-T01 ADR measurement | None; no grounding gate claimed |
| No-save technical window, saved-chat retention, reported-content review window | WP06-T07 | D-08 and D-19 | Short synthetic values |
| Misuse-detection categories and thresholds | WP06-T07 | D-08 | Disabled |
| Quiz options per MCQ, timer rules, attempt expiry, item counts and difficulty levels | WP07-T01, WP07-T04 | WP07-T01 contract; founder confirms visible behaviour | Current fixture behaviour |
| Artifact size limits (items, depth) | WP07-T02 | WP00-T06 cost and WP07-T01 | Fixture values |
| Academic review sample size and rubric | WP04-T20, WP06-T08, WP07-T06 | WP00-T20 with the academic reviewer | None |
| Reconciliation intervals | WP08-T03 | §11.2 defaults, tuned in WP09 | §11.2 |
| Alert thresholds: queue age, error rate, database/storage capacity | WP08-T05 | WP08-T05, revised from WP09 measurements | Test values |
| Unattended observation window | WP08-T08 | WP08-T08, founder-approved | None |
| Success-signal definitions ("meaningful session", trust rating) | WP08-T10, WP11-T05 | WP08-T10 with the founders | None |
| Load profile, success and abort thresholds | WP09 | WP00-T07 ([load profile](../../planning/load-profile-100-students.yaml)) | Profile values |
| Beta wave sizes, observation windows, abort thresholds | WP11-T03 | WP11-T01 | §14.1 sizes |

## 3. Work package 0: Pilot decision pack

**Outcome:** every real-data, provider, budget, retention, academic and load assumption that later packages need is either approved or explicitly blocked. This package produces decisions, policies and evaluation data; it calls no paid provider and processes no real private content.

**Primary artifacts:** `docs/decisions/`, `docs/policies/`, `planning/`, `evals/datasets/` and `evidence/wp00-pilot/`.

### 3.0 Tasks

#### WP00-T00 — Establish agent-first delivery controls

- [x] Agent-first workflow, task-record template, naming rules, readiness check and work-state command established and rehearsed from a clean snapshot; Ahmed approved on 2026-09-15. Record: [wp00-t00](../../planning/tasks/wp00-t00-agent-first-delivery-controls.md). Evidence: [agent readiness](../../evidence/wp00-pilot/2026-09-16_agent-readiness_local_5fd79cc.md). The workflow itself was later replaced by WP00-T18.

#### WP00-T01 — Create the planning workspace

**Needs from founders:** owner deadlines for every open decision, and the names of the review roles below. Everything else is staged.

- [~] Create `docs/decisions`, `docs/policies`, `planning/tasks`, `evals/datasets/tutor`, `evals/datasets/studio` and `evidence/wp00-pilot` with scoped `README.md` files where Git needs a durable directory entry.
- [~] Stage the controlled inputs: cohort candidates (WP00-T02), source-rights inventory (WP00-T03), raw-data policy (WP00-T04), provider benchmark (WP00-T06, WP04-T14), load profile (WP00-T07), decision records and the gate report, each copied from `docs/templates/` with placeholders kept until the owning task supplies reviewed values.
- [~] Create `planning/decision-register.md` with `ID`, `decision`, `owner`, `due`, `status`, `record`, `resolution path`, `blocks` and `last reviewed`. A decision's resolution task may proceed and is never in its own blocked list.
- [~] Copy D-01 to D-16 from the master plan; keep approved directions approved.
- [~] Add the unresolved choices from §0.7 as D-17 onward and keep the master-plan decision log in sync.
- [~] Verify every `Open` or `Proposed` decision names the exact tasks it blocks, including when only the real-data or paid-adapter portion is blocked.
- [?] Obtain owner deadlines and a founder checkpoint; unresolved due dates stay explicit rather than invented. OWNER INPUT REQUIRED.
- [?] Name, from Ahmed and Ziad, the holder of each review role: security/data, academic reviewer per cohort, cost and operations. D-10, D-18 and D-19 cannot be approved until the security/data role is named. OWNER INPUT REQUIRED.

**Pass:** one register shows every open decision, its owner, deadline, role holder and blocked work.

**Evidence:** `evidence/wp00-pilot/<date>_decision-register_local_<sha>.md`. Record: [wp00-t01](../../planning/tasks/wp00-t01-create-planning-workspace.md).

#### WP00-T02 — Select cohorts using evidence, not preference

**Needs from founders:** candidate facts for each Veterinary cohort (D-02), independent scores, Batch Leader and academic reviewer per cohort.

- [~] Create `planning/cohort-candidates.csv` (UTF-8, stable candidate IDs such as `HM-C01` and `VM-C01`); the header and ID contract are ready for review.
- [?] Enter every candidate cohort before scoring; the decision owners have not supplied candidate facts.
- [~] Score each dimension 0–5 using the anchors in `planning/cohort-selection-review.md`; the scoring contract is ready for review.
- [?] Add a `score_evidence` link for every 4 or 5 and a `remediation` note for every 0–2; no candidate rows exist yet.
- [?] Have Ahmed and Ziad score independently, then reconcile differences of two or more points in a recorded review.
- [?] Reject a cohort regardless of score if provider-processing or student-use rights are denied, no accountable academic reviewer exists, or complete-enough source material is unavailable.
- [~] Keep `docs/decisions/d-01-human-medicine-cohort.md`, `d-02-veterinary-medicine-cohort.md` and `d-03-pilot-institutions.md` current. D-01 and D-03 are approved directions; D-02 stays open.
- [?] Assign stable catalog codes for institution, program, level, term, cohort, curriculum edition and every unit after selection: ASCII `lower_snake_case`; labels may be Arabic or English. WP03-T34 enters them through admin actions.
- [?] Obtain owner and review sign-off.

**Pass:** each selected cohort has a reproducible score, the §3.1 fields, an ordered unit list, a named Batch Leader, a named academic reviewer and no blocking right. Record: [wp00-t02](../../planning/tasks/wp00-t02-select-pilot-cohorts.md).

#### WP00-T03 — Inventory sources and prove rights

**Needs from founders:** the real expected source list for Cohort A (and later Cohort B), permission evidence for each source, and a security/data review.

- [~] `planning/source-rights-inventory.csv` is staged from the template (WP00-T01); one row is one expected source, not a folder or an informal collection.
- [?] Enter every expected source with an opaque ID such as `SRC-HM-0001` and the §3.2 fields; keep personal names out of IDs and filenames. OWNER INPUT REQUIRED.
- [?] Record rights as separate fields `temporary_storage`, `provider_processing`, `processed_retention`, `student_derivatives` and `future_commercial_use`, each `GRANTED`, `DENIED`, `UNKNOWN` or `NOT_APPLICABLE`, with linked permission evidence, who verified it and when. A chat message or verbal statement is never summarized as broader permission than it contains.
- [?] Flag patient/personal data, third-party copyright, original exams, duplicate editions, password protection, scan quality, handwriting, tables/diagrams and mixed-language audio.
- [?] Estimate pages, duration and bytes per source; calculate the maximum preflight provider cost once WP04-T14 has prices.
- [?] Mark benchmark candidates (native PDF, scanned PDF, mixed-language audio, professor voice note) whose `provider_processing` right is `GRANTED`, for WP04-T14 (master plan §16 item 8).
- [ ] Add a validation script that sets `processing_eligible = false` whenever a required right is not `GRANTED` and fails on a missing field, duplicate ID or unreachable evidence link.
- [?] Have the security/data role review every real row before any upload.

**Pass:** the row count matches the expected source manifest; no eligible row has a required `UNKNOWN` or `DENIED` right; evidence links are reachable by the designated reviewers; the benchmark set is marked.

#### WP00-T04 — Approve raw and processed data policy

**Needs from founders:** approval of D-10 and the D-19 real values, after the security/data role is named.

- [~] Create `docs/policies/raw-data-lifecycle.md` from the controlled template; the executable draft is ready for review.
- [~] Define exact synthetic-test durations and starting events; real values wait for D-19.
- [~] Define `delete_after`, hold behaviour, failed conversion, deletion verification, retry intervals, overdue severity, retained metadata and takedown behaviour for deterministic tests.
- [~] Define the proposed minimum accepted output separately for native PDF, scanned PDF and audio; D-10 approval remains open.
- [~] Define temporary normalized audio/OCR storage and deletion behaviour.
- [~] State that database backup does not back up object storage and define processed-object durability independently.
- [~] Add a data-flow diagram naming every logical storage location and the mock/real adapter boundary.
- [?] Review every real provider and storage path against a completed rights inventory (WP00-T03) and the selected providers (WP04-T14, WP04-T16).
- [?] Approve the D-10 processed contract with its §2.3 acceptance thresholds, and the D-19 real retention and deletion values, including what happens to processed text and embeddings after a rights takedown. OWNER INPUT REQUIRED.

**Pass:** given any source state, the executor can tell whether raw data must be retained, deleted, retried, quarantined or held, what happens to processed content after a takedown, and who can authorize the exceptional state. Record: [wp00-t04](../../planning/tasks/wp00-t04-approve-data-lifecycle.md).

#### WP00-T05 — Freeze evaluation data before provider selection

This task builds the dataset machinery and the synthetic suite. Real academic cases are authored in WP00-T20.

**Depends on:** WP00-T01. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

**Outputs:** `evals/datasets/tutor/v1/`, `evals/datasets/studio/v1/`, JSON Schemas, a manifest generator and validator wired into `pnpm test:eval`.

- [ ] Create version directories `evals/datasets/tutor/v1` and `evals/datasets/studio/v1`.
- [ ] Add JSON Schemas for tutor cases, Studio cases, labeled claims (for the WP06-T01 validator measurement) and the dataset manifest, using the §3.4 fields.
- [ ] Add a manifest with dataset version, creation date, source-scope fingerprint, authors, reviewer, case counts by category and language mode, and the SHA-256 of each JSONL file.
- [ ] Use stable case IDs; never renumber a case, supersede it with a new version.
- [ ] Create synthetic cases for every tutor category, every Studio artifact type and every language mode (English, Arabic, mixed), each tied to synthetic fixture segments and canaries.
- [ ] Validate schema, duplicate IDs, category and language counts, required/forbidden claims and hashes; a changed file without a new version fails.
- [ ] Keep any case that reproduces private source text out of Git; it belongs in the restricted store with a redacted index.

**Verify:** `pnpm test:eval`; the validator's negative tests (malformed case, duplicate ID, edited file with the old hash, missing category).

**Pass:** the synthetic suite covers every category and language mode, validates automatically, has no duplicate IDs and cannot change without a version and hash change.

#### WP00-T06 — Freeze budget and provider enablement rules

**Needs from founders:** nonzero caps (D-05), the canonical currency and rate source, and alert recipients.

- [~] Stage the provider benchmark and create truthful open D-04/D-05 records; implementation is ready for review.
- [~] Define the currency/conversion evidence rule; the canonical real currency and rate source remain owner inputs.
- [?] Approve nonzero total, weekly, provider/action, per-source, per-student daily and per-request caps (§2.3). OWNER INPUT REQUIRED.
- [?] Name alert recipients and obtain separate Ahmed and Ziad confirmations before raising a cap.
- [~] Define reservation, 50/75/90% alerts, the 100% hard block, uncertain settlement, accepted-job treatment and kill-switch behaviour.
- [~] Make the zero-cost profile authoritative: every real adapter flag is false and deterministic mocks are the only enabled providers.
- [~] Define the zero-cost smoke story that proves coherent behaviour and a zero-valued cost ledger without provider network calls.

**Pass:** a reviewer can trace a request from reservation through provider call to cost ledger and name the automatic action at every threshold. WP04-T13 implements this. Record: [wp00-t06](../../planning/tasks/wp00-t06-freeze-provider-budgets.md).

#### WP00-T07 — Make the 100-student workload reproducible

**Needs from founders:** a checkpoint on the profile once WP09 runs it.

- [~] Populate `planning/load-profile-100-students.yaml` as an exact synthetic mock contract.
- [~] Define warm-up, realistic ramp, peak academic burst, background-ingestion overlap, provider slowdown, worker death, cooldown and reconciliation as separate phases.
- [~] Specify duration, virtual users, arrival rate, think time, request counts, payload sizes and concurrency for every phase.
- [~] Give each synthetic cohort/unit a unique canary phrase for leakage detection.
- [~] Define success thresholds for HTTP success, first token, full response, queue age, job completion, database connections, reservations, duplicates, leakage and cost.
- [~] Define immediate abort thresholds for leakage, duplicate settlement, lost accepted work, cost, errors, queue age, database pressure and environment health.
- [~] Freeze the random seed and the synthetic dataset/fixture contract version.
- [?] Implement the load runner and execute this profile on an approved target in WP09, then obtain an Ahmed-or-Ziad checkpoint.

**Pass:** another executor can reproduce the scenario without asking what "100 concurrent students" means. Record: [wp00-t07](../../planning/tasks/wp00-t07-freeze-load-profile.md).

#### WP00-T08 — Run the package gate

- [x] Constraints-only WP00 gate: every artifact has owner, status and explicit downstream blockers; no paid call, private upload, raw deletion or invitation occurred; no open decision shown as approved. Ahmed reviewed and authorized mock-only WP01 progression on 2026-08-20. Record: [wp00-t08](../../planning/tasks/wp00-t08-run-package-gate.md). Evidence: [agent readiness](../../evidence/wp00-pilot/2026-08-20_agent-readiness_local_da9f07f.md).

#### WP00-T09 — Consolidate autonomous lean agent execution

- [x] Autonomous execution policy and terminal delivery by default; superseded by WP00-T18. Record: [wp00-t09](../../planning/tasks/wp00-t09-autonomous-agent-execution.md). Evidence: [execution](../../evidence/wp00-pilot/2026-09-21_autonomous-agent-execution_local_ff15002.md).

#### WP00-T10 — Revalidate actual Codex tooling and authentication stack

- [x] Local, GitHub, Supabase, Vercel, browser and CI access paths classified from current evidence; no new authorization or paid resource. Record: [wp00-t10](../../planning/tasks/wp00-t10-tooling-authentication-stack.md). Evidence: [tooling](../../evidence/wp00-pilot/2026-09-21_tooling-authentication-stack_local_5ad335d.md).

#### WP00-T11 — Correct benchmarked execution workflow defects

- [x] Workflow defects found by the first WP03 benchmark corrected (PR #42, `b6aceac`). Record: [wp00-t11](../../planning/tasks/wp00-t11-benchmark-workflow-corrections.md). Evidence: [corrections](../../evidence/wp00-pilot/2026-09-22_benchmark-workflow-corrections_github_b6aceac.md).

#### WP00-T12 — Correct proof reuse and review semantics

- [x] Proof-completeness derivation, design-evidence invalidation and honest review provenance corrected (PR #44). Record: [wp00-t12](../../planning/tasks/wp00-t12-proof-reuse-review-semantics.md). Evidence: [semantics](../../evidence/wp00-pilot/2026-09-22_proof-reuse-review-semantics_local_ba7f01c.md).

#### WP00-T13 — Correct Sol/Luna execution workflow

- [x] Design disposition, founder receipts and independent application/database CI (PR #48); later superseded by WP00-T18. Record: [wp00-t13](../../planning/tasks/wp00-t13-sol-luna-workflow-correction.md). Evidence: [correction](../../evidence/wp00-pilot/2026-09-23_sol-luna-workflow-correction_github_a181d9b.md).

#### WP00-T14 — Replace automatic model routing with manual work blocks

- [x] Model floors and automatic routing removed; superseded by WP00-T18. Record: [wp00-t14](../../planning/tasks/wp00-t14-manual-model-work-blocks.md). Evidence: [work blocks](../../evidence/wp00-pilot/2026-09-24_manual-sol-luna-work-blocks_github_cbfc83c.md).

#### WP00-T15 — Reject stale broad proof and enable early database feedback

- [x] Stale local proof rejected; manual `database_feedback` dispatch added without weakening required PR checks. Record: [wp00-t15](../../planning/tasks/wp00-t15-verification-feedback.md). Evidence: [feedback](../../evidence/wp00-pilot/2026-09-25_verification-feedback_local_d5f8923.md).

#### WP00-T16 — Promote conditional CI from observed evidence

- [x] Fail-closed conditional CI selector active with unchanged required check names. Record: [wp00-t16](../../planning/tasks/wp00-t16-conditional-ci-promotion.md). Evidence: [promotion](../../evidence/wp00-pilot/2026-09-26_conditional-ci-promotion_local_2d4bc5d.md).

#### WP00-T17 — Add manual logo design skill

- [x] Pinned logo-design skill added for explicit invocation only (PR #62, `41892f5`). Record: [wp00-t17](../../planning/tasks/wp00-t17-add-manual-logo-design-skill.md). Evidence: [skill](../../evidence/wp00-pilot/2026-09-29_manual-logo-design-skill_github_41892f5.md).

#### WP00-T18 — Simplify the agent workflow for Codex and Claude Code

- [x] One `AGENTS.md`, one lifecycle in `docs/agents/workflow.md`, the 120-line task record, `pnpm agent:status`/`lint:agents`/`check`/`verify`, and `main` protection requiring a PR and green checks without an approving review (PR #76, approved by Ahmed 2026-10-16). Record: [wp00-t18](../../planning/tasks/wp00-t18-agent-workflow-v2.md).

#### WP00-T19 — Revise the execution runbook against the master plan

**Depends on:** WP00-T18. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

**Outputs:** this runbook (revision 3.0), [revision findings](../reviews/runbook-revision-2026-10/findings.md), the decision register and master-plan decision log in sync.

- [x] Audit the runbook against the master plan, the decision register, the status parser and the code at `74bd340`; publish the findings.
- [x] Fix the dependency order (provider benchmark, real-data readiness, worker host, budget guard and video contract move ahead of their first consumer); add the missing governance, corpus, wiring, email, security-review and success-signal tasks; give every open task dependencies, gates, flags, proof and a pass line; list the values still to set; remove stale and duplicated content.
- [x] Record the product questions found as open decisions D-25 and D-26 without answering them.
- [ ] Founder review of the revised order, then deliver through one PR with required CI.

**Verify:** `pnpm lint:agents`; `pnpm agent:status` lists no lost task and recommends an executable one; every pre-revision task heading is still present with the same text.

**Pass:** every master-plan deliverable maps to a task (findings §F); no open decision appears approved; no completed task is reopened. Record: [wp00-t19](../../planning/tasks/wp00-t19-runbook-revision.md).

#### WP00-T20 — Author and sign the Human Medicine evaluation suite

**Depends on:** WP00-T05, WP00-T03. **Decision gates:** academic reviewer named (WP00-T01); source rows and rights (WP00-T03). **Protected:** none. **Material UI:** no. **Real money:** no.

**Outputs:** `evals/datasets/tutor/v2/` and `evals/datasets/studio/v2/` (or restricted-store equivalents with a redacted index), a signed manifest, the academic review rubric.

- [?] Academic reviewer for Human Medicine named and source rows approved. OWNER INPUT REQUIRED.
- [ ] Author at least 100 distinct tutor cases (target 100–150) against the inventoried Cohort A sources, meeting every §3.4 category minimum; every category includes English, Arabic and mixed-language cases and the manifest reports the split.
- [ ] Author at least 30 Studio/MCQ cases covering every artifact type (target 30–50).
- [ ] Label a claim-support set (claims marked supported or unsupported against named segments) for the WP06-T01 validator measurement.
- [ ] Write the academic review rubric and sample sizes used by WP04-T20, WP06-T08 and WP07-T06 (§2.3).
- [ ] Freeze cases that reproduce private source text in the restricted store; commit only IDs, hashes and redacted metadata.
- [?] Academic reviewer signs the manifest before WP05-T06 uses it.

**Verify:** `pnpm test:eval` validator on the new version; manifest hash check.

**Pass:** the signed suite meets every minimum, validates automatically and cannot change without a new version.

### 3.1 Cohort decision fields

Each cohort decision record (WP00-T02) contains: education stage; institution; program/faculty; academic level; term; cohort/batch name and curriculum-edition identifier; curriculum-unit type with English/Arabic singular/plural labels; ordered Module/Subject list; Batch Leader name and contact route; academic reviewer; expected tester count.

Score each candidate 0–5 on source completeness, permission clarity, Batch Leader reliability, reviewer availability, exam material, audio quality, student demand and the availability of 50+ relevant evaluation questions. Record totals and the selection reason.

### 3.2 Source inventory fields

One row per expected source (WP00-T03): proposed cohort and unit; title, source type, format, approximate pages/minutes/bytes and language; whether it holds professor explanation, exam hints, corrections or exclusions; owner/contributor and permission evidence; the five rights fields; patient/personal-data risk; duplicate/older-version risk; benchmark candidate flag.

Block provider processing when the corresponding right is `UNKNOWN` or `DENIED`. Possession never equals processing or commercial permission.

### 3.3 Raw-data policy contents

The policy (WP00-T04) states: maximum temporary retention; conditions before deletion (complete output, readable processed object, checksum, coverage, locator/metadata integrity, quality status); behaviour when conversion fails; behaviour when deletion fails; legal/rights hold and who may authorize it; deletion verification per storage provider; metadata retained after deletion; takedown/deactivation of processed material, including whether processed text and embeddings are purged.

The default is no permanent raw retention. Audio is fully transcribed before deletion. PDFs and books have meaning-preserving compact processed output before deletion.

### 3.4 Evaluation dataset fields and minimums

Tutor case fields: `case_id`; cohort and unit IDs/slugs; question and language mode; expected evidence source versions/segments or topic locator; expected result `SUPPORTED`, `PARTIAL`, `UNAVAILABLE` or `CONFLICT`; required and forbidden claims; professor-hint expectation; educational-case or explicit-real-patient classification; severity and reviewer notes.

Studio case fields: artifact type, topic, language, depth, item count; required coverage; forbidden unsupported content; known conflict behaviour; expected professor-hint labels; MCQ answer/option constraints where applicable.

Minimum suite per cohort (WP00-T20 for Human Medicine, WP10-T02 for Veterinary). A case may carry more than one label, but the distinct total must reach the master plan's 100:

| Category | Minimum |
| --- | --- |
| Directly supported | 50 |
| Partially supported | 15 |
| Unavailable | 15 |
| Known conflicts | 10 |
| Professor-hint questions | 10 |
| Educational medical/veterinary cases | 15 |
| Explicit real-patient boundary | 5 |
| Prompt-injection or malicious-source | 20 |
| Distinct tutor cases in total | 100 (target 100–150) |
| Studio/MCQ cases | 30 (target 30–50) |

### 3.5 Budgets and load profile contents

The budget record (WP00-T06) holds: total and weekly caps; owners allowed to enable paid providers; alert recipients at 50%, 75% and 90%; the automatic action at 100%; maximum transcription cost per source; maximum chat and Studio tokens/cost per request; daily free usage per student; provider concurrency and retry limits.

The load profile (WP00-T07) includes at minimum 100 logins/catalog journeys, 100 subject opens, 300 chat submissions, 50 Studio requests, 100 quiz attempts, 50 feedback events, one concurrent PDF ingestion and one concurrent audio ingestion, spread over realistic bursts, plus a separate burst test at the selected concurrency ceiling.

### 3.6 Exit evidence

- Approved cohort decision records (D-01 done; D-02 open).
- Source inventory and rights matrix.
- Approved raw-data policy with D-10 and D-19 values.
- Versioned synthetic (WP00-T05) and signed academic (WP00-T20) evaluation suites.
- Budget record and kill-switch ownership.
- Load-test specification with thresholds.

## 4. Work package 1: Repository, environments, and delivery controls

**Outcome (done):** any developer clones the repository onto a supported workstation, runs the deterministic mock application and passes credential-free verification; a standard GitHub-hosted runner reproduces disposable database/Auth checks; separate synthetic Preview and locked Beta deploy from version control without paid infrastructure or a founder-computer dependency.

**Package gate:** [foundation gate](../../evidence/wp01-foundation/2026-08-30_foundation-gate_preview_d7997eb.md).

### 4.0 Tasks

#### WP01-T01 — Pin the runtime and initialize the root application

- [x] Node 24.19.0 and pnpm 10.34.5 pinned; strict Next.js App Router application initialized in place with exact dependency versions and the lint, typecheck, format, test-layer and guarded database scripts. Record: [wp01-t01](../../planning/tasks/wp01-t01-initialize-root-application.md). Evidence: [runtime foundation](../../evidence/wp01-foundation/2026-08-20_runtime-foundation_local_3c98584.md).

#### WP01-T02 — Create boundaries and dependency rules

- [x] UI → application → domain/adapter direction enforced by `pnpm check:boundaries`; server-only convention and client-import check active; business rules run in Vitest without Next.js. Record: [wp01-t02](../../planning/tasks/wp01-t02-create-module-boundaries.md). Evidence: [module boundaries](../../evidence/wp01-foundation/2026-08-20_module-boundaries_local_0e1b0c8.md).

#### WP01-T03 — Create and validate the environment contract

- [x] Zod-validated server/client environment with fail-fast names, `PROVIDER_MODE=mock` default, a real adapter requiring both its flag and a nonzero approved budget, and numeric bounds for sizes, tokens, timeouts, concurrency, retries and quotas. Record: [wp01-t03](../../planning/tasks/wp01-t03-validate-environment-contract.md). Evidence: [environment contract](../../evidence/wp01-foundation/2026-08-20_environment-contract_local_3d1228e.md).

#### WP01-T04 — Provision versioned hosted Supabase development and CI (historical topology)

- [x] Versioned `supabase/` configuration, guarded commands and synthetic seed proven on hosted development/CI projects; this topology was retired by revised D-21 and both projects were repurposed in WP01-T09. Record: [wp01-t04](../../planning/tasks/wp01-t04-provision-hosted-supabase.md). Evidence: [hosted Supabase](../../evidence/wp01-foundation/2026-08-25_hosted-supabase_development-ci_b444a5d.md).

#### WP01-T05 — Implement safe Supabase clients and auth refresh

- [x] Browser, server and marker-protected privileged clients; proxy session refresh; `requireVerifiedIdentity()`; no authorization from `user_metadata`; bundle scan for secret canaries. Record: [wp01-t05](../../planning/tasks/wp01-t05-implement-safe-supabase-clients.md). Evidence: [Supabase Auth](../../evidence/wp01-foundation/2026-08-26_supabase-auth_development_51be7f6.md).

#### WP01-T06 — Implement provider interfaces and deterministic mocks

- [x] One interface per provider kind (§4.3) with normalized results, usage and the typed error taxonomy; deterministic mocks for success, latency, rate limit, timeout before/after acceptance, malformed output and terminal rejection; real adapters cannot call the network while their flag is false. Record: [wp01-t06](../../planning/tasks/wp01-t06-implement-provider-mocks.md). Evidence: [provider mocks](../../evidence/wp01-foundation/2026-08-20_provider-mocks_local_61622df.md).

#### WP01-T07 — Create the test layers

- [x] Unit, integration, security, E2E, evaluation and guarded load layers with bounded timeouts; `pnpm verify` makes no paid call. Record: [wp01-t07](../../planning/tasks/wp01-t07-create-test-layers.md). Evidence: [test layers](../../evidence/wp01-foundation/2026-08-26_test-layers_local_1783d7e.md).

#### WP01-T08 — Create zero-cost CI with a disposable database security gate

- [x] Disposable Supabase stack on `ubuntu-24.04` resets twice, runs Auth/database/security tests, checks generated types and cleans up under `if: always()`; `database-ci` is a required check. Record: [wp01-t08](../../planning/tasks/wp01-t08-create-ci.md). Evidence: [disposable database CI](../../evidence/wp01-foundation/2026-08-28_ci-disposable-database_github_c1428f2.md).

#### WP01-T09 — Provision isolated zero-cost Preview and Beta

- [x] Two Supabase Free projects repurposed as synthetic Preview and locked, empty Beta with separate Vercel Hobby scopes, secrets and callbacks; fail-closed health endpoints and `pnpm smoke:deployment`; promotion and rollback rehearsed with [environment promotion](environment-promotion.md). Beta real data stays blocked until WP04-T18 and WP04-T19. Record: [wp01-t09](../../planning/tasks/wp01-t09-provision-isolated-environments.md). Evidence: [Preview isolation](../../evidence/wp01-foundation/2026-08-29_environment-isolation_preview_4021457.md), [Beta isolation](../../evidence/wp01-foundation/2026-08-29_environment-isolation_beta_4021457.md).

#### WP01-T10 — Write the repository operation tutorial

- [x] `CONTRIBUTING.md` covers mock-only development, disposable CI, guarded Preview/Beta operation, the command table and recovery; a fresh agent followed it from a clean clone. Record: [wp01-t10](../../planning/tasks/wp01-t10-write-operation-tutorial.md). Evidence: [tutorial](../../evidence/wp01-foundation/2026-08-30_repository-tutorial_local_c9543ad.md).

#### WP01-T11 — Run the package gate

- [x] Clean-clone `pnpm verify` with provider network blocked, two disposable resets with stable types, Preview smoke, secret search and recorded versions. Record: [wp01-t11](../../planning/tasks/wp01-t11-run-package-gate.md). Evidence: [foundation gate](../../evidence/wp01-foundation/2026-08-30_foundation-gate_preview_d7997eb.md).

### 4.1 Environments

| Environment | Hosts | Data | Providers |
| --- | --- | --- | --- |
| Workstation | Next.js development process, browsers, tests | Synthetic fixtures | Deterministic in-process mocks |
| CI | Disposable Supabase stack on a GitHub-hosted runner | Synthetic seed only | Mocks |
| Preview | Supabase Free project + Vercel Hobby scope `unimind-preview` | Synthetic only, forever | Mocks; real adapters only for synthetic contract checks inside approved caps |
| Beta | Supabase Free project + Vercel Hobby scope `unimind-beta` | Locked and empty until WP04-T19 (sources) and WP11-T01 (students) | Real adapters after WP04-T14, inside approved caps |

Each environment has its own database, storage namespaces, secrets, callbacks, reset permissions, worker namespace and provider budget scope. Never point one environment at another's data, and never copy real chats or private sources into CI or Preview.

### 4.2 Environment variables

Validated placeholders exist or must be added, server-only unless stated: public Supabase URL and publishable key (public); canonical application origin for Auth callbacks; service-role key; generation, embedding, transcription and OCR credentials; raw/processed storage credentials and namespace names; queue or worker connection settings and worker signing secrets; SMTP host, port, user and sender (D-26); error-reporting and telemetry endpoints; per-provider flags, models, limits and budget thresholds; chat/Studio quotas; maximum source sizes and durations. Never define a web-search provider variable or a payment secret during the free PoC.

### 4.3 Provider interfaces

Interfaces live in `src/lib/ai/` (`AnswerGenerator`, `StructuredArtifactGenerator`, `EmbeddingProvider`, `TranscriptionProvider`, `OcrProvider`), `src/lib/storage/` (`ObjectStorageProvider`) and `src/lib/jobs/` (`JobQueueProvider`), each with deterministic mocks. Every adapter returns normalized identifiers, units, latency, retries, cost and typed errors, and passes the shared contract tests before a flag can enable it.

## 5. Work package 2: Database schema and authorization

**Outcome (done):** a clean database is recreated from version control; every exposed object has intentional grants and RLS; authorization, availability, provenance, jobs and usage invariants are enforced below the UI.

**Package gate:** [database gate](../../evidence/wp02-database/2026-09-09_database-gate_github_dd9ece4.md).

### 5.0 Tasks

#### WP02-T01 — Establish database conventions

- [x] ADR 0002 database boundaries, `uuid`/`timestamptz` conventions, database-level constraints, revoke-then-grant rule, `pnpm check:sql` and the [migration checklist](database-migration-checklist.md). Record: [wp02-t01](../../planning/tasks/wp02-t01-establish-database-conventions.md). Evidence: [conventions](../../evidence/wp02-database/2026-08-31_database-conventions_local_de4ad49.md).

#### WP02-T02 — Create migrations in reviewable dependency order

- [x] Fifteen ordered migration slices from extensions to RLS/grants/indexes, each with its own test, clean reset, populated upgrade, type diff and advisor review. Record: [wp02-t02](../../planning/tasks/wp02-t02-create-reviewable-migrations.md). Evidence: [migrations](../../evidence/wp02-database/2026-08-31_reviewable-migrations_github_fe7b6e6.md).

#### WP02-T03 — Implement reusable authorization predicates

- [x] `is_admin`, `has_active_membership`, `has_campaign_assignment` and `can_access_unit` as security-invoker helpers with an empty `search_path`, stale-claim and revocation tests. Record: [wp02-t03](../../planning/tasks/wp02-t03-implement-authorization-predicates.md). Evidence: [predicates](../../evidence/wp02-database/2026-09-01_authorization-predicates_github_f7e0f3d.md).

#### WP02-T04 — Build the actor/action/resource matrix first

- [x] [RLS matrix](../security/rls-matrix.csv) with a positive and negative test per boundary, a catalog meta-test that fails on an unreviewed exposed table, and a proven failing run for a deliberately leaking policy. Record: [wp02-t04](../../planning/tasks/wp02-t04-build-rls-matrix.md). Evidence: [matrix](../../evidence/wp02-database/2026-09-01_actor-action-resource-matrix_github_6133a54.md).

#### WP02-T05 — Implement availability as a derived contract

- [x] Caller-scoped availability with every §5.2 predicate tested singly and in combination, safe admin reason codes, and recorded query plans. Record: [wp02-t05](../../planning/tasks/wp02-t05-derived-catalog-availability.md). Evidence: [availability](../../evidence/wp02-database/2026-09-02_catalog-availability_github_59ce324.md).

#### WP02-T06 — Implement server-only retrieval scope

- [x] Segment and vector tables outside student grants; one server/worker function that recomputes access and filters before ordering; canary and revoked-source tests. Record: [wp02-t06](../../planning/tasks/wp02-t06-server-only-retrieval-scope.md). Evidence: [retrieval scope](../../evidence/wp02-database/2026-09-07_server-only-retrieval-scope_github_12b50cd.md).

#### WP02-T07 — Make jobs and usage state machines transactional

- [x] Private transition functions for job claim/heartbeat/success/retry/fail and usage reserve/settle/release/expire, with two-session race proof. Record: [wp02-t07](../../planning/tasks/wp02-t07-transactional-jobs-usage.md). Evidence: [jobs and usage](../../evidence/wp02-database/2026-09-08_transactional-jobs-usage_github_576f1d6.md).

#### WP02-T08 — Prove RLS is not bypassed by application architecture

- [x] Student paths use the caller's client; privileged access is one audited server-only module; views are security-invoker; Storage stays fail-closed with zero buckets until D-18; revocation follows the [session revocation policy](../policies/auth-session-revocation.md). Record: [wp02-t08](../../planning/tasks/wp02-t08-rls-application-boundaries.md). Evidence: [application boundaries](../../evidence/wp02-database/2026-09-08_rls-application-boundaries_github_b624426.md).

#### WP02-T09 — Run the database gate

- [x] Two clean resets, populated upgrade, full RLS/grant matrix, races, zero type diff, advisors and plans reviewed. Record: [wp02-t09](../../planning/tasks/wp02-t09-run-database-gate.md). Evidence: [database gate](../../evidence/wp02-database/2026-09-09_database-gate_github_dd9ece4.md).

### 5.1 Schema source of truth

The schema is `supabase/migrations/` and its generated types in `src/types/database.generated.ts`. Every change is a new forward migration that follows the [migration checklist](database-migration-checklist.md). Standing rules for later packages:

- No editable availability flag, balance or counter: availability is derived (§5.2) and usage is a ledger.
- Source format is metadata on the source version, never a separate pool. Professor tags are `PROFESSOR_HINT`, `EXAM_EMPHASIS`, `EXCLUSION`, `CORRECTION` and `LIKELY_QUESTION` on segments.
- Every processed document, locator, segment and embedding belongs to exactly one source version; every segment carries join-verifiable cohort, unit and edition scope.
- Idempotency keys are unique per namespace (submissions, jobs, reservations, Studio requests, quiz submissions).
- Every embedding column is currently a synthetic `vector(3)` placeholder. WP04-T15 replaces it after D-04.
- The free PoC creates no payment-order or receipt table.

### 5.2 Derived availability and retrieval scope

A unit is available to a caller only when the caller is authenticated; has an active cohort membership (or is an authorized admin previewing); the cohort release is `UNLOCKED`; the unit is `PUBLISHED`; at least one active source version is `READY`; source rights remain valid; and source and unit match the current curriculum edition. The worker-only retrieval function takes trusted server scope, revalidates the requesting user's access and never accepts a client-supplied cohort or unit filter without server validation.

### 5.3 RLS and grant rules

- Students read their own profile, membership, sessions, messages, artifacts, attempts and ledger, plus authorized published catalog and source metadata. They never read raw objects, provider calls, job errors, other users, inactive sources or unpublished units.
- Batch Leaders reach only their assigned campaign, its requested items and their own submissions; they cannot publish, unlock, see chats, assign roles or see another campaign.
- Admins act through explicit audited server/database functions for destructive or security-sensitive actions.
- Workers use private schemas or service-role access only from trusted runtimes.
- An unavoidable `SECURITY DEFINER` function sits outside exposed schemas, sets a safe `search_path`, authorizes the caller inside, revokes `PUBLIC` execute and has an unauthorized-execution test.

### 5.4 Database tests every later migration keeps green

Student A cannot read Student B's chat, artifact, attempt or usage rows; Cohort A cannot retrieve Cohort B segments; a member cannot see a locked cohort or an unpublished or empty unit; a Batch Leader cannot publish, unlock, assign roles or see chats; inactive membership removes availability immediately; replacing a source preserves historical answer evidence; a repeated idempotency key creates one submission, job, reservation or artifact; an update cannot move a row into another user's or cohort's scope; revoked rights remove active retrieval without deleting audit or provenance; service credentials never appear in client responses.

## 6. Work package 3: Product shell and governance controls

**Outcome:** each role completes its non-AI journey in the approved bilingual visual system; server-derived scope and database policy prevent URL or form manipulation; release state is safe and auditable; and admins can configure the catalog, grant membership and run campaigns without SQL.

**Package gate (shell):** [product-shell gate](../../evidence/wp03-product-shell/2026-09-29_product-shell-gate_local_fda875f.md). The governance tasks WP03-T34 to WP03-T36 carry their own proof.

Every WP03 frontend task follows [the frontend guide](../agents/frontend.md): the quality floor, the material-change rule and the skill and browser map. Playwright Test is the repeatable E2E gate. External component catalogs and MCPs are optional aids, never design directors or delivery dependencies; `pnpm verify` and a clean-clone build must not need a catalog account, key, network call or paid credit.

### 6.0 Tasks

#### WP03-T01 — Choose and build the bilingual design and terminology foundation

- [x] Founder-selected visual direction recorded in `DESIGN.md`, program-driven Module/Subject terminology, validated locale with `lang`/`dir`, logical CSS and the first local primitives (2026-09-12). Record: [wp03-t01](../../planning/tasks/wp03-t01-bilingual-design-terminology-foundation.md). Evidence: [design foundation](../../evidence/wp03-product-shell/2026-09-12_bilingual-design-foundation_local_7957a10.md).

#### WP03-T02 — Implement auth and consent as complete flows

- [x] Login, registration, verification/resend, recovery, logout, expired/replayed links, suspended and rate-limited states; current consent before learning routes; generic errors; validated internal redirects. Record: [wp03-t02](../../planning/tasks/wp03-t02-auth-consent-flows.md). Evidence: [auth release](../../evidence/wp03-product-shell/2026-09-14_auth-consent-release_production_fd3b093.md).

#### WP03-T03 — Implement the catalog journey server-first

- [x] Caller-scoped catalog cascade with URL-stable authorized selection, dependent resets and forged-ID, expired-membership and live release-change tests. Record: [wp03-t03](../../planning/tasks/wp03-t03-catalog-journey-server-first.md). Evidence: [catalog release](../../evidence/wp03-product-shell/2026-09-15_catalog-journey-release_production_1ee9593.md).

#### WP03-T04 — Build the unit workspace shell

- [x] Authorized cohort/unit workspace with server-scoped sessions and truthful placeholders for chat, Studio, quiz, evidence and reporting. Record: [wp03-t04](../../planning/tasks/wp03-t04-unit-workspace-shell.md). Evidence: [workspace release](../../evidence/wp03-product-shell/2026-09-22_unit-workspace-shell-release_production_e85d5a2.md).

#### WP03-T05 — Build Batch Leader collection flow

- [x] Assigned-campaign upload flow with client idempotency keys, signature/type/size checks, authenticated finalize and every submission state, on the deterministic storage adapter only (D-18 fail-closed). Record: [wp03-t05](../../planning/tasks/wp03-t05-batch-leader-collection-flow.md). Evidence: [collection release](../../evidence/wp03-product-shell/2026-09-23_batch-leader-collection-release_production_63d8e6a.md).

#### WP03-T06 — Build audited admin actions, not table editors (complete)

- [x] Typed audited actions for every §6.4 release control with optimistic concurrency, readiness predicates shown before publish/unlock, two-founder protected transitions and fast reversible containment. Record: [wp03-t06](../../planning/tasks/wp03-t06-audited-admin-actions.md). Evidence: [admin actions release](../../evidence/wp03-product-shell/2026-09-24_audited-admin-actions-release_production_8110ab0.md).

#### WP03-T07 — Add UI and API contract tests (complete)

- [x] Role navigation and forbidden direct URL/API tests, payload secrecy checks, accessibility and EN/AR screen-reader smoke, component provenance. Record: [wp03-t07](../../planning/tasks/wp03-t07-ui-api-contract-tests.md). Evidence: [contract tests release](../../evidence/wp03-product-shell/2026-09-29_ui-api-contract-tests-release_production_ced163e.md).

#### WP03-T08 — Run the product-shell gate

- [x] Full role matrix, Modules and Subjects from configuration, live revocation, idempotent replays, payload and provenance review, EN/AR desktop/mobile founder checkpoint. Record: [wp03-t08](../../planning/tasks/wp03-t08-product-shell-gate.md). Evidence: [gate](../../evidence/wp03-product-shell/2026-09-29_product-shell-gate_local_fda875f.md), [gate release](../../evidence/wp03-product-shell/2026-09-29_product-shell-gate-release_production_76e92c0.md).

#### WP03-T09 — Complete the product frontend with isolated synthetic services

- [x] Every approved journey on normal product routes with isolated synthetic services and a reusable test pack (PR #64, `f107e41`). Record: [wp03-t09](../../planning/tasks/wp03-t09-complete-synthetic-frontend.md). Evidence: [overhaul release](../../evidence/wp03-product-shell/2026-10-03_frontend-overhaul_production_f107e41.md).

#### WP03-T10 — Run the complete frontend mock review gate

- [x] Complete mock review of every role journey and state in EN/AR, then the Open Folio cycle (PR #67, PR #71). Record: [wp03-t10](../../planning/tasks/wp03-t10-complete-frontend-mock-review.md). Evidence: [premium product](../../evidence/wp03-product-shell/2026-10-04_premium-product_production_a74abe5.md), [Open Folio](../../evidence/wp03-product-shell/2026-10-05_open-folio_production_1013cd5.md).

#### WP03-T11 — Support credential-triggered synthetic flows on the live site

- [x] Four approved synthetic login pairs run browser-only synthetic journeys on the live site with no backend identity or real permission. Record: [wp03-t11](../../planning/tasks/wp03-t11-hosted-synthetic-login.md). Evidence: [hosted synthetic login](../../evidence/wp03-product-shell/2026-10-04_hosted-synthetic-login_production_9dbb2a3.md).

#### WP03-T12 — Refine the landing page for local founder review

- [x] Landing copy, passive motion and section polish approved locally by Ahmed (6 October 2026). Record: [wp03-t12](../../planning/tasks/wp03-t12-landing-refinements.md). Evidence: [landing](../../evidence/wp03-product-shell/2026-10-06_landing-refinements_local_b4cac79.md).

#### WP03-T13 — Refine student entry and shared product navigation

- [x] Progressive student entry, Study and Subjects split, named profile, settings and the requested revisions, merged as `45a8c8c` (PR #73) and served in production. Record: [wp03-t13](../../planning/tasks/wp03-t13-student-entry-navigation.md). Evidence: [refinements](../../evidence/wp03-product-shell/2026-10-16_frontend-refinements_production_45a8c8c.md).
- [?] Ahmed's hands-on review of the corrected Chat, Studio, Quiz, Sources and Settings screens is still open. These screens have since been rebuilt in WP03-T19 to WP03-T33, so Ahmed either records that review against the current screens or withdraws this item. OWNER INPUT REQUIRED.

(WP03-T14 was never assigned.)

#### WP03-T15 — Consolidate tests, CI and the synthetic render paths

- [x] Leaner tests, parallel sharded CI, synthetic logic moved to `src/lib/demo`, one synthetic runtime, an 800-line source limit. Record: [wp03-t15](../../planning/tasks/wp03-t15-consolidate-tests-render-paths.md). Evidence: [consolidation](../../evidence/wp03-product-shell/2026-10-17_wp03-t15-test-consolidation.md).

#### WP03-T16 — Balance demo CI shards

- [x] Demo shards balanced; CI wall time down from about 14.6 to about 7 minutes with the same tests. Record: [wp03-t16](../../planning/tasks/wp03-t16-balance-demo-shards.md).

#### WP03-T17 — Render the same student screens in real and synthetic modes

- [x] One adapter seam feeds the shared study workspace, Study Shelf and Settings; tools without a real backend render disabled in real mode (PR #80). WP06-T05, WP07-T03 and WP07-T04 enable them. Record: [wp03-t17](../../planning/tasks/wp03-t17-shared-student-screens.md).

#### WP03-T18 — Choose the premium overhaul direction and rewrite the design contract

- [x] Direction B and landing variant L1 chosen by Ahmed; `DESIGN.md` rewritten (PR #81). Record: [wp03-t18](../../planning/tasks/wp03-t18-premium-direction.md).

#### WP03-T19 — Rebuild the student flow in the approved direction

- [x] Cobalt student flow, approved at `2166c3d` under Ahmed's delegation (PR #82). Record: [wp03-t19](../../planning/tasks/wp03-t19-student-cobalt.md). Evidence: [student Cobalt](../../evidence/wp03-product-shell/2026-10-17_wp03-t19-student-cobalt_production_4849cf0.md).

#### WP03-T20 — Rebuild the landing and access pages in the approved direction

- [x] Cobalt landing and access pages, approved at `d300d28` under Ahmed's delegation (PR #83). Record: [wp03-t20](../../planning/tasks/wp03-t20-landing-access-cobalt.md). Evidence: [landing and access](../../evidence/wp03-product-shell/2026-10-17_wp03-t20-landing-access-cobalt_production_b8f5647.md).

#### WP03-T21 — Rebuild the Batch Leader and admin flows in the approved direction

- [x] Cobalt Batch Leader and admin flows, approved at `c197682` under Ahmed's delegation (PR #84). Record: [wp03-t21](../../planning/tasks/wp03-t21-leader-admin-cobalt.md). Evidence: [leader and admin](../../evidence/wp03-product-shell/2026-10-17_wp03-t21-leader-admin-cobalt_production_d64c9e7.md).

#### WP03-T22 — Keep the loopback demo rewrite internal

- [x] Demo rewrite made internal without weakening the demo gate (PR #85). Record: [wp03-t22](../../planning/tasks/wp03-t22-internal-demo-rewrite.md).

#### WP03-T23 — Measure the compact Chat layout only after the shell settles

- [x] Compact-chat journey measures only the settled layout; no product change (PR #87). Record: [wp03-t23](../../planning/tasks/wp03-t23-settled-chat-layout.md).

#### WP03-T24 — Audit the platform and plan the WP03 refinement

- [x] Six-area audit with prioritized [findings](../reviews/wp03-refinement/findings.md) and [plan](../reviews/wp03-refinement/plan.md). Record: [wp03-t24](../../planning/tasks/wp03-t24-refinement-audit.md).

#### WP03-T25 — Consolidate the Cobalt design system and shared primitives

- [x] One implementation per DESIGN component; alias tokens and legacy buttons removed. Record: [wp03-t25](../../planning/tasks/wp03-t25-cobalt-primitives.md).

#### WP03-T26 — Give content the screen on phones and declutter screens

- [x] Chat keeps at least 400px of conversation at 360x640 and 1280x720; screens decluttered. Record: [wp03-t26](../../planning/tasks/wp03-t26-phone-space-declutter.md).

#### WP03-T27 — Add first-run profile onboarding and one shared access gate

- [x] One access-destination guard for every authenticated page including Batch Leader routes; `/welcome` profile onboarding; additive name-format trigger. Record: [wp03-t27](../../planning/tasks/wp03-t27-profile-onboarding.md).

#### WP03-T28 — Remember the interface language and align demo journeys

- [x] Locale precedence `?lang=` → cookie → account → English, kept through email links and redirects; demo parity. PJ-19 and PJ-21 stay open. Record: [wp03-t28](../../planning/tasks/wp03-t28-locale-demo-parity.md).

#### WP03-T29 — Repair interactions and input semantics

- [x] Pending states, guarded queue, live counts, correct input types and error wiring. Record: [wp03-t29](../../planning/tasks/wp03-t29-interactions-inputs.md).

#### WP03-T30 — Speed up local verification and CI without losing coverage

- [x] Faster local verify and CI with the same gates ([CI and testing report](../reviews/wp03-refinement/ci-testing-report.md)). Record: [wp03-t30](../../planning/tasks/wp03-t30-verification-speed.md).

#### WP03-T31 — Verify the WP03 refinement end to end and publish the reports

- [x] [Final verification](../reviews/wp03-refinement/final-verification.md) on merged `main`; promoted as `680a507`. Record: [wp03-t31](../../planning/tasks/wp03-t31-final-verification.md). Evidence: [refinement release](../../evidence/wp03-product-shell/2026-10-18_wp03-refinement_production_680a507.md).

#### WP03-T32 — Close the WP03 refinement follow-ups

- [x] Synthetic admin header Sign out removed; PJ-19, TC-07 and proposed D-24 recorded; hosted WP03-T27 migration applied. Record: [wp03-t32](../../planning/tasks/wp03-t32-refinement-follow-ups.md). Evidence: [follow-ups](../../evidence/wp03-product-shell/2026-10-18_wp03-t32-follow-ups_production_09a8149.md).

#### WP03-T33 — Polish the phone screens and the landing page with a motion layer

- [x] One motion layer and a felt refinement of every screen, approved by Ahmed at `6c3316a` (PR #100, `606cace`). Record: [wp03-t33](../../planning/tasks/wp03-t33-phone-landing-polish.md). Evidence: [felt refinement](../../evidence/wp03-product-shell/2026-10-19_wp03-t33-felt-refinement_production_606cace.md).

#### WP03-T34 — Configure the catalog through audited admin actions

Master plan §7.2 step 1. Today catalog rows exist only through migrations and seed data.

**Depends on:** WP03-T06. **Decision gates:** none (D-12 and D-23 are approved). **Protected:** RLS and migrations. **Material UI:** yes, the admin catalog resource screens. **Real money:** no.

**Outputs:** audited server/database functions for the catalog; admin catalog screens on the Cobalt primitives; pgTAP and E2E tests.

- [ ] Inventory what `/admin/[resource]` shows for the catalog today, which database functions exist, and which actions are missing; record the gap in the task record.
- [ ] Add audited actions to create, edit and deactivate education stages, institutions, programs (type, progression mode, default unit type, English/Arabic singular and plural unit labels), academic levels, terms, cohorts with curriculum editions, and curriculum units (order, optional parent). Every action takes the actor, expected prior version, reason and correlation ID.
- [ ] Enforce at the database: codes are ASCII `lower_snake_case`, unique within their parent and immutable once referenced; a unit cannot cross cohorts; a referenced node is deactivated, never deleted; a program cannot activate without complete English and Arabic labels.
- [ ] Terminology and progression come from program data only; no faculty-name branch. `FLEXIBLE_CREDIT` is stored as configuration within the D-23 scope.
- [ ] Build the admin catalog screens: tree view, create/edit/deactivate forms, a preview of the student-facing labels, stale-version and validation errors, EN/AR, phone and desktop. Keep the synthetic admin journey on the same screens.
- [ ] Test: non-admin denied; stale version rejected; duplicate code rejected; deactivating a unit removes it from student availability without breaking history; a Veterinary program configured only through these actions renders `Subjects`.

**Verify:** `pnpm check`; `database-ci` (pgTAP); `pnpm test:e2e` and `pnpm test:e2e:demo`; independent review of the migration and functions.

**Pass:** an admin builds a complete program hierarchy down to ordered units in both languages without SQL; every change is audited; the student catalog changes only through derived availability.

#### WP03-T35 — Grant cohort membership to students

Availability needs an active membership (§5.2), but no document says how a student gets one and no code creates one.

**Depends on:** WP03-T34. **Decision gates:** none; this task resolves D-25. **Protected:** auth and authorization, RLS and migrations. **Material UI:** yes, the student no-membership/pending states and the admin membership screens. **Real money:** no.

**Outputs:** the approved membership path as audited functions and screens; tests.

- [ ] Prepare D-25: write `docs/decisions/d-25-student-cohort-membership.md` with the options (for example an admin allow-list of verified emails per cohort, admin approval of a student request, or a cohort enrollment code), their abuse and privacy risks, who may revoke, and the effect on WP11 wave provisioning.
- [ ] Obtain Ahmed's and Ziad's approval of D-25 and update the master-plan log and the register (this step becomes `[?]` while it waits).
- [ ] Implement only the approved path through audited server/database functions; membership states `ACTIVE`, `SUSPENDED`, `EXPIRED` and `REVOKED` with `starts_at`/`ends_at`; the browser never asserts a cohort.
- [ ] If D-25 allows admin provisioning, add idempotent wave provisioning for WP11 (a list of verified emails per cohort with a dry-run report and no duplicate memberships).
- [ ] Student-facing states: no membership, pending (if requests exist), active, expired and revoked, with honest copy that never reveals another cohort's configuration.
- [ ] Admin screens to grant, suspend and revoke with a reason; revocation follows the [session revocation policy](../policies/auth-session-revocation.md).
- [ ] Test: forged cohort, duplicate grant, expired and revoked mid-session (next server operation fails safely), cross-cohort request, Batch Leader or anonymous caller denied.

**Verify:** `pnpm check`; `database-ci`; E2E for each state; independent review.

**Pass:** a verified student gains access to exactly the approved cohort only through the approved path; revocation removes availability on the next server operation; every grant and revoke is audited.

#### WP03-T36 — Create campaigns and give Batch Leaders scoped access

Master plan §7.2 steps 2–3 and §7.3. Campaigns and assignments exist only in seed data today.

**Depends on:** WP03-T34. **Decision gates:** D-24 (one-time links or accounts); D-26 only if links are delivered by email. **Protected:** auth and authorization, RLS and migrations, storage (upload route). **Material UI:** yes, admin campaign screens and the Batch Leader entry. **Real money:** no.

**Outputs:** campaign management actions and screens; the approved Batch Leader access path; the needs-information loop; a security review of the access design.

- [?] D-24 decided by Ahmed and Ziad. OWNER INPUT REQUIRED.
- [ ] Admins create a campaign for an exact cohort and unit scope with open/close dates and requested-material items (type, required/optional, naming guidance); edit and close it with a reason.
- [ ] Batch Leader access as decided. One-time links: unguessable, stored as a hash, expiring, single-use or explicitly bounded, revocable, audited on issue/use/expiry/revocation, never logged, never in analytics, and never exposed to a referrer (`Referrer-Policy: no-referrer`). Accounts: admin assignment of a verified account with an expiry. Retire the path not chosen.
- [ ] Needs-information loop: an admin marks a submission `NEEDS_INFORMATION` with a reason; the Batch Leader sees it and answers; the states match master plan §7.3.
- [ ] A closed or expired campaign accepts no new submission; accepted submissions keep processing.
- [ ] Test: replayed, expired and revoked links; wrong campaign; a scan proving no link token appears in logs, analytics payloads or referrers; the Batch Leader cannot publish, unlock, see chats or reach another campaign; idempotent finalize unchanged.
- [ ] Prove the governance loop end to end on synthetic storage: configure catalog → create campaign → give access → submit → request information → answer → grant a student membership (when WP03-T35 is done) → publish and unlock → the student sees the unit once a synthetic source is `READY`.

**Verify:** `pnpm check`; `database-ci`; E2E for the loop; independent security review of the access design recorded in the task record.

**Pass:** master plan admin steps 1–3 and the Batch Leader journey run through product screens without SQL; the access design passed independent review.

### 6.1 Routes

Current routes: `/(auth)/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/consent`, `/welcome`; `/auth/callback`; `/learn`; `/learn/[cohortId]/[unitId]` with `chat`, `studio`, `quiz`, `sources`, `evidence` and `report`; `/settings`; `/batch-leader` and `/batch-leader/campaigns/[campaignId]` with the upload Route Handler; `/admin` and `/admin/[resource]`; `/api/health/live` and `/api/health/ready`. The synthetic runtime path is loopback-only and returns 404 in production. WP03-T36 may add a link-entry route for Batch Leaders if D-24 is approved.

### 6.2 Filter behaviour

Dependent server-authorized filters in this order: education stage; institution/system; program/faculty; academic level; semester/term for `TERM_BASED` programs (for `FLEXIBLE_CREDIT`, the configured course-plan period without a rigid semester list); released cohort when more than one matches; available Modules or Subjects. Changing an upstream filter clears invalid downstream choices. Empty states distinguish no configured catalog, no membership, locked cohort, unpublished unit and no READY sources without exposing private details. A flexible-credit program lists only the caller's eligible course-plan units and never takes browser-selected units as authorization.

### 6.3 Subject workspace

The workspace shows the institution/program/level/term/cohort breadcrumb, the dynamic Module/Subject title, Chat, Studio and Quiz navigation, source-pool status and last material update, the source list (title and format) when allowed, usage and allowance state, language mode, and a scope switcher that starts or selects the right session. Every chat and Studio call derives scope from the authenticated server record and verifies it again.

### 6.4 Admin governance controls

Separate audited actions exist for: publish/hide a unit; unlock/lock a cohort; activate/deactivate a source version; quarantine/retry a failed source; place/remove a raw-data hold; enable/disable a provider or artifact type (WP03-T06). WP03-T34 adds catalog configuration, WP03-T35 membership, WP03-T36 campaigns and Batch Leader access. Show the exact failed availability predicate before unlock or publish; a unit with zero active READY sources never appears.

### 6.5 Batch Leader submission

The submission requires campaign, requested item or unit, title, format, rights declaration, professor/source description and file or approved reference. The client creates the idempotency key before upload; upload uses a short-lived exact-object target where the storage provider supports it; finalize runs through a server mutation after checksum and metadata confirmation. The access model follows D-24 (WP03-T36).

### 6.6 UI rules every later screen keeps

Human Medicine renders Modules and Veterinary renders Subjects from data; Arabic is RTL while English medical terms stay readable; no missing-key or wrong-language fallback; browser navigation never changes the authorized scope silently; locked, unpublished or empty units never appear available; admin preview is visibly marked and creates no membership; protected actions never complete from one founder confirmation; critical flows reflow at the minimum mobile width and 200% text, support keyboard, touch and screen readers, respect reduced motion and keep visible focus; loading, empty, error, offline, success, disabled and stale states use the approved component language.

## 7. Work package 4: Automated source pipeline and real-data readiness

**Outcome:** a finalized submission moves to `READY` or a precise terminal exception without manual database work; raw data is deleted only after verified processed output; replay creates no duplicate state or cost. The package proves this first on synthetic fixtures with mocks (WP04-T01 to WP04-T12), then makes the real choices the pipeline needs (WP04-T13 to WP04-T19), then processes the real Cohort A corpus (WP04-T20).

**Primary artifacts:** `src/lib/ingestion/`, `src/lib/jobs/`, `src/lib/storage/`, `src/lib/usage/`, `src/lib/observability/`, `workers/ingestion/`, `workers/reconciliation/`, `supabase/migrations/`, `tests/fixtures/ingestion/` and `evidence/wp04-ingestion/`. The detailed processing rules are §7.1 to §7.9; tasks reference them instead of repeating them.

### 7.0 Tasks

#### WP04-T01 — Freeze processor contracts before real files

**Depends on:** WP03-T08. **Decision gates:** D-10. **Protected:** none. **Material UI:** no. **Real money:** no.

**Outputs:** versioned Zod schemas in `src/lib/ingestion/`, synthetic fixtures with expected outputs in `tests/fixtures/ingestion/`, an ADR for duplicate and replacement rules.

- [?] D-10 approved by Ahmed and Ziad with the security/data role named (WP00-T01). OWNER INPUT REQUIRED.
- [ ] Define versioned schemas for `InspectedSource`, `ProcessedDocument`, `Locator`, `Segment`, `SegmentTag`, `QualityReport` and every job input/output in §7.1. Each carries schema version, source-version ID, checksum, content hash, language profile, coverage map, warnings and correlation ID.
- [ ] Keep large payloads in processed object storage and checksums plus workflow state in PostgreSQL; no unique state lives only in an object or a queue message.
- [ ] Write the duplicate and replacement rules as an ADR: identical checksum resubmitted, the same content in another unit or campaign, a newer edition, and an explicit replacement that creates a new source version needing admin activation. Ask the founders where a rule changes what a Batch Leader or student sees.
- [ ] Prove the video-ready contract (master plan §5.1 and §14): a contract test shows a `VIDEO` source kind reuses the processed-document, time-range locator, segment, tag and job contracts with no new table, pool or answer path. No video processor is built.
- [ ] Generate synthetic fixtures with expected outputs: tiny native PDF, scanned PDF, corrupt PDF, password-protected PDF, Arabic/English audio, silent audio, boundary-chunk audio and malicious-instruction text. No third-party content.

**Verify:** contract unit tests (one valid and one invalid fixture per schema); the video contract test; `pnpm check`.

**Pass:** every job step has a versioned input and output schema with a valid and an invalid fixture; the video contract test passes; no real file is used.

#### WP04-T02 — Implement the workflow state machine

**Depends on:** WP04-T01. **Decision gates:** none (the in-process dispatcher stands in for D-17). **Protected:** RLS and migrations if job functions change. **Material UI:** no. **Real money:** no.

**Outputs:** workflow application and domain modules in `src/lib/jobs/`, an in-process dispatcher, a structured logger in `src/lib/observability/`.

- [ ] Create the structured JSON logger and correlation-ID propagation from request to job to provider call, with tested redaction of secrets, authorization headers, signed URLs, source text and chat content. WP08-T02 adds metrics on top.
- [ ] Create one job per §7.1 graph step, with its dependencies, in the same transaction that finalizes the submission into a source version.
- [ ] Derive idempotency keys from source version, step, processor/config version and content hash.
- [ ] Claim atomically with a lease and an attempt record (WP02-T07 functions); heartbeat long work; reject completion by a non-owner or expired lease; reclaim safely (§7.2).
- [ ] Classify failures as retryable, terminal, needs review or uncertain provider acceptance.
- [ ] Back off exponentially with jitter, persist `available_at`, and record lease, heartbeat, attempt and backoff values in configuration (§2.3).
- [ ] Make cancellation and deactivation stop new dependent jobs while keeping history.
- [ ] Add an in-process dispatcher that runs the graph in tests and CI until WP04-T17 deploys the real worker host.

**Verify:** unit tests; `database-ci` race tests with two sessions claiming one job; log-redaction tests.

**Pass:** a synthetic source runs the graph under the in-process dispatcher; replaying finalize creates no second workflow; two racing workers produce one success; every log line has a correlation ID and no content.

#### WP04-T03 — Implement secure temporary storage

**Depends on:** WP04-T01. **Decision gates:** none for the adapter; the real provider is chosen in WP04-T16 (D-18). **Protected:** storage. **Material UI:** no. **Real money:** no.

**Outputs:** storage application layer over `ObjectStorageProvider`, namespace configuration, orphan reconciliation job, the WP03-T05 upload route connected.

- [ ] Separate temporary raw, temporary derived and durable processed namespaces.
- [ ] Deny public listing and reads; issue short-lived exact-object operations only after server authorization; keep object keys server-side and log only key fingerprints.
- [ ] Reconcile signed uploads that are never finalized.
- [ ] Inspect magic bytes and type before processing; record the malware-scanning approach the real host needs (WP04-T16 chooses the scanner).
- [ ] Enforce byte, page and duration limits (§2.3) and rights before any provider cost.
- [ ] Connect the WP03-T05 upload route and finalize action to this layer without weakening their checks.

**Verify:** storage contract tests on the synthetic adapter; forbidden read, list and cross-campaign tests; independent review.

**Pass:** forbidden reads, lists and cross-campaign uploads are denied; orphans are reconciled; limits and rights stop work before any (mock) provider call.

#### WP04-T04 — Build native PDF extraction incrementally

**Depends on:** WP04-T02, WP04-T03. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

**Outputs:** the PDF inspector and extractor in `src/lib/ingestion/` following §7.3.

- [ ] Inspect magic bytes, encryption, page count, metadata, corruption and checksum.
- [ ] Extract page by page and record text density and anomalies before deciding OCR ranges.
- [ ] Normalize headers, footers, hyphenation, lists, headings, tables, formulas, captions and diagrams conservatively; never delete meaning to save bytes.
- [ ] Write temporary output incrementally, then finalize atomically only when every page is represented, explicitly blank or rejected.
- [ ] Map normalized character ranges to original pages with confidence and validate bounds and non-overlap.

**Verify:** fixture tests against expected Markdown and locator sidecars.

**Pass:** synthetic native PDFs produce the expected processed output and locators; every page is accounted for; corrupt and password-protected files are rejected with an actionable reason.

#### WP04-T05 — Add selective OCR

**Depends on:** WP04-T04. **Decision gates:** none for the mock path; a real OCR adapter needs D-04 (WP04-T14). **Protected:** none. **Material UI:** no. **Real money:** only through WP04-T13 once a real adapter exists.

- [ ] Define per-page OCR triggers from text density, replacement characters, layout anomalies and fixture results; record them in configuration (§2.3).
- [ ] Send only selected page ranges to the OCR adapter and reserve the maximum cost first (WP04-T13 once real).
- [ ] Merge OCR and native output in original page order without duplicate text.
- [ ] Validate Arabic/English terminology, tables, formulas and page coverage.
- [ ] Mark irrecoverable visual meaning `NEEDS_REVIEW`; never claim full processing.

**Verify:** fixture tests with the mock OCR adapter.

**Pass:** only triggered pages reach OCR; merged output is ordered and free of duplicates; unrecoverable pages are isolated as `NEEDS_REVIEW`.

#### WP04-T06 — Build complete audio transcription

**Depends on:** WP04-T02, WP04-T03. **Decision gates:** none for the mock path; a real transcription adapter needs D-04 (WP04-T14). **Protected:** none. **Material UI:** no. **Real money:** only through WP04-T13 once a real adapter exists.

- [ ] Inspect codec/container, duration, channels, sample rate, corruption and the cost ceiling; reject over-limit duration before any cost (§7.4).
- [ ] When chunking is needed, compute deterministic overlapping chunks and keep their exact time ranges.
- [ ] Merge with boundary de-duplication and prove accounted duration within the §2.3 tolerance.
- [ ] Preserve Arabic/English code-switching and technical terms; never translate unless a separate approved step asks for it.
- [ ] Persist confidence and timestamp locators; flag long silence and low-confidence spans.
- [ ] Delete temporary normalized audio and chunks after the transcript passes verification, and verify their absence separately from raw deletion.

**Verify:** fixture tests with the mock transcription adapter.

**Pass:** synthetic audio fixtures account for their full duration within tolerance; silence and low confidence are flagged; temporary chunks are verified absent.

#### WP04-T07 — Tag professor evidence safely

**Depends on:** WP04-T06. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no (mock tagger until WP04-T14 chooses a model, if any).

- [ ] Tag only spans with evidence; keep tag type, label, confidence, details, locator and tagger version.
- [ ] Distinguish `PROFESSOR_HINT`, `EXAM_EMPHASIS`, `EXCLUSION`, `CORRECTION` and `LIKELY_QUESTION`.
- [ ] Never rewrite possibility or emphasis into certainty or an exam guarantee.
- [ ] Create positive and negative Arabic, English and mixed fixtures; record precision and recall on them.

**Verify:** tagger fixture tests.

**Pass:** fixture precision and recall are recorded; no fixture hint becomes a certainty; WP04-T20 adds the academic sample on real audio.

#### WP04-T08 — Verify processed output before deleting raw data

**Depends on:** WP04-T04 to WP04-T07. **Decision gates:** D-10 thresholds (synthetic defaults until approved). **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Reopen the finalized processed object from durable storage instead of trusting the write response.
- [ ] Recompute the checksum and validate the schema.
- [ ] Check page/duration coverage, the non-empty threshold, locator bounds, the terminology sample, the duplicate ratio and unresolved blocker warnings (§7.5).
- [ ] Persist the immutable quality report with the accepted policy version.
- [ ] Enqueue deletion only from the passing or policy-approved state, in one transaction.
- [ ] Inject failures before and after finalization and prove deletion was never enqueued early.

**Verify:** fault-injection tests; `database-ci` for the transactional enqueue.

**Pass:** no fixture can reach deletion without a passing persisted report.

#### WP04-T09 — Delete and independently verify raw absence

**Depends on:** WP04-T08. **Decision gates:** none on synthetic data; real deletion needs D-19 and WP04-T19. **Protected:** storage; raw deletion is a D-22 protected action. **Material UI:** no. **Real money:** no.

- [ ] Lock the raw row, re-check accepted processed state and any legal/rights hold, and use the exact stored provider key (§7.6).
- [ ] Record the deletion result, then check absence independently through the provider's metadata, head or list call.
- [ ] Treat a timeout or ambiguous response as unresolved; retry verification before reissuing a delete.
- [ ] Append attempts; never overwrite deletion history.
- [ ] Clear reusable access URLs and keep only approved audit metadata.
- [ ] Open an incident automatically when `delete_after` passes.
- [ ] Test already-absent objects, access-denied deletion, delayed consistency, provider outage, a hold placed during processing and deletion replay.

**Verify:** deletion tests on the synthetic adapter; independent review.

**Pass:** zero premature deletions and 100% verified deletion of accepted synthetic sources, including replays and outages.

#### WP04-T10 — Chunk, embed, and mark READY

**Depends on:** WP04-T08. **Decision gates:** none for mock embeddings; real embeddings follow WP04-T15. **Protected:** RLS and migrations if retrieval or readiness functions change. **Material UI:** no. **Real money:** no until WP04-T15.

- [ ] Chunk by structure and semantic boundaries with a versioned chunking configuration; keep tables, definitions, question/answer blocks and professor statements coherent; record token counts (§7.7).
- [ ] Hash normalized content and de-duplicate without losing legitimate repeated context or provenance.
- [ ] Reserve embedding budget, batch by provider limit and reuse vectors by content hash plus embedding configuration.
- [ ] Validate vector count, dimensions, finite values, normalization and model identity before insert.
- [ ] Run the ingestion checks of master plan §8.5 step 16: empty segments, duplicates, leakage canaries, retrieval smoke, and prompt-injection-like text flagged as a segment tag (kept as untrusted data, never removed or obeyed).
- [ ] Mark `READY` only through a protected transition that recomputes every §7.8 predicate.

**Verify:** fixture tests with mock embeddings at the placeholder dimension; `database-ci` readiness tests.

**Pass:** a valid synthetic source reaches `READY` with stable segment and vector counts; a source failing any §7.8 predicate never does.

#### WP04-T11 — Reconcile every incomplete state

**Depends on:** WP04-T09, WP04-T10. **Decision gates:** D-19 for real takedown values. **Protected:** storage. **Material UI:** no. **Real money:** no.

- [ ] Reclaim expired leases; resume workflows with a succeeded parent and a missing child.
- [ ] Verify uncertain provider timeouts by provider request ID where supported.
- [ ] Find accepted output without a deletion job, verified deletion without chunks, missing or outdated embeddings, READY inconsistencies, orphan temporary objects and unsettled reservations.
- [ ] Rights takedown: deactivate the source version, remove it from retrieval at once, invalidate dependent artifacts (WP07-T05), and purge processed text and embeddings when the approved policy requires it, keeping only audit metadata.
- [ ] Keep reconciliation idempotent; emit metrics and incidents instead of editing history.

**Verify:** reconciliation tests per incomplete state; takedown test.

**Pass:** each seeded incomplete state is moved forward or isolated automatically; a takedown removes the source from retrieval immediately and follows the policy for processed content.

#### WP04-T12 — Run the fault matrix and package gate

This is the synthetic half of the WP04 gate. WP04-T20 is the real half.

**Depends on:** WP04-T01 to WP04-T11. **Decision gates:** D-10 for the final thresholds. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Inject a crash immediately before and after every external call and every database transition.
- [ ] Race two workers on one job and expire a lease during a slow call.
- [ ] Replay the whole workflow with identical submission and step keys; compare counts, checksums, provider-call records and usage before and after.
- [ ] Exercise native PDF, scanned PDF, mixed audio, duplicate, corrupt, timeout, malformed output, rights revocation, hold, deletion failure, and one terminal source next to a valid one.
- [ ] Write the gate report `evidence/wp04-ingestion/<date>_pipeline-synthetic_ci_<sha>.md`.

**Verify:** the fault matrix suite; `pnpm verify`; `database-ci`.

**Pass:** every §7.9 property holds: zero premature deletion, one processed document, stable segment and vector counts, exactly-once settlement, and automatic progress or isolation.

#### WP04-T13 — Enforce budgets and kill switches before any paid call

Master plan §13 and WP00-T06 define the rules; nothing enforces them yet.

**Depends on:** WP04-T02. **Decision gates:** none to build and test at zero caps; D-05 before any nonzero cap. **Protected:** RLS and migrations (budget functions); production configuration (flags). **Material UI:** no (WP03-T06 already has the admin kill-switch actions). **Real money:** no; this task makes later spending safe.

**Outputs:** a budget guard in `src/lib/usage/` that every real adapter call passes through; budget functions; tests.

- [ ] Route every real adapter call through one guard: the provider flag and a nonzero approved budget must both hold (WP01-T03 rule); the guard reserves the maximum cost before the call and settles or releases it exactly once after (WP02-T07 functions).
- [ ] Enforce caps at system total, weekly, provider/action and per source (§2.3); record 50/75/90% events (delivered once D-20 lands in WP08-T05); block new optional paid work atomically at 100%.
- [ ] Add a kill switch per provider and per action that takes effect immediately for new reservations and claims; accepted jobs finish or park without corrupt state.
- [ ] Preflight the maximum cost per source from duration and pages before the first paid step.
- [ ] Record every call in `provider_calls`: provider, model/version, units, latency, attempts, result and cost in the WP00-T06 currency rule.
- [ ] Test a cap exceeded mid-batch, concurrent reservations at the boundary, a kill switch during a long job, and an uncertain settlement.

**Verify:** unit and `database-ci` tests; `pnpm verify` still makes zero paid calls.

**Pass:** with zero caps no real adapter can make a call; with a synthetic nonzero cap, concurrent reservations never exceed it; every call has exactly one settlement.

#### WP04-T14 — Benchmark and select the AI providers

Moved here from WP09 because real OCR, transcription and embeddings need D-04 before WP04-T20 (findings A1).

**Depends on:** WP04-T13, WP04-T12, WP00-T03 (benchmark samples), WP00-T05. **Decision gates:** D-05 (benchmark cap); this task resolves D-04. **Protected:** production configuration (provider secrets). **Material UI:** no. **Real money:** yes — stop for fresh two-founder confirmation naming the maximum benchmark spend.

**Outputs:** `planning/provider-benchmark.csv` with results; an approved D-04 record; real adapters behind flags.

- [?] D-05 benchmark cap approved and rights-cleared benchmark samples marked in WP00-T03. OWNER INPUT REQUIRED.
- [ ] List candidates per capability: OCR, transcription with Arabic/English code-switching, embeddings for Arabic and English medical terms, generation for chat and Studio, and a model for the WP06-T01 validator if that ADR needs one. Record each candidate's data handling (retention, training use, region).
- [ ] Run the same samples, prompts and settings; record quality (academic scoring for OCR and transcription samples), units, p50/p95, errors and retries, rate limits and cost in one currency and date; separate cold/warm and success/retry cost.
- [ ] Treat quality, rights/data handling and reliability as gates before price; never select on advertised price.
- [ ] Implement the selected real adapters behind their flags; they pass the WP01-T06 contract tests; credentials stay server/worker-only.
- [ ] Write the D-04 record with fallback and disable strategy; update the master-plan log only after both founders approve.

**Verify:** adapter contract tests; benchmark report; spend reconciled against the cap.

**Pass:** D-04 is approved on numeric evidence; every selected adapter passes the shared contract tests; benchmark spend stayed inside the approved cap; `pnpm verify` still makes zero paid calls.

#### WP04-T15 — Set the production embedding configuration and check capacity

**Depends on:** WP04-T14, WP04-T10. **Decision gates:** D-04 (approved in WP04-T14). **Protected:** RLS and migrations. **Material UI:** no. **Real money:** stop if the capacity check shows a paid database tier is needed.

**Outputs:** a forward migration for the real vector dimension and index, an `embedding_configs` version, a capacity report.

- [ ] Replace the `vector(3)` placeholder columns and index through a forward migration with the chosen dimensions and distance operator; match the HNSW operator class; version the configuration; re-embed the synthetic fixtures.
- [ ] Compare exact search with HNSW on the fixtures.
- [ ] Estimate database size (segments per page and per audio minute from fixtures × the master plan §4.2 corpus for both cohorts × vector, index and text bytes) and processed-object storage; compare with the current Supabase Free allowances (§0.8), including monthly active users and pausing.
- [ ] If any estimate exceeds an allowance, stop: a paid tier is a real-money decision (D-05, D-21 revisit) before WP04-T20.

**Verify:** `database-ci` with the new migration; zero generated-type diff after regeneration; retrieval tests at the real dimension.

**Pass:** retrieval tests pass at the real dimension; the capacity report states the headroom or names the money decision that must come first.

#### WP04-T16 — Select object storage and approve retention values

**Depends on:** WP04-T03, WP04-T15. **Decision gates:** D-19 (resolved through WP00-T04); this task resolves D-18. **Protected:** storage; production configuration. **Material UI:** no. **Real money:** yes if the provider or plan is paid.

**Outputs:** an approved D-18 record; the real storage adapter; per-environment namespaces; an updated [raw-data policy](../policies/raw-data-lifecycle.md).

- [?] D-19 real retention and deletion values approved through WP00-T04. OWNER INPUT REQUIRED.
- [ ] Prepare D-18: write `docs/decisions/d-18-object-storage-provider.md` comparing candidates on private access, signed operations, deletion verification, durability/versioning, region, scanning support, Free-tier limits and cost.
- [ ] Obtain Ahmed's and Ziad's approval of D-18 with the security/data role named (this step becomes `[?]` while it waits).
- [ ] Implement the real adapter and namespaces per environment (Preview synthetic, Beta real) with public access denied and short-lived exact-object operations.
- [ ] Prove the provider's deletion verification method (head, list or metadata) and its consistency behaviour (§7.6).
- [ ] Choose and wire the malware/content scanner suitable for this provider.
- [ ] Configure processed-object durability (versioning or backup) per policy; exclude raw objects beyond their window.
- [ ] Replace the synthetic values in the raw-data policy with the approved D-19 values.

**Verify:** the storage contract tests against the real provider in Preview with synthetic objects; deletion-verification tests; independent review.

**Pass:** the contract tests pass against the real provider; deletion is verified independently; no public access path exists.

#### WP04-T17 — Select and deploy the worker host

D-15 forbids running workers on a founder computer, and real processing needs an always-on host (findings A3).

**Depends on:** WP04-T12. **Decision gates:** none; this task resolves D-17. **Protected:** production configuration. **Material UI:** no. **Real money:** yes if the host is paid.

**Outputs:** an approved D-17 record; deployed ingestion worker and scheduler in Preview and Beta.

- [ ] Update the [D-17 record](../decisions/d-17-queue-worker-host.md) from the [hosting options discussion](../../planning/d-17-hosting-options-discussion.html) with measured job durations from WP04-T12: queue transport and worker host candidates, founder computers excluded, each with a zero-cost path or a named monthly exposure.
- [ ] Obtain Ahmed's and Ziad's approval of D-17 (this step becomes `[?]` while it waits).
- [ ] Deploy the ingestion worker and the reconciliation scheduler as always-on components in Preview and in locked Beta with separate secrets; the generation worker follows in WP06.
- [ ] Workers claim from the PostgreSQL job table, heartbeat, shut down gracefully, expose a health check, and keep no business state outside PostgreSQL.
- [ ] Prove operation with both founder computers off: a synthetic source submitted in Preview reaches `READY` on mocks.

**Verify:** Preview run timeline; a worker killed mid-job recovers through its lease.

**Pass:** the Preview pipeline runs unattended on external infrastructure; a killed worker's job is reclaimed; D-15 holds.

#### WP04-T18 — Back up and restore Beta before it holds real data

D-21 keeps Beta empty until an encrypted backup and restore passes; Supabase Free has no automatic backups.

**Depends on:** WP04-T16. **Decision gates:** a restore target that may hold real data. **Protected:** production configuration. **Material UI:** no. **Real money:** yes if the backup store or target is paid.

**Outputs:** a backup and restore procedure under `docs/runbooks/`; a timed rehearsal report.

- [ ] Propose the restore-rehearsal target allowed to hold real data. Preview (synthetic only) and the public repository's CI runner are not acceptable. If no free target exists, prepare a D-21 revisit; a paid option is a money stop.
- [ ] Obtain Ahmed's and Ziad's approval of the target (this step becomes `[?]` while it waits).
- [ ] Schedule an encrypted logical database backup of Beta from external infrastructure, with key management and retention.
- [ ] Back up or version processed objects per WP04-T16.
- [ ] Handle Free-plan pausing with a keep-alive or a documented resume step (D-21).
- [ ] Rehearse: restore database and processed objects into the named target, verify row counts and referential checks for catalog, access, sources, documents, segments, evidence, artifacts, usage, jobs and audit, rebuild embeddings if they are not backed up, and confirm no expired raw object returns.

**Verify:** the rehearsal report with timings and counts.

**Pass:** a timed restore of a synthetic-populated Beta succeeds with verified counts; the procedure is committed; D-21's real-data condition for Beta is met.

#### WP04-T19 — Pass the real-data readiness gate

**Depends on:** WP04-T12 to WP04-T18, WP03-T34, WP03-T36. **Decision gates:** D-01 catalog codes, D-04, D-05, D-10, D-17, D-18, D-19 approved; eligible WP00-T03 rows. **Protected:** yes — rights and raw deletion are D-22 protected actions. **Material UI:** no. **Real money:** no new spend.

**Outputs:** `evidence/wp04-ingestion/<date>_real-data-readiness_beta_<sha>.md`.

- [ ] Confirm every listed decision is approved and linked; every Cohort A row to be uploaded is eligible.
- [ ] Confirm the Beta backup rehearsal (WP04-T18), the worker host (WP04-T17), the budget guard with approved caps and tested kill switches (WP04-T13), and the storage provider (WP04-T16).
- [ ] Write minimum incident runbooks before real data: deletion failure, leakage suspicion, rights takedown and leaked secret (WP08-T07 completes the set).
- [ ] Configure the Cohort A catalog in Beta through WP03-T34 actions; keep Beta closed to students (no memberships).
- [ ] Record the security/data role's sign-off and D-22 authorization for the first real upload.

**Verify:** the gate report checklist against linked evidence.

**Pass:** a reviewer can confirm from the report alone that the first real upload is allowed, contained and reversible.

#### WP04-T20 — Collect and process the Cohort A corpus

The Human Medicine corpus had no collection task (findings B4). This is the real half of the WP04 gate (master plan Phase 2).

**Depends on:** WP04-T19, WP03-T36. **Decision gates:** none beyond WP04-T19. **Protected:** storage; raw deletion. **Material UI:** no. **Real money:** yes, inside the approved caps through the budget guard; a cap increase needs fresh two-founder confirmation.

**Outputs:** READY Cohort A sources in Beta; `evidence/wp04-ingestion/<date>_cohort-a-corpus_beta_<sha>.md`.

- [ ] An admin creates the Cohort A campaigns; the Batch Leader submits the inventoried sources; target 8–12 units, 15–25 documents and 3–5 hours of audio (master plan §4.2).
- [ ] The pipeline runs on the real providers with no manual database step; every source reaches `READY` or isolation with a machine-readable reason.
- [ ] The academic reviewer spot-checks processed text, transcripts and hint tags per unit using the WP00-T20 rubric and sample size.
- [ ] Report storage reduction, cost per source and verified raw deletions.

**Verify:** job event timelines per source; the quality, deletion and cost reports.

**Pass:** at least 95% of valid sources reach `READY` without exceptional intervention and the rest are isolated with reasons; 100% of required pages and audio are accounted for or rejected; 100% of accepted raw objects are deleted and verified, with zero premature deletions; spend stays inside the cap.

### 7.1 Job graph

One workflow per source version:

`VALIDATE -> STORE/CONFIRM_RAW -> INSPECT -> EXTRACT_OR_TRANSCRIBE -> NORMALIZE -> VERIFY_PROCESSED -> DELETE_RAW -> CHUNK -> EMBED -> INDEX_CHECK -> MARK_READY`

Optional branches: `OCR_PAGE_RANGE` from extraction for low-text pages; `TAG_PROFESSOR_INSIGHTS` after normalization; `NEEDS_REVIEW` as a terminal exceptional state when automatic thresholds fail. Job states are `PENDING`, `RUNNING`, `RETRY_WAIT`, `SUCCEEDED`, `FAILED` and `CANCELLED`, validated in one shared database function.

### 7.2 Claiming and retry rules

- Claim atomically with `FOR UPDATE SKIP LOCKED` or the selected queue's equivalent; set `lease_owner`, `lease_expires_at` and the attempt record before work.
- Heartbeat long OCR and transcription jobs; reclaim expired leases automatically.
- Retry network errors, timeouts and rate limits with bounded exponential backoff and jitter.
- Treat unsupported or corrupt files, denied rights and impossible quality checks as terminal until a source or admin correction.
- Check for an existing successful output by idempotency key and content hash before every provider call.
- Store provider request IDs and reconcile an uncertain timeout before paying for a repeat call where the provider allows it.

### 7.3 PDF and book processing

1. Validate type from file content, not the filename.
2. Reject encrypted or unsupported files with an actionable status.
3. Record page count and checksum.
4. Extract native text page by page and calculate text density and anomalies per page.
5. Route only low-text or garbled pages to OCR.
6. Preserve heading hierarchy, lists, table meaning, equations, captions and recoverable diagram descriptions.
7. Normalize repeated headers/footers and broken hyphenation without changing meaning.
8. Write Markdown (or the D-10 equivalent) and the locator sidecar incrementally to temporary processed output.
9. Verify every page is represented, explicitly blank or rejected with a reason; finalize atomically and checksum.

Never drop diagrams or tables to save bytes. When their meaning cannot be converted automatically, mark the page or source for exception review instead of claiming complete processing.

### 7.4 Audio and professor voice notes

1. Inspect codec, duration, channels, sample rate and corruption; reject over-limit duration before cost.
2. Normalize audio temporarily only when the transcription provider needs it.
3. Transcribe the entire duration, in overlapping chunks if needed, and merge without duplicate or missing boundary text.
4. Keep timestamp ranges and confidence; detect English/Arabic mixing and keep technical terms.
5. Check terminology against the unit's configured vocabulary.
6. Tag professor hints, exam emphasis, corrections, exclusions and likely questions with segment and time evidence; never turn a hint into a guarantee.
7. Verify accounted duration against the original within the §2.3 tolerance.
8. Persist the transcript and delete every temporary chunk after finalization.

### 7.5 Processed-output verification

All applicable checks pass before raw deletion can be enqueued: the processed object exists and is readable; its checksum matches; page/audio coverage meets policy; the non-empty threshold passes; locator ranges are within bounds; the terminology sample passes or is flagged; no secret or patient identifier appears in diagnostics; no duplicate final processed document exists; the quality report is persisted.

### 7.6 Raw deletion

1. Lock the raw-object row and re-verify processed acceptance and the absence of a hold.
2. Request deletion with the exact stored provider key.
3. Verify absence through provider metadata or listing.
4. Append the attempt, result and verification event.
5. Clear unusable access URL fields; keep provider, former key fingerprint, checksum, size and timestamps.
6. Mark `DELETED_VERIFIED` only after absence is confirmed; retry automatically when deletion or verification is uncertain.
7. Open a high-priority incident when the deadline passes. Never report a source as fully optimized while raw status is unresolved.

### 7.7 Chunking and embeddings

Chunk by headings and semantic units with controlled overlap only where context needs it; keep chunks within the configured token range; keep tables, definitions, question/answer blocks and professor statements coherent; de-duplicate within the source and unit without erasing legitimate repetition; embed in batches; record configuration, version and dimensions; never compare vectors from incompatible models; re-embed only when content or configuration changes; index source-format and professor-hint metadata alongside the unified pool.

### 7.8 Readiness decision

Mark `READY` only if: rights permit student use; processed verification passed; raw deletion is verified or an approved hold exists; required segments exist; every active segment has the current embedding configuration; the retrieval smoke test returns the expected known terms; and no blocker-level quality issue exists. Publishing and cohort unlock stay separate governance actions.

### 7.9 Fault and idempotency properties

After a failure at any step and a rerun: one source version and one finalized processed document exist; raw data is never deleted before verification; deletion retries never touch processed data; segment and embedding counts stay stable; no provider call repeats when a completed result is known; expired leases recover without double finalization; a terminal bad source does not stop other sources; reconciliation moves stale recoverable work forward.

## 8. Work package 5: Retrieval evaluation before chat

**Outcome:** authorized hybrid retrieval and deterministic evidence classification meet frozen quality, leakage, latency and cost gates on the real Cohort A corpus before any generative chat is enabled.

**Primary artifacts:** `src/lib/rag/`, retrieval functions in `supabase/migrations/`, `evals/runners/`, `evals/reports/` and `evidence/wp05-retrieval/`.

### 8.0 Tasks

#### WP05-T01 — Build the evaluation runner first

**Depends on:** WP00-T05, WP04-T12. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Load the frozen manifest and JSONL, validate hashes, schema and counts, and refuse an unreviewed or modified dataset.
- [ ] Reset and seed the exact source scope the suite references; record the active source, embedding and chunking versions.
- [ ] Run cases deterministically where possible; store case-level JSONL plus aggregate Markdown and JSON.
- [ ] Record returned IDs, component scores, classification reasons, authorization scope, latency, provider units, configuration and correlation ID per case (§8.4).
- [ ] Calculate recall@k, MRR, the class confusion matrix, conflict and hint metrics, leakage count, p50/p95 and cost.

**Verify:** `pnpm test:eval` on the synthetic suite; a modified dataset is refused.

**Pass:** the runner reproduces identical results on two runs of the synthetic suite and refuses tampered input.

#### WP05-T02 — Implement query normalization as an auditable step

**Depends on:** WP05-T01. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Keep the original query and create a separate normalized search form.
- [ ] Normalize Unicode, Arabic letter and diacritic variants, whitespace and configured spelling aliases conservatively.
- [ ] Preserve English medical/veterinary terms and numbers.
- [ ] Test that normalization never changes intended entities or broadens scope.

**Verify:** normalization unit tests in Arabic, English and mixed text.

**Pass:** every normalization fixture keeps its entities and numbers; the original query is always retained.

#### WP05-T03 — Implement filtered hybrid retrieval

**Depends on:** WP05-T02, WP04-T10. **Decision gates:** none. **Protected:** RLS and migrations (retrieval function changes). **Material UI:** no. **Real money:** query embeddings through the budget guard once real (WP04-T15).

- [ ] Revalidate user, session, cohort and unit before embedding or querying (§8.1).
- [ ] Run full-text and vector branches concurrently with identical active-scope filters applied inside each branch before the limit (§8.2).
- [ ] Order the vector branch by its distance expression so the index is used.
- [ ] Merge by segment ID with a versioned fusion formula; keep raw component scores for evaluation.
- [ ] Remove near-duplicates, diversify sources, keep adjacent context only when justified, and boost tagged evidence only for a matching intent.
- [ ] Enforce maximum results and evidence tokens; keep internal diagnostics out of student responses.

**Verify:** `database-ci` retrieval and plan tests; runner on the synthetic suite; independent review.

**Pass:** retrieval returns only active authorized segments with the intended query plan; component scores are recorded for every case.

#### WP05-T04 — Calibrate evidence classification without generation

**Depends on:** WP05-T03. **Decision gates:** none; a model-based conflict check needs D-04 and the budget guard. **Protected:** none. **Material UI:** no. **Real money:** only if the chosen conflict method calls a model.

- [ ] Implement supported, partial, unavailable and conflict signals with reason codes as versioned code and configuration (§8.3).
- [ ] Decide and record in an ADR how conflicts are found at query time: annotated conflict pairs, contradiction signals between retrieved segments, a model check, or a combination; include cost per query and failure behaviour.
- [ ] Tune thresholds only on a calibration split; report final numbers on a held-out split.
- [ ] Require coverage of each requested part, not one high vector score.
- [ ] Return both evidence groups for a detected conflict.
- [ ] Prohibit any later generator from upgrading `UNAVAILABLE` or filling missing `PARTIAL` points.

**Verify:** runner on calibration and held-out splits.

**Pass:** classification metrics on the held-out split are reported; the conflict method and its cost are recorded.

#### WP05-T05 — Prove isolation before ranking quality

**Depends on:** WP05-T03. **Decision gates:** none. **Protected:** RLS. **Material UI:** no. **Real money:** no.

- [ ] Add canary segments to other users, cohorts, units and programs, inactive sources, an old curriculum edition and revoked-rights scope.
- [ ] Attack through the database function, the server service and HTTP with forged filters.
- [ ] Fail the whole gate on one cross-scope result, whatever the ranking metrics say.

**Verify:** security suite and `database-ci`.

**Pass:** zero cross-scope results across every path.

#### WP05-T06 — Establish and approve the baseline

**Depends on:** WP05-T04, WP05-T05, WP04-T20, WP00-T20. **Decision gates:** none beyond the signed suite. **Protected:** none. **Material UI:** no. **Real money:** yes, query embeddings inside the approved caps.

- [ ] Run exact vector search and candidate HNSW settings on the real Cohort A suite.
- [ ] Inspect false negatives, false positives, Arabic/English misses, hint misses, conflict misses and slow queries case by case.
- [ ] Change one retrieval variable at a time and record before/after numbers.
- [ ] Freeze the accepted configuration with its version and the dataset hash.
- [ ] The reviewer approves numeric targets for recall@k and MRR and the retrieval latency budget (derived from the chat first-token target); "reasonable results" is not a target.
- [ ] Make this suite a required step before any retrieval, chunking or embedding change is promoted to Beta (implementation rule 18).

**Verify:** the runner report `evidence/wp05-retrieval/<date>_retrieval-baseline_beta_<sha>.md`.

**Pass:** zero unauthorized retrieval; at least 95% correct unavailable classification; 100% of known conflicts return both positions' evidence; at least 95% of direct professor-hint cases retrieve the tagged evidence; the approved recall, MRR and latency targets are met; cost fits the 100-student plan.

### 8.1 Authorized retrieval interface

One server-only interface takes the authenticated user ID, cohort ID, unit ID, normalized query, optional topic filter, result limit and correlation ID. It returns segment ID, source-version ID, source title and format, content, score components, heading path, a reliable locator when present, and tags. It revalidates availability and membership. No unrestricted vector or full-text query is exposed to the client.

### 8.2 Hybrid retrieval sequence

1. Validate access and active source versions.
2. Normalize Arabic/English variants without replacing the original query.
3. Embed the query with the active configuration.
4. Run vector and full-text searches concurrently, each filtering by authorization and source status before its limit.
5. Merge by segment ID and normalize scores; remove near-duplicates.
6. Rerank by semantic score, keyword match, heading match, source diversity and a direct professor-hint match when the question asks about professor or exam emphasis.
7. Cap evidence from one source while keeping needed continuity; return a compact evidence set and diagnostics.

### 8.3 Evidence classification signals

Direct topic/heading match; required-term coverage; multi-part coverage; number of independent non-duplicate segments; score threshold and gap; known or detected contradiction; missing requested entity or topic. The result is `SUPPORTED`, `PARTIAL`, `UNAVAILABLE` or `CONFLICT` with reasons. The generator may never upgrade `UNAVAILABLE`.

### 8.4 Evaluation record per case

Authorized scope and active source versions; returned segment and source IDs with score components; expected evidence hit or miss; cross-scope result count; professor-hint tag hit when required; classification result; latency and embedding/provider cost.

## 9. Work package 6: Strict-RAG subject chat

**Outcome:** in the real Chat screen, the student receives a streamed, source-grounded answer or an explicit partial, unavailable, conflict or safety result; an invalid factual draft is never committed or shown as accepted.

**Primary artifacts:** `src/lib/rag/`, `src/lib/safety/`, `src/lib/usage/`, the chat Route Handler, `workers/generation/`, the shared Chat screen, and `evidence/wp06-chat/`.

### 9.0 Tasks

#### WP06-T01 — Freeze contracts and policy versions

**Depends on:** WP05-T06. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** yes if the validator measurement calls a model, inside caps.

**Outputs:** Zod schemas; versioned policy files; the claim-validator ADR with its measurement.

- [ ] Define Zod schemas for the request, retrieval packet, generator draft, validated answer, stream events, persisted message and error response (§9.4).
- [ ] Version the tutor policy, safety classifier, evidence classifier, prompt template, claim validator and model configuration independently.
- [ ] Write standard Arabic/English copy for unavailable, partial, conflict, allowance/capacity, provider outage and real-patient boundary states.
- [ ] Choose the claim-validation method in an ADR (deterministic overlap, an entailment model, a model judge, or a combination) and measure it on the WP00-T20 labeled claim set: report how often it accepts an unsupported claim and rejects a supported one, and its cost and latency per answer. The target is zero accepted unsupported claims on the labeled set; any miss is a recorded risk that the WP06-T08 academic review must cover.
- [ ] Add contract fixtures for every result type and for malformed model output.

**Verify:** contract tests; the validator measurement report.

**Pass:** every result type has a schema and fixture; the validator's false-accept and false-reject rates, cost and latency are recorded in the ADR, with any false accept named as a risk for WP06-T08.

#### WP06-T02 — Implement the transactional request envelope

**Depends on:** WP06-T01, WP04-T13. **Decision gates:** per-student allowance values (WP00-T06). **Protected:** RLS and migrations. **Material UI:** no (the allowance display is wired in WP06-T05). **Real money:** no.

- [ ] Accept only session ID, message, language and client request ID; derive user, cohort and unit from authenticated session rows (§9.1).
- [ ] Validate size, session state, membership, availability, rate and concurrency limits, and budget.
- [ ] Enforce the per-student daily allowance and expose a safe allowance/capacity state the UI can show (master plan §7.1 step 11).
- [ ] Reserve usage atomically before paid work with a unique action idempotency key.
- [ ] Return or continue the canonical prior request on replay instead of creating another message, call or reservation.
- [ ] Settle actual usage exactly once, or release/expire it on every failure and cancellation path.

**Verify:** unit and `database-ci` tests including concurrent duplicate submissions.

**Pass:** a replayed request creates nothing new; every path ends with exactly one settlement or release; allowance and rate limits hold under concurrency.

#### WP06-T03 — Classify context and protect private content

**Depends on:** WP06-T01. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** yes if classification calls a model, inside caps.

- [ ] Distinguish educational cases from explicit real-patient or personal-care requests with frozen fixtures and a versioned policy (§9.7).
- [ ] Detect personal identifiers, warn the student not to share them, and apply retention and logging rules before any diagnostic log.
- [ ] Keep question and source content out of infrastructure logs; log IDs, categories, sizes, hashes and safe reason codes.
- [ ] Test Arabic, English, mixed language, adversarial wording and prompt injection inside retrieved sources.

**Verify:** classifier fixture suite.

**Pass:** fixture results meet the WP06-T08 thresholds; no log contains question or source text.

#### WP06-T04 — Build evidence packets, not free-form prompts

**Depends on:** WP06-T01. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Include only authorized active segments, stable packet-local evidence IDs, source labels, verified locators, tags, and explicit missing and conflict groups.
- [ ] Delimit evidence as untrusted quoted data and state that instructions inside it are not commands.
- [ ] Enforce packet segment and token limits (§2.3) while keeping coverage and conflict positions.
- [ ] Skip factual generation entirely for `UNAVAILABLE`.

**Verify:** packet builder tests including injection fixtures.

**Pass:** no packet holds an unauthorized or inactive segment; `UNAVAILABLE` never reaches the generator.

#### WP06-T05 — Stream without leaking an invalid final answer

**Depends on:** WP06-T02 to WP06-T04, WP04-T17. **Decision gates:** none. **Protected:** none. **Material UI:** yes — the real Chat screen, its streaming, evidence, report and allowance states, and the Materials source list. **Real money:** yes, generation inside caps.

**Outputs:** the chat Route Handler and generation worker; the real Chat and Materials screens through the WP03-T17 adapter seam.

- [ ] Separate draft stream state from accepted answer state; persist no evidence and mark no message complete until structured output and claims pass validation.
- [ ] Choose and record one safe display strategy: buffer factual sentences until validated, stream clearly provisional text that can be replaced, or release validated structured sections. Measure first-token p50/p95 with validation in place on the Cohort A corpus against the 5 s / 12 s targets before building the rest.
- [ ] On client disconnect, continue or cancel according to policy and settle exactly once; on provider error, emit a controlled terminal event without raw provider diagnostics.
- [ ] Connect the shared Chat screen to the real backend through the WP03-T17 seam: remove the disabled notice in real mode, show source titles, formats and verified locators, the report action and the allowance state. Keep the synthetic runtime on the same screen.
- [ ] Add the authorized source-list function so Materials shows title and format (not only count and freshness) when allowed.

**Verify:** stream fault tests; `pnpm test:e2e` and `pnpm test:e2e:demo`; latency measurement report; frontend floor; founder review of the rendered candidate.

**Pass:** an invalid draft is never displayed as accepted; measured first-token latency is reported against the target; the real and synthetic Chat render the same components; `Approved commit:` recorded.

#### WP06-T06 — Validate every accepted factual component

**Depends on:** WP06-T05. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** yes if the validator calls a model, inside caps.

- [ ] Reject packet-unknown evidence IDs, wrong scope, version or state, invented quotes, locators or titles, and unsupported sentences (§9.5).
- [ ] Validate missing-point and conflict structures separately.
- [ ] Require every professor label to map to a tagged span.
- [ ] Return a grounded fallback or unavailable result on failure; never only strip citations from unsupported text.
- [ ] Persist the final answer and its evidence links in one transaction.

**Verify:** validator fixtures including invented locators and cross-scope IDs.

**Pass:** every invalid fixture is rejected or replaced by a fallback; accepted answers always have evidence links.

#### WP06-T07 — Implement retention and reporting lifecycle

**Depends on:** WP06-T06. **Decision gates:** D-08 (and D-19 for real values). **Protected:** RLS and migrations. **Material UI:** yes — the private/no-sharing control in Settings and the report flow. **Real money:** no.

- [?] D-08 approved, including the misuse-detection categories and thresholds and the review window. OWNER INPUT REQUIRED.
- [ ] `NO_SAVE`: delete content after the approved technical window, keeping only minimal non-content security and usage data.
- [ ] Saved sessions: owner list, read and delete; default audited founder visibility with clear student disclosure; a time-effective private/no-sharing preference in Settings.
- [ ] Reports, consent or an approved automated misuse flag snapshot only the permitted exchange with policy, model and source versions, evidence, reason and review expiry.
- [ ] Under private mode, admin review reaches only reported, consented or qualifying flagged cases; every access to chat content is audited in every mode.
- [ ] Implement automated misuse detection only with the approved versioned categories and thresholds.
- [ ] Test deletion, expiry, report-before-expiry, consent withdrawal and what backups keep.

**Verify:** `database-ci` retention and access tests; E2E for the Settings control and report flow; founder review of the rendered candidate.

**Pass:** every retention mode behaves as D-08 says; every founder access to chat content leaves an audit row.

#### WP06-T08 — Run frozen, fault, and browser gates

**Depends on:** WP06-T07. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** yes, inside caps.

- [ ] Run every supported, partial, unavailable, conflict, hint, safety and injection case of the signed suite.
- [ ] Kill the client stream, the generation worker and the provider response at defined points; replay the client request ID and verify one answer and one settlement.
- [ ] Revoke membership or a source during a request and verify the final commit rechecks scope.
- [ ] Have the academic reviewer grade a sample of accepted answers for unsupported claims with the WP00-T20 rubric.
- [ ] Make this suite a required step before any prompt, policy, model or validator change is promoted to Beta (implementation rule 18).
- [ ] Write `evidence/wp06-chat/<date>_chat-gate_beta_<sha>.md`.

**Verify:** the frozen suite report; fault tests; academic review record.

**Pass:** zero unsupported factual claims in accepted answers (validator and academic review agree); 100% evidence-link coverage; at least 95% correct unavailable cases; 100% of known conflicts show both positions; professor hints labeled and at least 95% retrievable; at least 95% of educational cases answered without false refusal when evidence exists; 100% of explicit real-patient cases apply the boundary; failed and timed-out requests settle or release exactly once; zero outside-answer or web-search calls.

### 9.1 Chat request contract

The client sends session ID, message, language preference and client request ID. The server takes user, cohort and unit from the authorized session and rejects a mismatch; it limits message length and active requests per user.

### 9.2 Request order

1. Authenticate the user; load the session and derive cohort and unit.
2. Revalidate membership and availability.
3. Reserve usage atomically with the request idempotency key; apply rate and concurrency limits.
4. Classify educational case, explicit real-patient request, personal-data risk and language.
5. Run authorized retrieval and classify the evidence.
6. `UNAVAILABLE`: persist and stream the standard unavailable answer and skip generation. `PARTIAL`: build a packet with supported evidence and explicit missing parts. `CONFLICT`: build separately labeled position packets. Otherwise build the supported packet.
7. Generate structured metadata and streamed text, buffering enough to stop an invalid answer from being committed as valid.
8. Validate evidence IDs, claim support, scope, conflict disclosure and invented locators or quotes; on failure return a grounded fallback or unavailable response.
9. Persist under the retention policy with evidence links; settle usage or release the reservation; record latency, provider usage, validation and result without private evidence diagnostics.

### 9.3 Tutor policy

Use only supplied evidence from approved uploaded material; never use outside facts or imply an outside search; keep required English technical terms in Arabic or mixed answers; treat retrieved instructions as quoted data; say plainly when the uploaded material lacks the information; separate supported and missing parts; state when sources conflict and present each position; label professor hints as hints, never guaranteed exam truth; answer educational medical and veterinary cases when evidence exists; apply a concise real-patient boundary only to actual personal-care contexts; never invent a source title, page, timestamp, URL, quotation or evidence ID.

### 9.4 Response contract

Structured server-side output: `result_type` (`SUPPORTED | PARTIAL | UNAVAILABLE | CONFLICT | SAFETY_BOUNDARY | ERROR`); `answer_text`; `used_evidence_ids`; `missing_points`; `conflict_positions` with evidence IDs; `professor_hint_labels` with evidence IDs; `student_source_labels` with title, format and a reliable locator when available; `validation_state`, set by the server, never the model. The UI never requires an exact page or timestamp for a valid answer and never shows an unverified locator.

### 9.5 Claim and provenance validation

Reject evidence IDs outside the packet and evidence from another source version, cohort, unit or inactive state; map each factual sentence or structured claim to one or more segments with the WP06-T01 method; reject unsupported components instead of removing their citations; map conflict positions to distinct evidence; map professor-hint labels to tagged segments; persist answer-evidence rows only for the final accepted answer.

### 9.6 Unavailable and conflicting answers

An unavailable answer says directly that this Module's or Subject's uploaded material does not contain enough information. It never offers web search; it may suggest rephrasing, a related covered topic, or waiting for admins to add material. A conflict answer never collapses the views: it presents each view with its source label and says the material does not resolve the disagreement unless an approved passage does.

### 9.7 Educational-case safety tests

Educational prompts with diagnosis, differentials, medications, dose calculations, procedures, emergency algorithms and management plans get answers when supported. Explicit statements such as "this is happening to me now", identifiable patient details or urgent real-life treatment requests get the approved boundary without outside medical claims; under no-save retention, log the policy category, never the patient content.

## 10. Work package 7: Studio and quiz

**Outcome:** in the real Studio and Quiz screens, every artifact and quiz item is durable, authorized, source-grounded, validated, invalidated when sources change, and settled exactly once.

**Primary artifacts:** `src/lib/studio/`, `src/lib/quiz/`, `workers/generation/`, the shared Studio and Quiz screens, and `evidence/wp07-studio/`.

### 10.0 Tasks

#### WP07-T01 — Define one artifact envelope and typed payloads

**Depends on:** WP06-T08. **Decision gates:** none; visible quiz behaviour (option count, timing, difficulty) is confirmed by a founder. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Create a common envelope with artifact and request IDs, type, language, normalized parameters, scope hash, policy/model/validator versions, status, evidence map and validation issues.
- [ ] Create versioned schemas for summary, study guide, practice questions, flashcards, MCQs and the topic-focused revision pack (§10.2 to §10.5).
- [ ] Fix the quiz parameters the founders already asked for in WP03-T13 (configurable item count, difficulty and timing) and the MCQ option count within §10.5; record them in §2.3.
- [ ] Reject unknown fields and invalid structures at the worker boundary; keep a malformed draft only in restricted diagnostics if policy allows.

**Verify:** schema tests with valid and invalid fixtures per type.

**Pass:** every artifact type has a schema and fixtures; the quiz parameters are recorded and founder-confirmed.

#### WP07-T02 — Implement durable request and safe cache lookup

**Depends on:** WP07-T01. **Decision gates:** none. **Protected:** RLS and migrations. **Material UI:** no. **Real money:** no.

- [ ] Canonicalize parameters and compute the cache key from authorized active source versions, policy/model/validator, type, language and parameters.
- [ ] Revalidate the requester's current access to every cached evidence segment before reuse.
- [ ] Enforce the per-student Studio allowance and artifact size limits (§2.3); reserve usage and create the durable request in one transaction.
- [ ] Return the canonical artifact or request on a duplicate idempotency key.
- [ ] Run generation in the worker; the browser never controls completion.

**Verify:** `database-ci` cache-authorization and idempotency tests.

**Pass:** a cached artifact is never served to a caller who lacks access to any of its evidence; duplicates create nothing new.

#### WP07-T03 — Generate and validate by artifact type

**Depends on:** WP07-T02. **Decision gates:** none. **Protected:** none. **Material UI:** yes — the real Studio screen. **Real money:** yes, generation inside caps.

- [ ] Retrieve through the same authorized unit service as chat.
- [ ] Represent partial coverage and conflicts explicitly; never label an incomplete artifact comprehensive.
- [ ] Map every factual section, item, answer and rationale to evidence; validate with the WP06-T01 method.
- [ ] Reject duplicate or near-duplicate questions and cards and ambiguous wording; for MCQs require the §10.5 rules.
- [ ] Keep original-exam content disabled unless the individual source permission explicitly allows it.
- [ ] Connect the shared Studio screen to the real backend through the WP03-T17 seam: request, progress, completed, failed, partial and stale states; keep the synthetic runtime on the same screen.

**Verify:** artifact fixture suite; E2E real and demo; frontend floor; founder review of the rendered candidate.

**Pass:** every artifact type completes inside the subject Studio with evidence links; unsupported content is rejected; `Approved commit:` recorded.

#### WP07-T04 — Implement quiz lifecycle server-side

**Depends on:** WP07-T03. **Decision gates:** none. **Protected:** RLS and migrations. **Material UI:** yes — the real Quiz and review screens. **Real money:** no.

- [ ] Start attempts from an authorized current artifact; store item order and options for stable review (§10.6).
- [ ] Keep answer keys server-side before submission.
- [ ] Save responses idempotently, enforce server timestamps and timer rules, and score on the server.
- [ ] Make final submission idempotent and immutable except through a separately audited correction policy.
- [ ] Keep historical attempts when the source or artifact later goes stale, with the current availability labelled.
- [ ] Derive weak-topic signals from scored attempts by topic tag and show them in review (master plan Phase 4).
- [ ] Connect the shared Quiz and review screens to the real backend through the WP03-T17 seam.

**Verify:** `database-ci` attempt and scoring tests; E2E for timed and untimed attempts; founder review.

**Pass:** one score per submission, answer keys never reach the client before submission, weak topics appear in review, `Approved commit:` recorded.

#### WP07-T05 — Invalidate safely on scope change

**Depends on:** WP07-T04. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Recompute scope hashes on source activation, deactivation or replacement, rights revocation, embedding or policy change, and corrected evidence (§10.7).
- [ ] Hide or mark stale artifacts in current study views without deleting historical evidence or attempts.
- [ ] Cancel queued requests whose authorization or scope is no longer valid and release their reservations.
- [ ] Let students report an artifact or a quiz item (wrong, unsupported, unclear) through the same reporting lifecycle as chat (WP06-T07).
- [ ] Test a change during generation, during a quiz and after submission.

**Verify:** invalidation and reporting tests.

**Pass:** no stale artifact is shown as current; reports reach the admin queue with their evidence snapshot.

#### WP07-T06 — Run artifact and quiz gates

**Depends on:** WP07-T05. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** yes, inside caps.

- [ ] Run every frozen artifact case in supported and insufficient scope.
- [ ] Validate claim and item provenance coverage; have the academic reviewer grade a sample with the WP00-T20 rubric.
- [ ] Race duplicate requests and duplicate final quiz submissions.
- [ ] Attempt cache access from another user, cohort or unit and after membership or source revocation.
- [ ] Verify timed and untimed scoring, answer-key secrecy, grounded review, settlement, retry and invalidation.
- [ ] Write `evidence/wp07-studio/<date>_studio-gate_beta_<sha>.md`.

**Verify:** the frozen artifact suite report.

**Pass:** every artifact type completes inside the subject Studio; 100% internal provenance on accepted artifacts; zero unsupported accepted claims, answers or explanations; conflicts and hints labelled; one score per quiz; no duplicate artifact or settlement.

### 10.1 Studio request flow

1. The student opens Studio inside an authorized unit and picks type, topic or all material, language, depth and size.
2. The server revalidates scope, computes the active source-scope hash and checks the safe cache.
3. With no authorized valid artifact, it reserves usage and creates a durable request.
4. The worker retrieves from the same strict unit pool, returns an unavailable or partial state or generates the structured artifact.
5. The validator checks every factual claim, answer, explanation and conflict; accepted artifacts store evidence links; rejected ones retry within the limit or fail explicitly.
6. Usage settles exactly once and the UI receives the completed or failed state.

### 10.2 Summary and revision-pack contracts

A summary has title, scope, learning objectives, structured sections, high-yield points, professor hints, conflicts and missing areas; every factual bullet links to evidence; it never claims full coverage when the pool is partial. A revision pack is topic-focused: the chosen topic's key points, professor emphasis, a short self-test drawn from the practice-question contract, conflicts and uncovered areas, all evidence-linked.

### 10.3 Study-guide contract

Ordered learning path, key concepts, definitions, relationships, common confusions supported by the material, professor emphasis, self-check prompts, conflicts and uncovered areas. No generic study facts absent from the pool.

### 10.4 Practice questions and flashcards

A practice question stores prompt, expected answer, explanation, difficulty, topic tags, evidence and validation state. A flashcard stores an independently understandable front and back, optional explanation, difficulty, tags, evidence and validation. Reject duplicates, ambiguous pronouns, unsupported answers, questions answerable only from outside knowledge and cards that leak the answer.

### 10.5 MCQ contract

Stable item key; origin `GENERATED` or permitted `ORIGINAL_EXAM`; stem; four or five unique options; exactly one correct option in single-best-answer mode; explanation of the correct answer; per-option rationale; difficulty and topic tags; evidence IDs for the answer and rationales; a professor-hint label only when directly supported; validation result. Reject multiple plausible answers, duplicate options, unsupported rationales, contradictions, cross-unit topics, malformed structure, near-duplicate items and original exam content without permission metadata.

### 10.6 Quiz state machine

`CREATED -> IN_PROGRESS -> SUBMITTED -> SCORED`, with `ABANDONED` on expiry. The server controls start and submission timestamps and calculates the score; answer keys stay hidden before submission; final submission is idempotent; selected answers, correctness and the review payload are stored.

### 10.7 Invalidation

When a source version is deactivated or replaced: recompute active scope hashes; hide or mark stale artifacts whose evidence is no longer active; keep historical attempts and evidence references for audit; never show a stale artifact as current.

## 11. Work package 8: Operations and zero-manual automation

**Outcome:** web, workers, scheduler, alerts, email, backup/restore and incidents run without a founder computer or routine database intervention; failures recover or isolate automatically; the beta is threat-modelled and its success signals are measurable.

**Primary artifacts:** `docs/operations/`, `src/lib/observability/`, `workers/reconciliation/`, the admin resource screens, `docs/runbooks/` and `evidence/wp08-operations/`.

### 11.0 Tasks

#### WP08-T01 — Write deployment topology and ownership

**Depends on:** WP04-T17, WP06-T05. **Decision gates:** none (D-17 approved in WP04-T17). **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Create `docs/operations/topology.md` naming web, ingestion worker, generation worker, reconciliation scheduler, database, queue, raw/processed storage, monitoring, email and notification boundaries.
- [ ] Record for each component: deployment artifact, region, runtime/size, concurrency, health endpoint, scaling control, secret scope, log destination, owner and monthly cost.
- [ ] Prove the full Preview and Beta topology keeps running with Ahmed's and Ziad's computers off.
- [ ] Keep PostgreSQL the workflow authority even with an external queue or orchestrator.

**Verify:** topology review against deployed state.

**Pass:** every running component is listed with its owner and cost; none depends on a founder computer.

#### WP08-T02 — Deploy health, metrics, logs, and traces

**Depends on:** WP08-T01. **Decision gates:** none; a paid error-reporting service is a money stop. **Protected:** production configuration. **Material UI:** no. **Real money:** only if a paid service is chosen.

- [ ] Extend the WP04-T02 structured logs with timestamp, environment, release, component, correlation/request/job/provider IDs, safe event, duration, outcome and error code.
- [ ] Separate liveness from readiness; readiness checks dependencies with timeouts.
- [ ] Track request rate, errors and duration, first-token time, queue age and depth, job outcomes and retries, lease expiry, provider latency, errors and cost, raw-deletion age, retrieval quality, validation failures, reservations, budgets, database and storage capacity, and reconciliation outcomes.
- [ ] Choose an error-reporting destination at zero cost or stop for a money decision; test redaction of secrets, authorization headers, signed URLs, source content and chat content.

**Verify:** metric and redaction tests; a dashboard screenshot as supplemental evidence.

**Pass:** every listed signal is visible per environment; redaction tests pass.

#### WP08-T03 — Implement schedules as idempotent jobs

**Depends on:** WP08-T01, WP04-T11. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Create one named job per §11.2 schedule with its query, batch limit, timeout, lock, retry, metric and incident threshold.
- [ ] Prevent overlapping runs with an advisory lock or a durable scheduler claim; paginate large scans.
- [ ] Test a skipped run, duplicate invocation, partial failure, long run and clock or time-zone boundaries.

**Verify:** schedule tests; job history in Preview.

**Pass:** every schedule runs on time in Preview, never overlaps and is safe to repeat.

#### WP08-T04 — Build least-privilege admin operations

**Depends on:** WP08-T02. **Decision gates:** none. **Protected:** RLS. **Material UI:** yes — the admin resource screens connected to real data. **Real money:** no.

- [ ] Connect the §11.3 dashboards to safe summary views and services, replacing synthetic fixtures in real mode.
- [ ] Replace arbitrary edit or replay controls with audited typed actions and precondition checks.
- [ ] Require a reason and confirmation for source deactivation, cohort lock, raw hold, replay after terminal correction and provider or feature enablement.
- [ ] Show operator-safe details; keep sensitive provider, raw and chat evidence behind stricter access and audit.

**Verify:** E2E for each dashboard and action; forbidden-role tests; founder review.

**Pass:** an admin can follow any source from receipt to `READY` or failure, and act on it, without SQL; `Approved commit:` recorded.

#### WP08-T05 — Implement alert routing and automatic controls

**Depends on:** WP08-T02, WP04-T13. **Decision gates:** none; this task resolves D-20 (alert channels) and D-26 (transactional email). **Protected:** production configuration. **Material UI:** no. **Real money:** yes if a paid sender or channel is chosen.

- [ ] Prepare D-20 and D-26: decision records for the alert and incident channels, and for the sender of Auth emails and Batch Leader links (if D-24 uses email), with sending limits, deliverability, data handling and cost.
- [ ] Obtain Ahmed's and Ziad's approval of D-20 and D-26 (this step becomes `[?]` while it waits).
- [ ] Create `docs/operations/alert-catalog.md` with signal, query, severity, threshold and window, dedup key, recipients, automatic action, acknowledgment, escalation and runbook link.
- [ ] Deliver budget events at 50/75/90/100% and every §11.4 alert through the approved channel; test each with synthetic events, including delivery failure.
- [ ] Configure custom SMTP for Beta Auth emails on a sending domain with SPF and DKIM; test verification, recovery and link delivery; keep the built-in sender for synthetic Preview only.
- [ ] Make budget and provider circuit controls atomic and immediate for new reservations and claims, without corrupting accepted jobs.
- [ ] Group, de-duplicate and send recovery notices without hiding continued failure.

**Verify:** alert delivery tests; a real verification email received through the Beta sender.

**Pass:** every catalogued alert reaches its recipient; Auth emails deliver reliably at the beta's expected volume.

#### WP08-T06 — Back up and restore the complete durable system

**Depends on:** WP04-T18, WP07-T06. **Decision gates:** none. **Protected:** production configuration. **Material UI:** no. **Real money:** no new spend.

- [ ] Extend the WP04-T18 procedure to the complete system: database, processed objects, artifacts, chat retention, usage and audit.
- [ ] Reconnect or rebuild embeddings as the documented strategy says.
- [ ] Verify row counts and referential checks for catalog, access, sources, documents, segments, evidence, artifacts, usage, jobs and audit.
- [ ] Verify no expired raw object or deleted no-save content returns from backup.

**Verify:** a timed full restore rehearsal report.

**Pass:** the full restore succeeds with verified counts and nothing resurrected that policy deleted.

#### WP08-T07 — Write and exercise incident runbooks

**Depends on:** WP08-T05. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Copy [the incident template](../templates/incident-runbook.md) for every §11.6 incident, extending the four written in WP04-T19.
- [ ] Fill detection, severity, containment, evidence preservation, owner and escalation, communications, diagnosis, repair, replay, validation, recovery and follow-up.
- [ ] Run a tabletop for every runbook and hands-on drills for leakage, bad source, deletion failure, provider outage, stuck job, budget exhaustion, leaked secret, rights takedown and restore/re-index.
- [ ] Time detection, containment and recovery; record gaps as defects.

**Verify:** drill records with timings.

**Pass:** every §11.6 runbook exists and has been exercised.

#### WP08-T08 — Run the unattended proof

**Depends on:** WP08-T03 to WP08-T07. **Decision gates:** the observation window (§2.3) approved by a founder. **Protected:** none. **Material UI:** no. **Real money:** yes, small, inside caps.

- [ ] Start from a recorded candidate SHA and configuration fingerprint.
- [ ] Submit valid synthetic PDF, audio and Studio work; inject a transient provider failure, expire a lease, fail a deletion, fail a chat generation and kill one worker.
- [ ] Leave the system unattended for the approved window.
- [ ] Confirm recovery or isolation, correct alerts, stable idempotent counts, settled usage and no manual SQL or script.
- [ ] Write `evidence/wp08-operations/<date>_unattended_beta_<sha>.md` with a timestamped event timeline.

**Verify:** the event timeline and reconciliation report.

**Pass:** zero manual processing steps; every injected fault recovered or isolated automatically with the right alert.

#### WP08-T09 — Threat-model the beta and run the pre-beta security review

**Depends on:** WP08-T08, WP03-T35, WP03-T36. **Decision gates:** none. **Protected:** review only; any fix it triggers follows its own protected-path rules. **Material UI:** no. **Real money:** no.

- [ ] Write a threat model for the beta: assets, actors and trust boundaries for students, Batch Leaders (links or accounts), admins, workers, providers and storage.
- [ ] Review registration and recovery abuse, upload abuse (size, type, malware, storage exhaustion), prompt injection through sources, link-token leakage, RLS and grants, privileged module use, secrets handling, dependency audit and rate limits.
- [ ] Run `/security-review` or an equivalent independent review on the release candidate and fix or record every finding.

**Verify:** threat model document; review findings with dispositions.

**Pass:** no open high-severity finding; every accepted risk has a named founder decision.

#### WP08-T10 — Instrument the success signals

The master plan §12 signals had no measurement task (findings B7).

**Depends on:** WP06-T08, WP07-T06. **Decision gates:** D-08 privacy rules apply. **Protected:** RLS and migrations if new tables. **Material UI:** yes — an answer usefulness/trust rating. **Real money:** no.

- [ ] Define with the founders: activation (a useful chat, Studio artifact or quiz), 7-day return, "meaningful session", repeated value and the trust rating question.
- [ ] Derive activation, return and repeated value from existing records (sessions, answers, artifacts, attempts) without a third-party analytics service unless one is approved.
- [ ] Add a lightweight rating on answers (useful and trustworthy or not) that feeds the source-trust signal and never stores more chat content than D-08 allows.
- [ ] Report automation (share of valid sources READY without intervention) and cost per action, source and cohort from the job and usage ledgers.
- [ ] Show the signals in an admin report with per-cohort breakdown.

**Verify:** metric tests on synthetic activity; E2E for the rating; founder review.

**Pass:** every master plan §12 signal is computed from recorded data for a synthetic week of activity; `Approved commit:` recorded.

### 11.1 Always-on runtime

Deploy the stateless web application, the database job dispatcher or queue, the ingestion worker with job-type concurrency limits, the generation/Studio worker with separate limits, the scheduled reconciliation worker, and monitoring and error reporting. Nothing in this list runs on Ahmed's or Ziad's computer. If n8n is introduced, it runs on approved external infrastructure as an optional orchestrator with state and business logic kept in PostgreSQL and tested workers. A PC-hosted Telegram bot is noncritical test tooling on synthetic data only and satisfies no gate.

### 11.2 Reconciliation schedules

- Every 1–5 minutes: reclaim expired job leases and release timed-out interactive reservations.
- Every 15 minutes: retry eligible failed raw deletions and detect stuck workflows.
- Hourly: find READY sources missing active embeddings or segments, or with inconsistent raw state.
- Daily: verify budget counters, provider-cost totals, storage totals, deletion-deadline compliance, inactive memberships and failed notifications.
- Weekly: run the frozen retrieval, chat and Studio regressions inside the approved cost window and publish a report.

Intervals may change after measurement; the jobs and their owners stay explicit.

### 11.3 Admin dashboards

In order: cohort and unit readiness and release; campaign and Batch Leader submission status; source workflow timeline and quality report; raw storage and deletion compliance; job queue, retries, dead letters and replay; retrieval, chat and Studio evaluation results; usage, provider cost, budgets and rate-limit state; reported answers, artifacts and quiz items with controlled access; success signals (WP08-T10); incident timeline and audit trail. Every mutation is audited and calls a tested server or database operation.

### 11.4 Alerts and automatic controls

Alert on: raw deletion deadline exceeded; repeated provider failure or circuit opening; queue age above threshold; READY-state inconsistency; authorization or leakage test failure; unsupported-claim regression; budget at 50/75/90/100%; database or storage capacity threshold (including Free-plan limits); email delivery failure; backup or reconciliation failure. At the hard budget threshold, block optional new paid work and return a controlled capacity message without corrupting accepted work.

### 11.5 Backups and restore

Database backups suit beta risk; durable processed objects are backed up or versioned per policy; raw objects are never backed up beyond their window; restore is rehearsed into an isolated target that may hold the data it receives; catalog, memberships, source versions, segments, evidence, artifacts, ledger and audit are verified after restore; embeddings are rebuilt from processed documents if they are not backed up.

### 11.6 Incident runbooks

Unsupported or high-risk answer; cross-cohort or cross-user leakage suspicion; bad source publication; source rights takedown; incomplete processed text after raw deletion; premature raw deletion; raw deletion failure; provider outage or rate limit; stuck or duplicate job; usage reservation inconsistency; budget exhaustion; leaked secret or link token; email delivery outage; database restore and re-index. Each states the first action, what to disable, evidence to keep, owner, communications decision, repair, replay and regression test.

## 12. Work package 9: Cost and 100-student validation

**Outcome:** the minimum practical beta configuration meets the exact, reproducible 100-student scenario with zero leakage, lost work or duplicate accounting, and approved performance and cost.

**Primary artifacts:** `tests/load/`, `scripts/run-load-suite.ts`, `planning/load-profile-100-students.yaml` and `evidence/wp09-load-cost/`.

### 12.0 Tasks

#### WP09-T01 — Benchmark providers with a controlled matrix

Provider selection moved to WP04-T14. This task re-checks the selected providers at load scale.

**Depends on:** WP08-T08. **Decision gates:** D-05 caps for the load window. **Protected:** none. **Material UI:** no. **Real money:** yes — stop for fresh two-founder confirmation naming the load-test spend.

- [?] Load-test spend approved by Ahmed and Ziad. OWNER INPUT REQUIRED.
- [ ] Re-measure the selected providers' rate limits, concurrency, p50/p95 and cost at the load profile's peak rates, with the same fixtures and settings as WP04-T14.
- [ ] Confirm the fallback and disable strategy from the D-04 record works under load; update the D-04 record if a limit changes the plan.

**Verify:** provider load report.

**Pass:** the selected providers sustain the profile's peak within their limits, or the gap is recorded with the decision it needs.

#### WP09-T02 — Freeze infrastructure and test safety

**Depends on:** WP09-T01. **Decision gates:** none; any plan increase is a money stop. **Protected:** production configuration. **Material UI:** no. **Real money:** no new spend.

- [ ] Record the exact web, worker, database, queue and storage plans, regions, pooling, concurrency, limits, cache, provider quotas, flags and release SHA (§12.1); recheck the Free-plan allowances against the profile (§0.8).
- [ ] Provision only synthetic test users and content with canaries and a dedicated test prefix and scope.
- [ ] Make the load runner refuse Beta or production unless an explicit two-step opt-in and the approved abort thresholds are present.
- [ ] Reconcile baseline counts and budgets before starting.

**Verify:** the runner's refusal tests; the frozen configuration record.

**Pass:** the configuration is frozen and recorded; the runner cannot hit a protected target by accident.

#### WP09-T03 — Execute reproducibly

**Depends on:** WP09-T02. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** yes, inside the approved load spend.

- [ ] Run the warm-up and report it separately.
- [ ] Run the frozen realistic arrival-rate scenario, then the separate peak burst (§12.2).
- [ ] Overlap PDF and audio ingestion, provider slowdown, worker termination and database connection pressure exactly as specified.
- [ ] Abort automatically on leakage, budget, destructive error or environment-health thresholds.
- [ ] Keep load-tool output, the telemetry window, database plans and statistics, job events, the cost ledger and the configuration fingerprint.

**Verify:** the raw load reports.

**Pass:** every phase ran as specified or aborted on a defined threshold with the reason recorded.

#### WP09-T04 — Reconcile correctness after traffic

**Depends on:** WP09-T03. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Compare accepted requests with persisted terminal results.
- [ ] Verify zero lost accepted jobs, duplicate messages, artifacts, settlements or provider charges, negative or unsettled reservations, cross-scope canaries and uncontrolled backlog.
- [ ] Wait for the cooldown and reconciliation window and prove queues return below threshold.
- [ ] Calculate success (excluding intentional quota rejection), first-token and full latency, queue age, database saturation, provider cost, cache rate and error classes.

**Verify:** the reconciliation report.

**Pass:** every correctness count is zero; queues drain within the window.

#### WP09-T05 — Tune one bottleneck at a time

**Depends on:** WP09-T04. **Decision gates:** none; an infrastructure plan increase is a money stop. **Protected:** depends on the change. **Material UI:** no. **Real money:** only with fresh confirmation.

- [ ] Rank bottlenecks from evidence and apply §12.3 in order.
- [ ] Keep seed, dataset and configuration stable except the named change; compare repeated runs before claiming an improvement.
- [ ] Reject a cheaper configuration that weakens leakage, grounding, deletion or accepted-work durability.
- [ ] Freeze the minimum passing configuration and its capacity-increase switches.

**Verify:** before/after reports per change.

**Pass:** the minimum passing configuration is frozen with its scale-up switches.

#### WP09-T06 — Approve the load/cost gate

**Depends on:** WP09-T05. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Publish `evidence/wp09-load-cost/<date>_load-gate_beta_<sha>.md` with the scenario, versions, pass/fail per threshold, cost totals and p95 action cost, limitations and the next capacity trigger.
- [ ] Ahmed and Ziad separately confirm the leakage/accounting and budget results, with the security/data and cost roles named.
- [ ] Never average away a single release-blocking leakage or duplicate-charge event.

**Verify:** the gate report.

**Pass:** zero leakage, lost accepted work or uncontrolled backlog; at least 99% successful interactive requests excluding quota rejection; chat first-token p50 under 5 s and p95 under 12 s (a revised target needs both founders' recorded approval); no duplicate job, artifact, message or usage event; total and p95 action cost inside the cap; documented scale-up switches that need no rewrite.

### 12.1 Minimum-resource baseline

Record the beta configuration exactly: web instance and concurrency; database compute, storage, pooling and connection limits; worker sizes and concurrency per job type; queue limits; object-storage class and limits; email sending limits; provider rate limits; cache policy. Measure idle monthly cost and per-action variable cost.

### 12.2 Workload phases

Warm-up; the defined 100-student realistic workload; the selected concurrency burst; background PDF and audio ingestion overlap; provider slowdown; worker termination and lease recovery; database connection pressure; cooldown and reconciliation. Collect p50/p95/max latency, success, error and quota responses, first-token latency, queue age, worker utilization, database CPU, connections and query latency, cache reuse, provider units and cost, duplicates, unsettled reservations, lost accepted jobs and leakage canaries.

### 12.3 Tuning order

1. Query, index and RLS plan issues.
2. Connection pooling and request concurrency.
3. Retrieval parallelism and evidence size.
4. Worker concurrency by provider rate limit.
5. Embedding batches.
6. Safe artifact and result caching.
7. Provider and model configuration.
8. An infrastructure plan increase only if lower-cost tuning cannot meet the gates (money stop).

Repeat the identical test after each material change.

## 13. Work package 10: Veterinary Medicine validation

**Outcome:** a second program uses catalog configuration and the same authorization, processing, retrieval, safety, Studio, quiz and operations paths without Human Medicine assumptions.

**Primary artifacts:** Veterinary catalog configuration (through WP03-T34 actions), Veterinary evaluation suites, `evidence/wp10-veterinary/`.

### 13.0 Tasks

#### WP10-T01 — Configure the Veterinary catalog

**Depends on:** WP09-T06, WP03-T34. **Decision gates:** D-02. **Protected:** none (uses existing audited actions). **Material UI:** no. **Real money:** no.

- [?] D-02 approved with the Veterinary cohort, unit list, Batch Leader and academic reviewer. OWNER INPUT REQUIRED.
- [ ] Configure the Veterinary institution, program, level, term, cohort, edition, `SUBJECT` labels and ordered units through the WP03-T34 admin actions only; no faculty-name code branch and no migration with catalog rows.

**Verify:** the student catalog shows Veterinary Subjects from configuration.

**Pass:** Veterinary renders `Subjects` with zero code change.

#### WP10-T02 — Freeze Veterinary fixtures and evaluation

**Depends on:** WP10-T01. **Decision gates:** Veterinary rows in the source-rights inventory (WP00-T03). **Protected:** none. **Material UI:** no. **Real money:** no.

- [?] Veterinary source rows and rights approved and the academic reviewer named. OWNER INPUT REQUIRED.
- [ ] Author the Veterinary tutor and Studio suites with the §3.4 minimums: terminology, direct, partial, unavailable, conflict, hint, educational-case, real-patient boundary, Studio and MCQ cases, in English, Arabic and mixed language.
- [ ] Have the academic reviewer sign the manifest.

**Verify:** `pnpm test:eval` validator.

**Pass:** the signed Veterinary suite meets every minimum.

#### WP10-T03 — Reuse collection and processing

**Depends on:** WP10-T02. **Decision gates:** none. **Protected:** storage; raw deletion. **Material UI:** no. **Real money:** yes, inside caps.

- [ ] Create the Veterinary campaigns and give the Batch Leader access through WP03-T36; process PDF, audio and professor material through the existing job types and adapters, exactly as WP04-T20.

**Verify:** job timelines, quality, deletion and cost reports.

**Pass:** the WP04-T20 pass line holds for the Veterinary corpus with no new job type or adapter.

#### WP10-T04 — Prove bidirectional isolation

**Depends on:** WP10-T03. **Decision gates:** none. **Protected:** RLS. **Material UI:** no. **Real money:** no.

- [ ] Run Human ↔ Veterinary canaries through database functions, services, APIs, chat, cache reuse, Studio, quiz and admin preview.

**Verify:** security suite.

**Pass:** zero cross-program results in either direction.

#### WP10-T05 — Audit Human-specific assumptions

**Depends on:** WP10-T03. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Search code, prompts, database functions, tests and UI for `human`, `medicine`, `module`, Human faculty and cohort names, and English-only assumptions; classify each hit as valid content/config/test or a defect.

**Verify:** the classified search report.

**Pass:** every hit is classified; defects are listed for WP10-T06.

#### WP10-T06 — Remove invalid assumptions

**Depends on:** WP10-T05. **Decision gates:** none. **Protected:** depends on the change. **Material UI:** only if a visible label changes. **Real money:** no.

- [ ] Replace each defect with catalog or policy configuration, never a parallel pipeline or a program-name conditional.

**Verify:** `pnpm verify`; the WP10-T05 search rerun.

**Pass:** the rerun finds no defect.

#### WP10-T07 — Run identical gates

**Depends on:** WP10-T04, WP10-T06. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** yes, inside caps.

- [ ] Run the WP05-T06, WP06-T08 and WP07-T06 gates, the WP08-T08 unattended proof and the cost report on the Veterinary corpus and compare with Human Medicine.
- [ ] Write `evidence/wp10-veterinary/<date>_veterinary-gate_beta_<sha>.md`.

**Verify:** the gate reports.

**Pass:** Veterinary meets every threshold Human Medicine met (master plan Phase 6 exit).

#### WP10-T08 — Review architectural reuse

**Depends on:** WP10-T07. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] A reviewer confirms one retrieval-pool architecture, one processor contract, one Studio implementation and data-driven terminology.

**Verify:** review record.

**Pass:** no second pool, pipeline or Studio implementation exists.

## 14. Work package 11: Private beta

**Outcome:** up to 100 verified students enter in controlled waves; each expansion is evidence-based, reversible, budget-limited, supported and monitored.

**Primary artifacts:** `evidence/wp11-beta/`, onboarding copy, the final Terms and Privacy texts, wave reports.

### 14.0 Tasks

#### WP11-T01 — Freeze release candidate and go/no-go packet

**Depends on:** WP08-T09, WP08-T10, WP09-T06, WP10-T08. **Decision gates:** D-08, D-20, D-25 and D-26 approved. **Protected:** yes — Beta unlock for students is a D-22 protected action. **Material UI:** no. **Real money:** no new spend.

- [ ] Tag the exact commit, migrations, configuration, evaluation datasets and provider models.
- [ ] Run the security, retrieval, chat, Studio, automation, restore and load gates on the candidate.
- [ ] Confirm the rights inventory, source activation, raw-deletion compliance, Terms/Privacy/boundary versions, retention, support, incident owners, alert and email delivery, quotas and hard budgets.
- [ ] Create `evidence/wp11-beta/<date>_go-no-go_beta_<sha>.md` listing every blocker and open risk.
- [ ] Obtain two-founder go approval. One founder cannot waive a leakage, grounding, rights, deletion or budget blocker.

**Verify:** the go/no-go packet against linked evidence.

**Pass:** both founders approve the exact candidate with no open release blocker.

#### WP11-T02 — Prepare onboarding and support

**Depends on:** WP11-T01, WP03-T35. **Decision gates:** none beyond WP11-T01. **Protected:** auth (membership provisioning). **Material UI:** yes — onboarding copy and help pages. **Real money:** no.

- [ ] Ahmed and Ziad approve the final Terms of Use, Privacy Notice and educational-boundary texts (including any legal review they choose) and publish them as new consent versions.
- [ ] Provision wave memberships only through the WP03-T35 path, to verified addresses, with expiry.
- [ ] Publish concise bilingual onboarding: the source boundary, the educational boundary, privacy and retention, feedback and reporting, and support.
- [ ] Test account creation, verification email, consent, first unit, first chat, first artifact, first quiz, feedback, logout, account and data controls, and support escalation on phone and desktop.
- [ ] Set support response targets and issue categories without exposing ordinary chats.

**Verify:** E2E onboarding journeys in Beta with founder accounts; founder review.

**Pass:** a new student completes the onboarding journey unaided; `Approved commit:` recorded.

#### WP11-T03 — Release one wave at a time

**Depends on:** WP11-T02. **Decision gates:** none. **Protected:** D-22 release actions. **Material UI:** no. **Real money:** usage inside caps.

- [ ] Record planned users, start and end, owner, monitoring window, success and abort thresholds, and the prior-wave review.
- [ ] Invite only the current wave (§14.1 order).
- [ ] Run the load profile again during the first larger wave (master plan Phase 7 "before and during onboarding") inside the approved spend.
- [ ] Monitor activation, errors, latency, queues, provider failures, grounding reports, deletion, budget, email delivery and support.
- [ ] Reconcile accounts, usage, jobs and cost at the end of the window; expand only after a signed wave report, otherwise pause, contain, repair, regress and repeat the same wave size.

**Verify:** signed wave reports.

**Pass:** each wave closes with a signed report inside the cost and reliability gates.

#### WP11-T04 — Run the weekly operating cycle

**Depends on:** WP11-T03. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** usage inside caps.

- [ ] Run the frozen regressions before reviewing subjective feedback.
- [ ] Review only reported or consented content under the retention and access policy.
- [ ] Review source, job and deletion exceptions; performance and provider reliability; usage, cost and budget; success signals; false-refusal feedback.
- [ ] Interview active and inactive students.
- [ ] Separate defects, source gaps, UX friction, provider limits and out-of-scope requests; record every disable, fix, retry, release or expand decision with its evidence.

**Verify:** weekly reports.

**Pass:** every week has a report and recorded decisions.

#### WP11-T05 — Close beta with an explicit decision

**Depends on:** WP11-T04. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Compare every master plan §11 gate and §12 signal with its target.
- [ ] Report confidence and limits, cohort differences, cost per meaningful action and per student, operational intervention rate and unresolved risks.
- [ ] Decide `EXPAND`, `EXTEND_BETA`, `NARROW_SCOPE` or `STOP`, with conditions and owners.
- [ ] Never treat willingness-to-pay interviews as authorization for a manual payment workflow.

**Verify:** the beta close report.

**Pass:** both founders record the decision. PoC acceptance is recorded here, separately from that decision, only when every master plan §11 gate has passed on recorded evidence.

### 14.1 Release waves

In order: Ahmed's and Ziad's accounts; 5–10 close testers; 20–30 Human Medicine students; Veterinary validation testers; the remaining verified students up to 100 after a stability review. Pause expansion on leakage, unsupported material claims, concealed conflicts, a deletion-policy breach, uncontrolled cost, or repeatable loss or duplication of work. No manual payment or receipt workflow appears in the product.

## 15. Work package 12: Post-PoC extension preparation

**Outcome:** payments and video have approved extension designs and threat and test plans, without entering the free PoC.

### 15.0 Tasks

#### WP12-T01 — Prove extension boundaries

**Depends on:** WP11-T05. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Re-run the WP04-T01 video-ready contract test against the final PoC schema and confirm provider interfaces, source kinds, the job graph, the processed-document contract, catalog, retrieval, chat and Studio still accept a future video processor without duplication.

**Pass:** the contract test passes on the final schema.

#### WP12-T02 — Design video ingestion

**Depends on:** WP12-T01. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Write a video design record covering rights, size/duration/cost preflight, temporary video and audio, timestamps and visual extraction, completeness, quality, deletion of raw and derived temporary objects, and replay (§15.2).

**Pass:** the design record is approved by both founders.

#### WP12-T03 — Design automated payments

**Depends on:** WP11-T05. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no (design only).

- [ ] Write an automated-payment design record covering provider selection criteria, signed webhook verification, event uniqueness, the order and entitlement state machine, an append-only money ledger, reconciliation, refunds and disputes, currency and amount verification, replay and incident handling (§15.1).

**Pass:** the design record is approved by both founders.

#### WP12-T04 — Enforce PoC exclusions

**Depends on:** WP12-T03. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Add a check that fails on receipt uploads, founder approval queues or editable balances in migrations and routes.

**Pass:** the check runs in `pnpm verify` and passes.

#### WP12-T05 — Add mock-only contract tests

**Depends on:** WP12-T02, WP12-T03. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Add contract tests for the video processor and payment provider using mocks only; provision no payment or video provider until a post-PoC decision is approved.

**Pass:** the mock contract tests pass with no provider account.

#### WP12-T06 — Review additive architecture

**Depends on:** WP12-T04, WP12-T05. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] A reviewer confirms these are additive adapters and workflows, not a second knowledge or entitlement architecture.

**Pass:** the review is recorded (master plan Phase 8 exit).

### 15.1 Automated commercial payments

Never build payment receipt upload or founder approval. After PoC acceptance, select an automated provider. The future flow uses signed webhooks, unique provider event IDs, idempotent fulfillment, append-only ledger entries, automated reconciliation and tested refund and dispute behaviour.

### 15.2 Video processor contract

Video becomes another `source_kind` and processor behind the existing workflow: validate rights, type, size, duration, checksum and cost; store raw video temporarily; extract complete audio in an isolated worker; transcribe with timestamps; optionally extract essential slide or visual text when approved; produce the same processed Markdown/JSON/locator contract; run the same hint, conflict, quality, chunk, embedding and retrieval checks; delete raw video and extracted audio after verified output; index transcript segments into the same unit pool.

## 16. PoC acceptance checklist

These are the master plan §11 gates, copied with their thresholds, and the task whose evidence proves each. Tick a line only when that evidence exists for both cohorts where the gate applies.

| Gate | Threshold (master plan §11) | Proved by |
| --- | --- | --- |
| Cross-user/cohort/unit leakage | 0 cases | WP02-T09, WP05-T05, WP09-T04, WP10-T04 |
| Unsupported factual claims | 0 in accepted frozen evaluation answers | WP06-T08 (validator and academic review) |
| Evidence provenance coverage | 100% of accepted answers and artifacts | WP06-T08, WP07-T06 |
| Missing-information behaviour | At least 95% correct; no hidden-knowledge completion | WP05-T06, WP06-T08 |
| Conflict behaviour | 100% of known frozen conflicts show both positions | WP05-T06, WP06-T08 |
| Professor-hint retrieval | At least 95% for direct relevant questions | WP05-T06, WP06-T08 |
| Educational case behaviour | At least 95% answered without false refusal when evidence exists | WP06-T08 |
| Real-patient boundary | 100% of explicit high-risk cases | WP06-T08 |
| Conversion completeness | 100% of required pages/audio accounted for or rejected | WP04-T20, WP10-T03 |
| Raw deletion correctness | 100% of accepted sources deleted; 0 premature | WP04-T20, WP10-T03 |
| Availability correctness | 0 unauthorized or premature units | WP02-T05, WP03-T08, WP03-T35 |
| Artifact grounding | 0 unsupported accepted claims, answers or explanations | WP07-T06 |
| Retry idempotency | 0 duplicated source, segment, embedding, artifact, usage or charge | WP04-T12, WP06-T08, WP07-T06, WP09-T04 |
| Routine automation | 0 manual processing steps in the accepted path | WP08-T08 |
| 100-student workload | No leakage, lost accepted work or uncontrolled backlog | WP09-T06 |
| Interactive availability | At least 99% successful requests under load, excluding quota rejection | WP09-T06 |
| Chat latency | Target p50 under 5 s and p95 under 12 s to first token | WP06-T05, WP09-T06 |
| Cost | p95 action and total workload inside the approved cap | WP09-T06, WP11-T05 |

Release blockers (master plan §11): any scope leakage, unsupported clinical claim sent as grounded fact, hidden external knowledge, concealed conflict, premature deletion, unauthorized exposure or repeatable duplicate provider charge.

- [ ] Every gate above has linked passing evidence for Human Medicine.
- [ ] Every gate above has linked passing evidence for Veterinary Medicine.
- [ ] No release blocker is open.

## 17. Founder actions that unblock the critical path

The work below cannot move until Ahmed and Ziad decide or supply something. In the order the critical path (§2.2) needs it; the [decision register](../../planning/decision-register.md) holds owners and dates.

1. Name the security/data, academic, cost and operations role holders (WP00-T01).
2. Approve D-10, the processed format (unblocks WP04-T01 and the whole pipeline).
3. Decide D-25, how students get cohort membership (WP03-T35), and D-24, Batch Leader links or accounts (WP03-T36).
4. Supply the Cohort A source rows and rights evidence and name the academic reviewer (WP00-T03, WP00-T20).
5. Approve nonzero D-05 caps for the provider benchmark (WP04-T14, the first real-money step).
6. Decide D-18 and D-19 (WP04-T16), D-17 (WP04-T17) and the restore target (WP04-T18) before the first real source.
7. Decide D-08 before the real chat retention work (WP06-T07).
8. Decide D-20 and D-26 before alerts and real email (WP08-T05).
9. Decide D-02 before the Veterinary package (WP10-T01).
10. Record or withdraw the WP03-T13 hands-on review.

## 18. Command and verification catalog

| Command | Purpose | External or paid calls | Passing result |
| --- | --- | --- | --- |
| `pnpm agent:status` | Read-only work state: in-progress, blocked and next task | None | Lists tasks; changes nothing |
| `pnpm lint:agents` | Agent docs, task records and skills: links, record fields, retired terms | None | Exit 0 |
| `pnpm check` | Fast edit-loop checks | None | Exit 0 |
| `pnpm verify` | Complete credential-free merge gate, the same suite CI runs | None | Every subcommand exits 0 |
| `pnpm dev` | Workstation Next.js development process | Mocks only | App starts without local infrastructure |
| `pnpm demo` | Loopback synthetic demo | None | Demo serves on loopback only |
| `pnpm build` | Production web build | None | Exit 0 with no ignored error |
| `pnpm lint`, `pnpm typecheck`, `pnpm format:check` | Static checks | None | Exit 0 |
| `pnpm check:boundaries`, `pnpm check:sql`, `pnpm scan:secrets` | Module boundaries, SQL conventions, secret scan | None | Exit 0 |
| `pnpm test:unit`, `test:integration`, `test:security` | Vitest layers | None | Exit 0 |
| `pnpm test:e2e`, `pnpm test:e2e:demo` | Real-mode and synthetic browser suites | Local app and mocks only | Exit 0 |
| `pnpm test:eval` | Dataset validation and the evaluation runner | Mock-only by default; a live profile needs its own guarded command | Hashes valid; reports name the exact scope |
| `pnpm test:load` | Guarded load profile | Rejects Beta/production, real providers and nonzero cost by default | `NOT_EXECUTED` report until WP09 |
| `pnpm smoke:deployment` | Redacted public deployment smoke | Target deployment only | Six checks pass |
| `pnpm db:ci:*` | Disposable Supabase lifecycle (`start`, `reset`, `upgrade`, `migrations`, `test`, `advisors`, `types`, `stop`) | GitHub-hosted runner containers only | Each step exits 0; `stop` runs under `if: always()` |
| `pnpm db:types:check` | Committed types are current | None | No Git diff |
| `pnpm db:reset`, `db:migrations`, `db:push:dry-run`, `db:types`, `test:integration:hosted` | Retired hosted seams | None | Do not run |

A command that needs secrets or a paid provider says so in its name (for example `test:eval:live-approved`) and requires an explicit environment profile, a budget preflight and a confirmation guard. `pnpm verify` never spends money.

## 19. Troubleshooting decision tree

### 19.1 Clean clone does not install

1. Confirm Node matches `.nvmrc` and pnpm matches `packageManager`.
2. Use `pnpm install --frozen-lockfile`; make sure no competing lockfile exists.
3. Delete and reinstall only generated dependency directories, never source files.
4. If the lockfile is invalid, repair dependencies on a separate branch and review the exact manifest and lock diff.

### 19.2 The disposable Supabase CI stack fails or is rejected

1. Confirm the job runs on a standard GitHub-hosted Ubuntu runner with no Preview/Beta credentials and no founder-hosted runner.
2. Check the pinned Supabase CLI and container versions, runner capacity and image state without printing tokens or connection strings; never print `supabase status -o env` output.
3. Read the `db:ci:start` failure with the pinned CLI's current flags, not an old tutorial.
4. Keep migrations versioned. Never bypass a guard, relabel Preview or Beta as a test target, or repair schema in a dashboard.
5. If the stack stays unavailable, mark database tasks blocked and continue only with credential-free work.

### 19.3 Migration reset fails

1. Find the first failing migration and the exact SQL error.
2. Reproduce on a clean disposable reset; never patch Preview or Beta by hand.
3. Fix an unshared migration in place; once it has reached Preview or Beta, add a forward repair migration instead.
4. Run the populated upgrade and the clean reset; regenerate types; inspect grants, RLS and advisors.

### 19.4 An authorized query returns zero rows

1. Confirm the object is exposed and granted to the caller role; Data API exposure and RLS are separate.
2. Confirm the session identity and token freshness.
3. Inspect the SELECT policy first; an UPDATE also needs row visibility and `WITH CHECK`.
4. Reproduce the exact caller and row state in the security fixture.
5. Never add `security definer` just to make the query work.

### 19.5 Retrieval is slow or misses evidence

1. Reproduce one frozen case and capture component scores and the query plan.
2. Confirm identical authorization, source and configuration filters on both branches.
3. Confirm the embedding model, dimensions, normalization and distance operator match the stored vectors and index.
4. Confirm vector ordering uses the distance expression and filters apply before the limit.
5. Compare exact search with HNSW to separate index recall from embedding, chunking or query problems.
6. Change one variable, rerun the identical suite, and record before and after.

### 19.6 A provider times out

1. Decide whether acceptance is known, rejected or uncertain; persist the typed outcome and the provider request ID.
2. On uncertain acceptance, reconcile provider status before another paid call where the provider supports it.
3. Keep the reservation open and retry-safe until terminal resolution, then settle or release once.
4. Let bounded retry and reconciliation act; never duplicate the job by hand.

### 19.7 Raw deletion is uncertain

1. Keep the state unresolved and the source not fully optimized.
2. Check object metadata or listing independently; a successful delete response alone is not proof.
3. Append verification attempts and retry automatically; escalate at the deadline with the incident runbook.
4. Never delete processed output or the audit trail to "start over".

### 19.8 A grounding or leakage test fails

1. Stop release expansion and disable the affected feature, source or scope.
2. Keep the correlation ID, policy/model/source/configuration versions and minimal authorized evidence.
3. Decide whether the failure is RLS, server authorization, retrieval filtering, cache authorization, generation or validation.
4. Add the failing case to the frozen regression set without exposing private content.
5. Fix, run the full security and evaluation suites, and obtain the protected-gate confirmations from Ahmed and Ziad before re-enabling.

### 19.9 A Free-plan limit is reached

1. Identify the limit (database size, storage, egress, monthly active users, pausing) from the provider dashboard or the WP08-T02 capacity metrics.
2. Contain: pause new ingestion or new invitations; do not delete evidence to make room.
3. Measure what grew and compare with the WP04-T15 capacity estimate.
4. A paid tier is a real-money decision: present the exact plan and monthly exposure to Ahmed and Ziad and wait for both.

## 20. Final release truth test

Before anyone says "the PoC is ready", a new reviewer must answer **yes** to each question from evidence, not from someone's explanation:

- [ ] Can a clean clone reproduce the app, database, fixtures, tests and build?
- [ ] Can every role's allowed and forbidden actions be traced to RLS and server tests?
- [ ] Can a student get access, and lose it, only through the approved membership path?
- [ ] Can every accepted factual answer and artifact be traced to active authorized evidence?
- [ ] Can an unavailable or conflicting case be reproduced without hidden external knowledge?
- [ ] Can every accepted source prove processed completeness and verified raw deletion or an approved hold?
- [ ] Can provider timeout, worker death, duplicate delivery and replay happen without duplicate state or cost?
- [ ] Can an operator disable a bad source, provider, feature or cohort quickly without deleting evidence?
- [ ] Can the system restore the database and processed objects and rebuild retrieval safely?
- [ ] Can the exact 100-student workload be rerun inside the approved cost and performance envelope?
- [ ] Can Veterinary Medicine pass through the same architecture with configuration-only terminology?
- [ ] Can the founders turn off their computers without stopping workers, schedules, email or alerts?
- [ ] Can beta expansion be paused and rolled back from documented controls?

If any answer depends on "Ahmed or Ziad knows how", the project is not yet production-shaped: turn that knowledge into code, configuration, a runbook or reviewed evidence.
