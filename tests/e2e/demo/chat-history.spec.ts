import { bilingual, inLocales, pick } from "../support/copy";
import {
  b07DetailsName,
  b07SourcesName,
  b07UnitsName,
  unit,
} from "../support/demo";
import { isolation, navigate, send, signIn } from "../support/session";
import { expect, test } from "../support/test";

// Prepared study history: many scoped sessions, new replies without
// reseeding, and wrong-role or foreign-scope denial (B01/M53).
inLocales(["ar"], (locale) => {
  test(
    `prepared study history retains many scoped sessions`,
    { tag: ["@B01", "@M53", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(
        page,
        "student",
        locale,
        `${unit}/chat?fixture=dense&lang=${locale}`,
      );
      const history = page.locator("details").filter({
        has: page.locator(
          `summary[aria-label="${pick(locale, "Sessions and privacy", "الجلسات والخصوصية")}"]`,
        ),
      });
      await history.locator("summary").first().click();
      await expect(history.getByRole("listitem")).toHaveCount(12, {
        timeout: 5_000,
      });
      for (const index of [0, 5, 11]) {
        const button = history
          .getByRole("listitem")
          .nth(index)
          .getByRole("button");
        await button.focus();
        await expect(button).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page.locator("#exchange-2")).toBeVisible();
        await history.locator("summary").first().press("Enter");
        await expect(button).toHaveAttribute("aria-pressed", "true");
      }
      await history.locator("summary").first().press("Escape");
      const evidence = page
        .getByRole("link", {
          name: pick(locale, "Inspect evidence", "فحص الأدلة"),
          exact: true,
        })
        .nth(1);
      await expect(evidence).toHaveAttribute("href", /exchange=2&session=12/u);
      await evidence.press("Enter");
      await expect(page).toHaveURL(/\/evidence\?exchange=2&session=12/u);
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Source conflict", "تعارض المصادر"),
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByRole("link", {
          name: pick(locale, "Return to Chat", "العودة للمحادثة"),
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(/\/chat\?session=12/u);
      await page
        .getByRole("button", {
          name: locale === "en" ? "العربية" : "English",
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(
        new RegExp(`lang=${locale === "en" ? "ar" : "en"}`, "u"),
      );
      await expect(
        page.locator("#exchange-2 a").filter({
          hasText: locale === "en" ? "فحص الأدلة" : "Inspect evidence",
        }),
      ).toHaveAttribute("href", /session=12/u);
      await page
        .getByRole("button", {
          name: locale === "en" ? "English" : "العربية",
          exact: true,
        })
        .click();
      await page
        .getByRole("link", {
          name: b07SourcesName(locale),
          exact: true,
        })
        .click();
      await expect(page.getByRole("article")).toHaveCount(24);
      const titles = await page
        .getByRole("heading", { level: 3 })
        .allTextContents();
      expect(new Set(titles).size).toBe(24);
      expect(titles.at(-1)!.length).toBeGreaterThan(65);
      await page
        .getByRole("heading", { level: 3 })
        .last()
        .scrollIntoViewIfNeeded();
      await expect(
        page.getByRole("heading", { level: 3 }).last(),
      ).toBeVisible();
      await page.goBack();
      await expect(page).toHaveURL(/\/chat\?session=12/u);
      await expect(
        page
          .locator("#exchange-2 a")
          .filter({ hasText: pick(locale, "Inspect evidence", "فحص الأدلة") }),
      ).toHaveAttribute("href", /session=12/u);
      await page
        .locator("header summary")
        .filter({ hasText: b07DetailsName(locale) })
        .press("Enter");
      const units = page.getByRole("navigation", {
        name: b07UnitsName(locale),
        exact: true,
      });
      await units
        .getByRole("link", {
          name: pick(locale, "Biochemistry", "الكيمياء الحيوية"),
          exact: true,
        })
        .click();
      await expect(page.locator("#exchange-2")).toHaveCount(0);
      await history.locator("summary").first().click();
      await expect(history.getByRole("listitem")).toHaveCount(0);
      await history.locator("summary").first().press("Escape");
      await page
        .getByRole("link", {
          name: b07SourcesName(locale),
          exact: true,
        })
        .click();
      await expect(page.getByRole("article")).toHaveCount(8);
      await navigate(page, "/learn", locale);
      for (const [index, value] of [
        "university",
        "zagazig-university",
        "human-medicine",
        "human-medicine-year-1",
        "human-medicine-year-1-term-1",
      ].entries()) {
        await page.locator(`input[type="radio"][value="${value}"]`).check();
        await page
          .getByRole("button", {
            name:
              index === 4
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
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Your Study Shelf", "رف المذاكرة"),
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByRole("link", {
          name: pick(locale, "Subjects", "المواد"),
          exact: true,
        })
        .filter({ visible: true })
        .first()
        .click();
      await expect(
        page.getByRole("link", {
          name: pick(locale, "Open Anatomy", "فتح علم التشريح"),
          exact: true,
        }),
      ).toContainText(/(?:24|٢٤) (?:materials|مصادر)/u);
      await expect(
        page.getByRole("link", {
          name: pick(locale, "Open Biochemistry", "فتح الكيمياء الحيوية"),
          exact: true,
        }),
      ).toContainText(/(?:8|٨) (?:materials|مصادر)/u);
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `new replies, draft and selected language survive without reseeding`,
    { tag: ["@B01", "@M53", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(
        page,
        "student",
        locale,
        `${unit}/chat?fixture=dense&lang=${locale}`,
      );
      const history = page.locator("details").filter({
        has: page.locator(
          `summary[aria-label="${t("Sessions and privacy", "الجلسات والخصوصية")}"]`,
        ),
      });
      await history.locator("summary").first().click();
      await history
        .getByRole("button", {
          name: t("New session", "جلسة جديدة"),
          exact: true,
        })
        .press("Enter");
      const language = page
        .getByRole("group", {
          name: t("Study language", "لغة المذاكرة"),
          exact: true,
        })
        .locator('input[value="mixed"]');
      await language.check();
      await send(page, "supported", locale);
      await expect(page.locator("#exchange-1")).toContainText(
        "Lecture 6 handout, page 14",
      );
      const message = page.getByLabel(t("Message", "السؤال"), { exact: true });
      await message.fill(
        "Synthetic unsent draft for the new thirteenth session.",
      );
      await page
        .getByRole("link", {
          name: b07SourcesName(locale),
          exact: true,
        })
        .click();
      await expect(page.getByRole("article")).toHaveCount(24);
      await page
        .getByRole("link", {
          name: t("Return to Chat", "العودة للمحادثة"),
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(
        new URL(`${unit}/chat?lang=${locale}`, page.url()).href,
      );
      await expect(message).toHaveValue(
        "Synthetic unsent draft for the new thirteenth session.",
      );
      await expect(language).toBeChecked();
      await history.locator("summary").first().click();
      await expect(history.getByRole("listitem")).toHaveCount(13);
      await expect(
        history.getByRole("listitem").last().getByRole("button"),
      ).toHaveAttribute("aria-pressed", "true");
      await history.locator("summary").first().press("Escape");
      await page.reload();
      await expect(page).toHaveURL(/\/login\?/u);
      await signIn(page, "student", locale, `${unit}/chat?lang=${locale}`);
      await history.locator("summary").first().click();
      await expect(history.getByRole("listitem")).toHaveCount(0);
      await history.locator("summary").first().press("Escape");
      await page
        .getByRole("link", {
          name: b07SourcesName(locale),
          exact: true,
        })
        .click();
      await expect(page.getByRole("article")).toHaveCount(8);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `wrong role and foreign scope do not expose prepared records`,
    { tag: ["@B01", "@M53", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(
        page,
        "leader",
        locale,
        `${unit}/chat?fixture=dense&lang=${locale}`,
      );
      await expect(page.getByRole("main")).toContainText(
        t("Access unavailable", "الوصول غير متاح"),
      );
      await expect(
        page.getByRole("link", {
          name: t("Inspect evidence", "فحص الأدلة"),
          exact: true,
        }),
      ).toHaveCount(0);
      await signIn(
        page,
        "student",
        locale,
        `${unit.replace("year-1-term-1-cohort", "year-3-term-2-cohort")}/chat?fixture=dense&lang=${locale}`,
      );
      await expect(
        page.getByRole("heading", { name: "Page not found", exact: true }),
      ).toBeVisible();
      await signIn(
        page,
        "student",
        locale,
        `${unit.replace(/anatomy$/u, "biochemistry")}/sources?fixture=dense&lang=${locale}`,
      );
      await expect(page.getByRole("article")).toHaveCount(8);
      finish();
    },
  );
});
