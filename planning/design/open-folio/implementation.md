# Open Folio implementation candidate

The approved reference and scope are recorded in [approval](approval.md). This is an implementation record, not a production acceptance claim. Branch: `codex/open-folio-redesign`; baseline: `9f7d840ec9353c4c66e6d1e0e771de9acc76d866`.

## Implemented presentation

- Paired canvas/paper/annotation/spine tokens; 192px desktop and 72px tablet rail; role identity and 144px supplied horizontal brand; three-target student/leader phone navigation and labeled admin menu.
- One direct subject-row link; unit context, compact native switcher and local tool tabs. Interface locale remains independent of output language.
- Bounded Chat, compact session/privacy disclosure, independent transcript, composer and exchange-specific source annotation. Mobile/tablet source review uses a native dialog. Existing evidence/report routes remain available. Unit changes remount local tool state rather than mixing pending work.
- Studio has compact native artifact/topic/output-language controls, secondary Depth/Size disclosure and a separate result plane. All six existing artifact renderers remain; flashcard keyboard behavior is retained.
- Account has local section links and aligned appearance, academic context, privacy and identity sections. Real-mode controls remain limited to existing capabilities.
- Intake exposes every required item, the earlier assignment/campaign deadline and exact secondary dates before file choice; per-file metadata starts expanded. Receipt distinguishes receiving from processing and student availability. Existing upload/finalize/retry identity is unchanged.
- Admin starts unselected, derives filter counts from guarded candidates, searches current action/target labels and provides deliberate phone list/detail navigation. Exact-change review uses native modality and noncommitting heading focus. Actor role, target/revision/reason/consequence and all existing protected predicates are retained.
- Source/result delivery, native dialog entry/exit and control feedback follow the approved bounded motion language. Reduced motion exposes identical states. No animation library or other dependency was added.

The compact Chat session control is placed inside the reading header rather than adding a separate row: the initial implementation collapsed the transcript at shorter laptop heights. The requested-material list stays visible on phones; detailed deadline times use a labeled disclosure so file selection remains reachable. Both are adaptations to actual content and the approved usability requirements, preserving the reference's hierarchy and behavior.

## Functional feedback retained

These runs are feedback, not stable-candidate proof. They used the repository's zero-cost local synthetic service adapter; retained traces in the ignored test-results directory are not publishable audit artifacts.

| Run | Result | Findings and corrections |
| --- | --- | --- |
| Focused 6-case first pass | 0 passed, 6 failed | Cold Next proxy request failed before login; intake chooser below first viewport; collapsed Chat transcript; missing Studio source link; modal focus return; stale Arabic return-label expectation. |
| Focused 6-case second pass | 2 passed, 4 failed | Reading/keyboard and locale/draft workflows passed. Remaining intake height, collapsed transcript, Studio return context and modal focus were corrected. |
| Focused 12-case pass | 8 passed, 4 failed | Seven Chat outcomes, six artifact types, English action geometry/citation binding and both password specimens passed. Arabic Generate position, native focus restoration and an over-specific test field name failed. |
| Focused 4-case correction pass | 4 passed | Arabic action geometry and citation binding; both separate admin selection/review/cancel paths; admin resources/reflow/accessibility. |
| Complete 55-case synthetic feedback | 48 passed, 7 failed (20.7 minutes) | Arabic 320px enlarged-text overflow; Arabic phone chooser 14.875px below its required bound; repeated academic context (both locales); Arabic enlarged-text Chat actions obscured by navigation; closed session disclosure descendants reported undersized in both populated checkpoints. No full-suite PASS. |
| Focused 11-case repair pass | 8 passed, 3 failed (5.4 minutes) | Remaining Arabic chooser clearance, enlarged-text Chat summary minimum and transient Studio text contrast. Corrected the bounded workspace fallback and used translation without text opacity for delivered results/excerpts. |
| Focused 9-case correction pass | 8 passed, 1 failed (3.3 minutes) | Intake in both locales, leader reflow in EN light/AR dark, populated EN/AR checkpoints and study action geometry passed. The remaining full-route Arabic case stopped at consent before reaching its target. |
| Isolated consent diagnosis | Two separate cases passed (20.2s desktop; 20.9s 320px) | Six fresh Arabic routes per case through normal auth fixtures; no refresh events observed. The prior consent failure was not reproduced. Its cause is unproven; no auth patch was made. |
| Focused study correction | 2 passed (21.5s) | EN/AR study actions, four requested widths, citation/session binding, native source modal and enlarged-text session use. |
| Focused full-route/admin correction | 3 passed (2.6 minutes) | Original Arabic responsive route matrix and both independently signed-in admin selection/review/cancel paths. |
| Final four-fix rejection pass | 4 passed (43.9s) | EN/AR phone chooser at 390px and 380px; Admin and Second Admin selection/filter/review/cancel. Fresh typecheck and focused source ESLint also exit 0. |

The bounded finish review found four material presentation defects; [the scoring verdict](finish-verdict.md) resolves those four against the corrected screenshots. The one detector's active-navigation triangle warning was reviewed as a zero-size selected-item notch, not a card stripe. No second detector or third styling hunt was performed.

