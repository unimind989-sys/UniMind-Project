begin;
select plan(19);

set local unimind.actor_id = '10000000-0000-0000-0000-000000000001';
set local unimind.audit_reason = 'WP03-T03 synthetic catalog journey';
set local unimind.correlation_id = '90000000-0000-0000-0000-000000000010';

select is(
  (
    select count(*)
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_namespace as namespaces
      on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'public'
      and procedures.proname = 'available_catalog_entries'
      and procedures.provolatile = 's'
      and not procedures.prosecdef
      and array_to_string(procedures.proconfig, ',') like '%search_path=""%'
  ),
  1::bigint,
  'catalog entries use one stable security-invoker function with a safe search path'
);
select is(
  (
    select count(*)
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_namespace as namespaces
      on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'public'
      and procedures.proname = 'current_student_catalog_state'
      and procedures.provolatile = 's'
      and not procedures.prosecdef
      and array_to_string(procedures.proconfig, ',') like '%search_path=""%'
  ),
  1::bigint,
  'browser-facing catalog state uses one stable security-invoker function with a safe search path'
);
select ok(
  has_function_privilege('authenticated', 'public.available_catalog_entries()', 'EXECUTE'),
  'authenticated callers can load their authorized catalog entries'
);
select ok(
  not has_function_privilege('anon', 'public.available_catalog_entries()', 'EXECUTE'),
  'anonymous callers cannot load catalog entries'
);
select ok(
  has_function_privilege('authenticated', 'public.current_student_catalog_state()', 'EXECUTE'),
  'authenticated callers can load the non-identifying catalog state'
);
select ok(
  not has_function_privilege('anon', 'public.current_student_catalog_state()', 'EXECUTE'),
  'anonymous callers cannot load catalog state'
);

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is((select count(*) from public.available_catalog_entries()), 1::bigint, 'active member sees one authorized full catalog path');
select is((select current_student_catalog_state from public.current_student_catalog_state()), 'READY'::text, 'active member receives READY');
select is((select source_count from public.available_catalog_entries()), 1, 'source count includes only authorized active READY sources');
select is((select education_stage_code from public.available_catalog_entries()), 'UNIVERSITY'::text, 'authorized entry contains its configured education stage');
select is((select program_progression_mode from public.available_catalog_entries()), 'TERM_BASED'::text, 'authorized entry exposes the configured program progression mode');
select is((select curriculum_unit_code from public.available_catalog_entries()), 'UNIT_A'::text, 'authorized entry contains only its available curriculum unit');

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
select is((select count(*) from public.available_catalog_entries()), 0::bigint, 'inactive member receives no catalog identifiers');
select is((select current_student_catalog_state from public.current_student_catalog_state()), 'NO_MEMBERSHIP'::text, 'inactive member receives only the safe no-membership state');
reset role;

-- Governed setup mutations below run as the database owner. Clear the synthetic
-- caller claims first so the audit trigger uses the explicit founder actor.
select set_config('request.jwt.claim.role', '', true);
select set_config('request.jwt.claim.sub', '', true);

savepoint locked_catalog;
update public.cohort_releases
set release_status = 'LOCKED', reason = 'WP03-T03 synthetic catalog-state check'
where cohort_id = '20000000-0000-0000-0000-000000000006';
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is((select count(*) from public.available_catalog_entries()), 0::bigint, 'locked cohort removes every catalog identifier');
select is((select current_student_catalog_state from public.current_student_catalog_state()), 'COHORT_LOCKED'::text, 'locked cohort returns only its safe state code');
reset role;
rollback to savepoint locked_catalog;

savepoint no_catalog;
insert into public.cohorts (
  id, term_id, code, name, curriculum_edition, starts_at, ends_at, status
)
values (
  '20000000-0000-0000-0000-000000000025',
  '20000000-0000-0000-0000-000000000005',
  'EMPTY_COHORT_2026', 'Synthetic empty cohort', 'synthetic-empty-2026',
  transaction_timestamp() - interval '1 day',
  transaction_timestamp() + interval '30 days', 'ACTIVE'
);
update public.cohort_memberships
set
  cohort_id = '20000000-0000-0000-0000-000000000025',
  status = 'ACTIVE',
  starts_at = transaction_timestamp() - interval '1 day',
  ends_at = transaction_timestamp() + interval '30 days'
where id = '21000000-0000-0000-0000-000000000002';
insert into public.cohort_releases (
  id, cohort_id, release_status, changed_by, reason
)
values (
  '22000000-0000-0000-0000-000000000025',
  '20000000-0000-0000-0000-000000000025',
  'UNLOCKED', '10000000-0000-0000-0000-000000000001',
  'WP03-T03 synthetic empty-catalog check'
);
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
select is((select current_student_catalog_state from public.current_student_catalog_state()), 'NO_CATALOG'::text, 'an unlocked active membership with no units returns only the safe no-catalog state');
reset role;
rollback to savepoint no_catalog;

savepoint unpublished_catalog;
update public.curriculum_units
set publication_status = 'WITHDRAWN'
where id = '20000000-0000-0000-0000-000000000007';
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is((select current_student_catalog_state from public.current_student_catalog_state()), 'UNIT_UNPUBLISHED'::text, 'a catalog with no published units returns only the safe unpublished state');
reset role;
rollback to savepoint unpublished_catalog;

savepoint no_ready_source;
update public.source_versions
set processing_status = 'NEEDS_REVIEW'
where id = '41000000-0000-0000-0000-000000000001';
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is((select current_student_catalog_state from public.current_student_catalog_state()), 'READY_SOURCE_MISSING'::text, 'missing READY source returns only its safe state code');
reset role;
rollback to savepoint no_ready_source;

select * from finish();
rollback;
