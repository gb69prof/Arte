const STORAGE_KEY = "storia-sguardo-04-progress-v1";
const defaultState = {
  first: "", second: "", visited: [], layersActive: [], layersSeen: [],
  comparison: { face: "republic", trait: "" },
  quiz: { index: 0, firstTry: 0, answers: [], recoveries: 0, mode: "question", complete: false }
};

function cloneDefault(){ return JSON.parse(JSON.stringify(defaultState)); }
function loadState(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved ? {
      ...cloneDefault(), ...saved,
      comparison: { ...defaultState.comparison, ...(saved.comparison || {}) },
      quiz: { ...defaultState.quiz, ...(saved.quiz || {}) }
    } : cloneDefault();
  }catch(_error){ return cloneDefault(); }
}
let state = loadState();
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch(_error){ /* La lezione resta utilizzabile anche senza spazio locale. */ }
}

const firstNote = document.querySelector("#first-note");
const secondNote = document.querySelector("#second-note");
const firstMemory = document.querySelector("#first-memory");
const firstSide = document.querySelector("#first-side");
const secondSide = document.querySelector("#second-side");
function renderNotes(){
  firstNote.value = state.first;
  secondNote.value = state.second;
  firstMemory.textContent = state.first || "Non hai ancora scritto nulla.";
  firstSide.textContent = state.first || "—";
  secondSide.textContent = state.second || "—";
}
renderNotes();
document.querySelector("#save-first").addEventListener("click", () => {
  state.first = firstNote.value.trim(); saveState(); renderNotes();
  document.querySelector("#saved-first").textContent = state.first ? "Primo sguardo conservato su questo dispositivo." : "Scrivi almeno un’osservazione prima di salvare.";
});
document.querySelector("#save-second").addEventListener("click", () => {
  state.second = secondNote.value.trim(); saveState(); renderNotes();
  document.querySelector("#saved-second").textContent = state.second ? "Rilettura conservata su questo dispositivo." : "La rilettura è ancora vuota.";
});

const nav = document.querySelector("#chapter-nav");
const navToggle = document.querySelector("#nav-toggle");
const navClose = document.querySelector("#nav-close");
let navReturn = null;
function setNav(open){
  nav.hidden = !open;
  navToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("locked", open);
  if(open){ navReturn = document.activeElement; navClose.focus(); }
  else if(navReturn){ navReturn.focus(); }
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
  }), { threshold: .2 });
  tracked.forEach(section => observer.observe(section));
}
function updateProgress(){
  const total = document.documentElement.scrollHeight - innerHeight;
  document.querySelector("#progress-bar").style.width = `${total > 0 ? Math.min(100, (scrollY / total) * 100) : 0}%`;
}
addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress); updateProgress();

const layerText = {
  axis: "L’asse devia verso la gamba portante; bacino e spalle rispondono come nel contrapposto. L’equilibrio fa apparire il comando naturale e non costretto.",
  model: "La costruzione policletea viene citata, non copiata passivamente: il corpo ideale dell’atleta diventa il supporto credibile di un’autorità politica.",
  face: "Volto e acconciatura appartengono a un tipo riconoscibile. La giovinezza apparente sottrae Augusto all’invecchiamento e stabilizza l’immagine del regime.",
  gesture: "Il braccio sollevato richiama l’adlocutio, il discorso alle truppe. Non registra un istante casuale: assegna allo spettatore la posizione di chi deve ascoltare.",
  cuirass: "La corazza non si limita a proteggere. Le sue figure inseriscono la restituzione delle insegne partiche in un cosmo ordinato, facendo apparire diplomazia e vittoria come destino.",
  divine: "Piedi nudi e Cupido sul delfino avvicinano il principe alla sfera eroica; il richiamo a Venere rende la genealogia della gens Iulia parte visibile della legittimazione.",
  colour: "Marmo, pigmenti e possibili dettagli dorati producevano una presenza diversa dal bianco attuale. Le ricostruzioni cromatiche restano ipotesi fondate su tracce, non copie certe dell’aspetto originario.",
  network: "La statua rinvenuta nella villa di Livia appartiene a una rete di tipi, varianti e contesti. Officine, committenti e pubblici locali rendono l’immagine imperiale riconoscibile senza renderla identica ovunque."
};
const readerNote = document.querySelector("#reader-note");
const layerProgress = document.querySelector("#layer-progress");
function syncLayers(){
  document.querySelectorAll("[data-overlay]").forEach(group => group.classList.toggle("active", state.layersActive.includes(group.dataset.overlay)));
  document.querySelectorAll("[data-layer-button]").forEach(button => button.setAttribute("aria-pressed", String(state.layersActive.includes(button.dataset.layerButton))));
  readerNote.textContent = state.layersActive.length ? state.layersActive.map(key => layerText[key]).join(" ") : "Attiva un livello per cominciare a scomporre l’immagine.";
  layerProgress.textContent = `${state.layersSeen.length} / ${Object.keys(layerText).length} livelli osservati`;
}
document.querySelectorAll("[data-layer-button]").forEach(button => button.addEventListener("click", () => {
  const key = button.dataset.layerButton;
  state.layersActive = state.layersActive.includes(key) ? state.layersActive.filter(item => item !== key) : [...state.layersActive, key];
  if(!state.layersSeen.includes(key)) state.layersSeen.push(key);
  saveState(); syncLayers();
}));
syncLayers();

