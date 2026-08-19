"use strict";

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STATE_KEY = "storia-sguardo-14-state";
  const STATE_VERSION = 1;
  const TOTAL_STEPS = 13;

  const defaultState = {
    version: STATE_VERSION,
    visited: [],
    notes: { opening: "", return: "", general: "" },
    timeline: null,
    causal: null,
    term: "experience",
    myths: [],
    instant: { time: "dawn", weather: "mist", viewpoint: "quay", distance: "mid", crop: "open", stroke: "fractured", temperature: "balance", figures: "present", definition: "mixed", memory: "immediate" },
    monetLayers: [], cityLayers: [], stationLayers: [],
    viewpoint: [], leisure: [],
    women: "morisot",
    gaze: { looks: "artist", watched: "subject", position: "threshold", mobility: "conditioned" },
    series: "summer",
    compare: "time",
    quiz: { order: [], cursor: 0, mastered: [], attempts: {}, recoveries: [], completed: false }
  };

  let storageMessage = "";
  const asArray = value => Array.isArray(value) ? value : [];
  const asObject = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  function loadState() {
    let stored = null;
    try { stored = localStorage.getItem(STATE_KEY); }
    catch (error) { storageMessage = "Il browser impedisce l’accesso all’archivio locale: il modulo resta utilizzabile, ma questa sessione potrebbe non essere salvata."; }
    if (!stored) return structuredClone(defaultState);
    try {
      const raw = asObject(JSON.parse(stored));
      if (raw.version !== STATE_VERSION) storageMessage = "Il salvataggio precedente è stato adattato alla versione corrente del modulo.";
      return {
        ...structuredClone(defaultState), ...raw, version: STATE_VERSION,
        visited: asArray(raw.visited).filter(n => Number.isInteger(n) && n >= 1 && n <= TOTAL_STEPS),
        notes: { ...defaultState.notes, ...asObject(raw.notes) },
        instant: { ...defaultState.instant, ...asObject(raw.instant) },
        monetLayers: asArray(raw.monetLayers), cityLayers: asArray(raw.cityLayers), stationLayers: asArray(raw.stationLayers),
        viewpoint: asArray(raw.viewpoint), leisure: asArray(raw.leisure), myths: asArray(raw.myths),
        gaze: { ...defaultState.gaze, ...asObject(raw.gaze) },
        quiz: { ...defaultState.quiz, ...asObject(raw.quiz), order: asArray(raw.quiz?.order), mastered: asArray(raw.quiz?.mastered), attempts: asObject(raw.quiz?.attempts), recoveries: asArray(raw.quiz?.recoveries) }
      };
    } catch (error) {
      try { localStorage.removeItem(STATE_KEY); } catch (storageError) { /* archivio non disponibile */ }
      storageMessage = "Il salvataggio locale non era leggibile: è stato isolato e il modulo è ripartito senza perdere dati esterni.";
      return structuredClone(defaultState);
    }
  }
  let state = loadState();
  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }
    catch (error) { showStorageNotice("Il browser non consente di salvare altri dati locali. Le attività continuano, ma le nuove scelte potrebbero non restare dopo la chiusura."); }
    updateProgress();
    updateSynthesis();
  }
  function showStorageNotice(message) {
    const notice = $("#storageNotice");
    notice.textContent = message; notice.hidden = false;
    window.setTimeout(() => { notice.hidden = true; }, 8000);
  }
  if (storageMessage) window.setTimeout(() => showStorageNotice(storageMessage), 500);
  state.quiz.cursor = Math.max(0, Math.min(12, Number(state.quiz.cursor) || 0));
  if (state.quiz.cursor === 12 && state.quiz.mastered.length < 12) state.quiz.cursor = 0;

  function setSaved(id) {
    const element = $(id);
    if (!element) return;
    element.textContent = "Salvato sul dispositivo";
    window.clearTimeout(element._timer);
    element._timer = window.setTimeout(() => { element.textContent = ""; }, 1800);
  }

  // Menu, taccuino e gestione del focus.
  const menu = $("#chapterMenu");
  const notesDrawer = $("#notesDrawer");
  const scrim = $("#menuScrim");
  let activeDrawer = null;
  let returnFocus = null;
  function focusables(root) { return $$('a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])', root).filter(el => !el.hidden); }
  function openDrawer(drawer, trigger) {
    closeDrawer(false);
    returnFocus = trigger; activeDrawer = drawer; drawer.hidden = false; scrim.hidden = false;
    document.body.classList.add("drawer-open"); trigger.setAttribute("aria-expanded", "true");
    focusables(drawer)[0]?.focus();
  }
  function closeDrawer(restore = true) {
    if (!activeDrawer) return;
    activeDrawer.hidden = true; scrim.hidden = true; document.body.classList.remove("drawer-open");
    $("#menuButton").setAttribute("aria-expanded", "false"); $("#notesButton").setAttribute("aria-expanded", "false");
    const focusTarget = returnFocus; activeDrawer = null; returnFocus = null;
    if (restore) focusTarget?.focus();
  }
  $("#menuButton").addEventListener("click", event => openDrawer(menu, event.currentTarget));
  $("#notesButton").addEventListener("click", event => openDrawer(notesDrawer, event.currentTarget));
  $("#menuClose").addEventListener("click", () => closeDrawer());
  $("#notesClose").addEventListener("click", () => closeDrawer());
  scrim.addEventListener("click", () => closeDrawer());
  $$("#chapterMenu a").forEach(link => link.addEventListener("click", () => closeDrawer(false)));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (!$("#lightbox").hidden) closeLightbox(); else closeDrawer();
    }
    if (event.key === "Tab" && activeDrawer) {
      const items = focusables(activeDrawer); if (!items.length) return;
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  // Taccuini.
  const openingNote = $("#openingNote"), returnNote = $("#returnNote"), generalNotes = $("#generalNotes");
  openingNote.value = state.notes.opening; returnNote.value = state.notes.return; generalNotes.value = state.notes.general;
  function bindNote(element, key, status) {
    element.addEventListener("input", () => { state.notes[key] = element.value; saveState(); setSaved(status); updateOpeningMemory(); });
  }
  bindNote(openingNote, "opening", "#openingSave"); bindNote(returnNote, "return", "#returnSave"); bindNote(generalNotes, "general", "#notesSave");
  $("#notesReset").addEventListener("click", () => { if (confirm("Azzero soltanto il taccuino trasversale?")) { generalNotes.value = ""; state.notes.general = ""; saveState(); setSaved("#notesSave"); } });
  function updateOpeningMemory() { $("#openingMemory").textContent = state.notes.opening.trim() || "Non hai ancora scritto un’annotazione."; }
  updateOpeningMemory();

  // Avanzamento reale attraverso le sezioni.
  function updateProgress() {
    state.visited = [...new Set(state.visited)].sort((a, b) => a - b);
    $("#readingProgress").value = state.visited.length;
    $("#progressText").textContent = `${state.visited.length} di ${TOTAL_STEPS} tappe`;
    $$("#chapterMenu a").forEach((link, index) => link.classList.toggle("visited", state.visited.includes(index + 1)));
  }
  const observer = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach(entry => {
      const step = Number(entry.target.dataset.step);
      if (!state.visited.includes(step)) { state.visited.push(step); saveState(); }
    });
  }, { threshold: .24, rootMargin: "-10% 0px -35%" });
  $$(".tracked").forEach(section => observer.observe(section));
  updateProgress();

  // Cronologia.
  const timelineData = [
    { year: "1838–1839", title: "Fotografia", text: "Daguerre realizza il Boulevard du Temple nel 1838; nel 1839 il procedimento viene annunciato pubblicamente. La fotografia non sostituisce la pittura: modifica con essa la cultura del taglio, della durata e della prova visiva." },
    { year: "1841", title: "Colori in tubetto", text: "Il brevetto di John Goffe Rand rende più pratico conservare e trasportare il colore. Agevola il lavoro fuori dallo studio, ma non produce automaticamente l’Impressionismo né elimina la rielaborazione." },
    { year: "1853–1870", title: "Parigi trasformata", text: "Gli interventi legati a Napoleone III e Haussmann aprono boulevard, parchi e infrastrutture. Migliorano circolazione e controllo, ma comportano demolizioni, spostamenti e nuove gerarchie urbane." },
    { year: "anni 1850–1860", title: "Ferrovie e periferie", text: "La rete ferroviaria accelera gli spostamenti fra centro, sobborghi, industrie e luoghi di svago. Stazioni e ponti diventano nuove architetture del tempo moderno." },
    { year: "1863", title: "Salon des Refusés", text: "Napoleone III autorizza un’esposizione delle opere rifiutate dal Salon. Non è la prima mostra impressionista, ma rende visibile il conflitto fra selezione ufficiale, artisti e pubblico." },
    { year: "anni 1860", title: "Stampe giapponesi", text: "La crescente circolazione degli ukiyo-e offre tagli decentrati, superfici e rapporti spaziali diversi. Gli artisti europei li rielaborano in modi differenti: non si tratta di una ricetta unica." },
    { year: "1870–1871", title: "Guerra e Comune", text: "La guerra franco-prussiana, l’assedio di Parigi e la Comune interrompono vite e carriere. Il nuovo gruppo espositivo nasce dopo una crisi politica e sociale, non dentro una modernità pacificata." },
    { year: "15 aprile 1874", title: "Prima mostra indipendente", text: "La Société anonyme des artistes peintres, sculpteurs, graveurs, etc. apre al 35 boulevard des Capucines, negli spazi già usati da Nadar. L’indipendenza riguarda anche chi decide l’accesso al pubblico." },
    { year: "25 aprile 1874", title: "Louis Leroy", text: "Su Le Charivari, Leroy costruisce una recensione satirica e usa il titolo Impression, soleil levant per colpire opere giudicate incompiute. Il nome nasce anche come arma critica." },
    { year: "1874–1886", title: "Otto esposizioni", text: "Il gruppo organizza otto mostre, con partecipazioni e orientamenti variabili. Morisot espone in sette; Monet non partecipa a tutte; Manet non espone mai con il gruppo." },
    { year: "anni 1870–1880", title: "Nuovi spazi sociali", text: "Caffè, teatri, giardini, grandi magazzini e locali da ballo rendono visibili consumi e tempo libero. Accesso, libertà di movimento e possibilità di osservare restano condizionati da classe e genere." },
    { year: "anni 1880–1890", title: "Mercato e serie", text: "Mercanti come Paul Durand-Ruel e collezionisti costruiscono nuovi circuiti. Monet intensifica la pittura in serie: la ripetizione diventa un modo di confrontare le trasformazioni del visibile." }
  ];
  function renderTimeline() {
    $("#timeline").innerHTML = timelineData.map((item, index) => `<button type="button" aria-pressed="${state.timeline === index}"><b>${item.year}</b><span>${item.title}</span></button>`).join("");
    $$("#timeline button").forEach((button, index) => button.addEventListener("click", () => { state.timeline = index; saveState(); renderTimeline(); }));
    const item = state.timeline === null ? null : timelineData[state.timeline];
    $("#timelineReading").innerHTML = item ? `<h3>${item.year} · ${item.title}</h3><p>${item.text}</p>` : "<h3>Apri un nodo temporale</h3><p>La sequenza non descrive una marcia inevitabile: serve a controllare sovrapposizioni, fratture e durate.</p>";
  }
  $("#timelineReset").addEventListener("click", () => { state.timeline = null; saveState(); renderTimeline(); });
  renderTimeline();

  const causalData = [
    { id: "city", label: "Città", title: "Boulevard e punti di vista", text: "La nuova metropoli apre prospettive rialzate, flussi e vetrine; produce anche demolizioni, controllo e distanza sociale. Si collega a mobilità, consumo e fotografia." },
    { id: "rail", label: "Mobilità", title: "Ferrovia e tempo coordinato", text: "Treni e stazioni uniscono centro, periferie, lavoro e svago. La velocità modifica la durata dell’esperienza e rende la stazione un soggetto di luce, ferro e vapore." },
    { id: "photo", label: "Cultura visiva", title: "Fotografia, stampe, inquadrature", text: "Fotografia e ukiyo-e moltiplicano tagli, serie, istanti e superfici. La pittura reagisce senza obbedire a una causa unica e continua a costruire ciò che mostra." },
    { id: "materials", label: "Materiali", title: "Pratiche più mobili", text: "Colori trasportabili e attrezzature più leggere rendono più agevole lavorare fuori dallo studio. Non garantiscono uno stile e non dimostrano che un dipinto sia stato completato all’aperto." },
    { id: "institutions", label: "Istituzioni", title: "Salon, rifiuto, indipendenza", text: "Il sistema ufficiale stabilisce gerarchie e accesso. Mostre indipendenti e critica creano nuovi pubblici, ma anche nuovi rischi economici e nuove etichette." },
    { id: "politics", label: "Crisi politica", title: "Guerra, Comune, ricostruzione", text: "L’Impressionismo si organizza dopo guerra e repressione. La brillantezza delle immagini non cancella la violenza storica che precede la nuova vita urbana." },
    { id: "market", label: "Mercato", title: "Mercanti, collezionisti, circolazione", text: "Nuove reti commerciali riducono la dipendenza dal Salon e favoriscono carriere internazionali. La libertà espositiva resta legata a risorse, relazioni e compratori." },
    { id: "leisure", label: "Pratiche sociali", title: "Loisir, consumo, genere", text: "La città offre nuovi luoghi da abitare e osservare. Tempo libero, sicurezza, reputazione e mobilità non sono distribuiti nello stesso modo fra classi e generi." }
  ];
  function renderCausal() {
    $("#causalNodes").innerHTML = causalData.map(item => `<button type="button" aria-pressed="${state.causal === item.id}">${item.label}</button>`).join("");
    $$("#causalNodes button").forEach((button, index) => button.addEventListener("click", () => { state.causal = causalData[index].id; saveState(); renderCausal(); }));
    const item = causalData.find(entry => entry.id === state.causal);
    $("#causalReading").innerHTML = item ? `<h3>${item.title}</h3><p>${item.text}</p>` : "<h3>Nessuna causa isolata</h3><p>Seleziona un nodo: ogni lettura rimanderà ad altri elementi della rete.</p>";
  }
  $("#causalReset").addEventListener("click", () => { state.causal = null; saveState(); renderCausal(); });
  renderCausal();

  // Definizioni e formule semplificate.
  const terms = [
    { id: "experience", label: "Esperienza percettiva", title: "Vedere diventa un evento nel tempo", text: "La realtà non è soltanto davanti al pittore: appare a un corpo situato, in un momento, sotto una luce e dentro pratiche sociali. L’istante è la forma costruita di questa relazione." },
    { id: "group", label: "Gruppo espositivo", title: "Un’alleanza, non un esercito stilistico", text: "Gli artisti organizzano esposizioni indipendenti fra 1874 e 1886. Partecipazioni, tecniche e posizioni divergono: Degas non condivide il culto dell’en plein air; Morisot porta esperienze e soggetti specifici; Cézanne apre altri problemi." },
    { id: "label", label: "Etichetta critica", title: "Un insulto può cambiare segno", text: "La parola si lega alla recensione satirica di Louis Leroy e al titolo di Monet. Viene poi adottata e trasformata, ma non definisce retroattivamente ogni opera nello stesso modo." },
    { id: "practice", label: "Pratiche", title: "All’aperto, in studio, per serie", text: "Lavorare davanti al motivo conta, ma molte tele vengono riprese, organizzate o completate in studio. La pennellata visibile è una decisione; non è il cronometro dell’esecuzione." },
    { id: "modernity", label: "Modernità", title: "Nuovi luoghi cambiano il modo di guardare", text: "Boulevard, balconi, treni, teatri, caffè e luoghi di svago modificano mobilità, distanze e pubblici. La modernità offre spettacolo e libertà ad alcuni, anonimato ed esclusione ad altri." }
  ];
  function renderTerms() {
    $("#termTabs").innerHTML = terms.map(item => `<button id="term-${item.id}" type="button" role="tab" aria-selected="${state.term === item.id}" aria-controls="termReading">${item.label}</button>`).join("");
    $$("#termTabs button").forEach((button, index) => button.addEventListener("click", () => { state.term = terms[index].id; saveState(); renderTerms(); }));
    const item = terms.find(entry => entry.id === state.term) || terms[0];
    $("#termReading").innerHTML = `<h3>${item.title}</h3><p>${item.text}</p>`;
  }
  $("#termReset").addEventListener("click", () => { state.term = "experience"; saveState(); renderTerms(); });
  renderTerms();
  const myths = [
    ["camera", "Fotografia contro pittura", "Entrambe trasformano la cultura visiva; nessuna costringe meccanicamente l’altra."],
    ["tube", "I tubetti inventano l’Impressionismo", "Rendono alcune pratiche più mobili, ma sono una condizione fra molte, non una causa sufficiente."],
    ["fast", "Pennellata rapida = quadro rapido", "Un tocco visibile può essere controllato, ripreso e organizzato a lungo."],
    ["outside", "Tutto completato all’aperto", "Il lavoro davanti al motivo convive con selezione, memoria e rielaborazione in studio."],
    ["happy", "Modernità felice", "Feste e boulevard contengono lavoro invisibile, distanza, controllo ed esclusione."],
    ["same", "Un gruppo unitario", "Le mostre riuniscono artisti con tecniche, soggetti e idee non sovrapponibili."]
  ];
  function renderMyths() {
    $("#mythGrid").innerHTML = myths.map(([id, label, answer]) => `<button type="button" class="${state.myths.includes(id) ? "revealed" : ""}" aria-expanded="${state.myths.includes(id)}"><b>${label}</b>${state.myths.includes(id) ? `<span>${answer}</span>` : "<span>Metti alla prova la formula</span>"}</button>`).join("");
    $$("#mythGrid button").forEach((button, index) => button.addEventListener("click", () => { const id = myths[index][0]; state.myths = state.myths.includes(id) ? state.myths.filter(value => value !== id) : [...state.myths, id]; saveState(); renderMyths(); }));
  }
  renderMyths();

  // Laboratorio dell’istante.
  const instantParams = [
    { key: "time", label: "Ora", options: [["dawn","alba","La luce radente riduce i contrasti e rende incerto il passaggio fra acqua e cielo."],["noon","mezzogiorno","Una luce più uniforme aumenta la leggibilità ma può attenuare l’atmosfera."],["evening","sera","Il calo luminoso concentra l’attenzione su contrasti e segnali cromatici."]] },
    { key: "weather", label: "Atmosfera", options: [["clear","aria limpida","Contorni e distanze si separano più nettamente."],["mist","foschia","L’atmosfera diventa un mezzo che avvicina e confonde i piani."],["rain","pioggia","Riflessi e veli rendono instabili superfici e movimento."]] },
    { key: "viewpoint", label: "Punto di vista", options: [["quay","davanti al bacino","L’osservatore condivide la soglia fra acqua e attività portuale."],["balcony","dall’alto","Il controllo visivo cresce insieme alla distanza dai corpi."],["low","raso d’acqua","La superficie occupa più spazio e riduce la visione d’insieme."]] },
    { key: "distance", label: "Distanza", options: [["near","vicina","Il dettaglio materiale aumenta, ma il contesto si restringe."],["mid","media","Barca, porto e atmosfera restano in tensione."],["far","lontana","La scena diventa sistema di masse e ritmi più che somma di oggetti."]] },
    { key: "crop", label: "Inquadratura", options: [["open","aperta","Il bacino conserva respiro e relazioni laterali."],["tight","serrata","Sole e barca dominano; parte del porto viene esclusa."],["diagonal","diagonale","Il percorso dello sguardo accentua movimento e direzione."]] },
    { key: "stroke", label: "Tocco", options: [["compact","compatto","La superficie tende a unificare gli oggetti."],["fractured","frammentato","Segni distinti fanno lavorare l’occhio nella ricomposizione."],["thin","sottile","Il supporto e la preparazione possono entrare nell’effetto finale."]] },
    { key: "temperature", label: "Relazione cromatica", options: [["balance","caldo / freddo","Il piccolo arancione acquista intensità dentro una dominante fredda."],["warm","prevalenza calda","L’atmosfera sembra più densa e ravvicinata."],["cold","prevalenza fredda","Distanza e umidità sembrano estendersi."]] },
    { key: "figures", label: "Figure", options: [["present","poche figure","I corpi danno scala senza diventare ritratti."],["none","nessuna figura","L’esperienza sociale del porto rischia di diventare puro paesaggio."],["crowd","folla","Il ritmo collettivo può prevalere sulla singola percezione."]] },
    { key: "definition", label: "Definizione", options: [["low","bassa","L’identificazione degli oggetti cede alla relazione atmosferica."],["mixed","selettiva","Alcuni segnali guidano lo sguardo, altri restano aperti."],["high","alta","Aumenta la descrizione, non necessariamente la verità dell’esperienza."]] },
    { key: "memory", label: "Elaborazione", options: [["immediate","memoria immediata","La percezione recente orienta selezione e sintesi."],["studio","rielaborazione in studio","L’apparente istante viene controllato e messo in relazione sulla tela."],["repeated","osservazione ripetuta","Più incontri con il motivo rendono confrontabili le sue trasformazioni."]] }
  ];
  function renderInstant() {
    $("#instantControls").innerHTML = instantParams.map(param => `<div class="parameter-control"><label for="instant-${param.key}">${param.label}</label><select id="instant-${param.key}">${param.options.map(([value,label]) => `<option value="${value}" ${state.instant[param.key] === value ? "selected" : ""}>${label}</option>`).join("")}</select></div>`).join("");
    instantParams.forEach(param => $("#instant-" + param.key).addEventListener("change", event => { state.instant[param.key] = event.target.value; saveState(); renderInstant(); }));
    const stage = $("#instantStage"); instantParams.forEach(param => stage.dataset[param.key] = state.instant[param.key]);
    const choices = instantParams.map(param => { const option = param.options.find(([value]) => value === state.instant[param.key]); return `<li><b>${param.label}: ${option[1]}.</b> ${option[2]}</li>`; });
    $("#instantReading").innerHTML = `<h3>La tua costruzione dell’istante</h3><ul>${choices.join("")}</ul><p><b>Non hai registrato un istante neutrale:</b> hai costruito una particolare esperienza del tempo attraverso dieci decisioni.</p>`;
  }
  $("#instantReset").addEventListener("click", () => { state.instant = structuredClone(defaultState.instant); saveState(); renderInstant(); });
  renderInstant();

  // Analisi stratificate.
  function setupLayers(config) {
    const { stateKey, data, buttons, stage, reading, equivalent, reset } = config;
    function render() {
      const active = state[stateKey];
      $(buttons).innerHTML = data.map(item => `<button type="button" aria-pressed="${active.includes(item.id)}">${item.label}</button>`).join("");
      $$(buttons + " button").forEach((button, index) => button.addEventListener("click", () => { const id = data[index].id; state[stateKey] = active.includes(id) ? active.filter(value => value !== id) : [...active, id]; saveState(); render(); }));
      $$(`${stage} [data-layer], ${stage} span`).forEach(span => span.classList.toggle("active", active.includes(span.dataset.layer || [...span.classList].find(name => data.some(item => item.id === name)))));
      const selected = data.filter(item => active.includes(item.id));
      $(reading).innerHTML = selected.length ? selected.map(item => `<h3>${item.label}</h3><p>${item.text}</p>`).join("") : `<h3>${config.emptyTitle}</h3><p>${config.emptyText}</p>`;
      $(equivalent).textContent = selected.length ? `Strati attivi: ${selected.map(item => item.label).join(", ")}.` : "Nessuno strato attivo.";
    }
    $(reset).addEventListener("click", () => { state[stateKey] = []; saveState(); render(); });
    render();
  }
  const monetLayers = [
    { id:"port",label:"Porto industriale",text:"Ciminiere, alberi, gru e attività portuale non scompaiono: diventano presenze immerse nell’atmosfera. La modernità industriale è dentro l’immagine, non dietro un paesaggio naturale." },
    { id:"mist",label:"Foschia",text:"La foschia non è un velo decorativo. Modifica distanze, contrasti e riconoscibilità: rende visibile il mezzo attraverso cui vediamo." },
    { id:"sun",label:"Sole arancione",text:"Il piccolo disco non descrive con gradazioni la luminosità. La sua intensità nasce soprattutto dal contrasto con i blu-verdi circostanti: una relazione cromatica guida lo sguardo." },
    { id:"water",label:"Acqua e riflessi",text:"Tocchi separati non chiudono una superficie continua. L’occhio collega segni verticali e orizzontali e costruisce insieme movimento, luce e profondità." },
    { id:"boats",label:"Barche e figure",text:"Le sagome scure stabiliscono scala, direzione e presenza umana senza trasformarsi in ritratti. Il porto è un luogo lavorato e attraversato." },
    { id:"horizon",label:"Profondità e orizzonte",text:"La profondità non dipende da contorni netti: si forma per sovrapposizioni, raffreddamento cromatico, perdita di contrasto e distribuzione dei segni." },
    { id:"stroke",label:"Pennellata",text:"Il tocco resta visibile e non finge una superficie senza lavoro. La frammentazione è una scelta controllata: non dimostra da sola esecuzione rapida." },
    { id:"title",label:"Titolo",text:"“Impressione” dichiara un rapporto con l’apparizione senza trasformare la tela in un semplice abbozzo privato. Il titolo diventa materiale della ricezione." },
    { id:"show",label:"Mostra del 1874",text:"Il quadro viene esposto dalla Société anonyme nello spazio indipendente del boulevard des Capucines. Il contesto espositivo fa parte del suo significato storico." },
    { id:"review",label:"Ricezione critica",text:"La satira di Leroy lega polemicamente il titolo di Monet al gruppo. Il movimento non nasce da una battuta, ma la battuta fornisce un’etichetta destinata a circolare." }
  ];
  setupLayers({ stateKey:"monetLayers",data:monetLayers,buttons:"#monetButtons",stage:"#monetStage",reading:"#monetReading",equivalent:"#monetEquivalent",reset:"#monetReset",emptyTitle:"Scegli un livello",emptyText:"Porto, atmosfera, tempo, tecnica e ricezione costruiscono insieme l’opera." });

  const cityLayers = [
    { id:"balcony",label:"Balcone",text:"Il punto di vista rialzato offre un controllo panoramico e una visuale protetta. La modernità viene osservata da una posizione architettonica e sociale precisa." },
    { id:"flow",label:"Flusso",text:"La profondità del boulevard conduce lo sguardo e trasforma il traffico in direzione. Lo spazio urbano appare come circolazione continua." },
    { id:"crowd",label:"Folla-segno",text:"Da lontano le persone diventano tocchi verticali. Il quadro rende il ritmo collettivo, ma perde volti, mestieri e biografie." },
    { id:"facades",label:"Facciate e vetrine",text:"La strada è incorniciata da edifici, balconi e consumo. Il nuovo spazio pubblico è anche una scena commerciale." },
    { id:"blind",label:"Zona cieca",text:"Ogni veduta panoramica esclude: non mostra le demolizioni haussmanniane, gli spostamenti degli abitanti, il lavoro di manutenzione e ciò che accade sotto il balcone." }
  ];
  setupLayers({ stateKey:"cityLayers",data:cityLayers,buttons:"#cityButtons",stage:"#cityStage",reading:"#cityReading",equivalent:"#cityEquivalent",reset:"#cityReset",emptyTitle:"Scegli un dispositivo urbano",emptyText:"Il punto panoramico non è neutrale: rende leggibile un flusso e produce una zona cieca." });

  const stationLayers = [
    { id:"iron",label:"Ferro e vetro",text:"La copertura moderna non è un fondale: ordina campate, direzioni e luce. L’ingegneria diventa una condizione della percezione." },
    { id:"steam",label:"Vapore",text:"Il vapore è prodotto tecnico e fenomeno atmosferico. Nasconde, diffonde la luce e rende mobili i confini fra macchina, spazio e aria." },
    { id:"tracks",label:"Binari",text:"Le linee convergenti guidano verso il fondo e collegano la stazione a una rete che supera il quadro. Spazio pittorico e sistema ferroviario condividono direzione." },
    { id:"crowd",label:"Folla",text:"Figure ridotte a segni rendono l’attesa e il passaggio, ma non distribuiscono allo stesso modo classe, destinazione e libertà di movimento." },
    { id:"light",label:"Luce filtrata",text:"Vetro, vapore e aperture trasformano la luce naturale in un fenomeno interno all’architettura industriale." },
    { id:"threshold-mark",label:"Soglia",text:"La stazione unisce centro e periferia, lavoro e svago, orari privati e tempo coordinato. È un luogo di partenza e una macchina sociale." }
  ];
  setupLayers({ stateKey:"stationLayers",data:stationLayers,buttons:"#stationButtons",stage:"#stationStage",reading:"#stationReading",equivalent:"#stationEquivalent",reset:"#stationReset",emptyTitle:"Scegli un elemento della stazione",emptyText:"Qui natura e tecnologia non sono opposti: luce e atmosfera vengono trasformate dalla macchina urbana." });

  // Punto di vista urbano e loisir.
  const viewpoints = [["visible","Ciò che diventa visibile","flussi, densità, ritmo, nuove facciate e profondità del boulevard"],["hidden","Ciò che resta nascosto","lavoro, demolizioni, sfratti, biografie e zona immediatamente sotto l’osservatore"],["position","La posizione di chi guarda","un interno o balcone protetto, separato dalla folla"],["distance","L’effetto della distanza","la città diventa leggibile come sistema, le persone meno riconoscibili come individui"]];
  function renderViewpoints() {
    $("#viewpointChoices").innerHTML = viewpoints.map(([id,label]) => `<button type="button" aria-pressed="${state.viewpoint.includes(id)}">${label}</button>`).join("");
    $$("#viewpointChoices button").forEach((button,index) => button.addEventListener("click", () => { const id=viewpoints[index][0]; state.viewpoint=state.viewpoint.includes(id)?state.viewpoint.filter(value=>value!==id):[...state.viewpoint,id]; saveState(); renderViewpoints(); }));
    const selected=viewpoints.filter(([id])=>state.viewpoint.includes(id));
    $("#viewpointSummary").textContent=selected.length?selected.map(([,label,text])=>`${label}: ${text}.`).join(" "):"Seleziona almeno una dimensione del punto di vista.";
  }
  renderViewpoints();
  const leisureQuestions = [
    ["access","Chi può permettersi di essere qui?","Tempo libero, reddito, abiti e trasporto selezionano l’accesso."],
    ["labor","Chi lavora mentre altri si divertono?","Servizio, pulizia, musica, produzione e cura sostengono la scena senza occuparne il centro."],
    ["center","Quali corpi occupano il centro?","Età, abiti, coppie e gruppi costruiscono una sociabilità riconoscibile, ma non universale."],
    ["margin","Chi resta anonimo o marginale?","Molte figure diventano folla e funzione atmosferica."],
    ["inside","Guardiamo dall’interno o dall’esterno?","La composizione ci inserisce vicino ai tavoli, ma la partecipazione resta costruita dal pittore."],
    ["studio","La scena è davvero spontanea?","Modelli, studi, lavoro sul posto e completamento in atelier producono l’immediatezza."]
  ];
  function renderLeisure() {
    $("#leisureChecks").innerHTML=leisureQuestions.map(([id,label])=>`<button type="button" aria-pressed="${state.leisure.includes(id)}">${label}</button>`).join("");
    $$("#leisureChecks button").forEach((button,index)=>button.addEventListener("click",()=>{const id=leisureQuestions[index][0];state.leisure=state.leisure.includes(id)?state.leisure.filter(v=>v!==id):[...state.leisure,id];saveState();renderLeisure();}));
    const selected=leisureQuestions.filter(([id])=>state.leisure.includes(id));
    $("#leisureReading").innerHTML=selected.length?`<h3>La festa interrogata</h3>${selected.map(([,label,text])=>`<p><b>${label}</b> ${text}</p>`).join("")}`:"<h3>Apri una domanda</h3><p>La luce gioiosa non mente, ma non dice da sola chi rende possibile il tempo libero.</p>";
  }
  $("#leisureReset").addEventListener("click",()=>{state.leisure=[];saveState();renderLeisure();});renderLeisure();

  // Donne, accessi e reciprocità dello sguardo.
  const women = [
    { id:"morisot",label:"Berthe Morisot",image:"assets/images/morisot-cradle.webp",width:1500,height:1827,alt:"Una donna osserva una bambina addormentata dietro il velo di una culla; il gesto della madre e il tessuto costruiscono diagonali speculari.",title:"Le Berceau / La culla · 1872",caption:"Berthe Morisot, Le Berceau, 1872, Musée d’Orsay.",text:"Morisot espone in sette delle otto mostre del gruppo. Qui sua sorella Edma veglia sulla figlia Blanche. Il velo protegge e separa; il gesto della madre ripete la diagonale della culla. La cura è lavoro, attenzione e tempo sospeso, non sentimentalismo automatico. La sfera domestica è anche il risultato di accessi sociali differenziati agli spazi pubblici e professionali.",questions:["Chi osserva senza essere visto?","Il velo è protezione, cornice o distanza?","La cura rende libero il tempo della madre?","Che cosa trasforma l’intimità in soggetto moderno?"] },
    { id:"cassatt",label:"Mary Cassatt",image:"assets/images/cassatt-in-the-loge.webp",width:1600,height:1989,alt:"Una donna in nero osserva il teatro con un binocolo; sullo sfondo, un uomo da un altro palco punta a sua volta il binocolo verso di lei.",title:"In the Loge · 1878",caption:"Mary Cassatt, In the Loge, 1878, Museum of Fine Arts, Boston.",text:"Una donna usa il binocolo e agisce come osservatrice; un uomo, sullo sfondo, dirige il proprio strumento verso di lei. Il teatro è uno spazio pubblico regolato: permette di guardare e trasforma chi guarda in spettacolo. Cassatt costruisce reciprocità e asimmetria senza ridurre la protagonista a oggetto passivo.",questions:["Chi guarda per primo?","Chi è osservato mentre osserva?","Il palco protegge o espone?","La presenza pubblica coincide con libertà di movimento?"] }
  ];
  function renderWomen() {
    $("#womenTabs").innerHTML=women.map(item=>`<button id="women-${item.id}" type="button" role="tab" aria-selected="${state.women===item.id}" aria-controls="womenWork">${item.label}</button>`).join("");
    $$("#womenTabs button").forEach((button,index)=>button.addEventListener("click",()=>{state.women=women[index].id;saveState();renderWomen();}));
    const item=women.find(entry=>entry.id===state.women)||women[0];
    $("#womenWork").innerHTML=`<figure class="zoomable"><img src="${item.image}" width="${item.width}" height="${item.height}" loading="lazy" alt="${item.alt}"><button class="open-image" type="button">Apri l’opera</button><figcaption>${item.caption}</figcaption></figure><div class="women-copy"><p class="eyebrow">${item.label}</p><h3>${item.title}</h3><p>${item.text}</p><ul>${item.questions.map(q=>`<li>${q}</li>`).join("")}</ul></div>`;
  }
  renderWomen();
  const gazeData = [
    {key:"looks",label:"Chi guarda?",options:[["artist","l’artista organizza"],["subject","la figura rappresentata"],["public","il pubblico"]]},
    {key:"watched",label:"Chi è guardato?",options:[["subject","la figura rappresentata"],["observer","chi osserva nell’opera"],["mutual","entrambi reciprocamente"]]},
    {key:"position",label:"Da quale posizione?",options:[["threshold","da una soglia protetta"],["domestic","da uno spazio domestico"],["public","da uno spazio pubblico regolato"]]},
    {key:"mobility",label:"Con quale libertà?",options:[["conditioned","condizionata da genere e classe"],["professional","negoziata professionalmente"],["apparent","visibile ma non illimitata"]]}
  ];
  function renderGaze(){
    $("#gazeControls").innerHTML=gazeData.map(item=>`<div class="gaze-control"><p>${item.label}</p><label class="sr-only" for="gaze-${item.key}">${item.label}</label><select id="gaze-${item.key}">${item.options.map(([value,label])=>`<option value="${value}" ${state.gaze[item.key]===value?"selected":""}>${label}</option>`).join("")}</select></div>`).join("");
    gazeData.forEach(item=>$("#gaze-"+item.key).addEventListener("change",event=>{state.gaze[item.key]=event.target.value;saveState();renderGaze();}));
    const selections=gazeData.map(item=>item.options.find(([value])=>value===state.gaze[item.key])[1]);
    $("#gazeSummary").innerHTML=`<h3>La relazione che hai costruito</h3><p>${selections.join("; ")}.</p><p>La cornice sociale non determina automaticamente il significato dell’opera, ma condiziona chi può osservare, essere visto e trasformare l’esperienza in professione.</p>`;
  }
  $("#gazeReset").addEventListener("click",()=>{state.gaze=structuredClone(defaultState.gaze);saveState();renderGaze();});renderGaze();

  // Serie di Monet.
  const seriesData = [
    {id:"summer",label:"Fine estate",image:"assets/images/stacks-summer.webp",width:1800,height:1067,alt:"Due covoni nella luce chiara di fine estate, con ombre blu e campi caldi.",caption:"Fine dell’estate · 1890–1891",time:"luce chiara e avanzata",season:"fine estate",atmosphere:"aria asciutta",shadows:"lunghe, blu-violette",temperature:"gialli e rosa caldi contro ombre fredde",surface:"tocchi fitti ma leggibili",text:"Il campo e i covoni conservano separazioni chiare. Le ombre allungano il tempo del giorno e la relazione caldo-freddo rende visibile la luce senza dipenderne da una descrizione lineare."},
    {id:"autumn",label:"Fine del giorno",image:"assets/images/stacks-autumn.webp",width:1800,height:1158,alt:"Due covoni al termine di una giornata autunnale, immersi in aranci, rosa e violetti.",caption:"Fine del giorno, autunno · 1890–1891",time:"fine del giorno",season:"autunno",atmosphere:"calore sospeso",shadows:"ampie e fuse nel campo",temperature:"arancio, rosa, viola",surface:"più compatta e vibrante",text:"Il motivo diventa una massa calda contro il calare della luce. I contorni non scompaiono per errore: cedono alla continuità cromatica fra oggetto, terreno e atmosfera."},
    {id:"snow",label:"Neve al tramonto",image:"assets/images/stacks-snow.webp",width:1800,height:1157,alt:"Un covone scuro in un campo innevato al tramonto, fra blu, rosa e arancio.",caption:"Tramonto, effetto di neve · 1890–1891",time:"tramonto",season:"inverno",atmosphere:"neve e disgelo",shadows:"fredde, estese",temperature:"freddi dominanti con segnale caldo",surface:"stratificata e meno descrittiva",text:"La neve non è bianca: riflette cielo, ombre e umidità. Il covone resta riconoscibile, ma la sua realtà pittorica dipende dall’insieme di relazioni che lo avvolge."}
  ];
  function renderSeries(){
    const item=seriesData.find(entry=>entry.id===state.series)||seriesData[0];
    const image=$("#seriesImage");image.src=item.image;image.width=item.width;image.height=item.height;image.alt=item.alt;$("#seriesCaption").textContent=item.caption;
    $("#seriesButtons").innerHTML=seriesData.map(entry=>`<button type="button" role="tab" aria-selected="${state.series===entry.id}">${entry.label}</button>`).join("");
    $$("#seriesButtons button").forEach((button,index)=>button.addEventListener("click",()=>{state.series=seriesData[index].id;saveState();renderSeries();}));
    $("#seriesReading").innerHTML=`<h3>${item.caption}</h3><p>${item.text}</p><dl><dt>Ora</dt><dd>${item.time}</dd><dt>Stagione</dt><dd>${item.season}</dd><dt>Atmosfera</dt><dd>${item.atmosphere}</dd><dt>Ombre</dt><dd>${item.shadows}</dd><dt>Temperatura</dt><dd>${item.temperature}</dd><dt>Superficie</dt><dd>${item.surface}</dd></dl>`;
    const rows=[["Ora","time"],["Stagione","season"],["Atmosfera","atmosphere"],["Ombre","shadows"],["Temperatura","temperature"],["Superficie","surface"]];
    $("#seriesMatrix").innerHTML=`<table><thead><tr><th>Categoria</th>${seriesData.map(entry=>`<th>${entry.label}</th>`).join("")}</tr></thead><tbody>${rows.map(([label,key])=>`<tr><td>${label}</td>${seriesData.map(entry=>`<td>${entry[key]}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }
  $("#seriesReset").addEventListener("click",()=>{state.series="summer";saveState();renderSeries();});renderSeries();

  // Atlante comparativo.
  const atlasWorks = [
    {title:"Daguerre",subtitle:"Boulevard du Temple",image:"assets/images/daguerre-boulevard.webp",fields:{subject:"strada urbana registrata tecnicamente",frame:"veduta alta e laterale",viewpoint:"finestra / dispositivo",light:"imprime la lastra",color:"assente nella lastra",stroke:"non pertinente",depth:"prospettiva urbana",space:"quasi svuotato dal tempo",body:"resta chi è fermo",movement:"cancellato dalla lunga esposizione",time:"durata accumulata",work:"invisibile o cancellato",class:"leggibile solo per indizi",gender:"non tematizzato",observer:"operatore e macchina",public:"cultura della prova",technology:"condizione dell’immagine",truth:"indice luminoso e scelta",absence:"traffico in movimento",future:"tempo tecnico dell’immagine"}},
    {title:"Monet",subtitle:"Impression, soleil levant",image:"assets/images/impression-sunrise.webp",fields:{subject:"porto industriale nell’atmosfera",frame:"orizzontale, aperto",viewpoint:"sul bacino, situato",light:"relazione che trasforma",color:"contrasto caldo-freddo",stroke:"visibile e frammentato",depth:"per perdita di contrasto",space:"acqua, foschia, industria",body:"piccole sagome",movement:"riflessi e barche",time:"istante costruito",work:"porto attivo ma non descritto",class:"posizioni non esplicitate",gender:"non tematizzato",observer:"dentro luce e durata",public:"mostra indipendente",technology:"industria nel motivo",truth:"esperienza percettiva",absence:"biografie del porto",future:"percezione come problema"}},
    {title:"Monet",subtitle:"Boulevard des Capucines",image:"assets/images/boulevard-capucines.webp",fields:{subject:"metropoli e folla",frame:"verticale e precipitante",viewpoint:"balcone protetto",light:"diffusa nella strada",color:"ritmo atmosferico",stroke:"folla ridotta a segni",depth:"asse del boulevard",space:"circolazione moderna",body:"segno anonimo",movement:"flusso collettivo",time:"presente accelerato",work:"manutenzione esclusa",class:"distanza del punto alto",gender:"mobilità non distribuita",observer:"separato dalla folla",public:"città come spettacolo",technology:"urbanistica e traffico",truth:"veduta parziale",absence:"demolizioni e individui",future:"anonimato metropolitano"}},
    {title:"Morisot",subtitle:"Le Berceau",image:"assets/images/morisot-cradle.webp",fields:{subject:"cura e maternità",frame:"intimo, verticale",viewpoint:"vicino e domestico",light:"filtrata dai veli",color:"bianchi, neri, rosa",stroke:"rapido in apparenza, controllato",depth:"compressa dal velo",space:"interno sociale",body:"madre e bambina",movement:"gesto sospeso",time:"durata della veglia",work:"cura resa visibile",class:"interno borghese",gender:"accesso e ruoli centrali",observer:"vicino ma separato",public:"intimità esposta in mostra",technology:"non centrale",truth:"esperienza situata",absence:"vita fuori dall’interno",future:"soggetto e sguardo femminili"}},
    {title:"Monet",subtitle:"Covoni in serie",image:"assets/images/stacks-snow.webp",fields:{subject:"motivo ripetuto",frame:"stabile per confrontare",viewpoint:"campagne successive",light:"variabile primaria",color:"tempo reso relazione",stroke:"superficie stratificata",depth:"muta con atmosfera",space:"stesso campo, nuove apparizioni",body:"assente",movement:"trasformazione senza spostamento",time:"serie e differenza",work:"produzione agricola sullo sfondo",class:"proprietà e mercato non visibili",gender:"non tematizzato",observer:"ritorna e confronta",public:"galleria e mercato",technology:"materiali e trasporto",truth:"identità non coincide con apparenza",absence:"processo agricolo",future:"oltre la registrazione ottica"}}
  ];
  const categories=[
    ["subject","Soggetto"],["frame","Inquadratura"],["viewpoint","Punto di vista"],["light","Luce"],["color","Colore"],["stroke","Pennellata"],["depth","Profondità"],["space","Spazio"],["body","Corpo"],["movement","Movimento"],["time","Tempo"],["work","Lavoro"],["class","Classe sociale"],["gender","Genere"],["observer","Osservatore"],["public","Pubblico"],["technology","Tecnologia"],["truth","Verità"],["absence","Assenza"],["future","Rapporto col futuro"]
  ];
  function renderAtlas(){
    $("#compareCategories").innerHTML=categories.map(([id,label])=>`<button type="button" aria-pressed="${state.compare===id}">${label}</button>`).join("");
    $$("#compareCategories button").forEach((button,index)=>button.addEventListener("click",()=>{state.compare=categories[index][0];saveState();renderAtlas();}));
    const label=categories.find(([id])=>id===state.compare)?.[1]||"Tempo";
    $("#compareGrid").innerHTML=atlasWorks.map(work=>`<article class="compare-card"><img src="${work.image}" loading="lazy" alt=""><div><p class="eyebrow">${work.title}</p><h3>${work.subtitle}</h3><p><b>${label}:</b> ${work.fields[state.compare]}</p></div></article>`).join("");
  }
  $("#compareReset").addEventListener("click",()=>{state.compare="time";saveState();renderAtlas();});renderAtlas();

  // Sintesi personale costruita soltanto da dati effettivi.
  const clip = text => text.trim().replace(/\s+/g," ").slice(0,260) + (text.trim().replace(/\s+/g," ").length>260?"…":"");
  function updateSynthesis(){
    const parts=[];
    if(state.notes.opening.trim()) parts.push(`<p><b>All’inizio avevi scritto:</b> “${escapeHTML(clip(state.notes.opening))}”</p>`);
    if(state.visited.includes(5)){
      const selected=instantParams.slice(0,5).map(param=>param.options.find(([value])=>value===state.instant[param.key])[1]);
      parts.push(`<p><b>Nel laboratorio dell’istante hai scelto:</b> ${selected.join(", ")}. Sono decisioni registrate, non caratteristiche attribuite automaticamente a te.</p>`);
    }
    if(state.monetLayers.length) parts.push(`<p><b>Nell’opera iniziale hai analizzato:</b> ${monetLayers.filter(item=>state.monetLayers.includes(item.id)).map(item=>item.label).join(", ")}.</p>`);
    if(state.cityLayers.length) parts.push(`<p><b>Nella città hai reso visibili:</b> ${cityLayers.filter(item=>state.cityLayers.includes(item.id)).map(item=>item.label).join(", ")}.</p>`);
    if(state.leisure.length) parts.push(`<p><b>Hai interrogato il tempo libero attraverso:</b> ${leisureQuestions.filter(([id])=>state.leisure.includes(id)).map(([,label])=>label.toLowerCase()).join("; ")}.</p>`);
    if(state.visited.includes(10)) parts.push(`<p><b>Nella sezione sugli sguardi hai lavorato su:</b> ${women.find(item=>item.id===state.women).label}, scegliendo una libertà “${gazeData.find(item=>item.key==="mobility").options.find(([value])=>value===state.gaze.mobility)[1]}”.</p>`);
    if(state.visited.includes(11)) parts.push(`<p><b>Nella serie hai fermato il confronto su:</b> ${seriesData.find(item=>item.id===state.series).caption}.</p>`);
    if(state.visited.includes(12)) parts.push(`<p><b>Nell’atlante finale hai confrontato la categoria:</b> ${categories.find(([id])=>id===state.compare)?.[1]}.</p>`);
    if(state.notes.return.trim()) parts.push(`<p><b>Nel secondo sguardo hai scritto:</b> “${escapeHTML(clip(state.notes.return))}”</p>`);
    $("#personalSynthesis").innerHTML=parts.length?`<h3>La traccia del tuo percorso</h3>${parts.join("")}`:"<h3>La sintesi non è ancora pronta</h3><p>Comparirà usando soltanto le tue note, le sezioni visitate e le scelte effettivamente compiute.</p>";
  }
  function escapeHTML(value){return String(value).replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[char]));}

  // Quiz: dodici concetti obbligatori, quindici formulazioni nel bacino.
  const quizPool = [
    {id:"realism-a",concept:"realism",q:"Quale passaggio collega meglio Realismo e Impressionismo?",o:["Dal soggetto sociale alle condizioni temporali e percettive del presente","Dalla realtà alla fantasia senza continuità","Dalla pittura politica a una pittura priva di società"],c:0,e:"L’Impressionismo continua l’ingresso del presente e sposta il problema su luce, durata e osservatore.",section:"#passaggio",lesson:"Il Realismo aveva messo in crisi chi meritava la grande immagine. L’Impressionismo non lo annulla: chiede come quel presente appare mentre cambia.",retry:{q:"Che cosa resta comune ai due moduli?",o:["La realtà è sempre una copia neutrale","La scelta del visibile implica una posizione","La pennellata deve essere liscia"],c:1}},
    {id:"realism-b",concept:"realism",q:"Perché il modulo non presenta il Realismo come immobile?",o:["Perché il confronto riguarda problemi diversi, non una gara di vitalità","Perché Courbet era già impressionista","Perché la fotografia aveva eliminato il movimento"],c:0,e:"Il passaggio è concettuale: presenza sociale e condizioni della percezione.",section:"#passaggio",lesson:"Le categorie di movimento e stabilità non coincidono meccanicamente con i due movimenti artistici.",retry:{q:"Quale confronto è corretto?",o:["Scena sociale / esperienza temporale","Errore / progresso","Buio / luce"],c:0}},
    {id:"show-a",concept:"show",q:"Che cosa accadde il 15 aprile 1874?",o:["Fu aperta la prima mostra indipendente della Société anonyme","Monet dipinse il primo quadro all’aperto","Il Salon adottò ufficialmente il nome Impressionismo"],c:0,e:"La mostra aprì al 35 boulevard des Capucines, fuori dal sistema ordinario del Salon.",section:"#mondo",lesson:"L’indipendenza espositiva è parte della storia del gruppo: modifica chi seleziona, rischia e incontra il pubblico.",retry:{q:"Dove si tenne la prima mostra del gruppo?",o:["Nel Louvre","Negli spazi già usati da Nadar al boulevard des Capucines","Nella stazione Saint-Lazare"],c:1}},
    {id:"name-a",concept:"name",q:"Quale rapporto esiste fra il titolo di Monet e il nome del movimento?",o:["Il titolo offrì a Louis Leroy il punto di partenza per un’etichetta polemica","Monet fondò un’accademia chiamata Impressionismo","Il titolo fu aggiunto dal Salon nel 1886"],c:0,e:"La recensione satirica del 25 aprile 1874 contribuì alla circolazione del termine.",section:"#monet",lesson:"Leroy non crea da solo artisti e pratiche; trasforma il titolo Impression, soleil levant in un’arma critica destinata a cambiare valore.",retry:{q:"Il termine “impressionisti” nasce inizialmente anche come…",o:["definizione scientifica","etichetta polemica","nome scelto nel loro statuto"],c:1}},
    {id:"name-b",concept:"name",q:"Storicamente, “Impressionismo” indica…",o:["un solo modo di stendere il colore","gruppo espositivo, pratiche diverse ed etichetta critica","tutti i pittori francesi dopo il 1874"],c:1,e:"La parola tiene insieme una rete non perfettamente unitaria e un problema della visione.",section:"#definizione",lesson:"Degas, Morisot, Monet, Renoir e gli altri non condividono una tecnica identica né partecipano sempre alle stesse mostre.",retry:{q:"Le otto mostre provarono che il gruppo era…",o:["variabile e non unitario","tecnicamente identico","guidato dal Salon"],c:0}},
    {id:"instant-a",concept:"instant",q:"Perché l’istante impressionista è una costruzione?",o:["Perché combina punto di vista, taglio, colore, memoria e tecnica","Perché raffigura sempre scene immaginarie","Perché dipende soltanto dal caso"],c:0,e:"L’effetto immediato nasce da decisioni e può includere rielaborazione.",section:"#istante",lesson:"Ora, atmosfera, distanza, inquadratura e rapporto cromatico non sono dati neutrali: l’artista li seleziona e li organizza.",retry:{q:"Una pennellata visibile dimostra necessariamente esecuzione rapida?",o:["Sì, sempre","No, può essere controllata e rielaborata","Solo nei paesaggi"],c:1}},
    {id:"photo-a",concept:"photo",q:"Qual è il rapporto più corretto fra fotografia e Impressionismo?",o:["La fotografia costrinse la pittura ad abbandonare il reale","Parteciparono a una trasformazione comune di tagli, durate e cultura visiva","Non ebbero alcun rapporto"],c:1,e:"Non esiste una causa unica né una semplice competizione.",section:"#passaggio",lesson:"La macchina registra luce secondo tempi e inquadrature; la pittura seleziona e costruisce. Entrambe cambiano il modo di concepire un’immagine.",retry:{q:"Il dagherrotipo del boulevard mostra che la fotografia…",o:["elimina ogni scelta","può produrre assenze attraverso il tempo tecnico","registra tutto nello stesso modo"],c:1}},
    {id:"city-a",concept:"city",q:"Che cosa implica il balcone in Boulevard des Capucines?",o:["Solo una soluzione per dipingere più in alto","Un punto panoramico e insieme una distanza sociale","L’assenza di qualsiasi osservatore"],c:1,e:"La veduta rende leggibile la folla come flusso e protegge chi guarda.",section:"#metropoli",lesson:"Ogni posizione rende visibile qualcosa e crea una zona cieca. Il punto alto non è soltanto geometrico.",retry:{q:"Dall’alto la folla tende a diventare…",o:["una somma di ritratti","ritmo di segni anonimi","completamente immobile"],c:1}},
    {id:"rail-a",concept:"rail",q:"Perché la stazione è centrale nella modernità impressionista?",o:["Unisce ferro, luce, vapore, mobilità e tempo coordinato","È l’unico luogo dove si poteva dipingere","Sostituisce completamente il paesaggio"],c:0,e:"La Gare Saint-Lazare è insieme architettura, rete sociale e fenomeno atmosferico.",section:"#stazione",lesson:"I treni collegano centro, periferie, lavoro e svago. Ferro e vetro modificano la luce; il vapore modifica i contorni.",retry:{q:"Il vapore nella stazione è…",o:["solo natura","solo decorazione","prodotto tecnico e fenomeno atmosferico"],c:2}},
    {id:"leisure-a",concept:"leisure",q:"Perché il tempo libero non è “libero per tutti”?",o:["Perché dipende da reddito, tempo, trasporto e lavoro altrui","Perché nei locali non si ballava","Perché Renoir dipingeva soltanto aristocratici"],c:0,e:"Il loisir moderno contiene accessi diseguali e lavoro spesso marginale nell’immagine.",section:"#loisir",lesson:"La gioia rappresentata è reale come esperienza, ma non universale come condizione sociale.",retry:{q:"Che cosa può restare fuori da una scena di festa?",o:["Il lavoro che la rende possibile","Ogni differenza di luce","La composizione"],c:0}},
    {id:"women-a",concept:"women",q:"Quale distinzione è essenziale per leggere Morisot e Cassatt?",o:["Visibilità e libertà di movimento non coincidono","Le artiste rifiutavano ogni spazio pubblico","I soggetti domestici erano una preferenza naturale femminile"],c:0,e:"Accessi sociali e professionali condizionano soggetti e punti di vista senza determinarli meccanicamente.",section:"#donne",lesson:"Le artiste non sono un’appendice. Rendono visibili reciprocità dello sguardo, cura, teatro, interni e soglie come problemi moderni.",retry:{q:"In In the Loge la donna…",o:["è soltanto guardata","guarda ed è guardata","non partecipa allo spazio pubblico"],c:1}},
    {id:"women-b",concept:"women",q:"Perché non basta dire che Morisot dipinge interni “perché li preferisce”?",o:["Perché ignora accessi differenziati agli spazi e alla professione","Perché non dipinse mai figure","Perché ogni interno è realista"],c:0,e:"La scelta artistica opera dentro possibilità sociali non distribuite allo stesso modo.",section:"#donne",lesson:"Condizione sociale e invenzione artistica vanno tenute insieme senza ridurre l’opera a documento.",retry:{q:"Una lettura corretta delle artiste considera…",o:["solo la biografia","esperienza sociale e costruzione formale","solo il genere del soggetto"],c:1}},
    {id:"series-a",concept:"series",q:"Che cosa mostrano le serie di Monet?",o:["Che lo stesso soggetto appare diversamente con tempo e atmosfera","Che ogni versione è una copia identica","Che Monet rinuncia al lavoro in studio"],c:0,e:"La ripetizione rende confrontabile la differenza e spesso include ampia rielaborazione.",section:"#serie",lesson:"Monet passava fra tele diverse e le riprendeva in studio. La serie mette in crisi l’identità semplice fra soggetto e apparizione.",retry:{q:"Nelle serie il motivo resta…",o:["identico nell’apparenza","riconoscibile ma percettivamente variabile","irrilevante in ogni senso"],c:1}},
    {id:"system-a",concept:"system",q:"Che cosa cambia con mostre indipendenti e nuovi mercanti?",o:["Il rapporto fra artisti, selezione ufficiale, pubblico e mercato","La chimica della luce solare","La struttura delle locomotive"],c:0,e:"L’autonomia dal Salon apre nuovi circuiti, rischi e dipendenze.",section:"#mondo",lesson:"Istituzioni e mercato non sono un contorno: decidono come l’opera circola, chi la vede e quali carriere diventano possibili.",retry:{q:"L’indipendenza espositiva elimina ogni dipendenza?",o:["Sì","No, crea anche nuovi rapporti con critica, mercanti e collezionisti","Solo dopo il 1900"],c:1}},
    {id:"future-a",concept:"future",q:"Quale domanda conduce al Postimpressionismo?",o:["Se la realtà percepita cambia continuamente, registrarla basta a costruire la verità dell’opera?","Come tornare alla prospettiva medievale?","Come eliminare ogni colore?"],c:0,e:"Il modulo 15 radicalizzerà il problema della struttura oltre la registrazione ottica.",section:"#ritorno",lesson:"Le serie mostrano che l’apparizione varia. Il passo successivo interroga ciò che può dare forma, durata o struttura al visibile.",retry:{q:"La soglia finale mette in dubbio…",o:["l’esistenza della pittura","la sufficienza della sola registrazione percettiva","la presenza della città"],c:1}}
  ];
  const concepts=["realism","show","name","instant","photo","city","rail","leisure","women","series","system","future"];
  function buildQuizOrder(){
    const bytes=new Uint32Array(concepts.length);crypto.getRandomValues(bytes);
    return concepts.map((concept,index)=>{const choices=quizPool.filter(item=>item.concept===concept);return choices[bytes[index]%choices.length].id;}).sort((a,b)=>bytes[concepts.indexOf(quizPool.find(item=>item.id===a).concept)]-bytes[concepts.indexOf(quizPool.find(item=>item.id===b).concept)]);
  }
  if(state.quiz.order.length!==12||!state.quiz.order.every(id=>quizPool.some(item=>item.id===id))){state.quiz={...structuredClone(defaultState.quiz),order:buildQuizOrder()};saveState();}
  const quizArea=$("#quizArea"),quizMeter=$("#quizMeter"),quizCount=$("#quizCount");
  function currentQuestion(){return quizPool.find(item=>item.id===state.quiz.order[state.quiz.cursor]);}
  function renderQuiz(){
    quizMeter.value=state.quiz.mastered.length;quizCount.textContent=state.quiz.completed?"Verifica completata":`Domanda ${Math.min(state.quiz.cursor+1,12)} di 12`;
    if(state.quiz.completed||state.quiz.mastered.length===12){state.quiz.completed=true;saveQuizOnly();quizArea.innerHTML=`<div class="quiz-complete"><b>12 / 12 nuclei compresi</b><p>Hai superato anche gli eventuali recuperi. La percentuale non ha nascosto nessun concetto irrinunciabile.</p><button class="lab-reset" id="quizRestart" type="button">Genera una nuova prova</button></div>`;$("#quizRestart").addEventListener("click",()=>{state.quiz={...structuredClone(defaultState.quiz),order:buildQuizOrder()};saveState();renderQuiz();});return;}
    const item=currentQuestion();
    quizArea.innerHTML=`<article class="quiz-card"><form id="quizForm"><fieldset><legend>${escapeHTML(item.q)}</legend><div class="quiz-options">${item.o.map((option,index)=>`<label class="quiz-option"><input type="radio" name="answer" value="${index}"><span>${escapeHTML(option)}</span></label>`).join("")}</div><button class="quiz-submit" type="submit">Verifica la risposta</button></fieldset></form><div id="quizFeedback" aria-live="polite"></div></article>`;
    $("#quizForm").addEventListener("submit",event=>{event.preventDefault();const selected=new FormData(event.currentTarget).get("answer");if(selected===null){$("#quizFeedback").innerHTML="<p class='feedback'>Seleziona una risposta prima di verificare.</p>";return;}state.quiz.attempts[item.concept]=(state.quiz.attempts[item.concept]||0)+1;if(Number(selected)===item.c){masterConcept(item,false);}else{saveState();renderRecovery(item);}});
  }
  function renderRecovery(item){
    $("#quizFeedback").innerHTML=`<div class="feedback"><b>Da ripassare.</b> ${escapeHTML(item.e)} <a href="${item.section}">Torna alla sezione</a>.</div><form class="recovery" id="recoveryForm"><h3>Microlezione di recupero</h3><p>${escapeHTML(item.lesson)}</p><fieldset><legend>${escapeHTML(item.retry.q)}</legend><div class="quiz-options">${item.retry.o.map((option,index)=>`<label class="quiz-option"><input type="radio" name="retry" value="${index}"><span>${escapeHTML(option)}</span></label>`).join("")}</div><button class="quiz-submit" type="submit">Verifica il recupero</button></fieldset><p id="retryFeedback" aria-live="polite"></p></form>`;
    $("#recoveryForm").addEventListener("submit",event=>{event.preventDefault();const selected=new FormData(event.currentTarget).get("retry");if(selected===null){$("#retryFeedback").textContent="Seleziona una risposta.";return;}if(Number(selected)===item.retry.c)masterConcept(item,true);else{$("#retryFeedback").textContent="Non ancora: rileggi la microlezione e prova di nuovo. La domanda è diversa da quella iniziale.";}});
  }
  function masterConcept(item,recovered){
    if(!state.quiz.mastered.includes(item.concept))state.quiz.mastered.push(item.concept);
    if(recovered&&!state.quiz.recoveries.includes(item.concept))state.quiz.recoveries.push(item.concept);
    saveState();
    $("#quizFeedback").innerHTML=`<div class="feedback"><b>${recovered?"Recupero riuscito":"Risposta corretta"}.</b> ${escapeHTML(item.e)}</div><button class="quiz-submit" id="quizNext" type="button">${state.quiz.cursor===11?"Concludi la prova":"Domanda successiva"}</button>`;
    $("#quizNext").addEventListener("click",()=>{state.quiz.cursor+=1;if(state.quiz.cursor>=12)state.quiz.completed=true;saveState();renderQuiz();});
    quizMeter.value=state.quiz.mastered.length;
  }
  function saveQuizOnly(){try{localStorage.setItem(STATE_KEY,JSON.stringify(state));}catch(error){/* avviso già gestito nelle altre scritture */}}
  renderQuiz();

  // Lightbox accessibile con zoom e restituzione del focus.
  const lightbox=$("#lightbox"),lightboxImage=$("#lightboxImage"),lightboxStage=$("#lightboxStage");
  let lightboxTrigger=null,zoom=1;
  function applyZoom(){lightboxImage.style.transform=`scale(${zoom})`;$("#zoomReset").textContent=`${Math.round(zoom*100)}%`;}
  function openLightbox(button){
    const figure=button.closest("figure"),source=$("img",figure);if(!source)return;
    lightboxTrigger=button;lightboxImage.src=source.currentSrc||source.src;lightboxImage.alt=source.alt;$("#lightboxCaption").textContent=$("figcaption",figure)?.textContent||source.alt;
    zoom=1;applyZoom();lightbox.hidden=false;document.body.classList.add("drawer-open");$("#lightboxClose").focus();
  }
  function closeLightbox(){if(lightbox.hidden)return;lightbox.hidden=true;document.body.classList.remove("drawer-open");lightboxImage.src="assets/images/impression-sunrise.webp";lightboxTrigger?.focus();lightboxTrigger=null;}
  document.addEventListener("click",event=>{const button=event.target.closest(".open-image");if(button)openLightbox(button);});
  $("#lightboxClose").addEventListener("click",closeLightbox);
  $("#zoomIn").addEventListener("click",()=>{zoom=Math.min(3,zoom+.25);applyZoom();});
  $("#zoomOut").addEventListener("click",()=>{zoom=Math.max(.5,zoom-.25);applyZoom();});
  $("#zoomReset").addEventListener("click",()=>{zoom=1;applyZoom();lightboxStage.scrollTo({top:0,left:0});});
  lightbox.addEventListener("keydown",event=>{if(event.key!=="Tab")return;const items=focusables(lightbox);const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});

  // Reset generale con conferma esplicita.
  $("#resetState").addEventListener("click",()=>{
    if(!confirm("Azzero note, attività, avanzamento e verifica di questo modulo sul dispositivo?"))return;
    localStorage.removeItem(STATE_KEY);location.reload();
  });

  updateSynthesis();
  if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>showStorageNotice("Il modulo funziona online, ma il service worker non è stato registrato in questa sessione.")));
})();
