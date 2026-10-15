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
      <AccountLayout
        locale={locale}
        identity={{
          name: account.displayName,
          role:
            role === "admin"
              ? t("Administration workspace", "مساحة الإدارة")
              : role === "leader"
                ? t("Batch Leader workspace", "مساحة مسؤول الدفعة")
                : t("Study workspace", "مساحة المذاكرة"),
        }}
        signOutAction={
          <form action={logoutAction}>
            <button className={styles.quietAction} type="submit">
              {t("Sign out", "تسجيل الخروج")}
            </button>
          </form>
        }
        views={[
          {
            id: "appearance",
            label: t("Appearance", "المظهر"),
            content: (
              <section
                id="appearance-settings"
                className={`${styles.section} ${styles.compactSection}`}
              >
                <h2>{t("Appearance", "المظهر")}</h2>
                <Appearance locale={locale} />
              </section>
            ),
          },
          ...(catalog
            ? [
                {
                  id: "academic",
                  label: t("Academic settings", "الإعدادات الدراسية"),
                  content: (
                    <AcademicSettings
                      locale={locale}
                      rows={catalog.rows}
                      initialContext={account.academicContext}
                      save={saveAcademicAction}
                    />
                  ),
                },
              ]
            : []),
          {
            id: "identity",
            label: t("Identity and access", "الهوية والوصول"),
            content: (
              <section
                id="identity-settings"
                className={`${styles.section} ${styles.compactSection}`}
              >
                <h2>{t("Your account", "حسابك")}</h2>
                <p>
                  {t(
                    "You are signed in to this account.",
                    "أنت مسجل الدخول بهذا الحساب.",
                  )}
                </p>
              </section>
            ),
          },
        ]}
      />
    </AppShell>
  );
}
