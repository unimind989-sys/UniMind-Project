import { type Locale } from "../support/app-fixtures";
import { bilingual, pick } from "../support/copy";
import {
  answerLanguage,
  expectOriginalTypography,
  generateStudioExample,
  openLibraryFromChat,
  openLibraryFromStudio,
  selectStudioExample,
  unit,
  unitMenuSummary,
} from "../support/demo";
import { boxOf } from "../support/layout";
import {
  type ScreenState,
  type ScreenGroup,
  matrixTests,
  dismissCitationHelp,
  expectLanguageControl,
  expectAlignedHeader,
  expectShellControls,
} from "../support/layout-matrix";
import { navigate, openSessionTools, send } from "../support/session";
import { expect, test, type Page } from "../support/test";

// Layout matrix for the student study tools: Chat, Studio, Quiz, the report
// form and dense study history (harness in `support/layout-matrix.ts`).

// ---------------------------------------------------------------- student chat
const chatStates: readonly ScreenState[] = [
  {
    name: "empty Chat aligns its tools, sessions menu and sharing note",
    enter: dismissCitationHelp,
    widths: [1440, 820, 390, 320],
    height: 1000,
    phoneAxe: true,
    check: async ({ page, locale, width, enlarged }) => {
      const t = bilingual(locale);
      const narrow = width < 768;
      // audit 03: the language scope is named by its group, not a visible label.
      await expect(
        page.getByText(t("Interface language", "لغة الواجهة"), { exact: true }),
      ).toHaveCount(0);
      // WP03-T26: the session switcher is the band's menu (the title button on
      // phones), and the answer language is a menu in the composer.
      const sessions = page.locator(
        `summary:has-text("${t("Sessions and privacy", "الجلسات والخصوصية")}")`,
      );
      await expect(sessions).toHaveCount(1);
      expect(
        await sessions.evaluate((e) => Boolean(e.closest("[class*='band']"))),
      ).toBe(true);
      if (enlarged) {
        await sessions.press("Enter");
        await expect(
          page.getByRole("button", {
            name: t("New session", "جلسة جديدة"),
            exact: true,
          }),
        ).toBeVisible();
        // With 200% text at 320px the panel still fits the viewport.
        const panel = await boxOf(page.locator("[class*='menuPanel']"));
        expect(panel.x).toBeGreaterThanOrEqual(0);
        expect(panel.x + panel.width).toBeLessThanOrEqual(width + 1);
        await sessions.press("Escape");
        return;
      }
      // WCAG 2.5.3: the name contains the visible text of the control: the
      // session line, and on phones the unit title too.
      const visible = await sessions.evaluate((element) =>
        [...element.querySelectorAll("bdi")]
          .filter((part) => part.checkVisibility())
          .map((part) => part.textContent!.trim()),
      );
      expect(visible.length).toBeGreaterThan(0);
      for (const part of visible)
        await expect(sessions).toHaveAccessibleName(
          new RegExp(part.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"),
        );
      await expect(sessions).toHaveAccessibleName(
        new RegExp(t("Sessions and privacy", "الجلسات والخصوصية"), "u"),
      );
      if (narrow) expect(visible[0]).toBe(t("Anatomy", "علم التشريح"));
      const language = answerLanguage(page, locale);
      const send = page.getByRole("button", {
        name: t("Send", "إرسال"),
        exact: true,
      });
      const pill = await boxOf(language);
      const action = await boxOf(send);
      // One composer row: the language pill and Send share its centre line.
      expect(
        Math.abs(pill.y + pill.height / 2 - action.y - action.height / 2),
      ).toBeLessThan(2);
      expect(pill.height).toBeGreaterThanOrEqual(44);
      expect(action.height).toBeGreaterThanOrEqual(44);
      // Send is an icon on phones; its name stays "Send".
      if (narrow) expect(action.width).toBeLessThanOrEqual(48);
      // audit 10: the visually hidden heading and the Sessions target.
      const heading = page.getByRole("heading", {
        name: t("Chat", "المحادثة"),
        level: 2,
        exact: true,
      });
      await expect(heading).toHaveCount(1);
      const box = await boxOf(heading);
      // The subject band names the current tool; the heading stays for
      // assistive technology at every width (Direction B).
      expect(box.width).toBe(1);
      expect(box.height).toBe(1);
      // audit 05: Sessions control, its menu and the sharing note.
      const style = await sessions.evaluate((e) => ({
        height: e.getBoundingClientRect().height,
        filled: getComputedStyle(e).backgroundColor !== "rgba(0, 0, 0, 0)",
        size: parseFloat(getComputedStyle(e).fontSize),
      }));
      expect(style.height).toBeGreaterThanOrEqual(44);
      // A --night-2 pill on desktop; the title button on phones (DESIGN).
      if (!narrow) expect(style.filled).toBe(true);
      expect(style.size).toBeGreaterThanOrEqual(13);
      const note = await page
        .locator("p[class*='composerMeta'] strong")
        .evaluate((e) => ({
          weight: Number(getComputedStyle(e).fontWeight),
          size: parseFloat(getComputedStyle(e).fontSize),
          color: getComputedStyle(e).color,
          mainColor: getComputedStyle(e.closest("main")!).color,
        }));
      expect(note.weight).toBeGreaterThanOrEqual(600);
      expect(note.size).toBeGreaterThanOrEqual(13);
      expect(note.color).toBe(note.mainColor);
      await sessions.press("Enter");
      await expect(sessions).toHaveAttribute("aria-expanded", "true");
      const menu = await boxOf(page.locator("[class*='menuPanel']"));
      const control = await sessions.boundingBox();
      expect(menu.y).toBeGreaterThanOrEqual(control!.y + control!.height);
      expect(menu.x).toBeGreaterThanOrEqual(0);
      expect(menu.x + menu.width).toBeLessThanOrEqual(width + 1);
      // The interface language is in this menu on phones, in the bar above.
      await expect(
        page.getByRole("group", {
          name: t("Interface language", "لغة الواجهة"),
          exact: true,
        }),
      ).toBeVisible();
      await sessions.press("Escape");
      await expect(sessions).toBeFocused();
      await expect(sessions).toHaveAttribute("aria-expanded", "false");
      await expectOriginalTypography(page, locale);
      // Workspace revision: the conversation uses the available width.
      const conversation = page.getByRole("region", {
        name: t("Conversation", "المحادثة الحالية"),
      });
      expect(
        await conversation
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
        const main = await boxOf(page.getByRole("main"));
        const region = await boxOf(conversation);
        expect(region.width).toBeGreaterThan(main.width - 110);
        expect(region.height).toBeGreaterThan(125);
        // The conversation absorbs any overflow: the study body around it
        // never scrolls too, not even by the Arabic privacy line's few px.
        await page.evaluate(() => document.fonts.ready);
        expect(
          await page
            .locator("[data-study-tool='chat']")
            .evaluate((body) => body.scrollHeight - body.clientHeight),
        ).toBeLessThanOrEqual(1);
      }
    },
    checkEnlarged: true,
  },
  {
    name: "Chat with three cited replies keeps 44px controls in one reading scroll",
    enter: async (page, locale) => {
      for (let n = 0; n < 3; n++) await send(page, "supported", locale);
    },
    widths: [1440, 768, 430, 390, 360, 320],
    height: 844,
    phoneAxe: true,
    check: async ({ page, enlarged, width }) => {
      await expectShellControls(page, "student");
      // Phones have no bottom bar inside a unit: only the four tools.
      if (!enlarged)
        await expect(
          page.getByRole("navigation").getByRole("link"),
        ).toHaveCount(width >= 768 ? 7 : 4);
    },
    checkEnlarged: true,
    axe: [{}, { include: "main" }],
  },
  {
    name: "a conflicting reply keeps its clarification question reachable",
    enter: async (page, locale) => {
      await send(page, "conflict", locale);
      await page
        .locator("article")
        .last()
        .locator("summary")
        .filter({
          hasText: pick(
            locale,
            "Question to ask about this conflict",
            "سؤال للاستفسار عن هذا التعارض",
          ),
        })
        .press("Enter");
    },
    check: async ({ page, locale }) => {
      const conflict = page.locator("article").last();
      const summary = conflict.locator("summary").filter({
        hasText: pick(
          locale,
          "Question to ask about this conflict",
          "سؤال للاستفسار عن هذا التعارض",
        ),
      });
      expect((await boxOf(summary)).height).toBeGreaterThanOrEqual(44);
      await expect(
        conflict.getByRole("textbox", {
          name: pick(locale, "Clarification question", "سؤال التوضيح"),
          exact: true,
        }),
      ).toBeVisible();
    },
    axe: [{ include: "main" }],
  },
  {
    name: "sources opened from Chat keep a compact return context",
    enter: async (page, locale) => {
      await openLibraryFromChat(page, locale);
    },
    widths: [1440, 820, 390, 320],
    height: 1000,
    check: async ({ page, locale, width }) => {
      const sourceContext = page.locator("[class*='sourceContext']");
      await expect(
        sourceContext.getByRole("link", {
          name: pick(locale, "Return to Chat", "العودة للمحادثة"),
          exact: true,
        }),
      ).toBeVisible();
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
        };
      });
      expect(geometry.target).toBeGreaterThanOrEqual(44);
      expect(geometry.margin).toBe("0px");
      expect(geometry.size).toBe("14px");
      if (width >= 820) expect(geometry.aligned).toBeLessThan(1);
      if (width === 390) expect(geometry.height).toBeLessThan(110);
      await expect(page.locator("article")).toHaveCount(8);
      await expectLanguageControl(page, locale);
      await expectAlignedHeader(page, width);
      await expectOriginalTypography(page, locale);
    },
    leave: async (page, locale) => {
      await page
        .locator("[class*='sourceContext']")
        .getByRole("link", {
          name: pick(locale, "Return to Chat", "العودة للمحادثة"),
          exact: true,
        })
        .click();
    },
  },
];

