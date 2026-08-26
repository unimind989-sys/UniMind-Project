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

**Evidence:** `evidence/wp01-foundation/2026-08-26_supabase-auth_development_51be7f6.md` — commit-specific executor report; independent review pending.

**Rollback:** Revert candidate hardening commit `51be7f6`, then initial implementation commit `40214e4`, and disable the auth refresh seam; no real account or shared environment may be used.

**Hard stop:** Do not implement against guessed hosted behavior, use a real student/account, expose a service-role key, target preview/beta, weaken cookie verification, or claim integration behavior before WP01-T04 passes.

## Steps

- [~] Implement the publishable-key browser client and cookie-aware server client; both factories and their unit/boundary tests are implemented and locally verified on `main`.
- [~] Add privileged admin access behind an explicit server-only import boundary; only marker-protected synthetic fixture create/delete operations are exported, and hosted create/delete cleanup passed; review pending.
- [~] Add refresh, forged-state, and bundle-leak tests with synthetic identities; local tests, hosted Auth lifecycle, and the safe production artifact scan pass; review pending.
- [~] Run full verification and required review; local format/lint/type/unit/security/boundary/build gates and hosted development Auth pass, while independent review remains required.

## Handoff

**Changed:** Implemented typed browser/server Supabase factories, a private server-only admin client with narrow synthetic-fixture operations, a Next.js 16 `src/proxy.ts` refresh seam, and `getClaims()`-verified identity helpers. Added forged-cookie/role denial, response-aware Auth cookie/header writes, admin-boundary, non-disclosing Management API parsing, a CLI-to-HTTPS API-key fallback that disables ambient curl configuration and sends the access token through stdin, a confirmation- and fingerprint-guarded hosted synthetic Auth lifecycle through the real proxy, and client-artifact secret-canary tests. The hosted child uses Node's system CA support instead of disabling TLS.

**Commands:** `corepack pnpm verify` passed Prettier, ESLint, strict TypeScript, module boundaries, 13 files/193 unit tests, the synthetic Next.js 16.3.1 production build, and `Client artifact secret scan passed.` Security Vitest passed 1 file/3 tests; the hosted-only integration remains skipped by default. The candidate's guarded hosted-development lifecycle passed 1/1: approved target fingerprint, synthetic create, sign-in, verified identity, real proxy near-expiry refresh with request/response cookies and private/no-store headers, forged-cookie denial, and marker-protected deletion. Earlier agent-readiness and isolated-handoff checks remain recorded in the evidence.

**Remaining:** Assign an independent security reviewer. Actual future business mutations must continue through `requireVerifiedIdentity()`, a request-scoped client, and reviewed RLS; Auth-cookie mutations must also propagate the response headers supplied by `@supabase/ssr`.

**Next safe action:** Have an independent reviewer reproduce candidate `51be7f6` through the hosted-development Auth lifecycle and secret-leak/forgery gates, then record PASS or defects without changing the candidate.

**Reviewer action:** Review service-role isolation and synthetic-user cleanup, verify the confirmation plus approved-fingerprint target guard, verify `getClaims()` fail-closed behavior and metadata rejection, inspect real proxy and response-aware server-client cookie/cache handling, confirm the HTTPS fallback disables ambient curl configuration and never places the access token in process arguments or output, confirm system CA use does not disable TLS, inspect client-artifact scan coverage, and reproduce the hosted-development evidence before approving.
