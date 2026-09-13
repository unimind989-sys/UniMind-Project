create function unimind_private.activate_profile_after_email_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null and new.email is not null then
    update public.profiles
    set
      account_status = 'ACTIVE',
      updated_at = transaction_timestamp()
    where user_id = new.id
      and account_status = 'PENDING';
  end if;

  return new;
end;
$$;

revoke all on function unimind_private.activate_profile_after_email_confirmation()
  from public, anon, authenticated;

create trigger zz_activate_profile_after_email_confirmation
after insert or update of email_confirmed_at on auth.users
for each row execute function unimind_private.activate_profile_after_email_confirmation();
