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
    page.getByText("Lecture 6 handout, page 14", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "View supporting material" }).click();
  await expect(
    page.getByText("Lecture 6 handout, page 14", { exact: true }),
  ).toHaveCount(0);

  await page
    .getByRole("tab", { name: "Chat", exact: true })
    .press("ArrowRight");
  const studio = page.getByRole("tab", { name: "Studio", exact: true });
  await expect(studio).toBeFocused();
  await expect(studio).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: /Sample flashcard/ }).click();
  // The name follows the turned card, with no contradicting pressed state
  // (WP03-T29 IX-16).
  const turned = page.getByRole("button", { name: /Sample answer/ });
  await expect(turned).toHaveAccessibleName(/Show question/u);
  await expect(turned).not.toHaveAttribute("aria-pressed");
  await studio.press("End");
  await expect(
    page.getByRole("tab", { name: "Quiz", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("radio", { name: "Claw hand with wasted small muscles" })
    .check();
  await expect(page.getByRole("status")).toContainText("Try again.");
  await page
    .getByRole("radio", { name: "Arm adducted and medially rotated" })
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

test("evidence moment plays once on view, replays, ignores the pointer and pauses when offscreen or hidden", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  // Opened below the hero, the moment waits until it is first seen.
  await page.goto("/?lang=en#how-it-works");
  const moment = page.locator("[data-moment]");
  // Measured offscreen after hydration, it still waits.
  await expect(moment).toHaveAttribute("data-measured", "true");
  await expect(moment).toHaveAttribute("data-moment", "waiting");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(moment).toHaveAttribute("data-moment", "playing");
  await expect(moment).toHaveAttribute("data-paused", "false");
  // It plays once, then settles on the final composition without looping.
  await expect(moment).toHaveAttribute("data-moment", "done", {
    timeout: 10_000,
  });
  const transforms = () =>
    moment.evaluate((element) =>
      Array.from(
        element.querySelectorAll("*"),
        (step) => getComputedStyle(step).transform,
      ),
    );
  const settled = await transforms();
  await moment.hover({ position: { x: 30, y: 30 } });
  await moment.hover({ position: { x: 180, y: 180 } });
  // The pointer moves nothing (the tilted handout included) and starts nothing.
  expect(await transforms()).toEqual(settled);
  expect(
    await moment.evaluate(
      (element) => element.getAnimations({ subtree: true }).length,
    ),
  ).toBe(0);

  await page.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(moment).toHaveAttribute("data-moment", "playing");
  await page
    .getByRole("heading", { name: "How it works", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(moment).toHaveAttribute("data-paused", "true");
  // Nothing moves while the stage is offscreen.
  expect(
    await moment.evaluate((element) =>
      element
        .getAnimations({ subtree: true })
        .some((animation) => animation.playState === "running"),
    ),
  ).toBe(false);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(moment).toHaveAttribute("data-paused", "false");
  // Simulate the document lifecycle signal, independently of browser focus automation.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(moment).toHaveAttribute("data-paused", "true");
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(moment).toHaveAttribute("data-paused", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(moment).toHaveAttribute("data-moment", "still");
  await expect(
    page.getByRole("button", { name: "Replay", exact: true }),
  ).toBeHidden();
  await expect(
    page.getByText("Sample answer from invented lecture notes", {
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await moment.evaluate(
      (element) => element.getAnimations({ subtree: true }).length,
    ),
  ).toBe(0);
});

test("landing sections reveal once on first view and rest; reduced motion shows the final layout at once", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?lang=en");
  const reveals = page.locator("[data-reveal]");
  await expect(reveals).toHaveCount(7);
  // Before hydration marks the first view, sections below the hero wait.
  await expect(page.locator('[data-reveal="out"]').last()).toHaveAttribute(
    "data-reveal",
    "out",
  );
  const closing = page.getByRole("heading", {
    name: "Open your next subject.",
  });
  await closing.scrollIntoViewIfNeeded();
  await expect(reveals.last()).toHaveAttribute("data-reveal", "in");
  // Once seen, a section settles in its natural state with no animation left
  // in effect, and it never goes back to waiting.
  await expect
    .poll(() =>
      reveals
        .last()
        .evaluate(
          (element) =>
            element.getAnimations({ subtree: true }).length === 0 &&
            getComputedStyle(element).opacity === "1",
        ),
    )
    .toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(reveals.last()).toHaveAttribute("data-reveal", "in");
  // The staggered lists arrive in reading order (each is scrolled into view
  // first, since a clamped scroll position may not have shown both).
  for (const list of await page.locator("[data-reveal][data-stagger]").all()) {
    await list.scrollIntoViewIfNeeded();
    await expect(list).toHaveAttribute("data-reveal", "in");
  }
  expect(
    await page
      .locator("[data-reveal][data-stagger] > *")
      .evaluateAll((nodes) =>
        nodes.map((node) => getComputedStyle(node).animationDelay),
      ),
  ).toEqual(["0s", "0.07s", "0.14s", "0s", "0.07s", "0.14s"]);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  // Every section is in place without scrolling and nothing animates.
  await expect(reveals).toHaveCount(7);
  for (const section of await reveals.all())
    await expect(section).toHaveAttribute("data-reveal", "done");
  expect(
    await reveals.evaluateAll((nodes) =>
      nodes.every((node) => getComputedStyle(node).opacity === "1"),
    ),
  ).toBe(true);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
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
