begin;
select plan(13);
set local unimind.actor_id = '10000000-0000-0000-0000-000000000001';
set local unimind.audit_reason = 'WP03-T27 synthetic profile name format proof';
set local unimind.correlation_id = '90000000-0000-0000-0000-000000000030';

select ok(exists(select 1 from pg_catalog.pg_constraint where conname = 'profiles_display_name_format_check' and conrelid = 'public.profiles'::regclass), 'profile names carry a format check');
select ok(has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE'), 'caller may update its own name through the existing grant');
select ok(not has_column_privilege('anon', 'public.profiles', 'display_name', 'UPDATE'), 'anonymous caller cannot write names');

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select lives_ok($q$update public.profiles set display_name = 'Samir Hassan', preferred_language = 'AR_EG' where user_id = '10000000-0000-0000-0000-000000000002'$q$, 'own name and account language save');
select lives_ok($q$update public.profiles set display_name = 'سمير حسن' where user_id = '10000000-0000-0000-0000-000000000002'$q$, 'an Arabic name saves');
select lives_ok($q$update public.profiles set display_name = '' where user_id = '10000000-0000-0000-0000-000000000002'$q$, 'the legacy empty name stays valid');
select throws_ok($q$update public.profiles set display_name = ' Samir' where user_id = '10000000-0000-0000-0000-000000000002'$q$, '23514', null, 'a leading space is rejected');
select throws_ok($q$update public.profiles set display_name = 'Samir  Hassan' where user_id = '10000000-0000-0000-0000-000000000002'$q$, '23514', null, 'a double space is rejected');
select throws_ok($q$update public.profiles set display_name = 'Samir' || chr(9) || 'Hassan' where user_id = '10000000-0000-0000-0000-000000000002'$q$, '23514', null, 'a control character is rejected');
select throws_ok($q$update public.profiles set display_name = 'Samir' || chr(8238) || 'Hassan' where user_id = '10000000-0000-0000-0000-000000000002'$q$, '23514', null, 'a bidi override is rejected');
select throws_ok($q$update public.profiles set display_name = repeat('a', 81) where user_id = '10000000-0000-0000-0000-000000000002'$q$, '23514', null, 'an 81-character name is rejected');
select throws_ok($q$update public.profiles set preferred_language = 'FR' where user_id = '10000000-0000-0000-0000-000000000002'$q$, '23514', null, 'an unknown account language is rejected');

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
with changed as (update public.profiles set display_name = 'Cross user' where user_id = '10000000-0000-0000-0000-000000000002' returning user_id)
select is((select count(*) from changed), 0::bigint, 'another caller cannot rename the profile');
reset role;
select * from finish();
rollback;
