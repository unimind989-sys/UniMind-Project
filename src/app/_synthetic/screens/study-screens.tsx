"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/app/_components/app-shell";
import { AcademicSettings } from "@/app/_components/academic-settings";
import styles from "@/app/_components/product.module.css";
import { StudyShelf } from "@/app/learn/_components/study-shelf";
import { ProductStudy } from "@/app/learn/_components/product-study";
import { StudyFrame } from "@/app/learn/_components/study-frame";
import { authorizedAcademicContext } from "@/lib/account/account.application";
import {
  parseCatalogSelectionHints,
  resolveCatalogJourney,
} from "@/lib/catalog/catalog-journey.application";
import { adminPreviewReturn } from "@/lib/demo/synthetic-admin-context.application";
import {
  defaultScope,
  reviewCatalogRows,
  sampleScopeAvailable,
  syntheticShelfState,
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
  const shelfState = syntheticShelfState(page.fixture);
  if (access.panel)
    content = <FixturePanel ctx={screen} access={access} page={page} />;
  else if (shelfState)
    // Loopback review of the shelf's own access states; no catalog rows.
    content = (
      <StudyShelf
        initialLocale={locale}
        journey={resolveCatalogJourney([], {})}
        state={shelfState}
        basePath="/learn"
        synthetic
      />
    );
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
        lastStudyPath={currentStudyReturn(state, studyReturnTime)?.href ?? null}
        lastStudyDetails={currentStudyDetails(state, locale, studyReturnTime)}
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
  const { state, update, t } = screen;
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
    <StudyFrame
      scope={scope}
      locale={locale}
      units={reviewCatalogRows
        .filter(
          (row) =>
            row.cohort.id === scope.cohortId &&
            sampleScopeAvailable(state, row.cohort.id, row.unit.id),
        )
        .map((row) => row.unit)}
      available={visible}
      returnToAdmin={state.role === "admin" || state.role === "second-admin"}
      adminReturnHref={adminPreviewReturn(state, scope, locale)}
    >
      {content}
    </StudyFrame>
  );
}
