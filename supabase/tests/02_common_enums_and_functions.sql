begin;
select plan(3);

select ok(
  unimind_private.is_valid_transition('job', 'QUEUED', 'RUNNING'),
  'a legal job transition is accepted'
);
select ok(
  not unimind_private.is_valid_transition('job', 'QUEUED', 'SUCCEEDED'),
  'an illegal job transition is rejected'
);
select throws_ok(
  $$select unimind_private.assert_valid_transition('raw_object', 'STORED', 'DELETED')$$,
  '23514',
  'invalid raw_object transition from STORED to DELETED',
  'invalid transitions fail with a stable database error'
);

select * from finish();
rollback;
