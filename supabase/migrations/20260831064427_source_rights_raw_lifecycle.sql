create table public.source_assets (
  id uuid primary key default extensions.gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete restrict,
  curriculum_unit_id uuid not null,
  canonical_title text not null,
  source_kind text not null,
  contributor_label text,
  created_at timestamptz not null default transaction_timestamp(),
  constraint source_assets_id_scope_unique unique (id, cohort_id, curriculum_unit_id),
  constraint source_assets_unit_scope_fk
    foreign key (curriculum_unit_id, cohort_id)
    references public.curriculum_units(id, cohort_id) on delete restrict,
  constraint source_assets_kind_check
    check (source_kind in ('BOOK', 'LECTURE_NOTE', 'SLIDE', 'RECORDING', 'EXAM', 'PROFESSOR_NOTE', 'OTHER'))
);

create table public.source_versions (
  id uuid primary key default extensions.gen_random_uuid(),
  source_asset_id uuid not null references public.source_assets(id) on delete restrict,
  version_number integer not null,
  submission_id uuid not null unique references public.source_submissions(id) on delete restrict,
  checksum text not null,
  mime_type text not null,
  byte_size bigint not null,
  duration_ms bigint,
  page_count integer,
  language_profile text not null,
  curriculum_edition text not null,
  rights_status text not null default 'PENDING',
  rights_valid_from timestamptz,
  rights_valid_until timestamptz,
  processing_status text not null default 'RECEIVED',
  activation_status text not null default 'INACTIVE',
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default transaction_timestamp(),
  constraint source_versions_id_asset_unique unique (id, source_asset_id),
  constraint source_versions_asset_version_unique unique (source_asset_id, version_number),
  constraint source_versions_asset_checksum_unique unique (source_asset_id, checksum),
  constraint source_versions_number_check check (version_number > 0),
  constraint source_versions_checksum_check check (checksum ~ '^sha256:[0-9a-f]{64}$'),
  constraint source_versions_size_check check (byte_size >= 0),
  constraint source_versions_duration_check check (duration_ms is null or duration_ms >= 0),
  constraint source_versions_page_count_check check (page_count is null or page_count > 0),
  constraint source_versions_rights_status_check
    check (rights_status in ('PENDING', 'VALID', 'BLOCKED', 'REVOKED', 'EXPIRED')),
  constraint source_versions_processing_status_check
    check (processing_status in ('RECEIVED', 'VALIDATING', 'PROCESSING', 'NEEDS_REVIEW', 'READY', 'FAILED', 'REJECTED')),
  constraint source_versions_activation_status_check
    check (activation_status in ('INACTIVE', 'ACTIVE', 'DEACTIVATED')),
  constraint source_versions_rights_window_check
    check (rights_valid_until is null or rights_valid_from is null or rights_valid_until > rights_valid_from),
  constraint source_versions_valid_rights_fields_check
    check (rights_status <> 'VALID' or rights_valid_from is not null),
  constraint source_versions_accepted_fields_check
    check (
      (accepted_at is null and accepted_by is null)
      or (accepted_at is not null and accepted_by is not null)
    ),
  constraint source_versions_ready_gate_check
    check (
      processing_status <> 'READY'
      or (rights_status = 'VALID' and activation_status = 'ACTIVE' and accepted_at is not null)
    )
);

create table unimind_private.raw_objects (
  id uuid primary key default extensions.gen_random_uuid(),
  source_version_id uuid not null unique
    references public.source_versions(id) on delete restrict,
  provider text not null,
  object_key text not null unique,
  status text not null default 'PENDING',
  received_at timestamptz,
  delete_after timestamptz,
  hold_reason text,
  deleted_at timestamptz,
  last_error text,
  created_at timestamptz not null default transaction_timestamp(),
  constraint raw_objects_status_check
    check (status in ('PENDING', 'STORED', 'DELETE_PENDING', 'DELETE_FAILED', 'HELD', 'DELETED', 'FAILED')),
  constraint raw_objects_received_fields_check
    check (status in ('PENDING', 'FAILED') or received_at is not null),
  constraint raw_objects_hold_fields_check
    check ((status = 'HELD') = (hold_reason is not null)),
  constraint raw_objects_deleted_fields_check
    check ((status = 'DELETED') = (deleted_at is not null)),
  constraint raw_objects_delete_after_received_check
    check (delete_after is null or received_at is null or delete_after > received_at)
);

create table unimind_private.raw_deletion_events (
  id uuid primary key default extensions.gen_random_uuid(),
  raw_object_id uuid not null
    references unimind_private.raw_objects(id) on delete restrict,
  event_type text not null,
  attempt_number integer not null,
  provider_result jsonb not null default '{}'::jsonb,
  verified_absent boolean not null default false,
  occurred_at timestamptz not null default transaction_timestamp(),
  correlation_id uuid not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint raw_deletion_events_attempt_unique unique (raw_object_id, attempt_number),
  constraint raw_deletion_events_attempt_check check (attempt_number > 0),
  constraint raw_deletion_events_type_check
    check (event_type in ('REQUESTED', 'SUCCEEDED', 'FAILED', 'VERIFIED_ABSENT')),
  constraint raw_deletion_events_verified_check
    check (not verified_absent or event_type = 'VERIFIED_ABSENT')
);

create function unimind_private.enforce_source_version_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.source_asset_id, new.version_number, new.submission_id, new.checksum,
      new.mime_type, new.byte_size, new.duration_ms, new.page_count,
      new.language_profile, new.curriculum_edition, new.created_at)
     is distinct from
     (old.source_asset_id, old.version_number, old.submission_id, old.checksum,
      old.mime_type, old.byte_size, old.duration_ms, old.page_count,
      old.language_profile, old.curriculum_edition, old.created_at) then
    raise exception using errcode = '55000', message = 'accepted source-version identity is immutable';
  end if;

  perform unimind_private.assert_valid_transition(
    'source_processing', old.processing_status, new.processing_status
  );

  return new;
end;
$$;

create function unimind_private.enforce_raw_object_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform unimind_private.assert_valid_transition(
    'raw_object', old.status, new.status
  );
  return new;
end;
$$;

revoke all on function unimind_private.enforce_source_version_update()
  from public, anon, authenticated;
revoke all on function unimind_private.enforce_raw_object_transition()
  from public, anon, authenticated;

create trigger source_versions_controlled_update
before update on public.source_versions
for each row execute function unimind_private.enforce_source_version_update();

create trigger raw_objects_controlled_transition
before update on unimind_private.raw_objects
for each row execute function unimind_private.enforce_raw_object_transition();

create trigger raw_deletion_events_append_only
before update or delete on unimind_private.raw_deletion_events
for each row execute function unimind_private.reject_row_mutation();

alter table public.source_assets enable row level security;
alter table public.source_versions enable row level security;

revoke all on table public.source_assets from anon, authenticated;
revoke all on table public.source_versions from anon, authenticated;
revoke all on table unimind_private.raw_objects from public, anon, authenticated;
revoke all on table unimind_private.raw_deletion_events from public, anon, authenticated;
