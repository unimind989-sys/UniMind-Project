import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

import { requireReadyAccess } from "@/lib/auth/access-route.server";
import { requireVerifiedIdentity } from "@/lib/auth/verified-identity.server";
import { loadVerifiedAdminActionQueue } from "@/lib/admin/admin-actions.supabase.server";
import { selectedAdminDecision } from "@/lib/admin/admin-presentation.application";
import { resolveLocale } from "@/lib/i18n/locale";

import { AdminDecisionQueue } from "./_components/admin-decision-queue";

export const metadata: Metadata = {
  title: "Admin decision queue | UniMind",
  description: "Review and record audited UniMind governance decisions.",
};

export default async function AdminPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const parameters = await searchParams;
  const requestedLocale = Array.isArray(parameters.lang)
    ? parameters.lang[0]
    : parameters.lang;
  const locale = resolveLocale(requestedLocale);

  await requireReadyAccess({ locale, next: "/admin" });

  try {
    await requireVerifiedIdentity();
  } catch {
    redirect(`/login?lang=${locale}&next=%2Fadmin` as Route);
  }

  const queue = await loadVerifiedAdminActionQueue();
  const selector = new URLSearchParams();
  for (const field of ["decision", "action", "target", "version", "pending"]) {
    const value = parameters[field];
    for (const entry of Array.isArray(value) ? value : [value])
      if (typeof entry === "string") selector.append(field, entry);
  }
  return (
    <AdminDecisionQueue
      key={JSON.stringify([...selector.entries()])}
      initialLocale={locale}
      queue={queue}
      initialSelection={selectedAdminDecision(
        queue.status === "READY" ? queue.candidates : [],
        selector,
      )}
    />
  );
}
