const STORAGE_KEY = "storia-sguardo-07-state";

const defaultState = () => ({
  version: 1,
  openingNote: "",
  finalNote: "",
  visited: [],
  colorLayers: [],
  inhabitingStep: 0,
  spaceLayers: [],
  gestureFocus: "insieme",
  comparisonWork: "cimabue",
  comparisonCategory: "spazio",
  quiz: { index: 0, correctFirst: 0, errors: 0, recovered: 0, pendingRecovery: false, completed: false },
  completed: false
});

function safeState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  const text = value => typeof value === "string" ? value.slice(0, 12000) : "";
  const strings = value => Array.isArray(value) ? value.filter(item => typeof item === "string").slice(0, 30) : [];
  const number = (value, min, max) => Number.isInteger(value) ? Math.max(min, Math.min(max, value)) : min;
  const quiz = raw.quiz && typeof raw.quiz === "object" && !Array.isArray(raw.quiz) ? raw.quiz : {};
  return {
    ...base,
    openingNote: text(raw.openingNote),
    finalNote: text(raw.finalNote),
    visited: strings(raw.visited).filter(item => /^step-([1-9]|1[0-3])$/.test(item)),
    colorLayers: strings(raw.colorLayers).filter(item => ["masonry","arriccio","drawing","intonaco","pigment","secco"].includes(item)),
    inhabitingStep: number(raw.inhabitingStep, 0, 5),
    spaceLayers: strings(raw.spaceLayers).filter(item => ["architecture","ground","overlap","scale","axes"].includes(item)),
    gestureFocus: ["volti","mani","sguardi","postura","distanza","insieme"].includes(raw.gestureFocus) ? raw.gestureFocus : base.gestureFocus,
    comparisonWork: ["cimabue","duccio","giotto"].includes(raw.comparisonWork) ? raw.comparisonWork : base.comparisonWork,
    comparisonCategory: ["supporto","materia","oro","trono","spazio","corpo","peso","panneggio","sguardo","gesto","luce","gerarchia","angeli","funzione","committenza","spettatore","limite"].includes(raw.comparisonCategory) ? raw.comparisonCategory : base.comparisonCategory,
    quiz: {
      index: number(quiz.index, 0, 12),
      correctFirst: number(quiz.correctFirst, 0, 12),
      errors: number(quiz.errors, 0, 99),
      recovered: number(quiz.recovered, 0, 12),
      pendingRecovery: Boolean(quiz.pendingRecovery),
      completed: Boolean(quiz.completed)
    },
    completed: Boolean(raw.completed)
  };
}

function loadState() {
  try { return safeState(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch { return defaultState(); }
}

let state = loadState();
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { /* La lezione resta utilizzabile anche se lo storage è indisponibile. */ }
}

const esc = value => String(value).replace(/[&<>"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));

// Indice e avanzamento
const menu = document.querySelector("#chapterMenu");
const menuButton = document.querySelector("#menuButton");
const menuClose = document.querySelector("#menuClose");
const menuScrim = document.querySelector("#menuScrim");
let menuReturnFocus = null;

function setMenu(open) {
  menu.hidden = !open;
  menuScrim.hidden = !open;
  document.body.classList.toggle("menu-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  if (open) { menuReturnFocus = document.activeElement; menuClose.focus(); }
  else if (menuReturnFocus) menuReturnFocus.focus();
}
menuButton.addEventListener("click", () => setMenu(menu.hidden));
menuClose.addEventListener("click", () => setMenu(false));
menuScrim.addEventListener("click", () => setMenu(false));
menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));

const progress = document.querySelector("#readingProgress");
const progressText = document.querySelector("#progressText");
function updateProgress() {
  const count = new Set(state.visited.filter(id => /^step-([1-9]|1[0-3])$/.test(id))).size;
  progress.value = count;
  progressText.textContent = `${count} di 13 tappe`;
  document.querySelectorAll("[data-menu-step]").forEach(link => link.classList.toggle("is-visited", state.visited.includes(`step-${link.dataset.menuStep}`)));
}
updateProgress();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const key = `step-${entry.target.dataset.step}`;
    if (!state.visited.includes(key)) { state.visited.push(key); saveState(); updateProgress(); }
  });
}, { threshold: .32 });
document.querySelectorAll(".tracked[data-step]").forEach(section => observer.observe(section));

// Taccuini
const openingNote = document.querySelector("#openingNote");
const finalNote = document.querySelector("#finalNote");
const openingMemory = document.querySelector("#openingMemory");
openingNote.value = state.openingNote;
finalNote.value = state.finalNote;
function bindNote(input, key, statusNode) {
  let timer;
  input.addEventListener("input", () => {
    state[key] = input.value;
    if (key === "openingNote") openingMemory.textContent = input.value.trim() || "Non avevi ancora scritto un’annotazione.";
    clearTimeout(timer);
    statusNode.textContent = "Salvataggio…";
    timer = setTimeout(() => { saveState(); statusNode.textContent = "Salvato su questo dispositivo."; }, 250);
  });
}
bindNote(openingNote, "openingNote", document.querySelector("#openingSave"));
bindNote(finalNote, "finalNote", document.querySelector("#finalSave"));
openingMemory.textContent = state.openingNote.trim() || "Non avevi ancora scritto un’annotazione.";

