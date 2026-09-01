-- Matrix test IDs exercised below:
-- RLS-T04-ANON-DENY, RLS-T04-GRANT-META, RLS-T04-POLICY-META,
-- RLS-T04-FUNCTION-GRANTS, RLS-T04-CROSS-USER, RLS-T04-CROSS-SCOPE,
-- RLS-T04-BATCH-LEADER, RLS-T04-REVOCATION, RLS-T04-SERVER-ONLY.
begin;
select plan(121);

set local unimind.actor_id = '10000000-0000-0000-0000-000000000001';
set local unimind.audit_reason = 'WP02-T04 synthetic actor/action/resource matrix';
set local unimind.correlation_id = '90000000-0000-0000-0000-000000000004';

create temporary table reviewed_public_relations (
  relation_name text primary key,
  relation_kind text not null
) on commit drop;

insert into reviewed_public_relations (relation_name, relation_kind)
values
  ('profiles', 'r'),
  ('user_roles', 'r'),
  ('terms_versions', 'r'),
  ('terms_acceptances', 'r'),
  ('education_stages', 'r'),
  ('institutions', 'r'),
  ('programs', 'r'),
  ('academic_levels', 'r'),
  ('terms', 'r'),
  ('cohorts', 'r'),
  ('curriculum_units', 'r'),
  ('cohort_memberships', 'r'),
  ('cohort_releases', 'r'),
  ('curriculum_unit_publication_events', 'r'),
  ('collection_campaigns', 'r'),
  ('campaign_curriculum_units', 'r'),
  ('batch_leader_assignments', 'r'),
  ('requested_material_items', 'r'),
  ('source_submissions', 'r'),
  ('source_assets', 'r'),
  ('source_versions', 'r'),
  ('chat_sessions', 'r'),
  ('chat_messages', 'r'),
  ('chat_answers', 'r'),
  ('answer_evidence', 'r'),
  ('feedback_reports', 'r'),
  ('studio_requests', 'r'),
  ('studio_artifacts', 'r'),
  ('artifact_evidence', 'r'),
  ('artifact_validation_results', 'r'),
  ('quiz_attempts', 'r'),
  ('quiz_responses', 'r');

create temporary table reviewed_public_functions (
  function_signature text primary key
) on commit drop;

insert into reviewed_public_functions (function_signature)
values
  ('available_curriculum_units()'),
  ('is_admin()'),
  ('has_active_membership(uuid)'),
  ('has_campaign_assignment(uuid)'),
  ('can_access_unit(uuid)');

create temporary table reviewed_private_functions (
  function_name text primary key
) on commit drop;

insert into reviewed_private_functions (function_name)
values
  ('append_governance_audit'),
  ('assert_valid_transition'),
  ('can_read_source_asset'),
  ('can_user_access_unit'),
  ('claim_processing_job'),
  ('create_profile_for_auth_user'),
  ('enforce_incident_transition'),
  ('enforce_raw_object_transition'),
  ('enforce_source_segment_update'),
  ('enforce_source_version_update'),
  ('is_valid_transition'),
  ('reject_row_mutation'),
  ('reserve_usage'),
  ('retrieve_authorized_segments'),
  ('settle_usage'),
  ('validate_answer_evidence_scope'),
  ('validate_artifact_evidence_scope'),
  ('validate_artifact_finalization'),
  ('validate_embedding_dimensions'),
  ('validate_final_answer');

create temporary table reviewed_policies (
  table_name text not null,
  policy_name text not null,
  command text not null,
  primary key (table_name, policy_name)
) on commit drop;

insert into reviewed_policies (table_name, policy_name, command)
values
  ('profiles', 'profiles_select_own', 'SELECT'),
  ('profiles', 'profiles_update_own', 'UPDATE'),
  ('user_roles', 'user_roles_select_own', 'SELECT'),
  ('terms_versions', 'terms_versions_select_active', 'SELECT'),
  ('terms_acceptances', 'terms_acceptances_select_own', 'SELECT'),
  ('terms_acceptances', 'terms_acceptances_insert_own_active', 'INSERT'),
  ('education_stages', 'education_stages_select_active', 'SELECT'),
  ('institutions', 'institutions_select_active', 'SELECT'),
  ('programs', 'programs_select_active', 'SELECT'),
  ('academic_levels', 'academic_levels_select_active', 'SELECT'),
  ('terms', 'terms_select_active', 'SELECT'),
  ('cohorts', 'cohorts_select_member_or_admin', 'SELECT'),
  ('curriculum_units', 'curriculum_units_select_member_or_admin', 'SELECT'),
  ('cohort_memberships', 'cohort_memberships_select_own', 'SELECT'),
  ('cohort_releases', 'cohort_releases_select_member_or_admin', 'SELECT'),
  ('collection_campaigns', 'collection_campaigns_select_assigned_or_admin', 'SELECT'),
  ('campaign_curriculum_units', 'campaign_curriculum_units_select_assigned_or_admin', 'SELECT'),
  ('batch_leader_assignments', 'batch_leader_assignments_select_own_or_admin', 'SELECT'),
  ('requested_material_items', 'requested_material_items_select_assigned_or_admin', 'SELECT'),
  ('source_submissions', 'source_submissions_select_own_or_admin', 'SELECT'),
  ('source_submissions', 'source_submissions_insert_assigned', 'INSERT'),
  ('source_assets', 'source_assets_select_available_scope', 'SELECT'),
  ('source_versions', 'source_versions_select_available_scope', 'SELECT'),
  ('chat_sessions', 'chat_sessions_select_own', 'SELECT'),
  ('chat_sessions', 'chat_sessions_insert_own_available', 'INSERT'),
  ('chat_messages', 'chat_messages_select_own_session', 'SELECT'),
  ('chat_messages', 'chat_messages_insert_user_message', 'INSERT'),
  ('chat_answers', 'chat_answers_select_own_session', 'SELECT'),
  ('answer_evidence', 'answer_evidence_select_own_answer', 'SELECT'),
  ('feedback_reports', 'feedback_reports_select_own', 'SELECT'),
  ('feedback_reports', 'feedback_reports_insert_own', 'INSERT'),
  ('studio_requests', 'studio_requests_select_own', 'SELECT'),
  ('studio_requests', 'studio_requests_insert_own_available', 'INSERT'),
  ('studio_artifacts', 'studio_artifacts_select_own_request', 'SELECT'),
  ('artifact_evidence', 'artifact_evidence_select_own_artifact', 'SELECT'),
  ('artifact_validation_results', 'artifact_validation_select_own_artifact', 'SELECT'),
  ('quiz_attempts', 'quiz_attempts_select_own', 'SELECT'),
  ('quiz_attempts', 'quiz_attempts_insert_own_artifact', 'INSERT'),
  ('quiz_attempts', 'quiz_attempts_update_own', 'UPDATE'),
  ('quiz_responses', 'quiz_responses_select_own_attempt', 'SELECT'),
  ('quiz_responses', 'quiz_responses_insert_own_attempt', 'INSERT'),
  ('quiz_responses', 'quiz_responses_update_own_attempt', 'UPDATE');

