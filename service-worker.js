const CACHE = "lager-app-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles/style.css",
  "./src/app.js",
  "./src/storage.js",
  "./manifest.webmanifest",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(all =>
      Promise.all(all.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(res =>
      res || fetch(e.request).catch(() => caches.match("./index.html"))
    )
  );
});
