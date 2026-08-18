"use strict";

const STORAGE_KEY = "storia-sguardo-12-state";
const VERSION = 1;
const SECTION_IDS = ["prima","mondo","frattura","romantico","sublime","friedrich","natura","goya","popolo","medusa","incubo","confronto","ritorno"];
const clone = value => JSON.parse(JSON.stringify(value));
const allowed = (value, list, fallback) => list.includes(value) ? value : fallback;
const $ = selector => document.querySelector(selector);

const DEFAULT_STATE = {
  version: VERSION,
  visited: [],
  notes: { first: "", final: "" },
  timeline: 0,
  causal: "filosofia",
  term: "sensibilita",
  sublime: "bello",
  friedrich: [],
  nature: "atmosfera",
  goya: [],
  delacroix: [],
  medusa: [],
  vision: "sogno",
  compare: "composizione",
  quiz: { index: 0, phase: "question", correctFirst: [], errors: 0, recoveries: [], recoveryAttempts: 0, completed: false }
};

const TIMELINE = [
  {date:"1789",title:"Rivoluzione francese",text:"La promessa di libertà e cittadinanza rompe l'ordine politico tradizionale. L'arte non può più fingere che la storia sia soltanto esempio antico."},
  {date:"1793-1794",title:"Terrore",text:"La ragione rivoluzionaria incontra la violenza politica. La virtù civica mostra il suo lato inquietante: educazione, controllo, morte pubblica."},
  {date:"1799-1815",title:"Napoleone e guerre",text:"La libertà rivoluzionaria si trasforma anche in impero, mobilitazione, occupazione e trauma. Goya renderà questa frattura impossibile da idealizzare."},
  {date:"1800-1810",title:"Cultura del sublime",text:"Montagne, mare, tempeste, rovine e immensità diventano luoghi in cui l'uomo misura la propria piccolezza senza ridurre tutto a paura."},
  {date:"1812-1819",title:"Natura e storia",text:"Turner, Friedrich e Géricault mostrano una pittura in cui atmosfera, naufragio e limite umano diventano problemi centrali."},
  {date:"1815",title:"Restaurazione",text:"Il ritorno dei sovrani non cancella le fratture: le comprime. La storia europea resta piena di memoria rivoluzionaria, censura, desiderio nazionale."},
  {date:"1820-1830",title:"Nazioni e popoli",text:"Popolo e nazione entrano nell'immagine, ma non sempre come realtà libera: spesso diventano simbolo, mito, bandiera, corpo collettivo manipolabile."},
  {date:"1830",title:"Rivoluzioni di luglio",text:"Delacroix trasforma la barricata in pittura monumentale: la storia contemporanea non è più materia minore, è una scena che chiede giudizio."},
  {date:"1830-1848",title:"Verso il Realismo",text:"Il gusto romantico per il presente, il trauma e i corpi concreti apre la strada a una domanda nuova: chi merita di essere rappresentato davvero?"}
];
const CAUSAL = {
  filosofia:{label:"Filosofia",title:"La ragione incontra il limite",text:"Illuminismo e idealismo non spariscono. Il Romanticismo chiede che cosa accade quando il pensiero riconosce infinito, libertà, storia e interiorità come esperienze non riducibili a schema."},
  rivoluzione:{label:"Rivoluzione",title:"La libertà diventa evento",text:"La rivoluzione trasforma parole astratte in corpi, piazze, sangue, propaganda, speranza e paura. L'immagine non può restare neutrale."},
  guerra:{label:"Guerra",title:"La storia si imprime sui corpi",text:"Le guerre napoleoniche rendono visibile una modernità armata. Goya non celebra la battaglia: mostra il punto in cui la storia ferisce."},
  natura:{label:"Natura",title:"La natura non obbedisce",text:"Montagne, mare, tempeste, nubi e luce atmosferica diventano forze autonome. Il paesaggio non è sfondo, ma esperienza di sproporzione."},
  nazione:{label:"Nazione",title:"Comunità e mito",text:"La nazione promette appartenenza, ma produce anche esclusioni e immagini mitiche. Il popolo può essere soggetto o simbolo costruito."},
  individuo:{label:"Individuo",title:"Libertà e solitudine",text:"L'individuo romantico non è solo eroe: è soggetto esposto, inquieto, fragile, talvolta incapace di abitare ciò che desidera."},
  mercato:{label:"Mercato dell'arte",title:"Nuovi pubblici",text:"Salon, stampa, critica, musei e collezionisti ampliano il pubblico. L'opera entra in un circuito più moderno di discussione e scandalo."},
  letteratura:{label:"Letteratura",title:"Immaginazione condivisa",text:"Poesia, romanzo storico, teatro, Medioevo reinventato e gusto delle rovine formano un ambiente comune con la pittura."},
  scienza:{label:"Scienza",title:"Natura osservata e inquietante",text:"Geologia, meteorologia, ottica e nuove tecnologie cambiano la percezione del tempo naturale. L'uomo non appare più padrone del quadro."},
  religione:{label:"Religione",title:"Soglia e interiorità",text:"Il sacro romantico spesso non passa dalla certezza dottrinale, ma dalla soglia: silenzio, abisso, rovina, morte, tensione verso l'invisibile."},
  memoria:{label:"Memoria storica",title:"Rovine e Medioevo",text:"Le rovine non sono solo decorazione pittoresca: sono una forma visibile del tempo, della perdita e della continuità problematica."},
  popolo:{label:"Popolo",title:"Soggetto o immagine?",text:"Quando il popolo entra nell'opera può diventare protagonista reale, ma anche allegoria, massa indistinta o bandiera politica."}
};
const TERMS = {
  sensibilita:{label:"Sensibilità storica",title:"Romantico è un modo di sentire la frattura",text:"Il Romanticismo nasce quando il presente appare instabile: libertà, guerra, natura e interiorità non si lasciano più ordinare come semplici esempi morali."},
  crisi:{label:"Crisi della misura",title:"La ragione non viene buttata via",text:"Il problema romantico non è spegnere la ragione, ma mostrarne il limite. Davanti all'infinito la misura resta necessaria e insufficiente."},
  plurale:{label:"Categoria plurale",title:"Non esiste un solo Romanticismo",text:"Germania, Francia, Inghilterra, Spagna e Italia sviluppano linguaggi diversi. Parlare di Romanticismo significa tenere insieme somiglianze e differenze."}
};
const SUBLIME = {
  bello:{label:"Bello",title:"Il bello offre forma e misura",text:"Il bello tende a presentarsi come ordine percepibile: proporzione, limite, accordo. Non è inferiore al sublime; risponde a un'altra esperienza.",equivalent:"Il bello ordina la distanza e lascia allo sguardo un appoggio."},
  pittoresco:{label:"Pittoresco",title:"Il pittoresco cerca varietà",text:"Il pittoresco ama irregolarità, rovine, alberi, percorsi e differenze locali. Può avvicinarsi al sublime, ma resta più abitabile.",equivalent:"Il pittoresco rende interessante la varietà del paesaggio."},
  infinito:{label:"Infinito",title:"L'infinito eccede il quadro",text:"Il sublime nasce quando lo spazio o la forza sembrano superare ciò che possiamo contenere con lo sguardo.",equivalent:"L'infinito suggerisce una grandezza che prosegue oltre il visibile."},
  terrore:{label:"Terrore",title:"La paura è tenuta a distanza",text:"Per Burke il terribile può produrre sublime quando non ci distrugge davvero: siamo al sicuro, ma percepiamo una forza enorme.",equivalent:"Il terrore sublime attrae perché resta osservabile a distanza di sicurezza."},
  sproporzione:{label:"Sproporzione",title:"L'uomo scopre la propria piccolezza",text:"Montagne, tempeste, mare e vuoto rendono sproporzionato il rapporto fra corpo umano e mondo.",equivalent:"La sproporzione fa sentire piccolo il corpo umano."},
  vertigine:{label:"Vertigine",title:"Piacere e inquietudine insieme",text:"Il sublime non coincide con il panico. È un'esperienza doppia: perdita di controllo e potenza dell'immaginazione.",equivalent:"La vertigine unisce piacere e inquietudine."}
};
const FRIEDRICH = {
  back:{label:"Figura di spalle",className:"friedrich-show-back",text:"La figura di spalle è una soglia. Non ci guarda: ci fa guardare con lei, senza consegnarci una spiegazione.",equivalent:"La figura di spalle presta allo spettatore un posto dentro l'immagine."},
  horizon:{label:"Orizzonte",className:"friedrich-show-horizon",text:"L'orizzonte non chiude lo spazio. Lo rende incerto: tra nebbia, montagne e distanza, la misura si perde.",equivalent:"L'orizzonte resta instabile e non completamente misurabile."},
  fog:{label:"Nebbia",className:"friedrich-show-fog",text:"La nebbia nasconde e rivela. Non è un effetto atmosferico decorativo: impedisce al dominio visivo di completarsi.",equivalent:"La nebbia sottrae la realtà alla piena padronanza dello sguardo."},
  scale:{label:"Scala",className:"friedrich-show-scale",text:"Il corpo umano appare piccolo ma centrale. Questa contraddizione è romantica: l'uomo conta proprio perché è fragile.",equivalent:"La scala mostra insieme centralità e fragilità dell'uomo."},
  threshold:{label:"Soglia",className:"friedrich-show-threshold",text:"La roccia è il bordo abitabile prima dell'indeterminato. Il personaggio non vive nell'infinito: vi sta davanti.",equivalent:"La roccia è una soglia tra spazio abitabile e spazio che supera."},
  viewpoint:{label:"Punto di vista",className:"friedrich-show-viewpoint",text:"Noi non siamo spettatori esterni e comodi. Il quadro ci avvicina al bordo e ci chiede di reggere la stessa distanza.",equivalent:"Il punto di vista coinvolge lo spettatore nella vertigine."}
};
const NATURE = {
  atmosfera:{label:"Atmosfera",title:"L'aria diventa pittura",text:"In Turner e Constable l'atmosfera non riempie semplicemente lo spazio: modifica luce, colore, visibilità e tempo dell'immagine."},
  luce:{label:"Luce",title:"La luce non chiarisce soltanto",text:"La luce romantica può dissolvere forme, confondere piani, far percepire energia. Non sempre serve a rendere tutto leggibile."},
  movimento:{label:"Movimento",title:"Il paesaggio è processo",text:"Tempesta, nubi, acqua, fumo e vento trasformano il paesaggio in evento. La natura non resta ferma per essere posseduta."},
  lavoro:{label:"Lavoro e luogo",title:"Constable non dipinge un vuoto idilliaco",text:"Il carro, il guado, il mulino e il cielo mostrano un ambiente vissuto. Il pittoresco si intreccia con memoria e lavoro rurale."},
  industria:{label:"Modernità",title:"La natura incontra la tecnica",text:"Turner aprirà anche alla velocità moderna: vapore, ferrovia, pioggia e percezione instabile. La modernità entra nell'atmosfera."}
};
const GOYA = {
  victim:{label:"Vittima",className:"goya-show-victim",text:"Il corpo bianco alza le braccia come martire e come uomo terrorizzato. Non è eroe antico: è individuo davanti alla morte.",equivalent:"La vittima illuminata è insieme individuo e simbolo della violenza."},
  machine:{label:"Soldati",className:"goya-show-machine",text:"I soldati non hanno volto. Sono una macchina obliqua di fucili, schiene e obbedienza.",equivalent:"I soldati diventano macchina anonima della storia."},
  lamp:{label:"Lanterna",className:"goya-show-lamp",text:"La luce artificiale non consola: espone la violenza. Illumina per farci testimoniare.",equivalent:"La lanterna denuncia la scena invece di salvarla."},
  dead:{label:"Cadaveri",className:"goya-show-dead",text:"I morti in primo piano negano ogni retorica ordinata della battaglia. La storia ha peso, sangue e irreversibilità.",equivalent:"I cadaveri trasformano la storia in trauma corporeo."},
  night:{label:"Notte",className:"goya-show-night",text:"La notte isola l'evento. Non c'è paesaggio eroico, ma un luogo senza protezione.",equivalent:"La notte elimina l'idea di una storia rassicurante."}
};
const DELACROIX = {
  liberty:{label:"Allegoria",className:"delacroix-show-liberty",text:"La Libertà è idea e corpo. Il suo seno, il cappello frigio e il passo in avanti la rendono insieme figura classica e donna del popolo.",equivalent:"La Libertà è allegoria politica e presenza corporea."},
  flag:{label:"Bandiera",className:"delacroix-show-flag",text:"Il tricolore concentra nazione, rivoluzione e promessa di comunità. Ma una bandiera può unire e semplificare.",equivalent:"La bandiera organizza il mito nazionale."},
  classes:{label:"Classi sociali",className:"delacroix-show-classes",text:"Borghese, lavoratore, ragazzo armato e folla non coincidono. Il popolo appare plurale, ma riunito in un'immagine eroica.",equivalent:"Le classi diverse sono unificate dalla composizione."},
  dead:{label:"Cadaveri",className:"delacroix-show-dead",text:"La barricata è costruita anche sui morti. La libertà avanza dentro la violenza, non sopra un suolo innocente.",equivalent:"I cadaveri impediscono di leggere l'opera come entusiasmo puro."},
  smoke:{label:"Fumo",className:"delacroix-show-smoke",text:"Il fumo rende instabile la scena. Dietro l'allegoria resta una città reale, sporca, armata.",equivalent:"Il fumo lega mito e cronaca urbana."}
};
const MEDUSA = {
  raft:{label:"Zattera",className:"medusa-show-raft",text:"La zattera è uno spazio politico ridotto all'estremo: corpi, gerarchie, abbandono, sopravvivenza.",equivalent:"La zattera comprime la società in un relitto."},
  dead:{label:"Corpi morti",className:"medusa-show-dead",text:"I corpi non servono a decorare il patetico. Costringono la pittura monumentale a guardare fame, morte e fallimento." ,equivalent:"I corpi morti negano l'eroismo tradizionale."},
  hope:{label:"Speranza",className:"medusa-show-hope",text:"Il gruppo che si alza verso l'orizzonte tiene insieme energia e disperazione. La speranza è minuscola e lontana.",equivalent:"La speranza resta fragile, proiettata verso un punto quasi invisibile."},
  sail:{label:"Vela",className:"medusa-show-sail",text:"La vela improvvisata non domina il mare. Segnala la precarietà di una ragione ridotta a sopravvivere.",equivalent:"La vela è un segno di sopravvivenza, non di dominio."},
  diagonal:{label:"Diagonale",className:"medusa-show-diagonal",text:"La composizione sale dai morti alla speranza. Non cancella la morte: la attraversa.",equivalent:"La diagonale costruisce una tensione tra fondo di morte e attesa di salvezza."}
};
const VISION = {
  sogno:{label:"Sogno",title:"Il sogno non è evasione innocente",text:"Nel Romanticismo il sogno può rivelare ciò che la veglia controlla o censura. L'immaginazione apre un'altra realtà."},
  incubo:{label:"Incubo",title:"La paura ha forma visiva",text:"Füssli non mostra ciò che la donna vede, ma ciò che la opprime. L'immagine anticipa una domanda moderna sull'inconscio."},
  mostruoso:{label:"Mostruoso",title:"Il mostro nasce anche dalla ragione addormentata",text:"Goya non dice che la ragione sia inutile: mostra che senza vigilanza può generare immagini oscure, superstizione, abuso."},
  immaginazione:{label:"Immaginazione",title:"L'immaginazione crea e destabilizza",text:"L'immaginazione romantica è potenza conoscitiva, ma può diventare fuga, ossessione, visione, disordine."}
};
const WORKS = [
  {title:"David",era:"Forma neoclassica",image:"assets/images/orazi.webp",alt:"David, Il giuramento degli Orazi"},
  {title:"Friedrich",era:"Paesaggio sublime",image:"assets/images/friedrich-viandante.webp",alt:"Friedrich, Viandante sul mare di nebbia"},
  {title:"Goya",era:"Storia come trauma",image:"assets/images/goya-3-maggio.webp",alt:"Goya, Il 3 maggio 1808"},
  {title:"Géricault",era:"Soglia verso il Realismo",image:"assets/images/gericault-medusa.webp",alt:"Géricault, La zattera della Medusa"}
];
const CATEGORY_LABELS = {composizione:"Composizione",centro:"Centro",spazio:"Spazio",corpo:"Corpo",natura:"Natura",luce:"Luce",tempo:"Tempo",emozione:"Emozione",storia:"Storia",individuo:"Individuo",popolo:"Popolo",spettatore:"Rapporto con lo spettatore",realta:"Idea di realtà",potere:"Potere",soglia:"Soglia verso il futuro"};
const COMPARE = {
  composizione:["Frontale, scandita da archi e gruppi morali.","Verticale e aperta: il personaggio sta davanti a una profondità indeterminata.","Blocco drammatico: vittime illuminate contro plotone anonimo.","Grande diagonale dai morti alla speranza, dentro un relitto contemporaneo."],
  centro:["Spade e giuramento concentrano il dovere civico.","Il centro è il corpo di spalle, ma ciò che conta lo supera.","La vittima bianca diventa accusa visiva.","Il centro si sposta: morte in basso, attesa in alto."],
  spazio:["Architettura misurabile e pubblica.","Spazio nebbioso, non completamente percorribile.","Spazio notturno senza protezione.","Spazio instabile: mare, zattera, orizzonte quasi irraggiungibile."],
  corpo:["Corpo disciplinato dal dovere.","Corpo piccolo davanti all'immenso.","Corpo vulnerabile, esposto alla fucilazione.","Corpo reale, affamato, morto o sopravvivente."],
  natura:["Quasi assente, subordinata alla scena morale.","Natura come infinito e soglia.","Natura ridotta a notte e suolo della violenza.","Mare come forza ostile e indifferente."],
  luce:["Chiarisce il gesto morale.","Si diffonde nella nebbia e non chiarisce tutto.","Denuncia la vittima e la violenza.","Costruisce carne, morte e speranza con teatralità fisica."],
  tempo:["Istante solenne del giuramento.","Tempo sospeso della contemplazione.","Ultimo istante prima dello sparo.","Tempo lungo della deriva e istante della possibile salvezza."],
  emozione:["Dolore contenuto dalla forma.","Pace e inquietudine insieme.","Terrore, pietà, indignazione.","Disperazione, speranza, disgusto, resistenza."],
  storia:["Episodio antico usato come modello moderno.","Storia quasi assente: domina esperienza esistenziale.","Evento storico recente trasformato in trauma.","Fatto contemporaneo e scandalo politico in forma monumentale."],
  individuo:["Cittadino come modello di sacrificio.","Individuo fragile davanti all'infinito.","Individuo-vittima davanti alla macchina storica.","Individui ridotti a sopravvivenza, non a gloria."],
  popolo:["La città prevale sulla famiglia, ma il popolo resta implicito.","Il popolo non è il tema: domina la solitudine.","Il popolo appare come vittima della guerra.","La comunità dei naufraghi mostra società, abbandono e gerarchia estrema."],
  spettatore:["Giudica un modello morale.","Guarda insieme alla figura e sente la soglia.","Testimonia una violenza da cui non può distogliersi innocente.","È posto davanti a un presente scandaloso, non a un mito lontano."],
  realta:["Realtà ordinata come esempio.","Realtà come esperienza dell'oltre.","Realtà come ferita storica.","Realtà come corpo contemporaneo, politico, materiale."],
  potere:["La forma educa e può disciplinare.","Il potere è interrogato dal limite dell'uomo.","Il potere armato appare anonimo e disumano.","Il potere politico è accusato attraverso il naufragio."],
  soglia:["Prepara il Romanticismo perché la misura mostra crepe.","Apre la crisi dell'io moderno davanti all'infinito.","Prepara l'arte moderna della guerra e del trauma.","Prepara il Realismo: corpi contemporanei, responsabilità sociale, storia non idealizzata."]
};
const QUIZ = [
  {section:"mondo",q:"Quale problema il Romanticismo eredita dal Neoclassicismo?",a:["La forma ordinata non riesce più a contenere storia, natura e interiorità","La completa inutilità della ragione","Il rifiuto di ogni immagine politica"],ok:0,why:"Il modulo insiste sulla crisi della misura, non sulla sparizione della ragione.",r:{lesson:"Il Neoclassicismo aveva cercato bellezza, ordine e virtù. Il Romanticismo mostra ciò che eccede quella disciplina: infinito, guerra, popolo, solitudine.",q:"Il passaggio corretto è...",a:["da ragione a pura confusione","da misura a crisi della misura","da arte a decorazione"],ok:1}},
  {section:"sublime",q:"Che differenza c'è fra bello e sublime?",a:["Il bello tende a misura e forma; il sublime produce sproporzione, attrazione e paura","Sono sinonimi","Il sublime è solo un paesaggio grazioso"],ok:0,why:"Il sublime è esperienza doppia: piacere e inquietudine davanti a ciò che supera.",r:{lesson:"Nel sublime la distanza di sicurezza permette di percepire una forza immensa senza esserne distrutti. Per questo attrae e spaventa.",q:"Il sublime richiede spesso...",a:["sproporzione e distanza","decorazione simmetrica","assenza di paura"],ok:0}},
  {section:"friedrich",q:"Perché il viandante è visto di spalle?",a:["Perché il pittore non sapeva dipingere volti","Perché ci fa guardare insieme a lui e trasforma lo spettatore in parte dell'esperienza","Perché nasconde il soggetto storico"],ok:1,why:"La figura di spalle è un dispositivo di coinvolgimento, non una mancanza.",r:{lesson:"La Rückenfigur non consegna un volto psicologico chiuso: presta allo spettatore una posizione davanti all'infinito.",q:"La figura di spalle serve a...",a:["escludere lo spettatore","coinvolgere lo spettatore nello sguardo","rendere il quadro astratto"],ok:1}},
  {section:"natura",q:"Nel Romanticismo la natura è...",a:["sempre sfondo decorativo","forza, processo, atmosfera e limite dell'uomo","sempre idillio campestre"],ok:1,why:"Turner e Constable mostrano natura come energia e tempo meteorologico.",r:{lesson:"Nubi, tempeste, luce, umidità e vento diventano elementi strutturali dell'immagine, non cornici.",q:"Nel modulo natura significa soprattutto...",a:["processo attivo","ornamento fisso","vuoto senza storia"],ok:0}},
  {section:"natura",q:"Che cosa mostrano Turner e Constable in modi diversi?",a:["Luce, atmosfera e movimento come parti del significato","Solo architetture antiche","Il rifiuto totale dell'osservazione naturale"],ok:0,why:"Uno radicalizza energia e instabilità; l'altro osserva atmosfera, luogo e lavoro rurale.",r:{lesson:"Turner tende alla dissoluzione atmosferica e alla forza; Constable studia cielo, umidità e luogo vissuto.",q:"Il cielo in Constable è...",a:["un riempitivo","un elemento osservato e attivo","sempre identico"],ok:1}},
  {section:"goya",q:"Perché Goya trasforma la storia in trauma?",a:["Perché elimina ogni violenza","Perché mostra vittime, macchina militare e luce che denuncia","Perché idealizza i soldati"],ok:1,why:"Il 3 maggio non celebra la guerra: la rende ferita visibile.",r:{lesson:"La vittima illuminata, i cadaveri e il plotone senza volto spezzano la retorica eroica.",q:"I soldati in Goya appaiono come...",a:["ritratti individuali","macchina anonima","eroi classici"],ok:1}},
  {section:"popolo",q:"Qual è l'ambiguità della Libertà di Delacroix?",a:["Il popolo è presente, ma anche trasformato in allegoria e mito nazionale","Non c'è alcun riferimento politico","È una scena senza corpi morti"],ok:0,why:"Il quadro unisce popolo reale, allegoria, violenza e costruzione politica.",r:{lesson:"Bandiera, barricata, corpi sociali e cadaveri rendono l'immagine potente ma non semplice: la libertà cammina dentro la violenza.",q:"Nel quadro di Delacroix il popolo è...",a:["solo massa decorativa","solo individuo privato","soggetto e simbolo insieme"],ok:2}},
  {section:"medusa",q:"Perché La zattera della Medusa mette in crisi l'eroismo?",a:["Perché mostra un fatto contemporaneo fatto di sopravvivenza, morte e responsabilità politica","Perché celebra un generale vittorioso","Perché evita i corpi"],ok:0,why:"Géricault monumentalizza un naufragio scandaloso, non un mito rassicurante.",r:{lesson:"La composizione sale dalla morte alla speranza, ma non cancella fame, abbandono e corpi reali.",q:"La zattera è soprattutto...",a:["un trionfo militare","un relitto politico e umano","un paesaggio decorativo"],ok:1}},
  {section:"incubo",q:"Che cosa aggiunge la linea visionaria del Romanticismo?",a:["Mostra sogno, incubo, immaginazione e paura come realtà interiori","Elimina ogni immagine mentale","Rende inutile Goya"],ok:0,why:"Il Romanticismo guarda anche dentro, verso ciò che non è pienamente controllabile.",r:{lesson:"Füssli e Goya mostrano che la crisi della ragione non è solo davanti alla natura o alla guerra, ma anche nell'interiorità.",q:"L'incubo in Füssli rappresenta...",a:["solo un episodio comico","una pressione psichica resa visibile","una scena di vita quotidiana"],ok:1}},
  {section:"romantico",q:"L'individuo romantico è solo un eroe solitario?",a:["No, è anche fragile, esposto, inquieto e talvolta smarrito","Sì, sempre invincibile","Sì, sempre senza rapporto con la storia"],ok:0,why:"Il modulo evita la semplificazione dell'eroe isolato.",r:{lesson:"L'individuo romantico può essere viandante, vittima, naufrago, sognatore, testimone: libertà e fragilità stanno insieme.",q:"Nel Viandante l'individuo è...",a:["padrone assoluto del mondo","centrale e fragile insieme","irrilevante"],ok:1}},
  {section:"popolo",q:"Perché nazione e popolo sono ambivalenti?",a:["Possono dare soggettività politica, ma anche produrre mito, esclusione e manipolazione","Sono sempre neutrali","Non compaiono mai nel Romanticismo"],ok:0,why:"L'immagine nazionale può liberare e semplificare nello stesso tempo.",r:{lesson:"La bandiera crea appartenenza; ma proprio per questo può trasformare conflitti sociali reali in racconto unitario.",q:"Una bandiera in pittura può...",a:["solo decorare","unire e semplificare","annullare ogni politica"],ok:1}},
  {section:"confronto",q:"Perché il Romanticismo prepara il Realismo?",a:["Perché porta nel quadro storia contemporanea, corpi concreti, trauma e responsabilità sociale","Perché torna solo all'antico","Perché cancella il pubblico moderno"],ok:0,why:"Goya e Géricault aprono una soglia: il presente doloroso diventa degno di pittura monumentale.",r:{lesson:"Quando il quadro non idealizza più la storia ma mostra corpi, vittime, scandali e società, il Realismo trova una strada.",q:"La soglia verso il Realismo passa anche da...",a:["corpi contemporanei e responsabilità sociale","miti antichi senza presente","decorazioni astratte"],ok:0}}
];

