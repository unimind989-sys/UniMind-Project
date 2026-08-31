-- Synthetic WP02 database contract fixture. Include inside a transaction and roll it back.
select set_config('unimind.actor_id', '10000000-0000-0000-0000-000000000001', true);
select set_config('unimind.audit_reason', 'WP02 synthetic fixture', true);
select set_config('unimind.correlation_id', '90000000-0000-0000-0000-000000000001', true);

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated',
    'admin@synthetic.unimind.invalid', '', transaction_timestamp(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    transaction_timestamp(), transaction_timestamp()
  ),
  (
    '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated',
    'student-a@synthetic.unimind.invalid', '', transaction_timestamp(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    transaction_timestamp(), transaction_timestamp()
  ),
  (
    '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated',
    'student-b@synthetic.unimind.invalid', '', transaction_timestamp(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    transaction_timestamp(), transaction_timestamp()
  );

update public.profiles
set account_status = 'ACTIVE', updated_at = transaction_timestamp()
where user_id in (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003'
);

insert into public.user_roles (id, user_id, role, granted_by, grant_reason)
values (
  '11000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'ADMIN',
  '10000000-0000-0000-0000-000000000001',
  'Synthetic administrator fixture'
);

insert into public.terms_versions (
  id, terms_version, privacy_version, educational_boundary_version,
  status, effective_at, created_by
)
values (
  '12000000-0000-0000-0000-000000000001',
  'synthetic-terms-v1', 'synthetic-privacy-v1', 'synthetic-boundary-v1',
  'ACTIVE', transaction_timestamp() - interval '1 day',
  '10000000-0000-0000-0000-000000000001'
);

insert into public.terms_acceptances (
  id, user_id, terms_version_id, terms_version, privacy_version,
  educational_boundary_version
)
values (
  '13000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '12000000-0000-0000-0000-000000000001',
  'synthetic-terms-v1', 'synthetic-privacy-v1', 'synthetic-boundary-v1'
);

insert into public.education_stages (id, code, name_en, name_ar, sort_order)
values (
  '20000000-0000-0000-0000-000000000001',
  'UNIVERSITY', 'Synthetic University Stage', 'مرحلة جامعية تجريبية', 1
);

insert into public.institutions (
  id, education_stage_id, code, name_en, name_ar
)
values (
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  'SYNTHETIC_UNIVERSITY', 'Synthetic University', 'جامعة تجريبية'
);

insert into public.programs (
  id, institution_id, code, program_type, name_en, name_ar,
  default_unit_type, unit_label_singular_en, unit_label_plural_en,
  unit_label_singular_ar, unit_label_plural_ar
)
values (
  '20000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000002',
  'SYNTHETIC_MEDICINE', 'UNIVERSITY_PROGRAM',
  'Synthetic Medicine', 'طب تجريبي', 'MODULE',
  'Module', 'Modules', 'وحدة', 'وحدات'
);

insert into public.academic_levels (
  id, program_id, code, name_en, name_ar, sort_order
)
values (
  '20000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000003',
  'LEVEL_1', 'Level One', 'المستوى الأول', 1
);

insert into public.terms (
  id, academic_level_id, code, name_en, name_ar, sort_order
)
values (
  '20000000-0000-0000-0000-000000000005',
  '20000000-0000-0000-0000-000000000004',
  'TERM_1', 'Term One', 'الفصل الأول', 1
);

insert into public.cohorts (
  id, term_id, code, name, curriculum_edition, starts_at, ends_at, status
)
values (
  '20000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000005',
  'COHORT_2026', 'Synthetic Cohort', 'synthetic-edition-2026',
  transaction_timestamp() - interval '30 days',
  transaction_timestamp() + interval '180 days', 'ACTIVE'
);

insert into public.curriculum_units (
  id, cohort_id, code, unit_type, title_en, title_ar, sort_order,
  publication_status, published_at, published_by
)
values
  (
    '20000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000006',
    'UNIT_A', 'MODULE', 'Synthetic Unit A', 'وحدة تجريبية أ', 1,
    'PUBLISHED', transaction_timestamp() - interval '1 day',
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000006',
    'UNIT_B', 'MODULE', 'Synthetic Unit B', 'وحدة تجريبية ب', 2,
    'DRAFT', null, null
  );

insert into public.cohort_memberships (
  id, user_id, cohort_id, status, starts_at, ends_at, granted_by, grant_reason
)
values
  (
    '21000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000006',
    'ACTIVE', transaction_timestamp() - interval '1 day',
    transaction_timestamp() + interval '30 days',
    '10000000-0000-0000-0000-000000000001', 'Synthetic access fixture'
  ),
  (
    '21000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000006',
    'EXPIRED', transaction_timestamp() - interval '30 days',
    transaction_timestamp() - interval '1 day',
    '10000000-0000-0000-0000-000000000001', 'Synthetic expired access fixture'
  );

insert into public.cohort_releases (
  id, cohort_id, release_status, changed_by, reason
)
values (
  '22000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000006',
  'UNLOCKED', '10000000-0000-0000-0000-000000000001',
  'Synthetic unlocked cohort fixture'
);

insert into public.collection_campaigns (
  id, cohort_id, name, status, opens_at, closes_at, created_by
)
values (
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000006',
  'Synthetic collection campaign', 'OPEN',
  transaction_timestamp() - interval '1 day',
  transaction_timestamp() + interval '7 days',
  '10000000-0000-0000-0000-000000000001'
);

insert into public.campaign_curriculum_units (
  id, campaign_id, curriculum_unit_id, cohort_id
)
values
  (
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000006'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000006'
  );

insert into public.batch_leader_assignments (
  id, campaign_id, user_id, status, expires_at, invited_by, accepted_at
)
values (
  '31000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  'ACTIVE', transaction_timestamp() + interval '7 days',
  '10000000-0000-0000-0000-000000000001',
  transaction_timestamp()
);

insert into public.source_submissions (
  id, campaign_id, curriculum_unit_id, cohort_id, submitted_by,
  client_idempotency_key, source_name, declared_format, declared_rights, status
)
values
  (
    '32000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000002',
    'synthetic-unit-a-submission', 'Synthetic Unit A source',
    'application/pdf', 'DECLARED', 'ACCEPTED'
  ),
  (
    '32000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000002',
    'synthetic-unit-b-submission', 'Synthetic Unit B source',
    'application/pdf', 'DECLARED', 'ACCEPTED'
  );

insert into public.source_assets (
  id, cohort_id, curriculum_unit_id, canonical_title, source_kind
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007',
    'Synthetic Source A', 'BOOK'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000008',
    'Synthetic Source B', 'BOOK'
  );

insert into public.source_versions (
  id, source_asset_id, version_number, submission_id, checksum, mime_type,
  byte_size, page_count, language_profile, curriculum_edition,
  rights_status, rights_valid_from, rights_valid_until, processing_status,
  activation_status, accepted_at, accepted_by
)
values
  (
    '41000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001', 1,
    '32000000-0000-0000-0000-000000000001',
    'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'application/pdf', 1024, 2, 'EN', 'synthetic-edition-2026',
    'VALID', transaction_timestamp() - interval '1 day',
    transaction_timestamp() + interval '30 days', 'READY', 'ACTIVE',
    transaction_timestamp(), '10000000-0000-0000-0000-000000000001'
  ),
  (
    '41000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000002', 1,
    '32000000-0000-0000-0000-000000000002',
    'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'application/pdf', 1024, 2, 'EN', 'synthetic-edition-2026',
    'VALID', transaction_timestamp() - interval '1 day',
    transaction_timestamp() + interval '30 days', 'READY', 'ACTIVE',
    transaction_timestamp(), '10000000-0000-0000-0000-000000000001'
  );

insert into unimind_private.raw_objects (
  id, source_version_id, provider, object_key, status, received_at, delete_after
)
values (
  '42000000-0000-0000-0000-000000000001',
  '41000000-0000-0000-0000-000000000001',
  'synthetic-storage', 'synthetic/raw/unit-a.pdf', 'STORED',
  transaction_timestamp(), transaction_timestamp() + interval '1 day'
);

insert into unimind_private.processing_jobs (
  id, source_version_id, job_type, idempotency_key, priority
)
values (
  '50000000-0000-0000-0000-000000000001',
  '41000000-0000-0000-0000-000000000001',
  'CHUNK', 'synthetic-job-unit-a', 10
);

insert into unimind_private.processed_documents (
  id, source_version_id, format, object_key, checksum, compressed_bytes, schema_version
)
values
  (
    '60000000-0000-0000-0000-000000000001',
    '41000000-0000-0000-0000-000000000001',
    'SYNTHETIC_FIXTURE', 'synthetic/processed/unit-a.md',
    'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    256, 'synthetic-v1'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '41000000-0000-0000-0000-000000000002',
    'SYNTHETIC_FIXTURE', 'synthetic/processed/unit-b.md',
    'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    256, 'synthetic-v1'
  );

insert into unimind_private.source_locators (
  id, processed_document_id, source_version_id, locator_type,
  original_page, processed_start, processed_end, confidence
)
values
  (
    '61000000-0000-0000-0000-000000000001',
    '60000000-0000-0000-0000-000000000001',
    '41000000-0000-0000-0000-000000000001',
    'SYNTHETIC', 1, 0, 42, 1
  ),
  (
    '61000000-0000-0000-0000-000000000002',
    '60000000-0000-0000-0000-000000000002',
    '41000000-0000-0000-0000-000000000002',
    'SYNTHETIC', 1, 0, 42, 1
  );

insert into unimind_private.source_segments (
  id, source_version_id, source_asset_id, cohort_id, curriculum_unit_id,
  curriculum_edition, sequence_number, content, content_hash, token_count,
  locator_id, language
)
values
  (
    '62000000-0000-0000-0000-000000000001',
    '41000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007',
    'synthetic-edition-2026', 1, 'Synthetic evidence for unit A.',
    'sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    8, '61000000-0000-0000-0000-000000000001', 'EN'
  ),
  (
    '62000000-0000-0000-0000-000000000002',
    '41000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000008',
    'synthetic-edition-2026', 1, 'Synthetic evidence for unit B.',
    'sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    8, '61000000-0000-0000-0000-000000000002', 'EN'
  );

insert into unimind_private.embedding_configs (
  id, provider, model, dimensions, normalization, distance_operator, version, active
)
values (
  '70000000-0000-0000-0000-000000000001',
  'synthetic-provider', 'synthetic-model', 3, 'L2', 'COSINE', 'synthetic-v1', true
);

insert into unimind_private.segment_embeddings (
  id, source_segment_id, embedding_config_id, embedding
)
values (
  '71000000-0000-0000-0000-000000000001',
  '62000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000001',
  '[0.1,0.2,0.3]'::extensions.vector
);
