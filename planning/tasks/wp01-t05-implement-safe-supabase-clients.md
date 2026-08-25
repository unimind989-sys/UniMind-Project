# Task record: WP01-T05 implement safe Supabase clients

**Task ID:** WP01-T05

**Status:** [ ]

**Outcome:** Browser and server Supabase clients refresh authenticated sessions safely while privileged keys remain server-only and forged state fails.

**Owner:** Unclaimed; Codex `/root` may claim after task selection

**Reviewer:** UNASSIGNED — GATE BLOCKED

**Branch:** main (no delivery branch requested)

**Updated (UTC):** 2026-08-25

## Execution contract

**Dependencies:** WP01-T04 reviewed PASS with an isolated resettable hosted development Auth/database target and stable generated types.

**Inputs:** Runbook WP01-T05; environment contract; current Supabase SSR cookie API; synthetic users only.

**Files:** Browser/server/admin Supabase clients, auth refresh/proxy seam, focused unit/integration/security tests, task/runbook state, and evidence.

**Verify:** Client-bundle secret test; synthetic sign-in/session refresh integration test; forged cookie/role denial; `pnpm verify`; database/security gates.

**Pass:** Authenticated state reaches Server Components and mutations; forged state fails; no privileged key enters client output.

**Evidence:** `evidence/wp01-foundation/YYYY-MM-DD_supabase-auth_<environment>_<short-sha>.md`

**Rollback:** Revert the future WP01-T05 candidate and disable its auth refresh seam; no real account or shared environment may be used.

**Hard stop:** Do not implement against guessed hosted behavior, use a real student/account, expose a service-role key, target preview/beta, weaken cookie verification, or claim integration behavior before WP01-T04 passes.

## Steps

- [ ] Implement the publishable-key browser client and cookie-aware server client.
- [ ] Add privileged admin access behind an explicit server-only import boundary.
- [ ] Add refresh, forged-state, and bundle-leak tests with synthetic identities.
- [ ] Run full verification and required review.

## Handoff

**Changed:** No Auth/client implementation started. WP01-T04 now has reviewed PASS evidence, so this task is unblocked and ready for selection.

**Commands:** NOT RUN for WP01-T05. Its hosted development Auth/database dependency now exists and has reviewed PASS evidence.

**Remaining:** Entire WP01-T05 implementation.

**Next safe action:** Select and claim WP01-T05, then implement the smallest authenticated browser/server seam with synthetic identities and focused secret-leak/forged-state tests.

**Reviewer action:** Assign when WP01-T05 is claimed; Auth/security evidence must include client-bundle leakage and forged-state denial.
