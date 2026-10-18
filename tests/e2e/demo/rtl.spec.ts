import {
  b09Campaign,
  b09NewerIntentJourney,
  ensureB09Intake,
} from "../support/collection-b09";
import {
  bilingual,
  clock,
  formatNumber,
  inLocales,
  pick,
} from "../support/copy";
import { b07UnitsName, campaign, unit, unitMenuSummary } from "../support/demo";
import { expectReflow } from "../support/layout";
import { isolation, navigate, signIn } from "../support/session";
import { expect, test } from "../support/test";
inLocales(["en", "ar"], (locale) => {
  test(
    `delayed inspection preserves a newer request and locale [${locale}]`,
    { tag: ["@B09", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "leader", locale, b09Campaign);
      await b09NewerIntentJourney(page, locale);
      finish();
    },
  );
});

inLocales(["en", "ar"], (locale) => {
  test(
    `stale, foreign, duplicate and mixed inspection links fail closed [${locale}]`,
    { tag: ["@B09", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "leader", locale, b09Campaign);
      for (const selectors of [
        "inspect=sample-history-0&record=history-0",
        "inspect=sample-history-0&record=stale",
        "inspect=foreign&record=history-0",
        "inspect=sample-history-0&inspect=sample-history-0&record=history-0",
        "inspect=sample-history-0&record=history-0&record=history-0",
        "inspect=sample-history-0&record=history-0&upload=all",
        "upload=foreign",
        "upload=all&upload=all",
        "inspect=&record=history-0",
      ]) {
        await page.evaluate(
          (href) => window.history.pushState(null, "", href),
          `${b09Campaign}?${selectors}&lang=${locale}`,
        );
        await expect(page).toHaveURL(new RegExp(selectors.split("&")[0]!, "u"));
        if (selectors === "inspect=sample-history-0&record=history-0") {
          await expect(
            page.locator("#collection-record-sample-history-0 summary"),
          ).toBeFocused();
          await expect(
            page.getByRole("button", {
              name: pick(locale, "Choose files", "اختيار ملفات"),
              exact: true,
            }),
          ).toBeHidden();
        } else {
          await expect(
            page.getByRole("heading", {
              name: pick(locale, "Request unavailable", "الطلب غير متاح"),
              exact: true,
            }),
          ).toBeVisible();
          await expect(page.locator("input[type=file]")).toHaveCount(0);
        }
      }
      finish();
    },
  );
});

