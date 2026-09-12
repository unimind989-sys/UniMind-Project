import type { Metadata } from "next";

import { resolveLocale } from "@/lib/i18n/locale";

import { StudyShelf } from "./_components/study-shelf";
import { syntheticShelves } from "./synthetic-catalog";

export const metadata: Metadata = {
  title: "Study Shelf | UniMind",
  description: "Synthetic bilingual catalog foundation for UniMind WP03.",
};

export default async function LearnPage({
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
