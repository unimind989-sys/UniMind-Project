import { mkdir, writeFile } from "node:fs/promises";
import nodePath from "node:path";
import { type Locale } from "../support/app-fixtures";
import { ensureB09Intake } from "../support/collection-b09";
import {
  bilingual,
  inLocales,
  languageName,
  locales,
  otherLocale,
  pick,
} from "../support/copy";
import {
  adminNavigate,
  b07DetailsName,
  b07SourcesName,
  campaign,
  expectOriginalTypography,
  generateStudioExample,
  humanMedicinePath,
  openStudyOptions,
  selectStudioExample,
  showAccountView,
  studyOptionsSummary,
  unit,
} from "../support/demo";
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
} from "../support/layout";
import {
  isolation,
  navigate,
  openSessionTools,
  send,
  signIn,
  type Role,
} from "../support/session";
import { expect, test, type Page } from "../support/test";
// Layout matrix: every prepared screen state of the synthetic product, swept
// once per locale and colour scheme. For each state and scheme it checks
// reflow at desktop, phone and 320px widths and at 320px with 200% text, the
// state's own geometry (`check`), and axe at desktop (plus at 320px where the
// phone markup differs). Journeys in the other demo specs prove behaviour in a
// single locale; this file owns themes, widths and axe.

type StateContext = {
  page: Page;
  locale: Locale;
  theme: Theme;
  width: number;
  /** True for the final pass at the narrowest width with 200% text. */
  enlarged: boolean;
};

type ScreenState = {
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
  /**
   * False where the source suite never required 200% text reflow at 320px and
   * the product currently overflows there (reported as a finding, not hidden):
   * the state is still swept at every width in both schemes.
   */
  enlargedReflow?: boolean;
  /** Require no horizontal overflow at all (no 1px rounding allowance). */
  strictReflow?: boolean;
  /** Leaves the state (for example closes a dialog) before the next one. */
  leave?: (page: Page, locale: Locale) => Promise<void>;
};

