create table unimind_private.job_events (
  id uuid primary key default extensions.gen_random_uuid(),
  job_id uuid not null
    references unimind_private.processing_jobs(id) on delete restrict,
  attempt_number integer not null,
  event_type text not null,
  lease_owner text not null,
  event_at timestamptz not null,
  available_at timestamptz,
  error_code text,
  error_detail jsonb,
  idempotency_key text not null unique,
  correlation_id uuid not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint job_events_attempt_fk
    foreign key (job_id, attempt_number)
    references unimind_private.job_attempts(job_id, attempt_number) on delete restrict,
  constraint job_events_attempt_check check (attempt_number > 0),
  constraint job_events_type_check
    check (event_type in ('CLAIMED', 'HEARTBEAT', 'SUCCEEDED', 'RETRYING', 'FAILED')),
  constraint job_events_owner_check check (nullif(btrim(lease_owner), '') is not null),
  constraint job_events_retry_fields_check
    check ((event_type = 'RETRYING') = (available_at is not null)),
  constraint job_events_error_fields_check
    check ((event_type in ('RETRYING', 'FAILED')) = (error_code is not null)),
  constraint job_events_idempotency_check
    check (char_length(idempotency_key) between 8 and 200)
);

create trigger job_events_append_only
before update or delete on unimind_private.job_events
for each row execute function unimind_private.reject_row_mutation();

create index job_events_job_attempt_idx
  on unimind_private.job_events (job_id, attempt_number, created_at);

revoke all on table unimind_private.job_events from public, anon, authenticated;
grant select, insert on table unimind_private.job_events to service_role;

drop function unimind_private.claim_processing_job(text, timestamptz, interval);

create function unimind_private.claim_processing_job(
  worker_id text,
  claimed_at timestamptz,
  lease_duration interval,
  target_idempotency_key text,
  target_correlation_id uuid
)
returns setof unimind_private.processing_jobs
language plpgsql
set search_path = ''
as $$
declare
  claimed_job unimind_private.processing_jobs%rowtype;
  replay_event unimind_private.job_events%rowtype;
begin
  if nullif(btrim(worker_id), '') is null then
    raise exception using errcode = '22023', message = 'worker_id is required';
  end if;
  if claimed_at is null or lease_duration is null
     or lease_duration <= interval '0 seconds'
     or lease_duration > interval '15 minutes' then
    raise exception using errcode = '22023', message = 'lease_duration is outside the allowed range';
  end if;
  if target_idempotency_key is null
     or char_length(target_idempotency_key) not between 8 and 200 then
    raise exception using errcode = '22023', message = 'job transition idempotency key is invalid';
  end if;
  if target_correlation_id is null then
    raise exception using errcode = '22023', message = 'correlation ID is required';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('job-transition:' || target_idempotency_key, 0)
  );

  select events.* into replay_event
  from unimind_private.job_events as events
  where events.idempotency_key = target_idempotency_key;

  if found then
    if replay_event.event_type <> 'CLAIMED'
       or replay_event.lease_owner <> worker_id
       or replay_event.correlation_id <> target_correlation_id then
      raise exception using
        errcode = '23505',
        message = 'idempotency key was reused with different job transition input';
    end if;

    return query
    select jobs.*
    from unimind_private.processing_jobs as jobs
    where jobs.id = replay_event.job_id;
    return;
  end if;

  select jobs.*
  into claimed_job
  from unimind_private.processing_jobs as jobs
  where jobs.state in ('QUEUED', 'RETRYING')
    and jobs.available_at <= claimed_at
    and jobs.created_at <= claimed_at
    and jobs.attempt_count < jobs.max_attempts
    and not exists (
      select 1
      from unimind_private.job_dependencies as dependency
      join unimind_private.processing_jobs as prerequisite
        on prerequisite.id = dependency.depends_on_job_id
      where dependency.job_id = jobs.id
        and prerequisite.state <> 'SUCCEEDED'
    )
  order by jobs.priority asc, jobs.available_at asc, jobs.created_at asc
  for update of jobs skip locked
  limit 1;

  if not found then
    return;
  end if;

  perform unimind_private.assert_valid_transition(
    'job', claimed_job.state, 'RUNNING'
  );

  update unimind_private.processing_jobs
  set
    state = 'RUNNING',
    lease_owner = worker_id,
    lease_expires_at = claimed_at + lease_duration,
    attempt_count = attempt_count + 1,
    last_error_code = null
  where id = claimed_job.id
  returning * into claimed_job;

  insert into unimind_private.job_attempts (
    job_id,
    attempt_number,
    lease_owner,
    started_at
  ) values (
    claimed_job.id,
    claimed_job.attempt_count,
    worker_id,
    claimed_at
  );

  insert into unimind_private.job_events (
    job_id,
    attempt_number,
    event_type,
    lease_owner,
    event_at,
    idempotency_key,
    correlation_id
  ) values (
    claimed_job.id,
    claimed_job.attempt_count,
    'CLAIMED',
    worker_id,
    claimed_at,
    target_idempotency_key,
    target_correlation_id
  );

  return next claimed_job;
