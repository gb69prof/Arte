"use strict";
const CACHE = "storia-sguardo-14-v1";
const PREFIX = "storia-sguardo-14-";
const PRECACHE = [
  "./", "./index.html", "./assets/css/style.css", "./assets/js/app.js", "./manifest.webmanifest",
  "./assets/icons/icon-192.png", "./assets/icons/icon-512.png",
  "./assets/images/impression-sunrise.webp", "./assets/images/daguerre-boulevard.webp",
  "./assets/images/boulevard-capucines.webp", "./assets/images/gare-saint-lazare.webp",
  "./assets/images/moulin-galette.webp", "./assets/images/morisot-cradle.webp",
  "./assets/images/cassatt-in-the-loge.webp", "./assets/images/stacks-summer.webp",
  "./assets/images/stacks-autumn.webp", "./assets/images/stacks-snow.webp"
];
self.addEventListener("install", event => event.waitUntil(
  caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
));
self.addEventListener("activate", event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put("./index.html", response.clone()));
      return response;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});
