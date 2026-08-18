"use strict";
const CACHE="storia-sguardo-13-v2";
const PRECACHE=[
  "./","./index.html","./styles.css","./app.js","./manifest.webmanifest",
  "./assets/icons/icon-192.png","./assets/icons/icon-512.png",
  "./assets/images/millet-spigolatrici.webp","./assets/images/delacroix-liberta.webp",
  "./assets/images/courbet-funerale.webp","./assets/images/courbet-spaccapietre.webp",
  "./assets/images/daumier-terza-classe.webp","./assets/images/daguerre-boulevard.webp",
  "./assets/images/brown-work.webp","./assets/images/bonheur-aratura.webp"
];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("storia-sguardo-13-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
  if(event.request.mode==="navigate"){
    event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put("./index.html",copy));return response}).catch(()=>caches.match("./index.html")));return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response})));
});
