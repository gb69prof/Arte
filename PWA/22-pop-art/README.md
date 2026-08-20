# 22 · Quando l’immagine diventa merce

Modulo PWA di **Storia dello sguardo** dedicato alla Pop Art: consumo, pubblicità, ripetizione. La domanda generatrice — «Che cosa sta vendendo davvero un’immagine?» — attraversa Londra, New York, l’Italia e altri centri senza ridurre la Pop a una sola formula nazionale o stilistica.

## Percorso

Il modulo comprende 13 sezioni: lettura iniziale di un negozio self-service; passaggio da oggetto a merce e immagine; condizioni economiche e mediali del dopoguerra; precedenti; Independent Group e Londra; sistema newyorkese; serialità; oggetto e confezione; appropriazione e lavoro invisibile; celebrità, corpo e genere; geografia policentrica e Italia; circuito del valore; atlante, sintesi e verifica.

Le opere protette non sono incorporate: schede e laboratori rimandano alle pagine ufficiali di Tate, MoMA, Whitechapel Gallery, Galleria Nazionale e cataloghi di ricerca. La sola fotografia locale è un documento storico in pubblico dominio conservato da ArkDes; dettagli e trasformazioni tecniche sono registrati in `SOURCES.md`.

## Interazione e padronanza

Il percorso offre più di 21 nuclei significativi: marcatori della fotografia, comparatori, linee del tempo, reti, mappe, atlante, quattro laboratori regolabili e 16 nuclei di verifica. Ogni nucleo della verifica contiene domanda primaria, spiegazione, microlezione contestuale e domanda di recupero realmente differente. La padronanza resta salvata tra le visite.

Lo stato è normalizzato e confinato alla chiave `storia-sguardo-22-state`; dati corrotti, versioni non compatibili e indisponibilità dello storage non bloccano il modulo. Il service worker usa soltanto la cache `storia-sguardo-22-v1`, elimina esclusivamente cache obsolete col prefisso del modulo e ignora richieste esterne o non GET.

## Accessibilità e installazione

Il modulo usa HTML semantico, link di salto, focus visibile, controlli di almeno 44 px, menu e lightbox con gestione del focus, regioni di stato e supporto a `prefers-reduced-motion`. `manifest.webmanifest` e `sw.js` permettono installazione e consultazione offline dopo il primo caricamento.

Materiali realizzati da gbprof e Libera (ChatGPT) tramite dialogo costante e progettazione comune, sotto la direzione di gbprof.
