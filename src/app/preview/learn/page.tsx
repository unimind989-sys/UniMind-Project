import type { Metadata } from "next";

import { resolveLocale } from "@/lib/i18n/locale";

import { StudyShelf } from "../../learn/_components/study-shelf";
import { syntheticShelves } from "../../learn/synthetic-catalog";

export const metadata: Metadata = {
  title: "Study Shelf synthetic preview | UniMind",
  robots: { index: false, follow: false },
};

export default async function StudyShelfPreviewPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const parameters = await searchParams;
  const localeParameter = Array.isArray(parameters.lang)
    ? parameters.lang[0]
    : parameters.lang;

  return (
    <StudyShelf
      initialLocale={resolveLocale(localeParameter)}
      shelves={syntheticShelves}
    />
  );
}
