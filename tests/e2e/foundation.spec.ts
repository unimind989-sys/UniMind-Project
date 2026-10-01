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

test("anonymous entry shows the product landing and supplied brand without provider access", async ({
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

  await expect(
    page.getByRole("heading", { name: "Study deeper Go further." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start studying" }),
  ).toHaveAttribute("href", "/register?lang=en");
  await expect(
    page
      .getByRole("banner")
      .getByRole("link", { name: "Sign in", exact: true }),
  ).toHaveAttribute("href", "/login?lang=en");

  const icon = await page.request.get("/icon.svg");
  expect(icon.status()).toBe(200);
  expect(icon.headers()["content-type"]).toContain("image/svg+xml");
});
