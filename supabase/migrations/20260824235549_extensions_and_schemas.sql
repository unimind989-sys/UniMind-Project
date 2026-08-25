create extension if not exists vector with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists unimind_private;

comment on schema unimind_private is
  'Server-only UniMind state that is not exposed through the Data API.';

revoke all on schema unimind_private from public;
revoke all on schema unimind_private from anon;
revoke all on schema unimind_private from authenticated;

create table unimind_private.synthetic_foundation_fixture (
  fixture_id text primary key,
  fixture_kind text not null,
  payload jsonb not null,
  leakage_canary text not null unique,
  created_at timestamptz not null default transaction_timestamp(),
  constraint synthetic_foundation_fixture_id_check
    check (fixture_id ~ '^synthetic_[a-z0-9_]+$'),
  constraint synthetic_foundation_fixture_kind_check
    check (fixture_kind in ('catalog', 'identity', 'source')),
  constraint synthetic_foundation_fixture_canary_check
    check (leakage_canary ~ '^UNIMIND_SYNTHETIC_CANARY_[A-Z0-9_]+$')
);

comment on table unimind_private.synthetic_foundation_fixture is
  'Synthetic-only WP01 reset and isolation proof; not an application domain authority.';

revoke all on table unimind_private.synthetic_foundation_fixture from public;
revoke all on table unimind_private.synthetic_foundation_fixture from anon;
revoke all on table unimind_private.synthetic_foundation_fixture from authenticated;
