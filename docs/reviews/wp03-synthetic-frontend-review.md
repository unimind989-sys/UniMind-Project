# Review UniMind's synthetic frontend in Chrome

Review candidate: runtime commit `2a4d0bbe1fef32ca666dd1cf650dede82dd8b610`, WP03-T09. This guide adds no runtime changes. [Draft PR #64](https://github.com/unimind989-sys/UniMind-Project/pull/64) remains unmerged. WP03-T10 and further WP04 work wait for the completed review gate.

## Start and controls

1. Open Chrome and paste [the English review entry](http://127.0.0.1:3101/preview/review?lang=en). The task's local development server is running on port 3101. No sign-in is needed. If the server is stopped later, use the repository development setup; the URL works while that server runs.
2. Confirm the **SIMULATED · Synthetic product review** banner. Stay inside `/preview/review`; real `/login`, `/learn`, `/batch-leader` and `/admin` are separate functional service routes and are not this review.
3. Use **Review home** to move between roles; the role rail and unit rail connect the screens. Use the **العربية / English** button to change language. [Direct Arabic entry](http://127.0.0.1:3101/preview/review?lang=ar).
4. Use **Review scenario** for failure/empty/loading examples. **Ready**, **Retry** or the displayed recovery control returns to the normal fixture. These choices simulate conditions; you do not need to disconnect the computer, alter an account or provide any information.
5. Use **Reset simulation** before an independent journey. Reset and Chrome reload clear all records. A new tab starts separately. Navigate through the app links to retain the current tab's examples; pasting a new URL causes a document load and clears them.

All source names, dates, accounts, answers, submissions, drafts and scores in this entry are invented. Credentials and source descriptions are fixed; there is no real file picker. No action sends email, changes credentials, grants access, uploads data, records a protected decision or calls a provider.

## Access: review all six screens

Start with **Reset simulation**, then follow the sequence. The fixed email is `learner@example.invalid`; do not type credentials.

| Screen | Action | Expected result and extra checks |
| --- | --- | --- |
| [Create account](http://127.0.0.1:3101/preview/review/access/register?lang=en) | **Register sample account**, then **Next sample step** | Sample account becomes unverified. No account or email is created. |
| [Verify email](http://127.0.0.1:3101/preview/review/access/verify-email?lang=en) | **Simulate email verification**, then continue | Sample becomes verified. Try **Simulate resend**, **Expired** and **Replayed link**. Recovery stays within the review. |
| [Sign in](http://127.0.0.1:3101/preview/review/access/login?lang=en) | **Sign in with sample account**, then continue | Goes to sample commitments or Study Shelf according to consent. **Unverified account** requires verification; **Suspended account** blocks entry. No real session appears. |
| [Learning commitments](http://127.0.0.1:3101/preview/review/access/consent?lang=en) | Inspect version/boundary copy, check acknowledgement, **Accept sample commitments** | Acceptance is disabled before acknowledgement. Sample acceptance opens Study Shelf. Compare **Current consent** and **Outdated consent**. |
| [Recover account](http://127.0.0.1:3101/preview/review/access/forgot-password?lang=en) | **Simulate recovery request**, then continue | Opens a fixed reset example; no mail. Try expired/replayed/wrong-scope scenarios. |
| [Reset password](http://127.0.0.1:3101/preview/review/access/reset-password?lang=en) | **Simulate password reset**, then continue | Shows success without changing a password. Revisit through app navigation to inspect consumed-link behavior. **Request fresh sample** recovers the example. |

## Student: catalog, every unit screen and Settings

Open [Study Shelf](http://127.0.0.1:3101/preview/review/catalog?lang=en). Choose the dependent stage → institution → program → academic level → period → unit selections. Change an upstream selection and confirm downstream choices follow it. Compare Human Medicine **Modules**, Veterinary **Subjects**, school fixtures and the fictional **flexible-credit** program's configured period. Select an available unit and **Open sample workspace**. The approved Study Shelf appearance is preserved; unsupported standalone Calendar/Progress/personal Workspace/global Sources entries are absent.

The following steps use the default Anatomy sample. Keep navigation within the same tab. The unit rail connects Overview, Chat, Studio, Quiz and Sources; evidence/report links originate on individual exchanges.

| Screen | What to try | Expected result |
| --- | --- | --- |
| Unit overview | Inspect scope, source metadata, synthetic date/readiness, allowance disclosure; use the scope selector | Scope changes to the selected fixture. Numeric limits remain unspecified. The common unit pool serves Chat/Studio/Quiz. |
| Sources | Open **Sources** and inspect titles, formats and locators | Only invented source metadata; no private file or storage URL. |
| Chat | **Start scoped sample session**; choose **Fixed prompt and answer state** and **Study language**; **Send fixed prompt** → **Complete simulated stream** | A fixed answer appears in this unit's session. Repeat supported, partial, unavailable, conflict, professor hint, fictional educational case and real-patient boundary examples. Try cancel during the simulated stream. |
| Answer evidence | On an older completed exchange, open its evidence link after sending another answer | Evidence belongs to the selected exchange, not automatically the last answer. Supported/partial/conflicting cases show the corresponding fixed source context; unavailable cases do not invent evidence. |
| Report an exchange | Open the exchange's report link; choose **Sample reason**; check the review acknowledgement; **Simulate report** | Confirmation says local-only: nothing sent, saved or shared. A report without an exchange points back to Chat. |
| Studio | Select **Artifact type**, **Topic**, **Language**, **Depth**, **Size**, then **Load fixed artifact** | Try all six types: structured summary, study guide, practice questions, flashcards, revision pack and MCQ quiz. Flip flashcards and reveal practice answers. Missing-timing/conflict examples disclose the limitation. No generation occurs. |
| Quiz setup | **Create sample attempt**, then open the attempt | Fixed quiz attempt created only in this tab/unit; an existing attempt can be reopened. |
| Quiz attempt | Select the two fixed MCQ answers; **Submit sample answers** | Submission requires both choices. Submitted answers become read-only; no server scoring. |
| Score and grounded review | Open the review link | Illustrative score, selected/correct answers, explanations and sample source references. Before submission, this screen directs you to the attempt. |
| [Settings](http://127.0.0.1:3101/preview/review/settings?lang=en) | Change **Sample sharing mode**, return to Chat and send another example; try recovery/sign-out | Future exchanges use the new local mode; earlier exchanges retain their mode. Nothing is shared. Saving/retention controls disclose the unresolved policy. Sign-out resets sample identity only. |

Create a second session and switch between them. Switch to another unit and confirm its sessions/answers/artifacts/quiz do not become the first unit's records. Then return through app navigation. Inspect **Allowance unavailable** and **Capacity delay** from the scenario selector; no numerical quota or purchase is invented.

## Batch Leader: every screen and tracking state

| Screen | What to try | Expected result |
| --- | --- | --- |
| [Assigned campaigns](http://127.0.0.1:3101/preview/review/batch-leader?lang=en) | Open the sample campaign; try **Empty**, **Expired**, **Forbidden** | Assignment/readiness boundaries remain explicit; no campaign access granted. |
| [Campaign invitation](http://127.0.0.1:3101/preview/review/batch-leader/invitation?lang=en) | Inspect the scoped invitation; try expired/replayed/wrong-scope | Invitation is an example, not an invitation email or access grant. |
| [Collection desk](http://127.0.0.1:3101/preview/review/batch-leader/campaigns/sample-campaign?lang=en) | Choose **File or approved reference example**, PDF/WAV/PNG, rights acknowledgement, valid outcome | Fixed title/description; reference has metadata but no URL. Start → complete sample upload → simulate finalization. Requested item and tracking both change to **Received**. |

On Collection desk, try each **Sample validation outcome**: duplicate/replacement, checksum mismatch, oversized, forbidden type, rights unknown/revoked. Try starting without acknowledgement. Each must explain its blocked outcome rather than receive a submission. Try cancelling the progress example and retrying. After a valid received submission, use **Controlled fixture status** → **Apply sample tracking state** for Received, Processing, Needs information, Accepted, Rejected and Completed. **Prepare corrected sample** creates a new example version and retains the visible history.

## Admin: all twelve decisions and eight resources

Open [Governed decisions](http://127.0.0.1:3101/preview/review/admin?lang=en). For each **Governed action example**, inspect exact scope, current/proposed state, version, reason and consequences. Choose **Simulated decision outcome**, acknowledge the change, then **Simulate decision** when enabled. Inspect the local journal and updated record.

| Action examples | Expected boundary |
| --- | --- |
| Hide unit; Lock cohort; Deactivate source | Local containment changes the corresponding shared student fixture. |
| Publish unit; Unlock cohort; Activate source | Protected sample transition remains pending; **Load completed outcome fixture** loads an explicitly fixed two-founder result, never supplies a second confirmation. |
| Quarantine source; Retry source; Disable provider or artifact | Local example record/journal changes only; no job or provider operation. |
| Place raw-data hold; Remove raw-data hold | Protected pending/completed fixtures; no raw object or actual deletion policy applied. |
| Enable provider or artifact | Always disabled; provider/rights/budget approvals stay open. Even the completed-outcome fixture cannot enable it. |

Try **Readiness blocked**, **Pending second founder**, **Stale version**, **Recoverable error**, **Approval missing** and **Cancel**. Blocked/missing-approval controls stay disabled; stale/error do not silently apply the change. Refresh/reset the example to retry.

Containment loop: reset → Hide unit → confirm and simulate → use the student-preview link → the unit is unavailable → **Reset simulation** → it is available again. Repeat Lock cohort and Deactivate source separately. Everything remains synthetic.

| Resource screen | Review action and expected result |
| --- | --- |
| [Catalog](http://127.0.0.1:3101/preview/review/admin/catalog?lang=en) | Switch configured Module/Subject label and simulate a draft. This is a local draft, not a published real catalog change. |
| [Cohorts](http://127.0.0.1:3101/preview/review/admin/cohorts?lang=en) | Simulate the scoped cohort draft; follow the campaign example. No membership/access changes. |
| [Campaigns](http://127.0.0.1:3101/preview/review/admin/campaigns?lang=en) | Create sample campaign draft; acknowledge the fixed invitation; simulate invitation review; follow the leader invitation example. No email sent. |
| [Sources](http://127.0.0.1:3101/preview/review/admin/sources?lang=en) | Inspect fixed status/rights/readiness summary and governed-decision navigation. |
| [Jobs](http://127.0.0.1:3101/preview/review/admin/jobs?lang=en) | Inspect processing/retry examples; no worker job starts. |
| [Quality](http://127.0.0.1:3101/preview/review/admin/quality?lang=en) | Inspect fixed quality summary and connected sample study journey. |
| [Usage](http://127.0.0.1:3101/preview/review/admin/usage?lang=en) | Inspect illustrative usage/capacity disclosures; no approved numeric budget or live telemetry is implied. |
| [Incidents](http://127.0.0.1:3101/preview/review/admin/incidents?lang=en) | Inspect fixed incident summary and containment links; no live incident or operational mutation. |

## Languages, responsive layouts and isolation

- Repeat the three role journeys in Arabic using the header toggle. Check right-to-left navigation, source locators/Latin identifiers, MCQ selection, error text and confirmation text. Chat additionally has English, Arabic and mixed study-language choices independent of the interface language.
- In Chrome DevTools, use the device toolbar at widths **1440, 768, 390 and 320**. Check all rails, long source/status text, forms, choices and dialogs for clipping or horizontal overflow. Automated proof also covers 200% text scaling and reduced motion.
- Use Tab/Shift+Tab and Enter/Space. The first Tab exposes **Skip to content**; focus remains visible and routes focus their main region. Check that every choice has a label and unavailable actions explain why.
- Make a session/submission/decision in one tab. Open a new tab to the home entry: it starts without those records. Reset the original tab and verify its records disappear too. Reload has the same effect. No browser storage is used.
- In Chrome's Network panel, clear entries before an interaction. Framework document/assets/navigation GET requests are expected; there should be no action POST, `/api/`, `/auth/`, upload, Auth cookie or provider request caused by a review interaction. Do not paste credentials or inspect browser credential storage.
- Try Loading, Empty, Error, Offline, Stale and Forbidden in the header on representative screens. Use its recovery control or Ready; no real system condition is required.

## What is functional, what is simulated and what remains undecided

Already-functional WP03 services include real authentication/consent guards, the authorized catalog/workspace shell, collection application and governed-action application. They remain separate from this entry. Existing affected Study Shelf/workspace browser regressions passed again.

This review simulates accounts, all study responses/evidence/reports, Studio artifacts, quiz scoring, collection progression, admin drafts/decisions and operations summaries. It does not complete unfinished backend packages or prove storage/processing/provider features live.

Open decisions: D-08 saving/retention/report policy and exact report payload; D-18 real storage-reference validation; provider/model/budget choices and numeric allowances; actual pilot configuration/source rights. Standalone Calendar, personal Workspace, global Progress and global Sources have no approved screen behavior and are excluded.

Local verification: final mock suite **14/14**, affected existing browser contracts **15/15**, security **44/44**, preview-isolation unit tests **12/12**; format/lint/typechecks/boundaries/readiness/secrets and production environment build passed. Thirty routes were tested in EN/AR with responsive and accessibility checks. All four required CI jobs passed for runtime candidate `2a4d0bb` in [run 36700605550](https://github.com/unimind989-sys/UniMind-Project/actions/runs/36700605550): selector, dependency audit, full application gate and disposable database gate. The documentation handoff is a later commit and its own checks must finish before delivery. A full guarded local gate, merge, production proof and final WP03-T10 PASS remain pending; no founder design acceptance has been recorded.

When reporting a problem, give the screen, language, width, scenario, actions and expected/actual result. A screenshot is optional. Once you finish reviewing, state whether you accept the frontend design/interactions or list changes. Acceptance will bind to the presented runtime candidate; it will not approve the open product decisions above.
