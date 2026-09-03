"use strict";

const CACHE = "storia-sguardo-19-v1";
const PREFIX = "storia-sguardo-19-";
const APP_SHELL = [
  "../../pwa-common/gbprof-accessibility.css?v=1",
  "../../pwa-common/gbprof-accessibility.js?v=1",
  "../../privacy.html",
  "../../accessibilita.html",
  "./", "./index.html", "./manifest.webmanifest", "./README.md", "./SOURCES.md",
  "./assets/css/style.css", "./assets/js/app.js", "./assets/icons/icon.svg", "./assets/icons/icon-192.png", "./assets/icons/icon-512.png",
  "./assets/images/picabia.webp", "./assets/images/unique-forms.webp", "./assets/images/ball.webp", "./assets/images/dada-fair.webp",
  "./assets/images/soiree.webp", "./assets/images/hoch.webp", "./assets/images/baargeld.webp", "./assets/images/tanguy.webp", "./assets/images/cahun.webp"
];

self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.includes("/PWA/19-dada-surrealismo/")) return;
  if (event.request.mode === "navigate") { event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put("./index.html", copy)); return response; }).catch(() => caches.match("./index.html"))); return; }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); } return response; })));
});
