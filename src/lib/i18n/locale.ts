import { dictionaries, type Dictionary } from "./dictionaries";

export const supportedLocales = ["en", "ar"] as const;

export type Locale = (typeof supportedLocales)[number];
export type TextDirection = "ltr" | "rtl";

export function isSupportedLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && supportedLocales.includes(value as Locale)
  );
}

export function resolveLocale(value: unknown): Locale {
  return isSupportedLocale(value) ? value : "en";
}

export function getTextDirection(locale: Locale): TextDirection {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function formatInteger(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en", {
    maximumFractionDigits: 0,
    useGrouping: false,
  }).format(value);
}

/**
 * The same internal address in the given interface locale: the path, every
 * other query parameter and the fragment stay; only `lang` is set. External
 * and scheme addresses are returned unchanged.
 */
export function localizedHref(href: string, locale: Locale): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) return href;
  const hashAt = href.indexOf("#");
  const hash = hashAt === -1 ? "" : href.slice(hashAt);
  const beforeHash = hashAt === -1 ? href : href.slice(0, hashAt);
  const queryAt = beforeHash.indexOf("?");
  const path = queryAt === -1 ? beforeHash : beforeHash.slice(0, queryAt);
  const query = new URLSearchParams(
    queryAt === -1 ? "" : beforeHash.slice(queryAt + 1),
  );
  query.set("lang", locale);
  return `${path}?${query.toString()}${hash}`;
}
