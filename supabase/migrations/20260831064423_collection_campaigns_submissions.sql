create table public.collection_campaigns (
  id uuid primary key default extensions.gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete restrict,
  name text not null,
  status text not null default 'DRAFT',
  opens_at timestamptz,
  closes_at timestamptz,
  created_by uuid not null references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default transaction_timestamp(),
  constraint collection_campaigns_id_cohort_unique unique (id, cohort_id),
  constraint collection_campaigns_status_check
    check (status in ('DRAFT', 'OPEN', 'CLOSED', 'CANCELLED')),
  constraint collection_campaigns_time_order_check
    check (closes_at is null or opens_at is null or closes_at > opens_at),
  constraint collection_campaigns_open_fields_check
    check (status <> 'OPEN' or (opens_at is not null and closes_at is not null))
);

create table public.campaign_curriculum_units (
  id uuid primary key default extensions.gen_random_uuid(),
  campaign_id uuid not null,
  curriculum_unit_id uuid not null,
  cohort_id uuid not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint campaign_curriculum_units_campaign_fk
    foreign key (campaign_id, cohort_id)
    references public.collection_campaigns(id, cohort_id) on delete restrict,
  constraint campaign_curriculum_units_unit_fk
    foreign key (curriculum_unit_id, cohort_id)
    references public.curriculum_units(id, cohort_id) on delete restrict,
  constraint campaign_curriculum_units_pair_unique
    unique (campaign_id, curriculum_unit_id)
);

create table public.batch_leader_assignments (
  id uuid primary key default extensions.gen_random_uuid(),
  campaign_id uuid not null references public.collection_campaigns(id) on delete restrict,
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  status text not null default 'INVITED',
  expires_at timestamptz not null,
  invited_by uuid not null references public.profiles(user_id) on delete restrict,
  accepted_at timestamptz,
  revoked_at timestamptz,
  reason text,
  created_at timestamptz not null default transaction_timestamp(),
  constraint batch_leader_assignments_status_check
    check (status in ('INVITED', 'ACTIVE', 'EXPIRED', 'REVOKED')),
  constraint batch_leader_assignments_active_fields_check
    check (status <> 'ACTIVE' or accepted_at is not null),
  constraint batch_leader_assignments_revoked_fields_check
    check (
      (status = 'REVOKED' and revoked_at is not null and nullif(btrim(reason), '') is not null)
      or (status <> 'REVOKED' and revoked_at is null)
    ),
  constraint batch_leader_assignments_time_check
    check (expires_at > created_at and (accepted_at is null or accepted_at >= created_at))
);

create unique index batch_leader_assignments_one_current
  on public.batch_leader_assignments (campaign_id, user_id)
  where status in ('INVITED', 'ACTIVE');

create table public.requested_material_items (
  id uuid primary key default extensions.gen_random_uuid(),
  campaign_id uuid not null references public.collection_campaigns(id) on delete restrict,
  curriculum_unit_id uuid not null
    references public.curriculum_units(id) on delete restrict,
  title text not null,
  expected_type text not null,
  required boolean not null default true,
  status text not null default 'REQUESTED',
  created_at timestamptz not null default transaction_timestamp(),
  constraint requested_material_items_status_check
    check (status in ('REQUESTED', 'RECEIVED', 'WAIVED', 'CANCELLED')),
  constraint requested_material_items_expected_type_check
    check (expected_type in ('DOCUMENT', 'AUDIO', 'IMAGE', 'OTHER')),
  constraint requested_material_items_campaign_unit_unique
    unique (campaign_id, curriculum_unit_id, title)
);

create table public.source_submissions (
  id uuid primary key default extensions.gen_random_uuid(),
  campaign_id uuid not null,
  curriculum_unit_id uuid not null,
  cohort_id uuid not null,
  requested_material_item_id uuid
    references public.requested_material_items(id) on delete restrict,
  submitted_by uuid not null references public.profiles(user_id) on delete restrict,
  client_idempotency_key text not null,
  source_name text not null,
  declared_format text not null,
  declared_rights text not null,
  status text not null default 'RECEIVED',
  created_at timestamptz not null default transaction_timestamp(),
  constraint source_submissions_campaign_fk
    foreign key (campaign_id, cohort_id)
    references public.collection_campaigns(id, cohort_id) on delete restrict,
  constraint source_submissions_unit_fk
    foreign key (curriculum_unit_id, cohort_id)
    references public.curriculum_units(id, cohort_id) on delete restrict,
  constraint source_submissions_client_key_unique
    unique (campaign_id, submitted_by, client_idempotency_key),
  constraint source_submissions_client_key_check
    check (char_length(client_idempotency_key) between 8 and 200),
  constraint source_submissions_rights_check
    check (declared_rights in ('DECLARED', 'NOT_DECLARED', 'UNKNOWN')),
  constraint source_submissions_status_check
    check (status in ('RECEIVED', 'PROCESSING', 'NEEDS_INFORMATION', 'ACCEPTED', 'REJECTED', 'COMPLETED'))
);

alter table public.collection_campaigns enable row level security;
alter table public.campaign_curriculum_units enable row level security;
alter table public.batch_leader_assignments enable row level security;
alter table public.requested_material_items enable row level security;
alter table public.source_submissions enable row level security;

revoke all on table public.collection_campaigns from anon, authenticated;
revoke all on table public.campaign_curriculum_units from anon, authenticated;
revoke all on table public.batch_leader_assignments from anon, authenticated;
revoke all on table public.requested_material_items from anon, authenticated;
revoke all on table public.source_submissions from anon, authenticated;
