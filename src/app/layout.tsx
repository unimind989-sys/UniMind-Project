import type { Metadata } from "next";
import { Manrope, Noto_Sans_Arabic } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import { resolveDemoRuntime } from "@/lib/demo/demo-runtime.application";
import { ThemeRuntime } from "./_components/appearance";
import { themeBootstrap } from "@/lib/theme/theme.application";
import { getServerEnvironment } from "@/lib/config/env.server";
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

const arabicFont = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-unimind-arabic",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
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
