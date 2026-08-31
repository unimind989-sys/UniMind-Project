begin;
select plan(3);

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values (
  '10000000-0000-0000-0000-000000000099', 'authenticated', 'authenticated',
  'metadata-role@synthetic.unimind.invalid', '', transaction_timestamp(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"role":"ADMIN","display_name":"Untrusted metadata"}'::jsonb,
  transaction_timestamp(), transaction_timestamp()
);

select is(
  (select count(*) from public.profiles where user_id = '10000000-0000-0000-0000-000000000099'),
  1::bigint,
  'a new auth user receives exactly one profile'
);
select is(
  (select count(*) from public.user_roles where user_id = '10000000-0000-0000-0000-000000000099'),
  0::bigint,
  'user metadata cannot grant an application role'
);
select is(
  (select display_name from public.profiles where user_id = '10000000-0000-0000-0000-000000000099'),
  '',
  'untrusted metadata is not copied into the authoritative profile'
);

select * from finish();
rollback;
