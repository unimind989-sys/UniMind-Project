# UniMind: review the normal product flow with synthetic data

Current design authority is [DESIGN](../../DESIGN.md). WP03-T09 was delivered through merged PR #64 and its [production evidence](../../evidence/wp03-product-shell/2026-10-03_frontend-overhaul_production_f107e41.md). Ahmed subsequently accepted premium landing `569c467` and remaining-screen/final consistency candidate `f0a237f`; the [premium review guide](../../planning/design/premium-product/README.md) and [product receipt](../../planning/design/premium-product/product-approval.md) own those checkpoints. The shared system covers every role below. WP03-T10's controlled record owns the current complete gate and delivery status; an acceptance receipt alone does not prove technical or production PASS.

The normal live login recognizes the exact four invented credential pairs below. Hosted synthetic sessions use the ordinary shared views without additional controls, labels or prefill. All identity and activity stay in this browser document; sign-out exits synthetic mode and discards the session. Reload and a fresh tab return to the real site's ordinary access checks. These credentials grant no backend access and synthetic activity makes no service mutations.

The loopback review runtime remains available at **http://127.0.0.1:3101/?lang=en** for prepared failure cases, fake callbacks and invitation fixtures. First-time visitors see the landing page; use **Sign in** to enter the synthetic journey. Use normal sign-in, consent, product navigation, forms and buttons. There is no role switcher, scenario selector or manual response-completion button. Only this local review launcher retains setup prefill and the simulated-service banner.

The demo calendar is fixed at **1 October 2026, 12:00 UTC** (15:00 in Cairo), regardless of the day you review it. The normal invitation and personal assignment expire on 10 October; the campaign closes on 12 October. Intentionally expired invitation/assignment examples expired on 30 September. New submission receipts use the fixed clock; the separate historical tracking examples remain dated 20 September. Collection dates display in Cairo time. The loopback simulation note and the campaign's existing date disclosure identify this reference; the hosted demo keeps its ordinary presentation. The same calendar is recorded in `test-data.json`. Quiz countdowns measure elapsed time independently. These examples neither set nor verify real deadline, token or retention rules.

Run `corepack pnpm demo` from the repository if the review server is stopped. This launches an isolated, loopback-only development runtime and replaces all service configuration with invented markers. Ordinary `pnpm dev`, production builds, real guards and backend services retain their normal behavior. Do not run two Next development processes in the same checkout simultaneously.

All demo academic/account state, sessions, reports, submissions, artifacts, attempts and admin changes belong to the current browser document. Product links, language changes and browser Back preserve them. **Reload, entering a URL in the address bar, or opening another tab starts fresh.** A deep link then asks you to sign in and accept commitments before returning to that screen. Appearance alone persists a validated System/Light/Dark preference locally, shared with the product; it contains no identity or study data. Nothing issues authentication cookies or contacts Auth, database, storage, queue, email or model providers. Every demo POST/API/server-action request is rejected.

### Prepared study-density example (local only)