create temporary table reviewed_authenticated_table_grants (
  table_name text not null,
  privilege_type text not null,
  primary key (table_name, privilege_type)
) on commit drop;

insert into reviewed_authenticated_table_grants (table_name, privilege_type)
values
  ('profiles', 'SELECT'),
  ('user_roles', 'SELECT'),
  ('terms_versions', 'SELECT'),
  ('terms_acceptances', 'SELECT'),
  ('terms_acceptances', 'INSERT'),
  ('education_stages', 'SELECT'),
  ('institutions', 'SELECT'),
  ('programs', 'SELECT'),
  ('academic_levels', 'SELECT'),
  ('terms', 'SELECT'),
  ('cohorts', 'SELECT'),
  ('curriculum_units', 'SELECT'),
  ('cohort_memberships', 'SELECT'),
  ('cohort_releases', 'SELECT'),
  ('collection_campaigns', 'SELECT'),
  ('campaign_curriculum_units', 'SELECT'),
  ('batch_leader_assignments', 'SELECT'),
  ('requested_material_items', 'SELECT'),
  ('source_submissions', 'SELECT'),
  ('source_submissions', 'INSERT'),
  ('source_assets', 'SELECT'),
  ('source_versions', 'SELECT'),
  ('chat_sessions', 'SELECT'),
  ('chat_sessions', 'INSERT'),
  ('chat_messages', 'SELECT'),
  ('chat_messages', 'INSERT'),
  ('chat_answers', 'SELECT'),
  ('answer_evidence', 'SELECT'),
  ('feedback_reports', 'SELECT'),
  ('feedback_reports', 'INSERT'),
  ('studio_requests', 'SELECT'),
  ('studio_requests', 'INSERT'),
  ('studio_artifacts', 'SELECT'),
  ('artifact_evidence', 'SELECT'),
  ('artifact_validation_results', 'SELECT'),
  ('quiz_attempts', 'SELECT'),
  ('quiz_attempts', 'INSERT'),
  ('quiz_responses', 'SELECT'),
  ('quiz_responses', 'INSERT');

create temporary table reviewed_authenticated_column_grants (
  table_name text not null,
  column_name text not null,
  privilege_type text not null,
  primary key (table_name, column_name, privilege_type)
) on commit drop;

insert into reviewed_authenticated_column_grants (
  table_name, column_name, privilege_type
)
values
  ('profiles', 'display_name', 'UPDATE'),
  ('profiles', 'preferred_language', 'UPDATE'),
  ('profiles', 'chat_retention_mode', 'UPDATE'),
  ('profiles', 'updated_at', 'UPDATE'),
  ('quiz_attempts', 'submitted_at', 'UPDATE'),
  ('quiz_responses', 'selected_option', 'UPDATE'),
  ('quiz_responses', 'answered_at', 'UPDATE');

select is(
  (
    select count(*)
    from (
      (
        select relations.relname, relations.relkind::text
        from pg_catalog.pg_class as relations
        join pg_catalog.pg_namespace as namespaces
          on namespaces.oid = relations.relnamespace
        where namespaces.nspname = 'public'
          and relations.relkind in ('r', 'p', 'v', 'm', 'f')
        except
        select relation_name, relation_kind from reviewed_public_relations
      )
      union all
      (
        select relation_name, relation_kind from reviewed_public_relations
        except
        select relations.relname, relations.relkind::text
        from pg_catalog.pg_class as relations
        join pg_catalog.pg_namespace as namespaces
          on namespaces.oid = relations.relnamespace
        where namespaces.nspname = 'public'
          and relations.relkind in ('r', 'p', 'v', 'm', 'f')
      )
    ) as mismatches
  ),
  0::bigint,
  'pg_class contains exactly the reviewed public tables and views'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_class as relations
    join pg_catalog.pg_namespace as namespaces
      on namespaces.oid = relations.relnamespace
    where namespaces.nspname = 'public'
      and relations.relkind in ('r', 'p')
      and not relations.relrowsecurity
  ),
  0::bigint,
  'every reviewed public table has row-level security enabled'
);

select is(
  (
    select count(*)
    from (
      (
        select
          procedures.proname || '(' || pg_catalog.oidvectortypes(procedures.proargtypes) || ')'
        from pg_catalog.pg_proc as procedures
        join pg_catalog.pg_namespace as namespaces
          on namespaces.oid = procedures.pronamespace
        where namespaces.nspname = 'public' and procedures.prokind = 'f'
        except
        select function_signature from reviewed_public_functions
      )
      union all
      (
        select function_signature from reviewed_public_functions
        except
        select
          procedures.proname || '(' || pg_catalog.oidvectortypes(procedures.proargtypes) || ')'
        from pg_catalog.pg_proc as procedures
        join pg_catalog.pg_namespace as namespaces
          on namespaces.oid = procedures.pronamespace
        where namespaces.nspname = 'public' and procedures.prokind = 'f'
      )
    ) as mismatches
  ),
  0::bigint,
  'every public function is explicitly reviewed'
);

select is(
  (
    select count(*)
    from (
      (
        select procedures.proname
        from pg_catalog.pg_proc as procedures
        join pg_catalog.pg_namespace as namespaces
          on namespaces.oid = procedures.pronamespace
        where namespaces.nspname = 'unimind_private'
          and procedures.prokind = 'f'
        except
        select function_name from reviewed_private_functions
      )
      union all
      (
        select function_name from reviewed_private_functions
        except
        select procedures.proname
        from pg_catalog.pg_proc as procedures
        join pg_catalog.pg_namespace as namespaces
          on namespaces.oid = procedures.pronamespace
        where namespaces.nspname = 'unimind_private'
          and procedures.prokind = 'f'
      )
    ) as mismatches
  ),
  0::bigint,
  'every private function is explicitly reviewed'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_namespace as namespaces
      on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'unimind_private'
      and procedures.prokind = 'f'
  ),
  (select count(*) from reviewed_private_functions),
  'private function overload count matches the reviewed inventory'
);

