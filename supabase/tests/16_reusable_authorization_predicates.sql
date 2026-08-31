begin;
select plan(34);

select is(
  (
    select count(*)
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_namespace as namespaces on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'public'
      and procedures.proname in (
        'is_admin',
        'has_active_membership',
        'has_campaign_assignment',
        'can_access_unit'
      )
      and procedures.provolatile = 's'
      and not procedures.prosecdef
      and array_to_string(procedures.proconfig, ',') like '%search_path=""%'
  ),
  4::bigint,
  'all authorization predicates are stable security-invoker functions with an empty search path'
);

select is(
  (
    select count(*)
    from unnest(array[
      'public.is_admin()',
      'public.has_active_membership(uuid)',
      'public.has_campaign_assignment(uuid)',
      'public.can_access_unit(uuid)'
    ]) as signatures(signature)
    where has_function_privilege('authenticated', signature, 'EXECUTE')
  ),
  4::bigint,
  'authenticated callers can execute each caller-scoped predicate'
);

select is(
  (
    select count(*)
    from unnest(array[
      'public.is_admin()',
      'public.has_active_membership(uuid)',
      'public.has_campaign_assignment(uuid)',
      'public.can_access_unit(uuid)'
    ]) as signatures(signature)
    where has_function_privilege('anon', signature, 'EXECUTE')
  ),
  0::bigint,
  'anonymous callers cannot execute authorization predicates'
);

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","app_metadata":{"role":"STUDENT"}}';

select is(public.is_admin(), false, 'an active member is not an administrator');
select is(
  public.has_active_membership('20000000-0000-0000-0000-000000000006'),
  true,
  'an active time-bounded membership authorizes its cohort'
);
select is(
  public.has_campaign_assignment('30000000-0000-0000-0000-000000000001'),
  true,
  'an active unexpired campaign assignment authorizes its campaign'
);
select is(
  public.can_access_unit('20000000-0000-0000-0000-000000000007'),
  true,
  'an active member can access a curriculum unit in the authorized cohort'
);
select is(
  public.can_access_unit('20000000-0000-0000-0000-000000000008'),
  true,
  'authorization remains separate from publication and availability state'
);
select is(
  public.can_access_unit('20000000-0000-0000-0000-000000000099'),
  false,
  'a nonexistent curriculum unit is never authorized'
);
select is((select count(*) from public.cohorts), 1::bigint, 'member policy exposes its cohort');
select is((select count(*) from public.curriculum_units), 2::bigint, 'member policy exposes units in its cohort');
select is((select count(*) from public.collection_campaigns), 1::bigint, 'assignment policy exposes its campaign');
select is((select count(*) from public.source_assets), 1::bigint, 'source policy also enforces release and publication state');

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated","app_metadata":{"role":"ADMIN"}}';

select is(public.is_admin(), false, 'stale app metadata cannot grant administrator authority');
select is(
  public.has_active_membership('20000000-0000-0000-0000-000000000006'),
  false,
  'an expired membership does not authorize its cohort'
);
select is(
  public.has_campaign_assignment('30000000-0000-0000-0000-000000000001'),
  false,
  'a caller without an assignment cannot access the campaign'
);
select is(
  public.can_access_unit('20000000-0000-0000-0000-000000000007'),
  false,
  'stale role metadata and expired membership cannot authorize a unit'
);
select is((select count(*) from public.cohorts), 0::bigint, 'expired member sees no cohort rows');
select is((select count(*) from public.curriculum_units), 0::bigint, 'expired member sees no curriculum units');
select is((select count(*) from public.collection_campaigns), 0::bigint, 'unassigned caller sees no campaigns');
select is((select count(*) from public.source_assets), 0::bigint, 'unauthorized caller sees no source assets');

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","app_metadata":{"role":"ADMIN"}}';

select is(public.is_admin(), true, 'the authoritative active role grants administrator authority');
select is(
  public.can_access_unit('20000000-0000-0000-0000-000000000007'),
  true,
  'an administrator can access a unit without a cohort membership'
);

reset role;
update public.user_roles
set revoked_at = transaction_timestamp(), revoke_reason = 'Synthetic immediate revocation proof'
where user_id = '10000000-0000-0000-0000-000000000001' and role = 'ADMIN';

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","app_metadata":{"role":"ADMIN"}}';
select is(public.is_admin(), false, 'database role revocation overrides a stale administrator claim immediately');

reset role;
update public.cohort_memberships
set status = 'REVOKED'
where user_id = '10000000-0000-0000-0000-000000000002'
  and cohort_id = '20000000-0000-0000-0000-000000000006';
update public.batch_leader_assignments
set status = 'REVOKED', revoked_at = transaction_timestamp(), reason = 'Synthetic immediate revocation proof'
where user_id = '10000000-0000-0000-0000-000000000002'
  and campaign_id = '30000000-0000-0000-0000-000000000001';

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","app_metadata":{"role":"BATCH_LEADER"}}';

select is(
  public.has_active_membership('20000000-0000-0000-0000-000000000006'),
  false,
  'membership revocation is visible without waiting for JWT refresh'
);
select is(
  public.has_campaign_assignment('30000000-0000-0000-0000-000000000001'),
  false,
  'assignment revocation is visible without waiting for JWT refresh'
);
select is(
  public.can_access_unit('20000000-0000-0000-0000-000000000007'),
  false,
  'revoked membership removes curriculum-unit access immediately'
);
select is((select count(*) from public.cohorts), 0::bigint, 'revoked membership removes policy-visible cohort rows');
select is((select count(*) from public.available_curriculum_units()), 0::bigint, 'revocation removes derived availability immediately');
select throws_ok(
  $$insert into public.source_submissions (
      campaign_id, curriculum_unit_id, cohort_id, submitted_by,
      client_idempotency_key, source_name, declared_format, declared_rights
    ) values (
      '30000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000007',
      '20000000-0000-0000-0000-000000000006',
      '10000000-0000-0000-0000-000000000002',
      'revoked-assignment-proof', 'Revoked assignment proof',
      'application/pdf', 'DECLARED'
    )$$,
  '42501',
  null,
  'revoked assignment cannot create a source submission'
);
reset role;

select is(
  (
    select count(*)
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and cmd = 'UPDATE'
      and (qual is null or with_check is null)
  ),
  0::bigint,
  'every update policy has both USING and WITH CHECK predicates'
);
select is(
  (
    select count(*)
    from pg_catalog.pg_policies as update_policies
    where update_policies.schemaname = 'public'
      and update_policies.cmd = 'UPDATE'
      and not exists (
        select 1
        from pg_catalog.pg_policies as select_policies
        where select_policies.schemaname = update_policies.schemaname
          and select_policies.tablename = update_policies.tablename
          and select_policies.cmd = 'SELECT'
      )
  ),
  0::bigint,
  'every update policy has a SELECT policy for row visibility'
);
select is(
  (
    select count(*)
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and coalesce(qual, '') || coalesce(with_check, '') ilike '%auth.role%'
  ),
  0::bigint,
  'RLS policy authorization never relies on auth.role()'
);
select is(
  (
    select count(*)
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_namespace as namespaces on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'public'
      and procedures.proname in (
        'is_admin',
        'has_active_membership',
        'has_campaign_assignment',
        'can_access_unit'
      )
      and pg_get_functiondef(procedures.oid) ~* '(app_metadata|request[.]jwt[.]claims|auth[.]role)'
  ),
  0::bigint,
  'authorization predicates do not trust mutable JWT role metadata'
);

select * from finish();
rollback;
