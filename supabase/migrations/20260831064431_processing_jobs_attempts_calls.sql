create table unimind_private.processing_jobs (
  id uuid primary key default extensions.gen_random_uuid(),
  source_version_id uuid references public.source_versions(id) on delete restrict,
  job_type text not null,
  state text not null default 'QUEUED',
  idempotency_key text not null unique,
  priority integer not null default 100,
  available_at timestamptz not null default transaction_timestamp(),
  lease_owner text,
  lease_expires_at timestamptz,
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  last_error_code text,
  finished_at timestamptz,
  created_at timestamptz not null default transaction_timestamp(),
  constraint processing_jobs_type_check
    check (job_type in ('VALIDATE', 'EXTRACT', 'OCR', 'TRANSCRIBE', 'NORMALIZE', 'QUALITY', 'RAW_DELETE', 'CHUNK', 'EMBED', 'INDEX', 'RECONCILE', 'GENERATE')),
  constraint processing_jobs_state_check
    check (state in ('QUEUED', 'RUNNING', 'RETRYING', 'SUCCEEDED', 'FAILED', 'CANCELLED')),
  constraint processing_jobs_priority_check check (priority between 0 and 1000),
  constraint processing_jobs_attempt_count_check
    check (attempt_count >= 0 and max_attempts > 0 and attempt_count <= max_attempts),
  constraint processing_jobs_lease_state_check
    check (
      (state = 'RUNNING' and lease_owner is not null and lease_expires_at is not null)
      or (state <> 'RUNNING' and lease_owner is null and lease_expires_at is null)
    ),
  constraint processing_jobs_finished_state_check
    check (
      (state in ('SUCCEEDED', 'FAILED', 'CANCELLED')) = (finished_at is not null)
    )
);

create table unimind_private.job_dependencies (
  id uuid primary key default extensions.gen_random_uuid(),
  job_id uuid not null
    references unimind_private.processing_jobs(id) on delete restrict,
  depends_on_job_id uuid not null
    references unimind_private.processing_jobs(id) on delete restrict,
  created_at timestamptz not null default transaction_timestamp(),
  constraint job_dependencies_pair_unique unique (job_id, depends_on_job_id),
  constraint job_dependencies_not_self_check check (job_id <> depends_on_job_id)
);

create table unimind_private.job_attempts (
  id uuid primary key default extensions.gen_random_uuid(),
  job_id uuid not null
    references unimind_private.processing_jobs(id) on delete restrict,
  attempt_number integer not null,
  lease_owner text not null,
  started_at timestamptz not null default transaction_timestamp(),
  heartbeat_at timestamptz,
  finished_at timestamptz,
  outcome text,
  error_code text,
  error_detail jsonb,
  created_at timestamptz not null default transaction_timestamp(),
  constraint job_attempts_number_unique unique (job_id, attempt_number),
  constraint job_attempts_number_check check (attempt_number > 0),
  constraint job_attempts_outcome_check
    check (outcome is null or outcome in ('SUCCEEDED', 'RETRYABLE_FAILURE', 'TERMINAL_FAILURE', 'CANCELLED', 'LEASE_EXPIRED')),
  constraint job_attempts_finished_fields_check
    check ((finished_at is null and outcome is null) or (finished_at is not null and outcome is not null)),
  constraint job_attempts_error_fields_check
    check (outcome not in ('RETRYABLE_FAILURE', 'TERMINAL_FAILURE') or error_code is not null)
);

