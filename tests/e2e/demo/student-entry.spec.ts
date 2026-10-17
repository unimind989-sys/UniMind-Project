import { artifactTypes, getCatalogCopy } from "../support/app-fixtures";
import { bilingual, formatNumber, inLocales, pick } from "../support/copy";
import {
  b07ChooseName,
  b07Paths,
  b07Row,
  b07SavePath,
  expectOriginalTypography,
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
    `the Shelf reflects an expired quiz without restarting its attempt`,
    { tag: ["@B07-C", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page),
        t = bilingual(locale);
      await signIn(page, "student", locale, "/settings");
      await b07SavePath(
        page,
        locale,
        "human-medicine",
        "human-medicine-year-1",
      );
      await navigate(page, "/learn", locale);
      await page.locator('[class*="resume"] a').click();
      await navigate(page, unit + "/quiz", locale);
      await page
        .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
        .check();
      await page
        .getByLabel(t("Duration (minutes)", "المدة (بالدقائق)"), {
          exact: true,
        })
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `named latest work retains exact conversations, five aids, MCQ entry and quiz state`,
    { tag: ["@B07-C", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page),
        t = bilingual(locale);
      await signIn(page, "student", locale, "/settings");
      await b07SavePath(
        page,
        locale,
        "human-medicine",
        "human-medicine-year-1",
      );
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
          t("Upper trunk injury.*Session 1", "إصابة الجذع العلوي.*جلسة [١1]"),
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
          t("Roots of the plexus.*Session 2", "جذور الضفيرة.*جلسة [٢2]"),
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
        page.getByText(t("Roots of the plexus", "جذور الضفيرة"), {
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByText(
          `${t("Replies", "الإجابات")} · ${formatNumber(locale, 2)}`,
          { exact: true },
        ),
      ).toBeVisible();
      const resume = page.getByRole("link", {
        name: t("Resume Anatomy", "متابعة علم التشريح"),
        exact: true,
      });
      await expect(resume).toHaveAttribute(
        "href",
        `${unit}/chat?lang=${locale}`,
      );
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
      for (const [id, en, ar] of artifactTypes.filter(
        ([id]) => id !== "quiz",
      )) {
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
          page.getByText(t("Roots of the plexus", "جذور الضفيرة"), {
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
          `${t("In progress", "قيد الحل")} · ${formatNumber(locale, 1)}${t(" answered", " إجابات")}`,
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
      // The resume target per width and scheme runs in the layout matrix Shelf.
      await expect(resume).toBeVisible();
      await resume.focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(review.href);
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `honest named starts keep four program catalogs separate`,
    { tag: ["@B07-C", `@${locale}`] },
    async ({ page }) => {
      const t = bilingual(locale);
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `configured course names agree across four paths and learning materials`,
    { tag: ["@B07-B", `@${locale}`] },
    async ({ page }) => {
      const t = bilingual(locale);
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
          t(
            `Ask about this ${singular.toLowerCase()}…`,
            `اسأل عن ${singular}…`,
          ),
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
        await expect(
          tools.getByRole("link", {
            name: t("Materials", "مصادر المذاكرة"),
            exact: true,
          }),
        ).toBeVisible();
        finish();
      }
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `determined choices skip questions while four complete paths retain review and Back`,
    { tag: ["@B07-A", `@${locale}`] },
    async ({ page }) => {
      test.setTimeout(180_000);
      const finish = isolation(page),
        t = bilingual(locale);
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
        await expect(page.locator("dl dt")).toHaveCount(5);
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `changing path reconciles Settings and Shelf while the old quiz and draft remain intact`,
    { tag: ["@B07-A", `@${locale}`] },
    async ({ page }) => {
      test.setTimeout(180_000);
      const finish = isolation(page),
        t = bilingual(locale);
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
      await b07SavePath(
        page,
        locale,
        "human-medicine",
        "human-medicine-year-1",
      );
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
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `mathematics setup opens its own subjects`,
    { tag: ["@B01", "@M10", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `obsolete and mismatched mathematics scopes are unavailable`,
    { tag: ["@B01", "@M10", `@${locale}`] },
    async ({ page }) => {
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `setup interruption survives Settings and clears on same-document sign-out`,
    { tag: ["@audit-11", `@${locale}`] },
    async ({ page }) => {
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `progressive choices, upstream reset, review and distinct destinations`,
    { tag: ["@student-entry", `@${locale}`] },
    async ({ page }) => {
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
      await expect(
        page.locator('input[value="zagazig-university"]'),
      ).toHaveCount(0);
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `distinct progress and compact editable academic review with original fonts`,
    { tag: ["@audit-02", `@${locale}`] },
    async ({ page }) => {
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
      // Compact review rows per width and scheme run in the layout matrix.
      await expect(page.locator("dl > div")).toHaveCount(5);
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `named resume and grouped searchable subjects`,
    { tag: ["@audit-03", `@${locale}`] },
    async ({ page }) => {
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
      // The resume action at 320px with 200% text: layout matrix Shelf state.
      await expect(
        page.locator("section").filter({ has: resume }),
      ).toContainText(
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
      await expect(resume).toHaveAttribute(
        "href",
        unit + `/chat?lang=${locale}`,
      );
      await expect(
        page.locator("section").filter({ has: resume }),
      ).toContainText(pick(locale, "Anatomy · Chat", "علم التشريح · المحادثة"));
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
      // Grouped row geometry per width and scheme: layout matrix Subjects state.
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `the disabled setup action stays neutral until a valid choice`,
    { tag: ["@audit-05", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "student", locale);
      const next = page.getByRole("button", {
        name: pick(locale, "Continue", "متابعة"),
        exact: true,
      });
      const radio = page.locator('input[value="university"]');
      // The same neutral styling per width and scheme: layout matrix setup state.
      await expect(next).toBeDisabled();
      const inactive = await next.evaluate((e) => ({
        background: getComputedStyle(e).backgroundColor,
        opacity: getComputedStyle(e).opacity,
        cursor: getComputedStyle(e).cursor,
      }));
      const disabledBackground = inactive.background;
      expect(inactive.opacity).toBe("1");
      expect(inactive.cursor).toBe("not-allowed");
      await radio.press("Space");
      await expect(next).toBeEnabled();
      // The enabled background arrives through a CSS transition.
      await expect
        .poll(() => next.evaluate((e) => getComputedStyle(e).backgroundColor))
        .not.toBe(disabledBackground);
      await next.press("Enter");
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "University", "الجامعة"),
          exact: true,
        }),
      ).toBeFocused();
      await expect(next).toBeDisabled();
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `academic setup hierarchy, category copy and bounded references preserve configured paths`,
    { tag: ["@audit-06", `@${locale}`] },
    async ({ page }) => {
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
      // Heading hierarchy and bounded-reference geometry per width and scheme
      // run in the layout matrix setup and Settings states.
      await expect(section.locator("p").first()).toContainText(
        pick(locale, "Choose your academic path.", "اختر مسارك الدراسي."),
      );
      await expect(next).toBeDisabled();
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
      await showAccountView(page, "academic");
      await expect(page.getByLabel(category, { exact: true })).toHaveValue(
        "human-medicine",
      );
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `task headings, review completion and explicit destinations preserve the study flow`,
    { tag: ["@audit-09", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "student", locale);
      const profile = page.getByRole("link", {
        name: "Samir Hassan",
        exact: true,
      });
      // Each screen is inspected once here; the same screens are swept per
      // width and scheme (with the profile target size) in the layout matrix.
      const reflow = async (inspect: () => Promise<void>) => {
        await expect(profile).toHaveAccessibleDescription(
          t("Settings", "الإعدادات"),
        );
        const caption = profile.locator("[class*='profileDestination']");
        await expect(caption).toHaveText(t("Settings", "الإعدادات"));
        await expect(caption).toBeVisible();
        await inspect();
        await expectOriginalTypography(page, locale);
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
        await expect(setup.locator("[class*='reviewCompletion']")).toHaveCount(
          0,
        );
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
        await expect(completed.locator("svg[aria-hidden='true']")).toHaveCount(
          1,
        );
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
        expect((await signOut.boundingBox())!.height).toBeGreaterThanOrEqual(
          44,
        );
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
          page.getByText(t("Page 14", "صفحة ١٤"), { exact: true }),
        ).toBeVisible();
        await expect(
          page.getByText(t("Timestamp 18:42", "التوقيت ١٨:٤٢"), {
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
        .getByRole("button", {
          name: t("Sign out", "تسجيل الخروج"),
          exact: true,
        })
        .press("Enter");
      await expect(page).toHaveURL(new RegExp(`/login\\?lang=${locale}$`));
      finish();
    },
  );
});

// Restored from the retired fixture route's study-shelf spec (af8d1fb): the
// shared Study Shelf's own access states, through loopback `shelf-*` fixtures.
inLocales(["en"], (locale) => {
  test(
    `locked, no-membership, unpublished and error shelves expose no catalog`,
    { tag: ["@B01", "@M10", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      const copy = getCatalogCopy(locale);
      await signIn(page, "student", locale, "/learn?fixture=shelf-locked");
      const main = page.getByRole("main");
      for (const [fixture, title, body, role] of [
        [
          "shelf-locked",
          copy.cohortLockedTitle,
          copy.cohortLockedBody,
          "status",
        ],
        [
          "shelf-no-membership",
          copy.noMembershipTitle,
          copy.noMembershipBody,
          "status",
        ],
        [
          "shelf-unpublished",
          copy.unpublishedTitle,
          copy.unpublishedBody,
          "status",
        ],
        [
          "shelf-no-ready-source",
          copy.noReadySourceTitle,
          copy.noReadySourceBody,
          "status",
        ],
        ["shelf-error", copy.errorTitle, copy.errorBody, "alert"],
      ] as const) {
        await page.evaluate(
          (url) => history.pushState(null, "", url),
          `/learn?lang=${locale}&fixture=${fixture}`,
        );
        await expect(
          page.getByRole("heading", {
            level: 1,
            name: t("Your Study Shelf", "رف المذاكرة"),
            exact: true,
          }),
        ).toBeVisible();
        const state = main.getByRole(role).filter({ hasText: title });
        await expect(
          state.getByRole("heading", { name: title, exact: true }),
        ).toBeVisible();
        await expect(state).toContainText(body);
        // No unit, catalog choice or academic path leaks into a closed shelf.
        await expect(main.getByRole("combobox")).toHaveCount(0);
        await expect(main.locator('a[href*="/learn/"]')).toHaveCount(0);
        await expect(main).not.toContainText(t("Anatomy", "التشريح"));
      }
      await main
        .getByRole("alert")
        .getByRole("link", { name: copy.retry, exact: true })
        .click();
      await expect(page).toHaveURL(new RegExp(`/learn\\?lang=${locale}$`));
      await expect(main.getByRole("alert")).toHaveCount(0);
      finish();
    },
  );
});
