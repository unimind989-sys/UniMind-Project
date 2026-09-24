begin;
select plan(71);

select ok(
  not has_schema_privilege('authenticated', 'unimind_private', 'USAGE'),
  'authenticated clients cannot access the private governance schema'
);
select ok(
  not has_schema_privilege('anon', 'unimind_private', 'USAGE'),
  'anonymous clients cannot access the private governance schema'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.submit_admin_governance_action(uuid,text,uuid,integer,text,text,uuid,uuid,uuid,timestamptz,boolean,text)',
    'EXECUTE'
  ),
  'authenticated clients cannot invoke an audited mutation directly'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.submit_admin_governance_action(uuid,text,uuid,integer,text,text,uuid,uuid,uuid,timestamptz,boolean,text)',
    'EXECUTE'
  ),
  'anonymous clients cannot invoke an audited mutation'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.submit_admin_governance_action(uuid,text,uuid,integer,text,text,uuid,uuid,uuid,timestamptz,boolean,text)',
    'EXECUTE'
  ),
  'the verified server adapter receives the bounded mutation seam'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.current_admin_action_queue(uuid,text)',
    'EXECUTE'
  ),
  'authenticated clients cannot list private governance candidates'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.current_admin_action_queue(uuid,text)',
    'EXECUTE'
  ),
  'the verified server adapter receives the candidate queue seam'
);
select ok(
  not has_table_privilege('authenticated', 'unimind_private.admin_action_commands', 'SELECT'),
  'authenticated callers cannot read command history directly'
);
select ok(
  not has_table_privilege('anon', 'unimind_private.admin_action_commands', 'SELECT'),
  'anonymous callers cannot read command history'
);
select ok(
  not has_table_privilege('service_role', 'unimind_private.admin_action_commands', 'SELECT'),
  'the server adapter uses its bounded RPC instead of reading command storage directly'
);
select ok(
  (select relrowsecurity from pg_catalog.pg_class
    where oid = 'unimind_private.admin_action_commands'::regclass),
  'the durable command log has row-level security enabled'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'unimind_private.admin_action_commands'::regclass
      and tgname = 'admin_action_commands_governance_audit'
      and not tgisinternal
  ),
  'command creation and status transitions append governance audit evidence'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'unimind_private.admin_action_confirmations'::regclass
      and tgname = 'admin_action_confirmations_governance_audit'
      and not tgisinternal
  ),
  'each founder confirmation is audited'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_trigger
    where tgrelid = 'unimind_private.raw_data_holds'::regclass
      and tgname = 'raw_data_holds_governance_audit'
      and not tgisinternal
  ),
  'synthetic hold creation and removal are audited'
);
select is(
  (select count(*) from unimind_private.founder_principals),
  0::bigint,
  'the migration does not provision either production founder identity'
);
select is(
  (select count(*) from unimind_private.admin_mock_artifact_approvals),
  0::bigint,
  'the migration does not approve an artifact or enable a provider'
);
select ok(
  position(
    'accepted_at is not null'
    in lower((select pg_get_constraintdef(oid) from pg_catalog.pg_constraint
      where conname = 'source_versions_ready_gate_check'))
  ) > 0,
  'processing readiness still requires durable acceptance'
);
select ok(
  position(
    'activation_status' in lower((select pg_get_constraintdef(oid)
      from pg_catalog.pg_constraint where conname = 'source_versions_ready_gate_check'))
  ) = 0,
  'a READY historical version may be deactivated without destroying its processing state'
);
select ok(
  position(
    'rights_status' in lower((select pg_get_constraintdef(oid)
      from pg_catalog.pg_constraint where conname = 'source_versions_ready_gate_check'))
  ) = 0,
  'rights changes do not erase durable processing readiness'
);
select ok(
  position(
    'activation_status' in lower(pg_get_functiondef(
      'public.available_curriculum_units(boolean)'::regprocedure
    ))
  ) > 0,
  'student availability still requires current source activation'
);
select ok(
  position(
    'rights_status' in lower(pg_get_functiondef(
      'public.available_curriculum_units(boolean)'::regprocedure
    ))
  ) > 0,
  'student availability still requires current rights'
);
select ok(
  position(
    'processing_status = ''ready''' in lower(pg_get_functiondef(
      'public.available_curriculum_units(boolean)'::regprocedure
    ))
  ) > 0,
  'student availability still requires a READY source'
);
select ok(
  lower(pg_get_function_result(
    'public.current_admin_action_queue(uuid,text)'::regprocedure
  )) !~ 'object_key|provider_payload|source_text',
  'the queue return type excludes private object keys and provider payloads'
);
select ok(
  exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'unimind_private.admin_action_commands'::regclass
      and conname = 'admin_action_commands_actor_key_unique'
      and contype = 'u'
  ),
  'command idempotency is unique per verified actor'
);
select ok(
  lower(pg_get_indexdef(
    'unimind_private.admin_action_commands_one_pending_retry'::regclass
  )) like '%pending_owner_review%',
  'a source cannot accumulate multiple unreviewed retry requests'
);
select ok(
  lower(pg_get_functiondef(
    'unimind_private.admin_submit_governance_action(uuid,text,uuid,integer,text,text,uuid,uuid,uuid,timestamptz,boolean,text)'::regprocedure
  )) like '%when ''retry_source'' then%null%',
  'recording a retry never starts a worker or claims PROCESSING state'
);

