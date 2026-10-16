# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

A strict TypeScript Next.js App Router web application on Supabase Auth and PostgreSQL; provider, queue, storage, and model integrations stay behind adapters with deterministic mocks until their gates pass. The [master plan, section 8.1](docs/plans/poc-master-plan.md#81-application-architecture) owns the architecture.

## Users

The primary users are authenticated students who open an authorized curriculum unit to study from its approved material. Admins govern the catalog, publication, cohort access, source state, quality, usage, and cost. Restricted Batch Leaders submit permitted material only within assigned campaigns.

## Product Purpose

UniMind turns approved study material into a source-grounded learning environment. A student can ask questions, generate study artifacts, take quizzes, and inspect exact supporting evidence. Success means the complete learning loop works without cross-user or cross-cohort leakage, unsupported factual claims, manual normal-path processing, or uncontrolled spend.

## Positioning

One authorized knowledge pool serves each cohort and curriculum unit. Chat and Studio outputs use the same approved sources, refuse unsupported facts, expose contradictions, and link accepted factual output to exact evidence segments.

## Operating Context

The PoC begins with Human Medicine and Veterinary Medicine, while the same configurable catalog supports university and Thanaweya Amma paths. Students choose education level, institution/system, faculty/program/track, and academic year; term-based programs then require a semester. Future flexible-credit programs expose individually eligible Modules or Subjects from an active course plan instead of forcing a rigid semester list. The product supports English, Egyptian Arabic, and mixed-language study, including RTL and LTR behavior, while preserving technical terminology. Development and verification use synthetic fixtures and zero-cost mocks by default.

## Capabilities and Constraints

- Unit availability is derived, never a stored toggle; the [master plan, section 8.2](docs/plans/poc-master-plan.md#82-availability-model) owns its conditions.
- PostgreSQL owns durable state, and long-running work runs in durable workers rather than the browser or a short web request ([master plan, section 8.8](docs/plans/poc-master-plan.md#88-automation-and-reliability)).
- Strict RAG has no web-search or outside-knowledge fallback ([master plan, section 6.1](docs/plans/poc-master-plan.md#61-strict-rag-sourcing)).
- Real cohorts, source rights, deletion policy, providers, budgets, retention, deployment, and beta release remain blocked until their named decisions and reviews pass ([master plan, section 15](docs/plans/poc-master-plan.md#15-decision-log)).
- The current implementation phase is mock-only and may not use real private data, paid provider calls, or live release controls.

## Evidence on Hand

Product and architecture facts are defined in `docs/plans/poc-master-plan.md`, execution contracts in `docs/runbooks/poc-execution-runbook.md`, and shared domain language in `CONTEXT.md`. Current visual rules live in canonical `DESIGN.md`; dated design approvals live in `evidence/wp03-product-shell/design-approval-history.md`. The Open Folio brand kit's selected unchanged assets and guides live at `planning/design/unimind-logo/open-folio-kit/`. The exact slogan is two lines: “Study deeper” then “Go further.” Do not fabricate testimonials, commercial usage, benchmark claims or pricing. Deployment/task evidence remains in the owning runbook and evidence records.

## Product Principles

- Ground every accepted factual output in authorized evidence.
- Make authorization, failure, contradiction, provenance, and cost visible and auditable.
- Keep core business rules independent from framework and provider adapters.
- Prefer deterministic, repeatable automation over undocumented manual steps.
- Expand through configuration and shared contracts instead of parallel product architectures.

## Accessibility & Inclusion

The responsive web application must support keyboard and screen-reader navigation, accessible focus and state handling, and English, Arabic, mixed-language, RTL, and LTR content. English technical terms must remain readable inside Arabic text.
