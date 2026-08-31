begin;
select plan(4);

select ok(exists (
  select 1 from public.cohort_memberships
  where user_id = '10000000-0000-0000-0000-000000000002'
    and status = 'ACTIVE'
    and starts_at <= transaction_timestamp()
    and ends_at > transaction_timestamp()
), 'active membership is deterministically queryable');

select ok(not exists (
  select 1 from public.cohort_memberships
  where user_id = '10000000-0000-0000-0000-000000000003'
    and status = 'ACTIVE'
    and (ends_at is null or ends_at > transaction_timestamp())
), 'expired membership cannot satisfy the active predicate');

select is(
  (select release_status from public.cohort_releases where cohort_id = '20000000-0000-0000-0000-000000000006'),
  'UNLOCKED',
  'cohort release state is explicit'
);
select is(
  (select publication_status from public.curriculum_units where id = '20000000-0000-0000-0000-000000000008'),
  'DRAFT',
  'unpublished unit state is explicit'
);

select * from finish();
rollback;
