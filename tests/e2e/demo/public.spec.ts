import { pick } from "../support/copy";
import { chooseTheme, unit } from "../support/demo";
import {
  expectAxe,
  expectReflow,
  forEachLocaleTheme,
  layoutWidths,
  applyTheme,
  withEnlargedText,
} from "../support/layout";
import { isolation, navigate, signIn } from "../support/session";
import { expect, test } from "../support/test";
const publicPages = [
  "/",
  "/login",
  "/register",
  "/verify-email?status=expired_link",
  "/forgot-password?status=replayed_link",
] as const;

forEachLocaleTheme((locale, theme) => {
  test(
    `public and identity pages reflow and pass axe [${locale} ${theme}]`,
    { tag: ["@demo-core", "@premium", `@${locale}`, `@${theme}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await applyTheme(page, theme);
      for (const path of publicPages) {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(
          `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`,
        );
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page).toHaveTitle(/\S/u);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.locator("html")).toHaveAttribute(
          "dir",
          locale === "ar" ? "rtl" : "ltr",
        );
        const introduction = page.getByRole("complementary");
        if (path === "/login")
          await expect(
            introduction.getByText(/Study deeper\s*Go further\./u),
          ).toBeVisible();
        await expectReflow(page);
        await expectAxe(page);
        for (const width of path === "/login"
          ? [1000, 768, 390, 320]
          : layoutWidths.slice(1)) {
          await page.setViewportSize({ width, height: 844 });
          await expectReflow(page);
          if (path === "/login") {
            // The working form replaces the brand introduction below desktop.
            await expect(introduction).toBeHidden();
            await expect(
              page.getByLabel(
                pick(locale, "Email address", "البريد الإلكتروني"),
              ),
            ).toBeVisible();
          }
        }
        await withEnlargedText(page, () => expectReflow(page));
      }
      finish();
    },
  );
});

test(
  "appearance storage denial falls back to System and controls remain usable",
  { tag: ["@demo-core", "@en"] },
  async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw new DOMException("Synthetic storage denied", "SecurityError");
      };
      Storage.prototype.setItem = () => {
        throw new DOMException("Synthetic storage denied", "SecurityError");
      };
    });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Study deeper Go further." }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await signIn(page, "student", "en", unit);
    await navigate(page, "/settings");
    await chooseTheme(page, "light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  },
);
