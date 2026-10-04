# Task record: WP03-T11 hosted synthetic login

**Task ID:** WP03-T11

**Status:** [~]

**Outcome:** The existing live site's normal login recognizes the four approved synthetic credential pairs, enters a document-local simulated role flow with no extra presentation, and exits on sign-out.

**Owner:** Codex `/root`; Ahmed is the selected speaker. No delegation.

**Reviewer:** Ahmed; explicit conversation authorizes the exact existing-UI behavior and non-financial delivery under D-22.

**Branch:** codex/wp03-hosted-synthetic-login

**Updated (UTC):** 2026-10-04T00:00:00Z

## Derived execution envelope

**Policy version:** 10

**Surfaces:** docs, frontend, runtime, auth, data, storage, delivery, tooling

**Risk:** R3

**Planning:** Protected

**Worker budget:** 0 used; maximum 1; no nested workers; no delegation authorized.

**Capabilities:** data-integrity, frontend-quality-floor, release-safety, storage-safety, trust-boundaries

**Procedural skills:** trust-boundaries; browser; finalize

**Routing reason:** Credential interception and shared browser navigation affect authentication presentation and production runtime, while backend identity and authorization remain unchanged.

## Manual model work blocks

| Block | Assigned model | Scope and governing inputs | Independent acceptance checks, including failure cases | Assignment reason | Status and evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Sol High | User's approved one-site/browser-memory/no-extra-UI brief; T09/T10 shared views; credential entry, local routing, sign-out, isolation and delivery | All four exact pairs enter their roles; wrong password and ordinary accounts use normal Auth; zero synthetic service mutations; refresh/new-tab/sign-out reset; shared EN/AR mobile UI; real guards intact; exact-head CI and production proof | Cross-router and authentication boundaries require one coherent executor | In progress |

**Next model:** Sol High

**Current block:** 1

## Execution contract

**Dependencies:** WP03-T09 and WP03-T10 delivered and closed; existing production source a74abe5.

**Inputs:** User approves student/leader/admin/second-admin@example.invalid with Synthetic-study-2026!, entered only through normal login. Existing synthetic fixtures, approved DESIGN and product components. No dataset seeding or real-provider enablement.

**Files:** Shared frontend navigation/provider, normal AuthForm, browser synthetic composition, fixture route resolver, shared views, rejecting unit/security/E2E tests, README/review guide/DESIGN/runbook/task/evidence. Real identity adapters, database policies and service mutations retain authority.

**Verify:** Focused credential/unit and hosted synthetic E2E tests; typecheck, lint, boundaries, security, secrets, bounded EN/AR desktop/mobile side-browser inspection; guarded pnpm verify; exact-head required CI; affected production smoke and credential journeys.

**Pass:** Exact approved login pairs enter isolated browser-memory flows at normal URLs with no chooser/banner/prefill; normal credentials still dispatch Auth; navigation/back/locale preserve synthetic state; sign-out clears it and restores normal login; reload/new document retain no synthetic identity or activity; no API/Auth/upload/admin/provider mutation from synthetic interactions; backend roles cannot be acquired with synthetic credentials.

**Evidence:** evidence/wp03-product-shell/2026-10-04_hosted-synthetic-login_local_2bfe017.md

**Rollback:** Revert the task-scoped application change and restore the last verified production deployment. No schema/storage mutation exists.

**Hard stop:** Financial exposure, weakening backend authorization, lost unrelated work, false verification or unverified production target. Existing real-data/provider decisions remain open.

## Trust map

1. Real identity remains verified Supabase claims and caller-scoped database authority. Synthetic identity is only browser memory and never a backend principal.
2. Credentials, URLs, history and browser state are client controlled; exact pair matching selects simulated services, never authorization.
3. All real server routes/actions/database policies continue to recompute caller identity and scope. No production proxy exemption or synthetic cookie is introduced.
4. Allowed: submit an approved pair on normal login, accept commitments, navigate and exercise fixed study/leader/admin results locally.
5. Forbidden: wrong-password activation, forged URL activation, synthetic calls to real services, synthetic role reaching real protected endpoints, cross-document persistence.
6. Local Back/Forward and locale changes keep memory; fresh documents reset; sign-out discards state. Real expiry/revocation/cache rules stay unchanged.
7. No input credentials/prompts are persisted or logged; no real identity/source data is copied into the simulation. Fixture credentials are intentionally public invented data.

