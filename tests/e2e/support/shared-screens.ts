import { expect, type Page } from "@playwright/test";

/**
 * Screen-level assertions shared by the synthetic demo suite and the real
 * database suite (WP03-T17). Both modes render the same student screens;
 * only data and availability differ, so each check takes the mode and
 * asserts the same structure plus the mode's availability.
 */
export type ScreenMode = "synthetic" | "real";
type Locale = "en" | "ar";

const say = (locale: Locale, en: string, ar: string) =>
  locale === "ar" ? ar : en;

/** Sample-only copy that must never render on a real route. */
const sampleContent =
  /Sample materials|Lecture 6 handout|Practical 3 recording|fixed examples|Fixed examples|sample questions|مواد تجريبية|ملزمة المحاضرة 6|تسجيل العملي 3|أمثلة ثابتة|أسئلة تجريبية/u;

async function expectNoSampleContent(page: Page) {
  await expect(page.getByText(sampleContent)).toHaveCount(0);
}

/** Subject header, unit details and the four study tools. */
export async function expectStudyFrame(
  page: Page,
  locale: Locale,
  unitTitle: string,
) {
  await expect(
    page.getByRole("heading", { level: 1, name: unitTitle }),
  ).toBeVisible();
  const tools = page.getByRole("navigation", {
    name: say(locale, "Workspace navigation", "تنقل مساحة المذاكرة"),
  });
  for (const [en, ar] of [
    ["Materials", "مصادر المذاكرة"],
    ["Chat", "المحادثة"],
    ["Studio", "الاستوديو"],
    ["Quiz", "الاختبار"],
  ] as const)
    await expect(
      tools.getByRole("link", { name: say(locale, en, ar), exact: true }),
    ).toBeVisible();
}

/** The unit landing view: materials heading, freshness and the library. */
export async function expectMaterialsScreen(
  page: Page,
  locale: Locale,
  mode: ScreenMode,
) {
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: say(locale, "Materials", "مصادر المذاكرة"),
    }),
  ).toBeVisible();
  const listUnavailable = page.getByText(
    say(
      locale,
      "The material list is not available yet.",
      "قائمة المصادر غير متاحة بعد.",
    ),
  );
  if (mode === "real") {
    await expect(listUnavailable).toBeVisible();
    await expectNoSampleContent(page);
  } else await expect(listUnavailable).toHaveCount(0);
}

/** Chat: sessions menu, study options and the composer. */
export async function expectChatScreen(
  page: Page,
  locale: Locale,
  mode: ScreenMode,
) {
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: say(locale, "Chat", "المحادثة"),
    }),
  ).toBeVisible();
  await expect(
    page.locator(
      `summary[aria-label="${say(locale, "Sessions and privacy", "الجلسات والخصوصية")}"]`,
    ),
  ).toBeVisible();
  const message = page.getByRole("textbox", {
    name: say(locale, "Message", "السؤال"),
  });
  await expect(message).toBeVisible();
  await expect(
    page.getByRole("button", { name: say(locale, "Send", "إرسال") }),
  ).toBeDisabled();
  const unavailable = page.getByText(
    say(locale, "Answers are not available yet", "الإجابات غير متاحة بعد"),
    { exact: true },
  );
  if (mode === "real") {
    await expect(message).toBeDisabled();
    await expect(unavailable).toBeVisible();
    await expectNoSampleContent(page);
  } else {
    await expect(message).toBeEnabled();
    await expect(unavailable).toHaveCount(0);
  }
}

/** Studio: the result controls and the artifact area. */
export async function expectStudioScreen(
  page: Page,
  locale: Locale,
  mode: ScreenMode,
) {
  await expect(
    page.getByRole("heading", {
      name: say(locale, "Shape the result", "شكّل المخرج"),
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: say(locale, "Your artifact", "مخرجك الدراسي"),
    }),
  ).toBeVisible();
  const type = page.getByRole("combobox", {
    name: say(locale, "Artifact type", "نوع المخرج"),
  });
  const generate = page.getByRole("button", {
    name: say(locale, "Generate", "إنشاء"),
  });
  const unavailable = page.getByText(
    say(locale, "Studio is not available yet.", "الاستوديو غير متاح بعد."),
    { exact: false },
  );
  if (mode === "real") {
    await expect(type).toBeDisabled();
    await expect(generate).toBeDisabled();
    await expect(unavailable).toBeVisible();
    await expectNoSampleContent(page);
  } else {
    await expect(type).toBeEnabled();
    await expect(unavailable).toHaveCount(0);
  }
}

/** Quiz setup: timing, count, difficulty and the start action. */
export async function expectQuizSetupScreen(
  page: Page,
  locale: Locale,
  mode: ScreenMode,
) {
  await expect(
    page.getByRole("heading", {
      name: say(locale, "Set up your quiz", "إعداد الاختبار"),
    }),
  ).toBeVisible();
  const start = page.getByRole("button", {
    name: say(locale, "Start quiz", "بدء الاختبار"),
  });
  const count = page.getByRole("spinbutton", {
    name: say(locale, "Number of questions", "عدد الأسئلة"),
  });
  const unavailable = page.getByText(
    say(locale, "Quiz is not available yet.", "الاختبار غير متاح بعد."),
    { exact: false },
  );
  if (mode === "real") {
    await expect(start).toBeDisabled();
    await expect(count).toBeDisabled();
    await expect(unavailable).toBeVisible();
    await expectNoSampleContent(page);
  } else {
    await expect(start).toBeEnabled();
    await expect(count).toBeEnabled();
    await expect(unavailable).toHaveCount(0);
  }
}

/** Student Settings: the five account views and privacy availability. */
export async function expectStudentSettingsScreen(
  page: Page,
  locale: Locale,
  mode: ScreenMode,
) {
  const tabs = page.getByRole("tablist", {
    name: say(locale, "Account sections", "أقسام الحساب"),
  });
  for (const [en, ar] of [
    ["Profile", "الملف الشخصي"],
    ["Appearance", "المظهر"],
    ["Academic settings", "الإعدادات الدراسية"],
    ["Privacy", "الخصوصية"],
    ["Identity and access", "الهوية والوصول"],
  ] as const)
    await expect(
      tabs.getByRole("tab", { name: say(locale, en, ar), exact: true }),
    ).toBeVisible();
  await tabs
    .getByRole("tab", { name: say(locale, "Privacy", "الخصوصية") })
    .click();
  const shared = page.getByRole("radio", {
    name: say(locale, "Visible to UniMind’s founders", "ظاهرة لمؤسسي UniMind"),
  });
  await expect(shared).toBeVisible();
  if (mode === "real") await expect(shared).toBeDisabled();
  else await expect(shared).toBeEnabled();
}

/** Opens the Chat "Sessions and privacy" menu if it is closed. */
export async function openChatSessions(page: Page, locale: Locale) {
  const summary = page.locator(
    `summary[aria-label="${say(locale, "Sessions and privacy", "الجلسات والخصوصية")}"]`,
  );
  await summary.waitFor();
  if ((await summary.locator("..").getAttribute("open")) === null)
    await summary.click();
}
