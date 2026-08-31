create function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.user_roles as roles
      where roles.user_id = (select auth.uid())
        and roles.role = 'ADMIN'
        and roles.revoked_at is null
    );
$$;

create function public.has_active_membership(target_cohort_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and target_cohort_id is not null
    and exists (
      select 1
      from public.cohort_memberships as memberships
      where memberships.user_id = (select auth.uid())
        and memberships.cohort_id = target_cohort_id
        and memberships.status = 'ACTIVE'
        and (
          memberships.starts_at is null
          or memberships.starts_at <= transaction_timestamp()
        )
        and (
          memberships.ends_at is null
          or memberships.ends_at > transaction_timestamp()
        )
    );
$$;

create function public.has_campaign_assignment(target_campaign_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and target_campaign_id is not null
    and exists (
      select 1
      from public.batch_leader_assignments as assignments
      where assignments.user_id = (select auth.uid())
        and assignments.campaign_id = target_campaign_id
        and assignments.status = 'ACTIVE'
        and assignments.expires_at > transaction_timestamp()
    );
$$;

create function public.can_access_unit(target_curriculum_unit_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and target_curriculum_unit_id is not null
    and exists (
      select 1
      from public.curriculum_units as units
      where units.id = target_curriculum_unit_id
        and (
          (select public.is_admin())
          or public.has_active_membership(units.cohort_id)
        )
    );
$$;

revoke all on function public.is_admin()
  from public, anon, authenticated;
revoke all on function public.has_active_membership(uuid)
  from public, anon, authenticated;
revoke all on function public.has_campaign_assignment(uuid)
  from public, anon, authenticated;
revoke all on function public.can_access_unit(uuid)
  from public, anon, authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_active_membership(uuid) to authenticated;
grant execute on function public.has_campaign_assignment(uuid) to authenticated;
grant execute on function public.can_access_unit(uuid) to authenticated;

create or replace function public.available_curriculum_units()
returns table (
  id uuid,
  cohort_id uuid,
  parent_unit_id uuid,
  code text,
  unit_type public.curriculum_unit_type,
  title_en text,
  title_ar text,
  sort_order integer,
  publication_status text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    units.id,
    units.cohort_id,
    units.parent_unit_id,
    units.code,
    units.unit_type,
    units.title_en,
    units.title_ar,
    units.sort_order,
    units.publication_status
  from public.curriculum_units as units
  join public.cohorts as cohorts on cohorts.id = units.cohort_id
  join public.cohort_releases as releases on releases.cohort_id = cohorts.id
  where (select auth.uid()) is not null
    and (
      public.has_active_membership(cohorts.id)
      or (select public.is_admin())
    )
    and releases.release_status = 'UNLOCKED'
    and units.publication_status = 'PUBLISHED'
    and exists (
      select 1
      from public.source_assets as assets
      join public.source_versions as versions
        on versions.source_asset_id = assets.id
      where assets.cohort_id = cohorts.id
        and assets.curriculum_unit_id = units.id
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
  order by units.sort_order, units.code;
$$;

drop policy cohorts_select_member_or_admin on public.cohorts;
create policy cohorts_select_member_or_admin
on public.cohorts for select to authenticated
using (
  public.has_active_membership(cohorts.id)
  or (select public.is_admin())
);

drop policy curriculum_units_select_member_or_admin on public.curriculum_units;
create policy curriculum_units_select_member_or_admin
on public.curriculum_units for select to authenticated
using (
  public.has_active_membership(curriculum_units.cohort_id)
  or (select public.is_admin())
);

drop policy cohort_releases_select_member_or_admin on public.cohort_releases;
create policy cohort_releases_select_member_or_admin
on public.cohort_releases for select to authenticated
using (
  public.has_active_membership(cohort_releases.cohort_id)
  or (select public.is_admin())
);

drop policy collection_campaigns_select_assigned_or_admin on public.collection_campaigns;
create policy collection_campaigns_select_assigned_or_admin
on public.collection_campaigns for select to authenticated
using (
  public.has_campaign_assignment(collection_campaigns.id)
  or (select public.is_admin())
);

drop policy campaign_curriculum_units_select_assigned_or_admin
  on public.campaign_curriculum_units;
create policy campaign_curriculum_units_select_assigned_or_admin
on public.campaign_curriculum_units for select to authenticated
using (
  public.has_campaign_assignment(campaign_curriculum_units.campaign_id)
  or (select public.is_admin())
);

drop policy batch_leader_assignments_select_own_or_admin
  on public.batch_leader_assignments;
create policy batch_leader_assignments_select_own_or_admin
on public.batch_leader_assignments for select to authenticated
using (
  user_id = (select auth.uid())
  or (select public.is_admin())
);

drop policy requested_material_items_select_assigned_or_admin
  on public.requested_material_items;
create policy requested_material_items_select_assigned_or_admin
on public.requested_material_items for select to authenticated
using (
  public.has_campaign_assignment(requested_material_items.campaign_id)
  or (select public.is_admin())
);

drop policy source_submissions_select_own_or_admin on public.source_submissions;
create policy source_submissions_select_own_or_admin
on public.source_submissions for select to authenticated
using (
  submitted_by = (select auth.uid())
  or (select public.is_admin())
);

drop policy source_submissions_insert_assigned on public.source_submissions;
create policy source_submissions_insert_assigned
on public.source_submissions for insert to authenticated
with check (
  submitted_by = (select auth.uid())
  and declared_rights = 'DECLARED'
  and public.has_campaign_assignment(source_submissions.campaign_id)
  and exists (
    select 1
    from public.collection_campaigns as campaigns
    join public.campaign_curriculum_units as campaign_units
      on campaign_units.campaign_id = campaigns.id
     and campaign_units.curriculum_unit_id = source_submissions.curriculum_unit_id
    where campaigns.id = source_submissions.campaign_id
      and campaigns.cohort_id = source_submissions.cohort_id
      and campaigns.status = 'OPEN'
      and campaigns.opens_at <= transaction_timestamp()
      and campaigns.closes_at > transaction_timestamp()
  )
);

drop policy source_assets_select_available_scope on public.source_assets;
create policy source_assets_select_available_scope
on public.source_assets for select to authenticated
using (
  public.can_access_unit(source_assets.curriculum_unit_id)
  and exists (
    select 1
    from public.curriculum_units as units
    join public.cohort_releases as releases on releases.cohort_id = units.cohort_id
    where units.id = source_assets.curriculum_unit_id
      and units.cohort_id = source_assets.cohort_id
      and units.publication_status = 'PUBLISHED'
      and releases.release_status = 'UNLOCKED'
  )
);
