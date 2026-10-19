# Proposed master-plan amendments (October 2026)

**Status:** PROPOSED. Nothing here is applied. The [master plan](../../plans/poc-master-plan.md) is product authority, so each amendment needs Ahmed's and Ziad's approval before an agent edits it. **Source:** the [third review](third-review.md) of runbook revision 3.1, which read the master plan itself because the runbook inherits its gaps.

Each amendment gives the current master-plan text, the proposed change and the runbook tasks that depend on it. Approve, change or reject each one; an approved amendment is applied in one docs PR together with the matching decision-log row.

## Blockers

### A1. Where real sources may live before go-live

- **Now:** Phase 2 and Phase 3 exits (§10) need real PDFs, audio, hints and conflicts, but D-21 keeps Beta "empty of real pilot data until rights, backup/restore, security, release, and two-founder go-live gates pass", Preview is synthetic-only, and founder computers are excluded. No environment may hold real sources before Phase 7.
- **Proposed (§8.1, new paragraph):** "After the real-data readiness gate (rights, D-18/D-19, D-27, D-28 and a security review of the real-data paths), rights-cleared sources may be processed in locked, student-free Beta. Preview stays synthetic and mock-only. Students enter only at the Phase 7 go decision." Add a §15 row "D-21a Real sources in locked, student-free Beta — Ahmed + Ziad — Proposed".
- **Runbook:** WP04-T22 prepares it; WP04-T15, WP04-T18, WP04-T19, WP04-T21, WP05-T06, WP06-T08.

### A2. Data protection and the benchmark

- **Now:** D-28 is "Open" with no date; §13 says "Benchmark with representative project data before provider commitment"; §16 omits D-28; §3.3 lists real-money actions but not commitments that create a financial liability.
- **Proposed:**
  - §13: "Benchmark only after the real-data readiness gate, with rights-cleared samples that hold no personal data (or have recorded consent), under an approved D-05 benchmark exception, from an approved non-founder host."
  - §3.3: add "or any commitment that creates a financial liability (licence, legal counsel, contract)".
  - §16: put D-28 first, "due before 1 November 2026 (reported end of the compliance period)".
- **Runbook:** WP00-T21, WP04-T18, WP04-T19, WP08-T07, WP08-T11, WP11-T01, WP11-T02.

## High

### A3. Rights decisions are governance, not processing

- **Now:** §3.3 promises zero manual intervention from upload to READY, while §8.2 requires valid rights and the runbook (WP03-T37) needs an audited rights decision for each source version.
- **Proposed (§3.3, after the governance paragraph):** "Per-source rights validation (one audited decision per source version, which may cover a batch of inventory rows), publication and unlock are governance actions. Zero manual intervention covers every step from a rights-validated accepted upload to READY or isolation. The §11 routine-automation gate counts processing steps only; governance actions are reported separately."
- **Runbook:** WP03-T37, WP04-T21, WP08-T08, WP10-T03.

### A4. Unit targets per cohort

- **Now:** §4.2 targets "8-12 Modules or Subjects" per cohort; D-01 approves four Modules.
- **Proposed:** "All curriculum units of the selected cohort term (Cohort A: the four D-01 Modules)", with founder-set document and audio minimums per unit.
- **Runbook:** WP00-T03, WP04-T21, WP10-T03.

### A5. How percentage gates are read, and a second rater

- **Now:** §11 sets "at least 95%" gates, but §4.2's case counts (10–15 per category) cannot show 95%: 15 of 15 shows only about 82% at one-sided 95% confidence. The same suite is tuned and gated. §3.3 and D-22 keep every reviewer role with the founders, so an outside academic rater is not provided for.
- **Proposed:**
  - Under §11: "Percentage gates run on the sealed test part. Each gated category has at least N cases (59 for a one-sided 95% bound with no miss), or the current minimums are read as 'no miss on N' with the bound recorded. Generation gates run three times and every run must pass."
  - §3.3: "An academic second rater outside the founders may grade samples. This is evidence, not project authority."
