# B03 quiz batch completion — local evidence

WP03-T13, 13 October 2026. Branch `codex/frontend-refinements`, unchanged base HEAD `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`. Scope: M30/M31/M32/M33. Ahmed's completed all-findings review and continuation authorize local repairs. Commit and external delivery remain held.

All six B03 quiz findings are now **LOCALLY_COMPLETE**. B01/B02 retain their earlier proof. Overall: **15/75 merged findings locally complete, 60 remaining; 3/12 implementation batches complete**, followed by B13 final verification. Counts measure the checklist, not effort. WP03-T13 remains IN_PROGRESS; the whole frontend remains MATERIAL/PENDING/NOT_READY.

| Finding | Result           | Practical change                                                                                                                                                        |
| ------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M30     | Locally complete | Completed and expired attempts open one exact keyed review. No review self-link or duplicate setup entry remains.                                                       |
| M31     | Locally complete | Each unit retains its setup in the current document. Repeat this setup starts a fresh attempt with the same difficulty, count and timing. Defaults reset only the form. |
| M32     | Locally complete | Questions are numbered. Answered/total and unanswered counts, plus remaining question numbers beside submission, explain what to finish.                                |
| M33     | Locally complete | Count and timed-duration errors identify their own fields. Untimed mode ignores duration.                                                                               |

The preceding M27/M28 proof covers frozen, unscored expired answers and explicit corrections. This batch rechecks those behaviors and their Sources/Settings returns.

Implementation uses the existing product provider and quiz fixture application. Only the parent Study component normalizes terminal aliases, after checking the current unit/object/key. A repeat captures the immutable attempt configuration, creates a separate key/answers/deadline, and rejects stale state replacement. Editing setup cannot alter an attempt. Both existing sign-out paths clear the new draft field; setup reads the draft or defaults, with no fallback that revives an older attempt's setup. Count validation accepts integers 1–6; timed duration accepts integers 1–240. Existing controls expose nearby error messages with `aria-invalid`/`aria-describedby`; progress uses a polite live paragraph while the score keeps its existing status landmark.

Focused proof passes:

- **24 distinct native browser cases:** four new combined EN/AR journeys, twelve previous correction/expiry cases, and eight previous source-return cases. The candidate matrix passed 22. Its two new sign-out tails incorrectly expected Quiz immediately after consent; the real flow opens fresh academic setup. After following the existing five choices, Study Shelf, Subjects and Anatomy in the same document, both corrected cases pass. No inherited assertion was removed; the other 22 bodies and application inputs are unchanged.
- **9 standard-runtime browser cases:** new EN/AR quiz flows, previous expiry/Sources/Settings returns, and existing sign-out/reload/new-document memory isolation. Synthetic services use mock providers and zero approved budget; no real Auth/provider/storage request is inferred.
- **117 unit cases:** nine new field-validation cases and 108 retained quiz/origin cases. Count and timed duration boundaries, decimals, empty/NaN values, both errors and irrelevant untimed duration are covered.
- **Eleven-input independent read-only review:** clean at exact hashes. Two review concerns were corrected: draft lifetime on sign-out, and duplicate progress/score status matching. Guide copies and ZIP parity were reviewed too.
- Both languages and themes; 1440/390/320px layouts; doubled text on setup; keyboard repeat/returns; affected-main Axe. Bounded actual browser inspection retained bilingual page text and screenshots. This is not screen-reader certification.

Normal/fresh TypeScript, affected ESLint and module boundaries pass. Final formatting, secret scan, repository readiness, diff integrity, preserved-file hashes and restored demo availability are recorded in the adjacent source binding. Broader delivery CI and whole-design/production acceptance are held, not reported as passed.

Retained executor artifacts are under `E:/Unimind audits/flow audit/Merged/repairs/B03-finish/`: candidate/final JSON and logs, screenshots, initial failed navigation assumptions, the pnpm launch failure, independent review, baseline/before copies, incremental diff, ZIP parity and final verification. A system pnpm wrapper initially selected the wrong version and aborted before running tests; pinned `corepack pnpm` 10.34.5 ran the successful proof. Failed attempts remain visible and are not counted.

Guide, public README and walkthrough match. Exactly README/walkthrough changed inside the nine-member ZIP; the other seven members, JSON fixtures and generator are unchanged. All 172 previous repository evidence files, six frozen merged-report hashes and Ahmed's approval export remain exact. The earlier bound review receipt remains exact; an additional metadata clarification lives separately and is not substituted into its old binding.

This slice is OBJECTIVE_PRESERVING under existing DESIGN native quiz controls, context and the approved B03 choices. No CSS, source pool, per-question citation, durable history, real grading, backend identity, storage, provider or permission change. Policy v10 conservatively retains whole R3/protected planning, one read-only worker maximum/used, no nesting. Manual Sol High assignment is retained, not a Desktop model certification.

Next is approved **B04: uploads and recovery**, five findings. Rollback restores only this batch's fourteen exact before copies and removes its two new evidence files. Original task/runbook prefixes and all unrelated work remain intact. Everything is local and uncommitted; no commit, push, PR, merge, deployment or paid operation occurred.
