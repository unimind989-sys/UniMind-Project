# Task record: WP03-T27 add first-run profile onboarding and one shared access gate

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T27

**Status:** [~]

**Outcome:** Every new account (real or demo) is asked once for its name and interface language after consent, can edit both later in Settings, and every authenticated page, including the Batch Leader pages and upload, applies the same account gate.

**Acceptance:** [WP03-T27](../../docs/runbooks/poc-execution-runbook.md#wp03-t27--add-first-run-profile-onboarding-and-one-shared-access-gate)

**Owner:** Claude Code (overseeing session); Ahmed selected; delegated under the WP03 refinement brief (18 October 2026)

**Branch:** claude/wp03-t27-profile-onboarding

**Updated (UTC):** 2026-10-18T13:00Z

## Contract

**Dependencies:** WP03-T24 (findings PJ-01 to PJ-06, PJ-10 to PJ-15, PJ-27 to PJ-29, IX-05, IX-10, IX-18, IX-19, MD-22, DS-30); WP03-T25 primitives (merged).

**Inputs:** `docs/reviews/wp03-refinement/audits/journeys.md` §4; existing grant `update (display_name, preferred_language)` for `authenticated` (`20260831064458`), pinned by pgTAP 17.

**Files:** auth gate (`auth-flow.domain`, `auth-access.*`, new `access-route.server`), every gate consumer, new `(auth)/welcome`, profile seam (`profile.{domain,application}`, `account.supabase.server`), Settings, synthetic account/provider/routes/screens, migration `20261018001935`, pgTAP 30, tests, CONTEXT, DESIGN, walkthrough and demo pack.

**Protected paths:** auth gate and routing, Batch Leader upload and finalize authorization, one migration.
- Allowed: own-row update of `display_name` and `preferred_language` through the existing grant; `PROFILE_REQUIRED` after consent; the same gate on leader pages, upload (403) and finalize.
- Forbidden (proved): anonymous and cross-user profile writes (pgTAP 30); control or bidi characters in a changed name (pgTAP 30, unit); an unready leader reaching intake, upload or finalize (security test, database e2e); a forged `next` (unit, database e2e origin check); any grant, RLS or predicate change (diff).

**Trust map:** caller = verified Supabase session (`getClaims` subject only; email read separately for display). Gate = `profiles.account_status`, `display_name` and the current terms acceptance, all caller-scoped under RLS. Writes = own profile row under `profiles_update_own` and the column grant; the new trigger only rejects malformed new names. Leader upload/finalize keep the service-role path behind the gate, the campaign assignment checks and the database predicates, unchanged (D9).

**Verify:** unit, security, demo e2e (`onboarding.spec.ts` and adjusted specs), main e2e (hosted new account), database-ci (pgTAP 30, database e2e), `corepack pnpm verify`, required CI.

**Pass:** gate order verify → consent → profile → ready on every route; named accounts never see `/welcome`; tests green.

**Rollback:** revert the PR; the migration adds one function and one trigger (`drop trigger profiles_validate_display_name on public.profiles; drop function unimind_private.validate_profile_display_name();` in a forward migration if ever needed).

**Hard stop:** any grant, RLS policy or authorization predicate change; hosted or production access; real-money exposure.

## Steps

- [x] Domain: `PROFILE_REQUIRED`, `accessDestination`; the return-path allow-list is unchanged (it still rejects `/admin` and `/settings`, which then fall back to the role home).
- [x] Application and adapter: the gate reads the name in its existing profile query; one profile save seam for onboarding and Settings.
- [x] One server guard on every authenticated page; leader pages, upload and finalize gated; login, callback, consent and `/` route through `accessDestination`.
- [x] Migration and pgTAP 30: a trigger checks the name only when it changes, so a legacy row never blocks an unrelated update.
- [x] `/welcome` (fourth access step) and Settings → Profile on the T25 primitives; Settings sections switch on the client, one scrolling row on phones; Privacy for students only; catalog failure keeps Settings; sign-out on consent and welcome; an honest no-cohort state; IX-18, IX-19.
- [x] Demo: `new-student@example.invalid` with an empty profile, no fixture-name fallback, returning-user behaviour, `/welcome` in the route table with the real gate order.
- [x] Tests and docs; independent review findings addressed.
- [ ] Rendered review, PR, required CI including `database-ci`, merge.

## Decisions

- D6, D7, D9, D10 from the [plan](../../docs/reviews/wp03-refinement/plan.md#decisions-taken-under-the-delegation). D8 changed after review: a change-only trigger replaces the `NOT VALID` check, because a check constraint also blocks unrelated updates to a legacy row (account activation, academic save).
- The database rule checks structure only (trimmed, single spaces, at most 80 characters, no control or bidi controls); "contains a letter" stays in the application rule because Postgres character classes follow the database locale.
- `getCurrentAuthAccess` stays uncached (PJ-12 not done): a request-cached snapshot could go stale inside the save that completes the profile.
- Settings opens on Profile; the profile language starts from the stored account language, so saving a name never changes it silently.

## Current state

**Changed:** see Steps; branch commits from `3bec0e1`.

**Proof:** unit and security green (new: access-destination, profile-domain, account-supabase, auth-entry-routing consent → welcome, batch-leader-account-gate); main e2e 40/40; demo full suite run before the review fixes 189/195 with the six pinned-tab tests fixed; `pnpm verify` static, build and Node layers green.

**Review:** independent review by the `independent-reviewer` sub-agent of `2ca8e1d..a57065e`: request changes (1 major: finalize gate untested; minors: NOT VALID semantics, Settings language baseline, consent → welcome untested, demo assertion; nits). All addressed in the next commit.

**Approved commit:** PENDING (material UI: `/welcome`, Settings → Profile).

**Remaining:** rendered review, PR, CI, merge.

## Next action

Rendered review of `/welcome` and Settings → Profile (EN/AR, light/dark, 390/1440), then the PR.
