begin;
select plan(26);

set local unimind.actor_id = '10000000-0000-0000-0000-000000000001';
set local unimind.audit_reason = 'WP02-T05 synthetic availability proof';
set local unimind.correlation_id = '90000000-0000-0000-0000-000000000005';

select is(
  (
    select count(*)
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_namespace as namespaces
      on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'public'
      and procedures.proname = 'available_curriculum_units'
      and pg_get_function_identity_arguments(procedures.oid) = 'admin_preview boolean'
      and procedures.provolatile = 's'
      and not procedures.prosecdef
      and array_to_string(procedures.proconfig, ',') like '%search_path=""%'
  ),
  1::bigint,
  'catalog availability has one stable caller-scoped security-invoker function'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.available_curriculum_units(boolean)',
    'EXECUTE'
  ),
  'authenticated callers can execute the availability function'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.available_curriculum_units(boolean)',
    'EXECUTE'
  ),
  'anonymous callers cannot execute the availability function'
);
select is(
  (
    select count(*)
    from pg_catalog.pg_attribute as attributes
    join pg_catalog.pg_class as relations on relations.oid = attributes.attrelid
    join pg_catalog.pg_namespace as namespaces on namespaces.oid = relations.relnamespace
    where namespaces.nspname in ('public', 'unimind_private')
      and relations.relkind in ('r', 'p')
      and not attributes.attisdropped
      and attributes.attname in ('available', 'is_available')
  ),
  0::bigint,
  'availability is not stored as an editable boolean column'
);

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is(
  (select count(*) from public.available_curriculum_units()),
  1::bigint,
  'authenticated active member sees the one fully available unit'
);
select is(
  (
    select availability_state
    from public.available_curriculum_units()
    where id = '20000000-0000-0000-0000-000000000007'
  ),
  'AVAILABLE'::text,
  'student catalog returns the derived AVAILABLE state'
);
select is(
  (
    select reason_codes
    from public.available_curriculum_units()
    where id = '20000000-0000-0000-0000-000000000007'
  ),
  '{}'::text[],
  'student output never includes diagnostic details'
);

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
select is(
  (select count(*) from public.available_curriculum_units()),
  0::bigint,
  'inactive membership fails availability without exposing catalog rows'
);
select is(
  (select count(*) from public.available_curriculum_units(true)),
  0::bigint,
  'a student cannot forge the admin preview flag'
);

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
select is(
  (
    select reason_codes
    from public.available_curriculum_units(false)
    where id = '20000000-0000-0000-0000-000000000007'
  ),
  array['membership_missing']::text[],
  'admin diagnostics isolate the active-membership predicate'
);
select is(
  (
    select availability_state
    from public.available_curriculum_units(true)
    where id = '20000000-0000-0000-0000-000000000007'
  ),
  'AVAILABLE'::text,
  'authorized admin preview bypasses only the membership predicate'
);
select is(
  (
    select reason_codes
    from public.available_curriculum_units(true)
    where id = '20000000-0000-0000-0000-000000000008'
  ),
  array['unit_unpublished']::text[],
  'admin diagnostics expose only the safe unpublished reason code'
);
select is(
  (
    select count(*)
    from public.available_curriculum_units(false) as availability
    cross join lateral unnest(availability.reason_codes) as reasons(reason_code)
    where reasons.reason_code not in (
      'membership_missing',
      'cohort_locked',
      'unit_unpublished',
      'ready_source_missing',
      'rights_invalid',
      'curriculum_edition_mismatch'
    )
  ),
  0::bigint,
  'admin diagnostics are restricted to the reviewed safe reason-code allowlist'
);
reset role;

savepoint cohort_locked_failure;
update public.cohort_releases
set release_status = 'LOCKED', reason = 'Synthetic T05 isolated cohort lock'
where cohort_id = '20000000-0000-0000-0000-000000000006';
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
select is(
  (select reason_codes from public.available_curriculum_units(true) where id = '20000000-0000-0000-0000-000000000007'),
  array['cohort_locked']::text[],
  'cohort unlocked predicate fails independently'
);
reset role;
rollback to savepoint cohort_locked_failure;

