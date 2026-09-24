import type { Metadata, Route } from "next";
import { notFound, redirect } from "next/navigation";

import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
import { requireVerifiedIdentity } from "@/lib/auth/verified-identity.server";
import { loadVerifiedAdminActionQueue } from "@/lib/admin/admin-actions.supabase.server";
import { getAdminCopy } from "@/lib/i18n/admin-copy";
import { resolveLocale } from "@/lib/i18n/locale";

import styles from "../admin.module.css";

const resources = [
  "catalog",
  "cohorts",
  "sources",
  "jobs",
  "quality",
  "usage",
  "incidents",
] as const;

export const metadata: Metadata = {
  title: "Admin resources | UniMind",
};

export default async function AdminResourcePage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ resource: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const [{ resource }, parameters] = await Promise.all([params, searchParams]);
  if (!resources.some((candidate) => candidate === resource)) notFound();
  const requestedLocale = Array.isArray(parameters.lang)
    ? parameters.lang[0]
    : parameters.lang;
  const locale = resolveLocale(requestedLocale);
  let access: Awaited<ReturnType<typeof getCurrentAuthAccess>>;
  try {
    access = await getCurrentAuthAccess();
  } catch {
    redirect(
      `/login?lang=${locale}&status=unavailable&next=%2Fadmin%2F${resource}` as Route,
    );
  }
  if (access.gate !== "READY") {
    redirect(`/login?lang=${locale}&next=%2Fadmin%2F${resource}` as Route);
  }

  try {
    await requireVerifiedIdentity();
  } catch {
    redirect(`/login?lang=${locale}&next=%2Fadmin%2F${resource}` as Route);
  }
  const queue = await loadVerifiedAdminActionQueue();
  const copy = getAdminCopy(locale);
  const resourceKey = resource as (typeof resources)[number];
  const denied = queue.status === "FORBIDDEN";
  const unavailable = queue.status === "UNAVAILABLE";

  return (
    <main
      className={styles.resourcePage}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <nav
        className={styles.breadcrumb}
        aria-label={locale === "ar" ? "التنقل" : "Navigation"}
      >
        <a href={`/admin?lang=${locale}`}>{copy.pageTitle}</a>
        <span aria-hidden="true">/</span>
        <span>{copy.resources[resourceKey]}</span>
      </nav>
      <section
        className={styles.resourceNotice}
        role={denied || unavailable ? "alert" : "status"}
      >
        <h1>{copy.resources[resourceKey]}</h1>
        <p>
          {denied
            ? copy.forbiddenBody
            : unavailable
              ? copy.unavailableBody
              : copy.resourceUnavailable}
        </p>
        <p>{copy.syntheticOnly}</p>
        <a className={styles.returnLink} href={`/admin?lang=${locale}`}>
          {locale === "ar"
            ? "العودة إلى قائمة القرارات"
            : "Return to decision queue"}
        </a>
      </section>
    </main>
  );
}
