# Audit: product logic, user journeys and first-time onboarding

- **Area:** WP03 refinement, audit area "journeys" (feeds planned task T27: onboarding + journey completeness + demo compatibility)
- **Base:** `main` at `bcab083`, read-only static audit on 2026-10-18. No servers, builds or tests were run.
- **Method:** I read the auth, account, settings, catalog, workspace, Batch Leader, admin and synthetic-runtime code, plus the migrations and pgTAP tests behind them. I compared the result with `DESIGN.md` (IA, theme/persistence and state rules), `PRODUCT.md`, master plan §6.7/§7 and the runbook (WP03-T02/T03/T11/T17, WP08-T04, WP11-T02).

---

## 0. Corrections to the brief and facts that shape the design

1. **Most of the column grant already exists.** `authenticated` may already update `display_name, preferred_language, chat_retention_mode, updated_at` (`supabase/migrations/20260831064458_rls_grants_indexes.sql:100-101`), plus `academic_context` (`20260930220000_profile_academic_context.sql:55`). The RLS matrix pins exactly this set (`supabase/tests/17_actor_action_resource_matrix.sql:236-247`). It also proves own-row `display_name` and `preferred_language` updates and cross-user denial (`:1113-1140`, `:1355-1376`). **No grant migration is needed.** The only schema work worth doing is format validation for `display_name` (§4.6).
2. **Names cannot come from sign-up metadata.** Copying `raw_user_meta_data` into the profile is deliberately forbidden: `supabase/tests/03_profiles_roles_terms.sql:26-29` asserts that untrusted metadata `display_name` is *not* copied, and the trigger inserts `user_id` only (`20260831064411_profiles_roles_terms.sql:80-93`). So the name has to be collected **after verification and consent**, through the RLS-scoped own-profile update. A `signUp({ data: { name } })` shortcut is ruled out.
3. **`preferred_language` is loaded but never used.** It is read into `account.locale` (`src/lib/account/account.supabase.server.ts:20,33`) and nothing reads it after that. Its value set (`EN|AR_EG|MIXED`) matches `chat_sessions.language_mode` (`20260831064439_tutor_sessions_answers_evidence.sql:6,13`), so it was designed as a study/answer-language preference. Real chat sessions take `language_mode` from the **UI locale** instead (`src/lib/workspace/workspace.application.ts:91-99`). `getCurrentStudentProfile` (`src/lib/db/supabase/student-access.server.ts:29-48`) reads it too, but only tests call that function.
4. **A self-registered user gets no role and no cohort membership.** No app code writes `user_roles` or `cohort_memberships`; they are seeded by SQL only (fixtures, `tests/e2e-database/product-shell.spec.ts:245-262`). `roleHome([])` returns `/learn` (`src/lib/account/account.domain.ts:55-61`), and `current_student_catalog_state()` returns `NO_MEMBERSHIP` (`20260914112000_student_catalog_journey.sql:150-167`). The academic setup only appears when the catalog is `READY` (`src/app/learn/page.tsx:100-106`). **A genuinely new real user therefore never sees academic setup.** They land on an empty Study Shelf.
5. **The hosted integration test confirms the empty name:** a fresh hosted account reads `{ displayName: "", preferredLanguage: "EN" }` (`tests/integration/supabase-auth-hosted.test.ts:229-233`).
6. **Locale is URL-only.** `resolveLocale(query.lang)` falls back to `en` (`src/lib/i18n/locale.ts:14-16`). There is no cookie and no profile read. The root `<html>` is rendered as `lang="en" dir="ltr"` and corrected only on the client (`src/app/layout.tsx:56-60`, `app-shell.tsx:49-52`).
7. **Appearance stays in localStorage by design** (`DESIGN.md:80`; `src/lib/theme/theme.domain.ts:2,16-26`; `src/app/_components/appearance.tsx:90-112`). The existing `Appearance` component can be reused as-is.

---

## 1. Journey map (real, non-demo)

Legend: ✅ works · ⚠️ works with gap · ❌ missing/broken. Gap IDs refer to §2.

### 1.1 Student

