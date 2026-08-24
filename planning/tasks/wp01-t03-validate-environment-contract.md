# Task record: WP01-T03 validate environment contract

**Task ID:** WP01-T03

**Status:** [x]

**Outcome:** Agents and runtime adapters receive one validated public/server configuration contract that fails safely, defaults to mock providers, and cannot expose secret-class variables to browser code.

**Owner:** Codex `/root`

**Reviewer:** Codex `/root` — PASS (ordinary task)

**Branch:** main (no delivery branch requested)

**Updated (UTC):** 2026-08-20T17:27:23Z

## Execution contract

**Dependencies:** WP01-T02 PASS with evidence `evidence/wp01-foundation/2026-08-20_module-boundaries_local_0e1b0c8.md`; runbook WP01-T03; mock-only WP00 gate.

**Inputs:** Approved public/server variable classification; Vercel/Next.js environment-file behavior; Zod validation; zero-cost provider and synthetic-data constraints.

**Files:** `.env.example`, `src/lib/config/env.schema.ts`, `src/lib/config/env.server.ts`, `src/lib/config/env.client.ts`, safe-build automation, focused environment tests, package scripts, runbook/task state, and WP01 evidence.

**Verify:** Focused environment tests; safe-placeholder production build; `.env.local` ignore check; `pnpm verify`; readiness/handoff checks; diff and credential review.

**Pass:** Valid mock configuration parses once; missing, malformed, out-of-range, accidentally public-secret, and unauthorized real-provider configurations fail with variable names but no values; a production build passes with synthetic CI placeholders.

**Evidence:** `evidence/wp01-foundation/2026-08-20_environment-contract_local_3d1228e.md`

**Rollback:** Revert the WP01-T03 commits; no secret file, provider, database, deployment, or external state is changed.

**Hard stop:** Do not create or commit real secrets, expose a server-only variable, enable a real provider, assign paid capacity, write `.env.local` values, or make an external provider/deployment call.

## Steps

- [x] Define the documented public/server variable contract and safe examples.
- [x] Implement reusable Zod validation plus server/client accessors.
- [x] Enforce mock-by-default provider authorization and numeric safety bounds.
- [x] Prove failure behavior, safe CI build behavior, and local-secret ignore behavior.
- [x] Run the full repository gate, assemble evidence, and complete ordinary review.

## Handoff

**Changed:** Added the public/server environment schema and cached accessors, explicit browser allowlist, mock/real-provider authorization gate, bounded limits, safe CI build wrapper, focused negative tests, and a comment-only ignored `.env.local` placeholder.

**Commands:** Focused environment suite passes 9 tests; `pnpm test:unit -- env` passes 23 tests; `pnpm build` passes with synthetic variables; `pnpm verify` passes formatting, lint, strict types, boundaries, 23 tests, and the safe production build. `.env.local` ignore check exits 0. The first dependency refresh used the wrong global pnpm 11 and stopped on its release-age policy; the pinned pnpm 10.34.5 restored the unchanged reviewed lock before adding only `server-only@0.0.1`. The first focused test/typecheck runs exposed and then verified narrow default/typing fixes.

**Remaining:** NONE for WP01-T03.

**Next safe action:** Claim WP01-T04 after approved hosted development/CI resources and scoped access are available; use the pinned CLI and guarded hosted commands.

**Reviewer action:** PASS — classification, fail-closed provider authorization, non-disclosing errors, synthetic production build, ignored local secrets, candidate diff, and fresh-agent handoff reviewed.
