# Decision D-10: Processed representation format

**Status:** PROPOSED

**Owner:** Ahmed + Ziad

**Reviewers:** Ahmed or Ziad — academic and security/data roles must be explicitly assigned before approval

**Decision deadline:** UNSCHEDULED — OWNER INPUT REQUIRED

**Last reviewed:** NOT RECORDED

**Blocks:** WP04-T01, WP04-T08, WP04-T12

## Context

D-09 already approves temporary raw storage followed by verified deletion after complete durable output. The processed representation must therefore preserve meaning, provenance, and exact locators well enough to rebuild segments and embeddings after raw bytes are gone.

## Non-negotiable requirements

- One provider-neutral contract supports native PDF, scanned PDF, and audio.
- Content remains attributable to one immutable source version and exact page/time locators.
- Segments and embeddings are reproducible without the raw object.
- Professor insight, source format, and language remain metadata in one authorized knowledge pool.
- Private source bytes, signed URLs, credentials, and provider payloads remain outside logs and Git evidence.

## Options evaluated

| Option | Quality/fit | Security/rights | Reliability | Cost | Migration/lock-in | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Normalized Markdown plus versioned JSON metadata/locators | Strong fit for human inspection, deterministic validation, and regeneration | Supports compact retention and exact provenance | Provider-neutral and checksum-verifiable | Compact | Low when schema is versioned | Master plan D-10; `CONTEXT.md`; lifecycle draft |
| JSON-only content tree | Precise structure but harder human review and diffing | Comparable | More custom render/validation code | Moderate | Medium custom-schema lock-in | No evaluated PoC evidence |
| Retain provider-native extraction output | Variable meaning and locator quality | Expands retained provider data | Provider/version dependent | Unknown | High | Rejected by adapter and portability requirements |

## Decision

PROPOSED — store immutable normalized UTF-8 Markdown plus a versioned JSON sidecar containing source-version identity, checksums, language, ordered locators, quality-report identity, and provenance timestamps. The detailed acceptance proposal is in `docs/policies/raw-data-lifecycle.md`. No real-data contract is approved yet.

## Consequences

### Benefits

- Future agents can build provider adapters against one stable seam and test regeneration deterministically.
- Human reviewers can inspect compact Markdown while machines validate structured metadata and locators.

### Costs and risks

- Schema evolution needs explicit versioning and migration tests.
- OCR/audio confidence thresholds require academic and security/data review before real sources.

## Implementation contract

- Configuration keys: processed schema version and profile-specific acceptance thresholds.
- Adapter/interface: extractor/transcriber output normalizes into one processed-representation writer and validator.
- Affected migrations/files: WP04-T01 models/schema; WP04-T08 acceptance/deletion gate; WP04-T12 end-to-end pipeline.
- Tests/evaluation required: native PDF, scanned PDF, audio, corrupt/missing locators, checksum mismatch, replay, and schema-version compatibility.
- Observability required: schema version, coverage, locator coverage, checksum result, quality status, and source-version correlation ID.
- Rollback/disable action: keep deterministic mocks and raw deletion disabled for unapproved real profiles.

## Revisit triggers

- A representative fixture cannot preserve tables, diagrams, mixed-language audio, professor metadata, or exact citations.
- Regeneration produces unstable segment identity or loses provenance.
- A schema migration cannot preserve accepted content and locators.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
|  |  |  |  |
