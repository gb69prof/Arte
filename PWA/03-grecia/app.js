const STORAGE_KEY = "storia-sguardo-03-progress-v1";
const defaultState = {
  first: "", second: "", visited: [], body: "kouros", layers: [],
  quiz: { index: 0, firstTry: 0, answers: [], recoveries: 0, complete: false }
};

function cloneDefault(){ return JSON.parse(JSON.stringify(defaultState)); }
function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved ? { ...cloneDefault(), ...saved, quiz: { ...defaultState.quiz, ...(saved.quiz || {}) } } : cloneDefault();
  }catch(_error){ return cloneDefault(); }
}
let state = loadState();
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(_error){ /* Il percorso resta usabile anche se lo storage è indisponibile. */ }
}

const firstNote = document.querySelector("#first-note");
const secondNote = document.querySelector("#second-note");
const firstMemory = document.querySelector("#first-memory");
firstNote.value = state.first;
secondNote.value = state.second;
firstMemory.textContent = state.first || "Non hai ancora scritto nulla.";

document.querySelector("#save-first").addEventListener("click", () => {
  state.first = firstNote.value.trim(); saveState(); firstMemory.textContent = state.first || "Non hai ancora scritto nulla.";
  document.querySelector("#saved-first").textContent = state.first ? "Primo sguardo conservato su questo dispositivo." : "Scrivi almeno un’osservazione prima di salvare.";
});
document.querySelector("#save-second").addEventListener("click", () => {
  state.second = secondNote.value.trim(); saveState();
  document.querySelector("#saved-second").textContent = state.second ? "Rilettura conservata su questo dispositivo." : "La rilettura è ancora vuota.";
});

const nav = document.querySelector("#chapter-nav");
const navToggle = document.querySelector("#nav-toggle");
const navClose = document.querySelector("#nav-close");
let navReturn = null;
function setNav(open){
  nav.hidden = !open; navToggle.setAttribute("aria-expanded", String(open)); document.body.classList.toggle("locked", open);
  if(open){ navReturn = document.activeElement; navClose.focus(); } else if(navReturn){ navReturn.focus(); }
}
navToggle.addEventListener("click", () => setNav(nav.hidden));
navClose.addEventListener("click", () => setNav(false));
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.hidden = true; navToggle.setAttribute("aria-expanded", "false"); document.body.classList.remove("locked");
}));

const tracked = [...document.querySelectorAll(".tracked")];
const journeyState = document.querySelector("#journey-state");
function updateJourney(){ journeyState.textContent = `${state.visited.length} / ${tracked.length} tappe`; }
updateJourney();
if("IntersectionObserver" in window){
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    const name = entry.target.dataset.track;
    if(!state.visited.includes(name)){ state.visited.push(name); saveState(); updateJourney(); }
  }), { threshold: .24 });
  tracked.forEach(section => observer.observe(section));
}

function updateProgress(){
  const total = document.documentElement.scrollHeight - innerHeight;
  document.querySelector("#progress-bar").style.width = `${total > 0 ? Math.min(100, (scrollY / total) * 100) : 0}%`;
}
addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress); updateProgress();

const bodyTabs = [...document.querySelectorAll("[data-body-tab]")];
const bodySlides = [...document.querySelectorAll("[data-body]")];
const layerText = {
  axis: "L’asse mostra se il corpo si dispone su una verticale rigida oppure devia verso il punto che sostiene il peso.",
  supports: "Gli appoggi distinguono il piede che porta realmente il corpo da quello avanzato, arretrato o alleggerito.",
  pelvis: "Bacino e spalle reagiscono alla distribuzione del peso: nel contrapposto le loro inclinazioni tendono a compensarsi.",
  tension: "Le linee piene indicano le parti più impegnate; quelle azzurre e tratteggiate le parti relativamente libere o rilassate.",
  gravity: "Il centro di gravità non è un punto decorativo: la sua proiezione deve restare compatibile con l’appoggio che sostiene la figura."
};

