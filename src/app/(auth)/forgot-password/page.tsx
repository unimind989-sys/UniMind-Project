import type { Metadata } from "next";

import { AuthPage } from "../_components/auth-page";

export const metadata: Metadata = { title: "Recover account | UniMind" };

export default function ForgotPasswordPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  return <AuthPage mode="forgot" searchParams={searchParams} />;
}
