import type { Metadata } from "next";
import { headers } from "next/headers";
import { Manrope, Noto_Sans_Arabic } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import { resolveDemoRuntime } from "@/lib/demo/demo-runtime.application";
import { ThemeRuntime } from "./_components/appearance";
import { themeBootstrap } from "@/lib/theme/theme.application";
import { getServerEnvironment } from "@/lib/config/env.server";
import { getTextDirection, resolveLocale } from "@/lib/i18n/locale";
import { localeHeaderName } from "@/lib/i18n/locale-preference.application";
import { HostedSyntheticRuntime } from "./_synthetic/hosted-synthetic-runtime";
import { LoopbackSyntheticRuntime } from "./_synthetic/loopback-synthetic-runtime";

export function generateMetadata(): Metadata {
  const environment = getServerEnvironment();
  return {
    title: "UniMind",
    description:
      "Study deeper. Go further. Learn from your course materials with UniMind.",
    manifest: "/brand/unimind/icons/site.webmanifest",
    other: {
      "unimind-data": "Synthetic only",
      "unimind-providers":
        environment.PROVIDER_MODE === "mock"
          ? "Mock only"
          : "Approved real mode",
      "unimind-release": environment.NEXT_PUBLIC_RELEASE_ID,
    },
  };
}

const latinFont = Manrope({
  subsets: ["latin"],
  variable: "--font-unimind-latin",
  display: "swap",
});

// No metric-adjusted local fallback for the Arabic face: its subset has no
// Latin letters, so Latin runs in Arabic text fall through to Manrope (the
// next family in the stack) instead of a local system face (DESIGN.md).
const arabicFont = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-unimind-arabic",
  display: "swap",
  adjustFontFallback: false,
});

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  // Real runtime: the proxy names the request's language, so Arabic pages
  // arrive right-to-left; otherwise English, corrected by the client shell.
  const locale = resolveLocale((await headers()).get(localeHeaderName));
  return (
    <html
      lang={locale}
      dir={getTextDirection(locale)}
      className={`${latinFont.variable} ${arabicFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#0c1823" />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <ThemeRuntime />
        {resolveDemoRuntime(process.env) === "ENABLED" ? (
          // The loopback demo renders every product URL in the synthetic
          // client runtime; its route segment only selects the HTTP status.
          <LoopbackSyntheticRuntime />
        ) : (
          <HostedSyntheticRuntime>{children}</HostedSyntheticRuntime>
        )}
      </body>
    </html>
  );
}