The Codex app refresh stopped the local server/browser session. Restarted the same zero-cost candidate server and resumed the second capture batch after Ahmed reloaded the stale connection-error page. A transient development consent failure also appeared once during earlier rebuilding; fresh login succeeded. Neither observation establishes a production auth defect or a causal diagnosis.

## Guarded preparation feedback — 5 October

The initial guarded invocation rejected a mixed-line-ending preparation fingerprint before running tests. Restoring consistent task-record line endings corrected the binding; no gate was relaxed. The next guarded run passed formatting, lint, both type checks, boundaries, 28 SQL checks, workflow/policy checks and the secret scan, then stopped at an existing routing-test timeout: 593/594 unit tests passed. Its unchanged isolated rerun passed in 3.75 seconds; the cause remains unproven. No timeout or assertion was weakened.

The second guarded run passed 594 unit, 15 integration (two hosted-only skips), 44 security, three evaluation tests plus the foundation cases, and five load tests plus the zero-cost profile. Its real-mode browser feedback failed seven Admin cases that expected automatic selection, an Overview heading, a review region and immediate submit focus. The candidate deliberately starts unselected and focuses the native review heading. The run was stopped after that feedback; 66 cases were not run. The eight revised Admin cases subsequently passed.

A four-file feedback command accidentally supplied a literal argument separator and ran the complete real-mode suite: **60/74 passed, 14 failed in 13.9 minutes**. This is a failed feedback run, not stable proof. It exposed unnamed complementary landmarks on intake, undersized phone workspace tabs, ambiguous Password field selection after adding Show password, and tests still expecting a separate unit-selection action. The corrections add distinct landmark names, a 44px tab minimum, exact field selectors and separate local missing-password/server-validation proof. Direct-link tests retain keyboard opening, scope, material count, reload/history, locale, search, downstream-context clearing and access-denial checks. Upload metadata tests inspect the initially expanded fields rather than closing them.

The hosted session-isolation failure reproduced in a one-case rerun. Its trace shows a cold protected-route development rebuild followed by document requests to Settings and Login; the fixture's document-local role was gone before sign-out. The focused diagnostic now compiles and checks denial of the same guarded routes before entering the fixture, then retains the second-document denial, original-page sign-out and reload checks. This tests the development-rebuild hypothesis without modifying session, authorization or route guards. The 16-case repair batch passed 15 and failed one newly adapted material-count wording assertion (3.1 minutes). Correcting it to the actual sample-material label retained the count; the original full keyboard/reload/history/context journey then passed alone in 13.4 seconds (34.0 seconds including server setup). No source fix followed. Fresh typecheck, focused ESLint and changed-file formatting exit 0. The warming hypothesis is supported by the passing 33.2-second session journey, but no general production cause or performance claim is inferred.

The late source changes are limited to two accessible landmark names and a minimum workspace-tab width. They do not establish a third cosmetic review round. The 33 native captures retain their actual capture-time provenance; they are visual evidence of the recorded candidate, not new screenshots of later semantic fixes. Final source hashes and functional proof are bound separately. A minimum width can change small-screen tab spacing, so its rejecting reflow/target checks remain required.

## Verification still owed

Guarded complete synthetic and real-mode browser proof, source/secret/boundary/type/format checks, preparation binding, exact-head CI and affected production proof remain. Two bounded finished-candidate capture batches, the one detector, inline review and the four-fix scoring pass are complete. No complete delivery, AA conformance, performance improvement or production success is claimed yet.

No participant study or comparable before/after performance measurement has been conducted. Missing backend capabilities remain missing; presentation does not supply real AI generation, processing history, user management, policy content or provider execution.

Capture-time source hashes are retained in [capture-source-binding.json](capture-source-binding.json). [source-binding.json](source-binding.json) binds the final corrected source and tests; late landmark/target changes and subsequent functional proof are explicitly recorded above.

## Complete local proof and archive packaging

The third guarded invocation exited 0 at unchanged fingerprint `53ba5a34073020f5303ac1ddc3f887352f2dab9c2056916020d9100d4ebaef8c`: 594 unit, 15 integration with two hosted-only skips, 44 security, three evaluation plus foundation cases, five load/profile, 75/75 real-mode browser (9.4 minutes), 55/55 synthetic browser (23.2 minutes), production build and client-secret scan passed. No failed feedback run is relabeled.

The first unpublished commit proceeded after a failed staged-whitespace check; it was not pushed. Packaging is corrected before delivery. Git normalized the original coverage CSV and reported two third-party-license trailing spaces plus an extra blank line in this cycle’s review record. [Exact original bytes](../../../docs/reviews/uiux-2026-10-04/archive-note.md) are preserved in an immutable ZIP, with ordinary Git-readable CSV/license copies and corrected review EOF. Original manifests are checked against archived originals for the three affected entries and canonical Git bytes for every other file. Policy, Git attributes and whitespace gates remain unchanged. The passing guarded application/test source is reused only after its 41 hashes are rechecked; focused packaging/readiness/secret proof and exact-head CI remain required.