// Sotto il colore
const materialData = [
  ["masonry","Muratura","Il supporto è architettura reale. Umidità, assestamenti e trasformazioni dell’edificio continuano a incidere sul dipinto."],
  ["arriccio","Arriccio","Uno strato d’intonaco più ruvido regolarizza la parete e prepara la superficie. Non è ancora il piano finale da dipingere."],
  ["drawing","Disegno","Linee preparatorie, incisioni e battiture trasferiscono e organizzano il progetto. La sinopia non è l’unico procedimento possibile."],
  ["intonaco","Giornata","L’intonaco fine viene steso soltanto sulla porzione che la squadra pensa di dipingere prima che asciughi: il tempo del lavoro resta nella parete."],
  ["pigment","Buon fresco","I pigmenti adatti, dispersi in acqua, vengono applicati sull’intonaco umido. La carbonatazione della calce li incorpora alla superficie."],
  ["secco","Finiture","Azzurri, lacche, dettagli e metalli possono richiedere leganti e applicazioni a secco. Sono spesso le parti più vulnerabili: ciò che vediamo è anche storia della conservazione."]
];
const materialButtons = document.querySelector("#materialButtons");
const materialReading = document.querySelector("#materialReading");
function renderMaterials(lastKey = state.colorLayers.at(-1)) {
  materialButtons.innerHTML = materialData.map(([key,label], index) => `<button type="button" data-material="${key}" aria-pressed="${state.colorLayers.includes(key)}" ${index > state.colorLayers.length ? "disabled" : ""}><span>${String(index + 1).padStart(2,"0")}</span> ${label}</button>`).join("");
  document.querySelectorAll(".wall-layer").forEach(layer => layer.classList.toggle("is-visible", state.colorLayers.includes([...layer.classList].find(name => materialData.some(item => item[0] === name)))));
  if (lastKey) {
    const item = materialData.find(([key]) => key === lastKey);
    if (item) materialReading.innerHTML = `<p><b>${esc(item[1])}.</b> ${esc(item[2])}</p><p>${state.colorLayers.length === materialData.length ? "La pittura è un sistema di strati, tempi e competenze: non il gesto solitario di un genio davanti a una parete vuota." : "Scopri lo strato successivo."}</p>`;
  }
  materialButtons.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    if (!state.colorLayers.includes(button.dataset.material)) state.colorLayers.push(button.dataset.material);
    saveState(); renderMaterials(button.dataset.material);
  }));
}
renderMaterials();

// Fai abitare la scena
const inhabitData = [
  ["ground-line","Appoggio","Un suolo implicito stabilisce dove il peso può scaricarsi. Le figure non galleggiano: ginocchia, giacigli e piedi hanno una relazione con il basso."],
  ["volume","Volume","Chiaroscuro e panneggio fanno percepire masse sotto il tessuto. Il corpo non è una sagoma riempita, ma un ingombro."],
  ["overlap-line","Sovrapposizione","Un corpo ne copre in parte un altro; ciò suggerisce anteriorità e distanza anche senza una griglia geometrica unica."],
  ["gaze","Sguardi","Le direzioni visive collegano figure separate e costruiscono il centro dell’azione."],
  ["gesture-line","Gesti","Braccia, inclinazioni e contatti trasformano i volumi in relazioni: l’azione diventa leggibile e il tempo entra nella scena."]
];
const inhabitButtons = document.querySelector("#inhabitButtons");
const inhabitReading = document.querySelector("#inhabitReading");
function renderInhabit(lastIndex = state.inhabitingStep - 1) {
  inhabitButtons.innerHTML = inhabitData.map(([,label], index) => `<button type="button" data-inhabit="${index}" aria-pressed="${index < state.inhabitingStep}" ${index > state.inhabitingStep ? "disabled" : ""}><span>${String(index + 1).padStart(2,"0")}</span> ${label}</button>`).join("");
  document.querySelectorAll("#inhabitStage .scene-overlay span").forEach(node => {
    const index = inhabitData.findIndex(([className]) => node.classList.contains(className));
    node.classList.toggle("is-visible", index >= 0 && index < state.inhabitingStep);
  });
  inhabitReading.innerHTML = state.inhabitingStep ? `<p><b>${esc(inhabitData[lastIndex][1])}.</b> ${esc(inhabitData[lastIndex][2])}</p><p>${state.inhabitingStep === 5 ? "La scena è ora abitabile perché ogni elemento agisce sugli altri. Nessun singolo espediente equivale alla futura prospettiva matematica." : "Aggiungi la relazione successiva."}</p>` : "<p>Comincia dall’appoggio: prima della profondità viene il peso.</p>";
  inhabitButtons.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    const index = Number(button.dataset.inhabit);
    if (index === state.inhabitingStep) state.inhabitingStep += 1;
    saveState(); renderInhabit(index);
  }));
}
renderInhabit();

