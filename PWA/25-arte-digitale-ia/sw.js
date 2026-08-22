"use strict";
const CACHE="storia-sguardo-25-v1";
const PREFIX="storia-sguardo-25-";
const SHELL=[
  "./","./index.html","./manifest.webmanifest",
  "./assets/css/style.css","./assets/js/data.js","./assets/js/state.js","./assets/js/app.js",
  "./assets/icons/icon.svg","./assets/icons/icon-192.png","./assets/icons/icon-512.png",
  "./assets/images/black-marble-2016.webp"
];
self.addEventListener("install",event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())
));
self.addEventListener("activate",event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
    if(response&&response.ok&&response.type==="basic"){
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(request,copy));
    }
    return response;
  }).catch(()=>request.mode==="navigate"?caches.match("./index.html"):cached)));
});