| # | Step | Route / entry | Files | Collects | Persists where | Entry → exit / completion | Error / empty / recovery | Gaps |
|---|---|---|---|---|---|---|---|---|
| 1 | Anonymous landing | `/` | `src/app/page.tsx:8-25`, `_components/landing.tsx:23-24` | – | – | Signed in → role home / `/consent` / `/verify-email` (adds `?lang`). Anonymous → Landing with Register/Sign in CTAs (adds `?lang`). | Account service failure → anonymous landing | ⚠️ No locale memory without `?lang` (PJ-08) |
| 2 | Register | `/register` | `(auth)/register/page.tsx`, `_components/auth-page.tsx`, `auth-form.tsx:274-387`, `actions.ts:97-107`, `lib/auth/auth-actions.application.ts:93-117`, `auth-flow.domain.ts:134-172` | Email, password, confirmation | `auth.users`. Trigger creates `profiles` with `display_name ''`, `preferred_language 'EN'`, `PENDING` (`profiles_roles_terms.sql:1-16,80-100`) | Stays on `/register` with a "Check your email" notice. Signed-in users are redirected (`auth-page.tsx:78-92`). | Field errors, rate limit, unavailable | ❌ No name (PJ-01). ⚠️ Callback URL drops `lang` (PJ-08) |
| 3 | Verify email | Email link → `/auth/callback?code…&next=` → gate | `src/app/auth/callback/route.ts:40-115`, `lib/auth/auth-callback.application.ts` | – | `email_confirmed_at` → trigger sets `ACTIVE` (`20260913063500_activate_verified_auth_profiles.sql`) | → `/consent?next=` **without `lang`** (`route.ts:103-105`) | Expired/replayed/invalid → `/verify-email?status=` without `lang` (`route.ts:79-87`). `/verify-email` offers a resend that needs the email typed again. | ⚠️ PJ-08. ⚠️ Possible cross-device PKCE failure (PJ-21, unverified) |
| 4 | Consent | `/consent` | `(auth)/consent/page.tsx`, `actions.ts:143-178`, `auth-access.application.ts:72-84` | Accept checkbox (terms/privacy/boundary versions) | `terms_acceptances` | → `redirectAfterAuthentication` → role home with `lang` | Unavailable panel. **No sign-out or switch-account link** (`auth-form.tsx:463`). | ⚠️ PJ-14 |
| 5 | First role routing | Server redirect | `account.domain.ts:55-61`, `account.supabase.server.ts:38-48` | – | `user_roles` (read) | No roles → `/learn` | – | ⚠️ Dual role (PJ-16) |
| 6 | Profile setup | **does not exist** | – | – | – | – | – | ❌ PJ-01/02/03 |
| 7 | Academic setup | `/learn` (inline onboarding) | `learn/page.tsx:100-128`, `_components/academic-settings.tsx:23-252` (onboarding at `:254-426`), `lib/account/academic-setup.application.ts`, `account.application.ts:23-40`, `settings/actions.ts` | Stage → institution → program → level → term (→ cohort) | `profiles.academic_context` (validated trigger `profile_academic_context.sql:4-54`). The draft lives in document memory only (`academic-setup-draft.tsx`). | Shown only when the catalog is `READY` and nothing authorized is saved. Save → shelf. | `rows.length===0` copy (`academic-settings.tsx:158-164`). Save errors keep the selections. | ❌ Never reached by a new real user, who is `NO_MEMBERSHIP` (PJ-05) |
| 8 | Empty shelf (new user) | `/learn` | `learn/_components/study-shelf.tsx:127-134,274-287`, `lib/i18n/catalog-copy.ts:28-30` | – | – | Dead end: "not currently assigned to a learning cohort" | No next action (violates `DESIGN.md:189`) | ❌ PJ-05 |
| 9 | First use | `/learn/[c]/[u]/**` | `lib/workspace/workspace-route.server.ts:11-48`, `workspace.application.ts:91-104`, `learn/[cohortId]/[unitId]/chat/actions.ts` | Chat start (UI locale) | `chat_sessions` (`language_mode` from UI locale, `retention_mode 'MINIMAL'`) | – | Gate redirects drop `lang` (`workspace-route.server.ts:21-37`) | ⚠️ PJ-08, PJ-12 |
| 10 | Regular use | `/learn` | `account.supabase.server.ts:78-103`, `learn/page.tsx:94-99` | – | – | Resume = newest open chat session | – | ✅ |
| 11 | Settings | `/settings` | `settings/page.tsx:21-102`, `_components/account-settings.tsx:35-233`, `account-layout.tsx`, `appearance.tsx` | Appearance; Academic (students); Privacy (disabled); "Reset password" link | localStorage (theme); `academic_context` | Tabs: Appearance, Academic, Privacy, Identity and access. Sign-out sits in the summary. | Catalog/account load is **not** caught (`settings/page.tsx:34,41`), so a failure shows the generic error page with **no sign-out** | ❌ No name, language or email (PJ-03). ⚠️ PJ-13 |
| 12 | Sign-out | Form → `logoutAction` | `(auth)/actions.ts:180-184` | – | Supabase session cleared | → `/login?status=signed_out` **without `lang`** | – | ⚠️ PJ-08 |
| 13 | Password recovery | `/forgot-password` → email → `/auth/callback?next=/reset-password` → `/reset-password` | `auth-actions.application.ts:142-174`, `reset-password/page.tsx:10-31`, `actions.ts:128-141` | Email, then new password ×2 | Supabase | Callback → `/reset-password` **without `lang`** (`route.ts:88-94`). After update: signed in → role home. | Invalid/expired → `/forgot-password?status=` without `lang` | ⚠️ PJ-08. Settings → "Reset password" forces the email round-trip (PJ-19) |

### 1.2 Batch Leader

| # | Step | Route / files | What happens | Gaps |
|---|---|---|---|---|
| 1 | Invitation | – | **No real invitation**: no route, token, RPC or email. The `BATCH_LEADER` role and `batch_leader_assignments` (`invited_by`, `accepted_at`) are SQL-seeded only. `DESIGN.md:168` and master plan §7.2.3/§7.3.1 expect an expiring invitation. Blocked by D-01/D-03 and WP11-T02 (`runbook:140,2601`). | ❌ PJ-17 (blocked) |
| 2 | Register / verify / consent | Same as student | Same flow. | PJ-01, PJ-08 |
| 3 | First routing | `roleHome` → `/batch-leader` | – | – |
| 4 | Intake home | `/batch-leader` → `batch-leader/page.tsx:28-51`, `_components/leader-home.tsx` | **No `getCurrentAuthAccess` call**: an RPC failure is treated as "sign in" (`page.tsx:37-43`). Empty state promises "Its invitation will take you here" (`leader-home.tsx:414-418`), but no invitation exists. | ❌ PJ-04, ⚠️ PJ-18 |
| 5 | First campaign | `/batch-leader/campaigns/[id]` → `page.tsx:27-58`, `api/batch-leader/campaigns/[campaignId]/uploads`, `[campaignId]/actions.ts` | Also skips the account/consent/suspension gate. The DB predicate `has_campaign_assignment` checks only the assignment (`20260831220554_reusable_authorization_predicates.sql:44-61`), and the upload internals check assignment, campaign and item only (`20260922143605_batch_leader_collection_flow.sql:200-224`). | ❌ PJ-04 |
| 6 | Account | `/settings` (role "leader") | Appearance, a **Privacy (chat sharing) tab that does not apply to this role**, Identity. No academic tab, even when the leader is also a cohort student. | ⚠️ PJ-15, PJ-16 |

### 1.3 Admin

| # | Step | Route / files | What happens | Gaps |
|---|---|---|---|---|
| 1 | Provisioning | – | `ADMIN` role is granted by SQL only. No admin UI grants roles, memberships, campaigns or invitations (the action set is `admin-actions.domain.ts:3-16`). The UI is planned for WP08-T04 / WP11. | ❌ PJ-17 (blocked) |
| 2 | First use | `/admin` → `admin/page.tsx:17-77` | Gate checked. Empty queue copy reads "No decisions are waiting" (`admin-copy.ts:38`). | ✅ |
| 3 | Resources | `/admin/[resource]` → `admin/[resource]/page.tsx:28-85` | **All eight resources render "This view is not available yet"** (`:72-81`). Any non-READY gate, including CONSENT_REQUIRED and VERIFY_EMAIL, goes to `/login` (`:49-51`). `/login` re-renders the form for an already signed-in user (`auth-page.tsx:78-87` only redirects READY). | ⚠️ PJ-11, PJ-20 |
| 4 | Account | `/settings` (role "admin") | Same as leader: an irrelevant Privacy tab, no name. | PJ-03, PJ-15 |