// Laboratorio sullo spazio
const spaceData = {
  architecture:["Architettura","La porta stabilisce un luogo e una soglia. Le sue parti non convergono secondo un unico punto di fuga, ma rendono riconoscibile l’ambiente."],
  ground:["Suolo","L’allineamento dei piedi e il margine inferiore producono una base comune."],
  overlap:["Sovrapposizione","Le figure si coprono reciprocamente: una relazione semplice ma decisiva per ordinare i piani."],
  scale:["Scala","Le dimensioni restano in gran parte coerenti con la vicinanza percepita, senza dipendere da un calcolo uniforme."],
  axes:["Asse affettivo","L’abbraccio al centro organizza architettura, sguardi e folla. La relazione emotiva diventa anche struttura spaziale."]
};
const spaceButtons = document.querySelector("#spaceButtons");
const spaceReading = document.querySelector("#spaceReading");
function renderSpace(lastKey = state.spaceLayers.at(-1)) {
  spaceButtons.innerHTML = Object.entries(spaceData).map(([key,[label]]) => `<button type="button" data-space-button="${key}" aria-pressed="${state.spaceLayers.includes(key)}">${label}</button>`).join("");
  document.querySelectorAll(".space-overlay [data-space]").forEach(node => node.classList.toggle("is-visible", state.spaceLayers.includes(node.dataset.space)));
  if (lastKey && spaceData[lastKey]) spaceReading.innerHTML = `<p><b>${esc(spaceData[lastKey][0])}.</b> ${esc(spaceData[lastKey][1])}</p><p>${state.spaceLayers.length === Object.keys(spaceData).length ? "Lo spazio risulta coerente perché gli indizi concordano abbastanza da orientare il corpo e lo sguardo. Credibile non significa ancora geometricamente unificato." : "Puoi sovrapporre altri indizi."}</p>`;
  spaceButtons.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    const key = button.dataset.spaceButton;
    state.spaceLayers = state.spaceLayers.includes(key) ? state.spaceLayers.filter(item => item !== key) : [...state.spaceLayers, key];
    saveState(); renderSpace(key);
  }));
}
renderSpace();

// Gesto e sguardo
const gestureData = {
  volti:["Volti","Il confronto fra Cristo e Giuda concentra la tensione, ma i due volti acquistano significato dentro la pressione della folla."],
  mani:["Mani","Mani e braccia indicano, afferrano, colpiscono, trattengono. Rendono simultanee azioni diverse."],
  sguardi:["Sguardi","Gli occhi non sono soltanto espressione: tracciano vettori fra persone e orientano chi osserva."],
  postura:["Posture","L’avanzare di Giuda e la stabilità di Cristo trasformano l’incontro in opposizione fisica."],
  distanza:["Distanza","La distanza quasi annullata fra i due volti rende il tradimento intimo e pubblico nello stesso istante."],
  insieme:["Insieme","L’emozione non sta in un dettaglio isolato. Volto, mano, sguardo, postura e distanza funzionano come una sola struttura narrativa."]
};
const gestureButtons = document.querySelector("#gestureButtons");
const gestureReading = document.querySelector("#gestureReading");
const gestureStage = document.querySelector("#gestureStage");
function renderGesture() {
  if (!gestureData[state.gestureFocus]) state.gestureFocus = "insieme";
  gestureButtons.innerHTML = Object.keys(gestureData).map(key => `<button type="button" data-gesture="${key}" aria-pressed="${state.gestureFocus === key}">${gestureData[key][0]}</button>`).join("");
  gestureStage.classList.toggle("is-isolating", state.gestureFocus !== "insieme");
  document.querySelectorAll(".gesture-guides span").forEach(node => node.classList.toggle("is-visible", node.classList.contains(state.gestureFocus)));
  gestureReading.innerHTML = `<p><b>${esc(gestureData[state.gestureFocus][0])}.</b> ${esc(gestureData[state.gestureFocus][1])}</p>`;
  gestureButtons.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { state.gestureFocus = button.dataset.gesture; saveState(); renderGesture(); }));
}
renderGesture();

