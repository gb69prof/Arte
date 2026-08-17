const STORAGE_KEY = "storia-sguardo-02-v1";
const defaultState = { first:"", second:"", visited:[], layers:[], compare:"territorio", quiz:{ index:0, firstTry:0, answers:[], complete:false } };

function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved ? { ...defaultState, ...saved, quiz:{ ...defaultState.quiz, ...(saved.quiz || {}) } } : JSON.parse(JSON.stringify(defaultState));
  }catch(_error){ return JSON.parse(JSON.stringify(defaultState)); }
}
let state = loadState();
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

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
function setNav(open){
  nav.hidden = !open; navToggle.setAttribute("aria-expanded", String(open)); document.body.classList.toggle("locked", open);
  if(open) navClose.focus(); else navToggle.focus();
}
navToggle.addEventListener("click", () => setNav(nav.hidden));
navClose.addEventListener("click", () => setNav(false));
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => { nav.hidden = true; navToggle.setAttribute("aria-expanded","false"); document.body.classList.remove("locked"); }));

const tracked = [...document.querySelectorAll(".tracked")];
const journeyState = document.querySelector("#journey-state");
function updateJourney(){ journeyState.textContent = `${state.visited.length} / ${tracked.length} tappe`; }
updateJourney();
if("IntersectionObserver" in window){
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    const name = entry.target.dataset.track;
    if(!state.visited.includes(name)){ state.visited.push(name); saveState(); updateJourney(); }
  }), { threshold:.28 });
  tracked.forEach(section => observer.observe(section));
}

function updateProgress(){
  const total = document.documentElement.scrollHeight - innerHeight;
  document.querySelector("#progress-bar").style.width = `${total > 0 ? Math.min(100, (scrollY / total) * 100) : 0}%`;
}
addEventListener("scroll", updateProgress, { passive:true });
addEventListener("resize", updateProgress); updateProgress();

const layerLabels = {
  registri:"I registri separano e collegano le azioni: la vittoria diventa una sequenza ordinata.",
  scala:"La gerarchia sociale diventa immediatamente una differenza di dimensione.",
  posizione:"Alto e centro concentrano l’esito politico della scena.",
  gesto:"I vincitori avanzano compatti; i vinti sono spogliati, feriti e condotti.",
  persone:"La ripetizione organizza soldati e prigionieri come gruppi; il capo emerge come individuo."
};
const readerNote = document.querySelector("#reader-note");
function syncLayers(){
  document.querySelectorAll("[data-layer]").forEach(layer => layer.classList.toggle("active", state.layers.includes(layer.dataset.layer)));
  document.querySelectorAll("[data-layer-button]").forEach(button => button.setAttribute("aria-pressed", String(state.layers.includes(button.dataset.layerButton))));
  readerNote.textContent = state.layers.length ? state.layers.map(key => layerLabels[key]).join(" ") : "Attiva un livello: potrai anche combinarne più di uno.";
}
document.querySelectorAll("[data-layer-button]").forEach(button => button.addEventListener("click", () => {
  const key = button.dataset.layerButton;
  state.layers = state.layers.includes(key) ? state.layers.filter(item => item !== key) : [...state.layers, key];
  saveState(); syncLayers();
}));
syncLayers();

