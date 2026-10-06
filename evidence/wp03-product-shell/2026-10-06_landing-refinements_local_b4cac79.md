# WP03-T12 local landing review

Date: 6 October 2026. Executor: Codex `/root`; speaker/checkpoint: Ahmed. No delegation or independent review is claimed.

Branch: `codex/frontend-refinements`, created from clean main `b4cac79cd6a306e5d011e2d69f916c8c17dc6007`. The filename SHA identifies that starting commit; the reviewed source is bound by the hashes below. Ahmed approved the presented candidate and requested a local commit. No push, PR creation, merge, deployment, provider request or account/project mutation was performed. Ahmed's explicit instruction is required for each external delivery action; AGENTS.md points continuing agents to the controlled task record.

## Copy audit

All English/Arabic text in Landing and WorkspacePreview, including decorative folio labels and inactive tabs, was reviewed. The exact approved English slogan, brand, functional tool names, necessary sample disclosures and educational-safety footer remain.

| Region | Finding | Result |
| --- | --- | --- |
| Hero description/note | Vague clarity claim and repeated “Built around / Designed around” formula | Names questions, source checking, study aids, quizzes and approved material |
| Hero secondary link | Vague exploration | “Try the workspace” names the working sample |
| Folio | “Bigger picture,” “Go one layer deeper,” “Connected understanding” and an unnecessary interaction prompt | Literal course topics, study notes, source passage and study tools; layer control removed |
| Principle strip | Abstract “From information to understanding” and repeated “One…” framing | Course material supports checkable answers; Chat and Studio share sources |
| Experience heading/body | “Everything connects / Understanding follows” and “losing the thread” | Describes studying from course material and trying the tools |
| Sample Materials | Generic “core concepts / detail behind them” | Names anatomy/physiology, structure/function and class discussion |
| Chat sample | Metaphorical connections without an actual study example | A fixed anatomy/physiology question, answer and matching invented source passage |
| Studio sample | “Make it your own” and “new angle” slogans | Describes actual study aids; working flashcard uses the same passage |
| Quiz sample | “Find what sticks / Turn understanding into practice” | A question about the same subject with direct correct/incorrect feedback |
| Evidence section | “A little less… a lot more…” and “only the beginning” framing | Describes opening the supporting passage and source insufficiency |
| How it works | “Find your focus / Then go further” and abstract academic-context language | Program/year/term selection, opening a subject, source checking and practice |
| Closing account action | “Make room for your next idea” and another clarity slogan | Invites the student to open the next subject and states the account prerequisite |
| Navigation/footer/disclosures | Action names, scope limits and safety information are already specific | Retained; Arabic changes follow the revised English meaning |

The sample is invented educational demonstration content, not an uploaded course source or generated answer. No outside-knowledge branch, tool capability, student access or evidence guarantee is added to the runtime.

## Presentation and motion

The supplied identity, exact slogan, fonts, paired palette and account routes remain. Experience now uses an explicit heading/body grid, roomier controls and reading surface, and one concrete example across its tools. How it works pairs an introduction/account action with larger sequential numerals and divided, aligned rows; ornamental row arrows are removed. Mobile retains a compact source row, wrapping tabs and a vertical entry sequence.

The decorative folio and three source layers use a slow 16-second CSS drift. There is no pointer listener, layer state, button or animation-frame loop. Intersection/visibility/media-preference listeners only pause/resume the CSS motion and are cleaned up on unmount. Reduced motion disables animation/transitions and renders the same static composition.

## Focused preparatory proof

| Command/proof | Result |
| --- | --- |
| `corepack pnpm exec playwright test tests/e2e/landing-experience.spec.ts` | Exit 0; 7/7 passed, zero retries; initial 1.5-minute pass, final 57.7-second pass after the description correction with the supported webpack option |
| EN/AR × Light/Dark accessibility and reflow | Zero axe WCAG A/AA violations; 1440/768/390/320px and 200% text; no clipped interactive controls |
| Preview behavior | Roving keyboard tabs, evidence open/close, flashcard flip, incorrect/correct quiz feedback and account links pass; zero external requests in the local-control test |
| Passive motion | Transform changes without input; frozen animation ignores pointer movement; offscreen/hidden state pauses; reduced-motion changes stop all folio animations |
| Server response | Heading, exact slogan and account link remain server-rendered |
| `corepack pnpm lint` | Exit 0; final corrected Landing file also passes focused ESLint |
| `corepack pnpm typecheck` | Exit 0 |
| `corepack pnpm typecheck:fresh` | Exit 0 after the test-only deletion typing correction |
| `corepack pnpm check:boundaries` | Exit 0 |
| `corepack pnpm scan:secrets` | Exit 0; 3182 files at that run |
| Agent readiness | Exit 0; final report 794 names, 344 local links, 23 decisions, 115 task contracts |
| Impeccable detector | One run, exit 0; no findings |
| Diff review | Full tracked diff inspected in bounded ranges; whitespace, changed-file secret and scope checks clean; only landing presentation, its test and controlled documentation changed |

The document-hidden case is a deterministic lifecycle signal simulation; no claim of measuring OS power or browser scheduling is made. Passing desktop/mobile/theme checks are not platform-wide WCAG certification.

