# Raw and processed data lifecycle policy

**Status:** DRAFT — SYNTHETIC TEST PROFILE ONLY

**Owner:** Security/data owner UNASSIGNED

**Approvers:** Ahmed + Ziad — protected raw-deletion gate; one founder must also be explicitly named as security/data owner

**Version/effective date:** NOT EFFECTIVE FOR REAL DATA

**Blocks:** WP04-T09 (real data); WP06-T07 (real data); WP11-T01

This draft makes synthetic implementation deterministic. It does not authorize real source upload, real provider processing, or production retention. D-09 in the master plan supplies the approved direction; D-10 and D-19 must be approved before the real-data profile exists.

## Scope and definitions

- **Raw object:** temporary private uploaded bytes for one source version, as defined in `CONTEXT.md`.
- **Temporary derived object:** normalized audio, audio chunks, OCR images, or other replayable processing bytes that are not the accepted processed representation.
- **Processed representation:** meaning-preserving normalized Markdown plus structured JSON metadata and locators from which segments and embeddings can be reproduced.
- **Locator:** a stable reference from processed content to a page, time range, or other exact source position.
- **Deletion deadline:** the latest timestamp by which absence must be independently verified; the system should delete earlier when eligible.
- **Verified deletion:** a delete attempt followed by an independent provider-adapter absence check and an append-only verification event.
- **Hold:** a recorded governance action that suspends deletion until an explicit expiry or removal review.
- **Quarantine:** an access-restricted processing state for suspected unsafe, corrupt, rights-blocked, or policy-violating material.
- **Takedown:** immediate retrieval deactivation followed by governed deletion or preservation according to rights, incident, and audit requirements.

## Data flow

```text
synthetic fixture
  -> private raw-object adapter
  -> durable worker + isolated temporary workspace
  -> deterministic extraction/transcription adapter
  -> processed-object adapter + PostgreSQL metadata/checksums
  -> segments/embeddings in the authorized cohort/unit pool
  -> raw and temporary-object deletion adapter + independent absence check
```

Real storage and AI providers remain absent from this flow until D-04, D-18, rights evidence, and budget gates approve them. Adapter names are logical seams, not provider approvals.

## Retention profiles

| Rule | `SYNTHETIC_TEST` | `REAL_DATA` |
| --- | --- | --- |
| Raw object absolute cap | `received_at + 24 hours` | BLOCKED — D-19 value required |
| Successful-processing deadline | `min(received_at + 24 hours, processed_accepted_at + 1 hour)` | BLOCKED — D-19 value required |
| Temporary derived object deadline | `terminal_or_accepted_at + 1 hour` | BLOCKED — D-19 value required |
| Failed conversion | Retry within the 24-hour raw cap; on cap breach, mark terminal, delete bytes, retain sanitized failure metadata | BLOCKED — action and duration required |
| Quarantine | Restricted to the synthetic security-owner fixture; bytes cannot outlive the 24-hour raw cap | BLOCKED — authority and duration required |
| Processed representation | Until fixture reset, with a hard cap of 30 days | BLOCKED — D-19 value required |
| Locator and provenance metadata | Same as the processed representation; append-only audit/deletion evidence is retained | BLOCKED — D-19 value required |
| Reported answer/artifact evidence | Synthetic IDs and hashes only; delete with fixture reset, hard cap 30 days | BLOCKED — D-08/D-19 values required |

For successful processing, enqueue deletion immediately after acceptance; the deadline is a compliance maximum, not a waiting period. If processing reaches the raw absolute cap without accepted output, stop processing, isolate the terminal failure, and delete the synthetic bytes. Tests use an injectable clock and never wait in wall-clock time.

## Minimum processed acceptance proposal

These are the D-10 proposal thresholds, not approved real-data thresholds.

### Native PDF

- SHA-256 identifies the raw object and processed object.
- Page coverage and locator coverage both equal `1.00`.
- Every non-empty source page produces readable normalized content or an explicit quality failure.
- The stored processed object passes a read-after-write check and checksum comparison.

### Scanned PDF

- Page coverage and locator coverage both equal `1.00`.
- Mean OCR confidence is at least `0.90`; no page below `0.75` can pass without an explicit reviewed exception.
- Tables, diagrams, and handwritten regions are represented by located descriptions or cause a quality failure.
- The stored processed object passes a read-after-write check and checksum comparison.

### Audio

- Covered duration divided by detected content duration is at least `0.99`.
- Timestamps are monotonic and every unexplained gap longer than 5 seconds causes a quality failure.
- Low-confidence and mixed-language spans remain explicitly located; unresolved terminology-sample failure blocks acceptance.
- The finalized transcript and metadata pass read-after-write and checksum checks before raw or normalized audio deletion.

## Processed representation proposal

One immutable processed representation contains:

- normalized UTF-8 Markdown without raw binary or private signed URLs;
- a JSON sidecar with schema version, source-version ID, content checksum, language profile, ordered locators, quality-report ID, and provenance timestamps;
- stable page or time-range locators sufficient to regenerate retrieval segments;
- professor-insight tags as metadata rather than separate content stores.

PostgreSQL backup does not back up object storage. A database row alone is not durability proof. Acceptance requires successful object write, independent read, checksum equality, metadata transaction, and a passing quality report. The object-storage adapter must supply these operations before a real provider is enabled.

## Deletion and uncertainty procedure

1. Revalidate the accepted processed state and its read/checksum evidence.
2. Revalidate that no active hold exists in PostgreSQL.
3. Request deletion using the exact stored provider and object key.
4. Independently check absence through adapter metadata/HEAD semantics.
5. Append the attempt, provider result, absence result, timestamp, and correlation ID; never overwrite prior attempts.
6. Retry synthetic failures after 1, 5, 15, and 30 virtual minutes, then every 15 virtual minutes until the deadline.
7. Treat uncertain absence as not deleted. At the deadline, record a high-severity policy violation and block READY/release state.

Provider-specific absence semantics and notification recipients remain blocked on D-18 and D-20. Tests use deterministic adapter responses and assert the incident event without sending notifications.

## Holds, rights revocation, and takedown

- Synthetic tests use a named security-owner fixture to place or remove a hold with reason, evidence reference, expiry, and audit event. A hold cannot be represented by editing `delete_after` alone.
- No real hold authority exists until the security/data owner is assigned and approves D-19.
- Rights revocation or takedown immediately deactivates the source version from retrieval and derived availability, prevents new artifacts, and starts a durable invalidation job for affected segments, embeddings, caches, and artifacts.
- Audit, provenance, job-attempt, cost, and deletion evidence remain append-only; private source content and signed URLs remain absent.
- Removing a hold recalculates eligibility and enqueues deletion immediately when the original deadline has passed.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
|  |  |  |  |
