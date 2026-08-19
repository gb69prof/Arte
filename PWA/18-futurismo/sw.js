"use strict";

const CACHE = "storia-sguardo-18-v1";
const PREFIX = "storia-sguardo-18-";
const APP_SHELL = [
  "./",
  "./index.html",
  "./README.md",
  "./SOURCES.md",
  "./manifest.webmanifest",
  "./assets/css/style.css",
  "./assets/js/app.js",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/images/unique-forms.webp",
  "./assets/images/bottle-space.webp",
  "./assets/images/farewells-drawing.webp",
  "./assets/images/industrial-plants.webp",
  "./assets/images/muybridge.webp",
  "./assets/images/manifesto-figaro.webp",
  "./assets/images/intonarumori.webp",
  "./assets/images/juan-legua.webp",
  "./assets/images/cezanne-basket.webp",
  "./assets/images/munch-scream.webp",
  "./assets/images/kirchner.webp",
  "./assets/images/kandinsky.webp"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request).then(hit => hit || caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => { if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); } return response; })));
});