set local unimind.actor_id = '10000000-0000-0000-0000-000000000001';
set local unimind.audit_reason = 'WP03-T06 synthetic governance action fixture';
set local unimind.correlation_id = '90000000-0000-0000-0000-000000000020';

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '10000000-0000-0000-0000-000000000004',
  'authenticated', 'authenticated', 'founder-z@synthetic.unimind.invalid', '',
  transaction_timestamp(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb, transaction_timestamp(), transaction_timestamp()
);

update public.profiles
set account_status = 'ACTIVE', updated_at = transaction_timestamp()
where user_id = '10000000-0000-0000-0000-000000000004';

insert into public.user_roles (id, user_id, role, granted_by, grant_reason)
values (
  '11000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000004',
  'ADMIN', '10000000-0000-0000-0000-000000000001',
  'Synthetic distinct founder administrator fixture'
);

insert into unimind_private.founder_principals (
  id, user_id, founder_slot, verified_at, verification_reason,
  verified_by, correlation_id
) values
  (
    '74000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001', 'AHMED',
    transaction_timestamp(), 'Synthetic test-only founder mapping',
    '10000000-0000-0000-0000-000000000001',
    '90000000-0000-0000-0000-000000000021'
  ),
  (
    '74000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000004', 'ZIAD',
    transaction_timestamp(), 'Synthetic test-only founder mapping',
    '10000000-0000-0000-0000-000000000001',
    '90000000-0000-0000-0000-000000000022'
  );

insert into public.curriculum_units (
  id, cohort_id, code, unit_type, title_en, title_ar, sort_order,
  publication_status, published_at, published_by
) values (
  '20000000-0000-0000-0000-000000000009',
  '20000000-0000-0000-0000-000000000006',
  'UNIT_C', 'MODULE', 'Synthetic Unit C', 'وحدة تجريبية ج', 3,
  'DRAFT', null, null
);

insert into unimind_private.system_feature_flags (
  id, key, enabled, config_json, changed_by, reason
) values (
  '73000000-0000-0000-0000-000000000001',
  'mock.artifact.fixture', false,
  jsonb_build_object(
    'provider', 'deterministic-mock',
    'environment', 'ci',
    'dependency_sha256', repeat('a', 64)
  ),
  '10000000-0000-0000-0000-000000000001',
  'Synthetic deterministic artifact test fixture'
);

insert into unimind_private.admin_mock_artifact_approvals (
  flag_key, runtime_environment, dependency_sha256, approved_by,
  reason, correlation_id
) values (
  'mock.artifact.fixture', 'ci', repeat('a', 64),
  '10000000-0000-0000-0000-000000000001',
  'Synthetic deterministic artifact test approval',
  '90000000-0000-0000-0000-000000000023'
);

update unimind_private.raw_objects
set provider = 'mock-object-storage-provider'
where id = '42000000-0000-0000-0000-000000000001';

create temporary table admin_action_test_results (
  action text primary key,
  command_id uuid not null,
  result jsonb not null
);
grant select, insert on admin_action_test_results to service_role;
grant select on unimind_private.admin_action_commands,
  unimind_private.raw_data_holds to service_role;

set local role service_role;
set local request.jwt.claim.role = 'service_role';