select is(
  (
    select count(*)
    from (
      (
        select tablename, policyname, cmd
        from pg_catalog.pg_policies
        where schemaname = 'public'
        except
        select table_name, policy_name, command from reviewed_policies
      )
      union all
      (
        select table_name, policy_name, command from reviewed_policies
        except
        select tablename, policyname, cmd
        from pg_catalog.pg_policies
        where schemaname = 'public'
      )
    ) as mismatches
  ),
  0::bigint,
  'pg_policies contains exactly the reviewed policy inventory'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and roles <> array['authenticated']::name[]
  ),
  0::bigint,
  'every public policy is scoped to authenticated callers'
);

select is(
  (
    select count(*)
    from information_schema.table_privileges
    where grantee = 'anon'
      and table_schema in ('public', 'unimind_private')
  ),
  0::bigint,
  'information_schema reports no anonymous table grant'
);

select is(
  (
    select count(*)
    from information_schema.routine_privileges
    where grantee in ('anon', 'PUBLIC')
      and routine_schema in ('public', 'unimind_private')
  ),
  0::bigint,
  'information_schema reports no anonymous or PUBLIC function execution grant'
);

select is(
  (
    select count(*)
    from (
      (
        select table_name, privilege_type
        from information_schema.table_privileges
        where grantee = 'authenticated' and table_schema = 'public'
        except
        select table_name, privilege_type
        from reviewed_authenticated_table_grants
      )
      union all
      (
        select table_name, privilege_type
        from reviewed_authenticated_table_grants
        except
        select table_name, privilege_type
        from information_schema.table_privileges
        where grantee = 'authenticated' and table_schema = 'public'
      )
    ) as mismatches
  ),
  0::bigint,
  'authenticated table grants match the reviewed least-privilege inventory'
);

select is(
  (
    select count(*)
    from (
      (
        select
          relations.relname::text as table_name,
          attributes.attname::text as column_name,
          privileges.privilege_type
        from pg_catalog.pg_attribute as attributes
        join pg_catalog.pg_class as relations
          on relations.oid = attributes.attrelid
        join pg_catalog.pg_namespace as namespaces
          on namespaces.oid = relations.relnamespace
        cross join lateral pg_catalog.aclexplode(attributes.attacl) as privileges
        join pg_catalog.pg_roles as grantees
          on grantees.oid = privileges.grantee
        where grantees.rolname = 'authenticated'
          and namespaces.nspname = 'public'
          and attributes.attnum > 0
          and not attributes.attisdropped
          and privileges.privilege_type in ('INSERT', 'UPDATE', 'REFERENCES')
        except
        select table_name, column_name, privilege_type
        from reviewed_authenticated_column_grants
      )
      union all
      (
        select table_name, column_name, privilege_type
        from reviewed_authenticated_column_grants
        except
        select
          relations.relname::text as table_name,
          attributes.attname::text as column_name,
          privileges.privilege_type
        from pg_catalog.pg_attribute as attributes
        join pg_catalog.pg_class as relations
          on relations.oid = attributes.attrelid
        join pg_catalog.pg_namespace as namespaces
          on namespaces.oid = relations.relnamespace
        cross join lateral pg_catalog.aclexplode(attributes.attacl) as privileges
        join pg_catalog.pg_roles as grantees
          on grantees.oid = privileges.grantee
        where grantees.rolname = 'authenticated'
          and namespaces.nspname = 'public'
          and attributes.attnum > 0
          and not attributes.attisdropped
          and privileges.privilege_type in ('INSERT', 'UPDATE', 'REFERENCES')
      )
    ) as mismatches
  ),
  0::bigint,
  'authenticated column mutation grants match the reviewed allowlist'
);

select is(
  (
    select count(*)
    from (
      (
        select routine_name
        from information_schema.routine_privileges
        where grantee = 'authenticated'
          and routine_schema = 'public'
          and privilege_type = 'EXECUTE'
        except
        select split_part(function_signature, '(', 1)
        from reviewed_public_functions
      )
      union all
      (
        select split_part(function_signature, '(', 1)
        from reviewed_public_functions
        except
        select routine_name
        from information_schema.routine_privileges
        where grantee = 'authenticated'
          and routine_schema = 'public'
          and privilege_type = 'EXECUTE'
      )
    ) as mismatches
  ),
  0::bigint,
  'authenticated routine privileges match the reviewed caller-scoped functions'
);

select is(
  (
    select count(*)
    from information_schema.routine_privileges
    where grantee = 'authenticated'
      and routine_schema = 'unimind_private'
      and (
        routine_name <> 'can_read_source_asset'
        or privilege_type <> 'EXECUTE'
      )
  ),
  0::bigint,
  'authenticated has only the reviewed private helper execution grant'
);

select is(
  (
    select count(*)
    from information_schema.routine_privileges
    where grantee = 'authenticated'
      and routine_schema = 'unimind_private'
      and routine_name = 'can_read_source_asset'
      and privilege_type = 'EXECUTE'
  ),
  1::bigint,
  'authenticated receives the one private execution grant required by RLS'
);

select ok(
  not has_schema_privilege('authenticated', 'unimind_private', 'USAGE'),
  'authenticated callers cannot reach the server-only schema'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and cmd = 'UPDATE'
      and (qual is null or with_check is null)
  ),
  0::bigint,
  'every UPDATE policy has both USING and WITH CHECK'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_policies as update_policies
    where update_policies.schemaname = 'public'
      and update_policies.cmd = 'UPDATE'
      and not exists (
        select 1
        from pg_catalog.pg_policies as select_policies
        where select_policies.schemaname = update_policies.schemaname
          and select_policies.tablename = update_policies.tablename
          and select_policies.cmd = 'SELECT'
      )
  ),
  0::bigint,
  'every UPDATE policy has a SELECT policy for row visibility'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and (
        coalesce(qual, '') || coalesce(with_check, '')
      ) ~* '(auth[.]role|auth[.]jwt|app_metadata|user_metadata|request[.]jwt)'
  ),
  0::bigint,
  'RLS predicates never trust mutable JWT metadata or auth.role()'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_namespace as namespaces
      on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'public'
      and procedures.proname in (
        'is_admin',
        'has_active_membership',
        'has_campaign_assignment',
        'can_access_unit'
      )
      and (
        procedures.provolatile <> 's'
        or procedures.prosecdef
        or array_to_string(procedures.proconfig, ',') not like '%search_path=""%'
        or pg_catalog.pg_get_functiondef(procedures.oid) !~* 'auth[.]uid[(][)]'
        or pg_catalog.pg_get_functiondef(procedures.oid)
          ~* '(auth[.]role|auth[.]jwt|app_metadata|user_metadata|request[.]jwt)'
      )
  ),
  0::bigint,
  'authorization helpers are stable invokers using auth.uid() and authoritative rows'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_proc as procedures
    join pg_catalog.pg_namespace as namespaces
      on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'unimind_private'
      and procedures.proname = 'can_read_source_asset'
      and (
        procedures.provolatile <> 's'
        or not procedures.prosecdef
        or array_to_string(procedures.proconfig, ',') not like '%search_path=""%'
        or pg_catalog.pg_get_functiondef(procedures.oid) !~* 'auth[.]uid[(][)]'
        or pg_catalog.pg_get_functiondef(procedures.oid)
          ~* '(auth[.]role|auth[.]jwt|app_metadata|user_metadata|request[.]jwt)'
      )
  ),
  0::bigint,
  'source availability helper is stable and authoritative with an empty search path'
);

