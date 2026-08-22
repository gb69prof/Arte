(function(){
  "use strict";
  const KEY="storia-sguardo-25-state";
  const VERSION=1;
  const atlasAllowed=["regola","casualità","dataset","etichetta","lavoro","codice","interfaccia","infrastruttura","versione","provenienza","accesso","responsabilità"];
  const defaults=()=>({
    version:VERSION,visited:[],actions:{},notes:{initial:"",final:""},
    initial:{kind:"",maker:"",responsible:""},rule:{},layers:[],systemParts:[],networkKind:"",
    conservation:[],ranking:{},dataset:{items:[],labels:{},categories:["ritmico","stabile"]},missing:[],
    generator:{seed:25,prompt:"equilibrio",density:5,variation:35,last:""},chain:[],
    authorship:{},originalKind:"",feed:{},responsible:{},power:{},atlas:[],mastery:{},quizIndex:0
  });
  const object=value=>value&&typeof value==="object"&&!Array.isArray(value)?value:{};
  function normalize(raw){
    const base=defaults(),src=object(raw);
    const state={...base,...src};
    state.notes={...base.notes,...object(src.notes)};
    state.initial={...base.initial,...object(src.initial)};
    state.rule={...base.rule,...object(src.rule)};
    state.ranking={...base.ranking,...object(src.ranking)};
    state.dataset={...base.dataset,...object(src.dataset)};
    state.dataset.items=Array.isArray(state.dataset.items)?state.dataset.items.slice(0,12):[];
    state.dataset.labels=object(state.dataset.labels);
    state.dataset.categories=Array.isArray(state.dataset.categories)&&state.dataset.categories.length?state.dataset.categories.slice(0,4):base.dataset.categories;
    state.generator={...base.generator,...object(src.generator)};
    state.authorship=object(src.authorship);state.responsible=object(src.responsible);state.power=object(src.power);
    state.actions=object(src.actions);state.mastery=object(src.mastery);
    for(const key of ["visited","layers","systemParts","conservation","missing","chain","atlas"]){state[key]=Array.isArray(src[key])?src[key]:base[key]}
    state.atlas=state.atlas.filter(x=>atlasAllowed.includes(x));
    state.version=VERSION;
    state.quizIndex=Number.isInteger(src.quizIndex)?Math.max(0,Math.min(15,src.quizIndex)):0;
    return state;
  }
  let available=true,state;
  try{state=normalize(JSON.parse(localStorage.getItem(KEY)||"null"))}catch(error){state=defaults();available=false}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));available=true;return true}catch(error){available=false;return false}}
  function act(name,value=true){state.actions[name]={value,at:Date.now()};save();document.dispatchEvent(new CustomEvent("m25:state"))}
  function toggle(array,key){const list=state[array];state[array]=list.includes(key)?list.filter(x=>x!==key):[...list,key];save();return state[array]}
  function reset(){state=defaults();try{localStorage.removeItem(KEY);available=true}catch(error){available=false}return state}
  window.M25_STORE={KEY,VERSION,get state(){return state},get available(){return available},save,act,toggle,reset,atlasAllowed};
})();
