/* Service Worker — Merkaz HaTfila
   Strategy:
     - Cache-first for static assets (CSS/JS/SVG/font) with stale-while-revalidate.
     - Network-first for HTML pages with offline fallback.
     - Versioned cache; bump the VERSION constant after meaningful changes.
   This worker is purely additive and safe to roll back by unregistering.
*/
const VERSION = 'v1.0.0';
const STATIC_CACHE = `pc-static-${VERSION}`;
const PAGE_CACHE   = `pc-pages-${VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/privacy.html',
  '/terms.html',
  '/accessibility.html',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => {/* tolerate missing optional assets */})
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.endsWith(VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

function isPageRequest(req) {
  return req.mode === 'navigate' ||
    (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'));
}

function isStaticRequest(url) {
  return /\.(css|js|svg|png|jpg|jpeg|webp|woff2?|ttf|ico|webmanifest)(\?.*)?$/i.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept third-party requests, never intercept Netlify Functions.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/.netlify/functions/')) return;

  if (isPageRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGE_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  if (isStaticRequest(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
