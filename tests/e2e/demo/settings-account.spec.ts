import { reviewCatalogRows } from "../support/app-fixtures";
import { bilingual, formatNumber, inLocales, pick } from "../support/copy";
import {
  b07ChooseName,
  b07DetailsName,
  b07People,
  b07SourcesName,
  chooseTheme,
  openStudyOptions,
  showAccountView,
  unit,
} from "../support/demo";
import { isolation, navigate, signIn } from "../support/session";
import { expect, test } from "../support/test";
inLocales(["ar"], (locale) => {
  for (const [role, name, enRole, arRole] of b07People) {
    test(
      `account identity, neutral appearance and sign-out stay visible across settings for ${role}`,
      { tag: ["@B07-B", `@${locale}`] },
      async ({ page }) => {
        const t = bilingual(locale);
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
        await showAccountView(page, "appearance");
        const figure = main.getByRole("figure", {
          name: t("Theme preview", "معاينة السمة"),
          exact: true,
        });
        await expect(
          figure.getByText(t("Example screen", "شاشة نموذجية"), {
            exact: true,
          }),
        ).toBeVisible();
        await expect(
          figure.getByText(t("Your Study Shelf", "رف المذاكرة"), {
            exact: true,
          }),
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
                theme === "light"
                  ? "فاتح"
                  : theme === "dark"
                    ? "داكن"
                    : "النظام",
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
        await expect(page.locator("html")).toHaveAttribute(
          "data-theme",
          "light",
        );
        // The sign-out target at each width and at 200% text: layout matrix.
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
        const privacy = page.getByRole("tab", {
          name: t("Privacy", "الخصوصية"),
          exact: true,
        });
        if (role === "student") {
          await privacy.click();
          await expect(
            page.getByRole("group", {
              name: t("Sharing mode", "وضع المشاركة"),
              exact: true,
            }),
          ).toBeVisible();
        } else {
          // Chat sharing applies to students only (WP03-T27, PJ-15).
          await expect(privacy).toHaveCount(0);
        }
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
          page.getByRole("tab", {
            name: t("Privacy", "الخصوصية"),
            exact: true,
          }),
        ).toHaveCount(0);
        finish();
      },
    );
  }
});

for (const role of ["admin", "second-admin"]) {
  test(
    `existing permitted study returns remain available in Account for ${role}`,
    { tag: ["@B02", "@M75"] },
    async ({ page }) => {
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
    },
  );
}

test(
  `a denied leader study route cannot create a Settings return`,
  { tag: ["@B02", "@M75"] },
  async ({ page }) => {
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
  },
);

inLocales(["ar"], (locale) => {
  test(
    `Settings returns to the actual quiz attempt and review`,
    { tag: ["@B02", "@M75", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "";
      });
      await page.setViewportSize({ width: 1440, height: 900 });
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `Settings detours consume the original quiz timer`,
    { tag: ["@B02", "@M75", `@${locale}`] },
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
        formatNumber(locale, 30),
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `invalid and foreign attempts never replace the recent quiz`,
    { tag: ["@B02", "@M75", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
        new URL(
          (await back.getAttribute("href"))!,
          page.url(),
        ).searchParams.get("attempt"),
      ).not.toBe(secondKey);
      await back.press("Enter");
      await expect(
        page.locator('input[name^="sample-question-"]:checked'),
      ).toHaveCount(0);
      await navigate(page, "/settings", locale);
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

inLocales(["en"], (locale) => {
  test(
    `Quiz setup and the named Shelf resume keep the same route`,
    { tag: ["@B02", "@M75", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
        name: t(
          "Return to Quiz · Anatomy",
          "العودة إلى الاختبار · علم التشريح",
        ),
        exact: true,
      });
      await expect(setup).toHaveAttribute(
        "href",
        `${unit}/quiz?lang=${locale}`,
      );
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
      await expect(resume).toHaveAttribute(
        "href",
        /\/sample-attempt\?attempt=/u,
      );
      await resume.press("Enter");
      await expect(
        page.locator('input[name="sample-question-0"]').nth(0),
      ).toBeChecked();
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `compact settings and period choices preserve readable context, drafts and native controls`,
    { tag: ["@audit-10", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
      // Period, appearance, identity, materials-context and Chat geometry per
      // width and scheme run in the layout matrix.
      const periods = page.getByRole("group", {
        name: t("Study period", "الفترة الدراسية"),
        exact: true,
      });
      const review = page.getByRole("button", {
        name: t("Review choices", "مراجعة الاختيارات"),
        exact: true,
      });
      await expect(review).toBeDisabled();
      await expect(periods.getByRole("radio")).toHaveCount(2);
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
      await showAccountView(page, "appearance");
      const appearance = page.locator("#appearance-settings");
      await expect(appearance).toBeVisible();
      await expect(
        page.getByRole("figure", {
          name: t("Theme preview", "معاينة السمة"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("radio", { name: t("System", "النظام"), exact: true }),
      ).toBeChecked();
      await page
        .getByRole("tab", { name: t("Appearance", "المظهر"), exact: true })
        .press("End");
      const identity = page.locator("#identity-settings");
      await expect(identity).toBeVisible();
      await expect(
        identity.getByRole("link", {
          name: t("Reset password", "إعادة تعيين كلمة المرور"),
          exact: true,
        }),
      ).toHaveAttribute("href", `/forgot-password?lang=${locale}`);
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
      await expect(page.locator("article")).toHaveCount(8);
      await expect(page.locator('[class*="scopeCaption"]')).toContainText(
        t("Faculty of Medicine", "كلية الطب البشري"),
      );
      await navigate(page, `${unit}/chat`, locale);
      const draft = "Roots of the plexus — synthetic unsent draft.";
      const message = page.getByRole("textbox", {
        name: t("Message", "السؤال"),
        exact: true,
      });
      await message.fill(draft);
      const sessions = page
        .locator("summary[aria-label]")
        .filter({ hasText: t("Sessions", "الجلسات") });
      await sessions.press("Enter");
      await expect(sessions.locator("..")).toHaveAttribute("open", "");
      await sessions.press("Escape");
      await expect(sessions).toBeFocused();
      await openStudyOptions(page, locale);
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `academic setup, editable account settings and persistent appearance`,
    { tag: ["@demo-core", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "student", locale);
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Set up your Study Shelf", "إعداد رف المذاكرة"),
        }),
      ).toBeVisible();
      await expect(page).toHaveTitle(/\S/u);
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
          name: pick(
            locale,
            "Save academic settings",
            "حفظ الإعدادات الدراسية",
          ),
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
            "Faculty of Medicine, Second year, Term 1",
            "كلية الطب البشري · السنة الثانية · الترم الأول",
          ),
          { exact: true },
        ),
      ).toBeVisible();
      await expect(page).toHaveTitle(/\S/u);
      // The isolated demo resets identity/profile memory on reload. Appearance
      // alone persists; actual profile durability is proven at the SQL seam.
      await page.reload();
      await expect(page).toHaveURL(/\/login\?/u);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `settings naming, readable theme preview and separated privacy disclosures`,
    { tag: ["@audit-05", `@${locale}`] },
    async ({ page }) => {
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
      await showAccountView(page, "appearance");
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
      }
      // Preview placement per width runs in the layout matrix Settings state.
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
      finish();
    },
  );
});