type ScreenGroup = {
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
      if (state.enlargedReflow ?? true)
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

function defineGroups(groups: readonly ScreenGroup[]) {
  for (const group of groups)
    inLocales(locales, (locale) => {
      test(
        `${group.title} [${locale}]`,
        { tag: [...group.tags, "@layout", `@${locale}`] },
        async ({ page }) => {
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
      );
    });
}

const dismissCitationHelp = async (page: Page, locale: Locale) => {
  const hint = page.getByRole("button", {
    name: pick(locale, "Got it", "فهمت"),
    exact: true,
  });
  if (await hint.isVisible()) await hint.click();
};

// ---------------------------------------------------------------- student chat
const chatStates: readonly ScreenState[] = [
  {
    name: "empty Chat aligns its tools, sessions menu and sharing note",
    enter: dismissCitationHelp,
    widths: [1440, 820, 390, 320],
    height: 1000,
    phoneAxe: true,
    check: async ({ page, locale, width, enlarged }) => {
      const t = bilingual(locale);
      const interfaceGroup = page.getByRole("group", {
        name: t("Interface language", "لغة الواجهة"),
        exact: true,
      });
      // audit 03: the language scope is named by its group, not a visible label.
      await expect(
        page.getByText(t("Interface language", "لغة الواجهة"), { exact: true }),
      ).toHaveCount(0);
      await expect(interfaceGroup).toBeVisible();
      const sessions = page.locator(
        `summary[aria-label="${t("Sessions and privacy", "الجلسات والخصوصية")}"]`,
      );
      if (enlarged) {
        await sessions.press("Enter");
        await expect(
          page.getByRole("button", {
            name: t("New session", "جلسة جديدة"),
            exact: true,
          }),
        ).toBeVisible();
        await sessions.press("Escape");
        return;
      }
      const narrow = width < 768;
      const sources = page.getByRole("link", {
        name: b07SourcesName(locale),
        exact: true,
      });
      const first = await sessions.boundingBox();
      const second = await (
        narrow ? studyOptionsSummary(page, locale) : sources
      ).boundingBox();
      expect(Math.abs(first!.y - second!.y)).toBeLessThan(2);
      await openStudyOptions(page, locale);
      const choices = await page
        .getByRole("group", {
          name: t("Study language", "لغة المذاكرة"),
          exact: true,
        })
        .boundingBox();
      expect(choices!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
      // audit 10: the visually hidden heading, sources and Sessions target.
      const heading = page.getByRole("heading", {
        name: t("Chat", "المحادثة"),
        level: 2,
        exact: true,
      });
      await expect(heading).toHaveCount(1);
      const box = await boxOf(heading);
      if (narrow) {
        expect(box.width).toBe(1);
        expect(box.height).toBe(1);
      } else expect(box.height).toBeGreaterThan(20);
      await expect(sources).toBeVisible();
      if (narrow) {
        const options = studyOptionsSummary(page, locale);
        await options.press("Escape");
        await expect(options).toBeFocused();
      }
      // audit 05: Sessions control, its menu and the sharing note.
      const style = await sessions.evaluate((e) => ({
        height: e.getBoundingClientRect().height,
        border: getComputedStyle(e).borderTopWidth,
        size: parseFloat(getComputedStyle(e).fontSize),
      }));
      expect(style.height).toBeGreaterThanOrEqual(44);
      expect(style.border).toBe("1px");
      expect(style.size).toBeGreaterThanOrEqual(14);
      const note = await page
        .locator("form p[class*='composerMeta'] strong")
        .evaluate((e) => ({
          weight: Number(getComputedStyle(e).fontWeight),
          size: parseFloat(getComputedStyle(e).fontSize),
          color: getComputedStyle(e).color,
          mainColor: getComputedStyle(e.closest("main")!).color,
        }));
      expect(note.weight).toBeGreaterThanOrEqual(600);
      expect(note.size).toBeGreaterThanOrEqual(14);
      expect(note.color).toBe(note.mainColor);
      await sessions.press("Enter");
      const menu = await sessions
        .locator("..")
        .locator(":scope > div")
        .boundingBox();
      const control = await sessions.boundingBox();
      if (width >= 768)
        expect(menu!.y).toBeGreaterThanOrEqual(
          control!.y + control!.height + 7,
        );
      else expect(menu!.y).toBeGreaterThanOrEqual(0);
      expect(menu!.x).toBeGreaterThanOrEqual(0);
      expect(menu!.x + menu!.width).toBeLessThanOrEqual(width + 1);
      await sessions.press("Escape");
      await expect(sessions).toBeFocused();
      await expectOriginalTypography(page, locale);
      // Workspace revision: the conversation uses the available width.
      const conversation = page.getByRole("region", {
        name: t("Conversation", "المحادثة الحالية"),
      });
      expect(
        await conversation
          .locator("..")
          .evaluate(
            (element) => element.scrollWidth <= element.clientWidth + 1,
          ),
      ).toBe(true);
      if (width === 1440) {
        await expect
          .poll(
            async () =>
              (await page.getByRole("main").boundingBox())?.width ?? 0,
          )
          .toBeGreaterThan(1200);
        const main = await boxOf(page.getByRole("main"));
        const region = await boxOf(conversation);
        expect(region.width).toBeGreaterThan(main.width - 110);
        expect(region.height).toBeGreaterThan(125);
      }
    },
    checkEnlarged: true,
  },
  {
    name: "Chat with three cited replies keeps 44px controls in one reading scroll",
    enter: async (page, locale) => {
      for (let n = 0; n < 3; n++) await send(page, "supported", locale);
    },
    widths: [1440, 768, 430, 390, 360, 320],
    height: 844,
    phoneAxe: true,
    check: async ({ page, enlarged }) => {
      await expectShellControls(page, "student");
      if (!enlarged)
        await expect(
          page.getByRole("navigation").getByRole("link"),
        ).toHaveCount(7);
    },
    checkEnlarged: true,
    axe: [{}, { include: "main" }],
  },
  {
    name: "a conflicting reply keeps its clarification question reachable",
    enter: async (page, locale) => {
      await send(page, "conflict", locale);
      await page
        .locator("article")
        .last()
        .locator("summary")
        .filter({
          hasText: pick(
            locale,
            "Question to ask about this conflict",
            "سؤال للاستفسار عن هذا التعارض",
          ),
        })
        .press("Enter");
    },
    check: async ({ page, locale }) => {
      const conflict = page.locator("article").last();
      const summary = conflict.locator("summary").filter({
        hasText: pick(
          locale,
          "Question to ask about this conflict",
          "سؤال للاستفسار عن هذا التعارض",
        ),
      });
      expect((await boxOf(summary)).height).toBeGreaterThanOrEqual(44);
      await expect(
        conflict.getByRole("textbox", {
          name: pick(locale, "Clarification question", "سؤال التوضيح"),
          exact: true,
        }),
      ).toBeVisible();
    },
    axe: [{ include: "main" }],
  },
  {
    name: "sources opened from Chat keep a compact return context",
    enter: async (page, locale) => {
      await openStudyOptions(page, locale);
      await page
        .getByRole("link", { name: b07SourcesName(locale), exact: true })
        .click();
    },
    widths: [1440, 820, 390, 320],
    height: 1000,
    check: async ({ page, locale, width }) => {
      const sourceContext = page.locator("[class*='sourceContext']");
      await expect(
        sourceContext.getByRole("link", {
          name: pick(locale, "Return to Chat", "العودة للمحادثة"),
          exact: true,
        }),
      ).toBeVisible();
      const geometry = await sourceContext.evaluate((e) => {
        const action = e.querySelector("a")!,
          caption = e.querySelector("p:last-of-type")!;
        const link = action.getBoundingClientRect(),
          note = caption.getBoundingClientRect();
        return {
          height: e.getBoundingClientRect().height,
          target: link.height,
          margin: getComputedStyle(caption).marginTop,
          size: getComputedStyle(caption).fontSize,
          aligned: Math.abs(
            link.y + link.height / 2 - note.y - note.height / 2,
          ),
        };
      });
      expect(geometry.target).toBeGreaterThanOrEqual(44);
      expect(geometry.margin).toBe("0px");
      expect(geometry.size).toBe("14px");
      if (width >= 820) expect(geometry.aligned).toBeLessThan(1);
      if (width === 390) expect(geometry.height).toBeLessThan(110);
      await expect(page.locator("article")).toHaveCount(8);
      await expectLanguageControl(page, locale);
      await expectAlignedHeader(page, width);
      await expectOriginalTypography(page, locale);
    },
    leave: async (page, locale) => {
      await page
        .locator("[class*='sourceContext']")
        .getByRole("link", {
          name: pick(locale, "Return to Chat", "العودة للمحادثة"),
          exact: true,
        })
        .click();
    },
  },
];

// ------------------------------------------------------------ shared checks
const productNavigation = (page: Page, locale: Locale) =>
  page.getByRole("navigation", {
    name: pick(locale, "Product navigation", "تنقل المنتج"),
    exact: true,
  });

/** Interface-language buttons: selected state, check icon and 44px targets. */
async function expectLanguageControl(page: Page, locale: Locale) {
  const group = page.getByRole("group", {
    name: pick(locale, "Interface language", "لغة الواجهة"),
    exact: true,
  });
  await expect(group.getByRole("button")).toHaveCount(2);
  const selected = group.getByRole("button", {
    name: languageName(locale),
    exact: true,
  });
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  await expect(selected.locator("svg[aria-hidden='true']")).toHaveCount(1);
  await expect(
    group
      .getByRole("button", {
        name: languageName(otherLocale(locale)),
        exact: true,
      })
      .locator("svg"),
  ).toHaveCount(0);
  const heights = await group
    .getByRole("button")
    .evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().height),
    );
  expect(heights.every((height) => height >= 44)).toBe(true);
  const style = await selected.evaluate((e) => ({
    background: getComputedStyle(e).backgroundColor,
    root: getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-soft")
      .trim(),
  }));
  expect(style.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(style.root).not.toBe("");
}

/** The workspace header label starts where the page heading starts. */
async function expectAlignedHeader(page: Page, width: number) {
  if (width < 768) return;
  await expect
    .poll(() =>
      page.locator("#app-content h1").evaluate((heading) => {
        const label = document.querySelector(
          "header[data-workspace-chrome] [class*='location']",
        )!;
        const first = label.getBoundingClientRect(),
          second = heading.getBoundingClientRect();
        return Math.abs(
          document.documentElement.dir === "rtl"
            ? first.right - second.right
            : first.left - second.left,
        );
      }),
    )
    .toBeLessThanOrEqual(1);
}

/** The student profile link names its Settings destination with a 44px target. */
async function expectProfileTarget(page: Page, locale: Locale) {
  const profile = page.getByRole("link", { name: "Samir Hassan", exact: true });
  await expect(profile).toHaveAccessibleDescription(
    pick(locale, "Settings", "الإعدادات"),
  );
  const caption = profile.locator("[class*='profileDestination']");
  await expect(caption).toHaveText(pick(locale, "Settings", "الإعدادات"));
  await expect(caption).toBeVisible();
  expect((await boxOf(profile)).height).toBeGreaterThanOrEqual(44);
}

/** Every visible control of a role shell is a 44px target inside the viewport. */
async function expectShellControls(page: Page, role: string) {
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
async function expectBoundedReference(page: Page, locale: Locale) {
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
async function expectSetupHierarchy(page: Page) {
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
async function expectTaskHeading(page: Page, name: string, width: number) {
  const heading = page.getByRole("heading", { name, level: 2, exact: true });
  await expect(heading).toHaveCount(1);
  const box = await boxOf(heading);
  if (width < 768) {
    expect(box.width).toBe(1);
    expect(box.height).toBe(1);
  } else expect(box.height).toBeGreaterThan(20);
}

/** The sign-out action on Account settings is a visible 44px target. */
async function expectSignOutTarget(page: Page, locale: Locale) {
  const exit = page.getByRole("main").getByRole("button", {
    name: pick(locale, "Sign out", "تسجيل الخروج"),
    exact: true,
  });
  await expect(exit).toBeVisible();
  expect((await boxOf(exit)).height).toBeGreaterThanOrEqual(44);
}

// ------------------------------------------------------- first-run and Shelf
const setupStates: readonly ScreenState[] = [
  {
    name: "the first setup step keeps a neutral disabled action and bounded reference",
    widths: [1440, 900, 820, 390, 320],
    height: 1000,
    check: async ({ page, locale, enlarged }) => {
      const t = bilingual(locale);
      await expectBoundedReference(page, locale);
      if (enlarged) return;
      const next = page.getByRole("button", {
        name: t("Continue", "متابعة"),
        exact: true,
      });
      await expect(next).toBeDisabled();
      const inactive = await next.evaluate((e) => ({
        opacity: getComputedStyle(e).opacity,
        cursor: getComputedStyle(e).cursor,
      }));
      expect(inactive).toEqual({ opacity: "1", cursor: "not-allowed" });
      await expectSetupHierarchy(page);
      await expectProfileTarget(page, locale);
      await expect(page.locator("#app-content h1")).toHaveCount(1);
      await expect(
        page.getByRole("heading", {
          name: t("Education stage", "المرحلة التعليمية"),
          level: 2,
          exact: true,
        }),
      ).toBeVisible();
      await expectOriginalTypography(page, locale);
    },
    checkEnlarged: true,
  },
  {
    name: "the study-period step keeps compact 44px choices",
    enter: async (page, locale) => {
      for (const value of humanMedicinePath.slice(0, 4)) {
        await page.locator(`input[value="${value}"]`).check();
        await page
          .getByRole("button", {
            name: pick(locale, "Continue", "متابعة"),
            exact: true,
          })
          .click();
      }
    },
    widths: [1440, 820, 390, 320],
    height: 1000,
    check: async ({ page, locale }) => {
      const periods = page.getByRole("group", {
        name: pick(locale, "Study period", "الفترة الدراسية"),
        exact: true,
      });
      await expect(periods.getByRole("radio")).toHaveCount(2);
      for (const choice of await periods.locator("label").all()) {
        const box = await boxOf(choice);
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeLessThan(68);
      }
    },
  },
  {
    name: "the academic review keeps compact editable rows and its completion mark",
    enter: async (page, locale) => {
      await page.locator('input[value="human-medicine-year-1-term-1"]').check();
      await page
        .getByRole("button", {
          name: pick(locale, "Review choices", "مراجعة الاختيارات"),
          exact: true,
        })
        .click();
    },
    widths: [1440, 900, 820, 390, 320],
    height: 1000,
    check: async ({ page, locale, width, enlarged }) => {
      await expectBoundedReference(page, locale);
      if (enlarged) return;
      const rows = await page.locator("dl > div").evaluateAll((elements) =>
        elements.map((element) => {
          const value = element.querySelector("bdi")!.getBoundingClientRect();
          const edit = element.querySelector("button")!.getBoundingClientRect();
          return {
            gap: Math.max(edit.left - value.right, value.left - edit.right),
            target: edit.height,
          };
        }),
      );
      expect(rows).toHaveLength(5);
      for (const row of rows) {
        expect(row.gap).toBeLessThanOrEqual(25);
        expect(row.target).toBeGreaterThanOrEqual(44);
      }
      if (width === 390)
        expect((await boxOf(page.locator("dl"))).height).toBeLessThan(450);
      await expectSetupHierarchy(page);
      const setup = page.getByRole("region", {
        name: pick(locale, "Set up your Study Shelf", "إعداد رف المذاكرة"),
        exact: true,
      });
      const completed = setup.locator("[class*='reviewCompletion']");
      await expect(completed).toContainText(
        pick(locale, "Academic path complete", "اكتمل المسار الدراسي"),
      );
      await expect(completed.locator("svg[aria-hidden='true']")).toHaveCount(1);
      await expect(setup.locator("[data-complete='true']")).toHaveCount(5);
      await expectProfileTarget(page, locale);
    },
    checkEnlarged: true,
  },
  {
    name: "the Shelf keeps a compact start card and 44px destinations",
    enter: async (page, locale) => {
      await page
        .getByRole("button", {
          name: pick(locale, "Open Study Shelf", "فتح رف المذاكرة"),
          exact: true,
        })
        .click();
    },
    widths: [1440, 820, 768, 390, 320],
    phoneAxe: true,
    check: async ({ page, locale, width, enlarged }) => {
      const resume = page.locator("section").filter({
        has: page.getByRole("link", {
          name:
            locale === "en"
              ? /^(Choose a (module|subject)|(Open|Resume) Anatomy)$/u
              : /^(اختر (وحدة|مادة)|(فتح|متابعة) علم التشريح)$/u,
        }),
      });
      await expect(resume.getByRole("link").first()).toBeVisible();
      if (enlarged) return;
      const layout = await resume.evaluate((e) => {
        const text = e.querySelector("p")!.getBoundingClientRect();
        const action = e.querySelector("a")!.getBoundingClientRect();
        const box = e.getBoundingClientRect();
        return {
          below: action.y >= text.bottom,
          gap: action.y - text.bottom,
          contained: action.x >= box.x && action.right <= box.right + 1,
          width: box.width,
          targetHeight: action.height,
        };
      });
      expect(layout.below).toBe(true);
      expect(layout.gap).toBeGreaterThanOrEqual(12);
      expect(layout.gap).toBeLessThanOrEqual(20);
      expect(layout.contained).toBe(true);
      expect(layout.width).toBeLessThanOrEqual(640);
      expect(layout.targetHeight).toBeGreaterThanOrEqual(44);
      const nav = productNavigation(page, locale);
      await expect(nav.getByRole("link")).toHaveCount(3);
      for (const destination of await nav.getByRole("link").all())
        expect((await boxOf(destination)).height).toBeGreaterThanOrEqual(44);
      await expectProfileTarget(page, locale);
      await expectLanguageControl(page, locale);
      await expectAlignedHeader(page, width);
      if (width === 1440) {
        await expect(page.getByRole("complementary")).not.toContainText(
          "Study deeper",
        );
        const start = page.locator('[class*="resume"]');
        expect((await boxOf(start)).height).toBeLessThan(300);
        expect(
          await start.evaluate((e) => getComputedStyle(e).paddingTop),
        ).toBe("24px");
      }
    },
    checkEnlarged: true,
  },
  {
    name: "the subject list keeps grouped rows and plain open actions",
    enter: async (page, locale) => {
      await productNavigation(page, locale)
        .getByRole("link", {
          name: pick(locale, "Subjects", "المواد"),
          exact: true,
        })
        .click();
    },
    widths: [1440, 820, 390, 320],
    check: async ({ page, locale, width }) => {
      const rows = page.locator("li[data-unit-id] > a");
      await expect(rows).toHaveCount(5);
      const geometry = await rows.first().evaluate((row) => {
        const title = row.querySelector("bdi")!.getBoundingClientRect();
        const status = row
          .querySelector('span[class*="ready"]')!
          .getBoundingClientRect();
        const rtl = document.documentElement.dir === "rtl";
        return {
          height: row.getBoundingClientRect().height,
          gap: rtl ? title.left - status.right : status.left - title.right,
          y: Math.abs(title.top - status.top),
        };
      });
      expect(geometry.gap).toBeGreaterThanOrEqual(0);
      expect(geometry.gap).toBeLessThanOrEqual(17);
      expect(geometry.y).toBeLessThan(12);
      if (width <= 390) expect(geometry.height).toBeLessThan(100);
      for (const row of await rows.all()) {
        await expect(row.locator("[class*='unitAction']")).toContainText(
          pick(locale, "Open", "فتح"),
        );
        expect((await boxOf(row)).height).toBeGreaterThanOrEqual(44);
      }
      await expectLanguageControl(page, locale);
      await expectAlignedHeader(page, width);
      await expectOriginalTypography(page, locale);
    },
  },
  {
    name: "unit materials keep source formats, scope context and 44px excerpts",
    enter: async (page, locale) => {
      await page
        .getByRole("link", {
          name: pick(locale, "Open Anatomy", "فتح علم التشريح"),
          exact: true,
        })
        .click();
    },
    widths: [1440, 820, 390, 320],
    phoneAxe: true,
    axe: [{}, { include: "main" }],
    check: async ({ page, locale, width }) => {
      const t = bilingual(locale);
      await expect(page.locator("article")).toHaveCount(8);
      const rows = await page.locator("article").evaluateAll((articles) =>
        articles.slice(0, 2).map((e) => {
          const format = e.querySelector("bdi")!;
          const heading = e.querySelector("h3")!;
          const summary = e.querySelector("summary")!;
          const bounds = summary.getBoundingClientRect();
          return {
            format: format.textContent,
            weight: Number(getComputedStyle(format).fontWeight),
            color: getComputedStyle(format).color,
            headingColor: getComputedStyle(heading).color,
            border: getComputedStyle(summary).borderTopStyle,
            height: bounds.height,
            withinRow: bounds.right <= e.getBoundingClientRect().right + 1,
          };
        }),
      );
      expect(rows.map((row) => row.format)).toEqual(["PDF", "AUDIO"]);
      for (const row of rows) {
        expect(row.weight).toBeGreaterThanOrEqual(600);
        expect(row.color).toBe(row.headingColor);
        expect(row.border).toBe("solid");
        expect(row.height).toBeGreaterThanOrEqual(44);
        expect(row.withinRow).toBe(true);
      }
      await expectTaskHeading(page, t("Materials", "مصادر المذاكرة"), width);
      await expect(
        page.getByText(t("Sample timestamp 02:10", "توقيت تجريبي ٠٢:١٠"), {
          exact: true,
        }),
      ).toBeVisible();
      // audit 10: the scope context stays readable inside the viewport.
      const phone = width < 768;
      const disclosure = page
        .locator("summary")
        .filter({ hasText: b07DetailsName(locale) });
      if (phone) await disclosure.click();
      const context = phone
        ? page
            .locator('[class*="subjectSwitch"] p')
            .filter({ hasText: t("Faculty of Medicine", "كلية الطب البشري") })
            .filter({ visible: true })
        : page.locator('[class*="scopeCaption"]');
      await expect(context).toContainText(
        t("Faculty of Medicine", "كلية الطب البشري"),
      );
      if (phone)
        expect(
          Number.parseFloat(
            await context.evaluate((e) => getComputedStyle(e).fontSize),
          ),
        ).toBeGreaterThanOrEqual(14);
      const rect = await boxOf(context);
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(width);
      if (phone) {
        await disclosure.press("Escape");
        await expect(disclosure).toBeFocused();
      }
      await expectLanguageControl(page, locale);
      await expectAlignedHeader(page, width);
      await expectOriginalTypography(page, locale);
    },
  },
  {
    name: "an open processed passage keeps its 44px summary",
    enter: async (page) => {
      await page.locator("article").first().locator("summary").press("Enter");
    },
    check: async ({ page }) => {
      expect(
        (await boxOf(page.locator("article").first().locator("summary")))
          .height,
      ).toBeGreaterThanOrEqual(44);
    },
    axe: [{ include: "main" }],
  },
];

const mathematicsSubjects: readonly ScreenState[] = [
  {
    name: "a mathematics-track subject list keeps its own subjects",
    enter: async (page, locale) => {
      for (const [index, value] of [
        "thanaweya-amma",
        "mathematics-track",
        "mathematics-track-year-3-term-1",
      ].entries()) {
        await page.locator(`input[type="radio"][value="${value}"]`).check();
        await page
          .getByRole("button", {
            name:
              index === 2
                ? pick(locale, "Review choices", "مراجعة الاختيارات")
                : pick(locale, "Continue", "متابعة"),
            exact: true,
          })
          .click();
      }
      await page
        .getByRole("button", {
          name: pick(locale, "Open Study Shelf", "فتح رف المذاكرة"),
          exact: true,
        })
        .click();
      await productNavigation(page, locale)
        .getByRole("link", {
          name: pick(locale, "Subjects", "المواد"),
          exact: true,
        })
        .click();
    },
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("link", {
          name: pick(locale, "Open Mathematics", "فتح الرياضيات"),
          exact: true,
        }),
      ).toBeVisible();
    },
    axe: [{ include: "main", tags: "all" }],
  },
];

// ---------------------------------------------------------- Studio and Quiz
const flashcardFlip = (page: Page, locale: Locale) =>
  page.getByRole("button", {
    name: new RegExp(
      pick(locale, "^Show (answer|question)$", "^إظهار (الإجابة|السؤال)$"),
    ),
    exact: true,
  });

/** No paragraph of the generated aid is clipped or truncated. */
async function expectUnclippedArtifact(page: Page) {
  expect(
    await page
      .locator("section[class*='artifactOutput'] > div[lang]")
      .getByRole("paragraph")
      .evaluateAll((paragraphs) =>
        paragraphs.every(
          (element) =>
            element.scrollWidth <= element.clientWidth + 1 &&
            getComputedStyle(element).textOverflow !== "ellipsis",
        ),
      ),
  ).toBe(true);
}

const studioStates: readonly ScreenState[] = [
  {
    name: "empty Studio keeps its form hierarchy and an emphasized options disclosure",
    enter: (page, locale) => navigate(page, `${unit}/studio`, locale),
    widths: [1440, 820, 390, 320],
    height: 1000,
    phoneAxe: true,
    check: async ({ page, locale, enlarged }) => {
      const disclosure = page.locator(
        "details[class*='secondaryOptions'] summary",
      );
      if (enlarged) {
        // The secondary options stay discoverable at 200% text.
        await disclosure.press("Enter");
        await expect(page.locator("#artifact-depth")).toBeVisible();
        await disclosure.press("Space");
        return;
      }
      const hierarchy = await page
        .locator("div[class*='studioLayout']")
        .evaluate((e) => ({
          form: parseFloat(
            getComputedStyle(e.querySelector("form > h2")!).fontSize,
          ),
          empty: parseFloat(
            getComputedStyle(e.querySelector("div[class*='artifactEmpty'] h3")!)
              .fontSize,
          ),
        }));
      expect(hierarchy.form).toBeGreaterThan(hierarchy.empty);
      await expect(
        page.getByRole("button", {
          name: pick(locale, "Generate", "إنشاء"),
          exact: true,
        }),
      ).toBeEnabled();
      const emphasis = await disclosure.evaluate((element) => ({
        height: element.getBoundingClientRect().height,
        weight: Number(getComputedStyle(element).fontWeight),
        color: getComputedStyle(element).color,
        parentColor: getComputedStyle(element.closest("main")!).color,
      }));
      expect(emphasis.height).toBeGreaterThanOrEqual(44);
      expect(emphasis.weight).toBeGreaterThanOrEqual(600);
      expect(emphasis.color).toBe(emphasis.parentColor);
      await expectOriginalTypography(page, locale);
    },
    checkEnlarged: true,
  },
  {
    name: "the MCQ choice keeps one 44px setup link at enlarged text",
    enter: async (page) => {
      await page.locator("#artifact-type").selectOption("quiz");
    },
    height: 1000,
    check: async ({ page, locale }) => {
      const setup = page.getByRole("link", {
        name: pick(locale, "Set up MCQ quiz", "إعداد اختبار اختيار من متعدد"),
        exact: true,
      });
      await expect(setup).toBeVisible();
      expect((await boxOf(setup)).height).toBeGreaterThanOrEqual(44);
    },
    checkEnlarged: true,
    axe: [{ include: "main" }],
  },
  {
    name: "an extended mixed summary keeps every paragraph unclipped",
    enter: async (page, locale) => {
      // MCQ hides the generation options; choose an aid type first.
      await page.locator("#artifact-type").selectOption("summary");
      await selectStudioExample(page, locale, {
        type: "summary",
        topic: "comparison",
        depth: "detailed",
        size: "extended",
        language: "mixed",
      });
      await generateStudioExample(page, locale);
    },
    widths: [1440, 768, 390, 320],
    height: 1000,
    check: async ({ page }) => expectUnclippedArtifact(page),
    checkEnlarged: true,
    axe: [{ include: "main", tags: "all" }],
  },
  {
    name: "a supporting-passages dialog stays closable and accessible",
    enter: async (page, locale) => {
      await page
        .getByRole("button", {
          name: pick(locale, "Supporting passages", "النصوص الداعمة"),
          exact: true,
        })
        .press("Enter");
      await expect(page.getByRole("dialog")).toBeVisible();
    },
    height: 1000,
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("dialog").getByRole("button", {
          name: pick(locale, "Close", "إغلاق"),
          exact: true,
        }),
      ).toBeVisible();
    },
    axe: [{ include: "dialog[open]" }],
    leave: async (page) => {
      await page.getByRole("dialog").press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
    },
  },
  {
    name: "flashcards keep a 44px keyboard flip and unclipped faces",
    enter: async (page, locale) => {
      await selectStudioExample(page, locale, {
        type: "flashcards",
        topic: "comparison",
        depth: "detailed",
        size: "extended",
        language: "mixed",
      });
      await generateStudioExample(page, locale);
    },
    widths: [1440, 768, 430, 390, 360, 320],
    phoneAxe: true,
    check: async ({ page, locale, enlarged }) => {
      const flip = flashcardFlip(page, locale);
      expect((await boxOf(flip)).height).toBeGreaterThanOrEqual(44);
      await flip.press("Enter");
      await expect(flip).toBeFocused();
      await expectUnclippedArtifact(page);
      await flip.press("Enter");
      await expectUnclippedArtifact(page);
      await expectShellControls(page, "student");
      if (!enlarged)
        await expect(
          page.getByRole("navigation").getByRole("link"),
        ).toHaveCount(7);
    },
    checkEnlarged: true,
  },
  {
    name: "sources opened from Studio keep compact rows and 44px excerpts",
    enter: async (page, locale) => {
      await page
        .getByRole("link", { name: b07SourcesName(locale), exact: true })
        .click();
    },
    widths: [1440, 820, 390, 320],
    check: async ({ page, locale, width }) => {
      const rows = page.locator("article");
      await expect(rows).toHaveCount(8);
      const first = rows.first();
      expect(
        (await boxOf(first.locator("summary"))).height,
      ).toBeGreaterThanOrEqual(44);
      if (width === 1440) {
        const firstTitle = await boxOf(first.locator("h3"));
        const secondTitle = await boxOf(rows.nth(1).locator("h3"));
        expect(secondTitle.y - firstTitle.y).toBeLessThan(160);
        const identity = await boxOf(first.locator(":scope > div"));
        const status = await boxOf(first.locator(":scope > span"));
        expect(Math.abs(identity.y - status.y)).toBeLessThan(2);
        expect(
          status.x > identity.x + identity.width ||
            identity.x > status.x + status.width,
        ).toBe(true);
      }
      await expectOriginalTypography(page, locale);
    },
    leave: async (page, locale) => {
      await page
        .getByRole("link", {
          name: pick(locale, "Return to Studio", "العودة للاستوديو"),
          exact: true,
        })
        .click();
    },
  },
  {
    name: "quiz setup keeps one centered path with equivalent labels and count help",
    enter: (page, locale) => navigate(page, `${unit}/quiz`, locale),
    widths: [1440, 820, 390, 320],
    height: 1000,
    check: async ({ page, locale }) => {
      const configuration = page.locator("div[class*='quizConfiguration']");
      const start = page.getByRole("button", {
        name: pick(locale, "Start quiz", "بدء الاختبار"),
        exact: true,
      });
      for (const timed of [false, true]) {
        await page
          .getByRole("radio", {
            name: timed
              ? pick(locale, "Timed", "مؤقت")
              : pick(locale, "Untimed", "دون توقيت"),
            exact: true,
          })
          .check();
        const layout = await configuration.evaluate((element) => {
          const box = element.getBoundingClientRect();
          const panel = element.parentElement!.getBoundingClientRect();
          const fields = [...element.children]
            .filter((child) =>
              child.matches("fieldset,label,[class*='questionCount']"),
            )
            .map((child) => {
              const rect = child.getBoundingClientRect();
              const label = child.querySelector("legend,label") ?? child;
              const style = getComputedStyle(label);
              return {
                x: rect.x,
                y: rect.y,
                bottom: rect.bottom,
                width: rect.width,
                size: style.fontSize,
                weight: style.fontWeight,
                color: style.color,
              };
            });
          return {
            width: box.width,
            center: box.x + box.width / 2,
            panelCenter: panel.x + panel.width / 2,
            fields,
          };
        });
        expect(layout.width).toBeLessThanOrEqual(512);
        expect(Math.abs(layout.center - layout.panelCenter)).toBeLessThan(2);
        for (const [index, field] of layout.fields.entries()) {
          expect(Math.abs(field.x - layout.fields[0]!.x)).toBeLessThan(1);
          expect(field.width).toBeCloseTo(layout.width, 0);
          expect([field.size, field.weight, field.color]).toEqual([
            layout.fields[0]!.size,
            layout.fields[0]!.weight,
            layout.fields[0]!.color,
          ]);
          if (index)
            expect(field.y).toBeGreaterThanOrEqual(
              layout.fields[index - 1]!.bottom + 19,
            );
        }
        const action = await boxOf(start);
        expect(
          Math.abs(action.x + action.width / 2 - layout.center),
        ).toBeLessThan(2);
      }
      await page
        .getByRole("radio", {
          name: pick(locale, "Untimed", "دون توقيت"),
          exact: true,
        })
        .check();
      const count = page.getByRole("spinbutton", {
        name: pick(locale, "Number of questions", "عدد الأسئلة"),
        exact: true,
      });
      const bounds = await boxOf(count);
      const hint = await boxOf(page.locator("#quiz-question-count-help"));
      expect(hint.y).toBeGreaterThanOrEqual(bounds.y + bounds.height);
      expect(hint.y - bounds.y - bounds.height).toBeLessThan(10);
      await expectOriginalTypography(page, locale);
    },
  },
  {
    name: "a partial attempt keeps its answers, timer and Submit reachable",
    enter: async (page, locale) => {
      await page
        .getByRole("spinbutton", {
          name: pick(locale, "Number of questions", "عدد الأسئلة"),
          exact: true,
        })
        .fill("6");
      await page
        .getByRole("radio", {
          name: pick(locale, "Timed", "مؤقت"),
          exact: true,
        })
        .check();
      await page
        .getByLabel(pick(locale, "Duration (minutes)", "المدة (بالدقائق)"), {
          exact: true,
        })
        .fill("30");
      await page
        .getByRole("button", {
          name: pick(locale, "Start quiz", "بدء الاختبار"),
          exact: true,
        })
        .click();
      await page.locator('input[name="sample-question-0"]').first().check();
    },
    widths: [1440, 390, 320],
    height: 844,
    phoneAxe: true,
    check: async ({ page }) => {
      await expect(page.getByRole("timer")).toBeVisible();
    },
    axe: [{ include: "main" }],
  },
  {
    name: "the material library opened from a quiz keeps its return",
    enlargedReflow: false,
    enter: async (page, locale) => {
      await page
        .getByRole("link", {
          name: pick(locale, "Browse material library", "تصفح مكتبة المصادر"),
          exact: true,
        })
        .click();
    },
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("link", {
          name: pick(
            locale,
            "Return to quiz attempt",
            "العودة إلى محاولة الاختبار",
          ),
          exact: true,
        }),
      ).toBeVisible();
    },
    axe: [{ include: "main" }],
  },
  {
    name: "a submitted review names each correction without editable answers",
    enter: async (page, locale) => {
      await page
        .getByRole("link", {
          name: pick(
            locale,
            "Return to quiz attempt",
            "العودة إلى محاولة الاختبار",
          ),
          exact: true,
        })
        .click();
      for (let index = 0; index < 6; index++)
        await page
          .locator(`input[name="sample-question-${index}"]`)
          .first()
          .check();
      await page
        .getByRole("button", {
          name: pick(locale, "Submit answers", "تسليم الإجابات"),
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(/\/review\?attempt=/u);
    },
    phoneAxe: true,
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Quiz review", "مراجعة الاختبار"),
          exact: true,
        }),
      ).toBeVisible();
    },
    axe: [{ include: "main" }],
  },
  {
    name: "the report form for a selected exchange stays usable",
    enter: async (page, locale) => {
      await navigate(page, `${unit}/chat`, locale);
      await page
        .getByRole("link", {
          name: pick(locale, "Report example", "الإبلاغ عن المثال"),
          exact: true,
        })
        .first()
        .click();
      await page.getByRole("checkbox").check();
    },
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("button", {
          name: pick(locale, "Submit report", "إرسال البلاغ"),
          exact: true,
        }),
      ).toBeEnabled();
    },
    axe: [{ include: "main" }],
  },
];

