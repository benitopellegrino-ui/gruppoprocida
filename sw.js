const CACHE='gds-cache-v12';
const ASSETS=['./','./index.html?v=v12','./styles.css?v=v12','./manifest.json','./icon-192.png','./icon-256.png','./icon-384.png','./icon-512.png','./icon-512-maskable.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 const req=e.request, acc=req.headers.get('accept')||''; const url=new URL(req.url);
 if(acc.includes('text/html')){
  e.respondWith(fetch(req).then(res=>{const copy=res.clone(); caches.open(CACHE).then(c=>c.put(url.pathname+url.search,copy)); return res;})
    .catch(()=>caches.match(url.pathname+url.search)||caches.match('./index.html?v=v12'))); return;
 }
 e.respondWith(caches.match(url.pathname+url.search).then(c=>c||fetch(req).then(res=>{const copy=res.clone(); caches.open(CACHE).then(ca=>ca.put(url.pathname+url.search,copy)); return res;})));
});