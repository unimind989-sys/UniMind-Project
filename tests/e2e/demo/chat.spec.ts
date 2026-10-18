import {
  answerExamples,
  getAdminCopy,
  promptExamples,
  reviewCatalogRows,
} from "../support/app-fixtures";
import { bilingual, inLocales, localized, pick } from "../support/copy";
import {
  answerLanguage,
  b07SwitchName,
  b07UnitsName,
  closeUnitMenu,
  openEvidenceFromChat,
  openLibraryFromChat,
  openUnitMenu,
  showAccountView,
  signOutFromAdmin,
  unit,
  unitMenuSummary,
} from "../support/demo";
import { readingLayout, resize, settle } from "../support/layout";
import { productNavigation } from "../support/layout-matrix";
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
      await signOutFromAdmin(page, locale);
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
      /** The open unit menu is usable and stays inside the viewport. */
      const inspectMenu = async () => {
        expect(
          await page.locator("[class*='menuPanel']").evaluate((panel) => {
            const r = panel.getBoundingClientRect();
            return {
              usableWidth: r.width >= 240,
              withinViewport:
                r.left >= 0 &&
                r.right <= document.documentElement.clientWidth + 1,
              noHorizontalScroll: panel.scrollWidth <= panel.clientWidth + 1,
              controlsUnclipped: Array.from(
                panel.querySelectorAll<HTMLElement>("a,button"),
              )
                .filter((control) => control.checkVisibility())
                .every(
                  (control) => control.scrollWidth <= control.clientWidth + 1,
                ),
            };
          }),
        ).toEqual({
          usableWidth: true,
          withinViewport: true,
          noHorizontalScroll: true,
          controlsUnclipped: true,
        });
      };
      await signIn(page, "student", locale, `${unit}/chat`);
      for (let n = 0; n < 3; n++) await send(page, "supported", locale);
      // The first-visit citation tip sits under the first cited answer.
      const hint = page.getByRole("button", {
        name: t("Got it", "فهمت"),
        exact: true,
      });
      await expect(
        page.locator("#exchange-1").getByRole("complementary", {
          name: t("Citation help", "مساعدة الاستشهادات"),
        }),
      ).toBeVisible();
      await hint.click();
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
        // The shell picks its pane or page flow on the frame after a resize.
        await resize(page, width, height);
        await page.evaluate(() => document.fonts.ready);
        // WP03-T26: Chat keeps the docked composer on phones.
        await expect(page.locator('[data-layout="workspace"]')).toHaveAttribute(
          "data-workspace-flow",
          "pane",
        );
        expect(
          await page.evaluate(
            () =>
              getComputedStyle(document.body).minWidth === "0px" &&
              document.body.getBoundingClientRect().width <=
                document.documentElement.clientWidth + 1,
          ),
        ).toBe(true);
        const layout = await readingLayout(
          page,
          t("Conversation", "المحادثة الحالية"),
        );
        expect(layout.visible).toBeGreaterThanOrEqual(160);
        expect(layout.owners).toBe(1);
        expect(layout.overflow).toBe(false);
        // One header: no logo row and no bottom bar inside a unit (MD-01, D2).
        await expect(
          page.locator("header[data-workspace-chrome]"),
        ).toBeHidden();
        await expect(productNavigation(page, locale)).toBeHidden();
        // The title button opens the one menu with the unit's details (MD-02).
        await openUnitMenu(page);
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
        await inspectMenu();
        await unitMenuSummary(page).press("Escape");
        await expect(unitMenuSummary(page)).toBeFocused();
        await expect(
          page.getByText(t("Zagazig University", "جامعة الزقازيق"), {
            exact: true,
          }),
        ).toBeHidden();
        const citation = page
          .getByRole("button", {
            name: t("Lecture 6, p. 14", "المحاضرة 6، ص ١٤"),
            exact: true,
          })
          .last();
        await citation.click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await page
          .getByRole("dialog")
          .getByRole("button", { name: t("Close", "إغلاق"), exact: true })
          .click();
        await expect(citation).toBeFocused();
      }
      await page.locator("#message").fill("Keep this synthetic B06 draft.");
      // The answer language is a menu in the composer (MD-02).
      await answerLanguage(page, locale).selectOption("ar");
      // On phones the interface language sits in the unit menu.
      await openUnitMenu(page);
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
      await openUnitMenu(page);
      await page
        .getByRole("button", {
          name: locale === "en" ? "English" : "العربية",
          exact: true,
        })
        .click();
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(answerLanguage(page, locale)).toHaveValue("ar");
      await closeUnitMenu(page);
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
        // Phones show the result first, its settings folded into one line.
        await expect(
          page.getByRole("button", {
            name: new RegExp(`^${t("Settings", "الإعدادات")}`, "u"),
          }),
        ).toHaveAttribute("aria-expanded", "false");
        const passages = page.getByRole("button", {
          name: t("Supporting passages", "النصوص الداعمة"),
          exact: true,
        });
        await passages.focus();
        await expect(passages).toBeFocused();
        // The shell re-measures on the next frame after a resize; read
        // settled geometry. Studio scrolls the document on phones (MD-06).
        await expect
          .poll(() =>
            passages.evaluate((e) => {
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
              return {
                flow: document
                  .querySelector("[data-workspace-flow]")
                  ?.getAttribute("data-workspace-flow"),
                owners:
                  owners.length +
                  (document.documentElement.scrollHeight > innerHeight + 2
                    ? 1
                    : 0),
                actionVisible: r.top >= 0 && r.bottom <= innerHeight + 1,
              };
            }),
          )
          .toEqual({ flow: "page", owners: 1, actionVisible: true });
      }
      await navigate(page, `${unit}/chat`, locale);
      await expect(page.locator("#message")).toHaveValue(
        "Keep this synthetic B06 draft.",
      );
      for (const width of [768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(answerLanguage(page, locale)).toBeVisible();
        expect(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth + 1,
          ),
        ).toBe(true);
      }
      await page.setViewportSize({ width: 320, height: 720 });
      await page.evaluate(
        () => (document.documentElement.style.fontSize = "32px"),
      );
      // 200% text leaves no room to dock: the page scrolls instead.
      await expect(page.locator('[data-layout="workspace"]')).toHaveAttribute(
        "data-workspace-flow",
        "page",
      );
      await openUnitMenu(page);
      await inspectMenu();
      await closeUnitMenu(page);
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
      await page.locator("#message").blur();
      await resize(page, 390, 420);
      // A short window without a focused field is not a keyboard.
      await expect(
        page.locator('[data-layout="workspace"]'),
      ).not.toHaveAttribute("data-keyboard", /./u);
      await page.locator("#message").fill("Keyboard-sized viewport example.");
      await expect(page.locator("#message")).toBeInViewport();
      finish();
    },
  );
});

