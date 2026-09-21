create function public.current_student_workspace(
  target_cohort_id uuid,
  target_curriculum_unit_id uuid
)
returns table (
  education_stage_name_en text,
  education_stage_name_ar text,
  institution_name_en text,
  institution_name_ar text,
  program_name_en text,
  program_name_ar text,
  program_progression_mode text,
  unit_label_singular_en text,
  unit_label_plural_en text,
  unit_label_singular_ar text,
  unit_label_plural_ar text,
  academic_level_name_en text,
  academic_level_name_ar text,
  term_name_en text,
  term_name_ar text,
  cohort_id uuid,
  cohort_name text,
  curriculum_edition text,
  curriculum_unit_id uuid,
  curriculum_unit_type public.curriculum_unit_type,
  curriculum_unit_title_en text,
  curriculum_unit_title_ar text,
  source_count integer,
  material_updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    entries.education_stage_name_en,
    entries.education_stage_name_ar,
    entries.institution_name_en,
    entries.institution_name_ar,
    entries.program_name_en,
    entries.program_name_ar,
    entries.program_progression_mode,
    entries.unit_label_singular_en,
    entries.unit_label_plural_en,
    entries.unit_label_singular_ar,
    entries.unit_label_plural_ar,
    entries.academic_level_name_en,
    entries.academic_level_name_ar,
    entries.term_name_en,
    entries.term_name_ar,
    entries.cohort_id,
    entries.cohort_name,
    entries.curriculum_edition,
    entries.curriculum_unit_id,
    entries.curriculum_unit_type,
    entries.curriculum_unit_title_en,
    entries.curriculum_unit_title_ar,
    entries.source_count,
    source_facts.material_updated_at
  from public.available_catalog_entries() as entries
  cross join lateral (
    select max(coalesce(versions.accepted_at, versions.created_at)) as material_updated_at
    from public.source_assets as assets
    join public.source_versions as versions on versions.source_asset_id = assets.id
    where assets.cohort_id = entries.cohort_id
      and assets.curriculum_unit_id = entries.curriculum_unit_id
      and versions.processing_status = 'READY'
      and versions.activation_status = 'ACTIVE'
      and versions.rights_status = 'VALID'
      and versions.rights_valid_from <= transaction_timestamp()
      and (
        versions.rights_valid_until is null
        or versions.rights_valid_until > transaction_timestamp()
      )
      and versions.curriculum_edition = entries.curriculum_edition
  ) as source_facts
  where entries.cohort_id = target_cohort_id
    and entries.curriculum_unit_id = target_curriculum_unit_id;
$$;

revoke all on function public.current_student_workspace(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.current_student_workspace(uuid, uuid)
  to authenticated;
