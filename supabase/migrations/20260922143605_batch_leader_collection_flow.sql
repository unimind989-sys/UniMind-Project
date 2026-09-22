alter table public.source_submissions
  add column source_description text;

alter table public.source_submissions
  add constraint source_submissions_description_check
  check (
    source_description is null
    or char_length(btrim(source_description)) between 10 and 1000
  );

-- WP03-T05 makes finalization the only authenticated write path so an assigned
-- caller cannot bypass upload evidence, requested-item scope, or idempotency.
drop policy source_submissions_insert_assigned on public.source_submissions;
revoke insert on table public.source_submissions from authenticated;

create table unimind_private.collection_uploads (
  id uuid primary key default extensions.gen_random_uuid(),
  campaign_id uuid not null references public.collection_campaigns(id) on delete restrict,
  requested_material_item_id uuid not null
    references public.requested_material_items(id) on delete restrict,
  curriculum_unit_id uuid not null
    references public.curriculum_units(id) on delete restrict,
  uploaded_by uuid not null references public.profiles(user_id) on delete restrict,
  client_idempotency_key text not null,
  original_file_name text not null,
  declared_format text not null,
  provider text not null,
  object_key text not null unique,
  checksum text not null,
  mime_type text not null,
  byte_size bigint not null,
  status text not null default 'UPLOADED',
  expires_at timestamptz not null default (transaction_timestamp() + interval '30 minutes'),
  submission_id uuid unique references public.source_submissions(id) on delete restrict,
  finalized_at timestamptz,
  created_at timestamptz not null default transaction_timestamp(),
  constraint collection_uploads_client_key_unique
    unique (campaign_id, uploaded_by, client_idempotency_key),
  constraint collection_uploads_client_key_check
    check (char_length(client_idempotency_key) between 8 and 200),
  constraint collection_uploads_file_name_check
    check (char_length(btrim(original_file_name)) between 1 and 255),
  constraint collection_uploads_format_check
    check (declared_format in ('PDF', 'WAV', 'PNG')),
  constraint collection_uploads_provider_check
    check (provider = 'mock-object-storage-provider'),
  constraint collection_uploads_object_key_check
    check (char_length(object_key) between 8 and 500),
  constraint collection_uploads_checksum_check
    check (checksum ~ '^sha256:[0-9a-f]{64}$'),
  constraint collection_uploads_mime_check
    check (mime_type in ('application/pdf', 'audio/wav', 'image/png')),
  constraint collection_uploads_size_check
    check (byte_size between 1 and 10485760),
  constraint collection_uploads_status_check
    check (status in ('UPLOADED', 'FINALIZED', 'CANCELLED')),
  constraint collection_uploads_expiry_check
    check (expires_at > created_at),
  constraint collection_uploads_finalized_fields_check
    check (
      (status = 'FINALIZED' and submission_id is not null and finalized_at is not null)
      or (status <> 'FINALIZED' and submission_id is null and finalized_at is null)
    )
);

create index collection_uploads_requested_item_idx
  on unimind_private.collection_uploads (requested_material_item_id);
create index collection_uploads_curriculum_unit_idx
  on unimind_private.collection_uploads (curriculum_unit_id);
create index collection_uploads_uploaded_by_idx
  on unimind_private.collection_uploads (uploaded_by);

revoke all on table unimind_private.collection_uploads
  from public, anon, authenticated;