---

## 2. Findings

Severity: P0 blocks release · P1 founder-visible product gap or trust inconsistency · P2 significant · P3 polish. Effort: S ≤½ day, M 1–3 days, L >3 days.

| ID | Class | Sev | Role / surface | Evidence (file:line) | Why it occurs | Recommended fix | Effort |
|---|---|---|---|---|---|---|---|
| PJ-01 | Missing functionality | P1 | All roles: register → first use | `auth-form.tsx:274-387` (email/password only). `(auth)/actions.ts:97-107`. Default `display_name ''` (`profiles_roles_terms.sql:3`). `supabase-auth-hosted.test.ts:229-233`. No writer of `display_name` anywhere in `src/` (grep). | WP03-T02 scoped identity and consent. T09 added only `academic_context`. Metadata copying is forbidden by design (`03_profiles_roles_terms.sql:26-29`). | Add a post-consent profile step (`/welcome`) with a gate derived from the data (§4). | M |
| PJ-02 | Confirmed defect (assumes uncollected data) | P1 | Student shell; Settings summary | `app-shell.tsx:38-43` falls back to "Your profile"/"ملفك الشخصي" with initial "Y"/"م" (`:43,224-238`). `account-layout.tsx:40-45` shows the role only. `DESIGN.md:170` requires "a single **named** profile". | The UI assumes a name that nothing collects. | Ensured by PJ-01. Keep the fallback for robustness. | S |
| PJ-03 | Missing functionality | P1 | Settings, all roles | `account-settings.tsx:101-230`: views are Appearance, Academic, Privacy, Identity. No name field, no language preference, **no email shown**, so a user cannot tell which account is signed in. `settings/page.tsx:69-100`. | Settings was built as appearance plus academic plus placeholders. | Add a first "Profile" view: email (read-only, from verified claims), name, account language. Use the same seam as onboarding (§4.8). | M |
| PJ-04 | Confirmed defect (gate inconsistency; cross-ref security audit) | P1 | Batch Leader routes and upload | `batch-leader/page.tsx:33-43` and `campaigns/[campaignId]/page.tsx:34-46` never call `getCurrentAuthAccess`. Upload route → `upload-handler.server` → repository only. `has_campaign_assignment` has no account-status or consent term (`…reusable_authorization_predicates.sql:44-61`). `DESIGN.md:168`: "routes by role **after account/consent checks**". | The gate was implemented per page for learn, admin and settings only. Leader pages rely on the assignment RPC. | One shared guard `requireReadyAccess({ next, locale })` (§4.4) on both leader pages, the upload route (403) and the finalize action. Decide with the security audit whether `ACTIVE`+consent also belongs in `has_campaign_assignment`. | M |
| PJ-05 | Missing functionality / dead end | P2 (P1 for beta) | New real student | `learn/page.tsx:100-106` shows setup only when `READY`. `study-shelf.tsx:274-287` and `catalog-copy.ts:28-30`: "not currently assigned…" with **no next action** (`DESIGN.md:189`). Membership is only ever SQL-seeded. | The invitation/membership grant is unbuilt and blocked (WP11-T02, D-01/D-03). | Short term: rewrite the `NO_MEMBERSHIP` state to give the next action (e.g. "Access comes from your cohort invitation. Check the email you were invited with, or contact your Batch Leader"), add a sign-out, and keep the profile step so the account is ready when membership arrives. Long term: the invitation → membership flow (PJ-17). | S (copy) |
| PJ-06 | Confirmed defect (demo hides missing functionality) | P1 | Demo, all roles | `synthetic-account.application.ts:20-25` (fixed names). `product-services.tsx:60-70,84-90` falls back to `syntheticDisplayNames[role]` **even when `displayName` is null**. Loopback register (`product-auth.tsx:221-230`) produces a "new" student who still shows "Samir Hassan". | Demo fixtures were authored to look populated. | See §4.10: remove the role-based name fallback, seed names per account, add a new-account pair with an empty profile. | M |
| PJ-07 | Confirmed defect (demo hides missing functionality) | P2 | Demo register → shelf | Loopback register sets `role:"student"` (`product-auth.tsx:224-228`). The catalog is every fixture row (`study-screens.tsx:79-96`, `sampleScopeAvailable`). Real: no role, no membership, `NO_MEMBERSHIP`. | The demo models an invited student without saying so. | The walkthrough and on-screen demo copy must say membership comes from an (unbuilt) invitation. Keep the `?fixture=no-membership` path (`screen-frame.tsx:36`) and point to it from the new-account guide. | S |
| PJ-08 | Confirmed defect | P2 | All roles, locale continuity | Callback URLs carry no `lang` (`auth-actions.application.ts:105-106,129-130,151-152`). Callback redirects without `lang` (`auth/callback/route.ts:82-109`). Logout (`(auth)/actions.ts:183`) and workspace guard redirects (`workspace-route.server.ts:21-37`) also drop it. Locale is URL-only (`locale.ts:14-16`). | Locale was designed as a query param with no fallback store. | Add `lang` to callback URLs and read it in the callback. Add an `unimind-locale` cookie as the fallback, plus the account language (§4.7). Route every redirect through one `accessDestination()` that always appends `lang`. | M |
| PJ-09 | Missing functionality | P2 | All roles, language preference | `preferred_language` is read and ignored (`account.supabase.server.ts:20,33`). Nothing writes it in the UI. Cross-device or new-session language is not remembered. | No seam was ever built. | Reuse it as the **account language** (EN/AR_EG), written by onboarding, Settings and the shell switch (§4.7). | M |
| PJ-10 | Technical inefficiency | P2 | Gate handling (9 files) | Gate→redirect mapping is duplicated in `page.tsx`, `learn/page.tsx:44-67`, `settings/page.tsx:29-33`, `admin/page.tsx:28-56`, `admin/[resource]/page.tsx:41-57`, `workspace-route.server.ts:16-38`, `(auth)/actions.ts:38-77`, `auth/callback/route.ts:96-112`, `consent/page.tsx:34-56`. Behavior diverges (lang dropped, CONSENT→login, missing on leader routes). | Gate handling grew one page at a time. | Pure `accessDestination(gate, {locale, next})` in `auth-flow.domain.ts` plus one server guard. This is the prerequisite for adding a `PROFILE_REQUIRED` gate safely. | M |
| PJ-11 | Confirmed defect | P3 | Admin resources | `admin/[resource]/page.tsx:49-51` sends CONSENT_REQUIRED/VERIFY_EMAIL to `/login`. `auth-page.tsx:78-87` then shows the sign-in form to a signed-in user. | Non-READY gates are collapsed into one branch. | Fixed by PJ-10. | S |
| PJ-12 | Technical inefficiency | P3 | Every authenticated page | `getCurrentAuthAccess` is not request-cached (`auth-access.supabase.server.ts:97-99`). It costs getClaims + profile + terms + acceptance per call. `/learn` also reads the profile again in `loadCurrentAccount` (`account.supabase.server.ts:14-37`), and `saveCurrentAcademicSettings` re-runs the gate. | No `cache()` wrapper (workspace guard does use one: `workspace-route.server.ts:11`). | Wrap it in React `cache()`. Make the gate's profile read return `display_name` so the profile check costs no extra round-trip. | S |
| PJ-13 | Confirmed defect (dead end) | P2 | Settings | `settings/page.tsx:34,41`: `loadCurrentAccount()` and `loadCurrentStudentCatalog()` are not caught, so the generic `app/error.tsx` (retry only) replaces the page. Settings is the **only** sign-out entry (grep `logoutAction`: `settings/page.tsx` only). | No local error state. | Catch the catalog failure as `/learn` does (render Settings without the academic view and show an error notice). Expose sign-out where a signed-in user can get stuck: consent, welcome, error page. | S |
| PJ-14 | UX opportunity | P3 | Consent (and future welcome) | `auth-form.tsx:463`: consent has no secondary action, so there is no "sign out / use another account". | – | Add a sign-out form action on the consent and welcome pages. | S |
| PJ-15 | UX opportunity | P3 | Leader and admin Settings | `account-settings.tsx:131-209`: the "Future exchange sharing" Privacy view renders for every role. | One shared component. | Show Privacy only to student-capable accounts. | S |
| PJ-16 | Subjective design call (needs founder decision) | P2 | Batch Leader who is also a cohort student | `roleHome` precedence (`account.domain.ts:55-61`). Leader nav has no Study (`app-shell.tsx:169-178`). Settings loads the academic catalog only when home is `/learn` (`settings/page.tsx:35-41`). | One "home role" also drives navigation and Settings. | Decide: either offer a "Study" destination to leaders with an active membership (derived from `current_student_catalog_state() <> 'NO_MEMBERSHIP'`), or record that leaders do not study in UniMind. No role chooser (`DESIGN.md:168`). | M |
| PJ-17 | Missing functionality (blocked by decisions) | P2 | Admin → Batch Leader → Student provisioning | No invitation, membership grant, role grant or campaign creation in real code. The admin action set has none of these (`admin-actions.domain.ts:3-16`). Master plan §7.2.2-3 and §7.3.1. Runbook `:140,2601`, WP08-T04 `:2281-2286`. | Deferred by D-01/D-03 and WP08/WP11. | Out of T27 scope. Record as a known journey gap. Copy and demo must not imply it exists (PJ-07, PJ-18, PJ-22). | L |
| PJ-18 | Confirmed defect (copy promises absent feature) | P3 | Leader empty state | `leader-home.tsx:414-418`: "Its invitation will take you here." No real invitation exists. | Copy written for the demo flow. | Change to "An administrator assigns campaigns. They appear here when active." | S |
| PJ-19 | UX opportunity | P3 | Settings → Identity | `account-settings.tsx:222-226` links to `/forgot-password` (email round-trip), although `reset-password/page.tsx:16-28` accepts any verified session. | – | Offer "Change password" → `/reset-password?lang=` for signed-in users. Confirm Supabase reauthentication settings first. | S |
| PJ-20 | Confirmed defect (demo vs real) | P2 | Admin resources | Demo renders populated `ProductResource` views (`_synthetic/screens/operations-screens.tsx:33-41`). Real renders "This view is not available yet" for all eight (`admin/[resource]/page.tsx:72-81`). | Demo builds ahead of backend (T09 scope). | Label demo-only resources in the demo, or list them in the walkthrough "not real yet" table. No real change in T27. | S |
| PJ-21 | Needs verification (risk) | P2 | Verify / reset links opened on another device | `signUp`/`resetPasswordForEmail` go through the SSR server client (PKCE). The callback supports `code` and `token_hash` (`auth/callback/route.ts:49-59`), but the repo has no `token_hash` email template (`supabase/config.toml:246-255` commented). A PKCE `code` opened in another browser fails exchange → `invalid_link`, even though the email may already be confirmed. | Default templates. | Verify on Preview. If it reproduces, switch the confirm/recovery templates to `{{ .TokenHash }}` links (the callback already handles them) and make the `invalid_link` copy suggest "Try signing in". | S–M |
| PJ-22 | Confirmed defect (demo vs real) | P3 | Demo settings privacy | Demo passes a working sharing toggle (`_synthetic/screens/settings-screen.tsx:92-96`). Real passes `privacy={null}` → disabled with a notice (`settings/page.tsx:98`, `account-settings.tsx:140-147`). D-08 is still Proposed. | Demo builds ahead of backend. | Demo should show the same "not available yet" notice, or the walkthrough must flag it as preview. | S |
| PJ-23 | Confirmed defect (demo vs real) | P3 | Demo password reset | Demo → `/login?status=signed_out` (`product-auth.tsx:231-238`). Real → signed in, role home (`(auth)/actions.ts:128-141`). | Demo shortcut. | Align the demo with real: enter the role home. | S |
| PJ-24 | Confirmed defect (demo vs real) | P3 | Demo register result | Demo navigates to `/verify-email?status=check_email` (`product-auth.tsx:229`). Real stays on `/register` with a notice (`auth-form.tsx:198-252`, no redirect). | Demo shortcut. | Pick one: the redirect is the better UX, so make the real register action redirect to `/verify-email?lang=&status=check_email&email=`. | S |
| PJ-25 | Confirmed defect (demo vs real) | P3 | Hosted demo consent | Every hosted demo sign-in goes through consent (`hosted-synthetic-runtime.tsx:34`). Real users accept once per terms version. A "returning user" is never shown. | Demo resets per document. | Keep for the four existing pairs (documented). The new-account design in §4.10 demonstrates non-repetition in loopback. | – |
| PJ-26 | Technical inefficiency | P3 | Locale SSR | `layout.tsx:56-60` hard-codes `lang="en" dir="ltr"`. Arabic pages correct it only in client effects (`app-shell.tsx:49-52`, `auth-form.tsx:213-216`). | Root layout cannot read `searchParams`. | With the locale cookie mirrored by the proxy (§4.7), the root layout can read `cookies()` and render the correct `lang`/`dir` on the server. | S |
| PJ-27 | Technical inefficiency | P3 | Dead adapter | `getCurrentStudentProfile` (`student-access.server.ts:29-48`) is used only by tests. | Superseded by `loadCurrentAccount`. | Remove it, or fold it into the new profile adapter. | S |
| PJ-28 | Missing functionality | P2 | DB profile validation | `display_name` has only `char_length <= 120` (`profiles_roles_terms.sql:9-10`). Any authenticated user can store control or bidi-override characters through the Data API (column grant `rls_grants_indexes.sql:100`). | No validation was needed while nothing wrote it. | Add a format CHECK constraint (§4.6). | S |
| PJ-29 | UX opportunity | P3 | Return paths | `validatedInternalReturnPath` allows only `/learn…` and `/batch-leader…` (`auth-flow.domain.ts:196-205`). `next=/settings` and `next=/admin…` fall back, which works for admin through role home but loses `/settings`. | Conservative allow-list. | Add `/settings` and `/admin(/resource)?` to the allow-list. Keep the open-redirect tests. | S |
| PJ-30 | Needs verification (risk) | P3 | Hosted `/register` with demo emails | Hosted `/register` is the real form, and only **login** is intercepted for synthetic pairs (`auth-form.tsx:168-196`). Registering `*@example.invalid` there probably calls the real `signUp` and may create a real PENDING auth user. | Intercept covers login only. | In hosted mode, intercept registration of known synthetic emails with "Demo accounts sign in directly". Verify on Preview first. | S |

