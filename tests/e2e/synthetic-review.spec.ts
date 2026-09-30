import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const root = "/preview/review";
const scope = `${root}/catalog/zagazig-university-human-medicine-year-1-term-1-cohort/zagazig-university-human-medicine-y1-t1-anatomy`;
const leader = `${root}/batch-leader/campaigns/sample-campaign`;
const routes = [
  "",
  "/catalog",
  "/settings",
  ...[
    "register",
    "login",
    "verify-email",
    "consent",
    "forgot-password",
    "reset-password",
  ].map((route) => "/access/" + route),
  "/batch-leader",
  "/batch-leader/invitation",
  "/batch-leader/campaigns/sample-campaign",
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
  ].map((route) => "/admin/" + route),
];
const studyRoutes = [
  "",
  "/chat",
  "/studio",
  "/quiz",
  "/quiz/sample-attempt",
  "/quiz/sample-attempt/review",
  "/sources",
  "/evidence",
  "/report",
];

test.describe.configure({ timeout: 180_000 });
test.use({ actionTimeout: 15_000 });
test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (["127.0.0.1", "localhost"].includes(url.hostname))
      return route.continue();
    await route.abort("blockedbyclient");
  });
});

function observeIsolation(page: Page) {
  const violations: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      !["GET", "HEAD"].includes(request.method()) ||
      url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/auth/") ||
      !["127.0.0.1", "localhost"].includes(url.hostname)
    )
      violations.push(`${request.method()} ${url.pathname}`);
  });
  page.on("response", (response) => {
    if (response.headers()["set-cookie"])
      violations.push("response issued a cookie");
  });
  return () => expect(violations).toEqual([]);
}