function renderBody(key, moveFocus = false){
  if(!bodySlides.some(slide => slide.dataset.body === key)) key = "kouros";
  state.body = key; saveState();
  bodyTabs.forEach(tab => {
    const active = tab.dataset.bodyTab === key;
    tab.setAttribute("aria-selected", String(active)); tab.tabIndex = active ? 0 : -1;
    if(active && moveFocus) tab.focus();
  });
  bodySlides.forEach(slide => {
    const active = slide.dataset.body === key;
    slide.hidden = !active; slide.classList.toggle("active", active);
  });
  syncLayers();
}
bodyTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => renderBody(tab.dataset.bodyTab));
  tab.addEventListener("keydown", event => {
    if(!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if(event.key === "ArrowLeft") next = (index - 1 + bodyTabs.length) % bodyTabs.length;
    if(event.key === "ArrowRight") next = (index + 1) % bodyTabs.length;
    if(event.key === "Home") next = 0;
    if(event.key === "End") next = bodyTabs.length - 1;
    renderBody(bodyTabs[next].dataset.bodyTab, true);
  });
});

const readerNote = document.querySelector("#reader-note");
function syncLayers(){
  document.querySelectorAll("[data-overlay]").forEach(group => group.classList.toggle("active", state.layers.includes(group.dataset.overlay)));
  document.querySelectorAll("[data-layer-button]").forEach(button => button.setAttribute("aria-pressed", String(state.layers.includes(button.dataset.layerButton))));
  readerNote.textContent = state.layers.length ? state.layers.map(key => layerText[key]).join(" ") : "Attiva un livello: puoi combinarne più di uno.";
}
document.querySelectorAll("[data-layer-button]").forEach(button => button.addEventListener("click", () => {
  const key = button.dataset.layerButton;
  state.layers = state.layers.includes(key) ? state.layers.filter(item => item !== key) : [...state.layers, key];
  saveState(); syncLayers();
}));
renderBody(state.body);

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxStage = document.querySelector(".lightbox-stage");
const lightboxClose = document.querySelector(".lightbox-close");
let lightboxScale = 1;
let lightboxTrigger = null;
let pinchStart = null;
function setLightboxScale(value){
  lightboxScale = Math.max(.7, Math.min(3.4, value));
  lightboxImage.style.transform = `scale(${lightboxScale})`;
  lightbox.querySelector('[data-zoom="reset"]').textContent = `${Math.round(lightboxScale * 100)}%`;
}
function openLightbox(trigger){
  lightboxTrigger = trigger;
  lightboxImage.src = trigger.dataset.image;
  lightboxImage.alt = trigger.closest("section, article, figure")?.querySelector("img")?.alt || "Opera ingrandita";
  lightboxCaption.textContent = trigger.dataset.caption || "Opera ingrandita";
  lightbox.hidden = false; document.body.classList.add("locked"); setLightboxScale(1); lightboxClose.focus();
}
function closeLightbox(){
  lightbox.hidden = true; lightboxImage.removeAttribute("src"); document.body.classList.remove("locked");
  if(lightboxTrigger) lightboxTrigger.focus();
}
document.querySelectorAll("[data-image]").forEach(button => button.addEventListener("click", () => openLightbox(button)));
lightboxClose.addEventListener("click", closeLightbox);
document.querySelectorAll("[data-zoom]").forEach(button => button.addEventListener("click", () => {
  const action = button.dataset.zoom;
  setLightboxScale(action === "in" ? lightboxScale + .3 : action === "out" ? lightboxScale - .3 : 1);
}));
lightbox.addEventListener("click", event => { if(event.target === lightbox) closeLightbox(); });
lightboxStage.addEventListener("wheel", event => {
  if(!event.ctrlKey && !event.metaKey) return;
  event.preventDefault(); setLightboxScale(lightboxScale + (event.deltaY < 0 ? .2 : -.2));
}, { passive: false });
function touchDistance(touches){
  const [a,b] = touches; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}
lightboxStage.addEventListener("touchstart", event => {
  if(event.touches.length === 2) pinchStart = { distance: touchDistance(event.touches), scale: lightboxScale };
}, { passive: true });
lightboxStage.addEventListener("touchmove", event => {
  if(!pinchStart || event.touches.length !== 2) return;
  event.preventDefault(); setLightboxScale(pinchStart.scale * touchDistance(event.touches) / pinchStart.distance);
}, { passive: false });
lightboxStage.addEventListener("touchend", () => { pinchStart = null; }, { passive: true });