// Expired attempts need the controlled clock, so they get their own document.
const expiredReviewStates: readonly ScreenState[] = [
  {
    name: "an expired attempt shows an unscored review",
    enter: async (page, locale) => {
      await page.clock.install({ time: new Date("2026-10-13T12:00:00Z") });
      await page
        .getByLabel(pick(locale, "Number of questions", "عدد الأسئلة"), {
          exact: true,
        })
        .fill("6");
      await page
        .getByRole("radio", {
          name: pick(locale, "Timed", "مؤقت"),
          exact: true,
        })
        .check();
      await page
        .getByLabel(pick(locale, "Duration (minutes)", "المدة (بالدقائق)"), {
          exact: true,
        })
        .fill("1");
      await page
        .getByRole("button", {
          name: pick(locale, "Start quiz", "بدء الاختبار"),
          exact: true,
        })
        .click();
      for (const index of [0, 1])
        await page
          .locator(`input[name="sample-question-${index}"]`)
          .first()
          .check();
      await page.clock.fastForward(61_000);
    },
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Expired quiz review", "مراجعة الاختبار المنتهي"),
          exact: true,
        }),
      ).toBeVisible();
    },
    axe: [{ include: "main" }],
  },
];

// ------------------------------------------------------------------ Settings
const settingsStates: readonly ScreenState[] = [
  {
    name: "Settings keeps its return, tab grid and theme preview apart",
    enter: (page, locale) => navigate(page, "/settings", locale),
    widths: [1440, 820, 390, 320],
    height: 1000,
    phoneAxe: true,
    check: async ({ page, locale, width, enlarged }) => {
      const tabs = page.getByRole("tablist");
      await expect(tabs.getByRole("tab")).toHaveCount(4);
      if (enlarged) return;
      // audit 01: the contextual return stays separate from the tabs.
      const returnBox = await boxOf(
        page.getByRole("link", {
          name: pick(
            locale,
            "Return to Chat · Anatomy",
            "العودة إلى المحادثة · علم التشريح",
          ),
          exact: true,
        }),
      );
      const tabsBox = await boxOf(tabs);
      expect(
        tabsBox.y - (returnBox.y + returnBox.height),
      ).toBeGreaterThanOrEqual(20);
      if (width === 820) {
        const labels = await productNavigation(page, locale)
          .locator("a > span:not([class*='profileMarker']), a > bdi")
          .filter({ visible: true })
          .evaluateAll((elements) =>
            elements
              .map((element) => {
                const box = element.getBoundingClientRect();
                return {
                  width: box.width,
                  height: box.height,
                  clip: getComputedStyle(element).clipPath,
                };
              })
              .filter((label) => label.width > 0 && label.height > 0),
          );
        expect(labels).toHaveLength(3);
        expect(
          labels.every(
            (label) =>
              label.width > 20 && label.height > 10 && label.clip === "none",
          ),
        ).toBe(true);
      }
      if (width < 768) {
        const boxes = await tabs.getByRole("tab").evaluateAll((elements) =>
          elements.map((element) => {
            const box = element.getBoundingClientRect();
            return { y: box.y, height: box.height, width: box.width };
          }),
        );
        expect(Math.abs(boxes[0]!.y - boxes[1]!.y)).toBeLessThan(2);
        expect(Math.abs(boxes[2]!.y - boxes[3]!.y)).toBeLessThan(2);
        expect(boxes.every((box) => box.height >= 44 && box.width >= 44)).toBe(
          true,
        );
        expect(tabsBox.height).toBeLessThanOrEqual(130);
      }
      // audit 08: distinct, bordered 44px tabs.
      const styles = await tabs.getByRole("tab").evaluateAll((elements) =>
        elements.map((e) => ({
          height: e.getBoundingClientRect().height,
          border: getComputedStyle(e).borderTopWidth,
          background: getComputedStyle(e).backgroundColor,
        })),
      );
      for (const style of styles) {
        expect(style.height).toBeGreaterThanOrEqual(44);
        expect(style.border).toBe("1px");
        expect(style.background).not.toBe("rgba(0, 0, 0, 0)");
      }
      expect(styles[0]!.background).not.toBe(styles[1]!.background);
      // audit 05 and 10: a readable, control-free preview below the choices.
      const appearance = page.locator("#appearance-settings");
      expect((await boxOf(appearance)).width).toBeLessThanOrEqual(640);
      const preview = appearance.locator("figure");
      const layout = await preview.evaluate((e) => {
        const r = e.getBoundingClientRect();
        const choices = e
          .parentElement!.querySelector("fieldset")!
          .getBoundingClientRect();
        return {
          gap: r.top - choices.bottom,
          x: r.x,
          right: r.right,
          choicesX: choices.x,
          choicesRight: choices.right,
          controls: e.querySelectorAll("a,button,input").length,
        };
      });
      expect(layout.gap).toBeGreaterThanOrEqual(15);
      expect(
        locale === "en"
          ? Math.abs(layout.x - layout.choicesX)
          : Math.abs(layout.right - layout.choicesRight),
      ).toBeLessThan(2);
      expect(layout.controls).toBe(0);
      await expect(
        page.getByRole("radio", {
          name: pick(locale, "System", "النظام"),
          exact: true,
        }),
      ).toBeChecked();
      await expectLanguageControl(page, locale);
      await expectAlignedHeader(page, width);
      await expectOriginalTypography(page, locale);
    },
    checkEnlarged: true,
  },
  {
    name: "academic Settings keep the bounded reference beside its destination",
    enter: (page) => showAccountView(page, "academic"),
    widths: [1440, 900, 820, 390, 320],
    height: 1000,
    check: async ({ page, locale }) => expectBoundedReference(page, locale),
    checkEnlarged: true,
  },
  {
    name: "privacy Settings keep separate disclosures",
    enter: (page) => showAccountView(page, "privacy"),
    height: 1000,
  },
  {
    name: "identity Settings keep a quiet sign-out and a visible reset link",
    enter: (page) => showAccountView(page, "identity"),
    widths: [1440, 820, 768, 390, 320],
    height: 1000,
    check: async ({ page, locale, enlarged }) => {
      await expectSignOutTarget(page, locale);
      if (enlarged) return;
      const identity = page.locator("#identity-settings");
      expect((await boxOf(identity)).width).toBeLessThanOrEqual(640);
      const reset = identity.getByRole("link", {
        name: pick(locale, "Reset password", "تغيير كلمة المرور"),
        exact: true,
      });
      await expect(reset).toHaveAttribute(
        "href",
        `/forgot-password?lang=${locale}`,
      );
      expect(
        await reset.evaluate((e) => getComputedStyle(e).backgroundColor),
      ).not.toBe("rgba(0, 0, 0, 0)");
      const signOut = page.getByRole("main").getByRole("button", {
        name: pick(locale, "Sign out", "تسجيل الخروج"),
        exact: true,
      });
      await expect(signOut).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(signOut).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
    },
    checkEnlarged: true,
  },
];