In-app rendered review covered English desktop/full page and mobile, Arabic mobile/desktop viewport, and the two named desktop sections. Primary/control/copy layout and source-to-answer hierarchy were reviewed. Light was inspected manually; both themes were covered by automated accessibility/reflow. Captures are local review artifacts in `.local/wp03-t12/review/`: `desktop-en.png`, `mobile-en.png`, `desktop-ar-hero.png`, `experience.png`, `how-it-works.png`. These captures precede the final description-only correction; How it works is unchanged and still represents the final section. The final experience wording was confirmed through the live DOM and complete test replay; its screenshot refresh was unavailable because the browser URL policy blocked the stopped-server data error page. That limit is not a layout PASS. Some immediate-after-resize and Arabic full-page screenshots clipped the upper raster despite correct live geometry; they are excluded as layout evidence. Settled viewport capture and measured section/heading rectangles confirmed the live RTL presentation. Small decorative folio overhang is clipped at the viewport edge; content and controls remain in bounds.

Final semantic review changed “ask a question below” to “read a sample answer,” accurately describing the fixed demo. The complete focused landing suite was replayed for its changed wrapping and passed. The unchanged component structure, types and module seams retain their earlier proof; final file ESLint/formatting and rendered confirmation cover the literal-text correction.

## Failure history and limits

- The first Playwright attempt exited 1 before any test because the task's demo and test dev servers competed for the same Next development lock. They were subsequently run sequentially.
- The first fresh type check failed on a test-only `delete document.hidden` expression; `Reflect.deleteProperty` corrected it and the subsequent fresh check passed.
- The first readiness run failed because no runbook step had been marked complete while the task record was in progress. The implemented steps were recorded accurately and the next run passed.
- A final readiness run rejected the initial evidence filename because it lacked the required short-SHA suffix. The report was renamed to identify the starting main commit without claiming the uncommitted candidate is that commit.
- During approval closeout, readiness caught the runbook marked complete while the task record still awaited the authorized local commit. The last runbook step now includes that commit and remains open until its binding is persisted; the following readiness check passed.
- The initial Turbopack demo had a slow compilation/proxy interruption when stopped. The final review launcher uses the existing supported webpack option and serves synthetic material on loopback. Initial browser navigation/evaluation timed out; the existing tab recovered through its documented DOM API after compilation.
- At presentation, full guarded `pnpm verify`, exact-head CI, founder acceptance and production proof were not claimed. Ahmed subsequently accepted the candidate below. Broad verification, CI and production proof remain unperformed; delivery additionally requires his explicit instruction. The preparation fingerprint remains NOT_READY, with no delivery-readiness claim.
- The external Chrome shell launch was rejected by automatic approval review as blocked by policy. It was not retried. The existing in-app preview was retained as a deliverable and the direct loopback link remains available.

## Source binding

SHA-256 of the verified local source bytes:

| Path | SHA-256 |
| --- | --- |
| `src/app/_components/landing.tsx` | `392546cec2e7b4bd2a847f6f7b2468f200d3296647d226ef232a23a297b2f1ac` |
| `src/app/_components/landing-experience.tsx` | `306b00e3d606c5f2950db8e3bc253cbc60312fd09c779e3b7a68959c20963b70` |
| `src/app/_components/landing.module.css` | `05adbbf7844192c6cc0ed0772e3a51c94b182fc18ff513e6a54acbb00e8d2f90` |
| `tests/e2e/landing-experience.spec.ts` | `1fca985257acaa73a8dc494d5da0f2e86ac647e714c2d26aebcacfbc6c936b52` |

Any relevant source/test/input change invalidates affected proof. Historical landing acceptance is retained as provenance only and does not accept this material revision.

## Founder approval and local commit

Actor: Ahmed, the selected speaker. Source: direct reply after the presented local landing candidate and detailed explanation. Recorded observation time: 2026-10-06T14:10:59Z; no client message timestamp was supplied.

> okay I approve commit this to the branch and I will move on to another area of the platform

Scope: `routes:/; surfaces:public landing copy,passive folio,The experience,How it works,sample Chat/Studio/Quiz; states:presented EN/AR,Light/Dark,responsive desktop/mobile,keyboard,source disclosure,flashcard,quiz feedback,reduced motion`.

This records approval of the presented source-bound candidate and authorization to commit it locally. It does not claim that Ahmed independently executed the tests or inspected every state. The four source/test hashes above were rechecked before commit and exactly match the passing focused proof; no implementation changed during closeout. Approval does not authorize push, PR creation/update, merge or deployment. Later platform areas still require his direction.

## Handoff

Local review: `http://127.0.0.1:3101/?lang=en` (Arabic via the language link). Launcher: `$env:UNIMIND_E2E_USE_WEBPACK = '1'; corepack pnpm demo`. The preview is left running for Ahmed's review; a final direct loopback request returned HTTP 200. Native panel opening was queued. If its old tab shows the stopped-server error, use the direct link. To rerun Playwright, stop this task-owned preview first; the repository uses one Next development lock per checkout. Generated `next-env.d.ts` startup drift was restored to the clean baseline and is outside the candidate.

Rollback: restore only this task's changes against starting main in a reviewable follow-up; preserve unrelated work and historical branches/tags. Remain on `codex/frontend-refinements` for approved follow-up work. Persist the authorized local commit, then wait for Ahmed's next area. External delivery remains held.
