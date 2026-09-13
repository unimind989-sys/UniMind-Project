import type { Metadata } from "next";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
import { validatedInternalReturnPath } from "@/lib/auth/auth-actions.application";

import { AuthPage, resolveAuthPageParameters } from "../_components/auth-page";

export const metadata: Metadata = { title: "Learning commitments | UniMind" };

type SearchParameters = Record<string, string | string[] | undefined>;

export default async function ConsentPage({
  searchParams,
}: Readonly<{ searchParams: Promise<SearchParameters> }>) {
  const parameters = await searchParams;
  const { locale, returnPath } = resolveAuthPageParameters(parameters);

  let access: Awaited<ReturnType<typeof getCurrentAuthAccess>>;
  try {
    access = await getCurrentAuthAccess();
  } catch {
    return (
      <AuthPage
        mode="consent"
        searchParams={Promise.resolve({ ...parameters, status: "unavailable" })}
        currentTerms={null}
      />
    );
  }

  if (access.gate === "SIGN_IN") {
    redirect(
      `/login?lang=${locale}&next=${encodeURIComponent(returnPath)}` as Route,
    );
  }
  if (access.gate === "READY") {
    redirect(validatedInternalReturnPath(returnPath) as Route);
  }
  if (access.gate === "VERIFY_EMAIL") {
    redirect(
      `/verify-email?lang=${locale}&next=${encodeURIComponent(returnPath)}` as Route,
    );
  }
  if (access.gate === "SUSPENDED" || access.gate === "DISABLED") {
    redirect(
      `/login?lang=${locale}&status=${access.gate.toLowerCase()}` as Route,
    );
  }
  if (
    access.gate === "UNAVAILABLE" ||
    access.gate === "ACCOUNT_PENDING" ||
    access.currentTerms === null
  ) {
    return (
      <AuthPage
        mode="consent"
        searchParams={Promise.resolve({ ...parameters, status: "unavailable" })}
        currentTerms={null}
      />
    );
  }

  return (
    <AuthPage
      mode="consent"
      searchParams={Promise.resolve(parameters)}
      currentTerms={access.currentTerms}
    />
  );
}
