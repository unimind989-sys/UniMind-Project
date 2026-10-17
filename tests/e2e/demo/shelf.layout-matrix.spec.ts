import { bilingual, pick } from "../support/copy";
import {
  b07DetailsName,
  expectOriginalTypography,
  humanMedicinePath,
  showAccountView,
  unit,
} from "../support/demo";
import { boxOf } from "../support/layout";
import {
  type ScreenState,
  type ScreenGroup,
  matrixTests,
  productNavigation,
  expectLanguageControl,
  expectAlignedHeader,
  expectProfileTarget,
  expectBoundedReference,
  expectSetupHierarchy,
  expectTaskHeading,
  expectSignOutTarget,
} from "../support/layout-matrix";
import { routeSweepTests } from "../support/route-sweep";
import { navigate } from "../support/session";
import { expect, test } from "../support/test";

// Layout matrix for student first-run setup, the Shelf, subjects, materials,
// Settings, persistent study states and every student route (harness in
// `support/layout-matrix.ts` and `support/route-sweep.ts`).

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
        page.getByText(t("Timestamp 18:42", "التوقيت ١٨:٤٢"), {
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

const groups: readonly ScreenGroup[] = [
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
];

for (const { title, details, body } of [
  ...matrixTests(groups),
  ...routeSweepTests("student"),
])
  test(title, details, body);
