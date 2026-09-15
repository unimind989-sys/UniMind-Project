import type { Locale } from "./locale";

const copy = {
  en: {
    pathHeading: "Choose your study path",
    pathSummary:
      "Each choice is checked again on the server before the next options appear.",
    stage: "Education level",
    institution: "Institution or system",
    program: "Program or faculty",
    level: "Academic level",
    term: "Term",
    university: "University",
    educationSystem: "Education system",
    faculty: "Faculty / college",
    track: "Study track",
    academicYear: "Academic year",
    schoolYear: "School year",
    semester: "Semester",
    flexibleCourseHeading: "Flexible course selection",
    flexibleCourseBody:
      "This program does not lock every student to one fixed semester list. Choose from the eligible modules or subjects shown for your active course plan.",
    cohort: "Released cohort",
    choose: "Choose…",
    currentPath: "Authorized path",
    resultsUpdated: "Authorized catalog updated.",
    navigationPending: "Checking access…",
    noMembershipTitle: "No active learning membership",
    noMembershipBody:
      "Your account is ready, but it is not currently assigned to a learning cohort.",
    cohortLockedTitle: "Your cohort is not open yet",
    cohortLockedBody:
      "The catalog will appear here after the cohort release is approved.",
    noCatalogTitle: "No catalog is configured yet",
    noCatalogBody:
      "Your cohort is open, but its study path has not been configured.",
    unpublishedTitle: "Units are still being prepared",
    unpublishedBody:
      "The catalog exists, but no curriculum unit is published for learning yet.",
    noReadySourceTitle: "Approved material is not ready yet",
    noReadySourceBody:
      "Published units stay hidden until an authorized source pool is ready.",
    errorTitle: "We could not check your catalog",
    errorBody:
      "Your access was not broadened. Try loading the authorized catalog again.",
    retry: "Try again",
    choosePathTitle: "Continue your authorized path",
    choosePathBody:
      "Choose the next catalog level. Later choices remain cleared until the server confirms this one.",
    noSearchTitle: "No authorized units match",
    noSearchBody: "Try a different unit name or clear the search.",
    clearSearch: "Clear search",
    workspacePending: "Workspace follows in WP03-T04",
    sourceCount: "approved sources",
    edition: "Curriculum edition",
    selectUnit: "Select curriculum unit",
    syntheticNotice: "Synthetic catalog journey",
  },
  ar: {
    pathHeading: "اختر مسار دراستك",
    pathSummary:
      "يُعاد التحقق من كل اختيار على الخادم قبل ظهور الخيارات التالية.",
    stage: "المستوى التعليمي",
    institution: "المؤسسة أو النظام",
    program: "البرنامج أو الكلية",
    level: "المستوى الدراسي",
    term: "الفصل الدراسي",
    university: "الجامعة",
    educationSystem: "النظام التعليمي",
    faculty: "الكلية",
    track: "الشعبة الدراسية",
    academicYear: "السنة الدراسية",
    schoolYear: "الصف الدراسي",
    semester: "الترم الدراسي",
    flexibleCourseHeading: "اختيار مرن للمقررات",
    flexibleCourseBody:
      "هذا البرنامج لا يقيّد كل طالب بقائمة ثابتة للترم. اختر من المواد أو الوحدات المتاحة ضمن خطتك الدراسية النشطة.",
    cohort: "المجموعة المتاحة",
    choose: "اختر…",
    currentPath: "المسار المصرّح",
    resultsUpdated: "تم تحديث الفهرس المصرّح.",
    navigationPending: "جارٍ التحقق من الصلاحية…",
    noMembershipTitle: "لا توجد عضوية دراسية نشطة",
    noMembershipBody: "حسابك جاهز، لكنه غير مرتبط حاليًا بمجموعة دراسية.",
    cohortLockedTitle: "مجموعتك لم تُفتح بعد",
    cohortLockedBody: "سيظهر الفهرس هنا بعد اعتماد فتح المجموعة.",
    noCatalogTitle: "لم يُجهّز الفهرس بعد",
    noCatalogBody: "مجموعتك مفتوحة، لكن مسارها الدراسي لم يُضبط بعد.",
    unpublishedTitle: "الوحدات ما زالت قيد الإعداد",
    unpublishedBody: "الفهرس موجود، لكن لم تُنشر أي وحدة للتعلّم بعد.",
    noReadySourceTitle: "المواد المعتمدة ليست جاهزة بعد",
    noReadySourceBody: "تظل الوحدات المنشورة مخفية حتى يصبح مصدر معتمد جاهزًا.",
    errorTitle: "تعذّر التحقق من فهرسك",
    errorBody: "لم يتم توسيع صلاحياتك. حاول تحميل الفهرس المصرّح مرة أخرى.",
    retry: "حاول مرة أخرى",
    choosePathTitle: "أكمل مسارك المصرّح",
    choosePathBody:
      "اختر المستوى التالي. تظل الاختيارات اللاحقة فارغة حتى يؤكد الخادم اختيارك.",
    noSearchTitle: "لا توجد وحدات مصرّح بها مطابقة",
    noSearchBody: "جرّب اسمًا آخر أو امسح البحث.",
    clearSearch: "مسح البحث",
    workspacePending: "مساحة العمل تُنفّذ في WP03-T04",
    sourceCount: "مصادر معتمدة",
    edition: "إصدار المنهج",
    selectUnit: "اختيار الوحدة الدراسية",
    syntheticNotice: "رحلة فهرس ببيانات تجريبية",
  },
} as const;

export function getCatalogCopy(locale: Locale) {
  return copy[locale];
}
