# Open Folio acceptance evidence

The human-approved reference is bound in [approval.md](approval.md). This matrix separates implemented presentation and existing functional behavior from capabilities and measurements this frontend cycle cannot establish. Complete regression and delivery proof remain required; focused feedback alone is not a release PASS.

## Visual criteria

| Criterion | Candidate evidence | Practical limit |
| --- | --- | --- |
| V01 — shared named roles | globals.css paired tokens; AppShell, frontend-controls, ProductDialog, AccountLayout, Notice/Status and shared product CSS; full changed-source review | Existing artifact-specific renderers remain distinct. This is consolidation through shared seams, not replacement of every component. |
| V02 — distinct task compositions | [Five-screen comparison](index.html): ruled subject index, bounded reading/annotation, configuration/result, intake/deadline, decision queue/paper | Inline qualitative fidelity review and four-fix scoring pass. Ahmed approved the reference; no claim of a new founder beauty score or independent reviewer. |
| V03 — typography and density | Same initial desktop content; phone shelf/intake, laptop Chat, tablet Arabic dark shelf; real Manrope/Noto Sans Arabic loaded; EN/AR responsive and enlarged-text browser tests | Not every family has screenshots for all 16 locale/theme/viewport combinations. Automated route matrices broaden coverage; no physical zoom/device reading study. |
| V04 — equal treatment of ordinary screens | Account, Materials, blank/invalid sign-in, history and admin empty/blocked/review captures; shared field/notice/dialog CSS | Landing is preserved at its earlier accepted design. Unavailable policy/resource capabilities are not invented to fill an empty screen. |
| V05 — recognizable unmirrored brand | Supplied 144px desktop brand, role spine, exact two-line slogan, folio index and source annotation; directional SVG transform only; EN light/AR dark samples | Identity is role-level from existing approved inputs, not a new authenticated actor-data seam. |

## Interaction criteria

| Criterion | Rejecting proof / source seam | Limit or adaptation |
| --- | --- | --- |
| X01 — reachable primary study actions | open folio EN/AR study geometry at 1440×900, 1280×800, 768×1024 and 390×844; explicit 200% text reflow fallback | Physical keyboard, browser zoom and safe-area devices remain untested. Short-height fallback scrolls rather than clipping. |
| X02 — canonical subject / truthful resume | study-shelf direct Link; existing lastStudyPath conditional; normal academic/session navigation tests | Five initial subjects in desktop comparison; tablet resume specimen represents actual local fixture state, not invented progress. |
| X03 — exact citation continuity | EN/AR supported/conflict exchange 1/2 and session 1 link assertions; native source dialog heading focus/Escape/return; evidence/report fallback retained | This proves existing authorized synthetic bindings and real route guards, not production RAG generation. |
| X04 — independent output language | Six existing artifact tests; locale-preserved drafts/interruption; Arabic-dark interface with English result; header binds rendered artifact.language | No new generator/provider or format semantics. |
| X05 — effective deadline / requests | Existing assignment/campaign minimum; all three request names open; per-file mapping tests; initial intake capture; chooser rejection at 390/380px in EN/AR | Deadline uses existing semantics and Cairo display. Exact secondary times use disclosure. |
| X06 — truthful receipt / idempotent retry | Existing native file/reference tracking, mixed types, private-byte rejection, cancel/retry tests; receipt uses Received, awaiting processing, not student-ready | Latest-submission screenshot is not receipt-stage proof. Durable processing/history remains outside this presentation cycle. |
| X07 — deliberate derived queue | Admin and Second Admin separately sign in; no initial reason input; local filter selects Hide unit; All/Available/Blocked/Pending derived from existing states | Existing protected predicates are unchanged. Pending reload and all twelve examples remain covered by their original tests. |
| X08 — exact noncommitting review | Native modal focuses heading; target/current/proposed/version/readiness/reason/consequence remain; Escape returns Review exact change; stale/readiness/second-confirmation tests | No source/data/authorization or protected-action semantics changed. |
| X09 — honest recovery | Missing reviewer reason explicitly unavailable; assigned campaign and existing upload actions remain; prepared leader failure tests | A real supplied reason, directory, contact workflow or durable resubmission history needs a separately approved data capability. |
| X10 — modal and route context | ProductDialog native modality/inertness, Escape and return tests; meaningful synthetic document title; locale-preserved brand home; existing real-mode auth route tests | No screen-reader output assessment; ordinary server metadata is not inferred from synthetic title updates. |
| X11 — durable field/status feedback | Blank password focus/aria-invalid/description in EN/AR; existing registration/recovery tests; status/notice live semantics; loading/cancel/draft checkpoints | No full WCAG certification. The complete gate must retain all existing form assertions. |
| X12 — role/locale/context continuity | Four independent role journeys in local browser evidence; original sign-out/role isolation, account/theme/locale, invitation and preview tests | Browser captures are synthetic; missing backend capabilities stay unavailable. |
| X13 — purposeful interruptible motion | 120ms controls; 180/140ms native dialog; 280ms result/300ms excerpt translation; 240ms keyboard flashcard; finite loading cue; canceled Chat/Studio no late result; reduced-motion assertions | Timers simulate feedback, not performance gains. Hardware compositor/profile comparison not measured. |
| X14 — usable controls and focus | 44px primary touch targets; original Axe route/populated checks; enlarged-text/reflow; keyboard source/review/flashcard/password tests | Automated sampled AA checks do not prove all WCAG 2.2 AA criteria, assistive technology or physical touch use. |

## Original issue coverage

All 45 original IDs and observations remain intact in the [audit register](../../../docs/reviews/uiux-2026-10-04/issue-register.md). The implementation uses shared changes; it does not label every original recommendation fully solved.

| IDs | Disposition in this cycle |
| --- | --- |
| U01–U07, U11–U12, U16–U20, U24, U27–U30, U33, U37–U38, U42, U44–U45 | Changed frontend composition, navigation, inputs and interaction. Refer to criterion/test/capture mapping above; stable whole-suite proof remains required. |
| U08–U09, U13–U14, U23, U32, U34–U35, U43 | Presentation clarified through truthful capability labels, role/context, current counts, local sections and secondary explanations. No new user directory, supplied reviewer reason, durable revision history, actor identity or operational data. History navigation remains an existing route; its page explicitly says Latest submissions and latest-per-request. |
| U10, U39 | Existing admin preview/return behavior and guards retained; no new exact quality record/exchange seam. A real source-quality deep link remains capability-limited. |
| U15, U31 | Branded 404 and finite pending treatment improved through existing page seams. U31's original lazy hosted fallback risk was not reproduced/timed, so it is not claimed eliminated by styling a different loading surface. |
| U21–U22, U25–U26, U36, U40 | Shared reading/type/status/notice/controls/motion apply; existing six artifact and Quiz semantics retained. No generic output-format rewrite or new explanation data. |
| U41 | Existing accepted public landing preserved. A new marketing/access-story revision was not smuggled into this reference-led app cycle. |

## Unmeasured outcomes

No participant recruitment, timing baseline, LCP/CLS/INP comparison, hardware keyboard/safe-area trial or screen-reader study was performed. No external messages were sent. Success means demonstrable shared design and preserved tested behaviors; a stronger design score, lower completion time or complete accessibility conformance needs its own evidence.
