"use client";
import { useState } from "react";
import {
  defaultScope,
  defaultUnitPath,
  reviewBase,
  resourceNames,
  text,
  type Locale,
} from "./synthetic-fixtures";
import { useProductServices } from "./product-services";
import { Button, Notice, ProductLink, Row, Select } from "./product-ui";
import styles from "./product.module.css";
type Props = { screen: string; locale: Locale; scenario: string };
export function ProductCampaigns({ screen, locale, scenario }: Props) {
  const { state, update } = useProductServices();
  const accepted = state.invitationUsed;
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  if (["expired", "replayed"].includes(scenario))
    return (
      <section className={styles.panel}>
        <Notice error>
          {t(
            "The sample assignment or invitation is expired/already used. No campaign access can be granted. Request a new invitation from the admin in the real product.",
            "التكليف أو الدعوة التجريبية منتهية أو مستخدمة. لا يمكن منح وصول للحملة. اطلب دعوة جديدة من الإدارة في المنتج الحقيقي.",
          )}
        </Notice>
        <ProductLink href={reviewBase + "/batch-leader"} locale={locale}>
          {t("Return to campaigns", "العودة للحملات")}
        </ProductLink>
      </section>
    );
  if (screen === "invitation")
    return (
      <section className={styles.panel}>
        <h2>
          {t("Synthetic Anatomy source call", "حملة مصادر التشريح التجريبية")}
        </h2>
        <p>
          {t(
            "Synthetic Anatomy source call · one cohort and unit · sample expiry date",
            "حملة مصادر تشريح تجريبية · مجموعة ووحدة واحدة · تاريخ انتهاء تجريبي",
          )}
          :{" "}
          {new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
            dateStyle: "medium",
            timeZone: "UTC",
          }).format(new Date("2026-10-10T20:00:00Z"))}
        </p>
        <p>
          {t(
            "This is a synthetic invitation example. Accepting it only updates this demo.",
            "هذا مثال دعوة تجريبية. قبولها يحدّث العرض التجريبي فقط.",
          )}
        </p>
        <div className={styles.actions}>
          <Button
            primary
            disabled={accepted}
            onClick={() =>
              update((current) => ({ ...current, invitationUsed: true }))
            }
          >
            {t("Accept invitation", "قبول الدعوة")}
          </Button>
          <ProductLink href={reviewBase + "/batch-leader"} locale={locale}>
            {t("View campaigns", "عرض الحملات")}
          </ProductLink>
        </div>
        {accepted ? (
          <Notice>
            {t(
              "Invitation accepted · simulated. No real access granted.",
              "تمت مراجعة الدعوة داخل التبويب. لم يمنح وصول.",
            )}
          </Notice>
        ) : null}
      </section>
    );
  return (
    <>
      <p>
        {t(
          "This role sees only fixed sample assignments. No invitations or permissions are fabricated as real access.",
          "هذا الدور يعرض تكليفات تجريبية ثابتة فقط. لا يتم اعتبار الدعوات أو الصلاحيات وصولًا حقيقيًا.",
        )}
      </p>
      <Row
        title={t("Synthetic Anatomy source call", "حملة مصادر تشريح تجريبية")}
        action={
          <ProductLink
            href={reviewBase + "/batch-leader/campaigns/sample-campaign"}
            locale={locale}
          >
            {t("Open assigned campaign", "فتح الحملة المسندة")}
          </ProductLink>
        }
      >
        <p>
          <bdi>
            {locale === "ar"
              ? defaultScope.unitTitleAr
              : defaultScope.unitTitleEn}
          </bdi>{" "}
          · {t("Fixed assigned example", "مثال تكليف ثابت")}
        </p>
        <p>
          {t(
            "Awaiting handout, recording or image with a rights declaration.",
            "بانتظار ملزمة أو تسجيل أو صورة بإقرار حقوق.",
          )}
        </p>
      </Row>
      {state.campaignDraft ? (
        <Row title={t("New campaign draft", "مسودة حملة محاكاة جديدة")}>
          <p>
            {t(
              "Admin draft exists, but no real assignment has been created. Review its invitation from Admin.",
              "توجد مسودة إدارة، لكن لم ينشأ تكليف حقيقي. راجع دعوتها من الإدارة.",
            )}
          </p>
        </Row>
      ) : null}
    </>
  );
}

