# Task record: WP03-T04 unit workspace shell

**Task ID:** WP03-T04

**Status:** [~]

**Outcome:** An authenticated student can enter one server-authorized cohort/unit workspace, move among its truthful overview, chat, Studio, and quiz surfaces, and create or select a server-persisted mocked chat session without any child route trusting URL or layout state for authorization.

**Owner:** Codex `/root`; Ahmed is the requester and named human checkpoint

**Reviewer:** Ahmed; D-22 standing authorization applies to protected non-financial delivery

**Branch:** `wp03/unit-workspace-shell`

**Updated (UTC):** 2026-09-21T20:33:53Z

## Derived execution envelope

**Policy version:** 2

**Surfaces:** docs, frontend, runtime, auth, data, storage, delivery, tooling

**Risk:** R3

**Planning:** Protected

**Model floor:** Sol High

**Model runtime:** active model unverified and limitation reported

**Worker budget:** 0 used, maximum 1, nested workers prohibited

**Capabilities:** data-integrity, frontend-quality-floor, release-safety, storage-safety, trust-boundaries

**Procedural skills:** Impeccable `typeset`; trust-boundaries

**Routing reason:** The authorized workspace combines a rendered bilingual shell with server-side canonical scope checks and durable caller-owned chat-session state.

## Execution contract

**Dependencies:** Completed WP02-T09 database gate; completed WP03-T01 design/terminology foundation; completed WP03-T02 auth/consent flows; completed WP03-T03 server-first catalog and protected release evidence.

**Inputs:** Runbook WP03-T04; master-plan subject workspace, strict RAG, authorization, quota, and bilingual requirements; `CONTEXT.md`; `PRODUCT.md`; `DESIGN.md`; approved Study Shelf surface brief; caller-scoped catalog/availability and existing `chat_sessions` RLS contracts; synthetic fixtures only.

**Files:** Workspace domain/application/Supabase adapter modules under `src/lib/workspace/`; authorized routes and shared shell under `src/app/learn/[cohortId]/[unitId]/`; synthetic preview route/fixtures; locale dictionaries and systemic typography tokens; focused unit, security, and Playwright tests; this record and sanitized evidence under `evidence/wp03-product-shell/`.

**Verify:** Focused workspace domain/adapter/security tests; focused workspace Playwright in English/Arabic at desktop/mobile widths; rendered computed-font and layout inspection; one Impeccable type scan and one final detector pass; `corepack pnpm test:security`; selected database contract checks; `corepack pnpm verify`; `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`; actual-diff routing; `git diff --check`; `git diff --stat`; full diff and changed-file secret/scope review; exact-head required GitHub CI and affected production proof.

**Pass:** Every workspace surface derives canonical cohort/unit scope from current caller-authorized server data; unauthorized, deactivated, or release-changed scope returns one non-identifying not-found boundary; overview and truthful placeholders expose localized breadcrumb, terminology, source/material/quota state, locale, and navigation; mocked chat start/switch persists caller-owned scope server-side; Arabic and English remain clear, balanced, unclipped, and overflow-free across normal/narrow rendered states without degrading English.

**Evidence:** Candidate and protected release reports under `evidence/wp03-product-shell/`, bound to the reviewed commit and merge.

**Rollback:** Reassign the production alias to the last-known-good deployment and restore the prior release fingerprint. If a forward database repair is required, disable the new seam or ship a reviewed forward migration; never rewrite shared migration history.

**Hard stop:** Do not use real student/source data, weaken RLS/grants, trust route/query/client/layout state as authorization, reveal private existence or identifiers, enable providers or paid calls, apply an unreviewed shared-environment migration, or cross any real-money boundary without fresh exact Ahmed-and-Ziad confirmation.

## Trust map

1. **Authority:** verified Supabase identity plus caller-scoped availability/catalog rows and PostgreSQL `chat_sessions` RLS.
2. **Untrusted inputs:** route `cohortId`/`unitId`, locale, requested session ID, form payload, browser state, cached layout state, and all displayed source/quota metadata.
3. **Recomputation:** each page/action resolves the route pair against a fresh server-side caller-scoped workspace query; chat-session ownership/scope is rechecked by the application service and database RLS.
4. **Allowed path:** an eligible student opens an available unit and starts or selects an open session for exactly that cohort/unit.
5. **Forbidden path:** forged, cross-user, cross-unit, deactivated, unpublished, or release-stale routes/sessions produce one generic denial/not-found result and no hidden metadata.
6. **Stale-state behavior:** every child page/action rechecks canonical scope; release or availability change invalidates navigation/action even when a shared layout remains mounted.
7. **Exposure:** URLs contain opaque scope IDs only; client payloads and errors omit hidden labels, reason codes, ownership, diagnostics, source text, provider data, and secrets.

## Steps

- [x] Establish failing workspace authorization, session persistence, safe-state, routing, and typography/rendered contracts.
- [x] Implement the smallest server-authorized workspace service, durable mocked chat-session seam, and shared route shell.
- [x] Implement localized overview and truthful feature placeholders with deliberate loading, error, and not-found boundaries.
- [x] Diagnose and correct the systemic Arabic typography issue through font delivery/tokens or language-aware root styling.
- [x] Exercise allowed/forbidden, stale-release, long-content, unavailable-quota, keyboard, zoom, narrow, RTL/LTR, and mixed-text paths.
- [ ] Run the stable-candidate proof, protected delivery, affected production checks, durable closure, and branch cleanup.

## Handoff

**Changed:** Implemented the caller-authorized unit workspace RPC/application/adapter seam, scoped mocked chat sessions, localized overview/chat/Studio/quiz routes, safe boundaries, synthetic preview, Study Shelf handoff, and systemic Arabic typography correction. Rendered inspection established that the prior stack silently resolved Arabic through Manrope's fallback as Arial; the locale root now selects the already-loaded Noto Sans Arabic face and Arabic role tokens compensate for its perceived metrics without changing English hierarchy.

**Commands:** Initial and actual-diff routing selected R3/protected with broad CI, Sol High floor, zero workers used, frontend/security/database/storage/exact-head/production proof, and an unverified active-model limitation. Focused domain/adapter contracts passed 7/7; security passed 24/24; the migration checker passed all 25 migrations; focused Playwright passed 5/5 after 44 px controls, skip-link focus, and immediate localized-root typography were finalized. The final broad `pnpm verify` gate passed formatting, lint, types, boundaries, SQL/policy/secret checks, 344 unit, 15 integration with 2 expected hosted-only skips, 24 security, 3 evaluation, 5 load, 24 E2E, optimized production build, and client-artifact scan. Rendered desktop/narrow English/Arabic inspection confirmed Manrope/Noto resolution, no overflow or clipping, and coherent RTL/LTR hierarchy. Focused pgTAP coverage is queued for exact-head disposable database CI.

**Remaining:** Deliver the reviewed candidate, run exact-head application/database CI, prove affected Supabase Preview and Vercel production state, close records, and clean the branch.

**Next safe action:** Complete the stable-candidate proof and enter the enforced finalization workflow.

**Reviewer action:** NONE unless a genuine product decision, unapproved external mutation, or real-money boundary emerges.