Open [the crowded Anatomy study example](http://127.0.0.1:3101/learn/zagazig-university-human-medicine-year-1-term-1-cohort/zagazig-university-human-medicine-y1-t1-anatomy/chat?fixture=dense&lang=en), then sign in with the synthetic student and accept commitments. It adds **12 fixed sessions** and shows **24 invented source records**, including long English and Arabic titles. Open Sessions to inspect the first, middle and last entries; each keeps its own replies and evidence. **Module sources** shows the full library. Subjects reports the same sample-material count after you select this academic path.

The prepared Anatomy dataset survives ordinary navigation, language changes and Back within this document, even after the fixture query disappears. It adds records once and retains existing sessions, drafts, selected study language and privacy choices. Other units remain unchanged. A fresh unprepared document has the normal sparse examples. The hosted synthetic flow ignores this fixture; there is no product scenario selector or additional hosted banner.

For mixed source availability, open the same local link as either synthetic Admin, use Return to Admin and Deactivate source version, then Preview student. The first handout is marked inactive; the other 23 sample records remain ready. Historical evidence remains inspectable, while a new dependent question uses the existing unavailable-information reply and Studio blocks dependent generation. These are fixed readiness examples, not processing results or new permission rules. The calendar is unchanged. `preparedStudyDensity` in `test-data.json` records the counts, path and bilingual titles. Studio's setting examples are described below; this crowded-source example proves neither production capacity nor model quality.

### Prepared multiple-campaign example (local only)

Open [the three assigned campaigns](http://127.0.0.1:3101/batch-leader?fixture=dense&lang=en) as the synthetic Batch Leader. Anatomy, Biochemistry and Physiology have separate fixed assignments, with three required PDF/WAV/PNG requests each. These are invented catalogs and assignments. The latter two campaign names are deliberately long in both languages. Follow each ordinary Open requests link; the selected campaign, requested material and latest submission stay distinct even when two campaigns request the same file format.

Choose a supplied sample file or add the approved synthetic reference. Enter a safe sample description and declare rights before upload. The file stays in that campaign's queue when you visit another campaign, Latest submissions or Account and return. Each queue retains its own source origin, target, title, description, rights and client key. Navigating away during upload cancels that attempt; return and retry. A failed finalization retains its upload receipt so Retry submission does not upload again. Received means processing and review are still pending. Latest submissions shows the campaign name and the latest submission per request; it is not an archive.

The prepared assignments last only within this document. Sign-out or a fresh document clears their queues, receipts and preparation. A fresh ordinary or hosted document still has one campaign; unknown, unprepared extra and wrong-role campaign routes remain unavailable. `preparedCampaigns` in the pack records the exact IDs, entry and bilingual names. Real assignments, expiry, authority, raw storage and processing are unchanged. This does not establish durable production drafts or processing capacity. The fixed clock, prepared study-density example and Studio setting examples remain available.

## Current product review

The exact slogan is **Study deeper** / **Go further.** The supplied Open Folio
brand, paired neutral themes and shared controls cover public/auth and all roles.
Use Account → Appearance for System / Light / Dark; use the interface language
control for English/Arabic. Neither change selects a role.

1. Sign in as the fictional student, accept commitments and set academic context
   once. Study and Subjects show the available Modules/Subjects; Account → Academic
   settings edits that selection. Demo navigation retains it; reload clears demo
   identity/study data. The real profile extension is separately protected; its
   deployed migration was proved during WP03-T09. This mock review writes no profile.
2. Open Anatomy. Materials, Chat, Studio and Quiz stay within its workspace. Send
   a supplied question, inspect evidence or report it, generate a study aid, inspect
   its sources and use Return to Studio. Interface and study-output language remain
   separate. Account's Back to study keeps the current destination.
3. Sign out, sign in as the leader and open an assigned campaign from Source
   intake. Check your Cairo deadline and unfinished requests. Use Upload files to
   add the supplied PDF/WAV/PNG together, review their destinations and metadata,
   declare permission, then Submit files. Inspect the compact receipts and retry
   only interrupted work. Latest submissions opens each exact request and record;
   receipt does not imply processing or student availability.

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

Ready accounts begin verified, with current commitments awaiting acceptance. The local review launcher prefills the student fixture; its sign-out/sign-in preserves shared review records for two-account governance examples. Hosted login starts empty and hosted sign-out discards all synthetic records. Enter any of the four pairs above to select its role. Other credentials use real Auth on the live site; the local launcher rejects unknown credentials. Use no real details in the review launcher.

## 1. Access, verification and recovery

1. At `/login`, use the student credentials, press **Continue**, check the current commitments, then **Accept all and enter your shelf**. The student entry opens; first-time students set academic context before the Study Shelf. Consent changes demo memory only.
2. Reload `/login`. Follow **Create an account**. Use the same student email, password and password confirmation. **Create account** opens `/verify-email`. **Resend verification email** shows the normal email-request result, but delivers no email.
3. The supplied fake verification email contains [this callback link](http://127.0.0.1:3101/auth/callback?code=sample-verification&type=signup&lang=en). Open it to continue to commitments and the Study Shelf. It is a synthetic callback; no actual account or session is created.
4. At `/login`, follow **Forgot your password?**, use the student email and **Send recovery email**. No email is delivered. Open the supplied [recovery callback](http://127.0.0.1:3101/auth/callback?code=sample-recovery&next=%2Freset-password&lang=en). Enter the supplied password in both fields. **Update password** returns to sign-in; no real credential changes.
5. Type `not-an-email`, leave a required field blank, or use `wrong-synthetic-password` to review validation and focused error messages. Prepared unverified, suspended, outdated-consent, expired and replayed cases appear below.

Email and invitation links are supplied in this guide because the isolated runtime never sends email. These links are outside the product UI, as real email delivery would be. Replay/expiry here demonstrate frontend states; durable cryptographic token semantics remain the working backend's responsibility.

## 2. Study Shelf and unit overview

Choose **University → Zagazig University → Faculty of Medicine → First year → Term 1**. The synthetic cohort is selected when appropriate. Open **Anatomy**. Human Medicine uses Modules; Veterinary Medicine uses Subjects. Also inspect the high-school **Science** and **Mathematics** tracks and the synthetic flexible-credit program. The Science sample contains Biology, Chemistry and Physics; the Mathematics sample contains Mathematics, Chemistry and Physics. Both tracks have a Third year and two terms. These are invented demo catalogs, not verified school curricula or proof of student eligibility. All available scope paths and names are listed in `test-data.json`.

Setup asks one meaningful question at a time. A single available value is carried automatically: high-school setup asks stage, track and term, while the fixed credit-plan example asks stage, university and program. University, faculty/year and period choices remain when alternatives exist. The final review still shows the complete path; Edit appears where another choice is available, and Back returns to the previous question. Nothing saves until you open the Study Shelf explicitly.

When no recent work matches the saved academic path, Settings offers **Open current study path** and Study starts in that path. When matching recent work exists, its named return remains available. The main action does not offer a generic return into the earlier course. Existing document-local drafts, artifacts and quizzes remain intact; restoring the earlier path can make its named return available again. This preference never grants access. Direct permitted study returns still work before a path is saved; real resume remains limited to the existing authorized current-cohort Chat service.

Study offers a named course in your current path and opens its **Materials** directly. If no course was explicitly selected, the first currently available course is offered as a choice; this saves no preference. **Browse all subjects** opens the separate searchable catalog.

The latest supported work names its course and tool. Chat adds the conversation topic and recorded reply count; Studio names the completed format and study focus; a quiz attempt shows in-progress, submitted-review or expired-unscored status. Opening a tool's setup does not claim a completed result. The same attempt key and original deadline remain in use. This is one latest item in document memory, not a saved history library; loopback explains that reload starts fresh. Ordinary synthetic entry uses the same records with ordinary latest-only wording. Real entry lists only its existing newest open authorized Chat conversation; real aid/quiz history is not claimed.

Global navigation is Study, Subjects and the named profile, which opens Settings. Within the chosen course use Materials, Chat, Studio and Quiz. **Module sources** or **Subject sources**, and **View material details**, open the complete material library. Open **Module details** or **Subject details** to see the institution and current academic context, then use **Switch module** or **Switch subject** to choose another permitted course. The names follow the program configuration. Its sessions, artifacts and attempts remain separate. Materials shows the synthetic edition/date and eight named sources; Chat/Studio retain their capacity boundaries. Unsupported personal Workspace, Calendar, global Sources and Progress are excluded from this complete mock navigation; they have no approved standalone journey.

Program configuration supplies the local Module/Subject names in search, empty results, course details, course switching and supporting-source links. **Subjects** stays the global catalog destination. Arabic uses **مصادر المذاكرة** for learning materials so it remains distinct from the course collection.

Reading capability is separate from availability for learning tools. Materials and the contextual **Material library** show the same collection. Every row states what can be read: the first handout has **Read processed passage**, the recording has **Read transcript excerpt**, and the remaining rows explain that no reading passage or verified locator is supplied. These are fixed processed excerpts; full PDF reading and audio playback are not provided. The dense scenario keeps 24 rows with the same two readable excerpts. An inactive handout is excluded from new study and loses its current reading action; the recording remains available.

Settings shows the signed-in sample name and assigned role above its panels. **Sign out** stays visible in the same place across Appearance, Academic settings, Privacy and Identity and access. The named student profile keeps its **Settings** caption at every breakpoint; staff keep **Account**. Theme preview uses a neutral example screen for all roles. System, Light and Dark retain their existing behavior. The four synthetic accounts already have Privacy controls; guarded real Settings does not yet expose those controls and this slice does not add them.

On phones, the course title and four tools stay visible while the program’s details disclosure holds the secondary academic context. **Study options** holds Chat output language and the **Module sources** or **Subject sources** link; desktop keeps these controls directly visible. Sessions, citation help and the privacy notice remain available. Normal Chat uses one conversation scroll area; Studio, Materials and Quiz use the main reading area. When enlarged text or a short viewport leaves too little space, the page becomes the reading scroll area and global navigation follows it at the bottom. This browser layout does not certify an actual phone keyboard or safe area.

Sources lists the eight invented source records with title/format/locator and explicit sample readiness. Evidence shows the exact source rows for the selected exchange; it never invents a citation for unsupported content.

## 3. Chat, evidence, reports and privacy

Paste one prompt below into **Message**, choose English/Arabic/mixed study language, then **Send**. The first Send creates a session; **New session** starts another. The response appears automatically after a short simulated stream. **Cancel stream** interrupts it; sending again retries. New sessions and scope switching must not mix exchanges between units or sessions. Typed text lives only in a document-local draft; sending retains fixture classification, never arbitrary prompt text. Unmatched questions return the unavailable-information fixture.

Sessions leads with a topic derived from the first retained question category, keeping its number and reply count underneath. Prepared density titles stay unchanged; follow-up questions do not rename an earlier topic. Unmatched questions use **Other question**, and empty conversations use **New conversation**. No arbitrary question text or invented dates become session metadata. Start two different prompt categories, keep an unsent draft in one, and switch back to check the distinct replies, evidence and draft.

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

Reporting is available only for the exact Chat exchange selected by its link. Studio's source pool, Materials and a general source-library view do not offer a report for an earlier Chat answer. Return to Studio keeps the generated aid and its settings. Missing, ambiguous, invalid or foreign-unit report targets show no submission action. Selecting another answer clears the previous confirmation; changing interface language keeps the same selected answer. Studio/source/quiz report types are not implemented by this repair. Quiz-source return is described below; settings-to-quiz return remains the separate M75 repair.

In Account change **Sharing mode** to Private / no sharing. Return with browser Back and send a new message: the new exchange records private mode; prior exchanges retain their recorded mode. Interface language is separate from study-output language. Retention has no active control because its policy is unapproved. Password recovery and sign-out use normal account navigation.

Prepared study quota, capacity, offline, error and stale examples name the affected tool. Retry or refresh preserves the document-local draft/result; Materials and other tools remain available when authorized. Persistent access, publication and readiness examples offer a safe catalog exit instead of ineffective Retry, and hide the blocked course metadata. Actual role/scope guards still run; ordinary entry strips local fixture selectors. Admin previews retain their return to the exact Admin context.

Unavailable Chat replies distinguish current missing coverage from a currently inactive handout. The covered-question disclosure uses only the available handout sequence and recording emphasis; opening it or Materials keeps the unsent draft. Restoring the handout does not rewrite a retained unavailable reply: send a new covered question for a new answer. Conflict replies keep both excerpts and offer a labelled, read-only **Clarification question** to select and copy yourself. It asks which sequence applies without choosing a winner or sending anything. Source-dialog Escape still restores focus.

## 4. Studio and quizzes

Each completed aid has one **Supporting passages** button that opens its two known excerpts directly. The separate **Module sources** or **Subject sources** footer opens the complete material library and retains the Studio return. Each submitted or expired-unscored quiz correction has **Supporting passages for question** with its question number. It opens only the handout, recording or both that support that explanation. Questions about missing duration or disagreement show both passages; a page/time appears only where the fixed evidence supplies it. Escape or Close returns focus to the same result. **Browse material library** is optional and keeps the current attempt key and review destination. Active unfinished attempts expose no correction or passage action. Retained aid and quiz evidence remains inspectable after handout deactivation, with its current inactive status; new dependent generation stays unavailable.

All six required formats remain in **Artifact type**, grouped by purpose. **Understand** contains structured summary (key ideas together) and study guide (ordered steps). **Practice** contains practice questions (explain an idea, then reveal the answer) and MCQ quiz (answer choices and review corrections). **Review** contains flashcards (recall before turning the card over) and revision pack (a checklist plus recall questions). A short description and source-based example below the selector explain the selected outcome.

For the five generated aids, choose Study sequence or Diagram comparison; English, Arabic or mixed; concise or detailed; short or extended. Press **Generate** and wait for the fixed illustrative aid, or **Cancel preparation** and retry. Studio keeps one current aid per course. A completed new aid replaces it; cancellation or invalid settings keeps the previous aid. Choosing another format only changes the draft. The completed output retains its captured settings and language. Navigation and interface-language changes preserve both. Flashcards retain one card with **Show answer** and **Show question**, plus the current-side cue; cancellation keeps that side and a completed new aid resets it to the question. Inspect the missing/conflicting evidence notice and source navigation. Every aid stays bound to its unit. No generation or durable artifact service runs.

Choosing **MCQ quiz** shows **Set up MCQ quiz** instead of Generate. It opens the existing course Quiz setup directly, where question count, difficulty and timing are chosen once. Studio focus, detail, size and output-language fields do not configure the quiz and are hidden for this choice. The current Studio aid and those draft options remain intact. Selecting MCQ or following its link creates neither a placeholder aid nor an attempt. Existing quiz answers, attempt key and deadline remain unchanged until an explicit Start or Repeat through the existing quiz controls. Quiz continues to enforce source availability; an inactive handout cannot enable a new attempt. The normal Quiz tab reaches the same workspace.

The five generated formats have **120 fixed combinations** in total: 24 per format across focus, detail, length and output language. Extended output adds coverage or recall prompts; detailed output adds explanations. Diagram comparison identifies what the sample instructions establish and leave unknown. No actual diagram labels or visual differences are supplied, so those facts remain unspecified. Mixed output pairs Arabic and English independently of interface language. Practice has one short or three extended questions with revealable answers. A revision pack combines a checklist with questions; a guide presents ordered steps. These examples demonstrate interaction and reading, not model quality or curriculum coverage.

The unchanged `studioExamples` manifest in `test-data.json` also retains legacy MCQ-preview fixtures: 144 fixture-library combinations, including the earlier two/four-prompt previews. Those are compatibility fixtures, not the current generation flow. A previously completed preview stays readable and can open the same Quiz setup; the current MCQ choice never generates one. Historical design-checkpoint instructions describe their accepted predecessor. Cancellation keeps the previous completed aid; unknown settings show an error without replacing it.

Open Quiz. Choose Untimed or Timed, then **Start quiz**. Starting opens `/quiz/sample-attempt`. Questions are numbered and show answered/total progress. During an attempt, progress stays visible while you read the questions; the labelled timer shows minutes:seconds, or Untimed. A text warning appears below one minute. Changing viewport or opening another view does not restart the deadline. Submission is disabled until every answer is selected; the nearby message lists the unanswered questions. Correct answers are **Identify labels** and **No duration is supplied**; these give an illustrative **2 / 2**. **Compare diagrams** and **An exact duration** give **0 / 2**. Mixed selections give **1 / 2**. Submit to open `/quiz/sample-attempt/review`, with explicit Correct/Incorrect outcomes, Your answer, Correct answer and grounded explanations. Submission and expired attempts use one key-bound review destination. Old completed-attempt routes return to that same review; no review self-link remains. Repeat this setup starts fresh questions with the same difficulty, count, timing and a new timer. Back to quiz lets you edit the retained setup; Use default setup resets only the form. Repeated submission cannot change a scored fixture.

Timed mode uses the selected sample duration of 1–240 minutes; this does not define an approved production time limit. Let an unsubmitted attempt expire: its questions and selections stay visible, locked and unscored. Review answered/unanswered counts and each correction, including unanswered questions. Expiry opens that same work at the canonical review destination. Start a new attempt separately from Quiz. Reloading clears all attempts.

During an attempt, submitted review or expired review, **Browse material library** preserves that quiz's origin. Use **Return to quiz attempt** or **Return to quiz review** to return to the same selections and scored or expired/unscored outcome. Interface language changes preserve this target. The source library remains the fixed unit pool; it does not select a question-specific citation or offer Chat reporting.

Each synthetic attempt has a document-local inspection key. A missing, ambiguous, replaced or foreign quiz target gives an explicit notice and **Open Quiz** exit instead of guessing another attempt. The return destination checks the key too. Ordinary Open attempt links still open the current attempt. Time spent reading sources counts against the original deadline; returning after an unsubmitted attempt expires shows the existing expired/unscored outcome immediately. A submitted score remains reviewable after its original deadline. Every answer and submission checks the deadline even between timer ticks. Per-unit quiz setup drafts survive ordinary navigation and language changes in this document, including invalid input. Editing the draft or using defaults does not change the current attempt. Count errors describe whole numbers1–6; duration errors describe whole minutes1–240 only in Timed mode. Reload/sign-out clears the setup drafts. This does not add durable history, account-persistent settings or a real source/quiz service.

Open Settings from Quiz setup, an attempt, submitted review or expired review. The return link names the exact tool and subject, such as **Return to quiz attempt · Anatomy**, and retains that attempt's inspection key, selections and score. Changing interface language keeps the same target. Time spent in Settings also counts against the original deadline. Chat and Studio returns now name their subject too. A rejected route or source/report detour does not replace the last valid tool.

The synthetic Study Shelf uses that same one recent destination and names Quiz correctly after quiz work. It validates the available scope and current attempt before offering a return; a missing, replaced or foreign object cannot borrow another attempt. Fresh documents clear this memory. This adds no history, saved setup draft or academic-program reconciliation; those remain separate repairs. Real Study resume retains its existing caller-scoped current-cohort open-Chat-session contract.

## 5. Batch Leader

Sign out, use `leader@example.invalid`, and accept commitments. Navigation is
**Source intake, Latest submissions, Account**. Source intake lists your assigned
campaigns. **Your deadline** is the earlier of your assignment expiry and the
campaign closing time, shown in Cairo time. Expand **Assignment and campaign
dates** to compare the two dates. The prepared demo keeps its fixed reference
clock; real services still decide permission and expiry.

Open **Anatomy lecture and practical sources** using **Open requests**. The campaign puts
**Awaiting your action** first: the handout, recording and diagram initially need
files. Recorded processing/review examples appear below. Received requests leave
unfinished work; an actionable correction stays there with its specific reason.

For one request, use its **Upload file** button. It opens the existing chooser for
that exact request. A mismatched format cannot silently move to another request:
remove it and choose the requested file type. For several files, use **Upload
files**, then **Choose files** or desktop drop to add the supplied PDF, WAV and PNG
together. The bulk queue infers a unique compatible destination; choose a
destination when several match. Unsupported or unmatched files explain the
remedy. There is no manual format classification.

Each unfinished row identifies **Origin: Your device** or **Origin: Approved
reference** (Arabic: **المصدر: جهازك** / **المصدر: مرجع معتمد**). The approved
reference still requires validation and a rights declaration. Filenames and the
supplied source title remain unchanged.

| Input                           | Supplied value                                                        |
| ------------------------------- | --------------------------------------------------------------------- |
| Source title                    | `Upper limb lecture material` — use this exact title for the supplied demo |
| Professor or source description | `Dr. Hala Mansour's upper limb lectures, shared by the Anatomy department.` |
| Handout                         | `synthetic-handout.pdf`                                               |
| Recording                       | `synthetic-recording.wav`                                             |
| Diagram                         | `synthetic-diagram.png`                                               |
| Rights                          | Declare rights for these supplied fixtures after adding files         |
| Approved reference              | Existing fixed synthetic handout reference; no actual URL or storage  |

Review the destinations, description and permission, then **Submit files**.
Each file has separate progress and recovery. Successful rows leave the editable
queue and become compact receipts under **Recorded submissions**. Expand one to
inspect its filename, captured title, description, permission and latest known
status. These receipt details cannot edit an earlier submission. **Received**
means intake completed; processing, review and student availability are separate.
Completion is announced, with focus handed to a receipt when the finished control
disappears. Focus stays put if you have moved to another control.

**Latest submissions** shows one latest record per request in your current
campaigns. It is not a complete archive. Every **Open request** link returns to
that exact request and record, opens its receipt and focuses the summary. Opening
a record does not select a file or start a correction. Missing, stale, foreign,
duplicate or mixed selectors show an unavailable state with a safe exit.

Keep three pending PDF/WAV/PNG files, visit Latest submissions or Account, then
return. Files, origin, destination, title, description, rights, keys and recovery
state remain within this document. Navigation during upload cancels that attempt;
return and **Retry upload**. **Retry submission** uses a retained upload receipt
without uploading the same bytes again. New files require renewed permission.
Signing out or reloading clears these demo drafts and receipts. A replacement
identifies its earlier submission while being prepared; only the latest received
record is listed afterward. This supplies no durable production draft or archive.

Permanent failures require a change: an integrity failure needs an intact file,
oversize needs a smaller supported file, and rejected rights needs a file you are
permitted to share. Remove the rejected row before choosing another file. These
rows cannot enter individual or bulk retry. The duplicate example starts with a
recorded handout; **View recorded submission** reaches its recorded section.
Offline interruption retains receipt-aware retry. No provider diagnostic is shown.

For the local correction example, start a fresh document at
`http://127.0.0.1:3101/batch-leader/campaigns/sample-campaign?fixture=corrections&lang=en`.
The required handout needs source context; the recording needs a complete file.
**Fix information / Replace file** opens the exact request, earlier submission
and review reason. Choose the supplied matching file, update the description
where needed, and declare permission again. The candidate gets a fresh key and
receipt while the earlier submission stays unchanged. Stale, changed, ambiguous,
foreign and read-only correction targets remain unavailable. Retained correction
receipts also check their bound request, predecessor and action; omitting those
fields cannot bypass the check. Historical tracking examples have no correction
action. This preparation remains local; ordinary synthetic sign-in does not
prepare correction fixtures.

Prepared interruption, checksum, duplicate, oversize and rights cases are below.
Opening Upload files preserves the prepared scenario. Try `synthetic-rejected.txt`:
unsupported bytes are rejected. Only pack fixtures are accepted; matching names
and sizes still require an exact local byte comparison. This demo makes no server
upload or finalization call.

Open the supplied [invitation](http://127.0.0.1:3101/batch-leader/invitation?lang=en);
sign in if prompted. **Accept invitation** records a fixed demo result and returns
to the campaign. Expired/replayed assignments keep safe exits and no upload
action. No email, real assignment or additional access is created.

## 6. Admin

Sign out and sign in as `admin@example.invalid`. Navigation groups the existing routes under **Decision queue, Content, Academics, Access context, Operations**; Account is a utility destination. On phones open **Menu** to change sections. Review all eight resource destinations: Catalog, Cohorts, Campaigns, Sources, Jobs, Quality, Usage and capacity, Incidents. Configuration/draft controls expose fixed approved sample concepts only. Broad catalog editors, arbitrary invitation recipients, storage-reference policy, operational processing and report/retention policy are not implemented or decided.

The synthetic campaign has a fixed cohort/unit, handout/recording/diagram requests and expiry. Creating its draft and reviewing its invitation only update memory; no email or assignment is created. Resource pages list their fixed sources, jobs, reviews, capacity and incidents as rows with their current state; each row's short verb (for example **Quarantine** or **Lock**) leads to the same actual decision queue component used by the working application. **How this view works** keeps the fixed lifecycle summary.

In Campaigns, check the existing invitation prerequisite, then use **Review invitation example**. The result confirms review; it does not send email or grant access. The hosted button says **Review invitation** and its result says **Invitation reviewed**. In Cohorts, **Review cohort configuration** reviews the displayed fixed cohort and curriculum edition; it does not save an editable draft or unlock the cohort.

In Quality, **Inspect student conflict example** opens one separate prepared conversation: the handout puts identification first, while the recording puts comparison first. Inspect **Two source excerpts**, then **Open evidence details** to see the two contributing sources for that exact exchange. **Return to Admin** remains available. Earlier conversations and unsent drafts stay in their original sessions; repeated inspection reuses the prepared conversation. The preview is unavailable while its source or access prerequisites are unavailable. It demonstrates an existing fixed conflict, without processing or resolving it.

Access context shows existing cohort/assignment context and links, with no directory or membership editor. Select a named decision row on desktop or phone. Its detail moves into view and receives focus, including when selecting the same row again. On phones **Back to decisions** returns focus to the selected row.

Use reason **`Synthetic readiness review.`**, or Arabic **`مراجعة جاهزية تجريبية.`**. Inspect readiness predicates and current/proposed state, press **Review and record**, then the normal confirmation button. The count tabs in the band (All, Needs you, Waiting, Blocked, Done) filter the list and each count matches its list.

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

The queue names the unit, cohort, source version, raw object or artifact control before
its exact ID. Expand **Exact target ID** for verification; current/proposed state and
version remain visible. The consequence appears before the reason field. The final
confirmation button names the exact action, including protected and second-founder
confirmations.

Apply Hide, Lock, Deactivate, Quarantine and Disable. Each shows its recorded success
without a readiness-error message. **Already in requested state** is neutral repeat
prevention, not a new success receipt. **Completed** keeps these rows available for
inspection, while the needing-action count excludes them. Genuine readiness failures,
owner-review retry and the provider/budget gate remain distinct.

For a hold, the next reviewer sees the original reason, canonical expiry and initiating
target version read-only. Their own attestation starts unchecked. **Open this pending
decision** selects only that current candidate, target, action, version and pending
command. Duplicate, changed, foreign, stale or reset-document links cannot select a
fresh proposal. This link requires a current authorized session; login-return selection
and durable cross-document synthetic handoff are not implemented here. If recorded
expiry is unavailable, review stays disabled rather than asking the reviewer to retype
it. The local **missing-pending-expiry** case exercises that safe failure.

Use the local **error-page** queue case, then **Recheck current decisions**. The read
shows pending feedback and a current queue without submitting an action. A persistent
unavailable real/preview queue remains unavailable and reports no submission. Stale or
uncertain action results keep their existing explicit reload/review process; a recheck
never automatically resends a mutation. Resource and catalog continuity are described below.

Resource actions now name the related current candidate. Sources opens the failed
recording's Quarantine review; Jobs opens its retry review; Quality and Incidents
open the unit's Hide review; Usage opens Disable; Catalog and Cohorts open their
publication or lock review. Inspect the exact target, action and version before
acting. **All decisions** keeps the general queue available. Campaign configuration
has no governed campaign operation in this queue, so it retains the general link.
The working backend's unavailable resource pages remain unavailable.

From Sources, open its named decision, then **Preview student**. Use Chat, supporting
Evidence or Studio and **Return to Admin**: the same current decision is selected.
**Return to Sources** then opens the originating resource. From a resource's
**Preview exact student scope**, returning opens that resource directly. The Quality
conflict and local Usage capacity examples follow the same return rule. Direct
student-preview entry without an admin origin returns to the general queue.
Closed document memory binds the role, unit, cohort, resource and optional exact
candidate. A changed version/proposal, another unit, another admin role or an unsafe
or duplicated origin falls back to the general queue. URL context grants no access.
Sign-out clears this transient return context; reload starts a new document.

In Catalog choose **Subject**, review and save the draft. Navigate away and return:
both the control and saved receipt show Subject. Choose **Module** without saving,
leave and return: Module remains selected, an unsaved message is visible, and the
saved receipt still names Subject. Changing a reviewed choice closes its Save step;
review the current choice again before saving. Locale changes retain both values.
Ordinary navigation preserves the current choice only in this document. Sign-out
discards an unsaved edit; a new document resets the example. Draft saving does not
publish anything or change availability.

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
| Campaign correction                                      | `corrections`                                                                                                    | Required handout information and recording replacement with exact permitted repair targets |
| `/admin`                                                 | `empty`, `forbidden`, `error-page`, `blocked`, `pending`, `missing-pending-expiry`, `stale`, `error`             | Empty/unavailable queue, readiness block, distinct confirmation, stale/error action result |
| Any admin resource                                       | `loading`, `empty`, `error`, `offline`, `forbidden`                                                              | Same normal state/recovery contract                                                        |

For example, paste `http://127.0.0.1:3101/learn/zagazig-university-human-medicine-year-1-term-1-cohort/zagazig-university-human-medicine-y1-t1-anatomy/chat?fixture=offline&lang=en`, then sign in and consent. Use Retry to restore the normal chat screen in the same document. No hidden scenario picker is needed.

## 8. Languages, layouts and isolation

Repeat with **Interface language / لغة الواجهة** in the app and **العربية** on public/auth pages; verify RTL and intact values/scope. Switch output language independently to mixed Arabic/English. Inspect desktop 1440px, tablet 768px, mobile 390px and narrow mobile 320px. Try keyboard Tab/Shift+Tab/Enter, visible focus, 200% text scaling, reduced motion and long labels.

A new tab/document begins without previous synthetic sessions, attempts, uploads or changes. Reload also clears them. Returning with product links/browser Back preserves the current document. Synthetic credentials or consent cannot unlock a real session. The loopback launcher is unavailable in production; hosted synthetic mode requires an approved credential pair on normal login. Query parameters cannot activate either mode. Synthetic uploads never issue an HTTP upload request.

## What is functional and what is simulated

Already functional WP03 seams: real Auth/verification/consent/recovery, authorized catalog availability and workspace/session boundaries, validated campaign uploads/submission lifecycle, governed admin actions and role/authorization/error contracts. The demo shares their existing frontend components while injecting synthetic ports. Those services remain separately protected and are not exercised by this review.

Simulated here: all account state and every review interaction; automatic chat replies/streams, evidence/report receipt, all artifacts, scoring/timer, files/progress/reference acceptance, tracking transitions, campaign/draft/invitation state, admin decisions, resource operations and preference changes. Future real backend work remains in WP04/WP06/WP07/WP08. Reload durability is intentionally absent.

Open decisions remain D-08 saving/retention and exact report disclosure/payload, D-18 reference/storage policy, paid provider/budget approval, detailed broad management editors and invitation delivery contracts. This frontend review neither approves those decisions nor verifies live academic/provider behavior. Historical WP03-T09/T10 delivery is complete for the candidates recorded in the runbook. The current audit repairs on `codex/frontend-refinements` are uncommitted local work under WP03-T13; their final candidate acceptance and delivery proof remain pending.

### Checkpoint coverage and boundaries

The audit map and prioritized corrections are in `docs/reviews/wp03-frontend-overhaul.md`, also supplied as `frontend-overhaul.md` in the pack. Prepared access, study failure, collection failure and admin recovery cases use the normal URLs and forms above; EN/AR/RTL, 1440/768/390/320, focus, enlarged text and accessible controls are checked. The shared system covers public/auth, study/account, Batch Leader and Admin. The recorded role checkpoints and final consistency acceptance belong to their historical candidates. Current audit-repair proof is recorded separately in WP03-T13 and does not replace the final review of all frontend refinements. Historical audit defects describe the predecessor, not the current candidate.

Chat Cancel is a real working simulated control: after cancellation the typed draft remains, no reply/evidence is added later, and Send retries. Both pointer and keyboard behavior are covered. All review answers, artifacts, sessions, scoring, uploads, receipts and governed examples use deterministic document-local services. Existing default WP03 identity/access/catalog/collection/governance services remain the functional protected implementation when demo mode is absent; later generation backends, persistence, email/invitation delivery and paid providers are not supplied by this sample.

Remaining decisions: D-08 retention/report payload and disclosure; D-18 real storage reference; financial/provider enablement and caps; broad management/invitation delivery; final acceptance of the current frontend refinements. The supplied Open Folio kit is integrated; no new logo selection is pending. No review choice decides those policies.