end;
$$;

create function unimind_private.heartbeat_processing_job(
  target_job_id uuid,
  worker_id text,
  heartbeat_time timestamptz,
  lease_duration interval,
  target_idempotency_key text,
  target_correlation_id uuid
)
returns unimind_private.processing_jobs
language plpgsql
set search_path = ''
as $$
declare
  job unimind_private.processing_jobs%rowtype;
  replay_event unimind_private.job_events%rowtype;
begin
  if target_job_id is null or nullif(btrim(worker_id), '') is null
     or heartbeat_time is null or target_correlation_id is null then
    raise exception using errcode = '22023', message = 'heartbeat input is incomplete';
  end if;
  if lease_duration is null or lease_duration <= interval '0 seconds'
     or lease_duration > interval '15 minutes' then
    raise exception using errcode = '22023', message = 'lease_duration is outside the allowed range';
  end if;
  if target_idempotency_key is null
     or char_length(target_idempotency_key) not between 8 and 200 then
    raise exception using errcode = '22023', message = 'job transition idempotency key is invalid';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('job-transition:' || target_idempotency_key, 0)
  );

  select events.* into replay_event
  from unimind_private.job_events as events
  where events.idempotency_key = target_idempotency_key;

  if found then
    if replay_event.event_type <> 'HEARTBEAT'
       or replay_event.job_id <> target_job_id
       or replay_event.lease_owner <> worker_id
       or replay_event.correlation_id <> target_correlation_id then
      raise exception using
        errcode = '23505',
        message = 'idempotency key was reused with different job transition input';
    end if;
    select jobs.* into job
    from unimind_private.processing_jobs as jobs
    where jobs.id = replay_event.job_id;
    return job;
  end if;

  select jobs.* into job
  from unimind_private.processing_jobs as jobs
  where jobs.id = target_job_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'processing job does not exist';
  end if;
  if job.state <> 'RUNNING' then
    raise exception using errcode = '23514', message = 'only a running job can heartbeat';
  end if;
  if job.lease_owner <> worker_id then
    raise exception using errcode = '42501', message = 'job lease is owned by another worker';
  end if;
  if heartbeat_time < job.created_at then
    raise exception using errcode = '22007', message = 'job transition time precedes job creation';
  end if;
  if job.lease_expires_at <= heartbeat_time then
    raise exception using errcode = '55000', message = 'job lease has expired';
  end if;

  update unimind_private.processing_jobs
  set lease_expires_at = heartbeat_time + lease_duration
  where id = job.id
  returning * into job;

  insert into unimind_private.job_events (
    job_id, attempt_number, event_type, lease_owner, event_at,
    idempotency_key, correlation_id
  ) values (
    job.id, job.attempt_count, 'HEARTBEAT', worker_id, heartbeat_time,
    target_idempotency_key, target_correlation_id
  );

  return job;
end;
$$;

create function unimind_private.succeed_processing_job(
  target_job_id uuid,
  worker_id text,
  completed_at timestamptz,
  target_idempotency_key text,
  target_correlation_id uuid
)
returns unimind_private.processing_jobs
language plpgsql
set search_path = ''
as $$
declare
  job unimind_private.processing_jobs%rowtype;
  replay_event unimind_private.job_events%rowtype;
