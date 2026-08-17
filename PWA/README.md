# Spazi delle PWA

La home generale organizza il percorso in cinque gallerie e venticinque fratture. Ogni futura PWA avrà una propria cartella numerata nella directory `PWA/` e conserverà un collegamento esplicito alla home generale.

Contratto di navigazione per ogni PWA:

- `← Storia dello sguardo` rimanda a `../../index.html`;
- `Precedente` e `Successiva` seguono l’ordine dei moduli;
- le domande permanenti conservano gli stessi nomi e la stessa identità grafica;
- la home attiva il collegamento soltanto quando la PWA è completa.

I percorsi previsti sono già dichiarati in `assets/app.js` tramite l’attributo `data-future-path`.