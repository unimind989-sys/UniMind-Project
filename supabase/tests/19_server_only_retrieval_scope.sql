begin;
select plan(23);

select set_config(
  'unimind.actor_id',
  '10000000-0000-0000-0000-000000000001',
  true
);
select set_config(
  'unimind.audit_reason',
  'WP02-T06 synthetic retrieval scope proof',
  true
);
select set_config(
  'unimind.correlation_id',
  '90000000-0000-0000-0000-000000000006',
  true
);

select ok(
  not has_table_privilege(
    'authenticated',
    'unimind_private.source_segments',
    'SELECT'
  ),
  'authenticated clients cannot read unrestricted source segments'
);
select ok(
  not has_table_privilege(
    'authenticated',
    'unimind_private.segment_embeddings',
    'SELECT'
  ),
  'authenticated clients cannot read unrestricted segment embeddings'
);
select is(
  (
    select count(*)
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_namespace as namespaces
      on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'unimind_private'
      and procedures.proname = 'retrieve_authorized_segments'
      and pg_get_function_identity_arguments(procedures.oid) =
        'requesting_user_id uuid, target_cohort_id uuid, target_curriculum_unit_id uuid, target_embedding_config_id uuid, query_embedding extensions.vector, query_text text, result_limit integer'
      and procedures.provolatile = 's'
      and procedures.prosecdef
      and array_to_string(procedures.proconfig, ',') like '%search_path=""%'
  ),
  1::bigint,
  'retrieval exposes one stable private security-definer function with a safe search path'
);
select is(
  to_regprocedure(
    'unimind_private.retrieve_authorized_segments(uuid,uuid,uuid,uuid,extensions.vector,integer)'
  ),
  null::regprocedure,
  'the vector-only retrieval overload no longer exists'
);
select ok(
  has_function_privilege(
    'service_role',
    'unimind_private.retrieve_authorized_segments(uuid,uuid,uuid,uuid,extensions.vector,text,integer)',
    'EXECUTE'
  ),
  'the trusted service role can execute the retrieval function'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'unimind_private.retrieve_authorized_segments(uuid,uuid,uuid,uuid,extensions.vector,text,integer)',
    'EXECUTE'
  ),
  'authenticated clients cannot execute the retrieval function directly'
);
select ok(
  to_regclass(
    'unimind_private.segment_embeddings_synthetic_v1_cosine_hnsw_idx'
  ) is not null
  and pg_get_indexdef(
    'unimind_private.segment_embeddings_synthetic_v1_cosine_hnsw_idx'::regclass
  ) like '%USING hnsw ((embedding::extensions.vector(3)) extensions.vector_cosine_ops)%',
  'the active synthetic config has a dimensioned cosine HNSW index'
);
select ok(
  (
    select pg_get_expr(indexes.indpred, indexes.indrelid)
    from pg_catalog.pg_index as indexes
    where indexes.indexrelid =
      'unimind_private.segment_embeddings_synthetic_v1_cosine_hnsw_idx'::regclass
  ) like '%70000000-0000-0000-0000-000000000001%',
  'the HNSW index is partial and bound to the reviewed active config'
);
select ok(
  to_regclass('unimind_private.source_segments_content_search_idx') is not null
  and pg_get_indexdef(
    'unimind_private.source_segments_content_search_idx'::regclass
  ) like '%USING gin (to_tsvector(''simple''::regconfig, content))%',
  'source content has a full-text GIN index for hybrid retrieval'
);
select ok(
  (
    select position(
      'operator(extensions.<=>)' in lower(pg_get_functiondef(procedures.oid))
    ) > 0
      and position(
        'case config.distance_operator' in lower(pg_get_functiondef(procedures.oid))
      ) = 0
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_namespace as namespaces
      on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'unimind_private'
      and procedures.proname = 'retrieve_authorized_segments'
  ),
  'the vector candidate query orders by the matching distance operator directly'
);

