# Task record: WP01-T05 implement safe Supabase clients

**Task ID:** WP01-T05

**Status:** [~]

**Outcome:** Browser and server Supabase clients refresh authenticated sessions safely while privileged keys remain server-only and forged state fails.

**Owner:** Codex `/root`

**Reviewer:** UNASSIGNED — INDEPENDENT REVIEW GATE BLOCKED

**Branch:** main (no delivery branch requested)

**Updated (UTC):** 2026-08-26

## Execution contract

**Dependencies:** WP01-T04 reviewed PASS with an isolated resettable hosted development Auth/database target and stable generated types.

**Inputs:** Runbook WP01-T05; environment contract; current Supabase SSR cookie API; synthetic users only.

**Files:** Browser/server/admin Supabase clients, auth refresh/proxy seam, focused unit/integration/security tests, task/runbook state, and evidence.

**Verify:** Client-bundle secret test; synthetic sign-in/session refresh integration test; forged cookie/role denial; `pnpm verify`; database/security gates.

**Pass:** Authenticated state reaches Server Components and mutations; forged state fails; no privileged key enters client output.

**Evidence:** `evidence/wp01-foundation/2026-08-26_supabase-auth_development_fb75527.md` — executor report; rebind to the final candidate SHA before review.

**Rollback:** Revert the future WP01-T05 candidate and disable its auth refresh seam; no real account or shared environment may be used.

**Hard stop:** Do not implement against guessed hosted behavior, use a real student/account, expose a service-role key, target preview/beta, weaken cookie verification, or claim integration behavior before WP01-T04 passes.

## Steps

- [~] Implement the publishable-key browser client and cookie-aware server client; both factories and their unit/boundary tests are implemented and locally verified on `main`.
- [~] Add privileged admin access behind an explicit server-only import boundary; only marker-protected synthetic fixture create/delete operations are exported, and hosted create/delete cleanup passed; review pending.
- [~] Add refresh, forged-state, and bundle-leak tests with synthetic identities; local tests, hosted Auth lifecycle, and the safe production artifact scan pass; review pending.
- [~] Run full verification and required review; local format/lint/type/unit/security/boundary/build gates and hosted development Auth pass, while independent review remains required.

## Handoff

**Changed:** Implemented typed browser/server Supabase factories, a private server-only admin client with narrow synthetic-fixture operations, a Next.js 16 `src/proxy.ts` refresh seam, and `getClaims()`-verified identity helpers. Added forged-cookie/role denial, cookie/header refresh, admin-boundary, non-disclosing Management API parsing, a CLI-to-HTTPS API-key fallback that sends the access token through stdin, a guarded hosted synthetic Auth lifecycle, and client-artifact secret-canary tests. The hosted child uses Node's system CA support instead of disabling TLS.

**Commands:** Full Prettier, ESLint, strict TypeScript, and module-boundary checks passed. Full unit Vitest passed 13 files/185 tests; security Vitest passed 1 file/3 tests; the hosted-only integration remains skipped by default. The guarded hosted-development Auth lifecycle passed 1/1: synthetic create, sign-in, verified identity, refresh, forged-cookie denial, and marker-protected deletion. The synthetic Next.js 16.3.1 production build passed and reported `Client artifact secret scan passed.` Agent readiness and isolated handoff rehearsal passed. The literal `pnpm verify` wrapper still cannot start because Corepack is absent and the bundled pnpm wrapper refuses an automatic non-TTY reinstall; exact installed tools ran directly without dependency changes.

**Remaining:** Rebind the executor evidence to the final candidate commit and assign an independent security reviewer. Actual future business mutations must continue through `requireVerifiedIdentity()`, a request-scoped client, and reviewed RLS.

**Next safe action:** Create the candidate commit only when requested, rebind the evidence filename/SHA, and have an independent reviewer reproduce the hosted-development Auth lifecycle and secret-leak/forgery gates.

**Reviewer action:** Review service-role isolation and synthetic-user cleanup, verify `getClaims()` fail-closed behavior and metadata rejection, inspect proxy cookie/cache handling, confirm the HTTPS fallback never places the access token in process arguments or output, confirm system CA use does not disable TLS, inspect client-artifact scan coverage, and reproduce the hosted-development evidence before approving.
