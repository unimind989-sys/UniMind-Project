# Measurements, checks and uncertainty

These are bounded observations, not a performance or WCAG conformance certificate.

| Observation                  | Actual result                                                                                           | Method / limit                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Fresh Chat at 1440×900       | Message textarea top 818 px/height 93 px; Send top 940 px/height 48 px                                  | Read-only bounding rectangles, scroll at top; p15                                                   |
| Fresh Chat at 390×844        | Message top 1068 px/height 93 px; Send top 1251 px/height 48 px                                         | Bounding rectangles, scroll at top; p16                                                             |
| Studio at 1440×900           | Generate top 950 px/height 48 px                                                                        | Initial fixed configuration; p19                                                                    |
| Studio at 768×1024           | Main 574 px wide; Generate top 956 px                                                                   | Rail remains visible; output stacks below controls; p21                                             |
| Leader intake at 768×1024    | Document scrollWidth 758 px at innerWidth 768 px                                                        | No horizontal document overflow observed in this state; p32                                         |
| Student flashcard at 390×844 | Space activates Flip card; focused control has 3 px solid blue outline; no horizontal document overflow | Actual keyboard activation plus DOM; source has aria-hidden on inactive face and polite live region |
| Admin exact-change review    | Focused text: Submit this action                                                                        | Actual DOM after Review exact change; source corroborates effect; p38; never submitted              |
| Admin rail targets 1440×900  | Sample Overview/Content/Academics heights 48 px                                                         | Bounding rectangles; not all targets measured                                                       |
| Admin incident typography    | Intro 16 px, line-height 25.6 px, color#535861; next paragraph 16 px/#202124                            | Computed styles in Light theme; p50                                                                 |
| Synthetic route metadata     | Sign in / UniMind document title remains during incident route                                          | DOM; fixture-specific history navigation; do not generalize to real Next server pages               |
| Error log sample             | No error entries returned in a bounded 100-entry error-level query of the live review tab               | Not historical monitoring; navigation can change retained diagnostic scope                          |

Token contrast spot calculations from the inspected semantic CSS: muted#626873 on white =5.60:1; primary#202124 on white =16.10:1; blue#2458b8 on white =6.64:1; dark muted#a6acb7 on dark surface#232529 =6.73:1. These pairs exceed 4.5:1 for ordinary text. They do not validate every element, translucent disabled state, focus boundary, chart, overlay or dark/RTL screen. No verified contrast failure is added to the issue register.

The practical benchmark is [WCAG 2.2 AA](https://www.w3.org/TR/WCAG 22/): evaluate ordinary text 4.5:1, large text 3:1, applicable UI/non-text contrast 3:1, visible/unobscured focus, labels, status messaging, reflow and keyboard operation. Minimum target size under 2.5.8 is 24 CSSpx with exceptions; UniMind's 44 px interaction floor is a stricter design target, not the wording of the AA requirement.

Reduced motion is corroborated in global CSS, workspace CSS and the landing pointer/animation guards. The actual OS preference was not emulated in this inspection. No LCP, CLS, INP, bundle-transfer timing, network-throttle, frame-rate or latency number was collected. Synthetic generation's one-second source timer is an illustrative mechanism, not a provider latency measurement. Automation selector failures were resolved using refreshed live labels and are not reported as product performance defects.

Still needed after implementation: OS reduced-motion check; keyboard-only complete journeys; NVDA or equivalent screen-reader review; physical mobile keyboard/safe-area behavior; 200% zoom/reflow and 320 CSSpx; RTL long text at all shared seams; stale/error/loading fixtures; actual production-mode service behavior appropriate to the approved scope. No conformance PASS is assigned now.
