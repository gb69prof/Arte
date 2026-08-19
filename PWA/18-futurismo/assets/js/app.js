"use strict";

(() => {
  const KEY = "storia-sguardo-18-state";
  const VERSION = 1;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  const motionDefaults = { positions: 4, spacing: 42, direction: 12, speed: 45, acceleration: 20, continuity: 60, transparency: 45, trail: 50, environment: 35, spectator: 0, duration: 3, sound: false };
  const defaults = () => ({
    version: VERSION,
    visited: [],
    notes: { initial: "", final: "" },
    markers: [], shift: "", timeline: "", network: "",
    manifest: {}, motion: clone(motionDefaults), media: "muybridge", boccioni: "",
    artist: "", artistCompare: "movimento", sound: { volume: 25, explored: [] },
    city: "", war: [], atlas: "cezanne",
    quiz: { current: 0, recovery: false, mastered: [] }
  });

  let storageOK = true;
  try { const probe = `${KEY}-probe`; localStorage.setItem(probe, "1"); localStorage.removeItem(probe); } catch (_) { storageOK = false; }
  const normalize = raw => {
    const base = defaults();
    if (!raw || typeof raw !== "object" || raw.version !== VERSION) return base;
    const merged = { ...base, ...raw };
    merged.notes = { ...base.notes, ...(raw.notes || {}) };
    merged.motion = { ...base.motion, ...(raw.motion || {}) };
    merged.sound = { ...base.sound, ...(raw.sound || {}) };
    merged.quiz = { ...base.quiz, ...(raw.quiz || {}) };
    merged.visited = Array.isArray(raw.visited) ? [...new Set(raw.visited.filter(n => Number.isInteger(n) && n >= 1 && n <= 13))] : [];
    merged.markers = Array.isArray(raw.markers) ? raw.markers.filter(x => ["direzione", "massa", "ambiente", "appoggio"].includes(x)) : [];
    merged.war = Array.isArray(raw.war) ? raw.war.filter((n, i, a) => Number.isInteger(n) && n >= 0 && n < 6 && a.indexOf(n) === i).sort((a, b) => a - b) : [];
    merged.sound.explored = Array.isArray(merged.sound.explored) ? merged.sound.explored.filter(x => ["pulse", "drone", "grain", "rhythm"].includes(x)) : [];
    merged.quiz.mastered = Array.isArray(merged.quiz.mastered) ? [...new Set(merged.quiz.mastered.filter(n => Number.isInteger(n) && n >= 0 && n < 16))] : [];
    merged.quiz.current = Number.isInteger(merged.quiz.current) && merged.quiz.current >= 0 && merged.quiz.current < 16 ? merged.quiz.current : 0;
    return merged;
  };
  let state = defaults();
  if (storageOK) { try { state = normalize(JSON.parse(localStorage.getItem(KEY))); } catch (_) { state = defaults(); } }
  const save = () => { if (!storageOK) return; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { storageOK = false; showStorageWarning(); } };
  const showStorageWarning = () => {
    if ($(".storage-warning")) return;
    const warning = document.createElement("p"); warning.className = "storage-warning"; warning.textContent = "Il salvataggio locale non è disponibile: il modulo funziona, ma le azioni non resteranno dopo la chiusura."; document.body.append(warning);
  };
  if (!storageOK) showStorageWarning();

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
    $("#progressBar").style.width = `${new Set(state.visited).size / 13 * 100}%`;
    $$(".side-nav a[href^='#s']").forEach((link, i) => link.classList.toggle("visited", state.visited.includes(i + 1)));
  };
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (!entry.isIntersecting) return; const n = Number(entry.target.dataset.section); if (!state.visited.includes(n)) { state.visited.push(n); state.visited.sort((a, b) => a - b); save(); updateProgress(); } }), { threshold: .24 });
  $$('[data-section]').forEach(section => observer.observe(section)); updateProgress();

  const bindNote = (id, key) => { const el = $(id); el.value = state.notes[key] || ""; el.addEventListener("input", () => { state.notes[key] = el.value; save(); renderEcho(); }); };
  bindNote("#initialNote", "initial"); bindNote("#finalNote", "final");

  const markerInfo = {
    direzione: ["Testa e direzione", "La testa non presenta un volto riconoscibile: inclina l’intera massa verso l’avanzamento."],
    massa: ["Massa e torsione", "Torso e fianchi conservano peso, ma le superfici sporgenti impediscono un volume chiuso."],
    ambiente: ["Cavità e ambiente", "I vuoti non sono sfondo passivo: entrano nella figura e rendono incerto il confine fra corpo e aria."],
    appoggio: ["Piedi e appoggio", "Le basi allargate sembrano frenare e spingere insieme. La marcia non cancella gravità e instabilità."]
  };
  const renderMarkers = () => {
    $$('[data-marker]').forEach(button => button.setAttribute("aria-pressed", String(state.markers.includes(button.dataset.marker))));
    const last = state.markers.at(-1);
    $("#markerReadout").innerHTML = last ? `<b>${markerInfo[last][0]}</b><p>${markerInfo[last][1]}</p>` : "<b>Scegli una zona</b><p>Un marcatore isola una relazione visibile; non attribuisce ancora una causa.</p>";
    renderEcho();
  };
  $$('[data-marker]').forEach(button => button.addEventListener("click", () => { const key = button.dataset.marker; state.markers = state.markers.includes(key) ? state.markers.filter(x => x !== key) : [...state.markers, key]; save(); renderMarkers(); }));
  function renderEcho() {
    $("#initialEcho").textContent = state.notes.initial.trim() || "Non hai ancora scritto un’ipotesi iniziale.";
    $("#markerEcho").textContent = state.markers.length ? `Zone osservate: ${state.markers.map(x => markerInfo[x][0].toLowerCase()).join(", ")}.` : "Non hai usato i marcatori iniziali.";
  }
  renderMarkers();

  const shiftData = {
    frammentare: "Gris interrompe i contorni per costruire un sistema di indizi. Boccioni apre la massa perché corpo e spazio partecipino alla stessa tensione.",
    posizioni: "Una sequenza di posture può registrare fasi successive; la scultura iniziale non allinea fotogrammi né moltiplica arti.",
    direzione: "Diagonali, inclinazioni e sporgenze orientano il campo anche quando non vediamo più posizioni distinte.",
    ambiente: "Nel Futurismo l’ambiente può apparire compenetrato con la figura; non è soltanto uno sfondo dietro un oggetto mobile.",
    durata: "Sovrapposizione e ritmo suggeriscono una durata selezionata, non contengono tutto il tempo trascorso.",
    urto: "Linee e masse possono portare l’azione oltre il bordo o mettere lo spettatore nel campo; il coinvolgimento resta una costruzione visiva."
  };
  const renderShift = () => { $$("#shiftChoices button").forEach(button => button.classList.toggle("active", button.dataset.shift === state.shift)); $("#shiftResult").textContent = state.shift ? shiftData[state.shift] : "Scegli un’operazione: la stessa superficie può conservare, moltiplicare o sacrificare informazioni diverse."; };
  $$("#shiftChoices button").forEach(button => button.addEventListener("click", () => { state.shift = button.dataset.shift; save(); renderShift(); })); renderShift();

  const timelineData = {
    "1870": ["1870–1889 · Sistemi e misure", "Ferrovie, industria e illuminazione trasformano spazi e ritmi. Muybridge separa posture con più fotocamere; Marey registra movimenti con strumenti fisiologici.", "Registrare ciò che l’occhio non isola non stabilisce ancora una poetica futurista."],
    "1895": ["1895–1908 · Nuovi spettacoli del tempo", "Cinema, automobile, aviazione, stampa illustrata e pubblicità rendono familiari successione, velocità e simultaneità urbana. Milano cresce dentro un’Italia ancora largamente agricola.", "Modernizzazione diseguale e innovazione artistica non coincidono."],
    "1909": ["1909 · Il gruppo annunciato prima di esistere", "Marinetti pubblica il manifesto in francese su Le Figaro il 20 febbraio. La stampa internazionale, il racconto notturno e il programma numerato costruiscono un evento.", "Il manifesto di un poeta non contiene già tutte le pratiche artistiche successive."],
    "1910": ["1910–1912 · Pittura, viaggio, conflitto", "Boccioni, Carrà e Russolo firmano il Manifesto dei pittori futuristi; con Balla e Severini sottoscrivono quello tecnico. Il confronto con Parigi e il Cubismo modifica le ricerche.", "Prestito e opposizione non equivalgono a derivazione lineare."],
    "1911": ["1911–1913 · Espansione e contraddizioni", "Guerra di Libia, mostre internazionali, fotodinamismo, scultura, serate e L’arte dei rumori ampliano i media del movimento.", "Espansione artistica, propaganda coloniale e conflitti interni vanno distinti ma letti insieme."],
    "1914": ["1914–1916 · Dalla retorica al fronte", "L’interventismo precede l’ingresso italiano in guerra. Artisti si arruolano; Boccioni muore dopo una caduta da cavallo e Sant’Elia al fronte nel 1916.", "La morte non prova una conversione collettiva né assolve la retorica precedente."],
    "1919": ["1919 · Arte e organizzazione politica", "Marinetti partecipa alla fondazione dei Fasci italiani di combattimento; futuristi entrano in reti politiche, ma divergono su monarchia, clericalismo e istituzioni.", "La convergenza è documentata; non rende identici tutti gli artisti o tutte le fasi."],
    "1922": ["1922 e dopo · Continuità sotto il regime", "Con il fascismo al potere il Futurismo continua in grafica, teatro, design e aeropittura. Marinetti cerca riconoscimento istituzionale e diventa accademico d’Italia nel 1929.", "Né estraneità politica né totale coincidenza descrivono l’intero rapporto con il regime."]
  };
  const renderTimeline = () => { $$("#timeline button").forEach(button => button.classList.toggle("active", button.dataset.year === state.timeline)); const d = timelineData[state.timeline]; $("#timelineDetail").innerHTML = d ? `<h3>${d[0]}</h3><p>${d[1]}</p><p><strong>Limite:</strong> ${d[2]}</p>` : "<p>Scegli una data: appariranno evento, relazione e limite causale.</p>"; };
  $$("#timeline button").forEach(button => button.addEventListener("click", () => { state.timeline = button.dataset.year; save(); renderTimeline(); })); renderTimeline();
  const networkData = {
    materiali: "Industrie, trasporti, elettricità, scioperi ed emigrazione modificano corpi e città. Sono condizioni storiche, non pennelli automatici.",
    strumenti: "Fotografia, cronofotografia, cinema, telegrafo e stampa producono nuove operazioni: isolare, sovrapporre, trasmettere. L’artista seleziona e trasforma.",
    incontri: "Roma, Milano, Parigi, mostre, lettere e serate mettono in contatto persone e opere. Un incontro documenta una possibilità, non un risultato inevitabile.",
    scelte: "Linee-forza, compenetrazione, ripetizione e simultaneità sono decisioni formali differenti. La modernità offre problemi; gli artisti costruiscono risposte.",
    ricezioni: "Critici, pubblico, mercato e istituzioni traducono il movimento in scandalo, italianità o stile. La ricezione cambia ciò che diventa visibile.",
    politica: "Colonialismo, interventismo e fascismo dipendono da decisioni e organizzazioni umane. Non sono effetti naturali della velocità né incidenti esterni all’avanguardia."
  };
  const renderNetwork = () => { $$("#historyNetwork button").forEach(button => button.classList.toggle("active", button.dataset.node === state.network)); $("#networkText").textContent = state.network ? networkData[state.network] : "Attiva un nodo per distinguere ciò che rende possibile un’esperienza da ciò che la spiega."; };
  $$("#historyNetwork button").forEach(button => button.addEventListener("click", () => { state.network = button.dataset.node; save(); renderNetwork(); })); renderNetwork();

  const manifestStatements = [
    ["Il testo fu pubblicato su Le Figaro il 20 febbraio 1909.", "storica"],
    ["Il “noi” annuncia una comunità che il testo contribuisce a formare.", "pubblicitaria"],
    ["La velocità deve diventare un valore della nuova bellezza.", "estetica"],
    ["Musei e biblioteche sono costruiti come nemici simbolici.", "provocazione"],
    ["La guerra è esaltata come strumento di rigenerazione.", "politica"],
    ["Il disprezzo della donna è una violenza dichiarata, non un dato neutro.", "violenza"],
    ["Ogni opera futurista applicò letteralmente gli undici punti.", "successiva"]
  ];
  const manifestOptions = [["", "Scegli…"], ["storica", "Affermazione storica"], ["estetica", "Progetto estetico"], ["pubblicitaria", "Strategia comunicativa"], ["provocazione", "Provocazione / metafora"], ["politica", "Programma politico"], ["violenza", "Violenza dichiarata"], ["successiva", "Interpretazione non dimostrata"]];
  const renderManifest = () => {
    const host = $("#manifestStatements");
    host.innerHTML = manifestStatements.map((item, i) => `<label class="evidence-row ${state.manifest[i] ? (state.manifest[i] === item[1] ? "correct" : "wrong") : ""}"><span>${item[0]}</span><select data-manifest="${i}" aria-label="Classifica: ${item[0]}">${manifestOptions.map(([value, label]) => `<option value="${value}" ${state.manifest[i] === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>`).join("");
    $$("select", host).forEach(select => select.addEventListener("change", () => { state.manifest[select.dataset.manifest] = select.value; save(); renderManifest(); }));
    const answered = Object.values(state.manifest).filter(Boolean).length, correct = manifestStatements.filter((item, i) => state.manifest[i] === item[1]).length;
    $("#manifestScore").textContent = answered ? `${correct} classificazioni corrette su ${answered}. Separare funzione retorica, progetto estetico e programma politico impedisce sia l’assoluzione sia la confusione.` : "";
  };
  renderManifest();

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const spectatorNames = ["esterno", "attraversato", "coinvolto"];
  const motionUnits = { positions: "", spacing: "", direction: "°", speed: "%", acceleration: "%", continuity: "%", transparency: "%", trail: "%", environment: "%", spectator: "", duration: "" };
  let motionRunning = false;
  const renderMotion = () => {
    const p = state.motion, stage = $("#motionStage"), trail = $("#motionTrail");
    stage.style.setProperty("--direction", `${p.direction}deg`); stage.style.setProperty("--env", p.environment); stage.style.setProperty("--motion-duration", `${Math.max(.7, 4.2 - p.speed * .032)}s`);
    trail.innerHTML = Array.from({ length: p.positions }, (_, i) => { const accel = 1 + p.acceleration / 100 * (i / Math.max(1, p.positions - 1)); const distance = (i - (p.positions - 1) / 2) * p.spacing * accel; const y = Math.sin(i * .7) * (100 - p.continuity) * .12; const alpha = Math.max(.08, (1 - p.transparency / 100) * (1 - i / (p.positions + 2)) * (.35 + p.trail / 100)); return `<span class="trail-copy" style="--copy-x:${distance}px;--copy-y:${y}px;--copy-alpha:${alpha}"></span>`; }).join("");
    Object.entries(p).forEach(([key, value]) => { if (key === "sound") return; const input = $(`#${key}`), output = input?.closest("label")?.querySelector("output"); if (input) input.value = value; if (output) output.value = key === "spectator" ? spectatorNames[value] : `${value}${motionUnits[key]}`; });
    $("#motionSound").checked = Boolean(p.sound);
    const clauses = [];
    clauses.push(p.positions === 1 ? "una posizione non descrive una traiettoria" : `${p.positions} posizioni rendono leggibile una successione, ma non l’intera durata`);
    clauses.push(Math.abs(p.acceleration) < 8 ? "distanze quasi costanti suggeriscono velocità regolare" : p.acceleration > 0 ? "distanze crescenti distinguono accelerazione da velocità" : "distanze decrescenti suggeriscono rallentamento");
    clauses.push(p.continuity > 65 ? "la continuità fonde le fasi" : "la discontinuità conserva scatti separati");
    clauses.push(p.environment > 55 ? "il campo circostante viene fortemente deformato" : "l’ambiente conserva relativa autonomia");
    clauses.push(`lo spettatore è impostato come ${spectatorNames[p.spectator]}`);
    $("#motionAnalysis").innerHTML = `<b>Sintesi derivata dalle regolazioni</b><p>${clauses.join("; ")}. La superficie seleziona relazioni e sacrifica informazioni: non rappresenta scientificamente il tempo.</p>`;
  };
  $$("#motionControls input[type='range']").forEach(input => input.addEventListener("input", () => { state.motion[input.name] = Number(input.value); save(); renderMotion(); }));
  $("#motionSound").addEventListener("change", event => { state.motion.sound = event.target.checked; save(); });
  const playImpulse = () => { try { const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return; const ctx = new Ctx(), osc = ctx.createOscillator(), gain = ctx.createGain(); osc.type = "triangle"; osc.frequency.setValueAtTime(150, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + .16); gain.gain.setValueAtTime(.0001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.08, ctx.currentTime + .02); gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .22); osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .24); setTimeout(() => ctx.close(), 400); } catch (_) {} };
  $("#toggleMotion").addEventListener("click", () => { if (reducedMotion) return; motionRunning = !motionRunning; $("#motionStage").classList.toggle("running", motionRunning); $("#toggleMotion").setAttribute("aria-pressed", String(motionRunning)); $("#toggleMotion").textContent = motionRunning ? "Ferma animazione" : "Avvia animazione"; if (motionRunning && state.motion.sound) playImpulse(); });
  if (reducedMotion) { $("#toggleMotion").disabled = true; $("#toggleMotion").textContent = "Animazione disattivata"; }
  renderMotion();

  const mediaData = {
    muybridge: ["Separata", "Fotocamere successive", "Posture discrete", "Tra una posa e l’altra", "Analisi di fasi"],
    marey: ["Sovrapposta", "Esposizioni su un supporto", "Traiettorie misurabili", "Dettaglio del corpo", "Analisi continua/semi-continua"],
    cinema: ["Proiettata", "Fotogrammi in successione", "Illusione di continuità", "Tempo fuori dalla selezione", "Spettacolo temporale"],
    bragaglia: ["Interpretata", "Posa lunga e scia", "Continuità dell’atto", "Posture nettamente isolabili", "Sensazione e significato"],
    pittura: ["Costruita", "Segni, colore, piani", "Relazioni scelte", "Registrazione automatica", "Forma e interpretazione"]
  };
  const mediaLabels = ["Registrazione", "Procedura", "Conserva", "Perde", "Obiettivo prevalente"];
  const renderMedia = () => { $("#mediaCompare").value = state.media; $("#mediaGrid").innerHTML = mediaLabels.map((label, i) => `<article class="compare-card"><h3>${label}</h3><p>${mediaData[state.media][i]}</p></article>`).join(""); $("#mediaSynthesis").innerHTML = `<b>Risultato</b><p>${state.media === "pittura" ? "La pittura non è una cronofotografia imperfetta: decide che cosa rendere simultaneo, continuo o instabile." : "Il dispositivo conserva alcune informazioni e ne perde altre. Fonte tecnica e linguaggio artistico restano distinti."}</p>`; };
  $("#mediaCompare").addEventListener("change", event => { state.media = event.target.value; save(); renderMedia(); }); renderMedia();

  const boccioniData = {
    visibile: "Nel disegno degli Addii vortici, numeri, profili e diagonali si intrecciano; nella bottiglia superfici interne ed esterne si aprono a spirale. Questi sono dati osservabili.",
    dichiarato: "Boccioni parla di compenetrazione, linee-forza, dinamismo plastico e sintesi di moto relativo e moto assoluto. Le parole orientano, ma non sostituiscono l’opera.",
    documentato: "Il viaggio a Parigi del 1911 e l’incontro con opere cubiste precedono la seconda versione degli Stati d’animo. Lettere, manifesti, mostre e cataloghi permettono una ricostruzione storica.",
    interpretato: "Leggere la stazione come esperienza psicologica della modernità o la scultura come fusione di corpo e aria è un’interpretazione fondata, non un dato fotografico né una verità unica."
  };
  const renderBoccioni = () => { $$("#boccioniLayers button").forEach(button => button.classList.toggle("active", button.dataset.layer === state.boccioni)); $("#boccioniResult").textContent = state.boccioni ? boccioniData[state.boccioni] : "Scegli un livello per non confondere l’opera con il manifesto o con una lettura successiva."; };
  $$("#boccioniLayers button").forEach(button => button.addEventListener("click", () => { state.boccioni = button.dataset.layer; save(); renderBoccioni(); })); renderBoccioni();

  const artistData = {
    boccioni: ["Boccioni · compenetrare", "Corpo, oggetto e ambiente diventano un sistema plastico. Città, lavoro, cavallo e stati d’animo impediscono di ridurre tutto alla macchina."],
    balla: ["Balla · analizzare luce e ripetizione", "Dalla scomposizione divisionista passa a sequenze, traiettorie luminose e compenetrazioni iridescenti; movimento e astrazione non coincidono sempre."],
    carra: ["Carrà · folla, urto, parola", "Scene collettive e conflitto urbano usano ritmo, diagonali e segni verbali. Il suo percorso politico e artistico cambia già durante la guerra."],
    severini: ["Severini · danza, treno, rete parigina", "La vita notturna e il movimento ritmico dialogano con Cubismo e divisionismo. La sua posizione internazionale rende porosi i confini del gruppo."],
    russolo: ["Russolo · rendere organizzabile il rumore", "Pittura, manifesto e strumenti sonori spostano il dinamismo nell’ascolto. L’intonarumore è progetto acustico e performativo."],
    depero: ["Depero · ricostruire l’ambiente", "Grafica, teatro, pubblicità, oggetti e design ampliano il Futurismo oltre il quadro, soprattutto nel dopoguerra e dentro nuovi rapporti col mercato."],
    santelia: ["Sant’Elia · immaginare la città", "Disegni e manifesto progettano infrastrutture, flussi e verticalità. Le città non furono costruite: distinguere progetto e realizzazione è essenziale."]
  };
  const artistNames = ["Boccioni", "Balla", "Carrà", "Severini", "Russolo", "Depero", "Sant’Elia"];
  const artistKeys = Object.keys(artistData);
  const artistCompareData = {
    movimento: ["Corpo + ambiente", "Ripetizione + luce", "Urto della folla", "Ritmo e danza", "Onda sonora", "Movimento scenico", "Flussi urbani"],
    spazio: ["Compenetrazione", "Traiettoria", "Piazza compressa", "Piani parigini", "Ambiente acustico", "Ambiente totale", "Città verticale"],
    media: ["Pittura e scultura", "Pittura e progetto", "Pittura e parole", "Pittura e mosaico", "Pittura e suono", "Grafica e teatro", "Disegno architettonico"],
    societa: ["Lavoro e metropoli", "Strada e illuminazione", "Folla e conflitto", "Spettacolo moderno", "Ascolto industriale", "Pubblicità e consumo", "Infrastruttura"],
    politica: ["Interventista; muore 1916", "Adesioni e fasi tarde", "Dall’interventismo ad altro", "Percorso autonomo", "Partecipazione e distanza", "Rapporto col regime", "Interventista; muore 1916"]
  };
  const renderArtist = () => { $$("#futuristNetwork button").forEach(button => button.classList.toggle("active", button.dataset.artist === state.artist)); $("#artistPanel").innerHTML = state.artist ? `<h3>${artistData[state.artist][0]}</h3><p>${artistData[state.artist][1]}</p><p class="tagline">Una pratica specifica dentro un movimento plurale.</p>` : "<p>Scegli un nodo: il movimento corporeo, la luce, la folla, la danza, il rumore e l’architettura non sono la stessa ricerca.</p>"; };
  $$("#futuristNetwork button").forEach(button => button.addEventListener("click", () => { state.artist = button.dataset.artist; save(); renderArtist(); })); renderArtist();
  const renderArtistCompare = () => { $("#artistCompare").value = state.artistCompare; $("#artistGrid").innerHTML = artistNames.map((name, i) => `<article class="compare-card"><h3>${name}</h3><p>${artistCompareData[state.artistCompare][i]}</p></article>`).join(""); };
  $("#artistCompare").addEventListener("change", event => { state.artistCompare = event.target.value; save(); renderArtistCompare(); }); renderArtistCompare();

  let audioContext = null;
  const liveSounds = new Map();
  const createSound = type => {
    const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return null;
    audioContext ||= new Ctx(); if (audioContext.state === "suspended") audioContext.resume();
    const master = audioContext.createGain(); master.gain.value = state.sound.volume / 100 * .22; master.connect(audioContext.destination);
    const osc = audioContext.createOscillator(), gain = audioContext.createGain(); gain.gain.value = .26;
    const settings = { pulse: ["square", 92], drone: ["sine", 54], grain: ["sawtooth", 168], rhythm: ["triangle", 128] }[type]; osc.type = settings[0]; osc.frequency.value = settings[1];
    let lfo = null;
    if (["pulse", "rhythm"].includes(type)) { lfo = audioContext.createOscillator(); const lfoGain = audioContext.createGain(); lfo.frequency.value = type === "pulse" ? 3.2 : 5.4; lfoGain.gain.value = .24; lfo.connect(lfoGain).connect(gain.gain); lfo.start(); }
    if (type === "grain") { const filter = audioContext.createBiquadFilter(); filter.type = "bandpass"; filter.frequency.value = 520; osc.connect(filter).connect(gain); } else osc.connect(gain);
    gain.connect(master); osc.start(); return { osc, lfo, master };
  };
  const stopType = type => { const node = liveSounds.get(type); if (!node) return; try { node.osc.stop(); node.lfo?.stop(); } catch (_) {} liveSounds.delete(type); };
  const soundDescription = () => {
    const active = [...liveSounds.keys()]; const descriptions = { pulse: "impulso regolare", drone: "ronzio continuo", grain: "tessitura aspra", rhythm: "ritmo triangolare" };
    $("#soundText").textContent = active.length ? `Combinazione attiva: ${active.map(x => descriptions[x]).join(", ")}. Densità ${active.length}/4, volume ${state.sound.volume}%. I suoni sono sintesi contemporanee originali.` : `Nessun suono attivo. Hai esplorato ${state.sound.explored.length} famiglie su 4; la visualizzazione e questo testo forniscono un’alternativa equivalente.`;
    $("#soundVisual").classList.toggle("active", active.length > 0);
    $$("[data-sound]").forEach(button => button.setAttribute("aria-pressed", String(liveSounds.has(button.dataset.sound))));
  };
  $$("[data-sound]").forEach(button => button.addEventListener("click", () => { const type = button.dataset.sound; if (liveSounds.has(type)) stopType(type); else { const node = createSound(type); if (!node) { $("#soundText").textContent = "Web Audio non è disponibile. Usa la descrizione visiva e testuale equivalente."; return; } liveSounds.set(type, node); if (!state.sound.explored.includes(type)) state.sound.explored.push(type); save(); } soundDescription(); }));
  $("#soundVolume").value = state.sound.volume; $("#soundVolume").closest("label").querySelector("output").value = `${state.sound.volume}%`;
  $("#soundVolume").addEventListener("input", event => { state.sound.volume = Number(event.target.value); event.target.closest("label").querySelector("output").value = `${state.sound.volume}%`; liveSounds.forEach(node => node.master.gain.value = state.sound.volume / 100 * .22); save(); soundDescription(); });
  $("#stopSound").addEventListener("click", () => { [...liveSounds.keys()].forEach(stopType); soundDescription(); }); soundDescription();

  const cityData = {
    operaio: "La macchina può alleggerire un gesto o imporre cadenze, sorveglianza e rischio. Folla e sciopero mostrano corpi che non controllano allo stesso modo la modernizzazione.",
    viaggiatore: "Il treno avvicina città ma presuppone rete, biglietto e documenti; per l’emigrante la velocità può significare separazione, precarietà e perdita.",
    pilota: "Automobilista e aviatore incarnano controllo, pericolo e prestigio. Sono figure selettive: la modernità celebrata non è accessibile in modo universale.",
    colonia: "Nella guerra di Libia tecnologia e velocità militare sostengono conquista e gerarchia. Il soggetto colonizzato non può essere ridotto a paesaggio della potenza italiana.",
    spettatrice: "Le donne entrano in città, spettacoli, lavoro e produzione culturale, ma accesso e riconoscimento restano diseguali. Essere visibili non significa controllare il canone."
  };
  const renderCity = () => { $$("#cityCards button").forEach(button => button.classList.toggle("active", button.dataset.city === state.city)); $("#cityResult").textContent = state.city ? cityData[state.city] : "Scegli una posizione: la stessa macchina non produce per tutti la stessa libertà."; };
  $$("#cityCards button").forEach(button => button.addEventListener("click", () => { state.city = button.dataset.city; save(); renderCity(); })); renderCity();

  const warData = [
    "Dichiarazione · Il manifesto estetizza aggressività e guerra. Una figura retorica non è innocua solo perché iperbolica: stabilisce valori e nemici.",
    "Propaganda · Serate, volantini, giornali e parole in libertà trasformano l’enunciato in comunicazione collettiva, anche durante la guerra di Libia e la campagna interventista.",
    "Decisione · Colonialismo, ingresso in guerra e fondazione di organizzazioni fasciste sono scelte politiche. Non discendono naturalmente da una diagonale o da un’automobile.",
    "Esperienza · Arruolamento, fronte, ferite e morte riportano peso e vulnerabilità nei corpi che la retorica aveva reso astratti.",
    "Conseguenza · La guerra industriale produce lutto, distruzione e crisi dell’ordine europeo. Boccioni e Sant’Elia muoiono nel 1916; il movimento perde protagonisti e cambia fase.",
    "Memoria · Il fascismo userà modernità e tradizione; Marinetti cercherà spazio nel regime. La storiografia deve distinguere fasi senza assolvere adesioni documentate."
  ];
  const renderWar = () => { $$("#warSequence button").forEach((button, i) => { button.disabled = i > state.war.length; button.classList.toggle("completed", state.war.includes(i)); }); const last = state.war.at(-1); $("#warResult").textContent = Number.isInteger(last) ? warData[last] : "Inizia dalla dichiarazione. La frase sulla guerra come “igiene” sarà analizzata, non trasformata in slogan decorativo."; };
  $$("#warSequence button").forEach((button, i) => button.addEventListener("click", () => { if (i > state.war.length) return; if (!state.war.includes(i)) state.war.push(i); save(); renderWar(); })); renderWar();

  const atlasData = {
    cezanne: ["Cézanne · costruire la sensazione", "Volume e aggiustamenti dello spazio", "Tempo sedimentato nel lavoro", "Osservatore davanti alla natura", "Guadagna struttura; perde coerenza prospettica unica"],
    munch: ["Munch / Kirchner · rendere visibile una tensione", "Deformazione di corpo e città", "Istante vissuto e pressione sociale", "Spettatore coinvolto o esposto", "Guadagna intensità; perde neutralità naturalistica"],
    kandinsky: ["Kandinsky · rendere autonome le relazioni", "Ritmo di colore, linea e campo", "Durata percettiva non narrativa", "Spettatore che organizza", "Guadagna autonomia; perde identificazione certa"],
    cubism: ["Picasso / Braque · crisi dell’apparizione unica", "Frammentazione, indizio, collage", "Successione costruita e memoria", "Spettatore che ricompone", "Guadagna coscienza del segno; perde totalità continua"],
    gris: ["Gris / Blanchard · sintassi e pluralità", "Piani, oggetti, colore, convenzioni", "Relazioni simultanee selezionate", "Spettatore guidato dagli indizi", "Guadagna leggibilità; perde spontaneità apparente"],
    boccioni: ["Boccioni · compenetrare corpo e ambiente", "Linee-forza, massa, vuoto", "Dinamismo e stati d’animo", "Spettatore dentro il campo", "Guadagna energia relazionale; perde confine stabile"],
    others: ["Balla / Carrà / Severini / Russolo · moltiplicare i Futurismi", "Luce, folla, danza, parola, suono", "Ripetizione, urto, ritmo", "Spettatore, pubblico, ascoltatore", "Guadagna pluralità dei media; perde unità del movimento"]
  };
  const renderAtlas = () => { $$("[data-atlas]").forEach(button => button.setAttribute("aria-selected", String(button.dataset.atlas === state.atlas))); const d = atlasData[state.atlas]; $("#atlasCard").innerHTML = `<h3>${d[0]}</h3><div><h4>Spazio / forma</h4><p>${d[1]}</p></div><div><h4>Tempo</h4><p>${d[2]}</p></div><div><h4>Spettatore</h4><p>${d[3]}</p></div><div><h4>Guadagno / perdita</h4><p>${d[4]}</p></div>`; };
  $$("[data-atlas]").forEach(button => button.addEventListener("click", () => { state.atlas = button.dataset.atlas; save(); renderAtlas(); })); renderAtlas();

  const quiz = [
    ["Cubismo e Futurismo", "Quale differenza evita l’idea di superamento?", ["Il Cubismo è immobile e il Futurismo vivo", "Il Cubismo interroga l’apparizione dell’oggetto; il Futurismo costruisce relazioni di movimento fra corpo e ambiente", "Il Futurismo applica scientificamente il Cubismo"], 1, "Cambiano problema e operazioni, non il grado di progresso.", "#s2", "La soglia fra i due movimenti va descritta come…", ["una nuova domanda, non una graduatoria", "una vittoria italiana", "un passaggio inevitabile"], 0],
    ["Corpo e ambiente", "Per Boccioni il dinamismo più complesso riguarda…", ["solo gli arti ripetuti", "la fusione plastica di oggetto, ambiente e spettatore", "una posa fotografica isolata"], 1, "Il movimento modifica il campo circostante e il confine della figura.", "#s7", "Nella scultura iniziale i vuoti sono…", ["errori di fusione", "sfondo passivo", "parti attive della relazione fra figura e spazio"], 2],
    ["Velocità e accelerazione", "Che differenza mostra il laboratorio?", ["Sono sinonimi", "La velocità riguarda il cambiamento di posizione; l’accelerazione il cambiamento della velocità", "L’accelerazione è il numero delle figure"], 1, "Distanze crescenti o decrescenti distinguono accelerazione e rallentamento.", "#s5", "Posizioni a distanza costante suggeriscono…", ["velocità più regolare", "accelerazione infinita", "assenza di durata"], 0],
    ["Contesto senza determinismo", "Che ruolo hanno elettricità, automobile e cinema?", ["Producono automaticamente il Futurismo", "Creano nuove esperienze e strumenti che gli artisti trasformano attraverso scelte", "Sono irrilevanti"], 1, "Condizioni materiali e decisioni formali vanno collegate senza causalità automatica.", "#s3", "Una tecnologia è una causa sufficiente di uno stile?", ["Sì, sempre", "Solo in Italia", "No: rende possibili operazioni, non decide il linguaggio"], 2],
    ["Cronofotografia e cinema", "Che cosa distingue Muybridge dalla pittura futurista?", ["Muybridge separa posture registrate; la pittura costruisce relazioni selezionate", "Nessuna differenza", "La pittura registra più dati"], 0, "Registrazione tecnica e interpretazione artistica non coincidono.", "#s6", "Il fotodinamismo dei Bragaglia cerca soprattutto…", ["una posa immobile", "continuità e senso dell’atto", "una sequenza di ventiquattro camere"], 1],
    ["Manifesto", "Perché il manifesto è una macchina comunicativa?", ["Descrive soltanto opere già esistenti", "Usa stampa, noi, slogan e nemici per produrre attenzione e gruppo", "È un testo privato"], 1, "Forma e mezzo del manifesto partecipano alla sua azione.", "#s4", "Il “noi” del 1909…", ["registra un gruppo immutabile", "non ha funzione", "contribuisce a costruire la comunità che annuncia"], 2],
    ["Pluralità", "Perché è corretto parlare di Futurismi?", ["Ogni artista usa media, soggetti e operazioni differenti", "Non esistono manifesti comuni", "Il termine indica qualsiasi arte veloce"], 0, "Il nome collettivo non rende intercambiabili le pratiche.", "#s8", "Balla e Russolo differiscono perché…", ["uno analizza luce e ripetizione, l’altro sposta la ricerca anche nel suono", "uno è cubista e l’altro impressionista", "non ebbero contatti"], 0],
    ["Boccioni", "Che cosa non riduce il dinamismo a un cliché?", ["Aggiungere molte gambe", "Analizzare linee-forza, massa, vuoto e compenetrazione", "Disegnare un’automobile"], 1, "Boccioni cerca continuità fra forma e ambiente.", "#s7", "Sviluppo di una bottiglia nello spazio mostra…", ["un oggetto fermo costruito come apertura di piani interni ed esterni", "una fotografia", "un motore"], 0],
    ["Differenze interne", "Quale abbinamento è più preciso?", ["Severini–danza e rete parigina; Carrà–folla e urto; Russolo–rumore", "Tutti–stessa tecnica", "Balla–solo scultura; Boccioni–solo musica"], 0, "Soggetti e media distinguono le ricerche.", "#s8", "Sant’Elia va studiato soprattutto attraverso…", ["città realmente costruite", "disegni e progetti di infrastrutture e flussi", "registrazioni sonore"], 1],
    ["Rumore", "Che cosa propone L’arte dei rumori?", ["Riprodurre una registrazione del 1913", "Organizzare artisticamente il nuovo ambiente acustico", "Eliminare ogni ritmo"], 1, "Russolo classifica e rende performabili famiglie di rumori.", "#s9", "Le ricostruzioni odierne degli intonarumori sono…", ["registrazioni autentiche", "ipotesi tecniche contemporanee", "opere di Boccioni"], 1],
    ["Simultaneità e durata", "Quale affermazione è metodologicamente corretta?", ["Il Futurismo dimostra Einstein", "Suggerisce durata e simultaneità con scelte formali senza rappresentare scientificamente tutto il tempo", "Ogni diagonale è Bergson"], 1, "Analogie culturali non provano influenze scientifiche dirette.", "#s5", "Una sequenza visiva…", ["contiene ogni istante", "seleziona alcune fasi e ne sacrifica altre", "annulla lo spazio"], 1],
    ["Città e classe", "Perché la macchina non libera tutti allo stesso modo?", ["Accesso, controllo, rischio e ritmo sono distribuiti in modo diseguale", "Gli operai rifiutano ogni tecnologia", "La velocità è solo privata"], 0, "Classe e lavoro cambiano la posizione concreta nella modernizzazione.", "#s10", "Chi subisce la cadenza industriale…", ["controlla sempre la macchina", "può vivere la velocità come disciplina e pericolo", "è fuori dalla città"], 1],
    ["Donne e canone", "Quale lettura tiene insieme autrici e misoginia?", ["Le autrici cancellano la misoginia", "La misoginia rende impossibile ogni partecipazione", "La partecipazione femminile è reale e conflittuale dentro gerarchie persistenti"], 2, "La contraddizione non va risolta cancellando uno dei due termini.", "#s10", "Benedetta Cappa va presentata come…", ["soltanto moglie di Marinetti", "autrice e organizzatrice con responsabilità e scelte documentabili", "eccezione senza opere"], 1],
    ["Colonialismo", "Come entra la guerra di Libia nella storia del Futurismo?", ["Come sfondo irrilevante", "Come guerra coloniale celebrata da retoriche futuriste e sostenuta da tecnologia militare", "Come conflitto successivo al fascismo"], 1, "Colonialismo e nazionalismo precedono il regime fascista e hanno responsabilità proprie.", "#s11", "Il soggetto colonizzato va letto come…", ["fondale della potenza italiana", "agente cancellato dalla retorica coloniale", "simbolo automatico di velocità"], 1],
    ["Guerra e fascismo", "Quale formula è storicamente più rigorosa?", ["Tutto il Futurismo è identico al fascismo dal 1909", "Il Futurismo è estraneo al fascismo", "Esistono convergenze documentate, fasi e differenze che non cancellano le responsabilità"], 2, "Cronologia e pluralità impediscono sia assoluzione sia anacronismo.", "#s11", "Marinetti dopo il 1919…", ["resta estraneo al fascismo", "ha un rapporto reale, mutevole e infine istituzionale col regime", "abbandona ogni politica"], 1],
    ["Soglia verso Dada", "Come va aperto il modulo successivo?", ["Dada è il risultato inevitabile del Futurismo", "La guerra industriale mette in crisi la fiducia nell’ordine e apre una nuova domanda", "Il Futurismo viene perfezionato"], 1, "La soglia nasce da un problema storico senza genealogia obbligata.", "#s12", "La conclusione deve…", ["stabilire una graduatoria", "costruire già il modulo 19", "interrogare la ragione che ha partecipato alla catastrofe"], 2]
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
      qs.recovery = true; save(); feedback.innerHTML = `<div class="quiz-feedback"><b>Non ancora.</b> ${q[4]}</div><div class="micro-lesson"><b>Microlezione</b><p>${q[4]} Rileggi la sezione indicata, poi affronta una domanda diversa.</p><a href="${q[5]}">Ripassa la sezione</a> · <button id="recoveryQuestion" type="button">Apri la domanda di recupero</button></div>`; $("#recoveryQuestion").addEventListener("click", renderQuiz);
    }
  };

  function buildSynthesis() {
    const facts = [];
    if (state.markers.length) facts.push(`hai osservato ${state.markers.length} zone dell’opera iniziale`);
    if (state.shift) facts.push(`hai distinto l’operazione “${state.shift}” nella soglia dal Cubismo`);
    if (state.timeline) facts.push(`hai approfondito il nodo cronologico ${state.timeline}`);
    if (state.network) facts.push(`hai esplorato la condizione “${state.network}”`);
    const changed = Object.keys(motionDefaults).filter(key => state.motion[key] !== motionDefaults[key]).length;
    if (changed) facts.push(`hai modificato ${changed} parametri del laboratorio del movimento`);
    const manifestCorrect = manifestStatements.filter((item, i) => state.manifest[i] === item[1]).length;
    if (manifestCorrect) facts.push(`hai classificato correttamente ${manifestCorrect} funzioni del manifesto`);
    if (state.boccioni) facts.push(`hai separato il livello “${state.boccioni}” nell’analisi di Boccioni`);
    if (state.artist) facts.push(`hai esplorato ${artistData[state.artist][0].split(" · ")[0]}`);
    if (state.sound.explored.length) facts.push(`hai avviato ${state.sound.explored.length} famiglie sonore sintetiche`);
    if (state.city) facts.push(`hai osservato la città dalla posizione “${state.city}”`);
    if (state.war.length) facts.push(`hai attraversato ${state.war.length} passaggi fra dichiarazione e memoria`);
    if (state.quiz.mastered.length) facts.push(`hai compreso ${state.quiz.mastered.length} nuclei della verifica`);
    let text = facts.length ? `Nel percorso ${facts.join("; ")}. ` : "Hai visitato il modulo senza completare ancora attività registrate. ";
    if (state.notes.initial.trim()) text += "Hai formulato una prima ipotesi. "; if (state.notes.final.trim()) text += "Hai scritto una seconda lettura. ";
    text += "Le azioni svolte distinguono posizione, velocità, accelerazione, durata e responsabilità storica. Questa sintesi non ti attribuisce emozioni, opinioni o giudizi che non hai espresso.";
    $("#personalSynthesis").textContent = text;
  }
  $("#buildSynthesis").addEventListener("click", buildSynthesis); buildSynthesis(); renderQuiz(); renderEcho();

  const dialog = $("#lightbox"), lightImg = $("#lightboxImage"), caption = $("#lightboxCaption"), viewport = $(".lightbox-viewport", dialog);
  let returnFocus = null, zoom = 1;
  const setZoom = value => { zoom = Math.max(.5, Math.min(4, value)); lightImg.style.width = `${zoom * 100}%`; $("#zoomReset").textContent = `${Math.round(zoom * 100)}%`; };
  $$(".view-art").forEach(button => button.addEventListener("click", () => { returnFocus = button; lightImg.src = button.dataset.image; lightImg.alt = button.querySelector("img")?.alt || button.dataset.caption || "Opera ingrandita"; caption.textContent = button.dataset.caption || "Opera ingrandita"; setZoom(1); viewport.scrollTo(0, 0); dialog.showModal(); $("#lightboxClose").focus(); }));
  $("#lightboxClose").addEventListener("click", () => dialog.close()); $("#zoomIn").addEventListener("click", () => setZoom(zoom + .25)); $("#zoomOut").addEventListener("click", () => setZoom(zoom - .25)); $("#zoomReset").addEventListener("click", () => setZoom(1));
  dialog.addEventListener("close", () => { lightImg.src = ""; returnFocus?.focus(); }); dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", event => { if (event.key !== "Tab") return; const list = $$("button:not([disabled])", dialog), first = list[0], last = list.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } });

  const resetHandlers = {
    manifest: () => { state.manifest = {}; renderManifest(); },
    motion: () => { state.motion = clone(motionDefaults); motionRunning = false; $("#motionStage").classList.remove("running"); $("#toggleMotion").setAttribute("aria-pressed", "false"); if (!reducedMotion) $("#toggleMotion").textContent = "Avvia animazione"; renderMotion(); },
    war: () => { state.war = []; renderWar(); }
  };
  $$('[data-reset]').forEach(button => button.addEventListener("click", () => { resetHandlers[button.dataset.reset]?.(); save(); }));
  $("#resetAll").addEventListener("click", () => { if (!confirm("Vuoi cancellare note, attività e verifica del solo modulo 18? L’azione non può essere annullata.")) return; [...liveSounds.keys()].forEach(stopType); state = defaults(); if (storageOK) localStorage.removeItem(KEY); location.reload(); });
  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
})();
