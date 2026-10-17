import { bilingual, inLocales } from "../support/copy";
import {
  generateStudioExample,
  selectStudioExample,
  unit,
} from "../support/demo";
import {
  isolation,
  navigate,
  openSessionTools,
  send,
  signIn,
} from "../support/session";
import { expect, test } from "../support/test";
// Prepared failure fixtures. The condition classifier (which fixtures are
// temporary, which persistent, and their per-tool copy) is unit-tested in
// tests/unit/study-recovery.test.ts; these browser cases prove one wiring per
// tool family: the safe action, draft/result retention and role guards.

inLocales(["en"], (locale) => {
  test(
    `Shelf failures offer a temporary retry or a safe exit, never to another role`,
    { tag: ["@B08-B", `@${locale}`] },
    async ({ page }) => {
      const t = bilingual(locale);
      const retryAction = page.getByRole("button", {
        name: /Retry|Refresh|إعادة محاولة|تحديث عرض/u,
      });
      const browse = page.getByRole("link", {
        name: t("Browse available subjects", "تصفح المواد المتاحة"),
        exact: true,
      });
      const setup = page.getByRole("heading", {
        name: t("Set up your Study Shelf", "إعداد رف المذاكرة"),
        exact: true,
      });
      let finish = isolation(page);
      await signIn(page, "student", locale, "/learn?fixture=offline");
      await expect(browse).toBeVisible();
      await expect(retryAction).toBeVisible();
      await expect(retryAction).toContainText(t("Study Shelf", "رف المذاكرة"));
      await retryAction.press("Enter");
      await expect(page).not.toHaveURL(/fixture=/u);
      await expect(setup).toBeVisible();
      finish();

      finish = isolation(page);
      await signIn(page, "student", locale, "/learn?fixture=forbidden");
      await expect(browse).toBeVisible();
      await expect(retryAction).toHaveCount(0);
      await expect(page.getByRole("main")).not.toContainText(
        t("Anatomy", "علم التشريح"),
      );
      await browse.press("Enter");
      await expect(page).not.toHaveURL(/fixture=/u);
      await expect(setup).toBeVisible();
      finish();

      finish = isolation(page);
      await signIn(page, "leader", locale, "/learn?fixture=offline");
      await expect(retryAction).toHaveCount(0);
      await page
        .getByRole("link", { name: t("Back", "العودة"), exact: true })
        .click();
      await expect(page).toHaveURL(/\/batch-leader/u);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `a temporary Chat failure keeps the draft and reply across an authorized detour`,
    { tag: ["@B08-B", `@${locale}`] },
    async ({ page }) => {
      const t = bilingual(locale);
      const finish = isolation(page);
      await signIn(page, "student", locale, `${unit}/chat?fixture=offline`);
      const name = t("Chat", "المحادثة");
      const retry = page.getByRole("button", {
        name: t(`Retry ${name}`, `إعادة محاولة ${name}`),
        exact: true,
      });
      await expect(retry).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 2 }).filter({ hasText: name }),
      ).toBeVisible();
      await expect(page.getByRole("main")).not.toContainText(
        t("This module is currently unavailable.", "وحدة غير متاحة حاليًا."),
      );
      await expect(
        page
          .getByRole("navigation", {
            name: t("Workspace navigation", "تنقل مساحة المذاكرة"),
            exact: true,
          })
          .getByRole("link"),
      ).toHaveCount(4);
      const materials = page.getByRole("heading", {
        name: t("Materials", "مصادر المذاكرة"),
        exact: true,
      });
      await page
        .getByRole("link", {
          name: t("View available materials", "عرض مصادر المذاكرة المتاحة"),
          exact: true,
        })
        .click();
      await expect(materials).toBeVisible();
      await navigate(page, `${unit}/chat`, locale);
      await send(page, "supported", locale);
      await page.locator("#message").fill("Synthetic retained offline draft.");
      await page.goBack();
      await expect(materials).toBeVisible();
      await page.goBack();
      await expect(retry).toBeVisible();
      await retry.press("Enter");
      await expect(page).not.toHaveURL(/fixture=/u);
      await expect(page.locator("#message")).toHaveValue(
        "Synthetic retained offline draft.",
      );
      await expect(page.locator('article[id^="exchange-"]')).toHaveCount(1);
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `a stale Studio view refreshes without losing the generated aid or its settings`,
    { tag: ["@B08-B", `@${locale}`] },
    async ({ page }) => {
      const t = bilingual(locale);
      const finish = isolation(page);
      await signIn(page, "student", locale, `${unit}/studio?fixture=stale`);
      const name = t("Studio", "الاستوديو");
      const refresh = page.getByRole("button", {
        name: t(`Refresh ${name} view`, `تحديث عرض ${name}`),
        exact: true,
      });
      await expect(refresh).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 2 }).filter({ hasText: name }),
      ).toBeVisible();
      await expect(
        page
          .getByRole("navigation", {
            name: t("Workspace navigation", "تنقل مساحة المذاكرة"),
            exact: true,
          })
          .getByRole("link"),
      ).toHaveCount(4);
      const materials = page.getByRole("heading", {
        name: t("Materials", "مصادر المذاكرة"),
        exact: true,
      });
      await page
        .getByRole("link", {
          name: t("View available materials", "عرض مصادر المذاكرة المتاحة"),
          exact: true,
        })
        .click();
      await expect(materials).toBeVisible();
      await navigate(page, `${unit}/studio`, locale);
      await selectStudioExample(page, locale, {
        type: "flashcards",
        topic: "comparison",
        depth: "detailed",
        size: "extended",
        language: "mixed",
      });
      const original = await (
        await generateStudioExample(page, locale)
      ).innerText();
      await page.goBack();
      await expect(materials).toBeVisible();
      await page.goBack();
      await expect(refresh).toBeVisible();
      await refresh.press("Enter");
      await expect(page).not.toHaveURL(/fixture=/u);
      await expect(page.locator('[class*="artifactOutput"]')).toHaveText(
        original,
        { useInnerText: true },
      );
      await expect(page.locator("#artifact-language")).toHaveValue("mixed");
      await expect(page.locator("#artifact-type")).toHaveValue("flashcards");
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `a persistent study state hides scope metadata and offers no ineffective Retry`,
    { tag: ["@B08-B", `@${locale}`] },
    async ({ page }) => {
      const t = bilingual(locale);
      const retryAction = page.getByRole("button", {
        name: /Retry|Refresh|إعادة محاولة|تحديث عرض/u,
      });
      let finish = isolation(page);
      await signIn(
        page,
        "student",
        locale,
        `${unit}/chat?fixture=no-ready-source`,
      );
      const exit = page.getByRole("link", {
        name: t("Browse available subjects", "تصفح المواد المتاحة"),
        exact: true,
      });
      await expect(exit).toBeVisible();
      await expect(retryAction).toHaveCount(0);
      await expect(
        page.getByRole("navigation", {
          name: t("Workspace navigation", "تنقل مساحة المذاكرة"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(page.getByRole("main")).not.toContainText(
        t("Anatomy", "علم التشريح"),
      );
      await expect(page.getByRole("main")).not.toContainText(
        "zagazig-university",
      );
      await exit.press("Enter");
      await expect(page).toHaveURL(/\/learn\?.*view=subjects/u);
      await expect(page).not.toHaveURL(/fixture=/u);
      finish();

      finish = isolation(page);
      await signIn(page, "leader", locale, `${unit}/chat?fixture=offline`);
      await expect(retryAction).toHaveCount(0);
      await expect(page.getByRole("main")).not.toContainText(
        t("Anatomy", "علم التشريح"),
      );
      await page
        .getByRole("link", { name: t("Back", "العودة"), exact: true })
        .click();
      await expect(page).toHaveURL(/\/batch-leader/u);
      finish();
    },
  );
});

test(
  "loading and recoverable Chat states return to ordinary session tools",
  { tag: ["@demo-core", "@en"] },
  async ({ page }) => {
    const finish = isolation(page);
    const newSession = page.getByRole("button", {
      name: "New session",
      exact: true,
    });
    await signIn(page, "student", "en", `${unit}/chat?fixture=loading`);
    await openSessionTools(page, "en");
    await expect(newSession).toBeVisible();
    await signIn(page, "student", "en", `${unit}/chat?fixture=error`);
    await page.getByRole("button", { name: "Retry Chat", exact: true }).click();
    await openSessionTools(page, "en");
    await expect(newSession).toBeVisible();
    finish();
  },
);
