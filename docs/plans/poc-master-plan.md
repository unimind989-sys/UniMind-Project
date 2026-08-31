# UniMind: Master PoC Plan

**Working source of truth for Ahmed, Ziad, and Codex**

**Status:** Updated implementation plan

**Last updated:** 27 August 2026

## 1. Purpose and authority

This document defines the product, technical architecture, operational model, scope, quality gates, and delivery roadmap for the UniMind proof of concept (PoC). It is the active planning authority for the English version of the project.

The PoC is not a disposable demo. It must be a complete, automated, production-shaped release that can serve real students at low cost. Moving from the PoC to a wider release must be achieved by increasing infrastructure capacity, provider limits, and operational budgets, not by replacing the application or redesigning its core data model.

The separate execution runbook translates this plan into exact implementation tasks, dependencies, tests, and exit evidence.

## 2. Product vision

UniMind is a highly scalable educational platform that converts approved study materials into a source-grounded AI learning environment.

The first supported university programs are Human Medicine and Veterinary Medicine. The same architecture must later support Pharmacy, Engineering, other university faculties and programs, and High School education including Thanaweya Amma curricula and tracks.

Expansion must be data-driven. Adding a faculty, institution, academic level, term, cohort, or curriculum unit must not require a new application architecture or hard-coded screens.

### 2.1 Catalog hierarchy

The durable hierarchy is:

`Education stage -> Institution or education system -> Program -> Academic level -> Term -> Cohort or curriculum edition -> Curriculum unit`

- **Education stage:** initially `UNIVERSITY`; later `HIGH_SCHOOL` and other stages.
- **Institution or education system:** a university such as Zagazig University, or a future school/exam system.
- **Program:** a university faculty or a future school track/stream.
- **Academic level:** 1st Year, 2nd Year, 3rd Year, or another configured level.
- **Term:** First Semester, Second Semester, or another configured academic period.
- **Cohort or curriculum edition:** the exact batch and curriculum version whose sources and access are managed together.
- **Curriculum unit:** the learning container a student opens. Human Medicine normally displays it as a `Module`; other faculties normally display it as a `Subject`.

The interface must read the singular and plural curriculum-unit labels from program configuration. Shared screens must never hard-code `Module` or `Subject`.

### 2.2 Core student promise

When a student opens an available Module or Subject, UniMind provides:

- A dedicated chat that answers only from that unit's approved uploaded material.
- Transparent refusal to invent an answer when the material is insufficient.
- Explicit presentation of contradictory source statements.
- Access to professor voice-note insights and exam hints when those files are part of the approved material pool.
- A Studio for generating source-grounded summaries, practice questions, study guides, flashcards, and quizzes.
- English, Egyptian Arabic, and natural mixed-language responses while preserving technical terminology.

## 3. PoC objectives and non-negotiable philosophy

### 3.1 Lowest practical cost with useful performance

The PoC must run on the smallest practical infrastructure and provider plans while maintaining a usable experience. Cost efficiency is an architecture requirement, not a later optimization.

The system must:

- Avoid paid AI calls during ordinary frontend and database development by using fixtures and mocks.
- Cache safe reusable results, embeddings, and generated artifacts where correctness and permissions allow.
- Batch embedding and content-processing work.
- Enforce per-user and system-wide quotas, concurrency controls, input limits, and output limits.
- Record usage and calculated cost for every generation, embedding, transcription, and conversion action.
- Degrade predictably when a provider is slow or unavailable instead of losing jobs or corrupting state.
- Pass the defined 100-student workload on the selected minimum-cost deployment before the PoC is accepted.

### 3.2 Production-shaped, non-throwaway implementation

The PoC codebase is the first production version. It must use:

- Versioned database migrations.
- Strict authorization and Row Level Security.
- Durable, idempotent background jobs.
- Provider adapters so vendors can be changed without rewriting product logic.
- Environment separation for deterministic mock workstation development, ephemeral database/Auth CI, persistent synthetic Preview, and locked Beta production.
- Automated tests, deployment checks, telemetry, backups, and incident controls.
- Stateless web instances and horizontally scalable workers where possible.
- Configuration-driven catalog and terminology.

No critical operation may depend on a founder's laptop, a manually executed script, an unversioned database edit, or an undocumented sequence. Scaling after the PoC should primarily mean increasing compute, queue concurrency, storage, database capacity, model limits, and monitoring retention.

### 3.3 Fully automated normal operation

The normal path from accepted upload to student-ready knowledge must require zero manual intervention:

1. A Batch Leader submits a permitted source to an assigned campaign.
2. The system validates, stores temporarily, extracts or transcribes, verifies, normalizes, chunks, embeds, and indexes it.
3. The system deletes raw audio and raw document files after the verified processed representation is durable.
4. The system marks the source ready or isolates it with a machine-readable failure reason.
5. Published and unlocked content becomes available according to admin policy.
6. Retries, timeout recovery, stale-job recovery, usage accounting, cost limits, and routine notifications run automatically.

