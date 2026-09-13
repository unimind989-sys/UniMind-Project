import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (["127.0.0.1", "localhost"].includes(url.hostname)) {
      await route.continue();
      return;
    }
    await route.abort("blockedbyclient");
  });
});

test("login presents the selected Access Shelf and supports RTL", async ({
  page,
}) => {
  await page.goto("/login?lang=en&next=%2Flearn%2Frenal");

  await expect(
    page.getByRole("heading", { name: "Your access path" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sign in to UniMind" }),
  ).toBeVisible();
  await expect(page.getByRole("search")).toHaveCount(0);
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "autocomplete",
    "email",
  );
  await expect(page.getByLabel("Password")).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
  await expect(page.locator('input[name="returnPath"]')).toHaveValue(
    "/learn/renal",
  );
  await expect(
    page.locator('[data-surface-direction-contract="33cbfda3"]'),
  ).toHaveCount(1);

  await page.getByRole("link", { name: "عربي" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(
    page.getByRole("heading", { name: "مسار الوصول" }),
  ).toBeVisible();
  await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible();
});

test("a forged return path is replaced before it reaches the form or links", async ({
  page,
}) => {
  await page.goto(
    "/login?next=https%3A%2F%2Fattacker.invalid%2Fsteal&status=not_allowed",
  );

  await expect(page.locator('input[name="returnPath"]')).toHaveValue("/learn");
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  const registrationHref = await page
    .getByRole("link", { name: "Create an account" })
    .getAttribute("href");
  expect(registrationHref).not.toContain("attacker.invalid");
  expect(registrationHref).toContain("%2Flearn");
});

test("invalid login restores focus to a generic summary and marks fields", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("not-an-email");
  await page.getByRole("button", { name: "Continue" }).click();

  const summary = page.getByRole("main").getByRole("alert");
  await expect(summary).toContainText("Check the marked fields");
  await expect(summary).toBeFocused();
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByLabel("Password")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("public link states are bounded and recovery actions are visible", async ({
  page,
}) => {
  await page.goto("/verify-email?status=expired_link");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "link has expired",
  );
  await expect(
    page.getByRole("button", { name: "Resend verification email" }),
  ).toBeVisible();

  await page.goto("/forgot-password?status=replayed_link");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "already been used",
  );
  await expect(
    page.getByRole("button", { name: "Send recovery email" }),
  ).toBeVisible();
});

test("learning and reset routes reject missing verified sessions", async ({
  page,
}) => {
  await page.goto("/learn");
  await expect(page).toHaveURL(/\/login\?lang=en&next=%2Flearn$/u);

  await page.goto("/reset-password");
  await expect(page).toHaveURL(
    /\/forgot-password\?lang=en&status=invalid_link$/u,
  );
});

test("an incomplete callback becomes a generic recoverable link state", async ({
  page,
}) => {
  await page.goto("/auth/callback?next=https%3A%2F%2Fattacker.invalid");
  await expect(page).toHaveURL(/\/verify-email\?status=invalid_link$/u);
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "link is invalid",
  );
});

test("mobile routes center the active stage without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/verify-email?lang=ar");
  await expect(
    page.getByRole("heading", { name: "راجع بريدك الإلكتروني" }),
  ).toBeVisible();

  const activeStage = page.locator('[data-active="true"]');
  await expect
    .poll(async () => (await activeStage.boundingBox())?.x ?? -1)
    .toBeGreaterThanOrEqual(0);
  await expect
    .poll(async () => {
      const rectangle = await activeStage.boundingBox();
      return rectangle === null
        ? Number.POSITIVE_INFINITY
        : rectangle.x + rectangle.width;
    })
    .toBeLessThanOrEqual(390);

  const geometry = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
});
