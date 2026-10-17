import { artifactTypes, reviewCatalogRows } from "../support/app-fixtures";
import { bilingual, formatNumber, inLocales, pick } from "../support/copy";
import {
  b07DetailsName,
  b07SavePath,
  b07SourcesName,
  b07UnitsName,
  chooseTheme,
  generateStudioExample,
  selectStudioExample,
  showAccountView,
  unit,
} from "../support/demo";
import {
  isolation,
  navigate,
  openSessionTools,
  send,
  signIn,
} from "../support/session";
import { expect, test } from "../support/test";
inLocales(["en"], (locale) => {
  test(
    `cancellation keeps the aid and MCQ hides stale generation guidance`,
    { tag: ["@B08-D", `@${locale}`] },
    async ({ page }) => {
      test.setTimeout(120_000);
      const t = bilingual(locale);
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `six purpose choices use five aids and one complete MCQ flow`,
    { tag: ["@B08-D", `@${locale}`] },
    async ({ page }) => {
      test.setTimeout(180_000);
      const t = bilingual(locale);
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
      await expect(setup).toHaveAttribute(
        "href",
        `${unit}/quiz?lang=${locale}`,
      );
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
        await page
          .locator(`input[name="sample-question-${i}"]`)
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
      const review = page.url();
      await expect(page.locator("input[type=radio]:enabled")).toHaveCount(0);
      await page
        .getByRole("button", {
          name: `${t("Supporting passages for question", "النصوص الداعمة للسؤال")} ${formatNumber(locale, 3)}`,
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `MCQ navigation keeps the prior quiz identity, answers and original deadline`,
    { tag: ["@B08-D", `@${locale}`] },
    async ({ page }) => {
      test.setTimeout(120_000);
      const t = bilingual(locale);
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
      await expect(
        page.locator("section[class*='artifactOutput']"),
      ).toHaveCount(0);
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `explicit replacement and directional flashcards preserve cancellation and course memory`,
    { tag: ["@B08-A", `@${locale}`] },
    async ({ page }) => {
      const t = bilingual(locale);
      const finish = isolation(page);
      await signIn(page, "student", locale, "/settings");
      await b07SavePath(
        page,
        locale,
        "human-medicine",
        "human-medicine-year-1",
      );
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
      await expect(flip).toHaveAccessibleName(
        t("Show answer", "إظهار الإجابة"),
      );
      await expect(card).toHaveAccessibleDescription(
        t("Question side", "وجه السؤال"),
      );
      await expect(side).toBeVisible();
      await flip.focus();
      await flip.press("Enter");
      await expect(flip).toBeFocused();
      await expect(flip).toHaveAccessibleName(
        t("Show question", "إظهار السؤال"),
      );
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
      await expect(flip).toHaveAccessibleName(
        t("Show answer", "إظهار الإجابة"),
      );
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
      await expect(flip).toHaveAccessibleName(
        t("Show question", "إظهار السؤال"),
      );
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
      await expect(flip).toHaveAccessibleName(
        t("Show answer", "إظهار الإجابة"),
      );
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `explicit quiz clock and progress remain reachable without restarting the deadline`,
    { tag: ["@B06", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page),
        t = bilingual(locale);
      await signIn(page, "student", locale, `${unit}/quiz`);
      await page
        .getByLabel(t("Number of questions", "عدد الأسئلة"), { exact: true })
        .fill("6");
      await page
        .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
        .check();
      await page
        .getByLabel(t("Duration (minutes)", "المدة (بالدقائق)"), {
          exact: true,
        })
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
      // Phone geometry is this journey's subject; schemes and axe: layout matrix.
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `quiz setup validates each field and isolates drafts by unit and account`,
    { tag: ["@B03", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
    },
  );
});

inLocales(["en"], (locale) => {
  for (const outcome of ["zero", "mixed", "correct"] as const) {
    test(
      `six-question ${outcome} review names each correction`,
      { tag: ["@B03", "@M28", `@${locale}`] },
      async ({ page }) => {
        const finish = isolation(page);
        const t = bilingual(locale);
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
        await expect(page.getByRole("main")).toContainText(
          `${formatNumber(locale, expected)} / ${formatNumber(locale, 6)}`,
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
        finish();
      },
    );
  }
});

inLocales(["ar"], (locale) => {
  for (const answered of [0, 2, 6]) {
    test(
      `expiry preserves ${answered} of six answers as unscored review`,
      { tag: ["@B03", "@M27", `@${locale}`] },
      async ({ page }) => {
        const finish = isolation(page);
        const t = bilingual(locale);
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
          `${t("Answered", "تمت الإجابة")}: ${formatNumber(locale, answered)} / ${formatNumber(locale, 6)}`,
        );
        await expect(page.getByRole("main")).toContainText(
          `${t("Unanswered", "دون إجابة")}: ${formatNumber(locale, 6 - answered)}`,
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
        }
        if (answered !== 2) await page.clock.resume();
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
      },
    );
  }
});

inLocales(["ar"], (locale) => {
  test(
    `five generated formats reflect settings and MCQ enters one setup`,
    { tag: ["@B01", "@M67", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
            expect(
              await body.locator('bdi[lang="en"]').count(),
            ).toBeGreaterThan(1);
            expect(
              await body.locator('bdi[lang="ar"]').count(),
            ).toBeGreaterThan(1);
            await expect(
              body.locator('bdi[lang="en"]').first(),
            ).toHaveAttribute("dir", "ltr");
            await expect(
              body.locator('bdi[lang="ar"]').first(),
            ).toHaveAttribute("dir", "rtl");
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `cancellation and invalid choices keep the captured previous artifact`,
    { tag: ["@B01", "@M67", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
      await expect(output).toContainText(t("Upper trunk injury", "إصابة الجذع العلوي"));
      await expect(
        page.getByLabel(t("Output language", "لغة المخرج"), { exact: true }),
      ).toHaveValue("mixed");
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `source reading, flashcard keyboard feedback and nested Quiz navigation`,
    { tag: ["@premium", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await signIn(page, "student", locale, unit);
      const source = page.getByRole("heading", {
        name: pick(
          locale,
          "Lecture 6 handout",
          "ملزمة المحاضرة 6",
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
      expect(firstView.sourceBottom).toBeLessThanOrEqual(
        firstView.visibleBottom,
      );
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
        "إصابة الجذع العلوي (C5 وC6) تسبب شلل إرب-دوشين، غالبًا من المباعدة الشديدة بين الرأس والكتف. تتكون الضفيرة من الفروع الأمامية للأعصاب من C5 إلى T1.",
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
      // A saved appearance choice is a Settings detour that returns to Studio.
      await navigate(page, "/settings", locale);
      await chooseTheme(page, "dark");
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
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect(card).toBeVisible();
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
          name: pick(locale, "C5 and C6", "C5 وC6"),
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `five Studio aids, direct MCQ flow, score and source review`,
    { tag: ["@demo-core", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "student", locale, unit);
      await navigate(page, unit + "/studio", locale);
      for (const [id, en, ar] of artifactTypes.filter(
        ([id]) => id !== "quiz",
      )) {
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
        .getByText(
          pick(locale, "Read processed passage", "قراءة النص المعالج"),
          {
            exact: true,
          },
        )
        .first()
        .click();
      await expect(
        page.getByText(
          pick(
            locale,
            "Injury to the upper trunk (C5, C6) produces Erb–Duchenne paralysis, commonly from excessive separation of the head and shoulder. The plexus is formed by the ventral rami of C5 to T1.",
            "إصابة الجذع العلوي (C5 وC6) تسبب شلل إرب-دوشين، غالبًا من المباعدة الشديدة بين الرأس والكتف. تتكون الضفيرة من الفروع الأمامية للأعصاب من C5 إلى T1.",
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
        .getByLabel(pick(locale, "Artifact type", "نوع المخرج"), {
          exact: true,
        })
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
          name: pick(locale, "C5 and C6", "C5 وC6"),
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
    },
  );
});

test(
  `a normal timed attempt expires while private future exchanges and scope stay separate`,
  { tag: ["@demo-core"] },
  async ({ page }) => {
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
    await page
      .getByRole("button", { name: "New session", exact: true })
      .click();
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
  },
);

inLocales(["ar"], (locale) => {
  test(
    `quiz inputs follow one centered path with equivalent labels`,
    { tag: ["@audit-04", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "student", locale, unit + "/quiz");
      await expect(
        page.locator("div[class*='quizConfiguration']"),
      ).toBeVisible();
      const start = page.getByRole("button", {
        name: pick(locale, "Start quiz", "بدء الاختبار"),
        exact: true,
      });
      // Centered field geometry per width and scheme runs in the layout matrix.
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
    },
  );
});
