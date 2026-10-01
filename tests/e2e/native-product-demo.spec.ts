import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import nodePath from "node:path";
import { expect, test, type Page } from "@playwright/test";
import {
  promptExamples,
  artifactTypes,
  actionFixtures,
} from "../../src/app/_components/synthetic-fixtures";

const unit =
  "/learn/zagazig-university-human-medicine-year-1-term-1-cohort/zagazig-university-human-medicine-y1-t1-anatomy";
const campaign = "/batch-leader/campaigns/sample-campaign";
type Locale = "en" | "ar";
const pick = (locale: Locale, en: string, ar: string) =>
  locale === "ar" ? ar : en;
test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1"
      ? route.continue()
      : route.abort("blockedbyclient"),
  );
});
function isolation(page: Page) {
  const violations: string[] = [];
  page.on("request", (request) => {
    if (
      !["GET", "HEAD"].includes(request.method()) ||
      new URL(request.url()).hostname !== "127.0.0.1" ||
      new URL(request.url()).pathname.startsWith("/api/")
    )
      violations.push(`${request.method()} ${new URL(request.url()).pathname}`);
  });
  page.on("response", (response) => {
    if (response.headers()["set-cookie"]) violations.push("cookie");
  });
  page.on("pageerror", (error) => violations.push(error.name));
  return () => expect(violations).toEqual([]);
}
async function signIn(
  page: Page,
  role = "student",
  locale: Locale = "en",
  next?: string,
) {
  await page.goto(
    `/login?lang=${locale}&email=${role}@example.invalid${next ? `&next=${encodeURIComponent(next)}` : ""}`,
  );
  await expect(
    page.getByLabel(pick(locale, "Email address", "البريد الإلكتروني")),
  ).toHaveValue(`${role}@example.invalid`);
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
        "Accept all and enter your shelf",
        "الموافقة ودخول مكتبتك",
      ),
      exact: true,
    })
    .click();
  await expect(page).not.toHaveURL(/\/consent\?/u);
}
async function navigate(page: Page, path: string, locale: Locale = "en") {
  // Test setup follows the same client router as a product link, preserving the
  // demo's document-local adapter. No identity is injected by the helper.
  await page.locator(`a[href="${path}?lang=${locale}"]`).first().click();
}
async function send(
  page: Page,
  kind: keyof typeof promptExamples,
  locale: Locale = "en",
) {
  await page
    .getByLabel(pick(locale, "Message", "السؤال"), { exact: true })
    .fill(promptExamples[kind][locale === "ar" ? 1 : 0]);
  await page
    .getByRole("button", { name: pick(locale, "Send", "إرسال"), exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: pick(locale, "Simulated stream", "بث محاكى") }),
  ).toHaveCount(0);
}
for (const locale of ["en", "ar"] as const) {
  test(`${locale}: academic setup, editable account settings and persistent appearance`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale);
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Set up your Study Shelf", "إعداد رف المذاكرة"),
      }),
    ).toBeVisible();
    await expect(page).toHaveTitle(/\S/u);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page
      .getByLabel(pick(locale, "Education stage", "المرحلة التعليمية"), {
        exact: true,
      })
      .selectOption("university");
    await page
      .getByLabel(pick(locale, "University", "الجامعة"), { exact: true })
      .selectOption("zagazig-university");
    await page
      .getByLabel(pick(locale, "Faculty", "الكلية"), { exact: true })
      .selectOption("human-medicine");
    await page
      .getByLabel(pick(locale, "Academic year", "السنة الدراسية"), {
        exact: true,
      })
      .selectOption("human-medicine-year-1");
    await page
      .getByLabel(pick(locale, "Study period", "الفترة الدراسية"), {
        exact: true,
      })
      .selectOption("human-medicine-year-1-term-1");
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
    ).toBeFocused();
    await expect(
      page.getByRole("link", {
        name: pick(locale, "Open Anatomy", "فتح علم التشريح"),
        exact: true,
      }),
    ).toBeVisible();
    await navigate(page, "/settings", locale);
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Account", "الحساب"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(page).toHaveTitle(/\S/u);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await expect(
      page.getByLabel(pick(locale, "Academic year", "السنة الدراسية"), {
        exact: true,
      }),
    ).toHaveValue("human-medicine-year-1");
    const appearance = page.getByLabel(pick(locale, "Theme", "السمة"), {
      exact: true,
    });
    await appearance.selectOption("dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await appearance.selectOption("light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await appearance.selectOption("system");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await appearance.selectOption("dark");
    await page
      .getByLabel(pick(locale, "Academic year", "السنة الدراسية"), {
        exact: true,
      })
      .selectOption("human-medicine-year-2");
    await page
      .getByLabel(pick(locale, "Study period", "الفترة الدراسية"), {
        exact: true,
      })
      .selectOption("human-medicine-year-2-term-1");
    await page
      .getByRole("button", {
        name: pick(locale, "Save academic settings", "حفظ الإعدادات الدراسية"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("status").filter({
        hasText: pick(
          locale,
          "Academic settings saved.",
          "تم حفظ الإعدادات الدراسية.",
        ),
      }),
    ).toBeVisible();
    await navigate(page, "/learn", locale);
    await expect(
      page.getByText(
        pick(
          locale,
          "Faculty of Medicine · Second year · Term 1",
          "كلية الطب البشري · السنة الثانية · الترم الأول",
        ),
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page).toHaveTitle(/\S/u);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    // The isolated demo resets identity/profile memory on reload. Appearance
    // alone persists; actual profile durability is proven at the SQL seam.
    await page.reload();
    await expect(page).toHaveURL(/\/login\?/u);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    finish();
  });
}
for (const locale of ["en", "ar"] as const) {
  test(`${locale}: public and identity surfaces reflow with AA contrast in both themes`, async ({
    page,
  }) => {
    const finish = isolation(page);
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        for (const path of [
          "/",
          "/login",
          "/register",
          "/verify-email?status=expired_link",
          "/forgot-password?status=replayed_link",
        ]) {
          await page.goto(
            `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`,
          );
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
          await expect(page).toHaveTitle(/\S/u);
          await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            theme,
          );
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          ).toBe(true);
          expect(
            (
              await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
                .analyze()
            ).violations,
          ).toEqual([]);
        }
      }
    }
    finish();
  });
}
test("appearance storage denial falls back to System and controls remain usable", async ({
  page,
}) => {
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
  await page.getByLabel("Theme", { exact: true }).selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
for (const locale of ["en", "ar"] as const) {
  test(`${locale}: normal student session, seven answer outcomes, evidence and report`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale, unit);
    await expect(page).toHaveURL(new RegExp(unit));
    await navigate(page, unit + "/chat", locale);
    await page
      .getByRole("button", {
        name: pick(locale, "New session", "جلسة جديدة"),
        exact: true,
      })
      .click();
    for (const kind of Object.keys(
      promptExamples,
    ) as (keyof typeof promptExamples)[])
      await send(page, kind, locale);
    await expect(page.locator("article")).toHaveCount(7);
    await page.locator(`a[href*="${unit}/evidence?"]`).first().click();
    await expect(
      page.getByText(
        pick(locale, "Synthetic sequence handout", "ملزمة الترتيب التجريبية"),
        { exact: true },
      ),
    ).toBeVisible();
    await navigate(page, unit + "/chat", locale);
    await page.locator(`a[href*="${unit}/report?"]`).first().click();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", {
        name: pick(locale, "Submit report", "إرسال البلاغ"),
        exact: true,
      })
      .click();
    await expect(page.getByRole("status").last()).toContainText(
      pick(locale, "Simulated report received", "استلم البلاغ المحاكى"),
    );
    await expect(
      page.getByRole("button", {
        name: pick(locale, "Submit report", "إرسال البلاغ"),
        exact: true,
      }),
    ).toBeDisabled();
    await expect(
      page.getByLabel(pick(locale, "Review scenario", "سيناريو المراجعة")),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /Complete simulated/u }),
    ).toHaveCount(0);
    finish();
  });
  test(`${locale}: all six Studio artifacts, untimed quiz, score and source review`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale, unit);
    await navigate(page, unit + "/studio", locale);
    for (const [id, en, ar] of artifactTypes) {
      await page
        .getByRole("radio", { name: pick(locale, en, ar), exact: true })
        .check();
      await page
        .getByRole("combobox", {
          name: pick(locale, "Language", "اللغة"),
          exact: true,
        })
        .selectOption(id === "guide" ? "mixed" : locale);
      await page
        .getByRole("button", {
          name: pick(locale, "Generate", "إنشاء"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: new RegExp(pick(locale, "Simulated artifact", "مخرج محاكى")),
        }),
      ).toBeFocused();
      await expect(
        page.getByRole("button", {
          name: pick(locale, "Generate", "إنشاء"),
          exact: true,
        }),
      ).toBeEnabled();
    }
    await page
      .getByRole("link", {
        name: pick(locale, "Unit sources", "مصادر الوحدة"),
        exact: true,
      })
      .click();
    await page
      .getByText(pick(locale, "View supporting excerpt", "عرض النص الداعم"), {
        exact: true,
      })
      .first()
      .click();
    await expect(
      page.getByText(
        pick(
          locale,
          "Identify the labels, then compare the diagrams.",
          "حدد الأسماء ثم قارن الرسوم.",
        ),
        { exact: true },
      ),
    ).toBeVisible();
    await page
      .getByRole("link", {
        name: pick(locale, "Return to Studio", "العودة للاستوديو"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: new RegExp(pick(locale, "Simulated artifact", "مخرج محاكى")),
      }),
    ).toBeVisible();
    await navigate(page, unit + "/quiz", locale);
    await page
      .getByRole("button", {
        name: pick(locale, "Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/quiz\/sample-attempt\?/u);
    await expect(
      page.getByRole("button", {
        name: pick(locale, "Submit answers", "تسليم الإجابات"),
        exact: true,
      }),
    ).toBeDisabled();
    await page
      .getByRole("radio", {
        name: pick(locale, "Identify labels", "تحديد الأسماء"),
        exact: true,
      })
      .check();
    await page
      .getByRole("radio", {
        name: pick(locale, "No duration is supplied", "لا توجد مدة محددة"),
        exact: true,
      })
      .check();
    await page
      .getByRole("button", {
        name: pick(locale, "Submit answers", "تسليم الإجابات"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/sample-attempt\/review\?/u);
    await expect(page.getByRole("status").last()).toContainText("2 / 2");
    await navigate(page, unit + "/sources", locale);
    await expect(page.locator("h3")).toHaveCount(8);
    finish();
  });
  test(`${locale}: native Batch Leader file/reference form and consistent tracking`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "leader", locale);
    await navigate(page, campaign, locale);
    await page
      .locator('input[name="sourceName"]')
      .fill("Synthetic study source");
    await page
      .locator('textarea[name="sourceDescription"]')
      .fill("Invented source for the UniMind synthetic product flow.");
    await page
      .getByRole("combobox", {
        name: pick(locale, "Submission method", "طريقة الإرسال"),
      })
      .selectOption("reference");
    await page.locator('input[name="declaredRights"]').check();
    await page
      .getByRole("button", {
        name: pick(locale, "Validate and upload", "فحص ورفع الملف"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", {
        name: pick(locale, "Finalize submission", "تأكيد الإرسال"),
        exact: true,
      }),
    ).toBeEnabled();
    await page
      .getByRole("button", {
        name: pick(locale, "Finalize submission", "تأكيد الإرسال"),
        exact: true,
      })
      .click();
    await expect(
      page.getByText(pick(locale, "Submission received", "تم استلام الإرسال"), {
        exact: true,
      }),
    ).toBeVisible();
    const item = page
      .getByRole("button", {
        name: new RegExp(pick(locale, "Anatomy handout", "ملزمة التشريح")),
      })
      .first();
    await expect(item).toContainText(pick(locale, "Submitted", "تم الإرسال"));
    await expect(item).not.toContainText(
      pick(locale, "Awaiting file", "بانتظار ملف"),
    );
    finish();
  });
  test(`${locale}: responsive routes, accessibility, RTL, keyboard and product navigation`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const routes = [
      ["student", "/learn"],
      ["student", unit],
      ...[
        "chat",
        "studio",
        "quiz",
        "sources",
        "evidence",
        "report",
        "quiz/sample-attempt",
        "quiz/sample-attempt/review",
      ].map((path) => ["student", `${unit}/${path}`]),
      ["student", "/settings"],
      ["leader", "/batch-leader"],
      ["leader", campaign],
      ["leader", "/batch-leader/invitation"],
      ["admin", "/admin"],
      ...[
        "catalog",
        "cohorts",
        "campaigns",
        "sources",
        "jobs",
        "quality",
        "usage",
        "incidents",
      ].map((resource) => ["admin", `/admin/${resource}`]),
    ];
    for (const [role, path] of routes) {
      await signIn(page, role!, locale, path);
      await expect(page).toHaveURL(new RegExp(path!));
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        if (process.env.UNIMIND_FRONTEND_AUDIT === "1") {
          const directory = nodePath.resolve(
            ".impeccable/review/baseline",
            locale,
            String(width),
          );
          await mkdir(directory, { recursive: true });
          const name = path!.replaceAll("/", "_");
          await page.screenshot({
            path: `${directory}/${name}.png`,
            fullPage: true,
          });
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
                    contentOverflow:
                      element.scrollWidth > element.clientWidth + 2,
                    containerOverflow:
                      rect.left < parent.left - 2 ||
                      rect.right > parent.right + 2,
                  };
                }),
            );
          await writeFile(
            `${directory}/${name}.json`,
            JSON.stringify(findings, null, 2),
          );
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width + 1);
      }
      await expect(page.locator("html")).toHaveAttribute(
        "dir",
        locale === "ar" ? "rtl" : "ltr",
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.keyboard.press("Tab");
      const focus = await page
        .locator(":focus")
        .evaluate((element) => getComputedStyle(element).outlineStyle);
      expect(focus).not.toBe("none");
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await signIn(page, "student", locale, unit + "/chat");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(391);
    await page
      .getByRole("button", {
        name: pick(locale, "New session", "جلسة جديدة"),
        exact: true,
      })
      .click();
    await expect(
      page.getByLabel(pick(locale, "Message", "السؤال"), { exact: true }),
    ).toBeEnabled();
    finish();
  });
}

