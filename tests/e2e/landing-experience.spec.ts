import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing preview explains the study loop with local, keyboard-accessible controls", async ({
  page,
}) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    if (!["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname))
      externalRequests.push(request.url());
  });
  await page.route("**/*", async (route) => {
    if (
      ["127.0.0.1", "localhost"].includes(
        new URL(route.request().url()).hostname,
      )
    )
      await route.continue();
    else await route.abort();
  });
  await page.goto("/?lang=en");
  await expect(
    page.getByRole("heading", { name: "Study deeper Go further." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Explore the layers|Bring it together/ }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "View supporting material" }).click();
  await expect(
    page.getByText("Lecture notes · sample excerpt", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "View supporting material" }).click();
  await expect(
    page.getByText("Lecture notes · sample excerpt", { exact: true }),
  ).toHaveCount(0);

  await page
    .getByRole("tab", { name: "Chat", exact: true })
    .press("ArrowRight");
  const studio = page.getByRole("tab", { name: "Studio", exact: true });
  await expect(studio).toBeFocused();
  await expect(studio).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: /Sample flashcard/ }).click();
  await expect(
    page.getByRole("button", { name: /Sample answer/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await studio.press("End");
  await expect(
    page.getByRole("tab", { name: "Quiz", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("radio", { name: "Where is this structure located?" })
    .check();
  await expect(page.getByRole("status")).toContainText("Try again.");
  await page
    .getByRole("radio", { name: "How does this structure function?" })
    .check();
  await expect(page.getByRole("status")).toContainText("Correct.");
  await page.getByRole("tab", { name: "Quiz", exact: true }).press("Home");
  await expect(
    page.getByRole("tab", { name: "Chat", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("link", { name: "Start studying", exact: true }),
  ).toHaveAttribute("href", "/register?lang=en");
  await expect(
    page.getByRole("link", { name: "Create your account", exact: true }).last(),
  ).toHaveAttribute("href", "/register?lang=en");
  expect(externalRequests).toEqual([]);
});

test("folio moves without input, ignores the pointer and pauses when offscreen or hidden", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?lang=en");
  const atlas = page.locator("[data-motion]");
  await expect(atlas).toHaveAttribute("data-motion", "running");
  const stage = atlas.locator("[aria-hidden='true'] > div").nth(1);
  const initialTransform = await stage.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await expect
    .poll(async () =>
      stage.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe(initialTransform);

  // Freeze time to distinguish autonomous animation from pointer-driven perspective.
  // pause() stays pending until the next frame; wait so the hold time is fixed.
  await atlas.evaluate(async (element) => {
    const animations = element.getAnimations({ subtree: true });
    for (const animation of animations) animation.pause();
    await Promise.all(animations.map((animation) => animation.ready));
  });
  const pausedTransform = await stage.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await atlas.hover({ position: { x: 30, y: 30 } });
  await atlas.hover({ position: { x: 180, y: 180 } });
  expect(
    await stage.evaluate((element) => getComputedStyle(element).transform),
  ).toBe(pausedTransform);

  await page
    .getByRole("heading", { name: "How it works", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(atlas).toHaveAttribute("data-motion", "paused");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(atlas).toHaveAttribute("data-motion", "running");
  // Simulate the document lifecycle signal, independently of browser focus automation.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(atlas).toHaveAttribute("data-motion", "paused");
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(atlas).toHaveAttribute("data-motion", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(atlas).toHaveAttribute("data-motion", "paused");
  expect(
    await atlas.evaluate(
      (element) => element.getAnimations({ subtree: true }).length,
    ),
  ).toBe(0);
});

for (const locale of ["en", "ar"] as const) {
  for (const theme of ["light", "dark"] as const) {
    test(
      "landing " +
        locale +
        " " +
        theme +
        " has accessible reflow and reduced motion",
      async ({ page }) => {
        await page.emulateMedia({
          reducedMotion: "reduce",
          colorScheme: theme,
        });
        await page.goto("/?lang=" + locale);
        // DOM theme injection is test setup, avoiding dependence on a user's persisted preference.
        await page.evaluate(
          (value) => document.documentElement.setAttribute("data-theme", value),
          theme,
        );
        for (const width of [1440, 768, 390, 320]) {
          await page.setViewportSize({ width, height: 900 });
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= window.innerWidth,
            ),
          ).toBe(true);
        }
        await expect(page.locator("main").locator("..")).toHaveAttribute(
          "dir",
          locale === "ar" ? "rtl" : "ltr",
        );
        await page
          .getByRole("tab", {
            name: locale === "en" ? "Chat" : "الدردشة",
            exact: true,
          })
          .press(locale === "en" ? "ArrowRight" : "ArrowLeft");
        await expect(
          page.getByRole("tab", {
            name: locale === "en" ? "Studio" : "الاستوديو",
            exact: true,
          }),
        ).toBeFocused();
        expect(
          await page
            .locator("[aria-hidden='true']")
            .evaluateAll(
              (nodes) =>
                nodes.flatMap((node) =>
                  Array.from(node.getAnimations({ subtree: true })),
                ).length,
            ),
        ).toBe(0);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(results.violations).toEqual([]);
        // Text enlargement must preserve the primary action and tab controls without horizontal scrolling.
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
        await expect(
          page.getByRole("link", {
            name: locale === "en" ? "Start studying" : "ابدأ المذاكرة",
            exact: true,
          }),
        ).toBeVisible();
        await page
          .getByRole("tab", {
            name: locale === "en" ? "Quiz" : "الاختبار",
            exact: true,
          })
          .click();
        await expect(page.getByRole("radio").first()).toBeVisible();
        const clippedControls = await page
          .locator("header a, main a, main button, footer a")
          .evaluateAll((controls) =>
            controls.flatMap((control) => {
              const box = control.getBoundingClientRect();
              if (!box.width || !box.height) return [];
              return box.left < -1 || box.right > window.innerWidth + 1
                ? [control.textContent?.trim() ?? "Unnamed control"]
                : [];
            }),
          );
        expect(clippedControls).toEqual([]);
      },
    );
  }
}

test("landing content and account links are delivered in the server response", async ({
  request,
}) => {
  const response = await request.get("/?lang=en");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('<h1 id="landing-title"');
  expect(html).toContain("Study deeper");
  expect(html).toContain("Go further.");
  expect(html).toContain('href="/register?lang=en"');
});
