// Review harness: one screen at a time, theme toggle, desktop frames scaled to fit.
const root = document.documentElement;
root.classList.add("board");
const screens = [...document.querySelectorAll(".screen")];
const bar = document.querySelector(".board-bar nav[data-screens]");
const params = new URLSearchParams(location.search);

function fit() {
  const width = document.querySelector(".board-stage").clientWidth - 32;
  for (const frame of document.querySelectorAll(".frame-desktop"))
    frame.style.zoom = String(Math.min(1, width / 1440));
}

function show(id) {
  for (const screen of screens)
    screen.classList.toggle("is-shown", screen.dataset.screen === id);
  for (const button of bar.querySelectorAll("button"))
    button.setAttribute("aria-pressed", String(button.value === id));
  params.set("screen", id);
  history.replaceState(null, "", `?${params}`);
  fit();
}

function theme(value) {
  root.dataset.theme = value;
  for (const button of document.querySelectorAll("[data-theme-choice]"))
    button.setAttribute("aria-pressed", String(button.value === value));
  params.set("theme", value);
  history.replaceState(null, "", `?${params}`);
}

for (const screen of screens) {
  const button = document.createElement("button");
  button.type = "button";
  button.value = screen.dataset.screen;
  button.textContent = screen.dataset.label;
  button.addEventListener("click", () => show(button.value));
  bar.append(button);
}
for (const button of document.querySelectorAll("[data-theme-choice]"))
  button.addEventListener("click", () => theme(button.value));

theme(params.get("theme") === "dark" ? "dark" : "light");
show(
  screens.some((s) => s.dataset.screen === params.get("screen"))
    ? params.get("screen")
    : screens[0].dataset.screen,
);
addEventListener("resize", fit);
