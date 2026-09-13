import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

import { getVerifiedIdentity } from "@/lib/auth/verified-identity.server";

import { AuthPage } from "../_components/auth-page";

export const metadata: Metadata = { title: "Reset password | UniMind" };

export default async function ResetPasswordPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const parameters = await searchParams;
  let identity: Awaited<ReturnType<typeof getVerifiedIdentity>>;
  try {
    identity = await getVerifiedIdentity();
  } catch {
    identity = null;
  }
  if (identity === null) {
    const localeValue = Array.isArray(parameters.lang)
      ? parameters.lang[0]
      : parameters.lang;
    const locale = localeValue === "ar" ? "ar" : "en";
    redirect(`/forgot-password?lang=${locale}&status=invalid_link` as Route);
  }

  return <AuthPage mode="reset" searchParams={Promise.resolve(parameters)} />;
}