update public.profiles
set display_name = case user_id
  when '10000000-0000-0000-0000-000000000001' then 'Synthetic Admin'
  when '10000000-0000-0000-0000-000000000002' then 'Synthetic Student A'
  when '10000000-0000-0000-0000-000000000003' then 'Synthetic Student B'
end,
updated_at = transaction_timestamp()
where user_id in (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003'
);

insert into public.cohorts (
  id, term_id, code, name, curriculum_edition, starts_at, ends_at, status
)
values (
  '20000000-0000-0000-0000-000000000009',
  '20000000-0000-0000-0000-000000000005',
  'COHORT_LOCKED', 'Synthetic Locked Cohort', 'synthetic-edition-locked',
  transaction_timestamp() - interval '30 days',
  transaction_timestamp() + interval '180 days', 'ACTIVE'
);

insert into public.curriculum_units (
  id, cohort_id, code, unit_type, title_en, title_ar, sort_order,
  publication_status, published_at, published_by
)
values
  (
    '20000000-0000-0000-0000-000000000010',
    '20000000-0000-0000-0000-000000000009',
    'LOCKED_UNIT', 'MODULE', 'Synthetic Locked Unit', 'وحدة مغلقة تجريبية', 1,
    'PUBLISHED', transaction_timestamp() - interval '1 day',
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000011',
    '20000000-0000-0000-0000-000000000006',
    'UNIT_WITH_REVOKED_SOURCE', 'MODULE',
    'Synthetic Unit With Revoked Source', 'وحدة بمصدر مسحوب', 3,
    'PUBLISHED', transaction_timestamp() - interval '1 day',
    '10000000-0000-0000-0000-000000000001'
  );

insert into public.cohort_memberships (
  id, user_id, cohort_id, status, starts_at, ends_at, granted_by, grant_reason
)
values (
  '21000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000009',
  'ACTIVE', transaction_timestamp() - interval '1 day',
  transaction_timestamp() + interval '30 days',
  '10000000-0000-0000-0000-000000000001',
  'Synthetic locked-cohort membership'
);

insert into public.cohort_releases (
  id, cohort_id, release_status, changed_by, reason
)
values (
  '22000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000009',
  'LOCKED', '10000000-0000-0000-0000-000000000001',
  'Synthetic locked-cohort boundary'
);

insert into public.collection_campaigns (
  id, cohort_id, name, status, opens_at, closes_at, created_by
)
values (
  '30000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000009',
  'Synthetic Other Campaign', 'OPEN',
  transaction_timestamp() - interval '1 day',
  transaction_timestamp() + interval '7 days',
  '10000000-0000-0000-0000-000000000001'
);

insert into public.campaign_curriculum_units (
  id, campaign_id, curriculum_unit_id, cohort_id
)
values (
  '30000000-0000-0000-0000-000000000005',
  '30000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000010',
  '20000000-0000-0000-0000-000000000009'
);

insert into public.requested_material_items (
  id, campaign_id, curriculum_unit_id, title, expected_type
)
values
  (
    '33000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000007',
    'Synthetic Assigned Material', 'DOCUMENT'
  ),
  (
    '33000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000010',
    'Synthetic Other Material', 'DOCUMENT'
  );

insert into public.source_submissions (
  id, campaign_id, curriculum_unit_id, cohort_id, submitted_by,
  client_idempotency_key, source_name, declared_format, declared_rights,
  status
)
values (
  '32000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000011',
  '20000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000002',
  'synthetic-revoked-source', 'Synthetic Revoked Source',
  'application/pdf', 'DECLARED', 'ACCEPTED'
);

insert into public.source_assets (
  id, cohort_id, curriculum_unit_id, canonical_title, source_kind
)
values (
  '40000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000011',
  'Synthetic Asset With Revoked Source', 'BOOK'
);

insert into public.source_versions (
  id, source_asset_id, version_number, submission_id, checksum, mime_type,
  byte_size, page_count, language_profile, curriculum_edition,
  rights_status, rights_valid_from, processing_status, activation_status
)
values (
  '41000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000003', 1,
  '32000000-0000-0000-0000-000000000003',
  'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  'application/pdf', 512, 1, 'EN', 'synthetic-edition-2026',
  'REVOKED', transaction_timestamp() - interval '1 day',
  'FAILED', 'INACTIVE'
);

insert into public.chat_sessions (
  id, user_id, cohort_id, curriculum_unit_id, language_mode, retention_mode
)
values
  (
    '81000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007', 'EN', 'MINIMAL'
  ),
  (
    '81000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007', 'EN', 'MINIMAL'
  );

insert into public.chat_messages (id, session_id, role, content)
values
  (
    '81100000-0000-0000-0000-000000000001',
    '81000000-0000-0000-0000-000000000001',
    'USER', 'Synthetic Student A private message'
  ),
  (
    '81100000-0000-0000-0000-000000000002',
    '81000000-0000-0000-0000-000000000002',
    'USER', 'Synthetic Student B private message'
  );

insert into public.studio_requests (
  id, user_id, cohort_id, curriculum_unit_id, artifact_type, language,
  parameters_json, source_scope_hash, state, idempotency_key
)
values
  (
    '82000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007', 'MCQ_QUIZ', 'EN',
    '{}',
    'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'SUCCEEDED', 'synthetic-studio-student-a'
  ),
  (
    '82000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000007', 'MCQ_QUIZ', 'EN',
    '{}',
    'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'SUCCEEDED', 'synthetic-studio-student-b'
  );