// Confronto delle Maestà
const comparisonWorks = {
  cimabue:{label:"Cimabue",title:"Maestà di Santa Trinita",date:"1290–1300 circa",src:"assets/images/cimabue-maesta.webp",width:782,height:1400,alt:"Cimabue, Maestà di Santa Trinita, Madonna in trono con angeli e profeti su fondo oro."},
  duccio:{label:"Duccio",title:"Madonna Rucellai",date:"1285 circa",src:"assets/images/duccio-rucellai.webp",width:981,height:1400,alt:"Duccio, Madonna Rucellai, Madonna in trono con angeli su fondo oro."},
  giotto:{label:"Giotto",title:"Maestà di Ognissanti",date:"1300–1305 circa",src:"assets/images/giotto-ognissanti.webp",width:995,height:1531,alt:"Giotto, Maestà di Ognissanti, Madonna in trono con angeli e santi."}
};
const comparisonCategories = {
  supporto:["Supporto","Tutte sono grandi tavole d’altare: lo spazio dipinto dipende da un oggetto reale, mobile e collocato in una chiesa.","Non confrontiamo tre finestre neutre sul mondo, ma tre presenze liturgiche."],
  materia:["Materia","Tempera, legno e oro chiedono preparazione, bottega e costo. La materia preziosa non scompare con il nuovo volume.","Naturalismo e splendore materiale non sono alternative obbligate."],
  oro:["Fondo oro","In tutte e tre le opere l’oro separa e rende presente il sacro; cambia il rapporto fra fondo, trono e corpi.","L’oro non prova l’assenza di spazio: può convivere con profondità locali."],
  trono:["Trono","Cimabue articola un’architettura obliqua; Duccio la trasforma in ritmo lineare; Giotto la rende una nicchia più massiccia.","Le differenze sono scelte, non voti in una gara."],
  spazio:["Profondità","Tutte costruiscono profondità mediante trono, sovrapposizione e scala. Giotto concentra maggiormente i volumi entro una nicchia.","Nessuna applica ancora un’unica prospettiva matematica."],
  corpo:["Corpo","Le figure hanno corpo in tutte e tre; Giotto accentua massa, ginocchia e torsione sotto i panni.","Dire che prima erano “piatte” cancella funzioni e differenze reali."],
  peso:["Peso","Cimabue e Duccio distribuiscono il peso in una forma fortemente gerarchica; Giotto insiste sull’appoggio monumentale della Vergine.","Il peso è anche significato: stabilità, autorità, presenza."],
  panneggio:["Panneggio","Linea e piega modellano diversamente i corpi: più ritmiche in Duccio, più plastiche in Giotto, già volumetriche in Cimabue.","La linea non è un residuo inferiore del passato."],
  sguardo:["Sguardo","La frontalità e gli sguardi degli angeli stabiliscono il rapporto con Maria e con chi osserva.","Lo sguardo costruisce devozione, non soltanto psicologia."],
  gesto:["Gesto","Il gesto della Vergine e la benedizione del Bambino rendono leggibile il ruolo sacro; le varianti cambiano tono e prossimità.","Un gesto convenzionale può essere narrativamente efficace."],
  luce:["Luce","L’oro produce luce reale riflessa; il chiaroscuro produce volume dipinto. Le due forme di luce cooperano.","La storia non passa semplicemente da luce simbolica a luce naturale."],
  gerarchia:["Gerarchia","Scala, asse centrale e simmetria mantengono Maria al vertice. Giotto non abolisce l’ordine sacro.","La novità lavora dentro una funzione tradizionale."],
  angeli:["Angeli","Cimabue li sovrappone attorno al trono; Duccio li dispone in un ritmo sospeso; Giotto li colloca in profondità più compatta.","Ogni soluzione regola insieme comunità celeste e leggibilità."],
  funzione:["Funzione","Sono immagini d’altare destinate a chiese e pubblici specifici, non quadri nati per una sala museale comune.","La collocazione odierna facilita il confronto ma altera l’uso originario."],
  committenza:["Committenza","Santa Trinita, Santa Maria Novella e Ognissanti implicano comunità religiose e contesti differenti.","La forma non nasce dal solo temperamento dell’artista."],
  spettatore:["Spettatore","La grande scala e l’asse frontale agiscono a distanza; trono, gradini e figure mediano l’accesso visivo.","Il museo permette vicinanza e confronto impensabili nella prima collocazione."],
  limite:["Limite evolutivo","Giotto non “vince”: risolve con maggiore densità corporea un problema che Cimabue e Duccio formulano diversamente.","Duccio non è una tappa incompleta verso Firenze, e la fotografia non è il traguardo della pittura."]
};
const comparisonTabs = document.querySelector("#comparisonTabs");
const categoryButtons = document.querySelector("#categoryButtons");
const comparisonImage = document.querySelector("#comparisonImage");
const comparisonCaption = document.querySelector("#comparisonCaption");
const comparisonReading = document.querySelector("#comparisonReading");
function renderComparison() {
  if (!comparisonWorks[state.comparisonWork]) state.comparisonWork = "cimabue";
  if (!comparisonCategories[state.comparisonCategory]) state.comparisonCategory = "spazio";
  comparisonTabs.innerHTML = Object.entries(comparisonWorks).map(([key,work]) => `<button type="button" role="tab" data-work="${key}" aria-selected="${state.comparisonWork === key}">${work.label}<br><small>${work.title}</small></button>`).join("");
  categoryButtons.innerHTML = Object.entries(comparisonCategories).map(([key,[label]]) => `<button type="button" data-category="${key}" aria-pressed="${state.comparisonCategory === key}">${label}</button>`).join("");
  const work = comparisonWorks[state.comparisonWork];
  comparisonImage.src = work.src; comparisonImage.width = work.width; comparisonImage.height = work.height; comparisonImage.alt = work.alt;
  comparisonCaption.innerHTML = `<b>${esc(work.label)}</b>, <i>${esc(work.title)}</i>, ${esc(work.date)} · tempera su tavola, fondo oro · Gallerie degli Uffizi.`;
  const category = comparisonCategories[state.comparisonCategory];
  comparisonReading.innerHTML = `<h3>${esc(category[0])}</h3><p><b>Continuità e differenze.</b> ${esc(category[1])}</p><p><b>Funzione storica e cautela.</b> ${esc(category[2])}</p><p><b>Opera ora osservata.</b> ${esc(work.label)} — ${esc(work.title)}. Cambia opera mantenendo la stessa categoria per verificare la relazione.</p>`;
  comparisonTabs.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { state.comparisonWork = button.dataset.work; saveState(); renderComparison(); }));
  categoryButtons.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { state.comparisonCategory = button.dataset.category; saveState(); renderComparison(); }));
}
renderComparison();

