const V='npp-v1', FONTES='npp-fontes-v1';
const NUCLEO=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(NUCLEO)).then(()=>self.skipWaiting())) });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==FONTES).map(k=>caches.delete(k)))).then(()=>self.clients.claim())) });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return; const u=new URL(r.url);
  if(u.origin===location.origin){
    if(r.mode==='navigate'){ // rede primeiro: atualizações chegam sozinhas; offline usa a cópia
      e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(V).then(c=>c.put('./index.html',cp)); return res }).catch(()=>caches.match('./index.html'))); return }
    e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>{ const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp)); return res }))); return }
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(FONTES).then(c=>c.match(r).then(h=>{ const rede=fetch(r).then(res=>{ if(res.ok)c.put(r,res.clone()); return res }).catch(()=>h); return h||rede }))); return }
  // Google (login, Drive, Sheets): sempre rede, nada guardado
});
