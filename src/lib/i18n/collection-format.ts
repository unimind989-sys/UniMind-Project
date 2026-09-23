import type { Locale } from "./locale";

const COLLECTION_TIME_ZONE = "Africa/Cairo";

export function formatCollectionDate(locale: Locale, value: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: COLLECTION_TIME_ZONE,
  }).format(new Date(value));
}
