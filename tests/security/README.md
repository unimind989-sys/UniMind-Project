# Security tests

- **Interface:** Allowed and forbidden operations across roles, users, cohorts, curriculum units, and source states.
- **Allowed dependencies:** Isolated reset hosted development/CI database, synthetic identities, explicit authorization interfaces, and leakage canaries.
- **Prohibited dependencies:** Real credentials/data, executor-only approval of sensitive gates, and success-only test matrices.
- **Owner:** The current security task agent; sensitive policy results require independent review.

WP01 covers the verified-identity and derived-availability seams with multiple synthetic actors, cohorts, roles, and source states. Database grants/RLS matrices are added with WP02 migrations and retain independent review; the foundation suite must not imply that later RLS coverage already exists.