// -------------------------------------------------------- dense study history
const denseStates: readonly ScreenState[] = [
  {
    name: "a dense session list keeps full-width unclipped 44px entries",
    enter: (page, locale) => openSessionTools(page, locale),
    widths: [1440, 768, 390, 320],
    height: 1000,
    check: async ({ page }) => {
      const entries = page.locator('[class*="historyList"] li button');
      await expect(entries).toHaveCount(12);
      for (const entry of await entries.all())
        expect((await boxOf(entry)).height).toBeGreaterThanOrEqual(44);
      const last = entries.last();
      expect(
        await last.evaluate(
          (element) =>
            element.getBoundingClientRect().width /
            element.closest("details")!.parentElement!.clientWidth,
        ),
      ).toBeGreaterThan(0.85);
      expect(
        await last.evaluate((element) => ({
          clipped:
            element.scrollWidth > element.clientWidth + 1 ||
            element.scrollHeight > element.clientHeight + 1,
          ellipsis: getComputedStyle(element).textOverflow === "ellipsis",
        })),
      ).toEqual({ clipped: false, ellipsis: false });
    },
    checkEnlarged: true,
    axe: [{ include: "main", tags: "all" }],
    leave: async (page, locale) => {
      await page
        .locator(
          `summary[aria-label="${pick(locale, "Sessions and privacy", "الجلسات والخصوصية")}"]`,
        )
        .press("Escape");
    },
  },
  {
    name: "long dense source titles wrap without clipping",
    enter: async (page, locale) => {
      await openStudyOptions(page, locale);
      await page
        .getByRole("link", { name: b07SourcesName(locale), exact: true })
        .click();
      await expect(page.getByRole("article")).toHaveCount(24);
    },
    widths: [1440, 768, 390, 320],
    height: 1000,
    check: async ({ page }) => {
      const title = page.getByRole("heading", { level: 3 }).last();
      await title.scrollIntoViewIfNeeded();
      expect(
        await title.evaluate((element) => ({
          clipped:
            element.scrollWidth > element.clientWidth + 1 ||
            (element.scrollHeight > element.clientHeight + 1 &&
              getComputedStyle(element).overflowY !== "visible"),
          ellipsis: getComputedStyle(element).textOverflow === "ellipsis",
        })),
      ).toEqual({ clipped: false, ellipsis: false });
    },
    checkEnlarged: true,
    axe: [{ include: "main", tags: "all" }],
  },
  {
    name: "a dense unit library keeps 44px excerpt summaries",
    enter: (page, locale) => navigate(page, unit, locale),
    check: async ({ page }) => {
      expect(
        (
          await boxOf(
            page.locator("article[class*='sourceRow'] summary").first(),
          )
        ).height,
      ).toBeGreaterThanOrEqual(44);
    },
    axe: [{ include: "main" }],
  },
];

