# Premium public landing candidate — 3 October 2026

WP03-T10 remains **in progress**. This evidence covers Ahmed's requested landing correction at implementation commit **3f841ed**, prepared on `codex/premium-landing` from clean main **7f88ff8**, which contains delivered WP03-T09 `f107e41` and its verified closure. It proves the focused local candidate; it does not prove the complete frontend mock review gate, founder acceptance, CI, merge or production delivery. Subsequent task/evidence commits are nonvisual. Compare the landing branch with 7f88ff8 to exclude the pre-existing WP03-T09 closure changes.

## Scope and direction

Ahmed requested a premium, creative landing with modern animation and optional 3D, then answered "Use your strongest creative direction." The implementation amplifies the supplied Open Folio identity with an open study folio made from real CSS3D planes, large Manrope typography, neutral chrome, blue fields and an interactive sample workspace. It preserves the supplied logo and exact English slogan, Arabic typography/direction, paired themes, and real account destinations.

Only the public landing adapter, its local presentation components and focused tests change. No package, domain rule, authentication gate, persistence, provider, telemetry, paid capacity or private material changes. The root's existing server routing is unchanged. Sample Chat, Studio and Quiz demonstrate local evidence disclosure, flashcard reversal and answer feedback; the visible boundary says that the preview generates and saves nothing. Professor insight stays in the same knowledge pool.

DESIGN.md records the scoped marketing display, material and motion exception. The surface brief records THESIS, OWN-WORLD, STORY, FIRST VIEWPORT and FORM. The standing D-22 authorization does not establish acceptance of this rendered material revision.

## Focused rejecting proof

| Check                                                                                                                            | Result and coverage                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UNIMIND_E2E_USE_WEBPACK=1 corepack pnpm exec playwright test tests/e2e/foundation.spec.ts tests/e2e/landing-experience.spec.ts` | **PASS: 8/8, 55.9s**, on the final UI sources. Anonymous landing and read-only health; expand/collapse folio; disclose/close evidence; roving tabs with Home/End and RTL arrows; flip card; incorrect/correct quiz feedback; real registration links; no external requests. |
| EN/AR × light/dark responsive checks                                                                                             | **PASS** at 1440, 768, 390 and 320px; no document horizontal overflow; correct direction; 200% text preserves controls and unclipped destinations.                                                                                                                          |
| Accessibility and reduced motion                                                                                                 | **PASS**: Axe WCAG 2/2.1 A/AA has no violations in the four locale/theme cases; keyboard tabs work; decorative subtree animations are absent with reduced motion. This is automated coverage, not a platform-wide WCAG certification.                                       |
| Server response                                                                                                                  | **PASS**: anonymous response contains slogan, h1 and real account link. No no-JavaScript rendered-experience claim: the existing shared Next streaming loading boundary needs JavaScript to replace its fallback.                                                           |
| `corepack pnpm typecheck:fresh`                                                                                                  | **PASS**.                                                                                                                                                                                                                                                                   |
| `corepack pnpm exec eslint . --max-warnings=0 --ignore-pattern '.local/**'`                                                      | **PASS**, whole repository source excluding the already ignored local cache.                                                                                                                                                                                                |
| `corepack pnpm lint`                                                                                                             | **FAIL outside candidate scope**: existing archived generated TypeScript under ignored `.local` produced 681 errors and 312 warnings. Those files were preserved. Standard lint is not reported as green.                                                                   |
| `corepack pnpm check:boundaries`                                                                                                 | **PASS**.                                                                                                                                                                                                                                                                   |
| `corepack pnpm scan:secrets`                                                                                                     | **PASS**; 2868 files in the implementation-stage scan. Final changed-file scan is recorded below.                                                                                                                                                                           |
| `corepack pnpm test:env-build`                                                                                                   | **PASS** on final UI sources: Next 16.3.6 optimized build, TypeScript, all static pages and client-artifact secret scan. Safe synthetic environment; providers disabled and budget zero.                                                                                    |
| Changed-file Prettier                                                                                                            | **PASS** before final evidence update; final pass recorded below.                                                                                                                                                                                                           |
| Impeccable detector                                                                                                              | **PASS**: one pass returned `[]`. No second detector pass.                                                                                                                                                                                                                  |
| Agent readiness                                                                                                                  | **PASS** before final evidence update: 492 names, 158 links, 23 synchronized decisions, 113 task contracts. Final pass recorded below.                                                                                                                                      |

Earlier rejecting checks exposed incorrectly folded page planes, phone navigation specificity and enlarged Arabic tab overflow. One correction batch fixed these before the final build and 8-test run. A no-JavaScript experiment exposed the unchanged shared streaming loader; the assertion was narrowed to actual server-delivered content rather than falsely passing the loader. Test startup initially conflicted with an owned local dev server, then exceeded the default Turbopack startup wait; tests were rerun with the repository's existing webpack option after stopping the demo. None of those failed or interrupted attempts is counted as passing proof.

## Rendered evidence

Reviewed the current synthetic-only local landing at `http://127.0.0.1:3101/?lang=en` and `?lang=ar` using the Codex in-app browser. The local demo runs mock-only with invalid synthetic endpoints, telemetry off, zero approved budget and all generation providers disabled. The focused real-mode fixture tests also show the same shared Landing with demo mode absent.

