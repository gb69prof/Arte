"use strict";
const CACHE = "storia-sguardo-15-v1";
const PREFIX = "storia-sguardo-15-";
const PRECACHE = [
  "./", "./index.html", "./SOURCES.md", "./assets/css/style.css", "./assets/js/app.js", "./manifest.webmanifest",
  "./assets/icons/icon-192.png", "./assets/icons/icon-512.png",
  "./assets/images/basket.webp", "./assets/images/grande-jatte.webp", "./assets/images/grande-jatte-study.webp",
  "./assets/images/bedroom.webp", "./assets/images/vision-sermon.webp", "./assets/images/where-from.webp",
  "./assets/images/monet-stacks.webp", "./assets/images/courbet-funerale.webp"
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
