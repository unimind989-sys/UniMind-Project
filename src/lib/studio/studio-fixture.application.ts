// Fixed invented teaching examples. No source loading, retrieval or provider.
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
const sequence = {
  intro: [
    "Follow the handout's two-step instruction and check it against the recording.",
    "اتبع تعليمات الملزمة ذات الخطوتين ثم تحقق منها بمقارنتها بالتسجيل.",
  ] as const,
  facts: [
    {
      text: [
        "Identify the labelled structures before comparing the diagrams.",
        "حدد الأجزاء المسماة قبل مقارنة الرسمين.",
      ],
      explanation: [
        "The handout explicitly places identification first. This describes its instruction, not a verified diagram interpretation.",
        "تضع الملزمة التحديد أولًا صراحة. يصف ذلك تعليماتها، ولا يقدم تفسيرًا موثقًا للرسم.",
      ],
    },
    {
      text: [
        "The recording places comparison before identification; the sources disagree on order.",
        "يضع التسجيل المقارنة قبل التحديد؛ يختلف المصدران في الترتيب.",
      ],
      explanation: [
        "Keep both instructions attributed to their sources. Neither sample passage explains which order should override the other.",
        "انسب كل تعليمات إلى مصدرها. لا يوضح أي نص تجريبي لماذا يجب تقديم ترتيب أحدهما على الآخر.",
      ],
    },
    {
      text: [
        "No duration is supplied for either step.",
        "لا توجد مدة محددة لأي من الخطوتين.",
      ],
      explanation: [
        "An extended study plan can flag that missing detail, but it cannot turn an invented duration into a source-backed instruction.",
        "يمكن لخطة مراجعة موسعة إبراز هذا النقص، لكن لا يمكنها تحويل مدة مصطنعة إلى تعليمات مدعومة بالمصدر.",
      ],
    },
    {
      text: [
        "Separate the handout's instruction, the recording's instruction and your unanswered questions.",
        "افصل تعليمات الملزمة عن تعليمات التسجيل وعن أسئلتك التي لم تجد إجابة.",
      ],
      explanation: [
        "This review structure makes the conflict visible and leaves unsupported details open for later approved material.",
        "يظهر هذا التنظيم التعارض ويترك التفاصيل غير المدعومة مفتوحة لمواد معتمدة لاحقًا.",
      ],
    },
  ] as readonly Item[],
  steps: [
    {
      text: ["Read the sample labels.", "اقرأ أسماء المثال."],
      explanation: [
        "Use only labels actually supplied. The sample passage does not establish a list of specific labels.",
        "استخدم الأسماء الواردة فقط. لا يثبت النص التجريبي قائمة بأسماء محددة.",
      ],
    },
    {
      text: [
        "Explain the comparison using the source.",
        "اشرح المقارنة بالمصدر.",
      ],
      explanation: [
        "Follow the handout's stated order when describing the handout. Attribute the different recording order separately.",
        "اتبع ترتيب الملزمة المعلن عند وصفها. وانسب الترتيب المختلف في التسجيل إليه بصورة منفصلة.",
      ],
    },
    {
      text: [
        "Write the two source orders side by side.",
        "اكتب ترتيب المصدرين بجوار بعضهما.",
      ],
      explanation: [
        "Handout: identify then compare. Recording: compare then identify. Do not merge them into one agreed sequence.",
        "الملزمة: تحديد ثم مقارنة. التسجيل: مقارنة ثم تحديد. لا تدمجهما في ترتيب واحد متفق عليه.",
      ],
    },
    {
      text: [
        "End with the unanswered timing question.",
        "اختم بسؤال المدة الذي لم تجب عنه المصادر.",
      ],
      explanation: [
        "Record that neither source supplies timing, rather than suggesting a schedule as if it came from the material.",
        "سجل أن المصدرين لا يقدمان مدة، بدلًا من اقتراح جدول وكأنه مستخرج من المواد.",
      ],
    },
  ] as readonly Item[],
  questions: [
    {
      prompt: [
        "Question: Which step comes first in the sample handout?",
        "سؤال: ما الخطوة الأولى في الملزمة التجريبية؟",
      ],
      answer: [
        "Identification comes first in the sample handout (page 14).",
        "التحديد أولًا في الملزمة التجريبية (صفحة ١٤).",
      ],
      explanation: [
        "The answer identifies one source's instruction. It does not claim that the recording agrees.",
        "تحدد الإجابة تعليمات مصدر واحد. ولا تدعي أن التسجيل يتفق معها.",
      ],
    },
    {
      prompt: [
        "Question: What follows identification in the handout?",
        "سؤال: ما الذي يأتي بعد التحديد في الملزمة؟",
      ],
      answer: [
        "The handout asks for comparison of the labelled diagrams next.",
        "تطلب الملزمة بعد ذلك مقارنة الرسوم المسماة.",
      ],
      explanation: [
        "This is the handout's second step, not evidence of any specific similarity or difference.",
        "هذه هي الخطوة الثانية في الملزمة، وليست دليلًا على تشابه أو اختلاف بعينه.",
      ],
    },
    {
      prompt: [
        "Question: How should you record the opposite order in the recording?",
        "سؤال: كيف تسجل الترتيب العكسي الوارد في التسجيل؟",
      ],
      answer: [
        "Mark an unresolved conflict: the recording puts comparison first.",
        "سجل تعارضًا غير محسوم: يقدم التسجيل المقارنة أولًا.",
      ],
      explanation: [
        "Preserving attribution prevents either passage from silently overriding the other.",
        "يمنع الحفاظ على نسبة الكلام إلى مصدره تقديم أحد النصين على الآخر دون توضيح.",
      ],
    },
    {
      prompt: [
        "Question: How many minutes should the first step take?",
        "سؤال: كم دقيقة يجب أن تستغرق الخطوة الأولى؟",
      ],
      answer: [
        "The sample materials do not supply a duration.",
        "لا تقدم المواد التجريبية مدة محددة.",
      ],
      explanation: [
        "The correct evidence-limited answer is unavailable timing, not a guessed number.",
        "الإجابة المنضبطة بحدود الأدلة هي عدم توافر المدة، وليست رقمًا مخمنًا.",
      ],
    },
  ] as readonly Question[],
};
const comparison = {
  intro: [
    "Compare the two sample instructions and the limits of their evidence; no actual diagram differences are established.",
    "قارن تعليمات المصدرين التجريبيين وحدود أدلتهما؛ لا تثبت هذه الأمثلة فروقًا فعلية بين الرسوم.",
  ] as const,
  facts: [
    {
      text: [
        "The handout asks for identification before comparison; the recording asks for comparison first.",
        "تطلب الملزمة التحديد قبل المقارنة، بينما يطلب التسجيل المقارنة أولًا.",
      ],
      explanation: [
        "These are two different instructions. Compare their wording and attribution rather than declaring one correct.",
        "هذه تعليمات مختلفة. قارن صياغتها ونسبتها إلى مصدرها بدلًا من إعلان صحة أحد الترتيبين.",
      ],
    },
    {
      text: [
        "The passages do not name the diagrams' actual labels or list their visual differences.",
        "لا تسمي النصوص الأسماء الفعلية في الرسوم ولا تسرد الفروق البصرية بينها.",
      ],
      explanation: [
        "A comparison should leave those fields unspecified. The fixed example cannot supply facts absent from both sources.",
        "يجب أن تترك المقارنة هذه الخانات غير محددة. لا يستطيع المثال الثابت تقديم حقائق غائبة عن المصدرين.",
      ],
    },
    {
      text: [
        "Keep claims about labels separate from claims about the order of study.",
        "افصل الادعاءات المتعلقة بالأسماء عن الادعاءات المتعلقة بترتيب الدراسة.",
      ],
      explanation: [
        "The instruction to identify labels does not itself establish what those labels are.",
        "لا تثبت تعليمات تحديد الأسماء ماهية هذه الأسماء في حد ذاتها.",
      ],
    },
    {
      text: [
        "Record which comparison questions still need another approved passage.",
        "سجل أسئلة المقارنة التي لا تزال تحتاج إلى نص معتمد آخر.",
      ],
      explanation: [
        "Neither unstated visual differences nor missing timing can be resolved from these two excerpts.",
        "لا يمكن حسم الفروق البصرية غير المذكورة أو المدة الناقصة من هذين المقتطفين.",
      ],
    },
  ] as readonly Item[],
  steps: [
    {
      text: [
        "Create separate notes for the handout and recording.",
        "أنشئ ملاحظات منفصلة للملزمة والتسجيل.",
      ],
      explanation: [
        "Write each source's stated instruction with its own locator, rather than combining the opposite orders.",
        "اكتب تعليمات كل مصدر مع مرجعه الخاص، بدلًا من دمج الترتيبين المتعارضين.",
      ],
    },
    {
      text: [
        "Mark the disagreement and the unprovided diagram details.",
        "حدد موضع الخلاف وتفاصيل الرسوم التي لم ترد في النصوص.",
      ],
      explanation: [
        "The order differs. The actual labels and diagram differences are not supplied.",
        "يختلف الترتيب. ولا ترد الأسماء الفعلية أو الفروق بين الرسوم.",
      ],
    },
    {
      text: [
        "Check whether each proposed comparison claim has explicit evidence.",
        "تحقق من وجود دليل صريح لكل ادعاء تقترحه في المقارنة.",
      ],
      explanation: [
        "If no supplied excerpt states it, leave it as a question instead of adding outside knowledge.",
        "إذا لم يذكره مقتطف وارد، فاتركه سؤالًا بدلًا من إضافة معرفة خارجية.",
      ],
    },
    {
      text: [
        "List the extra approved material needed to finish the comparison.",
        "اسرد المواد المعتمدة الإضافية اللازمة لاستكمال المقارنة.",
      ],
      explanation: [
        "Ask for the diagram labels or a passage describing differences; do not pretend those details are already available.",
        "اطلب أسماء الرسوم أو نصًا يصف الفروق، ولا توحِ بأن هذه التفاصيل متاحة بالفعل.",
      ],
    },
  ] as readonly Item[],
  questions: [
    {
      prompt: [
        "Question: Which labels can you compare from these sample passages?",
        "سؤال: ما الأسماء التي يمكنك مقارنتها من هذه النصوص التجريبية؟",
      ],
      answer: [
        "No specific label identities are supplied; do not invent a list.",
        "لا ترد أسماء محددة؛ فلا تنشئ قائمة من عندك.",
      ],
      explanation: [
        "The handout mentions labelled diagrams, but that instruction is not a description of their labels.",
        "تذكر الملزمة رسومًا مسماة، لكن هذه التعليمات لا تصف الأسماء الموجودة فيها.",
      ],
    },
    {
      prompt: [
        "Question: What disagreement should your comparison notes show?",
        "سؤال: ما الخلاف الذي يجب أن تظهره ملاحظات المقارنة؟",
      ],
      answer: [
        "The handout identifies first; the recording compares first.",
        "تبدأ الملزمة بالتحديد، ويبدأ التسجيل بالمقارنة.",
      ],
      explanation: [
        "Attribute each order to its source and retain the conflict without deciding between them.",
        "انسب كل ترتيب إلى مصدره واحتفظ بالتعارض دون ترجيح أحدهما.",
      ],
    },
    {
      prompt: [
        "Question: Can the recording prove a specific visual difference between the diagrams?",
        "سؤال: هل يثبت التسجيل فرقًا بصريًا محددًا بين الرسمين؟",
      ],
      answer: [
        "No such difference is stated in the sample recording.",
        "لا يذكر التسجيل التجريبي فرقًا من هذا النوع.",
      ],
      explanation: [
        "Its instruction concerns comparison order. A specific difference needs its own approved evidence.",
        "تتعلق تعليماته بترتيب المقارنة. ويحتاج الفرق المحدد إلى دليل معتمد خاص به.",
      ],
    },
    {
      prompt: [
        "Question: What would support a new claim about a diagram label?",
        "سؤال: ما الذي يدعم ادعاءً جديدًا عن اسم في أحد الرسوم؟",
      ],
      answer: [
        "An approved passage that explicitly names it with a usable reference.",
        "نص معتمد يسميه صراحة مع مرجع يمكن فحصه.",
      ],
      explanation: [
        "A general request to compare diagrams cannot substitute for evidence of a particular label.",
        "لا يحل طلب عام لمقارنة الرسوم محل الدليل على اسم بعينه.",
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
            "Revision checklist: evidence, attribution and unanswered comparison claims.",
            "قائمة مراجعة: الأدلة ونسبة الكلام إلى مصادره وادعاءات المقارنة غير المجابة.",
          ]
        : [
            "Revision checklist: the two instructions, their disagreement and missing timing.",
            "قائمة مراجعة: التعليمات والتعارض بينها والمدة غير المتاحة.",
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
            "What sequence does the sample handout use?",
            "ما ترتيب الملزمة التجريبية؟",
          ]
        : [
            "What can these sources establish about the diagrams' labels?",
            "ما الذي تثبته هذه المصادر عن الأسماء الموجودة في الرسوم؟",
          ],
    ];
    const back: StudioFixtureText[] = [
      options.topic === "sequence"
        ? [
            "Identify labels, then compare diagrams.",
            "إصابة الجذع العلوي (C5 وC6) تسبب شلل إرب-دوشين، غالبًا من المباعدة الشديدة بين الرأس والكتف. تتكون الضفيرة من الفروع الأمامية للأعصاب من C5 إلى T1.",
          ]
        : [
            "They request comparison but do not supply specific label identities.",
            "تطلب المصادر المقارنة لكنها لا تقدم أسماء محددة.",
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
    note: "Fixed invented examples for every exposed setting. Comparison examines supplied instructions and evidence limits, not undisclosed actual diagram facts. No model generation, retrieval or quality claim.",
  };
}
