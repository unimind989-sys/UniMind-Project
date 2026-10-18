import type { Locale } from "./locale";

const profileCopy = {
  en: {
    welcomeTitle: "Set up your profile",
    welcomeLede:
      "Add your name and choose how UniMind looks. You can change these later in Settings.",
    settingsTitle: "Your profile",
    name: "Full name",
    nameHint: "Shown on your profile and in Settings.",
    email: "Email address",
    language: "Language",
    save: "Save and continue",
    saveSettings: "Save profile",
    saving: "Saving…",
    saved: "Profile saved.",
    signOut: "Sign out",
    errors: {
      DISPLAY_NAME_REQUIRED: "Enter your name.",
      DISPLAY_NAME_TOO_LONG: "Use 80 characters or fewer.",
      DISPLAY_NAME_INVALID:
        "Use letters, spaces and common punctuation in your name.",
      LANGUAGE_INVALID: "Choose a language.",
      FORBIDDEN: "Your session has ended. Sign in again to save your profile.",
      UNAVAILABLE: "Your profile could not be saved. Try again.",
    },
  },
  ar: {
    welcomeTitle: "أكمل ملفك الشخصي",
    welcomeLede:
      "اكتب اسمك واختر شكل UniMind. يمكنك تغيير ذلك لاحقًا من الإعدادات.",
    settingsTitle: "ملفك الشخصي",
    name: "الاسم الكامل",
    nameHint: "يظهر في ملفك الشخصي وفي الإعدادات.",
    email: "البريد الإلكتروني",
    language: "اللغة",
    save: "حفظ ومتابعة",
    saveSettings: "حفظ الملف الشخصي",
    saving: "جارٍ الحفظ…",
    saved: "تم حفظ الملف الشخصي.",
    signOut: "تسجيل الخروج",
    errors: {
      DISPLAY_NAME_REQUIRED: "اكتب اسمك.",
      DISPLAY_NAME_TOO_LONG: "استخدم 80 حرفًا أو أقل.",
      DISPLAY_NAME_INVALID:
        "استخدم حروفًا ومسافات وعلامات ترقيم عادية في اسمك.",
      LANGUAGE_INVALID: "اختر لغة.",
      FORBIDDEN: "انتهت جلستك. سجّل الدخول مرة أخرى لحفظ ملفك الشخصي.",
      UNAVAILABLE: "تعذّر حفظ ملفك الشخصي. حاول مرة أخرى.",
    },
  },
} as const;

export type ProfileCopy = (typeof profileCopy)[Locale];

export function getProfileCopy(locale: Locale): ProfileCopy {
  return profileCopy[locale];
}