### 2.1 Demo-vs-real discrepancies (consolidated)

1. Pre-populated names; the real name is never collected (PJ-06, PJ-01).
2. Demo register → student role and full catalog; real → no role, `NO_MEMBERSHIP` (PJ-07, PJ-05).
3. Privacy sharing toggle works in the demo but is disabled in real (PJ-22).
4. Admin resources are populated in the demo but are placeholders in real (PJ-20).
5. Batch Leader invitation screen (`synthetic-route.application.ts:73-77`, `product-campaigns.tsx:46-90`) has no real counterpart (PJ-17). The demo labels it "synthetic invitation example", which is acceptable.
6. Password reset ends signed out in the demo and signed in in real (PJ-23).
7. Register exits to `/verify-email` in the demo but stays on `/register` in real (PJ-24).
8. Consent on every hosted sign-in in the demo, once per terms version in real (PJ-25).
9. Chat "Study language" selector works in the demo (`product-chat.tsx:46,486-503`) and is disabled in real because answering is not live. Acceptable, but the real account language should become its default later (PJ-09).
10. Latest-work return covers Studio and Quiz in the demo and Chat only in real. Already documented (`DESIGN.md:84`); acceptable.
11. Leader/admin Settings in the demo show the fixture name; real shows the role only (PJ-02/03).

