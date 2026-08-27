# Decision register

This register is the working index for decision ownership and blocking effects. The master-plan decision log owns status; a linked decision record owns rationale and approval. `Resolution path` names the task allowed to advance the decision and is intentionally excluded from `Blocks`. Open decisions block only consumers that require the real choice; they do not block WP00-T08 from verifying that mocks and downstream blockers are explicit. `UNSCHEDULED — OWNER INPUT REQUIRED` is an explicit blocker, not a guessed deadline.

| ID | Decision | Owner | Due | Status | Record | Resolution path | Blocks | Last reviewed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-01 | First Human Medicine cohort | Ahmed | UNSCHEDULED — OWNER INPUT REQUIRED | Open | `docs/decisions/d-01-human-medicine-cohort.md` (OPEN) | WP00-T02 | WP00-T03; WP00-T05; WP11-T01; WP11-T03 | NOT RECORDED |
| D-02 | First Veterinary Medicine cohort | Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | Open | `docs/decisions/d-02-veterinary-medicine-cohort.md` (OPEN) | WP00-T02 | WP00-T03; WP00-T05; WP10-T01; WP10-T02; WP11-T01 | NOT RECORDED |
| D-03 | Pilot institutions | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | Open | `docs/decisions/d-03-pilot-institutions.md` (OPEN) | WP00-T02 | WP00-T03; WP11-T01 | NOT RECORDED |
| D-04 | AI providers | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | Open | `docs/decisions/d-04-ai-providers.md` (OPEN) | WP09-T01 | WP04-T05 (real OCR); WP04-T06 (real transcription); WP04-T10 (real embeddings); WP06-T05 (real generation); WP07-T03 (real generation); WP11-T01 | NOT RECORDED |
| D-05 | Maximum PoC spend | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | Open | `docs/decisions/d-05-maximum-poc-spend.md` (OPEN) | WP00-T06 | WP04-T05 (paid); WP04-T06 (paid); WP04-T10 (paid); WP06-T05 (paid); WP07-T03 (paid); WP09-T01; WP09-T03; WP11-T01 | NOT RECORDED |
| D-06 | Knowledge boundary | Ahmed + Ziad | N/A — DIRECTION APPROVED | Approved direction | Master plan section 15 | N/A — approved | NONE — downstream tasks must conform | NOT RECORDED |
| D-07 | PoC payment model | Ahmed + Ziad | N/A — DIRECTION APPROVED | Approved direction | Master plan section 15 | N/A — approved | NONE — downstream tasks must conform | NOT RECORDED |
| D-08 | Chat retention | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | Proposed | `docs/decisions/d-08-chat-retention.md` (missing) | WP06-T07 | WP11-T01 | NOT RECORDED |
| D-09 | Raw lifecycle | Ahmed + Ziad | N/A — DIRECTION APPROVED | Approved direction | Master plan section 15 | N/A — approved | NONE — WP00-T04 and D-19 must supply exact operating values | NOT RECORDED |
| D-10 | Processed format | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | Proposed | `docs/decisions/d-10-processed-format.md` (PROPOSED) | WP00-T04 | WP04-T01; WP04-T08; WP04-T12 | NOT RECORDED |
| D-11 | Batch Leader authority | Ahmed + Ziad | N/A — DIRECTION APPROVED | Approved direction | Master plan section 15 | N/A — approved | NONE — downstream tasks must conform | NOT RECORDED |
| D-12 | Catalog abstraction | Ahmed + Ziad | N/A — DIRECTION APPROVED | Approved direction | Master plan section 15 | N/A — approved | NONE — downstream tasks must conform | NOT RECORDED |
| D-13 | PoC capacity | Ahmed + Ziad | N/A — DIRECTION APPROVED | Approved direction | Master plan section 15 | N/A — approved | NONE — WP00-T07 supplies the reproducible workload | NOT RECORDED |
| D-14 | Citations | Ahmed + Ziad | N/A — DIRECTION APPROVED | Approved direction | Master plan section 15 | N/A — approved | NONE — downstream tasks must conform | NOT RECORDED |
| D-15 | Automation | Ahmed + Ziad | N/A — DIRECTION APPROVED | Approved direction | Master plan section 15 | N/A — approved | NONE — downstream tasks must conform | NOT RECORDED |
| D-16 | Video | Ahmed + Ziad | N/A — DIRECTION APPROVED | Approved direction | Master plan section 15 | N/A — approved | NONE — deferred until WP12 | NOT RECORDED |
| D-17 | Queue transport and worker host | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | Open | `docs/decisions/d-17-queue-worker-host.md` (OPEN) | WP08-T01 | WP08-T03; WP08-T08; WP11-T01 | NOT RECORDED |
| D-18 | Raw and processed object storage provider | Security/data owner (unassigned) | UNSCHEDULED — OWNER INPUT REQUIRED | Open | `docs/decisions/d-18-object-storage-provider.md` (missing) | WP04-T03 | WP04-T08 (real storage); WP04-T09 (real deletion); WP04-T12; WP11-T01 | NOT RECORDED |
| D-19 | Retention periods and deletion deadlines | Security/data owner (unassigned) | UNSCHEDULED — OWNER INPUT REQUIRED | Open | `docs/decisions/d-19-retention-deletion-periods.md` (OPEN) | WP00-T04 | WP04-T09 (real data); WP06-T07 (real data); WP11-T01 | NOT RECORDED |
| D-20 | Notification and incident channels | Ahmed + Ziad | UNSCHEDULED — OWNER INPUT REQUIRED | Open | `docs/decisions/d-20-notification-incident-channels.md` (missing) | WP08-T05 | WP08-T07; WP08-T08; WP11-T01 | NOT RECORDED |
| D-21 | Hosted development and test infrastructure | Ahmed | N/A — APPROVED 2026-08-25 | Approved direction | `docs/decisions/d-21-hosted-development-test-infrastructure.md` (APPROVED) | N/A — approved | NONE — WP01-T04 and downstream tasks must conform | 2026-08-25 |
| D-22 | Founder authorization and shared service identity | Ahmed + Ziad — shared founder authority | N/A — APPROVED 2026-08-27 | Approved direction | `docs/decisions/d-22-founder-authorization-and-shared-service-identity.md` (APPROVED) | N/A — approved | NONE — all future tasks and gates must conform | 2026-08-27 |
