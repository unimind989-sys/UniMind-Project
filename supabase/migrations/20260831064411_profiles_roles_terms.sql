create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  preferred_language text not null default 'EN',
  account_status text not null default 'PENDING',
  chat_retention_mode text not null default 'MINIMAL',
  updated_at timestamptz not null default transaction_timestamp(),
  created_at timestamptz not null default transaction_timestamp(),
  constraint profiles_display_name_length_check
    check (char_length(display_name) <= 120),
  constraint profiles_preferred_language_check
    check (preferred_language in ('EN', 'AR_EG', 'MIXED')),
  constraint profiles_account_status_check
    check (account_status in ('PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED')),
  constraint profiles_chat_retention_mode_check
    check (chat_retention_mode in ('MINIMAL', 'HISTORY', 'DISABLED')),
  constraint profiles_updated_after_created_check
    check (updated_at >= created_at)
);

create table public.user_roles (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  role public.user_role not null,
  granted_by uuid references public.profiles(user_id) on delete restrict,
  granted_at timestamptz not null default transaction_timestamp(),
  grant_reason text not null,
  revoked_at timestamptz,
  revoke_reason text,
  created_at timestamptz not null default transaction_timestamp(),
  constraint user_roles_revoke_fields_check
    check (
      (revoked_at is null and revoke_reason is null)
      or (revoked_at is not null and nullif(btrim(revoke_reason), '') is not null)
    ),
  constraint user_roles_grant_reason_check
    check (nullif(btrim(grant_reason), '') is not null),
  constraint user_roles_revoked_after_grant_check
    check (revoked_at is null or revoked_at >= granted_at)
);

create unique index user_roles_one_active_role
  on public.user_roles (user_id, role)
  where revoked_at is null;

create table public.terms_versions (
  id uuid primary key default extensions.gen_random_uuid(),
  terms_version text not null,
  privacy_version text not null,
  educational_boundary_version text not null,
  status text not null default 'DRAFT',
  effective_at timestamptz,
  created_by uuid references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default transaction_timestamp(),
  constraint terms_versions_bundle_unique
    unique (terms_version, privacy_version, educational_boundary_version),
  constraint terms_versions_status_check
    check (status in ('DRAFT', 'ACTIVE', 'RETIRED')),
  constraint terms_versions_effective_state_check
    check (
      (status = 'DRAFT' and effective_at is null)
      or (status in ('ACTIVE', 'RETIRED') and effective_at is not null)
    )
);

create table public.terms_acceptances (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  terms_version_id uuid not null references public.terms_versions(id) on delete restrict,
  terms_version text not null,
  privacy_version text not null,
  educational_boundary_version text not null,
  accepted_at timestamptz not null default transaction_timestamp(),
  created_at timestamptz not null default transaction_timestamp(),
  constraint terms_acceptances_user_bundle_unique
    unique (user_id, terms_version_id),
  constraint terms_acceptances_accepted_after_created_check
    check (accepted_at >= created_at)
);

create function unimind_private.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function unimind_private.create_profile_for_auth_user()
  from public, anon, authenticated;

create trigger create_profile_after_auth_user
after insert on auth.users
for each row execute function unimind_private.create_profile_for_auth_user();

insert into public.profiles (user_id)
select id
from auth.users
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.terms_versions enable row level security;
alter table public.terms_acceptances enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.user_roles from anon, authenticated;
revoke all on table public.terms_versions from anon, authenticated;
revoke all on table public.terms_acceptances from anon, authenticated;