insert into public.studio_artifacts (
  id, studio_request_id, artifact_type, content_json, validation_status,
  policy_version, model_version, artifact_hash
)
values
  (
    '82100000-0000-0000-0000-000000000001',
    '82000000-0000-0000-0000-000000000001', 'MCQ_QUIZ',
    '{"items":[{"key":"a-1","prompt":"Synthetic A question"}]}',
    'PENDING', 'synthetic-policy', 'mock-model',
    'sha256:1111111111111111111111111111111111111111111111111111111111111111'
  ),
  (
    '82100000-0000-0000-0000-000000000002',
    '82000000-0000-0000-0000-000000000002', 'MCQ_QUIZ',
    '{"items":[{"key":"b-1","prompt":"Synthetic B question"}]}',
    'PENDING', 'synthetic-policy', 'mock-model',
    'sha256:2222222222222222222222222222222222222222222222222222222222222222'
  );

insert into public.artifact_evidence (
  id, artifact_id, source_segment_id, usage_type
)
values
  (
    '82200000-0000-0000-0000-000000000001',
    '82100000-0000-0000-0000-000000000001',
    '62000000-0000-0000-0000-000000000001', 'SUPPORT'
  ),
  (
    '82200000-0000-0000-0000-000000000002',
    '82100000-0000-0000-0000-000000000002',
    '62000000-0000-0000-0000-000000000001', 'SUPPORT'
  );

insert into public.artifact_validation_results (
  id, artifact_id, validator_version, result
)
values
  (
    '82300000-0000-0000-0000-000000000001',
    '82100000-0000-0000-0000-000000000001', 'synthetic-validator', 'PASS'
  ),
  (
    '82300000-0000-0000-0000-000000000002',
    '82100000-0000-0000-0000-000000000002', 'synthetic-validator', 'PASS'
  );

update public.studio_artifacts
set validation_status = 'PASSED', published_at = transaction_timestamp()
where id in (
  '82100000-0000-0000-0000-000000000001',
  '82100000-0000-0000-0000-000000000002'
);

insert into public.quiz_attempts (
  id, user_id, artifact_id, mode, client_idempotency_key
)
values
  (
    '82400000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '82100000-0000-0000-0000-000000000001',
    'PRACTICE', 'synthetic-attempt-student-a'
  ),
  (
    '82400000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003',
    '82100000-0000-0000-0000-000000000002',
    'PRACTICE', 'synthetic-attempt-student-b'
  );

insert into unimind_private.usage_ledger (
  id, user_id, event_type, units, related_entity_type, related_entity_id,
  idempotency_key
)
values
  (
    '83000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'SETTLED', 5, 'CHAT_SESSION',
    '81000000-0000-0000-0000-000000000001', 'synthetic-ledger-student-a'
  ),
  (
    '83000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003',
    'SETTLED', 7, 'CHAT_SESSION',
    '81000000-0000-0000-0000-000000000002', 'synthetic-ledger-student-b'
  );

set local role anon;
select throws_ok(
  $$select count(*) from public.profiles$$,
  '42501', null,
  'anon cannot read public profile rows'
);
select throws_ok(
  $$insert into public.feedback_reports (
      reporter_id, entity_type, entity_id, category, description
    ) values (
      '10000000-0000-0000-0000-000000000002', 'CURRICULUM_UNIT',
      '20000000-0000-0000-0000-000000000007', 'OTHER',
      'Synthetic anonymous create denial'
    )$$,
  '42501', null,
  'anon cannot create public resource rows'
);
select throws_ok(
  $$update public.profiles set display_name = 'Anonymous mutation'$$,
  '42501', null,
  'anon cannot update public resource rows'
);
select throws_ok(
  $$delete from public.profiles where user_id = '10000000-0000-0000-0000-000000000002'$$,
  '42501', null,
  'anon cannot delete public resource rows'
);
reset role;

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","app_metadata":{"role":"STUDENT"},"user_metadata":{"role":"ADMIN"}}';

select is(
  (select auth.uid()),
  '10000000-0000-0000-0000-000000000002'::uuid,
  'Student A authorization is scoped by auth.uid()'
);
select is(public.is_admin(), false, 'mutable metadata cannot promote Student A to admin');
select is((select count(*) from public.profiles), 1::bigint, 'Student A reads exactly one profile');
select is(
  (select display_name from public.profiles),
  'Synthetic Student A',
  'Student A reads the expected own-profile content'
);
select is(
  (
    select count(*) from public.profiles
    where user_id = '10000000-0000-0000-0000-000000000003'
  ),
  0::bigint,
  'Student A cannot read Student B profile'
);
select is(
  (select count(*) from public.chat_sessions),
  1::bigint,
  'Student A reads exactly one pre-existing own chat session'
);
select is(
  (select content from public.chat_messages),
  'Synthetic Student A private message',
  'Student A reads own chat content rather than Student B content'
);
select is(
  (
    select count(*) from public.chat_sessions
    where id = '81000000-0000-0000-0000-000000000002'
  ),
  0::bigint,
  'Student A cannot read Student B chat session'
);
select is(
  (select count(*) from public.studio_artifacts),
  1::bigint,
  'Student A reads exactly one own published artifact'
);
select is(
  (select id from public.studio_artifacts),
  '82100000-0000-0000-0000-000000000001'::uuid,
  'Student A receives the expected own artifact'
);
select is(
  (
    select count(*) from public.studio_artifacts
    where id = '82100000-0000-0000-0000-000000000002'
  ),
  0::bigint,
  'Student A cannot read Student B artifact'
);
select is(
  (select count(*) from public.quiz_attempts),
  1::bigint,
  'Student A reads exactly one own quiz attempt'
);
select is(
  (select id from public.quiz_attempts),
  '82400000-0000-0000-0000-000000000001'::uuid,
  'Student A receives the expected own quiz attempt'
);
select throws_ok(
  $$select count(*) from unimind_private.usage_ledger$$,
  '42501', null,
  'Student A cannot query the server-only usage ledger directly'
);
insert into public.chat_sessions (
  id, user_id, cohort_id, curriculum_unit_id, language_mode, retention_mode
)
values (
  '81000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000007', 'MIXED', 'MINIMAL'
);
select is(
  (
    select count(*) from public.chat_sessions
    where id = '81000000-0000-0000-0000-000000000003'
  ),
  1::bigint,
  'Student A can create an own chat in an available unit'
);
select is(
  (
    select language_mode from public.chat_sessions
    where id = '81000000-0000-0000-0000-000000000003'
  ),
  'MIXED',
  'Student A reads back the created chat content'
);
select throws_ok(
  $$insert into public.chat_sessions (
      user_id, cohort_id, curriculum_unit_id, language_mode, retention_mode
    ) values (
      '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000007', 'EN', 'MINIMAL'
    )$$,
  '42501', null,
  'Student A cannot create a chat owned by Student B'
);
update public.profiles
set display_name = 'Synthetic Student A Updated',
    updated_at = transaction_timestamp()
