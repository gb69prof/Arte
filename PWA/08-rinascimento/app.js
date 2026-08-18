"use strict";

const STORAGE_KEY = "storia-sguardo-08-state";
const DEFAULT_STATE = {
  version: 1, openingNote: "", returnNote: "", visited: [], actor: "", roots: [], brunelleschi: "side",
  build: {steps: [], horizon: "middle", vanishing: "center", orthogonals: true, transversals: true, incoherent: false},
  trinity: [], media: {work: 0, category: "support"}, portrait: [], city: [], final: {work: 0, category: "surface"},
  quiz: {index: 0, correctFirst: [], wrongQuestions: [], errors: 0, recoveries: [], pending: null, readyNext: false, completed: false}
};

const clone = value => JSON.parse(JSON.stringify(value));
const listOf = (value, allowed) => Array.isArray(value) ? [...new Set(value.filter(item => allowed.includes(item)))] : [];
const intBetween = (value, min, max, fallback) => Number.isInteger(value) && value >= min && value <= max ? value : fallback;

function loadState() {
  let raw = {};
  try { raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { raw = {}; }
  const state = clone(DEFAULT_STATE);
  state.openingNote = typeof raw.openingNote === "string" ? raw.openingNote.slice(0, 12000) : "";
  state.returnNote = typeof raw.returnNote === "string" ? raw.returnNote.slice(0, 12000) : "";
  state.visited = listOf(raw.visited, Array.from({length: 13}, (_, i) => i + 1));
  state.actor = typeof raw.actor === "string" ? raw.actor : "";
  state.roots = listOf(raw.roots, [0,1,2,3,4,5,6]);
  state.brunelleschi = ["high","low","side","correct"].includes(raw.brunelleschi) ? raw.brunelleschi : "side";
  const build = raw.build && typeof raw.build === "object" ? raw.build : {};
  state.build.steps = listOf(build.steps, [1,2,3,4,5,6,7]);
  state.build.horizon = ["high","middle","low"].includes(build.horizon) ? build.horizon : "middle";
  state.build.vanishing = ["left","center","right"].includes(build.vanishing) ? build.vanishing : "center";
  state.build.orthogonals = build.orthogonals !== false;
  state.build.transversals = build.transversals !== false;
  state.build.incoherent = build.incoherent === true;
  state.trinity = listOf(raw.trinity, ["floor","eye","vanish","orthogonals","donors","sacred","tomb"]);
  state.media.work = intBetween(raw.media?.work, 0, 2, 0);
  state.media.category = MEDIA_CATEGORIES.includes(raw.media?.category) ? raw.media.category : "support";
  state.portrait = listOf(raw.portrait, ["face","dress","attributes","landscape","inscription","pair","absence"]);
  state.city = listOf(raw.city, ["center","axes","access","void","margins"]);
  state.final.work = intBetween(raw.final?.work, 0, 3, 0);
  state.final.category = FINAL_CATEGORIES.includes(raw.final?.category) ? raw.final.category : "surface";
  const quiz = raw.quiz && typeof raw.quiz === "object" ? raw.quiz : {};
  state.quiz.index = intBetween(quiz.index, 0, 12, 0);
  state.quiz.correctFirst = listOf(quiz.correctFirst, Array.from({length:12},(_,i)=>i));
  state.quiz.wrongQuestions = listOf(quiz.wrongQuestions, Array.from({length:12},(_,i)=>i));
  state.quiz.errors = intBetween(quiz.errors, 0, 999, 0);
  state.quiz.recoveries = listOf(quiz.recoveries, Array.from({length:12},(_,i)=>i));
  state.quiz.pending = Number.isInteger(quiz.pending) && quiz.pending >= 0 && quiz.pending < 12 ? quiz.pending : null;
  state.quiz.readyNext = quiz.readyNext === true;
  state.quiz.completed = quiz.completed === true || state.quiz.index >= 12;
  if (state.quiz.pending !== null) state.quiz.index = state.quiz.pending;
  return state;
}

let state;
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

const ACTORS = [
  {id:"patron",label:"Committente",resource:"denaro, cariche, reti",interest:"memoria, devozione, prestigio",decision:"alto: sceglie luogo e programma",work:"contratta e finanzia",visibility:"spesso entra nell’opera",dependence:"artisti, istituzioni, credito"},
  {id:"artist",label:"Artista",resource:"disegno, esperienza, reputazione",interest:"lavoro, invenzione, fama",decision:"variabile entro il contratto",work:"progetta e coordina",visibility:"crescente ma non assoluta",dependence:"committente, bottega, materiali"},
  {id:"architect",label:"Architetto",resource:"misura, progetto, cantiere",interest:"ordine, stabilità, reputazione",decision:"tecnico e formale",work:"coordina spazi e maestranze",visibility:"firma intellettuale emergente",dependence:"finanziatori, muratori, norme"},
  {id:"theorist",label:"Teorico",resource:"testi, latino, reti umanistiche",interest:"rendere comunicabile un metodo",decision:"sul linguaggio della disciplina",work:"scrive, traduce, seleziona",visibility:"tra élite alfabetizzate",dependence:"manoscritti, dedicatari, copisti"},
  {id:"mathematician",label:"Matematico",resource:"geometria e calcolo",interest:"problemi dimostrabili",decision:"sui modelli, non sull’intera opera",work:"fornisce procedure e lessico",visibility:"spesso indiretta",dependence:"scuole, corti, traduzioni"},
  {id:"workshop",label:"Bottega",resource:"persone, strumenti, modelli",interest:"continuità del lavoro",decision:"organizzativa",work:"produce, replica, sperimenta",visibility:"assorbita dal nome del maestro",dependence:"contratti, apprendisti, fornitori"},
  {id:"artisan",label:"Artigiano",resource:"saper fare materiale",interest:"salario, appartenenza, mestiere",decision:"alta sul gesto tecnico",work:"taglia, fonde, mura, prepara",visibility:"spesso minima",dependence:"bottega, corporazione, cantiere"},
  {id:"guild",label:"Corporazione",resource:"regole, denaro, identità civica",interest:"proteggere mestiere e prestigio",decision:"su commissioni pubbliche",work:"regola, giudica, finanzia",visibility:"stemmi, sedi, feste",dependence:"governo urbano e membri"},
  {id:"church",label:"Istituzione religiosa",resource:"spazi, liturgia, patrimonio",interest:"culto, insegnamento, memoria",decision:"su iconografia e uso",work:"commissiona e conserva",visibility:"centrale",dependence:"fedeli, ordini, patroni"},
  {id:"court",label:"Corte",resource:"rendite, diplomazia, collezioni",interest:"legittimare dinastia e territorio",decision:"molto alto",work:"attira specialisti",visibility:"programmata",dependence:"guerra, fiscalità, alleanze"},
  {id:"city",label:"Città",resource:"piazze, uffici, cantieri",interest:"competizione e identità comune",decision:"attraverso istituzioni e famiglie",work:"ordina infrastrutture",visibility:"monumentale",dependence:"lavoro, tasse, conflitti"},
  {id:"viewer",label:"Spettatore",resource:"corpo, memoria, devozione",interest:"comprendere, partecipare, giudicare",decision:"interpreta ma non commissiona",work:"attiva l’immagine guardandola",visibility:"costruita dal punto di vista",dependence:"accesso al luogo e alfabeti visivi"},
  {id:"excluded",label:"Esclusi",resource:"lavoro e presenza sociale",interest:"vita, tutela, riconoscimento",decision:"ridotto sulla rappresentazione",work:"sostiene la città materiale",visibility:"scarsa o tipizzata",dependence:"gerarchie giuridiche ed economiche"}
];

const ROOTS = [
  {label:"Sapere antico",text:"Euclide e Ptolomeo forniscono modelli geometrici della visione. Testi e problemi antichi vengono copiati, commentati e trasformati."},
  {label:"Traduzioni",text:"Il Libro dell’ottica di Ibn al-Haytham circola in latino come Perspectiva o De aspectibus e influenza l’ottica medievale. Disponibilità non significa derivazione diretta di ogni tecnica pittorica."},
  {label:"Pratica di bottega",text:"Disegni, cartoni, proporzioni e prove materiali costruiscono un sapere operativo spesso non affidato a un trattato."},
  {label:"Cantiere",text:"Misurare fondazioni, archi, moduli e distanze mette la geometria a contatto con corpi, pietra, costi ed errori."},
  {label:"Esperimento",text:"Una procedura controllata verifica se immagine e veduta coincidono da una posizione determinata."},
  {label:"Teoria scritta",text:"Alberti rende trasmissibile una costruzione e la collega alla composizione della storia; la norma non esaurisce la pratica."},
  {label:"Circolazione",text:"Artisti, opere, cantieri, ambascerie e corti spostano soluzioni fra Firenze, Urbino, Venezia, Mantova, Roma e altri centri."}
];

const POSITIONS = {
  high:{label:"Troppo in alto",title:"L’orizzonte non coincide",text:"L’immagine dipinta e l’edificio reale non si sovrappongono: cambia l’angolo sotto il quale vedi cornici e pavimento."},
  low:{label:"Troppo in basso",title:"La costruzione si inclina",text:"Il corpo osserva da un’altezza diversa da quella assunta dal dipinto; l’illusione perde continuità."},
  side:{label:"Spostato di lato",title:"Il centro si separa",text:"Le linee apparenti del Battistero slittano rispetto a quelle dipinte. La tavola non funziona da qualunque luogo."},
  correct:{label:"Posizione coerente",title:"Immagine e veduta si confrontano",text:"Foro, specchio e posizione costringono occhio, tavola e edificio in una stessa relazione. Lo specchio consente di alternare dipinto e realtà; i dettagli esatti restano ricostruiti dalle testimonianze."}
};

const BUILD_STEPS = [
  {n:1,label:"Cornice",do:"Delimito il piano dell’immagine.",change:"La superficie viene separata dallo spazio costruito.",rule:"Ogni proiezione richiede un piano.",culture:"Scelgo che cosa entra nel campo e che cosa resta fuori."},
  {n:2,label:"Linea d’orizzonte",do:"Colloco l’altezza dello sguardo.",change:"L’ambiente acquista un livello di riferimento.",rule:"L’orizzonte corrisponde all’altezza dell’occhio nel modello.",culture:"Assegno allo spettatore un corpo alto, basso o dominante."},
  {n:3,label:"Punto di fuga",do:"Fisso una convergenza.",change:"Le profondità si orientano verso un punto.",rule:"Le rette perpendicolari al quadro convergono nella proiezione.",culture:"Rendo un punto di vista privilegiato rispetto agli altri."},
  {n:4,label:"Ortogonali",do:"Traccio le linee di profondità.",change:"Pareti e pavimento cominciano a recedere.",rule:"Le ortogonali raggiungono il punto di fuga.",culture:"Sottometto distanze differenti a una relazione comune."},
  {n:5,label:"Trasversali",do:"Suddivido il pavimento.",change:"Gli intervalli diminuiscono verso il fondo.",rule:"Le trasversali costruiscono una successione controllata.",culture:"Trasformo lo spazio in qualcosa di calcolabile e ripetibile."},
  {n:6,label:"Figure",do:"Colloco corpi a distanze diverse.",change:"La figura lontana diminuisce in modo coerente.",rule:"Figure sullo stesso piano conservano proporzioni rispetto all’orizzonte.",culture:"La persona entra in una griglia che può ordinarla e gerarchizzarla."},
  {n:7,label:"Spettatore",do:"Rendo visibile chi guarda.",change:"La costruzione rivela la propria condizione.",rule:"Il sistema vale pienamente da una posizione determinata.",culture:"Capisco che l’immagine non è neutrale: produce il posto dal quale il mondo appare ordinato."}
];

const TRINITY = [
  {id:"floor",label:"1 · Pavimento reale",title:"Il dipinto comincia fuori dal dipinto",text:"La parete è dentro una navata frequentata da corpi. L’illusione misura la propria credibilità sul pavimento reale della chiesa."},
  {id:"eye",label:"2 · Altezza dello sguardo",title:"L’orizzonte attraversa il mondo terreno",text:"L’altezza assegnata all’occhio avvicina il fedele ai committenti e alla soglia inferiore dell’architettura dipinta."},
  {id:"vanish",label:"3 · Punto di fuga",title:"Un punto ordina la volta",text:"La convergenza geometrica è un dato verificabile; la sua relazione con lo spettatore costruisce la forza fisica dell’apparizione."},
  {id:"orthogonals",label:"4 · Ortogonali",title:"La parete simula una cappella",text:"Cassettoni e cornici diminuiscono verso il fondo. Le linee sovrapposte sono strumenti didattici, non segni presenti sull’affresco."},
  {id:"donors",label:"5 · Committenti",title:"Il privilegio occupa lo spazio dello spettatore",text:"Le due figure inginocchiate hanno scala monumentale e stanno davanti alla soglia sacra. La loro identità precisa rimane discussa."},
  {id:"sacred",label:"6 · Spazio sacro",title:"La ragione non elimina il mistero",text:"La costruzione rende corporalmente credibile una realtà teologica. Il Padre, la croce, Maria e Giovanni non diventano per questo oggetti ordinari."},
  {id:"tomb",label:"7 · Sepolcro",title:"La misura conduce alla morte",text:"Lo scheletro e l’iscrizione collocano il futuro del fedele sotto la scena. Geometria, memoria funeraria e salvezza vengono articolate verticalmente."}
];

const MEDIA_CATEGORIES = ["support","matter","realSpace","representedSpace","light","depth","body","proportion","function","patronage","path"];
const MEDIA_LABELS = {support:"Supporto",matter:"Materia",realSpace:"Spazio reale",representedSpace:"Spazio rappresentato",light:"Luce",depth:"Profondità",body:"Corpo",proportion:"Proporzione",function:"Funzione",patronage:"Committenza",path:"Percorso"};
const MEDIA_WORKS = [
  {title:"Architettura · Ospedale degli Innocenti",image:"assets/images/innocenti-loggia.webp",width:1800,height:1013,alt:"Loggiato dell’Ospedale degli Innocenti a Firenze, scandito da colonne e archi regolari.",caption:"Filippo Brunelleschi e cantiere, Ospedale degli Innocenti, dal 1419. Un modulo regola colonne, archi e campate, ma l’edificio è fatto di spazio reale e funzioni assistenziali.",base:"Un corpo cammina sotto archi veri; la misura coordina struttura, piazza e istituzione.",readings:{support:"Muratura e pietra: il supporto coincide con l’opera abitabile.",matter:"Pietra serena, intonaco e terracotta reagiscono al peso e al tempo.",realSpace:"La profondità deve reggere e accogliere persone.",representedSpace:"La serialità delle campate anticipa visivamente il percorso, ma non finge un vano sulla parete.",light:"La luce naturale cambia con ora e stagione.",depth:"Ogni campata è attraversabile e misurabile con il corpo.",body:"Il visitatore modifica continuamente il punto di vista.",proportion:"Il modulo mette in relazione altezza, larghezza e distanza.",function:"Ospitalità e rappresentazione civica convivono.",patronage:"L’Arte della Seta finanzia un’istituzione pubblica e religiosa.",path:"Il portico connette edificio e piazza."}},
  {title:"Rilievo · Banchetto di Erode",image:"assets/images/donatello-feast.webp",width:1467,height:1500,alt:"Rilievo bronzeo di Donatello con il Banchetto di Erode, figure sconvolte e archi che recedono.",caption:"Donatello, Banchetto di Erode, 1423–1427, bronzo dorato, fonte battesimale del Battistero di Siena. Il recente restauro ha documentato anche perdite della lega metallica.",base:"Pochi centimetri di bronzo diventano stanze successive: profondità geometrica e rilievo graduato cooperano.",readings:{support:"Una lastra bronzea inserita in un fonte liturgico.",matter:"Il metallo riflette luce reale e conserva tracce di corrosione.",realSpace:"Il rilievo sporge fisicamente, ma solo di poco.",representedSpace:"Archi e pavimento organizzano episodi simultanei.",light:"La luce reale modella superfici dorate e incavi.",depth:"Prospettiva e variazione dello spessore ampliano lo spazio apparente.",body:"Il fedele gira attorno al fonte; non possiede un’unica veduta.",proportion:"Figure e architetture diminuiscono verso il fondo.",function:"La storia del Battista appartiene al rito del battesimo.",patronage:"L’Opera del Duomo coordina più scultori e materiali.",path:"L’occhio attraversa primo piano, tavola e stanze retrostanti."}},
  {title:"Facciata · Santa Maria Novella",image:"assets/images/alberti-facade.webp",width:1067,height:1600,alt:"Facciata marmorea di Santa Maria Novella, organizzata da forme geometriche bianche e verdi.",caption:"Leon Battista Alberti, completamento della facciata di Santa Maria Novella, dal 1458 circa. La commissione di Giovanni Rucellai è dichiarata anche dagli emblemi.",base:"Una superficie urbana reale viene ordinata per connettere parti preesistenti, devozione e memoria del committente.",readings:{support:"La facciata riveste una chiesa costruita in fasi differenti.",matter:"Marmi bianchi e verdi costruiscono un disegno durevole.",realSpace:"La facciata media fra piazza, navate e tetti.",representedSpace:"Gli intarsi suggeriscono forme architettoniche senza aprire profondità fittizie.",light:"Il contrasto dei marmi resta leggibile a distanza.",depth:"La superficie articola aggetti reali e campi geometrici.",body:"Lo spettatore la vede muovendosi nella piazza.",proportion:"Volute e registri compongono parti non nate insieme.",function:"Ingresso sacro e immagine civica.",patronage:"Il nome Rucellai entra nella chiesa senza sostituirne l’identità domenicana.",path:"La facciata prepara la soglia fra città e liturgia."}}
];

const PORTRAIT = [
  {id:"face",label:"1 · Volto",title:"Somiglianza controllata",text:"Il profilo offre riconoscibilità e richiama monete e medaglie. La ferita nasale di Federico è visibile; non possiamo trasformarla in accesso diretto al carattere."},
  {id:"dress",label:"2 · Abito",title:"Il rango si indossa",text:"Tessuti, gioielli e copricapi distinguono genere e posizione sociale. La persona è resa leggibile attraverso codici condivisi."},
  {id:"attributes",label:"3 · Attributi",title:"Il potere ha un lessico",text:"Sul retro, carri trionfali e personificazioni collegano i coniugi a virtù, fama e memoria dinastica."},
  {id:"landscape",label:"4 · Paesaggio",title:"Il territorio unisce i pannelli",text:"La continuità luminosa mette i profili davanti a un dominio ordinato. Non è una fotografia dei possessi, ma una costruzione di appartenenza."},
  {id:"inscription",label:"5 · Iscrizione",title:"La memoria viene guidata",text:"Le iscrizioni latine sul retro nominano e interpretano. L’immagine non lascia che lo spettatore inventi liberamente il ruolo dei soggetti."},
  {id:"pair",label:"6 · Relazione",title:"Due persone, una politica familiare",text:"I profili si fronteggiano e il paesaggio continua. La morte di Battista nel 1472 rende il dittico anche una macchina di memoria."},
  {id:"absence",label:"7 · Assenze",title:"Chi può essere ricordato così?",text:"Servitori, artigiani, contadini e molte donne restano fuori dalla forma monumentale del ritratto. Il diritto alla memoria è distribuito in modo diseguale."}
];

const CITY = [
  {id:"center",label:"Centro",title:"Un edificio ordina la piazza",text:"La costruzione circolare domina l’asse senza provare che la tavola rappresenti una città realmente progettata."},
  {id:"axes",label:"Assi",title:"La pavimentazione rende leggibile il movimento",text:"Le linee convergenti organizzano distanze, aperture e gerarchie visive."},
  {id:"access",label:"Accessi",title:"La città appare disponibile e controllata",text:"Porte e strade permettono ingressi; il punto di vista centrale li dispone entro una regia comune."},
  {id:"void",label:"Spazio vuoto",title:"L’assenza di folla è una scelta",text:"Il vuoto rende perfettamente visibile l’ordine. Ma una città reale è conflitto, lavoro, rumore e corpi non sempre disciplinati."},
  {id:"margins",label:"Margini",title:"Ogni centro produce un fuori",text:"Ciò che non rientra nell’asse resta laterale o invisibile. Governare e rappresentare possono incontrarsi, senza coincidere automaticamente."}
];

const FINAL_CATEGORIES = ["surface","horizon","vanishing","depth","overlap","scale","bodies","viewer","time","function","patronage","meaning","ambiguity"];
const FINAL_LABELS = {surface:"Superficie",horizon:"Orizzonte",vanishing:"Punto di fuga",depth:"Profondità",overlap:"Sovrapposizione",scale:"Scala",bodies:"Corpi/architettura",viewer:"Spettatore",time:"Tempo",function:"Funzione",patronage:"Committenza",meaning:"Significato",ambiguity:"Fuori sistema"};
const FINAL_WORKS = [
  {title:"Giotto · Porta Aurea",image:"assets/images/giotto-memory.webp",width:694,height:676,alt:"Giotto, Incontro alla Porta Aurea.",caption:"Giotto e bottega, Incontro alla Porta Aurea, Cappella degli Scrovegni, 1303–1305 circa.",data:{surface:"La parete si apre per piani e masse, non per un’unica proiezione.",horizon:"Non governa l’intera scena come linea unificata.",vanishing:"Le architetture non convergono tutte in un solo punto.",depth:"Piani, porta, figure e fondo costruiscono un luogo credibile.",overlap:"È decisiva: i corpi si toccano e si dispongono davanti e dietro.",scale:"Le dimensioni relative servono l’evento più che una griglia totale.",bodies:"L’architettura accoglie e comprime l’abbraccio.",viewer:"Il primo piano offre una soglia emotiva, non una postazione geometrica unica.",time:"Il gesto concentra un momento narrativo.",function:"Racconto devozionale dentro un ciclo.",patronage:"Enrico Scrovegni e un’impresa di bottega.",meaning:"La credibilità fisica rende partecipabile l’incontro.",ambiguity:"Linee non unificate non sono errori: rispondono a un’altra costruzione."}},
  {title:"Masaccio · Trinità",image:"assets/images/opening-architecture.webp",width:1178,height:2200,alt:"Masaccio, Trinità.",caption:"Masaccio, Trinità, 1425–1426 circa, affresco, Santa Maria Novella.",data:{surface:"La parete simula una cappella profonda.",horizon:"È legato all’altezza dell’osservatore nella navata.",vanishing:"Un punto coordina con forza la volta dipinta.",depth:"Cassettoni, colonne e cornici rendono misurabile il vano.",overlap:"Figure e soglie distinguono spazio terreno e sacro.",scale:"Committenti e figure sacre condividono una monumentalità insolita.",bodies:"I corpi abitano livelli teologici dentro una stessa architettura.",viewer:"Il fedele è collocato davanti al sepolcro e sotto il mistero.",time:"Morte futura, sacrificio e salvezza convivono.",function:"Memoria funeraria, devozione e immagine d’altare.",patronage:"Committenti rappresentati ma non identificati con certezza.",meaning:"La geometria rende fisicamente presente una relazione religiosa.",ambiguity:"Assetto originario e identità dei donatori restano discussi."}},
  {title:"Paolo Uccello · San Romano",image:"assets/images/uccello-san-romano.webp",width:1800,height:1018,alt:"Paolo Uccello, Battaglia di San Romano con cavalieri e lance.",caption:"Paolo Uccello, Niccolò da Tolentino alla battaglia di San Romano, anni 1430–1440 circa, National Gallery, Londra.",data:{surface:"Oro, argento e pattern conservano una qualità ornamentale.",horizon:"Paesaggio e battaglia non si lasciano ridurre a una sola fascia naturale.",vanishing:"Lance e frammenti sperimentano convergenze senza pacificare la scena.",depth:"La griglia del primo piano convive con un fondo che risale.",overlap:"Cavalli e soldati si accalcano come in un apparato teatrale.",scale:"Scorci audaci dimostrano possibilità, non semplice naturalismo.",bodies:"I corpi diventano anche forme geometriche e celebrative.",viewer:"La collocazione originaria in alto modifica la lettura delle anomalie.",time:"La battaglia storica è trasformata in memoria spettacolare.",function:"Celebrazione secolare di una vittoria fiorentina.",patronage:"Originariamente Bartolini Salimbeni; poi acquisita dai Medici.",meaning:"Ordine e caos militare restano insieme.",ambiguity:"La geometria non elimina artificio, decorazione e difficoltà narrativa."}},
  {title:"Piero · Flagellazione",image:"assets/images/piero-flagellation.webp",width:1800,height:1277,alt:"Piero della Francesca, Flagellazione di Cristo.",caption:"Piero della Francesca, Flagellazione, 1459–1460 circa, Galleria Nazionale delle Marche.",data:{surface:"Il piccolo pannello apre un’architettura lucidissima.",horizon:"Tiene insieme primo piano e loggia arretrata.",vanishing:"La costruzione lega spazi separati con estrema precisione.",depth:"Pavimento, colonne e luce rendono calcolabile la distanza.",overlap:"È limitata e controllata: le figure sembrano isolate.",scale:"Le proporzioni distinguono gruppi lontani senza indebolirne la presenza.",bodies:"L’architettura ordina corpi che non comunicano in modo evidente.",viewer:"Il punto di vista è stabile, il significato no.",time:"La Passione sembra lontana dai tre uomini contemporanei.",function:"Destinazione e uso originari non sono noti con certezza.",patronage:"La committenza resta ignota.",meaning:"La geometria intensifica l’enigma invece di scioglierlo.",ambiguity:"Identità dei tre uomini e interpretazione complessiva sono discusse."}}
];

const QUIZ = [
  {q:"Qual è il passaggio più rigoroso fra Giotto e la prospettiva quattrocentesca?",o:["Dallo spazio sbagliato allo spazio corretto","Da una coerenza percettiva a distanze costruite con una regola unificabile","Dalla religione alla scienza"],a:1,why:"Giotto rende lo spazio abitabile con più indizi coordinati; il Quattrocento formula anche procedure geometriche verificabili.",section:"misurare",r:{q:"Perché non si può dire che Giotto “non sapesse” rappresentare lo spazio?",o:["Perché usava già sempre un solo punto di fuga","Perché sovrapposizioni, piani, scala e gesti rispondevano efficacemente alla funzione narrativa","Perché dipingeva soltanto simboli"],a:1,why:"Una forma spaziale va giudicata per le regole e le funzioni che sceglie, non come tentativo fallito di una norma successiva."}},
  {q:"Perché il modulo insiste sulla rete fra committente, bottega, corporazione e città?",o:["Per negare ogni ruolo all’artista","Perché un’opera è prodotta da risorse, decisioni e lavori distribuiti","Perché tutti avevano lo stesso potere"],a:1,why:"L’invenzione individuale opera dentro contratti, materiali, istituzioni e disuguaglianze.",section:"attori",r:{q:"Quale affermazione rende visibile una disuguaglianza del Rinascimento?",o:["Ogni abitante poteva commissionare un ritratto dinastico","Il lavoro di molti poteva restare invisibile sotto il nome del maestro","Le corporazioni non intervenivano nelle opere"],a:1,why:"Visibilità, decisione e memoria non erano distribuite come il lavoro materiale."}},
  {q:"Che cosa possiamo affermare con prudenza su Ibn al-Haytham e la prospettiva?",o:["Che insegnò personalmente a Brunelleschi","Che la sua ottica circolò in latino e contribuì alla lunga storia dei problemi della visione","Che inventò il punto di fuga pittorico fiorentino"],a:1,why:"La ricezione dell’ottica è documentata; una catena causale diretta fino a Brunelleschi non lo è.",section:"regola",r:{q:"Qual è la differenza fra disponibilità di un testo e influenza documentata?",o:["Nessuna: se un testo esiste, ogni artista lo conosce","La disponibilità rende possibile la lettura; l’influenza richiede prove ulteriori","L’influenza non può mai essere studiata"],a:1,why:"Una trasmissione culturale non autorizza collegamenti biografici automatici."}},
  {q:"Perché la ricostruzione dell’esperimento di Brunelleschi deve essere dichiarata?",o:["Perché le tavolette originali sono perdute e la descrizione conservata è successiva","Perché il Battistero non esiste più","Perché Manetti scrisse prima dell’esperimento"],a:0,why:"Conosciamo gli esperimenti attraverso testimonianze, soprattutto Manetti, non attraverso gli oggetti originali.",section:"brunelleschi",r:{q:"Che cosa dimostra soprattutto il foro con lo specchio nella ricostruzione didattica?",o:["Che l’immagine funziona identica da ogni posizione","Che il corpo dell’osservatore è parte della verifica","Che lo specchio inventa la geometria"],a:1,why:"La corrispondenza si controlla imponendo una posizione relativa fra occhio, tavola, specchio e veduta."}},
  {q:"Che cosa implica la “finestra” di Alberti oltre alla profondità?",o:["Una selezione, un confine e un osservatore collocato","L’abolizione della superficie","Una copia completa di tutto ciò che esiste"],a:0,why:"Il piano dell’immagine organizza un campo e lascia necessariamente qualcosa fuori.",section:"alberti",r:{q:"Nel modello albertiano, che cos’è il piano dipinto?",o:["Una superficie irrilevante","L’intersezione organizzata della piramide visiva","Un vetro realmente attraversato da raggi luminosi disegnati"],a:1,why:"È una costruzione geometrica teorica, non la pretesa di mostrare linee fisiche nell’aria."}},
  {q:"Quale elemento collega orizzonte e corpo dello spettatore?",o:["L’orizzonte rappresenta l’altezza dell’occhio assunta dal sistema","L’orizzonte indica sempre il centro del quadro","L’orizzonte dipende soltanto dal soggetto"],a:0,why:"Cambiare altezza dell’orizzonte significa cambiare la posizione implicita da cui il mondo è guardato.",section:"costruisci",r:{q:"Che funzione hanno le ortogonali?",o:["Decorano il pavimento senza regola","Convergono verso il punto di fuga e organizzano la profondità","Indicano la luce reale"],a:1,why:"Nella prospettiva centrale, le rette perpendicolari al piano del quadro appaiono convergere."}},
  {q:"Che cosa rivela rendere volutamente incoerente il laboratorio prospettico?",o:["Che ogni errore è più bello","Che la coerenza dipende da relazioni fra più elementi, non da una sola linea","Che le figure devono avere tutte la stessa altezza"],a:1,why:"Orizzonte, fuga, griglia e scala delle figure devono cooperare.",section:"costruisci",r:{q:"Perché il punto di fuga non è un fatto neutrale?",o:["Perché assegna centralità a una posizione di osservazione","Perché elimina qualunque osservatore","Perché esiste soltanto nei paesaggi"],a:0,why:"La regola rende alcuni rapporti coerenti proprio in relazione a un occhio situato."}},
  {q:"Nella Trinità, perché la prospettiva è parte del significato?",o:["Perché sostituisce il tema religioso","Perché collega il corpo del fedele, i committenti, il sepolcro e lo spazio sacro","Perché dimostra che l’architettura dipinta fu costruita davvero"],a:1,why:"La geometria rende fisica e moralmente orientata la relazione fra terra, morte e salvezza.",section:"trinità",r:{q:"Quale dato sulla Trinità richiede prudenza?",o:["La presenza dello scheletro","L’identità precisa dei committenti","La collocazione a Firenze"],a:1,why:"Le figure sono visibili, ma le proposte identificative non hanno prodotto una certezza definitiva."}},
  {q:"Che cosa mostra il confronto fra loggiato, rilievo e facciata?",o:["Che tutte le arti diventano pittura","Che una cultura della misura attraversa discipline con materie e funzioni differenti","Che la luce reale è irrilevante"],a:1,why:"Proporzione e profondità cambiano quando diventano pietra abitabile, bronzo in rilievo o superficie urbana.",section:"fuori-quadro",r:{q:"Nel Banchetto di Erode, come nasce la profondità?",o:["Soltanto dal peso reale dell’edificio","Dalla cooperazione fra prospettiva, architettura figurata e rilievo graduato","Da una tela dietro il bronzo"],a:1,why:"Donatello usa insieme costruzione spaziale e variazione materiale dello spessore."}},
  {q:"Che cosa costruisce soprattutto il dittico di Federico e Battista?",o:["Un accesso diretto alla psicologia privata","Rango, memoria, territorio e relazione dinastica","L’uguaglianza sociale degli abitanti di Urbino"],a:1,why:"La persona è mediata da profilo, abito, paesaggio, allegorie e iscrizioni.",section:"individuo",r:{q:"Perché le assenze sono importanti nel laboratorio sul ritratto?",o:["Per ricordare che il diritto alla memoria monumentale era diseguale","Perché nessuno lavorava alla corte","Perché il paesaggio è vuoto"],a:0,why:"Chiedere chi non può farsi rappresentare impedisce di trasformare un’élite in umanità universale."}},
  {q:"Perché la Città ideale non va letta come fotografia di un piano urbano?",o:["Perché non contiene architetture","Perché attribuzione, funzione e rapporto con un progetto costruibile restano discussi","Perché la prospettiva impedisce di progettare"],a:1,why:"La tavola elabora un ordine visivo e forse politico, ma non documenta automaticamente una città da costruire.",section:"città",r:{q:"Quale rapporto prudente esiste fra misura e potere?",o:["Sono sempre la stessa cosa","La misura può organizzare e celebrare gerarchie senza essere sempre dominio","Non hanno mai alcun rapporto"],a:1,why:"Il rapporto è storico e possibile, non un determinismo universale."}},
  {q:"Quale conclusione prepara meglio il Manierismo?",o:["La prospettiva ha finalmente reso ogni immagine vera","Un ordine dipende da un punto di vista e può diventare instabile","Gli artisti successivi dimenticano la tecnica"],a:1,why:"La centralità dell’osservatore è insieme una conquista e un limite: spostare il punto può incrinare l’equilibrio.",section:"punti-vista",r:{q:"Che cosa dimostra la Flagellazione di Piero?",o:["Che la geometria elimina ogni mistero","Che uno spazio rigoroso può contenere un significato ancora enigmatico","Che la committenza è certamente nota"],a:1,why:"Precisione spaziale e incertezza interpretativa convivono nella stessa opera."}}
];

function initNotes() {
  const opening = document.querySelector("#openingNote");
  const returning = document.querySelector("#returnNote");
  opening.value = state.openingNote; returning.value = state.returnNote;
  const bind = (field, key, statusId) => field.addEventListener("input", () => {
    state[key] = field.value.slice(0, 12000); save();
    document.querySelector(statusId).textContent = "Salvato su questo dispositivo.";
    if (key === "openingNote") document.querySelector("#openingMemory").textContent = state.openingNote || "Non hai ancora scritto un’annotazione.";
  });
  bind(opening, "openingNote", "#openingSave"); bind(returning, "returnNote", "#returnSave");
  document.querySelector("#openingMemory").textContent = state.openingNote || "Non hai ancora scritto un’annotazione.";
}

function initMenuAndProgress() {
  const menu = document.querySelector("#chapterMenu"), scrim = document.querySelector("#menuScrim"), open = document.querySelector("#menuButton"), close = document.querySelector("#menuClose");
  const setMenu = visible => { menu.hidden = !visible; scrim.hidden = !visible; open.setAttribute("aria-expanded", String(visible)); document.body.classList.toggle("menu-open", visible); if (visible) close.focus(); else open.focus(); };
  open.addEventListener("click", () => setMenu(true)); close.addEventListener("click", () => setMenu(false)); scrim.addEventListener("click", () => setMenu(false));
  menu.addEventListener("click", event => { if (event.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !menu.hidden) setMenu(false); });
  const sections = [...document.querySelectorAll(".tracked")];
  const refresh = () => {
    document.querySelector("#readingProgress").value = state.visited.length;
    document.querySelector("#progressText").textContent = `${state.visited.length} di 13 tappe`;
    document.querySelectorAll("[data-menu-step]").forEach(link => link.classList.toggle("visited", state.visited.includes(Number(link.dataset.menuStep))));
  };
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { const step = Number(entry.target.dataset.step); if (!state.visited.includes(step)) { state.visited.push(step); state.visited.sort((a,b)=>a-b); save(); refresh(); } }
  }), {threshold:.22});
  sections.forEach(section => observer.observe(section)); refresh();
}

