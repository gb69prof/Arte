const storage = {
  first: "prima-arte-first-look",
  second: "prima-arte-second-look",
  seen: "prima-arte-seen-sections"
};

const firstNote = document.querySelector("#first-note");
const secondNote = document.querySelector("#second-note");
const firstMemory = document.querySelector("#first-memory");

function restoreLearning() {
  const first = localStorage.getItem(storage.first) || "";
  const second = localStorage.getItem(storage.second) || "";
  firstNote.value = first;
  secondNote.value = second;
  firstMemory.textContent = first || "Non hai ancora scritto nulla.";
}

function saveNote(field, key, status, emptyMessage, successMessage) {
  const value = field.value.trim();
  if (!value) {
    status.textContent = emptyMessage;
    field.focus();
    return;
  }
  localStorage.setItem(key, value);
  status.textContent = successMessage;
  if (key === storage.first) firstMemory.textContent = value;
}

document.querySelector("#save-first").addEventListener("click", () => saveNote(
  firstNote, storage.first, document.querySelector("#saved-first"),
  "Scrivi almeno un’osservazione prima di salvarla.", "Il tuo primo sguardo è conservato su questo dispositivo."
));

document.querySelector("#save-second").addEventListener("click", () => saveNote(
  secondNote, storage.second, document.querySelector("#saved-second"),
  "Scrivi come è cambiato il tuo sguardo.", "La rilettura è stata salvata su questo dispositivo."
));

const navButton = document.querySelector(".evidence-toggle");
const evidenceNav = document.querySelector("#evidence-nav");

function setNav(open) {
  evidenceNav.hidden = !open;
  navButton.setAttribute("aria-expanded", String(open));
  navButton.querySelector("span").textContent = open ? "×" : "＋";
  if (open) evidenceNav.querySelector("a").focus();
}

navButton.addEventListener("click", () => setNav(evidenceNav.hidden));
evidenceNav.addEventListener("click", event => { if (event.target.closest("a")) setNav(false); });

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxStage = document.querySelector("#lightbox-stage");
let scale = 1;
let returnFocus = null;
let pinchStart = null;
let pinchBase = 1;

function setScale(next) {
  scale = Math.max(1, Math.min(4, next));
  lightboxImage.style.width = `${scale * 100}%`;
  lightboxStage.classList.toggle("zoomed", scale > 1);
  lightbox.querySelector('[data-action="reset"]').textContent = `${Math.round(scale * 100)}%`;
}

function openLightbox(button) {
  returnFocus = button;
  lightboxImage.src = button.dataset.image;
  lightboxImage.alt = button.closest("figure, .trace-image, .first-image, .second-image")?.querySelector("img")?.alt || "Testimonianza archeologica ingrandita";
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
  returnFocus?.focus();
}

document.querySelectorAll(".zoom-button").forEach(button => button.addEventListener("click", () => openLightbox(button)));
lightbox.addEventListener("click", event => {
  const action = event.target.dataset.action;
  if (action === "close") closeLightbox();
  if (action === "plus") setScale(scale + .35);
  if (action === "minus") setScale(scale - .35);
  if (action === "reset") setScale(1);
});

lightboxStage.addEventListener("touchstart", event => {
  if (event.touches.length !== 2) return;
  pinchStart = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
  pinchBase = scale;
}, { passive: true });

lightboxStage.addEventListener("touchmove", event => {
  if (event.touches.length !== 2 || !pinchStart) return;
  const distance = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
  setScale(pinchBase * (distance / pinchStart));
  event.preventDefault();
}, { passive: false });

lightboxStage.addEventListener("touchend", () => { pinchStart = null; }, { passive: true });

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (!lightbox.hidden) closeLightbox();
    else if (!evidenceNav.hidden) setNav(false);
  }
  if (!lightbox.hidden && (event.key === "+" || event.key === "=")) setScale(scale + .35);
  if (!lightbox.hidden && event.key === "-") setScale(scale - .35);
  if (!lightbox.hidden && event.key === "Tab") {
    const focusable = [...lightbox.querySelectorAll("button")];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

document.querySelector("#quiz-form").addEventListener("submit", event => {
  event.preventDefault();
  let score = 0;
  let answered = 0;
  const fields = [...event.currentTarget.querySelectorAll("fieldset")];
  fields.forEach(fieldset => {
    const selected = fieldset.querySelector("input:checked");
    const feedback = fieldset.querySelector(".feedback");
    if (!selected) {
      feedback.textContent = "Scegli una risposta prima di verificare.";
      feedback.style.color = "#d5a66d";
      return;
    }
    answered += 1;
    const correct = selected.value === fieldset.dataset.answer;
    if (correct) {
      score += 1;
      feedback.textContent = "Esatto: hai distinto l’indizio dall’interpretazione.";
      feedback.style.color = "#9fc2a5";
    } else {
      const link = document.createElement("a");
      link.href = fieldset.dataset.review;
      link.textContent = "Riapri la sezione indicata ↗";
      feedback.replaceChildren("Non basta una formula: torna all’immagine e verifica materiali, contesto e grado di certezza. ", link);
      feedback.style.color = "#e5a98b";
    }
  });
  const result = document.querySelector("#quiz-result");
  if (answered < fields.length) result.textContent = `Hai risposto a ${answered} domande su ${fields.length}. Completa le altre prima di concludere.`;
  else if (score === fields.length) result.textContent = `${score} su ${fields.length}. Hai collegato forma, materia, contesto e limiti dell’interpretazione. Ora torna alla parete iniziale.`;
  else result.textContent = `${score} su ${fields.length}. Gli errori non chiedono di memorizzare una definizione: segui i collegamenti di recupero e riapri le testimonianze.`;
});

const trackedSections = [...document.querySelectorAll(".tracked")];
const seen = new Set(JSON.parse(localStorage.getItem(storage.seen) || "[]"));
const journeyState = document.querySelector("#journey-state");

function updateJourney() {
  journeyState.textContent = `${Math.min(seen.size, trackedSections.length)} / ${trackedSections.length} tappe`;
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      seen.add(entry.target.id);
      localStorage.setItem(storage.seen, JSON.stringify([...seen]));
      updateJourney();
    });
  }, { threshold: .28 });
  trackedSections.forEach(section => observer.observe(section));
}

function updateReadingProgress() {
  const total = document.documentElement.scrollHeight - innerHeight;
  document.querySelector("#progress-bar").style.width = `${total > 0 ? (scrollY / total) * 100 : 0}%`;
}

addEventListener("scroll", updateReadingProgress, { passive: true });
addEventListener("resize", updateReadingProgress);
restoreLearning();
updateJourney();
updateReadingProgress();

if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
