"use strict";

const STORAGE_KEY = "storia-sguardo-09-state";
const VERSION = 1;
const SECTION_IDS = ["immagine","equilibrio","storia","maniera","spazio","corpo","colore","architettura","corte","sacro","viaggio","laboratorio","ritorno"];
const DEFAULT_STATE = {
  version: VERSION,
  visited: [],
  notes: { first: "", final: "" },
  timeline: 0,
  causal: "societa",
  manner: "regola",
  centerLayers: [],
  body: "natural",
  palette: "natural",
  architecture: [],
  portrait: [],
  sacred: "clarity",
  network: "firenze",
  compare: "composizione",
  quiz: { index: 0, phase: "question", correctFirst: [], errors: 0, recoveries: [], recoveryAttempts: 0, completed: false }
};
const clone = value => JSON.parse(JSON.stringify(value));
const allowed = (value, list, fallback) => list.includes(value) ? value : fallback;
function loadState(){
  let raw={}; try{raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");}catch{raw={};}
  const state=clone(DEFAULT_STATE);
  if(!raw||typeof raw!=="object") return state;
  state.visited=Array.isArray(raw.visited)?[...new Set(raw.visited.filter(n=>Number.isInteger(n)&&n>=1&&n<=13))]:[];
  state.notes.first=typeof raw.notes?.first==="string"?raw.notes.first.slice(0,6000):"";
  state.notes.final=typeof raw.notes?.final==="string"?raw.notes.final.slice(0,6000):"";
  state.timeline=Number.isInteger(raw.timeline)&&raw.timeline>=0&&raw.timeline<6?raw.timeline:0;
  state.causal=allowed(raw.causal,["societa","corte","artista","forma","spettatore"],"societa");
  state.manner=allowed(raw.manner,["regola","artificio","storici"],"regola");
  state.centerLayers=Array.isArray(raw.centerLayers)?[...new Set(raw.centerLayers.filter(x=>["geo","emotion","diag","gaze","support","flat"].includes(x)))]:[];
  state.body=allowed(raw.body,["natural","long","contrapposto","twist","serpentine"],"natural");
  state.palette=allowed(raw.palette,["natural","cold","acid","high"],"natural");
  state.architecture=Array.isArray(raw.architecture)?[...new Set(raw.architecture.filter(x=>["order","drop","keystone","rhythm"].includes(x)))]:[];
  state.portrait=Array.isArray(raw.portrait)?[...new Set(raw.portrait.filter(x=>["clothes","hand","book","face","masks"].includes(x)))]:[];
  state.sacred=allowed(raw.sacred,["clarity","complexity","emotion","control"],"clarity");
  state.network=allowed(raw.network,["firenze","roma","mantova","parma","fontainebleau","europa"],"firenze");
  state.compare=allowed(raw.compare,["composizione","centro","spazio","corpo","proporzione","movimento","colore","luce","tempo","emozione","spettatore","potere","realta"],"composizione");
  const q=raw.quiz&&typeof raw.quiz==="object"?raw.quiz:{};
  state.quiz.index=Number.isInteger(q.index)?Math.max(0,Math.min(12,q.index)):0;
  state.quiz.phase=allowed(q.phase,["question","recovery","feedback","done"],"question");
  state.quiz.correctFirst=Array.isArray(q.correctFirst)?[...new Set(q.correctFirst.filter(n=>Number.isInteger(n)&&n>=0&&n<12))]:[];
  state.quiz.errors=Number.isInteger(q.errors)&&q.errors>=0?Math.min(q.errors,999):0;
  state.quiz.recoveries=Array.isArray(q.recoveries)?[...new Set(q.recoveries.filter(n=>Number.isInteger(n)&&n>=0&&n<12))]:[];
  state.quiz.recoveryAttempts=Number.isInteger(q.recoveryAttempts)&&q.recoveryAttempts>=0?Math.min(q.recoveryAttempts,999):0;
  state.quiz.completed=Boolean(q.completed);
  if(state.quiz.completed){state.quiz.index=12;state.quiz.phase="done";}
  if(state.quiz.index>=12&&!state.quiz.completed){state.quiz.index=12;state.quiz.phase="done";state.quiz.completed=true;}
  return state;
}
let state=loadState();
const save=()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
const $=selector=>document.querySelector(selector);

const TIMELINE=[
  {date:"1494–1559",title:"Guerre d’Italia",text:"Francia, Impero, papato e Stati italiani competono nella penisola. Le corti restano centri produttivi, ma dentro equilibri mobili e pressioni militari."},
  {date:"1517",title:"La frattura religiosa",text:"Le tesi di Lutero aprono processi differenti per territori e tempi. Le immagini diventano oggetto di conflitto, difesa, riforma e controllo."},
  {date:"1527",title:"Sacco di Roma",text:"Il saccheggio interrompe cantieri e disperde artisti. È una cesura decisiva, non la causa meccanica di tutte le deformazioni manieriste, alcune già precedenti."},
  {date:"anni 1530",title:"Corti e linguaggi colti",text:"Firenze medicea, Mantova, Parma e Fontainebleau richiedono distinzione, erudizione e invenzione. Il pubblico competente riconosce citazioni e scarti."},
  {date:"1545–1563",title:"Concilio di Trento",text:"Il decreto sulle immagini del 1563 ribadisce funzione, decoro e controllo. L’applicazione non crea subito un unico stile e varia nei contesti."},
  {date:"1563",title:"Accademia del Disegno",text:"A Firenze l’Accademia rafforza il prestigio intellettuale dell’artista e la centralità del disegno, dentro il sistema politico mediceo."}
];
const CAUSAL={
  societa:{label:"Società",title:"Condizioni, non comandi",text:"Guerre, religione, mobilità e gerarchie cambiano il campo delle possibilità. Nessun evento contiene già in sé una forma pittorica."},
  corte:{label:"Corte e committenza",title:"Distinzione e accesso",text:"La corte finanzia ambienti complessi, ritratti ufficiali e programmi mitologici. Un linguaggio difficile può selezionare chi è in grado di comprenderlo."},
  artista:{label:"Artista",title:"Cultura e invenzione",text:"L’artista rivendica disegno, invenzione, giudizio e virtuosismo; non è soltanto esecutore, ma interlocutore colto del committente."},
  forma:{label:"Forma",title:"Regola resa instabile",text:"Allungamento, compressione, colore irreale e citazione dell’antico sono decisioni tecniche che producono senso."},
  spettatore:{label:"Spettatore",title:"Un pubblico implicato",text:"Lo spettatore deve cercare, riconoscere e ricostruire. La difficoltà può creare partecipazione, ma anche distanza ed esclusione."}
};
const MANNER={
  regola:{label:"Maniera come dominio della regola",title:"Saper fare senza mostrare fatica",text:"Nel lessico cinquecentesco la maniera può indicare il modo di operare e uno stile riconoscibile. La grazia richiede esercizio, memoria di modelli e capacità di governare la difficoltà."},
  artificio:{label:"Maniera come artificio consapevole",title:"La naturalezza non è l’unico valore",text:"Citazioni, pose rare, proporzioni allungate e soluzioni improbabili rendono percepibile l’invenzione dell’artista. Artificio non significa necessariamente falsità: significa forma che dichiara di essere costruita."},
  storici:{label:"Manierismo come categoria degli storici",title:"Un contenitore successivo e discusso",text:"Il termine è stato usato come giudizio di decadenza, poi rivalutato come categoria estetica e storica. Resta utile se non cancella differenze, luoghi, cronologie e funzioni."}
};
const CENTER={
  geo:{label:"Centro geometrico",className:"center-stage-geo",text:"Il punto medio della tavola non governa da solo la narrazione: Cristo, Maria e i portatori costruiscono poli concorrenti.",equivalent:"Il centro geometrico cade fra i corpi, ma non coincide con un volto o con un gesto risolutivo."},
  emotion:{label:"Centri emotivi",className:"center-stage-emotion",text:"Il corpo di Cristo e il volto di Maria attirano l’attenzione in zone diverse; la distanza tra i due impedisce una chiusura pacificata.",equivalent:"Due poli emotivi separati, Cristo in basso e Maria più in alto, dividono lo sguardo."},
  diag:{label:"Diagonali",className:"center-stage-diag",text:"Diagonali opposte collegano arti, busti e sguardi. La composizione è controllata, ma non offre un asse dominante stabile.",equivalent:"Due diagonali incrociate attraversano la tavola e impediscono una lettura soltanto verticale."},
  gaze:{label:"Direzioni degli sguardi",className:"center-stage-gaze",text:"Molte figure non guardano lo stesso punto. Le direzioni divergenti moltiplicano ciò che lo spettatore deve inseguire.",equivalent:"Gli sguardi non convergono: alcuni cercano Cristo, altri Maria, altri un fuori campo."},
  support:{label:"Punti di appoggio",className:"center-stage-support",text:"I piedi sembrano leggeri e il portatore inginocchiato sostiene un peso enorme in una posa improbabile. L’appoggio è visibile ma non rassicurante.",equivalent:"Gli appoggi sono pochi, marginali e visivamente fragili rispetto alla massa dei corpi."},
  flat:{label:"Profondità sospesa",className:"center-stage-flat",text:"Mancano un paesaggio e un’architettura capaci di misurare le distanze. I corpi riempiono una superficie compressa.",equivalent:"Lo sfondo offre pochissimi indizi di profondità; le figure sembrano sovrapposte sulla superficie."}
};
const BODY={
  natural:{label:"Proporzione naturalistica",title:"La misura come riferimento",text:"La figura conserva rapporti plausibili e un asse leggibile. È un termine di confronto, non una norma morale.",equivalent:"Figura proporzionata e frontale, con peso distribuito."},
  long:{label:"Allungamento",title:"Più grazia, meno gravità",text:"Collo, dita e arti allungati sottraggono peso e trasformano il corpo in ritmo elegante. Nella Madonna del Parmigianino l’alterazione è deliberata.",equivalent:"La figura diventa più alta e sottile; la verticalità prevale sulla stabilità."},
  contrapposto:{label:"Contrapposto",title:"Equilibrio mobile",text:"Il peso si concentra su una gamba e le parti del corpo rispondono con inclinazioni opposte. La posa può restare stabile pur contenendo movimento.",equivalent:"Bacino e spalle inclinano in direzioni opposte attorno alla gamba portante."},
  twist:{label:"Torsione",title:"Il corpo mostra più lati",text:"La torsione rende simultanee direzioni diverse. Il corpo smette di offrire una sola faccia allo spettatore.",equivalent:"Il busto ruota rispetto alle gambe e spezza l’asse frontale."},
  serpentine:{label:"Figura serpentinata",title:"Nessun punto di vista basta",text:"La figura sale ruotando; per comprenderla occorre girarle attorno. Giambologna trasforma la visione in un percorso.",equivalent:"Il corpo segue una spirale ascendente e richiede più punti di vista."}
};
const PALETTES={
  natural:{label:"Apparentemente naturale",title:"Il colore unifica",text:"Terre, incarnati e azzurri moderati possono suggerire una luce comune e rendere credibile l’appartenenza allo stesso ambiente.",equivalent:"Tavolozza naturalistica: terre, incarnati e azzurro moderato formano una luce plausibile."},
  cold:{label:"Fredda",title:"Il colore crea distanza",text:"Azzurri, violetti e verdi freddi allontanano i corpi dalla temperatura dell’esperienza quotidiana.",equivalent:"Tavolozza fredda: blu, violetto e verde attenuano il calore e aumentano la distanza."},
  acid:{label:"Acida",title:"Il colore separa",text:"Rosa, verde e azzurro molto distinti costruiscono urti cromatici. Le forme restano leggibili, ma non si fondono in una luce naturale.",equivalent:"Tavolozza acida: rosa, verde e azzurro separano le forme e producono tensione."},
  high:{label:"Saturazione alta",title:"Il colore prende il comando",text:"Una saturazione intensa rende il colore autonomo rispetto alla descrizione. L’effetto emotivo precede la plausibilità luminosa.",equivalent:"Tavolozza satura: i colori intensi dominano la scena e sostituiscono la luce descrittiva."}
};
const ARCHITECTURE={
  order:{label:"1 · Ordine",title:"Costruisci la regola",text:"Cinque campate, cornici, triglifi e archi stabiliscono un ritmo leggibile. Senza questa memoria, lo scarto successivo sarebbe soltanto disordine."},
  drop:{label:"2 · Triglifi slittati",title:"Un elemento sembra cedere",text:"Il triglifo abbassato cita il sistema dorico e insieme lo rende inquieto: la struttura appare sul punto di perdere la propria disciplina."},
  keystone:{label:"3 · Chiavi eccessive",title:"Il dettaglio occupa troppo spazio",text:"Chiavi sovradimensionate fanno sentire il peso e mettono in crisi la gerarchia prevista fra parte e insieme."},
  rhythm:{label:"4 · Ritmo interrotto",title:"La simmetria non basta",text:"Interruzioni controllate trasformano la ripetizione in aspettativa. Lo spettatore competente riconosce ciò che avrebbe dovuto accadere."}
};
const PORTRAIT={
  clothes:{label:"Abito e tessuto",title:"Il corpo diventa superficie sociale",text:"Il nero non cancella la ricchezza: taglio, seta, pieghe e ornamenti dichiarano accesso, gusto e rango."},
  hand:{label:"Postura",title:"Il controllo è corporeo",text:"La mano sul fianco e il busto eretto costruiscono presenza. Non leggiamo un’emozione privata, ma una grammatica pubblica."},
  book:{label:"Libro",title:"La cultura è un attributo",text:"Il volume può indicare appartenenza a un ambiente letterario. Oggetto e posa fanno del sapere una forma di distinzione."},
  face:{label:"Volto",title:"Riservatezza non significa freddezza",text:"Lo sguardo controllato limita l’accesso dello spettatore; non autorizza a diagnosticare carattere o sentimenti."},
  masks:{label:"Mascheroni",title:"L’apparenza riflette su se stessa",text:"I volti grotteschi nei mobili rendono visibile il tema della maschera e complicano il rapporto fra identità, artificio e rappresentazione."}
};
const SACRED={
  clarity:{label:"Chiarezza narrativa",title:"Che cosa sta accadendo?",text:"Rosso rende riconoscibile la croce e l’azione della discesa; Pontormo sospende il momento fra trasporto, compianto e separazione. Complessità non equivale ad assenza di significato."},
  complexity:{label:"Complessità formale",title:"La difficoltà può essere intenzionale",text:"Scale, pose, compressioni e colori chiedono uno sguardo attivo. La forma sacra può far lavorare lo spettatore invece di consegnargli subito una sequenza."},
  emotion:{label:"Partecipazione emotiva",title:"L’emozione non dipende soltanto dal realismo",text:"Colori irreali e corpi improbabili possono intensificare perdita, precarietà e distanza. L’artificio non elimina necessariamente il coinvolgimento."},
  control:{label:"Controllo dell’immagine",title:"Le regole istituzionali arrivano in tempi diversi",text:"Commissioni, luoghi, censura e dibattito sul decoro agiscono sulle opere. Il decreto tridentino del 1563 non retroagisce sulle tavole del 1521 o del 1525–1528."}
};
const NETWORK={
  firenze:{label:"Firenze",title:"Firenze · botteghe e corte medicea",text:"Pontormo, Rosso, Bronzino e Vasari affrontano in modi diversi eredità michelangiolesca, committenza religiosa e costruzione della corte."},
  roma:{label:"Roma",title:"Roma · modelli e dispersione",text:"Raffaello e Michelangelo sono riferimenti imprescindibili. Dopo il 1527 la dispersione degli artisti accelera la circolazione di competenze e invenzioni."},
  mantova:{label:"Mantova",title:"Mantova · Giulio Romano",text:"Palazzo Te integra architettura, pittura, stucco, mito e cerimoniale per un pubblico di corte capace di riconoscere la regola violata."},
  parma:{label:"Parma",title:"Parma · Parmigianino",text:"L’eleganza allungata e la sperimentazione grafica di Parmigianino circolano attraverso dipinti, disegni e incisioni."},
  fontainebleau:{label:"Fontainebleau",title:"Fontainebleau · collaborazione internazionale",text:"Rosso Fiorentino e Primaticcio lavorano con maestranze francesi. Il linguaggio italiano viene trasformato da materiali, spazi e politica regia."},
  europa:{label:"Stampe",title:"Europa · modelli riproducibili",text:"Stampe, fogli e libri attraversano confini più facilmente delle grandi opere. La citazione può raggiungere artisti che non hanno visto l’originale."}
};
const WORKS=[
  {title:"Piero della Francesca",era:"Ordine rinascimentale",image:"assets/images/piero-flagellazione.webp",alt:"Piero della Francesca, Flagellazione"},
  {title:"Pontormo",era:"Instabilità costruita",image:"assets/images/pontormo-deposizione.webp",alt:"Pontormo, Deposizione"},
  {title:"Parmigianino",era:"Grazia artificiale",image:"assets/images/parmigianino-madonna.webp",alt:"Parmigianino, Madonna dal collo lungo"},
  {title:"Caravaggio",era:"Tensione nello spazio dello spettatore",image:"assets/images/caravaggio-vocazione.webp",alt:"Caravaggio, Vocazione di san Matteo"}
];
const COMPARE={
  composizione:["Architettura e figure sono distribuite in un equilibrio calcolato.","I corpi formano un vortice senza chiusura stabile.","La massa della Vergine domina un lato; figure minute occupano l’altro.","Il gruppo è tagliato orizzontalmente e attraversato dalla luce."],
  centro:["Più gruppi restano leggibili dentro una griglia coerente.","Centro geometrico ed emotivo non coincidono.","La Vergine è centro enorme ma decentrato rispetto al gruppo di destra.","Il gesto e il fascio luminoso costruiscono un centro d’azione laterale."],
  spazio:["La prospettiva misura interno, esterno e distanza.","Lo sfondo non consente di verificare la profondità.","Scala monumentale e figure lontane producono sproporzioni intenzionali.","Lo spazio reale sembra continuare davanti al quadro."],
  corpo:["Le figure sono misurate dall’architettura.","I corpi sembrano leggeri nonostante il peso del Cristo.","Collo, dita e arti diventano ritmi eleganti.","Corpi comuni, gesti interrotti e abiti contemporanei occupano la scena sacra."],
  proporzione:["I rapporti sostengono la coerenza dell’insieme.","La proporzione cede alla necessità compositiva ed emotiva.","L’allungamento è il principio espressivo più evidente.","La scala dei corpi è plausibile, ma il taglio li rende cinematicamente vicini."],
  movimento:["Il tempo sembra sospeso in un ordine contemplativo.","Direzioni opposte impediscono all’occhio di fermarsi.","Il movimento è lento, ondulato, più elegante che fisico.","Un gesto e una luce fanno accadere l’istante."],
  colore:["Toni calibrati sostengono distanza e materia.","Rosa, azzurri e verdi sembrano emancipati dalla natura.","Incarnati perlacei e toni preziosi trasformano il sacro in artificio.","Terre e rossi sono subordinati al contrasto fra buio e luce."],
  luce:["La luce descrive coerentemente volumi e architettura.","Non possiede una sorgente unitaria verificabile.","La luce leviga le superfici e riduce la gravità.","La luce seleziona il tempo e rende visibile la chiamata."],
  tempo:["Il racconto resta enigmatico ma spazialmente fermo.","Il momento tra morte, trasporto e compianto rimane indecidibile.","La durata sembra rituale e fuori dal quotidiano.","È isolato l’istante prima della decisione."],
  emozione:["La distanza intellettuale prevale sull’urto immediato.","Dolore e smarrimento nascono dalla precarietà dell’insieme.","Tenerezza e inquietudine convivono nella grazia irreale.","Il dubbio dello spettatore replica quello dei personaggi."],
  spettatore:["Un punto di vista ordina la scena senza invaderci.","Lo sguardo cerca appoggi che l’opera gli nega.","Lo spettatore ammira una difficoltà selettiva e colta.","La luce e il taglio includono lo spettatore nello spazio dell’evento."],
  potere:["La misura rende visibile una cultura di corte e un ordine intellettuale.","La cappella familiare trasforma il dolore sacro in invenzione rara.","Committenza religiosa e prestigio artistico convivono in una pala incompiuta.","La committenza ecclesiastica usa presenza e persuasione, ma deve negoziare il decoro."],
  realta:["Il reale appare costruibile attraverso relazioni misurabili.","La realtà non coincide più con ciò che sembra naturale.","L’artificio rivela che ogni bellezza è una costruzione.","La realtà torna corporea, ma è organizzata da una regia luminosa radicale."]
};
const CATEGORY_LABELS={composizione:"Composizione",centro:"Centro",spazio:"Spazio",corpo:"Corpo",proporzione:"Proporzione",movimento:"Movimento",colore:"Colore",luce:"Luce",tempo:"Tempo",emozione:"Emozione",spettatore:"Rapporto con lo spettatore",potere:"Committenza e potere",realta:"Idea di realtà"};

const QUIZ=[
  {section:"equilibrio",q:"Perché il Manierismo non va spiegato come perdita di competenza?",a:["Perché rifiuta ogni regola precedente","Perché forza regole che conosce in profondità","Perché torna ai modelli medievali"],ok:1,why:"L’instabilità è significativa proprio perché nasce dalla padronanza di prospettiva, anatomia e composizione.",r:{lesson:"Conoscere la regola consente di trasformarla intenzionalmente; ignorarla produce un risultato casuale, non necessariamente manierista.",q:"Quale gesto dimostra maggiore dominio?",a:["Alterare consapevolmente un ritmo riconoscibile","Evitare di studiare il ritmo","Ripetere sempre lo stesso schema"],ok:0}},
  {section:"storia",q:"Quale rapporto è storicamente più corretto fra crisi politica e forma?",a:["La crisi causa automaticamente figure deformate","Gli eventi non hanno alcun rapporto con l’arte","Gli eventi cambiano condizioni e occasioni, non dettano una forma unica"],ok:2,why:"La storia modifica reti e possibilità; la scelta formale resta mediata da artisti, committenze e pubblici.",r:{lesson:"Una condizione storica apre o chiude possibilità. Non contiene già la soluzione visiva che ogni artista adotterà.",q:"Il Sacco di Roma del 1527…",a:["spiega da solo tutto il Manierismo","accelera dispersioni e trasformazioni già in corso","avviene dopo il Concilio di Trento"],ok:1}},
  {section:"maniera",q:"Che differenza c’è fra “maniera” e “Manierismo”?",a:["Nessuna: Vasari nominò un movimento unitario","Maniera è un termine cinquecentesco; Manierismo è anche una categoria storiografica successiva","Manierismo significava soltanto cattivo gusto"],ok:1,why:"La categoria moderna non coincide con tutti gli usi storici della parola maniera.",r:{lesson:"Vasari usa maniera per modo, stile e qualità; gli storici successivi costruiscono il contenitore periodizzante “Manierismo”.",q:"Quale affermazione evita l’anacronismo?",a:["Gli artisti firmavano manifesti manieristi","La categoria aiuta, ma va usata criticamente","Tutti i manieristi dipingevano allo stesso modo"],ok:1}},
  {section:"spazio",q:"Che cosa mostra il laboratorio sui centri di Pontormo?",a:["Che la composizione è casuale","Che un solo centro controlla tutto","Che più poli e direzioni producono un’instabilità progettata"],ok:2,why:"Centro geometrico, poli emotivi, diagonali e sguardi non coincidono, ma sono costruiti con precisione.",r:{lesson:"L’assenza di un unico centro non è assenza di progetto: può essere il risultato di più forze coordinate.",q:"Se due centri emotivi non coincidono…",a:["lo sguardo può oscillare fra essi","il quadro è necessariamente sbagliato","la profondità aumenta automaticamente"],ok:0}},
  {section:"corpo",q:"Che cosa rende possibile la figura serpentinata?",a:["Un unico punto di vista frontale","Una lettura circolare e una tensione ascendente","La correzione anatomica di un errore"],ok:1,why:"La spirale corporea chiede di muoversi attorno alla figura e trasforma la visione in percorso.",r:{lesson:"Contrapposto e torsione non sono sinonimi: la figura serpentinata porta la rotazione lungo l’intero corpo.",q:"Quale esperienza richiede?",a:["Restare immobili davanti a una sola faccia","Seguire la spirale da più punti di vista","Misurare soltanto l’altezza"],ok:1}},
  {section:"colore",q:"Nel modulo, che cosa significa colore “irreale”?",a:["Un colore usato per errore","Un colore autonomo dalla luce naturale, con funzione espressiva","Un colore privo di pigmento"],ok:1,why:"Il colore può separare e tendere le forme invece di descrivere soltanto la luce ambientale.",r:{lesson:"Naturalistico ed espressivo non sono giudizi di qualità: indicano funzioni diverse del colore.",q:"Una tavolozza acida può…",a:["rendere ogni forma invisibile","separare le forme e produrre tensione","garantire profondità prospettica"],ok:1}},
  {section:"architettura",q:"Perché i triglifi slittati di Palazzo Te sono significativi?",a:["Perché Giulio Romano ignorava l’ordine dorico","Perché lo scarto è leggibile contro una regola conosciuta","Perché l’edificio stava crollando"],ok:1,why:"La violazione controllata rende il sistema classico oggetto di invenzione.",r:{lesson:"Una sorpresa architettonica funziona quando lo spettatore sa prevedere la posizione “corretta” dell’elemento.",q:"Prima dello scarto serve…",a:["un ritmo riconoscibile","l’assenza di ogni ritmo","una decorazione casuale"],ok:0}},
  {section:"corte",q:"Come va interpretato il volto controllato nel ritratto di Bronzino?",a:["Come prova clinica di freddezza","Come possibile costruzione pubblica di rango e distanza","Come incapacità di rappresentare emozioni"],ok:1,why:"Il ritratto di corte costruisce una persona sociale; non consegna direttamente la psicologia privata.",r:{lesson:"Postura, abito, libro e spazio sono segni politici e culturali. Il volto partecipa alla stessa regia.",q:"Quale domanda è più rigorosa?",a:["Che patologia ha il giovane?","Come abito e posa costruiscono il suo ruolo?","Perché non sorride mai nella vita?"],ok:1}},
  {section:"sacro",q:"Perché il Concilio di Trento non spiega direttamente Pontormo e Rosso?",a:["Perché vietò ogni immagine","Perché il decreto sulle immagini è del 1563, successivo alle due opere","Perché si svolse nel Quattrocento"],ok:1,why:"Le date impediscono una causalità retroattiva; il dibattito religioso resta però parte del contesto più ampio.",r:{lesson:"Pontormo lavora nel 1525–1528 e Rosso nel 1521; il decreto tridentino sulle immagini arriva nel 1563.",q:"Quale metodo è corretto?",a:["Distinguere data dell’opera, commissione e censura","Applicare ogni regola successiva alle opere precedenti","Ignorare sempre il contesto religioso"],ok:0}},
  {section:"viaggio",q:"Come si diffonde il linguaggio manierista fuori d’Italia?",a:["Soltanto attraverso copie identiche","Attraverso artisti, stampe, disegni e collaborazioni di corte","Per ordine di una singola accademia europea"],ok:1,why:"La circolazione trasforma i modelli: Fontainebleau è collaborazione, non semplice esportazione.",r:{lesson:"Quando un linguaggio viaggia incontra nuovi materiali, pubblici e istituzioni; perciò cambia.",q:"Fontainebleau dimostra…",a:["una copia passiva di Firenze","una rete fra artisti italiani e maestranze francesi","l’assenza di committenza regia"],ok:1}},
  {section:"laboratorio",q:"Quale passaggio prepara Caravaggio senza ridurre il Manierismo a un’anticamera?",a:["La tensione entra sempre più nel rapporto con lo spettatore","Il colore scompare definitivamente","La prospettiva viene dimenticata"],ok:0,why:"Il Barocco trasforma tensione e instabilità in luce, azione, presenza e persuasione.",r:{lesson:"Una soglia storica non rende ciò che precede incompleto: mostra come un problema venga ereditato e trasformato.",q:"Il confronto finale presenta…",a:["una classifica di qualità","trasformazioni del rapporto fra forma e spettatore","la stessa soluzione ripetuta"],ok:1}},
  {section:"ritorno",q:"Qual è la tesi conclusiva del modulo?",a:["La forma perde la quiete perché l’artista dimentica la misura","La regola scompare dopo il 1527","La misura resta, ma non è più abitata con innocenza"],ok:2,why:"Il Manierismo rende percepibile l’artificio di un ordine che continua a esistere.",r:{lesson:"Corpo, spazio e colore non distruggono la competenza rinascimentale: ne mostrano il carattere costruito.",q:"L’instabilità manierista…",a:["rende visibile la regola","elimina ogni progetto","coincide con incompetenza"],ok:0}}
];

function renderTimeline(){
  const wrap=$("#timeline"); wrap.innerHTML=TIMELINE.map((item,i)=>`<button type="button" aria-pressed="${state.timeline===i}" data-index="${i}"><b>${item.date}</b>${item.title}</button>`).join("");
  const item=TIMELINE[state.timeline]; $("#timelineReading").innerHTML=`<h3>${item.title}</h3><p>${item.text}</p>`;
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.timeline=Number(button.dataset.index);save();renderTimeline();}));
}
function renderCausal(){
  const wrap=$("#causalNodes"); wrap.innerHTML=Object.entries(CAUSAL).map(([key,item])=>`<button type="button" data-key="${key}" aria-pressed="${state.causal===key}">${item.label}</button>`).join("");
  const item=CAUSAL[state.causal]; $("#causalReading").innerHTML=`<h3>${item.title}</h3><p>${item.text}</p>`;
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.causal=button.dataset.key;save();renderCausal();}));
}
function renderManner(){
  const wrap=$("#mannerTabs"); wrap.innerHTML=Object.entries(MANNER).map(([key,item],i)=>`<button type="button" role="tab" data-key="${key}" aria-selected="${state.manner===key}"><span>0${i+1}</span>${item.label}</button>`).join("");
  const item=MANNER[state.manner]; $("#mannerReading").innerHTML=`<h3>${item.title}</h3><p>${item.text}</p>`;
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.manner=button.dataset.key;save();renderManner();}));
}
function renderCenter(){
  const wrap=$("#centerButtons"),stage=$("#centerStage");
  wrap.innerHTML=Object.entries(CENTER).map(([key,item])=>`<button type="button" data-key="${key}" aria-pressed="${state.centerLayers.includes(key)}">${item.label}</button>`).join("");
  Object.values(CENTER).forEach(item=>stage.classList.remove(item.className)); state.centerLayers.forEach(key=>stage.classList.add(CENTER[key].className));
  const latest=state.centerLayers.at(-1); $("#centerReading").innerHTML=latest?`<h3>${CENTER[latest].label}</h3><p>${CENTER[latest].text}</p>`:"<h3>Attiva un livello</h3><p>Ogni sovrapposizione formula una domanda diversa. Puoi combinarle, ma non confondere diagramma e opera.</p>";
  $("#centerEquivalent").textContent=latest?`Equivalente testuale: ${state.centerLayers.map(key=>CENTER[key].equivalent).join(" ")}`:"Equivalente testuale: nessuna sovrapposizione è attiva.";
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{const key=button.dataset.key;state.centerLayers=state.centerLayers.includes(key)?state.centerLayers.filter(x=>x!==key):[...state.centerLayers,key];save();renderCenter();renderSynthesis();}));
}
function renderBody(){
  const wrap=$("#bodyModes"); wrap.innerHTML=Object.entries(BODY).map(([key,item])=>`<button type="button" data-key="${key}" aria-pressed="${state.body===key}">${item.label}</button>`).join("");
  const item=BODY[state.body]; $("#bodySimulator").dataset.mode=state.body; $("#bodyEquivalent").textContent=item.equivalent; $("#bodyReading").innerHTML=`<h3>${item.title}</h3><p>${item.text}</p>`;
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.body=button.dataset.key;save();renderBody();renderSynthesis();}));
}
function renderColour(){
  const wrap=$("#paletteButtons"); wrap.innerHTML=Object.entries(PALETTES).map(([key,item])=>`<button type="button" data-key="${key}" aria-pressed="${state.palette===key}">${item.label}</button>`).join("");
  const item=PALETTES[state.palette]; $("#colourStage").dataset.palette=state.palette; $("#colourEquivalent").textContent=item.equivalent; $("#colourReading").innerHTML=`<h3>${item.title}</h3><p>${item.text}</p>`;
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.palette=button.dataset.key;save();renderColour();renderSynthesis();}));
}
function renderArchitecture(){
  const wrap=$("#architectureSteps"),lab=$(".facade-lab"); wrap.innerHTML=Object.entries(ARCHITECTURE).map(([key,item])=>`<button type="button" data-key="${key}" aria-pressed="${key==="order"?!state.architecture.length:state.architecture.includes(key)}">${item.label}</button>`).join("");
  ["drop","keystone","rhythm"].forEach(key=>lab.classList.toggle(key,state.architecture.includes(key)));
  const latest=state.architecture.at(-1)||"order",item=ARCHITECTURE[latest]; $("#architectureReading").innerHTML=`<h3>${item.title}</h3><p>${item.text}</p>`;
  const parts=[];if(state.architecture.includes("drop"))parts.push("alcuni triglifi scendono sotto l’allineamento");if(state.architecture.includes("keystone"))parts.push("le chiavi degli archi diventano eccessive");if(state.architecture.includes("rhythm"))parts.push("il ritmo delle campate si interrompe");$("#architectureEquivalent").textContent=parts.length?`Facciata alterata: ${parts.join("; ")}. La struttura di base resta riconoscibile.`:"Facciata ordinata: cinque campate, ritmo regolare, triglifi allineati e chiavi contenute.";
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{const key=button.dataset.key;if(key==="order")state.architecture=[];else state.architecture=state.architecture.includes(key)?state.architecture.filter(x=>x!==key):[...state.architecture,key];save();renderArchitecture();renderSynthesis();}));
}
function renderPortrait(){
  const wrap=$("#portraitControls"),stage=$(".portrait-stage"); wrap.innerHTML=Object.entries(PORTRAIT).map(([key,item])=>`<button type="button" data-key="${key}" aria-pressed="${state.portrait.includes(key)}">${item.label}</button>`).join("");
  Object.keys(PORTRAIT).forEach(key=>stage.classList.toggle(`show-${key}`,state.portrait.includes(key)));const latest=state.portrait.at(-1);$("#portraitReading").innerHTML=latest?`<h3>${PORTRAIT[latest].title}</h3><p>${PORTRAIT[latest].text}</p>`:"<h3>Seleziona un indizio</h3><p>Confronta profilo dinastico e ritratto di corte senza trasformare l’espressione in una diagnosi.</p>";
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{const key=button.dataset.key;state.portrait=state.portrait.includes(key)?state.portrait.filter(x=>x!==key):[...state.portrait,key];save();renderPortrait();renderSynthesis();}));
}
function renderSacred(){
  const wrap=$("#sacredButtons"); wrap.innerHTML=Object.entries(SACRED).map(([key,item])=>`<button type="button" data-key="${key}" aria-pressed="${state.sacred===key}">${item.label}</button>`).join("");const item=SACRED[state.sacred];$("#sacredReading").innerHTML=`<h3>${item.title}</h3><p>${item.text}</p>`;wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.sacred=button.dataset.key;save();renderSacred();}));
}
function renderNetwork(){
  const wrap=$("#networkMap");wrap.innerHTML=Object.entries(NETWORK).map(([key,item])=>`<button type="button" data-key="${key}" aria-pressed="${state.network===key}">${item.label}</button>`).join("");const item=NETWORK[state.network];$("#networkReading").innerHTML=`<h3>${item.title}</h3><p>${item.text}</p>`;wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.network=button.dataset.key;save();renderNetwork();}));
}
function renderCompare(){
  const wrap=$("#compareCategories");wrap.innerHTML=Object.keys(COMPARE).map(key=>`<button type="button" data-key="${key}" aria-pressed="${state.compare===key}">${CATEGORY_LABELS[key]}</button>`).join("");const readings=COMPARE[state.compare];$("#compareGrid").innerHTML=WORKS.map((work,i)=>`<article class="compare-card"><img src="${work.image}" alt="${work.alt}" width="600" height="420" loading="lazy"><div><h3>${work.title}</h3><span class="era">${work.era}</span><p><b>${CATEGORY_LABELS[state.compare]}.</b> ${readings[i]}</p></div></article>`).join("");wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.compare=button.dataset.key;save();renderCompare();}));
}
function renderSynthesis(){
  const first=$("#openingMemory"); first.textContent=state.notes.first||"Non hai ancora scritto un’annotazione.";
  const box=$("#personalSynthesis");const choices=[];if(state.centerLayers.length)choices.push("hai riconosciuto che il centro è molteplice");if(state.body!=="natural")choices.push(`hai sperimentato ${BODY[state.body].label.toLowerCase()}`);if(state.palette!=="natural")choices.push(`hai osservato la tavolozza ${PALETTES[state.palette].label.toLowerCase()}`);if(state.architecture.length)choices.push("hai introdotto scarti in un ordine riconoscibile");if(state.portrait.length)choices.push("hai letto il ritratto come costruzione sociale");
  if(!state.notes.final.trim()&&!choices.length){box.innerHTML="<h3>La tua sintesi</h3><p>Completa almeno un laboratorio e il secondo taccuino per costruire una sintesi del percorso.</p>";return;}
  const note=state.notes.final.trim()?"Nel secondo taccuino hai formulato una rilettura autonoma dell’opera.":"Il secondo taccuino attende ancora la tua rilettura.";box.innerHTML=`<h3>La tua sintesi</h3><p>${choices.length?`Nel percorso ${choices.join(", ")}.`:"Hai riaperto l’immagine iniziale."} ${note} La forma perde la quiete non perché la regola sia scomparsa, ma perché è diventata percepibile come costruzione.</p>`;
}
function updateProgress(){const count=state.visited.length;$("#readingProgress").value=count;$("#progressText").textContent=`${count} di 13 tappe`;}
function initProgress(){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const step=Number(entry.target.dataset.step);if(!state.visited.includes(step)){state.visited.push(step);state.visited.sort((a,b)=>a-b);save();updateProgress();}}}),{threshold:.25});document.querySelectorAll(".tracked").forEach(section=>observer.observe(section));updateProgress();}
function initNotes(){
  const first=$("#openingNote"),final=$("#returnNote");first.value=state.notes.first;final.value=state.notes.final;renderSynthesis();
  let timer;const bind=(input,key,status)=>input.addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(()=>{state.notes[key]=input.value.slice(0,6000);save();$(status).textContent="Salvato su questo dispositivo.";renderSynthesis();},280)});bind(first,"first","#openingSave");bind(final,"final","#returnSave");
}
function initMenu(){const menu=$("#chapterMenu"),scrim=$("#menuScrim"),open=$("#menuButton"),close=$("#menuClose");const show=()=>{menu.hidden=false;scrim.hidden=false;open.setAttribute("aria-expanded","true");close.focus();};const hide=()=>{menu.hidden=true;scrim.hidden=true;open.setAttribute("aria-expanded","false");open.focus();};open.addEventListener("click",show);close.addEventListener("click",hide);scrim.addEventListener("click",hide);menu.querySelectorAll("a").forEach(link=>link.addEventListener("click",hide));document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!menu.hidden)hide();});$("#resetState").addEventListener("click",()=>{if(confirm("Cancellare taccuini, avanzamento, laboratori e verifica salvati su questo dispositivo?")){localStorage.removeItem(STORAGE_KEY);location.reload();}});}
function initResets(){
  $("#centerReset").addEventListener("click",()=>{state.centerLayers=[];save();renderCenter();renderSynthesis();});
  $("#bodyReset").addEventListener("click",()=>{state.body="natural";save();renderBody();renderSynthesis();});
  $("#colourReset").addEventListener("click",()=>{state.palette="natural";save();renderColour();renderSynthesis();});
  $("#architectureReset").addEventListener("click",()=>{state.architecture=[];save();renderArchitecture();renderSynthesis();});
  $("#portraitReset").addEventListener("click",()=>{state.portrait=[];save();renderPortrait();renderSynthesis();});
  $("#sacredReset").addEventListener("click",()=>{state.sacred="clarity";save();renderSacred();});
}
function renderQuiz(){
  const area=$("#quizArea"),meter=$("#quizMeter"),count=$("#quizCount");meter.value=Math.min(12,state.quiz.index);count.textContent=state.quiz.completed?"Verifica completata":`Domanda ${state.quiz.index+1} di 12`;
  if(state.quiz.completed||state.quiz.phase==="done"){
    const unresolved=Math.max(0,12-state.quiz.index);area.innerHTML=`<article class="quiz-card quiz-summary"><p class="question-no">Percorso completato</p><h3>L’ordine non è più innocente: ora sai vedere come viene teso.</h3><div class="summary-grid"><article><b>${state.quiz.correctFirst.length}</b><span>corrette al primo tentativo</span></article><article><b>${state.quiz.errors}</b><span>errori iniziali</span></article><article><b>${state.quiz.recoveries.length}</b><span>recuperi superati</span></article><article><b>${unresolved}</b><span>nuclei irrisolti</span></article></div><p>Nuclei da riaprire:</p><div class="quiz-links">${QUIZ.filter((_,i)=>!state.quiz.correctFirst.includes(i)).map(item=>`<a href="#${item.section}">${item.section}</a>`).join("")||"<span>Nessuno: tutte corrette al primo tentativo.</span>"}</div><button id="quizRestart" type="button">Ricomincia la verifica</button></article>`;$("#quizRestart").addEventListener("click",()=>{state.quiz=clone(DEFAULT_STATE.quiz);save();renderQuiz();});return;
  }
  const item=QUIZ[state.quiz.index];
  if(state.quiz.phase==="question"){
    area.innerHTML=`<form class="quiz-card" id="questionForm"><p class="question-no">Nucleo ${state.quiz.index+1}</p><h3>${item.q}</h3>${item.a.map((answer,i)=>`<label><input type="radio" name="answer" value="${i}">${answer}</label>`).join("")}<button type="submit">Verifica</button><p id="questionStatus" role="status"></p></form>`;
    $("#questionForm").addEventListener("submit",event=>{event.preventDefault();const picked=event.currentTarget.elements.answer.value;if(picked===""){$("#questionStatus").textContent="Scegli una risposta.";return;}if(Number(picked)===item.ok){if(!state.quiz.correctFirst.includes(state.quiz.index))state.quiz.correctFirst.push(state.quiz.index);state.quiz.phase="feedback";}else{state.quiz.errors+=1;state.quiz.phase="recovery";}save();renderQuiz();});return;
  }
  if(state.quiz.phase==="recovery"){
    area.innerHTML=`<form class="quiz-card" id="recoveryForm"><p class="question-no">Recupero bloccante · sezione ${item.section}</p><h3>Ricostruisci il collegamento</h3><div class="quiz-feedback"><h4>Microlezione</h4><p>${item.r.lesson}</p><p><a href="#${item.section}">Rileggi la sezione pertinente</a></p></div><h3>${item.r.q}</h3>${item.r.a.map((answer,i)=>`<label><input type="radio" name="answer" value="${i}">${answer}</label>`).join("")}<button type="submit">Verifica il recupero</button><p id="recoveryStatus" role="status"></p></form>`;
    $("#recoveryForm").addEventListener("submit",event=>{event.preventDefault();const picked=event.currentTarget.elements.answer.value;if(picked===""){$("#recoveryStatus").textContent="Scegli una risposta di recupero.";return;}if(Number(picked)===item.r.ok){if(!state.quiz.recoveries.includes(state.quiz.index))state.quiz.recoveries.push(state.quiz.index);state.quiz.phase="feedback";}else{state.quiz.recoveryAttempts+=1;$("#recoveryStatus").textContent="Non ancora: rileggi la microlezione e prova di nuovo.";}save();if(state.quiz.phase==="feedback")renderQuiz();});return;
  }
  area.innerHTML=`<article class="quiz-card"><p class="question-no">Collegamento ricostruito</p><div class="quiz-feedback correct"><h4>${state.quiz.recoveries.includes(state.quiz.index)?"Recupero superato":"Risposta corretta"}</h4><p>${item.why}</p><p><a href="#${item.section}">Torna alla sezione ${item.section}</a></p></div><button id="quizNext" type="button">${state.quiz.index===11?"Concludi":"Domanda successiva"}</button></article>`;
  $("#quizNext").addEventListener("click",()=>{state.quiz.index+=1;if(state.quiz.index>=12){state.quiz.index=12;state.quiz.phase="done";state.quiz.completed=true;}else state.quiz.phase="question";save();renderQuiz();});
}
function initLightbox(){
  const box=$("#lightbox"),stage=$("#lightboxStage"),img=$("#lightboxImage"),caption=$("#lightboxCaption"),close=$("#lightboxClose"),reset=$("#zoomReset");let trigger=null,scale=1,x=0,y=0,drag=null,moved=false;
  const transform=()=>{img.style.transform=`translate(${x}px,${y}px) scale(${scale})`;reset.textContent=`${Math.round(scale*100)}%`;};
  const setScale=next=>{scale=Math.max(1,Math.min(4,next));if(scale===1){x=0;y=0;}transform();};
  const open=button=>{trigger=button;const figure=button.closest("figure"),source=figure.querySelector("img"),text=figure.querySelector("figcaption")?.textContent||source.alt;img.src=source.currentSrc||source.src;img.alt=source.alt;caption.textContent=text;scale=1;x=0;y=0;transform();box.hidden=false;document.body.classList.add("lightbox-open");close.focus();};
  const shut=()=>{box.hidden=true;document.body.classList.remove("lightbox-open");img.src="assets/images/pontormo-deposizione.webp";trigger?.focus();};
  document.querySelectorAll(".open-image").forEach(button=>button.addEventListener("click",()=>open(button)));
  $("#zoomIn").addEventListener("click",()=>setScale(scale+.35));$("#zoomOut").addEventListener("click",()=>setScale(scale-.35));reset.addEventListener("click",()=>setScale(1));close.addEventListener("click",shut);
  stage.addEventListener("pointerdown",event=>{if(event.target!==img)return;drag={id:event.pointerId,sx:event.clientX,sy:event.clientY,x,y};moved=false;stage.setPointerCapture(event.pointerId);stage.classList.add("dragging");});
  stage.addEventListener("pointermove",event=>{if(!drag||drag.id!==event.pointerId||scale===1)return;const dx=event.clientX-drag.sx,dy=event.clientY-drag.sy;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;x=drag.x+dx;y=drag.y+dy;transform();});
  stage.addEventListener("pointerup",event=>{if(drag?.id===event.pointerId){drag=null;stage.classList.remove("dragging");}});
  stage.addEventListener("click",event=>{if(event.target===stage&&!moved)shut();});box.addEventListener("click",event=>{if(event.target===box)shut();});
  document.addEventListener("keydown",event=>{if(box.hidden)return;if(event.key==="Escape")shut();if(event.key==="+")setScale(scale+.35);if(event.key==="-")setScale(scale-.35);if(event.key==="Tab"){const controls=[...box.querySelectorAll("button")];const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
}
function initServiceWorker(){if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}

renderTimeline();renderCausal();renderManner();renderCenter();renderBody();renderColour();renderArchitecture();renderPortrait();renderSacred();renderNetwork();renderCompare();renderQuiz();
initProgress();initNotes();initMenu();initResets();initLightbox();initServiceWorker();
