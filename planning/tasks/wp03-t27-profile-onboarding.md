# Task record: WP03-T27 add first-run profile onboarding and one shared access gate

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T27

**Status:** [~]

**Outcome:** Every new account (real or demo) is asked once for its name and interface language after consent, can edit both later in Settings, and every authenticated page, including the Batch Leader pages and upload, applies the same account gate.

**Acceptance:** [WP03-T27](../../docs/runbooks/poc-execution-runbook.md#wp03-t27--add-first-run-profile-onboarding-and-one-shared-access-gate)

**Owner:** Claude Code (overseeing session); Ahmed selected; delegated under the WP03 refinement brief (18 October 2026)

**Branch:** claude/wp03-t27-profile-onboarding

**Updated (UTC):** 2026-10-18T10:00Z

## Contract

**Dependencies:** WP03-T24 (findings PJ-01 to PJ-06, PJ-10 to PJ-15, PJ-27 to PJ-29, IX-05, IX-10, IX-18, IX-19, MD-22, DS-30); WP03-T25 primitives for the new screens.

**Inputs:** `docs/reviews/wp03-refinement/audits/journeys.md` §4; existing grant `update (display_name, preferred_language)` for `authenticated` (`20260831064458`), pinned by pgTAP 17; DESIGN access-page and Settings rules.

**Files:** `src/lib/auth/auth-flow.domain.ts`, `auth-access.{application,supabase.server}.ts`, new `src/lib/auth/access-route.server.ts`; new `src/lib/account/profile.{domain,application}.ts`, `account.supabase.server.ts`; every gate consumer (`page.tsx`, `learn`, `settings`, `admin`, `admin/[resource]`, workspace guard, both Batch Leader pages, upload handler, finalize action, `(auth)` actions, callback, consent, auth page); new `(auth)/welcome`; Settings and account components; synthetic account, provider, route table, demo runtime and screens; one migration; pgTAP 30; unit, demo and database e2e tests; CONTEXT, DESIGN, walkthrough.

**Protected paths:** auth gate and routing, Batch Leader upload authorization, migration.
- Allowed: own-row update of `display_name` and `preferred_language` through the existing grant; `PROFILE_REQUIRED` after consent; the same gate on leader pages, upload (403) and finalize.
- Forbidden (proved): anonymous and cross-user profile writes; control or bidi-override characters in names; a leader who is unverified, unconsented, suspended or nameless reaching intake or uploading; open redirects through `next`; any grant or RLS policy change.

**Verify:** unit (`auth-flow`, `access-destination`, `auth-access`, `profile-domain`, `profile-application`, `account-supabase`, `synthetic-login`, `synthetic-route`); pgTAP 30 in `database-ci`; demo e2e `onboarding.spec.ts` plus affected specs; database e2e (nameless user → `/welcome` → home; leader gate); `corepack pnpm verify`; required CI.

**Pass:** the gate order is verify → consent → profile → ready on every route; existing named accounts never see `/welcome`; all listed tests green.

**Rollback:** revert the PR; the migration's only object is the constraint (`alter table public.profiles drop constraint profiles_display_name_format_check;`).

**Hard stop:** any grant, RLS policy or authorization predicate change; hosted or production data access; real-money exposure.

## Steps

- [ ] Domain: `PROFILE_REQUIRED`, `accessDestination`, return-path allow-list (`/settings`, `/admin`); profile name and language rules.
- [ ] Application and adapter: account state with the name in the gate's profile read; profile save seam shared by onboarding and Settings.
- [ ] One server guard on every authenticated page; leader pages, upload and finalize gated; login, callback and consent route through `accessDestination`.
- [ ] Migration (`NOT VALID` format check) and pgTAP 30.
- [ ] `/welcome` (fourth access step) and Settings → Profile on T25 primitives; Settings declutter and local error state; sign-out on consent and welcome; honest no-membership state.
- [ ] Demo: `new-student@example.invalid` with an empty profile, no fixture-name fallback, per-account profiles, `/welcome` in the route table.
- [ ] Tests, docs (CONTEXT "Profile completion", "Account language"; DESIGN onboarding line; walkthrough), independent review, rendered review, PR.

## Decisions

- D6, D7, D8, D9, D10 from the [plan](../../docs/reviews/wp03-refinement/plan.md#decisions-taken-under-the-delegation): derived completion (non-empty trimmed name), account language reuses `preferred_language` (`EN`, `AR_EG`), `NOT VALID` constraint, application-level leader gate, fifth demo pair.
- The database check enforces structure only (trimmed, single spaces, 1 to 80 characters, no control or bidi controls). "Contains a letter" stays in the application rule, because Postgres character classes depend on the database locale and could reject Arabic names.
- `getCurrentAuthAccess` stays uncached (PJ-12 not done): a request-cached snapshot could go stale inside the save action that completes the profile.

## Current state

**Changed:** NOT STARTED (plan only).

**Proof:** none yet.

**Review:** pending independent review (`independent-reviewer`).

**Approved commit:** PENDING (material UI: `/welcome`, Settings → Profile).

**Remaining:** all steps.

## Next action

Implement the domain and gate slice test-first, then the migration and pgTAP.
