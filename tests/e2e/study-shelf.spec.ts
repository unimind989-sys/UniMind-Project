import { expect, test } from "@playwright/test";

const catalogExpect = expect.configure({ timeout: 20_000 });
test.describe.configure({ timeout: 60_000 });

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

async function chooseHumanMedicineFirstYear(
  page: import("@playwright/test").Page,
) {
  await page.goto("/preview/learn");
  await page.getByLabel("Education level").selectOption("university");
  await catalogExpect(page).toHaveURL(/stage=university/u);
  const university = page.locator('select[name="institution"]');
  await catalogExpect(university).toHaveAccessibleName("University");
  await university.selectOption("zagazig-university");
  await catalogExpect(page).toHaveURL(/institution=zagazig-university/u);

  const faculty = page.getByLabel("Faculty / college");
  await catalogExpect(faculty.locator("option")).toHaveText([
    "Choose…",
    "Faculty of Medicine",
    "Faculty of Veterinary Medicine",
  ]);
  await faculty.selectOption("human-medicine");
  await catalogExpect(page).toHaveURL(/program=human-medicine/u, {
    timeout: 10_000,
  });

  const year = page.getByLabel("Academic year");
  await catalogExpect(year.locator("option")).toHaveText([
    "Choose…",
    "First year",
    "Second year",
    "Third year",
  ]);
  await year.selectOption("human-medicine-year-1");
  await catalogExpect(page).toHaveURL(/level=human-medicine-year-1/u, {
    timeout: 10_000,
  });

  const semester = page.getByLabel("Semester");
  await catalogExpect(semester.locator("option")).toHaveText([
    "Choose…",
    "Term 1",
    "Term 2",
  ]);
  await semester.selectOption("human-medicine-year-1-term-1");
  await catalogExpect(page).toHaveURL(/term=human-medicine-year-1-term-1/u, {
    timeout: 10_000,
  });
  await catalogExpect(page).toHaveURL(
    /cohort=zagazig-university-human-medicine-year-1-term-1-cohort/u,
    {
      timeout: 10_000,
    },
  );
}

test("the university journey asks for faculty, academic year, then semester", async ({
  page,
}) => {
  await chooseHumanMedicineFirstYear(page);
  await catalogExpect(page.getByLabel("Education level")).toHaveValue(
    "university",
  );
  await catalogExpect(page.locator('select[name="institution"]')).toHaveValue(
    "zagazig-university",
  );
  await catalogExpect(page.getByLabel("Faculty / college")).toHaveValue(
    "human-medicine",
  );
  await catalogExpect(page.getByLabel("Academic year")).toHaveValue(
    "human-medicine-year-1",
  );
  await catalogExpect(page.getByLabel("Semester")).toHaveValue(
    "human-medicine-year-1-term-1",
  );
  await catalogExpect(
    page.getByRole("button", {
      name: "Select curriculum unit: Biochemistry",
    }),
  ).toBeVisible();
});

test("the veterinary pilot uses the same hierarchy with subject terminology", async ({
  page,
}) => {
  await page.goto("/preview/learn");
  await page.getByLabel("Education level").selectOption("university");
  await page
    .locator('select[name="institution"]')
    .selectOption("zagazig-university");
  await page
    .getByLabel("Faculty / college")
    .selectOption("veterinary-medicine");
  await page
    .getByLabel("Academic year")
    .selectOption("veterinary-medicine-year-1");
  await page
    .getByLabel("Semester")
    .selectOption("veterinary-medicine-year-1-term-1");

  await catalogExpect(
    page.getByRole("heading", { name: "Subjects", exact: true }),
  ).toBeVisible();
  await catalogExpect(
    page.getByRole("button", {
      name: "Select curriculum unit: Veterinary Anatomy",
    }),
  ).toBeVisible();
});

test("the same catalog seam adapts the hierarchy for Thanaweya Amma", async ({
  page,
}) => {
  await page.goto("/preview/learn");
  await page.getByLabel("Education level").selectOption("thanaweya-amma");

  await catalogExpect(page.getByLabel("Education system")).toHaveValue(
    "egyptian-thanaweya-amma",
  );
  await page.getByLabel("Study track").selectOption("science-track");
  await catalogExpect(page.getByLabel("School year")).toHaveValue(
    "science-track-year-3",
  );
  await page.getByLabel("Term").selectOption("science-track-year-3-term-1");

  await catalogExpect(
    page.getByRole("button", { name: "Select curriculum unit: Biology" }),
  ).toBeVisible();
});

