import { runOwnedPlaywrightServer } from "./lib/playwright-server";

process.exitCode = await runOwnedPlaywrightServer();