// ---------------------------------------------------------- Studio and Quiz
const flashcardFlip = (page: Page, locale: Locale) =>
  page.getByRole("button", {
    name: new RegExp(
      pick(locale, "^Show (answer|question)$", "^إظهار (الإجابة|السؤال)$"),
    ),
    exact: true,
  });

/** No paragraph of the generated aid is clipped or truncated. */
async function expectUnclippedArtifact(page: Page) {
  expect(
    await page
      .locator("section[class*='artifactOutput'] > div[lang]")
      .getByRole("paragraph")
      .evaluateAll((paragraphs) =>
        paragraphs.every(
          (element) =>
            element.scrollWidth <= element.clientWidth + 1 &&
            getComputedStyle(element).textOverflow !== "ellipsis",
        ),
      ),
  ).toBe(true);
}

const studioStates: readonly ScreenState[] = [
  {
    name: "empty Studio keeps its form hierarchy and an emphasized options disclosure",
    enter: (page, locale) => navigate(page, `${unit}/studio`, locale),
    widths: [1440, 820, 390, 320],
    height: 1000,
    phoneAxe: true,
    check: async ({ page, locale, enlarged }) => {
      const disclosure = page.locator(
        "details[class*='secondaryOptions'] summary",
      );
      if (enlarged) {
        // The secondary options stay discoverable at 200% text.
        await disclosure.press("Enter");
        await expect(page.locator("#artifact-depth")).toBeVisible();
        await disclosure.press("Space");
        return;
      }
      const hierarchy = await page
        .locator("div[class*='studioLayout']")
        .evaluate((e) => ({
          form: parseFloat(
            getComputedStyle(e.querySelector("form > h2")!).fontSize,
          ),
          empty: parseFloat(
            getComputedStyle(e.querySelector("div[class*='artifactEmpty'] h3")!)
              .fontSize,
          ),
        }));
      expect(hierarchy.form).toBeGreaterThan(hierarchy.empty);
      await expect(
        page.getByRole("button", {
          name: pick(locale, "Generate", "إنشاء"),
          exact: true,
        }),
      ).toBeEnabled();
      const emphasis = await disclosure.evaluate((element) => ({
        height: element.getBoundingClientRect().height,
        weight: Number(getComputedStyle(element).fontWeight),
        color: getComputedStyle(element).color,
        parentColor: getComputedStyle(element.closest("main")!).color,
      }));
      expect(emphasis.height).toBeGreaterThanOrEqual(44);
      expect(emphasis.weight).toBeGreaterThanOrEqual(600);
      expect(emphasis.color).toBe(emphasis.parentColor);
      await expectOriginalTypography(page, locale);
    },
    checkEnlarged: true,
  },
  {
    name: "the MCQ choice keeps one 44px setup link at enlarged text",
    enter: async (page) => {
      await page.locator("#artifact-type").selectOption("quiz");
    },
    height: 1000,
    check: async ({ page, locale }) => {
      const setup = page.getByRole("link", {
        name: pick(locale, "Set up MCQ quiz", "إعداد اختبار اختيار من متعدد"),
        exact: true,
      });
      await expect(setup).toBeVisible();
      expect((await boxOf(setup)).height).toBeGreaterThanOrEqual(44);
    },
    checkEnlarged: true,
    axe: [{ include: "main" }],
  },
  {
    name: "an extended mixed summary keeps every paragraph unclipped",
    enter: async (page, locale) => {
      // MCQ hides the generation options; choose an aid type first.
      await page.locator("#artifact-type").selectOption("summary");
      await selectStudioExample(page, locale, {
        type: "summary",
        topic: "comparison",
        depth: "detailed",
        size: "extended",
        language: "mixed",
      });
      await generateStudioExample(page, locale);
    },
    widths: [1440, 768, 390, 320],
    height: 1000,
    check: async ({ page }) => expectUnclippedArtifact(page),
    checkEnlarged: true,
    axe: [{ include: "main", tags: "all" }],
  },
  {
    name: "a supporting-passages dialog stays closable and accessible",
    enter: async (page, locale) => {
      await page
        .getByRole("button", {
          name: pick(locale, "Supporting passages", "النصوص الداعمة"),
          exact: true,
        })
        .press("Enter");
      await expect(page.getByRole("dialog")).toBeVisible();
    },
    height: 1000,
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("dialog").getByRole("button", {
          name: pick(locale, "Close", "إغلاق"),
          exact: true,
        }),
      ).toBeVisible();
    },
    axe: [{ include: "dialog[open]" }],
    leave: async (page) => {
      await page.getByRole("dialog").press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
    },
  },
  {
    name: "flashcards keep a 44px keyboard flip and unclipped faces",
    enter: async (page, locale) => {
      await selectStudioExample(page, locale, {
        type: "flashcards",
        topic: "comparison",
        depth: "detailed",
        size: "extended",
        language: "mixed",
      });
      await generateStudioExample(page, locale);
    },
    widths: [1440, 768, 430, 390, 360, 320],
    phoneAxe: true,
    check: async ({ page, locale, enlarged, width }) => {
      const flip = flashcardFlip(page, locale);
      expect((await boxOf(flip)).height).toBeGreaterThanOrEqual(44);
      await flip.press("Enter");
      await expect(flip).toBeFocused();
      await expectUnclippedArtifact(page);
      await flip.press("Enter");
      await expectUnclippedArtifact(page);
      await expectShellControls(page, "student");
      if (!enlarged)
        await expect(
          page.getByRole("navigation").getByRole("link"),
        ).toHaveCount(width >= 768 ? 7 : 4);
    },
    checkEnlarged: true,
  },
  {
    name: "sources opened from Studio keep compact rows and 44px excerpts",
    enter: async (page, locale) => {
      await openLibraryFromStudio(page, locale);
    },
    widths: [1440, 820, 390, 320],
    check: async ({ page, locale, width }) => {
      const rows = page.locator("article");
      await expect(rows).toHaveCount(8);
      const first = rows.first();
      expect(
        (await boxOf(first.locator("summary"))).height,
      ).toBeGreaterThanOrEqual(44);
      if (width === 1440) {
        const firstTitle = await boxOf(first.locator("h3"));
        const secondTitle = await boxOf(rows.nth(1).locator("h3"));
        expect(secondTitle.y - firstTitle.y).toBeLessThan(160);
        // Availability is labelled only when it is the exception (MD-19).
        await expect(first.locator(":scope > span")).toHaveCount(0);
      }
      await expectOriginalTypography(page, locale);
    },
    leave: async (page, locale) => {
      await page
        .getByRole("link", {
          name: pick(locale, "Return to Studio", "العودة للاستوديو"),
          exact: true,
        })
        .click();
    },
  },
  {
    name: "quiz setup keeps one aligned path with equivalent labels and count help",
    enter: (page, locale) => navigate(page, `${unit}/quiz`, locale),
    widths: [1440, 820, 390, 320],
    height: 1000,
    check: async ({ page, locale }) => {
      const configuration = page.locator("div[class*='quizConfiguration']");
      const start = page.getByRole("button", {
        name: pick(locale, "Start quiz", "بدء الاختبار"),
        exact: true,
      });
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
          };
        });
        expect(layout.width).toBeLessThanOrEqual(512);
        expect(Math.abs(layout.center - layout.panelCenter)).toBeLessThan(2);
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
        // Start shares the fields' inline start edge (Direction B left-aligns forms).
        const action = await boxOf(start);
        const field = layout.fields[0]!;
        const rtl = await page.evaluate(
          () => document.documentElement.dir === "rtl",
        );
        expect(
          Math.abs(
            rtl
              ? action.x + action.width - (field.x + field.width)
              : action.x - field.x,
          ),
        ).toBeLessThan(2);
      }
      await page
        .getByRole("radio", {
          name: pick(locale, "Untimed", "دون توقيت"),
          exact: true,
        })
        .check();
      const count = page.getByRole("spinbutton", {
        name: pick(locale, "Number of questions", "عدد الأسئلة"),
        exact: true,
      });
      const bounds = await boxOf(count);
      const hint = await boxOf(page.locator("#quiz-question-count-help"));
      expect(hint.y).toBeGreaterThanOrEqual(bounds.y + bounds.height);
      expect(hint.y - bounds.y - bounds.height).toBeLessThan(10);
      await expectOriginalTypography(page, locale);
    },
  },
  {
    name: "a partial attempt keeps its answers, timer and Submit reachable",
    enter: async (page, locale) => {
      await page
        .getByRole("spinbutton", {
          name: pick(locale, "Number of questions", "عدد الأسئلة"),
          exact: true,
        })
        .fill("6");
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
        .fill("30");
      await page
        .getByRole("button", {
          name: pick(locale, "Start quiz", "بدء الاختبار"),
          exact: true,
        })
        .click();
      await page.locator('input[name="sample-question-0"]').first().check();
    },
    widths: [1440, 390, 320],
    height: 844,
    phoneAxe: true,
    check: async ({ page }) => {
      await expect(page.getByRole("timer")).toBeVisible();
    },
    axe: [{ include: "main" }],
  },
  {
    name: "the material library opened from a quiz keeps its return",
    enter: async (page, locale) => {
      await page
        .getByRole("link", {
          name: pick(locale, "Browse material library", "تصفح مكتبة المصادر"),
          exact: true,
        })
        .click();
    },
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("link", {
          name: pick(
            locale,
            "Return to quiz attempt",
            "العودة إلى محاولة الاختبار",
          ),
          exact: true,
        }),
      ).toBeVisible();
    },
    axe: [{ include: "main" }],
  },
  {
    name: "a submitted review names each correction without editable answers",
    enter: async (page, locale) => {
      await page
        .getByRole("link", {
          name: pick(
            locale,
            "Return to quiz attempt",
            "العودة إلى محاولة الاختبار",
          ),
          exact: true,
        })
        .click();
      for (let index = 0; index < 6; index++)
        await page
          .locator(`input[name="sample-question-${index}"]`)
          .first()
          .check();
      await page
        .getByRole("button", {
          name: pick(locale, "Submit answers", "تسليم الإجابات"),
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(/\/review\?attempt=/u);
    },
    phoneAxe: true,
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Quiz review", "مراجعة الاختبار"),
          exact: true,
        }),
      ).toBeVisible();
    },
    axe: [{ include: "main" }],
  },
  {
    name: "the report form for a selected exchange stays usable",
    enter: async (page, locale) => {
      await navigate(page, `${unit}/chat`, locale);
      await page
        .getByRole("link", {
          name: pick(locale, "Report example", "الإبلاغ عن المثال"),
          exact: true,
        })
        .first()
        .click();
      await page.getByRole("checkbox").check();
    },
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("button", {
          name: pick(locale, "Submit report", "إرسال البلاغ"),
          exact: true,
        }),
      ).toBeEnabled();
    },
    axe: [{ include: "main" }],
  },
];

