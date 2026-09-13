import type { Metadata } from "next";

import { AuthPage } from "../_components/auth-page";

export const metadata: Metadata = { title: "Verify email | UniMind" };

export default function VerifyEmailPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  return <AuthPage mode="verify" searchParams={searchParams} />;
}
