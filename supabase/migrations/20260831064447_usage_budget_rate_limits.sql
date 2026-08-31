create table unimind_private.usage_ledger (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  event_type text not null,
  units bigint not null,
  related_entity_type text not null,
  related_entity_id uuid not null,
  idempotency_key text not null unique,
  created_at timestamptz not null default transaction_timestamp(),
  constraint usage_ledger_event_type_check
    check (event_type in ('RESERVED', 'SETTLED', 'RELEASED', 'EXPIRED', 'ADJUSTMENT')),
  constraint usage_ledger_units_check check (units >= 0),
  constraint usage_ledger_idempotency_check
    check (char_length(idempotency_key) between 8 and 240)
);

create table unimind_private.usage_reservations (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  action_type text not null,
  reserved_units bigint not null,
  settled_units bigint not null default 0,
  state text not null default 'RESERVED',
  expires_at timestamptz not null,
  idempotency_key text not null unique,
  settled_at timestamptz,
  created_at timestamptz not null default transaction_timestamp(),
  constraint usage_reservations_units_check
    check (reserved_units > 0 and settled_units >= 0 and settled_units <= reserved_units),
  constraint usage_reservations_state_check
    check (state in ('RESERVED', 'SETTLED', 'RELEASED', 'EXPIRED')),
  constraint usage_reservations_expiry_check check (expires_at > created_at),
  constraint usage_reservations_settlement_fields_check
    check (
      (state = 'SETTLED' and settled_at is not null)
      or (state <> 'SETTLED' and settled_at is null and settled_units = 0)
    ),
  constraint usage_reservations_idempotency_check
    check (char_length(idempotency_key) between 8 and 200)
);

create table unimind_private.rate_limit_buckets (
  id uuid primary key default extensions.gen_random_uuid(),
  subject_key text not null,
  action_type text not null,
  window_start timestamptz not null,
  used bigint not null default 0,
  limit_value bigint not null,
  updated_at timestamptz not null default transaction_timestamp(),
  created_at timestamptz not null default transaction_timestamp(),
  constraint rate_limit_buckets_identity_unique
    unique (subject_key, action_type, window_start),
  constraint rate_limit_buckets_values_check
    check (used >= 0 and limit_value >= 0 and used <= limit_value),
  constraint rate_limit_buckets_updated_check check (updated_at >= created_at)
);

create table unimind_private.system_feature_flags (
  id uuid primary key default extensions.gen_random_uuid(),
  key text not null unique,
  enabled boolean not null default false,
  config_json jsonb not null default '{}'::jsonb,
  changed_by uuid not null references public.profiles(user_id) on delete restrict,
  changed_at timestamptz not null default transaction_timestamp(),
  reason text not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint system_feature_flags_key_check check (key ~ '^[a-z][a-z0-9_.-]*$'),
  constraint system_feature_flags_reason_check check (nullif(btrim(reason), '') is not null),
  constraint system_feature_flags_changed_check check (changed_at >= created_at)
);

create table unimind_private.budget_counters (
  id uuid primary key default extensions.gen_random_uuid(),
  scope_type text not null,
  scope_id text not null,
  period_start timestamptz not null,
  amount numeric(20, 6) not null default 0,
  hard_limit numeric(20, 6) not null,
  currency_code text not null,
  updated_at timestamptz not null default transaction_timestamp(),
  created_at timestamptz not null default transaction_timestamp(),
  constraint budget_counters_identity_unique unique (scope_type, scope_id, period_start),
  constraint budget_counters_scope_check
    check (scope_type in ('SYSTEM', 'PROVIDER', 'ACTION', 'COHORT')),
  constraint budget_counters_amount_check
    check (amount >= 0 and hard_limit >= 0 and amount <= hard_limit),
  constraint budget_counters_currency_check check (currency_code ~ '^[A-Z]{3}$'),
  constraint budget_counters_updated_check check (updated_at >= created_at)
);

