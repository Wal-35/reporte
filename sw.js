// ILTEC — Service Worker v1
const CACHE = 'iltec-plataforma-v1';
const URLS  = ['/orden_produccion/plataforma.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(URLS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url=e.request.url;
  if(url.includes('firebase')||url.includes('googleapis')||
     url.includes('gstatic')||url.includes('firebasestorage')) return;
  e.respondWith(caches.match(e.request).then(cached=>{
    if(cached){
      fetch(e.request).then(res=>{
        if(res&&res.status===200) caches.open(CACHE).then(c=>c.put(e.request,res));
      }).catch(()=>{});
      return cached;
    }
    return fetch(e.request).then(res=>{
      if(res&&res.status===200){
        const cl=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,cl));
      }
      return res;
    }).catch(()=>caches.match('/orden_produccion/plataforma.html'));
  }));
});
