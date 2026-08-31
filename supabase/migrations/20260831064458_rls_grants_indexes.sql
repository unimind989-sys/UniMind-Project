-- Foreign-key indexes are mandatory. Build only missing leading-column indexes,
-- using deterministic names derived from the reviewed constraints.
do $$
declare
  target record;
  column_list text;
  index_name text;
begin
  for target in
    select
      constraints.oid as constraint_oid,
      namespaces.nspname as schema_name,
      relations.relname as table_name,
      constraints.conname as constraint_name,
      constraints.conrelid,
      constraints.conkey
    from pg_catalog.pg_constraint as constraints
    join pg_catalog.pg_class as relations on relations.oid = constraints.conrelid
    join pg_catalog.pg_namespace as namespaces on namespaces.oid = relations.relnamespace
    where constraints.contype = 'f'
      and namespaces.nspname in ('public', 'unimind_private')
      and not exists (
        select 1
        from pg_catalog.pg_index as indexes
        where indexes.indrelid = constraints.conrelid
          and indexes.indisvalid
          and (indexes.indkey::smallint[])[0:cardinality(constraints.conkey) - 1]
              = constraints.conkey
      )
  loop
    select string_agg(pg_catalog.quote_ident(attributes.attname), ', ' order by keys.ordinality)
    into column_list
    from unnest(target.conkey) with ordinality as keys(attribute_number, ordinality)
    join pg_catalog.pg_attribute as attributes
      on attributes.attrelid = target.conrelid
     and attributes.attnum = keys.attribute_number;

    index_name := left(
      target.table_name || '_' || replace(column_list, '"', '') || '_fk_idx',
      54
    ) || '_' || left(md5(target.constraint_name), 8);

    execute format(
      'create index %I on %I.%I (%s)',
      index_name,
      target.schema_name,
      target.table_name,
      column_list
    );
  end loop;
end;
$$;

-- Named query indexes for availability, job claiming, source scope, and user-owned history.
create index cohort_memberships_availability_idx
  on public.cohort_memberships (user_id, cohort_id, status, starts_at, ends_at);
create index curriculum_units_catalog_order_idx
  on public.curriculum_units (cohort_id, publication_status, sort_order, code);
create index source_assets_unit_scope_idx
  on public.source_assets (cohort_id, curriculum_unit_id, id);
create index source_versions_availability_idx
  on public.source_versions (
    source_asset_id,
    processing_status,
    activation_status,
    rights_status,
    rights_valid_from,
    rights_valid_until,
    curriculum_edition
  );
create index processing_jobs_claim_idx
  on unimind_private.processing_jobs (state, available_at, priority, created_at)
  where state in ('QUEUED', 'RETRYING');
create index source_segments_retrieval_scope_idx
  on unimind_private.source_segments (
    cohort_id,
    curriculum_unit_id,
    curriculum_edition,
    active,
    source_version_id
  );
create index segment_embeddings_config_segment_idx
  on unimind_private.segment_embeddings (embedding_config_id, source_segment_id);
create index chat_sessions_user_created_idx
  on public.chat_sessions (user_id, created_at desc);
create index studio_requests_user_created_idx
  on public.studio_requests (user_id, created_at desc);

-- Public objects remain deny-by-default unless a policy and exact grant below agree.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;
revoke all on schema unimind_private from public, anon, authenticated;
revoke all on all tables in schema unimind_private from public, anon, authenticated;
revoke all on all functions in schema unimind_private from public, anon, authenticated;

grant usage on type public.user_role to authenticated, service_role;
grant usage on type public.curriculum_unit_type to authenticated, service_role;

grant select on table public.profiles to authenticated;
grant update (display_name, preferred_language, chat_retention_mode, updated_at)
  on table public.profiles to authenticated;
grant select on table public.user_roles to authenticated;
grant select on table public.terms_versions to authenticated;
grant select, insert on table public.terms_acceptances to authenticated;