Ahmed and Ziad retain explicit governance controls: they create campaigns, configure the catalog, publish or hide curriculum units, unlock or lock cohorts, manage rights, and intervene in exceptional failures. These deliberate governance decisions are not routine processing steps and do not weaken the zero-manual-operation requirement.

UniMind uses shared founder authority and shared service identities. Coding agents are the implementation executors. Either Ahmed or Ziad may authorize, perform the necessary signed-in actions for, inspect, and approve an ordinary agent-executed task; this is one named human checkpoint and does not require a different reviewer. All project reviewer roles are filled by Ahmed or Ziad, with the applicable academic, security/data, cost, or operations role named when required. The founders intentionally share GitHub, Supabase, Google, and future service accounts, with Ahmed's separate GitHub contributor account as the current exception, so provider account identity is not proof of which founder acted. RLS, raw deletion, rights, budget kill switches, release/unlock, and beta go-live remain protected gates and require separate named confirmations from both Ahmed and Ziad.

The PoC will be a free, controlled beta. Manual receipt verification and manual payment approval are removed from the PoC. Commercial payments are deferred until an automated payment provider and automated reconciliation flow are selected.

### 3.4 Complete learning loop

The PoC must prove the complete path:

1. Admin targets a cohort and assigns a Batch Leader.
2. The Batch Leader supplies books, PDFs, recordings, exams, professor notes, and related permitted sources.
3. The platform automatically creates a verified, optimized knowledge pool.
4. Admin publishes the unit and unlocks the cohort.
5. Student opens the Module or Subject and asks questions in its dedicated chat.
6. The strict RAG system produces a grounded answer, an unavailable-information response, or an explicit conflict response.
7. Student uses the Studio to create study artifacts from the same pool.
8. Student completes a quiz, reviews explanations, and reports problems.
9. The platform measures quality, load, latency, reliability, storage reduction, and cost.

## 4. Pilot definition

### 4.1 Two-track PoC

| Pilot | Program | UI term | Build order | Architectural proof |
| --- | --- | --- | --- | --- |
| Cohort A | Human Medicine | Modules | First | Complete ingestion, professor-audio processing, strict RAG chat, Studio, and release workflow. |
| Cohort B | Veterinary Medicine | Subjects unless configured otherwise | Second | Program-configurable terminology, isolation, reuse of the same pipeline, and removal of Human-Medicine assumptions. |

Cohort A is stabilized first. Cohort B must pass the same pipeline, authorization, retrieval, safety, Studio, automation, and load gates before the PoC is complete.

### 4.2 Target source corpus

For each pilot cohort, target:

- 8-12 Modules or Subjects represented in the catalog.
- 15-25 PDFs, books, slide decks, or structured documents.
- 3-5 hours of lecture or professor voice-note audio.
- At least one permitted past-exam collection or question bank where available.
- Professor hints or exam-oriented statements where available and permitted.
- 100-150 tutor evaluation cases.
- 30-50 generated-artifact and MCQ evaluation cases.
- English, Arabic, and mixed-language cases.
- Missing-information, contradiction, prompt-injection, educational-medical-case, and real-patient boundary cases.

Across the PoC, the expected test corpus is approximately 30-50 document sources, 6-10 audio hours, 200-300 tutor cases, and 60-100 study-artifact cases.

### 4.3 Student capacity target

The PoC is designed for at least 100 authenticated students on minimal practical resources.

Validation must include:

- 100 provisioned student accounts.
- A realistic mix of logins, catalog reads, subject-chat requests, Studio jobs, quiz attempts, and feedback events.
- Burst testing for simultaneous chat submissions and artifact generation.
- Background ingestion occurring while students use the learning product.
- No cross-user, cross-cohort, or cross-unit data leakage.
- No duplicate charge, usage, job, artifact, or message caused by retries.
- Measured p50, p95, error rate, queue delay, database load, provider cost, and infrastructure cost.

## 5. Scope boundaries

### 5.1 Included in the PoC

- Responsive web application with English, Egyptian Arabic, mixed-language, RTL, and LTR behavior.
- Email/password accounts with verified email and role-based access.
- Education-stage-ready catalog and dynamic Module/Subject terminology.
- Cohort membership, cohort release, curriculum-unit publication, and derived availability.
- Admin dashboard for catalog, campaigns, source state, quality, publication, unlock, failures, cost, and usage.
- Restricted Batch Leader invitations and campaign-scoped submissions.
- PDF, book, scanned-slide, and audio ingestion.
- Native text extraction, OCR where necessary, full audio transcription, and professor-hint preservation.
- Durable Markdown or equivalent compact processed text plus structured metadata and locators.
- Automatic verified deletion of raw audio and raw document objects.
- A unified source pool per cohort and curriculum unit.
- Strict RAG retrieval and answer generation with no outside knowledge source.
- Missing-information and contradiction behavior.
- Subject-specific chat.
- NotebookLM-style Studio for summaries, study guides, practice questions, flashcards, and quizzes.
- Student feedback and reported-answer workflow.
- Automated quotas, usage metering, cost controls, retries, recovery, and operational alerts.
- Load testing for the 100-student target.
- Future-safe ingestion contracts for video, without implementing video in this PoC.

