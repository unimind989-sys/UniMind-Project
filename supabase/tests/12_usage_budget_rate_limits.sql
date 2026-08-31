begin;
\ir ../fixtures/wp02-synthetic.sql
select plan(5);

select is(
  (unimind_private.reserve_usage(
    '10000000-0000-0000-0000-000000000002', 'CHAT', 100,
    transaction_timestamp() + interval '10 minutes', 'synthetic-reservation-key'
  )).state,
  'RESERVED',
  'usage is reserved transactionally'
);
select is(
  (unimind_private.reserve_usage(
    '10000000-0000-0000-0000-000000000002', 'CHAT', 100,
    transaction_timestamp() + interval '10 minutes', 'synthetic-reservation-key'
  )).id,
  (select id from unimind_private.usage_reservations where idempotency_key = 'synthetic-reservation-key'),
  'reservation replay returns the canonical row'
);
select is(
  (unimind_private.settle_usage(
    (select id from unimind_private.usage_reservations where idempotency_key = 'synthetic-reservation-key'),
    80, transaction_timestamp()
  )).settled_units,
  80::bigint,
  'settlement locks and settles the reservation atomically'
);
select is(
  (select count(*) from unimind_private.usage_ledger where idempotency_key in (
    'reserve:synthetic-reservation-key',
    'settle:' || (select id::text from unimind_private.usage_reservations where idempotency_key = 'synthetic-reservation-key')
  )),
  2::bigint,
  'reservation and settlement append distinct ledger evidence'
);
select throws_ok(
  $$update unimind_private.usage_ledger set units = 1
    where idempotency_key = 'reserve:synthetic-reservation-key'$$,
  '55000',
  'unimind_private.usage_ledger is append-only',
  'usage ledger evidence cannot be rewritten'
);

select * from finish();
rollback;