## Candidate preparation

**Design disposition:** OBJECTIVE_PRESERVING

**Design evidence:** rationale:User explicitly requests identical existing presentation with credential entry and removal of simulation-only additions; baseline:DESIGN.md and delivered T10 candidate a74abe5

**Preparation review:** COMPLETE_INLINE

**Preparation fingerprint:** 1abb69f6d1fa5403c7ffa618d5efb2590497b8b0a6e2ee3d72108325625f1016

**Unresolved findings:** NONE

**Established facts:** NONE

## Steps

- [x] Implement exact credential entry, memory-only navigation and complete sign-out.
- [x] Preserve shared presentation and remove hosted simulation-only UI/prefill.
- [x] Execute focused allowed/forbidden and bounded rendered proof; review final candidate. Full regression remains in the required stable gate.
- [ ] Run required verification, protected delivery and affected production proof; close and clean.

## Handoff

**Changed:** Exact normal-login credential interception selects lazy browser fixture services; shared links/router use native history during simulation; hosted copy/prefill/banner additions are removed; sign-out discards the document. The local review server remains guarded. Conservative proxy classification adds data/storage proof inventory without changing a hosted schema or storage adapter.

**Commands:** corepack pnpm exec playwright test hosted-synthetic-login.spec.ts: exit 0, 10 tests, four roles EN/AR, mobile accessibility/overflow, Student memory/locale/sign-out/refresh/new-tab, Leader upload and Admin local containment, ordinary Auth dispatch and direct-route denial; corepack pnpm test:unit -- synthetic-login auth-session-proxy: exit 0, 27 tests; typecheck:fresh, lint, boundaries, secret scan and agent readiness: exit 0 during preparation; git diff --check: exit 0. Full diff/new modules reviewed inline for secret/scope risk, role authority and real-service leakage; no unresolved findings. Side-browser rendered normal login, consent, EN Admin and AR Leader; screenshots in .local/hosted-synthetic-login. Existing mobile EN/AR E2E proves 390px layout and Axe. Guarded pnpm verify supplies complete application/security/storage/real/local-demo regression; exact-head disposable database CI supplies conservative database contracts. No shared Supabase mutation is warranted. Production source/configuration fingerprint, smoke and all four credential journeys remain mandatory after merge.

**Remaining:** Stable verification, exact-head protected delivery, affected production proof, evidence and cleanup. Two broad runs were deliberately interrupted for scoped review corrections and are not PASS: deeper Admin fixture explanations, then undiscoverable fixture-only Admin reason/expiry validation. The hosted simulator now accepts ordinary 8–500-character reasons and future attested hold dates, retains pending reasons in document memory and preserves the local launcher's fixed-input policy. Current fresh types, lint, boundaries and secret scan passed after the correction. Focused extended Admin EN/AR browser proof passed four tests, exit 0: ordinary reason, future attested hold, protected pending state, all resource summaries, zero service mutations, accessible desktop/mobile and memory navigation. Inline review covers these changes and the existing domain expiry check; bounded side-browser EN desktop and AR 390×844 RTL/zero-overflow render remains applicable because shared presentation is preserved. The complete corrected gate is next.

**Resume verification (4 October):** The inherited full gate FAILED with 73/74 normal/runtime browser tests passing; View status in the RSC privacy contract did not navigate. The unchanged focused rerun passed, and this resumed chat repeated the unchanged test five times with 5/5 PASS; the original cause remains unproved. Generated-only next-env.d.ts drift was inspected and restored before candidate freeze. Route hooks now live inside the lazy synthetic-only subtree, removing the root Suspense boundary and its normal-page rendering dependency. This is an isolation correction, not a proved diagnosis of the intermittent failure. Fresh typechecking, lint, boundaries, secret scanning and readiness passed; focused hosted and RSC browser proof passed 11/11 without retries. Bounded side-browser normal login, consent and EN Admin render was inspected and captured in .local/hosted-synthetic-login/resume-admin-en.png. Prior AR/mobile inspection remains presentation-bound evidence; current EN/AR mobile automated coverage passed. An attempted additional AR side-browser check happened after the test server shut down and supplies no proof. Full native-demo and production build still require the completed guarded gate. Existing implementation was preserved on its original branch and base, with no unrelated changes or transfer required.

