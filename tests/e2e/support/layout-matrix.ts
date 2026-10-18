import { type Locale } from "./app-fixtures";
import { languageName, locales, otherLocale, pick } from "./copy";
import {
  boxOf,
  expectAxe,
  expectReflow,
  resize,
  layoutWidths,
  themes,
  applyTheme,
  withEnlargedText,
  type AxeOptions,
  type Theme,
} from "./layout";
import { isolation, signIn, type Role } from "./session";
import { expect, test, type Page } from "./test";

// Layout matrix harness: every prepared screen state of the synthetic product,
// swept once per locale and colour scheme. For each state and scheme it checks
// reflow at desktop, phone and 320px widths and at 320px with 200% text, the
// state's own geometry (`check`), and axe at desktop (plus at 320px where the
// phone markup differs). Journeys in the other demo specs prove behaviour in a
// single locale; the `demo/*.layout-matrix.spec.ts` files own themes, widths
// and axe. Those files are grouped by role and named so each sorts beside
// different journey specs: Playwright shards by test count in file order, and
// keeping the heavy matrix files apart keeps CI shards balanced.

export type StateContext = {
  page: Page;
  locale: Locale;
  theme: Theme;
  width: number;
  /** True for the final pass at the narrowest width with 200% text. */
  enlarged: boolean;
};

export type ScreenState = {
  name: string;
  /** Drives the document from the previous state into this one. */
  enter?: (page: Page, locale: Locale) => Promise<void>;
  /** Defaults to 1440, 390 and 320; the last width also gets 200% text. */
  widths?: readonly number[];
  height?: number;
  /** State-specific geometry, run at every width in both schemes. */
  check?: (context: StateContext) => Promise<void>;
  /** Also run `check` in the 200% text pass. */
  checkEnlarged?: boolean;
  /** Axe audits at desktop width; defaults to one whole-page WCAG 2.1 AA run. */
  axe?: readonly AxeOptions[];
  /** Repeat the axe audits at 320px because the phone markup differs. */
  phoneAxe?: boolean;
  /** Require no horizontal overflow at all (no 1px rounding allowance). */
  strictReflow?: boolean;
  /** Leaves the state (for example closes a dialog) before the next one. */
  leave?: (page: Page, locale: Locale) => Promise<void>;
};

export type ScreenGroup = {
  title: string;
  tags: readonly string[];
  role: Role;
  path?: string;
  /** Runs once after sign-in, before the first state. */
  setup?: (page: Page, locale: Locale) => Promise<void>;
  states: readonly ScreenState[];
};

async function sweep(page: Page, locale: Locale, state: ScreenState) {
  const widths = state.widths ?? layoutWidths;
  const height = state.height ?? 900;
  const narrowest = widths.at(-1)!;
  const axe = state.axe ?? [{}];
  for (const theme of themes) {
    await applyTheme(page, theme);
    for (const width of widths) {
      await resize(page, width, height);
      await expectReflow(page, { strict: state.strictReflow ?? false });
      await state.check?.({ page, locale, theme, width, enlarged: false });
    }
    await withEnlargedText(page, async () => {
      await expectReflow(page, { strict: state.strictReflow ?? false });
      if (state.checkEnlarged)
        await state.check?.({
          page,
          locale,
          theme,
          width: narrowest,
          enlarged: true,
        });
    });
    if (state.phoneAxe)
      for (const options of axe) await expectAxe(page, options);
    await resize(page, 1440, height);
    await expect(page).toHaveTitle(/\S/u);
    for (const options of axe) await expectAxe(page, options);
  }
}

/**
 * One test per group and locale. Specs pass each entry to `test()` themselves
 * so Playwright reports the spec file, not this module, as the location.
 */
export function matrixTests(groups: readonly ScreenGroup[]) {
  return groups.flatMap((group) =>
    locales.map((locale) => ({
      title: `${group.title} [${locale}]`,
      details: { tag: [...group.tags, "@layout", `@${locale}`] },
      body: async ({ page }: { page: Page }) => {
        const finish = isolation(page);
        await signIn(page, group.role, locale, group.path);
        await group.setup?.(page, locale);
        for (const state of group.states)
          await test.step(state.name, async () => {
            await page.setViewportSize({ width: 1440, height: 900 });
            await state.enter?.(page, locale);
            await sweep(page, locale, state);
            await state.leave?.(page, locale);
          });
        finish();
      },
    })),
  );
}

