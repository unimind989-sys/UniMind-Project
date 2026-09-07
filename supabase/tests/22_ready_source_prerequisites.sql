begin;
select plan(8);

insert into public.source_submissions (
  id, campaign_id, curriculum_unit_id, cohort_id, submitted_by,
  client_idempotency_key, source_name, declared_format, declared_rights, status
)
values (
  '32000000-0000-0000-0000-000000000022',
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000007',
  '20000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000002',
  'wp02-t07-ready-prerequisites', 'WP02 T07 prerequisite source',
  'application/pdf', 'DECLARED', 'ACCEPTED'
);

insert into public.source_assets (
  id, cohort_id, curriculum_unit_id, canonical_title, source_kind
)
values (
  '40000000-0000-0000-0000-000000000022',
  '20000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000007',
  'WP02 T07 readiness fixture', 'BOOK'
);

insert into public.source_versions (
  id, source_asset_id, version_number, submission_id, checksum, mime_type,
  byte_size, page_count, language_profile, curriculum_edition,
  rights_status, rights_valid_from, rights_valid_until, processing_status,
  activation_status, accepted_at, accepted_by
)
values (
  '41000000-0000-0000-0000-000000000022',
  '40000000-0000-0000-0000-000000000022', 1,
  '32000000-0000-0000-0000-000000000022',
  'sha256:2222222222222222222222222222222222222222222222222222222222222222',
  'application/pdf', 256, 1, 'EN', 'synthetic-edition-2026',
  'VALID', transaction_timestamp() - interval '1 day',
  transaction_timestamp() + interval '30 days', 'PROCESSING', 'ACTIVE',
  transaction_timestamp(), '10000000-0000-0000-0000-000000000001'
);

select throws_ok(
  $$update public.source_versions set processing_status = 'READY'
    where id = '41000000-0000-0000-0000-000000000022'$$,
  '23514',
  'source version READY prerequisites are incomplete',
  'READY rejects a source without processed, quality, segment, and embedding state'
);

insert into unimind_private.processed_documents (
  id, source_version_id, format, object_key, checksum, compressed_bytes,
  schema_version
)
values (
  '60000000-0000-0000-0000-000000000022',
  '41000000-0000-0000-0000-000000000022', 'SYNTHETIC_FIXTURE',
  'synthetic/processed/wp02-t07-ready.md',
  'sha256:2323232323232323232323232323232323232323232323232323232323232323',
  128, 'synthetic-v1'
);

insert into unimind_private.source_locators (
  id, processed_document_id, source_version_id, locator_type,
  original_page, processed_start, processed_end, confidence
)
values (
  '61000000-0000-0000-0000-000000000022',
  '60000000-0000-0000-0000-000000000022',
  '41000000-0000-0000-0000-000000000022',
  'SYNTHETIC', 1, 0, 32, 1
);

insert into unimind_private.source_segments (
  id, source_version_id, source_asset_id, cohort_id, curriculum_unit_id,
  curriculum_edition, sequence_number, content, content_hash, token_count,
  locator_id, language
)
values (
  '62000000-0000-0000-0000-000000000022',
  '41000000-0000-0000-0000-000000000022',
  '40000000-0000-0000-0000-000000000022',
  '20000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000007',
  'synthetic-edition-2026', 1, 'WP02 T07 readiness evidence.',
  'sha256:2424242424242424242424242424242424242424242424242424242424242424',
  6, '61000000-0000-0000-0000-000000000022', 'EN'
);

insert into unimind_private.processing_quality_reports (
  id, source_version_id, coverage_ratio, locator_coverage_ratio,
  low_confidence_count, terminology_sample_result, duplicate_ratio,
  raw_deletion_state, overall_result, report_json
)
values (
  '72000000-0000-0000-0000-000000000022',
  '41000000-0000-0000-0000-000000000022', 1, 1, 0, 'PASS', 0,
  'NOT_DUE', 'PASS', '{"fixture":"wp02-t07-ready"}'::jsonb
);

select throws_ok(
  $$update public.source_versions set processing_status = 'READY'
    where id = '41000000-0000-0000-0000-000000000022'$$,
  '23514',
  'source version READY prerequisites are incomplete',
  'READY rejects an active segment without an active-config embedding'
);

insert into unimind_private.segment_embeddings (
  id, source_segment_id, embedding_config_id, embedding
)
values (
  '71000000-0000-0000-0000-000000000022',
  '62000000-0000-0000-0000-000000000022',
  '70000000-0000-0000-0000-000000000001',
  '[0.2,0.2,0.2]'::extensions.vector
);

select lives_ok(
  $$update public.source_versions set processing_status = 'READY'
    where id = '41000000-0000-0000-0000-000000000022'$$,
  'READY accepts a source only after every WP02 prerequisite exists'
);

select throws_ok(
  $$update unimind_private.source_segments set active = false
    where id = '62000000-0000-0000-0000-000000000022'$$,
  '23514',
  'READY source cannot lose its final active segment',
  'a READY source cannot lose its final active segment'
);

select throws_ok(
  $$update unimind_private.embedding_configs set active = false
    where id = '70000000-0000-0000-0000-000000000001'$$,
  '23514',
  'READY source cannot lose its active embedding configuration',
  'a READY source cannot lose its only active embedding configuration'
);

select throws_ok(
  $$insert into unimind_private.source_segments (
      id, source_version_id, source_asset_id, cohort_id, curriculum_unit_id,
      curriculum_edition, sequence_number, content, content_hash, token_count,
      locator_id, language
    ) values (
      '62000000-0000-0000-0000-000000000023',
      '41000000-0000-0000-0000-000000000022',
      '40000000-0000-0000-0000-000000000022',
      '20000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000007',
      'synthetic-edition-2026', 2, 'Unembedded late segment.',
      'sha256:2525252525252525252525252525252525252525252525252525252525252525',
      4, '61000000-0000-0000-0000-000000000022', 'EN'
    )$$,
  '23514',
  'READY source cannot accept an unembedded active segment',
  'a READY source cannot gain an active segment before its embedding exists'
);

select throws_ok(
  $$insert into unimind_private.processing_quality_reports (
      id, source_version_id, coverage_ratio, locator_coverage_ratio,
      low_confidence_count, terminology_sample_result, duplicate_ratio,
      raw_deletion_state, overall_result, report_json
    ) values (
      '72000000-0000-0000-0000-000000000023',
      '41000000-0000-0000-0000-000000000022', 0.5, 1, 0, 'PASS', 0,
      'NOT_DUE', 'FAIL', '{"fixture":"wp02-t07-regression"}'::jsonb
    )$$,
  '23514',
  'READY source cannot receive a non-passing quality report',
  'a READY source must leave READY before recording a quality regression'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'unimind_private.assert_source_version_ready_prerequisites(uuid)',
    'EXECUTE'
  ),
  'client roles cannot execute the private READY prerequisite helper'
);

select * from finish();
rollback;
