// Product-demo navigation and fixture helpers shared by the area specs.
import {
  actionFixtures,
  getAdminCopy,
  reviewCatalogRows,
  type Locale,
} from "./app-fixtures";
import { ensureB09Intake } from "./collection-b09";
import { pick } from "./copy";
import { continueAs, navigate } from "./session";
import { expect, type Page } from "./test";

export const unit =
  "/learn/zagazig-university-human-medicine-year-1-term-1-cohort/zagazig-university-human-medicine-y1-t1-anatomy";
export const campaign = "/batch-leader/campaigns/sample-campaign";

/** Another unit in the same cohort as `unit`. */
export const sameCohortUnit = () =>
  reviewCatalogRows.find(
    (row) =>
      row.cohort.id === unit.split("/")[2] &&
      `/learn/${row.cohort.id}/${row.unit.id}` !== unit,
  )!;

// Older return/guard journeys may use either configured course type. New B07-B
// journeys assert the exact program label; these retain locale-specific names.
export const b07ChooseName = (locale: string) =>
  locale === "ar"
    ? /^(اختر (وحدة|مادة)|تصفح كل المواد)$/u
    : /^(Choose a (module|subject)|Browse all subjects)$/u;
export const b07SwitchName = (locale: string) =>
  locale === "ar" ? /^تغيير (وحدة|مادة)$/u : /^Switch (module|subject)$/u;
export const b07UnitsName = (locale: string) =>
  locale === "ar"
    ? /^(وحدات|مواد) مجموعتك$/u
    : /^(Modules|Subjects) in your cohort$/u;

/**
 * The unit band's one menu (WP03-T26): Chat's sessions and privacy, the unit
 * details and switch, and on phones the interface language. Its summary is the
 * session pill on desktop and the title button on phones.
 */
export const unitMenuSummary = (page: Page) =>
  page.locator('summary[class*="unitSummary"]');
export async function openUnitMenu(page: Page) {
  const summary = unitMenuSummary(page);
  if ((await summary.getAttribute("aria-expanded")) !== "true")
    await summary.click();
  await expect(summary).toHaveAttribute("aria-expanded", "true");
}
export async function closeUnitMenu(page: Page) {
  const summary = unitMenuSummary(page);
  if ((await summary.getAttribute("aria-expanded")) === "true") {
    await summary.press("Escape");
    await expect(summary).toHaveAttribute("aria-expanded", "false");
  }
}
/** The answer-language menu inside the Chat composer. */
export const answerLanguage = (page: Page, locale: string) =>
  page.getByRole("combobox", {
    name: locale === "ar" ? "لغة الإجابة" : "Answer language",
    exact: true,
  });
/**
 * Chat's way to the material library: a cited answer's source sheet links to
 * it (the separate "Module sources" link left with WP03-T26, MD-09).
 */
export async function openLibraryFromChat(page: Page, locale: Locale) {
  await page
    .locator("article[id^='exchange-'] button[class*='citation']")
    .last()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("link", {
      name: pick(locale, "Browse material library", "تصفح مكتبة المصادر"),
      exact: true,
    })
    .click();
}
/** A Chat answer's evidence details: its citation, then the sheet's link. */
export async function openEvidenceFromChat(
  page: Page,
  locale: Locale,
  exchange?: number,
) {
  await page
    .locator(exchange ? `#exchange-${exchange}` : "article[id^='exchange-']")
    .locator("button[class*='citation']")
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("link", {
      name: pick(locale, "Open evidence details", "فتح تفاصيل الأدلة"),
      exact: true,
    })
    .click();
}
/** Studio's way to the library: Supporting passages, then the library link. */
export async function openLibraryFromStudio(page: Page, locale: Locale) {
  await page
    .getByRole("button", {
      name: pick(locale, "Supporting passages", "النصوص الداعمة"),
      exact: true,
    })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("link", {
      name: pick(locale, "Browse material library", "تصفح مكتبة المصادر"),
      exact: true,
    })
    .click();
}

export const b07People = [
  ["student", "Samir Hassan", "Student", "طالب"],
  ["leader", "Mona Ali", "Batch Leader", "مسؤول الدفعة"],
  ["admin", "Ahmed (sample)", "Admin", "مسؤول"],
  ["second-admin", "Ziad (sample)", "Second Admin", "المسؤول الثاني"],
] as const;