grant select on table public.education_stages to authenticated;
grant select on table public.institutions to authenticated;
grant select on table public.programs to authenticated;
grant select on table public.academic_levels to authenticated;
grant select on table public.terms to authenticated;
grant select on table public.cohorts to authenticated;
grant select on table public.curriculum_units to authenticated;
grant select on table public.cohort_memberships to authenticated;
grant select on table public.cohort_releases to authenticated;

grant select on table public.collection_campaigns to authenticated;
grant select on table public.campaign_curriculum_units to authenticated;
grant select on table public.batch_leader_assignments to authenticated;
grant select on table public.requested_material_items to authenticated;
grant select, insert on table public.source_submissions to authenticated;

grant select on table public.source_assets to authenticated;
grant select on table public.source_versions to authenticated;

grant select, insert on table public.chat_sessions to authenticated;
grant select, insert on table public.chat_messages to authenticated;
grant select on table public.chat_answers to authenticated;
grant select on table public.answer_evidence to authenticated;
grant select, insert on table public.feedback_reports to authenticated;

grant select, insert on table public.studio_requests to authenticated;
grant select on table public.studio_artifacts to authenticated;
grant select on table public.artifact_evidence to authenticated;
grant select on table public.artifact_validation_results to authenticated;
grant select, insert, update (submitted_at) on table public.quiz_attempts to authenticated;
grant select, insert, update (selected_option, answered_at) on table public.quiz_responses to authenticated;

grant execute on function public.available_curriculum_units() to authenticated;

create policy profiles_select_own
on public.profiles for select to authenticated
using (user_id = (select auth.uid()));

create policy profiles_update_own
on public.profiles for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy user_roles_select_own
on public.user_roles for select to authenticated
using (user_id = (select auth.uid()));

create policy terms_versions_select_active
on public.terms_versions for select to authenticated
using (status = 'ACTIVE' and effective_at <= transaction_timestamp());

create policy terms_acceptances_select_own
on public.terms_acceptances for select to authenticated
using (user_id = (select auth.uid()));

create policy terms_acceptances_insert_own_active
on public.terms_acceptances for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.terms_versions as versions
    where versions.id = terms_version_id
      and versions.status = 'ACTIVE'
      and versions.effective_at <= transaction_timestamp()
      and versions.terms_version = terms_acceptances.terms_version
      and versions.privacy_version = terms_acceptances.privacy_version
      and versions.educational_boundary_version = terms_acceptances.educational_boundary_version
  )
);

create policy education_stages_select_active
on public.education_stages for select to authenticated
using (status = 'ACTIVE');
create policy institutions_select_active
on public.institutions for select to authenticated
using (status = 'ACTIVE');
create policy programs_select_active
on public.programs for select to authenticated
using (status = 'ACTIVE');
create policy academic_levels_select_active
on public.academic_levels for select to authenticated
using (status = 'ACTIVE');
create policy terms_select_active
on public.terms for select to authenticated
using (status = 'ACTIVE');

create policy cohorts_select_member_or_admin
on public.cohorts for select to authenticated
using (
  exists (
    select 1 from public.cohort_memberships as memberships
    where memberships.cohort_id = cohorts.id
      and memberships.user_id = (select auth.uid())
      and memberships.status = 'ACTIVE'
      and (memberships.starts_at is null or memberships.starts_at <= transaction_timestamp())
      and (memberships.ends_at is null or memberships.ends_at > transaction_timestamp())
  )
  or exists (
    select 1 from public.user_roles as roles
    where roles.user_id = (select auth.uid())
      and roles.role = 'ADMIN'
      and roles.revoked_at is null
  )
);

create policy curriculum_units_select_member_or_admin
on public.curriculum_units for select to authenticated
using (
  exists (
    select 1 from public.cohort_memberships as memberships
    where memberships.cohort_id = curriculum_units.cohort_id
      and memberships.user_id = (select auth.uid())
      and memberships.status = 'ACTIVE'
      and (memberships.starts_at is null or memberships.starts_at <= transaction_timestamp())
      and (memberships.ends_at is null or memberships.ends_at > transaction_timestamp())
  )
  or exists (
    select 1 from public.user_roles as roles
    where roles.user_id = (select auth.uid())
      and roles.role = 'ADMIN'
      and roles.revoked_at is null
  )
);

