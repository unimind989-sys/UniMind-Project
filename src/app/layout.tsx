import type { Metadata } from "next";
import { Manrope, Noto_Sans_Arabic } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "UniMind",
  description: "A source-grounded learning environment.",
};

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
THESIS: The Study Shelf turns an authorized curriculum into browsable academic rails and refuses the generic LMS dashboard.
OWN-WORLD: Deep navy matte fields, off-white type, cool-blue separators, restrained synthetic subject plates, cobalt focus, and muted green readiness.
STORY: A student scans units in the active language, focuses one in place, verifies its illustrative readiness and scope, then sees the workspace boundary.
FIRST VIEWPORT: A 254px product rail anchors three visible curriculum shelves; one unit expands to twice its neighbors and holds the primary action.
FORM: Focused Rail, selected Study Shelf composition, direction seed 30b1cf13.
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
    >
      <body>
        <template
          data-direction-contract="30b1cf13"
          dangerouslySetInnerHTML={{ __html: directionContract }}
        />
        {children}
      </body>
    </html>
  );
}
