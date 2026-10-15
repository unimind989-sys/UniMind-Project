const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const T = (en, ar) => (state.lang === "ar" ? ar : en);
const initial = [
  { id: "handout", title: ["Anatomy handout", "ملزمة التشريح"], format: "PDF" },
  {
    id: "recording",
    title: ["Anatomy recording", "تسجيل التشريح"],
    format: "WAV",
  },
  { id: "diagram", title: ["Anatomy diagram", "رسم التشريح"], format: "PNG" },
  {
    id: "comparison",
    title: ["Comparison handout", "ملزمة المقارنة"],
    format: "PDF",
    status: "NEEDS_INFORMATION",
    file: "comparison-handout.pdf",
    description: [
      "Comparison handout; topic not yet identified.",
      "ملزمة مقارنة؛ لم يُحدد الموضوع بعد.",
    ],
    reason: [
      "Add the chapter name to the description. The recorded file stays in place.",
      "أضف اسم الفصل إلى الوصف. يبقى الملف المسجّل كما هو.",
    ],
    correction: "fix",
    receipt: "R-081",
  },
  {
    id: "exam",
    title: ["Practice exam", "امتحان تدريبي"],
    format: "PDF",
    status: "REJECTED",
    file: "practice-exam.pdf",
    description: [
      "Practice exam, earlier file.",
      "امتحان تدريبي، الملف السابق.",
    ],
    reason: [
      "The diagram is unreadable. Replace this file with a clear copy.",
      "الرسم غير مقروء. استبدل الملف بنسخة واضحة.",
    ],
    correction: "replace",
    receipt: "R-082",
  },
  {
    id: "lecture",
    title: ["Supporting lecture", "محاضرة داعمة"],
    format: "WAV",
    status: "PROCESSING",
    file: "supporting-lecture.wav",
    description: ["Supporting lecture recording.", "تسجيل المحاضرة الداعمة."],
    receipt: "R-083",
  },
  {
    id: "reference",
    title: ["Earlier reference diagram", "رسم مرجعي سابق"],
    format: "PNG",
    status: "COMPLETED",
    file: "reference-diagram.png",
    readonly: true,
    description: ["Read-only tracking example.", "مثال متابعة للقراءة فقط."],
    receipt: "R-070",
  },
];
const state = {
  lang: "en",
  theme: "light",
  scenario: "active",
  view: "home",
  campaign: "anatomy",
  selected: null,
  intake: null,
  files: [],
  drafts: {},
  rights: false,
  receipts: new Map(),
  counter: 100,
  announcement: "",
  large: false,
  error: "",
};
function reset() {
  state.receipts = new Map(
    initial
      .filter((r) => r.status)
      .map((r) => [
        r.id,
        {
          status: r.status,
          file: r.file,
          description: r.description,
          receipt: r.receipt,
        },
      ]),
  );
  state.view = "home";
  state.selected = null;
  state.intake = null;
  state.files = [];
  state.drafts = {};
  state.rights = false;
  state.counter = 100;
  state.announcement = "";
  state.error = "";
  render();
}
const title = (r) => r.title[state.lang === "ar" ? 1 : 0];
const current = (r) => state.receipts.get(r.id);
const needs = (r) =>
  !r.readonly &&
  (!current(r) ||
    ["NEEDS_INFORMATION", "REJECTED"].includes(current(r).status));
const permitted = (r) => state.scenario === "active" && needs(r);
const cutoff = () =>
  new Intl.DateTimeFormat(state.lang === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Cairo",
    timeZoneName: "short",
  }).format(new Date("2026-10-10T20:00:00Z"));
const closeDate = () =>
  new Intl.DateTimeFormat(state.lang === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Cairo",
    timeZoneName: "short",
  }).format(new Date("2026-10-12T20:00:00Z"));
const statusText = (s) =>
  ({
    RECEIVED: T("Received", "تم الاستلام"),
    PROCESSING: T("Processing", "قيد المعالجة"),
    NEEDS_INFORMATION: T("Needs information", "يحتاج إلى معلومات"),
    REJECTED: T("Needs a replacement", "يحتاج إلى استبدال"),
    COMPLETED: T("Completed", "مكتمل"),
  })[s] || T("Awaiting file", "بانتظار ملف");
