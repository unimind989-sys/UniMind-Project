# Test layers

Each child directory owns one verification layer. Tests cross the same public module seams as callers, use synthetic fixtures by default, and keep `pnpm verify` at zero paid calls.

Vitest projects and their bounded timeouts live in `vitest.config.ts`. Every Vitest command writes a machine-readable result under ignored `test-results/vitest/`; Playwright writes its JSON result under `test-results/e2e/`. Evaluation and load commands additionally write stable JSON and Markdown summaries under their ignored `test-results/` directories.

The safe workstation commands are `pnpm test:unit`, `pnpm test:integration`, `pnpm test:security`, `pnpm test:e2e`, `pnpm test:eval`, and `pnpm test:load`. `pnpm test:integration:database` runs only inside the guarded GitHub-hosted disposable Supabase lifecycle; it creates and removes a marked synthetic Auth fixture. The transitional `pnpm test:integration:hosted` remains explicit and guarded until the external WP01-T08 run passes. No ordinary command may initialize a real provider or target Preview/Beta.
