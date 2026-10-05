import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const password = "Synthetic-study-2026!";
const unit =
  "/learn/zagazig-university-human-medicine-year-1-term-1-cohort/zagazig-university-human-medicine-y1-t1-anatomy";
const pick = (locale: string, en: string, ar: string) =>
  locale === "ar" ? ar : en;

async function enter(page: Page, role: string, locale = "en") {
  await page.goto(`/login?lang=${locale}`);
  await expect(
    page.getByLabel(pick(locale, "Email address", "البريد الإلكتروني")),
  ).toHaveValue("");
  await page
    .getByLabel(pick(locale, "Email address", "البريد الإلكتروني"))
    .fill(`${role}@example.invalid`);
  await page
    .getByLabel(pick(locale, "Password", "كلمة المرور"), { exact: true })
    .fill(password);
  const forbidden: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      request.method() !== "GET" ||
      url.pathname.startsWith("/api/") ||
      request.headers()["rsc"] ||
      url.hostname !== "127.0.0.1"
    )
      forbidden.push(`${request.method()} ${url.pathname}`);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page
    .getByRole("button", {
      name: pick(locale, "Continue", "متابعة"),
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/consent\?/u);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", {
      name: pick(
        locale,
        "Accept all and continue to UniMind",
        "الموافقة والمتابعة إلى UniMind",
      ),
      exact: true,
    })
    .click();
  await expect(page).not.toHaveURL(/\/consent\?/u);
  return () => {
    expect(forbidden).toEqual([]);
    expect(errors).toEqual([]);
  };
}

for (const locale of ["en", "ar"]) {
  for (const role of ["student", "leader", "admin", "second-admin"]) {
    test(`hosted ${locale} ${role}: normal login and browser-only role navigation`, async ({
      page,
    }) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width: 390, height: 844 });
      const finish = await enter(page, role, locale);
      await expect(page).toHaveURL(
        new RegExp(
          role === "student"
            ? "/learn\\?"
            : role === "leader"
              ? "/batch-leader\\?"
              : "/admin\\?",
          "u",
        ),
      );
      if (role === "admin" || role === "second-admin") {
        await expect(
          page.getByLabel(
            pick(locale, "Reason for this change", "سبب هذا التغيير"),
          ),
        ).toHaveCount(0);
        await page
          .getByRole("button", {
            name: new RegExp(pick(locale, "^Hide unit", "^إخفاء الوحدة"), "u"),
          })
          .click();
        await page
          .getByLabel(
            pick(locale, "Reason for this change", "سبب هذا التغيير"),
            {
              exact: false,
            },
          )
          .fill(
            pick(
              locale,
              "Temporarily hide this unit for review.",
              "إخفاء الوحدة مؤقتًا للمراجعة.",
            ),
          );
        await page
          .getByRole("button", {
            name: pick(locale, "Review exact change", "مراجعة التغيير المحدد"),
            exact: true,
          })
          .click();
        await page
          .getByRole("button", {
            name: pick(locale, "Submit this action", "إرسال هذا الإجراء"),
            exact: true,
          })
          .click();
        await expect(
          page.getByText(
            pick(
              locale,
              "The governed change was recorded.",
              "تم تسجيل التغيير الحوكمي.",
            ),
            { exact: true },
          ),
        ).toBeVisible();
        await page.setViewportSize({ width: 1440, height: 900 });
        await page
          .getByRole("button", {
            name: new RegExp(
              pick(locale, "Place raw-data hold", "وضع حجز على البيانات الخام"),
              "u",
            ),
          })
          .click();
        await page
          .getByLabel(
            pick(locale, "Reason for this change", "سبب هذا التغيير"),
            { exact: false },
          )
          .fill(
            pick(
              locale,
              "Preserve this source for review.",
              "حفظ هذا المصدر للمراجعة.",
            ),
          );
        await page
          .locator('input[name="holdExpiresAtLocal"]')
          .fill("2030-01-02T16:30");
        await page.locator('input[name="reviewAttested"]').check();
        await page
          .getByRole("button", {
            name: pick(locale, "Review exact change", "مراجعة التغيير المحدد"),
            exact: true,
          })
          .click();
        await page
          .getByRole("button", {
            name: pick(
              locale,
              "Confirm this exact change",
              "تأكيد هذا التغيير المحدد",
            ),
            exact: true,
          })
          .click();
        await expect(page.getByRole("status").last()).toContainText(
          pick(locale, "distinct founder", "مؤسس مختلف"),
        );
        await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
        for (const resource of [
          "sources",
          "jobs",
          "quality",
          "usage",
          "incidents",
        ]) {
          await page
            .locator(`a[href="/admin/${resource}?lang=${locale}"]`)
            .filter({ visible: true })
            .first()
            .click();
          await expect(page).toHaveURL(
            new RegExp(`/admin/${resource}\\?`, "u"),
          );
          await expect(
            page.getByText(
              /Every stage is a fixture|No worker runs|No academic or production PASS|No reservation, usage settlement|No alert or notification is sent|كل مرحلة مثال|لا عامل يعمل|لا ندعي اجتيازًا|لا حجز أو تسوية|لا تنبيه أو إشعار/u,
            ),
          ).toHaveCount(0);
        }
        await page.setViewportSize({ width: 390, height: 844 });
      }
      if (role === "leader") {
        await page
          .locator(
            `a[href="/batch-leader/campaigns/sample-campaign?lang=${locale}"]`,
          )
          .filter({ visible: true })
          .first()
          .click();
        await page
          .getByRole("button", {
            name: pick(
              locale,
              "Add approved reference",
              "إضافة المرجع المعتمد",
            ),
            exact: true,
          })
          .click();
        await page
          .getByLabel(pick(locale, "I have permission", "لدي صلاحية"))
          .check();
        await page
          .getByRole("button", {
            name: pick(locale, "Upload files", "رفع الملفات"),
            exact: true,
          })
          .click();
        await expect(
          page.getByText(
            pick(locale, "Submission received", "تم استلام الإرسال"),
            { exact: true },
          ),
        ).toBeVisible();
      }
      await expect(
        page.getByText("Synthetic demo · Simulated services", { exact: false }),
      ).toHaveCount(0);
      await expect(
        page.getByText("عرض تجريبي · خدمات محاكاة", { exact: false }),
      ).toHaveCount(0);
      await page
        .locator(`a[href="/settings?lang=${locale}"]`)
        .filter({ visible: true })
        .first()
        .click();
      await expect(page).toHaveURL(/\/settings\?/u);
      await expect(
        page.getByLabel(pick(locale, "Theme", "السمة"), { exact: true }),
      ).toBeVisible();
      await page.goBack();
      await expect(page).not.toHaveURL(/\/settings\?/u);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      finish();
    });
  }
}

