"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { useProductText } from "@/app/_components/product-copy";
import {
  useHostedSynthetic,
  useProductRouter,
  useSyntheticNavigation,
} from "@/app/_components/product-navigation";
import { useProductServices } from "@/app/_components/product-services";
import { AppShell } from "@/app/_components/app-shell";
import { Button, ProductLink } from "@/app/_components/product-ui";
import { AdminWorkspace } from "@/app/admin/_components/admin-workspace";
import { LeaderHome } from "@/app/batch-leader/_components/leader-home";
import styles from "@/app/_components/product.module.css";
import { formatCollectionDate } from "@/lib/i18n/collection-format";
import { studyRecovery } from "@/lib/study/study-recovery.application";
import { syntheticDemoTime } from "@/lib/demo/synthetic-clock.application";
import { adminPreviewReturn } from "@/lib/demo/synthetic-admin-context.application";
import { demoCampaignId } from "@/lib/demo/synthetic-campaigns.application";
import { sampleScopeAvailable } from "@/lib/demo/synthetic-fixtures.application";
import type { SyntheticPage } from "@/lib/demo/synthetic-route.application";

export type ScreenProps = Omit<SyntheticPage, "composer">;

/** Fixture states that replace a signed-in screen with one recovery panel. */
export const generalFixtures = [
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

const authScreens = new Set([
  "login",
  "register",
  "verify-email",
  "consent",
  "welcome",
  "forgot-password",
  "reset-password",
]);

/**
 * Shared state, access redirects and sign-out for every synthetic screen.
 * The composer owns its screen-specific effects and chrome.
 */
export function useSyntheticScreen({ screen, locale, fixture }: ScreenProps) {
  const services = useProductServices();
  const { state, update, collectionMemory } = services;
  const hosted = useHostedSynthetic();
  const synthetic = useSyntheticNavigation();
  const router = useProductRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  const [loading, setLoading] = useState(fixture === "loading");
  const signingOut = useRef(false);
  const t = useProductText(locale);
  const auth = authScreens.has(screen);
  const home =
    state.role === "leader"
      ? "/batch-leader"
      : state.role === "admin" || state.role === "second-admin"
        ? "/admin"
        : "/learn";
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
    // The real gate order: verification, consent, then the profile step.
    else if (
      !auth &&
      state.role &&
      state.verified &&
      state.consent &&
      !state.displayName?.trim()
    )
      router.replace(
        `/welcome?lang=${locale}&next=${encodeURIComponent(pathname + (query.size ? "?" + query.toString() : ""))}` as Route,
      );
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
    state.displayName,
    state.role,
    state.verified,
  ]);
  const signedOut = () => {
    collectionMemory.clear();
    if (hosted && synthetic) {
      update(() => ({
        ...state,
        role: null,
        accountEmail: null,
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
      synthetic.leave(locale);
      return;
    }
    signingOut.current = true;
    update((current) => ({
      ...current,
      role: null,
      accountEmail: null,
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
  return {
    ...services,
    hosted,
    router,
    pathname,
    query,
    t,
    loading,
    home,
    signedOut,
  };
}

export type SyntheticScreen = ReturnType<typeof useSyntheticScreen>;

/** The loopback demo's persistent notice; hosted entry never shows it. */
export function DemoBoundary({ screen }: { screen: SyntheticScreen }) {
  if (screen.hosted) return null;
  return (
    <div className={styles.demoBadge} role="note">
      {screen.t(
        "Synthetic demo · Simulated services · Reload clears demo data",
        "عرض تجريبي · خدمات محاكاة · إعادة التحميل تمسح بيانات العرض",
      )}
      {" · "}
      {screen.t("Demo clock", "ساعة العرض التجريبي")}:{" "}
      <bdi>{syntheticDemoTime.clockLabel}</bdi>
    </div>
  );
}

/** A signed-out, unverified or unconsented account is being redirected. */
export function accessPending({ state }: SyntheticScreen) {
  return (
    !state.role ||
    !state.verified ||
    !state.consent ||
    !state.displayName?.trim()
  );
}

/** Shown while the access redirect for the current account is pending. */
export function AccessPending({ screen }: { screen: SyntheticScreen }) {
  return (
    <>
      <DemoBoundary screen={screen} />
      <p role="status">{screen.t("Checking access…", "فحص الوصول…")}</p>
    </>
  );
}

/** Whether the signed-in role may see this screen, and whether a fixture or
 * access state replaces it with the recovery panel. */
export function screenAccess(
  ctx: SyntheticScreen,
  { screen, fixture, locale, scope, campaignId = demoCampaignId }: ScreenProps,
) {
  const { state } = ctx;
  const role = state.role ?? "student";
  const allowedRole =
    screen === "decisions" || screen.startsWith("admin-")
      ? ["admin", "second-admin"].includes(role)
      : ["campaign-list", "invitation", "collection"].includes(screen)
        ? role === "leader"
        : screen === "settings" || role !== "leader";
  const unassignedCampaign =
    screen === "collection" &&
    campaignId !== demoCampaignId &&
    !state.campaignDensity;
  const blocked = Boolean(
    !allowedRole ||
    unassignedCampaign ||
    (scope && !sampleScopeAvailable(state, scope.cohortId, scope.unitId)),
  );
  const studyView = Boolean(scope) || screen === "catalog";
  const recovery =
    studyView && !blocked ? studyRecovery(screen, fixture, locale) : null;
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
  const panel =
    ctx.loading || blocked || (!special && generalFixtures.includes(fixture));
  const standalone =
    ["catalog", "decisions", "collection"].includes(screen) &&
    !ctx.loading &&
    !blocked &&
    (special || !generalFixtures.includes(fixture));
  return {
    allowedRole,
    unassignedCampaign,
    blocked,
    studyView,
    recovery,
    special,
    panel,
    standalone,
  };
}

export type ScreenAccess = ReturnType<typeof screenAccess>;

/** The single loading, access and fixture recovery panel. */
export function FixturePanel({
  ctx,
  access,
  page,
}: {
  ctx: SyntheticScreen;
  access: ScreenAccess;
  page: ScreenProps;
}) {
  const { state, t, loading, router, pathname, query, home } = ctx;
  const { blocked, allowedRole, recovery, studyView, unassignedCampaign } =
    access;
  const { screen, fixture, locale, scope } = page;
  const role = state.role;
  const message = loading
    ? t("Loading…", "جار التحميل…")
    : (recovery?.message ??
      (!allowedRole ||
      unassignedCampaign ||
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
  return (
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
            ["admin", "second-admin"].includes(role ?? "")
          ) ? (
            <ProductLink
              href={
                scope && (role === "admin" || role === "second-admin")
                  ? adminPreviewReturn(state, scope, locale)
                  : studyView && role === "student"
                    ? "/learn?view=subjects"
                    : home
              }
              locale={locale}
            >
              {scope && (role === "admin" || role === "second-admin")
                ? t("Return to Admin", "العودة للإدارة")
                : studyView && role === "student"
                  ? t("Browse available subjects", "تصفح المواد المتاحة")
                  : t("Back", "العودة")}
            </ProductLink>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Role chrome around a non-study screen: Admin workspace, Batch Leader shell
 * or the student shell. Study units use the workspace shell instead.
 */
export function RoleChrome({
  ctx,
  access,
  page,
  children,
}: {
  ctx: SyntheticScreen;
  access: ScreenAccess;
  page: ScreenProps;
  children: ReactNode;
}) {
  const { state, t, loading, query, signedOut } = ctx;
  const { screen, fixture, locale } = page;
  const { blocked, standalone } = access;
  if (state.role === "admin" || state.role === "second-admin") {
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
          {children}
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
        {children}
      </AdminWorkspace>
    );
  }
  if (state.role === "leader") {
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
        !generalFixtures.includes(fixture))
    )
      return children;
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
        {children}
      </AppShell>
    );
  }
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
      {children}
    </AppShell>
  );
}
