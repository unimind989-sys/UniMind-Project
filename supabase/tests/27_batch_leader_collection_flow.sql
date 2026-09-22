-- Matrix test IDs exercised below:
-- WP03-T05-ANON-DENY, WP03-T05-SERVER-ONLY, WP03-T05-FUNCTION-GRANTS.
begin;
select plan(21);

insert into public.requested_material_items (
  id, campaign_id, curriculum_unit_id, title, expected_type, required, status
) values (
  '99000000-0000-4000-8000-000000000005',
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000007',
  'WP03-T05 synthetic document request',
  'DOCUMENT',
  true,
  'REQUESTED'
);

create temporary table collection_test_state (
  label text primary key,
  value uuid not null
);

grant select, insert on collection_test_state to authenticated, service_role;

select ok(
  not has_schema_privilege('authenticated', 'unimind_private', 'USAGE'),
  'authenticated clients cannot browse the private upload evidence schema'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.register_synthetic_collection_upload(uuid,uuid,uuid,uuid,text,text,text,text,text,text,text,bigint)',
    'EXECUTE'
  ),
  'authenticated callers cannot invoke the server-only upload registrar'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.register_synthetic_collection_upload(uuid,uuid,uuid,uuid,text,text,text,text,text,text,text,bigint)',
    'EXECUTE'
  ),
  'the trusted service runtime receives the bounded upload registration seam'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.register_synthetic_collection_upload(uuid,uuid,uuid,uuid,text,text,text,text,text,text,text,bigint)',
    'EXECUTE'
  ),
  'anonymous callers cannot register collection uploads'
);

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","app_metadata":{"role":"BATCH_LEADER"}}';

select is(
  (
    select count(*)
    from public.current_batch_leader_campaign(
      '30000000-0000-0000-0000-000000000001'
    )
    where requested_item_id = '99000000-0000-4000-8000-000000000005'
  ),
  1::bigint,
  'the active assignee sees the requested item through the caller-scoped read seam'
);
select throws_ok(
  $$select count(*) from unimind_private.collection_uploads$$,
  '42501',
  null,
  'authenticated callers cannot read private upload evidence directly'
);

reset role;
set local role service_role;
set local request.jwt.claim.role = 'service_role';

insert into collection_test_state (label, value)
select 'first-upload', upload_id
from public.register_synthetic_collection_upload(
  '10000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001',
  '99000000-0000-4000-8000-000000000005',
  '20000000-0000-0000-0000-000000000007',
  'wp03-t05-client-key-one',
  'synthetic-handout.pdf',
  'PDF',
  'mock-object-storage-provider',
  'synthetic/wp03-t05/object-one',
  'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  'application/pdf',
  2048
);

select isnt(
  (select value from collection_test_state where label = 'first-upload'),
  null::uuid,
  'a valid synthetic upload receipt is registered'
);
select is(
  (
    select upload_id
    from public.register_synthetic_collection_upload(
      '10000000-0000-0000-0000-000000000002',
      '30000000-0000-0000-0000-000000000001',
      '99000000-0000-4000-8000-000000000005',
      '20000000-0000-0000-0000-000000000007',
      'wp03-t05-client-key-one',
      'synthetic-handout.pdf',
      'PDF',
      'mock-object-storage-provider',
      'synthetic/wp03-t05/object-one',
      'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'application/pdf',
      2048
    )
  ),
  (select value from collection_test_state where label = 'first-upload'),
  'an exact upload retry returns the original upload id'
);
select throws_ok(
  $$select * from public.register_synthetic_collection_upload(
    '10000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    '99000000-0000-4000-8000-000000000005',
    '20000000-0000-0000-0000-000000000007',
    'wp03-t05-client-key-one',
    'synthetic-handout.pdf',
    'PDF',
    'mock-object-storage-provider',
    'synthetic/wp03-t05/object-one',
    'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'application/pdf',
    2048
  )$$,
  '23505',
  'collection idempotency conflict',
  'a conflicting checksum cannot replay an upload key'
);

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';