begin
  if target_job_id is null or nullif(btrim(worker_id), '') is null
     or completed_at is null or target_correlation_id is null then
    raise exception using errcode = '22023', message = 'job success input is incomplete';
  end if;
  if target_idempotency_key is null
     or char_length(target_idempotency_key) not between 8 and 200 then
    raise exception using errcode = '22023', message = 'job transition idempotency key is invalid';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('job-transition:' || target_idempotency_key, 0)
  );

  select events.* into replay_event
  from unimind_private.job_events as events
  where events.idempotency_key = target_idempotency_key;

  if found then
    if replay_event.event_type <> 'SUCCEEDED'
       or replay_event.job_id <> target_job_id
       or replay_event.lease_owner <> worker_id
       or replay_event.correlation_id <> target_correlation_id then
      raise exception using
        errcode = '23505',
        message = 'idempotency key was reused with different job transition input';
    end if;
    select jobs.* into job
    from unimind_private.processing_jobs as jobs
    where jobs.id = replay_event.job_id;
    return job;
  end if;

  select jobs.* into job
  from unimind_private.processing_jobs as jobs
  where jobs.id = target_job_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'processing job does not exist';
  end if;
  if job.state <> 'RUNNING' then
    raise exception using errcode = '23514', message = 'only a running job can succeed';
  end if;
  if job.lease_owner <> worker_id then
    raise exception using errcode = '42501', message = 'job lease is owned by another worker';
  end if;
  if completed_at < job.created_at then
    raise exception using errcode = '22007', message = 'job transition time precedes job creation';
  end if;
  if job.lease_expires_at <= completed_at then
    raise exception using errcode = '55000', message = 'job lease has expired';
  end if;

  perform unimind_private.assert_valid_transition('job', job.state, 'SUCCEEDED');

  update unimind_private.processing_jobs
  set state = 'SUCCEEDED', lease_owner = null, lease_expires_at = null,
      finished_at = completed_at, last_error_code = null
  where id = job.id
  returning * into job;

  insert into unimind_private.job_events (
    job_id, attempt_number, event_type, lease_owner, event_at,
    idempotency_key, correlation_id
  ) values (
    job.id, job.attempt_count, 'SUCCEEDED', worker_id, completed_at,
    target_idempotency_key, target_correlation_id
  );

  return job;
end;
$$;

create function unimind_private.retry_processing_job(
  target_job_id uuid,
  worker_id text,
  failed_at timestamptz,
  retry_at timestamptz,
  target_error_code text,
  target_error_detail jsonb,
  target_idempotency_key text,
  target_correlation_id uuid
)
returns unimind_private.processing_jobs
language plpgsql
set search_path = ''
as $$
declare
  job unimind_private.processing_jobs%rowtype;
  replay_event unimind_private.job_events%rowtype;
begin
  if target_job_id is null or nullif(btrim(worker_id), '') is null
     or failed_at is null or retry_at is null or retry_at <= failed_at
     or nullif(btrim(target_error_code), '') is null
     or target_error_detail is null or target_correlation_id is null then
    raise exception using errcode = '22023', message = 'job retry input is invalid';
  end if;
  if target_idempotency_key is null
     or char_length(target_idempotency_key) not between 8 and 200 then
    raise exception using errcode = '22023', message = 'job transition idempotency key is invalid';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('job-transition:' || target_idempotency_key, 0)
  );

  select events.* into replay_event
  from unimind_private.job_events as events
  where events.idempotency_key = target_idempotency_key;

  if found then
    if replay_event.event_type <> 'RETRYING'
       or replay_event.job_id <> target_job_id
       or replay_event.lease_owner <> worker_id
       or replay_event.correlation_id <> target_correlation_id
       or replay_event.error_code <> target_error_code then
      raise exception using
        errcode = '23505',
        message = 'idempotency key was reused with different job transition input';
    end if;
    select jobs.* into job
    from unimind_private.processing_jobs as jobs
    where jobs.id = replay_event.job_id;
    return job;
  end if;

  select jobs.* into job
  from unimind_private.processing_jobs as jobs
  where jobs.id = target_job_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'processing job does not exist';
  end if;
  if job.state <> 'RUNNING' then
    raise exception using errcode = '23514', message = 'only a running job can retry';
  end if;
  if job.lease_owner <> worker_id then
    raise exception using errcode = '42501', message = 'job lease is owned by another worker';
  end if;
  if failed_at < job.created_at then
    raise exception using errcode = '22007', message = 'job transition time precedes job creation';
  end if;
  if job.lease_expires_at <= failed_at then
    raise exception using errcode = '55000', message = 'job lease has expired';
  end if;
  if job.attempt_count >= job.max_attempts then
    raise exception using errcode = '23514', message = 'job has exhausted its retry attempts';
  end if;

  perform unimind_private.assert_valid_transition('job', job.state, 'RETRYING');

  update unimind_private.processing_jobs
  set state = 'RETRYING', lease_owner = null, lease_expires_at = null,
      available_at = retry_at, last_error_code = target_error_code,
      finished_at = null
  where id = job.id
  returning * into job;

  insert into unimind_private.job_events (
    job_id, attempt_number, event_type, lease_owner, event_at, available_at,
    error_code, error_detail, idempotency_key, correlation_id
  ) values (
    job.id, job.attempt_count, 'RETRYING', worker_id, failed_at, retry_at,
    target_error_code, target_error_detail, target_idempotency_key,
    target_correlation_id
  );

  return job;
