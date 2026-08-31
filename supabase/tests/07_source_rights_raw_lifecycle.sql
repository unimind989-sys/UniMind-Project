begin;
select plan(4);

select ok(exists (
  select 1 from public.source_versions
  where id = '41000000-0000-0000-0000-000000000001'
    and rights_status = 'VALID'
    and processing_status = 'READY'
    and activation_status = 'ACTIVE'
), 'READY activation is backed by valid rights');

select throws_ok(
  $$update unimind_private.raw_objects
    set status = 'DELETED', deleted_at = transaction_timestamp()
    where id = '42000000-0000-0000-0000-000000000001'$$,
  '23514',
  'invalid raw_object transition from STORED to DELETED',
  'raw bytes cannot skip the deletion workflow'
);

select throws_ok(
  $$update public.source_versions
    set checksum = 'sha256:9999999999999999999999999999999999999999999999999999999999999999'
    where id = '41000000-0000-0000-0000-000000000001'$$,
  '55000',
  'accepted source-version identity is immutable',
  'source-version content identity is immutable'
);

select is(
  (select status from unimind_private.raw_objects where id = '42000000-0000-0000-0000-000000000001'),
  'STORED',
  'failed prohibited transition retains the prior raw state'
);

select * from finish();
rollback;
