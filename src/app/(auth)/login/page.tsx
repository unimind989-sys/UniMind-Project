import type { Metadata } from "next";

import { AuthPage } from "../_components/auth-page";

export const metadata: Metadata = { title: "Sign in | UniMind" };

export default function LoginPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  return <AuthPage mode="login" searchParams={searchParams} />;
}
