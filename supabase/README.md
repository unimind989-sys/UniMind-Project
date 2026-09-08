# Supabase project contract

- **Interface:** Versioned configuration, migrations, synthetic seed data, and database tests/types for the disposable CI Supabase stack plus forward-only Preview/Beta promotion.
- **Allowed dependencies:** SQL migrations, explicit grants/RLS, synthetic fixtures, and generated types.
- **Prohibited dependencies:** Local infrastructure services, dashboard-only changes, committed secrets, real private data, broad grants, preview/beta resets, and unreviewed destructive operations.
- **Owner:** The current database task agent; RLS, grants, and deletion require independent review.

WP02-T08 keeps D-18 fail-closed: there are no UniMind Storage buckets or client object policies, so signed-upload finalization and upsert are denied. Privileged synthetic Auth administration reaches PostgreSQL only through `public.record_privileged_auth_action`, which is security-invoker, granted only to `service_role`, validates an active administrator actor, and appends immutable audit events.

Use `pnpm db:<action> --environment development` or `--environment ci` to load the matching ignored profile under `.local/supabase/`. The guard rejects every other environment, and destructive reset additionally requires the exact target-specific confirmation. `pnpm db:metadata --environment <name>` reports only sanitized version, fixture, isolation, and hashed-target facts.
