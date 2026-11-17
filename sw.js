// Service worker: permite instalar la app y abrirla aunque no haya internet.
// Los precios NO se guardan aquí (los maneja la página con su copia local).
const CACHE = "lector-edumerca-v57";
const ARCHIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icono-192.png", "./icono-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // Apps Script, fuentes, librería: directo a internet
  // Primero internet (así siempre tomas la versión nueva del HTML); si no hay, la copia guardada
  e.respondWith(
    fetch(e.request).then(r => {
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copia));
      return r;
    }).catch(() => caches.match(e.request))
  );
});

// Tocar el aviso de una transferencia (celulares): trae la app al frente y abre Transferencias
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type: "window", includeUncontrolled: true}).then(cs => {
    if (cs.length) { cs[0].postMessage("abrirTransf"); return cs[0].focus(); }
    return self.clients.openWindow("./");
  }));
});
