const STORAGE_KEY = "storia-sguardo-05-state";
const clone = value => JSON.parse(JSON.stringify(value));
const defaultState = {
  initialNote: "",
  finalNote: "",
  visited: [],
  layers: [],
  material: "",
  comparison: { work: "sign", category: "" },
  quiz: { index: 0, score: 0, errors: [], recoveries: [], completed: false, answeredCorrect: false, pendingRecovery: false, recoveryPassed: false }
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      ...defaultState,
      ...saved,
      visited: Array.isArray(saved.visited) ? saved.visited : [],
      layers: Array.isArray(saved.layers) ? saved.layers : [],
      comparison: { ...defaultState.comparison, ...(saved.comparison || {}) },
      quiz: { ...defaultState.quiz, ...(saved.quiz || {}) }
    };
  } catch (_) {
    return clone(defaultState);
  }
}

let state = loadState();
const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

const initialNote = document.querySelector("#initial-note");
const finalNote = document.querySelector("#final-note");
const initialMemory = document.querySelector("#initial-memory");
initialNote.value = state.initialNote;
finalNote.value = state.finalNote;

function updateMemory() {
  initialMemory.textContent = state.initialNote.trim() || "Non hai ancora salvato la prima osservazione.";
}
updateMemory();

document.querySelectorAll(".save-note").forEach(button => {
  button.addEventListener("click", () => {
    const field = document.querySelector(`#${button.dataset.note}`);
    const key = button.dataset.note === "initial-note" ? "initialNote" : "finalNote";
    const status = document.querySelector(key === "initialNote" ? "#initial-status" : "#final-status");
    state[key] = field.value.trim();
    saveState();
    updateMemory();
    status.textContent = state[key] ? "Salvato localmente." : "Nota vuota: salvataggio rimosso.";
  });
});

document.querySelectorAll(".opening-questions button").forEach(button => {
  button.addEventListener("click", () => {
    const seed = `${button.textContent} `;
    if (!initialNote.value.includes(seed)) initialNote.value += `${initialNote.value.trim() ? "\n" : ""}${seed}`;
    initialNote.focus();
  });
});

// Navigazione e avanzamento della lettura.
const progressBar = document.querySelector("#progress-bar");
const journeyState = document.querySelector("#journey-state");
const tracked = [...document.querySelectorAll(".tracked")];

function updateJourney() {
  journeyState.textContent = `${state.visited.length} / ${tracked.length} tappe`;
}
updateJourney();

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.intersectionRatio < .18) return;
      const label = entry.target.dataset.track;
      if (!state.visited.includes(label)) {
        state.visited.push(label);
        saveState();
        updateJourney();
      }
    });
  }, { threshold:[.18,.45] });
  tracked.forEach(section => observer.observe(section));
}

function updateReadProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const value = max > 0 ? Math.min(100, Math.max(0, scrollY / max * 100)) : 0;
  progressBar.style.width = `${value}%`;
}
addEventListener("scroll", updateReadProgress, { passive:true });
addEventListener("resize", updateReadProgress);
updateReadProgress();

const nav = document.querySelector("#chapter-nav");
const navToggle = document.querySelector("#nav-toggle");
const navClose = document.querySelector("#nav-close");
let navReturnFocus = null;

function openNav() {
  navReturnFocus = document.activeElement;
  nav.hidden = false;
  navToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("nav-open");
  navClose.focus();
}
function closeNav() {
  nav.hidden = true;
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
  if (navReturnFocus) navReturnFocus.focus();
}
navToggle.addEventListener("click", openNav);
navClose.addEventListener("click", closeNav);
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeNav));

// Materia del mosaico.
const materialStage = document.querySelector(".tessera-view");
const materialFeedback = document.querySelector("#material-feedback");
const materialTexts = {
  stone: "La pietra tende a restituire una luce più stabile e opaca: dà peso alla superficie e la ancora all’architettura.",
  glass: "La pasta vitrea trattiene colori intensi e può riflettere: non simula soltanto una tinta, ma modifica la luce che riceve.",
  gold: "La foglia d’oro è racchiusa fra strati di vetro. La luce non è soltanto dipinta: colpisce una materia riflettente e torna verso lo spettatore.",
  angle: "Le tessere non sono tutte sullo stesso piano. Piccole inclinazioni fanno apparire e scomparire bagliori mentre il corpo si muove nello spazio."
};

