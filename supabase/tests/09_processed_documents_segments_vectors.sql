begin;
select plan(3);

select is(
  (select extensions.vector_dims(embedding) from unimind_private.segment_embeddings where id = '71000000-0000-0000-0000-000000000001'),
  3,
  'stored embedding dimensions match the versioned configuration'
);
select throws_ok(
  $$insert into unimind_private.segment_embeddings (
      source_segment_id, embedding_config_id, embedding
    ) values (
      '62000000-0000-0000-0000-000000000002',
      '70000000-0000-0000-0000-000000000001',
      '[0.1,0.2]'::extensions.vector
    )$$,
  '22000',
  'embedding dimensions do not match configuration',
  'dimension mismatch is rejected before storage'
);
select is(
  (select count(*) from unimind_private.source_segments where source_version_id = '41000000-0000-0000-0000-000000000001'),
  1::bigint,
  'content identity is unique within a source version'
);

select * from finish();
rollback;
