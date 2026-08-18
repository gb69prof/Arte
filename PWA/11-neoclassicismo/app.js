"use strict";

const STORAGE_KEY = "storia-sguardo-11-state";
const VERSION = 1;
const SECTION_IDS = ["prima","mondo","settecento","neoclassico","orazi","linea","canova","virtu","marat","potere","museo","confronto","ritorno"];
const DEFAULT_STATE = {
  version: VERSION,
  visited: [],
  notes: { first: "", final: "" },
  timeline: 0,
  causal: "archeologia",
  term: "modelli",
  horatii: [],
  line: "line",
  sculpture: "processo",
  gender: "maschile",
  marat: [],
  napoleon: "posa",
  flow: "rovina",
  compare: "composizione",
  quiz: { index: 0, phase: "question", correctFirst: [], errors: 0, recoveries: [], recoveryAttempts: 0, completed: false }
};
const clone = value => JSON.parse(JSON.stringify(value));
const allowed = (value, list, fallback) => list.includes(value) ? value : fallback;
function loadState(){
  let raw = {};
  try { raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { raw = {}; }
  const state = clone(DEFAULT_STATE);
  if(!raw || typeof raw !== "object") return state;
  state.visited = Array.isArray(raw.visited) ? [...new Set(raw.visited.filter(n => Number.isInteger(n) && n >= 1 && n <= 13))] : [];
  state.notes.first = typeof raw.notes?.first === "string" ? raw.notes.first.slice(0, 6000) : "";
  state.notes.final = typeof raw.notes?.final === "string" ? raw.notes.final.slice(0, 6000) : "";
  state.timeline = Number.isInteger(raw.timeline) && raw.timeline >= 0 && raw.timeline < TIMELINE.length ? raw.timeline : 0;
  state.causal = allowed(raw.causal, Object.keys(CAUSAL), "archeologia");
  state.term = allowed(raw.term, Object.keys(TERMS), "modelli");
  state.horatii = Array.isArray(raw.horatii) ? [...new Set(raw.horatii.filter(x => Object.keys(HORATII).includes(x)))] : [];
  state.line = allowed(raw.line, Object.keys(LINE_MODES), "line");
  state.sculpture = allowed(raw.sculpture, Object.keys(SCULPTURE), "processo");
  state.gender = allowed(raw.gender, Object.keys(GENDER), "maschile");
  state.marat = Array.isArray(raw.marat) ? [...new Set(raw.marat.filter(x => Object.keys(MARAT).includes(x)))] : [];
  state.napoleon = allowed(raw.napoleon, Object.keys(NAPOLEON), "posa");
  state.flow = allowed(raw.flow, Object.keys(FLOW), "rovina");
  state.compare = allowed(raw.compare, Object.keys(COMPARE), "composizione");
  const q = raw.quiz && typeof raw.quiz === "object" ? raw.quiz : {};
  state.quiz.index = Number.isInteger(q.index) ? Math.max(0, Math.min(12, q.index)) : 0;
  state.quiz.phase = allowed(q.phase, ["question","recovery","feedback","done"], "question");
  state.quiz.correctFirst = Array.isArray(q.correctFirst) ? [...new Set(q.correctFirst.filter(n => Number.isInteger(n) && n >= 0 && n < 12))] : [];
  state.quiz.errors = Number.isInteger(q.errors) && q.errors >= 0 ? Math.min(q.errors, 999) : 0;
  state.quiz.recoveries = Array.isArray(q.recoveries) ? [...new Set(q.recoveries.filter(n => Number.isInteger(n) && n >= 0 && n < 12))] : [];
  state.quiz.recoveryAttempts = Number.isInteger(q.recoveryAttempts) && q.recoveryAttempts >= 0 ? Math.min(q.recoveryAttempts, 999) : 0;
  state.quiz.completed = Boolean(q.completed);
  if(state.quiz.completed){ state.quiz.index = 12; state.quiz.phase = "done"; }
  if(state.quiz.index >= 12 && !state.quiz.completed){ state.quiz.index = 12; state.quiz.phase = "done"; state.quiz.completed = true; }
  return state;
}
const $ = selector => document.querySelector(selector);
let state;
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

const TIMELINE = [
  {date:"1715–1780",title:"Illuminismo",text:"Ragione, riforma, pubblica opinione e critica dell’autorità trasformano il modo di pensare educazione, politica e gusto. L’arte non resta fuori: deve mostrare ordine, chiarezza e utilità morale."},
  {date:"1738",title:"Ercolano",text:"Gli scavi borbonici aprono un nuovo rapporto con l’antico. Reperti, disegni e descrizioni entrano nel mercato europeo dell’immaginario."},
  {date:"1748",title:"Pompei",text:"Pompei rende visibile una vita antica quotidiana, non soltanto monumentale. Ma non basta scavare: serve interpretare, scegliere, pubblicare, collezionare."},
  {date:"1755–1764",title:"Winckelmann",text:"Winckelmann propone una storia dell’arte antica fondata su ideale, bellezza e grandezza morale. Il suo antico è potentissimo, ma anche parziale e costruito."},
  {date:"1760–1780",title:"Grand Tour e repertori",text:"Viaggiatori, artisti, incisioni, libri illustrati e calchi diffondono modelli. L’antico circola come esperienza, oggetto, immagine, capitale culturale."},
  {date:"1776–1789",title:"Rivoluzioni",text:"Rivoluzione americana e francese fanno dell’antico repubblicano un lessico politico: virtù, sacrificio, cittadinanza, legge."},
  {date:"1792–1794",title:"Repubblica e Terrore",text:"La libertà rivoluzionaria convive con violenza e culto civile. L’immagine può commemorare, educare e mobilitare."},
  {date:"1793–1815",title:"Musei e Napoleone",text:"Il museo moderno promette accesso pubblico, ma l’Impero usa requisizioni, spoliazioni e immagini monumentali per costruire prestigio e dominio."}
];
const CAUSAL = {
  archeologia:{label:"Archeologia",title:"Conoscere non significa solo trovare",text:"Scavi e reperti cambiano ciò che l’Europa vede dell’antico, ma ogni reperto passa attraverso selezione, disegno, restauro, mercato e racconto."},
  accademie:{label:"Accademie",title:"La forma si insegna",text:"Disegno, copia, concorso e gerarchie dei generi formano artisti capaci di collegare anatomia, storia antica e composizione morale."},
  mercato:{label:"Mercato",title:"L’antico diventa gusto",text:"Collezionisti, viaggiatori e aristocratici acquistano oggetti, calchi, stampe e dipinti. Il gusto è anche economia e distinzione sociale."},
  tour:{label:"Grand Tour",title:"Viaggiare per diventare colti",text:"Roma, Napoli, Ercolano, Pompei e le collezioni diventano tappe di formazione. Lo sguardo europeo si educa viaggiando, copiando, possedendo."},
  filosofia:{label:"Illuminismo",title:"Ragione e riforma",text:"La bellezza viene pensata come strumento di educazione. L’opera ideale deve parlare a un pubblico più ampio e costruire giudizio."},
  rivoluzioni:{label:"Rivoluzioni",title:"L’antico come linguaggio politico",text:"Roma repubblicana, sacrificio e virtù diventano modelli per immaginare cittadini, non soltanto sudditi."},
  musei:{label:"Musei",title:"Pubblico e possesso",text:"Il museo promette accesso universale, ma decide anche che cosa vale, chi possiede il patrimonio e quale storia deve essere raccontata."},
  propaganda:{label:"Propaganda",title:"La forma non è neutrale",text:"Una composizione ordinata può educare alla libertà o costruire obbedienza. La chiarezza formale non garantisce innocenza politica."}
};
const TERMS = {
  modelli:{label:"Ritorno ai modelli",title:"Tornare all’antico è una scelta moderna",text:"Il Neoclassicismo seleziona Grecia e Roma come strumenti per criticare il presente e proporre un ordine nuovo. Non copia l’antico: lo usa come grammatica."},
  ideale:{label:"Bellezza ideale",title:"La bellezza deve apparire regolata",text:"Linea, contorno, proporzione e misura promettono una forma capace di dominare passione e disordine. L’ideale non cancella la storia: prova a governarla."},
  storiografia:{label:"Categoria storica",title:"Neoclassico è anche un nome successivo",text:"Come ogni categoria, raccoglie fenomeni diversi: archeologia, accademia, pittura morale, scultura, moda, politica rivoluzionaria e imperiale."}
};
const HORATII = {
  arches:{label:"Archi",className:"horatii-show-arches",text:"I tre archi separano i gruppi e trasformano la scena in un teatro di decisioni. L’architettura non è sfondo: ordina il giudizio.",equivalent:"Tre archi scandiscono tre zone e rendono pubblica la scelta."},
  groups:{label:"Gruppi",className:"horatii-show-groups",text:"A sinistra i corpi maschili tendono verso il giuramento; a destra le donne raccolgono il dolore. La composizione assegna funzioni sociali diverse.",equivalent:"Il gruppo maschile occupa lo spazio dell’azione; il gruppo femminile quello del dolore familiare."},
  swords:{label:"Spade",className:"horatii-show-swords",text:"Le spade stanno al centro visivo e morale. Non sono solo armi: condensano città, dovere, promessa e possibile morte.",equivalent:"Le spade sono il centro della decisione civica."},
  arms:{label:"Braccia",className:"horatii-show-arms",text:"Le braccia tese rendono il gesto ripetibile e normativo. Lo spettatore vede un modello più che un episodio privato.",equivalent:"Le braccia convergono e rendono il giuramento il gesto dominante."},
  light:{label:"Luce",className:"horatii-show-light",text:"La luce isola ciò che deve essere compreso: gesto, corpi, spade. Il resto è subordinato alla leggibilità morale.",equivalent:"Le zone illuminate guidano lo sguardo verso la decisione."},
  triangles:{label:"Triangoli",className:"horatii-show-triangles",text:"Triangoli rigidi e gruppi raccolti stabilizzano la scena. La passione esiste, ma viene incanalata dentro una forma controllata.",equivalent:"La composizione usa forme triangolari per dare stabilità al conflitto."}
};
const LINE_MODES = {
  line:{label:"Contorno",title:"La linea separa",text:"Il contorno netto distingue corpo, gesto e spazio. La figura diventa leggibile come esempio, non come apparizione ambigua.",equivalent:"Contorno netto: il gesto è separato dallo sfondo e diventa leggibile."},
  volume:{label:"Volume",title:"Il corpo acquista massa",text:"Il volume fa sentire presenza e peso. Se prevale troppo, il corpo torna esperienza fisica prima che modello morale.",equivalent:"Volume evidenziato: la figura appare più corporea e meno astratta."},
  color:{label:"Colore",title:"Il colore seduce",text:"Il colore può coinvolgere e rendere sensibile. Per il gusto neoclassico, però, rischia di distrarre dalla chiarezza del disegno.",equivalent:"Colore dominante: l’emozione cromatica compete con il contorno."},
  chiaroscuro:{label:"Chiaroscuro",title:"La luce drammatizza",text:"Il chiaroscuro può rendere un gesto teatrale e incerto. David lo usa con controllo, ma non come travolgimento barocco.",equivalent:"Chiaroscuro forte: la forma diventa più drammatica e meno uniforme."},
  posture:{label:"Postura",title:"Il corpo obbedisce al gesto",text:"Una postura stabile rende il corpo capace di rappresentare disciplina. Il movimento viene trattenuto prima di diventare disordine.",equivalent:"Postura stabile: il corpo sembra assumere una norma."},
  motion:{label:"Movimento trattenuto",title:"Energia sotto controllo",text:"La figura contiene tensione senza esplodere. La virtù appare come dominio di sé, non come assenza di passione.",equivalent:"Movimento trattenuto: l’energia resta controllata dalla forma."}
};
const SCULPTURE = {
  processo:{label:"Disegno → creta → gesso → marmo",title:"L’ideale nasce da un processo materiale",text:"Canova non libera semplicemente una forma dal marmo. Disegna, modella, corregge, fa tradurre in gesso e marmo, poi lavora la superficie."},
  superficie:{label:"Superficie",title:"Il marmo cattura la luce",text:"La levigatezza non è vuoto decorativo: controlla il passaggio della luce e fa oscillare il corpo fra carne, mito e materia."},
  vista:{label:"Punto di vista",title:"La scultura chiede movimento",text:"Amore e Psiche obbliga a girare intorno ai corpi. L’ideale non è solo frontale: si costruisce nel tempo dello sguardo."},
  desiderio:{label:"Desiderio",title:"Virtù e desiderio non sono separati",text:"Il mito consente di rappresentare erotismo e delicatezza dentro una forma accettabile. Il corpo ideale non elimina l’ambiguità."},
  prestigio:{label:"Prestigio sociale",title:"Paolina è persona e mito",text:"Paolina Borghese diventa Venere vincitrice. La bellezza ideale serve anche a costruire rango, memoria dinastica e autorappresentazione."}
};
const GENDER = {
  maschile:{label:"Cittadino armato",title:"Virtù maschile: decisione pubblica",text:"Negli Orazi la virtù maschile è gesto, giuramento, sacrificio militare. Il corpo è educato a subordinare la famiglia alla città."},
  femminile:{label:"Madre repubblicana",title:"Virtù femminile: educazione",text:"In Kauffman Cornelia non mostra gioielli, ma figli. La maternità viene trasformata in fondazione morale della cittadinanza."},
  esclusione:{label:"Esclusione politica",title:"Funzione essenziale, accesso negato",text:"Le donne appaiono centrali nella costruzione morale della patria, ma spesso restano escluse dalla cittadinanza politica piena."},
  parola:{label:"Parola e gesto",title:"La virtù non è solo combattere",text:"Cornelia indica, insegna, risponde al lusso con un altro valore. La virtù femminile viene resa pedagogica e domestica."}
};
const MARAT = {
  void:{label:"Fondo vuoto",className:"marat-show-void",text:"Il vuoto elimina la stanza, Charlotte Corday e il rumore politico. L’immagine non mostra tutto: sceglie ciò che deve restare nella memoria.",equivalent:"Il fondo vuoto cancella il contesto e concentra l’attenzione sul corpo."},
  body:{label:"Corpo",className:"marat-show-body",text:"Il corpo è composto come una deposizione laica. La politica assume una forma di martirio riconoscibile allo spettatore cristiano.",equivalent:"Il corpo reclinato richiama formule di pietà e martirio."},
  wound:{label:"Ferita",className:"marat-show-wound",text:"La ferita è piccola ma decisiva. Non domina il quadro: basta a trasformare la serenità del corpo in assassinio politico.",equivalent:"La ferita minima dichiara la violenza senza spettacolarizzarla."},
  letter:{label:"Lettera",className:"marat-show-letter",text:"La lettera costruisce la narrazione della vittima ingannata. Non è un documento neutro: orienta il giudizio su Marat e Corday.",equivalent:"La lettera seleziona una versione morale dell’evento."},
  box:{label:"Cassa",className:"marat-show-box",text:"La cassa di legno funziona come altare povero, scrivania e base del monumento. La semplicità diventa virtù rivoluzionaria.",equivalent:"La cassa povera trasforma la scena in monumento civile."},
  signature:{label:"Firma",className:"marat-show-signature",text:"La dedica di David lega artista, amico e causa politica. L’autore entra nell’immagine come testimone e costruttore di memoria.",equivalent:"La firma dichiara una responsabilità politica dell’immagine."}
};
const NAPOLEON = {
  posa:{label:"Posa",title:"Il corpo politico supera il corpo reale",text:"Napoleone non attraversò il passo così. David costruisce un corpo eroico capace di apparire destino, non cronaca."},
  cavallo:{label:"Cavallo",title:"L’energia obbedisce",text:"Il cavallo impennato dà forza alla scena, ma la mano di Napoleone la dirige. Il potere appare come dominio della tempesta."},
  iscrizioni:{label:"Iscrizioni",title:"Entrare nella genealogia degli eroi",text:"Hannibal e Karolus Magnus inscrivono Napoleone nella serie dei grandi attraversatori delle Alpi. L’immagine produce continuità mitica."},
  scala:{label:"Scala",title:"Il singolo diventa storia",text:"Nell’incoronazione la scala monumentale trasforma un atto politico in evento storico totale: corte, Chiesa, famiglia e Stato sono messi in scena."},
  simboli:{label:"Simboli imperiali",title:"La virtù diventa cerimoniale",text:"Mantelli, corona, trono, aquile, marmi e presenza papale costruiscono legittimità. La chiarezza neoclassica diventa teatro del potere."}
};
const FLOW = {
  rovina:{label:"Rovina o scavo",title:"Il reperto entra nella storia",text:"Una rovina non parla da sola. Deve essere scavata, descritta, protetta, posseduta, interpretata."},
  disegno:{label:"Disegno",title:"Vedere significa tradurre",text:"Il disegno seleziona proporzioni, dettagli e punti di vista. Forma l’occhio dell’artista e dell’accademia."},
  incisione:{label:"Incisione",title:"La copia viaggia",text:"L’incisione rende i modelli riproducibili. Chi non vede Roma può comunque studiare un’immagine di Roma."},
  libro:{label:"Libro illustrato",title:"Il sapere diventa portatile",text:"Repertori e volumi archeologici ordinano l’antico e costruiscono un gusto condiviso."},
  accademia:{label:"Accademia",title:"Il modello diventa norma",text:"La scuola trasforma l’antico in esercizio: copia, anatomia, storia, concorso, gerarchia."},
  artista:{label:"Artista",title:"Il modello viene reinventato",text:"L’artista non ripete meccanicamente. Traduce il modello antico dentro domande moderne."},
  esposizione:{label:"Salon",title:"Il pubblico giudica",text:"L’opera entra in spazi di discussione, critica, stampa e opinione pubblica."},
  museo:{label:"Museo",title:"Accesso e appropriazione",text:"Il museo moderno conserva e mostra, ma nasce anche dentro conflitti di guerra, spoliazione e definizione del patrimonio."}
};
const WORKS = [
  {title:"Caravaggio",era:"Presenza e persuasione",image:"assets/images/caravaggio-vocazione.webp",alt:"Caravaggio, Vocazione di san Matteo"},
  {title:"Fragonard",era:"Piacere privato rococò",image:"assets/images/fragonard-altalena.webp",alt:"Fragonard, L'altalena"},
  {title:"David",era:"Virtù civica neoclassica",image:"assets/images/orazi.webp",alt:"David, Il giuramento degli Orazi"},
  {title:"Goya",era:"Crisi della ragione storica",image:"assets/images/goya-3-maggio.webp",alt:"Goya, Il 3 maggio 1808"}
];
const CATEGORY_LABELS = {composizione:"Composizione",centro:"Centro",spazio:"Spazio",corpo:"Corpo",proporzione:"Proporzione",gesto:"Gesto",movimento:"Movimento",colore:"Colore",luce:"Luce",tempo:"Tempo",emozione:"Emozione",spettatore:"Rapporto con lo spettatore",cittadinanza:"Cittadinanza",potere:"Committenza e potere",realta:"Idea di realtà"};
const COMPARE = {
  composizione:["Taglio laterale, stanza buia, luce che rende presente l’evento.","Composizione curva, mobile, immersa nel giardino.","Frontale, ordinata per gruppi e archi.","Scena frontale ma spezzata: vittime illuminate, soldati come macchina."],
  centro:["Il centro è la chiamata, non un corpo isolato.","Il centro si muove con l’altalena e lo sguardo desiderante.","Il centro morale sono spade e giuramento.","Il centro è il corpo bianco che alza le braccia davanti al plotone."],
  spazio:["Lo spazio sembra continuare davanti allo spettatore.","Spazio privato, nascosto, aristocratico.","Spazio architettonico pubblico e misurabile.","Spazio notturno, aperto, senza protezione."],
  corpo:["Corpi comuni, abiti contemporanei, mani reali.","Corpo elegante e seduttivo, alleggerito dal gioco.","Corpo disciplinato dal dovere.","Corpo vulnerabile, esposto alla violenza storica."],
  proporzione:["Plausibile e ravvicinata.","Grazia elastica e ornamentale.","Proporzione subordinata alla chiarezza morale.","Proporzione drammatica: masse contrapposte, vittime e soldati."],
  gesto:["La mano chiama e apre una decisione.","Il gesto allude e seduce.","Il braccio teso promette sacrificio.","Le braccia alzate non comandano: supplicano e accusano."],
  movimento:["Istante sospeso prima della risposta.","Oscillazione, gioco, leggerezza.","Movimento trattenuto dentro l’ordine.","Movimento bloccato dalla fucilazione imminente."],
  colore:["Toni caldi inghiottiti dal buio.","Rosa, verdi e luminosità sensuale.","Colori sobri e controllati.","Contrasto violento fra luce gialla, bianco e notte."],
  luce:["La luce chiama e seleziona.","La luce accarezza la scena privata.","La luce chiarisce il gesto morale.","La luce denuncia e non consola."],
  tempo:["Il momento della conversione.","Il tempo del gioco aristocratico.","Il tempo solenne del giuramento.","Il tempo prima della morte irreparabile."],
  emozione:["Dubbio e riconoscimento.","Piacere, complicità, seduzione.","Dovere, dolore, disciplina.","Terrore, pietà, rivolta morale."],
  spettatore:["È coinvolto nello spazio dell’evento.","È complice di un segreto.","È chiamato a giudicare un modello.","È chiamato a testimoniare l’orrore."],
  cittadinanza:["La dignità entra nel sacro attraverso corpi comuni.","Il pubblico implicito è aristocratico e privato.","La città prevale sulla famiglia come valore politico.","La guerra mostra il cittadino come vittima del potere armato."],
  potere:["Committenza religiosa e persuasione cattolica.","Cultura aristocratica del piacere privato.","Committenza e pubblico pre-rivoluzionario leggono virtù civica.","Memoria nazionale e critica della violenza napoleonica."],
  realta:["Realtà come presenza corporea.","Realtà come scena di desiderio costruito.","Realtà come esempio morale ordinato.","Realtà come trauma che incrina ogni ordine."]
};
const QUIZ = [
  {section:"mondo",q:"Quale rapporto lega Barocco, Rococò e Neoclassicismo nel modulo?",a:["Il Neoclassicismo cancella tutto ciò che lo precede","La persuasione visiva viene riorientata verso educazione morale e cittadinanza","Il Rococò è soltanto decadenza senza valore culturale"],ok:1,why:"Il passaggio decisivo è dalla presenza persuasiva alla disciplina morale dell’immagine.",r:{lesson:"Il Rococò mostra piacere privato e cultura aristocratica; il Barocco coinvolge e persuade; il Neoclassicismo domanda se l’immagine possa educare un cittadino.",q:"Il modulo interpreta il Neoclassicismo come...",a:["semplice imitazione decorativa","progetto morale e politico della forma","rifiuto totale della persuasione"],ok:1}},
  {section:"settecento",q:"Perché gli scavi non bastano a spiegare il Neoclassicismo?",a:["Perché non furono conosciuti in Europa","Perché agiscono dentro una rete di mercato, viaggi, accademie, libri e politica","Perché riguardavano solo il Medioevo"],ok:1,why:"Gli scavi modificano conoscenze e immaginario, ma non producono da soli uno stile.",r:{lesson:"Un reperto diventa influente solo quando viene disegnato, pubblicato, copiato, venduto, discusso e inserito nella formazione degli artisti.",q:"La rete causale include...",a:["solo archeologia","archeologia, accademie, mercato, filosofia, musei e rivoluzioni","solo biografie di artisti"],ok:1}},
  {section:"neoclassico",q:"Qual è il problema della formula di Winckelmann?",a:["Va capita nel suo contesto e non trasformata in formula magica","Dimostra che la scultura antica era sempre bianca","Rende inutile studiare le copie romane"],ok:0,why:"Winckelmann costruisce un ideale potente, ma parziale e storicamente situato.",r:{lesson:"Winckelmann conosceva molte opere attraverso copie romane e dentro un’immagine moderna dell’antico. La policromia antica e la distanza fra Grecia storica e Grecia immaginata complicano il quadro.",q:"L’antico settecentesco è...",a:["sempre identico alla Grecia storica","anche una costruzione moderna","solo una moda senza idee"],ok:1}},
  {section:"orazi",q:"Negli Orazi, dove si costruisce la morale?",a:["Solo nel titolo dell’opera","Nel soggetto e nella composizione: linee, gruppi, spade, architettura","Solo nei colori brillanti"],ok:1,why:"La morale è resa visibile da architettura, gesti, separazioni e centri compositivi.",r:{lesson:"David non racconta solo un episodio antico. Organizza lo spazio perché il sacrificio civico appaia leggibile e necessario.",q:"Le spade al centro funzionano come...",a:["un dettaglio secondario","centro morale della decisione","decorazione militare casuale"],ok:1}},
  {section:"linea",q:"Perché la linea è importante nel gusto neoclassico?",a:["Rende il gesto leggibile e controlla l’ambiguità","Serve a nascondere la composizione","Sostituisce sempre ogni emozione"],ok:0,why:"Il contorno disciplina il corpo e lo trasforma in esempio, ma non elimina del tutto la passione.",r:{lesson:"La linea separa le forme, chiarisce il gesto e riduce l’ambiguità: per questo sembra adatta a rappresentare virtù e dominio di sé.",q:"Nel modulo, il simulatore linea/colore è...",a:["un’opera autentica ricolorata","un modello didattico dichiarato","una fotografia storica"],ok:1}},
  {section:"canova",q:"Che cosa va evitato parlando di Canova?",a:["Ridurre Canova alla sola levigatezza del marmo","Studiare il punto di vista","Collegare corpo ideale e processo di bottega"],ok:0,why:"Canova lavora con modelli, bottega, superfici, luce e ambiguità fra mito, desiderio e prestigio.",r:{lesson:"Il corpo ideale canoviano nasce da un processo materiale: disegni, creta, gesso, marmo, finitura e condizioni di esposizione.",q:"In Paolina Borghese il mito serve anche a...",a:["cancellare ogni prestigio sociale","costruire autorappresentazione e status","fare cronaca politica neutrale"],ok:1}},
  {section:"virtu",q:"Che cosa mostra il confronto fra virtù maschile e femminile?",a:["Le donne sono assenti da ogni immagine neoclassica","Le immagini danno alle donne funzione morale essenziale, spesso senza piena cittadinanza politica","La virtù femminile coincide con il comando militare"],ok:1,why:"La madre repubblicana educa cittadini, ma ciò non equivale automaticamente a cittadinanza politica piena.",r:{lesson:"Cornelia indica i figli come tesori: la sua virtù è pedagogica e familiare, ma decisiva per la costruzione morale della cittadinanza.",q:"Cornelia oppone ai gioielli...",a:["i figli come valore civile","le armi come valore privato","il lusso come unico modello"],ok:0}},
  {section:"marat",q:"Perché La morte di Marat non è una fotografia neutrale?",a:["Perché seleziona elementi e costruisce un martire politico","Perché non rappresenta alcun personaggio reale","Perché è un dipinto astratto"],ok:0,why:"David elimina rumore visivo e orienta il giudizio attraverso corpo, lettera, cassa e citazioni religiose.",r:{lesson:"Fatto storico e immagine politica non coincidono: la composizione trasforma Marat in memoria pubblica e culto civile.",q:"Il fondo vuoto in Marat serve a...",a:["decorare la stanza","concentrare la memoria sul corpo e cancellare il rumore","mostrare tutti i testimoni"],ok:1}},
  {section:"potere",q:"Come cambia la lingua neoclassica con Napoleone?",a:["Smette di essere chiara","Può trasformare virtù e ordine in immagine del potere imperiale","Diventa solo paesaggio naturale"],ok:1,why:"La stessa chiarezza formale può servire Repubblica, culto civile e mito imperiale.",r:{lesson:"Il corpo eroico, la posa, le iscrizioni e la scala monumentale non descrivono soltanto: costruiscono legittimità.",q:"Nel Bonaparte al Gran San Bernardo, la posa...",a:["è cronaca fedele dell’attraversamento","costruisce un corpo politico eroico","elimina ogni riferimento storico"],ok:1}},
  {section:"museo",q:"Quale tensione caratterizza il museo moderno?",a:["Accesso pubblico e conflitti di possesso, conquista e patrimonio","Solo piacere privato aristocratico","Assenza totale di politica"],ok:0,why:"Il museo rende visibili opere a nuovi pubblici, ma nasce anche fra requisizioni, spoliazioni e definizioni di patrimonio.",r:{lesson:"Rovina, disegno, incisione, libro, accademia, artista, Salon e museo formano un circuito di sapere e potere.",q:"La circolazione dei modelli passa anche attraverso...",a:["incisioni e libri illustrati","solo ricordi orali","solo fotografie ottocentesche"],ok:0}},
  {section:"confronto",q:"Arte civica e propaganda si distinguono sempre nettamente?",a:["Sì, basta guardare se l’opera è bella","No: la stessa lingua formale può educare, commemorare o costruire consenso","Sì, la propaganda non usa mai forme ordinate"],ok:1,why:"La forma razionale non è politicamente neutrale.",r:{lesson:"Ordine, chiarezza e bellezza possono sostenere libertà repubblicana o potere imperiale. Bisogna osservare committenza, pubblico e uso dell’immagine.",q:"La forma razionale è...",a:["sempre neutrale","sempre innocente","storicamente e politicamente situata"],ok:2}},
  {section:"ritorno",q:"Perché il Neoclassicismo prepara anche la crisi romantica?",a:["Perché la ragione prova a ordinare storia e passione, ma violenza, natura, sentimento e infinito eccedono la misura","Perché il Romanticismo copia solo David","Perché dopo il 1800 finisce ogni immagine politica"],ok:0,why:"La disciplina neoclassica contiene già tensioni che Goya e il Romanticismo renderanno più radicali.",r:{lesson:"Quando storia, violenza e sentimento non restano dentro la forma regolata, la misura neoclassica si incrina. È la soglia verso sublime, individuo e storia romantica.",q:"Goya nel confronto finale mostra...",a:["una crisi della fiducia nell’ordine","un ritorno al gioco rococò","una scena senza rapporto con la storia"],ok:0}}
];

state = loadState();

function renderTimeline(){
  const wrap = $("#timeline");
  wrap.innerHTML = TIMELINE.map((item,i) => `<button type="button" aria-pressed="${state.timeline===i}" data-index="${i}"><b>${item.date}</b>${item.title}</button>`).join("");
  const item = TIMELINE[state.timeline];
  $("#timelineReading").innerHTML = `<h3>${item.title}</h3><p>${item.text}</p>`;
  wrap.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { state.timeline = Number(button.dataset.index); save(); renderTimeline(); renderSynthesis(); }));
}
function renderCausal(){
  const wrap = $("#causalNodes");
  wrap.innerHTML = Object.entries(CAUSAL).map(([key,item]) => `<button type="button" data-key="${key}" aria-pressed="${state.causal===key}">${item.label}</button>`).join("");
  const item = CAUSAL[state.causal];
  $("#causalReading").innerHTML = `<h3>${item.title}</h3><p>${item.text}</p>`;
  wrap.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { state.causal = button.dataset.key; save(); renderCausal(); renderSynthesis(); }));
}
function renderTerms(){
  const wrap = $("#termTabs");
  wrap.innerHTML = Object.entries(TERMS).map(([key,item],i) => `<button type="button" role="tab" data-key="${key}" aria-selected="${state.term===key}"><span>0${i+1}</span>${item.label}</button>`).join("");
  const item = TERMS[state.term];
  $("#termReading").innerHTML = `<h3>${item.title}</h3><p>${item.text}</p>`;
  wrap.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { state.term = button.dataset.key; save(); renderTerms(); renderSynthesis(); }));
}
function renderLayerLab(config, stateKey, stageSelector, buttonsSelector, readingSelector, equivalentSelector){
  const stage = $(stageSelector), wrap = $(buttonsSelector);
  wrap.innerHTML = Object.entries(config).map(([key,item]) => `<button type="button" data-key="${key}" aria-pressed="${state[stateKey].includes(key)}">${item.label}</button>`).join("");
  Object.values(config).forEach(item => stage.classList.remove(item.className));
  state[stateKey].forEach(key => stage.classList.add(config[key].className));
  const latest = state[stateKey].at(-1);
  $(readingSelector).innerHTML = latest ? `<h3>${config[latest].label}</h3><p>${config[latest].text}</p>` : "<h3>Attiva uno strato</h3><p>Ogni sovrapposizione è una domanda visiva. L’opera resta più complessa del diagramma.</p>";
  $(equivalentSelector).textContent = latest ? `Equivalente testuale: ${state[stateKey].map(key => config[key].equivalent).join(" ")}` : "Equivalente testuale: nessuno strato attivo.";
  wrap.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    const key = button.dataset.key;
    state[stateKey] = state[stateKey].includes(key) ? state[stateKey].filter(x => x !== key) : [...state[stateKey], key];
    save(); renderLayerLab(config, stateKey, stageSelector, buttonsSelector, readingSelector, equivalentSelector); renderSynthesis();
  }));
}
function renderLine(){
  const wrap = $("#lineModes");
  wrap.innerHTML = Object.entries(LINE_MODES).map(([key,item]) => `<button type="button" data-key="${key}" aria-pressed="${state.line===key}">${item.label}</button>`).join("");
  const item = LINE_MODES[state.line];
  $("#lineModel").dataset.mode = state.line;
  $("#lineReading").innerHTML = `<h3>${item.title}</h3><p>${item.text}</p>`;
  $("#lineEquivalent").textContent = item.equivalent;
  wrap.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { state.line = button.dataset.key; save(); renderLine(); renderSynthesis(); }));
}
function renderSingle(config, stateKey, buttonsSelector, readingSelector, equivalentSelector){
  const wrap = $(buttonsSelector);
  wrap.innerHTML = Object.entries(config).map(([key,item]) => `<button type="button" data-key="${key}" aria-pressed="${state[stateKey]===key}">${item.label}</button>`).join("");
  const item = config[state[stateKey]];
  $(readingSelector).innerHTML = `<h3>${item.title}</h3><p>${item.text}</p>`;
  if(equivalentSelector) $(equivalentSelector).textContent = `Equivalente testuale: ${item.text}`;
  wrap.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { state[stateKey] = button.dataset.key; save(); renderSingle(config, stateKey, buttonsSelector, readingSelector, equivalentSelector); renderSynthesis(); }));
}
function renderFlow(){
  const wrap = $("#flowLab");
  wrap.innerHTML = Object.entries(FLOW).map(([key,item],i) => `<button type="button" data-key="${key}" aria-pressed="${state.flow===key}"><span>0${i+1}</span>${item.label}</button>`).join("");
  const item = FLOW[state.flow];
  $("#flowReading").innerHTML = `<h3>${item.title}</h3><p>${item.text}</p>`;
  wrap.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { state.flow = button.dataset.key; save(); renderFlow(); renderSynthesis(); }));
}
function renderCompare(){
  const wrap = $("#compareCategories");
  wrap.innerHTML = Object.keys(COMPARE).map(key => `<button type="button" data-key="${key}" aria-pressed="${state.compare===key}">${CATEGORY_LABELS[key]}</button>`).join("");
  const readings = COMPARE[state.compare];
  $("#compareGrid").innerHTML = WORKS.map((work,i) => `<article class="compare-card"><img src="${work.image}" alt="${work.alt}" width="600" height="420" loading="lazy"><div><h3>${work.title}</h3><span class="era">${work.era}</span><p><b>${CATEGORY_LABELS[state.compare]}.</b> ${readings[i]}</p></div></article>`).join("");
  wrap.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { state.compare = button.dataset.key; save(); renderCompare(); renderSynthesis(); }));
}
function renderSynthesis(){
  $("#openingMemory").textContent = state.notes.first || "Non hai ancora scritto un’annotazione.";
  const choices = [];
  if(state.timeline > 0 || state.causal !== "archeologia") choices.push("hai letto l’antico come rete storica e non come causa unica");
  if(state.horatii.length) choices.push("hai smontato la composizione morale degli Orazi");
  if(state.line !== "line") choices.push(`hai sperimentato ${LINE_MODES[state.line].label.toLowerCase()} come scelta formale`);
  if(state.sculpture !== "processo") choices.push(`hai osservato Canova attraverso ${SCULPTURE[state.sculpture].label.toLowerCase()}`);
  if(state.marat.length) choices.push("hai distinto fatto storico e memoria politica in Marat");
  if(state.napoleon !== "posa") choices.push("hai visto la lingua della virtù trasformarsi in immagine imperiale");
  const note = state.notes.final.trim() ? "Nel secondo taccuino hai formulato una rilettura autonoma dell’opera." : "Il secondo taccuino attende ancora la tua rilettura.";
  $("#personalSynthesis").innerHTML = choices.length || state.notes.final.trim()
    ? `<h3>La tua sintesi</h3><p>Nel percorso ${choices.length ? choices.join(", ") : "hai riaperto l’immagine iniziale"}. ${note} La bellezza diventa virtù quando la forma pretende di educare il desiderio e il dolore; diventa propaganda quando quella stessa chiarezza costruisce obbedienza senza lasciarsi interrogare.</p>`
    : "<h3>La tua sintesi</h3><p>Completa almeno un laboratorio e il secondo taccuino per generare una sintesi personale.</p>";
}
function updateProgress(){ const count = state.visited.length; $("#readingProgress").value = count; $("#progressText").textContent = `${count} di 13 tappe`; }
function initProgress(){
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting){
      const step = Number(entry.target.dataset.step);
      if(!state.visited.includes(step)){ state.visited.push(step); state.visited.sort((a,b)=>a-b); save(); updateProgress(); }
    }
  }), {threshold:.25});
  document.querySelectorAll(".tracked").forEach(section => observer.observe(section));
  updateProgress();
}
function initNotes(){
  const first = $("#openingNote"), final = $("#returnNote");
  first.value = state.notes.first; final.value = state.notes.final; renderSynthesis();
  let timer;
  const bind = (input,key,status) => input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.notes[key] = input.value.slice(0,6000); save(); $(status).textContent = "Salvato su questo dispositivo."; renderSynthesis(); }, 280);
  });
  bind(first,"first","#openingSave"); bind(final,"final","#returnSave");
}
function initMenu(){
  const menu = $("#chapterMenu"), scrim = $("#menuScrim"), open = $("#menuButton"), close = $("#menuClose");
  const show = () => { menu.hidden = false; scrim.hidden = false; open.setAttribute("aria-expanded","true"); close.focus(); };
  const hide = () => { menu.hidden = true; scrim.hidden = true; open.setAttribute("aria-expanded","false"); open.focus(); };
  open.addEventListener("click", show); close.addEventListener("click", hide); scrim.addEventListener("click", hide);
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", hide));
  document.addEventListener("keydown", event => { if(event.key === "Escape" && !menu.hidden) hide(); });
  $("#resetState").addEventListener("click", () => { if(confirm("Cancellare taccuini, avanzamento, laboratori e verifica salvati su questo dispositivo?")){ localStorage.removeItem(STORAGE_KEY); location.reload(); } });
}
function initResets(){
  $("#timelineReset").addEventListener("click", () => { state.timeline = 0; save(); renderTimeline(); renderSynthesis(); });
  $("#causalReset").addEventListener("click", () => { state.causal = "archeologia"; save(); renderCausal(); renderSynthesis(); });
  $("#termReset").addEventListener("click", () => { state.term = "modelli"; save(); renderTerms(); renderSynthesis(); });
  $("#horatiiReset").addEventListener("click", () => { state.horatii = []; save(); renderLayerLab(HORATII,"horatii","#horatiiStage","#horatiiButtons","#horatiiReading","#horatiiEquivalent"); renderSynthesis(); });
  $("#lineReset").addEventListener("click", () => { state.line = "line"; save(); renderLine(); renderSynthesis(); });
  $("#sculptureReset").addEventListener("click", () => { state.sculpture = "processo"; save(); renderSingle(SCULPTURE,"sculpture","#sculptureControls","#sculptureReading","#sculptureEquivalent"); renderSynthesis(); });
  $("#genderReset").addEventListener("click", () => { state.gender = "maschile"; save(); renderSingle(GENDER,"gender","#genderControls","#genderReading"); renderSynthesis(); });
  $("#maratReset").addEventListener("click", () => { state.marat = []; save(); renderLayerLab(MARAT,"marat","#maratStage","#maratButtons","#maratReading","#maratEquivalent"); renderSynthesis(); });
  $("#napoleonReset").addEventListener("click", () => { state.napoleon = "posa"; save(); renderSingle(NAPOLEON,"napoleon","#napoleonControls","#napoleonReading","#napoleonEquivalent"); renderSynthesis(); });
  $("#flowReset").addEventListener("click", () => { state.flow = "rovina"; save(); renderFlow(); renderSynthesis(); });
  $("#compareReset").addEventListener("click", () => { state.compare = "composizione"; save(); renderCompare(); renderSynthesis(); });
}
function renderQuiz(){
  const area = $("#quizArea"), meter = $("#quizMeter"), count = $("#quizCount");
  meter.value = Math.min(12,state.quiz.index);
  count.textContent = state.quiz.completed ? "Verifica completata" : `Domanda ${state.quiz.index + 1} di 12`;
  if(state.quiz.completed || state.quiz.phase === "done"){
    const needs = QUIZ.filter((_,i) => !state.quiz.correctFirst.includes(i)).map(item => `<a href="#${item.section}">${item.section}</a>`).join("") || "<span>Nessuno: tutte corrette al primo tentativo.</span>";
    area.innerHTML = `<article class="quiz-card quiz-summary"><p class="question-no">Percorso completato</p><h3>Hai attraversato bellezza, virtù e propaganda senza ridurle a slogan.</h3><div class="summary-grid"><article><b>${state.quiz.correctFirst.length}</b><span>corrette al primo tentativo</span></article><article><b>${state.quiz.errors}</b><span>errori iniziali</span></article><article><b>${state.quiz.recoveries.length}</b><span>recuperi superati</span></article><article><b>${12 - state.quiz.correctFirst.length}</b><span>nuclei da ripassare</span></article></div><p>Nuclei da riaprire:</p><div class="quiz-links">${needs}</div><button id="quizRestart" type="button">Ricomincia la verifica</button></article>`;
    $("#quizRestart").addEventListener("click", () => { state.quiz = clone(DEFAULT_STATE.quiz); save(); renderQuiz(); });
    return;
  }
  const item = QUIZ[state.quiz.index];
  if(state.quiz.phase === "question"){
    area.innerHTML = `<form class="quiz-card" id="questionForm"><p class="question-no">Nucleo ${state.quiz.index + 1}</p><h3>${item.q}</h3>${item.a.map((answer,i) => `<label><input type="radio" name="answer" value="${i}">${answer}</label>`).join("")}<button type="submit">Verifica</button><p id="questionStatus" role="status"></p></form>`;
    $("#questionForm").addEventListener("submit", event => {
      event.preventDefault();
      const picked = event.currentTarget.elements.answer.value;
      if(picked === ""){ $("#questionStatus").textContent = "Scegli una risposta."; return; }
      if(Number(picked) === item.ok){ if(!state.quiz.correctFirst.includes(state.quiz.index)) state.quiz.correctFirst.push(state.quiz.index); state.quiz.phase = "feedback"; }
      else { state.quiz.errors += 1; state.quiz.phase = "recovery"; }
      save(); renderQuiz();
    });
    return;
  }
  if(state.quiz.phase === "recovery"){
    area.innerHTML = `<form class="quiz-card" id="recoveryForm"><p class="question-no">Recupero bloccante · sezione ${item.section}</p><h3>Ricostruisci il collegamento</h3><div class="quiz-feedback"><h4>Microlezione</h4><p>${item.r.lesson}</p><p><a href="#${item.section}">Rileggi la sezione pertinente</a></p></div><h3>${item.r.q}</h3>${item.r.a.map((answer,i) => `<label><input type="radio" name="answer" value="${i}">${answer}</label>`).join("")}<button type="submit">Verifica il recupero</button><p id="recoveryStatus" role="status"></p></form>`;
    $("#recoveryForm").addEventListener("submit", event => {
      event.preventDefault();
      const picked = event.currentTarget.elements.answer.value;
      if(picked === ""){ $("#recoveryStatus").textContent = "Scegli una risposta di recupero."; return; }
      if(Number(picked) === item.r.ok){ if(!state.quiz.recoveries.includes(state.quiz.index)) state.quiz.recoveries.push(state.quiz.index); state.quiz.phase = "feedback"; save(); renderQuiz(); }
      else { state.quiz.recoveryAttempts += 1; save(); $("#recoveryStatus").textContent = "Non ancora: rileggi la microlezione e prova di nuovo."; }
    });
    return;
  }
  area.innerHTML = `<article class="quiz-card"><p class="question-no">Collegamento ricostruito</p><div class="quiz-feedback correct"><h4>${state.quiz.recoveries.includes(state.quiz.index) ? "Recupero superato" : "Risposta corretta"}</h4><p>${item.why}</p><p><a href="#${item.section}">Torna alla sezione ${item.section}</a></p></div><button id="quizNext" type="button">${state.quiz.index === 11 ? "Concludi" : "Domanda successiva"}</button></article>`;
  $("#quizNext").addEventListener("click", () => { state.quiz.index += 1; if(state.quiz.index >= 12){ state.quiz.index = 12; state.quiz.phase = "done"; state.quiz.completed = true; } else state.quiz.phase = "question"; save(); renderQuiz(); });
}
function initLightbox(){
  const box = $("#lightbox"), stage = $("#lightboxStage"), img = $("#lightboxImage"), caption = $("#lightboxCaption"), close = $("#lightboxClose"), reset = $("#zoomReset");
  let trigger = null, scale = 1, x = 0, y = 0, drag = null, moved = false;
  const transform = () => { img.style.transform = `translate(${x}px,${y}px) scale(${scale})`; reset.textContent = `${Math.round(scale * 100)}%`; };
  const setScale = next => { scale = Math.max(1, Math.min(4, next)); if(scale === 1){ x = 0; y = 0; } transform(); };
  const open = button => {
    trigger = button;
    const figure = button.closest("figure"), source = figure.querySelector("img"), text = figure.querySelector("figcaption")?.textContent || source.alt;
    img.src = source.currentSrc || source.src; img.alt = source.alt; caption.textContent = text; scale = 1; x = 0; y = 0; transform();
    box.hidden = false; document.body.classList.add("lightbox-open"); close.focus();
  };
  const shut = () => { box.hidden = true; document.body.classList.remove("lightbox-open"); img.src = "assets/images/orazi.webp"; trigger?.focus(); };
  document.querySelectorAll(".open-image").forEach(button => button.addEventListener("click", () => open(button)));
  $("#zoomIn").addEventListener("click", () => setScale(scale + .35)); $("#zoomOut").addEventListener("click", () => setScale(scale - .35)); reset.addEventListener("click", () => setScale(1)); close.addEventListener("click", shut);
  stage.addEventListener("pointerdown", event => { if(event.target !== img) return; drag = {id:event.pointerId,sx:event.clientX,sy:event.clientY,x,y}; moved = false; stage.setPointerCapture(event.pointerId); stage.classList.add("dragging"); });
  stage.addEventListener("pointermove", event => { if(!drag || drag.id !== event.pointerId || scale === 1) return; const dx = event.clientX - drag.sx, dy = event.clientY - drag.sy; if(Math.abs(dx)+Math.abs(dy)>4) moved = true; x = drag.x + dx; y = drag.y + dy; transform(); });
  stage.addEventListener("pointerup", event => { if(drag?.id === event.pointerId){ drag = null; stage.classList.remove("dragging"); } });
  stage.addEventListener("click", event => { if(event.target === stage && !moved) shut(); }); box.addEventListener("click", event => { if(event.target === box) shut(); });
  document.addEventListener("keydown", event => {
    if(box.hidden) return;
    if(event.key === "Escape") shut();
    if(event.key === "+") setScale(scale + .35);
    if(event.key === "-") setScale(scale - .35);
    if(event.key === "Tab"){
      const controls = [...box.querySelectorAll("button")], first = controls[0], last = controls.at(-1);
      if(event.shiftKey && document.activeElement === first){ event.preventDefault(); last.focus(); }
      else if(!event.shiftKey && document.activeElement === last){ event.preventDefault(); first.focus(); }
    }
  });
}
function initServiceWorker(){ if("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {})); }

renderTimeline(); renderCausal(); renderTerms();
renderLayerLab(HORATII,"horatii","#horatiiStage","#horatiiButtons","#horatiiReading","#horatiiEquivalent");
renderLine();
renderSingle(SCULPTURE,"sculpture","#sculptureControls","#sculptureReading","#sculptureEquivalent");
renderSingle(GENDER,"gender","#genderControls","#genderReading");
renderLayerLab(MARAT,"marat","#maratStage","#maratButtons","#maratReading","#maratEquivalent");
renderSingle(NAPOLEON,"napoleon","#napoleonControls","#napoleonReading","#napoleonEquivalent");
renderFlow(); renderCompare(); renderQuiz();
initProgress(); initNotes(); initMenu(); initResets(); initLightbox(); initServiceWorker();
