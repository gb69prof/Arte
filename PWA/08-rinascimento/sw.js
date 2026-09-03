"use strict";

const CACHE = "storia-sguardo-08-v1";
const CACHE_PREFIX = "storia-sguardo-08-";
const CORE = [
  "../../pwa-common/gbprof-accessibility.css?v=1",
  "../../pwa-common/gbprof-accessibility.js?v=1",
  "../../privacy.html",
  "../../accessibilita.html",
  "./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./sw.js",
  "./assets/icons/icon.svg", "./assets/icons/icon-192.png", "./assets/icons/icon-512.png",
  "./assets/images/opening-architecture.webp", "./assets/images/giotto-memory.webp"
];
const OPTIONAL = [
  "./assets/images/florence-baptistery.webp", "./assets/images/innocenti-loggia.webp",
  "./assets/images/alberti-facade.webp", "./assets/images/donatello-feast.webp",
  "./assets/images/uccello-san-romano.webp", "./assets/images/piero-flagellation.webp",
  "./assets/images/urbino-diptych.webp", "./assets/images/ideal-city.webp"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(async cache => {
    await cache.addAll(CORE);
    await Promise.allSettled(OPTIONAL.map(asset => cache.add(asset)));
  }).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.includes("/PWA/08-rinascimento/")) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => event.request.mode === "navigate" ? caches.match("./index.html") : Response.error())));
});
