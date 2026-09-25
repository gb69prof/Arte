# Aggiornamento didattico — 25 settembre 2026

## Esito
Pubblicata la lezione completa (otto capitoli, circa 2.100 parole comprese le note ai video), con i tre video integrali incorporati e disponibili subito. Sintesi e interpretazioni dei dettagli liberamente accessibili. Lettura chiara su fondo chiaro, indice, rimandi ai dettagli e ritorno al paragrafo, stampa della lezione.

Commit della riorganizzazione: 0ed581afa7258187a2d2f0a35fe1779d59477193.
Correzione della cache: 4dc7939641105f643600483169aac3ff2c7c4792.
Deploy e controllo standard gbprof conclusi con successo per entrambi.

## Verifiche effettive della nuova versione
- Identità SHA-256 dei tre nuovi allegati con gli originali ricevuti in precedenza. Riutilizzate le copie video complete già pubblicate, H.264/AAC 960×540; durate 76,885 / 66,240 / 74,840 secondi.
- Controlli HTML: ID unici, destinazioni degli anchor presenti, risorse locali esistenti, otto capitoli e tre video nativi. Nessun gate per lezione, sintesi o interpretazioni.
- Sintassi JavaScript controllata con Node; audit dello standard PWA: zero errori e zero avvisi.
- Browser Chrome sul sito pubblico: avvio e avanzamento confermati per tutti i video (osservati a circa 18, 13 e 17 secondi); nessun errore dei lettori; durata integrale confermata; pausa automatica del video precedente confermata.
- Collegamento «Metti i due volti a confronto»: apre il confronto corretto, zoom David 450% / Goya 714%; ritorno al paragrafo #volti confermato.
- Tutte le sei immagini nella pagina principale caricate dopo lo scorrimento. Le immagini della lezione hanno lazy loading e non si caricano finché lontane dal viewport.
- Layout attraverso iframe di larghezza 390 / 768 / 1180 px, area interna effettiva 375 / 753 / 1165 px: nessun overflow orizzontale. Ispezione visiva della lezione desktop e mobile.
- Cache v3: 24 risorse presenti e nessuna risorsa essenziale mancante. Risolto il riutilizzo di risorse HTTP vecchie durante la precache usando richieste con cache reload. Navigazione online aggiornata dalla rete, fallback alla lezione in cache quando offline.
- Aggiornamento verificato anche nella sessione del browser che aveva aperto e memorizzato la versione precedente.
- Nessun errore applicativo osservato; presenti messaggi dell’estensione del browser di test estranei al sito.
- Anteprima della lezione verificata: docs/anteprima.jpg.

## Limiti
Nessuna prova su iPad/Safari fisico, nessuna modalità aereo reale e nessuna nuova prova di stampa su carta o screen reader. La verifica responsive usa iframe nel browser desktop. I video richiedono la rete; le trascrizioni sono disponibili offline. Sincronizzazione dei sottotitoli approssimativa. Il limite precedente sulla verifica del download del taccuino rimane invariato. Gli errori dei video originali sono segnalati in note accanto ai lettori.

## Ambito
Modificati soltanto file nella sottocartella Confronti/DAVID-GOYA. Pubblicazione con il workflow esistente; nessuna modifica diretta al server o all’infrastruttura. Chiave delle note locali conservata.

---

# Verifiche della versione precedente (24 settembre)

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
- Esportazione del taccuino: pulsante azionato, ma il browser remoto non ha restituito l’evento di download entro il timeout; scaricamento non confermato dal collaudo. Il salvataggio locale dopo ricaricamento è invece verificato.
- Non è stato eseguito un collaudo con screen reader esterno o un'installazione su sistema operativo. Sono presenti semantica, alternative testuali, etichette, focus e navigazione da tastiera.
- Trascrizioni video generate automaticamente e revisionate nei nomi; sincronizzazione sottotitoli approssimativa. Gli errori del materiale originario sono segnalati in note distinte.

Banco di verifica separato dal percorso: docs/verifica.html.
Anteprima del confronto: docs/anteprima.jpg.
