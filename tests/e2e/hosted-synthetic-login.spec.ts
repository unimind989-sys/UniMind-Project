import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import {
  b09Campaign,
  b09NamedUploadJourney,
  b09NewerIntentJourney,
  b09ReceiptJourney,
  openB09Upload,
  ensureB09Intake,
} from "./support/collection-b09";

for (const locale of ["en", "ar"] as const) {
  test(`merged B09 hosted ${locale}: delayed inspection preserves a newer request and locale`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const finish = await enter(
      page,
      "leader",
      locale,
      `${b09Campaign}?lang=${locale}`,
    );
    await b09NewerIntentJourney(page, locale);
    finish();
  });
  test(`merged B09 hosted ${locale}: request-first intake, three receipts, exact latest return and accessible reflow`, async ({
    page,
  }) => {
    test.setTimeout(150_000);
    const finish = await enter(
      page,
      "leader",
      locale,
      `/batch-leader?lang=${locale}`,
    );
    await b09ReceiptJourney(page, locale);
    finish();
  });
  test(`merged B09 hosted ${locale}: named uploads reject a wrong format and retain two request bindings`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const finish = await enter(
      page,
      "leader",
      locale,
      `${b09Campaign}?lang=${locale}`,
    );
    await b09NamedUploadJourney(page, locale);
    finish();
  });
}
import nodePath from "node:path";
import {
  answerExamples,
  getAdminCopy,
  promptExamples,
} from "./support/app-fixtures";

// Older return/guard journeys may use either configured course type. New B07-B
// journeys assert the exact program label; these retain locale-specific names.
const b07SourcesName = (locale: string) =>
  locale === "ar" ? /^مصادر (وحدة|مادة)$/u : /^(Module|Subject) sources$/u;
const b07DetailsName = (locale: string) =>
  locale === "ar" ? /^تفاصيل (وحدة|مادة)$/u : /^(Module|Subject) details$/u;
const b07ChooseName = (locale: string) =>
  locale === "ar"
    ? /^(اختر (وحدة|مادة)|تصفح كل المواد)$/u
    : /^(Choose a (module|subject)|Browse all subjects)$/u;

