"use client";

import { useState } from "react";
import { AcademicSettings } from "@/app/_components/academic-settings";
import { AccountLayout } from "@/app/_components/account-layout";
import { Appearance } from "@/app/_components/appearance";
import { ChoiceGroup } from "@/app/_components/choice-group";
import { useProductText } from "@/app/_components/product-copy";
import { useProductProfileName } from "@/app/_components/product-profile";
import { useProductServices } from "@/app/_components/product-services";
import { Button, Notice, ProductLink } from "@/app/_components/product-ui";
import styles from "@/app/_components/product.module.css";
import accountStyles from "@/app/_components/student-account.module.css";
import { authorizedAcademicContext } from "@/lib/account/account.application";
import {
  reviewCatalogRows,
  sampleScopeAvailable,
  type Locale,
} from "@/lib/demo/synthetic-fixtures.application";
import { currentStudyReturn } from "@/lib/demo/synthetic-study-return.application";
import {
  AccessPending,
  FixturePanel,
  RoleChrome,
  accessPending,
  screenAccess,
  useSyntheticScreen,
  type ScreenProps,
} from "../screen-frame";

/** `/settings`: appearance, academic path, privacy and account access. */
export function SettingsScreen(page: ScreenProps) {
  const screen = useSyntheticScreen(page);
  if (accessPending(screen)) return <AccessPending screen={screen} />;
  const access = screenAccess(screen, page);
  return (
    <RoleChrome ctx={screen} access={access} page={page}>
      {access.panel ? (
        <FixturePanel ctx={screen} access={access} page={page} />
      ) : (
        <ProductSettings locale={page.locale} signOut={screen.signedOut} />
      )}
    </RoleChrome>
  );
}

function ProductSettings({
  locale,
  signOut,
}: {
  locale: Locale;
  signOut: () => void;
}) {
  const { state, update } = useProductServices();
  const profileName = useProductProfileName();
  const [studyReturnTime] = useState(() => Date.now());
  const t = useProductText(locale);
  const sectionClass = accountStyles.section;
  const studyReturn = currentStudyReturn(state, studyReturnTime);
  const roleLabel =
    state.role === "second-admin"
      ? t("Second Admin", "المسؤول الثاني")
      : state.role === "admin"
        ? t("Admin", "مسؤول")
        : state.role === "leader"
          ? t("Batch Leader", "مسؤول الدفعة")
          : t("Student", "طالب");
  const returnLabels = {
    chat: t("Return to Chat", "العودة إلى المحادثة"),
    studio: t("Return to Studio", "العودة إلى الاستوديو"),
    quiz: t("Return to Quiz", "العودة إلى الاختبار"),
    attempt: t("Return to quiz attempt", "العودة إلى محاولة الاختبار"),
    "quiz-review": t("Return to quiz review", "العودة إلى مراجعة الاختبار"),
  };
  return (
    <>
      <AccountLayout
        locale={locale}
        identity={{ name: profileName, role: roleLabel }}
        signOutAction={
          <Button variant="quiet" onClick={signOut}>
            {t("Sign out", "تسجيل الخروج")}
          </Button>
        }
        returnAction={
          studyReturn ? (
            <ProductLink href={studyReturn.href} locale={locale}>
              <span>
                {returnLabels[studyReturn.tool]} ·{" "}
                <bdi>
                  {locale === "ar"
                    ? studyReturn.unit.nameAr
                    : studyReturn.unit.nameEn}
                </bdi>
              </span>
            </ProductLink>
          ) : state.role === "student" && state.academicContext ? (
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
          ...(state.role === "student"
            ? [
                {
                  id: "academic",
                  label: t("Academic settings", "الإعدادات الدراسية"),
                  content: (
                    <AcademicSettings
                      locale={locale}
                      rows={reviewCatalogRows.filter((row) =>
                        sampleScopeAvailable(state, row.cohort.id, row.unit.id),
                      )}
                      initialContext={state.academicContext}
                      save={async (context) => {
                        const rows = reviewCatalogRows.filter((row) =>
                          sampleScopeAvailable(
                            state,
                            row.cohort.id,
                            row.unit.id,
                          ),
                        );
                        if (!authorizedAcademicContext(context, rows))
                          return { status: "INVALID" };
                        update((current) => ({
                          ...current,
                          academicContext: context,
                        }));
                        return { status: "SAVED" };
                      }}
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
                {" "}
                <section id="privacy-settings" className={sectionClass}>
                  <h2>
                    {t("Future exchange sharing", "مشاركة المحادثات القادمة")}
                  </h2>
                  <ChoiceGroup
                    label={t("Sharing mode", "وضع المشاركة")}
                    value={state.sharing}
                    options={[
                      [
                        "shared",
                        t(
                          "Founder-visible by default",
                          "ظاهر للمؤسسين افتراضيًا",
                        ),
                      ],
                      [
                        "private",
                        t("Private / no sharing", "خاص / عدم مشاركة"),
                      ],
                    ]}
                    onChange={(value) =>
                      update((current) => ({
                        ...current,
                        sharing: value === "private" ? "private" : "shared",
                      }))
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
                      <dt>
                        {t("Reported exchanges", "المحادثات المبلغ عنها")}
                      </dt>
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
    </>
  );
}