document.querySelectorAll("[data-material]").forEach(button => {
  const active = state.material === button.dataset.material;
  button.setAttribute("aria-pressed", String(active));
  if (active) {
    materialStage.dataset.effect = button.dataset.material;
    materialFeedback.textContent = materialTexts[button.dataset.material];
  }
  button.addEventListener("click", () => {
    state.material = button.dataset.material;
    materialStage.dataset.effect = state.material;
    document.querySelectorAll("[data-material]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    materialFeedback.textContent = materialTexts[state.material];
    saveState();
  });
});

// Interazione: Attraversa la soglia dell’immagine.
const layerData = {
  support: {
    visible:"Una tavola lignea stretta e alta, oggi ridotta ai margini; il dipinto è eseguito a encausto, con pigmenti legati alla cera.",
    founded:"Il supporto rende l’immagine trasportabile e inseribile in pratiche monastiche e liturgiche.",
    hypothesis:"Non conosciamo con certezza la collocazione originaria né tutte le trasformazioni della tavola.",
    relation:"Prima di essere ‘immagine’, è un oggetto che occupa lo stesso spazio materiale dello spettatore."
  },
  axis: {
    visible:"L’asse verticale attraversa fronte, naso e bocca, ma i due lati non sono perfettamente speculari.",
    founded:"La frontalità stabilizza la figura e orienta il rapporto direttamente verso chi guarda.",
    hypothesis:"L’asse non prova da solo un significato teologico specifico.",
    relation:"La figura non è sorpresa in un’azione laterale: si presenta."
  },
  eyes: {
    visible:"Gli occhi hanno forma e apertura differenti; le pupille non producono una simmetria fotografica.",
    founded:"La lieve discordanza rende lo sguardo difficile da fissare e aumenta la sensazione di presenza.",
    hypothesis:"Non possiamo ricavare dai due occhi una psicologia individuale verificabile.",
    relation:"Lo spettatore non controlla completamente la direzione dello sguardo."
  },
  gaze: {
    visible:"Le linee degli occhi convergono verso lo spazio antistante la tavola, pur senza coincidere perfettamente.",
    founded:"L’immagine è costruita per un incontro frontale, non soltanto per descrivere un personaggio.",
    hypothesis:"Dire che Cristo ‘segue’ fisicamente ogni spettatore è un effetto percettivo, non un dato materiale.",
    relation:"Lo sguardo trasforma l’osservatore in interlocutore."
  },
  asymmetry: {
    visible:"Sopracciglia, guance, capelli e bocca presentano differenze riconoscibili fra i due lati.",
    founded:"L’asimmetria è reale e può essere descritta con precisione.",
    hypothesis:"La lettura ‘metà umana, metà divina’ è moderna e diffusa, ma non è dimostrata da un testo coevo o da un programma certo.",
    relation:"L’incertezza obbliga a distinguere osservazione e interpretazione."
  },
  hand: {
    visible:"La destra è sollevata e le dita assumono una posizione controllata.",
    founded:"Il gesto può essere letto come benedizione e, insieme, come gesto di parola e autorità.",
    hypothesis:"Il significato esatto di ogni dito non va ricostruito come un codice universale immutabile.",
    relation:"La mano non racconta un episodio: agisce verso chi si trova davanti."
  },
  book: {
    visible:"Un grande volume chiuso, riccamente decorato, occupa la parte inferiore destra.",
    founded:"Il libro segnala insegnamento, Vangelo e autorità della parola.",
    hypothesis:"Non possiamo identificarne il contenuto pagina per pagina perché il volume è chiuso.",
    relation:"Il peso visivo del libro bilancia il gesto e presenta Cristo come maestro e giudice."
  },
  garment: {
    visible:"Tunica e mantello costruiscono ampie masse scure, modellate da passaggi di luce.",
    founded:"L’abito sottrae il corpo alla nudità eroica classica e lo inserisce in un tipo di autorità tardoantica.",
    hypothesis:"Il colore attuale non coincide necessariamente in ogni punto con l’aspetto originario.",
    relation:"Il corpo è presente ma non offerto come studio anatomico."
  },
  nimbus: {
    visible:"Dietro la testa compare un grande disco percorso dai bracci di una croce.",
    founded:"Il nimbo distingue la figura; il nimbo crociato è specificamente legato a Cristo.",
    hypothesis:"Il nimbo, in sé, non è un’invenzione esclusivamente cristiana: ha precedenti nel mondo antico.",
    relation:"Il disco interrompe il fondo e porta l’identità teologica fino al limite del volto."
  },
  inscriptions: {
    visible:"Ai lati del nimbo compaiono tracce di lettere e segni identificativi.",
    founded:"L’iscrizione non decora soltanto: ancora il tipo visivo a un nome e a una tradizione.",
    hypothesis:"Le integrazioni e la leggibilità attuale richiedono attenzione alla storia conservativa.",
    relation:"Parola e immagine collaborano per impedire che il volto resti anonimo."
  },
  light: {
    visible:"Il volto e la veste sono modellati da zone chiare e scure; il fondo e il nimbo reagiscono diversamente.",
    founded:"La tecnica a encausto permette passaggi morbidi e una presenza corporea ancora legata alla pittura tardoantica.",
    hypothesis:"La luce dipinta non va confusa con una ‘aura’ misurabile o con una prova di trascendenza.",
    relation:"La materia rende visibile un corpo e contemporaneamente ne segnala l’eccedenza simbolica."
  },
  background: {
    visible:"La figura non è collocata in un paesaggio narrativo; ai lati restano fasce scure e segni architettonici ridotti.",
    founded:"L’assenza di profondità naturale concentra l’incontro sulla figura e sulla sua funzione.",
    hypothesis:"Non conosciamo con sicurezza l’intero arredo nel quale la tavola appariva.",
    relation:"La collocazione monastica e liturgica trasformava la visione individuale in pratica condivisa."
  }
};

const layerNote = document.querySelector("#reader-note");
const layerProgress = document.querySelector("#reader-progress");
function updateLayerProgress() {
  layerProgress.textContent = `${state.layers.length} / ${Object.keys(layerData).length} livelli esplorati`;
}
function showLayer(layer) {
  const data = layerData[layer];
  layerNote.innerHTML = `<p><b>Visibile:</b> ${data.visible}</p><p><b>Interpretazione fondata:</b> ${data.founded}</p><p><b>Resta ipotetico:</b> ${data.hypothesis}</p><p><b>Relazione:</b> ${data.relation}</p>`;
}

document.querySelectorAll("[data-layer]").forEach(button => {
  const layer = button.dataset.layer;
  const active = state.layers.includes(layer);
  button.setAttribute("aria-pressed", String(active));
  document.querySelector(`[data-overlay="${layer}"]`)?.classList.toggle("is-active", active);
  button.addEventListener("click", () => {
    const overlay = document.querySelector(`[data-overlay="${layer}"]`);
    const nowActive = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(nowActive));
    overlay?.classList.toggle("is-active", nowActive);
    if (nowActive && !state.layers.includes(layer)) state.layers.push(layer);
    showLayer(layer);
    updateLayerProgress();
    saveState();
  });
});
updateLayerProgress();
if (state.layers.length) showLayer(state.layers[state.layers.length - 1]);

