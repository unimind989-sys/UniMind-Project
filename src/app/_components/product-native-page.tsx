"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { StudyShelf } from "@/app/learn/_components/study-shelf";
import { WorkspaceFrame } from "@/app/learn/_components/workspace-frame";
import { ProductStudy } from "@/app/learn/_components/product-study";
import { syntheticUnitPresentationById } from "@/app/learn/synthetic-catalog";
import {
  parseCatalogSelectionHints,
  resolveCatalogJourney,
} from "@/lib/catalog/catalog-journey.application";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import { useProductServices } from "./product-services";
import { ProductAuth } from "./product-auth";
import { ProductAdmin } from "./product-admin";
import { ProductCollection } from "./product-collection";
import { ProductCampaigns, ProductResource } from "./product-operations";
import { ProductLink, Button, Notice, Select } from "./product-ui";
import {
  reviewCatalogRows,
  sampleScopeAvailable,
  resourceNames,
  text,
  type Locale,
} from "./synthetic-fixtures";
import styles from "./product.module.css";

const authModes = {
  login: "login",
  register: "register",
  "verify-email": "verify",
  consent: "consent",
  "forgot-password": "forgot",
  "reset-password": "reset",
} as const;

export function ProductNativePage({
  screen,
  locale,
  fixture,
  scope,
  callbackToken,
}: {
  screen: string;
  locale: Locale;
  fixture: string;
  scope?: WorkspaceScope;
  callbackToken?: string | undefined;
}) {
  const { state, update } = useProductServices();
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const [loading, setLoading] = useState(fixture === "loading");
  const signingOut = useRef(false);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const auth = Object.hasOwn(authModes, screen);
  const home =
    state.role === "leader"
      ? "/batch-leader"
      : state.role === "admin" || state.role === "second-admin"
        ? "/admin"
        : "/learn";
  useEffect(() => {
    if (callbackToken === "sample-recovery" && !state.recoveryUsed) {
      update((current) => ({ ...current, recoveryToken: true }));
      router.replace(`/reset-password?lang=${locale}` as Route);
    }
  }, [callbackToken, state.recoveryUsed, update, router, locale]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  useEffect(() => {
    // Explicit sign-out owns its destination. The old protected screen must
    // not race it with an automatic return-to-screen redirect.
    if (signingOut.current) {
      if (!auth) return;
      signingOut.current = false;
    }
    if (screen === "home")
      router.replace(`${state.role ? home : "/login"}?lang=${locale}` as Route);
    else if (!auth && !state.role)
      router.replace(
        `/login?lang=${locale}&next=${encodeURIComponent(pathname + "?" + query.toString())}` as Route,
      );
    else if (!auth && !state.verified)
      router.replace(`/verify-email?lang=${locale}` as Route);
    else if (
      (!auth || screen === "consent") &&
      state.role &&
      !state.consent &&
      screen !== "consent"
    )
      router.replace(`/consent?lang=${locale}` as Route);
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [
    auth,
    home,
    loading,
    locale,
    pathname,
    query,
    router,
    screen,
    state.consent,
    state.role,
    state.verified,
  ]);
  const signedOut = () => {
    signingOut.current = true;
    update((current) => ({
      ...current,
      role: null,
      account: "NEW",
      consent: false,
      verified: true,
    }));
    router.push(`/login?lang=${locale}` as Route);
  };
  const boundary = (
    <div className={styles.demoBadge} role="note">
      {t(
        "Synthetic demo · Simulated services · Reload clears demo data",
        "عرض تجريبي · خدمات محاكاة · إعادة التحميل تمسح بيانات العرض",
      )}
    </div>
  );
  if (auth)
    return (
      <>
        {boundary}
        <ProductAuth
          mode={authModes[screen as keyof typeof authModes]}
          locale={locale}
          fixture={fixture}
          email={query.get("email") ?? undefined}
          token={callbackToken ?? query.get("token") ?? undefined}
          next={query.get("next") ?? undefined}
        />
      </>
    );
  if (!state.role || !state.verified || !state.consent || screen === "home")
    return (
      <>
        {boundary}
        <p role="status">{t("Checking access…", "فحص الوصول…")}</p>
      </>
    );
  const allowedRole =
    screen === "decisions" || screen.startsWith("admin-")
      ? ["admin", "second-admin"].includes(state.role)
      : ["campaign-list", "invitation", "collection"].includes(screen)
        ? state.role === "leader"
        : screen === "settings" || state.role !== "leader";
  const general = [
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
    "expired",
    "replayed",
    "stale",
  ];
  const blocked =
    !allowedRole ||
    (scope && !sampleScopeAvailable(state, scope.cohortId, scope.unitId));
  const special =
    screen === "decisions" ||
    (screen === "collection" &&
      ![
        "empty",
        "forbidden",
        "wrong-scope",
        "expired",
        "replayed",
        "stale",
      ].includes(fixture)) ||
    screen === "invitation";
  let content: ReactNode;
  if (loading || blocked || (!special && general.includes(fixture))) {
    const message = loading
      ? t("Loading…", "جار التحميل…")
      : !allowedRole || fixture === "forbidden" || fixture === "wrong-scope"
        ? t(
            "Access unavailable for this account or scope.",
            "الوصول غير متاح لهذا الحساب أو النطاق.",
          )
        : blocked ||
            ["locked", "unpublished", "no-ready-source"].includes(fixture)
          ? t(
              "This unit is unavailable. Its cohort, publication or approved sources do not meet availability requirements.",
              "هذه الوحدة غير متاحة. المجموعة أو النشر أو المصادر المعتمدة لا تستوفي شروط الإتاحة.",
            )
          : fixture === "empty" || fixture === "no-membership"
            ? t(
                "Nothing to show yet. No assigned or available records.",
                "لا توجد سجلات متاحة أو مسندة للعرض بعد.",
              )
            : fixture === "quota"
              ? t(
                  "Allowance unavailable. Try again later; no numeric limit is approved.",
                  "الرصيد غير متاح. حاول لاحقًا؛ لم يعتمد حد رقمي.",
                )
              : fixture === "capacity"
                ? t(
                    "Capacity is temporarily unavailable. Try again later.",
                    "السعة غير متاحة مؤقتًا. حاول لاحقًا.",
                  )
                : fixture === "offline"
                  ? t(
                      "Connection interrupted. Your current demo records remain in this tab.",
                      "توقف الاتصال. سجلات العرض الحالية تبقى في هذا التبويب.",
                    )
                  : ["expired", "replayed"].includes(fixture)
                    ? t(
                        "This link or assignment has expired or was already used. Return and request a fresh link.",
                        "انتهى الرابط أو التكليف أو استخدم سابقًا. ارجع واطلب رابطًا جديدًا.",
                      )
                    : fixture === "stale"
                      ? t(
                          "This view changed. Reload its current state before continuing.",
                          "تغيرت هذه الصفحة. أعد تحميل حالتها الحالية قبل المتابعة.",
                        )
                      : t(
                          "This view could not be loaded. Please retry.",
                          "تعذر تحميل هذا العرض. أعد المحاولة.",
                        );
    content = (
      <section className={styles.panel} aria-live="polite">
        <h2>{message}</h2>
        {!loading ? (
          <div className={styles.actions}>
            <Button
              onClick={() => {
                const next = new URLSearchParams(query);
                next.delete("fixture");
                router.replace(`${pathname}?${next}` as Route);
              }}
            >
              {t("Retry", "إعادة المحاولة")}
            </Button>
            <ProductLink href={home} locale={locale}>
              {t("Back", "العودة")}
            </ProductLink>
          </div>
        ) : null}
      </section>
    );
  } else if (screen === "catalog") {
    const rows = reviewCatalogRows.filter((row) =>
      sampleScopeAvailable(state, row.cohort.id, row.unit.id),
    );
    content = (
      <StudyShelf
        initialLocale={locale}
        journey={resolveCatalogJourney(
          rows,
          parseCatalogSelectionHints(Object.fromEntries(query)),
        )}
        state="READY"
        basePath="/learn"
        synthetic
        completeNavigation
        unitPresentationById={syntheticUnitPresentationById}
      />
    );
  } else if (scope)
    content = (
      <ProductStudy
        screen={screen}
        scope={scope}
        locale={locale}
        base={`/learn/${scope.cohortId}/${scope.unitId}`}
        scenario={fixture}
      />
    );
  else if (screen === "settings")
    content = <ProductSettings locale={locale} signOut={signedOut} />;
  else if (screen === "decisions")
    content = <ProductAdmin locale={locale} fixture={fixture} />;
  else if (screen === "collection")
    content = <ProductCollection locale={locale} fixture={fixture} />;
  else if (screen === "campaign-list" || screen === "invitation")
    content = (
      <ProductCampaigns locale={locale} screen={screen} scenario={fixture} />
    );
  else
    content = (
      <ProductResource locale={locale} screen={screen} scenario={fixture} />
    );
  const standalone =
    ["catalog", "decisions", "collection"].includes(screen) &&
    !loading &&
    !blocked &&
    (special || !general.includes(fixture));
  return (
    <>
      {boundary}
      <div className={styles.accountUtility}>
        <span>
          {t("Account", "الحساب")}:{" "}
          <bdi>
            {state.role === "student"
              ? "student@example.invalid"
              : state.role === "leader"
                ? "leader@example.invalid"
                : state.role === "admin"
                  ? "admin@example.invalid"
                  : "second-admin@example.invalid"}
          </bdi>
        </span>
        <ProductLink href="/settings" locale={locale}>
          {t("Settings", "الإعدادات")}
        </ProductLink>
        <Button onClick={signedOut}>{t("Sign out", "تسجيل الخروج")}</Button>
      </div>
      {scope ? (
        <WorkspaceFrame
          scope={scope}
          completeNavigation
          available={!blocked && !general.includes(fixture)}
        >
          <div className={styles.studyBody}>{content}</div>
        </WorkspaceFrame>
      ) : standalone ? (
        content
      ) : (
        <ProductResourceShell locale={locale} home={home} screen={screen}>
          {content}
        </ProductResourceShell>
      )}
    </>
  );
}

function ProductResourceShell({
  locale,
  home,
  screen,
  children,
}: {
  locale: Locale;
  home: string;
  screen: string;
  children: ReactNode;
}) {
  const query = useSearchParams();
  const pathname = usePathname();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const nav = screen.startsWith("admin-")
    ? [
        ["admin", ["Decision queue", "قائمة القرارات"]] as const,
        ...Object.entries(resourceNames).map(
          ([key, value]) => [`admin/${key}`, value] as const,
        ),
      ]
    : [
        [
          home.slice(1),
          home === "/batch-leader"
            ? ["Campaigns", "الحملات"]
            : ["Study Shelf", "رف المذاكرة"],
        ] as const,
      ];
  const languages = (language: string) => {
    const next = new URLSearchParams(query);
    next.set("lang", language);
    return `${pathname}?${next}`;
  };
  const title = screen.startsWith("admin-")
    ? text(resourceNames[screen.slice(6) as keyof typeof resourceNames], locale)
    : screen === "settings"
      ? t("Settings", "الإعدادات")
      : screen === "invitation"
        ? t("Campaign invitation", "دعوة حملة")
        : t("Assigned campaigns", "الحملات المسندة");
  return (
    <div className={styles.layout} dir={locale === "ar" ? "rtl" : "ltr"}>
      <aside className={styles.rail}>
        <ProductLink href={home} locale={locale}>
          UniMind
        </ProductLink>
        <nav aria-label={t("Product navigation", "تنقل المنتج")}>
          {nav.map(([path, label]) => (
            <ProductLink key={path} href={`/${path}`} locale={locale}>
              {locale === "ar" ? label[1] : label[0]}
            </ProductLink>
          ))}
        </nav>
      </aside>
      <main className={styles.main}>
        <div className={styles.actions}>
          <ProductLink href={languages("en")} locale="en">
            EN
          </ProductLink>
          <ProductLink href={languages("ar")} locale="ar">
            عربي
          </ProductLink>
        </div>
        <h1>{title}</h1>
        {children}
      </main>
    </div>
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
  const router = useRouter();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  return (
    <>
      <section className={styles.panel}>
        <Select
          id="interface-language"
          label={t("Interface language", "لغة الواجهة")}
          value={locale}
          options={[
            ["en", "English"],
            ["ar", "العربية"],
          ]}
          onChange={(value) =>
            router.replace(`/settings?lang=${value}` as Route)
          }
        />
      </section>
      <section className={styles.panel}>
        <h2>{t("Future exchange sharing", "مشاركة المحادثات القادمة")}</h2>
        <Select
          id="sharing-mode"
          label={t("Sharing mode", "وضع المشاركة")}
          value={state.sharing}
          options={[
            [
              "shared",
              t("Founder-visible by default", "ظاهر للمؤسسين افتراضيًا"),
            ],
            ["private", t("Private / no sharing", "خاص / عدم مشاركة")],
          ]}
          onChange={(value) =>
            update((current) => ({
              ...current,
              sharing: value === "private" ? "private" : "shared",
            }))
          }
        />
        <p>
          {t(
            "Earlier exchanges keep their recorded mode. Private mode is separate from saving and retention. Qualifying reports permit audited review of the reported exchange only; exact disclosure awaits D-08.",
            "تحتفظ المحادثات السابقة بوضعها المسجل. الخصوصية منفصلة عن الحفظ والاحتفاظ. البلاغ المؤهل يسمح بمراجعة المحادثة المبلغ عنها فقط مع التدقيق؛ تفاصيل الإفصاح تنتظر D-08.",
          )}
        </p>
      </section>
      <section className={styles.panel}>
        <h2>{t("Saving and retention", "الحفظ والاحتفاظ")}</h2>
        <Notice>
          {t(
            "Retention settings await D-08. No period or deletion behavior has been approved.",
            "إعدادات الاحتفاظ تنتظر D-08. لم تعتمد مدة أو طريقة حذف.",
          )}
        </Notice>
      </section>
      <section className={styles.panel}>
        <h2>{t("Account", "الحساب")}</h2>
        <div className={styles.actions}>
          <ProductLink href="/forgot-password" locale={locale}>
            {t("Reset password", "تغيير كلمة المرور")}
          </ProductLink>
          <Button onClick={signOut}>{t("Sign out", "تسجيل الخروج")}</Button>
        </div>
      </section>
    </>
  );
}