test("the server-authorized path clears downstream choices and survives browser history", async ({
  page,
}) => {
  test.setTimeout(30_000);
  await chooseHumanMedicineFirstYear(page);

  const unit = page.getByRole("button", {
    name: "Select curriculum unit: Biochemistry",
  });
  await unit.focus();
  await page.keyboard.press("Enter");
  await catalogExpect(page).toHaveURL(
    /unit=zagazig-university-human-medicine-y1-t1-biochemistry/u,
  );
  await catalogExpect(unit).toHaveAttribute("aria-pressed", "true");
  await catalogExpect(page.getByText("11", { exact: true })).toBeVisible();
  await catalogExpect(
    page.getByRole("button", { name: "Workspace follows in WP03-T04" }),
  ).toBeDisabled();

  await page.reload();
  await catalogExpect(page).toHaveURL(
    /unit=zagazig-university-human-medicine-y1-t1-biochemistry/u,
  );
  await catalogExpect(unit).toHaveAttribute("aria-pressed", "true");

  await page.goBack();
  await catalogExpect(page).not.toHaveURL(
    /unit=zagazig-university-human-medicine-y1-t1-biochemistry/u,
  );
  await catalogExpect(unit).toHaveAttribute("aria-pressed", "false");
  await page.goForward();
  await catalogExpect(page).toHaveURL(
    /unit=zagazig-university-human-medicine-y1-t1-biochemistry/u,
  );

  await page.getByLabel("Academic year").selectOption("human-medicine-year-3");
  await catalogExpect(page).toHaveURL(/level=human-medicine-year-3/u);
  await catalogExpect(page).not.toHaveURL(
    /unit=zagazig-university-human-medicine-y1-t1-biochemistry/u,
  );
  await catalogExpect(page).not.toHaveURL(/term=human-medicine-year-1-term-1/u);
  await page
    .getByLabel("Semester")
    .selectOption("human-medicine-year-3-term-1");
  await catalogExpect(
    page.getByRole("button", {
      name: "Select curriculum unit: Anatomy",
    }),
  ).toBeVisible();
});

test("forged and stale deep links are reduced to the authorized canonical path", async ({
  page,
}) => {
  await page.goto(
    "/preview/learn?lang=en&stage=university&institution=zagazig-university&program=human-medicine&level=forged-level&term=human-medicine-year-1-term-1&cohort=forged-cohort&unit=forged-unit",
  );

  await catalogExpect(page).toHaveURL(/program=human-medicine/u);
  await catalogExpect(page).not.toHaveURL(
    /forged-level|human-medicine-year-1-term-1|forged-cohort|forged-unit/u,
  );
  await catalogExpect(
    page.getByText("Continue your authorized path"),
  ).toBeVisible();
  await catalogExpect(page.getByText("Anatomy", { exact: true })).toHaveCount(
    0,
  );
});

test("a pending server navigation prevents an interrupted duplicate selection", async ({
  page,
}) => {
  await page.goto("/preview/learn");
  await page.getByLabel("Education level").selectOption("university");
  await catalogExpect(page).toHaveURL(/stage=university/u);
  await page
    .locator('select[name="institution"]')
    .selectOption("zagazig-university");
  await catalogExpect(page).toHaveURL(/institution=zagazig-university/u);
  await page.getByLabel("Faculty / college").selectOption("human-medicine");
  await catalogExpect(page).toHaveURL(/program=human-medicine/u);
  await catalogExpect(page.getByLabel("Academic year")).toBeEnabled();

  let releaseNavigation: (() => void) | undefined;
  const navigationReleased = new Promise<void>((resolve) => {
    releaseNavigation = resolve;
  });
  await page.route(
    "**/preview/learn?*level=human-medicine-year-2*",
    async (route) => {
      await navigationReleased;
      await route.continue();
    },
  );

  await page.getByLabel("Academic year").selectOption("human-medicine-year-2");
  await catalogExpect(page.locator("[aria-busy='true']")).toBeVisible();
  await catalogExpect(page.getByLabel("Academic year")).toBeDisabled();
  releaseNavigation?.();

  await catalogExpect(page).toHaveURL(/level=human-medicine-year-2/u);
  await catalogExpect(page.getByLabel("Academic year")).toHaveValue(
    "human-medicine-year-2",
  );
  await catalogExpect(page.locator("[aria-busy='false']")).toBeVisible();
});

