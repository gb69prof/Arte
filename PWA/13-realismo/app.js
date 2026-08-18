"use strict";
const $ = selector => document.querySelector(selector);
const clone = value => JSON.parse(JSON.stringify(value));
const STORAGE_KEY = "storia-sguardo-13-state";

const TIMELINE = [
  {date:"1830",title:"Rivoluzioni di luglio",text:"Le insurrezioni europee riportano la folla nella storia contemporanea. Delacroix la costruisce ancora come evento, allegoria e azione eccezionale."},
  {date:"1839",title:"La fotografia diventa pubblica",text:"Il procedimento di Daguerre è presentato pubblicamente. La macchina sembra promettere una traccia diretta, ma esposizione, posa e inquadratura selezionano il visibile."},
  {date:"anni 1840",title:"Ferrovia e città",text:"Reti ferroviarie, industrializzazione e crescita urbana accelerano la circolazione di persone, merci e immagini, senza cancellare le divisioni di classe."},
  {date:"anni 1840",title:"Stampa illustrata e litografia",text:"Giornali, caricature e stampe moltiplicano il pubblico. Daumier può criticare la società attraverso immagini riproducibili, sottoposte anche a censura."},
  {date:"1848",title:"Rivoluzioni europee",text:"Le rivoluzioni del 1848 intrecciano suffragio, questione sociale, nazionalità e conflitto fra gruppi che non condividono gli stessi interessi."},
  {date:"1848",title:"Seconda Repubblica",text:"In Francia la monarchia cade e nasce la Seconda Repubblica. La promessa di cittadinanza universale maschile convive con profonde esclusioni sociali e di genere."},
  {date:"giugno 1848",title:"Le giornate di giugno",text:"La chiusura degli Ateliers nationaux provoca l'insurrezione operaia e una repressione sanguinosa. La 'società' appare come conflitto, non come unità astratta."},
  {date:"1849",title:"Nuovi soggetti monumentali",text:"Courbet dipinge Gli spaccapietre e avvia Un funerale a Ornans; Rosa Bonheur espone Aratura nel Nivernais. Lavoro e comunità occupano la grande scala."},
  {date:"1851",title:"Colpo di Stato",text:"Luigi Napoleone Bonaparte rovescia la Repubblica; l'anno seguente nasce il Secondo Impero. Modernizzazione, controllo politico e censura procedono insieme."},
  {date:"1850–1860",title:"Salon, critica, mercato",text:"Il Salon resta una soglia decisiva di legittimazione, mentre critica, collezionismo e pubblico borghese allargano e condizionano il campo dell'arte."},
  {date:"1855",title:"Pavillon du Réalisme",text:"Courbet espone a proprie spese accanto all'Esposizione universale. Il luogo dell'esposizione diventa una dichiarazione sull'autonomia dell'artista e sul pubblico."},
  {date:"1850–1865",title:"Realismi europei",text:"In Francia, Gran Bretagna e Italia emergono soluzioni differenti: scena sociale, vita moderna, lavoro agricolo, luce e osservazione del presente."},
  {date:"1871",title:"La Comune come soglia",text:"La Comune di Parigi rende ancora più esplicito il conflitto su lavoro, cittadinanza, spazio urbano e immagini. È una soglia conclusiva, non il centro del modulo."}
];

const CAUSAL = {
  rivoluzione:{label:"Rivoluzione",title:"La società diventa conflitto visibile",text:"Il 1830 e il 1848 mostrano che il popolo non è un blocco unico: gruppi, classi e progetti politici entrano in collisione."},
  lavoro:{label:"Lavoro",title:"Il gesto quotidiano diventa soggetto",text:"Lavoro agricolo, fatica manuale e viaggio di terza classe entrano nell'immagine monumentale senza diventare automaticamente emancipazione."},
  classe:{label:"Classe",title:"La posizione sociale organizza lo spazio",text:"Chi lavora, chi possiede, chi compra e chi guarda occupano posizioni diverse anche quando compaiono nella stessa immagine."},
  citta:{label:"Città",title:"La modernità concentra",text:"Strade, cantieri, ferrovie e folla rendono visibile una società interdipendente ma disuguale."},
  campagna:{label:"Campagna",title:"La terra è lavoro e proprietà",text:"Il paesaggio non è uno sfondo innocente: raccolto, spigolatura e aratura mostrano distribuzione della ricchezza e trasformazione del territorio."},
  industria:{label:"Industria",title:"Produzione e velocità",text:"L'industria modifica ritmi, materiali e relazioni; nell'arte può apparire direttamente oppure attraverso i suoi effetti sulla città e sul lavoro."},
  fotografia:{label:"Fotografia",title:"Una nuova autorità della traccia",text:"Il procedimento fotografico registra luce e tempo, ma sceglie inquadratura, posa ed esposizione: documenta costruendo."},
  stampa:{label:"Stampa",title:"Le immagini circolano",text:"Litografia e giornale illustrato ampliano il pubblico e rendono seriale la critica, esponendola anche alla censura."},
  salon:{label:"Salon",title:"La visibilità passa da un'istituzione",text:"Ammissione, rifiuto, collocazione e critica stabiliscono quali soggetti incontrano il pubblico e con quale prestigio."},
  mercato:{label:"Mercato",title:"La verità ha compratori",text:"L'artista realista dipende da collezionisti, editori e pubblico; la denuncia non vive fuori dall'economia delle immagini."},
  borghesia:{label:"Pubblico borghese",title:"Chi guarda non è neutrale",text:"Un pubblico proprietario può riconoscere dignità nei lavoratori oppure percepirli come minaccia sociale."},
  poverta:{label:"Povertà",title:"Visibilità e rischio di spettacolo",text:"Rendere visibile la scarsità può denunciare un rapporto sociale, ma può anche trasformare la fatica altrui in emozione per chi è al sicuro."},
  genere:{label:"Genere",title:"Lavori visibili, lavori cancellati",text:"Le donne appaiono come lavoratrici, madri o figure morali, mentre produzione dell'immagine e istituzioni restano fortemente maschili."},
  istruzione:{label:"Istruzione",title:"Nuovi lettori e nuovi sguardi",text:"Alfabetizzazione, stampa e dibattito allargano la ricezione delle immagini e il potere della critica."},
  censura:{label:"Censura",title:"La circolazione ha confini",text:"Regimi e istituzioni controllano la satira e la rappresentazione del conflitto; ciò che manca può essere una scelta imposta."},
  presente:{label:"Contemporaneità",title:"Il presente prende il posto dell'antico",text:"La vita contemporanea non è meno costruita della storia antica: cambia il criterio con cui un soggetto viene considerato degno."}
};

const TERMS = {
  movimento:{label:"Movimento storico",title:"Francia, metà Ottocento",text:"In senso stretto il Realismo è legato soprattutto alla Francia dopo il 1848, a Courbet e a un rifiuto delle gerarchie accademiche dei soggetti. Non coincide con ogni immagine somigliante."},
  soggetti:{label:"Scelta di soggetti",title:"Contemporaneo e non idealizzato",text:"Lavoratori, contadini, viaggiatori e comunità ordinarie ricevono una scala prima destinata a religione, mito e storia. L'assenza di idealizzazione non elimina lo stile."},
  costruzione:{label:"Costruzione dello sguardo",title:"La realtà non entra da sola",text:"Soggetto, inquadratura, gesto, luce, titolo, luogo di esposizione e pubblico costruiscono il significato. 'Vero' è una pretesa argomentata, non una registrazione automatica."},
  pluralita:{label:"Realismi plurali",title:"Contesti europei differenti",text:"Francia, Gran Bretagna, Italia e altri contesti articolano lavoro, città e campagna in modi diversi. Non c'è un programma politico unico né una semplice linea di progresso."}
};