with submitted as (
  select public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'PUBLISH_UNIT',
    p_target_id => '20000000-0000-0000-0000-000000000008',
    p_expected_version => 1,
    p_expected_state => 'DRAFT',
    p_reason => 'Publish this synthetic unit after readiness review.',
    p_correlation_id => '90000000-0000-0000-0000-000000000030',
    p_idempotency_key => '91000000-0000-0000-0000-000000000030',
    p_runtime_environment => 'ci'
  ) as response
)
insert into admin_action_test_results (action, command_id, result)
select 'publish', (response ->> 'commandId')::uuid, response from submitted;

select is(
  (select result ->> 'status' from admin_action_test_results where action = 'publish'),
  'PENDING_SECOND_CONFIRMATION',
  'publishing a ready synthetic unit waits for a second founder'
);
select is(
  (select publication_status from public.curriculum_units
    where id = '20000000-0000-0000-0000-000000000008'),
  'DRAFT',
  'one founder cannot publish the unit'
);
select is(
  (select correlation_id from public.current_admin_action_queue(
    '10000000-0000-0000-0000-000000000001', 'ci'
  ) where pending_action_id = (
    select command_id from admin_action_test_results where action = 'publish'
  )),
  '90000000-0000-0000-0000-000000000030'::uuid,
  'the pending queue preserves the exact correlation id for the second founder'
);
select is(
  (
    public.submit_admin_governance_action(
      p_actor_id => '10000000-0000-0000-0000-000000000001',
      p_action => 'PUBLISH_UNIT',
      p_target_id => '20000000-0000-0000-0000-000000000008',
      p_expected_version => 1,
      p_expected_state => 'DRAFT',
      p_reason => 'Publish this synthetic unit after readiness review.',
      p_correlation_id => '90000000-0000-0000-0000-000000000030',
      p_idempotency_key => '91000000-0000-0000-0000-000000000030',
      p_runtime_environment => 'ci'
    ) ->> 'replayed'
  ),
  'true',
  'an exact request replay returns the original result'
);
select throws_ok(
  $$select public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'PUBLISH_UNIT',
    p_target_id => '20000000-0000-0000-0000-000000000008',
    p_expected_version => 1,
    p_expected_state => 'DRAFT',
    p_reason => 'Changed request reason for replay conflict.',
    p_correlation_id => '90000000-0000-0000-0000-000000000030',
    p_idempotency_key => '91000000-0000-0000-0000-000000000030',
    p_runtime_environment => 'ci'
  )$$,
  '23505', 'ADMIN_ACTION:CONFLICT',
  'the same idempotency key cannot carry a changed request'
);
select throws_ok(
  format(
    $$select public.submit_admin_governance_action(
      p_actor_id => '10000000-0000-0000-0000-000000000001',
      p_action => 'PUBLISH_UNIT',
      p_target_id => '20000000-0000-0000-0000-000000000008',
      p_expected_version => 1,
      p_expected_state => 'DRAFT',
      p_reason => 'Publish this synthetic unit after readiness review.',
      p_correlation_id => '90000000-0000-0000-0000-000000000030',
      p_idempotency_key => '91000000-0000-0000-0000-000000000031',
      p_pending_action_id => %L,
      p_runtime_environment => 'ci'
    )$$,
    (select command_id from admin_action_test_results where action = 'publish')
  ),
  '42501', 'ADMIN_ACTION:DIFFERENT_FOUNDER_REQUIRED',
  'the initiating founder cannot provide the second confirmation'
);

select is(
  (public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000004',
    p_action => 'PUBLISH_UNIT',
    p_target_id => '20000000-0000-0000-0000-000000000008',
    p_expected_version => 1,
    p_expected_state => 'DRAFT',
    p_reason => 'Publish this synthetic unit after readiness review.',
    p_correlation_id => '90000000-0000-0000-0000-000000000030',
    p_idempotency_key => '91000000-0000-0000-0000-000000000032',
    p_pending_action_id => (select command_id from admin_action_test_results where action = 'publish'),
    p_runtime_environment => 'ci'
  ) ->> 'status'),
  'APPLIED',
  'a distinct verified founder completes unit publication'
);
select is(
  (select publication_status from public.curriculum_units
    where id = '20000000-0000-0000-0000-000000000008'),
  'PUBLISHED',
  'the protected publication changes the unit state after both confirmations'
);

