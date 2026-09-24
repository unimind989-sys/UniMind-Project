alter table public.curriculum_units
  add column governance_version integer not null default 1,
  add constraint curriculum_units_governance_version_check check (governance_version > 0);

alter table public.cohort_releases
  add column governance_version integer not null default 1,
  add constraint cohort_releases_governance_version_check check (governance_version > 0);

alter table public.source_versions
  add column governance_state text not null default 'AVAILABLE',
  add column governance_version integer not null default 1,
  drop constraint source_versions_ready_gate_check,
  add constraint source_versions_ready_gate_check
    check (processing_status <> 'READY' or accepted_at is not null),
  add constraint source_versions_governance_state_check
    check (governance_state in ('AVAILABLE', 'QUARANTINED')),
  add constraint source_versions_governance_version_check
    check (governance_version > 0);

alter table unimind_private.raw_objects
  add column governance_version integer not null default 1,
  add constraint raw_objects_governance_version_check check (governance_version > 0);

alter table unimind_private.system_feature_flags
  add column governance_version integer not null default 1,
  add constraint system_feature_flags_governance_version_check
    check (governance_version > 0);

create table unimind_private.founder_principals (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null unique references public.profiles(user_id) on delete restrict,
  founder_slot text not null unique,
  verified_at timestamptz not null,
  active boolean not null default true,
  verification_reason text not null,
  verified_by uuid not null references public.profiles(user_id) on delete restrict,
  correlation_id uuid not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint founder_principals_slot_check check (founder_slot in ('AHMED', 'ZIAD')),
  constraint founder_principals_reason_check
    check (nullif(btrim(verification_reason), '') is not null)
);

create index founder_principals_verified_by_idx
  on unimind_private.founder_principals (verified_by);

create table unimind_private.admin_mock_artifact_approvals (
  id uuid primary key default extensions.gen_random_uuid(),
  flag_key text not null,
  runtime_environment text not null,
  dependency_sha256 text not null,
  approved_by uuid not null references public.profiles(user_id) on delete restrict,
  reason text not null,
  correlation_id uuid not null,
  approved_at timestamptz not null default transaction_timestamp(),
  created_at timestamptz not null default transaction_timestamp(),
  constraint admin_mock_artifact_approvals_identity_unique
    unique (flag_key, runtime_environment, dependency_sha256),
  constraint admin_mock_artifact_approvals_flag_check
    check (flag_key ~ '^mock\.artifact\.[a-z][a-z0-9_]*$'),
  constraint admin_mock_artifact_approvals_environment_check
    check (runtime_environment in ('local', 'ci', 'preview', 'production')),
  constraint admin_mock_artifact_approvals_digest_check
    check (dependency_sha256 ~ '^[0-9a-f]{64}$'),
  constraint admin_mock_artifact_approvals_reason_check
    check (nullif(btrim(reason), '') is not null)
);

create index admin_mock_artifact_approvals_approved_by_idx
  on unimind_private.admin_mock_artifact_approvals (approved_by);

create table unimind_private.admin_action_commands (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_id uuid not null references public.profiles(user_id) on delete restrict,
  action text not null,
  target_id uuid not null,
  expected_version integer not null,
  expected_state text not null,
  current_state text not null,
  proposed_state text not null,
  target_label_en text not null,
  target_label_ar text not null,
  failed_predicates text[] not null default array[]::text[],
  protected boolean not null default false,
  pending_action_id uuid references unimind_private.admin_action_commands(id) on delete restrict,
  command_state text not null default 'STARTED',
  reason text not null,
  correlation_id uuid not null,
  idempotency_key uuid not null,
  payload_sha256 text not null,
  prerequisite_sha256 text,
  result_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default transaction_timestamp(),
  updated_at timestamptz not null default transaction_timestamp(),
  constraint admin_action_commands_actor_key_unique unique (actor_id, idempotency_key),
  constraint admin_action_commands_action_check check (action in (
    'PUBLISH_UNIT', 'HIDE_UNIT', 'UNLOCK_COHORT', 'LOCK_COHORT',
    'ACTIVATE_SOURCE', 'DEACTIVATE_SOURCE', 'QUARANTINE_SOURCE', 'RETRY_SOURCE',
    'PLACE_RAW_HOLD', 'REMOVE_RAW_HOLD', 'ENABLE_FLAG', 'DISABLE_FLAG'
  )),
  constraint admin_action_commands_version_check check (expected_version >= 0),
  constraint admin_action_commands_state_check check (command_state in (
    'STARTED', 'PENDING_SECOND_CONFIRMATION', 'PENDING_OWNER_REVIEW',
    'APPLIED', 'STALE', 'EXPIRED'
  )),
  constraint admin_action_commands_reason_check
    check (char_length(btrim(reason)) between 8 and 500),
  constraint admin_action_commands_hash_check check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  constraint admin_action_commands_prerequisite_hash_check
    check (prerequisite_sha256 is null or prerequisite_sha256 ~ '^[0-9a-f]{64}$'),
  constraint admin_action_commands_updated_check check (updated_at >= created_at)
);

create index admin_action_commands_pending_action_id_idx
  on unimind_private.admin_action_commands (pending_action_id);

create unique index admin_action_commands_one_pending_retry
  on unimind_private.admin_action_commands (target_id)
  where action = 'RETRY_SOURCE'
    and command_state in ('PENDING_OWNER_REVIEW', 'APPLIED');

create index admin_action_commands_pending_queue
  on unimind_private.admin_action_commands (created_at, id)
  where command_state in ('PENDING_SECOND_CONFIRMATION', 'PENDING_OWNER_REVIEW');

create table unimind_private.admin_action_confirmations (
  id uuid primary key default extensions.gen_random_uuid(),
  command_id uuid not null
    references unimind_private.admin_action_commands(id) on delete restrict,
  actor_id uuid not null references public.profiles(user_id) on delete restrict,
  founder_slot text not null,
  reason text not null,
  correlation_id uuid not null,
  confirmed_at timestamptz not null default transaction_timestamp(),
  created_at timestamptz not null default transaction_timestamp(),
  constraint admin_action_confirmations_actor_unique unique (command_id, actor_id),
  constraint admin_action_confirmations_slot_unique unique (command_id, founder_slot),
  constraint admin_action_confirmations_slot_check check (founder_slot in ('AHMED', 'ZIAD')),
  constraint admin_action_confirmations_reason_check
    check (char_length(btrim(reason)) between 8 and 500)
);

create index admin_action_confirmations_actor_id_idx
  on unimind_private.admin_action_confirmations (actor_id);

create table unimind_private.raw_data_holds (
  id uuid primary key default extensions.gen_random_uuid(),
  raw_object_id uuid not null references unimind_private.raw_objects(id) on delete restrict,
  prior_status text not null default 'STORED',
  status text not null default 'ACTIVE',
  reason text not null,
  expires_at timestamptz not null,
  reviewed_by uuid not null references public.profiles(user_id) on delete restrict,
  reviewed_at timestamptz not null,
  placed_by uuid not null references public.profiles(user_id) on delete restrict,
  placed_at timestamptz not null default transaction_timestamp(),
  removed_by uuid references public.profiles(user_id) on delete restrict,
  removed_at timestamptz,
  correlation_id uuid not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint raw_data_holds_status_check check (status in ('ACTIVE', 'REMOVED')),
  constraint raw_data_holds_prior_status_check check (prior_status = 'STORED'),
  constraint raw_data_holds_reason_check
    check (char_length(btrim(reason)) between 8 and 500),
  constraint raw_data_holds_review_check check (reviewed_at >= placed_at),
  constraint raw_data_holds_removal_fields_check
    check ((status = 'ACTIVE' and removed_by is null and removed_at is null)
      or (status = 'REMOVED' and removed_by is not null and removed_at is not null)),
  constraint raw_data_holds_removed_after_placed_check
    check (removed_at is null or removed_at >= placed_at)
);

create index raw_data_holds_reviewed_by_idx
  on unimind_private.raw_data_holds (reviewed_by);
create index raw_data_holds_placed_by_idx
  on unimind_private.raw_data_holds (placed_by);
create index raw_data_holds_removed_by_idx
  on unimind_private.raw_data_holds (removed_by);

create unique index raw_data_holds_one_active_per_object
  on unimind_private.raw_data_holds (raw_object_id)
  where status = 'ACTIVE';

create function unimind_private.enforce_admin_command_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and old.command_state <> new.command_state and not (
    (old.command_state = 'STARTED' and new.command_state in (
      'PENDING_SECOND_CONFIRMATION', 'PENDING_OWNER_REVIEW', 'APPLIED'
    ))
    or (old.command_state = 'PENDING_SECOND_CONFIRMATION' and new.command_state in (
      'APPLIED', 'STALE', 'EXPIRED'
    ))
  ) then
    raise exception using errcode = '23514', message = 'invalid admin command transition';
  end if;
  return new;
end;
$$;

revoke all on function unimind_private.enforce_admin_command_transition()
  from public, anon, authenticated;

create trigger founder_principals_governance_audit
after insert or update on unimind_private.founder_principals
for each row execute function unimind_private.append_governance_audit();