const MIRROR_OPTIONS = {
  subject:{label:"Soggetto messo a fuoco",values:{corpi:{label:"Corpi",text:"Il primo piano insiste sul gesto e sulla postura delle lavoratrici."},raccolto:{label:"Raccolto",text:"Lo sfondo fa emergere l'abbondanza e il rapporto economico che circonda il gesto."},paesaggio:{label:"Paesaggio",text:"La scena può apparire come territorio ordinato, attenuando il conflitto sociale."}}},
  scale:{label:"Scala immaginata",values:{monumentale:{label:"Monumentale",text:"La grande scala trasferisce dignità e insieme può trasformare le figure in simboli."},umana:{label:"Umana",text:"Una scala prossima al corpo favorisce l'incontro, senza annullare la distanza sociale."},ridotta:{label:"Ridotta",text:"La piccola scala può rendere la scena intima oppure marginale."}}},
  viewpoint:{label:"Distanza",values:{vicino:{label:"Vicino",text:"L'avvicinamento rende il gesto urgente, ma può invadere il soggetto."},medio:{label:"Media",text:"La distanza mette in relazione corpi, terra e raccolto."},lontano:{label:"Lontano",text:"La figura rischia di diventare parte anonima del paesaggio."}}},
  title:{label:"Titolo",values:{neutro:{label:"Le spigolatrici",text:"Nomina il gesto e il gruppo senza imporre un giudizio esplicito."},morale:{label:"La dignità del lavoro",text:"Il titolo guida verso una lettura morale e può chiudere l'ambiguità."},politico:{label:"Dopo il raccolto dei proprietari",text:"Il titolo sposta l'attenzione sul rapporto fra lavoro, proprietà e residuo."}}},
  public:{label:"Pubblico",values:{salon:{label:"Salon",text:"Il soggetto entra nell'istituzione e affronta gerarchie accademiche e giudizio borghese."},giornale:{label:"Giornale",text:"La riproduzione amplia il pubblico ma riduce scala, colore e materialità."},comunita:{label:"Comunità ritratta",text:"La ricezione di chi vive quel lavoro non coincide necessariamente con quella del collezionista."}}}
};

const COURBET = {
  formato:{label:"Formato monumentale",className:"show-crowd",text:"Circa sei metri e mezzo di larghezza: la dimensione della pittura di storia è assegnata a un funerale provinciale.",equivalent:"il formato amplia la comunità fino alla scala pubblica;"},
  orizzonte:{label:"Disposizione orizzontale",className:"show-line",text:"La lunga fila non converge su un eroe. L'occhio percorre differenze e ripetizioni dentro il corpo sociale.",equivalent:"la disposizione orizzontale impedisce un centro eroico unico;"},
  fossa:{label:"Fossa",className:"show-grave",text:"Il vuoto della tomba taglia il primo piano e coinvolge lo spazio dello spettatore nella morte ordinaria.",equivalent:"la fossa apre un vuoto davanti allo spettatore;"},
  volti:{label:"Volti e comunità",className:"show-crowd",text:"I partecipanti sono persone del luogo e restano differenziati: comunità non significa folla anonima.",equivalent:"i volti individuali formano una comunità;"},
  paesaggio:{label:"Paesaggio locale",className:"show-horizon",text:"Le falesie di Ornans chiudono la scena: il luogo comune prende il posto dello sfondo ideale.",equivalent:"il paesaggio locale situa la morte;"},
  materia:{label:"Materia pittorica",className:"show-line",text:"Neri, terre e densità della pittura rifiutano una finitura invisibile: anche la superficie prende posizione.",equivalent:"la materia pittorica resta percepibile;"},
  spettatore:{label:"Spettatore",className:"show-viewer",text:"La fossa e le figure quasi a grandezza naturale pongono chi guarda davanti alla comunità, non sopra di essa.",equivalent:"lo spettatore è chiamato davanti al corpo sociale;"},
  scandalo:{label:"Scandalo",className:"show-crowd",text:"Lo scandalo non è soltanto il soggetto: è la collisione fra soggetto ordinario, scala monumentale e istituzione del Salon.",equivalent:"lo scandalo nasce dalla gerarchia dei generi violata."}
};

const MILLET = {
  gesto:{label:"Gesto ripetuto",className:"show-backs",text:"Le tre figure mostrano fasi consecutive dello stesso atto: cercare, raccogliere, rialzarsi appena.",equivalent:"il gesto si ripete senza culmine eroico;"},
  schiena:{label:"Schiena curva",className:"show-backs",text:"La postura rende visibile il peso e la durata del lavoro, senza accessori allegorici.",equivalent:"le schiene portano il tempo della fatica;"},
  mani:{label:"Mani",className:"show-hands",text:"Le mani collegano direttamente corpo e suolo: il lavoro è una conoscenza fisica, non un'idea astratta.",equivalent:"le mani uniscono corpo e terra;"},
  terra:{label:"Terra",className:"show-soil",text:"Il primo piano è quasi tutto terreno già raccolto: le spigolatrici cercano ciò che è rimasto.",equivalent:"la terra in primo piano è scarsità;"},
  ricchezza:{label:"Abbondanza",className:"show-wealth",text:"Covoni, carri e numerosi lavoratori occupano lo sfondo luminoso. La ricchezza è visibile ma distante.",equivalent:"l'abbondanza è separata sullo sfondo;"},
  orizzonte:{label:"Orizzonte",className:"show-horizon",text:"L'orizzonte divide lo spazio sociale oltre che il paesaggio: vicino la raccolta residua, lontano il raccolto organizzato.",equivalent:"l'orizzonte divide due condizioni;"},
  anonimato:{label:"Anonimato",className:"show-backs",text:"I volti non definiscono biografie. L'anonimato universalizza una condizione ma può cancellare le persone concrete.",equivalent:"l'anonimato rende comune e insieme sottrae identità;"},
  ambiguita:{label:"Dignità o paternalismo?",className:"show-wealth",text:"La monumentalità può riconoscere dignità; offerta a un pubblico borghese, può anche trasformare la fatica in immagine morale controllabile.",equivalent:"la dignità resta in tensione con il paternalismo."}
};