function loadState(){
  let raw = {};
  try { raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { raw = {}; }
  const state = clone(DEFAULT_STATE);
  if(!raw || typeof raw !== "object") return state;
  state.visited = Array.isArray(raw.visited) ? [...new Set(raw.visited.filter(n => Number.isInteger(n) && n >= 1 && n <= 13))] : [];
  state.notes.first = typeof raw.notes?.first === "string" ? raw.notes.first.slice(0, 6000) : "";
  state.notes.final = typeof raw.notes?.final === "string" ? raw.notes.final.slice(0, 6000) : "";
  state.timeline = Number.isInteger(raw.timeline) && raw.timeline >= 0 && raw.timeline < TIMELINE.length ? raw.timeline : 0;
  state.causal = allowed(raw.causal, Object.keys(CAUSAL), "filosofia");
  state.term = allowed(raw.term, Object.keys(TERMS), "sensibilita");
  state.sublime = allowed(raw.sublime, Object.keys(SUBLIME), "bello");
  state.friedrich = Array.isArray(raw.friedrich) ? [...new Set(raw.friedrich.filter(x => Object.keys(FRIEDRICH).includes(x)))] : [];
  state.nature = allowed(raw.nature, Object.keys(NATURE), "atmosfera");
  state.goya = Array.isArray(raw.goya) ? [...new Set(raw.goya.filter(x => Object.keys(GOYA).includes(x)))] : [];
  state.delacroix = Array.isArray(raw.delacroix) ? [...new Set(raw.delacroix.filter(x => Object.keys(DELACROIX).includes(x)))] : [];
  state.medusa = Array.isArray(raw.medusa) ? [...new Set(raw.medusa.filter(x => Object.keys(MEDUSA).includes(x)))] : [];
  state.vision = allowed(raw.vision, Object.keys(VISION), "sogno");
  state.compare = allowed(raw.compare, Object.keys(COMPARE), "composizione");
  const q = raw.quiz && typeof raw.quiz === "object" ? raw.quiz : {};
  state.quiz.index = Number.isInteger(q.index) ? Math.max(0, Math.min(12, q.index)) : 0;
  state.quiz.phase = allowed(q.phase, ["question","recovery","feedback","done"], "question");
  state.quiz.correctFirst = Array.isArray(q.correctFirst) ? [...new Set(q.correctFirst.filter(n => Number.isInteger(n) && n >= 0 && n < 12))] : [];
  state.quiz.errors = Number.isInteger(q.errors) && q.errors >= 0 ? Math.min(q.errors, 999) : 0;
  state.quiz.recoveries = Array.isArray(q.recoveries) ? [...new Set(q.recoveries.filter(n => Number.isInteger(n) && n >= 0 && n < 12))] : [];
  state.quiz.recoveryAttempts = Number.isInteger(q.recoveryAttempts) && q.recoveryAttempts >= 0 ? Math.min(q.recoveryAttempts, 999) : 0;
  state.quiz.completed = Boolean(q.completed);
  if(state.quiz.completed || state.quiz.index >= 12){ state.quiz.index = 12; state.quiz.phase = "done"; state.quiz.completed = true; }
  return state;
}
let state = loadState();
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

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
function renderSingle(config, stateKey, buttonsSelector, readingSelector, equivalentSelector, stageSelector){
  const wrap = $(buttonsSelector);
  wrap.innerHTML = Object.entries(config).map(([key,item]) => `<button type="button" data-key="${key}" aria-pressed="${state[stateKey]===key}">${item.label}</button>`).join("");
  const item = config[state[stateKey]];
  if(stageSelector) $(stageSelector).dataset.mode = state[stateKey];
  $(readingSelector).innerHTML = `<h3>${item.title}</h3><p>${item.text}</p>`;
  if(equivalentSelector) $(equivalentSelector).textContent = `Equivalente testuale: ${item.equivalent || item.text}`;
  wrap.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { state[stateKey] = button.dataset.key; save(); renderSingle(config, stateKey, buttonsSelector, readingSelector, equivalentSelector, stageSelector); renderSynthesis(); }));
}
function renderLayerLab(config, stateKey, stageSelector, buttonsSelector, readingSelector, equivalentSelector){
  const stage = $(stageSelector), wrap = $(buttonsSelector);
  wrap.innerHTML = Object.entries(config).map(([key,item]) => `<button type="button" data-key="${key}" aria-pressed="${state[stateKey].includes(key)}">${item.label}</button>`).join("");
  Object.values(config).forEach(item => stage.classList.remove(item.className));
  state[stateKey].forEach(key => stage.classList.add(config[key].className));
  const latest = state[stateKey].at(-1);
  $(readingSelector).innerHTML = latest ? `<h3>${config[latest].label}</h3><p>${config[latest].text}</p>` : "<h3>Attiva uno strato</h3><p>Ogni sovrapposizione è una domanda visiva. L'opera resta più complessa del diagramma.</p>";
  $(equivalentSelector).textContent = latest ? `Equivalente testuale: ${state[stateKey].map(key => config[key].equivalent).join(" ")}` : "Equivalente testuale: nessuno strato attivo.";
  wrap.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    const key = button.dataset.key;
    state[stateKey] = state[stateKey].includes(key) ? state[stateKey].filter(x => x !== key) : [...state[stateKey], key];
    save(); renderLayerLab(config, stateKey, stageSelector, buttonsSelector, readingSelector, equivalentSelector); renderSynthesis();
  }));
}
function renderCompare(){
  const wrap = $("#compareCategories");
  wrap.innerHTML = Object.keys(COMPARE).map(key => `<button type="button" data-key="${key}" aria-pressed="${state.compare===key}">${CATEGORY_LABELS[key]}</button>`).join("");
  const readings = COMPARE[state.compare];
  $("#compareGrid").innerHTML = WORKS.map((work,i) => `<article class="compare-card"><img src="${work.image}" alt="${work.alt}" width="600" height="420" loading="lazy"><div><h3>${work.title}</h3><span class="era">${work.era}</span><p><b>${CATEGORY_LABELS[state.compare]}.</b> ${readings[i]}</p></div></article>`).join("");
  wrap.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { state.compare = button.dataset.key; save(); renderCompare(); renderSynthesis(); }));
}
function renderSynthesis(){
  $("#openingMemory").textContent = state.notes.first || "Non hai ancora scritto un'annotazione.";
  const choices = [];
  if(state.sublime !== "bello") choices.push(`hai distinto il sublime attraverso ${SUBLIME[state.sublime].label.toLowerCase()}`);
  if(state.friedrich.length) choices.push("hai letto Friedrich come soglia dello spettatore");
  if(state.nature !== "atmosfera") choices.push(`hai osservato la natura come ${NATURE[state.nature].label.toLowerCase()}`);
  if(state.goya.length) choices.push("hai visto la storia diventare ferita in Goya");
  if(state.delacroix.length) choices.push("hai interrogato il popolo come soggetto e simbolo");
  if(state.medusa.length) choices.push("hai attraversato il naufragio della ragione con Géricault");
  if(state.vision !== "sogno") choices.push("hai riconosciuto la linea dell'incubo e dell'interiorità");
  const note = state.notes.final.trim() ? "Nel secondo taccuino hai formulato una rilettura autonoma dell'immagine iniziale." : "Il secondo taccuino attende ancora la tua rilettura.";
  $("#personalSynthesis").innerHTML = choices.length || state.notes.final.trim()
    ? `<h3>La tua sintesi</h3><p>Nel percorso ${choices.length ? choices.join(", ") : "hai riaperto l'immagine iniziale"}. ${note} Il Romanticismo non distrugge la ragione: le mostra il punto in cui natura, storia, popolo, sogno e infinito la costringono a riconoscere la propria fragilità.</p>`
    : "<h3>La tua sintesi</h3><p>Completa almeno un laboratorio e il secondo taccuino per generare una sintesi personale.</p>";
}
function updateProgress(){
  const count = state.visited.length;
  $("#readingProgress").value = count;
  $("#progressText").textContent = `${count} di 13 tappe`;
}
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
  $("#causalReset").addEventListener("click", () => { state.causal = "filosofia"; save(); renderCausal(); renderSynthesis(); });
  $("#termReset").addEventListener("click", () => { state.term = "sensibilita"; save(); renderTerms(); renderSynthesis(); });
  $("#sublimeReset").addEventListener("click", () => { state.sublime = "bello"; save(); renderSingle(SUBLIME,"sublime","#sublimeModes","#sublimeReading","#sublimeEquivalent","#sublimeStage"); renderSynthesis(); });
  $("#friedrichReset").addEventListener("click", () => { state.friedrich = []; save(); renderLayerLab(FRIEDRICH,"friedrich","#friedrichStage","#friedrichButtons","#friedrichReading","#friedrichEquivalent"); renderSynthesis(); });
  $("#natureReset").addEventListener("click", () => { state.nature = "atmosfera"; save(); renderSingle(NATURE,"nature","#natureControls","#natureReading","#natureEquivalent"); renderSynthesis(); });
  $("#goyaReset").addEventListener("click", () => { state.goya = []; save(); renderLayerLab(GOYA,"goya","#goyaStage","#goyaButtons","#goyaReading","#goyaEquivalent"); renderSynthesis(); });
  $("#delacroixReset").addEventListener("click", () => { state.delacroix = []; save(); renderLayerLab(DELACROIX,"delacroix","#delacroixStage","#delacroixButtons","#delacroixReading","#delacroixEquivalent"); renderSynthesis(); });
  $("#medusaReset").addEventListener("click", () => { state.medusa = []; save(); renderLayerLab(MEDUSA,"medusa","#medusaStage","#medusaButtons","#medusaReading","#medusaEquivalent"); renderSynthesis(); });
  $("#visionReset").addEventListener("click", () => { state.vision = "sogno"; save(); renderSingle(VISION,"vision","#visionControls","#visionReading"); renderSynthesis(); });
  $("#compareReset").addEventListener("click", () => { state.compare = "composizione"; save(); renderCompare(); renderSynthesis(); });
}
function renderQuiz(){
  const area = $("#quizArea"), meter = $("#quizMeter"), count = $("#quizCount");
  meter.value = Math.min(12,state.quiz.index);
  count.textContent = state.quiz.completed ? "Verifica completata" : `Domanda ${state.quiz.index + 1} di 12`;
  if(state.quiz.completed || state.quiz.phase === "done"){
    const needs = QUIZ.filter((_,i) => !state.quiz.correctFirst.includes(i)).map(item => `<a href="#${item.section}">${item.section}</a>`).join("") || "<span>Nessuno: tutte corrette al primo tentativo.</span>";
    area.innerHTML = `<article class="quiz-card quiz-summary"><p class="question-no">Percorso completato</p><h3>Hai attraversato sublime, storia e interiorità senza ridurli a slogan.</h3><div class="summary-grid"><article><b>${state.quiz.correctFirst.length}</b><span>corrette al primo tentativo</span></article><article><b>${state.quiz.errors}</b><span>errori iniziali</span></article><article><b>${state.quiz.recoveries.length}</b><span>recuperi superati</span></article><article><b>${12 - state.quiz.correctFirst.length}</b><span>nuclei da ripassare</span></article></div><p>Nuclei da riaprire:</p><div class="quiz-links">${needs}</div><button id="quizRestart" type="button">Ricomincia la verifica</button></article>`;
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
  const shut = () => { box.hidden = true; document.body.classList.remove("lightbox-open"); img.src = "assets/images/friedrich-viandante.webp"; trigger?.focus(); };
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
renderSingle(SUBLIME,"sublime","#sublimeModes","#sublimeReading","#sublimeEquivalent","#sublimeStage");
renderLayerLab(FRIEDRICH,"friedrich","#friedrichStage","#friedrichButtons","#friedrichReading","#friedrichEquivalent");
renderSingle(NATURE,"nature","#natureControls","#natureReading","#natureEquivalent");
renderLayerLab(GOYA,"goya","#goyaStage","#goyaButtons","#goyaReading","#goyaEquivalent");
renderLayerLab(DELACROIX,"delacroix","#delacroixStage","#delacroixButtons","#delacroixReading","#delacroixEquivalent");
renderLayerLab(MEDUSA,"medusa","#medusaStage","#medusaButtons","#medusaReading","#medusaEquivalent");
renderSingle(VISION,"vision","#visionControls","#visionReading");
renderCompare(); renderQuiz();
initProgress(); initNotes(); initMenu(); initResets(); initLightbox(); initServiceWorker();
