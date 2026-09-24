# Verifica del progetto pubblicato — 24 settembre 2026

URL verificato nel browser: https://gbprof.it/Arte/Confronti/DAVID-GOYA/
Accesso verificato: https://gbprof.it/#spazi → porta David e Goya → PWA.
Repository: https://github.com/gb69prof/Arte/tree/main/Confronti/DAVID-GOYA
Home: gb69prof/gbprof-home, unica modifica a index.html.

## Verifiche concluse
- Deploy del repository Arte e della home: workflow GitHub riusciti.
- 26 file dell'app pubblicata confrontati con le copie locali tramite SHA-256: tutti identici.
- Le due immagini corrispondono ai file scaricati dal Drive indicato; nessuna sostituzione. Dimensioni 960×1235 e 1920×1480.
- Tutti i 18 punti controllati visivamente sulle immagini pubblicate: David (volto, ferita, braccio, lettera, coltello, cassa, fondo, corpo); Goya (uomo, volto, mani, soldati, fucili, lanterna, cadaveri, sangue, attesa, città).
- Zoom coordinato per temi, zoom indipendente, ritorno all'intero, descrizioni e selezione da elenco: verificati nel browser.
- Spostamento via freccia da tastiera: trasformazione effettiva della scena verificata.
- Otto ipotesi e relative interpretazioni percorse; sintesi nascosta inizialmente e visibile dopo 8/8.
- Attività passato/presente/futuro: associazione corretta, risultato 3/3 verificato.
- Riconoscimento: dettaglio Mani attribuito a Goya, spiegazione restituita correttamente.
- Risposta aperta conservata dopo ricaricamento; nessuna valutazione automatica fittizia.
- Video completi 1, 2 e 3: riproduzione avviata nel browser; readyState 4 e tempo in avanzamento; durate 76.885, 66.24 e 74.84 s. File H.264/AAC integri. Estratti e sottotitoli raggiungibili.
- Nessun MP4 viene creato/caricato prima della richiesta esplicita. Poster e trascrizioni disponibili.
- Viewport iframe nominali 390 e 768 px (larghezze utili 375 e 753 px con scrollbar): nessun overflow orizzontale dell'app, quattro immagini caricate. Alternanza smartphone David/Goya e controlli di zoom provati.
- Pan e pinch provati con PointerEvent sintetici sul codice pubblicato: variazioni di posizione e scala osservate; pinch da 3.13043 a 6.26087.
- Manifest e riferimenti locali validi. Service worker attivo e controllante; cache dedicata con 24 risorse. Nessuna risorsa fondamentale assente dalla cache. MP4 esclusi intenzionalmente.
- Log del browser: nessun errore dell'app rilevato. Presenti messaggi dell'estensione del browser, estranei al progetto.
- Collegamento della nuova porta su SPAZI aperto realmente; URL di destinazione e titolo della PWA confermati.

## Limiti della verifica
- Non è stata effettuata una prova su iPad/iPhone fisico o su Safari. Touch simulato nel browser; cattura reale del puntatore e gesture native da verificare su dispositivo.
- Cache e controllo del service worker verificati; non è stata effettuata una prova in modalità aereo reale. I video restano online per scelta progettuale.
- Non è stato eseguito un collaudo con screen reader esterno o un'installazione su sistema operativo. Sono presenti semantica, alternative testuali, etichette, focus e navigazione da tastiera.
- Trascrizioni video generate automaticamente e revisionate nei nomi; sincronizzazione sottotitoli approssimativa. Gli errori del materiale originario sono segnalati in note distinte.

Banco di verifica separato dal percorso: docs/verifica.html.
Anteprima del confronto: docs/anteprima.jpg.