const DAUMIER = {
  spazio:{label:"Spazio compresso",className:"show-compression",text:"Il vagone avvicina corpi estranei ma non cancella il sistema di classi che li colloca in terza classe.",equivalent:"lo spazio unisce fisicamente e divide socialmente;"},
  primo:{label:"Primo piano",className:"show-front",text:"Anziana, madre, neonato e bambino hanno peso individuale; dietro, altri viaggiatori diventano una folla di sguardi.",equivalent:"il primo piano distingue età e cura;"},
  sguardi:{label:"Sguardi",className:"show-gazes",text:"Alcuni sguardi si abbassano, altri osservano o si perdono: non esiste un'unica psicologia della classe.",equivalent:"gli sguardi conservano differenze;"},
  anonimato:{label:"Anonimato",className:"show-grid",text:"La ripetizione dei volti produce una condizione collettiva, ma rischia di trasformare persone in tipi sociali.",equivalent:"l'anonimato oscilla fra condizione e stereotipo;"},
  ferrovia:{label:"Modernità ferroviaria",className:"show-compression",text:"Il treno promette mobilità e velocità; il vagone mostra che la modernità distribuisce comfort e spazio in modo disuguale.",equivalent:"la ferrovia accelera senza uguagliare;"},
  pittura:{label:"Pittura incompiuta",className:"show-grid",text:"La quadrettatura e alcune aree non finite rendono visibile il processo: non è una finestra trasparente sul viaggio.",equivalent:"la superficie dichiara la costruzione;"},
  circolazione:{label:"Stampa e pubblico",className:"show-gazes",text:"Daumier tratta treni e classi anche nelle litografie per la stampa: il mezzo cambia scala, diffusione e rischio di censura.",equivalent:"la critica circola fra pittura e stampa."}
};

const PHOTO_FRAMES = {
  boulevard:{label:"Intero boulevard",text:"L'ampiezza mostra architettura e strada, ma rende minime le figure rimaste sulla lastra."},
  figure:{label:"Figura ferma",text:"Il ritaglio concentra l'attenzione sulla persona immobile: la celebrità dell'immagine nasce anche da una scelta successiva di lettura."},
  facciate:{label:"Facciate",text:"Spostare il centro sulle architetture cambia il documento: la fotografia diventa soprattutto prova della città costruita."}
};

const EUROPE = {
  courbet:{label:"Courbet · Francia",title:"Conflitto con la gerarchia dei soggetti",text:"Courbet usa grande formato, materia e contemporaneità per costringere Salon e pubblico a confrontarsi con comunità e lavori privi di eroe. La sua politica resta legata anche alla strategia espositiva personale."},
  brown:{label:"Brown · Gran Bretagna",title:"La città come teatro delle classi",text:"In Work, scavatori, ricchi, venditori, bambini, animali e intellettuali condividono una strada londinese. L'abbondanza di dettagli costruisce una tassonomia morale e sociale dell'Inghilterra industriale."},
  bonheur:{label:"Bonheur · Francia",title:"Lavoro agricolo, animali e autorialità femminile",text:"Aratura nel Nivernais nasce da una commissione statale e rende monumentale la forza coordinata di buoi e uomini. L'immagine celebra competenza e ruralità; la posizione di Bonheur mostra anche gli ostacoli e l'autonomia di una donna artista."}
};

const ROLES = {
  produce:{label:"Chi produce",title:"Artista, bottega, fotografo",text:"Sceglie soggetto, tecnica, tempo, distanza e titolo. La posizione sociale di chi produce orienta ciò che può vedere e ciò che interpreta."},
  appears:{label:"Chi appare",title:"Soggetto rappresentato",text:"Può avere un nome o diventare un tipo; può posare, essere osservato o non controllare affatto la circolazione della propria immagine."},
  buys:{label:"Chi compra",title:"Stato, collezionista, editore",text:"Finanzia e seleziona. La domanda del mercato o della committenza non è esterna al significato pubblico dell'opera."},
  views:{label:"Chi guarda",title:"Pubblico situato",text:"Porta aspettative, paure e privilegi. Lo stesso corpo può apparire dignitoso, minaccioso, pittoresco o invisibile a pubblici differenti."},
  missing:{label:"Chi manca",title:"Assenze strutturali",text:"Lavoro domestico, voci individuali, soggetti coloniali e molte esperienze femminili restano spesso fuori dall'inquadratura e dalle istituzioni."}
};
const RESPONSIBILITY_ITEMS = ["Ho distinto persona e tipo sociale","Ho cercato chi controlla l'immagine","Ho considerato il pubblico","Ho nominato almeno un'assenza","Ho evitato di estetizzare la fatica"];

const WORKS = [
  {title:"Delacroix · La Libertà",era:"Romanticismo · 1830",image:"assets/images/delacroix-liberta.webp",width:1900,height:1520,alt:"La Libertà guida il popolo oltre la barricata."},
  {title:"Courbet · Funerale a Ornans",era:"Realismo · 1849–1850",image:"assets/images/courbet-funerale.webp",width:2400,height:1103,alt:"Una comunità partecipa a un funerale ordinario."},
  {title:"Daumier · Terza classe",era:"Realismo · 1864",image:"assets/images/daumier-terza-classe.webp",width:1800,height:1302,alt:"Viaggiatori siedono in un vagone di terza classe."},
  {title:"Daguerre · Boulevard",era:"Fotografia · 1838",image:"assets/images/daguerre-boulevard.webp",width:1600,height:1149,alt:"Un boulevard appare quasi vuoto per la lunga esposizione."}
];
const CATEGORY_LABELS = {soggetto:"Soggetto",composizione:"Composizione",centro:"Centro",scala:"Scala",spazio:"Spazio",corpo:"Corpo",gesto:"Gesto",lavoro:"Lavoro",classe:"Classe",luce:"Luce",tempo:"Tempo",punto:"Punto di vista",pubblico:"Pubblico",verita:"Idea di verità",potere:"Potere",assenza:"Visibilità e assenza",spettatore:"Rapporto con lo spettatore",futuro:"Soglia verso il futuro"};
const COMPARE = {
  soggetto:["Il popolo come protagonista di un'insurrezione eccezionale.","Una comunità provinciale e una morte ordinaria.","Viaggiatori moderni definiti anche dalla classe del biglietto.","Strada, architetture e poche figure rese visibili dal tempo tecnico."],
  composizione:["Piramide dinamica che culmina nell'allegoria.","Fascia orizzontale, senza eroe unico.","Piani compressi e volti ravvicinati.","Veduta urbana organizzata dalla camera e dalla lastra."],
  centro:["La Libertà concentra azione e simbolo.","La fossa è un vuoto più che un eroe.","Il gruppo familiare occupa il primo piano.","Il centro può spostarsi dalla strada alla figura ferma attraverso il ritaglio."],
  scala:["Grande pittura di storia per la rivoluzione.","Scala monumentale trasferita alla vita comune.","Formato più raccolto, prossimità fisica.","Piccola lastra capace di acquistare autorità documentaria."],
  spazio:["Barricata come teatro dell'evento.","Luogo locale e comunitario.","Interno ferroviario condiviso e gerarchizzato.","Boulevard apparentemente svuotato dal procedimento."],
  corpo:["Corpo eroico, ferito, allegorico.","Corpi differenziati di una comunità.","Corpi stanchi, seduti, vicini.","Corpi mobili cancellati; corpi fermi trattenuti."],
  gesto:["Avanzare, combattere, innalzare la bandiera.","Partecipare, attendere, piangere.","Sedersi, curare, osservare, dormire.","Restare abbastanza fermi da lasciare una traccia."],
  lavoro:["Evocato dalle classi in rivolta, non mostrato come routine.","Non è il centro del funerale, ma struttura la comunità locale.","Il viaggio mostra la condizione sociale fuori dal luogo di lavoro.","Il lavoro urbano in movimento scompare; resta forse il lustrascarpe."],
  classe:["Differenze riunite dal mito nazionale.","Gerarchie interne presenti ma non ordinate da un protagonista.","La classe determina il vagone e la densità dello spazio.","La tecnica non registra allo stesso modo chi si muove e chi si ferma."],
  luce:["Drammatica, cromatica, mobilitante.","Diffusa e terrosa, senza apoteosi.","Modella volti e volume dentro l'interno.","È la materia fisica della registrazione."],
  tempo:["Istante culminante dell'azione.","Rito e durata comunitaria.","Durata sospesa del viaggio.","Esposizione lunga che somma e cancella il movimento."],
  punto:["Vicino alla barricata, dentro l'evento.","Frontale, davanti alla fila e alla fossa.","All'altezza dei passeggeri del primo piano.","Elevato e fisso dalla finestra dello studio."],
  pubblico:["Salon, Stato, memoria nazionale.","Salon scandalizzato e pubblico borghese.","Museo e, nell'opera di Daumier, pubblico della stampa.","Scienziati, istituzioni e nuovo pubblico della fotografia."],
  verita:["La verità dell'evento passa attraverso allegoria e pathos.","Il presente è costruito con scala e materia della grande pittura.","La condizione sociale emerge da selezione e caratterizzazione.","La traccia ottica è reale, ma dipende da tempo, dispositivo e inquadratura."],
  potere:["Il simbolo politico mobilita e unifica.","La gerarchia dei generi viene contestata.","Il sistema di classe organizza la mobilità.","Il dispositivo decide quali presenze possono fissarsi."],
  assenza:["Le divisioni del popolo sono ricomposte nel simbolo.","Molte voci individuali restano mute.","I passeggeri sono visibili, le loro storie no.","La folla mobile è fisicamente cancellata dalla registrazione."],
  spettatore:["È trascinato verso l'avanzata.","È posto davanti alla comunità e alla fossa.","Condivide una prossimità scomoda.","Interpreta un'apparente assenza come informazione tecnica e sociale."],
  futuro:["Apre il contemporaneo come storia.","Rende il presente ordinario degno della grande scala.","Porta classe e circolazione nella vita moderna.","Prepara una percezione fatta di istante, taglio e apparizione: soglia verso l'Impressionismo."]
};