create table unimind_private.provider_calls (
  id uuid primary key default extensions.gen_random_uuid(),
  correlation_id uuid not null,
  job_id uuid references unimind_private.processing_jobs(id) on delete restrict,
  action_type text not null,
  provider text not null,
  model_version text not null,
  provider_request_id text,
  input_units bigint not null default 0,
  output_units bigint not null default 0,
  duration_ms bigint not null,
  attempt_number integer not null,
  status text not null,
  calculated_cost numeric(20, 6) not null default 0,
  currency_code text,
  created_at timestamptz not null default transaction_timestamp(),
  constraint provider_calls_units_check check (input_units >= 0 and output_units >= 0),
  constraint provider_calls_duration_check check (duration_ms >= 0),
  constraint provider_calls_attempt_check check (attempt_number > 0),
  constraint provider_calls_status_check
    check (status in ('SUCCEEDED', 'RETRYABLE_FAILURE', 'TERMINAL_FAILURE', 'TIMEOUT_UNKNOWN')),
  constraint provider_calls_cost_check check (calculated_cost >= 0),
  constraint provider_calls_currency_check
    check (
      (calculated_cost = 0 and currency_code is null)
      or (calculated_cost > 0 and currency_code ~ '^[A-Z]{3}$')
    )
);

create unique index provider_calls_request_unique
  on unimind_private.provider_calls (provider, provider_request_id)
  where provider_request_id is not null;

create table unimind_private.processing_quality_reports (
  id uuid primary key default extensions.gen_random_uuid(),
  source_version_id uuid not null
    references public.source_versions(id) on delete restrict,
  coverage_ratio numeric(6, 5) not null,
  locator_coverage_ratio numeric(6, 5) not null,
  low_confidence_count integer not null,
  terminology_sample_result text not null,
  duplicate_ratio numeric(6, 5) not null,
  raw_deletion_state text not null,
  overall_result text not null,
  report_json jsonb not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint processing_quality_reports_ratios_check
    check (
      coverage_ratio between 0 and 1
      and locator_coverage_ratio between 0 and 1
      and duplicate_ratio between 0 and 1
    ),
  constraint processing_quality_reports_confidence_check check (low_confidence_count >= 0),
  constraint processing_quality_reports_terminology_check
    check (terminology_sample_result in ('PASS', 'FAIL', 'NOT_APPLICABLE')),
  constraint processing_quality_reports_raw_deletion_check
    check (raw_deletion_state in ('NOT_DUE', 'PENDING', 'VERIFIED', 'FAILED', 'HELD')),
  constraint processing_quality_reports_result_check
    check (overall_result in ('PASS', 'FAIL', 'NEEDS_REVIEW'))
);

create function unimind_private.claim_processing_job(
  worker_id text,
  claimed_at timestamptz,
  lease_duration interval
)
returns setof unimind_private.processing_jobs
language plpgsql
set search_path = ''
as $$
declare
  claimed_job unimind_private.processing_jobs%rowtype;
begin
  if nullif(btrim(worker_id), '') is null then
    raise exception using errcode = '22023', message = 'worker_id is required';
  end if;
  if lease_duration <= interval '0 seconds' or lease_duration > interval '15 minutes' then
    raise exception using errcode = '22023', message = 'lease_duration is outside the allowed range';
  end if;

  select jobs.*
  into claimed_job
  from unimind_private.processing_jobs as jobs
  where jobs.state in ('QUEUED', 'RETRYING')
    and jobs.available_at <= claimed_at
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

  return next claimed_job;
end;
$$;

revoke all on function unimind_private.claim_processing_job(text, timestamptz, interval)
  from public, anon, authenticated;

create trigger job_attempts_append_only
before update or delete on unimind_private.job_attempts
for each row execute function unimind_private.reject_row_mutation();

create trigger provider_calls_append_only
before update or delete on unimind_private.provider_calls
for each row execute function unimind_private.reject_row_mutation();

create trigger processing_quality_reports_append_only
before update or delete on unimind_private.processing_quality_reports
for each row execute function unimind_private.reject_row_mutation();

revoke all on table unimind_private.processing_jobs from public, anon, authenticated;
revoke all on table unimind_private.job_dependencies from public, anon, authenticated;
revoke all on table unimind_private.job_attempts from public, anon, authenticated;
revoke all on table unimind_private.provider_calls from public, anon, authenticated;
revoke all on table unimind_private.processing_quality_reports from public, anon, authenticated;
