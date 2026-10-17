import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import type { Locale } from "@/lib/i18n/locale";

export function collectionText(locale: Locale) {
  return (en: string, ar: string) => (locale === "ar" ? ar : en);
}

export function collectionErrorText(code: string, locale: Locale) {
  const text = getCollectionCopy(locale);
  const t = collectionText(locale);
  return (
    {
      UNSAFE_DEMO_FILE: t(
        "Use the supplied synthetic files only. Private files are not accepted in this demo.",
        "استخدم الملفات التجريبية المرفقة فقط. لا يقبل العرض ملفات خاصة.",
      ),
      FILE_TOO_LARGE: t(
        "This file exceeds the 10 MB limit. Remove it and choose a smaller supported file.",
        "هذا الملف يتجاوز الحد الأقصى ١٠ ميجابايت. احذفه واختر ملفًا مدعومًا أصغر.",
      ),
      EMPTY_FILE: t(
        "This file is empty. Choose another file.",
        "هذا الملف فارغ. اختر ملفًا آخر.",
      ),
      FORBIDDEN_TYPE: t(
        "The file contents are not a supported PDF, WAV, or PNG.",
        "محتوى الملف ليس PDF أو WAV أو PNG مدعومًا.",
      ),
      FILE_UNREADABLE: t(
        "This file could not be read. Choose it again.",
        "تعذرت قراءة الملف. اختره مرة أخرى.",
      ),
      UPLOAD_INTERRUPTED: text.offlineError,
      UPLOAD_FAILED: text.offlineError,
      FINALIZE_FAILED: t(
        "The file was uploaded, but its submission could not be confirmed. Retry submission without uploading again.",
        "تم رفع الملف، لكن تعذر تأكيد الإرسال. أعد محاولة الإرسال دون رفع الملف مجددًا.",
      ),
      VALIDATION_REJECTED: t(
        "This file did not pass validation. Check the requested material, remove the file and choose a supported file.",
        "لم يجتز الملف الفحص. راجع المادة المطلوبة، واحذف الملف واختر ملفًا مدعومًا.",
      ),
      CHECKSUM_MISMATCH: t(
        "This file failed the integrity check. Remove it and choose an intact file.",
        "لم يجتز الملف فحص السلامة. احذفه واختر ملفًا سليمًا.",
      ),
      UPLOAD_EVIDENCE_MISMATCH: t(
        "This file failed the integrity check. Remove it and choose an intact file.",
        "لم يجتز الملف فحص السلامة. احذفه واختر ملفًا سليمًا.",
      ),
      DUPLICATE_FILE: t(
        "This file is already recorded for this request. View the recorded submission before choosing a different file.",
        "هذا الملف مسجل بالفعل لهذا الطلب. راجع الإرسال المسجل قبل اختيار ملف مختلف.",
      ),
      RIGHTS_REJECTED: t(
        "Permission for this file could not be confirmed. Remove it and submit only a file you are permitted to share.",
        "تعذر تأكيد صلاحية إرسال هذا الملف. احذفه وأرسل فقط ملفًا يُسمح لك بمشاركته.",
      ),
      CORRECTION_STALE: t(
        "This correction no longer matches the current request. Inspect its latest submission before adding another file.",
        "لم يعد هذا التصحيح يطابق الطلب الحالي. راجع آخر إرسال قبل إضافة ملف آخر.",
      ),
      CAMPAIGN_UNAVAILABLE: text.unavailableBody,
      TYPE_MISMATCH: t(
        "This file does not match the named request. Remove it and choose the requested file type.",
        "هذا الملف لا يطابق الطلب المحدد. احذفه واختر الصيغة المطلوبة.",
      ),
      ITEM_UNAVAILABLE: t(
        "This request is no longer available. Open an assigned campaign to inspect its current requests.",
        "لم يعد هذا الطلب متاحًا. افتح حملة مسندة للاطلاع على طلباتها الحالية.",
      ),
      RIGHTS_REQUIRED: text.rightsMissing,
    }[code] ?? text.genericError
  );
}