create policy cohort_memberships_select_own
on public.cohort_memberships for select to authenticated
using (user_id = (select auth.uid()));

create policy cohort_releases_select_member_or_admin
on public.cohort_releases for select to authenticated
using (
  exists (
    select 1 from public.cohort_memberships as memberships
    where memberships.cohort_id = cohort_releases.cohort_id
      and memberships.user_id = (select auth.uid())
      and memberships.status = 'ACTIVE'
  )
  or exists (
    select 1 from public.user_roles as roles
    where roles.user_id = (select auth.uid())
      and roles.role = 'ADMIN'
      and roles.revoked_at is null
  )
);

create policy collection_campaigns_select_assigned_or_admin
on public.collection_campaigns for select to authenticated
using (
  exists (
    select 1 from public.batch_leader_assignments as assignments
    where assignments.campaign_id = collection_campaigns.id
      and assignments.user_id = (select auth.uid())
      and assignments.status = 'ACTIVE'
      and assignments.expires_at > transaction_timestamp()
  )
  or exists (
    select 1 from public.user_roles as roles
    where roles.user_id = (select auth.uid()) and roles.role = 'ADMIN' and roles.revoked_at is null
  )
);

create policy campaign_curriculum_units_select_assigned_or_admin
on public.campaign_curriculum_units for select to authenticated
using (
  exists (
    select 1 from public.batch_leader_assignments as assignments
    where assignments.campaign_id = campaign_curriculum_units.campaign_id
      and assignments.user_id = (select auth.uid())
      and assignments.status = 'ACTIVE'
      and assignments.expires_at > transaction_timestamp()
  )
  or exists (
    select 1 from public.user_roles as roles
    where roles.user_id = (select auth.uid()) and roles.role = 'ADMIN' and roles.revoked_at is null
  )
);

create policy batch_leader_assignments_select_own_or_admin
on public.batch_leader_assignments for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.user_roles as roles
    where roles.user_id = (select auth.uid()) and roles.role = 'ADMIN' and roles.revoked_at is null
  )
);

create policy requested_material_items_select_assigned_or_admin
on public.requested_material_items for select to authenticated
using (
  exists (
    select 1 from public.batch_leader_assignments as assignments
    where assignments.campaign_id = requested_material_items.campaign_id
      and assignments.user_id = (select auth.uid())
      and assignments.status = 'ACTIVE'
      and assignments.expires_at > transaction_timestamp()
  )
  or exists (
    select 1 from public.user_roles as roles
    where roles.user_id = (select auth.uid()) and roles.role = 'ADMIN' and roles.revoked_at is null
  )
);

create policy source_submissions_select_own_or_admin
on public.source_submissions for select to authenticated
using (
  submitted_by = (select auth.uid())
  or exists (
    select 1 from public.user_roles as roles
    where roles.user_id = (select auth.uid()) and roles.role = 'ADMIN' and roles.revoked_at is null
  )
);

create policy source_submissions_insert_assigned
on public.source_submissions for insert to authenticated
with check (
  submitted_by = (select auth.uid())
  and declared_rights = 'DECLARED'
  and exists (
    select 1 from public.collection_campaigns as campaigns
    join public.batch_leader_assignments as assignments on assignments.campaign_id = campaigns.id
    join public.campaign_curriculum_units as campaign_units
      on campaign_units.campaign_id = campaigns.id
     and campaign_units.curriculum_unit_id = source_submissions.curriculum_unit_id
    where campaigns.id = source_submissions.campaign_id
      and campaigns.cohort_id = source_submissions.cohort_id
      and campaigns.status = 'OPEN'
      and campaigns.opens_at <= transaction_timestamp()
      and campaigns.closes_at > transaction_timestamp()
      and assignments.user_id = (select auth.uid())
      and assignments.status = 'ACTIVE'
      and assignments.expires_at > transaction_timestamp()
  )
);

