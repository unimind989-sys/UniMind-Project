create table public.studio_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  cohort_id uuid not null references public.cohorts(id) on delete restrict,
  curriculum_unit_id uuid not null,
  artifact_type text not null,
  language text not null,
  parameters_json jsonb not null default '{}'::jsonb,
  source_scope_hash text not null,
  state text not null default 'QUEUED',
  idempotency_key text not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint studio_requests_unit_scope_fk
    foreign key (curriculum_unit_id, cohort_id)
    references public.curriculum_units(id, cohort_id) on delete restrict,
  constraint studio_requests_idempotency_unique unique (user_id, idempotency_key),
  constraint studio_requests_artifact_type_check
    check (artifact_type in ('SUMMARY', 'STUDY_GUIDE', 'PRACTICE_QUESTIONS', 'FLASHCARDS', 'MCQ_QUIZ', 'REVISION_PACK')),
  constraint studio_requests_language_check check (language in ('EN', 'AR_EG', 'MIXED')),
  constraint studio_requests_scope_hash_check check (source_scope_hash ~ '^sha256:[0-9a-f]{64}$'),
  constraint studio_requests_state_check
    check (state in ('QUEUED', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED')),
  constraint studio_requests_idempotency_key_check
    check (char_length(idempotency_key) between 8 and 200)
);

create table public.studio_artifacts (
  id uuid primary key default extensions.gen_random_uuid(),
  studio_request_id uuid not null references public.studio_requests(id) on delete restrict,
  artifact_type text not null,
  content_json jsonb not null,
  validation_status text not null default 'PENDING',
  policy_version text not null,
  model_version text not null,
  artifact_hash text not null,
  published_at timestamptz,
  invalidated_at timestamptz,
  created_at timestamptz not null default transaction_timestamp(),
  constraint studio_artifacts_request_hash_unique unique (studio_request_id, artifact_hash),
  constraint studio_artifacts_artifact_type_check
    check (artifact_type in ('SUMMARY', 'STUDY_GUIDE', 'PRACTICE_QUESTIONS', 'FLASHCARDS', 'MCQ_QUIZ', 'REVISION_PACK')),
  constraint studio_artifacts_validation_check
    check (validation_status in ('PENDING', 'PASSED', 'FAILED')),
  constraint studio_artifacts_hash_check check (artifact_hash ~ '^sha256:[0-9a-f]{64}$'),
  constraint studio_artifacts_answer_key_separation_check
    check (
      not jsonb_path_exists(content_json, '$.**.answer_key')
      and not jsonb_path_exists(content_json, '$.**.answerKey')
      and not jsonb_path_exists(content_json, '$.**.correct_option')
    ),
  constraint studio_artifacts_publish_validation_check
    check (published_at is null or validation_status = 'PASSED'),
  constraint studio_artifacts_time_check
    check (
      (published_at is null or published_at >= created_at)
      and (invalidated_at is null or invalidated_at >= created_at)
    )
);

create table public.artifact_evidence (
  id uuid primary key default extensions.gen_random_uuid(),
  artifact_id uuid not null references public.studio_artifacts(id) on delete restrict,
  source_segment_id uuid not null
    references unimind_private.source_segments(id) on delete restrict,
  usage_type text not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint artifact_evidence_artifact_segment_unique unique (artifact_id, source_segment_id),
  constraint artifact_evidence_usage_check
    check (usage_type in ('SUPPORT', 'CONFLICT_POSITION', 'SOURCE_SCOPE'))
);

create table public.artifact_validation_results (
  id uuid primary key default extensions.gen_random_uuid(),
  artifact_id uuid not null references public.studio_artifacts(id) on delete restrict,
  validator_version text not null,
  result text not null,
  issues_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default transaction_timestamp(),
  constraint artifact_validation_results_unique unique (artifact_id, validator_version),
  constraint artifact_validation_results_result_check
    check (result in ('PASS', 'FAIL')),
  constraint artifact_validation_results_issues_check check (jsonb_typeof(issues_json) = 'array')
);

create table public.quiz_attempts (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  artifact_id uuid not null references public.studio_artifacts(id) on delete restrict,
  mode text not null,
  started_at timestamptz not null default transaction_timestamp(),
  submitted_at timestamptz,
  score numeric(7, 4),
  result_json jsonb,
  client_idempotency_key text not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint quiz_attempts_user_key_unique unique (user_id, client_idempotency_key),
  constraint quiz_attempts_mode_check check (mode in ('PRACTICE', 'REVIEW')),
  constraint quiz_attempts_score_check check (score is null or score between 0 and 1),
  constraint quiz_attempts_submission_fields_check
    check (
      (submitted_at is null and score is null and result_json is null)
      or (submitted_at is not null and submitted_at >= started_at and score is not null and result_json is not null)
    )
);

create table public.quiz_responses (
  id uuid primary key default extensions.gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete restrict,
  item_key text not null,
  selected_option text,
  correct boolean,
  answered_at timestamptz not null default transaction_timestamp(),
  created_at timestamptz not null default transaction_timestamp(),
  constraint quiz_responses_attempt_item_unique unique (attempt_id, item_key),
  constraint quiz_responses_answered_after_created_check check (answered_at >= created_at)
);

create table unimind_private.quiz_answer_keys (
  id uuid primary key default extensions.gen_random_uuid(),
  artifact_id uuid not null references public.studio_artifacts(id) on delete restrict,
  item_key text not null,
  correct_option text not null,
  explanation text not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint quiz_answer_keys_artifact_item_unique unique (artifact_id, item_key)
);

create function unimind_private.validate_artifact_evidence_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_cohort uuid;
  request_unit uuid;
  segment_cohort uuid;
  segment_unit uuid;
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin')
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception using errcode = '42501', message = 'artifact evidence is server-only';
  end if;

  select requests.cohort_id, requests.curriculum_unit_id
  into request_cohort, request_unit
  from public.studio_artifacts as artifacts
  join public.studio_requests as requests on requests.id = artifacts.studio_request_id
  where artifacts.id = new.artifact_id;

  select segments.cohort_id, segments.curriculum_unit_id
  into segment_cohort, segment_unit
  from unimind_private.source_segments as segments
  where segments.id = new.source_segment_id and segments.active;

  if request_cohort is null or segment_cohort is null
     or (request_cohort, request_unit) is distinct from (segment_cohort, segment_unit) then
    raise exception using errcode = '23514', message = 'artifact evidence is outside the authorized request scope';
  end if;

  return new;
end;
$$;

create function unimind_private.validate_artifact_finalization()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.published_at is not null and not exists (
    select 1 from public.artifact_evidence where artifact_id = new.id
  ) then
    raise exception using errcode = '23514', message = 'published artifact requires evidence links';
  end if;

  if new.published_at is not null and not exists (
    select 1
    from public.artifact_validation_results
    where artifact_id = new.id and result = 'PASS'
  ) then
    raise exception using errcode = '23514', message = 'published artifact requires a passing validation result';
  end if;

  return new;
end;
$$;

revoke all on function unimind_private.validate_artifact_evidence_scope()
  from public, anon, authenticated;
revoke all on function unimind_private.validate_artifact_finalization()
  from public, anon, authenticated;

create trigger artifact_evidence_scope_check
before insert or update on public.artifact_evidence
for each row execute function unimind_private.validate_artifact_evidence_scope();

create trigger artifact_evidence_append_only
before update or delete on public.artifact_evidence
for each row execute function unimind_private.reject_row_mutation();

create trigger artifact_validation_results_append_only
before update or delete on public.artifact_validation_results
for each row execute function unimind_private.reject_row_mutation();

create trigger studio_artifacts_finalization_check
before insert or update on public.studio_artifacts
for each row execute function unimind_private.validate_artifact_finalization();

create trigger quiz_answer_keys_append_only
before update or delete on unimind_private.quiz_answer_keys
for each row execute function unimind_private.reject_row_mutation();

alter table public.studio_requests enable row level security;
alter table public.studio_artifacts enable row level security;
alter table public.artifact_evidence enable row level security;
alter table public.artifact_validation_results enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_responses enable row level security;

revoke all on table public.studio_requests from anon, authenticated;
revoke all on table public.studio_artifacts from anon, authenticated;
revoke all on table public.artifact_evidence from anon, authenticated;
revoke all on table public.artifact_validation_results from anon, authenticated;
revoke all on table public.quiz_attempts from anon, authenticated;
revoke all on table public.quiz_responses from anon, authenticated;
revoke all on table unimind_private.quiz_answer_keys from public, anon, authenticated;
