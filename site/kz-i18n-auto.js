/* ============================================================
   KZ I18N AUTO — auto-translate the page on first visit
   - Detects browser language; offers a one-click translate
     ribbon (no auto-replace by default — respects original Hebrew).
   - Caches translations in localStorage so future visits are instant.
   - Works on any text node inside [data-i18n-auto] / fallback: <main>.
   - Attribute opt-out: data-i18n-skip
   ============================================================ */
(function(){
  'use strict';

  const SUPPORTED = ['en','fr','es','ru','de','it','pt','ar','tr','zh'];
  const STORE_PREFIX = 'kz_i18n_v1_';
  const CHOICE_KEY = 'kz_i18n_choice_v1';

  function detectLang(){
    const choice = (() => { try { return localStorage.getItem(CHOICE_KEY); } catch { return null; } })();
    if (choice) return choice;
    const nav = (navigator.language || 'he').slice(0,2).toLowerCase();
    if (nav === 'he' || nav === 'iw') return 'he';
    return SUPPORTED.includes(nav) ? nav : 'en';
  }

  const NAMES = {
    en:'English', fr:'Français', es:'Español', ru:'Русский',
    de:'Deutsch', it:'Italiano', pt:'Português', ar:'العربية',
    tr:'Türkçe', zh:'中文'
  };

  function showOffer(lang){
    if (lang === 'he' || document.querySelector('.kz-i18n-offer')) return;
    const offer = document.createElement('div');
    offer.className = 'kz-i18n-offer';
    offer.innerHTML = `
      <span class="kz-i18n-flag">🌐</span>
      <span class="kz-i18n-text">View in <b>${NAMES[lang] || lang}</b>?</span>
      <button class="kz-i18n-yes">Translate</button>
      <button class="kz-i18n-no" aria-label="Dismiss">×</button>`;
    document.body.appendChild(offer);
    requestAnimationFrame(() => offer.classList.add('is-in'));
    offer.querySelector('.kz-i18n-yes').addEventListener('click', async () => {
      try { localStorage.setItem(CHOICE_KEY, lang); } catch {}
      offer.remove();
      await translatePage(lang);
    });
    offer.querySelector('.kz-i18n-no').addEventListener('click', () => {
      try { localStorage.setItem(CHOICE_KEY, 'he'); } catch {}
      offer.remove();
    });
  }

  function collectStrings(root){
    const skip = new Set(['SCRIPT','STYLE','NOSCRIPT','SVG','IFRAME','VIDEO','AUDIO','CODE','PRE']);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (skip.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.closest('[data-i18n-skip]')) return NodeFilter.FILTER_REJECT;
        const txt = node.nodeValue;
        if (!txt || !txt.trim() || txt.trim().length < 2) return NodeFilter.FILTER_REJECT;
        // Skip pure numbers or emoji-only strings
        if (/^[\s\d\p{P}\p{S}]+$/u.test(txt)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const list = [];
    let n; while ((n = walker.nextNode())) list.push(n);
    return list;
  }

  async function translatePage(lang){
    const root = document.querySelector('[data-i18n-auto]') || document.querySelector('main') || document.body;
    const nodes = collectStrings(root);
    const texts = nodes.map(n => n.nodeValue);

    // Use cache when present; only translate the rest.
    let cache = {};
    try { cache = JSON.parse(localStorage.getItem(STORE_PREFIX + lang) || '{}'); } catch {}
    const need = []; const needIdx = [];
    texts.forEach((t, i) => {
      if (cache[t]) nodes[i].nodeValue = cache[t];
      else { need.push(t); needIdx.push(i); }
    });

    // Batch in chunks of 80 strings
    const CHUNK = 80;
    for (let i = 0; i < need.length; i += CHUNK){
      const slice = need.slice(i, i + CHUNK);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: slice, target: lang, source: 'he' })
        });
        if (!res.ok) break;
        const data = await res.json();
        const out = data.translations || [];
        out.forEach((tr, j) => {
          const origIdx = needIdx[i + j];
          if (origIdx == null) return;
          nodes[origIdx].nodeValue = tr;
          cache[need[i + j]] = tr;
        });
        try { localStorage.setItem(STORE_PREFIX + lang, JSON.stringify(cache)); } catch {}
      } catch { break; }
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  }

  function init(){
    const lang = detectLang();
    if (lang === 'he') return;
    // Auto-apply if user previously chose this language
    const stored = (() => { try { return localStorage.getItem(CHOICE_KEY); } catch { return null; } })();
    if (stored && stored !== 'he'){ translatePage(stored); return; }
    setTimeout(() => showOffer(lang), 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.KZ_I18N = { translateTo: translatePage };
})();
