# Task record: WP03-T11 hosted synthetic login

**Task ID:** WP03-T11

**Status:** [x]

**Outcome:** The existing live site's normal login recognizes the four approved synthetic credential pairs, enters a document-local simulated role flow with no extra presentation, and exits on sign-out.

**Owner:** Codex `/root`; Ahmed is the selected speaker. No delegation.

**Reviewer:** Inline technical review; formal exact-head approval by aboayman-oss, a distinct authorized account controlled by the same executor. This is not independent review. Ahmed's explicit request governs the existing-UI behavior; D-22 authorizes non-financial delivery.

**Branch:** main; runtime delivered through codex/wp03-hosted-synthetic-login / PR #69; documentation closure through codex/wp03-hosted-synthetic-login-close

**Updated (UTC):** 2026-10-04T16:44:00Z

## Derived execution envelope

**Policy version:** 10

**Surfaces:** docs, frontend, runtime, auth, data, storage, delivery, tooling

**Risk:** R3

**Planning:** Protected

**Worker budget:** 0 used; maximum 1; no nested workers; no delegation authorized.

**Capabilities:** data-integrity, frontend-quality-floor, release-safety, storage-safety, trust-boundaries

**Procedural skills:** trust-boundaries; diagnosing-bugs; browser; finalize

**Routing reason:** Credential interception and shared browser navigation affect authentication presentation and production runtime, while backend identity and authorization remain unchanged.

## Manual model work blocks

| Block | Assigned model | Scope and governing inputs | Independent acceptance checks, including failure cases | Assignment reason | Status and evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Sol High | User's approved one-site/browser-memory/no-extra-UI brief; T09/T10 shared views; credential entry, local routing, sign-out, isolation and delivery | All four exact pairs enter their roles; wrong password and ordinary accounts use normal Auth; zero synthetic service mutations; refresh/new-tab/sign-out reset; shared EN/AR mobile UI; real guards intact; exact-head CI and production proof | Cross-router and authentication boundaries require one coherent executor | Complete; guarded local gate, protected PR #69 and production evidence |

**Next model:** NONE

**Current block:** NONE; the manual Sol High assignment is complete. This records the work plan, not certification of the Desktop model.

## Execution contract

**Dependencies:** WP03-T09 and WP03-T10 delivered and closed; existing production source a74abe5.

**Inputs:** User approves student/leader/admin/second-admin@example.invalid with Synthetic-study-2026!, entered only through normal login. Existing synthetic fixtures, approved DESIGN and product components. No dataset seeding or real-provider enablement.

**Files:** Shared frontend navigation/provider, normal AuthForm, browser synthetic composition, fixture route resolver, shared views, rejecting unit/security/E2E tests, README/review guide/DESIGN/runbook/task/evidence. Real identity adapters, database policies and service mutations retain authority.

**Verify:** Focused credential/unit and hosted synthetic E2E tests; typecheck, lint, boundaries, security, secrets, bounded EN/AR desktop/mobile side-browser inspection; guarded pnpm verify; exact-head required CI; affected production smoke and credential journeys.

**Pass:** Exact approved login pairs enter isolated browser-memory flows at normal URLs with no chooser/banner/prefill; normal credentials still dispatch Auth; navigation/back/locale preserve synthetic state; sign-out clears it and restores normal login; reload/new document retain no synthetic identity or activity; no API/Auth/upload/admin/provider mutation from synthetic interactions; backend roles cannot be acquired with synthetic credentials.

**Evidence:** evidence/wp03-product-shell/2026-10-04_hosted-synthetic-login_local_2bfe017.md; evidence/wp03-product-shell/2026-10-04_hosted-synthetic-login_production_9dbb2a3.md

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
- [x] Execute focused allowed/forbidden and bounded rendered proof; review final candidate and complete full regression.
- [x] Run required verification, protected delivery and affected production proof; record closure and task-scoped cleanup.

## Handoff

**Changed:** Existing normal-login credential interception selects lazy browser fixture services; shared links/router use native history during simulation; hosted copy/prefill/banner additions are removed; sign-out discards the document. Route hooks and Suspense stay inside the synthetic subtree, and only hosted login receives interception; native overrides and ordinary non-login forms retain direct action references. Hosted Admin accepts ordinary reasons and future attested hold dates. No backend identity, schema, storage rule or provider change.

