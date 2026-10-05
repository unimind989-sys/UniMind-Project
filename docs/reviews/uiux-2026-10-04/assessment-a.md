# Independent-of-detector design assessment

Assessment A completed before the deterministic detector. One agent, as the user requested; this is not an independent dual-reviewer assessment. Source baseline: `9f7d840ec9353c4c66e6d1e0e771de9acc76d866`. The audit concerns the observed hosted synthetic product and public pages, not an assertion that every production workflow exists.

## Design specificity

The Open Folio landing is more authored than the functional product. Its book/layer metaphor gives UniMind a recognizable entry, but the working screens do not turn the same idea into a coherent reading and evidence experience. Large context blocks, generic bordered panels, repeated explanatory paragraphs, and fixed illustrative resource pages dominate. The problem is task composition and information design more than missing decoration. Neutral paired themes and the approved bilingual font families should be retained.

## Primary observations

1. Chat's initially empty transcript and three stacked navigation levels push Send below the viewport: y=940 at 1440×900; y=1251 at 390×844. The initial mobile message field starts at y=1068. Studio Generate starts at y=950 on desktop. These are DOM geometry observations, not latency measurements.
2. Admin Overview treats 12 available/blocked candidates as one undifferentiated queue. It selects Hide unit automatically. A blocked publication presents Published → Published. The exact-change review focuses Submit this action, verified through source. Preserve the guards and change the presentation and initial focus.
3. Batch Leader intake hides the three requested materials behind a disclosure, then gives the drop area substantial space. Two different deadlines have similar emphasis. Latest submissions and History repeat latest-per-request state; Needs information does not expose a specific corrective action in the observed fixture.
4. Account mixes appearance, academic settings, sharing, unresolved retention, and account controls in one long page. Leader and both Admin accounts show exchange-sharing settings despite their primary jobs being intake/governance. No current role/actor is visible in the shell.
5. Sources, Jobs, Quality, Usage and Incidents look like explanatory templates rather than tools: repeated Context/State plus paragraphs, little object-level information. Some of this is missing PoC capability, which a CSS redesign cannot solve. Users opens cohort access context, not user records.

## Cognitive load and emotional journey

Student: the landing promises one connected workspace; after access, the user chooses five dependent academic fields, then encounters a global Study/Subjects distinction with substantial overlap. In the subject, persistent global navigation, context switching, four local destinations and session controls compete before the first question. Studio exposes six equally weighted output types and four selectors at once. The emotional low is reaching a tool and still needing to scroll to its action. The successful grounded answer is useful, but separate full-page evidence/report detours dilute continuity.

Leader: requested materials, destination and rights declaration are genuine required decisions; the screen gives them less early emphasis than the upload metaphor. Receipt and processing states are distinguishable in text, but corrective next steps are weak.

Admin: no explicit initial choice, repeated target labels and mixed readiness create unnecessary reading. Exact-state review is the right seam to preserve, but review focus should begin with the change summary or Cancel, and the role context should remain visible during study previews.

## Heuristics (judgment, 0–4)

| Heuristic                       | Score | Basis                                                                                             |
| ------------------------------- | ----: | ------------------------------------------------------------------------------------------------- |
| Visibility of system status     |     2 | Text statuses exist; readiness and attention are weakly summarized.                               |
| Match with real-world tasks     |     2 | Useful unit/source vocabulary, but Users/History and technical fixture copy mislead expectations. |
| User control and freedom        |     2 | Cancel and return links exist; preview changes the navigation context.                            |
| Consistency and standards       |     2 | Shared shell/tokens exist; compositions, action hierarchy and error shell diverge.                |
| Error prevention                |     2 | Rights/readiness guards exist; default Hide selection and confirmation focus create pressure.     |
| Recognition rather than recall  |     2 | Labels are explicit; queue scope, deadlines and role context require rereading.                   |
| Flexibility and efficiency      |     1 | No observed queue filtering or distinct history inspection; repeated context consumes space.      |
| Aesthetic and minimalist design |     2 | Restrained themes; generous chrome displaces useful work.                                         |
| Error recovery                  |     2 | Form errors and Cancel exist; needs-information repair and capacity preview are weak.             |
| Help and documentation          |     1 | Explanations repeat policy mechanics; consent versions do not expose readable policy links.       |
| Total                           | 18/40 | Directional judgment, not a benchmark score or conformance result.                                |

## Preserve because evidence supports it

Native labelled controls, global visible focus, clear source qualifiers and the separation of UI locale from study-output language are useful foundations. Flashcard source already hides the inactive face from accessibility APIs and includes reduced-motion handling; do not invent a defect from the DOM snapshot's inclusion of both paragraphs. Existing publication, source-readiness, consent and rights guards must survive redesign.

## Coverage cautions

All four supplied accounts were independently entered and navigated. Sign-out destroys browser fixture state, so cross-account second confirmation was not validated. Timed quiz expiry, actual file upload, external invitation delivery, real provider/capacity failures, policy pages and screen-reader behavior were not completed. The no-match search transition was only partially inspected and cannot support a definitive empty-state defect. Early screenshot frames were discarded because they caught transitions; only the retained settled proof images support visual comparisons.
