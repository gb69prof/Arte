# Spazi delle PWA

La home generale organizza il percorso in cinque gallerie e venticinque fratture. Ogni futura PWA avrà una propria cartella numerata nella directory `PWA/` e conserverà un collegamento esplicito alla home generale.

Contratto di navigazione per ogni PWA:

- `← Storia dello sguardo` rimanda a `../../index.html`;
- `Precedente` e `Successiva` seguono l’ordine dei moduli;
- le domande permanenti conservano gli stessi nomi e la stessa identità grafica;
- la home attiva il collegamento soltanto quando la PWA è completa.

I percorsi previsti sono già dichiarati in `assets/app.js`; il collegamento viene attivato quando il modulo è pubblicato.

## Moduli pubblicati

- [01 · Prima dell’arte? — Perché rappresentare ciò che esiste?](./01-prima-dell-arte/)
- [02 · Dare forma all’ordine — Quando l’immagine diventa potere?](./02-mesopotamia-egitto/)
- [03 · Inventare la misura — Il corpo tra realtà e ideale](./03-grecia/)
- [04 · Il volto dell’impero — Individuo, propaganda, monumentalità](./04-ellenismo-roma/)
- [05 · Rendere visibile l’invisibile — L’immagine come soglia](./05-cristianesimo-medioevo/)
- [06 · La città sale verso la luce — Spazio sacro e nuova società urbana](./06-romanico-gotico/)
- [07 · Quando l’uomo torna ad abitare lo spazio — Giotto, la rivoluzione dello sguardo](./07-giotto/)
- [08 · Misurare il mondo — Rinascimento: prospettiva, individuo, ragione](./08-rinascimento/)
- [09 · La forma perde la quiete — Manierismo: la crisi dell’equilibrio](./09-manierismo/)
- [10 · Caravaggio — Quando il sacro entra nella strada](./10-caravaggio/)
- [11 · La bellezza diventa virtù — Neoclassicismo: arte, ragione, cittadinanza](./11-neoclassicismo/)
- [12 · L’infinito inquieta la ragione — Romanticismo: sublime, individuo, storia](./12-romanticismo/)
- [13 · Chi merita di essere rappresentato? — Realismo: il lavoro entra nel quadro](./13-realismo/)
- [14 · Quando la realtà diventa un istante — Impressionismo: luce, metropoli, percezione](./14-impressionismo/)
- [15 · La realtà non basta più — Postimpressionismo: oltre ciò che l’occhio registra](./15-postimpressionismo/)
- [16 · Il mondo dentro di noi — Espressionismo: alienazione e crisi dell’io](./16-espressionismo/)
- [17 · La fine dell’unico punto di vista — Cubismo: moltiplicare la realtà](./17-cubismo/)
- [18 · La velocità diventa forma — Futurismo: macchina, città, accelerazione](./18-futurismo/)
- [19 · Contro la ragione che ha prodotto la guerra — Dada e Surrealismo: caso, inconscio, provocazione](./19-dada-surrealismo/)
- [20 · Quando il potere occupa le immagini — Arte e totalitarismi: propaganda, consenso, controllo](./20-arte-totalitarismi/)
- [21 · Dopo l’irrappresentabile — Dopoguerra: materia, gesto, memoria](./21-dopoguerra/)

Il modulo 07 inaugura la galleria **Inventare l’uomo moderno**. Mantiene osservazione iniziale, taccuino locale, avanzamento, lightbox accessibile, verifica bloccante con recupero e funzionamento offline; introduce inoltre la scoperta stratificata della tecnica d’affresco, la costruzione progressiva di una scena abitabile, l’analisi degli indizi spaziali, l’isolamento di volto/mani/sguardi/postura/distanza e un confronto per categorie fra Cimabue, Duccio e Giotto.

Il modulo 08 trasforma lo spazio credibile in un problema di misura. Mantiene tredici tappe, taccuini e avanzamento locali, visualizzatore accessibile, verifica bloccante e PWA offline; introduce la rete degli attori, il diagramma prudente sulla trasmissione dei saperi, la ricostruzione dichiarata dell’esperimento di Brunelleschi, “Costruisci lo spazio” in sette passaggi, la lettura geometrica e teologica della *Trinità*, confronti fra architettura/rilievo/pittura, laboratori su ritratto e città e un confronto finale fra quattro modi di costruire lo spazio.