export const dismissCitationHelp = async (page: Page, locale: Locale) => {
  const hint = page.getByRole("button", {
    name: pick(locale, "Got it", "فهمت"),
    exact: true,
  });
  if (await hint.isVisible()) await hint.click();
};

// ------------------------------------------------------------ shared checks
export const productNavigation = (page: Page, locale: Locale) =>
  page.getByRole("navigation", {
    name: pick(locale, "Product navigation", "تنقل المنتج"),
    exact: true,
  });

/** Interface-language control (WP03 plan D1): two pressed-state buttons with
 * full accessible names and short visible labels, 44px targets, a filled
 * current segment and no check icon; the Night bar keeps DESIGN's height
 * (64px from 768px, at most 52px on phones). */
export async function expectLanguageControl(page: Page, locale: Locale) {
  const group = page.getByRole("group", {
    name: pick(locale, "Interface language", "لغة الواجهة"),
    exact: true,
  });
  await expect(group.getByRole("button")).toHaveCount(2);
  await expect(group.getByRole("button")).toHaveText(["EN", "ع"]);
  await expect(group.locator("svg")).toHaveCount(0);
  const selected = group.getByRole("button", {
    name: languageName(locale),
    exact: true,
  });
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  await expect(
    group.getByRole("button", {
      name: languageName(otherLocale(locale)),
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "false");
  const heights = await group
    .getByRole("button")
    .evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().height),
    );
  expect(heights.every((height) => height >= 44)).toBe(true);
  const fill = await selected.evaluate(
    (element) =>
      getComputedStyle(element.firstElementChild ?? element).backgroundColor,
  );
  expect(fill).not.toBe("rgba(0, 0, 0, 0)");
  // Enlarged text (the 200% pass) grows the control and the bar with it.
  const scale = await page.evaluate(
    () => parseFloat(getComputedStyle(document.documentElement).fontSize) / 16,
  );
  const control = await boxOf(group);
  expect(control.width).toBeLessThanOrEqual(120 * scale);
  expect(control.height).toBeLessThanOrEqual(48 * scale);
  if (scale > 1) return;
  // A phone workspace that fell back to page flow folds the bottom bar into
  // the header (the keyboard state belongs to WP03-T26), so only the docked
  // bar is measured.
  const pageFlow = await page.locator("[data-workspace-flow='page']").count();
  if (pageFlow > 0) return;
  const width = page.viewportSize()?.width ?? 1280;
  const bar = await boxOf(
    page.locator("header[data-workspace-chrome]").first(),
  );
  expect(bar.height).toBeLessThanOrEqual(width >= 768 ? 64 : 52);
}

/** The page heading starts at the top bar's inset, where the brand starts. */
export async function expectAlignedHeader(page: Page, width: number) {
  if (width < 768) return;
  await expect
    .poll(() =>
      page
        .locator("#app-content h1")
        .first()
        .evaluate((heading) => {
          const rtl = document.documentElement.dir === "rtl";
          const brand = [
            ...document.querySelectorAll<HTMLElement>(
              "header[data-workspace-chrome] a[aria-label='UniMind']",
            ),
          ].find((element) => element.getBoundingClientRect().width > 0)!;
          const anchor = heading.closest("header") ?? heading;
          const style = getComputedStyle(anchor);
          const box = anchor.getBoundingClientRect();
          const start = rtl
            ? box.right - parseFloat(style.paddingRight)
            : box.left + parseFloat(style.paddingLeft);
          const mark = brand.getBoundingClientRect();
          return Math.abs(start - (rtl ? mark.right : mark.left));
        }),
    )
    .toBeLessThanOrEqual(1);
}

/** The student profile link names its Settings destination with a 44px target. The
 * caption is the accessible description; Direction B shows the avatar and name. */
export async function expectProfileTarget(page: Page, locale: Locale) {
  const profile = page.getByRole("link", { name: "Samir Hassan", exact: true });
  await expect(profile).toHaveAccessibleDescription(
    pick(locale, "Settings", "الإعدادات"),
  );
  const caption = profile.locator("[class*='profileDestination']");
  await expect(caption).toHaveText(pick(locale, "Settings", "الإعدادات"));
  expect((await boxOf(profile)).height).toBeGreaterThanOrEqual(44);
}

