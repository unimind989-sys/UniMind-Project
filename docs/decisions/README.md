# Decision records

Store one reviewed product, provider, policy, or operating decision per file. Create records from `docs/templates/decision-record.md` and name them `d-NN-short-subject.md`; keep the internal ID uppercase, such as `D-04`.

The [master-plan decision log (section 15)](../plans/poc-master-plan.md#15-decision-log) is the only status authority. When a record's state changes, update that log in the same slice. [`planning/decision-register.md`](../../planning/decision-register.md) tracks owner, due date, resolution path, and blocked tasks; update it only when one of those changes or a record is added.

Use `OPEN` when required inputs or options have not been supplied, `PROPOSED` only when a specific choice is ready for review, and an approved/rejected/superseded state only after the recorded decision.
