import {
  formatCollectionDate,
  syntheticDemoTime,
  type Locale,
} from "./app-fixtures";
import { readFileSync } from "node:fs";
import { expectAxe, expectReflow, themes, applyTheme } from "./layout";
import { expect, type Page } from "./test";

export const b09Campaign = "/batch-leader/campaigns/sample-campaign";
const text = (locale: string) => (en: string, ar: string) =>
  locale === "ar" ? ar : en;

type SuppliedFile =
  "synthetic-handout.pdf" | "synthetic-recording.wav" | "synthetic-diagram.png";
const suppliedTypes: Record<SuppliedFile, string> = {
  "synthetic-handout.pdf": "application/pdf",
  "synthetic-recording.wav": "audio/wav",
  "synthetic-diagram.png": "image/png",
};

/** Drops supplied synthetic files onto the intake's drop zone. */
export async function dropSuppliedFiles(
  page: Page,
  locale: string,
  names: readonly SuppliedFile[],
) {
  const files = names.map((name) => ({
    name,
    type: suppliedTypes[name],
    bytes: readFileSync(`public/demo-files/${name}`).toString("base64"),
  }));
  await page
    .getByText(
      text(locale)(
        "Drop files here, or choose them from your device.",
        "ضع الملفات هنا، أو اخترها من جهازك.",
      ),
      { exact: true },
    )
    .evaluate((element, supplied) => {
      const transfer = new DataTransfer();
      for (const file of supplied)
        transfer.items.add(
          new File(
            [Uint8Array.from(atob(file.bytes), (c) => c.charCodeAt(0))],
            file.name,
            { type: file.type },
          ),
        );
      for (const type of ["dragover", "drop"])
        element.parentElement!.dispatchEvent(
          new DragEvent(type, {
            bubbles: true,
            cancelable: true,
            dataTransfer: transfer,
          }),
        );
    }, files);
}

export type FinalizedRequest = {
  item: string;
  key: string;
  uploadId: string;
};

/**
 * Records each finalize request's item, per-file request key and upload ID
 * (the synthetic upload ID embeds the key it was registered with), plus every
 * UUID the page generates. Call before the first navigation.
 */
export async function recordFinalizedRequests(page: Page) {
  await page.addInitScript(() => {
    const finalized: unknown[] = [];
    const generated: string[] = [];
    Object.assign(window, {
      unimindFinalized: finalized,
      unimindGenerated: generated,
    });
    type Uuid = `${string}-${string}-${string}-${string}-${string}`;
    const uuid = crypto.randomUUID.bind(crypto) as () => Uuid;
    crypto.randomUUID = () => {
      const value = uuid();
      generated.push(value);
      return value;
    };
    const original = FormData.prototype.set as (
      this: FormData,
      name: string,
      value: string | Blob,
    ) => void;
    FormData.prototype.set = function (name, value) {
      original.call(this, name, value);
      if (name === "declaredRights")
        finalized.push({
          item: String(this.get("requestedItemId")),
          key: String(this.get("clientIdempotencyKey")),
          uploadId: String(this.get("uploadId")),
        });
    };
  });
}

export async function finalizedRequests(page: Page) {
  return page.evaluate(
    () =>
      (window as unknown as { unimindFinalized: FinalizedRequest[] })
        .unimindFinalized,
  );
}

export async function generatedIds(page: Page) {
  return page.evaluate(
    () =>
      (window as unknown as { unimindGenerated: string[] }).unimindGenerated,
  );
}
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
/**
 * Request-first intake with three receipts and an exact latest return.
 * `layout: false` skips the inline enlarged-text reflow and axe sweep for
 * suites whose layout matrix already covers the receipts screen.
 */
export async function b09ReceiptJourney(
  page: Page,
  locale: Locale,
  { layout = true }: { layout?: boolean } = {},
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
  if (layout)
    for (const theme of themes) {
      await applyTheme(page, theme);
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
        await expectReflow(page);
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "";
        });
      }
      await expectAxe(page, { include: "main" });
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
