# End-to-end tests

- **Interface:** Playwright user journeys through public browser and HTTP seams using isolated synthetic accounts.
- **Allowed dependencies:** A locally started or approved synthetic preview environment.
- **Prohibited dependencies:** Beta by default, real users/content, paid calls, and screenshots as sole behavioral proof.
- **Owner:** The current end-to-end task agent.

`pnpm test:e2e` starts the app on `127.0.0.1:3100` with safe synthetic environment values, mock mode, zero budget, one Chromium worker, a 15-second test timeout, and external browser requests blocked by the test. Playwright Test is the repeatable gate; interactive work uses the project-pinned `pnpm browser:cli` command.