test("a valid direct deep link remains stable and locale switching preserves scope", async ({
  page,
}) => {
  await page.goto(
    "/preview/learn?lang=en&stage=university&institution=zagazig-university&program=human-medicine&level=human-medicine-year-1&term=human-medicine-year-1-term-1&cohort=zagazig-university-human-medicine-year-1-term-1-cohort&unit=zagazig-university-human-medicine-y1-t1-anatomy",
  );
  await catalogExpect(page).toHaveURL(
    /unit=zagazig-university-human-medicine-y1-t1-anatomy/u,
  );
  await catalogExpect(page.getByText("Anatomy", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "عربي" }).click();
  await catalogExpect(page).toHaveURL(/lang=ar/u);
  await catalogExpect(page).toHaveURL(
    /unit=zagazig-university-human-medicine-y1-t1-anatomy/u,
  );
  await catalogExpect(page.locator("html")).toHaveAttribute("lang", "ar");
  await catalogExpect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await catalogExpect(
    page.getByRole("heading", { name: "وحداتك" }),
  ).toBeVisible();
  await catalogExpect(
    page.getByRole("heading", { name: "Your Modules" }),
  ).toHaveCount(0);
  await catalogExpect(
    page.getByText("علم التشريح", { exact: true }),
  ).toBeVisible();
  await catalogExpect(page.getByText("Anatomy", { exact: true })).toHaveCount(
    0,
  );

  await page.getByLabel("ابحث في الفهرس التجريبي").fill("وظائف");
  await catalogExpect(
    page.getByText("وظائف الأعضاء", { exact: true }),
  ).toBeVisible();
  await catalogExpect(
    page.getByText("علم التشريح", { exact: true }),
  ).toHaveCount(0);
});

test("safe empty and release-change states expose no catalog identifiers", async ({
  page,
}) => {
  test.setTimeout(30_000);
  await chooseHumanMedicineFirstYear(page);
  await catalogExpect(
    page.getByText("Biochemistry", { exact: true }),
  ).toBeVisible();

  const lockedUrl = new URL(page.url());
  lockedUrl.searchParams.set("state", "locked");
  await page.goto(`${lockedUrl.pathname}${lockedUrl.search}`);
  await catalogExpect(
    page.getByText("Your cohort is not open yet"),
  ).toBeVisible();
  await catalogExpect(page).not.toHaveURL(
    /stage=|institution=|program=|level=/u,
  );
  await catalogExpect(
    page.getByText("Biochemistry", { exact: true }),
  ).toHaveCount(0);
  await catalogExpect(page.getByLabel("Education level")).toHaveCount(0);

  await page.goto("/preview/learn?lang=en&state=no-membership");
  await catalogExpect(
    page.getByText("No active learning membership"),
  ).toBeVisible();

  await page.goto("/preview/learn?lang=en&state=unpublished");
  await catalogExpect(
    page.getByText("Units are still being prepared"),
  ).toBeVisible();

  await page.goto("/preview/learn?lang=en&state=no-ready-source");
  await catalogExpect(
    page.getByText("Approved material is not ready yet"),
  ).toBeVisible();

  await page.goto("/preview/learn?lang=en&state=error");
  await catalogExpect(page.locator("section[role='alert']")).toContainText(
    "We could not check your catalog",
  );
});

