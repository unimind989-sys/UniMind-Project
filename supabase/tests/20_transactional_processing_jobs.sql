begin;
select plan(25);

insert into unimind_private.processing_jobs (
  id, source_version_id, job_type, idempotency_key, priority, available_at
)
values
  (
    '50000000-0000-0000-0000-000000000020',
    '41000000-0000-0000-0000-000000000001',
    'EMBED', 'wp02-t07-job-success', 0, transaction_timestamp()
  ),
  (
    '50000000-0000-0000-0000-000000000021',
    '41000000-0000-0000-0000-000000000001',
    'INDEX', 'wp02-t07-job-retry', 1, transaction_timestamp()
  ),
  (
    '50000000-0000-0000-0000-000000000022',
    '41000000-0000-0000-0000-000000000001',
    'QUALITY', 'wp02-t07-job-expired', 2, transaction_timestamp()
  );

select is(
  (
    select id from unimind_private.claim_processing_job(
      'worker-a', transaction_timestamp() + interval '1 minute', interval '2 minutes',
      'wp02-t07-claim-success',
      '90000000-0000-0000-0000-000000000020'
    )
  ),
  '50000000-0000-0000-0000-000000000020'::uuid,
  'claim returns the highest-priority eligible job'
);

select is(
  (
    select id from unimind_private.claim_processing_job(
      'worker-a', transaction_timestamp() + interval '1 minute 30 seconds', interval '3 minutes',
      'wp02-t07-claim-success',
      '90000000-0000-0000-0000-000000000020'
    )
  ),
  '50000000-0000-0000-0000-000000000020'::uuid,
  'claim replay returns the canonical existing job'
);

select is(
  (
    select count(*) from unimind_private.job_events
    where idempotency_key = 'wp02-t07-claim-success'
  ),
  1::bigint,
  'claim replay appends one event'
);

select is(
  (
    select count(*) from unimind_private.job_attempts
    where job_id = '50000000-0000-0000-0000-000000000020'
  ),
  1::bigint,
  'claim replay appends one immutable attempt'
);

select throws_ok(
  $$select * from unimind_private.claim_processing_job(
    'worker-b', transaction_timestamp() + interval '1 minute 30 seconds', interval '2 minutes',
    'wp02-t07-claim-success',
    '90000000-0000-0000-0000-000000000020'
  )$$,
  '23505',
  'idempotency key was reused with different job transition input',
  'claim rejects a conflicting idempotency replay'
);

select is(
  (
    unimind_private.heartbeat_processing_job(
      '50000000-0000-0000-0000-000000000020', 'worker-a',
      transaction_timestamp() + interval '2 minutes', interval '4 minutes',
      'wp02-t07-heartbeat-success',
      '90000000-0000-0000-0000-000000000020'
    )
  ).lease_expires_at,
  transaction_timestamp() + interval '6 minutes',
  'heartbeat extends the current owner lease atomically'
);

select is(
  (
    unimind_private.heartbeat_processing_job(
      '50000000-0000-0000-0000-000000000020', 'worker-a',
      transaction_timestamp() + interval '2 minutes 30 seconds', interval '1 minute',
      'wp02-t07-heartbeat-success',
      '90000000-0000-0000-0000-000000000020'
    )
  ).lease_expires_at,
  transaction_timestamp() + interval '6 minutes',
  'heartbeat replay returns the canonical unchanged lease'
);

select throws_ok(
  $$select unimind_private.heartbeat_processing_job(
    '50000000-0000-0000-0000-000000000020', 'worker-b',
    transaction_timestamp() + interval '3 minutes', interval '2 minutes',
    'wp02-t07-heartbeat-wrong-owner',
    '90000000-0000-0000-0000-000000000020'
  )$$,
  '42501',
  'job lease is owned by another worker',
  'heartbeat rejects another worker'
);

select is(
  (
    unimind_private.succeed_processing_job(
      '50000000-0000-0000-0000-000000000020', 'worker-a',
      transaction_timestamp() + interval '4 minutes', 'wp02-t07-succeed-job',
      '90000000-0000-0000-0000-000000000020'
    )
  ).state,
  'SUCCEEDED',
  'the lease owner succeeds a running job atomically'
);

select is(
  (
    unimind_private.succeed_processing_job(
      '50000000-0000-0000-0000-000000000020', 'worker-a',
      transaction_timestamp() + interval '5 minutes', 'wp02-t07-succeed-job',
      '90000000-0000-0000-0000-000000000020'
    )
  ).state,
  'SUCCEEDED',
  'success replay returns the canonical terminal job'
);

select is(
  (
    select count(*) from unimind_private.job_events
    where job_id = '50000000-0000-0000-0000-000000000020'
      and event_type = 'SUCCEEDED'
  ),
  1::bigint,
  'success replay appends one terminal event'
);

select is(
  (
    select id from unimind_private.claim_processing_job(
      'worker-a', transaction_timestamp() + interval '1 minute', interval '2 minutes',
      'wp02-t07-claim-retry',
      '90000000-0000-0000-0000-000000000021'
    )
  ),
  '50000000-0000-0000-0000-000000000021'::uuid,
  'a second job can be claimed for retry coverage'
);