end;
$$;

create function unimind_private.fail_processing_job(
  target_job_id uuid,
  worker_id text,
  failed_at timestamptz,
  target_error_code text,
  target_error_detail jsonb,
  target_idempotency_key text,
  target_correlation_id uuid
)
returns unimind_private.processing_jobs
language plpgsql
set search_path = ''
as $$
declare
  job unimind_private.processing_jobs%rowtype;
  replay_event unimind_private.job_events%rowtype;
begin
  if target_job_id is null or nullif(btrim(worker_id), '') is null
     or failed_at is null or nullif(btrim(target_error_code), '') is null
     or target_error_detail is null or target_correlation_id is null then
    raise exception using errcode = '22023', message = 'job failure input is invalid';
  end if;
  if target_idempotency_key is null
     or char_length(target_idempotency_key) not between 8 and 200 then
    raise exception using errcode = '22023', message = 'job transition idempotency key is invalid';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('job-transition:' || target_idempotency_key, 0)
  );

  select events.* into replay_event
  from unimind_private.job_events as events
  where events.idempotency_key = target_idempotency_key;

  if found then
    if replay_event.event_type <> 'FAILED'
       or replay_event.job_id <> target_job_id
       or replay_event.lease_owner <> worker_id
       or replay_event.correlation_id <> target_correlation_id
       or replay_event.error_code <> target_error_code then
      raise exception using
        errcode = '23505',
        message = 'idempotency key was reused with different job transition input';
    end if;
    select jobs.* into job
    from unimind_private.processing_jobs as jobs
    where jobs.id = replay_event.job_id;
    return job;
  end if;

  select jobs.* into job
  from unimind_private.processing_jobs as jobs
  where jobs.id = target_job_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'processing job does not exist';
  end if;
  if job.state <> 'RUNNING' then
    raise exception using errcode = '23514', message = 'only a running job can fail';
  end if;
  if job.lease_owner <> worker_id then
    raise exception using errcode = '42501', message = 'job lease is owned by another worker';
  end if;
  if failed_at < job.created_at then
    raise exception using errcode = '22007', message = 'job transition time precedes job creation';
  end if;
  if job.lease_expires_at <= failed_at then
    raise exception using errcode = '55000', message = 'job lease has expired';
  end if;

  perform unimind_private.assert_valid_transition('job', job.state, 'FAILED');

  update unimind_private.processing_jobs
  set state = 'FAILED', lease_owner = null, lease_expires_at = null,
      last_error_code = target_error_code, finished_at = failed_at
  where id = job.id
  returning * into job;

  insert into unimind_private.job_events (
    job_id, attempt_number, event_type, lease_owner, event_at,
    error_code, error_detail, idempotency_key, correlation_id
  ) values (
    job.id, job.attempt_count, 'FAILED', worker_id, failed_at,
    target_error_code, target_error_detail, target_idempotency_key,
    target_correlation_id
  );

  return job;
end;
$$;

revoke all on function unimind_private.claim_processing_job(
  text, timestamptz, interval, text, uuid
) from public, anon, authenticated;
revoke all on function unimind_private.heartbeat_processing_job(
  uuid, text, timestamptz, interval, text, uuid
) from public, anon, authenticated;
revoke all on function unimind_private.succeed_processing_job(
  uuid, text, timestamptz, text, uuid
) from public, anon, authenticated;
revoke all on function unimind_private.retry_processing_job(
  uuid, text, timestamptz, timestamptz, text, jsonb, text, uuid
) from public, anon, authenticated;
revoke all on function unimind_private.fail_processing_job(
  uuid, text, timestamptz, text, jsonb, text, uuid
) from public, anon, authenticated;

