"use client";

import type { ReactNode } from "react";
import type {
  AcademicContext,
  AcademicSaveState,
} from "@/lib/account/account.application";
import type { AuthorizedCatalogRow } from "@/lib/catalog/catalog-journey.application";
import type { Locale } from "@/lib/i18n/locale";
import { AcademicSettings } from "./academic-settings";
import { AccountLayout } from "./account-layout";
import { Appearance } from "./appearance";
import { ChoiceGroup } from "./choice-group";
import { useProductText } from "./product-copy";
import { Notice, ProductLink } from "./product-ui";
import styles from "./product.module.css";
import accountStyles from "./student-account.module.css";

export type SharingMode = "shared" | "private";
export type AccountSettingsRole =
  "student" | "leader" | "admin" | "second-admin";
export type AccountStudyReturn = {
  href: string;
  tool: "chat" | "studio" | "quiz" | "attempt" | "quiz-review";
  unitNameEn: string;
  unitNameAr: string;
};

/**
 * The `/settings` views shared by real routes and the synthetic runtime:
 * appearance, the student's academic path, privacy and account access.
 * `privacy` is null where no sharing backend exists yet; its controls then
 * render disabled.
 */
export function AccountSettings({
  locale,
  name,
  role,
  signOutAction,
  studyReturn,
  studyPath,
  academic,
  privacy,
}: {
  locale: Locale;
  name: string | null;
  role: AccountSettingsRole;
  signOutAction: ReactNode;
  /** The latest study view to return to, if any. */
  studyReturn: AccountStudyReturn | null;
  /** Offer the current study path when there is no study view to return to. */
  studyPath: boolean;
  academic?: {
    rows: readonly AuthorizedCatalogRow[];
    initialContext: AcademicContext | null;
    save: (context: AcademicContext) => Promise<AcademicSaveState>;
  } | null;
  privacy: {
    sharing: SharingMode;
    onSharingChange: (value: SharingMode) => void;
  } | null;
}) {
  const t = useProductText(locale);
  const sectionClass = accountStyles.section;
  const roleLabel = {
    "second-admin": t("Second Admin", "المسؤول الثاني"),
    admin: t("Admin", "مسؤول"),
    leader: t("Batch Leader", "مسؤول الدفعة"),
    student: t("Student", "طالب"),
  }[role];
  const returnLabels = {
    chat: t("Return to Chat", "العودة إلى المحادثة"),
    studio: t("Return to Studio", "العودة إلى الاستوديو"),
    quiz: t("Return to Quiz", "العودة إلى الاختبار"),
    attempt: t("Return to quiz attempt", "العودة إلى محاولة الاختبار"),
    "quiz-review": t("Return to quiz review", "العودة إلى مراجعة الاختبار"),
  };
  return (
    <AccountLayout
      locale={locale}
      identity={{ name, role: roleLabel }}
      signOutAction={signOutAction}
      returnAction={
        studyReturn ? (
          <ProductLink href={studyReturn.href} locale={locale}>
            <span>
              {returnLabels[studyReturn.tool]} ·{" "}
              <bdi>
                {locale === "ar"
                  ? studyReturn.unitNameAr
                  : studyReturn.unitNameEn}
              </bdi>
            </span>
          </ProductLink>
        ) : studyPath ? (
          <ProductLink href="/learn" locale={locale}>
            {t("Open current study path", "فتح المسار الدراسي الحالي")}
          </ProductLink>
        ) : null
      }
      views={[
        {
          id: "appearance",
          label: t("Appearance", "المظهر"),
          content: (
            <section
              id="appearance-settings"
              className={`${sectionClass} ${accountStyles.compactSection}`}
            >
              <h2>{t("Appearance", "المظهر")}</h2>
              <Appearance locale={locale} />
            </section>
          ),
        },
        ...(academic
          ? [
              {
                id: "academic",
                label: t("Academic settings", "الإعدادات الدراسية"),
                content: (
                  <AcademicSettings
                    locale={locale}
                    rows={academic.rows}
                    initialContext={academic.initialContext}
                    save={academic.save}
                  />
                ),
              },
            ]
          : []),
        {
          id: "privacy",
          label: t("Privacy", "الخصوصية"),
          content: (
            <>
              <section id="privacy-settings" className={sectionClass}>
                <h2>
                  {t("Future exchange sharing", "مشاركة المحادثات القادمة")}
                </h2>
                {privacy ? null : (
                  <Notice>
                    {t(
                      "Sharing choices are not available yet. They apply once Chat answers launch.",
                      "خيارات المشاركة غير متاحة بعد. ستُطبق عند إطلاق إجابات المحادثة.",
                    )}
                  </Notice>
                )}
                <ChoiceGroup
                  label={t("Sharing mode", "وضع المشاركة")}
                  value={privacy?.sharing ?? ""}
                  disabled={!privacy}
                  options={[
                    [
                      "shared",
                      t(
                        "Visible to UniMind’s founders",
                        "ظاهرة لمؤسسي UniMind",
                      ),
                    ],
                    ["private", t("Private / no sharing", "خاص / عدم مشاركة")],
                  ]}
                  onChange={(value) =>
                    privacy?.onSharingChange(
                      value === "private" ? "private" : "shared",
                    )
                  }
                />
                <dl className={accountStyles.privacyDetails}>
                  <div>
                    <dt>{t("Earlier exchanges", "المحادثات السابقة")}</dt>
                    <dd>
                      {t(
                        "Earlier exchanges keep their recorded mode.",
                        "تحتفظ المحادثات السابقة بوضعها المسجل.",
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("Saving and retention", "الحفظ والاحتفاظ")}</dt>
                    <dd>
                      {t(
                        "Private mode is separate from saving and retention.",
                        "الخصوصية منفصلة عن الحفظ والاحتفاظ.",
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("Reported exchanges", "المحادثات المبلغ عنها")}</dt>
                    <dd>
                      {t(
                        "Qualifying reports permit audited review of the reported exchange only; the disclosure wording is still being confirmed.",
                        "البلاغ المؤهل يسمح بمراجعة المحادثة المبلغ عنها فقط مع التدقيق؛ صياغة الإفصاح ما زالت قيد التأكيد.",
                      )}
                    </dd>
                  </div>
                </dl>
              </section>
              <section className={sectionClass}>
                <h2>{t("Saving and retention", "الحفظ والاحتفاظ")}</h2>
                <Notice>
                  {t(
                    "Retention settings are still being confirmed. No retention period or deletion action is available here yet.",
                    "إعدادات الاحتفاظ ما زالت قيد التأكيد. لا تتوفر هنا مدة احتفاظ أو إجراءات حذف بعد.",
                  )}
                </Notice>
              </section>
            </>
          ),
        },
        {
          id: "identity",
          label: t("Identity and access", "الهوية والوصول"),
          content: (
            <section
              id="identity-settings"
              className={`${sectionClass} ${accountStyles.compactSection}`}
            >
              <h2>{t("Your account", "حسابك")}</h2>
              <p>
                {t("Manage your account access.", "إدارة الوصول إلى حسابك.")}
              </p>
              <div className={styles.actions}>
                <ProductLink href="/forgot-password" locale={locale}>
                  {t("Reset password", "تغيير كلمة المرور")}
                </ProductLink>
              </div>
            </section>
          ),
        },
      ]}
    />
  );
}
