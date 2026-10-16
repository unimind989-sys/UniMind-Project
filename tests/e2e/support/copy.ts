import type { Locale } from "./app-fixtures";

export type { Locale };

export const locales = ["en", "ar"] as const satisfies readonly Locale[];

/** Chooses the English or Arabic form of a product string. */
export const pick = (locale: Locale, en: string, ar: string) =>
  locale === "ar" ? ar : en;

/** Binds `pick` to one locale: `const t = bilingual(locale); t("Send", "إرسال")`. */
export const bilingual = (locale: Locale) => (en: string, ar: string) =>
  pick(locale, en, ar);

/** Reads one side of an app `[en, ar]` copy tuple. */
export const localized = (value: readonly [string, string], locale: Locale) =>
  value[locale === "ar" ? 1 : 0];

export const otherLocale = (locale: Locale): Locale =>
  locale === "en" ? "ar" : "en";

/** The accessible name of the interface-language button that selects `locale`. */
export const languageName = (locale: Locale) =>
  locale === "ar" ? "العربية" : "English";

export const formatNumber = (locale: Locale, value: number) =>
  new Intl.NumberFormat(locale).format(value);

/** Two-digit clock component in the locale's numbering system. */
export const clock = (locale: Locale, value: number) =>
  new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(value);

/**
 * Runs a block of journey definitions once per listed locale. Ordinary
 * journeys pass one locale (alternating across a file); locale and RTL cases
 * pass both.
 */
export function inLocales(
  selected: readonly Locale[],
  define: (locale: Locale) => void,
) {
  for (const locale of selected) define(locale);
}
