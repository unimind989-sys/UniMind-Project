begin;
select plan(5);

select is(
  (
    select count(*)
    from pg_catalog.pg_class as relations
    join pg_catalog.pg_namespace as namespaces on namespaces.oid = relations.relnamespace
    where namespaces.nspname = 'public' and relations.relkind = 'r'
      and relations.relrowsecurity
  ),
  (
    select count(*)
    from pg_catalog.pg_class as relations
    join pg_catalog.pg_namespace as namespaces on namespaces.oid = relations.relnamespace
    where namespaces.nspname = 'public' and relations.relkind = 'r'
  ),
  'every exposed public table has RLS enabled'
);

select is(
  (select count(*) from information_schema.table_privileges where grantee = 'anon' and table_schema in ('public', 'unimind_private')),
  0::bigint,
  'anon has no table grants'
);
select ok(
  not has_schema_privilege('authenticated', 'unimind_private', 'USAGE'),
  'authenticated cannot reach private worker state'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_constraint as constraints
    join pg_catalog.pg_class as relations on relations.oid = constraints.conrelid
    join pg_catalog.pg_namespace as namespaces on namespaces.oid = relations.relnamespace
    where constraints.contype = 'f'
      and namespaces.nspname in ('public', 'unimind_private')
      and not exists (
        select 1 from pg_catalog.pg_index as indexes
        where indexes.indrelid = constraints.conrelid
          and indexes.indisvalid
          and (indexes.indkey::smallint[])[0:cardinality(constraints.conkey) - 1] = constraints.conkey
      )
  ),
  0::bigint,
  'every foreign key has a matching leading-column index'
);

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is(
  (select count(*) from public.profiles),
  1::bigint,
  'authenticated profile reads are isolated to the caller'
);
reset role;

select * from finish();
rollback;
