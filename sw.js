// 極簡 service worker：讓 Chrome 認定這是可安裝的 App，並在沒網路時還能開啟畫面。
// 網頁本身「先連網、失敗才用快取」，所以我更新網頁後，你下次打開就是新版。
// Google API、地圖圖磚都是跨網域請求，這裡不處理，一律直接走網路。
const CACHE = "free-parking-shell-v1";
const SHELL = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./")))
  );
});
