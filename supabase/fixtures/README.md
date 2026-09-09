# Database fixtures

Store only small synthetic fixture inputs used by database/security tests. Never place secrets, private source text, student data, ordinary chat content, or provider payloads here. Versioned seed execution is introduced by WP01-T04.

`wp02-synthetic.sql` is a transaction-scoped database-contract fixture loaded only by the guarded disposable reset command. Its reserved UUIDs, fake `.invalid` identities, synthetic text, mock vector, and zero-provider assumptions are safe for disposable CI only; it must never be used as Preview/Beta seed data.

`query-plans/student_catalog_availability.sql` adds 512 deterministic synthetic catalog/source rows inside a rolled-back transaction, refreshes statistics, and captures the required `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` only on the guarded disposable CI stack. It measures both the public function call and its installed SQL body (extracted from `pg_proc`, not a second copy of the predicates) under the same authenticated caller and empty search path. It is measurement input, not application seed data.

`query-plans/authorized_hybrid_retrieval.sql` adds 512 in-scope and 4,096 out-of-scope synthetic segments inside a rolled-back transaction, passes them through the real READY prerequisite guard, refreshes statistics, and measures both the service-only retrieval invocation and its installed `RETURN QUERY` body from `pg_proc`. The query-plan contract requires the reviewed scope, cosine HNSW, and full-text GIN indexes without a representative full-corpus sequential scan or disk spill.