// Verifica con recupero
const questions = [
  {q:"Quale problema eredita il modulo 07 dalla cattedrale del modulo 06?",o:["Trasferire dentro una superficie il peso e la presenza sperimentati nello spazio costruito","Abbandonare ogni funzione religiosa dell’immagine","Sostituire la pietra con materiali meno costosi"],a:0,e:"Il passaggio decisivo va dallo spazio fisico dell’architettura allo spazio rappresentato della parete.",s:"#dalla-cattedrale",sl:"Dalla cattedrale alla scena",r:{q:"Perché la parete costituisce un problema diverso dalla navata?",o:["Perché è una superficie reale che deve suggerire uno spazio senza possederne fisicamente la profondità","Perché non può essere osservata da persone in movimento","Perché non è legata ad alcun edificio"],a:0,e:"La profondità della navata è materiale; quella della scena è costruita percettivamente."}},
  {q:"Perché città comunale, denaro e nuovi pubblici sono rilevanti per la pittura?",o:["Perché moltiplicano committenti, usi e necessità narrative delle immagini","Perché eliminano immediatamente il potere religioso","Perché impongono a tutti gli artisti un unico stile"],a:0,e:"Nuovi attori urbani commissionano e guardano immagini in contesti diversi, senza cancellare conflitto o religione.",s:"#citta",sl:"Città, denaro e pubblici",r:{q:"Quale catena storica è più fondata?",o:["Nuovi attori urbani → nuove committenze → nuove forme di racconto visivo","Più denaro → fine del sacro → nascita automatica del realismo","Più città → scomparsa delle botteghe"],a:0,e:"La relazione è mediata da committenze, luoghi, botteghe e pubblici."}},
  {q:"Che cosa dimostra il fondo oro nelle immagini precedenti a Giotto?",o:["Una funzione di presenza e gerarchia che può convivere con indizi di profondità","L’incapacità tecnica di rappresentare qualunque spazio","La volontà di imitare un paesaggio illuminato dal sole"],a:0,e:"Il fondo oro non è uno spazio naturale, ma non equivale a ignoranza dello spazio.",s:"#prima-di-giotto",sl:"Prima di Giotto",r:{q:"Qual è il modo più corretto di giudicare una forma medievale?",o:["Ricostruirne funzione, collocazione e pubblico prima di misurarla con regole successive","Confrontarla soltanto con una fotografia","Stabilire quanto si avvicina alla prospettiva del Quattrocento"],a:0,e:"La funzione storica precede la classifica stilistica."}},
  {q:"Come vanno considerati Cimabue e Duccio?",o:["Come artisti che rispondono con soluzioni autonome a problemi in parte comuni","Come tentativi imperfetti di diventare Giotto","Come pittori estranei alle trasformazioni del Duecento"],a:0,e:"Entrambi partecipano al cambiamento; Duccio non è una tappa incompleta verso Giotto.",s:"#confronto",sl:"Prima/Dopo?",r:{q:"Perché la sequenza Cimabue → Duccio → Giotto è ingannevole?",o:["Perché trasforma differenze funzionali e regionali in una gara lineare","Perché le tre opere non hanno alcun elemento comune","Perché soltanto una delle tre usa l’oro"],a:0,e:"Il confronto è utile soltanto se non cancella autonomia, contesti e funzioni."}},
  {q:"Quale ruolo hanno gli ordini mendicanti nel nuovo paesaggio urbano?",o:["Contribuiscono a nuovi luoghi, pubblici e forme di comunicazione religiosa","Vietano la narrazione per immagini","Sostituiscono tutte le committenze laiche"],a:0,e:"Francescani e domenicani dialogano con la città e i suoi pubblici, senza produrre automaticamente il naturalismo.",s:"#citta",sl:"Città, denaro e pubblici",r:{q:"Quale affermazione evita un automatismo?",o:["La predicazione mendicante è un fattore del contesto, non una causa unica dello stile","San Francesco inventa direttamente il naturalismo","Ogni chiesa mendicante adotta la stessa pittura"],a:0,e:"Tra società e forma artistica esistono mediazioni, scelte e differenze."}},
  {q:"Come va presentato il ciclo francescano della Basilica superiore di Assisi?",o:["Come un complesso tradizionalmente legato a Giotto, ma con attribuzione discussa","Come opera interamente autografa documentata da un contratto completo","Come lavoro sicuramente estraneo a Giotto e alla sua cerchia"],a:0,e:"Le fonti e gli studi non autorizzano una certezza assoluta: attribuzione e autografia restano oggetto di discussione.",s:"#giotto-storico",sl:"Giotto storico",r:{q:"Che cosa deve fare una lezione quando gli studiosi discutono un’attribuzione?",o:["Dichiarare il margine d’incertezza e distinguere documenti, stile e ipotesi","Scegliere la versione più famosa senza avvertire","Eliminare l’opera dal percorso"],a:0,e:"L’incertezza documentata è conoscenza storica."}},
  {q:"Che valore ha il racconto di Giotto pastore scoperto da Cimabue?",o:["È una costruzione biografica successiva che esprime un’idea di naturalismo","È un documento notarile contemporaneo all’infanzia del pittore","Prova che Giotto non frequentò mai una bottega"],a:0,e:"L’aneddoto è significativo per la fortuna critica, non verificabile come fatto biografico.",s:"#giotto-storico",sl:"Giotto storico",r:{q:"Perché una leggenda può comunque essere studiata?",o:["Perché rivela come una cultura ha voluto spiegare la grandezza dell’artista","Perché ogni leggenda è storicamente vera","Perché sostituisce le opere perdute"],a:0,e:"La leggenda è fonte sulla memoria di Giotto, non necessariamente sulla sua infanzia."}},
  {q:"Perché è riduttivo dire che Enrico Scrovegni costruì la cappella soltanto per espiare l’usura?",o:["Perché devozione, memoria familiare, prestigio e politica urbana concorrono alla committenza","Perché la famiglia Scrovegni non ebbe rapporti con il credito","Perché il committente non compare nel ciclo"],a:0,e:"L’usura è un nodo interpretativo importante, ma non esaurisce un’impresa così complessa.",s:"#parete",sl:"Una cappella come racconto",r:{q:"Quale formulazione è storicamente più prudente?",o:["L’espiazione è una possibile motivazione entro un programma più ampio","L’espiazione spiega da sola ogni scena","Denaro e salvezza non hanno alcun rapporto con la cappella"],a:0,e:"Una buona interpretazione non trasforma un fattore in causa unica."}},
  {q:"Che cosa rivela la “giornata” nell’affresco?",o:["Che il ciclo è organizzato in porzioni d’intonaco dipinte entro tempi di lavoro limitati","Che ogni scena richiede esattamente ventiquattro ore","Che il maestro può lavorare senza assistenti"],a:0,e:"La giornata lega progetto, intonaco, tempo e divisione del lavoro.",s:"#sotto-colore",sl:"Sotto il colore",r:{q:"Perché alcune finiture a secco sono più fragili?",o:["Perché non vengono incorporate dall’intonaco umido nello stesso modo del buon fresco","Perché sono sempre realizzate con pigmenti neri","Perché appartengono necessariamente a restauri moderni"],a:0,e:"Leganti e applicazioni a secco hanno un rapporto diverso con il supporto."}},
  {q:"Da che cosa nasce l’emozione in molte scene giottesche?",o:["Dalla struttura condivisa di gesti, sguardi, posture, distanze e masse","Soltanto dall’espressione isolata dei volti","Dall’eliminazione di ogni convenzione religiosa"],a:0,e:"L’affetto organizza la scena e guida lo spettatore; non è un’aggiunta psicologica decorativa.",s:"#gesto",sl:"Prima il volto o il gesto?",r:{q:"Che cosa accade isolando soltanto le mani nel Bacio di Giuda?",o:["Si comprende una parte dell’azione, ma serve ricomporla con volti, posture e folla","Si ottiene da sola l’intera interpretazione","Si dimostra che gli sguardi non hanno funzione"],a:0,e:"Ogni dettaglio agisce dentro una rete di relazioni."}},
  {q:"Perché lo spazio di Giotto è credibile ma non ancora prospettico in senso rinascimentale?",o:["Perché coordina indizi locali senza unificare tutto con un solo principio geometrico","Perché non contiene mai edifici","Perché le figure non si sovrappongono"],a:0,e:"Appoggio, volume, scala e architetture rendono la scena abitabile; manca ancora la costruzione matematica unitaria.",s:"#spazio",sl:"Spazio credibile",r:{q:"Come vanno lette linee architettoniche che non convergono in un punto unico?",o:["Come soluzioni di uno spazio narrativo precedente alla codificazione prospettica","Come errori di un pittore che conosceva già Brunelleschi","Come prova dell’assenza totale di profondità"],a:0,e:"Non si può applicare retroattivamente una regola futura come se fosse già obbligatoria."}},
  {q:"Quale problema apre Giotto al modulo sul Rinascimento?",o:["Come trasformare uno spazio abitabile in uno spazio misurabile","Come eliminare il corpo umano dall’immagine","Come tornare alla sola frontalità dell’icona"],a:0,e:"Il Rinascimento cercherà di coordinare lo spazio attraverso regole geometriche, prospettiva e un nuovo statuto dell’individuo.",s:"#conclusione",sl:"La soglia successiva",r:{q:"Completa il passaggio concettuale corretto.",o:["Giotto: abitare lo spazio → Rinascimento: misurarlo","Giotto: negare lo spazio → Rinascimento: inventare il colore","Giotto: abolire il sacro → Rinascimento: restaurarlo"],a:0,e:"La continuità riguarda il passaggio dalla coerenza percettiva alla costruzione geometrica."}}
];

