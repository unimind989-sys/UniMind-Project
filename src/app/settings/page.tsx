import { redirect } from "next/navigation";
import type { Route } from "next";
import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
import { loadCurrentAccount } from "@/lib/account/account.supabase.server";
import { loadCurrentStudentCatalog } from "@/lib/catalog/catalog-journey.supabase.server";
import { resolveLocale } from "@/lib/i18n/locale";
import { AppShell } from "@/app/_components/app-shell";
import { AcademicSettings } from "@/app/_components/academic-settings";
import { Appearance } from "@/app/_components/appearance";
import { AccountLayout } from "@/app/_components/account-layout";
import { logoutAction } from "@/app/(auth)/actions";
import { saveAcademicAction } from "./actions";
import styles from "@/app/_components/student-account.module.css";

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
  return (
    <AppShell locale={locale} role={role} title={t("Account", "الحساب")}>
      <h1>{t("Account", "الحساب")}</h1>
      <AccountLayout locale={locale} academic={!!catalog} privacy={false}>
        <section id="appearance-settings" className={styles.section}>
          <h2>{t("Appearance", "المظهر")}</h2>
          <Appearance locale={locale} />
        </section>
        {catalog ? (
          <AcademicSettings
            locale={locale}
            rows={catalog.rows}
            initialContext={account.academicContext}
            save={saveAcademicAction}
          />
        ) : null}
        <section id="identity-settings" className={styles.section}>
          <h2>{t("Your account", "حسابك")}</h2>
          {account.displayName ? (
            <p>
              <bdi>{account.displayName}</bdi>
            </p>
          ) : null}
          <form action={logoutAction}>
            <button className={styles.secondary} type="submit">
              {t("Sign out", "تسجيل الخروج")}
            </button>
          </form>
        </section>
      </AccountLayout>
    </AppShell>
  );
}