// Interazione comparativa.
const workData = {
  sign: {
    name:"Buon Pastore · Priscilla",
    image:"assets/images/buon-pastore-priscilla.webp",
    alt:"Buon Pastore nelle catacombe di Priscilla",
    width:492,height:712,
    readings:{
      materia:"Pigmento su intonaco: fragile, legato a una parete funeraria e segnato dal tempo.",
      corpo:"Un giovane pastore, non un ritratto fisiognomico di Cristo.",
      simbolo:"Una forma pastorale romana viene reinterpretata come cura, salvezza e speranza.",
      racconto:"Non sviluppa una sequenza narrativa: condensa un’attesa in una figura.",
      tipologia:"Il collegamento con il Buon Pastore cristiano nasce dal contesto e dalla memoria dei testi.",
      gerarchia:"La figura centrale domina il piccolo campo circolare.",
      luce:"La luce è dipinta e attenuata dalla superficie abrasa.",
      frontalità:"Il corpo è aperto e leggibile, ma non impone la frontalità assoluta dell’icona.",
      spazio:"Appartiene a un cubicolo funerario: memoria e sepoltura cambiano il significato.",
      liturgia:"È vicina a pratiche commemorative, non a un’abside basilicale.",
      autorità:"L’autorità non è imperiale: si esprime come protezione.",
      memoria:"La funzione più forte: accompagna i morti e le attese dei vivi.",
      presenza:"Rende presente una promessa attraverso un segno abbreviato."
    }
  },
  story: {
    name:"Sarcofago di Giunio Basso",
    image:"assets/images/giunio-basso.webp",
    alt:"Sarcofago di Giunio Basso con dieci scene scolpite",
    width:1920,height:1279,
    readings:{
      materia:"Marmo costoso e alto rilievo: la committenza di élite resta visibile.",
      corpo:"I corpi conservano volume, pose e tipi della scultura romana.",
      simbolo:"Scene e attributi rinviano a salvezza, autorità e vittoria sulla morte.",
      racconto:"Dieci episodi sono accostati; lo spettatore deve costruire relazioni fra registri.",
      tipologia:"Antico e Nuovo Testamento si interpretano reciprocamente, oltre la semplice cronologia.",
      gerarchia:"La Traditio Legis e la disposizione centrale ordinano il programma.",
      luce:"Le ombre reali del rilievo cambiano con il movimento e rendono leggibili le figure.",
      frontalità:"Alcune figure si presentano frontalmente, altre partecipano a episodi narrativi.",
      spazio:"Il sarcofago unisce luogo di sepoltura, status pubblico e racconto religioso.",
      liturgia:"La tomba poteva partecipare alla memoria rituale del defunto.",
      autorità:"Il prestigio del prefetto urbano viene ricomposto in un’identità cristiana.",
      memoria:"L’iscrizione e le scene trasformano il monumento funebre in biografia interpretata.",
      presenza:"La presenza nasce dalla densità del racconto e dal corpo materiale della tomba."
    }
  },
  presence: {
    name:"Pantocratore del Sinai",
    image:"assets/images/pantocrator-sinai.webp",
    alt:"Cristo Pantocratore del Sinai",
    width:801,height:1528,
    readings:{
      materia:"Legno, cera e pigmento restano visibili; la materia è condizione della relazione.",
      corpo:"Il mezzo busto è corporeo ma non descrive un individuo osservato dal vero.",
      simbolo:"Nimbo, libro, gesto e iscrizioni costruiscono un’identità teologica.",
      racconto:"Non rappresenta un episodio: sospende il tempo narrativo.",
      tipologia:"Il volto appartiene a un tipo iconografico riconoscibile e trasmissibile.",
      gerarchia:"Figura, gesto e libro concentrano tutta l’autorità nel centro.",
      luce:"L’encausto modella il volto; la luce rende il corpo vicino senza naturalizzare il fondo.",
      frontalità:"È il dispositivo principale dell’incontro con lo spettatore.",
      spazio:"La tavola appartiene a un ambiente monastico e a pratiche concrete di visione.",
      liturgia:"L’icona può essere attivata da preghiera, gesti, incenso, canto e collocazione.",
      autorità:"Pantocratore significa sovrano di tutto: gesto e libro trasformano il linguaggio del potere.",
      memoria:"Il tipo conserva e trasmette una forma riconoscibile attraverso le generazioni.",
      presenza:"È la categoria dominante: l’immagine mira a rendere possibile una relazione con il prototipo."
    }
  }
};
const categories = ["materia","corpo","simbolo","racconto","tipologia","gerarchia","luce","frontalità","spazio","liturgia","autorità","memoria","presenza"];
const comparisonImage = document.querySelector("#comparison-image");
const comparisonName = document.querySelector("#comparison-name");
const comparisonFeedback = document.querySelector("#comparison-feedback");
const categoryButtons = document.querySelector("#category-buttons");