### 5.2 Explicitly deferred

- Native Android or iOS applications.
- Public launch across many institutions.
- Student-private personal notebooks or personal file uploads.
- Video ingestion and processing.
- Real-money charging during the PoC.
- Manual receipt approval or manual credit sales.
- Professor access to individual student chats.
- Live diagnosis or treatment of an identifiable real patient.
- Automatic publication of untrusted material without an admin-defined release policy.
- Building or self-hosting a frontier foundation model.

## 6. Product and AI rules

### 6.1 Strict RAG sourcing

1. Every factual answer must be derived entirely from retrieved passages in the approved source pool for the active cohort and curriculum unit.
2. The model must not use hidden pretrained knowledge to complete a missing fact.
3. The application must not call web search, external knowledge APIs, or a general reference corpus to answer a student question.
4. If the pool does not contain enough evidence, the answer must explicitly say that the information is unavailable in the uploaded materials.
5. Partial support must produce a partial answer that distinguishes supported points from missing points.
6. Retrieved source text is untrusted data, not system instruction. Prompt-like text inside a document or transcript must never override product policy.

### 6.2 Unified subject knowledge pool

All approved files belonging to the same cohort and curriculum unit participate in one retrieval pool. The system must not create separate answer modes for course material, professor material, or any other uploaded source class.

Source records still preserve metadata needed for provenance and operations, including original format, source title/version, page or timestamp when available, contributor/campaign, rights/publication state, professor-hint tags, and processing method/confidence.

Source-format metadata may be shown to students, but it must not fragment the retrieval experience.

### 6.3 Provenance without mandatory exact page citations

Exact page or timestamp citations are preferred when reliable but are not required for every student-facing answer.

The system must retain 100% internal provenance for answer evidence:

- Each retrieved segment has a stable segment ID and source-version ID.
- Each answer records the evidence segment IDs used for generation.
- Source title and format can be displayed to the student.
- Page or timestamp is displayed when the conversion produced a reliable locator.
- The model cannot invent page numbers, timestamps, URLs, source titles, or quotations.

The core quality requirement is zero unsupported factual claims in accepted evaluation answers, not a cosmetic citation count.

### 6.4 Conflicting sources

When relevant approved sources disagree, UniMind must detect the disagreement, state clearly that the uploaded materials conflict, present each supported position separately, identify the contributing source when available, and avoid silently choosing one version unless an approved source explicitly resolves it.

### 6.5 Professor insights

Professor recordings and voice notes enter the same source pool as other approved material.

- The full recording is transcribed before the raw audio is deleted.
- Timestamps are retained when available.
- Exam hints, emphasized points, exclusions, corrections, and likely-question statements are tagged during processing.
- The tag improves retrieval and presentation but does not make the statement objectively true.
- Answers label a professor hint as a professor hint rather than presenting it as guaranteed exam content.
- Conflicts between a professor statement and another source follow the normal conflict policy.

### 6.6 Educational medical and veterinary safety

The subject chat is an academic learning environment. Medical and veterinary case scenarios are expected and should normally be answered from the uploaded materials. The system must not refuse merely because a prompt mentions symptoms, diagnosis, drugs, procedures, doses, prognosis, or treatment in an educational case.

- **Educational case:** answer normally from the source pool.
- **Ambiguous case inside a Module/Subject:** prefer an educational interpretation and answer from the source pool.
- **Explicit real-patient request:** do not act as the treating professional; provide a concise boundary and, when appropriate, recommend qualified or emergency care.
- **Patient-identifying information:** warn the user not to share it and avoid retaining it beyond the documented policy.

Safety behavior must not introduce outside medical knowledge into a strict-RAG answer.

### 6.7 Access, privacy, and governance

- A student can retrieve only sources authorized for the selected cohort and curriculum unit.
- Student chats are not visible to founders by default.
- Reported or explicitly consented exchanges may be retained for a defined review period.
- Source replacements create immutable new processed versions.
- Raw deletion requires verified durable processed output and an append-only deletion event.
- Availability requires source ready, unit published, cohort unlocked, valid rights, and valid membership.
- Usage accounting is append-only and idempotent even while the PoC is free.

## 7. Required user experience

### 7.1 Student journey

1. Register, verify email, and accept terms, privacy rules, and the educational-use boundary.
2. Select education stage, institution, Faculty/program, Academic Year/level, and Term.
3. See only released cohorts and source-ready published Modules or Subjects.
4. Open one Module or Subject and arrive at that unit's dedicated chat and Studio.
5. Ask in English, Egyptian Arabic, or a mixed style.
6. Receive a streamed strict-RAG answer, unavailable-information response, or conflict response.
7. See source titles/formats and reliable locators when available.
8. Generate a summary, study guide, practice questions, flashcards, revision pack, or quiz from the same pool.
9. Review quiz answers and grounded explanations.
10. Report a poor answer, source problem, or conflict.
11. See usage allowance and capacity states without founder assistance.

