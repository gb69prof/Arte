const CACHE = "storia-sguardo-09-v1";
const CACHE_PREFIX = "storia-sguardo-09-";
const ASSETS = [
  "../../pwa-common/gbprof-accessibility.css?v=1",
  "../../pwa-common/gbprof-accessibility.js?v=1",
  "../../privacy.html",
  "../../accessibilita.html",
  "./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./sw.js",
  "./assets/icons/icon-192.png", "./assets/icons/icon-512.png",
  "./assets/images/pontormo-deposizione.webp",
  "./assets/images/piero-flagellazione.webp",
  "./assets/images/rosso-deposizione.webp",
  "./assets/images/parmigianino-madonna.webp",
  "./assets/images/giambologna-sabina.webp",
  "./assets/images/palazzo-te-cortile.webp",
  "./assets/images/piero-urbino.webp",
  "./assets/images/bronzino-ritratto.webp",
  "./assets/images/fontainebleau-galleria.webp",
  "./assets/images/caravaggio-vocazione.webp"
];
self.addEventListener("install", event => event.waitUntil(
  caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
));
self.addEventListener("activate", event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => event.request.mode === "navigate" ? caches.match("./index.html") : Response.error())));
});
