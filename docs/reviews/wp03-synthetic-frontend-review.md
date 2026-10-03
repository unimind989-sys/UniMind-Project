# UniMind: review the normal product flow with synthetic data

Current design authority is [DESIGN](../../DESIGN.md) and the [overhaul audit](wp03-frontend-overhaul.md). Ahmed accepted student `3a2a95d`, Batch Leader `4c03b80`, Admin `ec00466` and final consistency `8ad3a9b`; the [final consistency record](../../planning/design/frontend-overhaul/phase-2-final.md) retains the rendered checkpoint and [delivery record](../../planning/design/frontend-overhaul/phase-2-delivery.md) tracks technical gates. The shared system now covers every role below. PR #64 remains draft/unmerged; broad/database/CI/delivery proof and WP03-T10 remain pending.

This replaces the separate `/preview/review` interface. Start at **http://127.0.0.1:3101/?lang=en**. First-time visitors see the landing page; use **Sign in** to enter the synthetic journey. Use normal sign-in, consent, product navigation, forms and buttons. There is no role switcher, scenario selector or manual response-completion button. The small banner identifies simulated services.

Run `corepack pnpm demo` from the repository if the review server is stopped. This launches an isolated, loopback-only development runtime and replaces all service configuration with invented markers. Ordinary `pnpm dev`, production builds, real guards and backend services retain their normal behavior. Do not run two Next development processes in the same checkout simultaneously.

All demo academic/account state, sessions, reports, submissions, artifacts, attempts and admin changes belong to the current browser document. Product links, language changes and browser Back preserve them. **Reload, entering a URL in the address bar, or opening another tab starts fresh.** A deep link then asks you to sign in and accept commitments before returning to that screen. Appearance alone persists a validated System/Light/Dark preference locally, shared with the product; it contains no identity or study data. Nothing issues authentication cookies or contacts Auth, database, storage, queue, email or model providers. Every demo POST/API/server-action request is rejected.

## Current product review

The exact slogan is **Study deeper** / **Go further.** The supplied Open Folio
brand, paired neutral themes and shared controls cover public/auth and all roles.
Use Account → Appearance for System / Light / Dark; use the interface language
control for English/Arabic. Neither change selects a role.

1. Sign in as the fictional student, accept commitments and set academic context
   once. Study and Subjects show the available Modules/Subjects; Account → Academic
   settings edits that selection. Demo navigation retains it; reload clears demo
   identity/study data. The real profile extension requires database proof and its
   reviewed migration before deployment.
2. Open Anatomy. Materials, Chat, Studio and Quiz stay within its workspace. Send
   a supplied question, inspect evidence or report it, generate a study aid, inspect
   its sources and use Return to Studio. Interface and study-output language remain
   separate. Account's Back to study keeps the current destination.
3. Sign out, sign in as the leader and open the assigned campaign from Uploads.
   Add the supplied PDF/WAV/PNG together, review inferred destinations, enter the
   supplied metadata and declare rights. Upload the queue; inspect each receipt
   and retry only an interrupted file. History shows latest submissions in current
   campaigns; processing does not block further uploads.
4. Sign out and sign in as Admin. Use Overview, Content, Academics, Users and
   Operations. Review the existing fixed draft controls and exact decisions.
   Account remains reachable on desktop and phone; the phone Menu exposes all
   five sections. Blocked/uncertain outcomes never imply a completed mutation.

Repeat in both themes and languages at desktop, tablet and 360–430px; also check
320px/enlarged text. The accepted role packets retain loading/error/empty and
interruption reviews. The final packet is a consistency checkpoint, not live
service or production proof.

## Download the complete synthetic data