const faces = {
  republic: { image:"assets/images/republican-portrait.webp", alt:"Ritratto tardo-repubblicano selezionato per il confronto", title:"Il tempo come autorità" },
  augustus: { image:"assets/images/augustus-prima-porta.webp", alt:"Volto giovane di Augusto selezionato per il confronto", title:"La giovinezza come stabilità" },
  constantine: { image:"assets/images/constantine-colossus.webp", alt:"Volto colossale di Costantino selezionato per il confronto", title:"La scala come distanza" }
};
const traitText = {
  republic: {
    dato:"Rughe e volumi derivano da un volto possibile, ma non sappiamo quanto corrispondano a ogni dettaglio biologico del soggetto.",
    selezione:"È la categoria decisiva: età, guance scavate e tensione sono accentuate per rendere visibili esperienza e disciplina.",
    rango:"Il ritratto presuppone mezzi, memoria familiare e accesso alla rappresentazione; non è il volto indifferenziato di tutta la società.",
    idealizzazione:"Qui l’ideale non coincide con la bellezza giovane: anche la severità può diventare un modello culturale costruito.",
    divinizzazione:"Non è l’elemento dominante. Confonderla con il rango farebbe perdere la specificità del linguaggio repubblicano.",
    monumentalita:"La testa è a scala umana; l’autorità nasce soprattutto dal trattamento dei tratti, non dalla grandezza fisica."
  },
  augustus: {
    dato:"Alcuni tratti rendono Augusto riconoscibile, ma il volto non registra neutralmente l’età reale che avanza.",
    selezione:"Il tipo conserva ciò che serve alla continuità: acconciatura, proporzioni e giovinezza diventano elementi replicabili.",
    rango:"Corazza, gesto, mantello e collocazione trasformano il ritratto individuale in un ruolo pubblico superiore.",
    idealizzazione:"È centrale: il volto eternamente giovane e il corpo policleteo presentano un ordine politico come equilibrio naturale.",
    divinizzazione:"Cupido, Venere e piedi nudi aprono una dimensione eroica e genealogica, senza trasformare semplicemente la statua in un dio.",
    monumentalita:"La statua supera la scala naturale, ma resta vicina a un corpo credibile; la monumentalità non annulla ancora il naturalismo."
  },
  constantine: {
    dato:"Il volto conserva segni riconoscibili, ma occhi, superfici e proporzioni non mirano a una trascrizione fisiognomica minuta.",
    selezione:"Gli elementi sono ridotti e ingranditi per produrre frontalità, fissità e una visione a distanza.",
    rango:"La collocazione nella basilica e il corpo seduto di dimensioni enormi fanno coincidere la presenza sovrana con lo spazio istituzionale.",
    idealizzazione:"L’ideale non è più soprattutto atletico: è una presenza immobile, sovrumana e sottratta alla contingenza.",
    divinizzazione:"La figura appare simile a un dio terreno; nel nuovo contesto cristiano il linguaggio imperiale viene trasformato, non cancellato all’istante.",
    monumentalita:"È la categoria dominante: una testa alta più di due metri apparteneva a un corpo di circa dieci o dodici metri, ormai quasi architettura."
  }
};
const faceTabs = [...document.querySelectorAll("[data-face]")];
const compareImage = document.querySelector("#compare-image");
const compareTitle = document.querySelector("#compare-title");
const traitFeedback = document.querySelector("#trait-feedback");
function renderComparison(moveFocus = false){
  const key = faces[state.comparison.face] ? state.comparison.face : "republic";
  state.comparison.face = key;
  faceTabs.forEach(tab => {
    const active = tab.dataset.face === key;
    tab.setAttribute("aria-selected", String(active)); tab.tabIndex = active ? 0 : -1;
    if(active && moveFocus) tab.focus();
  });
  compareImage.src = faces[key].image; compareImage.alt = faces[key].alt; compareTitle.textContent = faces[key].title;
  document.querySelectorAll("[data-trait]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.trait === state.comparison.trait)));
  traitFeedback.textContent = state.comparison.trait ? traitText[key][state.comparison.trait] : "Seleziona una categoria e osserva come un tratto visibile viene trasformato in un’affermazione pubblica.";
  saveState();
}
faceTabs.forEach((tab,index) => {
  tab.addEventListener("click", () => { state.comparison.face = tab.dataset.face; state.comparison.trait = ""; renderComparison(); });
  tab.addEventListener("keydown", event => {
    if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
    event.preventDefault(); let next=index;
    if(event.key==="ArrowLeft") next=(index-1+faceTabs.length)%faceTabs.length;
    if(event.key==="ArrowRight") next=(index+1)%faceTabs.length;
    if(event.key==="Home") next=0; if(event.key==="End") next=faceTabs.length-1;
    state.comparison.face=faceTabs[next].dataset.face; state.comparison.trait=""; renderComparison(true);
  });
});
document.querySelectorAll("[data-trait]").forEach(button => button.addEventListener("click", () => {
  state.comparison.trait = button.dataset.trait; renderComparison();
}));
renderComparison();

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxStage = document.querySelector(".lightbox-stage");
const lightboxClose = document.querySelector(".lightbox-close");
let lightboxScale = 1;
let lightboxTrigger = null;
let pinchStart = null;
function setLightboxScale(value){
  lightboxScale = Math.max(.7, Math.min(3.5, value));
  lightboxImage.style.transform = `scale(${lightboxScale})`;
  lightbox.querySelector('[data-zoom="reset"]').textContent = `${Math.round(lightboxScale * 100)}%`;
}
function openLightbox(trigger){
  lightboxTrigger = trigger;
  lightboxImage.src = trigger.dataset.image;
  lightboxImage.alt = trigger.closest("section,article,figure")?.querySelector("img")?.alt || "Opera ingrandita";
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
}, { passive:false });
function touchDistance(touches){ const [a,b]=touches; return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY); }
lightboxStage.addEventListener("touchstart", event => {
  if(event.touches.length===2) pinchStart={distance:touchDistance(event.touches),scale:lightboxScale};
}, { passive:true });
lightboxStage.addEventListener("touchmove", event => {
  if(!pinchStart || event.touches.length!==2) return;
  event.preventDefault(); setLightboxScale(pinchStart.scale*touchDistance(event.touches)/pinchStart.distance);
}, { passive:false });
lightboxStage.addEventListener("touchend", () => { pinchStart=null; }, { passive:true });

