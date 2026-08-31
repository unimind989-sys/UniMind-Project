# Migrations

Create migration filenames only through the pinned Supabase CLI. Keep changes forward-only, explicit, resettable, and independently reviewed when they affect RLS, grants, rights, deletion, usage, or release state. WP01-T04 initializes the first migration.

Before review, run `pnpm check:sql` and complete the [database migration checklist](../../docs/runbooks/database-migration-checklist.md). The governing boundaries and trade-offs are recorded in [ADR-0002](../../docs/adr/0002-database-boundaries.md).

## WP02 dependency order

The 15 WP02-T02 slices are intentionally separate: extensions/private schema; common types and transition checks; identity/terms; catalog; access/release; collection; source/rights/raw lifecycle; processing/jobs; processed knowledge and vectors; tutor/evidence; Studio/quizzes; usage/budgets; audit/incidents; availability/retrieval; then RLS/grants/indexes. Do not collapse or reorder them because each later slice relies on constraints established by the previous one.

The original `extensions_and_schemas` migration was applied during WP01 and is immutable history. WP02 adds only forward migrations after it. Embeddings use the generic `extensions.vector` type and a write-time dimension check against `embedding_configs`; D-04 still blocks a production provider/model dimension and therefore also blocks a production HNSW operator-class/index choice.

## Forward repair plan

When a shared migration is wrong:

1. Disable the affected capability or keep it deny-by-default without deleting durable rows.
2. Reproduce the defect against a populated synthetic upgrade and record affected objects/rows.
3. Generate a new migration with the pinned CLI. Add or backfill the replacement before removing an obsolete object, and preserve append-only evidence.
4. Run the populated upgrade, two clean resets, database contract tests, type generation, advisors, and the full repository gate.
5. Promote only the exact reviewed commit. Never edit applied SQL, reset Preview/Beta, or assume a reverse migration is safe.
