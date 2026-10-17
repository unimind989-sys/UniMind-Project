// Fixed invented teaching examples. No source loading, retrieval or provider.
// Topic ids stay "sequence" and "comparison"; their labels are
// "Upper trunk injury" and "Roots of the plexus".
export const studioFixtureTypes = [
  "summary",
  "guide",
  "practice",
  "flashcards",
  "revision",
  "quiz",
] as const;
export type StudioFixtureText = readonly [string, string];
export type StudioFixtureOptions = {
  type: (typeof studioFixtureTypes)[number];
  language: "en" | "ar" | "mixed";
  topic: "sequence" | "comparison";
  depth: "concise" | "detailed";
  size: "short" | "extended";
};
type Item = { text: StudioFixtureText; explanation: StudioFixtureText };
type Question = {
  prompt: StudioFixtureText;
  answer: StudioFixtureText;
  explanation: StudioFixtureText;
};
// "sequence" is the upper trunk injury (Erb's palsy) from the Lecture 6
// handout and the Practical 3 recording; "comparison" is the roots of the
// plexus, where the two sources disagree about a C4 branch.
const sequence = {
  intro: [
    "Learn the upper trunk injury from the handout, then check the arm position against the practical recording.",
    "تعلّم إصابة الجذع العلوي من الملزمة، ثم راجع وضع الذراع في تسجيل العملي.",
  ] as const,
  facts: [
    {
      text: [
        "An upper trunk injury damages the C5 and C6 roots and produces Erb's palsy.",
        "إصابة الجذع العلوي تؤثر على الجذرين C5 وC6 وتسبب شلل إرب.",
      ],
      explanation: [
        "The Lecture 6 handout states this on page 14. It names the roots; it does not grade how severe an injury is.",
        "تذكر ملزمة المحاضرة 6 ذلك في صفحة 14. تسمي الجذور، لكنها لا تصنف شدة الإصابة.",
      ],
    },
    {
      text: [
        "The arm hangs adducted and medially rotated, with the forearm extended and pronated: the waiter's tip position.",
        "يتدلى الذراع مقرّبًا ومدوّرًا للداخل والساعد ممدود ومكبوب: وضع «بقشيش النادل».",
      ],
      explanation: [
        "The Practical 3 recording describes this position at 18:42. Keep the handout's cause and the recording's description attributed to each source.",
        "يصف تسجيل العملي 3 هذا الوضع عند 18:42. انسب السبب إلى الملزمة والوصف إلى التسجيل.",
      ],
    },
    {
      text: [
        "Neither source says how long recovery takes.",
        "لا يذكر أي من المصدرين مدة التعافي.",
      ],
      explanation: [
        "A revision plan can flag that gap, but it cannot turn a guessed recovery time into a source-backed fact.",
        "يمكن لخطة المراجعة إبراز هذا النقص، لكن لا يمكنها تحويل مدة مخمّنة إلى معلومة مدعومة بالمصدر.",
      ],
    },
    {
      text: [
        "Separate what the handout states, what the recording shows and your open questions.",
        "افصل ما تذكره الملزمة عما يعرضه التسجيل وعن أسئلتك المفتوحة.",
      ],
      explanation: [
        "This structure keeps the evidence visible and leaves unsupported details open for later approved material.",
        "يُبقي هذا التنظيم الأدلة واضحة ويترك التفاصيل غير المدعومة مفتوحة لمواد معتمدة لاحقًا.",
      ],
    },
  ] as readonly Item[],
  steps: [
    {
      text: ["Name the roots of the upper trunk.", "سمِّ جذور الجذع العلوي."],
      explanation: [
        "Use the handout's wording: C5 and C6. Do not add roots the page does not name.",
        "استخدم صياغة الملزمة: C5 وC6. لا تضف جذورًا لم تذكرها الصفحة.",
      ],
    },
    {
      text: ["Explain the cause using the handout.", "اشرح السبب من الملزمة."],
      explanation: [
        "The handout gives excessive separation of the head and shoulder, as in a fall on the shoulder or a difficult delivery.",
        "تذكر الملزمة المباعدة الشديدة بين الرأس والكتف، كما في السقوط على الكتف أو الولادة المتعسرة.",
      ],
    },
    {
      text: [
        "Describe the arm position from the recording.",
        "صِف وضع الذراع من التسجيل.",
      ],
      explanation: [
        "Recording, 18:42: arm medially rotated, forearm pronated, palm facing backwards. Attribute it to the practical, not the handout.",
        "التسجيل عند 18:42: الذراع مدوّر للداخل والساعد مكبوب وراحة اليد للخلف. انسبه إلى العملي لا إلى الملزمة.",
      ],
    },
    {
      text: [
        "End with the unanswered recovery question.",
        "اختم بسؤال التعافي الذي لم تجب عنه المصادر.",
      ],
      explanation: [
        "Record that neither source gives a recovery time, rather than suggesting one as if it came from the material.",
        "سجّل أن المصدرين لا يذكران مدة للتعافي، بدلًا من اقتراح مدة وكأنها من المواد.",
      ],
    },
  ] as readonly Item[],
  questions: [
    {
      prompt: [
        "Question: Which roots does an upper trunk injury damage?",
        "سؤال: ما الجذور التي تتأثر عند إصابة الجذع العلوي؟",
      ],
      answer: [
        "C5 and C6 (Lecture 6 handout, page 14).",
        "الجذران C5 وC6 (ملزمة المحاضرة 6، صفحة ١٤).",
      ],
      explanation: [
        "The answer uses one source's statement. It does not claim that the recording repeats it.",
        "تعتمد الإجابة على كلام مصدر واحد، ولا تدّعي أن التسجيل يكرره.",
      ],
    },
    {
      prompt: [
        "Question: What position does the arm take in Erb's palsy?",
        "سؤال: ما وضع الذراع في شلل إرب؟",
      ],
      answer: [
        "The waiter's tip: adducted and medially rotated, with the forearm extended and pronated.",
        "وضع «بقشيش النادل»: مقرّب ومدوّر للداخل والساعد ممدود ومكبوب.",
      ],
      explanation: [
        "This comes from the Practical 3 recording at 18:42, not from a diagram interpretation.",
        "هذا من تسجيل العملي 3 عند 18:42، وليس تفسيرًا لرسم.",
      ],
    },
    {
      prompt: [
        "Question: Which mechanism does the handout give for the injury?",
        "سؤال: ما آلية الإصابة التي تذكرها الملزمة؟",
      ],
      answer: [
        "Excessive separation of the head and shoulder, as in a fall on the shoulder or a difficult delivery.",
        "المباعدة الشديدة بين الرأس والكتف، كما في السقوط على الكتف أو الولادة المتعسرة.",
      ],
      explanation: [
        "Keep the handout's wording; it does not list other mechanisms.",
        "التزم بصياغة الملزمة؛ فهي لا تذكر آليات أخرى.",
      ],
    },
    {
      prompt: [
        "Question: How many weeks does recovery take?",
        "سؤال: كم أسبوعًا يستغرق التعافي؟",
      ],
      answer: [
        "Your materials do not give a recovery time.",
        "لا تذكر موادك مدة للتعافي.",
      ],
      explanation: [
        "The evidence-limited answer is that timing is unavailable, not a guessed number.",
        "الإجابة المنضبطة بحدود الأدلة هي أن المدة غير متاحة، وليست رقمًا مخمّنًا.",
      ],
    },
  ] as readonly Question[],
};
const comparison = {
  intro: [
    "Compare what the two sources say about the roots of the plexus; they disagree on whether C4 contributes.",
    "قارن ما يقوله المصدران عن جذور الضفيرة؛ فهما يختلفان حول مساهمة C4.",
  ] as const,
  facts: [
    {
      text: [
        "The handout says the plexus is formed by C5 to T1; the recording says it can also take a branch from C4.",
        "تقول الملزمة إن الضفيرة تتكون من C5 إلى T1، ويقول التسجيل إنها قد تأخذ فرعًا من C4 أيضًا.",
      ],
      explanation: [
        "These are two different statements. Compare their wording and attribution rather than declaring one correct.",
        "هذان قولان مختلفان. قارن صياغتهما ونسبتهما إلى مصدريهما بدلًا من إعلان صحة أحدهما.",
      ],
    },
    {
      text: [
        "Neither passage says how often a prefixed plexus occurs.",
        "لا يذكر أي من النصين مدى تكرار الضفيرة المتقدمة.",
      ],
      explanation: [
        "A comparison should leave that unspecified. The fixed example cannot supply facts absent from both sources.",
        "يجب أن تترك المقارنة ذلك غير محدد. لا يستطيع المثال الثابت تقديم معلومات غائبة عن المصدرين.",
      ],
    },
    {
      text: [
        "Keep claims about the roots separate from claims about injuries.",
        "افصل ما يخص الجذور عما يخص الإصابات.",
      ],
      explanation: [
        "A statement about which roots form the plexus does not by itself establish which injury follows from which root.",
        "القول بأي الجذور تكوّن الضفيرة لا يحدد وحده أي إصابة تنتج عن أي جذر.",
      ],
    },
    {
      text: [
        "Record which questions still need another approved passage.",
        "سجّل الأسئلة التي لا تزال تحتاج إلى نص معتمد آخر.",
      ],
      explanation: [
        "Neither the frequency of a prefixed plexus nor other root variants can be resolved from these two excerpts.",
        "لا يمكن حسم مدى تكرار الضفيرة المتقدمة أو اختلافات الجذور الأخرى من هذين المقتطفين.",
      ],
    },
  ] as readonly Item[],
  steps: [
    {
      text: [
        "Create separate notes for the handout and the recording.",
        "أنشئ ملاحظات منفصلة للملزمة والتسجيل.",
      ],
      explanation: [
        "Write each source's statement with its own locator (page 14, 18:42) rather than merging them.",
        "اكتب قول كل مصدر مع مرجعه (صفحة 14، 18:42) بدلًا من دمجهما.",
      ],
    },
    {
      text: [
        "Mark the disagreement and the missing details.",
        "حدّد موضع الخلاف والتفاصيل الناقصة.",
      ],
      explanation: [
        "The roots differ by C4. How often each pattern occurs is not supplied.",
        "يختلف المصدران في C4. ولا يرد مدى تكرار كل نمط.",
      ],
    },
    {
      text: [
        "Check whether each claim in your notes has explicit evidence.",
        "تحقق من وجود دليل صريح لكل قول في ملاحظاتك.",
      ],
      explanation: [
        "If no supplied excerpt states it, leave it as a question instead of adding outside knowledge.",
        "إذا لم يذكره مقتطف وارد، فاتركه سؤالًا بدلًا من إضافة معرفة خارجية.",
      ],
    },
    {
      text: [
        "List the extra approved material needed to finish.",
        "اسرد المواد المعتمدة الإضافية اللازمة للإكمال.",
      ],
      explanation: [
        "Ask for a passage on variants of the plexus; do not pretend those details are already available.",
        "اطلب نصًا عن اختلافات الضفيرة، ولا توحِ بأن هذه التفاصيل متاحة بالفعل.",
      ],
    },
  ] as readonly Item[],
  questions: [
    {
      prompt: [
        "Question: Which roots does the handout list?",
        "سؤال: ما الجذور التي تذكرها الملزمة؟",
      ],
      answer: [
        "C5 to T1 (Lecture 6 handout, page 14).",
        "من C5 إلى T1 (ملزمة المحاضرة 6، صفحة ١٤).",
      ],
      explanation: [
        "This is the handout's statement; the recording adds a possible C4 branch.",
        "هذا قول الملزمة؛ ويضيف التسجيل فرعًا محتملًا من C4.",
      ],
    },
    {
      prompt: [
        "Question: What disagreement should your notes show?",
        "سؤال: ما الخلاف الذي يجب أن تظهره ملاحظاتك؟",
      ],
      answer: [
        "The handout lists C5 to T1; the recording says a prefixed plexus also takes C4.",
        "تذكر الملزمة C5 إلى T1، ويقول التسجيل إن الضفيرة المتقدمة تأخذ C4 أيضًا.",
      ],
      explanation: [
        "Attribute each statement to its source and keep the conflict without deciding between them.",
        "انسب كل قول إلى مصدره واحتفظ بالتعارض دون ترجيح أحدهما.",
      ],
    },
    {
      prompt: [
        "Question: How common is a prefixed plexus?",
        "سؤال: ما مدى شيوع الضفيرة المتقدمة؟",
      ],
      answer: [
        "Your materials do not say how often it occurs.",
        "لا تذكر موادك مدى تكرارها.",
      ],
      explanation: [
        "The recording says it happens in some people. A frequency needs its own approved evidence.",
        "يقول التسجيل إنها تحدث عند بعض الناس. أما معدل حدوثها فيحتاج إلى دليل معتمد خاص.",
      ],
    },
    {
      prompt: [
        "Question: What would support a new claim about a root variant?",
        "سؤال: ما الذي يدعم قولًا جديدًا عن اختلاف في الجذور؟",
      ],
      answer: [
        "An approved passage that names it with a usable page or timestamp.",
        "نص معتمد يذكره صراحة مع صفحة أو توقيت يمكن الرجوع إليه.",
      ],
      explanation: [
        "A general instruction to count the roots cannot substitute for evidence of a particular variant.",
        "لا يحل توجيه عام بعدّ الجذور محل الدليل على اختلاف بعينه.",
      ],
    },
  ] as readonly Question[],
};

