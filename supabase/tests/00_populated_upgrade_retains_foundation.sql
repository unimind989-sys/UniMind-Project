begin;
select plan(2);

select is(
  (select count(*) from unimind_private.synthetic_foundation_fixture),
  3::bigint,
  'the populated WP01 foundation rows survive the WP02 forward upgrade'
);

select is(
  (select count(distinct leakage_canary) from unimind_private.synthetic_foundation_fixture),
  3::bigint,
  'the retained synthetic evidence canaries remain unique'
);

select * from finish();
rollback;