const QUIZ = [
  {q:"Quale passaggio apre il Realismo rispetto al Romanticismo?",a:["Dall'evento eccezionale al presente sociale quotidiano","Dal colore al solo disegno","Dalla pittura alla sola fotografia"],ok:0,why:"Il Realismo sposta la dignità dell'immagine verso condizioni ordinarie, senza cancellare costruzione e stile.",section:"mondo",r:{lesson:"Il Romanticismo aveva già mostrato popolo e presente, spesso come trauma, rivoluzione o allegoria. Il Realismo insiste sulla routine e sulla posizione sociale.",q:"Quale coppia esprime meglio il passaggio?",a:["Eroe antico / dio","Barricata eccezionale / lavoro ripetuto","Paesaggio / ritratto"],ok:1}},
  {q:"Perché un'immagine realista non è una copia neutrale?",a:["Perché inventa sempre persone inesistenti","Perché soggetto, inquadratura, scala e pubblico costruiscono significato","Perché usa soltanto simboli"],ok:1,why:"Ogni immagine seleziona e organizza: anche l'assenza di idealizzazione è una scelta formale.",section:"specchio",r:{lesson:"Una stessa scena cambia senso se cambiano titolo, distanza, scala e luogo di esposizione.",q:"Quale elemento NON è esterno al significato?",a:["Il pubblico","La cornice del browser soltanto","Il nome del file locale"],ok:0}},
  {q:"Che cosa scandalizza nella gerarchia tradizionale dei soggetti?",a:["Usare olio su tela","Assegnare grande formato a vite comuni","Dipingere un paesaggio francese"],ok:1,why:"La scala della pittura di storia viene trasferita a funerali, lavoro e comunità contemporanee.",section:"courbet",r:{lesson:"Accademie e Salon distinguevano generi più o meno nobili. Courbet mette un funerale provinciale alla scala della grande storia.",q:"Quale rapporto produce lo scandalo?",a:["Soggetto ordinario e formato monumentale","Tela e cornice dorata","Disegno e colore"],ok:0}},
  {q:"In Un funerale a Ornans che cosa sostituisce l'eroe unico?",a:["Un paesaggio vuoto","Una comunità orizzontale attorno alla fossa","Un'allegoria femminile"],ok:1,why:"La lunga fila di volti e la fossa costruiscono un corpo sociale senza culmine eroico.",section:"courbet",r:{lesson:"La composizione orizzontale distribuisce l'attenzione. La fossa apre un vuoto davanti allo spettatore.",q:"Quale forma guida l'occhio?",a:["Una piramide culminante","Una fascia di figure differenziate","Una spirale astratta"],ok:1}},
  {q:"Che rapporto costruiscono primo piano e sfondo nelle Spigolatrici?",a:["Scarsità vicina e abbondanza lontana","Città vicina e campagna lontana","Guerra vicina e pace lontana"],ok:0,why:"Terra, gesto e raccolto separano materialmente le lavoratrici dall'abbondanza.",section:"millet",r:{lesson:"Le donne raccolgono ciò che resta; covoni, carri e raccolto organizzato stanno sullo sfondo.",q:"Quale elemento visualizza la distribuzione della ricchezza?",a:["Il contrasto fra terra in primo piano e raccolto sullo sfondo","Soltanto il colore dei vestiti","La firma dell'artista"],ok:0}},
  {q:"Nel vagone di Daumier la modernità ferroviaria...",a:["cancella le classi","avvicina i corpi ma distribuisce lo spazio per classe","rende tutti anonimi nello stesso modo"],ok:1,why:"Mobilità e disuguaglianza convivono; prossimità non significa riconoscimento.",section:"daumier",r:{lesson:"La terza classe è uno spazio moderno e collettivo, ma il biglietto organizza comfort, densità e visibilità.",q:"Che cosa non garantisce la vicinanza fisica?",a:["Il movimento del treno","Il riconoscimento sociale","La presenza di sedili"],ok:1}},
  {q:"Perché Boulevard du Temple appare quasi vuoto?",a:["La strada era chiusa","La lunga esposizione non fissò gran parte del movimento","Daguerre cancellò a mano la folla"],ok:1,why:"Il tempo tecnico seleziona: ciò che si muove lascia tracce deboli o scompare.",section:"fotografia",r:{lesson:"La fotografia registra luce nel tempo. Movimento, immobilità, inquadratura e posa condizionano ciò che rimane.",q:"Quale presenza è favorita dalla lunga esposizione?",a:["Chi resta fermo","Chi corre più veloce","Chi è fuori campo"],ok:0}},
  {q:"Che cosa significa parlare di realismi plurali?",a:["Ogni nazione copia Courbet","Contesti diversi costruiscono lavoro e società con funzioni differenti","Il Realismo non ha alcuna storia"],ok:1,why:"Brown, Bonheur e Courbet mostrano differenze di contesto, committenza, pubblico e politica.",section:"europa",r:{lesson:"La scena urbana britannica di Brown e la ruralità monumentale di Bonheur non sono varianti identiche del programma di Courbet.",q:"Quale elemento varia fra i realismi?",a:["Soltanto la lingua del titolo","Pubblico, committenza e funzione","La presenza obbligatoria di contadini"],ok:1}},
  {q:"Rendere visibile una persona equivale automaticamente a liberarla?",a:["Sì, sempre","No: restano distanza, controllo e diritto di parola","Solo se il quadro è grande"],ok:1,why:"Visibilità, riconoscimento e potere sull'immagine sono problemi distinti.",section:"responsabilita",r:{lesson:"Occorre chiedere chi produce, chi appare, chi compra, chi guarda e chi manca.",q:"Quale domanda verifica la responsabilità?",a:["Quanto costa la cornice?","Chi controlla la circolazione dell'immagine?","Il cielo è azzurro?"],ok:1}},
  {q:"Qual è la tensione dell'anonimato realista?",a:["Rende comune una condizione ma può cancellare l'individuo","Dimostra che i soggetti non esistono","Elimina ogni giudizio"],ok:0,why:"Il tipo sociale permette di leggere una condizione, ma può ridurre biografie e differenze.",section:"millet",r:{lesson:"Volti poco definiti e gesti ripetuti spostano l'attenzione sulla condizione sociale; la persona concreta, però, può scomparire.",q:"Quando il tipo sociale diventa un limite?",a:["Quando cancella differenze e voce individuale","Quando usa un titolo","Quando compare in un museo"],ok:0}},
  {q:"Quali istituzioni condizionano la verità pubblica del Realismo?",a:["Salon, mercato, stampa e censura","Soltanto le botteghe medievali","Nessuna: l'artista è fuori dalla società"],ok:0,why:"Produzione, ammissione, riproduzione e controllo sono parte della circolazione delle immagini.",section:"frattura",r:{lesson:"Courbet costruisce un padiglione autonomo; Daumier lavora nella stampa e subisce i confini della censura.",q:"Perché il luogo di esposizione conta?",a:["Determina accesso e legittimazione","Cambia chimicamente il colore","Sostituisce il soggetto"],ok:0}},
  {q:"In che modo il Realismo prepara l'Impressionismo?",a:["Abbandona il presente","Porta attenzione su vita moderna, città, taglio e condizioni della percezione","Ritorna esclusivamente al mito"],ok:1,why:"Il presente diventa soggetto; fotografia, circolazione e città rendono urgente il problema dell'istante visivo.",section:"confronto",r:{lesson:"Non è un progresso tecnico automatico. Il Realismo apre la vita moderna; il modulo successivo interrogherà luce, metropoli e percezione instabile.",q:"Quale domanda passa al modulo 14?",a:["Come copiare meglio l'antico?","Che cosa accade quando la realtà diventa un istante?","Come eliminare il pubblico?"],ok:1}}
];