select is(
  (
    unimind_private.retry_processing_job(
      '50000000-0000-0000-0000-000000000021', 'worker-a',
      transaction_timestamp() + interval '2 minutes',
      transaction_timestamp() + interval '6 minutes',
      'PROVIDER_RATE_LIMIT', '{"retry_after_ms":240000}'::jsonb,
      'wp02-t07-retry-job',
      '90000000-0000-0000-0000-000000000021'
    )
  ).state,
  'RETRYING',
  'retry clears the lease and schedules the next attempt atomically'
);

select is(
  (
    unimind_private.retry_processing_job(
      '50000000-0000-0000-0000-000000000021', 'worker-a',
      transaction_timestamp() + interval '2 minutes 30 seconds',
      transaction_timestamp() + interval '7 minutes',
      'PROVIDER_RATE_LIMIT', '{}'::jsonb,
      'wp02-t07-retry-job',
      '90000000-0000-0000-0000-000000000021'
    )
  ).available_at,
  transaction_timestamp() + interval '6 minutes',
  'retry replay returns the canonical original schedule'
);

select is(
  (
    select id from unimind_private.claim_processing_job(
      'worker-b', transaction_timestamp() + interval '6 minutes', interval '2 minutes',
      'wp02-t07-reclaim-retry',
      '90000000-0000-0000-0000-000000000021'
    )
  ),
  '50000000-0000-0000-0000-000000000021'::uuid,
  'a retryable job is claimed by a new lease owner when due'
);

select throws_ok(
  $$select unimind_private.succeed_processing_job(
    '50000000-0000-0000-0000-000000000021', 'worker-a',
    transaction_timestamp() + interval '6 minutes 30 seconds',
    'wp02-t07-old-owner-success',
    '90000000-0000-0000-0000-000000000021'
  )$$,
  '42501',
  'job lease is owned by another worker',
  'a prior lease owner cannot complete the new attempt'
);

select is(
  (
    unimind_private.fail_processing_job(
      '50000000-0000-0000-0000-000000000021', 'worker-b',
      transaction_timestamp() + interval '7 minutes', 'UNSUPPORTED_OUTPUT',
      '{"classification":"terminal"}'::jsonb,
      'wp02-t07-fail-job',
      '90000000-0000-0000-0000-000000000021'
    )
  ).state,
  'FAILED',
  'the current lease owner terminally fails a job atomically'
);

select is(
  (
    unimind_private.fail_processing_job(
      '50000000-0000-0000-0000-000000000021', 'worker-b',
      transaction_timestamp() + interval '7 minutes 30 seconds',
      'UNSUPPORTED_OUTPUT', '{}'::jsonb,
      'wp02-t07-fail-job',
      '90000000-0000-0000-0000-000000000021'
    )
  ).state,
  'FAILED',
  'terminal failure replay returns the canonical job'
);

update unimind_private.processing_jobs
set state = 'RUNNING', lease_owner = 'worker-a',
    lease_expires_at = transaction_timestamp() + interval '2 minutes',
    attempt_count = 1
where id = '50000000-0000-0000-0000-000000000022';

insert into unimind_private.job_attempts (
  job_id, attempt_number, lease_owner, started_at
)
values (
  '50000000-0000-0000-0000-000000000022', 1, 'worker-a',
  transaction_timestamp() + interval '1 minute'
);

select throws_ok(
  $$select unimind_private.succeed_processing_job(
    '50000000-0000-0000-0000-000000000022', 'worker-a',
    transaction_timestamp() + interval '2 minutes', 'wp02-t07-expired-success',
    '90000000-0000-0000-0000-000000000022'
  )$$,
  '55000',
  'job lease has expired',
  'success rejects an expired lease'
);

select throws_ok(
  $$select unimind_private.retry_processing_job(
    '50000000-0000-0000-0000-000000000022', 'worker-a',
    transaction_timestamp() + interval '2 minutes',
    transaction_timestamp() + interval '3 minutes',
    'TIMEOUT', '{}'::jsonb, 'wp02-t07-expired-retry',
    '90000000-0000-0000-0000-000000000022'
  )$$,
  '55000',
  'job lease has expired',
  'retry rejects an expired lease'
);

select throws_ok(
  $$select unimind_private.fail_processing_job(
    '50000000-0000-0000-0000-000000000022', 'worker-a',
    transaction_timestamp() + interval '2 minutes', 'TIMEOUT', '{}'::jsonb,
    'wp02-t07-expired-fail',
    '90000000-0000-0000-0000-000000000022'
  )$$,
  '55000',
  'job lease has expired',
  'terminal failure rejects an expired lease'
);

select throws_ok(
  $$update unimind_private.job_events
    set error_code = 'REWRITTEN'
    where idempotency_key = 'wp02-t07-fail-job'$$,
  '55000',
  'unimind_private.job_events is append-only',
  'job transition evidence cannot be rewritten'
);

select is(
  (
    select count(*) from unimind_private.job_events
    where job_id in (
      '50000000-0000-0000-0000-000000000020',
      '50000000-0000-0000-0000-000000000021'
    )
  ),
  7::bigint,
  'claim, heartbeat, success, retry, reclaim, and failure append exact event history'
);

select is(
  (
    select attempt_count from unimind_private.processing_jobs
    where id = '50000000-0000-0000-0000-000000000021'
  ),
  2,
  'retry claim increments the attempt exactly once'
);

select is(
  (
    select count(*) from unimind_private.job_attempts
    where job_id = '50000000-0000-0000-0000-000000000021'
  ),
  2::bigint,
  'retry claim appends one immutable attempt per lease'
);

select * from finish();
rollback;