create trigger admin_mock_artifact_approvals_governance_audit
after insert or update on unimind_private.admin_mock_artifact_approvals
for each row execute function unimind_private.append_governance_audit();

create trigger admin_action_commands_transition_check
before update on unimind_private.admin_action_commands
for each row execute function unimind_private.enforce_admin_command_transition();

create trigger admin_action_commands_governance_audit
after insert or update on unimind_private.admin_action_commands
for each row execute function unimind_private.append_governance_audit();

create trigger admin_action_confirmations_governance_audit
after insert on unimind_private.admin_action_confirmations
for each row execute function unimind_private.append_governance_audit();

create trigger raw_data_holds_governance_audit
after insert or update on unimind_private.raw_data_holds
for each row execute function unimind_private.append_governance_audit();

drop trigger source_versions_governance_audit on public.source_versions;

create trigger source_versions_governance_audit
after update of rights_status, rights_valid_from, rights_valid_until,
  activation_status, governance_state, governance_version
on public.source_versions
for each row execute function unimind_private.append_governance_audit();

alter table unimind_private.founder_principals enable row level security;
alter table unimind_private.admin_mock_artifact_approvals enable row level security;
alter table unimind_private.admin_action_commands enable row level security;
alter table unimind_private.admin_action_confirmations enable row level security;
alter table unimind_private.raw_data_holds enable row level security;

revoke all on table unimind_private.founder_principals from public, anon, authenticated;
revoke all on table unimind_private.admin_mock_artifact_approvals from public, anon, authenticated;
revoke all on table unimind_private.admin_action_commands from public, anon, authenticated;
revoke all on table unimind_private.admin_action_confirmations from public, anon, authenticated;
revoke all on table unimind_private.raw_data_holds from public, anon, authenticated;

create function unimind_private.admin_source_predicates(
  target_source_version_id uuid,
  expected_edition text,
  require_active boolean default false
)
returns text[]
language sql
stable
security definer
set search_path = ''
as $$
  select array_remove(array[
    case when versions.id is null or versions.processing_status <> 'READY'
      or versions.accepted_at is null then 'source.ready' end,
    case when require_active and versions.activation_status <> 'ACTIVE'
      then 'source.active' end,
    case when versions.id is null or versions.rights_status <> 'VALID'
      or versions.rights_valid_from is null
      or versions.rights_valid_from > transaction_timestamp()
      or (versions.rights_valid_until is not null
        and versions.rights_valid_until <= transaction_timestamp())
      then 'source.rights_current' end,
    case when versions.id is null or versions.curriculum_edition is distinct from expected_edition
      then 'source.edition_matches' end,
    case when versions.id is null or versions.governance_state <> 'AVAILABLE'
      then 'source.not_quarantined' end
  ], null::text)
  from (select target_source_version_id as id) as target
  left join public.source_versions as versions on versions.id = target.id;
$$;

create function unimind_private.admin_raw_safety_check(target_raw_object_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from unimind_private.raw_objects as raw
    join public.source_versions as versions on versions.id = raw.source_version_id
    where raw.id = target_raw_object_id
      and raw.provider = 'mock-object-storage-provider'
      and raw.object_key like 'synthetic/%'
      and raw.status = 'HELD'
      and versions.processing_status = 'READY'
      and versions.accepted_at is not null
      and exists (
        select 1 from unimind_private.processed_documents as documents
        where documents.source_version_id = versions.id
      )
      and coalesce((
        select reports.overall_result
        from unimind_private.processing_quality_reports as reports
        where reports.source_version_id = versions.id
        order by reports.created_at desc, reports.id desc limit 1
      ), 'MISSING') = 'PASS'
      and exists (
        select 1 from unimind_private.source_segments as segments
        where segments.source_version_id = versions.id and segments.active
      )
      and not exists (
        select 1
        from unimind_private.source_segments as segments
        where segments.source_version_id = versions.id and segments.active
          and not exists (
            select 1
            from unimind_private.segment_embeddings as embeddings
            join unimind_private.embedding_configs as configurations
              on configurations.id = embeddings.embedding_config_id
            where embeddings.source_segment_id = segments.id and configurations.active
          )
      )
  );
$$;

revoke all on function unimind_private.admin_source_predicates(uuid, text, boolean)
  from public, anon, authenticated;
revoke all on function unimind_private.admin_raw_safety_check(uuid)
  from public, anon, authenticated;

create function unimind_private.admin_candidate_fingerprint(
  target_action text,
  target_id uuid,
  p_runtime_environment text
)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  scope_rows jsonb;
  raw_source_id uuid;
begin
  case target_action
    when 'PUBLISH_UNIT' then
      select jsonb_build_object(
        'unit', jsonb_build_array(units.id, units.xmin::text),
        'cohort', jsonb_build_array(cohorts.id, cohorts.xmin::text),
        'sources', (
          select coalesce(jsonb_agg(
            jsonb_build_array(assets.id, assets.xmin::text,
              versions.id, versions.xmin::text)
            order by assets.id, versions.id
          ), '[]'::jsonb)
          from public.source_assets as assets
          left join public.source_versions as versions on versions.source_asset_id = assets.id
          where assets.curriculum_unit_id = units.id
        )
      ) into scope_rows
      from public.curriculum_units as units
      join public.cohorts as cohorts on cohorts.id = units.cohort_id
      where units.id = target_id;

    when 'UNLOCK_COHORT' then
      select jsonb_build_object(
        'cohort', jsonb_build_array(cohorts.id, cohorts.xmin::text),
        'units', (
          select coalesce(jsonb_agg(
            jsonb_build_array(units.id, units.xmin::text)
            order by units.id
          ), '[]'::jsonb)
          from public.curriculum_units as units where units.cohort_id = cohorts.id
        ),
        'sources', (
          select coalesce(jsonb_agg(
            jsonb_build_array(assets.id, assets.xmin::text,
              versions.id, versions.xmin::text)
            order by assets.id, versions.id
          ), '[]'::jsonb)
          from public.source_assets as assets
          left join public.source_versions as versions on versions.source_asset_id = assets.id
          where assets.cohort_id = cohorts.id
        )
      ) into scope_rows
      from public.cohorts as cohorts where cohorts.id = target_id;

    when 'ACTIVATE_SOURCE' then
      select jsonb_build_object(
        'source', jsonb_build_array(versions.id, versions.xmin::text),
        'asset', jsonb_build_array(assets.id, assets.xmin::text),
        'cohort', jsonb_build_array(cohorts.id, cohorts.xmin::text)
      ) into scope_rows
      from public.source_versions as versions
      join public.source_assets as assets on assets.id = versions.source_asset_id
      join public.cohorts as cohorts on cohorts.id = assets.cohort_id
      where versions.id = target_id;

    when 'REMOVE_RAW_HOLD' then
      select raw.source_version_id into raw_source_id
      from unimind_private.raw_objects as raw where raw.id = target_id;
      select jsonb_build_object(
        'raw', (
          select jsonb_build_array(raw.id, raw.xmin::text)
          from unimind_private.raw_objects as raw where raw.id = target_id
        ),
        'hold', (
          select jsonb_build_array(holds.id, holds.xmin::text)
          from unimind_private.raw_data_holds as holds
          where holds.raw_object_id = target_id and holds.status = 'ACTIVE'
        ),
        'source', (
          select jsonb_build_array(versions.id, versions.xmin::text)
          from public.source_versions as versions where versions.id = raw_source_id
        ),
        'documents', (
          select coalesce(jsonb_agg(jsonb_build_array(documents.id, documents.xmin::text)
            order by documents.id), '[]'::jsonb)
          from unimind_private.processed_documents as documents
          where documents.source_version_id = raw_source_id
        ),
        'reports', (
          select coalesce(jsonb_agg(jsonb_build_array(reports.id, reports.xmin::text)
            order by reports.id), '[]'::jsonb)
          from unimind_private.processing_quality_reports as reports
          where reports.source_version_id = raw_source_id
        ),
        'segments', (
          select coalesce(jsonb_agg(jsonb_build_array(segments.id, segments.xmin::text)
            order by segments.id), '[]'::jsonb)
          from unimind_private.source_segments as segments
          where segments.source_version_id = raw_source_id
        ),
        'embeddings', (
          select coalesce(jsonb_agg(jsonb_build_array(
            embeddings.id, embeddings.xmin::text,
            configurations.id, configurations.xmin::text)
            order by embeddings.id), '[]'::jsonb)
          from unimind_private.segment_embeddings as embeddings
          join unimind_private.source_segments as segments
            on segments.id = embeddings.source_segment_id
          join unimind_private.embedding_configs as configurations
            on configurations.id = embeddings.embedding_config_id
          where segments.source_version_id = raw_source_id
        )
      ) into scope_rows;

    when 'ENABLE_FLAG' then
      select jsonb_build_object(
        'flag', jsonb_build_array(
          flags.id, flags.xmin::text, flags.key, flags.enabled,
          flags.governance_version, flags.config_json
        ),
        'environment', p_runtime_environment,
        'approvals', (
          select coalesce(jsonb_agg(jsonb_build_array(
            approvals.id, approvals.xmin::text,
            approvers.user_id, approvers.xmin::text,
            roles.id, roles.xmin::text)
            order by approvals.id, roles.id), '[]'::jsonb)
          from unimind_private.admin_mock_artifact_approvals as approvals
          join public.profiles as approvers on approvers.user_id = approvals.approved_by
          join public.user_roles as roles on roles.user_id = approvers.user_id
          where approvals.flag_key = flags.key
            and approvals.runtime_environment = p_runtime_environment
            and approvals.dependency_sha256 = flags.config_json ->> 'dependency_sha256'
        )
      ) into scope_rows
      from unimind_private.system_feature_flags as flags where flags.id = target_id;

    else
      raise exception using errcode = '22023', message = 'ADMIN_ACTION:INVALID_REQUEST';
  end case;

  if scope_rows is null then
    raise exception using errcode = 'P0002', message = 'ADMIN_ACTION:STATE_CONFLICT';
  end if;
  return encode(extensions.digest(convert_to(scope_rows::text, 'UTF8'), 'sha256'), 'hex');