insert into unimind_private.segment_embeddings (
  id,
  source_segment_id,
  embedding_config_id,
  embedding
)
values (
  '87000000-0000-0000-0000-000000000001',
  '62000000-0000-0000-0000-000000000002',
  '70000000-0000-0000-0000-000000000001',
  '[0.1,0.2,0.3]'::extensions.vector
);

insert into public.cohorts (
  id,
  term_id,
  code,
  name,
  curriculum_edition,
  starts_at,
  ends_at,
  status
)
values (
  '80000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000005',
  'RETRIEVAL_CANARY_COHORT',
  'Retrieval Canary Cohort',
  'retrieval-canary-edition',
  transaction_timestamp() - interval '1 day',
  transaction_timestamp() + interval '30 days',
  'ACTIVE'
);

insert into public.programs (
  id,
  institution_id,
  code,
  program_type,
  name_en,
  name_ar,
  default_unit_type,
  unit_label_singular_en,
  unit_label_plural_en,
  unit_label_singular_ar,
  unit_label_plural_ar
)
values (
  '80000000-0000-0000-0000-000000000010',
  '20000000-0000-0000-0000-000000000002',
  'RETRIEVAL_CANARY_PROGRAM',
  'UNIVERSITY_PROGRAM',
  'Retrieval Canary Program',
  'برنامج استرجاع تجريبي',
  'MODULE',
  'Module',
  'Modules',
  'وحدة',
  'وحدات'
);
insert into public.academic_levels (
  id,
  program_id,
  code,
  name_en,
  name_ar,
  sort_order
)
values (
  '80000000-0000-0000-0000-000000000011',
  '80000000-0000-0000-0000-000000000010',
  'CANARY_LEVEL',
  'Canary Level',
  'مستوى تجريبي',
  1
);
insert into public.terms (
  id,
  academic_level_id,
  code,
  name_en,
  name_ar,
  sort_order
)
values (
  '80000000-0000-0000-0000-000000000012',
  '80000000-0000-0000-0000-000000000011',
  'CANARY_TERM',
  'Canary Term',
  'فصل تجريبي',
  1
);
insert into public.cohorts (
  id,
  term_id,
  code,
  name,
  curriculum_edition,
  starts_at,
  ends_at,
  status
)
values (
  '80000000-0000-0000-0000-000000000013',
  '80000000-0000-0000-0000-000000000012',
  'RETRIEVAL_PROGRAM_CANARY',
  'Retrieval Program Canary Cohort',
  'retrieval-program-canary-edition',
  transaction_timestamp() - interval '1 day',
  transaction_timestamp() + interval '30 days',
  'ACTIVE'
);

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
values
  (
    '80000000-0000-0000-0000-000000000002',
    '80000000-0000-0000-0000-000000000001',
    'RETRIEVAL_CANARY_UNIT',
    'MODULE',
    'Retrieval Canary Unit',
    'وحدة استرجاع تجريبية',
    1,
    'PUBLISHED',
    transaction_timestamp(),
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '80000000-0000-0000-0000-000000000014',
    '80000000-0000-0000-0000-000000000013',
    'RETRIEVAL_PROGRAM_CANARY_UNIT',
    'MODULE',
    'Retrieval Program Canary Unit',
    'وحدة برنامج استرجاع تجريبية',
    1,
    'PUBLISHED',
    transaction_timestamp(),
    '10000000-0000-0000-0000-000000000001'
  );

insert into public.cohort_memberships (
  id,
  user_id,
  cohort_id,
  status,
  starts_at,
  ends_at,
  granted_by,
  grant_reason
)
values
  (
    '81000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '80000000-0000-0000-0000-000000000001',
    'ACTIVE',
    transaction_timestamp() - interval '1 day',
    transaction_timestamp() + interval '30 days',
    '10000000-0000-0000-0000-000000000001',
    'Cross-cohort retrieval canary'
  ),
  (
    '81000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '80000000-0000-0000-0000-000000000013',
    'ACTIVE',
    transaction_timestamp() - interval '1 day',
    transaction_timestamp() + interval '30 days',
    '10000000-0000-0000-0000-000000000001',
    'Cross-program retrieval canary'
  );
