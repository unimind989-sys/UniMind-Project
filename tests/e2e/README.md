# End-to-end tests

- **Interface:** Playwright user journeys through public browser and HTTP seams using isolated synthetic accounts.
- **Allowed dependencies:** A locally started or approved synthetic preview environment.
- **Prohibited dependencies:** Beta by default, real users/content, paid calls, and screenshots as sole behavioral proof.
- **Owner:** The current end-to-end task agent.

`product-shell-contracts.spec.ts` runs bilingual axe, focus, reflow/text scaling, reduced-motion, main-control touch targets and HTML/RSC/API privacy contracts across the five critical surfaces. Its semantic-tree smoke is explicitly separate from a spoken screen-reader check. Run it with `pnpm exec playwright test tests/e2e/product-shell-contracts.spec.ts --workers=1`; the final `pnpm verify`/CI gate includes it automatically. On Windows, the existing `UNIMIND_E2E_USE_WEBPACK=1` fallback avoids local Turbopack startup stalls without changing CI configuration. Compile-aware per-spec timeouts do not change the repository default.

`pnpm test:e2e` starts the app on `127.0.0.1:3100` with safe synthetic environment values, mock mode, zero budget, one Chromium worker, a 120-second bounded server-start allowance, a 15-second test timeout, and external browser requests blocked by the test. Its repository-owned wrapper removes only a stale listener whose command line proves the expected UniMind Next test server and cleans the owned process on success or failure; unrelated listeners remain untouched. Playwright Test is the repeatable gate; Codex uses its in-app side browser for ordinary interactive work. The project-pinned `pnpm browser:cli` command is reserved for explicit `$playwright-cli` tracing or test-debugging tasks.
