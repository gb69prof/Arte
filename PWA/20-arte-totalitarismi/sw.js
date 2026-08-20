"use strict";
const CACHE = "storia-sguardo-20-v1";
const PREFIX = "storia-sguardo-20-";
const SHELL = [
  "./", "./index.html", "./README.md", "./SOURCES.md", "./manifest.webmanifest", "./sw.js",
  "./assets/css/style.css", "./assets/js/app.js",
  "./assets/icons/icon.svg", "./assets/icons/icon-192.png", "./assets/icons/icon-512.png",
  "./assets/images/mukhina.webp", "./assets/images/terragni.webp", "./assets/images/gdk.webp",
  "./assets/images/entartete.webp", "./assets/images/lissitzky.webp"
];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.includes("/PWA/20-arte-totalitarismi/")) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      if (response.ok && (url.pathname.endsWith("/") || url.pathname.endsWith("/index.html"))) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put("./index.html", copy));
      }
      return response;
    }).catch(() => caches.match(request).then(hit => hit || caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(request).then(hit => hit || fetch(request).then(response => { if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(request, copy)); } return response; })));
});