categories.forEach(category => {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.category = category;
  button.textContent = category;
  button.setAttribute("aria-pressed", String(state.comparison.category === category));
  button.addEventListener("click", () => {
    state.comparison.category = category;
    categoryButtons.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    comparisonFeedback.textContent = workData[state.comparison.work].readings[category];
    saveState();
  });
  categoryButtons.append(button);
});

function renderComparison() {
  const work = workData[state.comparison.work];
  comparisonImage.src = work.image;
  comparisonImage.alt = work.alt;
  comparisonImage.width = work.width;
  comparisonImage.height = work.height;
  comparisonName.textContent = work.name;
  document.querySelectorAll("[data-work]").forEach(button => button.setAttribute("aria-selected", String(button.dataset.work === state.comparison.work)));
  comparisonFeedback.textContent = state.comparison.category ? work.readings[state.comparison.category] : "Scegli una categoria per leggere l’opera.";
}
document.querySelectorAll("[data-work]").forEach(button => button.addEventListener("click", () => {
  state.comparison.work = button.dataset.work;
  renderComparison();
  saveState();
}));
renderComparison();

// Verifica con recupero obbligatorio.
const quizData = [
  {
    q:"Qual è il passaggio essenziale dal Colosso di Costantino al Pantocratore del Sinai?",
    options:["Il cristianesimo abbandona ogni forma romana","Una grammatica della presenza sovrana viene trasformata dalla domanda sulla presenza sacra","Il Pantocratore copia direttamente il ritratto fisiognomico di Costantino"], correct:1,
    feedback:"Frontalità, sguardo, gesto e scala avevano già reso presente l’autorità assente. Il cristianesimo li eredita e li trasforma, senza una derivazione meccanica.", link:"#dopo-impero",
    recovery:{q:"Quale continuità è storicamente fondata?",options:["L’uso trasformato di segni dell’autorità","L’identità fra imperatore e Cristo","La cancellazione di ogni linguaggio precedente"],correct:0}
  },
  {
    q:"Quale descrizione delle catacombe è storicamente corretta?",
    options:["Città segrete dove vivevano tutti i cristiani","Soprattutto luoghi funerari, usati da comunità che vivevano anche in spazi ordinari","Templi costruiti da Costantino dopo il 313"], correct:1,
    feedback:"Le catacombe furono soprattutto cimiteri. Le persecuzioni furono reali ma intermittenti e non obbligarono ogni comunità a vivere sottoterra.", link:"#morti",
    recovery:{q:"Che cosa cambia il significato del Buon Pastore?",options:["Soltanto il colore rosso","Il contesto funerario e le attese della comunità","Un codice segreto identico ovunque"],correct:1}
  },
  {
    q:"Che cosa rese possibile la svolta costantiniana?",
    options:["La legalizzazione e una nuova visibilità pubblica, sviluppata gradualmente","La proclamazione immediata del cristianesimo come unica religione ufficiale","La nascita improvvisa dell’arte cristiana nel 313"], correct:0,
    feedback:"Il culto divenne legale e ricevette crescente patronato. L’arte cristiana esisteva già e la cristianizzazione dell’impero fu un processo lungo e conflittuale.", link:"#pubblico",
    recovery:{q:"La basilica cristiana nasce come…",options:["semplice tempio pagano con una croce","selezione e trasformazione di forme civili, funerarie, residenziali e imperiali","spazio privo di relazione con la liturgia"],correct:1}
  },
  {
    q:"Perché l’Incarnazione divenne centrale nella difesa delle immagini?",
    options:["Perché rendeva divina ogni materia","Perché, secondo la fede cristiana, il Figlio aveva assunto un corpo visibile e storico","Perché eliminava la distinzione fra immagine e persona"], correct:1,
    feedback:"L’argomento non divinizza il supporto: collega la rappresentabilità di Cristo al corpo assunto nella storia e mantiene distinta la persona dalla materia.", link:"#paradosso",
    recovery:{q:"Quale distinzione resta necessaria?",options:["Immagine materiale e prototipo","Pietra e marmo sono identici","Venerazione e idolatria sono sinonimi"],correct:0}
  },
  {
    q:"Che cos’è la tipologia nel Sarcofago di Giunio Basso?",
    options:["Un errore di cronologia","Una relazione interpretativa fra eventi differenti, letti come anticipazione e compimento","Una tecnica per lucidare il marmo"], correct:1,
    feedback:"La tipologia connette episodi dell’Antico e del Nuovo Testamento dentro un’interpretazione della storia, non dentro una semplice somiglianza visiva.", link:"#pubblico",
    recovery:{q:"Nel sarcofago, prestigio romano e racconto cristiano…",options:["si escludono","convivono e vengono ricomposti","appartengono a secoli senza contatto"],correct:1}
  },
  {
    q:"Perché il fondo oro non è soltanto una mancanza di paesaggio?",
    options:["Perché usa tessere riflettenti e lega la superficie alla luce reale e al movimento","Perché prova che gli artigiani ignoravano lo spazio","Perché significa sempre e soltanto paradiso"], correct:0,
    feedback:"Pietra, vetro, oro e inclinazione delle tessere fanno variare la superficie. L’oro interrompe la profondità naturale e costruisce un altro rapporto con lo spazio.", link:"#materia-luce",
    recovery:{q:"Che cosa rende mobile un mosaico mentre cammini?",options:["L’inclinazione irregolare delle tessere","Un motore nascosto","La prospettiva lineare"],correct:0}
  },
  {
    q:"Che cosa mostrano i pannelli di Giustiniano e Teodora a San Vitale?",
    options:["Una fotografia di una cerimonia alla quale parteciparono fisicamente a Ravenna","Una costruzione simbolica che collega corte, clero, doni liturgici e autorità","Un rito privo di significato politico"], correct:1,
    feedback:"Gli imperatori erano assenti da Ravenna, ma la loro immagine li rendeva presenti accanto all’altare e organizzava visivamente i rapporti fra poteri.", link:"#corte",
    recovery:{q:"Patena e calice collegano soprattutto la corte a…",options:["una gara militare","la liturgia nello spazio della chiesa","un banchetto privato documentato"],correct:1}
  },
  {
    q:"Quale affermazione sul Pantocratore del Sinai è metodologicamente corretta?",
    options:["Le due metà del volto rappresentano certamente natura umana e divina","Le asimmetrie sono osservabili, ma il loro significato teologico preciso resta ipotetico","È un ritratto verificabile di Gesù eseguito dal vero"], correct:1,
    feedback:"L’asimmetria è un dato materiale. La lettura delle due nature è moderna e diffusa, ma non va trasformata in certezza storica.", link:"#relazione",
    recovery:{q:"Il volto del Pantocratore è meglio definito come…",options:["tipo iconografico formatosi progressivamente","fotografia fisiognomica","assenza di qualsiasi convenzione"],correct:0}
  },
  {
    q:"Quale distinzione fu affermata nella difesa delle immagini e a Nicea II (787)?",
    options:["Venerazione relativa e adorazione divina","Oriente razionale e Occidente superstizioso","Immagine e prototipo sono la stessa materia"], correct:0,
    feedback:"La venerazione resa all’immagine veniva distinta dall’adorazione dovuta a Dio; l’onore era riferito al prototipo, non fermato sul supporto.", link:"#conflitto",
    recovery:{q:"L’iconoclasmo coinvolse…",options:["solo preferenze estetiche","teologia, autorità imperiale, Chiesa e pratiche devozionali","soltanto il prezzo dei pigmenti"],correct:1}
  },
  {
    q:"In che modo il modulo 05 prepara il Medioevo romanico e gotico?",
    options:["Mostra che la presenza sacra può organizzare immagini, oggetti, riti, edifici e percorsi urbani","Dimostra che dopo Roma l’arte perde ogni capacità tecnica","Conclude che soltanto le icone su tavola hanno funzione sacra"], correct:0,
    feedback:"Dalla superficie si passa all’abside, alla basilica, alla processione e alla città: il modulo 06 indagherà come lo spazio intero orienti il movimento verso la luce.", link:"#corpi-luoghi",
    recovery:{q:"Quale elemento può costruire presenza oltre all’immagine figurativa?",options:["Reliquia, canto, libro, processione e spazio","Soltanto la prospettiva","Nessun oggetto materiale"],correct:0}
  }
];

