import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
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

  let access: Awaited<ReturnType<typeof getCurrentAuthAccess>>;
  try {
    access = await getCurrentAuthAccess();
  } catch {
    redirect(`/login?lang=${locale}&status=unavailable` as Route);
  }

  const next = encodeURIComponent(`/admin?lang=${locale}`);
  if (access.gate === "CONSENT_REQUIRED") {
    redirect(`/consent?lang=${locale}&next=${next}` as Route);
  }
  if (access.gate === "VERIFY_EMAIL") {
    redirect(`/verify-email?lang=${locale}&next=${next}` as Route);
  }
  if (access.gate === "SUSPENDED" || access.gate === "DISABLED") {
    redirect(
      `/login?lang=${locale}&status=${access.gate.toLowerCase()}` as Route,
    );
  }
  if (access.gate !== "READY") {
    redirect(`/login?lang=${locale}&next=${next}` as Route);
  }

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
