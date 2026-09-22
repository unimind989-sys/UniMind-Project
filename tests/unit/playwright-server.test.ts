import { describe, expect, it } from "vitest";

import {
  isTaskOwnedPlaywrightCommand,
  PLAYWRIGHT_SERVER_PORT,
} from "../../scripts/lib/playwright-server";

describe("Playwright server ownership", () => {
  it("recognizes only the repository-owned expected test server", () => {
    const projectRoot = "E:/UniMind Project";

    expect(
      isTaskOwnedPlaywrightCommand(
        `node E:/UniMind Project/node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port ${String(PLAYWRIGHT_SERVER_PORT)}`,
        projectRoot,
      ),
    ).toBe(true);
    expect(
      isTaskOwnedPlaywrightCommand(
        `node "E:/UniMind Project/node_modules/next/dist/bin/next" "dev" "--hostname" "127.0.0.1" "--port" "${String(PLAYWRIGHT_SERVER_PORT)}"`,
        projectRoot,
      ),
    ).toBe(true);
    expect(
      isTaskOwnedPlaywrightCommand(
        `node E:/Other Project/node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port ${String(PLAYWRIGHT_SERVER_PORT)}`,
        projectRoot,
      ),
    ).toBe(false);
    expect(
      isTaskOwnedPlaywrightCommand(
        "node E:/UniMind Project/node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000",
        projectRoot,
      ),
    ).toBe(false);
  });
});