select throws_ok(
  $$select * from public.finalize_synthetic_source_submission(
    '30000000-0000-0000-0000-000000000001',
    '99000000-0000-4000-8000-000000000005',
    (select value from collection_test_state where label = 'first-upload'),
    'wp03-t05-client-key-one',
    'Synthetic handout',
    'Synthetic fixture with no private source content.',
    'UNKNOWN'
  )$$,
  '42501',
  'collection rights unavailable',
  'unknown rights fail closed before finalization'
);
select is(
  (
    select replayed
    from public.finalize_synthetic_source_submission(
      '30000000-0000-0000-0000-000000000001',
      '99000000-0000-4000-8000-000000000005',
      (select value from collection_test_state where label = 'first-upload'),
      'wp03-t05-client-key-one',
      'Synthetic handout',
      'Synthetic fixture with no private source content.',
      'DECLARED'
    )
  ),
  false,
  'a valid finalization creates the first durable submission'
);
select is(
  (
    select replayed
    from public.finalize_synthetic_source_submission(
      '30000000-0000-0000-0000-000000000001',
      '99000000-0000-4000-8000-000000000005',
      (select value from collection_test_state where label = 'first-upload'),
      'wp03-t05-client-key-one',
      'Synthetic handout',
      'Synthetic fixture with no private source content.',
      'DECLARED'
    )
  ),
  true,
  'an exact finalization replay returns the original submission'
);
select is(
  (
    select count(*)
    from public.source_submissions
    where requested_material_item_id = '99000000-0000-4000-8000-000000000005'
      and client_idempotency_key = 'wp03-t05-client-key-one'
  ),
  1::bigint,
  'exact replay leaves one durable submission'
);
select throws_ok(
  $$select * from public.finalize_synthetic_source_submission(
    '30000000-0000-0000-0000-000000000001',
    '99000000-0000-4000-8000-000000000005',
    (select value from collection_test_state where label = 'first-upload'),
    'wp03-t05-client-key-one',
    'Changed replay title',
    'Synthetic fixture with no private source content.',
    'DECLARED'
  )$$,
  '23505',
  'collection idempotency conflict',
  'a conflicting finalization replay is rejected'
);

reset role;
set local role service_role;
set local request.jwt.claim.role = 'service_role';

select throws_ok(
  $$select * from public.register_synthetic_collection_upload(
    '10000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    '99000000-0000-4000-8000-000000000005',
    '20000000-0000-0000-0000-000000000007',
    'wp03-t05-invalid-checksum',
    'synthetic-handout.pdf',
    'PDF',
    'mock-object-storage-provider',
    'synthetic/wp03-t05/invalid-checksum',
    'sha256:not-a-checksum',
    'application/pdf',
    2048
  )$$,
  '22023',
  'collection upload invalid',
  'malformed upload checksum evidence is rejected'
);

insert into collection_test_state (label, value)
select 'stale-upload', upload_id
from public.register_synthetic_collection_upload(
  '10000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001',
  '99000000-0000-4000-8000-000000000005',
  '20000000-0000-0000-0000-000000000007',
  'wp03-t05-client-key-two',
  'synthetic-handout-two.pdf',
  'PDF',
  'mock-object-storage-provider',
  'synthetic/wp03-t05/object-two',
  'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  'application/pdf',
  3072
);

select isnt(
  (select value from collection_test_state where label = 'stale-upload'),
  null::uuid,
  'the service runtime can register a second verified receipt for the assignee'
);

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';

select throws_ok(
  $$select * from public.finalize_synthetic_source_submission(
    '30000000-0000-0000-0000-000000000001',
    '99000000-0000-4000-8000-000000000005',
    (select value from collection_test_state where label = 'stale-upload'),
    'wp03-t05-client-key-two',
    'Cross-user synthetic handout',
    'Synthetic fixture from a different actor.',
    'DECLARED'
  )$$,
  '42501',
  'collection scope unavailable',
  'a second actor cannot finalize the first actor upload receipt'
);

reset role;
update public.batch_leader_assignments
set status = 'EXPIRED', expires_at = transaction_timestamp() - interval '1 minute'
where id = '31000000-0000-0000-0000-000000000001';

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';

select is(
  (
    select count(*)
    from public.current_batch_leader_campaign(
      '30000000-0000-0000-0000-000000000001'
    )
  ),
  0::bigint,
  'an expired assignment immediately removes campaign visibility'
);

reset role;
set local role service_role;
set local request.jwt.claim.role = 'service_role';

select throws_ok(
  $$select * from public.register_synthetic_collection_upload(
    '10000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    '99000000-0000-4000-8000-000000000005',
    '20000000-0000-0000-0000-000000000007',
    'wp03-t05-client-key-three',
    'synthetic-handout-three.pdf',
    'PDF',
    'mock-object-storage-provider',
    'synthetic/wp03-t05/object-three',
    'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    'application/pdf',
    1024
  )$$,
  '42501',
  'collection scope unavailable',
  'the server registrar rechecks an expired assignee before writing evidence'
);

reset role;
set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';

select throws_ok(
  $$select * from public.finalize_synthetic_source_submission(
    '30000000-0000-0000-0000-000000000001',
    '99000000-0000-4000-8000-000000000005',
    (select value from collection_test_state where label = 'stale-upload'),
    'wp03-t05-client-key-two',
    'Stale synthetic handout',
    'Synthetic fixture whose assignment was revoked.',
    'DECLARED'
  )$$,
  '42501',
  'collection scope unavailable',
  'finalization rechecks an assignment revoked after upload'
);

reset role;
select is(
  (
    select count(*)
    from unimind_private.collection_uploads
    where uploaded_by = '10000000-0000-0000-0000-000000000002'
      and client_idempotency_key like 'wp03-t05-client-key-%'
  ),
  2::bigint,
  'forbidden and conflicting calls create no additional upload records'
);

select * from finish();
rollback;
