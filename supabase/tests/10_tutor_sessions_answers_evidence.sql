begin;
\ir ../fixtures/wp02-synthetic.sql
select plan(3);

insert into public.chat_sessions (
  id, user_id, cohort_id, curriculum_unit_id, language_mode, retention_mode
) values (
  '80000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000007', 'EN', 'MINIMAL'
);
insert into public.chat_messages (id, session_id, role, content)
values (
  '80000000-0000-0000-0000-000000000002',
  '80000000-0000-0000-0000-000000000001',
  'ASSISTANT', 'Synthetic grounded answer.'
);
insert into public.chat_answers (
  id, assistant_message_id, evidence_status, policy_version, model_version
) values (
  '80000000-0000-0000-0000-000000000003',
  '80000000-0000-0000-0000-000000000002',
  'FULL', 'synthetic-policy-v1', 'mock-model-v1'
);
insert into public.answer_evidence (
  id, answer_id, source_segment_id, rank, usage_type
) values (
  '80000000-0000-0000-0000-000000000004',
  '80000000-0000-0000-0000-000000000003',
  '62000000-0000-0000-0000-000000000001', 1, 'SUPPORT'
);

select lives_ok(
  $$update public.chat_answers
    set validation_status = 'PASSED', finalized_at = transaction_timestamp()
    where id = '80000000-0000-0000-0000-000000000003'$$,
  'an evidence-linked answer can finalize'
);
select throws_ok(
  $$insert into public.answer_evidence (
      answer_id, source_segment_id, rank, usage_type
    ) values (
      '80000000-0000-0000-0000-000000000003',
      '62000000-0000-0000-0000-000000000002', 2, 'SUPPORT'
    )$$,
  '23514',
  'answer evidence is outside the authorized session scope',
  'cross-unit answer evidence is rejected'
);
select is(
  (select count(*) from public.answer_evidence where answer_id = '80000000-0000-0000-0000-000000000003'),
  1::bigint,
  'only the authorized immutable segment remains linked'
);

select * from finish();
rollback;
