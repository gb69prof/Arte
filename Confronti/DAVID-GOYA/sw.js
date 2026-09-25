const CACHE_PREFIX='gbprof-david-goya-';
const CACHE=CACHE_PREFIX+'v2-lesson';
const ASSETS=['./','./index.html','./styles.css','./app.js','./content.js','./videos.js','./manifest.webmanifest','./assets/images/david.jpg','./assets/images/goya.jpg','./assets/icons/icon.svg','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/video/video-1.vtt','./assets/video/video-2.vtt','./assets/video/video-3.vtt','./assets/video/clip-1.vtt','./assets/video/clip-2.vtt','./assets/video/poster-1.jpg','./assets/video/poster-2.jpg','./assets/video/poster-3.jpg','../../pwa-common/gbprof-accessibility.css?v=1','../../pwa-common/gbprof-accessibility.js?v=1','../../privacy.html','../../accessibilita.html'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.endsWith('.mp4')||event.request.headers.has('range'))return;
 const allowed=ASSETS.some(p=>new URL(p,self.location.href).href===url.href);
 if(!allowed&&!url.href.startsWith(self.registration.scope))return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  const cached=await cache.match(event.request);if(cached)return cached;
  try{return await fetch(event.request);}catch{if(event.request.mode==='navigate'&&url.href.startsWith(self.registration.scope))return cache.match('./index.html');return Response.error();}
 }));
});
