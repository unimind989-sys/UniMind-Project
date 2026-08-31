create table public.education_stages (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique,
  name_en text not null,
  name_ar text not null,
  status text not null default 'ACTIVE',
  sort_order integer not null default 0,
  created_at timestamptz not null default transaction_timestamp(),
  constraint education_stages_code_check check (code ~ '^[A-Z][A-Z0-9_]*$'),
  constraint education_stages_status_check check (status in ('ACTIVE', 'INACTIVE')),
  constraint education_stages_sort_order_check check (sort_order >= 0)
);

create table public.institutions (
  id uuid primary key default extensions.gen_random_uuid(),
  education_stage_id uuid not null
    references public.education_stages(id) on delete restrict,
  code text not null,
  name_en text not null,
  name_ar text not null,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default transaction_timestamp(),
  constraint institutions_parent_code_unique unique (education_stage_id, code),
  constraint institutions_code_check check (code ~ '^[A-Z][A-Z0-9_]*$'),
  constraint institutions_status_check check (status in ('ACTIVE', 'INACTIVE'))
);

create table public.programs (
  id uuid primary key default extensions.gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete restrict,
  code text not null,
  program_type text not null,
  name_en text not null,
  name_ar text not null,
  default_unit_type public.curriculum_unit_type not null,
  unit_label_singular_en text not null,
  unit_label_plural_en text not null,
  unit_label_singular_ar text not null,
  unit_label_plural_ar text not null,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default transaction_timestamp(),
  constraint programs_parent_code_unique unique (institution_id, code),
  constraint programs_code_check check (code ~ '^[A-Z][A-Z0-9_]*$'),
  constraint programs_program_type_check
    check (program_type in ('UNIVERSITY_PROGRAM', 'SCHOOL_TRACK', 'OTHER')),
  constraint programs_status_check check (status in ('ACTIVE', 'INACTIVE'))
);

create table public.academic_levels (
  id uuid primary key default extensions.gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete restrict,
  code text not null,
  name_en text not null,
  name_ar text not null,
  sort_order integer not null default 0,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default transaction_timestamp(),
  constraint academic_levels_parent_code_unique unique (program_id, code),
  constraint academic_levels_code_check check (code ~ '^[A-Z][A-Z0-9_]*$'),
  constraint academic_levels_sort_order_check check (sort_order >= 0),
  constraint academic_levels_status_check check (status in ('ACTIVE', 'INACTIVE'))
);

create table public.terms (
  id uuid primary key default extensions.gen_random_uuid(),
  academic_level_id uuid not null
    references public.academic_levels(id) on delete restrict,
  code text not null,
  name_en text not null,
  name_ar text not null,
  sort_order integer not null default 0,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default transaction_timestamp(),
  constraint terms_parent_code_unique unique (academic_level_id, code),
  constraint terms_code_check check (code ~ '^[A-Z][A-Z0-9_]*$'),
  constraint terms_sort_order_check check (sort_order >= 0),
  constraint terms_status_check check (status in ('ACTIVE', 'INACTIVE'))
);

create table public.cohorts (
  id uuid primary key default extensions.gen_random_uuid(),
  term_id uuid not null references public.terms(id) on delete restrict,
  code text not null,
  name text not null,
  curriculum_edition text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'DRAFT',
  created_at timestamptz not null default transaction_timestamp(),
  constraint cohorts_parent_code_unique unique (term_id, code),
  constraint cohorts_code_check check (code ~ '^[A-Z][A-Z0-9_]*$'),
  constraint cohorts_status_check check (status in ('DRAFT', 'ACTIVE', 'ARCHIVED')),
  constraint cohorts_date_order_check
    check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.curriculum_units (
  id uuid primary key default extensions.gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete restrict,
  parent_unit_id uuid,
  code text not null,
  unit_type public.curriculum_unit_type not null,
  title_en text not null,
  title_ar text not null,
  sort_order integer not null default 0,
  publication_status text not null default 'DRAFT',
  published_at timestamptz,
  published_by uuid references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default transaction_timestamp(),
  constraint curriculum_units_id_cohort_unique unique (id, cohort_id),
  constraint curriculum_units_parent_code_unique unique (cohort_id, code),
  constraint curriculum_units_parent_same_cohort_fk
    foreign key (parent_unit_id, cohort_id)
    references public.curriculum_units(id, cohort_id) on delete restrict,
  constraint curriculum_units_not_own_parent_check
    check (parent_unit_id is null or parent_unit_id <> id),
  constraint curriculum_units_code_check check (code ~ '^[A-Z][A-Z0-9_]*$'),
  constraint curriculum_units_sort_order_check check (sort_order >= 0),
  constraint curriculum_units_publication_status_check
    check (publication_status in ('DRAFT', 'PUBLISHED', 'WITHDRAWN')),
  constraint curriculum_units_publication_fields_check
    check (
      (publication_status = 'DRAFT' and published_at is null and published_by is null)
      or (publication_status in ('PUBLISHED', 'WITHDRAWN') and published_at is not null and published_by is not null)
    )
);

alter table public.education_stages enable row level security;
alter table public.institutions enable row level security;
alter table public.programs enable row level security;
alter table public.academic_levels enable row level security;
alter table public.terms enable row level security;
alter table public.cohorts enable row level security;
alter table public.curriculum_units enable row level security;

revoke all on table public.education_stages from anon, authenticated;
revoke all on table public.institutions from anon, authenticated;
revoke all on table public.programs from anon, authenticated;
revoke all on table public.academic_levels from anon, authenticated;
revoke all on table public.terms from anon, authenticated;
revoke all on table public.cohorts from anon, authenticated;
revoke all on table public.curriculum_units from anon, authenticated;
