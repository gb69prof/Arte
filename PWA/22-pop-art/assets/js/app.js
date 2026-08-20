(() => {
  "use strict";
  const KEY = "storia-sguardo-22-state";
  const VERSION = 1;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  };
  const clampInt = (value, min, max, fallback) => Math.round(clamp(value,min,max,fallback));
  const choice = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;
  const unique = (value, allowed) => [...new Set(Array.isArray(value) ? value.filter(item => typeof item === "string" && allowed.includes(item)) : [])];
  const markersAllowed = ["ripetizione","confezione","marchio","colore","disposizione","scala","prezzo","corpi","punto","lavoro"];
  const atlasAllowed = ["merce","immagine","serie","fonte","corpo","istituzione","geografia","valore"];
  const timelineAllowed = ["1947","1952","1954","1955","1956","1957","1960","1961","1962","1963","1964","1965","1966","1968"];
  const conditionAllowed = ["industria","supermercato","televisione","fumetto","pubblicita","fredda","classe","domestico","coloniali","museo","cinema","freddo"];
  const systemAllowed = ["johns","rauschenberg","warhol","lichtenstein","rosenquist","oldenburg","wesselmann","indiana","marisol","drexler","castelli","moma","riviste","pubblicita"];
  const provenanceAllowed = ["disegnatore","editor","stampa","ritaglio","trasformazione","museo","mercato","ricerca"];
  const worldAllowed = ["london","newyork","roma","milano","parigi","dusseldorf","tokyo","bogota","saopaulo"];
  const italyAllowed = ["rotella","schifano","festa","angeli","fioroni","piazza","biennale"];
  const collageDefaults = { scale:55, crop:35, layers:4, slogan:"futuro", body:"centrale", room:"salotto" };
  const serialDefaults = { count:12, gap:8, variation:20, error:10, scale:70, fade:25, direction:"griglia", distance:"vicina" };
  const objectDefaults = { material:"cartone", scale:100, place:"scaffale", brand:"visibile", price:"merce", caption:"prodotto" };
  const valueDefaults = { provenance:"incerta", rights:"chiuso", edition:500, scale:1, signature:"assente", display:"nessuna", media:35, use:"deposito" };
  const defaults = () => ({
    version:VERSION, markers:[], notes:{initial:"",final:""}, imageType:"oggetto", timeline:null, condition:null,
    precedent:"cubismo", collage:clone(collageDefaults), london:"paolozzi", system:null, serial:clone(serialDefaults),
    object:clone(objectDefaults), provenance:null, sourceCompare:"fonte", body:"warhol", lens:"soggetto", world:null,
    italy:null, value:clone(valueDefaults), atlas:[], visitedSections:[], quiz:{current:0,mastered:[],recovery:false}
  });
  const normalizeLab = (raw, base, ranges, selects) => {
    const clean = clone(base);
    Object.entries(ranges).forEach(([key,[min,max]]) => clean[key] = clampInt(raw?.[key], min, max, base[key]));
    Object.entries(selects).forEach(([key,allowed]) => clean[key] = choice(raw?.[key], allowed, base[key]));
    return clean;
  };
  const normalize = raw => {
    const clean = defaults();
    if (!raw || typeof raw !== "object" || raw.version !== VERSION) return clean;
    clean.markers = unique(raw.markers, markersAllowed);
    clean.notes.initial = typeof raw.notes?.initial === "string" ? raw.notes.initial.slice(0,5000) : "";
    clean.notes.final = typeof raw.notes?.final === "string" ? raw.notes.final.slice(0,5000) : "";
    clean.imageType = choice(raw.imageType,["oggetto","confezione","pubblicita","marchio","scaffale","riproduzione","opera","merceMuseale"],"oggetto");
    clean.timeline = choice(raw.timeline,timelineAllowed,null);
    clean.condition = choice(raw.condition,conditionAllowed,null);
    clean.precedent = choice(raw.precedent,["cubismo","dada","readymade","assemblage","neodada","pop"],"cubismo");
    clean.collage = normalizeLab(raw.collage,collageDefaults,{scale:[20,100],crop:[0,80],layers:[1,8]},{slogan:["futuro","corpo","casa","tecnica"],body:["centrale","frammento","assente"],room:["salotto","vetrina","set"]});
    clean.london = choice(raw.london,["paolozzi","hamilton","boty","alloway","independent"],"paolozzi");
    clean.system = choice(raw.system,systemAllowed,null);
    clean.serial = normalizeLab(raw.serial,serialDefaults,{count:[2,30],gap:[0,24],variation:[0,100],error:[0,100],scale:[35,100],fade:[0,100]},{direction:["griglia","nastro","pila"],distance:["vicina","media","lontana"]});
    clean.object = normalizeLab(raw.object,objectDefaults,{scale:[35,220]},{material:["cartone","legno","gesso","stoffa"],place:["scaffale","vetrina","piedistallo","pavimento"],brand:["visibile","coperto","inventato"],price:["merce","opera","assente"],caption:["prodotto","museo","nessuna"]});
    clean.provenance = choice(raw.provenance,provenanceAllowed,null);
    clean.sourceCompare = choice(raw.sourceCompare,["fonte","selezione","trasformazione","attribuzione","valore","diritto"],"fonte");
    clean.body = choice(raw.body,["warhol","boty","marisol","drexler","wesselmann"],"warhol");
    clean.lens = choice(raw.lens,["soggetto","pubblica","spettatore"],"soggetto");
    clean.world = choice(raw.world,worldAllowed,null);
    clean.italy = choice(raw.italy,italyAllowed,null);
    clean.value = normalizeLab(raw.value,valueDefaults,{edition:[1,1000],scale:[0,2],media:[0,100]},{provenance:["incerta","documentata","storica"],rights:["chiuso","negoziato","aperto"],signature:["assente","presente","certificata"],display:["nessuna","galleria","museo","retrospettiva"],use:["deposito","studio","asta","merch"]});
    clean.atlas = unique(raw.atlas,atlasAllowed);
    clean.visitedSections = unique(raw.visitedSections,Array.from({length:13},(_,index)=>String(index+1)));
    clean.quiz.current = clampInt(raw.quiz?.current,0,15,0);
    clean.quiz.mastered = [...new Set(Array.isArray(raw.quiz?.mastered) ? raw.quiz.mastered.map(Number).filter(number => Number.isInteger(number) && number >= 0 && number < 16) : [])].sort((a,b)=>a-b);
    clean.quiz.recovery = Boolean(raw.quiz?.recovery) && !clean.quiz.mastered.includes(clean.quiz.current);
    return clean;
  };

  let storageOK = true;
  let state;
  try {
    let parsed = null;
    try { const stored = localStorage.getItem(KEY); parsed = stored ? JSON.parse(stored) : null; }
    catch { try { localStorage.removeItem(KEY); } catch {} }
    state = normalize(parsed);
  } catch { storageOK = false; state = defaults(); }
  const save = () => {
    if (!storageOK) return false;
    try { localStorage.setItem(KEY,JSON.stringify(state)); return true; }
    catch { storageOK = false; return false; }
  };

  const menu = $("#sideNav"), scrim = $("#scrim"), menuToggle = $("#menuToggle"), menuClose = $("#menuClose");
  let menuReturn = null;
  const setMenu = open => {
    menu.classList.toggle("open",open); menu.setAttribute("aria-hidden",String(!open)); menu.inert = !open;
    menuToggle.setAttribute("aria-expanded",String(open)); scrim.hidden = !open;
    if (open) { menuReturn = document.activeElement; menuClose.focus(); } else menuReturn?.focus();
  };
  menuToggle.addEventListener("click",()=>setMenu(true)); menuClose.addEventListener("click",()=>setMenu(false)); scrim.addEventListener("click",()=>setMenu(false));
  $$("a",menu).forEach(link=>link.addEventListener("click",()=>setMenu(false)));
  menu.addEventListener("keydown",event=>{
    if (event.key === "Escape") return setMenu(false);
    if (event.key !== "Tab") return;
    const focusables = $$("a,button:not([disabled])",menu), first = focusables[0], last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  const updateProgress = () => { const max = document.documentElement.scrollHeight - innerHeight; $("#progressBar").style.width = `${max > 0 ? scrollY/max*100 : 0}%`; };
  addEventListener("scroll",updateProgress,{passive:true}); updateProgress();
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
      if (!entry.isIntersecting) return;
      const id = entry.target.dataset.section;
      if (!state.visitedSections.includes(id)) { state.visitedSections.push(id); save(); buildSynthesis(); }
    }),{threshold:.2});
    $$('[data-section]').forEach(section=>observer.observe(section));
  }

  const markerData = {
    ripetizione:["Ripetizione","Confezioni e carrelli si presentano come unità comparabili. La ripetizione rende la scelta possibile ma anche standardizzata."],
    confezione:["Confezione","Il contenitore protegge, misura, nomina e promette. Non mostra il processo produttivo che ha reso disponibile il prodotto."],
    marchio:["Marchio","Parole e segni distinguono merci simili. La memoria visiva del marchio precede spesso la lettura completa."],
    colore:["Colore tradotto","La fotografia in bianco e nero sottrae i colori commerciali: possiamo osservarne la struttura, non ricostruirli con certezza."],
    disposizione:["Disposizione","Corsie, banco e cassa guidano il corpo. Lo spazio commerciale è una sequenza progettata, non un deposito casuale."],
    scala:["Quantità e scala","La moltiplicazione suggerisce disponibilità. L’inquadratura non permette però un inventario completo."],
    prezzo:["Prezzo o promessa","Il prezzo non domina l’immagine; cartelli e confezioni promettono ordine, efficienza e scelta prima ancora di mostrare il costo."],
    corpi:["Presenza e assenza dei corpi","Cliente, commessa e bambina occupano ruoli differenti. Produzione industriale e trasporto restano fuori campo."],
    punto:["Punto di vista","La ripresa alta rende leggibile l’organizzazione dello spazio. Non coincide con il punto di vista di una cliente davanti allo scaffale."],
    lavoro:["Lavoro visibile e invisibile","La commessa è visibile; grafici, tipografi, trasportatori, addetti allo scaffale e produttori delle merci non lo sono."]
  };
  $$('[data-marker]').forEach(button=>{
    button.setAttribute("aria-pressed",String(state.markers.includes(button.dataset.marker)));
    button.addEventListener("click",()=>{
      const id = button.dataset.marker;
      if (!state.markers.includes(id)) state.markers.push(id);
      button.setAttribute("aria-pressed","true");
      const [title,text] = markerData[id]; $("#markerReadout").innerHTML = `<b>${title}</b><p>${text}</p>`;
      save(); buildSynthesis();
    });
  });
  const initialNote = $("#initialNote"), finalNote = $("#finalNote");
  initialNote.value = state.notes.initial; finalNote.value = state.notes.final;
  const updateNotes = () => {
    state.notes.initial = initialNote.value.slice(0,5000); state.notes.final = finalNote.value.slice(0,5000);
    $("#initialNoteEcho").textContent = state.notes.initial.trim() || "Nessuna nota ancora."; save(); buildSynthesis();
  };
  [initialNote,finalNote].forEach(field=>field.addEventListener("input",updateNotes));
  $("#initialNoteEcho").textContent = state.notes.initial.trim() || "Nessuna nota ancora.";

  const imageTypes = {
    oggetto:{label:"Oggetto",producer:"Industria, artigiano o utilizzatore",receiver:"Chi usa o consuma",channel:"Spazio fisico",promise:"Funzione e disponibilità",excludes:"Processo, lavoro, filiera",limit:"L’oggetto non contiene da solo il proprio valore sociale."},
    confezione:{label:"Confezione",producer:"Impresa, designer, grafico, tipografo",receiver:"Acquirente davanti a merci concorrenti",channel:"Scaffale e trasporto",promise:"Protezione, misura, identità",excludes:"Contenuto reale e condizioni di produzione",limit:"Il contenitore può sopravvivere al prodotto e diventare immagine."},
    pubblicita:{label:"Fotografia pubblicitaria",producer:"Fotografo, art director, copywriter, committente",receiver:"Pubblico segmentato",channel:"Rivista, manifesto, schermo",promise:"Desiderio e stile di vita",excludes:"Uso ordinario, difetti, alternative",limit:"Non documenta semplicemente l’oggetto: costruisce una situazione."},
    marchio:{label:"Marchio",producer:"Impresa e progettisti",receiver:"Consumatore da fidelizzare",channel:"Ogni superficie ripetibile",promise:"Riconoscibilità e continuità",excludes:"Differenze interne e filiera",limit:"Il segno non coincide con l’azienda né con l’esperienza del prodotto."},
    scaffale:{label:"Scaffale",producer:"Distributore e progettista dello spazio",receiver:"Cliente in movimento",channel:"Negozio",promise:"Scelta ordinata e confrontabile",excludes:"Produzione e scarti",limit:"La disposizione orienta senza determinare ogni acquisto."},
    riproduzione:{label:"Riproduzione",producer:"Fotografo, editore, piattaforma",receiver:"Pubblici lontani dall’originale",channel:"Libro, stampa, rete",promise:"Accesso",excludes:"Scala, materia, luogo",limit:"Moltiplica l’immagine ma non rende identica l’esperienza."},
    opera:{label:"Opera",producer:"Artista con assistenti e tecniche",receiver:"Pubblico, istituzioni, mercato",channel:"Studio, galleria, museo",promise:"Esperienza e interpretazione",excludes:"Non sempre dichiara le fonti",limit:"L’intenzione dell’artista non governa ogni uso successivo."},
    merceMuseale:{label:"Merce museale",producer:"Editore, museo, licenziatario",receiver:"Visitatore-acquirente",channel:"Bookshop e commercio",promise:"Portare via un frammento del museo",excludes:"Differenza fra opera e prodotto",limit:"Il merchandising non è l’opera, ma modifica la sua celebrità."}
  };
  const renderImageType = () => {
    $("#imageTypes").innerHTML = Object.entries(imageTypes).map(([id,item])=>`<button type="button" role="tab" data-image-type="${id}" aria-selected="${state.imageType===id}">${item.label}</button>`).join("");
    const item = imageTypes[state.imageType];
    $("#imageResult").innerHTML = `<h3>${item.label}</h3><dl class="data-list"><dt>Chi produce</dt><dd>${item.producer}</dd><dt>Destinatario</dt><dd>${item.receiver}</dd><dt>Canale</dt><dd>${item.channel}</dd><dt>Promessa</dt><dd>${item.promise}</dd><dt>Esclusioni</dt><dd>${item.excludes}</dd></dl><p><b>Limite:</b> ${item.limit}</p>`;
    $("#imageStage").dataset.type = state.imageType;
    $$('[data-image-type]').forEach(button=>button.addEventListener("click",()=>{ state.imageType=button.dataset.imageType; save(); renderImageType(); buildSynthesis(); }));
  }; renderImageType();

  const timelineData = {
    "1947":["1947","opera","Paolozzi compone <i>I was a Rich Man’s Plaything</i> con stampa commerciale americana; la distanza geografica fa parte dell’operazione.","Non è ancora un movimento unitario né un effetto diretto del boom."],
    "1952":["1952","istituzione","L’Independent Group inizia a riunirsi all’ICA di Londra: arte, design, scienza e comunicazione vengono discussi insieme.","Il gruppo non produce uno stile unico."],
    "1954":["1954","condizione","La televisione commerciale cresce in più paesi con tempi e modelli diversi; immagini e sponsor entrano nello spazio domestico.","La televisione non causa automaticamente la Pop."],
    "1955":["1955","processo","Crescita di supermercati, credito, riviste e pubblicità accompagna ricostruzione e disuguaglianze.","Consumo di massa non significa consumo uguale per tutti."],
    "1956":["1956","mostra","<i>This Is Tomorrow</i> alla Whitechapel coinvolge 38 partecipanti in 12 gruppi interdisciplinari.","La mostra non è soltanto la culla di un’etichetta successiva."],
    "1957":["1957","critica","Richard Hamilton formula caratteristiche del Pop come popolare, effimero, spendibile, a basso costo, prodotto in massa e grande affare.","Una definizione critica non descrive ogni opera futura."],
    "1960":["1960","soglia","Johns e Rauschenberg rendono familiari bandiere, bersagli, fotografie e oggetti senza coincidere con la Pop propriamente detta.","Le genealogie restano discusse."],
    "1961":["1961","spazio","Oldenburg apre <i>The Store</i> e vende oggetti-scultura in un negozio del Lower East Side.","Negozio, happening, galleria e strada restano in tensione."],
    "1962":["1962","mostre","Warhol espone le <i>Campbell’s Soup Cans</i>; Lichtenstein, Rosenquist e altri acquistano visibilità nelle gallerie newyorkesi.","Una stagione espositiva non rende omogenee le operazioni."],
    "1963":["1963","circolazione","Boty, Lichtenstein, Schifano, Festa, Angeli e altri lavorano su celebrità, fumetto, marchi e simboli in contesti differenti.","La simultaneità non prova derivazione lineare."],
    "1964":["1964","istituzione","Rauschenberg riceve il Gran Premio alla Biennale di Venezia; il sistema statunitense acquista visibilità internazionale.","Un premio non trasferisce da solo il centro dell’arte mondiale."],
    "1965":["1964–65","opera","Rosenquist costruisce <i>F-111</i> intrecciando pubblicità, consumo e macchina militare su scala ambientale.","Non è riducibile a un semplice messaggio antiamericano."],
    "1966":["1966","geografia","Drexler, Gerchman, González, Polke e altri traducono cinema, stampa e immagini politiche fuori da un modello unico.","“Pop globale” può nascondere squilibri e conflitti locali."],
    "1968":["1968","frattura","Proteste, guerra, femminismi e crisi della fiducia nelle istituzioni trasformano uso e ricezione delle immagini.","Il 1968 non chiude la Pop come un interruttore."]
  };
  $("#timeline").innerHTML = Object.entries(timelineData).map(([id,item])=>`<button type="button" role="listitem" data-year="${id}" aria-pressed="${state.timeline===id}"><b>${item[0]}</b><span>${item[1]}</span></button>`).join("");
  const showTimeline = id => { const item=timelineData[id]; if(item) $("#timelineDetail").innerHTML=`<p class="kicker">${item[1]}</p><h3>${item[0]}</h3><p>${item[2]}</p><p><b>Limite:</b> ${item[3]}</p>`; };
  $$('[data-year]').forEach(button=>button.addEventListener("click",()=>{state.timeline=button.dataset.year;save();$$('[data-year]').forEach(item=>item.setAttribute("aria-pressed",String(item===button)));showTimeline(state.timeline);buildSynthesis();}));
  showTimeline(state.timeline);
  const conditionData = {
    industria:["Produzione industriale","Aumenta standardizzazione, confezione, logistica e disponibilità; non assegna un significato fisso alle immagini.","Lavoratori, imprese, tecnici, sindacati"],
    supermercato:["Supermercato","Rende merci confrontabili dentro un percorso; sposta parte del lavoro di selezione sul cliente.","Distributori, clienti, addetti, progettisti"],
    televisione:["Televisione","Porta sequenze sponsorizzate nello spazio domestico e produce nuovi ritmi di attenzione.","Reti, inserzionisti, autori, pubblici"],
    fumetto:["Fumetto","Industria collettiva di sceneggiatori, disegnatori, inchiostratori, coloristi, editori e stampatori.","Lavoro spesso contratto e non proprietario"],
    pubblicita:["Pubblicità","Costruisce desideri attraverso fotografia, testo, ricerca di mercato e acquisto di spazi.","Agenzie, imprese, grafici, fotografi"],
    fredda:["Guerra fredda","Militarizzazione, competizione tecnologica e diplomazia culturale attraversano la cultura di massa.","Stati, industrie, media, movimenti"],
    classe:["Classe e accesso","Reddito, credito, casa e territorio rendono diseguale la promessa dell’abbondanza.","Famiglie, lavoratori, esclusi"],
    domestico:["Lavoro domestico","Elettrodomestici e confezioni promettono efficienza, ma possono ridistribuire o occultare lavoro e ruoli di genere.","Soprattutto donne, imprese, famiglie"],
    coloniali:["Persistenze coloniali","Materie prime, immagini esotizzanti e gerarchie razziali sopravvivono nella pubblicità e nei consumi.","Imprese, Stati, soggetti rappresentati"],
    museo:["Museo e galleria","Selezionano oggetti comuni come opere e costruiscono un pubblico specializzato.","Curatori, galleristi, collezionisti, visitatori"],
    cinema:["Cinema e celebrità","Fotogrammi, ritratti promozionali e stampa trasformano persone in immagini ripetibili.","Studi, fotografi, attori, fan"],
    freddo:["Stampa economica","Retini, registri imperfetti e colori limitati diventano una grammatica visiva riconoscibile.","Editori, tipografi, illustratori"]
  };
  $("#conditionNetwork").innerHTML = Object.entries(conditionData).map(([id,item])=>`<button type="button" data-condition="${id}" aria-pressed="${state.condition===id}">${item[0]}</button>`).join("");
  const showCondition = id => { const item=conditionData[id]; if(item) $("#conditionResult").innerHTML=`<h3>${item[0]}</h3><p>${item[1]}</p><p><b>Soggetti:</b> ${item[2]}.</p><p><b>Non spiega:</b> perché un artista scelga proprio una tecnica, un tono o un’immagine.</p>`; };
  $$('[data-condition]').forEach(button=>button.addEventListener("click",()=>{state.condition=button.dataset.condition;save();$$('[data-condition]').forEach(item=>item.setAttribute("aria-pressed",String(item===button)));showCondition(state.condition);buildSynthesis();})); showCondition(state.condition);

  const precedentData = {
    cubismo:{label:"Collage cubista",operation:"Inserisce giornale, carta da parati o etichetta nel campo pittorico.",object:"Il frammento resta materiale e segno dentro una composizione.",institution:"Pittura e avanguardia.",difference:"Non assume ancora il sistema maturo di marchi, TV e consumo postbellico."},
    dada:{label:"Dada",operation:"Monta stampa, caso, parola, fotografia e rifiuto dell’autonomia artistica.",object:"L’immagine di massa può diventare arma critica e antiartistica.",institution:"Rivista, cabaret, mostra, provocazione.",difference:"La Pop eredita il montaggio ma opera dentro un’industria culturale diversa."},
    readymade:{label:"Ready-made",operation:"Seleziona e nomina un oggetto prodotto in serie.",object:"La scelta e il dispositivo istituzionale spostano la domanda dall’abilità all’attribuzione.",institution:"Esposizione, rifiuto, certificazione.",difference:"La Pop spesso trasforma immagine, scala, superficie e ripetizione, non si limita a scegliere."},
    assemblage:{label:"Assemblage",operation:"Combina oggetti e materiali reali in una costruzione.",object:"Usura, provenienza e contatto fisico restano leggibili.",institution:"Scultura espansa e ambiente.",difference:"Oggetto trovato e immagine commerciale non sono intercambiabili."},
    neodada:{label:"Neo-Dada",operation:"Johns e Rauschenberg sovrappongono segni comuni, pittura, fotografia e oggetti.",object:"Il familiare resta ambiguo fra cosa, segno e memoria.",institution:"New York fra museo, galleria e cultura urbana.",difference:"Soglia decisiva, ma categorie e intenzioni non coincidono con tutta la Pop."},
    pop:{label:"Pop Art",operation:"Preleva, ridisegna, ingrandisce, ripete o reifica immagini già circolanti.",object:"La merce e la sua immagine entrano nell’opera senza perdere del tutto il circuito originario.",institution:"Galleria, museo, stampa, mercato e celebrità.",difference:"Non una tecnica unica: il problema è come l’immagine di massa cambia funzione."}
  };
  const renderPrecedent = () => {
    $("#precedentTabs").innerHTML = Object.entries(precedentData).map(([id,item])=>`<button type="button" role="tab" data-precedent="${id}" aria-selected="${state.precedent===id}">${item.label}</button>`).join("");
    const item=precedentData[state.precedent] || precedentData.cubismo;
    $("#precedentResult").innerHTML=`<h3>${item.label}</h3><dl class="data-list"><dt>Operazione</dt><dd>${item.operation}</dd><dt>Oggetto</dt><dd>${item.object}</dd><dt>Istituzione</dt><dd>${item.institution}</dd><dt>Differenza</dt><dd>${item.difference}</dd></dl>`;
    $("#precedentStage").dataset.mode=state.precedent;
    $$('[data-precedent]').forEach(button=>button.addEventListener("click",()=>{state.precedent=button.dataset.precedent;save();renderPrecedent();buildSynthesis();}));
  }; renderPrecedent();

  const setControl = (selector,value,label=value) => { const control=$(selector); if(!control)return; control.value=value; const output=control.closest("label")?.querySelector("output"); if(output)output.textContent=label; };
  const bindControls = (formSelector,map,render) => {
    Object.entries(map).forEach(([id,key])=>$("#"+id)?.addEventListener("input",event=>{ const old=state[key.group][key.name]; state[key.group][key.name]=typeof old==="number"?Number(event.target.value):event.target.value; save(); render(); buildSynthesis(); }));
  };
  const sloganLabels={futuro:"PROMESSA DI FUTURO",corpo:"CORPO PERFETTO",casa:"CASA EFFICIENTE",tecnica:"TECNOLOGIA FELICE"};
  const renderCollage = () => {
    const item=state.collage; setControl("#collageScale",item.scale,`${item.scale}%`); setControl("#collageCrop",item.crop,`${item.crop}%`); setControl("#collageLayers",item.layers); setControl("#collageSlogan",item.slogan); setControl("#collageBody",item.body); setControl("#collageRoom",item.room);
    const stage=$("#collageStage"); stage.style.setProperty("--collage-scale",item.scale/70); stage.style.clipPath=`inset(${item.crop/8}% ${item.crop/10}% ${item.crop/12}% ${item.crop/14}%)`; $("#collageWord").textContent=sloganLabels[item.slogan];
    stage.querySelector(".shape-c").style.opacity=String(Math.min(1,.25+item.layers/8)); const body=stage.querySelector(".body-symbol"); body.style.display=item.body==="assente"?"none":"block"; body.style.clipPath=item.body==="frammento"?"inset(0 0 45% 0)":"none";
    const reading=item.body==="assente"?"Il corpo assente lascia che oggetti e slogan occupino la promessa.":item.body==="frammento"?"Il corpo frammentato funziona come superficie selezionata.":"Il corpo centrale diventa destinatario e prodotto della promessa.";
    $("#collageResult").innerHTML=`<b>${sloganLabels[item.slogan]}</b><p>Scala ${item.scale}%, ritaglio ${item.crop}%, ${item.layers} livelli, ambiente “${item.room}”. ${reading}</p><p><b>Limite:</b> il diagramma mostra operazioni; non misura il desiderio reale di un pubblico.</p>`;
  };
  bindControls("#collageControls",{collageScale:{group:"collage",name:"scale"},collageCrop:{group:"collage",name:"crop"},collageLayers:{group:"collage",name:"layers"},collageSlogan:{group:"collage",name:"slogan"},collageBody:{group:"collage",name:"body"},collageRoom:{group:"collage",name:"room"}},renderCollage); renderCollage();
  const londonData={
    paolozzi:["Eduardo Paolozzi","Ritaglia riviste americane già durante gli anni Quaranta: abbondanza, guerra, tecnologia e desiderio arrivano come immagini importate.","Il termine Pop è successivo e non esaurisce la sua pratica."],
    hamilton:["Richard Hamilton","Analizza la casa moderna come montaggio di corpo, elettrodomestico, spettacolo e design; collega artista, progettista e teorico.","L’ironia non elimina l’attrazione per ciò che osserva."],
    boty:["Pauline Boty","Interviene su celebrità, desiderio, politica e sessualità da una posizione che complica il corpo femminile come semplice prodotto per lo sguardo maschile.","Definirla soltanto “la donna della Pop britannica” ripete la marginalizzazione."],
    alloway:["Lawrence Alloway","Studia il continuum delle arti e della cultura di massa; contribuisce alla circolazione critica della categoria Pop.","La categoria critica non precede ogni opera né ne fissa il significato."],
    independent:["Independent Group","Artisti, architetti, designer e critici discutono tecnologia, comunicazione e ambienti; <i>This Is Tomorrow</i> rende il metodo spaziale e collaborativo.","Non è una scuola con manifesto e stile obbligatorio."]
  };
  const renderLondon = () => { $("#londonFigures").innerHTML=Object.entries(londonData).map(([id,item])=>`<button type="button" role="tab" data-london="${id}" aria-selected="${state.london===id}">${item[0]}</button>`).join(""); const item=londonData[state.london]; $("#londonResult").innerHTML=`<h3>${item[0]}</h3><p>${item[1]}</p><p><b>Limite:</b> ${item[2]}</p>`; $$('[data-london]').forEach(button=>button.addEventListener("click",()=>{state.london=button.dataset.london;save();renderLondon();buildSynthesis();})); }; renderLondon();

  const systemData={
    johns:["Jasper Johns","Segno comune","Bandiera e bersaglio oscillano fra cosa e immagine; figura di soglia, non Pop automatica.","Leo Castelli, MoMA, critica"],rauschenberg:["Robert Rauschenberg","Combine","Pittura, fotografia e oggetto trovato rendono instabile il confine dell’opera.","Atelier, galleria, Biennale"],warhol:["Andy Warhol","Serie e celebrità","Minestra, star, cronaca e morte attraversano pittura, serigrafia, film e Factory.","Ferus, Stable, Factory, musei"],lichtenstein:["Roy Lichtenstein","Fumetto ridisegnato","Isola, ingrandisce e ridipinge immagini editoriali, facendo emergere stampa, cliché e attribuzione.","Leo Castelli, editori, Tate"],rosenquist:["James Rosenquist","Montaggio pubblicitario","La scala da cartellone frantuma merci, corpo e macchina militare.","Gallerie, MoMA, mestiere di billboard painter"],oldenburg:["Claes Oldenburg","Negozio e oggetto molle","Porta cibo, abiti e vetrina dentro ambiente, vendita e scultura.","The Store, strada, Green Gallery"],wesselmann:["Tom Wesselmann","Interno e corpo","Combina natura morta, elettrodomestico, marchio, nudo e oggetti reali.","Galleria, pubblicità, museo"],indiana:["Robert Indiana","Parola e segno","Trasforma numeri, insegne e parole in emblemi fra esperienza urbana e mercato.","Coenties Slip, gallerie, riproduzioni"],marisol:["Marisol","Figura sociale","Blocchi, disegno, oggetti trovati e autoritratto costruiscono ruoli e gruppi.","Stable Gallery, MoMA, stampa"],drexler:["Rosalyn Drexler","Cinema e violenza","Collage pittorico di fotogrammi e stampa interroga genere, potere e macchine.","Gallerie, cinema, recupero museale"],castelli:["Leo Castelli","Galleria","Seleziona, espone, vende e internazionalizza; non crea da solo le opere.","Artisti, collezionisti, musei"],moma:["MoMA","Museo","Acquisisce e storicizza opere, costruendo visibilità e canone.","Curatori, fondi, pubblico"],riviste:["Riviste","Riproduzione","Fanno circolare opere come fotografie ridotte, articoli e profili di celebrità.","Editori, fotografi, critici"],pubblicita:["Industria pubblicitaria","Fonte e mestiere","Fornisce immagini, tecniche e lavoro professionale; non è un autore collettivo indistinto.","Agenzie, grafici, fotografi, clienti"]
  };
  $("#systemNetwork").innerHTML=Object.entries(systemData).map(([id,item])=>`<button type="button" data-system="${id}" aria-pressed="${state.system===id}">${item[0]}</button>`).join("");
  const showSystem=id=>{const item=systemData[id];if(item)$("#systemResult").innerHTML=`<p class="kicker">${item[1]}</p><h3>${item[0]}</h3><p>${item[2]}</p><p><b>Circuito:</b> ${item[3]}.</p>`;};
  $$('[data-system]').forEach(button=>button.addEventListener("click",()=>{state.system=button.dataset.system;save();$$('[data-system]').forEach(item=>item.setAttribute("aria-pressed",String(item===button)));showSystem(state.system);buildSynthesis();})); showSystem(state.system);

  const renderSerial = () => {
    const item=state.serial; setControl("#serialCount",item.count);setControl("#serialGap",item.gap);setControl("#serialVariation",item.variation,`${item.variation}%`);setControl("#serialError",item.error,`${item.error}%`);setControl("#serialScale",item.scale,`${item.scale}%`);setControl("#serialFade",item.fade,`${item.fade}%`);setControl("#serialDirection",item.direction);setControl("#serialDistance",item.distance);
    const stage=$("#serialStage"); stage.dataset.direction=item.direction; stage.style.setProperty("--serial-gap",`${item.gap}px`); stage.style.setProperty("--serial-cols",String(item.distance==="lontana"?8:item.distance==="media"?6:4));
    stage.innerHTML=Array.from({length:item.count},(_,index)=>{const variation=((index*37)%101)/100*item.variation;const error=((index*53)%101)<item.error;const opacity=Math.max(.12,1-index/Math.max(1,item.count-1)*(item.fade/100));const rotation=item.direction==="pila"?(index-item.count/2)*1.4:error?8:variation/14-3;const color=variation>50?"var(--cyan)":error?"var(--blue)":"var(--red)";return `<div class="serial-item" style="--unit-scale:${item.scale/100};--unit-rotate:${rotation}deg;--unit-opacity:${opacity};--unit-color:${color};z-index:${index}"><span>${String(index+1).padStart(2,"0")}</span></div>`;}).join("");
    const equality=item.variation===0&&item.error===0?"L’apparenza è uniforme, ma ogni unità occupa comunque una posizione e un tempo diversi.":"Variazioni ed errori rendono visibile che serie non significa identità assoluta.";
    $("#serialResult").innerHTML=`<b>${item.count} unità · ${item.direction}</b><p>${equality} Distanza “${item.distance}”, consumo progressivo ${item.fade}%.</p><p><b>Distinzione:</b> l’industria mira a tolleranze controllate; la serie artistica può progettare differenze; la copia digitale replica dati ma cambia dispositivo e uso.</p>`;
  };
  bindControls("#serialControls",{serialCount:{group:"serial",name:"count"},serialGap:{group:"serial",name:"gap"},serialVariation:{group:"serial",name:"variation"},serialError:{group:"serial",name:"error"},serialScale:{group:"serial",name:"scale"},serialFade:{group:"serial",name:"fade"},serialDirection:{group:"serial",name:"direction"},serialDistance:{group:"serial",name:"distance"}},renderSerial);renderSerial();

  const materialLabels={cartone:"cartone industriale",legno:"legno dipinto",gesso:"gesso modellato",stoffa:"stoffa imbottita"};
  const renderObject = () => {
    const item=state.object;setControl("#objectMaterial",item.material);setControl("#objectScale",item.scale,`${item.scale}%`);setControl("#objectPlace",item.place);setControl("#objectBrand",item.brand);setControl("#objectPrice",item.price);setControl("#objectCaption",item.caption);
    const stage=$("#objectStage"), box=stage.querySelector(".generic-box"), strip=stage.querySelector(".caption-strip");stage.dataset.place=item.place;stage.style.setProperty("--object-scale",item.scale/100);stage.querySelector(".shelf").style.display=item.place==="scaffale"?"block":"none";box.style.borderRadius=item.material==="stoffa"?"28px":"0";box.style.filter=item.material==="gesso"?"grayscale(1)":item.material==="legno"?"sepia(.45)":"none";box.querySelector("span").textContent=item.brand==="visibile"?"GENERICA":item.brand==="coperto"?"██████":"NUOVONOME";strip.textContent=item.caption==="nessuna"?"":item.caption==="museo"?"Artista · titolo · data · tecnica · provenienza":"prodotto · peso · prezzo · ingredienti";
    $("#objectResult").innerHTML=`<h3>${materialLabels[item.material]}, scala ${item.scale}%</h3><p>Collocazione “${item.place}”, marchio “${item.brand}”, prezzo “${item.price}”, didascalia “${item.caption}”. Cambiare materiale e scala interrompe l’equivalenza funzionale; luogo e didascalia modificano l’autorità dell’oggetto.</p><p><b>Limite:</b> l’ingresso nel museo non elimina contenuto commerciale, lavoro di design o storia del marchio.</p>`;
  };
  bindControls("#objectControls",{objectMaterial:{group:"object",name:"material"},objectScale:{group:"object",name:"scale"},objectPlace:{group:"object",name:"place"},objectBrand:{group:"object",name:"brand"},objectPrice:{group:"object",name:"price"},objectCaption:{group:"object",name:"caption"}},renderObject);renderObject();

  const provenanceData={disegnatore:["Disegnatore / fotografo","Produce un’immagine concreta con competenze, contratti e vincoli."],editor:["Editore / agenzia","Seleziona, ritaglia, abbina testo, stampa e distribuisce."],stampa:["Stampa","Retino, registro, carta e colore trasformano il lavoro in oggetto circolante."],ritaglio:["Ritaglio","L’artista sceglie un frammento e ne elimina pagina, sequenza e vicinanze."],trasformazione:["Trasformazione artistica","Scala, disegno, colore, supporto e montaggio costruiscono un’altra esperienza."],museo:["Museo","Attribuisce, conserva e didascalizza; può nominare o tacere la fonte."],mercato:["Mercato","Rende confrontabili prezzi e carriere con forti asimmetrie di riconoscimento."],ricerca:["Ricerca successiva","Archivi e studiosi possono recuperare autori, numeri di rivista e passaggi cancellati."]};
  $("#provenancePath").innerHTML=Object.entries(provenanceData).map(([id,item])=>`<button type="button" data-provenance="${id}" aria-pressed="${state.provenance===id}">${item[0]}</button>`).join("");
  const showProvenance=id=>{const item=provenanceData[id];if(item)$("#provenanceResult").innerHTML=`<h3>${item[0]}</h3><p>${item[1]}</p><p><b>Domanda:</b> quali nomi, diritti, compensi e decisioni restano leggibili nella didascalia finale?</p>`;};
  $$('[data-provenance]').forEach(button=>button.addEventListener("click",()=>{state.provenance=button.dataset.provenance;save();$$('[data-provenance]').forEach(item=>item.setAttribute("aria-pressed",String(item===button)));showProvenance(state.provenance);buildSynthesis();}));showProvenance(state.provenance);
  const sourceData={fonte:["Fonte","Pannelli di fumetto di guerra DC, con il contributo documentabile di Irv Novick e altri autori."],selezione:["Selezione","Un frammento narrativo viene isolato da pagina, episodio, formato economico e pubblico originario."],trasformazione:["Trasformazione","Dipinto monumentale in due pannelli, ridisegno, colori e retino simulato; non ingrandimento fotografico neutro."],attribuzione:["Attribuzione","Il museo intitola l’opera a Lichtenstein; il fumettista può restare fuori dalla prima riga."],valore:["Valore","La rarità dell’opera, la firma e l’istituzione producono una posizione economica diversa dalla pagina stampata."],diritto:["Diritto","Copyright dell’opera, diritti editoriali e uso della fonte sono piani storici e giuridici distinti."]};
  const renderSourceCompare=()=>{$("#sourceCompare").innerHTML=Object.entries(sourceData).map(([id,item])=>`<button type="button" role="tab" data-source-level="${id}" aria-selected="${state.sourceCompare===id}">${item[0]}</button>`).join("");const item=sourceData[state.sourceCompare];$("#sourceCompareResult").innerHTML=`<b>${item[0]}</b><br>${item[1]}`;$$('[data-source-level]').forEach(button=>button.addEventListener("click",()=>{state.sourceCompare=button.dataset.sourceLevel;save();renderSourceCompare();buildSynthesis();}));};renderSourceCompare();

  const bodyData={
    warhol:{label:"Warhol · Marilyn",shape:"ripetizione",subject:"Una fotografia promozionale già pubblica viene isolata e serializzata dopo la morte della persona.",public:"Celebrità e vulnerabilità convivono; esposizione e consumo non si lasciano separare facilmente.",viewer:"Lo spettatore alterna riconoscimento immediato e perdita progressiva del volto.",style:[0,1,.95,.55]},
    boty:{label:"Boty · desiderio",shape:"montaggio",subject:"La star non è soltanto oggetto: il desiderio può essere riconosciuto e articolato da una pittrice dentro la cultura Pop.",public:"Titoli, colore e frammenti rinegoziano la figura femminile costruita dai media.",viewer:"Lo spettatore deve interrogare chi desidera, chi controlla l’immagine e chi viene guardato.",style:[-18,.82,.2,.75]},
    marisol:{label:"Marisol · ruolo sociale",shape:"figura-oggetto",subject:"Blocchi, disegno, oggetti trovati e autoritratto costruiscono famiglia, celebrità e ruolo come facciate sociali.",public:"La figura non è immagine piatta: occupa lo spazio e mostra la propria costruzione.",viewer:"Il corpo dello spettatore condivide l’ambiente con figure insieme presenti e artificiali.",style:[20,1.5,0,.45]},
    drexler:{label:"Drexler · uomini e macchine",shape:"fotogramma",subject:"Immagini di cinema e stampa diventano scene ambigue di controllo, lavoro e violenza.",public:"Lo stereotipo maschile non è neutro; macchina e arma possono diventare visivamente indistinguibili.",viewer:"Riconoscere un cliché non basta: occorre chiedere chi agisce e chi subisce.",style:[-35,.72,.4,.8]},
    wesselmann:{label:"Wesselmann · interno e nudo",shape:"frammentazione",subject:"Il corpo femminile può essere trattato come elemento dell’interno insieme a cibo, frigorifero e marchio.",public:"Semplificazione e desiderio trasformano il corpo in superficie comparabile.",viewer:"La seduzione formale coinvolge lo spettatore nella struttura che potrebbe voler criticare.",style:[30,1.15,.1,.65]}
  };
  const renderBody=()=>{
    $("#bodyTabs").innerHTML=Object.entries(bodyData).map(([id,item])=>`<button type="button" role="tab" data-body="${id}" aria-selected="${state.body===id}">${item.label}</button>`).join("");
    const item=bodyData[state.body], stage=$("#bodyStage"),[shift,width,blur,repeat]=item.style;stage.style.setProperty("--body-shift",`${shift}%`);stage.style.setProperty("--body-width",width);stage.style.setProperty("--body-blur",`${blur*8}px`);stage.style.setProperty("--repeat-opacity",repeat);stage.dataset.body=state.body;
    const lensText=state.lens==="soggetto"?item.subject:state.lens==="pubblica"?item.public:item.viewer;
    $("#bodyResult").innerHTML=`<p class="kicker">${item.shape} · lente: ${state.lens}</p><h3>${item.label}</h3><p>${lensText}</p><p><b>Limite:</b> il soggetto rappresentato non coincide con la sua immagine pubblica né con l’intenzione dell’artista.</p>`;
    $$('[data-body]').forEach(button=>button.addEventListener("click",()=>{state.body=button.dataset.body;save();renderBody();buildSynthesis();}));
    $$('[data-lens]').forEach(button=>{button.setAttribute("aria-pressed",String(state.lens===button.dataset.lens));button.onclick=()=>{state.lens=button.dataset.lens;save();renderBody();buildSynthesis();};});
  };renderBody();

  const worldData={
    london:{label:"Londra",x:18,y:27,text:"Independent Group, Paolozzi, Hamilton, Boty: America osservata attraverso riviste, design e distanza.",limit:"Non semplice anticipazione di New York."},newyork:{label:"New York",x:10,y:52,text:"Gallerie, pubblicità, fumetto, cinema e musei; Warhol, Lichtenstein, Rosenquist, Oldenburg, Marisol, Drexler.",limit:"Non una lingua unica né il solo centro."},roma:{label:"Roma",x:39,y:39,text:"Rotella, Schifano, Festa, Angeli e Fioroni intrecciano strada, cinema, marchi, tradizione e simboli politici.",limit:"L’americanizzazione non cancella memoria fascista e paesaggio urbano."},milano:{label:"Milano",x:43,y:27,text:"Gallerie, design, editoria e Nouveau Réalisme connettono Italia ed Europa.",limit:"Roma e Milano non sono intercambiabili."},parigi:{label:"Parigi",x:31,y:18,text:"Nouveau Réalisme e affichisme lavorano su accumulo, compressione e manifesto strappato.",limit:"Nouveau Réalisme non è sinonimo francese di Pop."},dusseldorf:{label:"Düsseldorf",x:48,y:12,text:"Il “Realismo capitalista” di Polke, Richter e Lueg usa ironicamente una Germania divisa e ricostruita.",limit:"Non esportazione passiva del modello USA."},tokyo:{label:"Tokyo",x:80,y:34,text:"Shinohara, Hi Red Center e media giapponesi trattano imitazione, azione e consumo dentro una modernizzazione specifica.",limit:"“Japanese Pop” può essere un’etichetta retrospettiva troppo larga."},bogota:{label:"Bogotá",x:20,y:77,text:"Beatriz González trasforma immagini di stampa, mobili e gusto popolare dentro storia e violenza colombiane.",limit:"La categoria Pop va usata con cautela."},saopaulo:{label:"São Paulo",x:39,y:82,text:"Nuova Figurazione e Rubens Gerchman leggono metropoli, massa, politica e media durante la dittatura brasiliana.",limit:"Il colore acceso non basta a definire Pop."}
  };
  $("#worldNodes").innerHTML=Object.entries(worldData).map(([id,item])=>`<button class="world-node" type="button" data-world="${id}" aria-pressed="${state.world===id}" style="left:${item.x}%;top:${item.y}%">${item.label}</button>`).join("");
  const showWorld=id=>{const item=worldData[id];if(item)$("#worldResult").innerHTML=`<h3>${item.label}</h3><p>${item.text}</p><p><b>Limite:</b> ${item.limit}</p>`;};
  $$('[data-world]').forEach(button=>button.addEventListener("click",()=>{state.world=button.dataset.world;save();$$('[data-world]').forEach(item=>item.setAttribute("aria-pressed",String(item===button)));showWorld(state.world);buildSynthesis();}));showWorld(state.world);
  const italyData={rotella:["Mimmo Rotella","Décollage","Preleva manifesti già lacerati dalla strada e li strappa ancora: pubblicità, cinema, tempo urbano e retro della carta diventano materia.","Non copia il manifesto: lavora sulla sua circolazione e distruzione."],schifano:["Mario Schifano","Marchio e schermo","Campi monocromi, insegne e loghi come Esso o Coca-Cola diventano superfici insieme seducenti e svuotate.","Non è un Warhol italiano: storia pittorica, paesaggio e televisione cambiano il problema."],festa:["Tano Festa","Tradizione riprodotta","Frammenti di Michelangelo, finestre e mobili domestici passano attraverso fotografia e cultura di massa.","La fonte non è soltanto commerciale: è anche il patrimonio artistico italiano."],angeli:["Franco Angeli","Simbolo politico","Aquile, svastiche, falci e martelli, dollari e veli attraversano memoria bellica e conflitto contemporaneo.","Un simbolo ripetuto non equivale automaticamente ad adesione."],fioroni:["Giosetta Fioroni","Argento e fotografia","Volti e figure mediali filtrati nell’argento intrecciano memoria privata, cinema e stereotipo.","Non va relegata come eccezione femminile al gruppo romano."],piazza:["Piazza del Popolo","Rete urbana","Gallerie, Caffè Rosati, fotografi, critici, cinema e vita romana costruiscono incontri e visibilità.","La rete non rende identiche le opere né i rapporti di potere."],biennale:["Biennale di Venezia","Istituzione","Premi, padiglioni, stampa e collezionismo internazionalizzano la Pop e le ricerche vicine.","Il premio a Rauschenberg nel 1964 non dimostra da solo una conquista americana."]};
  const renderItaly=()=>{$("#italyNetwork").innerHTML=Object.entries(italyData).map(([id,item])=>`<button type="button" role="tab" data-italy="${id}" aria-selected="${state.italy===id}">${item[0]}</button>`).join("");if(state.italy&&italyData[state.italy]){const item=italyData[state.italy];$("#italyResult").innerHTML=`<p class="kicker">${item[1]}</p><h3>${item[0]}</h3><p>${item[2]}</p><p><b>Limite:</b> ${item[3]}</p>`;}$$('[data-italy]').forEach(button=>button.addEventListener("click",()=>{state.italy=button.dataset.italy;save();renderItaly();buildSynthesis();}));};renderItaly();

  const renderValue=()=>{
    const item=state.value;setControl("#valueProvenance",item.provenance);setControl("#valueRights",item.rights);setControl("#valueEdition",item.edition);setControl("#valueScale",item.scale,["piccolo","medio","monumentale"][item.scale]);setControl("#valueSignature",item.signature);setControl("#valueDisplay",item.display);setControl("#valueMedia",item.media,`${item.media}%`);setControl("#valueUse",item.use);
    const provenanceScore={incerta:0,documentata:10,storica:18}[item.provenance], rightsScore={chiuso:2,negoziato:6,aperto:8}[item.rights], scarcity=Math.round((1001-item.edition)/100), scale=[1,5,9][item.scale], signature={assente:0,presente:7,certificata:13}[item.signature], display={nessuna:0,galleria:5,museo:12,retrospettiva:18}[item.display], media=Math.round(item.media/10), use={deposito:0,studio:3,asta:8,merch:5}[item.use];const score=Math.min(99,10+provenanceScore+rightsScore+scarcity+scale+signature+display+media+use);$("#valueIndex").textContent=score;
    $("#valueResult").innerHTML=`<b>Indice relazionale ${score}/99</b><p>La variazione registra soltanto il modello scelto: provenienza, tiratura, firma, esposizione, copertura e uso successivo. Non stima un prezzo reale.</p><p><b>Effetto:</b> ${item.edition<50?"la scarsità aumenta la contendibilità":"la tiratura ampia riduce la rarità ma può accrescere la circolazione"}; ${item.display==="museo"||item.display==="retrospettiva"?"la legittimazione istituzionale cresce":"la visibilità istituzionale resta limitata"}.</p><p><b>Limite:</b> qualità formale, storia, conflitto e valore d’uso non si lasciano ridurre a un punteggio.</p>`;
  };
  bindControls("#valueControls",{valueProvenance:{group:"value",name:"provenance"},valueRights:{group:"value",name:"rights"},valueEdition:{group:"value",name:"edition"},valueScale:{group:"value",name:"scale"},valueSignature:{group:"value",name:"signature"},valueDisplay:{group:"value",name:"display"},valueMedia:{group:"value",name:"media"},valueUse:{group:"value",name:"use"}},renderValue);renderValue();

  const atlasData={merce:"Oggetto scambiabile entro prezzo, distribuzione e lavoro; non coincide con la propria immagine.",immagine:"Costruzione che seleziona, promette ed esclude; può circolare oltre l’oggetto.",serie:"Relazione fra unità, variazione e dispositivo; non identità assoluta.",fonte:"Provenienza di disegnatori, fotografi, editori e contesti da ricostruire.",corpo:"Soggetto, posa e immagine pubblica non sono la stessa cosa.",istituzione:"Galleria, museo, rivista e mercato trasformano visibilità senza produrre da soli il senso.",geografia:"Le immagini viaggiano dentro traduzioni e squilibri; non esiste un centro neutrale.",valore:"Relazione fra lavoro, storia, scarsità, riconoscimento e desiderio; non sostanza né puro marketing."};
  $("#atlasGrid").innerHTML=Object.entries(atlasData).map(([id])=>`<button type="button" data-atlas="${id}" aria-pressed="${state.atlas.includes(id)}">${id[0].toUpperCase()+id.slice(1)}</button>`).join("");
  $$('[data-atlas]').forEach(button=>button.addEventListener("click",()=>{const id=button.dataset.atlas;state.atlas=state.atlas.includes(id)?state.atlas.filter(item=>item!==id):[...state.atlas,id];button.setAttribute("aria-pressed",String(state.atlas.includes(id)));$("#atlasResult").innerHTML=`<b>${button.textContent}</b> · ${atlasData[id]}`;save();buildSynthesis();}));

  const quiz = [
    {title:"Immagine e merce",question:"Quale distinzione è corretta?",options:["La fotografia di una merce è la merce","Merce e immagine possono condividere un marchio ma hanno produttori, canali e usi differenti","Ogni opera esposta è una pubblicità"],correct:1,explain:"Oggetto, confezione, fotografia, marchio e opera possono riferirsi alla stessa cosa senza coincidere.",hash:"#s2",recoveryQuestion:"Che cosa può fare una confezione oltre a contenere?",recoveryOptions:["Niente","Proteggere, misurare, nominare e promettere","Dimostrare le condizioni di lavoro"],recoveryCorrect:1},
    {title:"Consumo e produzione",question:"Perché il consumo non spiega da solo la Pop Art?",options:["Perché gli artisti non compravano merci","Perché condizioni economiche, media, istituzioni e scelte artistiche formano una rete non deterministica","Perché la Pop precede l’industria"],correct:1,explain:"Il boom apre possibilità e conflitti, ma non prescrive una tecnica o un significato.",hash:"#s3",recoveryQuestion:"Quale relazione evita il determinismo?",recoveryOptions:["Boom → stile obbligatorio","Condizioni ↔ istituzioni ↔ scelte ↔ ricezioni","Pubblicità = Pop"],recoveryCorrect:1},
    {title:"Pop britannica",question:"Che cosa caratterizza la prima ricerca britannica?",options:["La copia diretta di Warhol","La distanza critica e desiderante da immagini americane, design e tecnologia","Il rifiuto totale della cultura di massa"],correct:1,explain:"Paolozzi, Hamilton, Boty e Independent Group osservano una modernità mediata e importata.",hash:"#s5",recoveryQuestion:"Quale mostra del 1956 fu decisiva senza essere una scuola uniforme?",recoveryOptions:["This Is Tomorrow","The Store","Primary Structures"],recoveryCorrect:0},
    {title:"Pop statunitense",question:"Perché Warhol, Lichtenstein, Rosenquist e Oldenburg non sono equivalenti?",options:["Usano problemi e operazioni differenti dentro circuiti in parte comuni","Appartengono a secoli diversi","Soltanto uno usa immagini di massa"],correct:0,explain:"Serie, fumetto, cartellone e oggetto-scultura affrontano nodi diversi.",hash:"#s6",recoveryQuestion:"Chi lavora sulla scala frammentaria del cartellone in F-111?",recoveryOptions:["Rosenquist","Boty","Festa"],recoveryCorrect:0},
    {title:"Serialità",question:"Che cosa NON segue automaticamente dalla ripetizione?",options:["La presenza di più unità","Critica politica o celebrazione del consumo","Un rapporto fra unità e intervallo"],correct:1,explain:"Il senso della serie dipende da variazione, tecnica, contesto e uso.",hash:"#s7",recoveryQuestion:"Quale elemento può distinguere le unità di una serie?",recoveryOptions:["Errore e variazione","Nulla per definizione","Soltanto la firma"],recoveryCorrect:0},
    {title:"Originale e riproduzione",question:"Una riproduzione digitale rende l’opera completamente accessibile?",options:["Sì, conserva scala, materia e luogo","No, offre accesso visivo ma cambia dispositivo, scala e esperienza","No, perché è sempre illegale"],correct:1,explain:"Riproduzione e originale rispondono a usi differenti; legalità e fedeltà non coincidono.",hash:"#s2",recoveryQuestion:"Che cosa tende a perdere una riproduzione sullo schermo?",recoveryOptions:["Titolo","Scala e materia dell’oggetto","Ogni informazione"],recoveryCorrect:1},
    {title:"Ready-made e Pop",question:"Qual è una differenza utile?",options:["Il ready-made seleziona un oggetto; molta Pop trasforma immagini, scale e serie","Non esiste alcuna differenza","La Pop non usa oggetti"],correct:0,explain:"La scelta istituzionale resta importante, ma le operazioni non coincidono.",hash:"#s4",recoveryQuestion:"Johns e Rauschenberg vanno letti come…",recoveryOptions:["Copie di Warhol","Figure di soglia con problemi propri","Pubblicitari"],recoveryCorrect:1},
    {title:"Pubblicità",question:"Una fotografia pubblicitaria documenta semplicemente il prodotto?",options:["Sì","No: costruisce posa, promessa, destinatario ed esclusioni","Solo se è a colori"],correct:1,explain:"Pubblicità e documento hanno committenti, canali e finalità differenti.",hash:"#s2",recoveryQuestion:"Chi può partecipare alla produzione di un annuncio?",recoveryOptions:["Solo il fotografo","Fotografo, art director, copywriter e committente","Solo il consumatore"],recoveryCorrect:1},
    {title:"Fumetto e appropriazione",question:"Che cosa cambia quando Lichtenstein usa una fonte fumettistica?",options:["Nulla: è una fotocopia","Scala, ridisegno, montaggio, supporto e istituzione","Scompare ogni autore precedente"],correct:1,explain:"Trasformazione e provenienza devono essere analizzate insieme.",hash:"#s9",recoveryQuestion:"La fonte principale di Whaam! è associata a…",recoveryOptions:["Irv Novick","Andy Warhol","Lawrence Alloway"],recoveryCorrect:0},
    {title:"Lavoro invisibile",question:"Perché nominare fumettisti, grafici e fotografi?",options:["Per negare ogni trasformazione artistica","Per ricostruire la catena produttiva e le asimmetrie di attribuzione","Perché sono sempre proprietari dei diritti"],correct:1,explain:"Lavoro, diritto, attribuzione e valore sono piani connessi ma distinti.",hash:"#s9",recoveryQuestion:"Chi può trasformare una tavola prima dell’artista?",recoveryOptions:["Editore e stampatore","Nessuno","Soltanto il museo"],recoveryCorrect:0},
    {title:"Celebrità e corpo",question:"Che differenza c’è fra soggetto e immagine pubblica?",options:["Nessuna","L’immagine pubblica è una costruzione ripetuta che non esaurisce la persona","Il soggetto controlla sempre ogni uso"],correct:1,explain:"Fotografia, stampa, posa e ricezione mediano il corpo celebre.",hash:"#s10",recoveryQuestion:"Nel Marilyn Diptych la ripetizione può rendere visibili insieme…",recoveryOptions:["Celebrità e vulnerabilità","Solo bellezza","Solo tecnica"],recoveryCorrect:0},
    {title:"Artiste e genere",question:"Perché Boty, Marisol e Drexler non vanno isolate in un riquadro?",options:["Perché fanno tutte la stessa arte","Perché cambiano dall’interno i problemi di desiderio, ruolo, violenza e spettatore","Perché non lavorano con immagini di massa"],correct:1,explain:"La loro presenza modifica la struttura interpretativa, non completa una lista.",hash:"#s10",recoveryQuestion:"Chi unisce blocchi, disegno e oggetti trovati nella figura sociale?",recoveryOptions:["Marisol","Rosenquist","Indiana"],recoveryCorrect:0},
    {title:"Pop italiana",question:"Che cosa distingue la ricerca italiana?",options:["La copia dei modelli americani","L’intreccio di marchi, manifesti, cinema, tradizione, città e memoria politica","L’assenza di cultura di massa"],correct:1,explain:"Rotella, Schifano, Festa e Angeli trasformano fonti dentro contesti italiani differenti.",hash:"#s11",recoveryQuestion:"Chi lavora sul manifesto strappato e il décollage?",recoveryOptions:["Rotella","Indiana","Johns"],recoveryCorrect:0},
    {title:"Geografia policentrica",question:"Perché “Pop globale” può essere fuorviante?",options:["Perché esiste solo New York","Perché può cancellare traduzioni, squilibri e categorie locali","Perché nessuna immagine viaggia"],correct:1,explain:"Parigi, Düsseldorf, Tokyo e America Latina non sono periferie equivalenti di un modello unico.",hash:"#s11",recoveryQuestion:"Quale formulazione è più precisa?",recoveryOptions:["Esportazione identica","Rete di traduzioni situate","Stile universale"],recoveryCorrect:1},
    {title:"Mercato e istituzioni",question:"Il valore dell’opera è tutto marketing?",options:["Sì","No: è relazionale, ma comprende anche lavoro, storia, provenienza, scarsità e riconoscimento","È una proprietà fisica invisibile"],correct:1,explain:"Galleria e museo contano senza esaurire forma, storia e uso.",hash:"#s12",recoveryQuestion:"Quale fattore NON basta da solo a determinare valore e senso?",recoveryOptions:["La firma","La rete completa","La provenienza studiata"],recoveryCorrect:0},
    {title:"Ambiguità critica",question:"La Pop Art denuncia o desidera la merce?",options:["La denuncia sempre","La celebra sempre","Può fare entrambe le cose e funzionare nello stesso circuito che osserva"],correct:2,explain:"L’ambiguità fra attrazione, distanza, museo, mercato e celebrità è il problema, non un difetto da eliminare.",hash:"#s13",recoveryQuestion:"Quale conclusione evita una morale prefabbricata?",recoveryOptions:["Pop = capitalismo","Pop = rivoluzione","Operazione, contesto e uso successivo possono entrare in conflitto"],recoveryCorrect:2}
  ];
  const renderQuiz=()=>{
    if(state.quiz.mastered.length===16){state.quiz.current=15;state.quiz.recovery=false;}
    const item=quiz[state.quiz.current],recovery=state.quiz.recovery,question=recovery?item.recoveryQuestion:item.question,options=recovery?item.recoveryOptions:item.options;
    $("#quizCard").innerHTML=`<fieldset><legend><span class="quiz-index">${state.quiz.current+1} / 16 · ${item.title}${recovery?" · recupero":""}</span><br>${question}</legend><div class="answers">${options.map((option,index)=>`<button type="button" data-answer="${index}">${option}</button>`).join("")}</div></fieldset>`;
    $$('[data-answer]').forEach(button=>button.addEventListener("click",()=>answerQuiz(Number(button.dataset.answer))));
    $("#masteryCount").textContent=`${state.quiz.mastered.length} / 16 nuclei`;$("#masteryBar").style.width=`${state.quiz.mastered.length/16*100}%`;$("#quizComplete").hidden=state.quiz.mastered.length!==16;
  };
  const answerQuiz=index=>{
    const item=quiz[state.quiz.current],correct=state.quiz.recovery?item.recoveryCorrect:item.correct,feedback=$("#quizFeedback");
    if(index===correct){
      if(!state.quiz.mastered.includes(state.quiz.current))state.quiz.mastered.push(state.quiz.current);state.quiz.mastered.sort((a,b)=>a-b);state.quiz.recovery=false;save();
      feedback.innerHTML=`<div class="quiz-feedback correct"><b>Corretto.</b> ${item.explain}</div><button class="secondary" id="nextQuestion" type="button">Nucleo successivo</button>`;
      $("#nextQuestion").addEventListener("click",()=>{const next=quiz.findIndex((_,i)=>!state.quiz.mastered.includes(i));state.quiz.current=next===-1?15:next;feedback.innerHTML="";renderQuiz();});
      $("#masteryCount").textContent=`${state.quiz.mastered.length} / 16 nuclei`;$("#masteryBar").style.width=`${state.quiz.mastered.length/16*100}%`;$("#quizComplete").hidden=state.quiz.mastered.length!==16;buildSynthesis();
    } else {
      state.quiz.recovery=true;save();feedback.innerHTML=`<div class="quiz-feedback"><b>Non ancora.</b> ${item.explain}</div><div class="micro-lesson"><b>Microlezione di recupero</b><p>${item.explain} L’errore rende equivalenti categorie diverse o trasforma una relazione storica in automatismo.</p><a href="${item.hash}">Ripassa la sezione</a> · <button id="recoveryQuestion" type="button">Apri una domanda diversa</button></div>`;$("#recoveryQuestion").addEventListener("click",()=>{feedback.innerHTML="";renderQuiz();});
    }
  }; renderQuiz();

  function buildSynthesis(){
    const facts=[];if(state.markers.length)facts.push(`hai osservato ${state.markers.length} marcatori del negozio`);if(state.imageType!=="oggetto")facts.push(`hai confrontato “${imageTypes[state.imageType].label}” con l’oggetto`);if(state.timeline)facts.push(`hai aperto il nodo ${timelineData[state.timeline]?.[0]}`);if(state.condition)facts.push(`hai interrogato “${conditionData[state.condition]?.[0]}”`);if(state.precedent!=="cubismo")facts.push(`hai confrontato ${precedentData[state.precedent]?.label}`);if(JSON.stringify(state.collage)!==JSON.stringify(collageDefaults))facts.push("hai modificato la grammatica del collage commerciale");if(state.london!=="paolozzi")facts.push(`hai approfondito ${londonData[state.london]?.[0]}`);if(state.system)facts.push(`hai interrogato il nodo ${systemData[state.system]?.[0]}`);if(JSON.stringify(state.serial)!==JSON.stringify(serialDefaults))facts.push("hai trasformato numero, variazione o distanza della serie");if(JSON.stringify(state.object)!==JSON.stringify(objectDefaults))facts.push("hai cambiato materiale, scala o collocazione dell’oggetto");if(state.provenance)facts.push(`hai seguito la tappa “${provenanceData[state.provenance]?.[0]}”`);if(state.sourceCompare!=="fonte")facts.push(`hai confrontato il livello “${sourceData[state.sourceCompare]?.[0]}”`);if(state.body!=="warhol"||state.lens!=="soggetto")facts.push(`hai letto ${bodyData[state.body]?.label} con la lente “${state.lens}”`);if(state.world)facts.push(`hai aperto il centro ${worldData[state.world]?.label}`);if(state.italy)facts.push(`hai interrogato ${italyData[state.italy]?.[0]}`);if(JSON.stringify(state.value)!==JSON.stringify(valueDefaults))facts.push("hai ricombinato il circuito del valore");if(state.atlas.length)facts.push(`hai collegato ${state.atlas.length} voci dell’atlante`);if(state.quiz.mastered.length)facts.push(`hai padroneggiato ${state.quiz.mastered.length} nuclei su 16`);
    let text=facts.length?`Nel percorso ${facts.join("; ")}. `:"Hai visitato il modulo senza completare ancora attività registrate. ";if(state.notes.initial.trim())text+="Hai scritto una prima ipotesi. ";if(state.notes.final.trim())text+="Hai formulato una seconda lettura. ";text+=`Hai attraversato ${state.visitedSections.length} sezioni. Questa sintesi registra azioni e testi: non attribuisce emozioni, opinioni o apprendimento non verificato.`;$("#personalSynthesis").textContent=text;
  }
  $("#buildSynthesis").addEventListener("click",buildSynthesis);buildSynthesis();

  const dialog=$("#lightbox"),lightImg=$("#lightboxImage"),caption=$("#lightboxCaption"),viewport=$(".lightbox-viewport",dialog);let returnFocus=null,zoom=1;
  const setZoom=value=>{zoom=Math.max(.5,Math.min(4,value));lightImg.style.width=`${zoom*100}%`;$("#zoomReset").textContent=`${Math.round(zoom*100)}%`;};
  $$('.view-art').forEach(button=>button.addEventListener("click",()=>{returnFocus=button;lightImg.src=button.dataset.image;lightImg.alt=button.querySelector("img")?.alt||button.dataset.caption||"Immagine ingrandita";caption.textContent=button.dataset.caption||"Immagine ingrandita";setZoom(1);viewport.scrollTo(0,0);dialog.showModal();$("#lightboxClose").focus();}));
  $("#lightboxClose").addEventListener("click",()=>dialog.close());$("#zoomIn").addEventListener("click",()=>setZoom(zoom+.25));$("#zoomOut").addEventListener("click",()=>setZoom(zoom-.25));$("#zoomReset").addEventListener("click",()=>setZoom(1));dialog.addEventListener("close",()=>{lightImg.src="";returnFocus?.focus();});dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});dialog.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();dialog.close();return;}if(event.key!=="Tab")return;const list=$$('button:not([disabled])',dialog),first=list[0],last=list.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
  const resets={collage:()=>{state.collage=clone(collageDefaults);renderCollage();},serial:()=>{state.serial=clone(serialDefaults);renderSerial();},object:()=>{state.object=clone(objectDefaults);renderObject();},value:()=>{state.value=clone(valueDefaults);renderValue();}};
  $$('[data-reset]').forEach(button=>button.addEventListener("click",()=>{resets[button.dataset.reset]?.();save();buildSynthesis();}));
  $("#resetAll").addEventListener("click",()=>{if(!confirm("Vuoi cancellare note, attività e verifica del solo modulo 22? L’azione non può essere annullata."))return;state=defaults();if(storageOK)try{localStorage.removeItem(KEY);}catch{}location.reload();});
  window.__storiaSguardo22 = { normalize, defaults, quiz:clone(quiz), evaluate:(index,recovery,answer)=>answer===(recovery?quiz[index].recoveryCorrect:quiz[index].correct) };
  if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
})();
