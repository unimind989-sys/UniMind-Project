"use client";

import { useState } from "react";
import { useProductText } from "@/app/_components/product-copy";
import { useProductProfileName } from "@/app/_components/product-profile";
import { useProductServices } from "@/app/_components/product-services";
import { AccountSettings } from "@/app/_components/account-settings";
import { Button } from "@/app/_components/product-ui";
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
  const studyReturn = currentStudyReturn(state, studyReturnTime);
  const rows = reviewCatalogRows.filter((row) =>
    sampleScopeAvailable(state, row.cohort.id, row.unit.id),
  );
  return (
    <AccountSettings
      locale={locale}
      name={profileName}
      role={state.role ?? "student"}
      signOutAction={
        <Button variant="quiet" onClick={signOut}>
          {t("Sign out", "تسجيل الخروج")}
        </Button>
      }
      studyReturn={
        studyReturn
          ? {
              href: studyReturn.href,
              tool: studyReturn.tool,
              unitNameEn: studyReturn.unit.nameEn,
              unitNameAr: studyReturn.unit.nameAr,
            }
          : null
      }
      studyPath={state.role === "student" && state.academicContext !== null}
      academic={
        state.role === "student"
          ? {
              rows,
              initialContext: state.academicContext,
              save: async (context) => {
                if (!authorizedAcademicContext(context, rows))
                  return { status: "INVALID" };
                update((current) => ({ ...current, academicContext: context }));
                return { status: "SAVED" };
              },
            }
          : null
      }
      privacy={{
        sharing: state.sharing,
        onSharingChange: (sharing) =>
          update((current) => ({ ...current, sharing })),
      }}
    />
  );
}