const DEFAULT_STATE = {version:1,visited:[],notes:{first:"",final:""},timeline:0,causal:"rivoluzione",term:"movimento",mirror:{subject:"corpi",scale:"umana",viewpoint:"medio",title:"neutro",public:"salon"},courbet:[],millet:[],daumier:[],photo:{exposure:2,frame:"boulevard"},europe:"courbet",role:"produce",responsibility:[],compare:"soggetto",quiz:{index:0,phase:"question",correctFirst:[],errors:0,recoveries:[],recoveryAttempts:0,completed:false}};

function allowed(value,values,fallback){return values.includes(value)?value:fallback}
function cleanText(value){return typeof value==="string"?value.slice(0,6000):""}
function cleanList(value,allowedValues){return Array.isArray(value)?[...new Set(value.filter(item=>allowedValues.includes(item)))]:[]}
function loadState(){
  let raw={};
  try{raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");if(!raw||typeof raw!=="object")raw={}}catch{raw={}}
  const state=clone(DEFAULT_STATE);
  state.visited=Array.isArray(raw.visited)?[...new Set(raw.visited.filter(n=>Number.isInteger(n)&&n>=1&&n<=13))].sort((a,b)=>a-b):[];
  state.notes.first=cleanText(raw.notes?.first);state.notes.final=cleanText(raw.notes?.final);
  state.timeline=Number.isInteger(raw.timeline)?Math.max(0,Math.min(TIMELINE.length-1,raw.timeline)):0;
  state.causal=allowed(raw.causal,Object.keys(CAUSAL),"rivoluzione");state.term=allowed(raw.term,Object.keys(TERMS),"movimento");
  for(const key of Object.keys(MIRROR_OPTIONS))state.mirror[key]=allowed(raw.mirror?.[key],Object.keys(MIRROR_OPTIONS[key].values),DEFAULT_STATE.mirror[key]);
  state.courbet=cleanList(raw.courbet,Object.keys(COURBET));state.millet=cleanList(raw.millet,Object.keys(MILLET));state.daumier=cleanList(raw.daumier,Object.keys(DAUMIER));
  state.photo.exposure=Number.isInteger(raw.photo?.exposure)?Math.max(0,Math.min(2,raw.photo.exposure)):2;state.photo.frame=allowed(raw.photo?.frame,Object.keys(PHOTO_FRAMES),"boulevard");
  state.europe=allowed(raw.europe,Object.keys(EUROPE),"courbet");state.role=allowed(raw.role,Object.keys(ROLES),"produce");state.responsibility=cleanList(raw.responsibility,RESPONSIBILITY_ITEMS);
  state.compare=allowed(raw.compare,Object.keys(COMPARE),"soggetto");
  const q=raw.quiz&&typeof raw.quiz==="object"?raw.quiz:{};state.quiz.index=Number.isInteger(q.index)?Math.max(0,Math.min(12,q.index)):0;state.quiz.phase=allowed(q.phase,["question","recovery","feedback","done"],"question");state.quiz.correctFirst=cleanList(q.correctFirst,[0,1,2,3,4,5,6,7,8,9,10,11]);state.quiz.errors=Number.isInteger(q.errors)&&q.errors>=0?Math.min(q.errors,999):0;state.quiz.recoveries=cleanList(q.recoveries,[0,1,2,3,4,5,6,7,8,9,10,11]);state.quiz.recoveryAttempts=Number.isInteger(q.recoveryAttempts)&&q.recoveryAttempts>=0?Math.min(q.recoveryAttempts,999):0;state.quiz.completed=Boolean(q.completed);
  if(state.quiz.completed||state.quiz.index>=12){state.quiz.index=12;state.quiz.phase="done";state.quiz.completed=true}
  return state;
}
let state=loadState();
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{/* Il modulo resta usabile anche se lo storage è bloccato. */}}