const quizCard = document.querySelector("#quiz-card");
const quizSummary = document.querySelector("#quiz-summary");
const quizMeter = document.querySelector("#quiz-meter");
const quizCount = document.querySelector("#quiz-count");

function persistQuiz() { saveState(); }

function renderQuiz() {
  if (state.quiz.completed || state.quiz.index >= quizData.length) return renderSummary();
  if (state.quiz.pendingRecovery) return renderRecovery();
  const item = quizData[state.quiz.index];
  if (state.quiz.answeredCorrect) return renderCorrectState(item);
  quizCard.className = "quiz-card";
  quizCard.innerHTML = `<p class="question-no">${String(state.quiz.index + 1).padStart(2,"0")}</p><h3>${item.q}</h3><div class="quiz-options"></div>`;
  const options = quizCard.querySelector(".quiz-options");
  item.options.forEach((text,index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", () => answerQuestion(index, button));
    options.append(button);
  });
  quizMeter.value = state.quiz.index;
  quizCount.textContent = `Domanda ${state.quiz.index + 1} di ${quizData.length}`;
}

function renderCorrectState(item) {
  quizCard.className = "quiz-card";
  quizCard.innerHTML = `<p class="question-no">${String(state.quiz.index + 1).padStart(2,"0")}</p><h3>${item.q}</h3><div class="quiz-feedback"><h4>Collegamento ricostruito</h4><p>${item.feedback}</p><div class="quiz-actions"><button type="button" id="quiz-next">Prosegui</button></div></div>`;
  quizCard.querySelector("#quiz-next").addEventListener("click", nextQuestion);
  quizMeter.value = state.quiz.index;
  quizCount.textContent = `Domanda ${state.quiz.index + 1} di ${quizData.length}`;
}

