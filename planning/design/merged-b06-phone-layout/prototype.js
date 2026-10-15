const parameters = new URLSearchParams(location.search);
const pick = (lang, en, ar) => (lang === "ar" ? ar : en);
const icon = (name) => {
  const paths = {
    chat: "M4 4h16v12H9l-5 4V4",
    sources: "M6 3h12v18H6z M9 7h6 M9 11h6 M9 15h4",
    quiz: "M7 5H4v16h16V5h-3 M8 3h8v5H8z M8 13l2 2 5-5",
    shelf: "M3 5h8v15H3z M13 5h8v15h-8z",
    studio: "M6 3h12v18H6z M9 7h6 M9 11h6 M9 15h6",
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] ?? paths.sources}"/></svg>`;
};
const escapeText = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );

async function runFrame() {
  const fixtures = await fetch("fixtures.json").then((response) => {
    if (!response.ok) throw new Error("Fixture unavailable");
    return response.json();
  });
  let lang = parameters.get("lang") === "ar" ? "ar" : "en";
  let tool = ["chat", "studio", "quiz", "materials"].includes(
    parameters.get("tool"),
  )
    ? parameters.get("tool")
    : "chat";
  const theme = parameters.get("theme") === "dark" ? "dark" : "light";
  const large = parameters.get("large") === "1";
  const long = parameters.get("long") !== "0";
  const timing = ["timed", "low", "untimed"].includes(parameters.get("time"))
    ? parameters.get("time")
    : "timed";
  let format = 0;
  const answers = new Map([
    [1, "identify"],
    [2, "identify"],
  ]);
  let messageDraft = "";
  let currentUnit = "anatomy";
  let keyboardNavigation = false;
  document.addEventListener(
    "pointerdown",
    () => {
      keyboardNavigation = false;
    },
    true,
  );
  document.addEventListener(
    "keydown",
    () => {
      keyboardNavigation = true;
    },
    true,
  );
  let outputLanguage = lang;
  const before = await fetch("before-measurements.json").then((response) =>
    response.json(),
  );
  const disclosure = () =>
    before.measurements.find((m) => m.lang === lang).simulationDisclosure;
  const t = (en, ar) => pick(lang, en, ar);
  const labels = () => ({
    chat: t("Chat", "المحادثة"),
    studio: t("Studio", "الاستوديو"),
    quiz: t("Quiz", "الاختبار"),
    materials: t("Materials", "المواد"),
  });
  function numbers(value) {
    return new Intl.NumberFormat(lang).format(value);
  }
  function notify(text) {
    document.querySelector("#sample-notice").textContent = text;
  }
  function title() {
    return currentUnit === "anatomy"
      ? t(fixtures.scope.unitTitleEn, fixtures.scope.unitTitleAr)
      : t("Biochemistry", "الكيمياء الحيوية");
  }
  function exchange() {
    const answer =
      outputLanguage === "mixed"
        ? `<bdi lang="ar">${escapeText(fixtures.answer[1])}</bdi><br><bdi lang="en">${escapeText(fixtures.answer[0])}</bdi>`
        : escapeText(fixtures.answer[outputLanguage === "ar" ? 1 : 0]);
    return `<section class="exchange"><p class="question">${escapeText(fixtures.prompt[lang === "ar" ? 1 : 0])}</p><p class="supported">${t("Supported · fixed sample", "مدعوم · مثال ثابت")}</p><p lang="${outputLanguage === "mixed" ? lang : outputLanguage}" dir="${outputLanguage === "ar" ? "rtl" : "ltr"}">${answer}</p><button type="button" class="citation" data-evidence>${t("Handout · p. 3", "الملزمة · ص ٣")}</button></section>`;
  }
  function reader() {
    if (currentUnit !== "anatomy")
      return `<h2>${title()}</h2><p>${t("This layout preview has no sample work for this unit. Switch back to Anatomy to inspect the reading layout.", "لا يحتوي مثال التصميم على عمل تجريبي لهذه المادة. عد إلى التشريح لفحص تصميم القراءة.")}</p>`;
    if (tool === "chat")
      return `<h2 class="chat-title">${t("Conversation", "المحادثة الحالية")}</h2>${Array.from({ length: long ? 3 : 1 }, (_, n) => exchange(n)).join("")}<p class="notice">${t("End of the sample conversation.", "نهاية المحادثة التجريبية.")}</p>`;
    if (tool === "studio") {
      const names = [
        ["Structured summary", "ملخص منظم"],
        ["Study guide", "دليل مذاكرة"],
        ["Practice questions", "أسئلة تدريبية"],
        ["Flashcards", "بطاقات مراجعة"],
        ["Revision pack", "حزمة مراجعة"],
        ["Multiple-choice questions", "أسئلة اختيار متعدد"],
      ];
      return `<h2>${t(...names[format])}</h2><p class="notice">${t("Fixed sample from the same unit material.", "مثال ثابت من مواد الوحدة نفسها.")}</p>${Array.from({ length: long ? 8 : 2 }, (_, n) => `<section><h3>${t("Study sequence", "ترتيب المذاكرة")} ${numbers(n + 1)}</h3><p>${escapeText(fixtures.answer[lang === "ar" ? 1 : 0])}</p></section>`).join("")}<button class="citation" data-evidence>${t("View supporting material", "عرض المادة الداعمة")}</button>`;
    }
    if (tool === "quiz") {
      const question = t(
        "Which study sequence does the sample handout describe?",
        "ما ترتيب الدراسة الذي تصفه الملزمة التجريبية؟",
      );
      return `<div class="timer-bar" id="timer-bar" data-low="${timing === "low"}"><span>${timing === "untimed" ? t("Untimed", "بدون وقت") : t("Time remaining", "الوقت المتبقي")}${timing === "untimed" ? "" : ` <strong><bdi>${timing === "low" ? "00:45" : "08:42"}</bdi></strong>`}</span><span id="answer-progress">${numbers(answers.size)} ${t("of", "من")} ${numbers(6)} ${t("answered", "إجابات")}</span>${timing === "low" ? `<span>${t("Less than one minute remains.", "متبقي أقل من دقيقة.")}</span>` : ""}</div><h2>${t("Quiz attempt", "محاولة الاختبار")}</h2>${Array.from(
        { length: 6 },
        (_, n) =>
          `<fieldset class="quiz-question"><legend>${numbers(n + 1)}. ${question}</legend>${[
            [
              "identify",
              t(
                "Identify the labelled structures, then compare diagrams.",
                "حدد الأجزاء المسماة ثم قارن الرسمين.",
              ),
            ],
            [
              "compare",
              t(
                "Compare diagrams, then identify the structures.",
                "قارن الرسمين ثم حدد الأجزاء.",
              ),
            ],
            [
              "timing",
              t(
                "Follow a specified time for each step.",
                "اتبع وقتًا محددًا لكل خطوة.",
              ),
            ],
          ]
            .map(
              ([value, text]) =>
                `<label><input type="radio" name="question-${n + 1}" value="${value}" ${answers.get(n + 1) === value ? "checked" : ""} />${text}</label>`,
            )
            .join("")}</fieldset>`,
      ).join(
        "",
      )}<button class="primary" id="sample-review">${t("Review sample answers", "مراجعة الإجابات التجريبية")}</button><p class="notice">${t("This layout example does not submit or score an attempt.", "هذا المثال للتصميم ولا يرسل محاولة أو يحسب درجة.")}</p>`;
    }
    return `<h2>${t("Unit materials", "مواد الوحدة")}</h2><p>${t("The same authorized unit material supports Chat, Studio and Quiz.", "مواد الوحدة المصرح بها نفسها تدعم المحادثة والاستوديو والاختبار.")}</p><h3>${t("Synthetic Anatomy handout", "ملزمة التشريح التجريبية")}</h3><p>${escapeText(fixtures.answer[lang === "ar" ? 1 : 0])}</p><button class="citation" data-evidence>${t("View supporting material", "عرض المادة الداعمة")}</button>`;
  }
  function render() {
    const h = document.documentElement;
    h.lang = lang;
    h.dir = lang === "ar" ? "rtl" : "ltr";
    h.dataset.theme = theme;
    h.dataset.large = String(large);
    document.querySelector('meta[name="theme-color"]').content =
      theme === "dark" ? "#1b1c1f" : "#f6f7f8";
    const scope = fixtures.scope;
    const l = labels();
    document.querySelector("#app").innerHTML =
      `<a class="skip" href="#reader">${t("Skip to study content", "انتقل إلى محتوى المذاكرة")}</a><div class="app"><aside class="rail"><img src="assets/logo.svg" width="944" height="256" alt="UniMind" dir="ltr" /><nav class="global-nav" aria-label="${t("Main navigation", "التنقل الرئيسي")}"><button type="button" aria-current="page" data-global="study">${icon("shelf")}<span>${t("Study", "المذاكرة")}</span></button><button type="button" data-global="subjects">${icon("sources")}<span>${t("Subjects", "المواد")}</span></button><button type="button" data-global="profile"><span class="profile-initial">S</span><span><bdi>Samir Hassan</bdi></span></button></nav></aside><div class="stage"><div class="utility"><img class="mobile-brand" src="assets/symbol.svg" width="32" height="32" alt="UniMind" dir="ltr" /><span class="desktop-location">${title()} · ${t("Study", "المذاكرة")}</span><div class="language" role="group" aria-label="${t("Interface language", "لغة الواجهة")}"><button data-language="en" aria-pressed="${lang === "en"}">English</button><button data-language="ar" aria-pressed="${lang === "ar"}">العربية</button></div></div><div class="simulation">${escapeText(disclosure())}</div><header class="course-header"><div><h1>${title()}</h1><p class="context-caption">${t(scope.programNameEn, scope.programNameAr)} · ${t(scope.levelNameEn, scope.levelNameAr)} · ${t(scope.termNameEn, scope.termNameAr)}</p></div><details class="context" id="course-context"><summary>${t("Course details", "تفاصيل المادة")}</summary><div class="context-panel"><dl><dt>${t("Institution", "الجامعة أو النظام")}</dt><dd>${escapeText(t(fixtures.institution.nameEn, fixtures.institution.nameAr))}</dd><dt>${t("Program", "البرنامج")}</dt><dd>${escapeText(t(scope.programNameEn, scope.programNameAr))}</dd><dt>${t("Period", "الفترة الدراسية")}</dt><dd>${escapeText(t(scope.levelNameEn, scope.levelNameAr))} · ${escapeText(t(scope.termNameEn, scope.termNameAr))}</dd></dl><div class="unit-picker"><label for="unit-choice">${t("Switch unit", "تغيير الوحدة")}</label><select id="unit-choice"><option value="anatomy" ${currentUnit === "anatomy" ? "selected" : ""}>${t(scope.unitTitleEn, scope.unitTitleAr)}</option><option value="biochemistry" disabled>${t("Biochemistry", "الكيمياء الحيوية")}</option></select><p class="notice">${t("Display example only; opening a different unit uses its own work in UniMind.", "مثال للعرض فقط؛ كل مادة في UniMind لها عملها المنفصل.")}</p></div></div></details></header><nav class="tool-nav" aria-label="${t("Workspace navigation", "تنقل مساحة المذاكرة")}">${Object.entries(
        l,
      )
        .sort(
          ([a], [b]) =>
            ["materials", "chat", "studio", "quiz"].indexOf(a) -
            ["materials", "chat", "studio", "quiz"].indexOf(b),
        )
        .map(
          ([key, text]) =>
            `<button data-tool="${key}" aria-current="${key === tool ? "page" : "false"}">${icon(key)}<span>${text}</span></button>`,
        )
        .join("")}</nav><div class="workspace">${
        tool === "chat"
          ? `<div class="tool-options"><details><summary>${t("Sessions", "الجلسات")}</summary><div>${t("Sample conversation", "محادثة تجريبية")}<p>${t("History stays in its current unit.", "السجل يبقى داخل مادته الحالية.")}</p></div></details><details><summary>${t("Study options", "خيارات المذاكرة")}</summary><div><label for="output-language">${t("Study language", "لغة المذاكرة")}</label><select id="output-language"><option value="en" ${outputLanguage === "en" ? "selected" : ""}>English</option><option value="ar" ${outputLanguage === "ar" ? "selected" : ""}>العربية</option><option value="mixed" ${outputLanguage === "mixed" ? "selected" : ""}>${t("Mixed Arabic and English", "عربي وإنجليزي مختلط")}</option></select></div></details></div>`
          : tool === "studio"
            ? `<div class="tool-options"><details><summary>${t("Output format", "شكل المخرج")}</summary><div class="format-options">${[
                ["Summary", "ملخص"],
                ["Study guide", "دليل مذاكرة"],
                ["Practice questions", "أسئلة تدريبية"],
                ["Flashcards", "بطاقات"],
                ["Revision pack", "حزمة مراجعة"],
                ["MCQs", "اختيار متعدد"],
              ]
                .map(
                  (pair, n) =>
                    `<button data-format="${n}" aria-pressed="${format === n}" ${n === 0 ? "" : "disabled"}>${t(...pair)}</button>`,
                )
                .join(
                  "",
                )}</div><p class="notice">${t("This preview shows one summary. All six formats remain in UniMind.", "يعرض هذا المثال ملخصًا واحدًا. الأنواع الستة تبقى في UniMind.")}</p></details></div>`
            : ""
      }<main class="reader" id="reader" tabindex="0" aria-label="${t("Study reading area", "منطقة قراءة المذاكرة")}">${reader()}<p class="notice" id="sample-notice" role="status"></p></main>${tool === "chat" ? `<form class="composer"><label for="message">${t("Message", "السؤال")}</label><textarea id="message" name="message" autocomplete="off" placeholder="${t("Ask about the sample material…", "اسأل عن المادة التجريبية…")}">${escapeText(messageDraft)}</textarea><button class="primary" type="submit">${t("Send", "إرسال")}</button></form>` : ""}</div></div></div><dialog id="support-dialog" aria-labelledby="support-title"><h2 id="support-title">${t("Supporting material", "المادة الداعمة")}</h2><p>${t("Synthetic Anatomy handout · p. 3", "ملزمة التشريح التجريبية · ص ٣")}</p><p>${escapeText(fixtures.answer[lang === "ar" ? 1 : 0])}</p><form method="dialog"><button>${t("Return to reading", "العودة إلى القراءة")}</button></form></dialog>`;
    wire();
    document.fonts.ready.then(() =>
      parent.postMessage(
        {
          type: "prototype-state",
          tool,
          lang,
          matched: long && outputLanguage === lang && currentUnit === "anatomy",
        },
        location.origin,
      ),
    );
  }
  function wire() {
    document
      .querySelector("#output-language")
      ?.addEventListener("change", (event) => {
        messageDraft =
          document.querySelector("#message")?.value ?? messageDraft;
        outputLanguage = event.target.value;
        render();
        document.querySelector(".tool-options details:nth-child(2)").open =
          true;
        document.querySelector("#output-language").focus();
      });
    document
      .querySelectorAll(".quiz-question input")
      .forEach((input) =>
        input.addEventListener(
          "focus",
          () =>
            keyboardNavigation &&
            input.closest("label").scrollIntoView({ block: "center" }),
        ),
      );
    document.querySelectorAll("[data-tool]").forEach((button) =>
      button.addEventListener("click", () => {
        messageDraft =
          document.querySelector("#message")?.value ?? messageDraft;
        tool = button.dataset.tool;
        render();
        document
          .querySelector(`[data-tool="${tool}"]`)
          .focus({ preventScroll: true });
      }),
    );
    document.querySelectorAll("[data-language]").forEach((button) =>
      button.addEventListener("click", () => {
        messageDraft =
          document.querySelector("#message")?.value ?? messageDraft;
        lang = button.dataset.language;
        render();
        document
          .querySelector(`[data-language="${lang}"]`)
          .focus({ preventScroll: true });
      }),
    );
    document.querySelectorAll("[data-format]").forEach((button) =>
      button.addEventListener("click", () => {
        format = Number(button.dataset.format);
        render();
        document
          .querySelector(".tool-options summary")
          .focus({ preventScroll: true });
      }),
    );
    document
      .querySelectorAll("[data-global]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          notify(
            t(
              "Global navigation remains available. Its destination is outside this layout preview.",
              "التنقل الرئيسي متاح. وجهته خارج هذا المثال للتصميم.",
            ),
          ),
        ),
      );
    document
      .querySelector("#unit-choice")
      .addEventListener("change", (event) => {
        currentUnit = event.target.value;
        messageDraft = "";
        render();
      });
    document
      .querySelectorAll("[data-evidence]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          document.querySelector("#support-dialog").showModal(),
        ),
      );
    document.querySelector(".composer")?.addEventListener("submit", (event) => {
      event.preventDefault();
      messageDraft = document.querySelector("#message").value;
      notify(
        t(
          "Fixed layout sample; no answer was generated.",
          "مثال ثابت للتصميم؛ لم يتم إنشاء إجابة.",
        ),
      );
    });
    document.querySelectorAll(".quiz-question input").forEach((input) =>
      input.addEventListener("change", () => {
        answers.set(Number(input.name.split("-")[1]), input.value);
        document.querySelector("#answer-progress").textContent =
          `${numbers(answers.size)} ${t("of", "من")} ${numbers(6)} ${t("answered", "إجابات")}`;
      }),
    );
    document
      .querySelector("#sample-review")
      ?.addEventListener("click", () =>
        notify(
          t(
            "Sample review position reached. No attempt was submitted or scored.",
            "وصلت إلى موضع المراجعة التجريبية. لم ترسل محاولة ولم تحسب درجة.",
          ),
        ),
      );
    document.addEventListener("keydown", closeDisclosures, { once: true });
  }
  function closeDisclosures(event) {
    if (event.key === "Escape")
      for (const detail of document.querySelectorAll("details[open]")) {
        detail.open = false;
        detail.querySelector("summary").focus();
      }
    document.addEventListener("keydown", closeDisclosures, { once: true });
  }
  render();
}

