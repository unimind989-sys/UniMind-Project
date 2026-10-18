-- Profile names written by the first-run profile step and Settings (WP03-T27)
-- are trimmed, single-spaced, 1 to 80 characters, and carry no control or
-- bidirectional-control characters that could reorder or hide text where a
-- name is shown. The application also requires at least one letter; that
-- rule stays out of SQL because character classes follow the database locale.
-- Legacy empty names stay valid until the caller completes the profile step.
-- NOT VALID: existing rows are not scanned; every new write is checked.
alter table public.profiles
  add constraint profiles_display_name_format_check check (
    display_name = ''
    or (
      char_length(display_name) <= 80
      and display_name = btrim(display_name)
      and strpos(display_name, '  ') = 0
      and display_name !~ '[\u0001-\u001f\u007f-\u009f\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]'
    )
  ) not valid;
