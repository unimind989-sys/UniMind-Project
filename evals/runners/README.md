# Evaluation runners

- **Interface:** Deterministic readers/validators that consume versioned evaluation datasets and emit machine-readable plus Markdown reports.
- **Allowed dependencies:** Dataset schemas, public RAG/Studio interfaces, and deterministic mocks by default.
- **Prohibited dependencies:** Dataset mutation, paid calls in `pnpm verify`, private content in committed output, and hidden score thresholds.
- **Owner:** The current evaluation task agent; academic reviewers own quality judgments.

`pnpm test:eval` currently proves this contract with `foundation-availability-v1.jsonl`, a synthetic WP01 seam fixture. It fingerprints the exact JSONL input and emits stable JSON/Markdown results under ignored `test-results/evaluation/`. It is not an academically reviewed tutor/Studio dataset and does not unblock WP00-T05.