grant execute on function unimind_private.claim_processing_job(
  text, timestamptz, interval, text, uuid
) to service_role;
grant execute on function unimind_private.heartbeat_processing_job(
  uuid, text, timestamptz, interval, text, uuid
) to service_role;
grant execute on function unimind_private.succeed_processing_job(
  uuid, text, timestamptz, text, uuid
) to service_role;
grant execute on function unimind_private.retry_processing_job(
  uuid, text, timestamptz, timestamptz, text, jsonb, text, uuid
) to service_role;
grant execute on function unimind_private.fail_processing_job(
  uuid, text, timestamptz, text, jsonb, text, uuid
) to service_role;

alter table unimind_private.usage_reservations
  add column released_at timestamptz,
  add column expired_at timestamptz,
  add constraint usage_reservations_terminal_fields_check
    check (
      (state = 'RESERVED' and settled_at is null and released_at is null and expired_at is null)
      or (state = 'SETTLED' and settled_at is not null and released_at is null and expired_at is null)
      or (state = 'RELEASED' and settled_at is null and released_at is not null and expired_at is null)
      or (state = 'EXPIRED' and settled_at is null and released_at is null and expired_at is not null)
    );

create or replace function unimind_private.reserve_usage(
  target_user_id uuid,
  target_action_type text,
  target_reserved_units bigint,
  target_expires_at timestamptz,
  target_idempotency_key text
)
returns unimind_private.usage_reservations
language plpgsql
set search_path = ''
as $$
declare
  reservation unimind_private.usage_reservations%rowtype;
begin
  if target_user_id is null or nullif(btrim(target_action_type), '') is null
     or target_reserved_units is null or target_reserved_units <= 0
     or target_expires_at is null then
    raise exception using errcode = '22023', message = 'usage reservation input is invalid';
  end if;
  if target_idempotency_key is null
     or char_length(target_idempotency_key) not between 8 and 200 then
    raise exception using errcode = '22023', message = 'usage idempotency key is invalid';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('usage-reserve:' || target_idempotency_key, 0)
  );

  select reservations.* into reservation
  from unimind_private.usage_reservations as reservations
  where reservations.idempotency_key = target_idempotency_key
  for update;

  if found then
    if (reservation.user_id, reservation.action_type, reservation.reserved_units,
        reservation.expires_at)
       is distinct from
       (target_user_id, target_action_type, target_reserved_units,
        target_expires_at) then
      raise exception using
        errcode = '23505',
        message = 'idempotency key was reused with different usage input';
    end if;
    return reservation;
  end if;

  insert into unimind_private.usage_reservations (
    user_id,
    action_type,
    reserved_units,
    expires_at,
    idempotency_key
  ) values (
    target_user_id,
    target_action_type,
    target_reserved_units,
    target_expires_at,
    target_idempotency_key
  ) returning * into reservation;

  insert into unimind_private.usage_ledger (
    user_id,
    event_type,
    units,
    related_entity_type,
    related_entity_id,
    idempotency_key
  ) values (
    target_user_id,
    'RESERVED',
    target_reserved_units,
    'USAGE_RESERVATION',
    reservation.id,
    'reserve:' || target_idempotency_key
  );

  return reservation;
end;
$$;

drop function unimind_private.settle_usage(uuid, bigint, timestamptz);

create function unimind_private.settle_usage(
  reservation_id uuid,
  target_settled_units bigint,
  settled_time timestamptz,
  target_idempotency_key text
)
returns unimind_private.usage_reservations
language plpgsql
set search_path = ''
as $$
declare
  reservation unimind_private.usage_reservations%rowtype;
  replay_event unimind_private.usage_ledger%rowtype;