function initActors() {
  const map = document.querySelector("#actorMap"), reading = document.querySelector("#actorReading");
  map.innerHTML = ACTORS.map(a => `<button type="button" data-actor="${a.id}" aria-pressed="${state.actor === a.id}">${a.label}</button>`).join("");
  const render = id => {
    const a = ACTORS.find(item => item.id === id);
    map.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.actor === id)));
    reading.innerHTML = a ? `<h3>${a.label}</h3><dl><dt>Risorse</dt><dd>${a.resource}</dd><dt>Interesse</dt><dd>${a.interest}</dd><dt>Decisione</dt><dd>${a.decision}</dd><dt>Lavoro</dt><dd>${a.work}</dd><dt>Visibilità</dt><dd>${a.visibility}</dd><dt>Dipendenze</dt><dd>${a.dependence}</dd></dl>` : `<p>Seleziona un attore. Il “genio” tornerà dentro il lavoro, i contratti e le relazioni che lo rendono possibile.</p>`;
  };
  map.addEventListener("click", event => { const button = event.target.closest("button"); if (!button) return; state.actor = button.dataset.actor; save(); render(state.actor); }); render(state.actor);
}

function initRoots() {
  const diagram = document.querySelector("#rootsDiagram"), buttons = document.querySelector("#rootButtons"), reading = document.querySelector("#rootReading");
  const positions = [[43,3],[74,17],[82,57],[60,80],[20,78],[3,50],[11,15]];
  ROOTS.forEach((root,i) => { const node=document.createElement("span"); node.className="root-node"; node.style.left=`${positions[i][0]}%`; node.style.top=`${positions[i][1]}%`; node.style.setProperty("--angle",`${i*48-130}deg`); node.textContent=root.label; node.dataset.root=i; diagram.append(node); });
  buttons.innerHTML = ROOTS.map((root,i)=>`<button type="button" data-root="${i}" aria-pressed="${state.roots.includes(i)}">${i+1} · ${root.label}</button>`).join("");
  const render = selected => { diagram.querySelectorAll(".root-node").forEach(n=>n.classList.toggle("active",state.roots.includes(Number(n.dataset.root)))); buttons.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(state.roots.includes(Number(b.dataset.root))))); if(selected!==undefined) reading.innerHTML=`<h3>${ROOTS[selected].label}</h3><p>${ROOTS[selected].text}</p><p><b>${state.roots.length} / 7 nodi attivati.</b></p>`; };
  buttons.addEventListener("click",event=>{const b=event.target.closest("button");if(!b)return;const i=Number(b.dataset.root);state.roots=state.roots.includes(i)?state.roots.filter(x=>x!==i):[...state.roots,i];save();render(i)});render();
}

