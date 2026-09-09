begin;

set local unimind.actor_id = '10000000-0000-0000-0000-000000000001';
set local unimind.audit_reason = 'WP02-T09 representative retrieval plan fixture';
set local unimind.correlation_id = '90000000-0000-0000-0000-000000000009';

-- READY sources reject a newly active segment until it already has an active
-- embedding. Move the two synthetic fixture sources out of READY, add the
-- complete representative corpus, and re-enter READY through the real guard.
update public.source_versions
set processing_status = 'NEEDS_REVIEW'
where id in (
  '41000000-0000-0000-0000-000000000001',
  '41000000-0000-0000-0000-000000000002'
);

insert into unimind_private.source_segments (
  id,
  source_version_id,
  source_asset_id,
  cohort_id,
  curriculum_unit_id,
  curriculum_edition,
  sequence_number,
  content,
  content_hash,
  token_count,
  locator_id,
  language
)
select
  ('88000000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  '41000000-0000-0000-0000-000000000001'::uuid,
  '40000000-0000-0000-0000-000000000001'::uuid,
  '20000000-0000-0000-0000-000000000006'::uuid,
  '20000000-0000-0000-0000-000000000007'::uuid,
  'synthetic-edition-2026',
  series + 1,
  'Representative retrieval plan evidence target ' || series::text || '.',
  'sha256:' || md5('wp02-t09-target-left-' || series::text)
    || md5('wp02-t09-target-right-' || series::text),
  7,
  '61000000-0000-0000-0000-000000000001'::uuid,
  'EN'
from generate_series(1, 512) as generated(series);

insert into unimind_private.source_segments (
  id,
  source_version_id,
  source_asset_id,
  cohort_id,
  curriculum_unit_id,
  curriculum_edition,
  sequence_number,
  content,
  content_hash,
  token_count,
  locator_id,
  language
)
select
  ('88200000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  '41000000-0000-0000-0000-000000000002'::uuid,
  '40000000-0000-0000-0000-000000000002'::uuid,
  '20000000-0000-0000-0000-000000000006'::uuid,
  '20000000-0000-0000-0000-000000000008'::uuid,
  'synthetic-edition-2026',
  series + 1,
  'Unrelated synthetic distractor material ' || series::text || '.',
  'sha256:' || md5('wp02-t09-distractor-left-' || series::text)
    || md5('wp02-t09-distractor-right-' || series::text),
  6,
  '61000000-0000-0000-0000-000000000002'::uuid,
  'EN'
from generate_series(1, 4096) as generated(series);

insert into unimind_private.segment_embeddings (
  id,
  source_segment_id,
  embedding_config_id,
  embedding
)
select
  ('88100000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  ('88000000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  '70000000-0000-0000-0000-000000000001'::uuid,
  '[1,0,0]'::extensions.vector
from generate_series(1, 512) as generated(series);

insert into unimind_private.segment_embeddings (
  id,
  source_segment_id,
  embedding_config_id,
  embedding
)
select
  ('88300000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  ('88200000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  '70000000-0000-0000-0000-000000000001'::uuid,
  '[0,1,0]'::extensions.vector
from generate_series(1, 4096) as generated(series);

update public.source_versions
set processing_status = 'PROCESSING'
where id in (
  '41000000-0000-0000-0000-000000000001',
  '41000000-0000-0000-0000-000000000002'
);

update public.source_versions
set processing_status = 'READY'
where id in (
  '41000000-0000-0000-0000-000000000001',
  '41000000-0000-0000-0000-000000000002'
);

analyze unimind_private.source_segments;
analyze unimind_private.segment_embeddings;
analyze public.source_versions;
analyze public.source_assets;
analyze public.curriculum_units;
analyze public.cohorts;
analyze public.cohort_releases;

explain (analyze, buffers, format json)
select *
from unimind_private.retrieve_authorized_segments(
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000007',
  '70000000-0000-0000-0000-000000000001',
  '[1,0,0]'::extensions.vector,
  'retrieval plan evidence',
  50
);

-- EXPLAIN on a PL/pgSQL function is opaque. Prepare the installed RETURN QUERY
-- body from pg_proc with the same reviewed synthetic arguments so CI measures
-- the deployed SQL instead of a separately maintained copy.
\echo WP02_T09_RETRIEVAL_BODY_PLAN
with function_source as (
  select split_part(
    split_part(procedures.prosrc, 'return query', 2),
    E'\nend;',
    1
  ) as query_body
  from pg_catalog.pg_proc as procedures
  where procedures.oid =
    'unimind_private.retrieve_authorized_segments(uuid,uuid,uuid,uuid,extensions.vector,text,integer)'::regprocedure
), bound_query as (
  select replace(
    replace(
      replace(
        replace(
          replace(
            replace(
              query_body,
              'target_cohort_id',
              '''20000000-0000-0000-0000-000000000006''::uuid'
            ),
            'target_curriculum_unit_id',
            '''20000000-0000-0000-0000-000000000007''::uuid'
          ),
          'query_embedding',
          '''[1,0,0]'''
        ),
        'search_query',
        $$pg_catalog.websearch_to_tsquery('simple', 'retrieval plan evidence')$$
      ),
      'candidate_limit',
      '200'
    ),
    'result_limit',
    '50'
  ) as query_body
  from function_source
)
select 'prepare wp02_t09_retrieval_body as ' || query_body
from bound_query
\gexec

explain (analyze, buffers, format json)
execute wp02_t09_retrieval_body;
deallocate wp02_t09_retrieval_body;

rollback;