begin
  if reservation_id is null or target_settled_units is null
     or settled_time is null then
    raise exception using errcode = '22023', message = 'usage settlement input is incomplete';
  end if;
  if target_idempotency_key is null
     or char_length(target_idempotency_key) not between 8 and 200 then
    raise exception using errcode = '22023', message = 'usage idempotency key is invalid';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('usage-transition:' || target_idempotency_key, 0)
  );

  select ledger.* into replay_event
  from unimind_private.usage_ledger as ledger
  where ledger.idempotency_key = target_idempotency_key;

  if found then
    if replay_event.event_type <> 'SETTLED'
       or replay_event.related_entity_type <> 'USAGE_RESERVATION'
       or replay_event.related_entity_id <> reservation_id
       or replay_event.units <> target_settled_units then
      raise exception using
        errcode = '23505',
        message = 'idempotency key was reused with different usage transition input';
    end if;
    select reservations.* into reservation
    from unimind_private.usage_reservations as reservations
    where reservations.id = reservation_id;
    return reservation;
  end if;

  select reservations.* into reservation
  from unimind_private.usage_reservations as reservations
  where reservations.id = reservation_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'usage reservation does not exist';
  end if;
  if reservation.state <> 'RESERVED' then
    raise exception using errcode = '23514', message = 'only a reserved usage row can settle';
  end if;
  if target_settled_units < 0 or target_settled_units > reservation.reserved_units then
    raise exception using errcode = '23514', message = 'settled units exceed the reservation';
  end if;
  if settled_time < reservation.created_at then
    raise exception using errcode = '22007', message = 'usage transition time precedes reservation creation';
  end if;
  if reservation.expires_at <= settled_time then
    raise exception using errcode = '23514', message = 'usage reservation has expired';
  end if;

  perform unimind_private.assert_valid_transition(
    'usage_reservation', reservation.state, 'SETTLED'
  );

  update unimind_private.usage_reservations
  set state = 'SETTLED', settled_units = target_settled_units,
      settled_at = settled_time
  where id = reservation.id
  returning * into reservation;

  insert into unimind_private.usage_ledger (
    user_id, event_type, units, related_entity_type, related_entity_id,
    idempotency_key
  ) values (
    reservation.user_id, 'SETTLED', target_settled_units,
    'USAGE_RESERVATION', reservation.id, target_idempotency_key
  );

  if target_settled_units < reservation.reserved_units then
    insert into unimind_private.usage_ledger (
      user_id, event_type, units, related_entity_type, related_entity_id,
      idempotency_key
    ) values (
      reservation.user_id, 'RELEASED',
      reservation.reserved_units - target_settled_units,
      'USAGE_RESERVATION', reservation.id,
      target_idempotency_key || ':unused'
    );
  end if;

  return reservation;
end;
$$;

create function unimind_private.release_usage(
  reservation_id uuid,
  released_time timestamptz,
  target_idempotency_key text
)
returns unimind_private.usage_reservations
language plpgsql
set search_path = ''
as $$
declare
  reservation unimind_private.usage_reservations%rowtype;
  replay_event unimind_private.usage_ledger%rowtype;
begin
  if reservation_id is null or released_time is null then
    raise exception using errcode = '22023', message = 'usage release input is incomplete';
  end if;
  if target_idempotency_key is null
     or char_length(target_idempotency_key) not between 8 and 200 then
    raise exception using errcode = '22023', message = 'usage idempotency key is invalid';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('usage-transition:' || target_idempotency_key, 0)
  );

  select ledger.* into replay_event
  from unimind_private.usage_ledger as ledger
  where ledger.idempotency_key = target_idempotency_key;

  if found then
    if replay_event.event_type <> 'RELEASED'
       or replay_event.related_entity_type <> 'USAGE_RESERVATION'
       or replay_event.related_entity_id <> reservation_id then
      raise exception using
        errcode = '23505',
        message = 'idempotency key was reused with different usage transition input';
    end if;
    select reservations.* into reservation
    from unimind_private.usage_reservations as reservations
    where reservations.id = reservation_id;
    return reservation;
  end if;

  select reservations.* into reservation
  from unimind_private.usage_reservations as reservations
  where reservations.id = reservation_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'usage reservation does not exist';
  end if;
  if reservation.state <> 'RESERVED' then
    raise exception using errcode = '23514', message = 'only a reserved usage row can release';
  end if;
  if released_time < reservation.created_at then
    raise exception using errcode = '22007', message = 'usage transition time precedes reservation creation';
  end if;
  if reservation.expires_at <= released_time then
    raise exception using errcode = '23514', message = 'usage reservation has expired';
  end if;

  perform unimind_private.assert_valid_transition(
    'usage_reservation', reservation.state, 'RELEASED'
  );

  update unimind_private.usage_reservations
  set state = 'RELEASED', released_at = released_time
  where id = reservation.id
  returning * into reservation;

  insert into unimind_private.usage_ledger (
    user_id, event_type, units, related_entity_type, related_entity_id,
    idempotency_key
  ) values (
    reservation.user_id, 'RELEASED', reservation.reserved_units,
    'USAGE_RESERVATION', reservation.id, target_idempotency_key
  );

  return reservation;