// ------------------------------------------------------------ Batch Leader
/** The current navigation item keeps at least 4.5:1 contrast while settling. */
async function expectCurrentNavigationContrast(page: Page) {
  const contrast = await page
    .locator('nav a[aria-current="page"]')
    .first()
    .evaluate(async (link) => {
      const luminance = (color: string) => {
        const channels = color.match(/[0-9.]+/gu)?.map(Number);
        if (
          !channels ||
          channels.length < 3 ||
          (channels.length === 4 && channels[3] !== 1)
        )
          throw new Error("Navigation must use an opaque readable palette.");
        const linear = channels.slice(0, 3).map((channel) => {
          const value = channel / 255;
          return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
        });
        return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
      };
      const samples: number[] = [];
      for (let frame = 0; frame < 12; frame += 1) {
        const style = getComputedStyle(link);
        const foreground = luminance(style.color);
        const background = luminance(style.backgroundColor);
        samples.push(
          (Math.max(foreground, background) + 0.05) /
            (Math.min(foreground, background) + 0.05),
        );
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
      }
      return Math.min(...samples);
    });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
}

/** No visible main control of the page is shorter than 44px. */
async function expectMainTargets(page: Page) {
  expect(
    await page
      .locator("main button,main a,main summary,main select")
      .evaluateAll((elements) =>
        elements
          .filter((element) => element.getClientRects().length)
          .filter((element) => element.getBoundingClientRect().height < 44)
          .map((element) => element.textContent),
      ),
  ).toEqual([]);
}

