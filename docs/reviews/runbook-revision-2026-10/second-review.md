# Runbook second review (October 2026)

**Task:** [WP00-T19](../../runbooks/poc-execution-runbook.md#wp00-t19--revise-the-execution-runbook-against-the-master-plan). **Reviewed:** runbook revision 3.0 at `6b7025e`. **Result:** revision 3.1 on the same branch. **First review:** [findings](findings.md).

Ahmed asked for a deeper review after revision 3.0. Five independent review passes read the runbook from different angles:

- master-plan traceability, line by line;
- the runbook against the actual code and schema;
- consistency with the decision records, policies, CONTEXT vocabulary and skills;
- the runbook as a program (dependency graph and selector simulation);
- platform, legal and evaluation risk, checked against current provider documentation.

Every finding below was checked against its source before anything changed. Several are errors in revision 3.0 itself.

## Summary

Revision 3.0 fixed the order of the plan but was wrong in three ways that would have hurt the first agent to execute it:

1. **It used names that do not exist.** The job, raw-object, quiz, chat-retention and answer-status names, the catalog code format, the `vector(3)` column and "seed data" were all wrong against the migrations. Several open tasks assumed database behaviour the schema forbids: real uploads, reclaiming expired leases, cost budgets, purging immutable segments, shared Studio artifacts and client-written quizzes.
2. **It moved real data earlier than approved decisions allow.**
   - D-21 keeps Beta empty of real pilot data until the go-live gates; the revision put real sources there in WP04 without saying so.
   - D-21 keeps Preview on mocks; the revision allowed real adapters there.
   - The provider benchmark sent real samples to foreign providers before any real-data gate.
   - Egypt's data-protection law was absent, although its compliance period is reported to end around 1 November 2026.
3. **Its task picker could not work as written.**
   - Two dependency deadlocks: WP00-T03 ↔ the benchmark, and an email sender needed in WP04 but decided in WP08.
   - Missing dependencies on WP04-T19/T20.
   - `pnpm agent:status` ignored `Depends on` and so recommended a task whose dependency was blocked.

Revision 3.1 fixes all of these. The real-data and legal points cannot be fixed by an agent; they are now explicit founder decisions (D-21 revision, D-27, D-28).

## A. Founder-level findings

| ID | Finding | Evidence | Disposition |
| --- | --- | --- | --- |
| A1 | Egypt's Personal Data Protection Law (Law 151 of 2020) is absent. Its executive regulations (Ministerial Decree 816 of 2025) were reported to start a one-year compliance period ending around 1 November 2026, covering licensing, cross-border transfer, consent and breach notice. Every planned processor (Vercel, Supabase, AI providers, email, backup) is foreign, and chats can hold health details. Not legal advice. | [CMS](https://cms.law/en/are/legal-updates/egypt-s-pdpl-executive-regulations-issued-one-year-compliance-countdown-begins), [Baker McKenzie](https://connectontech.bakermckenzie.com/egypt-personal-data-protection-law-update/), [Shalakany](https://shalakany.com/wp-content/uploads/2025/12/New-Executive-Regulations-for-Egypts-Personal-Data-Protection-Law-.pdf) | New open decision D-28; new WP00-T21; gates in WP04-T18 and WP11-T01; breach runbook (WP08-T07); data-subject controls (new WP08-T11). |
| A2 | Revision 3.0 let real sources into Beta at WP04, before the security review and go-live that D-21 requires. This was an unannounced change to an approved decision. | D-21 record: Beta "empty of real pilot data until rights, backup/restore, security, release, and two-founder go-live gates pass" | The D-21 revision is now an explicit founder decision prepared in WP04-T15. WP04-T18 adds a security review of the real-data paths. WP01-T09's wording is restored. |
| A3 | Revision 3.0 allowed real adapters in Preview. | D-21: Preview "synthetic data and mock providers only" | Preview is mocks-only again (§4.1). Real-provider contract tests run only where the D-21 revision allows. |
| A4 | The provider benchmark sent real samples abroad before any real-data gate, from an unnamed host, on synthetic evaluation data, and outside D-05's live-enablement rule. | WP04-T14 (3.0) depended on WP00-T05 (synthetic) and came before WP04-T19 | The benchmark is now WP04-T19, after the real-data gate (WP04-T18). It depends on the signed WP00-T20 suite, runs from an approved non-founder host and needs a founder-approved D-05 benchmark exception. |
| A5 | No backup host, storage location or key custody was named. In the public repository, workflow artifacts can be downloaded by anyone signed in, and scheduled workflows stop after 60 days without repository activity. | GitHub docs; D-21 | New open decision D-27 in WP04-T16; the backup includes Auth data; the key custody is rehearsed. |
| A6 | The case counts cannot support the 95% gates. 15 of 15 shows only about 82% at one-sided 95% confidence; about 59 cases with no miss are needed to show 95%. The same suite was used for tuning and for the gate. | Exact binomial bound | WP00-T20 asks the founders to raise the minimums or read gates as "no miss on N". The suite gets a sealed test part. Generation gates run at least three times. |
| A7 | Ahmed both authors the cases and is the single academic reviewer (D-01). | D-01 record | WP00-T20 asks the founders whether a blind second rater grades 20% of each sample (with Cohen's kappa), or records the single-rater risk. |

## B. Missing steps found in the code

| ID | Finding | Evidence | Disposition |
| --- | --- | --- | --- |
| B1 | No action ever sets `source_versions.rights_status` to `VALID`, but every availability and retrieval rule requires it, so no real source could ever reach students. | Default `'PENDING'` in `20260831064427…`; no setter in any migration or action | New WP03-T37 (rights and source decisions) |
| B2 | Intake accepts only PDF, WAV and PNG up to 10 MiB with the mock storage provider, enforced by database checks; no task chose real formats (MP3, M4A, Opus, DOCX, PPTX). The upload reads the whole file in the request (Vercel body limit about 4.5 MB). | `collection.domain.ts`; `collection_uploads` checks | WP04-T01 proposes the format list for founders; WP04-T03 migrates intake to direct signed upload. |
| B3 | Admin preview exists only in synthetic mode; real mode hard-codes `admin_preview: false`. | `student-access.server.ts:55` | WP08-T04 |
| B4 | A submission never becomes a source version; no reclaim or cancel function exists for jobs; `RETRY_SOURCE` changes no data. | `finalize_synthetic_source_submission_internal`; job functions | WP04-T02 |
| B5 | No cost budget exists in the database: reservations need a user and count units, and nothing writes `budget_counters`. | `20260831064447…` | WP04-T13 enforces all six D-05 scopes. |
| B6 | Takedown cannot purge content: segment text is immutable and evidence references segments with `on delete restrict`. | `enforce_source_segment_update` | WP04-T11 adds a redaction (tombstone) migration. |
| B7 | The Studio cache cannot serve a second student (RLS is owner-only); quizzes have no state column and are client-writable; reports cannot target a quiz item; students can insert chat sessions and messages directly. | Studio, quiz, feedback and chat policies | WP07-T02, WP07-T04, WP07-T05, WP06-T02 |
| B8 | Full-text search uses the `simple` configuration with all-terms matching and no Arabic letter folding, so natural questions rarely match. Cross-language and Franco-Arabic questions were never evaluated. | `20260907124502…` lines 12 and 83 | WP05-T02/T03 (one normalization for stored text and queries, ranked matching); query × source language matrix in WP00-T05/T20 and WP05-T06 |
| B9 | Filtered HNSW search can return fewer results than asked; pgvector indexes cap `vector` at 2,000 dimensions. | [pgvector](https://github.com/pgvector/pgvector) | WP04-T19 (dimension as a criterion), WP05-T03 (no short results) |
| B10 | Vercel Hobby can pause the account over a rolling 30-day window when an allowance is exceeded, and its cron runs at most once a day. Free worker hosts sleep or reclaim idle machines. Supabase direct connections are IPv6-only and the transaction pooler drops session advisory locks. | [Vercel cron](https://vercel.com/docs/cron-jobs/usage-and-pricing), [Vercel community](https://community.vercel.com/t/what-to-do-when-your-team-is-paused-or-blocked/45069), Supabase docs | §0.8; WP04-T14 (host criteria, 7-day soak); WP06-T05 (where generation runs, CPU per chat); WP09-T02 (meter-based abort) |
| B11 | No CAPTCHA, no versioned hosted Auth settings, no output-rendering policy or Content-Security-Policy, logs kept for hours, no secret-rotation rehearsal. | `supabase/config.toml`; `next.config.ts` | WP04-T17, WP08-T09, WP06-T05, WP08-T02 |
| B12 | The load runner only validates the profile, and the profile is mock-only with zero cost. | `scripts/run-load-suite.ts` | WP09-T02 builds the executor and versions the profile |

## C. Errors in revision 3.0

| ID | Error | Correction |
| --- | --- | --- |
| C1 | Job states `PENDING`/`RETRY_WAIT`; job types not matching the schema | `QUEUED`/`RETRYING`; the graph mapped onto existing types (§7.1, §5.5) |
| C2 | Raw state `DELETED_VERIFIED` | `DELETED` plus a `VERIFIED_ABSENT` event, with the migrations that enforce it (WP04-T09) |
| C3 | "Every embedding column is `vector(3)`" | The column is unsized; only the synthetic index and retrieval function assume 3 dimensions (WP04-T20) |
| C4 | Catalog codes in lower snake case | Upper snake case `^[A-Z][A-Z0-9_]*$` |
| C5 | Memberships, catalog and campaigns "exist in seed data" | `seed.sql` holds one synthetic fixture insert; Preview has no catalog (WP04-T14 creates one through admin actions) |
| C6 | `NO_SAVE`, `SUPPORTED`/`CONFLICT` | `MINIMAL`/`HISTORY`/`DISABLED`; `FULL`/`PARTIAL`/`UNAVAILABLE`/`CONFLICTING` |
| C7 | Smoke "six checks"; `test:e2e` as the authenticated suite | Seven checks, local or Preview only; `test:e2e:database` runs in `database-ci` |
| C8 | Extra "two-founder approval" steps for go-live and gates | Removed: D-22 says the agent does not request a second approval for protected non-financial actions |
| C9 | D-08 and D-24 blocked their own resolution tasks; D-18 and D-19 waited on each other; the §0.7 table disagreed with the register | Resolution-path pattern applied; D-18 and D-19 approved together in WP04-T15; register is the single list |
| C10 | WP00-T03 ↔ benchmark cycle; email decided after it was needed; WP04-T19/T20 missing WP00 dependencies; WP06-T05 relied on the validator built after it | Preflight cost moved to WP04-T19; new WP04-T17 email sender; dependencies added; WP06-T05 uses a fixture validator and latency moved to WP06-T06 |
| C11 | `agent:status` ignored `Depends on` | `scripts/agent/status.ts` now reads `Depends on` lines and prints the next executable task; `tests/unit/agent-status.test.ts` covers it |
| C12 | Wrong flags (protected paths, material UI, real money) on WP04-T06/T08, WP06-T05, WP07-T05, WP08-T03, WP11-T01/T03 | Corrected |
| C13 | Vocabulary drift from `CONTEXT.md` | Unified knowledge pool, professor insight, unavailable-information response, chat sharing mode, curriculum unit workspace |

## D. Accepted as already covered

These were raised but are already handled, so revision 3.1 does not change them: Supabase database size and pausing, custom SMTP as a decision, the budget guard concept, ingestion-time injection tagging, isolation canaries and the weekly regression runs.

## E. Founder input now on the critical path

In order (runbook §17):

1. **The data-protection route (D-28).** This is urgent because of the reported compliance date.
2. **Review roles.** Name the security/data, cost and operations role holders and the Veterinary academic reviewer.
3. **D-10.** Approve it, or allow the synthetic pipeline to be built on the proposal.
4. **D-25 and D-24.** Decide student membership (D-25) and confirm Batch Leader access (D-24).
5. **Sources and evaluation rules.** Supply the Cohort A sources and rights holders; choose the case-count and second-rater rules.
6. **Real-data controls.** Decide D-17, D-18 with D-19, the D-21 revision, D-27 and D-26 as the WP04 tasks prepare them.
7. **Spending.** Approve the D-05 caps and the benchmark exception.
8. **D-08 and D-20.**
9. **D-02.**
10. **WP03-T13.** Record or withdraw the hands-on review.

## Proof

- **Task headings:** compared with `main`, none is lost and 20 are added.
- **Task states:** the status parser shows the 63 done tasks unchanged. The other changes are intended: decision gates now show as blocked, WP03-T13 waits on Ahmed, and WP06-T07 and WP08-T05 now follow the resolution-path rule.
- **Dependencies:** a dependency audit finds no unknown task, no cycle and no forward dependency.
- **Next task:** `pnpm agent:status` recommends WP00-T05.
- **Checks:** `pnpm lint:agents` passes. The `agent-status` unit tests pass. The remaining checks are recorded in the PR.
