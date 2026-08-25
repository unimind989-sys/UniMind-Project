insert into unimind_private.synthetic_foundation_fixture (
  fixture_id,
  fixture_kind,
  payload,
  leakage_canary
)
values
  (
    'synthetic_catalog_foundation',
    'catalog',
    '{"institution":"synthetic_university","program":"synthetic_program","curriculum_unit":"synthetic_foundation_unit"}'::jsonb,
    'UNIMIND_SYNTHETIC_CANARY_CATALOG_WP01'
  ),
  (
    'synthetic_identity_foundation',
    'identity',
    '{"external_id":"synthetic_student_001","label":"Synthetic Student"}'::jsonb,
    'UNIMIND_SYNTHETIC_CANARY_IDENTITY_WP01'
  ),
  (
    'synthetic_source_foundation',
    'source',
    '{"source_id":"synthetic_source_001","text":"Synthetic source text for hosted reset verification only."}'::jsonb,
    'UNIMIND_SYNTHETIC_CANARY_SOURCE_WP01'
  )
on conflict (fixture_id) do update
set
  fixture_kind = excluded.fixture_kind,
  payload = excluded.payload,
  leakage_canary = excluded.leakage_canary;
