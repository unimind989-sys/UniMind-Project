-- D-04 still blocks a production embedding choice. This partial expression
-- index belongs only to the deterministic synthetic configuration used by CI.
create index segment_embeddings_synthetic_v1_cosine_hnsw_idx
  on unimind_private.segment_embeddings
  using hnsw (
    (embedding::extensions.vector(3)) extensions.vector_cosine_ops
  )
  where embedding_config_id = '70000000-0000-0000-0000-000000000001';

create index source_segments_content_search_idx
  on unimind_private.source_segments
  using gin (to_tsvector('simple', content));

drop function unimind_private.retrieve_authorized_segments(
  uuid,
  uuid,
  uuid,
  uuid,
  extensions.vector,
  integer
);

create function unimind_private.retrieve_authorized_segments(
  requesting_user_id uuid,
  target_cohort_id uuid,
  target_curriculum_unit_id uuid,
  target_embedding_config_id uuid,
  query_embedding extensions.vector,
  query_text text,
  result_limit integer
)
returns table (
  source_segment_id uuid,
  source_version_id uuid,
  content text,
  heading_path text[],
  language text,
  vector_distance double precision,
  text_score real,
  vector_rank bigint,
  text_rank bigint,
  hybrid_score double precision
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  config unimind_private.embedding_configs%rowtype;
  candidate_limit integer;
  search_query tsquery;
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and session_user not in ('postgres', 'supabase_admin') then
    raise exception using
      errcode = '42501',
      message = 'retrieval is restricted to the trusted server role';
  end if;

  if requesting_user_id is null
     or target_cohort_id is null
     or target_curriculum_unit_id is null
     or target_embedding_config_id is null
     or query_embedding is null then
    raise exception using
      errcode = '22023',
      message = 'retrieval scope and query vector are required';
  end if;

  if result_limit is null or result_limit < 1 or result_limit > 50 then
    raise exception using
      errcode = '22023',
      message = 'retrieval limit is outside the allowed range';
  end if;

  if nullif(btrim(query_text), '') is null then
    raise exception using
      errcode = '22023',
      message = 'retrieval query text is required';
  end if;

  search_query := websearch_to_tsquery('simple', query_text);
  if numnode(search_query) = 0 then
    raise exception using
      errcode = '22023',
      message = 'retrieval query text has no searchable terms';
  end if;

  select * into config
  from unimind_private.embedding_configs
  where id = target_embedding_config_id
    and active;

  if not found then
    raise exception using
      errcode = '22023',
      message = 'embedding configuration is not active';
  end if;

  if extensions.vector_dims(query_embedding) <> config.dimensions then
    raise exception using
      errcode = '22023',
      message = 'query dimensions do not match the active configuration';
  end if;

  if config.id <> '70000000-0000-0000-0000-000000000001'
     or config.dimensions <> 3
     or config.distance_operator <> 'COSINE' then
    raise exception using
      errcode = '22023',
      message = 'embedding configuration has no compatible retrieval index';
  end if;

  if not unimind_private.can_user_access_unit(
    requesting_user_id,
    target_cohort_id,
    target_curriculum_unit_id
  ) then
    raise exception using
      errcode = '42501',
      message = 'requesting user cannot access the requested curriculum unit';
  end if;

  candidate_limit := least(result_limit * 4, 200);

  return query
  with vector_candidates as materialized (
    select
      segments.id as source_segment_id,
      segments.source_version_id,
      segments.content,
      segments.heading_path,
      segments.language,
      (
        embeddings.embedding::extensions.vector(3)
        operator(extensions.<=>)
        query_embedding::extensions.vector(3)
      )::double precision as vector_distance,
      ts_rank_cd(
        to_tsvector('simple', segments.content),
        search_query
      ) as text_score,
      row_number() over (
        order by
          embeddings.embedding::extensions.vector(3)
            operator(extensions.<=>)
            query_embedding::extensions.vector(3),
          segments.id
      ) as vector_rank
    from unimind_private.segment_embeddings as embeddings
    join unimind_private.source_segments as segments
      on segments.id = embeddings.source_segment_id
    join public.source_versions as versions
      on versions.id = segments.source_version_id
    join public.source_assets as assets
      on assets.id = versions.source_asset_id
    join public.curriculum_units as units
      on units.id = segments.curriculum_unit_id
     and units.cohort_id = segments.cohort_id
    join public.cohorts as cohorts on cohorts.id = segments.cohort_id
    join public.cohort_releases as releases
      on releases.cohort_id = cohorts.id
    where embeddings.embedding_config_id =
        '70000000-0000-0000-0000-000000000001'
      and segments.active
      and segments.cohort_id = target_cohort_id
      and segments.curriculum_unit_id = target_curriculum_unit_id
      and assets.cohort_id = target_cohort_id
      and assets.curriculum_unit_id = target_curriculum_unit_id
      and units.publication_status = 'PUBLISHED'
      and releases.release_status = 'UNLOCKED'
      and versions.processing_status = 'READY'
      and versions.activation_status = 'ACTIVE'
      and versions.rights_status = 'VALID'
      and versions.rights_valid_from <= transaction_timestamp()
      and (
        versions.rights_valid_until is null
        or versions.rights_valid_until > transaction_timestamp()
      )
      and versions.curriculum_edition = cohorts.curriculum_edition
      and segments.curriculum_edition = cohorts.curriculum_edition
    order by
      embeddings.embedding::extensions.vector(3)
        operator(extensions.<=>)
        query_embedding::extensions.vector(3),
      segments.id
    limit candidate_limit
  ),
  text_candidates as materialized (
    select
      segments.id as source_segment_id,
      segments.source_version_id,
      segments.content,
      segments.heading_path,
      segments.language,
      (
        embeddings.embedding::extensions.vector(3)
        operator(extensions.<=>)
        query_embedding::extensions.vector(3)
      )::double precision as vector_distance,
      ts_rank_cd(
        to_tsvector('simple', segments.content),
        search_query
      ) as text_score,
      row_number() over (
        order by
          ts_rank_cd(
            to_tsvector('simple', segments.content),
            search_query
          ) desc,
          segments.id
      ) as text_rank
    from unimind_private.source_segments as segments
    join unimind_private.segment_embeddings as embeddings
      on embeddings.source_segment_id = segments.id
     and embeddings.embedding_config_id =
        '70000000-0000-0000-0000-000000000001'
    join public.source_versions as versions
      on versions.id = segments.source_version_id
    join public.source_assets as assets
      on assets.id = versions.source_asset_id
    join public.curriculum_units as units
      on units.id = segments.curriculum_unit_id
     and units.cohort_id = segments.cohort_id
    join public.cohorts as cohorts on cohorts.id = segments.cohort_id
    join public.cohort_releases as releases
      on releases.cohort_id = cohorts.id
    where segments.active
      and segments.cohort_id = target_cohort_id
      and segments.curriculum_unit_id = target_curriculum_unit_id
      and assets.cohort_id = target_cohort_id
      and assets.curriculum_unit_id = target_curriculum_unit_id
      and units.publication_status = 'PUBLISHED'
      and releases.release_status = 'UNLOCKED'
      and versions.processing_status = 'READY'
      and versions.activation_status = 'ACTIVE'
      and versions.rights_status = 'VALID'
      and versions.rights_valid_from <= transaction_timestamp()
      and (
        versions.rights_valid_until is null
        or versions.rights_valid_until > transaction_timestamp()
      )
      and versions.curriculum_edition = cohorts.curriculum_edition
      and segments.curriculum_edition = cohorts.curriculum_edition
      and to_tsvector('simple', segments.content) @@ search_query
    order by
      ts_rank_cd(
        to_tsvector('simple', segments.content),
        search_query
      ) desc,
      segments.id
    limit candidate_limit
  ),
  merged_candidates as (
    select
      coalesce(vector_result.source_segment_id, text_result.source_segment_id)
        as source_segment_id,
      coalesce(vector_result.source_version_id, text_result.source_version_id)
        as source_version_id,
      coalesce(vector_result.content, text_result.content) as content,
      coalesce(vector_result.heading_path, text_result.heading_path)
        as heading_path,
      coalesce(vector_result.language, text_result.language) as language,
      coalesce(vector_result.vector_distance, text_result.vector_distance)
        as vector_distance,
      coalesce(vector_result.text_score, text_result.text_score, 0::real)
        as text_score,
      vector_result.vector_rank,
      text_result.text_rank
    from vector_candidates as vector_result
    full join text_candidates as text_result
      on text_result.source_segment_id = vector_result.source_segment_id
  )
  select
    merged.source_segment_id,
    merged.source_version_id,
    merged.content,
    merged.heading_path,
    merged.language,
    merged.vector_distance,
    merged.text_score,
    merged.vector_rank,
    merged.text_rank,
    (
      coalesce(1.0 / (60.0 + merged.vector_rank), 0.0)
      + coalesce(1.0 / (60.0 + merged.text_rank), 0.0)
    )::double precision as hybrid_score
  from merged_candidates as merged
  order by
    (
      coalesce(1.0 / (60.0 + merged.vector_rank), 0.0)
      + coalesce(1.0 / (60.0 + merged.text_rank), 0.0)
    ) desc,
    merged.vector_distance,
    merged.source_segment_id
  limit result_limit;
end;
$$;

revoke all on function unimind_private.retrieve_authorized_segments(
  uuid,
  uuid,
  uuid,
  uuid,
  extensions.vector,
  text,
  integer
) from public, anon, authenticated;

grant execute on function unimind_private.retrieve_authorized_segments(
  uuid,
  uuid,
  uuid,
  uuid,
  extensions.vector,
  text,
  integer
) to service_role;
