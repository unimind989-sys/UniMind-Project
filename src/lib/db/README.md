# Database module

- **Interface:** Server-only PostgreSQL/Supabase clients and transactions, plus the explicit publishable-key-only browser Auth client and narrow synthetic-fixture administration functions.
- **Allowed dependencies:** Generated database types, validated public/server configuration, and the matching browser/server Supabase libraries.
- **Privileged boundary:** The raw service-role client stays private to `admin.ts`; callers can create or delete only marker-protected `@auth-fixture.unimind.invalid` users.
- **Prohibited dependencies:** Client imports of server database modules, browser service-role credentials, UI/business rules, and unversioned schema mutations.
- **Owner:** The current database task agent; RLS/grant changes require independent security review.