create policy source_assets_select_available_scope
on public.source_assets for select to authenticated
using (
  exists (
    select 1
    from public.curriculum_units as units
    join public.cohort_releases as releases on releases.cohort_id = units.cohort_id
    where units.id = source_assets.curriculum_unit_id
      and units.cohort_id = source_assets.cohort_id
      and units.publication_status = 'PUBLISHED'
      and releases.release_status = 'UNLOCKED'
      and (
        exists (
          select 1 from public.cohort_memberships as memberships
          where memberships.cohort_id = source_assets.cohort_id
            and memberships.user_id = (select auth.uid())
            and memberships.status = 'ACTIVE'
            and (memberships.starts_at is null or memberships.starts_at <= transaction_timestamp())
            and (memberships.ends_at is null or memberships.ends_at > transaction_timestamp())
        )
        or exists (
          select 1 from public.user_roles as roles
          where roles.user_id = (select auth.uid())
            and roles.role = 'ADMIN'
            and roles.revoked_at is null
        )
      )
  )
);

create policy source_versions_select_available_scope
on public.source_versions for select to authenticated
using (
  processing_status = 'READY'
  and activation_status = 'ACTIVE'
  and rights_status = 'VALID'
  and rights_valid_from <= transaction_timestamp()
  and (rights_valid_until is null or rights_valid_until > transaction_timestamp())
  and exists (
    select 1
    from public.source_assets as assets
    join public.cohorts as cohorts on cohorts.id = assets.cohort_id
    where assets.id = source_versions.source_asset_id
      and source_versions.curriculum_edition = cohorts.curriculum_edition
  )
);

create policy chat_sessions_select_own
on public.chat_sessions for select to authenticated
using (user_id = (select auth.uid()));
create policy chat_sessions_insert_own_available
on public.chat_sessions for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.available_curriculum_units() as available
    where available.cohort_id = chat_sessions.cohort_id
      and available.id = chat_sessions.curriculum_unit_id
  )
);

create policy chat_messages_select_own_session
on public.chat_messages for select to authenticated
using (
  exists (
    select 1 from public.chat_sessions as sessions
    where sessions.id = chat_messages.session_id and sessions.user_id = (select auth.uid())
  )
);
create policy chat_messages_insert_user_message
on public.chat_messages for insert to authenticated
with check (
  role = 'USER'
  and exists (
    select 1 from public.chat_sessions as sessions
    where sessions.id = chat_messages.session_id
      and sessions.user_id = (select auth.uid())
      and sessions.closed_at is null
  )
);

create policy chat_answers_select_own_session
on public.chat_answers for select to authenticated
using (
  exists (
    select 1
    from public.chat_messages as messages
    join public.chat_sessions as sessions on sessions.id = messages.session_id
    where messages.id = chat_answers.assistant_message_id
      and sessions.user_id = (select auth.uid())
  )
);
create policy answer_evidence_select_own_answer
on public.answer_evidence for select to authenticated
using (
  exists (
    select 1
    from public.chat_answers as answers
    join public.chat_messages as messages on messages.id = answers.assistant_message_id
    join public.chat_sessions as sessions on sessions.id = messages.session_id
    where answers.id = answer_evidence.answer_id
      and sessions.user_id = (select auth.uid())
  )
);

create policy feedback_reports_select_own
on public.feedback_reports for select to authenticated
using (reporter_id = (select auth.uid()));
create policy feedback_reports_insert_own
on public.feedback_reports for insert to authenticated
with check (reporter_id = (select auth.uid()) and status = 'OPEN');

create policy studio_requests_select_own
on public.studio_requests for select to authenticated
using (user_id = (select auth.uid()));
create policy studio_requests_insert_own_available
on public.studio_requests for insert to authenticated
with check (
  user_id = (select auth.uid())
  and state = 'QUEUED'
  and exists (
    select 1 from public.available_curriculum_units() as available
    where available.cohort_id = studio_requests.cohort_id
      and available.id = studio_requests.curriculum_unit_id
  )
);