### 7.2 Admin journey for Ahmed and Ziad

1. Configure the catalog and terminology.
2. Create a collection campaign for an exact cohort/unit scope.
3. Invite a Batch Leader with expiring, campaign-scoped permission.
4. Monitor each source from receipt through processing, deletion, indexing, readiness, or failure isolation.
5. Preview the exact student experience.
6. Publish/hide Modules or Subjects and unlock/lock cohorts.
7. Activate/deactivate source versions without deleting historical provenance.
8. Inspect automated quality reports, conflicts, failures, storage reduction, usage, latency, and cost.
9. Rerun, quarantine, or reject an exceptional source through audited actions.
10. Run frozen regressions before retrieval, prompt, provider, or processing changes go live.

Admins do not manually perform routine extraction, transcription, deletion, chunking, embedding, retry, or reconciliation.

### 7.3 Batch Leader journey

1. Receive an expiring invitation tied to one campaign and cohort.
2. View required source types, naming guidance, rights declarations, and status.
3. Submit files or approved storage references with required metadata.
4. Track received, processing, needs-information, accepted, rejected, and completed states.
5. Never receive publication, unlock, student-chat, provider, cost-control, or cross-cohort access.

## 8. Technical architecture

### 8.1 Application architecture

- **Web application:** Next.js with TypeScript.
- **Read paths:** authenticated Server Components or server-only data services.
- **Mutations:** Server Actions for normal mutations; Route Handlers for streaming chat, uploads, provider callbacks, and webhooks.
- **Runtime:** Node.js for provider SDKs, streaming, and processing interfaces.
- **Database/Auth:** Supabase Auth and PostgreSQL in every database-backed environment: disposable in CI and externally hosted in Preview/Beta.
- **Authorization:** Row Level Security on exposed tables, explicit grants, server-side checks, and narrowly scoped functions.
- **Storage:** provider-agnostic private object storage with temporary-raw and durable-processed namespaces.
- **Background processing:** durable queue and independently scalable workers.
- **Deployment:** mock-only workstation application development, a disposable full Supabase stack on standard GitHub-hosted CI runners, and two persistent Supabase Free projects for separate externally hosted Preview and locked Beta environments. Preview and Beta use separate Vercel Hobby project scopes while the reported provider confirmation and eligibility conditions remain applicable.
- **Observability:** structured logs, correlation IDs, job events, provider usage, health checks, error reporting, and cost dashboards.

Ahmed's and Ziad's computers are development workstations only, never PoC infrastructure targets. They may run editors, the Next.js development process, browser/test tools, and deterministic in-process mocks. No database, Auth service, object storage, queue, required worker, scheduler, monitoring service, notification service, optional orchestrator such as n8n, or shared preview/beta component may run from or depend on either founder computer. Disposable database/Auth CI runs on an external GitHub-hosted runner; every persistent shared/runtime component uses approved external infrastructure and remains operable when both computers are off.

A future Telegram bot may run on a founder computer only as noncritical development/test tooling. The PoC must not depend on it, it must not process real student data or private source material, and it cannot satisfy a preview, beta, operations, or release gate. An operational UniMind Telegram bot must use approved external hosting.

The web tier must remain stateless. Long extraction, transcription, embedding, and artifact generation must not rely on a short-lived browser or web request.

### 8.2 Availability model

A curriculum unit is visible only when:

`authenticated membership AND cohort unlocked AND unit published AND at least one active READY source version AND valid rights AND matching curriculum edition`

This result must be derived in a security-aware query or security-invoker view. Do not store a user-editable `is_available` Boolean that can drift from its source conditions.

### 8.3 Required database domains

| Domain | Required records and purpose |
| --- | --- |
| Identity | Profiles, roles, account state, consent/terms versions, retention preference. |
| Catalog | Education stages, institutions, programs, levels, terms, cohorts, curriculum units, terminology. |
| Access/release | Memberships, cohort releases, unit publication events, admin audit events. |
| Collection | Batch Leader assignments, campaigns, requested-material items, submissions, declarations. |
| Source lifecycle | Source assets, immutable versions, raw-object state, hashes, rights, processing/activation state. |
| Processing | Jobs, attempts, leases, dependencies, provider calls, quality reports, processed documents, locators, deletion events. |
| Knowledge pool | Segments, source metadata, professor-insight tags, embeddings, embedding versions, conflict annotations. |
| Tutor | Subject-scoped sessions, messages, answer evidence, insufficiency/conflict result, feedback. |
| Studio | Artifact requests/versions, evidence links, validation, summaries, guides, questions, flashcards, quizzes. |
| Operations | Allowance ledger, reservations, usage/cost events, rate limits, flags, incidents, audit. |

### 8.4 Key schema rules