/** Every visible control of a role shell is a 44px target inside the viewport. */
export async function expectShellControls(page: Page, role: string) {
  expect(
    await page.evaluate((shell) => {
      return [
        ...document.querySelectorAll(
          ["button", "a", "select", "textarea", "summary"]
            .map((tag) => `[data-role="${shell}"] ${tag}`)
            .join(", "),
        ),
      ]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            getComputedStyle(element).visibility !== "hidden" &&
            element.checkVisibility()
          );
        })
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.left < -1 ||
            rect.right > innerWidth + 1 ||
            rect.height < 43 ||
            (element.matches("button") &&
              element.scrollWidth > element.clientWidth + 2)
          );
        })
        .map((element) => element.textContent?.trim().slice(0, 80));
    }, role),
  ).toEqual([]);
}

/** The academic setup reference line keeps its arrow beside its destination. */
export async function expectBoundedReference(page: Page, locale: Locale) {
  const layout = await page
    .locator(
      "section[aria-labelledby='academic-settings-heading'] [class*='settingsReference']",
    )
    .evaluate((element, language) => {
      const bounds = (needle: string) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const nodes: Text[] = [];
        while (walker.nextNode()) nodes.push(walker.currentNode as Text);
        const start = element.textContent!.indexOf(needle);
        if (start < 0) throw new Error("Missing academic reference token");
        const range = document.createRange();
        let offset = 0;
        for (const node of nodes) {
          const end = offset + node.length;
          if (start >= offset && start < end)
            range.setStart(node, start - offset);
          if (start + needle.length > offset && start + needle.length <= end) {
            range.setEnd(node, start + needle.length - offset);
            break;
          }
          offset = end;
        }
        const r = range.getBoundingClientRect();
        return { y: r.y, height: r.height };
      };
      return {
        arrow: bounds(language === "ar" ? "←" : "→"),
        destination: bounds(language === "ar" ? "الإعدادات" : "Academic"),
        controls: element.querySelectorAll("a,button,input").length,
      };
    }, locale);
  expect(Math.abs(layout.arrow.y - layout.destination.y)).toBeLessThan(2);
  expect(layout.controls).toBe(0);
}

/** Setup headings: parent heading larger than the step, one bordered column. */
export async function expectSetupHierarchy(page: Page) {
  const layout = await page
    .locator("section[aria-labelledby='academic-settings-heading']")
    .evaluate((element) => {
      const parent = element.querySelector("h1")!;
      const step = element.querySelector("h2")!;
      const setup = step.parentElement!;
      return {
        parentSize: parseFloat(getComputedStyle(parent).fontSize),
        stepSize: parseFloat(getComputedStyle(step).fontSize),
        sectionWidth: element.getBoundingClientRect().width,
        setupWidth: setup.getBoundingClientRect().width,
        border: getComputedStyle(element).borderBottomWidth,
      };
    });
  expect(layout.parentSize).toBeGreaterThan(layout.stepSize);
  expect(Math.abs(layout.sectionWidth - layout.setupWidth)).toBeLessThan(2);
  expect(layout.border).toBe("1px");
}

/** Visually hidden task heading on phones, a real heading above 768px. */
export async function expectTaskHeading(
  page: Page,
  name: string,
  width: number,
) {
  const heading = page.getByRole("heading", { name, level: 2, exact: true });
  await expect(heading).toHaveCount(1);
  const box = await boxOf(heading);
  if (width < 768) {
    expect(box.width).toBe(1);
    expect(box.height).toBe(1);
  } else expect(box.height).toBeGreaterThan(20);
}

/** The sign-out action on Account settings is a visible 44px target. */
export async function expectSignOutTarget(page: Page, locale: Locale) {
  const exit = page.getByRole("main").getByRole("button", {
    name: pick(locale, "Sign out", "تسجيل الخروج"),
    exact: true,
  });
  await expect(exit).toBeVisible();
  expect((await boxOf(exit)).height).toBeGreaterThanOrEqual(44);
}
