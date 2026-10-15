import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";
import { formatCollectionDate } from "../../src/lib/i18n/collection-format";
import { syntheticDemoTime } from "../../src/lib/demo/synthetic-clock.application";

export const b09Campaign = "/batch-leader/campaigns/sample-campaign";
type Locale = "en" | "ar";
const text = (locale: string) => (en: string, ar: string) =>
  locale === "ar" ? ar : en;
export async function openB09Upload(page: Page, locale: string) {
  await page
    .getByRole("button", {
      name: text(locale)("Upload files", "رفع الملفات"),
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: text(locale)("Choose files", "اختيار ملفات"),
      exact: true,
    }),
  ).toBeFocused();
}
export async function ensureB09Intake(page: Page, locale: string) {
  if (
    !(await page
      .getByRole("button", {
        name: text(locale)("Choose files", "اختيار ملفات"),
        exact: true,
      })
      .isVisible())
  )
    await openB09Upload(page, locale);
}
export async function b09ReceiptJourney(
  page: Page,
  locale: Locale,
  info: TestInfo,
) {
  const t = text(locale);
  await expect(
    page.getByRole("heading", {
      name: t("Source intake", "استلام المصادر"),
      exact: true,
    }),
  ).toBeVisible();
  const cutoff = formatCollectionDate(
    locale,
    syntheticDemoTime.assignmentExpiresAt,
  );
  await expect(
    page.locator("p[class*='personalDeadline']").first(),
  ).toContainText(cutoff);
  await expect(
    page.getByRole("link", {
      name: t("Open requests", "فتح الطلبات"),
      exact: true,
    }),
  ).toHaveCount(1);
  await page
    .getByRole("link", { name: t("Open requests", "فتح الطلبات"), exact: true })
    .click();
  await expect(page).toHaveTitle(
    new RegExp(t("Source intake", "استلام المصادر"), "u"),
  );
  await expect(
    page.locator("aside[aria-labelledby='intake-deadline'] strong"),
  ).toContainText(cutoff);
  await expect(page.locator("[data-request-id]")).toHaveCount(3);
  await expect(
    page.getByRole("button", {
      name: t("Choose files", "اختيار ملفات"),
      exact: true,
    }),
  ).toBeHidden();
  await expect(page.locator("[data-record-request]")).toHaveCount(5);
  await expect(page.locator("[data-record-request] input")).toHaveCount(0);
  await openB09Upload(page, locale);
  const chooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", {
      name: t("Choose files", "اختيار ملفات"),
      exact: true,
    })
    .click();
  const selection = await chooser;
  expect(selection.isMultiple()).toBe(true);
  await selection.setFiles([
    "public/demo-files/synthetic-handout.pdf",
    "public/demo-files/synthetic-recording.wav",
    "public/demo-files/synthetic-diagram.png",
  ]);
  const queue = page.getByRole("list", {
    name: t("Upload queue", "قائمة الرفع"),
    exact: true,
  });
  await expect(
    queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
  ).toHaveCount(3);
  // The approved synthetic service accepts this supplied title only.
  const titles = [
    "Synthetic study source",
    "Synthetic study source",
    "Synthetic study source",
  ];
  for (const [index, row] of (
    await queue.getByRole("listitem").all()
  ).entries())
    await row
      .getByLabel(t("Source title", "عنوان المصدر"), { exact: true })
      .fill(titles[index]!);
  const description =
    "Synthetic teacher prepared these complete Anatomy revision sources.";
  await page
    .getByLabel(t("Professor or source description", "وصف الأستاذ أو المصدر"))
    .fill(description);
  await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
  await page
    .locator(`a[href='/batch-leader?view=history&lang=${locale}']`)
    .filter({ visible: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", {
      name: t("Latest submissions", "آخر الإرسالات"),
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("[data-record-request]")).toHaveCount(5);
  await page
    .locator(`a[href='/batch-leader?lang=${locale}']`)
    .filter({ visible: true })
    .first()
    .click();
  await page
    .getByRole("link", { name: t("Open requests", "فتح الطلبات"), exact: true })
    .click();
  await expect(queue.getByRole("listitem")).toHaveCount(3);
  await expect(
    page.getByLabel(
      t("Professor or source description", "وصف الأستاذ أو المصدر"),
    ),
  ).toHaveValue(description);
  await expect(
    page.getByLabel(t("I have permission", "لدي صلاحية")),
  ).toBeChecked();
  await page
    .getByRole("button", {
      name: t("Submit files", "إرسال الملفات"),
      exact: true,
    })
    .press("Enter");
  await expect(page.locator("[data-request-id]")).toHaveCount(0);
  await expect(queue).toBeHidden();
  await expect(page.locator("[data-record-request]")).toHaveCount(8);
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: t("Received files", "الملفات المستلمة") }),
  ).toContainText(locale === "ar" ? "٣" : "3");
  await expect(
    page.locator("#collection-record-sample-item-1 summary"),
  ).toBeFocused();
  for (let index = 0; index < 3; index++) {
    const record = page.locator(
      `[data-record-request='sample-item-${index + 1}']`,
    );
    const details = record.locator("details");
    if (
      !(await details.evaluate(
        (element) => (element as HTMLDetailsElement).open,
      ))
    )
      await record.locator("summary").click();
    await expect(record.locator("dl")).toContainText(titles[index]!);
    await expect(record.locator("dl")).toContainText(description);
    await expect(record.locator("dl")).toContainText(t("Your device", "جهازك"));
    await expect(record.locator("dl")).toContainText(
      t(
        "Declared when this file was submitted.",
        "أُقرّ به عند إرسال هذا الملف.",
      ),
    );
    await expect(record).toContainText(
      t("does not make it available to students", "ولا يعني هذا إتاحته للطلاب"),
    );
    await expect(record.locator("input, textarea, select")).toHaveCount(0);
  }
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "";
      });
    }
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  const last = page.locator("[data-record-request='sample-item-3']");
  const href = await last
    .getByRole("link", { name: t("Open request", "فتح الطلب"), exact: true })
    .getAttribute("href");
  expect(href).toMatch(/inspect=sample-item-3&record=[^&]+&lang=/u);
  expect(href).not.toMatch(/[?&](request|submission|upload)=/u);
  await last
    .getByRole("link", { name: t("Open request", "فتح الطلب"), exact: true })
    .press("Enter");
  await expect(page).toHaveURL(
    new RegExp("inspect=sample-item-3&record=", "u"),
  );
  await expect(
    page.locator("#collection-record-sample-item-3 summary"),
  ).toBeFocused();
  await expect(queue).toBeHidden();
  await page.screenshot({
    path: info.outputPath(`b09-${locale}-receipts.png`),
    fullPage: true,
  });
  await page
    .locator(`a[href='/batch-leader?view=history&lang=${locale}']`)
    .filter({ visible: true })
    .first()
    .click();
  await expect(
    page.getByText(
      t(
        "Latest submission per request in this view. Earlier versions are not listed here.",
        "آخر إرسال لكل طلب في هذا العرض. لا تظهر الإصدارات السابقة هنا.",
      ),
      { exact: true },
    ),
  ).toBeVisible();
  const latest = page.locator("[data-record-request='sample-item-3']");
  await expect(
    latest.getByRole("link", {
      name: t("Open request", "فتح الطلب"),
      exact: true,
    }),
  ).toHaveAttribute("href", href!);
}

