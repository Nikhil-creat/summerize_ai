const C='summerize-v22';self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','css/style.css','js/app.js','js/extras.js','manifest.json','icon.svg'])))});
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(fetch(e.request).then(r=>{const k=r.clone();caches.open(C).then(c=>c.put(e.request,k));return r}).catch(()=>caches.match(e.request)))});