insert into public.cohort_releases (
  id,
  cohort_id,
  release_status,
  changed_by,
  reason
)
values
  (
    '81000000-0000-0000-0000-000000000003',
    '80000000-0000-0000-0000-000000000001',
    'UNLOCKED',
    '10000000-0000-0000-0000-000000000001',
    'Synthetic retrieval canary'
  ),
  (
    '81000000-0000-0000-0000-000000000004',
    '80000000-0000-0000-0000-000000000013',
    'UNLOCKED',
    '10000000-0000-0000-0000-000000000001',
    'Synthetic program retrieval canary'
  );

insert into public.collection_campaigns (
  id,
  cohort_id,
  name,
  status,
  opens_at,
  closes_at,
  created_by
)
values
  (
    '82000000-0000-0000-0000-000000000001',
    '80000000-0000-0000-0000-000000000001',
    'Cross-cohort retrieval canary',
    'OPEN',
    transaction_timestamp() - interval '1 day',
    transaction_timestamp() + interval '7 days',
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '82000000-0000-0000-0000-000000000002',
    '80000000-0000-0000-0000-000000000013',
    'Cross-program retrieval canary',
    'OPEN',
    transaction_timestamp() - interval '1 day',
    transaction_timestamp() + interval '7 days',
    '10000000-0000-0000-0000-000000000001'
  );
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
values
  (
    '82000000-0000-0000-0000-000000000003',
    '82000000-0000-0000-0000-000000000001',
    '80000000-0000-0000-0000-000000000002',
    '80000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'retrieval-cross-cohort-canary',
    'Cross-cohort retrieval canary',
    'application/pdf',
    'DECLARED',
    'ACCEPTED'
  ),
  (
    '82000000-0000-0000-0000-000000000004',
    '82000000-0000-0000-0000-000000000002',
    '80000000-0000-0000-0000-000000000014',
    '80000000-0000-0000-0000-000000000013',
    '10000000-0000-0000-0000-000000000002',
    'retrieval-cross-program-canary',
    'Cross-program retrieval canary',
    'application/pdf',
    'DECLARED',
    'ACCEPTED'
  );
insert into public.source_assets (
  id,
  cohort_id,
  curriculum_unit_id,
  canonical_title,
  source_kind
)
values
  (
    '83000000-0000-0000-0000-000000000001',
    '80000000-0000-0000-0000-000000000001',
    '80000000-0000-0000-0000-000000000002',
    'Cross-cohort retrieval canary',
    'BOOK'
  ),
  (
    '83000000-0000-0000-0000-000000000002',
    '80000000-0000-0000-0000-000000000013',
    '80000000-0000-0000-0000-000000000014',
    'Cross-program retrieval canary',
    'BOOK'
  );
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
values
  (
    '84000000-0000-0000-0000-000000000001',
    '83000000-0000-0000-0000-000000000001',
    1,
    '82000000-0000-0000-0000-000000000003',
    'sha256:1111111111111111111111111111111111111111111111111111111111111111',
    'application/pdf',
    128,
    1,
    'EN',
    'retrieval-canary-edition',
    'VALID',
    transaction_timestamp() - interval '1 day',
    transaction_timestamp() + interval '30 days',
    'READY',
    'ACTIVE',
    transaction_timestamp(),
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '84000000-0000-0000-0000-000000000002',
    '83000000-0000-0000-0000-000000000002',
    1,
    '82000000-0000-0000-0000-000000000004',
    'sha256:2222222222222222222222222222222222222222222222222222222222222222',
    'application/pdf',
    128,
    1,
    'EN',
    'retrieval-program-canary-edition',
    'VALID',
    transaction_timestamp() - interval '1 day',
    transaction_timestamp() + interval '30 days',
    'READY',
    'ACTIVE',
    transaction_timestamp(),
    '10000000-0000-0000-0000-000000000001'
  );
