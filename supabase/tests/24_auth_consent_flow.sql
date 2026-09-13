begin;
select plan(6);

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '14000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'pending-auth@synthetic.unimind.invalid',
  '',
  null,
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  transaction_timestamp(),
  transaction_timestamp()
);

select is(
  (select account_status from public.profiles where user_id = '14000000-0000-0000-0000-000000000001'),
  'PENDING',
  'an unverified email/password account remains pending'
);

update auth.users
set email_confirmed_at = transaction_timestamp(), updated_at = transaction_timestamp()
where id = '14000000-0000-0000-0000-000000000001';

select is(
  (select account_status from public.profiles where user_id = '14000000-0000-0000-0000-000000000001'),
  'ACTIVE',
  'email confirmation activates a pending profile without an admin workaround'
);

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '14000000-0000-0000-0000-000000000002',
  'authenticated',
  'authenticated',
  'confirmed-auth@synthetic.unimind.invalid',
  '',
  transaction_timestamp(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  transaction_timestamp(),
  transaction_timestamp()
);

select is(
  (select account_status from public.profiles where user_id = '14000000-0000-0000-0000-000000000002'),
  'ACTIVE',
  'an already-confirmed email/password insert becomes active after profile creation'
);

update public.profiles
set account_status = 'SUSPENDED', updated_at = transaction_timestamp()
where user_id = '14000000-0000-0000-0000-000000000002';

update auth.users
set email_confirmed_at = transaction_timestamp() + interval '1 second', updated_at = transaction_timestamp()
where id = '14000000-0000-0000-0000-000000000002';

select is(
  (select account_status from public.profiles where user_id = '14000000-0000-0000-0000-000000000002'),
  'SUSPENDED',
  'email confirmation can never reactivate a suspended profile'
);

select ok(
  not has_function_privilege(
    'anon',
    'unimind_private.activate_profile_after_email_confirmation()',
    'EXECUTE'
  ),
  'anonymous callers cannot invoke the profile activation trigger function'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'unimind_private.activate_profile_after_email_confirmation()',
    'EXECUTE'
  ),
  'authenticated callers cannot invoke the profile activation trigger function'
);

select * from finish();
rollback;