**Next safe action:** Push the reviewed candidate for exact-head protected delivery, then affected production proof, task closure and cleanup.

**Interrupted resumed gate:** The first resumed guarded run passed static/unit/integration/security/evaluation/load stages and 38 normal/runtime browser cases before the chat interruption terminated its tool process. It has no completed receipt and is NOT PASS. The prior isolated RSC/hosted 11/11 remains focused proof. A restarted hidden local runner will write an explicit completion receipt; generated declarations are restored before the new freeze. The additional side-browser AR Leader 390px capture exists at .local/hosted-synthetic-login/resume-leader-ar-mobile.png; its DOM/screenshot check occurred before the interrupted browser call completed, so retained screenshot appearance may be inspected but no missing tool result is asserted.

**Reviewer action:** NONE

**Completed resumed failure:** The hidden gate completed at 2026-10-04T13:45:58Z with exit 1: normal/runtime 74/74 PASS, native demo 48/49 FAIL. The native Auth validation/registration/callback/consent/recovery journey reached consent with an UNAVAILABLE response, then timed out looking for Account navigation. The native suite completed; production build did not run. Generated declaration drift also invalidated the ending fingerprint and was restored after completion. The failing trace, screenshot, context, complete result JSON and log were preserved in .local/hosted-synthetic-login/native-auth-failure. Three unchanged focused reruns passed on the running native server; the cause remains unproved. A second isolation correction now intercepts only hosted normal login: native action overrides and every ordinary non-login form retain their original direct useActionState dispatch. Fresh typechecking passed; focused native and hosted Auth verification precede the next frozen gate. Neither this correction nor the earlier root correction is asserted as a causal diagnosis. No delivery or deployment has occurred.

**Native isolation proof:** A new focused native server initially timed out at the unchanged 300-second readiness limit before executing tests, with repeated local proxy socket resets. Its log is retained. After shutdown, only the generated .next/dev directory was archived under the ignored task directory; no source, production type output or unrelated work was removed. The same focused native command then passed 3/3 in 1.1 minutes with no retries. Startup recovery followed the generated-cache archive; neither its exact cause nor the earlier intermittent consent failure's cause is established. Fresh typechecking, scoped AuthForm lint and diff integrity passed after narrowing dispatch. The ending generated declarations will be restored before freezing the next full candidate.

**Current preparation proof:** After dispatch isolation, corepack pnpm exec playwright test hosted-synthetic-login.spec.ts --grep 'hosted en|normal Auth' passed 5/5, exit 0, in 40.3 seconds with no retries; all four roles and ordinary Auth/direct-route denial remain green. The fresh native Auth repeat passed 3/3, exit 0. Current scoped AuthForm lint, fresh types and diff integrity passed. Inline review inspected the final conditional dispatch: only hosted login is intercepted, native overrides and normal non-login forms use their original action references, and every unmatched login input calls actions.login. Existing EN/AR presentation and broader focused proof are reused where unchanged; the next full gate covers all invalidated application seams. No unresolved finding remains.

**Completed stable gate:** Guarded corepack pnpm verify exited 0 at 2026-10-04T14:22:19Z, starting and ending at fingerprint b27778002a7f029d4802a166832cd76c4f5df16a22692f42952e9f17cd91d27b. All static/secret checks, 594 unit, 15 local integration with two hosted-only skips, 44 security, evaluation/load contracts, 74/74 normal/runtime browser and 49/49 native-demo cases, safe production build and client secret scan passed. next-env.d.ts matches the tracked baseline. Subsequent delivery preparation changes only this record and the dated local evidence report: a filename/record-field readiness rejection was corrected, with no application, configuration, test or acceptance change. Relevant documentation formatting, secret/readiness checks and preparation review are repeated; exact-head CI supplies the final committed gate. Full-gate receipt: .local/hosted-synthetic-login/final-stable-completion.json. No push, merge or deployment has occurred yet.
