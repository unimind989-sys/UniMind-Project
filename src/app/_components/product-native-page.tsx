"use client";
import { useProductText } from "@/app/_components/product-copy";
import { useProductRouter } from "@/app/_components/product-navigation";
import { syntheticDemoTime } from "@/lib/demo/synthetic-clock.application";
import { formatCollectionDate } from "@/lib/i18n/collection-format";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { StudyShelf } from "@/app/learn/_components/study-shelf";
import { WorkspaceFrame } from "@/app/learn/_components/workspace-frame";
import {
  ProductStudy,
  UnitSwitch,
} from "@/app/learn/_components/product-study";
import { FrontendShell } from "./frontend-system";
import { AppShell } from "./app-shell";
import { AcademicSettings } from "./academic-settings";
import { AccountLayout } from "./account-layout";
import { useProductProfileName } from "./product-profile";
import { Appearance } from "./appearance";
import { Landing } from "./landing";
import { authorizedAcademicContext } from "@/lib/account/account.application";
import { syntheticUnitPresentationById } from "@/app/learn/synthetic-catalog";
import {
  parseCatalogSelectionHints,
  resolveCatalogJourney,
} from "@/lib/catalog/catalog-journey.application";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import { useProductServices, type ProductState } from "./product-services";
import { resolveStudyReturnPath } from "@/lib/study/study-origin.application";
import { recentStudyDetails } from "@/lib/study/recent-work.application";
import { studyRecovery } from "@/lib/study/study-recovery.application";
import { ProductAuth } from "./product-auth";
import { ProductAdmin } from "./product-admin";
import { adminPreviewReturn } from "./synthetic-admin-context";
import { AdminWorkspace } from "@/app/admin/_components/admin-workspace";
import { ProductCollection } from "./product-collection";
import {
  assignedSyntheticCampaigns,
  demoCampaignId,
} from "./synthetic-campaigns";
import { LeaderHome } from "@/app/batch-leader/_components/leader-home";
import { ProductCampaigns, ProductResource } from "./product-operations";
import { ChoiceGroup } from "./choice-group";
import { ProductLink, Button, Notice } from "./product-ui";
import {
  reviewCatalogRows,
  defaultScope,
  sampleScopeAvailable,
  resourceNames,
  text,
  type Locale,
} from "./synthetic-fixtures";
import styles from "./product.module.css";
import accountStyles from "./student-account.module.css";
import { useSyntheticNavigation } from "./product-navigation";
import {
  prepareStudyDensity,
  studyFixtureSourceCount,
} from "./synthetic-study-density";

const authModes = {
  login: "login",
  register: "register",
  "verify-email": "verify",
  consent: "consent",
  "forgot-password": "forgot",
  "reset-password": "reset",
} as const;

function currentStudyReturn(state: ProductState, now: number) {
  if (!state.role || state.role === "leader") return null;
  const preferred =
    state.role === "student" && state.academicContext
      ? authorizedAcademicContext(
          state.academicContext,
          reviewCatalogRows.filter((row) =>
            sampleScopeAvailable(state, row.cohort.id, row.unit.id),
          ),
        )
      : null;
  if (state.role === "student" && state.academicContext && !preferred)
    return null;
  for (const row of reviewCatalogRows) {
    if (!sampleScopeAvailable(state, row.cohort.id, row.unit.id)) continue;
    if (preferred && !authorizedAcademicContext(preferred, [row])) continue;
    const target = resolveStudyReturnPath(
      state.lastStudyPath,
      `/learn/${row.cohort.id}/${row.unit.id}`,
      state.attempts[row.unit.id],
      now,
    );
    if (target) return { ...target, unit: row.unit };
  }
  return null;
}

function currentStudyDetails(state: ProductState, locale: Locale, now: number) {
  const target = currentStudyReturn(state, now);
  if (!target) return null;
  const unitId = target.unit.id;
  return recentStudyDetails({
    tool: target.tool,
    locale,
    now,
    conversation: state.sessions.find(
      (session) =>
        session.scope === unitId && session.id === state.activeSessions[unitId],
    ),
    artifact: state.artifacts[unitId],
    attempt: state.attempts[unitId],
  });
}

