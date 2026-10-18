"use client";
import { useProductText } from "@/app/_components/product-copy";
import { useState } from "react";
import type { MouseEvent } from "react";
import type { Route } from "next";
import {
  adminPreviewContext,
  syntheticAdminCandidates,
  syntheticCohortLabel,
  syntheticDecisionHref,
  syntheticResourceDecision,
  type AdminOrigin,
} from "@/lib/demo/synthetic-admin-context.application";
import { getAdminCopy } from "@/lib/i18n/admin-copy";
import { useSearchParams } from "next/navigation";
import {
  ProductNavigationLink,
  useHostedSynthetic,
} from "./product-navigation";
import {
  canReviewConflictPreview,
  reviewConflictPreview,
} from "@/lib/demo/synthetic-conflict-preview.application";
import { syntheticDemoTime } from "@/lib/demo/synthetic-clock.application";
import { formatCollectionDate } from "@/lib/i18n/collection-format";
import {
  collectionDeadline,
  collectionWindow,
} from "@/lib/collection/collection-presentation.application";
import {
  demoCampaignId,
  makeSyntheticCampaign,
} from "@/lib/demo/synthetic-campaigns.application";
import type { AdminActionCandidate } from "@/lib/admin/admin-actions.application";
import adminStyles from "@/app/admin/admin.module.css";
import {
  defaultScope,
  defaultUnitPath,
  resourceNames,
  type Locale,
} from "@/lib/demo/synthetic-fixtures.application";
import { useProductServices } from "./product-services";
import { buttonLook } from "./button-look";
import { Notice } from "./notice";
import { Button, ProductLink, Select } from "./product-ui";
import {
  ResourceList,
  targetState,
  type ResourceRow,
} from "./product-resource-list";
type Props = { screen: string; locale: Locale; scenario: string };
export function ProductResource({ screen, locale }: Props) {
  const { state, update } = useProductServices();
  const hosted = useHostedSynthetic();
  const query = useSearchParams();
  const [step, setStep] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const unitType = state.catalogChoice;
  const t = useProductText(locale);
  const resource = screen.slice(6) as keyof typeof resourceNames;
  if (!Object.hasOwn(resourceNames, resource)) return null;
  const copy = getAdminCopy(locale);
  const candidates = syntheticAdminCandidates(state);
  const candidate = (id: string) =>
    candidates.find((item) => item.candidateId === `sample-${id}`)!;
  // Each resource's governed decision (null for Campaigns).
  const primary = syntheticResourceDecision(state, resource);
  const unitTitle =
    locale === "ar" ? defaultScope.unitTitleAr : defaultScope.unitTitleEn;
  const cohortLabel = syntheticCohortLabel[locale === "ar" ? 1 : 0];
  // The same display name the student Materials view gives this edition.
  const edition =
    defaultScope.curriculumEdition === "synthetic-2026-2027"
      ? t("Sample edition 2026–2027", "إصدار تجريبي ٢٠٢٦–٢٠٢٧")
      : defaultScope.curriculumEdition;
  const preview = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    update((current) => ({
      ...current,
      adminPreview: adminPreviewContext(current, resource),
    }));
  };
  /** A short verb that opens the governed decision for its row's target. */
  const decision = (item: AdminActionCandidate, origin: AdminOrigin) => (
    <ProductNavigationLink
      {...buttonLook({ variant: "secondary" })}
      prefetch={false}
      href={syntheticDecisionHref(item, locale, origin) as Route}
    >
      {copy.verbs[item.action]}
      <span className="visually-hidden">
        {" "}
        {locale === "ar" ? item.targetLabelAr : item.targetLabelEn}
      </span>
    </ProductNavigationLink>
  );
  const unitField = [
    t("Unit", "الوحدة"),
    <bdi key="unit">{unitTitle}</bdi>,
  ] as const;
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
  const howItWorks = (key: keyof typeof summaries) => {
    const body = t(summaries[key][0], summaries[key][1]);
    return body ? (
      <details className={adminStyles.disclosure}>
        <summary>{t("How this view works", "كيف يعمل هذا العرض")}</summary>
        <p>{body}</p>
      </details>
    ) : null;
  };
  const contextLinks = (
    <div className={adminStyles.contextLinks}>
      <ProductLink variant="quiet" href="/admin" locale={locale}>
        {t("All decisions", "كل القرارات")}
      </ProductLink>
      <ProductLink
        variant="quiet"
        href={defaultUnitPath}
        locale={locale}
        onClick={preview}
      >
        {t("Preview exact student scope", "معاينة نطاق الطالب المحدد")}
      </ProductLink>
    </div>
  );
  if (resource === "cohorts" && query.get("view") === "users")
    return (
      <div className={adminStyles.resourcePage}>
        <section aria-labelledby="access-context">
          <div className={adminStyles.listHead}>
            <h2 id="access-context">
              {t("Assignment and access context", "سياق التكليف والوصول")}
            </h2>
            <p>
              {t(
                "This fixed example provides context; individual user records are not available in this view.",
                "يوضح هذا المثال الثابت السياق؛ لا تتوفر سجلات المستخدمين الفردية في هذا العرض.",
              )}
            </p>
          </div>
          <ul className={adminStyles.resourceList}>
            <li>
              <div className={adminStyles.rowMain}>
                <h3 className={adminStyles.rowTitle}>
                  {t("Students", "الطلاب")}
                </h3>
                <dl className={adminStyles.rowFields}>
                  <div>
                    <dt>{t("Cohort", "المجموعة")}</dt>
                    <dd>
                      <bdi>{cohortLabel}</bdi>
                    </dd>
                  </div>
                  <div>
                    <dt>{t("Curriculum edition", "إصدار المنهج")}</dt>
                    <dd>
                      <bdi>{edition}</bdi>
                    </dd>
                  </div>
                </dl>
                <p className={adminStyles.rowNote}>
                  {t(
                    "Student access follows current membership and release.",
                    "يعتمد وصول الطالب على العضوية والفتح الحاليين.",
                  )}
                </p>
              </div>
              <div className={adminStyles.rowSide}>
                <ProductLink href="/admin/cohorts" locale={locale}>
                  {t("Review cohort configuration", "مراجعة إعداد المجموعة")}
                </ProductLink>
              </div>
            </li>
            <li>
              <div className={adminStyles.rowMain}>
                <h3 className={adminStyles.rowTitle}>
                  {t("Batch Leaders", "مسؤولو الدفعات")}
                </h3>
                <p className={adminStyles.rowNote}>
                  {t(
                    "Batch Leader access follows an active campaign assignment and its expiry.",
                    "ويعتمد وصول مسؤول الدفعة على تكليف فعال بالحملة ومدة صلاحيته.",
                  )}
                </p>
              </div>
              <div className={adminStyles.rowSide}>
                <ProductLink href="/admin/campaigns" locale={locale}>
                  {t("Review campaign invitations", "مراجعة دعوات الحملات")}
                </ProductLink>
              </div>
            </li>
          </ul>
        </section>
      </div>
    );
  if (resource === "catalog")
    return (
      <div className={adminStyles.resourcePage}>
        <ResourceList
          id="catalog-units"
          heading={t("Units", "الوحدات")}
          rows={[
            {
              id: "unit",
              title: <bdi>{unitTitle}</bdi>,
              fields: [
                [
                  t("Program", "البرنامج"),
                  <bdi key="program">
                    {locale === "ar"
                      ? defaultScope.programNameAr
                      : defaultScope.programNameEn}
                  </bdi>,
                ],
                [
                  t("Cohort", "المجموعة"),
                  <bdi key="cohort">{cohortLabel}</bdi>,
                ],
              ],
              state: targetState(primary!, locale),
              actions: decision(primary!, "catalog"),
            },
          ]}
        />
        <section
          className={adminStyles.workPanel}
          aria-labelledby="catalog-terminology"
        >
          <h2 id="catalog-terminology">
            {t("Unit terminology", "مصطلح الوحدة")}
          </h2>
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
            onChange={(value) => {
              if (value !== "MODULE" && value !== "SUBJECT") return;
              setStep(false);
              update((current) => ({ ...current, catalogChoice: value }));
            }}
            options={[
              ["MODULE", t("Module", "وحدة دراسية")],
              ["SUBJECT", t("Subject", "مادة دراسية")],
            ]}
          />
          <Button onClick={() => setStep(true)}>
            {t("Review changes", "مراجعة التغييرات")}
          </Button>
          {unitType !== (state.catalogDraft ?? "MODULE") ? (
            <p role="status">
              {t(
                "Unsaved changes. Review before saving.",
                "تغييرات غير محفوظة. راجعها قبل الحفظ.",
              )}
            </p>
          ) : null}
          {step ? (
            <>
              <p>
                {t(
                  "Draft terminology only. No publication or membership changes.",
                  "مصطلحات مسودة فقط. لا تغيير نشر أو عضوية.",
                )}
              </p>
              <Button
                variant="primary"
                disabled={state.catalogDraft === unitType}
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
            <Notice tone="success" live locale={locale}>
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
        {contextLinks}
      </div>
    );
  if (resource === "cohorts")
    return (
      <div className={adminStyles.resourcePage}>
        <ResourceList
          id="cohort-list"
          heading={t("Cohorts", "المجموعات")}
          rows={[
            {
              id: "cohort",
              title: <bdi>{cohortLabel}</bdi>,
              fields: [
                [
                  t("Curriculum edition", "إصدار المنهج"),
                  <bdi key="edition">{edition}</bdi>,
                ],
                unitField,
              ],
              note: t(
                "Fixed cohort/edition configuration. Membership, release, publication, READY sources, valid rights and matching edition remain separate availability predicates.",
                "إعدادات ثابتة للمجموعة وإصدار المنهج. العضوية والفتح والنشر والمصادر الجاهزة والحقوق والإصدار المتطابق شروط إتاحة منفصلة.",
              ),
              state: targetState(primary!, locale),
              actions: (
                <>
                  <Button
                    // One effect only; afterwards the notice says it is done
                    // (IX-35).
                    disabled={state.cohortDraft}
                    onClick={() =>
                      update((current) => ({ ...current, cohortDraft: true }))
                    }
                  >
                    {t(
                      "Review cohort configuration",
                      "مراجعة إعدادات المجموعة",
                    )}
                  </Button>
                  {decision(primary!, "cohorts")}
                </>
              ),
            },
          ]}
        />
        {state.cohortDraft ? (
          <Notice tone="success" live locale={locale}>
            {t(
              "Cohort configuration reviewed. No cohort unlocked.",
              "تمت مراجعة إعدادات المجموعة. لم تُفتح المجموعة.",
            )}
          </Notice>
        ) : null}
        {contextLinks}
      </div>
    );
  if (resource === "campaigns") {
    const campaign = makeSyntheticCampaign(state, locale, demoCampaignId)!;
    const deadline = collectionDeadline(campaign);
    const open =
      collectionWindow(campaign, Date.parse(syntheticDemoTime.now)) ===
      "ACTIVE";
    return (
      <div className={adminStyles.resourcePage}>
        <ResourceList
          id="campaign-list"
          heading={t("Collection campaigns", "حملات الجمع")}
          rows={[
            {
              id: campaign.id,
              title: campaign.name,
              fields: [
                [t("Cohort", "المجموعة"), campaign.cohortName],
                ...(deadline
                  ? [
                      [
                        t("Leader deadline", "موعد المسؤول"),
                        formatCollectionDate(locale, deadline),
                      ] as const,
                    ]
                  : []),
              ],
              state: open
                ? { tone: "ok", label: t("Open for uploads", "مفتوحة للرفع") }
                : { tone: "neutral", label: t("Closed", "مغلقة") },
            },
          ]}
        />
        <section
          className={adminStyles.workPanel}
          aria-labelledby="campaign-create"
        >
          <h2 id="campaign-create">{t("Create campaign", "إنشاء حملة")}</h2>
          <p>
            {t(
              "Fixed name: Anatomy lecture and practical sources. Handout, recording and diagram requests; fixed expiry, rights declaration and naming guidance.",
              "اسم ثابت: مصادر محاضرات وعمليات التشريح. طلبات ملزمة وتسجيل ورسم؛ انتهاء وحقوق وإرشادات تسمية ثابتة.",
            )}
          </p>
          <p>
            <bdi>{cohortLabel}</bdi>
            {t(", ", "، ")}
            <bdi>{unitTitle}</bdi>
          </p>
          <Button
            variant="primary"
            disabled={state.campaignDraft}
            onClick={() =>
              update((current) => ({ ...current, campaignDraft: true }))
            }
          >
            {t("Create campaign", "إنشاء حملة")}
          </Button>
          {state.campaignDraft ? (
            <>
              <Notice tone="success" live locale={locale}>
                {t(
                  "Simulated campaign draft created in this tab.",
                  "أنشئت مسودة حملة محاكاة داخل التبويب.",
                )}
              </Notice>
              <label className={adminStyles.check}>
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
                {t("Review invitation example", "مراجعة مثال الدعوة")}
              </Button>
              {state.invitation ? (
                <Notice tone="success" live locale={locale}>
                  {t(
                    "Invitation example reviewed. No email, assignment or access grant.",
                    "روجع مثال الدعوة. لا بريد أو تكليف أو منح وصول.",
                  )}
                </Notice>
              ) : null}
              <p>
                <bdi>leader@example.invalid</bdi>{" "}
                {t(
                  "Use the invitation link supplied in the synthetic test pack as the recipient. No email is delivered.",
                  "استخدم رابط الدعوة المرفق بحزمة الاختبار كمستلم. لا يرسل بريد.",
                )}
              </p>
            </>
          ) : null}
        </section>
        {contextLinks}
      </div>
    );
  }
  const quarantine = candidate("quarantine");
  const retry = candidate("retry");
  const source = candidate(
    state.availability.sourceActive ? "deactivate" : "activate",
  );
  const hold = candidate(
    candidate("hold").currentState === "HELD" ? "remove-hold" : "hold",
  );
  const lists: Record<
    "sources" | "jobs" | "quality" | "usage" | "incidents",
    { heading: string; rows: readonly ResourceRow[] }
  > = {
    sources: {
      heading: t("Source versions", "إصدارات المصادر"),
      rows: [
        {
          id: "failed",
          title: (
            <bdi>{t(quarantine.targetLabelEn, quarantine.targetLabelAr)}</bdi>
          ),
          fields: [
            unitField,
            [t("Version", "الإصدار"), t("Failed upload", "رفع فاشل")],
          ],
          state: targetState(quarantine, locale),
          actions: (
            <>
              {decision(quarantine, "sources")}
              {decision(retry, "sources")}
            </>
          ),
        },
        {
          id: "accepted",
          title: <bdi>{t(source.targetLabelEn, source.targetLabelAr)}</bdi>,
          fields: [
            unitField,
            [t("Version", "الإصدار"), t("Accepted", "مقبول")],
          ],
          state: targetState(source, locale),
          actions: decision(source, "sources"),
        },
        {
          id: "raw",
          title: <bdi>{t(hold.targetLabelEn, hold.targetLabelAr)}</bdi>,
          fields: [
            unitField,
            [t("Kind", "النوع"), copy.targetKinds.RAW_OBJECT],
          ],
          state: targetState(hold, locale),
          actions: decision(hold, "sources"),
        },
      ],
    },
    jobs: {
      heading: t("Processing jobs", "مهام المعالجة"),
      rows: [
        {
          id: "retry",
          title: <bdi>{t(retry.targetLabelEn, retry.targetLabelAr)}</bdi>,
          fields: [
            unitField,
            [t("Job", "المهمة"), t("Processing", "المعالجة")],
          ],
          state: targetState(retry, locale),
          actions: decision(retry, "jobs"),
        },
        {
          id: "deletion",
          title: <bdi>{t(hold.targetLabelEn, hold.targetLabelAr)}</bdi>,
          fields: [
            unitField,
            [t("Job", "المهمة"), t("Deletion verification", "تحقق الحذف")],
          ],
          state: {
            tone: "wait",
            label: t("Deletion verification pending", "تحقق الحذف معلق"),
          },
        },
      ],
    },
    quality: {
      heading: t("Quality reviews", "مراجعات الجودة"),
      rows: [
        {
          id: "conflict",
          title: t(
            "Brachial plexus roots: handout and recording disagree",
            "جذور الضفيرة العضدية: الملزمة والتسجيل مختلفان",
          ),
          fields: [
            unitField,
            [
              t("Sources", "المصادر"),
              t(
                "Lecture 6 handout, Practical 3 recording",
                "ملزمة المحاضرة 6، تسجيل العملي 3",
              ),
            ],
          ],
          state: {
            tone: "bad",
            label: t("Conflict needs review", "التعارض يحتاج مراجعة"),
          },
          note: canReviewConflictPreview(state)
            ? null
            : t(
                "Conflict review is unavailable for this unit's current source and access state.",
                "مراجعة التعارض غير متاحة وفق حالة مصادر هذه الوحدة والوصول إليها.",
              ),
          actions: (
            <>
              {canReviewConflictPreview(state) ? (
                <ProductLink
                  href={defaultUnitPath + "/chat"}
                  locale={locale}
                  onClick={(event) => {
                    if (
                      event.defaultPrevented ||
                      event.button !== 0 ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    )
                      return;
                    preview(event);
                    update((current) =>
                      reviewConflictPreview(
                        current,
                        defaultScope.unitId,
                        locale,
                      ),
                    );
                  }}
                >
                  {t(
                    "Inspect student conflict example",
                    "فحص مثال تعارض الطالب",
                  )}
                </ProductLink>
              ) : null}
              {decision(primary!, "quality")}
            </>
          ),
        },
      ],
    },
    usage: {
      heading: t("Providers and capacity", "المزودون والسعة"),
      rows: [
        {
          id: "flag",
          title: (
            <bdi>
              {t(
                candidate("disable").targetLabelEn,
                candidate("disable").targetLabelAr,
              )}
            </bdi>
          ),
          fields: [
            [t("Kind", "النوع"), copy.targetKinds.FLAG],
            [t("Paid budget", "الميزانية المدفوعة"), t("Zero", "صفر")],
          ],
          state: targetState(primary!, locale),
          actions: decision(primary!, "usage"),
        },
        {
          id: "capacity",
          title: t("Answer capacity", "سعة الإجابات"),
          fields: [[t("Providers", "المزودون"), t("Disabled", "معطلون")]],
          note: hosted
            ? t(
                "A capacity-delay preview is unavailable in this session. No capacity measurement has been made.",
                "معاينة تأخير السعة غير متاحة في هذه الجلسة. لم يتم قياس السعة.",
              )
            : null,
          actions: hosted ? null : (
            <ProductLink
              href={defaultUnitPath + "/chat?fixture=capacity"}
              locale={locale}
              onClick={preview}
            >
              {t("Preview capacity delay", "معاينة تأخير السعة")}
            </ProductLink>
          ),
        },
      ],
    },
    incidents: {
      heading: t("Open incidents", "الحوادث المفتوحة"),
      rows: [
        {
          id: "readiness",
          title: t("Source readiness", "جاهزية المصادر"),
          fields: [
            unitField,
            [t("Cohort", "المجموعة"), <bdi key="cohort">{cohortLabel}</bdi>],
          ],
          state: {
            tone: "wait",
            label: t("Isolated for review", "معزولة للمراجعة"),
          },
          actions: decision(primary!, "incidents"),
        },
      ],
    },
  };
  const operation = resource as keyof typeof lists;
  const list = lists[operation];
  return (
    <div className={adminStyles.resourcePage}>
      <ResourceList
        id={`${operation}-list`}
        heading={list.heading}
        rows={list.rows}
      />
      {howItWorks(operation)}
      {contextLinks}
    </div>
  );
}
