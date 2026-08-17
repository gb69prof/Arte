const CACHE = "storia-sguardo-02-v1";
const CACHE_PREFIX = "storia-sguardo-02-";
const ASSETS = [
  "./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest",
  "./assets/icons/icon.svg", "./assets/icons/icon-192.png", "./assets/icons/icon-512.png",
  "./assets/images/stendardo-ur.webp", "./assets/images/stele-hammurabi.webp",
  "./assets/images/tavoletta-narmer.webp", "./assets/images/hatshepsut.webp",
  "./assets/images/giza.webp", "./assets/images/sennedjem-iaru.webp"
];

self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  if(event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if(response.ok){ const copy=response.clone(); caches.open(CACHE).then(cache => cache.put(event.request,copy)); }
    return response;
  }).catch(() => event.request.mode === "navigate" ? caches.match("./index.html") : Response.error())));
});
