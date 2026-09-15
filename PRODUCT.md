# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

The approved architecture is a strict TypeScript repository using Next.js App Router on Node.js, Supabase Auth, PostgreSQL, explicit grants, and row-level security. Provider, queue, storage, and model integrations remain behind adapters and use deterministic mocks until their decision and budget gates pass.

## Users

The primary users are authenticated students who open an authorized curriculum unit to study from its approved material. Admins govern the catalog, publication, cohort access, source state, quality, usage, and cost. Restricted Batch Leaders submit permitted material only within assigned campaigns.

## Product Purpose

UniMind turns approved study material into a source-grounded learning environment. A student can ask questions, generate study artifacts, take quizzes, and inspect exact supporting evidence. Success means the complete learning loop works without cross-user or cross-cohort leakage, unsupported factual claims, manual normal-path processing, or uncontrolled spend.

## Positioning

One authorized knowledge pool serves each cohort and curriculum unit. Chat and Studio outputs use the same approved sources, refuse unsupported facts, expose contradictions, and link accepted factual output to exact evidence segments.

## Operating Context

The PoC begins with Human Medicine and Veterinary Medicine, while the same configurable catalog supports university and Thanaweya Amma paths. Students choose education level, institution/system, faculty/program/track, and academic year; term-based programs then require a semester. Future flexible-credit programs expose individually eligible Modules or Subjects from an active course plan instead of forcing a rigid semester list. The product supports English, Egyptian Arabic, and mixed-language study, including RTL and LTR behavior, while preserving technical terminology. Development and verification use synthetic fixtures and zero-cost mocks by default.

## Capabilities and Constraints

- Availability is derived from membership, cohort release, unit publication, active ready sources, valid rights, and matching curriculum edition.
- PostgreSQL is authoritative for durable jobs, reservations, budgets, release state, provenance, usage, and audit.
- Long-running work runs in idempotent durable workers, not browser lifetimes or short web requests.
- Strict RAG has no web-search or outside-knowledge fallback.
- Real cohorts, source rights, deletion policy, providers, budgets, retention, deployment, and beta release remain blocked until their named decisions and reviews pass.
- The current implementation phase is mock-only and may not use real private data, paid provider calls, or live release controls.

## Evidence on Hand

Product and architecture facts are defined in `docs/plans/poc-master-plan.md`, execution contracts in `docs/runbooks/poc-execution-runbook.md`, and shared domain language in `CONTEXT.md`. The repository has no approved visual identity, brand asset set, testimonials, customer claims, benchmark claims, pricing, or production deployment evidence; future surfaces must not fabricate them.

## Product Principles

- Ground every accepted factual output in authorized evidence.
- Make authorization, failure, contradiction, provenance, and cost visible and auditable.
- Keep core business rules independent from framework and provider adapters.
- Prefer deterministic, repeatable automation over undocumented manual steps.
- Expand through configuration and shared contracts instead of parallel product architectures.

## Accessibility & Inclusion

The responsive web application must support keyboard and screen-reader navigation, accessible focus and state handling, and English, Arabic, mixed-language, RTL, and LTR content. English technical terms must remain readable inside Arabic text.