select is(
  (public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'LOCK_COHORT',
    p_target_id => '20000000-0000-0000-0000-000000000006',
    p_expected_version => 1,
    p_expected_state => 'UNLOCKED',
    p_reason => 'Contain this synthetic cohort during review.',
    p_correlation_id => '90000000-0000-0000-0000-000000000033',
    p_idempotency_key => '91000000-0000-0000-0000-000000000033',
    p_runtime_environment => 'ci'
  ) ->> 'status'),
  'APPLIED',
  'cohort lock is an immediate containment action'
);
select is(
  (select release_status from public.cohort_releases
    where cohort_id = '20000000-0000-0000-0000-000000000006'),
  'LOCKED',
  'the immediate cohort lock is durable'
);
insert into admin_action_test_results (action, command_id, result)
select 'unlock',
  (response ->> 'commandId')::uuid, response
from (
  select public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'UNLOCK_COHORT',
    p_target_id => '20000000-0000-0000-0000-000000000006',
    p_expected_version => 2,
    p_expected_state => 'LOCKED',
    p_reason => 'Unlock this synthetic cohort after readiness review.',
    p_correlation_id => '90000000-0000-0000-0000-000000000034',
    p_idempotency_key => '91000000-0000-0000-0000-000000000034',
    p_runtime_environment => 'ci'
  ) as response
) as submitted;
select is(
  (select result ->> 'status' from admin_action_test_results where action = 'unlock'),
  'PENDING_SECOND_CONFIRMATION',
  'cohort unlock is gated by two founders'
);
select is(
  (public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000004',
    p_action => 'UNLOCK_COHORT',
    p_target_id => '20000000-0000-0000-0000-000000000006',
    p_expected_version => 2,
    p_expected_state => 'LOCKED',
    p_reason => 'Unlock this synthetic cohort after readiness review.',
    p_correlation_id => '90000000-0000-0000-0000-000000000034',
    p_idempotency_key => '91000000-0000-0000-0000-000000000035',
    p_pending_action_id => (select command_id from admin_action_test_results where action = 'unlock'),
    p_runtime_environment => 'ci'
  ) ->> 'status'),
  'APPLIED',
  'a distinct founder completes cohort unlock after current readiness is rechecked'
);
select is(
  (select release_status from public.cohort_releases
    where cohort_id = '20000000-0000-0000-0000-000000000006'),
  'UNLOCKED',
  'the protected cohort unlock is durable'
);

select is(
  (public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'HIDE_UNIT',
    p_target_id => '20000000-0000-0000-0000-000000000008',
    p_expected_version => 2,
    p_expected_state => 'PUBLISHED',
    p_reason => 'Contain this synthetic unit while its status is reviewed.',
    p_correlation_id => '90000000-0000-0000-0000-000000000036',
    p_idempotency_key => '91000000-0000-0000-0000-000000000036',
    p_runtime_environment => 'ci'
  ) ->> 'status'),
  'APPLIED',
  'unit hide is an immediate audited containment action'
);
select is(
  (select publication_status from public.curriculum_units
    where id = '20000000-0000-0000-0000-000000000008'),
  'WITHDRAWN',
  'unit hide preserves the catalog publication-field constraint'
);

select is(
  (public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'DEACTIVATE_SOURCE',
    p_target_id => '41000000-0000-0000-0000-000000000001',
    p_expected_version => 1,
    p_expected_state => 'ACTIVE',
    p_reason => 'Remove this synthetic source from current availability.',
    p_correlation_id => '90000000-0000-0000-0000-000000000037',
    p_idempotency_key => '91000000-0000-0000-0000-000000000037',
    p_runtime_environment => 'ci'
  ) ->> 'status'),
  'APPLIED',
  'source deactivation remains available for containment'
);
select is(
  (select activation_status from public.source_versions
    where id = '41000000-0000-0000-0000-000000000001'),
  'DEACTIVATED',
  'source deactivation preserves its processed history'
);
insert into admin_action_test_results (action, command_id, result)
select 'activate', (response ->> 'commandId')::uuid, response
from (
  select public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'ACTIVATE_SOURCE',
    p_target_id => '41000000-0000-0000-0000-000000000001',
    p_expected_version => 2,
    p_expected_state => 'DEACTIVATED',
    p_reason => 'Activate this accepted synthetic source version.',
    p_correlation_id => '90000000-0000-0000-0000-000000000038',
    p_idempotency_key => '91000000-0000-0000-0000-000000000038',
    p_runtime_environment => 'ci'
  ) as response
) as submitted;
select is(
  (select result ->> 'status' from admin_action_test_results where action = 'activate'),
  'PENDING_SECOND_CONFIRMATION',
  'source activation waits for a second founder'
);
select is(
  (public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000004',
    p_action => 'ACTIVATE_SOURCE',
    p_target_id => '41000000-0000-0000-0000-000000000001',
    p_expected_version => 2,
    p_expected_state => 'DEACTIVATED',
    p_reason => 'Activate this accepted synthetic source version.',
    p_correlation_id => '90000000-0000-0000-0000-000000000038',
    p_idempotency_key => '91000000-0000-0000-0000-000000000039',
    p_pending_action_id => (select command_id from admin_action_test_results where action = 'activate'),
    p_runtime_environment => 'ci'
  ) ->> 'status'),
  'APPLIED',
  'a distinct founder activates only the rights-valid matching edition'
);
select is(
  (select activation_status from public.source_versions
    where id = '41000000-0000-0000-0000-000000000001'),
  'ACTIVE',
  'the confirmed source activation is durable'
);