create function unimind_private.reserve_usage(
  target_user_id uuid,
  target_action_type text,
  target_reserved_units bigint,
  target_expires_at timestamptz,
  target_idempotency_key text
)
returns unimind_private.usage_reservations
language plpgsql
set search_path = ''
as $$
declare
  reservation unimind_private.usage_reservations%rowtype;
begin
  select * into reservation
  from unimind_private.usage_reservations
  where idempotency_key = target_idempotency_key
  for update;

  if found then
    if (reservation.user_id, reservation.action_type, reservation.reserved_units)
       is distinct from (target_user_id, target_action_type, target_reserved_units) then
      raise exception using errcode = '23505', message = 'idempotency key was reused with different usage input';
    end if;
    return reservation;
  end if;

  insert into unimind_private.usage_reservations (
    user_id,
    action_type,
    reserved_units,
    expires_at,
    idempotency_key
  ) values (
    target_user_id,
    target_action_type,
    target_reserved_units,
    target_expires_at,
    target_idempotency_key
  ) returning * into reservation;

  insert into unimind_private.usage_ledger (
    user_id,
    event_type,
    units,
    related_entity_type,
    related_entity_id,
    idempotency_key
  ) values (
    target_user_id,
    'RESERVED',
    target_reserved_units,
    'USAGE_RESERVATION',
    reservation.id,
    'reserve:' || target_idempotency_key
  );

  return reservation;
end;
$$;

create function unimind_private.settle_usage(
  reservation_id uuid,
  target_settled_units bigint,
  settled_time timestamptz
)
returns unimind_private.usage_reservations
language plpgsql
set search_path = ''
as $$
declare
  reservation unimind_private.usage_reservations%rowtype;
begin
  select * into reservation
  from unimind_private.usage_reservations
  where id = reservation_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'usage reservation does not exist';
  end if;

  if reservation.state = 'SETTLED' then
    if reservation.settled_units <> target_settled_units then
      raise exception using errcode = '23505', message = 'settlement replay changed settled units';
    end if;
    return reservation;
  end if;

  if reservation.state <> 'RESERVED' then
    raise exception using errcode = '23514', message = 'only a reserved usage row can settle';
  end if;
  if target_settled_units < 0 or target_settled_units > reservation.reserved_units then
    raise exception using errcode = '23514', message = 'settled units exceed the reservation';
  end if;

  perform unimind_private.assert_valid_transition(
    'usage_reservation', reservation.state, 'SETTLED'
  );

  update unimind_private.usage_reservations
  set state = 'SETTLED', settled_units = target_settled_units, settled_at = settled_time
  where id = reservation.id
  returning * into reservation;

  insert into unimind_private.usage_ledger (
    user_id,
    event_type,
    units,
    related_entity_type,
    related_entity_id,
    idempotency_key
  ) values (
    reservation.user_id,
    'SETTLED',
    target_settled_units,
    'USAGE_RESERVATION',
    reservation.id,
    'settle:' || reservation.id::text
  );

  return reservation;
end;
$$;

revoke all on function unimind_private.reserve_usage(uuid, text, bigint, timestamptz, text)
  from public, anon, authenticated;
revoke all on function unimind_private.settle_usage(uuid, bigint, timestamptz)
  from public, anon, authenticated;

create trigger usage_ledger_append_only
before update or delete on unimind_private.usage_ledger
for each row execute function unimind_private.reject_row_mutation();

create trigger usage_reservations_no_delete
before delete on unimind_private.usage_reservations
for each row execute function unimind_private.reject_row_mutation();

revoke all on table unimind_private.usage_ledger from public, anon, authenticated;
revoke all on table unimind_private.usage_reservations from public, anon, authenticated;
revoke all on table unimind_private.rate_limit_buckets from public, anon, authenticated;
revoke all on table unimind_private.system_feature_flags from public, anon, authenticated;
revoke all on table unimind_private.budget_counters from public, anon, authenticated;
