# UniMind PoC: Detailed Execution Runbook

**Companion to:** [UniMind PoC master plan](../plans/poc-master-plan.md)

**Owners:** Ahmed and Ziad

**Last updated:** 20 October 2026

**Runbook revision:** 3.2 — every master-plan deliverable has an ordered, executable task ([first](../reviews/runbook-revision-2026-10/findings.md), [second](../reviews/runbook-revision-2026-10/second-review.md) and [third](../reviews/runbook-revision-2026-10/third-review.md) reviews; [proposed master-plan amendments](../reviews/runbook-revision-2026-10/master-plan-amendments.md))

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

1. Continue the earliest task whose state is in progress (some steps done or a `[~]` step, none blocked) and whose owner is available.
2. Otherwise take the earliest `[ ]` task in document order whose `Depends on` tasks are all `[x]` and which has no `[?]` line. Document order is the execution order. Task IDs are stable labels: they are never renumbered, and a new task takes the next free number in its package. `pnpm agent:status` applies this rule and prints the result as "Next executable".
3. Never cross a blocked task. A task that depends on a `[?]` task is not executable either. Advance an executable prerequisite instead, or pick the earliest task that does not depend on the blocker.
4. A user-named outcome maps to exactly one task. If none fits, add the task to this runbook first.

**Bridges for open decisions:** WP01 onward use synthetic fixtures and deterministic mocks, so the open WP00 decision tasks do not block them. Each open decision blocks only the consumers named in the [decision register](../../planning/decision-register.md), and only for the real choice (real data, a real provider, real money). A decision record may still name a mock-only task it blocks, as D-10 does for WP04-T01; that block holds until the founders lift it.

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

- **Protected** means a protected path from `AGENTS.md` (auth and authorization, RLS and migrations, storage, CI workflows, production configuration). It needs a written plan before editing, an independent review of the exact diff before merge and a recorded rollback (workflow §2 and §5). D-22 lists the protected gates: RLS, raw deletion, rights, budget controls, release/unlock and beta go-live. They proceed under D-22's standing authorization once their technical gate passes; the agent does not request a second approval, and real money still needs fresh confirmation.
- **Material UI** means a visible presentation or interaction change to an approved surface. The founder approves the rendered candidate, recorded as `Approved commit:` in the task record.
- **Real money** means the D-22 stop applies: fresh two-founder confirmation immediately before the financial mutation.
- Values a step needs but this runbook cannot fix yet are listed in §2.3 with the task or decision that sets them.
- A task that would need more than one reviewable PR, typically because it combines a founder decision, a protected-path change and a material-UI approval, is split before work starts: the agent adds the extra tasks to this runbook first (workflow Pick step). §2.4 lists the splits already known.

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

[evidence/README.md](../../evidence/README.md) and the [gate-report template](../templates/gate-report.md) own the evidence rules. In short: the PR and its exact-head CI run are the evidence unless a task needs external or production proof (workflow §6); then a short evidence bundle goes under `evidence/<work-package>/`, named `YYYY-MM-DD_<gate>_<environment>_<short-sha>.md`. New package folders follow the existing pattern: `wp04-ingestion`, `wp05-retrieval`, `wp06-chat`, `wp07-studio`, `wp08-operations`, `wp09-load-cost`, `wp10-veterinary`, `wp11-beta`, `wp12-extensions`.

Sensitive exports go to the approved restricted store with only a redacted index in Git. Never commit secrets, `.env` files, private sources, student data, ordinary chat content, signed URLs, provider payloads with source text or unredacted logs (`AGENTS.md`).

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