---

## 3. Root cause in one paragraph

Identity, consent and academic context each got a gate or seam. Personal profile and language never did. The demo then filled the gap with fixture names, and the role-based fallback in `SyntheticProductProvider` hid it even on the demo's own "new account" path. Locale was modelled as a URL parameter, so every redirect that forgets `lang` (email links, sign-out, workspace guards) silently resets an Arabic user to English. Gate logic is copied per page, which is why the Batch Leader routes were missed entirely.

---

## 4. Onboarding design proposal

### 4.1 Steps and order (one flow, no duplication)

| Step | Where | Who | Status |
|---|---|---|---|
| 1. Account | `/register` (email, password) | all | unchanged (PJ-24 optional redirect) |
| 2. Verify email | email → `/auth/callback` → gate | all | fix `lang` (PJ-08) |
| 3. Commitments | `/consent` | all | unchanged; add sign-out (PJ-14) |
| **4. Your profile** | **`/welcome`** (in `AuthShell`, as the 4th stepper item; `auth-shell.tsx:16` already types `activeStep: 0\|1\|2\|3`) | **all roles** | **new** |
| 5. Academic path | `/learn` existing one-question-at-a-time setup (`academic-settings.tsx` onboarding mode) | students with a `READY` catalog | unchanged; reached immediately after step 4 |
| 5′. No membership | `/learn` `NO_MEMBERSHIP` state | students without membership | improve copy and next action (PJ-05) |
| 6. Home | role home | all | – |

The academic setup is **not** moved into `/welcome`. It already has its own gate (derived from `authorizedAcademicContext`), its own draft memory and its own tests, and it only applies to students with an authorized catalog. `/welcome` hands off to it via `next` = role home.

### 4.2 Fields: mandatory, optional, defaulted

| Field | Rule | Stored | Notes |
|---|---|---|---|
| Full name (`display_name`) | **Mandatory.** NFC-normalized, trimmed, internal whitespace collapsed, 1–80 characters, at least one letter (`\p{L}`). No control characters (`\p{Cc}`). No bidi controls (U+061C, U+200E/F, U+202A–U+202E, U+2066–U+2069). Arabic, Latin and mixed scripts allowed. | `profiles.display_name` | `<input autocomplete="name" dir="auto" maxlength=80>` with a live error summary (same pattern as `auth-form.tsx`). |
| Interface/account language | **Mandatory but defaulted:** pre-selected to the current page locale. One tap to confirm. | `profiles.preferred_language` (`EN` / `AR_EG`); see §4.7 | Changing it re-renders the page in that language and **keeps the typed name** (`DESIGN.md:186`). |
| Appearance | **Optional, defaulted** to System. | localStorage `unimind.appearance.v1` (unchanged, `DESIGN.md:80`) | Reuse `<Appearance>` with its live preview. Device-local by design. |
| Academic path | Mandatory for students with a `READY` catalog (existing behavior) | `profiles.academic_context` | Unchanged. |
| Study/answer language, chat sharing mode, retention | **Not asked.** Chat answering is not live; D-08 is Proposed; D-19 is open. | – | Chat default stays the account language; Settings can expose these later. |