function renderTimeline(){
  const wrap=$("#timeline");
  wrap.innerHTML=TIMELINE.map((item,index)=>`<button type="button" data-index="${index}" aria-pressed="${state.timeline===index}"><b>${item.date}</b>${item.title}</button>`).join("");
  const item=TIMELINE[state.timeline];$("#timelineReading").innerHTML=`<h3>${item.title}</h3><p>${item.text}</p>`;
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.timeline=Number(button.dataset.index);save();renderTimeline();renderSynthesis()}));
}
function renderCausal(){
  const wrap=$("#causalNodes");wrap.innerHTML=Object.entries(CAUSAL).map(([key,item])=>`<button type="button" data-key="${key}" aria-pressed="${state.causal===key}">${item.label}</button>`).join("");
  const item=CAUSAL[state.causal];$("#causalReading").innerHTML=`<h3>${item.title}</h3><p>${item.text}</p>`;
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.causal=button.dataset.key;save();renderCausal();renderSynthesis()}));
}
function renderTerms(){
  const wrap=$("#termTabs");wrap.innerHTML=Object.entries(TERMS).map(([key,item],index)=>`<button type="button" role="tab" data-key="${key}" aria-selected="${state.term===key}"><span>0${index+1}</span>${item.label}</button>`).join("");
  const item=TERMS[state.term];$("#termReading").innerHTML=`<h3>${item.title}</h3><p>${item.text}</p>`;
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.term=button.dataset.key;save();renderTerms();renderSynthesis()}));
}
function renderMirror(){
  const wrap=$("#mirrorControls");
  wrap.innerHTML=Object.entries(MIRROR_OPTIONS).map(([key,group])=>`<fieldset class="parameter-set"><legend>${group.label}</legend><div>${Object.entries(group.values).map(([value,item])=>`<button type="button" data-group="${key}" data-value="${value}" aria-pressed="${state.mirror[key]===value}">${item.label}</button>`).join("")}</div></fieldset>`).join("");
  const stage=$("#mirrorStage");stage.dataset.subject=state.mirror.subject;stage.dataset.scale=state.mirror.scale;stage.dataset.viewpoint=state.mirror.viewpoint;
  const readings=Object.entries(MIRROR_OPTIONS).map(([key,group])=>group.values[state.mirror[key]].text);
  $("#mirrorReading").innerHTML=`<h3>${MIRROR_OPTIONS.title.values[state.mirror.title].label}</h3><p>${readings.join(" ")}</p>`;
  $("#mirrorEquivalent").textContent=`Equivalente testuale: soggetto ${MIRROR_OPTIONS.subject.values[state.mirror.subject].label.toLowerCase()}, scala ${MIRROR_OPTIONS.scale.values[state.mirror.scale].label.toLowerCase()}, distanza ${MIRROR_OPTIONS.viewpoint.values[state.mirror.viewpoint].label.toLowerCase()}, pubblico ${MIRROR_OPTIONS.public.values[state.mirror.public].label.toLowerCase()}.`;
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.mirror[button.dataset.group]=button.dataset.value;save();renderMirror();renderSynthesis()}));
}
function renderLayerLab(config,stateKey,stageSelector,buttonsSelector,readingSelector,equivalentSelector){
  const stage=$(stageSelector),wrap=$(buttonsSelector);wrap.innerHTML=Object.entries(config).map(([key,item])=>`<button type="button" data-key="${key}" aria-pressed="${state[stateKey].includes(key)}">${item.label}</button>`).join("");
  Object.values(config).forEach(item=>stage.classList.remove(item.className));state[stateKey].forEach(key=>stage.classList.add(config[key].className));
  const latest=state[stateKey].at(-1);$(readingSelector).innerHTML=latest?`<h3>${config[latest].label}</h3><p>${config[latest].text}</p>`:"<h3>Attiva uno strato</h3><p>Il diagramma orienta l'attenzione, ma non sostituisce l'opera.</p>";
  $(equivalentSelector).textContent=latest?`Equivalente testuale: ${state[stateKey].map(key=>config[key].equivalent).join(" ")}`:"Equivalente testuale: nessuno strato attivo.";
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{const key=button.dataset.key;state[stateKey]=state[stateKey].includes(key)?state[stateKey].filter(item=>item!==key):[...state[stateKey],key];save();renderLayerLab(config,stateKey,stageSelector,buttonsSelector,readingSelector,equivalentSelector);renderSynthesis()}));
}
function renderPhoto(){
  const stage=$("#photoStage"),range=$("#exposureRange"),wrap=$("#frameModes");stage.dataset.exposure=String(state.photo.exposure);stage.dataset.frame=state.photo.frame;range.value=String(state.photo.exposure);
  const labels=["1/20 secondo","1 secondo","5 minuti"];$("#exposureOutput").textContent=labels[state.photo.exposure];
  wrap.innerHTML=Object.entries(PHOTO_FRAMES).map(([key,item])=>`<button type="button" data-key="${key}" aria-pressed="${state.photo.frame===key}">${item.label}</button>`).join("");
  const timeText=["Un'esposizione breve simulata renderebbe più distinguibile il traffico, se la tecnica ottocentesca lo consentisse.","Un tempo intermedio lascia presenze incerte: movimento e immobilità producono tracce diverse.","La lunga esposizione somma la luce e cancella gran parte del traffico; poche figure ferme restano leggibili."][state.photo.exposure];
  $("#photoReading").innerHTML=`<h3>${labels[state.photo.exposure]} · ${PHOTO_FRAMES[state.photo.frame].label}</h3><p>${timeText} ${PHOTO_FRAMES[state.photo.frame].text}</p>`;
  $("#photoEquivalent").textContent=`Equivalente testuale: esposizione ${labels[state.photo.exposure]}, inquadratura centrata su ${PHOTO_FRAMES[state.photo.frame].label.toLowerCase()}.`;
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.photo.frame=button.dataset.key;save();renderPhoto();renderSynthesis()}));
}
function renderEurope(){
  const wrap=$("#europeTabs");wrap.innerHTML=Object.entries(EUROPE).map(([key,item])=>`<button type="button" role="tab" data-key="${key}" aria-selected="${state.europe===key}">${item.label}</button>`).join("");
  const item=EUROPE[state.europe];$("#europeReading").innerHTML=`<h3>${item.title}</h3><p>${item.text}</p>`;
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.europe=button.dataset.key;save();renderEurope();renderSynthesis()}));
}
function renderResponsibility(){
  const map=$("#roleMap");map.innerHTML=Object.entries(ROLES).map(([key,item])=>`<button type="button" data-key="${key}" aria-pressed="${state.role===key}">${item.label}</button>`).join("");
  const item=ROLES[state.role];$("#roleReading").innerHTML=`<h3>${item.title}</h3><p>${item.text}</p>`;
  const checks=$("#responsibilityChecks");checks.innerHTML=RESPONSIBILITY_ITEMS.map((label,index)=>`<label><input type="checkbox" data-index="${index}" ${state.responsibility.includes(label)?"checked":""}>${label}</label>`).join("");
  $("#responsibilitySummary").textContent=state.responsibility.length?`Hai verificato ${state.responsibility.length} responsabilità su ${RESPONSIBILITY_ITEMS.length}: ${state.responsibility.join("; ")}.`:"Seleziona le responsabilità che hai realmente verificato nell'immagine.";
  map.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.role=button.dataset.key;save();renderResponsibility();renderSynthesis()}));
  checks.querySelectorAll("input").forEach(input=>input.addEventListener("change",()=>{const label=RESPONSIBILITY_ITEMS[Number(input.dataset.index)];state.responsibility=input.checked?[...new Set([...state.responsibility,label])]:state.responsibility.filter(item=>item!==label);save();renderResponsibility();renderSynthesis()}));
}
function renderCompare(){
  const wrap=$("#compareCategories");wrap.innerHTML=Object.keys(COMPARE).map(key=>`<button type="button" data-key="${key}" aria-pressed="${state.compare===key}">${CATEGORY_LABELS[key]}</button>`).join("");
  const readings=COMPARE[state.compare];$("#compareGrid").innerHTML=WORKS.map((work,index)=>`<article class="compare-card"><img src="${work.image}" alt="${work.alt}" width="${work.width}" height="${work.height}" loading="lazy"><div><h3>${work.title}</h3><span class="era">${work.era}</span><p><b>${CATEGORY_LABELS[state.compare]}.</b> ${readings[index]}</p></div></article>`).join("");
  wrap.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.compare=button.dataset.key;save();renderCompare();renderSynthesis()}));
}

