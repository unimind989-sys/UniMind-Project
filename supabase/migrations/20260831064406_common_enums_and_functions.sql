create type public.user_role as enum ('STUDENT', 'BATCH_LEADER', 'ADMIN');
create type public.curriculum_unit_type as enum ('MODULE', 'SUBJECT');

create function unimind_private.is_valid_transition(
  transition_kind text,
  prior_state text,
  next_state text
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case transition_kind
    when 'account' then
      (prior_state, next_state) in (
        ('PENDING', 'ACTIVE'),
        ('PENDING', 'DISABLED'),
        ('ACTIVE', 'SUSPENDED'),
        ('ACTIVE', 'DISABLED'),
        ('SUSPENDED', 'ACTIVE'),
        ('SUSPENDED', 'DISABLED')
      )
    when 'publication' then
      (prior_state, next_state) in (
        ('DRAFT', 'PUBLISHED'),
        ('PUBLISHED', 'WITHDRAWN'),
        ('WITHDRAWN', 'PUBLISHED')
      )
    when 'release' then
      (prior_state, next_state) in (
        ('LOCKED', 'UNLOCKED'),
        ('UNLOCKED', 'LOCKED')
      )
    when 'source_processing' then
      (prior_state, next_state) in (
        ('RECEIVED', 'VALIDATING'),
        ('VALIDATING', 'PROCESSING'),
        ('VALIDATING', 'REJECTED'),
        ('PROCESSING', 'NEEDS_REVIEW'),
        ('PROCESSING', 'READY'),
        ('PROCESSING', 'FAILED'),
        ('NEEDS_REVIEW', 'PROCESSING'),
        ('NEEDS_REVIEW', 'REJECTED'),
        ('FAILED', 'PROCESSING'),
        ('READY', 'NEEDS_REVIEW')
      )
    when 'raw_object' then
      (prior_state, next_state) in (
        ('PENDING', 'STORED'),
        ('PENDING', 'FAILED'),
        ('STORED', 'DELETE_PENDING'),
        ('STORED', 'HELD'),
        ('DELETE_PENDING', 'DELETED'),
        ('DELETE_PENDING', 'DELETE_FAILED'),
        ('DELETE_FAILED', 'DELETE_PENDING'),
        ('HELD', 'STORED')
      )
    when 'job' then
      (prior_state, next_state) in (
        ('QUEUED', 'RUNNING'),
        ('RETRYING', 'RUNNING'),
        ('RUNNING', 'SUCCEEDED'),
        ('RUNNING', 'RETRYING'),
        ('RUNNING', 'FAILED'),
        ('RUNNING', 'CANCELLED'),
        ('RETRYING', 'FAILED'),
        ('QUEUED', 'CANCELLED')
      )
    when 'usage_reservation' then
      (prior_state, next_state) in (
        ('RESERVED', 'SETTLED'),
        ('RESERVED', 'RELEASED'),
        ('RESERVED', 'EXPIRED')
      )
    when 'incident' then
      (prior_state, next_state) in (
        ('OPEN', 'INVESTIGATING'),
        ('OPEN', 'RESOLVED'),
        ('INVESTIGATING', 'MITIGATED'),
        ('INVESTIGATING', 'RESOLVED'),
        ('MITIGATED', 'RESOLVED'),
        ('RESOLVED', 'OPEN')
      )
    else false
  end;
$$;

create function unimind_private.assert_valid_transition(
  transition_kind text,
  prior_state text,
  next_state text
)
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if prior_state = next_state then
    return;
  end if;

  if not unimind_private.is_valid_transition(
    transition_kind,
    prior_state,
    next_state
  ) then
    raise exception using
      errcode = '23514',
      message = format(
        'invalid %s transition from %s to %s',
        transition_kind,
        prior_state,
        next_state
      );
  end if;
end;
$$;

create function unimind_private.reject_row_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = format('%s is append-only', tg_table_schema || '.' || tg_table_name);
end;
$$;

revoke all on function unimind_private.is_valid_transition(text, text, text)
  from public, anon, authenticated;
revoke all on function unimind_private.assert_valid_transition(text, text, text)
  from public, anon, authenticated;
revoke all on function unimind_private.reject_row_mutation()
  from public, anon, authenticated;