end;
$$;

revoke all on function unimind_private.admin_candidate_fingerprint(text, uuid, text)
  from public, anon, authenticated;

create function unimind_private.admin_submit_governance_action(
  p_actor_id uuid,
  p_action text,
  p_target_id uuid,
  p_expected_version integer,
  p_expected_state text,
  p_reason text,
  p_correlation_id uuid,
  p_idempotency_key uuid,
  p_pending_action_id uuid default null,
  p_hold_expires_at timestamptz default null,
  p_review_attested boolean default false,
  p_runtime_environment text default 'local'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payload jsonb;
  v_payload_sha256 text;
  v_command unimind_private.admin_action_commands%rowtype;
  v_existing unimind_private.admin_action_commands%rowtype;
  v_pending unimind_private.admin_action_commands%rowtype;
  v_unit_status text;
  v_cohort_status text;
  v_cohort_edition text;
  v_source_processing text;
  v_source_activation text;
  v_source_governance text;
  v_raw_status text;
  v_flag_enabled boolean;
  v_flag_key text;
  v_flag_config jsonb;
  v_rights_status text;
  v_rights_valid_from timestamptz;
  v_rights_valid_until timestamptz;
  v_version integer;
  v_current_state text;
  v_next_state text;
  v_target_label_en text;
  v_target_label_ar text;
  v_failed_predicates text[] := array[]::text[];
  v_protected boolean := false;
  v_founder_slot text;
  v_initiator_slot text;
  v_result_status text;
  v_result jsonb;
  v_hold_id uuid;
  v_raw_source_version_id uuid;
  v_runtime_environment text;
  v_candidate_fingerprint text;
begin
  if p_actor_id is null or p_action is null or p_target_id is null or p_expected_version is null
     or p_expected_version < 0 or p_expected_state is null
     or p_correlation_id is null or p_idempotency_key is null
     or p_action not in (
       'PUBLISH_UNIT', 'HIDE_UNIT', 'UNLOCK_COHORT', 'LOCK_COHORT',
       'ACTIVATE_SOURCE', 'DEACTIVATE_SOURCE', 'QUARANTINE_SOURCE', 'RETRY_SOURCE',
       'PLACE_RAW_HOLD', 'REMOVE_RAW_HOLD', 'ENABLE_FLAG', 'DISABLE_FLAG'
     )
     or char_length(btrim(coalesce(p_reason, ''))) not between 8 and 500 then
    raise exception using errcode = '22023', message = 'ADMIN_ACTION:INVALID_REQUEST';
  end if;

  v_runtime_environment := coalesce(p_runtime_environment, '');
  if v_runtime_environment not in ('local', 'ci', 'preview', 'production') then
    raise exception using errcode = '22023', message = 'ADMIN_ACTION:INVALID_REQUEST';
  end if;

  if not exists (
    select 1
    from public.profiles as profiles
    join public.user_roles as roles on roles.user_id = profiles.user_id
    where profiles.user_id = p_actor_id
      and profiles.account_status = 'ACTIVE'
      and roles.role = 'ADMIN'
      and roles.revoked_at is null
  ) then
    raise exception using errcode = '42501', message = 'ADMIN_ACTION:FORBIDDEN';
  end if;

  perform set_config('unimind.actor_id', p_actor_id::text, true);
  perform set_config('unimind.audit_reason', btrim(p_reason), true);
  perform set_config('unimind.correlation_id', p_correlation_id::text, true);

  v_payload := jsonb_build_object(
    'action', p_action,
    'targetId', p_target_id,
    'expectedVersion', p_expected_version,
    'expectedState', p_expected_state,
    'reason', btrim(p_reason),
    'correlationId', p_correlation_id,
    'pendingActionId', p_pending_action_id,
    'holdExpiresAt', p_hold_expires_at,
    'reviewAttested', p_review_attested,
    'runtimeEnvironment', v_runtime_environment
  );
  v_payload_sha256 := encode(
    extensions.digest(convert_to(v_payload::text, 'UTF8'), 'sha256'),
    'hex'
  );

  insert into unimind_private.admin_action_commands (
    actor_id, action, target_id, expected_version, expected_state,
    current_state, proposed_state, target_label_en, target_label_ar,
    reason, correlation_id, idempotency_key, payload_sha256,
    pending_action_id
  ) values (
    p_actor_id, p_action, p_target_id, p_expected_version, p_expected_state,
    p_expected_state, p_expected_state, 'Governed item', 'عنصر خاضع للحوكمة',
    btrim(p_reason), p_correlation_id, p_idempotency_key, v_payload_sha256,
    p_pending_action_id
  ) on conflict (actor_id, idempotency_key) do nothing
  returning * into v_command;

  if not found then
    select * into v_existing
    from unimind_private.admin_action_commands as commands
    where commands.actor_id = p_actor_id
      and commands.idempotency_key = p_idempotency_key
    for update;
    if not found or v_existing.payload_sha256 <> v_payload_sha256 then
      raise exception using errcode = '23505', message = 'ADMIN_ACTION:CONFLICT';
    end if;
    return v_existing.result_json || jsonb_build_object('replayed', true);
  end if;

  case p_action
    when 'PUBLISH_UNIT' then
      select units.publication_status, units.governance_version,
        cohorts.status, cohorts.curriculum_edition,
        units.title_en || ' · ' || cohorts.name,
        units.title_ar || ' · ' || cohorts.name
      into v_unit_status, v_version, v_cohort_status, v_cohort_edition,
        v_target_label_en, v_target_label_ar
      from public.curriculum_units as units
      join public.cohorts as cohorts on cohorts.id = units.cohort_id
      where units.id = p_target_id
      for update of units, cohorts;
      if not found then
        raise exception using errcode = 'P0002', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      if v_unit_status not in ('DRAFT', 'WITHDRAWN') then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      v_current_state := v_unit_status;
      v_next_state := 'PUBLISHED';
      v_version := v_version;
      v_protected := true;
      perform 1
      from public.source_assets as assets
      where assets.curriculum_unit_id = p_target_id
      for update;
      perform 1
      from public.source_versions as versions
      join public.source_assets as assets on assets.id = versions.source_asset_id
      where assets.curriculum_unit_id = p_target_id
      for update of versions;
      if v_cohort_status <> 'ACTIVE' then
        v_failed_predicates := array_append(v_failed_predicates, 'cohort.active');
      end if;
      if not exists (
        select 1 from public.source_assets as assets
        join public.source_versions as versions on versions.source_asset_id = assets.id
        where assets.curriculum_unit_id = p_target_id
          and versions.processing_status = 'READY'
          and versions.accepted_at is not null
          and versions.activation_status = 'ACTIVE'
          and versions.governance_state = 'AVAILABLE'
      ) then
        v_failed_predicates := array_append(v_failed_predicates, 'source.active_ready');
      end if;
      if not exists (
        select 1 from public.source_assets as assets
        join public.source_versions as versions on versions.source_asset_id = assets.id
        where assets.curriculum_unit_id = p_target_id
          and versions.processing_status = 'READY'
          and versions.accepted_at is not null
          and versions.activation_status = 'ACTIVE'
          and versions.governance_state = 'AVAILABLE'
          and versions.rights_status = 'VALID'
          and versions.rights_valid_from <= transaction_timestamp()
          and (versions.rights_valid_until is null
            or versions.rights_valid_until > transaction_timestamp())
      ) then
        v_failed_predicates := array_append(v_failed_predicates, 'source.rights_current');
      end if;
      if not exists (
        select 1 from public.source_assets as assets
        join public.source_versions as versions on versions.source_asset_id = assets.id
        where assets.curriculum_unit_id = p_target_id
          and versions.processing_status = 'READY'
          and versions.accepted_at is not null
          and versions.activation_status = 'ACTIVE'
          and versions.governance_state = 'AVAILABLE'
          and versions.rights_status = 'VALID'
          and versions.rights_valid_from <= transaction_timestamp()
          and (versions.rights_valid_until is null
            or versions.rights_valid_until > transaction_timestamp())
          and versions.curriculum_edition = v_cohort_edition
      ) then
        v_failed_predicates := array_append(v_failed_predicates, 'source.edition_matches');
      end if;

    when 'HIDE_UNIT' then
      select units.publication_status, units.governance_version,
        cohorts.name, cohorts.name
      into v_unit_status, v_version, v_target_label_en, v_target_label_ar
      from public.curriculum_units as units
      join public.cohorts as cohorts on cohorts.id = units.cohort_id
      where units.id = p_target_id
      for update of units;
      if not found or v_unit_status <> 'PUBLISHED' then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      v_current_state := v_unit_status;
      v_next_state := 'WITHDRAWN';

    when 'UNLOCK_COHORT' then
      select cohorts.status, cohorts.curriculum_edition, cohorts.name
      into v_cohort_status, v_cohort_edition, v_target_label_en
      from public.cohorts as cohorts
      where cohorts.id = p_target_id
      for update;
      if not found then
        raise exception using errcode = 'P0002', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      select releases.release_status, releases.governance_version
      into v_unit_status, v_version
      from public.cohort_releases as releases
      where releases.cohort_id = p_target_id
      for update;
      if not found then
        v_unit_status := 'LOCKED';
        v_version := 0;
      end if;
      if v_unit_status <> 'LOCKED' then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      v_current_state := 'LOCKED';
      v_next_state := 'UNLOCKED';
      v_target_label_ar := v_target_label_en;
      v_protected := true;
      perform 1
      from public.curriculum_units as units
      where units.cohort_id = p_target_id
      for update;
      perform 1
      from public.source_assets as assets
      where assets.cohort_id = p_target_id
      for update;
      perform 1
      from public.source_versions as versions
      join public.source_assets as assets on assets.id = versions.source_asset_id
      where assets.cohort_id = p_target_id
      for update of versions;
      if v_cohort_status <> 'ACTIVE' then
        v_failed_predicates := array_append(v_failed_predicates, 'cohort.active');
      end if;
      if not exists (
        select 1 from public.curriculum_units as units
        where units.cohort_id = p_target_id and units.publication_status = 'PUBLISHED'
      ) then
        v_failed_predicates := array_append(v_failed_predicates, 'unit.published');
      end if;
      if not exists (
        select 1 from public.curriculum_units as units
        join public.source_assets as assets
          on assets.curriculum_unit_id = units.id and assets.cohort_id = units.cohort_id
        join public.source_versions as versions on versions.source_asset_id = assets.id
        where units.cohort_id = p_target_id
          and units.publication_status = 'PUBLISHED'
          and versions.processing_status = 'READY'
          and versions.accepted_at is not null
          and versions.activation_status = 'ACTIVE'
          and versions.governance_state = 'AVAILABLE'
      ) then
        v_failed_predicates := array_append(v_failed_predicates, 'source.active_ready');
      end if;
      if not exists (
        select 1 from public.curriculum_units as units
        join public.source_assets as assets
          on assets.curriculum_unit_id = units.id and assets.cohort_id = units.cohort_id
        join public.source_versions as versions on versions.source_asset_id = assets.id
        where units.cohort_id = p_target_id
          and units.publication_status = 'PUBLISHED'
          and versions.processing_status = 'READY'
          and versions.accepted_at is not null
          and versions.activation_status = 'ACTIVE'
          and versions.governance_state = 'AVAILABLE'
          and versions.rights_status = 'VALID'
          and versions.rights_valid_from <= transaction_timestamp()
          and (versions.rights_valid_until is null
            or versions.rights_valid_until > transaction_timestamp())
      ) then
        v_failed_predicates := array_append(v_failed_predicates, 'source.rights_current');
      end if;
      if not exists (
        select 1 from public.curriculum_units as units
        join public.source_assets as assets
          on assets.curriculum_unit_id = units.id and assets.cohort_id = units.cohort_id
        join public.source_versions as versions on versions.source_asset_id = assets.id
        where units.cohort_id = p_target_id
          and units.publication_status = 'PUBLISHED'
          and versions.processing_status = 'READY'
          and versions.accepted_at is not null
          and versions.activation_status = 'ACTIVE'
          and versions.governance_state = 'AVAILABLE'
          and versions.rights_status = 'VALID'
          and versions.rights_valid_from <= transaction_timestamp()
          and (versions.rights_valid_until is null
            or versions.rights_valid_until > transaction_timestamp())
          and versions.curriculum_edition = v_cohort_edition
      ) then
        v_failed_predicates := array_append(v_failed_predicates, 'source.edition_matches');
      end if;

    when 'LOCK_COHORT' then
      select cohorts.name into v_target_label_en
      from public.cohorts as cohorts where cohorts.id = p_target_id for update;
      if not found then
        raise exception using errcode = 'P0002', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      select releases.release_status, releases.governance_version
      into v_unit_status, v_version
      from public.cohort_releases as releases
      where releases.cohort_id = p_target_id for update;
      if not found or v_unit_status <> 'UNLOCKED' then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      v_current_state := 'UNLOCKED';
      v_next_state := 'LOCKED';
      v_target_label_ar := v_target_label_en;

    when 'ACTIVATE_SOURCE' then
      select versions.processing_status, versions.activation_status,
        versions.governance_state, versions.governance_version,
        versions.curriculum_edition, cohorts.curriculum_edition,
        assets.canonical_title
      into v_source_processing, v_source_activation, v_source_governance,
        v_version, v_unit_status, v_cohort_edition, v_target_label_en
      from public.source_versions as versions
      join public.source_assets as assets on assets.id = versions.source_asset_id
      join public.cohorts as cohorts on cohorts.id = assets.cohort_id
      where versions.id = p_target_id
      for update of versions, assets, cohorts;
      if not found or v_source_activation not in ('INACTIVE', 'DEACTIVATED') then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      v_current_state := v_source_activation;
      v_next_state := 'ACTIVE';
      v_target_label_ar := v_target_label_en;
      v_protected := true;
      v_failed_predicates := unimind_private.admin_source_predicates(
        p_target_id, v_cohort_edition, false
      );

    when 'DEACTIVATE_SOURCE' then
      select versions.activation_status, versions.governance_version,
        assets.canonical_title
      into v_source_activation, v_version, v_target_label_en
      from public.source_versions as versions
      join public.source_assets as assets on assets.id = versions.source_asset_id
      where versions.id = p_target_id
      for update of versions;
      if not found or v_source_activation <> 'ACTIVE' then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      v_current_state := 'ACTIVE';
      v_next_state := 'DEACTIVATED';
      v_target_label_ar := v_target_label_en;

    when 'QUARANTINE_SOURCE' then
      select versions.processing_status, versions.activation_status,
        versions.governance_state, versions.governance_version,
        assets.canonical_title
      into v_source_processing, v_source_activation, v_source_governance,
        v_version, v_target_label_en
      from public.source_versions as versions
      join public.source_assets as assets on assets.id = versions.source_asset_id
      where versions.id = p_target_id
      for update of versions;
      if not found or v_source_processing not in ('FAILED', 'NEEDS_REVIEW') then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      v_current_state := v_source_processing;
      v_next_state := 'QUARANTINED';
      v_target_label_ar := v_target_label_en;

    when 'RETRY_SOURCE' then
      select versions.processing_status, versions.activation_status,
        versions.governance_state, versions.governance_version,
        versions.rights_status, versions.rights_valid_from,
        versions.rights_valid_until, assets.canonical_title
      into v_source_processing, v_source_activation, v_source_governance,
        v_version, v_rights_status, v_rights_valid_from,
        v_rights_valid_until, v_target_label_en
      from public.source_versions as versions
      join public.source_assets as assets on assets.id = versions.source_asset_id
      where versions.id = p_target_id
      for update of versions;
      if not found then
        raise exception using errcode = 'P0002', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      if v_source_governance = 'QUARANTINED' then
        v_current_state := 'QUARANTINED';
      else
        v_current_state := v_source_processing;
      end if;
      if v_current_state not in ('FAILED', 'NEEDS_REVIEW', 'QUARANTINED') then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      if v_rights_status <> 'VALID' or v_rights_valid_from is null
         or v_rights_valid_from > transaction_timestamp()
         or (v_rights_valid_until is not null
           and v_rights_valid_until <= transaction_timestamp()) then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:APPROVAL_GATE_CLOSED';
      end if;
      if exists (
        select 1 from unimind_private.admin_action_commands as prior
        where prior.action = 'RETRY_SOURCE' and prior.target_id = p_target_id
          and prior.command_state in ('PENDING_OWNER_REVIEW', 'APPLIED')
      ) then
        raise exception using errcode = '23505', message = 'ADMIN_ACTION:RETRY_ALREADY_PENDING';
      end if;
      v_next_state := 'PENDING_OWNER_REVIEW';
      v_target_label_en := 'Source version ' || left(p_target_id::text, 8);
      v_target_label_ar := 'نسخة مصدر ' || left(p_target_id::text, 8);

    when 'PLACE_RAW_HOLD' then
      select raw.status, raw.governance_version, raw.source_version_id
      into v_raw_status, v_version, v_raw_source_version_id
      from unimind_private.raw_objects as raw
      where raw.id = p_target_id
        and raw.provider = 'mock-object-storage-provider'
        and raw.object_key like 'synthetic/%'
      for update;
      if not found or v_raw_status <> 'STORED' then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      if p_hold_expires_at is null or p_hold_expires_at <= transaction_timestamp()
         or not p_review_attested then
        raise exception using errcode = '22023', message = 'ADMIN_ACTION:INVALID_REQUEST';
      end if;
      select assets.canonical_title into v_target_label_en
      from public.source_versions as versions
      join public.source_assets as assets on assets.id = versions.source_asset_id
      where versions.id = v_raw_source_version_id;
      v_current_state := 'STORED';
      v_next_state := 'HELD';
      v_target_label_en := coalesce(v_target_label_en, 'Synthetic raw object');
      v_target_label_ar := 'عنصر خام تجريبي';

    when 'REMOVE_RAW_HOLD' then
      select raw.status, raw.governance_version, raw.source_version_id
      into v_raw_status, v_version, v_raw_source_version_id
      from unimind_private.raw_objects as raw
      where raw.id = p_target_id
        and raw.provider = 'mock-object-storage-provider'
        and raw.object_key like 'synthetic/%'
      for update;
      if not found or v_raw_status <> 'HELD' then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      select holds.id into v_hold_id
      from unimind_private.raw_data_holds as holds
      where holds.raw_object_id = p_target_id and holds.status = 'ACTIVE'
      for update;
      if not found then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:SAFETY_CHECK_FAILED';
      end if;
      perform 1
      from public.source_versions as versions
      where versions.id = v_raw_source_version_id
      for update;
      perform 1
      from unimind_private.processed_documents as documents
      where documents.source_version_id = v_raw_source_version_id
      for update;
      perform 1
      from unimind_private.processing_quality_reports as reports
      where reports.source_version_id = v_raw_source_version_id
      order by reports.created_at desc, reports.id desc
      limit 1
      for update;
      perform 1
      from unimind_private.source_segments as segments
      where segments.source_version_id = v_raw_source_version_id
      for update;
      perform 1
      from unimind_private.segment_embeddings as embeddings
      join unimind_private.source_segments as segments
        on segments.id = embeddings.source_segment_id
      where segments.source_version_id = v_raw_source_version_id
      for update of embeddings;
      perform 1
      from unimind_private.embedding_configs as configurations
      where configurations.id in (
        select embeddings.embedding_config_id
        from unimind_private.segment_embeddings as embeddings
        join unimind_private.source_segments as segments
          on segments.id = embeddings.source_segment_id
        where segments.source_version_id = v_raw_source_version_id
      )
      for update;
      if not unimind_private.admin_raw_safety_check(p_target_id) then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:SAFETY_CHECK_FAILED';
      end if;
      select assets.canonical_title into v_target_label_en
      from public.source_versions as versions
      join public.source_assets as assets on assets.id = versions.source_asset_id
      where versions.id = v_raw_source_version_id;
      v_current_state := 'HELD';
      v_next_state := 'STORED';
      v_target_label_en := coalesce(v_target_label_en, 'Synthetic raw object');
      v_target_label_ar := 'عنصر خام تجريبي';
      v_protected := true;

    when 'ENABLE_FLAG' then
      select flags.enabled, flags.governance_version, flags.key, flags.config_json
      into v_flag_enabled, v_version, v_flag_key, v_flag_config
      from unimind_private.system_feature_flags as flags
      where flags.id = p_target_id
      for update;
      if not found or v_flag_enabled then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      v_current_state := 'DISABLED';
      v_next_state := 'ENABLED';
      v_target_label_en := v_flag_key;
      v_target_label_ar := v_flag_key;
      v_protected := true;
      if v_flag_key !~ '^mock\.artifact\.[a-z][a-z0-9_]*$'
         or v_flag_config ->> 'provider' is distinct from 'deterministic-mock'
         or v_flag_config ->> 'environment' is distinct from v_runtime_environment
         or coalesce(v_flag_config ->> 'dependency_sha256', '') !~ '^[0-9a-f]{64}$' then
        v_failed_predicates := array_append(v_failed_predicates, 'flag.mock_approval_missing');
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:APPROVAL_GATE_CLOSED';
      end if;
      perform 1
      from unimind_private.admin_mock_artifact_approvals as approvals
      join public.profiles as approvers on approvers.user_id = approvals.approved_by
      join public.user_roles as roles on roles.user_id = approvers.user_id
      where approvals.flag_key = v_flag_key
        and approvals.runtime_environment = v_runtime_environment
        and approvals.dependency_sha256 = v_flag_config ->> 'dependency_sha256'
        and approvals.approved_at <= transaction_timestamp()
        and approvers.account_status = 'ACTIVE'
        and roles.role = 'ADMIN'
        and roles.revoked_at is null
      for update of approvals, approvers, roles;
      if not found then
        v_failed_predicates := array_append(v_failed_predicates, 'flag.mock_approval_missing');
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:APPROVAL_GATE_CLOSED';
      end if;

    when 'DISABLE_FLAG' then
      select flags.enabled, flags.governance_version, flags.key
      into v_flag_enabled, v_version, v_flag_key
      from unimind_private.system_feature_flags as flags
      where flags.id = p_target_id
      for update;
      if not found or not v_flag_enabled then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STATE_CONFLICT';
      end if;
      v_current_state := 'ENABLED';
      v_next_state := 'DISABLED';
      v_target_label_en := v_flag_key;
      v_target_label_ar := v_flag_key;
  end case;

  if p_expected_state <> v_current_state or p_expected_version <> v_version then
    raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
  end if;
  if cardinality(v_failed_predicates) > 0 then
    raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:READINESS_BLOCKED';
  end if;

  update unimind_private.admin_action_commands as commands
  set current_state = v_current_state,
      proposed_state = v_next_state,
      target_label_en = coalesce(v_target_label_en, 'Governed item'),
      target_label_ar = coalesce(v_target_label_ar, 'عنصر خاضع للحوكمة'),
      failed_predicates = v_failed_predicates,
      protected = v_protected,
      updated_at = transaction_timestamp()
  where commands.id = v_command.id
  returning * into v_command;

  if v_protected then
    v_candidate_fingerprint := unimind_private.admin_candidate_fingerprint(
      p_action, p_target_id, v_runtime_environment
    );
    if p_pending_action_id is null then
      select principals.founder_slot into v_founder_slot
      from unimind_private.founder_principals as principals
      where principals.user_id = p_actor_id and principals.active
        and principals.verified_at <= transaction_timestamp();
      if not found then
        raise exception using errcode = '42501', message = 'ADMIN_ACTION:PRINCIPAL_UNVERIFIED';
      end if;
      insert into unimind_private.admin_action_confirmations (
        command_id, actor_id, founder_slot, reason, correlation_id
      ) values (
        v_command.id, p_actor_id, v_founder_slot, btrim(p_reason), p_correlation_id
      );
      v_result_status := 'PENDING_SECOND_CONFIRMATION';
      v_result := jsonb_build_object(
        'commandId', v_command.id,
        'status', v_result_status,
        'currentState', v_current_state,
        'nextState', v_next_state,
        'replayed', false,
        'targetLabelEn', v_target_label_en,
        'targetLabelAr', v_target_label_ar,
        'failedPredicates', to_jsonb(v_failed_predicates),
        'protected', true
      );
      update unimind_private.admin_action_commands as commands
      set command_state = 'PENDING_SECOND_CONFIRMATION',
          prerequisite_sha256 = v_candidate_fingerprint,
          result_json = v_result,
          updated_at = transaction_timestamp()
      where commands.id = v_command.id;
      return v_result;
    end if;

    select * into v_pending
    from unimind_private.admin_action_commands as commands
    where commands.id = p_pending_action_id
      and commands.command_state = 'PENDING_SECOND_CONFIRMATION'
    for update;
    if not found then
      raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STATE_CONFLICT';
    end if;
    if v_pending.created_at < transaction_timestamp() - interval '24 hours' then
      raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:CONFIRMATION_EXPIRED';
    end if;
    if v_pending.prerequisite_sha256 is distinct from v_candidate_fingerprint then
      raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
    end if;
    if (v_pending.action, v_pending.target_id, v_pending.expected_version,
        v_pending.expected_state, v_pending.reason, v_pending.correlation_id)
       is distinct from
       (p_action, p_target_id, p_expected_version, p_expected_state,
        btrim(p_reason), p_correlation_id) then
      raise exception using errcode = '23514', message = 'ADMIN_ACTION:STATE_CONFLICT';
    end if;
    select principals.founder_slot into v_founder_slot
    from unimind_private.founder_principals as principals
    where principals.user_id = p_actor_id and principals.active
      and principals.verified_at <= transaction_timestamp();
    if not found then
      raise exception using errcode = '42501', message = 'ADMIN_ACTION:PRINCIPAL_UNVERIFIED';
    end if;
    select confirmations.founder_slot into v_initiator_slot
    from unimind_private.admin_action_confirmations as confirmations
    where confirmations.command_id = v_pending.id
    order by confirmations.confirmed_at, confirmations.id
    limit 1;
    if not found or v_initiator_slot = v_founder_slot then
      raise exception using errcode = '42501', message = 'ADMIN_ACTION:DIFFERENT_FOUNDER_REQUIRED';
    end if;
    if not exists (
      select 1
      from unimind_private.admin_action_confirmations as confirmations
      join unimind_private.founder_principals as principals
        on principals.user_id = confirmations.actor_id
       and principals.founder_slot = confirmations.founder_slot
      join public.profiles as profiles on profiles.user_id = confirmations.actor_id
      join public.user_roles as roles on roles.user_id = profiles.user_id
      where confirmations.command_id = v_pending.id
        and confirmations.founder_slot = v_initiator_slot
        and principals.active
        and principals.verified_at <= transaction_timestamp()
        and profiles.account_status = 'ACTIVE'
        and roles.role = 'ADMIN'
        and roles.revoked_at is null
    ) then
      raise exception using errcode = '42501', message = 'ADMIN_ACTION:PRINCIPAL_UNVERIFIED';
    end if;
    insert into unimind_private.admin_action_confirmations (
      command_id, actor_id, founder_slot, reason, correlation_id
    ) values (
      v_pending.id, p_actor_id, v_founder_slot, btrim(p_reason), p_correlation_id
    );
    update unimind_private.admin_action_commands as commands
    set command_state = 'APPLIED', updated_at = transaction_timestamp()
    where commands.id = v_pending.id;
  elsif p_pending_action_id is not null then
    raise exception using errcode = '22023', message = 'ADMIN_ACTION:INVALID_REQUEST';
  end if;

  case p_action
    when 'PUBLISH_UNIT' then
      update public.curriculum_units as units
      set publication_status = 'PUBLISHED', published_at = transaction_timestamp(),
          published_by = p_actor_id, governance_version = governance_version + 1
      where units.id = p_target_id and units.governance_version = p_expected_version;
      if not found then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
      end if;
      insert into public.curriculum_unit_publication_events (
        curriculum_unit_id, prior_status, new_status, changed_by,
        changed_at, reason, correlation_id
      ) values (
        p_target_id, v_current_state, 'PUBLISHED', p_actor_id,
        transaction_timestamp(), btrim(p_reason), p_correlation_id
      );

    when 'HIDE_UNIT' then
      update public.curriculum_units as units
      set publication_status = 'WITHDRAWN', published_at = transaction_timestamp(),
          published_by = p_actor_id, governance_version = governance_version + 1
      where units.id = p_target_id and units.governance_version = p_expected_version;
      if not found then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
      end if;
      insert into public.curriculum_unit_publication_events (
        curriculum_unit_id, prior_status, new_status, changed_by,
        changed_at, reason, correlation_id
      ) values (
        p_target_id, 'PUBLISHED', 'WITHDRAWN', p_actor_id,
        transaction_timestamp(), btrim(p_reason), p_correlation_id
      );

    when 'UNLOCK_COHORT' then
      if v_version = 0 then
        insert into public.cohort_releases (
          cohort_id, release_status, changed_by, changed_at, reason, governance_version
        ) values (
          p_target_id, 'UNLOCKED', p_actor_id, transaction_timestamp(),
          btrim(p_reason), 1
        );
      else
        update public.cohort_releases as releases
        set release_status = 'UNLOCKED', changed_by = p_actor_id,
            changed_at = transaction_timestamp(), reason = btrim(p_reason),
            governance_version = governance_version + 1
        where releases.cohort_id = p_target_id
          and releases.governance_version = p_expected_version;
        if not found then
          raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
        end if;
      end if;

    when 'LOCK_COHORT' then
      update public.cohort_releases as releases
      set release_status = 'LOCKED', changed_by = p_actor_id,
          changed_at = transaction_timestamp(), reason = btrim(p_reason),
          governance_version = governance_version + 1
      where releases.cohort_id = p_target_id
        and releases.governance_version = p_expected_version;
      if not found then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
      end if;

    when 'ACTIVATE_SOURCE' then
      update public.source_versions as versions
      set activation_status = 'ACTIVE', governance_state = 'AVAILABLE',
          governance_version = governance_version + 1
      where versions.id = p_target_id and versions.governance_version = p_expected_version;
      if not found then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
      end if;

    when 'DEACTIVATE_SOURCE' then
      update public.source_versions as versions
      set activation_status = 'DEACTIVATED', governance_version = governance_version + 1
      where versions.id = p_target_id and versions.governance_version = p_expected_version;
      if not found then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
      end if;

    when 'QUARANTINE_SOURCE' then
      update public.source_versions as versions
      set activation_status = case when activation_status = 'ACTIVE'
            then 'DEACTIVATED' else activation_status end,
          governance_state = 'QUARANTINED',
          governance_version = governance_version + 1
      where versions.id = p_target_id and versions.governance_version = p_expected_version;
      if not found then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
      end if;

    when 'RETRY_SOURCE' then
      null;

    when 'PLACE_RAW_HOLD' then
      update unimind_private.raw_objects as raw
      set status = 'HELD', hold_reason = btrim(p_reason),
          governance_version = governance_version + 1
      where raw.id = p_target_id and raw.status = 'STORED'
        and raw.governance_version = p_expected_version;
      if not found then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
      end if;
      insert into unimind_private.raw_data_holds (
        raw_object_id, status, reason, expires_at, reviewed_by, reviewed_at,
        placed_by, placed_at, correlation_id
      ) values (
        p_target_id, 'ACTIVE', btrim(p_reason), p_hold_expires_at,
        p_actor_id, transaction_timestamp(), p_actor_id,
        transaction_timestamp(), p_correlation_id
      );

    when 'REMOVE_RAW_HOLD' then
      update unimind_private.raw_data_holds as holds
      set status = 'REMOVED', reason = btrim(p_reason),
          removed_by = p_actor_id, removed_at = transaction_timestamp()
      where holds.id = v_hold_id and holds.status = 'ACTIVE';
      if not found then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
      end if;
      update unimind_private.raw_objects as raw
      set status = 'STORED', hold_reason = null,
          governance_version = governance_version + 1
      where raw.id = p_target_id and raw.status = 'HELD'
        and raw.governance_version = p_expected_version;
      if not found then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
      end if;

    when 'ENABLE_FLAG' then
      update unimind_private.system_feature_flags as flags
      set enabled = true, changed_by = p_actor_id,
          changed_at = transaction_timestamp(), reason = btrim(p_reason),
          governance_version = governance_version + 1
      where flags.id = p_target_id and not flags.enabled
        and flags.governance_version = p_expected_version;
      if not found then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
      end if;

    when 'DISABLE_FLAG' then
      update unimind_private.system_feature_flags as flags
      set enabled = false, changed_by = p_actor_id,
          changed_at = transaction_timestamp(), reason = btrim(p_reason),
          governance_version = governance_version + 1
      where flags.id = p_target_id and flags.enabled
        and flags.governance_version = p_expected_version;
      if not found then
        raise exception using errcode = 'P0001', message = 'ADMIN_ACTION:STALE_VERSION';
      end if;
  end case;

  if p_action = 'RETRY_SOURCE' then
    v_result_status := 'PENDING_OWNER_REVIEW';
  else
    v_result_status := 'APPLIED';
  end if;
  v_result := jsonb_build_object(
    'commandId', v_command.id,
    'status', v_result_status,
    'currentState', v_current_state,
    'nextState', v_next_state,
    'replayed', false,
    'targetLabelEn', v_target_label_en,
    'targetLabelAr', v_target_label_ar,
    'failedPredicates', to_jsonb(v_failed_predicates),
    'protected', v_protected
  );
  update unimind_private.admin_action_commands as commands
  set command_state = v_result_status,
      result_json = v_result,
      current_state = v_current_state,
      proposed_state = v_next_state,
      target_label_en = coalesce(v_target_label_en, 'Governed item'),
      target_label_ar = coalesce(v_target_label_ar, 'عنصر خاضع للحوكمة'),
      failed_predicates = v_failed_predicates,
      protected = v_protected,
      updated_at = transaction_timestamp()
  where commands.id = v_command.id;
  return v_result;
end;
$$;

revoke all on function unimind_private.admin_submit_governance_action(
  uuid, text, uuid, integer, text, text, uuid, uuid, uuid, timestamptz, boolean, text
) from public, anon, authenticated;
grant execute on function unimind_private.admin_submit_governance_action(
  uuid, text, uuid, integer, text, text, uuid, uuid, uuid, timestamptz, boolean, text
) to service_role;

create function unimind_private.admin_current_action_queue(
  p_actor_id uuid,
  p_runtime_environment text
)
returns table (
  candidate_id text,
  action text,
  target_id uuid,
  target_label_en text,
  target_label_ar text,
  current_state text,
  proposed_state text,
  expected_state text,
  expected_version integer,
  failed_predicates text[],
  protected boolean,
  pending_action_id uuid,
  reason text,
  command_state text,
  initiator_slot text,
  correlation_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_actor_id is null
     or p_runtime_environment not in ('local', 'ci', 'preview', 'production')
     or not exists (
       select 1
       from public.profiles as profiles
       join public.user_roles as roles on roles.user_id = profiles.user_id
       where profiles.user_id = p_actor_id
         and profiles.account_status = 'ACTIVE'
         and roles.role = 'ADMIN'
         and roles.revoked_at is null
     ) then
    raise exception using errcode = '42501', message = 'ADMIN_ACTION:FORBIDDEN';
  end if;

  return query
  with action_candidates as (
    select
      'unit:publish:' || units.id::text as candidate_id,
      'PUBLISH_UNIT'::text as action,
      units.id as target_id,
      units.title_en || ' · ' || cohorts.name as target_label_en,
      units.title_ar || ' · ' || cohorts.name as target_label_ar,
      units.publication_status as current_state,
      'PUBLISHED'::text as proposed_state,
      units.publication_status as expected_state,
      units.governance_version as expected_version,
      array_remove(array[
        case when cohorts.status <> 'ACTIVE' then 'cohort.active' end,
        case when not exists (
          select 1 from public.source_assets as assets
          join public.source_versions as versions on versions.source_asset_id = assets.id
          where assets.curriculum_unit_id = units.id
            and versions.processing_status = 'READY'
            and versions.accepted_at is not null
            and versions.activation_status = 'ACTIVE'
            and versions.governance_state = 'AVAILABLE'
        ) then 'source.active_ready' end,
        case when not exists (
          select 1 from public.source_assets as assets
          join public.source_versions as versions on versions.source_asset_id = assets.id
          where assets.curriculum_unit_id = units.id
            and versions.processing_status = 'READY'
            and versions.accepted_at is not null
            and versions.activation_status = 'ACTIVE'
            and versions.governance_state = 'AVAILABLE'
            and versions.rights_status = 'VALID'
            and versions.rights_valid_from <= transaction_timestamp()
            and (versions.rights_valid_until is null
              or versions.rights_valid_until > transaction_timestamp())
        ) then 'source.rights_current' end,
        case when not exists (
          select 1 from public.source_assets as assets
          join public.source_versions as versions on versions.source_asset_id = assets.id
          where assets.curriculum_unit_id = units.id
            and versions.processing_status = 'READY'
            and versions.accepted_at is not null
            and versions.activation_status = 'ACTIVE'
            and versions.governance_state = 'AVAILABLE'
            and versions.rights_status = 'VALID'
            and versions.rights_valid_from <= transaction_timestamp()
            and (versions.rights_valid_until is null
              or versions.rights_valid_until > transaction_timestamp())
            and versions.curriculum_edition = cohorts.curriculum_edition
        ) then 'source.edition_matches' end
      ], null::text) as failed_predicates,
      true as protected,
      null::uuid as pending_action_id,
      null::text as reason,
      null::text as command_state,
      null::text as initiator_slot
    from public.curriculum_units as units
    join public.cohorts as cohorts on cohorts.id = units.cohort_id
    where units.publication_status in ('DRAFT', 'WITHDRAWN')

    union all

    select
      'unit:hide:' || units.id::text,
      'HIDE_UNIT'::text,
      units.id,
      units.title_en || ' · ' || cohorts.name,
      units.title_ar || ' · ' || cohorts.name,
      units.publication_status,
      'WITHDRAWN'::text,
      units.publication_status,
      units.governance_version,
      array[]::text[], false, null::uuid, null::text, null::text, null::text
    from public.curriculum_units as units
    join public.cohorts as cohorts on cohorts.id = units.cohort_id
    where units.publication_status = 'PUBLISHED'

    union all

    select
      'cohort:unlock:' || cohorts.id::text,
      'UNLOCK_COHORT'::text,
      cohorts.id,
      cohorts.name,
      cohorts.name,
      coalesce(releases.release_status, 'LOCKED'),
      'UNLOCKED'::text,
      coalesce(releases.release_status, 'LOCKED'),
      coalesce(releases.governance_version, 0),
      array_remove(array[
        case when cohorts.status <> 'ACTIVE' then 'cohort.active' end,
        case when not exists (
          select 1 from public.curriculum_units as units
          where units.cohort_id = cohorts.id and units.publication_status = 'PUBLISHED'
        ) then 'unit.published' end,
        case when not exists (
          select 1 from public.curriculum_units as units
          join public.source_assets as assets
            on assets.curriculum_unit_id = units.id and assets.cohort_id = units.cohort_id
          join public.source_versions as versions on versions.source_asset_id = assets.id
          where units.cohort_id = cohorts.id and units.publication_status = 'PUBLISHED'
            and versions.processing_status = 'READY' and versions.accepted_at is not null
            and versions.activation_status = 'ACTIVE'
            and versions.governance_state = 'AVAILABLE'
        ) then 'source.active_ready' end,
        case when not exists (
          select 1 from public.curriculum_units as units
          join public.source_assets as assets
            on assets.curriculum_unit_id = units.id and assets.cohort_id = units.cohort_id
          join public.source_versions as versions on versions.source_asset_id = assets.id
          where units.cohort_id = cohorts.id and units.publication_status = 'PUBLISHED'
            and versions.processing_status = 'READY' and versions.accepted_at is not null
            and versions.activation_status = 'ACTIVE'
            and versions.governance_state = 'AVAILABLE'
            and versions.rights_status = 'VALID'
            and versions.rights_valid_from <= transaction_timestamp()
            and (versions.rights_valid_until is null
              or versions.rights_valid_until > transaction_timestamp())
        ) then 'source.rights_current' end,
        case when not exists (
          select 1 from public.curriculum_units as units
          join public.source_assets as assets
            on assets.curriculum_unit_id = units.id and assets.cohort_id = units.cohort_id
          join public.source_versions as versions on versions.source_asset_id = assets.id
          where units.cohort_id = cohorts.id and units.publication_status = 'PUBLISHED'
            and versions.processing_status = 'READY' and versions.accepted_at is not null
            and versions.activation_status = 'ACTIVE'
            and versions.governance_state = 'AVAILABLE'
            and versions.rights_status = 'VALID'
            and versions.rights_valid_from <= transaction_timestamp()
            and (versions.rights_valid_until is null
              or versions.rights_valid_until > transaction_timestamp())
            and versions.curriculum_edition = cohorts.curriculum_edition
        ) then 'source.edition_matches' end
      ], null::text), true, null::uuid, null::text, null::text, null::text
    from public.cohorts as cohorts
    left join public.cohort_releases as releases on releases.cohort_id = cohorts.id
    where coalesce(releases.release_status, 'LOCKED') = 'LOCKED'

    union all

    select
      'cohort:lock:' || cohorts.id::text,
      'LOCK_COHORT'::text,
      cohorts.id,
      cohorts.name,
      cohorts.name,
      releases.release_status,
      'LOCKED'::text,
      releases.release_status,
      releases.governance_version,
      array[]::text[], false, null::uuid, null::text, null::text, null::text
    from public.cohorts as cohorts
    join public.cohort_releases as releases on releases.cohort_id = cohorts.id
    where releases.release_status = 'UNLOCKED'

    union all

    select
      'source:activate:' || versions.id::text,
      'ACTIVATE_SOURCE'::text,
      versions.id,
      assets.canonical_title,
      assets.canonical_title,
      versions.activation_status,
      'ACTIVE'::text,
      versions.activation_status,
      versions.governance_version,
      unimind_private.admin_source_predicates(
        versions.id, cohorts.curriculum_edition, false
      ), true, null::uuid, null::text, null::text, null::text
    from public.source_versions as versions
    join public.source_assets as assets on assets.id = versions.source_asset_id
    join public.cohorts as cohorts on cohorts.id = assets.cohort_id
    where versions.activation_status in ('INACTIVE', 'DEACTIVATED')
      and versions.governance_state = 'AVAILABLE'

    union all

    select
      'source:deactivate:' || versions.id::text,
      'DEACTIVATE_SOURCE'::text,
      versions.id,
      assets.canonical_title,
      assets.canonical_title,
      versions.activation_status,
      'DEACTIVATED'::text,
      versions.activation_status,
      versions.governance_version,
      array[]::text[], false, null::uuid, null::text, null::text, null::text
    from public.source_versions as versions
    join public.source_assets as assets on assets.id = versions.source_asset_id
    where versions.activation_status = 'ACTIVE'

    union all

    select
      'source:quarantine:' || versions.id::text,
      'QUARANTINE_SOURCE'::text,
      versions.id,
      assets.canonical_title,
      assets.canonical_title,
      versions.processing_status,
      'QUARANTINED'::text,
      versions.processing_status,
      versions.governance_version,
      array[]::text[], false, null::uuid, null::text, null::text, null::text
    from public.source_versions as versions
    join public.source_assets as assets on assets.id = versions.source_asset_id
    where versions.processing_status in ('FAILED', 'NEEDS_REVIEW')
      and versions.governance_state = 'AVAILABLE'

    union all

    select
      'source:retry:' || versions.id::text,
      'RETRY_SOURCE'::text,
      versions.id,
      assets.canonical_title,
      assets.canonical_title,
      case when versions.governance_state = 'QUARANTINED'
        then 'QUARANTINED' else versions.processing_status end,
      'PENDING_OWNER_REVIEW'::text,
      case when versions.governance_state = 'QUARANTINED'
        then 'QUARANTINED' else versions.processing_status end,
      versions.governance_version,
      array_remove(array[
        case when versions.rights_status <> 'VALID'
          or versions.rights_valid_from is null
          or versions.rights_valid_from > transaction_timestamp()
          or (versions.rights_valid_until is not null
            and versions.rights_valid_until <= transaction_timestamp())
          then 'source.rights_current' end
      ], null::text), false, null::uuid, null::text, null::text, null::text
    from public.source_versions as versions
    join public.source_assets as assets on assets.id = versions.source_asset_id
    where (versions.processing_status in ('FAILED', 'NEEDS_REVIEW')
        or versions.governance_state = 'QUARANTINED')
      and not exists (
        select 1 from unimind_private.admin_action_commands as prior
        where prior.action = 'RETRY_SOURCE' and prior.target_id = versions.id
          and prior.command_state in ('PENDING_OWNER_REVIEW', 'APPLIED')
      )

    union all

    select
      'raw:place-hold:' || raw.id::text,
      'PLACE_RAW_HOLD'::text,
      raw.id,
      assets.canonical_title,
      'عنصر خام تجريبي',
      raw.status,
      'HELD'::text,
      raw.status,
      raw.governance_version,
      array[]::text[], false, null::uuid, null::text, null::text, null::text
    from unimind_private.raw_objects as raw
    join public.source_versions as versions on versions.id = raw.source_version_id
    join public.source_assets as assets on assets.id = versions.source_asset_id
    where raw.provider = 'mock-object-storage-provider'
      and raw.object_key like 'synthetic/%' and raw.status = 'STORED'

    union all

    select
      'raw:remove-hold:' || raw.id::text,
      'REMOVE_RAW_HOLD'::text,
      raw.id,
      assets.canonical_title,
      'عنصر خام تجريبي',
      raw.status,
      'STORED'::text,
      raw.status,
      raw.governance_version,
      case when unimind_private.admin_raw_safety_check(raw.id)
        then array[]::text[] else array['raw.processed_durable']::text[] end,
      true, null::uuid, null::text, null::text, null::text
    from unimind_private.raw_objects as raw
    join public.source_versions as versions on versions.id = raw.source_version_id
    join public.source_assets as assets on assets.id = versions.source_asset_id
    where raw.provider = 'mock-object-storage-provider'
      and raw.object_key like 'synthetic/%' and raw.status = 'HELD'

    union all

    select
      'flag:enable:' || flags.id::text,
      'ENABLE_FLAG'::text,
      flags.id,
      flags.key,
      flags.key,
      'DISABLED'::text,
      'ENABLED'::text,
      'DISABLED'::text,
      flags.governance_version,
      case when flags.key ~ '^mock\.artifact\.[a-z][a-z0-9_]*$'
        and flags.config_json ->> 'provider' = 'deterministic-mock'
        and flags.config_json ->> 'environment' = p_runtime_environment
        and flags.config_json ->> 'dependency_sha256' ~ '^[0-9a-f]{64}$'
        and exists (
          select 1 from unimind_private.admin_mock_artifact_approvals as approvals
          join public.profiles as approvers on approvers.user_id = approvals.approved_by
          join public.user_roles as roles on roles.user_id = approvers.user_id
          where approvals.flag_key = flags.key
            and approvals.runtime_environment = p_runtime_environment
            and approvals.dependency_sha256 = flags.config_json ->> 'dependency_sha256'
            and approvals.approved_at <= transaction_timestamp()
            and approvers.account_status = 'ACTIVE'
            and roles.role = 'ADMIN'
            and roles.revoked_at is null
        ) then array[]::text[]
        else array['flag.mock_approval_missing']::text[] end,
      true, null::uuid, null::text, null::text, null::text
    from unimind_private.system_feature_flags as flags
    where not flags.enabled

    union all

    select
      'flag:disable:' || flags.id::text,
      'DISABLE_FLAG'::text,
      flags.id,
      flags.key,
      flags.key,
      'ENABLED'::text,
      'DISABLED'::text,
      'ENABLED'::text,
      flags.governance_version,
      array[]::text[], false, null::uuid, null::text, null::text, null::text
    from unimind_private.system_feature_flags as flags
    where flags.enabled
  ), eligible_candidates as (
    select candidate.*
    from action_candidates as candidate
    where not exists (
      select 1 from unimind_private.admin_action_commands as pending
      where pending.action = candidate.action
        and pending.target_id = candidate.target_id
        and pending.command_state = 'PENDING_SECOND_CONFIRMATION'
        and pending.created_at >= transaction_timestamp() - interval '24 hours'
        and pending.expected_state = candidate.expected_state
        and pending.expected_version = candidate.expected_version
        and pending.prerequisite_sha256 = case when candidate.protected then
          unimind_private.admin_candidate_fingerprint(
            candidate.action, candidate.target_id, p_runtime_environment
          ) else null end
    )
  ), pending_actions as (
    select
      'pending:' || commands.id::text as candidate_id,
      commands.action,
      commands.target_id,
      commands.target_label_en,
      commands.target_label_ar,
      commands.current_state,
      commands.proposed_state,
      commands.expected_state,
      commands.expected_version,
      commands.failed_predicates,
      commands.protected,
      commands.id as pending_action_id,
      commands.reason,
      commands.command_state,
      confirmations.founder_slot as initiator_slot
    from unimind_private.admin_action_commands as commands
    join unimind_private.admin_action_confirmations as confirmations
      on confirmations.command_id = commands.id
    where commands.command_state = 'PENDING_SECOND_CONFIRMATION'
      and commands.created_at >= transaction_timestamp() - interval '24 hours'
      and commands.prerequisite_sha256 = unimind_private.admin_candidate_fingerprint(
        commands.action, commands.target_id, p_runtime_environment
      )
      and confirmations.confirmed_at = (
        select min(first_confirmation.confirmed_at)
        from unimind_private.admin_action_confirmations as first_confirmation
        where first_confirmation.command_id = commands.id
      )

    union all

    select
      'pending:' || commands.id::text as candidate_id,
      commands.action,
      commands.target_id,
      commands.target_label_en,
      commands.target_label_ar,
      commands.current_state,
      commands.proposed_state,
      commands.expected_state,
      commands.expected_version,
      commands.failed_predicates,
      commands.protected,
      null::uuid as pending_action_id,
      commands.reason,
      commands.command_state,
      null::text as initiator_slot
    from unimind_private.admin_action_commands as commands
    where commands.command_state = 'PENDING_OWNER_REVIEW'
  )
  select
    rows.candidate_id, rows.action, rows.target_id, rows.target_label_en,
    rows.target_label_ar, rows.current_state, rows.proposed_state,
    rows.expected_state, rows.expected_version, rows.failed_predicates,
    rows.protected, rows.pending_action_id, rows.reason, rows.command_state,
    rows.initiator_slot, pending_command.correlation_id
  from (
    select * from eligible_candidates
    union all
    select * from pending_actions
  ) as rows
  left join unimind_private.admin_action_commands as pending_command
    on pending_command.id = rows.pending_action_id
  order by
    case rows.command_state
      when 'PENDING_SECOND_CONFIRMATION' then 0
      when 'PENDING_OWNER_REVIEW' then 1
      else 2
    end,
    rows.candidate_id;
end;
$$;

revoke all on function unimind_private.admin_current_action_queue(uuid, text)
  from public, anon, authenticated;
grant execute on function unimind_private.admin_current_action_queue(uuid, text)
  to service_role;

create function public.submit_admin_governance_action(
  p_actor_id uuid,
  p_action text,
  p_target_id uuid,
  p_expected_version integer,
  p_expected_state text,
  p_reason text,
  p_correlation_id uuid,
  p_idempotency_key uuid,
  p_pending_action_id uuid default null,
  p_hold_expires_at timestamptz default null,
  p_review_attested boolean default false,
  p_runtime_environment text default 'local'
)
returns jsonb
language sql
set search_path = ''
as $$
  select unimind_private.admin_submit_governance_action(
    p_actor_id, p_action, p_target_id, p_expected_version, p_expected_state,
    p_reason, p_correlation_id, p_idempotency_key, p_pending_action_id,
    p_hold_expires_at, p_review_attested, p_runtime_environment
  );
$$;

revoke all on function public.submit_admin_governance_action(
  uuid, text, uuid, integer, text, text, uuid, uuid, uuid, timestamptz, boolean, text
) from public, anon, authenticated;
grant execute on function public.submit_admin_governance_action(
  uuid, text, uuid, integer, text, text, uuid, uuid, uuid, timestamptz, boolean, text
) to service_role;

create function public.current_admin_action_queue(
  p_actor_id uuid,
  p_runtime_environment text
)
returns table (
  candidate_id text,
  action text,
  target_id uuid,
  target_label_en text,
  target_label_ar text,
  current_state text,
  proposed_state text,
  expected_state text,
  expected_version integer,
  failed_predicates text[],
  protected boolean,
  pending_action_id uuid,
  reason text,
  command_state text,
  initiator_slot text,
  correlation_id uuid
)
language sql
set search_path = ''
as $$
  select * from unimind_private.admin_current_action_queue(
    p_actor_id, p_runtime_environment
  );
$$;

revoke all on function public.current_admin_action_queue(uuid, text)
  from public, anon, authenticated;
grant execute on function public.current_admin_action_queue(uuid, text)
  to service_role;
