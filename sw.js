const CACHE = 'procida-cache-v3';
const ASSETS = [
  './',
  './index.html?v=3',
  './styles.css?v=3',
  './manifest.json',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Network-first for HTML to ensure fresh updates
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(url.pathname + url.search, copy));
        return res;
      }).catch(() => caches.match(url.pathname + url.search) || caches.match('./index.html?v=3'))
    );
    return;
  }

  // Cache-first for others
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