export type StudioFixtureContent = {
  options: StudioFixtureOptions;
  intro: StudioFixtureText;
  paragraphs: StudioFixtureText[];
  steps: Item[];
  questions: { prompt: StudioFixtureText; explanations: StudioFixtureText[] }[];
  card: { front: StudioFixtureText[]; back: StudioFixtureText[] } | null;
};
export function buildStudioFixture(
  input: Record<keyof StudioFixtureOptions, string>,
): StudioFixtureContent | null {
  if (
    !studioFixtureTypes.some((value) => value === input.type) ||
    !["en", "ar", "mixed"].includes(input.language) ||
    !["sequence", "comparison"].includes(input.topic) ||
    !["concise", "detailed"].includes(input.depth) ||
    !["short", "extended"].includes(input.size)
  )
    return null;
  const options = { ...input } as StudioFixtureOptions;
  const lesson = options.topic === "comparison" ? comparison : sequence;
  const detailed = options.depth === "detailed";
  const extended = options.size === "extended";
  const result: StudioFixtureContent = {
    options,
    intro: lesson.intro,
    paragraphs: [],
    steps: [],
    questions: [],
    card: null,
  };
  if (options.type === "summary")
    result.paragraphs = lesson.facts
      .slice(0, extended ? 4 : 2)
      .flatMap((item) =>
        detailed ? [item.text, item.explanation] : [item.text],
      );
  if (options.type === "guide")
    result.steps = lesson.steps.slice(0, extended ? 4 : 2).map((item) => ({
      text: item.text,
      explanation: detailed ? item.explanation : ["", ""],
    }));
  if (options.type === "revision") {
    result.intro =
      options.topic === "comparison"
        ? [
            "Revision checklist: the two statements about the roots, their disagreement and what is missing.",
            "قائمة مراجعة: قولا المصدرين عن الجذور والخلاف بينهما وما ينقصهما.",
          ]
        : [
            "Revision checklist: the roots, the cause, the arm position and the missing recovery time.",
            "قائمة مراجعة: الجذور والسبب ووضع الذراع ومدة التعافي غير المذكورة.",
          ];
    result.steps = lesson.facts.slice(0, extended ? 4 : 2).map((item) => ({
      text: item.text,
      explanation: detailed ? item.explanation : ["", ""],
    }));
    result.questions = lesson.questions
      .slice(extended ? 2 : 0, extended ? 4 : 1)
      .map((item) => ({
        prompt: item.prompt,
        explanations: detailed
          ? [item.answer, item.explanation]
          : [item.answer],
      }));
  }
  if (options.type === "practice" || options.type === "quiz") {
    result.questions = lesson.questions
      .slice(0, options.type === "quiz" ? (extended ? 4 : 2) : extended ? 3 : 1)
      .map((item) => ({
        prompt: item.prompt,
        explanations: detailed
          ? [item.answer, item.explanation]
          : [item.answer],
      }));
    if (options.type === "quiz")
      result.intro = [
        "Fixed question preview. Open quiz to configure an attempt; this preview does not set its count or difficulty.",
        "معاينة ثابتة للأسئلة. افتح الاختبار لضبط المحاولة؛ لا تحدد هذه المعاينة عدد أسئلتها أو صعوبتها.",
      ];
  }
  if (options.type === "flashcards") {
    const front: StudioFixtureText[] = [
      options.topic === "sequence"
        ? [
            "Which roots does an upper trunk injury damage?",
            "ما الجذور التي تتأثر عند إصابة الجذع العلوي؟",
          ]
        : [
            "What do your sources say about the roots of the plexus?",
            "ماذا تقول مصادرك عن جذور الضفيرة؟",
          ],
    ];
    const back: StudioFixtureText[] = [
      options.topic === "sequence"
        ? ["C5 and C6: Erb's palsy.", "الجذران C5 وC6: شلل إرب."]
        : [
            "The handout lists C5 to T1; the recording adds a possible C4 branch.",
            "تذكر الملزمة C5 إلى T1، ويضيف التسجيل فرعًا محتملًا من C4.",
          ],
    ];
    if (detailed) back.push(lesson.facts[0]!.explanation);
    if (extended) {
      front.push([
        "Also name one evidence check and one unanswered detail.",
        "اذكر أيضًا فحصًا واحدًا للأدلة وتفصيلًا واحدًا لم تجب عنه المصادر.",
      ]);
      back.push(lesson.facts[1]!.text, lesson.facts[3]!.text);
      if (detailed) back.push(lesson.facts[3]!.explanation);
    }
    result.card = { front, back };
  }
  return result;
}
export function studioFixtureSegments(
  text: StudioFixtureText,
  language: StudioFixtureOptions["language"],
) {
  return language === "mixed"
    ? [
        { language: "ar" as const, text: text[1] },
        { language: "en" as const, text: text[0] },
      ]
    : [{ language, text: text[language === "en" ? 0 : 1] }];
}
export function studioFixtureManifest() {
  return {
    version: "studio-examples-1",
    types: studioFixtureTypes,
    topics: ["sequence", "comparison"],
    depths: ["concise", "detailed"],
    sizes: ["short", "extended"],
    languages: ["en", "ar", "mixed"],
    combinations: 144,
    singleFlashcard: true,
    quizPreviewOnly: true,
    note: "Fixed invented examples for every exposed setting. The roots topic compares two supplied statements and their evidence limits. No model generation, retrieval or quality claim.",
  };
}