document.addEventListener("keydown", event => {
  if(event.key === "Escape" && !lightbox.hidden){ closeLightbox(); return; }
  if(event.key === "Escape" && !nav.hidden){ setNav(false); return; }
  if(event.key === "Tab" && !lightbox.hidden){
    const focusable = [...lightbox.querySelectorAll("button")];
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if(event.shiftKey && document.activeElement === first){ event.preventDefault(); last.focus(); }
    else if(!event.shiftKey && document.activeElement === last){ event.preventDefault(); first.focus(); }
  }
  if(event.key === "Tab" && !nav.hidden){
    const focusable = [...nav.querySelectorAll("a,button")];
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if(event.shiftKey && document.activeElement === first){ event.preventDefault(); last.focus(); }
    else if(!event.shiftKey && document.activeElement === last){ event.preventDefault(); first.focus(); }
  }
});

const quiz = [
  {
    q: "Perché il corpo assume un ruolo centrale nell’immagine greca?",
    options: ["Perché i Greci scoprono per primi che l’uomo esiste", "Perché culti antropomorfi, agone, guerra e cittadinanza fanno del corpo un luogo di valori pubblici", "Perché scompare ogni funzione religiosa"], answer: 1,
    ok: "Il corpo diventa un punto d’incontro fra culto, formazione, competizione, identità civica e memoria.",
    recovery: "Il corpo greco non nasce fuori dalla società: santuario, ginnasio, festa e guerra lo rendono portatore di appartenenza e rango.",
    retry: { q: "Quale relazione è storicamente più fondata?", options: ["Corpo e istituzioni della polis si costruiscono insieme", "Il corpo è soltanto anatomia privata"], answer: 0 }
  },
  {
    q: "Che differenza c’è fra naturalismo e idealizzazione?",
    options: ["Il naturalismo osserva relazioni visibili; l’idealizzazione seleziona e ordina la natura secondo un modello", "Il naturalismo è sempre fotografia esatta", "L’idealizzazione ignora completamente il corpo reale"], answer: 0,
    ok: "Il corpo ideale appare possibile perché parte dall’osservazione, ma non coincide con un individuo medio realmente esistente.",
    recovery: "L’ideale non elimina la natura: la corregge, seleziona e rende coerente affinché incarni un valore.",
    retry: { q: "Un corpo può sembrare naturale e insieme essere costruito?", options: ["Sì, se l’osservazione viene selezionata e organizzata", "No, le due cose si escludono sempre"], answer: 0 }
  },
  {
    q: "Che cosa accade quando il peso passa soprattutto su una gamba?",
    options: ["Cambia soltanto il ginocchio", "Bacino, colonna, spalle e arti devono reagire in relazione", "Il corpo torna perfettamente simmetrico"], answer: 1,
    ok: "La naturalezza nasce da una catena di compensazioni, non da un dettaglio isolato.",
    recovery: "Nel Kritios Boy la gamba portante modifica il bacino; il resto del corpo risponde per conservare l’equilibrio.",
    retry: { q: "Qual è il segno più importante della ponderazione?", options: ["L’interdipendenza fra le parti", "Un piede disegnato più grande"], answer: 0 }
  },
  {
    q: "Che cosa significa symmetria nel contesto del canone policleteo?",
    options: ["Identica misura di tutte le parti", "Commisurazione e rapporto coerente fra le parti", "Sola simmetria speculare destra-sinistra"], answer: 1,
    ok: "Ogni parte è misurata rispetto alle altre; l’unità nasce dalla relazione.",
    recovery: "Symmetria non vuol dire che ogni segmento sia uguale. Indica che le parti risultano commisurate dentro un insieme.",
    retry: { q: "Dove risiede la proporzione?", options: ["Nel rapporto fra le parti", "In una sola parte scelta come bella"], answer: 0 }
  },
  {
    q: "Perché il Canone non può essere ridotto a una formula numerica certa?",
    options: ["Perché Policleto non usava alcuna misura", "Perché il trattato non ci è giunto integralmente e non possediamo una formula completa verificabile", "Perché ogni copia romana è identica all’originale"], answer: 1,
    ok: "Possiamo ricostruire princìpi e relazioni, ma non fingere di possedere la ricetta perduta.",
    recovery: "Il trattato di Policleto sopravvive solo in testimonianze frammentarie; le statue note sono spesso copie e varianti.",
    retry: { q: "Quale affermazione è prudente?", options: ["Conosciamo princìpi, non una tabella completa", "Possediamo tutte le percentuali originali"], answer: 0 }
  },
  {
    q: "Che cosa stiamo guardando nel Doriforo conservato a Napoli?",
    options: ["L’originale greco in bronzo", "Una copia romana in marmo da un originale greco in bronzo perduto", "Una ricostruzione digitale moderna"], answer: 1,
    ok: "La copia trasmette il tipo policleteo, ma materia, sostegni e storia appartengono anche al mondo romano.",
    recovery: "L’originale bronzeo non è conservato. L’esemplare di Pompei è una copia romana in marmo oggi al MANN.",
    retry: { q: "Quale passaggio materiale è avvenuto?", options: ["Da bronzo greco perduto a copia romana in marmo", "Da marmo romano a originale greco conservato"], answer: 0 }
  },
  {
    q: "Quale rapporto collega il corpo alla polis senza idealizzarla?",
    options: ["L’ideale rappresenta automaticamente tutti gli abitanti", "Il corpo civico esprime valori comuni ma nasce dentro cittadinanza, culto, guerra ed esclusioni", "La democrazia ateniese coincide con quella moderna"], answer: 1,
    ok: "L’armonia visiva può costruire un’identità collettiva senza cancellare i limiti politici e sociali di quella comunità.",
    recovery: "Donne, schiavi e stranieri residenti contribuivano alla società ma non godevano della piena cittadinanza politica ateniese.",
    retry: { q: "Che cosa deve accompagnare l’idea di armonia civica?", options: ["L’analisi delle esclusioni", "L’idea che tutti avessero gli stessi diritti"], answer: 0 }
  },
  {
    q: "Che cosa dimostra la policromia della scultura greca?",
    options: ["Che ogni ricostruzione moderna coincide perfettamente con l’originale", "Che il bianco attuale è spesso il risultato della perdita dei pigmenti, non l’aspetto originario completo", "Che il marmo non era mai visibile"], answer: 1,
    ok: "Tracce e analisi documentano il colore; le ricostruzioni devono restare dichiarate come ipotesi scientifiche.",
    recovery: "La Peplos Kore conserva tracce analizzate di vari pigmenti. Una ricostruzione interpreta questi dati, ma non è l’originale intatto.",
    retry: { q: "Quale distinzione è indispensabile?", options: ["Traccia materiale e ricostruzione", "Marmo e assenza assoluta di colore"], answer: 0 }
  }
];