inLocales(["en", "ar"], (locale) => {
  test(
    `a phone keyboard keeps the composer docked without a page-flow flip [${locale}]`,
    { tag: ["@WP03-T26", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      const workspace = page.locator('[data-layout="workspace"]');
      await page.setViewportSize({ width: 360, height: 640 });
      await signIn(page, "student", locale, `${unit}/chat`);
      await send(page, "supported", locale);
      await send(page, "conflict", locale);
      await settle(page);
      await expect(workspace).toHaveAttribute("data-workspace-flow", "pane");
      const resting = await readingLayout(
        page,
        t("Conversation", "المحادثة الحالية"),
      );
      // The docked phone layout keeps 400px of conversation at 360x640 in
      // the hosted presentation; the local demo adds its service line.
      const serviceLine = await page
        .getByRole("note")
        .filter({ hasText: t("Synthetic demo", "عرض تجريبي") })
        .evaluate((note) => note.getBoundingClientRect().height);
      expect(resting.visible + serviceLine).toBeGreaterThanOrEqual(400);
      const tools = page.getByRole("navigation", {
        name: t("Workspace navigation", "تنقل مساحة المذاكرة"),
        exact: true,
      });
      await expect(tools).toBeVisible();
      // A software keyboard: the field has focus, then the viewport shrinks
      // at the same width (resizes-content; iOS shrinks the visual viewport).
      await page.locator("#message").focus();
      await resize(page, 360, 360);
      await expect(workspace).toHaveAttribute("data-keyboard", "open");
      await expect(workspace).toHaveAttribute("data-workspace-flow", "pane");
      await expect(tools).toBeHidden();
      await expect(page.locator("#message")).toBeFocused();
      await expect(page.locator("#message")).toBeInViewport({ ratio: 1 });
      await expect(
        page.getByRole("button", { name: t("Send", "إرسال"), exact: true }),
      ).toBeInViewport({ ratio: 1 });
      const typing = await readingLayout(
        page,
        t("Conversation", "المحادثة الحالية"),
      );
      expect(typing.owners).toBe(1);
      expect(typing.overflow).toBe(false);
      // As at rest, the hosted presentation has no local service line; it
      // wraps to more lines at 360px with some fonts (Linux CI).
      const serviceLineWhileTyping = await page
        .getByRole("note")
        .filter({ hasText: t("Synthetic demo", "عرض تجريبي") })
        .evaluate((note) => note.getBoundingClientRect().height);
      expect(typing.visible + serviceLineWhileTyping).toBeGreaterThanOrEqual(
        120,
      );
      // The page itself does not scroll: the composer stays docked.
      expect(
        await page.evaluate(
          () => document.documentElement.scrollHeight <= innerHeight + 1,
        ),
      ).toBe(true);
      await page.locator("#message").fill(t("A typed question", "سؤال مكتوب"));
      // The keyboard closes: the tools come back and the flow is unchanged.
      await page.locator("#message").blur();
      await resize(page, 360, 640);
      await expect(workspace).not.toHaveAttribute("data-keyboard", /./u);
      await expect(workspace).toHaveAttribute("data-workspace-flow", "pane");
      await expect(tools).toBeVisible();
      await expect(page.locator("#message")).toHaveValue(
        t("A typed question", "سؤال مكتوب"),
      );
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `the phone source sheet traps focus, closes on Escape and returns focus`,
    { tag: ["@WP03-T26", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await page.setViewportSize({ width: 390, height: 844 });
      await signIn(page, "student", locale, `${unit}/chat`);
      await send(page, "conflict", locale);
      const citation = page.getByRole("button", {
        name: t("Two source excerpts", "نصان من مصدرين"),
        exact: true,
      });
      await citation.click();
      const sheet = page.getByRole("dialog", {
        name: t("Source excerpt", "نص المصدر"),
      });
      await expect(sheet).toBeVisible();
      // A bottom sheet: full width, on the bottom edge, 22px top corners,
      // read once its 300ms rise has settled.
      await sheet.evaluate((element) =>
        Promise.all(element.getAnimations().map((motion) => motion.finished)),
      );
      const geometry = await sheet.evaluate((element) => {
        const r = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          left: Math.round(r.left),
          width: Math.round(r.width),
          bottom: Math.abs(Math.round(innerHeight - r.bottom)),
          radius: style.borderTopLeftRadius,
          bottomRadius: style.borderBottomLeftRadius,
          modal: element.matches(":modal"),
        };
      });
      expect(geometry).toEqual({
        left: 0,
        width: 390,
        bottom: 0,
        radius: "22px",
        bottomRadius: "0px",
        modal: true,
      });
      await expect(sheet.locator("blockquote")).toHaveCount(2);
      // Focus stays inside the modal sheet: tabbing moves within it and the
      // page behind is inert.
      for (let step = 0; step < 2; step++) {
        await page.keyboard.press("Tab");
        expect(
          await sheet.evaluate((element) =>
            element.contains(document.activeElement),
          ),
        ).toBe(true);
      }
      expect(
        await sheet.evaluate((element) => {
          document.querySelector<HTMLElement>("#message")?.focus();
          return element.contains(document.activeElement);
        }),
      ).toBe(true);
      await page.keyboard.press("Escape");
      await expect(sheet).toBeHidden();
      await expect(citation).toBeFocused();
      // A text selection dragged from the sheet onto the backdrop keeps it
      // open; a press and release on the backdrop closes it.
      await citation.click();
      await expect(sheet).toBeVisible();
      const quote = await sheet.locator("blockquote").first().boundingBox();
      await page.mouse.move(quote!.x + 20, quote!.y + 10);
      await page.mouse.down();
      await page.mouse.move(195, 40, { steps: 8 });
      await page.mouse.up();
      await expect(sheet).toBeVisible();
      await page.mouse.click(195, 40);
      await expect(sheet).toBeHidden();
      await expect(citation).toBeFocused();
      // Desktop keeps the centred dialog.
      await page.setViewportSize({ width: 1280, height: 800 });
      await citation.click();
      const dialog = await sheet.evaluate((element) => {
        const r = element.getBoundingClientRect();
        return { centred: Math.abs(r.left + r.width / 2 - innerWidth / 2) < 2 };
      });
      expect(dialog.centred).toBe(true);
      await page.keyboard.press("Escape");
      await expect(citation).toBeFocused();
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `a press outside the unit menu closes it without moving focus to it`,
    { tag: ["@WP03-T26", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await page.setViewportSize({ width: 1280, height: 800 });
      await signIn(page, "student", locale, `${unit}/chat`);
      const summary = unitMenuSummary(page);
      await summary.click();
      await expect(summary).toHaveAttribute("aria-expanded", "true");
      // A press on the conversation dismisses the menu and leaves focus
      // where the user pressed; Space then does not reopen it.
      const conversation = await page
        .getByRole("region", { name: t("Conversation", "المحادثة الحالية") })
        .boundingBox();
      await page.mouse.click(
        conversation!.x + conversation!.width - 40,
        conversation!.y + conversation!.height - 40,
      );
      await expect(summary).toHaveAttribute("aria-expanded", "false");
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      await expect(summary).not.toBeFocused();
      await page.keyboard.press("Space");
      await expect(summary).toHaveAttribute("aria-expanded", "false");
      // Escape still returns focus to the summary.
      await summary.click();
      await expect(summary).toHaveAttribute("aria-expanded", "true");
      await page.keyboard.press("Escape");
      await expect(summary).toHaveAttribute("aria-expanded", "false");
      await expect(summary).toBeFocused();
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
      // One evidence route per answer: citation, then the sheet's link.
      await openEvidenceFromChat(page, locale, 1);
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
      await openEvidenceFromChat(page, locale);
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
      await openEvidenceFromChat(page, locale);
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
      await expect(unitMenuSummary(page)).toHaveCount(1);
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
      await answerLanguage(page, locale).selectOption("mixed");
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
      await expect(answerLanguage(page, nextLocale)).toHaveValue("mixed");
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
      // Completed exchanges (each answer is one article).
      const evidence = page.locator('article[id^="exchange-"]');
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
        // No bottom bar inside a unit on phones (WP03-T26): the composer
        // docks at the bottom edge.
        expect(rect!.y + rect!.height).toBeLessThanOrEqual(height!);
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
        expect(rect!.y + rect!.height).toBeLessThanOrEqual(height!);
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
      // No tip before an answer exists (IX-21).
      await expect(
        page.getByRole("complementary", {
          name: pick(locale, "Citation help", "مساعدة الاستشهادات"),
        }),
      ).toHaveCount(0);
      await answerLanguage(page, locale).selectOption("mixed");
      await send(page, "supported", locale);
      // The first-visit tip sits under the first cited answer.
      await expect(
        page.locator("#exchange-1").getByRole("complementary", {
          name: pick(locale, "Citation help", "مساعدة الاستشهادات"),
        }),
      ).toContainText(
        pick(
          locale,
          "Select a citation to read its source passage.",
          "اختر الاستشهاد لقراءة نص المصدر.",
        ),
      );
      await page
        .getByRole("button", {
          name: pick(locale, "Got it", "فهمت"),
          exact: true,
        })
        .click();
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
      await expect(answerLanguage(page, locale)).toHaveValue("mixed");
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
          name: pick(locale, "Profile", "الملف الشخصي"),
          exact: true,
        }),
      ).toBeFocused();
      await navigate(page, unit + "/chat", locale);
      await expect(
        page.getByRole("complementary", {
          name: pick(locale, "Citation help", "مساعدة الاستشهادات"),
        }),
      ).toHaveCount(0);
      await openUnitMenu(page);
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
      await openUnitMenu(page);
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
      const interfaceGroup = () =>
        page.getByRole("group", {
          name: pick(locale, "Interface language", "لغة الواجهة"),
          exact: true,
        });
      const scopeLabel = () =>
        page.getByText(pick(locale, "Interface language", "لغة الواجهة"), {
          exact: true,
        });
      const sessions = unitMenuSummary(page);
      const languages = answerLanguage(page, locale);
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
      await languages.selectOption("mixed");
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
      await expect(answerLanguage(page, alternate)).toHaveValue("mixed");
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
      await page.keyboard.press("Escape");
      await openLibraryFromChat(page, locale);
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
      const sessions = page.locator(
        'summary:has-text("' +
          pick(locale, "Sessions and privacy", "الجلسات والخصوصية") +
          '")',
      );
      const meta = page.locator("p[class*='composerMeta']");
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
      // The sharing label shows only when an answer's mode differs from the
      // current setting (MD-10).
      const label = page
        .locator("article")
        .getByText(pick(locale, "Private", "خاص"), { exact: true });
      await expect(label).toHaveCount(0);
      await sessions.press("Enter");
      await page
        .getByRole("link", {
          name: pick(locale, "Privacy settings", "إعدادات الخصوصية"),
          exact: true,
        })
        .click();
      await page
        .getByRole("radio", {
          name: pick(
            locale,
            "Visible to UniMind’s founders",
            "ظاهرة لمؤسسي UniMind",
          ),
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
      await expect(label).toBeVisible();
      finish();
    },
  );
});
