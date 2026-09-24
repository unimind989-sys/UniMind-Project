import type {
  AdminActionName,
  AdminActionCode,
} from "../admin/admin-actions.domain";
import type { Locale } from "./locale";

const resourceNames = {
  en: {
    catalog: "Catalog",
    cohorts: "Cohorts",
    sources: "Sources",
    jobs: "Jobs",
    quality: "Quality",
    usage: "Usage",
    incidents: "Incidents",
  },
  ar: {
    catalog: "الفهرس",
    cohorts: "المجموعات الدراسية",
    sources: "المصادر",
    jobs: "المهام",
    quality: "الجودة",
    usage: "الاستخدام",
    incidents: "الحوادث",
  },
} as const;

const adminCopy = {
  en: {
    pageTitle: "Admin decision queue",
    pageDescription:
      "Review the exact target, current state, readiness checks, and approval path before each governed change.",
    resourceHeading: "Resources",
    language: "Language",
    decisionsHeading: "Decisions needing action",
    emptyTitle: "No decisions are waiting",
    emptyBody:
      "New review requests and pending founder confirmations will appear here.",
    unavailableTitle: "Admin queue unavailable",
    unavailableBody:
      "The current decision state could not be checked. No action was submitted.",
    forbiddenTitle: "Admin access required",
    forbiddenBody: "This view is available to active administrators only.",
    target: "Target scope",
    targetId: "Exact target ID",
    currentState: "Current state",
    proposedState: "Proposed state",
    expectedVersion: "Expected version",
    readiness: "Readiness checks",
    ready: "No failed readiness checks",
    pendingFounder: "Waiting for a distinct founder confirmation",
    pendingReview: "Retry request recorded for owner review",
    initiatedBy: "First confirmation",
    founderAhmed: "Ahmed",
    founderZiad: "Ziad",
    reason: "Reason for this change",
    reasonHint: "Use a short governance reason. Do not include source content.",
    reasonPlaceholder: "Why is this change needed?",
    holdExpiry: "Hold expiry and review date",
    holdReview: "I reviewed this synthetic object and its expiry.",
    confirmAction: "Submit this action",
    confirmProtected: "Confirm this exact change",
    confirmSecond: "Add my separate founder confirmation",
    reviewAction: "Review exact change",
    checkingState: "Checking current state…",
    reloadQueue: "Reload current decisions",
    reviewHeading: "Review before recording",
    cancelReview: "Cancel and edit",
    separateFounderNotice:
      "This protected change stays pending until the other verified founder confirms this exact candidate.",
    consequences: {
      PUBLISH_UNIT:
        "This unit becomes visible when the cohort is unlocked and its approved source stays ready.",
      HIDE_UNIT:
        "This unit is hidden from student availability immediately; its history remains.",
      UNLOCK_COHORT:
        "This cohort becomes available to eligible students after both founders confirm.",
      LOCK_COHORT:
        "This cohort becomes unavailable to students immediately; its history remains.",
      ACTIVATE_SOURCE:
        "This accepted source joins the available unit pool after both founders confirm.",
      DEACTIVATE_SOURCE:
        "This source leaves student availability immediately; processed history remains.",
      QUARANTINE_SOURCE:
        "This failed source is isolated immediately and its provenance remains.",
      RETRY_SOURCE:
        "This records an owner review request. No worker starts and the source stays in its current state.",
      PLACE_RAW_HOLD:
        "This synthetic raw object is preserved until its documented review or expiry.",
      REMOVE_RAW_HOLD:
        "This releases a synthetic preservation hold after a fresh safety check; no bytes are deleted.",
      ENABLE_FLAG:
        "This approved mock artifact becomes available only after both founders confirm.",
      DISABLE_FLAG:
        "This provider or artifact is disabled immediately; existing records remain.",
    } satisfies Record<AdminActionName, string>,
    working: "Recording the audited action…",
    cancelSelection: "Clear selection",
    actionSuccess: "The governed change was recorded.",
    actionPending:
      "The request is recorded and needs a distinct founder confirmation.",
    retryPending:
      "The retry request is recorded. The source remains in its current state until a worker accepts it.",
    blocked: "This action is blocked by the listed readiness checks.",
    syntheticOnly:
      "Synthetic objects only. Real storage and providers stay disabled.",
    resourceUnavailable: "This resource view is not available yet.",
    actions: {
      PUBLISH_UNIT: "Publish unit",
      HIDE_UNIT: "Hide unit",
      UNLOCK_COHORT: "Unlock cohort",
      LOCK_COHORT: "Lock cohort",
      ACTIVATE_SOURCE: "Activate source version",
      DEACTIVATE_SOURCE: "Deactivate source version",
      QUARANTINE_SOURCE: "Quarantine failed source",
      RETRY_SOURCE: "Request source retry",
      PLACE_RAW_HOLD: "Place raw-data hold",
      REMOVE_RAW_HOLD: "Remove raw-data hold",
      ENABLE_FLAG: "Enable approved mock artifact",
      DISABLE_FLAG: "Disable provider or artifact",
    } satisfies Record<AdminActionName, string>,
    states: {
      DRAFT: "Draft",
      WITHDRAWN: "Withdrawn",
      PUBLISHED: "Published",
      LOCKED: "Locked",
      UNLOCKED: "Unlocked",
      ACTIVE: "Active",
      INACTIVE: "Inactive",
      DEACTIVATED: "Deactivated",
      FAILED: "Failed",
      NEEDS_REVIEW: "Needs review",
      QUARANTINED: "Quarantined",
      PENDING_OWNER_REVIEW: "Pending owner review",
      STORED: "Stored",
      HELD: "Held",
      DISABLED: "Disabled",
      ENABLED: "Enabled",
    } satisfies Record<string, string>,
    predicates: {
      "cohort.active": "The cohort must be active.",
      "unit.published": "At least one unit must be published.",
      "source.active_ready": "At least one source must be active and READY.",
      "source.ready": "The source must be accepted and READY.",
      "source.active": "The source must be active.",
      "source.rights_current": "Source rights must be valid now.",
      "source.edition_matches": "The source edition must match the cohort.",
      "source.not_quarantined": "The source must not be quarantined.",
      "raw.processed_durable": "Verified processed content must be durable.",
      "flag.mock_approval_missing":
        "Approved mock-artifact environment evidence is required.",
      "flag.provider_approval_open": "Real-provider enablement is closed.",
      "retry.request_pending": "An earlier retry request is still active.",
    } satisfies Record<string, string>,
    errors: {
      FORBIDDEN: "Your current account cannot perform this action.",
      INVALID_REQUEST: "Complete the required fields with a valid value.",
      STALE_VERSION:
        "This item changed. Reload its current state before acting.",
      STATE_CONFLICT: "This action no longer matches the item's current state.",
      READINESS_BLOCKED: "The required readiness checks did not pass.",
      PRINCIPAL_UNVERIFIED: "A verified founder principal is required.",
      DIFFERENT_FOUNDER_REQUIRED: "A second, distinct founder must confirm.",
      CONFIRMATION_EXPIRED: "This confirmation expired. Review the item again.",
      RETRY_ALREADY_PENDING: "A retry request is already waiting for review.",
      APPROVAL_GATE_CLOSED: "The provider or artifact approval gate is closed.",
      SAFETY_CHECK_FAILED: "The fresh raw-data safety check did not pass.",
      CONFLICT: "This request key was already used with different details.",
      UNAVAILABLE:
        "The action outcome could not be verified. Reload the current state before retrying.",
    } satisfies Record<AdminActionCode, string>,
  },
  ar: {
    pageTitle: "قائمة قرارات الإدارة",
    pageDescription:
      "راجع النطاق المحدد والحالة الحالية وفحوص الجاهزية ومسار الاعتماد قبل كل تغيير حوكمي.",
    resourceHeading: "الموارد",
    language: "اللغة",
    decisionsHeading: "قرارات تحتاج إلى إجراء",
    emptyTitle: "لا توجد قرارات معلّقة",
    emptyBody: "ستظهر هنا طلبات المراجعة وتأكيدات المؤسسين المعلّقة.",
    unavailableTitle: "قائمة الإدارة غير متاحة",
    unavailableBody:
      "تعذّر التحقق من حالة القرار الحالية. لم يتم إرسال أي إجراء.",
    forbiddenTitle: "يلزم الوصول الإداري",
    forbiddenBody: "هذه الصفحة متاحة للمسؤولين النشطين فقط.",
    target: "نطاق الهدف",
    targetId: "معرّف الهدف المحدد",
    currentState: "الحالة الحالية",
    proposedState: "الحالة المقترحة",
    expectedVersion: "الإصدار المتوقع",
    readiness: "فحوص الجاهزية",
    ready: "لا توجد فحوص جاهزية فاشلة",
    pendingFounder: "بانتظار تأكيد مؤسس مختلف",
    pendingReview: "تم تسجيل طلب الإعادة لمراجعة المسؤول",
    initiatedBy: "التأكيد الأول",
    founderAhmed: "أحمد",
    founderZiad: "زياد",
    reason: "سبب هذا التغيير",
    reasonHint: "اكتب سببًا حوكميًا موجزًا. لا تضف محتوى المصدر.",
    reasonPlaceholder: "لماذا نحتاج إلى هذا التغيير؟",
    holdExpiry: "تاريخ انتهاء الحجز ومراجعته",
    holdReview: "راجعت هذا العنصر التجريبي وتاريخ انتهائه.",
    confirmAction: "إرسال هذا الإجراء",
    confirmProtected: "تأكيد هذا التغيير المحدد",
    confirmSecond: "إضافة تأكيدي كمؤسس مستقل",
    reviewAction: "مراجعة التغيير المحدد",
    checkingState: "جارٍ فحص الحالة الحالية…",
    reloadQueue: "تحديث القرارات الحالية",
    reviewHeading: "راجع قبل التسجيل",
    cancelReview: "إلغاء والعودة للتعديل",
    separateFounderNotice:
      "سيبقى هذا التغيير المحمي معلّقًا حتى يؤكده المؤسس الآخر بحسابه الموثّق لنفس القرار المحدد.",
    consequences: {
      PUBLISH_UNIT:
        "ستظهر الوحدة عند فتح المجموعة وبقاء مصدرها المعتمد جاهزًا.",
      HIDE_UNIT: "ستختفي الوحدة من إتاحة الطلاب فورًا مع الاحتفاظ بسجلها.",
      UNLOCK_COHORT: "ستتاح هذه المجموعة للطلاب المؤهلين بعد تأكيد المؤسسين.",
      LOCK_COHORT:
        "ستصبح هذه المجموعة غير متاحة للطلاب فورًا مع الاحتفاظ بسجلها.",
      ACTIVATE_SOURCE:
        "سينضم هذا المصدر المقبول إلى مصادر الوحدة المتاحة بعد تأكيد المؤسسين.",
      DEACTIVATE_SOURCE:
        "سيخرج هذا المصدر من إتاحة الطلاب فورًا مع بقاء سجل المعالجة.",
      QUARANTINE_SOURCE:
        "سيُعزل هذا المصدر الفاشل فورًا مع الاحتفاظ بمصدره وسجله.",
      RETRY_SOURCE:
        "سيسجل طلب مراجعة للمسؤول. لن يبدأ العامل وستبقى حالة المصدر كما هي.",
      PLACE_RAW_HOLD:
        "سيُحفظ هذا العنصر الخام التجريبي حتى موعد مراجعته أو انتهاء الحجز.",
      REMOVE_RAW_HOLD:
        "سيُرفع حجز الحفظ التجريبي بعد فحص سلامة جديد دون حذف أي بيانات.",
      ENABLE_FLAG: "سيتاح الناتج التجريبي المعتمد فقط بعد تأكيد المؤسسين.",
      DISABLE_FLAG:
        "سيُعطّل هذا المزوّد أو الناتج فورًا مع بقاء السجلات الحالية.",
    } satisfies Record<AdminActionName, string>,
    working: "جارٍ تسجيل الإجراء المدقّق…",
    cancelSelection: "مسح التحديد",
    actionSuccess: "تم تسجيل التغيير الحوكمي.",
    actionPending: "تم تسجيل الطلب ويحتاج إلى تأكيد مؤسس مختلف.",
    retryPending:
      "تم تسجيل طلب الإعادة. ستبقى حالة المصدر كما هي حتى يقبل العامل الطلب.",
    blocked: "هذا الإجراء متوقف بسبب فحوص الجاهزية المعروضة.",
    syntheticOnly:
      "العناصر التجريبية فقط. التخزين والمزوّدون الحقيقيون معطّلون.",
    resourceUnavailable: "صفحة هذا المورد غير متاحة بعد.",
    actions: {
      PUBLISH_UNIT: "نشر الوحدة",
      HIDE_UNIT: "إخفاء الوحدة",
      UNLOCK_COHORT: "فتح المجموعة الدراسية",
      LOCK_COHORT: "قفل المجموعة الدراسية",
      ACTIVATE_SOURCE: "تفعيل إصدار المصدر",
      DEACTIVATE_SOURCE: "إيقاف إصدار المصدر",
      QUARANTINE_SOURCE: "عزل المصدر الفاشل",
      RETRY_SOURCE: "طلب إعادة معالجة المصدر",
      PLACE_RAW_HOLD: "وضع حجز على البيانات الخام",
      REMOVE_RAW_HOLD: "إزالة حجز البيانات الخام",
      ENABLE_FLAG: "تفعيل ناتج تجريبي معتمد",
      DISABLE_FLAG: "تعطيل المزوّد أو الناتج",
    } satisfies Record<AdminActionName, string>,
    states: {
      DRAFT: "مسودة",
      WITHDRAWN: "مسحوبة",
      PUBLISHED: "منشورة",
      LOCKED: "مقفلة",
      UNLOCKED: "مفتوحة",
      ACTIVE: "نشط",
      INACTIVE: "غير نشط",
      DEACTIVATED: "معطّل",
      FAILED: "فشل",
      NEEDS_REVIEW: "بانتظار المراجعة",
      QUARANTINED: "معزول",
      PENDING_OWNER_REVIEW: "بانتظار مراجعة المسؤول",
      STORED: "محفوظ",
      HELD: "محجوز",
      DISABLED: "معطّل",
      ENABLED: "مفعّل",
    } satisfies Record<string, string>,
    predicates: {
      "cohort.active": "يجب أن تكون المجموعة الدراسية نشطة.",
      "unit.published": "يجب نشر وحدة واحدة على الأقل.",
      "source.active_ready": "يجب أن يكون مصدر واحد على الأقل نشطًا وجاهزًا.",
      "source.ready": "يجب قبول المصدر ووصوله إلى حالة الجاهزية.",
      "source.active": "يجب أن يكون المصدر نشطًا.",
      "source.rights_current": "يجب أن تكون حقوق المصدر سارية الآن.",
      "source.edition_matches": "يجب أن يطابق إصدار المصدر المجموعة.",
      "source.not_quarantined": "يجب ألا يكون المصدر معزولًا.",
      "raw.processed_durable": "يجب توثيق حفظ المحتوى المعالج بشكل دائم.",
      "flag.mock_approval_missing": "يلزم دليل اعتماد بيئة الناتج التجريبي.",
      "flag.provider_approval_open": "تفعيل المزوّد الحقيقي مقفول.",
      "retry.request_pending": "يوجد طلب إعادة معالجة سابق بانتظار المراجعة.",
    } satisfies Record<string, string>,
    errors: {
      FORBIDDEN: "لا يمكن لحسابك الحالي تنفيذ هذا الإجراء.",
      INVALID_REQUEST: "أكمل الحقول المطلوبة بقيم صحيحة.",
      STALE_VERSION: "تغيّر هذا العنصر. حدّث حالته قبل اتخاذ الإجراء.",
      STATE_CONFLICT: "لم يعد هذا الإجراء مطابقًا للحالة الحالية للعنصر.",
      READINESS_BLOCKED: "لم تنجح فحوص الجاهزية المطلوبة.",
      PRINCIPAL_UNVERIFIED: "يلزم حساب مؤسس موثّق.",
      DIFFERENT_FOUNDER_REQUIRED: "يلزم تأكيد مؤسس ثانٍ ومختلف.",
      CONFIRMATION_EXPIRED: "انتهت صلاحية التأكيد. راجع العنصر مجددًا.",
      RETRY_ALREADY_PENDING: "يوجد طلب إعادة معالجة بانتظار المراجعة.",
      APPROVAL_GATE_CLOSED: "بوابة اعتماد المزوّد أو الناتج ما زالت مقفولة.",
      SAFETY_CHECK_FAILED: "لم ينجح فحص سلامة البيانات الخام الجديد.",
      CONFLICT: "استُخدم مفتاح الطلب نفسه مع تفاصيل مختلفة.",
      UNAVAILABLE:
        "تعذّر التحقق من نتيجة الإجراء. حدّث الحالة الحالية قبل إعادة المحاولة.",
    } satisfies Record<AdminActionCode, string>,
  },
} as const;

export function getAdminCopy(locale: Locale) {
  return { ...adminCopy[locale], resources: resourceNames[locale] };
}