const comparison = {
  territorio:{ mesoTitle:"Pluralità politica", mesoCopy:"Città-Stato e regni si formano, competono, si alleano e vengono assorbiti da poteri più vasti. “Mesopotamia” è un’area storica, non un unico Stato continuo.", egyptTitle:"Regno territoriale", egyptCopy:"La valle del Nilo favorisce forme di integrazione territoriale durature, pur attraversate da crisi, divisioni, conquiste e trasformazioni dinastiche." },
  sovrano:{ mesoTitle:"Re fra città, templi e imperi", mesoCopy:"Le figure del potere cambiano fra città sumeriche, regni accadici, Babilonia e imperi successivi. Autorità politica e rapporto con gli dèi si legittimano in forme non identiche.", egyptTitle:"Faraone e maat", egyptCopy:"Il re è mediatore indispensabile dell’ordine, chiamato maat: una funzione cosmica, politica e rituale che attraversa dinastie diverse senza renderle tutte uguali." },
  tempo:{ mesoTitle:"Rotture e rifondazioni", mesoCopy:"La memoria del potere convive con guerre, cadute di città e nuove dinastie. Iscrizioni e monumenti affermano spesso che il sovrano ha ristabilito un ordine minacciato.", egyptTitle:"Continuità rappresentata", egyptCopy:"Il linguaggio regale insiste sulla continuità e sulla ripetizione rituale. Le crisi esistono, ma l’immagine tende a ricomporle dentro una durata ideale." },
  monumento:{ mesoTitle:"Tempio, palazzo, stele", mesoCopy:"Ziggurat, complessi templari, palazzi e stele articolano il rapporto fra città, divinità, amministrazione e conquista; materiali e forme mutano secondo luoghi ed epoche.", egyptTitle:"Tomba, tempio, paesaggio", egyptCopy:"Complessi funerari e templi collegano la regalità al ciclo divino, alla memoria e al territorio. La pietra rende la durata un’esperienza fisica." }
};
function renderComparison(key){
  const data = comparison[key]; if(!data) return;
  state.compare = key; saveState();
  document.querySelector("#meso-title").textContent = data.mesoTitle; document.querySelector("#meso-copy").textContent = data.mesoCopy;
  document.querySelector("#egypt-title").textContent = data.egyptTitle; document.querySelector("#egypt-copy").textContent = data.egyptCopy;
  document.querySelectorAll("[data-compare]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.compare === key)));
}
document.querySelectorAll("[data-compare]").forEach(button => button.addEventListener("click", () => renderComparison(button.dataset.compare)));
renderComparison(state.compare);

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
let lightboxScale = 1; let lightboxTrigger = null;
function setLightboxScale(value){ lightboxScale = Math.max(.7, Math.min(3.2, value)); lightboxImage.style.transform = `scale(${lightboxScale})`; }
function openLightbox(trigger){
  lightboxTrigger = trigger; lightboxImage.src = trigger.dataset.image; lightboxCaption.textContent = trigger.dataset.caption || "Opera ingrandita";
  lightbox.hidden = false; document.body.classList.add("locked"); setLightboxScale(1); lightboxClose.focus();
}
function closeLightbox(){ lightbox.hidden = true; lightboxImage.src = ""; document.body.classList.remove("locked"); if(lightboxTrigger) lightboxTrigger.focus(); }
document.querySelectorAll("[data-image]").forEach(button => button.addEventListener("click", () => openLightbox(button)));
lightboxClose.addEventListener("click", closeLightbox);
document.querySelectorAll("[data-zoom]").forEach(button => button.addEventListener("click", () => {
  const action = button.dataset.zoom; setLightboxScale(action === "in" ? lightboxScale + .3 : action === "out" ? lightboxScale - .3 : 1);
}));
lightbox.addEventListener("click", event => { if(event.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", event => {
  if(event.key === "Escape" && !lightbox.hidden) closeLightbox();
  else if(event.key === "Escape" && !nav.hidden) setNav(false);
  if(event.key === "Tab" && !lightbox.hidden){
    const focusable = [...lightbox.querySelectorAll("button")]; const first = focusable[0]; const last = focusable[focusable.length - 1];
    if(event.shiftKey && document.activeElement === first){ event.preventDefault(); last.focus(); }
    else if(!event.shiftKey && document.activeElement === last){ event.preventDefault(); first.focus(); }
  }
});

const quiz = [
  { q:"Perché l’immagine diventa uno strumento politico con la nascita dello Stato?", options:["Perché sostituisce completamente la scrittura","Perché rende pubblici e memorabili ruoli, gerarchie e origini dell’autorità","Perché ogni artista diventa un funzionario"], answer:1, ok:"Esatto. L’immagine organizza visivamente l’ordine e lo collega a istituzioni che durano oltre le relazioni personali.", recovery:"Città e Stati devono coordinare persone che non si conoscono direttamente. Monumenti e immagini rendono riconoscibili ruoli, gerarchie e fondamenti dell’autorità.", retry:{q:"Quale funzione nuova assume soprattutto l’immagine pubblica?",options:["Rendere riconoscibile l’ordine istituzionale","Eliminare ogni conflitto sociale"],answer:0}},
  { q:"Che cosa comunica la scala gerarchica?", options:["La distanza reale fra le persone","La maggiore età del sovrano","Il rango attraverso la differenza di dimensione"], answer:2, ok:"Esatto. La grandezza del corpo non descrive la distanza ottica: traduce una differenza di rango.", recovery:"Nello Stendardo di Ur e nella Tavoletta di Narmer, la figura dominante appare più grande anche quando condivide la scena con altre persone.", retry:{q:"Se il re è grande il doppio dei funzionari, quale lettura è più fondata?",options:["Occupa un rango superiore","Si trova necessariamente più vicino allo spettatore"],answer:0}},
  { q:"Nella Stele di Hammurabi, quale rapporto costruiscono rilievo e scrittura?", options:["La scena divina legittima l’autorità del testo giuridico","Il rilievo serve soltanto a riempire lo spazio","L’immagine dimostra l’uguaglianza moderna davanti alla legge"], answer:0, ok:"Esatto. La scena fra Shamash e Hammurabi presenta la giustizia regale come parte di un ordine superiore.", recovery:"Prima della lunga iscrizione, Hammurabi compare davanti a Shamash. L’immagine orienta la lettura politica del testo, che distingue anche le persone secondo lo status.", retry:{q:"Perché Shamash compare sopra il testo?",options:["Per collegare la giustizia regale a un ordine divino","Per mostrare chi ha materialmente inciso ogni segno"],answer:0}},
  { q:"Quale confronto fra Mesopotamia ed Egitto evita una falsa equivalenza?", options:["Entrambe furono culture immobili","La Mesopotamia conobbe molte formazioni politiche; l’Egitto sviluppò una più durevole integrazione territoriale","Solo l’Egitto collegò politica e religione"], answer:1, ok:"Esatto. Vi sono problemi comuni, ma geografie politiche, cronologie e soluzioni istituzionali differenti.", recovery:"“Mesopotamia” raccoglie città, regni e imperi diversi; l’Egitto sviluppò una forte continuità territoriale, senza essere però immobile o privo di crisi.", retry:{q:"Quale frase è storicamente più prudente?",options:["Due civiltà identiche nate nello stesso modo","Due aree con problemi comuni e soluzioni differenti"],answer:1}},
  { q:"Qual è il valore politico della monumentalità?", options:["Dimostrare che ogni lavoratore era schiavo","Rendere percepibili capacità organizzativa, durata e controllo delle risorse","Produrre edifici privi di funzione rituale"], answer:1, ok:"Esatto. Il monumento fa sperimentare la forza coordinatrice dello Stato e proietta il potere nel tempo.", recovery:"Un grande complesso richiede risorse, competenze e coordinamento. La sua scala rende visibile questa capacità e stabilizza la memoria del sovrano.", retry:{q:"Che cosa rende immediatamente percepibile una piramide?",options:["La capacità di coordinare lavoro e risorse nel tempo","L’assenza di un’amministrazione"],answer:0}},
  { q:"Quale uso del passato è più corretto davanti a una fotografia politica contemporanea?", options:["Dire che ogni fotografia è identica a una stele antica","Usare domande su centro, scala e assenze senza cancellare le differenze storiche","Concludere che ogni immagine pubblica è propaganda"], answer:1, ok:"Esatto. Le antiche opere affinano domande critiche, ma non autorizzano equivalenze automatiche.", recovery:"Le forme e le istituzioni cambiano radicalmente. Possiamo ereditare strumenti di osservazione — posizione, inquadratura, gerarchia — senza dichiarare identiche immagini lontane millenni.", retry:{q:"Che cosa può sopravvivere senza rendere identiche le epoche?",options:["La domanda su come la forma costruisce autorità","La funzione precisa di ogni monumento"],answer:0}}
];
const quizPanel = document.querySelector("#quiz-panel");
const quizSummary = document.querySelector("#quiz-summary");
const quizCount = document.querySelector("#quiz-count");
const quizMeter = document.querySelector("#quiz-meter");

function updateQuizHeader(){
  const current = Math.min(state.quiz.index + 1, quiz.length);
  quizCount.textContent = state.quiz.complete ? "Percorso completato" : `Domanda ${current} di ${quiz.length}`;
  quizMeter.style.width = `${(state.quiz.complete ? 1 : state.quiz.index / quiz.length) * 100}%`;
}
function nextQuestion(firstTry){
  state.quiz.answers.push({ index:state.quiz.index, firstTry }); if(firstTry) state.quiz.firstTry += 1;
  state.quiz.index += 1; if(state.quiz.index >= quiz.length) state.quiz.complete = true; saveState(); renderQuiz();
}
function renderOptions(container, options, handler){
  const wrap = document.createElement("div"); wrap.className = "quiz-options";
  options.forEach((option,index) => { const button = document.createElement("button"); button.type="button"; button.textContent=option; button.addEventListener("click",()=>handler(index,wrap)); wrap.append(button); });
  container.append(wrap);
}
function renderRecovery(item){
  quizPanel.innerHTML = "";
  const card = document.createElement("article"); card.className="quiz-card recovery-card";
  card.innerHTML = `<p class="recovery-label">Recupero mirato</p><h3>${item.retry.q}</h3>`;
  renderOptions(card,item.retry.options,(choice,wrap)=>{
    wrap.querySelectorAll("button").forEach(button=>button.disabled=true);
    const feedback=document.createElement("div"); feedback.className="quiz-feedback";
    if(choice===item.retry.answer){ feedback.innerHTML=`<h4>Collegamento recuperato.</h4><p>Ora la distinzione è chiara: puoi proseguire senza aver ricevuto soltanto una soluzione da memorizzare.</p><div class="quiz-actions"><button type="button" data-next>Continua →</button></div>`; feedback.querySelector("[data-next]").addEventListener("click",()=>nextQuestion(false)); }
    else{ feedback.innerHTML=`<h4>Fermiamoci sul rapporto.</h4><p>${item.recovery} Rileggi questa spiegazione, poi riprova la domanda di recupero.</p><div class="quiz-actions"><button type="button" data-retry>Riprova</button></div>`; feedback.querySelector("[data-retry]").addEventListener("click",()=>renderRecovery(item)); }
    card.append(feedback);
  });
  quizPanel.append(card); card.focus?.();
}
function renderQuestion(){
  const item=quiz[state.quiz.index]; quizPanel.innerHTML="";
  const card=document.createElement("article"); card.className="quiz-card"; card.innerHTML=`<p class="question-no">${String(state.quiz.index+1).padStart(2,"0")}</p><h3>${item.q}</h3>`;
  renderOptions(card,item.options,(choice,wrap)=>{
    wrap.querySelectorAll("button").forEach(button=>button.disabled=true);
    const feedback=document.createElement("div"); feedback.className="quiz-feedback";
    if(choice===item.answer){ feedback.innerHTML=`<h4>Risposta fondata.</h4><p>${item.ok}</p><div class="quiz-actions"><button type="button" data-next>Continua →</button></div>`; feedback.querySelector("[data-next]").addEventListener("click",()=>nextQuestion(true)); }
    else{ feedback.innerHTML=`<h4>La relazione non è ancora precisa.</h4><p>${item.recovery}</p><div class="quiz-actions"><button type="button" data-recovery>Apri il recupero mirato</button></div>`; feedback.querySelector("[data-recovery]").addEventListener("click",()=>renderRecovery(item)); }
    card.append(feedback);
  });
  quizPanel.append(card);
}
function renderSummary(){
  quizPanel.innerHTML=""; quizSummary.hidden=false;
  quizSummary.innerHTML=`<h3>Percorso completato.</h3><p>Hai risposto correttamente al primo tentativo a <b>${state.quiz.firstTry} domande su ${quiz.length}</b>. Gli eventuali errori sono stati trasformati in recuperi mirati: il dato importante non è il punteggio isolato, ma la capacità di collegare società, forma e potere.</p><button type="button" id="quiz-restart">Ricomincia la verifica</button>`;
  document.querySelector("#quiz-restart").addEventListener("click",()=>{ state.quiz={...defaultState.quiz}; saveState(); renderQuiz(); });
}
function renderQuiz(){
  quizSummary.hidden=true; updateQuizHeader();
  if(state.quiz.complete || state.quiz.index>=quiz.length){ state.quiz.complete=true; saveState(); renderSummary(); } else renderQuestion();
}
renderQuiz();

if("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