insert into unimind_private.processed_documents (
  id,
  source_version_id,
  format,
  object_key,
  checksum,
  compressed_bytes,
  schema_version
)
values
  (
    '85000000-0000-0000-0000-000000000001',
    '84000000-0000-0000-0000-000000000001',
    'SYNTHETIC_FIXTURE',
    'synthetic/retrieval-cross-cohort.md',
    'sha256:3333333333333333333333333333333333333333333333333333333333333333',
    64,
    'synthetic-v1'
  ),
  (
    '85000000-0000-0000-0000-000000000002',
    '84000000-0000-0000-0000-000000000002',
    'SYNTHETIC_FIXTURE',
    'synthetic/retrieval-cross-program.md',
    'sha256:4444444444444444444444444444444444444444444444444444444444444444',
    64,
    'synthetic-v1'
  );
insert into unimind_private.source_locators (
  id,
  processed_document_id,
  source_version_id,
  locator_type,
  processed_start,
  processed_end,
  confidence
)
values
  (
    '86000000-0000-0000-0000-000000000001',
    '85000000-0000-0000-0000-000000000001',
    '84000000-0000-0000-0000-000000000001',
    'SYNTHETIC',
    0,
    32,
    1
  ),
  (
    '86000000-0000-0000-0000-000000000002',
    '85000000-0000-0000-0000-000000000002',
    '84000000-0000-0000-0000-000000000002',
    'SYNTHETIC',
    0,
    32,
    1
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
values
  (
    '86000000-0000-0000-0000-000000000003',
    '84000000-0000-0000-0000-000000000001',
    '83000000-0000-0000-0000-000000000001',
    '80000000-0000-0000-0000-000000000001',
    '80000000-0000-0000-0000-000000000002',
    'retrieval-canary-edition',
    1,
    'Synthetic evidence cross cohort canary.',
    'sha256:5555555555555555555555555555555555555555555555555555555555555555',
    6,
    '86000000-0000-0000-0000-000000000001',
    'EN'
  ),
  (
    '86000000-0000-0000-0000-000000000004',
    '84000000-0000-0000-0000-000000000002',
    '83000000-0000-0000-0000-000000000002',
    '80000000-0000-0000-0000-000000000013',
    '80000000-0000-0000-0000-000000000014',
    'retrieval-program-canary-edition',
    1,
    'Synthetic evidence cross program canary.',
    'sha256:6666666666666666666666666666666666666666666666666666666666666666',
    6,
    '86000000-0000-0000-0000-000000000002',
    'EN'
  );
insert into unimind_private.segment_embeddings (
  id,
  source_segment_id,
  embedding_config_id,
  embedding
)
values
  (
    '87000000-0000-0000-0000-000000000002',
    '86000000-0000-0000-0000-000000000003',
    '70000000-0000-0000-0000-000000000001',
    '[0.1,0.2,0.3]'::extensions.vector
  ),
  (
    '87000000-0000-0000-0000-000000000003',
    '86000000-0000-0000-0000-000000000004',
    '70000000-0000-0000-0000-000000000001',
    '[0.1,0.2,0.3]'::extensions.vector
  );

create temporary table retrieval_results on commit drop as
select *
from unimind_private.retrieve_authorized_segments(
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000007',
  '70000000-0000-0000-0000-000000000001',
  '[0.1,0.2,0.3]'::extensions.vector,
  'Synthetic evidence',
  50
);

select is(
  (select count(*) from retrieval_results),
  1::bigint,
  'hybrid retrieval returns only the requested authorized unit pool'
);
select is(
  (select vector_rank from retrieval_results),
  1::bigint,
  'the authorized segment receives a vector candidate rank'
);
select is(
  (select text_rank from retrieval_results),
  1::bigint,
  'the authorized segment receives a full-text candidate rank'
);
select is(
  (
    select count(*)
    from retrieval_results
    where source_segment_id = '86000000-0000-0000-0000-000000000003'
  ),
  0::bigint,
  'a same-program cross-cohort canary never enters the result set'
);
select is(
  (
    select count(*)
    from retrieval_results
    where source_segment_id = '86000000-0000-0000-0000-000000000004'
  ),
  0::bigint,
  'a cross-program canary never enters the result set'
);

savepoint revoked_source;
update public.source_versions
set rights_status = 'REVOKED', activation_status = 'DEACTIVATED'
where id = '41000000-0000-0000-0000-000000000001';
select throws_ok(
  $$select * from unimind_private.retrieve_authorized_segments(
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007',
    '70000000-0000-0000-0000-000000000001',
    '[0.1,0.2,0.3]'::extensions.vector,
    'Synthetic evidence',
    5
  )$$,
  '42501',
  'requesting user cannot access the requested curriculum unit',
  'rights revocation removes the source on the next retrieval call'
);
rollback to savepoint revoked_source;

savepoint inactive_segment;
update unimind_private.source_segments
set active = false
where id = '62000000-0000-0000-0000-000000000001';
select is(
  (
    select count(*)
    from unimind_private.retrieve_authorized_segments(
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000007',
      '70000000-0000-0000-0000-000000000001',
      '[0.1,0.2,0.3]'::extensions.vector,
      'Synthetic evidence',
      5
    )
  ),
  0::bigint,
  'inactive segments are excluded before candidate ranking'
);
rollback to savepoint inactive_segment;

select throws_ok(
  $$select * from unimind_private.retrieve_authorized_segments(
    '10000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007',
    '70000000-0000-0000-0000-000000000001',
    '[0.1,0.2,0.3]'::extensions.vector,
    'Synthetic evidence',
    5
  )$$,
  '42501',
  'requesting user cannot access the requested curriculum unit',
  'a forged requesting user is denied from authoritative state'
);
select throws_ok(
  $$select * from unimind_private.retrieve_authorized_segments(
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007',
    '70000000-0000-0000-0000-000000000001',
    '[0.1,0.2]'::extensions.vector,
    'Synthetic evidence',
    5
  )$$,
  '22023',
  'query dimensions do not match the active configuration',
  'a mismatched query vector is rejected'
);
select throws_ok(
  $$select * from unimind_private.retrieve_authorized_segments(
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007',
    '70000000-0000-0000-0000-000000000001',
    '[0.1,0.2,0.3]'::extensions.vector,
    '   ',
    5
  )$$,
  '22023',
  'retrieval query text is required',
  'blank query text is rejected'
);
select throws_ok(
  $$select * from unimind_private.retrieve_authorized_segments(
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007',
    '70000000-0000-0000-0000-000000000001',
    '[0.1,0.2,0.3]'::extensions.vector,
    'Synthetic evidence',
    51
  )$$,
  '22023',
  'retrieval limit is outside the allowed range',
  'an oversized result limit is rejected'
);

savepoint inactive_config;
update unimind_private.embedding_configs
set active = false
where id = '70000000-0000-0000-0000-000000000001';
select throws_ok(
  $$select * from unimind_private.retrieve_authorized_segments(
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007',
    '70000000-0000-0000-0000-000000000001',
    '[0.1,0.2,0.3]'::extensions.vector,
    'Synthetic evidence',
    5
  )$$,
  '22023',
  'embedding configuration is not active',
  'an inactive embedding configuration is rejected'
);
rollback to savepoint inactive_config;

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
select throws_ok(
  $$select * from unimind_private.retrieve_authorized_segments(
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007',
    '70000000-0000-0000-0000-000000000001',
    '[0.1,0.2,0.3]'::extensions.vector,
    'Synthetic evidence',
    5
  )$$,
  '42501',
  null,
  'an authenticated client cannot bypass the server-only seam'
);
reset role;

select * from finish();
rollback;