export const b07Paths = [
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

export function b07Row(program: string, level: string) {
  return reviewCatalogRows.find(
    (row) =>
      row.program.id === program &&
      row.level.id === level &&
      (row.term.id.endsWith("term-1") ||
        program === "synthetic-credit-program"),
  )!;
}

/** Saves an academic path from the Settings academic tab. */
export async function b07SavePath(
  page: Page,
  locale: Locale,
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

/** The default first-run academic path: Zagazig human medicine, year 1 term 1. */
export const humanMedicinePath = [
  "university",
  "zagazig-university",
  "human-medicine",
  "human-medicine-year-1",
  "human-medicine-year-1-term-1",
] as const;

/** Completes first-run academic setup and, optionally, opens the Shelf. */
export async function completeAcademicSetup(
  page: Page,
  locale: Locale,
  { openShelf = true }: { openShelf?: boolean } = {},
) {
  for (const value of humanMedicinePath) {
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
  if (openShelf)
    await page
      .getByRole("button", {
        name: pick(locale, "Open Study Shelf", "فتح رف المذاكرة"),
        exact: true,
      })
      .click();
}

export const b05Actions = [
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

export async function b05Select(page: Page, index: number, locale: Locale) {
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
          "^" + getAdminCopy(locale).verbs[b05Actions[index]!] + " ",
        ),
      })
      .click();
  await expect(page.locator("#decision-detail-heading")).toBeFocused();
}

export function b05Confirm(locale: Locale, index: number, second = false) {
  const copy = getAdminCopy(locale);
  return `${second ? copy.confirmSecond : actionFixtures[index]!.protected ? copy.confirmProtected : copy.confirmAction}: ${copy.actions[b05Actions[index]!]}`;
}

export async function openPreparedCampaign(
  page: Page,
  path: string,
  locale: Locale,
) {
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

export async function openPreparedHistory(page: Page, locale: Locale) {
  await page
    .locator(`a[href="/batch-leader?view=history&lang=${locale}"]`)
    .filter({ visible: true })
    .first()
    .click();
}

export async function selectStudioExample(
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
  await expandStudioSettings(page, locale);
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

/** On phones an existing aid folds Studio's settings into one line. */
export async function expandStudioSettings(page: Page, locale: Locale) {
  const toggle = page.locator("button[aria-controls='studio-settings']");
  if (
    (await toggle.isVisible()) &&
    (await toggle.getAttribute("aria-expanded")) === "false"
  )
    await toggle.click();
  await expect(
    page.getByRole("heading", {
      name: pick(locale, "Shape the result", "شكّل المخرج"),
      exact: true,
    }),
  ).toBeVisible();
}

export async function generateStudioExample(page: Page, locale: Locale) {
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
  return page.locator("section[class*='artifactOutput']");
}

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

/** Reviews and records one governed admin example (English labels). */
export async function changeAdmin(page: Page, id: string, second = false) {
  const index = actionFixtures.findIndex((action) => action.id === id);
  const definition = actionFixtures[index]!;
  // Queue rows lead with the short verb; confirmations keep the full label.
  await page
    .getByRole("button", {
      name: new RegExp(`^${getAdminCopy("en").verbs[b05Actions[index]!]} `),
    })
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
    .getByRole("button", { name: "Review and record", exact: true })
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

/** Signs out of Admin from Account (as the real admin does). */
export async function signOutFromAdmin(page: Page, locale: Locale = "en") {
  await adminNavigate(page, "/settings", locale);
  await showAccountView(page, "identity");
  await page
    .getByRole("button", {
      name: pick(locale, "Sign out", "تسجيل الخروج"),
      exact: true,
    })
    .first()
    .click();
}

/** Signs out of Admin and continues as another synthetic admin. */
export async function switchAdmin(page: Page, email: string) {
  await signOutFromAdmin(page);
  await continueAs(page, email);
  await expect(page).toHaveURL(/\/admin\?/u);
}

/** Follows a visible Admin navigation link, opening the phone menu if needed. */
export async function adminNavigate(
  page: Page,
  destination: string,
  locale: Locale,
) {
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

export async function showAccountView(
  page: Page,
  view: "profile" | "appearance" | "academic" | "privacy" | "identity",
) {
  const labels = {
    profile: /^(Profile|الملف الشخصي)$/u,
    appearance: /^(Appearance|المظهر)$/u,
    academic: /^(Academic settings|الإعدادات الدراسية)$/u,
    privacy: /^(Privacy|الخصوصية)$/u,
    identity: /^(Identity and access|الهوية والوصول)$/u,
  };
  await page.getByRole("tab", { name: labels[view] }).click();
}

/** Chooses a saved appearance preference on the Settings appearance tab. */
export async function chooseTheme(page: Page, value: string) {
  await showAccountView(page, "appearance");
  await page
    .getByRole("group", { name: /^(Theme|السمة)$/u })
    .locator(`input[value="${value}"]`)
    .check();
}

/** The approved Manrope / Noto Sans Arabic faces are loaded and applied. */
export async function expectOriginalTypography(page: Page, locale: Locale) {
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