### 4.3 How completion is derived

`profileComplete = display_name.trim() !== ""`. There is no `onboarded_at` flag.

Why:
- The project already prefers derived state over stored toggles (`PRODUCT.md`, "Unit availability is derived").
- The academic step is already derived the same way (`learn/page.tsx:100-106`).
- Existing accounts (all `''` in production) automatically get the step **once** and nothing needs backfilling.
- There is nothing to drift: if a user clears their name through the Data API, the step simply reappears.
- Language always has a value and appearance is device-local, so neither needs completion tracking.

The cost: optional, skippable steps can't be tracked. There are none now. If one is added later, introduce `profile_setup_version smallint` at that point.

### 4.4 Where the gate lives

- `src/lib/auth/auth-flow.domain.ts`: extend `AuthGate` with `"PROFILE_REQUIRED"`. `resolveAuthGate` gains `hasCompleteProfile` and returns `PROFILE_REQUIRED` **after** the consent check (so commitments come first) and before `READY`. Add a pure `accessDestination(gate, { locale, next }): string | null` that maps every gate to its route, always appends `lang`, and validates `next` (fixes PJ-08/10/11).
- `src/lib/auth/auth-access.application.ts`: rename the repository method to `getAccountState(userId) → { status, displayName } | null` and pass `hasCompleteProfile` into `resolveAuthGate`.
- `src/lib/auth/auth-access.supabase.server.ts`: select `account_status, display_name` in the **same** query (`:32-36`), so the gate adds no round-trip. Wrap `getCurrentAuthAccess` in React `cache()` (PJ-12).
- New server helper `requireReadyAccess({ next, locale })` (e.g. `src/lib/auth/access-route.server.ts`). It redirects via `accessDestination` and returns the snapshot. Use it in `learn/page.tsx`, `settings/page.tsx`, `admin/page.tsx`, `admin/[resource]/page.tsx`, `workspace-route.server.ts`, **both Batch Leader pages and the upload route** (PJ-04), and `page.tsx`. `redirectAfterAuthentication`, the callback route and `consent/page.tsx` use `accessDestination` directly.
- `/welcome` itself renders on `PROFILE_REQUIRED`, redirects `READY` to `next` or the role home (no repeat for returning users), and sends every other gate to its own route.
- Side effect to accept: server mutations that check `READY` (`saveCurrentAcademicSettings` at `account.supabase.server.ts:53`, the workspace guard) refuse until the profile is complete. That is correct, because the UI gate runs first.

### 4.5 Seams (following the academic-setup pattern)

| Layer | File | Content |
|---|---|---|
| Domain | **new** `src/lib/account/profile.domain.ts` | `displayNameSchema` (zod transform → normalized), field error codes `DISPLAY_NAME_REQUIRED \| DISPLAY_NAME_TOO_LONG \| DISPLAY_NAME_INVALID`, `isProfileComplete`, `accountLanguageFromLocale` / `localeFromAccountLanguage` (`MIXED` → `null`) |
| Application | **new** `src/lib/account/profile.application.ts` (or extend `account.application.ts`) | `ProfileSaveState` (`IDLE \| SAVED \| INVALID(fieldErrors) \| FORBIDDEN \| UNAVAILABLE`, mirroring `AcademicSaveState`). `ProfileRepository { eligibleCaller(); save(caller, { displayName, language }) }`. `saveProfile(repository, input)`. |
| Adapter | `src/lib/account/account.supabase.server.ts` | `saveCurrentProfile(input)`: eligible when the gate is `PROFILE_REQUIRED` or `READY`; `update({ display_name, preferred_language, updated_at }).eq("user_id", caller).select("user_id").single()` (same shape as `:59-72`). `loadCurrentAccount` also returns `language` and the verified email claim (display only). |
| Server Action | `src/app/settings/actions.ts`: `saveProfileAction` | Shared by `/welcome` and Settings, as `saveAcademicAction` is shared by `/learn` (`learn/page.tsx:26`). On `SAVED`: set the locale cookie, `revalidatePath("/settings")` and `"/learn"`. The welcome form then redirects to `accessDestination(READY…)`. |
| UI (shared) | **new** `src/app/_components/profile-settings.tsx` (client) | Props: `{ locale, initial: { displayName, language }, save, onboarding?, email? }`. Rendered by `/welcome` (onboarding: name, language, `<Appearance>`), by Settings → Profile, and by the synthetic runtime with a document-state `save`. |
| Route | **new** `src/app/(auth)/welcome/page.tsx` | `AuthShell` with `activeStep={3}`. Add `copy.profile` to `lib/i18n/auth-copy.ts` and the `[account, verify, consent, profile]` stepper array (`auth-shell.tsx:84`). Sign-out secondary action. |

### 4.6 Minimal additive migration (protected path)

Grants already exist (§0.1), so **no grant change**. One constraint:

```sql
-- Profile names stay optional legacy data ('') until the caller completes the profile step.
alter table public.profiles
  add constraint profiles_display_name_format_check check (
    display_name = ''
    or (
      char_length(display_name) between 1 and 80
      and display_name !~ '^\s|\s$|\s{2,}'
      and display_name !~ '[[:cntrl:]]'
      and display_name !~ '[؜‎‏‪-‮⁦-⁩]'
      and display_name ~ '[[:alpha:]]'
    )
  ) not valid;
alter table public.profiles validate constraint profiles_display_name_format_check;
```

- Before running it, query the Preview and Beta data for non-conforming names. If any exist, keep `NOT VALID` and validate in a later migration.
- **Rollback:** `alter table public.profiles drop constraint profiles_display_name_format_check;`
- **Not recommended:** a consent/ACTIVE eligibility trigger like `validate_profile_academic_context`. `test 17` proves Student B (who has no consent in that fixture; compare `29_profile_academic_context.sql`, "nonconsenting caller") can update `preferred_language` (`17_…matrix.sql:1355-1366`). A consent trigger would break that reviewed contract, and writing your own name or language before consent carries no data risk.
- `preferred_language` keeps its existing check. The app writes only `EN` or `AR_EG`. `MIXED` stays valid for compatibility.
- No change to `src/types/database.generated.ts`.

