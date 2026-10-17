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
    "Brachial plexus: roots, trunks, divisions, cords and branches, with the variants your notes mention",
    "الضفيرة العضدية: الجذور والجذوع والأقسام والحبال والفروع، مع الاختلافات المذكورة في ملاحظاتك",
  ],
  [
    "Upper limb nerve injuries side by side: Erb's palsy, Klumpke's palsy and the radial nerve in the spiral groove",
    "إصابات أعصاب الطرف العلوي جنبًا إلى جنب: شلل إرب وشلل كلومبكه والعصب الكعبري في الميزاب الحلزوني",
  ],
  [
    "Checking page references before writing a revision outline for the axilla and the arm",
    "مراجعة أرقام الصفحات والتوقيتات قبل كتابة مخطط مراجعة شامل للإبط والذراع",
  ],
  [
    "Muscles of the shoulder and arm grouped by nerve supply, keeping unsupported conclusions out",
    "عضلات الكتف والذراع مرتبة حسب التغذية العصبية، مع استبعاد الاستنتاجات غير المدعومة",
  ],
  [
    "Practical revision of the boundaries and contents of the axilla, with timestamps from the recording",
    "مراجعة عملية لحدود الإبط ومحتوياته من العضلات والأوعية، مع توقيتات من التسجيل",
  ],
  [
    "A second pass through Lecture 6 to separate evidence from suggested revision questions",
    "قراءة ثانية متأنية للمحاضرة 6 للفصل بين الأدلة وأسئلة المراجعة المقترحة",
  ],
];

export const studyDensitySourceTitles: readonly Localized[] = [
  ["Lecture 6 handout", "ملزمة المحاضرة 6"],
  ["Practical 3 recording", "تسجيل العملي 3"],
  ...Array.from(
    { length: studyDensityFixture.sourceCount - 2 },
    (_, index): Localized => {
      const topic = topics[index % topics.length]!;
      return [
        `Revision notes ${index + 1}: ${topic[0]}`,
        `ملاحظات مراجعة ${index + 1}: ${topic[1]}`,
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
