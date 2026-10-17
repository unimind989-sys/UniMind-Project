import { test as base, type Page } from "@playwright/test";

export { expect } from "@playwright/test";
export type { Locator, Page, TestInfo } from "@playwright/test";

/** Aborts every request that leaves the local test server. */
export async function blockExternalRequests(page: Page) {
  await page.route("**/*", async (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1"
      ? route.continue()
      : route.abort("blockedbyclient"),
  );
}

/** Playwright `test` whose page can only reach the local synthetic server. */
export const test = base.extend({
  page: async ({ page }, provide) => {
    await blockExternalRequests(page);
    await provide(page);
  },
});