export function ProductNativePage({
  screen,
  locale,
  fixture,
  scope: inputScope,
  callbackToken,
  campaignId = demoCampaignId,
}: {
  screen: string;
  locale: Locale;
  fixture: string;
  scope?: WorkspaceScope;
  callbackToken?: string | undefined;
  campaignId?: string;
}) {
  const { state, update, collectionMemory } = useProductServices();
  const [studyReturnTime, refreshStudyReturnTime] = useState(() => Date.now());
  const scope = inputScope
    ? {
        ...inputScope,
        sourceCount: studyFixtureSourceCount(
          state,
          inputScope.unitId,
          inputScope.sourceCount,
        ),
      }
    : undefined;
  const hosted = useSyntheticNavigation();
  const router = useProductRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  useEffect(() => {
    if (pathname !== "/learn") return;
    const target = currentStudyReturn(state, Date.now());
    if (target?.tool !== "attempt" && target?.tool !== "quiz-review") return;
    const attempt = target && state.attempts[target.unit.id];
    if (!attempt?.expiresAt || attempt.submitted || attempt.abandoned) return;
    const expiresAt = attempt.expiresAt;
    const timer = setInterval(() => {
      const now = Date.now();
      refreshStudyReturnTime(now);
      if (now >= expiresAt) clearInterval(timer);
    }, 500);
    return () => clearInterval(timer);
  }, [pathname, state]);
  const [loading, setLoading] = useState(fixture === "loading");
  const signingOut = useRef(false);
  const t = useProductText(locale);
  const auth = Object.hasOwn(authModes, screen);
  useEffect(() => {
    if (
      fixture !== "dense" ||
      hosted?.active ||
      !["campaign-list", "collection"].includes(screen)
    )
      return;
    update((current) =>
      current.role === "leader" &&
      current.verified &&
      current.consent &&
      !current.campaignDensity
        ? { ...current, campaignDensity: true }
        : current,
    );
  }, [
    fixture,
    hosted?.active,
    screen,
    state.role,
    state.verified,
    state.consent,
    update,
  ]);
  useEffect(() => {
    if (
      fixture !== "dense" ||
      hosted?.active ||
      inputScope?.unitId !== defaultScope.unitId
    )
      return;
    update((current) => {
      if (
        !current.verified ||
        !current.consent ||
        !["student", "admin", "second-admin"].includes(current.role ?? "") ||
        !sampleScopeAvailable(current, inputScope.cohortId, inputScope.unitId)
      )
        return current;
      return prepareStudyDensity(
        current,
        inputScope.unitId,
        current.studyLanguage ?? locale,
      );
    });
  }, [
    fixture,
    hosted?.active,
    inputScope?.cohortId,
    inputScope?.unitId,
    locale,
    state.consent,
    state.verified,
    state.role,
    state.availability,
    update,
  ]);
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
    if (screen === "home" && state.role)
      router.replace(`${home}?lang=${locale}` as Route);
    else if (screen === "home") return;
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
    collectionMemory.clear();
    if (hosted?.active) {
      update(() => ({
        ...state,
        role: null,
        displayName: null,
        studyLanguage: null,
        evidenceHintSeen: false,
        account: "NEW",
        consent: false,
        campaignDensity: false,
        submissions: [],
        chatDrafts: {},
        quizDrafts: {},
        lastStudyPath: null,
        academicContext: null,
        adminPreview: null,
        catalogChoice: state.catalogDraft ?? "MODULE",
      }));
      hosted.leave(locale);
      return;
    }
    signingOut.current = true;
    update((current) => ({
      ...current,
      role: null,
      displayName: null,
      studyLanguage: null,
      evidenceHintSeen: false,
      account: "NEW",
      consent: false,
      campaignDensity: false,
      submissions: [],
      verified: true,
      chatDrafts: {},
      quizDrafts: {},
      lastStudyPath: null,
      academicContext: null,
      adminPreview: null,
      catalogChoice: current.catalogDraft ?? "MODULE",
    }));
    router.push(`/login?lang=${locale}` as Route);
  };
  const boundary = hosted?.active ? null : (
    <div className={styles.demoBadge} role="note">
      {t(
        "Synthetic demo · Simulated services · Reload clears demo data",
        "عرض تجريبي · خدمات محاكاة · إعادة التحميل تمسح بيانات العرض",
      )}
      {" · "}
      {t("Demo clock", "ساعة العرض التجريبي")}:{" "}
      <bdi>{syntheticDemoTime.clockLabel}</bdi>
    </div>
  );
  if (screen === "home" && !state.role) return <Landing locale={locale} />;
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
    (screen === "collection" &&
      campaignId !== demoCampaignId &&
      !state.campaignDensity) ||
    (scope && !sampleScopeAvailable(state, scope.cohortId, scope.unitId));
  const studyView = Boolean(scope) || screen === "catalog";
  const recovery =
    studyView && !blocked ? studyRecovery(screen, fixture, locale) : null;
  const visibleStudyScope =
    scope &&
    !blocked &&
    (!general.includes(fixture) || recovery?.transient === true);
  const special =
    screen === "decisions" ||
    (screen === "collection" &&
      ![
        "empty",
        "error",
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
      : (recovery?.message ??
        (!allowedRole ||
        (screen === "collection" &&
          campaignId !== demoCampaignId &&
          !state.campaignDensity) ||
        fixture === "forbidden" ||
        fixture === "wrong-scope"
          ? t(
              "Access unavailable for this account or scope.",
              "الوصول غير متاح لهذا الحساب أو النطاق.",
            )
          : scope && blocked
            ? t("Study access unavailable", "الوصول للمذاكرة غير متاح")
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
                            )));
    content = (
      <section className={styles.panel} aria-live="polite">
        <h2>{message}</h2>
        {recovery && !loading ? <p>{recovery.detail}</p> : null}
        {!loading &&
        !blocked &&
        allowedRole &&
        fixture === "expired" &&
        ["collection", "campaign-list"].includes(screen) ? (
          <p>
            {t("Assignment expired", "انتهى التكليف")}:{" "}
            {formatCollectionDate(locale, syntheticDemoTime.expiredAt)}
          </p>
        ) : null}
        {!loading ? (
          <div className={styles.actions}>
            {!studyView || (!blocked && recovery?.transient) ? (
              <Button
                onClick={() => {
                  const next = new URLSearchParams(query);
                  next.delete("fixture");
                  router.replace(`${pathname}?${next}` as Route);
                }}
              >
                {recovery?.retryLabel ?? t("Retry", "إعادة المحاولة")}
              </Button>
            ) : null}
            {scope && recovery?.transient && !blocked ? (
              <ProductLink
                href={`/learn/${scope.cohortId}/${scope.unitId}`}
                locale={locale}
              >
                {t("View available materials", "عرض مصادر المذاكرة المتاحة")}
              </ProductLink>
            ) : null}
            {!(
              scope &&
              recovery?.transient &&
              ["admin", "second-admin"].includes(state.role)
            ) ? (
              <ProductLink
                href={
                  scope &&
                  (state.role === "admin" || state.role === "second-admin")
                    ? adminPreviewReturn(state, scope, locale)
                    : studyView && state.role === "student"
                      ? "/learn?view=subjects"
                      : home
                }
                locale={locale}
              >
                {scope &&
                (state.role === "admin" || state.role === "second-admin")
                  ? t("Return to Admin", "العودة للإدارة")
                  : studyView && state.role === "student"
                    ? t("Browse available subjects", "تصفح المواد المتاحة")
                    : t("Back", "العودة")}
              </ProductLink>
            ) : null}
          </div>
        ) : null}
      </section>
    );
  } else if (screen === "catalog") {
    const rows = reviewCatalogRows
      .filter((row) => sampleScopeAvailable(state, row.cohort.id, row.unit.id))
      .map((row) =>
        row.unit.id === state.studyDensityUnitId
          ? {
              ...row,
              unit: {
                ...row.unit,
                sourceCount: studyFixtureSourceCount(
                  state,
                  row.unit.id,
                  row.unit.sourceCount ?? 8,
                ),
              },
            }
          : row,
      );
    if (
      !authorizedAcademicContext(state.academicContext, rows) &&
      !query.has("stage")
    )
      return (
        <AppShell locale={locale} synthetic title={t("Study", "المذاكرة")}>
          <AcademicSettings
            locale={locale}
            rows={rows}
            initialContext={state.academicContext}
            onboarding
            save={async (context) => {
              if (!authorizedAcademicContext(context, rows))
                return { status: "INVALID" };
              update((current) => ({ ...current, academicContext: context }));
              return { status: "SAVED" };
            }}
          />
        </AppShell>
      );
    content = (
      <StudyShelf
        initialLocale={locale}
        journey={resolveCatalogJourney(
          rows,
          query.has("stage")
            ? parseCatalogSelectionHints(Object.fromEntries(query))
            : (state.academicContext ?? {}),
        )}
        state="READY"
        basePath="/learn"
        synthetic
        completeNavigation
        lastStudyPath={currentStudyReturn(state, studyReturnTime)?.href ?? null}
        lastStudyDetails={currentStudyDetails(state, locale, studyReturnTime)}
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
    content = (
      <ProductCollection
        locale={locale}
        fixture={fixture}
        campaignId={campaignId}
      />
    );
  else if (screen === "campaign-list")
    content = (
      <LeaderHome
        referenceTime={syntheticDemoTime.now}
        campaigns={assignedSyntheticCampaigns(state, locale)}
        locale={locale}
        history={query.get("view") === "history"}
        synthetic
      />
    );
  else if (screen === "invitation")
    content = (
      <ProductCampaigns locale={locale} screen={screen} scenario={fixture} />
    );
  else
    content = (
      <ProductResource locale={locale} screen={screen} scenario={fixture} />
    );
  if (scope && !visibleStudyScope) {
    return (
      <AppShell
        locale={locale}
        synthetic
        role={
          state.role === "leader"
            ? "leader"
            : state.role === "student"
              ? "student"
              : "admin"
        }
        roleLabel={
          state.role === "second-admin"
            ? t("Second Admin", "المسؤول الثاني")
            : undefined
        }
        title={t("Study", "المذاكرة")}
      >
        <h1>{t("Study", "المذاكرة")}</h1>
        <div className={styles.studyBody}>{content}</div>
      </AppShell>
    );
  }
  const standalone =
    ["catalog", "decisions", "collection"].includes(screen) &&
    !loading &&
    !blocked &&
    (special || !general.includes(fixture));
  if (scope && visibleStudyScope) {
    return (
      <FrontendShell
        locale={locale}
        title={locale === "ar" ? scope.unitTitleAr : scope.unitTitleEn}
        unitLabel={
          locale === "ar"
            ? scope.unitLabelSingularAr
            : scope.unitLabelSingularEn
        }
        institution={
          locale === "ar" ? scope.institutionNameAr : scope.institutionNameEn
        }
        context={`${locale === "ar" ? scope.programNameAr : scope.programNameEn} · ${locale === "ar" ? scope.levelNameAr : scope.levelNameEn} · ${locale === "ar" ? scope.termNameAr : scope.termNameEn}`}
        base={`/learn/${scope.cohortId}/${scope.unitId}`}
        scopeControl={
          <UnitSwitch
            scope={scope}
            locale={locale}
            base={`/learn/${scope.cohortId}/${scope.unitId}`}
          />
        }
        available={Boolean(visibleStudyScope)}
        account={`${state.role}@example.invalid`}
        returnToAdmin={state.role === "admin" || state.role === "second-admin"}
        adminReturnHref={adminPreviewReturn(state, scope, locale)}
        signOut={signedOut}
      >
        <div className={styles.studyBody}>{content}</div>
      </FrontendShell>
    );
  }
  if (screen === "catalog" && standalone) return content;
  if ((state.role === "admin" || state.role === "second-admin") && !scope) {
    if (screen === "settings")
      return (
        <AppShell
          locale={locale}
          role="admin"
          roleLabel={
            state.role === "second-admin"
              ? t("Second Admin", "المسؤول الثاني")
              : t("Admin", "مسؤول")
          }
          synthetic
          title={t("Account", "الحساب")}
        >
          <h1>{t("Account", "الحساب")}</h1>
          {content}
        </AppShell>
      );
    return (
      <AdminWorkspace
        locale={locale}
        roleLabel={
          state.role === "second-admin"
            ? t("Second Admin", "المسؤول الثاني")
            : t("Admin", "مسؤول")
        }
        synthetic
        actions={
          <Button variant="quiet" onClick={signedOut}>
            {t("Sign out", "تسجيل الخروج")}
          </Button>
        }
        resource={screen.startsWith("admin-") ? screen.slice(6) : undefined}
      >
        {content}
      </AdminWorkspace>
    );
  }
  if (state.role === "leader" && !scope) {
    if (
      screen === "campaign-list" &&
      !loading &&
      !blocked &&
      fixture === "empty"
    )
      return (
        <LeaderHome
          referenceTime={syntheticDemoTime.now}
          campaigns={[]}
          locale={locale}
          history={query.get("view") === "history"}
          synthetic
        />
      );
    if (
      (screen === "collection" && standalone) ||
      (screen === "campaign-list" &&
        !loading &&
        !blocked &&
        !general.includes(fixture))
    )
      return content;
    const leaderTitle =
      screen === "settings"
        ? t("Account", "الحساب")
        : screen === "invitation"
          ? t("Campaign invitation", "دعوة حملة")
          : query.get("view") === "history"
            ? t("Latest submissions", "آخر الإرسالات")
            : t("Source intake", "استلام المصادر");
    return (
      <AppShell locale={locale} role="leader" synthetic title={leaderTitle}>
        <h1>{leaderTitle}</h1>
        {content}
      </AppShell>
    );
  }
  if (state.role === "student" && !scope)
    return (
      <AppShell
        locale={locale}
        synthetic
        title={
          screen === "settings"
            ? t("Settings", "الإعدادات")
            : t("Study", "المذاكرة")
        }
      >
        <h1>
          {screen === "settings"
            ? t("Settings", "الإعدادات")
            : t("Your Study Shelf", "رف المذاكرة")}
        </h1>
        {content}
      </AppShell>
    );
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
  const t = useProductText(locale);
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