- `programs` stores program type, default unit type, and localized singular/plural labels.
- `curriculum_units` stores type, optional parent, cohort, order, and publication state.
- `source_versions` are immutable after acceptance except for controlled activation and status transitions.
- Every processed document, locator, segment, and embedding belongs to exactly one source version.
- Every segment carries join-verifiable cohort, curriculum-unit, and curriculum-edition scope.
- Source type is metadata, not a separate retrieval database.
- Professor hints are structured segment tags, not a separate answer system.
- Every answer and Studio artifact links to the exact evidence segments used.
- No answer may claim `SUPPORTED` unless evidence links exist and validation passes.
- Jobs use unique idempotency keys and explicit state transitions.
- Usage reservations and settlements are transactions, not editable counters.
- Raw deletion is append-only audited and verified against storage.
- Service-role credentials are server/worker secrets and never reach the browser.

### 8.5 Content processing pipeline

1. Validate campaign, assignment, authority, rights, type, size, checksum, and duplicate status.
2. Create source/version and durable processing workflow in one controlled operation.
3. Store raw data privately and temporarily with a deletion deadline.
4. Scan and inspect the file.
5. Extract page-aware native text from text PDFs/books.
6. Run OCR only on scanned or low-text pages.
7. Transcribe complete audio with timestamps, language, terminology support, and confidence.
8. Normalize to compact Markdown or equivalent plus structured JSON metadata/locators.
9. Detect headings, tables, formulas, diagrams, professor hints, corrections, exclusions, and exam emphasis.
10. Verify coverage, readability, checksums, locator integrity, and representative terminology.
11. Persist processed output and quality report.
12. Delete the raw object automatically, verify absence, and append the deletion event.
13. Chunk by structure and semantic boundaries.
14. Generate embeddings in batches using versioned configuration.
15. Index all segments into the unit's unified pool.
16. Run duplicate, leakage, empty-segment, prompt-injection, and retrieval smoke tests.
17. Mark the source `READY`, or isolate it as `FAILED`/`NEEDS_REVIEW` with diagnostics and retry data.

A raw file must not be deleted before verified processed output exists. A failed deletion retries automatically and remains visible as a storage-policy violation.

### 8.6 Subject-chat RAG pipeline

1. Authenticate the student and validate membership, release, publication, source readiness, rights, and quota.
2. Bind the request server-side to one cohort and Module/Subject.
3. Classify educational context, explicit real-patient risk, language, and request size.
4. Normalize the query while retaining the visible wording.
5. Run full-text and vector retrieval concurrently inside the unified subject pool.
6. Filter before ranking by cohort, unit, edition, active source version, publication, and permission.
7. Merge, deduplicate, rerank, and diversify results.
8. Classify evidence as full, partial, unavailable, or conflicting.
9. For unavailable evidence, return the unavailable-information contract without hidden-knowledge generation.
10. For conflict, construct a packet containing every supported position.
11. Otherwise create a compact evidence packet with stable segment IDs and source metadata.
12. Generate and stream under strict-RAG and safety policy.
13. Post-validate factual claims, evidence use, scope, conflict handling, and invented source/locator text.
14. If validation fails, return a grounded fallback or unavailable response, never the invalid draft.
15. Store according to retention rules, link retained output to evidence, settle usage, and release unused reservation.

There is no web-search branch in this pipeline.

### 8.7 Studio architecture

The Studio is attached to the selected Module/Subject and uses exactly the same authorized unified source pool and strict evidence rules as chat.

PoC artifact types are structured summary, study guide, practice questions, flashcards, MCQ quiz, and topic-focused revision pack.

Every request stores cohort/unit scope, source-version scope, artifact type, language, depth, topic/size parameters, policy/model version, evidence links, validation result, failure reason, and a safe reuse key. Artifacts must expose missing areas and conflicts. Unsupported questions, answers, explanations, or summary claims are rejected or regenerated before display.

### 8.8 Automation and reliability

- PostgreSQL durable job records are workflow authority.
- Queue delivery may occur more than once; each step is idempotent.
- Workers use leases/heartbeats so abandoned work is recovered.
- Retries use bounded exponential backoff and classify retryable versus terminal failures.
- Failed jobs are inspectable and replayable after correction.
- Scheduled reconciliation finds stale jobs, missing embeddings, failed deletions, unsettled reservations, and inconsistent READY states.
- Provider rate limits create controlled queue delay, not data loss.
- Circuit breakers and flags can disable a provider or expensive artifact type.
- No automation engine stores unique business state absent from PostgreSQL.
- If n8n is used, it must be always-on/hosted, perform orchestration/notification only, call workers by job ID, and never depend on a founder computer.

### 8.9 Scale path after PoC

Scaling must use capacity/configuration changes: increase stateless web instances, worker concurrency, PostgreSQL compute/connections/storage, provider quotas, queue/storage capacity, caching, and telemetry retention. A larger compatible vector service may be added behind the retrieval adapter only if measurements justify it. New programs enter through catalog data and the existing pipeline.

## 9. Workstreams and deliverables