function initBrunelleschi() {
  const buttons=document.querySelector("#positionButtons"),stage=document.querySelector("#mirrorStage"),reading=document.querySelector("#positionReading");
  buttons.innerHTML=Object.entries(POSITIONS).map(([id,p])=>`<button type="button" data-position="${id}" aria-pressed="${state.brunelleschi===id}">${p.label}</button>`).join("");
  const render=()=>{stage.dataset.position=state.brunelleschi;buttons.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.position===state.brunelleschi)));const p=POSITIONS[state.brunelleschi];reading.innerHTML=`<h3>${p.title}</h3><p>${p.text}</p>`};
  buttons.addEventListener("click",event=>{const b=event.target.closest("button");if(!b)return;state.brunelleschi=b.dataset.position;save();render()});render();
}

function initPerspective() {
  const list=document.querySelector("#buildSteps"),stage=document.querySelector("#perspectiveStage"),reading=document.querySelector("#buildReading"),count=document.querySelector("#buildCount"),svg=document.querySelector("#perspectiveSvg"),equiv=document.querySelector("#perspectiveEquivalent");
  list.innerHTML=BUILD_STEPS.map(step=>`<li><button type="button" data-build="${step.n}">${step.n} · ${step.label}</button></li>`).join("");
  const makeChoice=(selector,items,current,key)=>{const box=document.querySelector(selector);box.innerHTML=items.map(([id,label])=>`<button type="button" data-value="${id}" aria-pressed="${current===id}">${label}</button>`).join("");box.addEventListener("click",event=>{const b=event.target.closest("button");if(!b)return;state.build[key]=b.dataset.value;save();render();});};
  makeChoice("#horizonControls",[["high","Alto"],["middle","Medio"],["low","Basso"]],state.build.horizon,"horizon");
  makeChoice("#vanishingControls",[["left","Sinistra"],["center","Centro"],["right","Destra"]],state.build.vanishing,"vanishing");
  const lines=()=>{const y={high:180,middle:260,low:340}[state.build.horizon],x={left:330,center:450,right:570}[state.build.vanishing];svg.querySelector(".horizon-line").setAttribute("y1",y);svg.querySelector(".horizon-line").setAttribute("y2",y);svg.querySelector(".vanishing-point").setAttribute("cx",x);svg.querySelector(".vanishing-point").setAttribute("cy",y);svg.querySelector(".orthogonal-lines").innerHTML=[90,210,330,570,690,810].map(px=>`<line x1="${px}" y1="555" x2="${x}" y2="${y}"/>`).join("");const ys=[530,485,445,410,380,355,335];svg.querySelector(".transversal-lines").innerHTML=ys.map(py=>`<line x1="${Math.max(75,x-(py-y)*1.45)}" y1="${py}" x2="${Math.min(825,x+(py-y)*1.45)}" y2="${py}"/>`).join("");};
  const classMap={1:".frame-line",2:".horizon-line",3:".vanishing-point",4:".orthogonal-lines",5:".transversal-lines",6:".lab-figures",7:".viewer-label,.viewer-mark"};
  const render=selected=>{lines();Object.entries(classMap).forEach(([n,sel])=>svg.querySelectorAll(sel).forEach(el=>el.classList.toggle("is-built",state.build.steps.includes(Number(n)))));svg.querySelector(".orthogonal-lines").style.display=state.build.orthogonals?"":"none";svg.querySelector(".transversal-lines").style.display=state.build.transversals?"":"none";stage.classList.toggle("incoherent",state.build.incoherent);list.querySelectorAll("button").forEach(b=>{const n=Number(b.dataset.build);b.disabled=n>1&&!state.build.steps.includes(n-1);b.setAttribute("aria-pressed",String(state.build.steps.includes(n)))});document.querySelectorAll("#horizonControls button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.value===state.build.horizon)));document.querySelectorAll("#vanishingControls button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.value===state.build.vanishing)));document.querySelector("#toggleOrtho").setAttribute("aria-pressed",String(state.build.orthogonals));document.querySelector("#toggleTrans").setAttribute("aria-pressed",String(state.build.transversals));document.querySelector("#toggleCoherence").setAttribute("aria-pressed",String(state.build.incoherent));document.querySelector("#toggleCoherence").textContent=state.build.incoherent?"Ripristina coerenza":"Rendi incoerente";count.textContent=`${state.build.steps.length} / 7 passaggi completati`;const step=BUILD_STEPS[(selected||Math.max(...state.build.steps,1))-1];reading.innerHTML=`<h3>${step.n} · ${step.label}</h3><p><b>Che cosa faccio.</b> ${step.do}</p><p><b>Che cosa cambia.</b> ${step.change}</p><p><b>Regola.</b> ${step.rule}</p><p><b>Scelta culturale.</b> ${step.culture}</p>`;equiv.textContent=state.build.incoherent?"Le linee e le figure non rispettano più la stessa costruzione: la profondità si contraddice.":state.build.steps.length===7?"Ambiente completo: un osservatore, un orizzonte e una convergenza coordinano griglia e figure.":`${state.build.steps.length} elementi costruiti su 7. Orizzonte ${state.build.horizon}, fuga ${state.build.vanishing}.`;};
  list.addEventListener("click",event=>{const b=event.target.closest("button");if(!b)return;const n=Number(b.dataset.build);if(!state.build.steps.includes(n))state.build.steps.push(n);save();render(n)});
  [["#toggleOrtho","orthogonals"],["#toggleTrans","transversals"],["#toggleCoherence","incoherent"]].forEach(([sel,key])=>document.querySelector(sel).addEventListener("click",()=>{state.build[key]=!state.build[key];save();render()}));
  document.querySelector("#buildReset").addEventListener("click",()=>{state.build=clone(DEFAULT_STATE.build);save();render(1)});render();
}

function initTrinity() {
  const buttons=document.querySelector("#trinityButtons"),reading=document.querySelector("#trinityReading"),stage=document.querySelector("#trinityStage");
  buttons.innerHTML=TRINITY.map(item=>`<button type="button" data-trinity="${item.id}" aria-pressed="${state.trinity.includes(item.id)}">${item.label}</button>`).join("");
  const render=selected=>{buttons.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(state.trinity.includes(b.dataset.trinity))));stage.querySelectorAll("[data-trinity]").forEach(el=>el.classList.toggle("active",state.trinity.includes(el.dataset.trinity)));if(selected){const item=TRINITY.find(x=>x.id===selected);reading.innerHTML=`<h3>${item.title}</h3><p>${item.text}</p><p><b>${state.trinity.length} / 7 livelli attivi.</b></p>`}};
  buttons.addEventListener("click",event=>{const b=event.target.closest("button");if(!b)return;const id=b.dataset.trinity;state.trinity=state.trinity.includes(id)?state.trinity.filter(x=>x!==id):[...state.trinity,id];save();render(id)});render();
}