const leaderWidths = [1440, 768, 430, 390, 360, 320] as const;

const leaderStates: readonly ScreenState[] = [
  {
    name: "campaign intake with device and reference rows keeps 44px controls",
    enter: async (page, locale) => {
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: pick(locale, "Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .click();
      await page
        .locator('input[type="file"]')
        .setInputFiles("public/demo-files/synthetic-recording.wav");
      await expect(
        page
          .getByRole("list", {
            name: pick(locale, "Upload queue", "قائمة الرفع"),
            exact: true,
          })
          .getByRole("listitem"),
      ).toHaveCount(2);
    },
    widths: leaderWidths,
    height: 844,
    strictReflow: true,
    phoneAxe: true,
    axe: [{}, { include: "main" }],
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Upload files", "رفع الملفات"),
          exact: true,
        }),
      ).toBeVisible();
      const nav = productNavigation(page, locale);
      await expect(nav.getByRole("link")).toHaveCount(3);
      for (const destination of await nav.getByRole("link").all())
        expect((await boxOf(destination)).height).toBeGreaterThanOrEqual(44);
      await expectMainTargets(page);
    },
  },
  {
    name: "assignment dates stay readable when expanded",
    enter: async (page, locale) => {
      await page
        .locator("details")
        .filter({
          has: page.getByText(
            pick(
              locale,
              "Assignment and campaign dates",
              "مواعيد التكليف والحملة",
            ),
            { exact: true },
          ),
        })
        .locator("summary")
        .press("Enter");
    },
    height: 844,
    check: async ({ page, locale }) => {
      await expect(
        page.locator("details").filter({
          has: page.getByText(
            pick(
              locale,
              "Assignment and campaign dates",
              "مواعيد التكليف والحملة",
            ),
            { exact: true },
          ),
        }),
      ).toHaveAttribute("open");
    },
    axe: [{ include: "main", tags: "all" }],
  },
  {
    name: "History keeps its latest submissions readable",
    enter: async (page, locale) => {
      await page
        .getByRole("link", {
          name: pick(locale, "Latest submissions", "آخر الإرسالات"),
          exact: true,
        })
        .click();
    },
    widths: leaderWidths,
    height: 844,
    strictReflow: true,
    axe: [{}, { include: "main", tags: "all" }],
  },
  {
    name: "the leader home keeps 44px destinations and language controls",
    enter: (page, locale) => navigate(page, "/batch-leader", locale),
    widths: [1440, 768, 390, 320],
    check: async ({ page, locale, width }) => {
      const nav = productNavigation(page, locale);
      await expect(nav.getByRole("link")).toHaveCount(3);
      for (const destination of await nav.getByRole("link").all())
        expect((await boxOf(destination)).height).toBeGreaterThanOrEqual(44);
      await expectLanguageControl(page, locale);
      if (width === 1440)
        await expect(page.getByRole("complementary")).not.toContainText(
          "Study deeper",
        );
    },
  },
  {
    name: "leader Account keeps existing controls readable",
    enter: (page, locale) => navigate(page, "/settings", locale),
    widths: [1440, 768, 390, 360, 320],
    height: 844,
    strictReflow: true,
    phoneAxe: true,
    check: async ({ page, locale }) => expectSignOutTarget(page, locale),
    checkEnlarged: true,
  },
  {
    name: "corrections keep every request action visible",
    enter: (page, locale) =>
      signIn(page, "leader", locale, `${campaign}?fixture=corrections`),
    height: 844,
    check: async ({ page }) => {
      const requests = page.locator("[data-request-id]");
      await expect(requests).toHaveCount(3);
      for (const request of await requests.all())
        await expect(request.locator("a,button")).toBeVisible();
    },
    axe: [{ include: "main" }],
  },
  {
    name: "a permanent upload failure keeps its remedy readable",
    enter: async (page, locale) => {
      await signIn(page, "leader", locale, `${campaign}?fixture=checksum`);
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: pick(locale, "Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .click();
      await page
        .getByLabel(pick(locale, "I have permission", "لدي صلاحية"))
        .check();
      await page
        .getByRole("button", {
          name: pick(locale, "Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
    },
    height: 844,
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("list", {
          name: pick(locale, "Upload queue", "قائمة الرفع"),
          exact: true,
        }),
      ).toContainText(pick(locale, "integrity check", "فحص السلامة"));
    },
    axe: [{ include: "main" }],
  },
  {
    name: "three received files keep readable statuses at enlarged text",
    enter: async (page, locale) => {
      await signIn(page, "leader", locale, campaign);
      await page
        .locator('input[type="file"]')
        .setInputFiles([
          "public/demo-files/synthetic-handout.pdf",
          "public/demo-files/synthetic-recording.wav",
          "public/demo-files/synthetic-diagram.png",
        ]);
      await page
        .getByLabel(
          pick(
            locale,
            "Professor or source description",
            "وصف الأستاذ أو المصدر",
          ),
        )
        .fill("Synthetic retained context for all three supplied files.");
      await page
        .getByLabel(pick(locale, "I have permission", "لدي صلاحية"))
        .check();
      await page
        .getByRole("button", {
          name: pick(locale, "Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(3);
    },
    widths: [1440, 768, 390, 320],
    check: async ({ page, locale }) => {
      await withEnlargedText(page, async () => {
        await expectReflow(page);
        for (const request of await page
          .locator('[data-record-request^="sample-item-"]')
          .all())
          await expect(request.locator("summary [data-status]")).toHaveText(
            pick(locale, "Received", "تم الاستلام"),
          );
      });
    },
    axe: [{ include: "main" }],
  },
  {
    name: "three assigned campaigns keep unclipped titles",
    enlargedReflow: false,
    enter: (page, locale) =>
      signIn(page, "leader", locale, "/batch-leader?fixture=dense"),
    height: 1000,
    check: async ({ page, locale }) => {
      const titles = page
        .getByRole("region", {
          name: pick(locale, "Assigned campaigns", "الحملات المسندة"),
          exact: true,
        })
        .getByRole("heading", { level: 3 });
      await expect(titles).toHaveCount(3);
      expect(
        await titles.evaluateAll((elements) =>
          elements.every(
            (element) =>
              element.scrollWidth <= element.clientWidth + 1 &&
              getComputedStyle(element).textOverflow !== "ellipsis",
          ),
        ),
      ).toBe(true);
    },
    axe: [{ include: "main", tags: "all" }],
  },
  {
    name: "an invitation keeps a high-contrast current destination",
    enter: (page, locale) =>
      signIn(page, "leader", locale, "/batch-leader/invitation"),
    widths: [1440, 390, 360, 320],
    height: 844,
    strictReflow: true,
    check: async ({ page }) => expectCurrentNavigationContrast(page),
    axe: [{}, { include: "main", tags: "all" }],
  },
  ...[
    "/batch-leader/invitation?fixture=expired",
    `${campaign}?fixture=expired`,
    "/batch-leader/invitation?fixture=replayed",
  ].map((path): ScreenState => ({
    name: `a denied fixture (${path.split("?")[1]}) offers a readable safe exit`,
    enter: (page, locale) => signIn(page, "leader", locale, path),
    enlargedReflow: false,
    height: 844,
    axe: [{ include: "main", tags: "all" }],
  })),
];

// ------------------------------------------------------------------- Admin
const adminRoutes = [
  "/admin",
  "/admin/sources",
  "/admin/campaigns",
  "/admin/catalog",
  "/admin/cohorts",
  "/admin/cohorts?view=users",
  "/admin/jobs",
  "/admin/quality",
  "/admin/usage",
  "/admin/incidents",
] as const;

const adminStates: readonly ScreenState[] = [
  ...adminRoutes.map((route): ScreenState => ({
    name: `${route} keeps resources and 44px admin controls`,
    enter: (page, locale) =>
      route === "/admin"
        ? Promise.resolve()
        : adminNavigate(page, route, locale),
    phoneAxe: route === "/admin",
    check: async ({ page, locale, width }) => {
      await expectShellControls(page, "admin");
      await expect(page.locator("main")).toHaveAttribute(
        "dir",
        locale === "ar" ? "rtl" : "ltr",
      );
      if (route !== "/admin/sources") return;
      // B07-C: the same five destinations, behind a menu on phones.
      const phone = width < 768;
      const nav = phone
        ? page.getByRole("navigation", {
            name: pick(locale, "Admin navigation", "تنقل الإدارة"),
            exact: true,
          })
        : productNavigation(page, locale);
      const menu = page
        .locator("summary")
        .filter({ hasText: new RegExp(pick(locale, "^Menu$", "^القائمة$")) });
      if (phone) await menu.click();
      await expect(nav.getByRole("link")).toHaveCount(5);
      for (const destination of await nav.getByRole("link").all())
        expect((await boxOf(destination)).height).toBeGreaterThanOrEqual(44);
      if (phone) {
        await menu.press("Escape");
        await expect(menu).toBeFocused();
      }
      await expectLanguageControl(page, locale);
    },
    checkEnlarged: true,
  })),
  {
    name: "a raw-data hold form keeps its reason, expiry and attestation readable",
    enter: async (page, locale) => {
      await adminNavigate(page, "/admin", locale);
      await page
        .getByRole("button", {
          name: new RegExp(
            pick(locale, "^Place raw-data hold", "^وضع حجز على البيانات الخام"),
          ),
        })
        .click();
      await page
        .getByLabel(pick(locale, "Reason for this change", "سبب هذا التغيير"))
        .fill(
          pick(locale, "Synthetic readiness review.", "مراجعة جاهزية تجريبية."),
        );
      await page
        .locator('input[name="holdExpiresAtLocal"]')
        .fill("2027-01-18T16:00");
      await page.locator('input[name="reviewAttested"]').check();
    },
    height: 844,
    axe: [{ include: "main", tags: "all" }],
  },
  {
    name: "the campaign invitation example stays readable before review",
    enlargedReflow: false,
    enter: async (page, locale) => {
      // Campaigns is a section resource of Content (Sources).
      await adminNavigate(page, "/admin/sources", locale);
      await adminNavigate(page, "/admin/campaigns", locale);
      await page
        .getByRole("button", {
          name: pick(locale, "Create campaign", "إنشاء حملة"),
          exact: true,
        })
        .press("Enter");
      await page
        .getByLabel(
          pick(
            locale,
            "Review fixed expiring campaign-only invitation",
            "مراجعة دعوة ثابتة للحملة فقط محدودة المدة",
          ),
        )
        .press("Space");
    },
    height: 844,
    axe: [{ include: "main", tags: "all" }],
  },
  {
    name: "the student conflict preview keeps its two-source citation",
    enter: async (page, locale) => {
      // Quality is a section resource of Operations (Jobs).
      await adminNavigate(page, "/admin/jobs", locale);
      await adminNavigate(page, "/admin/quality", locale);
      await page
        .getByRole("link", {
          name: pick(
            locale,
            "Inspect student conflict example",
            "فحص مثال تعارض الطالب",
          ),
          exact: true,
        })
        .press("Enter");
    },
    height: 844,
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("button", {
          name: pick(locale, "Two source excerpts", "نصان من مصدرين"),
          exact: true,
        }),
      ).toBeVisible();
    },
    axe: [{ include: "main", tags: "all" }],
  },
];

// ------------------------------------------------------------ role Account
const accountState: ScreenState = {
  name: "Account keeps a visible 44px sign-out",
  enter: (page, locale) => navigate(page, "/settings", locale),
  widths: [1440, 768, 390, 320],
  check: async ({ page, locale }) => expectSignOutTarget(page, locale),
  checkEnlarged: true,
};

defineGroups([
  {
    title: "first-run setup, Shelf, subjects and materials",
    tags: [
      "@B07-A",
      "@B07-C",
      "@audit-02",
      "@audit-03",
      "@audit-05",
      "@audit-06",
      "@audit-07",
      "@audit-08",
      "@audit-09",
      "@audit-10",
      "@workspace-revision",
    ],
    role: "student",
    states: setupStates,
  },
  {
    title: "mathematics-track subjects",
    tags: ["@B01", "@M10"],
    role: "student",
    states: mathematicsSubjects,
  },
  {
    title: "Chat, Studio, Quiz and report states",
    tags: [
      "@B06",
      "@B08-A",
      "@B08-B",
      "@B08-C",
      "@B08-D",
      "@B01",
      "@M67",
      "@B02",
      "@M15",
      "@M64",
      "@audit-03",
      "@audit-04",
      "@audit-05",
      "@audit-10",
      "@workspace-revision",
    ],
    role: "student",
    path: `${unit}/chat`,
    states: [...chatStates, ...studioStates],
  },
  {
    title: "expired quiz review",
    tags: ["@B03", "@M27"],
    role: "student",
    path: `${unit}/quiz`,
    states: expiredReviewStates,
  },
  {
    title: "student Settings tabs",
    tags: [
      "@audit-01",
      "@audit-05",
      "@audit-06",
      "@audit-08",
      "@audit-09",
      "@audit-10",
      "@B07-B",
      "@M75",
    ],
    role: "student",
    path: `${unit}/chat`,
    states: settingsStates,
  },
  {
    title: "dense study history and long titles",
    tags: ["@B01", "@M53", "@B07-C", "@B08-C"],
    role: "student",
    path: `${unit}/chat?fixture=dense`,
    states: denseStates,
  },
  {
    title: "persistent study state",
    tags: ["@B08-B"],
    role: "student",
    path: `${unit}/chat?fixture=no-ready-source`,
    states: [
      {
        name: "a persistent state keeps a 44px safe exit",
        check: async ({ page, locale }) => {
          expect(
            (
              await boxOf(
                page.getByRole("link", {
                  name: pick(
                    locale,
                    "Browse available subjects",
                    "تصفح المواد المتاحة",
                  ),
                  exact: true,
                }),
              )
            ).height,
          ).toBeGreaterThanOrEqual(44);
        },
        axe: [{ include: "main" }],
      },
    ],
  },
  {
    title: "Batch Leader intake, History, Account and fixtures",
    tags: ["@B04", "@B07-C", "@B09", "@B01", "@M53", "@demo-core"],
    role: "leader",
    path: campaign,
    states: leaderStates,
  },
  {
    title: "Admin sections and governed previews",
    tags: ["@B05-A", "@B05-B", "@B07-C", "@B01", "@M51", "@M52", "@demo-core"],
    role: "admin",
    states: adminStates,
  },
  ...(["admin", "second-admin"] as const).map((role): ScreenGroup => ({
    title: `${role} Account`,
    tags: ["@B07-B"],
    role,
    states: [accountState],
  })),
]);

// ------------------------------------------------------------- route sweep
// Every product route: reflow at four widths, document direction, axe and a
// visible keyboard focus ring, per locale and scheme.
const routeSets = {
  student: [
    "/learn",
    unit,
    ...[
      "chat",
      "studio",
      "quiz",
      "sources",
      "evidence",
      "report",
      "quiz/sample-attempt",
      "quiz/sample-attempt/review",
    ].map((path) => `${unit}/${path}`),
    "/settings",
  ],
  leader: ["/batch-leader", campaign, "/batch-leader/invitation"],
  admin: [
    "/admin",
    ...[
      "catalog",
      "cohorts",
      "campaigns",
      "sources",
      "jobs",
      "quality",
      "usage",
      "incidents",
    ].map((resource) => `/admin/${resource}`),
  ],
} as const;

for (const [role, routes] of Object.entries(routeSets))
  inLocales(locales, (locale) => {
    test(
      `${role} routes reflow, keep direction, focus and axe [${locale}]`,
      { tag: ["@demo-core", "@layout", "@rtl", `@${locale}`] },
      async ({ page }) => {
        const finish = isolation(page);
        for (const path of routes) {
          await signIn(page, role, locale, path);
          await expect(page).toHaveURL(new RegExp(path));
          await expect(page.locator("html")).toHaveAttribute(
            "dir",
            locale === "ar" ? "rtl" : "ltr",
          );
          for (const theme of themes) {
            await applyTheme(page, theme);
            for (const width of [1440, 768, 390, 320]) {
              await page.setViewportSize({ width, height: 900 });
              if (
                process.env.UNIMIND_FRONTEND_AUDIT === "1" &&
                theme === "light"
              )
                await captureAuditBaseline(page, locale, width, path);
              expect(
                await page.evaluate(() => document.documentElement.scrollWidth),
              ).toBeLessThanOrEqual(width + 1);
            }
            await expectAxe(page, { tags: ["wcag2a", "wcag2aa"] });
          }
          await page.keyboard.press("Tab");
          expect(
            await page
              .locator(":focus")
              .evaluate((element) => getComputedStyle(element).outlineStyle),
          ).not.toBe("none");
          await page.setViewportSize({ width: 1440, height: 900 });
        }
        if (role === "student") {
          // Reduced motion and 200% text keep a new Chat session reachable.
          await signIn(page, "student", locale, unit + "/chat");
          await page.setViewportSize({ width: 390, height: 844 });
          await withEnlargedText(page, async () => {
            expect(
              await page.evaluate(() => document.documentElement.scrollWidth),
            ).toBeLessThanOrEqual(391);
            await openSessionTools(page, locale);
            await page
              .getByRole("button", {
                name: pick(locale, "New session", "جلسة جديدة"),
                exact: true,
              })
              .click();
            await expect(
              page.getByLabel(pick(locale, "Message", "السؤال"), {
                exact: true,
              }),
            ).toBeEnabled();
          });
        }
        finish();
      },
    );
  });

/**
 * Opt-in frontend audit capture (UNIMIND_FRONTEND_AUDIT=1): a full-page
 * baseline image and control geometry for every route and width. Ordinary
 * runs never write files.
 */
async function captureAuditBaseline(
  page: Page,
  locale: Locale,
  width: number,
  path: string,
) {
  const directory = nodePath.resolve(
    ".impeccable/review/baseline",
    locale,
    String(width),
  );
  await mkdir(directory, { recursive: true });
  const name = path.replaceAll("/", "_");
  await page.screenshot({ path: `${directory}/${name}.png`, fullPage: true });
  const findings = await page
    .locator("button, a, input, select, textarea")
    .evaluateAll((elements) =>
      elements
        .filter((element) => element.getClientRects().length)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const parent = element.parentElement!.getBoundingClientRect();
          return {
            tag: element.tagName,
            label:
              element.getAttribute("aria-label") ??
              element.textContent?.trim().slice(0, 100),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            contentOverflow: element.scrollWidth > element.clientWidth + 2,
            containerOverflow:
              rect.left < parent.left - 2 || rect.right > parent.right + 2,
          };
        }),
    );
  await writeFile(
    `${directory}/${name}.json`,
    JSON.stringify(findings, null, 2),
  );
}
