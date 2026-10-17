import {
  answerExamples,
  getAdminCopy,
  promptExamples,
  reviewCatalogRows,
} from "../support/app-fixtures";
import { bilingual, inLocales, localized, pick } from "../support/copy";
import {
  b07DetailsName,
  b07SourcesName,
  b07SwitchName,
  b07UnitsName,
  openStudyOptions,
  showAccountView,
  unit,
} from "../support/demo";
import { resize } from "../support/layout";
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
    `unsupported and conflicting replies preserve drafts, sources and copyable clarification`,
    { tag: ["@B08-B", `@${locale}`] },
    async ({ page }) => {
      const t = bilingual(locale);
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
        first.getByText(localized(promptExamples.supported, locale), {
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        first.getByText(localized(promptExamples.hint, locale), {
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
        localized(answerExamples.conflict, locale),
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `current inactive-source guidance retains history and recording-backed next steps`,
    { tag: ["@B08-B", `@${locale}`] },
    async ({ page }) => {
      const t = bilingual(locale),
        copy = getAdminCopy(locale);
      const finish = isolation(page);
      await signIn(page, "admin", locale);
      await page
        .getByRole("button", {
          name: new RegExp(`^${copy.verbs.DEACTIVATE_SOURCE} `),
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
        localized(answerExamples.unavailable, locale),
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
        reply.getByText(localized(promptExamples.hint, locale), {
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        reply
          .locator("details")
          .getByText(localized(promptExamples.supported, locale), {
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
        localized(answerExamples.hint, locale),
      );
      await page
        .locator("#exchange-2")
        .getByRole("button", {
          name: t("Practical 3, 18:42", "العملي 3، ١٨:٤٢"),
          exact: true,
        })
        .click();
      await expect(page.getByRole("dialog").locator("blockquote")).toHaveCount(
        1,
      );
      await page.getByRole("dialog").press("Escape");

      await page
        .getByRole("link", {
          name: t("Return to Admin", "العودة للإدارة"),
          exact: true,
        })
        .click();
      await page
        .getByRole("button", {
          name: new RegExp(`^${copy.verbs.ACTIVATE_SOURCE} `),
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
        .getByRole("button", {
          name: t("Sign out", "تسجيل الخروج"),
          exact: true,
        })
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
          name: new RegExp(`^${copy.verbs.ACTIVATE_SOURCE} `),
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
        localized(answerExamples.unavailable, locale),
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
          .getByText(localized(promptExamples.supported, locale), {
            exact: true,
          }),
      ).toBeVisible();
      await send(page, "supported", locale);
      await expect(page.locator("#exchange-3")).toContainText(
        localized(answerExamples.supported, locale),
      );

      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `compact context and a principal reading scroll preserve study work`,
    { tag: ["@B06", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
        page.getByText(localized(answerExamples.supported, locale), {
          exact: true,
        }),
      ).toHaveCount(3);
      // Compact phone geometry is this journey's subject; colour schemes and
      // axe for this state run in the layout matrix.
      for (const [width, height] of [
        [390, 844],
        [320, 720],
      ] as const) {
        // The shell picks its pane or page flow on the frame after a resize;
        // until then 320x720 still has the 390x844 pane (133px of reading).
        await resize(page, width, height);
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
            name: t("Lecture 6, p. 14", "المحاضرة 6، ص ١٤"),
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
              name: t("Lecture 6, p. 14", "المحاضرة 6، ص ١٤"),
              exact: true,
            })
            .last(),
        ).toBeFocused();
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
        // The shell re-measures on the next frame after a resize; read settled geometry.
        await expect
          .poll(() =>
            sources.evaluate((e) => {
              const r = e.getBoundingClientRect();
              const owners = Array.from(
                document.querySelectorAll<HTMLElement>("*"),
              ).filter(
                (item) =>
                  item.checkVisibility() &&
                  !item.matches("input,textarea,select") &&
                  ["auto", "scroll"].includes(
                    getComputedStyle(item).overflowY,
                  ) &&
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
                  (document.documentElement.scrollHeight > innerHeight + 2
                    ? 1
                    : 0),
                actionVisible: r.top >= 0 && r.bottom <= bottom + 1,
              };
            }),
          )
          .toEqual({ owners: 1, actionVisible: true });
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `explicit Chat targets retain locale and reset confirmation for another answer`,
    { tag: ["@B02", "@M15", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
        localized(answerExamples.supported, locale),
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
        localized(answerExamples.conflict, locale),
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
        localized(answerExamples.supported, locale),
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
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `missing, ambiguous, unsupported and foreign targets never fall back to Chat`,
    { tag: ["@B02", "@M15", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
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
          localized(answerExamples.supported, locale),
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `a normal session covers seven answer outcomes, evidence and report`,
    { tag: ["@demo-core", `@${locale}`] },
    async ({ page }) => {
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
        page.getByText(pick(locale, "Lecture 6 handout", "ملزمة المحاضرة 6"), {
          exact: true,
        }),
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `direct Send keeps drafts across a language switch, history and Studio interruption`,
    { tag: ["@demo-core", `@${locale}`] },
    async ({ page }) => {
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
      const prompt = localized(promptExamples.supported, locale);
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
          name: new RegExp(
            pick(nextLocale, "Simulated artifact", "مخرج محاكى"),
          ),
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
          name: new RegExp(
            pick(nextLocale, "Simulated artifact", "مخرج محاكى"),
          ),
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `cancelling Chat does not submit or complete a reply`,
    { tag: ["@demo-core", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "student", locale, unit + "/chat");
      // A controlled clock observes beyond the one-second completion window
      // without sleeping: a cancelled timer must not create a late exchange.
      await page.clock.install();
      const input = page.getByLabel(pick(locale, "Message", "السؤال"), {
        exact: true,
      });
      const evidence = page.getByRole("link", {
        name: pick(locale, "Inspect evidence", "فحص الأدلة"),
        exact: true,
      });
      const prompt = localized(promptExamples.supported, locale);
      await input.fill(prompt);
      await page
        .getByRole("button", {
          name: pick(locale, "Send", "إرسال"),
          exact: true,
        })
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
      await page.clock.runFor(1_200);
      await expect(evidence).toHaveCount(0);
      await page
        .getByRole("button", {
          name: pick(locale, "Send", "إرسال"),
          exact: true,
        })
        .click();
      await page.clock.runFor(1_200);
      await expect(evidence).toHaveCount(1);
      await input.fill(prompt);
      await input.press("Enter");
      const cancel = page.getByRole("button", {
        name: pick(locale, "Cancel stream", "إلغاء البث"),
        exact: true,
      });
      await cancel.focus();
      await cancel.press("Enter");
      await expect(input).toBeFocused();
      await page.clock.runFor(1_200);
      await expect(evidence).toHaveCount(1);
      await expect(input).toHaveValue(prompt);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `reachable study actions, exchange-bound citations and reduced motion`,
    { tag: ["@open-folio", `@${locale}`] },
    async ({ page }) => {
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
        name: pick(locale, "Lecture 6, p. 14", "المحاضرة 6، ص ١٤"),
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
          name: pick(locale, "Lecture 6, p. 14", "المحاضرة 6، ص ١٤"),
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
      await page.addStyleTag({
        content: "html { font-size: 200% !important; }",
      });
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `profile, independent settings, scoped subjects and first-visit citations`,
    { tag: ["@workspace-revision", `@${locale}`] },
    async ({ page }) => {
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
        name: pick(locale, "Lecture 6, p. 14", "المحاضرة 6، ص ١٤"),
        exact: true,
      });
      await citation.click();
      const dialog = page.getByRole("dialog", {
        name: pick(locale, "Source excerpt", "نص المصدر"),
        exact: true,
      });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("blockquote")).toContainText(
        pick(locale, "Injury to the upper trunk", "إصابة الجذع العلوي"),
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
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `accessible language scope and aligned Chat tools retain drafts and sessions`,
    { tag: ["@audit-03", `@${locale}`] },
    async ({ page }) => {
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
      // Tool alignment at each width is checked by the layout matrix chat state.
      await expect(scopeLabel()).toHaveCount(0);
      await expect(interfaceGroup()).toBeVisible();
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
      const prompt = localized(promptExamples.supported, locale);
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
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `surfaced Sessions and readable sharing status retain native keyboard and drafts`,
    { tag: ["@audit-05", `@${locale}`] },
    async ({ page }) => {
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
        pick(locale, "Visible to UniMind’s founders", "ظاهرة لمؤسسي UniMind"),
      );
      await expect(meta.locator("span")).toHaveText(
        pick(
          locale,
          "Enter to send; Shift+Enter for a new line",
          "Enter للإرسال؛ Shift+Enter لسطر جديد",
        ),
      );
      // Sessions control and note styling per width run in the layout matrix.
      await sessions.press("Enter");
      await expect(
        page.getByRole("button", {
          name: pick(locale, "New session", "جلسة جديدة"),
          exact: true,
        }),
      ).toBeVisible();
      await sessions.press("Escape");
      await expect(sessions).toBeFocused();
      const message = page.getByLabel(pick(locale, "Message", "السؤال"), {
        exact: true,
      });
      const prompt = localized(promptExamples.supported, locale);
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
    },
  );
});