function answerQuestion(index, button) {
  const item = quizData[state.quiz.index];
  quizCard.querySelectorAll(".quiz-options button").forEach(itemButton => itemButton.disabled = true);
  const correct = index === item.correct;
  button.classList.add(correct ? "correct" : "wrong");
  if (correct) {
    state.quiz.score += 1;
    state.quiz.answeredCorrect = true;
    quizCard.insertAdjacentHTML("beforeend", `<div class="quiz-feedback"><h4>Collegamento ricostruito</h4><p>${item.feedback}</p><div class="quiz-actions"><button type="button" id="quiz-next">Prosegui</button></div></div>`);
    quizCard.querySelector("#quiz-next").addEventListener("click", nextQuestion);
  } else {
    if (!state.quiz.errors.includes(state.quiz.index)) state.quiz.errors.push(state.quiz.index);
    state.quiz.pendingRecovery = true;
    quizCard.insertAdjacentHTML("beforeend", `<div class="quiz-feedback"><h4>Il legame si è spezzato qui</h4><p>${item.feedback}</p><p><a href="${item.link}">Rivedi l’opera o il passaggio pertinente</a>, poi affronta una domanda diversa.</p><div class="quiz-actions"><button type="button" id="start-recovery">Avvia il recupero</button></div></div>`);
    quizCard.querySelector("#start-recovery").addEventListener("click", renderRecovery);
  }
  persistQuiz();
}

