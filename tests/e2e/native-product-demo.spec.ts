import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import nodePath from "node:path";
import { expect, test, type Page } from "@playwright/test";
import {
  promptExamples,
  answerExamples,
  artifactTypes,
  actionFixtures,
  reviewCatalogRows,
} from "../../src/app/_components/synthetic-fixtures";
import { getAdminCopy } from "../../src/lib/i18n/admin-copy";
import {
  b09Campaign,
  b09NamedUploadJourney,
  b09NewerIntentJourney,
  b09ReceiptJourney,
  openB09Upload,
  ensureB09Intake,
} from "./collection-b09.checks";

for (const locale of ["en", "ar"] as const) {
  test(`merged B09 native ${locale}: delayed inspection preserves a newer request and locale`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "leader", locale, b09Campaign);
    await b09NewerIntentJourney(page, locale);
    finish();
  });
  test(`merged B09 native ${locale}: request-first intake, three receipts, exact latest return and accessible reflow`, async ({
    page,
  }, info) => {
    test.setTimeout(150_000);
    const finish = isolation(page);
    await signIn(page, "leader", locale, "/batch-leader");
    await b09ReceiptJourney(page, locale, info);
    finish();
  });
  test(`merged B09 native ${locale}: named uploads reject a wrong format and retain two request bindings`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "leader", locale, b09Campaign);
    await b09NamedUploadJourney(page, locale);
    finish();
  });
  test(`merged B09 native ${locale}: stale, foreign, duplicate and mixed inspection links fail closed`, async ({
    page,
  }) => {
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
  });
}

// Older return/guard journeys may use either configured course type. New B07-B
// journeys assert the exact program label; these retain locale-specific names.
const b07SourcesName = (locale: string) =>
  locale === "ar" ? /^مصادر (وحدة|مادة)$/u : /^(Module|Subject) sources$/u;
const b07DetailsName = (locale: string) =>
  locale === "ar" ? /^تفاصيل (وحدة|مادة)$/u : /^(Module|Subject) details$/u;
const studyOptionsSummary = (page: Page, locale: string) =>
  page
    .locator("summary")
    .filter({ hasText: locale === "ar" ? "خيارات المذاكرة" : "Study options" });
// Phone Chat keeps sources and study language inside the Study options menu.
async function openStudyOptions(page: Page, locale: string) {
  const summary = studyOptionsSummary(page, locale);
  if (
    (await summary.isVisible()) &&
    (await summary.locator("..").getAttribute("open")) === null
  )
    await summary.click();
}
const b07ChooseName = (locale: string) =>
  locale === "ar"
    ? /^(اختر (وحدة|مادة)|تصفح كل المواد)$/u
    : /^(Choose a (module|subject)|Browse all subjects)$/u;
const b07SwitchName = (locale: string) =>
  locale === "ar" ? /^تغيير (وحدة|مادة)$/u : /^Switch (module|subject)$/u;
const b07UnitsName = (locale: string) =>
  locale === "ar"
    ? /^(وحدات|مواد) مجموعتك$/u
    : /^(Modules|Subjects) in your cohort$/u;

const b07People = [
  ["student", "Samir Hassan", "Student", "طالب"],
  ["leader", "Mona Ali", "Batch Leader", "مسؤول الدفعة"],
  ["admin", "Ahmed (sample)", "Admin", "مسؤول"],
  ["second-admin", "Ziad (sample)", "Second Admin", "المسؤول الثاني"],
] as const;