Captures are local ignored review artifacts in `.local/premium-landing-review/`, not new product assets. Previous tracked `.impeccable/review/desktop.png` and `mobile.png` were restored after an initial capture destination collision; historical evidence is preserved. Final captures were opened and inspected. This is the bounded second confirmation round; no additional polish loop was run.

| Capture          | What it proves                                                                                               | SHA-256                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `desktop.png`    | EN light, 1440×1000 browser override, full landing; 1430px captured document width after scrollbar.          | `545856128ded5d5f763bef5632e12bb3710853b58cc8179dd2fbcdd09ee30fb8` |
| `mobile.png`     | EN light, 390×844 override, full landing; 380px captured document width.                                     | `2220452b5296aff62109efd8429b793236816c8bd02c660677f803e1e67e55c1` |
| `user-1280.png`  | EN light, default user 1280×720 viewport, top of page with whole hero and layer action.                      | `38cfa8abff873ed9506517b78e7b06a6ad71403f7fd95c085e017a26ad213953` |
| `ar-desktop.png` | AR light, 1440×1000 top viewport; exact slogan remains English per brand guide and other content is RTL.     | `966baa132c52f8c2cc8143b979e59860b92769e88c6e3ab7393ccc43e9027d72` |
| `ar-mobile.png`  | AR light, 390×844 top viewport; header, description, real primary action, book and layer action are visible. | `e0c88c3d3b98d9e48faaa9dd2a0e669f9ff360adb468829204a81b38c9413ffb` |

The browser's stitched RTL full-page capture shifted its first tile despite correct DOM bounds. That malformed capture was rejected and replaced by valid top-viewport captures. The temporary default-width capture also inherited the full-page capture's ending scroll position and was rejected, then recaptured in a fresh tab at document top. No malformed image is relied on as proof. Arabic lower-page reflow, both themes, 200% text and keyboard states are covered by the focused automated checks; dark-theme visual founder review is not claimed.

## Inline finish review

Executor performed this pass inline because the execution envelope allocated zero workers; this is **not independent review**. No separate QUALITY BAR card or decision comp was supplied for the incumbent-world extension. No approved comp or new-world concept-roll fidelity is claimed. The review uses the supplied identity, DESIGN.md, PRODUCT.md, surface contract, source, valid captures and craft floor.

```text
disposition: ship

persistence
PASS: PRODUCT.md and prior DESIGN.md exist; DESIGN records the implemented marketing exception; surface contract is persisted. No comp round or unrecorded approved pick exists in this task. Captures show the claimed top/full-page views and current source.

fidelity
TYPE — match: supplied Manrope/Noto Sans Arabic, exact English slogan, display hierarchy and neutral Arabic tracking. Mobile reflow is an adaptation required by accessibility and the surface brief.
MATERIAL — match: independent folded book planes, paper source sheets, blue cover, directional shadows and connected diagrams; physical depth is rendered and responds to a real control. No imitation raster or absent promised asset.
GROUND — match: incumbent neutral paired theme tokens and scoped white paper/blue fields; no invented cream or ornamental background gradient.
FIRST VIEWPORT — match: readable slogan, real registration action, recognizable open folio and visible expansion control. Locale reversal preserves reading order.
STORY — match: material to understanding, local workspace trial, evidence connection, three sequential entry steps, closing account action. Sample boundaries remain beside the demo.
MOTION — match: one assembly and explicit state transitions; pointer work has bounded scheduling and cleanup; reduced-motion states remain available immediately.

ceiling
Separate native-world quality-bar card absent. Established identity is expressed through scale, spatial depth and working interactions. This supports a finished review candidate, not an objectively proven “best landing page” claim. No unused device is required by product truth or the scoped contract.

material_fixes
NONE: the previously observed folded-page, mobile-nav and Arabic enlarged-tab defects are resolved by the final source and focused proof. Founder design acceptance and the remaining full gate are still open workflow obligations.

keep
Preserve the open-folio geometry, exact brand typography/slogan, generous spacing, single authored motion moment and truthful working preview.
```

