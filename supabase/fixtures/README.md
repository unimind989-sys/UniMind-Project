# Database fixtures

Store only small synthetic fixture inputs used by database/security tests. Never place secrets, private source text, student data, ordinary chat content, or provider payloads here. Versioned seed execution is introduced by WP01-T04.

`wp02-synthetic.sql` is a transaction-scoped database-contract fixture. Every test that includes it must start a transaction and roll it back. Its reserved UUIDs, fake `.invalid` identities, synthetic text, mock vector, and zero-provider assumptions are safe for disposable CI only; it must never be used as Preview/Beta seed data.
