# Hosted Supabase project contract

- **Interface:** Versioned configuration, migrations, synthetic seed data, and database tests/types for isolated hosted development and CI targets.
- **Allowed dependencies:** SQL migrations, explicit grants/RLS, synthetic fixtures, and generated types.
- **Prohibited dependencies:** Local infrastructure services, dashboard-only changes, committed secrets, real private data, broad grants, preview/beta resets, and unreviewed destructive operations.
- **Owner:** The current database task agent; RLS, grants, and deletion require independent review.