// Expired attempts need the controlled clock, so they get their own document.
const expiredReviewStates: readonly ScreenState[] = [
  {
    name: "an expired attempt shows an unscored review",
    enter: async (page, locale) => {
      await page.clock.install({ time: new Date("2026-10-13T12:00:00Z") });
      await page
        .getByLabel(pick(locale, "Number of questions", "عدد الأسئلة"), {
          exact: true,
        })
        .fill("6");
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
        .fill("1");
      await page
        .getByRole("button", {
          name: pick(locale, "Start quiz", "بدء الاختبار"),
          exact: true,
        })
        .click();
      for (const index of [0, 1])
        await page
          .locator(`input[name="sample-question-${index}"]`)
          .first()
          .check();
      await page.clock.fastForward(61_000);
    },
    check: async ({ page, locale }) => {
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Expired quiz review", "مراجعة الاختبار المنتهي"),
          exact: true,
        }),
      ).toBeVisible();
    },
    axe: [{ include: "main" }],
  },
];

// -------------------------------------------------------- dense study history
const denseStates: readonly ScreenState[] = [
  {
    name: "a dense session list keeps full-width unclipped 44px entries",
    enter: (page, locale) => openSessionTools(page, locale),
    widths: [1440, 768, 390, 320],
    height: 1000,
    check: async ({ page }) => {
      const entries = page.locator('[class*="historyList"] li button');
      await expect(entries).toHaveCount(12);
      for (const entry of await entries.all())
        expect((await boxOf(entry)).height).toBeGreaterThanOrEqual(44);
      const last = entries.last();
      expect(
        await last.evaluate(
          (element) =>
            element.getBoundingClientRect().width /
            element.closest("details")!.parentElement!.clientWidth,
        ),
      ).toBeGreaterThan(0.85);
      expect(
        await last.evaluate((element) => ({
          clipped:
            element.scrollWidth > element.clientWidth + 1 ||
            element.scrollHeight > element.clientHeight + 1,
          ellipsis: getComputedStyle(element).textOverflow === "ellipsis",
        })),
      ).toEqual({ clipped: false, ellipsis: false });
    },
    checkEnlarged: true,
    axe: [{ include: "main", tags: "all" }],
    leave: async (page, locale) => {
      await page
        .locator(
          `summary:has-text("${pick(locale, "Sessions and privacy", "الجلسات والخصوصية")}")`,
        )
        .press("Escape");
    },
  },
  {
    name: "long dense source titles wrap without clipping",
    enter: async (page, locale) => {
      // The Materials tool shows the same library (MD-09).
      await expect(unitMenuSummary(page)).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await navigate(page, unit, locale);
      await expect(page.getByRole("article")).toHaveCount(24);
    },
    widths: [1440, 768, 390, 320],
    height: 1000,
    check: async ({ page }) => {
      const title = page.getByRole("heading", { level: 3 }).last();
      await title.scrollIntoViewIfNeeded();
      expect(
        await title.evaluate((element) => ({
          clipped:
            element.scrollWidth > element.clientWidth + 1 ||
            (element.scrollHeight > element.clientHeight + 1 &&
              getComputedStyle(element).overflowY !== "visible"),
          ellipsis: getComputedStyle(element).textOverflow === "ellipsis",
        })),
      ).toEqual({ clipped: false, ellipsis: false });
    },
    checkEnlarged: true,
    axe: [{ include: "main", tags: "all" }],
  },
  {
    name: "a dense unit library keeps 44px excerpt summaries",
    enter: (page, locale) => navigate(page, unit, locale),
    check: async ({ page }) => {
      expect(
        (
          await boxOf(
            page.locator("article[class*='sourceRow'] summary").first(),
          )
        ).height,
      ).toBeGreaterThanOrEqual(44);
    },
    axe: [{ include: "main" }],
  },
];

const groups: readonly ScreenGroup[] = [
  {
    title: "Chat, Studio, Quiz and report states",
    tags: [
      "@B06",
      "@B08-A",
      "@B08-B",
      "@B08-C",
      "@B08-D",
      "@B01",
      "@M67",
      "@B02",
      "@M15",
      "@M64",
      "@audit-03",
      "@audit-04",
      "@audit-05",
      "@audit-10",
      "@workspace-revision",
    ],
    role: "student",
    path: `${unit}/chat`,
    states: [...chatStates, ...studioStates],
  },
  {
    title: "expired quiz review",
    tags: ["@B03", "@M27"],
    role: "student",
    path: `${unit}/quiz`,
    states: expiredReviewStates,
  },
  {
    title: "dense study history and long titles",
    tags: ["@B01", "@M53", "@B07-C", "@B08-C"],
    role: "student",
    path: `${unit}/chat?fixture=dense`,
    states: denseStates,
  },
];

for (const { title, details, body } of matrixTests(groups))
  test(title, details, body);
