import { expect, test } from "@playwright/test";

test("health routes are minimal, uncached, and read-only", async ({
  request,
}) => {
  for (const [path, status] of [
    ["/api/health/live", "live"],
    ["/api/health/ready", "ready"],
  ] as const) {
    const response = await request.get(path);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status });
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["pragma"]).toBe("no-cache");

    const forbiddenWrite = await request.post(path);
    expect(forbiddenWrite.status()).toBe(405);
  }
});

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
