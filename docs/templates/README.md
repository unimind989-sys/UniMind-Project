# UniMind execution templates

Copy a template into the destination required by the execution runbook, rename it with the relevant decision/task/date, and replace every placeholder before review. Templates are not evidence or approved policy by themselves.

| Template | Use |
| --- | --- |
| `task-record.md` | Claim one atomic runbook task and preserve execution state for a fresh-agent handoff. |
| `decision-record.md` | Close a product, architecture, provider, policy, or budget decision and record consequences/rollback. |
| `cohort-candidates.csv` | Score Human and Veterinary cohort candidates using the required evidence model. |
| `source-rights-inventory.csv` | Track one source per row and each permission independently. |
| `raw-data-policy.md` | Approve exact raw/temporary/processed lifecycle and deletion evidence. |
| `provider-benchmark.csv` | Compare real adapters on quality, rights fit, reliability, latency, and cost. |
| `rls-matrix.csv` | Map actor/action/resource/state to allow/deny policy and automated test. |
| `load-profile-100-students.yaml` | Freeze the reproducible load/failure scenario and abort/acceptance thresholds. |
| `gate-report.md` | Record command results, metrics, failures, rollback, and the required founder human checkpoint. |
| `incident-runbook.md` | Create and exercise a specific containment, repair, replay, and recovery procedure. |

CSV files are UTF-8 with one header row. Do not paste multiline private content into them. YAML `FILL_ME` values are mandatory decisions; the load runner must reject a profile that still contains one.
