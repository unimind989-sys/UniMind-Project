import { bilingual, inLocales } from "../support/copy";
import { completeAcademicSetup, showAccountView } from "../support/demo";
import { continueAs, isolation, navigate, signIn } from "../support/session";
import { expect, test } from "../support/test";

// WP03-T27: a genuinely new account (the fifth demo pair) goes through the
// same first-run profile step as a newly registered real account.

inLocales(["en"], (locale) => {
  test(
    `a new account sets its profile once, switches language without losing the name, then sets its academic path`,
    { tag: ["@onboarding", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "new-student", locale);
      await expect(page).toHaveURL(/\/welcome\?/u);
      await expect(
        page.getByRole("heading", { name: "Set up your profile", level: 1 }),
      ).toBeVisible();
      // No fixture name stands in for the missing profile.
      await expect(page.getByText("Samir Hassan")).toHaveCount(0);

      // An empty name is refused, focused and announced; nothing is saved.
      await page
        .getByRole("button", { name: "Save and continue", exact: true })
        .click();
      await expect(page.getByRole("alert")).toHaveText("Enter your name.");
      await expect(page.getByRole("alert")).toBeFocused();
      const name = page.getByLabel("Full name", { exact: true });
      await expect(name).toHaveAttribute("aria-invalid", "true");
      await expect(name).toHaveAttribute("autocomplete", "name");

      // Switching the interface language keeps what was typed.
      await name.fill("  Layla   Hassan ");
      await page.getByRole("radio", { name: "العربية", exact: true }).check();
      await expect(page).toHaveURL(/[?&]lang=ar/u);
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      const arabicName = page.getByLabel("الاسم الكامل", { exact: true });
      await expect(arabicName).toHaveValue("  Layla   Hassan ");

      // Appearance applies at once and is remembered on this device.
      await page
        .getByRole("group", { name: "السمة" })
        .locator('input[value="dark"]')
        .check();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

      await page
        .getByRole("button", { name: "حفظ ومتابعة", exact: true })
        .click();
      // The academic setup follows, in the chosen language.
      await expect(page).toHaveURL(/\/learn\?(?:.*&)?lang=ar/u);
      await completeAcademicSetup(page, "ar");
      const profile = page
        .getByRole("link", { name: "Layla Hassan", exact: true })
        .filter({ visible: true });
      await expect(profile).toBeVisible();
      await expect(profile).toContainText("L");
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `the profile can be edited later and a returning account never sees the step again`,
    { tag: ["@onboarding", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page),
        t = bilingual(locale);
      await signIn(page, "new-student", locale);
      await expect(page).toHaveURL(/\/welcome\?/u);
      const name = page.getByLabel(t("Full name", "الاسم الكامل"), {
        exact: true,
      });
      // A name with no letters is refused with a specific message.
      await name.fill("12345");
      await page
        .getByRole("button", { name: t("Save and continue", "حفظ ومتابعة") })
        .click();
      await expect(page.getByRole("alert")).toHaveText(
        t(
          "Use letters, spaces and common punctuation in your name.",
          "استخدم حروفًا ومسافات وعلامات ترقيم عادية في اسمك.",
        ),
      );
      await expect(name).toHaveValue("12345");
      await name.fill("ليلى حسن");
      await page
        .getByRole("button", { name: t("Save and continue", "حفظ ومتابعة") })
        .click();
      await expect(page).toHaveURL(/\/learn\?/u);
      await completeAcademicSetup(page, locale);

      // Settings -> Profile edits the same name.
      await navigate(page, "/settings", locale);
      await showAccountView(page, "profile");
      const edit = page.getByLabel(t("Full name", "الاسم الكامل"), {
        exact: true,
      });
      await expect(edit).toHaveValue("ليلى حسن");
      await expect(page.getByText("new-student@example.invalid")).toBeVisible();
      await edit.fill("ليلى أحمد");
      await page
        .getByRole("button", {
          name: t("Save profile", "حفظ الملف الشخصي"),
          exact: true,
        })
        .click();
      await expect(
        page
          .getByRole("status")
          .filter({ hasText: t("Profile saved.", "تم حفظ الملف الشخصي.") }),
      ).toBeVisible();
      await expect(
        page
          .getByRole("link", { name: "ليلى أحمد", exact: true })
          .filter({ visible: true }),
      ).toBeVisible();

      // Sign out and back in within this document: a returning account.
      await page
        .getByRole("button", {
          name: t("Sign out", "تسجيل الخروج"),
          exact: true,
        })
        .first()
        .click();
      await expect(page).toHaveURL(/\/login\?/u);
      await continueAs(page, "new-student@example.invalid", locale);
      await expect(page).not.toHaveURL(/\/welcome/u);
      await expect(page).not.toHaveURL(/\/consent/u);
      finish();
    },
  );
});

test(
  `the existing demo accounts already have profiles and never see the step`,
  { tag: ["@onboarding"] },
  async ({ page }) => {
    for (const role of ["leader", "admin"] as const) {
      await signIn(page, role, "en");
      await expect(page).not.toHaveURL(/\/welcome/u);
      await page.goto("/login?lang=en");
    }
  },
);