inLocales(["en", "ar"], (locale) => {
  test(
    `setup draft, numbered progress, canonical review and comparable repeat [${locale}]`,
    { tag: ["@B03", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "student", locale, `${unit}/quiz`);
      const count = page.getByLabel(t("Number of questions", "عدد الأسئلة"), {
        exact: true,
      });
      await count.fill("6");
      await page
        .getByRole("radio", { name: t("Hard", "صعب"), exact: true })
        .check();
      await page
        .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
        .check();
      await page
        .getByLabel(t("Duration (minutes)", "المدة (بالدقائق)"), {
          exact: true,
        })
        .fill("3");
      await navigate(page, "/settings", locale);
      await page
        .getByRole("link", {
          name: t(
            "Return to Quiz · Anatomy",
            "العودة إلى الاختبار · علم التشريح",
          ),
          exact: true,
        })
        .click();
      await expect(count).toHaveValue("6");
      await expect(
        page.getByLabel(t("Duration (minutes)", "المدة (بالدقائق)"), {
          exact: true,
        }),
      ).toHaveValue("3");
      await expect(
        page.getByRole("radio", { name: t("Hard", "صعب"), exact: true }),
      ).toBeChecked();
      const reference = new Date("2026-10-13T12:00:00Z");
      await page.clock.install({ time: reference });
      await page.clock.pauseAt(new Date(reference.getTime() + 1000));
      await page
        .getByRole("button", {
          name: t("Start quiz", "بدء الاختبار"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: t("Quiz attempt", "محاولة الاختبار"),
          exact: true,
        }),
      ).toBeVisible();
      const key = new URL(page.url()).searchParams.get("attempt");
      const questions = page.locator(
        'fieldset:has(input[name^="sample-question-"])',
      );
      await expect(questions).toHaveCount(6);
      await expect(questions.nth(5).locator("legend")).toContainText(
        `${t("Question", "السؤال")} ${formatNumber(locale, 6)} ${t("of", "من")} ${formatNumber(locale, 6)}`,
      );
      await page.locator('input[name="sample-question-0"]').nth(0).check();
      await page.locator('input[name="sample-question-1"]').nth(1).check();
      await expect(page.locator("#quiz-submit-help")).toContainText(
        t("Answer every question", "أجب عن كل الأسئلة"),
      );
      await expect(page.locator("#quiz-submit-help bdi")).toHaveText(
        [3, 4, 5, 6]
          .map((n) => formatNumber(locale, n))
          .join(locale === "ar" ? "، " : ", "),
      );
      await expect(page.locator("#quiz-progress")).toHaveText(
        locale === "ar"
          ? `تمت الإجابة عن ${formatNumber(locale, 2)} من ${formatNumber(locale, 6)}`
          : `${formatNumber(locale, 2)} of ${formatNumber(locale, 6)} answered`,
      );
      await expect(
        page.getByRole("button", {
          name: t("Submit answers", "تسليم الإجابات"),
          exact: true,
        }),
      ).toBeDisabled();
      await page
        .getByRole("link", {
          name: t("Browse material library", "تصفح مكتبة المصادر"),
          exact: true,
        })
        .click();
      await page
        .getByRole("link", {
          name: t("Return to quiz attempt", "العودة إلى محاولة الاختبار"),
          exact: true,
        })
        .press("Enter");
      await expect(
        page.locator('input[name="sample-question-0"]').nth(0),
      ).toBeChecked();
      await expect(
        page.locator('input[name="sample-question-1"]').nth(1),
      ).toBeChecked();
      for (let index = 2; index < 6; index++)
        await page
          .locator(`input[name="sample-question-${index}"]`)
          .nth([0, 1, 0, 1][index - 2]!)
          .check();
      await expect(page.locator("#quiz-submit-help")).toContainText(
        t("All questions answered", "تمت الإجابة عن كل الأسئلة"),
      );
      await page
        .getByRole("button", {
          name: t("Submit answers", "تسليم الإجابات"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: t("Quiz review", "مراجعة الاختبار"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(page).toHaveURL(/\/sample-attempt\/review\?attempt=/u);
      const review = page.url();
      await expect(
        page.getByRole("link", {
          name: t("Open grounded review", "فتح المراجعة بالمصادر"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        page.locator('input[name^="sample-question-"]:checked'),
      ).toHaveCount(6);
      await page.clock.fastForward(181_000);
      await expect(page.getByRole("main")).toContainText(
        t("Simulated score", "نتيجة محاكاة"),
      );
      await page.clock.resume();
      await page.goBack();
      await page
        .getByRole("link", {
          name: t("Return to quiz attempt", "العودة إلى محاولة الاختبار"),
          exact: true,
        })
        .press("Enter");
      await expect(page).toHaveURL(review);
      await expect(
        page.locator('input[name^="sample-question-"]:checked'),
      ).toHaveCount(6);
      const changed = locale === "en" ? "ar" : "en";
      await page
        .getByRole("button", {
          name: changed === "ar" ? "العربية" : "English",
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: pick(changed, "Quiz review", "مراجعة الاختبار"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.locator('input[name^="sample-question-"]:checked'),
      ).toHaveCount(6);
      await page
        .getByRole("button", {
          name: locale === "ar" ? "العربية" : "English",
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: t("Quiz review", "مراجعة الاختبار"),
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: t("Repeat this setup", "تكرار هذه الإعدادات"),
          exact: true,
        })
        .press("Enter");
      await expect(
        page.getByRole("heading", {
          name: t("Quiz attempt", "محاولة الاختبار"),
          exact: true,
        }),
      ).toBeVisible();
      expect(new URL(page.url()).searchParams.get("attempt")).not.toBe(key);
      await expect(questions).toHaveCount(6);
      await expect(
        page.locator('input[name^="sample-question-"]:checked'),
      ).toHaveCount(0);
      await expect(page.getByRole("timer")).toContainText(
        `${clock(locale, 3)}:${clock(locale, 0)}`,
      );
      await page
        .getByRole("link", {
          name: t("Back to quiz", "العودة للاختبار"),
          exact: true,
        })
        .click();
      await expect(count).toHaveValue("6");
      await expect(
        page.getByLabel(t("Duration (minutes)", "المدة (بالدقائق)"), {
          exact: true,
        }),
      ).toHaveValue("3");
      await page
        .getByRole("button", {
          name: t("Use default setup", "استخدام الإعدادات الافتراضية"),
          exact: true,
        })
        .click();
      await expect(count).toHaveValue("2");
      await expect(
        page.getByRole("radio", {
          name: t("Untimed", "دون توقيت"),
          exact: true,
        }),
      ).toBeChecked();
      await page
        .getByRole("link", {
          name: t("Open sample attempt", "فتح المحاولة التجريبية"),
          exact: true,
        })
        .click();
      await expect(questions).toHaveCount(6);
      finish();
    },
  );
});

inLocales(["en", "ar"], (locale) => {
  test(
    `extended comparison practice contains distinct bilingual questions [${locale}]`,
    { tag: ["@B01", "@M67", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "student", locale, `${unit}/studio`);
      await page
        .getByLabel(t("Artifact type", "نوع المخرج"), { exact: true })
        .selectOption("practice");
      await page
        .getByLabel(t("Study focus", "محور المذاكرة"), { exact: true })
        .selectOption("comparison");
      await page
        .getByLabel(t("Output language", "لغة المخرج"), { exact: true })
        .selectOption("mixed");
      await page
        .getByText(t("Depth and size", "التفصيل والحجم"), { exact: true })
        .click();
      await page
        .getByLabel(t("Depth", "التفصيل"), { exact: true })
        .selectOption("detailed");
      await page
        .getByLabel(t("Size", "الحجم"), { exact: true })
        .selectOption("extended");
      await page
        .getByRole("button", { name: t("Generate", "إنشاء"), exact: true })
        .click();
      const heading = page.getByRole("heading", {
        name: new RegExp(t("Simulated artifact", "مخرج محاكى"), "u"),
      });
      await expect(heading).toBeVisible();
      const output = heading.locator("..");
      await expect(output.locator("details")).toHaveCount(3, {
        timeout: 5_000,
      });
      await expect(output).toContainText("Which roots does the handout list");
      await expect(output).toContainText("ما الجذور التي تذكرها الملزمة");
      await expect(output).not.toContainText(
        "Question: Which roots does an upper trunk injury damage",
      );
      finish();
    },
  );
});

inLocales(["en", "ar"], (locale) => {
  test(
    `a fresh receipt uses the declared demo date [${locale}]`,
    { tag: ["@B01", "@M53", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      const date = (value: string) =>
        new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Africa/Cairo",
        }).format(new Date(value));
      const received = date("2026-10-01T12:00:00Z");
      await signIn(page, "leader", locale, campaign);
      const details = page.locator("details").filter({
        has: page.getByText(
          t("Assignment and campaign dates", "مواعيد التكليف والحملة"),
          { exact: true },
        ),
      });
      const summary = details.locator("summary");
      await expect(details).not.toHaveAttribute("open");
      await summary.press("Enter");
      await expect(summary).toBeFocused();
      await expect(details).toHaveAttribute("open");
      await expect(details).toContainText("2026-10-01 12:00 UTC");
      await expect(details).toContainText(date("2026-10-10T20:00:00Z"));
      await expect(details).toContainText(date("2026-10-12T20:00:00Z"));
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: t("Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .click();
      await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .press("Enter");
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toBeVisible();
      const latest = page.getByRole("region", {
        name: t("Recorded submissions", "الإرسالات المسجلة"),
        exact: true,
      });
      const receipt = latest
        .getByRole("listitem")
        .filter({ hasText: "Upper limb lecture material" });
      await expect(receipt).toHaveCount(1);
      await expect(receipt).toContainText(received, { timeout: 5_000 });
      await expect(
        latest.locator('[data-record-request^="sample-history-"]'),
      ).toHaveCount(5);
      await page
        .getByRole("link", {
          name: t("History", "السجل"),
          exact: true,
        })
        .click();
      const history = page.getByRole("region", {
        name: t("Requests with submissions", "الطلبات ذات الإرسالات"),
        exact: true,
      });
      await expect(
        history
          .getByRole("listitem")
          .filter({ hasText: "Upper limb lecture material" }),
      ).toContainText(received);
      await expect(
        history.locator('[data-record-request^="sample-history-"]').first(),
      ).toContainText(date("2026-09-20T10:00:00Z"));
      await expect(page.getByRole("note")).toContainText(
        "2026-10-01 12:00 UTC",
      );
      finish();
    },
  );
});

inLocales(["en", "ar"], (locale) => {
  test(
    `a normal invitation is in the future and retains its decision [${locale}]`,
    { tag: ["@B01", "@M53", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "leader", locale, "/batch-leader/invitation");
      await expect(page.getByRole("note")).toContainText(
        "2026-10-01 12:00 UTC",
      );
      await expect(page.getByRole("main")).toContainText(
        new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
          dateStyle: "medium",
          timeZone: "UTC",
        }).format(new Date("2026-10-10T20:00:00Z")),
      );
      const accept = page.getByRole("button", {
        name: t("Accept invitation", "قبول الدعوة"),
        exact: true,
      });
      await expect(accept).toBeEnabled();
      await accept.press("Enter");
      await expect(accept).toBeDisabled();
      await expect(page.getByRole("status").last()).toContainText(
        t("Invitation accepted", "تمت مراجعة الدعوة"),
      );
      finish();
    },
  );
});

for (const role of ["student", "leader", "admin"]) {
  test(
    `direct language switch preserves the route in both directions for ${role}`,
    { tag: ["@product-language"] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(
        page,
        role,
        "en",
        role === "student" ? unit + "/chat" : undefined,
      );
      const before = new URL(page.url());
      await expect(
        page.getByText("Interface language", { exact: true }),
      ).toHaveCount(0);
      await page
        .getByRole("group", { name: "Interface language", exact: true })
        .getByRole("button", { name: "العربية", exact: true })
        .click();
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.getByText("لغة الواجهة", { exact: true })).toHaveCount(
        0,
      );
      expect(new URL(page.url()).pathname).toBe(before.pathname);
      const english = page
        .getByRole("group", { name: "لغة الواجهة", exact: true })
        .getByRole("button", { name: "English", exact: true });
      await english.focus();
      await english.press("Enter");
      await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
      await expect(
        page
          .getByRole("group", { name: "Interface language", exact: true })
          .getByRole("button", { name: "English", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(new URL(page.url()).pathname).toBe(before.pathname);
      for (const locale of ["ar", "en"] as const) {
        await page
          .getByRole("group")
          .getByRole("button", {
            name: locale === "ar" ? "العربية" : "English",
            exact: true,
          })
          .click();
        const language = page.getByRole("group", {
          name: pick(locale, "Interface language", "لغة الواجهة"),
          exact: true,
        });
        // The compact "EN | ع" control (WP03 plan D1): current state by fill
        // and aria-pressed, no check icon; the Night bar stays 64px.
        await expect(language.getByRole("button")).toHaveText(["EN", "ع"]);
        await expect(
          language.getByRole("button", {
            name: locale === "ar" ? "العربية" : "English",
            exact: true,
          }),
        ).toHaveAttribute("aria-pressed", "true");
        await expect(language.locator("svg")).toHaveCount(0);
        const bar = await page
          .locator("header[data-workspace-chrome]")
          .first()
          .boundingBox();
        expect(bar!.height).toBeLessThanOrEqual(64);
        expect(new URL(page.url()).pathname).toBe(before.pathname);
        // Language button targets per width and scheme: layout matrix.
      }
      finish();
    },
  );
}

inLocales(["en", "ar"], (locale) => {
  test(
    `language switch keeps the Chat draft, route, query and fragment [${locale}]`,
    { tag: ["@product-language", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "student", locale, unit + "/chat");
      const draft = pick(
        locale,
        "Which roots form the upper trunk? (unsent draft)",
        "إيه الجذور اللي بتكوّن الجذع العلوي؟ (مسودة غير مرسلة)",
      );
      await page
        .getByLabel(pick(locale, "Message", "السؤال"), { exact: true })
        .fill(draft);
      // Same-document history change, as the product router makes it.
      await page.evaluate(() => {
        const address = new URL(window.location.href);
        address.searchParams.set("probe", "kept");
        address.hash = "app-content";
        window.history.replaceState(null, "", address);
      });
      const before = new URL(page.url());
      const next = locale === "en" ? "ar" : "en";
      await page
        .getByRole("group", {
          name: pick(locale, "Interface language", "لغة الواجهة"),
          exact: true,
        })
        .getByRole("button", {
          name: next === "ar" ? "العربية" : "English",
          exact: true,
        })
        .click();
      await expect(page.locator("html")).toHaveAttribute("lang", next);
      const after = new URL(page.url());
      expect(after.pathname).toBe(before.pathname);
      expect(after.searchParams.get("lang")).toBe(next);
      expect(after.searchParams.get("probe")).toBe("kept");
      expect(after.hash).toBe("#app-content");
      await expect(
        page.getByLabel(pick(next, "Message", "السؤال"), { exact: true }),
      ).toHaveValue(draft);
      finish();
    },
  );
});

inLocales(["en", "ar"], (locale) => {
  test(
    `visible navigation, separated return and compact settings [${locale}]`,
    { tag: ["@audit-01", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "student", locale, unit + "/chat");
      await navigate(page, "/settings", locale);
      const returnLink = page.getByRole("link", {
        name: pick(
          locale,
          "Return to Chat · Anatomy",
          "العودة إلى المحادثة · علم التشريح",
        ),
        exact: true,
      });
      const tabs = page.getByRole("tablist");
      await expect(returnLink).toHaveAttribute(
        "href",
        `${unit}/chat?lang=${locale}`,
      );
      // Return/tab separation and the phone tab grid per width and scheme run
      // in the layout matrix Settings state.
      await expect(tabs.getByRole("tab")).toHaveCount(4);
      // The keyboard and unit-switcher steps run in the narrow layout.
      await page.setViewportSize({ width: 320, height: 900 });
      const appearance = page.getByRole("tab", {
        name: pick(locale, "Appearance", "المظهر"),
        exact: true,
      });
      await appearance.press(locale === "en" ? "ArrowRight" : "ArrowLeft");
      const academic = page.getByRole("tab", {
        name: pick(locale, "Academic settings", "الإعدادات الدراسية"),
        exact: true,
      });
      await expect(academic).toBeFocused();
      await expect(academic).toHaveAttribute("aria-selected", "true");
      await expect(page).toHaveURL(new RegExp(`section=academic`));
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Academic settings", "الإعدادات الدراسية"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", {
          name: pick(
            locale,
            "Save academic settings",
            "حفظ الإعدادات الدراسية",
          ),
          exact: true,
        }),
      ).toBeVisible();
      await academic.press("Home");
      await expect(appearance).toBeFocused();
      await returnLink.click();
      await expect(page).toHaveURL(`${unit}/chat?lang=${locale}`);
      const switcher = unitMenuSummary(page);
      expect(
        await switcher.evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).fontSize),
        ),
      ).toBeGreaterThanOrEqual(12);
      await switcher.press("Enter");
      const subjects = page.getByRole("navigation", {
        name: b07UnitsName(locale),
      });
      await expect(subjects).toBeVisible();
      const expectContainedUnitMenu = async () => {
        const menu = await subjects.locator("..").boundingBox();
        expect(menu).not.toBeNull();
        expect(menu!.x).toBeGreaterThanOrEqual(0);
        expect(menu!.x + menu!.width).toBeLessThanOrEqual(
          page.viewportSize()!.width + 1,
        );
      };
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await expectContainedUnitMenu();
      }
      const destinations = await subjects
        .getByRole("link")
        .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
      expect(destinations.length).toBeGreaterThan(1);
      expect(
        destinations.every(
          (href) =>
            href?.startsWith(
              "/learn/zagazig-university-human-medicine-year-1-term-1-cohort/",
            ) && href.includes("/chat?"),
        ),
      ).toBe(true);
      const destination = subjects
        .getByRole("link")
        .filter({ hasNotText: pick(locale, "Anatomy", "علم التشريح") })
        .first();
      const destinationHref = await destination.getAttribute("href");
      const destinationName = await destination.innerText();
      await destination.click();
      await expect(page).toHaveURL(destinationHref!);
      await expect(
        page.getByRole("heading", { name: destinationName, exact: true }),
      ).toBeVisible();
      await page.addStyleTag({ content: "html { font-size: 200% }" });
      await expectReflow(page);
      await expect(switcher).toBeVisible();
      await switcher.press("Enter");
      await expect(subjects).toBeVisible();
      await expectContainedUnitMenu();
      await switcher.press("Enter");
      await page.addStyleTag({ content: "html { font-size: 100% }" });
      finish();
    },
  );
});

inLocales(["en", "ar"], (locale) => {
  test(
    `quiz count, difficulty, chosen timer and invalid input [${locale}]`,
    { tag: ["@workspace-revision", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "student", locale, unit + "/quiz");
      const start = page.getByRole("button", {
        name: pick(locale, "Start quiz", "بدء الاختبار"),
        exact: true,
      });
      await page
        .getByLabel(pick(locale, "Number of questions", "عدد الأسئلة"), {
          exact: true,
        })
        .fill("0");
      await expect(start).toBeDisabled();
      await page
        .getByLabel(pick(locale, "Number of questions", "عدد الأسئلة"), {
          exact: true,
        })
        .fill("4");
      await page
        .getByRole("radio", { name: pick(locale, "Hard", "صعب"), exact: true })
        .check();
      await page
        .getByRole("radio", {
          name: pick(locale, "Timed", "مؤقت"),
          exact: true,
        })
        .check();
      await page
        .getByLabel(pick(locale, "Duration (minutes)", "المدة (بالدقائق)"), {
          exact: true,
        })
        .fill("3");
      // Start shares the setup column's inline start edge (Direction B).
      const rect = await start.boundingBox();
      const field = await page
        .getByLabel(pick(locale, "Duration (minutes)", "المدة (بالدقائق)"), {
          exact: true,
        })
        .boundingBox();
      expect(
        Math.abs(
          locale === "ar"
            ? rect!.x + rect!.width - field!.x - field!.width
            : rect!.x - field!.x,
        ),
      ).toBeLessThan(2);
      await page.clock.install();
      await start.click();
      await expect(
        page.locator('fieldset:has(input[name^="sample-question-"])'),
      ).toHaveCount(4);
      await expect(page.getByRole("group").first()).toBeVisible();
      await expect(
        page.getByText(
          pick(
            locale,
            "Which answer preserves the evidence accurately?",
            "أي إجابة تحافظ على دقة الأدلة؟",
          ),
          { exact: true },
        ),
      ).toBeVisible();
      await expect(page.getByRole("timer")).toContainText(
        `${clock(locale, 3)}:${clock(locale, 0)}`,
      );
      await page.clock.fastForward(61_000);
      await expect(
        page.getByRole("button", {
          name: pick(locale, "Submit answers", "تسليم الإجابات"),
          exact: true,
        }),
      ).toBeVisible();
      await page.clock.fastForward(120_000);
      await expect(page.getByRole("main").getByRole("alert")).toContainText(
        pick(locale, "expired", "انتهى"),
      );
      finish();
    },
  );
});
