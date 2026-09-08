begin;
select plan(19);

select is(
  (
    select count(*)
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_namespace as namespaces
      on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'public'
      and procedures.proname = 'record_privileged_auth_action'
      and procedures.oid =
        'public.record_privileged_auth_action(uuid,text,text,uuid,text,uuid,text)'::regprocedure
      and procedures.provolatile = 'v'
      and not procedures.prosecdef
      and array_to_string(procedures.proconfig, ',') like '%search_path=""%'
  ),
  1::bigint,
  'privileged Auth audit is one volatile security-invoker function with a safe search path'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.record_privileged_auth_action(uuid,text,text,uuid,text,uuid,text)',
    'EXECUTE'
  ),
  'anonymous clients cannot write privileged Auth audit events'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.record_privileged_auth_action(uuid,text,text,uuid,text,uuid,text)',
    'EXECUTE'
  ),
  'authenticated clients cannot write privileged Auth audit events'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.record_privileged_auth_action(uuid,text,text,uuid,text,uuid,text)',
    'EXECUTE'
  ),
  'the service role has only the narrow privileged Auth audit capability'
);

select isnt(
  public.record_privileged_auth_action(
    '10000000-0000-0000-0000-000000000001',
    'CREATE_SYNTHETIC_USER',
    'STARTED',
    '90000000-0000-0000-0000-000000000008',
    'WP02-T08 synthetic privileged action',
    null,
    null
  ),
  null::uuid,
  'an active administrator can append a STARTED privileged event through the service seam'
);
select is(
  (
    select after_json ->> 'outcome'
    from unimind_private.audit_events
    where correlation_id = '90000000-0000-0000-0000-000000000008'
    order by created_at, id
    limit 1
  ),
  'STARTED'::text,
  'the privileged STARTED event is durable and minimally structured'
);
select isnt(
  public.record_privileged_auth_action(
    '10000000-0000-0000-0000-000000000001',
    'CREATE_SYNTHETIC_USER',
    'SUCCEEDED',
    '90000000-0000-0000-0000-000000000008',
    'WP02-T08 synthetic privileged action',
    '90000000-0000-0000-0000-000000000088',
    null
  ),
  null::uuid,
  'the privileged action appends a terminal success event'
);
select is(
  (
    select count(*)
    from unimind_private.audit_events
    where correlation_id = '90000000-0000-0000-0000-000000000008'
      and entity_type = 'privileged.auth'
  ),
  2::bigint,
  'the audit trail retains STARTED and terminal events'
);
select throws_ok(
  $$select public.record_privileged_auth_action(
    '10000000-0000-0000-0000-000000000002',
    'DELETE_SYNTHETIC_USER',
    'STARTED',
    '90000000-0000-0000-0000-000000000009',
    'Forged non-admin privileged action',
    '10000000-0000-0000-0000-000000000002',
    null
  )$$,
  '42501',
  'privileged Auth audit actor is not an active administrator',
  'the service seam rejects a non-admin audit actor'
);

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
select throws_ok(
  $$select public.record_privileged_auth_action(
    '10000000-0000-0000-0000-000000000001',
    'DELETE_SYNTHETIC_USER',
    'STARTED',
    '90000000-0000-0000-0000-000000000010',
    'Browser admin must not reach the service-only audit seam',
    '10000000-0000-0000-0000-000000000002',
    null
  )$$,
  '42501',
  null,
  'an authenticated browser admin cannot call the service-only function'
);
reset role;

select is(
  (
    select count(*)
    from pg_catalog.pg_class as relations
    join pg_catalog.pg_namespace as namespaces
      on namespaces.oid = relations.relnamespace
    where namespaces.nspname = 'public'
      and relations.relkind in ('v', 'm')
      and (
        relations.relkind = 'm'
        or not coalesce(
          relations.reloptions @> array['security_invoker=true']::text[],
          false
        )
      )
  ),
  0::bigint,
  'every view in the exposed public schema is security-invoker safe'
);
select ok(
  not has_schema_privilege('authenticated', 'unimind_private', 'USAGE'),
  'authenticated clients cannot reach views or objects in the private schema'
);
select is(
  (
    select count(*)
    from storage.buckets
    where id like 'unimind-%'
      or id in ('raw', 'processed', 'temporary')
  ),
  0::bigint,
  'no real UniMind Storage bucket is enabled while D-18 remains open'
);
select is(
  (
    select count(*)
    from pg_catalog.pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        'anon' = any(roles)
        or 'authenticated' = any(roles)
      )
  ),
  0::bigint,
  'Storage object policies are independently deny-by-default for client roles'
);

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner_id)
    values (
      'unimind-raw',
      'synthetic/wp02-t08.pdf',
      '10000000-0000-0000-0000-000000000002'
    )$$,
  '42501',
  null,
  'authenticated direct upload finalization is denied by Storage RLS'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner_id)
    values (
      'unimind-raw',
      'synthetic/wp02-t08-upsert.pdf',
      '10000000-0000-0000-0000-000000000002'
    )
    on conflict (bucket_id, name) do update
    set owner_id = excluded.owner_id$$,
  '42501',
  null,
  'Storage upsert cannot bypass its absent INSERT SELECT and UPDATE policies'
);
select is(
  (select count(*) from public.profiles),
  1::bigint,
  'the authenticated student sees only the caller profile'
);
select is(
  (
    select count(*)
    from public.profiles
    where user_id = '10000000-0000-0000-0000-000000000003'
  ),
  0::bigint,
  'the authenticated student cannot read another user profile'
);
select is(
  (select count(*) from public.available_curriculum_units(false)),
  1::bigint,
  'the authenticated student client reaches allowed catalog data through RLS'
);
reset role;

select * from finish();
rollback;