function trapFocus(event, container){
  const focusable=[...container.querySelectorAll('a[href],button:not([disabled]),textarea,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.hidden);
  if(!focusable.length) return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(event.shiftKey && document.activeElement===first){ event.preventDefault(); last.focus(); }
  else if(!event.shiftKey && document.activeElement===last){ event.preventDefault(); first.focus(); }
}
document.addEventListener("keydown", event => {
  if(event.key==="Escape" && !lightbox.hidden){ closeLightbox(); return; }
  if(event.key==="Escape" && !nav.hidden){ setNav(false); return; }
  if(event.key==="Tab" && !lightbox.hidden){ trapFocus(event,lightbox); return; }
  if(event.key==="Tab" && !nav.hidden) trapFocus(event,nav);
});

const quiz = [
  {
    q:"Che cosa accade al modello corporeo greco quando entra nell’immagine imperiale romana?",
    options:["Viene copiato senza modifiche","Viene tradotto: equilibrio e idealizzazione sostengono gesto, rango e comando","Scompare perché Roma rifiuta l’arte greca"],answer:1,
    ok:"La forma policletea resta riconoscibile, ma cambia funzione dentro un sistema politico e monumentale nuovo.",
    recovery:"Il Doriforo costruisce un corpo-modello; Augusto usa quella credibilità formale per rendere naturale una presenza pubblica.",link:"#dopo-misura",linkText:"Rivedi il passaggio dal Doriforo ad Augusto",
    retry:{q:"Quale parola descrive meglio il passaggio?",options:["Traduzione culturale","Riproduzione fotografica"],answer:0,ok:"Roma seleziona e ricontestualizza il modello greco."}
  },
  {
    q:"Perché l’Ellenismo non può essere definito semplicemente decadenza dell’arte classica?",
    options:["Perché conserva una sola formula classica","Perché amplia soggetti e possibilità espressive in società connesse e cosmopolite","Perché elimina ogni misura"],answer:1,
    ok:"Movimento, sofferenza, età e alterità acquistano nuove possibilità senza diventare caratteristiche obbligatorie di ogni opera.",
    recovery:"Il Galata mostra pathos e sconfitta, ma la varietà ellenistica non si riduce a un unico stile emotivo.",link:"#ellenismo",linkText:"Torna al Galata morente",
    retry:{q:"Il pathos ellenistico è…",options:["Una possibilità espressiva, non una regola per tutte le opere","La prova che gli artisti non conoscono più l’equilibrio"],answer:0,ok:"L’Ellenismo moltiplica le scelte disponibili."}
  },
  {
    q:"Perché il cosiddetto ritratto veristico non è una fotografia neutrale?",
    options:["Perché ogni volto romano è inventato da zero","Perché seleziona e accentua tratti capaci di comunicare valori sociali","Perché le rughe non esistevano"],answer:1,
    ok:"Età, magrezza e tensione possono rendere visibili esperienza, disciplina e adesione ai valori degli antenati.",
    recovery:"Un tratto può partire dall’osservazione e, nello stesso tempo, essere scelto per costruire autorità.",link:"#antenati",linkText:"Rileggi il volto degli antenati",
    retry:{q:"Che cosa trasforma una ruga in un segno politico?",options:["L’associazione culturale con esperienza e disciplina","La certezza sul carattere psicologico del soggetto"],answer:0,ok:"Il valore nasce da una convenzione condivisa, non da una diagnosi."}
  },
  {
    q:"Perché Augusto non si presenta semplicemente come un re?",
    options:["Perché non possiede alcun potere militare","Perché concentra poteri eccezionali conservando forme e lessico repubblicani","Perché il Senato scompare nel 27 a.C."],answer:1,
    ok:"Il principato rende accettabile una posizione superiore presentandola come restaurazione dell’ordine repubblicano.",
    recovery:"Il nuovo sistema mantiene magistrature e Senato, ma il princeps controlla eserciti, risorse e province strategiche.",link:"#principato",linkText:"Riapri il passaggio al principato",
    retry:{q:"Quale tensione definisce il principato augusteo?",options:["Forme repubblicane e potere concentrato","Assenza totale di istituzioni"],answer:0,ok:"L’immagine deve rendere stabile proprio questa tensione."}
  },
  {
    q:"Perché Augusto appare eternamente giovane?",
    options:["Perché tutte le statue furono scolpite quando era ragazzo","Perché il tipo ufficiale privilegia continuità, equilibrio e stabilità oltre l’età reale","Perché i Romani non sapevano rappresentare la vecchiaia"],answer:1,
    ok:"La giovinezza è una scelta ideologica coerente con un’immagine di ordine sottratto al mutamento.",
    recovery:"Il confronto con i ritratti repubblicani mostra che Roma sa rendere l’età; nel volto augusteo sceglie diversamente.",link:"#augusto",linkText:"Smonta di nuovo il volto di Augusto",
    retry:{q:"La giovinezza di Augusto è soprattutto…",options:["Una costruzione del tipo ritrattistico","Un dato anagrafico invariabile"],answer:0,ok:"Il tipo rende riconoscibile un ruolo più che un momento biologico."}
  },
  {
    q:"Che cosa fanno insieme posa, gesto, corazza, piedi nudi e Cupido?",
    options:["Aggiungono dettagli decorativi indipendenti","Costruiscono una rete di comando, vittoria, genealogia e dimensione eroica","Raccontano la vita privata di Augusto"],answer:1,
    ok:"Il significato non risiede in un simbolo isolato: nasce dalla cooperazione controllata degli elementi.",
    recovery:"Ogni livello dell’opera orienta lo spettatore verso una qualità pubblica diversa e le collega in un’unica presenza.",link:"#augusto",linkText:"Riattiva i livelli dell’Augusto",
    retry:{q:"Come va letta la statua?",options:["Come un sistema di relazioni","Come una somma casuale di accessori"],answer:0,ok:"Il programma funziona perché corpo, attributi e pubblico agiscono insieme."}
  },
  {
    q:"Come circola l’immagine imperiale nelle province?",
    options:["Attraverso copie sempre identiche imposte soltanto dal centro","Attraverso modelli riconoscibili adattati da officine, città ed élite locali","Soltanto quando l’imperatore visita una città"],answer:1,
    ok:"Centro e contesti locali costruiscono insieme una comunicazione gerarchica ma non perfettamente uniforme.",
    recovery:"Statue, monete, iscrizioni e rituali possono servire la corte e, nello stesso tempo, le ambizioni delle élite locali.",link:"#circolazione",linkText:"Rivedi la rete delle immagini",
    retry:{q:"Quale dinamica è più corretta?",options:["Modello condiviso e adattamento locale","Uniformità assoluta"],answer:0,ok:"La riconoscibilità non elimina variazioni e negoziazioni."}
  },
  {
    q:"Quale realtà sociale sostiene anche le reti e i monumenti dell’impero?",
    options:["Soltanto il consenso spontaneo delle città","Guerra, tassazione, lavoro servile e gerarchie, insieme a infrastrutture e cittadinanza","Una completa uguaglianza fra centro e province"],answer:1,
    ok:"Strade, diritto e ampliamento della cittadinanza convivono con conquista, prelievo fiscale, schiavitù e profonde disuguaglianze.",
    recovery:"La comunicazione del potere non può essere separata dalle risorse e dai rapporti di forza che rendono possibili statue, fori, eserciti e cerimonie.",link:"#circolazione",linkText:"Rileggi conquista e sfruttamento",
    retry:{q:"Perché una lettura solo celebrativa delle infrastrutture è incompleta?",options:["Perché cancella costi, coercizione e differenze sociali","Perché le strade romane non collegavano alcuna città"],answer:0,ok:"Una rete può mettere in relazione territori e, nello stesso tempo, organizzare dominio e prelievo."}
  },
  {
    q:"Perché l’Ara Pacis non è un semplice ritratto di famiglia?",
    options:["Perché non contiene figure umane","Perché rito, magistrature, discendenza e successione trasformano la famiglia in ordine pubblico","Perché raffigura soltanto soldati"],answer:1,
    ok:"Donne, uomini e bambini partecipano a una processione che lega casa imperiale, religione e futuro dello Stato.",
    recovery:"Il fregio non coglie un incontro privato: dispone corpi e ruoli dentro una cerimonia civica e dinastica.",link:"#famiglia",linkText:"Segui di nuovo la processione",
    retry:{q:"Che cosa rende politico il gruppo?",options:["La relazione fra famiglia, rito e successione","La somiglianza con una fotografia domestica"],answer:0,ok:"La famiglia è presentata come garanzia dell’ordine futuro."}
  },
  {
    q:"Perché la Colonna Traiana non è una cronaca fotografica imparziale?",
    options:["Perché non mostra alcun fatto storico","Perché seleziona, ordina e rende necessaria la conquista dal punto di vista romano","Perché le figure sono tutte moderne"],answer:1,
    ok:"La ricchezza di dettagli produce verosimiglianza, ma il racconto resta costruito dal vincitore.",
    recovery:"Ripetizione di Traiano, sequenza delle azioni e collocazione nel foro trasformano la guerra in memoria celebrativa.",link:"#conquista",linkText:"Torna alla spirale della conquista",
    retry:{q:"La dignità concessa ad alcuni Daci…",options:["Non elimina la celebrazione della loro sconfitta","Rende il monumento neutrale"],answer:0,ok:"Un nemico autorevole può accrescere il valore della vittoria."}
  },
  {
    q:"Come va interpretata la frontalità colossale di Costantino?",
    options:["Soltanto come perdita di abilità tecnica","Come una diversa strategia che costruisce distanza e presenza sovrumana","Come ritorno esatto al Doriforo"],answer:1,
    ok:"Scala, occhi e semplificazione spostano l’autorità oltre il corpo naturale e preparano nuovi linguaggi sovrani.",
    recovery:"Il naturalismo classico non è l’unico criterio possibile: la forma tardoantica cerca un’efficacia politica e religiosa diversa.",link:"#colosso",linkText:"Riguarda il volto colossale",
    retry:{q:"Che cosa produce la scala sovrumana?",options:["Una presenza quasi architettonica","Una maggiore somiglianza fisiognomica"],answer:0,ok:"La monumentalità modifica il rapporto fisico con lo spettatore."}
  },
  {
    q:"In che senso alcuni problemi dell’immagine imperiale sopravvivono nella comunicazione politica successiva?",
    options:["Ogni ritratto moderno deriva direttamente da Roma","Riconoscibilità, ripetizione, gesto e controllo dell’età ricompaiono in sistemi storici diversi","Le immagini moderne rinunciano sempre all’idealizzazione"],answer:1,
    ok:"La lezione individua problemi ricorrenti senza costruire una discendenza unica e automatica fra Roma, monarchie e media contemporanei.",
    recovery:"Monete, ritratti di Stato, monumenti, fotografia, televisione e social hanno tecniche e pubblici differenti, ma continuano a negoziare la distanza fra persona e ruolo.",link:"#sopravvive",linkText:"Rivedi le sopravvivenze",
    retry:{q:"Quale confronto è storicamente più prudente?",options:["Seguire problemi visivi ricorrenti dentro contesti diversi","Dichiarare identiche tutte le immagini del potere"],answer:0,ok:"La continuità riguarda alcune domande, non un modello immutato."}
  }
];

const quizPanel=document.querySelector("#quiz-panel");
const quizSummary=document.querySelector("#quiz-summary");
const quizCount=document.querySelector("#quiz-count");
const quizMeter=document.querySelector("#quiz-meter");
function updateQuizHeader(){
  const current=Math.min(state.quiz.index+1,quiz.length);
  quizCount.textContent=state.quiz.complete?"Percorso completato":`${state.quiz.mode==="recovery"?"Recupero della domanda":"Domanda"} ${current} di ${quiz.length}`;
  quizMeter.value=state.quiz.complete?quiz.length:state.quiz.index;
  quizMeter.textContent=`${quizMeter.value} su ${quiz.length}`;
}
function nextQuestion(firstTry){
  state.quiz.answers.push({index:state.quiz.index,firstTry});
  if(firstTry) state.quiz.firstTry+=1;
  state.quiz.index+=1; state.quiz.mode="question";
  if(state.quiz.index>=quiz.length) state.quiz.complete=true;
  saveState(); renderQuiz();
}
function renderOptions(container,options,handler){
  const wrap=document.createElement("div"); wrap.className="quiz-options";
  options.forEach((option,index)=>{
    const button=document.createElement("button"); button.type="button"; button.textContent=option;
    button.addEventListener("click",()=>handler(index,wrap)); wrap.append(button);
  });
  container.append(wrap);
}
function focusCard(card){ card.tabIndex=-1; requestAnimationFrame(()=>card.focus()); }
function renderRecovery(item){
  state.quiz.mode="recovery"; saveState(); quizPanel.innerHTML="";
  const card=document.createElement("article"); card.className="quiz-card recovery-card";
  card.innerHTML=`<p class="recovery-label">Recupero mirato</p><h3>${item.retry.q}</h3><div class="quiz-feedback"><p>${item.recovery} <a href="${item.link}">${item.linkText}.</a></p></div>`;
  renderOptions(card,item.retry.options,(choice,wrap)=>{
    wrap.querySelectorAll("button").forEach(button=>{button.disabled=true;});
    const feedback=document.createElement("div"); feedback.className="quiz-feedback";
    if(choice===item.retry.answer){
      feedback.innerHTML=`<h4>Collegamento recuperato.</h4><p>${item.retry.ok}</p><div class="quiz-actions"><button type="button" data-next>Continua →</button></div>`;
      feedback.querySelector("[data-next]").addEventListener("click",()=>nextQuestion(false));
    }else{
      state.quiz.recoveries+=1; saveState();
      feedback.innerHTML=`<h4>La relazione non è ancora ricostruita.</h4><p>${item.recovery}</p><div class="quiz-actions"><button type="button" data-retry>Riprova con parole diverse</button></div>`;
      feedback.querySelector("[data-retry]").addEventListener("click",()=>renderRecovery(item));
    }
    card.append(feedback); feedback.querySelector("button")?.focus();
  });
  quizPanel.append(card); focusCard(card);
}
function renderQuestion(){
  const item=quiz[state.quiz.index]; quizPanel.innerHTML="";
  const card=document.createElement("article"); card.className="quiz-card";
  card.innerHTML=`<p class="question-no">${String(state.quiz.index+1).padStart(2,"0")}</p><h3>${item.q}</h3>`;
  renderOptions(card,item.options,(choice,wrap)=>{
    wrap.querySelectorAll("button").forEach(button=>{button.disabled=true;});
    const feedback=document.createElement("div"); feedback.className="quiz-feedback";
    if(choice===item.answer){
      feedback.innerHTML=`<h4>Risposta fondata.</h4><p>${item.ok}</p><div class="quiz-actions"><button type="button" data-next>Continua →</button></div>`;
      feedback.querySelector("[data-next]").addEventListener("click",()=>nextQuestion(true));
    }else{
      state.quiz.recoveries+=1; state.quiz.mode="recovery"; saveState();
      feedback.innerHTML=`<h4>La relazione non è ancora precisa.</h4><p>${item.recovery} <a href="${item.link}">${item.linkText}.</a></p><div class="quiz-actions"><button type="button" data-recovery>Apri il recupero mirato</button></div>`;
      feedback.querySelector("[data-recovery]").addEventListener("click",()=>renderRecovery(item));
    }
    card.append(feedback); feedback.querySelector("button")?.focus();
  });
  quizPanel.append(card); focusCard(card);
}
function renderSummary(){
  quizPanel.innerHTML=""; quizSummary.hidden=false;
  quizSummary.innerHTML=`<h3>Percorso completato.</h3><p>Hai risposto correttamente al primo tentativo a <b>${state.quiz.firstTry} domande su ${quiz.length}</b>. Hai affrontato <b>${state.quiz.recoveries} passaggi di recupero</b>. Il dato importante non è il punteggio isolato, ma la capacità di distinguere volto, tipo, ruolo e monumento, collegandoli alla società che li ha prodotti.</p><button type="button" id="quiz-restart">Ricomincia la verifica</button>`;
  document.querySelector("#quiz-restart").addEventListener("click",()=>{state.quiz={...defaultState.quiz};saveState();renderQuiz();});
}
function renderQuiz(){
  quizSummary.hidden=true; updateQuizHeader();
  if(state.quiz.complete||state.quiz.index>=quiz.length){state.quiz.complete=true;saveState();renderSummary();}
  else if(state.quiz.mode==="recovery") renderRecovery(quiz[state.quiz.index]);
  else renderQuestion();
}
renderQuiz();

if("serviceWorker" in navigator){
  addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
