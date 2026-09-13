---
version: 1
slug: "src-app-login-page-tsx"
primary_target: "src/app/login/page.tsx"
approval:
  selected_option: "access-shelf"
  selected_by: "Ahmed"
  decision_key: "e0eee15c"
  direction_seed: "33cbfda3"
  build_path: "comp"
  approved_comp: ".impeccable/mocks/decision/wp03-auth-access-shelf.png"
related_targets:
  [
    "src/app/register/page.tsx",
    "src/app/verify-email/page.tsx",
    "src/app/forgot-password/page.tsx",
    "src/app/reset-password/page.tsx",
    "src/app/consent/page.tsx",
  ]
---

## Scope and mode

WP03-T02 authentication, recovery, verification, logout, and current-consent routes. **Operate** mode.

## Audience and job

An unauthenticated or partially verified student needs to reach an authorized learning shelf without guessing what remains. The primary action is the one safe next account step; secondary actions are recovery, resend, account creation, locale switching, and logout.

## Content and constraints

Use visible labels, generic account-discovery-safe errors, explicit pending/success states, current Terms/Privacy/Educational-use versions, and a truthful synthetic preview marker where applicable. Keep one active language, logical RTL layout, password-manager semantics, 44px touch targets, duplicate-submit protection, and no private membership data in browser payloads. Real accounts, private data, provider diagnostics, external UI services, and invented policy claims are forbidden.

Catalog search is excluded from authentication and consent. It begins only after the learner passes the access gates and reaches the authorized learning shelf. Ahmed confirmed this correction after the full manual checklist passed on 2026-09-13.

## Chosen composition

**Access Shelf**, selected by Ahmed from the WP03-T02 surface round (`33cbfda3`). Four aligned stages—Account, Verify email, Review commitments, Enter shelf—stay visible while the current stage expands in place, reusing the approved Focused Rail interaction without turning account access into a generic wizard.

The memorable moment is a completed step contracting into a clear status tile as the next required step expands. Mobile uses a horizontal snap shelf with the active stage centered and a non-motion fallback.

## Unresolved decisions

Final legal policy bodies and public policy URLs are not part of WP03-T02; show only authoritative active version labels and concise approved educational-boundary copy. Live production Auth/email configuration and release remain separate environment gates.

## Finish review

`disposition: ship`

The original finish reviewer scored all eight material fixes resolved. After Ahmed completed the manual checklist and requested that catalog search be removed from the access flow, the corrected desktop, Arabic mobile, and verification-mobile captures were sent to a fresh full reviewer. That reviewer classified the search-free utility bar as an acceptable user-authorized adaptation, found no material fixes, and returned `disposition: ship`.
