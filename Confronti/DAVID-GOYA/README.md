# David e Goya — Due modi di guardare la morte

PWA statica indipendente, senza dipendenze di terze parti, dentro il repository Arte.
URL previsto: https://gbprof.it/Arte/Confronti/DAVID-GOYA/

## Percorso
Otto confronti: corpo, ferita/sangue, volto, chi uccide, spazio, luce, gesto, tempo.
Ogni confronto propone osservazione, ipotesi, dettaglio coordinato, interpretazione.
La sintesi sulle categorie artistiche diventa visibile dopo una risposta in ciascuno degli otto confronti; l'errore non blocca il percorso, ma offre recupero.
Attività: tre tempi in Goya; riconoscimento casuale del dettaglio; confronto e interpretazione aperta con criteri di autovalutazione. Nessuna falsa valutazione automatica del testo.

## File
- index.html: struttura, contesto, sintesi, attività e fonti.
- content.js: contenuti e 18 hotspot, coordinate normalizzate sulle immagini reali.
- app.js: zoom/pan/pinch, confronto, ipotesi, taccuino e attività.
- videos.js: trascrizioni, note critiche e punti di integrazione.
- styles.css: desktop, tablet, alternanza smartphone, stampa e reduced motion.
- manifest.webmanifest, sw.js, assets/icons: PWA.

## Materiali
Immagini originali da Drive, senza sostituzioni né ritagli:
- David: 1Mbg0mLzbxfAJY-5RMM3lIBW-5qF2t7aO → assets/images/david.jpg (960×1235).
- Goya: 1fcHrrSdhMDCzUBIfDc0RVDG6SwuNF05k → assets/images/goya.jpg (1920×1480).
Documento letto integralmente: 1ca6ObI2Pfq0pC6JGXO8KMrl07cCguvJFHXWXfVlXaYo.
Video originali: 1pT-pZxLpAnGr-grmrOblFyrMYpDG0yOq, 1DRQ-tS34e1MxalfrZZ1y0AFFIRlLQ1Pm, 1rvYSdaQCg8SsnPYG6xs_fGX_6PQtpQcN.
Copie H.264/AAC 960px, faststart; preload none e creazione del player su richiesta.
Estratto 1: 61.84–76.885 s, nel confronto Chi uccide. Estratto 2: 19.96–32.28 s, nel Volto. Versioni complete disponibili negli stessi punti dopo gli otto confronti. Video 3 nella sintesi finale. Questo evita che i video anticipino le categorie teoriche.
Il video 2 inverte destra/sinistra: nota di correzione accanto al video completo. Le altre semplificazioni sono segnalate. Le trascrizioni conservano le affermazioni originali; le correzioni sono distinte. Sottotitoli da trascrizione automatica revisionata nei nomi propri: sincronizzazione approssimativa.

## Offline e dati
Cache gbprof-david-goya-v1, scope della sola sottocartella, eliminazione limitata al relativo prefisso. App, immagini, trascrizioni e sottotitoli offline; MP4 esclusi dalla precache e dalle intercettazioni Range. I video richiedono connessione.
localStorage: gbprof-david-goya-v1. Nessun invio di risposte, account o analytics. Esportazione e cancellazione del taccuino.

## Fonti
Schede museali dei Musées royaux des Beaux-Arts de Belgique, Louvre (Une icône de la Révolution), Prado (El 3 de mayo en Madrid, guida accessibile). Link nel sito. Le interpretazioni sono letture visive argomentate, non affermazioni di intenzione documentata.

## Verifica
Vedere VERIFICA.md per gli esiti effettivi e i limiti. La pubblicazione usa il workflow esistente; nessun cambiamento all'infrastruttura.
