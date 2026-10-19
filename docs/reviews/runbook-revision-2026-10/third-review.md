# Runbook third review (October 2026)

**Task:** [WP00-T19](../../runbooks/poc-execution-runbook.md#wp00-t19--revise-the-execution-runbook-against-the-master-plan). **Reviewed:** runbook revision 3.1 at `5478a4f`. **Result:** revision 3.2 on the same branch and [proposed master-plan amendments](master-plan-amendments.md). **Earlier:** [first](findings.md) and [second](second-review.md) reviews.

The first two reviews compared the runbook with the master plan, the code and the decision records. This round used six angles they had not covered:

1. A fact-check of every claim revision 3.1 makes about the code, the schema and the platforms (about 250 claims).
2. A dry run of the five next governance tasks by a fresh agent with only the repository.
3. A dry run of seven pipeline tasks, done the same way.
4. Delivery realism: task size, effort, provider testing, migrations on real data, cost, environment contention and operations.
5. Product and UX: every journey walked end to end in real mode.
6. A critique of the master plan itself.

Every finding used below was checked against its source before it changed anything.

## Summary

Revision 3.1 is accurate in its facts: 17 of about 250 claims needed correction, none of them high severity. It is not yet executable without founder input, and four problems were found that no earlier review saw:

1. **Students could not reach Beta.** Beta is a protected preview deployment without a public domain, and the public domain serves the synthetic Preview site. New WP08-T12.
2. **There was no safe way to migrate Beta once it holds data.** Hosted migrations are pasted into the SQL editor by hand, and the CI "populated upgrade" starts from the WP01 schema with three rows. New WP04-T23.
3. **The calendar.** A reviewer's estimate puts the remaining work at roughly 32–49 weeks against the master plan's 15–17, driven mostly by about twenty founder decisions on the critical path. D-01's cohort is Term 1 of 2026/2027, which ends long before a realistic beta. §2.4 and a new WP00-T01 decision step cover this.
4. **The master plan itself is inconsistent where the runbook needs it most.** For example, no environment is allowed to hold real sources before go-live, and the plan asks for 8–12 units per cohort where D-01 approves four. These are product-authority changes, so they are written as [amendments](master-plan-amendments.md) for founder approval, not applied.

The dry runs showed that only WP00-T05 can be finished today without asking a human. Every other next task stops on a founder answer, so revision 3.2 makes those questions explicit inside each task and collects them in runbook §17.

## A. Fact-check (17 corrections, about 250 claims confirmed)

| ID | Correction | Where fixed |
| --- | --- | --- |
| F1 | Students cannot read the usage ledger; it is server-only | §5.3 |
| F2 | `ENABLE_FLAG` works only for synthetic `mock.artifact.*` flags; real providers have no admin action | §6.4 |
| F3 | Hold actions accept only synthetic mock-storage objects under `synthetic/`; removing one needs a READY, embedded source | §5.5, WP04-T09, WP04-T15 |
| F4 | `RETRY_SOURCE` leaves a command in a state with no exit, then blocks further retries, and needs `VALID` rights | §5.5, §6.4, WP04-T02 |
| F5 | Video would need more schema changes than one kind value | WP04-T01 |
| F6 | The readiness function already checks embeddings under an active configuration (several may be active) | §5.5 |
| F7 | Source versions also carry `governance_state` | §5.5 |
| F8 | `REJECTED` is reachable only from `VALIDATING` or `NEEDS_REVIEW` | WP03-T37 |
| F9 | Finalize also marks the upload and requested item | §5.5, WP04-T02 |
| F10 | Job transitions are checked only inside the job functions, not by a trigger | §7.1, WP04-T02 |
| F11 | Redaction must also relax three more guards | WP04-T11 |
| F12 | No action creates embedding configurations | WP04-T14 |
| F13 | `createChatSession` depends on the direct insert WP06-T02 revokes | WP06-T02 |
| F14 | Students can also write `quiz_responses` | WP07-T04 |
| F15 | `feedback_reports` also lacks a quiz-item entity type | WP07-T05 |
| F16 | A Vercel Hobby overage pauses the feature, usually for 30 days, for the one shared workspace | §0.8 |
| F17 | The built-in Supabase sender sends about two emails an hour and only to team addresses | §0.8, §0.7 |

Correction to the second review: its B10 described the Vercel pause as a "rolling 30-day window"; Vercel's page says to wait about 30 days (F16).

## B. Dry runs

| Task | Could an agent finish it today? | What stops it | Fixed in 3.2 |
| --- | --- | --- | --- |
| WP00-T05 | Yes | Wired to `test:eval` only (CI runs `test:node`); no synthetic corpus; Franco-Arabic has no database code; no version lock | All four |
| WP03-T34 | No | All twelve admin actions live in one ~880-line function; deactivation does nothing to availability; no reactivate; size | Dispatcher step, availability step, reactivate, §2.4 split |
| WP03-T35 | Only to the D-25 record | Delivery of the record; allow-list emails are personal data; invite-only sign-up is production configuration | Docs-PR step, D-28 note, protected flag |
| WP03-T36 | No | No action creates Batch Leader assignments, and D-24 forbids extending the account screens; no "open" action; the loop needs a fixture source | Fixture assignment, open action, fixture source |
| WP03-T37 | No | Which rights fields make `VALID`; one or two founders for containment; `READY` does not check rights | Founder question, trigger step |
| WP04-T01 | No | Accepted formats; Markdown + sidecar vs one object; offset units; boundary checker misses PDF/audio/database libraries | Bundle and offset step, checker step |
| WP04-T02 | No | Kind, language and edition at finalize; immutable detected metadata; private schema not exposed; retry keys; stub handlers | Five steps |
| WP04-T03 | No | Stateless mock; checksum without seeing bytes; proof of large upload; picker UI | Stateful fake, checksum source, proof via mock endpoint, Material UI |
| WP04-T04 | Yes, if DOCX/PPTX are rejected | Converter host; OCR handoff | `OCR_CANDIDATE`, reject with guidance |
| WP04-T09 | Yes, with defaults confirmed | `delete_after` never set; failed sources; hold removal and expiry | One step |
| WP04-T13 | No | No cap action; currency unset; env var as second source of truth; unit mismatch | Cap action, `XTS`, retire env var, units |
| WP05-T02 | No | Stopword and alias lists; negations; Franco-Arabic digits | Steps and a §2.3 row |

## C. Delivery, operations and engineering strategy

| ID | Finding | Change |
| --- | --- | --- |
| D1 | Students cannot reach Beta: protected preview deployment, no production domain; `unimind.space` serves synthetic Preview | New WP08-T12; WP11-T01 depends on it |
| D2 | No safe Beta migration path: hand-pasted SQL, a three-row populated upgrade from the WP01 schema, no backup-before-migrate or timeouts in the checklist | New WP04-T23 before WP04-T18 |
| D3 | Calendar roughly 2–3× the master plan; Term 1 ends first | §2.4 forecast; WP00-T01 term decision; WP10 no longer waits for WP09 |
| D4 | Many tasks combine a founder decision, a protected change and a UI approval | §0.3 split rule; §2.4 recommended splits; WP04-T22 decision pack |
| D5 | Nothing keeps real providers regression-tested once `pnpm verify` is mock-only | New WP04-T24; WP08-T08 depends on it |
| D6 | Founders asked for caps with no cost estimate | New WP00-T22; WP00-T06 depends on it |
| D7 | Beta holds real data, synthetic load users and fault injection at once; a load test can pause the shared Hobby workspace before the beta | WP09-T02 target decision, run tagging, 30-day spacing; WP08-T08 synthetic-only faults |
| D8 | No rota, coverage, targets or agent incident permissions | New WP08-T13; WP08-T05 auto-disable on leakage or validator regression |
| D9 | Design for later | Entitlement record (WP06-T02), eligibility function (WP03-T35), veterinary safety cases (WP06-T03), video-size uploads (WP04-T22), swappable vector branch (WP05-T03) |

## D. Product and UX

| ID | Finding | Change |
| --- | --- | --- |
| U1 | Saved chats become unreachable when a unit closes; old evidence goes stale | WP06-T07 Settings history across units |
| U2 | Chat result states have no screen owner | WP06-T05 full state list with bilingual copy and accessibility rules |
| U3 | Studio and Quiz lifecycle states; no resumable attempt | WP07-T03, WP07-T04 |
| U4 | Admins cannot watch the corpus without SQL before WP08 | WP03-T37 source timeline and review view |
| U5 | Default English Auth emails; two-device flow; no signed-out help | WP04-T17 templates, WP11-T02 help route |
| U6 | Batch Leader link states and admin link screen undesigned | WP03-T38 |
| U7 | New copy has no writer or reviewer; shipped copy assumes open decisions | §6.6 copy rule; WP03-T35 and WP06-T05 copy steps; Arabic register question (§17) |
| U8 | Frontend floor not stated outside WP03 | §6.6 |
| U9 | Nothing keeps the synthetic demo in step | Implementation rule 20 |
| U10 | Product decisions hidden in tasks (visible streaming, trust measure, stale artifacts, CAPTCHA provider, deletion and export rules, link-user terms, personal-data warning) | A founder question inside each task; §17 item 8 |

## E. Master plan

Sixteen findings, two of them blockers (no environment for real sources before go-live; D-28's deadline absent from the plan). They are written as [proposed amendments](master-plan-amendments.md) A1 to A16 for founder approval. The one direct edit is to a row this revision itself introduced: the D-25 placeholder wrongly said memberships exist in seed data; they exist only in synthetic test fixtures.

## F. Founder input now on the critical path

Runbook §17 lists it in order. The new items from this round:

1. Which academic term the beta targets.
2. The WP03-T37 rights questions.
3. The accepted source formats.
4. Whether answers visibly stream.
5. The trust measure.
6. Stale-artifact behaviour.
7. The CAPTCHA provider.
8. Account-deletion and export rules.
9. The Arabic register for interface copy.
10. Which project serves the public domain.
11. The operating roles.
12. The load-test target.
13. Approval of the master-plan amendments, A1 and A2 first.

## Proof

- **Task headings and states.** No task heading from `main` was lost and the 63 done tasks are unchanged. Six status changes against `main`, all intended: WP00-T03, WP04-T01, WP09-T01, WP10-T01 and WP10-T02 are now blocked by an explicit gate, and WP03-T13 waits on Ahmed.
- **Dependencies.** The audit of 162 tasks found no unknown or forward dependency.
- **Next task.** `pnpm agent:status` recommends WP00-T05.
- **Checks.** Agent lint, `pnpm check` and the diff review results are in the PR.