Download [the test pack](http://127.0.0.1:3101/demo-files/unimind-synthetic-test-pack.zip), or use the individual [accounts CSV](http://127.0.0.1:3101/demo-files/accounts.csv), [complete test-data JSON](http://127.0.0.1:3101/demo-files/test-data.json), [PDF](http://127.0.0.1:3101/demo-files/synthetic-handout.pdf), [WAV](http://127.0.0.1:3101/demo-files/synthetic-recording.wav), [PNG](http://127.0.0.1:3101/demo-files/synthetic-diagram.png) and [rejected TXT](http://127.0.0.1:3101/demo-files/synthetic-rejected.txt).

These files are invented byte fixtures: a one-page synthetic PDF, silent audio and a one-pixel image. They exercise file validation; the app does not process them. Evidence passages, page 3/timestamp 02:10 and source statuses are separate fixed fictional records, not extraction results from those files.

| Account                        | Password                | Journey                                                   |
| ------------------------------ | ----------------------- | --------------------------------------------------------- |
| `student@example.invalid`      | `Synthetic-study-2026!` | Study Shelf, all study screens and Settings               |
| `leader@example.invalid`       | `Synthetic-study-2026!` | Assigned campaign, invitation and source submission       |
| `admin@example.invalid`        | `Synthetic-study-2026!` | Admin resources, first founder simulation and containment |
| `second-admin@example.invalid` | `Synthetic-study-2026!` | Distinct second founder simulation                        |

Ready accounts begin verified, with current commitments awaiting acceptance. Email/password inputs are prefilled with the student fixture. Replace the email to try another role. Unknown credentials are rejected; use no real details. Sign out and sign in through normal controls to change accounts while preserving this document's shared synthetic records.

## 1. Access, verification and recovery

1. At `/login`, use the student credentials, press **Continue**, check the current commitments, then **Accept all and enter your shelf**. The student entry opens; first-time students set academic context before the Study Shelf. Consent changes demo memory only.
2. Reload `/login`. Follow **Create an account**. Use the same student email, password and password confirmation. **Create account** opens `/verify-email`. **Resend verification email** shows the normal email-request result, but delivers no email.
3. The supplied fake verification email contains [this callback link](http://127.0.0.1:3101/auth/callback?code=sample-verification&type=signup&lang=en). Open it to continue to commitments and the Study Shelf. It is a synthetic callback; no actual account or session is created.
4. At `/login`, follow **Forgot your password?**, use the student email and **Send recovery email**. No email is delivered. Open the supplied [recovery callback](http://127.0.0.1:3101/auth/callback?code=sample-recovery&next=%2Freset-password&lang=en). Enter the supplied password in both fields. **Update password** returns to sign-in; no real credential changes.
5. Type `not-an-email`, leave a required field blank, or use `wrong-synthetic-password` to review validation and focused error messages. Prepared unverified, suspended, outdated-consent, expired and replayed cases appear below.

Email and invitation links are supplied in this guide because the isolated runtime never sends email. These links are outside the product UI, as real email delivery would be. Replay/expiry here demonstrate frontend states; durable cryptographic token semantics remain the working backend's responsibility.

## 2. Study Shelf and unit overview

Choose **University → Zagazig University → Faculty of Medicine → First year → Term 1**. The synthetic cohort is selected when appropriate. Open **Anatomy**. Human Medicine uses Modules; Veterinary Medicine uses Subjects. Also inspect secondary scientific/literary and the synthetic flexible-credit program. All available scope paths and names are listed in `test-data.json`.

Global navigation is Study, Subjects, Account. Within a subject use Materials, Chat, Studio and Quiz; Unit sources/View material details opens the supporting viewer. The scope switcher changes unit/program and selects that unit's own sessions, artifacts and attempts. Materials shows the synthetic edition/date and eight named sources; Chat/Studio retain their capacity boundaries. Unsupported personal Workspace, Calendar, global Sources and Progress are excluded from this complete mock navigation; they have no approved standalone journey.

Sources lists the eight invented source records with title/format/locator and explicit sample readiness. Evidence shows the exact source rows for the selected exchange; it never invents a citation for unsupported content.

## 3. Chat, evidence, reports and privacy

Paste one prompt below into **Message**, choose English/Arabic/mixed study language, then **Send**. The first Send creates a session; **New session** starts another. The response appears automatically after a short simulated stream. **Cancel stream** interrupts it; sending again retries. New sessions and scope switching must not mix exchanges between units or sessions. Typed text lives only in a document-local draft; sending retains fixture classification, never arbitrary prompt text. Unmatched questions return the unavailable-information fixture.

| Outcome                    | English prompt                                                 | Arabic prompt                                     |
| -------------------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| Supported                  | `Explain the sample unit's study sequence.`                    | `اشرح ترتيب المذاكرة في الوحدة التجريبية.`        |
| Partial                    | `Explain the sequence and its missing timing.`                 | `اشرح الترتيب والتوقيت غير الموجود.`              |
| Unavailable                | `What is not covered by these sample sources?`                 | `ما المعلومات غير الموجودة في المصادر التجريبية؟` |
| Conflict                   | `Do the two sample sources agree?`                             | `هل المصدران التجريبيان متفقان؟`                  |
| Professor hint             | `What did the sample professor emphasize?`                     | `ما النقطة التي أكد عليها المحاضر التجريبي؟`      |
| Fictional educational case | `In this fictional teaching case, what is the study sequence?` | `في حالة تعليمية خيالية، ما ترتيب الدراسة؟`       |
| Real-patient boundary      | `Treat an identifiable real patient.`                          | `عالج مريضًا حقيقيًا محدد الهوية.`                |

For every exchange follow **Inspect evidence** and **Report example**. On the report screen choose Poor answer, Source problem or Conflict, confirm the selected exchange and submit. A simulated receipt appears; submitting the same report again is disabled. Reports never leave memory. Exact real payload, disclosure and retention remain D-08 decisions.

In Account change **Sharing mode** to Private / no sharing. Return with browser Back and send a new message: the new exchange records private mode; prior exchanges retain their recorded mode. Interface language is separate from study-output language. Retention has no active control because its policy is unapproved. Password recovery and sign-out use normal account navigation.

## 4. Studio and quizzes

Try all six artifact types using the radio choices: structured summary, study guide, practice questions, flashcards, revision pack and MCQ quiz. Choose Study sequence or Diagram comparison; English, Arabic or mixed; concise or detailed; short or extended. Press **Generate** and wait for the fixed illustrative artifact, or **Cancel preparation** and retry. Configuration and completed output survive ordinary navigation and locale changes. Flip a flashcard; inspect the missing/conflicting evidence notice and source navigation. Every type stays bound to the selected unit. No generation or durable artifact service runs.

Open Quiz. Choose Untimed or Timed, then **Start quiz**. Starting opens `/quiz/sample-attempt`. Submission is disabled until both answers are selected. Correct answers are **Identify labels** and **No duration is supplied**; these give an illustrative **2 / 2**. **Compare diagrams** and **An exact duration** give **0 / 2**. Mixed selections give **1 / 2**. Submit to open `/quiz/sample-attempt/review`, with selected answers and grounded explanations. Repeated submission cannot change a scored fixture. Start a new attempt from Quiz.

Timed mode uses an explicitly illustrative 60-second fixture, not an approved production time limit. Let it expire: the attempt becomes unavailable without recording a score. Start a new attempt. Reloading clears all attempts.

## 5. Batch Leader

Sign out, use `leader@example.invalid`, and accept commitments. Navigation is
**Uploads, History, Account**. Open **Synthetic Anatomy source call**. It has three
existing requests and fixed Processing, Needs information, Accepted, Rejected
and Completed examples. History shows the latest submission for each request in
your current campaigns, not a complete archive.

Use **Choose files** or desktop drop to add the supplied PDF, WAV and PNG together.
The queue infers each unique compatible request. Choose a destination only when
more than one matches; unmatched/invalid files explain why they cannot upload.
There is no manual format classification.

| Input                           | Supplied value                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| Source title                    | `Synthetic study source`                                                            |
| Professor or source description | `Invented source for the UniMind synthetic product flow.`                           |
| Handout                         | `synthetic-handout.pdf`                                                             |
| Recording                       | `synthetic-recording.wav`                                                           |
| Diagram                         | `synthetic-diagram.png`                                                             |
| Rights                          | Declare rights for these supplied fixtures after adding files                       |
| Approved reference              | Use the existing fixed synthetic handout-reference option; no actual URL or storage |

Review context and rights, then **Upload files**. Each file has progress, received
status and an individual receipt. Received means intake completed; processing is
separate. Navigate to History and back: ordinary links preserve document-local
receipts. A new selection uses its own request key.

Cancel an in-progress file, then **Retry upload**. A retry retains its key/receipt
and does not repeat a completed upload. Added files require renewed rights.
Prepared interruption, checksum, duplicate, oversize and rights cases are below.
Try `synthetic-rejected.txt`: unsupported bytes are rejected. Only pack fixtures
are accepted; matching names/sizes still require an exact local byte comparison.
No upload/finalization call reaches a server in this demo.

Open the supplied [invitation](http://127.0.0.1:3101/batch-leader/invitation?lang=en);
sign in if prompted. **Accept invitation** records only a fixed demo result and returns to
the campaign. Expired/replayed assignments provide safe exits and no upload action.
No email or real assignment is created.

## 6. Admin

Sign out and sign in as `admin@example.invalid`. Navigation groups the existing routes under **Overview, Content, Academics, Users, Operations**; Account is a utility destination. On phones open **Menu** to change sections. Review all eight resource destinations: Catalog, Cohorts, Campaigns, Sources, Jobs, Quality, Usage and capacity, Incidents. Configuration/draft controls expose fixed approved sample concepts only. Broad catalog editors, arbitrary invitation recipients, storage-reference policy, operational processing and report/retention policy are not implemented or decided.

The synthetic campaign has a fixed cohort/unit, handout/recording/diagram requests and expiry. Creating its draft and reviewing its invitation only update memory; no email or assignment is created. Operations resources show fixed lifecycle/job/quality/capacity/incident summaries and recovery states. **Open governed decisions** leads to the same actual decision queue component used by the working application.

Users shows existing cohort/assignment context and links, with no directory or membership editor. On phones **Choose a decision** selects the exact candidate; desktop uses the decision list.

Use reason **`Synthetic readiness review.`**, or Arabic **`مراجعة جاهزية تجريبية.`**. Inspect readiness predicates and current/proposed state, press **Review exact change**, then the normal confirmation button.

| Decision                      | Expected synthetic behavior                                                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hide unit                     | Applies; Anatomy disappears from student availability                                                                                                                                           |
| Publish unit                  | Already published initially; Hide first, then propose publication; needs distinct second confirmation                                                                                           |
| Lock cohort                   | Applies; cohort becomes unavailable in student view                                                                                                                                             |
| Unlock cohort                 | Already unlocked initially; Lock first, then propose unlock; needs distinct second confirmation                                                                                                 |
| Deactivate source             | Applies; the handout becomes inactive. Seven other source rows remain READY, so the unit remains available. New handout-dependent answers/artifacts/attempts are unavailable until reactivation |
| Activate source               | Already active initially; Deactivate first, then propose activation; needs distinct second confirmation                                                                                         |
| Quarantine source             | Failed fixture becomes Quarantined                                                                                                                                                              |
| Retry source                  | Owner-review request becomes pending; source stays failed and no worker runs                                                                                                                    |
| Place raw-data hold           | Use `2026-10-03T16:00` as the supplied illustrative expiry, check review attestation, and obtain second founder confirmation; no raw object changes                                             |
| Remove raw-data hold          | Requires second founder confirmation                                                                                                                                                            |
| Enable approved mock artifact | Blocked by approval/budget boundary; never enables a provider                                                                                                                                   |
| Disable provider/artifact     | Applies only to the fixed mock flag                                                                                                                                                             |

To confirm a pending change, **Sign out**, replace the email with `second-admin@example.invalid`, **Continue**, accept commitments, select the same pending candidate and confirm. These are two invented accounts representing the frontend rule; no real founder identity or authorization is asserted. The first account cannot provide its own distinct second confirmation. Repeat an applied action: it is blocked as already applied.

Use **Preview student** to see containment in the same document. Returning through normal navigation keeps the local changes. A full reload resets them. No protected action, audit write, source change, access grant, raw hold or provider transition reaches the working backend.

## 7. Prepared failure cases

These are test setup, not product navigation controls. Start a fresh test using a normal URL with `?fixture=CASE` (add `&lang=ar` to repeat Arabic). A protected deep link first requests normal sign-in/consent and then returns to the prepared screen. The downloadable JSON lists every fixture and scope path. Use the correct synthetic role.

| Screen                                                   | Fixture values                                                                                                   | Expected result                                                                            |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `/login`                                                 | `unverified`, `outdated-consent`, `suspended`                                                                    | Verification/consent gate or unavailable account                                           |
| `/verify-email`, `/reset-password?token=sample-recovery` | `expired`, `replayed`                                                                                            | Unavailable link; fresh-link recovery is offered                                           |
| `/learn`                                                 | `loading`, `empty`, `error`, `offline`, `forbidden`, `no-membership`, `locked`, `unpublished`, `no-ready-source` | Automatic loading completion, empty/unavailable/error copy, normal Retry/Back              |
| Any unit overview/chat/Studio/Quiz                       | `loading`, `empty`, `error`, `offline`, `stale`, `forbidden`, `quota`, `capacity`, `wrong-scope`                 | Safe recovery, no invented limit or provider request                                       |
| `/batch-leader`                                          | `empty`, `error`, `forbidden`, `expired`                                                                         | No assignment, unavailable view or expired assignment                                      |
| `/batch-leader/invitation`                               | `expired`, `replayed`                                                                                            | Acceptance unavailable; campaign recovery link                                             |
| Campaign submission                                      | `offline`, `checksum`, `duplicate`, `oversize`, `rights`, `expired`, `wrong-scope`                               | Interrupted/rejected validation or unavailable assignment; no new submission               |
| `/admin`                                                 | `empty`, `forbidden`, `error-page`, `blocked`, `pending`, `stale`, `error`                                       | Empty/unavailable queue, readiness block, distinct confirmation, stale/error action result |
| Any admin resource                                       | `loading`, `empty`, `error`, `offline`, `forbidden`                                                              | Same normal state/recovery contract                                                        |

For example, paste `http://127.0.0.1:3101/learn/zagazig-university-human-medicine-year-1-term-1-cohort/zagazig-university-human-medicine-y1-t1-anatomy/chat?fixture=offline&lang=en`, then sign in and consent. Use Retry to restore the normal chat screen in the same document. No hidden scenario picker is needed.

## 8. Languages, layouts and isolation

Repeat with **Interface language / لغة الواجهة** in the app and **العربية** on public/auth pages; verify RTL and intact values/scope. Switch output language independently to mixed Arabic/English. Inspect desktop 1440px, tablet 768px, mobile 390px and narrow mobile 320px. Try keyboard Tab/Shift+Tab/Enter, visible focus, 200% text scaling, reduced motion and long labels.

A new tab/document begins signed out with no previous sessions, attempts, uploads or changes. Reload also clears them. Returning with product links/browser Back preserves the current document. No real session can be unlocked by demo credentials or consent; the mode is unavailable in ordinary/production runtime, and query parameters cannot activate it. Demo uploads never issue an HTTP upload request.

## What is functional and what is simulated

Already functional WP03 seams: real Auth/verification/consent/recovery, authorized catalog availability and workspace/session boundaries, validated campaign uploads/submission lifecycle, governed admin actions and role/authorization/error contracts. The demo shares their existing frontend components while injecting synthetic ports. Those services remain separately protected and are not exercised by this review.

Simulated here: all account state and every review interaction; automatic chat replies/streams, evidence/report receipt, all artifacts, scoring/timer, files/progress/reference acceptance, tracking transitions, campaign/draft/invitation state, admin decisions, resource operations and preference changes. Future real backend work remains in WP04/WP06/WP07/WP08. Reload durability is intentionally absent.

Open decisions remain D-08 saving/retention and exact report disclosure/payload, D-18 reference/storage policy, paid provider/budget approval, detailed broad management editors and invitation delivery contracts. This frontend review neither approves those decisions nor verifies live academic/provider behavior. WP03-T10's final named founder review remains before continuing WP04.

### Checkpoint coverage and boundaries

The audit map and prioritized corrections are in `docs/reviews/wp03-frontend-overhaul.md`, also supplied as `frontend-overhaul.md` in the pack. Prepared access, study failure, collection failure and admin recovery cases use the normal URLs and forms above; EN/AR/RTL, 1440/768/390/320, focus, enlarged text and accessible controls are checked. The shared system covers public/auth, study/account, Batch Leader and Admin. Role checkpoints are accepted; final consistency acceptance and broad delivery proof remain pending. Historical audit defects describe the predecessor, not the current candidate.

Chat Cancel is a real working simulated control: after cancellation the typed draft remains, no reply/evidence is added later, and Send retries. Both pointer and keyboard behavior are covered. All review answers, artifacts, sessions, scoring, uploads, receipts and governed examples use deterministic document-local services. Existing default WP03 identity/access/catalog/collection/governance services remain the functional protected implementation when demo mode is absent; later generation backends, persistence, email/invitation delivery and paid providers are not supplied by this sample.

Remaining decisions: D-08 retention/report payload and disclosure; D-18 real storage reference; financial/provider enablement and caps; broad management/invitation delivery; final product-wide acceptance. The supplied Open Folio kit is integrated; no new logo selection is pending. No review choice decides those policies.
