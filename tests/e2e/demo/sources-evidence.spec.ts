import {
  getAdminCopy,
  promptExamples,
  reviewCatalogRows,
} from "../support/app-fixtures";
import {
  bilingual,
  formatNumber,
  inLocales,
  languageName,
  localized,
  otherLocale,
  pick,
} from "../support/copy";
import {
  completeAcademicSetup,
  expectOriginalTypography,
  generateStudioExample,
  openEvidenceFromChat,
  openLibraryFromChat,
  openLibraryFromStudio,
  openUnitMenu,
  selectStudioExample,
  unit,
} from "../support/demo";
import { isolation, navigate, send, signIn } from "../support/session";
import { expect, test } from "../support/test";
inLocales(["ar"], (locale) => {
  test(
    `expired unscored corrections retain enabled passages and exact source returns`,
    { tag: ["@B08-C", `@${locale}`] },
    async ({ page }) => {
      test.setTimeout(120_000);
      const t = bilingual(locale);
      const finish = isolation(page);
      await signIn(page, "student", locale, unit + "/quiz");
      await page
        .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
        .check();
      await page
        .getByLabel(t("Duration (minutes)", "المدة (بالدقائق)"), {
          exact: true,
        })
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
          formatNumber(locale, 2),
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `an inactive current reading preserves aid and submitted-quiz passages`,
    { tag: ["@B08-C", `@${locale}`] },
    async ({ page }) => {
      test.setTimeout(180_000);
      const t = bilingual(locale),
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
      const reviewUrl = page.url();
      await page
        .getByRole("link", {
          name: t("Return to Admin", "العودة للإدارة"),
          exact: true,
        })
        .click();
      await page
        .getByRole("button", {
          name: new RegExp(`^${copy.verbs.DEACTIVATE_SOURCE} `, "u"),
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
      await expect(page.getByRole("dialog").locator("blockquote")).toHaveCount(
        2,
      );
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
            formatNumber(locale, 1),
          exact: true,
        })
        .click();
      await expect(page.getByRole("dialog").locator("blockquote")).toHaveCount(
        1,
      );
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `the library separates tool availability from supplied processed reading`,
    { tag: ["@B08-C", `@${locale}`] },
    async ({ page }) => {
      test.setTimeout(180_000);
      const t = bilingual(locale);
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
        // Availability is the norm: only an exception is labelled (MD-19).
        await expect(
          rows.getByText(
            t("Available for learning tools", "متاح لأدوات المذاكرة"),
            { exact: true },
          ),
        ).toHaveCount(0);
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
                "Injury to the upper trunk (C5, C6) produces Erb–Duchenne paralysis, commonly from excessive separation of the head and shoulder. The plexus is formed by the ventral rami of C5 to T1.",
                "إصابة الجذع العلوي (C5 وC6) تسبب شلل إرب-دوشين، غالبًا من المباعدة الشديدة بين الرأس والكتف. تتكون الضفيرة من الفروع الأمامية للأعصاب من C5 إلى T1.",
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
                "Count the roots first. In some people the plexus is prefixed and takes a branch from C4, so check before you name the trunks.",
                "عُدّ الجذور أولًا. في بعض الناس تكون الضفيرة متقدمة وتأخذ فرعًا من C4، فتأكد قبل أن تسمي الجذوع.",
              ),
              { exact: true },
            ),
        ).toBeVisible();
        // The excerpt limitation is said once, above the list (MD-19).
        await expect(rows.nth(1)).not.toContainText(
          t("Processed excerpt only.", "مقتطف معالج فقط."),
        );
        await expect(
          page.getByText(
            t(
              "Excerpts show processed passages only.",
              "المقتطفات تعرض نصوصًا معالجة فقط.",
            ),
            { exact: false },
          ),
        ).toHaveCount(1);
        finish();
      }
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `five generated aids open their passages directly and retain one full library`,
    { tag: ["@B08-C", `@${locale}`] },
    async ({ page }) => {
      test.setTimeout(180_000);
      const t = bilingual(locale);
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
        await expect(dialog).toContainText(t("Page 14", "صفحة ١٤"));
        await expect(dialog).toContainText(
          t("Timestamp 18:42", "التوقيت ١٨:٤٢"),
        );
        await expect(dialog.getByRole("link")).toHaveCount(1);
        await expect(dialog.getByRole("link")).toHaveAttribute(
          "href",
          `${unit}/sources?from=studio&lang=${locale}`,
        );
        await dialog.press("Escape");
        await expect(dialog).not.toBeVisible();
        await expect(inspect).toBeFocused();
        await expect(output).toHaveText(before, { useInnerText: true });
      }
      const output = page.locator("section[class*='artifactOutput']");
      const before = await output.innerText();
      await openLibraryFromStudio(page, locale);
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `every quiz explanation opens only its exact supporting passages with locked answers`,
    { tag: ["@B08-C", `@${locale}`] },
    async ({ page }) => {
      test.setTimeout(180_000);
      const t = bilingual(locale);
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
            formatNumber(locale, q + 1);
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
                  ? t("Lecture 6 handout", "ملزمة المحاضرة 6")
                  : t("Practical 3 recording", "تسجيل العملي 3"),
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
        await page
          .getByRole("link", {
            name: t("Back to quiz", "العودة للاختبار"),
            exact: true,
          })
          .click();
      }
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `submitted review and replacement returns stay exact`,
    { tag: ["@B02", "@M64", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "student", locale, `${unit}/quiz`);
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
        .getByRole("link", {
          name: t("Open Quiz", "فتح الاختبار"),
          exact: true,
        })
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `source detours consume the original timer and expire without editable answers`,
    { tag: ["@B02", "@M64", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "student", locale, `${unit}/quiz`);
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
        formatNumber(locale, 30),
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `ambiguous, unknown, missing and foreign source targets cannot guess a quiz`,
    { tag: ["@B02", "@M64", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
      await openUnitMenu(page);
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
        page.getByLabel(t("Email address", "البريد الإلكتروني"), {
          exact: true,
        }),
      ).toBeVisible();
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `a partial attempt returns from sources with its selections and locale`,
    { tag: ["@B02", "@M64", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `the Studio source library never offers an old Chat report`,
    { tag: ["@B02", "@M15", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
      await openLibraryFromStudio(page, locale);
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
      await expect(artifact.locator(":scope > div[lang]")).toHaveText(
        original,
        {
          useInnerText: true,
        },
      );
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `source deactivation keeps historical targets and excludes new dependent work`,
    { tag: ["@B01", "@M53", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
          name: new RegExp(`^${copy.verbs.DEACTIVATE_SOURCE} `, "u"),
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
      ).toHaveCount(0);
      await navigate(page, unit + "/chat", locale);
      await expect(page.locator("#exchange-2")).toBeVisible();
      await openEvidenceFromChat(page, locale, 2);
      await expect(page).toHaveURL(/exchange=2&session=1/u);
      await expect(
        page.getByText(t("Page 14", "صفحة ١٤"), { exact: false }).first(),
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `compact source rows keep keyboard excerpts and contextual returns`,
    { tag: ["@audit-02", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "student", locale, unit + "/studio");
      await generateStudioExample(page, locale);
      await openLibraryFromStudio(page, locale);
      await expectOriginalTypography(page, locale);
      const rows = page.locator("article");
      await expect(rows).toHaveCount(8);
      // Compact row geometry per width and scheme runs in the layout matrix.
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
              "Injury to the upper trunk (C5, C6) produces Erb–Duchenne paralysis, commonly from excessive separation of the head and shoulder. The plexus is formed by the ventral rami of C5 to T1.",
              "إصابة الجذع العلوي (C5 وC6) تسبب شلل إرب-دوشين، غالبًا من المباعدة الشديدة بين الرأس والكتف. تتكون الضفيرة من الفروع الأمامية للأعصاب من C5 إلى T1.",
            ),
            { exact: true },
          ),
      ).toBeVisible();
      await summary.press("Enter");
      await expect(rows.first().locator("details")).not.toHaveAttribute("open");
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
      await send(page, "supported", locale);
      // The first-visit tip appears under the first cited answer.
      const gotIt = page.getByRole("button", {
        name: pick(locale, "Got it", "فهمت"),
        exact: true,
      });
      await expect(gotIt).toBeVisible();
      await gotIt.click();
      await openLibraryFromChat(page, locale);
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `plain material metadata and discoverable Studio options`,
    { tag: ["@audit-04", `@${locale}`] },
    async ({ page }) => {
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
      // The row names the page once; the excerpt no longer repeats it.
      await expect(
        page.getByText(pick(locale, "Page 14", "صفحة ١٤"), {
          exact: false,
        }),
      ).toHaveCount(1);
      const excerpt = page.locator("article summary").first();
      await excerpt.press("Enter");
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
      // The disclosure's emphasis per width and scheme runs in the layout matrix.
      await disclosure.press("Enter");
      await expect(depth).toBeVisible();
      await expect(depth).toHaveValue("detailed");
      await disclosure.press("Space");
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
      await openLibraryFromStudio(page, locale);
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `grouped study actions, source formats, native excerpts and count guidance preserve the learning path`,
    { tag: ["@audit-07", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "student", locale);
      await completeAcademicSetup(page, locale);
      // Resume, materials, Studio hierarchy and count-hint geometry per width
      // and scheme run in the layout matrix (Shelf, materials, Studio, Quiz).
      const materialFormats = async () => {
        await expect(page.locator("article")).toHaveCount(8);
        expect(
          await page
            .locator("article")
            .evaluateAll((rows) =>
              rows
                .slice(0, 2)
                .map((row) => row.querySelector("bdi")!.textContent),
            ),
        ).toEqual(["PDF", "AUDIO"]);
        await expect(
          page
            .getByText(pick(locale, "Page 14", "صفحة ١٤"), {
              exact: true,
            })
            .first(),
        ).toBeVisible();
      };
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
      await materialFormats();
      const summary = page.locator("article").first().locator("summary");
      await summary.press("Enter");
      await expect(
        page.locator("article").first().locator("details"),
      ).toHaveAttribute("open", "");
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
      await summary.press("Space");
      await expect(
        page.locator("article").first().locator("details"),
      ).not.toHaveAttribute("open");
      await navigate(page, unit + "/studio", locale);
      await expect(
        page.getByRole("button", {
          name: pick(locale, "Generate", "إنشاء"),
          exact: true,
        }),
      ).toBeEnabled();
      await generateStudioExample(page, locale);
      await openLibraryFromStudio(page, locale);
      await materialFormats();
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
      await expect(page.getByText(help, { exact: true })).toBeVisible();
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
      await count.fill("3");
      await start.press("Enter");
      await expect(
        page.locator('fieldset:has(input[name^="sample-question-"])'),
      ).toHaveCount(3);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `visible targets, selected language and grouped source returns preserve navigation`,
    { tag: ["@audit-08", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "student", locale);
      await completeAcademicSetup(page, locale);
      // Target sizes, header alignment and source-context geometry per width
      // and scheme run in the layout matrix (Settings, Subjects, materials and
      // sources states).
      const languageState = async () => {
        const group = page.getByRole("group", {
          name: pick(locale, "Interface language", "لغة الواجهة"),
          exact: true,
        });
        await expect(group.getByRole("button")).toHaveCount(2);
        const selected = group.getByRole("button", {
          name: languageName(locale),
          exact: true,
        });
        const other = group.getByRole("button", {
          name: languageName(otherLocale(locale)),
          exact: true,
        });
        await expect(selected).toHaveAttribute("aria-pressed", "true");
        await expect(selected).toBeVisible();
        // The compact control shows the current state by fill and
        // aria-pressed, with no check icon (WP03 plan D1).
        await expect(other).toHaveAttribute("aria-pressed", "false");
        await expect(group.locator("svg")).toHaveCount(0);
        await expect(
          page.getByText(pick(locale, "Interface language", "لغة الواجهة"), {
            exact: true,
          }),
        ).toHaveCount(0);
      };
      await navigate(page, "/settings", locale);
      const tabs = page.getByRole("tab");
      await expect(tabs).toHaveCount(5);
      await languageState();
      await tabs.first().click();
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
      await languageState();
      await expect(rows).toHaveCount(5);
      for (const row of await rows.all()) {
        await expect(row.locator("[class*='unitAction']")).toContainText(
          pick(locale, "Open", "فتح"),
        );
        await expect(row.getByRole("button")).toHaveCount(0);
      }
      await page
        .getByRole("link", {
          name: pick(locale, "Open Anatomy", "فتح علم التشريح"),
          exact: true,
        })
        .press("Enter");
      await expect(page).toHaveURL(new RegExp(`${unit}\\?lang=${locale}$`));
      await expect(page.locator("[class*='sourceContext']")).toHaveCount(0);
      await languageState();
      await navigate(page, unit + "/chat", locale);
      // Chat reaches the library through a cited answer's source sheet.
      await send(page, "supported", locale);
      const draft = localized(promptExamples.supported, locale);
      await page
        .getByLabel(pick(locale, "Message", "السؤال"), { exact: true })
        .fill(draft);
      await openLibraryFromChat(page, locale);
      const sourceContext = page.locator("[class*='sourceContext']");
      await languageState();
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
      await expect(page.locator("article")).toHaveCount(8);
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
      await generateStudioExample(page, locale);
      await page
        .getByRole("button", {
          name: pick(locale, "Supporting passages", "النصوص الداعمة"),
          exact: true,
        })
        .click();
      const sources = page.getByRole("dialog").getByRole("link", {
        name: pick(locale, "Browse material library", "تصفح مكتبة المصادر"),
        exact: true,
      });
      await expect(sources).toHaveAttribute(
        "href",
        `${unit}/sources?from=studio&lang=${locale}`,
      );
      await sources.click();
      await sourceContext
        .getByRole("link", {
          name: pick(locale, "Return to Studio", "العودة للاستوديو"),
          exact: true,
        })
        .press("Enter");
      await expect(page).toHaveURL(new RegExp(`/studio\\?lang=${locale}$`));
      finish();
    },
  );
});
