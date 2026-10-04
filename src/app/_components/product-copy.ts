"use client";

import { useSyntheticNavigation } from "./product-navigation";
import type { Locale } from "./synthetic-fixtures";

// Local review keeps its setup guidance. Hosted fixture services use ordinary
// product wording; fixture material titles/content remain the selected data.
const hostedCopy: Readonly<Record<string, readonly [string, string]>> = {
  "Fixed examples below show the existing resource workflow. Changes stay in this demo.":
    ["", ""],
  "This fixed example provides context; individual user records are not available in this view.":
    [
      "Individual user records are not available in this view.",
      "سجلات المستخدمين الفردية غير متاحة في هذا العرض.",
    ],
  "The sample assignment or invitation is expired/already used. No campaign access can be granted. Request a new invitation from the admin in the real product.":
    [
      "This invitation has expired or was already used. Request a new invitation from the admin.",
      "انتهت هذه الدعوة أو استُخدمت من قبل. اطلب دعوة جديدة من الإدارة.",
    ],
  "Try a supplied sample question. Replies are fixed examples.": ["", ""],
  "Sample question": ["Question", "السؤال"],
  "Question outside the supplied sample pack": ["Question", "السؤال"],
  "Report example": ["Report answer", "الإبلاغ عن الإجابة"],
  "Simulated stream · sample passage being revealed…": [
    "Preparing answer…",
    "إعداد الإجابة…",
  ],
  "Fixed examples · kept only until reload": ["", ""],
  "Preparing artifact… · Simulated": ["Preparing artifact…", "إعداد المخرج…"],
  "Short sample": ["Short", "قصير"],
  "Extended sample": ["Extended", "موسع"],
  "Make a study aid from this subject’s sample materials.": [
    "Make a study aid from this subject’s materials.",
    "أنشئ وسيلة مذاكرة من مواد هذه المادة.",
  ],
  "No sample answer selected. Send a fixed prompt in Chat, then inspect its evidence.":
    [
      "No answer selected. Send a question in Chat, then inspect its evidence.",
      "لم تُحدد إجابة. أرسل سؤالًا في المحادثة ثم افحص أدلتها.",
    ],
  "There is no exchange to report in this scope. Start a sample session and reveal a fixed answer first.":
    [
      "There is no exchange to report. Start a conversation first.",
      "لا توجد محادثة للإبلاغ عنها. ابدأ محادثة أولًا.",
    ],
  "Selected sample exchange": ["Selected exchange", "المحادثة المختارة"],
  "This example submits only this exchange's sample reason to tab memory. In the real product, a qualifying report can permit audited founder review of that exchange even in private mode. Report details, disclosure and retention are still being confirmed.":
    ["", ""],
  "Simulated report received in this tab. Nothing was sent, saved or shared.": [
    "Report received.",
    "تم استلام البلاغ.",
  ],
  "Two fixture questions from this unit's sample evidence. Scores are illustrative and not saved or server-graded.":
    ["Questions from this unit’s materials.", "أسئلة من مواد هذه الوحدة."],
  "Sample attempt ready in this tab.": ["Attempt ready.", "المحاولة جاهزة."],
  "Open sample attempt": ["Open attempt", "فتح المحاولة"],
  "Create a sample attempt": ["Start attempt", "بدء المحاولة"],
  "No attempt exists in this unit. Reload and reset clear sample attempts.": [
    "No attempt exists in this unit.",
    "لا توجد محاولة في هذه الوحدة.",
  ],
  "This timed attempt has expired. No score was recorded. The 60-second clock is an illustrative demo fixture.":
    [
      "This timed attempt has expired. No score was recorded.",
      "انتهى وقت المحاولة. لم تُسجل نتيجة.",
    ],
  "Submit the sample answers before viewing a score.": [
    "Submit your answers before viewing a score.",
    "سلّم إجاباتك قبل عرض النتيجة.",
  ],
  "Simulated score": ["Score", "النتيجة"],
  "illustrative only": ["", ""],
  "This is a synthetic invitation example. Accepting it only updates this demo.":
    ["", ""],
  "Invitation accepted · simulated. No real access granted.": [
    "Invitation accepted.",
    "تم قبول الدعوة.",
  ],
  "This role sees only fixed sample assignments. No invitations or permissions are fabricated as real access.":
    ["", ""],
  "Catalog configuration example": ["Catalog configuration", "إعداد الدليل"],
  "Source lifecycle example": ["Source lifecycle", "دورة المصدر"],
  "Processing example": ["Processing", "المعالجة"],
  "Quality review example": ["Quality review", "مراجعة الجودة"],
  "Source-readiness incident example": [
    "Source-readiness incident",
    "حادثة جاهزية المصدر",
  ],
  "Example state": ["State", "الحالة"],
  "Received → processed verification → independent raw absence proof → deletion audit → indexing → READY. Failed/low-confidence versions remain isolated. Every stage is a fixture, not executed processing; no raw data is exposed.":
    [
      "Failed or low-confidence versions remain isolated.",
      "الإصدارات الفاشلة أو منخفضة الثقة معزولة.",
    ],
  "Sample job: queued → running → retry wait → completed. A deletion-verification sample remains pending until durable output and independent absence proof. No worker runs; incomplete work cannot claim READY.":
    ["Deletion verification is pending.", "تحقق الحذف معلق."],
  "Sample report checks coverage, locator integrity, terminology and grounding. The recording conflicts with the handout; timing is missing. No academic or production PASS is claimed.":
    [
      "The recording conflicts with the handout; timing is missing.",
      "التسجيل يتعارض مع الملزمة والتوقيت ناقص.",
    ],
  "Providers disabled; paid budget zero. Ready, unavailable allowance and delayed capacity examples have no invented numeric limits. No reservation, usage settlement, charge or provider call occurs.":
    [
      "Providers disabled; paid budget zero.",
      "المزودون معطلون؛ الميزانية المدفوعة صفر.",
    ],
  "Sample source-readiness incident is isolated. Containment may hide a unit, lock a cohort or disable a feature while retaining historical evidence. No alert or notification is sent.":
    [
      "Source-readiness incident isolated for review.",
      "حادثة جاهزية المصدر معزولة للمراجعة.",
    ],
  "Sample cohort draft saved. No cohort unlocked.": [
    "Cohort draft saved.",
    "حفظت مسودة المجموعة.",
  ],
  "Fixed name: Synthetic Anatomy source call. Handout, recording and diagram requests; fixed expiry, rights declaration and naming guidance.":
    ["Handout, recording and diagram requests.", "طلبات ملزمة وتسجيل ورسم."],
  "Simulated campaign draft created in this tab.": [
    "Campaign draft created.",
    "أنشئت مسودة الحملة.",
  ],
  "Review fixed expiring campaign-only invitation": [
    "Review campaign invitation",
    "مراجعة دعوة الحملة",
  ],
  "Invitation example reviewed. No email, assignment or access grant.": [
    "Invitation sent.",
    "أرسلت الدعوة.",
  ],
  "Use the invitation link supplied in the synthetic test pack as the recipient. No email is delivered.":
    ["", ""],
  "Inspect student conflict example": [
    "Inspect student conflict",
    "فحص تعارض الطالب",
  ],
  "Ready · Sample material": ["Ready", "جاهز"],
  "INACTIVE sample · excluded from new requests": [
    "Inactive · excluded from new requests",
    "غير نشط · مستبعد من الطلبات الجديدة",
  ],
  "Processed sample excerpt": ["Processed excerpt", "نص معالج"],
  "Missing: no timing is supplied. Conflict: the recording reverses the sequence. This fixed example does not resolve that disagreement.":
    [
      "Missing: no timing is supplied. Conflict: the recording reverses the sequence.",
      "الناقص: لا يوجد توقيت. التعارض: التسجيل يعكس الترتيب.",
    ],
};

export function useProductText(locale: Locale) {
  const hosted = useSyntheticNavigation();
  return (en: string, ar: string) => {
    const ordinary =
      hosted?.active && Object.hasOwn(hostedCopy, en)
        ? hostedCopy[en]
        : undefined;
    return ordinary
      ? ordinary[locale === "ar" ? 1 : 0]
      : locale === "ar"
        ? ar
        : en;
  };
}
