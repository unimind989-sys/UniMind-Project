# UniMind evidence index

Commit only sanitized evidence needed to reproduce and review a gate. Private raw sources, student data, ordinary chat content, secrets, signed URLs, and unredacted production logs belong in the approved restricted evidence store, not Git.

Use one directory per work package and name reports:

`YYYY-MM-DD_<gate>_<environment>_<short-sha>.md`

Every report must identify scope, commit, environment/config fingerprint, dataset versions, commands and exit codes, metrics, failures/deviations, rollback or disable action, executor, and actual review provenance. "Independent review" means a separate human or separately running review agent examined the exact candidate; otherwise write "self-review". Link restricted evidence using an opaque approved location and describe its access class; do not paste its contents here.

Write a report only when a task needed proof outside the PR and its CI run: production, deployment, database or external-service proof, or a founder approval. Commits and CI run IDs already identify the exact candidate, so do not add per-file hash manifests.