export async function b09NamedUploadJourney(page: Page, locale: Locale) {
  const t = text(locale);
  const request = (id: string) => page.locator(`[data-request-id='${id}']`);
  await request("sample-item-1")
    .getByRole("button", { name: t("Upload file", "رفع ملف"), exact: true })
    .click();
  await expect(page).toHaveURL(/upload=sample-item-1/u);
  await expect(page.locator("input[type=file]")).not.toHaveAttribute(
    "multiple",
  );
  await page
    .locator("input[type=file]")
    .setInputFiles("public/demo-files/synthetic-recording.wav");
  const queue = page.getByRole("list", {
    name: t("Upload queue", "قائمة الرفع"),
    exact: true,
  });
  await expect(queue).toContainText(
    t("does not match the named request", "لا يطابق الطلب المحدد"),
  );
  await expect(
    queue.getByLabel(t("Source title", "عنوان المصدر"), { exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", {
      name: t("Submit files", "إرسال الملفات"),
      exact: true,
    }),
  ).toBeDisabled();
  await queue
    .getByRole("button", {
      name: t("Remove file", "حذف الملف") + ": synthetic-recording.wav",
      exact: true,
    })
    .click();
  await page
    .locator("input[type=file]")
    .setInputFiles("public/demo-files/synthetic-handout.pdf");
  await expect(
    queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
  ).toHaveCount(1);
  await expect(page).not.toHaveURL(/upload=/u);
  const first = queue.getByRole("listitem").first();
  await expect(first).toContainText(t("Anatomy handout", "ملزمة التشريح"));
  await request("sample-item-2")
    .getByRole("button", { name: t("Upload file", "رفع ملف"), exact: true })
    .click();
  await page
    .locator("input[type=file]")
    .setInputFiles("public/demo-files/synthetic-recording.wav");
  await expect(
    queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
  ).toHaveCount(2);
  await expect(first).toContainText(t("Anatomy handout", "ملزمة التشريح"));
  await expect(queue.getByRole("listitem").last()).toContainText(
    t("Anatomy recording", "تسجيل تشريح"),
  );
  await page
    .locator(`a[href='/batch-leader?view=history&lang=${locale}']`)
    .filter({ visible: true })
    .first()
    .click();
  await page
    .locator(`a[href='/batch-leader?lang=${locale}']`)
    .filter({ visible: true })
    .first()
    .click();
  await page
    .getByRole("link", { name: t("Open requests", "فتح الطلبات"), exact: true })
    .click();
  await expect(queue.getByRole("listitem")).toHaveCount(2);
  await expect(first).toContainText(t("Anatomy handout", "ملزمة التشريح"));
  await expect(queue.getByRole("listitem").last()).toContainText(
    t("Anatomy recording", "تسجيل تشريح"),
  );
  await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
  await page
    .getByRole("button", {
      name: t("Submit files", "إرسال الملفات"),
      exact: true,
    })
    .click();
  const elsewhere = page.locator("#collection-record-sample-history-0 summary");
  await elsewhere.press("Enter");
  await expect(page.locator("[data-request-id]")).toHaveCount(1);
  await expect(
    page.locator("[data-record-request='sample-item-1']"),
  ).toHaveCount(1);
  await expect(
    page.locator("[data-record-request='sample-item-2']"),
  ).toHaveCount(1);
  await expect(queue).toBeHidden();
  await expect(elsewhere).toBeFocused();
}

