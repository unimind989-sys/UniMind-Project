import { expect, test } from "@playwright/test";

const campaign = "11111111-1111-4111-8111-111111111111";
const base = `/preview/batch-leader/campaigns/${campaign}`;
const collectionExpect = expect.configure({ timeout: 20_000 });
const syntheticPdf = Buffer.from(
  "%PDF-1.7\nSynthetic UniMind fixture only\n",
  "utf8",
);

test.describe.configure({ timeout: 60_000 });

test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (["127.0.0.1", "localhost"].includes(url.hostname)) {
      return route.continue();
    }
    await route.abort("blockedbyclient");
  });
});

test("submits one synthetic file through the validated idempotent boundary", async ({
  page,
}) => {
  let uploadPayload: unknown;
  await page.on("response", async (response) => {
    if (
      response.url().includes("/api/preview/batch-leader/") &&
      response.ok()
    ) {
      uploadPayload = await response.json();
    }
  });
  await page.goto(`${base}?lang=en`);
  await collectionExpect(
    page.getByRole("heading", { name: "Synthetic Anatomy source call" }),
  ).toBeVisible();
  await collectionExpect(page.getByText("Awaiting file")).toBeVisible();
  const stateGuide = page
    .getByRole("heading", { name: "What each status means" })
    .locator("..");
  await collectionExpect(
    stateGuide.getByText("Processing", { exact: true }),
  ).toBeVisible();
  await collectionExpect(
    stateGuide.getByText("Needs information", { exact: true }),
  ).toBeVisible();
  await collectionExpect(
    stateGuide.getByText("Accepted", { exact: true }),
  ).toBeVisible();
  await collectionExpect(
    stateGuide.getByText("Rejected", { exact: true }),
  ).toBeVisible();
  await collectionExpect(
    stateGuide.getByText("Completed", { exact: true }),
  ).toBeVisible();

  await page.getByLabel("Source title").fill("Synthetic Week 3 handout");
  await page
    .getByLabel("Professor or source description")
    .fill("Generated fixture for the bounded WP03 collection flow.");
  await page.locator('input[type="file"]').setInputFiles({
    name: "synthetic-anatomy.pdf",
    mimeType: "text/plain",
    buffer: syntheticPdf,
  });
  await collectionExpect(page.getByText("synthetic-anatomy.pdf")).toBeVisible();
  await collectionExpect(
    page.getByText("PDF", { exact: false }).last(),
  ).toBeVisible();
  await page.getByLabel(/I confirm this synthetic fixture/u).check();
  await page.getByRole("button", { name: "Validate and upload" }).click();
  await collectionExpect(
    page.getByText("Upload evidence verified"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Finalize submission" }).click();
  await collectionExpect(page.getByText("Submission received")).toBeVisible();

  await page
    .getByLabel("Requested item")
    .selectOption("22222222-2222-4222-8222-222222222222");
  await collectionExpect(page.getByLabel("Source title")).toHaveValue("");
  await collectionExpect(
    page.getByLabel(/I confirm this synthetic fixture/u),
  ).not.toBeChecked();
  await collectionExpect(page.getByText("Submission received")).toHaveCount(0);

  expect(uploadPayload).toMatchObject({
    mimeType: "application/pdf",
    byteSize: syntheticPdf.byteLength,
  });
  expect(uploadPayload).not.toHaveProperty("objectKey");
  expect(uploadPayload).not.toHaveProperty("provider");
});

test("preserves the client key across an interrupted upload retry", async ({
  page,
}) => {
  await page.goto(`${base}?lang=en`);
  await page.locator('input[type="file"]').setInputFiles({
    name: "synthetic-anatomy.pdf",
    mimeType: "application/pdf",
    buffer: syntheticPdf,
  });
  const keyBefore = await page
    .locator('input[name="clientIdempotencyKey"]')
    .inputValue();
  await page.route(
    "**/api/preview/batch-leader/**/uploads",
    async (route) => route.abort("internetdisconnected"),
    { times: 1 },
  );
  await page.getByRole("button", { name: "Validate and upload" }).click();
  await collectionExpect(page.getByText(/interrupted/u)).toBeVisible();
  const keyAfterFailure = await page
    .locator('input[name="clientIdempotencyKey"]')
    .inputValue();
  expect(keyAfterFailure).toBe(keyBefore);

  await page.getByRole("button", { name: "Retry upload" }).click();
  await collectionExpect(
    page.getByText("Upload evidence verified"),
  ).toBeVisible();
  expect(
    await page.locator('input[name="clientIdempotencyKey"]').inputValue(),
  ).toBe(keyBefore);
});

test("cancels an in-flight upload without losing the retry key", async ({
  page,
}) => {
  await page.goto(`${base}?lang=en`);
  await page.locator('input[type="file"]').setInputFiles({
    name: "synthetic-anatomy.pdf",
    mimeType: "application/pdf",
    buffer: syntheticPdf,
  });
  const key = await page
    .locator('input[name="clientIdempotencyKey"]')
    .inputValue();
  await page.route("**/api/preview/batch-leader/**/uploads", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    await route.continue();
  });
  await page.getByRole("button", { name: "Validate and upload" }).click();
  await collectionExpect(
    page.getByRole("button", { name: "Cancel upload" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel upload" }).click();
  await collectionExpect(page.getByText(/interrupted/u)).toBeVisible();
  expect(
    await page.locator('input[name="clientIdempotencyKey"]').inputValue(),
  ).toBe(key);
  await collectionExpect(
    page.getByRole("button", { name: "Finalize submission" }),
  ).toHaveCount(0);
  await collectionExpect(page.getByText("Submission received")).toHaveCount(0);
});

test("binds upload receipts and rights to the currently selected file", async ({
  page,
}) => {
  await page.goto(`${base}?lang=en`);
  await page.locator('input[type="file"]').setInputFiles({
    name: "first-synthetic.pdf",
    mimeType: "application/pdf",
    buffer: syntheticPdf,
  });
  await page.getByLabel(/I confirm this synthetic fixture/u).check();
  const firstKey = await page
    .locator('input[name="clientIdempotencyKey"]')
    .inputValue();
  await page.route(
    "**/api/preview/batch-leader/**/uploads",
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
      await route.continue().catch(() => undefined);
    },
    { times: 1 },
  );
  await page.getByRole("button", { name: "Validate and upload" }).click();
  await collectionExpect(
    page.getByRole("button", { name: "Cancel upload" }),
  ).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: "replacement-synthetic.pdf",
    mimeType: "application/pdf",
    buffer: syntheticPdf,
  });
  await collectionExpect(
    page.getByLabel(/I confirm this synthetic fixture/u),
  ).not.toBeChecked();
  await collectionExpect(
    page.getByText("Upload evidence verified"),
  ).toHaveCount(0);
  expect(
    await page.locator('input[name="clientIdempotencyKey"]').inputValue(),
  ).not.toBe(firstKey);

  await page.getByRole("button", { name: "Validate and upload" }).click();
  await collectionExpect(
    page.getByText("Upload evidence verified"),
  ).toBeVisible();
});

test("keeps the collection path reachable by keyboard", async ({ page }) => {
  await page.goto(`${base}?lang=en`);
  const skipLink = page.getByRole("link", { name: "Skip to collection form" });
  await page.keyboard.press("Tab");
  await collectionExpect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await collectionExpect(page.locator("#collection-main")).toBeFocused();

  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press("Tab");
  }
  await collectionExpect(page.locator('input[type="file"]')).toBeFocused();
});

