# UniMind evidence index

Commit only sanitized evidence needed to reproduce and review a gate. Private raw sources, student data, ordinary chat content, secrets, signed URLs, and unredacted production logs belong in the approved restricted evidence store, not Git.

Use one directory per work package and name reports:

`YYYY-MM-DD_<gate>_<environment>_<short-sha>.md`

Every report must identify scope, commit, environment/config fingerprint, dataset versions, commands and exit codes, metrics, failures/deviations, rollback or disable action, executor, and actual review provenance. Distinct-account approval means the executor used another authorized GitHub account; independent review means a separate human or separately executing review agent/process examined the exact candidate. Record only the review class the evidence proves, and require independent review only where the task or protected gate names it. Link restricted evidence using an opaque approved location and describe its access class; do not paste its contents here.
