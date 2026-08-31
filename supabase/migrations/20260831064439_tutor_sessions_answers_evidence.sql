create table public.chat_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  cohort_id uuid not null references public.cohorts(id) on delete restrict,
  curriculum_unit_id uuid not null,
  language_mode text not null,
  retention_mode text not null,
  closed_at timestamptz,
  created_at timestamptz not null default transaction_timestamp(),
  constraint chat_sessions_unit_scope_fk
    foreign key (curriculum_unit_id, cohort_id)
    references public.curriculum_units(id, cohort_id) on delete restrict,
  constraint chat_sessions_language_check check (language_mode in ('EN', 'AR_EG', 'MIXED')),
  constraint chat_sessions_retention_check check (retention_mode in ('MINIMAL', 'HISTORY', 'DISABLED')),
  constraint chat_sessions_closed_after_created_check
    check (closed_at is null or closed_at >= created_at)
);

create table public.chat_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete restrict,
  role text not null,
  content text not null,
  retained_until timestamptz,
  created_at timestamptz not null default transaction_timestamp(),
  constraint chat_messages_role_check check (role in ('USER', 'ASSISTANT', 'SYSTEM_EVENT')),
  constraint chat_messages_content_check check (nullif(btrim(content), '') is not null),
  constraint chat_messages_retention_check
    check (retained_until is null or retained_until >= created_at)
);

create table public.chat_answers (
  id uuid primary key default extensions.gen_random_uuid(),
  assistant_message_id uuid not null unique
    references public.chat_messages(id) on delete restrict,
  evidence_status text not null,
  validation_status text not null default 'PENDING',
  policy_version text not null,
  model_version text not null,
  conflict_detected boolean not null default false,
  finalized_at timestamptz,
  created_at timestamptz not null default transaction_timestamp(),
  constraint chat_answers_evidence_status_check
    check (evidence_status in ('FULL', 'PARTIAL', 'UNAVAILABLE', 'CONFLICTING')),
  constraint chat_answers_validation_status_check
    check (validation_status in ('PENDING', 'PASSED', 'FAILED')),
  constraint chat_answers_conflict_check
    check ((evidence_status = 'CONFLICTING') = conflict_detected),
  constraint chat_answers_finalized_check
    check (
      (finalized_at is null and validation_status = 'PENDING')
      or (finalized_at is not null and validation_status in ('PASSED', 'FAILED') and finalized_at >= created_at)
    )
);

create table public.answer_evidence (
  id uuid primary key default extensions.gen_random_uuid(),
  answer_id uuid not null references public.chat_answers(id) on delete restrict,
  source_segment_id uuid not null
    references unimind_private.source_segments(id) on delete restrict,
  rank integer not null,
  usage_type text not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint answer_evidence_answer_segment_unique unique (answer_id, source_segment_id),
  constraint answer_evidence_answer_rank_unique unique (answer_id, rank),
  constraint answer_evidence_rank_check check (rank > 0),
  constraint answer_evidence_usage_check
    check (usage_type in ('SUPPORT', 'CONFLICT_POSITION', 'CONTEXT'))
);

create table public.feedback_reports (
  id uuid primary key default extensions.gen_random_uuid(),
  reporter_id uuid not null references public.profiles(user_id) on delete restrict,
  entity_type text not null,
  entity_id uuid not null,
  category text not null,
  description text not null,
  status text not null default 'OPEN',
  created_at timestamptz not null default transaction_timestamp(),
  constraint feedback_reports_entity_type_check
    check (entity_type in ('CHAT_MESSAGE', 'CHAT_ANSWER', 'STUDIO_ARTIFACT', 'CURRICULUM_UNIT')),
  constraint feedback_reports_category_check
    check (category in ('INCORRECT', 'UNSUPPORTED', 'MISSING_EVIDENCE', 'CONFLICT', 'SAFETY', 'OTHER')),
  constraint feedback_reports_status_check
    check (status in ('OPEN', 'TRIAGED', 'RESOLVED', 'DISMISSED')),
  constraint feedback_reports_description_check check (nullif(btrim(description), '') is not null)
);

create function unimind_private.validate_answer_evidence_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  answer_cohort uuid;
  answer_unit uuid;
  segment_cohort uuid;
  segment_unit uuid;
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin')
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception using errcode = '42501', message = 'answer evidence is server-only';
  end if;

  select sessions.cohort_id, sessions.curriculum_unit_id
  into answer_cohort, answer_unit
  from public.chat_answers as answers
  join public.chat_messages as messages on messages.id = answers.assistant_message_id
  join public.chat_sessions as sessions on sessions.id = messages.session_id
  where answers.id = new.answer_id;

  select segments.cohort_id, segments.curriculum_unit_id
  into segment_cohort, segment_unit
  from unimind_private.source_segments as segments
  where segments.id = new.source_segment_id and segments.active;

  if answer_cohort is null or segment_cohort is null
     or (answer_cohort, answer_unit) is distinct from (segment_cohort, segment_unit) then
    raise exception using errcode = '23514', message = 'answer evidence is outside the authorized session scope';
  end if;

  return new;
end;
$$;

create function unimind_private.validate_final_answer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.finalized_at is not null
     and new.evidence_status in ('FULL', 'PARTIAL', 'CONFLICTING')
     and not exists (
       select 1 from public.answer_evidence where answer_id = new.id
     ) then
    raise exception using errcode = '23514', message = 'grounded final answer requires evidence links';
  end if;

  if new.finalized_at is not null
     and new.evidence_status = 'UNAVAILABLE'
     and exists (
       select 1 from public.answer_evidence where answer_id = new.id
     ) then
    raise exception using errcode = '23514', message = 'unavailable answer cannot retain evidence links';
  end if;

  return new;
end;
$$;

revoke all on function unimind_private.validate_answer_evidence_scope()
  from public, anon, authenticated;
revoke all on function unimind_private.validate_final_answer()
  from public, anon, authenticated;

create trigger answer_evidence_scope_check
before insert or update on public.answer_evidence
for each row execute function unimind_private.validate_answer_evidence_scope();

create trigger answer_evidence_append_only
before update or delete on public.answer_evidence
for each row execute function unimind_private.reject_row_mutation();

create trigger chat_answers_finalization_check
before insert or update on public.chat_answers
for each row execute function unimind_private.validate_final_answer();

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_answers enable row level security;
alter table public.answer_evidence enable row level security;
alter table public.feedback_reports enable row level security;

revoke all on table public.chat_sessions from anon, authenticated;
revoke all on table public.chat_messages from anon, authenticated;
revoke all on table public.chat_answers from anon, authenticated;
revoke all on table public.answer_evidence from anon, authenticated;
revoke all on table public.feedback_reports from anon, authenticated;