function renderSynthesis(){
  $("#openingMemory").textContent=state.notes.first||"Non hai ancora scritto un'annotazione.";
  const box=$("#personalSynthesis");box.replaceChildren();const title=document.createElement("h3");title.textContent="La tua sintesi";box.append(title);
  const actions=[];
  if(Object.keys(state.mirror).some(key=>state.mirror[key]!==DEFAULT_STATE.mirror[key]))actions.push("hai modificato i parametri che costruiscono una scena");
  if(state.courbet.length)actions.push(`hai attivato ${state.courbet.length} strati su Courbet`);
  if(state.millet.length)actions.push(`hai attivato ${state.millet.length} strati sul corpo al lavoro`);
  if(state.daumier.length)actions.push(`hai attivato ${state.daumier.length} strati su classe e circolazione`);
  if(state.photo.exposure!==2||state.photo.frame!=="boulevard")actions.push("hai variato tempo e inquadratura fotografica");
  if(state.europe!=="courbet")actions.push(`hai confrontato la linea ${EUROPE[state.europe].label}`);
  if(state.responsibility.length)actions.push(`hai verificato ${state.responsibility.length} responsabilità dello sguardo`);
  if(state.compare!=="soggetto")actions.push(`hai concluso sul criterio «${CATEGORY_LABELS[state.compare]}»`);
  const p=document.createElement("p");p.textContent=actions.length?`Nel percorso ${actions.join("; ")}. Questa sintesi registra soltanto le attività effettivamente compiute.`:"Completa almeno un laboratorio: la sintesi non inventerà attività o preferenze che non hai espresso.";box.append(p);
  if(state.notes.final.trim()){
    const intro=document.createElement("p");intro.textContent="Dal tuo secondo taccuino:";const quote=document.createElement("blockquote");quote.textContent=state.notes.final.trim().slice(0,420)+(state.notes.final.trim().length>420?"…":"");box.append(intro,quote);
  }else{const pending=document.createElement("p");pending.textContent="Il secondo taccuino non contiene ancora una rilettura.";box.append(pending)}
}

function updateProgress(){const count=state.visited.length;$("#readingProgress").value=count;$("#progressText").textContent=`${count} di 13 tappe`}
function initProgress(){
  if(!("IntersectionObserver" in window)){state.visited=[1,2,3,4,5,6,7,8,9,10,11,12,13];save();updateProgress();return}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const step=Number(entry.target.dataset.step);if(!state.visited.includes(step)){state.visited.push(step);state.visited.sort((a,b)=>a-b);save();updateProgress()}}}),{threshold:.22});
  document.querySelectorAll(".tracked").forEach(section=>observer.observe(section));updateProgress();
}
function initNotes(){
  const first=$("#openingNote"),final=$("#returnNote");first.value=state.notes.first;final.value=state.notes.final;renderSynthesis();const timers={};
  const bind=(input,key,status)=>input.addEventListener("input",()=>{clearTimeout(timers[key]);timers[key]=setTimeout(()=>{state.notes[key]=cleanText(input.value);save();$(status).textContent="Salvato su questo dispositivo.";renderSynthesis()},260)});
  bind(first,"first","#openingSave");bind(final,"final","#returnSave");
}
function initMenu(){
  const menu=$("#chapterMenu"),scrim=$("#menuScrim"),open=$("#menuButton"),close=$("#menuClose");let previous=null;
  const show=()=>{previous=document.activeElement;menu.hidden=false;scrim.hidden=false;open.setAttribute("aria-expanded","true");close.focus()};
  const hide=()=>{menu.hidden=true;scrim.hidden=true;open.setAttribute("aria-expanded","false");(previous||open).focus()};
  open.addEventListener("click",show);close.addEventListener("click",hide);scrim.addEventListener("click",hide);menu.querySelectorAll("a").forEach(link=>link.addEventListener("click",hide));
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!menu.hidden)hide();if(event.key==="Tab"&&!menu.hidden){const focusable=[...menu.querySelectorAll("a,button")],first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
  $("#resetState").addEventListener("click",()=>{if(confirm("Cancellare taccuini, avanzamento, laboratori e verifica salvati su questo dispositivo?")){localStorage.removeItem(STORAGE_KEY);location.reload()}});
}
function initResets(){
  $("#timelineReset").addEventListener("click",()=>{state.timeline=0;save();renderTimeline();renderSynthesis()});
  $("#causalReset").addEventListener("click",()=>{state.causal="rivoluzione";save();renderCausal();renderSynthesis()});
  $("#termReset").addEventListener("click",()=>{state.term="movimento";save();renderTerms();renderSynthesis()});
  $("#mirrorReset").addEventListener("click",()=>{state.mirror=clone(DEFAULT_STATE.mirror);save();renderMirror();renderSynthesis()});
  $("#courbetReset").addEventListener("click",()=>{state.courbet=[];save();renderLayerLab(COURBET,"courbet","#courbetStage","#courbetButtons","#courbetReading","#courbetEquivalent");renderSynthesis()});
  $("#milletReset").addEventListener("click",()=>{state.millet=[];save();renderLayerLab(MILLET,"millet","#milletStage","#milletButtons","#milletReading","#milletEquivalent");renderSynthesis()});
  $("#daumierReset").addEventListener("click",()=>{state.daumier=[];save();renderLayerLab(DAUMIER,"daumier","#daumierStage","#daumierButtons","#daumierReading","#daumierEquivalent");renderSynthesis()});
  $("#photoReset").addEventListener("click",()=>{state.photo=clone(DEFAULT_STATE.photo);save();renderPhoto();renderSynthesis()});
  $("#europeReset").addEventListener("click",()=>{state.europe="courbet";save();renderEurope();renderSynthesis()});
  $("#responsibilityReset").addEventListener("click",()=>{state.role="produce";state.responsibility=[];save();renderResponsibility();renderSynthesis()});
  $("#compareReset").addEventListener("click",()=>{state.compare="soggetto";save();renderCompare();renderSynthesis()});
}