### 4.7 Language persistence

**Decision needed (subjective; my recommendation is Option A).**

- **Option A (recommended): reuse `profiles.preferred_language` as the account language** (`EN` = English UI, `AR_EG` = Arabic UI; `MIXED` → no UI preference). This needs no schema change. The column is already granted and covered by the RLS matrix. The prior persistence guidance allows it ("Reuse preferred-language field only through a safe existing/required account seam", `docs/reviews/wp03-frontend-overhaul.md:123`). It also serves as the default chat/study language later, replacing the UI-locale mapping at `workspace.application.ts:96-99`. Record "Account language" in `CONTEXT.md`.
- **Option B:** a new nullable `interface_locale text check (in ('en','ar'))` plus a grant, if the founders want UI language and default answer language to differ at account level. It costs one more column and pgTAP rows.

**Precedence.** Add a pure function `resolvePreferredLocale({ query, cookie, account })` in `src/lib/i18n/locale.ts`:
1. Valid `?lang=` on the request.
2. Cookie `unimind-locale` (`en|ar`; `Path=/`, `SameSite=Lax`, `Secure` in production, 1 year).
3. Account language, used only where the profile is already loaded: post-login, callback, welcome.
4. `en`.

**Writes:**
- The proxy mirrors a valid `?lang=` into the cookie on real-runtime responses (`src/proxy.ts:132` path). This covers the shell switch, AuthShell links and email links. `proxy.ts` is auth-adjacent, so treat it as a protected-path review.
- `saveProfileAction` (onboarding, Settings) writes profile and cookie.
- The `LanguageSwitch` (`frontend-controls.tsx:115-152`) gets an optional `onPersist(language)` prop. Real routes pass a fire-and-forget `saveAccountLanguageAction` for READY users; the synthetic runtime updates document state. One preference, three entry points.
- Sign-in/callback: when the login request carried no explicit locale signal (no `?lang`, no cookie), redirect with the account language and set the cookie. The login form needs a hidden `localeSource` to tell the cases apart.

**Reads:**
- Pages replace `resolveLocale(query.lang)` with a server helper `requestLocale(searchParams)` that reads `cookies()` (Next 16: reading is allowed in Server Components, writing only in Server Functions/Route Handlers; `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md:6,72-83`).
- The root layout reads the cookie to render `lang`/`dir` on the server (PJ-26).
- Email links: append `lang` to `emailRedirectTo` (`auth-actions.application.ts:105,129,151`) and have the callback carry it forward.

### 4.8 Settings edits the same fields

`AccountSettings` (`account-settings.tsx:35-233`) gets a `profile` prop. A new first view, `{ id: "profile", label: "Profile" / "الملف الشخصي" }`, shows the email (read-only), name and language, rendered through the shared `ProfileSettings`. Appearance keeps its own view. Privacy is shown to students only (PJ-15). The real page passes `saveProfileAction`; the synthetic page passes a document-state save. The shared e2e helpers `expectStudentSettingsScreen` (used by both demo and DB e2e) must learn the new tab.

### 4.9 Recovery, returning users, compatibility

- **Interruption before saving:** nothing is persisted, so the gate returns the user to `/welcome?next=` on any route. The name field is not persisted until submit (no client storage of personal data).
- **Interruption after the name, before the academic step:** the existing academic gate on `/learn` resumes. Its draft is document memory only, as today.
- **Returning user:** `READY` skips `/welcome` (it redirects away when visited directly).
- **Existing accounts:** one-time step, all sessions stay valid, deep links preserved via `next`.
- **Fixtures that log in through the UI must seed a name**, or their tests will land on `/welcome`:
  - `tests/e2e-database/product-shell.spec.ts:245-247` (the login helper asserts the role home at `:108-114`)
  - `supabase/fixtures/wp02-synthetic.sql:31-37`
  - any hosted smoke account

### 4.10 Demo support

**How the hosted pairs work today:**
- Defined in `src/lib/demo/synthetic-account.application.ts:4-18`: an exact password plus a normalized email checked with `Object.hasOwn`.
- Validated by `tests/unit/synthetic-login.test.ts` and `tests/e2e/hosted-synthetic-login.spec.ts`.
- Intercepted only in `AuthForm` login mode (`auth-form.tsx:168-196`), then `HostedSyntheticRuntime.enter(role, …)` (`hosted-synthetic-runtime.tsx:31-37`).
- Published in `scripts/prepare-synthetic-demo-pack.ts:37-44` and `docs/reviews/wp03-synthetic-frontend-review.md:70-75`.
- The T11 contract approved **four** pairs (`planning/tasks/wp03-t11-hosted-synthetic-login.md`, Outcome/Inputs), so a fifth needs its approval recorded in the T27 record. The founders' brief asking for "a genuinely new demo account" is that input.

**Changes:**
1. Change `syntheticAccounts` to `email → { role, displayName: string | null }`. Add `new-student@example.invalid` → `{ role: "student", displayName: null }`. Replace `syntheticLoginRole` with `syntheticLoginAccount`, and keep a thin `syntheticLoginRole` for existing callers or update them.
2. `SyntheticProductProvider` (`product-services.tsx:60-90`): seed `displayName` from the account at entry and **remove the role-based fallback** in the profile context. `ProductAuth` and `HostedSyntheticRuntime.enter` pass the account, not just the role.
3. Keep a document-local `profiles: Record<email, { displayName, language }>` so a loopback sign-out/sign-in shows the **returning** behavior (today `signedOut` nulls `displayName`, `screen-frame.tsx:121-163`). Hosted sign-out still discards everything (T11 contract).
4. Gate parity in `useSyntheticScreen` (`screen-frame.tsx:81-103`): after the consent check, a signed-in role with an empty `displayName` on a non-auth screen goes to `/welcome?lang=&next=`. `accessPending` includes it.
5. Routes: add `{ pattern: "/welcome", composer: "auth", screen: "welcome" }` to `synthetic-route.application.ts:53-96`, **and** add `welcome` to the `isProductDemoPath` regex (`demo-runtime.application.ts:31`). Without the latter the loopback proxy 404s it (`proxy.ts:80-96`).
6. Loopback register (`product-auth.tsx:129,221-230`): sign-up succeeds for `new-student@example.invalid`, sets `displayName: null`, and continues through verify → consent → welcome → academic setup.
7. Loopback-only fixture `?fixture=profile-unavailable` on `/welcome` returns `UNAVAILABLE` from the synthetic save. Hosted strips fixtures (`synthetic-runtime.tsx:49-50`).
8. Optional: in hosted mode, intercept `/register` for known synthetic emails (PJ-30).
9. Update the walkthrough with a new §0 "New account" and add the CSV row. List the demo-only features in a "not real yet" table (PJ-07/20/22).

