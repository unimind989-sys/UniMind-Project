const frame = document.querySelector("#preview");
const controls = ["size", "language", "theme", "large", "scenario"];
function settings() {
  return {
    lang: document.querySelector("#language").value,
    theme: document.querySelector("#theme").value,
    large: document.querySelector("#large").checked,
    scenario: document.querySelector("#scenario").value,
  };
}
function sync() {
  const [w, h] = document.querySelector("#size").value.split(",");
  frame.style.width = w + "px";
  frame.style.height = h + "px";
  frame.contentWindow.postMessage(
    { kind: "settings", ...settings() },
    location.origin,
  );
}
controls.forEach((id) =>
  document.getElementById(id).addEventListener("change", sync),
);
frame.addEventListener("load", sync);
document
  .querySelector("#reset")
  .addEventListener("click", () =>
    frame.contentWindow.postMessage({ kind: "reset" }, location.origin),
  );
let candidate;
document
  .querySelector("#samples")
  .addEventListener("click", () =>
    frame.contentWindow.postMessage({ kind: "samples" }, location.origin),
  );
fetch("candidate.json")
  .then((r) => {
    if (!r.ok) throw Error("Candidate identity unavailable");
    return r.json();
  })
  .then((value) => {
    candidate = value;
    document.querySelector("#fingerprint").textContent =
      "Candidate " + value.candidate + " · " + value.fingerprint;
  })
  .catch((e) => {
    document.querySelector("#fingerprint").textContent = e.message;
  });
document.querySelector("#decision-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!candidate) {
    document.querySelector("#decision-status").textContent =
      "Candidate identity is unavailable. Please reload before exporting.";
    return;
  }
  const choice = document.querySelector("#choice").value,
    notes = document.querySelector("#notes").value.trim();
  if (choice === "changes" && !notes) {
    document
      .querySelector("#notes")
      .setCustomValidity("Describe the change you want.");
    document.querySelector("#notes").reportValidity();
    return;
  }
  const data = {
    schemaVersion: 1,
    actor: "Ahmed",
    candidate: candidate.candidate,
    fingerprint: candidate.fingerprint,
    inputs: candidate.inputs,
    decision: choice,
    notes,
    exportedAt: new Date().toISOString(),
    scope:
      "B09 prototype flow direction only; no implementation acceptance or external delivery authorization",
  };
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2) + "\n"], {
      type: "application/json",
    }),
  );
  link.download = "unimind-b09-review-choices.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  document.querySelector("#decision-status").textContent =
    "Decision exported. Tell me when you have finished the form.";
});
document
  .querySelector("#notes")
  .addEventListener("input", (e) => e.target.setCustomValidity(""));
