/* ============================================================
   KZ TRAVELER — glue script for /traveler.html
   - Loads kz-traveler-modules.css and kz-near-me.css if missing
   - Listens for kz:pos and stores city/country globally
   ============================================================ */
(function(){
  'use strict';

  function ensureCss(href){
    if (document.querySelector(`link[href="${href}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }

  ensureCss('kz-near-me.css');
  ensureCss('kz-traveler-modules.css');

  document.addEventListener('kz:pos', async (e) => {
    window.__kz_pos = e.detail;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.detail.lat}&lon=${e.detail.lng}&accept-language=he`);
      const j = await r.json();
      window.__kz_city    = j.address?.city || j.address?.town || j.address?.village || j.address?.state || '';
      window.__kz_country = (j.address?.country_code || '').toUpperCase();
    } catch {}
  });
})();

// Register the tzaddik tour module too (loaded by traveler.html)
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('script[src="kz-tzaddik-tour.js"]')){
    const s = document.createElement('script');
    s.src = 'kz-tzaddik-tour.js';
    s.defer = true;
    document.body.appendChild(s);
  }
});
