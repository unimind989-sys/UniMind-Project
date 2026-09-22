# Task record: WP03-T05 Batch Leader collection flow

**Task ID:** WP03-T05

**Status:** [~]

**Outcome:** An authenticated Batch Leader can see only a currently assigned open campaign, submit one requested synthetic source through an accessible retryable flow, and receive one durable idempotent submission whose rights and upload evidence were revalidated server-side.

**Owner:** Codex `/root`; Ahmed is the requester and named human checkpoint

**Reviewer:** Ahmed; D-22 standing authorization applies to protected non-financial delivery

**Branch:** `wp03/batch-leader-collection`

**Updated (UTC):** 2026-09-22T21:57:58Z

## Derived execution envelope

**Policy version:** 5

**Surfaces:** frontend, runtime, auth, storage

**Risk:** R3

**Planning:** Protected

**Model floor:** Sol High

**Model runtime:** active model unverified and limitation reported

**Worker budget:** 1 used for the required finish review, maximum 1, nested workers prohibited

**Capabilities:** frontend-quality-floor, storage-safety, trust-boundaries

**Procedural skills:** Impeccable new-work extension; trust-boundaries; finalize

**Routing reason:** The campaign-scoped bilingual submission UI crosses an authenticated mutation and deterministic temporary-object boundary whose caller, assignment, rights, checksum, and replay semantics must fail closed.

## Execution contract

**Dependencies:** Completed WP02-T09 database gate and completed WP03-T01 through WP03-T04 product-shell tasks, including the protected WP03-T04 release evidence at `evidence/wp03-product-shell/2026-09-22_unit-workspace-shell-release_production_e85d5a2.md`; D-18 remains open and therefore only synthetic source bytes and deterministic storage are permitted.

**Inputs:** Runbook WP03-T05 and sections 6.0, 6.5-6.7; master-plan Batch Leader journey, collection/source domains, privacy/governance, and content-pipeline intake gates; `CONTEXT.md`; `PRODUCT.md`; `DESIGN.md`; the approved Study Shelf surface brief; existing campaign/submission/RLS schema; deterministic object-storage adapter; synthetic fixtures only.

**Files:** Collection domain/application/Supabase and deterministic-upload server modules under `src/lib/collection/`, the existing narrow Supabase privileged boundary, and `src/lib/storage/`; authenticated and synthetic-preview campaign routes plus upload handlers under `src/app/batch-leader/`, `src/app/preview/batch-leader/`, and `src/app/api/`; localized collection copy and inherited Study Shelf styling; one forward collection-finalization migration and generated database types; focused unit, integration/security, SQL, and Playwright tests; the narrow policy-v5 path-classification repair required by proof preflight; this record and sanitized WP03 evidence.

**Verify:** Focused collection domain/application/adapter tests; focused campaign SQL/RLS/idempotency checks; focused collection Playwright in English/Arabic at desktop/mobile widths; allowed and forbidden upload/finalize tests; `corepack pnpm test:security`; `corepack pnpm check:sql`; Impeccable detector plus bounded rendered inspection and finish review; selected proof-preflight; `corepack pnpm verify`; `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`; actual-diff routing; `git diff --check`; `git diff --stat`; full diff and changed-file secret/scope review; exact-head required GitHub CI and affected Supabase/Vercel production proof.

**Pass:** Only current active assignments expose open campaigns and requested items; the browser creates one client key before upload and retains it through recoverable retries; both client and server reject forbidden signature/type/size, unknown or revoked rights, wrong/expired campaign scope, mismatched checksum, cancellation, and replay conflicts; exact replay returns one durable submission; the UI supplies file input and drag/drop paths, progress, cancel, retry, duplicate/replacement guidance, validation summary, and safe lifecycle states without object keys, source text, provider/job diagnostics, or cross-campaign data.

**Evidence:** Candidate and protected release reports under `evidence/wp03-product-shell/`, bound to the reviewed commit and merge.

**Rollback:** Reassign the production alias to the last-known-good deployment, disable the collection upload seam, and ship a reviewed forward migration if database containment is required; never rewrite or destructively roll back an applied migration.

