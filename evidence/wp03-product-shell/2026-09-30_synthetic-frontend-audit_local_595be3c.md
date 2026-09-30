# WP03 frontend review audit and scope

Status: implemented and locally verified; founder material checkpoint and protected delivery pending. No final gate PASS, full-suite PASS or production deployment is claimed.

Executor: Codex `/root`; speaker/checkpoint: Ahmed; base `595be3c`. Single executor, synthetic fixtures, mock providers, paid budget zero. Authority: master-plan 6–8, WP03/06/07/08, DESIGN.md, frontend floor. The supplied audit is a starting point, independently checked against source and rendered app.

## Findings and disposition

| Finding | Independent evidence | Disposition |
| --- | --- | --- |
| Review board exposes real auth forms and a hardcoded local port | `public/wp03-review.html` contained `/login`, `/register` and `http://127.0.0.1:3101`; file is a local excluded review artifact | Replace the local artifact with a relative redirect; deliver canonical `/preview/review` entry in source |
| Every preview request could refresh the reviewer's real session | `src/proxy.ts` always called `refreshSupabaseSession`; latter invokes `getClaims` and can write cookies | Exact `/preview` prefix bypass returns no-store/noindex without Auth; real `/learn`, `/admin`, APIs and prefix lookalikes still refresh. Executed focused unit proof: 12/12 |
| Workspace offers no messaging/evidence/report traversal | In-app rendered original Anatomy Chat shows disabled composer, no sessions and “Messaging is not available in WP03-T04.” Source confirms planned Studio/Quiz | Dedicated fixed frontend examples; original protected/legacy WP03 seams preserved |
| Admin resources are spans; outcome does not change candidate | In-app original admin containment preview shows seven resource spans and published/withdrawn version-2 candidate; static server outcome map confirms no candidate update | Eight navigable synthetic resources and twelve action examples; local record/journal/availability update |
| Missing Settings and attempt routes, incomplete unit source list/scope switcher | Route inventory and workspace-frame/pages inspection agree with supplied audit | Add review-only Settings, fixed quiz attempt/review, metadata source list and scope/session switching |
| Leader preview lacks invitation/list/reference and coherent submitted state | Collection route/repository/action inspection: fixed campaign, shared server upload state, no reference input; supplied audit records stale Awaiting file after finalize | New tab-local assigned campaign, invitation boundaries, fixed file/reference, coherent requested-item/tracking state |
| Preview server stores are process-wide and not per-tab | Preview workspace/collection repositories use server module maps/fixed caller identifiers | New canonical simulation uses one React provider per document, never browser storage/server maps; reload/reset clears it |
| Evidence links can silently select the last answer | New candidate review identified older exchange links losing identity before proof | Bind links to fixed scoped session/exchange indices and reject absent/foreign selection |
| Successful recovery can immediately look replayed | New candidate review identified consumed marker hiding its own success | Show completion for the current action; subsequent navigation shows used link; fresh recovery resets fixture marker |
| Hide/lock/source-deactivation should not leave the simulated scope available | Cross-journey consistency review | Derive preview catalog and child access from tab-local simulated availability; reset restores fixtures |

## Scope decisions from authority

All approved product journeys have frontend owners under WP03-T09. Future WP06/07/08 work remains backend work, not silently marked complete. Existing T01–T08 task/evidence history is preserved.

Calendar, personal Workspace, global Progress and global Sources have no approved standalone screen behavior, so they are absent from the new canonical journey. Unit sources remain available. No account deletion, billing, personal notebooks or arbitrary student uploads are invented.

Open decisions stay explicit: D-08 saving/retention/report disclosure and exact report payload; D-18 storage/reference validation; provider/model/budget decisions for numeric allowances, reset periods and paid enablement; real pilot configuration and source rights. There are no arbitrary URL/email/password/file inputs.

## Verification map

`tests/e2e/synthetic-review.spec.ts` owns complete route coverage, responsive/a11y/language checks and allowed/forbidden review interactions. `tests/unit/auth-session-proxy.test.ts` owns Auth-refresh exclusion and continued real-route refresh. Existing WP03 role/API/database/security evidence remains authoritative for unchanged functional services, with affected E2E regressions rerun. Screenshots are supplemental only; browser accessibility-tree smoke is not claimed as a spoken screen-reader run.

Material interaction disposition: MATERIAL, founder checkpoint pending after technical proof. D-22 permits non-financial delivery but does not accept the new interaction design. WP03-T10 owns final complete-product review before WP04 resumes.

## Final candidate coverage and proof