reset role;
update public.source_versions
set processing_status = 'NEEDS_REVIEW'
where id = '41000000-0000-0000-0000-000000000002';
set local role service_role;
select is(
  (public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'QUARANTINE_SOURCE',
    p_target_id => '41000000-0000-0000-0000-000000000002',
    p_expected_version => 1,
    p_expected_state => 'NEEDS_REVIEW',
    p_reason => 'Quarantine this synthetic source for review.',
    p_correlation_id => '90000000-0000-0000-0000-000000000040',
    p_idempotency_key => '91000000-0000-0000-0000-000000000040',
    p_runtime_environment => 'ci'
  ) ->> 'status'),
  'APPLIED',
  'quarantine is an immediate containment action'
);
select is(
  (select governance_state from public.source_versions
    where id = '41000000-0000-0000-0000-000000000002'),
  'QUARANTINED',
  'quarantine preserves source provenance while recording a separate governance state'
);
insert into admin_action_test_results (action, command_id, result)
select 'retry', (response ->> 'commandId')::uuid, response
from (
  select public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'RETRY_SOURCE',
    p_target_id => '41000000-0000-0000-0000-000000000002',
    p_expected_version => 2,
    p_expected_state => 'QUARANTINED',
    p_reason => 'Request a deterministic retry for this source.',
    p_correlation_id => '90000000-0000-0000-0000-000000000041',
    p_idempotency_key => '91000000-0000-0000-0000-000000000041',
    p_runtime_environment => 'ci'
  ) as response
) as submitted;
select is(
  (select result ->> 'status' from admin_action_test_results where action = 'retry'),
  'PENDING_OWNER_REVIEW',
  'retry records an owner-review request instead of starting a worker'
);
select is(
  (select processing_status from public.source_versions
    where id = '41000000-0000-0000-0000-000000000002'),
  'NEEDS_REVIEW',
  'a retry request never reports PROCESSING before worker acceptance'
);