const quizPanel = document.querySelector("#quizPanel");
const quizMeter = document.querySelector("#quizMeter");
const quizCount = document.querySelector("#quizCount");
function renderQuiz() {
  if (state.quiz.index >= questions.length || state.quiz.completed) {
    state.quiz.completed = true; state.completed = true; saveState();
    quizMeter.value = questions.length; quizCount.textContent = "Percorso completato";
    quizPanel.innerHTML = `<div class="quiz-summary"><p class="question-no">Esito</p><h3>Hai ricostruito il passaggio dallo spazio abitabile allo spazio misurabile.</h3><div class="summary-grid"><article><b>${state.quiz.correctFirst}</b><span>corrette al primo tentativo</span></article><article><b>${state.quiz.errors}</b><span>errori incontrati</span></article><article><b>${state.quiz.recovered}</b><span>nodi recuperati</span></article></div><p>${state.quiz.pendingRecovery ? "Resta un nodo da recuperare." : "Non restano nodi irrisolti."} Le annotazioni personali non verranno cancellate se ricominci.</p><button type="button" id="quizRestart">Ricomincia la verifica</button></div>`;
    document.querySelector("#quizRestart").addEventListener("click", () => { state.quiz = defaultState().quiz; state.completed = false; saveState(); renderQuiz(); });
    return;
  }
  const item = questions[state.quiz.index];
  const recovery = state.quiz.pendingRecovery;
  const current = recovery ? item.r : item;
  quizMeter.value = state.quiz.index;
  quizCount.textContent = `${recovery ? "Recupero della domanda" : "Domanda"} ${state.quiz.index + 1} di ${questions.length}`;
  quizPanel.innerHTML = `<article class="quiz-card ${recovery ? "recovery-card" : ""}"><p class="${recovery ? "recovery-label" : "question-no"}">${recovery ? "Passaggio di recupero · non puoi ancora proseguire" : `Domanda ${state.quiz.index + 1}`}</p><h3>${esc(current.q)}</h3><div class="quiz-options">${current.o.map((option,index) => `<button type="button" data-answer="${index}">${esc(option)}</button>`).join("")}</div><div class="quiz-feedback" id="quizFeedback" hidden></div></article>`;
  quizPanel.querySelectorAll("[data-answer]").forEach(button => button.addEventListener("click", () => answerQuiz(Number(button.dataset.answer))));
}