create function public.current_batch_leader_campaign(
  target_campaign_id uuid default null
)
returns table (
  campaign_id uuid,
  campaign_name text,
  cohort_name text,
  campaign_opens_at timestamptz,
  campaign_closes_at timestamptz,
  assignment_expires_at timestamptz,
  requested_item_id uuid,
  curriculum_unit_id uuid,
  requested_title text,
  expected_type text,
  required boolean,
  requested_status text,
  unit_title_en text,
  unit_title_ar text,
  latest_submission_id uuid,
  latest_submission_name text,
  latest_submission_status text,
  latest_submission_created_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    campaigns.id,
    campaigns.name,
    coalesce(cohorts.name, campaigns.name),
    campaigns.opens_at,
    campaigns.closes_at,
    assignments.expires_at,
    requested.id,
    requested.curriculum_unit_id,
    requested.title,
    requested.expected_type,
    requested.required,
    requested.status,
    coalesce(units.title_en, requested.title),
    coalesce(units.title_ar, requested.title),
    latest.id,
    latest.source_name,
    latest.status,
    latest.created_at
  from public.collection_campaigns as campaigns
  left join public.cohorts as cohorts on cohorts.id = campaigns.cohort_id
  join public.batch_leader_assignments as assignments
    on assignments.campaign_id = campaigns.id
  join public.requested_material_items as requested
    on requested.campaign_id = campaigns.id
  left join public.curriculum_units as units
    on units.id = requested.curriculum_unit_id
  left join lateral (
    select submissions.id, submissions.source_name,
      submissions.status, submissions.created_at
    from public.source_submissions as submissions
    where submissions.campaign_id = campaigns.id
      and submissions.requested_material_item_id = requested.id
      and submissions.submitted_by = (select auth.uid())
    order by submissions.created_at desc, submissions.id desc
    limit 1
  ) as latest on true
  where assignments.user_id = (select auth.uid())
    and assignments.status = 'ACTIVE'
    and assignments.expires_at > transaction_timestamp()
    and campaigns.status = 'OPEN'
    and campaigns.opens_at <= transaction_timestamp()
    and campaigns.closes_at > transaction_timestamp()
    and requested.status in ('REQUESTED', 'RECEIVED')
    and (target_campaign_id is null or campaigns.id = target_campaign_id)
  order by campaigns.closes_at, requested.required desc,
    units.sort_order, requested.created_at, requested.id;
$$;

create function unimind_private.register_synthetic_collection_upload_internal(
  p_actor_id uuid,
  p_campaign_id uuid,
  p_requested_material_item_id uuid,
  p_curriculum_unit_id uuid,
  p_client_idempotency_key text,
  p_original_file_name text,
  p_declared_format text,
  p_provider text,
  p_object_key text,
  p_checksum text,
  p_mime_type text,
  p_byte_size bigint
)
returns table (
  upload_id uuid,
  upload_checksum text,
  upload_mime_type text,
  upload_byte_size bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := p_actor_id;
  existing_upload unimind_private.collection_uploads%rowtype;
begin
  if actor_id is null or (select auth.role()) <> 'service_role' then
    raise exception using errcode = '42501', message = 'collection scope unavailable';
  end if;

  if char_length(p_client_idempotency_key) not between 8 and 200
     or char_length(btrim(p_original_file_name)) not between 1 and 255
     or p_declared_format not in ('PDF', 'WAV', 'PNG')
     or p_provider <> 'mock-object-storage-provider'
     or p_checksum !~ '^sha256:[0-9a-f]{64}$'
     or p_mime_type not in ('application/pdf', 'audio/wav', 'image/png')
     or p_byte_size not between 1 and 10485760 then
    raise exception using errcode = '22023', message = 'collection upload invalid';
  end if;

  if (p_declared_format = 'PDF') <> (p_mime_type = 'application/pdf')
     or (p_declared_format = 'WAV') <> (p_mime_type = 'audio/wav')
     or (p_declared_format = 'PNG') <> (p_mime_type = 'image/png') then
    raise exception using errcode = '22023', message = 'collection upload mismatch';
  end if;

  perform 1
  from public.collection_campaigns as campaigns
  join public.batch_leader_assignments as assignments
    on assignments.campaign_id = campaigns.id
  join public.requested_material_items as requested
    on requested.campaign_id = campaigns.id
  join public.campaign_curriculum_units as campaign_units
    on campaign_units.campaign_id = campaigns.id
   and campaign_units.curriculum_unit_id = requested.curriculum_unit_id
  where campaigns.id = p_campaign_id
    and campaigns.status = 'OPEN'
    and campaigns.opens_at <= transaction_timestamp()
    and campaigns.closes_at > transaction_timestamp()
    and assignments.user_id = actor_id
    and assignments.status = 'ACTIVE'
    and assignments.expires_at > transaction_timestamp()
    and requested.id = p_requested_material_item_id
    and requested.curriculum_unit_id = p_curriculum_unit_id
    and requested.status in ('REQUESTED', 'RECEIVED')
    and (
      requested.expected_type = 'OTHER'
      or (requested.expected_type = 'DOCUMENT' and p_declared_format = 'PDF')
      or (requested.expected_type = 'AUDIO' and p_declared_format = 'WAV')
      or (requested.expected_type = 'IMAGE' and p_declared_format = 'PNG')
    );
  if not found then
    raise exception using errcode = '42501', message = 'collection scope unavailable';
  end if;

  select uploads.*
  into existing_upload
  from unimind_private.collection_uploads as uploads
  where uploads.campaign_id = p_campaign_id
    and uploads.uploaded_by = actor_id
    and uploads.client_idempotency_key = p_client_idempotency_key
  for update;

  if found then
    if existing_upload.requested_material_item_id <> p_requested_material_item_id
       or existing_upload.curriculum_unit_id <> p_curriculum_unit_id
       or existing_upload.original_file_name <> btrim(p_original_file_name)
       or existing_upload.declared_format <> p_declared_format
       or existing_upload.provider <> p_provider
       or existing_upload.checksum <> p_checksum
       or existing_upload.mime_type <> p_mime_type
       or existing_upload.byte_size <> p_byte_size then
      raise exception using errcode = '23505', message = 'collection idempotency conflict';
    end if;

    return query
    select existing_upload.id, existing_upload.checksum,
      existing_upload.mime_type, existing_upload.byte_size;
    return;
  end if;

  return query
  insert into unimind_private.collection_uploads (
    campaign_id,
    requested_material_item_id,
    curriculum_unit_id,
    uploaded_by,
    client_idempotency_key,
    original_file_name,
    declared_format,
    provider,
    object_key,
    checksum,
    mime_type,
    byte_size
  ) values (
    p_campaign_id,
    p_requested_material_item_id,
    p_curriculum_unit_id,
    actor_id,
    p_client_idempotency_key,
    btrim(p_original_file_name),
    p_declared_format,
    p_provider,
    p_object_key,
    p_checksum,
    p_mime_type,
    p_byte_size
  )
  returning id, checksum, mime_type, byte_size;
end;
$$;

create function unimind_private.finalize_synthetic_source_submission_internal(
  p_campaign_id uuid,
  p_requested_material_item_id uuid,
  p_upload_id uuid,
  p_client_idempotency_key text,
  p_source_name text,
  p_source_description text,
  p_declared_rights text
)
returns table (
  submission_id uuid,
  submission_status text,
  submission_created_at timestamptz,
  replayed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target_upload unimind_private.collection_uploads%rowtype;
  target_campaign public.collection_campaigns%rowtype;
  target_submission public.source_submissions%rowtype;
begin
  if actor_id is null then
    raise exception using errcode = '42501', message = 'collection scope unavailable';
  end if;
  if p_declared_rights <> 'DECLARED' then
    raise exception using errcode = '42501', message = 'collection rights unavailable';
  end if;
  if char_length(p_client_idempotency_key) not between 8 and 200
     or char_length(btrim(p_source_name)) not between 3 and 200
     or char_length(btrim(p_source_description)) not between 10 and 1000 then
    raise exception using errcode = '22023', message = 'collection submission invalid';
  end if;

  select uploads.*
  into target_upload
  from unimind_private.collection_uploads as uploads
  where uploads.id = p_upload_id
    and uploads.campaign_id = p_campaign_id
    and uploads.requested_material_item_id = p_requested_material_item_id
    and uploads.uploaded_by = actor_id
    and uploads.client_idempotency_key = p_client_idempotency_key
  for update;
  if not found then
    raise exception using errcode = '42501', message = 'collection scope unavailable';
  end if;

  select campaigns.*
  into target_campaign
  from public.collection_campaigns as campaigns
  join public.batch_leader_assignments as assignments
    on assignments.campaign_id = campaigns.id
  join public.requested_material_items as requested
    on requested.campaign_id = campaigns.id
  join public.campaign_curriculum_units as campaign_units
    on campaign_units.campaign_id = campaigns.id
   and campaign_units.curriculum_unit_id = target_upload.curriculum_unit_id
  where campaigns.id = p_campaign_id
    and campaigns.status = 'OPEN'
    and campaigns.opens_at <= transaction_timestamp()
    and campaigns.closes_at > transaction_timestamp()
    and assignments.user_id = actor_id
    and assignments.status = 'ACTIVE'
    and assignments.expires_at > transaction_timestamp()
    and requested.id = p_requested_material_item_id
    and requested.curriculum_unit_id = target_upload.curriculum_unit_id
    and requested.status in ('REQUESTED', 'RECEIVED');
  if not found then
    raise exception using errcode = '42501', message = 'collection scope unavailable';
  end if;

  if target_upload.status = 'FINALIZED' then
    select submissions.*
    into target_submission
    from public.source_submissions as submissions
    where submissions.id = target_upload.submission_id
      and submissions.submitted_by = actor_id;
    if not found
       or target_submission.source_name <> btrim(p_source_name)
       or target_submission.source_description <> btrim(p_source_description)
       or target_submission.declared_rights <> p_declared_rights then
      raise exception using errcode = '23505', message = 'collection idempotency conflict';
    end if;
    return query
    select target_submission.id, target_submission.status,
      target_submission.created_at, true;
    return;
  end if;

  if target_upload.status <> 'UPLOADED'
     or target_upload.expires_at <= transaction_timestamp() then
    raise exception using errcode = '42501', message = 'collection upload unavailable';
  end if;

  insert into public.source_submissions (
    campaign_id,
    curriculum_unit_id,
    cohort_id,
    requested_material_item_id,
    submitted_by,
    client_idempotency_key,
    source_name,
    source_description,
    declared_format,
    declared_rights,
    status
  ) values (
    p_campaign_id,
    target_upload.curriculum_unit_id,
    target_campaign.cohort_id,
    p_requested_material_item_id,
    actor_id,
    p_client_idempotency_key,
    btrim(p_source_name),
    btrim(p_source_description),
    target_upload.declared_format,
    p_declared_rights,
    'RECEIVED'
  )
  returning * into target_submission;

  update unimind_private.collection_uploads
  set status = 'FINALIZED',
      submission_id = target_submission.id,
      finalized_at = transaction_timestamp()
  where id = target_upload.id;

  update public.requested_material_items
  set status = 'RECEIVED'
  where id = p_requested_material_item_id
    and status = 'REQUESTED';

  return query
  select target_submission.id, target_submission.status,
    target_submission.created_at, false;
end;
$$;

create function public.register_synthetic_collection_upload(
  p_actor_id uuid,
  p_campaign_id uuid,
  p_requested_material_item_id uuid,
  p_curriculum_unit_id uuid,
  p_client_idempotency_key text,
  p_original_file_name text,
  p_declared_format text,
  p_provider text,
  p_object_key text,
  p_checksum text,
  p_mime_type text,
  p_byte_size bigint
)
returns table (
  upload_id uuid,
  upload_checksum text,
  upload_mime_type text,
  upload_byte_size bigint
)
language sql
security invoker
set search_path = ''
as $$
  select *
  from unimind_private.register_synthetic_collection_upload_internal(
    p_actor_id,
    p_campaign_id,
    p_requested_material_item_id,
    p_curriculum_unit_id,
    p_client_idempotency_key,
    p_original_file_name,
    p_declared_format,
    p_provider,
    p_object_key,
    p_checksum,
    p_mime_type,
    p_byte_size
  );
$$;

create function public.finalize_synthetic_source_submission(
  p_campaign_id uuid,
  p_requested_material_item_id uuid,
  p_upload_id uuid,
  p_client_idempotency_key text,
  p_source_name text,
  p_source_description text,
  p_declared_rights text
)
returns table (
  submission_id uuid,
  submission_status text,
  submission_created_at timestamptz,
  replayed boolean
)
language sql
security invoker
set search_path = ''
as $$
  select *
  from unimind_private.finalize_synthetic_source_submission_internal(
    p_campaign_id,
    p_requested_material_item_id,
    p_upload_id,
    p_client_idempotency_key,
    p_source_name,
    p_source_description,
    p_declared_rights
  );
$$;

revoke all on function unimind_private.register_synthetic_collection_upload_internal(
  uuid, uuid, uuid, uuid, text, text, text, text, text, text, text, bigint
) from public, anon, authenticated;
revoke all on function public.current_batch_leader_campaign(uuid)
  from public, anon, authenticated;
revoke all on function unimind_private.finalize_synthetic_source_submission_internal(
  uuid, uuid, uuid, text, text, text, text
) from public, anon, authenticated;
revoke all on function public.register_synthetic_collection_upload(
  uuid, uuid, uuid, uuid, text, text, text, text, text, text, text, bigint
) from public, anon, authenticated;
revoke all on function public.finalize_synthetic_source_submission(
  uuid, uuid, uuid, text, text, text, text
) from public, anon, authenticated;

grant execute on function unimind_private.register_synthetic_collection_upload_internal(
  uuid, uuid, uuid, uuid, text, text, text, text, text, text, text, bigint
) to service_role;
grant execute on function unimind_private.finalize_synthetic_source_submission_internal(
  uuid, uuid, uuid, text, text, text, text
) to authenticated;
grant execute on function public.current_batch_leader_campaign(uuid)
  to authenticated;
grant execute on function public.register_synthetic_collection_upload(
  uuid, uuid, uuid, uuid, text, text, text, text, text, text, text, bigint
) to service_role;
grant execute on function public.finalize_synthetic_source_submission(
  uuid, uuid, uuid, text, text, text, text
) to authenticated;
