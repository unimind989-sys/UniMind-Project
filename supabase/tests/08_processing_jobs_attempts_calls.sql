begin;
\ir ../fixtures/wp02-synthetic.sql
select plan(4);

select is(
  (select count(*) from unimind_private.claim_processing_job(
    'synthetic-worker', transaction_timestamp(), interval '2 minutes'
  )),
  1::bigint,
  'one eligible job is claimed atomically'
);
select is(
  (select state from unimind_private.processing_jobs where id = '50000000-0000-0000-0000-000000000001'),
  'RUNNING',
  'claim establishes the running lease state'
);
select is(
  (select count(*) from unimind_private.job_attempts where job_id = '50000000-0000-0000-0000-000000000001'),
  1::bigint,
  'claim appends exactly one attempt'
);
select throws_ok(
  $$update unimind_private.job_attempts
    set heartbeat_at = transaction_timestamp()
    where job_id = '50000000-0000-0000-0000-000000000001'$$,
  '55000',
  'unimind_private.job_attempts is append-only',
  'attempt history cannot be rewritten'
);

select * from finish();
rollback;
