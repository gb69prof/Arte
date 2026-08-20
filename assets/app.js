const galleries = [
  {roman:"I",title:"Nascere all’immagine",years:"40.000 a.C. — XIV secolo",color:"ochre",thesis:"L’immagine nasce prima della spiegazione: rende presente ciò che non possiamo trattenere.",modules:[
    ["01","Prima dell’arte?","Preistoria","Perché rappresentare ciò che esiste?","01-prima-dell-arte"],["02","Dare forma all’ordine","Mesopotamia ed Egitto","Quando l’immagine diventa potere","02-mesopotamia-egitto"],["03","Inventare la misura","Grecia","Il corpo tra realtà e ideale","03-grecia"],["04","Il volto dell’impero","Ellenismo e Roma","Individuo, propaganda, monumentalità","04-ellenismo-roma"],["05","Rendere visibile l’invisibile","Cristianesimo e Medioevo","L’immagine come soglia","05-cristianesimo-medioevo"],["06","La città sale verso la luce","Romanico e Gotico","Spazio sacro e nuova società urbana","06-romanico-gotico"]]},
  {roman:"II",title:"Inventare l’uomo moderno",years:"XIV — XIX secolo",color:"vermilion",thesis:"Lo spazio acquista profondità, l’uomo centralità. Poi l’equilibrio si incrina: l’immagine persuade, educa, costruisce cittadinanza e infine incontra l’infinito.",modules:[
    ["07","Quando l’uomo torna ad abitare lo spazio","Giotto","La rivoluzione dello sguardo","07-giotto"],["08","Misurare il mondo","Rinascimento","Prospettiva, individuo, ragione","08-rinascimento"],["09","La forma perde la quiete","Manierismo","La crisi dell’equilibrio","09-manierismo"],["10","Quando il sacro entra nella strada","Caravaggio · Barocco","Corpi reali, luce, persuasione","10-caravaggio"],["11","La bellezza diventa virtù","Neoclassicismo","Arte, ragione, cittadinanza","11-neoclassicismo"],["12","L’infinito inquieta la ragione","Romanticismo","Sublime, individuo, storia","12-romanticismo"]]},
  {roman:"III",title:"Rivoluzioni dello sguardo",years:"XIX secolo",color:"blue",thesis:"La storia sociale entra nell’immagine: lavoro, città e percezione trasformano il presente; poi la realtà diventa costruzione, intensità e simbolo.",modules:[
    ["13","Chi merita di essere rappresentato?","Realismo","Il lavoro entra nel quadro","13-realismo"],["14","Quando la realtà diventa un istante","Impressionismo","Luce, metropoli, percezione","14-impressionismo"],["15","La realtà non basta più","Postimpressionismo","Oltre ciò che l’occhio registra","15-postimpressionismo"]]},
  {roman:"IV",title:"Frammentare il reale",years:"1900 — 1945",color:"charcoal",thesis:"L’Occidente perde la fiducia in un mondo unico e ordinato. L’arte non ricompone la frattura: la rende visibile.",modules:[
    ["16","Il mondo dentro di noi","Espressionismo","Alienazione e crisi dell’io","16-espressionismo"],["17","La fine dell’unico punto di vista","Cubismo","Moltiplicare la realtà","17-cubismo"],["18","La velocità diventa forma","Futurismo","Macchina, città, accelerazione","18-futurismo"],["19","Contro la ragione che ha prodotto la guerra","Dada e Surrealismo","Caso, inconscio, provocazione","19-dada-surrealismo"],["20","Quando il potere occupa le immagini","Arte e totalitarismi","Propaganda, consenso, controllo","20-arte-totalitarismi"]]},
  {roman:"V",title:"Le immagini che ci abitano",years:"1945 — presente",color:"electric",thesis:"Dopo la catastrofe, l’opera perde confini e materia. Immagini, merci, corpi e algoritmi competono per definire il reale.",modules:[
    ["21","Dopo l’irrappresentabile","Dopoguerra","Materia, gesto, memoria","21-dopoguerra"],["22","Quando l’immagine diventa merce","Pop Art","Consumo, pubblicità, ripetizione","22-pop-art"],["23","L’opera può scomparire","Arte concettuale e performance","Idea, corpo, azione","23-arte-concettuale-performance"],["24","Chi decide che cosa è arte?","Arte contemporanea","Mercato, identità, ambiente","24-arte-contemporanea"],["25","Chi guarda attraverso l’algoritmo?","Arte digitale e IA","Autore, originale, futuro","25-arte-digitale-ia"]]}
];

