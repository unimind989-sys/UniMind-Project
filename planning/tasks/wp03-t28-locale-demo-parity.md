# Task record: WP03-T28 remember the interface language and align demo journeys

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T28

**Status:** [~]

**Outcome:** An Arabic user stays in Arabic across email links, sign-out, guard redirects and later visits, a new device signs in in the account's language, and the demo's exits match the real flow or are listed as demo-only.

**Acceptance:** [WP03-T28](../../docs/runbooks/poc-execution-runbook.md#wp03-t28--remember-the-interface-language-and-align-demo-journeys)

**Owner:** Claude Code (overseeing session); Ahmed selected; delegated under the WP03 refinement brief (18 October 2026)

**Branch:** claude/wp03-t28-locale-demo-parity (stacked on WP03-T27 until it merges)

**Updated (UTC):** 2026-10-18T11:30Z

## Contract

**Dependencies:** WP03-T27 (account language in `profiles.preferred_language`, profile seam).

**Inputs:** `docs/reviews/wp03-refinement/audits/journeys.md` (PJ-07, PJ-08, PJ-09, PJ-16, PJ-18, PJ-20, PJ-22 to PJ-24, PJ-26, PJ-30), IX-28.

**Files:** `src/proxy.ts`, new `src/lib/i18n/locale-preference.application.ts`, `src/lib/auth/auth-actions.application.ts`, `src/app/(auth)/{actions.ts,_components/auth-page.tsx,_components/auth-form.tsx}`, `src/app/auth/callback/route.ts`, `src/app/_components/product-auth.tsx`, leader empty state, walkthrough and demo pack, tests.

**Protected paths:** the proxy (runs before the session refresh) and the auth callback and actions.
- Allowed: a functional HttpOnly `unimind-locale` cookie set from `?lang=` on real-runtime page loads; a 307 that adds the remembered `lang` to a page load without one; `lang` on email links; the account language on a sign-in from a page without a language.
- Forbidden (proved): any cookie or redirect in the synthetic runtime; any change to session refresh, POST, API, RSC or callback requests; a forged cookie or `lang` value; registration with reserved test domains reaching Auth.

**Verify:** unit (`locale-preference`, `auth-actions`); main e2e (`auth-flows`: remembered language, reserved domains); demo e2e (`auth.spec` reset and registration); `corepack pnpm verify`; required CI.

**Pass:** the behaviours above; the demo and real exits agree or are listed; required CI green.

**Rollback:** revert the PR; the cookie is functional only and ignored when absent.

**Hard stop:** any change to session or authorization semantics; hosted or production access; real-money exposure.

## Steps

- [x] Remembered language: pure decision in `locale-preference.application.ts`, applied in the real-runtime proxy after the asset and 404 exits.
- [x] Email links carry `lang`; the callback keeps it on every redirect; sign-out keeps the remembered language; sign-in from a page without a language uses the account language.
- [x] Real registration continues on the verification page; reserved test domains are refused before Auth (PJ-24, PJ-30).
- [x] Demo password reset ends signed in like the real flow (PJ-23); leader empty state no longer promises an invitation (PJ-18).
- [x] Walkthrough table of demo-only behaviour (PJ-07, PJ-20, PJ-22, PJ-25); demo pack rebuilt.
- [ ] Verification, independent review, PR after WP03-T27 merges.

## Decisions

- The URL stays the single source of the interface language, so server and client render the same; the cookie only fills in a missing `?lang=` on page loads (307), and the proxy writes it only when a page load names a different language.
- PJ-26 (server-rendered `lang`/`dir` on `<html>`) is not done: the root layout cannot read the query, and forwarding a request header would change the session-refresh plumbing for a P3 flash that the shell already corrects; recorded as remaining.
- PJ-16: an account that is both a Batch Leader and a cohort student is not supported in the PoC (no provisioning path creates one); no role switch is added.
- PJ-21 (cross-device PKCE email links) needs a hosted check this refinement does not run; recorded as remaining.

## Current state

**Changed:** see Steps.

**Proof:** unit and security 997/997 before the new tests; `locale-preference` and `auth-actions` 16/16.

**Review:** pending independent review (`independent-reviewer`).

**Approved commit:** NOT REQUIRED: no visual change; copy-only changes to the leader empty state and a demo exit.

**Remaining:** full verification, review and delivery after WP03-T27.

## Next action

Rebase onto main after WP03-T27 merges, run `corepack pnpm verify`, independent review, PR.
