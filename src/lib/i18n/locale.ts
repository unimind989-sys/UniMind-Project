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