test("Auth validation, registration, email callback, consent and recovery use no real services", async ({
  page,
}) => {
  const finish = isolation(page);
  await page.goto("/login");
  await page.getByLabel("Email address").fill("invalid");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toBeFocused();
  await page
    .getByRole("link", { name: "Create an account", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(/\/verify-email\?/u);
  await page
    .getByRole("button", { name: "Resend verification email", exact: true })
    .click();
  await expect(page.getByRole("status").last()).toContainText("email");
  // This supplied link replaces the email delivery fixture, outside product UI.
  await page.goto("/auth/callback?code=sample-verification&type=signup");
  await expect(page).toHaveURL(/\/consent\?/u);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", {
      name: "Accept all and enter your shelf",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Sign out", exact: true })
    .first()
    .click();
  await page
    .getByRole("link", { name: "Forgot your password?", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Send recovery email", exact: true })
    .click();
  await expect(page.getByRole("status").last()).toContainText("email");
  await page.goto("/auth/callback?code=sample-recovery&next=%2Freset-password");
  await page
    .getByRole("button", { name: "Update password", exact: true })
    .click();
  await expect(page).toHaveURL(/\/login\?/u);
  for (const fixture of ["expired", "replayed"]) {
    await page.goto(`/reset-password?token=sample-recovery&fixture=${fixture}`);
    await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Update password", exact: true }),
    ).toHaveCount(0);
  }
  finish();
});

test("normal timed attempt expires, private future exchanges and scope remain separate", async ({
  page,
}) => {
  const finish = isolation(page);
  await signIn(page, "student", "en", unit);
  await navigate(page, "/settings");
  await page
    .getByLabel("Sharing mode", { exact: true })
    .selectOption("private");
  await page.goBack();
  await navigate(page, unit + "/chat");
  await page.getByRole("button", { name: "New session", exact: true }).click();
  await send(page, "supported");
  await page
    .getByLabel("Switch unit", { exact: true })
    .selectOption("/learn/synthetic-credit-cohort/synthetic-credit-unit");
  await navigate(
    page,
    "/learn/synthetic-credit-cohort/synthetic-credit-unit/chat",
  );
  await expect(page.locator("article")).toHaveCount(0);
  await navigate(
    page,
    "/learn/synthetic-credit-cohort/synthetic-credit-unit/quiz",
  );
  await page.getByLabel("Mode", { exact: true }).selectOption("timed");
  await page.clock.install();
  await page.getByRole("button", { name: "Start quiz", exact: true }).click();
  await expect(page.getByRole("timer")).toBeVisible();
  await page.clock.fastForward(61_000);
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "expired",
  );
  finish();
});

test("prepared failure states recover through normal navigation, never a reviewer interface", async ({
  page,
}) => {
  const finish = isolation(page);
  for (const fixture of [
    "loading",
    "empty",
    "error",
    "offline",
    "forbidden",
    "quota",
    "capacity",
    "locked",
    "unpublished",
    "no-ready-source",
    "wrong-scope",
    "expired",
    "replayed",
    "stale",
  ]) {
    await signIn(page, "student", "en", `${unit}/chat?fixture=${fixture}`);
    if (fixture === "loading")
      await expect(
        page.getByRole("button", { name: "New session", exact: true }),
      ).toBeVisible();
    else {
      await expect(
        page.getByRole("button", { name: "Retry", exact: true }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Retry", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "New session", exact: true }),
      ).toBeVisible();
    }
  }
  finish();
});

test("synthetic admin changes share availability, preserve distinct confirmation and block enablement", async ({
  page,
}) => {
  const finish = isolation(page);
  await signIn(page, "admin");
  await page.getByRole("button", { name: /Hide unit/u }).click();
  await page
    .getByLabel("Reason for this change")
    .fill("Synthetic readiness review.");
  await page
    .getByRole("button", { name: "Review exact change", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit this action", exact: true })
    .click();
  await expect(
    page.getByText("The governed change was recorded."),
  ).toBeVisible();
  await page.getByRole("button", { name: /Publish unit/u }).click();
  await page
    .getByLabel("Reason for this change")
    .fill("Synthetic readiness review.");
  await page
    .getByRole("button", { name: "Review exact change", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm this exact change", exact: true })
    .click();
  await expect(
    page.getByText(
      "The request is recorded and needs a distinct founder confirmation.",
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Sign out", exact: true })
    .first()
    .click();
  await page.getByLabel("Email address").fill("second-admin@example.invalid");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", {
      name: "Accept all and enter your shelf",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: /Publish unit/u }).click();
  await page
    .getByRole("button", { name: "Review exact change", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Add my separate founder confirmation",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("The governed change was recorded."),
  ).toBeVisible();
  await page.getByRole("button", { name: /Enable provider/u }).click();
  await expect(
    page.getByRole("button", { name: "Review exact change", exact: true }),
  ).toBeDisabled();
  finish();
});

async function changeAdmin(page: Page, id: string, second = false) {
  const definition = actionFixtures.find((action) => action.id === id)!;
  await page
    .getByRole("button", { name: new RegExp(definition.label[0]) })
    .click();
  if (!second)
    await page
      .getByLabel("Reason for this change")
      .fill("Synthetic readiness review.");
  if (id === "hold") {
    await page
      .locator('input[name="holdExpiresAtLocal"]')
      .fill("2026-10-03T16:00");
    await page.locator('input[name="reviewAttested"]').check();
  }
  await page
    .getByRole("button", { name: "Review exact change", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: second
        ? "Add my separate founder confirmation"
        : definition.protected
          ? "Confirm this exact change"
          : "Submit this action",
      exact: true,
    })
    .click();
}
async function switchAdmin(page: Page, email: string) {
  await page
    .getByRole("button", { name: "Sign out", exact: true })
    .first()
    .click();
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", {
      name: "Accept all and enter your shelf",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/admin\?/u);
}
test("all twelve governed examples, distinct confirmations and preserved pending reload", async ({
  page,
}) => {
  const finish = isolation(page);
  await signIn(page, "admin");
  for (const id of [
    "hide",
    "lock",
    "deactivate",
    "quarantine",
    "retry",
    "disable",
  ]) {
    await changeAdmin(page, id);
    await expect(page.getByRole("status").last()).toContainText(
      id === "retry" ? "retry request" : "governed change",
    );
  }
  for (const id of ["publish", "unlock", "activate", "hold", "remove-hold"]) {
    await changeAdmin(page, id);
    await expect(page.getByRole("status").last()).toContainText(
      "distinct founder",
    );
  }
  await page
    .getByRole("button", { name: "Reload current decisions", exact: true })
    .click();
  await page.getByRole("button", { name: /Publish unit/u }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Waiting for a distinct founder confirmation" }),
  ).toBeVisible();
  await changeAdmin(page, "publish", true);
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "distinct founder",
  );
  await switchAdmin(page, "second-admin@example.invalid");
  for (const id of ["publish", "unlock", "activate", "hold", "remove-hold"]) {
    await changeAdmin(page, id, true);
    await expect(page.getByRole("status").last()).toContainText(
      "governed change",
    );
  }
  await page.getByRole("button", { name: /Enable provider/u }).click();
  await expect(
    page.getByRole("button", { name: "Review exact change", exact: true }),
  ).toBeDisabled();
  finish();
});
test("stale, failed readiness and unavailable admin actions never change the candidate", async ({
  page,
}) => {
  const finish = isolation(page);
  for (const fixture of ["stale", "blocked", "error"]) {
    await signIn(page, "admin", "en", `/admin?fixture=${fixture}`);
    if (fixture === "blocked") {
      await page.getByRole("button", { name: /Hide unit/u }).click();
      await expect(
        page.getByRole("button", { name: "Review exact change", exact: true }),
      ).toBeDisabled();
    } else {
      await changeAdmin(page, "hide");
      await expect(page.getByRole("main").getByRole("alert")).toContainText(
        fixture === "stale" ? "changed" : "could not be verified",
      );
    }
  }
  finish();
});
test("all supplied file types, mismatch, byte rejection and cancel retry use only local state", async ({
  page,
}) => {
  const finish = isolation(page);
  await signIn(page, "leader");
  await navigate(page, campaign);
  await page.locator('input[name="sourceName"]').fill("Synthetic study source");
  await page
    .locator('textarea[name="sourceDescription"]')
    .fill("Invented source for the UniMind synthetic product flow.");
  await page.locator('input[name="declaredRights"]').check();
  const upload = page.getByRole("button", {
    name: "Validate and upload",
    exact: true,
  });
  const finalize = page.getByRole("button", {
    name: "Finalize submission",
    exact: true,
  });
  await page
    .locator('input[type="file"]')
    .setInputFiles("public/demo-files/synthetic-recording.wav");
  await expect(upload).toBeDisabled();
  await page.locator('input[type="file"]').setInputFiles({
    name: "synthetic-handout.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 invented wrong bytes"),
  });
  await expect(upload).toBeDisabled();
  for (const [index, file] of [
    "synthetic-handout.pdf",
    "synthetic-recording.wav",
    "synthetic-diagram.png",
  ].entries()) {
    await page
      .getByLabel("Requested item")
      .selectOption(`sample-item-${index + 1}`);
    await page
      .locator('input[name="sourceName"]')
      .fill("Synthetic study source");
    await page
      .locator('textarea[name="sourceDescription"]')
      .fill("Invented source for the UniMind synthetic product flow.");
    await page.locator('input[name="declaredRights"]').check();
    await page
      .locator('input[type="file"]')
      .setInputFiles(`public/demo-files/${file}`);
    await expect(upload).toBeEnabled();
    await page.locator('input[name="declaredRights"]').check();
    await upload.click();
    if (index === 0) {
      await page
        .getByRole("button", { name: "Cancel upload", exact: true })
        .click();
      await expect(finalize).toHaveCount(0);
      await page
        .getByRole("button", { name: "Retry upload", exact: true })
        .click();
    }
    await expect(finalize).toBeEnabled();
    await finalize.click();
    await expect(
      page.getByText("Submission received", { exact: true }),
    ).toBeVisible();
  }
  finish();
});

test("runtime blocks all mutations and foreign origins; another document cannot inherit access", async ({
  page,
  request,
  context,
}) => {
  await signIn(page);
  const second = await context.newPage();
  await second.goto(unit + "/chat");
  await expect(second).toHaveURL(/\/login\?/u);
  for (const path of [
    "/login",
    "/admin",
    "/api/batch-leader/campaigns/sample-campaign/uploads",
    "/api/health/live",
    "/_next/static/test.png",
  ])
    expect(
      (await request.post(path, { data: { synthetic: true } })).status(),
    ).toBe(403);
  expect(
    (
      await request.get(
        "/api/preview/batch-leader/campaigns/sample-campaign/uploads",
      )
    ).status(),
  ).toBe(403);
  expect((await request.get("/api/health/live")).status()).toBe(403);
  expect(
    (await request.get("/images/study-shelf/clinical-medicine.png")).status(),
  ).toBe(200);
  expect(
    (await request.get("/demo-files/unimind-synthetic-test-pack.zip")).status(),
  ).toBe(200);
  expect(
    (
      await request.get("/login", { headers: { host: "attacker.invalid" } })
    ).status(),
  ).toBe(503);
  await page.reload();
  await expect(page).toHaveURL(/\/login\?/u);
  await second.close();
});

test("normal sign-out changes roles without carrying the previous role's screen", async ({
  page,
}) => {
  const finish = isolation(page);
  await signIn(page, "student", "en", unit + "/chat");
  await page.locator('[data-overhaul="checkpoint"] header summary').click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?lang=en$/u);
  await page.getByLabel("Email address").fill("leader@example.invalid");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/consent\?/u);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", {
      name: "Accept all and enter your shelf",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/batch-leader\?/u);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?lang=en$/u);
  await page.getByLabel("Email address").fill("admin@example.invalid");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/consent\?/u);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", {
      name: "Accept all and enter your shelf",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/admin\?/u);
  finish();
});