end;
$$;

create function unimind_private.expire_usage(
  reservation_id uuid,
  expired_time timestamptz,
  target_idempotency_key text
)
returns unimind_private.usage_reservations
language plpgsql
set search_path = ''
as $$
declare
  reservation unimind_private.usage_reservations%rowtype;
  replay_event unimind_private.usage_ledger%rowtype;
begin
  if reservation_id is null or expired_time is null then
    raise exception using errcode = '22023', message = 'usage expiry input is incomplete';
  end if;
  if target_idempotency_key is null
     or char_length(target_idempotency_key) not between 8 and 200 then
    raise exception using errcode = '22023', message = 'usage idempotency key is invalid';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('usage-transition:' || target_idempotency_key, 0)
  );

  select ledger.* into replay_event
  from unimind_private.usage_ledger as ledger
  where ledger.idempotency_key = target_idempotency_key;

  if found then
    if replay_event.event_type <> 'EXPIRED'
       or replay_event.related_entity_type <> 'USAGE_RESERVATION'
       or replay_event.related_entity_id <> reservation_id then
      raise exception using
        errcode = '23505',
        message = 'idempotency key was reused with different usage transition input';
    end if;
    select reservations.* into reservation
    from unimind_private.usage_reservations as reservations
    where reservations.id = reservation_id;
    return reservation;
  end if;

  select reservations.* into reservation
  from unimind_private.usage_reservations as reservations
  where reservations.id = reservation_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'usage reservation does not exist';
  end if;
  if reservation.state <> 'RESERVED' then
    raise exception using errcode = '23514', message = 'only a reserved usage row can expire';
  end if;
  if expired_time < reservation.created_at then
    raise exception using errcode = '22007', message = 'usage transition time precedes reservation creation';
  end if;
  if expired_time < reservation.expires_at then
    raise exception using errcode = '23514', message = 'usage reservation has not expired';
  end if;

  perform unimind_private.assert_valid_transition(
    'usage_reservation', reservation.state, 'EXPIRED'
  );

  update unimind_private.usage_reservations
  set state = 'EXPIRED', expired_at = expired_time
  where id = reservation.id
  returning * into reservation;

  insert into unimind_private.usage_ledger (
    user_id, event_type, units, related_entity_type, related_entity_id,
    idempotency_key
  ) values (
    reservation.user_id, 'EXPIRED', reservation.reserved_units,
    'USAGE_RESERVATION', reservation.id, target_idempotency_key
  );

  return reservation;
end;
$$;

revoke all on function unimind_private.settle_usage(
  uuid, bigint, timestamptz, text
) from public, anon, authenticated;
revoke all on function unimind_private.release_usage(
  uuid, timestamptz, text
) from public, anon, authenticated;
revoke all on function unimind_private.expire_usage(
  uuid, timestamptz, text
) from public, anon, authenticated;

grant execute on function unimind_private.settle_usage(
  uuid, bigint, timestamptz, text
) to service_role;
grant execute on function unimind_private.release_usage(
  uuid, timestamptz, text
) to service_role;
grant execute on function unimind_private.expire_usage(
  uuid, timestamptz, text
) to service_role;

create function unimind_private.assert_source_version_ready_prerequisites(
  target_source_version_id uuid
)
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if target_source_version_id is null
     or not exists (
       select 1
       from public.source_versions as versions
       where versions.id = target_source_version_id
     )
     or not exists (
       select 1
       from unimind_private.processed_documents as documents
       where documents.source_version_id = target_source_version_id
     )
     or coalesce(
       (
         select reports.overall_result
         from unimind_private.processing_quality_reports as reports
         where reports.source_version_id = target_source_version_id
         order by reports.created_at desc, reports.id desc
         limit 1
       ),
       'MISSING'
     ) <> 'PASS'
     or not exists (
       select 1
       from unimind_private.source_segments as segments
       where segments.source_version_id = target_source_version_id
         and segments.active
     )
     or exists (
       select 1
       from unimind_private.source_segments as segments
       where segments.source_version_id = target_source_version_id
         and segments.active
         and not exists (
           select 1
           from unimind_private.segment_embeddings as embeddings
           join unimind_private.embedding_configs as configurations
             on configurations.id = embeddings.embedding_config_id
           where embeddings.source_segment_id = segments.id
             and configurations.active
         )
     ) then
    raise exception using
      errcode = '23514',
      message = 'source version READY prerequisites are incomplete';
  end if;