for (const locale of ["en", "ar"] as const) {
  test(`merged B08-D hosted ${locale}: cancellation keeps the aid and MCQ hides stale generation guidance`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = await enter(
      page,
      "student",
      locale,
      `${unit}/studio?lang=${locale}`,
    );
    await page.locator("#artifact-type").selectOption("quiz");
    await expect(
      page.locator("header[class*='artifactHeader'] span"),
    ).toHaveCount(0);
    await expect(
      page.getByText(
        t(
          "Set the question count, difficulty and timing in Quiz.",
          "حدد عدد الأسئلة والصعوبة والتوقيت في الاختبار.",
        ),
        { exact: true },
      ),
    ).toBeVisible();
    await page.locator("#artifact-type").selectOption("summary");
    await page.locator("#artifact-language").selectOption("mixed");
    await page
      .getByRole("button", { name: t("Generate", "إنشاء"), exact: true })
      .click();
    const output = page.locator("section[class*='artifactOutput']");
    await expect(output.locator("h2")).toBeFocused();
    const before = await output.innerText();
    await page.clock.install();
    await page.clock.pauseAt(new Date());
    await page.locator("#artifact-type").selectOption("practice");
    await page
      .getByRole("button", { name: t("Generate", "إنشاء"), exact: true })
      .click();
    await page
      .getByRole("button", {
        name: t("Cancel preparation", "إلغاء الإعداد"),
        exact: true,
      })
      .click();
    const cancelled = page.getByText(
      t(
        "Preparation cancelled. Your previous artifact is unchanged; Generate to retry.",
        "تم إلغاء الإعداد. المخرج السابق كما هو؛ اضغط إنشاء للمحاولة.",
      ),
      { exact: true },
    );
    await expect(cancelled).toBeVisible();
    await expect(output).toHaveText(before, { useInnerText: true });
    await page.locator("#artifact-type").selectOption("quiz");
    await expect(cancelled).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: t("Generate", "إنشاء"), exact: true }),
    ).toHaveCount(0);
    await expect(output).toHaveText(before, { useInnerText: true });
    await page.clock.fastForward(2_000);
    await page.clock.resume();
    await page
      .getByRole("link", {
        name: t("Set up MCQ quiz", "إعداد اختبار اختيار من متعدد"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: t("Set up your quiz", "إعداد الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
      .click();
    await expect(page.locator("#artifact-type")).toHaveValue("quiz");
    await expect(cancelled).toHaveCount(0);
    await expect(output).toHaveText(before, { useInnerText: true });
    await page.locator("#artifact-type").selectOption("summary");
    await expect(page.locator("#artifact-language")).toHaveValue("mixed");
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B08-D hosted ${locale}: six purpose choices use five aids and one complete MCQ flow`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = await enter(
      page,
      "student",
      locale,
      `${unit}/studio?lang=${locale}`,
    );
    const type = page.locator("#artifact-type");
    await expect(type.locator("option")).toHaveCount(6);
    expect(
      await type
        .locator("optgroup")
        .evaluateAll((items) =>
          items.map((item) => item.getAttribute("label")),
        ),
    ).toEqual([
      t("Understand", "افهم"),
      t("Practice", "تدرّب"),
      t("Review", "راجع"),
    ]);
    await page.locator("#artifact-language").selectOption("mixed");
    await page.locator("#artifact-topic").selectOption("comparison");
    await page
      .locator("details")
      .filter({ has: page.locator("#artifact-depth") })
      .locator("summary")
      .click();
    await page.locator("#artifact-depth").selectOption("detailed");
    await page.locator("#artifact-size").selectOption("extended");
    await page
      .getByRole("button", { name: t("Generate", "إنشاء"), exact: true })
      .click();
    const output = page.locator("section[class*='artifactOutput']");
    await expect(output.locator("h2")).toBeFocused();
    const retained = await output.innerText();
    for (const [id, en, ar] of [
      [
        "summary",
        "See the key ideas together.",
        "اجمع الأفكار الأساسية في نظرة واحدة.",
      ],
      [
        "guide",
        "Work through the topic step by step.",
        "ذاكر الموضوع خطوة بخطوة.",
      ],
      [
        "practice",
        "Explain an idea yourself, then reveal the source-backed answer.",
        "اشرح الفكرة بنفسك، ثم أظهر الإجابة المدعومة بالمصدر.",
      ],
      [
        "flashcards",
        "Recall an answer before turning the card over.",
        "استرجع الإجابة قبل قلب البطاقة.",
      ],
      [
        "revision",
        "Combine a checklist of key points with questions for a final review.",
        "اجمع قائمة بالنقاط الأساسية وأسئلة للمراجعة النهائية.",
      ],
      [
        "quiz",
        "Answer multiple-choice questions and review your corrections.",
        "أجب عن أسئلة الاختيار من متعدد وراجع تصحيح إجاباتك.",
      ],
    ]) {
      await type.selectOption(id!);
      await expect(type).toHaveAttribute(
        "aria-describedby",
        "artifact-purpose",
      );
      await expect(page.locator("#artifact-purpose")).toContainText(
        t(en!, ar!),
      );
      await expect(page.locator("#artifact-purpose")).toContainText(
        t("Example:", "مثال:"),
      );
      await expect(output).toHaveText(retained, { useInnerText: true });
    }
    await expect(
      page.getByRole("button", { name: t("Generate", "إنشاء"), exact: true }),
    ).toHaveCount(0);
    await expect(
      page.locator(
        "#artifact-language,#artifact-topic,#artifact-depth,#artifact-size",
      ),
    ).toHaveCount(0);
    await type.press("Enter");
    await expect(page.locator("[class*='artifactLoading']")).toHaveCount(0);
    const setup = page.getByRole("link", {
      name: t("Set up MCQ quiz", "إعداد اختبار اختيار من متعدد"),
      exact: true,
    });
    await expect(setup).toHaveCount(1);
    await expect(setup).toHaveAttribute("href", `${unit}/quiz?lang=${locale}`);
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        const scale = await page.addStyleTag({
          content: "html{font-size:200%}",
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        const box = await setup.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(44);
        await expect(setup).toBeVisible();
        await scale.evaluate((element) =>
          element.parentNode?.removeChild(element),
        );
      }
    }
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`mcq-entry-${locale}-320.png`),
    });
    await setup.press("Enter");
    await expect(
      page.getByRole("heading", {
        name: t("Set up your quiz", "إعداد الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("spinbutton", {
        name: t("Number of questions", "عدد الأسئلة"),
        exact: true,
      }),
    ).toHaveValue("2");
    await expect(
      page.getByRole("radio", { name: t("Medium", "متوسط"), exact: true }),
    ).toBeChecked();
    await page
      .getByRole("spinbutton", {
        name: t("Number of questions", "عدد الأسئلة"),
        exact: true,
      })
      .fill("3");
    await page
      .getByRole("radio", { name: t("Hard", "صعب"), exact: true })
      .check();
    await page
      .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
      .check();
    await page
      .getByRole("spinbutton", {
        name: t("Duration (minutes)", "المدة (بالدقائق)"),
        exact: true,
      })
      .fill("2");
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
    await expect(page.locator("fieldset")).toHaveCount(3);
    for (let i = 0; i < 3; i++)
      await page.locator(`input[name="sample-question-${i}"]`).first().check();
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
    const review = page.url();
    await expect(page.locator("input[type=radio]:enabled")).toHaveCount(0);
    await page
      .getByRole("button", {
        name: `${t("Supporting passages for question", "النصوص الداعمة للسؤال")} ${new Intl.NumberFormat(locale).format(3)}`,
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator("blockquote")).toHaveCount(2);
    await dialog
      .getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", {
        name: t("Return to quiz review", "العودة إلى مراجعة الاختبار"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(review);
    await page
      .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
      .click();
    await expect(type).toHaveValue("quiz");
    await expect(output).toHaveText(retained, { useInnerText: true });
    await type.selectOption("summary");
    for (const [id, value] of [
      ["language", "mixed"],
      ["topic", "comparison"],
      ["depth", "detailed"],
      ["size", "extended"],
    ])
      await expect(page.locator(`#artifact-${id}`)).toHaveValue(value!);
    finish();
  });
  test(`merged B08-D hosted ${locale}: MCQ navigation keeps the prior quiz identity answers and original deadline`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = await enter(
      page,
      "student",
      locale,
      `${unit}/quiz?lang=${locale}`,
    );
    await page.clock.install();
    await page
      .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
      .check();
    await page
      .getByRole("spinbutton", {
        name: t("Duration (minutes)", "المدة (بالدقائق)"),
        exact: true,
      })
      .fill("1");
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    const first = page.locator('input[name="sample-question-0"]').first();
    await first.check();
    const attempt = page.url();
    const key = new URL(attempt).searchParams.get("attempt");
    const timer = await page.getByRole("timer").innerText();
    await page
      .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
      .click();
    await page.locator("#artifact-type").selectOption("quiz");
    await expect(page.locator("section[class*='artifactOutput']")).toHaveCount(
      0,
    );
    await page
      .getByRole("link", {
        name: t("Set up MCQ quiz", "إعداد اختبار اختيار من متعدد"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("radio", { name: t("Timed", "مؤقت"), exact: true }),
    ).toBeChecked();
    await expect(
      page.getByRole("spinbutton", {
        name: t("Duration (minutes)", "المدة (بالدقائق)"),
        exact: true,
      }),
    ).toHaveValue("1");
    await page.clock.fastForward(5_000);
    await page.goBack();
    await expect(page.locator("#artifact-type")).toHaveValue("quiz");
    await page.goBack();
    await expect(page).toHaveURL(attempt);
    await expect(first).toBeChecked();
    await expect(page.getByRole("timer")).not.toHaveText(timer);
    await expect(
      page.getByRole("button", {
        name: t("Submit answers", "تسليم الإجابات"),
        exact: true,
      }),
    ).toBeDisabled();
    await page.clock.fastForward(61_000);
    await page.clock.resume();
    await expect(
      page.getByRole("heading", {
        name: t("Expired quiz review", "مراجعة الاختبار المنتهي"),
        exact: true,
      }),
    ).toBeVisible();
    expect(new URL(page.url()).searchParams.get("attempt")).toBe(key);
    await expect(first).toBeChecked();
    await expect(first).toBeDisabled();
    await expect(page.getByRole("main")).toContainText(
      t("No score was recorded.", "لم تسجل نتيجة."),
    );
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B08-C hosted ${locale}: expired unscored corrections retain enabled passages and exact source returns`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = await enter(page, "student", locale, unit + "/quiz");
    await page
      .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
      .check();
    await page
      .getByLabel(t("Duration (minutes)", "المدة (بالدقائق)"), { exact: true })
      .fill("1");
    const reference = new Date("2026-10-15T12:00:00Z");
    await page.clock.install({ time: reference });
    await page.clock.pauseAt(new Date(reference.getTime() + 1000));
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await page.locator('input[name="sample-question-0"]').first().check();
    await expect(
      page.getByRole("button", {
        name: new RegExp(
          t("^Supporting passages for question", "^النصوص الداعمة للسؤال"),
          "u",
        ),
      }),
    ).toHaveCount(0);
    await page.clock.fastForward(61_000);
    await page.clock.resume();
    await expect(page).toHaveURL(/\/review\?attempt=/u);
    const reviewUrl = page.url();
    await expect(page.getByRole("main")).toContainText(
      t("No score was recorded.", "لم تسجل نتيجة."),
    );
    const inspect = page.getByRole("button", {
      name:
        t("Supporting passages for question", "النصوص الداعمة للسؤال") +
        " " +
        new Intl.NumberFormat(locale).format(2),
      exact: true,
    });
    await expect(inspect).toBeEnabled();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await inspect.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator("blockquote")).toHaveCount(2);
    await dialog.press("Escape");
    await expect(inspect).toBeFocused();
    await inspect.click();
    await page
      .getByRole("dialog")
      .getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: t("Material library", "مكتبة المصادر"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(8);
    await page
      .getByRole("link", {
        name: t("Return to quiz review", "العودة إلى مراجعة الاختبار"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(reviewUrl);
    for (const input of await page.locator("fieldset input").all())
      await expect(input).toBeDisabled();
    await expect(
      page.locator('input[name="sample-question-0"]').first(),
    ).toBeChecked();
    await expect(page.getByRole("main")).toContainText(
      t("No score was recorded.", "لم تسجل نتيجة."),
    );
    finish();
  });
  test(`merged B08-C hosted ${locale}: inactive current reading preserves aid and submitted-quiz passages`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const t = (en: string, ar: string) => pick(locale, en, ar),
      copy = getAdminCopy(locale);
    const finish = await enter(
      page,
      locale === "ar" ? "second-admin" : "admin",
      locale,
      unit + "/studio",
    );
    await page
      .getByRole("button", { name: t("Generate", "إنشاء"), exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: t("Supporting passages", "النصوص الداعمة"),
        exact: true,
      }),
    ).toBeVisible();
    const aidBefore = await page
      .locator("section[class*='artifactOutput']")
      .innerText();
    await page
      .getByRole("link", { name: t("Quiz", "الاختبار"), exact: true })
      .click();
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    for (let q = 0; q < 2; q++)
      await page.locator(`input[name="sample-question-${q}"]`).first().check();
    await page
      .getByRole("button", {
        name: t("Submit answers", "تسليم الإجابات"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/review\?attempt=/u);
    const reviewUrl = page.url();
    await page
      .getByRole("link", {
        name: t("Return to Admin", "العودة للإدارة"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: new RegExp(`^${copy.actions.DEACTIVATE_SOURCE}`, "u"),
      })
      .click();
    await page
      .getByLabel(copy.reason)
      .fill("Synthetic processed passage availability review.");
    await page
      .getByRole("button", { name: copy.reviewAction, exact: true })
      .click();
    await page
      .getByRole("button", {
        name: `${copy.confirmAction}: ${copy.actions.DEACTIVATE_SOURCE}`,
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: copy.actionSuccess }),
    ).toBeVisible();
    await page
      .getByRole("link", {
        name: t("Preview student", "معاينة الطالب"),
        exact: true,
      })
      .click();
    const rows = page.locator("article[class*='sourceRow']");
    await expect(rows).toHaveCount(8);
    await expect(rows.nth(0)).toContainText(
      t(
        "Reading is unavailable for new study while this source is inactive.",
        "القراءة للمذاكرة الجديدة غير متاحة ما دام هذا المصدر غير نشط.",
      ),
    );
    await expect(rows.nth(0).locator("summary")).toHaveCount(0);
    await expect(rows.nth(1).locator("summary")).toHaveText(
      t("Read transcript excerpt", "قراءة مقتطف التفريغ"),
    );
    await page
      .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: t("Generate", "إنشاء"), exact: true }),
    ).toBeDisabled();
    await expect(page.locator("section[class*='artifactOutput']")).toHaveText(
      aidBefore,
      { useInnerText: true },
    );
    await page
      .getByRole("button", {
        name: t("Supporting passages", "النصوص الداعمة"),
        exact: true,
      })
      .click();
    await expect(page.getByRole("dialog").locator("blockquote")).toHaveCount(2);
    await expect(page.getByRole("dialog")).toContainText(
      t(
        "Inactive · excluded from new requests",
        "غير نشط · مستبعد من الطلبات الجديدة",
      ),
    );
    await page.getByRole("dialog").press("Escape");
    await page
      .getByRole("link", { name: t("Quiz", "الاختبار"), exact: true })
      .click();
    await page
      .getByRole("link", {
        name: t("Review score", "مراجعة النتيجة"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(reviewUrl);
    await page
      .getByRole("button", {
        name:
          t("Supporting passages for question", "النصوص الداعمة للسؤال") +
          " " +
          new Intl.NumberFormat(locale).format(1),
        exact: true,
      })
      .click();
    await expect(page.getByRole("dialog").locator("blockquote")).toHaveCount(1);
    await expect(page.getByRole("dialog")).toContainText(
      t(
        "Inactive · excluded from new requests",
        "غير نشط · مستبعد من الطلبات الجديدة",
      ),
    );
    await page.getByRole("dialog").press("Escape");
    await expect(page).toHaveURL(reviewUrl);
    for (const input of await page.locator("fieldset input").all())
      await expect(input).toBeDisabled();
    await page
      .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
      .click();
    const inactiveAid = await page
      .locator("section[class*='artifactOutput']")
      .innerText();
    await page.locator("#artifact-type").selectOption("quiz");
    await page
      .getByRole("link", {
        name: t("Set up MCQ quiz", "إعداد اختبار اختيار من متعدد"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", {
        name: t("Start new attempt", "بدء محاولة جديدة"),
        exact: true,
      }),
    ).toBeDisabled();
    await page
      .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
      .click();
    await expect(page.locator("section[class*='artifactOutput']")).toHaveText(
      inactiveAid,
      { useInnerText: true },
    );
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B08-C hosted ${locale}: library separates tool availability and supplied processed reading`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    for (const dense of [false]) {
      const finish = await enter(page, "student", locale, unit);
      const rows = page.locator("article[class*='sourceRow']");
      const count = dense ? 24 : 8;
      await expect(rows).toHaveCount(count);
      await expect(
        rows.getByText(
          t("Available for learning tools", "متاح لأدوات المذاكرة"),
          { exact: true },
        ),
      ).toHaveCount(count);
      await expect(
        rows.getByText(
          t("No reading passage supplied", "لا يوجد نص متاح للقراءة"),
          { exact: true },
        ),
      ).toHaveCount(count - 2);
      await expect(
        rows.getByText(
          t(
            "No verified page or timestamp reference",
            "لا يوجد مرجع موثّق لصفحة أو توقيت",
          ),
          { exact: true },
        ),
      ).toHaveCount(count - 2);
      await expect(rows.locator("summary")).toHaveCount(2);
      const passage = rows.nth(0).locator("summary"),
        transcript = rows.nth(1).locator("summary");
      await expect(passage).toHaveText(
        t("Read processed passage", "قراءة النص المعالج"),
      );
      await expect(transcript).toHaveText(
        t("Read transcript excerpt", "قراءة مقتطف التفريغ"),
      );
      await passage.press("Enter");
      await expect(
        rows
          .nth(0)
          .getByText(
            t(
              "Identify the labels, then compare the diagrams.",
              "حدد الأسماء ثم قارن الرسوم.",
            ),
            { exact: true },
          ),
      ).toBeVisible();
      await transcript.press("Enter");
      await expect(
        rows
          .nth(1)
          .getByText(
            t(
              "Compare first, then identify the labels.",
              "قارن أولًا ثم حدد الأسماء.",
            ),
            { exact: true },
          ),
      ).toBeVisible();
      await expect(rows.nth(1)).toContainText(
        t("Processed excerpt only.", "مقتطف معالج فقط."),
      );
      for (const theme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme: theme });
        for (const width of [1440, 390, 320]) {
          await page.setViewportSize({ width, height: 1000 });
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          ).toBe(true);
          expect((await passage.boundingBox())!.height).toBeGreaterThanOrEqual(
            44,
          );
        }
      }
      const scale = await page.addStyleTag({ content: "html{font-size:200%}" });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .include("main")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`library-${locale}-${count}-320-200.png`),
      });
      await scale.evaluate((e) => e.parentNode?.removeChild(e));
      finish();
    }
  });
  test(`merged B08-C hosted ${locale}: five generated aids open their passages directly and retain one distinct full library`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = await enter(page, "student", locale, unit + "/studio");
    await page.locator("#artifact-language").selectOption("mixed");
    for (const type of [
      "summary",
      "guide",
      "practice",
      "flashcards",
      "revision",
    ]) {
      await page.locator("#artifact-type").selectOption(type);
      await page
        .getByRole("button", { name: t("Generate", "إنشاء"), exact: true })
        .press("Enter");
      const output = page.locator("section[class*='artifactOutput']");
      await expect(output.locator("h2")).toBeFocused();
      const inspect = output.getByRole("button", {
        name: t("Supporting passages", "النصوص الداعمة"),
        exact: true,
      });
      await expect(inspect).toBeVisible();
      const before = await output.innerText();
      await inspect.press("Enter");
      const dialog = page.getByRole("dialog", {
        name: t("Supporting passages", "النصوص الداعمة"),
        exact: true,
      });
      await expect(dialog).toBeVisible();
      await expect(dialog.locator("blockquote")).toHaveCount(2);
      await expect(dialog).toContainText(t("Sample page 3", "صفحة تجريبية ٣"));
      await expect(dialog).toContainText(
        t("Sample timestamp 02:10", "توقيت تجريبي ٠٢:١٠"),
      );
      await expect(dialog.getByRole("link")).toHaveCount(1);
      await expect(dialog.getByRole("link")).toHaveAttribute(
        "href",
        `${unit}/sources?from=studio&lang=${locale}`,
      );
      if (type === "revision") {
        for (const theme of ["light", "dark"] as const) {
          await page.emulateMedia({ colorScheme: theme });
          for (const width of [1440, 390, 320]) {
            await page.setViewportSize({ width, height: 1000 });
            expect(
              await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth + 1,
              ),
            ).toBe(true);
            await expect(
              dialog.getByRole("button", {
                name: t("Close", "إغلاق"),
                exact: true,
              }),
            ).toBeVisible();
          }
        }
        const scale = await page.addStyleTag({
          content: "html{font-size:200%}",
        });
        expect(
          (
            await new AxeBuilder({ page })
              .include("dialog[open]")
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        await page.screenshot({
          path: testInfo.outputPath(`aid-passages-${locale}-320-200.png`),
        });
        await scale.evaluate((e) => e.parentNode?.removeChild(e));
      }
      await dialog.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(inspect).toBeFocused();
      await expect(output).toHaveText(before, { useInnerText: true });
    }
    const output = page.locator("section[class*='artifactOutput']");
    const before = await output.innerText();
    await page.getByRole("link", { name: b07SourcesName(locale) }).click();
    await expect(
      page.getByRole("heading", {
        name: t("Material library", "مكتبة المصادر"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(8);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page
      .getByRole("link", {
        name: t("Return to Studio", "العودة للاستوديو"),
        exact: true,
      })
      .click();
    await expect(output).toHaveText(before, { useInnerText: true });
    await expect(page.locator("#artifact-language")).toHaveValue("mixed");
    finish();
  });
  test(`merged B08-C hosted ${locale}: every quiz explanation opens only its exact supporting passages with locked answers`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = await enter(page, "student", locale, unit + "/quiz");
    const evidenceSets = {
      easy: [[0], [1], [0, 1], [0], [1], [0, 1]],
      medium: [[0], [0, 1], [1], [0, 1], [1], [0]],
      hard: [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0]],
    };
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      await page
        .getByLabel(t("Number of questions", "عدد الأسئلة"), { exact: true })
        .fill("6");
      await page
        .getByRole("radio", {
          name:
            difficulty === "easy"
              ? t("Easy", "سهل")
              : difficulty === "medium"
                ? t("Medium", "متوسط")
                : t("Hard", "صعب"),
          exact: true,
        })
        .check();
      await page
        .getByRole("button", {
          name:
            difficulty === "easy"
              ? t("Start quiz", "بدء الاختبار")
              : t("Start new attempt", "بدء محاولة جديدة"),
          exact: true,
        })
        .click();
      await expect(
        page.locator('input[name="sample-question-0"]').first(),
      ).toBeVisible();
      await expect(
        page.getByRole("button", {
          name: new RegExp(
            t("^Supporting passages for question", "^النصوص الداعمة للسؤال"),
            "u",
          ),
        }),
      ).toHaveCount(0);
      await expect(page.getByRole("dialog")).toHaveCount(0);
      for (let q = 0; q < 6; q++)
        await page
          .locator(`input[name="sample-question-${q}"]`)
          .first()
          .check();
      await page
        .getByRole("button", {
          name: t("Submit answers", "تسليم الإجابات"),
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(/\/review\?attempt=/u);
      const reviewUrl = page.url(),
        radios = await page
          .locator("fieldset input")
          .evaluateAll((nodes) =>
            nodes.map((n) => (n as HTMLInputElement).checked),
          );
      for (let q = 0; q < 6; q++) {
        const name =
          t("Supporting passages for question", "النصوص الداعمة للسؤال") +
          " " +
          new Intl.NumberFormat(locale).format(q + 1);
        const inspect = page.getByRole("button", { name, exact: true });
        await expect(inspect).toBeEnabled();
        await inspect.press("Enter");
        const dialog = page.getByRole("dialog", { name, exact: true });
        await expect(dialog).toBeVisible();
        await expect(dialog.locator("blockquote")).toHaveCount(
          evidenceSets[difficulty][q]!.length,
        );
        for (const source of [0, 1]) {
          const heading = dialog.getByRole("heading", {
            name:
              source === 0
                ? t("Synthetic sequence handout", "ملزمة الترتيب التجريبية")
                : t(
                    "Synthetic comparison recording",
                    "تسجيل المقارنة التجريبي",
                  ),
            exact: true,
          });
          await expect(heading).toHaveCount(
            evidenceSets[difficulty][q]!.includes(source) ? 1 : 0,
          );
        }
        await expect(dialog.getByRole("link")).toHaveAttribute(
          "href",
          new RegExp(
            `from=quiz-review&attempt=${new URL(reviewUrl).searchParams.get("attempt")}&lang=${locale}$`,
            "u",
          ),
        );
        await dialog.press("Escape");
        await expect(dialog).not.toBeVisible();
        await expect(inspect).toBeFocused();
        await expect(page).toHaveURL(reviewUrl);
      }
      expect(
        await page
          .locator("fieldset input")
          .evaluateAll((nodes) =>
            nodes.map((n) => (n as HTMLInputElement).checked),
          ),
      ).toEqual(radios);
      for (const input of await page.locator("fieldset input").all())
        await expect(input).toBeDisabled();
      await page.screenshot({
        path: testInfo.outputPath(`quiz-passages-${locale}-${difficulty}.png`),
      });
      await page
        .getByRole("link", {
          name: t("Back to quiz", "العودة للاختبار"),
          exact: true,
        })
        .click();
    }
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B08-B hosted ${locale}: unsupported and conflicting replies preserve drafts sources and copyable clarification`, async ({
    page,
  }, testInfo) => {
    const t = (en: string, ar: string) => pick(locale, en, ar);
    test.setTimeout(120_000);
    const finish = await enter(page, "student", locale, unit + "/chat");
    await page
      .getByRole("link", { name: t("Chat", "المحادثة"), exact: true })
      .click();
    await page
      .locator("#message")
      .fill(promptExamples.unavailable[locale === "ar" ? 1 : 0]);
    await page
      .getByRole("button", { name: t("Send", "إرسال"), exact: true })
      .click();
    await expect(page.locator("#message")).toHaveValue("");
    const first = page.locator("#exchange-1");
    await expect(first).toContainText(
      t(
        "The current sources do not support an answer to this question.",
        "المصادر الحالية لا تدعم إجابة لهذا السؤال.",
      ),
    );
    await page.locator("#message").fill("Synthetic unsent recovery draft.");
    const questions = first.locator("summary").filter({
      hasText: t(
        "Questions covered by these materials",
        "أسئلة تغطيها هذه المصادر",
      ),
    });
    await questions.press("Enter");
    await expect(
      first.getByText(promptExamples.supported[locale === "ar" ? 1 : 0], {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      first.getByText(promptExamples.hint[locale === "ar" ? 1 : 0], {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator("#message")).toHaveValue(
      "Synthetic unsent recovery draft.",
    );
    await first
      .getByRole("link", {
        name: t("View available materials", "عرض مصادر المذاكرة المتاحة"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: t("Materials", "مصادر المذاكرة"),
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: t("Chat", "المحادثة"), exact: true })
      .click();
    await expect(page.locator("#message")).toHaveValue(
      "Synthetic unsent recovery draft.",
    );
    await page
      .locator("#message")
      .fill(promptExamples.conflict[locale === "ar" ? 1 : 0]);
    await page
      .getByRole("button", { name: t("Send", "إرسال"), exact: true })
      .click();
    await expect(page.locator("#message")).toHaveValue("");
    const conflict = page.locator("#exchange-2");
    await expect(conflict).toContainText(
      answerExamples.conflict[locale === "ar" ? 1 : 0],
    );
    await page
      .locator("#message")
      .fill("Synthetic draft must survive copying a clarification.");
    const summary = conflict.locator("summary").filter({
      hasText: t(
        "Question to ask about this conflict",
        "سؤال للاستفسار عن هذا التعارض",
      ),
    });
    await summary.press("Enter");
    const clarification = conflict.getByRole("textbox", {
      name: t("Clarification question", "سؤال التوضيح"),
      exact: true,
    });
    await expect(clarification).toHaveAttribute("readonly", "");
    await expect(clarification).toHaveAttribute("lang", locale);
    await expect(clarification).toHaveValue(
      locale === "en"
        ? /handout places identification before comparison.*recording places comparison first.*approved source/u
        : /الملزمة تضع التحديد قبل المقارنة.*التسجيل يضع المقارنة أولًا.*مصدر معتمد/u,
    );
    await clarification.focus();
    await clarification.press("Control+A");
    await expect(page.locator("#message")).toHaveValue(
      "Synthetic draft must survive copying a clarification.",
    );
    const cite = conflict.getByRole("button", {
      name: t("Two source excerpts", "نصان من مصدرين"),
      exact: true,
    });
    await cite.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator("blockquote")).toHaveCount(2);
    await dialog.press("Escape");
    await expect(cite).toBeFocused();
    await expect(page.locator("#message")).toHaveValue(
      "Synthetic draft must survive copying a clarification.",
    );
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(
          44,
        );
        await expect(clarification).toBeVisible();
      }
    }
    const scale = await page.addStyleTag({ content: "html{font-size:200%}" });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);

    await page.screenshot({
      path: testInfo.outputPath(`clarification-${locale}-320-200.png`),
    });
    await scale.evaluate((e) => e.parentNode?.removeChild(e));
    await page
      .getByRole("button", {
        name: locale === "en" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(page.locator("textarea[readonly]")).toHaveAttribute(
      "lang",
      locale === "en" ? "ar" : "en",
    );
    await expect(page.locator("#message")).toHaveValue(
      "Synthetic draft must survive copying a clarification.",
    );
    await expect(page.locator('article[id^="exchange-"]')).toHaveCount(2);
    finish();
  });
}
for (const locale of ["en", "ar"] as const) {
  test(`merged B08-B hosted ${locale}: current inactive-source guidance retains history and recording-backed next steps`, async ({
    page,
  }) => {
    const t = (en: string, ar: string) => pick(locale, en, ar),
      copy = getAdminCopy(locale);
    test.setTimeout(120_000);
    const finish = await enter(page, "admin", locale);
    await page
      .getByRole("button", {
        name: new RegExp(`^${copy.actions.DEACTIVATE_SOURCE}`),
      })
      .click();
    await page
      .getByLabel(copy.reason)
      .fill("Synthetic source availability recovery review.");
    await page
      .getByRole("button", { name: copy.reviewAction, exact: true })
      .click();
    await page
      .getByRole("button", {
        name: `${copy.confirmAction}: ${copy.actions.DEACTIVATE_SOURCE}`,
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: copy.actionSuccess }),
    ).toBeVisible();
    await page
      .getByRole("link", {
        name: t("Preview student", "معاينة الطالب"),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", { name: t("Chat", "المحادثة"), exact: true })
      .click();
    await page
      .locator("#message")
      .fill(promptExamples.supported[locale === "ar" ? 1 : 0]);
    await page
      .getByRole("button", { name: t("Send", "إرسال"), exact: true })
      .click();
    await expect(page.locator("#message")).toHaveValue("");
    const reply = page.locator("#exchange-1");
    await expect(reply).toContainText(
      answerExamples.unavailable[locale === "ar" ? 1 : 0],
    );
    await expect(reply).toContainText(
      t(
        "The handout is currently inactive, so new answers cannot use it.",
        "الملزمة غير نشطة حاليًا، فلا تستخدمها الإجابات الجديدة.",
      ),
    );
    await page.locator("#message").fill("Synthetic inactive-source draft.");
    await reply
      .locator("summary")
      .filter({
        hasText: t(
          "Questions covered by these materials",
          "أسئلة تغطيها هذه المصادر",
        ),
      })
      .press("Enter");
    await expect(
      reply.getByText(promptExamples.hint[locale === "ar" ? 1 : 0], {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      reply
        .locator("details")
        .getByText(promptExamples.supported[locale === "ar" ? 1 : 0], {
          exact: true,
        }),
    ).toHaveCount(0);
    await reply
      .getByRole("link", {
        name: t("View available materials", "عرض مصادر المذاكرة المتاحة"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: t("Materials", "مصادر المذاكرة"),
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: t("Chat", "المحادثة"), exact: true })
      .click();
    await expect(page.locator("#message")).toHaveValue(
      "Synthetic inactive-source draft.",
    );
    await page
      .locator("#message")
      .fill(promptExamples.hint[locale === "ar" ? 1 : 0]);
    await page
      .getByRole("button", { name: t("Send", "إرسال"), exact: true })
      .click();
    await expect(page.locator("#message")).toHaveValue("");
    await expect(page.locator("#exchange-2")).toContainText(
      answerExamples.hint[locale === "ar" ? 1 : 0],
    );
    await page
      .locator("#exchange-2")
      .getByRole("button", {
        name: t("Recording · 02:10", "التسجيل · ٠٢:١٠"),
        exact: true,
      })
      .click();
    await expect(page.getByRole("dialog").locator("blockquote")).toHaveCount(1);
    await page.getByRole("dialog").press("Escape");

    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B08-A hosted ${locale}: explicit replacement and directional flashcards preserve cancellation and course memory`, async ({
    page,
  }, testInfo) => {
    const t = (en: string, ar: string) => pick(locale, en, ar);
    test.setTimeout(120_000);
    const finish = await enter(page, "student", locale);
    await page.getByRole("link", { name: "Samir Hassan", exact: true }).click();
    await page
      .getByRole("tab", {
        name: t("Academic settings", "الإعدادات الدراسية"),
        exact: true,
      })
      .click();
    for (const [key, value] of [
      ["stage", "university"],
      ["institution", "zagazig-university"],
      ["program", "human-medicine"],
      ["level", "human-medicine-year-1"],
      ["term", "human-medicine-year-1-term-1"],
    ])
      await page.locator(`#academic-${key}Id`).selectOption(value!);
    await page
      .getByRole("button", {
        name: t("Save academic settings", "حفظ الإعدادات الدراسية"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("status").filter({
        hasText: t("Academic settings saved.", "تم حفظ الإعدادات الدراسية."),
      }),
    ).toBeVisible();

    await page
      .getByRole("navigation", {
        name: t("Product navigation", "تنقل المنتج"),
        exact: true,
      })
      .getByRole("link", { name: t("Study", "المذاكرة"), exact: true })
      .click();
    await page
      .getByRole("link", {
        name: t("Open Anatomy", "فتح علم التشريح"),
        exact: true,
      })
      .click();

    await page
      .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
      .click();
    await expect(page.locator("#artifact-type")).toBeVisible();
    await expect(
      page.getByText(
        t(
          "Studio keeps one current aid for each module.",
          "يحتفظ الاستوديو بأداة حالية واحدة لكل مقرر.",
        ),
        { exact: true },
      ),
    ).toBeVisible();
    await page.locator("#artifact-type").selectOption("flashcards");
    await page.locator("#artifact-language").selectOption("mixed");
    const generate = page.getByRole("button", {
      name: t("Generate", "إنشاء"),
      exact: true,
    });
    await generate.press("Enter");
    const heading = page.getByRole("heading", {
      name: t("Simulated artifact: Flashcards", "مخرج محاكى: بطاقات مراجعة"),
      exact: true,
    });
    await expect(heading).toBeFocused();
    const output = page.locator('[class*="artifactOutput"]');
    const card = page.getByRole("region", {
      name: t("Flashcard", "بطاقة مراجعة"),
      exact: true,
    });
    const flip = output.getByRole("button", {
      name: new RegExp(
        t("^Show (answer|question)$", "^إظهار (الإجابة|السؤال)$"),
      ),
    });
    const side = page.locator("#flashcard-side");
    await expect(flip).toHaveAccessibleName(t("Show answer", "إظهار الإجابة"));
    await expect(card).toHaveAccessibleDescription(
      t("Question side", "وجه السؤال"),
    );
    await expect(side).toBeVisible();
    await flip.focus();
    await flip.press("Enter");
    await expect(flip).toBeFocused();
    await expect(flip).toHaveAccessibleName(t("Show question", "إظهار السؤال"));
    await expect(card).toHaveAccessibleDescription(
      t("Answer side", "وجه الإجابة"),
    );
    await expect(card.locator('[class*="flashcardFront"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(card.locator('[class*="flashcardBack"]')).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    await flip.press("Space");
    await expect(flip).toHaveAccessibleName(t("Show answer", "إظهار الإجابة"));
    await expect(card).toHaveAccessibleDescription(
      t("Question side", "وجه السؤال"),
    );
    await flip.press("Enter");
    const prior = await output.innerText();
    await expect(
      page.getByText(
        t(
          "Generating again replaces the current aid for this module when it finishes. Cancel keeps the current aid.",
          "عند اكتمال إنشاء أداة جديدة، تحل محل الأداة الحالية في هذا المقرر. الإلغاء يُبقي الأداة الحالية.",
        ),
        { exact: true },
      ),
    ).toBeVisible();
    const reference = new Date(await page.evaluate(() => Date.now()));
    await page.clock.install({ time: reference });
    await page.clock.pauseAt(new Date(reference.getTime() + 1000));
    await page.locator("#artifact-type").selectOption("practice");
    await generate.click();
    await expect(generate).toBeDisabled();
    await expect(output).toHaveText(prior, { useInnerText: true });
    await page
      .getByRole("button", {
        name: t("Cancel preparation", "إلغاء الإعداد"),
        exact: true,
      })
      .click();
    await page.clock.runFor(2000);
    await expect(generate).toBeEnabled();
    await expect(output).toHaveText(prior, { useInnerText: true });
    await expect(flip).toHaveAccessibleName(t("Show question", "إظهار السؤال"));
    await expect(card).toHaveAccessibleDescription(
      t("Answer side", "وجه الإجابة"),
    );
    await generate.click();
    await page.clock.runFor(1100);
    await expect(
      page.getByRole("heading", {
        name: t(
          "Simulated artifact: Practice questions",
          "مخرج محاكى: أسئلة تدريب",
        ),
        exact: true,
      }),
    ).toBeFocused();
    await expect(card).toHaveCount(0);
    await expect(output).toHaveCount(1);
    const study = page
      .getByRole("navigation", {
        name: t("Product navigation", "تنقل المنتج"),
        exact: true,
      })
      .getByRole("link", { name: t("Study", "المذاكرة"), exact: true });
    await study.click();
    await expect(
      page.getByText(t("Practice questions", "أسئلة تدريب"), { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("link", {
        name: t("Resume Anatomy", "متابعة علم التشريح"),
        exact: true,
      })
      .click();
    await expect(output).toHaveCount(1);
    await page.locator("#artifact-type").selectOption("flashcards");
    await generate.click();
    await page.clock.runFor(1100);
    await expect(heading).toBeFocused();
    await expect(flip).toHaveAccessibleName(t("Show answer", "إظهار الإجابة"));
    await expect(card).toHaveAccessibleDescription(
      t("Question side", "وجه السؤال"),
    );
    await page.clock.resume();
    await page
      .getByRole("navigation", {
        name: t("Product navigation", "تنقل المنتج"),
        exact: true,
      })
      .getByRole("link", { name: t("Subjects", "المواد"), exact: true })
      .click();
    await page
      .getByRole("link", {
        name: t("Open Biochemistry", "فتح الكيمياء الحيوية"),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
      .click();
    await expect(page.locator("#artifact-type")).toBeVisible();
    await expect(output).toHaveCount(0);
    await generate.click();
    await expect(
      page.getByRole("heading", {
        name: t(
          "Simulated artifact: Structured summary",
          "مخرج محاكى: ملخص منظم",
        ),
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("navigation", {
        name: t("Product navigation", "تنقل المنتج"),
        exact: true,
      })
      .getByRole("link", { name: t("Subjects", "المواد"), exact: true })
      .click();
    await page
      .getByRole("link", {
        name: t("Open Anatomy", "فتح علم التشريح"),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
      .click();
    await expect(heading).toBeVisible();
    await expect(page.locator("#artifact-language")).toHaveValue("mixed");
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        expect((await flip.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        await flip.press("Enter");
        await expect(flip).toBeFocused();
        await flip.press("Enter");
      }
    }
    const enlarged = await page.addStyleTag({
      content: "html{font-size:200%}",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);

    await page.screenshot({
      path: testInfo.outputPath(`studio-controls-${locale}-320-200.png`),
    });
    await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
    await page
      .getByRole("button", {
        name: locale === "en" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(page.locator("#flashcard-side")).toHaveText(
      locale === "en" ? "وجه السؤال" : "Question side",
    );
    await expect(page.locator("#artifact-language")).toHaveValue("mixed");
    await expect(page.locator('[class*="artifactOutput"]')).toHaveCount(1);
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B07-C hosted ${locale}: named work and direct start retain ordinary login, drafts and reload limits`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const finish = await enter(page, "student", locale, "/settings"),
      t = (en: string, ar: string) => pick(locale, en, ar);
    await page.getByRole("link", { name: "Samir Hassan", exact: true }).click();
    await page
      .getByRole("tab", {
        name: t("Academic settings", "الإعدادات الدراسية"),
        exact: true,
      })
      .click();
    for (const [key, value] of [
      ["stage", "university"],
      ["institution", "zagazig-university"],
      ["program", "human-medicine"],
      ["level", "human-medicine-year-1"],
      ["term", "human-medicine-year-1-term-1"],
    ])
      await page.locator(`#academic-${key}Id`).selectOption(value!);
    await page
      .getByRole("button", {
        name: t("Save academic settings", "حفظ الإعدادات الدراسية"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("status").filter({
        hasText: t("Academic settings saved.", "تم حفظ الإعدادات الدراسية."),
      }),
    ).toBeVisible();
    const study = page
      .getByRole("navigation", {
        name: t("Product navigation", "تنقل المنتج"),
        exact: true,
      })
      .getByRole("link", { name: t("Study", "المذاكرة"), exact: true });
    await study.click();
    await expect(page.getByRole("searchbox")).toHaveCount(0);
    await page
      .getByRole("link", {
        name: t("Open Anatomy", "فتح علم التشريح"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: t("Materials", "مصادر المذاكرة"),
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: t("Chat", "المحادثة"), exact: true })
      .click();
    const hint = page.getByRole("button", {
      name: t("Got it", "فهمت"),
      exact: true,
    });
    if (await hint.isVisible()) await hint.click();
    const message = page.locator("#message");
    const sendQuestion = async (kind: keyof typeof promptExamples) => {
      await message.fill(promptExamples[kind][locale === "ar" ? 1 : 0]);
      await page
        .getByRole("button", { name: t("Send", "إرسال"), exact: true })
        .click();
      await expect(
        page
          .getByRole("status")
          .filter({ hasText: t("Preparing an answer", "جارٍ إعداد الإجابة") }),
      ).toHaveCount(0);
      await expect(message).toHaveValue("");
    };
    const sessions = page.locator(
      `summary[aria-label="${t("Sessions and privacy", "الجلسات والخصوصية")}"]`,
    );
    await sendQuestion("supported");
    await sessions.click();
    const first = page.getByRole("button", {
      name: new RegExp(
        t("Study sequence.*Session 1", "ترتيب الدراسة.*جلسة [١1]"),
      ),
    });
    await expect(first).toBeVisible();
    await first.click();
    await message.fill("Ordinary draft survives topic labels.");
    await sessions.click();
    await page
      .getByRole("button", {
        name: t("New session", "جلسة جديدة"),
        exact: true,
      })
      .click();
    await sendQuestion("conflict");
    await sessions.click();
    await expect(
      page.getByRole("button", {
        name: new RegExp(
          t(
            "Handout and recording comparison.*Session 2",
            "مقارنة الملزمة والتسجيل.*جلسة [٢2]",
          ),
        ),
      }),
    ).toBeVisible();
    await first.click();
    await expect(message).toHaveValue("Ordinary draft survives topic labels.");
    await study.click();
    await expect(
      page.getByText(t("Study sequence", "ترتيب الدراسة"), { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(
        t("Only your latest work is shown here.", "يظهر آخر عمل لك هنا فقط."),
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page.getByRole("main")).not.toContainText(
      t("Reload starts fresh", "إعادة التحميل تبدأ من جديد"),
    );
    const resume = page.getByRole("link", {
      name: t("Resume Anatomy", "متابعة علم التشريح"),
      exact: true,
    });
    await resume.click();
    await expect(message).toHaveValue("Ordinary draft survives topic labels.");
    await page
      .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
      .click();
    await expect(page.locator("#artifact-type")).toBeVisible();
    await page.locator("#artifact-type").selectOption("flashcards");
    await page.locator("#artifact-topic").selectOption("comparison");
    await page
      .getByRole("button", { name: t("Generate", "إنشاء"), exact: true })
      .click();
    await expect(page.locator('[class*="artifactOutput"]')).toBeVisible();
    await study.click();
    await expect(
      page.getByText(t("Flashcards", "بطاقات مراجعة"), { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(t("Diagram comparison", "مقارنة الرسوم"), { exact: true }),
    ).toBeVisible();
    await resume.click();
    await expect(page.locator("#artifact-type")).toHaveValue("flashcards");
    await page
      .getByRole("link", { name: t("Quiz", "الاختبار"), exact: true })
      .click();
    await page
      .getByRole("radio", { name: t("Untimed", "دون توقيت"), exact: true })
      .check();
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await page.locator('input[name="sample-question-0"]').first().check();
    const attempt = new URL(page.url());
    await study.click();
    await expect(
      page.getByText(new RegExp(t("In progress", "قيد الحل"))),
    ).toBeVisible();
    await expect(resume).toHaveAttribute(
      "href",
      `${attempt.pathname}?attempt=${attempt.searchParams.get("attempt")}&lang=${locale}`,
    );
    await resume.click();
    await expect(
      page.locator('input[name="sample-question-0"]').first(),
    ).toBeChecked();
    for (const name of await page
      .locator('input[name^="sample-question-"]')
      .evaluateAll((elements) => [
        ...new Set(elements.map((element) => element.getAttribute("name"))),
      ])) {
      await page.locator(`input[name="${name}"]`).first().check();
    }
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
    const review = new URL(page.url());
    await study.click();
    await expect(
      page.getByText(
        t("Submitted · Review available", "تم التسليم · المراجعة متاحة"),
        { exact: true },
      ),
    ).toBeVisible();
    await expect(resume).toHaveAttribute(
      "href",
      `${review.pathname}?attempt=${review.searchParams.get("attempt")}&lang=${locale}`,
    );
    await page.reload();
    await expect(page.getByRole("main")).not.toContainText(
      t("Submitted · Review available", "تم التسليم · المراجعة متاحة"),
    );
    await expect(
      page.getByLabel(t("Email address", "البريد الإلكتروني")),
    ).toHaveValue("");
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B07-B hosted ${locale}: four ordinary accounts retain visible identity, neutral theme and privacy access`, async ({
    page,
  }) => {
    test.setTimeout(150_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    for (const [role, name, enRole, arRole] of [
      ["student", "Samir Hassan", "Student", "طالب"],
      ["leader", "Mona Ali", "Batch Leader", "مسؤول الدفعة"],
      ["admin", "Ahmed (sample)", "Admin", "مسؤول"],
      ["second-admin", "Ziad (sample)", "Second Admin", "المسؤول الثاني"],
    ] as const) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      const finish = await enter(page, role, locale);
      const account = page
        .getByRole("link", {
          name: role === "student" ? name : t("Account", "الحساب"),
          exact: true,
        })
        .filter({ visible: true })
        .first();
      if (role === "student")
        await expect(
          account.getByText(t("Settings", "الإعدادات"), { exact: true }),
        ).toBeVisible();
      await account.click();
      const main = page.getByRole("main");
      await expect(main.getByText(name, { exact: true })).toBeVisible();
      await expect(
        main.getByText(t(enRole, arRole), { exact: true }),
      ).toBeVisible();
      const exit = main.getByRole("button", {
        name: t("Sign out", "تسجيل الخروج"),
        exact: true,
      });
      await expect(exit).toHaveCount(1);
      await expect(exit).toBeVisible();
      await expect(
        main
          .getByRole("figure", {
            name: t("Theme preview", "معاينة السمة"),
            exact: true,
          })
          .getByText(t("Example screen", "شاشة نموذجية"), { exact: true }),
      ).toBeVisible();
      await page
        .getByRole("radio", { name: t("Dark", "داكن"), exact: true })
        .check();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await page
        .getByRole("tab", { name: t("Privacy", "الخصوصية"), exact: true })
        .click();
      await expect(
        page.getByRole("group", {
          name: t("Sharing mode", "وضع المشاركة"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(exit).toBeVisible();
      await page
        .getByRole("tab", { name: t("Appearance", "المظهر"), exact: true })
        .press("End");
      await expect(
        page.getByRole("tab", {
          name: t("Identity and access", "الهوية والوصول"),
          exact: true,
        }),
      ).toBeFocused();
      await expect(exit).toBeVisible();
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        expect((await exit.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
      }
      await exit.click();
      await expect(page).toHaveURL(/\/login\?lang=/u);
      await expect(
        page.getByLabel(t("Email address", "البريد الإلكتروني"), {
          exact: true,
        }),
      ).toHaveValue("");
      finish();
    }
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B07-B hosted recovery ${locale}: configured missing-attempt text retains ordinary recovery scope`, async ({
    page,
  }) => {
    const finish = await enter(
      page,
      "student",
      locale,
      unit + "/quiz/sample-attempt",
    );
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await expect(
      page.getByText(
        t(
          "No attempt exists in the current module.",
          "لا توجد محاولة في وحدة.",
        ),
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        /Reload and reset clear sample attempts|إعادة التحميل والضبط تمسح المحاولات التجريبية/u,
      ),
    ).toHaveCount(0);
    const start = page.getByRole("link", {
      name: t("Start attempt", "بدء المحاولة"),
      exact: true,
    });
    await expect(start).toHaveAttribute("href", `${unit}/quiz?lang=${locale}`);
    await start.click();
    await expect(
      page.getByRole("heading", {
        name: t("Set up your quiz", "إعداد الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    finish();
  });
}

const password = "Synthetic-study-2026!";
const unit =
  "/learn/zagazig-university-human-medicine-year-1-term-1-cohort/zagazig-university-human-medicine-y1-t1-anatomy";
const pick = (locale: string, en: string, ar: string) =>
  locale === "ar" ? ar : en;

async function enter(page: Page, role: string, locale = "en", next?: string) {
  await page.goto(
    `/login?lang=${locale}${next ? `&next=${encodeURIComponent(next)}` : ""}`,
  );
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

for (const locale of ["en", "ar"] as const) {
  test(`merged B07-A hosted ${locale}: shortened school setup and current-path return keep ordinary study memory`, async ({
    page,
  }) => {
    test.setTimeout(150_000);
    const finish = await enter(page, "student", locale),
      t = (en: string, ar: string) => pick(locale, en, ar);
    for (const [index, value] of [
      "thanaweya-amma",
      "mathematics-track",
      "mathematics-track-year-3-term-1",
    ].entries()) {
      await page.locator(`input[value="${value}"]`).check();
      await page
        .getByRole("button", {
          name:
            index === 2
              ? t("Review choices", "مراجعة الاختيارات")
              : t("Continue", "متابعة"),
          exact: true,
        })
        .click();
    }
    await expect(page.locator("dl dt")).toHaveCount(5);
    await expect(
      page
        .locator("dl")
        .getByText(
          t("Egyptian Thanaweya Amma", "نظام الثانوية العامة المصرية"),
          { exact: true },
        ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: t("Edit Education system", "تعديل نظام التعليم"),
        exact: true,
      }),
    ).toHaveCount(0);
    await page
      .getByRole("button", {
        name: t("Open Study Shelf", "فتح رف المذاكرة"),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", {
        name: b07ChooseName(locale),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", {
        name: t("Open Mathematics", "فتح الرياضيات"),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", { name: t("Chat", "المحادثة"), exact: true })
      .click();
    const chatPath = new URL(page.url()).pathname;
    const hint = page.getByRole("button", {
      name: t("Got it", "فهمت"),
      exact: true,
    });
    if (await hint.isVisible()) await hint.click();
    await page.locator("#message").fill("Hosted old-path synthetic draft.");
    await page.getByRole("link", { name: "Samir Hassan", exact: true }).click();
    await page
      .getByRole("tab", {
        name: t("Academic settings", "الإعدادات الدراسية"),
        exact: true,
      })
      .click();
    for (const [key, value] of [
      ["stage", "university"],
      ["institution", "zagazig-university"],
      ["program", "human-medicine"],
      ["level", "human-medicine-year-1"],
      ["term", "human-medicine-year-1-term-1"],
    ])
      await page.locator(`#academic-${key}Id`).selectOption(value!);
    await page
      .getByRole("button", {
        name: t("Save academic settings", "حفظ الإعدادات الدراسية"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("link", {
        name: t(
          "Return to Chat · Mathematics",
          "العودة إلى المحادثة · الرياضيات",
        ),
        exact: true,
      }),
    ).toHaveCount(0);
    await page
      .getByRole("link", {
        name: t("Open current study path", "فتح المسار الدراسي الحالي"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("link", {
        name: b07ChooseName(locale),
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: t("Continue studying", "متابعة المذاكرة"),
        exact: true,
      }),
    ).toHaveCount(0);
    await page.getByRole("link", { name: "Samir Hassan", exact: true }).click();
    await page
      .getByRole("tab", {
        name: t("Academic settings", "الإعدادات الدراسية"),
        exact: true,
      })
      .click();
    for (const [key, value] of [
      ["stage", "thanaweya-amma"],
      ["institution", "egyptian-thanaweya-amma"],
      ["program", "mathematics-track"],
      ["level", "mathematics-track-year-3"],
      ["term", "mathematics-track-year-3-term-1"],
    ])
      await page.locator(`#academic-${key}Id`).selectOption(value!);
    await page
      .getByRole("button", {
        name: t("Save academic settings", "حفظ الإعدادات الدراسية"),
        exact: true,
      })
      .click();
    const back = page.getByRole("link", {
      name: t(
        "Return to Chat · Mathematics",
        "العودة إلى المحادثة · الرياضيات",
      ),
      exact: true,
    });
    await expect(back).toHaveAttribute("href", chatPath + `?lang=${locale}`);
    await back.click();
    await expect(page.locator("#message")).toHaveValue(
      "Hosted old-path synthetic draft.",
    );
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
    }
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B06 hosted ${locale}: normal student context and study options survive compact navigation`, async ({
    page,
  }) => {
    test.setTimeout(150_000);
    const finish = await enter(page, "student", locale, `${unit}/chat`),
      t = (en: string, ar: string) => pick(locale, en, ar);
    await page.setViewportSize({ width: 390, height: 844 });
    const hint = page.getByRole("button", {
      name: t("Got it", "فهمت"),
      exact: true,
    });
    if (await hint.isVisible()) await hint.click();
    const details = page
      .locator("summary")
      .filter({ hasText: b07DetailsName(locale) });
    await details.click();
    await expect(
      page.getByText(t("Zagazig University", "جامعة الزقازيق"), {
        exact: true,
      }),
    ).toBeVisible();
    await details.press("Escape");
    await expect(details).toBeFocused();
    await page.locator("#message").fill("Hosted B06 retained sample draft.");
    const options = page
      .locator("summary")
      .filter({ hasText: t("Study options", "خيارات المذاكرة") });
    await options.click();
    await page
      .getByRole("radio", { name: t("Arabic", "العربية"), exact: true })
      .check();
    await page
      .getByRole("link", {
        name: b07SourcesName(locale),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/sources\?/u);
    await page
      .getByRole("navigation", {
        name: t("Workspace navigation", "تنقل مساحة المذاكرة"),
        exact: true,
      })
      .getByRole("link", { name: t("Chat", "المحادثة"), exact: true })
      .click();
    await expect(page.locator("#message")).toHaveValue(
      "Hosted B06 retained sample draft.",
    );
    await page
      .locator("summary")
      .filter({ hasText: t("Study options", "خيارات المذاكرة") })
      .click();
    await expect(
      page.getByRole("radio", { name: t("Arabic", "العربية"), exact: true }),
    ).toBeChecked();
    await options.press("Escape");
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [390, 320, 768, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
    }
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B05-B hosted ${locale}: catalog receipt and exact resource return survive ordinary navigation`, async ({
    page,
  }) => {
    test.setTimeout(150_000);
    const finish = await enter(
      page,
      locale === "ar" ? "second-admin" : "admin",
      locale,
    );
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const nav = async (destination: string) => {
      const link = () =>
        page.locator(`a[href="${destination}?lang=${locale}"]:visible`).first();
      if ((await link().count()) === 0)
        await page.getByText(t("Menu", "القائمة"), { exact: true }).click();
      await link().click();
    };
    await nav("/admin/catalog");
    const field = page.getByLabel(
      t("Configured unit label", "اسم الوحدة من الإعدادات"),
    );
    await field.selectOption("SUBJECT");
    await page
      .getByRole("button", {
        name: t("Review changes", "مراجعة التغييرات"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: t("Save draft", "حفظ المسودة"),
        exact: true,
      })
      .click();
    await nav("/admin/cohorts");
    await nav("/admin/catalog");
    await expect(field).toHaveValue("SUBJECT");
    await field.selectOption("MODULE");
    await nav("/admin/sources");
    await page
      .getByRole("link", {
        name: new RegExp(
          "^" + t("Open governed decisions", "فتح القرارات المنضبطة"),
        ),
      })
      .click();
    await expect(page.locator('input[name="action"]')).toHaveValue(
      "QUARANTINE_SOURCE",
    );
    await expect(page.locator("#decision-detail-heading")).toBeFocused();
    await page
      .getByRole("link", {
        name: t("Preview student", "معاينة الطالب"),
        exact: true,
      })
      .click();
    await page
      .getByRole("navigation", {
        name: t("Workspace navigation", "تنقل مساحة المذاكرة"),
        exact: true,
      })
      .getByRole("link", { name: t("Chat", "المحادثة"), exact: true })
      .click();
    await page
      .getByLabel(t("Message", "السؤال"), { exact: true })
      .fill(promptExamples.supported[locale === "ar" ? 1 : 0]);
    await page
      .getByRole("button", { name: t("Send", "إرسال"), exact: true })
      .click();
    await page
      .getByRole("button", {
        name: t("Handout · p. 3", "الملزمة · ص ٣"),
        exact: true,
      })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("link", {
        name: t("Open evidence details", "فتح تفاصيل الأدلة"),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", {
        name: t("Return to Admin", "العودة للإدارة"),
        exact: true,
      })
      .click();
    await expect(page.locator('input[name="action"]')).toHaveValue(
      "QUARANTINE_SOURCE",
    );
    await page
      .getByRole("link", {
        name: t("Return to Sources", "العودة إلى المصادر"),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", {
        name: t("Preview exact student scope", "معاينة نطاق الطالب المحدد"),
        exact: true,
      })
      .click();
    await page
      .getByRole("navigation", {
        name: t("Workspace navigation", "تنقل مساحة المذاكرة"),
        exact: true,
      })
      .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
      .click();
    await page
      .getByRole("link", {
        name: t("Return to Admin", "العودة للإدارة"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/admin/sources\\?lang=${locale}$`),
    );
    await nav("/admin/catalog");
    await expect(field).toHaveValue("MODULE");
    await expect(
      page.getByText(new RegExp(t("Unsaved changes", "تغييرات غير محفوظة"))),
    ).toBeVisible();
    await expect(
      page.getByText(
        new RegExp(t("Sample catalog draft saved", "حفظت مسودة الدليل")),
      ),
    ).toContainText(t("Subject", "مادة دراسية"));
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
    }
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "32px"),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B05-A hosted ${locale}: named containment and exact pending review retain safeguards`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const finish = await enter(page, "admin", locale, "/admin");
    const copy = getAdminCopy(locale);
    await expect(page.locator("#decision-list li")).toHaveCount(12);
    await page
      .locator("#decision-list")
      .getByRole("button", { name: new RegExp("^" + copy.actions.HIDE_UNIT) })
      .click();
    await expect(page.locator("#decision-detail-heading")).toBeFocused();
    await expect(
      page.locator('section[aria-labelledby="decision-detail-heading"]'),
    ).toContainText(copy.consequences.HIDE_UNIT);
    await page
      .getByLabel(copy.reason)
      .fill("Contain this exact synthetic object during review.");
    await page
      .getByRole("button", { name: copy.reviewAction, exact: true })
      .click();
    await page
      .getByRole("button", {
        name: copy.confirmAction + ": " + copy.actions.HIDE_UNIT,
        exact: true,
      })
      .click();
    await expect(
      page.getByText(copy.actionSuccess, { exact: true }),
    ).toBeVisible();
    const panel = page.locator(
      'section[aria-labelledby="decision-detail-heading"]',
    );
    await expect(panel).toContainText(copy.alreadyInState);
    await expect(panel).not.toContainText(copy.blocked);
    await expect(
      page.getByRole("button", { name: copy.reviewAction, exact: true }),
    ).toBeDisabled();
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        await expect(page.locator("#decision-detail-heading")).toBeVisible();
      }
    }
    await page
      .getByRole("button", {
        name: pick(locale, "Back to decisions", "العودة إلى القرارات"),
        exact: true,
      })
      .click();
    await expect(
      page.locator("#decision-list [aria-pressed='true']"),
    ).toBeFocused();
    await page
      .locator("#decision-list")
      .getByRole("button", {
        name: new RegExp("^" + copy.actions.PLACE_RAW_HOLD),
      })
      .click();
    await expect(page.locator("#decision-detail-heading")).toBeFocused();
    await page
      .getByLabel(copy.reason)
      .fill("Preserve this exact synthetic raw object until review.");
    await page
      .getByLabel(copy.holdExpiry, { exact: true })
      .fill("2027-01-18T16:00");
    await page.locator('input[name="reviewAttested"]').check();
    const version = await page
      .locator('input[name="expectedVersion"]')
      .inputValue();
    await page
      .getByRole("button", { name: copy.reviewAction, exact: true })
      .click();
    await page
      .getByRole("button", {
        name: copy.confirmProtected + ": " + copy.actions.PLACE_RAW_HOLD,
        exact: true,
      })
      .click();
    await expect(page.getByRole("status").last()).toContainText(
      copy.actionPending,
    );
    await expect(page.locator('input[name="expectedVersion"]')).toHaveValue(
      version,
    );
    await expect(
      page.getByLabel(copy.holdExpiry, { exact: true }),
    ).toHaveAttribute("readonly", "");
    const link = page.getByRole("link", {
      name: copy.pendingLink,
      exact: true,
    });
    await expect(link).toHaveAttribute("href", /pending=/u);
    await link.click();
    await expect(page.locator("#decision-detail-heading")).toBeFocused();
    await expect(
      page.locator('input[name="reviewAttested"]'),
    ).not.toBeChecked();
    await expect(page.getByLabel(copy.reason)).toHaveAttribute("readonly", "");
    await expect(page.getByLabel(copy.holdExpiry, { exact: true })).toHaveValue(
      "2027-01-18T16:00",
    );
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    finish();
  });
}

for (const locale of ["en", "ar"]) {
  test(`merged B04 hosted ${locale}: first receipts, mobile status and replacement survive ordinary navigation`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const campaign = "/batch-leader/campaigns/sample-campaign";
    const finish = await enter(
      page,
      "leader",
      locale,
      `${campaign}?fixture=corrections`,
    );
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await openB09Upload(page, locale);
    await expect(
      page.getByRole("button", {
        name: t("Choose files", "اختيار ملفات"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: t("Fix information", "تصحيح المعلومات"),
        exact: true,
      }),
    ).toHaveCount(0);
    await page
      .locator('input[type="file"]')
      .setInputFiles([
        "public/demo-files/synthetic-handout.pdf",
        "public/demo-files/synthetic-recording.wav",
        "public/demo-files/synthetic-diagram.png",
      ]);
    const queue = page.getByRole("list", {
      name: t("Upload queue", "قائمة الرفع"),
      exact: true,
    });
    await expect(
      queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
    ).toHaveCount(3);
    await expect(queue).not.toContainText(
      t("Replacement candidate", "نسخة بديلة"),
    );
    await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
    await page
      .getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      })
      .click();
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(3);

    await expect(page.locator("[data-request-id]")).toHaveCount(0);
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const request of await page
        .locator('[data-record-request^="sample-item-"]')
        .all()) {
        await expect(request.locator("summary [data-status]")).toBeVisible();
        await expect(request.locator("summary [data-status]")).toHaveText(
          t("Received", "تم الاستلام"),
        );
      }
    }
    await page
      .locator(`a[href="/batch-leader?view=history&lang=${locale}"]`)
      .filter({ visible: true })
      .first()
      .click();
    await expect(
      page.getByText("Synthetic study source", { exact: true }),
    ).toHaveCount(3);
    const changed = locale === "en" ? "ar" : "en";
    await page
      .getByRole("button", {
        name: changed === "ar" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(
      page.getByText("Synthetic study source", { exact: true }),
    ).toHaveCount(3);
    await page
      .locator(`a[href="/settings?lang=${changed}"]`)
      .filter({ visible: true })
      .first()
      .click();
    await page
      .locator(`a[href="/batch-leader?lang=${changed}"]`)
      .filter({ visible: true })
      .first()
      .click();
    await page
      .locator(`a[href="${campaign}?lang=${changed}"]`)
      .filter({ visible: true })
      .first()
      .click();
    const translatedQueue = page.getByRole("list", {
      name: pick(changed, "Upload queue", "قائمة الرفع"),
      exact: true,
    });
    await expect(translatedQueue).toBeHidden();
    await page
      .getByRole("button", {
        name: pick(changed, "Upload files", "رفع الملفات"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: pick(changed, "Add approved reference", "إضافة المرجع المعتمد"),
        exact: true,
      })
      .click();
    await expect(
      translatedQueue.getByText(
        pick(changed, "Ready to upload", "جاهز للرفع"),
        { exact: true },
      ),
    ).toHaveCount(1);
    await expect(
      page.getByLabel(pick(changed, "I have permission", "لدي صلاحية")),
    ).not.toBeChecked();

    await page
      .getByLabel(pick(changed, "I have permission", "لدي صلاحية"))
      .check();
    await page
      .getByRole("button", {
        name: pick(changed, "Submit files", "إرسال الملفات"),
        exact: true,
      })
      .click();
    await expect(translatedQueue.getByRole("listitem").last()).toHaveAttribute(
      "data-predecessor-id",
      "1",
    );
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(3);

    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    finish();
  });
}

for (const locale of ["en", "ar"]) {
  test(`merged B03 finish hosted ${locale}: retained timed setup, canonical review and fresh repeat`, async ({
    page,
  }) => {
    const finish = await enter(
      page,
      "student",
      locale,
      `${unit}/quiz?lang=${locale}`,
    );
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const count = page.getByLabel(t("Number of questions", "عدد الأسئلة"), {
      exact: true,
    });
    await count.fill("7");
    await expect(page.locator("#quiz-question-count-error")).toBeVisible();
    await expect(page.locator("#quiz-duration-error")).toHaveCount(0);
    await count.fill("6");
    await page
      .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
      .check();
    const duration = page.getByLabel(
      t("Duration (minutes)", "المدة (بالدقائق)"),
      { exact: true },
    );
    await duration.fill("241");
    await expect(page.locator("#quiz-duration-error")).toBeVisible();
    await duration.fill("3");
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
    for (let index = 0; index < 6; index++)
      await page
        .locator(`input[name="sample-question-${index}"]`)
        .first()
        .check();
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
    await expect(
      page.getByRole("link", {
        name: t("Open grounded review", "فتح المراجعة بالمصادر"),
        exact: true,
      }),
    ).toHaveCount(0);
    await page
      .getByRole("link", {
        name: t("Back to quiz", "العودة للاختبار"),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", {
        name: t("Review score", "مراجعة النتيجة"),
        exact: true,
      })
      .press("Enter");
    await expect(page).toHaveURL(/\/sample-attempt\/review\?attempt=/u);
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
    await expect(
      page.locator('fieldset:has(input[name^="sample-question-"])'),
    ).toHaveCount(6);
    await expect(
      page.locator('input[name^="sample-question-"]:checked'),
    ).toHaveCount(0);
    await page
      .getByRole("link", {
        name: t("Back to quiz", "العودة للاختبار"),
        exact: true,
      })
      .click();
    await expect(count).toHaveValue("6");
    await expect(duration).toHaveValue("3");
    await page
      .locator(`a[href="/settings?lang=${locale}"]`)
      .filter({ visible: true })
      .first()
      .click();
    await page
      .getByRole("tab", {
        name: t("Identity and access", "الهوية والوصول"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: t("Sign out", "تسجيل الخروج"), exact: true })
      .click();
    await expect(page).toHaveURL(/\/login\?/u);
    await page
      .getByLabel(t("Email address", "البريد الإلكتروني"), { exact: true })
      .fill("student@example.invalid");
    await page
      .getByLabel(t("Password", "كلمة المرور"), { exact: true })
      .fill(password);
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
        name: t("Set up your Study Shelf", "إعداد رف المذاكرة"),
        exact: true,
      }),
    ).toBeVisible();
    await page.evaluate(
      (href) => window.history.pushState(null, "", href),
      `${unit}/quiz?lang=${locale}`,
    );
    await expect(count).toHaveValue("2");
    finish();
  });

  test(`merged B03 M27 hosted ${locale}: expired corrections survive ordinary source and Settings returns`, async ({
    page,
  }) => {
    const finish = await enter(
      page,
      "student",
      locale,
      `${unit}/quiz?lang=${locale}`,
    );
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await page
      .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
      .check();
    await page
      .getByLabel(t("Duration (minutes)", "المدة (بالدقائق)"), { exact: true })
      .fill("1");
    const reference = new Date("2026-10-13T12:00:00Z");
    await page.clock.install({ time: reference });
    await page.clock.pauseAt(new Date(reference.getTime() + 1000));
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await expect(page.getByRole("timer")).toBeVisible();
    await page.locator('input[name="sample-question-0"]').nth(1).check();
    await page
      .locator(`a[href="/settings?lang=${locale}"]`)
      .filter({ visible: true })
      .first()
      .click();
    const attemptBack = page.getByRole("link", {
      name: t(
        "Return to quiz attempt · Anatomy",
        "العودة إلى محاولة الاختبار · علم التشريح",
      ),
      exact: true,
    });
    await expect(attemptBack).toBeVisible();
    await page.clock.fastForward(61_000);
    await attemptBack.press("Enter");
    await expect(
      page.getByRole("heading", {
        name: t("Expired quiz review", "مراجعة الاختبار المنتهي"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.locator('input[name="sample-question-0"]').nth(1),
    ).toBeChecked();
    await expect(
      page.locator('input[name="sample-question-0"]').nth(1),
    ).toBeDisabled();
    await expect(page.getByRole("main")).toContainText(
      t("Incorrect", "غير صحيحة"),
    );
    await expect(page.getByRole("main")).toContainText(
      t("Correct answer", "الإجابة الصحيحة"),
    );
    await expect(page.getByRole("main")).not.toContainText(
      t("Simulated score", "نتيجة محاكاة"),
    );
    await expect(page).toHaveURL(/\/sample-attempt\/review\?attempt=/u);
    await expect(
      page.getByRole("link", {
        name: t("Review expired attempt", "مراجعة المحاولة المنتهية"),
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      }),
    ).toHaveAttribute("href", /from=quiz-review/u);
    await page
      .getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", {
        name: t("Return to quiz review", "العودة إلى مراجعة الاختبار"),
        exact: true,
      })
      .press("Enter");
    await expect(
      page.locator('input[name="sample-question-0"]').nth(1),
    ).toBeChecked();
    finish();
  });

  test(`merged B02 M75 hosted ${locale}: named Settings return retains the exact quiz attempt and review`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const finish = await enter(
      page,
      "student",
      locale,
      `${unit}/studio?lang=${locale}`,
    );
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await page
      .getByRole("link", { name: t("Quiz", "الاختبار"), exact: true })
      .click();
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await page.locator('input[name="sample-question-0"]').nth(0).check();
    const settings = page
      .locator(`a[href="/settings?lang=${locale}"]`)
      .filter({ visible: true })
      .first();
    await settings.click();
    const back = page.getByRole("link", {
      name: t(
        "Return to quiz attempt · Anatomy",
        "العودة إلى محاولة الاختبار · علم التشريح",
      ),
      exact: true,
    });
    await expect(back).toBeVisible();
    await expect(back).toHaveAttribute("href", /\/sample-attempt\?attempt=/u);
    await back.press("Enter");
    await expect(
      page.locator('input[name="sample-question-0"]').nth(0),
    ).toBeChecked();
    await expect(
      page.locator('input[name="sample-question-1"]:checked'),
    ).toHaveCount(0);
    await page.locator('input[name="sample-question-1"]').nth(1).check();
    await page
      .getByRole("button", {
        name: t("Submit answers", "تسليم الإجابات"),
        exact: true,
      })
      .press("Enter");
    await expect(
      page.getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      }),
    ).toHaveAttribute("href", /from=quiz-review/u);
    const score = await page.getByRole("status").innerText();
    await settings.click();
    const review = page.getByRole("link", {
      name: t(
        "Return to quiz review · Anatomy",
        "العودة إلى مراجعة الاختبار · علم التشريح",
      ),
      exact: true,
    });
    await expect(review).toHaveAttribute(
      "href",
      /\/sample-attempt\/review\?attempt=/u,
    );
    await review.press("Enter");
    await expect(page.getByRole("status")).toHaveText(score);
    await expect(
      page.locator('input[name="sample-question-1"]').nth(1),
    ).toBeDisabled();
    finish();
  });

  test(`merged B02 M64 hosted ${locale}: attempt and review source returns preserve quiz selections`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const finish = await enter(
      page,
      "student",
      locale,
      `${unit}/quiz?lang=${locale}`,
    );
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .press("Enter");
    await expect(page.locator("fieldset")).toHaveCount(2);
    await page.locator('input[name="sample-question-0"]').nth(0).check();
    await page
      .getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      })
      .click();
    await expect(page.getByRole("article")).toHaveCount(8);
    await expect(
      page.getByRole("link", {
        name: t("Report selected exchange", "الإبلاغ عن المحادثة المختارة"),
        exact: true,
      }),
    ).toHaveCount(0);
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
      page.locator('input[name="sample-question-1"]:checked'),
    ).toHaveCount(0);
    await page.locator('input[name="sample-question-1"]').nth(1).check();
    await page
      .getByRole("button", {
        name: t("Submit answers", "تسليم الإجابات"),
        exact: true,
      })
      .press("Enter");
    await expect(page).toHaveURL(/\/sample-attempt\/review/u);
    await expect(
      page.locator('input[name="sample-question-0"]').nth(0),
    ).toBeDisabled();
    const score = await page.getByRole("status").innerText();
    await expect(
      page.getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      }),
    ).toHaveAttribute("href", /from=quiz-review/u);
    await page
      .getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      })
      .click();
    const back = page.getByRole("link", {
      name: t("Return to quiz review", "العودة إلى مراجعة الاختبار"),
      exact: true,
    });
    await expect(back).toBeVisible();
    await expect(back).toHaveAttribute(
      "href",
      /\/sample-attempt\/review\?attempt=/u,
    );
    await back.press("Enter");
    await expect(page.getByRole("status")).toHaveText(score);
    await expect(
      page.locator('input[name="sample-question-1"]').nth(1),
    ).toBeChecked();
    await expect(
      page.locator('input[name="sample-question-1"]').nth(1),
    ).toBeDisabled();
    finish();
  });

  test(`merged B02 M15 hosted ${locale}: Studio sources cannot report the earlier Chat exchange`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const finish = await enter(
      page,
      "student",
      locale,
      `${unit}/chat?lang=${locale}`,
    );
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await page
      .getByLabel(t("Message", "السؤال"), { exact: true })
      .fill(promptExamples.supported[locale === "ar" ? 1 : 0]);
    await page
      .getByRole("button", { name: t("Send", "إرسال"), exact: true })
      .click();
    await expect(page.getByRole("article")).toHaveCount(1);
    await page
      .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
      .click();
    const generate = page.getByRole("button", {
      name: t("Generate", "إنشاء"),
      exact: true,
    });
    await generate.press("Enter");
    await expect(generate).toBeEnabled();
    const artifact = page
      .getByRole("heading", {
        name: new RegExp(t("Simulated artifact", "مخرج محاكى"), "u"),
      })
      .locator("..");
    const before = await artifact.locator(":scope > div[lang]").innerText();
    await page
      .getByRole("link", {
        name: b07SourcesName(locale),
        exact: true,
      })
      .click();
    await expect(page.getByRole("article")).toHaveCount(8);
    await expect(
      page.getByRole("link", {
        name: t("Report selected exchange", "الإبلاغ عن المحادثة المختارة"),
        exact: true,
      }),
    ).toHaveCount(0);
    await page
      .getByRole("link", {
        name: t("Return to Studio", "العودة للاستوديو"),
        exact: true,
      })
      .press("Enter");
    await expect(artifact.locator(":scope > div[lang]")).toHaveText(before, {
      useInnerText: true,
    });
    await page
      .getByRole("link", { name: t("Chat", "المحادثة"), exact: true })
      .click();
    await page
      .getByRole("link", {
        name: t("Report answer", "الإبلاغ عن الإجابة"),
        exact: true,
      })
      .click();
    await expect(page.getByRole("main")).toContainText(
      answerExamples.supported[locale === "ar" ? 1 : 0],
    );
    const submit = page.getByRole("button", {
      name: t("Submit report", "إرسال البلاغ"),
      exact: true,
    });
    await expect(submit).toBeDisabled();
    await page.getByRole("checkbox").check();
    await submit.press("Enter");
    await expect(submit).toBeDisabled();
    await expect(page.getByRole("status").last()).toContainText(
      t("Report received.", "تم استلام البلاغ."),
    );
    finish();
  });

  test(`merged B01 M67 hosted ${locale}: ordinary Studio shows distinct bilingual practice and retains it through sources`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const finish = await enter(
      page,
      "student",
      locale,
      `${unit}/studio?lang=${locale}`,
    );
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await expect(
      page.getByRole("heading", {
        name: t("Shape the result", "شكّل المخرج"),
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByText(t("Depth and size", "التفصيل والحجم"), { exact: true })
      .click();
    for (const [label, value] of [
      [t("Artifact type", "نوع المخرج"), "practice"],
      [t("Output language", "لغة المخرج"), "mixed"],
      [t("Study focus", "محور المذاكرة"), "comparison"],
      [t("Depth", "التفصيل"), "detailed"],
      [t("Size", "الحجم"), "extended"],
    ])
      await page.getByLabel(label!, { exact: true }).selectOption(value!);
    const generate = page.getByRole("button", {
      name: t("Generate", "إنشاء"),
      exact: true,
    });
    await generate.press("Enter");
    await expect(generate).toBeEnabled();
    const heading = page.getByRole("heading", {
      name: new RegExp(t("Simulated artifact", "مخرج محاكى"), "u"),
    });
    await expect(heading).toBeFocused();
    const output = heading.locator("..");
    const questions = output.locator("details");
    await expect(questions).toHaveCount(3);
    for (const question of await questions.all())
      await question.locator("summary").press("Enter");
    await expect(output).toContainText("Which labels can you compare");
    await expect(output).toContainText("ما الأسماء التي يمكنك مقارنتها");
    await expect(output).toContainText(
      "No specific label identities are supplied",
    );
    expect(
      await output.locator('bdi[lang="en"][dir="ltr"]').count(),
    ).toBeGreaterThan(6);
    expect(
      await output.locator('bdi[lang="ar"][dir="rtl"]').count(),
    ).toBeGreaterThan(6);
    const content = await output.locator(":scope > div[lang]").innerText();
    await page
      .getByRole("link", {
        name: b07SourcesName(locale),
        exact: true,
      })
      .click();
    await expect(page.getByRole("article")).toHaveCount(8);
    await page
      .getByRole("link", {
        name: t("Return to Studio", "العودة للاستوديو"),
        exact: true,
      })
      .click();
    for (const question of await questions.all())
      await question.locator("summary").press("Enter");
    await expect(output.locator(":scope > div[lang]")).toHaveText(content, {
      useInnerText: true,
    });
    await expect(
      page.getByLabel(t("Output language", "لغة المخرج"), { exact: true }),
    ).toHaveValue("mixed");
    await expect(
      page.getByText(
        /Synthetic demo|Simulated services|Demo clock|وضع تجريبي|محاكاة الخدمات/u,
      ),
    ).toHaveCount(0);
    finish();
  });

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
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Page not found", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);
    expect(forbidden).toEqual([]);
    expect(errors).toEqual([]);
  });

  test(`merged B01 M10 hosted ${locale}: ordinary entry shows the mathematics catalog`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const finish = await enter(page, "student", locale);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    for (const [index, value] of [
      "thanaweya-amma",
      "mathematics-track",
      "mathematics-track-year-3-term-1",
    ].entries()) {
      await page.locator(`input[type="radio"][value="${value}"]`).check();
      await page
        .getByRole("button", {
          name:
            index === 2
              ? t("Review choices", "مراجعة الاختيارات")
              : t("Continue", "متابعة"),
          exact: true,
        })
        .press("Enter");
    }
    await page
      .getByRole("button", {
        name: t("Open Study Shelf", "فتح رف المذاكرة"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: t("Your Study Shelf", "رف المذاكرة"),
        exact: true,
      }),
    ).toBeVisible();
    const subjects = () =>
      page
        .getByRole("link", { name: t("Subjects", "المواد"), exact: true })
        .filter({ visible: true })
        .first();
    await subjects().click();
    for (const term of [1, 2]) {
      const openMath = page.getByRole("link", {
        name: t("Open Mathematics", "فتح الرياضيات"),
        exact: true,
      });
      await expect(openMath).toBeVisible();
      await expect(
        page.getByRole("link", {
          name: t("Open Biology", "فتح الأحياء"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("link", {
          name: t("Open Chemistry", "فتح الكيمياء"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", {
          name: t("Open Physics", "فتح الفيزياء"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByText(
          /Synthetic demo|Simulated services|Demo clock|وضع تجريبي|محاكاة الخدمات/u,
        ),
      ).toHaveCount(0);
      await openMath.press("Enter");
      await expect(page).toHaveURL(
        new RegExp(
          `mathematics-track-y3-t${term}-mathematics\\?lang=${locale}$`,
          "u",
        ),
      );
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: t("Mathematics", "الرياضيات"),
          exact: true,
        }),
      ).toBeVisible();
      await subjects().click();
      await expect(openMath).toBeVisible();
      if (term === 1) {
        await page
          .locator(`a[href="/learn?lang=${locale}"]`)
          .filter({ visible: true })
          .first()
          .click();
        await page
          .getByRole("link", {
            name: t("Academic settings", "الإعدادات الدراسية"),
            exact: true,
          })
          .click();
        await page
          .getByLabel(t("Study period", "الفترة الدراسية"), { exact: true })
          .selectOption("mathematics-track-year-3-term-2");
        await page
          .getByRole("button", {
            name: t("Save academic settings", "حفظ الإعدادات الدراسية"),
            exact: true,
          })
          .click();
        await expect(
          page.getByRole("status").filter({
            hasText: t(
              "Academic settings saved.",
              "تم حفظ الإعدادات الدراسية.",
            ),
          }),
        ).toBeVisible();
        await subjects().click();
      }
    }
    expect(
      (await new AxeBuilder({ page }).include("main").analyze()).violations,
    ).toEqual([]);
    finish();
  });

  test(`merged B01 M69 hosted ${locale}: source origins remain distinct through ordinary entry and receipt`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const finish = await enter(page, "leader", locale);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await page
      .locator(
        `a[href="/batch-leader/campaigns/sample-campaign?lang=${locale}"]`,
      )
      .filter({ visible: true })
      .first()
      .click();
    await page
      .locator('input[type="file"]')
      .setInputFiles(
        nodePath.resolve("public/demo-files/synthetic-handout.pdf"),
      );
    await ensureB09Intake(page, locale);
    await page
      .getByRole("button", {
        name: t("Add approved reference", "إضافة المرجع المعتمد"),
        exact: true,
      })
      .press("Enter");
    const queue = page.locator(
      'ul[aria-label="Upload queue"], ul[aria-label="قائمة الرفع"]',
    );
    await expect(queue.getByRole("listitem")).toHaveCount(2);
    await expect(
      queue.getByText(t("Origin: Your device", "المصدر: جهازك"), {
        exact: true,
      }),
    ).toHaveCount(1);
    await expect(
      queue.getByText(t("Origin: Approved reference", "المصدر: مرجع معتمد"), {
        exact: true,
      }),
    ).toHaveCount(1);
    await expect(
      page.getByText(
        t(
          "Approved synthetic handout reference",
          "مرجع الملزمة التجريبي المعتمد",
        ),
        { exact: true },
      ),
    ).toBeVisible();
    await page
      .locator('input[type="file"]')
      .setInputFiles(
        nodePath.resolve("public/demo-files/synthetic-handout.pdf"),
      );
    await expect(queue.getByRole("listitem")).toHaveCount(2);
    await expect(
      queue.getByText(t("Origin: Your device", "المصدر: جهازك"), {
        exact: true,
      }),
    ).toHaveCount(1);
    await page
      .getByRole("button", {
        name: locale === "en" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(
      queue.getByText(
        locale === "en" ? "المصدر: مرجع معتمد" : "Origin: Approved reference",
        { exact: true },
      ),
    ).toHaveCount(1);
    await expect(
      queue.getByText(
        locale === "en" ? "المصدر: جهازك" : "Origin: Your device",
        { exact: true },
      ),
    ).toHaveCount(1);
    await page
      .getByRole("button", {
        name: locale === "en" ? "English" : "العربية",
        exact: true,
      })
      .click();
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
    }
    await expect(page.getByRole("note")).toHaveCount(0);
    await expect(page.getByRole("main")).not.toContainText("no storage URL");
    const submit = page.getByRole("button", {
      name: t("Submit files", "إرسال الملفات"),
      exact: true,
    });
    await expect(submit).toBeDisabled();
    await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
    await submit.press("Enter");
    const receipt = page.locator('[data-record-request="sample-item-1"]');
    await expect(receipt.locator('[data-status="RECEIVED"]')).toHaveCount(1);
    // Both submissions succeeded; the approved view lists only the latest one.
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: t("Received files", "الملفات المستلمة") }),
    ).toContainText(
      new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en").format(2),
    );
    if (
      !(await receipt
        .locator("details")
        .evaluate((element) => (element as HTMLDetailsElement).open))
    )
      await receipt.locator("summary").click();
    await expect(receipt.locator("dl")).toContainText(
      t("Approved reference", "مرجع معتمد"),
    );
    await expect(receipt).toContainText(
      t(
        "Processing and review are separate",
        "المعالجة والمراجعة خطوتان منفصلتان",
      ),
    );
    await expect(receipt).toContainText(
      t("does not make it available to students", "ولا يعني هذا إتاحته للطلاب"),
    );
    await expect(receipt.locator("input,textarea,select")).toHaveCount(0);
    await expect(queue).toBeHidden();
    expect(
      (await new AxeBuilder({ page }).include("main").analyze()).violations,
    ).toEqual([]);
    finish();
  });

  test(`merged B01 M51 hosted ${locale}: ordinary review labels and prepared conflict survive navigation`, async ({
    page,
  }) => {
    test.setTimeout(150_000);
    const finish = await enter(
      page,
      locale === "en" ? "admin" : "second-admin",
      locale,
    );
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const button = (en: string, ar: string) =>
      page.getByRole("button", { name: t(en, ar), exact: true });
    const link = (en: string, ar: string) =>
      page.getByRole("link", { name: t(en, ar), exact: true });
    const navigate = async (destination: string, en: string, ar: string) => {
      const target = () =>
        page.locator(`a[href="${destination}?lang=${locale}"]:visible`).first();
      if ((await target().count()) === 0)
        await page.getByText(t("Menu", "القائمة"), { exact: true }).click();
      await target().click();
      await expect(
        page.getByRole("heading", { name: t(en, ar), exact: true }),
      ).toBeVisible();
    };
    const layout = async () => {
      for (const theme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme: theme });
        for (const width of [1440, 390, 320]) {
          await page.setViewportSize({ width, height: 844 });
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          ).toBe(true);
        }
      }
      await expect(page.getByRole("note")).toHaveCount(0);
    };
    await navigate("/admin/sources", "Sources", "المصادر");
    await navigate("/admin/campaigns", "Campaigns", "الحملات");
    await button("Create campaign", "إنشاء حملة").click();
    const review = button("Review invitation", "مراجعة الدعوة");
    await expect(review).toBeDisabled();
    await page
      .getByLabel(t("Review campaign invitation", "مراجعة دعوة الحملة"))
      .press("Space");
    await review.press("Enter");
    await expect(review).toBeDisabled();
    await expect(page.getByRole("status").last()).toHaveText(
      t("Invitation reviewed.", "تمت مراجعة الدعوة."),
    );
    await expect(page.getByRole("main")).not.toContainText(
      t("Invitation sent.", "أرسلت الدعوة."),
    );
    await layout();
    await navigate("/admin/catalog", "Catalog", "الفهرس");
    await navigate("/admin/cohorts", "Cohorts", "المجموعات الدراسية");
    await button(
      "Review cohort configuration",
      "مراجعة إعدادات المجموعة",
    ).press("Enter");
    await expect(page.getByRole("status")).toHaveText(
      t("Cohort configuration reviewed.", "تمت مراجعة إعدادات المجموعة."),
    );
    await layout();
    await navigate("/admin/jobs", "Jobs", "المهام");
    await navigate("/admin/quality", "Quality", "الجودة");
    await link("Inspect student conflict", "فحص تعارض الطالب").press("Enter");
    const citation = button("Two source excerpts", "نصان من مصدرين");
    await expect(citation).toBeVisible();
    await expect(page.getByRole("main")).toContainText(
      answerExamples.conflict[locale === "ar" ? 1 : 0],
    );
    await expect(page.locator('article[id^="exchange-"]')).toHaveCount(1);
    await expect(
      page.getByRole("textbox", { name: t("Message", "السؤال"), exact: true }),
    ).toHaveValue("");
    await layout();
    await citation.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator("blockquote")).toHaveCount(2);
    const evidence = dialog.getByRole("link", {
      name: t("Open evidence details", "فتح تفاصيل الأدلة"),
      exact: true,
    });
    await expect(evidence).toHaveAttribute("href", /exchange=1&session=1/u);
    await evidence.click();
    await expect(page).toHaveURL(/\/evidence\?exchange=1&session=1/u);
    await expect(page.getByRole("main")).toContainText(
      t("Synthetic comparison recording", "تسجيل المقارنة التجريبي"),
    );
    await link("Return to Chat", "العودة للمحادثة").click();
    await expect(citation).toBeVisible();
    await link("Return to Admin", "العودة للإدارة").click();
    await expect(
      page.getByRole("heading", {
        name: t("Quality", "الجودة"),
        exact: true,
      }),
    ).toBeVisible();
    await navigate("/admin/jobs", "Jobs", "المهام");
    await navigate("/admin/quality", "Quality", "الجودة");
    await link("Inspect student conflict", "فحص تعارض الطالب").click();
    await expect(citation).toBeVisible();
    await page
      .locator(
        `summary[aria-label="${t("Sessions and privacy", "الجلسات والخصوصية")}"]`,
      )
      .click();
    await expect(
      page.getByRole("button", {
        name: new RegExp(t("Session [0-9]", "جلسة [٠-٩0-9]")),
      }),
    ).toHaveCount(1);
    expect(
      (await new AxeBuilder({ page }).include("main").analyze()).violations,
    ).toEqual([]);
    finish();
  });

  test(`audit batch 11 hosted ${locale}: interrupted setup retains choices and review without saving`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const finish = await enter(page, "student", locale);
    const button = (en: string, ar: string) =>
      page.getByRole("button", { name: pick(locale, en, ar), exact: true });
    const heading = (en: string, ar: string) =>
      page.getByRole("heading", { name: pick(locale, en, ar), exact: true });
    const select = (id: string) =>
      page.locator(`input[type="radio"][value="${id}"]`).check();
    const visitSettings = async () => {
      await page.locator(`nav a[href="/settings?lang=${locale}"]`).click();
      await expect(heading("Settings", "الإعدادات")).toBeVisible();
    };
    const returnStudy = async () => {
      await page.locator(`nav a[href="/learn?lang=${locale}"]`).click();
      await expect(
        heading("Set up your Study Shelf", "إعداد رف المذاكرة"),
      ).toBeVisible();
    };
    await select("university");
    await button("Continue", "متابعة").click();
    await select("zagazig-university");
    await button("Continue", "متابعة").click();
    await select("human-medicine");
    await visitSettings();
    await page
      .getByRole("radio", { name: pick(locale, "Dark", "فاتح"), exact: true })
      .check();
    await returnStudy();
    await expect(
      heading("Faculty or program", "الكلية أو البرنامج"),
    ).toBeFocused();
    await expect(page.locator('input[value="human-medicine"]')).toBeChecked();
    await expect(button("Continue", "متابعة")).toBeEnabled();
    for (const width of [1440, 820, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page
      .locator(`nav a[href="/learn?view=subjects&lang=${locale}"]`)
      .click();
    await expect(page.locator('input[value="human-medicine"]')).toBeChecked();
    await page
      .getByRole("button", {
        name: locale === "en" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(page.locator('input[value="human-medicine"]')).toBeChecked();
    await page
      .getByRole("button", {
        name: locale === "en" ? "English" : "العربية",
        exact: true,
      })
      .click();
    await button("Continue", "متابعة").click();
    await select("human-medicine-year-1");
    await button("Continue", "متابعة").click();
    await select("human-medicine-year-1-term-1");
    await button("Review choices", "مراجعة الاختيارات").click();
    await visitSettings();
    await returnStudy();
    await expect(heading("Your academic path", "مسارك الدراسي")).toBeFocused();
    await expect(page.locator("dl dt")).toHaveCount(5);
    await expect(button("Open Study Shelf", "فتح رف المذاكرة")).toBeEnabled();
    await button("Edit Education stage", "تعديل المرحلة التعليمية").click();
    await select("thanaweya-amma");
    await visitSettings();
    await returnStudy();
    await expect(page.locator('input[value="thanaweya-amma"]')).toBeChecked();
    await button("Continue", "متابعة").click();
    await expect(heading("Track", "المسار")).toBeFocused();
    await expect(
      page.locator('input[value="egyptian-thanaweya-amma"]'),
    ).toHaveCount(0);
    await expect(page.locator('input[value="zagazig-university"]')).toHaveCount(
      0,
    );
    await expect(page.locator('input[value="human-medicine"]')).toHaveCount(0);
    await expect(page.locator("fieldset input:checked")).toHaveCount(0);
    await expect(button("Continue", "متابعة")).toBeDisabled();
    await button("Back", "رجوع").click();
    for (const [index, id] of [
      "university",
      "zagazig-university",
      "human-medicine",
      "human-medicine-year-1",
      "human-medicine-year-1-term-1",
    ].entries()) {
      await select(id);
      await button(
        index === 4 ? "Review choices" : "Continue",
        index === 4 ? "مراجعة الاختيارات" : "متابعة",
      ).click();
    }
    const enlarged = await page.addStyleTag({
      content: "html { font-size: 200% !important; }",
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).fontFamily),
    ).toContain(locale === "ar" ? "Noto Sans Arabic" : "Manrope");
    await button("Open Study Shelf", "فتح رف المذاكرة").click();
    await expect(heading("Your Study Shelf", "رف المذاكرة")).toBeVisible();
    await expect(
      heading("Set up your Study Shelf", "إعداد رف المذاكرة"),
    ).toHaveCount(0);
    finish();
  });

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
        await ensureB09Intake(page, locale);
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
  const direct = await page.request.get("/synthetic-runtime/admin");
  expect(direct.status()).toBe(404);
});
