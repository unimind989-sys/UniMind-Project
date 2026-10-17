"use client";

import type { ReactNode } from "react";
import { FrontendShell } from "@/app/_components/frontend-system";
import styles from "@/app/_components/product.module.css";
import type { Locale } from "@/lib/i18n/locale";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import { UnitSwitch, type UnitChoice } from "./study/unit-switch";

/**
 * The unit workspace frame shared by real routes and the synthetic runtime:
 * subject header, unit switch, tool navigation and the study body.
 */
export function StudyFrame({
  scope,
  locale,
  units,
  available = true,
  synthetic = true,
  profileName,
  account,
  signOut,
  returnToAdmin = false,
  adminReturnHref,
  children,
}: {
  scope: WorkspaceScope;
  locale: Locale;
  units: readonly UnitChoice[];
  available?: boolean;
  synthetic?: boolean;
  profileName?: string | null | undefined;
  account?: string;
  signOut?: () => void;
  returnToAdmin?: boolean;
  adminReturnHref?: string;
  children: ReactNode;
}) {
  const ar = locale === "ar";
  const base = `/learn/${scope.cohortId}/${scope.unitId}`;
  return (
    <FrontendShell
      locale={locale}
      title={ar ? scope.unitTitleAr : scope.unitTitleEn}
      unitLabel={ar ? scope.unitLabelSingularAr : scope.unitLabelSingularEn}
      institution={ar ? scope.institutionNameAr : scope.institutionNameEn}
      context={[
        ar ? scope.programNameAr : scope.programNameEn,
        ar ? scope.levelNameAr : scope.levelNameEn,
        ar ? scope.termNameAr : scope.termNameEn,
      ].join(" · ")}
      base={base}
      scopeControl={
        units.length > 0 ? (
          <UnitSwitch scope={scope} locale={locale} base={base} units={units} />
        ) : undefined
      }
      available={available}
      synthetic={synthetic}
      profileName={profileName}
      {...(account ? { account } : {})}
      {...(signOut ? { signOut } : {})}
      returnToAdmin={returnToAdmin}
      {...(adminReturnHref ? { adminReturnHref } : {})}
    >
      <div className={styles.studyBody}>{children}</div>
    </FrontendShell>
  );
}
