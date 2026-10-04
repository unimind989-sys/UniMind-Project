import type { Metadata } from "next";
import { Manrope, Noto_Sans_Arabic } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import { resolveDemoRuntime } from "@/lib/demo/demo-runtime.application";
import { SyntheticProductProvider } from "./_components/product-services";
import { ThemeRuntime } from "./_components/appearance";
import { themeBootstrap } from "@/lib/theme/theme.application";
import { getServerEnvironment } from "@/lib/config/env.server";
import { HostedSyntheticRuntime } from "./_components/hosted-synthetic-runtime";

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

const directionContract = `<!--
THESIS: UniMind keeps subjects, materials and study tools in one continuous workspace with a clear next action.
OWN-WORLD: Paired neutral grey themes, quiet borders, Manrope and Noto Sans Arabic, restrained blue interaction accent and the supplied Open Folio identifier.
STORY: A student sets academic context once, opens a subject, studies its materials and checks supporting evidence without losing context.
FIRST VIEWPORT: A 216px role rail anchors the subject title and four local destinations; the reading and working area carries the content.
FORM: Code-led Phase 1 proposal, user-fixed direction approved at ab568b6; historical direction seed 30b1cf13 is retained for provenance, not a new random roll.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

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
        <meta name="theme-color" content="#f6f7f8" />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <ThemeRuntime />
        <template
          data-direction-contract="frontend-overhaul-ab568b6"
          dangerouslySetInnerHTML={{ __html: directionContract }}
        />
        {resolveDemoRuntime(process.env) === "ENABLED" ? (
          <SyntheticProductProvider>{children}</SyntheticProductProvider>
        ) : (
          <HostedSyntheticRuntime>{children}</HostedSyntheticRuntime>
        )}
      </body>
    </html>
  );
}
