import nodePath from "node:path";
import {
  b09Campaign,
  b09NamedUploadJourney,
  b09ReceiptJourney,
  dropSuppliedFiles,
  ensureB09Intake,
  finalizedRequests,
  generatedIds,
  openB09Upload,
  recordFinalizedRequests,
} from "../support/collection-b09";
import { bilingual, inLocales, pick } from "../support/copy";
import {
  campaign,
  openPreparedCampaign,
  openPreparedHistory,
} from "../support/demo";
import { layoutWidths } from "../support/layout";
import { isolation, navigate, signIn } from "../support/session";
import { expect, test } from "../support/test";
inLocales(["en"], (locale) => {
  test(
    `request-first intake records three receipts and returns to the exact latest request`,
    { tag: ["@B09", `@${locale}`] },
    async ({ page }) => {
      test.setTimeout(150_000);
      const finish = isolation(page);
      await signIn(page, "leader", locale, "/batch-leader");
      // The receipts screen's reflow and axe sweep runs in the layout matrix.
      await b09ReceiptJourney(page, locale, { layout: false });
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `named uploads reject a wrong format and retain two request bindings`,
    { tag: ["@B09", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "leader", locale, b09Campaign);
      await b09NamedUploadJourney(page, locale);
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `a stale retained correction receipt cannot omit its intent and finalize`,
    { tag: ["@B04", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await page.addInitScript(() => {
        const original = FormData.prototype.set as (
          this: FormData,
          name: string,
          value: string | Blob,
        ) => void;
        let blockedKey = "";
        Object.assign(window, {
          b04ReleaseCorrection: false,
          b04OmitCorrection: false,
        });
        FormData.prototype.set = function (name, value) {
          const flags = window as unknown as {
            b04ReleaseCorrection: boolean;
            b04OmitCorrection: boolean;
          };
          if (
            (name === "replacesSubmissionId" || name === "correctionAction") &&
            flags.b04OmitCorrection
          )
            return;
          if (name === "declaredRights") {
            const key = String(this.get("clientIdempotencyKey"));
            if (!blockedKey) blockedKey = key;
            if (key === blockedKey && !flags.b04ReleaseCorrection)
              return original.call(this, name, "UNKNOWN");
          }
          return original.call(this, name, value);
        };
      });
      await signIn(page, "leader", locale, `${campaign}?fixture=corrections`);
      await page
        .getByRole("link", {
          name: t("Fix information", "تصحيح المعلومات"),
          exact: true,
        })
        .press("Enter");
      await expect(page).toHaveURL(/request=sample-item-1&submission=-201/u);
      // The campaign request's `#collection-intake` link lands on the intake.
      await expect(page.locator("#collection-intake")).toBeInViewport();
      await expect(
        page.getByLabel(
          t("Professor or source description", "وصف الأستاذ أو المصدر"),
        ),
      ).toBeFocused();
      await page
        .locator('input[type="file"]')
        .setInputFiles("public/demo-files/synthetic-handout.pdf");
      const queue = page.getByRole("list", {
        name: t("Upload queue", "قائمة الرفع"),
        exact: true,
      });
      await expect(
        queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toHaveCount(1);
      await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(
        queue.getByRole("button", {
          name: t("Retry submission", "إعادة محاولة الإرسال"),
          exact: true,
        }),
      ).toBeVisible();
      await openPreparedHistory(page, locale);
      await navigate(page, "/settings", locale);
      await openPreparedCampaign(page, campaign, locale);
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: t("Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .click();
      await expect(queue.getByRole("listitem")).toHaveCount(2);
      await expect(
        queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toHaveCount(1);
      await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(1);
      await page.evaluate(() => {
        Object.assign(window, {
          b04ReleaseCorrection: true,
          b04OmitCorrection: true,
        });
      });
      await queue
        .getByRole("button", {
          name: t("Retry submission", "إعادة محاولة الإرسال"),
          exact: true,
        })
        .click();
      await expect(queue).toContainText(
        t("no longer matches", "لم يعد هذا التصحيح"),
      );
      await expect(
        queue.getByRole("button", {
          name: t("Retry submission", "إعادة محاولة الإرسال"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        }),
      ).toBeDisabled();
      await openPreparedHistory(page, locale);
      await expect(
        page.getByText("Synthetic study source", { exact: true }),
      ).toHaveCount(1);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `three-file detours, interruption, receipt retry and truthful replacement`,
    { tag: ["@B04", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await page.addInitScript(() => {
        const keys: string[] = [];
        Object.assign(window, { b04Keys: keys });
        const firstUploads: {
          files: string[];
          predecessors: string[];
          capture: boolean;
        } = {
          files: [],
          predecessors: [],
          capture: true,
        };
        Object.assign(window, { b09FirstUploads: firstUploads });
        new MutationObserver(() => {
          if (!firstUploads.capture) return;
          for (const row of document.querySelectorAll(
            '[data-state="UPLOADING"], [data-state="FINALIZING"]',
          )) {
            const file = row.querySelector("strong")?.textContent ?? "";
            if (file && !firstUploads.files.includes(file))
              firstUploads.files.push(file);
            const predecessor = row.getAttribute("data-predecessor-id");
            if (predecessor) firstUploads.predecessors.push(predecessor);
          }
        }).observe(document, {
          childList: true,
          subtree: true,
          attributes: true,
        });
        const original = FormData.prototype.set as (
          this: FormData,
          name: string,
          value: string | Blob,
        ) => void;
        let rejectOnce = true;
        FormData.prototype.set = function (name, value) {
          if (name === "clientIdempotencyKey" && typeof value === "string")
            keys.push(value);
          if (name === "declaredRights" && rejectOnce) {
            rejectOnce = false;
            return original.call(this, name, "UNKNOWN");
          }
          return original.call(this, name, value);
        };
      });
      await signIn(page, "leader", locale, campaign);
      await page
        .locator('input[type="file"]')
        .setInputFiles([
          "public/demo-files/synthetic-handout.pdf",
          "public/demo-files/synthetic-recording.wav",
          "public/demo-files/synthetic-diagram.png",
        ]);
      const queue = page.getByRole("list", {
        name: t("Upload queue", "قائمة الرفع"),
        exact: true,
      });
      const rows = queue.getByRole("listitem");
      await expect(
        queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toHaveCount(3);
      const description = page.getByLabel(
        t("Professor or source description", "وصف الأستاذ أو المصدر"),
      );
      await description.fill(
        "Synthetic retained context for all three supplied files.",
      );
      await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
      await openPreparedHistory(page, locale);
      await navigate(page, "/settings", locale);
      await openPreparedCampaign(page, campaign, locale);
      await expect(rows).toHaveCount(3);
      await expect(description).toHaveValue(
        "Synthetic retained context for all three supplied files.",
      );
      await expect(
        page.getByLabel(t("I have permission", "لدي صلاحية")),
      ).toBeChecked();
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(queue.getByRole("progressbar")).toBeVisible();
      await openPreparedHistory(page, locale);
      await navigate(page, "/settings", locale);
      await openPreparedCampaign(page, campaign, locale);
      await expect(rows).toHaveCount(3);
      await queue
        .getByRole("button", {
          name: t("Retry upload", "إعادة محاولة الرفع"),
          exact: true,
        })
        .click();
      await expect(
        queue.getByRole("button", {
          name: t("Retry submission", "إعادة محاولة الإرسال"),
          exact: true,
        }),
      ).toBeVisible();
      await openPreparedHistory(page, locale);
      await navigate(page, "/settings", locale);
      await openPreparedCampaign(page, campaign, locale);
      await expect(rows).toHaveCount(3);
      await page.evaluate(() => {
        const observed = { uploads: 0 };
        Object.assign(window, { b04ReceiptRetry: observed });
        new MutationObserver((records) => {
          for (const record of records)
            for (const node of record.addedNodes)
              if (
                node instanceof Element &&
                (node.matches("progress") || node.querySelector("progress"))
              )
                observed.uploads++;
        }).observe(document.body, { childList: true, subtree: true });
      });
      await queue
        .getByRole("button", {
          name: t("Retry submission", "إعادة محاولة الإرسال"),
          exact: true,
        })
        .press("Enter");
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(1);
      expect(
        await page.evaluate(
          () =>
            (window as unknown as { b04ReceiptRetry: { uploads: number } })
              .b04ReceiptRetry.uploads,
        ),
      ).toBe(0);
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(3);
      await expect(
        queue.getByText(t("Replacement candidate", "نسخة بديلة"), {
          exact: false,
        }),
      ).toHaveCount(0);
      await expect(rows).toHaveCount(0);
      await expect(page.locator("[data-request-id]")).toHaveCount(0);
      const requests = page.locator('[data-record-request^="sample-item-"]');
      await expect(requests).toHaveCount(3);
      const firstUploads = await page.evaluate(() => {
        const observed = (
          window as unknown as {
            b09FirstUploads: {
              files: string[];
              predecessors: string[];
              capture: boolean;
            };
          }
        ).b09FirstUploads;
        observed.capture = false;
        return { files: observed.files, predecessors: observed.predecessors };
      });
      expect(firstUploads.files.sort()).toEqual([
        "synthetic-diagram.png",
        "synthetic-handout.pdf",
        "synthetic-recording.wav",
      ]);
      expect(firstUploads.predecessors).toEqual([]);
      for (const size of ["100%", "200%"]) {
        await page.evaluate((value) => {
          document.documentElement.style.fontSize = value;
        }, size);
        for (const request of await requests.all()) {
          await expect(request.locator("summary [data-status]")).toBeVisible();
          await expect(request.locator("summary [data-status]")).toHaveText(
            t("Received", "تم الاستلام"),
          );
        }
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "";
      });
      const keys = await page.evaluate(
        () => (window as unknown as { b04Keys: string[] }).b04Keys,
      );
      expect(new Set(keys).size).toBe(3);
      expect(keys[0]).toBe(keys[1]);
      await openB09Upload(page, locale);
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: t("Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .click();
      const replacement = rows.last();
      await expect(
        replacement.getByText(t("Ready to upload", "جاهز للرفع"), {
          exact: true,
        }),
      ).toBeVisible();
      await expect(replacement).toContainText(
        t("Earlier submission", "الإرسال السابق"),
      );

      await expect(
        page.getByLabel(t("I have permission", "لدي صلاحية")),
      ).not.toBeChecked();
      await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(replacement).toHaveAttribute("data-predecessor-id", "1");
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(3);
      await expect(rows).toHaveCount(0);
      await expect(
        page.getByRole("status").filter({
          hasText: t(
            "needs a fresh campaign view",
            "يحتاج إلى تحديث عرض الحملة",
          ),
        }),
      ).toHaveCount(0);
      expect(
        new Set(
          await page.evaluate(
            () => (window as unknown as { b04Keys: string[] }).b04Keys,
          ),
        ).size,
      ).toBe(4);
      await openPreparedHistory(page, locale);
      await expect(
        page.getByText("Synthetic study source", { exact: true }),
      ).toHaveCount(3);
      await navigate(page, "/settings", locale);
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
        .click();
      await expect(page).toHaveURL(/\/login\?/u);
      await page
        .getByLabel(t("Email address", "البريد الإلكتروني"), { exact: true })
        .fill("leader@example.invalid");
      await page
        .getByLabel(t("Password", "كلمة المرور"), { exact: true })
        .fill("Synthetic-study-2026!");
      await page
        .getByRole("button", { name: t("Continue", "متابعة"), exact: true })
        .click();
      await expect(page).toHaveURL(/\/consent\?/u);
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
      await openPreparedCampaign(page, campaign, locale);
      await expect(queue).toHaveCount(0);
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `permanent upload categories show remedies and cannot retry individually or in bulk`,
    { tag: ["@B04", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      const remedies = [
        ["checksum", t("integrity check", "فحص السلامة")],
        ["duplicate", t("already recorded", "مسجل بالفعل")],
        ["oversize", t("smaller supported file", "ملفًا مدعومًا أصغر")],
        ["rights", t("permitted to share", "يُسمح لك بمشاركته")],
      ];
      for (const [fixture, remedy] of remedies) {
        await signIn(page, "leader", locale, `${campaign}?fixture=${fixture}`);
        await ensureB09Intake(page, locale);
        await page
          .getByRole("button", {
            name: t("Add approved reference", "إضافة المرجع المعتمد"),
            exact: true,
          })
          .click();
        await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
        await page
          .getByRole("button", {
            name: t("Submit files", "إرسال الملفات"),
            exact: true,
          })
          .click();
        const queue = page.getByRole("list", {
          name: t("Upload queue", "قائمة الرفع"),
          exact: true,
        });
        await expect(queue).toContainText(remedy!);
        await expect(
          queue.getByRole("button", {
            name: t("Retry upload", "إعادة محاولة الرفع"),
            exact: true,
          }),
        ).toHaveCount(0);
        await expect(
          page.getByRole("button", {
            name: t("Submit files", "إرسال الملفات"),
            exact: true,
          }),
        ).toBeDisabled();
        await expect(queue.getByRole("textbox")).toBeDisabled();
        await expect(
          queue.getByRole("button", {
            name: t("Remove file", "حذف الملف") + ": synthetic-handout.pdf",
            exact: true,
          }),
        ).toBeVisible();
        if (fixture === "duplicate") {
          await queue
            .getByRole("link", {
              name: t("View recorded submission", "عرض الإرسال المسجل"),
              exact: true,
            })
            .press("Enter");
          await expect(page).toHaveURL(/#latest-submissions$/u);
          await expect(
            page.getByText("Recorded synthetic handout", { exact: true }),
          ).toBeVisible();
        }
      }
      await signIn(page, "leader", locale, `${campaign}?fixture=offline`);
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: t("Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .click();
      await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("button", {
          name: t("Retry upload", "إعادة محاولة الرفع"),
          exact: true,
        }),
      ).toBeVisible();
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `named corrections bind the request, reason and previous submission`,
    { tag: ["@B04", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "leader", locale, `${campaign}?fixture=corrections`);
      await expect(
        page.getByRole("link", {
          name: t("Fix information", "تصحيح المعلومات"),
          exact: true,
        }),
      ).toBeVisible();
      const requests = page.locator("[data-request-id]");
      await expect(requests).toHaveCount(3);
      await expect(
        page.locator('[data-request-id="sample-item-1"]'),
      ).toContainText(t("Needs information", "يحتاج إلى معلومات"));
      await expect(
        page.locator('[data-request-id="sample-item-2"]'),
      ).toContainText(t("Needs a replacement", "يحتاج إلى استبدال"));
      await expect(
        page.locator('[data-request-id="sample-item-3"]'),
      ).toContainText(t("Awaiting file", "بانتظار ملف"));
      // Each request's action stays visible at every width: layout matrix.
      await openPreparedHistory(page, locale);
      await expect(
        page.getByText("Earlier synthetic handout", { exact: true }),
      ).toBeVisible();
      const fix = page.getByRole("link", {
        name: t("Fix information", "تصحيح المعلومات"),
        exact: true,
      });
      await expect(fix).toHaveAttribute(
        "href",
        `${campaign}?request=sample-item-1&submission=-201&lang=${locale}#collection-intake`,
      );
      await fix.press("Enter");
      // A `#collection-intake` link from leader home lands on the intake.
      await expect(page.locator("#collection-intake")).toBeInViewport();
      await expect(
        page.getByLabel(
          t("Professor or source description", "وصف الأستاذ أو المصدر"),
        ),
      ).toBeFocused();
      await page
        .getByLabel(
          t("Professor or source description", "وصف الأستاذ أو المصدر"),
        )
        .fill(
          "Synthetic instructor prepared the complete Anatomy handout for revision.",
        );
      await page
        .locator('input[type="file"]')
        .setInputFiles("public/demo-files/synthetic-handout.pdf");
      const queue = page.getByRole("list", {
        name: t("Upload queue", "قائمة الرفع"),
        exact: true,
      });
      await expect(
        queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toBeVisible();
      await expect(page).toHaveURL(
        new RegExp(`${campaign}\\?lang=${locale}#collection-intake$`, "u"),
      );
      await expect(queue).toContainText(
        t("Earlier submission", "الإرسال السابق"),
      );
      await expect(
        page.getByLabel(t("I have permission", "لدي صلاحية")),
      ).not.toBeChecked();

      await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(queue.getByRole("listitem").first()).toHaveAttribute(
        "data-predecessor-id",
        "-201",
      );
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(1);

      await openPreparedHistory(page, locale);
      await expect(
        page.getByRole("link", {
          name: t("Fix information", "تصحيح المعلومات"),
          exact: true,
        }),
      ).toHaveCount(0);
      const replace = page.getByRole("link", {
        name: t("Replace file", "استبدال الملف"),
        exact: true,
      });
      await expect(replace).toHaveAttribute(
        "href",
        `${campaign}?request=sample-item-2&submission=-202&lang=${locale}#collection-intake`,
      );
      await replace.press("Enter");
      await expect(page.locator("#collection-intake")).toBeInViewport();
      await expect(
        page.getByRole("button", {
          name: t("Choose files", "اختيار ملفات"),
          exact: true,
        }),
      ).toBeFocused();
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: t("Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .click();
      await expect(queue).toContainText(
        t("no longer matches", "لم يعد هذا التصحيح"),
      );
      await expect(
        page.getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        }),
      ).toBeDisabled();
      await expect(page).toHaveURL(/request=sample-item-2&submission=-202/u);
      await queue
        .getByRole("button", {
          name: t("Remove file", "حذف الملف") + ": synthetic-handout.pdf",
          exact: true,
        })
        .click();
      await page
        .locator('input[type="file"]')
        .setInputFiles("public/demo-files/synthetic-recording.wav");
      await expect(
        queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toHaveCount(1);

      await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(queue.getByRole("listitem").last()).toHaveAttribute(
        "data-predecessor-id",
        "-202",
      );
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(2);

      await openPreparedHistory(page, locale);
      await expect(
        page.getByRole("link", {
          name: t("Replace file", "استبدال الملف"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(
        page.getByText("Synthetic study source", { exact: true }),
      ).toHaveCount(2);
      await expect(page.getByRole("main")).not.toContainText(
        t("Contact your campaign administrator", "تواصل مع مسؤول الحملة"),
      );
      for (const query of [
        "request=sample-item-1&submission=-201",
        "request=sample-history-1&submission=history-1",
        "request=other&submission=-202",
        "request=sample-item-2&request=sample-item-1&submission=-202",
      ]) {
        await openPreparedCampaign(page, campaign, locale);
        await page.evaluate(
          (href) => window.history.pushState(null, "", href),
          `${campaign}?${query}&lang=${locale}`,
        );
        await expect(
          page.getByRole("heading", {
            name: t("Correction unavailable", "التصحيح غير متاح"),
            exact: true,
          }),
        ).toBeVisible();
        await expect(page.locator('input[type="file"]')).toHaveCount(0);
      }
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `three prepared assigned campaigns keep distinct requests`,
    { tag: ["@B01", "@M53", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "leader", locale, "/batch-leader?fixture=dense");
      const assigned = page.getByRole("region", {
        name: pick(locale, "Assigned campaigns", "الحملات المسندة"),
        exact: true,
      });
      await expect(
        assigned.getByRole("link", {
          name: pick(locale, "Open requests", "فتح الطلبات"),
          exact: true,
        }),
      ).toHaveCount(3, { timeout: 5_000 });
      const t = bilingual(locale);
      const ids = [
        "sample-campaign",
        "sample-biochemistry-campaign",
        "sample-physiology-campaign",
      ];
      const seen = new Set<string>();
      for (const id of ids) {
        const open = assigned
          .getByRole("link", {
            name: t("Open requests", "فتح الطلبات"),
            exact: true,
          })
          .filter({ hasText: t("Open requests", "فتح الطلبات") })
          .and(page.locator(`a[href*="/campaigns/${id}?"]`));
        await open.press("Enter");
        await expect(page).toHaveURL(new RegExp(`/campaigns/${id}\\?`, "u"));
        const title = await page.getByRole("heading", { level: 1 }).innerText();
        seen.add(title);
        const requests = page.locator(
          "section[aria-labelledby='outstanding-requests']",
        );
        await expect(requests.getByRole("listitem")).toHaveCount(3);
        await expect(
          requests.getByText(t("Awaiting file", "بانتظار ملف"), {
            exact: false,
          }),
        ).toHaveCount(3);
        await page
          .locator('input[type="file"]')
          .setInputFiles(
            nodePath.resolve("public/demo-files/synthetic-handout.pdf"),
          );
        const queue = page.getByRole("list", {
          name: t("Upload queue", "قائمة الرفع"),
          exact: true,
        });
        await expect(
          queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
        ).toBeVisible();
        await page
          .getByLabel(
            t("Professor or source description", "وصف الأستاذ أو المصدر"),
          )
          .fill(`Synthetic independent submission for ${id}.`);
        await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
        await page
          .getByRole("button", {
            name: t("Submit files", "إرسال الملفات"),
            exact: true,
          })
          .press("Enter");
        await expect(
          page.locator('[data-record-request] [data-status="RECEIVED"]'),
        ).toHaveCount(1);
        await expect(
          requests.getByText(t("Awaiting file", "بانتظار ملف"), {
            exact: false,
          }),
        ).toHaveCount(2);
        await navigate(page, "/batch-leader", locale);
      }
      expect(seen.size).toBe(3);
      await openPreparedHistory(page, locale);
      const history = page.getByRole("region", {
        name: t("Requests with submissions", "الطلبات ذات الإرسالات"),
        exact: true,
      });
      await expect(
        history.getByText("Synthetic study source", { exact: true }),
      ).toHaveCount(3);
      for (const title of seen)
        await expect(history.getByText(title, { exact: true })).toHaveCount(
          title ===
            t("Synthetic Anatomy source call", "حملة مصادر التشريح التجريبية")
            ? 6
            : 1,
        );
      await navigate(page, "/batch-leader", locale);
      // Unclipped campaign titles at each width are checked by the layout matrix.
      await expect(assigned.getByRole("heading", { level: 3 })).toHaveCount(3);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `separate unfinished queues survive campaign and account navigation`,
    { tag: ["@B01", "@M53", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "leader", locale, "/batch-leader?fixture=dense");
      const a = "/batch-leader/campaigns/sample-campaign";
      const b = "/batch-leader/campaigns/sample-biochemistry-campaign";
      const queue = page.getByRole("list", {
        name: t("Upload queue", "قائمة الرفع"),
        exact: true,
      });
      const description = page.getByLabel(
        t("Professor or source description", "وصف الأستاذ أو المصدر"),
      );
      const rights = page.getByLabel(t("I have permission", "لدي صلاحية"));
      for (const path of [a, b]) {
        await openPreparedCampaign(page, path, locale);
        await expect(queue).toHaveCount(0);
        await page
          .locator('input[type="file"]')
          .setInputFiles(
            nodePath.resolve("public/demo-files/synthetic-handout.pdf"),
          );
        await expect(
          queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
        ).toBeVisible();
        await description.fill(`Synthetic retained description for ${path}.`);
        if (path === a) await rights.check();
      }
      await openPreparedHistory(page, locale);
      await navigate(page, "/settings", locale);
      await openPreparedCampaign(page, a, locale);
      await expect(queue.getByRole("listitem")).toHaveCount(1);
      await expect(description).toHaveValue(
        `Synthetic retained description for ${a}.`,
      );
      await expect(rights).toBeChecked();
      await expect(
        queue.getByText(t("Origin: Your device", "المصدر: جهازك"), {
          exact: true,
        }),
      ).toHaveCount(1);
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(queue.getByRole("progressbar")).toBeVisible();
      await openPreparedCampaign(page, b, locale);
      await expect(description).toHaveValue(
        `Synthetic retained description for ${b}.`,
      );
      await expect(rights).not.toBeChecked();
      await openPreparedCampaign(page, a, locale);
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(0);
      const retry = queue.getByRole("button", {
        name: t("Retry upload", "إعادة محاولة الرفع"),
        exact: true,
      });
      await retry.click();
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(1);
      await openPreparedHistory(page, locale);
      await expect(
        page.getByText("Synthetic study source", { exact: true }),
      ).toHaveCount(1);
      await openPreparedCampaign(page, b, locale);
      await expect(description).toHaveValue(
        `Synthetic retained description for ${b}.`,
      );
      await expect(rights).not.toBeChecked();
      await navigate(page, "/settings", locale);
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
        .click();
      await expect(page).toHaveURL(/\/login\?/u);
      await signIn(page, "leader", locale, "/batch-leader");
      await expect(
        page.getByRole("link", {
          name: t("Open requests", "فتح الطلبات"),
          exact: true,
        }),
      ).toHaveCount(1);
      await navigate(page, a, locale);
      await expect(queue).toHaveCount(0);
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `a retained receipt retries after remount without uploading again`,
    { tag: ["@B01", "@M53", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await page.addInitScript(() => {
        const original = FormData.prototype.set as (
          this: FormData,
          name: string,
          value: string | Blob,
        ) => void;
        let rejectOnce = true;
        FormData.prototype.set = function (name, value) {
          if (name === "declaredRights" && rejectOnce) {
            rejectOnce = false;
            return original.call(this, name, "UNKNOWN");
          }
          return original.call(this, name, value);
        };
      });
      await signIn(page, "leader", locale, "/batch-leader?fixture=dense");
      const a = "/batch-leader/campaigns/sample-biochemistry-campaign";
      await openPreparedCampaign(page, a, locale);
      await page
        .getByRole("button", {
          name: t("Upload files", "رفع الملفات"),
          exact: true,
        })
        .click();
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: t("Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .click();
      const queue = page.getByRole("list", {
        name: t("Upload queue", "قائمة الرفع"),
        exact: true,
      });
      await expect(
        queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toBeVisible();
      await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(
        queue.getByRole("button", {
          name: t("Retry submission", "إعادة محاولة الإرسال"),
          exact: true,
        }),
      ).toBeVisible();
      await openPreparedHistory(page, locale);
      await expect(
        page.getByText("Synthetic study source", { exact: true }),
      ).toHaveCount(0);
      await navigate(page, "/settings", locale);
      await openPreparedCampaign(page, a, locale);
      await expect(
        queue.getByText(t("Origin: Approved reference", "المصدر: مرجع معتمد"), {
          exact: true,
        }),
      ).toHaveCount(1);
      await page.evaluate(() => {
        const observed = { uploads: 0 };
        Object.assign(window, { syntheticRetryObservation: observed });
        new MutationObserver((records) => {
          for (const record of records)
            for (const node of record.addedNodes)
              if (
                node instanceof Element &&
                (node.matches('progress, [role="progressbar"]') ||
                  node.querySelector('progress, [role="progressbar"]'))
              )
                observed.uploads += 1;
        }).observe(document.body, { childList: true, subtree: true });
      });
      await queue
        .getByRole("button", {
          name: t("Retry submission", "إعادة محاولة الإرسال"),
          exact: true,
        })
        .click();
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(1);
      expect(
        await page.evaluate(
          () =>
            (
              window as unknown as {
                syntheticRetryObservation: { uploads: number };
              }
            ).syntheticRetryObservation.uploads,
        ),
      ).toBe(0);
      await openPreparedHistory(page, locale);
      await expect(
        page.getByText("Synthetic study source", { exact: true }),
      ).toHaveCount(1);
      await openPreparedCampaign(page, a, locale);
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(1);
      await expect(
        queue.getByRole("button", {
          name: t("Retry submission", "إعادة محاولة الإرسال"),
          exact: true,
        }),
      ).toHaveCount(0);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `unknown, unprepared and wrong-role campaigns remain unavailable`,
    { tag: ["@B01", "@M53", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "leader", locale, "/batch-leader");
      await expect(
        page.getByRole("link", {
          name: t("Open requests", "فتح الطلبات"),
          exact: true,
        }),
      ).toHaveCount(1);
      const extra = "/batch-leader/campaigns/sample-physiology-campaign";
      await signIn(page, "leader", locale, extra);
      await expect(page.getByRole("main")).toContainText(
        t("Access unavailable", "الوصول غير متاح"),
      );
      await expect(
        page.getByRole("button", {
          name: t("Choose files", "اختيار ملفات"),
          exact: true,
        }),
      ).toHaveCount(0);
      for (const role of ["student", "admin", "second-admin"]) {
        await signIn(page, role, locale, `${extra}?fixture=dense`);
        await expect(page.getByRole("main")).toContainText(
          t("Access unavailable", "الوصول غير متاح"),
        );
        await expect(
          page.getByRole("button", {
            name: t("Choose files", "اختيار ملفات"),
            exact: true,
          }),
        ).toHaveCount(0);
      }
      await page.goto(
        `/batch-leader/campaigns/sample-unassigned-campaign?fixture=dense&lang=${locale}`,
      );
      await expect(
        page.getByRole("heading", { name: "Page not found", exact: true }),
      ).toBeVisible();
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `reference and device entry origins stay distinct`,
    { tag: ["@B01", "@M69", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "leader", locale, campaign);
      await page
        .locator('input[type="file"]')
        .setInputFiles(
          nodePath.resolve("public/demo-files/synthetic-handout.pdf"),
        );
      const rights = page.getByLabel(t("I have permission", "لدي صلاحية"));
      await expect(
        page.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toBeVisible();
      await rights.check();
      await page
        .locator('input[type="file"]')
        .setInputFiles(
          nodePath.resolve("public/demo-files/synthetic-handout.pdf"),
        );
      await expect(rights).not.toBeChecked();
      await expect(
        page.getByText(
          t(
            "That file is already in your queue.",
            "هذا الملف موجود بالفعل في قائمتك.",
          ),
          { exact: true },
        ),
      ).toBeVisible();
      await rights.check();
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: t("Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .press("Enter");
      await expect(rights).not.toBeChecked();
      // The language switch below renames the queue; it is one list throughout.
      const queue = page.locator(
        'ul[aria-label="Upload queue"], ul[aria-label="قائمة الرفع"]',
      );
      await expect(queue.getByRole("listitem")).toHaveCount(2);
      await expect(
        queue.getByText(t("Origin: Your device", "المصدر: جهازك"), {
          exact: true,
        }),
      ).toHaveCount(1, { timeout: 5_000 });
      await expect(
        queue.getByText(t("Origin: Approved reference", "المصدر: مرجع معتمد"), {
          exact: true,
        }),
      ).toHaveCount(1);
      await expect(
        page.getByText(
          t(
            "Approved synthetic handout reference",
            "مرجع الملزمة التجريبي المعتمد",
          ),
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        queue.getByText("synthetic-handout.pdf", { exact: true }),
      ).toHaveCount(2);
      await expect(queue.getByRole("textbox")).toHaveCount(2);
      for (const title of await queue.getByRole("textbox").all())
        await expect(title).toHaveValue("Synthetic study source");
      await expect(
        queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toHaveCount(2);
      await page
        .getByRole("button", {
          name: locale === "en" ? "العربية" : "English",
          exact: true,
        })
        .click();
      await expect(queue.getByRole("listitem")).toHaveCount(2);
      await expect(
        page.getByText(
          locale === "en" ? "المصدر: مرجع معتمد" : "Origin: Approved reference",
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        page.getByText(
          locale === "en" ? "المصدر: جهازك" : "Origin: Your device",
          { exact: true },
        ),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: locale === "en" ? "English" : "العربية",
          exact: true,
        })
        .click();
      await expect(rights).not.toBeChecked();
      const submit = page.getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      });
      await expect(submit).toBeDisabled();
      await rights.press("Space");
      await submit.press("Enter");
      const receipt = page.locator('[data-record-request="sample-item-1"]');
      await expect(receipt.locator('[data-status="RECEIVED"]')).toHaveCount(1);
      // Both submissions succeeded; the approved view lists only the latest one.
      await expect(
        page
          .getByRole("status")
          .filter({ hasText: t("Received files", "الملفات المستلمة") }),
      ).toContainText(
        new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en").format(2),
      );
      if (
        !(await receipt
          .locator("details")
          .evaluate((element) => (element as HTMLDetailsElement).open))
      )
        await receipt.locator("summary").click();
      await expect(receipt.locator("dl")).toContainText(
        t("Approved reference", "مرجع معتمد"),
      );
      await expect(receipt).toContainText(
        t(
          "Processing and review are separate",
          "المعالجة والمراجعة خطوتان منفصلتان",
        ),
      );
      await expect(receipt).toContainText(
        t(
          "does not make it available to students",
          "ولا يعني هذا إتاحته للطلاب",
        ),
      );
      await expect(receipt.locator("input,textarea,select")).toHaveCount(0);
      await expect(queue).toBeHidden();
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `reference origin survives cancellation and retry alongside rejected device bytes`,
    { tag: ["@B01", "@M69", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "leader", locale, campaign);
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: t("Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .click();
      await page.locator('input[type="file"]').setInputFiles({
        name: "invented-private.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("Invented invalid bytes only."),
      });
      const queue = page.getByRole("list", {
        name: t("Upload queue", "قائمة الرفع"),
        exact: true,
      });
      const referenceRow = queue.getByRole("listitem").filter({
        hasText: t("Origin: Approved reference", "المصدر: مرجع معتمد"),
      });
      const deviceRow = queue
        .getByRole("listitem")
        .filter({ hasText: t("Origin: Your device", "المصدر: جهازك") });
      await expect(
        referenceRow.getByText(t("Ready to upload", "جاهز للرفع"), {
          exact: true,
        }),
      ).toBeVisible();
      await expect(deviceRow).toContainText(
        t(
          "Use the supplied synthetic files only.",
          "استخدم الملفات التجريبية المرفقة فقط.",
        ),
      );
      await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await page
        .getByRole("button", {
          name: t("Cancel upload", "إلغاء الرفع"),
          exact: true,
        })
        .click();
      await expect(
        referenceRow.getByRole("button", {
          name: t("Retry upload", "إعادة محاولة الرفع"),
          exact: true,
        }),
      ).toBeVisible();
      await referenceRow
        .getByRole("button", {
          name: t("Retry upload", "إعادة محاولة الرفع"),
          exact: true,
        })
        .press("Enter");
      const receipt = page.locator('[data-record-request="sample-item-1"]');
      await expect(receipt.locator('[data-status="RECEIVED"]')).toBeVisible();
      if (
        !(await receipt
          .locator("details")
          .evaluate((element) => (element as HTMLDetailsElement).open))
      )
        await receipt.locator("summary").click();
      await expect(receipt.locator("dl")).toContainText(
        t("Approved reference", "مرجع معتمد"),
      );
      await expect(receipt).toContainText(
        t(
          "Processing and review are separate",
          "المعالجة والمراجعة خطوتان منفصلتان",
        ),
      );
      await expect(receipt).toContainText(
        t(
          "does not make it available to students",
          "ولا يعني هذا إتاحته للطلاب",
        ),
      );
      await expect(deviceRow).not.toContainText(t("Received", "تم الاستلام"));
      await expect(deviceRow).toContainText(
        t(
          "Use the supplied synthetic files only.",
          "استخدم الملفات التجريبية المرفقة فقط.",
        ),
      );
      await expect(queue.getByRole("listitem")).toHaveCount(1);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `expired and replayed fixtures deny work and offer a safe exit`,
    { tag: ["@B01", "@M53", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      const expired = new Intl.DateTimeFormat(
        locale === "ar" ? "ar-EG" : "en",
        {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Africa/Cairo",
        },
      ).format(new Date("2026-09-30T12:00:00Z"));
      for (const path of [
        "/batch-leader/invitation?fixture=expired",
        `${campaign}?fixture=expired`,
        "/batch-leader/invitation?fixture=replayed",
      ]) {
        await signIn(page, "leader", locale, path);
        await expect(page.getByRole("note")).toContainText(
          "2026-10-01 12:00 UTC",
        );
        await expect(page.getByRole("main")).toContainText(
          t("expired", path.startsWith(campaign) ? "انتهى" : "منتهية"),
        );
        if (!path.includes("replayed"))
          await expect(page.getByRole("main")).toContainText(expired);
        else await expect(page.getByRole("main")).not.toContainText(expired);
        await expect(
          page.getByRole("button", {
            name: t("Accept invitation", "قبول الدعوة"),
            exact: true,
          }),
        ).toHaveCount(0);
        await expect(
          page.getByRole("button", {
            name: t("Submit files", "إرسال الملفات"),
            exact: true,
          }),
        ).toHaveCount(0);
        await expect(page.getByRole("main")).not.toContainText(
          t("Synthetic Anatomy source call", "حملة مصادر التشريح التجريبية"),
        );
        await page
          .getByRole("link", {
            name: path.startsWith(campaign)
              ? t("Back", "العودة")
              : t("Return to campaigns", "العودة للحملات"),
            exact: true,
          })
          .click();
        await expect(
          page.getByRole("heading", {
            name: t("Source intake", "استلام المصادر"),
            exact: true,
          }),
        ).toBeVisible();
      }
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `an edited upload description finalizes one receipt`,
    { tag: ["@B01", "@M52", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "leader", locale, campaign);
      await page
        .locator('input[type="file"]')
        .setInputFiles("public/demo-files/synthetic-handout.pdf");
      const queue = page.getByRole("list", {
        name: t("Upload queue", "قائمة الرفع"),
      });
      await expect(
        queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toBeVisible();
      const description = page.getByLabel(
        t("Professor or source description", "وصف الأستاذ أو المصدر"),
      );
      const upload = page.getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      });
      const rights = page.getByLabel(t("I have permission", "لدي صلاحية"));
      await description.fill(" short ");
      await rights.press("Space");
      await expect(upload).toBeDisabled();
      await expect(description).toHaveValue(" short ");
      const edited = t(
        "Invented materials for a synthetic upload review.",
        "مواد مصطنعة لمراجعة رفع المصادر في UniMind.",
      );
      await description.fill(edited);
      await rights.uncheck();
      await expect(upload).toBeDisabled();
      await rights.press("Space");
      // The edited draft survives responsive re-layout at each breakpoint.
      for (const width of layoutWidths) {
        await page.setViewportSize({ width, height: 844 });
        await expect(description).toHaveValue(edited);
        await expect(upload).toBeEnabled();
      }
      await upload.press("Enter");
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(1, { timeout: 5_000 });
      const captured = page.locator('[data-record-request="sample-item-1"]');
      await expect(captured.locator("dl")).toContainText(edited);
      await expect(captured.locator("input, textarea, select")).toHaveCount(0);
      await expect(
        queue.getByRole("button", {
          name: t("Retry submission", "إعادة محاولة الإرسال"),
          exact: true,
        }),
      ).toHaveCount(0);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `phone campaign intake keeps its request action in the first viewport`,
    { tag: ["@premium", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await signIn(page, "leader", locale, campaign);
      const action = page.getByRole("button", {
        name: pick(locale, "Upload files", "رفع الملفات"),
        exact: true,
      });
      for (const width of [390, 380]) {
        await page.setViewportSize({ width, height: 844 });
        await expect(action).toBeVisible();
        const rect = await action.boundingBox();
        expect(rect!.y + rect!.height).toBeLessThanOrEqual(756);
      }
      await openB09Upload(page, locale);
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `the file/reference form and History tracking stay consistent`,
    { tag: ["@demo-core", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "leader", locale, campaign);
      await expect(page).toHaveURL(
        new RegExp("/batch-leader/campaigns/sample-campaign"),
      );
      await ensureB09Intake(page, locale);
      await page
        .getByRole("button", {
          name: pick(locale, "Add approved reference", "إضافة المرجع المعتمد"),
          exact: true,
        })
        .click();
      await expect(
        page.getByText(pick(locale, "Ready to upload", "جاهز للرفع"), {
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByLabel(pick(locale, "I have permission", "لدي صلاحية"))
        .check();
      await page
        .getByRole("button", {
          name: pick(locale, "Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toBeVisible();
      await page
        .getByRole("link", {
          name: pick(locale, "Latest submissions", "آخر الإرسالات"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Latest submissions", "آخر الإرسالات"),
          exact: true,
        }),
      ).toBeVisible();
      const history = page.getByRole("region", {
        name: pick(
          locale,
          "Requests with submissions",
          "الطلبات ذات الإرسالات",
        ),
      });
      await expect(
        history.getByText(pick(locale, "Anatomy handout", "ملزمة التشريح"), {
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        history.getByText(pick(locale, "Received", "تم الاستلام"), {
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("navigation").locator('[aria-current="page"]'),
      ).toHaveCount(1);
      finish();
    },
  );
});

test(
  `all supplied mixed file types, private-byte rejection and cancel retry use only local state`,
  { tag: ["@demo-core"] },
  async ({ page }) => {
    const finish = isolation(page);
    await signIn(page, "leader", "en", campaign);
    await page.locator('input[type="file"]').setInputFiles({
      name: "synthetic-handout.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 invented wrong bytes"),
    });
    await expect(
      page.getByText(/Use the supplied synthetic files only/u),
    ).toBeVisible();
    await page
      .locator('input[type="file"]')
      .setInputFiles([
        "public/demo-files/synthetic-handout.pdf",
        "public/demo-files/synthetic-recording.wav",
        "public/demo-files/synthetic-diagram.png",
      ]);
    const queue = page.getByRole("list", { name: "Upload queue" });
    await expect(
      queue.getByText("Ready to upload", { exact: true }),
    ).toHaveCount(3);
    await page.getByLabel("I have permission").check();
    await page
      .getByRole("button", { name: "Submit files", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Cancel upload", exact: true })
      .click();
    await expect(queue.getByText(/interrupted/u)).toBeVisible();
    await expect(
      queue.getByText("Ready to upload", { exact: true }),
    ).toHaveCount(2);
    await page
      .getByRole("button", { name: "Submit files", exact: true })
      .click();
    await expect(
      page.locator('[data-record-request] [data-status="RECEIVED"]'),
    ).toHaveCount(3);
    await expect(
      queue.getByText(/Use the supplied synthetic files only/u),
    ).toBeVisible();
    finish();
  },
);

test(
  `campaign access and list failure states expose no upload action`,
  { tag: ["@demo-core"] },
  async ({ page }) => {
    const finish = isolation(page);
    for (const fixture of [
      "empty",
      "error",
      "expired",
      "forbidden",
      "wrong-scope",
    ]) {
      await signIn(page, "leader", "en", `${campaign}?fixture=${fixture}`);
      await expect(
        page.getByRole("main").getByRole("heading").first(),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Submit files", exact: true }),
      ).toHaveCount(0);
      await expect(page.getByRole("main")).not.toContainText(
        "Synthetic Anatomy source call",
      );
    }
    finish();
  },
);

test(
  `leader sign-in preserves History and its empty state`,
  { tag: ["@demo-core"] },
  async ({ page }) => {
    const finish = isolation(page);
    for (const locale of ["en", "ar"] as const) {
      await signIn(
        page,
        "leader",
        locale,
        "/batch-leader?view=history&fixture=empty",
      );
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Latest submissions", "آخر الإرسالات"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.getByRole("main")).toContainText(
        pick(locale, "No submissions yet", "لا توجد إرسالات بعد"),
      );
      await expect(page.locator('nav a[aria-current="page"]')).toHaveCount(1);
    }
    finish();
  },
);

inLocales(["en"], (locale) => {
  test(
    `the invitation preserves its decision and campaign return`,
    { tag: ["@demo-core", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "leader", locale, "/batch-leader/invitation");
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Campaign invitation", "دعوة حملة"),
          exact: true,
        }),
      ).toHaveCount(1);
      // Navigation contrast and reflow per scheme and width: layout matrix.
      const accept = page.getByRole("button", {
        name: pick(locale, "Accept invitation", "قبول الدعوة"),
        exact: true,
      });
      await accept.click();
      await expect(accept).toBeDisabled();
      await expect(page.getByRole("status")).toContainText(
        pick(locale, "Invitation accepted", "تمت مراجعة الدعوة"),
      );
      await page
        .getByRole("link", {
          name: pick(locale, "View campaigns", "عرض الحملات"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Source intake", "استلام المصادر"),
          exact: true,
        }),
      ).toBeVisible();
      finish();
    },
  );
});

// Restored from the retired fixture route's batch-leader-collection spec
// (af8d1fb), reached through the loopback runtime and the shared intake.
inLocales(["en"], (locale) => {
  test(
    `dropped files join the queue and a file matching two requests waits for its chosen destination`,
    { tag: ["@B04", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await recordFinalizedRequests(page);
      await signIn(page, "leader", locale, `${campaign}?fixture=shared-format`);
      await ensureB09Intake(page, locale);
      await dropSuppliedFiles(page, locale, [
        "synthetic-handout.pdf",
        "synthetic-diagram.png",
      ]);
      const queue = page.getByRole("list", {
        name: t("Upload queue", "قائمة الرفع"),
        exact: true,
      });
      await expect(queue.getByRole("listitem")).toHaveCount(2);
      const handout = queue
        .getByRole("listitem")
        .filter({ hasText: "synthetic-handout.pdf" });
      const diagram = queue
        .getByRole("listitem")
        .filter({ hasText: "synthetic-diagram.png" });
      await expect(handout).toContainText(
        `${t("For", "لـ")}: ${t("Anatomy handout", "ملزمة التشريح")}`,
      );
      await expect(handout.getByRole("combobox")).toHaveCount(0);
      // The diagram matches two outstanding requests: nothing is guessed.
      const destination = diagram.getByRole("combobox");
      await expect(destination).toHaveValue("");
      await expect(destination.locator("option")).toHaveText([
        t("Choose a requested material", "اختر المادة المطلوبة"),
        t("Anatomy diagram", "رسم تشريح"),
        t("Anatomy practice diagram", "رسم تدريبي للتشريح"),
      ]);
      await expect(diagram).not.toContainText(`${t("For", "لـ")}:`);
      await destination.selectOption({
        label: t("Anatomy diagram", "رسم تشريح"),
      });
      await expect(
        diagram.getByRole("option", {
          name: t("Choose a requested material", "اختر المادة المطلوبة"),
        }),
      ).toHaveCount(0);
      await expect(diagram).toContainText(
        `${t("For", "لـ")}: ${t("Anatomy diagram", "رسم تشريح")}`,
      );
      // Changing the chosen destination mints a fresh per-file request key.
      const beforeChange = await generatedIds(page);
      await diagram
        .getByLabel(t("Change requested material", "تغيير المادة المطلوبة"))
        .selectOption({
          label: t("Anatomy practice diagram", "رسم تدريبي للتشريح"),
        });
      await expect(diagram).toContainText(
        `${t("For", "لـ")}: ${t("Anatomy practice diagram", "رسم تدريبي للتشريح")}`,
      );
      await expect(
        queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toHaveCount(2);
      await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
      await page
        .getByRole("button", {
          name: t("Submit files", "إرسال الملفات"),
          exact: true,
        })
        .click();
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(2);
      const finalized = await finalizedRequests(page);
      expect(finalized.map((request) => request.item).sort()).toEqual([
        "sample-item-1",
        "sample-item-4",
      ]);
      const practice = finalized.find(
        (request) => request.item === "sample-item-4",
      )!;
      expect(beforeChange).not.toContain(practice.key);
      expect(await generatedIds(page)).toContain(practice.key);
      expect(practice.uploadId).toBe(
        `sample-upload:sample-campaign:sample-item-4:${practice.key}`,
      );
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `a cancelled upload retries with its own request key while the next file keeps a distinct one`,
    { tag: ["@B01", "@M69", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await recordFinalizedRequests(page);
      await signIn(page, "leader", locale, campaign);
      await page
        .locator('input[type="file"]')
        .setInputFiles([
          "public/demo-files/synthetic-handout.pdf",
          "public/demo-files/synthetic-recording.wav",
        ]);
      const queue = page.getByRole("list", {
        name: t("Upload queue", "قائمة الرفع"),
        exact: true,
      });
      await expect(
        queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toHaveCount(2);
      // Every per-file key exists before the first upload starts.
      const enqueued = await generatedIds(page);
      await page.getByLabel(t("I have permission", "لدي صلاحية")).check();
      const submit = page.getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      });
      await submit.click();
      await page
        .getByRole("button", {
          name: t("Cancel upload", "إلغاء الرفع"),
          exact: true,
        })
        .click();
      const handout = queue
        .getByRole("listitem")
        .filter({ hasText: "synthetic-handout.pdf" });
      const recording = queue
        .getByRole("listitem")
        .filter({ hasText: "synthetic-recording.wav" });
      await expect(handout).toHaveAttribute("data-state", "ERROR");
      await expect(
        handout.getByRole("button", {
          name: t("Retry upload", "إعادة محاولة الرفع"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(recording).toHaveAttribute("data-state", "READY");
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(0);
      expect(await finalizedRequests(page)).toEqual([]);
      await submit.click();
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(2);
      const finalized = await finalizedRequests(page);
      expect(finalized.map((request) => request.item).sort()).toEqual([
        "sample-item-1",
        "sample-item-2",
      ]);
      expect(new Set(finalized.map((request) => request.key)).size).toBe(2);
      for (const request of finalized) {
        // Retry reuses the key minted when the file was queued, and the
        // upload was registered under that same key.
        expect(enqueued).toContain(request.key);
        expect(request.uploadId).toBe(
          `sample-upload:sample-campaign:${request.item}:${request.key}`,
        );
      }
      finish();
    },
  );
});
