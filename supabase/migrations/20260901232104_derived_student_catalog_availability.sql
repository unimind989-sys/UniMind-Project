drop policy chat_sessions_insert_own_available on public.chat_sessions;
drop policy studio_requests_insert_own_available on public.studio_requests;
drop function public.available_curriculum_units();

create function public.available_curriculum_units(
  admin_preview boolean default false
)
returns table (
  id uuid,
  cohort_id uuid,
  parent_unit_id uuid,
  code text,
  unit_type public.curriculum_unit_type,
  title_en text,
  title_ar text,
  sort_order integer,
  publication_status text,
  availability_state text,
  reason_codes text[]
)
language sql
stable
security invoker
set search_path = ''
as $$
  with caller as (
    select
      (select auth.uid()) as user_id,
      (select public.is_admin()) as is_admin
  ),
  availability_facts as (
    select
      units.id,
      units.cohort_id,
      units.parent_unit_id,
      units.code,
      units.unit_type,
      units.title_en,
      units.title_ar,
      units.sort_order,
      units.publication_status,
      caller.is_admin,
      (
        public.has_active_membership(cohorts.id)
        or (coalesce(admin_preview, false) and caller.is_admin)
      ) as membership_active,
      coalesce(releases.release_status = 'UNLOCKED', false) as cohort_unlocked,
      units.publication_status = 'PUBLISHED' as unit_published,
      source_facts.has_active_ready_source,
      source_facts.has_valid_source_rights,
      source_facts.has_matching_curriculum_edition
    from public.curriculum_units as units
    join public.cohorts as cohorts on cohorts.id = units.cohort_id
    left join public.cohort_releases as releases on releases.cohort_id = cohorts.id
    cross join caller
    left join lateral (
      select
        coalesce(
          bool_or(
            versions.processing_status = 'READY'
            and versions.activation_status = 'ACTIVE'
          ),
          false
        ) as has_active_ready_source,
        coalesce(
          bool_or(
            versions.processing_status = 'READY'
            and versions.activation_status = 'ACTIVE'
            and versions.rights_status = 'VALID'
            and versions.rights_valid_from <= transaction_timestamp()
            and (
              versions.rights_valid_until is null
              or versions.rights_valid_until > transaction_timestamp()
            )
          ),
          false
        ) as has_valid_source_rights,
        coalesce(
          bool_or(
            versions.processing_status = 'READY'
            and versions.activation_status = 'ACTIVE'
            and versions.rights_status = 'VALID'
            and versions.rights_valid_from <= transaction_timestamp()
            and (
              versions.rights_valid_until is null
              or versions.rights_valid_until > transaction_timestamp()
            )
            and versions.curriculum_edition = cohorts.curriculum_edition
          ),
          false
        ) as has_matching_curriculum_edition
      from public.source_assets as assets
      join public.source_versions as versions
        on versions.source_asset_id = assets.id
      where assets.cohort_id = cohorts.id
        and assets.curriculum_unit_id = units.id
    ) as source_facts on true
    where caller.user_id is not null
  ),
  evaluated as (
    select
      availability_facts.*,
      array_remove(
        array[
          case when not membership_active then 'membership_missing' end,
          case when not cohort_unlocked then 'cohort_locked' end,
          case when not unit_published then 'unit_unpublished' end,
          case
            when not has_active_ready_source then 'ready_source_missing'
          end,
          case
            when has_active_ready_source and not has_valid_source_rights
              then 'rights_invalid'
          end,
          case
            when has_valid_source_rights
              and not has_matching_curriculum_edition
              then 'curriculum_edition_mismatch'
          end
        ]::text[],
        null
      ) as failed_reasons
    from availability_facts
  )
  select
    evaluated.id,
    evaluated.cohort_id,
    evaluated.parent_unit_id,
    evaluated.code,
    evaluated.unit_type,
    evaluated.title_en,
    evaluated.title_ar,
    evaluated.sort_order,
    evaluated.publication_status,
    case
      when cardinality(evaluated.failed_reasons) = 0 then 'AVAILABLE'
      else 'LOCKED'
    end as availability_state,
    case
      when evaluated.is_admin then evaluated.failed_reasons
      else '{}'::text[]
    end as reason_codes
  from evaluated
  where evaluated.is_admin
    or cardinality(evaluated.failed_reasons) = 0
  order by evaluated.sort_order, evaluated.code;
$$;

revoke all on function public.available_curriculum_units(boolean)
  from public, anon, authenticated;
grant execute on function public.available_curriculum_units(boolean)
  to authenticated;

create policy chat_sessions_insert_own_available
on public.chat_sessions for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.available_curriculum_units() as available
    where available.cohort_id = chat_sessions.cohort_id
      and available.id = chat_sessions.curriculum_unit_id
      and available.availability_state = 'AVAILABLE'
  )
);

create policy studio_requests_insert_own_available
on public.studio_requests for insert to authenticated
with check (
  user_id = (select auth.uid())
  and state = 'QUEUED'
  and exists (
    select 1
    from public.available_curriculum_units() as available
    where available.cohort_id = studio_requests.cohort_id
      and available.id = studio_requests.curriculum_unit_id
      and available.availability_state = 'AVAILABLE'
  )
);