### 4.11 Tests to add

**Unit (Vitest, `tests/unit/`):**
- `profile-domain.test.ts`: Arabic, Latin and mixed names; trim and collapse; 80/81 characters; whitespace-only; control and bidi characters rejected; no-letter rejected; language mapping including `MIXED` → null.
- `profile-application.test.ts`: FORBIDDEN (not eligible), INVALID with field errors, SAVED, UNAVAILABLE on repository throw (mirror `academic-setup.test.ts` / `account-settings.test.ts`).
- Extend `auth-flow.test.ts` (`resolveAuthGate` ordering: consent before profile, suspended before both) and `auth-access.test.ts` (repository returns the display name).
- New `access-destination.test.ts`: every gate → path, always with `lang`, `next` validated, forged `next` rejected.
- Extend `auth-entry-routing.test.ts`: login/consent/callback → `/welcome` when incomplete, role home when complete.
- `locale-preference.test.ts`: precedence matrix.
- `synthetic-login.test.ts`: five pairs; the new pair has a null name; proto keys still rejected.
- `synthetic-route.test.ts` and `synthetic-demo-runtime.test.ts`: `/welcome` resolves and is a demo path.
- `account-supabase.test.ts`: `saveCurrentProfile` query shape.

**pgTAP (`supabase/tests/30_profile_onboarding.sql`):**
- The constraint exists. Legacy `''` is still valid.
- Rejected: leading/trailing whitespace, double space, control characters, bidi override, no letter, 81 characters.
- Accepted: an Arabic name and a mixed name.
- An own-row update succeeds as `authenticated`; a cross-user update affects 0 rows.
- `anon` cannot update.
- `preferred_language` accepts `AR_EG` and rejects `FR`.
- The reviewed column-grant set in `17_…matrix.sql:236-247` is unchanged.

**Demo e2e (new `tests/e2e/demo/onboarding.spec.ts`, using `support/session.ts`):**
- The new pair goes consent → `/welcome`. No fixture name appears anywhere and the avatar shows the fallback.
- Validation errors are focused and announced.
- Switching to العربية preserves the typed name and gives RTL.
- Dark appearance applies.
- Save → academic setup → shelf with the name and initial.
- Sign out and back in (loopback) → no welcome.
- Settings → Profile edit reflects in the nav.
- `?fixture=profile-unavailable` keeps the input and shows a retry.
- The four existing pairs never see `/welcome`.
- EN/AR at 360px and desktop, with axe checks.
- Extend `tests/e2e/hosted-synthetic-login.spec.ts` with the new pair (hosted reload → empty profile again).

**Database browser e2e (`tests/e2e-database/`, extend `product-shell.spec.ts` or add `onboarding.spec.ts`):**
- Real user with no name → login → `/welcome` → submit → role home.
- A second browser context logs in → no welcome, and the Arabic account language is applied without `?lang`.
- Settings name edit persists across contexts.
- A leader without a name is gated, and the leader pages enforce consent and suspension (PJ-04).
- Workspace deep link → `/welcome?next=` → back to the deep link.
- Update existing fixture seeding to include `display_name`.

### 4.12 Suggested sequencing for T27

T27 touches protected paths (auth gate, migration, proxy), so it needs a written plan, independent review and a rollback.

Consider splitting it: **T27a** profile gate, migration, `/welcome`, Settings profile and demo; **T27b** locale persistence (cookie, proxy, account language, email `lang`).

Order inside T27a:
1. `accessDestination` and the shared guard, with no behavior change except PJ-04/08/11 (tests first).
2. Migration and pgTAP.
3. Domain, application, adapter and action.
4. `/welcome` and Settings Profile.
5. Synthetic parity.
6. e2e.
7. Docs: walkthrough, `CONTEXT.md` "Account language" / "Profile completion", DESIGN IA line for onboarding step 4.

Material UI: the `/welcome` screen and the Settings Profile view need an `Approved commit:` recorded.

---

## 5. Role-specific issues (Batch Leader, Admin)

**Batch Leader**
- PJ-04: no account/consent/suspension gate on pages or upload. The DB predicate is assignment-only.
- PJ-16: a leader who is also a cohort student cannot reach Study or academic settings. Needs a founder decision.
- PJ-18: the empty state promises an invitation that does not exist. PJ-17: there is no invitation/acceptance flow at all; `accepted_at` is only ever set by SQL.
- PJ-15: an irrelevant Privacy (chat sharing) tab.
- They inherit PJ-01/03/08: no name and no language memory. The new profile step applies to them too.

**Admin**
- PJ-20: the eight resources are placeholders in real and fully populated in the demo.
- PJ-17: no UI to grant roles or memberships, create campaigns or invite leaders. It is blocked and planned (WP08-T04, WP11-T02), so every first-use path for students and leaders currently depends on founders running SQL. Record this as the operating procedure until then.
- PJ-11: a consent-required admin who deep-links to a resource is shown the sign-in form.
- PJ-15 and PJ-03 also apply: no name.
- The demo's two-founder confirmation identifies founders by fixture names. Real confirmation identity is a database principal, unaffected by `display_name`; do not start showing names as authority.

---

## 6. Not verified / limits

- PJ-21 (cross-device PKCE) and PJ-30 (hosted register with demo emails) are inferred from code and config. Both need a Preview check. I did not inspect hosted Supabase email templates or Auth settings.
- No runtime check was done: no servers, builds or tests, because the baseline `pnpm verify` was running.
- I did not inspect hosted data for existing non-empty `display_name` values (needed before `VALIDATE CONSTRAINT`).
- Security depth of PJ-04 (whether a suspended leader can upload) should be confirmed by the security audit with a pgTAP or DB e2e case.
