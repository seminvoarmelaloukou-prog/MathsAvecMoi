/* Campus Flex – service worker
   Principe : le réseau passe toujours en premier (tes mises à jour GitHub
   s'affichent tout de suite). Le cache ne sert qu'en secours quand il n'y a
   plus de connexion. Aucune donnée Firebase n'est mise en cache. */
const CACHE = "cf-v1";
const A_PRECHARGER = ["index.html", "offline.html", "manifest.webmanifest", "pwa-192.png", "pwa-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.allSettled(A_PRECHARGER.map(function (u) { return cache.add(u); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (noms) {
      return Promise.all(noms.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  const req = e.request;
  if (req.method !== "GET") { return; }

  const url = new URL(req.url);
  if (url.origin !== location.origin) { return; } // Firebase, Google, YouTube… : jamais touchés

  const accueil = new URL("./", location).pathname;
  const estAccueil = url.pathname === accueil || url.pathname === accueil + "index.html";
  const nom = url.pathname.replace(accueil, "");

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res.ok && estAccueil) {
          const copie = res.clone();
          caches.open(CACHE).then(function (c) { c.put("index.html", copie); });
        }
        return res;
      }).catch(function () {
        return (estAccueil ? caches.match("index.html") : Promise.resolve(null)).then(function (r) {
          return r || caches.match("offline.html");
        });
      })
    );
    return;
  }

  e.respondWith(
    fetch(req).then(function (res) {
      if (res.ok && A_PRECHARGER.indexOf(nom) !== -1) {
        const copie = res.clone();
        caches.open(CACHE).then(function (c) { c.put(nom, copie); });
      }
      return res;
    }).catch(function () {
      return caches.match(nom || req);
    })
  );
});
