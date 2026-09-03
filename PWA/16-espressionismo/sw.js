const CACHE = "storia-sguardo-16-v1";
const APP_SHELL = [
  "../../pwa-common/gbprof-accessibility.css?v=1",
  "../../pwa-common/gbprof-accessibility.js?v=1",
  "../../privacy.html",
  "../../accessibilita.html",
  "./","./index.html","./manifest.webmanifest","./README.md","./SOURCES.md",
  "./assets/css/style.css","./assets/js/app.js",
  "./assets/icons/icon.svg","./assets/icons/icon-192.png","./assets/icons/icon-512.png",
  "./assets/images/scream.webp","./assets/images/bedroom.webp","./assets/images/kirchner.webp",
  "./assets/images/bridge-program.webp","./assets/images/kandinsky.webp","./assets/images/schiele.webp",
  "./assets/images/werefkin.webp","./assets/images/kollwitz.webp"
];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("storia-sguardo-16-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => { const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response; }).catch(() => caches.match(event.request).then(hit=>hit||caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => { if (response.ok) { const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)); } return response; })));
});
