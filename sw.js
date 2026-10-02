// JuntechOS - service worker
// Guarda la pantalla de la app para que abra aunque no haya internet. NUNCA guarda datos de Google:
// solo archivos de este mismo sitio. Primero intenta la red (así siempre ves la última versión) y
// recién si no hay conexión usa lo guardado.
const CACHE = 'juntechos-v1';
const BASICOS = ['./', './index.html', './manifest.json', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICOS).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});
