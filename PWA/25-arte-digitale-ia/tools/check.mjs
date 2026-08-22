import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root=path.resolve(import.meta.dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const failures=[];
const assert=(condition,message)=>{if(!condition)failures.push(message)};

const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
const duplicateIds=ids.filter((id,index)=>ids.indexOf(id)!==index);
assert(duplicateIds.length===0,`ID duplicati: ${[...new Set(duplicateIds)].join(", ")}`);

for(const target of [...html.matchAll(/\sfor="([^"]+)"/g)].map(match=>match[1])){
  assert(ids.includes(target),`label for senza destinazione: ${target}`);
}
for(const target of [...html.matchAll(/href="#([^"]+)"/g)].map(match=>match[1])){
  assert(ids.includes(target),`ancora interna senza destinazione: #${target}`);
}

const sections=[...html.matchAll(/data-section="(\d+)"/g)].map(match=>Number(match[1]));
assert(JSON.stringify([...new Set(sections)].sort((a,b)=>a-b))===JSON.stringify([...Array(13)].map((_,i)=>i+1)),"Le sezioni numerate non sono esattamente 1–13");

for(const match of html.matchAll(/<(?:img|source)\b[^>]*>/g)){
  if(match[0].startsWith("<img"))assert(/\salt="[^"]*"/.test(match[0]),`immagine senza alt: ${match[0].slice(0,80)}`);
}

const manifest=JSON.parse(fs.readFileSync(path.join(root,"manifest.webmanifest"),"utf8"));
assert(manifest.icons?.some(icon=>icon.sizes==="192x192"),"Icona manifest 192x192 mancante");
assert(manifest.icons?.some(icon=>icon.sizes==="512x512"),"Icona manifest 512x512 mancante");

const dataContext={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,"assets/js/data.js"),"utf8"),dataContext);
const data=dataContext.window.M25_DATA;
assert(data.timeline.length===12,`Cronologia: attesi 12 nodi, trovati ${data.timeline.length}`);
assert(data.cases.length>=8,`Casi documentati insufficienti: ${data.cases.length}`);
assert(data.quizzes.length===16,`Quiz: attesi 16 nuclei, trovati ${data.quizzes.length}`);
assert(new Set(data.quizzes.map(item=>item.id)).size===16,"ID dei quiz non univoci");
for(const item of data.quizzes){
  assert(ids.includes(item.section),`Quiz ${item.id}: sezione #${item.section} inesistente`);
  assert(item.recovery?.q&&item.recovery.q!==item.q,`Quiz ${item.id}: recupero non distinto`);
  assert(item.lesson&&item.explain,`Quiz ${item.id}: spiegazione o microlezione mancante`);
}

const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
assert(sw.includes('"storia-sguardo-25-v1"'),"Nome cache non conforme");
assert(sw.includes('"storia-sguardo-25-"'),"Prefisso cache non conforme");
const state=fs.readFileSync(path.join(root,"assets/js/state.js"),"utf8");
assert(state.includes('"storia-sguardo-25-state"'),"Chiave di stato non conforme");
assert(!/storia-sguardo-(?!25)/.test(`${sw}\n${state}`),"Riferimento a stato o cache di un altro modulo");

const localRefs=[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(match=>match[1]).filter(ref=>!ref.startsWith("#")&&!ref.startsWith("http")&&!ref.startsWith("mailto:")&&!ref.startsWith("data:"));
for(const ref of localRefs){
  const target=path.resolve(root,ref.split(/[?#]/)[0]);
  assert(fs.existsSync(target),`Risorsa locale mancante: ${ref}`);
}

const interactionFamilies=[...html.matchAll(/\bid="(timeline|ruleStage|materialLayers|systemParts|caseDeck|networkKinds|conservationChoices|rankingList|datasetItems|ambiguityCards|missingChoices|generatorStage|authorshipActors|originalClassifier|feedList|responsibilityAreas|provenanceSteps|powerTable|atlasGrid|quizArea)"/g)].length;
assert(interactionFamilies===20,`Famiglie interattive principali: attese 20, trovate ${interactionFamilies}`);
assert(!/modulo\s*26|Modulo\s*26|Soglia\s*26/.test(html),"Il modulo 25 non deve creare o annunciare il modulo 26");

if(failures.length){
  console.error(failures.map(item=>`FAIL · ${item}`).join("\n"));
  process.exit(1);
}
console.log(`OK · ${ids.length} ID univoci · 13 sezioni · ${data.timeline.length} nodi cronologici · ${data.cases.length} casi · ${data.quizzes.length} quiz · ${interactionFamilies} famiglie interattive principali`);
