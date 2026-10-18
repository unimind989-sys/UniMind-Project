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

/**
 * `resize` for a page whose fake clock is paused (`page.clock.pauseAt`).
 * Animation frames then run only when the test advances the clock, so this
 * waits for the real resize event (the shell's listener runs before this one,
 * because it was added first) and only then advances the clock to run the
 * shell's re-measure frame.
 */
export async function resizeOnPausedClock(
  page: Page,
  width: number,
  height: number,
) {
  const current = page.viewportSize();
  if (current?.width !== width || current.height !== height) {
    // Install the listener before resizing, so the event cannot be missed.
    await page.evaluate(() => {
      (window as Window & { unimindResized?: Promise<void> }).unimindResized =
        new Promise<void>((resolve) =>
          addEventListener("resize", () => resolve(), { once: true }),
        );
    });
    await page.setViewportSize({ width, height });
    await page.evaluate(
      () =>
        (window as Window & { unimindResized?: Promise<void> }).unimindResized,
    );
  }
  await page.clock.runFor(64);
}

/**
 * Sets the root font size on a page whose fake clock is paused, waits until
 * resize observers have seen the new layout (the shell's observer was created
 * first, so it has scheduled its re-measure), then runs that frame.
 */
export async function setRootFontSizeOnPausedClock(page: Page, size: string) {
  await page.evaluate(
    (fontSize) =>
      new Promise<void>((resolve) => {
        let initial = true;
        const observer = new ResizeObserver(() => {
          if (initial) {
            initial = false;
            document.documentElement.style.fontSize = fontSize;
            return;
          }
          observer.disconnect();
          resolve();
        });
        // The workspace pins the body to the viewport, so watch the chrome
        // and content, whose sizes follow the root font. Observing body keeps
        // this observer's shallowest depth at 1, so the shell's observations
        // of its chrome are delivered in the same frame, before this one.
        for (const element of document.querySelectorAll(
          "body, main, [data-workspace-chrome]",
        ))
          observer.observe(element);
      }),
    size,
  );
  await page.clock.runFor(64);
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

/**
 * The visible height of a scroll region (Chat's "Conversation") after every
 * scroller is reset to the top, clipped by its scrolling ancestors and a
 * fixed bottom bar; the number of scroll owners (the document counts as one);
 * and horizontal overflow.
 */
export async function readingLayout(page: Page, name: string) {
  return page.evaluate((label) => {
    const reading = document.querySelector<HTMLElement>(
      `[aria-label="${label}"]`,
    )!;
    window.scrollTo(0, 0);
    for (const e of document.querySelectorAll<HTMLElement>("*"))
      if (e.scrollTop) e.scrollTop = 0;
    const r = reading.getBoundingClientRect();
    let top = Math.max(0, r.top),
      bottom = Math.min(innerHeight, r.bottom);
    for (let e = reading.parentElement; e; e = e.parentElement)
      if (
        ["auto", "scroll", "hidden", "clip"].includes(
          getComputedStyle(e).overflowY,
        )
      ) {
        const b = e.getBoundingClientRect();
        top = Math.max(top, b.top);
        bottom = Math.min(bottom, b.bottom);
      }
    const nav = document.querySelector<HTMLElement>(
      'nav[aria-label="Product navigation"],nav[aria-label="تنقل المنتج"]',
    );
    if (nav?.checkVisibility() && getComputedStyle(nav).position === "fixed")
      bottom = Math.min(bottom, nav.getBoundingClientRect().top);
    const owners = Array.from(
      document.querySelectorAll<HTMLElement>("*"),
    ).filter(
      (e) =>
        e.checkVisibility() &&
        !e.matches("input,textarea,select") &&
        !e.closest("dialog") &&
        ["auto", "scroll"].includes(getComputedStyle(e).overflowY) &&
        e.scrollHeight > e.clientHeight + 2 &&
        e.clientHeight > 0,
    );
    return {
      visible: Math.max(0, Math.round(bottom - top)),
      owners:
        owners.length +
        (document.documentElement.scrollHeight > innerHeight + 2 ? 1 : 0),
      overflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    };
  }, name);
}
