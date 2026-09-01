-- TEST-ONLY protected WP02-T04 negative candidate. Never promote this migration.
drop policy chat_sessions_select_own on public.chat_sessions;

create policy chat_sessions_select_own
on public.chat_sessions for select to authenticated
using ((select auth.uid()) is not null);
