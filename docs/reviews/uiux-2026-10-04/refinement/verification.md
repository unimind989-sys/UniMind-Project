# Refinement evidence and verification

Status: **proposal complete; implementation not approved**. This document covers local design artifacts. It does not claim production delivery, live backend verification, full accessibility conformance or measured performance.

## Provenance and coverage

- Original application baseline: `9f7d840ec9353c4c66e6d1e0e771de9acc76d866`; its retained screenshots and source-backed findings remain unchanged.
- Final prototype SHA-256: `f9a7d9a4f4bf75fd9e51eb4660249efce4253a11811647a2e577c35321543ef4`.
- [Concept coverage](concept-coverage.json): **55 unique source-bound browser captures**, each with exact local URL, CSS viewport, theme/locale, state, captured-at timestamp, image pixel dimensions, geometry and scope limit.
- Seven screen families are rendered: Subjects, Chat, Studio, Intake, Decisions, Account and State library. All seven are sampled at 1440×900 English/light, 390×844 English/light, 768×1024 Arabic/dark and 1280×800 Arabic/dark. Additional phone Arabic/dark and populated/feedback states are recorded. This is sampled coverage, not every theme/locale/state permutation.
- [Comparison bindings](comparisons.json): eleven before/after boards plus one six-state board. Original live capture hashes and final proposal capture hashes identify each source. Desktop five matched comparisons, mobile five comparisons and Arabic/dark Account are retained. Mobile Admin’s scroll origin differs and is labeled.
- Fifty-five final frames were visually reviewed in ten contact boards. The earlier `review1-*` frames and first-pass boards are interim proposal-review evidence, not release proof of the final source.
- Browser screenshot pixels are smaller than the requested CSS viewport on this renderer (for example 1430×894 at CSS 1440×900). Native buffers are retained; boards scale full frames proportionally. No frame content was painted over or invented.
- Existing Open Folio assets/Manrope license reused. Noto Arabic subset copied from the existing build; its OFL is included with source attribution in [the design system](design-system.md). Small icons/diagram are authored SVG. No generated bitmap or claimed screenshot video.

## Demonstrated checks

[Interaction checks](interaction-checks.json) record the bounded examples exercised: native modal Escape/focus return; invalid form focuses the title; citation opens page-3 excerpt with source-heading focus; reduced branch removes signature animation; canceled Chat retains the question; native Space changes flashcard face; intake error preserves edited title/rights; receipt remains unavailable to students; Tab/reverse-Tab stays within native modal; last dialog control wraps to Close; keyboard focus shows a 3 px solid outline.

These checks exercised representative local synthetic examples. They do not verify real actor eligibility, command recording, file transfer, persistent sessions, source retrieval or generation. The 1.3/1.6 second local timers are demonstration delays, never measured production latency.

Every final capture recorded zero **root/page horizontal or vertical overflow**. Inner reading/queue/form regions intentionally scroll. This does not mean every region’s entire content fits in one screenshot.

| Initial action                            | Existing live geometry                        | Proposed local geometry | Interpretation                                                                   |
| ----------------------------------------- | --------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------- |
| Chat Send, 1440×900                       | y=940, height 48                              | y=753.41, bottom 797.41 | Entire action now in first viewport, including the extra review toolbar          |
| Chat Send, 390×844                        | y=1251, height 48                             | y≈667, bottom≈711       | Entire action above bottom navigation ending at y=784                            |
| Studio Generate, 1440×900                 | y=950                                         | y=696.56, bottom 740.56 | Initial action is visible rather than following a large empty output             |
| Studio Generate, English 390×844          | Original screen requires scrolling            | bottom 734.38           | Above the y=784 navigation boundary                                              |
| Studio Generate, Arabic 390×844           | No original matched Arabic Studio measurement | bottom 760.86           | Arabic expansion tested; no claimed baseline improvement for an unmeasured state |
| Intake Add sample, English/Arabic 390×844 | No timed baseline or matched coordinate claim | bottom 760.66 / 768.50  | All three request names and the action remain visible before submission          |

Geometry is evidence of placement, not a measurement of task completion time or beauty. Verify numeric values in `concept-coverage.json` rather than rounded text above.

Selected token contrast is separately computed in `token-contrast.json`. Decorative separators are not treated as control borders. No app-wide contrast certification is inferred from token calculations.

## Review findings and limits

The first rendered review found mobile Studio/Intake action placement problems, a false visible no-results notice, small identity-mark treatment and draft/focus/event-binding problems in the proposal. They were corrected before final captures. Intake requirements remain visible on mobile rather than being collapsed to make the action fit. Final administrative concepts retain the real synthetic Anatomy scope and reuse the existing twelve consequence translations.

The one deterministic detector pass **degraded to regex matching** because its static HTML parser dependencies were unavailable. It flagged an infinite horizontal loader as a marquee-like loop. The final source caps that indicator at two passes. The detector was not rerun to obtain a cleaner result; the correction was reviewed in source and browser. Custom-property cascade and computed contrast were not validated by that detector. No dependencies were installed to disguise the limitation.

Still untested: physical mobile keyboard/safe-area behavior, screen readers, zoom/reflow matrix, OS reduced-motion emulation, frame pacing on modest hardware, network throttling, actual LCP/CLS/INP, all six artifact outputs, actual Pending candidates/counts, source-bound multi-exchange behavior, real upload/finalizer retry, persistent role navigation and all 33 families as implemented screens. Dense fixture/helper footnotes need production microtypography review; important operational metadata must meet the proposed readability contract.

The original audit’s inaccessible/unverified platform conditions remain as recorded in [its methodology](../method.md). This refinement does not silently turn them into PASS.

## Artifact and scope checks

Required final artifact checks: extracted prototype script parses; explicit-ignore Prettier; local links/images/assets exist; 55 unique IDs and hashes bind final frames to source; original audit manifest still matches all entries; new artifact manifest matches its included files; repository secret scan; agent-readiness check; full task/documentation scope review and `git diff --check`.

Final command results are retained in [artifact checks](artifact-checks.json). The scope remains documentation, standalone review artifacts and a supplemental task record. No application/config/dependency/database/auth file is changed. No commit, implementation PR, merge, deployment, external invitation or paid-provider action occurs. Runtime test suites and exact-head delivery CI are not claimed for this approval-stage documentation task.

Formatting passes for the refinement artifacts and the new task supplement. A whole-task formatting check also reports pre-existing table alignment in its historical delivery sections. Those sections remain unchanged; the warning is retained rather than rewriting unrelated history or claiming a whole-task formatting pass. The refinement [artifact manifest](artifact-manifest.json) covers files inside this folder and excludes itself.

## Founder preview

The local server binds only `127.0.0.1:3164` and serves the audit folder. The direct review route is [the refinement prototype](http://127.0.0.1:3164/refinement/index.html). Its process is kept running for founder inspection under the repository’s visual-handoff rule; it is not an application deployment. A portable local HTML entry is also included.

The handoff disposition and process identity are recorded in the task supplement. Opening the review, interacting with examples or saying “continue” is not implementation approval.

Automatic approval review rejected the attempted installed-Chrome launch, reporting only “blocked by policy.” No bypass was attempted. The in-app preview is marked deliverable, its viewport override is reset, and the report is queued in Codex; the direct local review link remains available for the founder to open.
