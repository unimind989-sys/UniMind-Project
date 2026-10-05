import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locale";
import styles from "./student-account.module.css";

/** Section links keep settings discoverable without hiding fields or drafts. */
export function AccountLayout({
  locale,
  academic,
  children,
  privacy = true,
}: {
  locale: Locale;
  academic: boolean;
  children: ReactNode;
  privacy?: boolean;
}) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  return (
    <div className={styles.layout}>
      <nav
        className={styles.sectionNav}
        aria-label={t("Account sections", "أقسام الحساب")}
      >
        <a href="#appearance-settings">{t("Appearance", "المظهر")}</a>
        {academic ? (
          <a href="#academic-settings-heading">
            {t("Academic context", "السياق الدراسي")}
          </a>
        ) : null}
        {privacy ? (
          <a href="#privacy-settings">{t("Privacy", "الخصوصية")}</a>
        ) : null}
        <a href="#identity-settings">
          {t("Identity and access", "الهوية والوصول")}
        </a>
      </nav>
      <div className={styles.settingsBody}>{children}</div>
    </div>
  );
}
