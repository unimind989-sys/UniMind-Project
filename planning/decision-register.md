# Decision register

This register is the working index for decision ownership and blocking effects. Decision status lives only in the [master plan decision log (section 15)](../docs/plans/poc-master-plan.md#15-decision-log); a linked decision record owns rationale and approval. `Resolution path` names the task allowed to advance the decision and is intentionally excluded from `Blocks`. Open decisions block only consumers that require the real choice; they do not block WP00-T08 from verifying that mocks and downstream blockers are explicit. `UNSCHEDULED — OWNER INPUT REQUIRED` is an explicit blocker, not a guessed deadline.

| ID | Decision | Owner | Due | Record | Resolution path | Blocks | Last reviewed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-01 | First Human Medicine cohort | Ahmed | N/A | [d-01](../docs/decisions/d-01-human-medicine-cohort.md) | N/A | NONE — downstream tasks must conform; D-02 and per-source rights remain independent | 2026-09-10 |
| D-02 | First Veterinary Medicine cohort | Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | [d-02](../docs/decisions/d-02-veterinary-medicine-cohort.md) | WP00-T02 | WP00-T03 (Veterinary rows); WP10-T01; WP10-T02; WP11-T01 | 2026-10-19 |
| D-03 | Pilot institutions | Ahmed + Ziad | N/A | [d-03](../docs/decisions/d-03-pilot-institutions.md) | N/A | NONE — downstream tasks must conform; D-02 and per-source rights remain independent | 2026-09-10 |
| D-04 | AI providers | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | [d-04](../docs/decisions/d-04-ai-providers.md) | WP04-T14 | WP04-T05 (real OCR); WP04-T06 (real transcription); WP04-T10 (real embeddings); WP04-T15; WP04-T19; WP06-T05 (real generation); WP07-T03 (real generation); WP11-T01 | 2026-10-19 |
| D-05 | Maximum PoC spend | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | [d-05](../docs/decisions/d-05-maximum-poc-spend.md) | WP00-T06 | WP04-T13 (nonzero caps); WP04-T14; WP04-T05 (paid); WP04-T06 (paid); WP04-T10 (paid); WP04-T20; WP06-T05 (paid); WP07-T03 (paid); WP09-T01; WP09-T03; WP11-T01 | 2026-10-19 |
| D-06 | Knowledge boundary | Ahmed + Ziad | N/A | Master plan section 15 | N/A | NONE — downstream tasks must conform | NOT RECORDED |
| D-07 | PoC payment model | Ahmed + Ziad | N/A | Master plan section 15 | N/A | NONE — downstream tasks must conform | NOT RECORDED |
| D-08 | Chat retention and misuse review | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | [d-08](../docs/decisions/d-08-chat-retention.md) | WP06-T07 | WP11-T01 | 2026-09-10 |
| D-09 | Raw lifecycle | Ahmed + Ziad | N/A | Master plan section 15 | N/A | NONE — WP00-T04 and D-19 must supply exact operating values | NOT RECORDED |
| D-10 | Processed format | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | [d-10](../docs/decisions/d-10-processed-format.md) | WP00-T04 | WP04-T01; WP04-T08; WP04-T12 | NOT RECORDED |
| D-11 | Batch Leader authority | Ahmed + Ziad | N/A | Master plan section 15 | N/A | NONE — downstream tasks must conform | NOT RECORDED |
| D-12 | Catalog abstraction | Ahmed + Ziad | N/A | Master plan section 15 | N/A | NONE — downstream tasks must conform | NOT RECORDED |
| D-13 | PoC capacity | Ahmed + Ziad | N/A | Master plan section 15 | N/A | NONE — WP00-T07 supplies the reproducible workload | NOT RECORDED |
| D-14 | Citations | Ahmed + Ziad | N/A | Master plan section 15 | N/A | NONE — downstream tasks must conform | NOT RECORDED |
| D-15 | Automation | Ahmed + Ziad | N/A | Master plan section 15 | N/A | NONE — downstream tasks must conform | NOT RECORDED |
| D-16 | Video | Ahmed + Ziad | N/A | Master plan section 15 | N/A | NONE — deferred until WP12 | NOT RECORDED |
| D-17 | Queue transport and worker host | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | [d-17](../docs/decisions/d-17-queue-worker-host.md) | WP04-T17 | WP04-T19; WP04-T20; WP08-T01; WP08-T03; WP08-T08; WP11-T01 | 2026-10-19 |
| D-18 | Raw and processed object storage provider | Security/data owner (unassigned) | UNSCHEDULED — OWNER INPUT REQUIRED | Record not yet written | WP04-T16 | WP04-T18; WP04-T19; WP04-T20; WP04-T09 (real deletion); WP11-T01 | 2026-10-19 |
| D-19 | Retention periods and deletion deadlines | Security/data owner (unassigned) | UNSCHEDULED — OWNER INPUT REQUIRED | [d-19](../docs/decisions/d-19-retention-deletion-periods.md) | WP00-T04 | WP04-T09 (real data); WP04-T11 (real takedown); WP04-T16; WP04-T19; WP06-T07 (real data); WP11-T01 | 2026-10-19 |
| D-20 | Notification and incident channels | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | Record not yet written | WP08-T05 | WP08-T07; WP08-T08; WP11-T01 | 2026-10-19 |
| D-21 | Zero-cost development, CI, Preview, and Beta infrastructure | Ahmed | N/A | [d-21](../docs/decisions/d-21-hosted-development-test-infrastructure.md); [ADR 0001](../docs/adr/0001-zero-cost-environment-topology.md) | N/A | WP01-T08 through WP01-T11 must implement and verify the revised topology | 2026-08-27 |
| D-22 | Founder authorization and autonomous finalization | Ahmed + Ziad — shared founder authority | N/A | [d-22](../docs/decisions/d-22-founder-authorization-and-shared-service-identity.md) | N/A | NONE — all future tasks and gates must conform | 2026-09-16 |
| D-23 | Program progression mode | Ahmed | N/A | Master plan section 15 | N/A | NONE — Human Medicine and Veterinary Medicine start as `TERM_BASED`; future credit-hour programs use configuration-driven `FLEXIBLE_CREDIT` selection | 2026-09-14 |
| D-24 | Batch Leader access by one-time upload link | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | [d-24](../docs/decisions/d-24-batch-leader-one-time-upload-links.md) | Ziad confirmation; WP03-T36 implements it | WP03-T36; WP04-T20 (real collection) — account-based Batch Leader screens are not extended meanwhile | 2026-10-19 |
| D-25 | Student cohort membership: how a student obtains, keeps and loses an active cohort membership | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | Record not yet written | WP03-T35 | WP11-T02; WP11-T03 | 2026-10-19 |
| D-26 | Transactional email delivery for Auth emails and Batch Leader links | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | Record not yet written | WP08-T05 | WP11-T01; WP11-T02 | 2026-10-19 |
