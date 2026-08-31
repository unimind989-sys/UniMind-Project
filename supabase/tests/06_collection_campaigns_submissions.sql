begin;
select plan(3);

select ok(exists (
  select 1 from public.batch_leader_assignments
  where campaign_id = '30000000-0000-0000-0000-000000000001'
    and user_id = '10000000-0000-0000-0000-000000000002'
    and status = 'ACTIVE'
    and expires_at > transaction_timestamp()
), 'active campaign assignment is explicit and bounded');

select throws_ok(
  $$insert into public.source_submissions (
      campaign_id, curriculum_unit_id, cohort_id, submitted_by,
      client_idempotency_key, source_name, declared_format, declared_rights
    ) values (
      '30000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000007',
      '20000000-0000-0000-0000-000000000006',
      '10000000-0000-0000-0000-000000000002',
      'synthetic-unit-a-submission', 'Replay', 'application/pdf', 'DECLARED'
    )$$,
  '23505', null,
  'submission client idempotency is enforced per campaign and user'
);

select is(
  (select count(*) from public.campaign_curriculum_units where campaign_id = '30000000-0000-0000-0000-000000000001'),
  2::bigint,
  'campaign curriculum-unit scope is explicit'
);

select * from finish();
rollback;
