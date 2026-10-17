import type { Locale } from "./locale";

const COLLECTION_TIME_ZONE = "Africa/Cairo";

export function formatCollectionDate(locale: Locale, value: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: COLLECTION_TIME_ZONE,
  }).format(new Date(value));
}

export type CollectionTimeLeft = Readonly<{
  unit: "day" | "hour" | "minute";
  value: number;
  /** Presentation urgency: under two days is urgent, under a week is soon. */
  urgency: "urgent" | "soon" | "calm";
}>;

/** Whole time left before a deadline, or null once it has passed. */
export function collectionTimeLeft(
  deadline: string,
  now: number,
): CollectionTimeLeft | null {
  const remaining = Date.parse(deadline) - now;
  if (!Number.isFinite(remaining) || remaining <= 0) return null;
  const hours = remaining / 3_600_000;
  const urgency = hours < 48 ? "urgent" : hours < 7 * 24 ? "soon" : "calm";
  if (hours >= 48)
    return { unit: "day", value: Math.floor(hours / 24), urgency };
  if (hours >= 1) return { unit: "hour", value: Math.floor(hours), urgency };
  return {
    unit: "minute",
    value: Math.max(1, Math.floor(remaining / 60_000)),
    urgency,
  };
}

export function formatCollectionTimeLeft(
  locale: Locale,
  left: CollectionTimeLeft,
): string {
  const amount = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en", {
    style: "unit",
    unit: left.unit,
    unitDisplay: "long",
  }).format(left.value);
  return locale === "ar" ? `متبقٍ ${amount}` : `${amount} left`;
}