The canonical entry is `http://127.0.0.1:3101/preview/review?lang=en` while the task's synthetic-configured development server runs. Arabic is `?lang=ar`; the header switches language and resets the fixture. The legacy board redirects relatively to this entry. Navigation remains within `/preview/review`. The state is memory-only per document; reset, reload or another tab starts independently.

Thirty route fixtures cover review home; six access/consent/recovery routes; Settings; catalog; unit overview, Chat, evidence, reporting, six Studio artifact examples, quiz setup/attempt/review; Batch Leader assignments, invitation boundaries, collection/tracking; admin decision queue and eight resources. Catalog fixtures include five program configurations, including flexible-credit modules. Shared scope/availability, language and session/exchange identity are explicit throughout. All twelve governed-action examples distinguish local state from protected changes; enabling a provider is disabled.

Selectable generic states include loading, empty, error, offline, stale and forbidden. Journey cases add verified/unverified/current/outdated/suspended/replayed/expired account states; seven answer kinds, stream completion/cancellation and scope isolation; missing/conflicting material, quiz answer/score/review; upload rights/type/size/checksum/duplicate failures, cancellation/retry/reference selection and six tracking statuses; readiness, missing approval, pending, stale and error decisions. Unsupported standalone Calendar/Progress/personal Workspace/global Sources entries are removed from the mock navigation rather than assigned invented behavior.

| Proof | Executed result and limits |
| --- | --- |
| Focused preview Auth proxy unit | 12/12 PASS; real guards and prefix lookalikes remain covered |
| Final synthetic browser suite | 14/14 PASS after final runtime changes |
| Affected existing WP03 browser contracts | 15/15 PASS (10 Study Shelf, 5 workspace); unchanged proof reused |
| Language, layout and accessibility | EN/AR 30-route matrix; 1440/768/390/320; axe WCAG AA, focus/skip link, 200% text scaling, reduced motion, touch targets; not a spoken screen-reader test |
| Isolation and forbidden effects | No POST/API/Auth/provider request or Auth cookie; fixed credential/source choices; cross-tab/reset/scope containment |
| Security tests | 44/44 PASS across ten files |
| Build and static proof | Lint, both typecheck modes (normal after type generation), boundaries, production environment build and client privileged-canary scan PASS |
| Repository readiness and secrets | Agent readiness PASS; secret scan PASS; changed-file/full diff review and whitespace check PASS |
| Rendered inspection | Native in-app EN desktop and AR mobile; admin hide blocks student scope and reset restores it; three supplemental screenshots |
| Full guarded proof and release | NOT RUN; genuine founder MATERIAL receipt required. Exact-head CI/merge/production proof pending |

An early accidentally broad browser invocation was interrupted after 46 existing passes and new-test failures. Those failures were corrected and the affected suites rerun; that interrupted invocation is not a full-suite PASS. Generated development type metadata was restored and is not part of the change.

## Integrated frontend audit

One Impeccable detector scan found three font-ramp deviations; all were changed to the existing locale type tokens. Manual review used the same candidate and the bounded browser proof above. On the skill's 0–4 scale: accessibility 3, performance 3, responsive behavior 4, theming 4, content/interaction integrity 4. Performance is based on static fixture design and successful build, not a throughput or production benchmark. Accessibility has automated and keyboard proof but no spoken assistive-technology run. No known blocking finding remains in the implemented candidate; founder acceptance and release are outstanding gates.

The additional defects found during candidate review were exact evidence identity, recovery success/replay ordering, duplicate consent announcements, misleading “approved/progress” mock copy, and cross-role availability inconsistency. Their corrections are exercised by the final suite. Supplementary screenshots show EN desktop home, AR mobile home and AR mobile admin; route/state proof comes from tests and rendered interactions, not screenshots alone.

The already-functional WP03 Auth, catalog/workspace guards, collection application and governed-action application remain separate. The new access, study answers, artifacts, scoring, reporting, collection tracking, drafts and administrative outcomes are simulated only. Nothing here proves unfinished WP04/WP06/WP07/WP08 backend work complete.

The shell's automatic approval review rejected a production-style local preview launch with only “blocked by policy”; it was not executed. A synthetic-configured development launch succeeded and supplies the local review entry. A later external Chrome launch was also rejected; the review is open in the in-app browser. No rejected operation was bypassed.

## Rollback

Revert task-only review routes/components/links and the exact public-preview proxy branch; preserve real services, database schema and audit history. The prior verified production artifact remains unchanged until exact-head delivery and affected release proof are complete.
