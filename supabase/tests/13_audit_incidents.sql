begin;
select plan(3);

select ok(
  (select count(*) from unimind_private.audit_events) >= 2,
  'fixture governance actions append audit events'
);

insert into unimind_private.system_feature_flags (
  id, key, enabled, changed_by, reason
) values (
  '82000000-0000-0000-0000-000000000001',
  'synthetic.feature', false,
  '10000000-0000-0000-0000-000000000001',
  'Create disabled synthetic feature'
);

select set_config('unimind.audit_reason', 'Enable synthetic feature for audit test', true);
select set_config('unimind.correlation_id', '90000000-0000-0000-0000-000000000002', true);
update unimind_private.system_feature_flags
set
  enabled = true,
  reason = 'Enable synthetic feature for audit test',
  changed_at = transaction_timestamp()
where id = '82000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from unimind_private.audit_events
   where entity_id = '82000000-0000-0000-0000-000000000001'),
  2::bigint,
  'insert and update each append one governed audit event'
);
select ok(exists (
  select 1 from unimind_private.audit_events
  where entity_id = '82000000-0000-0000-0000-000000000001'
    and action = 'UPDATE'
    and before_json ->> 'enabled' = 'false'
    and after_json ->> 'enabled' = 'true'
    and reason = 'Enable synthetic feature for audit test'
    and correlation_id = '90000000-0000-0000-0000-000000000002'
), 'governed audit retains actor context, before/after state, correlation, and reason');

select * from finish();
rollback;