function renderQuiz(){
  const area=$("#quizArea"),meter=$("#quizMeter"),count=$("#quizCount");meter.value=Math.min(12,state.quiz.index);count.textContent=state.quiz.completed?"Verifica completata":`Domanda ${state.quiz.index+1} di 12`;
  if(state.quiz.completed||state.quiz.phase==="done"){
    const needs=QUIZ.filter((_,index)=>!state.quiz.correctFirst.includes(index)).map(item=>`<a href="#${item.section}">${item.section}</a>`).join("")||"<span>Nessuno: tutte corrette al primo tentativo.</span>";
    area.innerHTML=`<article class="quiz-card quiz-summary"><p class="question-no">Percorso completato</p><h3>Hai verificato che rappresentare significa scegliere e assumere una responsabilità.</h3><div class="summary-grid"><article><b>${state.quiz.correctFirst.length}</b><span>corrette al primo tentativo</span></article><article><b>${state.quiz.errors}</b><span>errori iniziali</span></article><article><b>${state.quiz.recoveries.length}</b><span>recuperi superati</span></article><article><b>${12-state.quiz.correctFirst.length}</b><span>nuclei da ripassare</span></article></div><p>Nuclei da riaprire:</p><div class="quiz-links">${needs}</div><button id="quizRestart" type="button">Ricomincia la verifica</button></article>`;
    $("#quizRestart").addEventListener("click",()=>{state.quiz=clone(DEFAULT_STATE.quiz);save();renderQuiz()});return;
  }
  const item=QUIZ[state.quiz.index];
  if(state.quiz.phase==="question"){
    area.innerHTML=`<form class="quiz-card" id="questionForm"><p class="question-no">Nucleo ${state.quiz.index+1}</p><h3>${item.q}</h3>${item.a.map((answer,index)=>`<label><input type="radio" name="answer" value="${index}">${answer}</label>`).join("")}<button type="submit">Verifica</button><p id="questionStatus" role="status"></p></form>`;
    $("#questionForm").addEventListener("submit",event=>{event.preventDefault();const picked=event.currentTarget.elements.answer.value;if(picked===""){$("#questionStatus").textContent="Scegli una risposta.";return}if(Number(picked)===item.ok){if(!state.quiz.correctFirst.includes(state.quiz.index))state.quiz.correctFirst.push(state.quiz.index);state.quiz.phase="feedback"}else{state.quiz.errors+=1;state.quiz.phase="recovery"}save();renderQuiz()});return;
  }
  if(state.quiz.phase==="recovery"){
    area.innerHTML=`<form class="quiz-card" id="recoveryForm"><p class="question-no">Recupero bloccante · sezione ${item.section}</p><h3>Ricostruisci il collegamento</h3><div class="quiz-feedback"><h4>Microlezione</h4><p>${item.r.lesson}</p><p><a href="#${item.section}">Rileggi la sezione pertinente</a></p></div><h3>${item.r.q}</h3>${item.r.a.map((answer,index)=>`<label><input type="radio" name="answer" value="${index}">${answer}</label>`).join("")}<button type="submit">Verifica il recupero</button><p id="recoveryStatus" role="status"></p></form>`;
    $("#recoveryForm").addEventListener("submit",event=>{event.preventDefault();const picked=event.currentTarget.elements.answer.value;if(picked===""){$("#recoveryStatus").textContent="Scegli una risposta di recupero.";return}if(Number(picked)===item.r.ok){if(!state.quiz.recoveries.includes(state.quiz.index))state.quiz.recoveries.push(state.quiz.index);state.quiz.phase="feedback";save();renderQuiz()}else{state.quiz.recoveryAttempts+=1;save();$("#recoveryStatus").textContent="Non ancora: rileggi la microlezione e prova di nuovo."}});return;
  }
  area.innerHTML=`<article class="quiz-card"><p class="question-no">Collegamento ricostruito</p><div class="quiz-feedback correct"><h4>${state.quiz.recoveries.includes(state.quiz.index)?"Recupero superato":"Risposta corretta"}</h4><p>${item.why}</p><p><a href="#${item.section}">Torna alla sezione ${item.section}</a></p></div><button id="quizNext" type="button">${state.quiz.index===11?"Concludi":"Domanda successiva"}</button></article>`;
  $("#quizNext").addEventListener("click",()=>{state.quiz.index+=1;if(state.quiz.index>=12){state.quiz.index=12;state.quiz.phase="done";state.quiz.completed=true}else state.quiz.phase="question";save();renderQuiz()});
}

function initLightbox(){
  const box=$("#lightbox"),stage=$("#lightboxStage"),img=$("#lightboxImage"),caption=$("#lightboxCaption"),close=$("#lightboxClose"),reset=$("#zoomReset");let trigger=null,scale=1,x=0,y=0,drag=null,moved=false;
  const transform=()=>{img.style.transform=`translate(${x}px,${y}px) scale(${scale})`;reset.textContent=`${Math.round(scale*100)}%`};
  const setScale=next=>{scale=Math.max(1,Math.min(4,next));if(scale===1){x=0;y=0}transform()};
  const open=button=>{trigger=button;const figure=button.closest("figure"),source=figure.querySelector("img"),text=figure.querySelector("figcaption")?.textContent||source.alt;img.src=source.currentSrc||source.src;img.width=source.naturalWidth||Number(source.getAttribute("width"));img.height=source.naturalHeight||Number(source.getAttribute("height"));img.alt=source.alt;caption.textContent=text;scale=1;x=0;y=0;transform();box.hidden=false;document.body.classList.add("lightbox-open");close.focus()};
  const shut=()=>{box.hidden=true;document.body.classList.remove("lightbox-open");img.src="assets/images/millet-spigolatrici.webp";img.width=1800;img.height=1347;trigger?.focus()};
  document.querySelectorAll(".open-image").forEach(button=>button.addEventListener("click",()=>open(button)));$("#zoomIn").addEventListener("click",()=>setScale(scale+.35));$("#zoomOut").addEventListener("click",()=>setScale(scale-.35));reset.addEventListener("click",()=>setScale(1));close.addEventListener("click",shut);
  stage.addEventListener("pointerdown",event=>{if(event.target!==img)return;drag={id:event.pointerId,sx:event.clientX,sy:event.clientY,x,y};moved=false;stage.setPointerCapture(event.pointerId);stage.classList.add("dragging")});
  stage.addEventListener("pointermove",event=>{if(!drag||drag.id!==event.pointerId||scale===1)return;const dx=event.clientX-drag.sx,dy=event.clientY-drag.sy;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;x=drag.x+dx;y=drag.y+dy;transform()});
  stage.addEventListener("pointerup",event=>{if(drag?.id===event.pointerId){drag=null;stage.classList.remove("dragging")}});stage.addEventListener("click",event=>{if(event.target===stage&&!moved)shut()});box.addEventListener("click",event=>{if(event.target===box)shut()});
  document.addEventListener("keydown",event=>{if(box.hidden)return;if(event.key==="Escape")shut();if(event.key==="+")setScale(scale+.35);if(event.key==="-")setScale(scale-.35);if(event.key==="Tab"){const controls=[...box.querySelectorAll("button")],first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
}
function initServiceWorker(){if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}

renderTimeline();renderCausal();renderTerms();renderMirror();
renderLayerLab(COURBET,"courbet","#courbetStage","#courbetButtons","#courbetReading","#courbetEquivalent");
renderLayerLab(MILLET,"millet","#milletStage","#milletButtons","#milletReading","#milletEquivalent");
renderLayerLab(DAUMIER,"daumier","#daumierStage","#daumierButtons","#daumierReading","#daumierEquivalent");
renderPhoto();renderEurope();renderResponsibility();renderCompare();renderQuiz();
initProgress();initNotes();initMenu();initResets();initLightbox();initServiceWorker();
$("#exposureRange").addEventListener("input",event=>{state.photo.exposure=Number(event.target.value);save();renderPhoto();renderSynthesis()});
