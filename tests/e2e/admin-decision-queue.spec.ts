import { expect, test } from "@playwright/test";

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

test("English desktop containment requires a scoped review and announces success", async ({
  page,
}) => {
  await page.goto("/preview/admin?lang=en&state=containment");
  await expect(
    page.getByRole("heading", { name: "Admin decision queue" }),
  ).toBeVisible();
  await expect(
    page.getByText("Synthetic Anatomy · Cohort A").first(),
  ).toBeVisible();
  await page
    .getByLabel("Reason for this change")
    .fill("Contain this synthetic unit during review.");
  await page.getByRole("button", { name: "Review exact change" }).click();
  const review = page.getByRole("region", { name: "Review before recording" });
  await expect(review).toContainText("a0000000-0000-4000-8000-000000000001");
  await expect(review).toContainText(
    "This unit is hidden from student availability immediately",
  );
  await expect(
    page.getByRole("button", { name: "Submit this action" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Cancel and edit" }).click();
  await expect(
    page.getByRole("button", { name: "Review exact change" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Review exact change" }).click();
  await page.getByRole("button", { name: "Submit this action" }).click();
  await expect(
    page.getByText("The governed change was recorded."),
  ).toBeVisible();
  await expect(
    page.getByText("The governed change was recorded."),
  ).toBeFocused();
});

test("protected and pending founder paths show distinct confirmation state", async ({
  page,
}) => {
  await page.goto("/preview/admin?lang=en&state=protected");
  await page
    .getByLabel("Reason for this change")
    .fill("Publish after synthetic readiness review.");
  await page.getByRole("button", { name: "Review exact change" }).click();
  await expect(
    page.getByRole("region", { name: "Review before recording" }),
  ).toContainText("other verified founder");
  await page.getByRole("button", { name: "Confirm this exact change" }).click();
  await expect(
    page.getByText("needs a distinct founder confirmation."),
  ).toBeVisible();

  await page.goto("/preview/admin?lang=en&state=pending");
  await expect(page.getByText("First confirmation: Ahmed")).toBeVisible();
  await expect(page.getByLabel("Reason for this change")).toHaveAttribute(
    "readonly",
    "",
  );
  await page.getByRole("button", { name: "Review exact change" }).click();
  await expect(
    page.getByRole("button", { name: "Add my separate founder confirmation" }),
  ).toBeVisible();
});

test("blocked readiness remains visible with the action disabled", async ({
  page,
}) => {
  await page.goto("/preview/admin?lang=en&state=blocked");
  await expect(
    page.getByText("At least one source must be active and READY."),
  ).toBeVisible();
  await expect(
    page.getByText("Source rights must be valid now."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Review exact change" }),
  ).toBeDisabled();
});

test("stale and unavailable results preserve a recoverable scoped review", async ({
  page,
}) => {
  for (const [state, message] of [
    ["stale", "This item changed. Reload its current state before acting."],
    [
      "error",
      "The action outcome could not be verified. Reload the current state before retrying.",
    ],
  ] as const) {
    await page.goto(`/preview/admin?lang=en&state=${state}`);
    await page
      .getByLabel("Reason for this change")
      .fill("Contain this synthetic target during review.");
    await page.getByRole("button", { name: "Review exact change" }).click();
    await page.getByRole("button", { name: "Submit this action" }).click();
    await expect(page.getByText(message)).toBeVisible();
    await expect(page.getByText(message)).toBeFocused();
  }
});

test("Arabic mobile review, keyboard and direction retain the exact scope", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/preview/admin?lang=ar&state=containment");
  await expect(page.locator("main")).toHaveAttribute("dir", "rtl");
  await expect(
    page.getByRole("heading", { name: "قائمة قرارات الإدارة" }),
  ).toBeVisible();
  await page
    .getByLabel("سبب هذا التغيير")
    .fill("إخفاء الوحدة التجريبية حتى تنتهي المراجعة.");
  await page.getByRole("button", { name: "مراجعة التغيير المحدد" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "إرسال هذا الإجراء" }),
  ).toBeFocused();
  await expect(
    page.getByRole("region", { name: "راجع قبل التسجيل" }),
  ).toContainText("a0000000-0000-4000-8000-000000000001");
  await page.keyboard.press("Enter");
  await expect(page.getByText("تم تسجيل التغيير الحوكمي.")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test("Arabic mobile pending, stale, and unavailable states stay actionable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/preview/admin?lang=ar&state=pending");
  await expect(page.getByText("التأكيد الأول: أحمد")).toBeVisible();
  await expect(page.getByLabel("سبب هذا التغيير")).toHaveAttribute(
    "readonly",
    "",
  );
  await page.getByRole("button", { name: "مراجعة التغيير المحدد" }).click();
  await expect(
    page.getByRole("button", { name: "إضافة تأكيدي كمؤسس مستقل" }),
  ).toBeFocused();

  for (const [state, message] of [
    ["stale", "تغيّر هذا العنصر. حدّث حالته قبل اتخاذ الإجراء."],
    [
      "error",
      "تعذّر التحقق من نتيجة الإجراء. حدّث الحالة الحالية قبل إعادة المحاولة.",
    ],
  ] as const) {
    await page.goto(`/preview/admin?lang=ar&state=${state}`);
    await page
      .getByLabel("سبب هذا التغيير")
      .fill("إخفاء الوحدة التجريبية حتى تنتهي المراجعة.");
    await page.getByRole("button", { name: "مراجعة التغيير المحدد" }).click();
    await page.getByRole("button", { name: "إرسال هذا الإجراء" }).click();
    await expect(page.getByText(message)).toBeVisible();
    await expect(page.getByText(message)).toBeFocused();
  }
});

test("both locales reflow at desktop and mobile widths", async ({ page }) => {
  for (const [locale, direction, heading] of [
    ["en", "ltr", "Admin decision queue"],
    ["ar", "rtl", "قائمة قرارات الإدارة"],
  ] as const) {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/preview/admin?lang=${locale}&state=containment`);
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
      await expect(page.locator("main")).toHaveAttribute("dir", direction);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
});

test("empty, unavailable, and forbidden queues fail closed", async ({
  page,
}) => {
  for (const [state, heading] of [
    ["empty", "No decisions are waiting"],
    ["unavailable", "Admin queue unavailable"],
    ["forbidden", "Admin access required"],
  ] as const) {
    await page.goto(`/preview/admin?lang=en&state=${state}`);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Review exact change" }),
    ).toHaveCount(0);
  }
});
