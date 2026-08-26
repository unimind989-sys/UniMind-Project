import { expect, test } from "@playwright/test";

test("foundation stays synthetic and mock-only in the browser", async ({
  page,
}) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (["127.0.0.1", "localhost"].includes(url.hostname)) {
      await route.continue();
      return;
    }
    await route.abort("blockedbyclient");
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "UniMind" })).toBeVisible();
  await expect(page.getByText("Synthetic only", { exact: true })).toBeVisible();
  await expect(page.getByText("Mock only", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Approved real mode", { exact: true }),
  ).toHaveCount(0);
});
