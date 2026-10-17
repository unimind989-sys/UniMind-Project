import { adminAlreadyInState } from "@/lib/admin/admin-presentation.application";
import type { AdminActionCandidate } from "@/lib/admin/admin-actions.application";
import { getAdminCopy } from "@/lib/i18n/admin-copy";
import type { Locale } from "@/lib/i18n/locale";

import type { submitAdminAction } from "../../actions";

export type AdminCopy = ReturnType<typeof getAdminCopy>;
export type SubmitAdminAction = typeof submitAdminAction;

export function candidateState(
  candidate: AdminActionCandidate,
  locale: Locale,
) {
  if (adminAlreadyInState(candidate))
    return getAdminCopy(locale).alreadyInState;
  if (candidate.commandState === "PENDING_SECOND_CONFIRMATION") {
    return locale === "ar" ? "تأكيد ثانٍ مطلوب" : "Second confirmation needed";
  }
  if (candidate.commandState === "PENDING_OWNER_REVIEW") {
    return locale === "ar" ? "مراجعة المسؤول مطلوبة" : "Owner review needed";
  }
  return candidate.failedPredicates.length > 0
    ? locale === "ar"
      ? "محجوب بفحوص الجاهزية"
      : "Readiness blocked"
    : locale === "ar"
      ? "جاهز"
      : "Ready";
}

/** Status tone of the pill beside `candidateState`; presentation only. */
export function candidateTone(
  candidate: AdminActionCandidate,
): "ok" | "bad" | "wait" | "neutral" {
  if (adminAlreadyInState(candidate)) return "neutral";
  if (
    candidate.commandState === "PENDING_SECOND_CONFIRMATION" ||
    candidate.commandState === "PENDING_OWNER_REVIEW"
  )
    return "wait";
  return candidate.failedPredicates.length > 0 ? "bad" : "ok";
}

export function candidateLabel(
  candidate: AdminActionCandidate,
  locale: Locale,
) {
  return locale === "ar" ? candidate.targetLabelAr : candidate.targetLabelEn;
}

export function stateLabel(value: string, locale: Locale) {
  const labels: Readonly<Record<string, string>> = getAdminCopy(locale).states;
  return labels[value] ?? value;
}

export function localExpiryValue(value: string) {
  const date = new Date(value);
  const two = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}T${two(date.getHours())}:${two(date.getMinutes())}`;
}

export function formatExpectedVersion(version: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en").format(
    version,
  );
}
