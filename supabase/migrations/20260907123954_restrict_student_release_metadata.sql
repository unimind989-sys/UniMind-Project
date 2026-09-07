create or replace function public.can_access_unit(target_curriculum_unit_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and target_curriculum_unit_id is not null
    and (
      (select public.is_admin())
      or exists (
        select 1
        from public.source_assets as assets
        where assets.curriculum_unit_id = target_curriculum_unit_id
          and unimind_private.can_read_source_asset(assets.id)
      )
    );
$$;

revoke all on function public.can_access_unit(uuid)
  from public, anon, authenticated;
grant execute on function public.can_access_unit(uuid) to authenticated;

drop policy cohorts_select_member_or_admin on public.cohorts;
create policy cohorts_select_member_or_admin
on public.cohorts for select to authenticated
using (
  (select public.is_admin())
  or (
    public.has_active_membership(cohorts.id)
    and exists (
      select 1
      from public.cohort_releases as releases
      where releases.cohort_id = cohorts.id
        and releases.release_status = 'UNLOCKED'
    )
  )
);

drop policy curriculum_units_select_member_or_admin on public.curriculum_units;
create policy curriculum_units_select_member_or_admin
on public.curriculum_units for select to authenticated
using (
  (select public.is_admin())
  or public.can_access_unit(curriculum_units.id)
);

drop policy cohort_releases_select_member_or_admin on public.cohort_releases;
create policy cohort_releases_select_member_or_admin
on public.cohort_releases for select to authenticated
using (
  (select public.is_admin())
  or (
    cohort_releases.release_status = 'UNLOCKED'
    and public.has_active_membership(cohort_releases.cohort_id)
  )
);
