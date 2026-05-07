/* ============================================================
   KZ SHARE — share a prayer / page with a custom OG image
   Use:
     <button class="js-kz-share"
             data-title="לרפואת ישראל בן שרה"
             data-subtitle="הצטרפו לתפילה — ירושלים → העולם"
             data-category="רפואה">
       שתף בקשה
     </button>
   ============================================================ */
(function(){
  'use strict';

  function shareUrlFor(opts){
    const lang = opts.lang
      || document.documentElement.lang
      || (navigator.language || 'he').slice(0, 2);
    const params = new URLSearchParams({
      title: opts.title || '',
      subtitle: opts.subtitle || '',
      category: opts.category || '',
      theme: opts.theme || 'gold',
      lang
    });
    return {
      og: `${location.origin}/api/og-image?${params}`,
      page: opts.url || location.href
    };
  }

  async function shareNative(opts){
    const u = shareUrlFor(opts);
    const text = `${opts.title || ''}\n${opts.subtitle || ''}\n${u.page}`;
    if (navigator.share){
      try { await navigator.share({ title: opts.title, text, url: u.page }); return true; } catch {}
    }
    // Fallback: WhatsApp
    location.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
    return false;
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-kz-share');
    if (!btn) return;
    e.preventDefault();
    shareNative({
      title:    btn.dataset.title    || document.title,
      subtitle: btn.dataset.subtitle || '',
      category: btn.dataset.category || '',
      theme:    btn.dataset.theme    || 'gold',
      url:      btn.dataset.url      || location.href
    });
  });

  window.KZ_SHARE = { share: shareNative, urlFor: shareUrlFor };
})();
