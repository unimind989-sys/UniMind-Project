create table unimind_private.audit_events (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_id uuid not null references public.profiles(user_id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  before_json jsonb,
  after_json jsonb,
  correlation_id uuid not null,
  reason text not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint audit_events_action_check check (action in ('INSERT', 'UPDATE', 'DELETE')),
  constraint audit_events_change_check
    check (before_json is not null or after_json is not null),
  constraint audit_events_reason_check check (nullif(btrim(reason), '') is not null)
);

create table unimind_private.incident_events (
  id uuid primary key default extensions.gen_random_uuid(),
  severity text not null,
  category text not null,
  state text not null default 'OPEN',
  correlation_id uuid not null,
  details_json jsonb not null,
  reason text not null,
  opened_by uuid not null references public.profiles(user_id) on delete restrict,
  opened_at timestamptz not null default transaction_timestamp(),
  resolved_by uuid references public.profiles(user_id) on delete restrict,
  resolved_at timestamptz,
  created_at timestamptz not null default transaction_timestamp(),
  constraint incident_events_severity_check
    check (severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  constraint incident_events_state_check
    check (state in ('OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED')),
  constraint incident_events_reason_check check (nullif(btrim(reason), '') is not null),
  constraint incident_events_resolution_check
    check (
      (state = 'RESOLVED' and resolved_by is not null and resolved_at is not null)
      or (state <> 'RESOLVED' and resolved_by is null and resolved_at is null)
    ),
  constraint incident_events_time_check
    check (opened_at >= created_at and (resolved_at is null or resolved_at >= opened_at))
);

create function unimind_private.append_governance_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_text text;
  authenticated_actor uuid;
  audit_actor uuid;
  audit_reason text;
  correlation_text text;
  audit_correlation uuid;
  row_after jsonb;
  row_before jsonb;
begin
  row_after := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  row_before := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  authenticated_actor := auth.uid();
  actor_text := nullif(current_setting('unimind.actor_id', true), '');

  if actor_text is not null then
    audit_actor := actor_text::uuid;
  else
    audit_actor := coalesce(
      authenticated_actor,
      nullif(row_after ->> 'changed_by', '')::uuid,
      nullif(row_after ->> 'granted_by', '')::uuid,
      nullif(row_after ->> 'invited_by', '')::uuid,
      nullif(row_after ->> 'accepted_by', '')::uuid,
      nullif(row_after ->> 'opened_by', '')::uuid
    );
  end if;

  if audit_actor is null then
    raise exception using errcode = '23514', message = 'governed mutation requires an actor';
  end if;

  if authenticated_actor is not null
     and coalesce(auth.role(), '') <> 'service_role'
     and audit_actor <> authenticated_actor then
    raise exception using errcode = '42501', message = 'governed mutation actor does not match the caller';
  end if;

  audit_reason := coalesce(
    nullif(row_after ->> 'reason', ''),
    nullif(row_after ->> 'grant_reason', ''),
    nullif(row_after ->> 'revoke_reason', ''),
    nullif(current_setting('unimind.audit_reason', true), '')
  );
  if audit_reason is null then
    raise exception using errcode = '23514', message = 'governed mutation requires a reason';
  end if;

  correlation_text := coalesce(
    nullif(row_after ->> 'correlation_id', ''),
    nullif(current_setting('unimind.correlation_id', true), '')
  );
  if correlation_text is null then
    raise exception using errcode = '23514', message = 'governed mutation requires a correlation id';
  end if;
  audit_correlation := correlation_text::uuid;

  insert into unimind_private.audit_events (
    actor_id,
    action,
    entity_type,
    entity_id,
    before_json,
    after_json,
    correlation_id,
    reason
  ) values (
    audit_actor,
    tg_op,
    tg_table_schema || '.' || tg_table_name,
    coalesce(nullif(row_after ->> 'id', ''), nullif(row_before ->> 'id', ''))::uuid,
    row_before,
    row_after,
    audit_correlation,
    audit_reason
  );

  return new;
end;
$$;

create function unimind_private.enforce_incident_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform unimind_private.assert_valid_transition('incident', old.state, new.state);
  return new;
end;
$$;

revoke all on function unimind_private.append_governance_audit()
  from public, anon, authenticated;
revoke all on function unimind_private.enforce_incident_transition()
  from public, anon, authenticated;

create trigger user_roles_governance_audit
after insert or update on public.user_roles
for each row execute function unimind_private.append_governance_audit();

create trigger cohort_releases_governance_audit
after insert or update on public.cohort_releases
for each row execute function unimind_private.append_governance_audit();

create trigger curriculum_units_governance_audit
after update of publication_status, published_at, published_by
on public.curriculum_units
for each row execute function unimind_private.append_governance_audit();

create trigger batch_leader_assignments_governance_audit
after update of status, accepted_at, revoked_at
on public.batch_leader_assignments
for each row execute function unimind_private.append_governance_audit();

create trigger source_versions_governance_audit
after update of rights_status, rights_valid_from, rights_valid_until, activation_status
on public.source_versions
for each row execute function unimind_private.append_governance_audit();

create trigger system_feature_flags_governance_audit
after insert or update on unimind_private.system_feature_flags
for each row execute function unimind_private.append_governance_audit();

create trigger incident_events_transition_check
before update of state on unimind_private.incident_events
for each row execute function unimind_private.enforce_incident_transition();

create trigger incident_events_governance_audit
after insert or update on unimind_private.incident_events
for each row execute function unimind_private.append_governance_audit();

create trigger audit_events_append_only
before update or delete on unimind_private.audit_events
for each row execute function unimind_private.reject_row_mutation();

revoke all on table unimind_private.audit_events from public, anon, authenticated;
revoke all on table unimind_private.incident_events from public, anon, authenticated;