| Workstream | PoC deliverables |
| --- | --- |
| Product/UX | Filters, dynamic terminology, subject workspace, chat, Studio, quiz/review, feedback, bilingual UI. |
| Identity/security | Auth, roles, membership, consent, RLS, grants, authorization tests, audit. |
| Catalog/release | Generic hierarchy, cohorts, units, publication, unlock, derived availability, admin preview. |
| Collection | Campaigns, Batch Leader assignments, requested-material lists, submissions, status communication. |
| Processing/storage | PDF/OCR/audio conversion, compact outputs, professor hints, jobs, raw deletion, storage reports. |
| Retrieval/RAG | Unified pool, hybrid retrieval, strict sourcing, insufficiency, conflicts, internal provenance. |
| Studio/quiz | Summaries, guides, questions, flashcards, MCQs, validation, quiz state. |
| Automation | Queue, workers, retries, leases, reconciliation, notifications, failure isolation. |
| Cost/performance | Quotas, batching, caches, usage ledger, benchmarks, 100-student load test. |
| Quality/safety | Gold datasets, grounding, prompt injection, educational-case policy, reports. |
| Operations | CI/CD, migrations, monitoring, alerts, backups, restore test, incident runbooks. |

## 10. Delivery roadmap

### Phase 0: Pilot and operating constraints

**Estimated effort:** 1 week

- Select exact Human Medicine and Veterinary Medicine cohorts and unit lists.
- Select Batch Leaders and inventory sources, rights, sizes, audio, and professor hints.
- Approve temporary-raw retention/deletion, free-beta quotas, total/weekly spend, and 100-student workload.
- Create frozen tutor, conflict, insufficiency, medical-case, and Studio evaluation templates.
- Approve non-throwaway architecture constraints.

Exit gate: cohorts, source paths, rights, deletion rules, cost caps, evaluation ownership, and load profile are documented.

### Phase 1: Production-shaped foundation

**Estimated effort:** 2 weeks

- Next.js/TypeScript repository with lint, types, tests, CI, and environment validation.
- Deterministic mock workstation development, disposable full-stack Supabase CI, and two persistent Supabase Free projects for separate synthetic Preview and locked Beta; workstation development requires no local infrastructure service.
- Versioned Supabase migrations, backups, auth, roles, audit, catalog, memberships, release/publication, and RLS.
- Bilingual shell, subject workspace, admin shell, and Batch Leader shell.
- Mock providers and structured telemetry.

Exit gate: every role sees only authorized data; deployments/migrations repeat cleanly; no critical path depends on local state.

### Phase 2: Automated intake and optimized source lifecycle

**Estimated effort:** 3 weeks

- Campaign submission and source-version model.
- Private temporary upload and durable processed storage.
- Durable jobs, leases, retries, and reconciliation.
- PDF extraction, selective OCR, full audio transcription, normalization, locators, and professor-hint tags.
- Automated quality, verified raw deletion, chunking, embedding, unified indexing, and readiness.

Exit gate: representative PDFs/audio reach READY automatically; processed text is complete; raw objects are deleted; retries duplicate nothing and repeat no charge.

### Phase 3: Strict subject-chat RAG

**Estimated effort:** 3 weeks

- Subject-specific streamed chat and secure hybrid retrieval.
- Full, partial, unavailable, and conflict evidence contracts.
- Strict generation and post-validation.
- Evidence links with optional reliable locators.
- Professor-hint behavior, educational case behavior, and real-patient boundary.
- Automated quotas, rate limiting, settlement, refunds, and regression runner.

Exit gate: accepted answers contain zero unsupported material claims, unavailable answers are not invented, conflicts show both positions, hints are retrievable, and leakage is zero.

### Phase 4: NotebookLM-style Studio and quiz loop

**Estimated effort:** 2-3 weeks

- Dedicated Studio inside each Module/Subject.
- Summary, study guide, practice questions, flashcards, revision pack, and MCQs.
- Shared strict-grounding/evidence contract and safe artifact reuse.
- MCQ validation, explanations, timed/untimed quiz, review, scoring, and weak-topic signals.
- Reporting and invalidation after source changes.

Exit gate: a student completes chat, each artifact type, quiz, and grounded review without leaving the unit.

### Phase 5: Admin operations and zero-manual automation

**Estimated effort:** 2 weeks

- Complete catalog, campaign, source, release, quality, cost, storage, job, and incident dashboards.
- Automatic stale-job, deletion, embedding, usage, and READY-state reconciliation.
- Always-on worker/scheduler deployment, notifications, circuit breakers, flags, backup/restore, and incident runbooks.
- Proof that routine operation needs no founder scripts, founder machine, or manual database repair.

Exit gate: normal submission-to-student processing and recovery are automatic; admins make governance decisions or address surfaced exceptions only.

### Phase 6: Veterinary Medicine validation

**Estimated effort:** 2 weeks

- Process the veterinary corpus through the same workflow.
- Validate Subject terminology, strict RAG, conflicts, missing evidence, case scenarios, and Studio.
- Remove remaining Human-Medicine-specific assumptions.

Exit gate: both cohorts pass identical security, processing, RAG, Studio, safety, and automation gates.

### Phase 7: 100-student private beta and load validation

**Estimated effort:** 3-4 weeks