select is(
  (public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'PLACE_RAW_HOLD',
    p_target_id => '42000000-0000-0000-0000-000000000001',
    p_expected_version => 1,
    p_expected_state => 'STORED',
    p_reason => 'Preserve this synthetic object for its review window.',
    p_correlation_id => '90000000-0000-0000-0000-000000000042',
    p_idempotency_key => '91000000-0000-0000-0000-000000000042',
    p_hold_expires_at => transaction_timestamp() + interval '30 days',
    p_review_attested => true,
    p_runtime_environment => 'ci'
  ) ->> 'status'),
  'APPLIED',
  'a reviewed, expiring hold can be placed on a synthetic object'
);
select is(
  (select status from unimind_private.raw_objects
    where id = '42000000-0000-0000-0000-000000000001'),
  'HELD',
  'raw hold placement records preservation without deleting bytes'
);
insert into admin_action_test_results (action, command_id, result)
select 'remove_hold', (response ->> 'commandId')::uuid, response
from (
  select public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'REMOVE_RAW_HOLD',
    p_target_id => '42000000-0000-0000-0000-000000000001',
    p_expected_version => 2,
    p_expected_state => 'HELD',
    p_reason => 'Remove the synthetic hold after the fresh safety review.',
    p_correlation_id => '90000000-0000-0000-0000-000000000043',
    p_idempotency_key => '91000000-0000-0000-0000-000000000043',
    p_runtime_environment => 'ci'
  ) as response
) as submitted;
select is(
  (select result ->> 'status' from admin_action_test_results where action = 'remove_hold'),
  'PENDING_SECOND_CONFIRMATION',
  'hold removal is protected after its fresh durability check'
);
select is(
  (select status from unimind_private.raw_objects
    where id = '42000000-0000-0000-0000-000000000001'),
  'HELD',
  'one founder cannot release a raw-data hold'
);
select is(
  (public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000004',
    p_action => 'REMOVE_RAW_HOLD',
    p_target_id => '42000000-0000-0000-0000-000000000001',
    p_expected_version => 2,
    p_expected_state => 'HELD',
    p_reason => 'Remove the synthetic hold after the fresh safety review.',
    p_correlation_id => '90000000-0000-0000-0000-000000000043',
    p_idempotency_key => '91000000-0000-0000-0000-000000000044',
    p_pending_action_id => (select command_id from admin_action_test_results where action = 'remove_hold'),
    p_runtime_environment => 'ci'
  ) ->> 'status'),
  'APPLIED',
  'a distinct founder releases the hold only after the fresh synthetic safety check'
);
select is(
  (select status from unimind_private.raw_objects
    where id = '42000000-0000-0000-0000-000000000001'),
  'STORED',
  'hold removal changes retention state but never calls a storage delete'
);
select is(
  (select status from unimind_private.raw_data_holds
    where raw_object_id = '42000000-0000-0000-0000-000000000001'),
  'REMOVED',
  'raw-hold history remains durable after the hold is released'
);

insert into admin_action_test_results (action, command_id, result)
select 'enable_flag', (response ->> 'commandId')::uuid, response
from (
  select public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'ENABLE_FLAG',
    p_target_id => '73000000-0000-0000-0000-000000000001',
    p_expected_version => 1,
    p_expected_state => 'DISABLED',
    p_reason => 'Enable this approved deterministic mock artifact.',
    p_correlation_id => '90000000-0000-0000-0000-000000000045',
    p_idempotency_key => '91000000-0000-0000-0000-000000000045',
    p_runtime_environment => 'ci'
  ) as response
) as submitted;
select is(
  (select result ->> 'status' from admin_action_test_results where action = 'enable_flag'),
  'PENDING_SECOND_CONFIRMATION',
  'only the approved zero-cost deterministic mock artifact may enter the two-founder gate'
);
select is(
  (public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000004',
    p_action => 'ENABLE_FLAG',
    p_target_id => '73000000-0000-0000-0000-000000000001',
    p_expected_version => 1,
    p_expected_state => 'DISABLED',
    p_reason => 'Enable this approved deterministic mock artifact.',
    p_correlation_id => '90000000-0000-0000-0000-000000000045',
    p_idempotency_key => '91000000-0000-0000-0000-000000000046',
    p_pending_action_id => (select command_id from admin_action_test_results where action = 'enable_flag'),
    p_runtime_environment => 'ci'
  ) ->> 'status'),
  'APPLIED',
  'a distinct founder confirms the same approved mock artifact and environment'
);
select ok(
  (select enabled and governance_version = 2
    from unimind_private.system_feature_flags
    where id = '73000000-0000-0000-0000-000000000001'),
  'the mock artifact enablement increments its governed version'
);
select is(
  (public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'DISABLE_FLAG',
    p_target_id => '73000000-0000-0000-0000-000000000001',
    p_expected_version => 2,
    p_expected_state => 'ENABLED',
    p_reason => 'Disable this artifact while its behavior is reviewed.',
    p_correlation_id => '90000000-0000-0000-0000-000000000047',
    p_idempotency_key => '91000000-0000-0000-0000-000000000047',
    p_runtime_environment => 'ci'
  ) ->> 'status'),
  'APPLIED',
  'mock-artifact disable remains an immediate containment action'
);
select ok(
  (select not enabled and governance_version = 3
    from unimind_private.system_feature_flags
    where id = '73000000-0000-0000-0000-000000000001'),
  'disabling the artifact records its next governed version'
);