function renderRecovery() {
  const item = quizData[state.quiz.index];
  quizCard.className = "quiz-card recovery-card";
  quizMeter.value = state.quiz.index;
  quizCount.textContent = `Recupero della domanda ${state.quiz.index + 1}`;
  if (state.quiz.recoveryPassed) {
    quizCard.innerHTML = `<p class="recovery-label">Recupero completato</p><h3>${item.recovery.q}</h3><div class="quiz-feedback"><h4>Recupero riuscito</h4><p>Il nodo essenziale è di nuovo collegato. Puoi proseguire.</p><div class="quiz-actions"><button type="button" id="recovery-next">Prosegui</button></div></div>`;
    quizCard.querySelector("#recovery-next").addEventListener("click", nextQuestion);
    return;
  }
  quizCard.innerHTML = `<p class="recovery-label">Recupero · domanda differente</p><h3>${item.recovery.q}</h3><div class="quiz-options"></div><div class="quiz-feedback" id="recovery-feedback"><p>La prosecuzione si sblocca quando il collegamento essenziale è ricostruito.</p></div>`;
  const options = quizCard.querySelector(".quiz-options");
  item.recovery.options.forEach((text,index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.addEventListener("click", () => {
      if (index === item.recovery.correct) {
        options.querySelectorAll("button").forEach(option => option.disabled = true);
        button.classList.add("correct");
        if (!state.quiz.recoveries.includes(state.quiz.index)) state.quiz.recoveries.push(state.quiz.index);
        state.quiz.recoveryPassed = true;
        document.querySelector("#recovery-feedback").innerHTML = `<h4>Recupero riuscito</h4><p>Ora il nodo essenziale è di nuovo collegato. Puoi proseguire.</p><div class="quiz-actions"><button type="button" id="recovery-next">Prosegui</button></div>`;
        document.querySelector("#recovery-next").addEventListener("click", nextQuestion);
        persistQuiz();
      } else {
        button.classList.add("wrong");
        document.querySelector("#recovery-feedback").innerHTML = `<h4>Non ancora</h4><p>Rileggi i termini della domanda: cerca la relazione storica, non una formula assoluta. Prova un’altra risposta.</p>`;
      }
    });
    options.append(button);
  });
}

function nextQuestion() {
  state.quiz.index += 1;
  state.quiz.answeredCorrect = false;
  state.quiz.pendingRecovery = false;
  state.quiz.recoveryPassed = false;
  persistQuiz();
  renderQuiz();
  quizCard.focus?.();
}

function renderSummary() {
  state.quiz.completed = true;
  persistQuiz();
  quizCard.hidden = true;
  quizSummary.hidden = false;
  quizMeter.value = quizData.length;
  quizCount.textContent = "Percorso completato";
  const direct = state.quiz.score;
  const recovered = state.quiz.recoveries.length;
  quizSummary.innerHTML = `<p class="question-no">Esito</p><h3>${direct} collegamenti diretti su ${quizData.length}</h3><p>${recovered ? `${recovered} errore${recovered === 1 ? " è stato recuperato" : "i sono stati recuperati"} attraverso domande differenti.` : "Non sono stati necessari recuperi."}</p><p>Il punteggio non misura la memoria di date isolate: mostra quanti rapporti fra società, immagine, materia, liturgia e potere hai ricostruito senza mediazione.</p><button type="button" id="quiz-restart">Ricomincia la verifica</button>`;
  quizSummary.querySelector("#quiz-restart").addEventListener("click", () => {
    state.quiz = clone(defaultState.quiz);
    saveState();
    quizSummary.hidden = true;
    quizCard.hidden = false;
    renderQuiz();
  });
}
renderQuiz();

