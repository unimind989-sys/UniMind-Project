create function public.record_privileged_auth_action(
  p_actor_user_id uuid,
  p_action_name text,
  p_action_outcome text,
  p_correlation_id uuid,
  p_reason text,
  p_target_user_id uuid default null,
  p_provider_error_code text default null
)
returns uuid
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  audit_event_id uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and current_user not in ('postgres', 'supabase_admin') then
    raise exception using
      errcode = '42501',
      message = 'privileged Auth audit requires the service role';
  end if;

  if p_action_name not in (
    'CREATE_SYNTHETIC_USER',
    'DELETE_SYNTHETIC_USER'
  ) then
    raise exception using
      errcode = '22023',
      message = 'privileged Auth action is invalid';
  end if;

  if p_action_outcome not in ('STARTED', 'SUCCEEDED', 'FAILED') then
    raise exception using
      errcode = '22023',
      message = 'privileged Auth outcome is invalid';
  end if;

  if nullif(btrim(p_reason), '') is null or char_length(p_reason) > 500 then
    raise exception using
      errcode = '22023',
      message = 'privileged Auth audit reason is invalid';
  end if;

  if p_provider_error_code is not null
     and p_provider_error_code !~ '^[a-z0-9_]{1,64}$' then
    raise exception using
      errcode = '22023',
      message = 'privileged Auth provider error code is invalid';
  end if;

  if not exists (
    select 1
    from public.profiles as profiles
    join public.user_roles as roles
      on roles.user_id = profiles.user_id
    where profiles.user_id = p_actor_user_id
      and profiles.account_status = 'ACTIVE'
      and roles.role = 'ADMIN'
      and roles.revoked_at is null
  ) then
    raise exception using
      errcode = '42501',
      message = 'privileged Auth audit actor is not an active administrator';
  end if;

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
    p_actor_user_id,
    'INSERT',
    'privileged.auth',
    coalesce(p_target_user_id, p_correlation_id),
    null,
    jsonb_strip_nulls(
      jsonb_build_object(
        'action', p_action_name,
        'outcome', p_action_outcome,
        'target_user_id', p_target_user_id,
        'provider_error_code', p_provider_error_code
      )
    ),
    p_correlation_id,
    btrim(p_reason)
  )
  returning id into audit_event_id;

  return audit_event_id;
end;
$$;

revoke all on function public.record_privileged_auth_action(
  uuid,
  text,
  text,
  uuid,
  text,
  uuid,
  text
) from public, anon, authenticated;
grant execute on function public.record_privileged_auth_action(
  uuid,
  text,
  text,
  uuid,
  text,
  uuid,
  text
) to service_role;