const liveModules = {
  "01": { href: "PWA/01-prima-dell-arte/index.html", label: "modulo pubblicato" },
  "02": { href: "PWA/02-mesopotamia-egitto/index.html", label: "modulo pubblicato" },
  "03": { href: "PWA/03-grecia/index.html", label: "modulo pubblicato" },
  "04": { href: "PWA/04-ellenismo-roma/index.html", label: "modulo pubblicato" },
  "05": { href: "PWA/05-cristianesimo-medioevo/index.html", label: "modulo pubblicato" },
  "06": { href: "PWA/06-romanico-gotico/index.html", label: "modulo pubblicato" },
  "07": { href: "PWA/07-giotto/index.html", label: "modulo pubblicato" },
  "08": { href: "PWA/08-rinascimento/index.html", label: "modulo pubblicato" },
  "09": { href: "PWA/09-manierismo/index.html", label: "modulo pubblicato" },
  "10": { href: "PWA/10-caravaggio/index.html", label: "modulo pubblicato" },
  "11": { href: "PWA/11-neoclassicismo/index.html", label: "modulo pubblicato" },
  "12": { href: "PWA/12-romanticismo/index.html", label: "modulo pubblicato" },
  "13": { href: "PWA/13-realismo/index.html", label: "modulo pubblicato" },
  "14": { href: "PWA/14-impressionismo/index.html", label: "modulo pubblicato" },
  "15": { href: "PWA/15-postimpressionismo/index.html", label: "modulo pubblicato" },
  "16": { href: "PWA/16-espressionismo/index.html", label: "modulo pubblicato" },
  "17": { href: "PWA/17-cubismo/index.html", label: "modulo pubblicato" },
  "18": { href: "PWA/18-futurismo/index.html", label: "modulo pubblicato" },
  "19": { href: "PWA/19-dada-surrealismo/index.html", label: "modulo pubblicato" },
  "20": { href: "PWA/20-arte-totalitarismi/index.html", label: "modulo pubblicato" },
  "21": { href: "PWA/21-dopoguerra/index.html", label: "modulo pubblicato" },
  "22": { href: "PWA/22-pop-art/index.html", label: "nuovo modulo" }
};

document.querySelector("#galleries").innerHTML = galleries.map(g => `<article class="gallery ${g.color}"><div class="gallery-intro"><p class="roman">${g.roman}</p><div><p class="years">${g.years}</p><h3>${g.title}</h3><p class="thesis">${g.thesis}</p></div></div><ol class="module-list">${g.modules.map(([n,t,p,q,path]) => liveModules[n] ? `<li id="m${n}" class="module-live" data-label="${liveModules[n].label}"><a href="${liveModules[n].href}"><span class="module-number">${n}</span><div class="module-title"><strong>${t}</strong><span>${p}</span></div><p>${q}</p><span class="module-state">entra nella PWA</span><span class="module-arrow" aria-hidden="true">↗</span></a></li>` : `<li id="m${n}" data-future-path="${path}/"><span class="module-number">${n}</span><div class="module-title"><strong>${t}</strong><span>${p}</span></div><p>${q}</p><span class="module-state">spazio predisposto</span><span class="module-arrow" aria-hidden="true">↗</span></li>`).join("")}</ol></article>`).join("");
