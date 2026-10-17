import AxeBuilder from "@axe-core/playwright";
import { locales, type Locale } from "./copy";
import { expect, type Locator, type Page } from "./test";

export const themes = ["light", "dark"] as const;
export type Theme = (typeof themes)[number];

/** Desktop, phone and the narrowest supported reflow width. */
export const layoutWidths = [1440, 390, 320] as const;

export const wcagTags = ["wcag2a", "wcag2aa", "wcag21aa"] as const;

/** Defines one test (or block of tests) per locale and colour scheme. */
export function forEachLocaleTheme(
  define: (locale: Locale, theme: Theme) => void,
  selected: readonly Locale[] = locales,
) {
  for (const locale of selected)
    for (const theme of themes) define(locale, theme);
}

/** Emulates a colour scheme (and reduced motion) for the current page. */
export async function applyTheme(page: Page, theme: Theme) {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
}

/**
 * Waits two animation frames. The product shell re-measures on the frame after
 * a resize or font change, so geometry is read only once it has settled.
 */
export async function settle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

/** Resizes the viewport and waits for the shell to re-measure. */
export async function resize(page: Page, width: number, height = 900) {
  await page.setViewportSize({ width, height });
  await settle(page);
}

/** The document never scrolls horizontally at the current viewport. */
export async function expectReflow(page: Page, { strict = false } = {}) {
  expect(
    await page.evaluate(
      (tolerance) =>
        document.documentElement.scrollWidth <= innerWidth + tolerance,
      strict ? 0 : 1,
    ),
  ).toBe(true);
}

/** Runs `inspect` with the root font enlarged to 200%, then restores it. */
export async function withEnlargedText<T>(
  page: Page,
  inspect: () => Promise<T>,
): Promise<T> {
  const style = await page.addStyleTag({
    content: "html { font-size: 200% !important; }",
  });
  try {
    await settle(page);
    return await inspect();
  } finally {
    await style.evaluate((element) => element.parentNode?.removeChild(element));
    await settle(page);
  }
}

export type AxeOptions = {
  /** CSS selector to scope the audit; the whole page when omitted. */
  include?: string;
  /** Rule tags; `"all"` runs every rule including best practices. */
  tags?: readonly string[] | "all";
};

/** The page (or `include` region) has no axe violations. */
export async function expectAxe(page: Page, options: AxeOptions = {}) {
  let builder = new AxeBuilder({ page });
  if (options.include) builder = builder.include(options.include);
  const tags = options.tags ?? wcagTags;
  if (tags !== "all") builder = builder.withTags([...tags]);
  expect((await builder.analyze()).violations).toEqual([]);
}

/** Every listed target is visible and (once laid out) at least 44px tall. */
export async function expectTargets(targets: readonly Locator[], min = 44) {
  for (const target of targets) {
    await expect(target).toBeVisible();
    await expect
      .poll(async () => (await target.boundingBox())?.height ?? 0)
      .toBeGreaterThanOrEqual(min);
  }
}

/**
 * The bounding box of a visible element, read in one step so a shell
 * re-render between "is it laid out?" and "measure it" cannot return null.
 */
export async function boxOf(target: Locator) {
  const read: { box: Awaited<ReturnType<Locator["boundingBox"]>> } = {
    box: null,
  };
  await expect
    .poll(async () => {
      read.box = await target.boundingBox();
      return read.box !== null;
    })
    .toBe(true);
  return read.box!;
}
