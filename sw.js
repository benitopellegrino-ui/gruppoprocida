const CACHE = 'gds-cache-v4';
const ASSETS = [
  './',
  './index.html?v=4',
  './styles.css?v=4',
  './manifest.json',
  './icon-192.png',
  './icon-256.png',
  './icon-384.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const accept = req.headers.get('accept') || '';
  const url = new URL(req.url);
  if (accept.includes('text/html')) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(url.pathname + url.search, copy));
        return res;
      }).catch(() => caches.match(url.pathname + url.search) || caches.match('./index.html?v=4'))
    );
    return;
  }
  event.respondWith(
    caches.match(url.pathname + url.search).then(cached => {
      return cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(url.pathname + url.search, copy));
        return res;
      });
    })
  );
});