select throws_ok(
  $$select public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'PUBLISH_UNIT',
    p_target_id => '20000000-0000-0000-0000-000000000009',
    p_expected_version => 1,
    p_expected_state => 'DRAFT',
    p_reason => 'Attempt to publish a unit without a ready source.',
    p_correlation_id => '90000000-0000-0000-0000-000000000048',
    p_idempotency_key => '91000000-0000-0000-0000-000000000048',
    p_runtime_environment => 'ci'
  )$$,
  'P0001', 'ADMIN_ACTION:READINESS_BLOCKED',
  'publication rejects a unit with no active READY, rights-valid matching source'
);
select is(
  (select publication_status from public.curriculum_units
    where id = '20000000-0000-0000-0000-000000000009'),
  'DRAFT',
  'a failed readiness check commits no unit transition'
);
select throws_ok(
  $$select public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'ENABLE_FLAG',
    p_target_id => '73000000-0000-0000-0000-000000000001',
    p_expected_version => 2,
    p_expected_state => 'DISABLED',
    p_reason => 'Check stale governed versions fail closed.',
    p_correlation_id => '90000000-0000-0000-0000-000000000049',
    p_idempotency_key => '91000000-0000-0000-0000-000000000049',
    p_runtime_environment => 'ci'
  )$$,
  'P0001', 'ADMIN_ACTION:STALE_VERSION',
  'a stale version cannot re-enable even the synthetic artifact'
);
select throws_ok(
  $$select public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000002',
    p_action => 'DISABLE_FLAG',
    p_target_id => '73000000-0000-0000-0000-000000000001',
    p_expected_version => 3,
    p_expected_state => 'DISABLED',
    p_reason => 'A non-admin must not change synthetic flags.',
    p_correlation_id => '90000000-0000-0000-0000-000000000050',
    p_idempotency_key => '91000000-0000-0000-0000-000000000050',
    p_runtime_environment => 'ci'
  )$$,
  '42501', 'ADMIN_ACTION:FORBIDDEN',
  'a non-admin cannot invoke a transition through the service-only seam'
);
select is(
  (select count(*) from public.cohort_memberships),
  2::bigint,
  'publishing and unlocking do not create preview or student membership'
);
select is(
  (select count(*) from unimind_private.admin_action_commands),
  17::bigint,
  'each accepted transition, confirmation, retry request, and replay record has a durable command'
);

insert into admin_action_test_results (action, command_id, result)
select 'stale_approval', (response ->> 'commandId')::uuid, response
from (
  select public.submit_admin_governance_action(
    p_actor_id => '10000000-0000-0000-0000-000000000001',
    p_action => 'ENABLE_FLAG',
    p_target_id => '73000000-0000-0000-0000-000000000001',
    p_expected_version => 3,
    p_expected_state => 'DISABLED',
    p_reason => 'Review exact synthetic dependency state before enablement.',
    p_correlation_id => '90000000-0000-0000-0000-000000000051',
    p_idempotency_key => '91000000-0000-0000-0000-000000000051',
    p_runtime_environment => 'ci'
  ) as response
) as submitted;
select is(
  (select result ->> 'status' from admin_action_test_results where action = 'stale_approval'),
  'PENDING_SECOND_CONFIRMATION',
  'an approved mock flag can await a second exact-candidate confirmation'
);

reset role;
update unimind_private.system_feature_flags
set config_json = config_json || '{"review_revision":"second"}'::jsonb
where id = '73000000-0000-0000-0000-000000000001';
set local role service_role;

select throws_ok(
  format(
    $$select public.submit_admin_governance_action(
      p_actor_id => '10000000-0000-0000-0000-000000000004',
      p_action => 'ENABLE_FLAG',
      p_target_id => '73000000-0000-0000-0000-000000000001',
      p_expected_version => 3,
      p_expected_state => 'DISABLED',
      p_reason => 'Review exact synthetic dependency state before enablement.',
      p_correlation_id => '90000000-0000-0000-0000-000000000051',
      p_idempotency_key => '91000000-0000-0000-0000-000000000052',
      p_pending_action_id => %L,
      p_runtime_environment => 'ci'
    )$$,
    (select command_id from admin_action_test_results where action = 'stale_approval')
  ),
  'P0001', 'ADMIN_ACTION:STALE_VERSION',
  'a prerequisite row revision invalidates the first founder approval'
);
select ok(
  exists (
    select 1 from public.current_admin_action_queue(
      '10000000-0000-0000-0000-000000000001', 'ci'
    ) where action = 'ENABLE_FLAG'
      and target_id = '73000000-0000-0000-0000-000000000001'
      and pending_action_id is null
  ),
  'the fresh candidate is available when an older pending approval becomes stale'
);

select * from finish();
rollback;
