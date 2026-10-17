import { redirect } from "next/navigation";
import type { Route } from "next";
import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
import {
  loadCurrentAccount,
  loadCurrentStudyResume,
} from "@/lib/account/account.supabase.server";
import { authorizedAcademicContext } from "@/lib/account/account.application";
import { resolveCatalogJourney } from "@/lib/catalog/catalog-journey.application";
import { loadCurrentStudentCatalog } from "@/lib/catalog/catalog-journey.supabase.server";
import { resolveLocale } from "@/lib/i18n/locale";
import { AppShell } from "@/app/_components/app-shell";
import {
  AccountSettings,
  type AccountStudyReturn,
} from "@/app/_components/account-settings";
import { Button } from "@/app/_components/product-ui";
import { logoutAction } from "@/app/(auth)/actions";
import { saveAcademicAction } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const locale = resolveLocale(query.lang);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const access = await getCurrentAuthAccess();
  if (access.gate !== "READY")
    redirect(
      `/${access.gate === "CONSENT_REQUIRED" ? "consent" : access.gate === "VERIFY_EMAIL" ? "verify-email" : "login"}?lang=${locale}&next=%2Fsettings` as Route,
    );
  const account = await loadCurrentAccount();
  const role =
    account.home === "/admin"
      ? "admin"
      : account.home === "/batch-leader"
        ? "leader"
        : "student";
  const catalog = role === "student" ? await loadCurrentStudentCatalog() : null;
  const saved = catalog
    ? authorizedAcademicContext(account.academicContext, catalog.rows)
    : null;
  let studyReturn: AccountStudyReturn | null = null;
  if (catalog && saved) {
    const cohort = resolveCatalogJourney(catalog.rows, saved).selectedCohort;
    const href = cohort
      ? await loadCurrentStudyResume(catalog.rows, cohort.id)
      : null;
    const row = href
      ? catalog.rows.find((entry) =>
          href.startsWith(
            `/learn/${encodeURIComponent(entry.cohort.id)}/${encodeURIComponent(entry.unit.id)}/chat?`,
          ),
        )
      : undefined;
    if (href && row)
      studyReturn = {
        href,
        tool: "chat",
        unitNameEn: row.unit.nameEn,
        unitNameAr: row.unit.nameAr,
      };
  }
  const title =
    role === "student" ? t("Settings", "الإعدادات") : t("Account", "الحساب");
  return (
    <AppShell
      locale={locale}
      role={role}
      title={title}
      profileName={account.displayName}
    >
      <h1>{title}</h1>
      <AccountSettings
        locale={locale}
        name={account.displayName}
        role={role}
        signOutAction={
          <form action={logoutAction}>
            <Button variant="quiet" type="submit">
              {t("Sign out", "تسجيل الخروج")}
            </Button>
          </form>
        }
        studyReturn={studyReturn}
        studyPath={saved !== null}
        academic={
          catalog
            ? {
                rows: catalog.rows,
                initialContext: account.academicContext,
                save: saveAcademicAction,
              }
            : null
        }
        privacy={null}
      />
    </AppShell>
  );
}