Il modulo 09 mostra come la forma perda la quiete senza perdere competenza. Mantiene tredici tappe, taccuini, avanzamento locale, lightbox, verifica bloccante e PWA offline; introduce cronologia, rete causale, laboratori su spazio, corpo, colore, architettura, ritratto, sacro e circolazione internazionale del Manierismo.

Il modulo 10 segue Caravaggio e il Barocco come ingresso del sacro nella strada. È più compatto, fondato su quattro opere, taccuini, luce, committenza, decoro, rifiuto e visualizzatore; conclude aprendo la domanda del modulo 11: se l’immagine può persuadere, può anche educare?

Il modulo 11 studia il Neoclassicismo come progetto educativo, morale e politico della bellezza. Mantiene tredici sezioni, indice, avanzamento, localStorage con chiave `storia-sguardo-11-state`, taccuini, lightbox accessibile con zoom e trascinamento, cronologia interattiva, rete causale, laboratori su Orazi, linea, Canova, virtù maschile/femminile, Marat, immagine napoleonica, museo, confronto finale per categorie, verifica bloccante con dodici recuperi e cache offline.

Il modulo 12 chiude la galleria **Inventare l’uomo moderno**. Mantiene tredici sezioni, indice, avanzamento, localStorage con chiave `storia-sguardo-12-state`, due taccuini, lightbox accessibile con zoom e trascinamento, cronologia interattiva, rete causale, laboratorio sul sublime, laboratori su Friedrich, Turner/Constable, Goya, Delacroix, Géricault, visione/incubo/interiorità, confronto finale per quindici categorie, verifica bloccante con dodici recuperi e cache offline. La soglia conclusiva prepara il modulo 13 sul Realismo.

Il modulo 13 apre la galleria **Rivoluzioni dello sguardo**. Mantiene tredici sezioni, indice, avanzamento e due taccuini con chiave `storia-sguardo-13-state`, lightbox accessibile con zoom e trascinamento, verifica bloccante con dodici microlezioni e cache offline. Introduce una cronologia sociale, una rete causale, il laboratorio “La realtà non è uno specchio”, letture stratificate di Courbet, Millet e Daumier, una simulazione sul tempo fotografico, il confronto fra realismi europei, il laboratorio sulla responsabilità dello sguardo e un confronto finale per diciotto categorie. La soglia conclusiva prepara il modulo 14 senza costruirlo.

Il modulo 14 sposta la domanda dal soggetto rappresentato alle condizioni temporali e sociali della percezione. Mantiene tredici sezioni, indice, avanzamento e tre taccuini con chiave `storia-sguardo-14-state`, lightbox accessibile, verifica con dodici concetti obbligatori e microlezioni di recupero, cache offline e reset locali. Introduce cronologia e rete causale non deterministica, laboratorio dell’istante in dieci parametri, analisi a livelli di *Impression, soleil levant*, laboratori su metropoli e stazione, attività su loisir e lavoro invisibile, confronto Morisot/Cassatt, serie sincronizzata dei covoni e atlante finale per venti categorie. La soglia conclusiva conduce ora direttamente al modulo 15.

Il modulo 15 chiude la galleria **Rivoluzioni dello sguardo**. Mostra che il Postimpressionismo non è un movimento unitario, ma una categoria retrospettiva per risposte differenti alla crisi della percezione immediata. Seurat sistematizza, Cézanne costruisce, Van Gogh intensifica e Gauguin simbolizza, senza diventare quattro formule rigide. Comprende tredici sezioni, cronologia e rete, mappa critica dei termini, laboratorio astratto delle quattro operazioni, analisi stratificate e confronti con studi autentici, attività sul quadro coloniale dello sguardo, comparatore sincronizzato, atlante dei moduli 13–15, sintesi derivata dalle sole azioni dello studente, taccuini con chiave `storia-sguardo-15-state`, verifica di sedici nuclei con recuperi e uso offline. La soglia finale conduce ora direttamente al modulo 16.

Il modulo 16 apre la galleria **Frammentare il reale**. L’Espressionismo è presentato come costellazione di gruppi e ricerche differenti: non libera emozioni già pronte, ma costruisce tensioni fra figura, spazio, colore, ritmo e sguardo. La lezione usa Munch, Kirchner, Kandinsky, Schiele, Werefkin e Kollwitz per collegare interiorità, metropoli, genere, reti, colonialismo, guerra, musei e repressione. Mantiene tredici sezioni, indice, avanzamento, tre taccuini, lightbox accessibile, reset locali e generale, uso offline e stato versionato con chiave `storia-sguardo-16-state`; introduce il laboratorio “mettere il mondo sotto pressione”, lo spartito visivo, la catena politica dell’“arte degenerata”, comparatore e atlante, sintesi fondata soltanto sulle azioni e verifica di sedici nuclei con microlezioni e domande di recupero differenti.