function answerQuiz(answer) {
  const item = questions[state.quiz.index];
  const recovery = state.quiz.pendingRecovery;
  const current = recovery ? item.r : item;
  const buttons = [...quizPanel.querySelectorAll("[data-answer]")];
  buttons.forEach(button => { button.disabled = true; if (Number(button.dataset.answer) === answer) button.classList.add(answer === current.a ? "correct" : "wrong"); });
  const feedback = document.querySelector("#quizFeedback");
  feedback.hidden = false;
  if (answer === current.a) {
    if (recovery) state.quiz.recovered += 1; else state.quiz.correctFirst += 1;
    saveState();
    feedback.innerHTML = `<h4>${recovery ? "Nodo recuperato" : "Relazione corretta"}</h4><p>${esc(current.e)}</p><div class="quiz-actions"><button type="button" id="quizNext">${state.quiz.index === questions.length - 1 ? "Vedi l’esito" : "Prosegui"}</button></div>`;
    document.querySelector("#quizNext").addEventListener("click", () => { state.quiz.pendingRecovery = false; state.quiz.index += 1; if (state.quiz.index >= questions.length) state.quiz.completed = true; saveState(); renderQuiz(); });
  } else if (recovery) {
    feedback.innerHTML = `<h4>Il collegamento non è ancora ricostruito</h4><p>${esc(current.e)} Rileggi <a href="${item.s}">${esc(item.sl)}</a>, poi affronta di nuovo questo passaggio.</p><div class="quiz-actions"><button type="button" id="quizRetry">Riprova il recupero</button></div>`;
    document.querySelector("#quizRetry").addEventListener("click", renderQuiz);
  } else {
    state.quiz.errors += 1; state.quiz.pendingRecovery = true; saveState();
    feedback.innerHTML = `<h4>Questo nodo va recuperato</h4><p>${esc(item.e)} Torna a <a href="${item.s}">${esc(item.sl)}</a>. La domanda di recupero sarà diversa e resterà attiva anche dopo un reload.</p><div class="quiz-actions"><button type="button" id="quizRecovery">Apri il recupero</button></div>`;
    document.querySelector("#quizRecovery").addEventListener("click", renderQuiz);
  }
}
renderQuiz();