function initMedia() {
  const tabs=document.querySelector("#mediaTabs"),cats=document.querySelector("#mediaCategories"),image=document.querySelector("#mediaImage"),caption=document.querySelector("#mediaCaption"),reading=document.querySelector("#mediaReading");
  tabs.innerHTML=MEDIA_WORKS.map((w,i)=>`<button type="button" role="tab" data-work="${i}" aria-selected="${state.media.work===i}">${w.title}</button>`).join("");cats.innerHTML=MEDIA_CATEGORIES.map(id=>`<button type="button" data-category="${id}" aria-pressed="${state.media.category===id}">${MEDIA_LABELS[id]}</button>`).join("");
  const render=()=>{const w=MEDIA_WORKS[state.media.work];tabs.querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",String(Number(b.dataset.work)===state.media.work)));cats.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.category===state.media.category)));image.src=w.image;image.width=w.width;image.height=w.height;image.alt=w.alt;caption.textContent=w.caption;reading.innerHTML=`<h3>${MEDIA_LABELS[state.media.category]}</h3><p>${w.readings[state.media.category]}</p><p>${w.base}</p>`;};
  tabs.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;state.media.work=Number(b.dataset.work);save();render()});cats.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;state.media.category=b.dataset.category;save();render()});render();
}

function initPortrait() {
  const buttons=document.querySelector("#portraitButtons"),reading=document.querySelector("#portraitReading"),art=document.querySelector(".portrait-art");buttons.innerHTML=PORTRAIT.map(p=>`<button type="button" data-portrait="${p.id}" aria-pressed="${state.portrait.includes(p.id)}">${p.label}</button>`).join("");
  const render=id=>{buttons.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(state.portrait.includes(b.dataset.portrait))));art.querySelectorAll("[data-portrait]").forEach(el=>el.classList.toggle("active",state.portrait.includes(el.dataset.portrait)));if(id){const p=PORTRAIT.find(x=>x.id===id);reading.innerHTML=`<h3>${p.title}</h3><p>${p.text}</p><p><b>Domanda:</b> che cosa sappiamo, che cosa l’immagine vuole farci credere e che cosa non possiamo dedurre?</p>`}};
  buttons.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const id=b.dataset.portrait;state.portrait=state.portrait.includes(id)?state.portrait.filter(x=>x!==id):[...state.portrait,id];save();render(id)});render();
}

