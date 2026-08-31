# Database migration checklist

Use this checklist for every UniMind migration. Copy the applicable results into the task record and evidence bundle; do not mark an item complete from code inspection alone.

## Before writing SQL

- [ ] Name the owning task, dependency, expected database objects, and accompanying test.
- [ ] Confirm that every product, provider, rights, retention, budget, and release choice consumed by the migration is approved or represented by an existing generic/mock contract.
- [ ] Generate the migration filename with the pinned Supabase CLI. Do not rename or rewrite an already applied migration.
- [ ] Name the rollback or disable action. For shared data, plan a forward repair migration rather than destructive rollback.
- [ ] Use synthetic fixtures only. Stop before a protected rights, RLS, raw-deletion, budget, release/unlock, or beta gate lacks the required Ahmed and Ziad confirmations.

## Schema and data rules

- [ ] Place client-reachable objects in `public` and server/worker-only objects in a non-exposed internal schema such as `unimind_private`.
- [ ] Use UUID primary keys for exposed/domain entities. Use generated identity only for measured internal append-only cases; never use `serial`.
- [ ] Use `timestamptz` and UTC for instants, including `created_at timestamptz not null default now()` or its transaction-equivalent default.
- [ ] Add `not null`, foreign keys, unique constraints, and named state/transition checks at the database layer.
- [ ] Record actor, reason, correlation ID, and transition time for governed state changes where applicable.
- [ ] Preserve durable domain records through deactivation or controlled status changes. Preserve audit, attempt, provenance, deletion, and usage evidence as append-only rows.
- [ ] Use PostgreSQL enums only for genuinely stable vocabularies; prefer named checks when values are expected to evolve.
- [ ] Keep availability derived from its authoritative predicates; do not add an editable availability Boolean.

## Access and functions

- [ ] Revoke broad schema/object defaults first, then grant only the required tables, columns, sequences, and functions to each intended role.
- [ ] Enable RLS on every exposed table and write explicit policies for the intended roles. Cover both `USING` and `WITH CHECK` where updates are allowed.
- [ ] Test at least one allowed caller and one forbidden caller for every authorization path. RLS approval is a protected two-founder gate.
- [ ] Prefer `security invoker`. Put an unavoidable `security definer` function in an internal schema, set a safe `search_path`, verify caller authority, revoke `PUBLIC` execution, and grant only the intended role.
- [ ] Treat retrieved/source text as data. No database value may select policy, execute SQL, or override application/system instructions.

## Indexes and migration safety

- [ ] Index each foreign key used by joins or delete/update checks, including the leading columns of composite foreign keys.
- [ ] Tie every authorization/filter index to a named query and inspect the disposable database query plan. Do not add speculative indexes.
- [ ] Make functions, triggers, policies, and object names schema-qualified and safe to reapply through a clean reset.
- [ ] Avoid destructive changes to shared data. For a necessary removal, prove the replacement/backfill first and record the explicit forward recovery plan.
- [ ] Confirm the migration does not log or commit secrets, private source text, student data, signed URLs, or provider payloads.

## Verification and handoff

- [ ] Run `pnpm check:sql` and the migration's focused SQL/integration test.
- [ ] Reset a clean disposable CI Supabase stack and upgrade a populated synthetic fixture target without losing retained rows or evidence.
- [ ] Regenerate database TypeScript types and confirm `pnpm db:types:check` is clean.
- [ ] Run the pinned database advisors and record every unresolved warning with its owner.
- [ ] Run the applicable integration/security suites and `pnpm verify`; record exact commands and exit codes.
- [ ] Inspect `git diff --check`, `git diff --stat`, the full diff, and the repository secret scan.
- [ ] Store sanitized evidence under the owning work package and obtain the required human checkpoint before marking the task complete.
