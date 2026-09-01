create function unimind_private.can_read_source_asset(
  target_source_asset_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and (
      exists (
        select 1
        from public.user_roles as roles
        where roles.user_id = (select auth.uid())
          and roles.role = 'ADMIN'
          and roles.revoked_at is null
      )
      or exists (
        select 1
        from public.source_assets as assets
        join public.curriculum_units as units
          on units.id = assets.curriculum_unit_id
         and units.cohort_id = assets.cohort_id
        join public.cohorts as cohorts on cohorts.id = assets.cohort_id
        join public.cohort_releases as releases
          on releases.cohort_id = assets.cohort_id
        join public.cohort_memberships as memberships
          on memberships.cohort_id = assets.cohort_id
         and memberships.user_id = (select auth.uid())
        where assets.id = target_source_asset_id
          and units.publication_status = 'PUBLISHED'
          and releases.release_status = 'UNLOCKED'
          and memberships.status = 'ACTIVE'
          and (
            memberships.starts_at is null
            or memberships.starts_at <= transaction_timestamp()
          )
          and (
            memberships.ends_at is null
            or memberships.ends_at > transaction_timestamp()
          )
          and exists (
            select 1
            from public.source_versions as versions
            where versions.source_asset_id = assets.id
              and versions.processing_status = 'READY'
              and versions.activation_status = 'ACTIVE'
              and versions.rights_status = 'VALID'
              and versions.rights_valid_from <= transaction_timestamp()
              and (
                versions.rights_valid_until is null
                or versions.rights_valid_until > transaction_timestamp()
              )
              and versions.curriculum_edition = cohorts.curriculum_edition
          )
      )
    );
$$;

revoke all on function unimind_private.can_read_source_asset(uuid)
  from public, anon, authenticated;
grant execute on function unimind_private.can_read_source_asset(uuid)
  to authenticated;

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

drop policy curriculum_units_select_member_or_admin
  on public.curriculum_units;
create policy curriculum_units_select_member_or_admin
on public.curriculum_units for select to authenticated
using (
  (select public.is_admin())
  or (
    curriculum_units.publication_status = 'PUBLISHED'
    and public.has_active_membership(curriculum_units.cohort_id)
    and exists (
      select 1
      from public.cohort_releases as releases
      where releases.cohort_id = curriculum_units.cohort_id
        and releases.release_status = 'UNLOCKED'
    )
  )
);

drop policy cohort_releases_select_member_or_admin
  on public.cohort_releases;
create policy cohort_releases_select_member_or_admin
on public.cohort_releases for select to authenticated
using (
  (select public.is_admin())
  or (
    cohort_releases.release_status = 'UNLOCKED'
    and public.has_active_membership(cohort_releases.cohort_id)
  )
);

drop policy source_assets_select_available_scope on public.source_assets;
create policy source_assets_select_available_scope
on public.source_assets for select to authenticated
using (
  unimind_private.can_read_source_asset(source_assets.id)
);

drop policy source_versions_select_available_scope on public.source_versions;
create policy source_versions_select_available_scope
on public.source_versions for select to authenticated
using (
  (select public.is_admin())
  or (
    source_versions.processing_status = 'READY'
    and source_versions.activation_status = 'ACTIVE'
    and source_versions.rights_status = 'VALID'
    and source_versions.rights_valid_from <= transaction_timestamp()
    and (
      source_versions.rights_valid_until is null
      or source_versions.rights_valid_until > transaction_timestamp()
    )
    and exists (
      select 1
      from public.source_assets as assets
      join public.cohorts as cohorts on cohorts.id = assets.cohort_id
      where assets.id = source_versions.source_asset_id
        and unimind_private.can_read_source_asset(assets.id)
        and source_versions.curriculum_edition = cohorts.curriculum_edition
    )
  )
);