savepoint unit_unpublished_failure;
update public.curriculum_units
set publication_status = 'WITHDRAWN'
where id = '20000000-0000-0000-0000-000000000007';
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
select is(
  (select reason_codes from public.available_curriculum_units(true) where id = '20000000-0000-0000-0000-000000000007'),
  array['unit_unpublished']::text[],
  'unit published predicate fails independently'
);
reset role;
rollback to savepoint unit_unpublished_failure;

savepoint ready_source_failure;
update public.source_versions
set processing_status = 'NEEDS_REVIEW'
where id = '41000000-0000-0000-0000-000000000001';
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
select is(
  (select reason_codes from public.available_curriculum_units(true) where id = '20000000-0000-0000-0000-000000000007'),
  array['ready_source_missing']::text[],
  'active READY source predicate fails independently'
);
reset role;
rollback to savepoint ready_source_failure;

savepoint source_rights_failure;
update public.source_versions
set rights_valid_until = transaction_timestamp() - interval '1 second'
where id = '41000000-0000-0000-0000-000000000001';
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
select is(
  (select reason_codes from public.available_curriculum_units(true) where id = '20000000-0000-0000-0000-000000000007'),
  array['rights_invalid']::text[],
  'valid source-rights predicate fails independently'
);
reset role;
rollback to savepoint source_rights_failure;

savepoint curriculum_edition_failure;
update public.cohorts
set curriculum_edition = 'synthetic-edition-2027'
where id = '20000000-0000-0000-0000-000000000006';
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
select is(
  (select reason_codes from public.available_curriculum_units(true) where id = '20000000-0000-0000-0000-000000000007'),
  array['curriculum_edition_mismatch']::text[],
  'matching curriculum-edition predicate fails independently'
);
reset role;
rollback to savepoint curriculum_edition_failure;

savepoint combined_failures;
update public.cohort_releases
set release_status = 'LOCKED', reason = 'Synthetic T05 combined failure'
where cohort_id = '20000000-0000-0000-0000-000000000006';
update public.curriculum_units
set publication_status = 'WITHDRAWN'
where id = '20000000-0000-0000-0000-000000000007';
update public.source_versions
set processing_status = 'NEEDS_REVIEW'
where id = '41000000-0000-0000-0000-000000000001';
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
select is(
  (select reason_codes from public.available_curriculum_units(false) where id = '20000000-0000-0000-0000-000000000007'),
  array['membership_missing', 'cohort_locked', 'unit_unpublished', 'ready_source_missing']::text[],
  'admin diagnostics report multiple simultaneous failures without private details'
);
reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is(
  (select count(*) from public.available_curriculum_units(true)),
  0::bigint,
  'students receive only the generic unavailable result for combined failures'
);
reset role;
rollback to savepoint combined_failures;

savepoint membership_revocation;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is((select count(*) from public.available_curriculum_units()), 1::bigint, 'membership revocation precondition is available');
reset role;
update public.cohort_memberships
set status = 'REVOKED'
where id = '21000000-0000-0000-0000-000000000001';
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is((select count(*) from public.available_curriculum_units()), 0::bigint, 'membership revocation removes availability immediately');
reset role;
rollback to savepoint membership_revocation;

savepoint source_state_change;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is((select count(*) from public.available_curriculum_units()), 1::bigint, 'source-state change precondition is available');
reset role;
update public.source_versions
set processing_status = 'NEEDS_REVIEW'
where id = '41000000-0000-0000-0000-000000000001';
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is((select count(*) from public.available_curriculum_units()), 0::bigint, 'source state change removes availability immediately');
reset role;
rollback to savepoint source_state_change;

savepoint unit_state_change;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is((select count(*) from public.available_curriculum_units()), 1::bigint, 'unit-state change precondition is available');
reset role;
update public.curriculum_units
set publication_status = 'WITHDRAWN'
where id = '20000000-0000-0000-0000-000000000007';
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is((select count(*) from public.available_curriculum_units()), 0::bigint, 'unit state change removes availability immediately');
reset role;
rollback to savepoint unit_state_change;

select * from finish();
rollback;
