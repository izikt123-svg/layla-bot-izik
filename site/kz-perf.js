/* ============================================================
   KZ PERF — runtime perf wins for Lighthouse
   1. Lazy-load all images that don't have loading="lazy".
   2. Decode async + width/height inference where possible.
   3. Defer offscreen iframes until they enter viewport.
   4. Idle-prefetch likely next pages on hover/touchstart.
   5. Strip Hebrew nikkud from very long texts on mobile.
   ============================================================ */
(function(){
  'use strict';
  if (window.__kz_perf_done) return;
  window.__kz_perf_done = true;

  /* ─── 1. Lazy images ─── */
  function lazyImages(){
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    });
  }

  /* ─── 2. Lazy iframes (Kotel cam, hero video) ─── */
  function lazyIframes(){
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const f = e.target;
        if (f.dataset.src && !f.src){ f.src = f.dataset.src; }
        f.setAttribute('loading', 'lazy');
        io.unobserve(f);
      });
    }, { rootMargin: '300px' });
    document.querySelectorAll('iframe[data-src]').forEach(f => io.observe(f));
  }

  /* ─── 3. Idle-prefetch likely next pages ─── */
  function prefetchOnHover(){
    const seen = new Set();
    function add(url){
      if (!url || seen.has(url)) return;
      seen.add(url);
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'document';
      document.head.appendChild(link);
    }
    document.addEventListener('mouseover', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      try {
        const u = new URL(a.href, location.href);
        if (u.origin !== location.origin) return;
        if (u.pathname.endsWith('.html') || u.pathname === '/') add(u.pathname);
      } catch {}
    }, { passive: true });
    document.addEventListener('touchstart', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      try {
        const u = new URL(a.href, location.href);
        if (u.origin === location.origin) add(u.pathname);
      } catch {}
    }, { passive: true });
  }

  /* ─── 4. Reduce work on small devices ─── */
  function lightenForMobile(){
    if (window.innerWidth > 720) return;
    // Reduce particles / animations
    document.documentElement.dataset.lite = '1';
    // Drop heavy hero animations on extra-small viewports
    if (window.innerWidth < 480){
      document.querySelectorAll('.kz-letter-field, .kz-floating-star, .kz-embers').forEach(el => el.remove());
    }
  }

  /* ─── 5. Defer non-critical work via requestIdleCallback ─── */
  const ric = window.requestIdleCallback || function(cb){ return setTimeout(cb, 1); };

  function start(){
    lazyImages();
    lazyIframes();
    ric(prefetchOnHover);
    ric(lightenForMobile);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
