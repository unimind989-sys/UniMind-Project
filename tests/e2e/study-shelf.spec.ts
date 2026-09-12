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

test("the Study Shelf renders one active language with focus and search", async ({
  page,
}) => {
  await page.goto("/learn");

  await expect(
    page.getByRole("heading", { name: "Your Modules" }),
  ).toBeVisible();
  await expect(
    page.getByText("Synthetic foundation preview", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("وحداتك", { exact: true })).toHaveCount(0);
  await expect(page.getByText("مكتبة الدراسة", { exact: true })).toHaveCount(0);

  const renalUnit = page.getByRole("button", {
    name: "Focus unit: Renal Module",
  });
  await renalUnit.focus();
  await page.keyboard.press("Enter");
  await expect(renalUnit).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", {
      name: "Workspace follows in WP03-T03",
    }),
  ).toBeDisabled();
  await expect(page.getByText("Ready", { exact: true })).toBeVisible();
  await expect(page.getByText("جاهز", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText("Approved sources", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("مصدرًا معتمدًا", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByText("Cohort scope", { exact: true })).toBeVisible();
  await expect(page.getByText("نطاق المجموعة", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "عربي" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByText("وحداتك", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your Modules" })).toHaveCount(
    0,
  );
  await expect(
    page.getByText("وحدة الجهاز البولي", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Renal Module", { exact: true })).toHaveCount(0);
  await expect(page.getByText("جاهز", { exact: true })).toBeVisible();
  await expect(page.getByText("Ready", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText("معاينة تأسيسية ببيانات تجريبية", { exact: true }),
  ).toBeVisible();

  const searchGeometry = await page.evaluate(() => {
    const form = document.querySelector<HTMLElement>('[role="search"]');
    const icon = form?.querySelector<SVGElement>("svg");
    const input = form?.querySelector<HTMLInputElement>("input");
    const iconRect = icon?.getBoundingClientRect();
    const inputRect = input?.getBoundingClientRect();

    return {
      gap:
        iconRect && inputRect
          ? iconRect.left - inputRect.right
          : Number.NEGATIVE_INFINITY,
    };
  });

  expect(searchGeometry.gap).toBeGreaterThanOrEqual(8);

  await page.getByLabel("ابحث في الفهرس التجريبي").fill("الكيمياء");
  await expect(
    page.getByText("الكيمياء الحيوية", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("وحدة الجهاز القلبي الوعائي", { exact: true }),
  ).toHaveCount(0);
});

test("the mobile composition contains horizontal rails without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn");
  await page.waitForTimeout(500);

  await expect(
    page.getByRole("navigation", { name: "Product navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your Modules" }),
  ).toBeVisible();

  const dimensions = await page.evaluate(() => {
    const focused = document.querySelector<HTMLElement>(
      '[data-focused="true"]',
    );
    const focusedRect = focused?.getBoundingClientRect();

    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      focusedLeft: focusedRect?.left ?? -1,
      focusedRight: focusedRect?.right ?? Number.POSITIVE_INFINITY,
    };
  });

  expect(dimensions.documentWidth).toBeLessThanOrEqual(
    dimensions.viewportWidth,
  );
  expect(dimensions.focusedLeft).toBeGreaterThanOrEqual(0);
  expect(dimensions.focusedRight).toBeLessThanOrEqual(dimensions.viewportWidth);

  const navigationGeometry = await page
    .getByRole("navigation", { name: "Product navigation" })
    .evaluate((navigation) => {
      const list = navigation.querySelector("ul");
      const listRect = list?.getBoundingClientRect();
      const itemRects = Array.from(navigation.querySelectorAll("li")).map(
        (item) => item.getBoundingClientRect(),
      );

      return {
        listLeft: listRect?.left ?? 0,
        listWidth: listRect?.width ?? 0,
        centers: itemRects.map((rect) => rect.left + rect.width / 2),
        widths: itemRects.map((rect) => rect.width),
        iconCenterOffsets: Array.from(navigation.querySelectorAll("li")).map(
          (item) => {
            const itemRect = item.getBoundingClientRect();
            const iconRect = item.querySelector("svg")?.getBoundingClientRect();

            return iconRect
              ? iconRect.left +
                  iconRect.width / 2 -
                  (itemRect.left + itemRect.width / 2)
              : Number.POSITIVE_INFINITY;
          },
        ),
      };
    });

  expect(navigationGeometry.centers).toHaveLength(6);
  navigationGeometry.centers.forEach((center, index) => {
    const expectedCenter =
      navigationGeometry.listLeft +
      (navigationGeometry.listWidth / 6) * (index + 0.5);
    expect(Math.abs(center - expectedCenter)).toBeLessThanOrEqual(1);
  });
  expect(
    Math.max(...navigationGeometry.widths) -
      Math.min(...navigationGeometry.widths),
  ).toBeLessThanOrEqual(1);
  navigationGeometry.iconCenterOffsets.forEach((offset) => {
    expect(Math.abs(offset)).toBeLessThanOrEqual(1);
  });

  for (const button of await page
    .getByRole("group", { name: "Language" })
    .getByRole("button")
    .all()) {
    const box = await button.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
  }
});

test("the shelf exposes accessible structure, contrast, and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn");

  await expect(page.getByRole("main")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Product navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: "Search the synthetic catalog" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Study Shelf" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("status").first()).toBeVisible();

  const audit = await page.evaluate(() => {
    function relativeLuminance(color: string) {
      const channels = color
        .match(/[\d.]+/gu)
        ?.slice(0, 3)
        .map(Number)
        .map((channel) => channel / 255)
        .map((channel) =>
          channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4,
        );

      if (channels === undefined || channels.length !== 3) return 0;
      const [red = 0, green = 0, blue = 0] = channels;
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    }

    function contrast(foreground: string, background: string) {
      const light = Math.max(
        relativeLuminance(foreground),
        relativeLuminance(background),
      );
      const dark = Math.min(
        relativeLuminance(foreground),
        relativeLuminance(background),
      );
      return (light + 0.05) / (dark + 0.05);
    }

    const bodyStyle = getComputedStyle(document.body);
    const ready = document.querySelector<HTMLElement>('[role="status"]');
    const readyStyle = ready === null ? null : getComputedStyle(ready);
    const focused = document.querySelector<HTMLElement>(
      '[data-focused="true"]',
    );
    const focusedImage = focused?.querySelector<HTMLElement>("img");

    return {
      bodyContrast: contrast(bodyStyle.color, bodyStyle.backgroundColor),
      readyContrast:
        readyStyle === null
          ? 0
          : contrast(readyStyle.color, readyStyle.backgroundColor),
      itemTransition: focused
        ? getComputedStyle(focused).transitionDuration
        : "missing",
      imageTransition: focusedImage
        ? getComputedStyle(focusedImage).transitionDuration
        : "missing",
    };
  });

  expect(audit.bodyContrast).toBeGreaterThanOrEqual(4.5);
  expect(audit.readyContrast).toBeGreaterThanOrEqual(4.5);
  expect(audit.itemTransition).toBe("0s");
  expect(audit.imageTransition).toBe("0s");
});
