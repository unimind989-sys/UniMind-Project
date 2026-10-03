begin;
select plan(12);
set local unimind.actor_id = '10000000-0000-0000-0000-000000000001';
set local unimind.audit_reason = 'WP03-T09 synthetic academic preference scope proof';
set local unimind.correlation_id = '90000000-0000-0000-0000-000000000009';

select ok(has_column_privilege('authenticated', 'public.profiles', 'academic_context', 'UPDATE'), 'caller may update the guarded preference column');
select ok(not has_column_privilege('anon', 'public.profiles', 'academic_context', 'UPDATE'), 'anonymous caller cannot write preferences');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'account_status', 'UPDATE'), 'profile preference adds no account status grant');

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select lives_ok($q$
  update public.profiles set academic_context = '{"version":1,"stageId":"20000000-0000-0000-0000-000000000001","institutionId":"20000000-0000-0000-0000-000000000002","programId":"20000000-0000-0000-0000-000000000003","levelId":"20000000-0000-0000-0000-000000000004","termId":"20000000-0000-0000-0000-000000000005","cohortId":"20000000-0000-0000-0000-000000000006"}'::jsonb
  where user_id = '10000000-0000-0000-0000-000000000002'
$q$, 'active consenting member saves its own complete authorized hierarchy');
select is((select academic_context->>'cohortId' from public.profiles), '20000000-0000-0000-0000-000000000006', 'fresh profile read returns the saved cohort');
select throws_ok($q$update public.profiles set academic_context = academic_context || '{"cohortId":"foreign-cohort"}'::jsonb$q$, '22023', 'Academic preference does not match the available catalog.', 'foreign hierarchy is rejected');
select throws_ok($q$update public.profiles set academic_context = academic_context || '{"userId":"foreign-caller"}'::jsonb$q$, '22023', 'Academic preference does not match the available catalog.', 'extra identity field cannot be persisted');
select throws_ok($q$update public.profiles set academic_context = '[]'::jsonb$q$, '22023', 'Academic preference does not match the available catalog.', 'malformed preference fails with a bounded public error');

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
with changed as (update public.profiles set academic_context = '{}'::jsonb where user_id = '10000000-0000-0000-0000-000000000002' returning user_id)
select is((select count(*) from changed), 0::bigint, 'foreign profile is hidden from mutation by RLS');
select throws_ok($q$update public.profiles set academic_context = '{}'::jsonb where user_id = '10000000-0000-0000-0000-000000000003'$q$, '42501', 'Academic preference unavailable.', 'nonconsenting caller cannot save');
reset role;
update public.profiles set account_status = 'SUSPENDED' where user_id = '10000000-0000-0000-0000-000000000002';
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select throws_ok($q$update public.profiles set academic_context = '{}'::jsonb$q$, '42501', 'Academic preference unavailable.', 'suspended caller cannot change preferences');
reset role;
update public.cohort_memberships set status = 'REVOKED' where user_id = '10000000-0000-0000-0000-000000000002';
set local role authenticated;
select is((select count(*) from public.available_catalog_entries()), 0::bigint, 'a saved preference cannot override revoked membership access');
select * from finish();
rollback;