**Commands:** Guarded corepack pnpm verify exited 0 at 2026-10-04T14:22:19Z with unchanged starting/ending fingerprint b27778002a7f029d4802a166832cd76c4f5df16a22692f42952e9f17cd91d27b: static/secret checks; 594 unit; 15 local integration plus two hosted-only skips; 44 security; evaluation/load contracts; 74/74 normal/runtime and 49/49 native browser; safe production build and client secret scan PASS. next-env.d.ts has no generated drift. Focused credential, RSC, native Auth and EN/AR Admin proofs passed as recorded in local evidence. Full diff/stat, secret/scope and inline trust review found no unresolved findings. Runtime PR #69 exact head ac61f0a4d9e20fc4e778a962a7d12ea37bfb1d6f passed all four required checks in run 37209378907. Merge 9dbb2a35e7e7b791fd34ec3580ae81d2f068c6a5 has identical reviewed tree a2a301d75582d9fe5c095b5cd62ea555cf08f6f3; merged runtime run 37210488840 completed successfully (application/database PASS; governed main-push dependency-audit skip). Byte-identical versioned source archive deployed once. Prepromotion/public release fingerprints, seven smoke checks, auth cache/private guard, direct synthetic route denial and actual anonymous upload denial PASS. All eight EN/AR role journeys passed before and after promotion, zero retries. Bounded production logs: 80 records, no warning/error/fatal or 5xx. Live side-browser login/consent/EN Admin inspected and captured; prior unchanged AR/mobile rendering and accessibility proof retained. Only terminal Markdown formatting/readiness/secrets and exact-head governed closure CI remain as delivery mechanics; runtime proof is reused without redeployment.

**Remaining:** NONE in implementation, runbook acceptance or affected production behavior. The closure records follow protected delivery and cleanup before the final report. Open real-data/provider decisions retain their scope; no next task was started.

**Next safe action:** Merge the reviewed documentation closure only after exact-head required checks and distinct-account approval; synchronize main, remove merged runtime/closure branches and task-created source/cache staging, preserving sanitized evidence, unrelated logo checkout, landing branch and recovery tags. No runtime redeployment for documentation-only closure.

**Reviewer action:** Runtime PR #69 authored/merged by unimind989-sys; formal exact-head APPROVED review 5406713689 by aboayman-oss. Same executor controls both accounts, so distinct-account approval is satisfied and independent review is not claimed. Inline review has no findings; actual branch protection was honored without bypass. Ahmed's existing-UI request and D-22 supply authorization, not new material design acceptance. Automatic finalize release authorization binds exact source/deployment/rollback before promotion.

**Production:** Verified team unimind2 / team_rf0YAPUJBDuZQ8ZB2zbx8SO9 and project unimind-preview / prj_pVmnuEUakL8R5ap78cAalBjwymbO from the correct repository. Public project-xwrez.vercel.app resolves to dpl_BcdaiwE8GqoDceqA3TXAHfzqNASA, source 9dbb2a3, release wp03-t11-9dbb2a3-production. Hobby/free with no trial, budget 0, mock mode, generation/embedding/transcription disabled and telemetry disabled. Rollback dpl_F5ZqTumH3YT79a175Gnwk6PxVjqZ/source a74abe5 retained. Hosted Supabase mutation was skipped: no hosted schema/authorization/storage dependency changed; disposable database CI covers the conservative trust envelope. No real credentials, user data or paid provider were exercised.

**Failure history:** The inherited full run FAILED at 73/74 normal RSC navigation; unchanged focused reruns passed, original cause unproved. A resumed completed gate FAILED at 74/74 normal and 48/49 native Auth consent; unchanged focused replays passed, cause unproved. Interrupted gates have no completed PASS receipt. A native startup timed out before tests; recovery followed generated development-cache archival without a proved causal diagnosis. Conservative root/dispatch isolation changes do not prove those causes. Generated declaration drift was restored before freeze. All retained failures and later complete stable proof remain in the dated local evidence and ignored logs/trace/screenshots. Prepared delivery helpers also failed on a structured CLI-output parser and nonexistent upload path; exact existing deployment identity and the correct guarded route were subsequently verified. The first prepromotion browser probe caught hosting feedback OPTIONS and queued ordinary-login prefetches; focused initiator evidence identified Vercel feedback. The task-local harness blocks feedback before normal page load and settles ordinary work, while keeping the strict synthetic request assertion. Final prepromotion/public runs passed on the unchanged compiled application. No historical failed run is relabeled PASS.

**Proof reuse:** Preparation fingerprint 1abb69f6d1fa5403c7ffa618d5efb2590497b8b0a6e2ee3d72108325625f1016 binds pre-delivery runtime preparation metadata, not this terminal Markdown closure. The guarded runtime fingerprint above and exact-head CI are source-bound. Later changes are records only and invalidate no executable, configuration, test or acceptance input. Policy 10 remains R3/protected; governed documentation CI may skip heavyweight jobs without claiming they executed.
