# Task record: WP03-T28 remember the interface language and align demo journeys

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T28

**Status:** [x]

**Outcome:** An Arabic user stays in Arabic across email links, sign-out, guard redirects and later visits, a new device signs in in the account's language, and the demo's exits match the real flow or are listed as demo-only.

**Acceptance:** [WP03-T28](../../docs/runbooks/poc-execution-runbook.md#wp03-t28--remember-the-interface-language-and-align-demo-journeys)

**Owner:** Claude Code (overseeing session); Ahmed selected; delegated under the WP03 refinement brief (18 October 2026)

**Branch:** claude/wp03-t28-locale-demo-parity

**Updated (UTC):** 2026-10-18T14:20Z

## Contract

**Dependencies:** WP03-T27 (merged as `4373a41`: account language in `profiles.preferred_language`, profile seam).

**Inputs:** `docs/reviews/wp03-refinement/audits/journeys.md` (PJ-07, PJ-08, PJ-09, PJ-16, PJ-18, PJ-20, PJ-22 to PJ-24, PJ-26, PJ-30), IX-28.

**Files:** `src/proxy.ts`, new `src/lib/i18n/locale-preference.application.ts`, `src/lib/auth/auth-actions.application.ts`, `src/app/(auth)/{actions.ts,_components/auth-page.tsx,_components/auth-form.tsx}`, `src/app/auth/callback/route.ts`, `src/app/_components/product-auth.tsx`, leader empty state, walkthrough and demo pack, tests.

**Protected paths:** the proxy (runs before the session refresh) and the auth callback and actions.
- Allowed: a functional HttpOnly `unimind-locale` cookie, written when a real-runtime page load or same-origin client navigation names a language other than the remembered one (or English), and on sign-in and profile saves; a 307 that adds the remembered `lang` to a page load without one; an `x-unimind-locale` request header (validated, browser value replaced) for the root layout's `lang` and `dir`; `lang` on email links and the callback; the account language on a sign-in from a device that never chose one.
- Forbidden (proved by proxy, callback and action tests): any cookie or redirect in the synthetic runtime; any change to session refresh, POST, API or callback handling; a forged cookie, header or `lang` value; registration with reserved test domains reaching Auth.

**Verify:** unit (`locale-preference`, `auth-session-proxy`, `synthetic-demo-runtime`, `auth-callback-route`, `auth-entry-routing`, `auth-actions`); main e2e (`auth-flows`); database e2e (new device signs in in the account language); demo e2e (`auth.spec`); `corepack pnpm verify`; required CI.

**Pass:** the behaviours above; the demo and real exits agree or are listed; required CI green.

**Rollback:** revert the PR; the cookie is functional only and ignored when absent.

**Hard stop:** any change to session or authorization semantics; hosted or production access; real-money exposure.

## Steps

- [x] Remembered language: pure decision in `locale-preference.application.ts`, applied in the real-runtime proxy after the asset and 404 exits.
- [x] Email links carry `lang`; the callback keeps it on every redirect; sign-out keeps the remembered language; sign-in from a page without a language uses the account language.
- [x] Real registration continues on the verification page; reserved test domains are refused before Auth (PJ-24, PJ-30).
- [x] Demo password reset ends signed in like the real flow (PJ-23); leader empty state no longer promises an invitation (PJ-18).
- [x] Walkthrough table of demo-only behaviour (PJ-07, PJ-20, PJ-22, PJ-25); demo pack rebuilt.
- [x] Remember on client navigations too (the shell switch is one), on sign-in and on profile saves; sign-out keeps the page language.
- [x] `lang` and `dir` rendered on the server from the proxy's request header (PJ-26).
- [x] Review fixes: navigation detection, new-device sign-in, entry-point tests, demo reset role, reserved-domain copy.
- [x] Verification; PR with required CI.

## Decisions

- The URL stays the single source of the interface language; the cookie only fills in a missing `?lang=` on page loads (307).
- Next removes its router headers before the proxy, so a client navigation is recognised as a same-origin script request (`sec-fetch-dest: empty`, `sec-fetch-site: same-origin`). That cannot be told from a prefetch, so every link to another language has `prefetch={false}` (`SegmentedControl`, `LanguageSwitch`). Chosen over a Server Action per switch (an extra POST and router refresh, and the demo blocks POST). Edge: two tabs in different languages; the last page fetched wins.
- English links on a device with no memory write nothing, so a new device signs in in the account language; the sign-in then remembers it.
- PJ-26 done: the root layout reads the proxy's header, so every route is dynamic (all already were except `/_not-found`).
- Reserved domains are refused in the real Server Action, not the shared auth application, because the synthetic demo registers those addresses.
- PJ-16: disposed in `findings.md` (T24 plan: record only); not decided here.
- PJ-19 not done: "Change password" from a signed-in session would skip the email round-trip while `secure_password_change = false`; recorded as remaining for a reauthentication decision.
- PJ-21 (cross-device PKCE email links) needs a hosted check this refinement does not run; recorded as remaining.

## Current state

**Changed:** see Steps.

**Proof:** final head: unit 1,027 green (proxy, callback route, synthetic runtime, entry routing, locale preference); main e2e 42/42 (remembered language across a client switch, reserved domains); full demo suite 197/197; static checks green. The database e2e (new device signs in in the account language) and pgTAP run in CI.

**Review:** `independent-reviewer` on `6365350`: request changes (2 major, 2 minor, 3 nits), addressed in `e898c94`; re-review of `e898c94`: request changes (database e2e used `'AR'`, the column allows `'AR_EG'`; invariant comments), fixed in the next commit.

**Approved commit:** NOT REQUIRED: no visual change; copy-only changes to the leader empty state and a demo exit.

**Remaining:** PJ-19 (signed-in password change needs a reauthentication decision) and PJ-21 (hosted cross-device PKCE check).

## Next action

None after the PR merges with green required CI.
