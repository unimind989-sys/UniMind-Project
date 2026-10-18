import { requireReadyAccess } from "@/lib/auth/access-route.server";
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
import { SignOutForm } from "@/app/(auth)/_components/sign-out-form";
import { Notice } from "@/app/_components/notice";
import { saveAcademicAction, saveProfileAction } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const locale = resolveLocale(query.lang);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  await requireReadyAccess({ locale, next: "/settings" });
  const account = await loadCurrentAccount();
  const role =
    account.home === "/admin"
      ? "admin"
      : account.home === "/batch-leader"
        ? "leader"
        : "student";
  // A catalog failure must not take Settings (and its sign-out) down with it.
  let catalogFailed = false;
  let catalog: Awaited<ReturnType<typeof loadCurrentStudentCatalog>> | null =
    null;
  if (role === "student")
    try {
      catalog = await loadCurrentStudentCatalog();
    } catch {
      catalogFailed = true;
    }
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
      {catalogFailed ? (
        <Notice tone="error" locale={locale}>
          {t(
            "Your academic settings could not be loaded. The other settings still work; try again later.",
            "تعذّر تحميل إعداداتك الدراسية. باقي الإعدادات تعمل؛ حاول مرة أخرى لاحقًا.",
          )}
        </Notice>
      ) : null}
      <AccountSettings
        locale={locale}
        name={account.displayName}
        role={role}
        signOutAction={<SignOutForm locale={locale} />}
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
        profile={{
          email: account.email,
          displayName: account.displayName,
          accountLanguage: account.language,
          save: saveProfileAction,
        }}
      />
    </AppShell>
  );
}