Il modulo 17 mostra il Cubismo come costruzione di relazioni fra veduta, memoria, indizio, segno e materia, non come geometria decorativa o scansione completa dell’oggetto. Juan Gris apre e chiude il percorso; María Blanchard e Robert Delaunay modificano il racconto centrato su Picasso e Braque, le cui opere protette restano collegate alle sole schede museali. La PWA mantiene tredici sezioni, indice, avanzamento, taccuini, lightbox con zoom, reset locali e generale, uso offline e chiave `storia-sguardo-17-state`; introduce laboratorio del punto di vista, classificatore delle fonti, ricostruzione per indizi, collage concettuale, rete dei Cubismi, comparatore per dodici categorie, atlante e verifica di sedici nuclei con recuperi distinti. La soglia finale conduce ora direttamente al modulo 18.

Il modulo 18 studia il Futurismo come costruzione di movimento, simultaneità, rumore e accelerazione, non come pittura di oggetti veloci o celebrazione innocente della macchina. Boccioni apre e chiude una struttura di tredici sezioni che comprende cronologia non deterministica, manifesto come macchina comunicativa, laboratorio del movimento, confronto fra cronofotografia/cinema/pittura, rete plurale degli artisti, laboratorio sonoro accessibile, attività su città e disuguaglianze, guerra e fascismo, atlante e verifica di sedici nuclei. Immagini, opere non copiate e limiti giuridici sono registrati in `SOURCES.md`; note e azioni restano sul dispositivo con la sola chiave `storia-sguardo-18-state`. La soglia finale conduce ora direttamente al modulo 19.

Il modulo 19 distingue critica della ragione strumentale e culto dell’irrazionale, pluralità dei centri Dada e mito di un movimento unitario, uso artistico dell’inconscio e teoria psicoanalitica. Picabia apre e chiude tredici sezioni con cronologia 1914–1945, mappa geografica, laboratorio del caso, laboratorio decisionale sul ready-made, simulatore di fotomontaggio, comparatore Dada/Surrealismo, laboratorio sull’inconscio, rete di artisti e autrici, classificatore coloniale, sequenza politica e atlante. La verifica richiede sedici nuclei compresi; stato e note restano nel browser con la sola chiave `storia-sguardo-19-state`. La soglia finale conduce ora direttamente al modulo 20.

Il modulo 20 conclude la quarta galleria distinguendo uso politico delle immagini, propaganda, censura e coercizione. Fascismo italiano, nazismo e stalinismo vengono confrontati senza equivalenza: pluralità degli stili, Reichskulturkammer e mostre del 1937, avanguardia sovietica e Realismo socialista restano storie specifiche. Tredici sezioni comprendono osservazione di Muchina, cronologia 1917–1945, classificatori, reti, matrice italiana, laboratori di contesto, allestimento, manipolazione fotografica, spazio e montaggio, otto posizioni artistiche, etica delle immagini-documento, atlante e verifica di sedici nuclei con recuperi distinti. Lo stato usa esclusivamente `storia-sguardo-20-state`; immagini locali, opere non riprodotte e limiti etici sono documentati in `SOURCES.md`. La soglia conduce ora direttamente al modulo 21.

Il modulo 21 apre la quinta galleria distinguendo fine militare, liberazione, sopravvivenza, ricostruzione, testimonianza, memoria pubblica, Guerra fredda e decolonizzazione. La fotografia Bundesarchiv di un pozzo della U-Bahn danneggiato nel 1945 apre e chiude tredici sezioni. Comparatore delle immagini, cronologia 1945–1964, classificatori etici, laboratori astratti su materia, gesto, colore e spazio, rete italiana, persistenza della figura, mappa policentrica, Gutai, circuito istituzionale, atlante e verifica di sedici nuclei mostrano che astrazione e figurazione non sono risposte morali automatiche. Le opere protette non sono copiate né imitate; la fotografia locale e i limiti sono documentati in `SOURCES.md`. Lo stato usa esclusivamente `storia-sguardo-21-state`; la soglia rimanda soltanto alla scheda del modulo 22.