// Lightbox accessibile con zoom, trascinamento, touch e tastiera
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxCaption = document.querySelector("#lightboxCaption");
const lightboxStage = document.querySelector("#lightboxStage");
const closeLightboxButton = document.querySelector("#lightboxClose");
let lightboxReturnFocus = null;
let view = { scale: 1, x: 0, y: 0 };
const pointers = new Map();
let lastPinchDistance = 0;
function applyView() { lightboxImage.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.scale})`; }
function resetView() { view = { scale: 1, x: 0, y: 0 }; applyView(); }
function changeZoom(delta) { view.scale = Math.max(1, Math.min(5, Number((view.scale + delta).toFixed(2)))); if (view.scale === 1) { view.x = 0; view.y = 0; } applyView(); }
function openLightbox(button) {
  const figure = button.closest("figure"); const image = figure.querySelector("img"); const caption = figure.querySelector("figcaption");
  lightboxReturnFocus = button; lightboxImage.src = image.currentSrc || image.src; lightboxImage.alt = image.alt; lightboxCaption.textContent = caption ? caption.textContent.trim() : image.alt;
  resetView(); lightbox.hidden = false; document.body.classList.add("lightbox-open"); closeLightboxButton.focus();
}
function closeLightbox() { lightbox.hidden = true; document.body.classList.remove("lightbox-open"); pointers.clear(); if (lightboxReturnFocus) lightboxReturnFocus.focus(); }
document.querySelectorAll(".zoomable .open-image").forEach(button => button.addEventListener("click", () => openLightbox(button)));
closeLightboxButton.addEventListener("click", closeLightbox);
document.querySelector("#zoomIn").addEventListener("click", () => changeZoom(.5));
document.querySelector("#zoomOut").addEventListener("click", () => changeZoom(-.5));
document.querySelector("#zoomReset").addEventListener("click", resetView);
lightbox.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });
lightboxStage.addEventListener("pointerdown", event => { pointers.set(event.pointerId,{x:event.clientX,y:event.clientY}); lightboxStage.setPointerCapture(event.pointerId); lightboxStage.classList.add("is-dragging"); });
lightboxStage.addEventListener("pointermove", event => {
  if (!pointers.has(event.pointerId)) return;
  const previous = pointers.get(event.pointerId); pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if (pointers.size === 1 && view.scale > 1) { view.x += event.clientX - previous.x; view.y += event.clientY - previous.y; applyView(); }
  if (pointers.size === 2) { const [a,b] = [...pointers.values()]; const distance = Math.hypot(a.x-b.x,a.y-b.y); if (lastPinchDistance) changeZoom((distance-lastPinchDistance)/180); lastPinchDistance = distance; }
});
function releasePointer(event) { pointers.delete(event.pointerId); lastPinchDistance = 0; if (!pointers.size) lightboxStage.classList.remove("is-dragging"); }
lightboxStage.addEventListener("pointerup", releasePointer); lightboxStage.addEventListener("pointercancel", releasePointer);
document.addEventListener("keydown", event => {
  if (!menu.hidden && event.key === "Escape") { setMenu(false); return; }
  if (lightbox.hidden) return;
  if (event.key === "Escape") closeLightbox();
  if (["+","="].includes(event.key)) changeZoom(.5);
  if (event.key === "-") changeZoom(-.5);
  if (event.key === "0") resetView();
  if (event.key === "Tab") {
    const focusables = [...lightbox.querySelectorAll("button")]; const first = focusables[0]; const last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