where user_id = '10000000-0000-0000-0000-000000000002';
select is(
  (
    select count(*) from public.profiles
    where user_id = '10000000-0000-0000-0000-000000000002'
      and display_name = 'Synthetic Student A Updated'
  ),
  1::bigint,
  'Student A can update the reviewed columns on the own profile'
);
select is(
  (select display_name from public.profiles),
  'Synthetic Student A Updated',
  'Student A reads back the own-profile update'
);
update public.profiles
set display_name = 'Cross-user mutation',
    updated_at = transaction_timestamp()
where user_id = '10000000-0000-0000-0000-000000000003';
select is(
  (
    select count(*) from public.profiles
    where user_id = '10000000-0000-0000-0000-000000000003'
      and display_name = 'Cross-user mutation'
  ),
  0::bigint,
  'Student A update cannot move through Student B row scope'
);
select throws_ok(
  $$delete from public.chat_sessions where id = '81000000-0000-0000-0000-000000000003'$$,
  '42501', null,
  'Student A cannot delete own chat state directly'
);
select is(
  (
    select count(*) from public.cohorts
    where id = '20000000-0000-0000-0000-000000000006'
  ),
  1::bigint,
  'Student A reads the authorized unlocked cohort'
);
select is(
  (
    select count(*) from public.cohorts
    where id = '20000000-0000-0000-0000-000000000009'
  ),
  0::bigint,
  'Student A cannot read another cohort'
);
select is(
  (
    select count(*) from public.curriculum_units
    where id = '20000000-0000-0000-0000-000000000008'
  ),
  1::bigint,
  'Student A can read authorized unit metadata before publication'
);
select is(
  (
    select count(*) from public.source_assets
    where id = '40000000-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'Student A reads source metadata backed by a READY active valid version'
);
select is(
  (
    select canonical_title from public.source_assets
    where id = '40000000-0000-0000-0000-000000000001'
  ),
  'Synthetic Source A',
  'Student A receives the expected authorized source metadata'
);
select is(
  (
    select count(*) from public.source_assets
    where id = '40000000-0000-0000-0000-000000000003'
  ),
  0::bigint,
  'Student A cannot read an asset whose only version is revoked, failed, and inactive'
);
select is(
  (
    select count(*) from public.source_versions
    where id = '41000000-0000-0000-0000-000000000003'
  ),
  0::bigint,
  'Student A cannot read a revoked, failed, inactive source version'
);
select throws_ok(
  $$insert into public.chat_sessions (
      user_id, cohort_id, curriculum_unit_id, language_mode, retention_mode
    ) values (
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000009',
      '20000000-0000-0000-0000-000000000010', 'EN', 'MINIMAL'
    )$$,
  '42501', null,
  'Student A cannot create a chat across cohort scope'
);
select throws_ok(
  $$insert into public.chat_sessions (
      user_id, cohort_id, curriculum_unit_id, language_mode, retention_mode
    ) values (
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000010', 'EN', 'MINIMAL'
    )$$,
  '42501', null,
  'Student A cannot create a chat with a cross-cohort unit identifier'
);
reset role;

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated","app_metadata":{"role":"ADMIN"},"user_metadata":{"role":"ADMIN"}}';

select is(public.is_admin(), false, 'mutable metadata cannot promote Student B to admin');
select is((select count(*) from public.profiles), 1::bigint, 'Student B reads exactly one profile');
select is(
  (select display_name from public.profiles),
  'Synthetic Student B',
  'Student B receives the expected own profile'
);
select is(
  (
    select count(*) from public.profiles
    where user_id = '10000000-0000-0000-0000-000000000002'
  ),
  0::bigint,
  'Student B cannot read Student A profile'
);
select is(
  (
    select count(*) from public.cohorts
    where id = '20000000-0000-0000-0000-000000000009'
  ),
  1::bigint,
  'a member can read authorized cohort metadata while availability remains locked'
);
select is(
  (
    select count(*) from public.cohort_releases
    where cohort_id = '20000000-0000-0000-0000-000000000009'
  ),
  1::bigint,
  'a member can read the authorized cohort release state'
);
select is(
  (
    select count(*) from public.curriculum_units
    where cohort_id = '20000000-0000-0000-0000-000000000009'
  ),
  1::bigint,
  'a member can read authorized unit metadata while availability remains locked'
);
select is(
  (select count(*) from public.available_curriculum_units()),
  0::bigint,
  'a locked cohort yields no derived availability for Student B'
);
select is(
  (select content from public.chat_messages),
  'Synthetic Student B private message',
  'Student B reads own chat content only'
);
select is(
  (
    select count(*) from public.chat_sessions
    where id = '81000000-0000-0000-0000-000000000001'
  ),
  0::bigint,
  'Student B cannot read Student A chat session'
);
select is(
  (select id from public.studio_artifacts),
  '82100000-0000-0000-0000-000000000002'::uuid,
  'Student B receives the expected own artifact'
);
select is(
  (
    select count(*) from public.studio_artifacts
    where id = '82100000-0000-0000-0000-000000000001'
  ),
  0::bigint,
  'Student B cannot read Student A artifact'
);
select is(
  (select id from public.quiz_attempts),
  '82400000-0000-0000-0000-000000000002'::uuid,
  'Student B receives the expected own quiz attempt'
);
select is(
  (
    select count(*) from public.quiz_attempts
    where id = '82400000-0000-0000-0000-000000000001'
  ),
  0::bigint,
  'Student B cannot read Student A quiz attempt'
);
insert into public.feedback_reports (
  id, reporter_id, entity_type, entity_id, category, description
)
values (
  '84000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  'CURRICULUM_UNIT',
  '20000000-0000-0000-0000-000000000010',
  'OTHER', 'Synthetic Student B own feedback'
);
select is(
  (
    select count(*) from public.feedback_reports
    where id = '84000000-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'Student B can create own feedback'
);
select is(
  (
    select description from public.feedback_reports
    where id = '84000000-0000-0000-0000-000000000001'
  ),
  'Synthetic Student B own feedback',
  'Student B reads back the created own feedback'
);
select throws_ok(
  $$insert into public.feedback_reports (
      reporter_id, entity_type, entity_id, category, description
    ) values (
      '10000000-0000-0000-0000-000000000002', 'CURRICULUM_UNIT',
      '20000000-0000-0000-0000-000000000007', 'OTHER',
      'Synthetic cross-user feedback denial'
    )$$,
  '42501', null,
  'Student B cannot create feedback owned by Student A'
);
update public.profiles
set preferred_language = 'AR_EG', updated_at = transaction_timestamp()
where user_id = '10000000-0000-0000-0000-000000000003';
select is(
  (
    select count(*) from public.profiles
    where user_id = '10000000-0000-0000-0000-000000000003'
      and preferred_language = 'AR_EG'
  ),
  1::bigint,
  'Student B can update reviewed own-profile columns'
);
update public.profiles
set preferred_language = 'AR_EG', updated_at = transaction_timestamp()
where user_id = '10000000-0000-0000-0000-000000000002';
select is(
  (
    select count(*) from public.profiles
    where user_id = '10000000-0000-0000-0000-000000000002'
      and preferred_language = 'AR_EG'
  ),
  0::bigint,
  'Student B cannot update Student A profile'
);
select throws_ok(
  $$delete from public.feedback_reports where id = '84000000-0000-0000-0000-000000000001'$$,
  '42501', null,
  'Student B cannot delete own feedback directly'
);
reset role;

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","app_metadata":{"role":"BATCH_LEADER"}}';

select is(
  (
    select count(*) from public.collection_campaigns
    where id = '30000000-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'Batch Leader reads the assigned campaign'
);
select is(
  (
    select name from public.collection_campaigns
    where id = '30000000-0000-0000-0000-000000000001'
  ),
  'Synthetic collection campaign',
  'Batch Leader receives the expected assigned campaign content'
);
select is(
  (
    select count(*) from public.collection_campaigns
    where id = '30000000-0000-0000-0000-000000000004'
  ),
  0::bigint,
  'Batch Leader cannot read another campaign'
);
select is(
  (
    select count(*) from public.requested_material_items
    where id = '33000000-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'Batch Leader reads requested items in the assigned campaign'
);
select is(
  (
    select count(*) from public.requested_material_items
    where id = '33000000-0000-0000-0000-000000000002'
  ),
  0::bigint,
  'Batch Leader cannot read requested items from another campaign'
);
insert into public.source_submissions (
  id, campaign_id, curriculum_unit_id, cohort_id, submitted_by,
  client_idempotency_key, source_name, declared_format, declared_rights
)
values (
  '32000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000007',
  '20000000-0000-0000-0000-000000000006',
  '10000000-0000-0000-0000-000000000002',
  'synthetic-matrix-allow', 'Synthetic Matrix Allowed Source',
  'application/pdf', 'DECLARED'
);
select is(
  (
    select count(*) from public.source_submissions
    where id = '32000000-0000-0000-0000-000000000004'
  ),
  1::bigint,
  'Batch Leader can create a submission in the assigned campaign and unit'
);
select is(
  (
    select source_name from public.source_submissions
    where id = '32000000-0000-0000-0000-000000000004'
  ),
  'Synthetic Matrix Allowed Source',
  'Batch Leader reads back the allowed submission content'
);
select throws_ok(
  $$insert into public.source_submissions (
      campaign_id, curriculum_unit_id, cohort_id, submitted_by,
      client_idempotency_key, source_name, declared_format, declared_rights
    ) values (
      '30000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000011',
      '20000000-0000-0000-0000-000000000006',
      '10000000-0000-0000-0000-000000000002',
      'synthetic-cross-unit-deny', 'Synthetic Cross Unit Denial',
      'application/pdf', 'DECLARED'
    )$$,
  '42501', null,
  'Batch Leader cannot create a submission for an unassigned unit'
);
select throws_ok(
  $$insert into public.source_submissions (
      campaign_id, curriculum_unit_id, cohort_id, submitted_by,
      client_idempotency_key, source_name, declared_format, declared_rights
    ) values (
      '30000000-0000-0000-0000-000000000004',
      '20000000-0000-0000-0000-000000000010',
      '20000000-0000-0000-0000-000000000009',
      '10000000-0000-0000-0000-000000000002',
      'synthetic-cross-campaign-deny', 'Synthetic Cross Campaign Denial',
      'application/pdf', 'DECLARED'
    )$$,
  '42501', null,
  'Batch Leader cannot create a submission in another cohort campaign'
);
select throws_ok(
  $$update public.source_submissions
    set source_name = 'Batch Leader direct update'
    where id = '32000000-0000-0000-0000-000000000004'$$,
  '42501', null,
  'Batch Leader cannot update a submitted source directly'
);
select throws_ok(
  $$delete from public.source_submissions
    where id = '32000000-0000-0000-0000-000000000004'$$,
  '42501', null,
  'Batch Leader cannot delete a submitted source directly'
);
select throws_ok(
  $$update public.curriculum_units
    set publication_status = 'PUBLISHED'
    where id = '20000000-0000-0000-0000-000000000008'$$,
  '42501', null,
  'Batch Leader cannot publish a curriculum unit'
);
select throws_ok(
  $$update public.cohort_releases
    set release_status = 'LOCKED'
    where cohort_id = '20000000-0000-0000-0000-000000000006'$$,
  '42501', null,
  'Batch Leader cannot change cohort release state'
);
select throws_ok(
  $$insert into public.user_roles (user_id, role, grant_reason)
    values (
      '10000000-0000-0000-0000-000000000002', 'ADMIN',
      'Synthetic forbidden self-promotion'
    )$$,
  '42501', null,
  'Batch Leader cannot assign roles'
);
select is(
  (
    select count(*) from public.chat_sessions
    where id = '81000000-0000-0000-0000-000000000002'
  ),
  0::bigint,
  'Batch Leader assignment does not expose Student B chat'
);
reset role;

set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","app_metadata":{"role":"ADMIN"}}';
update public.batch_leader_assignments
set status = 'REVOKED',
    revoked_at = transaction_timestamp(),
    reason = 'Synthetic immediate matrix revocation'
where id = '31000000-0000-0000-0000-000000000001';

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","app_metadata":{"role":"BATCH_LEADER"}}';

select is(
  public.has_campaign_assignment('30000000-0000-0000-0000-000000000001'),
  false,
  'assignment revocation overrides stale Batch Leader metadata immediately'
);
select is(
  (select count(*) from public.collection_campaigns),
  0::bigint,
  'assignment revocation immediately removes campaign reads'
);
select is(
  (select count(*) from public.requested_material_items),
  0::bigint,
  'assignment revocation immediately removes requested-item reads'
);
select throws_ok(
  $$insert into public.source_submissions (
      campaign_id, curriculum_unit_id, cohort_id, submitted_by,
      client_idempotency_key, source_name, declared_format, declared_rights
    ) values (
      '30000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000007',
      '20000000-0000-0000-0000-000000000006',
      '10000000-0000-0000-0000-000000000002',
      'synthetic-revoked-assignment', 'Synthetic Revoked Assignment',
      'application/pdf', 'DECLARED'
    )$$,
  '42501', null,
  'revoked assignment immediately denies source creation'
);
reset role;

set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","app_metadata":{"role":"ADMIN"}}';
update public.cohort_memberships
set status = 'REVOKED'
where id = '21000000-0000-0000-0000-000000000001';

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","app_metadata":{"role":"STUDENT"}}';

select is(
  public.has_active_membership('20000000-0000-0000-0000-000000000006'),
  false,
  'membership revocation overrides stale Student metadata immediately'
);
select is((select count(*) from public.cohorts), 0::bigint, 'revoked membership removes cohort reads immediately');
select is((select count(*) from public.cohort_releases), 0::bigint, 'revoked membership removes release reads immediately');
select is((select count(*) from public.curriculum_units), 0::bigint, 'revoked membership removes unit reads immediately');
select is((select count(*) from public.available_curriculum_units()), 0::bigint, 'revoked membership removes availability immediately');
select is((select count(*) from public.source_assets), 0::bigint, 'revoked membership removes source metadata immediately');
select is(
  (select count(*) from public.chat_sessions),
  2::bigint,
  'membership revocation preserves access to two own historical chat sessions'
);
select throws_ok(
  $$insert into public.chat_sessions (
      user_id, cohort_id, curriculum_unit_id, language_mode, retention_mode
    ) values (
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000007', 'EN', 'MINIMAL'
    )$$,
  '42501', null,
  'revoked membership immediately denies new chat creation'
);
reset role;

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","app_metadata":{"role":"STUDENT"}}';

select is(public.is_admin(), true, 'authoritative DB role grants admin despite stale Student metadata');
select is((select count(*) from public.collection_campaigns), 2::bigint, 'admin can directly read all campaigns');
select is(
  (
    select name from public.collection_campaigns
    where id = '30000000-0000-0000-0000-000000000004'
  ),
  'Synthetic Other Campaign',
  'admin direct read returns locked-cohort campaign content'
);
select is((select count(*) from public.cohorts), 2::bigint, 'admin can directly preview both cohorts');
select is((select count(*) from public.curriculum_units), 4::bigint, 'admin can directly preview published and unpublished units');
select throws_ok(
  $$insert into public.collection_campaigns (
      cohort_id, name, status, opens_at, closes_at, created_by
    ) values (
      '20000000-0000-0000-0000-000000000006', 'Admin direct write',
      'OPEN', transaction_timestamp(), transaction_timestamp() + interval '1 day',
      '10000000-0000-0000-0000-000000000001'
    )$$,
  '42501', null,
  'admin authenticated client cannot directly create governed rows'
);
select throws_ok(
  $$update public.cohort_releases
    set release_status = 'LOCKED'
    where cohort_id = '20000000-0000-0000-0000-000000000006'$$,
  '42501', null,
  'admin authenticated client cannot directly update governed rows'
);
select throws_ok(
  $$delete from public.collection_campaigns
    where id = '30000000-0000-0000-0000-000000000004'$$,
  '42501', null,
  'admin authenticated client cannot directly delete governed rows'
);
select throws_ok(
  $$select count(*) from unimind_private.usage_ledger$$,
  '42501', null,
  'admin authenticated client cannot bypass the server-only schema'
);
reset role;

set local role service_role;
insert into public.feedback_reports (
  id, reporter_id, entity_type, entity_id, category, description
)
values (
  '84000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  'CURRICULUM_UNIT',
  '20000000-0000-0000-0000-000000000010',
  'OTHER', 'Synthetic server-only feedback write'
);
select is(
  (
    select count(*) from public.feedback_reports
    where id = '84000000-0000-0000-0000-000000000002'
  ),
  1::bigint,
  'service role can create a server-owned mutation'
);
select is(
  (
    select description from public.feedback_reports
    where id = '84000000-0000-0000-0000-000000000002'
  ),
  'Synthetic server-only feedback write',
  'service role reads back the created server-owned row'
);
update public.feedback_reports
set status = 'TRIAGED'
where id = '84000000-0000-0000-0000-000000000002';
select is(
  (
    select count(*) from public.feedback_reports
    where id = '84000000-0000-0000-0000-000000000002'
      and status = 'TRIAGED'
  ),
  1::bigint,
  'service role can update a server-owned mutation'
);
select is(
  (
    select status from public.feedback_reports
    where id = '84000000-0000-0000-0000-000000000002'
  ),
  'TRIAGED',
  'service role reads back the updated server-owned row'
);
select lives_ok(
  $$delete from public.feedback_reports
    where id = '84000000-0000-0000-0000-000000000002'$$,
  'service role can delete a server-owned mutation'
);
select is(
  (
    select count(*) from public.feedback_reports
    where id = '84000000-0000-0000-0000-000000000002'
  ),
  0::bigint,
  'service role deletion removes the intended row only'
);
select is(
  (
    select units from unimind_private.usage_ledger
    where id = '83000000-0000-0000-0000-000000000002'
  ),
  7::bigint,
  'service role can read the expected server-only usage row'
);
reset role;

update public.user_roles
set revoked_at = transaction_timestamp(),
    revoke_reason = 'Synthetic immediate matrix revocation'
where id = '11000000-0000-0000-0000-000000000001';

set local role authenticated;
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","app_metadata":{"role":"ADMIN"}}';

select is(public.is_admin(), false, 'role revocation overrides stale ADMIN metadata immediately');
select is((select count(*) from public.collection_campaigns), 0::bigint, 'role revocation immediately removes admin campaign reads');
select is((select count(*) from public.cohorts), 0::bigint, 'role revocation immediately removes admin cohort reads');
select is((select count(*) from public.source_submissions), 0::bigint, 'role revocation immediately removes admin submission reads');
reset role;

select * from finish();
rollback;