- **Runbook:** WP00-T20, WP05-T06, WP06-T08, WP07-T06, WP10-T02, WP10-T07.

### A6. Student numbers and where the load runs

- **Now:** §4.3 says "at least 100" students, Phase 7 "up to 100", D-01 "up to 50 expected testers", and Phase 7 runs "the defined load before and during onboarding" without naming a target. A Vercel Hobby overage can stop Preview and Beta together.
- **Proposed:**
  - §4.3: "Capacity is proven with 100 synthetic accounts in an isolated synthetic cohort. Real participation is up to 100 verified students (Cohort A up to 50 per D-01)."
  - Phase 7: "Run the full load on the release candidate before the first wave, under a named spend cap. During onboarding, run only a reduced canary probe at a named rate with abort thresholds."
- **Runbook:** WP00-T07, WP09-T02, WP09-T03, WP09-T06, WP11-T03.

### A7. Decision-log rows that disagree with their records

| Row | Problem | Proposed |
| --- | --- | --- |
| D-01 | The record keeps synthetic fixtures "until D-02/D-03 close", which holds the Cohort A catalog behind D-02 | Direction adds "four ordered Modules; up to 50 testers; the Cohort A catalog does not wait for D-02" |
| D-02 | Direction is only "Use the same scoring model"; the record says no institution is approved, but D-03 approved Zagazig | "Zagazig Veterinary Medicine (D-03); exact cohort, Subjects, reviewer and Batch Leader still to be chosen" |
| D-05 | Names only total and weekly limits; the record has six scopes and the runbook adds a benchmark exception | List the six scopes and the benchmark exception |
| D-08 | §6.7 states the proposal as settled; the record's `NO_SAVE` does not match the schema's `MINIMAL`/`HISTORY`/`DISABLED` | Mark §6.7 as the proposal; align the record's names with the schema |
| D-18, D-19 | Owner "Security/data owner (unassigned)", but D-22 keeps every role with Ahmed or Ziad | "Ahmed + Ziad (security/data holder to be named)" |
| D-20, D-26 | Omit the interim budget-alert email (WP04-T17) | Add it |
| D-21 | Omits "empty until go-live" and the pending revision; the record still requires "separate Ahmed and Ziad confirmations", replaced by D-22 | Add both; update the record's approval wording |
| D-12 | Says "term"; §2.1 and D-23 say "configured academic period" | Use "configured academic period" |
| D-06, D-07, D-09, D-11 to D-16, D-23 | "Approved direction" with no record, approver or date | Write short records, as the decisions README requires |

### A8. Decisions the plan should record

The D-21 revision (A1); the review-role holders and the Veterinary academic reviewer; how gates are read and the second rater (A5); the accepted source formats (WP04-T01); the load-test target and spend (A6); the success-signal definitions (A10); the day and week boundary (Africa/Cairo); the beta's academic term (D-01 is Term 1); a minimum age and the handling of minors under D-28 (needed later for Thanaweya Amma); the evidence-class codes (A13).

## Medium

### A9. Availability for flexible-credit programs

- **Now:** §2.1 promises "individually eligible Modules or Subjects" for `FLEXIBLE_CREDIT`, but §8.2's availability rule has no per-student eligibility, and the schema has no such relation.
- **Proposed (§8.2):** "In `FLEXIBLE_CREDIT`, a cohort is one course-plan offering and membership is per offering. A per-student unit-eligibility predicate needs a new decision before such a program is configured."
- **Runbook:** WP03-T34, WP03-T35, WP12-T01.

### A10. Success-signal definitions