// Visualizzatore accessibile: zoom, trascinamento, pinch, Escape e focus trap.
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxClose = document.querySelector("#lightbox-close");
const zoomIn = document.querySelector("#zoom-in");
const zoomOut = document.querySelector("#zoom-out");
const zoomReset = document.querySelector("#zoom-reset");
const lightboxStage = document.querySelector("#lightbox-stage");
let lightboxReturnFocus = null;
let scale = 1;
let panX = 0;
let panY = 0;
const pointers = new Map();
let pinchDistance = 0;
let pinchScale = 1;
let dragStart = null;

function applyTransform() {
  lightboxImage.style.transform = `translate(${panX}px,${panY}px) scale(${scale})`;
  zoomReset.textContent = `${Math.round(scale * 100)}%`;
}
function setScale(next) {
  scale = Math.min(5, Math.max(1, next));
  if (scale === 1) { panX = 0; panY = 0; }
  applyTransform();
}
function openLightbox(button) {
  lightboxReturnFocus = button;
  lightboxImage.src = button.dataset.image;
  lightboxImage.alt = button.dataset.caption || "Opera ingrandita";
  lightboxCaption.textContent = button.dataset.caption || "";
  lightbox.hidden = false;
  document.body.classList.add("dialog-open");
  scale = 1; panX = 0; panY = 0; applyTransform();
  lightboxClose.focus();
}
function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = "";
  document.body.classList.remove("dialog-open");
  pointers.clear();
  lightboxReturnFocus?.focus();
}
document.querySelectorAll(".zoom-open").forEach(button => button.addEventListener("click", () => openLightbox(button)));
lightboxClose.addEventListener("click", closeLightbox);
zoomIn.addEventListener("click", () => setScale(scale + .25));
zoomOut.addEventListener("click", () => setScale(scale - .25));
zoomReset.addEventListener("click", () => { scale = 1; panX = 0; panY = 0; applyTransform(); });

lightboxStage.addEventListener("wheel", event => {
  event.preventDefault();
  setScale(scale + (event.deltaY < 0 ? .2 : -.2));
}, { passive:false });

function distanceBetweenPointers() {
  const [a,b] = [...pointers.values()];
  return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
}
lightboxStage.addEventListener("pointerdown", event => {
  lightboxStage.setPointerCapture?.(event.pointerId);
  pointers.set(event.pointerId, { x:event.clientX, y:event.clientY });
  if (pointers.size === 2) {
    pinchDistance = distanceBetweenPointers();
    pinchScale = scale;
    dragStart = null;
  } else if (pointers.size === 1 && scale > 1) {
    dragStart = { x:event.clientX, y:event.clientY, panX, panY };
  }
});
lightboxStage.addEventListener("pointermove", event => {
  if (!pointers.has(event.pointerId)) return;
  pointers.set(event.pointerId, { x:event.clientX, y:event.clientY });
  if (pointers.size === 2) {
    const nextDistance = distanceBetweenPointers();
    if (pinchDistance) setScale(pinchScale * nextDistance / pinchDistance);
  } else if (dragStart && scale > 1) {
    panX = dragStart.panX + event.clientX - dragStart.x;
    panY = dragStart.panY + event.clientY - dragStart.y;
    applyTransform();
  }
});
function endPointer(event) {
  pointers.delete(event.pointerId);
  dragStart = null;
  if (pointers.size < 2) pinchDistance = 0;
}
lightboxStage.addEventListener("pointerup", endPointer);
lightboxStage.addEventListener("pointercancel", endPointer);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (!lightbox.hidden) closeLightbox();
    else if (!nav.hidden) closeNav();
    return;
  }
  if (event.key === "Tab" && !lightbox.hidden) {
    const focusables = [...lightbox.querySelectorAll("button:not([disabled])")];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

if ("serviceWorker" in navigator) {
  addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(error => console.warn("Service Worker non registrato:", error)));
}
