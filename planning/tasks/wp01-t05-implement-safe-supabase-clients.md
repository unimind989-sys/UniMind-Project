# Task record: WP01-T05 implement safe Supabase clients

**Task ID:** WP01-T05

**Status:** [x]

**Outcome:** Browser and server Supabase clients refresh authenticated sessions safely while privileged keys remain server-only and forged state fails.

**Owner:** Codex `/root`

**Reviewer:** Ahmed — PASS on 2026-08-26

**Branch:** main (no delivery branch requested)

**Updated (UTC):** 2026-08-26

## Execution contract

**Dependencies:** WP01-T04 reviewed PASS with an isolated resettable hosted development Auth/database target and stable generated types.

**Inputs:** Runbook WP01-T05; environment contract; current Supabase SSR cookie API; synthetic users only.

**Files:** Browser/server/admin Supabase clients, auth refresh/proxy seam, focused unit/integration/security tests, task/runbook state, and evidence.

**Verify:** Client-bundle secret test; synthetic sign-in/session refresh integration test; forged cookie/role denial; `pnpm verify`; database/security gates.

**Pass:** Authenticated state reaches Server Components and mutations; forged state fails; no privileged key enters client output.

**Evidence:** `evidence/wp01-foundation/2026-08-26_supabase-auth_development_51be7f6.md` — commit-specific executor report and independent PASS.

**Rollback:** Revert candidate hardening commit `51be7f6`, then initial implementation commit `40214e4`, and disable the auth refresh seam; no real account or shared environment may be used.

**Hard stop:** Do not implement against guessed hosted behavior, use a real student/account, expose a service-role key, target preview/beta, weaken cookie verification, or claim integration behavior before WP01-T04 passes.

## Steps

- [x] Implement the publishable-key browser client and cookie-aware server client; both factories and their unit/boundary tests are implemented and verified on `main`.
- [x] Add privileged admin access behind an explicit server-only import boundary; only marker-protected synthetic fixture create/delete operations are exported, hosted create/delete cleanup passed, and Ahmed approved the boundary.
- [x] Add refresh, forged-state, and bundle-leak tests with synthetic identities; local tests, the real-proxy hosted Auth lifecycle, and the safe production artifact scan passed.
- [x] Run full verification and required review; local format/lint/type/unit/security/boundary/build gates and hosted development Auth passed, and Ahmed independently approved candidate `51be7f6` on 2026-08-26.

## Handoff

**Changed:** Implemented typed browser/server Supabase factories, a private server-only admin client with narrow synthetic-fixture operations, a Next.js 16 `src/proxy.ts` refresh seam, and `getClaims()`-verified identity helpers. Added forged-cookie/role denial, response-aware Auth cookie/header writes, admin-boundary, non-disclosing Management API parsing, a CLI-to-HTTPS API-key fallback that disables ambient curl configuration and sends the access token through stdin, a confirmation- and fingerprint-guarded hosted synthetic Auth lifecycle through the real proxy, and client-artifact secret-canary tests. The hosted child uses Node's system CA support instead of disabling TLS.

**Commands:** `corepack pnpm verify` passed Prettier, ESLint, strict TypeScript, module boundaries, 13 files/193 unit tests, the synthetic Next.js 16.3.1 production build, and `Client artifact secret scan passed.` Security Vitest passed 1 file/3 tests; the hosted-only integration remains skipped by default. The candidate's guarded hosted-development lifecycle passed 1/1: approved target fingerprint, synthetic create, sign-in, verified identity, real proxy near-expiry refresh with request/response cookies and private/no-store headers, forged-cookie denial, and marker-protected deletion. Earlier agent-readiness and isolated-handoff checks remain recorded in the evidence.

**Remaining:** No WP01-T05 executor work remains. Future business mutations must continue through `requireVerifiedIdentity()`, a request-scoped client, and reviewed RLS; Auth-cookie mutations must also propagate the response headers supplied by `@supabase/ssr`.

**Next safe action:** Claim WP01-T07 and implement the test-layer contract against the reviewed hosted targets and Auth seams.

**Reviewer action:** Completed by Ahmed with PASS on 2026-08-26 for candidate `51be7f6` and its commit-specific evidence.
