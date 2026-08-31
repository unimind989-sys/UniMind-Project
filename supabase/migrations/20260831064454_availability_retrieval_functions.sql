create function public.available_curriculum_units()
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
  where auth.uid() is not null
    and (
      exists (
        select 1
        from public.cohort_memberships as memberships
        where memberships.user_id = auth.uid()
          and memberships.cohort_id = cohorts.id
          and memberships.status = 'ACTIVE'
          and (memberships.starts_at is null or memberships.starts_at <= transaction_timestamp())
          and (memberships.ends_at is null or memberships.ends_at > transaction_timestamp())
      )
      or exists (
        select 1
        from public.user_roles as roles
        where roles.user_id = auth.uid()
          and roles.role = 'ADMIN'
          and roles.revoked_at is null
      )
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
        and (versions.rights_valid_until is null or versions.rights_valid_until > transaction_timestamp())
        and versions.curriculum_edition = cohorts.curriculum_edition
    )
  order by units.sort_order, units.code;
$$;

create function unimind_private.can_user_access_unit(
  target_user_id uuid,
  target_cohort_id uuid,
  target_curriculum_unit_id uuid
)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.curriculum_units as units
    join public.cohorts as cohorts on cohorts.id = units.cohort_id
    join public.cohort_releases as releases on releases.cohort_id = cohorts.id
    where units.id = target_curriculum_unit_id
      and units.cohort_id = target_cohort_id
      and releases.release_status = 'UNLOCKED'
      and units.publication_status = 'PUBLISHED'
      and (
        exists (
          select 1
          from public.cohort_memberships as memberships
          where memberships.user_id = target_user_id
            and memberships.cohort_id = target_cohort_id
            and memberships.status = 'ACTIVE'
            and (memberships.starts_at is null or memberships.starts_at <= transaction_timestamp())
            and (memberships.ends_at is null or memberships.ends_at > transaction_timestamp())
        )
        or exists (
          select 1
          from public.user_roles as roles
          where roles.user_id = target_user_id
            and roles.role = 'ADMIN'
            and roles.revoked_at is null
        )
      )
      and exists (
        select 1
        from public.source_assets as assets
        join public.source_versions as versions on versions.source_asset_id = assets.id
        where assets.cohort_id = target_cohort_id
          and assets.curriculum_unit_id = target_curriculum_unit_id
          and versions.processing_status = 'READY'
          and versions.activation_status = 'ACTIVE'
          and versions.rights_status = 'VALID'
          and versions.rights_valid_from <= transaction_timestamp()
          and (versions.rights_valid_until is null or versions.rights_valid_until > transaction_timestamp())
          and versions.curriculum_edition = cohorts.curriculum_edition
      )
  );
$$;

create function unimind_private.retrieve_authorized_segments(
  requesting_user_id uuid,
  target_cohort_id uuid,
  target_curriculum_unit_id uuid,
  target_embedding_config_id uuid,
  query_embedding extensions.vector,
  result_limit integer
)
returns table (
  source_segment_id uuid,
  source_version_id uuid,
  content text,
  heading_path text[],
  language text,
  distance double precision
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  config unimind_private.embedding_configs%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and session_user not in ('postgres', 'supabase_admin') then
    raise exception using errcode = '42501', message = 'retrieval is restricted to the trusted server role';
  end if;

  if result_limit < 1 or result_limit > 50 then
    raise exception using errcode = '22023', message = 'retrieval limit is outside the allowed range';
  end if;

  select * into config
  from unimind_private.embedding_configs
  where id = target_embedding_config_id and active;

  if not found then
    raise exception using errcode = '22023', message = 'embedding configuration is not active';
  end if;
  if extensions.vector_dims(query_embedding) <> config.dimensions then
    raise exception using errcode = '22023', message = 'query dimensions do not match the active configuration';
  end if;

  if not unimind_private.can_user_access_unit(
    requesting_user_id,
    target_cohort_id,
    target_curriculum_unit_id
  ) then
    raise exception using errcode = '42501', message = 'requesting user cannot access the requested curriculum unit';
  end if;

  return query
  select
    segments.id,
    segments.source_version_id,
    segments.content,
    segments.heading_path,
    segments.language,
    case config.distance_operator
      when 'COSINE' then embeddings.embedding <=> query_embedding
      when 'L2' then embeddings.embedding <-> query_embedding
      when 'INNER_PRODUCT' then embeddings.embedding <#> query_embedding
    end::double precision as distance
  from unimind_private.source_segments as segments
  join unimind_private.segment_embeddings as embeddings
    on embeddings.source_segment_id = segments.id
   and embeddings.embedding_config_id = config.id
  join public.source_versions as versions on versions.id = segments.source_version_id
  join public.source_assets as assets on assets.id = versions.source_asset_id
  join public.cohorts as cohorts on cohorts.id = segments.cohort_id
  where segments.active
    and segments.cohort_id = target_cohort_id
    and segments.curriculum_unit_id = target_curriculum_unit_id
    and assets.cohort_id = target_cohort_id
    and assets.curriculum_unit_id = target_curriculum_unit_id
    and versions.processing_status = 'READY'
    and versions.activation_status = 'ACTIVE'
    and versions.rights_status = 'VALID'
    and versions.rights_valid_from <= transaction_timestamp()
    and (versions.rights_valid_until is null or versions.rights_valid_until > transaction_timestamp())
    and segments.curriculum_edition = cohorts.curriculum_edition
  order by
    case config.distance_operator
      when 'COSINE' then embeddings.embedding <=> query_embedding
      when 'L2' then embeddings.embedding <-> query_embedding
      when 'INNER_PRODUCT' then embeddings.embedding <#> query_embedding
    end asc,
    segments.id asc
  limit result_limit;
end;
$$;

revoke all on function public.available_curriculum_units()
  from public, anon;
revoke all on function unimind_private.can_user_access_unit(uuid, uuid, uuid)
  from public, anon, authenticated;
revoke all on function unimind_private.retrieve_authorized_segments(uuid, uuid, uuid, uuid, extensions.vector, integer)
  from public, anon, authenticated;
