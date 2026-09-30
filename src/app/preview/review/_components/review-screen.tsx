"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import {
  commonScenarios,
  defaultUnitPath,
  resourceNames,
  sampleScopeAvailable,
  reviewBase,
  text,
  type Localized,
} from "../review-fixtures";
import styles from "../review.module.css";
import { useReview } from "./review-provider";
import { Button, ReviewLink, Select } from "./review-ui";
import { AccessScreen, SettingsScreen } from "./access-screens";
import { StudentScreen } from "./student-screens";
import { OperationsScreen } from "./operations-screens";

const titles: Record<string, Localized> = {
  home: ["Review UniMind", "راجع UniMind"],
  catalog: ["Study Shelf", "رف المذاكرة"],
  login: ["Sign in", "تسجيل الدخول"],
  register: ["Create account", "إنشاء حساب"],
  "verify-email": ["Verify email", "تأكيد البريد"],
  consent: ["Learning commitments", "التزامات التعلم"],
  "forgot-password": ["Recover account", "استعادة الحساب"],
  "reset-password": ["Reset password", "إعادة تعيين كلمة المرور"],
  overview: ["Unit overview", "نظرة عامة على الوحدة"],
  chat: ["Scoped chat", "محادثة الوحدة"],
  studio: ["Studio", "الاستوديو"],
  quiz: ["Quiz", "اختبار"],
  attempt: ["Sample quiz attempt", "محاولة اختبار تجريبية"],
  "quiz-review": ["Score and grounded review", "النتيجة والمراجعة بالمصادر"],
  sources: ["Unit sources", "مصادر الوحدة"],
  evidence: ["Answer evidence", "أدلة الإجابة"],
  report: ["Report an exchange", "الإبلاغ عن محادثة"],
  settings: ["Settings", "الإعدادات"],
  "campaign-list": ["Assigned campaigns", "الحملات المسندة"],
  invitation: ["Campaign invitation", "دعوة الحملة"],
  collection: ["Collection desk", "مكتب جمع المصادر"],
  decisions: ["Governed decisions", "القرارات المنضبطة"],
};

function scenarioOptions(
  screen: string,
): readonly (readonly [string, string, string])[] {
  const extras: (readonly [string, string, string])[] = [];
  if (["login", "register", "verify-email", "consent"].includes(screen))
    extras.push(
      ["unverified", "Unverified account", "حساب غير مؤكد"],
      ["verified", "Verified account", "حساب مؤكد"],
      ["suspended", "Suspended account", "حساب موقوف"],
      ["outdated-consent", "Outdated consent", "موافقة قديمة"],
      ["current-consent", "Current consent", "موافقة حالية"],
    );
  if (
    [
      "verify-email",
      "forgot-password",
      "reset-password",
      "invitation",
      "campaign-list",
      "collection",
    ].includes(screen)
  )
    extras.push(
      ["expired", "Expired", "منتهي"],
      ["replayed", "Replayed link", "رابط مستخدم"],
      ["wrong-scope", "Wrong scope", "نطاق غير صحيح"],
    );
  if (["chat", "studio", "quiz", "overview"].includes(screen))
    extras.push(
      ["quota", "Allowance unavailable", "الرصيد غير متاح"],
      ["capacity", "Capacity delay", "تأخير السعة"],
    );
  if (screen === "catalog")
    extras.push(
      ["no-membership", "No membership", "لا توجد عضوية"],
      ["locked", "Locked cohort", "مجموعة مغلقة"],
      ["unpublished", "Unpublished unit", "وحدة غير منشورة"],
      ["no-ready-source", "No READY sources", "لا توجد مصادر جاهزة"],
    );
  if (screen === "decisions")
    extras.push(
      ["blocked", "Readiness blocked", "الجاهزية غير مكتملة"],
      ["pending", "Pending founder confirmation", "بانتظار تأكيد مؤسس"],
      ["disabled", "Decision not approved", "القرار غير معتمد"],
    );
  return [...commonScenarios, ...extras];
}