for (const locale of ["en", "ar"] as const) {
  test(`merged B08-D native ${locale}: cancellation keeps the aid and MCQ hides stale generation guidance`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/studio");
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
  test(`merged B08-D native ${locale}: six purpose choices use five aids and one complete MCQ flow`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/studio");
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
  test(`merged B08-D native ${locale}: MCQ navigation keeps the prior quiz identity answers and original deadline`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/quiz");
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
  test(`merged B08-C native ${locale}: expired unscored corrections retain enabled passages and exact source returns`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/quiz");
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
  test(`merged B08-C native ${locale}: inactive current reading preserves aid and submitted-quiz passages`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const t = (en: string, ar: string) => pick(locale, en, ar),
      copy = getAdminCopy(locale);
    const finish = isolation(page);
    await signIn(
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
  test(`merged B08-C native ${locale}: library separates tool availability and supplied processed reading`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    for (const dense of [false, true]) {
      const finish = isolation(page);
      await signIn(
        page,
        "student",
        locale,
        `${unit}${dense ? "?fixture=dense" : ""}`,
      );
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
  test(`merged B08-C native ${locale}: five generated aids open their passages directly and retain one distinct full library`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/studio");
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
  test(`merged B08-C native ${locale}: every quiz explanation opens only its exact supporting passages with locked answers`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/quiz");
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
  test(`merged B08-B ${locale}: temporary and persistent Shelf failures use safe actions with real role guards`, async ({
    page,
  }) => {
    const t = (en: string, ar: string) => pick(locale, en, ar);
    for (const fixture of [
      "quota",
      "capacity",
      "offline",
      "error",
      "stale",
      "empty",
      "no-membership",
      "forbidden",
      "wrong-scope",
      "locked",
      "unpublished",
      "no-ready-source",
      "expired",
      "replayed",
    ]) {
      const finish = isolation(page);
      await signIn(page, "student", locale, `/learn?fixture=${fixture}`);
      const retry = page.getByRole("button", {
        name: /Retry|Refresh|إعادة محاولة|تحديث عرض/u,
      });
      const transient = [
        "quota",
        "capacity",
        "offline",
        "error",
        "stale",
      ].includes(fixture);
      await expect(
        page.getByRole("link", {
          name: t("Browse available subjects", "تصفح المواد المتاحة"),
          exact: true,
        }),
      ).toBeVisible();
      if (transient) {
        await expect(retry).toBeVisible();
        await expect(retry).toContainText(t("Study Shelf", "رف المذاكرة"));
        await retry.press("Enter");
      } else {
        await expect(retry).toHaveCount(0);
        await expect(page.getByRole("main")).not.toContainText(
          t("Anatomy", "علم التشريح"),
        );
        await page
          .getByRole("link", {
            name: t("Browse available subjects", "تصفح المواد المتاحة"),
            exact: true,
          })
          .press("Enter");
      }
      await expect(page).not.toHaveURL(/fixture=/u);
      await expect(
        page.getByRole("heading", {
          name: t("Set up your Study Shelf", "إعداد رف المذاكرة"),
          exact: true,
        }),
      ).toBeVisible();
      finish();
    }
    const finish = isolation(page);
    await signIn(page, "leader", locale, "/learn?fixture=offline");
    await expect(
      page.getByRole("button", {
        name: /Retry|Refresh|إعادة محاولة|تحديث عرض/u,
      }),
    ).toHaveCount(0);
    await page
      .getByRole("link", { name: t("Back", "العودة"), exact: true })
      .click();
    await expect(page).toHaveURL(/\/batch-leader/u);
    finish();
  });
}
for (const locale of ["en", "ar"] as const) {
  test(`merged B08-B ${locale}: temporary Chat and Studio failures retain drafts results and authorized alternatives`, async ({
    page,
  }, testInfo) => {
    const t = (en: string, ar: string) => pick(locale, en, ar);
    for (const tool of ["chat", "studio"] as const) {
      for (const fixture of [
        "quota",
        "capacity",
        "offline",
        "error",
        "stale",
      ]) {
        const finish = isolation(page);
        await signIn(
          page,
          "student",
          locale,
          `${unit}/${tool}?fixture=${fixture}`,
        );
        const name =
          tool === "chat" ? t("Chat", "المحادثة") : t("Studio", "الاستوديو");
        const retry = page.getByRole("button", {
          name:
            fixture === "stale"
              ? t(`Refresh ${name} view`, `تحديث عرض ${name}`)
              : t(`Retry ${name}`, `إعادة محاولة ${name}`),
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
        await page
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
        await navigate(page, `${unit}/${tool}`, locale);
        let original = "";
        if (tool === "chat") {
          await send(page, "supported", locale);
          await page
            .locator("#message")
            .fill(`Synthetic retained ${fixture} draft.`);
        } else {
          await selectStudioExample(page, locale, {
            type: "flashcards",
            topic: "comparison",
            depth: "detailed",
            size: "extended",
            language: "mixed",
          });
          const output = await generateStudioExample(page, locale);
          original = await output.innerText();
        }
        await page.goBack();
        await expect(
          page.getByRole("heading", {
            name: t("Materials", "مصادر المذاكرة"),
            exact: true,
          }),
        ).toBeVisible();
        await page.goBack();
        await expect(retry).toBeVisible();
        await retry.press("Enter");
        await expect(page).not.toHaveURL(/fixture=/u);
        if (tool === "chat") {
          await expect(page.locator("#message")).toHaveValue(
            `Synthetic retained ${fixture} draft.`,
          );
          await expect(page.locator('article[id^="exchange-"]')).toHaveCount(1);
        } else {
          await expect(page.locator('[class*="artifactOutput"]')).toHaveText(
            original,
            { useInnerText: true },
          );
          await expect(page.locator("#artifact-language")).toHaveValue("mixed");
          await expect(page.locator("#artifact-type")).toHaveValue(
            "flashcards",
          );
        }
        finish();
      }
    }
    await page.screenshot({
      path: testInfo.outputPath(`recovered-${locale}.png`),
    });
  });
  test(`merged B08-B ${locale}: persistent study states hide scope metadata and offer no ineffective Retry`, async ({
    page,
  }, testInfo) => {
    for (const fixture of [
      "empty",
      "no-membership",
      "forbidden",
      "wrong-scope",
      "locked",
      "unpublished",
      "no-ready-source",
      "expired",
      "replayed",
    ]) {
      const finish = isolation(page),
        t = (en: string, ar: string) => pick(locale, en, ar);
      await signIn(page, "student", locale, `${unit}/chat?fixture=${fixture}`);
      const exit = page.getByRole("link", {
        name: t("Browse available subjects", "تصفح المواد المتاحة"),
        exact: true,
      });
      await expect(exit).toBeVisible();
      await expect(
        page.getByRole("button", {
          name: /Retry|Refresh|إعادة محاولة|تحديث عرض/u,
        }),
      ).toHaveCount(0);
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
      if (fixture === "no-ready-source") {
        for (const theme of ["light", "dark"] as const) {
          await page.emulateMedia({ colorScheme: theme });
          for (const width of [1440, 390, 320]) {
            await page.setViewportSize({ width, height: 900 });
            expect(
              await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth + 1,
              ),
            ).toBe(true);
            expect((await exit.boundingBox())!.height).toBeGreaterThanOrEqual(
              44,
            );
          }
        }
        const scale = await page.addStyleTag({
          content: "html{font-size:200%}",
        });
        expect(
          (
            await new AxeBuilder({ page })
              .include("main")
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        await page.screenshot({
          path: testInfo.outputPath(`persistent-${locale}-320-200.png`),
        });
        await scale.evaluate((e) => e.parentNode?.removeChild(e));
      }
      await exit.press("Enter");
      await expect(page).toHaveURL(/\/learn\?.*view=subjects/u);
      await expect(page).not.toHaveURL(/fixture=/u);
      finish();
    }
    const finish = isolation(page),
      t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "leader", locale, `${unit}/chat?fixture=offline`);
    await expect(
      page.getByRole("button", {
        name: /Retry|Refresh|إعادة محاولة|تحديث عرض/u,
      }),
    ).toHaveCount(0);
    await expect(page.getByRole("main")).not.toContainText(
      t("Anatomy", "علم التشريح"),
    );
    await page
      .getByRole("link", { name: t("Back", "العودة"), exact: true })
      .click();
    await expect(page).toHaveURL(/\/batch-leader/u);
    finish();
  });
}
for (const locale of ["en", "ar"] as const) {
  test(`merged B08-B native ${locale}: unsupported and conflicting replies preserve drafts sources and copyable clarification`, async ({
    page,
  }, testInfo) => {
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/chat");
    await page
      .getByRole("link", { name: t("Chat", "المحادثة"), exact: true })
      .click();
    await send(page, "unavailable", locale);
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
    await send(page, "conflict", locale);
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
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
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
  test(`merged B08-B native ${locale}: current inactive-source guidance retains history and recording-backed next steps`, async ({
    page,
  }) => {
    const t = (en: string, ar: string) => pick(locale, en, ar),
      copy = getAdminCopy(locale);
    const finish = isolation(page);
    await signIn(page, "admin", locale);
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
    await send(page, "supported", locale);
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
    await send(page, "hint", locale);
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

    await page
      .getByRole("link", {
        name: t("Return to Admin", "العودة للإدارة"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: new RegExp(`^${copy.actions.ACTIVATE_SOURCE}`),
      })
      .click();
    await page
      .getByLabel(copy.reason)
      .fill("Synthetic source recovery confirmation.");
    await page
      .getByRole("button", { name: copy.reviewAction, exact: true })
      .click();
    await page
      .getByRole("button", {
        name: `${copy.confirmProtected}: ${copy.actions.ACTIVATE_SOURCE}`,
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: copy.actionPending }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: t("Sign out", "تسجيل الخروج"), exact: true })
      .click();
    await page
      .getByLabel(t("Email address", "البريد الإلكتروني"), { exact: true })
      .fill("second-admin@example.invalid");
    await page
      .getByRole("button", { name: t("Continue", "متابعة"), exact: true })
      .click();
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
    await page
      .getByRole("button", {
        name: new RegExp(`^${copy.actions.ACTIVATE_SOURCE}`),
      })
      .click();
    await page
      .getByRole("button", { name: copy.reviewAction, exact: true })
      .click();
    await page
      .getByRole("button", {
        name: `${copy.confirmSecond}: ${copy.actions.ACTIVATE_SOURCE}`,
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
    await navigate(page, unit + "/chat", locale);
    await expect(reply).toContainText(
      answerExamples.unavailable[locale === "ar" ? 1 : 0],
    );
    await expect(reply).toContainText(
      t(
        "The handout is currently available. This saved reply is unchanged;",
        "الملزمة متاحة حاليًا. هذه الإجابة المحفوظة كما هي؛",
      ),
    );
    await reply
      .locator("summary")
      .filter({
        hasText: t(
          "Questions covered by these materials",
          "أسئلة تغطيها هذه المصادر",
        ),
      })
      .click();
    await expect(
      reply
        .locator("details")
        .getByText(promptExamples.supported[locale === "ar" ? 1 : 0], {
          exact: true,
        }),
    ).toBeVisible();
    await send(page, "supported", locale);
    await expect(page.locator("#exchange-3")).toContainText(
      answerExamples.supported[locale === "ar" ? 1 : 0],
    );

    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B08-A native ${locale}: explicit replacement and directional flashcards preserve cancellation and course memory`, async ({
    page,
  }, testInfo) => {
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const finish = isolation(page);
    await signIn(page, "student", locale, "/settings");
    await b07SavePath(page, locale, "human-medicine", "human-medicine-year-1");
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
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
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
  test(`merged B07-C ${locale}: actual leader intake retains usable content and brand at desktop and phone`, async ({
    page,
  }, testInfo) => {
    const finish = isolation(page),
      t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(
      page,
      "leader",
      locale,
      "/batch-leader/campaigns/sample-campaign",
    );
    await ensureB09Intake(page, locale);
    await expect(
      page.getByRole("heading", {
        name: t("Upload files", "رفع الملفات"),
        exact: true,
      }),
    ).toBeVisible();
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(
          page.getByRole("heading", {
            name: t("Upload files", "رفع الملفات"),
            exact: true,
          }),
        ).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        const nav = page.getByRole("navigation", {
          name: t("Product navigation", "تنقل المنتج"),
          exact: true,
        });
        await expect(nav.getByRole("link")).toHaveCount(3);
        for (const destination of await nav.getByRole("link").all())
          expect(
            (await destination.boundingBox())!.height,
          ).toBeGreaterThanOrEqual(44);
      }
    }
    const enlarged = await page.addStyleTag({
      content: "html {font-size:200%}",
    });
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
    await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
    await page.screenshot({
      path: testInfo.outputPath(`leader-intake-${locale}-320.png`),
    });
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B07-C ${locale}: sparse role screens and dense conversations retain purposeful space and destinations`, async ({
    page,
  }, testInfo) => {
    const t = (en: string, ar: string) => pick(locale, en, ar);
    for (const role of ["student", "leader", "admin", "second-admin"]) {
      const finish = isolation(page);
      await signIn(
        page,
        role,
        locale,
        role === "student"
          ? "/settings"
          : role === "leader"
            ? "/batch-leader"
            : "/admin/sources",
      );
      if (role === "student") {
        await b07SavePath(
          page,
          locale,
          "human-medicine",
          "human-medicine-year-1",
        );
        await navigate(page, "/learn", locale);
      }
      const main = page.getByRole("main");
      await expect(main.getByRole("heading", { level: 1 })).toBeVisible();
      const nav = page.getByRole("navigation", {
        name: t("Product navigation", "تنقل المنتج"),
        exact: true,
      });
      const destinations = await nav.getByRole("link").allTextContents();
      expect(destinations.length).toBe(
        role === "admin" || role === "second-admin" ? 5 : 3,
      );
      for (const theme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme: theme });
        for (const width of [1440, 768, 390, 320]) {
          await page.setViewportSize({ width, height: 900 });
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          ).toBe(true);
          await expect(main.getByRole("heading", { level: 1 })).toBeVisible();
          const adminPhone =
            (role === "admin" || role === "second-admin") && width < 768;
          const currentNav = adminPhone
            ? page.getByRole("navigation", {
                name: t("Admin navigation", "تنقل الإدارة"),
                exact: true,
              })
            : nav;
          const menu = page
            .locator("summary")
            .filter({ hasText: new RegExp(t("^Menu$", "^القائمة$")) });
          if (adminPhone) await menu.click();
          for (const destination of await currentNav.getByRole("link").all())
            expect(
              (await destination.boundingBox())!.height,
            ).toBeGreaterThanOrEqual(44);
          expect(await currentNav.getByRole("link").allTextContents()).toEqual(
            destinations,
          );
          if (adminPhone) {
            await menu.press("Escape");
            await expect(menu).toBeFocused();
          }
          if (width === 1440) {
            await expect(page.getByRole("complementary")).not.toContainText(
              "Study deeper",
            );
            if (role === "student") {
              const start = page.locator('[class*="resume"]');
              expect((await start.boundingBox())!.height).toBeLessThan(300);
              const padding = await start.evaluate(
                (e) => getComputedStyle(e).paddingTop,
              );
              expect(padding).toBe("24px");
            }
          }
        }
      }
      const enlarged = await page.addStyleTag({
        content: "html {font-size:200%}",
      });
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
      await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.screenshot({
        path: testInfo.outputPath(`sparse-${role}-${locale}.png`),
      });
      finish();
    }
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/chat?fixture=dense");
    await openSessionTools(page, locale);
    await expect(page.locator('[class*="historyList"] li button')).toHaveCount(
      12,
    );
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      for (const entry of await page
        .locator('[class*="historyList"] li button')
        .all()) {
        expect((await entry.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
    }
    await page.screenshot({
      path: testInfo.outputPath(`dense-chat-${locale}-320.png`),
    });
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B07-C ${locale}: Shelf reflects an expired quiz without restarting its attempt`, async ({
    page,
  }) => {
    const finish = isolation(page),
      t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, "/settings");
    await b07SavePath(page, locale, "human-medicine", "human-medicine-year-1");
    await navigate(page, "/learn", locale);
    await page.locator('[class*="resume"] a').click();
    await navigate(page, unit + "/quiz", locale);
    await page
      .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
      .check();
    await page
      .getByLabel(t("Duration (minutes)", "المدة (بالدقائق)"), { exact: true })
      .fill("1");
    const reference = new Date(await page.evaluate(() => Date.now()));
    await page.clock.install({ time: reference });
    await page.clock.pauseAt(new Date(reference.getTime() + 1000));
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await expect(page.getByRole("timer")).toBeVisible();
    const attempt = new URL(page.url());
    await navigate(page, "/learn", locale);
    await expect(
      page.getByText(new RegExp(t("In progress", "قيد الحل"))),
    ).toBeVisible();
    await page.clock.runFor(61_000);
    await expect(
      page.getByText(
        t("Expired · Unscored review", "انتهت المدة · مراجعة دون نتيجة"),
        { exact: true },
      ),
    ).toBeVisible();
    const resume = page.getByRole("link", {
      name: t("Resume Anatomy", "متابعة علم التشريح"),
      exact: true,
    });
    await resume.click();
    await expect(page).toHaveURL(
      new RegExp(`attempt=${attempt.searchParams.get("attempt")}`),
    );
    await expect(
      page.getByRole("button", {
        name: t("Submit answers", "تسليم الإجابات"),
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(page.getByRole("main")).toContainText(
      t("No score was recorded.", "لم تسجل نتيجة."),
    );
    await page.clock.resume();
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B07-C ${locale}: named latest work retains exact conversations, five aids and MCQ entry and quiz state`, async ({
    page,
  }, testInfo) => {
    const finish = isolation(page),
      t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, "/settings");
    await b07SavePath(page, locale, "human-medicine", "human-medicine-year-1");
    await navigate(page, "/learn", locale);
    await page.locator('[class*="resume"] a').click();
    await navigate(page, unit + "/chat", locale);
    const hint = page.getByRole("button", {
      name: t("Got it", "فهمت"),
      exact: true,
    });
    if (await hint.isVisible()) await hint.click();
    await send(page, "supported", locale);
    await openSessionTools(page, locale);
    const first = page.getByRole("button", {
      name: new RegExp(
        t("Study sequence.*Session 1", "ترتيب الدراسة.*جلسة [١1]"),
      ),
    });
    await expect(first).toBeVisible();
    await first.click();
    const message = page.getByLabel(t("Message", "السؤال"), { exact: true });
    const draft = "Retain this distinct unsent first-session draft.";
    await message.fill(draft);
    await openSessionTools(page, locale);
    await page
      .getByRole("button", {
        name: t("New session", "جلسة جديدة"),
        exact: true,
      })
      .click();
    await send(page, "conflict", locale);
    await openSessionTools(page, locale);
    const second = page.getByRole("button", {
      name: new RegExp(
        t(
          "Handout and recording comparison.*Session 2",
          "مقارنة الملزمة والتسجيل.*جلسة [٢2]",
        ),
      ),
    });
    await expect(second).toHaveAttribute("aria-pressed", "true");
    await expect(first).toHaveAttribute("aria-pressed", "false");
    await first.click();
    await expect(message).toHaveValue(draft);
    await openSessionTools(page, locale);
    await second.click();
    await send(page, "partial", locale);
    await navigate(page, "/learn", locale);
    await expect(
      page.getByText(
        t("Handout and recording comparison", "مقارنة الملزمة والتسجيل"),
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        `${t("Replies", "الإجابات")} · ${new Intl.NumberFormat(locale).format(2)}`,
        { exact: true },
      ),
    ).toBeVisible();
    const resume = page.getByRole("link", {
      name: t("Resume Anatomy", "متابعة علم التشريح"),
      exact: true,
    });
    await expect(resume).toHaveAttribute("href", `${unit}/chat?lang=${locale}`);
    await resume.click();
    await expect(page.locator('article[id^="exchange-"]')).toHaveCount(2);
    await openSessionTools(page, locale);
    await first.click();
    await expect(message).toHaveValue(draft);
    await navigate(page, unit + "/studio", locale);
    await expect(page.locator("#artifact-type")).toBeVisible();
    await navigate(page, "/learn", locale);
    await expect(
      page.getByText(t("Structured summary", "ملخص منظم"), { exact: true }),
    ).toHaveCount(0);
    await resume.click();
    for (const [id, en, ar] of artifactTypes.filter(([id]) => id !== "quiz")) {
      await page.locator("#artifact-type").selectOption(id);
      await page.locator("#artifact-topic").selectOption("comparison");
      await page
        .getByRole("button", { name: t("Generate", "إنشاء"), exact: true })
        .click();
      await expect(
        page.getByRole("heading", {
          name: t(`Simulated artifact: ${en}`, `مخرج محاكى: ${ar}`),
          exact: true,
        }),
      ).toBeVisible();
      await navigate(page, "/learn", locale);
      await expect(page.getByText(t(en, ar), { exact: true })).toBeVisible();
      await expect(
        page.getByText(t("Diagram comparison", "مقارنة الرسوم"), {
          exact: true,
        }),
      ).toBeVisible();
      await expect(resume).toHaveAttribute(
        "href",
        `${unit}/studio?lang=${locale}`,
      );
      await resume.click();
      await expect(page.locator("#artifact-type")).toHaveValue(id);
    }
    await page.locator("#artifact-type").selectOption("quiz");
    await expect(
      page.getByRole("button", { name: t("Generate", "إنشاء"), exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("link", {
        name: t("Set up MCQ quiz", "إعداد اختبار اختيار من متعدد"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    await navigate(page, "/learn", locale);
    await expect(
      page.getByText(
        t("Submitted · Review available", "تم التسليم · المراجعة متاحة"),
        { exact: true },
      ),
    ).toHaveCount(0);
    await resume.click();
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
    await navigate(page, "/learn", locale);
    await expect(
      page.getByText(
        `${t("In progress", "قيد الحل")} · ${new Intl.NumberFormat(locale).format(1)}${t(" answered", " إجابات")}`,
        {
          exact: true,
        },
      ),
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
    await navigate(page, "/learn", locale);
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
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(resume).toBeVisible();
        expect((await resume.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
    }
    const enlarged = await page.addStyleTag({
      content: "html {font-size:200%}",
    });
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
      path: testInfo.outputPath(`recent-${locale}-320-200.png`),
    });
    await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
    await resume.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(review.href);
    finish();
  });
  test(`merged B07-C ${locale}: honest named starts keep four program catalogs separate`, async ({
    page,
  }) => {
    const t = (en: string, ar: string) => pick(locale, en, ar);
    for (const path of b07Paths) {
      const finish = isolation(page),
        row = b07Row(path.program, path.level);
      await signIn(page, "student", locale, "/settings");
      await b07SavePath(page, locale, path.program, path.level);
      await navigate(page, "/learn", locale);
      await expect(page.getByRole("searchbox")).toHaveCount(0);
      await expect(
        page.getByText(
          t(
            "Only the latest work in this tab is shown. Reload starts fresh.",
            "يظهر آخر عمل في هذا التبويب فقط. إعادة التحميل تبدأ من جديد.",
          ),
          { exact: true },
        ),
      ).toHaveCount(0);
      const start = page.locator('[class*="resume"] a');
      await expect(start).toHaveAttribute(
        "href",
        new RegExp(`/learn/${row.cohort.id}/[^/?]+\\?lang=${locale}$`),
      );
      const destination = await start.getAttribute("href");
      await start.press("Enter");
      await expect(page).toHaveURL(new URL(destination!, page.url()).href);
      await expect(
        page.getByRole("heading", {
          name: t("Materials", "مصادر المذاكرة"),
          exact: true,
        }),
      ).toBeVisible();
      await navigate(page, "/learn", locale);
      await page
        .getByRole("link", {
          name: t("Browse all subjects", "تصفح كل المواد"),
          exact: true,
        })
        .click();
      await expect(page.getByRole("searchbox")).toBeVisible();
      await expect(page.locator('[class*="resume"]')).toHaveCount(0);
      finish();
    }
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B07-B ${locale}: configured course names agree across four paths and learning materials`, async ({
    page,
  }) => {
    const t = (en: string, ar: string) => pick(locale, en, ar);
    for (const path of b07Paths) {
      const finish = isolation(page);
      const row = b07Row(path.program, path.level);
      const base = `/learn/${row.cohort.id}/${row.unit.id}`;
      const singular = t(
        row.program.unitLabelSingularEn,
        row.program.unitLabelSingularAr,
      );
      const plural = t(
        row.program.unitLabelPluralEn,
        row.program.unitLabelPluralAr,
      );
      await page.setViewportSize({ width: 1440, height: 1000 });
      await signIn(page, "student", locale, base + "/chat");
      await navigate(page, "/settings", locale);
      await b07SavePath(page, locale, path.program, path.level);
      await page
        .getByRole("navigation", {
          name: t("Product navigation", "تنقل المنتج"),
        })
        .getByRole("link", { name: t("Subjects", "المواد"), exact: true })
        .click();
      await expect(
        page.getByRole("heading", {
          name: t(`Your ${plural.toLowerCase()}`, `قائمة ${plural}`),
          exact: true,
        }),
      ).toBeVisible();
      const search = page.getByRole("searchbox", {
        name: t(`Search ${plural.toLowerCase()}`, `البحث في ${plural}`),
        exact: true,
      });
      await expect(search).toHaveAttribute(
        "placeholder",
        t(`Find a ${singular.toLowerCase()}…`, `ابحث عن ${singular}…`),
      );
      await search.fill("no-matching-synthetic-course");
      await expect(
        page.getByRole("heading", {
          name: t(
            `No ${plural.toLowerCase()} match this search`,
            `لا توجد ${plural} تطابق هذا البحث`,
          ),
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: t("Clear search", "مسح البحث"),
          exact: true,
        })
        .click();
      const open = page.getByRole("link", {
        name: t(`Open ${row.unit.nameEn}`, `فتح ${row.unit.nameAr}`),
        exact: true,
      });
      await expect(open).toHaveAttribute("href", `${base}?lang=${locale}`);
      await open.click();
      const tools = page.getByRole("navigation", {
        name: t("Workspace navigation", "تنقل مساحة المذاكرة"),
      });
      await expect(
        tools.getByRole("link", {
          name: t("Materials", "مصادر المذاكرة"),
          exact: true,
        }),
      ).toHaveAttribute("aria-current", "page");
      await expect(
        page.getByRole("heading", {
          name: t("Materials", "مصادر المذاكرة"),
          level: 2,
          exact: true,
        }),
      ).toHaveCount(1);
      const disclosure = page
        .locator("summary")
        .filter({ hasText: t(`${singular} details`, `تفاصيل ${singular}`) });
      await disclosure.click();
      await expect(
        page.getByRole("heading", {
          name: t(`Switch ${singular.toLowerCase()}`, `تغيير ${singular}`),
          exact: true,
        }),
      ).toBeVisible();
      const courses = page.getByRole("navigation", {
        name: t(`${plural} in your cohort`, `${plural} مجموعتك`),
        exact: true,
      });
      await expect(
        courses.getByRole("link", {
          name: t(row.unit.nameEn, row.unit.nameAr),
          exact: true,
        }),
      ).toHaveAttribute("aria-current", "page");
      for (const link of await courses.getByRole("link").all())
        expect(await link.getAttribute("href")).toMatch(
          new RegExp(`^/learn/${row.cohort.id}/[^/]+\\?lang=${locale}$`, "u"),
        );
      await disclosure.press("Escape");
      await expect(disclosure).toBeFocused();
      await tools
        .getByRole("link", { name: t("Chat", "المحادثة"), exact: true })
        .click();
      await expect(
        page.getByRole("textbox", {
          name: t("Message", "السؤال"),
          exact: true,
        }),
      ).toHaveAttribute(
        "placeholder",
        t(`Ask about this ${singular.toLowerCase()}…`, `اسأل عن ${singular}…`),
      );
      await expect(
        page.getByRole("link", {
          name: t(`${singular} sources`, `مصادر ${singular}`),
          exact: true,
        }),
      ).toBeVisible();
      await page
        .locator("summary")
        .filter({ hasText: t("Sessions", "الجلسات") })
        .first()
        .click();
      await expect(
        page.locator("summary").filter({
          hasText: t(
            `Sessions in this ${singular.toLowerCase()}`,
            `جلسات ${singular}`,
          ),
        }),
      ).toBeVisible();
      await page
        .locator("summary")
        .filter({ hasText: t("Sessions", "الجلسات") })
        .first()
        .press("Escape");
      await tools
        .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
        .click();
      await expect(
        page.getByRole("link", {
          name: t(`${singular} sources`, `مصادر ${singular}`),
          exact: true,
        }),
      ).toBeVisible();
      for (const [theme, width] of [
        ["light", 1440],
        ["dark", 390],
        ["light", 320],
      ] as const) {
        await page.emulateMedia({
          colorScheme: theme,
          reducedMotion: "reduce",
        });
        await page.setViewportSize({ width, height: 900 });
        await expect(
          tools.getByRole("link", {
            name: t("Materials", "مصادر المذاكرة"),
            exact: true,
          }),
        ).toBeVisible();
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
      const expanded = await page.addStyleTag({
        content: "html {font-size:200% !important;}",
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await expanded.evaluate((e) => e.parentNode?.removeChild(e));
      finish();
    }
  });

  for (const [role, name, enRole, arRole] of b07People) {
    test(`merged B07-B ${locale} ${role}: account identity, neutral appearance and sign-out stay visible across settings`, async ({
      page,
    }) => {
      const t = (en: string, ar: string) => pick(locale, en, ar);
      const finish = isolation(page);
      await page.setViewportSize({ width: 1440, height: 1000 });
      await signIn(page, role, locale);
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
      const figure = main.getByRole("figure", {
        name: t("Theme preview", "معاينة السمة"),
        exact: true,
      });
      await expect(
        figure.getByText(t("Example screen", "شاشة نموذجية"), { exact: true }),
      ).toBeVisible();
      await expect(
        figure.getByText(t("Your Study Shelf", "رف المذاكرة"), { exact: true }),
      ).toHaveCount(0);
      for (const theme of ["light", "dark", "system"] as const) {
        await page
          .getByRole("radio", {
            name: t(
              theme === "light"
                ? "Light"
                : theme === "dark"
                  ? "Dark"
                  : "System",
              theme === "light" ? "فاتح" : theme === "dark" ? "داكن" : "النظام",
            ),
            exact: true,
          })
          .check();
        await page.emulateMedia({
          colorScheme: "dark",
          reducedMotion: "reduce",
        });
        await expect(page.locator("html")).toHaveAttribute(
          "data-theme",
          theme === "light" ? "light" : "dark",
        );
      }
      await page.emulateMedia({
        colorScheme: "light",
        reducedMotion: "reduce",
      });
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(exit).toBeVisible();
        expect((await exit.boundingBox())!.height).toBeGreaterThanOrEqual(44);
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
      const enlarged = await page.addStyleTag({
        content: "html {font-size:200% !important;}",
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await expect(exit).toBeVisible();
      await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
      const appearance = page.getByRole("tab", {
        name: t("Appearance", "المظهر"),
        exact: true,
      });
      await appearance.press("End");
      await expect(
        page.getByRole("tab", {
          name: t("Identity and access", "الهوية والوصول"),
          exact: true,
        }),
      ).toBeFocused();
      await expect(exit).toBeVisible();
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
      await exit.press("Enter");
      await expect(page).toHaveURL(/\/login\?lang=/u);
      await expect(
        page.getByRole("button", {
          name: t("Continue", "متابعة"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("tab", { name: t("Privacy", "الخصوصية"), exact: true }),
      ).toHaveCount(0);
      finish();
    });
  }
}

const b07Paths = [
  {
    program: "human-medicine",
    level: "human-medicine-year-1",
    questions: ["stage", "institution", "program", "level", "term"],
  },
  {
    program: "veterinary-medicine",
    level: "veterinary-medicine-year-2",
    questions: ["stage", "institution", "program", "level", "term"],
  },
  {
    program: "mathematics-track",
    level: "mathematics-track-year-3",
    questions: ["stage", "program", "term"],
  },
  {
    program: "synthetic-credit-program",
    level: "synthetic-credit-level",
    questions: ["stage", "institution", "program"],
  },
] as const;
function b07Row(program: string, level: string) {
  return reviewCatalogRows.find(
    (row) =>
      row.program.id === program &&
      row.level.id === level &&
      (row.term.id.endsWith("term-1") ||
        program === "synthetic-credit-program"),
  )!;
}
async function b07SavePath(
  page: Page,
  locale: "en" | "ar",
  program: string,
  level: string,
) {
  const row = b07Row(program, level);
  await showAccountView(page, "academic");
  for (const key of [
    "stage",
    "institution",
    "program",
    "level",
    "term",
  ] as const)
    await page.locator(`#academic-${key}Id`).selectOption(row[key].id);
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
}
for (const locale of ["en", "ar"] as const) {
  test(`merged B07-A ${locale}: determined choices skip questions while four complete paths retain review and Back`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const finish = isolation(page),
      t = (en: string, ar: string) => pick(locale, en, ar);
    for (const path of b07Paths) {
      await signIn(page, "student", locale);
      const row = b07Row(path.program, path.level);
      const asked: string[] = [];
      for (const key of path.questions) {
        await expect(page.locator("fieldset[data-step]")).toHaveAttribute(
          "data-step",
          key + "Id",
        );
        asked.push(key);
        await page.locator(`input[value="${row[key].id}"]`).check();
        await page
          .getByRole("button", {
            name:
              key === path.questions.at(-1)
                ? t("Review choices", "مراجعة الاختيارات")
                : t("Continue", "متابعة"),
            exact: true,
          })
          .click();
      }
      expect(asked).toEqual(path.questions);
      await expect(
        page.getByRole("heading", {
          name: t("Your academic path", "مسارك الدراسي"),
          exact: true,
        }),
      ).toBeFocused();
      await expect(page.locator("dl dt")).toHaveCount(5);
      for (const key of [
        "stage",
        "institution",
        "program",
        "level",
        "term",
      ] as const)
        await expect(
          page
            .locator("dl")
            .getByText(locale === "ar" ? row[key].nameAr : row[key].nameEn, {
              exact: true,
            }),
        ).toBeVisible();
      await expect(
        page.getByRole("button", {
          name: t("Edit University", "تعديل الجامعة"),
          exact: true,
        }),
      ).toHaveCount(path.program === "mathematics-track" ? 0 : 1);
      await expect(
        page.getByRole("button", {
          name: t("Edit Education system", "تعديل نظام التعليم"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("heading", {
          name: t("Your Study Shelf", "رف المذاكرة"),
          exact: true,
        }),
      ).toHaveCount(0);
      await page
        .getByRole("button", { name: t("Back", "رجوع"), exact: true })
        .click();
      const last = path.questions.at(-1)!;
      await expect(
        page.locator(`input[value="${row[last].id}"]`),
      ).toBeChecked();
      await page
        .getByRole("button", {
          name: t("Review choices", "مراجعة الاختيارات"),
          exact: true,
        })
        .click();
      for (const theme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme: theme });
        for (const width of [1440, 390, 320]) {
          await page.setViewportSize({ width, height: 900 });
          await expect(page.locator("dl dt")).toHaveCount(5);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          ).toBe(true);
        }
      }
      const enlarged = await page.addStyleTag({
        content: "html {font-size:200%}",
      });
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
        path: testInfo.outputPath(`${path.program}-${locale}-review200.png`),
      });
      await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
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
    }
    finish();
  });
  test(`merged B07-A ${locale}: changing path reconciles Settings and Shelf while old quiz and draft remain intact`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const finish = isolation(page),
      t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/chat`);
    const hint = page.getByRole("button", {
      name: t("Got it", "فهمت"),
      exact: true,
    });
    if (await hint.isVisible()) await hint.click();
    await page
      .locator("#message")
      .fill("Keep this old-path B07 synthetic draft.");
    await navigate(page, `${unit}/quiz`, locale);
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
    await navigate(page, "/settings", locale);
    const quizReturn = page.getByRole("link", {
      name: t(
        "Return to quiz attempt · Anatomy",
        "العودة إلى محاولة الاختبار · علم التشريح",
      ),
      exact: true,
    });
    // No saved path: existing direct, authorized work remains resumable.
    await expect(quizReturn).toHaveAttribute(
      "href",
      attempt.pathname + attempt.search,
    );
    for (const path of b07Paths.slice(1)) {
      await b07SavePath(page, locale, path.program, path.level);
      await expect(quizReturn).toHaveCount(0);
      await page
        .getByRole("link", {
          name: t("Open current study path", "فتح المسار الدراسي الحالي"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: t("Your Study Shelf", "رف المذاكرة"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", {
          name: t("Resume Anatomy", "متابعة علم التشريح"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("link", {
          name: t("Continue studying", "متابعة المذاكرة"),
          exact: true,
        }),
      ).toHaveCount(0);
      const choose = page.getByRole("link", {
        name: b07ChooseName(locale),
        exact: true,
      });
      await expect(choose).toBeVisible();
      await choose.click();
      await expect(page.getByRole("searchbox")).toBeVisible();
      const row = b07Row(path.program, path.level);
      await expect(
        page.getByRole("link", {
          name: `${t("Open", "فتح")} ${locale === "ar" ? row.unit.nameAr : row.unit.nameEn}`,
          exact: true,
        }),
      ).toBeVisible();
      await navigate(page, "/settings", locale);
    }
    await b07SavePath(page, locale, "human-medicine", "human-medicine-year-1");
    await expect(quizReturn).toHaveAttribute(
      "href",
      attempt.pathname + attempt.search,
    );
    await navigate(page, "/settings", locale);
    await quizReturn.click();
    await expect(
      page.locator('input[name="sample-question-0"]').first(),
    ).toBeChecked();
    await expect(
      page.locator('input[name="sample-question-0"]').first(),
    ).toBeEnabled();
    await navigate(page, `${unit}/chat`, locale);
    await expect(page.locator("#message")).toHaveValue(
      "Keep this old-path B07 synthetic draft.",
    );
    await navigate(page, "/learn", locale);
    await expect(
      page.getByRole("link", {
        name: t("Resume Anatomy", "متابعة علم التشريح"),
        exact: true,
      }),
    ).toHaveAttribute("href", `${unit}/chat?lang=${locale}`);
    expect(
      (await new AxeBuilder({ page }).include("main").analyze()).violations,
    ).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: testInfo.outputPath(`resume-current-${locale}.png`),
    });
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B06 ${locale}: compact context and a principal reading scroll preserve study work`, async ({
    page,
  }, testInfo) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const inspectOptions = async () => {
      const summary = page.locator("summary").filter({
        hasText: t("Study options", "خيارات المذاكرة"),
      });
      expect(
        await summary.evaluate((element) => {
          const panel = element.parentElement!.querySelector<HTMLElement>(
            "[class*='chatPreferences']",
          )!;
          const r = panel.getBoundingClientRect();
          const card = element
            .closest("[class*='conversation']")!
            .getBoundingClientRect();
          return {
            usableWidth: r.width >= 240,
            withinCard: r.left >= card.left && r.right <= card.right + 1,
            withinViewport:
              r.left >= 0 &&
              r.right <= document.documentElement.clientWidth + 1,
            noHorizontalScroll: panel.scrollWidth <= panel.clientWidth + 1,
            controlsUnclipped: Array.from(
              panel.querySelectorAll<HTMLElement>("a,label"),
            ).every(
              (control) =>
                control.scrollWidth <= control.clientWidth + 1 &&
                control.scrollHeight <= control.clientHeight + 1,
            ),
          };
        }),
      ).toEqual({
        usableWidth: true,
        withinCard: true,
        withinViewport: true,
        noHorizontalScroll: true,
        controlsUnclipped: true,
      });
    };
    await signIn(page, "student", locale, `${unit}/chat`);
    const hint = page.getByRole("button", {
      name: t("Got it", "فهمت"),
      exact: true,
    });
    if (await hint.isVisible()) await hint.click();
    for (let n = 0; n < 3; n++) await send(page, "supported", locale);
    await expect(
      page.getByText(answerExamples.supported[locale === "ar" ? 1 : 0], {
        exact: true,
      }),
    ).toHaveCount(3);
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const [width, height] of [
        [390, 844],
        [320, 720],
      ] as const) {
        await page.setViewportSize({ width, height });
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('[data-layout="workspace"]')).toHaveAttribute(
          "data-workspace-flow",
          /pane|page/u,
        );
        expect(
          await page.evaluate(
            () =>
              getComputedStyle(document.body).minWidth === "0px" &&
              document.body.getBoundingClientRect().width <=
                document.documentElement.clientWidth + 1,
          ),
        ).toBe(true);
        const layout = await page.evaluate(
          (name) => {
            const reading = document.querySelector<HTMLElement>(
              `[aria-label="${name}"]`,
            )!;
            window.scrollTo(0, 0);
            for (const e of document.querySelectorAll<HTMLElement>("*"))
              if (e.scrollTop) e.scrollTop = 0;
            const r = reading.getBoundingClientRect();
            let top = Math.max(0, r.top),
              bottom = Math.min(innerHeight, r.bottom);
            for (let e = reading.parentElement; e; e = e.parentElement)
              if (
                ["auto", "scroll", "hidden", "clip"].includes(
                  getComputedStyle(e).overflowY,
                )
              ) {
                const b = e.getBoundingClientRect();
                top = Math.max(top, b.top);
                bottom = Math.min(bottom, b.bottom);
              }
            const nav = document.querySelector<HTMLElement>(
              'nav[aria-label="Product navigation"],nav[aria-label="تنقل المنتج"]',
            )!;
            if (getComputedStyle(nav).position === "fixed")
              bottom = Math.min(bottom, nav.getBoundingClientRect().top);
            const owners = Array.from(
              document.querySelectorAll<HTMLElement>("*"),
            ).filter(
              (e) =>
                e.checkVisibility() &&
                !e.matches("input,textarea,select") &&
                !e.closest("dialog") &&
                ["auto", "scroll"].includes(getComputedStyle(e).overflowY) &&
                e.scrollHeight > e.clientHeight + 2 &&
                e.clientHeight > 0,
            );
            return {
              visible: Math.max(0, Math.round(bottom - top)),
              owners:
                owners.length +
                (document.documentElement.scrollHeight > innerHeight + 2
                  ? 1
                  : 0),
              overflow:
                document.documentElement.scrollWidth >
                document.documentElement.clientWidth + 1,
            };
          },
          t("Conversation", "المحادثة الحالية"),
        );
        expect(layout.visible).toBeGreaterThanOrEqual(160);
        expect(layout.owners).toBe(1);
        expect(layout.overflow).toBe(false);
        const context = page
          .locator("summary")
          .filter({ hasText: b07DetailsName(locale) });
        await context.press("Enter");
        await expect(
          page.getByText(t("Zagazig University", "جامعة الزقازيق"), {
            exact: true,
          }),
        ).toBeVisible();
        await expect(
          page.getByRole("heading", {
            name: b07SwitchName(locale),
            exact: true,
          }),
        ).toBeVisible();
        await context.press("Escape");
        await expect(context).toBeFocused();
        await expect(
          page.getByText(t("Zagazig University", "جامعة الزقازيق"), {
            exact: true,
          }),
        ).toBeHidden();
        const studyOptions = page
          .locator("summary")
          .filter({ hasText: t("Study options", "خيارات المذاكرة") });
        await studyOptions.click();
        await inspectOptions();
        await studyOptions.press("Escape");
        await page
          .getByRole("button", {
            name: t("Handout · p. 3", "الملزمة · ص ٣"),
            exact: true,
          })
          .last()
          .click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await page
          .getByRole("dialog")
          .getByRole("button", { name: t("Close", "إغلاق"), exact: true })
          .click();
        await expect(
          page
            .getByRole("button", {
              name: t("Handout · p. 3", "الملزمة · ص ٣"),
              exact: true,
            })
            .last(),
        ).toBeFocused();
        expect(
          (
            await new AxeBuilder({ page })
              .include("main")
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        await page.screenshot({
          path: testInfo.outputPath(`chat-${locale}-${theme}-${width}.png`),
        });
      }
    }
    await page.locator("#message").fill("Keep this synthetic B06 draft.");
    const options = page
      .locator("summary")
      .filter({ hasText: t("Study options", "خيارات المذاكرة") });
    await options.click();
    await page
      .getByRole("radio", { name: t("Arabic", "العربية"), exact: true })
      .check();
    await options.press("Escape");
    await page
      .getByRole("button", {
        name: locale === "en" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(page.locator("html")).toHaveAttribute(
      "lang",
      locale === "en" ? "ar" : "en",
    );
    await expect(page.locator("#message")).toHaveValue(
      "Keep this synthetic B06 draft.",
    );
    await page
      .getByRole("button", {
        name: locale === "en" ? "English" : "العربية",
        exact: true,
      })
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page
      .locator("summary")
      .filter({ hasText: t("Study options", "خيارات المذاكرة") })
      .click();
    await expect(
      page.getByRole("radio", { name: t("Arabic", "العربية"), exact: true }),
    ).toBeChecked();
    await page
      .locator("summary")
      .filter({ hasText: t("Study options", "خيارات المذاكرة") })
      .press("Escape");
    await navigate(page, `${unit}/studio`, locale);
    await page
      .locator("summary")
      .filter({ hasText: t("Depth and size", "التفصيل والحجم") })
      .click();
    await page.locator("#artifact-depth").selectOption("detailed");
    await page.locator("#artifact-size").selectOption("extended");
    await page
      .getByRole("button", { name: t("Generate", "إنشاء"), exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: `${t("Simulated artifact", "مخرج محاكى")}: ${t("Structured summary", "ملخص منظم")}`,
        exact: true,
      }),
    ).toBeVisible();
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      const sources = page.getByRole("link", {
        name: b07SourcesName(locale),
        exact: true,
      });
      await sources.focus();
      await expect(sources).toBeFocused();
      expect(
        await sources.evaluate((e) => {
          const r = e.getBoundingClientRect();
          const owners = Array.from(
            document.querySelectorAll<HTMLElement>("*"),
          ).filter(
            (item) =>
              item.checkVisibility() &&
              !item.matches("input,textarea,select") &&
              ["auto", "scroll"].includes(getComputedStyle(item).overflowY) &&
              item.scrollHeight > item.clientHeight + 2 &&
              item.clientHeight > 0,
          );
          const nav = document.querySelector<HTMLElement>(
            'nav[aria-label="Product navigation"],nav[aria-label="تنقل المنتج"]',
          )!;
          const bottom =
            getComputedStyle(nav).position === "fixed"
              ? nav.getBoundingClientRect().top
              : innerHeight;
          return {
            owners:
              owners.length +
              (document.documentElement.scrollHeight > innerHeight + 2 ? 1 : 0),
            actionVisible: r.top >= 0 && r.bottom <= bottom + 1,
          };
        }),
      ).toEqual({ owners: 1, actionVisible: true });
    }
    await navigate(page, `${unit}/chat`, locale);
    await expect(page.locator("#message")).toHaveValue(
      "Keep this synthetic B06 draft.",
    );
    for (const width of [768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(
        page.getByRole("group", {
          name: t("Study language", "لغة المذاكرة"),
          exact: true,
        }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth + 1,
        ),
      ).toBe(true);
    }
    await page
      .getByRole("radio", { name: t("Arabic", "العربية"), exact: true })
      .focus();
    await page.setViewportSize({ width: 320, height: 720 });
    await expect(options).toBeFocused();
    await page.setViewportSize({ width: 768, height: 900 });
    await expect(
      page.getByRole("radio", { name: t("Arabic", "العربية"), exact: true }),
    ).toBeFocused();
    await page.setViewportSize({ width: 320, height: 720 });
    await expect(options).toBeFocused();
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "32px"),
    );
    await expect(page.locator('[data-layout="workspace"]')).toHaveAttribute(
      "data-workspace-flow",
      "page",
    );
    await options.click();
    await inspectOptions();
    await options.press("Escape");
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth + 1,
      ),
    ).toBe(true);
    await page.locator("#message").focus();
    expect(
      await page.locator("#message").evaluate((e) => {
        const r = e.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= innerHeight + 1;
      }),
    ).toBe(true);
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "16px"),
    );
    await page.setViewportSize({ width: 390, height: 420 });
    await expect(page.locator('[data-layout="workspace"]')).toHaveAttribute(
      "data-workspace-flow",
      "page",
    );
    await page.locator("#message").fill("Keyboard-sized viewport example.");
    await expect(
      page.getByRole("link", { name: "Samir Hassan", exact: true }),
    ).toBeVisible();
    finish();
  });
  test(`merged B06 ${locale}: explicit quiz clock and progress remain reachable without restarting the deadline`, async ({
    page,
  }, testInfo) => {
    const finish = isolation(page),
      t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/quiz`);
    await page
      .getByLabel(t("Number of questions", "عدد الأسئلة"), { exact: true })
      .fill("6");
    await page
      .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
      .check();
    await page
      .getByLabel(t("Duration (minutes)", "المدة (بالدقائق)"), { exact: true })
      .fill("1");
    const reference = new Date("2026-10-14T12:00:00Z");
    await page.clock.install({ time: reference });
    await page.clock.pauseAt(new Date(reference.getTime() + 1000));
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await expect(page.getByRole("timer")).toContainText(":");
    await expect(
      page.getByText(
        t("Less than one minute remains.", "متبقي أقل من دقيقة."),
        {
          exact: true,
        },
      ),
    ).toHaveCount(0);
    await page.clock.runFor(1000);
    await expect(
      page.getByText(
        t("Less than one minute remains.", "متبقي أقل من دقيقة."),
        {
          exact: true,
        },
      ),
    ).toBeVisible();
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const [width, height] of [
        [390, 844],
        [320, 720],
      ] as const) {
        await page.setViewportSize({ width, height });
        await page.clock.runFor(64);
        const last = page.locator('input[name="sample-question-5"]').first();
        await last.check();
        await expect(page.locator("#quiz-progress")).toContainText(
          t("Answered", "تمت الإجابة"),
        );
        await page.keyboard.press("Tab");
        await last.focus();
        const visible = await last.evaluate((e) => {
          const timer = document
              .querySelector('[role="timer"]')!
              .parentElement!.getBoundingClientRect(),
            r = e.getBoundingClientRect();
          return (
            timer.bottom <= r.top + 1 &&
            r.top >= 0 &&
            r.bottom <= innerHeight + 1
          );
        });
        expect(visible).toBe(true);
        await expect(page.getByRole("timer")).toBeVisible();
        await page.screenshot({
          path: testInfo.outputPath(`quiz-${locale}-${theme}-${width}.png`),
        });
      }
    }
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "32px"),
    );
    await page.clock.runFor(64);
    await expect(page.locator('[data-layout="workspace"]')).toHaveAttribute(
      "data-workspace-flow",
      "page",
    );
    const question = page.locator('input[name="sample-question-5"]').first();
    await question.focus();
    expect(
      await question.evaluate((e) => {
        const r = e.getBoundingClientRect(),
          timer = document
            .querySelector('[role="timer"]')!
            .parentElement!.getBoundingClientRect();
        return timer.bottom <= r.top + 1 && r.bottom <= innerHeight + 1;
      }),
    ).toBe(true);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth + 1,
      ),
    ).toBe(true);
    await page.clock.runFor(61000);
    await expect(page).toHaveURL(/\/review\?/u);
    await expect(
      page.getByRole("heading", {
        name: t("Expired quiz review", "مراجعة الاختبار المنتهي"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByRole("timer")).toHaveCount(0);
    await expect(
      page.getByText(t("Simulated score", "نتيجة محاكاة"), { exact: false }),
    ).toHaveCount(0);
    await expect(
      page.locator('input[name="sample-question-5"]').first(),
    ).toBeChecked();
    await expect(
      page.locator('input[name="sample-question-5"]').first(),
    ).toBeDisabled();
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B05-B ${locale}: named resource action and preview detours return to the exact work`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "admin", locale, "/admin/sources");
    const action = page.getByRole("link", {
      name: new RegExp(
        "^" + t("Open governed decisions", "فتح القرارات المنضبطة"),
      ),
    });
    await expect(action).toHaveAttribute(
      "href",
      /decision=sample-quarantine.*action=QUARANTINE_SOURCE.*version=2.*origin=sources/u,
    );
    await action.press("Enter");
    await expect(page.locator("#decision-detail-heading")).toBeFocused();
    await expect(page.locator('input[name="action"]')).toHaveValue(
      "QUARANTINE_SOURCE",
    );
    await expect(page.locator("#decision-detail-heading")).toContainText(
      t("Synthetic Anatomy recording", "تسجيل التشريح التجريبي"),
    );
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
    await send(page, "supported", locale);
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
    await expect(page).toHaveURL(/\/evidence\?/u);
    await page
      .getByRole("link", {
        name: t("Return to Admin", "العودة للإدارة"),
        exact: true,
      })
      .click();
    await expect(page.locator('input[name="action"]')).toHaveValue(
      "QUARANTINE_SOURCE",
    );
    await expect(page.locator("#decision-detail-heading")).toBeFocused();
    await page
      .getByRole("link", {
        name: t("Return to Sources", "العودة إلى المصادر"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/admin/sources\\?lang=${locale}$`),
    );
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
    await reviewExampleLayout(page);
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
  test(`merged B05-B ${locale}: saved and unsaved catalog choices survive navigation and require fresh review`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "admin", locale, "/admin/catalog");
    const field = page.getByLabel(
      t("Configured unit label", "اسم الوحدة من الإعدادات"),
    );
    const review = page.getByRole("button", {
      name: t("Review changes", "مراجعة التغييرات"),
      exact: true,
    });
    const save = page.getByRole("button", {
      name: t("Save draft", "حفظ المسودة"),
      exact: true,
    });
    await field.selectOption("SUBJECT");
    await review.press("Enter");
    await save.click();
    await adminNavigate(page, "/admin/cohorts", locale);
    await adminNavigate(page, "/admin/catalog", locale);
    await expect(field).toHaveValue("SUBJECT");
    await expect(
      page.getByText(
        new RegExp(t("Sample catalog draft saved", "حفظت مسودة الدليل")),
      ),
    ).toContainText(t("Subject", "مادة دراسية"));
    await field.selectOption("MODULE");
    await review.click();
    await field.selectOption("SUBJECT");
    await expect(save).toHaveCount(0);
    await field.selectOption("MODULE");
    await adminNavigate(page, "/admin/jobs", locale);
    await adminNavigate(page, "/admin/catalog", locale);
    await expect(field).toHaveValue("MODULE");
    await page
      .getByRole("button", {
        name: locale === "en" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(page.locator("#catalog-unit-type")).toHaveValue("MODULE");
    await expect(
      page.getByText(
        new RegExp(
          locale === "en" ? "حفظت مسودة الدليل" : "Sample catalog draft saved",
        ),
      ),
    ).toContainText(locale === "en" ? "مادة دراسية" : "Subject");
    await page
      .getByRole("button", {
        name: locale === "en" ? "English" : "العربية",
        exact: true,
      })
      .click();
    await expect(field).toHaveValue("MODULE");
    await expect(
      page.getByText(new RegExp(t("Unsaved changes", "تغييرات غير محفوظة"))),
    ).toBeVisible();
    await expect(
      page.getByText(
        new RegExp(t("Sample catalog draft saved", "حفظت مسودة الدليل")),
      ),
    ).toContainText(t("Subject", "مادة دراسية"));
    await expect(save).toHaveCount(0);
    await review.press("Enter");
    await save.click();
    await expect(
      page.getByText(new RegExp(t("Unsaved changes", "تغييرات غير محفوظة"))),
    ).toHaveCount(0);
    await expect(
      page.getByText(
        new RegExp(t("Sample catalog draft saved", "حفظت مسودة الدليل")),
      ),
    ).toContainText(t("Module", "وحدة دراسية"));
    await reviewExampleLayout(page);
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
    await signIn(page, "admin", locale, "/admin/catalog");
    await expect(field).toHaveValue("MODULE");
    await expect(
      page.getByText(
        new RegExp(t("Sample catalog draft saved", "حفظت مسودة الدليل")),
      ),
    ).toHaveCount(0);
    finish();
  });
  test(`merged B05-B ${locale}: closed resource links and generic recovery cannot redirect or authorize`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "second-admin", locale);
    for (const resource of [
      "sources",
      "catalog",
      "cohorts",
      "jobs",
      "quality",
      "usage",
      "incidents",
    ]) {
      await adminNavigate(page, `/admin/${resource}`, locale);
      const link = page.getByRole("link", {
        name: new RegExp(
          "^" + t("Open governed decisions", "فتح القرارات المنضبطة"),
        ),
      });
      await expect(link).toHaveAttribute(
        "href",
        new RegExp(`decision=sample-.*origin=${resource}`),
      );
      await expect(
        page.getByRole("link", {
          name: t("All decisions", "كل القرارات"),
          exact: true,
        }),
      ).toHaveAttribute("href", `/admin?lang=${locale}`);
    }
    await adminNavigate(page, "/admin/sources", locale);
    await adminNavigate(page, "/admin/campaigns", locale);
    await expect(
      page.getByRole("link", {
        name: new RegExp(
          "^" + t("Open governed decisions", "فتح القرارات المنضبطة"),
        ),
      }),
    ).toHaveCount(0);
    await page
      .getByRole("link", {
        name: t("All decisions", "كل القرارات"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: t("Decision queue", "قائمة القرارات"),
        exact: true,
      }),
    ).toBeVisible();
    for (const query of [
      "origin=https%3A%2F%2Fforeign.invalid",
      "origin=sources&origin=quality",
    ]) {
      await page.evaluate(
        (url) => history.pushState(null, "", url),
        `/admin?lang=${locale}&${query}`,
      );
      await expect(
        page.getByRole("link", {
          name: t("Return to Sources", "العودة إلى المصادر"),
          exact: true,
        }),
      ).toHaveCount(0);
    }
    await page
      .getByRole("link", {
        name: t("Preview student", "معاينة الطالب"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("link", {
        name: t("Return to Admin", "العودة للإدارة"),
        exact: true,
      }),
    ).toHaveAttribute("href", `/admin?lang=${locale}`);
    finish();
  });
}

const b05Actions = [
  "PUBLISH_UNIT",
  "HIDE_UNIT",
  "UNLOCK_COHORT",
  "LOCK_COHORT",
  "ACTIVATE_SOURCE",
  "DEACTIVATE_SOURCE",
  "QUARANTINE_SOURCE",
  "RETRY_SOURCE",
  "PLACE_RAW_HOLD",
  "REMOVE_RAW_HOLD",
  "ENABLE_FLAG",
  "DISABLE_FLAG",
] as const;
async function b05Select(page: Page, index: number, locale: "en" | "ar") {
  const select = page.getByLabel(
    pick(locale, "Choose a decision", "اختر قرارًا"),
    { exact: true },
  );
  if (await select.isVisible())
    await select.selectOption(`sample-${actionFixtures[index]!.id}`);
  else
    await page
      .locator("#decision-list")
      .getByRole("button", {
        name: new RegExp(
          "^" + getAdminCopy(locale).actions[b05Actions[index]!],
        ),
      })
      .click();
  await expect(page.locator("#decision-detail-heading")).toBeFocused();
}
function b05Confirm(locale: "en" | "ar", index: number, second = false) {
  const copy = getAdminCopy(locale);
  return `${second ? copy.confirmSecond : actionFixtures[index]!.protected ? copy.confirmProtected : copy.confirmAction}: ${copy.actions[b05Actions[index]!]}`;
}
for (const locale of ["en", "ar"] as const) {
  test(`merged B05-A ${locale}: twelve exact presentations and five clean containment receipts`, async ({
    page,
  }, testInfo) => {
    const finish = isolation(page);
    const copy = getAdminCopy(locale);
    await signIn(page, "admin", locale);
    const panel = page.locator(
      'section[aria-labelledby="decision-detail-heading"]',
    );
    for (let index = 0; index < 12; index++) {
      await b05Select(page, index, locale);
      await expect(panel).toContainText(copy.consequences[b05Actions[index]!]);
      const heading = page.locator("#decision-detail-heading");
      await expect(heading).not.toContainText("a0000000");
      await expect(heading).toContainText(
        index === 8 || index === 9
          ? pick(
              locale,
              "Synthetic handout raw object",
              "العنصر الخام لملزمة تجريبية",
            )
          : index >= 10
            ? pick(
                locale,
                "Synthetic study artifact control",
                "التحكم بأداة مذاكرة تجريبية",
              )
            : index === 6 || index === 7
              ? pick(
                  locale,
                  "Synthetic Anatomy recording",
                  "تسجيل التشريح التجريبي",
                )
              : index === 4 || index === 5
                ? pick(
                    locale,
                    "Synthetic Anatomy handout",
                    "ملزمة التشريح التجريبية",
                  )
                : index === 2 || index === 3
                  ? pick(locale, "cohort", "مجموعة")
                  : pick(locale, "Anatomy unit", "وحدة التشريح"),
      );
      await panel
        .locator("details summary")
        .filter({ hasText: copy.targetId })
        .click();
      await expect(panel.locator("details code")).toContainText("a0000000");
      const review = page.getByRole("button", {
        name: copy.reviewAction,
        exact: true,
      });
      if (await review.isDisabled()) continue;
      await page
        .getByLabel(copy.reason)
        .fill("Contain this exact synthetic object during review.");
      if (index === 8) {
        await page
          .getByLabel(copy.holdExpiry, { exact: true })
          .fill("2027-01-18T16:00");
        await page.locator('input[name="reviewAttested"]').check();
      }
      await review.press("Enter");
      await expect(page.getByRole("dialog")).toContainText(
        copy.consequences[b05Actions[index]!],
      );
      await expect(
        page.getByRole("button", {
          name: b05Confirm(locale, index),
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: copy.cancelReview, exact: true })
        .click();
      await expect(review).toBeFocused();
    }
    for (const index of [1, 3, 5, 6, 11]) {
      await b05Select(page, index, locale);
      await page
        .getByLabel(copy.reason)
        .fill("Contain this exact synthetic object during review.");
      await page
        .getByRole("button", { name: copy.reviewAction, exact: true })
        .click();
      await page
        .getByRole("button", { name: b05Confirm(locale, index), exact: true })
        .click();
      await expect(
        panel.getByText(copy.actionSuccess, { exact: true }),
      ).toBeVisible();
      await expect(panel).toContainText(copy.alreadyInState);
      await expect(panel).not.toContainText(copy.blocked);
      await expect(
        page.getByRole("button", { name: copy.reviewAction, exact: true }),
      ).toBeDisabled();
    }
    await page
      .getByRole("button", {
        name: new RegExp(pick(locale, "^Completed", "^مكتمل")),
      })
      .click();
    await expect(page.locator("#decision-list li")).toHaveCount(5);
    await expect(
      page.getByRole("heading", { name: new RegExp(copy.decisionsHeading) }),
    ).toContainText(new Intl.NumberFormat(locale).format(7));
    await page
      .getByRole("button", {
        name: new RegExp(pick(locale, "^All ", "^الكل ")),
      })
      .click();
    await b05Select(page, 10, locale);
    await expect(panel).toContainText(
      copy.predicates["budget.approval_required"],
    );
    await expect(
      page.getByRole("button", { name: copy.reviewAction, exact: true }),
    ).toBeDisabled();
    await reviewExampleLayout(page);
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`admin-reviewed-${locale}.png`),
      fullPage: true,
    });
    finish();
  });
  test(`merged B05-A ${locale}: pending hold retains original version and exact read-only proposal`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const copy = getAdminCopy(locale);
    await signIn(page, "admin", locale);
    await b05Select(page, 8, locale);
    const originalVersion = await page
      .locator('input[name="expectedVersion"]')
      .inputValue();
    await page
      .getByLabel(copy.reason)
      .fill("Preserve this exact synthetic raw object until review.");
    await page
      .getByLabel(copy.holdExpiry, { exact: true })
      .fill("2027-01-18T16:00");
    await page.locator('input[name="reviewAttested"]').check();
    await page
      .getByRole("button", { name: copy.reviewAction, exact: true })
      .click();
    await page
      .getByRole("button", { name: b05Confirm(locale, 8), exact: true })
      .click();
    await expect(page.getByRole("status").last()).toContainText(
      copy.actionPending,
    );
    await expect(page.locator('input[name="expectedVersion"]')).toHaveValue(
      originalVersion,
    );
    const href = await page
      .getByRole("link", { name: copy.pendingLink, exact: true })
      .getAttribute("href");
    expect(href).toContain("version=" + originalVersion);
    await page
      .getByRole("link", { name: copy.pendingLink, exact: true })
      .click();
    await expect(page.getByLabel(copy.reason)).toHaveAttribute("readonly", "");
    await expect(page.getByLabel(copy.holdExpiry, { exact: true })).toHaveValue(
      "2027-01-18T16:00",
    );
    await expect(
      page.locator('input[name="reviewAttested"]'),
    ).not.toBeChecked();
    await page.locator('input[name="reviewAttested"]').check();
    await page
      .getByRole("button", { name: copy.reviewAction, exact: true })
      .click();
    await page
      .getByRole("button", { name: b05Confirm(locale, 8, true), exact: true })
      .click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      copy.errors.DIFFERENT_FOUNDER_REQUIRED,
    );
    await page
      .getByRole("main")
      .getByRole("button", {
        name: pick(locale, "Sign out", "تسجيل الخروج"),
        exact: true,
      })
      .click();
    await page
      .getByLabel(pick(locale, "Email address", "البريد الإلكتروني"))
      .fill("second-admin@example.invalid");
    await page
      .getByRole("button", {
        name: pick(locale, "Continue", "متابعة"),
        exact: true,
      })
      .click();
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
    await b05Select(page, 8, locale);
    await expect(page.getByLabel(copy.reason)).toHaveValue(
      "Preserve this exact synthetic raw object until review.",
    );
    await expect(
      page.getByLabel(copy.holdExpiry, { exact: true }),
    ).toHaveAttribute("readonly", "");
    await expect(page.locator('input[name="expectedVersion"]')).toHaveValue(
      originalVersion,
    );
    await expect(
      page.locator('input[name="reviewAttested"]'),
    ).not.toBeChecked();
    await page.locator('input[name="reviewAttested"]').check();
    await page
      .getByRole("button", { name: copy.reviewAction, exact: true })
      .click();
    await page
      .getByRole("button", { name: b05Confirm(locale, 8, true), exact: true })
      .click();
    await expect(
      page.getByText(copy.actionSuccess, { exact: true }),
    ).toBeVisible();
    for (const query of [
      href!.replace(/version=\d+/u, "version=999"),
      href! + "&decision=sample-hide",
      href!.replace("sample-hold", "foreign"),
    ]) {
      await page.evaluate((url) => history.pushState(null, "", url), query);
      await expect(page.getByRole("main").getByRole("alert")).toContainText(
        copy.invalidSelection,
      );
      await expect(page.getByLabel(copy.reason)).toHaveCount(0);
    }
    await signIn(page, "admin", locale);
    await expect(page.locator("#decision-list li")).toHaveCount(12);
    await page.evaluate((url) => history.pushState(null, "", url), href!);
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      copy.invalidSelection,
    );
    await expect(page.getByLabel(copy.reason)).toHaveCount(0);
    finish();
  });
  test(`merged B05-A ${locale}: queue recheck submits nothing and low decisions reveal their details`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const copy = getAdminCopy(locale);
    await signIn(page, "admin", locale, "/admin?fixture=error-page");
    await expect(
      page.getByRole("heading", { name: copy.unavailableTitle, exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: copy.recheckQueue, exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: copy.checkingState, exact: true }),
    ).toBeDisabled();
    await expect(page.getByRole("status")).toContainText(copy.recheckDone);
    await expect(page.locator("#decision-list li")).toHaveCount(12);
    for (const index of [8, 9]) {
      await b05Select(page, index, locale);
      const bounds = await page
        .locator("#decision-detail-heading")
        .boundingBox();
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(bounds!.y).toBeLessThan(844);
      await expect(page.locator("#decision-detail-heading")).toBeInViewport();
      await page
        .locator("#decision-list")
        .getByRole("button", {
          name: new RegExp("^" + copy.actions[b05Actions[index]!]),
        })
        .press("Enter");
      await expect(page.locator("#decision-detail-heading")).toBeFocused();
      await expect(page.locator("#decision-detail-heading")).toBeInViewport();
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page
      .getByRole("button", {
        name: pick(locale, "Back to decisions", "العودة إلى القرارات"),
        exact: true,
      })
      .click();
    await expect(
      page.locator("#decision-list [aria-pressed='true']"),
    ).toBeFocused();
    await b05Select(page, 8, locale);
    await expect(page.getByLabel(copy.reason)).toBeVisible();
    for (const fixture of ["stale", "error"]) {
      await signIn(page, "admin", locale, `/admin?fixture=${fixture}`);
      await b05Select(page, 1, locale);
      await page
        .getByLabel(copy.reason)
        .fill("Contain this exact synthetic object during review.");
      await page
        .getByRole("button", { name: copy.reviewAction, exact: true })
        .click();
      await page
        .getByRole("button", { name: b05Confirm(locale, 1), exact: true })
        .click();
      await expect(page.getByRole("main").getByRole("alert")).toContainText(
        fixture === "stale"
          ? copy.errors.STALE_VERSION
          : copy.errors.UNAVAILABLE,
      );
      await expect(
        page.getByText(copy.actionSuccess, { exact: true }),
      ).toHaveCount(0);
      await page
        .getByRole("button", { name: copy.reloadQueue, exact: true })
        .click();
      await b05Select(page, 1, locale);
      await expect(
        page.getByRole("button", { name: copy.reviewAction, exact: true }),
      ).toBeEnabled();
      await expect(
        page.getByText(copy.actionSuccess, { exact: true }),
      ).toHaveCount(0);
    }
    await signIn(
      page,
      "second-admin",
      locale,
      "/admin?fixture=missing-pending-expiry",
    );
    await b05Select(page, 8, locale);
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      copy.missingHoldExpiry,
    );
    await expect(
      page.getByLabel(copy.holdExpiry, { exact: true }),
    ).toHaveAttribute("readonly", "");
    await expect(
      page.getByRole("button", { name: copy.reviewAction, exact: true }),
    ).toBeDisabled();
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B04 ${locale}: stale retained correction receipt cannot omit its intent and finalize`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await page.addInitScript(() => {
      const original = FormData.prototype.set as (
        this: FormData,
        name: string,
        value: string | Blob,
      ) => void;
      let blockedKey = "";
      Object.assign(window, {
        b04ReleaseCorrection: false,
        b04OmitCorrection: false,
      });
      FormData.prototype.set = function (name, value) {
        const flags = window as unknown as {
          b04ReleaseCorrection: boolean;
          b04OmitCorrection: boolean;
        };
        if (
          (name === "replacesSubmissionId" || name === "correctionAction") &&
          flags.b04OmitCorrection
        )
          return;
        if (name === "declaredRights") {
          const key = String(this.get("clientIdempotencyKey"));
          if (!blockedKey) blockedKey = key;
          if (key === blockedKey && !flags.b04ReleaseCorrection)
            return original.call(this, name, "UNKNOWN");
        }
        return original.call(this, name, value);
      };
    });
    await signIn(page, "leader", locale, `${campaign}?fixture=corrections`);
    await page
      .getByRole("link", {
        name: t("Fix information", "تصحيح المعلومات"),
        exact: true,
      })
      .press("Enter");
    await expect(page).toHaveURL(/request=sample-item-1&submission=-201/u);
    await expect(
      page.getByLabel(
        t("Professor or source description", "وصف الأستاذ أو المصدر"),
      ),
    ).toBeFocused();
    await page
      .locator('input[type="file"]')
      .setInputFiles("public/demo-files/synthetic-handout.pdf");
    const queue = page.getByRole("list", {
      name: t("Upload queue", "قائمة الرفع"),
      exact: true,
    });
    await expect(
      queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
    ).toHaveCount(1);
    await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
    await page
      .getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      })
      .click();
    await expect(
      queue.getByRole("button", {
        name: t("Retry submission", "إعادة محاولة الإرسال"),
        exact: true,
      }),
    ).toBeVisible();
    await openPreparedHistory(page, locale);
    await navigate(page, "/settings", locale);
    await openPreparedCampaign(page, campaign, locale);
    await ensureB09Intake(page, locale);
    await page
      .getByRole("button", {
        name: t("Add approved reference", "إضافة المرجع المعتمد"),
        exact: true,
      })
      .click();
    await expect(queue.getByRole("listitem")).toHaveCount(2);
    await expect(
      queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
    ).toHaveCount(1);
    await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
    await page
      .getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      })
      .click();
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(1);
    await page.evaluate(() => {
      Object.assign(window, {
        b04ReleaseCorrection: true,
        b04OmitCorrection: true,
      });
    });
    await queue
      .getByRole("button", {
        name: t("Retry submission", "إعادة محاولة الإرسال"),
        exact: true,
      })
      .click();
    await expect(queue).toContainText(
      t("no longer matches", "لم يعد هذا التصحيح"),
    );
    await expect(
      queue.getByRole("button", {
        name: t("Retry submission", "إعادة محاولة الإرسال"),
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      }),
    ).toBeDisabled();
    await openPreparedHistory(page, locale);
    await expect(
      page.getByText("Synthetic study source", { exact: true }),
    ).toHaveCount(1);
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B04 ${locale}: three-file detours, interruption, receipt retry and truthful replacement`, async ({
    page,
  }, testInfo) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await page.addInitScript(() => {
      const keys: string[] = [];
      Object.assign(window, { b04Keys: keys });
      const firstUploads: {
        files: string[];
        predecessors: string[];
        capture: boolean;
      } = {
        files: [],
        predecessors: [],
        capture: true,
      };
      Object.assign(window, { b09FirstUploads: firstUploads });
      new MutationObserver(() => {
        if (!firstUploads.capture) return;
        for (const row of document.querySelectorAll(
          '[data-state="UPLOADING"], [data-state="FINALIZING"]',
        )) {
          const file = row.querySelector("strong")?.textContent ?? "";
          if (file && !firstUploads.files.includes(file))
            firstUploads.files.push(file);
          const predecessor = row.getAttribute("data-predecessor-id");
          if (predecessor) firstUploads.predecessors.push(predecessor);
        }
      }).observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
      });
      const original = FormData.prototype.set as (
        this: FormData,
        name: string,
        value: string | Blob,
      ) => void;
      let rejectOnce = true;
      FormData.prototype.set = function (name, value) {
        if (name === "clientIdempotencyKey" && typeof value === "string")
          keys.push(value);
        if (name === "declaredRights" && rejectOnce) {
          rejectOnce = false;
          return original.call(this, name, "UNKNOWN");
        }
        return original.call(this, name, value);
      };
    });
    await signIn(page, "leader", locale, campaign);
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
    const rows = queue.getByRole("listitem");
    await expect(
      queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
    ).toHaveCount(3);
    const description = page.getByLabel(
      t("Professor or source description", "وصف الأستاذ أو المصدر"),
    );
    await description.fill(
      "Synthetic retained context for all three supplied files.",
    );
    await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
    await openPreparedHistory(page, locale);
    await navigate(page, "/settings", locale);
    await openPreparedCampaign(page, campaign, locale);
    await expect(rows).toHaveCount(3);
    await expect(description).toHaveValue(
      "Synthetic retained context for all three supplied files.",
    );
    await expect(
      page.getByLabel(t("I have permission", "لدي صلاحية")),
    ).toBeChecked();
    await page
      .getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      })
      .click();
    await expect(queue.getByRole("progressbar")).toBeVisible();
    await openPreparedHistory(page, locale);
    await navigate(page, "/settings", locale);
    await openPreparedCampaign(page, campaign, locale);
    await expect(rows).toHaveCount(3);
    await queue
      .getByRole("button", {
        name: t("Retry upload", "إعادة محاولة الرفع"),
        exact: true,
      })
      .click();
    await expect(
      queue.getByRole("button", {
        name: t("Retry submission", "إعادة محاولة الإرسال"),
        exact: true,
      }),
    ).toBeVisible();
    await openPreparedHistory(page, locale);
    await navigate(page, "/settings", locale);
    await openPreparedCampaign(page, campaign, locale);
    await expect(rows).toHaveCount(3);
    await page.evaluate(() => {
      const observed = { uploads: 0 };
      Object.assign(window, { b04ReceiptRetry: observed });
      new MutationObserver((records) => {
        for (const record of records)
          for (const node of record.addedNodes)
            if (
              node instanceof Element &&
              (node.matches("progress") || node.querySelector("progress"))
            )
              observed.uploads++;
      }).observe(document.body, { childList: true, subtree: true });
    });
    await queue
      .getByRole("button", {
        name: t("Retry submission", "إعادة محاولة الإرسال"),
        exact: true,
      })
      .press("Enter");
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(1);
    expect(
      await page.evaluate(
        () =>
          (window as unknown as { b04ReceiptRetry: { uploads: number } })
            .b04ReceiptRetry.uploads,
      ),
    ).toBe(0);
    await page
      .getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      })
      .click();
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(3);
    await expect(
      queue.getByText(t("Replacement candidate", "نسخة بديلة"), {
        exact: false,
      }),
    ).toHaveCount(0);
    await expect(rows).toHaveCount(0);
    await expect(page.locator("[data-request-id]")).toHaveCount(0);
    const requests = page.locator('[data-record-request^="sample-item-"]');
    await expect(requests).toHaveCount(3);
    const firstUploads = await page.evaluate(() => {
      const observed = (
        window as unknown as {
          b09FirstUploads: {
            files: string[];
            predecessors: string[];
            capture: boolean;
          };
        }
      ).b09FirstUploads;
      observed.capture = false;
      return { files: observed.files, predecessors: observed.predecessors };
    });
    expect(firstUploads.files.sort()).toEqual([
      "synthetic-diagram.png",
      "synthetic-handout.pdf",
      "synthetic-recording.wav",
    ]);
    expect(firstUploads.predecessors).toEqual([]);
    for (const size of ["100%", "200%"]) {
      await page.evaluate((value) => {
        document.documentElement.style.fontSize = value;
      }, size);
      await reviewExampleLayout(page);
      for (const request of await requests.all()) {
        await expect(request.locator("summary [data-status]")).toBeVisible();
        await expect(request.locator("summary [data-status]")).toHaveText(
          t("Received", "تم الاستلام"),
        );
      }
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`leader-request-status-${locale}.png`),
      fullPage: true,
    });
    const keys = await page.evaluate(
      () => (window as unknown as { b04Keys: string[] }).b04Keys,
    );
    expect(new Set(keys).size).toBe(3);
    expect(keys[0]).toBe(keys[1]);
    await openB09Upload(page, locale);
    await ensureB09Intake(page, locale);
    await page
      .getByRole("button", {
        name: t("Add approved reference", "إضافة المرجع المعتمد"),
        exact: true,
      })
      .click();
    const replacement = rows.last();
    await expect(
      replacement.getByText(t("Ready to upload", "جاهز للرفع"), {
        exact: true,
      }),
    ).toBeVisible();
    await expect(replacement).toContainText(
      t("Earlier submission", "الإرسال السابق"),
    );

    await expect(
      page.getByLabel(t("I have permission", "لدي صلاحية")),
    ).not.toBeChecked();
    await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
    await page
      .getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      })
      .click();
    await expect(replacement).toHaveAttribute("data-predecessor-id", "1");
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(3);
    await expect(rows).toHaveCount(0);
    await expect(
      page.getByRole("status").filter({
        hasText: t("needs a fresh campaign view", "يحتاج إلى تحديث عرض الحملة"),
      }),
    ).toHaveCount(0);
    expect(
      new Set(
        await page.evaluate(
          () => (window as unknown as { b04Keys: string[] }).b04Keys,
        ),
      ).size,
    ).toBe(4);
    await openPreparedHistory(page, locale);
    await expect(
      page.getByText("Synthetic study source", { exact: true }),
    ).toHaveCount(3);
    await navigate(page, "/settings", locale);
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
      .fill("leader@example.invalid");
    await page
      .getByLabel(t("Password", "كلمة المرور"), { exact: true })
      .fill("Synthetic-study-2026!");
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
    await openPreparedCampaign(page, campaign, locale);
    await expect(queue).toHaveCount(0);
    finish();
  });

  test(`merged B04 ${locale}: permanent categories have remedies and cannot retry individually or in bulk`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const remedies = [
      ["checksum", t("integrity check", "فحص السلامة")],
      ["duplicate", t("already recorded", "مسجل بالفعل")],
      ["oversize", t("smaller supported file", "ملفًا مدعومًا أصغر")],
      ["rights", t("permitted to share", "يُسمح لك بمشاركته")],
    ];
    for (const [fixture, remedy] of remedies) {
      await signIn(page, "leader", locale, `${campaign}?fixture=${fixture}`);
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
        .click();
      const queue = page.getByRole("list", {
        name: t("Upload queue", "قائمة الرفع"),
        exact: true,
      });
      await expect(queue).toContainText(remedy!);
      await expect(
        queue.getByRole("button", {
          name: t("Retry upload", "إعادة محاولة الرفع"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        }),
      ).toBeDisabled();
      await expect(queue.getByRole("textbox")).toBeDisabled();
      await expect(
        queue.getByRole("button", {
          name: t("Remove file", "حذف الملف") + ": synthetic-handout.pdf",
          exact: true,
        }),
      ).toBeVisible();
      if (fixture === "duplicate") {
        await queue
          .getByRole("link", {
            name: t("View recorded submission", "عرض الإرسال المسجل"),
            exact: true,
          })
          .press("Enter");
        await expect(page).toHaveURL(/#latest-submissions$/u);
        await expect(
          page.getByText("Recorded synthetic handout", { exact: true }),
        ).toBeVisible();
      }
      await reviewExampleLayout(page);
      expect(
        (
          await new AxeBuilder({ page })
            .include("main")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await signIn(page, "leader", locale, `${campaign}?fixture=offline`);
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
      .click();
    await expect(
      page.getByRole("button", {
        name: t("Retry upload", "إعادة محاولة الرفع"),
        exact: true,
      }),
    ).toBeVisible();
    finish();
  });

  test(`merged B04 ${locale}: named corrections bind the request, reason and previous submission`, async ({
    page,
  }, testInfo) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "leader", locale, `${campaign}?fixture=corrections`);
    await expect(
      page.getByRole("link", {
        name: t("Fix information", "تصحيح المعلومات"),
        exact: true,
      }),
    ).toBeVisible();
    const requests = page.locator("[data-request-id]");
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await expect(requests).toHaveCount(3);
      await expect(
        page.locator('[data-request-id="sample-item-1"]'),
      ).toContainText(t("Needs information", "يحتاج إلى معلومات"));
      await expect(
        page.locator('[data-request-id="sample-item-2"]'),
      ).toContainText(t("Needs a replacement", "يحتاج إلى استبدال"));
      await expect(
        page.locator('[data-request-id="sample-item-3"]'),
      ).toContainText(t("Awaiting file", "بانتظار ملف"));
      for (const request of await requests.all())
        await expect(request.locator("a,button")).toBeVisible();
    }
    await openPreparedHistory(page, locale);
    await expect(
      page.getByText("Earlier synthetic handout", { exact: true }),
    ).toBeVisible();
    const fix = page.getByRole("link", {
      name: t("Fix information", "تصحيح المعلومات"),
      exact: true,
    });
    await expect(fix).toHaveAttribute(
      "href",
      `${campaign}?request=sample-item-1&submission=-201&lang=${locale}#collection-intake`,
    );
    await fix.press("Enter");
    await expect(
      page.getByLabel(
        t("Professor or source description", "وصف الأستاذ أو المصدر"),
      ),
    ).toBeFocused();
    await page
      .getByLabel(t("Professor or source description", "وصف الأستاذ أو المصدر"))
      .fill(
        "Synthetic instructor prepared the complete Anatomy handout for revision.",
      );
    await page
      .locator('input[type="file"]')
      .setInputFiles("public/demo-files/synthetic-handout.pdf");
    const queue = page.getByRole("list", {
      name: t("Upload queue", "قائمة الرفع"),
      exact: true,
    });
    await expect(
      queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(
      new RegExp(`${campaign}\\?lang=${locale}#collection-intake$`, "u"),
    );
    await expect(queue).toContainText(
      t("Earlier submission", "الإرسال السابق"),
    );
    await expect(
      page.getByLabel(t("I have permission", "لدي صلاحية")),
    ).not.toBeChecked();

    await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
    await page
      .getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      })
      .click();
    await expect(queue.getByRole("listitem").first()).toHaveAttribute(
      "data-predecessor-id",
      "-201",
    );
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(1);

    await openPreparedHistory(page, locale);
    await expect(
      page.getByRole("link", {
        name: t("Fix information", "تصحيح المعلومات"),
        exact: true,
      }),
    ).toHaveCount(0);
    const replace = page.getByRole("link", {
      name: t("Replace file", "استبدال الملف"),
      exact: true,
    });
    await expect(replace).toHaveAttribute(
      "href",
      `${campaign}?request=sample-item-2&submission=-202&lang=${locale}#collection-intake`,
    );
    await replace.press("Enter");
    await expect(
      page.getByRole("button", {
        name: t("Choose files", "اختيار ملفات"),
        exact: true,
      }),
    ).toBeFocused();
    await ensureB09Intake(page, locale);
    await page
      .getByRole("button", {
        name: t("Add approved reference", "إضافة المرجع المعتمد"),
        exact: true,
      })
      .click();
    await expect(queue).toContainText(
      t("no longer matches", "لم يعد هذا التصحيح"),
    );
    await expect(
      page.getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      }),
    ).toBeDisabled();
    await expect(page).toHaveURL(/request=sample-item-2&submission=-202/u);
    await queue
      .getByRole("button", {
        name: t("Remove file", "حذف الملف") + ": synthetic-handout.pdf",
        exact: true,
      })
      .click();
    await page
      .locator('input[type="file"]')
      .setInputFiles("public/demo-files/synthetic-recording.wav");
    await expect(
      queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
    ).toHaveCount(1);

    await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
    await page
      .getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      })
      .click();
    await expect(queue.getByRole("listitem").last()).toHaveAttribute(
      "data-predecessor-id",
      "-202",
    );
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(2);

    await openPreparedHistory(page, locale);
    await expect(
      page.getByRole("link", {
        name: t("Replace file", "استبدال الملف"),
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Synthetic study source", { exact: true }),
    ).toHaveCount(2);
    await expect(page.getByRole("main")).not.toContainText(
      t("Contact your campaign administrator", "تواصل مع مسؤول الحملة"),
    );
    await reviewExampleLayout(page);
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`leader-corrections-${locale}.png`),
      fullPage: true,
    });
    for (const query of [
      "request=sample-item-1&submission=-201",
      "request=sample-history-1&submission=history-1",
      "request=other&submission=-202",
      "request=sample-item-2&request=sample-item-1&submission=-202",
    ]) {
      await openPreparedCampaign(page, campaign, locale);
      await page.evaluate(
        (href) => window.history.pushState(null, "", href),
        `${campaign}?${query}&lang=${locale}`,
      );
      await expect(
        page.getByRole("heading", {
          name: t("Correction unavailable", "التصحيح غير متاح"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.locator('input[type="file"]')).toHaveCount(0);
    }
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B03 finish ${locale}: setup draft, numbered progress, canonical review and comparable repeat`, async ({
    page,
  }, testInfo) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
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
      .getByLabel(t("Duration (minutes)", "المدة (بالدقائق)"), { exact: true })
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
      `${t("Question", "السؤال")} ${new Intl.NumberFormat(locale).format(6)} ${t("of", "من")} ${new Intl.NumberFormat(locale).format(6)}`,
    );
    await page.locator('input[name="sample-question-0"]').nth(0).check();
    await page.locator('input[name="sample-question-1"]').nth(1).check();
    await expect(page.locator("#quiz-submit-help")).toContainText(
      t("Answer every question", "أجب عن كل الأسئلة"),
    );
    await expect(page.locator("#quiz-submit-help bdi")).toHaveText(
      [3, 4, 5, 6]
        .map((n) => new Intl.NumberFormat(locale).format(n))
        .join(locale === "ar" ? "، " : ", "),
    );
    await expect(page.locator("#quiz-progress")).toContainText(
      `${new Intl.NumberFormat(locale).format(2)} / ${new Intl.NumberFormat(locale).format(6)}`,
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
    await reviewExampleLayout(page);
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`quiz-review-${locale}.png`),
      fullPage: true,
    });
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
      page.getByRole("radio", { name: t("Untimed", "دون توقيت"), exact: true }),
    ).toBeChecked();
    await page
      .getByRole("link", {
        name: t("Open sample attempt", "فتح المحاولة التجريبية"),
        exact: true,
      })
      .click();
    await expect(questions).toHaveCount(6);
    finish();
  });

  test(`merged B03 finish ${locale}: field-specific validation and draft isolation`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/quiz`);
    const count = page.getByLabel(t("Number of questions", "عدد الأسئلة"), {
      exact: true,
    });
    const start = page.getByRole("button", {
      name: t("Start quiz", "بدء الاختبار"),
      exact: true,
    });
    for (const value of ["0", "7", "2.5", ""]) {
      await count.fill(value);
      await expect(start).toBeDisabled();
      await expect(count).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#quiz-question-count-error")).toContainText(
        t("whole number of questions", "عددًا صحيحًا من الأسئلة"),
      );
      await expect(page.locator("#quiz-duration-error")).toHaveCount(0);
    }
    await count.fill("6");
    await page
      .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
      .check();
    const duration = page.getByLabel(
      t("Duration (minutes)", "المدة (بالدقائق)"),
      { exact: true },
    );
    for (const value of ["0", "241", ""]) {
      await duration.fill(value);
      await expect(start).toBeDisabled();
      await expect(page.locator("#quiz-duration-error")).toContainText(
        t("whole number of minutes", "عددًا صحيحًا من الدقائق"),
      );
      await expect(page.locator("#quiz-question-count-error")).toHaveCount(0);
    }
    await page
      .getByRole("radio", { name: t("Untimed", "دون توقيت"), exact: true })
      .check();
    await expect(start).toBeEnabled();
    await expect(page.locator("#quiz-duration-error")).toHaveCount(0);
    await count.fill("7");
    await navigate(page, `${unit}/studio`, locale);
    await navigate(page, `${unit}/quiz`, locale);
    await expect(count).toHaveValue("7");
    const changed = locale === "en" ? "ar" : "en";
    await page
      .getByRole("button", {
        name: changed === "ar" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(
      page.getByLabel(pick(changed, "Number of questions", "عدد الأسئلة"), {
        exact: true,
      }),
    ).toHaveValue("7");
    await page
      .locator("summary")
      .filter({ hasText: b07DetailsName(changed) })
      .click();
    const foreign = reviewCatalogRows.find(
      (row) =>
        row.cohort.id === unit.split("/")[2] &&
        row.unit.id !== unit.split("/")[3],
    )!;
    await page
      .getByRole("link", {
        name: changed === "ar" ? foreign.unit.nameAr : foreign.unit.nameEn,
        exact: true,
      })
      .click();
    await navigate(
      page,
      `/learn/${foreign.cohort.id}/${foreign.unit.id}/quiz`,
      changed,
    );
    await expect(
      page.getByLabel(pick(changed, "Number of questions", "عدد الأسئلة"), {
        exact: true,
      }),
    ).toHaveValue("2");
    for (const size of ["100%", "200%"]) {
      await page.evaluate((value) => {
        document.documentElement.style.fontSize = value;
      }, size);
      await reviewExampleLayout(page);
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await navigate(page, "/settings", changed);
    await page
      .getByRole("tab", {
        name: pick(changed, "Identity and access", "الهوية والوصول"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: pick(changed, "Sign out", "تسجيل الخروج"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/login\?/u);
    await page
      .getByLabel(pick(changed, "Email address", "البريد الإلكتروني"), {
        exact: true,
      })
      .fill("student@example.invalid");
    await page
      .getByLabel(pick(changed, "Password", "كلمة المرور"), { exact: true })
      .fill("Synthetic-study-2026!");
    await page
      .getByRole("button", {
        name: pick(changed, "Continue", "متابعة"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/consent\?/u);
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", {
        name: pick(
          changed,
          "Accept all and continue to UniMind",
          "الموافقة والمتابعة إلى UniMind",
        ),
        exact: true,
      })
      .click();
    const row = reviewCatalogRows.find(
      (row) => row.unit.id === unit.split("/")[3],
    )!;
    for (const field of [
      row.stage,
      row.institution,
      row.program,
      row.level,
      row.term,
    ]) {
      await page
        .getByRole("radio", {
          name: changed === "ar" ? field.nameAr : field.nameEn,
          exact: true,
        })
        .check();
      await page
        .getByRole("button", {
          name:
            changed === "ar"
              ? /^(متابعة|مراجعة الاختيارات)$/u
              : /^(Continue|Review choices)$/u,
        })
        .click();
    }
    await page
      .getByRole("button", {
        name: pick(changed, "Open Study Shelf", "فتح رف المذاكرة"),
        exact: true,
      })
      .click();
    await page
      .locator(`a[href="/learn?view=subjects&lang=${changed}"]`)
      .filter({ visible: true })
      .first()
      .click();
    await page
      .getByRole("link", {
        name: pick(changed, "Open Anatomy", "فتح علم التشريح"),
        exact: true,
      })
      .click();
    await navigate(page, `${unit}/quiz`, changed);
    await expect(
      page.getByLabel(pick(changed, "Number of questions", "عدد الأسئلة"), {
        exact: true,
      }),
    ).toHaveValue("2");
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  for (const outcome of ["zero", "mixed", "correct"] as const) {
    test(`merged B03 M28 ${locale}: six-question ${outcome} review names each correction`, async ({
      page,
    }, testInfo) => {
      const finish = isolation(page);
      const t = (en: string, ar: string) => pick(locale, en, ar);
      await signIn(page, "student", locale, `${unit}/quiz`);
      await page
        .getByLabel(t("Number of questions", "عدد الأسئلة"), { exact: true })
        .fill("6");
      await page
        .getByRole("radio", { name: t("Easy", "سهل"), exact: true })
        .check();
      await page
        .getByRole("button", {
          name: t("Start quiz", "بدء الاختبار"),
          exact: true,
        })
        .click();
      await expect(
        page.locator('input[name="sample-question-0"]').first(),
      ).toBeVisible();
      const correct = [0, 1, 1, 0, 0, 1];
      const selected = correct.map((value, index) =>
        outcome === "zero" || (outcome === "mixed" && index % 2 === 0)
          ? 1 - value
          : value,
      );
      for (let index = 0; index < 6; index++)
        await page
          .locator(`input[name="sample-question-${index}"]`)
          .nth(selected[index]!)
          .check();
      await page
        .getByRole("button", {
          name: t("Submit answers", "تسليم الإجابات"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("link", {
          name: t("Browse material library", "تصفح مكتبة المصادر"),
          exact: true,
        }),
      ).toHaveAttribute("href", /from=quiz-review/u);
      const expected = outcome === "zero" ? 0 : outcome === "mixed" ? 3 : 6;
      const groups = page.locator(
        'fieldset:has(input[name^="sample-question-"])',
      );
      for (const theme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme: theme });
        await expect(page.getByRole("main")).toContainText(
          `${new Intl.NumberFormat(locale).format(expected)} / ${new Intl.NumberFormat(locale).format(6)}`,
        );
        await expect(
          groups
            .locator("strong")
            .filter({ hasText: new RegExp(`^${t("Correct", "صحيحة")}$`, "u") }),
        ).toHaveCount(expected);
        await expect(
          groups.locator("strong").filter({
            hasText: new RegExp(`^${t("Incorrect", "غير صحيحة")}$`, "u"),
          }),
        ).toHaveCount(6 - expected);
        for (let index = 0; index < 6; index++) {
          await expect(groups.nth(index)).toContainText(
            t("Your answer", "إجابتك"),
          );
          await expect(groups.nth(index)).toContainText(
            t("Correct answer", "الإجابة الصحيحة"),
          );
          await expect(
            groups.nth(index).locator("input").nth(selected[index]!),
          ).toBeChecked();
          await expect(
            groups.nth(index).locator("input").first(),
          ).toBeDisabled();
        }
      }
      await reviewExampleLayout(page);
      expect(
        (
          await new AxeBuilder({ page })
            .include("main")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`review-${locale}-${outcome}.png`),
        fullPage: true,
      });
      finish();
    });
  }
  for (const answered of [0, 2, 6]) {
    test(`merged B03 M27 ${locale}: expiry preserves ${answered} of six answers as unscored review`, async ({
      page,
    }, testInfo) => {
      const finish = isolation(page);
      const t = (en: string, ar: string) => pick(locale, en, ar);
      await signIn(page, "student", locale, `${unit}/quiz`);
      await page
        .getByLabel(t("Number of questions", "عدد الأسئلة"), { exact: true })
        .fill("6");
      await page
        .getByRole("radio", { name: t("Easy", "سهل"), exact: true })
        .check();
      await page
        .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
        .check();
      await page
        .getByLabel(t("Duration (minutes)", "المدة (بالدقائق)"), {
          exact: true,
        })
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
      for (let index = 0; index < answered; index++)
        await page
          .locator(`input[name="sample-question-${index}"]`)
          .nth(index === 1 ? 0 : [0, 1, 1, 0, 0, 1][index]!)
          .check();
      if (answered === 2) {
        await page
          .getByRole("link", {
            name: t("Browse material library", "تصفح مكتبة المصادر"),
            exact: true,
          })
          .click();
        await expect(
          page.getByRole("link", {
            name: t("Return to quiz attempt", "العودة إلى محاولة الاختبار"),
            exact: true,
          }),
        ).toBeVisible();
        await page.clock.fastForward(61_000);
        await page
          .getByRole("link", {
            name: t("Return to quiz attempt", "العودة إلى محاولة الاختبار"),
            exact: true,
          })
          .press("Enter");
      } else await page.clock.fastForward(61_000);
      await expect(
        page.getByRole("heading", {
          name: t("Expired quiz review", "مراجعة الاختبار المنتهي"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.getByRole("main")).toContainText(
        `${t("Answered", "تمت الإجابة")}: ${new Intl.NumberFormat(locale).format(answered)} / ${new Intl.NumberFormat(locale).format(6)}`,
      );
      await expect(page.getByRole("main")).toContainText(
        `${t("Unanswered", "دون إجابة")}: ${new Intl.NumberFormat(locale).format(6 - answered)}`,
      );
      const radios = page.locator('input[name^="sample-question-"]');
      await expect(radios).toHaveCount(12);
      await expect(
        page.locator('input[name^="sample-question-"]:checked'),
      ).toHaveCount(answered);
      for (const radio of await radios.all())
        await expect(radio).toBeDisabled();
      await expect(
        page.getByRole("button", {
          name: t("Submit answers", "تسليم الإجابات"),
          exact: true,
        }),
      ).toHaveCount(0);
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
      if (answered === 2) {
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
        const key = new URL(
          (await back.getAttribute("href"))!,
          page.url(),
        ).searchParams.get("attempt");
        await back.press("Enter");
        await navigate(page, "/settings", locale);
        const settingsBack = page.getByRole("link", {
          name: t(
            "Return to quiz review · Anatomy",
            "العودة إلى مراجعة الاختبار · علم التشريح",
          ),
          exact: true,
        });
        expect(
          new URL(
            (await settingsBack.getAttribute("href"))!,
            page.url(),
          ).searchParams.get("attempt"),
        ).toBe(key);
        await settingsBack.press("Enter");
        await expect(
          page.getByRole("heading", {
            name: t("Expired quiz review", "مراجعة الاختبار المنتهي"),
            exact: true,
          }),
        ).toBeVisible();
        await page.clock.resume();
        const changed = locale === "en" ? "ar" : "en";
        await page
          .getByRole("button", {
            name: changed === "ar" ? "العربية" : "English",
            exact: true,
          })
          .click();
        await expect(
          page.getByRole("heading", {
            name: pick(
              changed,
              "Expired quiz review",
              "مراجعة الاختبار المنتهي",
            ),
            exact: true,
          }),
        ).toBeVisible();
        await expect(
          page.locator('input[name="sample-question-0"]').nth(0),
        ).toBeChecked();
        await expect(
          page.locator('input[name="sample-question-1"]').nth(0),
        ).toBeChecked();
        await page
          .getByRole("button", {
            name: locale === "ar" ? "العربية" : "English",
            exact: true,
          })
          .click();
        await expect(
          page.getByRole("heading", {
            name: t("Expired quiz review", "مراجعة الاختبار المنتهي"),
            exact: true,
          }),
        ).toBeVisible();
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
        await reviewExampleLayout(page);
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "";
        });
      }
      if (answered !== 2) await page.clock.resume();
      await reviewExampleLayout(page);
      expect(
        (
          await new AxeBuilder({ page })
            .include("main")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`expired-${locale}-${answered}.png`),
        fullPage: true,
      });
      await page
        .getByRole("link", {
          name: t("Back to quiz", "العودة للاختبار"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("link", {
          name: t("Review expired attempt", "مراجعة المحاولة المنتهية"),
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: t("Start new attempt", "بدء محاولة جديدة"),
          exact: true,
        })
        .click();
      await expect(
        page.locator('input[name="sample-question-0"]').first(),
      ).toBeEnabled();
      await expect(
        page.locator('input[name^="sample-question-"]:checked'),
      ).toHaveCount(0);
      finish();
    });
  }
}

for (const role of ["admin", "second-admin"]) {
  test(`merged B02 M75 ${role}: existing permitted study returns remain available in Account`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, role, "en", `${unit}/studio`);
    await expect(
      page.getByRole("button", { name: "Generate", exact: true }),
    ).toBeVisible();
    await navigate(page, "/settings");
    const back = page.getByRole("link", {
      name: "Return to Studio · Anatomy",
      exact: true,
    });
    await expect(back).toHaveAttribute("href", `${unit}/studio?lang=en`);
    await back.press("Enter");
    await expect(
      page.getByRole("button", { name: "Generate", exact: true }),
    ).toBeVisible();
    finish();
  });
}
test("merged B02 M75 leader: denied study route cannot create a Settings return", async ({
  page,
}) => {
  const finish = isolation(page);
  await signIn(page, "leader", "en", `${unit}/quiz`);
  await expect(page.getByRole("main")).toContainText("available");
  await expect(
    page.getByRole("button", { name: "Start quiz", exact: true }),
  ).toHaveCount(0);
  await navigate(page, "/settings");
  await expect(
    page.getByRole("heading", { name: "Account", level: 1, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /^Return to (Chat|Studio|Quiz|quiz)/u }),
  ).toHaveCount(0);
  finish();
});

async function reviewExampleLayout(page: Page) {
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
}

async function openPreparedCampaign(page: Page, path: string, locale: Locale) {
  await navigate(page, "/batch-leader", locale);
  await expect(
    page
      .locator(`a[href="${path}?lang=${locale}"]`)
      .filter({ visible: true })
      .first(),
  ).toBeVisible();
  await navigate(page, path, locale);
  await expect(page).toHaveURL(new RegExp(`${path}\\?lang=${locale}$`, "u"));
  await ensureB09Intake(page, locale);
}
async function openPreparedHistory(page: Page, locale: Locale) {
  await page
    .locator(`a[href="/batch-leader?view=history&lang=${locale}"]`)
    .filter({ visible: true })
    .first()
    .click();
}

async function selectStudioExample(
  page: Page,
  locale: Locale,
  options: {
    type: string;
    language: string;
    topic: string;
    depth: string;
    size: string;
  },
) {
  const t = (en: string, ar: string) => pick(locale, en, ar);
  const disclosure = page.locator("details").filter({
    has: page
      .locator("summary")
      .filter({ hasText: t("Depth and size", "التفصيل والحجم") }),
  });
  if ((await disclosure.getAttribute("open")) === null)
    await disclosure.locator("summary").click();
  for (const [label, value] of [
    [t("Artifact type", "نوع المخرج"), options.type],
    [t("Output language", "لغة المخرج"), options.language],
    [t("Study focus", "محور المذاكرة"), options.topic],
    [t("Depth", "التفصيل"), options.depth],
    [t("Size", "الحجم"), options.size],
  ])
    await page.getByLabel(label!, { exact: true }).selectOption(value!);
}
async function generateStudioExample(page: Page, locale: Locale) {
  const generate = page.getByRole("button", {
    name: pick(locale, "Generate", "إنشاء"),
    exact: true,
  });
  await generate.press("Enter");
  await expect(generate).toBeEnabled({ timeout: 5_000 });
  const heading = page.getByRole("heading", {
    name: new RegExp(pick(locale, "Simulated artifact", "مخرج محاكى"), "u"),
  });
  await expect(heading).toBeVisible();
  await expect(heading).toBeFocused();
  return heading.locator("..");
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B02 M75 ${locale}: Settings returns to the actual quiz attempt and review`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/studio`);
    await navigate(page, `${unit}/quiz`, locale);
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await page.locator('input[name="sample-question-0"]').nth(0).check();
    await navigate(page, "/settings", locale);
    await expect(
      page.getByRole("heading", {
        name: t("Settings", "الإعدادات"),
        level: 1,
        exact: true,
      }),
    ).toBeVisible();
    const back = page.getByRole("link", {
      name: t(
        "Return to quiz attempt · Anatomy",
        "العودة إلى محاولة الاختبار · علم التشريح",
      ),
      exact: true,
    });
    await expect(back).toBeVisible();
    await expect(back).toHaveAttribute(
      "href",
      /\/quiz\/sample-attempt\?attempt=/u,
    );
    const key = new URL(
      (await back.getAttribute("href"))!,
      page.url(),
    ).searchParams.get("attempt");
    for (const size of ["100%", "200%"]) {
      await page.evaluate((value) => {
        document.documentElement.style.fontSize = value;
      }, size);
      await reviewExampleLayout(page);
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    const changed = locale === "en" ? "ar" : "en";
    await page
      .getByRole("button", {
        name: changed === "ar" ? "العربية" : "English",
        exact: true,
      })
      .click();
    const changedBack = page.getByRole("link", {
      name: pick(
        changed,
        "Return to quiz attempt · Anatomy",
        "العودة إلى محاولة الاختبار · علم التشريح",
      ),
      exact: true,
    });
    await expect(changedBack).toBeVisible();
    expect(
      new URL(
        (await changedBack.getAttribute("href"))!,
        page.url(),
      ).searchParams.get("attempt"),
    ).toBe(key);
    await changedBack.press("Enter");
    await expect(
      page.locator('input[name="sample-question-0"]').nth(0),
    ).toBeChecked();
    await expect(
      page.locator('input[name="sample-question-1"]:checked'),
    ).toHaveCount(0);
    await page.locator('input[name="sample-question-1"]').nth(1).check();
    await page
      .getByRole("button", {
        name: pick(changed, "Submit answers", "تسليم الإجابات"),
        exact: true,
      })
      .press("Enter");
    await expect(
      page.getByRole("link", {
        name: pick(changed, "Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      }),
    ).toHaveAttribute("href", /from=quiz-review/u);
    const score = await page.getByRole("status").innerText();
    await navigate(page, "/settings", changed);
    const reviewBack = page.getByRole("link", {
      name: pick(
        changed,
        "Return to quiz review · Anatomy",
        "العودة إلى مراجعة الاختبار · علم التشريح",
      ),
      exact: true,
    });
    await expect(reviewBack).toBeVisible();
    await expect(reviewBack).toHaveAttribute(
      "href",
      /\/sample-attempt\/review\?attempt=/u,
    );
    await reviewBack.press("Enter");
    await expect(page.getByRole("status")).toHaveText(score);
    await expect(
      page.locator('input[name="sample-question-0"]').nth(0),
    ).toBeChecked();
    await expect(
      page.locator('input[name="sample-question-1"]').nth(1),
    ).toBeDisabled();
    finish();
  });

  test(`merged B02 M75 ${locale}: Settings detours consume the original quiz timer`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/quiz`);
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
    await page.locator('input[name="sample-question-0"]').nth(0).check();
    await navigate(page, "/settings", locale);
    const back = page.getByRole("link", {
      name: t(
        "Return to quiz attempt · Anatomy",
        "العودة إلى محاولة الاختبار · علم التشريح",
      ),
      exact: true,
    });
    await expect(back).toBeVisible();
    await page.clock.fastForward(30_000);
    await back.press("Enter");
    await expect(page.getByRole("timer")).toContainText(
      new Intl.NumberFormat(locale).format(30),
    );
    await expect(
      page.locator('input[name="sample-question-0"]').nth(0),
    ).toBeChecked();
    await navigate(page, "/settings", locale);
    await expect(back).toBeVisible();
    await page.clock.fastForward(31_000);
    await back.press("Enter");
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      t("expired", "انتهى"),
    );
    await expect(page.locator('input[name^="sample-question-"]')).toHaveCount(
      4,
    );
    await expect(
      page.locator('input[name="sample-question-0"]').nth(0),
    ).toBeChecked();
    for (const radio of await page
      .locator('input[name^="sample-question-"]')
      .all())
      await expect(radio).toBeDisabled();
    await expect(page.getByRole("main")).not.toContainText(
      t("Simulated score", "نتيجة محاكاة"),
    );
    finish();
  });

  test(`merged B02 M75 ${locale}: invalid and foreign attempts never replace the recent quiz`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/quiz`);
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await page.locator('input[name="sample-question-0"]').nth(0).check();
    await navigate(page, "/settings", locale);
    const first = page.getByRole("link", {
      name: t(
        "Return to quiz attempt · Anatomy",
        "العودة إلى محاولة الاختبار · علم التشريح",
      ),
      exact: true,
    });
    await expect(first).toBeVisible();
    const firstKey = new URL(
      (await first.getAttribute("href"))!,
      page.url(),
    ).searchParams.get("attempt")!;
    await first.click();
    await page
      .locator("summary")
      .filter({ hasText: b07DetailsName(locale) })
      .click();
    const foreign = reviewCatalogRows.find(
      (row) =>
        row.cohort.id === unit.split("/")[2] &&
        row.unit.id !== unit.split("/")[3],
    )!;
    const name = locale === "ar" ? foreign.unit.nameAr : foreign.unit.nameEn;
    const path = `/learn/${foreign.cohort.id}/${foreign.unit.id}`;
    await page.getByRole("link", { name, exact: true }).click();
    await navigate(page, `${path}/quiz`, locale);
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await expect(
      page.locator('input[name^="sample-question-"]:checked'),
    ).toHaveCount(0);
    await page.locator('input[name="sample-question-1"]').nth(1).check();
    await navigate(page, "/settings", locale);
    const back = page.getByRole("link", {
      name: `${t("Return to quiz attempt", "العودة إلى محاولة الاختبار")} · ${name}`,
      exact: true,
    });
    await expect(back).toBeVisible();
    const href = (await back.getAttribute("href"))!;
    const secondKey = new URL(href, page.url()).searchParams.get("attempt");
    expect(secondKey).not.toBe(firstKey);
    await back.click();
    await expect(
      page.locator('input[name="sample-question-1"]').nth(1),
    ).toBeChecked();
    await expect(
      page.locator('input[name="sample-question-0"]:checked'),
    ).toHaveCount(0);
    await page.evaluate(
      (value) => window.history.pushState(null, "", value),
      `${path}/quiz/sample-attempt?attempt=${firstKey}&lang=${locale}`,
    );
    await expect(
      page.getByRole("link", {
        name: t("Open Quiz", "فتح الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    await navigate(page, "/settings", locale);
    await expect(back).toHaveAttribute("href", href);
    await back.press("Enter");
    await expect(
      page.locator('input[name="sample-question-1"]').nth(1),
    ).toBeChecked();
    await page
      .getByRole("link", {
        name: t("Back to quiz", "العودة للاختبار"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: t("Start new attempt", "بدء محاولة جديدة"),
        exact: true,
      })
      .click();
    await page
      .locator('input[name="sample-question-0"]')
      .first()
      .waitFor({ state: "visible" });
    await page.evaluate(
      (value) => window.history.pushState(null, "", value),
      href,
    );
    await expect(
      page.getByRole("link", {
        name: t("Open Quiz", "فتح الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    await navigate(page, "/settings", locale);
    await expect(back).toBeVisible();
    expect(
      new URL((await back.getAttribute("href"))!, page.url()).searchParams.get(
        "attempt",
      ),
    ).not.toBe(secondKey);
    await back.press("Enter");
    await expect(
      page.locator('input[name^="sample-question-"]:checked'),
    ).toHaveCount(0);
    await navigate(page, "/settings", locale);
    await page.reload();
    await expect(
      page.getByLabel(t("Email address", "البريد الإلكتروني"), { exact: true }),
    ).toBeVisible();
    finish();
  });

  test(`merged B02 M75 ${locale}: Quiz setup and named synthetic Shelf resume keep the same route`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale);
    const row = reviewCatalogRows.find(
      (row) => row.unit.id === unit.split("/")[3],
    )!;
    for (const field of [
      row.stage,
      row.institution,
      row.program,
      row.level,
      row.term,
    ]) {
      await page
        .getByRole("radio", {
          name: locale === "ar" ? field.nameAr : field.nameEn,
          exact: true,
        })
        .check();
      await page
        .getByRole("button", {
          name:
            locale === "ar"
              ? /^(متابعة|مراجعة الاختيارات)$/u
              : /^(Continue|Review choices)$/u,
        })
        .click();
    }
    await page
      .getByRole("button", {
        name: t("Open Study Shelf", "فتح رف المذاكرة"),
        exact: true,
      })
      .click();
    await page
      .locator(`a[href="/learn?view=subjects&lang=${locale}"]`)
      .filter({ visible: true })
      .first()
      .click();
    await page
      .getByRole("link", {
        name: t("Open Anatomy", "فتح علم التشريح"),
        exact: true,
      })
      .click();
    await navigate(page, `${unit}/quiz`, locale);
    await expect(
      page.getByRole("heading", {
        name: t("Set up your quiz", "إعداد الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    await navigate(page, "/settings", locale);
    const setup = page.getByRole("link", {
      name: t("Return to Quiz · Anatomy", "العودة إلى الاختبار · علم التشريح"),
      exact: true,
    });
    await expect(setup).toHaveAttribute("href", `${unit}/quiz?lang=${locale}`);
    await setup.press("Enter");
    await expect(
      page.getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await page.locator('input[name="sample-question-0"]').nth(0).check();
    await navigate(page, "/learn", locale);
    await expect(
      page.getByRole("heading", {
        name: t("Anatomy · Quiz", "علم التشريح · الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByRole("main")).not.toContainText(
      t("last Chat or Studio", "آخر مساحة محادثة أو استوديو"),
    );
    const resume = page.getByRole("link", {
      name: t("Resume Anatomy", "متابعة علم التشريح"),
      exact: true,
    });
    await expect(resume).toHaveAttribute("href", /\/sample-attempt\?attempt=/u);
    await resume.press("Enter");
    await expect(
      page.locator('input[name="sample-question-0"]').nth(0),
    ).toBeChecked();
    finish();
  });

  test(`merged B02 M64 ${locale}: submitted review and replacement returns stay exact`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/quiz`);
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
    await expect(page.locator("fieldset")).toHaveCount(2);
    await page.locator('input[name="sample-question-0"]').nth(0).check();
    await page.locator('input[name="sample-question-1"]').nth(1).check();
    await page
      .getByRole("button", {
        name: t("Submit answers", "تسليم الإجابات"),
        exact: true,
      })
      .press("Enter");
    await expect(page).toHaveURL(/\/sample-attempt\/review/u);
    await expect(
      page.locator('input[name="sample-question-0"]').first(),
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
    const oldSource = new URL(page.url());
    const oldReturn = (await back.getAttribute("href"))!;
    await page.clock.fastForward(61_000);
    await back.press("Enter");
    await expect(page).toHaveURL(/\/sample-attempt\/review\?attempt=/u);
    await expect(page.getByRole("status")).toHaveText(score);
    await expect(
      page.locator('input[name="sample-question-0"]').nth(0),
    ).toBeChecked();
    await expect(
      page.locator('input[name="sample-question-1"]').last(),
    ).toBeDisabled();
    await page
      .getByRole("link", {
        name: t("Back to quiz", "العودة للاختبار"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: t("Start new attempt", "بدء محاولة جديدة"),
        exact: true,
      })
      .click();
    await expect(page.locator("fieldset")).toHaveCount(2);
    await expect(
      page.locator('input[name^="sample-question-"]:checked'),
    ).toHaveCount(0);
    await page
      .getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("link", {
        name: t("Return to quiz attempt", "العودة إلى محاولة الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    expect(new URL(page.url()).searchParams.get("attempt")).not.toBe(
      oldSource.searchParams.get("attempt"),
    );
    await page.evaluate(
      (href) => window.history.pushState(null, "", href),
      oldSource.pathname + oldSource.search,
    );
    await expect(
      page.getByRole("link", {
        name: t("Open Quiz", "فتح الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: t("Return to quiz review", "العودة إلى مراجعة الاختبار"),
        exact: true,
      }),
    ).toHaveCount(0);
    await page
      .getByRole("link", { name: t("Open Quiz", "فتح الاختبار"), exact: true })
      .click();
    await page
      .getByRole("link", {
        name: t("Open sample attempt", "فتح المحاولة التجريبية"),
        exact: true,
      })
      .click();
    await expect(
      page.locator('input[name="sample-question-0"]').first(),
    ).toBeVisible();
    await page.evaluate(
      (href) => window.history.pushState(null, "", href),
      oldReturn.replace("/review?", "?"),
    );
    await expect(
      page.getByRole("link", {
        name: t("Open Quiz", "فتح الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator('input[name^="sample-question-"]')).toHaveCount(
      0,
    );
    finish();
  });

  test(`merged B02 M64 ${locale}: source detours consume the original timer and expire without editable answers`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/quiz`);
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
    await page.locator('input[name="sample-question-0"]').nth(0).check();
    await page
      .getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      })
      .click();
    const back = page.getByRole("link", {
      name: t("Return to quiz attempt", "العودة إلى محاولة الاختبار"),
      exact: true,
    });
    await expect(back).toBeVisible();
    await page.clock.fastForward(30_000);
    await back.press("Enter");
    await expect(page.getByRole("timer")).toContainText(
      new Intl.NumberFormat(locale).format(30),
    );
    await expect(
      page.locator('input[name="sample-question-0"]').nth(0),
    ).toBeChecked();
    await page
      .getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      })
      .click();
    await expect(back).toBeVisible();
    await page.clock.fastForward(31_000);
    await back.press("Enter");
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      t("expired", "انتهى"),
    );
    await expect(page.locator('input[name^="sample-question-"]')).toHaveCount(
      4,
    );
    await expect(
      page.locator('input[name="sample-question-0"]').nth(0),
    ).toBeChecked();
    for (const radio of await page
      .locator('input[name^="sample-question-"]')
      .all())
      await expect(radio).toBeDisabled();
    await expect(
      page.getByRole("button", {
        name: t("Submit answers", "تسليم الإجابات"),
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(page.getByRole("main")).not.toContainText(
      t("Simulated score", "نتيجة محاكاة"),
    );
    finish();
  });

  test(`merged B02 M64 ${locale}: ambiguous unknown missing and foreign source targets cannot guess a quiz`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/chat`);
    await send(page, "supported", locale);
    const chatTarget = new URL(
      (await page
        .getByRole("link", {
          name: t("Report example", "الإبلاغ عن المثال"),
          exact: true,
        })
        .getAttribute("href"))!,
      page.url(),
    ).searchParams;
    const chatQuery = `session=${chatTarget.get("session")}&exchange=${chatTarget.get("exchange")}`;
    await navigate(page, `${unit}/quiz`, locale);
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await expect(page.locator("fieldset")).toHaveCount(2);
    await page
      .getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("link", {
        name: t("Return to quiz attempt", "العودة إلى محاولة الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    const original = new URL(page.url());
    const key = original.searchParams.get("attempt")!;
    for (const query of [
      `attempt=${key}`,
      `attempt=${key}&${chatQuery}`,
      `from=chat&attempt=${key}&${chatQuery}`,
      `from=studio&attempt=${key}`,
      "from=quiz-attempt",
      "from=quiz-attempt&attempt=unknown",
      `from=quiz-attempt&attempt=${key}&attempt=${key}`,
      `from=quiz-attempt&from=quiz-attempt&attempt=${key}`,
      `from=quiz-unknown&attempt=${key}`,
      `from=quiz-review&attempt=${key}`,
    ]) {
      await page.evaluate(
        (href) => window.history.pushState(null, "", href),
        `${unit}/sources?${query}&lang=${locale}`,
      );
      await expect(
        page.getByRole("link", {
          name: t("Open Quiz", "فتح الاختبار"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", {
          name: t("Return to quiz attempt", "العودة إلى محاولة الاختبار"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("link", {
          name: t("Report selected exchange", "الإبلاغ عن المحادثة المختارة"),
          exact: true,
        }),
      ).toHaveCount(0);
    }
    await reviewExampleLayout(page);
    await page
      .getByRole("link", {
        name: t("Open Quiz", "فتح الاختبار"),
        exact: true,
      })
      .press("Enter");
    await expect(page).toHaveURL(new RegExp(`${unit}/quiz\\?`, "u"));
    await expect(
      page.getByRole("button", {
        name: t("Start new attempt", "بدء محاولة جديدة"),
        exact: true,
      }),
    ).toBeVisible();
    const foreign = reviewCatalogRows.find(
      (row) =>
        row.cohort.id === unit.split("/")[2] &&
        `/learn/${row.cohort.id}/${row.unit.id}` !== unit,
    )!;
    const foreignPath = `/learn/${foreign.cohort.id}/${foreign.unit.id}`;
    await page
      .locator("summary")
      .filter({ hasText: b07DetailsName(locale) })
      .click();
    await page
      .getByRole("link", {
        name: locale === "ar" ? foreign.unit.nameAr : foreign.unit.nameEn,
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: locale === "ar" ? foreign.unit.nameAr : foreign.unit.nameEn,
        exact: true,
      }),
    ).toBeVisible();
    await navigate(page, `${foreignPath}/quiz`, locale);
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await expect(page.locator("fieldset")).toHaveCount(2);
    await page
      .getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("link", {
        name: t("Return to quiz attempt", "العودة إلى محاولة الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    await page.evaluate(
      (href) => window.history.pushState(null, "", href),
      `${foreignPath}/sources?from=quiz-attempt&attempt=${key}&lang=${locale}`,
    );
    await expect(
      page.getByRole("link", {
        name: t("Open Quiz", "فتح الاختبار"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: t("Return to quiz attempt", "العودة إلى محاولة الاختبار"),
        exact: true,
      }),
    ).toHaveCount(0);
    await page.reload();
    await expect(
      page.getByLabel(t("Email address", "البريد الإلكتروني"), { exact: true }),
    ).toBeVisible();
    finish();
  });

  test(`merged B02 M64 ${locale}: partial attempt returns from sources with its selections and locale`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/chat`);
    await send(page, "supported", locale);
    await navigate(page, `${unit}/quiz`, locale);
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
      .press("Enter");
    await expect(page.getByRole("article")).toHaveCount(8);
    const original = page.getByRole("link", {
      name: t("Return to quiz attempt", "العودة إلى محاولة الاختبار"),
      exact: true,
    });
    await expect(original).toBeVisible();
    await expect(original).toHaveAttribute(
      "href",
      /\/quiz\/sample-attempt\?attempt=/u,
    );
    await reviewExampleLayout(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(
      page.getByRole("link", {
        name: t("Report selected exchange", "الإبلاغ عن المحادثة المختارة"),
        exact: true,
      }),
    ).toHaveCount(0);
    const changed = locale === "en" ? "ar" : "en";
    await page
      .getByRole("button", {
        name: changed === "ar" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(page.getByRole("main")).toHaveAttribute("lang", changed);
    await page
      .getByRole("link", {
        name: pick(
          changed,
          "Return to quiz attempt",
          "العودة إلى محاولة الاختبار",
        ),
        exact: true,
      })
      .press("Enter");
    await expect(page.locator("fieldset")).toHaveCount(2);
    await expect(
      page.locator('input[name="sample-question-0"]').nth(0),
    ).toBeChecked();
    await expect(
      page.locator('input[name="sample-question-1"]:checked'),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: pick(changed, "Submit answers", "تسليم الإجابات"),
        exact: true,
      }),
    ).toBeDisabled();
    await reviewExampleLayout(page);
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

  test(`merged B02 M15 ${locale}: Studio source library never offers an old Chat report`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/chat`);
    await send(page, "supported", locale);
    await navigate(page, `${unit}/studio`, locale);
    await selectStudioExample(page, locale, {
      type: "practice",
      topic: "comparison",
      language: "mixed",
      depth: "detailed",
      size: "extended",
    });
    const artifact = await generateStudioExample(page, locale);
    const original = await artifact.locator(":scope > div[lang]").innerText();
    await page
      .getByRole("link", {
        name: b07SourcesName(locale),
        exact: true,
      })
      .press("Enter");
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
    await expect(artifact.locator(":scope > div[lang]")).toHaveText(original, {
      useInnerText: true,
    });
    await expect(
      page.getByLabel(t("Output language", "لغة المخرج"), { exact: true }),
    ).toHaveValue("mixed");
    await navigate(page, unit, locale);
    await expect(
      page.getByRole("link", {
        name: t("Report selected exchange", "الإبلاغ عن المحادثة المختارة"),
        exact: true,
      }),
    ).toHaveCount(0);
    await navigate(page, `${unit}/quiz`, locale);
    await page
      .getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", {
        name: t("Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("link", {
        name: t("Report selected exchange", "الإبلاغ عن المحادثة المختارة"),
        exact: true,
      }),
    ).toHaveCount(0);
    finish();
  });

  test(`merged B02 M15 ${locale}: explicit Chat targets retain locale and reset confirmation for another answer`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/chat`);
    await send(page, "supported", locale);
    await send(page, "conflict", locale);
    await page
      .getByRole("link", {
        name: t("Inspect evidence", "فحص الأدلة"),
        exact: true,
      })
      .first()
      .click();
    await expect(page.getByRole("main")).toContainText(
      answerExamples.supported[locale === "ar" ? 1 : 0],
    );
    await page
      .getByRole("link", {
        name: t("Report selected exchange", "الإبلاغ عن المحادثة المختارة"),
        exact: true,
      })
      .press("Enter");
    await expect(page).toHaveURL(/report\?exchange=1&session=1/u);
    const submit = () =>
      page.getByRole("button", {
        name: t("Submit report", "إرسال البلاغ"),
        exact: true,
      });
    await expect(submit()).toBeDisabled();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", {
        name: locale === "en" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(page.getByRole("main")).toHaveAttribute(
      "lang",
      locale === "en" ? "ar" : "en",
    );
    await expect(page.getByRole("checkbox")).toBeChecked();
    await page
      .getByRole("button", {
        name: locale === "en" ? "English" : "العربية",
        exact: true,
      })
      .click();
    await expect(page.getByRole("main")).toHaveAttribute("lang", locale);
    await expect(page.getByRole("checkbox")).toBeChecked();
    await page.evaluate(
      (href) => window.history.pushState(null, "", href),
      `${unit}/report?session=1&exchange=2&lang=${locale}`,
    );
    await expect(page.getByRole("main")).toContainText(
      answerExamples.conflict[locale === "ar" ? 1 : 0],
    );
    await expect(page.getByRole("checkbox")).not.toBeChecked();
    await expect(submit()).toBeDisabled();
    await page.getByRole("checkbox").check();
    await submit().press("Enter");
    await expect(submit()).toBeDisabled();
    await page
      .getByRole("link", {
        name: t("Back to Chat", "العودة للمحادثة"),
        exact: true,
      })
      .press("Enter");
    await expect(page).toHaveURL(/chat\?session=1&lang=(en|ar)#exchange-2/u);
    await page
      .getByRole("link", {
        name: t("Report example", "الإبلاغ عن المثال"),
        exact: true,
      })
      .first()
      .click();
    await expect(page.getByRole("main")).toContainText(
      answerExamples.supported[locale === "ar" ? 1 : 0],
    );
    await expect(submit()).toBeDisabled();
    await expect(
      page.getByText(
        t(
          "Simulated report received in this tab. Nothing was sent, saved or shared.",
          "استلم البلاغ المحاكى داخل التبويب. لم يرسل أو يحفظ أو يشارك شيء.",
        ),
        { exact: true },
      ),
    ).toHaveCount(0);
    await page.getByRole("checkbox").check();
    await submit().press("Enter");
    await expect(submit()).toBeDisabled();
    await reviewExampleLayout(page);
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

  test(`merged B02 M15 ${locale}: missing ambiguous unsupported and foreign targets never fall back to Chat`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/chat`);
    await send(page, "supported", locale);
    await page
      .getByRole("link", {
        name: t("Report example", "الإبلاغ عن المثال"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: t("Selected sample exchange", "المحادثة التجريبية المختارة"),
        exact: true,
      }),
    ).toBeVisible();
    for (const query of [
      "",
      "session=1",
      "exchange=1",
      "session=1&exchange=0",
      "session=1&exchange=1.0",
      "session=1&exchange=1e0",
      "session=1&session=1&exchange=1",
      "session=1&exchange=1&from=studio",
      "session=1&exchange=1&from=quiz",
      "session=1&exchange=1&from=unknown",
      "session=1&exchange=1&from=chat&from=chat",
      "session=999&exchange=1",
      "session=1&exchange=999",
    ]) {
      await page.evaluate(
        (href) => window.history.pushState(null, "", href),
        `${unit}/report?${query}&lang=${locale}`,
      );
      await expect(
        page.getByRole("button", {
          name: t("Submit report", "إرسال البلاغ"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(page.getByRole("main")).not.toContainText(
        answerExamples.supported[locale === "ar" ? 1 : 0],
      );
    }
    await navigate(page, `${unit}/chat`, locale);
    await page
      .getByRole("link", {
        name: t("Inspect evidence", "فحص الأدلة"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("link", {
        name: t("Report selected exchange", "الإبلاغ عن المحادثة المختارة"),
        exact: true,
      }),
    ).toBeVisible();
    await page.evaluate(
      (href) => window.history.pushState(null, "", href),
      `${unit}/evidence?session=1&exchange=1&from=studio&lang=${locale}`,
    );
    await expect(
      page.getByRole("link", {
        name: t("Report selected exchange", "الإبلاغ عن المحادثة المختارة"),
        exact: true,
      }),
    ).toHaveCount(0);
    const foreign = reviewCatalogRows.find(
      (row) =>
        row.cohort.id === unit.split("/")[2] &&
        `/learn/${row.cohort.id}/${row.unit.id}` !== unit,
    )!;
    const foreignPath = `/learn/${foreign.cohort.id}/${foreign.unit.id}`;
    await page
      .locator("summary")
      .filter({ hasText: b07DetailsName(locale) })
      .click();
    await page
      .getByRole("link", {
        name: locale === "ar" ? foreign.unit.nameAr : foreign.unit.nameEn,
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: locale === "ar" ? foreign.unit.nameAr : foreign.unit.nameEn,
        exact: true,
      }),
    ).toBeVisible();
    await navigate(page, `${foreignPath}/chat`, locale);
    await send(page, "supported", locale);
    await page
      .getByRole("link", {
        name: t("Report example", "الإبلاغ عن المثال"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", {
        name: t("Submit report", "إرسال البلاغ"),
        exact: true,
      }),
    ).toBeVisible();
    await page.evaluate(
      (href) => window.history.pushState(null, "", href),
      `${foreignPath}/report?session=1&exchange=1&lang=${locale}`,
    );
    await expect(
      page.getByRole("button", {
        name: t("Submit report", "إرسال البلاغ"),
        exact: true,
      }),
    ).toHaveCount(0);
    finish();
  });

  test(`merged B01 M67 ${locale}: five generated formats reflect settings and MCQ enters one setup`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/studio`);
    const types = ["summary", "guide", "practice", "flashcards", "revision"];
    await expect(
      page
        .getByLabel(t("Artifact type", "نوع المخرج"), { exact: true })
        .locator("option"),
    ).toHaveCount(6);
    await expect(
      page.getByText(
        t(
          "Fixed examples for these settings · no model generation · cleared on reload",
          "أمثلة ثابتة لهذه الإعدادات · دون توليد بنموذج · تمسح عند إعادة التحميل",
        ),
        { exact: true },
      ),
    ).toBeVisible();
    for (const type of types) {
      const outputs = [];
      for (const options of [
        {
          type,
          topic: "sequence",
          depth: "concise",
          size: "short",
          language: locale,
        },
        {
          type,
          topic: "sequence",
          depth: "detailed",
          size: "extended",
          language: locale,
        },
        {
          type,
          topic: "comparison",
          depth: "detailed",
          size: "extended",
          language: "mixed",
        },
      ]) {
        await selectStudioExample(page, locale, options);
        const output = await generateStudioExample(page, locale);
        const body = output.locator(":scope > div[lang]");
        if (type === "flashcards")
          await output
            .getByRole("button", {
              name: new RegExp(
                t("^Show (answer|question)$", "^إظهار (الإجابة|السؤال)$"),
              ),
              exact: true,
            })
            .press("Enter");
        else
          for (const summary of await body.locator("details > summary").all())
            await summary.press("Enter");
        outputs.push(await body.innerText());
        if (options.language === "mixed") {
          expect(await body.locator('bdi[lang="en"]').count()).toBeGreaterThan(
            1,
          );
          expect(await body.locator('bdi[lang="ar"]').count()).toBeGreaterThan(
            1,
          );
          await expect(body.locator('bdi[lang="en"]').first()).toHaveAttribute(
            "dir",
            "ltr",
          );
          await expect(body.locator('bdi[lang="ar"]').first()).toHaveAttribute(
            "dir",
            "rtl",
          );
        }
        if (type === "practice")
          await expect(body.locator("details")).toHaveCount(
            options.size === "short" ? 1 : 3,
          );
      }
      expect(outputs[1]!.length).toBeGreaterThan(outputs[0]!.length);
      expect(outputs[2]).not.toBe(outputs[1]);
    }
    const output = page
      .getByRole("heading", {
        name: new RegExp(t("Simulated artifact", "مخرج محاكى"), "u"),
      })
      .locator("..");
    const body = output.locator(":scope > div[lang]");
    const retained = await body.innerText();
    async function revealRetainedExplanations() {
      await expect(body).toBeVisible();
      for (const detail of await body.locator("details").all()) {
        if ((await detail.getAttribute("open")) === null) {
          await detail.locator("summary").press("Enter");
        }
      }
    }
    await page.locator("#artifact-type").selectOption("quiz");
    await expect(
      page.getByRole("button", { name: t("Generate", "إنشاء"), exact: true }),
    ).toHaveCount(0);
    await revealRetainedExplanations();
    await expect(body).toHaveText(retained, { useInnerText: true });
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
    await navigate(page, unit + "/studio", locale);
    await revealRetainedExplanations();
    await expect(body).toHaveText(retained, { useInnerText: true });
    await page.locator("#artifact-type").selectOption("revision");
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
    await revealRetainedExplanations();
    await expect(body).toHaveText(retained, { useInnerText: true });
    await expect(
      page.getByLabel(t("Output language", "لغة المخرج"), { exact: true }),
    ).toHaveValue("mixed");
    finish();
  });

  test(`merged B01 M67 ${locale}: cancellation and invalid choices keep the captured previous artifact`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/studio`);
    await selectStudioExample(page, locale, {
      type: "summary",
      topic: "comparison",
      depth: "detailed",
      size: "extended",
      language: "mixed",
    });
    const output = await generateStudioExample(page, locale);
    const before = await output.innerText();
    await selectStudioExample(page, locale, {
      type: "practice",
      topic: "sequence",
      depth: "concise",
      size: "short",
      language: locale,
    });
    await page
      .getByRole("button", { name: t("Generate", "إنشاء"), exact: true })
      .click();
    await page
      .getByRole("button", {
        name: t("Cancel preparation", "إلغاء الإعداد"),
        exact: true,
      })
      .click();
    await expect(output).toHaveText(before, { useInnerText: true });
    await page.evaluate(() => {
      const select =
        document.querySelector<HTMLSelectElement>("#artifact-topic")!;
      select.add(new Option("Unsupported synthetic choice", "unsupported"));
      select.value = "unsupported";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page
      .getByRole("button", { name: t("Generate", "إنشاء"), exact: true })
      .click();
    await expect(
      page.getByText(
        t(
          "Select supported sample settings. Your previous artifact is unchanged.",
          "اختر إعدادات تجريبية مدعومة. المخرج السابق كما هو.",
        ),
        { exact: true },
      ),
    ).toBeVisible();
    await expect(output).toHaveText(before, { useInnerText: true });
    await selectStudioExample(page, locale, {
      type: "practice",
      topic: "sequence",
      depth: "concise",
      size: "short",
      language: locale,
    });
    await page.clock.install();
    const generate = page.getByRole("button", {
      name: t("Generate", "إنشاء"),
      exact: true,
    });
    await generate.click();
    for (const [label, value] of [
      [t("Study focus", "محور المذاكرة"), "comparison"],
      [t("Output language", "لغة المخرج"), "mixed"],
      [t("Depth", "التفصيل"), "detailed"],
      [t("Size", "الحجم"), "extended"],
    ])
      await page.getByLabel(label!, { exact: true }).selectOption(value!);
    await page.clock.runFor(1100);
    await expect(generate).toBeEnabled();
    await expect(output.locator("details")).toHaveCount(1);
    await expect(output.locator(":scope > div[lang]")).toHaveAttribute(
      "lang",
      locale,
    );
    await expect(output).toContainText(t("Study sequence", "ترتيب الدراسة"));
    await expect(
      page.getByLabel(t("Output language", "لغة المخرج"), { exact: true }),
    ).toHaveValue("mixed");
    finish();
  });

  test(`merged B01 M67 ${locale}: extended mixed artifact and flashcard reflow with enlarged text`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale, `${unit}/studio`);
    for (const type of ["summary", "flashcards"]) {
      await selectStudioExample(page, locale, {
        type,
        topic: "comparison",
        depth: "detailed",
        size: "extended",
        language: "mixed",
      });
      const output = await generateStudioExample(page, locale);
      const body = output.locator(":scope > div[lang]");
      if (type === "flashcards")
        await output
          .getByRole("button", {
            name: new RegExp(
              t("^Show (answer|question)$", "^إظهار (الإجابة|السؤال)$"),
            ),
            exact: true,
          })
          .press("Enter");
      for (const theme of ["light", "dark"] as const) {
        await page.emulateMedia({
          colorScheme: theme,
          reducedMotion: "reduce",
        });
        for (const width of [1440, 768, 390, 320]) {
          await page.setViewportSize({ width, height: 1000 });
          for (const scale of [100, 200]) {
            const style = await page.addStyleTag({
              content: `html { font-size: ${scale}% !important; }`,
            });
            expect(
              await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth + 1,
              ),
            ).toBe(true);
            expect(
              await body
                .getByRole("paragraph")
                .evaluateAll((paragraphs) =>
                  paragraphs.every(
                    (element) =>
                      element.scrollWidth <= element.clientWidth + 1 &&
                      getComputedStyle(element).textOverflow !== "ellipsis",
                  ),
                ),
            ).toBe(true);
            if (type === "flashcards") {
              const flip = output.getByRole("button", {
                name: new RegExp(
                  t("^Show (answer|question)$", "^إظهار (الإجابة|السؤال)$"),
                ),
                exact: true,
              });
              await flip.press("Enter");
              await expect(flip).toBeFocused();
              await flip.press("Enter");
            }
            await style.evaluate((element) =>
              element.parentNode?.removeChild(element),
            );
          }
        }
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      expect(
        (await new AxeBuilder({ page }).include("main").analyze()).violations,
      ).toEqual([]);
    }
    finish();
  });

  test(`merged B01 M67 ${locale}: extended comparison practice contains distinct bilingual questions`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
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
    await expect(output.locator("details")).toHaveCount(3, { timeout: 5_000 });
    await expect(output).toContainText("Which labels can you compare");
    await expect(output).toContainText("ما الأسماء التي يمكنك مقارنتها");
    await expect(output).not.toContainText("Question: Which step comes first");
    finish();
  });

  test(`merged B01 M53 campaigns ${locale}: three prepared assigned campaigns keep distinct requests`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "leader", locale, "/batch-leader?fixture=dense");
    const assigned = page.getByRole("region", {
      name: pick(locale, "Assigned campaigns", "الحملات المسندة"),
      exact: true,
    });
    await expect(
      assigned.getByRole("link", {
        name: pick(locale, "Open requests", "فتح الطلبات"),
        exact: true,
      }),
    ).toHaveCount(3, { timeout: 5_000 });
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const ids = [
      "sample-campaign",
      "sample-biochemistry-campaign",
      "sample-physiology-campaign",
    ];
    const seen = new Set<string>();
    for (const id of ids) {
      const open = assigned
        .getByRole("link", {
          name: t("Open requests", "فتح الطلبات"),
          exact: true,
        })
        .filter({ hasText: t("Open requests", "فتح الطلبات") })
        .and(page.locator(`a[href*="/campaigns/${id}?"]`));
      await open.press("Enter");
      await expect(page).toHaveURL(new RegExp(`/campaigns/${id}\\?`, "u"));
      const title = await page.getByRole("heading", { level: 1 }).innerText();
      seen.add(title);
      const requests = page.locator(
        "section[aria-labelledby='outstanding-requests']",
      );
      await expect(requests.getByRole("listitem")).toHaveCount(3);
      await expect(
        requests.getByText(t("Awaiting file", "بانتظار ملف"), { exact: false }),
      ).toHaveCount(3);
      await page
        .locator('input[type="file"]')
        .setInputFiles(
          nodePath.resolve("public/demo-files/synthetic-handout.pdf"),
        );
      const queue = page.getByRole("list", {
        name: t("Upload queue", "قائمة الرفع"),
        exact: true,
      });
      await expect(
        queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toBeVisible();
      await page
        .getByLabel(
          t("Professor or source description", "وصف الأستاذ أو المصدر"),
        )
        .fill(`Synthetic independent submission for ${id}.`);
      await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .press("Enter");
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(1);
      await expect(
        requests.getByText(t("Awaiting file", "بانتظار ملف"), { exact: false }),
      ).toHaveCount(2);
      await navigate(page, "/batch-leader", locale);
    }
    expect(seen.size).toBe(3);
    await openPreparedHistory(page, locale);
    const history = page.getByRole("region", {
      name: t("Requests with submissions", "الطلبات ذات الإرسالات"),
      exact: true,
    });
    await expect(
      history.getByText("Synthetic study source", { exact: true }),
    ).toHaveCount(3);
    for (const title of seen)
      await expect(history.getByText(title, { exact: true })).toHaveCount(
        title ===
          t("Synthetic Anatomy source call", "حملة مصادر التشريح التجريبية")
          ? 6
          : 1,
      );
    await navigate(page, "/batch-leader", locale);
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        const titles = assigned.getByRole("heading", { level: 3 });
        await expect(titles).toHaveCount(3);
        expect(
          await titles.evaluateAll((elements) =>
            elements.every(
              (element) =>
                element.scrollWidth <= element.clientWidth + 1 &&
                getComputedStyle(element).textOverflow !== "ellipsis",
            ),
          ),
        ).toBe(true);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    expect(
      (await new AxeBuilder({ page }).include("main").analyze()).violations,
    ).toEqual([]);
    finish();
  });

  test(`merged B01 M53 campaigns ${locale}: separate unfinished queues survive campaign and account navigation`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "leader", locale, "/batch-leader?fixture=dense");
    const a = "/batch-leader/campaigns/sample-campaign";
    const b = "/batch-leader/campaigns/sample-biochemistry-campaign";
    const queue = page.getByRole("list", {
      name: t("Upload queue", "قائمة الرفع"),
      exact: true,
    });
    const description = page.getByLabel(
      t("Professor or source description", "وصف الأستاذ أو المصدر"),
    );
    const rights = page.getByLabel(t("I have permission", "لدي صلاحية"));
    for (const path of [a, b]) {
      await openPreparedCampaign(page, path, locale);
      await expect(queue).toHaveCount(0);
      await page
        .locator('input[type="file"]')
        .setInputFiles(
          nodePath.resolve("public/demo-files/synthetic-handout.pdf"),
        );
      await expect(
        queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toBeVisible();
      await description.fill(`Synthetic retained description for ${path}.`);
      if (path === a) await rights.check();
    }
    await openPreparedHistory(page, locale);
    await navigate(page, "/settings", locale);
    await openPreparedCampaign(page, a, locale);
    await expect(queue.getByRole("listitem")).toHaveCount(1);
    await expect(description).toHaveValue(
      `Synthetic retained description for ${a}.`,
    );
    await expect(rights).toBeChecked();
    await expect(
      queue.getByText(t("Origin: Your device", "المصدر: جهازك"), {
        exact: true,
      }),
    ).toHaveCount(1);
    await page
      .getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      })
      .click();
    await expect(queue.getByRole("progressbar")).toBeVisible();
    await openPreparedCampaign(page, b, locale);
    await expect(description).toHaveValue(
      `Synthetic retained description for ${b}.`,
    );
    await expect(rights).not.toBeChecked();
    await openPreparedCampaign(page, a, locale);
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(0);
    const retry = queue.getByRole("button", {
      name: t("Retry upload", "إعادة محاولة الرفع"),
      exact: true,
    });
    await retry.click();
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(1);
    await openPreparedHistory(page, locale);
    await expect(
      page.getByText("Synthetic study source", { exact: true }),
    ).toHaveCount(1);
    await openPreparedCampaign(page, b, locale);
    await expect(description).toHaveValue(
      `Synthetic retained description for ${b}.`,
    );
    await expect(rights).not.toBeChecked();
    await navigate(page, "/settings", locale);
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
    await signIn(page, "leader", locale, "/batch-leader");
    await expect(
      page.getByRole("link", {
        name: t("Open requests", "فتح الطلبات"),
        exact: true,
      }),
    ).toHaveCount(1);
    await navigate(page, a, locale);
    await expect(queue).toHaveCount(0);
    finish();
  });

  test(`merged B01 M53 campaigns ${locale}: a retained receipt retries after remount without uploading again`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await page.addInitScript(() => {
      const original = FormData.prototype.set as (
        this: FormData,
        name: string,
        value: string | Blob,
      ) => void;
      let rejectOnce = true;
      FormData.prototype.set = function (name, value) {
        if (name === "declaredRights" && rejectOnce) {
          rejectOnce = false;
          return original.call(this, name, "UNKNOWN");
        }
        return original.call(this, name, value);
      };
    });
    await signIn(page, "leader", locale, "/batch-leader?fixture=dense");
    const a = "/batch-leader/campaigns/sample-biochemistry-campaign";
    await openPreparedCampaign(page, a, locale);
    await page
      .getByRole("button", {
        name: t("Upload files", "رفع الملفات"),
        exact: true,
      })
      .click();
    await ensureB09Intake(page, locale);
    await page
      .getByRole("button", {
        name: t("Add approved reference", "إضافة المرجع المعتمد"),
        exact: true,
      })
      .click();
    const queue = page.getByRole("list", {
      name: t("Upload queue", "قائمة الرفع"),
      exact: true,
    });
    await expect(
      queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
    ).toBeVisible();
    await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
    await page
      .getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      })
      .click();
    await expect(
      queue.getByRole("button", {
        name: t("Retry submission", "إعادة محاولة الإرسال"),
        exact: true,
      }),
    ).toBeVisible();
    await openPreparedHistory(page, locale);
    await expect(
      page.getByText("Synthetic study source", { exact: true }),
    ).toHaveCount(0);
    await navigate(page, "/settings", locale);
    await openPreparedCampaign(page, a, locale);
    await expect(
      queue.getByText(t("Origin: Approved reference", "المصدر: مرجع معتمد"), {
        exact: true,
      }),
    ).toHaveCount(1);
    await page.evaluate(() => {
      const observed = { uploads: 0 };
      Object.assign(window, { syntheticRetryObservation: observed });
      new MutationObserver((records) => {
        for (const record of records)
          for (const node of record.addedNodes)
            if (
              node instanceof Element &&
              (node.matches('progress, [role="progressbar"]') ||
                node.querySelector('progress, [role="progressbar"]'))
            )
              observed.uploads += 1;
      }).observe(document.body, { childList: true, subtree: true });
    });
    await queue
      .getByRole("button", {
        name: t("Retry submission", "إعادة محاولة الإرسال"),
        exact: true,
      })
      .click();
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(1);
    expect(
      await page.evaluate(
        () =>
          (
            window as unknown as {
              syntheticRetryObservation: { uploads: number };
            }
          ).syntheticRetryObservation.uploads,
      ),
    ).toBe(0);
    await openPreparedHistory(page, locale);
    await expect(
      page.getByText("Synthetic study source", { exact: true }),
    ).toHaveCount(1);
    await openPreparedCampaign(page, a, locale);
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(1);
    await expect(
      queue.getByRole("button", {
        name: t("Retry submission", "إعادة محاولة الإرسال"),
        exact: true,
      }),
    ).toHaveCount(0);
    finish();
  });

  test(`merged B01 M53 campaigns ${locale}: unknown unprepared and wrong-role campaigns remain unavailable`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "leader", locale, "/batch-leader");
    await expect(
      page.getByRole("link", {
        name: t("Open requests", "فتح الطلبات"),
        exact: true,
      }),
    ).toHaveCount(1);
    const extra = "/batch-leader/campaigns/sample-physiology-campaign";
    await signIn(page, "leader", locale, extra);
    await expect(page.getByRole("main")).toContainText(
      t("Access unavailable", "الوصول غير متاح"),
    );
    await expect(
      page.getByRole("button", {
        name: t("Choose files", "اختيار ملفات"),
        exact: true,
      }),
    ).toHaveCount(0);
    for (const role of ["student", "admin", "second-admin"]) {
      await signIn(page, role, locale, `${extra}?fixture=dense`);
      await expect(page.getByRole("main")).toContainText(
        t("Access unavailable", "الوصول غير متاح"),
      );
      await expect(
        page.getByRole("button", {
          name: t("Choose files", "اختيار ملفات"),
          exact: true,
        }),
      ).toHaveCount(0);
    }
    await page.goto(
      `/batch-leader/campaigns/sample-unassigned-campaign?fixture=dense&lang=${locale}`,
    );
    await expect(
      page.getByRole("heading", { name: "Page not found", exact: true }),
    ).toBeVisible();
    finish();
  });

  test(`merged B01 M53 density ${locale}: prepared study history retains many scoped sessions`, async ({
    page,
  }) => {
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
    await expect(page.getByRole("heading", { level: 3 }).last()).toBeVisible();
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
    ).toContainText(/(?:24|٢٤) (?:sample materials|مصادر تجريبية)/u);
    await expect(
      page.getByRole("link", {
        name: pick(locale, "Open Biochemistry", "فتح الكيمياء الحيوية"),
        exact: true,
      }),
    ).toContainText(/(?:8|٨) (?:sample materials|مصادر تجريبية)/u);
    finish();
  });

  test(`merged B01 M53 density ${locale}: new replies, draft and selected language survive without reseeding`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
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
      "Synthetic source · study sequence",
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
  });

  test(`merged B01 M53 density ${locale}: source deactivation keeps historical targets and excludes new dependent work`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const copy = getAdminCopy(locale);
    await signIn(
      page,
      locale === "en" ? "admin" : "second-admin",
      locale,
      `${unit}/sources?fixture=dense&lang=${locale}`,
    );
    await expect(page.getByRole("article")).toHaveCount(24);
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
      .fill("Synthetic inactive-source review.");
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
    await expect(page.getByRole("article")).toHaveCount(24);
    await expect(
      page.getByText(
        t(
          "INACTIVE sample · excluded from new requests",
          "مثال غير نشط · مستبعد من الطلبات الجديدة",
        ),
        { exact: true },
      ),
    ).toHaveCount(1);
    await expect(
      page.getByText(
        t("Available for learning tools", "متاح لأدوات المذاكرة"),
        {
          exact: true,
        },
      ),
    ).toHaveCount(23);
    await navigate(page, unit + "/chat", locale);
    await expect(page.locator("#exchange-2")).toBeVisible();
    const historical = page.locator("#exchange-2").getByRole("link", {
      name: t("Inspect evidence", "فحص الأدلة"),
      exact: true,
    });
    await historical.click();
    await expect(page).toHaveURL(/exchange=2&session=1/u);
    await expect(
      page
        .getByText(t("Sample page 3", "صفحة تجريبية ٣"), { exact: false })
        .first(),
    ).toBeVisible();
    await page
      .getByRole("link", {
        name: t("Return to Chat", "العودة للمحادثة"),
        exact: true,
      })
      .click();
    await send(page, "supported", locale);
    await expect(page.locator("#exchange-3")).toContainText(
      t("Unavailable information", "معلومة غير متاحة"),
    );
    await expect(
      page.locator("#exchange-3").getByRole("button", {
        name: t("Sample handout · page 3", "ملزمة تجريبية · صفحة ٣"),
        exact: true,
      }),
    ).toHaveCount(0);
    await navigate(page, unit + "/studio", locale);
    await expect(
      page.getByRole("button", { name: t("Generate", "إنشاء"), exact: true }),
    ).toBeDisabled();
    finish();
  });

  test(`merged B01 M53 density ${locale}: wrong role and foreign scope do not expose prepared records`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
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
  });

  test(`merged B01 M53 density ${locale}: long source and session titles reflow without clipped targets`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
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
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const scale of [100, 200]) {
          const style = await page.addStyleTag({
            content: `html { font-size: ${scale}% !important; }`,
          });
          await history.locator("summary").first().click();
          const last = history.getByRole("listitem").last().getByRole("button");
          await last.focus();
          await expect(last).toBeFocused();
          const rowWidth = await last.evaluate(
            (element) =>
              element.getBoundingClientRect().width /
              element.closest("details")!.parentElement!.clientWidth,
          );
          expect(rowWidth).toBeGreaterThan(0.85);
          expect(
            await last.evaluate((element) => ({
              clipped:
                element.scrollWidth > element.clientWidth + 1 ||
                element.scrollHeight > element.clientHeight + 1,
              ellipsis: getComputedStyle(element).textOverflow === "ellipsis",
            })),
          ).toEqual({ clipped: false, ellipsis: false });
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          ).toBe(true);
          await page.keyboard.press("Enter");
          if (width < 768)
            await page
              .locator("summary")
              .filter({ hasText: t("Study options", "خيارات المذاكرة") })
              .click();
          await page
            .getByRole("link", {
              name: b07SourcesName(locale),
              exact: true,
            })
            .click();
          await expect(page.getByRole("article")).toHaveCount(24);
          const title = page.getByRole("heading", { level: 3 }).last();
          await title.scrollIntoViewIfNeeded();
          const sourceMetrics = await title.evaluate((element) => ({
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            clientHeight: element.clientHeight,
            scrollHeight: element.scrollHeight,
            overflowX: getComputedStyle(element).overflowX,
            overflowY: getComputedStyle(element).overflowY,
            fontSize: getComputedStyle(element).fontSize,
            lineHeight: getComputedStyle(element).lineHeight,
          }));
          if (
            sourceMetrics.scrollWidth > sourceMetrics.clientWidth + 1 ||
            sourceMetrics.scrollHeight > sourceMetrics.clientHeight + 1
          )
            await test.info().attach("source-title-metrics", {
              body: JSON.stringify({ theme, width, scale, sourceMetrics }),
              contentType: "application/json",
            });
          expect(
            await title.evaluate((element) => ({
              clipped:
                element.scrollWidth > element.clientWidth + 1 ||
                (element.scrollHeight > element.clientHeight + 1 &&
                  getComputedStyle(element).overflowY !== "visible"),
              ellipsis: getComputedStyle(element).textOverflow === "ellipsis",
            })),
          ).toEqual({ clipped: false, ellipsis: false });
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          ).toBe(true);
          await page
            .getByRole("link", {
              name: t("Return to Chat", "العودة للمحادثة"),
              exact: true,
            })
            .click();
          await style.evaluate((element) =>
            element.parentNode?.removeChild(element),
          );
        }
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    expect(
      (await new AxeBuilder({ page }).include("main").analyze()).violations,
    ).toEqual([]);
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B01 M10 ${locale}: mathematics setup opens its own subjects`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale);
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
    await page
      .getByRole("link", { name: t("Subjects", "المواد"), exact: true })
      .filter({ visible: true })
      .first()
      .click();
    const subjects = () =>
      page
        .getByRole("link", { name: t("Subjects", "المواد"), exact: true })
        .filter({ visible: true })
        .first();
    const openMath = page.getByRole("link", {
      name: t("Open Mathematics", "فتح الرياضيات"),
      exact: true,
    });
    for (const term of [1, 2]) {
      if (term === 2) {
        await navigate(page, "/learn", locale);
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
      const search = page.getByRole("searchbox", {
        name: t("Search subjects", "البحث في مواد"),
        exact: true,
      });
      await search.fill(t("Mathematics", "الرياضيات"));
      await expect(openMath).toBeVisible();
      await expect(
        page.getByRole("link", {
          name: t("Open Chemistry", "فتح الكيمياء"),
          exact: true,
        }),
      ).toHaveCount(0);
      await search.fill("no-synthetic-subject");
      await expect(openMath).toHaveCount(0);
      await search.fill("");
      await reviewExampleLayout(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      expect(
        (await new AxeBuilder({ page }).include("main").analyze()).violations,
      ).toEqual([]);
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
      await expect(
        page
          .getByText(
            t(
              `Mathematics track · Third year · Term ${term}`,
              `شعبة علمي رياضة · السنة الثالثة · الترم ${term === 1 ? "الأول" : "الثاني"}`,
            ),
            { exact: true },
          )
          .filter({ visible: true }),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: locale === "en" ? "العربية" : "English",
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: t("الرياضيات", "Mathematics"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(page).toHaveURL(
        new RegExp(
          `mathematics-track-y3-t${term}-mathematics\\?lang=${locale === "en" ? "ar" : "en"}$`,
          "u",
        ),
      );
      await page
        .getByRole("button", {
          name: locale === "en" ? "English" : "العربية",
          exact: true,
        })
        .click();
      await subjects().click();
      await expect(openMath).toBeVisible();
    }
    await navigate(page, "/learn", locale);
    await page
      .getByRole("link", {
        name: t("Academic settings", "الإعدادات الدراسية"),
        exact: true,
      })
      .click();
    await page
      .getByLabel(t("Track", "المسار"), { exact: true })
      .selectOption("science-track");
    await expect(
      page.getByLabel(t("Study period", "الفترة الدراسية"), { exact: true }),
    ).toHaveValue("");
    await page
      .getByLabel(t("Study period", "الفترة الدراسية"), { exact: true })
      .selectOption("science-track-year-3-term-1");
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
    await subjects().click();
    await expect(
      page.getByRole("link", {
        name: t("Open Biology", "فتح الأحياء"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(openMath).toHaveCount(0);
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
    finish();
  });

  test(`merged B01 M10 ${locale}: obsolete and mismatched mathematics scopes are unavailable`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const mathCohort =
      "egyptian-thanaweya-amma-mathematics-track-year-3-term-1-cohort";
    const mathUnit =
      "egyptian-thanaweya-amma-mathematics-track-y3-t1-mathematics";
    for (const [cohort, unitId] of [
      [mathCohort, mathUnit.replace(/mathematics$/u, "biology")],
      [mathCohort.replace("mathematics-track", "science-track"), mathUnit],
      [mathCohort.replace("term-1", "term-2"), mathUnit],
    ]) {
      await signIn(page, "student", locale, `/learn/${cohort}/${unitId}`);
      // These are nonexistent fixture pairs. The route's existing server
      // layout rejects them before mounting the synthetic product adapter.
      await expect(
        page.getByRole("heading", { name: "Page not found", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          level: 1,
          name: pick(locale, "Mathematics", "الرياضيات"),
          exact: true,
        }),
      ).toHaveCount(0);
    }
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B01 M69 ${locale}: reference and device entry origins are distinct`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "leader", locale, campaign);
    await page
      .locator('input[type="file"]')
      .setInputFiles(
        nodePath.resolve("public/demo-files/synthetic-handout.pdf"),
      );
    const rights = page.getByLabel(t("I have permission", "لدي صلاحية"));
    await expect(
      page.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
    ).toBeVisible();
    await rights.check();
    await page
      .locator('input[type="file"]')
      .setInputFiles(
        nodePath.resolve("public/demo-files/synthetic-handout.pdf"),
      );
    await expect(rights).not.toBeChecked();
    await expect(
      page.getByText(
        t(
          "That file is already in your queue.",
          "هذا الملف موجود بالفعل في قائمتك.",
        ),
        { exact: true },
      ),
    ).toBeVisible();
    await rights.check();
    await ensureB09Intake(page, locale);
    await page
      .getByRole("button", {
        name: t("Add approved reference", "إضافة المرجع المعتمد"),
        exact: true,
      })
      .press("Enter");
    await expect(rights).not.toBeChecked();
    const queue = page.getByRole("list", {
      name: t("Upload queue", "قائمة الرفع"),
      exact: true,
    });
    await expect(queue.getByRole("listitem")).toHaveCount(2);
    await expect(
      queue.getByText(t("Origin: Your device", "المصدر: جهازك"), {
        exact: true,
      }),
    ).toHaveCount(1, { timeout: 5_000 });
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
    await expect(
      queue.getByText("synthetic-handout.pdf", { exact: true }),
    ).toHaveCount(2);
    await expect(queue.getByRole("textbox")).toHaveCount(2);
    for (const title of await queue.getByRole("textbox").all())
      await expect(title).toHaveValue("Synthetic study source");
    await expect(
      queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
    ).toHaveCount(2);
    await reviewExampleLayout(page);
    await page
      .getByRole("button", {
        name: locale === "en" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(queue.getByRole("listitem")).toHaveCount(2);
    await expect(
      page.getByText(
        locale === "en" ? "المصدر: مرجع معتمد" : "Origin: Approved reference",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        locale === "en" ? "المصدر: جهازك" : "Origin: Your device",
        { exact: true },
      ),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: locale === "en" ? "English" : "العربية",
        exact: true,
      })
      .click();
    await expect(rights).not.toBeChecked();
    const submit = page.getByRole("button", {
      name: t("Submit files", "إرسال الملفات"),
      exact: true,
    });
    await expect(submit).toBeDisabled();
    await rights.press("Space");
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

  test(`merged B01 M69 ${locale}: reference origin survives cancellation and retry alongside rejected device bytes`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "leader", locale, campaign);
    await ensureB09Intake(page, locale);
    await page
      .getByRole("button", {
        name: t("Add approved reference", "إضافة المرجع المعتمد"),
        exact: true,
      })
      .click();
    await page.locator('input[type="file"]').setInputFiles({
      name: "invented-private.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("Invented invalid bytes only."),
    });
    const queue = page.getByRole("list", {
      name: t("Upload queue", "قائمة الرفع"),
      exact: true,
    });
    const referenceRow = queue.getByRole("listitem").filter({
      hasText: t("Origin: Approved reference", "المصدر: مرجع معتمد"),
    });
    const deviceRow = queue
      .getByRole("listitem")
      .filter({ hasText: t("Origin: Your device", "المصدر: جهازك") });
    await expect(
      referenceRow.getByText(t("Ready to upload", "جاهز للرفع"), {
        exact: true,
      }),
    ).toBeVisible();
    await expect(deviceRow).toContainText(
      t(
        "Use the supplied synthetic files only.",
        "استخدم الملفات التجريبية المرفقة فقط.",
      ),
    );
    await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
    await page
      .getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: t("Cancel upload", "إلغاء الرفع"),
        exact: true,
      })
      .click();
    await expect(
      referenceRow.getByRole("button", {
        name: t("Retry upload", "إعادة محاولة الرفع"),
        exact: true,
      }),
    ).toBeVisible();
    await referenceRow
      .getByRole("button", {
        name: t("Retry upload", "إعادة محاولة الرفع"),
        exact: true,
      })
      .press("Enter");
    const receipt = page.locator('[data-record-request="sample-item-1"]');
    await expect(receipt.locator('[data-status="RECEIVED"]')).toBeVisible();
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
    await expect(deviceRow).not.toContainText(t("Received", "تم الاستلام"));
    await expect(deviceRow).toContainText(
      t(
        "Use the supplied synthetic files only.",
        "استخدم الملفات التجريبية المرفقة فقط.",
      ),
    );
    await expect(queue.getByRole("listitem")).toHaveCount(1);
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`merged B01 M51 ${locale}: invitation action promises review`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "admin", locale, "/admin/campaigns");
    await page
      .getByRole("button", {
        name: t("Create campaign", "إنشاء حملة"),
        exact: true,
      })
      .press("Enter");
    const review = page.getByRole("button", {
      name: t("Review invitation example", "مراجعة مثال الدعوة"),
      exact: true,
    });
    await expect(review).toBeDisabled({ timeout: 5_000 });
    await expect(
      page.getByRole("button", {
        name: t("Send invitation", "إرسال الدعوة"),
        exact: true,
      }),
    ).toHaveCount(0);
    const prerequisite = page.getByLabel(
      t(
        "Review fixed expiring campaign-only invitation",
        "مراجعة دعوة ثابتة للحملة فقط محدودة المدة",
      ),
    );
    await prerequisite.press("Space");
    await expect(review).toBeEnabled();
    await reviewExampleLayout(page);
    await review.press("Enter");
    await expect(review).toBeDisabled();
    await expect(page.getByRole("status").last()).toContainText(
      t(
        "Invitation example reviewed. No email, assignment or access grant.",
        "روجع مثال الدعوة. لا بريد أو تكليف أو منح وصول.",
      ),
    );
    await page
      .getByRole("button", {
        name: locale === "en" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", {
        name:
          locale === "en" ? "مراجعة مثال الدعوة" : "Review invitation example",
        exact: true,
      }),
    ).toBeDisabled();
    await expect(page.getByRole("checkbox")).toBeChecked();
    expect(
      (await new AxeBuilder({ page }).include("main").analyze()).violations,
    ).toEqual([]);
    finish();
  });

  test(`merged B01 M51 ${locale}: fixed cohort control promises configuration review`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "admin", locale, "/admin/cohorts");
    const review = page.getByRole("button", {
      name: t("Review cohort configuration", "مراجعة إعدادات المجموعة"),
      exact: true,
    });
    await expect(review).toBeVisible({ timeout: 5_000 });
    await expect(
      page.getByRole("button", {
        name: t("Save cohort draft", "محاكاة مسودة المجموعة"),
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(page.getByRole("main").getByRole("textbox")).toHaveCount(0);
    await expect(page.getByRole("main").getByRole("combobox")).toHaveCount(0);
    await expect(page.getByRole("main")).toContainText("synthetic-2026-2027");
    await reviewExampleLayout(page);
    await review.press("Enter");
    await review.press("Enter");
    await expect(page.getByRole("status")).toHaveCount(1);
    await expect(page.getByRole("status")).toContainText(
      t(
        "Cohort configuration reviewed. No cohort unlocked.",
        "تمت مراجعة إعدادات المجموعة. لم تُفتح المجموعة.",
      ),
    );
    await page
      .getByRole("button", {
        name: locale === "en" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      locale === "en"
        ? "تمت مراجعة إعدادات المجموعة"
        : "Cohort configuration reviewed",
    );
    expect(
      (await new AxeBuilder({ page }).include("main").analyze()).violations,
    ).toEqual([]);
    finish();
  });

  test(`merged B01 M51 ${locale}: conflict preview directly opens its supported disagreement and keeps ordinary work`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "admin", locale, unit + "/chat");
    await expect(
      page.getByRole("button", {
        name: t("Two source excerpts", "نصان من مصدرين"),
        exact: true,
      }),
    ).toHaveCount(0);
    await send(page, "supported", locale);
    const originalDraft = t(
      "Synthetic original unsent draft.",
      "مسودة أصلية تجريبية لم تُرسل.",
    );
    await page
      .getByRole("textbox", { name: t("Message", "السؤال"), exact: true })
      .fill(originalDraft);
    await page
      .getByRole("link", {
        name: t("Return to Admin", "العودة للإدارة"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: t("Decision queue", "قائمة القرارات"),
        exact: true,
      }),
    ).toBeVisible();
    await adminNavigate(page, "/admin/jobs", locale);
    await adminNavigate(page, "/admin/quality", locale);
    await page
      .getByRole("link", {
        name: t("Inspect student conflict example", "فحص مثال تعارض الطالب"),
        exact: true,
      })
      .press("Enter");
    const citation = page.getByRole("button", {
      name: t("Two source excerpts", "نصان من مصدرين"),
      exact: true,
    });
    await expect(citation).toBeVisible({ timeout: 5_000 });
    await expect(
      page.getByRole("region", {
        name: t("Conversation", "المحادثة الحالية"),
        exact: true,
      }),
    ).toContainText(answerExamples.conflict[locale === "ar" ? 1 : 0]);
    await expect(
      page.getByRole("textbox", { name: t("Message", "السؤال"), exact: true }),
    ).toHaveValue("");
    await expect(page.locator('article[id^="exchange-"]')).toHaveCount(1);
    await reviewExampleLayout(page);
    await citation.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator("blockquote")).toHaveCount(2);
    const evidence = dialog.getByRole("link", {
      name: t("Open evidence details", "فتح تفاصيل الأدلة"),
      exact: true,
    });
    await expect(evidence).toHaveAttribute("href", /exchange=1&session=2/u);
    await page.keyboard.press("Escape");
    await expect(citation).toBeFocused();
    await citation.press("Enter");
    await evidence.click();
    await expect(page).toHaveURL(/\/evidence\?exchange=1&session=2/u);
    await expect(page.getByRole("main")).toContainText(
      t("Synthetic comparison recording", "تسجيل المقارنة التجريبي"),
    );
    await page
      .getByRole("link", {
        name: t("Return to Chat", "العودة للمحادثة"),
        exact: true,
      })
      .click();
    await expect(citation).toBeVisible();
    await openSessionTools(page, locale);
    await expect(
      page.getByRole("button", {
        name: new RegExp(t("Session [0-9]", "جلسة [٠-٩0-9]")),
      }),
    ).toHaveCount(2);
    await page
      .getByRole("button", { name: new RegExp(t("Session 1", "جلسة 1")) })
      .click();
    await expect(
      page.getByRole("textbox", { name: t("Message", "السؤال"), exact: true }),
    ).toHaveValue(originalDraft);
    await expect(
      page.getByRole("button", {
        name: t("Handout · p. 3", "الملزمة · ص ٣"),
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("link", {
        name: t("Return to Admin", "العودة للإدارة"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: t("Quality", "الجودة"),
        exact: true,
      }),
    ).toBeVisible();
    await adminNavigate(page, "/admin/jobs", locale);
    await adminNavigate(page, "/admin/quality", locale);
    await page
      .getByRole("link", {
        name: t("Inspect student conflict example", "فحص مثال تعارض الطالب"),
        exact: true,
      })
      .click();
    await expect(citation).toBeVisible();
    await expect(page.locator('article[id^="exchange-"]')).toHaveCount(1);
    await openSessionTools(page, locale);
    await expect(
      page.getByRole("button", {
        name: new RegExp(t("Session [0-9]", "جلسة [٠-٩0-9]")),
      }),
    ).toHaveCount(2);
    expect(
      (await new AxeBuilder({ page }).include("main").analyze()).violations,
    ).toEqual([]);
    finish();
  });

  test(`merged B01 M51 ${locale}: unavailable and non-admin views cannot prepare the conflict`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    for (const [role, path] of [
      ["student", "/admin/quality"],
      ["leader", "/admin/quality"],
      ["admin", "/admin/quality?fixture=wrong-scope"],
    ]) {
      await signIn(page, role, locale, path);
      await expect(page.getByRole("main")).toContainText(
        t("Access unavailable", "الوصول غير متاح"),
      );
      await expect(
        page.getByRole("link", {
          name: t("Inspect student conflict example", "فحص مثال تعارض الطالب"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", {
          name: t("Two source excerpts", "نصان من مصدرين"),
          exact: true,
        }),
      ).toHaveCount(0);
    }
    finish();
  });

  test(`merged B01 M51 ${locale}: capacity preview retains its prepared unavailable result`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "admin", locale, "/admin/usage");
    await page
      .getByRole("link", {
        name: t("Preview capacity delay", "معاينة تأخير السعة"),
        exact: true,
      })
      .click();
    await expect(page.getByRole("main")).toContainText(
      t("Capacity is temporarily unavailable", "السعة غير متاحة مؤقتًا"),
    );
    await expect(
      page.getByRole("link", {
        name: t("Return to Admin", "العودة للإدارة"),
        exact: true,
      }),
    ).toBeVisible();
    finish();
  });
}

test("merged B01 M51 en: second admin can inspect the same fixed conflict", async ({
  page,
}) => {
  const finish = isolation(page);
  await signIn(page, "second-admin", "en", "/admin/quality");
  await page
    .getByRole("link", {
      name: "Inspect student conflict example",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Two source excerpts", exact: true }),
  ).toBeVisible();
  await expect(page.locator('article[id^="exchange-"]')).toHaveCount(1);
  await page
    .getByRole("link", { name: "Return to Admin", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Quality", exact: true }),
  ).toBeVisible();
  finish();
});

test("merged B01 M51 en: changed availability removes the unsupported preview action", async ({
  page,
}) => {
  const finish = isolation(page);
  await signIn(page, "admin");
  await changeAdmin(page, "hide");
  await adminNavigate(page, "/admin/jobs", "en");
  await adminNavigate(page, "/admin/quality", "en");
  await expect(page.getByRole("main")).toContainText(
    "Conflict review is unavailable for this unit's current source and access state.",
  );
  await expect(
    page.getByRole("link", {
      name: "Inspect student conflict example",
      exact: true,
    }),
  ).toHaveCount(0);
  finish();
});

for (const locale of ["en", "ar"] as const) {
  test(`merged B01 M53 ${locale}: fresh receipt uses the declared demo date`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
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
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        await expect(details).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
    }
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
      .filter({ hasText: "Synthetic study source" });
    await expect(receipt).toHaveCount(1);
    await expect(receipt).toContainText(received, { timeout: 5_000 });
    await expect(
      latest
        .getByRole("listitem")
        .filter({ hasText: "Synthetic historical source" }),
    ).toHaveCount(5);
    await page
      .getByRole("link", {
        name: t("Latest submissions", "آخر الإرسالات"),
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
        .filter({ hasText: "Synthetic study source" }),
    ).toContainText(received);
    await expect(
      history
        .getByRole("listitem")
        .filter({ hasText: "Synthetic historical source" })
        .first(),
    ).toContainText(date("2026-09-20T10:00:00Z"));
    await expect(page.getByRole("note")).toContainText("2026-10-01 12:00 UTC");
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
    expect(
      (await new AxeBuilder({ page }).include("main").analyze()).violations,
    ).toEqual([]);
    finish();
  });

  test(`merged B01 M53 ${locale}: normal invitation is future and retains its decision`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "leader", locale, "/batch-leader/invitation");
    await expect(page.getByRole("note")).toContainText("2026-10-01 12:00 UTC");
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
    await accept.press("Enter");
    await expect(accept).toBeDisabled();
    await expect(page.getByRole("status").last()).toContainText(
      t("Invitation accepted", "تمت مراجعة الدعوة"),
    );
    expect(
      (await new AxeBuilder({ page }).include("main").analyze()).violations,
    ).toEqual([]);
    finish();
  });

  test(`merged B01 M53 ${locale}: expired and replayed fixtures deny work and offer a safe exit`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    const expired = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Cairo",
    }).format(new Date("2026-09-30T12:00:00Z"));
    for (const path of [
      "/batch-leader/invitation?fixture=expired",
      `${campaign}?fixture=expired`,
      "/batch-leader/invitation?fixture=replayed",
    ]) {
      await signIn(page, "leader", locale, path);
      await expect(page.getByRole("note")).toContainText(
        "2026-10-01 12:00 UTC",
      );
      await expect(page.getByRole("main")).toContainText(
        t("expired", path.startsWith(campaign) ? "انتهى" : "منتهية"),
      );
      if (!path.includes("replayed"))
        await expect(page.getByRole("main")).toContainText(expired);
      else await expect(page.getByRole("main")).not.toContainText(expired);
      await expect(
        page.getByRole("button", {
          name: t("Accept invitation", "قبول الدعوة"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(page.getByRole("main")).not.toContainText(
        t("Synthetic Anatomy source call", "حملة مصادر التشريح التجريبية"),
      );
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
      expect(
        (await new AxeBuilder({ page }).include("main").analyze()).violations,
      ).toEqual([]);
      await page
        .getByRole("link", {
          name: path.startsWith(campaign)
            ? t("Back", "العودة")
            : t("Return to campaigns", "العودة للحملات"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: t("Source intake", "استلام المصادر"),
          exact: true,
        }),
      ).toBeVisible();
    }
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  for (const kind of ["reason", "expiry"] as const)
    test(`merged B01 M52 admin ${locale}: ordinary ${kind} reaches distinct review`, async ({
      page,
    }) => {
      const finish = isolation(page);
      const t = (en: string, ar: string) => pick(locale, en, ar);
      await signIn(page, "admin", locale);
      await page
        .getByRole("button", {
          name: new RegExp(
            kind === "reason"
              ? t("^Remove raw-data hold", "^إزالة حجز البيانات الخام")
              : t("^Place raw-data hold", "^وضع حجز على البيانات الخام"),
          ),
        })
        .click();
      const reason = t(
        "Synthetic hold review is complete.",
        "اكتملت مراجعة تعليق الحذف التجريبية.",
      );
      const reasonInput = page.getByLabel(
        t("Reason for this change", "سبب هذا التغيير"),
      );
      const review = page.getByRole("button", {
        name: t("Review exact change", "مراجعة التغيير المحدد"),
        exact: true,
      });
      await reasonInput.fill("   a    ");
      await review.press("Enter");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(reasonInput).toHaveValue("   a    ");
      await reasonInput.fill(
        kind === "reason"
          ? reason
          : t("Synthetic readiness review.", "مراجعة جاهزية تجريبية."),
      );
      const expiryValue =
        locale === "en" ? "2026-10-18T16:00" : "2027-01-18T16:00";
      if (kind === "expiry") {
        await page
          .getByLabel(
            t("Hold expiry and review date", "تاريخ انتهاء الحجز ومراجعته"),
            { exact: true },
          )
          .fill(expiryValue);
        await review.press("Enter");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await page.locator('input[name="reviewAttested"]').check();
      }
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
      await review.press("Enter");
      await page
        .getByRole("button", {
          name: t("Cancel and edit", "إلغاء والعودة للتعديل"),
          exact: true,
        })
        .click();
      await expect(review).toBeFocused();
      await expect(reasonInput).toHaveValue(
        kind === "reason"
          ? reason
          : t("Synthetic readiness review.", "مراجعة جاهزية تجريبية."),
      );
      await page
        .getByRole("button", {
          name: t("Review exact change", "مراجعة التغيير المحدد"),
          exact: true,
        })
        .click();
      await page
        .getByRole("button", {
          name:
            t("Confirm this exact change", "تأكيد هذا التغيير المحدد") +
            ": " +
            getAdminCopy(locale).actions[
              kind === "reason" ? "REMOVE_RAW_HOLD" : "PLACE_RAW_HOLD"
            ],
          exact: true,
        })
        .click();
      await expect(page.getByRole("status").last()).toContainText(
        t("distinct founder", "مؤسس مختلف"),
        { timeout: 5_000 },
      );
      const pendingReason =
        kind === "reason"
          ? reason
          : t("Synthetic readiness review.", "مراجعة جاهزية تجريبية.");
      await expect(reasonInput).toHaveValue(pendingReason);
      await expect(reasonInput).toHaveAttribute("readonly", "");
      const expiryInput = page.getByLabel(
        t("Hold expiry and review date", "تاريخ انتهاء الحجز ومراجعته"),
        { exact: true },
      );
      if (kind === "expiry") {
        await expect(expiryInput).toHaveValue(expiryValue);
        await expect(expiryInput).toHaveAttribute("readonly", "");
      }
      await page
        .getByRole("main")
        .getByRole("button", {
          name: t("Sign out", "تسجيل الخروج"),
          exact: true,
        })
        .click();
      await page
        .getByLabel(t("Email address", "البريد الإلكتروني"))
        .fill("second-admin@example.invalid");
      await page
        .getByRole("button", { name: t("Continue", "متابعة"), exact: true })
        .click();
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
      await page
        .getByRole("button", {
          name: new RegExp(
            kind === "reason"
              ? t("^Remove raw-data hold", "^إزالة حجز البيانات الخام")
              : t("^Place raw-data hold", "^وضع حجز على البيانات الخام"),
          ),
        })
        .click();
      await expect(reasonInput).toHaveValue(pendingReason);
      await expect(reasonInput).toHaveAttribute("readonly", "");
      if (kind === "expiry") {
        await expect(expiryInput).toHaveValue(expiryValue);
        await expect(expiryInput).toHaveAttribute("readonly", "");
        await expect(
          page.locator('input[name="reviewAttested"]'),
        ).not.toBeChecked();
        await review.press("Enter");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await page.locator('input[name="reviewAttested"]').press("Space");
      }
      await review.press("Enter");
      await expect(page.getByRole("dialog")).toContainText(pendingReason);
      if (kind === "expiry")
        await expect(page.getByRole("dialog")).toContainText(expiryValue);
      await page
        .getByRole("button", {
          name:
            t(
              "Add my separate founder confirmation",
              "إضافة تأكيدي كمؤسس مستقل",
            ) +
            ": " +
            getAdminCopy(locale).actions[
              kind === "reason" ? "REMOVE_RAW_HOLD" : "PLACE_RAW_HOLD"
            ],
          exact: true,
        })
        .press("Enter");
      await expect(page.getByRole("status").last()).toContainText(
        t("governed change", "التغيير الحوكمي"),
      );
      expect(
        (await new AxeBuilder({ page }).include("main").analyze()).violations,
      ).toEqual([]);
      finish();
    });

  test(`merged B01 M52 admin ${locale}: failed hold retains the draft and submitted keys`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "admin", locale, "/admin?fixture=error");
    await page
      .getByRole("button", {
        name: new RegExp(
          t("^Place raw-data hold", "^وضع حجز على البيانات الخام"),
        ),
      })
      .click();
    const reason = page.getByLabel(
      t("Reason for this change", "سبب هذا التغيير"),
    );
    const expiry = page.getByLabel(
      t("Hold expiry and review date", "تاريخ انتهاء الحجز ومراجعته"),
      { exact: true },
    );
    const attestation = page.locator('input[name="reviewAttested"]');
    await reason.fill("Synthetic preservation review.");
    await expiry.fill("2027-01-18T16:00");
    await attestation.check();
    await page
      .getByRole("button", {
        name: t("Review exact change", "مراجعة التغيير المحدد"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: t(
          "Confirm this exact change: Place raw-data hold",
          "تأكيد هذا التغيير المحدد: وضع حجز على البيانات الخام",
        ),
        exact: true,
      })
      .click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      t("could not be verified", "تعذّر التحقق"),
    );
    await expect(reason).toHaveValue("Synthetic preservation review.");
    await expect(expiry).toHaveValue("2027-01-18T16:00");
    await expect(attestation).toBeChecked();
    const requestKey = page.locator('input[name="idempotencyKey"]');
    const correlation = page.locator('input[name="correlationId"]');
    await expect(requestKey).toHaveValue(/^[a-f0-9-]{36}$/u);
    await expect(correlation).toHaveValue(/^[a-f0-9-]{36}$/u);
    await expect(
      page.getByRole("button", {
        name: t("Review exact change", "مراجعة التغيير المحدد"),
        exact: true,
      }),
    ).toBeDisabled();
    finish();
  });
}

test("merged B01 M52 admin en: malformed expiry and altered pending metadata cannot be confirmed", async ({
  page,
}) => {
  const finish = isolation(page);
  for (const field of ["malformedExpiry", "reason", "holdExpiresAt"] as const) {
    await signIn(page, "admin");
    await page.getByRole("button", { name: /^Place raw-data hold /u }).click();
    await page
      .getByLabel("Reason for this change")
      .fill("Synthetic preservation review.");
    await page
      .getByLabel("Hold expiry and review date", { exact: true })
      .fill("2027-01-18T16:00");
    await page.locator('input[name="reviewAttested"]').check();
    await page
      .getByRole("button", { name: "Review exact change", exact: true })
      .click();
    if (field === "malformedExpiry") {
      await page
        .locator('form:has(input[name="holdExpiresAtLocal"])')
        .evaluate((form) => {
          form.addEventListener(
            "formdata",
            (event) => {
              (event as FormDataEvent).formData.set("holdExpiresAt", "1");
            },
            { once: true },
          );
        });
    }
    await page
      .getByRole("button", {
        name: "Confirm this exact change: Place raw-data hold",
        exact: true,
      })
      .click();
    if (field === "malformedExpiry") {
      await expect(page.getByRole("main").getByRole("alert")).toContainText(
        "valid value",
      );
      await expect(
        page.getByLabel("Hold expiry and review date", { exact: true }),
      ).toHaveValue("2027-01-18T16:00");
      await expect(
        page
          .getByRole("status")
          .filter({ hasText: "Waiting for a distinct founder confirmation" }),
      ).toHaveCount(0);
      continue;
    }
    await expect(page.getByRole("status").last()).toContainText(
      "distinct founder",
    );
    await page
      .getByRole("button", { name: "Reload current decisions", exact: true })
      .click();
    await page.getByRole("button", { name: /^Place raw-data hold /u }).click();
    await page.locator('input[name="reviewAttested"]').check();
    await page
      .getByRole("button", { name: "Review exact change", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Add my separate founder confirmation: Place raw-data hold",
        exact: true,
      })
      .click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "distinct founder",
    );
    await page
      .getByRole("main")
      .getByRole("button", { name: "Sign out", exact: true })
      .click();
    await page.getByLabel("Email address").fill("second-admin@example.invalid");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", {
        name: "Accept all and continue to UniMind",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: /^Place raw-data hold /u }).click();
    await expect(
      page.locator('input[name="reviewAttested"]'),
    ).not.toBeChecked();
    await page.locator('input[name="reviewAttested"]').check();
    await page
      .getByRole("button", { name: "Review exact change", exact: true })
      .click();
    // Alter only the submitted payload, as an untrusted client could. The
    // read-only UI is not the authority for matching the captured proposal.
    await page
      .locator('form:has(input[name="holdExpiresAtLocal"])')
      .evaluate((form, name) => {
        form.addEventListener(
          "formdata",
          (event) => {
            (event as FormDataEvent).formData.set(
              name,
              name === "reason"
                ? "A different synthetic reason."
                : "2027-02-18T16:00:00.000Z",
            );
          },
          { once: true },
        );
      }, field);
    await page
      .getByRole("button", {
        name: "Add my separate founder confirmation: Place raw-data hold",
        exact: true,
      })
      .click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "different details",
    );
    await expect(page.getByLabel("Reason for this change")).toHaveValue(
      "Synthetic preservation review.",
    );
    await expect(
      page.getByLabel("Hold expiry and review date", { exact: true }),
    ).toHaveValue("2027-01-18T16:00");
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "Waiting for a distinct founder confirmation" }),
    ).toBeVisible();
  }
  finish();
});

for (const locale of ["en", "ar"] as const)
  test(`merged B01 M52 ${locale}: edited upload description finalizes one receipt`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "leader", locale, campaign);
    await page
      .locator('input[type="file"]')
      .setInputFiles("public/demo-files/synthetic-handout.pdf");
    const queue = page.getByRole("list", {
      name: t("Upload queue", "قائمة الرفع"),
    });
    await expect(
      queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
    ).toBeVisible();
    const description = page.getByLabel(
      t("Professor or source description", "وصف الأستاذ أو المصدر"),
    );
    const upload = page.getByRole("button", {
      name: t("Submit files", "إرسال الملفات"),
      exact: true,
    });
    const rights = page.getByLabel(t("I have permission", "لدي صلاحية"));
    await description.fill(" short ");
    await rights.press("Space");
    await expect(upload).toBeDisabled();
    await expect(description).toHaveValue(" short ");
    const edited = t(
      "Invented materials for a synthetic upload review.",
      "مواد مصطنعة لمراجعة رفع المصادر في UniMind.",
    );
    await description.fill(edited);
    await rights.uncheck();
    await expect(upload).toBeDisabled();
    await rights.press("Space");
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        await expect(description).toHaveValue(edited);
        await expect(upload).toBeEnabled();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
    }
    await upload.press("Enter");
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(1, { timeout: 5_000 });
    const captured = page.locator('[data-record-request="sample-item-1"]');
    await expect(captured.locator("dl")).toContainText(edited);
    await expect(captured.locator("input, textarea, select")).toHaveCount(0);
    await expect(
      queue.getByRole("button", {
        name: t("Retry submission", "إعادة محاولة الإرسال"),
        exact: true,
      }),
    ).toHaveCount(0);
    finish();
  });

for (const locale of ["en", "ar"] as const) {
  test(`audit batch 11 ${locale}: setup interruption survives settings and clears on same-document sign-out`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale);
    const button = (en: string, ar: string) =>
      page.getByRole("button", { name: pick(locale, en, ar), exact: true });
    await page.locator('input[value="university"]').check();
    await button("Continue", "متابعة").click();
    await page.locator('input[value="zagazig-university"]').check();
    await button("Continue", "متابعة").click();
    await page.locator('input[value="human-medicine"]').check();
    await navigate(page, "/settings", locale);
    await navigate(page, "/learn", locale);
    await expect(page.locator('input[value="human-medicine"]')).toBeChecked();
    await navigate(page, "/settings", locale);
    await page
      .getByRole("tab", {
        name: pick(locale, "Identity and access", "الهوية والوصول"),
        exact: true,
      })
      .click();
    await button("Sign out", "تسجيل الخروج").click();
    await expect(page).toHaveURL(/\/login\?/u);
    await page
      .getByLabel(pick(locale, "Email address", "البريد الإلكتروني"))
      .fill("student@example.invalid");
    await page
      .getByLabel(pick(locale, "Password", "كلمة المرور"), { exact: true })
      .fill("Synthetic-study-2026!");
    await button("Continue", "متابعة").click();
    await expect(page).toHaveURL(/\/consent\?/u);
    await page.getByRole("checkbox").check();
    await button(
      "Accept all and continue to UniMind",
      "الموافقة والمتابعة إلى UniMind",
    ).click();
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Education stage", "المرحلة التعليمية"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator("fieldset input:checked")).toHaveCount(0);
    await expect(button("Continue", "متابعة")).toBeDisabled();
    finish();
  });

  test(`audit batch 10 ${locale}: compact settings and period choices preserve readable context, drafts and native controls`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale);
    for (const value of [
      "university",
      "zagazig-university",
      "human-medicine",
      "human-medicine-year-1",
    ]) {
      await page.locator(`input[value="${value}"]`).press("Space");
      await page
        .getByRole("button", { name: t("Continue", "متابعة"), exact: true })
        .press("Enter");
    }
    const reflow = async (inspect: () => Promise<void>) => {
      for (const theme of ["light", "dark"] as const) {
        await page.emulateMedia({
          colorScheme: theme,
          reducedMotion: "reduce",
        });
        for (const width of [1440, 820, 390, 320]) {
          await page.setViewportSize({ width, height: 1000 });
          await inspect();
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          ).toBe(true);
          await expectOriginalTypography(page, locale);
        }
        const enlarged = await page.addStyleTag({
          content: "html { font-size: 200% }",
        });
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
        await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
      }
    };
    const periods = page.getByRole("group", {
      name: t("Study period", "الفترة الدراسية"),
      exact: true,
    });
    const review = page.getByRole("button", {
      name: t("Review choices", "مراجعة الاختيارات"),
      exact: true,
    });
    await expect(review).toBeDisabled();
    await reflow(async () => {
      await expect(periods.getByRole("radio")).toHaveCount(2);
      for (const choice of await periods.locator("label").all()) {
        const box = (await choice.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeLessThan(68);
      }
    });
    await page
      .locator('input[value="human-medicine-year-1-term-1"]')
      .press("Space");
    await page
      .locator('input[value="human-medicine-year-1-term-1"]')
      .press("ArrowDown");
    await expect(
      page.locator('input[value="human-medicine-year-1-term-2"]'),
    ).toBeChecked();
    await review.press("Enter");
    await page
      .getByRole("button", { name: t("Back", "رجوع"), exact: true })
      .press("Enter");
    await expect(
      page.locator('input[value="human-medicine-year-1-term-2"]'),
    ).toBeChecked();
    await page
      .locator('input[value="human-medicine-year-1-term-1"]')
      .press("Space");
    await review.press("Enter");
    await page
      .getByRole("button", {
        name: t("Open Study Shelf", "فتح رف المذاكرة"),
        exact: true,
      })
      .press("Enter");
    await navigate(page, "/settings", locale);
    const appearance = page.locator("#appearance-settings");
    await expect(appearance).toBeVisible();
    await reflow(async () => {
      expect((await appearance.boundingBox())!.width).toBeLessThanOrEqual(640);
      await expect(
        page.getByRole("figure", {
          name: t("Theme preview", "معاينة السمة"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("radio", { name: t("System", "النظام"), exact: true }),
      ).toBeChecked();
    });
    await page
      .getByRole("tab", { name: t("Appearance", "المظهر"), exact: true })
      .press("End");
    const identity = page.locator("#identity-settings");
    await expect(identity).toBeVisible();
    await reflow(async () => {
      expect((await identity.boundingBox())!.width).toBeLessThanOrEqual(640);
      await expect(
        identity.getByRole("link", {
          name: t("Reset password", "تغيير كلمة المرور"),
          exact: true,
        }),
      ).toHaveAttribute("href", `/forgot-password?lang=${locale}`);
      expect(
        (await page
          .getByRole("button", {
            name: t("Sign out", "تسجيل الخروج"),
            exact: true,
          })
          .boundingBox())!.height,
      ).toBeGreaterThanOrEqual(44);
    });
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
    await reflow(async () => {
      const phone = (page.viewportSize()?.width ?? 0) < 768;
      const disclosure = page
        .locator("summary")
        .filter({ hasText: b07DetailsName(locale) });
      if (phone) await disclosure.click();
      const context = phone
        ? page
            .locator('[class*="subjectSwitch"] p')
            .filter({ hasText: t("Faculty of Medicine", "كلية الطب البشري") })
            .filter({ visible: true })
        : page.locator('[class*="scopeCaption"]');
      await expect(context).toBeVisible();
      await expect(context).toContainText(
        t("Faculty of Medicine", "كلية الطب البشري"),
      );
      const size = Number.parseFloat(
        await context.evaluate((e) => getComputedStyle(e).fontSize),
      );
      if ((page.viewportSize()?.width ?? 0) < 768)
        expect(size).toBeGreaterThanOrEqual(14);
      const rect = (await context.boundingBox())!;
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(
        page.viewportSize()!.width,
      );
      await expect(page.locator("article")).toHaveCount(8);
      if (phone) {
        await disclosure.press("Escape");
        await expect(disclosure).toBeFocused();
      }
    });
    await navigate(page, `${unit}/chat`, locale);
    const draft = "Compare the two sources — synthetic unsent draft.";
    const message = page.getByRole("textbox", {
      name: t("Message", "السؤال"),
      exact: true,
    });
    await message.fill(draft);
    await reflow(async () => {
      const phone = (page.viewportSize()?.width ?? 0) < 768;
      const options = page
        .locator("summary")
        .filter({ hasText: t("Study options", "خيارات المذاكرة") });
      if (phone) await options.click();
      const heading = page.getByRole("heading", {
        name: t("Chat", "المحادثة"),
        level: 2,
        exact: true,
      });
      await expect(heading).toHaveCount(1);
      const box = (await heading.boundingBox())!;
      if ((page.viewportSize()?.width ?? 0) < 768) {
        expect(box.width).toBe(1);
        expect(box.height).toBe(1);
      } else expect(box.height).toBeGreaterThan(20);
      await expect(message).toHaveValue(draft);
      await expect(
        page.getByRole("link", {
          name: b07SourcesName(locale),
          exact: true,
        }),
      ).toBeVisible();
      expect(
        (await page
          .locator("summary[aria-label]")
          .filter({ hasText: t("Sessions", "الجلسات") })
          .boundingBox())!.height,
      ).toBeGreaterThanOrEqual(44);
      if (phone) {
        await options.press("Escape");
        await expect(options).toBeFocused();
      }
    });
    const sessions = page
      .locator("summary[aria-label]")
      .filter({ hasText: t("Sessions", "الجلسات") });
    await sessions.press("Enter");
    await expect(sessions.locator("..")).toHaveAttribute("open", "");
    await sessions.press("Escape");
    await expect(sessions).toBeFocused();
    await page
      .locator("summary")
      .filter({ hasText: t("Study options", "خيارات المذاكرة") })
      .press("Enter");
    await page
      .getByRole("link", {
        name: b07SourcesName(locale),
        exact: true,
      })
      .press("Enter");
    await page
      .getByRole("link", {
        name: t("Return to Chat", "العودة للمحادثة"),
        exact: true,
      })
      .press("Enter");
    await expect(message).toHaveValue(draft);
    finish();
  });
}

const unit =
  "/learn/zagazig-university-human-medicine-year-1-term-1-cohort/zagazig-university-human-medicine-y1-t1-anatomy";
const campaign = "/batch-leader/campaigns/sample-campaign";
type Locale = "en" | "ar";
const pick = (locale: Locale, en: string, ar: string) =>
  locale === "ar" ? ar : en;
const clock = (locale: Locale, value: number) =>
  new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(value);

for (const locale of ["en", "ar"] as const) {
  test(`student entry ${locale}: progressive choices, upstream reset, review and distinct destinations`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale);
    const next = () =>
      page.getByRole("button", {
        name: pick(locale, "Continue", "متابعة"),
        exact: true,
      });
    const back = () =>
      page.getByRole("button", {
        name: pick(locale, "Back", "رجوع"),
        exact: true,
      });
    await expect(next()).toBeDisabled();
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
      await page.addStyleTag({ content: "html { font-size: 200% }" });
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
      await page.addStyleTag({ content: "html { font-size: 100% }" });
    }
    await page.locator('input[value="university"]').check();
    await next().click();
    await back().click();
    await expect(page.locator('input[value="university"]')).toBeChecked();
    await page.locator('input[value="thanaweya-amma"]').focus();
    await page.locator('input[value="thanaweya-amma"]').press("Space");
    await next().click();
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Track", "المسار"),
        exact: true,
      }),
    ).toBeFocused();
    await expect(page.locator('input[value="zagazig-university"]')).toHaveCount(
      0,
    );
    await back().click();
    await page.locator('input[value="university"]').check();
    await next().click();
    await page.locator('input[value="zagazig-university"]').check();
    const alternate = locale === "en" ? "العربية" : "English";
    const original = locale === "en" ? "English" : "العربية";
    await page
      .getByRole("group", {
        name: pick(locale, "Interface language", "لغة الواجهة"),
        exact: true,
      })
      .getByRole("button", { name: alternate, exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: locale === "en" ? "الجامعة" : "University",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.locator('input[value="zagazig-university"]'),
    ).toBeChecked();
    await page
      .getByRole("group", {
        name: locale === "en" ? "لغة الواجهة" : "Interface language",
        exact: true,
      })
      .getByRole("button", { name: original, exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "University", "الجامعة"),
        exact: true,
      }),
    ).toBeVisible();
    await next().click();
    await page.locator('input[value="human-medicine"]').check();
    await next().click();
    await page.locator('input[value="human-medicine-year-1"]').check();
    await next().click();
    await page.locator('input[value="human-medicine-year-1-term-1"]').check();
    await page
      .getByRole("button", {
        name: pick(locale, "Review choices", "مراجعة الاختيارات"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: pick(locale, "Edit Academic year", "تعديل السنة الدراسية"),
        exact: true,
      })
      .click();
    await page.locator('input[value="human-medicine-year-2"]').check();
    await next().click();
    await expect(
      page.locator('input[value="human-medicine-year-1-term-1"]'),
    ).toHaveCount(0);
    await page.locator('input[value="human-medicine-year-2-term-1"]').check();
    await page
      .getByRole("button", {
        name: pick(locale, "Review choices", "مراجعة الاختيارات"),
        exact: true,
      })
      .click();
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      await page.addStyleTag({ content: "html { font-size: 200% }" });
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
      await page.addStyleTag({ content: "html { font-size: 100% }" });
    }
    await page
      .getByRole("button", {
        name: pick(locale, "Open Study Shelf", "فتح رف المذاكرة"),
        exact: true,
      })
      .click();
    await expect(page.getByRole("searchbox")).toHaveCount(0);
    const navigation = page.getByRole("navigation", {
      name: pick(locale, "Product navigation", "تنقل المنتج"),
      exact: true,
    });
    await expect(navigation.getByRole("link")).toHaveCount(3);
    await expect(
      navigation.getByRole("link", {
        name: "Samir Hassan",
        exact: true,
      }),
    ).toHaveCount(1);
    await expect(
      navigation.getByRole("link", {
        name: pick(locale, "Account", "الحساب"),
        exact: true,
      }),
    ).toHaveCount(0);
    await page
      .getByRole("link", {
        name: b07ChooseName(locale),
        exact: true,
      })
      .click();
    await expect(page.getByRole("searchbox")).toBeVisible();
    await expect(page.locator('[class*="resume"]')).toHaveCount(0);
    await page
      .getByRole("link", {
        name: pick(locale, "Open Anatomy", "فتح علم التشريح"),
        exact: true,
      })
      .click();
    await page
      .getByRole("navigation", {
        name: pick(locale, "Workspace navigation", "تنقل مساحة المذاكرة"),
        exact: true,
      })
      .getByRole("link", {
        name: pick(locale, "Chat", "المحادثة"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("textbox", {
        name: pick(locale, "Message", "السؤال"),
        exact: true,
      }),
    ).toBeVisible();
    await navigation
      .getByRole("link", {
        name: pick(locale, "Study", "المذاكرة"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("link", {
        name: pick(locale, "Resume Anatomy", "متابعة علم التشريح"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByRole("searchbox")).toHaveCount(0);
    await page
      .getByRole("link", {
        name: pick(locale, "Resume Anatomy", "متابعة علم التشريح"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/learn\/.*anatomy/u);
    finish();
  });
}

for (const role of ["student", "leader", "admin"]) {
  test(`product language ${role}: direct switch preserves route and works in both directions`, async ({
    page,
  }) => {
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
    await expect(page.getByText("لغة الواجهة", { exact: true })).toHaveCount(0);
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
      await expect(
        language.locator("button[aria-pressed='true'] svg[aria-hidden='true']"),
      ).toHaveCount(1);
      await expect(
        language.locator("button[aria-pressed='false'] svg"),
      ).toHaveCount(0);
      expect(new URL(page.url()).pathname).toBe(before.pathname);
      for (const theme of ["light", "dark"] as const) {
        await page.emulateMedia({
          colorScheme: theme,
          reducedMotion: "reduce",
        });
        for (const width of [1440, 768, 390, 320]) {
          await page.setViewportSize({ width, height: 900 });
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          ).toBe(true);
          const geometry = await language
            .getByRole("button")
            .evaluateAll((elements) =>
              elements.map((element) => element.getBoundingClientRect().height),
            );
          expect(geometry.every((height) => height >= 44)).toBe(true);
        }
        await page.addStyleTag({ content: "html { font-size: 200% }" });
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
        await page.addStyleTag({ content: "html { font-size: 100% }" });
      }
    }
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`premium product ${locale}: source reading, flashcard keyboard feedback and nested Quiz navigation`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, "student", locale, unit);
    const source = page.getByRole("heading", {
      name: pick(
        locale,
        "Synthetic sequence handout",
        "ملزمة الترتيب التجريبية",
      ),
      exact: true,
    });
    await expect(source).toBeVisible();
    const firstView = await source.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const bottomNav = document.querySelector(
        '[aria-label="Primary navigation"], [aria-label="التنقل الرئيسي"]',
      );
      return {
        sourceBottom: rect.bottom,
        visibleBottom:
          bottomNav?.getBoundingClientRect().top ?? innerHeight - 88,
      };
    });
    expect(firstView.sourceBottom).toBeLessThanOrEqual(firstView.visibleBottom);
    await navigate(page, unit + "/studio", locale);
    await page
      .getByLabel(pick(locale, "Artifact type", "نوع المخرج"), { exact: true })
      .selectOption("flashcards");
    await page
      .getByRole("button", {
        name: pick(locale, "Generate", "إنشاء"),
        exact: true,
      })
      .click();
    const card = page.getByRole("region", {
      name: pick(locale, "Flashcard", "بطاقة مراجعة"),
      exact: true,
    });
    const question = pick(
      locale,
      "What sequence does the sample handout use?",
      "ما ترتيب الملزمة التجريبية؟",
    );
    const answer = pick(
      locale,
      "Identify labels, then compare diagrams.",
      "حدد الأسماء ثم قارن الرسوم.",
    );
    await expect(
      card.getByRole("paragraph").filter({ hasText: question }),
    ).toBeVisible();
    await expect(
      card.getByRole("paragraph").filter({ hasText: answer }),
    ).toHaveCount(0);
    const flip = page.getByRole("button", {
      name: new RegExp(
        pick(locale, "^Show (answer|question)$", "^إظهار (الإجابة|السؤال)$"),
      ),
      exact: true,
    });
    await flip.focus();
    await flip.press("Enter");
    await expect(flip).toBeFocused();
    await expect(
      card.getByRole("paragraph").filter({ hasText: answer }),
    ).toBeVisible();
    await expect(
      card.getByRole("paragraph").filter({ hasText: question }),
    ).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await flip.press("Enter");
    await expect(
      card.getByRole("paragraph").filter({ hasText: question }),
    ).toBeVisible();
    expect(
      await card
        .locator("div")
        .evaluate((element) => getComputedStyle(element).transitionDuration),
    ).toBe("0s");
    for (const theme of ["light", "dark"]) {
      await navigate(page, "/settings", locale);
      await chooseTheme(page, theme);
      await page
        .getByRole("link", {
          name: pick(
            locale,
            "Return to Studio · Anatomy",
            "العودة إلى الاستوديو · علم التشريح",
          ),
          exact: true,
        })
        .click();
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
      await page.addStyleTag({ content: "html {font-size:200%}" });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await expect(page).toHaveTitle(/\S/u);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.addStyleTag({ content: "html {font-size:100%}" });
    }
    await navigate(page, unit + "/quiz", locale);
    await page
      .getByRole("button", {
        name: pick(locale, "Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .click();
    const quizTab = page
      .getByRole("navigation", {
        name: pick(locale, "Workspace navigation", "تنقل مساحة المذاكرة"),
      })
      .getByRole("link", {
        name: pick(locale, "Quiz", "الاختبار"),
        exact: true,
      });
    await expect(quizTab).toHaveAttribute("aria-current", "page");
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
    await expect(page).toHaveURL(/\/review\?/u);
    await expect(quizTab).toHaveAttribute("aria-current", "page");
    finish();
  });
  for (const theme of ["light", "dark"] as const) {
    test(`premium product ${locale} ${theme}: access slogan and responsive working form`, async ({
      page,
    }) => {
      const finish = isolation(page);
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/login?lang=${locale}`);
      const introduction = page.getByRole("complementary");
      await expect(
        introduction.getByText(/Study deeper\s*Go further\./u),
      ).toBeVisible();
      for (const width of [1000, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        await expect(introduction).toBeHidden();
        await expect(
          page.getByLabel(pick(locale, "Email address", "البريد الإلكتروني")),
        ).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
      await page.addStyleTag({ content: "html {font-size:200%}" });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await expect(page).toHaveTitle(/\S/u);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      finish();
    });
  }
  test(`premium product ${locale}: phone campaign intake keeps its request action in the first viewport`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, "leader", locale, campaign);
    const action = page.getByRole("button", {
      name: pick(locale, "Upload files", "رفع الملفات"),
      exact: true,
    });
    for (const width of [390, 380]) {
      await page.setViewportSize({ width, height: 844 });
      await expect(action).toBeVisible();
      const rect = await action.boundingBox();
      expect(rect!.y + rect!.height).toBeLessThanOrEqual(756);
    }
    await openB09Upload(page, locale);
    finish();
  });
}
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
  // A click that lands before the login form hydrates is ignored; retry it.
  await expect(async () => {
    if (!/\/consent\?/u.test(page.url()))
      await page
        .getByRole("button", {
          name: pick(locale, "Continue", "متابعة"),
          exact: true,
        })
        .click({ timeout: 5_000 });
    await expect(page).toHaveURL(/\/consent\?/u, { timeout: 5_000 });
  }).toPass({ timeout: 30_000 });
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
}
async function navigate(page: Page, path: string, locale: Locale = "en") {
  // Test setup follows the same client router as a product link, preserving the
  // demo's document-local adapter. No identity is injected by the helper.
  await page
    .locator(`a[href="${path}?lang=${locale}"]`)
    .filter({ visible: true })
    .first()
    .click();
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
    await expect(page.getByRole("combobox")).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: pick(locale, "Continue", "متابعة"),
        exact: true,
      }),
    ).toBeDisabled();
    for (const [index, id] of [
      "university",
      "zagazig-university",
      "human-medicine",
      "human-medicine-year-1",
      "human-medicine-year-1-term-1",
    ].entries()) {
      await expect(page.locator("fieldset")).toHaveCount(1);
      await page.locator(`input[type="radio"][value="${id}"]`).check();
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
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Your academic path", "مسارك الدراسي"),
        exact: true,
      }),
    ).toBeFocused();
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
    await expect(page.getByRole("searchbox")).toHaveCount(0);
    await page
      .getByRole("link", {
        name: b07ChooseName(locale),
        exact: true,
      })
      .click();
    await expect(page.getByRole("searchbox")).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: pick(locale, "Open Anatomy", "فتح علم التشريح"),
        exact: true,
      }),
    ).toBeVisible();
    await navigate(page, "/settings", locale);
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Settings", "الإعدادات"),
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
    await showAccountView(page, "academic");
    await expect(
      page.getByLabel(pick(locale, "Academic year", "السنة الدراسية"), {
        exact: true,
      }),
    ).toHaveValue("human-medicine-year-1");
    await chooseTheme(page, "dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await chooseTheme(page, "light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await chooseTheme(page, "system");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await chooseTheme(page, "dark");
    await showAccountView(page, "academic");
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
  await chooseTheme(page, "light");
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
    await openSessionTools(page, locale);
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
  test(`${locale}: five Studio aids, direct MCQ flow, score and source review`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale, unit);
    await navigate(page, unit + "/studio", locale);
    for (const [id, en, ar] of artifactTypes.filter(([id]) => id !== "quiz")) {
      await page
        .getByLabel(pick(locale, "Artifact type", "نوع المخرج"), {
          exact: true,
        })
        .selectOption({ label: pick(locale, en, ar) });
      await page
        .getByRole("combobox", {
          name: pick(locale, "Output language", "لغة المخرج"),
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
        name: b07SourcesName(locale),
        exact: true,
      })
      .click();
    await page
      .getByText(pick(locale, "Read processed passage", "قراءة النص المعالج"), {
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
    await page
      .getByLabel(pick(locale, "Artifact type", "نوع المخرج"), { exact: true })
      .selectOption("quiz");
    await expect(
      page.getByRole("button", {
        name: pick(locale, "Generate", "إنشاء"),
        exact: true,
      }),
    ).toHaveCount(0);
    await page
      .getByRole("link", {
        name: pick(locale, "Set up MCQ quiz", "إعداد اختبار اختيار من متعدد"),
        exact: true,
      })
      .click();
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
    await page
      .getByRole("link", {
        name: pick(locale, "Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      })
      .click();
    await expect(page.locator("h3")).toHaveCount(8);
    finish();
  });
  test(`${locale}: native Batch Leader file/reference form and consistent tracking`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "leader", locale, campaign);
    await expect(page).toHaveURL(
      new RegExp("/batch-leader/campaigns/sample-campaign"),
    );
    await ensureB09Intake(page, locale);
    await page
      .getByRole("button", {
        name: pick(locale, "Add approved reference", "إضافة المرجع المعتمد"),
        exact: true,
      })
      .click();
    await expect(
      page.getByText(pick(locale, "Ready to upload", "جاهز للرفع"), {
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByLabel(pick(locale, "I have permission", "لدي صلاحية"))
      .check();
    await page
      .getByRole("button", {
        name: pick(locale, "Submit files", "إرسال الملفات"),
        exact: true,
      })
      .click();
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toBeVisible();
    await page
      .getByRole("link", {
        name: pick(locale, "Latest submissions", "آخر الإرسالات"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Latest submissions", "آخر الإرسالات"),
        exact: true,
      }),
    ).toBeVisible();
    const history = page.getByRole("region", {
      name: pick(locale, "Requests with submissions", "الطلبات ذات الإرسالات"),
    });
    await expect(
      history.getByText(pick(locale, "Anatomy handout", "ملزمة التشريح"), {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      history.getByText(pick(locale, "Received", "تم الاستلام"), {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation").locator('[aria-current="page"]'),
    ).toHaveCount(1);
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
    await openSessionTools(page, locale);
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
      name: "Accept all and continue to UniMind",
      exact: true,
    })
    .click();
  await navigate(page, "/settings");
  await showAccountView(page, "identity");
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
  await showAccountView(page, "privacy");
  await page
    .getByRole("radio", { name: "Private / no sharing", exact: true })
    .check();
  await page.goBack();
  await navigate(page, unit + "/chat");
  await openSessionTools(page, "en");
  await page.getByRole("button", { name: "New session", exact: true }).click();
  await send(page, "supported");
  await page
    .locator("summary")
    .filter({ hasText: b07DetailsName("en") })
    .click();
  await expect(
    page
      .getByRole("navigation", { name: b07UnitsName("en") })
      .getByRole("link")
      .filter({ hasText: /Veterinary|Biology|Flexible/u }),
  ).toHaveCount(0);
  await expect(page.locator("article")).toContainText("Private");
  await page
    .getByRole("navigation", { name: b07UnitsName("en") })
    .getByRole("link", { name: "Biochemistry", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Biochemistry", exact: true }),
  ).toBeVisible();
  await expect(page.locator("article")).toHaveCount(0);
  await navigate(page, unit.replace("-anatomy", "-biochemistry") + "/quiz");
  await page.getByRole("radio", { name: "Timed", exact: true }).check();
  await page.getByLabel("Duration (minutes)").fill("1");
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
    if (fixture === "loading") {
      await openSessionTools(page, "en");
      await expect(
        page.getByRole("button", { name: "New session", exact: true }),
      ).toBeVisible();
    } else {
      if (
        ["error", "offline", "quota", "capacity", "stale"].includes(fixture)
      ) {
        await page
          .getByRole("button", {
            name: fixture === "stale" ? "Refresh Chat view" : "Retry Chat",
            exact: true,
          })
          .click();
        await openSessionTools(page, "en");
        await expect(
          page.getByRole("button", { name: "New session", exact: true }),
        ).toBeVisible();
      } else {
        await expect(
          page.getByRole("button", { name: /Retry|Refresh/u }),
        ).toHaveCount(0);
        await page
          .getByRole("link", { name: "Browse available subjects", exact: true })
          .click();
        await expect(page).toHaveURL(/\/learn\?.*view=subjects/u);
      }
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
    .getByRole("button", { name: "Submit this action: Hide unit", exact: true })
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
    .getByRole("button", {
      name: "Confirm this exact change: Publish unit",
      exact: true,
    })
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
      name: "Accept all and continue to UniMind",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: /Publish unit/u }).click();
  await page
    .getByRole("button", { name: "Review exact change", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Add my separate founder confirmation: Publish unit",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("The governed change was recorded."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Enable approved mock artifact/u })
    .click();
  await expect(
    page.getByRole("button", { name: "Review exact change", exact: true }),
  ).toBeDisabled();
  finish();
});

const governedLabels: Readonly<Record<string, string>> = {
  publish: "Publish unit",
  hide: "Hide unit",
  unlock: "Unlock cohort",
  lock: "Lock cohort",
  activate: "Activate source version",
  deactivate: "Deactivate source version",
  quarantine: "Quarantine failed source",
  retry: "Request source retry",
  hold: "Place raw-data hold",
  "remove-hold": "Remove raw-data hold",
  enable: "Enable approved mock artifact",
  disable: "Disable provider or artifact",
};
async function changeAdmin(page: Page, id: string, second = false) {
  const definition = actionFixtures.find((action) => action.id === id)!;
  await page
    .getByRole("button", { name: new RegExp(`^${governedLabels[id]}`) })
    .click();
  if (!second)
    await page
      .getByLabel("Reason for this change")
      .fill("Synthetic readiness review.");
  if (id === "hold") {
    const expiry = page.locator('input[name="holdExpiresAtLocal"]');
    if (second) {
      await expect(expiry).toHaveValue("2026-10-03T16:00");
      await expect(expiry).toHaveAttribute("readonly", "");
    } else await expiry.fill("2026-10-03T16:00");
    await page.locator('input[name="reviewAttested"]').check();
  }
  await page
    .getByRole("button", { name: "Review exact change", exact: true })
    .click();
  await page
    .getByRole("button", {
      name:
        (second
          ? "Add my separate founder confirmation"
          : definition.protected
            ? "Confirm this exact change"
            : "Submit this action") +
        ": " +
        governedLabels[id],
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
      name: "Accept all and continue to UniMind",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/admin\?/u);
}

async function adminNavigate(page: Page, destination: string, locale: Locale) {
  const menu = page.getByText(pick(locale, "Menu", "القائمة"), { exact: true });
  const target = () =>
    page
      .locator(
        `a[href="${destination}${destination.includes("?") ? "&" : "?"}lang=${locale}"]:visible`,
      )
      .first();
  if ((await target().count()) === 0 && (await menu.isVisible()))
    await menu.click();
  await target().click();
}

for (const locale of ["en", "ar"] as const) {
  for (const theme of ["light", "dark"] as const) {
    test(`admin ${locale} ${theme}: five sections preserve resources, mobile menu and accessible decisions`, async ({
      page,
    }) => {
      const finish = isolation(page);
      await signIn(page, "admin", locale);
      await adminNavigate(page, "/settings", locale);
      await chooseTheme(page, theme);
      await adminNavigate(page, "/admin", locale);
      const routes = [
        ["/admin", "Decision queue", "قائمة القرارات"],
        ["/admin/sources", "Sources", "المصادر"],
        ["/admin/campaigns", "Campaigns", "الحملات"],
        ["/admin/catalog", "Catalog", "الفهرس"],
        ["/admin/cohorts", "Cohorts", "المجموعات الدراسية"],
        ["/admin/cohorts?view=users", "Access context", "سياق الوصول"],
        ["/admin/jobs", "Jobs", "المهام"],
        ["/admin/quality", "Quality", "الجودة"],
        ["/admin/usage", "Usage", "الاستخدام"],
        ["/admin/incidents", "Incidents", "الحوادث"],
      ] as const;
      for (const [destination, en, ar] of routes) {
        if (destination !== "/admin")
          await adminNavigate(page, destination, locale);
        await expect(page.locator("h1")).toHaveText(pick(locale, en, ar));
        for (const width of [1440, 390, 320]) {
          await page.setViewportSize({ width, height: 900 });
          const inspect = () =>
            page.evaluate(() => ({
              overflow: document.documentElement.scrollWidth > innerWidth + 1,
              controls: [
                ...document.querySelectorAll(
                  '[data-role="admin"] button, [data-role="admin"] a, [data-role="admin"] select, [data-role="admin"] textarea, [data-role="admin"] summary',
                ),
              ]
                .filter((element) => {
                  const rect = element.getBoundingClientRect();
                  return (
                    rect.width > 0 &&
                    rect.height > 0 &&
                    getComputedStyle(element).visibility !== "hidden" &&
                    (rect.left < -1 ||
                      rect.right > innerWidth + 1 ||
                      rect.height < 43 ||
                      (element.matches("button") &&
                        element.scrollWidth > element.clientWidth + 2))
                  );
                })
                .map((element) => element.textContent?.trim().slice(0, 80)),
            }));
          expect(await inspect()).toEqual({ overflow: false, controls: [] });
          await expect(page.locator("main")).toHaveAttribute(
            "dir",
            locale === "ar" ? "rtl" : "ltr",
          );
          await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            theme,
          );
          if (width === 390) {
            await expect(page).toHaveTitle(/\S/u);
            const axe = await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze();
            expect(axe.violations).toEqual([]);
          }
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
      await adminNavigate(page, "/admin", locale);
      await page
        .getByRole("button", {
          name: new RegExp(pick(locale, "^Hide unit", "^إخفاء الوحدة")),
        })
        .click();
      await page
        .getByLabel(pick(locale, "Reason for this change", "سبب هذا التغيير"))
        .fill(
          pick(locale, "Synthetic readiness review.", "مراجعة جاهزية تجريبية."),
        );
      await page
        .getByRole("button", {
          name: pick(locale, "Review exact change", "مراجعة التغيير المحدد"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Review before recording", "راجع قبل التسجيل"),
          exact: true,
        }),
      ).toBeFocused();
      await page
        .getByRole("button", {
          name: pick(locale, "Cancel and edit", "إلغاء والعودة للتعديل"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("button", {
          name: pick(locale, "Review exact change", "مراجعة التغيير المحدد"),
          exact: true,
        }),
      ).toBeFocused();
      const menu = page
        .locator("summary")
        .filter({ hasText: pick(locale, "Menu", "القائمة") });
      await menu.click();
      await page.keyboard.press("Escape");
      await expect(
        page.locator("details").filter({ has: menu }),
      ).not.toHaveAttribute("open", "");
      await expect(menu).toBeFocused();
      finish();
    });
  }
}

test("admin resource reviews and Users context preserve the existing isolated workflow", async ({
  page,
}) => {
  const finish = isolation(page);
  await signIn(page, "admin");
  await adminNavigate(page, "/admin/catalog", "en");
  await page.getByLabel("Configured unit label").selectOption("SUBJECT");
  await page
    .getByRole("button", { name: "Review changes", exact: true })
    .click();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Sample catalog draft saved",
  );
  await adminNavigate(page, "/admin/cohorts", "en");
  await page
    .getByRole("button", { name: "Review cohort configuration", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("No cohort unlocked");
  await adminNavigate(page, "/admin/cohorts?view=users", "en");
  await expect(
    page.getByRole("heading", { name: "Assignment and access context" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Review campaign invitations" }).click();
  await page
    .getByRole("button", { name: "Create campaign", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Review invitation example",
      exact: true,
    }),
  ).toBeDisabled();
  await page
    .getByLabel("Review fixed expiring campaign-only invitation")
    .check();
  await page
    .getByRole("button", { name: "Review invitation example", exact: true })
    .click();
  await expect(
    page.getByText(
      "Invitation example reviewed. No email, assignment or access grant.",
    ),
  ).toBeVisible();
  finish();
});
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
  await page
    .getByRole("button", { name: /Enable approved mock artifact/u })
    .click();
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
test("all supplied mixed file types, private-byte rejection and cancel retry use only local state", async ({
  page,
}) => {
  const finish = isolation(page);
  await signIn(page, "leader", "en", campaign);
  await page.locator('input[type="file"]').setInputFiles({
    name: "synthetic-handout.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 invented wrong bytes"),
  });
  await expect(
    page.getByText(/Use the supplied synthetic files only/u),
  ).toBeVisible();
  await page
    .locator('input[type="file"]')
    .setInputFiles([
      "public/demo-files/synthetic-handout.pdf",
      "public/demo-files/synthetic-recording.wav",
      "public/demo-files/synthetic-diagram.png",
    ]);
  const queue = page.getByRole("list", { name: "Upload queue" });
  await expect(queue.getByText("Ready to upload", { exact: true })).toHaveCount(
    3,
  );
  await page.getByLabel("I have permission").check();
  await page.getByRole("button", { name: "Submit files", exact: true }).click();
  await page
    .getByRole("button", { name: "Cancel upload", exact: true })
    .click();
  await expect(queue.getByText(/interrupted/u)).toBeVisible();
  await expect(queue.getByText("Ready to upload", { exact: true })).toHaveCount(
    2,
  );
  await page.getByRole("button", { name: "Submit files", exact: true }).click();
  await expect(
    page.locator('[data-record-request] [data-status="RECEIVED"]'),
  ).toHaveCount(3);
  await expect(
    queue.getByText(/Use the supplied synthetic files only/u),
  ).toBeVisible();
  finish();
});

for (const locale of ["en", "ar"] as const)
  for (const theme of ["light", "dark"] as const)
    test(`leader ${locale} ${theme}: queue, History and Account reflow with accessible controls`, async ({
      page,
    }) => {
      const finish = isolation(page);
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await signIn(page, "leader", locale, campaign);
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: pick(locale, "Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .click();
      await expect(
        page.getByText(pick(locale, "Ready to upload", "جاهز للرفع"), {
          exact: true,
        }),
      ).toBeVisible();
      await expect(page).toHaveTitle(/\S/u);
      for (const width of [1440, 768, 430, 390, 360, 320]) {
        await page.setViewportSize({ width, height: 844 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const short = await page
          .locator("main button,main a,main summary,main select")
          .evaluateAll((elements) =>
            elements
              .filter((element) => element.getClientRects().length)
              .filter((element) => element.getBoundingClientRect().height < 44)
              .map((element) => element.textContent),
          );
        expect(short).toEqual([]);
        if (width === 360 || width === 1440)
          expect(
            (
              await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
                .analyze()
            ).violations,
          ).toEqual([]);
      }
      await page.addStyleTag({ content: "html {font-size:200%}" });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.addStyleTag({ content: "html {font-size:100%}" });
      await page
        .getByRole("link", {
          name: pick(locale, "Latest submissions", "آخر الإرسالات"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Latest submissions", "آخر الإرسالات"),
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
      await navigate(page, "/settings", locale);
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Account", "الحساب"),
          exact: true,
        }),
      ).toBeVisible();
      // Next streams metadata separately from the route's visible content.
      await expect(page).toHaveTitle(/\S/u);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      finish();
    });

test("leader campaign access and list failure states expose no upload action", async ({
  page,
}) => {
  const finish = isolation(page);
  for (const fixture of [
    "empty",
    "error",
    "expired",
    "forbidden",
    "wrong-scope",
  ]) {
    await signIn(page, "leader", "en", `${campaign}?fixture=${fixture}`);
    await expect(
      page.getByRole("main").getByRole("heading").first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Submit files", exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole("main")).not.toContainText(
      "Synthetic Anatomy source call",
    );
  }
  finish();
});

test("leader sign-in preserves History and its empty state", async ({
  page,
}) => {
  const finish = isolation(page);
  for (const locale of ["en", "ar"] as const) {
    await signIn(
      page,
      "leader",
      locale,
      "/batch-leader?view=history&fixture=empty",
    );
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Latest submissions", "آخر الإرسالات"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByRole("main")).toContainText(
      pick(locale, "No submissions yet", "لا توجد إرسالات بعد"),
    );
    await expect(page.locator('nav a[aria-current="page"]')).toHaveCount(1);
  }
  finish();
});

test("leader invitation preserves its decision and campaign return in both themes and languages", async ({
  page,
}) => {
  const finish = isolation(page);
  for (const locale of ["en", "ar"] as const)
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      await signIn(page, "leader", locale, "/batch-leader/invitation");
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Campaign invitation", "دعوة حملة"),
          exact: true,
        }),
      ).toHaveCount(1);
      for (const width of [1440, 360]) {
        await page.setViewportSize({ width, height: 844 });
        const navigationContrast = await page
          .locator('nav a[aria-current="page"]')
          .evaluate(async (link) => {
            const luminance = (color: string) => {
              const channels = color.match(/[0-9.]+/gu)?.map(Number);
              if (
                !channels ||
                channels.length < 3 ||
                (channels.length === 4 && channels[3] !== 1)
              )
                throw new Error(
                  "Navigation must use an opaque readable palette.",
                );
              const linear = channels.slice(0, 3).map((channel) => {
                const value = channel / 255;
                return value <= 0.04045
                  ? value / 12.92
                  : ((value + 0.055) / 1.055) ** 2.4;
              });
              return (
                linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722
              );
            };
            const samples: number[] = [];
            for (let frame = 0; frame < 12; frame += 1) {
              const style = getComputedStyle(link);
              const foreground = luminance(style.color);
              const background = luminance(style.backgroundColor);
              samples.push(
                (Math.max(foreground, background) + 0.05) /
                  (Math.min(foreground, background) + 0.05),
              );
              await new Promise<void>((resolve) =>
                requestAnimationFrame(() => resolve()),
              );
            }
            return Math.min(...samples);
          });
        expect(navigationContrast).toBeGreaterThanOrEqual(4.5);
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
      }
      const accept = page.getByRole("button", {
        name: pick(locale, "Accept invitation", "قبول الدعوة"),
        exact: true,
      });
      await accept.click();
      await expect(accept).toBeDisabled();
      await expect(page.getByRole("status")).toContainText(
        pick(locale, "Invitation accepted", "تمت مراجعة الدعوة"),
      );
      await page
        .getByRole("link", {
          name: pick(locale, "View campaigns", "عرض الحملات"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Source intake", "استلام المصادر"),
          exact: true,
        }),
      ).toBeVisible();
    }
  finish();
});

test("leader Account keeps existing controls readable in both themes and languages", async ({
  page,
}) => {
  const finish = isolation(page);
  for (const locale of ["en", "ar"] as const)
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      await signIn(page, "leader", locale, "/settings");
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Account", "الحساب"),
          exact: true,
        }),
      ).toBeVisible();
      for (const width of [1440, 360]) {
        await page.setViewportSize({ width, height: 844 });
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
      }
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
  await navigate(page, "/settings");
  await expect(
    page.getByRole("heading", { name: "Settings", exact: true }),
  ).toBeVisible();
  await showAccountView(page, "identity");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?lang=en$/u);
  await page.getByLabel("Email address").fill("leader@example.invalid");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/consent\?/u);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", {
      name: "Accept all and continue to UniMind",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/batch-leader\?/u);
  await navigate(page, "/settings");
  await expect(
    page.getByRole("heading", { name: "Account", exact: true }),
  ).toBeVisible();
  await showAccountView(page, "identity");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?lang=en$/u);
  await page.getByLabel("Email address").fill("admin@example.invalid");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/consent\?/u);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", {
      name: "Accept all and continue to UniMind",
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
      name: "Samir Hassan",
      exact: true,
    });
    await account.focus();
    await account.press("Enter");
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Settings", "الإعدادات"),
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("link", {
        name: pick(
          locale,
          "Return to Chat · Anatomy",
          "العودة إلى المحادثة · علم التشريح",
        ),
        exact: true,
      })
      .click();
    await expect(
      page.locator("summary").filter({ hasText: b07DetailsName(locale) }),
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
      .getByRole("group", {
        name: pick(locale, "Study language", "لغة المذاكرة"),
        exact: true,
      })
      .locator('input[value="mixed"]')
      .check();
    const nextLocale = locale === "en" ? "ar" : "en";
    const languageButton = page
      .getByRole("group", {
        name: pick(locale, "Interface language", "لغة الواجهة"),
        exact: true,
      })
      .getByRole("button", {
        name: nextLocale === "ar" ? "العربية" : "English",
        exact: true,
      });
    await languageButton.focus();
    await languageButton.press("Enter");
    await expect(page).toHaveURL(new RegExp(`lang=${nextLocale}`));
    await expect(
      page.getByLabel(pick(nextLocale, "Message", "السؤال"), { exact: true }),
    ).toHaveValue(prompt);
    await expect(
      page
        .getByRole("group", {
          name: pick(nextLocale, "Study language", "لغة المذاكرة"),
          exact: true,
        })
        .locator('input[value="mixed"]'),
    ).toBeChecked();
    await expect(
      page
        .getByRole("group", {
          name: pick(nextLocale, "Interface language", "لغة الواجهة"),
          exact: true,
        })
        .getByRole("button", {
          name: nextLocale === "ar" ? "العربية" : "English",
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
    await openSessionTools(page, nextLocale);
    await page
      .getByRole("button", {
        name: pick(nextLocale, "New session", "جلسة جديدة"),
        exact: true,
      })
      .click();
    await expect(page.locator("article")).toHaveCount(0);
    await openSessionTools(page, nextLocale);
    await page
      .getByRole("button", {
        name: new RegExp(pick(nextLocale, "Session 1", "جلسة [١1]")),
      })
      .click();
    await expect(page.locator("article")).toHaveCount(1);
    await openSessionTools(page, nextLocale);
    await page
      .getByRole("link", {
        name: pick(nextLocale, "Privacy settings", "إعدادات الخصوصية"),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", {
        name: pick(
          nextLocale,
          "Return to Chat · Anatomy",
          "العودة إلى المحادثة · علم التشريح",
        ),
        exact: true,
      })
      .click();
    await expect(page.locator("article")).toHaveCount(1);
    await navigate(page, unit + "/studio", nextLocale);
    await page
      .getByLabel(pick(nextLocale, "Artifact type", "نوع المخرج"), {
        exact: true,
      })
      .selectOption("flashcards");
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
        name: new RegExp(
          pick(
            nextLocale,
            "^Show (answer|question)$",
            "^إظهار (الإجابة|السؤال)$",
          ),
        ),
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
          .getByLabel(pick(locale, "Artifact type", "نوع المخرج"), {
            exact: true,
          })
          .selectOption("flashcards");
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
        await chooseTheme(page, theme);
        await page
          .getByRole("link", {
            name: pick(
              locale,
              screen === "studio"
                ? "Return to Studio · Anatomy"
                : "Return to Chat · Anatomy",
              screen === "studio"
                ? "العودة إلى الاستوديو · علم التشريح"
                : "العودة إلى المحادثة · علم التشريح",
            ),
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
                    getComputedStyle(element).visibility !== "hidden" &&
                    element.checkVisibility()
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

async function openSessionTools(page: Page, locale: Locale) {
  const summary = page.locator(
    `summary[aria-label="${pick(locale, "Sessions and privacy", "الجلسات والخصوصية")}"]`,
  );
  await summary.waitFor();
  if ((await summary.locator("..").getAttribute("open")) === null)
    await summary.click();
}

for (const locale of ["en", "ar"] as const) {
  test(`open folio ${locale}: reachable study actions, exchange-bound citations and reduced motion`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await page.emulateMedia({
      colorScheme: locale === "ar" ? "dark" : "light",
      reducedMotion: "reduce",
    });
    await signIn(page, "student", locale, unit + "/chat");
    const input = page.getByLabel(pick(locale, "Message", "السؤال"), {
      exact: true,
    });
    for (const [width, height] of [
      [1440, 900],
      [1280, 800],
      [768, 1024],
      [390, 844],
    ]) {
      await page.setViewportSize({ width: width!, height: height! });
      const send = page.getByRole("button", {
        name: pick(locale, "Send", "إرسال"),
        exact: true,
      });
      const rect = await send.boundingBox();
      expect(rect!.y).toBeGreaterThanOrEqual(0);
      expect(rect!.y + rect!.height).toBeLessThanOrEqual(
        height! - (width! < 768 ? 64 : 0),
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width! + 1);
    }
    await send(page, "supported", locale);
    const citation = page.getByRole("button", {
      name: pick(locale, "Handout · p. 3", "الملزمة · ص ٣"),
      exact: true,
    });
    await citation.click();
    const dialog = page.getByRole("dialog", {
      name: pick(locale, "Source excerpt", "نص المصدر"),
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 2 })).toBeFocused();
    await expect(
      dialog.getByRole("link", {
        name: pick(locale, "Open evidence details", "فتح تفاصيل الأدلة"),
      }),
    ).toHaveAttribute("href", /exchange=1&session=1/u);
    expect(
      await dialog.evaluate(
        (element) => getComputedStyle(element).animationName,
      ),
    ).toBe("none");
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(citation).toBeFocused();
    await send(page, "conflict", locale);
    await page
      .getByRole("button", {
        name: pick(locale, "Two source excerpts", "نصان من مصدرين"),
        exact: true,
      })
      .click();
    await expect(dialog.locator("blockquote")).toHaveCount(2);
    await expect(
      dialog.getByRole("link", {
        name: pick(locale, "Open evidence details", "فتح تفاصيل الأدلة"),
      }),
    ).toHaveAttribute("href", /exchange=2&session=1/u);
    await page.keyboard.press("Escape");
    await openSessionTools(page, locale);
    await page
      .getByRole("button", {
        name: pick(locale, "New session", "جلسة جديدة"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", {
        name: pick(locale, "Handout · p. 3", "الملزمة · ص ٣"),
      }),
    ).toHaveCount(0);
    await expect(input).toHaveValue("");
    await navigate(page, unit + "/studio", locale);
    for (const [width, height] of [
      [1440, 900],
      [1280, 800],
      [768, 1024],
      [390, 844],
    ]) {
      await page.setViewportSize({ width: width!, height: height! });
      const rect = await page
        .getByRole("button", {
          name: pick(locale, "Generate", "إنشاء"),
          exact: true,
        })
        .boundingBox();
      expect(rect!.y + rect!.height).toBeLessThanOrEqual(
        height! - (width! < 768 ? 64 : 0),
      );
    }
    await navigate(page, unit + "/chat", locale);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(391);
    await openSessionTools(page, locale);
    await page
      .getByRole("button", {
        name: pick(locale, "New session", "جلسة جديدة"),
        exact: true,
      })
      .click();
    await expect(input).toBeEnabled();
    finish();
  });
  test(`open folio ${locale}: password disclosure preserves value and blank submission names the required field`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await page.goto(`/login?lang=${locale}`);
    const password = page.getByLabel(pick(locale, "Password", "كلمة المرور"), {
      exact: true,
    });
    await password.fill("");
    await page
      .getByRole("button", {
        name: pick(locale, "Continue", "متابعة"),
        exact: true,
      })
      .click();
    await expect(password).toBeFocused();
    await expect(password).toHaveAttribute("aria-invalid", "true");
    const description = await password.getAttribute("aria-describedby");
    await expect(page.locator(`[id="${description}"]`)).toBeVisible();
    await password.fill("visible field specimen");
    await page
      .getByRole("button", {
        name: pick(locale, "Show password", "إظهار كلمة المرور"),
        exact: true,
      })
      .click();
    await expect(password).toHaveAttribute("type", "text");
    await expect(password).toHaveValue("visible field specimen");
    await page
      .getByRole("button", {
        name: pick(locale, "Hide password", "إخفاء كلمة المرور"),
        exact: true,
      })
      .click();
    await expect(password).toHaveAttribute("type", "password");
    finish();
  });
}

for (const role of ["admin", "second-admin"]) {
  test(`open folio ${role}: no implicit decision, local filtering and safe modal focus`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await signIn(page, role);
    await expect(page.getByLabel("Reason for this change")).toHaveCount(0);
    await page.getByLabel("Find a decision", { exact: true }).fill("Hide unit");
    const target = page.getByRole("button", { name: /^Hide unit/u });
    await expect(target).toHaveCount(1);
    await target.click();
    await page
      .getByLabel("Reason for this change")
      .fill("Synthetic presentation review; no submission.");
    const review = page.getByRole("button", {
      name: "Review exact change",
      exact: true,
    });
    await review.click();
    const dialog = page.getByRole("dialog", {
      name: "Review before recording",
      exact: true,
    });
    await expect(dialog.getByRole("heading", { level: 2 })).toBeFocused();
    await expect(
      dialog.getByText("Expected version", { exact: true }),
    ).toBeVisible();
    await expect(
      dialog.getByText("No failed readiness checks", { exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(review).toBeFocused();
    await expect(
      page.getByText("The governed change was recorded."),
    ).toHaveCount(0);
    finish();
  });
}

async function expectOriginalTypography(page: Page, locale: Locale) {
  const fonts = await page.evaluate(async () => {
    const root = getComputedStyle(document.documentElement);
    const [latin, arabic] = await Promise.all([
      document.fonts.load('16px "Manrope"', "Study"),
      document.fonts.load('16px "Noto Sans Arabic"', "المذاكرة"),
    ]);
    return {
      latin: root.getPropertyValue("--font-unimind-latin"),
      arabic: root.getPropertyValue("--font-unimind-arabic"),
      family: getComputedStyle(document.body).fontFamily,
      latinLoaded: latin.length,
      arabicLoaded: arabic.length,
    };
  });
  expect(fonts.latin).toContain("Manrope");
  expect(fonts.arabic).toContain("Noto Sans Arabic");
  expect(fonts.family).toContain(pick(locale, "Manrope", "Noto Sans Arabic"));
  expect(fonts.latinLoaded).toBeGreaterThan(0);
  expect(fonts.arabicLoaded).toBeGreaterThan(0);
}

for (const locale of ["en", "ar"] as const) {
  test(`audit batch 02 ${locale}: distinct progress and compact editable academic review with original fonts`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale);
    await expectOriginalTypography(page, locale);
    for (const value of [
      "university",
      "zagazig-university",
      "human-medicine",
    ]) {
      await page.locator(`input[value="${value}"]`).check();
      await page
        .getByRole("button", {
          name: pick(locale, "Continue", "متابعة"),
          exact: true,
        })
        .click();
    }
    const progress = page.locator('[data-current="true"]');
    const completed = page.locator('[data-complete="true"]').first();
    expect((await progress.boundingBox())!.height).toBeGreaterThan(
      (await completed.boundingBox())!.height,
    );
    await page.locator('input[value="human-medicine-year-1"]').check();
    await page
      .getByRole("button", {
        name: pick(locale, "Continue", "متابعة"),
        exact: true,
      })
      .click();
    await page.setViewportSize({ width: 390, height: 844 });
    const gap = await page
      .locator("#academic-settings-heading")
      .evaluate(
        (heading) =>
          heading.getBoundingClientRect().top -
          heading.closest("main")!.getBoundingClientRect().top,
      );
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThanOrEqual(24);
    await page.locator('input[value="human-medicine-year-1-term-1"]').check();
    await page
      .getByRole("button", {
        name: pick(locale, "Review choices", "مراجعة الاختيارات"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Your academic path", "مسارك الدراسي"),
        exact: true,
      }),
    ).toBeFocused();
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        const rows = await page.locator("dl > div").evaluateAll((elements) =>
          elements.map((element) => {
            const value = element.querySelector("bdi")!.getBoundingClientRect();
            const edit = element
              .querySelector("button")!
              .getBoundingClientRect();
            return {
              gap: Math.max(edit.left - value.right, value.left - edit.right),
              target: edit.height,
            };
          }),
        );
        expect(rows).toHaveLength(5);
        for (const row of rows) {
          expect(row.gap).toBeLessThanOrEqual(25);
          expect(row.target).toBeGreaterThanOrEqual(44);
        }
        if (width === 390) {
          expect((await page.locator("dl").boundingBox())!.height).toBeLessThan(
            450,
          );
        }
      }
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
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
      await enlarged.evaluate((element) =>
        element.parentNode?.removeChild(element),
      );
    }
    const periodEdit = page.getByRole("button", {
      name: pick(locale, "Edit Study period", "تعديل الفترة الدراسية"),
      exact: true,
    });
    await periodEdit.focus();
    await periodEdit.press("Enter");
    await expect(
      page.locator('input[value="human-medicine-year-1-term-1"]'),
    ).toBeChecked();
    await page
      .getByRole("button", {
        name: pick(locale, "Review choices", "مراجعة الاختيارات"),
        exact: true,
      })
      .click();
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
    finish();
  });

  test(`audit batch 02 ${locale}: compact source rows keep keyboard excerpts and contextual returns`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/studio");
    await page
      .getByRole("link", {
        name: b07SourcesName(locale),
        exact: true,
      })
      .click();
    await expectOriginalTypography(page, locale);
    const rows = page.locator("article");
    await expect(rows).toHaveCount(8);
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        const first = rows.first();
        expect(
          (await first.locator("summary").boundingBox())!.height,
        ).toBeGreaterThanOrEqual(44);
        if (width === 1440) {
          const firstTitle = (await first.locator("h3").boundingBox())!;
          const secondTitle = (await rows.nth(1).locator("h3").boundingBox())!;
          expect(secondTitle.y - firstTitle.y).toBeLessThan(160);
          const identity = (await first.locator(":scope > div").boundingBox())!;
          const status = (await first.locator(":scope > span").boundingBox())!;
          expect(Math.abs(identity.y - status.y)).toBeLessThan(2);
          expect(
            status.x > identity.x + identity.width ||
              identity.x > status.x + status.width,
          ).toBe(true);
        }
      }
      const summary = rows.first().locator("summary");
      await summary.focus();
      await summary.press("Enter");
      await expect(rows.first().locator("details")).toHaveAttribute("open", "");
      await expect(
        rows
          .first()
          .getByText(
            pick(
              locale,
              "Identify the labels, then compare the diagrams.",
              "حدد الأسماء ثم قارن الرسوم.",
            ),
            { exact: true },
          ),
      ).toBeVisible();
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
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
      await enlarged.evaluate((element) =>
        element.parentNode?.removeChild(element),
      );
      await summary.press("Enter");
      await expect(rows.first().locator("details")).not.toHaveAttribute("open");
    }
    await page
      .getByRole("link", {
        name: pick(locale, "Return to Studio", "العودة للاستوديو"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`${unit}/studio\\?lang=${locale}$`, "u"),
    );
    await navigate(page, unit + "/chat", locale);
    await expect(
      page.getByLabel(pick(locale, "Message", "السؤال"), { exact: true }),
    ).toBeVisible();
    const gotIt = page.getByRole("button", {
      name: pick(locale, "Got it", "فهمت"),
      exact: true,
    });
    await expect(gotIt).toBeVisible();
    await gotIt.click();
    await page
      .locator("details")
      .filter({ hasText: pick(locale, "Study options", "خيارات المذاكرة") })
      .locator("summary")
      .click();
    await page
      .getByRole("link", {
        name: b07SourcesName(locale),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", {
        name: pick(locale, "Return to Chat", "العودة للمحادثة"),
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`${unit}/chat\\?lang=${locale}$`, "u"),
    );
    finish();
  });

  test(`audit batch 01 ${locale}: visible navigation, separated return and compact settings`, async ({
    page,
  }) => {
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
    for (const theme of ["light", "dark"]) {
      await chooseTheme(page, theme);
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        const returnBox = await returnLink.boundingBox();
        const tabsBox = await tabs.boundingBox();
        expect(returnBox).not.toBeNull();
        expect(tabsBox).not.toBeNull();
        expect(
          tabsBox!.y - (returnBox!.y + returnBox!.height),
        ).toBeGreaterThanOrEqual(20);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        if (width === 820) {
          const labels = await page
            .getByRole("navigation", {
              name: pick(locale, "Product navigation", "تنقل المنتج"),
            })
            .locator("a > span:not([class*='profileMarker']), a > bdi")
            .filter({ visible: true })
            .evaluateAll((elements) =>
              elements
                .map((element) => {
                  const box = element.getBoundingClientRect();
                  return {
                    width: box.width,
                    height: box.height,
                    clip: getComputedStyle(element).clipPath,
                  };
                })
                .filter((label) => label.width > 0 && label.height > 0),
            );
          expect(labels).toHaveLength(3);
          expect(
            labels.every(
              (label) =>
                label.width > 20 && label.height > 10 && label.clip === "none",
            ),
          ).toBe(true);
        }
        if (width < 768) {
          const boxes = await tabs.getByRole("tab").evaluateAll((elements) =>
            elements.map((element) => {
              const box = element.getBoundingClientRect();
              return { y: box.y, height: box.height, width: box.width };
            }),
          );
          expect(boxes).toHaveLength(4);
          expect(Math.abs(boxes[0]!.y - boxes[1]!.y)).toBeLessThan(2);
          expect(Math.abs(boxes[2]!.y - boxes[3]!.y)).toBeLessThan(2);
          expect(
            boxes.every((box) => box.height >= 44 && box.width >= 44),
          ).toBe(true);
          expect(tabsBox!.height).toBeLessThanOrEqual(130);
        }
      }
      await page.addStyleTag({ content: "html { font-size: 200% }" });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await expect(tabs.getByRole("tab")).toHaveCount(4);
      await page.addStyleTag({ content: "html { font-size: 100% }" });
    }
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
        name: pick(locale, "Save academic settings", "حفظ الإعدادات الدراسية"),
        exact: true,
      }),
    ).toBeVisible();
    await academic.press("Home");
    await expect(appearance).toBeFocused();
    await returnLink.click();
    await expect(page).toHaveURL(`${unit}/chat?lang=${locale}`);
    const switcher = page
      .locator("header summary")
      .filter({ hasText: b07DetailsName(locale) });
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
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await expect(switcher).toBeVisible();
    await switcher.press("Enter");
    await expect(subjects).toBeVisible();
    await expectContainedUnitMenu();
    await switcher.press("Enter");
    await page.addStyleTag({ content: "html { font-size: 100% }" });
    finish();
  });
}

async function showAccountView(
  page: Page,
  view: "appearance" | "academic" | "privacy" | "identity",
) {
  const labels = {
    appearance: /^(Appearance|المظهر)$/u,
    academic: /^(Academic settings|الإعدادات الدراسية)$/u,
    privacy: /^(Privacy|الخصوصية)$/u,
    identity: /^(Identity and access|الهوية والوصول)$/u,
  };
  const tab = page.getByRole("tab", { name: labels[view] });
  await tab.click();
}
async function chooseTheme(page: Page, value: string) {
  await showAccountView(page, "appearance");
  await page
    .getByRole("group", { name: /^(Theme|السمة)$/u })
    .locator(`input[value="${value}"]`)
    .check();
}
for (const locale of ["en", "ar"] as const) {
  test(`workspace revision ${locale}: profile, independent settings, scoped subjects and first-visit citations`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/chat");
    const nav = page.getByRole("navigation", {
      name: pick(locale, "Product navigation", "تنقل المنتج"),
    });
    await expect(
      nav.getByRole("link", { name: "Samir Hassan", exact: true }),
    ).toBeVisible();
    await expect(
      nav.locator('a[data-account] b[aria-hidden="true"]'),
    ).toHaveText("S");
    await expect(
      page.getByRole("complementary", {
        name: pick(locale, "Citation help", "مساعدة الاستشهادات"),
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: pick(locale, "Got it", "فهمت"),
        exact: true,
      })
      .click();
    const languages = () =>
      page.getByRole("group", {
        name: pick(locale, "Study language", "لغة المذاكرة"),
        exact: true,
      });
    await languages().locator('input[value="mixed"]').check();
    await send(page, "supported", locale);
    const citation = page.getByRole("button", {
      name: pick(locale, "Handout · p. 3", "الملزمة · ص ٣"),
      exact: true,
    });
    await citation.click();
    const dialog = page.getByRole("dialog", {
      name: pick(locale, "Source excerpt", "نص المصدر"),
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("blockquote")).toContainText(
      pick(locale, "Identify the labels", "حدد الأسماء"),
    );
    await page.keyboard.press("Escape");
    await expect(citation).toBeFocused();
    await openSessionTools(page, locale);
    await page
      .getByRole("button", {
        name: pick(locale, "New session", "جلسة جديدة"),
        exact: true,
      })
      .click();
    await expect(languages().locator('input[value="mixed"]')).toBeChecked();
    await navigate(page, "/settings", locale);
    await expect(page.getByRole("tabpanel")).toHaveCount(1);
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Your account", "حسابك"),
        exact: true,
      }),
    ).toHaveCount(0);
    await showAccountView(page, "academic");
    await page
      .getByLabel(pick(locale, "Education stage", "المرحلة التعليمية"), {
        exact: true,
      })
      .selectOption("university");
    await page
      .getByLabel(pick(locale, "University", "الجامعة"), { exact: true })
      .selectOption("zagazig-university");
    await page
      .getByLabel(pick(locale, "Faculty or program", "الكلية أو البرنامج"), {
        exact: true,
      })
      .selectOption("human-medicine");
    const year = page.getByLabel(
      pick(locale, "Academic year", "السنة الدراسية"),
      { exact: true },
    );
    await year.selectOption("human-medicine-year-2");
    await showAccountView(page, "appearance");
    await expect(year).not.toBeVisible();
    await showAccountView(page, "academic");
    await expect(year).toHaveValue("human-medicine-year-2");
    await showAccountView(page, "identity");
    await expect(page.getByRole("tabpanel")).toHaveCount(1);
    await expect(
      page.getByRole("button", {
        name: pick(locale, "Sign out", "تسجيل الخروج"),
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("tab", {
        name: pick(locale, "Identity and access", "الهوية والوصول"),
        exact: true,
      })
      .press("Home");
    await expect(
      page.getByRole("tab", {
        name: pick(locale, "Appearance", "المظهر"),
        exact: true,
      }),
    ).toBeFocused();
    await navigate(page, unit + "/chat", locale);
    await expect(
      page.getByRole("complementary", {
        name: pick(locale, "Citation help", "مساعدة الاستشهادات"),
      }),
    ).toHaveCount(0);
    await page
      .locator("summary")
      .filter({ hasText: b07DetailsName(locale) })
      .click();
    const subjects = page.getByRole("navigation", {
      name: b07UnitsName(locale),
    });
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
    const otherSubject = subjects
      .getByRole("link")
      .filter({ hasNotText: pick(locale, "Anatomy", "علم التشريح") })
      .first();
    const otherTitle = (await otherSubject.innerText()).trim();
    await otherSubject.click();
    await expect(
      page.getByRole("heading", { name: otherTitle, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", {
        name: pick(locale, "Conversation", "المحادثة الحالية"),
      }),
    ).toBeVisible();
    await page
      .locator("summary")
      .filter({ hasText: b07DetailsName(locale) })
      .click();
    await page
      .getByRole("navigation", {
        name: b07UnitsName(locale),
      })
      .getByRole("link", {
        name: pick(locale, "Anatomy", "علم التشريح"),
        exact: true,
      })
      .click();
    await navigate(page, unit, locale);
    await expect(
      page.getByRole("link", {
        name: pick(locale, "View material details", "عرض تفاصيل المواد"),
        exact: true,
      }),
    ).toHaveCount(0);
    finish();
  });
  test(`workspace revision ${locale}: quiz count, difficulty, chosen timer and invalid input`, async ({
    page,
  }) => {
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
      .getByRole("radio", { name: pick(locale, "Timed", "مؤقت"), exact: true })
      .check();
    await page
      .getByLabel(pick(locale, "Duration (minutes)", "المدة (بالدقائق)"), {
        exact: true,
      })
      .fill("3");
    const rect = await start.boundingBox();
    const panel = await start.locator("..").boundingBox();
    expect(
      Math.abs(rect!.x + rect!.width / 2 - panel!.x - panel!.width / 2),
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
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`workspace revision ${locale}: all student sections use available width and reflow in both themes`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale);
    for (const value of [
      "university",
      "zagazig-university",
      "human-medicine",
      "human-medicine-year-1",
      "human-medicine-year-1-term-1",
    ]) {
      await page.locator(`input[value="${value}"]`).check();
      await page
        .getByRole("button", {
          name: pick(
            locale,
            value.endsWith("term-1") ? "Review choices" : "Continue",
            value.endsWith("term-1") ? "مراجعة الاختيارات" : "متابعة",
          ),
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
        name: pick(locale, "In your workspace", "داخل مساحة مذاكرتك"),
        exact: true,
      }),
    ).toHaveCount(0);
    for (const theme of ["light", "dark"]) {
      await navigate(page, "/settings", locale);
      await chooseTheme(page, theme);
      for (const screen of [
        "study",
        "subjects",
        "materials",
        "chat",
        "studio",
        "quiz",
        "settings",
      ]) {
        if (screen === "study" || screen === "subjects") {
          await page
            .getByRole("navigation", {
              name: pick(locale, "Product navigation", "تنقل المنتج"),
            })
            .getByRole("link", {
              name: pick(
                locale,
                screen === "study" ? "Study" : "Subjects",
                screen === "study" ? "المذاكرة" : "المواد",
              ),
              exact: true,
            })
            .click();
        } else if (screen === "materials") {
          await page
            .getByRole("link", {
              name: pick(locale, "Open Anatomy", "فتح علم التشريح"),
              exact: true,
            })
            .click();
        } else
          await navigate(
            page,
            screen === "settings" ? "/settings" : unit + "/" + screen,
            locale,
          );
        if (screen === "subjects")
          await expect(
            page.getByRole("link", {
              name: pick(locale, "Academic settings", "الإعدادات الدراسية"),
              exact: true,
            }),
          ).toHaveCount(0);
        if (
          screen === "chat" &&
          (await page
            .getByRole("button", {
              name: pick(locale, "Got it", "فهمت"),
              exact: true,
            })
            .count())
        )
          await page
            .getByRole("button", {
              name: pick(locale, "Got it", "فهمت"),
              exact: true,
            })
            .click();
        for (const width of [1440, 768, 390, 320]) {
          await page.setViewportSize({ width, height: 900 });
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          ).toBe(true);
          await expect(page.getByRole("main")).toBeVisible();
          if (screen === "chat")
            expect(
              await page
                .getByRole("region", {
                  name: pick(locale, "Conversation", "المحادثة الحالية"),
                })
                .locator("..")
                .evaluate(
                  (element) => element.scrollWidth <= element.clientWidth + 1,
                ),
            ).toBe(true);
          if (width === 1440) {
            await expect
              .poll(
                async () =>
                  (await page.getByRole("main").boundingBox())?.width ?? 0,
              )
              .toBeGreaterThan(1200);
            const main = await page.getByRole("main").boundingBox();
            if (screen === "chat") {
              await expect(
                page.getByRole("region", {
                  name: pick(locale, "Conversation", "المحادثة الحالية"),
                }),
              ).toBeVisible();
              const conversation = await page
                .getByRole("region", {
                  name: pick(locale, "Conversation", "المحادثة الحالية"),
                })
                .boundingBox();
              expect(conversation!.width).toBeGreaterThan(main!.width - 110);
              expect(conversation!.height).toBeGreaterThan(125);
            }
          }
        }
        await page.addStyleTag({ content: "html { font-size: 200% }" });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        if (screen === "chat")
          expect(
            await page
              .getByRole("region", {
                name: pick(locale, "Conversation", "المحادثة الحالية"),
              })
              .locator("..")
              .evaluate(
                (element) => element.scrollWidth <= element.clientWidth + 1,
              ),
          ).toBe(true);
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(axe.violations).toEqual([]);
        await page.addStyleTag({ content: "html { font-size: 100% }" });
      }
    }
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`audit batch 03 ${locale}: named resume and grouped searchable subjects`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale);
    for (const value of [
      "university",
      "zagazig-university",
      "human-medicine",
      "human-medicine-year-1",
      "human-medicine-year-1-term-1",
    ]) {
      await page.locator(`input[value="${value}"]`).check();
      await page
        .getByRole("button", {
          name: value.endsWith("term-1")
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
    await page
      .getByRole("link", {
        name: b07ChooseName(locale),
        exact: true,
      })
      .click();
    await page
      .getByRole("link", {
        name: pick(locale, "Open Anatomy", "فتح علم التشريح"),
        exact: true,
      })
      .click();
    await navigate(page, unit + "/studio", locale);
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: pick(locale, "Shape the result", "شكّل المخرج"),
        exact: true,
      }),
    ).toBeVisible();
    const globalNavigation = page.getByRole("navigation", {
      name: pick(locale, "Product navigation", "تنقل المنتج"),
      exact: true,
    });
    await globalNavigation
      .getByRole("link", {
        name: pick(locale, "Study", "المذاكرة"),
        exact: true,
      })
      .click();
    const resume = page.getByRole("link", {
      name: pick(locale, "Resume Anatomy", "متابعة علم التشريح"),
      exact: true,
    });
    await expect(resume).toHaveAttribute(
      "href",
      unit + `/studio?lang=${locale}`,
    );
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.setViewportSize({ width: 320, height: 900 });
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
      await expect(resume).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await enlarged.evaluate((element) =>
        element.parentNode?.removeChild(element),
      );
    }
    await expect(page.locator("section").filter({ has: resume })).toContainText(
      pick(locale, "Anatomy · Studio", "علم التشريح · الاستوديو"),
    );
    await resume.focus();
    await resume.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/studio\\?lang=${locale}`));
    await navigate(page, unit + "/chat", locale);
    await expect(
      page.getByLabel(pick(locale, "Message", "السؤال"), { exact: true }),
    ).toBeVisible();
    await globalNavigation
      .getByRole("link", {
        name: pick(locale, "Study", "المذاكرة"),
        exact: true,
      })
      .click();
    await expect(resume).toHaveAttribute("href", unit + `/chat?lang=${locale}`);
    await expect(page.locator("section").filter({ has: resume })).toContainText(
      pick(locale, "Anatomy · Chat", "علم التشريح · المحادثة"),
    );
    await globalNavigation
      .getByRole("link", {
        name: pick(locale, "Subjects", "المواد"),
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: pick(locale, "Modules", "وحدات"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("searchbox", {
        name: pick(locale, "Search modules", "البحث في وحدات"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Your modules", "قائمة وحدات"),
        exact: true,
      }),
    ).toBeVisible();
    const rows = page.locator("li[data-unit-id] > a");
    await expect(rows).toHaveCount(5);
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await expectOriginalTypography(page, locale);
        const geometry = await rows.first().evaluate((row) => {
          const title = row.querySelector("bdi")!.getBoundingClientRect();
          const status = row
            .querySelector('span[class*="ready"]')!
            .getBoundingClientRect();
          const rtl = document.documentElement.dir === "rtl";
          return {
            height: row.getBoundingClientRect().height,
            gap: rtl ? title.left - status.right : status.left - title.right,
            y: Math.abs(title.top - status.top),
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
          };
        });
        expect(geometry.overflow).toBe(false);
        expect(geometry.gap).toBeGreaterThanOrEqual(0);
        expect(geometry.gap).toBeLessThanOrEqual(17);
        expect(geometry.y).toBeLessThan(12);
        if (width <= 390) expect(geometry.height).toBeLessThan(100);
      }
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
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
      await enlarged.evaluate((element) =>
        element.parentNode?.removeChild(element),
      );
    }
    const search = page.getByRole("searchbox");
    await search.fill("Anatomy");
    await expect(rows).toHaveCount(1);
    await search.fill("no-matching-subject");
    await expect(rows).toHaveCount(0);
    await page
      .getByRole("button", {
        name: pick(locale, "Clear search", "مسح البحث"),
        exact: true,
      })
      .click();
    await expect(rows).toHaveCount(5);
    await page
      .getByRole("link", {
        name: pick(locale, "Open Anatomy", "فتح علم التشريح"),
        exact: true,
      })
      .press("Enter");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: pick(locale, "Anatomy", "علم التشريح"),
        exact: true,
      }),
    ).toBeVisible();
    finish();
  });

  test(`audit batch 03 ${locale}: accessible language scope and aligned Chat tools retain drafts and sessions`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/chat");
    await page
      .getByRole("button", {
        name: pick(locale, "Got it", "فهمت"),
        exact: true,
      })
      .click();
    const interfaceGroup = () =>
      page.getByRole("group", {
        name: pick(locale, "Interface language", "لغة الواجهة"),
        exact: true,
      });
    const scopeLabel = () =>
      page.getByText(pick(locale, "Interface language", "لغة الواجهة"), {
        exact: true,
      });
    const sources = page.getByRole("link", {
      name: b07SourcesName(locale),
      exact: true,
    });
    const sessions = page
      .locator("summary")
      .filter({ hasText: pick(locale, "Sessions", "الجلسات") })
      .first();
    const languages = page.getByRole("group", {
      name: pick(locale, "Study language", "لغة المذاكرة"),
      exact: true,
    });
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await expect(scopeLabel()).toHaveCount(0);
        await expect(interfaceGroup()).toBeVisible();
        const narrow = width < 768;
        const first = await sessions.boundingBox();
        const second = await (
          narrow ? studyOptionsSummary(page, locale) : sources
        ).boundingBox();
        expect(Math.abs(first!.y - second!.y)).toBeLessThan(2);
        await openStudyOptions(page, locale);
        const choices = await languages.boundingBox();
        expect(choices!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
        if (narrow) await studyOptionsSummary(page, locale).click();
        await sessions.press("Enter");
        const popup = await sessions
          .locator("..")
          .locator(":scope > div")
          .boundingBox();
        expect(popup!.x).toBeGreaterThanOrEqual(0);
        expect(popup!.x + popup!.width).toBeLessThanOrEqual(width + 1);
        await sessions.press("Escape");
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
      await expect(scopeLabel()).toHaveCount(0);
      await expect(interfaceGroup()).toBeVisible();
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
      await enlarged.evaluate((element) =>
        element.parentNode?.removeChild(element),
      );
    }
    await sessions.press("Enter");
    await expect(
      page.getByRole("button", {
        name: pick(locale, "New session", "جلسة جديدة"),
        exact: true,
      }),
    ).toBeVisible();
    await sessions.press("Escape");
    await expect(sessions).toBeFocused();
    await openStudyOptions(page, locale);
    await languages.locator('input[value="mixed"]').check();
    const message = page.getByLabel(pick(locale, "Message", "السؤال"), {
      exact: true,
    });
    const prompt = promptExamples.supported[locale === "ar" ? 1 : 0];
    await message.fill(prompt);
    const alternate = locale === "en" ? "ar" : "en";
    await interfaceGroup()
      .getByRole("button", {
        name: alternate === "ar" ? "العربية" : "English",
        exact: true,
      })
      .press("Enter");
    await expect(
      page.getByLabel(pick(alternate, "Message", "السؤال"), { exact: true }),
    ).toHaveValue(prompt);
    await expect(
      page
        .getByRole("group", {
          name: pick(alternate, "Study language", "لغة المذاكرة"),
          exact: true,
        })
        .locator('input[value="mixed"]'),
    ).toBeChecked();
    await page
      .getByRole("group", {
        name: pick(alternate, "Interface language", "لغة الواجهة"),
        exact: true,
      })
      .getByRole("button", {
        name: locale === "ar" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await message.press("Enter");
    await expect(page.locator("article")).toHaveCount(1);
    await sessions.press("Enter");
    await page
      .getByRole("button", {
        name: pick(locale, "New session", "جلسة جديدة"),
        exact: true,
      })
      .click();
    await expect(page.locator("article")).toHaveCount(0);
    await sessions.press("Enter");
    await page
      .getByRole("button", {
        name: new RegExp(pick(locale, "Session 1", "جلسة [١1]")),
      })
      .click();
    await expect(page.locator("article")).toHaveCount(1);
    await openStudyOptions(page, locale);
    await sources.press("Enter");
    await expect(
      page.getByRole("link", {
        name: pick(locale, "Return to Chat", "العودة للمحادثة"),
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("link", {
        name: pick(locale, "Return to Chat", "العودة للمحادثة"),
        exact: true,
      })
      .click();
    await expect(page.locator("article")).toHaveCount(1);
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`audit batch 04 ${locale}: plain material metadata and discoverable Studio options`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale, unit);
    await expect(
      page.getByText(
        pick(locale, "Sample edition 2026–2027", "إصدار تجريبي ٢٠٢٦–٢٠٢٧"),
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByText("synthetic-2026-2027", { exact: true }),
    ).toHaveCount(0);
    const missingReference = pick(
      locale,
      "No verified page or timestamp reference",
      "لا يوجد مرجع موثّق لصفحة أو توقيت",
    );
    await expect(
      page.getByText(missingReference, { exact: false }),
    ).toHaveCount(6);
    await expect(page.locator("article")).toHaveCount(8);
    await expect(
      page.getByText(pick(locale, "Sample page 3", "صفحة تجريبية ٣"), {
        exact: false,
      }),
    ).toHaveCount(2);
    const excerpt = page.locator("article summary").first();
    await excerpt.press("Enter");
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
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await enlarged.evaluate((element) =>
        element.parentNode?.removeChild(element),
      );
    }
    await navigate(page, unit + "/studio", locale);
    const focus = page.getByRole("combobox", {
      name: pick(locale, "Study focus", "محور المذاكرة"),
      exact: true,
    });
    await expect(focus).toHaveValue("sequence");
    await focus.selectOption("comparison");
    const disclosure = page.locator(
      "details[class*='secondaryOptions'] summary",
    );
    const depth = page.getByRole("combobox", {
      name: pick(locale, "Depth", "التفصيل"),
      exact: true,
    });
    await disclosure.press("Enter");
    await depth.selectOption("detailed");
    await page
      .getByRole("combobox", {
        name: pick(locale, "Size", "الحجم"),
        exact: true,
      })
      .selectOption("extended");
    await disclosure.press("Space");
    await expect(depth).not.toBeVisible();
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await expectOriginalTypography(page, locale);
        const emphasis = await disclosure.evaluate((element) => ({
          height: element.getBoundingClientRect().height,
          weight: Number(getComputedStyle(element).fontWeight),
          color: getComputedStyle(element).color,
          parentColor: getComputedStyle(element.closest("main")!).color,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        }));
        expect(emphasis.height).toBeGreaterThanOrEqual(44);
        expect(emphasis.weight).toBeGreaterThanOrEqual(600);
        expect(emphasis.color).toBe(emphasis.parentColor);
        expect(emphasis.overflow).toBe(false);
      }
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
      await disclosure.press("Enter");
      await expect(depth).toBeVisible();
      await expect(depth).toHaveValue("detailed");
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
      await disclosure.press("Space");
      await enlarged.evaluate((element) =>
        element.parentNode?.removeChild(element),
      );
    }
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
      page.getByText(
        pick(locale, "Selected study focus", "محور المذاكرة المختار"),
        { exact: false },
      ),
    ).toBeVisible();
    await page
      .getByRole("link", {
        name: b07SourcesName(locale),
        exact: true,
      })
      .click();
    await expect(
      page.getByText(missingReference, { exact: false }),
    ).toHaveCount(6);
    await page
      .getByRole("link", {
        name: pick(locale, "Return to Studio", "العودة للاستوديو"),
        exact: true,
      })
      .click();
    await expect(focus).toHaveValue("comparison");
    await disclosure.press("Enter");
    await expect(depth).toHaveValue("detailed");
    finish();
  });

  test(`audit batch 04 ${locale}: quiz inputs follow one centered path with equivalent labels`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/quiz");
    const configuration = page.locator("div[class*='quizConfiguration']");
    const start = page.getByRole("button", {
      name: pick(locale, "Start quiz", "بدء الاختبار"),
      exact: true,
    });
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const timed of [false, true]) {
          await page
            .getByRole("radio", {
              name: timed
                ? pick(locale, "Timed", "مؤقت")
                : pick(locale, "Untimed", "دون توقيت"),
              exact: true,
            })
            .check();
          const layout = await configuration.evaluate((element) => {
            const box = element.getBoundingClientRect();
            const panel = element.parentElement!.getBoundingClientRect();
            const fields = [...element.children]
              .filter((child) =>
                child.matches("fieldset,label,[class*='questionCount']"),
              )
              .map((child) => {
                const rect = child.getBoundingClientRect();
                const label = child.querySelector("legend,label") ?? child;
                const style = getComputedStyle(label);
                return {
                  x: rect.x,
                  y: rect.y,
                  bottom: rect.bottom,
                  width: rect.width,
                  size: style.fontSize,
                  weight: style.fontWeight,
                  color: style.color,
                };
              });
            return {
              width: box.width,
              center: box.x + box.width / 2,
              panelCenter: panel.x + panel.width / 2,
              fields,
              overflow: document.documentElement.scrollWidth > innerWidth + 1,
            };
          });
          expect(layout.width).toBeLessThanOrEqual(512);
          expect(Math.abs(layout.center - layout.panelCenter)).toBeLessThan(2);
          expect(layout.overflow).toBe(false);
          for (const [index, field] of layout.fields.entries()) {
            expect(Math.abs(field.x - layout.fields[0]!.x)).toBeLessThan(1);
            expect(field.width).toBeCloseTo(layout.width, 0);
            expect([field.size, field.weight, field.color]).toEqual([
              layout.fields[0]!.size,
              layout.fields[0]!.weight,
              layout.fields[0]!.color,
            ]);
            if (index)
              expect(field.y).toBeGreaterThanOrEqual(
                layout.fields[index - 1]!.bottom + 19,
              );
          }
          const action = await start.boundingBox();
          expect(
            Math.abs(action!.x + action!.width / 2 - layout.center),
          ).toBeLessThan(2);
        }
        await expectOriginalTypography(page, locale);
      }
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
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
      await enlarged.evaluate((element) =>
        element.parentNode?.removeChild(element),
      );
    }
    await page
      .getByLabel(pick(locale, "Number of questions", "عدد الأسئلة"), {
        exact: true,
      })
      .fill("7");
    await expect(start).toBeDisabled();
    await page
      .getByLabel(pick(locale, "Number of questions", "عدد الأسئلة"), {
        exact: true,
      })
      .fill("3");
    await expect(start).toBeEnabled();
    await start.press("Enter");
    await expect(
      page.locator('fieldset:has(input[name^="sample-question-"])'),
    ).toHaveCount(3);
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`audit batch 05 ${locale}: settings naming, readable theme preview and separated privacy disclosures`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale, "/settings");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: pick(locale, "Settings", "الإعدادات"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("banner")
        .getByText(pick(locale, "Settings", "الإعدادات"), { exact: true }),
    ).toBeVisible();
    const preview = page.locator("#appearance-settings figure");
    await expect(
      preview.getByText(pick(locale, "Example screen", "شاشة نموذجية"), {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      preview.getByText(
        pick(locale, "Example supporting text", "نص توضيحي للمعاينة"),
        { exact: true },
      ),
    ).toBeVisible();
    await expect(preview.locator("figcaption")).toHaveText(
      pick(locale, "Theme preview", "معاينة السمة"),
    );
    const backgrounds = [];
    for (const theme of ["light", "dark"] as const) {
      await chooseTheme(page, theme);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      backgrounds.push(
        await preview.evaluate((e) => getComputedStyle(e).backgroundColor),
      );
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await expectOriginalTypography(page, locale);
        const layout = await preview.evaluate((e) => {
          const r = e.getBoundingClientRect();
          const choices = e
            .parentElement!.querySelector("fieldset")!
            .getBoundingClientRect();
          return {
            gap: r.top - choices.bottom,
            x: r.x,
            right: r.right,
            choicesX: choices.x,
            choicesRight: choices.right,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            controls: e.querySelectorAll("a,button,input").length,
          };
        });
        expect(layout.gap).toBeGreaterThanOrEqual(15);
        expect(
          locale === "en"
            ? Math.abs(layout.x - layout.choicesX)
            : Math.abs(layout.right - layout.choicesRight),
        ).toBeLessThan(2);
        expect(layout.overflow).toBe(false);
        expect(layout.controls).toBe(0);
      }
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
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
      await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
    }
    expect(backgrounds[0]).not.toBe(backgrounds[1]);
    await chooseTheme(page, "system");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await showAccountView(page, "privacy");
    const details = page.locator("#privacy-settings dl");
    await expect(details.locator("dt")).toHaveText([
      pick(locale, "Earlier exchanges", "المحادثات السابقة"),
      pick(locale, "Saving and retention", "الحفظ والاحتفاظ"),
      pick(locale, "Reported exchanges", "المحادثات المبلغ عنها"),
    ]);
    expect((await details.locator("dd").allTextContents()).join(" ")).toBe(
      pick(
        locale,
        "Earlier exchanges keep their recorded mode. Private mode is separate from saving and retention. Qualifying reports permit audited review of the reported exchange only; the disclosure wording is still being confirmed.",
        "تحتفظ المحادثات السابقة بوضعها المسجل. الخصوصية منفصلة عن الحفظ والاحتفاظ. البلاغ المؤهل يسمح بمراجعة المحادثة المبلغ عنها فقط مع التدقيق؛ صياغة الإفصاح ما زالت قيد التأكيد.",
      ),
    );
    await expect(
      page.getByText(
        pick(
          locale,
          "Retention settings are still being confirmed. No retention period or deletion action is available here yet.",
          "إعدادات الاحتفاظ ما زالت قيد التأكيد. لا تتوفر هنا مدة احتفاظ أو إجراءات حذف بعد.",
        ),
        { exact: true },
      ),
    ).toBeVisible();
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
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
      await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
    }
    finish();
  });

  test(`audit batch 05 ${locale}: surfaced Sessions and readable sharing status retain native keyboard and drafts`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale, unit + "/chat");
    await page
      .getByRole("button", {
        name: pick(locale, "Got it", "فهمت"),
        exact: true,
      })
      .click();
    const sessions = page.locator(
      'summary[aria-label="' +
        pick(locale, "Sessions and privacy", "الجلسات والخصوصية") +
        '"]',
    );
    const meta = page.locator("form p[class*='composerMeta']");
    await expect(meta.locator("strong")).toHaveText(
      pick(locale, "Founder-visible by default", "ظاهر للمؤسسين افتراضيًا"),
    );
    await expect(meta.locator("span")).toHaveText(
      pick(
        locale,
        "Enter to send; Shift+Enter for a new line",
        "Enter للإرسال؛ Shift+Enter لسطر جديد",
      ),
    );
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        const style = await sessions.evaluate((e) => ({
          height: e.getBoundingClientRect().height,
          border: getComputedStyle(e).borderTopWidth,
          size: parseFloat(getComputedStyle(e).fontSize),
        }));
        expect(style.height).toBeGreaterThanOrEqual(44);
        expect(style.border).toBe("1px");
        expect(style.size).toBeGreaterThanOrEqual(14);
        const note = await meta.locator("strong").evaluate((e) => ({
          weight: Number(getComputedStyle(e).fontWeight),
          size: parseFloat(getComputedStyle(e).fontSize),
          color: getComputedStyle(e).color,
          mainColor: getComputedStyle(e.closest("main")!).color,
        }));
        expect(note.weight).toBeGreaterThanOrEqual(600);
        expect(note.size).toBeGreaterThanOrEqual(14);
        expect(note.color).toBe(note.mainColor);
        await sessions.press("Enter");
        const menu = await sessions
          .locator("..")
          .locator(":scope > div")
          .boundingBox();
        const control = await sessions.boundingBox();
        if (width >= 768)
          expect(menu!.y).toBeGreaterThanOrEqual(
            control!.y + control!.height + 7,
          );
        else expect(menu!.y).toBeGreaterThanOrEqual(0);
        expect(menu!.x).toBeGreaterThanOrEqual(0);
        expect(menu!.x + menu!.width).toBeLessThanOrEqual(width + 1);
        await sessions.press("Escape");
        await expect(sessions).toBeFocused();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        await expectOriginalTypography(page, locale);
      }
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
      await sessions.press("Enter");
      await expect(
        page.getByRole("button", {
          name: pick(locale, "New session", "جلسة جديدة"),
          exact: true,
        }),
      ).toBeVisible();
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
      await sessions.press("Escape");
      await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
    }
    const message = page.getByLabel(pick(locale, "Message", "السؤال"), {
      exact: true,
    });
    const prompt = promptExamples.supported[locale === "ar" ? 1 : 0];
    await message.fill(prompt);
    await sessions.press("Enter");
    await page
      .getByRole("link", {
        name: pick(locale, "Privacy settings", "إعدادات الخصوصية"),
        exact: true,
      })
      .click();
    await page
      .getByRole("radio", {
        name: pick(locale, "Private / no sharing", "خاص / عدم مشاركة"),
        exact: true,
      })
      .check();
    await page
      .getByRole("link", {
        name: pick(
          locale,
          "Return to Chat · Anatomy",
          "العودة إلى المحادثة · علم التشريح",
        ),
        exact: true,
      })
      .click();
    await expect(message).toHaveValue(prompt);
    await expect(meta.locator("strong")).toHaveText(
      pick(locale, "Private for future exchanges", "المحادثات القادمة خاصة"),
    );
    await message.press("Control+End");
    await message.press("Shift+Enter");
    await expect(message).toHaveValue(prompt + "\n");
    await message.press("Enter");
    await expect(page.locator("article")).toHaveCount(1);
    await expect(
      page
        .locator("article")
        .getByText(pick(locale, "Private", "خاص"), { exact: true }),
    ).toBeVisible();
    finish();
  });

  test(`audit batch 05 ${locale}: disabled setup action is neutral until a valid choice`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale);
    const next = page.getByRole("button", {
      name: pick(locale, "Continue", "متابعة"),
      exact: true,
    });
    const radio = page.locator('input[value="university"]');
    let disabledBackground = "";
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await expect(next).toBeDisabled();
        const inactive = await next.evaluate((e) => ({
          background: getComputedStyle(e).backgroundColor,
          opacity: getComputedStyle(e).opacity,
          cursor: getComputedStyle(e).cursor,
        }));
        disabledBackground = inactive.background;
        expect(inactive.opacity).toBe("1");
        expect(inactive.cursor).toBe("not-allowed");
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
      await expect(next).toBeDisabled();
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
      await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
    }
    await radio.press("Space");
    await expect(next).toBeEnabled();
    expect(
      await next.evaluate((e) => getComputedStyle(e).backgroundColor),
    ).not.toBe(disabledBackground);
    await next.press("Enter");
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "University", "الجامعة"),
        exact: true,
      }),
    ).toBeFocused();
    await expect(next).toBeDisabled();
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`audit batch 06 ${locale}: academic setup hierarchy, category copy and bounded references preserve configured paths`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale);
    const section = page.locator(
      'section[aria-labelledby="academic-settings-heading"]',
    );
    const next = page.getByRole("button", {
      name: pick(locale, "Continue", "متابعة"),
      exact: true,
    });
    const back = page.getByRole("button", {
      name: pick(locale, "Back", "رجوع"),
      exact: true,
    });
    const review = page.getByRole("button", {
      name: pick(locale, "Review choices", "مراجعة الاختيارات"),
      exact: true,
    });
    const category = pick(locale, "Faculty or program", "الكلية أو البرنامج");
    const referenceLayout = async () => {
      const layout = await section
        .locator("[class*='settingsReference']")
        .evaluate((element, language) => {
          const bounds = (needle: string) => {
            const walker = document.createTreeWalker(
              element,
              NodeFilter.SHOW_TEXT,
            );
            const nodes: Text[] = [];
            while (walker.nextNode()) nodes.push(walker.currentNode as Text);
            const start = element.textContent!.indexOf(needle);
            if (start < 0) throw new Error("Missing academic reference token");
            const range = document.createRange();
            let offset = 0;
            for (const node of nodes) {
              const end = offset + node.length;
              if (start >= offset && start < end)
                range.setStart(node, start - offset);
              if (
                start + needle.length > offset &&
                start + needle.length <= end
              ) {
                range.setEnd(node, start + needle.length - offset);
                break;
              }
              offset = end;
            }
            const r = range.getBoundingClientRect();
            return { y: r.y, height: r.height };
          };
          return {
            arrow: bounds(language === "ar" ? "←" : "→"),
            destination: bounds(language === "ar" ? "الإعدادات" : "Academic"),
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            controls: element.querySelectorAll("a,button,input").length,
          };
        }, locale);
      expect(Math.abs(layout.arrow.y - layout.destination.y)).toBeLessThan(2);
      expect(layout.overflow).toBe(false);
      expect(layout.controls).toBe(0);
    };
    const inspectSetup = async () => {
      for (const theme of ["light", "dark"] as const) {
        await page.emulateMedia({
          colorScheme: theme,
          reducedMotion: "reduce",
        });
        for (const width of [1440, 900, 820, 390, 320]) {
          await page.setViewportSize({ width, height: 1000 });
          const layout = await section.evaluate((element) => {
            const parent = element.querySelector("h1")!;
            const step = element.querySelector("h2")!;
            const setup = step.parentElement!;
            return {
              parentSize: parseFloat(getComputedStyle(parent).fontSize),
              stepSize: parseFloat(getComputedStyle(step).fontSize),
              sectionWidth: element.getBoundingClientRect().width,
              setupWidth: setup.getBoundingClientRect().width,
              border: getComputedStyle(element).borderBottomWidth,
              overflow: document.documentElement.scrollWidth > innerWidth + 1,
            };
          });
          expect(layout.parentSize).toBeGreaterThan(layout.stepSize);
          expect(
            Math.abs(layout.sectionWidth - layout.setupWidth),
          ).toBeLessThan(2);
          expect(layout.border).toBe("1px");
          expect(layout.overflow).toBe(false);
          await referenceLayout();
          await expectOriginalTypography(page, locale);
        }
        const enlarged = await page.addStyleTag({
          content: "html { font-size: 200% }",
        });
        await referenceLayout();
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        await enlarged.evaluate((element) =>
          element.parentNode?.removeChild(element),
        );
      }
    };
    await expect(section.locator("p").first()).toContainText(
      pick(locale, "Choose your academic path.", "اختر مسارك الدراسي."),
    );
    await expect(next).toBeDisabled();
    await inspectSetup();
    await page.locator('input[value="thanaweya-amma"]').press("Space");
    await next.press("Enter");
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Track", "المسار"),
        exact: true,
      }),
    ).toBeFocused();
    await back.click();
    await page.locator('input[value="university"]').check();
    await next.click();
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "University", "الجامعة"),
        exact: true,
      }),
    ).toBeFocused();
    await page.locator('input[value="zagazig-university"]').check();
    await next.click();
    await expect(
      page.getByRole("heading", { name: category, exact: true }),
    ).toBeFocused();
    await expect(
      page
        .getByRole("group", { name: category, exact: true })
        .getByRole("radio"),
    ).toHaveCount(3);
    await page.locator('input[value="synthetic-credit-program"]').check();
    await review.click();
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Your academic path", "مسارك الدراسي"),
        exact: true,
      }),
    ).toBeFocused();
    await expect(
      section
        .locator("dl")
        .getByText(
          pick(locale, "Eligible course plan", "خطة المقررات المتاحة"),
          { exact: true },
        ),
    ).toBeVisible();
    await expect(
      page.locator('input[value="synthetic-credit-period"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('input[value="human-medicine-year-1-term-1"]'),
    ).toHaveCount(0);
    await back.click();
    await page.locator('input[value="human-medicine"]').check();
    await next.click();
    await expect(
      page.locator('input[value="synthetic-credit-level"]'),
    ).toHaveCount(0);
    await page.locator('input[value="human-medicine-year-1"]').check();
    await next.click();
    await page.locator('input[value="human-medicine-year-1-term-1"]').check();
    await review.click();
    await expect(section.locator("dl dt")).toContainText([
      pick(locale, "Education stage", "المرحلة التعليمية"),
      pick(locale, "University", "الجامعة"),
      category,
      pick(locale, "Academic year", "السنة الدراسية"),
      pick(locale, "Study period", "الفترة الدراسية"),
    ]);
    await inspectSetup();
    await page
      .getByRole("button", {
        name: pick(
          locale,
          "Edit Faculty or program",
          "تعديل الكلية أو البرنامج",
        ),
        exact: true,
      })
      .press("Enter");
    await expect(
      page.getByRole("heading", { name: category, exact: true }),
    ).toBeFocused();
    await expect(page.locator('input[value="human-medicine"]')).toBeChecked();
    await next.click();
    await next.click();
    await review.click();
    await page
      .getByRole("button", {
        name: pick(locale, "Open Study Shelf", "فتح رف المذاكرة"),
        exact: true,
      })
      .press("Enter");
    await expect(
      page.getByRole("heading", {
        name: pick(locale, "Your Study Shelf", "رف المذاكرة"),
        exact: true,
      }),
    ).toBeVisible();
    await navigate(page, "/settings", locale);
    for (const theme of ["light", "dark"]) {
      await chooseTheme(page, theme);
      await showAccountView(page, "academic");
      await expect(page.getByLabel(category, { exact: true })).toHaveValue(
        "human-medicine",
      );
      for (const width of [1440, 900, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await referenceLayout();
      }
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
      await referenceLayout();
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await enlarged.evaluate((element) =>
        element.parentNode?.removeChild(element),
      );
    }
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`audit batch 07 ${locale}: grouped study actions, source formats, native excerpts and count guidance preserve the learning path`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale);
    for (const value of [
      "university",
      "zagazig-university",
      "human-medicine",
      "human-medicine-year-1",
      "human-medicine-year-1-term-1",
    ]) {
      await page.locator(`input[value="${value}"]`).check();
      await page
        .getByRole("button", {
          name: pick(
            locale,
            value.endsWith("term-1") ? "Review choices" : "Continue",
            value.endsWith("term-1") ? "مراجعة الاختيارات" : "متابعة",
          ),
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
    const reflow = async (inspect: () => Promise<void>) => {
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await inspect();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        await expectOriginalTypography(page, locale);
      }
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
      await inspect();
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
      await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
    };
    const resume = page.locator("section").filter({
      has: page.getByRole("link", {
        name:
          locale === "en"
            ? /^(Choose a (module|subject)|(Open|Resume) Anatomy)$/u
            : /^(اختر (وحدة|مادة)|(فتح|متابعة) علم التشريح)$/u,
      }),
    });
    const inspectResume = async () => {
      const layout = await resume.evaluate((e) => {
        const text = e.querySelector("p")!.getBoundingClientRect();
        const action = e.querySelector("a")!.getBoundingClientRect();
        const box = e.getBoundingClientRect();
        return {
          below: action.y >= text.bottom,
          gap: action.y - text.bottom,
          contained: action.x >= box.x && action.right <= box.right + 1,
          width: box.width,
          targetHeight: action.height,
        };
      });
      expect(layout.below).toBe(true);
      expect(layout.gap).toBeGreaterThanOrEqual(12);
      expect(layout.gap).toBeLessThanOrEqual(20);
      expect(layout.contained).toBe(true);
      expect(layout.width).toBeLessThanOrEqual(640);
      expect(layout.targetHeight).toBeGreaterThanOrEqual(44);
    };
    const inspectMaterials = async () => {
      await expect(page.locator("article")).toHaveCount(8);
      const layout = await page.locator("article").evaluateAll((rows) =>
        rows.slice(0, 2).map((e) => {
          const format = e.querySelector("bdi")!;
          const heading = e.querySelector("h3")!;
          const summary = e.querySelector("summary")!;
          const style = getComputedStyle(summary);
          const bounds = summary.getBoundingClientRect();
          return {
            format: format.textContent,
            weight: Number(getComputedStyle(format).fontWeight),
            color: getComputedStyle(format).color,
            headingColor: getComputedStyle(heading).color,
            border: style.borderTopStyle,
            height: bounds.height,
            withinRow: bounds.right <= e.getBoundingClientRect().right + 1,
          };
        }),
      );
      expect(layout.map((r) => r.format)).toEqual(["PDF", "AUDIO"]);
      for (const row of layout) {
        expect(row.weight).toBeGreaterThanOrEqual(600);
        expect(row.color).toBe(row.headingColor);
        expect(row.border).toBe("solid");
        expect(row.height).toBeGreaterThanOrEqual(44);
        expect(row.withinRow).toBe(true);
      }
      await expect(
        page
          .getByText(pick(locale, "Sample page 3", "صفحة تجريبية ٣"), {
            exact: true,
          })
          .first(),
      ).toBeVisible();
    };
    for (const theme of ["light", "dark"]) {
      await navigate(page, "/settings", locale);
      await chooseTheme(page, theme);
      await navigate(page, "/learn", locale);
      await reflow(inspectResume);
      await page
        .getByRole("navigation", {
          name: pick(locale, "Product navigation", "تنقل المنتج"),
        })
        .getByRole("link", {
          name: pick(locale, "Subjects", "المواد"),
          exact: true,
        })
        .click();
      await page
        .getByRole("link", {
          name: pick(locale, "Open Anatomy", "فتح علم التشريح"),
          exact: true,
        })
        .click();
      await reflow(inspectMaterials);
      const summary = page.locator("article").first().locator("summary");
      await summary.press("Enter");
      await expect(
        page.locator("article").first().locator("details"),
      ).toHaveAttribute("open", "");
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
      await summary.press("Space");
      await expect(
        page.locator("article").first().locator("details"),
      ).not.toHaveAttribute("open");
      await navigate(page, unit + "/studio", locale);
      await reflow(async () => {
        const hierarchy = await page
          .locator("div[class*='studioLayout']")
          .evaluate((e) => ({
            form: parseFloat(
              getComputedStyle(e.querySelector("form > h2")!).fontSize,
            ),
            empty: parseFloat(
              getComputedStyle(
                e.querySelector("div[class*='artifactEmpty'] h3")!,
              ).fontSize,
            ),
          }));
        expect(hierarchy.form).toBeGreaterThan(hierarchy.empty);
        await expect(
          page.getByRole("button", {
            name: pick(locale, "Generate", "إنشاء"),
            exact: true,
          }),
        ).toBeEnabled();
      });
      await page
        .getByRole("link", {
          name: b07SourcesName(locale),
          exact: true,
        })
        .click();
      await inspectMaterials();
      await page
        .getByRole("link", {
          name: pick(locale, "Return to Studio", "العودة للاستوديو"),
          exact: true,
        })
        .press("Enter");
      await expect(page).toHaveURL(
        new RegExp(`${unit}/studio\\?lang=${locale}$`, "u"),
      );
      await navigate(page, "/learn", locale);
      const resumeLink = page.getByRole("link", {
        name: pick(locale, "Resume Anatomy", "متابعة علم التشريح"),
        exact: true,
      });
      await expect(resumeLink).toHaveAttribute(
        "href",
        `${unit}/studio?lang=${locale}`,
      );
      await reflow(inspectResume);
      await resumeLink.press("Enter");
      await expect(page).toHaveURL(
        new RegExp(`${unit}/studio\\?lang=${locale}$`, "u"),
      );
      await navigate(page, unit + "/quiz", locale);
      const count = page.getByRole("spinbutton", {
        name: pick(locale, "Number of questions", "عدد الأسئلة"),
        exact: true,
      });
      const help = pick(
        locale,
        "1–6 questions per sample attempt.",
        "من ١ إلى ٦ أسئلة في المحاولة التجريبية.",
      );
      await expect(count).toHaveAttribute("min", "1");
      await expect(count).toHaveAttribute("max", "6");
      await expect(count).toHaveAccessibleDescription(help);
      await reflow(async () => {
        await expect(page.getByText(help, { exact: true })).toBeVisible();
        const bounds = await count.boundingBox();
        const hint = await page
          .locator("#quiz-question-count-help")
          .boundingBox();
        expect(hint!.y).toBeGreaterThanOrEqual(bounds!.y + bounds!.height);
        expect(hint!.y - bounds!.y - bounds!.height).toBeLessThan(10);
      });
      const start = page.getByRole("button", {
        name: pick(locale, "Start quiz", "بدء الاختبار"),
        exact: true,
      });
      for (const value of ["0", "7", ""]) {
        await count.fill(value);
        await expect(start).toBeDisabled();
      }
      await count.fill("3");
      await count.press("ArrowUp");
      await expect(count).toHaveValue("4");
      await count.fill("3");
      await expect(start).toBeEnabled();
    }
    await navigate(page, unit + "/studio", locale);
    await page
      .getByRole("button", {
        name: pick(locale, "Generate", "إنشاء"),
        exact: true,
      })
      .press("Enter");
    await expect(
      page.locator("section[class*='artifactOutput'] h2"),
    ).toBeFocused();
    await expect(
      page.getByRole("button", {
        name: pick(locale, "Supporting passages", "النصوص الداعمة"),
        exact: true,
      }),
    ).toBeVisible();
    await navigate(page, unit + "/quiz", locale);
    await page
      .getByRole("spinbutton", {
        name: pick(locale, "Number of questions", "عدد الأسئلة"),
        exact: true,
      })
      .fill("3");
    await page
      .getByRole("button", {
        name: pick(locale, "Start quiz", "بدء الاختبار"),
        exact: true,
      })
      .press("Enter");
    await expect(
      page.locator('fieldset:has(input[name^="sample-question-"])'),
    ).toHaveCount(3);
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`audit batch 08 ${locale}: visible targets, selected language and grouped source returns preserve navigation`, async ({
    page,
  }) => {
    const finish = isolation(page);
    await signIn(page, "student", locale);
    for (const value of [
      "university",
      "zagazig-university",
      "human-medicine",
      "human-medicine-year-1",
      "human-medicine-year-1-term-1",
    ]) {
      await page.locator(`input[value="${value}"]`).check();
      await page
        .getByRole("button", {
          name: pick(
            locale,
            value.endsWith("term-1") ? "Review choices" : "Continue",
            value.endsWith("term-1") ? "مراجعة الاختيارات" : "متابعة",
          ),
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
    const reflow = async (inspect: () => Promise<void>) => {
      for (const width of [1440, 820, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await inspect();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        await expectOriginalTypography(page, locale);
      }
      const enlarged = await page.addStyleTag({
        content: "html { font-size: 200% }",
      });
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
      await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
    };
    const languageState = async () => {
      const group = page.getByRole("group", {
        name: pick(locale, "Interface language", "لغة الواجهة"),
        exact: true,
      });
      await expect(group.getByRole("button")).toHaveCount(2);
      const selected = group.getByRole("button", {
        name: locale === "en" ? "English" : "العربية",
        exact: true,
      });
      const other = group.getByRole("button", {
        name: locale === "en" ? "العربية" : "English",
        exact: true,
      });
      await expect(selected).toHaveAttribute("aria-pressed", "true");
      await expect(selected).toBeVisible();
      await expect(selected.locator("svg[aria-hidden='true']")).toHaveCount(1);
      await expect(other.locator("svg")).toHaveCount(0);
      const style = await selected.evaluate((e) => ({
        height: e.getBoundingClientRect().height,
        background: getComputedStyle(e).backgroundColor,
        root: getComputedStyle(document.documentElement)
          .getPropertyValue("--accent-soft")
          .trim(),
      }));
      expect(style.height).toBeGreaterThanOrEqual(44);
      expect(style.background).not.toBe("rgba(0, 0, 0, 0)");
      expect(style.root).not.toBe("");
      await expect(
        page.getByText(pick(locale, "Interface language", "لغة الواجهة"), {
          exact: true,
        }),
      ).toHaveCount(0);
    };
    const alignedHeader = async () => {
      if ((page.viewportSize()?.width ?? 0) < 768) return;
      await expect
        .poll(() =>
          page.locator("#app-content h1").evaluate((heading) => {
            const label = document.querySelector(
              "header[data-workspace-chrome] [class*='location']",
            )!;
            const first = label.getBoundingClientRect(),
              second = heading.getBoundingClientRect();
            return Math.abs(
              document.documentElement.dir === "rtl"
                ? first.right - second.right
                : first.left - second.left,
            );
          }),
        )
        .toBeLessThanOrEqual(1);
    };
    for (const theme of ["light", "dark"] as const) {
      await navigate(page, "/settings", locale);
      const tabs = page.getByRole("tab");
      await tabs.first().click();
      await page
        .getByRole("radio", {
          name: pick(
            locale,
            theme === "light" ? "Light" : "Dark",
            theme === "light" ? "فاتح" : "داكن",
          ),
          exact: true,
        })
        .check();
      await reflow(async () => {
        await languageState();
        await alignedHeader();
        const styles = await tabs.evaluateAll((elements) =>
          elements.map((e) => ({
            height: e.getBoundingClientRect().height,
            border: getComputedStyle(e).borderTopWidth,
            background: getComputedStyle(e).backgroundColor,
            color: getComputedStyle(e).color,
          })),
        );
        expect(styles).toHaveLength(4);
        for (const style of styles) {
          expect(style.height).toBeGreaterThanOrEqual(44);
          expect(style.border).toBe("1px");
          expect(style.background).not.toBe("rgba(0, 0, 0, 0)");
        }
        expect(styles[0]!.background).not.toBe(styles[1]!.background);
      });
      await tabs.first().press("End");
      await expect(tabs.last()).toBeFocused();
      await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tabpanel")).toHaveAccessibleName(
        pick(locale, "Identity and access", "الهوية والوصول"),
      );
      await tabs.last().press("Home");
      await expect(tabs.first()).toBeFocused();
      await page
        .getByRole("navigation", {
          name: pick(locale, "Product navigation", "تنقل المنتج"),
        })
        .getByRole("link", {
          name: pick(locale, "Subjects", "المواد"),
          exact: true,
        })
        .click();
      const rows = page.locator("li[data-unit-id] > a");
      await expect(page.locator("#app-content h1")).toContainText(
        pick(locale, "Your modules", "قائمة"),
      );
      await reflow(async () => {
        await languageState();
        await alignedHeader();
        await expect(rows).toHaveCount(5);
        for (const row of await rows.all()) {
          await expect(row.locator("[class*='unitAction']")).toContainText(
            pick(locale, "Open", "فتح"),
          );
          await expect(row.getByRole("button")).toHaveCount(0);
          const height = (await row.boundingBox())!.height;
          expect(height).toBeGreaterThanOrEqual(44);
        }
      });
      const anatomy = page.getByRole("link", {
        name: pick(locale, "Open Anatomy", "فتح علم التشريح"),
        exact: true,
      });
      await anatomy.press("Enter");
      await expect(page).toHaveURL(new RegExp(`${unit}\\?lang=${locale}$`));
      await expect(page.locator("[class*='sourceContext']")).toHaveCount(0);
      await reflow(async () => {
        await languageState();
        await alignedHeader();
      });
      await navigate(page, unit + "/chat", locale);
      const draft = promptExamples.supported[locale === "ar" ? 1 : 0];
      await page
        .getByLabel(pick(locale, "Message", "السؤال"), { exact: true })
        .fill(draft);
      await openStudyOptions(page, locale);
      await page
        .getByRole("link", {
          name: b07SourcesName(locale),
          exact: true,
        })
        .click();
      const sourceContext = page.locator("[class*='sourceContext']");
      await reflow(async () => {
        await languageState();
        await alignedHeader();
        await expect(
          sourceContext.getByRole("link", {
            name: pick(locale, "Return to Chat", "العودة للمحادثة"),
            exact: true,
          }),
        ).toHaveAttribute("href", `${unit}/chat?lang=${locale}`);
        await expect(sourceContext.locator("p").last()).toContainText(
          pick(
            locale,
            "Excerpts and page references below are illustrative.",
            "النصوص ومواضع الصفحات أدناه للتوضيح.",
          ),
        );
        const geometry = await sourceContext.evaluate((e) => {
          const action = e.querySelector("a")!,
            caption = e.querySelector("p:last-of-type")!;
          const link = action.getBoundingClientRect(),
            note = caption.getBoundingClientRect();
          return {
            height: e.getBoundingClientRect().height,
            target: link.height,
            margin: getComputedStyle(caption).marginTop,
            size: getComputedStyle(caption).fontSize,
            aligned: Math.abs(
              link.y + link.height / 2 - note.y - note.height / 2,
            ),
            width: innerWidth,
          };
        });
        expect(geometry.target).toBeGreaterThanOrEqual(44);
        expect(geometry.margin).toBe("0px");
        expect(geometry.size).toBe("14px");
        if (geometry.width >= 820) expect(geometry.aligned).toBeLessThan(1);
        if (geometry.width === 390) expect(geometry.height).toBeLessThan(110);
        await expect(page.locator("article")).toHaveCount(8);
      });
      const excerpt = page
        .locator("summary")
        .filter({
          hasText: pick(locale, "Read processed passage", "قراءة النص المعالج"),
        })
        .first();
      await excerpt.press("Enter");
      await expect(excerpt.locator("..")).toHaveAttribute("open", "");
      await excerpt.press("Space");
      await expect(excerpt.locator("..")).not.toHaveAttribute("open", "");
      await sourceContext
        .getByRole("link", {
          name: pick(locale, "Return to Chat", "العودة للمحادثة"),
          exact: true,
        })
        .press("Enter");
      await expect(
        page.getByLabel(pick(locale, "Message", "السؤال"), { exact: true }),
      ).toHaveValue(draft);
      await navigate(page, unit + "/studio", locale);
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Shape the result", "شكّل المخرج"),
          exact: true,
          level: 2,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", {
          name: b07SourcesName(locale),
          exact: true,
        }),
      ).toHaveAttribute("href", `${unit}/sources?from=studio&lang=${locale}`);
      await page
        .getByRole("link", {
          name: b07SourcesName(locale),
          exact: true,
        })
        .click();
      await sourceContext
        .getByRole("link", {
          name: pick(locale, "Return to Studio", "العودة للاستوديو"),
          exact: true,
        })
        .press("Enter");
      await expect(page).toHaveURL(new RegExp(`/studio\\?lang=${locale}$`));
    }
    finish();
  });
}

for (const locale of ["en", "ar"] as const) {
  test(`audit batch 09 ${locale}: task headings, review completion and explicit destinations preserve the study flow`, async ({
    page,
  }) => {
    const finish = isolation(page);
    const t = (en: string, ar: string) => pick(locale, en, ar);
    await signIn(page, "student", locale);
    const profile = page.getByRole("link", {
      name: "Samir Hassan",
      exact: true,
    });
    const reflow = async (inspect: () => Promise<void>) => {
      for (const theme of ["light", "dark"] as const) {
        await page.emulateMedia({
          colorScheme: theme,
          reducedMotion: "reduce",
        });
        for (const width of [1440, 820, 390, 320]) {
          await page.setViewportSize({ width, height: 1000 });
          await expect(profile).toHaveAccessibleDescription(
            t("Settings", "الإعدادات"),
          );
          const caption = profile.locator("[class*='profileDestination']");
          await expect(caption).toHaveText(t("Settings", "الإعدادات"));
          await expect(caption).toBeVisible();
          expect((await profile.boundingBox())!.height).toBeGreaterThanOrEqual(
            44,
          );
          await inspect();
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          ).toBe(true);
          await expectOriginalTypography(page, locale);
        }
        const enlarged = await page.addStyleTag({
          content: "html { font-size: 200% }",
        });
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
        await enlarged.evaluate((e) => e.parentNode?.removeChild(e));
      }
    };
    const setup = page.getByRole("region", {
      name: t("Set up your Study Shelf", "إعداد رف المذاكرة"),
      exact: true,
    });
    await reflow(async () => {
      await expect(page.locator("#app-content h1")).toHaveCount(1);
      await expect(
        page.getByRole("heading", {
          name: t("Set up your Study Shelf", "إعداد رف المذاكرة"),
          level: 1,
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          name: t("Education stage", "المرحلة التعليمية"),
          level: 2,
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByText(t("Welcome to UniMind", "مرحبًا بك في UniMind"), {
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(setup.locator("[class*='reviewCompletion']")).toHaveCount(0);
    });
    for (const value of [
      "university",
      "zagazig-university",
      "human-medicine",
      "human-medicine-year-1",
      "human-medicine-year-1-term-1",
    ]) {
      await page.locator(`input[value="${value}"]`).press("Space");
      await page
        .getByRole("button", {
          name: value.endsWith("term-1")
            ? t("Review choices", "مراجعة الاختيارات")
            : t("Continue", "متابعة"),
          exact: true,
        })
        .press("Enter");
    }
    await expect(
      page.getByRole("heading", {
        name: t("Your academic path", "مسارك الدراسي"),
        level: 2,
        exact: true,
      }),
    ).toBeFocused();
    await reflow(async () => {
      const completed = setup.locator("[class*='reviewCompletion']");
      await expect(completed).toContainText(
        t("Academic path complete", "اكتمل المسار الدراسي"),
      );
      await expect(completed.locator("svg[aria-hidden='true']")).toHaveCount(1);
      await expect(setup.locator("[data-complete='true']")).toHaveCount(5);
      await expect(setup.locator("[data-current='true']")).toHaveCount(0);
      await expect(setup.locator("dl dt")).toHaveCount(5);
    });
    await page
      .getByRole("button", {
        name: t("Edit Academic year", "تعديل السنة الدراسية"),
        exact: true,
      })
      .press("Enter");
    await expect(
      page.getByRole("heading", {
        name: t("Academic year", "السنة الدراسية"),
        level: 2,
        exact: true,
      }),
    ).toBeFocused();
    await expect(setup.locator("[class*='reviewCompletion']")).toHaveCount(0);
    await expect(
      page.locator('input[value="human-medicine-year-1"]'),
    ).toBeChecked();
    await page
      .getByRole("button", { name: t("Continue", "متابعة"), exact: true })
      .press("Enter");
    await page
      .getByRole("button", {
        name: t("Review choices", "مراجعة الاختيارات"),
        exact: true,
      })
      .press("Enter");
    await page
      .getByRole("button", {
        name: t("Open Study Shelf", "فتح رف المذاكرة"),
        exact: true,
      })
      .press("Enter");
    await expect(setup).toHaveCount(0);
    await profile.press("Enter");
    await page
      .getByRole("tab", {
        name: t("Identity and access", "الهوية والوصول"),
        exact: true,
      })
      .press("End");
    const identity = page.getByRole("tabpanel", {
      name: t("Identity and access", "الهوية والوصول"),
      exact: true,
    });
    await reflow(async () => {
      const reset = identity.getByRole("link", {
        name: t("Reset password", "تغيير كلمة المرور"),
        exact: true,
      });
      const signOut = page.getByRole("main").getByRole("button", {
        name: t("Sign out", "تسجيل الخروج"),
        exact: true,
      });
      await expect(reset).toHaveAttribute(
        "href",
        `/forgot-password?lang=${locale}`,
      );
      await expect(signOut).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(signOut).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
      expect((await signOut.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect(
        await reset.evaluate((e) => getComputedStyle(e).backgroundColor),
      ).not.toBe("rgba(0, 0, 0, 0)");
    });
    await page
      .getByRole("navigation", {
        name: t("Product navigation", "تنقل المنتج"),
        exact: true,
      })
      .getByRole("link", { name: t("Subjects", "المواد"), exact: true })
      .click();
    await expect(page.locator("#app-content h1")).toContainText(
      t("Your modules", "قائمة"),
    );
    await page
      .getByRole("link", {
        name: t("Open Anatomy", "فتح علم التشريح"),
        exact: true,
      })
      .press("Enter");
    await expect(page).toHaveURL(new RegExp(`${unit}\\?lang=${locale}$`));
    await reflow(async () => {
      const title = page.getByRole("heading", {
        name: t("Materials", "مصادر المذاكرة"),
        level: 2,
        exact: true,
      });
      await expect(title).toHaveCount(1);
      const box = (await title.boundingBox())!;
      if ((page.viewportSize()?.width ?? 0) < 768) {
        expect(box.width).toBe(1);
        expect(box.height).toBe(1);
      } else expect(box.height).toBeGreaterThan(20);
      await expect(page.locator("article")).toHaveCount(8);
      await expect(
        page.getByText(t("Sample page 3", "صفحة تجريبية ٣"), { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText(t("Sample timestamp 02:10", "توقيت تجريبي ٠٢:١٠"), {
          exact: true,
        }),
      ).toBeVisible();
    });
    const excerpt = page
      .locator("summary")
      .filter({ hasText: t("Read processed passage", "قراءة النص المعالج") })
      .first();
    await excerpt.press("Enter");
    await expect(excerpt.locator("..")).toHaveAttribute("open", "");
    await excerpt.press("Space");
    await expect(excerpt.locator("..")).not.toHaveAttribute("open", "");
    await profile.press("Enter");
    await page
      .getByRole("tab", {
        name: t("Identity and access", "الهوية والوصول"),
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: t("Sign out", "تسجيل الخروج"), exact: true })
      .press("Enter");
    await expect(page).toHaveURL(new RegExp(`/login\\?lang=${locale}$`));
    finish();
  });
}
