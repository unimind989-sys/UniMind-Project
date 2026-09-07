begin;
select plan(21);

select is(
  (
    unimind_private.reserve_usage(
      '10000000-0000-0000-0000-000000000002', 'CHAT', 100,
      transaction_timestamp() + interval '10 minutes', 'wp02-t07-usage-reserve'
    )
  ).state,
  'RESERVED',
  'usage reserve creates the canonical reservation transactionally'
);

select is(
  (
    unimind_private.reserve_usage(
      '10000000-0000-0000-0000-000000000002', 'CHAT', 100,
      transaction_timestamp() + interval '10 minutes', 'wp02-t07-usage-reserve'
    )
  ).id,
  (
    select id from unimind_private.usage_reservations
    where idempotency_key = 'wp02-t07-usage-reserve'
  ),
  'usage reserve replay returns the canonical existing row'
);

select is(
  (
    select count(*) from unimind_private.usage_ledger
    where idempotency_key = 'reserve:wp02-t07-usage-reserve'
  ),
  1::bigint,
  'usage reserve replay appends one ledger event'
);

select throws_ok(
  $$select unimind_private.reserve_usage(
    '10000000-0000-0000-0000-000000000002', 'CHAT', 100,
    transaction_timestamp() + interval '20 minutes', 'wp02-t07-usage-reserve'
  )$$,
  '23505',
  'idempotency key was reused with different usage input',
  'usage reserve rejects a conflicting expiration replay'
);

select is(
  (
    unimind_private.settle_usage(
      (
        select id from unimind_private.usage_reservations
        where idempotency_key = 'wp02-t07-usage-reserve'
      ),
      80, transaction_timestamp() + interval '5 minutes', 'wp02-t07-usage-settle'
    )
  ).settled_units,
  80::bigint,
  'usage settlement records actual nonnegative units atomically'
);

select is(
  (
    unimind_private.settle_usage(
      (
        select id from unimind_private.usage_reservations
        where idempotency_key = 'wp02-t07-usage-reserve'
      ),
      80, transaction_timestamp() + interval '6 minutes', 'wp02-t07-usage-settle'
    )
  ).state,
  'SETTLED',
  'usage settlement replay returns the canonical terminal row'
);

select results_eq(
  $$select event_type, units from unimind_private.usage_ledger
    where idempotency_key in (
      'wp02-t07-usage-settle', 'wp02-t07-usage-settle:unused'
    ) order by event_type$$,
  $$values ('RELEASED'::text, 20::bigint), ('SETTLED'::text, 80::bigint)$$,
  'settlement records actual usage and releases unused units exactly once'
);

select throws_ok(
  $$select unimind_private.settle_usage(
    (
      select id from unimind_private.usage_reservations
      where idempotency_key = 'wp02-t07-usage-reserve'
    ),
    79, transaction_timestamp() + interval '6 minutes', 'wp02-t07-usage-settle'
  )$$,
  '23505',
  'idempotency key was reused with different usage transition input',
  'settlement rejects a conflicting idempotency replay'
);

select throws_ok(
  $$select unimind_private.settle_usage(
    (
      select id from unimind_private.usage_reservations
      where idempotency_key = 'wp02-t07-usage-reserve'
    ),
    80, transaction_timestamp() + interval '6 minutes', 'wp02-t07-second-settlement'
  )$$,
  '23514',
  'only a reserved usage row can settle',
  'a second settlement key cannot double-settle a reservation'
);

select is(
  (
    unimind_private.reserve_usage(
      '10000000-0000-0000-0000-000000000002', 'STUDIO', 50,
      transaction_timestamp() + interval '10 minutes', 'wp02-t07-usage-release'
    )
  ).state,
  'RESERVED',
  'a release test reservation is created'
);

select is(
  (
    unimind_private.release_usage(
      (
        select id from unimind_private.usage_reservations
        where idempotency_key = 'wp02-t07-usage-release'
      ),
      transaction_timestamp() + interval '4 minutes', 'wp02-t07-release-event'
    )
  ).state,
  'RELEASED',
  'usage release finalizes a reservation atomically'
);

select is(
  (
    unimind_private.release_usage(
      (
        select id from unimind_private.usage_reservations
        where idempotency_key = 'wp02-t07-usage-release'
      ),
      transaction_timestamp() + interval '5 minutes', 'wp02-t07-release-event'
    )
  ).state,
  'RELEASED',
  'usage release replay returns the canonical terminal row'
);

select is(
  (
    select count(*) from unimind_private.usage_ledger
    where idempotency_key = 'wp02-t07-release-event'
      and event_type = 'RELEASED' and units = 50
  ),
  1::bigint,
  'usage release replay appends one ledger event'
);

select throws_ok(
  $$select unimind_private.settle_usage(
    (
      select id from unimind_private.usage_reservations
      where idempotency_key = 'wp02-t07-usage-release'
    ),
    1, transaction_timestamp() + interval '5 minutes', 'wp02-t07-settle-released'
  )$$,
  '23514',
  'only a reserved usage row can settle',
  'released usage cannot later settle'
);

select is(
  (
    unimind_private.reserve_usage(
      '10000000-0000-0000-0000-000000000002', 'CHAT', 25,
      transaction_timestamp() + interval '10 minutes', 'wp02-t07-usage-expire'
    )
  ).state,
  'RESERVED',
  'an expiry test reservation is created'
);

select throws_ok(
  $$select unimind_private.expire_usage(
    (
      select id from unimind_private.usage_reservations
      where idempotency_key = 'wp02-t07-usage-expire'
    ),
    transaction_timestamp() + interval '9 minutes 59 seconds',
    'wp02-t07-expire-event'
  )$$,
  '23514',
  'usage reservation has not expired',
  'usage cannot expire before its deadline'
);

select is(
  (
    unimind_private.expire_usage(
      (
        select id from unimind_private.usage_reservations
        where idempotency_key = 'wp02-t07-usage-expire'
      ),
      transaction_timestamp() + interval '10 minutes', 'wp02-t07-expire-event'
    )
  ).state,
  'EXPIRED',
  'usage expiry finalizes a due reservation atomically'
);

select is(
  (
    unimind_private.expire_usage(
      (
        select id from unimind_private.usage_reservations
        where idempotency_key = 'wp02-t07-usage-expire'
      ),
      transaction_timestamp() + interval '11 minutes', 'wp02-t07-expire-event'
    )
  ).state,
  'EXPIRED',
  'usage expiry replay returns the canonical terminal row'
);

select throws_ok(
  $$select unimind_private.release_usage(
    (
      select id from unimind_private.usage_reservations
      where idempotency_key = 'wp02-t07-usage-expire'
    ),
    transaction_timestamp() + interval '11 minutes', 'wp02-t07-release-expired'
  )$$,
  '23514',
  'only a reserved usage row can release',
  'expired usage cannot later release'
);

select throws_ok(
  $$select unimind_private.settle_usage(
    (unimind_private.reserve_usage(
      '10000000-0000-0000-0000-000000000002', 'CHAT', 10,
      transaction_timestamp() + interval '20 minutes', 'wp02-t07-negative-reserve'
    )).id,
    -1, transaction_timestamp() + interval '15 minutes',
    'wp02-t07-negative-settlement'
  )$$,
  '23514',
  'settled units exceed the reservation',
  'negative settled units are rejected'
);

select throws_ok(
  $$update unimind_private.usage_ledger set units = 1
    where idempotency_key = 'wp02-t07-expire-event'$$,
  '55000',
  'unimind_private.usage_ledger is append-only',
  'usage transition evidence cannot be rewritten'
);

select * from finish();
rollback;
