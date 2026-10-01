-- Academic preferences are durable profile hints, never membership or release.
alter table public.profiles add column academic_context jsonb;

create function unimind_private.validate_profile_academic_context()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  context jsonb := new.academic_context;
begin
  if context is not distinct from old.academic_context then
    return new;
  end if;

  if auth.uid() is null or new.user_id <> auth.uid()
    or new.account_status <> 'ACTIVE'
    or not exists (
      select 1 from public.terms_acceptances as acceptance
      where acceptance.user_id = auth.uid()
        and acceptance.terms_version_id = (
          select terms.id from public.terms_versions as terms
          where terms.status = 'ACTIVE' and terms.effective_at <= transaction_timestamp()
          order by terms.effective_at desc limit 1
        )
    ) then
    raise exception using errcode = '42501', message = 'Academic preference unavailable.';
  end if;

  if context is null or jsonb_typeof(context) <> 'object' then
    raise exception using errcode = '22023', message = 'Academic preference does not match the available catalog.';
  end if;
  if context->'version' is distinct from '1'::jsonb
    or (select count(*) from jsonb_object_keys(context)) <> 7
    or not exists (
      select 1 from public.available_catalog_entries() as entry
      where entry.education_stage_id::text = context->>'stageId'
        and entry.institution_id::text = context->>'institutionId'
        and entry.program_id::text = context->>'programId'
        and entry.academic_level_id::text = context->>'levelId'
        and entry.term_id::text = context->>'termId'
        and entry.cohort_id::text = context->>'cohortId'
    ) then
    raise exception using errcode = '22023', message = 'Academic preference does not match the available catalog.';
  end if;
  return new;
end;
$$;

revoke all on function unimind_private.validate_profile_academic_context() from public, anon, authenticated;
create trigger profiles_validate_academic_context
before update of academic_context on public.profiles
for each row execute function unimind_private.validate_profile_academic_context();
grant update (academic_context) on public.profiles to authenticated;
