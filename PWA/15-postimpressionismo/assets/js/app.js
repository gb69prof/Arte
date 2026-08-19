"use strict";
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  const STATE_KEY = "storia-sguardo-15-state";
  const STATE_VERSION = 1;
  const defaultState = {
    version: STATE_VERSION, visited: [],
    notes: { general: "", opening: "", cezanne: "", returning: "" },
    openingMarks: [], timeline: null, history: null, term: "label", myths: [],
    concept: { touches: 2, view: 2, planes: 2, color: 2, simplify: 2, memory: 0, outline: 2, operation: "structure" },
    seurat: [], rule: [], cezanneGuides: [], room: [],
    gauguin: { element: "women", map: {} }, colonial: [],
    answerCategory: "observation", exchange: null, atlasCategory: "truth", finalOps: [],
    quiz: { cursor: 0, mastered: [], attempts: {}, recoveries: [], completed: false }
  };
  const asObject = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const asArray = value => Array.isArray(value) ? value : [];
  function loadState() {
    let raw;
    try { raw = JSON.parse(localStorage.getItem(STATE_KEY)); } catch (error) {
      try { localStorage.removeItem(STATE_KEY); } catch (_) { /* storage non disponibile */ }
      showStorageNotice("I dati locali erano illeggibili: il modulo è ripartito da uno stato sicuro.");
      return clone(defaultState);
    }
    if (!raw || raw.version !== STATE_VERSION) return clone(defaultState);
    return {
      ...clone(defaultState), ...raw, version: STATE_VERSION,
      visited: asArray(raw.visited), openingMarks: asArray(raw.openingMarks), myths: asArray(raw.myths),
      seurat: asArray(raw.seurat), rule: asArray(raw.rule), cezanneGuides: asArray(raw.cezanneGuides), room: asArray(raw.room),
      colonial: asArray(raw.colonial), finalOps: asArray(raw.finalOps), notes: { ...defaultState.notes, ...asObject(raw.notes) },
      concept: { ...defaultState.concept, ...asObject(raw.concept) },
      gauguin: { ...defaultState.gauguin, ...asObject(raw.gauguin), map: asObject(raw.gauguin?.map) },
      quiz: { ...defaultState.quiz, ...asObject(raw.quiz), mastered: asArray(raw.quiz?.mastered), attempts: asObject(raw.quiz?.attempts), recoveries: asArray(raw.quiz?.recoveries) }
    };
  }
  let state = loadState();
  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }
    catch (error) { showStorageNotice("Il salvataggio locale non è disponibile in questa sessione. Puoi continuare, ma i dati potrebbero non restare dopo la chiusura."); }
    updateSummary();
  }
  function showStorageNotice(message) {
    const notice = $("#storageNotice"); if (!notice) return; notice.textContent = message; notice.hidden = false;
    window.clearTimeout(showStorageNotice.timer); showStorageNotice.timer = window.setTimeout(() => { notice.hidden = true; }, 6500);
  }
  function escapeHTML(value = "") { const node = document.createElement("span"); node.textContent = value; return node.innerHTML; }

  // Se una riproduzione non arriva, resta una didascalia utile invece di un vuoto ambiguo.
  const showImageFallback = image => {
    if (image.dataset.failed === "true") return;
    image.dataset.failed = "true"; image.hidden = true;
    const fallback = document.createElement("p"); fallback.className = "image-fallback";
    fallback.setAttribute("role", "status");
    fallback.textContent = `Riproduzione non disponibile in questa sessione. ${image.alt}`;
    image.insertAdjacentElement("afterend", fallback);
  };
  document.addEventListener("error", event => {
    if (event.target instanceof HTMLImageElement && event.target.closest("main")) showImageFallback(event.target);
  }, true);
  $$("main img").forEach(image => { if (image.complete && image.naturalWidth === 0) showImageFallback(image); });

  // Menu, taccuino e focus.
  const menu = $("#chapterMenu"), notes = $("#notesDrawer"), scrim = $("#menuScrim");
  let drawerTrigger = null;
  const focusables = root => $$("a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex='-1'])", root).filter(el => !el.hidden);
  function openDrawer(drawer, trigger) {
    closeDrawer(); drawerTrigger = trigger; drawer.hidden = false; scrim.hidden = false; document.body.classList.add("drawer-open");
    trigger.setAttribute("aria-expanded", "true"); focusables(drawer)[0]?.focus();
  }
  function closeDrawer() {
    [menu, notes].forEach(drawer => drawer.hidden = true); scrim.hidden = true; document.body.classList.remove("drawer-open");
    $$("[aria-controls='chapterMenu'],[aria-controls='notesDrawer']").forEach(button => button.setAttribute("aria-expanded", "false"));
    const target = drawerTrigger; drawerTrigger = null; target?.focus();
  }
  $("#menuButton").addEventListener("click", event => openDrawer(menu, event.currentTarget));
  $("#notesButton").addEventListener("click", event => openDrawer(notes, event.currentTarget));
  $("#menuClose").addEventListener("click", closeDrawer); $("#notesClose").addEventListener("click", closeDrawer); scrim.addEventListener("click", closeDrawer);
  $$("#chapterMenu a").forEach(link => link.addEventListener("click", closeDrawer));
  [menu, notes].forEach(drawer => drawer.addEventListener("keydown", event => {
    if (event.key === "Escape") { closeDrawer(); return; } if (event.key !== "Tab") return;
    const items = focusables(drawer), first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }));
  document.addEventListener("keydown", event => { if (event.key === "Escape") { if (!$("#lightbox").hidden) closeLightbox(); else if (!menu.hidden || !notes.hidden) closeDrawer(); } });

  // Avanzamento reale: una sezione conta quando entra prevalentemente nel viewport.
  const tracked = $$(".tracked");
  function updateProgress() { const count = new Set(state.visited).size; $("#readingProgress").value = count; $("#progressText").textContent = `${count} di 13 tappe`; }
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return; const step = Number(entry.target.dataset.step);
      if (!state.visited.includes(step)) { state.visited.push(step); saveState(); updateProgress(); }
    }), { threshold: .35 }); tracked.forEach(section => observer.observe(section));
  } else { state.visited = tracked.map(section => Number(section.dataset.step)); saveState(); }
  updateProgress();

  function setSaved(selector) { const target = $(selector); target.textContent = "Salvato sul dispositivo"; window.setTimeout(() => { target.textContent = ""; }, 1400); }
  function bindTextarea(selector, key, status) {
    const element = $(selector); element.value = state.notes[key] || "";
    element.addEventListener("input", () => { state.notes[key] = element.value; saveState(); setSaved(status); updateOpeningMemory(); });
  }
  bindTextarea("#generalNotes", "general", "#notesSave"); bindTextarea("#openingNote", "opening", "#openingSave"); bindTextarea("#cezanneExplain", "cezanne", "#cezanneSave"); bindTextarea("#returnNote", "returning", "#returnSave");
  $("#notesReset").addEventListener("click", () => { if (confirm("Azzero soltanto il taccuino trasversale?")) { state.notes.general = ""; $("#generalNotes").value = ""; saveState(); setSaved("#notesSave"); } });

  // 01 · Incongruenze produttive.
  const openingItems = [
    { id:"edge",label:"Bordi del tavolo",x:31,y:72 },{ id:"bottle",label:"Asse della bottiglia",x:51,y:37 },
    { id:"basket",label:"Equilibrio del cesto",x:69,y:37 },{ id:"plate",label:"Altezza del piatto",x:24,y:68 },
    { id:"cloth",label:"Pieghe della tovaglia",x:53,y:69 },{ id:"apples",label:"Peso e scivolamento",x:75,y:64 }
  ];
  function renderOpening() {
    $("#openingChecks").innerHTML = openingItems.map(item => `<button type="button" aria-pressed="${state.openingMarks.includes(item.id)}">${item.label}</button>`).join("");
    $("#openingHotspots").innerHTML = openingItems.map((item,index) => `<button type="button" style="left:${item.x}%;top:${item.y}%" aria-label="Osserva ${item.label}" aria-pressed="${state.openingMarks.includes(item.id)}">${index+1}</button>`).join("");
    const toggle = id => { state.openingMarks = state.openingMarks.includes(id) ? state.openingMarks.filter(value => value !== id) : [...state.openingMarks,id]; saveState(); renderOpening(); };
    $$("#openingChecks button").forEach((button,index) => button.addEventListener("click", () => toggle(openingItems[index].id)));
    $$("#openingHotspots button").forEach((button,index) => button.addEventListener("click", () => toggle(openingItems[index].id)));
    $("#openingFinding").textContent = state.openingMarks.length ? `Hai isolato ${state.openingMarks.length} zone: ${openingItems.filter(item => state.openingMarks.includes(item.id)).map(item=>item.label.toLowerCase()).join(", ")}. Per ora non sappiamo se siano errori, correzioni o relazioni necessarie.` : "Nessuna zona selezionata. Guarda prima l’insieme, poi torna sui punti che sembrano non accordarsi.";
  }
  $("#openingReset").addEventListener("click", () => { state.openingMarks=[]; saveState(); renderOpening(); }); renderOpening();

  // 03 · Cronologia e rete.
  const timelineData = [
    ["1874","Prima mostra impressionista","La ricerca indipendente costruisce pubblici e luoghi espositivi fuori dal Salon; non istituisce ancora una linea postimpressionista."],
    ["1884","Artistes Indépendants","Seurat e Signac partecipano alla nuova Société: l’assenza di giuria amplia l’accesso ma non elimina mercato e selezione."],
    ["1886","Ottava mostra","Seurat presenta la Grande Jatte; Signac e i Pissarro espongono. Fénéon usa “Neoimpressionismo”. È sovrapposizione, non cambio di turno."],
    ["1886–88","Parigi e Arles","Van Gogh incontra Impressionismo e Neoimpressionismo; nel 1888 lavora per nove settimane con Gauguin ad Arles."],
    ["1888","Pont-Aven","Gauguin e Bernard elaborano ricerche sintetiste e cloisonniste; idee e priorità restano oggetto di confronto e conflitto."],
    ["1889","Mostra Volpini","Il Groupe impressionniste et synthétiste espone al Café des Arts durante l’Esposizione universale: anche il nome è una strategia di visibilità."],
    ["1891","Gauguin a Tahiti","Il viaggio avviene dentro l’impero coloniale francese e un progetto di autorappresentazione rivolto al mercato europeo."],
    ["1895","Vollard e Cézanne","La personale organizzata da Ambroise Vollard modifica la ricezione di Cézanne e la posizione dello stesso mercante."],
    ["1907","Ricezioni","La retrospettiva Cézanne al Salon d’Automne alimenta riletture moderne; l’influenza è un uso successivo, non un destino inscritto."],
    ["1910","Roger Fry","La mostra londinese Manet and the Post-Impressionists diffonde una categoria retrospettiva per opere e artisti diversi."]
  ];
  function renderTimeline() {
    $("#timeline").innerHTML=timelineData.map((item,index)=>`<button type="button" aria-pressed="${state.timeline===index}"><b>${item[0]}</b><br>${item[1]}</button>`).join("");
    $$("#timeline button").forEach((button,index)=>button.addEventListener("click",()=>{state.timeline=index;saveState();renderTimeline();}));
    const item=timelineData[state.timeline]; $("#timelineReading").innerHTML=item?`<h3>${item[0]} · ${item[1]}</h3><p>${item[2]}</p>`:"<h3>Scegli una data</h3><p>La cronologia non cerca un atto di nascita: mostra sovrapposizioni e mediazioni.</p>";
  }
  $("#timelineReset").addEventListener("click",()=>{state.timeline=null;saveState();renderTimeline();}); renderTimeline();
  const historyData=[
    ["shows","Mostre","Impressionisti, Indépendants, Les XX, Volpini e personali di galleria costruiscono occasioni differenti di visibilità."],
    ["theory","Teorie","Chevreul, Rood e Charles Henry circolano fra artisti e critici. Le teorie vengono selezionate e trasformate: non passano intatte nella pittura."],
    ["letters","Lettere","Van Gogh, Gauguin, Bernard e altri formulano progetti, descrivono opere, negoziano collaborazioni. Le lettere sono fonti situate, non accesso totale all’intenzione."],
    ["mobility","Mobilità","Parigi, Provenza, Bretagna, Martinica e Polinesia sono collegate da ferrovie, navi, impero e diseguaglianze di movimento."],
    ["market","Mercato","Vollard, gallerie, critici e collezionisti rendono visibili alcune ricerche e ne marginalizzano altre."],
    ["colonial","Colonialismo","L’altrove di Gauguin non è esterno alla modernità: è reso raggiungibile e commerciabile dalla struttura coloniale."],
    ["women","Anna Boch","Artista dei XX e collezionista, collega reti belghe, Neoimpressionismo e Van Gogh: il canone dei quattro uomini nasconde agenti decisivi."]
  ];
  function renderHistory(){$("#historyNodes").innerHTML=historyData.map(item=>`<button type="button" aria-pressed="${state.history===item[0]}">${item[1]}</button>`).join("");$$("#historyNodes button").forEach((button,index)=>button.addEventListener("click",()=>{state.history=historyData[index][0];saveState();renderHistory();}));const item=historyData.find(entry=>entry[0]===state.history);$("#historyReading").innerHTML=item?`<h3>${item[1]}</h3><p>${item[2]}</p>`:"<h3>Attiva un nodo</h3><p>Le opere sono decisioni individuali dentro sistemi di relazione.</p>";} renderHistory();

  // 04 · Etichette e confini.
  const termData=[
    ["label","Postimpressionismo","Etichetta retrospettiva diffusa da Roger Fry nel 1910. È utile se conserva le differenze; diventa ingannevole se finge un gruppo, un manifesto o una tecnica comune."],
    ["period","Periodo convenzionale","Serve a orientarsi tra gli anni Ottanta dell’Ottocento e l’inizio del Novecento, ma le ricerche non iniziano né finiscono insieme."],
    ["network","Rete","Artisti, artiste, studi, lettere, mostre, critici, mercanti e collezionisti spiegano la circolazione meglio del mito dei geni isolati."],
    ["neo","Neoimpressionismo","Nome usato da Félix Fénéon nel 1886 per Seurat, Signac e altri. Indica una ricerca più circoscritta del Postimpressionismo."],
    ["division","Divisionismo","Separazione dei colori in tocchi o tratti. Pointillisme insiste sul punto, ma i termini non sono sinonimi perfetti né ricette uniformi."],
    ["synthesis","Sintetismo","Ricerca che combina esperienza del soggetto, memoria e organizzazione autonoma di forma e colore; associata a Gauguin, Bernard e Pont-Aven."],
    ["cloison","Cloisonnisme","Campiture delimitate da contorni marcati, in dialogo con stampe, vetrate e cultura visiva. È un dispositivo, non un’appartenenza totale."],
    ["symbolism","Simbolismo","Costellazione letteraria e artistica che cerca idee e significati oltre la descrizione naturalistica; non possiede uno stile unico."],
    ["canon","Canone","La selezione di quattro maestri chiarisce una mappa, ma oscura Signac, Bernard, Cross, Toulouse-Lautrec, Valadon, Boch e i Nabis."]
  ];
  function renderTerms(){$("#termMap").innerHTML=termData.map(item=>`<button type="button" aria-pressed="${state.term===item[0]}"><b>${item[1]}</b></button>`).join("");$$("#termMap button").forEach((button,index)=>button.addEventListener("click",()=>{state.term=termData[index][0];saveState();renderTerms();}));const item=termData.find(entry=>entry[0]===state.term)||termData[0];$("#termReading").innerHTML=`<h3>${item[1]}</h3><p>${item[2]}</p>`;} renderTerms();
  const myths=[["group","un’associazione formalmente costituita"],["manifesto","un manifesto condiviso"],["technique","una tecnica comune"],["color","un’unica teoria del colore"],["reaction","un rifiuto totale dell’Impressionismo"],["progress","una marcia inevitabile verso le avanguardie"]];
  function renderMyths(){$("#mythButtons").innerHTML=myths.map(item=>`<button type="button" aria-pressed="${state.myths.includes(item[0])}">${item[1]}</button>`).join("");$$("#mythButtons button").forEach((button,index)=>button.addEventListener("click",()=>{const id=myths[index][0];state.myths=state.myths.includes(id)?state.myths.filter(v=>v!==id):[...state.myths,id];saveState();renderMyths();}));$("#mythReading").textContent=state.myths.length?`Hai escluso ${state.myths.length} false equivalenze. Il termine resta una mappa critica, non l’identità posseduta dagli artisti.`:"Seleziona le formule che il termine non garantisce.";} renderMyths();

  // 05 · Laboratorio delle quattro operazioni.
  const labKeys=["touches","view","planes","color","simplify","memory","outline"];
  const labLabels={touches:"tocchi",view:"punto di vista",planes:"piani",color:"relazioni cromatiche",simplify:"semplificazione",memory:"memoria e immaginazione",outline:"ritmo e contorno"};
  function renderConcept(){
    labKeys.forEach(key=>{$("#lab"+key[0].toUpperCase()+key.slice(1)).value=state.concept[key];});
    $$('input[name="operation"]').forEach(input=>input.checked=input.value===state.concept.operation);
    const scene=$("#conceptScene");labKeys.forEach(key=>scene.dataset[key]=state.concept[key]);
    scene.style.setProperty("--touch-gap",`${7-state.concept.touches}%`);scene.style.setProperty("--view-skew",`${(2-state.concept.view)*2.5}deg`);scene.style.setProperty("--plane-width",`${4+state.concept.planes*2}px`);scene.style.setProperty("--saturation",`${.75+state.concept.color*.18}`);scene.style.setProperty("--memory",`${state.concept.memory*.22}`);scene.style.setProperty("--outline",`${2+state.concept.outline*2}px`);
    scene.className.baseVal=`op-${state.concept.operation} simplify-${state.concept.simplify}`;
    const operation={system:"un sistema di ripetizioni e intervalli",structure:"una struttura di piani e assi",intensity:"una tensione fra colori, direzioni e contorni",symbol:"una relazione fra visibile, memoria e segno"}[state.concept.operation];
    const gains=labKeys.filter(key=>state.concept[key]>=3).map(key=>labLabels[key]);const costs=labKeys.filter(key=>state.concept[key]<=1).map(key=>labLabels[key]);
    $("#conceptReading").innerHTML=`<h3>La tua costruzione privilegia ${operation}</h3><p>${gains.length?`Rende più evidenti ${gains.join(", ")}.`:"Mantiene le trasformazioni moderate e nessuna relazione domina ancora."} ${costs.length?`Riduce o sacrifica ${costs.join(", ")}.`:"Non riduce drasticamente nessuna dimensione."}</p><p><b>Non hai reso la scena più o meno reale:</b> hai deciso attraverso quali relazioni costruirne la verità.</p>`;
  }
  labKeys.forEach(key=>$("#lab"+key[0].toUpperCase()+key.slice(1)).addEventListener("input",event=>{state.concept[key]=Number(event.target.value);saveState();renderConcept();}));
  $$('input[name="operation"]').forEach(input=>input.addEventListener("change",event=>{state.concept.operation=event.target.value;saveState();renderConcept();}));
  $("#conceptReset").addEventListener("click",()=>{state.concept=clone(defaultState.concept);saveState();renderConcept();});renderConcept();

  // 06 · Seurat: livelli e regola/eccezione.
  const seuratData=[
    ["scale","Grande formato e preparazione","Oltre tre metri di larghezza e circa due anni di lavoro trasformano lo svago in costruzione monumentale. Disegni e studi precedono e accompagnano il dipinto."],
    ["rhythm","Ritmo","Profili, verticali, ombre e intervalli scandiscono il campo. L’ordine non cancella differenze di posa e densità."],
    ["space","Rive e classi","La Grande Jatte era un luogo di loisir socialmente misto; di fronte, Asnières era legata anche all’industria. L’identificazione precisa di ogni figura resta discussa."],
    ["color","Colore separato","Tocchi accostati e sovrapposti costruiscono vibrazione e contrasto. La fusione percettiva non è totale né garantita a ogni distanza."],
    ["edge","Bordo dipinto","Seurat aggiunse più tardi un bordo cromatico e poi la cornice bianca: perfino il confine dell’opera entra nel sistema."],
    ["leisure","Loisir moderno","Moda, passeggiata, animali e inattività diventano quasi cerimoniali. La stessa modernità mobile di Renoir qui viene rallentata e irrigidita."],
    ["ambiguity","Ambiguità","La scimmietta, la pesca, le posture e le relazioni fra figure hanno prodotto letture ironiche e sociali non sempre dimostrabili in modo univoco."],
    ["science","Teoria e pratica","Chevreul, Rood e Charles Henry appartengono al contesto. Seurat interpreta idee disponibili attraverso materiali, prove e scelte estetiche: non esegue una dimostrazione scientifica."],
    ["show","Mostra del 1886","La Grande Jatte debutta nell’ottava e ultima mostra impressionista. La compresenza dimostra che Impressionismo e Neoimpressionismo si sovrappongono."]
  ];
  const layerGuide={rhythm:"rhythm",space:"space",edge:"edge",leisure:"leisure"};
  function renderSeurat(){
    $("#seuratLayers").innerHTML=seuratData.map(item=>`<button type="button" aria-pressed="${state.seurat.includes(item[0])}">${item[1]}</button>`).join("");
    $$("#seuratLayers button").forEach((button,index)=>button.addEventListener("click",()=>{const id=seuratData[index][0];state.seurat=state.seurat.includes(id)?state.seurat.filter(v=>v!==id):[...state.seurat,id];saveState();renderSeurat();}));
    $$(`#seuratStage [data-layer]`).forEach(mark=>mark.classList.toggle("active",state.seurat.includes(mark.dataset.layer)));
    const selected=seuratData.filter(item=>state.seurat.includes(item[0]));
    $("#seuratReading").innerHTML=selected.length?selected.map(item=>`<h3>${item[1]}</h3><p>${item[2]}</p>`).join(""):"<h3>Scegli un livello</h3><p>Forma, preparazione, società e ricezione appartengono allo stesso problema.</p>";
    $("#seuratEquivalent").textContent=selected.length?`Livelli attivi: ${selected.map(item=>item[1]).join(", ")}. Le guide visive sono presenti soltanto per ritmo, rive, bordo e loisir.`:"Nessuna guida visiva attiva.";
  }
  $("#seuratReset").addEventListener("click",()=>{state.seurat=[];saveState();renderSeurat();});renderSeurat();
  const ruleData=[
    ["verticals","regola","Verticali di alberi, corpi e ombre scandiscono la scena."],["profiles","regola","Molte figure sono viste di profilo e sembrano disposte come segni."],
    ["intervals","regola","Intervalli e sovrapposizioni stabiliscono un ritmo leggibile."],["monkey","eccezione","La scimmietta introduce dettaglio eccentrico e ambiguità sociale."],
    ["child","eccezione","La bambina frontale interrompe la prevalenza dei profili e guarda verso il nostro spazio."],["sketch","eccezione","Nello studio le masse sono più mobili e i tocchi più larghi: il sistema finale nasce da trasformazioni, non da applicazione istantanea."]
  ];
  function renderRule(){
    $("#ruleException").innerHTML=ruleData.map(item=>`<button type="button" aria-pressed="${state.rule.includes(item[0])}"><small>${item[1]}</small><br>${item[2].split(".")[0]}</button>`).join("");
    $$("#ruleException button").forEach((button,index)=>button.addEventListener("click",()=>{const id=ruleData[index][0];state.rule=state.rule.includes(id)?state.rule.filter(v=>v!==id):[...state.rule,id];saveState();renderRule();}));
    const selected=ruleData.filter(item=>state.rule.includes(item[0])),rules=selected.filter(i=>i[1]==="regola"),exceptions=selected.filter(i=>i[1]==="eccezione");
    $("#ruleReading").innerHTML=`<h3>${rules.length} regole · ${exceptions.length} eccezioni</h3><p>${selected.length?selected.map(i=>i[2]).join(" "):"Cerca un ordine, poi cerca ciò che resiste all’ordine."}</p>`;
  }
  $("#ruleReset").addEventListener("click",()=>{state.rule=[];saveState();renderRule();});renderRule();

  // 07 · Cézanne: guide dei piani.
  const cezanneData=[
    ["edges","Due bordi","I segmenti del tavolo non convergono in un’unica linea coerente. L’interruzione permette alla tovaglia e agli oggetti di occupare lo spazio con maggior tensione."],
    ["bottle","Bottiglia","L’asse della bottiglia non coincide perfettamente con la verticale della cornice. Agisce però come perno scuro tra le due metà."],
    ["basket","Cesto","Il cesto sembra inclinarsi e spingere la frutta in avanti. La precarietà locale distribuisce peso e movimento."],
    ["plate","Piatto","L’ellisse espone una vista dall’alto più marcata di quella concessa ad altri oggetti: l’altezza dell’occhio sembra cambiare."],
    ["views","Osservazioni successive","Due traiettorie didattiche suggeriscono che piatto, bottiglia e cesto non dipendono da un unico punto. Non sono dati tecnici rilevati, ma ipotesi di lettura da verificare sull’opera."],
    ["color","Relazioni cromatiche","Blu, verdi, rossi e gialli si sovrappongono e costruiscono volume. La solidità delle mele non dipende soltanto dal chiaroscuro."],
    ["cloth","Tovaglia","Le pieghe sono massa e passaggio: separano piani, colmano vuoti e impediscono che la tavola si scomponga in frammenti isolati."],
    ["technical","Indagini tecniche","La sottotraccia stabilisce l’impianto generale; le indagini registrano aggiustamenti soprattutto nella frutta. Il processo è deliberato ma non coincide con un progetto geometrico chiuso."]
  ];
  function renderCezanne(){
    $("#cezanneGuides").innerHTML=cezanneData.map(item=>`<button type="button" aria-pressed="${state.cezanneGuides.includes(item[0])}">${item[1]}</button>`).join("");
    $$("#cezanneGuides button").forEach((button,index)=>button.addEventListener("click",()=>{const id=cezanneData[index][0];state.cezanneGuides=state.cezanneGuides.includes(id)?state.cezanneGuides.filter(v=>v!==id):[...state.cezanneGuides,id];saveState();renderCezanne();}));
    $$("#cezanneStage [data-guide]").forEach(guide=>guide.classList.toggle("active",state.cezanneGuides.includes(guide.dataset.guide)));
    const selected=cezanneData.filter(item=>state.cezanneGuides.includes(item[0]));$("#cezanneReading").innerHTML=selected.length?selected.map(item=>`<h3>${item[1]}</h3><p>${item[2]}</p>`).join(""):"<h3>Attiva una guida</h3><p>L’opera resta visibile; le linee sono strumenti didattici disattivabili, non segni presenti sul dipinto.</p>";
  }
  $("#cezanneReset").addEventListener("click",()=>{state.cezanneGuides=[];saveState();renderCezanne();});renderCezanne();

  // 08 · Van Gogh: relazioni cromatiche e spaziali su schema separato.
  const roomData=[
    ["contrast","Coppie cromatiche","Lo schema accentua giallo/viola e rosso/verde. Nell’opera le relazioni sono materiali e storiche: alcuni rossi sono sbiaditi, modificando viola e rosa."],
    ["tilt","Direzioni inclinate","Pareti, letto e sedie non convergono in uno spazio prospetticamente uniforme. Le direzioni conducono lo sguardo dentro una stanza insieme familiare e instabile."],
    ["outline","Contorni","I contorni separano oggetti e superfici; non sono scariche automatiche di emozione, ma una scelta costruttiva."],
    ["flat","Ombre ridotte","La riduzione delle ombre semplifica la descrizione luministica e aumenta il peso delle campiture colorate."],
    ["letter","Lettera 705","Van Gogh scrive che il colore deve fare il lavoro e, semplificando le cose, suggerire riposo. È una dichiarazione documentata, non la chiave unica del quadro."],
    ["repeat","Tre versioni","La prima versione è del 1888; nel 1889 Van Gogh ne dipinge due ripetizioni. Ripetere significa rielaborare, adattare dimensioni e conservare un’immagine importante."]
  ];
  function renderRoom(){
    $("#roomControls").innerHTML=roomData.map(item=>`<button type="button" aria-pressed="${state.room.includes(item[0])}">${item[1]}</button>`).join("");
    $$("#roomControls button").forEach((button,index)=>button.addEventListener("click",()=>{const id=roomData[index][0];state.room=state.room.includes(id)?state.room.filter(v=>v!==id):[...state.room,id];saveState();renderRoom();}));
    $("#roomSchema").className="room-schema "+state.room.filter(id=>["contrast","tilt","outline","flat"].includes(id)).join(" ");
    const selected=roomData.filter(item=>state.room.includes(item[0]));$("#roomReading").innerHTML=selected.length?selected.map(item=>`<h3>${item[1]}</h3><p>${item[2]}</p>`).join(""):"<h3>Modifica lo schema</h3><p>L’originale resta inalterato. Distingui dato visibile, dichiarazione nelle lettere e interpretazione.</p>";
  }
  $("#roomReset").addEventListener("click",()=>{state.room=[];saveState();renderRoom();});renderRoom();

  // 09 · Gauguin: livelli non esclusivi.
  const gauguinElements=[
    ["women","Donne bretoni","Corpi osservati e costumi locali, ma anche figure selezionate e organizzate come comunità in preghiera."],
    ["tree","Tronco diagonale","Elemento naturale trasformato in dispositivo che divide e collega primo piano e visione."],
    ["vision","Giacobbe e l’angelo","Racconto biblico ricordato dopo il sermone e immaginato dentro lo spazio del quadro."],
    ["field","Campo rosso","Campitura non naturalistica che rende possibile l’unità fra realtà osservata e scena mentale."],
    ["priest","Sacerdote","Presenza parziale al margine: indizio del sermone, mediatore della storia ascoltata e figura quasi esclusa."],
    ["profiles","Cuffie e profili","Dati del costume bretone trasformati in ritmo di forme chiare e contorni scuri."]
  ];
  const gauguinCats=["visibile","ricordato","immaginato","simbolizzato"];
  function renderGauguin(){
    $("#gauguinElements").innerHTML=gauguinElements.map(item=>`<button type="button" aria-pressed="${state.gauguin.element===item[0]}">${item[1]}</button>`).join("");
    $$("#gauguinElements button").forEach((button,index)=>button.addEventListener("click",()=>{state.gauguin.element=gauguinElements[index][0];saveState();renderGauguin();}));
    const active=asArray(state.gauguin.map[state.gauguin.element]);
    $("#gauguinCategories").innerHTML=gauguinCats.map(cat=>`<button type="button" aria-pressed="${active.includes(cat)}">${cat}</button>`).join("");
    $$("#gauguinCategories button").forEach((button,index)=>button.addEventListener("click",()=>{const cat=gauguinCats[index],list=asArray(state.gauguin.map[state.gauguin.element]);state.gauguin.map[state.gauguin.element]=list.includes(cat)?list.filter(v=>v!==cat):[...list,cat];saveState();renderGauguin();}));
    const item=gauguinElements.find(entry=>entry[0]===state.gauguin.element),chosen=asArray(state.gauguin.map[state.gauguin.element]);
    $("#gauguinReading").innerHTML=`<h3>${item[1]}</h3><p>${item[2]}</p><p>${chosen.length?`Lo hai collegato a: <b>${chosen.join(", ")}</b>. Più livelli possono convivere; la motivazione conta più dell’etichetta.`:"Attribuisci uno o più livelli e verifica se la distinzione resta netta."}</p>`;
    $$("#gauguinStage [data-layer]").forEach(mark=>mark.classList.toggle("active",mark.dataset.layer===state.gauguin.element));
  }
  $("#gauguinReset").addEventListener("click",()=>{state.gauguin=clone(defaultState.gauguin);saveState();renderGauguin();});renderGauguin();

  // 10 · Quadro coloniale dello sguardo.
  const colonialData=[
    ["names","Chi nomina?","Il titolo francese formula domande universali; Gauguin aggiunge titoli tahitiani ad altre opere, ma controlla la mediazione linguistica destinata al pubblico europeo."],
    ["represents","Chi rappresenta?","Un artista francese sceglie pose, fonti e nessi simbolici. La sua critica dell’Europa non annulla il privilegio coloniale che rende possibile il viaggio."],
    ["represented","Chi viene rappresentato?","Persone reali diventano figure di età e funzioni simboliche. L’immagine non conserva automaticamente nomi, biografie o consenso."],
    ["speaks","Chi parla nelle fonti?","Gauguin ha lasciato lettere, testi e titoli; la voce equivalente delle modelle è raramente conservata. Il silenzio d’archivio non è neutralità."],
    ["public","Per quale pubblico?","L’opera viene inviata, esposta e venduta nel sistema europeo. Anche la promessa di autenticità è una strategia di distinzione sul mercato."],
    ["local","Che cosa sembra locale?","Corpi, vegetazione, abiti e alcuni oggetti rinviano alla Polinesia, ma sono selezionati e riorganizzati."],
    ["invented","Che cosa è combinato o inventato?","L’idolo e vari motivi mescolano fonti polinesiane, giavanesi, cristiane e invenzioni personali. Non sono un documento etnografico trasparente."],
    ["hidden","Che cosa diventa invisibile?","Amministrazione coloniale, missioni, commercio, malattie, lavoro e modernità dell’isola restano fuori dal paradiso pittorico."],
    ["power","Quali rapporti di potere?","Relazioni personali con ragazze adolescenti avvengono in una forte asimmetria di età, genere, risorse e dominio coloniale. Contestualizzare significa renderla leggibile, non assolverla."]
  ];
  function renderColonial(){
    $("#colonialQuestions").innerHTML=colonialData.map(item=>`<button type="button" aria-pressed="${state.colonial.includes(item[0])}">${item[1]}</button>`).join("");
    $$("#colonialQuestions button").forEach((button,index)=>button.addEventListener("click",()=>{const id=colonialData[index][0];state.colonial=state.colonial.includes(id)?state.colonial.filter(v=>v!==id):[...state.colonial,id];saveState();renderColonial();}));
    const selected=colonialData.filter(item=>state.colonial.includes(item[0]));$("#colonialReading").innerHTML=selected.length?selected.map(item=>`<h3>${item[1]}</h3><p>${item[2]}</p>`).join(""):"<h3>Apri il dispositivo</h3><p>Forma e colonialismo non sono due capitoli separati: la costruzione dell’altrove avviene dentro la superficie e dentro la storia.</p>";
  }
  $("#colonialReset").addEventListener("click",()=>{state.colonial=[];saveState();renderColonial();});renderColonial();

  // 11 · Comparatore delle quattro risposte.
  const answerWorks=[
    {id:"seurat",name:"Seurat",subtitle:"Sistema",image:"assets/images/grande-jatte.webp",fields:{observation:"Osserva il loisir e lo ricostruisce attraverso studi e scansioni.",time:"Lunga preparazione; l’istante si irrigidisce in durata.",viewpoint:"Veduta laterale coerente, organizzata da profili e intervalli.",space:"Piani paralleli e ritmi distribuiscono figure e vuoti.",color:"Tocchi separati, contrasti e bordo dipinto.",stroke:"Piccoli tocchi variano; il punto non è una particella uniforme.",structure:"Ordine ritmico che lascia emergere eccezioni.",modernity:"Tempo libero, moda e ambiguità della società urbana.",memory:"Studi e rielaborazione trattengono osservazioni successive.",symbol:"L’artificio monumentale supera il resoconto di una domenica.",market:"Mostre indipendenti e critica nominano il Neoimpressionismo.",power:"La distanza ordina le figure e può trasformarle in tipi.",spectator:"Da lontano emerge il ritmo; da vicino il lavoro della superficie."}},
    {id:"cezanne",name:"Cézanne",subtitle:"Struttura",image:"assets/images/basket.webp",fields:{observation:"Ritorna sugli oggetti e conserva aggiustamenti non uniformi.",time:"Più osservazioni convivono nella stessa durata pittorica.",viewpoint:"Altezze e assi non perfettamente compatibili.",space:"Coerenza globale ottenuta attraverso incongruenze locali.",color:"Relazioni di tocchi costruiscono peso e volume.",stroke:"Segni sovrapposti e non completamente fusi.",structure:"Tavolo, tovaglia e frutta si tengono in tensione.",modernity:"Una natura morta interroga l’autonomia dell’immagine.",memory:"Il quadro conserva il lavoro del vedere, non un’istantanea.",symbol:"Il significato nasce dalla costruzione, non da un racconto allegorico.",market:"La personale Vollard del 1895 trasforma la ricezione.",power:"Il genere umile della natura morta diventa campo di autorità pittorica.",spectator:"Deve cambiare posizione mentale per tenere insieme i piani."}},
    {id:"vangogh",name:"Van Gogh",subtitle:"Intensità",image:"assets/images/bedroom.webp",fields:{observation:"Parte dalla stanza reale e ne seleziona relazioni.",time:"Ripetizione e lettere mostrano lavoro, distanza e memoria.",viewpoint:"Prospettiva inclinata che attrae e destabilizza.",space:"Oggetti semplificati costruiscono un interno desiderato.",color:"Complementari e campiture rendono visibile un rapporto vissuto.",stroke:"Contorno e tocco sono decisioni, non sintomi.",structure:"Letto, sedie e pareti si incastrano senza neutralità ottica.",modernity:"Casa precaria e progetto di comunità artistica.",memory:"Le versioni del 1889 riprendono la prima camera del 1888.",symbol:"La stanza può sostenere il desiderio di riposo senza diventare allegoria fissa.",market:"Lettere, scambi e collezionisti partecipano alla ricezione.",power:"Il mito della follia può cancellare cultura e competenza.",spectator:"Entra in una stanza che sembra vicina e impossibile."}},
    {id:"gauguin",name:"Gauguin",subtitle:"Simbolo",image:"assets/images/vision-sermon.webp",fields:{observation:"Costumi e figure osservate vengono uniti a una visione.",time:"Il dopo-sermone concentra ascolto, ricordo e immaginazione.",viewpoint:"Primo piano ravvicinato e visione lontana condividono la superficie.",space:"Tronco e campo rosso separano e collegano piani incompatibili.",color:"Campiture non naturalistiche organizzano la relazione fra le parti.",stroke:"Contorni marcati isolano e ritmano le forme.",structure:"Sintesi di superficie, racconto e memoria.",modernity:"La ricerca di un altrove è prodotta dalla stessa modernità che critica.",memory:"Il racconto ascoltato si combina con esperienza e fonti visive.",symbol:"Il visibile non basta: l’immagine accoglie idee e fede costruita.",market:"Autorappresentazione, titoli e mostre preparano il pubblico.",power:"In Polinesia lo sguardo europeo opera dentro il colonialismo.",spectator:"Deve attraversare piani che non si lasciano separare del tutto."}}
  ];
  const answerCategories=[
    ["observation","Osservazione"],["time","Tempo"],["viewpoint","Punto di vista"],["space","Spazio"],["color","Colore"],["stroke","Pennellata"],["structure","Struttura"],["modernity","Modernità"],["memory","Memoria"],["symbol","Simbolo"],["market","Mercato"],["power","Potere"],["spectator","Spettatore"]
  ];
  const syntheses={
    observation:["Tutti partono da esperienze visive e materiali.","Non attribuiscono lo stesso ruolo alla registrazione.","Ridurre il confronto a realtà contro fantasia.","Quanta trasformazione serve perché l’osservazione diventi conoscenza?"],
    time:["Nessuna immagine è davvero istantanea.","Seurat prepara, Cézanne accumula, Van Gogh ripete, Gauguin intreccia tempi mentali.","Scambiare rapidità apparente e rapidità reale.","Il tempo è nel soggetto, nello sguardo o nel lavoro?"],
    viewpoint:["Ogni quadro assegna una posizione allo spettatore.","Cézanne moltiplica incompatibilità; gli altri organizzano diversamente una posizione dominante.","Chiamare errore ciò che devia dalla prospettiva unica.","Quanti punti di vista può sostenere un’immagine?"],
    space:["Lo spazio è costruito, mai recipiente neutro.","Ritmo, piani, inclinazioni e campiture producono coerenze diverse.","Misurare ogni opera con la correttezza prospettica.","Quale spazio rende leggibile una verità non ottica?"],
    color:["Il colore nasce da relazioni.","Metodo separato, modellazione, intensità e campo simbolico non coincidono.","Attribuire significati emotivi universali ai colori.","Che cosa fa il colore oltre a nominare le cose?"],
    stroke:["La superficie rende visibile il lavoro.","Tocco separato, sovrapposizione, contorno e campitura hanno funzioni diverse.","Diagnosticare l’autore dal segno.","Quando un segno costruisce e quando diventa maniera?"],
    structure:["Ogni opera stabilisce relazioni interne.","Il sistema di Seurat non è la tensione di Cézanne né la stanza di Van Gogh o la sintesi di Gauguin.","Cercare una formula unica postimpressionista.","Quale ordine può includere l’eccezione?"],
    modernity:["Tutti lavorano dentro reti moderne.","Loisir, autonomia del quadro, casa precaria e altrove coloniale ne mostrano facce diverse.","Immaginare Gauguin fuori dalla modernità.","Quale modernità ogni immagine mostra e quale nasconde?"],
    memory:["Il presente viene rielaborato.","Studi, osservazioni, ripetizioni e racconto producono memorie differenti.","Opporre memoria e osservazione come alternative pure.","Che cosa conserva un’immagine trasformando?"],
    symbol:["Ogni costruzione eccede la descrizione.","Il simbolo esplicito di Gauguin non è l’unico modo di produrre significato.","Ridurre tutti a precursori dell’astrazione.","Quando la forma diventa portatrice di un’idea?"],
    market:["La visibilità dipende da mediazioni.","Mostre e mercanti intervengono in tempi e modi differenti.","Confondere valore storico e successo commerciale immediato.","Chi rende possibile il canone?"],
    power:["Ogni sguardo seleziona e distribuisce ruoli.","Classe, mito biografico e colonialismo non hanno lo stesso peso nelle quattro opere.","Usare il contesto come nota esterna alla forma.","Chi può costruire l’immagine di chi?"],
    spectator:["Le opere chiedono partecipazione percettiva.","Distanza, instabilità, immersione e scarto mentale producono spettatori diversi.","Pensare lo spettatore come occhio senza corpo e storia.","Che cosa deve fare chi guarda per completare l’immagine?"]
  };
  function renderAnswers(){
    $("#answerCategories").innerHTML=answerCategories.map(item=>`<button type="button" role="tab" aria-selected="${state.answerCategory===item[0]}">${item[1]}</button>`).join("");
    $$("#answerCategories button").forEach((button,index)=>button.addEventListener("click",()=>{state.answerCategory=answerCategories[index][0];saveState();renderAnswers();}));
    $("#answerWorks").innerHTML=answerWorks.map(item=>`<article class="work-card"><img src="${item.image}" alt="" loading="lazy"><div><p class="eyebrow">${item.subtitle}</p><h3>${item.name}</h3><p>${item.fields[state.answerCategory]}</p></div></article>`).join("");
    const s=syntheses[state.answerCategory];$("#answerSynthesis").innerHTML=`<p><b>Somiglianza:</b> ${s[0]}</p><p><b>Differenza:</b> ${s[1]}</p><p><b>Rischio:</b> ${s[2]}</p><p><b>Domanda aperta:</b> ${s[3]}</p>`;
  }
  $("#answersReset").addEventListener("click",()=>{state.answerCategory="observation";saveState();renderAnswers();});renderAnswers();
  const exchangeData=[
    ["pissarro","Pissarro ↔ Cézanne","Pissarro e Cézanne lavorano insieme negli anni Settanta: metodo, osservazione e rapporto con il paesaggio si costruiscono nel confronto."],
    ["neo","Impressionisti ↔ Neoimpressionisti","Seurat, Signac e i Pissarro espongono nel 1886 dentro l’ultima mostra impressionista: continuità e conflitto condividono lo stesso spazio."],
    ["vincent","Van Gogh ↔ colore parigino","A Parigi Van Gogh incontra Impressionismo, Seurat e Signac; assorbe e trasforma tocchi separati e contrasti."],
    ["arles","Van Gogh ↔ Gauguin","Nove settimane ad Arles nel 1888 producono dialogo, competizione e rottura. Nessuna identità stilistica comune."],
    ["bernard","Gauguin ↔ Bernard","A Pont-Aven idee su sintesi e contorno emergono in uno scambio di opere, lettere e rivendicazioni di priorità."],
    ["prints","Stampe giapponesi","Composizioni, contorni e tagli vengono studiati e riusati in modi differenti; “influenza” non significa copia passiva."],
    ["system","Sistema dell’arte","Critici come Fénéon e Fry, mercanti come Vollard, collezioniste come Anna Boch e riproduzioni costruiscono visibilità e canone."]
  ];
  function renderExchange(){
    $("#exchangeNodes").innerHTML=exchangeData.map(item=>`<button type="button" aria-pressed="${state.exchange===item[0]}">${item[1]}</button>`).join("");
    $$("#exchangeNodes button").forEach((button,index)=>button.addEventListener("click",()=>{state.exchange=exchangeData[index][0];saveState();renderExchange();}));const item=exchangeData.find(entry=>entry[0]===state.exchange);$("#exchangeReading").innerHTML=item?`<h3>${item[1]}</h3><p>${item[2]}</p>`:"<h3>Scegli uno scambio</h3><p>La rete sostituisce il racconto di quattro traiettorie autosufficienti.</p>";
  } renderExchange();

  // 12 · Atlante tra moduli.
  const atlasWorks=[
    {name:"Courbet",sub:"Funerale a Ornans · 1849–50",image:"assets/images/courbet-funerale.webp",fields:{question:"Chi merita la scala della grande pittura?",subject:"Una comunità contemporanea e un rito provinciale.",observer:"Davanti a una scena larga che non offre un eroe unico.",time:"Presente sociale reso monumentale.",view:"Frontalità e densità collettiva.",construction:"Scala, taglio e distribuzione costruiscono una posizione.",color:"Terre e neri organizzano corpi e rito.",body:"Individui non idealizzati ma ancora selezionati.",labor:"Il lavoro sociale entra per soggetti, classi e istituzioni.",class:"Differenze leggibili nella comunità.",imagination:"Limitata dal patto realistico, non assente.",system:"Sistema espositivo e gerarchie dei generi.",market:"Salon, scandalo e reputazione.",colonialism:"Non tema esplicito di questa opera.",truth:"Verità sociale costruita.",absence:"Vite individuali oltre il rito."}},
    {name:"Monet",sub:"Covoni · 1890–91",image:"assets/images/monet-stacks.webp",fields:{question:"Come cambia lo stesso soggetto nella luce?",subject:"Covoni e campo osservati in serie.",observer:"Situato davanti a condizioni atmosferiche variabili.",time:"Istanti confrontati e rielaborati.",view:"Posizione relativamente stabile, condizioni mobili.",construction:"Serie, selezione e lavoro in studio.",color:"Luce resa da relazioni caldo/freddo.",body:"Assente; resta il prodotto del lavoro.",labor:"Il covone è lavoro accumulato, raramente tematizzato come fatica.",class:"Quasi invisibile dietro il paesaggio.",imagination:"Memoria e rielaborazione sostengono l’osservazione.",system:"La serie organizza differenze.",market:"Serie e mostre costruiscono valore e riconoscibilità.",colonialism:"Non tema esplicito di questa opera.",truth:"Verità percettiva variabile.",absence:"Chi ha prodotto e raccolto il grano."}},
    ...answerWorks.map(work=>({name:work.name,sub:work.subtitle,image:work.image,fields:{question:{seurat:"Come trasformare l’istante in sistema?",cezanne:"Che cosa tiene insieme il visibile?",vangogh:"Come rendere visibile una relazione vissuta?",gauguin:"Come unire visto, ricordato e immaginato?"}[work.id],subject:work.fields.observation,observer:work.fields.spectator,time:work.fields.time,view:work.fields.viewpoint,construction:work.fields.structure,color:work.fields.color,body:work.id==="seurat"?"Figure sociali rese ritmo.":work.id==="cezanne"?"Assente: gli oggetti acquistano peso quasi corporeo.":work.id==="vangogh"?"Assente: la stanza conserva tracce di chi la abita.":"Corpi osservati e trasformati in figure simboliche.",labor:work.id==="seurat"?"Loisir in primo piano, lavoro preparatorio invisibile.":work.id==="cezanne"?"Lavoro lento del vedere e del dipingere.":work.id==="vangogh"?"Studio, lettere e ripetizione contro il mito dell’impulso.":"Lavoro artistico e coloniale costruiscono l’altrove.",class:work.id==="seurat"?"Differenze di loisir e moda, non univoche.":work.id==="gauguin"?"Privilegio europeo e soggetti colonizzati.":"Condizione biografica e mercato intervengono senza esaurire la forma.",imagination:work.fields.memory,system:work.id==="seurat"?"Metodo neoimpressionista.":work.id==="cezanne"?"Relazioni senza prospettiva unica.":work.id==="vangogh"?"Sistema personale di coppie e direzioni.":"Sintesi di fonti e piani.",market:work.fields.market,colonialism:work.id==="gauguin"?"Condizione strutturale dell’altrove polinesiano.":"Non tema esplicito dell’opera; resta parte del sistema storico europeo.",truth:work.id==="seurat"?"Verità metodica e sociale.":work.id==="cezanne"?"Verità strutturale.":work.id==="vangogh"?"Verità relazionale e vissuta.":"Verità simbolica attraversata dal potere.",absence:work.id==="seurat"?"Biografie dietro i tipi.":work.id==="cezanne"?"Contesto domestico e lavoro fuori dal quadro.":work.id==="vangogh"?"Comunità desiderata ma non presente.":"Voci autonome delle persone rappresentate."}}))
  ];
  const atlasCategories=[["question","Domanda alla realtà"],["subject","Soggetto"],["observer","Osservatore"],["time","Istante / durata"],["view","Punto di vista"],["construction","Costruzione"],["color","Colore"],["body","Corpo"],["labor","Lavoro"],["class","Classe / potere"],["imagination","Memoria / immaginazione"],["system","Sistema"],["market","Mercato"],["colonialism","Colonialismo"],["truth","Verità"],["absence","Assenza"]];
  function renderAtlas(){
    $("#atlasCategories").innerHTML=atlasCategories.map(item=>`<button type="button" role="tab" aria-selected="${state.atlasCategory===item[0]}">${item[1]}</button>`).join("");$$("#atlasCategories button").forEach((button,index)=>button.addEventListener("click",()=>{state.atlasCategory=atlasCategories[index][0];saveState();renderAtlas();}));
    $("#atlasWorks").innerHTML=atlasWorks.map(item=>`<article class="work-card"><img src="${item.image}" alt="" loading="lazy"><div><h3>${item.name}</h3><p><i>${item.sub}</i></p><p>${item.fields[state.atlasCategory]}</p></div></article>`).join("");
    $("#atlasReading").innerHTML=`<p><b>Categoria: ${atlasCategories.find(item=>item[0]===state.atlasCategory)[1]}.</b> Le sei risposte non formano una graduatoria. Ogni guadagno di visibilità produce un costo: selezione, assenza o nuovo rapporto di potere.</p>`;
  }
  $("#atlasReset").addEventListener("click",()=>{state.atlasCategory="truth";saveState();renderAtlas();});renderAtlas();

  // 13 · Secondo sguardo e sintesi basata sulle azioni reali.
  const operations=[["system","Sistematizzare"],["structure","Costruire"],["intensity","Intensificare"],["symbol","Simbolizzare"]];
  function updateOpeningMemory(){$("#openingMemory").textContent=state.notes.opening.trim()||"Non hai ancora scritto la prima osservazione.";}
  function renderFinalOps(){$("#finalOperations").innerHTML=operations.map(item=>`<button type="button" aria-pressed="${state.finalOps.includes(item[0])}">${item[1]}</button>`).join("");$$("#finalOperations button").forEach((button,index)=>button.addEventListener("click",()=>{const id=operations[index][0];state.finalOps=state.finalOps.includes(id)?state.finalOps.filter(v=>v!==id):[...state.finalOps,id];saveState();renderFinalOps();}));}renderFinalOps();updateOpeningMemory();
  function updateSummary(){
    const target=$("#personalSummary");if(!target)return;const parts=[];
    if(state.openingMarks.length)parts.push(`All’inizio hai isolato ${state.openingMarks.length} incongruenze: ${openingItems.filter(i=>state.openingMarks.includes(i.id)).map(i=>i.label.toLowerCase()).join(", ")}.`);
    if(state.concept.operation)parts.push(`Nel laboratorio hai privilegiato ${operations.find(i=>i[0]===state.concept.operation)?.[1].toLowerCase()}.`);
    if(state.seurat.length)parts.push(`Hai aperto ${state.seurat.length} livelli della Grande Jatte.`);if(state.cezanneGuides.length)parts.push(`Hai verificato ${state.cezanneGuides.length} guide nella natura morta.`);if(state.room.length)parts.push(`Nella Camera hai distinto ${state.room.length} relazioni fra dato, lettera e ipotesi.`);
    const gauguinCount=Object.values(state.gauguin.map).reduce((sum,list)=>sum+asArray(list).length,0);if(gauguinCount)parts.push(`Hai assegnato ${gauguinCount} relazioni non esclusive fra visibile, memoria, immaginazione e simbolo.`);if(state.colonial.length)parts.push(`Hai interrogato ${state.colonial.length} dimensioni del quadro coloniale dello sguardo.`);
    if(state.finalOps.length)parts.push(`Nel secondo sguardo ti aiutano soprattutto: ${operations.filter(i=>state.finalOps.includes(i[0])).map(i=>i[1].toLowerCase()).join(", ")}.`);if(state.notes.returning.trim())parts.push(`La tua seconda lettura dice: “${escapeHTML(state.notes.returning.trim().slice(0,420))}${state.notes.returning.trim().length>420?"…":""}”`);
    target.innerHTML=parts.length?`<h2>La tua sintesi, senza dati inventati</h2><p>${parts.join(" ")}</p><p><b>Il percorso che hai costruito mostra che oltre l’impressione non c’è una sola risposta:</b> la realtà può essere sistematizzata, strutturata, intensificata o simbolizzata, e ogni scelta rende visibile qualcosa mentre sacrifica altro.</p>`:`<h2>La tua sintesi prenderà forma qui</h2><p>Completa attività e note: la sintesi userà soltanto le scelte realmente registrate.</p>`;
  }
  $("#returnReset").addEventListener("click",()=>{state.notes.returning="";state.finalOps=[];$("#returnNote").value="";saveState();renderFinalOps();});updateSummary();

  // Verifica: sedici concetti obbligatori, recupero differente per ogni errore.
  const quizPool=[
    {id:"continuity",q:"Quale rapporto descrive meglio Impressionismo e ricerche postimpressioniste?",o:["Rottura totale: ricominciano senza eredità","Sovrapposizione: ereditano e trasformano problemi ancora aperti","Successione lineare: un movimento termina e l’altro inizia nello stesso giorno"],c:1,e:"Le ricerche si sovrappongono e modificano domande su percezione, luce e costruzione.",section:"#passaggio",lesson:"Il modulo 15 non cancella il 14: parte dall’instabilità percettiva e chiede come darle durata, metodo o significato.",retry:{q:"“Oltre l’impressione” significa soprattutto…",o:["abbandonare la realtà","trasformare problemi impressionisti senza una risposta unica","tornare all’Accademia"],c:1}},
    {id:"retro",q:"Perché “Postimpressionismo” è un’etichetta retrospettiva?",o:["Fu inventata dagli artisti in un manifesto del 1886","Roger Fry la diffuse nel 1910 per raggruppare ricerche precedenti","Indica soltanto opere dipinte dopo la morte di Monet"],c:1,e:"La categoria arriva dopo molte opere che oggi raccoglie.",section:"#termine",lesson:"Nel 1910 Roger Fry organizzò a Londra Manet and the Post-Impressionists. Il nome è utile, ma costruisce a posteriori un insieme.",retry:{q:"Che cosa viene prima storicamente?",o:["Le opere diverse, poi l’etichetta","L’etichetta, poi il manifesto","Il manifesto, poi il gruppo"],c:0}},
    {id:"unity",q:"Che cosa NON unifica tutti i postimpressionisti?",o:["Una crisi condivisa sulla sufficienza della percezione immediata","Un unico manifesto, una tecnica comune e una sola politica","La presenza in reti espositive e di mercato"],c:1,e:"Non esistono gruppo formalizzato, manifesto o tecnica comuni.",section:"#termine",lesson:"“Postimpressionismo” raccoglie sistemi, strutture, intensità e simboli differenti; non descrive un’identità collettiva posseduta dagli artisti.",retry:{q:"Qual è l’uso corretto dell’etichetta?",o:["Una mappa critica che conserva le differenze","Il nome di una società artistica","Un sinonimo di Pointillisme"],c:0}},
    {id:"1886",q:"Che cosa rende importante l’ottava mostra impressionista del 1886?",o:["Seurat vi presentò la Grande Jatte accanto a ricerche impressioniste","Fu la prima personale di Cézanne","Roger Fry vi coniò Postimpressionismo"],c:0,e:"La compresenza mostra sovrapposizione cronologica e conflitto interno.",section:"#mondo",lesson:"Nel 1886 Seurat, Signac e i Pissarro esposero nell’ultima mostra impressionista; Fénéon usò il termine Neoimpressionismo.",retry:{q:"La mostra del 1886 dimostra che…",o:["i gruppi storici hanno confini perfettamente chiusi","ricerche impressioniste e neoimpressioniste convivono","il Postimpressionismo ha già un manifesto"],c:1}},
    {id:"seurat",q:"Che cosa separa una scena di svago dal dipinto finale di Seurat?",o:["Una sola seduta spontanea","Studi, disegni, lunga preparazione e revisioni","L’applicazione automatica di una formula ottica"],c:1,e:"La Grande Jatte è una costruzione lenta e plurale.",section:"#seurat",lesson:"Seurat preparò il dipinto con numerosi studi; grande formato, ritmo, profili e superficie rendono la domenica quasi cerimoniale.",retry:{q:"Lo studio preparatorio serve a capire…",o:["che il quadro finale nasce da trasformazioni","che Seurat copiò una fotografia","che ogni figura fu dipinta in un solo giorno"],c:0}},
    {id:"science",q:"Qual è il rapporto più prudente fra Seurat e le teorie del colore?",o:["Il quadro dimostra leggi scientifiche senza eccezioni","Le teorie disponibili vengono interpretate attraverso pratica e scelte estetiche","I colori non hanno alcun rapporto con teorie ottiche contemporanee"],c:1,e:"Teoria, ricezione, materia e percezione reale non coincidono.",section:"#seurat",lesson:"Chevreul, Rood e Charles Henry appartengono al contesto. Tocchi separati possono aumentare vibrazione e contrasto, ma non si fondono sempre e completamente nell’occhio.",retry:{q:"La “mescolanza ottica” va intesa come…",o:["effetto percettivo variabile, non automatismo universale","fusione certa a ogni distanza","sinonimo di mescolanza sulla tavolozza"],c:0}},
    {id:"planes",q:"Che cosa mostra il laboratorio dei piani di Cézanne?",o:["Un’unica prospettiva perfettamente coerente","Piani e altezze osservati da posizioni non del tutto compatibili","Assenza di qualsiasi organizzazione"],c:1,e:"La coerenza globale non dipende da un solo punto di vista.",section:"#cezanne",lesson:"Bordi, bottiglia, cesto e piatto non condividono un sistema prospettico uniforme; colore, peso e tovaglia mantengono l’insieme.",retry:{q:"Quale elemento contribuisce a ricucire lo spazio?",o:["La tovaglia come volume e passaggio","Una griglia rinascimentale invisibile","La simmetria perfetta"],c:0}},
    {id:"error",q:"Un’incongruenza prospettica nel Cesto di mele è necessariamente…",o:["prova d’incapacità","una possibile decisione compositiva e conoscitiva","un effetto casuale del museo"],c:1,e:"L’errore apparente può sostenere una coerenza costruita.",section:"#cezanne",lesson:"Le indagini tecniche mostrano impianto e aggiustamenti; la tensione locale fra assi e piani può rendere visibile la durata dell’osservazione.",retry:{q:"Che cosa conta nel giudicare l’incongruenza?",o:["Se contribuisce alle relazioni dell’insieme","Se obbedisce sempre alla prospettiva centrale","Se anticipa inevitabilmente il Cubismo"],c:0}},
    {id:"vangogh",q:"Come funziona il colore nella Camera di Van Gogh?",o:["Descrive soltanto il colore locale degli oggetti","Costruisce relazioni fra superfici, contorni e desiderio documentato di riposo","Possiede significati emotivi universali e immutabili"],c:1,e:"Il colore è relazionale, materiale e consapevolmente organizzato.",section:"#vangogh",lesson:"Van Gogh scrive che il colore deve fare il lavoro. Complementari, semplificazione e ombre ridotte costruiscono la stanza; i pigmenti attuali sono in parte mutati.",retry:{q:"Perché occorre ricordare lo scolorimento?",o:["Perché l’aspetto attuale non coincide perfettamente con quello originario","Perché il dipinto è una copia moderna","Perché annulla il valore delle lettere"],c:0}},
    {id:"myth",q:"Perché è scorretto spiegare le pennellate di Van Gogh come sintomi?",o:["Perché non ebbe mai problemi di salute","Perché cancella studio, cultura visiva, tecnica e decisioni documentate","Perché le biografie non hanno alcun ruolo nella storia dell’arte"],c:1,e:"Un’opera non è una cartella clinica.",section:"#vangogh",lesson:"La salute fa parte della biografia, ma non autorizza diagnosi retrospettive della superficie pittorica. Lettere, versioni e tecniche mostrano lavoro cosciente.",retry:{q:"Quale fonte corregge il mito dell’impulso puro?",o:["Le lettere e le ripetizioni dell’opera","La leggenda dell’orecchio","Il prezzo attuale"],c:0}},
    {id:"gauguin",q:"Che cosa unisce Vision after the Sermon?",o:["Solo una scena osservata dal vero","Donne osservate, racconto ricordato, immaginazione e costruzione simbolica","Una dimostrazione di prospettiva scientifica"],c:1,e:"L’opera sovrappone livelli che non si separano perfettamente.",section:"#gauguin",lesson:"Donne bretoni, tronco, campo rosso e lotta biblica fanno convivere dopo-sermone, memoria e visione in uno spazio non naturalistico.",retry:{q:"Il campo rosso serve soprattutto a…",o:["costruire uno spazio non naturalistico fra le parti","indicare un’emozione universale","imitare esattamente un prato bretone"],c:0}},
    {id:"colonial",q:"Perché Tahiti non può essere descritta come paradiso fuori dal tempo?",o:["Era una colonia francese attraversata da missioni, commercio e trasformazioni sociali","Non esisteva ancora sulle carte europee","Gauguin non vi arrivò mai"],c:0,e:"L’altrove appartiene alla storia coloniale moderna.",section:"#altrove",lesson:"Tahiti divenne colonia francese nel 1880. Gauguin arrivò nel 1891 e cercò o inventò pratiche che riteneva perdute, per un pubblico anche europeo.",retry:{q:"Che cosa rende possibile il viaggio di Gauguin?",o:["Anche reti imperiali e diseguaglianze di mobilità","Un isolamento assoluto dell’isola","Il rifiuto del mercato"],c:0}},
    {id:"network",q:"Che cosa nasconde il racconto dei quattro geni solitari?",o:["Soltanto le loro date di nascita","Artiste, collaborazioni, critici, mercanti, collezionisti e istituzioni","L’esistenza della pittura a olio"],c:1,e:"Il canone seleziona e può rendere invisibili le mediazioni.",section:"#risposte",lesson:"Pissarro, Signac, Bernard, Anna Boch, Fénéon, Vollard e molte altre presenze collegano produzione, circolazione e ricezione.",retry:{q:"Perché Anna Boch complica il canone?",o:["Fu artista, espositrice e collezionista nelle reti del tempo","Inventò il termine Postimpressionismo","Dipinse la Grande Jatte"],c:0}},
    {id:"future",q:"In che senso queste opere influenzano le avanguardie?",o:["Le contengono già come esito inevitabile","Artisti successivi ne selezionano e riusano possibilità","Non esiste alcuna relazione storica"],c:1,e:"L’influenza è ricezione e scelta, non teleologia.",section:"#atlante",lesson:"Cubisti, Fauves, Espressionisti e altri guardarono a queste opere, ma ne costruirono usi successivi che gli autori non potevano predeterminare.",retry:{q:"Dire “Cézanne padre inevitabile del Cubismo” rischia di…",o:["trasformare una ricezione successiva in destino","negare l’esistenza di Cézanne","descrivere una fonte primaria"],c:0}},
    {id:"truth",q:"Quale rapporto fra verità ottica e verità costruita emerge dal modulo?",o:["Solo la correttezza prospettica produce verità","Le relazioni costruite possono conoscere la realtà senza copiarne un’unica apparizione","Ogni deformazione è automaticamente vera"],c:1,e:"La trasformazione deve essere letta nelle relazioni e nei costi che produce.",section:"#laboratorio",lesson:"Sistema, struttura, intensità e simbolo non rendono l’immagine più o meno reale in assoluto: decidono che cosa può diventare visibile.",retry:{q:"Una deformazione è conoscitiva quando…",o:["costruisce relazioni verificabili nell’opera","è casuale","imita un artista famoso"],c:0}},
    {id:"expression",q:"Quale domanda apre la soglia verso l’Espressionismo?",o:["Come tornare all’imitazione neutrale?","Che cosa accade quando la forma rende visibile il conflitto interiore?","Come eliminare ogni rapporto con il mondo?"],c:1,e:"La realtà resta presente, ma la trasformazione può diventare linguaggio dell’interiorità.",section:"#atlante",lesson:"Il modulo 16 partirà dal problema di una forma che trasforma il mondo per rendere leggibile tensione interna, senza essere già costruito qui.",retry:{q:"La soglia finale afferma che la realtà…",o:["scompare","diventa costruzione capace di mostrare anche conflitti interiori","torna immutabile"],c:1}}
  ];
  state.quiz.cursor=Math.max(0,Math.min(quizPool.length,Number(state.quiz.cursor)||0));
  function currentQuestion(){return quizPool[state.quiz.cursor];}
  function renderQuiz(){
    const meter=$("#quizMeter"),count=$("#quizCount"),area=$("#quizArea");meter.value=state.quiz.mastered.length;
    if(state.quiz.completed||state.quiz.mastered.length===quizPool.length){state.quiz.completed=true;saveQuizOnly();count.textContent="Verifica completata";area.innerHTML=`<div class="quiz-complete"><b>16 / 16 nuclei compresi</b><p>Hai superato anche gli eventuali recuperi: nessuna percentuale complessiva ha nascosto un concetto irrinunciabile.</p><button class="reset-button" id="quizRestart" type="button">Genera una nuova prova</button></div>`;$("#quizRestart").addEventListener("click",()=>{state.quiz=clone(defaultState.quiz);saveState();renderQuiz();});return;}
    const item=currentQuestion();count.textContent=`Domanda ${state.quiz.cursor+1} di ${quizPool.length}`;
    area.innerHTML=`<article class="quiz-card"><form id="quizForm"><fieldset><legend>${escapeHTML(item.q)}</legend><div class="quiz-options">${item.o.map((option,index)=>`<label class="quiz-option"><input type="radio" name="answer" value="${index}"><span>${escapeHTML(option)}</span></label>`).join("")}</div><button class="quiz-submit" type="submit">Verifica la risposta</button></fieldset></form><div id="quizFeedback" aria-live="polite"></div></article>`;
    $("#quizForm").addEventListener("submit",event=>{event.preventDefault();const selected=new FormData(event.currentTarget).get("answer");if(selected===null){$("#quizFeedback").innerHTML="<p class='feedback'>Seleziona una risposta prima di verificare.</p>";return;}state.quiz.attempts[item.id]=(state.quiz.attempts[item.id]||0)+1;if(Number(selected)===item.c)masterConcept(item,false);else{saveState();renderRecovery(item);}});
  }
  function renderRecovery(item){
    $("#quizFeedback").innerHTML=`<div class="feedback"><b>Da ripassare.</b> ${escapeHTML(item.e)} <a href="${item.section}">Torna alla sezione</a>.</div><form class="recovery" id="recoveryForm"><h3>Microlezione di recupero</h3><p>${escapeHTML(item.lesson)}</p><fieldset><legend>${escapeHTML(item.retry.q)}</legend><div class="quiz-options">${item.retry.o.map((option,index)=>`<label class="quiz-option"><input type="radio" name="retry" value="${index}"><span>${escapeHTML(option)}</span></label>`).join("")}</div><button class="quiz-submit" type="submit">Verifica il recupero</button></fieldset><p id="retryFeedback" aria-live="polite"></p></form>`;
    $("#recoveryForm").addEventListener("submit",event=>{event.preventDefault();const selected=new FormData(event.currentTarget).get("retry");if(selected===null){$("#retryFeedback").textContent="Seleziona una risposta.";return;}if(Number(selected)===item.retry.c)masterConcept(item,true);else $("#retryFeedback").textContent="Non ancora: rileggi la microlezione e prova di nuovo. La domanda è diversa da quella iniziale.";});
  }
  function masterConcept(item,recovered){if(!state.quiz.mastered.includes(item.id))state.quiz.mastered.push(item.id);if(recovered&&!state.quiz.recoveries.includes(item.id))state.quiz.recoveries.push(item.id);saveState();$("#quizFeedback").innerHTML=`<div class="feedback"><b>${recovered?"Recupero riuscito":"Risposta corretta"}.</b> ${escapeHTML(item.e)}</div><button class="quiz-submit" id="quizNext" type="button">${state.quiz.cursor===quizPool.length-1?"Concludi la prova":"Domanda successiva"}</button>`;$("#quizNext").addEventListener("click",()=>{state.quiz.cursor+=1;if(state.quiz.cursor>=quizPool.length)state.quiz.completed=true;saveState();renderQuiz();});$("#quizMeter").value=state.quiz.mastered.length;}
  function saveQuizOnly(){try{localStorage.setItem(STATE_KEY,JSON.stringify(state));}catch(_){/* avviso gestito altrove */}}renderQuiz();

  // Lightbox accessibile, zoom e restituzione del focus.
  const lightbox=$("#lightbox"),lightboxImage=$("#lightboxImage"),lightboxStage=$("#lightboxStage");let lightboxTrigger=null,zoom=1;
  function applyZoom(){lightboxImage.style.transform=`scale(${zoom})`;$("#zoomReset").textContent=`${Math.round(zoom*100)}%`;}
  function openLightbox(button){const figure=button.closest("figure"),source=$("img",figure);lightboxTrigger=button;lightboxImage.src=source.currentSrc||source.src;lightboxImage.alt=source.alt;$("#lightboxCaption").textContent=$("figcaption",figure)?.textContent||source.alt;zoom=1;applyZoom();lightbox.hidden=false;document.body.classList.add("drawer-open");$("#lightboxClose").focus();}
  function closeLightbox(){if(lightbox.hidden)return;lightbox.hidden=true;document.body.classList.remove("drawer-open");lightboxImage.src="assets/images/basket.webp";lightboxTrigger?.focus();lightboxTrigger=null;}
  $$(".open-image").forEach(button=>button.addEventListener("click",()=>openLightbox(button)));$("#lightboxClose").addEventListener("click",closeLightbox);$("#zoomIn").addEventListener("click",()=>{zoom=Math.min(3,zoom+.25);applyZoom();});$("#zoomOut").addEventListener("click",()=>{zoom=Math.max(.5,zoom-.25);applyZoom();});$("#zoomReset").addEventListener("click",()=>{zoom=1;applyZoom();lightboxStage.scrollTo({top:0,left:0});});
  lightbox.addEventListener("keydown",event=>{if(event.key!=="Tab")return;const items=focusables(lightbox),first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});

  // Reset generale e PWA.
  $("#resetState").addEventListener("click",()=>{if(!confirm("Azzero note, attività, avanzamento e verifica del modulo 15? L’operazione non può essere annullata."))return;try{localStorage.removeItem(STATE_KEY);}catch(_){/* ricarico comunque */}location.reload();});
  if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>showStorageNotice("Il modulo funziona online, ma il service worker non è stato registrato in questa sessione.")));
})();
