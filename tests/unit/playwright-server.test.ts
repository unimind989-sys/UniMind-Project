import { describe, expect, it } from "vitest";

import {
  isTaskOwnedPlaywrightCommand,
  PLAYWRIGHT_SERVER_PORT,
  resolvePlaywrightServerPort,
} from "../../scripts/lib/playwright-server";

describe("Playwright server ownership", () => {
  it("accepts a bounded alternate test port", () => {
    expect(resolvePlaywrightServerPort(undefined)).toBe(PLAYWRIGHT_SERVER_PORT);
    expect(resolvePlaywrightServerPort("3101")).toBe(3101);
    expect(() => resolvePlaywrightServerPort("3100; Stop-Process")).toThrow();
    expect(() => resolvePlaywrightServerPort("0")).toThrow();
  });

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
    expect(
      isTaskOwnedPlaywrightCommand(
        "node E:/UniMind Project/node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3101",
        projectRoot,
        3101,
      ),
    ).toBe(true);
    expect(
      isTaskOwnedPlaywrightCommand(
        "node E:/UniMind Project/node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100",
        projectRoot,
        3101,
      ),
    ).toBe(false);
  });
});