create policy studio_artifacts_select_own_request
on public.studio_artifacts for select to authenticated
using (
  published_at is not null
  and invalidated_at is null
  and exists (
    select 1 from public.studio_requests as requests
    where requests.id = studio_artifacts.studio_request_id
      and requests.user_id = (select auth.uid())
  )
);
create policy artifact_evidence_select_own_artifact
on public.artifact_evidence for select to authenticated
using (
  exists (
    select 1
    from public.studio_artifacts as artifacts
    join public.studio_requests as requests on requests.id = artifacts.studio_request_id
    where artifacts.id = artifact_evidence.artifact_id
      and artifacts.published_at is not null
      and artifacts.invalidated_at is null
      and requests.user_id = (select auth.uid())
  )
);
create policy artifact_validation_select_own_artifact
on public.artifact_validation_results for select to authenticated
using (
  exists (
    select 1
    from public.studio_artifacts as artifacts
    join public.studio_requests as requests on requests.id = artifacts.studio_request_id
    where artifacts.id = artifact_validation_results.artifact_id
      and requests.user_id = (select auth.uid())
  )
);

create policy quiz_attempts_select_own
on public.quiz_attempts for select to authenticated
using (user_id = (select auth.uid()));
create policy quiz_attempts_insert_own_artifact
on public.quiz_attempts for insert to authenticated
with check (
  user_id = (select auth.uid())
  and submitted_at is null
  and exists (
    select 1
    from public.studio_artifacts as artifacts
    join public.studio_requests as requests on requests.id = artifacts.studio_request_id
    where artifacts.id = quiz_attempts.artifact_id
      and artifacts.artifact_type = 'MCQ_QUIZ'
      and artifacts.published_at is not null
      and artifacts.invalidated_at is null
      and requests.user_id = (select auth.uid())
  )
);
create policy quiz_attempts_update_own
on public.quiz_attempts for update to authenticated
using (user_id = (select auth.uid()) and submitted_at is null)
with check (user_id = (select auth.uid()));

create policy quiz_responses_select_own_attempt
on public.quiz_responses for select to authenticated
using (
  exists (
    select 1 from public.quiz_attempts as attempts
    where attempts.id = quiz_responses.attempt_id and attempts.user_id = (select auth.uid())
  )
);
create policy quiz_responses_insert_own_attempt
on public.quiz_responses for insert to authenticated
with check (
  correct is null
  and exists (
    select 1 from public.quiz_attempts as attempts
    where attempts.id = quiz_responses.attempt_id
      and attempts.user_id = (select auth.uid())
      and attempts.submitted_at is null
  )
);
create policy quiz_responses_update_own_attempt
on public.quiz_responses for update to authenticated
using (
  exists (
    select 1 from public.quiz_attempts as attempts
    where attempts.id = quiz_responses.attempt_id
      and attempts.user_id = (select auth.uid())
      and attempts.submitted_at is null
  )
)
with check (
  correct is null
  and exists (
    select 1 from public.quiz_attempts as attempts
    where attempts.id = quiz_responses.attempt_id
      and attempts.user_id = (select auth.uid())
      and attempts.submitted_at is null
  )
);

-- The service role is server-only and receives exact object capabilities.
grant usage on schema unimind_private to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant select, insert, update, delete on all tables in schema unimind_private to service_role;
grant execute on function unimind_private.claim_processing_job(text, timestamptz, interval)
  to service_role;
grant execute on function unimind_private.reserve_usage(uuid, text, bigint, timestamptz, text)
  to service_role;
grant execute on function unimind_private.settle_usage(uuid, bigint, timestamptz)
  to service_role;
grant execute on function unimind_private.retrieve_authorized_segments(uuid, uuid, uuid, uuid, extensions.vector, integer)
  to service_role;
