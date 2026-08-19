(() => {
  "use strict";
  const KEY = "storia-sguardo-16-state";
  const VERSION = 1;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const defaults = () => ({version:VERSION,visited:[],notes:{initial:"",final:"",general:""},markers:[],shift:"",timeline:"",network:"",term:"parola",pressure:{tilt:0,compress:50,scale:100,fracture:20,rhythm:3,contrast:50,distance:50,overlap:0},evidence:{},gaze:"",score:Array(12).fill(0),body:"",power:0,compare:"spazio",exchange:"",atlas:"cezanne",quiz:{mastered:[],current:0,recovery:false},preferences:{zoom:1}});
  let storageOK = true;
  let state = defaults();
  const clone = value => JSON.parse(JSON.stringify(value));
  const merge = (base, loaded) => {
    const out = clone(base);
    if (!loaded || loaded.version !== VERSION) return out;
    Object.keys(out).forEach(key => {
      if (loaded[key] === undefined) return;
      if (out[key] && typeof out[key] === "object" && !Array.isArray(out[key])) out[key] = {...out[key], ...loaded[key]};
      else out[key] = loaded[key];
    });
    return out;
  };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = merge(defaults(), JSON.parse(raw));
    localStorage.setItem(`${KEY}-probe`, "1"); localStorage.removeItem(`${KEY}-probe`);
  } catch (error) { storageOK = false; state = defaults(); }
  if (!storageOK) $("#storageWarning").hidden = false;
  let saveTimer;
  const save = () => {
    if (!storageOK) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (error) { storageOK = false; $("#storageWarning").hidden = false; } }, 120);
  };

  // Menu, focus trap e avanzamento
  const sideNav = $("#sideNav"), menuToggle = $("#menuToggle"), menuClose = $("#menuClose"), scrim = $("#scrim");
  let menuReturn = null;
  const menuFocusables = () => $$("a,button:not([disabled])", sideNav);
  const openMenu = () => { menuReturn = document.activeElement; sideNav.inert = false; sideNav.classList.add("open"); sideNav.setAttribute("aria-hidden","false"); menuToggle.setAttribute("aria-expanded","true"); scrim.hidden = false; document.body.style.overflow = "hidden"; menuClose.focus(); };
  const closeMenu = () => { sideNav.classList.remove("open"); sideNav.setAttribute("aria-hidden","true"); sideNav.inert = true; menuToggle.setAttribute("aria-expanded","false"); scrim.hidden = true; document.body.style.overflow = ""; if (menuReturn) menuReturn.focus(); };
  menuToggle.addEventListener("click", openMenu); menuClose.addEventListener("click", closeMenu); scrim.addEventListener("click", closeMenu);
  sideNav.addEventListener("click", event => { if (event.target.closest("a")) closeMenu(); });
  sideNav.addEventListener("keydown", event => { if (event.key !== "Tab") return; const list = menuFocusables(), first = list[0], last = list.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && sideNav.classList.contains("open")) closeMenu(); });
  const updateProgress = () => {
    const count = new Set(state.visited).size;
    $("#progressBar").style.width = `${Math.round((count / 13) * 100)}%`;
    $$(".side-nav li").forEach((li,index) => li.classList.toggle("visited", state.visited.includes(index + 1)));
  };
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { const n = Number(entry.target.dataset.section); if (!state.visited.includes(n)) { state.visited.push(n); state.visited.sort((a,b)=>a-b); save(); updateProgress(); } } }), {threshold:.28});
  $$('[data-section]').forEach(section => observer.observe(section)); updateProgress();

  // Taccuini
  const bindNote = (id,key) => { const el = $(id); el.value = state.notes[key] || ""; el.addEventListener("input", () => { state.notes[key] = el.value; save(); if (key === "initial") renderEcho(); }); };
  bindNote("#initialNote","initial"); bindNote("#finalNote","final"); bindNote("#generalNote","general");
  const markerInfo = {
    cielo:["Linee del cielo","Le fasce curve non seguono la fuga del ponte: attraversano il paesaggio come un campo continuo."],
    ponte:["Ponte e profondità","La balaustra costruisce una fuga rigida e obliqua. È un asse stabile, ma separa anche figura e paesaggio."],
    figura:["Figura, mani, bocca, occhi","Il volto è frontale e schematico; le mani prolungano il contorno della testa. Non sappiamo ancora se emetta o ascolti un suono."],
    passanti:["Le due figure lontane","Seguono il ponte e sembrano estranee al ritmo ondulato. La distanza è anche una relazione sociale."]
  };
  const renderMarkers = () => {
    $$("[data-marker]").forEach(button => button.setAttribute("aria-pressed", String(state.markers.includes(button.dataset.marker))));
    const last = state.markers.at(-1), readout = $("#markerReadout");
    readout.innerHTML = last ? `<b>${markerInfo[last][0]}</b><p>${markerInfo[last][1]}</p>` : "<b>Scegli una zona</b><p>I marcatori guidano l’osservazione, non assegnano un significato.</p>";
    renderEcho();
  };
  $$("[data-marker]").forEach(button => button.addEventListener("click", () => { const key=button.dataset.marker; state.markers = state.markers.includes(key) ? state.markers.filter(x=>x!==key) : [...state.markers,key]; save(); renderMarkers(); }));
  function renderEcho(){ $("#initialEcho").textContent = state.notes.initial.trim() || "Non hai ancora scritto un’ipotesi iniziale."; $("#markerEcho").textContent = state.markers.length ? `Zone osservate: ${state.markers.map(x=>markerInfo[x][0].toLowerCase()).join(", ")}.` : "Non hai usato i marcatori iniziali."; }
  renderMarkers();

  // Confronto modulo 15
  const shiftData = {
    spazio:"Nella Camera lo spazio è costruito da oggetti e contorni che rendono abitabile una relazione vissuta; nell’Urlo la fuga del ponte e le onde del paesaggio esercitano pressioni differenti sulla figura.",
    colore:"Van Gogh dichiarò in lettera l’intenzione di costruire riposo attraverso relazioni cromatiche. In Munch il colore unifica figura, fiordo e cielo in una tensione; nessuna tinta possiede da sola un significato universale.",
    ricezione:"Van Gogh e Munch furono selezionati e riletti dagli artisti tedeschi. Influenza non significa causa unica: ogni gruppo trasformò ciò che riceveva.",
    conflitto:"Il passaggio non va da realtà a emozione, ma dalla trasformazione consapevole del visibile alla domanda su dove si trovi il conflitto: nella figura, nello spazio o nella relazione con chi guarda."
  };
  const renderShift=()=>{ $$("#shiftChoices button").forEach(b=>b.classList.toggle("active",b.dataset.shift===state.shift)); $("#shiftResult").textContent=state.shift?shiftData[state.shift]:"Scegli una categoria per confrontare le due opere."; };
  $$("#shiftChoices button").forEach(b=>b.addEventListener("click",()=>{state.shift=b.dataset.shift;save();renderShift();})); renderShift();

  // Cronologia e reti
  const timelineData={
    1892:["Munch e Berlino","La mostra berlinese del 1892 venne chiusa dopo forti proteste ma rese Munch centrale nel dibattito tedesco. Nel 1893 la versione dipinta dell’Urlo fu esposta come Disperazione.","La ricezione tedesca non fa di Munch il fondatore di un gruppo che ancora non esisteva."],
    1905:["Die Brücke","Fritz Bleyl, Erich Heckel, Ernst Ludwig Kirchner e Karl Schmidt-Rottluff fondarono il gruppo a Dresda il 7 giugno.","La data fonda un’associazione, non un unico inizio mondiale dell’Espressionismo."],
    1909:["NKVM","Werefkin, Jawlensky, Kandinsky, Münter e altri parteciparono alla Neue Künstlervereinigung München, rete internazionale precedente alla scissione del Blaue Reiter.","Le associazioni comprendono lavoro teorico e organizzativo spesso cancellato dalle narrazioni individualiste."],
    1911:["Blaue Reiter e Der Sturm","La prima mostra della redazione del Blaue Reiter aprì a Monaco nel dicembre 1911. Riviste e gallerie collegavano Monaco, Berlino, Parigi e Russia.","Non era un movimento con tessera, manifesto e stile condiviso."],
    1912:["Un almanacco plurale","Kandinsky e Marc pubblicarono l’almanacco nel maggio 1912: musica, immagini di epoche e culture differenti, testi non riducibili a un programma unitario.","L’apertura internazionale restava dentro categorie europee e coloniali."],
    1913:["Scioglimento della Brücke","Il gruppo si sciolse dopo tensioni sulla cronaca redatta da Kirchner; i percorsi individuali continuarono.","Lo scioglimento non chiude l’Espressionismo come etichetta critica."],
    1914:["Guerra e fratture","Artisti si arruolarono, furono richiamati, morirono o cambiarono posizione. Marc e Macke morirono al fronte; Kollwitz elaborò il lutto e il pacifismo.","La guerra radicalizza e interrompe ricerche già esistenti: non genera automaticamente la deformazione."],
    1937:["Entartete Kunst","Il nazismo confiscò oltre ventimila opere moderne; una selezione fu esposta a Monaco per guidare il pubblico al disprezzo.","“Degenerata” non è una qualità estetica: è una categoria repressiva costruita dal potere."]
  };
  const renderTimeline=()=>{ $$("#timeline button").forEach(b=>b.classList.toggle("active",b.dataset.year===state.timeline)); const d=timelineData[state.timeline]; $("#timelineDetail").innerHTML=d?`<h3>${d[0]}</h3><p>${d[1]}</p><p><strong>Limite:</strong> ${d[2]}</p>`:"<p>Scegli una data: appariranno insieme evento, condizione e limite dell’interpretazione.</p>"; };
  $$("#timeline button").forEach(b=>b.addEventListener("click",()=>{state.timeline=b.dataset.year;save();renderTimeline();})); renderTimeline();
  const networkData={metropoli:"Tram, grandi magazzini, illuminazione, stampa e folla trasformano velocità e anonimato. Non prescrivono però una forma: Kirchner sceglie compressione e contorni angolari.",istituzioni:"Secessioni, associazioni, riviste, gallerie e collezionisti rendono le opere visibili. Il canone nasce anche da chi espone, compra, conserva e scrive.",gruppi:"Brücke e Blaue Reiter condividono rifiuti e scambi, ma hanno organizzazioni, luoghi e problemi diversi.",colonie:"Oggetti non europei entrano nei musei etnografici e negli atelier dentro rapporti coloniali. L’appropriazione formale non cancella questa asimmetria.",guerra:"La guerra produce arruolamento, morte, lutto e propaganda, ma incontra linguaggi già costruiti prima del 1914.",musei:"Il museo può conservare e legittimare; lo Stato nazista mostrò anche il rovescio: confiscare, riclassificare e usare l’esposizione come arma."};
  const renderNetwork=()=>{$$("#historyNetwork button").forEach(b=>b.classList.toggle("active",b.dataset.node===state.network));$("#networkText").textContent=state.network?networkData[state.network]:"Attiva un nodo per leggere relazioni e limiti."};
  $$("#historyNetwork button").forEach(b=>b.addEventListener("click",()=>{state.network=b.dataset.node;save();renderNetwork();}));renderNetwork();

  // Mappa del termine
  const termData={
    parola:["1910: una parola contesa","Il termine fu popolarizzato intorno al 1910 da autori fra cui Antonín Matějček e Herwarth Walden. Le ricostruzioni non concordano sempre su un unico “inventore”: conta la rapida circolazione come opposizione critica all’Impressionismo.","Una parola critica non coincide con un movimento organizzato."],
    brucke:["Die Brücke · Dresda 1905–Berlino 1913","Fu un gruppo organizzato con programma, mostre, soci sostenitori e intensa pratica grafica. Corpo, natura e metropoli non formano però una formula invariabile.","Gruppo reale ≠ intero Espressionismo."],
    reiter:["Der Blaue Reiter · Monaco 1911–12","Fu una redazione, due mostre e un almanacco più che un’associazione stabile. Riunì posizioni diverse su spiritualità, musica, figurazione e astrazione.","Pluralità condivisa ≠ tecnica comune."],
    vienna:["Vienna · Schiele e Kokoschka","Non appartennero ai due gruppi tedeschi. Ritratto, nudo e teatro del corpo interrogano identità e norme nella cultura viennese.","Somiglianza formale ≠ stessa organizzazione."],
    canone:["Un’etichetta costruita anche dopo","Musei e manuali collegano Munch, gruppi tedeschi, area austriaca, grafica, cinema, teatro e letteratura. La mappa è utile se rende visibili le differenze e chi è stato escluso.","Canone ≠ elenco naturale e definitivo."]
  };
  const renderTerm=()=>{ $$("[data-term]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.term===state.term))); const d=termData[state.term]; $("#termPanel").innerHTML=`<h3>${d[0]}</h3><p>${d[1]}</p><p class="tagline">${d[2]}</p><ul><li>non un’unica tavolozza;</li><li>non una teoria universale della psiche;</li><li>non una marcia inevitabile verso l’astrazione.</li></ul>`; };
  $$("[data-term]").forEach(b=>b.addEventListener("click",()=>{state.term=b.dataset.term;save();renderTerm();}));renderTerm();

  // Laboratorio pressione
  const controlNames={tilt:"°",compress:"%",scale:"%",fracture:"%",rhythm:"",contrast:"%",distance:"%",overlap:""};
  const pressureDefaults=defaults().pressure;
  const pressureText=()=>{
    const p=state.pressure, high=[];
    if(Math.abs(p.tilt)>7) high.push("lo spazio perde stabilità"); if(p.compress>68) high.push("il campo comprime le figure"); if(p.scale>125) high.push("la figura riduce il margine dell’ambiente"); if(p.fracture>60) high.push("il contorno interrompe la continuità"); if(p.rhythm>5) high.push("la ripetizione accelera il ritmo"); if(p.contrast>75) high.push("i campi si separano nettamente"); if(p.distance<28) high.push("lo spettatore è spinto vicino"); if(Math.abs(p.overlap)>30) high.push("le figure perdono distanza reciproca");
    return `<article><h3>Che cosa cambia</h3><p>${high.length?high.join("; ")+".":"La scena conserva ancora un equilibrio relativo fra figure e spazio."}</p></article><article><h3>Che cosa guadagni / sacrifichi</h3><p>Rendi più leggibile una relazione, ma perdi stabilità, profondità o autonomia delle singole figure. Nessun guadagno è gratuito.</p></article><article><h3>Che cosa non puoi dedurre</h3><p>Una deformazione maggiore non rende automaticamente la scena “più espressiva” e non permette alcuna diagnosi. Hai costruito una tensione fra figura, spazio, colore e sguardo.</p></article>`;
  };
  const renderPressure=()=>{const p=state.pressure,stage=$("#pressureStage"); stage.style.setProperty("--tilt",`${p.tilt}deg`);stage.style.setProperty("--compressScale",.55+p.compress/100);stage.style.setProperty("--scale",p.scale/100);stage.style.setProperty("--fractureA",`${p.fracture*.16}%`);stage.style.setProperty("--fractureB",`${p.fracture*.12}%`);stage.style.setProperty("--fractureC",`${p.fracture*.08}%`);stage.style.setProperty("--gap",`${Math.max(4,38/p.rhythm)}px`);stage.style.setProperty("--gapEnd",`${Math.max(6,45/p.rhythm)}px`);stage.style.setProperty("--lineOpacity",.25+p.contrast/200);stage.style.setProperty("--distance",.7+p.distance/170);stage.style.setProperty("--overlap",`${p.overlap}px`); Object.entries(p).forEach(([k,v])=>{const input=$(`#${k}`),out=input?.closest("label")?.querySelector("output");if(input)input.value=v;if(out)out.value=`${v}${controlNames[k]}`});$("#pressureAnalysis").innerHTML=pressureText();};
  $$("#pressureControls input").forEach(input=>input.addEventListener("input",()=>{state.pressure[input.name]=Number(input.value);save();renderPressure();})); renderPressure();

  // Evidenze Munch
  const evidence=[
    ["Il ponte crea una fuga prospettica.","visibile"],["Munch descrisse una passeggiata con due amici.","documentato"],["Il paesaggio partecipa alla tensione.","interpretato"],["La figura rappresenta una precisa diagnosi clinica.","non"],["Il colore possiede un significato psicologico universale.","non"]
  ];
  const renderEvidence=()=>{const host=$("#evidenceStatements");host.innerHTML=evidence.map((item,i)=>`<label class="evidence-row ${state.evidence[i]?(state.evidence[i]===item[1]?"correct":"wrong"):""}"><span>${item[0]}</span><select data-evidence="${i}" aria-label="Classifica: ${item[0]}"><option value="">Scegli…</option><option value="visibile" ${state.evidence[i]==="visibile"?"selected":""}>Visibile</option><option value="documentato" ${state.evidence[i]==="documentato"?"selected":""}>Documentato</option><option value="interpretato" ${state.evidence[i]==="interpretato"?"selected":""}>Interpretato</option><option value="non" ${state.evidence[i]==="non"?"selected":""}>Non dimostrabile</option></select></label>`).join(""); $$("select",host).forEach(s=>s.addEventListener("change",()=>{state.evidence[s.dataset.evidence]=s.value;save();renderEvidence();})); const done=Object.keys(state.evidence).filter(k=>state.evidence[k]).length,good=evidence.filter((x,i)=>state.evidence[i]===x[1]).length;$("#evidenceScore").textContent=done?`${good} classificazioni corrette su ${done}. Il dato visivo non coincide con la sua spiegazione.`:"";};renderEvidence();

  // Sguardo metropolitano
  const gazeData={segue:"Seguendo il flusso condividi direzione e velocità della folla, ma i volti restano reciprocamente estranei.",ostacola:"Se ostacoli il passaggio, le figure sembrano avanzare verso di te: la superficie diventa una pressione fisica.",osserva:"Da fuori rischi di trasformare persone e differenze sociali in spettacolo urbano.",osservato:"Se sei osservato, i volti schematici non sono più oggetti: restituiscono lo sguardo e complicano la tua sicurezza."};
  const renderGaze=()=>{$$("#gazeChoices button").forEach(b=>b.classList.toggle("active",b.dataset.gaze===state.gaze));$("#gazeResult").textContent=state.gaze?gazeData[state.gaze]:"Nessuna posizione è neutra: scegli dove collocarti."}; $$("#gazeChoices button").forEach(b=>b.addEventListener("click",()=>{state.gaze=b.dataset.gaze;save();renderGaze();}));renderGaze();

  // Spartito
  const scoreLabels=["pausa","impulso","contrasto","addensamento"];
  const renderScore=()=>{const host=$("#visualScore");host.innerHTML=state.score.map((v,i)=>`<button type="button" data-cell="${i}" data-state="${v}" aria-label="Cella ${i+1}: ${scoreLabels[v]}"></button>`).join(""); $$("button",host).forEach(b=>b.addEventListener("click",()=>{const i=Number(b.dataset.cell);state.score[i]=(state.score[i]+1)%4;save();renderScore();})); const counts=scoreLabels.map((_,i)=>state.score.filter(x=>x===i).length);const transitions=state.score.slice(1).filter((x,i)=>x!==state.score[i]).length;$("#scoreText").textContent=`Lo spartito contiene ${counts[0]} pause, ${counts[1]} impulsi, ${counts[2]} contrasti e ${counts[3]} addensamenti; ${transitions} cambi di intensità. Non hai illustrato un’emozione: hai organizzato intervalli e relazioni.`;};renderScore();

  // Corpo
  const bodyData={visibile:"È un dato osservabile: descrive orientamento e direzione dello sguardo senza spiegare una causa.",posa:"È una lettura formale verificabile nel rapporto tra parti; mostra che la tensione è costruita.",fonte:"È un dato documentato dalla scheda del Leopold Museum.",ipotesi:"È un’ipotesi non dimostrabile dalla sola immagine. Intensità del volto e diagnosi o emozione certa non coincidono."};
  const renderBody=()=>{$$("#bodyCards button").forEach(b=>b.classList.toggle("active",b.dataset.body===state.body));$("#bodyResult").textContent=state.body?bodyData[state.body]:"Tocca una frase per verificarne il livello."}; $$("#bodyCards button").forEach(b=>b.addEventListener("click",()=>{state.body=b.dataset.body;save();renderBody();}));renderBody();

  // Potere
  const powerTexts=["Il museo rende l’opera parte di una memoria pubblica, ma ogni collezione è già una selezione.","Nel 1937 commissioni naziste rimossero migliaia di opere moderne dalle collezioni pubbliche.","La mostra Entartete Kunst accostò opere, prezzi e scritte derisorie per imporre una lettura politica.","L’allestimento non lasciava lo spettatore libero: costruiva il disgusto come comportamento collettivo.","Opere furono vendute all’estero, scambiate, disperse o distrutte. La condanna pubblica conviveva con lo sfruttamento economico."];
  const renderPower=()=>{$$("#powerChain button").forEach((b,i)=>{b.disabled=i>state.power;b.classList.toggle("completed",i<state.power);});$("#powerDetail").textContent=state.power?powerTexts[state.power-1]:"Nel 1937 il regime nazista confiscò più di ventimila opere moderne dai musei tedeschi. Inizia dalla prima tappa."}; $$("#powerChain button").forEach(b=>b.addEventListener("click",()=>{const n=Number(b.dataset.step);if(n===state.power+1)state.power=n;else if(n<=state.power)state.power=n;save();renderPower();}));renderPower();

  // Comparatore e reti
  const compareData={
    spazio:["onde che legano figura e paesaggio","strada compressa verso la superficie","campi e intervalli senza profondità unica","vuoto come pressione sul corpo","nero che salda il gruppo"],
    colore:["relazione fra cielo, fiordo e figura","campi rosa, verdi e blu antinaturalistici","ritmo fra masse e segni, non codice fisso","contrappesi rossi, scuri e pallidi","assenza di colore: contrasto xilografico"],
    corpo:["figura schematica e frontale","corpi urbani seriali e differenziati","coppie appena riconoscibili dentro le relazioni","posa precisa, taglio e autorappresentazione","corpi stretti in una difesa collettiva"],
    societa:["isolamento moderno e ricezione pubblica","classe, genere, moda e metropoli","rete internazionale, spiritualità e mercato","norme del corpo nella Vienna moderna","lutto, pacifismo e memoria della guerra"],
    spettatore:["la figura ci affronta","la folla invade il nostro spazio","cerchiamo appigli dentro un campo instabile","lo sguardo laterale ci misura","siamo fuori dal cerchio protettivo"],
    spiritualita:["natura attraversata da un grido narrato","utopia di libertà del gruppo, non fede unica","ricerca documentata dello spirituale nell’arte","identità corporea, non programma religioso","etica della cura e del lutto"],
    guerra:["opera anteriore al 1914, letta poi come crisi","linguaggio precedente, percorsi trasformati dalla guerra","gruppo disperso; Marc e Macke muoiono al fronte","Schiele muore nel 1918 per influenza, non in combattimento","lutto personale trasformato in forma pubblica pacifista"],
    canone:["riferimento precedente assunto retrospettivamente","gruppo, manifesto, soci e musei","mostre, almanacco, artiste, collezionisti","area austriaca accostata criticamente","voce autonoma che complica il racconto dei gruppi"]
  };
  const compareNames=["Munch","Kirchner / Brücke","Kandinsky / Blaue Reiter","Schiele / Vienna","Kollwitz"];
  const renderCompare=()=>{ $("#compareCategory").value=state.compare; $("#compareGrid").innerHTML=compareNames.map((n,i)=>`<article class="compare-card"><h3>${n}</h3><p>${compareData[state.compare][i]}</p></article>`).join(""); $("#compareSynthesis").innerHTML=`<b>Somiglianza reale</b><p>Tutte le ricerche trasformano relazioni visibili.</p><b>Differenza decisiva</b><p>${state.compare==="colore"?"Il colore può essere acceso, relazionale o perfino assente.":"La stessa categoria risponde a problemi e istituzioni differenti."}</p><b>Rischio</b><p>Scambiare una somiglianza per una formula o per una genealogia inevitabile.</p>`;}; $("#compareCategory").addEventListener("change",e=>{state.compare=e.target.value;save();renderCompare();});renderCompare();
  const exchangeData={munch:"La mostra berlinese del 1892 e le esposizioni successive resero Munch un riferimento; la ricezione tedesca selezionò alcune opere e ne cambiò il peso storico.",vangogh:"Van Gogh e Gauguin furono riletti attraverso mostre, riproduzioni e collezioni. Nessuna influenza consegna già pronto il linguaggio successivo.",munich:"Werefkin, Jawlensky, Kandinsky, Münter, Marc, Epstein e i Delaunay collegano Monaco a Russia e Parigi: il Blaue Reiter è una rete, non una nazione chiusa.",women:"Werefkin contribuì a fondare e teorizzare; Münter dipinse, organizzò, conservò e donò; Epstein attivò collegamenti internazionali. Il canone separava attività che nella pratica erano unite.",market:"Der Sturm, gallerie, collezionisti e musei costruirono pubblico e valore. La ribellione all’accademia aveva comunque bisogno di infrastrutture.",colonial:"Oggetti e persone provenienti da territori colonizzati furono esposti, appropriati e classificati da istituzioni europee. Lo scambio non era paritario."};
  const renderExchange=()=>{$$("#exchangeNetwork button").forEach(b=>b.classList.toggle("active",b.dataset.exchange===state.exchange));$("#exchangeText").textContent=state.exchange?exchangeData[state.exchange]:"Seleziona uno scambio: ogni freccia porta anche un’asimmetria."}; $$("#exchangeNetwork button").forEach(b=>b.addEventListener("click",()=>{state.exchange=b.dataset.exchange;save();renderExchange();}));renderExchange();

  // Atlante
  const atlasData={
    cezanne:["Cézanne","Costruire la durata dell’osservazione","Guadagno: rende visibili rapporti strutturali. Costo: sacrifica la coerenza di un unico colpo d’occhio."],
    vangogh:["Van Gogh","Rendere vissuto uno spazio reale","Guadagno: colore e contorno fanno percepire la relazione con il luogo. Costo: l’apparenza ottica non resta neutra."],
    gauguin:["Gauguin","Costruire simbolo e memoria","Guadagno: separa esperienza e dato immediato. Costo: può coprire voci e realtà coloniali con un mito europeo."],
    munch:["Munch","Legare figura, paesaggio e spettatore","Guadagno: il conflitto attraversa l’intera immagine. Costo: la figura perde identità individuale definita."],
    kirchner:["Kirchner","Comprimere la metropoli sulla superficie","Guadagno: folla e isolamento diventano simultanei. Costo: i corpi rischiano di diventare tipi."],
    kandinsky:["Kandinsky","Organizzare relazioni oltre la descrizione","Guadagno: ritmo, intervallo e spiritualità diventano problema visivo. Costo: il referente si fa instabile."],
    schiele:["Schiele","Fare della posa una costruzione dell’identità","Guadagno: il corpo restituisce lo sguardo. Costo: la lettura può scivolare nella diagnosi retrospettiva."],
    kollwitz:["Kollwitz","Trasformare lutto e società in forma pubblica","Guadagno: la xilografia concentra solidarietà e memoria. Costo: l’episodio individuale diventa una figura collettiva."]
  };
  const renderAtlas=()=>{$$("[data-atlas]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.atlas===state.atlas)));const d=atlasData[state.atlas];$("#atlasCard").innerHTML=`<h3>${d[0]}</h3><div><h4>Domanda rivolta alla realtà</h4><p>${d[1]}</p></div><div><h4>Guadagno e costo</h4><p>${d[2]}</p></div>`;}; $$("[data-atlas]").forEach(b=>b.addEventListener("click",()=>{state.atlas=b.dataset.atlas;save();renderAtlas();}));renderAtlas();

  // Sintesi personale senza inferenze emotive
  const buildSynthesis=()=>{const facts=[];if(state.markers.length)facts.push(`hai osservato ${state.markers.length} zone dell’opera iniziale`);if(state.shift)facts.push(`hai confrontato il passaggio dal modulo 15 attraverso la categoria “${state.shift}”`);if(state.timeline)facts.push(`hai approfondito la data ${state.timeline}`);const changed=Object.keys(state.pressure).filter(k=>state.pressure[k]!==pressureDefaults[k]).length;if(changed)facts.push(`hai modificato ${changed} relazioni nel laboratorio di pressione`);const evidenceGood=evidence.filter((x,i)=>state.evidence[i]===x[1]).length;if(evidenceGood)facts.push(`hai distinto correttamente ${evidenceGood} affermazioni visibili, documentate o interpretate`);if(state.gaze)facts.push(`hai collocato lo spettatore nella posizione “${state.gaze}”`);if(state.score.some(Boolean))facts.push("hai composto uno spartito di pause, impulsi, contrasti e addensamenti");if(state.power)facts.push(`hai attraversato ${state.power} passaggi della catena di repressione`);if(state.quiz.mastered.length)facts.push(`hai compreso ${state.quiz.mastered.length} nuclei della verifica`);const notes=[];if(state.notes.initial.trim())notes.push("Hai formulato una prima ipotesi");if(state.notes.final.trim())notes.push("e una seconda lettura");let text=facts.length?`Nel percorso ${facts.join("; ")}. `:"Hai visitato il modulo senza completare ancora attività registrate. ";if(notes.length)text+=`${notes.join(" ")}. `;text+="Le azioni svolte mostrano che la deformazione non cancella il mondo: costruisce relazioni fra corpo, spazio, storia e sguardo. Questa sintesi non attribuisce emozioni che non hai dichiarato.";$("#personalSynthesis").textContent=text;}; $("#buildSynthesis").addEventListener("click",buildSynthesis);buildSynthesis();

  // Verifica: domanda primaria + recupero differente per ogni nucleo
  const quiz=[
    ["Continuità con il Postimpressionismo","Che cosa cambia soprattutto dal modulo 15?",["La realtà esterna scompare","La trasformazione del visibile interroga ora la tensione fra individuo, ambiente e spettatore","Il colore sostituisce ogni struttura"],1,"La realtà resta presente; cambia il problema posto alla forma.","#s2","Quale frase evita una genealogia lineare?",["Van Gogh causa necessariamente Munch","Gli artisti successivi selezionano e trasformano riferimenti precedenti","Il Postimpressionismo è già Espressionismo"],1],
    ["Pluralità storica","Espressionismo indica…",["un’unica associazione","un’etichetta che comprende gruppi e ricerche differenti","una tecnica pittorica precisa"],1,"Brücke, Blaue Reiter e Vienna non coincidono.","#s4","Quale elemento NON è comune a tutti?",["Una stessa tavolozza","Trasformazioni intenzionali della forma","Relazioni con istituzioni moderne"],0],
    ["Munch e la ricezione","Qual è la posizione storica più precisa di Munch?",["Fondatore ufficiale della Brücke","Riferimento precedente, poi riletto in area tedesca","Membro del Blaue Reiter"],1,"Munch precede i gruppi e viene assunto come riferimento.","#s6","La mostra berlinese del 1892 dimostra che…",["Munch fondò l’Espressionismo","la ricezione può cambiare il peso storico di un’opera","tutti approvarono il suo lavoro"],1],
    ["Livelli di evidenza","“Munch narrò una passeggiata” è…",["visibile nel dipinto","documentato da un appunto","una diagnosi"],1,"La fonte scritta documenta un racconto; non è visibile né clinica.","#s6","“Il ponte costruisce una fuga” è…",["un dato visibile","una cartella clinica","un fatto biografico"],0],
    ["Colore relazionale","Perché il rosso non significa sempre violenza?",["Perché i colori non contano","Perché il significato nasce dalle relazioni e dal contesto dell’opera","Perché il rosso significa sempre gioia"],1,"Il colore non possiede un dizionario psicologico universale.","#s5","Che cosa va analizzato per primo?",["La relazione fra campi cromatici","Un codice fisso rosso=violenza","La presunta malattia dell’artista"],0],
    ["Die Brücke","Quando e dove nasce Die Brücke?",["Monaco, 1911","Dresda, 1905","Vienna, 1909"],1,"Quattro studenti fondano il gruppo a Dresda nel 1905.","#s3","Che cosa caratterizza realmente la Brücke?",["Programma, lavoro collettivo e grafica","Una teoria universale dei colori","Un solo soggetto"],0],
    ["Metropoli e sguardo","In Kirchner folla e isolamento…",["si escludono","possono essere simultanei","dipendono solo dal titolo"],1,"Compressione e direzioni divergenti producono prossimità senza comunità.","#s7","Dove si trova lo spettatore?",["Sempre fuori e neutrale","In una posizione costruita dall’opera","Esattamente al centro storico di Dresda"],1],
    ["Colonialismo","Perché il “primitivismo” va criticato?",["Perché gli oggetti non europei non sono arte","Perché è una categoria europea legata ad appropriazioni e potere coloniale","Perché nessun artista vide musei etnografici"],1,"La categoria naturalizzava rapporti asimmetrici.","#s7","Le collezioni etnografiche erano…",["depositi neutrali","parte di circuiti coloniali da ricostruire","create dalla Brücke"],1],
    ["Pluralità del Blaue Reiter","Il Blaue Reiter fu soprattutto…",["una redazione, mostre e un almanacco plurale","un partito politico","una scuola con esami"],0,"La sua unità nasce da scambi, non da una tecnica comune.","#s8","L’almanacco del 1912…",["conteneva un’unica teoria","metteva in relazione arti, epoche e culture diverse","eliminava la musica"],1],
    ["Astrazione e spiritualità","L’astrazione in Kandinsky…",["elimina ogni rapporto col reale","può indagare ritmo e relazioni non descrittive","è un esito inevitabile"],1,"L’opera conserva anche figure e temi, ma cambia la gerarchia delle relazioni.","#s8","Lo spartito visivo dimostra che…",["ogni colore traduce un’emozione fissa","pause e addensamenti costruiscono esperienza","la realtà è inutile"],1],
    ["Corpo viennese","Che cosa mostra l’autoritratto di Schiele?",["Una posa accuratamente costruita","Una diagnosi certa","Un gesto involontario"],0,"Equilibri, tagli e contrappesi sono scelte formali.","#s9","Il vuoto intorno al corpo…",["non significa nulla","partecipa alla relazione con lo spettatore","prova una malattia"],1],
    ["No alle diagnosi retrospettive","Perché un dipinto non è una cartella clinica?",["Perché l’artista non esiste","Perché forma, fonte e ipotesi sono livelli differenti","Perché i volti non comunicano"],1,"La forma può costruire tensione senza certificare una patologia.","#s6","Una deformazione maggiore rende l’opera…",["automaticamente più sincera","automaticamente malata","diversa, ma da interpretare nel contesto"],2],
    ["Artiste e reti","Perché Werefkin cambia il canone?",["Perché va aggiunta a fine elenco","Perché fu fondatrice, teorica e nodo di relazioni","Perché dipinse come Kandinsky"],1,"La sua presenza cambia la struttura della storia, non solo il numero dei nomi.","#s4","Che ruolo ebbe Münter oltre alla pittura?",["Nessuno","Conservò e donò un nucleo decisivo del Blaue Reiter","Fondò Die Brücke"],1],
    ["Guerra non deterministica","Qual è il rapporto più corretto con la guerra?",["Crea automaticamente l’Espressionismo","Trasforma percorsi già attivi e produce risposte diverse","Non ebbe alcun effetto"],1,"Molte tensioni precedono il 1914.","#s10","Kollwitz trasforma il lutto…",["in diagnosi","in forma pubblica pacifista","in propaganda nazista"],1],
    ["Arte degenerata","“Entartete Kunst” fu…",["una qualità estetica","una categoria politica repressiva","un gruppo di artisti"],1,"Il regime costruì la categoria per confiscare e guidare il pubblico.","#s10","Dopo la confisca le opere…",["furono tutte protette","poterono essere vendute, disperse o distrutte","divennero tutte proprietà degli artisti"],1],
    ["Soglia verso il Cubismo","Il Cubismo supera l’Espressionismo?",["Sì, ogni corrente supera la precedente","No, affronta problemi diversi e cronologicamente sovrapposti","Sì, perché è astratto"],1,"La soglia successiva spezza il punto di vista; non stabilisce una classifica.","#s12","Quale passaggio è non teleologico?",["Ogni ricerca guadagna e sacrifica qualcosa","L’arte tende inevitabilmente al Cubismo","L’astrazione è il destino finale"],0]
  ];
  const renderQuiz=()=>{const qstate=state.quiz,q=quiz[qstate.current],recovery=qstate.recovery;$("#masteryCount").textContent=`${qstate.mastered.length} / 16 nuclei`;$("#masteryBar").style.width=`${qstate.mastered.length/16*100}%`;$("#quizNav").innerHTML=quiz.map((x,i)=>`<button type="button" data-q="${i}" class="${i===qstate.current?"current":""} ${qstate.mastered.includes(i)?"mastered":""}" aria-label="Nucleo ${i+1}: ${x[0]}${qstate.mastered.includes(i)?", compreso":""}">${i+1}</button>`).join("");$$("#quizNav button").forEach(b=>b.addEventListener("click",()=>{qstate.current=Number(b.dataset.q);qstate.recovery=false;save();renderQuiz();}));const question=recovery?q[6]:q[1],options=recovery?q[7]:q[2];$("#quizCard").innerHTML=`<p class="core-label">Nucleo ${qstate.current+1} · ${q[0]}${recovery?" · recupero":""}</p><h3>${question}</h3><div class="quiz-options">${options.map((o,i)=>`<button type="button" data-answer="${i}">${o}</button>`).join("")}</div><div id="quizFeedback"></div>`;$$("#quizCard [data-answer]").forEach(b=>b.addEventListener("click",()=>answerQuiz(Number(b.dataset.answer))));$("#quizComplete").hidden=qstate.mastered.length!==16;};
  const answerQuiz=index=>{const qs=state.quiz,q=quiz[qs.current],correct=qs.recovery?q[8]:q[3],box=$("#quizFeedback");if(index===correct){if(!qs.mastered.includes(qs.current))qs.mastered.push(qs.current);qs.mastered.sort((a,b)=>a-b);qs.recovery=false;save();box.innerHTML=`<div class="quiz-feedback correct"><b>Corretto.</b> ${q[4]}</div><button class="secondary" id="nextQuestion" type="button">Nucleo successivo</button>`;$("#nextQuestion").addEventListener("click",()=>{const next=quiz.findIndex((_,i)=>!qs.mastered.includes(i));qs.current=next===-1?qs.current:next;renderQuiz();});$("#masteryCount").textContent=`${qs.mastered.length} / 16 nuclei`;$("#masteryBar").style.width=`${qs.mastered.length/16*100}%`;$("#quizComplete").hidden=qs.mastered.length!==16;buildSynthesis();}else{qs.recovery=true;save();box.innerHTML=`<div class="quiz-feedback"><b>Non ancora.</b> ${q[4]}</div><div class="micro-lesson"><b>Microlezione</b><p>${q[4]} Torna alla sezione indicata, poi affronta una domanda diversa.</p><a href="${q[5]}">Ripassa la sezione</a> · <button id="recoveryQuestion" type="button">Apri la domanda di recupero</button></div>`;$("#recoveryQuestion").addEventListener("click",renderQuiz);}};renderQuiz();

  // Lightbox e zoom accessibile
  const dialog=$("#lightbox"),lightImg=$("#lightboxImage"),caption=$("#lightboxCaption");let returnFocus=null,zoom=1;
  const setZoom=value=>{zoom=Math.max(.5,Math.min(3,value));lightImg.style.transform=`scale(${zoom})`;$("#zoomReset").textContent=`${Math.round(zoom*100)}%`;};
  $$(".view-art").forEach(button=>button.addEventListener("click",()=>{returnFocus=button;lightImg.src=button.dataset.image;lightImg.alt=button.querySelector("img")?.alt||button.dataset.caption||"Opera ingrandita";caption.textContent=button.dataset.caption||"Opera ingrandita";setZoom(1);dialog.showModal();$("#lightboxClose").focus();}));
  $("#lightboxClose").addEventListener("click",()=>dialog.close());$("#zoomIn").addEventListener("click",()=>setZoom(zoom+.25));$("#zoomOut").addEventListener("click",()=>setZoom(zoom-.25));$("#zoomReset").addEventListener("click",()=>setZoom(1));dialog.addEventListener("close",()=>{lightImg.src="";if(returnFocus)returnFocus.focus();});dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});dialog.addEventListener("keydown",e=>{if(e.key!=="Tab")return;const list=$$("button:not([disabled])",dialog),first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});

  // Reset locali e generale
  const resetHandlers={pressure:()=>{state.pressure=clone(pressureDefaults);renderPressure();},evidence:()=>{state.evidence={};renderEvidence();},score:()=>{state.score=Array(12).fill(0);renderScore();},power:()=>{state.power=0;renderPower();}};
  $$('[data-reset]').forEach(button=>button.addEventListener("click",()=>{resetHandlers[button.dataset.reset]?.();save();}));
  $("#resetAll").addEventListener("click",()=>{if(!confirm("Vuoi cancellare note, attività e verifica del solo modulo 16? L’azione non può essere annullata."))return;state=defaults();if(storageOK)localStorage.removeItem(KEY);location.reload();});

  if ("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
})();