async function runReview() {
  const current = await fetch("before-measurements.json").then((response) =>
    response.json(),
  );
  const controls = [
    "tool",
    "size",
    "language",
    "theme",
    "large",
    "long",
    "time",
  ];
  const frame = document.querySelector("#prototype"),
    image = document.querySelector("#current-capture");
  function refresh() {
    const values = Object.fromEntries(
      controls.map((key) => {
        const input = document.querySelector("#review-" + key);
        return [key, input.type === "checkbox" ? input.checked : input.value];
      }),
    );
    const [width, height] = values.size.split(",").map(Number);
    let version = document.querySelector('[name="version"]:checked').value;
    const available = values.tool === "chat" && !values.large;
    if (version === "current" && !available) {
      document.querySelector('[value="proposed"]').checked = true;
      version = "proposed";
      document.querySelector("#review-status").textContent =
        "The current website captures cover Chat at normal text size. Showing the proposed layout.";
    } else document.querySelector("#review-status").textContent = "";
    image.hidden = version !== "current";
    frame.hidden = version === "current";
    for (const element of [frame, image]) {
      element.style.width = width + "px";
      element.style.height = height + "px";
    }
    frame.src =
      "frame.html?" +
      new URLSearchParams({
        tool: values.tool,
        lang: values.language,
        theme: values.theme,
        large: values.large ? "1" : "0",
        long: values.long ? "1" : "0",
        time: values.time,
      });
    const baseline = current.measurements.find(
      (m) =>
        m.lang === values.language &&
        m.theme === values.theme &&
        m.width === width,
    );
    if (baseline) image.src = "before-shots/" + baseline.file;
    else if (version === "current") {
      document.querySelector('[value="proposed"]').checked = true;
      image.hidden = true;
      frame.hidden = false;
      document.querySelector("#review-status").textContent =
        "This capture is unavailable. Showing the proposed layout.";
    }
    document.querySelector("#preview-label").textContent =
      `${image.hidden ? "Proposed layout" : "Current website capture"} · ${width} × ${height}`;
    document.querySelector("#measurement").textContent =
      baseline && values.tool === "chat" && !values.large
        ? `Current visible reading area: ${baseline.readingVisibleHeight}px. Proposed measurement appears after the preview loads.`
        : "Compare the layout and reachability. No matched current measurement is available for this state.";
  }
  window.addEventListener("message", (event) => {
    if (
      event.origin !== location.origin ||
      event.source !== frame.contentWindow ||
      event.data?.type !== "prototype-state" ||
      !["chat", "studio", "quiz", "materials"].includes(event.data.tool) ||
      !["en", "ar"].includes(event.data.lang) ||
      frame.hidden
    )
      return;
    document.querySelector("#review-tool").value = event.data.tool;
    document.querySelector("#review-language").value = event.data.lang;
    const [width, height] = document
      .querySelector("#review-size")
      .value.split(",")
      .map(Number);
    const theme = document.querySelector("#review-theme").value;
    const baseline = current.measurements.find(
      (m) =>
        m.lang === event.data.lang && m.theme === theme && m.width === width,
    );
    if (
      event.data.tool !== "chat" ||
      event.data.matched !== true ||
      document.querySelector("#review-large").checked ||
      !baseline
    ) {
      document.querySelector("#measurement").textContent =
        "Proposed layout only. No matched current measurement is available for this state.";
      return;
    }
    image.src = "before-shots/" + baseline.file;
    const documentInside = frame.contentDocument,
      reader = documentInside.querySelector("#reader");
    const r = reader.getBoundingClientRect();
    let top = Math.max(0, r.top),
      bottom = Math.min(height, r.bottom);
    for (
      let element = reader.parentElement;
      element;
      element = element.parentElement
    )
      if (
        ["auto", "scroll", "hidden", "clip"].includes(
          frame.contentWindow.getComputedStyle(element).overflowY,
        )
      ) {
        const b = element.getBoundingClientRect();
        top = Math.max(top, b.top);
        bottom = Math.min(bottom, b.bottom);
      }
    const nav = documentInside.querySelector(".global-nav");
    if (frame.contentWindow.getComputedStyle(nav).position === "fixed")
      bottom = Math.min(bottom, nav.getBoundingClientRect().top);
    const visible = Math.max(0, Math.round(bottom - top));
    document.querySelector("#measurement").textContent =
      `First-viewport reading area: current ${baseline.readingVisibleHeight}px; proposed ${visible}px (${visible - baseline.readingVisibleHeight}px more). Both show the exact same synthetic-service disclosure.`;
  });

  controls.forEach((key) =>
    document
      .querySelector("#review-" + key)
      .addEventListener("change", refresh),
  );
  document
    .querySelectorAll('[name="version"]')
    .forEach((input) => input.addEventListener("change", refresh));
  document
    .querySelector("#export-decision")
    .addEventListener("click", async () => {
      const candidateResponse = await fetch("candidate.json");
      if (!candidateResponse.ok) {
        document.querySelector("#review-status").textContent =
          "The candidate record is unavailable. Give your decision in the chat.";
        return;
      }
      const candidateRecord = await candidateResponse.json();
      const receipt = {
        review: "B06 phone layout prototype",
        actor: "Ahmed",
        decision: document.querySelector("#decision").value,
        notes: document.querySelector("#decision-notes").value,
        recordedAt: new Date().toISOString(),
        scope:
          "Prototype layout direction only; no automatic delivery or full application acceptance",
        candidate: "B06-phone-prototype-v1",
        candidateFingerprint: candidateRecord.fingerprint,
      };
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(receipt, null, 2)], {
          type: "application/json",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "unimind-b06-layout-decision.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  refresh();
}
if (document.querySelector("#app"))
  runFrame().catch(() => {
    document.querySelector("#app").textContent =
      "The layout sample could not load. Reload this local preview.";
  });
else
  runReview().catch(() => {
    document.querySelector("#measurement").textContent =
      "Current captures could not load. Reload this local preview.";
  });
