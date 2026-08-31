# Migrations

Create migration filenames only through the pinned Supabase CLI. Keep changes forward-only, explicit, resettable, and independently reviewed when they affect RLS, grants, rights, deletion, usage, or release state. WP01-T04 initializes the first migration.

Before review, run `pnpm check:sql` and complete the [database migration checklist](../../docs/runbooks/database-migration-checklist.md). The governing boundaries and trade-offs are recorded in [ADR-0002](../../docs/adr/0002-database-boundaries.md).
