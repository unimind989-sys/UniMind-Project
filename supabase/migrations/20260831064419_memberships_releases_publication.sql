create table public.cohort_memberships (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  cohort_id uuid not null references public.cohorts(id) on delete restrict,
  status text not null default 'PENDING',
  starts_at timestamptz,
  ends_at timestamptz,
  granted_by uuid references public.profiles(user_id) on delete restrict,
  grant_reason text,
  created_at timestamptz not null default transaction_timestamp(),
  constraint cohort_memberships_status_check
    check (status in ('PENDING', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED')),
  constraint cohort_memberships_time_order_check
    check (ends_at is null or starts_at is null or ends_at > starts_at),
  constraint cohort_memberships_active_fields_check
    check (status <> 'ACTIVE' or (starts_at is not null and granted_by is not null))
);

create unique index cohort_memberships_one_current
  on public.cohort_memberships (user_id, cohort_id)
  where status in ('PENDING', 'ACTIVE', 'SUSPENDED');

create table public.cohort_releases (
  id uuid primary key default extensions.gen_random_uuid(),
  cohort_id uuid not null unique references public.cohorts(id) on delete restrict,
  release_status text not null default 'LOCKED',
  changed_by uuid not null references public.profiles(user_id) on delete restrict,
  changed_at timestamptz not null default transaction_timestamp(),
  reason text not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint cohort_releases_status_check
    check (release_status in ('LOCKED', 'UNLOCKED')),
  constraint cohort_releases_reason_check check (nullif(btrim(reason), '') is not null),
  constraint cohort_releases_changed_after_created_check check (changed_at >= created_at)
);

create table public.curriculum_unit_publication_events (
  id uuid primary key default extensions.gen_random_uuid(),
  curriculum_unit_id uuid not null
    references public.curriculum_units(id) on delete restrict,
  prior_status text not null,
  new_status text not null,
  changed_by uuid not null references public.profiles(user_id) on delete restrict,
  changed_at timestamptz not null default transaction_timestamp(),
  reason text not null,
  correlation_id uuid not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint curriculum_unit_publication_events_prior_check
    check (prior_status in ('DRAFT', 'PUBLISHED', 'WITHDRAWN')),
  constraint curriculum_unit_publication_events_new_check
    check (new_status in ('DRAFT', 'PUBLISHED', 'WITHDRAWN')),
  constraint curriculum_unit_publication_events_changed_check
    check (prior_status <> new_status),
  constraint curriculum_unit_publication_events_reason_check
    check (nullif(btrim(reason), '') is not null),
  constraint curriculum_unit_publication_events_changed_after_created_check
    check (changed_at >= created_at)
);

create trigger curriculum_unit_publication_events_append_only
before update or delete on public.curriculum_unit_publication_events
for each row execute function unimind_private.reject_row_mutation();

alter table public.cohort_memberships enable row level security;
alter table public.cohort_releases enable row level security;
alter table public.curriculum_unit_publication_events enable row level security;

revoke all on table public.cohort_memberships from anon, authenticated;
revoke all on table public.cohort_releases from anon, authenticated;
revoke all on table public.curriculum_unit_publication_events from anon, authenticated;