**Hard stop:** Do not accept real/private source material, issue a real signed upload target, enable a storage/provider integration, expose raw object keys or internal diagnostics, weaken RLS/grants, trust browser campaign/ownership/rights/checksum claims, use paid capacity, or cross any real-money boundary without fresh exact Ahmed-and-Ziad confirmation.

## Trust map

1. **Authority:** verified Supabase identity, current database campaign/assignment/requested-item state, and a server-verified deterministic-upload receipt.
2. **Untrusted inputs:** route campaign ID, requested-item/unit IDs, client key, file name/type/size/bytes, checksum claims, title/format/description, rights checkbox, retry state, upload token, and every browser status.
3. **Recomputation:** each page, upload handler, and finalize mutation re-resolves the caller and current assignment/campaign/item scope; the server re-inspects signature/type/size, computes the checksum, and registers evidence through the service-role-only stored seam with the verified caller ID; the database functions recheck assignment, actor ownership, rights, scope, revocation, and idempotency transactionally.
4. **Allowed path:** an active unexpired Batch Leader assignment for one open campaign uploads an allowed synthetic fixture for one requested item, declares rights, and finalizes one matching submission.
5. **Forbidden path:** unauthenticated, wrong-campaign, expired/revoked, unrequested-unit, unknown/revoked-rights, forbidden/oversized, checksum-mismatched, or conflicting replay input returns a generic safe denial and creates no extra durable submission.
6. **Stale-state behavior:** upload and finalize independently recheck current database scope; cancel abandons client progress, exact replay is idempotent, and assignment/campaign/rights changes invalidate later steps even after the page loaded.
7. **Exposure:** browser payloads may contain requested labels and sealed synthetic-upload evidence, but never service credentials, private source text, raw object keys, provider/job diagnostics, another user's state, or signed real-storage operations; logs and errors expose only stable safe codes.

## Steps

- [x] Establish failing domain, adapter, SQL/RLS, security, and browser contracts for allowed, forbidden, stale, retry, cancellation, and replay paths.
- [x] Add the smallest durable finalization schema/function and deterministic synthetic upload-receipt seam.
- [x] Implement authenticated and preview campaign reads, upload/finalize mutations, and the bilingual accessible collection surface inside the approved visual system.
- [x] Exercise keyboard, mobile, RTL/LTR, progress/cancel/retry, validation summary, duplicate/replacement, safe lifecycle, and payload-exposure behavior.
- [~] Run proof preflight, stable-candidate verification, protected delivery, affected production proof, durable closure, and branch cleanup.

## Handoff

**Changed:** Implemented the complete synthetic Batch Leader collection slice: caller-scoped campaign reads; signature/type/size/checksum validation; deterministic upload evidence; service-role-only registration bound to verified identity; authenticated idempotent finalization; bilingual accessible upload, retry, cancel, replacement, and lifecycle UI; SQL/RLS matrix coverage; and policy v5 classification for normal task artifacts.

**Commands:** Proof preflight returned COMPLETE under policy v5. `pnpm verify` passed with 376 unit, 15 integration plus 2 hosted-only skips, 26 security, 3 evaluation, 5 load, and 31 Playwright cases plus the safe production build and client-artifact scan. Focused SQL conventions, collection tests, Impeccable detector, desktop/mobile LTR/RTL side-browser inspection, and agent readiness passed. Disposable database execution is intentionally Linux-CI-only and remains assigned to required database CI. One required finish-review worker found trust and state-binding defects that were corrected; its bounded re-review retry hit the host usage limit, so the executor completed the final full-diff review without claiming independent review.

**Remaining:** Commit the stable candidate, push and open the protected PR, obtain exact-head application/database CI and compliant review, merge, apply/verify the affected Supabase migration, verify/promote the affected Vercel production deployment, close evidence/runbook/task state, synchronize clean `main`, and remove the task branch.

**Next safe action:** Commit and push the reviewed stable candidate for protected exact-head CI.

**Reviewer action:** NONE.