- Provision and onboard up to 100 verified students in waves.
- Run the defined load before and during onboarding.
- Measure activation, return, chat/Studio/quiz usage, errors, latency, queue delay, and cost.
- Run weekly regression/feedback cycles and tune quota, cache, batches, workers, indexes, and connections.
- Test provider slowdown/failure without losing accepted work.

Exit gate: the target load works on the approved minimum-cost configuration while meeting quality, isolation, reliability, and cost gates.

### Phase 8: Post-PoC scale and automated commercial readiness

This phase begins only after PoC acceptance.

- Select an automated payment provider and implement webhook fulfillment/reconciliation.
- Publish commercial terms, privacy, refund, expiry, and content policies.
- Increase resource plans based on measured bottlenecks.
- Add the next program through catalog configuration and the existing pipeline.
- Prepare video ingestion behind the existing processing contract.

Exit gate: commercial operation and catalog expansion require configuration/capacity changes, not a core rewrite.

## 11. Quality, automation, and load gates

| Metric | PoC acceptance gate | Required evidence |
| --- | --- | --- |
| Cross-user/cohort/unit leakage | 0 cases | RLS, authorization, retrieval, and E2E tests. |
| Unsupported factual claims | 0 in accepted frozen evaluation answers | Claim-to-evidence review and validator results. |
| Evidence provenance coverage | 100% of accepted factual answers/artifacts linked to evidence | Evidence join records. |
| Missing-information behavior | At least 95% correct; no hidden-knowledge completion | Negative/partial cases. |
| Conflict behavior | 100% of known frozen conflicts disclose both supported positions | Conflict suite. |
| Professor-hint retrieval | At least 95% for direct relevant questions | Tagged audio cases. |
| Educational case behavior | At least 95% answered without false refusal when evidence exists | Safety suite. |
| Real-patient boundary | 100% of explicit high-risk cases apply policy | Safety suite. |
| Conversion completeness | 100% required pages/audio accounted for or rejected | Quality reports. |
| Raw deletion correctness | 100% accepted sources deleted; 0 premature deletions | Storage checks/events. |
| Availability correctness | 0 unauthorized or premature units | Availability/E2E tests. |
| Artifact grounding | 0 unsupported accepted claims/answers/explanations in frozen suite | Artifact validation. |
| Retry idempotency | 0 duplicated source, segment, embedding, artifact, usage, or charge | Replay/fault tests. |
| Routine automation | 0 manual processing steps in accepted path | Job event timeline. |
| 100-student workload | No leakage, lost accepted work, or uncontrolled backlog | Load/queue/database report. |
| Interactive availability | At least 99% successful requests during controlled load, excluding quota rejection | Load report. |
| Chat latency | Target p50 under 5s and p95 under 12s to first token | Telemetry. |
| Cost | p95 action and total workload inside approved cap | Usage/cost ledger. |

Any scope leakage, unsupported clinical claim sent as grounded fact, hidden external knowledge, concealed conflict, premature deletion, unauthorized exposure, or repeatable duplicate provider charge is a release blocker.

## 12. Success signals

| Signal | Initial target |
| --- | --- |
| Capacity proof | 100 provisioned students and successful defined workload. |
| Activation | At least 60% complete a useful chat, Studio artifact, or quiz. |
| 7-day return | At least 25% provisionally. |
| Repeated value | At least 20% complete 3+ meaningful sessions in one week. |
| Source trust | At least 80% of sampled active users rate grounded answers useful/trustworthy. |
| Automation | At least 95% of valid sources reach READY without exceptional intervention; others are isolated/explained automatically. |
| Cost predictability | Weekly cost stays inside the cap and is attributable by action/source/cohort. |
| Scale readiness | No core rewrite is required for the next program or resource tier. |

The PoC does not require paid-order validation. Willingness to pay may be researched through interviews without a manual payment system.

## 13. Cost-control policy

- Ahmed and Ziad approve hard total and weekly caps before live providers.
- Use mocks and frozen fixtures unless a real call is necessary for evaluation.
- Each provider/action has a kill switch, concurrency limit, timeout, retry limit, and budget.
- Limit evidence size, output tokens, artifact count, and user daily usage.
- Key embeddings by content hash/version and avoid unnecessary regeneration.
- Reuse artifacts only when authorization, source versions, policy, language, and parameters match.
- Preflight audio duration/format and maximum job cost.
- Record provider/model/version, units, latency, attempts, result, and cost for every action.
- Alert at 50%, 75%, and 90%; block new optional paid work safely at 100%.
- Benchmark with representative project data before provider commitment.
- Never weaken isolation, grounding, completeness, or deletion verification to reduce cost.

## 14. Future video-processing roadmap

Video is excluded from the PoC implementation, but the content contract must support it later.

1. Accept permitted video through the campaign/source-version system.
2. Validate type, size, duration, rights, checksum, and estimated cost.
3. Extract complete audio in an isolated worker.
4. Transcribe it with timestamps and terminology handling.
5. Optionally capture necessary visual text/slide changes if later required.
6. Normalize into the same Markdown/JSON representation.
7. Apply the same quality, hint, conflict, chunking, embedding, and indexing rules.
8. Delete raw video and temporary audio after verified processing.
9. Add the transcript to the same unified curriculum-unit pool.

