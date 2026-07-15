/* GoTours Navigator v26 Keyless — Service Worker */
const APP_CACHE = 'gt-app-v26.0-keyless';
const TILE_CACHE = 'gt-tiles';
const RUNTIME_CACHE = 'gt-runtime-v26.0-keyless';

const SHELL = [
  './', './index.html', './manifest.json', './README.md',
  './icon-192.png', './icon-512.png', './privacy-policy.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    // כשל של CDN חיצוני לא יפיל את התקנת כל האפליקציה.
    await Promise.allSettled(SHELL.map(url => cache.add(new Request(url, { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([APP_CACHE, TILE_CACHE, RUNTIME_CACHE]);
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => !keep.has(key)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

const isTile = url =>
  url.includes('tile.openstreetmap.org') || url.includes('tile.opentopomap.org') ||
  url.includes('arcgisonline.com') || url.includes('israelhiking.osm.org.il') ||
  url.includes('waymarkedtrails.org');

const isAppShell = (request, url) =>
  request.mode === 'navigate' || /\/(index\.html|privacy-policy\.html|manifest\.json)$/.test(new URL(url).pathname);

async function networkFirst(request, cacheName, timeoutMs = 4500) {
  const cache = await caches.open(cacheName);
  const timeout = new Promise(resolve => setTimeout(async () => resolve(await cache.match(request, { ignoreSearch: true })), timeoutMs));
  try {
    const response = await Promise.race([fetch(request), timeout]);
    if (response) {
      if (response.ok) cache.put(request, response.clone()).catch(() => {});
      return response;
    }
  } catch {}
  return (await cache.match(request, { ignoreSearch: true })) ||
    (await cache.match('./index.html')) ||
    new Response('GoTours Navigator is offline', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
  } catch {
    return new Response('', { status: 404 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const hit = await cache.match(request);
  const network = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
  }).catch(() => hit);
  return hit || network || new Response('', { status: 503 });
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = request.url;

  if (isTile(url)) {
    event.respondWith(cacheFirst(request, TILE_CACHE));
    return;
  }

  if (isAppShell(request, url)) {
    event.respondWith(networkFirst(request, APP_CACHE));
    return;
  }

  if (url.includes('unpkg.com') || url.includes('fonts.googleapis.com') ||
      url.includes('fonts.gstatic.com')) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
