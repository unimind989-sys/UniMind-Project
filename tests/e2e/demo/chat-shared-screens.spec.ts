// WP03-T17: the synthetic half of the shared student-screen assertions. The
// real half runs the same checks in tests/e2e-database/product-shell.spec.ts.
import { reviewCatalogRows } from "../support/app-fixtures";
import { inLocales } from "../support/copy";
import { unit } from "../support/demo";
import { isolation, navigate, signIn } from "../support/session";
import {
  expectChatScreen,
  expectMaterialsScreen,
  expectQuizSetupScreen,
  expectStudentSettingsScreen,
  expectStudioScreen,
  expectStudyFrame,
} from "../support/shared-screens";
import { test } from "../support/test";

const row = reviewCatalogRows.find(
  (entry) => `/learn/${entry.cohort.id}/${entry.unit.id}` === unit,
)!;

inLocales(["en", "ar"], (locale) => {
  test(
    `student screens match the shared real-mode structure (${locale})`,
    { tag: ["@WP03-T17", `@${locale}`] },
    async ({ page }) => {
      test.setTimeout(120_000);
      const finish = isolation(page);
      const title = locale === "ar" ? row.unit.nameAr : row.unit.nameEn;
      await signIn(page, "student", locale, unit);
      await expectStudyFrame(page, locale, title);
      await expectMaterialsScreen(page, locale, "synthetic");
      await navigate(page, `${unit}/chat`, locale);
      await expectChatScreen(page, locale, "synthetic");
      await navigate(page, `${unit}/studio`, locale);
      await expectStudioScreen(page, locale, "synthetic");
      await navigate(page, `${unit}/quiz`, locale);
      await expectQuizSetupScreen(page, locale, "synthetic");
      await navigate(page, "/settings", locale);
      await expectStudentSettingsScreen(page, locale, "synthetic");
      finish();
    },
  );
});
