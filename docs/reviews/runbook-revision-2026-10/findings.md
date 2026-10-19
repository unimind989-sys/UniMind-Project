# Runbook revision findings (October 2026)

**Task:** [WP00-T19](../../runbooks/poc-execution-runbook.md#wp00-t19--revise-the-execution-runbook-against-the-master-plan). **Base:** `main` at `74bd340` (19 October 2026). **Authority:** the [master plan](../../plans/poc-master-plan.md) for product scope; the code at `74bd340` for what exists.

Ahmed asked for an in-depth revision of the execution runbook because it read as thin and missing steps. This report lists what was wrong, with the evidence, and where revision 3.0 fixes each item. Product questions found on the way are recorded as open decisions; none is answered here.

## Summary

The runbook was strong where work already happened (WP01–WP03 carry detailed, evidence-linked tasks) and weak where the real product still has to be built. The four problems that matter most:

1. **The task order contradicts itself.** Real OCR, transcription and embeddings in WP04 are blocked by D-04, but D-04 is only resolved by WP09-T01, and WP09 depends on WP04–WP08. Real data has no allowed environment until WP08-T06's backup work, but WP04's outcome and WP05's baseline need real sources. Workers may not run on a founder computer (D-15), but the worker host (D-17) is chosen in WP08, after WP04 needs one.
2. **Whole product steps have no task.** Nothing lets a student get cohort membership, an admin create a campaign, invite a Batch Leader or configure the catalog, or anyone collect the real Human Medicine corpus. The code confirms it: no migration or module creates a membership or a campaign.
3. **Open tasks cannot be accepted.** WP04–WP12 tasks have no dependencies, proof or pass line; WP10 and WP12 tasks are one-liners; about thirty values are left as "the approved tolerance" or "the approved window" with no owner.
4. **The selector is stuck.** `pnpm agent:status` reported WP03-T13 as in progress (only Ahmed's hands-on review remains, and the screens were rebuilt since) and recommended WP00-T03, which no agent can do because it needs real source rows from the founders.

## A. Ordering and dependency defects

| ID | Finding | Evidence | Fix in revision 3.0 |
| --- | --- | --- | --- |
| A1 | D-04 (providers) is resolved by WP09-T01 but blocks WP04-T05/T06/T10; WP09 depends on WP04. Circular. | Decision register D-04 row; runbook §2 | Provider benchmark and selection move to WP04-T14, before real processing. WP09-T01 becomes a load-scale re-check. |
| A2 | Real data has no allowed home before WP08: Preview is synthetic-only and Beta stays empty until an encrypted backup/restore passes (D-21), which was WP08-T06. | D-21 record; WP01-T09 | WP04-T18 (Beta backup/restore) and WP04-T19 (real-data readiness gate) come before the first real source. |
| A3 | Workers cannot run on founder computers (D-15) and the host is chosen in WP08-T01, but WP04 must process real sources. `workers/` holds only a README. | D-15; code tree | WP04-T17 selects and deploys the worker host. WP08-T01 then documents the whole topology. |
| A4 | Budget enforcement (caps, reservation before a provider call, 100% block, kill switch) is defined in WP00-T06 and alerted in WP08-T05, but nothing builds it before the first paid call. No `src/lib/usage` exists. | Code tree; master §13 | WP04-T13 builds the guard before any paid benchmark or processing. |
| A5 | The video-ready contract is PoC scope (master §5.1) and §15.2 says to prove it "before PoC completion", yet WP12 starts only after PoC acceptance. | Master §5.1; runbook §2, §15.2 | WP04-T01 proves the contract; WP12-T01 re-checks it. |
| A6 | Implementation rule 16 needs correlation IDs and structured logs from the first job, but the logger arrives in WP08-T02. No `src/lib/observability` exists. | Code tree | WP04-T02 creates the structured logger and correlation propagation; WP08-T02 adds metrics and dashboards. |
| A7 | Every embedding column is `vector(3)`, a synthetic placeholder. No task replaces it after D-04, and nobody checks whether a full corpus fits the Supabase Free database. | 9 × `vector(3)` in `supabase/migrations` | WP04-T15 sets the real configuration through a forward migration and estimates database and storage size against current Free limits; a paid tier is a money stop. |

## B. Missing steps

| ID | Missing step | Evidence | Fix |
| --- | --- | --- | --- |
| B1 | How a student gets an active cohort membership. The master plan assumes membership; WP11-T02 assumes invitations; nothing defines or builds it. | No membership insert in any migration or module | New open decision D-25; WP03-T35. |
| B2 | Campaign creation and Batch Leader access (admin journey steps 2–3), including the needs-information loop. D-24 (one-time links) is proposed. | No campaign insert in any migration or module | WP03-T36, gated on D-24. |
| B3 | Catalog and terminology configuration (admin journey step 1). WP03-T09 left editors undefined on purpose. | Master §7.2.1 | WP03-T34. |
| B4 | Collecting and processing the real Cohort A corpus. Only Veterinary had a collection task (WP10-T03). | Runbook WP04–WP05 | WP04-T20. |
| B5 | Connecting the real chat, Studio and quiz backends to the shared screens that WP03-T17 renders disabled, and the authorized source list Materials waits for. | WP03-T17 decision | Items in WP06-T05, WP07-T03 and WP07-T04. |
| B6 | Auth email delivery. Production SMTP is not configured; the built-in Supabase sender is meant for testing and is rate limited, which cannot onboard 100 students. | `supabase/config.toml` `[auth.email.smtp]` commented out | New open decision D-26; WP08-T05. |
| B7 | Success-signal measurement (activation, 7-day return, repeated value, source trust). Source trust needs an in-product rating that does not exist. | Master §12 | WP08-T10. |
| B8 | Purging processed text and embeddings after a rights takedown. Every rule preserves provenance; none removes content when rights end. | Master §6.7; raw-data policy | WP04-T11 item, WP08-T07 incident, D-19 values. |
| B9 | The claim validator. "The selected validator process" is never selected, and the validator itself is never measured, so the "zero unsupported claims" gate cannot be proven. | Runbook §9.5 | WP06-T01 records the method in an ADR and measures it on a labeled claim set; WP06-T08 adds academic review. |
| B10 | Query-time conflict detection. Only "known/semantic contradiction" is named; the conflict table expects a human `created_by`. | §8.3; `source_conflict_annotations` | WP05-T04 defines the method and its cost. |
| B11 | Weak-topic signals and the revision-pack contract (master Phase 4). | Runbook WP07 | WP07-T01 and WP07-T04. |
| B12 | Reporting a Studio artifact or quiz item. | Master Phase 4 | WP07-T05. |
| B13 | "Run frozen regressions before retrieval, prompt, provider, or processing changes go live" (admin journey step 10) has no gate. | Master §7.2.10 | Implementation rule 18; WP05-T06 and WP06-T08 items. |
| B14 | A threat model and pre-beta security review. | Master §11 release blockers | WP08-T09. |
| B15 | Who writes and approves the final Terms, Privacy Notice and educational-boundary texts before beta. | WP11-T02 | WP11-T02 item. |
| B16 | Load during onboarding (master Phase 7 says "before and during"). | Runbook WP11 | WP11-T03 item. |
| B17 | A restore-rehearsal target that may hold real data. Only Preview (synthetic) and Beta exist, and the disposable CI runner belongs to a public repository. | D-21 | WP04-T18 decision item; D-21 revisit if no free option exists. |
| B18 | Ingestion-time prompt-injection flagging (master §8.5 step 16). | Runbook WP04 | WP04-T10. |
| B19 | Duplicate and replacement rules ("checksum rules selected by the source policy" are never selected). | §5.4 | WP04-T01 and WP04-T02. |
| B20 | The security/data role is unassigned, so D-10, D-18 and D-19 cannot be approved. | Master decision log | WP00-T01 item. |

## C. Acceptance and detail gaps

- **C1.** Open tasks lacked `Depends on`, `Verify` and `Pass`; WP10 and WP12 tasks were one line each. Every open task now uses the task format in runbook §0.3.
- **C2.** Some gates were weaker than the master plan: educational cases said "no systematic false refusal" (master: at least 95%); real-patient cases said "apply the boundary" (master: 100%). §16 now copies the master thresholds and names the task that proves each.
- **C3.** The tutor-suite minimums allowed overlapping categories, so a valid suite could hold fewer than the 100 cases the master plan asks for, with no language-mix minimum and no Veterinary minimum. WP00-T05 now sets distinct totals.
- **C4.** About thirty values had no owner ("approved tolerance", "benchmarked token range", "approved observation window"). §2.3 lists each value, the task or decision that sets it and the synthetic default until then.
- **C5.** Tasks did not say when the protected-path or material-UI rules apply. Each open task now says so.

## D. Stale or contradictory content

- **D1.** §0.6 and §0.8 still described hosted development/CI databases; §19.2 step 4 waited for WP01-T08; §17 described the August foundation session. All rewritten to the D-21 topology or removed.
- **D2.** §4.5 said migrations need review approval, but `main` no longer requires an approving GitHub review (WP00-T18). Independent review follows the workflow instead.
- **D3.** §6.1 listed routes that no longer match the app (`/admin/[resource]`, `/welcome`, `/consent`, `sources`, `evidence`, `report`, `/quiz` without an attempt ID).
- **D4.** The open-decision table omitted D-10 and D-24 and listed approved D-09 as open.
- **D5.** WP03-T13 stayed `[~]` and WP00-T03/T05 stayed `[ ]` although only founder input can move them, so the selector pointed at work an agent cannot do. Those items are now `[?]` with the input named.
- **D6.** Each package restated its tasks a second time in reference sections (raw deletion appeared three times). Contracts that later tasks rely on stay; restatements are gone.
- **D7.** About 900 lines of delivery history (PR numbers, run IDs, SHAs) sat inside completed tasks, against WP00-T18's rule to keep progress logs out of authority documents. Completed tasks keep one line plus their record and evidence links.
- **D8.** The header said 30 September and revision 2.0. WP03-T14 was never assigned; the gap is noted, not filled.

## E. Founder input that unblocks the critical path

In the order the work needs it. Each item is a decision or input only Ahmed and Ziad can give.

1. Name the security/data role, then approve D-10 (processed format). Unblocks WP04-T01.
2. Decide D-25 (how students get membership) and D-24 (Batch Leader links). Unblocks WP03-T35 and WP03-T36.
3. Approve nonzero D-05 caps for the provider benchmark. Unblocks WP04-T14, the first real-money step.
4. Supply the WP00-T03 source rows and rights evidence and name the academic reviewer. Unblocks the real tutor suite and WP04-T20.
5. Decide D-17, D-18, D-19 and the restore target before the first real source (WP04-T16 to WP04-T19).
6. Decide D-20, D-26, D-08 and D-02 before beta.
7. Review WP03-T13's screens or withdraw that item.

## F. Master-plan coverage

| Master plan item | Runbook task |
| --- | --- |
| §5.1 accounts, roles, consent | WP03-T02 (done); email delivery WP08-T05 |
| §5.1 catalog, terminology | WP02, WP03-T01/T03 (done); configuration WP03-T34 |
| §5.1 membership, release, publication, availability | WP02-T05, WP03-T06 (done); membership WP03-T35 |
| §5.1 admin dashboard | WP03-T06, WP03-T34, WP03-T36, WP08-T04 |
| §5.1 Batch Leader invitations and submissions | WP03-T05 (done); access WP03-T36 |
| §5.1 PDF/OCR/audio, hints, compact output | WP04-T01 to WP04-T07 |
| §5.1 verified raw deletion | WP04-T08, WP04-T09 |
| §5.1 unified pool, strict RAG, missing/conflict | WP04-T10, WP05, WP06 |
| §5.1 Studio, quiz | WP07 |
| §5.1 feedback and reports | WP06-T07, WP07-T05, WP08-T04 |
| §5.1 quotas, metering, cost, retries, alerts | WP04-T13, WP06-T02, WP08-T03, WP08-T05 |
| §5.1 load testing | WP09 |
| §5.1 video-ready contract | WP04-T01, WP12-T01 |
| §7.2 admin journey 1–10 | WP03-T34, WP03-T36, WP08-T04, WP03-T06, WP05-T06/WP06-T08 (step 10) |
| §7.3 Batch Leader journey | WP03-T05, WP03-T36 |
| §11 quality gates | §16 checklist, each line names its proving task |
| §12 success signals | WP08-T10, WP11-T05 |
| §13 cost policy | WP00-T06, WP04-T13, WP04-T14, WP08-T05 |
| §16 immediate actions 1–10 | WP00-T01 to WP00-T07, WP04-T14 (benchmark samples) |
| Phase exit gates 0–8 | WP00-T08; WP01-T11, WP02-T09, WP03-T08; WP04-T12 + WP04-T20; WP05-T06 + WP06-T08; WP07-T06; WP08-T08; WP10-T07; WP09-T06 + WP11-T05; WP12-T06 |
