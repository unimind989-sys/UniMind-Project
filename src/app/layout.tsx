import type { Metadata, Viewport } from "next";
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

// `resizes-content` lets a phone keyboard shrink the layout viewport, so the
// docked Chat composer stays above it (Android Chrome and Firefox; iOS still
// resizes only the visual viewport, which the shell measures). No zoom limits.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

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
