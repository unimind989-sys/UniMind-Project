# UniMind domain context

This file is the shared language for product discussion, code, tests, decisions, and evidence. It defines concise names, not full requirements. The active requirements remain in `docs/plans/poc-master-plan.md`; execution details remain in `docs/runbooks/poc-execution-runbook.md`.

## Core language

**UniMind**  
The source-grounded educational platform. The PoC is its first production-shaped release, not a disposable demo.

**Catalog path**  
The configured hierarchy `education stage -> institution or education system -> program -> academic level -> term -> cohort or curriculum edition -> curriculum unit`.

**Cohort**  
The exact student batch and curriculum edition whose access and approved sources are managed together. A cohort is more specific than a program or academic level.

**Curriculum unit**  
The generic learning container a student opens. Render its configured label: normally **Module** for Human Medicine and **Subject** for other programs. Use `curriculum unit` in shared code and documentation.

**Collection campaign**  
An admin-created, time- and scope-bounded request for permitted material for an exact cohort and curriculum unit.

**Batch Leader**  
A campaign-scoped contributor who can submit requested material and view its status. A Batch Leader cannot publish units, unlock cohorts, assign roles, or access student learning data.

**Source asset**  
The logical study material, such as a book, PDF, recording, exam, or professor note. Format is metadata, not a knowledge mode.

**Source version**  
An immutable accepted version of a source asset with its checksum, scope, rights, processing state, and activation state. Controlled activation/status transitions do not rewrite its historical content.

**Raw object**  
The temporary private uploaded bytes. It exists only until a complete processed representation is durable, verified, and its deletion is independently confirmed or placed on an approved hold.

**Processed representation**  
Meaning-preserving normalized content—compact Markdown or equivalent plus structured metadata and locators—from which segments and embeddings can be reproduced.

**Segment**  
A retrieval-sized portion of one processed source version. It carries join-verifiable cohort, curriculum-unit, edition, locator, language, activation, and source metadata.

**Unified knowledge pool**  
All authorized active READY segments for one cohort and curriculum unit. Professor insight, file type, and source category remain metadata within this pool.

**Professor insight**  
A structured tag on a segment, such as `PROFESSOR_HINT`, `EXAM_EMPHASIS`, `EXCLUSION`, `CORRECTION`, or `LIKELY_QUESTION`. It is not a separate answer system.

**Derived availability**  
The security-aware result of authenticated membership, an unlocked cohort, a published unit, at least one active READY source version, valid rights, and a matching curriculum edition. It is computed, not edited.

**Strict RAG**  
The rule that factual student output comes only from retrieved passages in the authorized uploaded material. There is no web-search, general-reference, or hidden-knowledge completion branch.

**Evidence packet**  
The compact, scoped set of retrieved segments and metadata supplied to generation and later claim validation.

**Evidence class**  
The retrieval result: `full`, `partial`, `unavailable`, or `conflicting`. It determines the response contract before generation.

**Unavailable-information response**  
A direct statement that the uploaded material does not contain enough evidence, with no invented completion or offer to search outside the pool.

**Conflict response**  
A response that presents each position supported by the uploaded material, identifies contributing sources when available, and does not silently choose a side.

**Studio artifact**  
A durable, authorized, validated learning output—summary, study guide, practice questions, flashcards, MCQ quiz, or topic-focused revision pack—grounded in the same pool as chat.

**Durable job**  
A PostgreSQL-authoritative unit of background work with an explicit state, idempotency key, attempts, lease/heartbeat, retry classification, and recovery path.

**Governance action**  
A deliberate human decision such as approving rights, publishing a unit, unlocking a cohort, setting a budget, or resolving an exceptional failure. It is distinct from routine automated processing.

**Shared founder authority**
The project authority held by Ahmed and Ziad. Either founder may supply an ordinary human authorization or review; a protected gate requires separate named confirmations from both.

**Shared service identity**
The intentionally shared provider account used by Ahmed and Ziad. It does not identify which founder acted; Ahmed's separate GitHub contributor account is the sole current personal-account exception.

**Human checkpoint**
A named confirmation from Ahmed or Ziad that authorizes an agent action or accepts its evidence. The same founder may authorize, operate, and review an ordinary task.

**Protected gate**
A gate for RLS, raw deletion, rights, budget kill switches, release or unlock, or beta go-live that requires separate named confirmations from both Ahmed and Ziad.

**Work package**  
A dependency-ordered delivery stage in the execution runbook, abbreviated `WP00` through `WP12`.

**Gate**  
A reproducible pass/fail review for a work package. Code or a working screen alone is not a gate result.

**Evidence bundle**  
The sanitized record of scope, commit, environment, commands, results, deviations, rollback, agent executor, and required human checkpoint that proves a gate outcome.

## Relationships

- A catalog path contains many curriculum units; a curriculum unit belongs to one cohort/curriculum edition.
- An admin creates collection campaigns and assigns Batch Leaders; a Batch Leader submits source material within that campaign only.
- A source asset has immutable source versions; each processed document, locator, segment, and embedding belongs to exactly one source version.
- Authorized active READY segments form the unified knowledge pool for a cohort and curriculum unit.
- Chat answers and Studio artifacts consume evidence packets and retain exact evidence links.
- Durable jobs automate ingestion, generation, retries, reconciliation, metering, and deletion; humans retain governance actions and exceptional review.
- A work package is complete only after its tasks, verification, evidence bundle, and required human checkpoint are complete; protected gates additionally require both founders' named confirmations.

## Ambiguities to avoid

- **Module / Subject:** UI labels for a curriculum unit, not separate domain models.
- **Cohort:** the exact batch/curriculum edition, not every student in a program and not an analytics-only grouping.
- **Source / file:** use `source asset` for the logical material, `source version` for an accepted immutable version, and `raw object` for temporary bytes.
- **Available / published / unlocked / READY:** separate predicates. `available` is only their derived authorized result.
- **Evidence:** use `segment evidence` for answer/artifact grounding and `evidence bundle` for delivery-gate proof.
- **Automatic:** routine success, retry, recovery, accounting, and alerting require no founder action; governance decisions may still be manual.
- **PoC:** the first production-shaped release with constrained capacity, not throwaway prototype code.

Update this file when a domain term becomes stable, changes meaning, or conflicts with implementation language. Put the reasoning and consequences of architectural choices in an ADR rather than expanding this glossary into a design document.
