"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/app/_components/app-shell";
import { AcademicSettings } from "@/app/_components/academic-settings";
import { FrontendShell } from "@/app/_components/frontend-system";
import styles from "@/app/_components/product.module.css";
import { StudyShelf } from "@/app/learn/_components/study-shelf";
import {
  ProductStudy,
  UnitSwitch,
} from "@/app/learn/_components/product-study";
import { authorizedAcademicContext } from "@/lib/account/account.application";
import {
  parseCatalogSelectionHints,
  resolveCatalogJourney,
} from "@/lib/catalog/catalog-journey.application";
import { syntheticUnitPresentationById } from "@/lib/demo/synthetic-catalog.application";
import { adminPreviewReturn } from "@/lib/demo/synthetic-admin-context.application";
import {
  defaultScope,
  reviewCatalogRows,
  sampleScopeAvailable,
} from "@/lib/demo/synthetic-fixtures.application";
import {
  prepareStudyDensity,
  studyFixtureSourceCount,
} from "@/lib/demo/synthetic-study-density.application";
import {
  currentStudyDetails,
  currentStudyReturn,
} from "@/lib/demo/synthetic-study-return.application";
import {
  AccessPending,
  FixturePanel,
  RoleChrome,
  accessPending,
  generalFixtures,
  screenAccess,
  useSyntheticScreen,
  type ScreenProps,
} from "../screen-frame";

/** `/learn`: first-run academic setup, then the Study Shelf. */
export function CatalogScreen(page: ScreenProps) {
  const screen = useSyntheticScreen(page);
  const { state, update, pathname, query, t } = screen;
  const { locale } = page;
  const [studyReturnTime, refreshStudyReturnTime] = useState(() => Date.now());
  useEffect(() => {
    // A timed quiz shown as the latest work keeps its remaining time current.
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
  if (accessPending(screen)) return <AccessPending screen={screen} />;
  const access = screenAccess(screen, page);
  let content;
  if (access.panel)
    content = <FixturePanel ctx={screen} access={access} page={page} />;
  else {
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
  }
  if (access.standalone) return content;
  return (
    <RoleChrome ctx={screen} access={access} page={page}>
      {content}
    </RoleChrome>
  );
}

/** `/learn/:cohortId/:unitId/*`: one unit's materials and study tools. */
export function StudyScreen(
  page: ScreenProps & Required<Pick<ScreenProps, "scope">>,
) {
  const screen = useSyntheticScreen(page);
  const { state, update, t, signedOut } = screen;
  const { locale, fixture, scope: inputScope } = page;
  const scope = {
    ...inputScope,
    sourceCount: studyFixtureSourceCount(
      state,
      inputScope.unitId,
      inputScope.sourceCount,
    ),
  };
  useEffect(() => {
    // The local dense fixture prepares a long study history for this unit.
    if (
      fixture !== "dense" ||
      screen.hosted ||
      inputScope.unitId !== defaultScope.unitId
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
    screen.hosted,
    inputScope.cohortId,
    inputScope.unitId,
    locale,
    state.consent,
    state.verified,
    state.role,
    state.availability,
    update,
  ]);
  if (accessPending(screen)) return <AccessPending screen={screen} />;
  const scoped = { ...page, scope };
  const access = screenAccess(screen, scoped);
  const visible =
    !access.blocked &&
    (!generalFixtures.includes(fixture) || access.recovery?.transient === true);
  const base = `/learn/${scope.cohortId}/${scope.unitId}`;
  const content = access.panel ? (
    <FixturePanel ctx={screen} access={access} page={scoped} />
  ) : (
    <ProductStudy
      screen={page.screen}
      scope={scope}
      locale={locale}
      base={base}
      scenario={fixture}
    />
  );
  if (!visible)
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
  return (
    <FrontendShell
      locale={locale}
      title={locale === "ar" ? scope.unitTitleAr : scope.unitTitleEn}
      unitLabel={
        locale === "ar" ? scope.unitLabelSingularAr : scope.unitLabelSingularEn
      }
      institution={
        locale === "ar" ? scope.institutionNameAr : scope.institutionNameEn
      }
      context={`${locale === "ar" ? scope.programNameAr : scope.programNameEn} · ${locale === "ar" ? scope.levelNameAr : scope.levelNameEn} · ${locale === "ar" ? scope.termNameAr : scope.termNameEn}`}
      base={base}
      scopeControl={<UnitSwitch scope={scope} locale={locale} base={base} />}
      available={visible}
      account={`${state.role}@example.invalid`}
      returnToAdmin={state.role === "admin" || state.role === "second-admin"}
      adminReturnHref={adminPreviewReturn(state, scope, locale)}
      signOut={signedOut}
    >
      <div className={styles.studyBody}>{content}</div>
    </FrontendShell>
  );
}