const quizPanel = document.querySelector("#quiz-panel");
const quizSummary = document.querySelector("#quiz-summary");
const quizCount = document.querySelector("#quiz-count");
const quizMeter = document.querySelector("#quiz-meter");
function updateQuizHeader(){
  const current = Math.min(state.quiz.index + 1, quiz.length);
  quizCount.textContent = state.quiz.complete ? "Percorso completato" : `Domanda ${current} di ${quiz.length}`;
  quizMeter.value = state.quiz.complete ? quiz.length : state.quiz.index;
}
function nextQuestion(firstTry){
  state.quiz.answers.push({ index: state.quiz.index, firstTry });
  if(firstTry) state.quiz.firstTry += 1;
  state.quiz.index += 1; if(state.quiz.index >= quiz.length) state.quiz.complete = true;
  saveState(); renderQuiz();
}
function renderOptions(container, options, handler){
  const wrap = document.createElement("div"); wrap.className = "quiz-options";
  options.forEach((option,index) => {
    const button = document.createElement("button"); button.type = "button"; button.textContent = option;
    button.addEventListener("click", () => handler(index, wrap)); wrap.append(button);
  });
  container.append(wrap);
}
function focusCard(card){ card.tabIndex = -1; requestAnimationFrame(() => card.focus()); }
function renderRecovery(item){
  quizPanel.innerHTML = "";
  const card = document.createElement("article"); card.className = "quiz-card recovery-card";
  card.innerHTML = `<p class="recovery-label">Recupero mirato</p><h3>${item.retry.q}</h3>`;
  renderOptions(card, item.retry.options, (choice, wrap) => {
    wrap.querySelectorAll("button").forEach(button => { button.disabled = true; });
    const feedback = document.createElement("div"); feedback.className = "quiz-feedback";
    if(choice === item.retry.answer){
      feedback.innerHTML = `<h4>Collegamento recuperato.</h4><p>Ora il passaggio essenziale è ricostruito. Puoi proseguire senza aver ricevuto soltanto una soluzione da memorizzare.</p><div class="quiz-actions"><button type="button" data-next>Continua →</button></div>`;
      feedback.querySelector("[data-next]").addEventListener("click", () => nextQuestion(false));
    }else{
      state.quiz.recoveries += 1; saveState();
      feedback.innerHTML = `<h4>Fermiamoci sulla relazione.</h4><p>${item.recovery} Rileggi, poi riprova con parole diverse.</p><div class="quiz-actions"><button type="button" data-retry>Riprova</button></div>`;
      feedback.querySelector("[data-retry]").addEventListener("click", () => renderRecovery(item));
    }
    card.append(feedback); feedback.querySelector("button")?.focus();
  });
  quizPanel.append(card); focusCard(card);
}
function renderQuestion(){
  const item = quiz[state.quiz.index]; quizPanel.innerHTML = "";
  const card = document.createElement("article"); card.className = "quiz-card";
  card.innerHTML = `<p class="question-no">${String(state.quiz.index + 1).padStart(2,"0")}</p><h3>${item.q}</h3>`;
  renderOptions(card, item.options, (choice, wrap) => {
    wrap.querySelectorAll("button").forEach(button => { button.disabled = true; });
    const feedback = document.createElement("div"); feedback.className = "quiz-feedback";
    if(choice === item.answer){
      feedback.innerHTML = `<h4>Risposta fondata.</h4><p>${item.ok}</p><div class="quiz-actions"><button type="button" data-next>Continua →</button></div>`;
      feedback.querySelector("[data-next]").addEventListener("click", () => nextQuestion(true));
    }else{
      state.quiz.recoveries += 1; saveState();
      feedback.innerHTML = `<h4>La relazione non è ancora precisa.</h4><p>${item.recovery}</p><div class="quiz-actions"><button type="button" data-recovery>Apri il recupero mirato</button></div>`;
      feedback.querySelector("[data-recovery]").addEventListener("click", () => renderRecovery(item));
    }
    card.append(feedback); feedback.querySelector("button")?.focus();
  });
  quizPanel.append(card); focusCard(card);
}
function renderSummary(){
  quizPanel.innerHTML = ""; quizSummary.hidden = false;
  quizSummary.innerHTML = `<h3>Percorso completato.</h3><p>Hai risposto correttamente al primo tentativo a <b>${state.quiz.firstTry} domande su ${quiz.length}</b>. I recuperi affrontati sono stati <b>${state.quiz.recoveries}</b>. Il risultato importante non è il numero isolato, ma la capacità di collegare forma, società e ideale senza trasformare la Grecia in un mito.</p><button type="button" id="quiz-restart">Ricomincia la verifica</button>`;
  document.querySelector("#quiz-restart").addEventListener("click", () => { state.quiz = { ...defaultState.quiz }; saveState(); renderQuiz(); });
}
function renderQuiz(){
  quizSummary.hidden = true; updateQuizHeader();
  if(state.quiz.complete || state.quiz.index >= quiz.length){ state.quiz.complete = true; saveState(); renderSummary(); }
  else renderQuestion();
}
renderQuiz();

if("serviceWorker" in navigator){
  addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}
