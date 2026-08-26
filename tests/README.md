# Test layers

Each child directory owns one verification layer. Tests cross the same public module seams as callers, use synthetic fixtures by default, and keep `pnpm verify` at zero paid calls.

Vitest projects and their bounded timeouts live in `vitest.config.ts`. Every Vitest command writes a machine-readable result under ignored `test-results/vitest/`; Playwright writes its JSON result under `test-results/e2e/`. Evaluation and load commands additionally write stable JSON and Markdown summaries under their ignored `test-results/` directories.

The safe default commands are `pnpm test:unit`, `pnpm test:integration`, `pnpm test:security`, `pnpm test:e2e`, `pnpm test:eval`, and `pnpm test:load`. Only `pnpm test:integration:hosted` reads the guarded development profile; it creates and removes a marked synthetic Auth fixture. No ordinary command may initialize a real provider or target preview/beta.