async function link(page: Page, name: string) {
  await page.getByRole("link", { name, exact: true }).first().click();
}
async function send(page: Page, kind: string) {
  await page.getByLabel("Fixed prompt and answer state").selectOption(kind);
  await page
    .getByRole("button", { name: "Send fixed prompt", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Complete simulated stream", exact: true })
    .click();
}

for (const locale of ["en", "ar"] as const) {
  test(`${locale}: keyboard focus, text scaling and access boundary scenarios`, async ({
    page,
  }) => {
    const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
    const finish = observeIsolation(page);
    await page.goto(`${root}/access/login?lang=${locale}`);
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", {
        name: t("Skip to content", "انتقل للمحتوى"),
        exact: true,
      }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
    await page.keyboard.press("Tab");
    const focused = await page.locator(":focus").evaluate((element) => ({
      tag: element.tagName,
      outline: getComputedStyle(element).outlineStyle,
      width: getComputedStyle(element).outlineWidth,
    }));
    expect(focused.tag).toBe("A");
    expect(focused.outline).not.toBe("none");
    expect(parseFloat(focused.width)).toBeGreaterThanOrEqual(2);
    for (const path of [root, scope + "/studio", leader, root + "/admin"]) {
      await page.goto(`${path}?lang=${locale}`);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.addStyleTag({ content: "html { font-size:200% !important }" });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(391);
      const smallTargets = await page
        .locator("main button, main select, main a, main summary")
        .evaluateAll((elements) =>
          elements
            .filter((element) => {
              const box = element.getBoundingClientRect();
              return (
                box.width > 0 &&
                box.height > 0 &&
                (box.height < 43 || box.width < 43)
              );
            })
            .map((element) => element.textContent),
        );
      expect(smallTargets).toEqual([]);
    }
    for (const scenario of ["unverified", "suspended"]) {
      await page.goto(`${root}/access/login?lang=${locale}&state=${scenario}`);
      await expect(
        page.getByRole("button", {
          name: t("Sign in with sample account", "الدخول بالحساب التجريبي"),
          exact: true,
        }),
      ).toHaveCount(0);
    }
    for (const scenario of ["expired", "replayed"]) {
      for (const screen of ["verify-email", "reset-password"]) {
        await page.goto(
          `${root}/access/${screen}?lang=${locale}&state=${scenario}`,
        );
        await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
        await expect(
          page.getByRole("button", {
            name: t(
              screen === "verify-email"
                ? "Simulate email verification"
                : "Simulate password reset",
              screen === "verify-email"
                ? "محاكاة تأكيد البريد"
                : "محاكاة تغيير كلمة المرور",
            ),
            exact: true,
          }),
        ).toHaveCount(0);
      }
    }
    await page.goto(
      `${root}/access/consent?lang=${locale}&state=current-consent`,
    );
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await page
      .getByRole("combobox", {
        name: t("Review scenario", "سيناريو المراجعة"),
        exact: true,
      })
      .selectOption("outdated-consent");
    await expect(page.getByRole("checkbox")).toBeVisible();
    finish();
  });
  test(`${locale}: every review route has accessible responsive navigation and no network mutations`, async ({
    page,
  }, testInfo) => {
    const finish = observeIsolation(page);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of [
      ...routes.map((route) => root + route),
      ...studyRoutes.map((route) => scope + route),
    ]) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${path}?lang=${locale}`);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator("html")).toHaveAttribute(
        "dir",
        locale === "ar" ? "rtl" : "ltr",
      );
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      const axe = await new AxeBuilder({ page })
        .exclude("nextjs-portal")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect
        .soft(
          axe.violations.map(({ id, nodes }) => ({
            id,
            targets: nodes.map((node) => node.target),
          })),
          path,
        )
        .toEqual([]);
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        const geometry = await page.evaluate(() => ({
          width: document.documentElement.scrollWidth,
          viewport: window.innerWidth,
        }));
        expect
          .soft(geometry.width, `${path} at ${width}`)
          .toBeLessThanOrEqual(geometry.viewport + 1);
      }
      const inputTypes = await page.locator("input").evaluateAll((inputs) =>
        inputs.map((input) => ({
          type: (input as HTMLInputElement).type,
          readonly: (input as HTMLInputElement).readOnly,
        })),
      );
      expect(
        inputTypes.some(
          (input) =>
            ["email", "password", "file"].includes(input.type) &&
            !input.readonly,
        ),
      ).toBe(false);
      const links = await page
        .locator("a[href]")
        .evaluateAll((anchors) =>
          anchors.map((anchor) => anchor.getAttribute("href")),
        );
      expect(
        links.every((href) => href?.startsWith(root) || href?.startsWith("#")),
      ).toBe(true);
    }
    expect(errors).toEqual([]);
    finish();
    await testInfo.attach("route-coverage", {
      body: JSON.stringify({
        locale,
        routes: routes.length + studyRoutes.length,
        widths: [1440, 768, 390, 320],
      }),
      contentType: "application/json",
    });
  });

  test(`${locale}: registration, verification, consent, sign-in and recovery use fixed account state`, async ({
    page,
  }) => {
    const finish = observeIsolation(page);
    const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
    await page.goto(`${root}/access/register?lang=${locale}`);
    await page
      .getByRole("button", {
        name: t("Register sample account", "تسجيل الحساب التجريبي"),
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      t("Simulated registration", "تمت محاكاة التسجيل"),
    );
    await link(page, t("Next sample step", "الخطوة التجريبية التالية"));
    await page
      .getByRole("button", {
        name: t("Simulate email verification", "محاكاة تأكيد البريد"),
        exact: true,
      })
      .click();
    await link(page, t("Next sample step", "الخطوة التجريبية التالية"));
    await expect(
      page.getByRole("button", {
        name: t("Accept sample commitments", "الموافقة على مثال الالتزامات"),
        exact: true,
      }),
    ).toBeDisabled();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", {
        name: t("Accept sample commitments", "الموافقة على مثال الالتزامات"),
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      t("Sample commitments accepted", "تمت الموافقة على مثال الالتزامات"),
    );
    await link(page, t("Sign in", "الدخول"));
    await page
      .getByRole("button", {
        name: t("Sign in with sample account", "الدخول بالحساب التجريبي"),
        exact: true,
      })
      .click();
    await link(page, t("Forgot password", "نسيت كلمة المرور"));
    await page
      .getByRole("button", {
        name: t("Simulate recovery request", "محاكاة طلب الاستعادة"),
        exact: true,
      })
      .click();
    await link(page, t("Next sample step", "الخطوة التجريبية التالية"));
    await page
      .getByRole("button", {
        name: t("Simulate password reset", "محاكاة تغيير كلمة المرور"),
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      t(
        "Simulated password reset completed",
        "اكتملت محاكاة تغيير كلمة المرور",
      ),
    );
    await link(page, t("Next sample step", "الخطوة التجريبية التالية"));
    finish();
  });
}

test("catalog navigation resolves into the complete mock, preserves approved filters and omits unsupported destinations", async ({
  page,
}) => {
  const finish = observeIsolation(page);
  await page.goto(`${root}/catalog?lang=en`);
  await page.getByLabel("Education level").selectOption("university");
  await page
    .locator('select[name="institution"]')
    .selectOption("zagazig-university");
  await page.getByLabel("Faculty / college").selectOption("human-medicine");
  await page.getByLabel("Academic year").selectOption("human-medicine-year-1");
  await page
    .getByLabel("Semester")
    .selectOption("human-medicine-year-1-term-1");
  await page
    .getByRole("button", {
      name: "Select curriculum unit: Anatomy",
      exact: true,
    })
    .click();
  await link(page, "Open sample workspace");
  await expect(page).toHaveURL(new RegExp(scope));
  await expect(
    page.getByRole("heading", { name: "Unit overview", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Calendar", exact: true }),
  ).toHaveCount(0);
  await link(page, "Inspect sample sources");
  await expect(page.getByRole("article")).toHaveCount(8);
  await link(page, "Back to Study Shelf");
  await page.getByLabel("Education level").selectOption("university");
  await expect(page).toHaveURL(/stage=university/u);
  await page
    .getByRole("combobox", { name: "University", exact: true })
    .selectOption("zagazig-university");
  await expect(page).toHaveURL(/institution=zagazig-university/u);
  await page
    .getByLabel("Faculty / college")
    .selectOption("synthetic-credit-program");
  await expect(
    page.getByText("Flexible course selection", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Semester", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Select curriculum unit: Synthetic evidence study",
      exact: true,
    })
    .click();
  await link(page, "Open sample workspace");
  await expect(page).toHaveURL(
    /synthetic-credit-cohort\/synthetic-credit-unit/u,
  );
  await expect(
    page.getByRole("navigation", { name: "Curriculum scope", exact: true }),
  ).toContainText("Eligible course plan");
  finish();
});

test("chat, exact exchange evidence/report, privacy snapshots, session/scope isolation and reset", async ({
  page,
  context,
}) => {
  const finish = observeIsolation(page);
  await page.goto(`${scope}/chat?lang=en`);
  await page
    .getByRole("button", { name: "Start scoped sample session", exact: true })
    .click();
  await send(page, "supported");
  await send(page, "conflict");
  await link(page, "Inspect evidence");
  await expect(
    page.getByRole("heading", { name: "Supported", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Synthetic comparison recording",
      exact: true,
    }),
  ).toHaveCount(0);
  await link(page, "Report selected exchange");
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Simulate report", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Nothing was sent");
  await link(page, "Back to Chat");
  await link(page, "Privacy settings");
  await page.getByLabel("Sample sharing mode").selectOption("private");
  await page.goBack();
  await send(page, "partial");
  await expect(
    page.getByText("Recorded sample sharing mode: Private", { exact: true }),
  ).toBeVisible();
  for (const kind of ["unavailable", "hint", "educational", "patient"])
    await send(page, kind);
  await page.getByLabel("Study language").selectOption("mixed");
  await send(page, "supported");
  await expect(
    page.getByText("Synthetic source · study sequence", { exact: true }),
  ).toBeVisible();
  const choices = await page
    .getByLabel("Switch sample unit and session scope")
    .locator("option")
    .evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value),
    );
  const other = choices.find((choice) => choice !== scope)!;
  await page
    .getByLabel("Switch sample unit and session scope")
    .selectOption(other);
  await expect(page).toHaveURL(new RegExp(other));
  await link(page, "Chat");
  await expect(
    page.getByText("No sessions in this scope.", { exact: false }),
  ).toBeVisible();
  await page
    .getByLabel("Switch sample unit and session scope")
    .selectOption(scope);
  await expect(page).toHaveURL(new RegExp(scope + "\\?"));
  await link(page, "Chat");
  await expect(
    page.getByRole("heading", { name: "Supported", exact: true }),
  ).toHaveCount(2);
  const second = await context.newPage();
  await second.goto(`${scope}/chat?lang=en`);
  await expect(
    second.getByText("No sessions in this scope.", { exact: false }),
  ).toBeVisible();
  await second.close();
  await page
    .getByRole("button", { name: "Reset simulation", exact: true })
    .click();
  await expect(
    page.getByText("No sessions in this scope.", { exact: false }),
  ).toBeVisible();
  finish();
});

test("all Studio types and quiz lifecycle load fixed scoped content without generation or durability", async ({
  page,
}) => {
  const finish = observeIsolation(page);
  await page.goto(`${scope}/studio?lang=en`);
  for (const type of [
    "summary",
    "guide",
    "practice",
    "flashcards",
    "revision",
    "quiz",
  ]) {
    await page
      .getByRole("combobox", { name: "Artifact type", exact: true })
      .selectOption(type);
    await page
      .getByRole("combobox", { name: "Depth", exact: true })
      .selectOption("detailed");
    await page
      .getByRole("combobox", { name: "Size", exact: true })
      .selectOption("extended");
    await page
      .getByRole("button", { name: "Load fixed artifact", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: /^Simulated artifact:/u }),
    ).toBeVisible();
    if (type === "flashcards") {
      await page
        .getByRole("button", { name: "Flip sample card", exact: true })
        .click();
      await expect(
        page.getByText("Identify labels, then compare diagrams.", {
          exact: true,
        }),
      ).toBeVisible();
    }
  }
  await link(page, "Open sample quiz");
  await page
    .getByRole("button", { name: "Create sample attempt", exact: true })
    .click();
  await link(page, "Open sample attempt");
  await expect(
    page.getByRole("button", { name: "Submit sample answers", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("radio", { name: "Identify labels", exact: true })
    .check();
  await page
    .getByRole("radio", { name: "No duration is supplied", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Submit sample answers", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("2 / 2");
  await link(page, "Open grounded review");
  await expect(page).toHaveURL(/sample-attempt\/review/u);
  await expect(
    page.getByText(
      "The sample handout says identification precedes comparison",
      { exact: false },
    ),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("No attempt exists in this unit.", { exact: false }),
  ).toBeVisible();
  finish();
});

test("fixed file/reference submission validates, cancels, retries and keeps tracking consistent", async ({
  page,
}) => {
  const finish = observeIsolation(page);
  await page.goto(`${leader}?lang=en`);
  await page
    .getByRole("button", { name: "Start simulated submission", exact: true })
    .click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "rights declaration",
  );
  await page.getByRole("checkbox").check();
  for (const invalid of [
    "duplicate",
    "checksum",
    "oversize",
    "type",
    "rights",
  ]) {
    await page.getByLabel("Sample validation outcome").selectOption(invalid);
    await page
      .getByRole("button", { name: "Start simulated submission", exact: true })
      .click();
    await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  }
  await page.getByLabel("Sample validation outcome").selectOption("valid");
  await page
    .getByRole("button", { name: "Start simulated submission", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Cancel sample upload", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Retry sample submission", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Complete sample upload", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Simulate finalization", exact: true })
    .click();
  await expect(
    page.getByText("Current requested-item status: Received", { exact: true }),
  ).toBeVisible();
  for (const status of [
    "PROCESSING",
    "NEEDS_INFORMATION",
    "ACCEPTED",
    "REJECTED",
    "COMPLETED",
  ]) {
    await page.getByLabel("Controlled fixture status").selectOption(status);
    await page
      .getByRole("button", { name: "Apply sample tracking state", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Prepare corrected sample", exact: true })
    .click();
  await page
    .getByLabel("File or approved reference example")
    .selectOption("reference");
  await page
    .getByRole("button", { name: "Start simulated submission", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Simulate finalization", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /^Sample submission /u }),
  ).toHaveCount(2);
  finish();
});

test("all governed action examples update local records/journal, protected outcomes stay pending and enablement stays blocked", async ({
  page,
}) => {
  const finish = observeIsolation(page);
  await page.goto(`${root}/admin?lang=en`);
  for (const action of [
    "hide",
    "publish",
    "lock",
    "unlock",
    "deactivate",
    "activate",
    "quarantine",
    "retry",
    "hold",
    "remove-hold",
    "disable",
    "enable",
  ]) {
    await page.getByLabel("Governed action example").selectOption(action);
    await page.getByRole("checkbox").check();
    if (action === "enable") {
      await expect(
        page.getByRole("button", { name: "Simulate decision", exact: true }),
      ).toBeDisabled();
      continue;
    }
    await page
      .getByRole("button", { name: "Simulate decision", exact: true })
      .click();
    const expected: Record<string, string> = {
      hide: "Hidden",
      publish: "Pending second founder",
      lock: "Locked",
      unlock: "Pending second founder",
      deactivate: "Deactivated",
      activate: "Pending second founder",
      quarantine: "Quarantined",
      retry: "Queued",
      hold: "Pending second founder",
      "remove-hold": "Pending second founder",
      disable: "Disabled",
    };
    await expect(page.getByTestId("admin-current-state")).toHaveText(
      expected[action]!,
    );
    const completed = page.getByRole("button", {
      name: "Load completed outcome fixture",
      exact: true,
    });
    if (await completed.count()) {
      await expect(page.getByTestId("admin-current-state")).toHaveText(
        "Pending second founder",
      );
      await completed.click();
    }
  }
  await expect(page.getByRole("list").last().getByRole("listitem")).toHaveCount(
    16,
  );
  await page
    .getByRole("button", { name: "Reset simulation", exact: true })
    .click();
  await page.getByLabel("Simulated decision outcome").selectOption("stale");
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Simulate decision", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("stale version");
  await page.getByLabel("Simulated decision outcome").selectOption("error");
  await page
    .getByRole("button", { name: "Simulate decision", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("failed");
  await page.getByLabel("Simulated decision outcome").selectOption("blocked");
  await expect(
    page.getByRole("button", { name: "Simulate decision", exact: true }),
  ).toBeDisabled();
  finish();
});

test("governance containment changes the same tab's student availability and reset restores it", async ({
  page,
}) => {
  await page.goto(`${root}/admin?lang=en`);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Simulate decision", exact: true })
    .click();
  await link(page, "Preview exact sample student scope");
  await expect(
    page.getByRole("heading", {
      name: "Sample availability changed",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Reset simulation", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Try fixed answers", exact: true }),
  ).toBeVisible();
});

test("campaign creation, invitation review and operational resource navigation have truthful outcomes", async ({
  page,
}) => {
  const finish = observeIsolation(page);
  await page.goto(`${root}/admin/campaigns?lang=en`);
  await page
    .getByRole("button", { name: "Create sample campaign draft", exact: true })
    .click();
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Simulate invitation review", exact: true })
    .click();
  await link(page, "Open Batch Leader invitation example");
  await page
    .getByRole("button", { name: "Review sample invitation", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("No access granted");
  await link(page, "View fixed assigned campaign");
  await expect(
    page.getByRole("heading", {
      name: "New simulated campaign draft",
      exact: true,
    }),
  ).toBeVisible();
  finish();
});

test("screen scenarios are selectable, recoverable and cannot imply protected access", async ({
  page,
}) => {
  const finish = observeIsolation(page);
  for (const path of [
    root + "/access/login",
    scope + "/chat",
    leader,
    root + "/admin",
    root + "/settings",
  ]) {
    await page.goto(path + "?lang=en");
    for (const state of [
      "loading",
      "empty",
      "error",
      "offline",
      "stale",
      "forbidden",
    ]) {
      await page.getByLabel("Review scenario").selectOption(state);
      await expect(page).toHaveURL(new RegExp(`state=${state}`));
      await page.getByLabel("Review scenario").selectOption("ready");
      await expect(page.getByRole("main")).toBeVisible();
    }
  }
  await page.goto(`${root}/access/reset-password?state=expired`);
  await expect(
    page.getByRole("button", { name: "Simulate password reset", exact: true }),
  ).toHaveCount(0);
  await page.goto(`${root}/catalog/forged-cohort/forged-unit/chat`);
  await expect(
    page.getByRole("heading", { name: "Sample unavailable · المثال غير متاح" }),
  ).toBeVisible();
  finish();
});