export async function b09NewerIntentJourney(page: Page, locale: Locale) {
  const t = text(locale);
  await page.evaluate(() => {
    const original = File.prototype.arrayBuffer;
    const pending: { release?: () => void; allowed: boolean } = {
      allowed: false,
    };
    Object.assign(window, { b09PendingInspection: pending });
    File.prototype.arrayBuffer = async function () {
      if (this.name === "synthetic-handout.pdf" && !pending.allowed)
        await new Promise<void>((resolve) => {
          pending.release = resolve;
        });
      return original.call(this);
    };
  });
  await page
    .locator("[data-request-id='sample-item-1']")
    .getByRole("button", { name: t("Upload file", "رفع ملف"), exact: true })
    .click();
  await page
    .locator("input[type=file]")
    .setInputFiles("public/demo-files/synthetic-handout.pdf");
  await expect(
    page.getByText(t("Checking file…", "جارٍ فحص الملف…"), { exact: true }),
  ).toBeVisible();
  await page
    .locator("[data-request-id='sample-item-2']")
    .getByRole("button", { name: t("Upload file", "رفع ملف"), exact: true })
    .click();
  const changed = locale === "en" ? "ar" : "en";
  await expect(page).toHaveURL(/upload=sample-item-2/u);
  await page
    .getByRole("button", {
      name: changed === "ar" ? "العربية" : "English",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/upload=sample-item-2/u);
  await expect(page).toHaveURL(new RegExp(`lang=${changed}`, "u"));
  await page.evaluate(() => {
    const pending = (
      window as unknown as {
        b09PendingInspection: { allowed: boolean; release?: () => void };
      }
    ).b09PendingInspection;
    pending.allowed = true;
    pending.release?.();
  });
  const after = text(changed);
  const row = page
    .getByRole("list", {
      name: after("Upload queue", "قائمة الرفع"),
      exact: true,
    })
    .getByRole("listitem");
  await expect(
    row.getByText(after("Ready to upload", "جاهز للرفع"), { exact: true }),
  ).toBeVisible();
  await expect(row).toContainText(after("Anatomy handout", "ملزمة التشريح"));
  await expect(page).toHaveURL(/upload=sample-item-2/u);
  await expect(page).toHaveURL(new RegExp(`lang=${changed}`, "u"));
  await expect(
    page.locator("[data-record-request^='sample-item-']"),
  ).toHaveCount(0);
}
