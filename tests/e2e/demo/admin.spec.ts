import { answerExamples, getAdminCopy } from "../support/app-fixtures";
import {
  bilingual,
  formatNumber,
  inLocales,
  localized,
  pick,
} from "../support/copy";
import {
  adminNavigate,
  b05Actions,
  b05Confirm,
  b05Select,
  changeAdmin,
  switchAdmin,
  unit,
} from "../support/demo";
import { expectReflow } from "../support/layout";
import { isolation, openSessionTools, send, signIn } from "../support/session";
import { expect, test } from "../support/test";
inLocales(["en"], (locale) => {
  test(
    `named resource action and preview detours return to the exact work`,
    { tag: ["@B05-B", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "admin", locale, "/admin/sources");
      const action = page.getByRole("link", {
        name: new RegExp(
          "^" + t("Open governed decisions", "فتح القرارات المنضبطة"),
        ),
      });
      await expect(action).toHaveAttribute(
        "href",
        /decision=sample-quarantine.*action=QUARANTINE_SOURCE.*version=2.*origin=sources/u,
      );
      await action.press("Enter");
      await expect(page.locator("#decision-detail-heading")).toBeFocused();
      await expect(page.locator('input[name="action"]')).toHaveValue(
        "QUARANTINE_SOURCE",
      );
      await expect(page.locator("#decision-detail-heading")).toContainText(
        t("Synthetic Anatomy recording", "تسجيل التشريح التجريبي"),
      );
      await page
        .getByRole("link", {
          name: t("Preview student", "معاينة الطالب"),
          exact: true,
        })
        .click();
      await page
        .getByRole("navigation", {
          name: t("Workspace navigation", "تنقل مساحة المذاكرة"),
          exact: true,
        })
        .getByRole("link", { name: t("Chat", "المحادثة"), exact: true })
        .click();
      await send(page, "supported", locale);
      await page
        .getByRole("button", {
          name: t("Lecture 6, p. 14", "المحاضرة 6، ص ١٤"),
          exact: true,
        })
        .click();
      await page
        .getByRole("dialog")
        .getByRole("link", {
          name: t("Open evidence details", "فتح تفاصيل الأدلة"),
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(/\/evidence\?/u);
      await page
        .getByRole("link", {
          name: t("Return to Admin", "العودة للإدارة"),
          exact: true,
        })
        .click();
      await expect(page.locator('input[name="action"]')).toHaveValue(
        "QUARANTINE_SOURCE",
      );
      await expect(page.locator("#decision-detail-heading")).toBeFocused();
      await page
        .getByRole("link", {
          name: t("Return to Sources", "العودة إلى المصادر"),
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(
        new RegExp(`/admin/sources\\?lang=${locale}$`),
      );
      await page
        .getByRole("link", {
          name: t("Preview exact student scope", "معاينة نطاق الطالب المحدد"),
          exact: true,
        })
        .click();
      await page
        .getByRole("navigation", {
          name: t("Workspace navigation", "تنقل مساحة المذاكرة"),
          exact: true,
        })
        .getByRole("link", { name: t("Studio", "الاستوديو"), exact: true })
        .click();
      await page
        .getByRole("link", {
          name: t("Return to Admin", "العودة للإدارة"),
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(
        new RegExp(`/admin/sources\\?lang=${locale}$`),
      );
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `saved and unsaved catalog choices survive navigation and require fresh review`,
    { tag: ["@B05-B", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "admin", locale, "/admin/catalog");
      const field = page.getByLabel(
        t("Configured unit label", "اسم الوحدة من الإعدادات"),
      );
      const review = page.getByRole("button", {
        name: t("Review changes", "مراجعة التغييرات"),
        exact: true,
      });
      const save = page.getByRole("button", {
        name: t("Save draft", "حفظ المسودة"),
        exact: true,
      });
      await field.selectOption("SUBJECT");
      await review.press("Enter");
      await save.click();
      await adminNavigate(page, "/admin/cohorts", locale);
      await adminNavigate(page, "/admin/catalog", locale);
      await expect(field).toHaveValue("SUBJECT");
      await expect(
        page.getByText(
          new RegExp(t("Sample catalog draft saved", "حفظت مسودة الدليل")),
        ),
      ).toContainText(t("Subject", "مادة دراسية"));
      await field.selectOption("MODULE");
      await review.click();
      await field.selectOption("SUBJECT");
      await expect(save).toHaveCount(0);
      await field.selectOption("MODULE");
      await adminNavigate(page, "/admin/jobs", locale);
      await adminNavigate(page, "/admin/catalog", locale);
      await expect(field).toHaveValue("MODULE");
      await page
        .getByRole("button", {
          name: locale === "en" ? "العربية" : "English",
          exact: true,
        })
        .click();
      await expect(page.locator("#catalog-unit-type")).toHaveValue("MODULE");
      await expect(
        page.getByText(
          new RegExp(
            locale === "en"
              ? "حفظت مسودة الدليل"
              : "Sample catalog draft saved",
          ),
        ),
      ).toContainText(locale === "en" ? "مادة دراسية" : "Subject");
      await page
        .getByRole("button", {
          name: locale === "en" ? "English" : "العربية",
          exact: true,
        })
        .click();
      await expect(field).toHaveValue("MODULE");
      await expect(
        page.getByText(new RegExp(t("Unsaved changes", "تغييرات غير محفوظة"))),
      ).toBeVisible();
      await expect(
        page.getByText(
          new RegExp(t("Sample catalog draft saved", "حفظت مسودة الدليل")),
        ),
      ).toContainText(t("Subject", "مادة دراسية"));
      await expect(save).toHaveCount(0);
      await review.press("Enter");
      await save.click();
      await expect(
        page.getByText(new RegExp(t("Unsaved changes", "تغييرات غير محفوظة"))),
      ).toHaveCount(0);
      await expect(
        page.getByText(
          new RegExp(t("Sample catalog draft saved", "حفظت مسودة الدليل")),
        ),
      ).toContainText(t("Module", "وحدة دراسية"));
      await expectReflow(page);
      await signIn(page, "admin", locale, "/admin/catalog");
      await expect(field).toHaveValue("MODULE");
      await expect(
        page.getByText(
          new RegExp(t("Sample catalog draft saved", "حفظت مسودة الدليل")),
        ),
      ).toHaveCount(0);
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `closed resource links and generic recovery cannot redirect or authorize`,
    { tag: ["@B05-B", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "second-admin", locale);
      for (const resource of [
        "sources",
        "catalog",
        "cohorts",
        "jobs",
        "quality",
        "usage",
        "incidents",
      ]) {
        await adminNavigate(page, `/admin/${resource}`, locale);
        const link = page.getByRole("link", {
          name: new RegExp(
            "^" + t("Open governed decisions", "فتح القرارات المنضبطة"),
          ),
        });
        await expect(link).toHaveAttribute(
          "href",
          new RegExp(`decision=sample-.*origin=${resource}`),
        );
        await expect(
          page.getByRole("link", {
            name: t("All decisions", "كل القرارات"),
            exact: true,
          }),
        ).toHaveAttribute("href", `/admin?lang=${locale}`);
      }
      await adminNavigate(page, "/admin/sources", locale);
      await adminNavigate(page, "/admin/campaigns", locale);
      await expect(
        page.getByRole("link", {
          name: new RegExp(
            "^" + t("Open governed decisions", "فتح القرارات المنضبطة"),
          ),
        }),
      ).toHaveCount(0);
      await page
        .getByRole("link", {
          name: t("All decisions", "كل القرارات"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: t("Decision queue", "قائمة القرارات"),
          exact: true,
        }),
      ).toBeVisible();
      for (const query of [
        "origin=https%3A%2F%2Fforeign.invalid",
        "origin=sources&origin=quality",
      ]) {
        await page.evaluate(
          (url) => history.pushState(null, "", url),
          `/admin?lang=${locale}&${query}`,
        );
        await expect(
          page.getByRole("link", {
            name: t("Return to Sources", "العودة إلى المصادر"),
            exact: true,
          }),
        ).toHaveCount(0);
      }
      await page
        .getByRole("link", {
          name: t("Preview student", "معاينة الطالب"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("link", {
          name: t("Return to Admin", "العودة للإدارة"),
          exact: true,
        }),
      ).toHaveAttribute("href", `/admin?lang=${locale}`);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `twelve exact presentations and five clean containment receipts`,
    { tag: ["@B05-A", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const copy = getAdminCopy(locale);
      await signIn(page, "admin", locale);
      const panel = page.locator(
        'section[aria-labelledby="decision-detail-heading"]',
      );
      for (let index = 0; index < 12; index++) {
        await b05Select(page, index, locale);
        await expect(panel).toContainText(
          copy.consequences[b05Actions[index]!],
        );
        const heading = page.locator("#decision-detail-heading");
        await expect(heading).not.toContainText("a0000000");
        await expect(heading).toContainText(
          index === 8 || index === 9
            ? pick(
                locale,
                "Synthetic handout raw object",
                "العنصر الخام لملزمة تجريبية",
              )
            : index >= 10
              ? pick(
                  locale,
                  "Synthetic study artifact control",
                  "التحكم بأداة مذاكرة تجريبية",
                )
              : index === 6 || index === 7
                ? pick(
                    locale,
                    "Synthetic Anatomy recording",
                    "تسجيل التشريح التجريبي",
                  )
                : index === 4 || index === 5
                  ? pick(
                      locale,
                      "Synthetic Anatomy handout",
                      "ملزمة التشريح التجريبية",
                    )
                  : index === 2 || index === 3
                    ? pick(locale, "cohort", "مجموعة")
                    : pick(locale, "Anatomy unit", "وحدة التشريح"),
        );
        await panel
          .locator("details summary")
          .filter({ hasText: copy.targetId })
          .click();
        await expect(panel.locator("details code")).toContainText("a0000000");
        const review = page.getByRole("button", {
          name: copy.reviewAction,
          exact: true,
        });
        if (await review.isDisabled()) continue;
        await page
          .getByLabel(copy.reason)
          .fill("Contain this exact synthetic object during review.");
        if (index === 8) {
          await page
            .getByLabel(copy.holdExpiry, { exact: true })
            .fill("2027-01-18T16:00");
          await page.locator('input[name="reviewAttested"]').check();
        }
        await review.press("Enter");
        await expect(page.getByRole("dialog")).toContainText(
          copy.consequences[b05Actions[index]!],
        );
        await expect(
          page.getByRole("button", {
            name: b05Confirm(locale, index),
            exact: true,
          }),
        ).toBeVisible();
        await page
          .getByRole("button", { name: copy.cancelReview, exact: true })
          .click();
        await expect(review).toBeFocused();
      }
      for (const index of [1, 3, 5, 6, 11]) {
        await b05Select(page, index, locale);
        await page
          .getByLabel(copy.reason)
          .fill("Contain this exact synthetic object during review.");
        await page
          .getByRole("button", { name: copy.reviewAction, exact: true })
          .click();
        await page
          .getByRole("button", { name: b05Confirm(locale, index), exact: true })
          .click();
        await expect(
          panel.getByText(copy.actionSuccess, { exact: true }),
        ).toBeVisible();
        await expect(panel).toContainText(copy.alreadyInState);
        await expect(panel).not.toContainText(copy.blocked);
        await expect(
          page.getByRole("button", { name: copy.reviewAction, exact: true }),
        ).toBeDisabled();
      }
      await page
        .getByRole("button", {
          name: new RegExp(pick(locale, "^Completed", "^مكتمل")),
        })
        .click();
      await expect(page.locator("#decision-list li")).toHaveCount(5);
      await expect(
        page.getByRole("heading", { name: new RegExp(copy.decisionsHeading) }),
      ).toContainText(formatNumber(locale, 7));
      await page
        .getByRole("button", {
          name: new RegExp(pick(locale, "^All ", "^الكل ")),
        })
        .click();
      await b05Select(page, 10, locale);
      await expect(panel).toContainText(
        copy.predicates["budget.approval_required"],
      );
      await expect(
        page.getByRole("button", { name: copy.reviewAction, exact: true }),
      ).toBeDisabled();
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `a pending hold retains its original version and exact read-only proposal`,
    { tag: ["@B05-A", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const copy = getAdminCopy(locale);
      await signIn(page, "admin", locale);
      await b05Select(page, 8, locale);
      const originalVersion = await page
        .locator('input[name="expectedVersion"]')
        .inputValue();
      await page
        .getByLabel(copy.reason)
        .fill("Preserve this exact synthetic raw object until review.");
      await page
        .getByLabel(copy.holdExpiry, { exact: true })
        .fill("2027-01-18T16:00");
      await page.locator('input[name="reviewAttested"]').check();
      await page
        .getByRole("button", { name: copy.reviewAction, exact: true })
        .click();
      await page
        .getByRole("button", { name: b05Confirm(locale, 8), exact: true })
        .click();
      await expect(page.getByRole("status").last()).toContainText(
        copy.actionPending,
      );
      await expect(page.locator('input[name="expectedVersion"]')).toHaveValue(
        originalVersion,
      );
      const href = await page
        .getByRole("link", { name: copy.pendingLink, exact: true })
        .getAttribute("href");
      expect(href).toContain("version=" + originalVersion);
      await page
        .getByRole("link", { name: copy.pendingLink, exact: true })
        .click();
      await expect(page.getByLabel(copy.reason)).toHaveAttribute(
        "readonly",
        "",
      );
      await expect(
        page.getByLabel(copy.holdExpiry, { exact: true }),
      ).toHaveValue("2027-01-18T16:00");
      await expect(
        page.locator('input[name="reviewAttested"]'),
      ).not.toBeChecked();
      await page.locator('input[name="reviewAttested"]').check();
      await page
        .getByRole("button", { name: copy.reviewAction, exact: true })
        .click();
      await page
        .getByRole("button", { name: b05Confirm(locale, 8, true), exact: true })
        .click();
      await expect(page.getByRole("main").getByRole("alert")).toContainText(
        copy.errors.DIFFERENT_FOUNDER_REQUIRED,
      );
      await page
        .getByRole("main")
        .getByRole("button", {
          name: pick(locale, "Sign out", "تسجيل الخروج"),
          exact: true,
        })
        .click();
      await page
        .getByLabel(pick(locale, "Email address", "البريد الإلكتروني"))
        .fill("second-admin@example.invalid");
      await page
        .getByRole("button", {
          name: pick(locale, "Continue", "متابعة"),
          exact: true,
        })
        .click();
      await page.getByRole("checkbox").check();
      await page
        .getByRole("button", {
          name: pick(
            locale,
            "Accept all and continue to UniMind",
            "الموافقة والمتابعة إلى UniMind",
          ),
          exact: true,
        })
        .click();
      await b05Select(page, 8, locale);
      await expect(page.getByLabel(copy.reason)).toHaveValue(
        "Preserve this exact synthetic raw object until review.",
      );
      await expect(
        page.getByLabel(copy.holdExpiry, { exact: true }),
      ).toHaveAttribute("readonly", "");
      await expect(page.locator('input[name="expectedVersion"]')).toHaveValue(
        originalVersion,
      );
      await expect(
        page.locator('input[name="reviewAttested"]'),
      ).not.toBeChecked();
      await page.locator('input[name="reviewAttested"]').check();
      await page
        .getByRole("button", { name: copy.reviewAction, exact: true })
        .click();
      await page
        .getByRole("button", { name: b05Confirm(locale, 8, true), exact: true })
        .click();
      await expect(
        page.getByText(copy.actionSuccess, { exact: true }),
      ).toBeVisible();
      for (const query of [
        href!.replace(/version=\d+/u, "version=999"),
        href! + "&decision=sample-hide",
        href!.replace("sample-hold", "foreign"),
      ]) {
        await page.evaluate((url) => history.pushState(null, "", url), query);
        await expect(page.getByRole("main").getByRole("alert")).toContainText(
          copy.invalidSelection,
        );
        await expect(page.getByLabel(copy.reason)).toHaveCount(0);
      }
      await signIn(page, "admin", locale);
      await expect(page.locator("#decision-list li")).toHaveCount(12);
      await page.evaluate((url) => history.pushState(null, "", url), href!);
      await expect(page.getByRole("main").getByRole("alert")).toContainText(
        copy.invalidSelection,
      );
      await expect(page.getByLabel(copy.reason)).toHaveCount(0);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `queue recheck submits nothing and low decisions reveal their details`,
    { tag: ["@B05-A", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const copy = getAdminCopy(locale);
      await signIn(page, "admin", locale, "/admin?fixture=error-page");
      await expect(
        page.getByRole("heading", { name: copy.unavailableTitle, exact: true }),
      ).toBeVisible();
      // An unavailable queue shows no decisions and nothing to act on.
      await expect(page.locator("#decision-list")).toHaveCount(0);
      await expect(page.getByLabel(copy.reason)).toHaveCount(0);
      await page
        .getByRole("button", { name: copy.recheckQueue, exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: copy.checkingState, exact: true }),
      ).toBeDisabled();
      await expect(page.getByRole("status")).toContainText(copy.recheckDone);
      await expect(page.locator("#decision-list li")).toHaveCount(12);
      for (const index of [8, 9]) {
        await b05Select(page, index, locale);
        const bounds = await page
          .locator("#decision-detail-heading")
          .boundingBox();
        expect(bounds!.y).toBeGreaterThanOrEqual(0);
        expect(bounds!.y).toBeLessThan(844);
        await expect(page.locator("#decision-detail-heading")).toBeInViewport();
        await page
          .locator("#decision-list")
          .getByRole("button", {
            name: new RegExp("^" + copy.actions[b05Actions[index]!]),
          })
          .press("Enter");
        await expect(page.locator("#decision-detail-heading")).toBeFocused();
        await expect(page.locator("#decision-detail-heading")).toBeInViewport();
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await page
        .getByRole("button", {
          name: pick(locale, "Back to decisions", "العودة إلى القرارات"),
          exact: true,
        })
        .click();
      await expect(
        page.locator("#decision-list [aria-pressed='true']"),
      ).toBeFocused();
      await b05Select(page, 8, locale);
      await expect(page.getByLabel(copy.reason)).toBeVisible();
      for (const fixture of ["stale", "error"]) {
        await signIn(page, "admin", locale, `/admin?fixture=${fixture}`);
        await b05Select(page, 1, locale);
        await page
          .getByLabel(copy.reason)
          .fill("Contain this exact synthetic object during review.");
        await page
          .getByRole("button", { name: copy.reviewAction, exact: true })
          .click();
        await page
          .getByRole("button", { name: b05Confirm(locale, 1), exact: true })
          .click();
        await expect(page.getByRole("main").getByRole("alert")).toContainText(
          fixture === "stale"
            ? copy.errors.STALE_VERSION
            : copy.errors.UNAVAILABLE,
        );
        await expect(
          page.getByText(copy.actionSuccess, { exact: true }),
        ).toHaveCount(0);
        await page
          .getByRole("button", { name: copy.reloadQueue, exact: true })
          .click();
        await b05Select(page, 1, locale);
        await expect(
          page.getByRole("button", { name: copy.reviewAction, exact: true }),
        ).toBeEnabled();
        await expect(
          page.getByText(copy.actionSuccess, { exact: true }),
        ).toHaveCount(0);
      }
      await signIn(
        page,
        "second-admin",
        locale,
        "/admin?fixture=missing-pending-expiry",
      );
      await b05Select(page, 8, locale);
      await expect(page.getByRole("main").getByRole("alert")).toContainText(
        copy.missingHoldExpiry,
      );
      await expect(
        page.getByLabel(copy.holdExpiry, { exact: true }),
      ).toHaveAttribute("readonly", "");
      await expect(
        page.getByRole("button", { name: copy.reviewAction, exact: true }),
      ).toBeDisabled();
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `the invitation action promises review`,
    { tag: ["@B01", "@M51", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "admin", locale, "/admin/campaigns");
      await page
        .getByRole("button", {
          name: t("Create campaign", "إنشاء حملة"),
          exact: true,
        })
        .press("Enter");
      const review = page.getByRole("button", {
        name: t("Review invitation example", "مراجعة مثال الدعوة"),
        exact: true,
      });
      await expect(review).toBeDisabled({ timeout: 5_000 });
      await expect(
        page.getByRole("button", {
          name: t("Send invitation", "إرسال الدعوة"),
          exact: true,
        }),
      ).toHaveCount(0);
      const prerequisite = page.getByLabel(
        t(
          "Review fixed expiring campaign-only invitation",
          "مراجعة دعوة ثابتة للحملة فقط محدودة المدة",
        ),
      );
      await prerequisite.press("Space");
      await expect(review).toBeEnabled();
      await review.press("Enter");
      await expect(review).toBeDisabled();
      await expect(page.getByRole("status").last()).toContainText(
        t(
          "Invitation example reviewed. No email, assignment or access grant.",
          "روجع مثال الدعوة. لا بريد أو تكليف أو منح وصول.",
        ),
      );
      await page
        .getByRole("button", {
          name: locale === "en" ? "العربية" : "English",
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("button", {
          name:
            locale === "en"
              ? "مراجعة مثال الدعوة"
              : "Review invitation example",
          exact: true,
        }),
      ).toBeDisabled();
      await expect(page.getByRole("checkbox")).toBeChecked();
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `the fixed cohort control promises configuration review`,
    { tag: ["@B01", "@M51", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "admin", locale, "/admin/cohorts");
      const review = page.getByRole("button", {
        name: t("Review cohort configuration", "مراجعة إعدادات المجموعة"),
        exact: true,
      });
      await expect(review).toBeVisible({ timeout: 5_000 });
      await expect(
        page.getByRole("button", {
          name: t("Save cohort draft", "محاكاة مسودة المجموعة"),
          exact: true,
        }),
      ).toHaveCount(0);
      await expect(page.getByRole("main").getByRole("textbox")).toHaveCount(0);
      await expect(page.getByRole("main").getByRole("combobox")).toHaveCount(0);
      await expect(page.getByRole("main")).toContainText("synthetic-2026-2027");
      await review.press("Enter");
      await review.press("Enter");
      await expect(page.getByRole("status")).toHaveCount(1);
      await expect(page.getByRole("status")).toContainText(
        t(
          "Cohort configuration reviewed. No cohort unlocked.",
          "تمت مراجعة إعدادات المجموعة. لم تُفتح المجموعة.",
        ),
      );
      await page
        .getByRole("button", {
          name: locale === "en" ? "العربية" : "English",
          exact: true,
        })
        .click();
      await expect(page.getByRole("status")).toContainText(
        locale === "en"
          ? "تمت مراجعة إعدادات المجموعة"
          : "Cohort configuration reviewed",
      );
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `conflict preview opens its supported disagreement and keeps ordinary work`,
    { tag: ["@B01", "@M51", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "admin", locale, unit + "/chat");
      await expect(
        page.getByRole("button", {
          name: t("Two source excerpts", "نصان من مصدرين"),
          exact: true,
        }),
      ).toHaveCount(0);
      await send(page, "supported", locale);
      const originalDraft = t(
        "Synthetic original unsent draft.",
        "مسودة أصلية تجريبية لم تُرسل.",
      );
      await page
        .getByRole("textbox", { name: t("Message", "السؤال"), exact: true })
        .fill(originalDraft);
      await page
        .getByRole("link", {
          name: t("Return to Admin", "العودة للإدارة"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: t("Decision queue", "قائمة القرارات"),
          exact: true,
        }),
      ).toBeVisible();
      await adminNavigate(page, "/admin/jobs", locale);
      await adminNavigate(page, "/admin/quality", locale);
      await page
        .getByRole("link", {
          name: t("Inspect student conflict example", "فحص مثال تعارض الطالب"),
          exact: true,
        })
        .press("Enter");
      const citation = page.getByRole("button", {
        name: t("Two source excerpts", "نصان من مصدرين"),
        exact: true,
      });
      await expect(citation).toBeVisible({ timeout: 5_000 });
      await expect(
        page.getByRole("region", {
          name: t("Conversation", "المحادثة الحالية"),
          exact: true,
        }),
      ).toContainText(localized(answerExamples.conflict, locale));
      await expect(
        page.getByRole("textbox", {
          name: t("Message", "السؤال"),
          exact: true,
        }),
      ).toHaveValue("");
      await expect(page.locator('article[id^="exchange-"]')).toHaveCount(1);
      await citation.press("Enter");
      const dialog = page.getByRole("dialog");
      await expect(dialog.locator("blockquote")).toHaveCount(2);
      const evidence = dialog.getByRole("link", {
        name: t("Open evidence details", "فتح تفاصيل الأدلة"),
        exact: true,
      });
      await expect(evidence).toHaveAttribute("href", /exchange=1&session=2/u);
      await page.keyboard.press("Escape");
      await expect(citation).toBeFocused();
      await citation.press("Enter");
      await evidence.click();
      await expect(page).toHaveURL(/\/evidence\?exchange=1&session=2/u);
      await expect(page.getByRole("main")).toContainText(
        t("Practical 3 recording", "تسجيل العملي 3"),
      );
      await page
        .getByRole("link", {
          name: t("Return to Chat", "العودة للمحادثة"),
          exact: true,
        })
        .click();
      await expect(citation).toBeVisible();
      await openSessionTools(page, locale);
      await expect(
        page.getByRole("button", {
          name: new RegExp(t("Session [0-9]", "جلسة [٠-٩0-9]")),
        }),
      ).toHaveCount(2);
      await page
        .getByRole("button", { name: new RegExp(t("Session 1", "جلسة 1")) })
        .click();
      await expect(
        page.getByRole("textbox", {
          name: t("Message", "السؤال"),
          exact: true,
        }),
      ).toHaveValue(originalDraft);
      await expect(
        page.getByRole("button", {
          name: t("Lecture 6, p. 14", "المحاضرة 6، ص ١٤"),
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByRole("link", {
          name: t("Return to Admin", "العودة للإدارة"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: t("Quality", "الجودة"),
          exact: true,
        }),
      ).toBeVisible();
      await adminNavigate(page, "/admin/jobs", locale);
      await adminNavigate(page, "/admin/quality", locale);
      await page
        .getByRole("link", {
          name: t("Inspect student conflict example", "فحص مثال تعارض الطالب"),
          exact: true,
        })
        .click();
      await expect(citation).toBeVisible();
      await expect(page.locator('article[id^="exchange-"]')).toHaveCount(1);
      await openSessionTools(page, locale);
      await expect(
        page.getByRole("button", {
          name: new RegExp(t("Session [0-9]", "جلسة [٠-٩0-9]")),
        }),
      ).toHaveCount(2);
      finish();
    },
  );
});

inLocales(["ar"], (locale) => {
  test(
    `unavailable and non-admin views cannot prepare the conflict`,
    { tag: ["@B01", "@M51", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      for (const [role, path] of [
        ["student", "/admin/quality"],
        ["leader", "/admin/quality"],
        ["admin", "/admin/quality?fixture=wrong-scope"],
      ]) {
        await signIn(page, role, locale, path);
        await expect(page.getByRole("main")).toContainText(
          t("Access unavailable", "الوصول غير متاح"),
        );
        await expect(
          page.getByRole("link", {
            name: t(
              "Inspect student conflict example",
              "فحص مثال تعارض الطالب",
            ),
            exact: true,
          }),
        ).toHaveCount(0);
        await expect(
          page.getByRole("button", {
            name: t("Two source excerpts", "نصان من مصدرين"),
            exact: true,
          }),
        ).toHaveCount(0);
      }
      finish();
    },
  );
});

inLocales(["en"], (locale) => {
  test(
    `capacity preview retains its prepared unavailable result`,
    { tag: ["@B01", "@M51", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "admin", locale, "/admin/usage");
      await page
        .getByRole("link", {
          name: t("Preview capacity delay", "معاينة تأخير السعة"),
          exact: true,
        })
        .click();
      await expect(page.getByRole("main")).toContainText(
        t("Capacity is temporarily unavailable", "السعة غير متاحة مؤقتًا"),
      );
      await expect(
        page.getByRole("link", {
          name: t("Return to Admin", "العودة للإدارة"),
          exact: true,
        }),
      ).toBeVisible();
      finish();
    },
  );
});

test(
  `a second admin can inspect the same fixed conflict`,
  { tag: ["@B01", "@M51"] },
  async ({ page }) => {
    const finish = isolation(page);
    await signIn(page, "second-admin", "en", "/admin/quality");
    await page
      .getByRole("link", {
        name: "Inspect student conflict example",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", { name: "Two source excerpts", exact: true }),
    ).toBeVisible();
    await expect(page.locator('article[id^="exchange-"]')).toHaveCount(1);
    await page
      .getByRole("link", { name: "Return to Admin", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Quality", exact: true }),
    ).toBeVisible();
    finish();
  },
);

test(
  `changed availability removes the unsupported preview action`,
  { tag: ["@B01", "@M51"] },
  async ({ page }) => {
    const finish = isolation(page);
    await signIn(page, "admin");
    await changeAdmin(page, "hide");
    await adminNavigate(page, "/admin/jobs", "en");
    await adminNavigate(page, "/admin/quality", "en");
    await expect(page.getByRole("main")).toContainText(
      "Conflict review is unavailable for this unit's current source and access state.",
    );
    await expect(
      page.getByRole("link", {
        name: "Inspect student conflict example",
        exact: true,
      }),
    ).toHaveCount(0);
    finish();
  },
);

inLocales(["en"], (locale) => {
  for (const kind of ["reason", "expiry"] as const)
    test(
      `an ordinary ${kind} change reaches a distinct founder review`,
      { tag: ["@B01", "@M52", `@${locale}`] },
      async ({ page }) => {
        const finish = isolation(page);
        const t = bilingual(locale);
        await signIn(page, "admin", locale);
        await page
          .getByRole("button", {
            name: new RegExp(
              kind === "reason"
                ? t("^Remove raw-data hold", "^إزالة حجز البيانات الخام")
                : t("^Place raw-data hold", "^وضع حجز على البيانات الخام"),
            ),
          })
          .click();
        const reason = t(
          "Synthetic hold review is complete.",
          "اكتملت مراجعة تعليق الحذف التجريبية.",
        );
        const reasonInput = page.getByLabel(
          t("Reason for this change", "سبب هذا التغيير"),
        );
        const review = page.getByRole("button", {
          name: t("Review exact change", "مراجعة التغيير المحدد"),
          exact: true,
        });
        await reasonInput.fill("   a    ");
        await review.press("Enter");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(reasonInput).toHaveValue("   a    ");
        await reasonInput.fill(
          kind === "reason"
            ? reason
            : t("Synthetic readiness review.", "مراجعة جاهزية تجريبية."),
        );
        const expiryValue =
          locale === "en" ? "2026-10-18T16:00" : "2027-01-18T16:00";
        if (kind === "expiry") {
          await page
            .getByLabel(
              t("Hold expiry and review date", "تاريخ انتهاء الحجز ومراجعته"),
              { exact: true },
            )
            .fill(expiryValue);
          await review.press("Enter");
          await expect(page.getByRole("dialog")).toHaveCount(0);
          await page.locator('input[name="reviewAttested"]').check();
        }
        await review.press("Enter");
        await page
          .getByRole("button", {
            name: t("Cancel and edit", "إلغاء والعودة للتعديل"),
            exact: true,
          })
          .click();
        await expect(review).toBeFocused();
        await expect(reasonInput).toHaveValue(
          kind === "reason"
            ? reason
            : t("Synthetic readiness review.", "مراجعة جاهزية تجريبية."),
        );
        await page
          .getByRole("button", {
            name: t("Review exact change", "مراجعة التغيير المحدد"),
            exact: true,
          })
          .click();
        await page
          .getByRole("button", {
            name:
              t("Confirm this exact change", "تأكيد هذا التغيير المحدد") +
              ": " +
              getAdminCopy(locale).actions[
                kind === "reason" ? "REMOVE_RAW_HOLD" : "PLACE_RAW_HOLD"
              ],
            exact: true,
          })
          .click();
        await expect(page.getByRole("status").last()).toContainText(
          t("distinct founder", "مؤسس مختلف"),
          { timeout: 5_000 },
        );
        const pendingReason =
          kind === "reason"
            ? reason
            : t("Synthetic readiness review.", "مراجعة جاهزية تجريبية.");
        await expect(reasonInput).toHaveValue(pendingReason);
        await expect(reasonInput).toHaveAttribute("readonly", "");
        const expiryInput = page.getByLabel(
          t("Hold expiry and review date", "تاريخ انتهاء الحجز ومراجعته"),
          { exact: true },
        );
        if (kind === "expiry") {
          await expect(expiryInput).toHaveValue(expiryValue);
          await expect(expiryInput).toHaveAttribute("readonly", "");
        }
        await page
          .getByRole("main")
          .getByRole("button", {
            name: t("Sign out", "تسجيل الخروج"),
            exact: true,
          })
          .click();
        await page
          .getByLabel(t("Email address", "البريد الإلكتروني"))
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
            name: new RegExp(
              kind === "reason"
                ? t("^Remove raw-data hold", "^إزالة حجز البيانات الخام")
                : t("^Place raw-data hold", "^وضع حجز على البيانات الخام"),
            ),
          })
          .click();
        await expect(reasonInput).toHaveValue(pendingReason);
        await expect(reasonInput).toHaveAttribute("readonly", "");
        if (kind === "expiry") {
          await expect(expiryInput).toHaveValue(expiryValue);
          await expect(expiryInput).toHaveAttribute("readonly", "");
          await expect(
            page.locator('input[name="reviewAttested"]'),
          ).not.toBeChecked();
          await review.press("Enter");
          await expect(page.getByRole("dialog")).toHaveCount(0);
          await page.locator('input[name="reviewAttested"]').press("Space");
        }
        await review.press("Enter");
        await expect(page.getByRole("dialog")).toContainText(pendingReason);
        if (kind === "expiry")
          await expect(page.getByRole("dialog")).toContainText(expiryValue);
        await page
          .getByRole("button", {
            name:
              t(
                "Add my separate founder confirmation",
                "إضافة تأكيدي كمؤسس مستقل",
              ) +
              ": " +
              getAdminCopy(locale).actions[
                kind === "reason" ? "REMOVE_RAW_HOLD" : "PLACE_RAW_HOLD"
              ],
            exact: true,
          })
          .press("Enter");
        await expect(page.getByRole("status").last()).toContainText(
          t("governed change", "التغيير الحوكمي"),
        );
        // Audit settled colours, not a dialog fade still in progress.
        await page.waitForFunction(() =>
          document
            .getAnimations()
            .every((animation) => animation.playState !== "running"),
        );
        finish();
      },
    );
});

inLocales(["ar"], (locale) => {
  test(
    `a failed hold retains the draft and submitted keys`,
    { tag: ["@B01", "@M52", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const t = bilingual(locale);
      await signIn(page, "admin", locale, "/admin?fixture=error");
      await page
        .getByRole("button", {
          name: new RegExp(
            t("^Place raw-data hold", "^وضع حجز على البيانات الخام"),
          ),
        })
        .click();
      const reason = page.getByLabel(
        t("Reason for this change", "سبب هذا التغيير"),
      );
      const expiry = page.getByLabel(
        t("Hold expiry and review date", "تاريخ انتهاء الحجز ومراجعته"),
        { exact: true },
      );
      const attestation = page.locator('input[name="reviewAttested"]');
      await reason.fill("Synthetic preservation review.");
      await expiry.fill("2027-01-18T16:00");
      await attestation.check();
      await page
        .getByRole("button", {
          name: t("Review exact change", "مراجعة التغيير المحدد"),
          exact: true,
        })
        .click();
      await page
        .getByRole("button", {
          name: t(
            "Confirm this exact change: Place raw-data hold",
            "تأكيد هذا التغيير المحدد: وضع حجز على البيانات الخام",
          ),
          exact: true,
        })
        .click();
      await expect(page.getByRole("main").getByRole("alert")).toContainText(
        t("could not be verified", "تعذّر التحقق"),
      );
      await expect(reason).toHaveValue("Synthetic preservation review.");
      await expect(expiry).toHaveValue("2027-01-18T16:00");
      await expect(attestation).toBeChecked();
      const requestKey = page.locator('input[name="idempotencyKey"]');
      const correlation = page.locator('input[name="correlationId"]');
      await expect(requestKey).toHaveValue(/^[a-f0-9-]{36}$/u);
      await expect(correlation).toHaveValue(/^[a-f0-9-]{36}$/u);
      await expect(
        page.getByRole("button", {
          name: t("Review exact change", "مراجعة التغيير المحدد"),
          exact: true,
        }),
      ).toBeDisabled();
      finish();
    },
  );
});

test(
  `malformed expiry and altered pending metadata cannot be confirmed`,
  { tag: ["@B01", "@M52"] },
  async ({ page }) => {
    const finish = isolation(page);
    for (const field of [
      "malformedExpiry",
      "reason",
      "holdExpiresAt",
    ] as const) {
      await signIn(page, "admin");
      await page
        .getByRole("button", { name: /^Place raw-data hold /u })
        .click();
      await page
        .getByLabel("Reason for this change")
        .fill("Synthetic preservation review.");
      await page
        .getByLabel("Hold expiry and review date", { exact: true })
        .fill("2027-01-18T16:00");
      await page.locator('input[name="reviewAttested"]').check();
      await page
        .getByRole("button", { name: "Review exact change", exact: true })
        .click();
      if (field === "malformedExpiry") {
        await page
          .locator('form:has(input[name="holdExpiresAtLocal"])')
          .evaluate((form) => {
            form.addEventListener(
              "formdata",
              (event) => {
                (event as FormDataEvent).formData.set("holdExpiresAt", "1");
              },
              { once: true },
            );
          });
      }
      await page
        .getByRole("button", {
          name: "Confirm this exact change: Place raw-data hold",
          exact: true,
        })
        .click();
      if (field === "malformedExpiry") {
        await expect(page.getByRole("main").getByRole("alert")).toContainText(
          "valid value",
        );
        await expect(
          page.getByLabel("Hold expiry and review date", { exact: true }),
        ).toHaveValue("2027-01-18T16:00");
        await expect(
          page
            .getByRole("status")
            .filter({ hasText: "Waiting for a distinct founder confirmation" }),
        ).toHaveCount(0);
        continue;
      }
      await expect(page.getByRole("status").last()).toContainText(
        "distinct founder",
      );
      await page
        .getByRole("button", { name: "Reload current decisions", exact: true })
        .click();
      await page
        .getByRole("button", { name: /^Place raw-data hold /u })
        .click();
      await page.locator('input[name="reviewAttested"]').check();
      await page
        .getByRole("button", { name: "Review exact change", exact: true })
        .click();
      await page
        .getByRole("button", {
          name: "Add my separate founder confirmation: Place raw-data hold",
          exact: true,
        })
        .click();
      await expect(page.getByRole("main").getByRole("alert")).toContainText(
        "distinct founder",
      );
      await page
        .getByRole("main")
        .getByRole("button", { name: "Sign out", exact: true })
        .click();
      await page
        .getByLabel("Email address")
        .fill("second-admin@example.invalid");
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await page.getByRole("checkbox").check();
      await page
        .getByRole("button", {
          name: "Accept all and continue to UniMind",
          exact: true,
        })
        .click();
      await page
        .getByRole("button", { name: /^Place raw-data hold /u })
        .click();
      await expect(
        page.locator('input[name="reviewAttested"]'),
      ).not.toBeChecked();
      await page.locator('input[name="reviewAttested"]').check();
      await page
        .getByRole("button", { name: "Review exact change", exact: true })
        .click();
      // Alter only the submitted payload, as an untrusted client could. The
      // read-only UI is not the authority for matching the captured proposal.
      await page
        .locator('form:has(input[name="holdExpiresAtLocal"])')
        .evaluate((form, name) => {
          form.addEventListener(
            "formdata",
            (event) => {
              (event as FormDataEvent).formData.set(
                name,
                name === "reason"
                  ? "A different synthetic reason."
                  : "2027-02-18T16:00:00.000Z",
              );
            },
            { once: true },
          );
        }, field);
      await page
        .getByRole("button", {
          name: "Add my separate founder confirmation: Place raw-data hold",
          exact: true,
        })
        .click();
      await expect(page.getByRole("main").getByRole("alert")).toContainText(
        "different details",
      );
      await expect(page.getByLabel("Reason for this change")).toHaveValue(
        "Synthetic preservation review.",
      );
      await expect(
        page.getByLabel("Hold expiry and review date", { exact: true }),
      ).toHaveValue("2027-01-18T16:00");
      await expect(
        page
          .getByRole("status")
          .filter({ hasText: "Waiting for a distinct founder confirmation" }),
      ).toBeVisible();
    }
    finish();
  },
);

test(
  `admin changes share availability, preserve distinct confirmation and block enablement`,
  { tag: ["@demo-core"] },
  async ({ page }) => {
    const finish = isolation(page);
    await signIn(page, "admin");
    await page.getByRole("button", { name: /Hide unit/u }).click();
    await page
      .getByLabel("Reason for this change")
      .fill("Synthetic readiness review.");
    await page
      .getByRole("button", { name: "Review exact change", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Submit this action: Hide unit",
        exact: true,
      })
      .click();
    await expect(
      page.getByText("The governed change was recorded."),
    ).toBeVisible();
    await page.getByRole("button", { name: /Publish unit/u }).click();
    await page
      .getByLabel("Reason for this change")
      .fill("Synthetic readiness review.");
    await page
      .getByRole("button", { name: "Review exact change", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Confirm this exact change: Publish unit",
        exact: true,
      })
      .click();
    await expect(
      page.getByText(
        "The request is recorded and needs a distinct founder confirmation.",
      ),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Sign out", exact: true })
      .first()
      .click();
    await page.getByLabel("Email address").fill("second-admin@example.invalid");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", {
        name: "Accept all and continue to UniMind",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: /Publish unit/u }).click();
    await page
      .getByRole("button", { name: "Review exact change", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Add my separate founder confirmation: Publish unit",
        exact: true,
      })
      .click();
    await expect(
      page.getByText("The governed change was recorded."),
    ).toBeVisible();
    await page
      .getByRole("button", { name: /Enable approved mock artifact/u })
      .click();
    await expect(
      page.getByRole("button", { name: "Review exact change", exact: true }),
    ).toBeDisabled();
    finish();
  },
);

inLocales(["ar"], (locale) => {
  test(
    `admin sections keep resources, the phone menu and accessible decisions`,
    { tag: ["@demo-core", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      await signIn(page, "admin", locale);
      const routes = [
        ["/admin", "Decision queue", "قائمة القرارات"],
        ["/admin/sources", "Sources", "المصادر"],
        ["/admin/campaigns", "Campaigns", "الحملات"],
        ["/admin/catalog", "Catalog", "الفهرس"],
        ["/admin/cohorts", "Cohorts", "المجموعات الدراسية"],
        ["/admin/cohorts?view=users", "Access context", "سياق الوصول"],
        ["/admin/jobs", "Jobs", "المهام"],
        ["/admin/quality", "Quality", "الجودة"],
        ["/admin/usage", "Usage", "الاستخدام"],
        ["/admin/incidents", "Incidents", "الحوادث"],
      ] as const;
      for (const [destination, en, ar] of routes) {
        if (destination !== "/admin")
          await adminNavigate(page, destination, locale);
        await expect(page.locator("h1")).toHaveText(pick(locale, en, ar));
        await expect(page.locator("main")).toHaveAttribute(
          "dir",
          locale === "ar" ? "rtl" : "ltr",
        );
      }
      // The phone layout keeps decisions behind a menu that closes on Escape.
      await page.setViewportSize({ width: 390, height: 900 });
      await adminNavigate(page, "/admin", locale);
      await page
        .getByRole("button", {
          name: new RegExp(pick(locale, "^Hide unit", "^إخفاء الوحدة")),
        })
        .click();
      await page
        .getByLabel(pick(locale, "Reason for this change", "سبب هذا التغيير"))
        .fill(
          pick(locale, "Synthetic readiness review.", "مراجعة جاهزية تجريبية."),
        );
      await page
        .getByRole("button", {
          name: pick(locale, "Review exact change", "مراجعة التغيير المحدد"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("heading", {
          name: pick(locale, "Review before recording", "راجع قبل التسجيل"),
          exact: true,
        }),
      ).toBeFocused();
      await page
        .getByRole("button", {
          name: pick(locale, "Cancel and edit", "إلغاء والعودة للتعديل"),
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("button", {
          name: pick(locale, "Review exact change", "مراجعة التغيير المحدد"),
          exact: true,
        }),
      ).toBeFocused();
      const menu = page
        .locator("summary")
        .filter({ hasText: pick(locale, "Menu", "القائمة") });
      await menu.click();
      await page.keyboard.press("Escape");
      await expect(
        page.locator("details").filter({ has: menu }),
      ).not.toHaveAttribute("open", "");
      await expect(menu).toBeFocused();
      finish();
    },
  );
});

test(
  `resource reviews and Users context preserve the isolated workflow`,
  { tag: ["@demo-core"] },
  async ({ page }) => {
    const finish = isolation(page);
    await signIn(page, "admin");
    await adminNavigate(page, "/admin/catalog", "en");
    await page.getByLabel("Configured unit label").selectOption("SUBJECT");
    await page
      .getByRole("button", { name: "Review changes", exact: true })
      .click();
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(
      "Sample catalog draft saved",
    );
    await adminNavigate(page, "/admin/cohorts", "en");
    await page
      .getByRole("button", { name: "Review cohort configuration", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("No cohort unlocked");
    await adminNavigate(page, "/admin/cohorts?view=users", "en");
    await expect(
      page.getByRole("heading", { name: "Assignment and access context" }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Review campaign invitations" })
      .click();
    await page
      .getByRole("button", { name: "Create campaign", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Review invitation example",
        exact: true,
      }),
    ).toBeDisabled();
    await page
      .getByLabel("Review fixed expiring campaign-only invitation")
      .check();
    await page
      .getByRole("button", { name: "Review invitation example", exact: true })
      .click();
    await expect(
      page.getByText(
        "Invitation example reviewed. No email, assignment or access grant.",
      ),
    ).toBeVisible();
    finish();
  },
);

test(
  `all twelve governed examples keep distinct confirmations and preserved pending reload`,
  { tag: ["@demo-core"] },
  async ({ page }) => {
    const finish = isolation(page);
    await signIn(page, "admin");
    for (const id of [
      "hide",
      "lock",
      "deactivate",
      "quarantine",
      "retry",
      "disable",
    ]) {
      await changeAdmin(page, id);
      await expect(page.getByRole("status").last()).toContainText(
        id === "retry" ? "retry request" : "governed change",
      );
    }
    for (const id of ["publish", "unlock", "activate", "hold", "remove-hold"]) {
      await changeAdmin(page, id);
      await expect(page.getByRole("status").last()).toContainText(
        "distinct founder",
      );
    }
    await page
      .getByRole("button", { name: "Reload current decisions", exact: true })
      .click();
    await page.getByRole("button", { name: /Publish unit/u }).click();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "Waiting for a distinct founder confirmation" }),
    ).toBeVisible();
    await changeAdmin(page, "publish", true);
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "distinct founder",
    );
    await switchAdmin(page, "second-admin@example.invalid");
    for (const id of ["publish", "unlock", "activate", "hold", "remove-hold"]) {
      await changeAdmin(page, id, true);
      await expect(page.getByRole("status").last()).toContainText(
        "governed change",
      );
    }
    await page
      .getByRole("button", { name: /Enable approved mock artifact/u })
      .click();
    await expect(
      page.getByRole("button", { name: "Review exact change", exact: true }),
    ).toBeDisabled();
    finish();
  },
);

test(
  `stale, failed-readiness and unavailable actions never change the candidate`,
  { tag: ["@demo-core"] },
  async ({ page }) => {
    const finish = isolation(page);
    for (const fixture of ["stale", "blocked", "error"]) {
      await signIn(page, "admin", "en", `/admin?fixture=${fixture}`);
      if (fixture === "blocked") {
        await page.getByRole("button", { name: /Hide unit/u }).click();
        await expect(
          page.getByRole("button", {
            name: "Review exact change",
            exact: true,
          }),
        ).toBeDisabled();
      } else {
        await changeAdmin(page, "hide");
        await expect(page.getByRole("main").getByRole("alert")).toContainText(
          fixture === "stale" ? "changed" : "could not be verified",
        );
      }
    }
    finish();
  },
);

for (const role of ["admin", "second-admin"]) {
  test(
    `no implicit decision, local filtering and safe modal focus for ${role}`,
    { tag: ["@open-folio"] },
    async ({ page }) => {
      const finish = isolation(page);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await signIn(page, role);
      await expect(page.getByLabel("Reason for this change")).toHaveCount(0);
      await page
        .getByLabel("Find a decision", { exact: true })
        .fill("Hide unit");
      const target = page.getByRole("button", { name: /^Hide unit/u });
      await expect(target).toHaveCount(1);
      await target.click();
      await page
        .getByLabel("Reason for this change")
        .fill("Synthetic presentation review; no submission.");
      const review = page.getByRole("button", {
        name: "Review exact change",
        exact: true,
      });
      await review.click();
      const dialog = page.getByRole("dialog", {
        name: "Review before recording",
        exact: true,
      });
      await expect(dialog.getByRole("heading", { level: 2 })).toBeFocused();
      await expect(
        dialog.getByText("Expected version", { exact: true }),
      ).toBeVisible();
      await expect(
        dialog.getByText("No failed readiness checks", { exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(review).toBeFocused();
      await expect(
        page.getByText("The governed change was recorded."),
      ).toHaveCount(0);
      finish();
    },
  );
}

// Queue states and announcements of the shared decision queue (formerly
// covered through the retired fixture route), reached through the runtime.
inLocales(["ar"], (locale) => {
  test(
    `empty and forbidden queues fail closed; outcomes and the first founder are announced`,
    { tag: ["@B05-A", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const copy = getAdminCopy(locale);
      await page.setViewportSize({ width: 390, height: 844 });
      for (const [fixture, title] of [
        ["empty", copy.emptyTitle],
        ["forbidden", copy.forbiddenTitle],
      ] as const) {
        await signIn(page, "admin", locale, `/admin?fixture=${fixture}`);
        await expect(
          page.getByRole("heading", { name: title, exact: true }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: copy.reviewAction, exact: true }),
        ).toHaveCount(0);
      }
      await signIn(page, "admin", locale, "/admin?fixture=stale");
      await b05Select(page, 1, locale);
      await page
        .getByLabel(copy.reason)
        .fill("Contain this exact synthetic object during review.");
      await page
        .getByRole("button", { name: copy.reviewAction, exact: true })
        .press("Enter");
      await expect(
        page.getByRole("dialog").getByRole("heading", { level: 2 }),
      ).toBeFocused();
      await page
        .getByRole("button", { name: b05Confirm(locale, 1), exact: true })
        .press("Enter");
      await expect(
        page.getByText(copy.errors.STALE_VERSION, { exact: true }),
      ).toBeFocused();
      await expectReflow(page);
      await signIn(page, "admin", locale);
      await b05Select(page, 8, locale);
      await page
        .getByLabel(copy.reason)
        .fill("Preserve this synthetic object for review.");
      await page
        .getByLabel(copy.holdExpiry, { exact: true })
        .fill("2027-01-18T16:00");
      await page.locator('input[name="reviewAttested"]').check();
      await page
        .getByRole("button", { name: copy.reviewAction, exact: true })
        .click();
      await page
        .getByRole("button", { name: b05Confirm(locale, 8), exact: true })
        .click();
      await page
        .getByRole("button", { name: copy.reloadQueue, exact: true })
        .click();
      await b05Select(page, 8, locale);
      await expect(
        page.getByRole("status").filter({ hasText: copy.pendingFounder }),
      ).toContainText(`${copy.initiatedBy}: ${copy.founderAhmed}`);
      await expect(page.getByLabel(copy.reason)).toHaveAttribute(
        "readonly",
        "",
      );
      finish();
    },
  );
});

// Restored from the retired fixture route's admin-decision-queue spec
// (af8d1fb), reached through the loopback runtime and the shared queue.
inLocales(["en", "ar"], (locale) => {
  test(
    `a persistently unavailable queue stays closed after recheck [${locale}]`,
    { tag: ["@B05-A", `@${locale}`] },
    async ({ page }) => {
      // `isolation` also proves the recheck submits nothing (GET/HEAD only).
      const finish = isolation(page);
      const copy = getAdminCopy(locale);
      await signIn(page, "admin", locale, "/admin?fixture=queue-unavailable");
      const heading = page.getByRole("heading", {
        name: copy.unavailableTitle,
        exact: true,
      });
      const recheck = page.getByRole("button", {
        name: copy.recheckQueue,
        exact: true,
      });
      await expect(heading).toBeVisible();
      for (let attempt = 0; attempt < 2; attempt++) {
        await recheck.click();
        await expect(heading).toBeVisible();
        await expect(recheck).toBeEnabled();
        await expect(page.locator("#decision-list")).toHaveCount(0);
        await expect(page.getByRole("main").getByRole("list")).toHaveCount(0);
        await expect(page.getByLabel(copy.reason)).toHaveCount(0);
        await expect(
          page.getByText(copy.recheckDone, { exact: true }),
        ).toHaveCount(0);
      }
      finish();
    },
  );

  test(
    `blocked readiness reasons are visible text and decision outcomes take focus [${locale}]`,
    { tag: ["@B05-A", `@${locale}`] },
    async ({ page }) => {
      const finish = isolation(page);
      const copy = getAdminCopy(locale);
      await signIn(page, "admin", locale, "/admin?fixture=blocked");
      await b05Select(page, 1, locale);
      for (const predicate of [
        "source.active_ready",
        "source.rights_current",
      ] as const)
        await expect(
          page.getByText(copy.predicates[predicate], { exact: true }),
        ).toBeVisible();
      await expect(
        page.getByRole("button", { name: copy.reviewAction, exact: true }),
      ).toBeDisabled();
      for (const [fixture, message] of [
        ["ready", copy.actionSuccess],
        ["error", copy.errors.UNAVAILABLE],
        ["stale", copy.errors.STALE_VERSION],
      ] as const) {
        await signIn(page, "admin", locale, `/admin?fixture=${fixture}`);
        await b05Select(page, 1, locale);
        await page
          .getByLabel(copy.reason)
          .fill("Contain this exact synthetic object during review.");
        await page
          .getByRole("button", { name: copy.reviewAction, exact: true })
          .click();
        await page
          .getByRole("button", { name: b05Confirm(locale, 1), exact: true })
          .click();
        const feedback = page.getByText(message, { exact: true });
        await expect(feedback).toBeVisible();
        await expect(feedback).toBeFocused();
      }
      finish();
    },
  );
});