test("hosted student: study memory, locale, sign-out, refresh and new-document isolation", async ({
  page,
  context,
}) => {
  test.setTimeout(120_000);
  // Compile guarded routes before entering document-local fixtures. A cold
  // development rebuild can remount the browser-only tree in another tab.
  // Denial remains checked both before entry and in a new document afterward.
  await page.goto(unit + "/chat?lang=en");
  await expect(page).toHaveURL(/\/login\?/u);
  await page.goto("/settings?lang=en");
  await expect(page).toHaveURL(/\/login\?/u);
  const finish = await enter(page, "student");
  const selects = [
    "Education stage",
    "University",
    "Faculty",
    "Academic year",
    "Study period",
  ];
  const values = [
    "university",
    "zagazig-university",
    "human-medicine",
    "human-medicine-year-1",
    "human-medicine-year-1-term-1",
  ];
  for (let i = 0; i < selects.length; i++)
    await page
      .getByLabel(selects[i]!, { exact: true })
      .selectOption(values[i]!);
  await page
    .getByRole("button", { name: "Open Study Shelf", exact: true })
    .click();
  await page
    .locator(`a[href="${unit}?lang=en"]`)
    .filter({ visible: true })
    .first()
    .click();
  await page
    .locator(`a[href="${unit}/chat?lang=en"]`)
    .filter({ visible: true })
    .first()
    .click();
  await page
    .getByLabel("Message", { exact: true })
    .fill("Explain the sample unit's study sequence.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Inspect evidence", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Interface language", { exact: true })
    .selectOption("ar");
  await expect(
    page.getByRole("link", { name: "فحص الأدلة", exact: true }),
  ).toBeVisible();
  await page.getByLabel("لغة الواجهة", { exact: true }).selectOption("en");
  await page
    .locator('a[href="/settings?lang=en"]')
    .filter({ visible: true })
    .first()
    .click();
  await page
    .getByRole("link", { name: "Return to last study tool", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Inspect evidence", exact: true }),
  ).toBeVisible();
  finish();
  const another = await context.newPage();
  await another.goto(unit + "/chat?lang=en");
  await expect(another).toHaveURL(/\/login\?/u);
  await another.close();
  await page
    .locator('a[href="/settings?lang=en"]')
    .filter({ visible: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?/u);
  await expect(page.getByLabel("Email address")).toHaveValue("");
  await enter(page, "student");
  await expect(
    page.getByRole("heading", { name: "Set up your Study Shelf", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/login\?/u);
});

test("normal Auth and direct protected routes cannot acquire synthetic access", async ({
  page,
}) => {
  test.setTimeout(60_000);
  for (const [email, secret] of [
    ["student@example.invalid", "wrong-password"],
    ["ordinary@example.invalid", password],
  ]) {
    await page.goto("/login?lang=en");
    await page.getByLabel("Email address").fill(email!);
    await page.getByLabel("Password", { exact: true }).fill(secret!);
    const mutation = page.waitForRequest(
      (request) =>
        request.method() === "POST" &&
        Boolean(request.headers()["next-action"]),
    );
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await mutation;
    await expect(page).toHaveURL(/\/login\?/u);
    await expect(page.getByRole("alert")).toBeVisible();
  }
  await page.goto("/admin?synthetic=true&role=admin&lang=en");
  await expect(page).toHaveURL(/\/login\?/u);
  const direct = await page.request.get("/synthetic-runtime/admin");
  expect(direct.status()).toBe(404);
});
