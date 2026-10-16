import type {
  Localized,
  ReviewSession,
  ReviewState,
  SampleAnswer,
} from "./synthetic-fixtures.application";

export const studyDensityFixture = {
  id: "dense",
  sessionCount: 12,
  sourceCount: 24,
} as const;

const topics: readonly Localized[] = [
  [
    "Review of labelled regional diagrams, their comparison order and the limits of the supplied evidence",
    "مراجعة الرسوم الموضعية المسماة وترتيب المقارنة وحدود الأدلة الواردة في المواد التجريبية",
  ],
  [
    "Comparison of the handout and recording, with separate notes for agreements and unresolved differences",
    "مقارنة الملزمة والتسجيل مع ملاحظات منفصلة لنقاط الاتفاق والاختلافات التي لم تحسمها المصادر",
  ],
  [
    "Checking source references before preparing a revision outline for the next synthetic study session",
    "فحص مراجع المصادر قبل إعداد مخطط مراجعة لجلسة المذاكرة التجريبية التالية",
  ],
  [
    "Organizing identification and comparison notes while keeping unsupported conclusions out of the summary",
    "تنظيم ملاحظات تحديد الأسماء والمقارنة مع استبعاد الاستنتاجات غير المدعومة من الملخص",
  ],
  [
    "Revision of diagram labels across several regions and a final check of missing page or time references",
    "مراجعة أسماء الرسوم في مناطق متعددة والتحقق النهائي من مراجع الصفحات أو التوقيتات غير المتاحة",
  ],
  [
    "A second pass through the same sample material to distinguish evidence from suggested revision prompts",
    "قراءة ثانية للمواد التجريبية نفسها للتمييز بين الأدلة والأسئلة المقترحة للمراجعة",
  ],
];

export const studyDensitySourceTitles: readonly Localized[] = [
  ["Synthetic sequence handout", "ملزمة الترتيب التجريبية"],
  ["Synthetic comparison recording", "تسجيل المقارنة التجريبي"],
  ...Array.from(
    { length: studyDensityFixture.sourceCount - 2 },
    (_, index): Localized => {
      const topic = topics[index % topics.length]!;
      return [
        `Synthetic appendix ${index + 1} — ${topic[0]}`,
        `ملحق تجريبي ${index + 1} — ${topic[1]}`,
      ];
    },
  ),
];

export function studyDensityManifest(unitPath: string) {
  return {
    ...studyDensityFixture,
    localOnly: true,
    unitPath,
    preparedPath: `${unitPath}/chat?fixture=dense`,
    sourceTitles: studyDensitySourceTitles,
    note: "Adds twelve fixed sessions once per document, retaining prior work. Twenty-four invented source records share the existing evidence identities and readiness examples. No real capacity, retrieval or provider-quality claim.",
  };
}

type DensityState = Pick<
  ReviewState,
  "studyDensityUnitId" | "sessions" | "activeSessions" | "sharing"
>;

// Called only by the loopback adapter after its existing access/scope gates.
// Fixed invented records never replace an existing session, preference or draft.
export function prepareStudyDensity<T extends DensityState>(
  state: T,
  unitId: string,
  language: SampleAnswer["language"],
): T {
  if (state.studyDensityUnitId !== null) return state;
  const firstId =
    state.sessions.reduce(
      (maximum, session) => Math.max(maximum, session.id),
      0,
    ) + 1;
  const sessions: ReviewSession[] = Array.from(
    { length: studyDensityFixture.sessionCount },
    (_, index) => {
      const id = firstId + index;
      const kinds: readonly SampleAnswer["kind"][] = [
        "supported",
        index % 2 === 0 ? "partial" : "conflict",
      ];
      return {
        id,
        scope: unitId,
        title: topics[index % topics.length]!,
        answers: kinds.map((kind) => ({
          kind,
          promptKind: kind,
          sessionId: id,
          sharing: state.sharing,
          language,
        })),
      };
    },
  );
  return {
    ...state,
    studyDensityUnitId: unitId,
    sessions: [...state.sessions, ...sessions],
    activeSessions: {
      ...state.activeSessions,
      [unitId]: state.activeSessions[unitId] ?? firstId,
    },
  };
}

export function studyFixtureSourceCount(
  state: Pick<ReviewState, "studyDensityUnitId">,
  unitId: string,
  normalCount: number,
) {
  return state.studyDensityUnitId === unitId
    ? studyDensityFixture.sourceCount
    : normalCount;
}