| Decision | Placeholder until approved | Resolved in |
| --- | --- | --- |
| D-02 Veterinary cohort | Synthetic Veterinary catalog fixtures | WP00-T02 |
| D-04 AI providers | Deterministic mocks; the synthetic 3-dimension embedding configuration | WP04-T19 |
| D-05 Maximum spend | Every paid flag false; zero caps | WP00-T06 |
| D-08 Chat retention and misuse review | Short synthetic retention values; misuse detection disabled | WP06-T07 |
| D-10 Processed format | The proposal in the [raw-data policy](../policies/raw-data-lifecycle.md), used with synthetic data only | WP00-T04 |
| D-17 Queue and worker host | Database job table plus in-process test dispatcher | WP04-T22 |
| D-18 Object storage provider | Mock storage adapter, synthetic data only | WP04-T22 |
| D-19 Retention periods and deadlines | Short synthetic-test values | WP04-T22 |
| D-20 Notification and incident channels | In-process deterministic test sink; budget alerts by email from WP04-T17 | WP08-T05 |
| D-21 revision: real sources in locked, student-free Beta before go-live | Beta stays empty until go-live, as D-21 says | WP04-T22 |
| D-24 Batch Leader one-time upload links | Account-based Batch Leader screens stay as built and are not extended | Ziad's confirmation; WP03-T38 implements it |
| D-25 Student cohort membership | No real student gains a membership | WP03-T35 |
| D-26 Transactional email delivery | Supabase built-in sender for synthetic Preview only (it reaches only the project team's addresses) | WP04-T22 |
| D-27 Backup host, restore target, key custody and restricted data store | No real data may enter Beta | WP04-T22 |
| D-28 Data-protection compliance route | No real personal data and no cross-border transfer of real material | WP00-T21 |

Do not hide one of these choices inside source code. Close it with `docs/templates/decision-record.md`, update the master-plan decision log and the register, and record the configuration key the adapter reads.

### 0.8 Platform facts to recheck

Recheck these on the day a task depends on them and record what you found in the task's evidence. The provider facts were read from the linked pages on 20 October 2026; providers change them.

- Node.js 24 LTS is pinned in `.nvmrc` and `package.json#engines`; pnpm is pinned in `packageManager`.
- The Supabase CLI is a pinned development dependency invoked as `pnpm supabase`. D-21 prohibits workstation database infrastructure; the disposable stack runs only on a standard GitHub-hosted Ubuntu runner.
- New `public` tables are not always exposed to the Data API automatically. RLS and SQL `GRANT` are separate requirements; test both.
- Do not pin a version in `CREATE EXTENSION`; record the installed version in evidence instead.
- Use `@supabase/ssr` for cookie sessions. A publishable key may be public; secret and service-role keys are server-only.
- pgvector indexes (HNSW, IVFFlat) cover `vector` up to 2,000 dimensions and `halfvec` up to 4,000. With a filter, an approximate index scan can return fewer rows than asked unless iterative scans (pgvector 0.8 or later) are enabled; check the installed version, match the operator class to the distance operator and benchmark against exact search.
- PostgreSQL full-text search in the current migrations uses the `simple` configuration: no stemming, stopwords kept, no folding of Arabic letter variants or diacritics. PostgreSQL's `arabic` stemmer targets Modern Standard Arabic, not Egyptian dialect.
- Supabase database backups do not include Storage objects; processed objects need their own durability and restore proof.
- Supabase Free: no automatic backups; projects pause after inactivity; fixed database size, egress and monthly-active-user allowances; 1 GB of file storage with a 50 MB per-file upload limit; logs kept for about a day; direct database connections are IPv6-only and the transaction pooler does not keep session-level advisory locks; Edge Functions have tight CPU and wall-time limits.
- Supabase's built-in Auth email sender is for testing: it sends about two messages an hour and delivers only to the project team's addresses; custom SMTP starts at a higher default limit (D-26, WP04-T17).
- Vercel Hobby: monthly allowances for active CPU, invocations and memory; going over one can pause that feature or the team's deployments, usually for 30 days; usage counts per Hobby team, and Preview and Beta share the one `Unimind` workspace, so one overage can stop both; functions have a maximum duration and accept request bodies of about 4.5 MB; cron jobs run at most once a day with up to an hour of drift; runtime logs are kept only briefly. Use stays conditional on D-21: revenue, payments, advertising, donations, paid contributors, customer work or another commercial scope change triggers review.
- Egypt's Personal Data Protection Law (Law 151 of 2020) and its executive regulations (Ministerial Decree 816 of 2025) were reported to give data handlers until about 1 November 2026 to comply, including licensing and cross-border transfer rules. This is not legal advice; WP00-T21 records the founders' route.

References: [Node.js releases](https://nodejs.org/en/about/previous-releases), [Supabase CLI](https://supabase.com/docs/reference/cli/introduction), [Supabase migrations](https://supabase.com/docs/guides/deployment/database-migrations), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase server packages](https://supabase.com/docs/guides/auth/choosing-a-server-package), [Supabase vector indexes](https://supabase.com/docs/guides/ai/vector-indexes), [Supabase connections](https://supabase.com/docs/guides/database/connecting-to-postgres), [Supabase Edge Function limits](https://supabase.com/docs/guides/functions/limits), [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Supabase pricing](https://supabase.com/pricing), [Supabase breaking changes](https://supabase.com/changelog?types=breaking-change), [pgvector](https://github.com/pgvector/pgvector), [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Vercel function limits](https://vercel.com/docs/functions/limitations), [Vercel cron usage](https://vercel.com/docs/cron-jobs/usage-and-pricing), [Egypt PDPL regulations (CMS)](https://cms.law/en/are/legal-updates/egypt-s-pdpl-executive-regulations-issued-one-year-compliance-countdown-begins).

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

Workstations need no database, Docker, WSL2 or other local infrastructure. Database and Auth behaviour is proven by the CI `database-ci` job; for earlier feedback push the branch and dispatch CI with `database_feedback=true`. The retired hosted commands (`pnpm db:reset`, `db:migrations`, `db:push:dry-run`, `db:types`, `db:metadata`, `test:integration:hosted`) have no approved target; do not run them.

### 0.10 Delivery loop, task records and package gates

Follow the [agent workflow](../agents/workflow.md) for branches, slices, checks, review and delivery. Runbook-specific additions:

- `pnpm verify` stays credential-free, mock-only and zero paid-provider cost, and matches CI. Reuse exact-commit CI evidence instead of rerunning overlapping proof.
- Never repair Preview or Beta by hand after merge; add a migration or configuration change and redeploy through [environment promotion](environment-promotion.md).
- Every task uses [the task-record template](../templates/task-record.md) at `planning/tasks/wpNN-tyy-short-outcome.md`, at or under 120 lines, holding current state only.
- An issue titled only "set up database", "build RAG" or "finish admin" is not executable; decompose it into tasks first.

At the end of every package, run its gate:

1. Freeze the candidate commit SHA.
2. Reset only the disposable CI stack; deploy Preview or Beta from version control through environment promotion, never reset them.
3. Run the package gate from a clean state.
4. Run at least one forbidden path and one retry/recovery path.
5. Compare measured results with the numeric thresholds; "looks good" is not a result.
6. Record every deviation as a defect, risk acceptance or decision. Release blockers cannot be waived informally.
7. Record `PASS`, `FAIL` or `CONDITIONAL PASS`. A genuine product or academic judgment names the deciding founder. A protected non-financial gate records D-22; a real-money mutation requires fresh decisions from Ahmed and Ziad.
8. Mark the gate task `[x]` only after `PASS`. A conditional pass never unlocks a later task that needs the missing behaviour.

Write a gate evidence bundle only when the gate needed external or production proof; otherwise the PR and its CI run are the evidence (workflow §6).

### 0.11 Real-data and money boundaries

These first-time events are the riskiest steps of the PoC. Each happens once, in the named task, and only when every listed condition holds.

| First event | Required before it happens | Task |
| --- | --- | --- |
| First real personal data, or first transfer of real material outside Egypt | D-28 route approved (WP00-T21) | WP04-T18 |
| First real private source in any environment, including benchmark samples | WP04-T18 real-data readiness gate passed, including the approved D-21 revision | WP04-T19 (samples), WP04-T21 (corpus) |
| First real sample sent to an external provider | WP04-T18 passed; the sample is marked in WP00-T03 with `provider_processing` granted and no personal data (or recorded consent); the provider's data terms recorded; the D-05 benchmark exception approved; run from an approved non-founder host | WP04-T19 |
| First paid provider call | D-05 caps approved; WP04-T13 budget guard live; budget alerts delivered (WP04-T17); fresh two-founder confirmation naming the maximum spend | WP04-T19 |
| First paid plan, add-on, payment card or billable resource | Fresh two-founder confirmation naming the plan and monthly exposure | WP04-T14 to WP04-T17, WP04-T20, WP08-T02, WP08-T05 |
| First real raw deletion | WP04-T09 proven on synthetic data; D-19 values approved; WP04-T18 passed | WP04-T21 |
| First real student account with cohort access | WP11-T01 go decision | WP11-T03 |

Preview never holds real data and uses mock providers only (D-21). Beta holds real sources only after WP04-T18 and the approved D-21 revision, and real students only after WP11-T01. Workstations and the public repository's CI never hold real material.

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
8. Use one unified knowledge pool per authorized cohort and curriculum unit. Source format and professor-insight status are metadata, not separate knowledge modes.
9. Generate factual content only from the evidence packet retrieved from uploaded approved material. Do not implement web search or any outside-answer fallback.
10. When evidence is missing, return the unavailable-information response. When it conflicts, show each supported position.
11. Preserve internal evidence provenance for every accepted chat answer and Studio artifact. Page/timestamp display is optional when a reliable locator exists.
12. Treat academic medical and veterinary cases as normal educational questions. Apply the real-patient boundary only when context indicates an actual patient or an urgent personal care request.
13. Delete raw PDF/audio files only after verified durable processed output exists. Verify deletion and append an audit event.
14. Run routine processing, retries, reconciliation, metering and alerts automatically. Ahmed and Ziad make governance and exception decisions, not routine pipeline steps.
15. Use mocks and fixtures during normal development. Turn on paid providers only for approved benchmarks, ingestion and end-to-end evaluation, through the WP04-T13 budget guard.
16. Attach a correlation ID to each request, job, provider call, answer and artifact. Record provider/model version, units, latency, attempt count, result and cost.
17. Do not mark a package complete from screenshots alone. Required tests, reports, migrations and job/audit evidence must exist.
18. Change control: a change to retrieval, chunking, embedding, prompt, policy, model, validator or processing configuration reaches Beta only after the frozen regression suites for the affected stage pass on the exact commit (master plan §7.2 step 10).
19. Product questions found during a task become an open decision or a founder question in the task record. Never answer them inside code.
20. A task that adds a real-mode state adds it to the synthetic runtime and the shared-screen browser checks in the same PR, so the founder-reviewed synthetic screens stay the canonical UI (WP03-T17).
21. A new runtime dependency records its licence, install scripts and maintenance in the task record; a copyleft licence (GPL, AGPL) or an install script (blocked by `strictDepBuilds`) needs a founder decision.

## 2. Delivery order

### 2.1 Packages

| Order | Package | Depends on | Completion result | State |
| --- | --- | --- | --- | --- |
| 0 | Pilot decision pack | None | Cohorts, rights, sources, budgets, load profile and evaluation sets, or explicit blockers | Workflow tasks done; decision tasks wait for founders |
| 1 | Repository and environments | WP00 mock-only constraints | Repeatable app, migrations, CI, Preview, Beta and mock providers | Done |
| 2 | Database and authorization | Package 1 | Generic catalog, access, content, RAG, Studio, usage and RLS foundation | Done |
| 3 | Product shell and governance controls | Package 2 | Role journeys on synthetic services; catalog, membership, campaign, rights and Batch Leader governance | Shell done (WP03-T08 gate); WP03-T34 to WP03-T38 open; WP03-T13 waits on Ahmed |
| 4 | Automated source pipeline and real-data readiness | Packages 1–3 and the WP00 inputs its tasks name | Synthetic pipeline proven; budget guard, worker host, storage, backup and email in place; real-data gate passed; providers chosen; Cohort A corpus READY | Open |
| 5 | Retrieval evaluation | Package 4 | Authorized hybrid retrieval meets leakage and evidence targets before chat | Open |
| 6 | Strict-RAG subject chat | Package 5 | Grounded, partial, unavailable, conflict, hint and educational-case behaviour in the real Chat screen | Open |
| 7 | Studio and quiz | Package 6 | Grounded artifacts and the quiz loop in the real Studio and Quiz screens | Open |
| 8 | Operations and automation | Packages 4–7 | Topology, metrics, reconciliation, dashboards, alerts, restore, incidents, security review, success signals, data-subject controls | Open |
| 9 | Cost and 100-student validation | Packages 1–8 | The minimum-cost configuration passes the defined workload | Open |
| 10 | Veterinary validation | Packages 4–9 | The second program passes the same gates through configuration only | Open |
| 11 | Private beta | Packages 0–10 | Up to 100 verified students in reviewed waves | Open |
| 12 | Post-PoC preparation | PoC acceptance (WP11-T05) | Payments and video stay extensions behind existing contracts | Open |

A package in the `Depends on` column means that package's gate task (WP01-T11, WP02-T09, WP03-T08, WP04-T21 and so on); each task's own `Depends on` line is authoritative and may also name earlier tasks. Do not start Studio generation before retrieval and strict-RAG contracts pass. Do not invite students before fault recovery, quotas, kill switches, restore and the security review pass.

### 2.2 Critical path

The shortest honest route from today to the beta, with what each step needs from the founders (§17 lists them in order):

1. **Governance loop** — WP03-T34 (catalog), WP03-T35 (membership; D-25), WP03-T36 (campaigns), WP03-T37 (rights decisions), WP03-T38 (Batch Leader access; D-24).
2. **Synthetic pipeline** — WP04-T01 to WP04-T12 (D-10 approved, or the founders allow building on the proposal with synthetic data).
3. **Real-data controls** — WP04-T13 (budget guard), WP04-T14 (worker host; D-17), WP04-T15 (storage and retention; D-18, D-19, D-21 revision), WP04-T16 (backup; D-27), WP04-T17 (email; D-26), and WP00-T21 (data protection; D-28) in parallel.
4. **Real-data readiness gate** — WP04-T18 (also needs the WP00-T01 roles, WP00-T02 catalog codes, WP00-T03 source rows and WP00-T04).
5. **Providers** — WP04-T19 benchmark (D-05 cap and benchmark exception; the signed WP00-T20 suite), then WP04-T20 embedding configuration.
6. **Cohort A corpus READY** — WP04-T21.
7. **Retrieval baseline** — WP05 (the WP00-T20 suite, sealed test part).
8. **Grounded chat** — WP06 (D-08).
9. **Studio and quiz** — WP07.
10. **Unattended operation, security review, signals and data-subject controls** — WP08 (D-20).
11. **Load and cost** — WP09 (load spend).
12. **Veterinary** — WP10 (D-02).
13. **Beta** — WP11.

### 2.3 Values to set

These values appear in later tasks but cannot be fixed by this runbook. Until the setter approves a value, tests use the synthetic default and no task claims the real gate.

| Value | Used by | Set by | Synthetic default until then |
| --- | --- | --- | --- |
| Raw retention period, `delete_after` start event, retry interval, overdue severity | WP04-T09, WP04-T11 | D-19 in WP04-T15 | [Raw-data policy](../policies/raw-data-lifecycle.md) synthetic values |
| Processed-output acceptance: page/audio coverage, OCR confidence, non-empty threshold, duplicate ratio, terminology sample rule | WP04-T08 | D-10 through WP00-T04 | The D-10 proposal in the [raw-data policy](../policies/raw-data-lifecycle.md): page and locator coverage 1.00; OCR mean confidence at least 0.90 with no page below 0.75; the audio rules there |
| Audio duration accounting tolerance | WP04-T06, WP04-T08 | D-10 | The raw-data policy's audio proposal |
| OCR page triggers (text density, replacement characters, layout anomalies) | WP04-T05 | WP04-T05 measurement, recorded in config | Fixture-derived |
| Accepted formats and per-source limits: formats, bytes, pages, audio duration | WP04-T01, WP04-T03, WP03-T36 | WP04-T01 proposal (founder-confirmed) and WP00-T06 cost limits | PDF, WAV and PNG up to 10 MiB (current intake) |
| Maximum preflight cost per source and per action | WP04-T13 | D-05 | Zero |
| Budget caps: total, weekly, provider/action, source preflight, per-user daily, single request; alert recipients | WP04-T13, WP04-T17, WP08-T05 | D-05 through WP00-T06 | Zero; in-process sink |
| Lease length, heartbeat interval, maximum attempts, backoff base and cap | WP04-T02 | WP04-T02 engineering choice, recorded in config | Short test values |
| Chunk size range and overlap | WP04-T10 | WP04-T10 initial, WP05-T06 tuned | Fixture values |
| Embedding model, dimensions, distance operator | WP04-T20 | D-04 through WP04-T19 | The synthetic 3-dimension cosine configuration |
| Retrieval `k`, fusion weights, per-source diversity cap | WP05-T03 | WP05-T06 baseline | Versioned default config |
| Retrieval quality targets (recall@k, MRR) and latency budget | WP05-T06 | WP05-T06 reviewer approval; latency derived from the chat first-token target | No gate claimed |
| Conflict-detection method and threshold | WP05-T04 | WP05-T04 (ADR) | Annotated conflicts only |
| Evidence packet limits (segments, tokens) | WP06-T04 | WP06-T04 with WP04-T19 cost data | Mock values |
| Message length, output tokens, request timeout | WP06-T02, WP07-T02 | WP00-T06 | Environment-schema bounds |
| Per-student daily allowance, rate and concurrency limits | WP06-T02, WP07-T02 | WP00-T06 with D-05 | Synthetic values |
| Claim-validator acceptance rule | WP06-T06 | WP06-T01 ADR measurement | None; no grounding gate claimed |
| No-save technical window, saved-chat retention, reported-content review window | WP06-T07 | D-08 and D-19 | Short synthetic values |
| Misuse-detection categories and thresholds | WP06-T07 | D-08 | Disabled |
| Quiz options per MCQ, timer rules, attempt expiry, item counts and difficulty levels | WP07-T01, WP07-T04 | WP07-T01 contract; founder confirms visible behaviour | Current fixture behaviour |
| Artifact size limits (items, depth) | WP07-T02 | WP00-T06 cost and WP07-T01 | Fixture values |
| Academic review sample size, rubric and second rater | WP04-T21, WP06-T08, WP07-T06 | WP00-T20 with the academic reviewer and the founders | None |
| Reconciliation intervals | WP08-T03 | §11.2 defaults, tuned in WP09 | §11.2 |
| Alert thresholds: queue age, error rate, database/storage capacity | WP08-T05 | WP08-T05, revised from WP09 measurements | Test values |
| Unattended observation window | WP08-T08 | WP08-T08, founder-approved | None |
| Success-signal definitions ("meaningful session", trust rating) | WP08-T10, WP11-T05 | WP08-T10 with the founders | None |
| Load profile, success and abort thresholds | WP09 | WP00-T07 ([load profile](../../planning/load-profile-100-students.yaml)) | Profile values |
| Beta wave sizes, observation windows, abort thresholds | WP11-T03 | WP11-T01 | §14.1 sizes |
| Day and week boundaries for allowances, budgets and deadlines | WP04-T13, WP06-T02, WP07-T02, WP08-T03 | WP04-T13 (midnight Africa/Cairo proposed; the founders choose the week's first day), tested across the daylight-saving change | Midnight Africa/Cairo |
| Per-provider/action concurrency, timeout and retries; unit prices | WP04-T13 | D-05 and WP04-T19 | The environment-schema defaults; every price 0 |
| Stopword and alias lists; Franco-Arabic handling | WP05-T02 | The founders with the academic reviewer | Negations kept; Franco-Arabic kept as typed |
| Gate case counts and how a percentage gate is read | §3.4, §16 | WP00-T20 founder choice | Current minimums, read as no miss on N |
| Language matrix: query language × source language, including Franco-Arabic | WP00-T05, WP00-T20, WP05-T06 | WP00-T20 from the inventory | Synthetic cells |

### 2.4 Recommended splits and forecast

Several open tasks combine a founder decision, a protected-path change and a material-UI approval, which the workflow cannot deliver as one reviewable PR. The agent who claims one of them first adds the split tasks to this runbook (workflow Pick step), keeping the original ID for the first part:

| Task | Recommended split |
| --- | --- |
| WP03-T34 | Governance dispatcher and catalog actions (migration) / admin catalog screens and synthetic parity (UI) |
| WP03-T35 | D-25 record (docs PR) / membership states and actions (migration) / student and admin screens (UI); wave provisioning moves under WP11-T02 |
| WP03-T38 | Link issue, redeem and revoke (migration) / submitter-identity schema change / entry, status and admin link screens (UI) |
| WP04-T02 | Logger and redaction / finalize creates the source version (migration) / reclaim, cancel and retry functions (migration) / dispatcher and failure classes |
| WP04-T13 | Cost reservations and scopes (migration) / database-backed flags and the cap action (migration) / the guard with concurrency, timeouts and preflight |
| WP04-T19 | Mock benchmark harness / benchmark run and the D-04 record / one PR per real adapter |
| WP06-T05 | Generation-runtime spike (CPU per chat) / stream handler and settlement / output policy and Content-Security-Policy / Chat and Materials screens (UI) / source-list function (migration) |
| WP08-T04 | Real-mode admin preview (protected) / dashboards (UI) |
| WP09-T02 | Load executor / profile versioning and configuration freeze |

**Forecast.** A reviewer's estimate, made from the tasks and the pace so far, puts the remaining packages at roughly 32–49 weeks of serial work against the master plan's 15–17. Phase 1 (WP01–WP02) took about three weeks against two planned, and Phase 0 decisions are still open after nine weeks. The main driver is founder decision latency: about twenty decisions sit on the critical path. Two waits are fixed: the seven-day soak in WP04-T14 and the unattended window in WP08-T08. D-01's cohort is Year 5, Term 1 of 2026/2027, which ends long before a realistic beta date, so WP00-T01 asks the founders which term the beta targets. Revisit this forecast at every package gate using the decision due dates in the register.

## 3. Work package 0: Pilot decision pack

**Outcome:** every real-data, provider, budget, retention, academic and load assumption that later packages need is either approved or explicitly blocked. This package produces decisions, policies and evaluation data; it calls no paid provider and processes no real private content.

**Primary artifacts:** `docs/decisions/`, `docs/policies/`, `planning/`, `evals/datasets/` and `evidence/wp00-pilot/`.

### 3.0 Tasks

#### WP00-T00 — Establish agent-first delivery controls

- [x] Agent-first workflow, task-record template, naming rules, readiness check and work-state command established and rehearsed from a clean snapshot; Ahmed approved on 2026-09-15. Record: [wp00-t00](../../planning/tasks/wp00-t00-agent-first-delivery-controls.md). Evidence: [agent readiness](../../evidence/wp00-pilot/2026-09-16_agent-readiness_local_5fd79cc.md). The workflow itself was later replaced by WP00-T18.

#### WP00-T01 — Create the planning workspace

**Needs from founders:** owner deadlines for every open decision, and the names of the review roles below. Everything else is staged.

**Depends on:** none. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [~] Create `docs/decisions`, `docs/policies`, `planning/tasks`, `evals/datasets/tutor`, `evals/datasets/studio` and `evidence/wp00-pilot` with scoped `README.md` files where Git needs a durable directory entry.
- [~] Stage the controlled inputs: cohort candidates (WP00-T02), source-rights inventory (WP00-T03), raw-data policy (WP00-T04), provider benchmark (WP00-T06, WP04-T19), load profile (WP00-T07), decision records and the gate report, each copied from `docs/templates/` with placeholders kept until the owning task supplies reviewed values.
- [~] Create `planning/decision-register.md` with `ID`, `decision`, `owner`, `due`, `record`, `resolution path`, `blocks` and `last reviewed`; status lives only in the master-plan log. A decision's resolution task may proceed and is never in its own blocked list.
- [~] Copy D-01 to D-16 from the master plan; keep approved directions approved.
- [~] Add the unresolved choices from §0.7 as D-17 onward and keep the master-plan decision log in sync.
- [~] Verify every `Open` or `Proposed` decision names the exact tasks it blocks, including when only the real-data or paid-adapter portion is blocked.
- [?] Obtain owner deadlines and a founder checkpoint; unresolved due dates stay explicit rather than invented. OWNER INPUT REQUIRED.
- [?] Name the holder of each remaining review role: security/data, cost, operations and the Veterinary academic reviewer (D-01 already names Ahmed for Human Medicine). D-10, D-18 and D-19 cannot be approved until the security/data role is named. OWNER INPUT REQUIRED.
- [?] Decide which academic term the beta targets: D-01's cohort is Year 5, Term 1 of 2026/2027, which ends long before a realistic beta date (§2.4). Follow Cohort A into Term 2 (new Modules and corpus) or target a later term, and record it in D-01. OWNER INPUT REQUIRED.

**Verify:** `pnpm lint:agents` (register links resolve); register rows match the master-plan decision log.

**Pass:** one register shows every open decision, its owner, deadline, role holder and blocked work.

**Evidence:** `evidence/wp00-pilot/<date>_decision-register_local_<sha>.md`. Record: [wp00-t01](../../planning/tasks/wp00-t01-create-planning-workspace.md).

#### WP00-T02 — Select cohorts using evidence, not preference

**Needs from founders:** candidate facts for each Veterinary cohort (D-02), independent scores, the Batch Leader per cohort and the Veterinary academic reviewer.

**Depends on:** none. **Decision gates:** none; this task resolves D-02. **Protected:** none. **Material UI:** no. **Real money:** no.

- [~] Create `planning/cohort-candidates.csv` (UTF-8, stable candidate IDs such as `HM-C01` and `VM-C01`); the header and ID contract are ready for review.
- [?] Enter every candidate cohort before scoring; the decision owners have not supplied candidate facts.
- [~] Score each dimension 0–5 using the anchors in `planning/cohort-selection-review.md`; the scoring contract is ready for review.
- [?] Add a `score_evidence` link for every 4 or 5 and a `remediation` note for every 0–2; no candidate rows exist yet.
- [?] Have Ahmed and Ziad score independently, then reconcile differences of two or more points in a recorded review.
- [?] Reject a cohort regardless of score if provider-processing or student-use rights are denied, no accountable academic reviewer exists, or complete-enough source material is unavailable.
- [~] Keep `docs/decisions/d-01-human-medicine-cohort.md`, `d-02-veterinary-medicine-cohort.md` and `d-03-pilot-institutions.md` current. D-01 and D-03 are approved directions; D-02 stays open.
- [?] Assign stable catalog codes for institution, program, level, term, cohort, curriculum edition and every unit after selection, in the schema's upper snake case (`^[A-Z][A-Z0-9_]*$`, §5.5); labels may be Arabic or English. WP03-T34 enters them through admin actions.
- [?] Obtain owner and review sign-off.

**Verify:** the candidates file matches its header and ID contract; scores reconcile per `planning/cohort-selection-review.md`.

**Pass:** each selected cohort has a reproducible score, the §3.1 fields, an ordered unit list, a named Batch Leader, a named academic reviewer and no blocking right. Record: [wp00-t02](../../planning/tasks/wp00-t02-select-pilot-cohorts.md).

#### WP00-T03 — Inventory sources and prove rights

**Needs from founders:** the real expected source list for Cohort A (and later Cohort B), rights holders and permission evidence for each source, and a security/data review.

**Depends on:** WP00-T01. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [~] `planning/source-rights-inventory.csv` is staged from the template (WP00-T01); one row is one expected source, not a folder or an informal collection.
- [?] Enter every expected source with an opaque ID such as `SRC-HM-0001` and the §3.2 fields; keep personal names out of IDs and filenames. OWNER INPUT REQUIRED.
- [?] Record rights as separate fields `temporary_storage`, `provider_processing`, `processed_retention`, `student_derivatives` and `future_commercial_use`, each `GRANTED`, `DENIED`, `UNKNOWN` or `NOT_APPLICABLE`, with linked permission evidence, who verified it and when. Record the rights holder and the grantor's authority to grant: a professor can license their own slides, but not third-party figures inside them. A chat message or verbal statement is never summarized as broader permission than it contains.
- [?] Flag patient/personal data, third-party copyright, original exams, duplicate editions, password protection, scan quality, handwriting, tables/diagrams and mixed-language audio.
- [?] Estimate pages, duration and bytes per source; WP04-T19 turns them into preflight costs.
- [?] Mark benchmark candidates (native PDF, scanned PDF, mixed-language audio, professor voice note) whose `provider_processing` right is `GRANTED` and that hold no personal data (or have recorded consent), for WP04-T19 (master plan §16 item 8).
- [ ] Add the §3.2 columns missing from the template (`rights_holder`, `grantor_authority_evidence`, `source_language`, `benchmark_candidate`).
- [ ] Add a validation script that sets `processing_eligible = false` whenever a required right is not `GRANTED` and fails on a missing field, duplicate ID or unreachable evidence link.
- [?] Have the security/data role review every real row before any upload.

**Verify:** the inventory validation script and its negative tests.

**Pass:** the row count matches the expected source manifest; no eligible row has a required `UNKNOWN` or `DENIED` right; evidence links are reachable by the designated reviewers; the benchmark set is marked.

#### WP00-T04 — Approve raw and processed data policy

**Needs from founders:** approval of D-10 after the security/data role is named. The D-19 real values are approved together with D-18 in WP04-T15, because they depend on the storage provider's absence semantics.

**Depends on:** WP00-T01. **Decision gates:** none; this task resolves D-10. **Protected:** none. **Material UI:** no. **Real money:** no.

- [~] Create `docs/policies/raw-data-lifecycle.md` from the controlled template; the executable draft is ready for review.
- [~] Define exact synthetic-test durations and starting events; real values wait for D-19.
- [~] Define `delete_after`, hold behaviour, failed conversion, deletion verification, retry intervals, overdue severity, retained metadata and takedown behaviour for deterministic tests.
- [~] Define the proposed minimum accepted output separately for native PDF, scanned PDF and audio; D-10 approval remains open.
- [~] Define temporary normalized audio/OCR storage and deletion behaviour.
- [~] State that database backup does not back up object storage and define processed-object durability independently.
- [~] Add a data-flow diagram naming every logical storage location and the mock/real adapter boundary.
- [?] Approve the D-10 processed contract with its §2.3 acceptance thresholds. OWNER INPUT REQUIRED.

**Verify:** the policy's decision table covers every raw-object state listed in §5.5.

**Pass:** given any source state, the executor can tell whether raw data must be retained, deleted, retried, quarantined or held, what happens to processed content after a takedown, and who can authorize the exceptional state. Record: [wp00-t04](../../planning/tasks/wp00-t04-approve-data-lifecycle.md).

#### WP00-T05 — Freeze evaluation data before provider selection

This task builds the dataset machinery and the synthetic suite. Real academic cases are authored in WP00-T20.

**Depends on:** none (the dataset directories already exist). **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

**Outputs:** `evals/datasets/tutor/v1/`, `evals/datasets/studio/v1/`, JSON Schemas, a synthetic segment corpus with stable IDs that reuses the existing canaries, a committed version lock, and a manifest generator and validator wired into `pnpm test:eval` and `pnpm test:node` (the suite CI runs).

- [ ] Create version directories `evals/datasets/tutor/v1` and `evals/datasets/studio/v1`.
- [ ] Add JSON Schemas for tutor cases, Studio cases, labeled claims (for the WP06-T01 validator measurement) and the dataset manifest, using the §3.4 fields.
- [ ] Add a manifest with dataset version, creation date, source-scope fingerprint, authors, reviewer, case counts by category, language mode and source language, and the SHA-256 of each JSONL file.
- [ ] Use stable case IDs; never renumber a case, supersede it with a new version.
- [ ] Create synthetic cases for every tutor category, every Studio artifact type and every language mode (English, Arabic, mixed and Franco-Arabic) with a source-language label on every case, each tied to synthetic fixture segments and canaries.
- [ ] Validate schema, duplicate IDs, category and language counts (at least one case per category and mode for this synthetic suite; the §3.4 minimums apply to cohort suites), required/forbidden claims and hashes; a committed version lock makes changed content under an existing version fail.
- [ ] Treat Franco-Arabic as a dataset label; requests store it as `MIXED`, because the database language codes are `EN`, `AR_EG`, `MIXED` and `OTHER`.
- [ ] Keep any case that reproduces private source text out of Git; it belongs in the restricted store with a redacted index.

**Verify:** `pnpm test:eval` and `pnpm test:node`; the validator's negative tests (malformed case, duplicate ID, edited file under the old version, missing category).

**Pass:** the synthetic suite covers every category and language mode, validates automatically, has no duplicate IDs and cannot change without a version and hash change.

#### WP00-T22 — Produce the pre-benchmark cost model

WP00-T06 asks the founders for six nonzero caps, but nothing estimates what the PoC will cost before the WP04-T19 benchmark measures it ([third review](../reviews/runbook-revision-2026-10/third-review.md) D6).

**Depends on:** none. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

**Outputs:** `planning/cost-model.yaml` and a short summary for the WP00-T06 decision.

- [ ] Using the WP00-T07 profile draft and the master plan §4.2 corpus, list the cost drivers: pages, audio minutes, segments, tokens per chat, Studio and quiz action, the validator and reasoning-token multipliers, retries, the share of students active per day, actions per active student per day, evaluation runs and load runs.
- [ ] Multiply each driver by two or three dated, cited public list prices per capability (OCR, transcription, embeddings, generation) and by the infrastructure scenarios (all Free plans; a paid database tier; a paid worker host).
- [ ] Report a low and high range per cost category and scenario, and propose caps set to the high case plus a stated headroom.
- [ ] Note the swing factors (model choice, reasoning tokens, retry loops, plan step-ups); WP04-T19 later replaces list prices with measured ones.

**Verify:** the model recomputes from its inputs with a script; every price links to its source and date.

**Pass:** the founders can set every D-05 scope from a cited range instead of a guess.

#### WP00-T06 — Freeze budget and provider enablement rules

**Needs from founders:** nonzero caps (D-05), the canonical currency and rate source, and alert recipients.

**Depends on:** WP00-T01, WP00-T22. **Decision gates:** none; this task resolves D-05. **Protected:** none. **Material UI:** no. **Real money:** no.

- [~] Stage the provider benchmark and create truthful open D-04/D-05 records; implementation is ready for review.
- [~] Define the currency/conversion evidence rule; the canonical real currency and rate source remain owner inputs.
- [?] Approve nonzero total, weekly, provider/action, per-source, per-student daily and per-request caps (§2.3). OWNER INPUT REQUIRED.
- [?] Name alert recipients and obtain separate Ahmed and Ziad confirmations before raising a cap.
- [~] Define reservation, 50/75/90% alerts, the 100% hard block, uncertain settlement, accepted-job treatment and kill-switch behaviour.
- [~] Make the zero-cost profile authoritative: every real adapter flag is false and deterministic mocks are the only enabled providers.
- [~] Define the zero-cost smoke story that proves coherent behaviour and a zero-valued cost ledger without provider network calls.

**Verify:** a recorded trace, per threshold, from reservation to ledger in the task record.

**Pass:** a reviewer can trace a request from reservation through provider call to cost ledger and name the automatic action at every threshold. WP04-T13 implements this. Record: [wp00-t06](../../planning/tasks/wp00-t06-freeze-provider-budgets.md).

#### WP00-T07 — Make the 100-student workload reproducible

**Needs from founders:** a human checkpoint on the synthetic profile.

**Depends on:** WP00-T01. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [~] Populate `planning/load-profile-100-students.yaml` as an exact synthetic mock contract.
- [~] Define warm-up, realistic ramp, peak academic burst, background-ingestion overlap, provider slowdown, worker death, cooldown and reconciliation as separate phases.
- [~] Specify duration, virtual users, arrival rate, think time, request counts, payload sizes and concurrency for every phase.
- [~] Give each synthetic cohort/unit a unique canary phrase for leakage detection.
- [~] Define success thresholds for HTTP success, first token, full response, queue age, job completion, database connections, reservations, duplicates, leakage and cost.
- [~] Define immediate abort thresholds for leakage, duplicate settlement, lost accepted work, cost, errors, queue age, database pressure and environment health.
- [~] Freeze the random seed and the synthetic dataset/fixture contract version.
- [?] Ahmed-or-Ziad human checkpoint on the synthetic profile. WP09-T02 builds the executor and versions the profile for its approved target. OWNER INPUT REQUIRED.

**Verify:** `pnpm test:load` validates the profile and writes its `NOT_EXECUTED` report.

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

**Outputs:** this runbook (revision 3.1), the [first](../reviews/runbook-revision-2026-10/findings.md) and [second](../reviews/runbook-revision-2026-10/second-review.md) review reports, the decision register and master-plan decision log in sync, and `pnpm agent:status` reading each task's `Depends on` line.

- [x] Audit the runbook against the master plan, the decision register, the status parser and the code at `74bd340`; publish the findings.
- [x] Fix the dependency order, add the missing governance, corpus, wiring, email, security-review and success-signal tasks, give every open task dependencies, gates, flags, proof and a pass line, and list the values still to set.
- [x] Run a second, independent review in five dimensions (master-plan traceability, code and schema reality, cross-document consistency, executability, platform and legal risk); verify every finding against its source; fix the runbook, the register and the status tool; publish the second report.
- [x] Record the product questions found as open decisions (D-25 to D-28 and the D-21 revision) without answering them.
- [x] Ahmed asked to deliver on 20 October 2026; delivered through [#102](https://github.com/unimind989-sys/UniMind-Project/pull/102) with required CI. The master-plan amendments stay unapplied until the founders approve them. These closure markers become authoritative only when that PR merges with green required CI.

**Verify:** `pnpm lint:agents`; `pnpm agent:status`; the `agent-status` unit tests; every pre-revision task heading is still present with the same text.

**Pass:** every master-plan deliverable maps to a task; no open decision appears approved; no completed task is reopened; `pnpm agent:status` recommends a task whose dependencies are all done. Record: [wp00-t19](../../planning/tasks/wp00-t19-runbook-revision.md).

#### WP00-T20 — Author and sign the Human Medicine evaluation suite

**Depends on:** WP00-T05, WP00-T03. **Decision gates:** none beyond the WP00-T03 source rows; D-01 names Ahmed as the Human Medicine academic reviewer. **Protected:** none. **Material UI:** no. **Real money:** no.

**Outputs:** `evals/datasets/tutor/v2/` and `evals/datasets/studio/v2/` (or restricted-store equivalents with a redacted index), a signed manifest, the academic review rubric, the case-count and second-rater decisions.

- [?] Cohort A source rows and rights approved in WP00-T03. OWNER INPUT REQUIRED.
- [ ] Ask the founders to choose how strong the percentage gates are (§3.4): with 15 unavailable cases, "at least 95%" means 15 of 15, and 15 of 15 only shows the true rate is above about 82% (one-sided 95% confidence); showing 95% with no miss needs about 59 cases per gated category. Either raise the gated-category minimums or record each gate as "no miss on N" with its bound. Record the choice in §2.3.
- [ ] Ask the founders whether an independent second rater grades at least 20% of every academic review sample, blind to the validator's verdict, with Cohen's kappa reported; Ahmed both authors the cases and is the reviewer under D-01. An outside rater gives evidence, not project authority (D-22 keeps every reviewer role with the founders). If not, record the single-rater risk.
- [ ] Author at least 100 distinct tutor cases (target 100–150) against the inventoried Cohort A sources, meeting every §3.4 category minimum (or the raised minimums); cover every query-language × source-language pair that occurs in the inventory, including Franco-Arabic questions over English sources, and report the counts per pair.
- [ ] Author at least 30 Studio/MCQ cases covering every artifact type (target 30–50).
- [ ] Label a claim-support set for the WP06-T01 validator measurement, including unsupported variants with altered doses, numbers, negation and laterality, in English, Arabic, mixed and Franco-Arabic text.
- [ ] Split the suite into a calibration part (tuning allowed) and a sealed test part used only for gate runs.
- [ ] Write the academic review rubric and sample sizes used by WP04-T21, WP06-T08 and WP07-T06 (§2.3).
- [ ] Freeze cases that reproduce private source text in the restricted store; commit only IDs, hashes and redacted metadata.
- [ ] The academic reviewer signs the manifest before WP04-T19 benchmarks providers on it.

**Verify:** `pnpm test:eval` validator on the new version; manifest hash check.

**Pass:** the signed suite meets every chosen minimum, has a sealed test part, validates automatically and cannot change without a new version.

#### WP00-T21 — Establish the data-protection route for real data

Egypt's Personal Data Protection Law and its executive regulations apply to the student and professor data UniMind will hold, and every planned processor is outside Egypt ([second review](../reviews/runbook-revision-2026-10/second-review.md) A1). This task records the founders' route; it is not legal advice.

**Depends on:** WP00-T18. **Decision gates:** none; this task resolves D-28. **Protected:** none. **Material UI:** no. **Real money:** yes if a licence, permit or legal counsel is paid.

**Outputs:** an approved D-28 record, a record of processing activities, a subprocessor list with regions and transfer basis, consent and notice requirements for WP11-T02, data-subject request requirements for WP08-T11.

- [ ] Prepare D-28 with the founders and, if they choose, legal counsel: whether and how Law 151 of 2020 and Ministerial Decree 816 of 2025 apply (the compliance period was reported to end around 1 November 2026); licence or permit from the Personal Data Protection Centre; cross-border transfer to foreign processors (Vercel, Supabase, AI providers, email sender, backup host); consent wording and how consent is recorded; sensitive data such as health details in chats; minimum age and minors; breach-notification duties and deadlines; access, correction and deletion requests; professors' voice recordings as personal data.
- [ ] Write the record of processing activities and the subprocessor list with regions; WP04-T14 to WP04-T19 add each processor they choose.
- [ ] Obtain Ahmed's and Ziad's approval of D-28 (this step becomes `[?]` while it waits).

**Verify:** the D-28 record, the processing record and the subprocessor list exist and link from the decision register.

**Pass:** D-28 is approved; every planned processor appears with its region and transfer basis; WP04-T18, WP08-T07, WP08-T11 and WP11-T02 can cite concrete requirements.

### 3.1 Cohort decision fields

Each cohort decision record (WP00-T02) contains: education stage; institution; program/faculty; academic level; term; cohort/batch name and curriculum-edition identifier; curriculum-unit type with English/Arabic singular/plural labels; ordered Module/Subject list; Batch Leader name and contact route; academic reviewer; expected tester count.

Score each candidate 0–5 on source completeness, permission clarity, Batch Leader reliability, reviewer availability, exam material, audio quality, student demand and the availability of 50+ relevant evaluation questions. Record totals and the selection reason.

### 3.2 Source inventory fields

One row per expected source (WP00-T03): proposed cohort and unit; title, source type, format, approximate pages/minutes/bytes and language; whether it holds professor explanation, exam hints, corrections or exclusions; owner/contributor, rights holder, the grantor's authority to grant and permission evidence; source language; the five rights fields; patient/personal-data risk; duplicate/older-version risk; benchmark candidate flag.

Block provider processing when the corresponding right is `UNKNOWN` or `DENIED`. Possession never equals processing or commercial permission.

### 3.3 Raw-data policy contents

The policy (WP00-T04) states: maximum temporary retention; conditions before deletion (complete output, readable processed object, checksum, coverage, locator/metadata integrity, quality status); behaviour when conversion fails; behaviour when deletion fails; legal/rights hold and who may authorize it; deletion verification per storage provider; metadata retained after deletion; takedown/deactivation of processed material, including whether processed text and embeddings are purged.

The default is no permanent raw retention. Audio is fully transcribed before deletion. PDFs and books have meaning-preserving compact processed output before deletion.

### 3.4 Evaluation dataset fields and minimums

Tutor case fields: `case_id`; cohort and unit IDs/slugs; question, language mode (English, Arabic, mixed or Franco-Arabic) and expected source language; expected evidence source versions/segments or topic locator; expected evidence class `FULL`, `PARTIAL`, `UNAVAILABLE` or `CONFLICTING`; required and forbidden claims; professor-hint expectation; educational-case or explicit-real-patient classification; severity and reviewer notes.

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

With these minimums a percentage gate is in effect "no miss": 15 of 15 shows a true rate above about 82% at one-sided 95% confidence, 10 of 10 about 74%, and 5 of 5 about 55%; about 59 cases with no miss are needed to show 95%. WP00-T20 records whether the founders raise the gated minimums or accept "no miss on N" with its bound.

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

- [x] Two Supabase Free projects repurposed as synthetic Preview and locked, empty Beta with separate Vercel Hobby scopes, secrets and callbacks; fail-closed health endpoints and `pnpm smoke:deployment`; promotion and rollback rehearsed with [environment promotion](environment-promotion.md). Beta real data stays blocked until an approved encrypted backup/restore procedure passes and the later rights, security, release and go-live gates pass (D-21); WP04-T15 prepares a revision for sources before go-live. Record: [wp01-t09](../../planning/tasks/wp01-t09-provision-isolated-environments.md). Evidence: [Preview isolation](../../evidence/wp01-foundation/2026-08-29_environment-isolation_preview_4021457.md), [Beta isolation](../../evidence/wp01-foundation/2026-08-29_environment-isolation_beta_4021457.md).

#### WP01-T10 — Write the repository operation tutorial

- [x] `CONTRIBUTING.md` covers mock-only development, disposable CI, guarded Preview/Beta operation, the command table and recovery; a fresh agent followed it from a clean clone. Record: [wp01-t10](../../planning/tasks/wp01-t10-write-operation-tutorial.md). Evidence: [tutorial](../../evidence/wp01-foundation/2026-08-30_repository-tutorial_local_c9543ad.md).

#### WP01-T11 — Run the package gate

- [x] Clean-clone `pnpm verify` with provider network blocked, two disposable resets with stable types, Preview smoke, secret search and recorded versions. Record: [wp01-t11](../../planning/tasks/wp01-t11-run-package-gate.md). Evidence: [foundation gate](../../evidence/wp01-foundation/2026-08-30_foundation-gate_preview_d7997eb.md).

### 4.1 Environments

| Environment | Hosts | Data | Providers |
| --- | --- | --- | --- |
| Workstation | Next.js development process, browsers, tests | Synthetic fixtures | Deterministic in-process mocks |
| CI | Disposable Supabase stack on a GitHub-hosted runner | Synthetic seed only | Mocks |
| Preview | Supabase Free project + Vercel Hobby scope `unimind-preview` | Synthetic only, forever | Mocks only (D-21) |
| Beta | Supabase Free project + Vercel Hobby scope `unimind-beta` | Empty until the backup, rights, security, release and go-live gates (D-21); the D-21 revision prepared in WP04-T15 may allow rights-cleared sources after WP04-T18, still with no students | Real adapters after WP04-T19, inside approved caps |

The [environment matrix](../../planning/environment-matrix.md) owns the current environment facts; change it together with this table. Each environment has its own database, storage namespaces, secrets, callbacks, reset permissions, worker namespace and provider budget scope. Never point one environment at another's data, and never copy real chats or private sources into CI or Preview.

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
- Source format is metadata on the source version, never a separate pool. Professor-insight tags are `PROFESSOR_HINT`, `EXAM_EMPHASIS`, `EXCLUSION`, `CORRECTION` and `LIKELY_QUESTION` on segments.
- Every processed document, locator, segment and embedding belongs to exactly one source version; every segment carries join-verifiable cohort, unit and edition scope.
- Idempotency keys are unique per namespace (submissions, jobs, reservations, Studio requests, quiz submissions).
- The embedding column is an unsized `vector`; only the synthetic index and `retrieve_authorized_segments` assume 3 dimensions. WP04-T20 sets the real configuration after D-04 (§5.5).
- The free PoC creates no payment-order or receipt table.

### 5.2 Derived availability and retrieval scope

A unit is available to a caller only when the caller is authenticated; has an active cohort membership (or is an authorized admin previewing); the cohort release is `UNLOCKED`; the unit is `PUBLISHED`; at least one active source version is `READY`; source rights remain valid; and source and unit match the current curriculum edition. The worker-only retrieval function takes trusted server scope, revalidates the requesting user's access and never accepts a client-supplied cohort or unit filter without server validation.

### 5.3 RLS and grant rules

- Students read their own profile, membership, sessions, messages, artifacts and attempts, plus authorized published catalog and source metadata. The usage ledger and reservations are server-only (`unimind_private`); students see allowance state only through a server-derived view (WP06-T02). They never read raw objects, provider calls, job errors, other users, inactive sources or unpublished units.
- Batch Leaders reach only their assigned campaign, its requested items and their own submissions; they cannot publish, unlock, see chats, assign roles or see another campaign.
- Admins act through explicit audited server/database functions for destructive or security-sensitive actions.
- Workers use private schemas or service-role access only from trusted runtimes.
- An unavoidable `SECURITY DEFINER` function sits outside exposed schemas, sets a safe `search_path`, authorizes the caller inside, revokes `PUBLIC` execute and has an unauthorized-execution test.

### 5.4 Database tests every later migration keeps green

Student A cannot read Student B's chat, artifact, attempt or usage rows; Cohort A cannot retrieve Cohort B segments; a member cannot see a locked cohort or an unpublished or empty unit; a Batch Leader cannot publish, unlock, assign roles or see chats; inactive membership removes availability immediately; replacing a source preserves historical answer evidence; a repeated idempotency key creates one submission, job, reservation or artifact; an update cannot move a row into another user's or cohort's scope; revoked rights remove active retrieval without deleting audit or provenance; service credentials never appear in client responses.

### 5.5 Schema facts open tasks must respect

Read from `supabase/migrations/` on 20 October 2026. When a task needs something different, it adds a forward migration; it never assumes a name that does not exist.

| Area | What exists today |
| --- | --- |
| Catalog codes | Every catalog table checks `code ~ '^[A-Z][A-Z0-9_]*$'` (upper snake case). |
| Memberships | States `PENDING` (default), `ACTIVE`, `SUSPENDED`, `EXPIRED`, `REVOKED`; no function creates a membership. |
| Releases and publication | Cohort release `LOCKED` (default) or `UNLOCKED` in `cohort_releases`; unit publication `DRAFT`, `PUBLISHED` or `WITHDRAWN`. |
| Source versions | `rights_status` `PENDING` (default), `VALID`, `BLOCKED`, `REVOKED`, `EXPIRED` — no action sets it; `processing_status` `RECEIVED`, `VALIDATING`, `PROCESSING`, `NEEDS_REVIEW`, `READY`, `FAILED`, `REJECTED`; `activation_status` `INACTIVE`, `ACTIVE`, `DEACTIVATED`; `governance_state` `AVAILABLE` (default) or `QUARANTINED`. |
| Raw objects | States `PENDING`, `STORED`, `DELETE_PENDING`, `DELETE_FAILED`, `HELD`, `DELETED`, `FAILED`; events `REQUESTED`, `SUCCEEDED`, `FAILED`, `VERIFIED_ABSENT`, one per attempt; a hold starts only from `STORED`. |
| Uploads | `unimind_private.collection_uploads` allows only the mock storage provider, PDF/WAV/PNG and at most 10 MiB; finalize (`finalize_synthetic_source_submission_internal`) inserts a `RECEIVED` submission and marks the upload `FINALIZED` and the requested item `RECEIVED`; it creates no source asset, version, raw object or job. |
| Jobs | Types `VALIDATE`, `EXTRACT`, `OCR`, `TRANSCRIBE`, `NORMALIZE`, `QUALITY`, `RAW_DELETE`, `CHUNK`, `EMBED`, `INDEX`, `RECONCILE`, `GENERATE`; states `QUEUED`, `RUNNING`, `RETRYING`, `SUCCEEDED`, `FAILED`, `CANCELLED`; `unimind_private.claim/heartbeat/succeed/retry/fail_processing_job` (service role, leases up to 15 minutes); no reclaim or cancel function. |
| Usage and budgets | `unimind_private.reserve/settle/release/expire_usage` over `usage_reservations` (user required, units only); `budget_counters` scopes `SYSTEM`, `PROVIDER`, `ACTION`, `COHORT`, with no writer. |
| Segments and embeddings | `source_segments.content` is required and immutable, unique per (source version, content hash); evidence tables reference segments `on delete restrict`; `segment_embeddings.embedding` is an unsized `vector` checked by `validate_embedding_dimensions`; the only index and `retrieve_authorized_segments` hard-code the synthetic 3-dimension cosine configuration; full-text search uses the `simple` configuration with reciprocal-rank fusion. |
| Readiness | `unimind_private.assert_source_version_ready_prerequisites` checks the processed document, a latest quality report of `PASS`, at least one active segment, and an embedding for every active segment under some active configuration (several may be active); it does not check rights or raw deletion. |
| Chat | Retention modes `MINIMAL`, `HISTORY`, `DISABLED` (also on `profiles.chat_retention_mode`); `chat_answers.evidence_status` `FULL`, `PARTIAL`, `UNAVAILABLE`, `CONFLICTING`; students can insert sessions and messages directly. |
| Studio and quiz | Artifacts are readable only through the requesting user's own request; `quiz_attempts` has mode `PRACTICE`/`REVIEW`, no state, snapshot or expiry columns, and students can insert attempts and update `submitted_at`; `feedback_reports` cannot target a quiz item. |
| Governance actions | `unimind_private.admin_action_commands` via `public.submit_admin_governance_action`: twelve actions (publish/hide, unlock/lock, activate/deactivate/quarantine/retry source, place/remove raw hold, enable/disable flag); all twelve run inside one ~880-line function, `unimind_private.admin_submit_governance_action`; `ENABLE_FLAG` accepts only `mock.artifact.*`; hold actions accept only synthetic `mock-object-storage-provider` objects under `synthetic/`, and removing a hold requires a READY, embedded source; `RETRY_SOURCE` changes no source or job data, requires current `VALID` rights and leaves a command in `PENDING_OWNER_REVIEW` (no exit), after which `admin_action_commands_one_pending_retry` blocks further retries of that version. |
| Provider flags | Real providers are environment variables (`GENERATION_`, `EMBEDDING_`, `TRANSCRIPTION_PROVIDER_ENABLED`); there is no OCR flag. |

## 6. Work package 3: Product shell and governance controls

**Outcome:** each role completes its non-AI journey in the approved bilingual visual system; server-derived scope and database policy prevent URL or form manipulation; release state is safe and auditable; and admins can configure the catalog, grant membership and run campaigns without SQL.

**Package gate (shell):** [product-shell gate](../../evidence/wp03-product-shell/2026-09-29_product-shell-gate_local_fda875f.md). The governance tasks WP03-T34 to WP03-T36 carry their own proof.

Every WP03 frontend task follows [the frontend guide](../agents/frontend.md): the quality floor, the material-change rule and the skill and browser map. Playwright Test is the repeatable E2E gate. Component sources and catalogs follow the frontend guide: a new source needs a founder decision, and `pnpm verify` and a clean-clone build never need a catalog account, key, network call or paid credit.

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

- [x] One adapter seam feeds the shared study workspace, Study Shelf and Settings; tools without a real backend (Chat, Studio, Quiz, evidence, report and the Settings privacy controls) render disabled in real mode (PR #80). WP06-T05, WP06-T07, WP07-T03 and WP07-T04 enable them. Record: [wp03-t17](../../planning/tasks/wp03-t17-shared-student-screens.md).

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

Master plan §7.2 step 1. No function or server action creates catalog rows today, and in real mode every `/admin/[resource]` page (catalog, cohorts, campaigns, sources, jobs, quality, usage, incidents) shows a "not available yet" notice; catalog rows exist only in database tests, browser-test fixtures and the synthetic runtime.

**Depends on:** WP03-T06. **Decision gates:** none (D-12 and D-23 are approved). **Protected:** RLS and migrations. **Material UI:** yes, the admin catalog resource screens. **Real money:** no.

**Outputs:** catalog governance actions in the existing admin command pipeline; the real admin catalog screens; pgTAP and E2E tests; an updated [RLS matrix](../security/rls-matrix.csv).

- [ ] Extend the existing pipeline (`unimind_private.admin_action_commands` through `public.submit_admin_governance_action`) instead of building a new one. Its action check lists only the twelve WP03-T06 actions and `target_id` is required, so design how create actions name their target; add `governance_version` to the catalog tables that lack it and `append_governance_audit` triggers to every catalog table. All twelve existing actions run inside one ~880-line function (`unimind_private.admin_submit_governance_action`): first restructure it into a dispatcher with per-family functions and a `p_payload jsonb` argument, dropping and re-creating the public wrapper and regenerating types, so WP03-T35 to WP03-T37 add actions without rewriting it.
- [ ] Add actions to create, edit and deactivate education stages, institutions, programs (type, progression mode, default unit type, English/Arabic singular and plural unit labels), academic levels, terms, cohorts with curriculum editions, and curriculum units (order, optional parent). Every action takes the actor, expected prior version, reason and correlation ID. Creating a cohort also inserts its `LOCKED` `cohort_releases` row, which `UNLOCK_COHORT` later updates.
- [ ] Respect the schema: codes match `^[A-Z][A-Z0-9_]*$`; uniqueness within the parent and the same-cohort parent rule already hold. Add only what is missing: codes immutable once referenced, deactivation instead of delete for referenced nodes, reactivate actions, and no program activation without complete English and Arabic labels. Availability and the catalog-journey functions read no catalog node's status today: make deactivated stages, institutions, programs, levels, terms and cohorts leave availability (a unit leaves through `HIDE_UNIT`).
- [ ] Terminology and progression come from program data only; no faculty-name branch. `FLEXIBLE_CREDIT` stays configuration within the D-23 scope.
- [ ] Build the real admin catalog screens: tree view, create/edit/deactivate forms, a preview of the student-facing labels, stale-version and validation errors, EN/AR, phone and desktop; keep the synthetic admin journey on the same screens.
- [ ] Test: non-admin denied; stale version rejected; duplicate code rejected; deactivating a node removes it from student availability without breaking history; a Veterinary program configured only through these actions renders `Subjects`.
- [ ] Promote the migration to Preview through environment promotion; once Beta holds data, migrations reach it only through WP04-T23.

**Verify:** `pnpm check`; `database-ci` (pgTAP and `pnpm test:e2e:database`); `pnpm test:e2e:demo`; independent review of the migration and functions.

**Pass:** an admin builds a complete program hierarchy down to ordered units in both languages without SQL; every change is audited; the student catalog changes only through derived availability; `Approved commit:` recorded.

#### WP03-T35 — Grant cohort membership to students

Availability needs an active membership (§5.2), but no document says how a student gets one and no code creates one.

**Depends on:** WP03-T34. **Decision gates:** none; this task resolves D-25. **Protected:** auth and authorization, RLS and migrations; production configuration if sign-up becomes invite-only. **Material UI:** yes, the student no-membership/pending states and the admin membership screens. **Real money:** no.

**Outputs:** the approved membership path as governance actions and screens; tests; an updated RLS matrix.

- [ ] Prepare D-25: write `docs/decisions/d-25-student-cohort-membership.md` with the options (for example an admin allow-list of verified emails per cohort, admin approval of a student request, or a cohort enrollment code), their abuse and privacy risks, who may revoke, whether registration stays open or becomes invite-only, and the effect on WP11 wave provisioning. An allow-list stores student emails before they register, which is a D-28 question. Deliver the record as its own docs PR.
- [ ] Obtain Ahmed's and Ziad's approval of D-25 and update the master-plan log and the register (this step becomes `[?]` while it waits).
- [ ] Implement only the approved path through the admin command pipeline. Membership states are `PENDING` (the default), `ACTIVE`, `SUSPENDED`, `EXPIRED` and `REVOKED`, with a partial unique index over `PENDING/ACTIVE/SUSPENDED`; add the missing revoke columns and a membership transition kind, and keep `starts_at`/`ends_at`. The browser never asserts a cohort.
- [ ] If D-25 allows admin provisioning, add idempotent wave provisioning for WP11 (a list of verified emails per cohort with a dry-run report and no duplicate memberships).
- [ ] Student-facing states: no membership, pending, active, expired and revoked, with honest copy that never reveals another cohort's configuration. Rewrite the shipped no-membership copy (it promises admission by faculty email or through a Batch Leader) and the landing and registration entry to match D-25.
- [ ] Keep the eligibility check in one function so a later `FLEXIBLE_CREDIT` per-student unit set can be added without changing callers (D-23); build no unit set now.
- [ ] Admin screens to grant, suspend and revoke with a reason; revocation follows the [session revocation policy](../policies/auth-session-revocation.md).
- [ ] Test: forged cohort, duplicate grant, expired and revoked mid-session (the next server operation fails safely), cross-cohort request, Batch Leader or anonymous caller denied.

**Verify:** `pnpm check`; `database-ci`; `pnpm test:e2e:database` for each state; independent review.

**Pass:** a verified student gains access to exactly the approved cohort only through the approved path; revocation removes availability on the next server operation; every grant and revoke is audited; `Approved commit:` recorded.

#### WP03-T36 — Create campaigns and requested materials

Master plan §7.2 step 2 and §3.4 step 1. No function or action creates campaigns, requested items or assignments today.

**Depends on:** WP03-T34. **Decision gates:** none. **Protected:** auth and authorization; RLS and migrations. **Material UI:** yes, the admin campaign screens and the Batch Leader request view. **Real money:** no.

**Outputs:** campaign governance actions and screens, the needs-information loop, tests, an updated RLS matrix.

- [ ] Add campaign actions to the admin command pipeline: create a campaign for an exact cohort and unit scope with open/close dates; open it (campaigns start `DRAFT`, and finalize needs `OPEN`); add, edit and remove requested-material items (type, required/optional, naming guidance — `requested_material_items` has no guidance column today); close a campaign with a reason; audit triggers on every campaign table.
- [ ] Add the needs-information loop: an admin marks a submission `NEEDS_INFORMATION` with a reason and the Batch Leader answers it; store both (no column holds them today); define the state after an answer; the submission states match master plan §7.3.
- [ ] A closed or expired campaign accepts no new submission; accepted submissions keep processing.
- [ ] Until WP03-T38, assign Batch Leaders in tests through a database fixture: no action creates assignments or `BATCH_LEADER` roles today, and D-24 says the account screens are not extended.
- [ ] Prove the governance loop end to end on synthetic storage: configure catalog → create campaign → assign the Batch Leader → submit → request information → answer → publish and unlock → a student with a membership (the WP03-T35 path, or a database-test fixture until it exists) sees the unit once a synthetic source is `READY` (a database fixture supplies the `READY`, `VALID` source version, because processing and rights actions come later).

**Verify:** `pnpm check`; `database-ci`; `pnpm test:e2e:database` for the loop; independent review.

**Pass:** master plan admin steps 2 and the needs-information part of the Batch Leader journey run through product screens without SQL; `Approved commit:` recorded.

#### WP03-T37 — Record source rights and source decisions

Every availability and retrieval rule requires `source_versions.rights_status = 'VALID'`, but rights default to `PENDING` and no action sets them, so no real source could ever become available ([second review](../reviews/runbook-revision-2026-10/second-review.md) B1). Master plan §3.3 makes rights a founder governance control.

**Depends on:** WP03-T34. **Decision gates:** none; rights changes are a D-22 protected gate and use the existing two-founder confirmation pattern. **Protected:** RLS and migrations. **Material UI:** yes, the admin source screens. **Real money:** no.

**Outputs:** rights and source-decision actions in the admin command pipeline, screens and tests.

- [ ] Add actions to record a source version's rights from its WP00-T03 inventory row (evidence link, `rights_valid_from`, `rights_valid_until`) and to block, revoke or expire them, each with a reason; rights states are `PENDING`, `VALID`, `BLOCKED`, `REVOKED` and `EXPIRED`.
- [ ] Add an action to reject a source version with a reason (master plan §7.2 step 9; `REJECTED` exists as a processing status but no action sets it, and it is reachable only from `VALIDATING` or `NEEDS_REVIEW`, so rejecting a `FAILED` or `READY` version needs a new transition).
- [ ] Ask the founders which inventory rights fields must be `GRANTED` for `VALID` (proposal: `temporary_storage`, `provider_processing`, `processed_retention` and `student_derivatives`) and whether block, revoke and expire are single-founder containment like the WP03-T06 pattern (proposal: yes; recording `VALID` takes two). This step becomes `[?]` while it waits.
- [ ] Enforce `VALID` rights on the transition to `READY` with a trigger, not a check constraint, so a later revocation of a `READY` version stays legal.
- [ ] A Batch Leader's declaration never sets `VALID`; only these actions do, with the second founder confirmation the WP03-T06 pattern already models.
- [ ] Revocation or expiry removes the source from retrieval at once and records a takedown request that WP04-T11 processes.
- [ ] Build a read-only, audited source timeline and a review view of processed text, transcripts and tags, so admins can watch and spot-check the corpus in WP04-T21 without SQL.
- [ ] Test: declaration alone stays `PENDING`; one-founder confirmation stays pending; expiry by date; revocation during an active chat; non-admin denied.

**Verify:** `pnpm check`; `database-ci`; `pnpm test:e2e:database`; independent review.

**Pass:** a source becomes eligible for `READY` only after an audited rights decision linked to its inventory row; revocation removes it from retrieval on the next query; `Approved commit:` recorded.

#### WP03-T38 — Give Batch Leaders scoped access

Master plan §7.2 step 3 and §7.3.

**Depends on:** WP03-T36. **Decision gates:** D-24 (Ziad's confirmation is pending). **Protected:** auth and authorization, RLS and migrations, storage (upload route). **Material UI:** yes, the Batch Leader entry and status views. **Real money:** no.

**Outputs:** the approved Batch Leader access path, its security review, tests.

- [?] D-24 approved: one-time upload links ([D-24 record](../decisions/d-24-batch-leader-one-time-upload-links.md)) or the current account-based access. OWNER INPUT REQUIRED.
- [ ] Implement the approved path and meet every non-negotiable requirement in the D-24 record, including the audit of issue, use, expiry and revocation with the issuing admin. For links, change the schema that assumes an account today: `source_submissions.submitted_by`, `collection_uploads.uploaded_by` and `batch_leader_assignments.user_id` reference profiles, and `has_campaign_assignment` uses `auth.uid()`. Retire the path not chosen.
- [ ] Build the admin screen to issue, copy (shown once), set expiry for and revoke a link, and design the expired, revoked, already-used and campaign-closed states, including a link that expires while files are still queued. Opening a link uses nothing up (chat apps prefetch links); a button press starts the upload session. The entry works at 360 px first and takes `?lang=` since there is no account language. Ask the founders whether a link user accepts contributor terms or gives a name (personal data under D-28). Update `DESIGN.md` for the changed Batch Leader shell and replace the demo leader login with a simulated link.
- [ ] Define how a link-based Batch Leader sees submission status and answers a needs-information request (for example a reusable, revocable status link) and how the link reaches them: an admin may hand it over out of band; email delivery needs D-26 (WP04-T17).
- [ ] Test: replayed, expired and revoked links; wrong campaign; a scan proving no link token appears in logs, analytics payloads or referrers; the Batch Leader cannot publish, unlock, see chats or reach another campaign; idempotent finalize unchanged.

**Verify:** `pnpm check`; `database-ci`; `pnpm test:e2e:database`; independent security review of the access design recorded in the task record.

**Pass:** a Batch Leader submits and tracks sources for exactly one campaign through the approved path; the access design passed independent review; `Approved commit:` recorded.

### 6.1 Routes

Current routes: `/` (landing); `/(auth)/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/consent`, `/welcome`; `/auth/callback`; `/learn`; `/learn/[cohortId]/[unitId]` with `chat`, `studio`, `quiz`, `sources`, `evidence` and `report`; `/settings`; `/batch-leader` and `/batch-leader/campaigns/[campaignId]`, with uploads at `/api/batch-leader/campaigns/[campaignId]/uploads`; `/admin` and `/admin/[resource]`; `/api/health/live` and `/api/health/ready`. The synthetic runtime path is loopback-only and returns 404 in production. WP03-T38 may add a link-entry route for Batch Leaders if D-24 is approved.

### 6.2 Filter behaviour

Dependent server-authorized filters in this order: education stage; institution/system; program/faculty; academic level; semester/term for `TERM_BASED` programs (for `FLEXIBLE_CREDIT`, the configured course-plan period without a rigid semester list); released cohort when more than one matches; available Modules or Subjects. Changing an upstream filter clears invalid downstream choices. Empty states distinguish no configured catalog, no membership, locked cohort, unpublished unit and no READY sources without exposing private details. A flexible-credit program lists only the caller's eligible course-plan units and never takes browser-selected units as authorization.

### 6.3 Curriculum unit workspace

The workspace shows the institution/program/level/term/cohort breadcrumb, the dynamic Module/Subject title, Chat, Studio and Quiz navigation, source-pool status and last material update, the source list (title and format) when allowed, usage and allowance state, language mode, and a scope switcher that starts or selects the right session. Every chat and Studio call derives scope from the authenticated server record and verifies it again.

### 6.4 Admin governance controls

Separate audited actions exist for: publish/hide a unit; unlock/lock a cohort; activate/deactivate a source version; quarantine a failed or needs-review source; record a retry request (no effect yet, §5.5); place/remove a hold on a synthetic mock-storage raw object; enable a `mock.artifact.*` flag or disable any flag (WP03-T06). Real providers have no admin action until WP04-T13. WP03-T34 adds catalog configuration, WP03-T35 membership, WP03-T36 campaigns, WP03-T37 rights and source decisions (record, block, revoke, expire, reject) and WP03-T38 Batch Leader access. Show the exact failed availability predicate before unlock or publish; a unit with zero active READY sources never appears.

### 6.5 Batch Leader submission

The submission requires campaign, requested item or unit, title, format, rights declaration, professor/source description and file or approved reference. The client creates the idempotency key before upload; upload goes directly to storage through a short-lived exact-object target (WP04-T03); finalize runs through a server mutation after checksum and metadata confirmation. The access model follows D-24 (WP03-T38).

### 6.6 UI rules every later screen keeps

Human Medicine renders Modules and Veterinary renders Subjects from data; Arabic is RTL while English medical terms stay readable; no missing-key or wrong-language fallback; browser navigation never changes the authorized scope silently; locked, unpublished or empty units never appear available; admin preview is visibly marked and creates no membership; protected actions never complete from one founder confirmation; critical flows reflow at the minimum mobile width and 200% text, support keyboard, touch and screen readers, respect reduced motion and keep visible focus; loading, empty, error, offline, success, disabled and stale states use the approved component language. Every material-UI task also writes English and Arabic copy for each new state (a founder approves it with the candidate), keeps the synthetic runtime in step (rule 20), and states the frontend floor in its Verify line: real and synthetic modes, axe in English and Arabic at 360 and 1440 px, light and dark themes, 44 px touch targets.

## 7. Work package 4: Automated source pipeline and real-data readiness

**Outcome:** a finalized submission moves to `READY` or a precise terminal exception without manual database work; raw data is deleted only after verified processed output; replay creates no duplicate state or cost. The package proves this first on synthetic fixtures with mocks (WP04-T01 to WP04-T12), then puts every real-data control in place and passes the real-data gate (WP04-T13 to WP04-T18), then selects providers on real samples and processes the real Cohort A corpus (WP04-T19 to WP04-T21).

**Primary artifacts:** `src/lib/ingestion/`, `src/lib/jobs/`, `src/lib/storage/`, `src/lib/usage/`, `src/lib/observability/`, `workers/ingestion/`, `workers/reconciliation/`, `supabase/migrations/`, `tests/fixtures/ingestion/` and `evidence/wp04-ingestion/`. The processing rules are §7.1 to §7.9 and the existing schema facts are §5.5; tasks reference them instead of repeating them.

### 7.0 Tasks

#### WP04-T01 — Freeze processor contracts before real files

**Depends on:** WP03-T08. **Decision gates:** D-10. **Protected:** none. **Material UI:** no. **Real money:** no.

**Outputs:** versioned Zod schemas in `src/lib/ingestion/`, synthetic fixtures with expected outputs in `tests/fixtures/ingestion/`, an ADR for duplicate and replacement rules, a proposed accepted-format list.

- [?] D-10 approved by Ahmed and Ziad with the security/data role named (WP00-T01). The D-10 record lists this task as blocked; the founders may instead allow WP04-T01 to WP04-T13 to build on the proposed contract with synthetic data only. OWNER INPUT REQUIRED.
- [ ] Define versioned schemas for `InspectedSource`, `ProcessedDocument`, `Locator`, `Segment`, `SegmentTag`, `QualityReport` and every job input/output in §7.1. Each carries the applicable fields of: schema version, source-version ID, checksum, content hash, language profile, coverage map, warnings and correlation ID.
- [ ] Keep large payloads in processed object storage and checksums plus workflow state in PostgreSQL; no unique state lives only in an object or a queue message. Store the Markdown and its JSON sidecar as one bundled processed object, or migrate `processed_documents` (one `object_key` and checksum today); define locator offsets in Unicode code points (PostgreSQL's unit) and the `language_profile` values.
- [ ] Widen `pnpm check:boundaries`: its provider-package list holds only the AI SDKs and `@supabase/`, so a PDF, audio or database library in a domain file passes today, and files under `workers/` and interface files get no layer rules.
- [ ] Propose the accepted format list for founder confirmation: documents (PDF; whether DOCX and PPTX are converted or rejected), scanned slides and images, and audio containers students and professors actually use (for example MP3, M4A, Opus, WAV), each with "process", "convert first" or "reject". Record it in §2.3. Today intake accepts only PDF, WAV and PNG up to 10 MiB (§5.5).
- [ ] Write the duplicate and replacement rules as an ADR: identical checksum resubmitted, the same content in another unit or campaign, a newer edition, and an explicit replacement that creates a new source version needing admin activation. Note that `source_segments` forbids the same content hash twice within one version. Ask the founders where a rule changes what a Batch Leader or student sees.
- [ ] Prove the video-ready contract (master plan §5.1 and §14) with a contract test: a future `VIDEO` source kind reuses the processed-document, time-range locator, segment, tag and job contracts. Record the schema changes a video source would need: a `VIDEO` kind in `source_assets_kind_check` (or reuse `RECORDING`), video formats and MIME types in `collection_uploads` and its register function, and a video `expected_type` in `requested_material_items`; build no video processor.
- [ ] Generate synthetic fixtures with expected outputs: tiny native PDF, scanned PDF, corrupt PDF, password-protected PDF, one fixture per approved audio container, Arabic/English audio, silent audio, boundary-chunk audio and malicious-instruction text. No third-party content.

**Verify:** contract unit tests (one valid and one invalid fixture per schema); the video contract test; `pnpm check`.

**Pass:** every job step has a versioned input and output schema with a valid and an invalid fixture; the video contract test passes; the format list is founder-confirmed; no real file is used.

#### WP04-T22 — Prepare the real-data decision pack

The real-data controls in WP04-T14 to WP04-T17 each wait on a founder decision. Preparing all of them early lets the founders decide in one sitting while agents build the synthetic pipeline.

**Depends on:** none. **Decision gates:** none; this task resolves D-17, D-18, D-19, the D-21 revision, D-26 and D-27. **Protected:** none. **Material UI:** no. **Real money:** no (it only prepares decisions).

**Outputs:** decision records for D-17, D-18, D-19 (real values), the D-21 revision, D-26 and D-27, each with options, costs and a recommendation; register and master-plan log updates after approval.

- [ ] D-17 (queue and worker host): update the [D-17 record](../decisions/d-17-queue-worker-host.md) from the [hosting options discussion](../../planning/d-17-hosting-options-discussion.html). Reject hosts that sleep when idle, reclaim idle machines or disable themselves after inactivity; a Vercel Hobby cron runs at most once a day and a Supabase Free Edge Function has tight CPU and wall-time limits (§0.8), so neither alone meets §11.2. A host that needs a payment card or auto-billing account is a D-22 money stop. Include the database path (IPv4 pooler, no session advisory locks) and a converter for DOCX/PPTX if WP04-T01 keeps them.
- [ ] D-18 (object storage): compare candidates on private access, direct resumable upload for the largest inventoried file and for the future video size class, signed operations, deletion verification, durability and versioning, region (a data-protection subprocessor, WP00-T21), scanning support, Free-tier limits (Supabase Free: 50 MB per file and 1 GB in total) and cost.
- [ ] D-19 (real retention and deletion values): derive them from the WP00-T04 synthetic policy and the chosen provider's absence semantics, including what happens to processed text and embeddings after a rights takedown.
- [ ] D-21 revision: D-21 keeps Beta empty of real pilot data until the rights, backup/restore, security, release and go-live gates pass, but the master plan needs the real Cohort A corpus processed before chat. Propose that real adapters may be exercised with synthetic objects in locked Beta and that rights-cleared sources may enter locked, student-free Beta after WP04-T18; Preview stays synthetic and mock-only; students wait for WP11-T01. Master-plan amendment A1 records the same change.
- [ ] D-26 (email sender): the sender for Auth emails, Batch Leader links and budget alerts, with sending limits, deliverability, data handling, region and cost.
- [ ] D-27 (backup and restricted data): where the backup job runs, where backups and restricted evaluation data are stored and in which region, the restore-rehearsal target that may hold real data, and who holds the encryption key. Preview and the public repository's Actions are not acceptable (public artifacts; scheduled workflows stop after 60 days without activity).
- [ ] Obtain Ahmed's and Ziad's approval of each record and update the register and the master-plan log (this step becomes `[?]` while it waits).

**Verify:** each record follows `docs/templates/decision-record.md` and links from the register.

**Pass:** every listed decision is approved or explicitly deferred with its blocked tasks named.

#### WP04-T02 — Implement the workflow state machine

**Depends on:** WP04-T01. **Decision gates:** none (the in-process dispatcher stands in for D-17). **Protected:** RLS and migrations. **Material UI:** no. **Real money:** no.

**Outputs:** workflow application and domain modules in `src/lib/jobs/`, an in-process dispatcher, a structured logger in `src/lib/observability/`, forward migrations for the missing job functions.

- [ ] Create the structured JSON logger and correlation-ID propagation from request to job to provider call, with tested redaction of secrets, authorization headers, signed URLs, source text and chat content. WP08-T02 adds metrics and a durable sink.
- [ ] Extend `finalize_synthetic_source_submission_internal` (today it records the submission and marks the upload and requested item, but creates no source asset, version, raw object or job) so finalizing creates the `source_assets`, `source_versions` and `raw_objects` rows and the workflow jobs in one transaction, and records who accepted the version (`READY` requires `accepted_at`/`accepted_by`).
- [ ] Ask the founders how `source_kind`, `language_profile` and `curriculum_edition` are derived at finalize (visible metadata), and migrate `source_versions` so VALIDATE can record the detected page count, duration and language, which cannot change after insert today.
- [ ] Call `unimind_private` functions through `public` wrappers granted to the service role only (the existing `submit_admin_governance_action` pattern); `unimind_private` is not exposed through the Data API.
- [ ] Map the §7.1 graph onto the existing job types (`VALIDATE`, `EXTRACT`, `OCR`, `TRANSCRIBE`, `NORMALIZE`, `QUALITY`, `RAW_DELETE`, `CHUNK`, `EMBED`, `INDEX`, `RECONCILE`); widen `processing_jobs_type_check` by migration only for a step that cannot fit.
- [ ] Derive idempotency keys from source version, step, processor/config version and content hash.
- [ ] Use the existing `unimind_private.claim_processing_job`, `heartbeat_processing_job`, `succeed_processing_job`, `retry_processing_job` and `fail_processing_job` (service role only; leases capped at 15 minutes).
- [ ] Add `reclaim_expired_processing_jobs` and `cancel_processing_job` with their job-event types, calling `assert_valid_transition` (no trigger guards direct updates): today a `RUNNING` job whose lease expired can never be reclaimed or failed, no job can be cancelled, and `job_events` requires an attempt and lease owner, so cancelling a `QUEUED` job needs a new event shape.
- [ ] Classify failures as retryable, terminal, needs review or uncertain provider acceptance; back off exponentially with jitter and persist `available_at`; record lease, heartbeat, attempt and backoff values in configuration (§2.3).
- [ ] Rework `RETRY_SOURCE` (§5.5): give retry commands a terminal state, replace the one-retry index, and requeue the failed jobs under new idempotency keys that include a retry number, since `FAILED` is terminal and keys are unique.
- [ ] Add an in-process dispatcher under `workers/ingestion/` (it wires concrete adapters) that runs the graph in tests and CI until WP04-T14 deploys the real worker host; until processors exist it runs stub handlers to all-`SUCCEEDED` while the source stays `PROCESSING`.

**Verify:** unit tests; `database-ci` with two sessions claiming one job, an expired lease reclaimed, a cancellation and a replayed finalize; log-redaction tests; independent review of the migrations.

**Pass:** a synthetic submission becomes a source version and runs the graph under the in-process dispatcher; replaying finalize creates no second workflow; two racing workers produce one success; an expired lease is reclaimed; every log line has a correlation ID and no content.

#### WP04-T03 — Implement secure temporary storage

**Depends on:** WP04-T01. **Decision gates:** none for the adapter; the real provider is chosen through WP04-T22 (D-18). **Protected:** storage; RLS and migrations. **Material UI:** yes — the file picker's accepted formats, limits, convert-first guidance, progress and interruption. **Real money:** no.

**Outputs:** storage application layer over a widened `ObjectStorageProvider`, namespace configuration, orphan reconciliation job, a migrated upload path.

- [ ] Widen `ObjectStorageProvider` (today `putObject`, `getObject`, `deleteObject` over `raw`, `temporary`, `processed`) with a head/absence check and short-lived exact-object signed upload and read operations; replace the stateless mock (it returns fixed bytes and always reports objects absent) with a stateful fake that can simulate not-found, access-denied, delayed consistency and ambiguous responses, for WP04-T08 and WP04-T09.
- [ ] Deny public listing and reads; issue signed operations only after server authorization; keep object keys server-side and log only key fingerprints.
- [ ] Replace the in-request upload with direct signed upload to storage: today the Route Handler reads the whole file through `request.formData()`, and a Vercel function request body is limited to about 4.5 MB (§0.8). Finalize stays a server mutation; since the server never sees the bytes, it takes the checksum from the storage provider's metadata (or the worker re-reads the object) before writing the immutable `source_versions.checksum`.
- [ ] Migrate `unimind_private.collection_uploads`, which today allows only the mock provider, PDF/WAV/PNG and at most 10 MiB, to the WP04-T01 format list and size limits; make `MAX_UPLOAD_BYTES` the single limit used by intake.
- [ ] Reconcile signed uploads that are never finalized.
- [ ] Inspect magic bytes and type before processing; record the malware-scanning approach the real host needs (WP04-T15 chooses the scanner).
- [ ] Enforce byte, page and duration limits (§2.3; the domain receives them as arguments) at intake, check declared rights at intake, and require `VALID` rights (WP03-T37) before any provider cost.

**Verify:** storage contract tests on the synthetic adapter; forbidden read, list and cross-campaign tests; `database-ci` for the migration; independent review.

**Pass:** forbidden reads, lists and cross-campaign uploads are denied; upload bytes never pass through a Next.js route (proved against a mock storage endpoint; the real size proof is in WP04-T15); orphans are reconciled; limits and rights stop work before any (mock) provider call.

#### WP04-T04 — Build native PDF extraction incrementally

**Depends on:** WP04-T02, WP04-T03. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

**Outputs:** the PDF inspector and extractor in `src/lib/ingestion/` following §7.3.

- [ ] Inspect magic bytes, encryption, page count, metadata, corruption and checksum.
- [ ] Extract page by page and record text density and anomalies before deciding OCR ranges.
- [ ] Normalize headers, footers, hyphenation, lists, headings, tables, formulas, captions and diagrams conservatively; never delete meaning to save bytes.
- [ ] Write temporary output incrementally, then finalize atomically only when every page is represented, explicitly blank, rejected, or flagged `OCR_CANDIDATE` for WP04-T05 (NORMALIZE finalizes only after OCR has run). Use GitHub-flavoured Markdown tables and record the extractor library and version.
- [ ] Map normalized character ranges to original pages with confidence and validate bounds and non-overlap.
- [ ] Convert or reject DOCX and PPTX as the WP04-T01 format list says; conversion needs a converter (for example LibreOffice) on the WP04-T14 host and cannot run in CI, so reject with guidance until that host exists.

**Verify:** fixture tests against expected Markdown and locator sidecars.

**Pass:** synthetic native PDFs produce the expected processed output and locators; every page is accounted for; corrupt and password-protected files are rejected with an actionable reason.

#### WP04-T05 — Add selective OCR

**Depends on:** WP04-T04. **Decision gates:** none for the mock path; a real OCR adapter needs D-04 (WP04-T19). **Protected:** none. **Material UI:** no. **Real money:** only through WP04-T13 once a real adapter exists.

- [ ] Define per-page OCR triggers from text density, replacement characters, layout anomalies and fixture results; record them in configuration (§2.3).
- [ ] Send only selected page ranges to the OCR adapter and reserve the maximum cost first (WP04-T13 once real).
- [ ] Merge OCR and native output in original page order without duplicate text.
- [ ] Validate Arabic/English terminology, tables, formulas and page coverage.
- [ ] Mark irrecoverable visual meaning `NEEDS_REVIEW`; never claim full processing.

**Verify:** fixture tests with the mock OCR adapter.

**Pass:** only triggered pages reach OCR; merged output is ordered and free of duplicates; unrecoverable pages are isolated as `NEEDS_REVIEW`.

#### WP04-T06 — Build complete audio transcription

**Depends on:** WP04-T02, WP04-T03. **Decision gates:** none for the mock path; a real transcription adapter needs D-04 (WP04-T19). **Protected:** storage (temporary chunk deletion). **Material UI:** no. **Real money:** only through WP04-T13 once a real adapter exists.

- [ ] Inspect container, codec, duration, channels, sample rate, corruption and the cost ceiling; reject over-limit duration before any cost (§7.4).
- [ ] When chunking is needed, compute deterministic overlapping chunks and keep their exact time ranges.
- [ ] Merge with boundary de-duplication and prove accounted duration within the §2.3 tolerance.
- [ ] Preserve Arabic/English code-switching and technical terms; never translate unless a separate approved step asks for it.
- [ ] Persist confidence and timestamp locators; flag long silence and low-confidence spans.
- [ ] Delete temporary normalized audio and chunks after the transcript passes verification, and verify their absence separately from raw deletion.

**Verify:** fixture tests with the mock transcription adapter, one per approved container.

**Pass:** synthetic audio fixtures account for their full duration within tolerance; silence and low confidence are flagged; temporary chunks are verified absent.

#### WP04-T07 — Tag professor evidence safely

**Depends on:** WP04-T06. **Decision gates:** none. **Protected:** RLS and migrations if `segment_tags` gains columns. **Material UI:** no. **Real money:** no (mock tagger until WP04-T19 chooses a model, if any).

- [ ] Tag only spans with evidence; keep tag type, label, confidence, details, locator and tagger version. `segment_tags` has no locator or tagger-version column today: store them in `details_json` or add columns by migration.
- [ ] Distinguish `PROFESSOR_HINT`, `EXAM_EMPHASIS`, `EXCLUSION`, `CORRECTION` and `LIKELY_QUESTION`.
- [ ] Never rewrite possibility or emphasis into certainty or an exam guarantee.
- [ ] Create positive and negative Arabic, English and mixed fixtures; record precision and recall on them.

**Verify:** tagger fixture tests.

**Pass:** fixture precision and recall are recorded; no fixture hint becomes a certainty; WP04-T21 adds the academic sample on real audio.

#### WP04-T08 — Verify processed output before deleting raw data

**Depends on:** WP04-T04 to WP04-T07. **Decision gates:** D-10 thresholds (synthetic defaults until approved). **Protected:** RLS and migrations (transactional enqueue). **Material UI:** no. **Real money:** no.

- [ ] Reopen the finalized processed object from durable storage instead of trusting the write response.
- [ ] Recompute the checksum and validate the schema.
- [ ] Check page/duration coverage, the non-empty threshold, locator bounds, the terminology sample, the duplicate ratio and unresolved blocker warnings (§7.5).
- [ ] Persist the immutable quality report with the accepted policy version.
- [ ] Enqueue the `RAW_DELETE` job only from the passing or policy-approved state, in one transaction.
- [ ] Inject failures before and after finalization and prove deletion was never enqueued early.

**Verify:** fault-injection tests; `database-ci` for the transactional enqueue.

**Pass:** no fixture can reach deletion without a passing persisted report.

#### WP04-T09 — Delete and independently verify raw absence

**Depends on:** WP04-T08. **Decision gates:** none on synthetic data; real deletion needs D-19 and WP04-T18. **Protected:** storage; RLS and migrations; raw deletion is a D-22 protected gate. **Material UI:** no. **Real money:** no.

- [ ] Add by migration what verified deletion needs: a rule that a raw object reaches `DELETED` only with a `VERIFIED_ABSENT` event; more than one event per attempt (today `unique (raw_object_id, attempt_number)` allows one); and key-fingerprint, checksum and size columns so the full `object_key` can be cleared after deletion.
- [ ] Lock the raw row, re-check accepted processed state and any hold, and use the exact stored provider key (§7.6).
- [ ] Record the deletion result, then check absence independently through the provider's head, metadata or list call and append `VERIFIED_ABSENT`.
- [ ] Treat a timeout or ambiguous response as unresolved (`DELETE_FAILED`, retried through `DELETE_PENDING`); retry verification before reissuing a delete.
- [ ] Set `delete_after` at finalize and on acceptance (the policy's earlier of received + 24 h and accepted + 1 h), delete the raw bytes of failed sources at the cap, re-enqueue deletion when a hold is removed or expires, and widen the hold actions to the pipeline's object keys (they accept only synthetic `synthetic/` keys today).
- [ ] Append events; never overwrite deletion history; clear reusable access URLs and keep only approved audit metadata.
- [ ] Open an incident automatically when `delete_after` passes.
- [ ] Test already-absent objects, access-denied deletion, delayed consistency, provider outage, a hold placed before deletion is enqueued (holds start only from `STORED`) and deletion replay.

**Verify:** deletion tests on the synthetic adapter; `database-ci` for the migration; independent review.

**Pass:** zero premature deletions; 100% of accepted synthetic sources end `DELETED` with a `VERIFIED_ABSENT` event, including replays and outages.

#### WP04-T10 — Chunk, embed, and mark READY

**Depends on:** WP04-T08. **Decision gates:** none for mock embeddings; real embeddings follow WP04-T20. **Protected:** RLS and migrations. **Material UI:** no. **Real money:** no until WP04-T20.

- [ ] Chunk by structure and semantic boundaries with a versioned chunking configuration; keep tables, definitions, question/answer blocks and professor statements coherent; record token counts (§7.7).
- [ ] Hash normalized content and de-duplicate without losing legitimate repeated context or provenance, within the one-hash-per-version rule.
- [ ] Reserve embedding budget, batch by provider limit and reuse vectors by content hash plus embedding configuration.
- [ ] Validate vector count, dimensions, finite values, normalization and model identity before insert (the `validate_embedding_dimensions` trigger checks dimensions against `embedding_configs`).
- [ ] Run the ingestion checks of master plan §8.5 step 16: empty segments, duplicates, leakage canaries, retrieval smoke, and prompt-injection-like text flagged as a segment tag (kept as untrusted data, never removed or obeyed); add the tag type by migration if `segment_tags` cannot hold it.
- [ ] Extend `unimind_private.assert_source_version_ready_prerequisites`, which already checks the processed document, a passing quality report, active segments and embeddings, so it also checks valid rights, verified raw deletion or an approved hold, and embeddings under the current active configuration (§7.8).

**Verify:** fixture tests with mock embeddings on the synthetic configuration; `database-ci` readiness tests.

**Pass:** a valid synthetic source reaches `READY` with stable segment and vector counts; a source failing any §7.8 predicate never does.

#### WP04-T11 — Reconcile every incomplete state

**Depends on:** WP04-T09, WP04-T10. **Decision gates:** D-19 for real takedown values. **Protected:** storage; RLS and migrations. **Material UI:** no. **Real money:** no.

- [ ] Reclaim expired leases (WP04-T02 function); resume workflows with a succeeded parent and a missing child.
- [ ] Verify uncertain provider timeouts by provider request ID where supported.
- [ ] Find accepted output without a deletion job, verified deletion without chunks, missing or outdated embeddings, READY inconsistencies, orphan temporary objects and unsettled reservations.
- [ ] Rights takedown: set the source version's rights to `REVOKED` (WP03-T37), remove it from retrieval at once and invalidate dependent artifacts (WP07-T05). Segment content is immutable and evidence rows reference segments with `on delete restrict`, so add a redaction (tombstone) migration that removes text and embeddings while keeping IDs and audit (it must also relax `source_segments_content_check`, `source_segments_no_delete` and `segment_embeddings_append_only` for redaction only), and use it when the approved policy requires a purge.
- [ ] Keep reconciliation idempotent; emit metrics and incidents instead of editing history.

**Verify:** reconciliation tests per incomplete state; takedown and redaction tests; `database-ci`.

**Pass:** each seeded incomplete state is moved forward or isolated automatically; a takedown removes the source from retrieval immediately and, when the policy requires it, leaves no source text or vector while evidence links stay intact.

#### WP04-T12 — Run the fault matrix and package gate

This is the synthetic half of the WP04 gate. WP04-T21 is the real half.

**Depends on:** WP04-T01 to WP04-T11. **Decision gates:** D-10 for the final thresholds. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Inject a crash immediately before and after every external call and every database transition.
- [ ] Race two workers on one job and expire a lease during a slow call.
- [ ] Replay the whole workflow with identical submission and step keys; compare counts, checksums, provider-call records and usage before and after.
- [ ] Exercise native PDF, scanned PDF, every approved audio container, duplicate, corrupt, timeout, malformed output, rights revocation, hold, deletion failure, and one terminal source next to a valid one.
- [ ] Freeze this fixture suite as the processing regression suite that rule 18 requires before any processing configuration change reaches Beta.
- [ ] Map every §7.9 property to its proof in the PR body; the PR and its exact-head CI run are the evidence (workflow §6), so no separate evidence file is needed.

**Verify:** the fault matrix suite; `pnpm verify`; `database-ci`.

**Pass:** every §7.9 property holds: zero premature deletion, one processed document, stable segment and vector counts, exactly-once settlement, and automatic progress or isolation.

#### WP04-T13 — Enforce budgets and kill switches before any paid call

Master plan §13 and WP00-T06 define the rules; nothing enforces them yet.

**Depends on:** WP04-T02. **Decision gates:** none to build and test at zero caps; D-05 before any nonzero cap. **Protected:** RLS and migrations; production configuration (flags). **Material UI:** no. **Real money:** no; this task makes later spending safe.

**Outputs:** a budget guard in `src/lib/usage/`, cost reservation functions, database-backed provider flags, tests.

- [ ] Add cost reservation and settlement functions over `budget_counters`: today `usage_reservations` needs a user and counts units only, nothing writes `budget_counters`, and its scopes are `SYSTEM`, `PROVIDER`, `ACTION` and `COHORT`. One atomic reservation must fit every D-05 scope: total PoC, weekly, provider/action, source preflight, per-user daily and single request. Add the missing scopes; weekly and daily periods start at midnight Africa/Cairo time (§2.3).
- [ ] Route every real adapter call through one guard: the provider flag and a nonzero approved budget must both hold (WP01-T03 rule); the guard reserves the maximum cost before the call and settles or releases it exactly once after.
- [ ] Move provider enablement to database-backed flags read at call time (today real providers are environment variables, and there is no OCR flag); extend `ENABLE_FLAG`, which today accepts only `mock.artifact.*` flags, to real providers with the two-founder confirmation; keep `DISABLE_FLAG` immediate.
- [ ] Enforce per-provider and per-action concurrency, timeout and retry limits (master plan §13); 50/75/90% events are recorded here and delivered from WP04-T17; block new optional paid work atomically at 100%.
- [ ] Preflight the maximum cost per source from duration and pages before the first paid step, using a price table (every price 0 until WP04-T19); reconcile units, because adapters report integer minor units while the database stores `numeric(20,6)`.
- [ ] Add an audited two-founder action to set or raise a cap (D-05); lowering a cap or disabling paid work stays single-founder. Retire the `APPROVED_PROVIDER_BUDGET_MINOR` environment variable so the database is the one source of truth. Use the ISO test currency `XTS` for synthetic caps until D-05 names the currency; synthetic caps in disposable CI are not a D-22 financial mutation.
- [ ] Record every call in `provider_calls`; map the adapter status `OUTCOME_UNKNOWN` to the table's `TIMEOUT_UNKNOWN` and record `model_version` and cost in the WP00-T06 currency rule.
- [ ] Test a cap exceeded mid-batch, concurrent reservations at the boundary, a kill switch during a long job, concurrency and timeout limits, and an uncertain settlement.

**Verify:** unit and `database-ci` tests; `pnpm verify` still makes zero paid calls.

**Pass:** with zero caps no real adapter can make a call; with a synthetic nonzero cap, concurrent reservations never exceed it; every call has exactly one settlement; disabling a flag stops new calls at once.

#### WP04-T14 — Select and deploy the worker host

D-15 forbids running workers on a founder computer, and real processing needs an always-on host.

**Depends on:** WP04-T12, WP03-T34, WP03-T36. **Decision gates:** D-17 (prepared in WP04-T22). **Protected:** production configuration. **Material UI:** no. **Real money:** yes if the host is paid or needs a payment card.

**Outputs:** an approved D-17 record; deployed ingestion worker and scheduler in Preview and Beta.

- [?] D-17 approved (prepared in WP04-T22). OWNER INPUT REQUIRED.
- [ ] Re-check the approved host against the job durations measured in WP04-T12; a mismatch goes back to the founders.
- [ ] Prove the database path from the host: Supabase direct connections are IPv6-only, and the transaction pooler does not keep session-level advisory locks, so claims use `FOR UPDATE SKIP LOCKED` or transaction-level locks.
- [ ] Deploy the ingestion worker and the reconciliation scheduler as always-on components in Preview and in locked Beta with separate secrets; the generation worker follows in WP06.
- [ ] Workers claim from the PostgreSQL job table, heartbeat, shut down gracefully, expose a health check and keep no business state outside PostgreSQL.
- [ ] Create a synthetic Preview catalog and campaign through the WP03-T34 and WP03-T36 actions and the synthetic embedding configuration through a reviewed forward migration (Preview has none today), then run a seven-day soak with both founder computers off: synthetic sources reach `READY` on mocks and no scheduled run is missed.

**Verify:** the soak report with missed-run count; a worker killed mid-job recovers through its lease.

**Pass:** the Preview pipeline ran unattended for seven days on external infrastructure with zero missed scheduled runs; a killed worker's job was reclaimed; D-15 holds.

#### WP04-T15 — Select object storage and approve retention values

**Depends on:** WP04-T03, WP04-T12. **Decision gates:** D-18, D-19 and the D-21 revision (prepared in WP04-T22). **Protected:** storage; production configuration. **Material UI:** no. **Real money:** yes if the provider or plan is paid.

**Outputs:** the real storage adapter; per-environment namespaces; updated [raw-data](../policies/raw-data-lifecycle.md) and [session-revocation](../policies/auth-session-revocation.md) policies.

- [?] D-18, D-19 and the D-21 revision approved (prepared in WP04-T22). OWNER INPUT REQUIRED.
- [ ] Implement the real adapter and namespaces per environment with public access denied and short-lived exact-object operations; run its contract tests only where the approved D-21 revision allows (never in Preview), with synthetic objects deleted after the run.
- [ ] Prove the provider's deletion verification method (head, list or metadata) and its consistency behaviour (§7.6).
- [ ] Choose and wire the malware/content scanner suitable for this provider; widen the raw-hold actions to the real provider.
- [ ] Configure processed-object durability (versioning or backup) per policy; exclude raw objects beyond their window; size peak raw storage (files waiting to be processed at once) against the plan's limit.
- [ ] Replace the synthetic values in the raw-data policy with the approved D-19 values; update the D-18 note in the session-revocation policy, the [environment matrix](../../planning/environment-matrix.md), [environment promotion](environment-promotion.md) and `CONTRIBUTING.md` to the approved D-21 revision.

**Verify:** the storage contract tests against the real provider with synthetic objects; deletion-verification tests; independent review.

**Pass:** the contract tests pass against the real provider; deletion is verified independently; the largest inventoried file uploads; no public access path exists.

#### WP04-T16 — Back up and restore Beta before it holds real data

D-21 keeps Beta empty until an encrypted backup and restore passes; Supabase Free has no automatic backups.

**Depends on:** WP04-T15. **Decision gates:** D-27 (prepared in WP04-T22). **Protected:** production configuration. **Material UI:** no. **Real money:** yes if the backup store or target is paid.

**Outputs:** a backup and restore procedure under `docs/runbooks/`; a timed rehearsal report.

- [?] D-27 approved (prepared in WP04-T22). OWNER INPUT REQUIRED.
- [ ] Schedule an encrypted logical backup of Beta, including the Auth data that memberships reference, through the IPv4 session pooler, with retention as approved.
- [ ] Keep the encryption key apart from the backups, held so that both founders can retrieve it; rehearse retrieving the key from that custody as part of the restore.
- [ ] Back up or version processed objects per WP04-T15.
- [ ] Handle Free-plan pausing with a keep-alive or a documented resume step (D-21).
- [ ] Rehearse: restore database and processed objects into the D-27 target, verify row counts and referential checks for catalog, access, sources, documents, segments, evidence, artifacts, usage, jobs and audit, rebuild embeddings if they are not backed up, and confirm no expired raw object returns.

**Verify:** the rehearsal report with timings and counts.

**Pass:** a timed restore of a synthetic-populated Beta, with the key retrieved from custody, succeeds with verified counts; the procedure is committed; D-21's real-data condition for Beta is met.

#### WP04-T23 — Build the guarded Beta migration path

Hosted migrations are applied today by pasting a prepared SQL text into the Supabase SQL editor, and the CI populated upgrade starts from the WP01 schema with a few fixture rows. Neither is safe once Beta holds real data ([third review](../reviews/runbook-revision-2026-10/third-review.md) D2).

**Depends on:** WP04-T16. **Decision gates:** none. **Protected:** RLS and migrations; production configuration. **Material UI:** no. **Real money:** no.

**Outputs:** a guarded migration command, a populated-upgrade fixture at realistic volume, an extended [migration checklist](database-migration-checklist.md).

- [ ] Build a command that checks the target fingerprint and the migration ledger head, takes and verifies a fresh D-27 backup, rehearses the migration on a restore in the D-27 target with timings, applies it with lock and statement timeouts, runs steps marked non-transactional (for example `CREATE INDEX CONCURRENTLY`) separately, runs postflight checks and writes evidence.
- [ ] Make the CI populated upgrade start from a committed record of the schema Beta runs, with a generated volume fixture (segments with vectors, 100 users, chats and ledger rows), instead of the WP01 schema.
- [ ] Add a "populated data" section to the checklist: backup before migrating, timeouts, batched backfills, expand/contract compatibility with the running web build, rehearsal on a restored copy, and, for data-bearing changes, a snapshot of the affected rows so rollback is a forward repair from that snapshot.
- [ ] Update [environment promotion](environment-promotion.md) so Beta migrations go only through this command.

**Verify:** a rehearsal against a synthetic-populated restore; `database-ci` with the volume fixture; independent review.

**Pass:** a migration reaches synthetic-populated Beta only through the command, with a verified backup and a timed rehearsal recorded.

#### WP04-T17 — Set up the Beta email sender

Real Batch Leader access, admin accounts in Beta and budget alerts need a sender before any real data or spending ([second review](../reviews/runbook-revision-2026-10/second-review.md) E1).

**Depends on:** WP04-T13. **Decision gates:** D-26 (prepared in WP04-T22); this task also delivers the interim budget-alert part of D-20. **Protected:** auth; production configuration. **Material UI:** yes, the Auth email templates. **Real money:** yes if the sender is paid.

**Outputs:** custom SMTP for Beta Auth; bilingual email templates; budget alerts delivered by email to both founders.

- [?] D-26 approved (prepared in WP04-T22). OWNER INPUT REQUIRED.
- [ ] Configure custom SMTP for Beta Auth on a sending domain with SPF and DKIM; keep the built-in sender for synthetic Preview only; size the Auth email rate limit to the largest planned wave.
- [ ] Deliver the WP04-T13 budget events (50/75/90/100%) to both founders by email as the interim alert channel until WP08-T05 completes D-20.
- [ ] Add bilingual branded Auth email templates under `supabase/templates/` (today Beta would send Supabase's default English emails), and test the two-device flow (PJ-21) and link prefetching by mail scanners.
- [ ] Record the hosted Beta Auth settings (sign-up mode, confirmations, password length, rate limits, CAPTCHA once WP08-T09 adds it) as versioned evidence and check them for drift on every promotion.

**Verify:** a verification email and a recovery email received through the Beta sender; a synthetic budget event delivered; the Auth settings record.

**Pass:** Beta Auth emails and budget alerts reach their recipients through the approved sender; the Beta Auth settings are versioned.

#### WP04-T18 — Pass the real-data readiness gate

**Depends on:** WP04-T12 to WP04-T17, WP04-T22, WP04-T23, WP00-T01, WP00-T02, WP00-T03, WP00-T04, WP00-T21, WP03-T37. **Decision gates:** D-10 and D-28 approved (through WP00-T04 and WP00-T21); D-17, D-18, D-19, the D-21 revision, D-26 and D-27 approved through WP04-T22. **Protected:** none (no code change); the first real material passes the D-22 protected gates for rights and raw deletion. **Material UI:** no. **Real money:** no new spend.

**Outputs:** `evidence/wp04-ingestion/<date>_real-data-readiness_beta_<sha>.md`.

- [ ] Confirm, with a link for each, every listed decision approved and every listed task done.
- [ ] Review every real storage, worker, backup and email path against the rights inventory and the approved D-19 values.
- [ ] Run an independent security review of the real-data paths (storage policies, signed operations, rights actions, raw deletion, backup custody, admin access) and resolve every finding; this is the D-21 security condition for real sources, and WP08-T09 later reviews the whole beta.
- [ ] Confirm the data-protection route from WP00-T21 covers storage, workers, backups, email and the providers that WP04-T19 will benchmark.
- [ ] Confirm minimum incident runbooks exist before real data: deletion failure, leakage suspicion, rights takedown, leaked secret and personal-data breach with its notification clock (WP08-T07 completes the set).
- [ ] Configure the Cohort A catalog in Beta through WP03-T34 actions with the WP00-T02 codes; keep Beta closed to students (no memberships).
- [ ] Record the security/data role's sign-off and D-22 authorization for the first real material.

**Verify:** the gate report checklist, every line linked to its evidence.

**Pass:** every checklist line in the gate report links to approved or passing evidence; no line is open.

#### WP04-T19 — Benchmark and select the AI providers

Moved ahead of real processing because real OCR, transcription and embeddings need D-04; placed after WP04-T18 because the benchmark sends real samples to external providers.

**Depends on:** WP04-T18, WP00-T20. **Decision gates:** D-05 (benchmark cap and benchmark profile); this task resolves D-04. **Protected:** production configuration (provider secrets). **Material UI:** no. **Real money:** yes — stop for fresh two-founder confirmation naming the maximum benchmark spend.

**Outputs:** `planning/provider-benchmark.csv` with results; an approved D-04 record; real adapters behind flags.

- [?] D-05 benchmark cap approved (WP00-T06), plus a benchmark live profile approved as an exception to the D-05 live-enablement gate, because benchmark candidates are not yet approved D-04 providers. Record the exception in the D-05 record and the raw-data policy. OWNER INPUT REQUIRED.
- [ ] Run the benchmark through a separately named guarded command (for example `test:eval:live-approved`) and only from the WP04-T14 worker host or another approved non-founder host, never from public-repository CI or a founder computer; use only rights-cleared samples marked in WP00-T03 without personal data (or with recorded consent, for example a professor's voice); delete samples and outputs from candidates that are not selected.
- [ ] List candidates per capability: OCR, transcription with Arabic/English code-switching, embeddings, generation for chat and Studio, and a model for the WP06-T01 validator if that ADR needs one. Record each candidate's data handling (input retention, abuse-monitoring retention, training use, region, minimum user age and acceptable use for medical content).
- [ ] Treat index compatibility as an embedding criterion: pgvector HNSW and IVFFlat index `vector` up to 2,000 dimensions and `halfvec` up to 4,000 (§0.8); test shortened or half-precision variants where offered.
- [ ] Score embeddings on Arabic, mixed and Franco-Arabic questions over English passages as well as same-language pairs, using the signed WP00-T20 suite.
- [ ] Run the same samples, prompts and settings; record quality (academic scoring for OCR and transcription samples), units, p50/p95, errors and retries, rate limits and cost in one currency and date; separate cold/warm and success/retry cost; pin dated model snapshots, not moving aliases.
- [ ] Calculate each WP00-T03 source's maximum preflight cost from the measured prices.
- [ ] Treat quality, data handling and reliability as gates before price; never select on advertised price.
- [ ] Implement the selected real adapters behind their flags; they pass the WP01-T06 contract tests; credentials stay server/worker-only.
- [ ] Write the D-04 record with fallback and disable strategy; update the master-plan log only after both founders approve.

**Verify:** adapter contract tests; benchmark report; spend reconciled against the cap.

**Pass:** D-04 is approved on numeric evidence; every selected adapter passes the shared contract tests; benchmark spend stayed inside the approved cap; `pnpm verify` still makes zero paid calls.

#### WP04-T20 — Set the production embedding configuration and check capacity

**Depends on:** WP04-T19, WP04-T10. **Decision gates:** D-04 (approved in WP04-T19). **Protected:** RLS and migrations. **Material UI:** no. **Real money:** stop if the capacity check shows a paid database tier is needed.

**Outputs:** the real `embedding_configs` row, a matching partial index, a generalized retrieval function, a capacity report.

- [ ] Insert the real `embedding_configs` row and enforce one active configuration. The `segment_embeddings.embedding` column is already an unsized `vector` checked by a trigger; the 3-dimension index and the hard-coded synthetic configuration, dimension and cosine operator live only in `segment_embeddings_synthetic_v1_cosine_hnsw_idx` and `retrieve_authorized_segments`.
- [ ] Add a partial HNSW expression index cast to the chosen dimension (or `halfvec`) for the real configuration, with the operator class matching the distance operator; remove the hard-coded configuration from `retrieve_authorized_segments`.
- [ ] Compare exact search with HNSW on the fixtures; re-embed the synthetic fixtures under the real configuration in Preview.
- [ ] Estimate database size (segments per page and per audio minute from fixtures × the master plan §4.2 corpus for both cohorts × vector, index and text bytes), processed-object storage and the memory an index build needs; compare with the current Supabase Free allowances (§0.8), including monthly active users and pausing.
- [ ] If any estimate exceeds an allowance, stop: a paid tier is a real-money decision (D-05, D-21 revisit) before WP04-T21.

**Verify:** `database-ci` with the new migration; zero generated-type diff after regeneration; retrieval tests at the real dimension.

**Pass:** retrieval tests pass at the real dimension; the capacity report states the headroom or names the money decision that must come first.

#### WP04-T21 — Collect and process the Cohort A corpus

The Human Medicine corpus had no collection task. This is the real half of the WP04 gate (master plan Phase 2) and closes the master plan Phase 0 exit for Cohort A.

**Depends on:** WP04-T20, WP03-T36, WP03-T38, WP00-T20. **Decision gates:** none beyond WP04-T18. **Protected:** storage; raw deletion. **Material UI:** no. **Real money:** yes, inside the approved caps through the budget guard; a cap increase needs fresh two-founder confirmation.

**Outputs:** READY Cohort A sources in Beta; `evidence/wp04-ingestion/<date>_cohort-a-corpus_beta_<sha>.md`.

- [ ] An admin creates the Cohort A campaigns and gives the Batch Leader access; the Batch Leader submits the inventoried sources for every D-01 Module (Child Health / Pediatrics, GIT, Nutrition, Professional Practice), aiming at the master plan §4.2 targets of 15–25 documents and 3–5 hours of audio; a shortfall against §4.2 (including its 8–12 units) is a founder decision recorded in the evidence.
- [ ] An admin records each source version's rights from its WP00-T03 row through WP03-T37; a Batch Leader declaration alone never makes rights valid.
- [ ] The pipeline runs on the real providers with no manual database step; every source reaches `READY` or isolation with a machine-readable reason.
- [ ] The academic reviewer spot-checks processed text, transcripts and hint tags per unit using the WP00-T20 rubric and sample size.
- [ ] Report storage reduction, cost per source and verified raw deletions.

**Verify:** job event timelines per source; the quality, deletion and cost reports.

**Pass:** at least 95% of valid sources reach `READY` without exceptional intervention and the rest are isolated with reasons; 100% of required pages and audio are accounted for or rejected; 100% of accepted raw objects end `DELETED` with a `VERIFIED_ABSENT` event, with zero premature deletions; spend stays inside the cap.

#### WP04-T24 — Keep real adapters regression-tested

`pnpm verify` is mock-only by design, so after WP04-T19 nothing notices when a provider changes its response shape, price or model version, or retires a pinned model ([third review](../reviews/runbook-revision-2026-10/third-review.md) D5).

**Depends on:** WP04-T19. **Decision gates:** a D-05 scope for scheduled live checks. **Protected:** production configuration. **Material UI:** no. **Real money:** yes, a small scheduled spend inside its own cap.

**Outputs:** recorded provider responses replayed in `pnpm verify`; a guarded daily live check; retirement-date alerts.

- [ ] Record sanitized real responses to synthetic, non-private inputs (including errors, rate limits and timeouts) and replay them through each real adapter's parser below the transport layer in `pnpm verify`, which stays credential-free and free.
- [ ] Add a guarded `test:providers:live-approved` command, run daily from the WP04-T14 host with synthetic inputs under its own D-05 scope and weekly cap; it checks response schema, returned model version and price against the pinned record, alerts on a mismatch and proposes disabling the flag.
- [ ] Record each pinned model's announced retirement date in the D-04 record and alert 30 days before it.
- [ ] Make a failing live check block promotion under implementation rule 18.

**Verify:** replay tests in `pnpm verify`; one live run recorded inside its cap.

**Pass:** a changed response shape or model version fails replay or the daily check before it reaches students.

### 7.1 Job graph

One workflow per source version, on the existing job types:

`VALIDATE (validate, confirm raw, inspect) -> EXTRACT | TRANSCRIBE (+ OCR page ranges) -> NORMALIZE (+ professor tagging) -> QUALITY -> RAW_DELETE -> CHUNK -> EMBED -> INDEX (index check, then the protected READY transition)`

A source failing automatic thresholds ends `NEEDS_REVIEW` on its source version. Job states are `QUEUED`, `RUNNING`, `RETRYING`, `SUCCEEDED`, `FAILED` and `CANCELLED`, checked inside the job functions by `assert_valid_transition('job', …)`; no trigger guards direct updates, so new job functions must call it. `RECONCILE` jobs run the §11.2 schedules.

### 7.2 Claiming and retry rules

- Claim atomically with `FOR UPDATE SKIP LOCKED` (the existing claim function) or the selected queue's equivalent; the lease owner, lease expiry and attempt record are set before work.
- Heartbeat long OCR and transcription jobs; reclaim expired leases automatically (WP04-T02).
- Retry network errors, timeouts and rate limits with bounded exponential backoff and jitter (`RETRYING`).
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

1. Inspect container, codec, duration, channels, sample rate and corruption; reject over-limit duration before cost.
2. Normalize audio temporarily only when the transcription provider needs it.
3. Transcribe the entire duration, in overlapping chunks if needed, and merge without duplicate or missing boundary text.
4. Keep timestamp ranges and confidence; detect English/Arabic mixing and keep technical terms.
5. Check terminology against the unit's configured vocabulary.
6. Tag professor hints, exam emphasis, corrections, exclusions and likely questions with segment and time evidence; never turn a hint into a guarantee.
7. Verify accounted duration against the original within the §2.3 tolerance.
8. Persist the transcript and delete every temporary chunk after finalization.

### 7.5 Processed-output verification

All applicable checks pass before the `RAW_DELETE` job can be enqueued: the processed object exists and is readable; its checksum matches; page/audio coverage meets policy; the non-empty threshold passes; locator ranges are within bounds; the terminology sample passes or is flagged; no secret or patient identifier appears in diagnostics; no duplicate final processed document exists; the quality report is persisted.

### 7.6 Raw deletion

Raw-object states are `PENDING`, `STORED`, `DELETE_PENDING`, `DELETE_FAILED`, `HELD`, `DELETED` and `FAILED`; deletion events are `REQUESTED`, `SUCCEEDED`, `FAILED` and `VERIFIED_ABSENT`.

1. Lock the raw-object row and re-verify processed acceptance and the absence of a hold.
2. Request deletion with the exact stored provider key (`REQUESTED`).
3. Verify absence through provider metadata or listing and append `VERIFIED_ABSENT`.
4. Clear the object key and unusable access URLs; keep provider, key fingerprint, checksum, size and timestamps.
5. Set `DELETED` only together with a `VERIFIED_ABSENT` event; on an uncertain result set `DELETE_FAILED` and retry automatically.
6. Open a high-priority incident when the deadline passes. Never report a source as fully optimized while raw status is unresolved.

### 7.7 Chunking and embeddings

Chunk by headings and semantic units with controlled overlap only where context needs it; keep chunks within the configured token range; keep tables, definitions, question/answer blocks and professor statements coherent; de-duplicate within the source and unit without erasing legitimate repetition; embed in batches; record configuration, version and dimensions; never compare vectors from incompatible models; re-embed only when content or configuration changes; index source-format and professor-hint metadata alongside the unified knowledge pool.

### 7.8 Readiness decision

Mark `READY` only if: rights are `VALID` for student use; processed verification passed; raw deletion is verified or an approved hold exists; required segments exist; every active segment has an embedding under the current active configuration; the retrieval smoke test returns the expected known terms; and no blocker-level quality issue exists. Publishing and cohort unlock stay separate governance actions.

### 7.9 Fault and idempotency properties

After a failure at any step and a rerun: one source version and one finalized processed document exist; raw data is never deleted before verification; deletion retries never touch processed data; segment and embedding counts stay stable; no provider call repeats when a completed result is known; expired leases recover without double finalization; a terminal bad source does not stop other sources; reconciliation moves stale recoverable work forward.

## 8. Work package 5: Retrieval evaluation before chat

**Outcome:** authorized hybrid retrieval and deterministic evidence classification meet frozen quality, leakage, latency and cost gates on the real Cohort A corpus before any generative chat is enabled.

**Primary artifacts:** `src/lib/rag/`, retrieval functions in `supabase/migrations/`, `evals/runners/`, `evals/reports/` and `evidence/wp05-retrieval/`.

### 8.0 Tasks

#### WP05-T01 — Build the evaluation runner first

**Depends on:** WP00-T05, WP04-T12. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Extend the existing runner `evals/runners/foundation-evaluation.ts` (run by `pnpm test:eval`) instead of starting a new one.
- [ ] Load the frozen manifest and JSONL, validate hashes, schema and counts, and refuse an unreviewed or modified dataset; refuse to report a gate result from the calibration part.
- [ ] Reset and seed the exact source scope the suite references; record the active source, embedding and chunking versions.
- [ ] Run cases deterministically where possible; store case-level JSONL plus aggregate Markdown and JSON.
- [ ] Record returned IDs, component scores, classification reasons, authorization scope, latency, provider units, configuration and correlation ID per case (§8.4).
- [ ] Calculate recall@k, MRR, the class confusion matrix, conflict and hint metrics, leakage count, p50/p95 and cost, broken down by query language × source language.

**Verify:** `pnpm test:eval` on the synthetic suite; a modified dataset is refused.

**Pass:** the runner reproduces identical results on two runs of the synthetic suite and refuses tampered input.

#### WP05-T02 — Implement query normalization as an auditable step

**Depends on:** WP05-T01. **Decision gates:** none. **Protected:** RLS and migrations (a stored search column). **Material UI:** no. **Real money:** no.

- [ ] Keep the original query and create a separate normalized search form.
- [ ] Write one versioned normalization function and apply it identically to stored segment text (a generated search column) and to the query: an IMMUTABLE SQL function (a generated column can call only that), with a TypeScript twin and shared parity fixtures; stopwords live inside the SQL function because hosted Supabase cannot load dictionary files. Normalizing only the query breaks matching against the `simple` configuration used today (§5.5).
- [ ] Fold Arabic letter variants (alef forms, ta marbuta and ha, alef maqsura and ya), remove tatweel and diacritics, map Arabic-Indic digits to ASCII, and apply configured spelling aliases conservatively.
- [ ] Remove Arabic (including common Egyptian) and English stopwords from the search form only, never negations ("مش", "لا", "no", "without"), which change clinical meaning; the founders and the academic reviewer approve the lists (§2.3).
- [ ] Preserve English medical/veterinary terms and numbers; never translate; keep Franco-Arabic digits used as letters (2, 3, 7) as typed unless the founders decide to transliterate.
- [ ] Test that normalization never changes intended entities or broadens scope, in Arabic, English, mixed and Franco-Arabic text.

**Verify:** normalization unit tests; `database-ci` for the stored column.

**Pass:** every normalization fixture keeps its entities and numbers; stored text and queries normalize identically; the original query is always retained.

#### WP05-T03 — Implement filtered hybrid retrieval

**Depends on:** WP05-T02, WP04-T10. **Decision gates:** none. **Protected:** RLS and migrations. **Material UI:** no. **Real money:** query embeddings through the budget guard once real (WP04-T20).

- [ ] Extend `unimind_private.retrieve_authorized_segments`, which already fuses full-text and vector ranks (reciprocal-rank fusion, k = 60, at most 50 results), instead of writing a second function: return source title, format, verified locator and tags; accept a topic filter and a correlation ID.
- [ ] Revalidate user, session, cohort and unit before embedding or querying (§8.1).
- [ ] Replace all-terms matching (`websearch_to_tsquery` over the `simple` configuration requires every word) with ranked or any-term matching over the WP05-T02 search column; evaluate an optional trigram fallback for misspellings.
- [ ] Compute the authorized source-version set first and pass it to the vector branch, so a later external vector service can replace that branch (master plan §8.9). Keep identical active-scope filters inside both branches before the limit. Prove the vector branch never returns fewer results than asked under a filter: compare exact search per unit, iterative index scans (pgvector 0.8 or later; check the installed version) and plain HNSW (§0.8).
- [ ] Merge by segment ID with a versioned fusion formula; keep raw component scores for evaluation.
- [ ] Remove near-duplicates, diversify sources, keep adjacent context only when justified, and boost tagged evidence only for a matching intent.
- [ ] Enforce maximum results and evidence tokens; keep internal diagnostics out of student responses.

**Verify:** `database-ci` retrieval and plan tests; runner on the synthetic suite; independent review.

**Pass:** retrieval returns only active authorized segments, never short results under a filter, with the intended query plan; component scores are recorded for every case.

#### WP05-T04 — Calibrate evidence classification without generation

**Depends on:** WP05-T03. **Decision gates:** none; a model-based conflict check needs D-04 and the budget guard. **Protected:** none. **Material UI:** no. **Real money:** only if the chosen conflict method calls a model.

- [ ] Implement the evidence classes `FULL`, `PARTIAL`, `UNAVAILABLE` and `CONFLICTING` (the `chat_answers.evidence_status` names) with reason codes as versioned code and configuration (§8.3).
- [ ] Decide and record in an ADR how conflicts are found at query time: annotated conflict pairs, contradiction signals between retrieved segments, a model check, or a combination; include cost per query and failure behaviour.
- [ ] Tune thresholds only on the calibration part; report final numbers on the sealed test part.
- [ ] Require coverage of each requested part, not one high vector score.
- [ ] Return both evidence groups for a detected conflict.
- [ ] Prohibit any later generator from upgrading `UNAVAILABLE` or filling missing `PARTIAL` points.

**Verify:** runner on the calibration and sealed test parts.

**Pass:** classification metrics on the sealed test part are reported; the conflict method and its cost are recorded.

#### WP05-T05 — Prove isolation before ranking quality

**Depends on:** WP05-T03. **Decision gates:** none. **Protected:** RLS. **Material UI:** no. **Real money:** no.

- [ ] Add canary segments to other users, cohorts, units and programs, inactive sources, an old curriculum edition and revoked-rights scope.
- [ ] Attack through the database function, the server service and HTTP with forged filters.
- [ ] Fail the whole gate on one cross-scope result, whatever the ranking metrics say.

**Verify:** security suite and `database-ci`.

**Pass:** zero cross-scope results across every path.

#### WP05-T06 — Establish and approve the baseline

**Depends on:** WP05-T04, WP05-T05, WP04-T21, WP00-T20. **Decision gates:** none beyond the signed suite. **Protected:** none. **Material UI:** no. **Real money:** yes, query embeddings inside the approved caps.

- [ ] Run exact vector search and candidate index settings on the calibration part of the real Cohort A suite; inspect false negatives, false positives, cross-language and Franco-Arabic misses, hint misses, conflict misses and slow queries case by case.
- [ ] Change one retrieval variable at a time and record before/after numbers on the calibration part.
- [ ] Freeze the accepted configuration with its version and the dataset hash, then run it once on the sealed test part for the gate.
- [ ] Report what the full-text branch adds per query language; a branch that adds nothing for Arabic questions is a recorded finding.
- [ ] The reviewer approves numeric targets for recall@k and MRR and the retrieval latency budget (derived from the chat first-token target); "reasonable results" is not a target.
- [ ] Make this suite a required step before any retrieval, chunking or embedding change is promoted to Beta (implementation rule 18).

**Verify:** the runner report `evidence/wp05-retrieval/<date>_retrieval-baseline_beta_<sha>.md`.

**Pass:** on the sealed test part: zero unauthorized retrieval; unavailable classification, known-conflict and direct professor-hint retrieval meet the §16 gates as chosen in WP00-T20; the approved recall, MRR and latency targets are met; query cost fits the D-05 per-request cap.

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

Direct topic/heading match; required-term coverage; multi-part coverage; number of independent non-duplicate segments; score threshold and gap; known or detected contradiction; missing requested entity or topic. The result is the evidence class `FULL`, `PARTIAL`, `UNAVAILABLE` or `CONFLICTING` with reasons. The generator may never upgrade `UNAVAILABLE`.

### 8.4 Evaluation record per case

Authorized scope and active source versions; returned segment and source IDs with score components; expected evidence hit or miss; cross-scope result count; professor-hint tag hit when required; classification result; latency and embedding/provider cost.

## 9. Work package 6: Strict-RAG subject chat

**Outcome:** in the real Chat screen, the student receives a streamed, source-grounded answer or an explicit partial, unavailable, conflict or safety result; an invalid factual draft is never committed or shown as accepted.

**Primary artifacts:** `src/lib/rag/`, `src/lib/safety/`, `src/lib/usage/`, the chat Route Handler, `workers/generation/`, the shared Chat screen, and `evidence/wp06-chat/`.

### 9.0 Tasks

#### WP06-T01 — Freeze contracts and policy versions

**Depends on:** WP05-T06. **Decision gates:** none beyond WP04-T19 (providers). **Protected:** RLS and migrations if the result field is added. **Material UI:** no. **Real money:** yes if the validator measurement calls a model, inside caps.

**Outputs:** Zod schemas; versioned policy files; the claim-validator ADR with its measurement.

- [ ] Define Zod schemas for the request, retrieval packet, generator draft, validated answer, stream events, persisted message and error response (§9.4). Map the evidence classes to `chat_answers.evidence_status` (`FULL`, `PARTIAL`, `UNAVAILABLE`, `CONFLICTING`) and add a separate result field by migration for `SAFETY_BOUNDARY` and `ERROR`, which that column cannot hold.
- [ ] Version the tutor policy, safety classifier, evidence classifier, prompt template, claim validator and model configuration independently; pin dated model snapshots, never moving aliases.
- [ ] Write standard Arabic/English copy for unavailable, partial, conflict, allowance/capacity, provider outage and real-patient boundary states.
- [ ] Choose the claim-validation method in an ADR (deterministic overlap, an entailment model, a model judge, or a combination) and measure it on the WP00-T20 labeled claim set, sized so the false-accept bound is meaningful; report false accepts, false rejects, cost and latency per answer; include injection text aimed at the validator itself; re-measure whenever a provider changes or retires a model. The target is zero accepted unsupported claims on the labeled set.
- [ ] Normalize Arabic-Indic digits before the validator compares numbers.
- [ ] Add contract fixtures for every result type and for malformed model output.

**Verify:** contract tests; the validator measurement report.

**Pass:** every result type has a schema and fixture; the validator's false-accept and false-reject rates, cost and latency are recorded in the ADR.

#### WP06-T02 — Implement the transactional request envelope

**Depends on:** WP06-T01, WP04-T13. **Decision gates:** per-student allowance values (WP00-T06; synthetic defaults until approved). **Protected:** RLS and migrations. **Material UI:** no (the allowance display is wired in WP06-T05). **Real money:** no.

- [ ] Accept only session ID, message, language and client request ID; derive user, cohort and unit from authenticated session rows (§9.1).
- [ ] Revoke direct student inserts into `chat_sessions` and `chat_messages`; every write goes through this envelope; move `createChatSession` (which inserts through the caller's client today) behind it in the same change.
- [ ] Read the allowance through an entitlement record (one free-beta entitlement now) kept apart from membership dates, so Phase 8 payments add records instead of rewriting this envelope.
- [ ] Validate size, session state, membership, availability, rate and concurrency limits, output-token and timeout limits, and budget.
- [ ] Enforce the per-student daily allowance (day boundaries in Africa/Cairo time) and expose a safe allowance/capacity state the UI can show (master plan §7.1 step 11).
- [ ] Reserve usage atomically before paid work with a unique action idempotency key.
- [ ] Return or continue the canonical prior request on replay instead of creating another message, call or reservation.
- [ ] Settle actual usage exactly once, or release/expire it on every failure and cancellation path.

**Verify:** unit and `database-ci` tests including concurrent duplicate submissions and a direct-insert attempt.

**Pass:** a replayed request creates nothing new; a direct insert is denied; every path ends with exactly one settlement or release; allowance and rate limits hold under concurrency.

#### WP06-T03 — Classify context and protect private content

**Depends on:** WP06-T01. **Decision gates:** none. **Protected:** none. **Material UI:** yes — its warnings render in WP06-T05. **Real money:** yes if classification calls a model, inside caps.

- [ ] Distinguish educational cases from explicit real-patient or personal-care requests with frozen fixtures and a versioned policy (§9.7).
- [ ] Detect personal identifiers, warn the student not to share them, and apply retention and logging rules before any diagnostic log.
- [ ] Keep question and source content out of infrastructure logs; log IDs, categories, sizes, hashes and safe reason codes.
- [ ] Test Arabic, English, mixed and Franco-Arabic language, adversarial wording and prompt injection inside retrieved sources; include veterinary owner-animal personal-care and species-specific dose cases now, so WP10 does not re-measure the classifier.
- [ ] Ask the founders whether the personal-data warning blocks sending or only warns.

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

**Depends on:** WP06-T02 to WP06-T04, WP04-T14. **Decision gates:** none. **Protected:** RLS and migrations (source-list function); production configuration (generation runtime, security headers). **Material UI:** yes — the real Chat screen, its streaming, evidence, report and allowance states, and the Materials source list. **Real money:** yes, generation inside caps.

**Outputs:** the chat Route Handler and generation runtime; the real Chat and Materials screens through the WP03-T17 adapter seam.

- [ ] Decide where generation runs: inside the Vercel function (within the Hobby duration and active-CPU allowances, §0.8) or in the WP04-T14 worker with a stream relay. Measure active CPU per chat and project it to the WP00-T07 profile before building the rest.
- [ ] Separate draft stream state from accepted answer state; persist no evidence and mark no message complete until the WP06-T01 validator contract accepts it (a fixture validator until WP06-T06 lands).
- [ ] Present the display strategies to the founders (buffer factual sentences until validated, stream clearly provisional text that can be replaced, or release validated structured sections); buffering means the student sees no stream, which master plan §7.1 step 6 asks for. Record their choice; "first token" in the latency gate means the first visible text.
- [ ] Render model output without raw HTML or remote images and with allow-listed links only; add a Content-Security-Policy (`img-src`, `connect-src`) so injected markup cannot send chat context elsewhere.
- [ ] On client disconnect, continue or cancel according to policy and settle exactly once; on provider error, emit a controlled terminal event without raw provider diagnostics.
- [ ] Connect the shared Chat screen to the real backend through the WP03-T17 seam: remove the disabled notice in real mode and design every result state with English and Arabic copy in the answer's language: full, partial, unavailable, conflict, safety boundary, personal-data warning, validator fallback, provider outage or disabled, allowance exhausted (reset time in Africa/Cairo), capacity, access revoked during a request (draft kept) and the first-chat founder-visibility disclosure (D-08). Show source titles, formats and verified locators and the report action. Announce status through one polite live region (never per token), keep focus in the composer when provisional text is replaced, and isolate mixed-direction runs and Arabic-Indic digits. Keep the synthetic runtime on the same screen.
- [ ] Ask the founders whether to build or remove the demo's "questions covered by these materials" panel, and whether the landing promise of a page or timestamp behind every claim stays (D-14 makes locators optional).
- [ ] Add the authorized source-list function so Materials shows title and format, not only count, edition and freshness.

**Verify:** stream fault tests; `pnpm test:e2e:database` and `pnpm test:e2e:demo`; CSP and rendering tests; frontend floor; founder review of the rendered candidate.

**Pass:** an invalid draft is never displayed as accepted; injected markup renders inert; the real and synthetic Chat render the same components; projected generation CPU fits the plan; the chat keeps at least 400 px of conversation at 360×640 with the new lines; `Approved commit:` recorded.

#### WP06-T06 — Validate every accepted factual component

**Depends on:** WP06-T05. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** yes if the validator calls a model, inside caps.

- [ ] Reject packet-unknown evidence IDs, wrong scope, version or state, invented quotes, locators or titles, and unsupported sentences (§9.5).
- [ ] Validate missing-point and conflict structures separately.
- [ ] Require every professor label to map to a tagged span.
- [ ] Return a grounded fallback or unavailable result on failure; never only strip citations from unsupported text.
- [ ] Persist the final answer and its evidence links in one transaction.
- [ ] Measure first-token p50/p95 with the real validator in place on the Cohort A corpus against the 5 s / 12 s targets.

**Verify:** validator fixtures including invented locators and cross-scope IDs; the latency report.

**Pass:** every invalid fixture is rejected or replaced by a fallback; accepted answers always have evidence links; measured first-token latency is reported against the target.

#### WP06-T07 — Implement retention and reporting lifecycle

**Depends on:** WP06-T06. **Decision gates:** none; this task brings the proposed D-08 to approval (D-19 values come from WP04-T15). **Protected:** RLS and migrations. **Material UI:** yes — the chat sharing mode control in Settings and the report flow. **Real money:** no.

- [ ] Bring the proposed [D-08 record](../decisions/d-08-chat-retention.md) to a decision: retention modes, the chat sharing mode, misuse-detection categories and thresholds, and the review window.
- [ ] Obtain Ahmed's and Ziad's approval of D-08 (this step becomes `[?]` while it waits).
- [ ] Map the approved modes onto the existing `MINIMAL`, `HISTORY` and `DISABLED` values on `chat_sessions` and `profiles.chat_retention_mode`, or rename them by migration; add a content-redaction migration, because `chat_messages.content` is required and answers reference messages `on delete restrict`.
- [ ] Settings lists the student's saved sessions in every unit, including units no longer available, with read and delete; an answer whose source is inactive shows the inactive-source note, and a redacted quote shows that the source was withdrawn. Replace the report screen's "still being confirmed" copy and name all three D-08 exceptions (report, consent, automated flag) in Settings.
- [ ] No-save mode: remove content after the approved technical window, keeping only minimal non-content security and usage data.
- [ ] Saved sessions: owner list, read and delete; default audited founder visibility with clear student disclosure; a time-effective chat sharing mode in Settings.
- [ ] Reports, consent or an approved automated misuse flag snapshot only the permitted exchange with policy, model and source versions, evidence, reason and review expiry; under a private sharing mode, admin review reaches only reported, consented or qualifying flagged cases; every access to chat content is audited.
- [ ] Implement automated misuse detection only with the approved versioned categories and thresholds.
- [ ] Test deletion, expiry, report-before-expiry, consent withdrawal and what backups keep (WP04-T16).

**Verify:** `database-ci` retention and access tests; `pnpm test:e2e:database` for the Settings control and report flow; founder review of the rendered candidate.

**Pass:** every retention mode behaves as D-08 says; every founder access to chat content leaves an audit row; `Approved commit:` recorded.

#### WP06-T08 — Run frozen, fault, and browser gates

**Depends on:** WP06-T07. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** yes, inside caps.

- [ ] Run every case of the sealed test part at least three times (generation is not deterministic) and report the worst run.
- [ ] Kill the client stream, the generation worker and the provider response at defined points; replay the client request ID and verify one answer and one settlement.
- [ ] Revoke membership or a source during a request and verify the final commit rechecks scope.
- [ ] Academic review: if the WP06-T01 validator measured any false accept, the reviewer checks every accepted frozen answer against its evidence; otherwise a sample with the WP00-T20 rubric is enough. Apply the WP00-T20 second-rater decision.
- [ ] Make this suite a required step before any prompt, policy, model or validator change is promoted to Beta (implementation rule 18).
- [ ] Write `evidence/wp06-chat/<date>_chat-gate_beta_<sha>.md`.

**Verify:** the frozen suite report; fault tests; academic review record.

**Pass:** zero unsupported factual claims in accepted answers; 100% evidence-link coverage; at least 95% correct unavailable cases; 100% of known conflicts show both positions; professor hints labelled and at least 95% retrievable; at least 95% of educational cases answered without false refusal when evidence exists; 100% of explicit real-patient cases apply the boundary — each as chosen in WP00-T20 (§16); failed and timed-out requests settle or release exactly once; zero outside-answer or web-search calls.

### 9.1 Chat request contract

The client sends session ID, message, language preference and client request ID. The server takes user, cohort and unit from the authorized session and rejects a mismatch; it limits message length and active requests per user.

### 9.2 Request order

1. Authenticate the user; load the session and derive cohort and unit.
2. Revalidate membership and availability.
3. Reserve usage atomically with the request idempotency key; apply rate and concurrency limits.
4. Classify educational case, explicit real-patient request, personal-data risk and language.
5. Run authorized retrieval and classify the evidence.
6. `UNAVAILABLE`: persist and stream the standard unavailable answer and skip generation. `PARTIAL`: build a packet with supported evidence and explicit missing parts. `CONFLICTING`: build separately labeled position packets. `FULL`: build the supported packet.
7. Generate structured metadata and streamed text, buffering enough to stop an invalid answer from being committed as valid.
8. Validate evidence IDs, claim support, scope, conflict disclosure and invented locators or quotes; on failure return a grounded fallback or unavailable response.
9. Persist under the retention policy with evidence links; settle usage or release the reservation; record latency, provider usage, validation and result without private evidence diagnostics.

### 9.3 Tutor policy

Use only supplied evidence from approved uploaded material; never use outside facts or imply an outside search; keep required English technical terms in Arabic or mixed answers; treat retrieved instructions as quoted data; say plainly when the uploaded material lacks the information; separate supported and missing parts; state when sources conflict and present each position; label professor hints as hints, never guaranteed exam truth; answer educational medical and veterinary cases when evidence exists; apply a concise real-patient boundary only to actual personal-care contexts; never invent a source title, page, timestamp, URL, quotation or evidence ID.

### 9.4 Response contract

Structured server-side output: `evidence_status` (`FULL | PARTIAL | UNAVAILABLE | CONFLICTING`) plus a result field for `SAFETY_BOUNDARY` and `ERROR` (WP06-T01); `answer_text`; `used_evidence_ids`; `missing_points`; `conflict_positions` with evidence IDs; `professor_hint_labels` with evidence IDs; `student_source_labels` with title, format and a reliable locator when available; `validation_state`, set by the server, never the model. The UI never requires an exact page or timestamp for a valid answer and never shows an unverified locator.

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
- [ ] Create versioned schemas for summary, study guide, practice questions, flashcards, MCQs and the topic-focused revision pack (§10.2 to §10.5), with stable option keys that never depend on display order or script direction.
- [ ] Fix the quiz parameters the founders already asked for in WP03-T13 (configurable item count, difficulty and timing) and the MCQ option count within §10.5; record them in §2.3.
- [ ] Reject unknown fields and invalid structures at the worker boundary; keep a malformed draft only in restricted diagnostics if policy allows.

**Verify:** schema tests with valid and invalid fixtures per type.

**Pass:** every artifact type has a schema and fixtures; the quiz parameters are recorded and founder-confirmed.

#### WP07-T02 — Implement durable request and safe cache lookup

**Depends on:** WP07-T01. **Decision gates:** none. **Protected:** RLS and migrations. **Material UI:** no. **Real money:** no.

- [ ] Canonicalize parameters and compute the cache key from authorized active source versions, policy/model/validator, type, language and parameters.
- [ ] Give the cache a database mechanism: today an artifact is readable only through the requesting user's own request, so one artifact cannot serve a second student. Add a per-request link to a shared artifact with matching policies, and revalidate the requester's current access to every cached evidence segment before reuse.
- [ ] Revoke direct student inserts into `studio_requests`; enforce the per-student Studio allowance and artifact size limits (§2.3); reserve usage and create the durable request in one transaction.
- [ ] Return the canonical artifact or request on a duplicate idempotency key.
- [ ] Run generation in the worker; the browser never controls completion.

**Verify:** `database-ci` cache-authorization, direct-insert and idempotency tests.

**Pass:** a cached artifact is never served to a caller who lacks access to any of its evidence; duplicates create nothing new.

#### WP07-T03 — Generate and validate by artifact type

**Depends on:** WP07-T02. **Decision gates:** none. **Protected:** none. **Material UI:** yes — the real Studio screen. **Real money:** yes, generation inside caps.

- [ ] Retrieve through the same authorized unit service as chat.
- [ ] Represent partial coverage and conflicts explicitly; never label an incomplete artifact comprehensive.
- [ ] Map every factual section, item, answer and rationale to evidence; validate with the WP06-T01 method.
- [ ] Reject duplicate or near-duplicate questions and cards and ambiguous wording; for MCQs require the §10.5 rules.
- [ ] Keep original-exam content disabled unless the individual source permission explicitly allows it.
- [ ] Render artifacts under the WP06-T05 output policy (no raw HTML or remote images); isolate the direction of mixed Arabic/English runs.
- [ ] Connect the shared Studio screen to the real backend through the WP03-T17 seam: request, progress, completed, failed, partial, stale, allowance exhausted, artifact type disabled, too little material, and leaving and returning while a durable job runs; list the student's artifacts in the unit; English and Arabic copy for each; keep the synthetic runtime on the same screen.

**Verify:** artifact fixture suite; `pnpm test:e2e:database` and `pnpm test:e2e:demo`; frontend floor; founder review of the rendered candidate.

**Pass:** every artifact type completes inside the subject Studio with evidence links; unsupported content is rejected; `Approved commit:` recorded.

#### WP07-T04 — Implement quiz lifecycle server-side

**Depends on:** WP07-T03. **Decision gates:** none. **Protected:** RLS and migrations. **Material UI:** yes — the real Quiz and review screens. **Real money:** no.

- [ ] Migrate `quiz_attempts`: today it has no state, item/option snapshot or expiry columns, it forbids a submitted-but-unscored row, and students can insert attempts and update `submitted_at`. Add the §10.6 states, the snapshot and expiry; revoke the student insert and update grants on `quiz_attempts` and `quiz_responses`; move every write to server functions.
- [ ] Start attempts from an authorized current artifact; keep answer keys server-side before submission.
- [ ] Save responses idempotently, enforce server timestamps and timer rules, and score on the server.
- [ ] Make final submission idempotent and immutable except through a separately audited correction policy.
- [ ] Keep historical attempts when the source or artifact later goes stale, with the current availability labelled.
- [ ] Derive weak-topic signals from scored attempts by topic tag and show them in review (master plan Phase 4).
- [ ] Add a resumable attempt route (list it in §6.1) and an interrupted state that keeps answers across reload and devices; keep an untimed mode or record why a time limit is essential (WCAG 2.2.1), announce remaining time at thresholds, and mark correct and wrong answers with text and an icon, not colour alone.
- [ ] Connect the shared Quiz and review screens to the real backend through the WP03-T17 seam.

**Verify:** `database-ci` attempt, grant and scoring tests; `pnpm test:e2e:database` for timed and untimed attempts; founder review.

**Pass:** one score per submission, answer keys never reach the client before submission, a student cannot write an attempt directly, weak topics appear in review; `Approved commit:` recorded.

#### WP07-T05 — Invalidate safely on scope change

**Depends on:** WP07-T04. **Decision gates:** none. **Protected:** RLS and migrations. **Material UI:** yes — the report action on artifacts and quiz items. **Real money:** no.

- [ ] Recompute scope hashes on source activation, deactivation or replacement, rights revocation, embedding or policy change, and corrected evidence (§10.7).
- [ ] Ask the founders how stale artifacts and in-progress quizzes behave (proposal: mark stale artifacts with a Regenerate action; a rights revocation ends in-progress attempts as `ABANDONED` with a reason; an ordinary deactivation lets them finish), then implement it without deleting historical evidence or attempts.
- [ ] Cancel queued requests whose authorization or scope is no longer valid and release their reservations.
- [ ] Let students report an artifact or a quiz item (wrong, unsupported, unclear) through the same reporting lifecycle as chat (WP06-T07); migrate `feedback_reports`, which today cannot target a quiz item (its `entity_type` check has no quiz-item value, its `entity_id` is a UUID while items use text keys, and it has no "unclear" category).
- [ ] Test a change during generation, during a quiz and after submission.

**Verify:** invalidation and reporting tests; `database-ci`; founder review of the report action.

**Pass:** no stale artifact is shown as current; reports on artifacts and quiz items reach the admin queue with their evidence snapshot; `Approved commit:` recorded.

#### WP07-T06 — Run artifact and quiz gates

**Depends on:** WP07-T05. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** yes, inside caps.

- [ ] Run every case of the sealed Studio test part, in supported and insufficient scope, at least three times; report the worst run.
- [ ] Validate claim and item provenance coverage; academic review as in WP06-T08 (every accepted claim when the validator had any false accept, otherwise a sample) with the WP00-T20 second-rater decision.
- [ ] Race duplicate requests and duplicate final quiz submissions.
- [ ] Attempt cache access from another user, cohort or unit and after membership or source revocation.
- [ ] Verify timed and untimed scoring, answer-key secrecy, grounded review, settlement, retry and invalidation.
- [ ] Make this suite a required step before any Studio prompt, policy, model or validator change is promoted to Beta (implementation rule 18).
- [ ] Write `evidence/wp07-studio/<date>_studio-gate_beta_<sha>.md`.

**Verify:** the frozen artifact suite report.

**Pass:** every artifact type completes inside the subject Studio; 100% internal provenance on accepted artifacts; zero unsupported accepted claims, answers or explanations; conflicts and hints labelled; one score per quiz; no duplicate artifact or settlement.

### 10.1 Studio request flow

1. The student opens Studio inside an authorized unit and picks type, topic or all material, language, depth and size.
2. The server revalidates scope, computes the active source-scope hash and checks the safe cache.
3. With no authorized valid artifact, it reserves usage and creates a durable request.
4. The worker retrieves from the same unified knowledge pool, returns an unavailable or partial state or generates the structured artifact.
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

**Depends on:** WP04-T14, WP06-T05. **Decision gates:** none (D-17 approved in WP04-T14). **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Create `docs/operations/topology.md` naming web, ingestion worker, generation runtime, reconciliation scheduler, database, queue, raw/processed storage, backup, monitoring, email and notification boundaries.
- [ ] Record for each component: deployment artifact, region, runtime/size, concurrency, health endpoint, scaling control, secret scope, log destination, owner, monthly cost and its data-protection subprocessor entry (WP00-T21).
- [ ] Prove the full Preview and Beta topology keeps running with Ahmed's and Ziad's computers off.
- [ ] Keep PostgreSQL the workflow authority even with an external queue or orchestrator.

**Verify:** topology review against deployed state.

**Pass:** every running component is listed with its owner, region and cost; none depends on a founder computer.

#### WP08-T02 — Deploy health, metrics, logs, and traces

**Depends on:** WP08-T01. **Decision gates:** none; a paid service is a money stop. **Protected:** production configuration. **Material UI:** no. **Real money:** only if a paid service is chosen.

- [ ] Extend the WP04-T02 structured logs with timestamp, environment, release, component, correlation/request/job/provider IDs, safe event, duration, outcome and error code.
- [ ] Ship redacted logs to a durable sink: Vercel Hobby keeps runtime logs for about an hour and Supabase Free for about a day (§0.8), too short for incident evidence. The sink is a subprocessor (WP00-T21).
- [ ] Separate liveness from readiness; readiness checks dependencies with timeouts.
- [ ] Track request rate, errors and duration, first-token time, queue age and depth, job outcomes and retries, lease expiry, provider latency, errors and cost, raw-deletion age, retrieval quality, validation failures, reservations, budgets, database and storage capacity, Vercel usage meters and reconciliation outcomes.
- [ ] Choose an error-reporting destination at zero cost or stop for a money decision; test redaction of secrets, authorization headers, signed URLs, source content and chat content.
- [ ] List every secret with its location and rotation owner, and rehearse one rotation end to end.

**Verify:** metric and redaction tests; the rotation rehearsal record.

**Pass:** every listed signal is visible per environment and logs survive beyond the platform retention; redaction tests pass; one secret rotation is rehearsed.

#### WP08-T03 — Implement schedules as idempotent jobs

**Depends on:** WP08-T01, WP04-T11. **Decision gates:** none. **Protected:** production configuration. **Material UI:** no. **Real money:** no.

- [ ] Create one named `RECONCILE` job per §11.2 schedule with its query, batch limit, timeout, lock, retry, metric and incident threshold; run them from the WP04-T14 scheduler (a Vercel Hobby cron runs at most once a day).
- [ ] Prevent overlapping runs with `FOR UPDATE SKIP LOCKED`, a transaction-level advisory lock or a durable scheduler claim (the transaction pooler does not keep session-level advisory locks); paginate large scans.
- [ ] Test a skipped run, duplicate invocation, partial failure, long run and the Africa/Cairo daylight-saving change.

**Verify:** schedule tests; job history in Preview.

**Pass:** every schedule runs on time in Preview, never overlaps and is safe to repeat.

#### WP08-T04 — Build least-privilege admin operations

**Depends on:** WP08-T02. **Decision gates:** none. **Protected:** RLS. **Material UI:** yes — the admin resource screens with real data and real-mode admin preview. **Real money:** no.

- [ ] Connect the §11.3 dashboards to safe summary views and services; in real mode every admin resource page shows a "not available yet" notice today.
- [ ] Add real-mode admin preview (master plan §7.2 step 5): an admin previews the catalog, Chat, Studio and Quiz of an unpublished unit through the `admin_preview` path, which real mode currently hard-codes to off; the preview is visibly marked, audited, creates no membership and denies non-admins.
- [ ] Replace arbitrary edit or replay controls with audited typed actions and precondition checks; give charts a data-table alternative (`DESIGN.md` has no chart rules yet, so the chart style is a founder question).
- [ ] Require a reason and confirmation for source deactivation, cohort lock, raw hold, replay after terminal correction and provider or feature enablement.
- [ ] Show operator-safe details; keep sensitive provider, raw and chat evidence behind stricter access and audit.

**Verify:** `pnpm test:e2e:database` for each dashboard, action and the preview parity with the student render; forbidden-role tests; founder review.

**Pass:** an admin can follow any source from receipt to `READY` or failure, inspect conflicts, storage reduction, latency and cost, preview the student experience and act, without SQL; `Approved commit:` recorded.

#### WP08-T05 — Implement alert routing and automatic controls

**Depends on:** WP08-T02, WP04-T17. **Decision gates:** none; this task completes D-20 (WP04-T17 already delivers budget alerts by email). **Protected:** production configuration. **Material UI:** no. **Real money:** yes if a paid channel is chosen.

- [ ] Prepare the rest of D-20: alert and incident channels, recipients and escalation.
- [ ] Obtain Ahmed's and Ziad's approval of D-20 (this step becomes `[?]` while it waits).
- [ ] Create `docs/operations/alert-catalog.md` with signal, query, severity, threshold and window, dedup key, recipients, automatic action, acknowledgment, escalation and runbook link.
- [ ] Deliver every §11.4 alert through the approved channel, including Vercel and Supabase usage meters; test each with synthetic events, including delivery failure.
- [ ] Make budget and provider circuit controls atomic and immediate for new reservations and claims, without corrupting accepted jobs.
- [ ] Group, de-duplicate and send recovery notices without hiding continued failure.
- [ ] A leakage-canary or validator regression disables Chat and Studio for the affected cohort automatically.

**Verify:** alert delivery tests.

**Pass:** every catalogued alert reaches its recipient through the approved channel.

#### WP08-T06 — Back up and restore the complete durable system

**Depends on:** WP04-T16, WP07-T06. **Decision gates:** none. **Protected:** production configuration. **Material UI:** no. **Real money:** no new spend.

- [ ] Extend the WP04-T16 procedure to the complete system: database including Auth data, processed objects, artifacts, chat retention, usage and audit.
- [ ] Reconnect or rebuild embeddings as the documented strategy says.
- [ ] Verify row counts and referential checks for catalog, access, sources, documents, segments, evidence, artifacts, usage, jobs and audit.
- [ ] Verify no expired raw object, redacted segment or deleted no-save content returns from backup.

**Verify:** a timed full restore rehearsal report with the key retrieved from custody.

**Pass:** the full restore succeeds with verified counts and nothing resurrected that policy deleted.

#### WP08-T07 — Write and exercise incident runbooks

**Depends on:** WP08-T05, WP00-T21. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Copy [the incident template](../templates/incident-runbook.md) for every §11.6 incident, extending the minimum set written in WP04-T18.
- [ ] Write the personal-data breach runbook with the notification duties and deadlines recorded in D-28.
- [ ] Open a public takedown channel for rights holders with a response target, wired to the WP03-T37 revoke action and the WP04-T11 takedown path.
- [ ] Fill detection, severity, containment, evidence preservation, owner and escalation, communications, diagnosis, repair, replay, validation, recovery and follow-up.
- [ ] Run a tabletop for every runbook and hands-on drills for leakage, bad source, deletion failure, provider outage, stuck job, budget exhaustion, leaked secret, rights takedown, personal-data breach and restore/re-index.
- [ ] Time detection, containment and recovery; record gaps as defects.

**Verify:** drill records with timings.

**Pass:** every §11.6 runbook exists and has been exercised; the breach drill meets the D-28 deadlines.

#### WP08-T08 — Run the unattended proof

**Depends on:** WP08-T03 to WP08-T07, WP04-T24. **Decision gates:** the observation window (§2.3), set with a founder; no proof is claimed until it is. **Protected:** none. **Material UI:** no. **Real money:** yes, small, inside caps.

- [ ] Start from a recorded candidate SHA and configuration fingerprint.
- [ ] Inject faults only in a synthetic cohort and prove no real source changed state. Submit valid synthetic PDF, audio and Studio work; inject a transient provider failure, expire a lease, fail a deletion, fail a chat generation and kill one worker.
- [ ] Leave the system unattended for the approved window.
- [ ] Confirm recovery or isolation, correct alerts, stable idempotent counts, settled usage and no manual SQL or script.
- [ ] Write `evidence/wp08-operations/<date>_unattended_beta_<sha>.md` with a timestamped event timeline.

**Verify:** the event timeline and reconciliation report.

**Pass:** zero manual processing steps; every injected fault recovered or isolated automatically with the right alert.

#### WP08-T09 — Threat-model the beta and run the pre-beta security review

**Depends on:** WP08-T08, WP03-T35, WP03-T38. **Decision gates:** none. **Protected:** auth (CAPTCHA); production configuration (headers, Auth settings). **Material UI:** yes — CAPTCHA on the access pages. **Real money:** no.

- [ ] Write a threat model for the beta: assets, actors and trust boundaries for students, Batch Leaders (links or accounts), admins, workers, providers, storage, backups and email.
- [ ] Ask the founders to choose the CAPTCHA provider (a new third-party component and a data processor under D-28), then add it to sign-up, sign-in and recovery (it is configured nowhere today) so it meets WCAG 3.3.8, works in Arabic, RTL and dark theme and fits the Content-Security-Policy; confirm the sign-up mode chosen with D-25 and the Auth rate limits sized to the waves; check the versioned Beta Auth settings (WP04-T17) for drift.
- [ ] Review registration and recovery abuse, upload abuse (size, type, malware, storage exhaustion), cost-exhaustion attacks on chat and Studio (including Vercel usage meters), prompt injection through sources and into the validator, link-token leakage, the Content-Security-Policy, RLS and grants, privileged module use, secrets handling and the dependency audit.
- [ ] Run `/security-review` or an equivalent independent review on the release candidate and fix or record every finding.

**Verify:** threat model document; review findings with dispositions.

**Pass:** no open high-severity finding; every accepted risk has a named founder decision.

#### WP08-T10 — Instrument the success signals

The master plan §12 signals had no measurement task.

**Depends on:** WP06-T08, WP07-T06. **Decision gates:** none; the measurement must conform to D-08. **Protected:** RLS and migrations if new tables. **Material UI:** yes — an answer usefulness/trust rating. **Real money:** no.

- [ ] Define with the founders: activation (a useful chat, Studio artifact or quiz), 7-day return, "meaningful session", repeated value and the trust rating question.
- [ ] Derive activation, return and repeated value from existing records (sessions, answers, artifacts, attempts) without a third-party analytics service unless one is approved.
- [ ] Ask the founders whether trust is measured by a sampled survey (master plan §12 says "sampled active users") or a rating on every answer (which changes the approved answer card), and build the chosen one without storing more chat content than D-08 allows.
- [ ] Exclude synthetic load and fault-injection rows (tagged by run) from every signal.
- [ ] Report automation (share of valid sources READY without intervention) and cost per action, source and cohort from the job and usage ledgers.
- [ ] Show the signals in an admin report with per-cohort breakdown.

**Verify:** metric tests on synthetic activity; `pnpm test:e2e:database` for the rating; founder review.

**Pass:** every master plan §12 signal is computed from recorded data for a synthetic week of activity; `Approved commit:` recorded.

#### WP08-T11 — Build account and data-subject controls

The [session revocation policy](../policies/auth-session-revocation.md) defers deleting real accounts to a later task, and D-28 may require access, correction and deletion requests.

**Depends on:** WP06-T07, WP07-T06, WP00-T21. **Decision gates:** none beyond D-28. **Protected:** auth and authorization; RLS and migrations. **Material UI:** yes — account controls in Settings. **Real money:** no.

- [ ] Let a student see and export their own data (profile, memberships, saved chats, artifacts, attempts, reports) in a readable format.
- [ ] Let a student delete saved chats (WP06-T07) and delete their account: revoke sessions, remove or redact personal data, keep only the audit and usage metadata the approved policies allow, and record what remains in backups until they expire.
- [ ] Handle correction requests for profile data and record every request and its outcome.
- [ ] Ask the founders: a grace period or re-login before deletion; the export format and language; whether exports include source quotes (a rights question); what happens to reports still under review.
- [ ] Test deletion with active sessions, memberships, reports under review and a pending quiz.

**Verify:** `database-ci`; `pnpm test:e2e:database`; independent review.

**Pass:** each D-28 data-subject request type can be completed from the product or a documented admin action without SQL; `Approved commit:` recorded.

#### WP08-T12 — Open Beta to students on the public domain

Beta is a Vercel preview deployment behind Vercel Authentication with no production domain, while `unimind.space` serves the synthetic Preview project. Students cannot reach Beta as it stands ([third review](../reviews/runbook-revision-2026-10/third-review.md) D1).

**Depends on:** WP08-T09. **Decision gates:** which project serves the public domain (founder choice). **Protected:** production configuration; auth (redirect URLs). **Material UI:** no. **Real money:** no, unless the domain or plan changes cost.

**Outputs:** a Beta production deployment on the chosen domain, Auth site and redirect URLs, an updated [environment promotion](environment-promotion.md) and [environment matrix](../../planning/environment-matrix.md).

- [ ] Ask the founders which project serves `unimind.space` once the beta opens, and where the synthetic Preview and its hosted demo move (for example a clearly labelled subdomain).
- [ ] Create the Beta production deployment and domain; set the Supabase site URL and redirect allow-list; align the WP04-T17 sending domain and the Content-Security-Policy.
- [ ] Prove Beta stays closed to students (no memberships) until WP11-T03, and keep a holding page ready as the rollback.

**Verify:** Auth flows on the public Beta domain with founder test accounts; deployment smoke; independent review.

**Pass:** a founder test account registers, verifies and signs in on the public Beta domain, while no student holds a membership.

#### WP08-T13 — Assign beta operating roles

The runbook names an operations role, owners and support targets but defines none of them, and re-enabling a real provider needs both founders ([third review](../reviews/runbook-revision-2026-10/third-review.md) D8).

**Depends on:** WP08-T07. **Decision gates:** none; the founders set the roles. **Protected:** none. **Material UI:** no. **Real money:** no.

**Outputs:** `docs/operations/operating-roles.md`.

- [ ] With the founders, set a weekly rota (primary and secondary founder), coverage hours, acknowledgment and containment targets per severity tied to the D-28 breach clock, the student support channel and its response target, an exam-period calendar, and what an agent may do during an incident (read-only diagnosis plus disabling flags).
- [ ] Run a paging drill on the D-20 channel.

**Verify:** the roles document; the drill record.

**Pass:** every severity has a named owner, target and backup for each planned wave.

### 11.1 Always-on runtime

Deploy the stateless web application, the database job dispatcher or queue, the ingestion worker with job-type concurrency limits, the generation/Studio worker with separate limits, the scheduled reconciliation worker, and monitoring and error reporting. Nothing in this list runs on Ahmed's or Ziad's computer. If n8n is introduced, it runs on approved external infrastructure as an optional orchestrator with state and business logic kept in PostgreSQL and tested workers. A PC-hosted Telegram bot is noncritical test tooling on synthetic data only and satisfies no gate.

### 11.2 Reconciliation schedules

- Every 1–5 minutes: reclaim expired job leases and release timed-out interactive reservations.
- Every 15 minutes: retry eligible failed raw deletions and detect stuck workflows.
- Hourly: find READY sources missing active embeddings or segments, or with inconsistent raw state.
- Daily: verify budget counters, provider-cost totals, storage totals, deletion-deadline compliance, inactive memberships and failed notifications.
- Weekly: run the frozen retrieval, chat and Studio regressions inside the approved cost window and publish a report.

Intervals may change after measurement; the jobs and their owners stay explicit. They run on the WP04-T14 scheduler, not on a once-a-day platform cron.

### 11.3 Admin dashboards

In order: cohort and unit readiness and release; campaign and Batch Leader submission status; source workflow timeline, quality report and detected conflicts; raw storage and deletion compliance; job queue, retries, dead letters and replay; retrieval, chat and Studio evaluation results; usage, provider cost, budgets, rate-limit state, storage reduction and latency; reported answers, artifacts and quiz items with controlled access; success signals (WP08-T10); incident timeline and audit trail. Every mutation is audited and calls a tested server or database operation.

### 11.4 Alerts and automatic controls

Alert on: raw deletion deadline exceeded; repeated provider failure or circuit opening; queue age above threshold; READY-state inconsistency; authorization or leakage test failure; unsupported-claim regression; budget at 50/75/90/100%; database or storage capacity threshold (including Free-plan limits); email delivery failure; backup or reconciliation failure. At the hard budget threshold, block optional new paid work and return a controlled capacity message without corrupting accepted work.

### 11.5 Backups and restore

Database backups suit beta risk; durable processed objects are backed up or versioned per policy; raw objects are never backed up beyond their window; restore is rehearsed into an isolated target that may hold the data it receives; catalog, memberships, source versions, segments, evidence, artifacts, ledger and audit are verified after restore; embeddings are rebuilt from processed documents if they are not backed up.

### 11.6 Incident runbooks

Unsupported or high-risk answer; cross-cohort or cross-user leakage suspicion; bad source publication; source rights takedown; incomplete processed text after raw deletion; premature raw deletion; raw deletion failure; provider outage or rate limit; stuck or duplicate job; usage reservation inconsistency; budget exhaustion; leaked secret or link token; email delivery outage; personal-data breach (D-28 notification duties); rights-holder takedown request; database restore and re-index. Each states the first action, what to disable, evidence to keep, owner, communications decision, repair, replay and regression test.

## 12. Work package 9: Cost and 100-student validation

**Outcome:** the minimum practical beta configuration meets the exact, reproducible 100-student scenario with zero leakage, lost work or duplicate accounting, and approved performance and cost.

**Primary artifacts:** `tests/load/`, `scripts/run-load-suite.ts`, `planning/load-profile-100-students.yaml` and `evidence/wp09-load-cost/`.

### 12.0 Tasks

#### WP09-T01 — Benchmark providers with a controlled matrix

Provider selection moved to WP04-T19. This task re-checks the selected providers at load scale.

**Depends on:** WP08-T08. **Decision gates:** D-05 caps for the load window. **Protected:** none. **Material UI:** no. **Real money:** yes — stop for fresh two-founder confirmation naming the load-test spend.

- [?] Load-test spend approved by Ahmed and Ziad. OWNER INPUT REQUIRED.
- [ ] Re-measure the selected providers' rate limits, concurrency, p50/p95 and cost at the load profile's peak rates, with the same fixtures and settings as WP04-T19.
- [ ] Confirm the fallback and disable strategy from the D-04 record works under load; update the D-04 record if a limit changes the plan.

**Verify:** provider load report.

**Pass:** the selected providers sustain the profile's peak within their limits, or the gap is recorded with the decision it needs.

#### WP09-T02 — Freeze infrastructure and test safety

**Depends on:** WP09-T01. **Decision gates:** none; any plan increase is a money stop. **Protected:** production configuration. **Material UI:** no. **Real money:** no new spend.

- [ ] Record the exact web, worker, database, queue and storage plans, regions, pooling, concurrency, limits, cache, provider quotas, flags and release SHA (§12.1); recheck the Free-plan allowances against the profile (§0.8).
- [ ] Provision only synthetic test users and content with canaries and a dedicated test prefix and scope.
- [ ] Build the load executor: `scripts/run-load-suite.ts` only validates the profile today and runs no workload.
- [ ] Version the load profile for the approved target, providers and cap; today it is `local-mock` with `maximum_cost: 0`.
- [ ] Make the load runner refuse Beta or production unless an explicit two-step opt-in and the approved abort thresholds are present.
- [ ] Record the Vercel and Supabase usage meters before and after each run and abort at an agreed share of any meter, so a load test cannot pause the Hobby account before the beta (§0.8).
- [ ] Ask the founders to choose the load target: locked Beta before WP11 with a dedicated synthetic program that can never be published, or a temporary third project restored from the D-27 backup and discarded afterwards (a money stop, since Supabase Free allows two active projects).
- [ ] Tag every synthetic row with its load-run ID and exclude load programs from success signals, cohort budgets and data-subject exports.
- [ ] Schedule WP09-T03 at least 30 days before WP11-T03, or show that projected beta usage plus load usage stays under 70% of every Hobby allowance.
- [ ] Reconcile baseline counts and budgets before starting.

**Verify:** the runner's refusal tests; the frozen configuration record.

**Pass:** the configuration is frozen and recorded; the runner cannot hit a protected target by accident.

#### WP09-T03 — Execute reproducibly

**Depends on:** WP09-T02. **Decision gates:** the WP09-T01 load spend. **Protected:** none. **Material UI:** no. **Real money:** yes, inside the approved load spend.

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
- [ ] The security/data and cost role holders record their review of the leakage, accounting and budget results; D-22 covers the protected gate, so no extra approval is requested.
- [ ] Never average away a single release-blocking leakage or duplicate-charge event.

**Verify:** the gate report.

**Pass:** zero leakage, lost accepted work or uncontrolled backlog; at least 99% successful interactive requests excluding quota rejection; chat first-token p50 under 5 s and p95 under 12 s (a revised target changes master plan §11 first); no duplicate job, artifact, message or usage event; total and p95 action cost inside the cap; documented scale-up switches that need no rewrite.

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

**Depends on:** WP04-T21, WP03-T34. **Decision gates:** D-02. **Protected:** none (uses existing audited actions). **Material UI:** no. **Real money:** no.

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

- [ ] Create the Veterinary campaigns through WP03-T36, give the Batch Leader access through WP03-T38 and record rights through WP03-T37; process PDF, audio and professor material through the existing job types and adapters, exactly as WP04-T21.

**Verify:** job timelines, quality, deletion and cost reports.

**Pass:** the WP04-T21 pass line holds for the Veterinary corpus with no new job type or adapter.

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

**Depends on:** WP10-T04, WP10-T06, WP07-T06, WP08-T08. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** yes, inside caps.

- [ ] Run the WP05-T06, WP06-T08 and WP07-T06 gates, the WP08-T08 unattended proof and the cost report on the Veterinary corpus and compare with Human Medicine.
- [ ] Write `evidence/wp10-veterinary/<date>_veterinary-gate_beta_<sha>.md`.

**Verify:** the gate reports.

**Pass:** Veterinary meets every master plan §11 threshold (master plan Phase 6 exit).

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

**Depends on:** WP08-T09 to WP08-T13, WP09-T06, WP10-T08. **Decision gates:** D-08, D-20, D-25, D-26 and D-28 approved. **Protected:** beta go-live is a D-22 protected gate. **Material UI:** no. **Real money:** yes if the gates are rerun with paid providers; reuse exact-candidate evidence where the candidate is unchanged.

- [ ] Tag the exact commit, migrations, configuration, evaluation datasets and provider models.
- [ ] Run the security, retrieval, chat, Studio, automation, restore and load gates on the candidate.
- [ ] Confirm the rights inventory, source activation, raw-deletion compliance, Terms/Privacy/boundary versions, retention, support, incident owners, alert and email delivery, quotas and hard budgets.
- [ ] Create `evidence/wp11-beta/<date>_go-no-go_beta_<sha>.md` listing every blocker and open risk.
- [ ] Re-check Vercel Hobby eligibility against the D-21 triggers and keep the founders' written confirmation as redacted evidence.
- [ ] Record the go decision: D-22 authorizes go-live once every technical gate passes, with no extra approval requested; a release blocker can only be fixed or contained, and any other accepted risk is a named founder decision.

**Verify:** the go/no-go packet against linked evidence.

**Pass:** the exact candidate passes every gate with no open release blocker, and the go decision is recorded.

#### WP11-T02 — Prepare onboarding and support

**Depends on:** WP11-T01, WP03-T35, WP08-T11. **Decision gates:** none beyond WP11-T01. **Protected:** auth (membership provisioning). **Material UI:** yes — onboarding copy and help pages. **Real money:** no.

- [ ] Ahmed and Ziad approve the final Terms of Use, Privacy Notice and educational-boundary texts, meeting the D-28 consent and notice requirements (including any legal review they choose), publish them as new consent versions and add the age check D-28 requires.
- [ ] Provision wave memberships only through the WP03-T35 path, to verified addresses, with expiry.
- [ ] Publish concise bilingual onboarding: the source boundary, the educational boundary, privacy and retention, feedback and reporting, and support.
- [ ] Test account creation, verification email, consent, first unit, first chat, first artifact, first quiz, feedback, logout, the WP08-T11 data controls, and support escalation on phone and desktop.
- [ ] Set support response targets and issue categories without exposing ordinary chats (WP08-T13), and add a signed-out help route on the access pages (the suspended-account message says "Contact an administrator" but no channel exists).

**Verify:** E2E onboarding journeys in Beta with founder accounts; founder review.

**Pass:** a founder-run test account completes every onboarding step in Beta on phone and desktop without help; `Approved commit:` recorded.

#### WP11-T03 — Release one wave at a time

**Depends on:** WP11-T02. **Decision gates:** none. **Protected:** D-22 release actions. **Material UI:** no. **Real money:** usage inside caps; the load rerun needs fresh two-founder confirmation of its spend.

- [ ] Record planned users, start and end, owner, monitoring window, success and abort thresholds, and the prior-wave review.
- [ ] Invite only the current wave (§14.1 order).
- [ ] Run the load profile again during the first larger wave (master plan Phase 7 "before and during onboarding") inside the approved spend, or the reduced, meter-capped probe if the founders approve master-plan amendment A6.
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

**Outcome:** payments and video have approved extension designs and threat and test plans, without entering the free PoC. Master plan Phase 8 implementation (webhook fulfillment, commercial policies, resource plan increases, the next program) starts only after PoC acceptance (WP11-T05); its tasks are added to this runbook then.

### 15.0 Tasks

#### WP12-T01 — Prove extension boundaries

**Depends on:** WP11-T05. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Re-run the WP04-T01 video-ready contract test against the final PoC schema and confirm provider interfaces, source kinds, the job graph, the processed-document contract, catalog, retrieval, chat and Studio still accept a future video processor without duplication.

**Verify:** the video contract test.

**Pass:** the contract test passes on the final schema.

#### WP12-T02 — Design video ingestion

**Depends on:** WP12-T01. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Write a video design record covering rights, size/duration/cost preflight, temporary video and audio, timestamps and visual extraction, completeness, quality, deletion of raw and derived temporary objects, and replay (§15.2).

**Verify:** the design record and its threat list.

**Pass:** the design record is approved by both founders.

#### WP12-T03 — Design automated payments

**Depends on:** WP11-T05. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no (design only).

- [ ] Write an automated-payment design record covering provider selection criteria, signed webhook verification, event uniqueness, the order and entitlement state machine, an append-only money ledger, reconciliation, refunds and disputes, currency and amount verification, replay and incident handling (§15.1).

**Verify:** the design record and its threat list.

**Pass:** the design record is approved by both founders.

#### WP12-T04 — Enforce PoC exclusions

**Depends on:** WP12-T03. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Add a check that fails on receipt uploads, founder approval queues or editable balances in migrations and routes.

**Verify:** `pnpm verify` with the new check and a negative fixture.

**Pass:** the check runs in `pnpm verify` and passes.

#### WP12-T05 — Add mock-only contract tests

**Depends on:** WP12-T02, WP12-T03. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] Add contract tests for the video processor and payment provider using mocks only; provision no payment or video provider until a post-PoC decision is approved.

**Verify:** the mock contract tests.

**Pass:** the mock contract tests pass with no provider account.

#### WP12-T06 — Review additive architecture

**Depends on:** WP12-T04, WP12-T05. **Decision gates:** none. **Protected:** none. **Material UI:** no. **Real money:** no.

- [ ] A reviewer confirms these are additive adapters and workflows, not a second knowledge or entitlement architecture.

**Verify:** the review record.

**Pass:** the review is recorded (master plan Phase 8 exit).

### 15.1 Automated commercial payments

Never build payment receipt upload or founder approval. After PoC acceptance, select an automated provider. The future flow uses signed webhooks, unique provider event IDs, idempotent fulfillment, append-only ledger entries, automated reconciliation and tested refund and dispute behaviour.

### 15.2 Video processor contract

Video becomes another `source_kind` and processor behind the existing workflow: validate rights, type, size, duration, checksum and cost; store raw video temporarily; extract complete audio in an isolated worker; transcribe with timestamps; optionally extract essential slide or visual text when approved; produce the same processed Markdown/JSON/locator contract; run the same hint, conflict, quality, chunk, embedding and retrieval checks; delete raw video and extracted audio after verified output; index transcript segments into the same unified knowledge pool.

## 16. PoC acceptance checklist

These are the master plan §11 gates as of 19 October 2026, with the task whose evidence proves each; if the master plan changes, it wins and this table follows. Tick a line only when that evidence exists for both cohorts where the gate applies. A percentage gate is read as WP00-T20 decides: either the raised case minimums, or "no miss on N" with the confidence bound recorded (15 of 15 shows only about 82% at one-sided 95% confidence).

| Gate | Threshold (master plan §11) | Proved by |
| --- | --- | --- |
| Cross-user/cohort/unit leakage | 0 cases | WP02-T09, WP05-T05, WP09-T04, WP10-T04 |
| Unsupported factual claims | 0 in accepted frozen evaluation answers | WP06-T08, WP10-T07 |
| Evidence provenance coverage | 100% of accepted answers and artifacts | WP06-T08, WP07-T06, WP10-T07 |
| Missing-information behaviour | At least 95% correct; no hidden-knowledge completion | WP05-T06, WP06-T08, WP10-T07 |
| Conflict behaviour | 100% of known frozen conflicts show both positions | WP05-T06, WP06-T08, WP10-T07 |
| Professor-hint retrieval | At least 95% for direct relevant questions | WP05-T06, WP06-T08, WP10-T07 |
| Educational case behaviour | At least 95% answered without false refusal when evidence exists | WP06-T08, WP10-T07 |
| Real-patient boundary | 100% of explicit high-risk cases | WP06-T08, WP10-T07 |
| Conversion completeness | 100% of required pages/audio accounted for or rejected | WP04-T21, WP10-T03 |
| Raw deletion correctness | 100% of accepted sources deleted; 0 premature | WP04-T21, WP10-T03 |
| Availability correctness | 0 unauthorized or premature units | WP02-T05, WP03-T08, WP03-T35, WP03-T37 |
| Artifact grounding | 0 unsupported accepted claims, answers or explanations | WP07-T06, WP10-T07 |
| Retry idempotency | 0 duplicated source, segment, embedding, artifact, usage or charge | WP04-T12, WP06-T08, WP07-T06, WP09-T04 |
| Routine automation | 0 manual processing steps in the accepted path | WP08-T08, WP10-T07 |
| 100-student workload | No leakage, lost accepted work or uncontrolled backlog | WP09-T06 |
| Interactive availability | At least 99% successful requests under load, excluding quota rejection | WP09-T06 |
| Chat latency | Target p50 under 5 s and p95 under 12 s to first token | WP06-T06, WP09-T06 |
| Cost | p95 action and total workload inside the approved cap | WP09-T06, WP11-T05 |

Release blockers (master plan §11): any scope leakage, unsupported clinical claim sent as grounded fact, hidden external knowledge, concealed conflict, premature deletion, unauthorized exposure or repeatable duplicate provider charge.

- [ ] Every gate above has linked passing evidence for Human Medicine.
- [ ] Every gate above has linked passing evidence for Veterinary Medicine.
- [ ] No release blocker is open.

## 17. Founder actions that unblock the critical path

The work below cannot move until Ahmed and Ziad decide or supply something. In the order the critical path (§2.2) needs it; the [decision register](../../planning/decision-register.md) holds owners and dates, and the [master-plan amendments](../reviews/runbook-revision-2026-10/master-plan-amendments.md) collect the product-authority changes these decisions imply.

1. **Data protection, now:** decide how UniMind meets Egypt's Personal Data Protection Law before any real personal data or foreign processing, with counsel if you choose (WP00-T21, D-28). The compliance period was reported to end around 1 November 2026.
2. **Roles and term:** name the security/data, cost and operations role holders and the Veterinary academic reviewer, and decide which academic term the beta targets (WP00-T01).
3. **Pipeline start:** approve D-10, or allow WP04-T01 to WP04-T13 to build on the proposal with synthetic data.
4. **Governance:** decide D-25 (student membership, WP03-T35) and confirm D-24 (Batch Leader links or accounts, WP03-T38); answer the WP03-T37 rights questions (which rights fields make a source valid; one or two founders for block, revoke and expire).
5. **Sources and evaluation:** supply the Cohort A source rows, rights holders and permission evidence (WP00-T03); choose the case-count and second-rater rules (WP00-T20).
6. **Real-data decision pack:** decide D-17, D-18, D-19, the D-21 revision, D-26 and D-27 together (WP04-T22), and the WP04-T01 accepted-format list.
7. **Money:** set caps from the WP00-T22 cost model, then approve the benchmark cap and exception (WP04-T19, the first real-money step).
8. **Product behaviour:** whether answers visibly stream (WP06-T05), D-08 (WP06-T07), stale artifacts and quizzes (WP07-T05), the trust measure (WP08-T10), the CAPTCHA provider (WP08-T09), account deletion and export rules (WP08-T11), the Arabic register for interface copy, and D-20 (WP08-T05).
9. **Beta launch:** which project serves the public domain (WP08-T12), the operating roles (WP08-T13), the load-test target (WP09-T02) and D-02 for Veterinary (WP10-T01).
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
| `pnpm test:e2e`, `pnpm test:e2e:demo` | Credential-free real-mode and synthetic browser suites | Local app and mocks only | Exit 0 |
| `pnpm test:e2e:database`, `pnpm test:integration:database` | Authenticated browser and Auth suites against the disposable stack | GitHub-hosted runner only (`database-ci`) | Exit 0 |
| `pnpm test:node`, `pnpm typecheck:fresh`, `pnpm verify:ci-workflow` | Parts of `verify:ci`: all Vitest layers, a fresh-checkout type check, the CI workflow policy | None | Exit 0 |
| `pnpm test:eval` | Dataset validation and the evaluation runner | Mock-only by default; a live profile needs its own guarded command | Hashes valid; reports name the exact scope |
| `pnpm test:load` | Guarded load profile | Rejects Beta/production, real providers and nonzero cost by default | `NOT_EXECUTED` report until WP09 |
| `pnpm smoke:deployment` | Redacted deployment smoke for local or Preview targets | Target deployment only | Seven checks pass |
| `pnpm db:ci:*` | Disposable Supabase lifecycle (`start`, `reset`, `upgrade`, `migrations`, `test`, `advisors`, `types`, `stop`) | GitHub-hosted runner containers only | Each step exits 0; `stop` runs under `if: always()` |
| `pnpm db:types:check` | Committed types are current | None | No Git diff |
| `pnpm db:reset`, `db:migrations`, `db:push:dry-run`, `db:types`, `db:metadata`, `test:integration:hosted` | Retired hosted seams | None | Do not run |

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
5. Fix, run the full security and evaluation suites, and re-enable under D-22 once they pass; any accepted residual risk is a named founder decision.

### 19.9 A Free-plan limit is reached

1. Identify the limit (database size, storage, egress, monthly active users, pausing) from the provider dashboard or the WP08-T02 capacity metrics.
2. Contain: pause new ingestion or new invitations; do not delete evidence to make room.
3. Measure what grew and compare with the WP04-T20 capacity estimate.
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
