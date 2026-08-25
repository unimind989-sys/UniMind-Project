# Hosted Supabase project contract

- **Interface:** Versioned configuration, migrations, synthetic seed data, and database tests/types for isolated hosted development and CI targets.
- **Allowed dependencies:** SQL migrations, explicit grants/RLS, synthetic fixtures, and generated types.
- **Prohibited dependencies:** Local infrastructure services, dashboard-only changes, committed secrets, real private data, broad grants, preview/beta resets, and unreviewed destructive operations.
- **Owner:** The current database task agent; RLS, grants, and deletion require independent review.

Use `pnpm db:<action> --environment development` or `--environment ci` to load the matching ignored profile under `.local/supabase/`. The guard rejects every other environment, and destructive reset additionally requires the exact target-specific confirmation. `pnpm db:metadata --environment <name>` reports only sanitized version, fixture, isolation, and hashed-target facts.
