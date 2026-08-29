# Raw data policy review

**Status:** BLOCKED — SECURITY/DATA OWNER INPUT REQUIRED

This packet contains the only human inputs needed to move D-10 and D-19 from proposal/open state. Agents own calculation, validation, configuration, tests, decision updates, and evidence after those inputs are supplied.

## Inputs required

| Input | Required form | Why it cannot be inferred |
| --- | --- | --- |
| Security/data owner and protected-gate confirmations | Name Ahmed or Ziad as owner and record both founders' confirmations | Hold, deletion, and release approval require accountable humans and the two-person rule. |
| Decision deadlines | One `YYYY-MM-DD` date for D-10 and D-19 | Agents must not invent governance deadlines. |
| Real raw absolute cap | Number, unit, and start event | Rights, operations, and failure-recovery trade-offs require owner approval. |
| Post-acceptance deletion deadline | Number, unit, and `processed_accepted_at` start | Defines the maximum uncertainty window for real deletion. |
| Temporary-derived deadline | Number, unit, and accepted/terminal start event | Applies to normalized audio, chunks, and OCR images. |
| Failed conversion and quarantine | Retention duration, allowed access, retry ceiling, terminal action | Determines whether bytes remain available after processing failure. |
| Processed, locator, and evidence retention | Duration and start/end events for each class | D-08/D-19 and rights must agree. |
| Hold authority | Who may place/remove, maximum duration, review interval, evidence requirement | A hold suspends deletion and must be independently governed. |
| Acceptance thresholds | Approve or replace each D-10 PDF/OCR/audio threshold with evidence | Real deletion depends on accepted processed completeness. |
| Provider absence check | Approved D-18 adapter semantics for delete plus independent absence verification | A successful delete response alone is insufficient. |
| Incident recipients | Approved D-20 channel/roles for deadline breach | Tests can assert an event; real alerts need recipients. |
| Rights compatibility | Reviewed real rows in `planning/source-rights-inventory.csv` | Every storage/processor/retention path must be granted. |

## Agent completion after input

1. Validate every duration has a numeric value, unit, and starting event and that the successful path enqueues deletion immediately.
2. Validate D-10 thresholds against representative rights-approved fixtures; keep raw deletion disabled until Ahmed and Ziad separately confirm the protected gate.
3. Create a production lifecycle profile that rejects missing values and cannot silently fall back to `SYNTHETIC_TEST`.
4. Update D-10/D-19 and the lifecycle policy, preserving the proposal history and exact approval table.
5. Run boundary, failure, replay, and release-profile tests and assemble sanitized commit-specific gate evidence.