The finish disposition means technically prepared for founder presentation. It is not a human acceptance receipt or authorization to bypass guarded verification.

## Source binding

| Candidate input                              | SHA-256                                                            |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `src/app/_components/landing.tsx`            | `a157c2741dafced9b2c007bb7e1342e776053d31bea79186f1b7827ebdbb0295` |
| `src/app/_components/landing-experience.tsx` | `6476152deeb33894e73fb88f380eec3749f1c78af9feb966c263e302b1612391` |
| `src/app/_components/landing-icons.tsx`      | `8c8f018b6956075a336b7c60512b3226799fa4a493d2b4fad9b266b1b6a7d24e` |
| `src/app/_components/landing.module.css`     | `795aadebc2a02f99d6526ea2f5178243f7fde28f92f074aa2fd956eb60107c7f` |
| `tests/e2e/landing-experience.spec.ts`       | `a68670d63f537c6d553848e720630fad76c3ee7131e486e7c058ee9545d5c040` |

These are working-source SHA-256 values, not commit identifiers. UI-source changes invalidate the corresponding focused/build/rendered evidence and any future founder receipt. The source candidate is 3f841ed; the full presented candidate also includes this evidence file's introducing commit on `codex/premium-landing`.

## Delivery boundary and recovery

**Design disposition: MATERIAL. Founder acceptance: PENDING. Preparation review: COMPLETE_INLINE. Findings: NONE. Preparation fingerprint: NOT_READY.** The actual-diff router classified docs/frontend/tooling, R1, short planning, zero workers and returned HUMAN_DESIGN_ACCEPTANCE_REQUIRED. It predicted application CI RUN and audit/database skip; no CI run or protected mutation is claimed.

Guarded `pnpm verify`, complete WP03-T10 role/journey/state coverage, exact-head required CI, protected merge and affected production proof have not run. They remain open after acceptance; landing-only proof cannot close that task. No public deployment was changed.

After Ahmed or Ziad accepts the rendered candidate, record the founder-authored reference, actor, UTC time, accepted commit and `routes:/; surfaces:public landing; states:EN/AR, responsive, folio collapsed/expanded, sample Chat/Studio/Quiz, reduced motion` scope in the established receipt format. Complete the full gate, run proof preflight, then follow the guarded delivery workflow. A further material UI change requires a new acceptance.

Rollback: revert the task-scoped landing correction commit. Local preview: `UNIMIND_E2E_USE_WEBPACK=1 corepack pnpm demo`, then open `http://127.0.0.1:3101/?lang=en`. Capture files stay local and can be regenerated without providers. The owned preview remains running for founder review; temporary viewport overrides are reset at handoff.

## Final repository review

Final changed-source ESLint **PASS**; final repository secret scan **PASS, 2869 files**; `git diff --check` and staged diff check **PASS**. The initial final-readiness run rejected the new evidence filename because it lacked the required commit suffix; it was renamed to this source-commit-bound filename, without changing UI or weakening the naming check. Source/markup, CSS, local interactions, tests and documentation were reviewed in full; no generated image, secret, private source, signed URL or remote payload is part of the candidate. The dev-only `next-env.d.ts` rewrite was restored to its initial tracked production imports before the candidate commit. The full final change is 10 task-scoped files. Final matched-file formatting **PASS** (task/evidence explicitly checked with `.gitignore` because repository Prettier normally excludes documentation; the runbook's single-line edit was reviewed directly). Final readiness **PASS: 493 names, 158 links, 23 synchronized decisions, 113 task contracts**. All completed checks exit 0 except the explicitly recorded standard-lint failure and rejected attempts above.