export function ProductResource({ screen, locale }: Props) {
  const { state, update } = useProductServices();
  const [step, setStep] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [unitType, setUnitType] = useState("MODULE");
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const resource = screen.slice(6) as keyof typeof resourceNames;
  if (!Object.hasOwn(resourceNames, resource)) return null;
  const summaries = {
    sources: [
      "Received → processed verification → independent raw absence proof → deletion audit → indexing → READY. Failed/low-confidence versions remain isolated. Every stage is a fixture, not executed processing; no raw data is exposed.",
      "استلام ← تحقق معالجة ← إثبات مستقل لغياب الخام ← تدقيق حذف ← فهرسة ← جاهز. الإصدارات الفاشلة أو منخفضة الثقة معزولة. كل مرحلة مثال وليست معالجة منفذة؛ لا بيانات خام.",
    ],
    jobs: [
      "Sample job: queued → running → retry wait → completed. A deletion-verification sample remains pending until durable output and independent absence proof. No worker runs; incomplete work cannot claim READY.",
      "مهمة تجريبية: انتظار ← تشغيل ← انتظار محاولة ← مكتمل. مثال تحقق الحذف ينتظر مخرجًا دائمًا وإثبات غياب مستقل. لا عامل يعمل؛ العمل الناقص لا يدعي الجاهزية.",
    ],
    quality: [
      "Sample report checks coverage, locator integrity, terminology and grounding. The recording conflicts with the handout; timing is missing. No academic or production PASS is claimed.",
      "تقرير تجريبي يفحص التغطية والمواضع والمصطلحات والأدلة. التسجيل يتعارض مع الملزمة والتوقيت ناقص. لا ندعي اجتيازًا أكاديميًا أو إنتاجيًا.",
    ],
    usage: [
      "Providers disabled; paid budget zero. Ready, unavailable allowance and delayed capacity examples have no invented numeric limits. No reservation, usage settlement, charge or provider call occurs.",
      "المزودون معطلون؛ الميزانية المدفوعة صفر. أمثلة جاهزية ورصيد غير متاح وسعة متأخرة دون حدود رقمية مختلقة. لا حجز أو تسوية أو رسوم أو اتصال بمزود.",
    ],
    incidents: [
      "Sample source-readiness incident is isolated. Containment may hide a unit, lock a cohort or disable a feature while retaining historical evidence. No alert or notification is sent.",
      "حادثة جاهزية مصدر تجريبية معزولة. الاحتواء قد يخفي وحدة أو يغلق مجموعة أو يعطل ميزة مع حفظ التاريخ. لا تنبيه أو إشعار يرسل.",
    ],
  } as const;
  return (
    <>
      <p>
        {t(
          "Synthetic resource view. Operations, configuration and processing are illustrative; no server resource is edited.",
          "عرض مورد تجريبي. العمليات والإعدادات والمعالجة توضيحية؛ لا يعدل مورد على الخادم.",
        )}
      </p>
      {resource === "catalog" ? (
        <section className={styles.panel}>
          <h2>{t("Catalog configuration example", "مثال إعداد الدليل")}</h2>
          <p>
            {t(
              "Stage → institution/system → program → level → period → cohort/edition → unit. Term-based and flexible-credit terminology comes from configuration.",
              "مرحلة ← مؤسسة أو نظام ← برنامج ← مستوى ← فترة ← مجموعة أو إصدار ← وحدة. المصطلحات من الإعدادات.",
            )}
          </p>
          <Select
            id="catalog-unit-type"
            label={t("Configured unit label", "اسم الوحدة من الإعدادات")}
            value={unitType}
            onChange={setUnitType}
            options={[
              ["MODULE", t("Module", "وحدة دراسية")],
              ["SUBJECT", t("Subject", "مادة دراسية")],
            ]}
          />
          <Button onClick={() => setStep(true)}>
            {t("Review changes", "مراجعة التغييرات")}
          </Button>
          {step ? (
            <>
              <p>
                {t(
                  "Draft terminology only. No publication or membership changes.",
                  "مصطلحات مسودة فقط. لا تغيير نشر أو عضوية.",
                )}
              </p>
              <Button
                primary
                onClick={() =>
                  update((current) => ({
                    ...current,
                    catalogDraft: unitType === "SUBJECT" ? "SUBJECT" : "MODULE",
                  }))
                }
              >
                {t("Save draft", "حفظ المسودة")}
              </Button>
            </>
          ) : null}
          {state.catalogDraft ? (
            <Notice>
              {t(
                "Sample catalog draft saved in memory. Publication remains governed separately.",
                "حفظت مسودة الدليل في الذاكرة. النشر منضبط بشكل منفصل.",
              )}{" "}
              {state.catalogDraft === "MODULE"
                ? t("Module", "وحدة دراسية")
                : t("Subject", "مادة دراسية")}
            </Notice>
          ) : null}
        </section>
      ) : resource === "cohorts" ? (
        <section className={styles.panel}>
          <h2>{t("Cohort configuration example", "مثال إعداد المجموعة")}</h2>
          <p>
            <bdi>{defaultScope.cohortName}</bdi> ·{" "}
            <bdi>{defaultScope.curriculumEdition}</bdi>
          </p>
          <p>
            {t(
              "Fixed cohort/edition draft. Membership, release, publication, READY sources, valid rights and matching edition remain separate availability predicates.",
              "مسودة مجموعة وإصدار ثابتة. العضوية والفتح والنشر والمصادر الجاهزة والحقوق والإصدار المتطابق شروط إتاحة منفصلة.",
            )}
          </p>
          <Button
            onClick={() =>
              update((current) => ({ ...current, cohortDraft: true }))
            }
          >
            {t("Save cohort draft", "محاكاة مسودة المجموعة")}
          </Button>
          {state.cohortDraft ? (
            <Notice>
              {t(
                "Sample cohort draft saved. No cohort unlocked.",
                "حفظت مسودة المجموعة. لم تفتح مجموعة.",
              )}
            </Notice>
          ) : null}
        </section>
      ) : resource === "campaigns" ? (
        <section className={styles.panel}>
          <h2>{t("Create campaign", "إنشاء حملة")}</h2>
          <p>
            {t(
              "Fixed name: Synthetic Anatomy source call. Handout, recording and diagram requests; fixed expiry, rights declaration and naming guidance.",
              "اسم ثابت: حملة مصادر تشريح تجريبية. طلبات ملزمة وتسجيل ورسم؛ انتهاء وحقوق وإرشادات تسمية ثابتة.",
            )}
          </p>
          <p>
            <bdi>{defaultScope.cohortName}</bdi> /{" "}
            <bdi>
              {locale === "ar"
                ? defaultScope.unitTitleAr
                : defaultScope.unitTitleEn}
            </bdi>
          </p>
          <Button
            primary
            onClick={() =>
              update((current) => ({ ...current, campaignDraft: true }))
            }
          >
            {t("Create campaign", "إنشاء حملة")}
          </Button>
          {state.campaignDraft ? (
            <>
              <Notice>
                {t(
                  "Simulated campaign draft created in this tab.",
                  "أنشئت مسودة حملة محاكاة داخل التبويب.",
                )}
              </Notice>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                />
                {t(
                  "Review fixed expiring campaign-only invitation",
                  "مراجعة دعوة ثابتة للحملة فقط محدودة المدة",
                )}
              </label>
              <Button
                disabled={!confirmed || state.invitation}
                onClick={() =>
                  update((current) => ({ ...current, invitation: true }))
                }
              >
                {t("Send invitation", "إرسال الدعوة")}
              </Button>
              {state.invitation ? (
                <Notice>
                  {t(
                    "Invitation example reviewed. No email, assignment or access grant.",
                    "روجع مثال الدعوة. لا بريد أو تكليف أو منح وصول.",
                  )}
                </Notice>
              ) : null}
              <p>
                <bdi>leader@example.invalid</bdi> ·{" "}
                {t(
                  "Use the invitation link supplied in the synthetic test pack as the recipient. No email is delivered.",
                  "استخدم رابط الدعوة المرفق بحزمة الاختبار كمستلم. لا يرسل بريد.",
                )}
              </p>
            </>
          ) : null}
        </section>
      ) : (
        <section className={styles.panel}>
          <h2>{text(resourceNames[resource], locale)}</h2>
          <p>{text(summaries[resource], locale)}</p>
          {resource === "quality" ? (
            <ProductLink href={defaultUnitPath + "/chat"} locale={locale}>
              {t("Inspect student conflict example", "فحص مثال تعارض الطالب")}
            </ProductLink>
          ) : resource === "usage" ? (
            <ProductLink
              href={defaultUnitPath + "/chat?fixture=capacity"}
              locale={locale}
            >
              {t("Preview capacity delay", "معاينة تأخير السعة")}
            </ProductLink>
          ) : null}
        </section>
      )}
      <div className={styles.actions}>
        <ProductLink href={reviewBase + "/admin"} locale={locale}>
          {t("Open governed decisions", "فتح القرارات المنضبطة")}
        </ProductLink>
        <ProductLink href={defaultUnitPath} locale={locale}>
          {t("Preview exact student scope", "معاينة نطاق الطالب المحدد")}
        </ProductLink>
      </div>
    </>
  );
}
