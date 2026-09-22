# Task record: WP00-T12 proof reuse and review semantics

**Task ID:** WP00-T12

**Status:** [x]

**Outcome:** Proof completeness follows the authoritative selected verification set, human design evidence invalidates only on material or unknown visual impact, and protected delivery records distinct-account approval without claiming independent review.

**Owner:** Codex `/root`; Ahmed is the selected chat speaker

**Reviewer:** D-22 standing Ahmed-and-Ziad authorization applies to protected non-financial delivery; executor-controlled `aboayman-oss` approval is distinct-account approval, not independent review

**Branch:** `wp00/proof-reuse-review-semantics`

**Updated (UTC):** 2026-09-22T14:07:24Z

## Derived execution envelope

**Policy version:** 4

**Surfaces:** docs, delivery, tooling

**Risk:** R2

**Planning:** Short

**Model floor:** Luna Max

**Model runtime:** active model unverified and limitation reported

**Worker budget:** 0 used, maximum 1, nested workers prohibited

**Capabilities:** release-safety

**Procedural skills:** trust-boundaries, skill-maintainer, writing-for-agents, finalize

**Routing reason:** Narrow maintenance of the central verification-selection, evidence-receipt, and protected-review semantics; no product runtime or hosted service state changes.

## Execution contract

**Dependencies:** Merged WP00-T11 workflow correction and its audit evidence; existing policy/router, receipt, task, verification, and finalization seams.

**Inputs:** User-supplied WP00-T11 audit findings; `docs/agents/agent-execution-policy.yaml`; `scripts/lib/agent-execution-policy.ts`; normal route/receipt execution; synthetic deterministic fixtures only.

**Files:** Central policy/router and focused tests; workflow/finalization/runbook terminology; skill adaptation/evaluation records; this task record and sanitized evidence.

**Verify:** Focused policy and receipt regressions; real receipt-generation/reuse path; policy validation; skill validation; agent readiness; proof preflight; `git diff --check`; `git diff --stat`; full diff and changed-file secret/scope review; one broad stable-candidate gate; exact-head required GitHub CI.

**Pass:** Every selected verification requirement automatically appears in proof completeness; human design acceptance reuses on known nonvisual frontend, backend, and docs-only changes, invalidates on material visual changes, and fails conservatively on unknown visual impact; generated receipts carry those semantics; review provenance never turns executor-controlled account switching into independent review.

**Evidence:** `evidence/wp00-pilot/2026-09-22_proof-reuse-review-semantics_local_ba7f01c.md`, protected PR #44, exact-head required checks, and synchronized-main proof. Closure markers become authoritative only when the exact reviewed PR head reaches protected `main`.

**Rollback:** Revert this task through one protected PR. Restore policy schema/code/tests and the prior wording; no database, provider, deployment, billing, or user data state is mutated.

**Hard stop:** Do not modify WP03-T04; do not start WP03-T05; do not broaden WP00, add workers/MCPs/orchestration/telemetry/verification architecture, weaken required proof, claim independent review from executor account switching, expose secrets/private payloads, or perform paid/external production mutations.

## Trust map

- **Authoritative identity/scope:** GitHub's authenticated account and repository permissions prove account separation; the task/PR provenance proves which executing process performed review.
- **Untrusted inputs:** Account display names, prose labels such as “independent,” and executor-supplied receipt JSON cannot prove cognitive independence.
- **Recomputation point:** The central policy/receipt parser and durable delivery record classify selected checks, semantic invalidators, and review provenance from typed inputs.
- **Allowed path:** The executor may switch to an authorized second account for a formal distinct-account approval when that is the actual protected gate.
- **Forbidden path:** The same executor may not label its own second-account approval as independent review or satisfy a gate that explicitly requires a separate reviewer.
- **Stale state:** Candidate SHA, task/policy/schema identity, selected verification, semantic visual-impact facts, and reviewer-process provenance control reuse; malformed, missing, or unknown relevant state fails conservatively.
- **Exposure:** Evidence records sanitized account roles and candidate identifiers only; tokens, browser storage, private payloads, and source content remain excluded.

## Steps

- [x] Replace the duplicate proof taxonomy with selected-verification-derived obligations and focused regressions.
- [x] Extend the existing receipt fingerprint with semantic invalidators and prove real generated receipt reuse/invalidation end to end.
- [x] Correct review terminology and mechanically prevent false independent-review claims.
- [x] Run the bounded verification inventory and one stable broad gate, then complete protected delivery, evidence, synchronization, cleanup, and WP03-T05-next proof.

## Handoff

**Changed:** Policy v4 now derives proof completeness directly from selected verification, emits schema-v2 receipts with selected-check and semantic invalidators, and classifies account separation separately from reviewer-process independence. Workflow/finalization/evidence guidance and the historical WP00-T11 closure wording use the corrected semantics. These closure markers become authoritative only after the exact reviewed PR #44 head reaches protected `main`.

**Commands:** Intent route selected policy v3 before the policy revision; final actual-diff and proof-preflight routes selected policy v4, docs/delivery/tooling, R2, Short, Luna Max floor, zero workers, release-safety, and automatic finalization, with a complete eleven-check inventory and no design gate. Active model remained unverified. Focused policy/type proof passed 44/44 regressions and strict TypeScript. The real CLI receipt path emitted schema v2 semantic invalidators. Skill validation passed 22 skills; agent readiness passed 194 names, 46 links, 23 decisions, and 106 task contracts; isolated handoff rehearsal selected WP00-T12. The one credential-free broad `pnpm verify` gate passed formatting, lint, normal and fresh types, boundaries, 25-migration SQL conventions, CI/policy audits, a 944-file secret scan, 361 unit tests, 15 integration tests with 2 expected hosted-only skips, 24 security tests, 3 evaluation cases, 5 load-contract tests, 24 E2E tests, the production build, and client-artifact scanning.

**Remaining:** NONE after PR #44's exact reviewed head passes required checks, receives executor-controlled distinct-account approval, reaches protected `main`, and cleanup/WP03-T05 selection are proven. Until then, the conditional closure markers are not authoritative.

**Next safe action:** After protected delivery and cleanup, select WP03-T05 through the normal product-task lifecycle; do not implement it as part of this repair.

**Reviewer action:** NONE unless an existing protected gate explicitly requires genuine independent review; distinct-account approval is sufficient only where that is the real gate.
