begin;

set local unimind.actor_id = '10000000-0000-0000-0000-000000000001';
set local unimind.audit_reason = 'WP02-T05 representative synthetic plan fixture';
set local unimind.correlation_id = '90000000-0000-0000-0000-000000000006';

insert into public.curriculum_units (
  id,
  cohort_id,
  code,
  unit_type,
  title_en,
  title_ar,
  sort_order,
  publication_status,
  published_at,
  published_by
)
select
  ('83000000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  '20000000-0000-0000-0000-000000000006'::uuid,
  'PLAN_UNIT_' || series::text,
  'MODULE'::public.curriculum_unit_type,
  'Synthetic plan unit ' || series::text,
  'Synthetic plan unit ' || series::text,
  1000 + series,
  'PUBLISHED',
  transaction_timestamp() - interval '1 day',
  '10000000-0000-0000-0000-000000000001'::uuid
from generate_series(1, 512) as generated(series);

insert into public.source_submissions (
  id,
  campaign_id,
  curriculum_unit_id,
  cohort_id,
  submitted_by,
  client_idempotency_key,
  source_name,
  declared_format,
  declared_rights,
  status
)
select
  ('83100000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  '30000000-0000-0000-0000-000000000001'::uuid,
  ('83000000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  '20000000-0000-0000-0000-000000000006'::uuid,
  '10000000-0000-0000-0000-000000000002'::uuid,
  't05-plan-source-' || series::text,
  'Synthetic plan source ' || series::text,
  'application/pdf',
  'DECLARED',
  'ACCEPTED'
from generate_series(1, 512) as generated(series);

insert into public.source_assets (
  id,
  cohort_id,
  curriculum_unit_id,
  canonical_title,
  source_kind
)
select
  ('83200000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  '20000000-0000-0000-0000-000000000006'::uuid,
  ('83000000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  'Synthetic plan source ' || series::text,
  'BOOK'
from generate_series(1, 512) as generated(series);

insert into public.source_versions (
  id,
  source_asset_id,
  version_number,
  submission_id,
  checksum,
  mime_type,
  byte_size,
  page_count,
  language_profile,
  curriculum_edition,
  rights_status,
  rights_valid_from,
  rights_valid_until,
  processing_status,
  activation_status,
  accepted_at,
  accepted_by
)
select
  ('83300000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  ('83200000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  1,
  ('83100000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  'sha256:' || md5('wp02-t05-left-' || series::text)
    || md5('wp02-t05-right-' || series::text),
  'application/pdf',
  1024,
  2,
  'EN',
  'synthetic-edition-2026',
  'VALID',
  transaction_timestamp() - interval '1 day',
  transaction_timestamp() + interval '30 days',
  'PROCESSING',
  'ACTIVE',
  transaction_timestamp(),
  '10000000-0000-0000-0000-000000000001'::uuid
from generate_series(1, 512) as generated(series);

insert into unimind_private.processed_documents (
  id,
  source_version_id,
  format,
  object_key,
  checksum,
  compressed_bytes,
  schema_version
)
select
  ('83400000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  ('83300000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  'SYNTHETIC_FIXTURE',
  'synthetic/query-plan/' || series::text || '.md',
  'sha256:' || md5('wp02-t05-document-left-' || series::text)
    || md5('wp02-t05-document-right-' || series::text),
  64,
  'synthetic-v1'
from generate_series(1, 512) as generated(series);

insert into unimind_private.source_locators (
  id,
  processed_document_id,
  source_version_id,
  locator_type,
  processed_start,
  processed_end,
  confidence
)
select
  ('83500000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  ('83400000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  ('83300000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  'SYNTHETIC',
  0,
  32,
  1
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
  ('83600000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  ('83300000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  ('83200000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  '20000000-0000-0000-0000-000000000006'::uuid,
  ('83000000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  'synthetic-edition-2026',
  1,
  'Synthetic query-plan evidence ' || series::text || '.',
  'sha256:' || md5('wp02-t05-segment-left-' || series::text)
    || md5('wp02-t05-segment-right-' || series::text),
  5,
  ('83500000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  'EN'
from generate_series(1, 512) as generated(series);

insert into unimind_private.segment_embeddings (
  id,
  source_segment_id,
  embedding_config_id,
  embedding
)
select
  ('83700000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  ('83600000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  '70000000-0000-0000-0000-000000000001'::uuid,
  '[0.1,0.2,0.3]'::extensions.vector
from generate_series(1, 512) as generated(series);

insert into unimind_private.processing_quality_reports (
  id,
  source_version_id,
  coverage_ratio,
  locator_coverage_ratio,
  low_confidence_count,
  terminology_sample_result,
  duplicate_ratio,
  raw_deletion_state,
  overall_result,
  report_json
)
select
  ('83800000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  ('83300000-0000-0000-0000-' || lpad(series::text, 12, '0'))::uuid,
  1,
  1,
  0,
  'PASS',
  0,
  'NOT_DUE',
  'PASS',
  jsonb_build_object('fixture', 'wp02-t05-query-plan', 'series', series)
from generate_series(1, 512) as generated(series);

update public.source_versions
set processing_status = 'READY'
where id >= '83300000-0000-0000-0000-000000000001'::uuid
  and id <= '83300000-0000-0000-0000-000000000512'::uuid;

analyze public.cohort_memberships;
analyze public.cohort_releases;
analyze public.curriculum_units;
analyze public.source_assets;
analyze public.source_versions;

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';

explain (analyze, buffers, format json)
select id, cohort_id, availability_state
from public.available_curriculum_units(false);

-- Explain the installed SQL body too: a Function Scan hides its internal joins.
-- Extract it from pg_proc instead of maintaining a second availability query.
\echo WP02_T05_BODY_PLAN
set local search_path = '';
select 'prepare t05_availability_body(boolean) as '
  || replace(procedures.prosrc, 'admin_preview', '$1')
from pg_catalog.pg_proc as procedures
where procedures.oid = 'public.available_curriculum_units(boolean)'::regprocedure
\gexec

explain (analyze, buffers, format json)
execute t05_availability_body(false);
deallocate t05_availability_body;

reset role;
rollback;
