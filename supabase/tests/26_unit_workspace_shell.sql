begin;
select plan(9);

set local unimind.actor_id = '10000000-0000-0000-0000-000000000001';
set local unimind.audit_reason = 'WP03-T04 synthetic unit workspace shell';
set local unimind.correlation_id = '90000000-0000-0000-0000-000000000011';

select is(
  (
    select count(*)
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_namespace as namespaces
      on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'public'
      and procedures.proname = 'current_student_workspace'
      and procedures.provolatile = 's'
      and not procedures.prosecdef
      and array_to_string(procedures.proconfig, ',') like '%search_path=""%'
  ),
  1::bigint,
  'workspace scope uses one stable security-invoker function with a safe search path'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.current_student_workspace(uuid, uuid)',
    'EXECUTE'
  ),
  'authenticated callers can resolve their authorized workspace'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.current_student_workspace(uuid, uuid)',
    'EXECUTE'
  ),
  'anonymous callers cannot resolve workspace scope'
);

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is(
  (
    select count(*)
    from public.current_student_workspace(
      '20000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000007'
    )
  ),
  1::bigint,
  'active member resolves the exact authorized cohort and unit'
);
select is(
  (
    select source_count
    from public.current_student_workspace(
      '20000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000007'
    )
  ),
  1,
  'workspace source status includes only the authorized active READY source'
);
select ok(
  (
    select material_updated_at is not null
    from public.current_student_workspace(
      '20000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000007'
    )
  ),
  'workspace material update is derived from the authorized READY source version'
);
select is(
  (
    select count(*)
    from public.current_student_workspace(
      '20000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000099'
    )
  ),
  0::bigint,
  'a forged unit identifier returns no workspace metadata'
);

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
select is(
  (
    select count(*)
    from public.current_student_workspace(
      '20000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000007'
    )
  ),
  0::bigint,
  'inactive member receives no workspace metadata'
);
reset role;

select set_config('request.jwt.claim.role', '', true);
select set_config('request.jwt.claim.sub', '', true);
savepoint locked_workspace;
update public.cohort_releases
set release_status = 'LOCKED', reason = 'WP03-T04 synthetic workspace lock check'
where cohort_id = '20000000-0000-0000-0000-000000000006';
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is(
  (
    select count(*)
    from public.current_student_workspace(
      '20000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000007'
    )
  ),
  0::bigint,
  'locking the release removes workspace access on the next operation'
);
reset role;
rollback to savepoint locked_workspace;

select * from finish();
rollback;
