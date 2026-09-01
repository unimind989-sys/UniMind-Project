# Database fixtures

Store only small synthetic fixture inputs used by database/security tests. Never place secrets, private source text, student data, ordinary chat content, or provider payloads here. Versioned seed execution is introduced by WP01-T04.

`wp02-synthetic.sql` is a transaction-scoped database-contract fixture loaded only by the guarded disposable reset command. Its reserved UUIDs, fake `.invalid` identities, synthetic text, mock vector, and zero-provider assumptions are safe for disposable CI only; it must never be used as Preview/Beta seed data.

`query-plans/student_catalog_availability.sql` adds 512 deterministic synthetic catalog/source rows inside a rolled-back transaction, refreshes statistics, and captures the required `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` only on the guarded disposable CI stack. It is measurement input, not application seed data.