test("the mobile catalog keeps touch targets, focus, and page width intact", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await chooseHumanMedicineFirstYear(page);

  const levelSelect = page.getByLabel("Academic year");
  await levelSelect.focus();
  await catalogExpect(levelSelect).toBeFocused();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    controls: Array.from(document.querySelectorAll("select, button")).map(
      (element) => element.getBoundingClientRect().height,
    ),
  }));

  catalogExpect(dimensions.documentWidth).toBeLessThanOrEqual(
    dimensions.viewportWidth,
  );
  catalogExpect(
    Math.min(...dimensions.controls.filter((height) => height > 0)),
  ).toBeGreaterThanOrEqual(44);

  const navigation = page.getByRole("navigation", {
    name: "Product navigation",
  });
  const navigationGeometry = await navigation.evaluate((element) => {
    const listRectangle = element.querySelector("ul")?.getBoundingClientRect();
    const items = Array.from(element.querySelectorAll("li"));
    return {
      listLeft: listRectangle?.left ?? 0,
      listWidth: listRectangle?.width ?? 0,
      centers: items.map((item) => {
        const rectangle = item.getBoundingClientRect();
        return rectangle.left + rectangle.width / 2;
      }),
      widths: items.map((item) => item.getBoundingClientRect().width),
      iconOffsets: items.map((item) => {
        const itemRectangle = item.getBoundingClientRect();
        const iconRectangle = item
          .querySelector("svg")
          ?.getBoundingClientRect();
        return iconRectangle
          ? iconRectangle.left +
              iconRectangle.width / 2 -
              (itemRectangle.left + itemRectangle.width / 2)
          : Number.POSITIVE_INFINITY;
      }),
    };
  });
  catalogExpect(navigationGeometry.centers).toHaveLength(6);
  navigationGeometry.centers.forEach((center, index) => {
    const expectedCenter =
      navigationGeometry.listLeft +
      (navigationGeometry.listWidth / 6) * (index + 0.5);
    catalogExpect(Math.abs(center - expectedCenter)).toBeLessThanOrEqual(1);
  });
  catalogExpect(
    Math.max(...navigationGeometry.widths) -
      Math.min(...navigationGeometry.widths),
  ).toBeLessThanOrEqual(1);
  navigationGeometry.iconOffsets.forEach((offset) => {
    catalogExpect(Math.abs(offset)).toBeLessThanOrEqual(1);
  });
});

test("reduced motion removes the authored shelf and loading animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await chooseHumanMedicineFirstYear(page);
  const firstUnit = page.getByRole("button", {
    name: "Select curriculum unit: Anatomy",
  });
  await firstUnit.focus();
  await page.keyboard.press("Enter");
  await catalogExpect(firstUnit).toHaveAttribute("aria-pressed", "true");

  await catalogExpect(page.getByRole("main")).toBeVisible();
  await catalogExpect(
    page.getByRole("navigation", { name: "Product navigation" }),
  ).toBeVisible();
  await catalogExpect(
    page.getByRole("searchbox", { name: "Search the synthetic catalog" }),
  ).toBeVisible();
  await catalogExpect(
    page.getByRole("link", { name: "Study Shelf" }),
  ).toHaveAttribute("aria-current", "page");

  const animation = await page.evaluate(() => {
    function relativeLuminance(color: string) {
      const [red = 0, green = 0, blue = 0] =
        color
          .match(/[\d.]+/gu)
          ?.slice(0, 3)
          .map(Number) ?? [];
      return [red, green, blue]
        .map((channel) => channel / 255)
        .map((channel) =>
          channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4,
        )
        .reduce(
          (total, channel, index) =>
            total + channel * ([0.2126, 0.7152, 0.0722][index] ?? 0),
          0,
        );
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

    const item = document.querySelector<HTMLElement>("[data-focused='true']");
    const image = item?.querySelector<HTMLElement>("img");
    const ready = item?.querySelector<HTMLElement>("[role='status']");
    const bodyStyle = getComputedStyle(document.body);
    const readyStyle = ready ? getComputedStyle(ready) : null;
    return {
      item: item ? getComputedStyle(item).transitionDuration : "missing",
      image: image ? getComputedStyle(image).transitionDuration : "missing",
      bodyContrast: contrast(bodyStyle.color, bodyStyle.backgroundColor),
      readyContrast: readyStyle
        ? contrast(readyStyle.color, readyStyle.backgroundColor)
        : 0,
    };
  });

  catalogExpect(animation.item).toBe("0s");
  catalogExpect(animation.image).toBe("0s");
  catalogExpect(animation.bodyContrast).toBeGreaterThanOrEqual(4.5);
  catalogExpect(animation.readyContrast).toBeGreaterThanOrEqual(4.5);
});
