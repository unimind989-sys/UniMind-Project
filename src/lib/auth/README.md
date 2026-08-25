# Auth module

- **Interface:** Server-only verified identity helpers and the request-level Supabase session refresh seam.
- **Verification rule:** Authorization starts from `auth.getClaims()` and the validated token subject; `getSession()`, `user_metadata`, and client-supplied role/cohort values are never authorization proof.
- **Request rule:** `src/proxy.ts` refreshes Auth cookies and forwards cache headers. It does not replace authorization checks inside server mutations.
- **Mutation rule:** Server mutations call `requireVerifiedIdentity()` and use the request-scoped server client so database RLS remains the final authorization boundary.
- **Prohibited dependencies:** Client-side credentials, provider SDKs in domain files, privileged keys, and business authorization stored only in UI state.
- **Owner:** The current auth task agent; security review is required for authorization behavior.
