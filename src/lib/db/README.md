# Database module

- **Interface:** Caller-scoped server data services and an explicit publishable-key-only browser Auth client, plus narrow synthetic-fixture administration functions.
- **Allowed dependencies:** Generated database types, validated public/server configuration, and the matching browser/server Supabase libraries.
- **Student boundary:** `student-access.server.ts` accepts no caller ID and resolves profile/catalog data through the cookie-backed authenticated client, so PostgreSQL sees the user's JWT and applies RLS.
- **Privileged boundary:** The raw service-role client stays private to `admin.server.ts`; callers can create or delete only marker-protected `@auth-fixture.unimind.invalid` users and must supply an active administrator actor, reason, and correlation ID. Every attempt appends STARTED plus terminal audit evidence through the exact service-only RPC.
- **Auth cookie rule:** Writable Auth operations must supply `applyResponseHeaders` so the headers emitted by `@supabase/ssr` travel with every cookie update. Server Components rely on `src/proxy.ts` for refresh writes.
- **Prohibited dependencies:** Client imports of server database modules, browser service-role credentials, UI/business rules, and unversioned schema mutations.
- **Owner:** The current database task agent; RLS/grant changes require independent security review.
