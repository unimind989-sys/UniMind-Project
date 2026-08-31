begin;
select plan(4);

select ok(exists (select 1 from pg_extension where extname = 'vector'), 'vector is installed');
select ok(exists (select 1 from pg_extension where extname = 'pgcrypto'), 'pgcrypto is installed');
select has_schema('unimind_private', 'the private schema exists');
select ok(
  not has_schema_privilege('authenticated', 'unimind_private', 'USAGE'),
  'authenticated cannot use the private schema'
);

select * from finish();
rollback;