end;
$$;

create function unimind_private.enforce_source_version_ready_prerequisites()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.processing_status = 'READY'
     and (tg_op = 'INSERT' or old.processing_status <> 'READY') then
    perform unimind_private.assert_source_version_ready_prerequisites(new.id);
  end if;
  return new;
end;
$$;

create function unimind_private.enforce_ready_source_segment_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (tg_op = 'INSERT' or (not old.active and new.active))
     and new.active
     and exists (
       select 1
       from public.source_versions as versions
       where versions.id = new.source_version_id
         and versions.processing_status = 'READY'
     ) then
    raise exception using
      errcode = '23514',
      message = 'READY source cannot accept an unembedded active segment';
  end if;

  if tg_op = 'UPDATE' and old.active and not new.active
     and exists (
       select 1
       from public.source_versions as versions
       where versions.id = old.source_version_id
         and versions.processing_status = 'READY'
     )
     and not exists (
       select 1
       from unimind_private.source_segments as segments
       where segments.source_version_id = old.source_version_id
         and segments.id <> old.id
         and segments.active
     ) then
    raise exception using
      errcode = '23514',
      message = 'READY source cannot lose its final active segment';
  end if;
  return new;
end;
$$;

create function unimind_private.enforce_ready_quality_report_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.overall_result <> 'PASS'
     and exists (
       select 1
       from public.source_versions as versions
       where versions.id = new.source_version_id
         and versions.processing_status = 'READY'
     ) then
    raise exception using
      errcode = '23514',
      message = 'READY source cannot receive a non-passing quality report';
  end if;
  return new;
end;
$$;

create function unimind_private.enforce_ready_embedding_config_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.active and not new.active
     and exists (
       select 1
       from unimind_private.source_segments as segments
       join public.source_versions as versions
         on versions.id = segments.source_version_id
       join unimind_private.segment_embeddings as embeddings
         on embeddings.source_segment_id = segments.id
        and embeddings.embedding_config_id = old.id
       where segments.active
         and versions.processing_status = 'READY'
         and not exists (
           select 1
           from unimind_private.segment_embeddings as alternative_embeddings
           join unimind_private.embedding_configs as alternative_configurations
             on alternative_configurations.id = alternative_embeddings.embedding_config_id
           where alternative_embeddings.source_segment_id = segments.id
             and alternative_configurations.id <> old.id
             and alternative_configurations.active
         )
     ) then
    raise exception using
      errcode = '23514',
      message = 'READY source cannot lose its active embedding configuration';
  end if;
  return new;
end;
$$;

revoke all on function unimind_private.assert_source_version_ready_prerequisites(uuid)
  from public, anon, authenticated;
revoke all on function unimind_private.enforce_source_version_ready_prerequisites()
  from public, anon, authenticated;
revoke all on function unimind_private.enforce_ready_source_segment_update()
  from public, anon, authenticated;
revoke all on function unimind_private.enforce_ready_quality_report_insert()
  from public, anon, authenticated;
revoke all on function unimind_private.enforce_ready_embedding_config_update()
  from public, anon, authenticated;

grant execute on function unimind_private.assert_source_version_ready_prerequisites(uuid)
  to service_role;

create trigger source_versions_ready_prerequisites
before insert or update of processing_status on public.source_versions
for each row execute function unimind_private.enforce_source_version_ready_prerequisites();

create trigger ready_source_segment_deactivation_guard
before insert or update of active on unimind_private.source_segments
for each row execute function unimind_private.enforce_ready_source_segment_update();

create trigger ready_source_quality_report_guard
before insert on unimind_private.processing_quality_reports
for each row execute function unimind_private.enforce_ready_quality_report_insert();

create trigger ready_embedding_config_deactivation_guard
before update of active on unimind_private.embedding_configs
for each row execute function unimind_private.enforce_ready_embedding_config_update();
