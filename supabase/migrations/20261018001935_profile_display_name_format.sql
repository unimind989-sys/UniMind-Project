-- Profile names written by the first-run profile step and Settings (WP03-T27)
-- are trimmed, single-spaced, at most 80 characters, and carry no control or
-- bidirectional-control characters that could reorder or hide text where a
-- name is shown. The application also requires at least one letter; that rule
-- stays out of SQL because character classes follow the database locale.
-- The check runs only when the name itself changes, so an existing row with a
-- legacy name never blocks an unrelated update (account activation, academic
-- preference); the empty legacy name stays valid until the profile step.
create function unimind_private.validate_profile_display_name()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.display_name is distinct from old.display_name
    and new.display_name <> ''
    and (
      char_length(new.display_name) > 80
      or new.display_name <> pg_catalog.btrim(new.display_name)
      or pg_catalog.strpos(new.display_name, '  ') > 0
      or new.display_name ~ '[\u0001-\u001f\u007f-\u009f\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]'
    ) then
    raise exception using errcode = '23514', message = 'Display name format is invalid.';
  end if;
  return new;
end;
$$;

revoke all on function unimind_private.validate_profile_display_name() from public, anon, authenticated;
create trigger profiles_validate_display_name
before update of display_name on public.profiles
for each row execute function unimind_private.validate_profile_display_name();
