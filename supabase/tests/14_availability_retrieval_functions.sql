begin;
\ir ../fixtures/wp02-synthetic.sql
select plan(4);

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select is(
  (select count(*) from public.available_curriculum_units()),
  1::bigint,
  'active member sees only the unlocked, published, READY, rights-valid unit'
);

set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
select is(
  (select count(*) from public.available_curriculum_units()),
  0::bigint,
  'expired member sees no available curriculum unit'
);
reset role;

select is(
  (select count(*) from unimind_private.retrieve_authorized_segments(
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007',
    '70000000-0000-0000-0000-000000000001',
    '[0.1,0.2,0.3]'::extensions.vector,
    5
  )),
  1::bigint,
  'trusted retrieval returns only the authorized active segment scope'
);
select throws_ok(
  $$select * from unimind_private.retrieve_authorized_segments(
    '10000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007',
    '70000000-0000-0000-0000-000000000001',
    '[0.1,0.2,0.3]'::extensions.vector,
    5
  )$$,
  '42501',
  'requesting user cannot access the requested curriculum unit',
  'forged worker scope is rejected after server-side revalidation'
);

select * from finish();
rollback;