- **Now:** §12 targets have no owner, window or denominator.
- **Proposed:** "Signals inform the WP11-T05 decision; they are not acceptance gates. WP08-T10 measures them, and the founders review them weekly." Activation: at least 60% of students with an active membership complete, within 7 days of first sign-in, one validated chat answer, validated Studio artifact or submitted quiz. Return: such an action on days 8–14 after activation. Meaningful session: at least one such action; repeated value: 3 or more meaningful sessions on distinct days in one ISO week. Trust: at least 80% positive from at least 30 ratings by at least 15 students.
- **Runbook:** WP08-T10, WP11-T04, WP11-T05.

### A11. Measurable gate wording

| Gate | Proposed wording |
| --- | --- |
| Chat latency (§11) | p50 ≤ 5 s and p95 ≤ 12 s to the first visible text, measured server-side over successful WP09 peak-phase chat requests |
| Cost (§11) | p95 cost per action type ≤ its D-05 per-request cap; total workload cost ≤ the approved load cap |
| Uncontrolled backlog (§11) | queue-age p95 returns under X minutes within Y minutes of the peak; no job exceeds its maximum attempts silently |
| Interactive availability (§11) | ≥ 99% of interactive requests over the whole run, excluding HTTP 429 quota rejections |
| Professor hints (§11) | the tagged segment is in the evidence packet for ≥ 95% of sealed hint cases |
| "Refunds" (Phase 3) | "release of unused allowance reservations" |
| Phase 0 exit | state that it passed constraints-only (WP00-T08) and that real items are gated just in time |

### A12. Scope the runbook builds that the plan does not name

- §5.1: add "student data export, correction, and saved-chat and account deletion as D-28 requires" (WP08-T11).
- §7.1: add step 1a "obtain membership through the D-25 path" (WP03-T35) and step 12 "export or delete own data" (WP08-T11).

### A13. Evidence-class codes

- **Now:** §8.4 says no answer may claim `SUPPORTED`; the schema and the runbook use `FULL`, `PARTIAL`, `UNAVAILABLE` and `CONFLICTING`.
- **Proposed (§8.4):** "No answer is finalized as `FULL`, `PARTIAL` or `CONFLICTING` without evidence links, and none is displayed unless validation `PASSED`. `UNAVAILABLE` answers carry no links." Use the four codes in §8.6 and §10 Phase 3, and in `CONTEXT.md`.
- **Runbook:** WP05-T04, WP06-T01, WP06-T06.

### A14. Alignment with AGENTS.md and D-22

- §3.3 "does not require a different reviewer": add "Protected paths also need an independent review of the exact diff."
- §3.3's list of protected gates: add "budget controls" (D-22).
- "`$finalize`": "the `finalize` skill remains a manual/recovery entry".
- Line 3 "Ahmed, Ziad, and Codex": "Ahmed, Ziad and coding agents (Codex, Claude Code)".

### A15. Video contract wording

- **Proposed (§5.1):** "A contract test proves that a future `VIDEO` source kind reuses the processed-document, time-range locator, segment, tag and job contracts. No video upload, processor or UI is built." (WP04-T01 records the exact schema changes video would need.)

## Low

### A16. Stale header and closing sections

- "Status: Updated implementation plan" has no version; "Last updated" changed on 19–20 October only for the decision-log rows. Say so, or bump the version when the amendments land.
- §16 "Immediate actions": item 11 is done, item 1 is half done (D-01), item 12 is not an action, and D-28, D-25 and the review roles are missing. Replace with a pointer to runbook §17 and its top three items.
- §17 "After the reviewed WP01 foundation gate passes": WP01 is done.
- The "original Word blueprint" is not in the repository.
- `docs/plans/poc-master-plan-ar-eg.html` last changed on 16 August 2026 and has no D-20 to D-28: mark it stale or regenerate it.
- Phase effort estimates are the originals; runbook §2.4 carries a current forecast.
- "Production" is ambiguous: §3.2 calls Beta production, while the environment-promotion runbook treats the synthetic Preview project's Vercel production as production.
- D-01 uses "Undergraduate" where §2.1 uses `UNIVERSITY`.
