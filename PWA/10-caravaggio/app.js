const keyFirst = "caravaggio-first-look";
const keySecond = "caravaggio-second-look";
const firstNote = document.querySelector("#first-note");
const secondNote = document.querySelector("#second-note");
const memory = document.querySelector("#first-memory");

function restoreNotes() {
  const first = localStorage.getItem(keyFirst) || "";
  const second = localStorage.getItem(keySecond) || "";
  firstNote.value = first;
  secondNote.value = second;
  memory.textContent = first || "Non hai ancora scritto nulla.";
}

document.querySelector("#save-first").addEventListener("click", () => {
  const value = firstNote.value.trim();
  if (!value) return document.querySelector("#saved-first").textContent = "Scrivi almeno un’osservazione.";
  localStorage.setItem(keyFirst, value);
  memory.textContent = value;
  document.querySelector("#saved-first").textContent = "Il tuo primo sguardo è conservato.";
});

document.querySelector("#save-second").addEventListener("click", () => {
  const value = secondNote.value.trim();
  if (!value) return document.querySelector("#saved-second").textContent = "Scrivi ciò che ora vedi diversamente.";
  localStorage.setItem(keySecond, value);
  document.querySelector("#saved-second").textContent = "La rilettura è stata salvata su questo dispositivo.";
});

const worksButton = document.querySelector(".works-toggle");
const worksNav = document.querySelector("#works-nav");
worksButton.addEventListener("click", () => {
  const open = worksNav.hidden;
  worksNav.hidden = !open;
  worksButton.setAttribute("aria-expanded", String(open));
  worksButton.querySelector("span").textContent = open ? "×" : "＋";
});
worksNav.addEventListener("click", () => {
  worksNav.hidden = true;
  worksButton.setAttribute("aria-expanded", "false");
  worksButton.querySelector("span").textContent = "＋";
});

document.querySelectorAll(".hotspot").forEach(button => button.addEventListener("click", () => {
  document.querySelector("#hotspot-note").textContent = button.dataset.note;
}));

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
let scale = 1;

function setScale(next) {
  scale = Math.max(1, Math.min(3.5, next));
  lightboxImage.style.transform = `scale(${scale})`;
  lightbox.querySelector('[data-action="reset"]').textContent = `${Math.round(scale * 100)}%`;
}
function openLightbox(button) {
  lightboxImage.src = button.dataset.image;
  lightboxCaption.textContent = button.dataset.caption || "";
  setScale(1);
  lightbox.hidden = false;
  document.body.classList.add("locked");
  lightbox.querySelector('[data-action="close"]').focus();
}
function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = "";
  document.body.classList.remove("locked");
}
document.querySelectorAll(".zoom-button").forEach(button => button.addEventListener("click", () => openLightbox(button)));
lightbox.addEventListener("click", event => {
  const action = event.target.dataset.action;
  if (action === "close") closeLightbox();
  if (action === "plus") setScale(scale + .35);
  if (action === "minus") setScale(scale - .35);
  if (action === "reset") setScale(1);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
  if (event.key === "+" && !lightbox.hidden) setScale(scale + .35);
  if (event.key === "-" && !lightbox.hidden) setScale(scale - .35);
});

document.querySelector("#quiz-form").addEventListener("submit", event => {
  event.preventDefault();
  let score = 0;
  let answered = 0;
  document.querySelectorAll("#quiz-form fieldset").forEach(fieldset => {
    const selected = fieldset.querySelector("input:checked");
    const feedback = fieldset.querySelector(".feedback");
    if (!selected) return feedback.textContent = "Scegli una risposta prima di verificare.";
    answered += 1;
    const correct = selected.value === fieldset.dataset.answer;
    if (correct) score += 1;
    feedback.textContent = correct ? "Esatto: hai collegato la forma al suo significato." : "Riguarda la sezione corrispondente: la risposta nasce da ciò che l’opera rende visibile.";
    feedback.style.color = correct ? "#426244" : "#9e2f22";
  });
  const result = document.querySelector("#quiz-result");
  result.textContent = answered < 3 ? "Completa tutte le domande." : score === 3 ? "3 su 3. Ora torna alle opere: sapere deve rendere lo sguardo più preciso." : `${score} su 3. Non ricominciare dalle definizioni: riapri le immagini e segui luce, corpi e gesti.`;
});

function updateProgress() {
  const total = document.documentElement.scrollHeight - innerHeight;
  document.querySelector("#progress-bar").style.width = `${total > 0 ? (scrollY / total) * 100 : 0}%`;
}
addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress);
restoreNotes();
updateProgress();

if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
