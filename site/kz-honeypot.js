/* ============================================================
   KZ HONEYPOT — auto-injects anti-bot fields into all <form>s
   - _hp: hidden text field — bots fill it, humans don't
   - _ts: timestamp from page load — server rejects sub-1.5s posts
   - Patches window.fetch on POST to /api/* to add the same fields
     into JSON bodies (for forms that submit via fetch).
   ============================================================ */
(function(){
  'use strict';
  if (window.__kz_hp_installed) return;
  window.__kz_hp_installed = true;

  const PAGE_LOADED_AT = Date.now();

  /* Inject hidden honeypot field into every form */
  function injectIntoForms(){
    document.querySelectorAll('form').forEach(form => {
      if (form.dataset.kzHp) return;
      form.dataset.kzHp = '1';

      const hp = document.createElement('input');
      hp.type = 'text';
      hp.name = '_hp';
      hp.autocomplete = 'off';
      hp.tabIndex = -1;
      hp.setAttribute('aria-hidden', 'true');
      hp.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
      form.appendChild(hp);

      const ts = document.createElement('input');
      ts.type = 'hidden';
      ts.name = '_ts';
      ts.value = String(PAGE_LOADED_AT);
      form.appendChild(ts);
    });
  }

  /* Patch fetch: add _hp + _ts to JSON POST bodies sent to /api/* */
  if (typeof window.fetch === 'function'){
    const origFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      try {
        const url = typeof input === 'string' ? input : (input && input.url) || '';
        const opts = init || (typeof input === 'object' ? input : {}) || {};
        const method = (opts.method || (typeof input !== 'string' && input?.method) || 'GET').toUpperCase();
        if (method === 'POST' && url.includes('/api/')){
          /* Try to augment JSON body with honeypot fields */
          const body = opts.body;
          if (body && typeof body === 'string'){
            try {
              const json = JSON.parse(body);
              if (json && typeof json === 'object' && !Array.isArray(json)){
                json._ts = json._ts ?? PAGE_LOADED_AT;
                json._hp = json._hp ?? '';
                opts.body = JSON.stringify(json);
              }
            } catch {}
          }
        }
      } catch {}
      return origFetch(input, init);
    };
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', injectIntoForms, { once: true });
  } else {
    injectIntoForms();
  }
  /* Re-inject on dynamic forms */
  if ('MutationObserver' in window){
    const mo = new MutationObserver(() => injectIntoForms());
    mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }
})();
