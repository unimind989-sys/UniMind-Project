begin;
select plan(4);

insert into public.studio_requests (
  id, user_id, cohort_id, curriculum_unit_id, artifact_type, language,
  source_scope_hash, idempotency_key
) values (
  '81000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000007',
  'MCQ_QUIZ', 'EN',
  'sha256:1111111111111111111111111111111111111111111111111111111111111111',
  'synthetic-studio-request'
);

select throws_ok(
  $$insert into public.studio_artifacts (
      studio_request_id, artifact_type, content_json, policy_version,
      model_version, artifact_hash
    ) values (
      '81000000-0000-0000-0000-000000000001', 'MCQ_QUIZ',
      '{"items":[{"answer_key":"A"}]}'::jsonb,
      'synthetic-policy-v1', 'mock-model-v1',
      'sha256:2222222222222222222222222222222222222222222222222222222222222222'
    )$$,
  '23514', null,
  'student-visible artifact content cannot contain an answer key'
);

insert into public.studio_artifacts (
  id, studio_request_id, artifact_type, content_json, policy_version,
  model_version, artifact_hash
) values (
  '81000000-0000-0000-0000-000000000002',
  '81000000-0000-0000-0000-000000000001', 'MCQ_QUIZ',
  '{"items":[{"key":"q1","prompt":"Synthetic question","options":["A","B"]}]}'::jsonb,
  'synthetic-policy-v1', 'mock-model-v1',
  'sha256:3333333333333333333333333333333333333333333333333333333333333333'
);
insert into public.artifact_evidence (artifact_id, source_segment_id, usage_type)
values (
  '81000000-0000-0000-0000-000000000002',
  '62000000-0000-0000-0000-000000000001', 'SUPPORT'
);
insert into public.artifact_validation_results (
  artifact_id, validator_version, result
) values (
  '81000000-0000-0000-0000-000000000002', 'synthetic-validator-v1', 'PASS'
);

select lives_ok(
  $$update public.studio_artifacts
    set validation_status = 'PASSED', published_at = transaction_timestamp()
    where id = '81000000-0000-0000-0000-000000000002'$$,
  'validated evidence-linked artifact can publish'
);
select throws_ok(
  $$insert into public.artifact_evidence (artifact_id, source_segment_id, usage_type)
    values (
      '81000000-0000-0000-0000-000000000002',
      '62000000-0000-0000-0000-000000000002', 'SUPPORT'
    )$$,
  '23514',
  'artifact evidence is outside the authorized request scope',
  'cross-unit artifact evidence is rejected'
);
select is(
  (select count(*) from public.artifact_evidence where artifact_id = '81000000-0000-0000-0000-000000000002'),
  1::bigint,
  'only authorized artifact evidence remains'
);

select * from finish();
rollback;
