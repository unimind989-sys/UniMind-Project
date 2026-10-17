import { mkdir, writeFile } from "node:fs/promises";
import nodePath from "node:path";
import { type Locale } from "./app-fixtures";
import { locales, pick } from "./copy";
import { campaign, unit } from "./demo";
import { expectAxe, themes, applyTheme, withEnlargedText } from "./layout";
import { isolation, openSessionTools, signIn } from "./session";
import { expect, type Page } from "./test";

// Route sweep of the layout matrix: every product route of a role at four
// widths, per locale and scheme. Each role's `*.layout-matrix.spec.ts` file
// registers its own sweep, so the heavy sweeps land in different CI shards.

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

/**
 * Every route of `role`: reflow at four widths, document direction, axe and a
 * visible keyboard focus ring, per locale and scheme.
 */
export function routeSweepTests(role: keyof typeof routeSets) {
  const routes = routeSets[role];
  return locales.map((locale) => ({
    title: `${role} routes reflow, keep direction, focus and axe [${locale}]`,
    details: { tag: ["@demo-core", "@layout", "@rtl", `@${locale}`] },
    body: async ({ page }: { page: Page }) => {
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
            if (process.env.UNIMIND_FRONTEND_AUDIT === "1" && theme === "light")
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
  }));
}

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
