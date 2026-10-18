import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ensureB09Intake } from "./support/collection-b09";
import {
  enterHosted as enter,
  hostedPassword as password,
} from "./support/hosted";

// Hosted synthetic entry (WP03-T11) runs the same browser-only runtime as the
// loopback demo, whose journeys cover every product area under
// playwright.demo.config.ts. This spec keeps what only hosted entry proves:
// one journey per role from the real login, fixture selectors staying local,
// document-local memory and sign-out, and real Auth denial.
const unit =
  "/learn/zagazig-university-human-medicine-year-1-term-1-cohort/zagazig-university-human-medicine-y1-t1-anatomy";
const pick = (locale: string, en: string, ar: string) =>
  locale === "ar" ? ar : en;
const b07SourcesName = (locale: string) =>
  locale === "ar" ? /^مصادر (وحدة|مادة)$/u : /^(Module|Subject) sources$/u;
const b07ChooseName = (locale: string) =>
  locale === "ar"
    ? /^(اختر (وحدة|مادة)|تصفح كل المواد)$/u
    : /^(Choose a (module|subject)|Browse all subjects)$/u;

// One smoke journey per role, alternating locales.
for (const [role, locale] of [
  ["student", "en"],
  ["leader", "ar"],
  ["admin", "en"],
  ["second-admin", "ar"],
] as const) {
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
          name: new RegExp(pick(locale, "^Hide ", "^إخفاء "), "u"),
        })
        .click();
      await page
        .getByLabel(pick(locale, "Reason for this change", "سبب هذا التغيير"), {
          exact: false,
        })
        .fill(
          pick(
            locale,
            "Temporarily hide this unit for review.",
            "إخفاء الوحدة مؤقتًا للمراجعة.",
          ),
        );
      await page
        .getByRole("button", {
          name: pick(locale, "Review and record", "مراجعة وتسجيل"),
          exact: true,
        })
        .click();
      await page
        .getByRole("button", {
          name: pick(
            locale,
            "Submit this action: Hide unit",
            "إرسال هذا الإجراء: إخفاء الوحدة",
          ),
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
          name: new RegExp(pick(locale, "^Place hold ", "^وضع حجز "), "u"),
        })
        .click();
      await page
        .getByLabel(pick(locale, "Reason for this change", "سبب هذا التغيير"), {
          exact: false,
        })
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
          name: pick(locale, "Review and record", "مراجعة وتسجيل"),
          exact: true,
        })
        .click();
      await page
        .getByRole("button", {
          name: pick(
            locale,
            "Confirm this exact change: Place raw-data hold",
            "تأكيد هذا التغيير المحدد: وضع حجز على البيانات الخام",
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
        await expect(page).toHaveURL(new RegExp(`/admin/${resource}\\?`, "u"));
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
      const receipt = page.locator('[data-record-request="sample-item-1"]');
      await expect(receipt.locator('[data-status="RECEIVED"]')).toBeVisible();
      await expect(
        page.getByRole("status").filter({
          hasText: pick(locale, "Received files", "الملفات المستلمة"),
        }),
      ).toContainText(locale === "ar" ? "١" : "1");
      await expect(receipt.locator("input, textarea, select")).toHaveCount(0);
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
    // Settings opens on Profile (WP03-T27); Appearance is the next section.
    await page
      .getByRole("tab", {
        name: pick(locale, "Appearance", "المظهر"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("group", {
        name: pick(locale, "Theme", "السمة"),
        exact: true,
      }),
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

// Review fixture selectors stay local to the loopback demo.
for (const locale of ["ar"] as const) {
  test(`merged B01 M53 hosted campaigns ${locale}: prepared assignments stay out of ordinary hosted entry`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const finish = await enter(page, "leader", locale);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await expect(
      page.getByRole("link", {
        name: t("Open requests", "فتح الطلبات"),
        exact: true,
      }),
    ).toHaveCount(1);
    await page.evaluate(
      (href) => window.history.pushState(null, "", href),
      `/batch-leader?fixture=dense&lang=${locale}`,
    );
    await expect(
      page.getByRole("link", {
        name: t("Open requests", "فتح الطلبات"),
        exact: true,
      }),
    ).toHaveCount(1);
    await page.evaluate(
      (href) => window.history.pushState(null, "", href),
      `/batch-leader/campaigns/sample-biochemistry-campaign?fixture=dense&lang=${locale}`,
    );
    await expect(page.getByRole("main")).toContainText(
      t("Access unavailable", "الوصول غير متاح"),
    );
    await expect(
      page.getByRole("button", {
        name: t("Choose files", "اختيار ملفات"),
        exact: true,
      }),
    ).toHaveCount(0);
    await page.evaluate(
      (href) => window.history.pushState(null, "", href),
      `/batch-leader?lang=${locale}`,
    );
    await expect(
      page.getByRole("link", {
        name: t("Open requests", "فتح الطلبات"),
        exact: true,
      }),
    ).toHaveCount(1);
    await expect(
      page.getByText(
        /Synthetic demo|Simulated services|Demo clock|وضع تجريبي|محاكاة الخدمات/u,
      ),
    ).toHaveCount(0);
    finish();
  });
}

for (const locale of ["en"] as const) {
  test(`merged B01 M53 hosted ${locale}: ordinary entry ignores the local density fixture`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await page.goto(
      `/login?lang=${locale}&next=${encodeURIComponent(`${unit}/chat?fixture=dense&lang=${locale}`)}`,
    );
    await expect(
      page.getByLabel(t("Email address", "البريد الإلكتروني")),
    ).toHaveValue("");
    await page
      .getByLabel(t("Email address", "البريد الإلكتروني"))
      .fill("student@example.invalid");
    await page
      .getByLabel(t("Password", "كلمة المرور"), { exact: true })
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
      .getByRole("button", { name: t("Continue", "متابعة"), exact: true })
      .click();
    await expect(page).toHaveURL(/\/consent\?/u);
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", {
        name: t(
          "Accept all and continue to UniMind",
          "الموافقة والمتابعة إلى UniMind",
        ),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: t("Anatomy", "علم التشريح"),
        exact: true,
      }),
    ).toBeVisible();
    const history = page.locator("details").filter({
      has: page.locator(
        `summary[aria-label="${t("Sessions and privacy", "الجلسات والخصوصية")}"]`,
      ),
    });
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
    await expect(
      page.getByText(
        /Synthetic demo|Simulated services|Demo clock|وضع تجريبي|محاكاة الخدمات/u,
      ),
    ).toHaveCount(0);
    // Reload discards synthetic memory; the real sources route then requires
    // a real sign-in (WP03-T17 added it; before, this path was a 404).
    await page.reload();
    await expect(page).toHaveURL(/\/login\?/u);
    await expect(page.getByRole("article")).toHaveCount(0);
    expect(forbidden).toEqual([]);
    expect(errors).toEqual([]);
  });
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
  const values = [
    "university",
    "zagazig-university",
    "human-medicine",
    "human-medicine-year-1",
    "human-medicine-year-1-term-1",
  ];
  for (const [index, value] of values.entries()) {
    await page.locator(`input[type="radio"][value="${value}"]`).check();
    await page
      .getByRole("button", {
        name: index === values.length - 1 ? "Review choices" : "Continue",
        exact: true,
      })
      .click();
  }
  await page
    .getByRole("button", { name: "Open Study Shelf", exact: true })
    .click();
  await page
    .getByRole("link", { name: b07ChooseName("en"), exact: true })
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
    .getByRole("group", { name: "Interface language", exact: true })
    .getByRole("button", { name: "العربية", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "فحص الأدلة", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("group", { name: "لغة الواجهة", exact: true })
    .getByRole("button", { name: "English", exact: true })
    .click();
  await page
    .locator('a[href="/settings?lang=en"]')
    .filter({ visible: true })
    .first()
    .click();
  await page
    .getByRole("link", { name: "Return to Chat · Anatomy", exact: true })
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
  await page
    .getByRole("tab", { name: /^(Identity and access|الهوية والوصول)$/u })
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
  // The loopback demo route and the retired fixture routes stay closed: 404
  // before any session refresh, so no response sets a cookie.
  for (const path of [
    "/synthetic-runtime/admin",
    "/wp03-review.html",
    "/preview/learn",
    "/preview/admin?state=containment",
    "/api/preview/x",
  ]) {
    const response = await page.request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(404);
    expect(response.headers()["set-cookie"], path).toBeUndefined();
  }
  const upload = await page.request.post(
    "/api/preview/batch-leader/campaigns/11111111-1111-4111-8111-111111111111/uploads",
    { multipart: { requestedItemId: "forged" }, maxRedirects: 0 },
  );
  expect(upload.status()).toBe(404);
  expect(upload.headers()["set-cookie"]).toBeUndefined();
});

// The shared Study Shelf chrome at phone width (formerly checked on the
// retired fixture shelf): centred navigation, touch targets, reduced motion
// and readable contrast.
test("hosted student shelf keeps navigation geometry, touch targets and reduced motion", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const finish = await enter(page, "student");
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
        name: index === 4 ? "Review choices" : "Continue",
        exact: true,
      })
      .click();
  }
  await page
    .getByRole("button", { name: "Open Study Shelf", exact: true })
    .click();
  await page
    .getByRole("link", { name: b07ChooseName("en"), exact: true })
    .click();
  const anatomy = page.getByRole("link", { name: "Open Anatomy", exact: true });
  await expect(anatomy).toBeVisible();
  const shelf = page.url();
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    controls: Array.from(document.querySelectorAll("main a, main button"))
      .map((element) => element.getBoundingClientRect().height)
      .filter((height) => height > 0),
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(
    dimensions.viewportWidth,
  );
  expect(Math.min(...dimensions.controls)).toBeGreaterThanOrEqual(44);
  const navigation = await page
    .getByRole("navigation", { name: "Product navigation" })
    .evaluate((element) => {
      const list = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const left = list.left + parseFloat(style.paddingLeft);
      const width =
        list.width -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      const items = Array.from(element.querySelectorAll("a"));
      return {
        offsets: items.map((item, index) => {
          const box = item.getBoundingClientRect();
          return (
            box.left + box.width / 2 - (left + (width / 3) * (index + 0.5))
          );
        }),
        widths: items.map((item) => item.getBoundingClientRect().width),
        icons: items.map((item) => {
          const box = item.getBoundingClientRect();
          const icon = item
            .querySelector("svg, [class*='profileMarker']")
            ?.getBoundingClientRect();
          return icon
            ? icon.left + icon.width / 2 - (box.left + box.width / 2)
            : Number.POSITIVE_INFINITY;
        }),
      };
    });
  expect(navigation.offsets).toHaveLength(3);
  for (const offset of [...navigation.offsets, ...navigation.icons])
    expect(Math.abs(offset)).toBeLessThanOrEqual(1);
  expect(
    Math.max(...navigation.widths) - Math.min(...navigation.widths),
  ).toBeLessThanOrEqual(1);
  const motion = await page.evaluate(() => {
    const luminance = (color: string) =>
      (
        color
          .match(/[\d.]+/gu)
          ?.slice(0, 3)
          .map(Number) ?? [0, 0, 0]
      )
        .map((channel) => channel / 255)
        .map((channel) =>
          channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4,
        )
        .reduce(
          (total, channel, index) =>
            total + channel * ([0.2126, 0.7152, 0.0722][index] ?? 0),
          0,
        );
    const contrast = (foreground: string, background: string) => {
      const [light, dark] = [luminance(foreground), luminance(background)].sort(
        (left, right) => right - left,
      );
      return (light! + 0.05) / (dark! + 0.05);
    };
    const link = document.querySelector<HTMLElement>(
      'a[aria-label="Open Anatomy"]',
    );
    const ready = link?.querySelector<HTMLElement>(
      ":scope > span:nth-last-child(2)",
    );
    const body = getComputedStyle(document.body);
    return {
      transition: link?.closest("li")
        ? getComputedStyle(link.closest("li")!).transitionDuration
        : "missing",
      body: contrast(body.color, body.backgroundColor),
      ready: ready
        ? contrast(getComputedStyle(ready).color, body.backgroundColor)
        : 0,
    };
  });
  expect(motion.transition).toBe("0s");
  expect(motion.body).toBeGreaterThanOrEqual(4.5);
  expect(motion.ready).toBeGreaterThanOrEqual(4.5);
  await anatomy.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`${unit}\\?lang=en$`, "u"));
  await page.goBack();
  await expect(page).toHaveURL(shelf);
  await anatomy.focus();
  await expect(anatomy).toBeFocused();
  finish();
});

// WP03-T27: the fifth hosted pair is a brand-new account with no profile.
test("hosted new account: the profile step comes after the commitments", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const finish = await enter(page, "new-student", "en");
  await expect(page).toHaveURL(/\/welcome\?/u);
  await expect(
    page.getByRole("heading", { name: "Set up your profile", level: 1 }),
  ).toBeVisible();
  await page.getByLabel("Full name", { exact: true }).fill("Salma Yousef");
  await page
    .getByRole("button", { name: "Save and continue", exact: true })
    .click();
  await expect(page).toHaveURL(/\/learn\?/u);
  finish();
});