function status(s) {
  return `<span class="status" data-needs-action="${["NEEDS_INFORMATION", "REJECTED"].includes(s)}">${statusText(s)}</span>`;
}
const icon = (kind) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${kind === "home" ? '<path d="M4 5h16v15H4zM8 3v4M16 3v4M8 11h8M8 15h5"/>' : '<path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/>'}</svg>`;
function campaignName() {
  return state.campaign === "anatomy"
    ? T("Anatomy source call", "حملة مصادر التشريح")
    : T("Biochemistry source call", "حملة مصادر الكيمياء الحيوية");
}
function blocked() {
  return state.scenario === "expired"
    ? T(
        "Your upload deadline has passed. You can still inspect the recorded submissions.",
        "انتهى موعدك للرفع. يمكنك الاطلاع على الإرسالات المسجلة.",
      )
    : T(
        "This campaign is closed. You can still inspect the recorded submissions.",
        "هذه الحملة مغلقة. يمكنك الاطلاع على الإرسالات المسجلة.",
      );
}
function deadline() {
  return `<div class="deadline"><span>${T("Your deadline", "موعدك النهائي")}</span><strong>${cutoff()}</strong><details><summary>${T("Assignment and campaign dates", "مواعيد التكليف والحملة")}</summary><p>${T("Assignment expires", "ينتهي التكليف")}: ${cutoff()}</p><p>${T("Campaign closes", "تُغلق الحملة")}: ${closeDate()}</p><p>${T("The earlier date is your upload cutoff. All dates use Cairo time.", "الموعد الأسبق هو آخر وقت متاح لك للرفع. كل المواعيد بتوقيت القاهرة.")}</p></details></div>`;
}
function receipt(r) {
  const c = current(r);
  return `<li data-receipt="${r.id}"><details ${state.selected === r.id ? "open" : ""}><summary><span><strong>${esc(title(r))}</strong><small><bdi>${esc(c.file)}</bdi></small></span>${status(c.status)}</summary><div class="receipt-body"><p>${c.status === "RECEIVED" ? T("Your file and information were received. Processing has not finished; this receipt does not mean students can use the material.", "تم استلام الملف ومعلوماته. لم تنتهِ المعالجة؛ ولا يعني هذا الإيصال أن المادة متاحة للطلاب.") : c.status === "PROCESSING" ? T("The recorded file is being processed. This is not confirmation of student availability.", "الملف المسجل قيد المعالجة. هذا ليس تأكيدًا لإتاحته للطلاب.") : c.status === "COMPLETED" ? T("This tracking example is complete. Student availability still depends on the unit’s release and access rules.", "اكتمل مثال المتابعة هذا. تظل إتاحة المادة للطلاب مرتبطة بالنشر وقواعد الوصول.") : esc(r.reason?.[state.lang === "ar" ? 1 : 0] || "")}</p><dl><dt>${T("Source title", "عنوان المصدر")}</dt><dd>${esc(c.title || title(r))}</dd><dt>${T("Receipt", "الإيصال")}</dt><dd><bdi>${esc(c.receipt)}</bdi></dd><dt>${T("Description", "الوصف")}</dt><dd>${esc(Array.isArray(c.description) ? c.description[state.lang === "ar" ? 1 : 0] : c.description)}</dd><dt>${T("Permission", "الإذن")}</dt><dd>${T("Declared for this sample submission", "مُقرّ به لهذا الإرسال التجريبي")}</dd><dt>${T("Received", "تم الاستلام")}</dt><dd>${T("1 October 2026 · Cairo time", "١ أكتوبر ٢٠٢٦ · بتوقيت القاهرة")}</dd></dl><button class="text-button" data-open-request="${r.id}">${T("Open request", "فتح الطلب")}</button></div></details></li>`;
}
function home() {
  if (state.scenario === "empty")
    return `<header><h1>${T("Source intake", "استلام المصادر")}</h1></header><div class="empty"><h2>${T("No assigned campaigns", "لا توجد حملات مسندة")}</h2><p>${T("An administrator can assign a campaign. Its invitation will bring you to the requested materials.", "يمكن للمسؤول إسناد حملة إليك. ستقودك دعوتها إلى المواد المطلوبة.")}</p></div>`;
  return `<header><h1>${T("Source intake", "استلام المصادر")}</h1><p>${T("Start with the requests that need your action.", "ابدأ بالطلبات التي تحتاج إلى إجراء منك.")}</p></header><section aria-label="${T("Assigned campaigns", "الحملات المسندة")}"><h2>${T("Assigned campaigns", "الحملات المسندة")}</h2><ul class="campaign-list">${["anatomy"].map((id) => `<li><div><h3>${id === "anatomy" ? T("Anatomy source call", "حملة مصادر التشريح") : T("Biochemistry source call", "حملة مصادر الكيمياء الحيوية")}</h3><p>${T("Human Medicine · Year 1 · Term 1", "الطب البشري · السنة الأولى · الفصل الأول")}</p><p class="personal">${T("Your deadline", "موعدك النهائي")}: ${cutoff()}</p><p>${state.scenario === "active" ? (id === "anatomy" ? initial.filter(needs).length : 1) + " " + T("requests need your action", "طلبات تحتاج إلى إجراء منك") : blocked()}</p><details><summary>${T("Campaign closing time", "موعد إغلاق الحملة")}</summary><p>${closeDate()}</p></details></div><button class="primary" data-campaign="${id}">${state.scenario === "active" ? T("Open requests", "فتح الطلبات") : T("Inspect requests", "الاطلاع على الطلبات")}</button></li>`).join("")}</ul></section>`;
}
function requestRow(r) {
  const c = current(r),
    s = c?.status;
  return `<li data-request="${r.id}" data-selected="${state.selected === r.id}"><div><h3>${esc(title(r))}</h3><p>${r.format} · ${statusText(s)}</p>${r.reason && ["NEEDS_INFORMATION", "REJECTED"].includes(s) ? `<p class="reason">${esc(r.reason[state.lang === "ar" ? 1 : 0])}</p>` : ""}</div>${permitted(r) ? `<button class="row-action" data-action="${r.id}">${s === "NEEDS_INFORMATION" ? T("Fix information", "تصحيح المعلومات") : s === "REJECTED" ? T("Replace file", "استبدال الملف") : T("Upload file", "رفع ملف")}</button>` : ""}</li>`;
}
function intake() {
  if (!state.intake) return "";
  const r = initial.find((x) => x.id === state.intake),
    existing = r && current(r),
    correction =
      existing && ["NEEDS_INFORMATION", "REJECTED"].includes(existing.status);
  return (
    '<section class="intake" id="intake" aria-labelledby="intake-heading"><h2 id="intake-heading">' +
    (existing?.status === "NEEDS_INFORMATION"
      ? T("Fix information", "تصحيح المعلومات")
      : existing?.status === "REJECTED"
        ? T("Replace file", "استبدال الملف")
        : T("Upload files", "رفع الملفات")) +
    "</h2>" +
    (r ? "<p>" + esc(title(r)) + "</p>" : "") +
    (correction
      ? '<p class="helper">' +
        T(
          "Select the file for this request and confirm its title, description and permission. The earlier submission stays unchanged.",
          "اختر الملف لهذا الطلب وأكّد عنوانه ووصفه والإذن بإرساله. يبقى الإرسال السابق دون تغيير.",
        ) +
        '</p><p class="helper">' +
        T("Earlier file", "الملف السابق") +
        ": <bdi>" +
        esc(existing.file) +
        "</bdi></p>"
      : "") +
    (state.scenario !== "active"
      ? '<p class="blocked">' + blocked() + "</p>"
      : "") +
    '<form id="upload-form"><label for="files">' +
    T("Choose files", "اختر الملفات") +
    '</label><input type="file" id="files" ' +
    (r ? "" : "multiple") +
    ' accept=".pdf,.wav,.png"><p class="helper">' +
    T(
      "For this review, use “Load sample files” beside the preview. No file is uploaded or byte-validated.",
      "في هذه المراجعة استخدم «تحميل الملفات التجريبية» بجانب المعاينة. لا يُرفع ملف ولا يُتحقق من محتواه.",
    ) +
    "</p>" +
    state.files
      .map((f, i) => {
        const options = initial.filter(
          (x) => x.format === f.format && permitted(x) && !current(x),
        );
        return (
          '<div class="file-row"><h3><bdi>' +
          esc(f.name) +
          "</bdi></h3>" +
          (r
            ? '<p class="helper">' +
              T("Requested material", "المادة المطلوبة") +
              ": <strong>" +
              esc(title(r)) +
              "</strong></p>"
            : '<label for="target-' +
              i +
              '">' +
              T("Requested material", "المادة المطلوبة") +
              '</label><select id="target-' +
              i +
              '" data-target="' +
              i +
              '" required><option value="">' +
              T("Choose the request", "اختر الطلب") +
              "</option>" +
              options
                .map(
                  (x) =>
                    '<option value="' +
                    x.id +
                    '" ' +
                    (f.target === x.id ? "selected" : "") +
                    ">" +
                    esc(title(x)) +
                    "</option>",
                )
                .join("") +
              "</select>") +
          '<label for="title-' +
          i +
          '">' +
          T("Source title", "عنوان المصدر") +
          '</label><input id="title-' +
          i +
          '" data-title="' +
          i +
          '" value="' +
          esc(f.title) +
          '" minlength="3" maxlength="200" required><label for="description-' +
          i +
          '">' +
          T("Source description", "وصف المصدر") +
          '</label><textarea id="description-' +
          i +
          '" data-description="' +
          i +
          '" minlength="10" maxlength="1000" required>' +
          esc(f.description) +
          "</textarea></div>"
        );
      })
      .join("") +
    (state.files.length
      ? '<label class="rights"><input type="checkbox" id="rights" ' +
        (state.rights ? "checked" : "") +
        " required><span>" +
        T(
          "I have permission to submit every selected file for this campaign.",
          "لدي إذن بإرسال كل ملف مختار لهذه الحملة.",
        ) +
        "</span></label>"
      : "") +
    (state.error
      ? '<p class="blocked" id="intake-error" role="alert" tabindex="-1">' +
        esc(state.error) +
        "</p>"
      : "") +
    '<div class="actions"><button class="primary" type="submit" ' +
    (state.scenario !== "active" || !state.files.length ? "disabled" : "") +
    ">" +
    T("Submit files", "إرسال الملفات") +
    '</button><button type="button" id="cancel">' +
    T("Cancel", "إلغاء") +
    "</button></div></form></section>"
  );
}
function campaign() {
  const outstanding = initial.filter(needs),
    recorded = initial.filter((r) => current(r) && !needs(r));
  return `<button class="back" data-home>${T("Source intake", "استلام المصادر")}</button><header><h1>${campaignName()}</h1><p>${T("Human Medicine · Year 1 · Term 1", "الطب البشري · السنة الأولى · الفصل الأول")}</p></header>${deadline()}${state.scenario !== "active" ? `<div class="notice blocked" role="status">${blocked()}</div>` : ""}${state.announcement ? `<div class="notice" role="status"><p>${esc(state.announcement)}</p></div>` : ""}<section aria-labelledby="awaiting"><div class="section-heading"><h2 id="awaiting">${T("Awaiting your action", "بانتظار إجراء منك")} · ${outstanding.length}</h2>${state.scenario === "active" && outstanding.length ? `<button class="primary" id="bulk">${T("Upload files", "رفع الملفات")}</button>` : ""}</div>${outstanding.length ? `<ul class="request-list">${outstanding.map(requestRow).join("")}</ul>` : `<div class="empty"><p>${T("No request needs your action right now. Check the receipts below for processing and review status.", "لا يوجد طلب يحتاج إلى إجراء منك الآن. راجع الإيصالات أدناه لمعرفة حالة المعالجة والمراجعة.")}</p></div>`}</section>${intake()}${state.selected && initial.find((r) => r.id === state.selected)?.readonly ? `<div class="notice">${T("This tracking request is read-only. No upload or correction is available.", "طلب المتابعة هذا للقراءة فقط. لا يتوفر رفع أو تصحيح.")}</div>` : ""}<section class="section" aria-labelledby="recorded"><h2 id="recorded">${T("Recorded submissions", "الإرسالات المسجلة")} · ${recorded.length}</h2><p class="helper">${T("Expand a receipt to inspect the recorded file, description and status.", "وسّع الإيصال للاطلاع على الملف والوصف والحالة المسجلة.")}</p><ul class="receipt-list">${recorded.map(receipt).join("")}</ul></section>`;
}
function latest() {
  const rows = state.scenario === "empty" ? [] : initial.filter(current);
  return `<header><h1>${T("Latest submissions", "آخر الإرسالات")}</h1><p>${T("One latest submission per request in your assigned campaigns. Earlier versions are not listed here.", "آخر إرسال واحد لكل طلب في الحملات المسندة إليك. لا تظهر الإصدارات السابقة هنا.")}</p></header>${rows.length ? `<ul class="latest-list">${rows.map((r) => `<li data-latest="${r.id}"><h2>${esc(title(r))}</h2><p>${T("Anatomy source call", "حملة مصادر التشريح")}</p><p><bdi>${esc(current(r).file)}</bdi></p>${status(current(r).status)}<div><button class="text-button" data-open-request="${r.id}">${T("Open request", "فتح الطلب")}</button></div></li>`).join("")}</ul>` : `<div class="empty"><p>${T("No submissions to show.", "لا توجد إرسالات لعرضها.")}</p><button data-home>${T("Source intake", "استلام المصادر")}</button></div>`}`;
}
function navigate(view) {
  state.view = view;
  state.announcement = "";
  render();
  $("#main").focus();
  window.scrollTo(0, 0);
}
function openIntake(id) {
  const r = initial.find((x) => x.id === id);
  if (id !== "bulk" && (!r || !permitted(r))) return;
  state.intake = id;
  state.error = "";
  state.selected = id === "bulk" ? null : id;
  state.files = [];
  state.rights = false;
  render();
  $("#intake").scrollIntoView({ block: "start" });
  ($("#description") || $("#files")).focus();
}
function row(name, format, target) {
  const draft = state.drafts[target] || {};
  return {
    name,
    format,
    target,
    title: draft.title || name.replace(/\.[^.]+$/, ""),
    description: draft.description || "",
  };
}
function samples() {
  if (!state.intake)
    return announce(
      T(
        "Open Upload files, Upload file or Replace file first.",
        "افتح رفع الملفات أو رفع ملف أو استبدال الملف أولًا.",
      ),
    );
  const r = initial.find((x) => x.id === state.intake),
    formats = r ? [r.format] : ["PDF", "WAV", "PNG"];
  state.files = formats.map((format) => {
    const targets = initial.filter(
      (x) => x.format === format && permitted(x) && !current(x),
    );
    const target = r?.id || (targets.length === 1 ? targets[0].id : "");
    return row(
      format === "PDF"
        ? "anatomy-handout.pdf"
        : format === "WAV"
          ? "anatomy-recording.wav"
          : "anatomy-diagram.png",
      format,
      target,
    );
  });
  state.rights = false;
  state.error = "";
  render();
  $("#intake").scrollIntoView({ block: "start" });
  announce(
    T(
      "Sample filenames added. Confirm each title, description and permission.",
      "أُضيفت أسماء الملفات التجريبية. أكّد عنوان كل ملف ووصفه والإذن بإرساله.",
    ),
  );
}
function announce(value) {
  $("#announcement").textContent = value;
}
function render() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.style.fontSize = state.large ? "32px" : "16px";
  document.title =
    (state.view === "latest"
      ? T("Latest submissions", "آخر الإرسالات")
      : T("Source intake", "استلام المصادر")) + " · UniMind prototype";
  $(".skip").textContent = T("Skip to content", "تخطَّ إلى المحتوى");
  $("#person").textContent = T("Synthetic leader", "قائد تجريبي");
  $("#role").textContent = T("Batch Leader", "قائد الدفعة");
  $("#simulation").textContent = T(
    "Isolated flow prototype · Sample receipts only · No files are uploaded",
    "نموذج منفصل للمسار · إيصالات تجريبية فقط · لا تُرفع ملفات",
  );
  $("#nav").setAttribute("aria-label", T("Main navigation", "التنقل الرئيسي"));
  $("#nav").innerHTML =
    `<button data-nav="home" ${state.view !== "latest" ? 'aria-current="page"' : ""}>${icon("home")}${T("Source intake", "استلام المصادر")}</button><button data-nav="latest" ${state.view === "latest" ? 'aria-current="page"' : ""}>${icon("latest")}${T("Latest submissions", "آخر الإرسالات")}</button>`;
  $("#main").innerHTML =
    state.view === "latest"
      ? latest()
      : state.view === "campaign"
        ? campaign()
        : home();
  bind();
}
function bind() {
  document
    .querySelectorAll("[data-nav]")
    .forEach((b) => (b.onclick = () => navigate(b.dataset.nav)));
  document
    .querySelectorAll("[data-home]")
    .forEach((b) => (b.onclick = () => navigate("home")));
  document.querySelectorAll("[data-campaign]").forEach(
    (b) =>
      (b.onclick = () => {
        state.campaign = b.dataset.campaign;
        state.selected = null;
        navigate("campaign");
      }),
  );
  document
    .querySelectorAll("[data-action]")
    .forEach((b) => (b.onclick = () => openIntake(b.dataset.action)));
  document.querySelectorAll("[data-open-request]").forEach(
    (b) =>
      (b.onclick = () => {
        state.campaign = "anatomy";
        state.selected = b.dataset.openRequest;
        navigate("campaign");
        const r = document.querySelector(
          `[data-request="${state.selected}"],[data-receipt="${state.selected}"]`,
        );
        r?.scrollIntoView({ block: "center" });
        const focus = r?.querySelector("button,summary");
        focus?.focus();
      }),
  );
  if ($("#bulk")) $("#bulk").onclick = () => openIntake("bulk");
  if ($("#cancel"))
    $("#cancel").onclick = () => {
      state.intake = null;
      state.files = [];
      state.rights = false;
      render();
      $("#bulk")?.focus();
    };

  if ($("#files"))
    $("#files").onchange = (e) => {
      const r = initial.find((x) => x.id === state.intake);
      state.files = Array.from(e.target.files).map((f) =>
        row(f.name, f.name.split(".").at(-1).toUpperCase(), r?.id || ""),
      );
      state.rights = false;
      state.error = "";
      render();
    };
  document
    .querySelectorAll("[data-target]")
    .forEach(
      (e) =>
        (e.onchange = () =>
          (state.files[Number(e.dataset.target)].target = e.value)),
    );
  function remember(f) {
    if (f.target)
      state.drafts[f.target] = { title: f.title, description: f.description };
  }
  document.querySelectorAll("[data-title]").forEach(
    (e) =>
      (e.oninput = () => {
        const f = state.files[Number(e.dataset.title)];
        f.title = e.value;
        remember(f);
      }),
  );
  document.querySelectorAll("[data-description]").forEach(
    (e) =>
      (e.oninput = () => {
        const f = state.files[Number(e.dataset.description)];
        f.description = e.value;
        remember(f);
      }),
  );
  if ($("#rights"))
    $("#rights").onchange = (e) => (state.rights = e.target.checked);
  if ($("#upload-form"))
    $("#upload-form").onsubmit = (e) => {
      e.preventDefault();
      if (state.scenario !== "active" || !state.rights || !state.files.length)
        return;
      const r = initial.find((x) => x.id === state.intake),
        targets = state.files.map((f) => f.target);
      if (
        (r && state.files.length !== 1) ||
        new Set(targets).size !== targets.length ||
        state.files.some((f) => {
          const target = initial.find((x) => x.id === f.target);
          return (
            !target ||
            !permitted(target) ||
            target.format !== f.format ||
            (r ? f.target !== r.id : !!current(target)) ||
            f.title.trim().length < 3 ||
            f.title.length > 200 ||
            f.description.trim().length < 10 ||
            f.description.length > 1000
          );
        })
      ) {
        state.error = T(
          "Each file must match its named request and have a title and description. Use the requested format, or choose a different compatible request in bulk intake.",
          "يجب أن يطابق كل ملف طلبه المحدد وأن يتضمن عنوانًا ووصفًا. استخدم الصيغة المطلوبة أو اختر طلبًا متوافقًا آخر عند رفع عدة ملفات.",
        );
        render();
        $("#intake-error").focus();
        return;
      }
      state.files.forEach((f) =>
        state.receipts.set(f.target, {
          status: "RECEIVED",
          file: f.name,
          title: f.title.trim(),
          description: f.description.trim(),
          permission: true,
          receipt: "R-" + state.counter++,
        }),
      );
      state.announcement = T(
        "Files and information received. Your remaining requests are listed first; processing is separate. The earlier submissions stay unchanged.",
        "تم استلام الملفات والمعلومات. تظهر الطلبات المتبقية أولًا؛ والمعالجة خطوة منفصلة. تبقى الإرسالات السابقة دون تغيير.",
      );
      state.intake = null;
      state.files = [];
      state.rights = false;
      state.error = "";
      render();
      $("#awaiting").setAttribute("tabindex", "-1");
      $("#awaiting").focus();
      window.scrollTo(0, 0);
    };
}
addEventListener("message", (e) => {
  if (e.origin !== location.origin || e.source !== parent) return;
  const m = e.data;
  if (m.kind === "reset") return reset();
  if (m.kind === "samples") return samples();
  if (m.kind !== "settings") return;
  state.lang = m.lang === "ar" ? "ar" : "en";
  state.theme = m.theme === "dark" ? "dark" : "light";
  state.large = !!m.large;
  state.scenario = ["active", "expired", "closed", "empty"].includes(m.scenario)
    ? m.scenario
    : "active";
  if (state.scenario === "empty") state.view = "home";
  render();
});
const initialQuery = new URLSearchParams(location.search);
state.lang = initialQuery.get("lang") === "ar" ? "ar" : "en";
state.theme = initialQuery.get("theme") === "dark" ? "dark" : "light";
reset();
