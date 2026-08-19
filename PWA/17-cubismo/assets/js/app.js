"use strict";

(() => {
  const KEY = "storia-sguardo-17-state";
  const VERSION = 1;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  const defaults = () => ({
    version: VERSION, visited: [], notes: { initial: "", final: "" }, markers: [], shift: "",
    timeline: "", network: "", term: "etichetta",
    viewpoint: { angle: 0, views: 2, depth: 45, overlap: 45, transparency: 25, contour: 60, clues: 2, letters: 1, time: 2 },
    cezanne: "", evidence: {}, cluePath: [], collage: [], plural: "", compare: "spazio", atlas: "cezanne",
    quiz: { current: 0, recovery: false, mastered: [] }
  });

  let storageOK = true;
  try { const probe = `${KEY}-probe`; localStorage.setItem(probe, "1"); localStorage.removeItem(probe); } catch (_) { storageOK = false; }
  const normalize = raw => {
    const base = defaults();
    if (!raw || raw.version !== VERSION || typeof raw !== "object") return base;
    const merged = { ...base, ...raw };
    merged.notes = { ...base.notes, ...(raw.notes || {}) };
    merged.viewpoint = { ...base.viewpoint, ...(raw.viewpoint || {}) };
    merged.quiz = { ...base.quiz, ...(raw.quiz || {}) };
    merged.visited = Array.isArray(raw.visited) ? raw.visited.filter(n => Number.isInteger(n) && n >= 1 && n <= 13) : [];
    merged.markers = Array.isArray(raw.markers) ? raw.markers.filter(x => ["capelli", "volto", "pipa", "giacca"].includes(x)) : [];
    merged.cluePath = Array.isArray(raw.cluePath) ? raw.cluePath.filter(x => ["curva", "corde", "carte", "tavolo", "ombre"].includes(x)) : [];
    merged.collage = Array.isArray(raw.collage) ? raw.collage.filter(x => ["paper", "wood", "type", "draw", "shadow"].includes(x)) : [];
    merged.quiz.mastered = Array.isArray(merged.quiz.mastered) ? [...new Set(merged.quiz.mastered.filter(n => Number.isInteger(n) && n >= 0 && n < 16))] : [];
    merged.quiz.current = Number.isInteger(merged.quiz.current) && merged.quiz.current >= 0 && merged.quiz.current < 16 ? merged.quiz.current : 0;
    return merged;
  };
  let state = defaults();
  if (storageOK) {
    try { state = normalize(JSON.parse(localStorage.getItem(KEY))); } catch (_) { state = defaults(); }
  }
  const save = () => { if (storageOK) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { storageOK = false; } } };

  const sideNav = $("#sideNav"), scrim = $("#scrim"), menuToggle = $("#menuToggle"), menuClose = $("#menuClose");
  let menuReturnFocus = null;
  const menuFocusables = () => $$("a,button:not([disabled])", sideNav);
  const openMenu = () => { menuReturnFocus = document.activeElement; sideNav.classList.add("open"); sideNav.removeAttribute("inert"); sideNav.setAttribute("aria-hidden", "false"); menuToggle.setAttribute("aria-expanded", "true"); scrim.hidden = false; document.body.classList.add("menu-open"); menuClose.focus(); };
  const closeMenu = () => { sideNav.classList.remove("open"); sideNav.setAttribute("inert", ""); sideNav.setAttribute("aria-hidden", "true"); menuToggle.setAttribute("aria-expanded", "false"); scrim.hidden = true; document.body.classList.remove("menu-open"); menuReturnFocus?.focus(); };
  menuToggle.addEventListener("click", openMenu); menuClose.addEventListener("click", closeMenu); scrim.addEventListener("click", closeMenu);
  $$("a", sideNav).forEach(link => link.addEventListener("click", closeMenu));
  sideNav.addEventListener("keydown", event => { if (event.key !== "Tab") return; const list = menuFocusables(), first = list[0], last = list.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && sideNav.classList.contains("open")) closeMenu(); });

  const updateProgress = () => {
    const count = new Set(state.visited).size;
    $("#progressBar").style.width = `${count / 13 * 100}%`;
    $$(".side-nav a[href^='#s']").forEach((link, i) => link.classList.toggle("visited", state.visited.includes(i + 1)));
  };
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { const n = Number(entry.target.dataset.section); if (!state.visited.includes(n)) { state.visited.push(n); state.visited.sort((a, b) => a - b); save(); updateProgress(); } } }), { threshold: .26 });
  $$('[data-section]').forEach(section => observer.observe(section)); updateProgress();

  const bindNote = (id, key) => { const el = $(id); el.value = state.notes[key] || ""; el.addEventListener("input", () => { state.notes[key] = el.value; save(); if (key === "initial") renderEcho(); }); };
  bindNote("#initialNote", "initial"); bindNote("#finalNote", "final");

  const markerInfo = {
    capelli: ["Capelli e profilo", "Una curva scura circonda la testa, ma il profilo non resta continuo: lo ricomponi collegando bordi separati."],
    volto: ["Piani del volto", "Occhi, naso e bocca non appartengono a una sola illuminazione coerente. La somiglianza nasce dalla loro relazione."],
    pipa: ["La pipa", "Il piccolo tubo curvo è un indizio molto efficiente: basta a stabilizzare posa, gesto e orientamento del volto."],
    giacca: ["Giacca e fondo", "Risvolto, spalla e tenda condividono piani e toni. Figura e sfondo non sono mondi separati."]
  };
  const renderMarkers = () => {
    $$('[data-marker]').forEach(button => button.setAttribute("aria-pressed", String(state.markers.includes(button.dataset.marker))));
    const last = state.markers.at(-1), readout = $("#markerReadout");
    readout.innerHTML = last ? `<b>${markerInfo[last][0]}</b><p>${markerInfo[last][1]}</p>` : "<b>Scegli una zona</b><p>Un marcatore mostra un dato; non fornisce ancora una spiegazione.</p>";
    renderEcho();
  };
  $$('[data-marker]').forEach(button => button.addEventListener("click", () => { const key = button.dataset.marker; state.markers = state.markers.includes(key) ? state.markers.filter(x => x !== key) : [...state.markers, key]; save(); renderMarkers(); }));
  function renderEcho() { $("#initialEcho").textContent = state.notes.initial.trim() || "Non hai ancora scritto un’ipotesi iniziale."; $("#markerEcho").textContent = state.markers.length ? `Zone osservate: ${state.markers.map(x => markerInfo[x][0].toLowerCase()).join(", ")}.` : "Non hai usato i marcatori iniziali."; }
  renderMarkers();

  const shiftData = {
    deformare: "In Munch linee e proporzioni rendono instabile la relazione fra corpo e paesaggio. In Gris la deviazione dalla somiglianza convive con una struttura più discontinua.",
    frammentare: "Nell’opera iniziale i bordi interrompono l’unità apparente del volto. Nell’Urlo, invece, molte linee conservano una continuità ondulatoria.",
    comprimere: "Entrambe comprimono la profondità: Munch usa il ponte come diagonale tesa; Gris avvicina figura, tenda e superficie.",
    moltiplicare: "Gris rende compatibili orientamenti e indizi non riducibili a una sola apparizione. Non offre però una raccolta completa di vedute.",
    segno: "Pipa, risvolto e tratti del volto diventano segni selettivi. Nell’Urlo mani, bocca e ponte restano figure ma assumono anche valore ritmico."
  };
  const renderShift = () => { $$("#shiftChoices button").forEach(button => button.classList.toggle("active", button.dataset.shift === state.shift)); $("#shiftResult").textContent = state.shift ? shiftData[state.shift] : "Scegli un’operazione: la stessa parola non produce lo stesso effetto nelle due opere."; };
  $$("#shiftChoices button").forEach(button => button.addEventListener("click", () => { state.shift = button.dataset.shift; save(); renderShift(); })); renderShift();

  const timelineData = {
    "1890": ["1890–1906 · Un campo visivo in trasformazione", "Riproduzioni fotografiche, cinema, stampa illustrata e pubblicità moltiplicano immagini e tagli. Cézanne lavora sulla relazione fra sensazione e costruzione.", "Nuovi media e Cézanne non causano automaticamente una forma cubista."],
    "1907": ["1907 · Incontri e letture", "Il Salon d’Automne dedica a Cézanne una retrospettiva. Picasso lavora alle Demoiselles e visita il museo etnografico del Trocadéro, dentro una Parigi imperiale.", "Cronologia comune non prova un’unica origine né rende neutrale l’appropriazione."],
    "1908": ["1908 · I “cubi” entrano nella critica", "Braque espone paesaggi dell’Estaque nella galleria di Kahnweiler. Il racconto collega Matisse a una battuta sui cubi e Louis Vauxcelles alla sua diffusione critica.", "L’aneddoto ha varianti: l’etichetta non descrive fedelmente tutte le pratiche."],
    "1910": ["1909–1910 · Un lavoro a due", "Picasso e Braque confrontano quotidianamente problemi di spazio, oggetto e attribuzione. Kahnweiler sostiene e controlla la circolazione commerciale.", "Collaborazione non significa identità, isolamento o assenza di altre reti."],
    "1911": ["1911 · Il Cubismo diventa un fatto pubblico", "Metzinger, Gleizes, Le Fauconnier, Delaunay e Léger espongono insieme al Salon des Indépendants; la stampa trasforma le differenze in una controversia collettiva.", "I Salon Cubists non sono copie periferiche della coppia di galleria."],
    "1912": ["1912 · Teoria, collage, Section d’Or", "Gleizes e Metzinger pubblicano Du “Cubisme”; Braque introduce papier collé; mostre e testi rendono visibile la pluralità del movimento.", "Le categorie “analitico” e “sintetico” sono strumenti storiografici, non leggi dichiarate da tutti."],
    "1913": ["1913 · Internazionalizzazione", "L’Armory Show porta pratiche cubiste negli Stati Uniti; opere e riproduzioni circolano anche in Europa centrale e orientale.", "La ricezione internazionale seleziona, traduce e spesso caricaturizza."],
    "1914": ["1914 · La storia interrompe il laboratorio", "La guerra mobilita Braque, Léger e altri; Kahnweiler, cittadino tedesco, lascia la Francia e la sua galleria viene sequestrata.", "La guerra trasforma le condizioni materiali; non chiude ogni ricerca cubista nello stesso istante."]
  };
  const renderTimeline = () => { $$("#timeline button").forEach(button => button.classList.toggle("active", button.dataset.year === state.timeline)); const d = timelineData[state.timeline]; $("#timelineDetail").innerHTML = d ? `<h3>${d[0]}</h3><p>${d[1]}</p><p><strong>Limite:</strong> ${d[2]}</p>` : "<p>Scegli una data: appariranno evento, relazione e limite causale.</p>"; };
  $$("#timeline button").forEach(button => button.addEventListener("click", () => { state.timeline = button.dataset.year; save(); renderTimeline(); })); renderTimeline();
  const networkData = {
    parigi: "Atelier, caffè, quartieri di immigrati, musei e Salon rendono possibili incontri. Parigi non è però un soggetto unico: è una rete diseguale di accessi e visibilità.",
    media: "Fotografia, cinema, giornale e pubblicità abituano a tagli e sequenze. Una somiglianza con il Cubismo non dimostra che il nuovo stile ne sia la traduzione diretta.",
    mercato: "Kahnweiler acquista opere, stipula accordi e costruisce collezionisti; Ambroise Vollard e altri mercanti partecipano al sistema. L’avanguardia non vive fuori dal mercato.",
    salons: "I Salon rendono pubbliche opere e polemiche. Il pubblico incontra soprattutto Metzinger, Gleizes, Delaunay e Léger, non il laboratorio più riservato di Picasso e Braque.",
    colonie: "Oggetti africani e oceanici arrivano in musei e atelier attraverso conquista, commercio e classificazione coloniale. L’appropriazione formale avviene dentro questa asimmetria.",
    guerra: "Mobilitazione, frontiere e sequestri disperdono persone e capitali. La guerra interrompe reti, ma le storie successive del Cubismo restano plurali."
  };
  const renderNetwork = () => { $$("#historyNetwork button").forEach(button => button.classList.toggle("active", button.dataset.node === state.network)); $("#networkText").textContent = state.network ? networkData[state.network] : "Attiva un nodo per leggere che cosa rende possibile e che cosa non spiega."; };
  $$("#historyNetwork button").forEach(button => button.addEventListener("click", () => { state.network = button.dataset.node; save(); renderNetwork(); })); renderNetwork();

  const termData = {
    etichetta: ["Un nome nato nella polemica", "La parola si lega ai paesaggi di Braque del 1908 e a osservazioni attribuite a Matisse e pubblicate da Vauxcelles. Le varianti dell’aneddoto consigliano prudenza.", "Un’etichetta rende comunicabile una differenza, ma può anche appiattirla."],
    galleria: ["Gli artisti della galleria", "Picasso, Braque, poi Gris e Léger operano dentro rapporti stretti con Kahnweiler. Vendita, contratti, fotografie e collezionisti partecipano alla storia delle forme.", "L’opera sperimentale ha infrastrutture materiali."],
    salon: ["Gli artisti dei Salon", "Metzinger, Gleizes, Delaunay, Le Fauconnier e altri espongono collettivamente nel 1911 e 1912, trasformando “Cubismo” in un problema pubblico e politico.", "La visibilità non coincide con una sola pratica."],
    critici: ["Critici, poeti, libri", "Vauxcelles, Apollinaire, Gleizes e Metzinger nominano, difendono o discutono il movimento. Le loro categorie diventano fonti, ma anche interventi interessati.", "Scrivere la storia significa contribuire a produrla."],
    pubblico: ["Scandalo, caricatura, ricezione", "Stampa e pubblico traducono immagini difficili in metafore geometriche, satira e accuse. Anche il rifiuto amplia la circolazione del nome.", "Il movimento pubblico non è la somma neutra delle opere."]
  };
  const renderTerm = () => { $$('[data-term]').forEach(button => button.setAttribute("aria-selected", String(button.dataset.term === state.term))); const d = termData[state.term] || termData.etichetta; $("#termPanel").innerHTML = `<h3>${d[0]}</h3><p>${d[1]}</p><p class="tagline">${d[2]}</p>`; };
  $$('[data-term]').forEach(button => button.addEventListener("click", () => { state.term = button.dataset.term; save(); renderTerm(); })); renderTerm();

  const viewDefaults = defaults().viewpoint;
  const viewUnits = { angle: "°", views: "", depth: "%", overlap: "%", transparency: "%", contour: "%", clues: "", letters: "", time: "" };
  const viewpointText = () => {
    const p = state.viewpoint, clauses = [];
    clauses.push(p.views === 1 ? "una sola veduta mantiene maggiore continuità" : `${p.views} vedute aumentano le relazioni ma anche le incompatibilità`);
    clauses.push(p.contour < 35 ? "il contorno discontinuo trasferisce il riconoscimento agli indizi" : "il contorno conserva una guida relativamente stabile");
    clauses.push(p.transparency > 50 ? "la trasparenza confonde figura e fondo" : "le opacità distinguono ancora alcuni piani");
    clauses.push(p.clues === 0 ? "senza indizi il modello tende all’astrazione" : `${p.clues} indizi selezionano ciò che può essere ricostruito`);
    clauses.push(p.letters ? "lettere e numeri introducono convenzioni non ottiche" : "nessuna lettera stabilizza il significato");
    return `<b>Sintesi derivata dalle tue regolazioni</b><p>${clauses.join("; ")}. La successione è impostata su ${p.time}: memoria e visione non diventano per questo una scansione completa. Più vedute non equivalgono automaticamente a più verità.</p>`;
  };
  const renderViewpoint = () => {
    const p = state.viewpoint, stage = $("#viewpointStage");
    stage.style.setProperty("--angle", `${p.angle}deg`); stage.style.setProperty("--depth", p.depth / 100); stage.style.setProperty("--overlap", `${p.overlap * .55}px`); stage.style.setProperty("--alpha", 1 - p.transparency / 110); stage.style.setProperty("--contour", p.contour / 100); stage.style.setProperty("--time", p.time);
    $$(".plane", stage).forEach((plane, i) => plane.hidden = i >= p.views); $$(".lab-clue", stage).forEach((clue, i) => clue.hidden = i >= Math.ceil(p.clues / 2)); $$(".lab-letter", stage).forEach((letter, i) => letter.hidden = i >= p.letters);
    Object.entries(p).forEach(([key, value]) => { const input = $(`#${key}`), output = input?.closest("label")?.querySelector("output"); if (input) input.value = value; if (output) output.value = `${value}${viewUnits[key]}`; });
    $("#viewpointAnalysis").innerHTML = viewpointText();
  };
  $$("#viewpointControls input").forEach(input => input.addEventListener("input", () => { state.viewpoint[input.name] = Number(input.value); save(); renderViewpoint(); })); renderViewpoint();

  const cezanneData = {
    visibile: "Tavolo, piatto e biscotti non seguono tutti la stessa proiezione. La bottiglia inclina; il cesto e la tovaglia spingono in direzioni diverse.",
    opera: "Cézanne coordina colore, pennellata, volume e aggiustamenti successivi per rendere la sensazione durevole. L’instabilità non cancella l’osservazione della natura.",
    ricezione: "La retrospettiva del 1907 e le riproduzioni resero queste soluzioni disponibili a una nuova generazione, che vi lesse un’alternativa alla prospettiva e all’Impressionismo.",
    limite: "Dire che Cézanne “inventò il Cubismo” confonde un’opera con le letture successive. Un riferimento offre possibilità; non contiene già i risultati."
  };
  const renderCezanne = () => { $$("#cezanneLayers button").forEach(button => button.classList.toggle("active", button.dataset.cezanne === state.cezanne)); $("#cezanneResult").textContent = state.cezanne ? cezanneData[state.cezanne] : "Scegli un livello: ciò che Cézanne fece e ciò che altri vi lessero non coincidono."; };
  $$("#cezanneLayers button").forEach(button => button.addEventListener("click", () => { state.cezanne = button.dataset.cezanne; save(); renderCezanne(); })); renderCezanne();

  const evidence = [
    ["Nel dipinto cinque corpi occupano uno spazio compresso e disgiunto.", "visibile"],
    ["Picasso produsse centinaia di studi preparatori per le Demoiselles.", "documentato"],
    ["L’opera colloca lo spettatore in una posizione di confronto con i corpi.", "interpretato"],
    ["La memoria successiva di Picasso sul Trocadéro coincide in ogni dettaglio con il processo del 1907.", "discusso"],
    ["Le maschere africane avevano come funzione storica preparare la nascita del Cubismo europeo.", "non"]
  ];
  const evidenceLabels = [["", "Scegli…"], ["visibile", "Visibile"], ["documentato", "Documentato"], ["interpretato", "Interpretato"], ["discusso", "Discusso"], ["non", "Non dimostrabile"]];
  const renderEvidence = () => {
    const host = $("#evidenceStatements");
    host.innerHTML = evidence.map((item, i) => `<label class="evidence-row ${state.evidence[i] ? (state.evidence[i] === item[1] ? "correct" : "wrong") : ""}"><span>${item[0]}</span><select data-evidence="${i}" aria-label="Classifica: ${item[0]}">${evidenceLabels.map(([value, label]) => `<option value="${value}" ${state.evidence[i] === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>`).join("");
    $$("select", host).forEach(select => select.addEventListener("change", () => { state.evidence[select.dataset.evidence] = select.value; save(); renderEvidence(); }));
    const done = Object.keys(state.evidence).filter(key => state.evidence[key]).length, good = evidence.filter((item, i) => state.evidence[i] === item[1]).length;
    $("#evidenceScore").textContent = done ? `${good} classificazioni corrette su ${done}. Il dato visivo, il documento e l’interpretazione restano livelli differenti.` : "";
  }; renderEvidence();

  const clueNames = { curva: "curva del violino", corde: "corde", carte: "numeri delle carte", tavolo: "bordo del tavolo", ombre: "passaggi figura/fondo" };
  const renderClues = () => {
    $$("#clueChoices button").forEach(button => { const index = state.cluePath.indexOf(button.dataset.clue); button.classList.toggle("active", index >= 0); button.textContent = `${index >= 0 ? `${index + 1} · ` : ""}${clueNames[button.dataset.clue]}`; });
    const result = $("#clueResult");
    if (!state.cluePath.length) result.textContent = "Nessun indizio selezionato: prova a osservare quale parte guida il riconoscimento.";
    else { const first = state.cluePath[0], conventional = state.cluePath.filter(x => ["corde", "carte"].includes(x)).length; result.textContent = `Hai iniziato da ${clueNames[first]} e collegato ${state.cluePath.length} indizi. ${conventional ? `${conventional} dipendono da convenzioni apprese, non dalla sola somiglianza ottica.` : "Per ora prevalgono forma e posizione; lettere e numeri mostrerebbero il peso delle convenzioni."}`; }
  };
  $$("#clueChoices button").forEach(button => button.addEventListener("click", () => { const clue = button.dataset.clue; state.cluePath = state.cluePath.includes(clue) ? state.cluePath.filter(x => x !== clue) : [...state.cluePath, clue]; save(); renderClues(); })); renderClues();

  const fragmentNames = { paper: "carta reale", wood: "finto legno", type: "lettere", draw: "contorno disegnato", shadow: "ombra dipinta" };
  const renderCollage = () => {
    $$("#collageChoices button").forEach(button => { const active = state.collage.includes(button.dataset.fragment); button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); });
    $$("[data-frag]", $("#collageStage")).forEach(fragment => fragment.hidden = !state.collage.includes(fragment.dataset.frag));
    const real = state.collage.includes("paper"), illusion = state.collage.filter(x => ["wood", "shadow", "draw"].includes(x)).length, signs = state.collage.includes("type");
    $("#collageResult").textContent = state.collage.length ? `Hai attivato ${state.collage.map(x => fragmentNames[x]).join(", ")}. ${real ? "La carta è presente come materiale reale; " : "Nessun materiale quotidiano è fisicamente presente; "}${illusion ? `${illusion} elementi fingono o disegnano una cosa; ` : ""}${signs ? "le lettere fanno pensare a un giornale senza esserlo." : "nessun testo orienta ancora il riconoscimento."}` : "Aggiungi un elemento: ogni scelta cambierà lo statuto di ciò che guardi.";
  };
  $$("#collageChoices button").forEach(button => button.addEventListener("click", () => { const key = button.dataset.fragment; state.collage = state.collage.includes(key) ? state.collage.filter(x => x !== key) : [...state.collage, key]; save(); renderCollage(); })); renderCollage();

  const pluralData = {
    gris: "Juan Gris sviluppa costruzioni più leggibili, colore e rapporti rigorosi fra forme e segni. La sua presenza modifica la distinzione troppo semplice fra invenzione e diffusione.",
    blanchard: "María Blanchard partecipa alle reti parigine e costruisce superfici sintetiche personali. Genere e disabilità incidono sulle condizioni di ricezione, non funzionano come causa formale.",
    salons: "Metzinger e Gleizes espongono, scrivono e descrivono una ricerca più pubblica, spesso interessata a figura, paesaggio e movimento. Non sono un’appendice di Picasso e Braque.",
    leger: "Léger accentua contrasti di volume, ritmo e cultura meccanica. La vicinanza al Cubismo convive con un linguaggio riconoscibile e con sviluppi autonomi.",
    delaunay: "Robert e Sonia Delaunay esplorano colore e simultaneità; l’etichetta Orfismo segnala uno sconfinamento, non un semplice sottogenere. Sonia fu artista, designer e imprenditrice, non soltanto parte di una coppia.",
    market: "Kahnweiler, Léonce Rosenberg, collezionisti, riviste e mostre stabiliscono accesso, prezzo e memoria. Il canone è anche la storia di ciò che viene conservato e raccontato."
  };
  const renderPlural = () => { $$("#pluralNetwork button").forEach(button => button.classList.toggle("active", button.dataset.plural === state.plural)); $("#pluralText").textContent = state.plural ? pluralData[state.plural] : "Seleziona un nodo: vicinanza non significa identità stilistica."; };
  $$("#pluralNetwork button").forEach(button => button.addEventListener("click", () => { state.plural = button.dataset.plural; save(); renderPlural(); })); renderPlural();

  const compareNames = ["Picasso / Braque", "Juan Gris", "María Blanchard", "Metzinger / Gleizes", "Robert / Sonia Delaunay"];
  const compareData = {
    spazio: ["Piani poco profondi e passaggi fra oggetto e fondo.", "Architetture leggibili e relazioni calibrate.", "Superficie sintetica e colore strutturale.", "Figura, paesaggio e azione articolati su grande scala.", "Campi cromatici e compenetrazioni."],
    tempo: ["Indizi successivi resi compatibili sulla superficie.", "Ritmo di lettura guidato da segni e riprese.", "Ordine costruito fra piani, non tempo illustrato.", "Azioni e città suggeriscono durata senza cronaca lineare.", "La simultaneità cromatica diventa tema esplicito."],
    punto: ["Nessun osservatore unico stabilizza l’oggetto.", "Punti di vista selezionati dentro una struttura forte.", "Vedute sintetizzate senza scansione completa.", "Spettatore mobile davanti a composizioni estese.", "Lo sguardo attraversa contrasti e ripetizioni."],
    profondita: ["Profondità compressa, figura e fondo oscillanti.", "Piani sovrapposti ma spesso più leggibili.", "Planarità accentuata.", "Profondità ritmata da diagonali e masse.", "La profondità ottica nasce dal colore."],
    riconoscibilita: ["Oscilla fino alla soglia dell’illeggibilità.", "Oggetti ricostruibili tramite indizi organizzati.", "Profili e campiture conservano appigli selettivi.", "Figure e temi pubblici restano identificabili.", "Il motivo può cedere alla relazione cromatica."],
    materia: ["Pittura, sabbia, carta, tela cerata e oggetti simulati.", "Pittura, carte e materiali ordinari messi in relazione.", "Olio e collage come architettura della superficie.", "Prevalenza pittorica, anche su grandi formati.", "Colore applicato a pittura, tessuto, libro e oggetto."],
    segno: ["Lettere e contorni sono indizi ambigui.", "Il segno spesso stabilizza e insieme complica.", "Linee decorative e piani diventano struttura.", "Figure e città sono schemi riconoscibili.", "Il colore stesso assume funzione costruttiva."],
    spettatore: ["Deve ricomporre senza possedere la totalità.", "È guidato da una sintassi più esplicita.", "Attraversa continuità e interruzioni cromatiche.", "È coinvolto in scene pubbliche e collettive.", "Sperimenta simultaneità come percorso percettivo."],
    sociale: ["Caffè, giornali e oggetti urbani entrano per frammenti.", "La cultura popolare compare in giornali, carte e Fantômas.", "Condizioni di genere e lavoro incidono sulla carriera.", "Sport, folla e città diventano temi visibili.", "Moda, design e metropoli collegano arte e vita."],
    mercato: ["Kahnweiler limita e costruisce la circolazione.", "Gris firma con Kahnweiler nel 1913.", "Precarietà e reti espositive condizionano visibilità.", "I Salon offrono un’altra infrastruttura pubblica.", "Mostre, editoria e design ampliano i pubblici."],
    colonialismo: ["Appropriazioni africane e oceaniche attraversano canali coloniali.", "Il problema è meno centrale nelle opere scelte, non assente dal contesto.", "La storiografia l’ha letta dentro categorie di genere e alterità.", "Il contesto imperiale francese resta parte della modernità rappresentata.", "I circuiti internazionali non sono scambi simmetrici."],
    autore: ["La collaborazione mette in crisi il genio isolato.", "Una sintassi personale emerge dentro una ricerca condivisa.", "Il canone dimostra chi viene escluso dall’autorialità esemplare.", "Manifesti e mostre costruiscono identità collettive.", "Coppia e collaborazioni non cancellano due pratiche autonome."]
  };
  const renderCompare = () => { $("#compareCategory").value = state.compare; $("#compareGrid").innerHTML = compareNames.map((name, i) => `<article class="compare-card"><h3>${name}</h3><p>${compareData[state.compare][i]}</p></article>`).join(""); $("#compareSynthesis").innerHTML = `<b>Risultato</b><p>La categoria “${$("#compareCategory").selectedOptions[0].textContent.toLowerCase()}” mette in relazione pratiche differenti senza trasformarle in uno stile unitario. Una somiglianza descrive; una fonte dimostra il rapporto storico.</p>`; };
  $("#compareCategory").addEventListener("change", event => { state.compare = event.target.value; save(); renderCompare(); }); renderCompare();

  const atlasData = {
    cezanne: ["Cézanne · rendere durevole la sensazione", "Costruisce volumi e aggiusta lo spazio senza sottometterlo a una proiezione perfettamente unica.", "Guadagno: relazione fra sensazione e struttura. Perdita: coerenza prospettica immediata.", "Lo spettatore nota gli aggiustamenti; il reale resta osservato, non smontato in segni."],
    munch: ["Munch e Kirchner · rendere visibile una tensione", "Deformano corpo, città e spazio per costruire relazioni interiori e sociali.", "Guadagno: intensità della relazione vissuta. Perdita: neutralità naturalistica.", "Lo spettatore è coinvolto o messo sotto pressione; figura e mondo restano leggibili."],
    kandinsky: ["Kandinsky · rendere visibili relazioni non osservabili", "Colore e ritmo possono allentare il riferimento a oggetti stabili.", "Guadagno: autonomia delle relazioni visive. Perdita: identificazione certa del soggetto.", "Lo spettatore organizza il campo; la realtà non coincide più con un inventario di cose."],
    pair: ["Picasso e Braque · mettere in crisi l’apparizione unica", "Frammentano, comprimono e trasformano dettagli in indizi; poi introducono carte e materiali.", "Guadagno: consapevolezza della costruzione dell’immagine. Perdita: totalità e profondità continue.", "Lo spettatore ricompone; mercato e collaborazione diventano parte dell’autorialità."],
    gris: ["Juan Gris · costruire una sintassi leggibile", "Organizza piani, colori, parole e oggetti in relazioni più esplicite senza restaurare la finestra rinascimentale.", "Guadagno: precisione fra segno e struttura. Perdita: spontaneità apparente e singola veduta.", "Lo spettatore riconosce attraverso convenzioni e memoria."],
    plural: ["Blanchard e Gleizes · moltiplicare i Cubismi", "Superficie sintetica, colore, corpo collettivo e scena pubblica ampliano i problemi del movimento.", "Guadagno: pluralità di soggetti, forme e agenti. Perdita: comodità del racconto a due protagonisti.", "Lo spettatore vede che il canone è una costruzione storica, non un elenco naturale."]
  };
  const renderAtlas = () => { $$('[data-atlas]').forEach(button => button.setAttribute("aria-selected", String(button.dataset.atlas === state.atlas))); const d = atlasData[state.atlas]; $("#atlasCard").innerHTML = `<h3>${d[0]}</h3><div><h4>Problema e operazione</h4><p>${d[1]}</p></div><div><h4>Guadagno e perdita</h4><p>${d[2]}</p></div><div><h4>Spettatore e reale</h4><p>${d[3]}</p></div>`; };
  $$('[data-atlas]').forEach(button => button.addEventListener("click", () => { state.atlas = button.dataset.atlas; save(); renderAtlas(); })); renderAtlas();

  const quiz = [
    ["Soglia dall’Espressionismo", "Qual è la differenza più precisa fra la soglia espressionista e quella cubista?", ["Emozione contro ragione", "Tensione resa attraverso figura/spazio contro crisi dell’apparizione unica", "Colore contro geometria"], 1, "L’Espressionismo e il Cubismo sono entrambi costruzioni pensate: cambia il problema formale e conoscitivo.", "#s2", "Quale frase evita una gerarchia fra i due movimenti?", ["Il Cubismo corregge l’Espressionismo", "Il Cubismo sostituisce l’emozione con la scienza", "Affrontano problemi diversi e possono condividere alcune operazioni"], 2],
    ["Punto di vista unico", "Che cosa mette davvero in crisi il Cubismo?", ["Soltanto la prospettiva lineare", "L’equivalenza fra una sola veduta, conoscenza e rappresentazione", "La possibilità di riconoscere oggetti"], 1, "La prospettiva è parte del problema, ma la questione più ampia riguarda come l’immagine costruisce conoscenza.", "#s5", "Una superficie cubista è soprattutto…", ["una finestra più precisa", "una scansione fotografica completa", "un sistema di relazioni selezionate"], 2],
    ["Tutti i lati", "Perché “tutti i lati contemporaneamente” è una formula insufficiente?", ["Perché le opere usano soltanto una veduta", "Perché molte opere offrono indizi parziali, non una ricostruzione completa", "Perché i cubisti non raffigurano oggetti"], 1, "Le opere selezionano e sacrificano dati; più punti di vista non producono automaticamente una totalità.", "#s5", "Quale attività del laboratorio confuta la scansione completa?", ["Aumentare le vedute crea anche incompatibilità", "Aumentare le vedute risolve ogni ambiguità", "Eliminare gli indizi aumenta sempre la verità"], 0],
    ["Cézanne", "Qual è il ruolo storicamente più corretto di Cézanne?", ["Padre inevitabile del Cubismo", "Riferimento riletto e trasformato da artisti successivi", "Autore già cubista nel 1893"], 1, "La retrospettiva e la ricezione contano, ma ciò che altri lessero non coincide con un destino contenuto nelle opere.", "#s6", "La frase su cilindro, sfera e cono va letta come…", ["ricetta cubista", "manifesto astratto", "passo di una lettera sullo studio della natura"], 2],
    ["La parola Cubismo", "Che cosa mostra la storia dell’etichetta?", ["Il nome descrive uno stile perfettamente unitario", "Critica e ricezione contribuiscono a costruire un movimento pubblico", "La parola fu scelta ufficialmente da Picasso"], 1, "L’etichetta nasce nella polemica e aggrega pratiche diverse.", "#s4", "Quale rischio comporta un’etichetta?", ["Rendere invisibili tutte le opere", "Appiattire differenze mentre rende comunicabile il fenomeno", "Impedire qualsiasi mercato"], 1],
    ["Picasso e Braque", "Come va ricostruito il loro rapporto?", ["Genio e imitatore", "Collaborazione, confronto e competizione dentro reti materiali", "Due percorsi senza contatti"], 1, "La vicinanza di alcune opere mette in crisi il racconto del genio isolato.", "#s7", "Che cosa interruppe materialmente il loro lavoro comune?", ["La mobilitazione di Braque nel 1914", "La morte di Cézanne", "L’Armory Show"], 0],
    ["Cubismo analitico", "Quale insieme di caratteristiche è più pertinente?", ["Tavolozza ridotta, spazio poco profondo, figura/fondo oscillanti", "Colori puri, prospettiva unica, oggetti completi", "Solo collage e materiali reali"], 0, "Il riconoscimento si regge su indizi mentre la profondità e i contorni perdono continuità.", "#s8", "Nel laboratorio degli indizi, lettere e numeri mostrano…", ["che il quadro è una fotografia", "il peso delle convenzioni apprese", "che ogni oggetto è completo"], 1],
    ["Cubismo sintetico", "Che cosa cambia senza ridursi a una semplice semplificazione?", ["Tornano soltanto le regole rinascimentali", "Forme, colore e materiali costruiscono nuovi rapporti fra cosa e segno", "Scompare ogni riferimento al reale"], 1, "La sintesi produce nuove realtà visive e spesso reintroduce colore e materiali.", "#s9", "Analitico e sintetico sono…", ["categorie storiografiche utili ma non leggi assolute", "due manifesti firmati da tutti", "nomi di due gallerie"], 0],
    ["Collage", "Perché il collage è una frattura concettuale?", ["Perché incolla soltanto forme decorative", "Perché confonde materiale reale, imitazione, immagine e segno", "Perché elimina la cultura di massa"], 1, "Carta, giornale, finto legno e contorno disegnato non hanno lo stesso statuto.", "#s9", "Un frammento di giornale dentro l’opera è…", ["solo un’immagine dipinta", "materiale reale e segno culturale", "sempre un documento neutro"], 1],
    ["Oggetto, immagine, segno", "Una scritta “JOUR” nel quadro che cosa può fare?", ["Diventare il giornale reale", "Alludere al giornale attraverso una convenzione", "Eliminare ogni ambiguità"], 1, "Il segno non coincide con la cosa: orienta una ricostruzione.", "#s9", "Il finto legno è…", ["legno reale", "una superficie che imita un materiale", "un errore tecnico"], 1],
    ["Spazio e profondità", "Come funziona spesso la profondità cubista?", ["È compressa e costruita da sovrapposizioni instabili", "Segue sempre un unico punto di fuga", "È assente in ogni senso"], 0, "La profondità non sparisce: cambia statuto e rapporto con la superficie.", "#s11", "Figura e fondo nelle opere analitiche…", ["restano sempre separati", "possono attraversarsi e oscillare", "sono identici alla prospettiva fotografica"], 1],
    ["Tempo e simultaneità", "Quale affermazione è metodologicamente corretta?", ["Il Cubismo dimostra la relatività di Einstein", "Successione, memoria e simultaneità costruita possono essere analizzate senza imporre una causa scientifica", "Ogni frammento è una quarta dimensione"], 1, "L’analogia non basta a stabilire un rapporto storico documentato.", "#s11", "Per affermare un’influenza diretta servono…", ["solo somiglianze", "documenti di lettura, incontro o circolazione", "un titolo suggestivo"], 1],
    ["Colonialismo e appropriazione", "Perché non si può parlare di “scoperta” europea delle arti africane?", ["Perché quegli oggetti avevano già forme, funzioni e autori e arrivarono in reti coloniali asimmetriche", "Perché Picasso non vide mai oggetti non europei", "Perché i musei erano neutrali"], 0, "L’appropriazione va collocata dentro conquista, commercio, classificazione e disuguaglianza.", "#s7", "Il museo etnografico del Trocadéro era…", ["fuori dalla storia coloniale", "parte di una struttura imperiale di raccolta e classificazione", "una galleria gestita da Kahnweiler"], 1],
    ["Pluralità dei Cubismi", "Che cosa distingue galleria e Salon?", ["Qualità alta e bassa", "Infrastrutture, pubblici e pratiche differenti", "Pittura e scultura"], 1, "Picasso e Braque lavoravano in un circuito più riservato; i Salon Cubists costruirono la controversia pubblica.", "#s10", "Delaunay e Léger vanno letti come…", ["copie di Braque", "ricerche vicine ma autonome e sconfinanti", "estranei a ogni rete cubista"], 1],
    ["María Blanchard e il canone", "Quale lettura evita una spiegazione riduttiva?", ["La disabilità causa la geometria dei suoi quadri", "Genere, disabilità e precarietà incidono sulle condizioni di carriera, non spiegano automaticamente la forma", "Blanchard è importante soltanto perché donna"], 1, "La sua presenza modifica la struttura del racconto e rende visibili i meccanismi del canone.", "#s10", "Il canone dipende anche da…", ["archivi, mercato, mostre e biografie disponibili", "solo valore naturale delle opere", "un elenco immutabile"], 0],
    ["Soglia verso il Futurismo", "Come va costruita la transizione finale?", ["Il Futurismo supera il Cubismo", "Il problema passa dall’oggetto ricomposto al movimento che invade corpo, città e tempo", "Il Cubismo causa automaticamente il Futurismo"], 1, "La soglia cambia domanda senza stabilire progresso, superiorità o causalità unica.", "#s12", "La conclusione del modulo 17 deve…", ["costruire già il modulo 18", "stabilire una graduatoria", "aprire una domanda sul movimento"], 2]
  ];
  const renderQuiz = () => {
    const qs = state.quiz, q = quiz[qs.current], recovery = qs.recovery;
    $("#masteryCount").textContent = `${qs.mastered.length} / 16 nuclei`; $("#masteryBar").style.width = `${qs.mastered.length / 16 * 100}%`;
    $("#quizNav").innerHTML = quiz.map((item, i) => `<button type="button" data-q="${i}" class="${i === qs.current ? "current" : ""} ${qs.mastered.includes(i) ? "mastered" : ""}" aria-label="Nucleo ${i + 1}: ${item[0]}${qs.mastered.includes(i) ? ", compreso" : ""}">${i + 1}</button>`).join("");
    $$("#quizNav button").forEach(button => button.addEventListener("click", () => { qs.current = Number(button.dataset.q); qs.recovery = false; save(); renderQuiz(); }));
    const question = recovery ? q[6] : q[1], options = recovery ? q[7] : q[2];
    $("#quizCard").innerHTML = `<p class="core-label">Nucleo ${qs.current + 1} · ${q[0]}${recovery ? " · recupero" : ""}</p><h3>${question}</h3><div class="quiz-options">${options.map((option, i) => `<button type="button" data-answer="${i}">${option}</button>`).join("")}</div><div id="quizFeedback" aria-live="polite"></div>`;
    $$("#quizCard [data-answer]").forEach(button => button.addEventListener("click", () => answerQuiz(Number(button.dataset.answer))));
    $("#quizComplete").hidden = qs.mastered.length !== 16;
  };
  const answerQuiz = index => {
    const qs = state.quiz, q = quiz[qs.current], correct = qs.recovery ? q[8] : q[3], feedback = $("#quizFeedback");
    if (index === correct) {
      if (!qs.mastered.includes(qs.current)) qs.mastered.push(qs.current); qs.mastered.sort((a, b) => a - b); qs.recovery = false; save();
      feedback.innerHTML = `<div class="quiz-feedback correct"><b>Corretto.</b> ${q[4]}</div><button class="secondary" id="nextQuestion" type="button">Nucleo successivo</button>`;
      $("#nextQuestion").addEventListener("click", () => { const next = quiz.findIndex((_, i) => !qs.mastered.includes(i)); qs.current = next === -1 ? qs.current : next; renderQuiz(); });
      $("#masteryCount").textContent = `${qs.mastered.length} / 16 nuclei`; $("#masteryBar").style.width = `${qs.mastered.length / 16 * 100}%`; $("#quizComplete").hidden = qs.mastered.length !== 16; buildSynthesis();
    } else {
      qs.recovery = true; save(); feedback.innerHTML = `<div class="quiz-feedback"><b>Non ancora.</b> ${q[4]}</div><div class="micro-lesson"><b>Microlezione</b><p>${q[4]} Torna alla sezione indicata, poi affronta una domanda diversa.</p><a href="${q[5]}">Ripassa la sezione</a> · <button id="recoveryQuestion" type="button">Apri la domanda di recupero</button></div>`; $("#recoveryQuestion").addEventListener("click", renderQuiz);
    }
  };

  const buildSynthesis = () => {
    const facts = [];
    if (state.markers.length) facts.push(`hai osservato ${state.markers.length} zone dell’opera iniziale`);
    if (state.shift) facts.push(`hai distinto l’operazione “${state.shift}” nella soglia dall’Espressionismo`);
    if (state.timeline) facts.push(`hai approfondito la data ${state.timeline}`);
    const changed = Object.keys(state.viewpoint).filter(key => state.viewpoint[key] !== viewDefaults[key]).length;
    if (changed) facts.push(`hai modificato ${changed} parametri del laboratorio del punto di vista`);
    if (state.cezanne) facts.push(`hai separato il livello “${state.cezanne}” nella ricezione di Cézanne`);
    const evidenceGood = evidence.filter((item, i) => state.evidence[i] === item[1]).length;
    if (evidenceGood) facts.push(`hai classificato correttamente ${evidenceGood} affermazioni su Picasso, fonti e interpretazioni`);
    if (state.cluePath.length) facts.push(`hai ordinato ${state.cluePath.length} indizi nel laboratorio analitico`);
    if (state.collage.length) facts.push(`hai combinato ${state.collage.length} statuti materiali nel collage concettuale`);
    if (state.plural) facts.push(`hai esplorato il nodo “${state.plural}” nella rete dei Cubismi`);
    if (state.quiz.mastered.length) facts.push(`hai compreso ${state.quiz.mastered.length} nuclei della verifica`);
    let text = facts.length ? `Nel percorso ${facts.join("; ")}. ` : "Hai visitato il modulo senza completare ancora attività registrate. ";
    if (state.notes.initial.trim()) text += "Hai formulato una prima ipotesi. "; if (state.notes.final.trim()) text += "Hai scritto una seconda lettura. ";
    text += "Le azioni svolte mostrano che riconoscere non significa possedere una veduta totale: hai lavorato su indizi, relazioni, materiali e convenzioni. Questa sintesi non attribuisce giudizi o emozioni che non hai espresso.";
    $("#personalSynthesis").textContent = text;
  };
  $("#buildSynthesis").addEventListener("click", buildSynthesis); buildSynthesis(); renderQuiz(); renderEcho();

  const dialog = $("#lightbox"), lightImg = $("#lightboxImage"), caption = $("#lightboxCaption"), viewport = $(".lightbox-viewport", dialog); let returnFocus = null, zoom = 1;
  const setZoom = value => { zoom = Math.max(.5, Math.min(4, value)); lightImg.style.width = `${zoom * 100}%`; $("#zoomReset").textContent = `${Math.round(zoom * 100)}%`; };
  $$(".view-art").forEach(button => button.addEventListener("click", () => { returnFocus = button; lightImg.src = button.dataset.image; lightImg.alt = button.querySelector("img")?.alt || button.dataset.caption || "Opera ingrandita"; caption.textContent = button.dataset.caption || "Opera ingrandita"; setZoom(1); viewport.scrollTo(0, 0); dialog.showModal(); $("#lightboxClose").focus(); }));
  $("#lightboxClose").addEventListener("click", () => dialog.close()); $("#zoomIn").addEventListener("click", () => setZoom(zoom + .25)); $("#zoomOut").addEventListener("click", () => setZoom(zoom - .25)); $("#zoomReset").addEventListener("click", () => setZoom(1));
  dialog.addEventListener("close", () => { lightImg.src = ""; returnFocus?.focus(); }); dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", event => { if (event.key !== "Tab") return; const list = $$("button:not([disabled])", dialog), first = list[0], last = list.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } });

  const resetHandlers = {
    viewpoint: () => { state.viewpoint = clone(viewDefaults); renderViewpoint(); }, evidence: () => { state.evidence = {}; renderEvidence(); },
    clues: () => { state.cluePath = []; renderClues(); }, collage: () => { state.collage = []; renderCollage(); }
  };
  $$('[data-reset]').forEach(button => button.addEventListener("click", () => { resetHandlers[button.dataset.reset]?.(); save(); }));
  $("#resetAll").addEventListener("click", () => { if (!confirm("Vuoi cancellare note, attività e verifica del solo modulo 17? L’azione non può essere annullata.")) return; state = defaults(); if (storageOK) localStorage.removeItem(KEY); location.reload(); });
  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
})();
