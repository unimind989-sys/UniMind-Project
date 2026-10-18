// WP03-T29: interaction and input-semantics repairs, one observable outcome
// per repaired control (findings IX-08 to IX-35 in
// docs/reviews/wp03-refinement/audits/interactions.md).
import { getAdminCopy, syntheticDemoTime } from "../support/app-fixtures";
import { bilingual, formatNumber, inLocales } from "../support/copy";
import { adminNavigate, b07SavePath, campaign, unit } from "../support/demo";
import { isolation, navigate, signIn } from "../support/session";
import { expect, test, type Page } from "../support/test";

/** Whether leaving the page now would ask first (`beforeunload`). */
const leavingAsks = (page: Page) =>
  page.evaluate(() => {
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  });

inLocales(["en"], (locale) => {
  test(
    `intake explains disabled Submit, announces cleared permission and guards unsent files`,
    { tag: ["@T29", `@${locale}`] },
    async ({ page }) => {
      test.setTimeout(120_000);
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "leader", locale, campaign);
      const picker = page.locator('input[type="file"]');
      // MIME types beside the extensions for Android pickers (inventory #19).
      await expect(picker).toHaveAttribute(
        "accept",
        ".pdf,.wav,.png,application/pdf,audio/wav,audio/x-wav,image/png",
      );
      await expect(picker).not.toHaveAttribute("aria-label");
      expect(await leavingAsks(page)).toBe(false);
      await picker.setInputFiles("public/demo-files/synthetic-handout.pdf");
      const queue = page.getByRole("list", {
        name: t("Upload queue", "قائمة الرفع"),
        exact: true,
      });
      await expect(
        queue.getByText(t("Ready to upload", "جاهز للرفع"), { exact: true }),
      ).toBeVisible();
      // A queued file that was never sent holds the page (IX-09).
      expect(await leavingAsks(page)).toBe(true);

      // Submit is disabled and the reason sits next to it (IX-08).
      const submit = page.getByRole("button", {
        name: t("Submit files", "إرسال الملفات"),
        exact: true,
      });
      const needs = page.locator("#collection-submit-needs");
      await expect(submit).toBeDisabled();
      await expect(submit).toHaveAttribute(
        "aria-describedby",
        "collection-submit-needs",
      );
      await expect(needs).toContainText(t("To submit:", "للإرسال:"));
      await expect(needs.locator('[data-need="rights"]')).toContainText(
        t("Missing:", "ناقص:"),
      );
      await expect(needs.locator('[data-need="file"]')).toContainText(
        t("Done:", "تم:"),
      );

      // The description's label is only its name; the hint describes it and
      // what is missing shows next to Submit.
      const description = page.getByLabel(
        t("Professor or source description", "وصف الأستاذ أو المصدر"),
        { exact: true },
      );
      await expect(description).toHaveAccessibleDescription(
        t(
          "This context will accompany each file. Minimum 10 characters.",
          "يرفق هذا الوصف بكل ملف. ١٠ أحرف على الأقل.",
        ),
      );
      await description.fill("");
      await expect(needs.locator('[data-need="description"]')).toContainText(
        t("Missing:", "ناقص:"),
      );
      await description.fill("Short");
      await expect(needs.locator('[data-need="description"]')).toContainText(
        t("Missing:", "ناقص:"),
      );
      await description.fill(
        "Prepared by the anatomy department for week three.",
      );
      await expect(needs.locator('[data-need="description"]')).toContainText(
        t("Done:", "تم:"),
      );

      // Adding files clears the permission and says so (IX-08).
      const rights = page.getByLabel(t("I have permission", "لدي صلاحية"));
      await rights.check();
      await expect(needs).toHaveCount(0);
      await expect(submit).toBeEnabled();
      await picker.setInputFiles("public/demo-files/synthetic-recording.wav");
      await expect(rights).not.toBeChecked();
      const cleared = page.locator("#collection-rights-cleared");
      await expect(cleared).toHaveAttribute("role", "status");
      await expect(cleared).toContainText(
        t(
          "Permission was cleared because the files changed.",
          "أُلغي تأكيد الصلاحية لأن الملفات تغيرت.",
        ),
      );
      await expect(rights).toHaveAccessibleDescription(
        /Permission was cleared because the files changed/u,
      );
      await expect(submit).toBeDisabled();
      await rights.check();
      await expect(cleared).toBeEmpty();
      await expect(submit).toBeEnabled();

      // The row's live text names the state only; the percentage is visual
      // (IX-11). Cancel returns focus to Choose files (IX-24).
      await submit.click();
      const uploading = queue
        .getByRole("listitem")
        .filter({ hasText: "synthetic-handout.pdf" });
      await expect(uploading.getByRole("status")).toHaveText(
        t("Uploading", "جارٍ الرفع"),
      );
      await expect(uploading.locator("progress")).toBeVisible();
      expect(await leavingAsks(page)).toBe(true);
      await page
        .getByRole("button", {
          name: t("Cancel upload", "إلغاء الرفع"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("button", {
          name: t("Choose files", "اختيار ملفات"),
          exact: true,
        }),
      ).toBeFocused();
      expect(await leavingAsks(page)).toBe(true);

      // Once every file is received, leaving no longer asks.
      await submit.click();
      await expect(
        page.locator('[data-record-request] [data-status="RECEIVED"]'),
      ).toHaveCount(2);
      expect(await leavingAsks(page)).toBe(false);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `the drop zone highlights only while a drag is over it and the window is open`,
    { tag: ["@T29", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "leader", locale, campaign);
      await page
        .getByRole("button", {
          name: t("Upload files", "رفع الملفات"),
          exact: true,
        })
        .first()
        .click();
      const choose = page.getByRole("button", {
        name: t("Choose files", "اختيار ملفات"),
        exact: true,
      });
      await expect(choose).toBeFocused();
      const drop = page.locator('[class*="drop"]').filter({ has: choose });
      const drag = (type: string, target: "zone" | "child") =>
        drop.evaluate(
          (zone, [name, where]) => {
            const element =
              where === "zone" ? zone : (zone.querySelector("p") ?? zone);
            element.dispatchEvent(
              new DragEvent(name!, {
                bubbles: true,
                cancelable: true,
                dataTransfer: new DataTransfer(),
              }),
            );
          },
          [type, target],
        );
      await drag("dragenter", "zone");
      await expect(drop).toHaveAttribute("data-drag", "true");
      // Crossing into a child fires enter there and leave on the zone.
      await drag("dragenter", "child");
      await drag("dragleave", "zone");
      await expect(drop).toHaveAttribute("data-drag", "true");
      await drag("dragleave", "child");
      await expect(drop).not.toHaveAttribute("data-drag");
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `Studio locks every setting while preparing and Cancel returns to Generate`,
    { tag: ["@T29", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "student", locale, unit + "/studio");
      // Depth and size uses the shared chevron, not the native marker.
      const more = page.locator("summary", {
        hasText: t("Depth and size", "التفصيل والحجم"),
      });
      await expect(more.locator("svg")).toHaveCount(1);
      expect(
        await more.evaluate((summary) => getComputedStyle(summary).listStyle),
      ).toContain("none");
      await more.click();
      const generate = page.getByRole("button", {
        name: t("Generate", "إنشاء"),
        exact: true,
      });
      await generate.click();
      for (const id of [
        "artifact-type",
        "artifact-topic",
        "artifact-language",
        "artifact-depth",
        "artifact-size",
      ])
        await expect(page.locator(`#${id}`)).toBeDisabled();
      await page
        .getByRole("button", {
          name: t("Cancel preparation", "إلغاء الإعداد"),
          exact: true,
        })
        .click();
      await expect(generate).toBeFocused();
      for (const id of ["artifact-topic", "artifact-depth"])
        await expect(page.locator(`#${id}`)).toBeEnabled();
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `quiz numbers accept Arabic-Indic digits and validate on blur and Start`,
    { tag: ["@T29", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "student", locale, `${unit}/quiz`);
      const count = page.getByRole("textbox", {
        name: t("Number of questions", "عدد الأسئلة"),
        exact: true,
      });
      await expect(count).toHaveAttribute("inputmode", "numeric");
      await expect(count).toHaveAttribute("type", "text");
      const error = page.locator("#quiz-question-count-error");
      // Clearing the field to type again shows nothing yet.
      await count.fill("");
      await expect(error).toHaveCount(0);
      await expect(count).toHaveAttribute("aria-invalid", "false");
      await count.blur();
      await expect(error).toContainText(
        t("whole number of questions", "عددًا صحيحًا من الأسئلة"),
      );
      await expect(count).toHaveAttribute("aria-invalid", "true");
      // A valid Arabic-Indic number clears the error while typing.
      await count.fill(formatNumber("ar", 4));
      await expect(error).toHaveCount(0);
      // Leaving a valid field, then clearing it to type again, stays quiet.
      await count.blur();
      await count.fill("");
      await expect(error).toHaveCount(0);
      await count.fill(formatNumber("ar", 4));
      // Start validates too: an invalid value keeps the page and focuses it.
      await count.fill(formatNumber("ar", 9));
      await expect(error).toHaveCount(0);
      const start = page.getByRole("button", {
        name: t("Start quiz", "بدء الاختبار"),
        exact: true,
      });
      await expect(start).toBeEnabled();
      await start.click();
      await expect(count).toBeFocused();
      await expect(error).toBeVisible();
      await expect(page).toHaveURL(/\/quiz\?/u);
      await page
        .getByRole("radio", { name: t("Timed", "مؤقت"), exact: true })
        .check();
      const duration = page.getByRole("textbox", {
        name: t("Duration (minutes)", "المدة (بالدقائق)"),
        exact: true,
      });
      await duration.fill(formatNumber("ar", 3));
      await count.fill(formatNumber("ar", 4));
      await start.click();
      await expect(
        page.getByRole("heading", {
          name: t("Quiz attempt", "محاولة الاختبار"),
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.locator("fieldset")).toHaveCount(4);
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `Subjects search is a search landmark that announces its result count`,
    { tag: ["@T29", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "student", locale, "/settings");
      await b07SavePath(
        page,
        locale,
        "human-medicine",
        "human-medicine-year-1",
      );
      await navigate(page, "/learn", locale);
      // The Study view has no result count.
      await expect(page.locator('[class*="covers"]').first()).toBeVisible();
      await expect(page.locator("#subjects-shown")).toHaveCount(0);
      await page
        .getByRole("navigation", {
          name: t("Product navigation", "تنقل المنتج"),
        })
        .getByRole("link", { name: t("Subjects", "المواد"), exact: true })
        .click();
      const landmark = page.getByRole("search");
      const search = landmark.getByRole("searchbox");
      await expect(search).toHaveAttribute("name", "q");
      await expect(search).toHaveAttribute("enterkeyhint", "search");
      await expect(search).toHaveAttribute("autocomplete", "off");
      await expect(search).toHaveAttribute("spellcheck", "false");
      const rows = page.locator("[data-unit-id]");
      const shown = page.locator("#subjects-shown");
      await expect(shown).toHaveAttribute("role", "status");
      const total = await rows.count();
      expect(total).toBeGreaterThan(1);
      await expect(shown).toHaveText(new RegExp(`^${total} \\w+ shown$`, "u"));
      const first = (await rows.first().innerText()).split("\n")[0]!.trim();
      await search.fill(first);
      await expect(rows).toHaveCount(1);
      await expect(shown).toHaveText(/^1 \w+ shown$/u);
      await search.fill("no-matching-synthetic-subject");
      await expect(shown).toHaveText(/^0 \w+ shown$/u);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `the consent error is the checkbox's description`,
    { tag: ["@T29", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await page.goto(`/login?lang=${locale}&email=student@example.invalid`);
      await expect(async () => {
        if (!/\/consent\?/u.test(page.url()))
          await page
            .getByRole("button", { name: t("Continue", "متابعة"), exact: true })
            .click({ timeout: 5_000 });
        await expect(page).toHaveURL(/\/consent\?/u, { timeout: 5_000 });
      }).toPass({ timeout: 30_000 });
      await page
        .getByRole("button", {
          name: t(
            "Accept all and continue to UniMind",
            "الموافقة والمتابعة إلى UniMind",
          ),
          exact: true,
        })
        .click();
      const box = page.getByRole("checkbox");
      await expect(box).toHaveAttribute("aria-invalid", "true");
      await expect(box).toHaveAttribute(
        "aria-describedby",
        "consent-acceptance-error",
      );
      await expect(page.locator("#consent-acceptance-error")).toBeVisible();
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `the decision queue names why it is empty and the hold form shows inline errors`,
    { tag: ["@T29", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      const copy = getAdminCopy(locale);
      await signIn(page, "admin", locale);
      // Empty-state copy by cause (IX-26).
      const tabs = page.getByRole("group", {
        name: copy.filtersLabel,
        exact: true,
      });
      const empty = page.locator('[class*="queueEmpty"]');
      const search = page.getByRole("search").getByRole("searchbox", {
        name: t("Find a decision", "البحث عن قرار"),
      });
      await expect(search).toHaveAttribute("enterkeyhint", "search");
      await tabs
        .getByRole("button", { name: new RegExp(`^${copy.filters.pending} `) })
        .click();
      await expect(empty).toHaveText(
        t(
          "No decisions in “Waiting” right now.",
          "لا توجد قرارات في «قيد الانتظار» الآن.",
        ),
      );
      await search.fill(t("hold", "حجز"));
      await expect(empty).toHaveText(
        t(
          "No decisions in “Waiting” match this search.",
          "لا توجد قرارات في «قيد الانتظار» تطابق البحث.",
        ),
      );
      await search.fill("zz-no-such-decision");
      await expect(empty).toHaveText(
        t("No decisions match this search.", "لا توجد قرارات تطابق البحث."),
      );
      await search.fill("");
      await tabs
        .getByRole("button", { name: new RegExp(`^${copy.filters.all} `) })
        .click();
      await expect(empty).toHaveCount(0);

      // Review checks the hold form and says what to fix, in the page's
      // language, next to each field (IX-27).
      await page
        .getByRole("button", {
          name: new RegExp(t("^Place hold ", "^وضع حجز ")),
        })
        .click();
      const reason = page.getByLabel(copy.reason);
      const expiry = page.getByLabel(copy.holdExpiry, { exact: true });
      const attestation = page.locator('input[name="reviewAttested"]');
      const review = page.getByRole("button", {
        name: copy.reviewAction,
        exact: true,
      });
      const expectedMin = await page.evaluate((now) => {
        const date = new Date(now);
        const two = (part: number) => String(part).padStart(2, "0");
        return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}T${two(date.getHours())}:${two(date.getMinutes())}`;
      }, syntheticDemoTime.now);
      await expect(expiry).toHaveAttribute("min", expectedMin);
      await expect(expiry).toHaveAccessibleDescription(
        new RegExp(`^${copy.expiryZone} [^ ]+$`, "u"),
      );
      await review.click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(reason).toBeFocused();
      await expect(reason).toHaveAttribute("aria-invalid", "true");
      await expect(reason).toHaveAccessibleDescription(
        `${copy.reasonHint} ${copy.reasonError}`,
      );
      await reason.fill("Contain this exact synthetic object during review.");
      await expect(reason).not.toHaveAttribute("aria-invalid");
      await review.click();
      await expect(expiry).toBeFocused();
      await expect(page.locator("#decision-hold-expiry-error")).toHaveText(
        copy.expiryRequired,
      );
      await expiry.fill("2026-09-01T10:00");
      await review.click();
      await expect(page.locator("#decision-hold-expiry-error")).toHaveText(
        copy.expiryPast,
      );
      await expiry.fill("2027-01-18T16:00");
      await review.click();
      await expect(attestation).toBeFocused();
      await expect(attestation).toHaveAttribute("aria-invalid", "true");
      await expect(page.locator("#decision-attestation-error")).toHaveText(
        copy.attestationRequired,
      );
      await attestation.check();
      await expect(page.locator("#decision-attestation-error")).toHaveCount(0);
      await review.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `synthetic admin actions with one effect become disabled once done`,
    { tag: ["@T29", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "admin", locale, "/admin/cohorts");
      const cohort = page.getByRole("button", {
        name: t("Review cohort configuration", "مراجعة إعدادات المجموعة"),
        exact: true,
      });
      await cohort.click();
      await expect(cohort).toBeDisabled();
      await adminNavigate(page, "/admin/sources", locale);
      await adminNavigate(page, "/admin/campaigns", locale);
      const create = page.getByRole("button", {
        name: t("Create campaign", "إنشاء حملة"),
        exact: true,
      });
      await create.click();
      await expect(create).toBeDisabled();
      await adminNavigate(page, "/admin/catalog", locale);
      await page
        .getByLabel(t("Configured unit label", "اسم الوحدة من الإعدادات"))
        .selectOption("SUBJECT");
      await page
        .getByRole("button", {
          name: t("Review changes", "مراجعة التغييرات"),
          exact: true,
        })
        .click();
      const save = page.getByRole("button", {
        name: t("Save draft", "حفظ المسودة"),
        exact: true,
      });
      await save.click();
      await expect(save).toBeDisabled();
      finish();
    },
  );
});
