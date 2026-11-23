// 離線快取：同網域檔案 cache-first；影片（YouTube）同字型照常上網
const VERSION = "flora-v3";
const SHELL = ["./","index.html","css/app.css","js/app.js","js/art.js","data/flowers.js","data/course.js","data/wraps.js","data/videos.js","data/credits.js","data/images.js","manifest.webmanifest","img/icons/icon-180.png","img/icons/icon-192.png","img/icons/icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(async c => {
    await c.addAll(SHELL);
    // 預載所有花材、工具相（列表由 data/images.json 提供）
    try { const list = await (await fetch("data/images.json")).json(); await Promise.allSettled(list.map(u => c.add(u))); } catch(err) {}
  }).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // 頁面同資料：網絡優先（有更新即用），斷網用快取
  if (e.request.mode === "navigate" || /\.(js|css|json|webmanifest)$/.test(url.pathname)) {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request, { ignoreSearch:true }).then(r => r || caches.match("index.html"))));
    return;
  }
  // 相片：快取優先
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res; })));
});