for (const locale of ["en", "ar"] as const) {
  test(`${locale}: revised sample supports direct Send, locale-preserved drafts, history and Studio interruption`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/chat");
    await expect(page.locator('[data-role="student"]')).toHaveCount(1);
    const account = page.getByRole("link", {
      name: pick(locale, "Account", "الحساب"),
      exact: true,
    });
    await account.focus();
    await account.press("Enter");
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Account", "الحساب"),
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("link", {
        name: pick(locale, "Back to study", "العودة للمذاكرة"),
        exact: true,
      })
      .click();
    await expect(
      page.getByLabel(pick(locale, "Switch unit", "تغيير الوحدة"), {
        exact: true,
      }),
    ).toHaveCount(1);
    await expect(
      page.getByRole("button", {
        name: pick(locale, "Send", "إرسال"),
        exact: true,
      }),
    ).toBeDisabled();
    const prompt = promptExamples.supported[locale === "ar" ? 1 : 0];
    await page
      .getByLabel(pick(locale, "Message", "السؤال"), { exact: true })
      .fill(prompt);
    await page
      .getByLabel(pick(locale, "Study language", "لغة المذاكرة"), {
        exact: true,
      })
      .selectOption("mixed");
    const nextLocale = locale === "en" ? "ar" : "en";
    await page
      .getByLabel(pick(locale, "Interface language", "لغة الواجهة"), {
        exact: true,
      })
      .focus();
    await page
      .getByLabel(pick(locale, "Interface language", "لغة الواجهة"), {
        exact: true,
      })
      .selectOption(nextLocale);
    await expect(page).toHaveURL(new RegExp(`lang=${nextLocale}`));
    await expect(
      page.getByLabel(pick(nextLocale, "Message", "السؤال"), { exact: true }),
    ).toHaveValue(prompt);
    await expect(
      page.getByLabel(pick(nextLocale, "Study language", "لغة المذاكرة"), {
        exact: true,
      }),
    ).toHaveValue("mixed");
    await expect(
      page.getByLabel(pick(nextLocale, "Interface language", "لغة الواجهة"), {
        exact: true,
      }),
    ).toBeFocused();
    await page
      .getByLabel(pick(nextLocale, "Message", "السؤال"), { exact: true })
      .press("Enter");
    await expect(page.locator("article")).toHaveCount(1);
    await expect(
      page.getByLabel(pick(nextLocale, "Message", "السؤال"), { exact: true }),
    ).toHaveValue("");
    await page
      .getByRole("button", {
        name: pick(nextLocale, "New session", "جلسة جديدة"),
        exact: true,
      })
      .click();
    await expect(page.locator("article")).toHaveCount(0);
    await page
      .getByRole("button", {
        name: new RegExp(pick(nextLocale, "Session 1", "جلسة [١1]")),
      })
      .click();
    await expect(page.locator("article")).toHaveCount(1);
    await page
      .getByRole("link", {
        name: pick(nextLocale, "Privacy settings", "إعدادات الخصوصية"),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", {
        name: pick(nextLocale, "Back to study", "العودة للمذاكرة"),
        exact: true,
      })
      .click();
    await expect(page.locator("article")).toHaveCount(1);
    await navigate(page, unit + "/studio", nextLocale);
    await page
      .getByRole("radio", {
        name: pick(nextLocale, "Flashcards", "بطاقات مراجعة"),
        exact: true,
      })
      .check();
    await page
      .getByRole("button", {
        name: pick(nextLocale, "Generate", "إنشاء"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: pick(nextLocale, "Cancel preparation", "إلغاء الإعداد"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: new RegExp(pick(nextLocale, "Simulated artifact", "مخرج محاكى")),
      }),
    ).toHaveCount(0);
    await page
      .getByRole("button", {
        name: pick(nextLocale, "Generate", "إنشاء"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: new RegExp(pick(nextLocale, "Simulated artifact", "مخرج محاكى")),
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: pick(nextLocale, "Flip card", "اقلب البطاقة التجريبية"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("link", {
        name: pick(nextLocale, "Open quiz", "فتح الاختبار التجريبي"),
        exact: true,
      }),
    ).toHaveCount(0);
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`${locale}: populated checkpoint reflows with accessible controls and enlarged text`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/chat");
    await send(page, "supported", locale);
    for (const screen of ["chat", "studio"] as const) {
      if (screen === "studio") {
        await navigate(page, unit + "/studio", locale);
        await page
          .getByRole("radio", {
            name: pick(locale, "Flashcards", "بطاقات مراجعة"),
            exact: true,
          })
          .check();
        await page
          .getByRole("button", {
            name: pick(locale, "Generate", "إنشاء"),
            exact: true,
          })
          .click();
        await expect(
          page.getByRole("heading", {
            name: new RegExp(pick(locale, "Simulated artifact", "مخرج محاكى")),
          }),
        ).toBeVisible();
      }
      for (const theme of ["light", "dark"]) {
        await navigate(page, "/settings", locale);
        await page
          .getByLabel(pick(locale, "Theme", "السمة"), { exact: true })
          .selectOption(theme);
        await page
          .getByRole("link", {
            name: pick(locale, "Back to study", "العودة للمذاكرة"),
            exact: true,
          })
          .click();
        for (const width of [1440, 768, 430, 390, 360, 320]) {
          await page.setViewportSize({ width, height: 900 });
          await expect(
            page.getByRole("navigation").getByRole("link"),
          ).toHaveCount(7);
          const inspect = async () =>
            page.evaluate(() => ({
              overflow: document.documentElement.scrollWidth > innerWidth + 1,
              controls: [
                ...document.querySelectorAll(
                  '[data-role="student"] button, [data-role="student"] a, [data-role="student"] select, [data-role="student"] textarea, [data-role="student"] summary',
                ),
              ]
                .filter((element) => {
                  const rect = element.getBoundingClientRect();
                  return (
                    rect.width > 0 &&
                    rect.height > 0 &&
                    getComputedStyle(element).visibility !== "hidden"
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
                .map((element) => element.textContent?.trim().slice(0, 80)),
            }));
          expect(await inspect()).toEqual({ overflow: false, controls: [] });
          await expect(page).toHaveTitle(/\S/u);
          const axe = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze();
          expect(axe.violations).toEqual([]);
          const directory = nodePath.join(
            ".local/phase2-student/automated",
            locale,
            theme,
          );
          await mkdir(directory, { recursive: true });
          await page.screenshot({
            path: nodePath.join(directory, `${screen}-${width}.png`),
            fullPage: true,
            animations: "disabled",
          });
          if (width === 320) {
            await page.evaluate(() => {
              document.documentElement.style.fontSize = "200%";
            });
            expect(await inspect()).toEqual({ overflow: false, controls: [] });
            await page.evaluate(() => {
              document.documentElement.style.fontSize = "";
            });
          }
        }
      }
    }
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`${locale}: cancelling Chat does not submit or complete a reply`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/chat");
    const input = page.getByLabel(pick(locale, "Message", "السؤال"), {
      exact: true,
    });
    const prompt = promptExamples.supported[locale === "ar" ? 1 : 0];
    await input.fill(prompt);
    await page
      .getByRole("button", { name: pick(locale, "Send", "إرسال"), exact: true })
      .click();
    await page
      .getByRole("button", {
        name: pick(locale, "Cancel stream", "إلغاء البث"),
        exact: true,
      })
      .click();
    await expect(
      page.getByText(
        pick(
          locale,
          "Sample stream cancelled. Send again to retry.",
          "تم إلغاء بث المثال. أرسل مجددًا للمحاولة.",
        ),
        { exact: true },
      ),
    ).toBeVisible();
    await expect(input).toHaveValue(prompt);
    // Observe beyond the one-second completion window: a cancelled timer must
    // not create a late exchange or evidence action.
    await page.waitForTimeout(1200);
    await expect(
      page.getByRole("link", {
        name: pick(locale, "Inspect evidence", "فحص الأدلة"),
        exact: true,
      }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: pick(locale, "Send", "إرسال"), exact: true })
      .click();
    await expect(
      page.getByRole("link", {
        name: pick(locale, "Inspect evidence", "فحص الأدلة"),
        exact: true,
      }),
    ).toHaveCount(1);
    await input.fill(prompt);
    await input.press("Enter");
    const cancel = page.getByRole("button", {
      name: pick(locale, "Cancel stream", "إلغاء البث"),
      exact: true,
    });
    await cancel.focus();
    await cancel.press("Enter");
    await expect(input).toBeFocused();
    await page.waitForTimeout(1200);
    await expect(
      page.getByRole("link", {
        name: pick(locale, "Inspect evidence", "فحص الأدلة"),
        exact: true,
      }),
    ).toHaveCount(1);
    await expect(input).toHaveValue(prompt);
    finish();
  });
}