Video adds a processor behind the existing pipeline; it must not create a separate knowledge system.

## 15. Decision log

| ID | Decision | Required/default direction | Owner | Status |
| --- | --- | --- | --- | --- |
| D-01 | First Human Medicine cohort | Select by source completeness, rights, reviewers, demand, and Batch Leader readiness | Ahmed | Open |
| D-02 | First Veterinary Medicine cohort | Use the same scoring model | Ziad | Open |
| D-03 | Pilot institutions | Start where rights, complete sources, and testers are strongest | Ahmed + Ziad | Open |
| D-04 | AI providers | Select using project quality, latency, and cost benchmarks | Ahmed + Ziad | Open |
| D-05 | Maximum PoC spend | Hard total and weekly limits before live processing | Ahmed + Ziad | Open |
| D-06 | Knowledge boundary | Approved uploaded material only; no outside answer source | Ahmed + Ziad | Approved direction |
| D-07 | PoC payment model | Free controlled beta; no manual payment operations | Ahmed + Ziad | Approved direction |
| D-08 | Chat retention | Student-controlled content with minimal operational metadata | Ahmed + Ziad | Proposed |
| D-09 | Raw lifecycle | Temporary only; automatic verified deletion after complete output | Ahmed + Ziad | Approved direction |
| D-10 | Processed format | Normalized Markdown/equivalent plus structured JSON metadata/locators | Ahmed + Ziad | Proposed |
| D-11 | Batch Leader authority | Campaign-scoped submission/status only | Ahmed + Ziad | Approved direction |
| D-12 | Catalog abstraction | Stage -> institution/system -> program -> level -> term -> cohort -> unit | Ahmed + Ziad | Approved direction |
| D-13 | PoC capacity | At least 100 students on minimum practical resources | Ahmed + Ziad | Approved direction |
| D-14 | Citations | Internal provenance mandatory; exact locator optional when reliable | Ahmed + Ziad | Approved direction |
| D-15 | Automation | Founder computers run development processes only; every database-backed/shared runtime is externally hosted and durable; a PC-hosted Telegram bot is noncritical test tooling only | Ahmed + Ziad | Approved direction |
| D-16 | Video | Deferred processor using existing ingestion/pool contracts | Ahmed + Ziad | Approved direction |
| D-17 | Queue transport and worker host | Database job table plus in-process test dispatcher until selected; founder computers are excluded as hosts | Ahmed + Ziad | Open |
| D-18 | Raw and processed object storage provider | Filesystem/in-memory test adapter with synthetic data until selected | Security/data owner (unassigned) | Open |
| D-19 | Retention periods and deletion deadlines | Short synthetic-test values until exact periods are approved | Security/data owner (unassigned) | Open |
| D-20 | Notification and incident channels | In-process deterministic test sink until operational channels are approved | Ahmed + Ziad | Open |
| D-21 | Zero-cost development, CI, Preview, and Beta infrastructure | Workstation mocks, ephemeral Supabase CI, and two persistent Supabase Free projects for separate Preview/Beta; conditional Vercel Hobby use (revised 2026-08-27) | Ahmed | Approved direction |
| D-22 | Founder authorization and shared service identity | Shared service accounts; either founder may satisfy an ordinary human checkpoint; protected gates still require both named confirmations | Ahmed + Ziad — shared founder authority | Approved direction |

## 16. Immediate actions

1. Choose candidate cohorts with institution, program, level, term, edition, and unit labels.
2. Identify the Batch Leader for each cohort.
3. Build the source inventory, including professor recordings and hints.
4. Confirm rights for temporary storage, provider processing, processed retention, student use, deletion, and future commercial use.
5. Approve the Markdown/JSON contract and deletion evidence.
6. Define the exact 100-student load scenario and minimum-cost hosting envelope.
7. Approve provider budgets and kill-switch ownership.
8. Select native PDFs, scanned PDFs, mixed-language audio, and professor voice notes for benchmarks.
9. Create 100 Human Medicine tutor cases covering missing/partial evidence, conflicts, hints, academic cases, and real-patient boundaries.
10. Create Studio evaluation cases for every artifact type.
11. Create the repository and production-shaped hosted environments with mocked providers first.
12. Implement the execution runbook in dependency order.

## 17. Working rules

- After the reviewed WP01 foundation gate passes, begin eligible WP02 database work with synthetic/generic fixtures while open decisions retain their exact consumer blocks; protected rights, RLS, raw-deletion, budget, release, and live-provider gates still require their named confirmations.
- Update this file when direction, scope, architecture, quality, capacity, or operating policy changes.
- Do not complete a phase because its interface looks finished; exit evidence must exist.
- Record unresolved decisions instead of hiding assumptions in code.
- Do not accept a local-only shortcut that forces a production rewrite.
- The original Word blueprint remains reference material; this Markdown file is the active master plan.