test("keeps mobile Arabic submission readable, reachable, and overflow-free", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}?lang=ar`);
  await collectionExpect(page.locator("html")).toHaveAttribute("lang", "ar");
  await collectionExpect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await collectionExpect(
    page.getByText("مكتب جمع المواد", { exact: true }),
  ).toBeVisible();
  await collectionExpect(page.getByText("في انتظار الملف")).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: "synthetic-anatomy.pdf",
    mimeType: "application/pdf",
    buffer: syntheticPdf,
  });
  const geometry = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    shortControls: Array.from(
      document.querySelectorAll(
        'button,a,select,input:not([type="hidden"]):not([type="file"]):not([type="checkbox"])',
      ),
    )
      .filter((element) => (element as HTMLElement).offsetParent !== null)
      .map((element) => element.getBoundingClientRect().height)
      .filter((height) => height < 44),
  }));
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.shortControls).toEqual([]);
});

test("wrong and expired campaign routes share the non-identifying boundary", async ({
  page,
}) => {
  await page.goto("/preview/batch-leader/campaigns/forged?lang=en");
  await collectionExpect(
    page.getByRole("heading", { name: "Campaign unavailable" }),
  ).toBeVisible();
  await collectionExpect(
    page.getByText("Synthetic Anatomy source call"),
  ).toHaveCount(0);

  await page.goto("/preview/batch-leader/campaigns/forged?lang=ar");
  await collectionExpect(page.locator("main")).toHaveAttribute("dir", "rtl");
  await collectionExpect(
    page.getByRole("heading", { name: "الحملة غير متاحة" }),
  ).toBeVisible();

  await page.goto(`${base}?lang=en&state=expired`);
  await collectionExpect(
    page.getByRole("heading", { name: "Campaign unavailable" }),
  ).toBeVisible();
  await collectionExpect(
    page.getByText("Synthetic Anatomy source call"),
  ).toHaveCount(0);
});
