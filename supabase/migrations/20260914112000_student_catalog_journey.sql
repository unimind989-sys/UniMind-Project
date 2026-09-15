alter table public.programs
  add column progression_mode text not null default 'TERM_BASED',
  add constraint programs_progression_mode_check
    check (progression_mode in ('TERM_BASED', 'FLEXIBLE_CREDIT'));

create function public.available_catalog_entries()
returns table (
  education_stage_id uuid,
  education_stage_code text,
  education_stage_name_en text,
  education_stage_name_ar text,
  education_stage_sort_order integer,
  institution_id uuid,
  institution_code text,
  institution_name_en text,
  institution_name_ar text,
  program_id uuid,
  program_code text,
  program_name_en text,
  program_name_ar text,
  program_progression_mode text,
  program_default_unit_type public.curriculum_unit_type,
  unit_label_singular_en text,
  unit_label_plural_en text,
  unit_label_singular_ar text,
  unit_label_plural_ar text,
  academic_level_id uuid,
  academic_level_code text,
  academic_level_name_en text,
  academic_level_name_ar text,
  academic_level_sort_order integer,
  term_id uuid,
  term_code text,
  term_name_en text,
  term_name_ar text,
  term_sort_order integer,
  cohort_id uuid,
  cohort_code text,
  cohort_name text,
  curriculum_edition text,
  curriculum_unit_id uuid,
  curriculum_unit_code text,
  curriculum_unit_type public.curriculum_unit_type,
  curriculum_unit_title_en text,
  curriculum_unit_title_ar text,
  curriculum_unit_sort_order integer,
  source_count integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    stages.id,
    stages.code,
    stages.name_en,
    stages.name_ar,
    stages.sort_order,
    institutions.id,
    institutions.code,
    institutions.name_en,
    institutions.name_ar,
    programs.id,
    programs.code,
    programs.name_en,
    programs.name_ar,
    programs.progression_mode,
    programs.default_unit_type,
    programs.unit_label_singular_en,
    programs.unit_label_plural_en,
    programs.unit_label_singular_ar,
    programs.unit_label_plural_ar,
    levels.id,
    levels.code,
    levels.name_en,
    levels.name_ar,
    levels.sort_order,
    terms.id,
    terms.code,
    terms.name_en,
    terms.name_ar,
    terms.sort_order,
    cohorts.id,
    cohorts.code,
    cohorts.name,
    cohorts.curriculum_edition,
    available.id,
    available.code,
    available.unit_type,
    available.title_en,
    available.title_ar,
    available.sort_order,
    source_facts.source_count
  from public.available_curriculum_units(false) as available
  join public.cohorts as cohorts on cohorts.id = available.cohort_id
  join public.terms as terms on terms.id = cohorts.term_id
  join public.academic_levels as levels on levels.id = terms.academic_level_id
  join public.programs as programs on programs.id = levels.program_id
  join public.institutions as institutions on institutions.id = programs.institution_id
  join public.education_stages as stages on stages.id = institutions.education_stage_id
  cross join lateral (
    select count(distinct assets.id)::integer as source_count
    from public.source_assets as assets
    join public.source_versions as versions on versions.source_asset_id = assets.id
    where assets.cohort_id = available.cohort_id
      and assets.curriculum_unit_id = available.id
      and versions.processing_status = 'READY'
      and versions.activation_status = 'ACTIVE'
      and versions.rights_status = 'VALID'
      and versions.rights_valid_from <= transaction_timestamp()
      and (
        versions.rights_valid_until is null
        or versions.rights_valid_until > transaction_timestamp()
      )
      and versions.curriculum_edition = cohorts.curriculum_edition
  ) as source_facts
  where available.availability_state = 'AVAILABLE'
  order by
    stages.sort_order,
    institutions.code,
    programs.code,
    levels.sort_order,
    terms.sort_order,
    cohorts.code,
    available.sort_order,
    available.code;
$$;

revoke all on function public.available_catalog_entries()
  from public, anon, authenticated;
grant execute on function public.available_catalog_entries()
  to authenticated;

create function public.current_student_catalog_state()
returns text
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
begin
  if caller_id is null then
    return 'NO_MEMBERSHIP';
  end if;

  if exists (select 1 from public.available_curriculum_units(false)) then
    return 'READY';
  end if;

  if not exists (
    select 1
    from public.cohort_memberships as memberships
    where memberships.user_id = caller_id
      and memberships.status = 'ACTIVE'
      and (
        memberships.starts_at is null
        or memberships.starts_at <= transaction_timestamp()
      )
      and (
        memberships.ends_at is null
        or memberships.ends_at > transaction_timestamp()
      )
  ) then
    return 'NO_MEMBERSHIP';
  end if;

  if not exists (
    select 1
    from public.cohort_memberships as memberships
    join public.cohort_releases as releases
      on releases.cohort_id = memberships.cohort_id
    where memberships.user_id = caller_id
      and memberships.status = 'ACTIVE'
      and (
        memberships.starts_at is null
        or memberships.starts_at <= transaction_timestamp()
      )
      and (
        memberships.ends_at is null
        or memberships.ends_at > transaction_timestamp()
      )
      and releases.release_status = 'UNLOCKED'
  ) then
    return 'COHORT_LOCKED';
  end if;

  if not exists (
    select 1
    from public.curriculum_units as units
    join public.cohort_memberships as memberships
      on memberships.cohort_id = units.cohort_id
    join public.cohort_releases as releases
      on releases.cohort_id = memberships.cohort_id
    where memberships.user_id = caller_id
      and memberships.status = 'ACTIVE'
      and (
        memberships.starts_at is null
        or memberships.starts_at <= transaction_timestamp()
      )
      and (
        memberships.ends_at is null
        or memberships.ends_at > transaction_timestamp()
      )
      and releases.release_status = 'UNLOCKED'
  ) then
    return 'NO_CATALOG';
  end if;

  if not exists (
    select 1
    from public.curriculum_units as units
    join public.cohort_memberships as memberships
      on memberships.cohort_id = units.cohort_id
    join public.cohort_releases as releases
      on releases.cohort_id = memberships.cohort_id
    where memberships.user_id = caller_id
      and memberships.status = 'ACTIVE'
      and (
        memberships.starts_at is null
        or memberships.starts_at <= transaction_timestamp()
      )
      and (
        memberships.ends_at is null
        or memberships.ends_at > transaction_timestamp()
      )
      and releases.release_status = 'UNLOCKED'
      and units.publication_status = 'PUBLISHED'
  ) then
    return 'UNIT_UNPUBLISHED';
  end if;

  return 'READY_SOURCE_MISSING';
end;
$$;

revoke all on function public.current_student_catalog_state()
  from public, anon, authenticated;
grant execute on function public.current_student_catalog_state()
  to authenticated;