export function ReviewScreen({
  screen,
  scope,
  children,
}: {
  screen: string;
  scope?: WorkspaceScope;
  children?: ReactNode;
}) {
  const query = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { state, reset, revision } = useReview();
  const locale = query.get("lang") === "ar" ? "ar" : "en";
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const scenario = query.get("state") ?? "ready";
  const allowed = scenarioOptions(screen);
  const validScenario = allowed.some(([id]) => id === scenario);
  const mainRef = useRef<HTMLElement>(null);
  const lastPath = useRef(pathname);
  const unitPath = scope
    ? `${reviewBase}/catalog/${scope.cohortId}/${scope.unitId}`
    : defaultUnitPath;
  const title = screen.startsWith("admin-")
    ? text(resourceNames[screen.slice(6) as keyof typeof resourceNames], locale)
    : text(titles[screen] ?? titles.home!, locale);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    if (lastPath.current !== pathname) mainRef.current?.focus();
    lastPath.current = pathname;
  }, [locale, pathname]);
  function changeQuery(key: string, value: string) {
    const next = new URLSearchParams(query.toString());
    next.set(key, value);
    router.replace(`${pathname}?${next.toString()}` as Route, {
      scroll: false,
    });
  }
  const general = [
    "loading",
    "empty",
    "error",
    "offline",
    "forbidden",
    "quota",
    "capacity",
    "no-membership",
    "locked",
    "unpublished",
    "no-ready-source",
    "wrong-scope",
  ];
  const blocked =
    !validScenario ||
    general.includes(scenario) ||
    (scenario === "stale" && screen !== "decisions");
  const scopeBlocked =
    scope !== undefined &&
    !sampleScopeAvailable(state, scope.cohortId, scope.unitId);
  const nav: readonly (readonly [string, Localized])[] = scope
    ? [
        [unitPath, ["Overview", "نظرة عامة"]],
        [unitPath + "/chat", ["Chat", "المحادثة"]],
        [unitPath + "/studio", ["Studio", "الاستوديو"]],
        [unitPath + "/quiz", ["Quiz", "الاختبار"]],
        [unitPath + "/sources", ["Sources", "المصادر"]],
        [reviewBase + "/settings", ["Settings", "الإعدادات"]],
      ]
    : screen.startsWith("admin-") || screen === "decisions"
      ? [
          [reviewBase + "/admin", ["Decision queue", "قائمة القرارات"]],
          ...Object.entries(resourceNames).map(
            ([id, label]) => [reviewBase + "/admin/" + id, label] as const,
          ),
        ]
      : screen === "collection" ||
          screen === "invitation" ||
          screen === "campaign-list"
        ? [
            [reviewBase + "/batch-leader", ["Campaigns", "الحملات"]],
            [
              reviewBase + "/batch-leader/invitation",
              ["Invitation example", "مثال دعوة"],
            ],
          ]
        : [
            [reviewBase + "/access/register", ["Create account", "إنشاء حساب"]],
            [reviewBase + "/access/login", ["Sign in", "تسجيل الدخول"]],
            [reviewBase + "/catalog", ["Study Shelf", "رف المذاكرة"]],
            [reviewBase + "/batch-leader", ["Batch Leader", "منسق الدفعة"]],
            [reviewBase + "/admin", ["Admin", "الإدارة"]],
            [reviewBase + "/settings", ["Settings", "الإعدادات"]],
          ];
  const boundary = (
    <header className={styles.boundary}>
      <strong>
        {t(
          "SIMULATED · Synthetic product review",
          "محاكاة · مراجعة ببيانات تجريبية",
        )}
      </strong>
      <p>
        {t(
          "Fixed examples only. No accounts, emails, uploads, access grants, protected changes or providers. State exists in this tab's memory; reload or reset clears it.",
          "أمثلة ثابتة فقط. لا حسابات أو بريد أو رفع ملفات أو منح وصول أو تغييرات محمية أو مزودين. الحالة في ذاكرة هذا التبويب؛ إعادة التحميل أو الضبط تمسحها.",
        )}
      </p>
      <div className={styles.utilities}>
        <ReviewLink href={reviewBase} locale={locale}>
          {t("Review home", "بداية المراجعة")}
        </ReviewLink>
        <Button
          onClick={() => {
            reset();
            changeQuery("state", "ready");
          }}
        >
          {t("Reset simulation", "إعادة ضبط المحاكاة")}
        </Button>
        <Button
          onClick={() => changeQuery("lang", locale === "ar" ? "en" : "ar")}
        >
          {locale === "ar" ? "English" : "العربية"}
        </Button>
        <Select
          id="review-scenario"
          label={t("Review scenario", "سيناريو المراجعة")}
          value={validScenario ? scenario : "error"}
          onChange={(value) => changeQuery("state", value)}
          options={allowed.map(([id, en, ar]) => [id, t(en, ar)])}
        />
      </div>
    </header>
  );
  const safeState = (
    <section className={styles.panel} aria-live="polite">
      <h2>
        {t("Simulated state", "حالة محاكاة")}:{" "}
        {text(
          (allowed
            .find(([id]) => id === scenario)
            ?.slice(1) as unknown as Localized) ?? [
            "Unknown fixture",
            "مثال غير معروف",
          ],
          locale,
        )}
      </h2>
      <p>
        {scenario === "loading"
          ? t(
              "Checking the fixed sample… Continue when ready; no server work is running.",
              "فحص المثال الثابت… أكمل عند الاستعداد؛ لا توجد مهمة على الخادم.",
            )
          : scenario === "offline"
            ? t(
                "The sample interaction was interrupted. Retry preserves this tab's sample records.",
                "توقف التفاعل التجريبي. إعادة المحاولة تحافظ على سجلات المثال داخل التبويب.",
              )
            : scenario === "quota"
              ? t(
                  "Allowance unavailable. Numeric limits and reset periods require the budget decision; no credit is purchased.",
                  "الرصيد غير متاح. الحدود الرقمية وفترات التجديد تحتاج قرار الميزانية؛ لا يتم شراء رصيد.",
                )
              : scenario === "capacity"
                ? t(
                    "Capacity is delayed. The sample can be retried; there is no provider or background job.",
                    "السعة متأخرة. يمكن إعادة محاولة المثال؛ لا يوجد مزود أو مهمة خلفية.",
                  )
                : scenario === "empty"
                  ? t(
                      "No sample records in this scenario. Choose Ready to review the populated fixture.",
                      "لا سجلات تجريبية في هذا السيناريو. اختر جاهز لمراجعة المثال الممتلئ.",
                    )
                  : scenario === "stale"
                    ? t(
                        "The sample scope or version changed. Reload the fixture before continuing.",
                        "تغير نطاق أو إصدار المثال. حدث المثال قبل المتابعة.",
                      )
                    : t(
                        "This fixture is unavailable in this scenario. No protected data or access has been exposed. Return to the Ready example.",
                        "المثال غير متاح في هذا السيناريو. لم يتم كشف بيانات أو وصول محمي. ارجع للمثال الجاهز.",
                      )}
      </p>
      <Button primary onClick={() => changeQuery("state", "ready")}>
        {scenario === "offline" || scenario === "error"
          ? t("Retry sample", "إعادة محاولة المثال")
          : t("Open ready example", "فتح المثال الجاهز")}
      </Button>
    </section>
  );
  if (screen === "catalog" && !blocked)
    return (
      <div
        className={styles.shell}
        lang={locale}
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        {boundary}
        <div key={`${revision}:${scenario}`}>{children}</div>
      </div>
    );
  return (
    <div
      className={styles.shell}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <a className={styles.skip} href="#review-content">
        {t("Skip to content", "انتقل للمحتوى")}
      </a>
      {boundary}
      <div className={styles.layout}>
        <aside className={styles.rail}>
          <Link
            className={styles.brand}
            href={`${reviewBase}?lang=${locale}` as Route}
            translate="no"
          >
            UniMind
          </Link>
          <nav aria-label={t("Review navigation", "تنقل المراجعة")}>
            {nav.map(([href, label]) => (
              <Link
                key={href}
                prefetch={false}
                href={`${href}?lang=${locale}` as Route}
                aria-current={pathname === href ? "page" : undefined}
              >
                {text(label, locale)}
              </Link>
            ))}
          </nav>
          {scope ? (
            <ReviewLink href={reviewBase + "/catalog"} locale={locale}>
              {t("Back to Study Shelf", "العودة لرف المذاكرة")}
            </ReviewLink>
          ) : null}
        </aside>
        <main
          ref={mainRef}
          id="review-content"
          tabIndex={-1}
          className={styles.main}
        >
          <h1>{title}</h1>
          {scopeBlocked ? (
            <section className={styles.panel}>
              <h2>{t("Sample availability changed", "تغيرت إتاحة المثال")}</h2>
              <p>
                {t(
                  "A simulated governance decision hid this unit, locked its cohort or deactivated its sample source. The Study Shelf and all child screens respect this local state. Restore the completed outcome fixture in Admin or reset the simulation.",
                  "قرار حوكمة محاكى أخفى الوحدة أو أغلق مجموعتها أو عطل مصدرها التجريبي. رف المذاكرة وكل شاشات الوحدة تحترم الحالة المحلية. استعد مثال النتيجة المكتملة من الإدارة أو أعد ضبط المحاكاة.",
                )}
              </p>
              <ReviewLink href={reviewBase + "/admin"} locale={locale}>
                {t("Review governance state", "مراجعة حالة الحوكمة")}
              </ReviewLink>
            </section>
          ) : blocked ? (
            safeState
          ) : (
            <div key={`${pathname}:${scenario}:${revision}`}>
              {screen === "home" ? (
                <Home locale={locale} />
              ) : screen === "settings" ? (
                <SettingsScreen locale={locale} />
              ) : [
                  "login",
                  "register",
                  "verify-email",
                  "consent",
                  "forgot-password",
                  "reset-password",
                ].includes(screen) ? (
                <AccessScreen
                  screen={screen}
                  locale={locale}
                  scenario={scenario}
                />
              ) : scope ? (
                <StudentScreen
                  screen={screen}
                  scope={scope}
                  locale={locale}
                  base={unitPath}
                  scenario={scenario}
                />
              ) : (
                <OperationsScreen
                  screen={screen}
                  locale={locale}
                  scenario={scenario}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Home({ locale }: { locale: "en" | "ar" }) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const journeys: (readonly [string, string, string, string, string])[] = [
    [
      "access/register",
      "Access and consent",
      "الدخول والموافقة",
      "Create a sample account, verify, accept sample commitments, recover and sign in.",
      "أنشئ حسابًا تجريبيًا وأكده وراجع الموافقة والاستعادة والدخول.",
    ],
    [
      "catalog",
      "Student learning",
      "مذاكرة الطالب",
      "Choose a curriculum, switch scope, try fixed answers, inspect evidence, report, review all Studio types and a quiz.",
      "اختر منهجًا وبدل النطاق وجرب إجابات ثابتة وأدلتها والإبلاغ وأنواع الاستوديو والاختبار.",
    ],
    [
      "batch-leader",
      "Batch Leader collection",
      "جمع المصادر لمنسق الدفعة",
      "Review invitation boundaries, select a fixed file or reference, simulate upload and track status.",
      "راجع حدود الدعوة واختر ملفًا أو مرجعًا ثابتًا وحاكِ الرفع وتابع الحالة.",
    ],
    [
      "admin",
      "Admin governance",
      "حوكمة الإدارة",
      "Explore catalog, campaigns and operations, then try all twelve governed decision examples.",
      "استكشف الدليل والحملات والعمليات وجرب أمثلة القرارات الاثني عشر.",
    ],
    [
      "settings",
      "Settings and privacy",
      "الإعدادات والخصوصية",
      "Change the review language and future-exchange sharing fixture; see policy decisions still required.",
      "غير لغة المراجعة ومثال مشاركة المحادثات القادمة وراجع قرارات السياسات المطلوبة.",
    ],
  ];
  return (
    <>
      <p>
        {t(
          "Walk through the whole approved product with invented examples. Select a journey below or use the navigation. Every screen has a scenario selector for failure and boundary states.",
          "راجع المنتج المعتمد كاملًا بأمثلة خيالية. اختر مسارًا أو استخدم التنقل. كل شاشة بها اختيار سيناريو للحالات والحدود.",
        )}
      </p>
      {journeys.map(([path, en, ar, bodyEn, bodyAr]) => (
        <article className={styles.row} key={path}>
          <div>
            <h2>{t(en, ar)}</h2>
            <p>{t(bodyEn, bodyAr)}</p>
          </div>
          <ReviewLink href={`${reviewBase}/${path}`} locale={locale}>
            {t("Open journey", "فتح المسار")}
          </ReviewLink>
        </article>
      ))}
      <section className={styles.panel}>
        <h2>{t("What works today", "ما يعمل اليوم")}</h2>
        <p>
          {t(
            "WP03 has implemented protected Auth/consent, authorized catalog/workspace sessions, collection finalization and audited admin actions, with database/role proof. Those services remain separate from this public simulation. Chat, Studio, quiz scoring, reports and operations here are fixed frontend examples; they do not prove a working backend.",
            "WP03 نفذ الدخول والموافقة المحميين والدليل والجلسات المصرح بها وإنهاء جمع المصادر والقرارات المدققة مع اختبارات قاعدة البيانات والأدوار. هذه الخدمات منفصلة عن المحاكاة العامة. المحادثة والاستوديو وتصحيح الاختبار والإبلاغ والعمليات هنا أمثلة واجهة ثابتة ولا تثبت تشغيل الخلفية.",
          )}
        </p>
      </section>
      <details className={styles.panel}>
        <summary>
          {t("Product decisions still required", "قرارات المنتج المطلوبة")}
        </summary>
        <p>
          {t(
            "D-08: saving, retention periods and report disclosure/retention. D-18: approved storage and reference validation. Provider/model/budget decisions: numeric allowances, resets and paid enablement. Real pilot catalog/cohort and rights policies remain gated. Calendar, global Progress and personal notebooks are outside the approved review journey.",
            "D-08: الحفظ وفترات الاحتفاظ والإفصاح والاحتفاظ بالبلاغات. D-18: التخزين المعتمد والتحقق من المراجع. قرارات المزود والنموذج والميزانية: الرصيد الرقمي والتجديد والتفعيل المدفوع. المنهج والمجموعة الحقيقيان وسياسات الحقوق ما زالت مقيدة. التقويم والتقدم العام والدفاتر الشخصية خارج مسار المراجعة المعتمد.",
          )}
        </p>
      </details>
    </>
  );
}