function initCity() {
  const buttons=document.querySelector("#cityButtons"),reading=document.querySelector("#cityReading"),art=document.querySelector(".city-art");buttons.innerHTML=CITY.map(p=>`<button type="button" data-city="${p.id}" aria-pressed="${state.city.includes(p.id)}">${p.label}</button>`).join("");
  const render=id=>{buttons.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(state.city.includes(b.dataset.city))));art.querySelectorAll("[data-city]").forEach(el=>el.classList.toggle("active",state.city.includes(el.dataset.city)));if(id){const p=CITY.find(x=>x.id===id);reading.innerHTML=`<h3>${p.title}</h3><p>${p.text}</p>`}};
  buttons.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const id=b.dataset.city;state.city=state.city.includes(id)?state.city.filter(x=>x!==id):[...state.city,id];save();render(id)});render();
}

function initFinalCompare() {
  const tabs=document.querySelector("#workTabs"),cats=document.querySelector("#finalCategories"),image=document.querySelector("#finalImage"),caption=document.querySelector("#finalCaption"),reading=document.querySelector("#finalReading");tabs.innerHTML=FINAL_WORKS.map((w,i)=>`<button type="button" role="tab" data-work="${i}" aria-selected="${state.final.work===i}">${w.title}</button>`).join("");cats.innerHTML=FINAL_CATEGORIES.map(id=>`<button type="button" data-category="${id}" aria-pressed="${state.final.category===id}">${FINAL_LABELS[id]}</button>`).join("");
  const render=()=>{const w=FINAL_WORKS[state.final.work];tabs.querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",String(Number(b.dataset.work)===state.final.work)));cats.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.category===state.final.category)));image.src=w.image;image.width=w.width;image.height=w.height;image.alt=w.alt;caption.textContent=w.caption;reading.innerHTML=`<h3>${FINAL_LABELS[state.final.category]}</h3><p>${w.data[state.final.category]}</p>`;};tabs.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;state.final.work=Number(b.dataset.work);save();render()});cats.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;state.final.category=b.dataset.category;save();render()});render();
}

function initQuiz() {
  const area=document.querySelector("#quizArea"),meter=document.querySelector("#quizMeter"),count=document.querySelector("#quizCount");
  const updateMeter=()=>{meter.value=Math.min(state.quiz.index,12);count.textContent=state.quiz.completed?"Verifica completata":`Domanda ${Math.min(state.quiz.index+1,12)} di 12`;};
  const renderSummary=()=>{updateMeter();area.innerHTML=`<article class="quiz-summary"><p class="question-no">Percorso completato</p><h3>La misura non è neutrale: ora sai cercarne il punto di vista.</h3><div class="summary-grid"><article><b>${state.quiz.correctFirst.length}</b><span>al primo tentativo</span></article><article><b>${state.quiz.errors}</b><span>errori</span></article><article><b>${state.quiz.recoveries.length}</b><span>recuperi superati</span></article><article><b>${Math.max(0,12-state.quiz.index)}</b><span>nodi irrisolti</span></article></div><p>Hai concluso la verifica. Puoi ricominciare senza cancellare i due taccuini né gli esperimenti.</p><button id="quizRestart" type="button">Ricomincia la verifica</button></article>`;document.querySelector("#quizRestart").addEventListener("click",()=>{state.quiz=clone(DEFAULT_STATE.quiz);save();render()});};
  const next=()=>{state.quiz.index+=1;state.quiz.readyNext=false;if(state.quiz.index>=12){state.quiz.index=12;state.quiz.completed=true;}save();render();};
  const feedback=(q,recovery,correct)=>`<div class="quiz-feedback"><h4>${correct?"Collegamento ricostruito":"Nodo da recuperare"}</h4><p>${recovery?q.r.why:q.why}</p><p><a href="#${q.section}">Rivedi la sezione pertinente</a></p>${correct?`<div class="quiz-actions"><button id="quizNext" type="button">${state.quiz.index===11?"Concludi":"Domanda successiva"}</button></div>`:""}</div>`;
  const renderQuestion=()=>{const q=QUIZ[state.quiz.index];updateMeter();area.innerHTML=`<article class="quiz-card"><p class="question-no">Domanda ${state.quiz.index+1}</p><h3>${q.q}</h3><div class="quiz-options">${q.o.map((o,i)=>`<button type="button" data-answer="${i}" ${state.quiz.readyNext?"disabled":""}>${o}</button>`).join("")}</div>${state.quiz.readyNext?feedback(q,false,true):""}</article>`;if(state.quiz.readyNext)document.querySelector("#quizNext").addEventListener("click",next);else area.querySelector(".quiz-options").addEventListener("click",event=>{const b=event.target.closest("button");if(!b)return;const answer=Number(b.dataset.answer);area.querySelectorAll(".quiz-options button").forEach(x=>x.disabled=true);if(answer===q.a){b.classList.add("correct");if(!state.quiz.wrongQuestions.includes(state.quiz.index)&&!state.quiz.correctFirst.includes(state.quiz.index))state.quiz.correctFirst.push(state.quiz.index);state.quiz.readyNext=true;save();area.querySelector(".quiz-card").insertAdjacentHTML("beforeend",feedback(q,false,true));document.querySelector("#quizNext").addEventListener("click",next);}else{b.classList.add("wrong");state.quiz.errors+=1;if(!state.quiz.wrongQuestions.includes(state.quiz.index))state.quiz.wrongQuestions.push(state.quiz.index);state.quiz.pending=state.quiz.index;state.quiz.readyNext=false;save();setTimeout(renderRecovery,350);}});};
  const renderRecovery=()=>{const q=QUIZ[state.quiz.pending??state.quiz.index],r=q.r;state.quiz.index=state.quiz.pending??state.quiz.index;updateMeter();area.innerHTML=`<article class="quiz-card"><p class="recovery-label">Recupero obbligatorio · domanda ${state.quiz.index+1}</p><h3>${r.q}</h3><div class="quiz-options">${r.o.map((o,i)=>`<button type="button" data-answer="${i}">${o}</button>`).join("")}</div></article>`;area.querySelector(".quiz-options").addEventListener("click",event=>{const b=event.target.closest("button");if(!b)return;const answer=Number(b.dataset.answer);if(answer===r.a){area.querySelectorAll(".quiz-options button").forEach(x=>x.disabled=true);b.classList.add("correct");if(!state.quiz.recoveries.includes(state.quiz.index))state.quiz.recoveries.push(state.quiz.index);state.quiz.pending=null;state.quiz.readyNext=true;save();area.querySelector(".quiz-card").insertAdjacentHTML("beforeend",feedback(q,true,true));document.querySelector("#quizNext").addEventListener("click",next);}else{b.classList.add("wrong");state.quiz.errors+=1;save();area.querySelector(".quiz-card").insertAdjacentHTML("beforeend",feedback(q,true,false));setTimeout(()=>{b.classList.remove("wrong");area.querySelectorAll(".quiz-options button").forEach(x=>x.disabled=false);area.querySelector(".quiz-feedback")?.remove();},900);}});};
  const render=()=>state.quiz.completed?renderSummary():state.quiz.pending!==null?renderRecovery():renderQuestion();render();
}

function initLightbox() {
  const box=document.querySelector("#lightbox"),stage=document.querySelector("#lightboxStage"),img=document.querySelector("#lightboxImage"),caption=document.querySelector("#lightboxCaption"),close=document.querySelector("#lightboxClose"),zoomReset=document.querySelector("#zoomReset");let trigger=null,scale=1,x=0,y=0,drag=null;const pointers=new Map();let pinchDistance=0;
  const transform=()=>{img.style.transform=`translate(${x}px,${y}px) scale(${scale})`;zoomReset.textContent=`${Math.round(scale*100)}%`;};
  const setZoom=value=>{scale=Math.max(1,Math.min(4,value));if(scale===1){x=0;y=0;}transform();};
  const open=button=>{trigger=button;const figure=button.closest("figure"),source=figure.querySelector("img"),text=figure.querySelector("figcaption")?.textContent||source.alt;img.src=source.currentSrc||source.src;img.alt=source.alt;caption.textContent=text;scale=1;x=0;y=0;transform();box.hidden=false;document.body.classList.add("lightbox-open");close.focus();};
  const shut=()=>{box.hidden=true;document.body.classList.remove("lightbox-open");img.src="assets/images/opening-architecture.webp";trigger?.focus();};
  document.addEventListener("click",event=>{const button=event.target.closest(".open-image");if(button)open(button)});close.addEventListener("click",shut);document.querySelector("#zoomIn").addEventListener("click",()=>setZoom(scale+.25));document.querySelector("#zoomOut").addEventListener("click",()=>setZoom(scale-.25));zoomReset.addEventListener("click",()=>setZoom(1));
  stage.addEventListener("wheel",event=>{if(box.hidden)return;event.preventDefault();setZoom(scale+(event.deltaY<0?.25:-.25))},{passive:false});
  stage.addEventListener("pointerdown",event=>{stage.setPointerCapture(event.pointerId);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.size===1){drag={x:event.clientX-x,y:event.clientY-y};stage.classList.add("is-dragging")}else if(pointers.size===2){const pts=[...pointers.values()];pinchDistance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y)}});
  stage.addEventListener("pointermove",event=>{if(!pointers.has(event.pointerId))return;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.size===2){const pts=[...pointers.values()],distance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);if(pinchDistance)setZoom(scale+(distance-pinchDistance)/280);pinchDistance=distance}else if(drag&&scale>1){x=event.clientX-drag.x;y=event.clientY-drag.y;transform()}});
  const release=event=>{pointers.delete(event.pointerId);drag=null;pinchDistance=0;stage.classList.remove("is-dragging")};stage.addEventListener("pointerup",release);stage.addEventListener("pointercancel",release);
  document.addEventListener("keydown",event=>{if(box.hidden)return;if(event.key==="Escape")shut();if(event.key==="+")setZoom(scale+.25);if(event.key==="-")setZoom(scale-.25);if(event.key==="0")setZoom(1);if(event.key==="Tab"){const focusable=[...box.querySelectorAll("button")];const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
}

function initServiceWorker(){if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}

document.addEventListener("DOMContentLoaded",()=>{
  state=loadState();initNotes();initMenuAndProgress();initActors();initRoots();initBrunelleschi();initPerspective();initTrinity();initMedia();initPortrait();initCity();initFinalCompare();initQuiz();initLightbox();initServiceWorker();
});
