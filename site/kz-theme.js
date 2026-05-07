/* ============================================================
   KZ THEME — dark/light/auto switcher
   - Persists choice in localStorage.
   - Adds <html data-theme="dark|light"> for CSS to react to.
   - Builds a discreet floating toggle if no manual mount exists.
   ============================================================ */
(function(){
  'use strict';

  const KEY = 'kz_theme_v1'; // 'dark' | 'light' | 'auto'

  function get(){ try { return localStorage.getItem(KEY) || 'auto'; } catch { return 'auto'; } }
  function set(v){ try { localStorage.setItem(KEY, v); } catch {} apply(); render(); }

  function effective(){
    const v = get();
    if (v !== 'auto') return v;
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function apply(){
    const eff = effective();
    document.documentElement.dataset.theme = eff;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', eff === 'light' ? '#fffaf3' : '#0B1F3A');
  }

  function render(){
    let btn = document.querySelector('.kz-theme-toggle');
    const placeholder = document.querySelector('[data-kz-theme]');
    if (!btn){
      btn = document.createElement('button');
      btn.className = 'kz-theme-toggle';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'מעבר בין מצב יום ולילה');
      (placeholder || document.body).appendChild(btn);
    }
    const v = get();
    btn.dataset.mode = v;
    btn.innerHTML = v === 'light' ? '☀' : v === 'dark' ? '☾' : '◐';
    btn.title = v === 'auto' ? 'אוטומטי (לפי מערכת)' : v === 'dark' ? 'מצב לילה' : 'מצב יום';
    btn.onclick = () => {
      // cycle dark → light → auto
      const next = v === 'dark' ? 'light' : v === 'light' ? 'auto' : 'dark';
      set(next);
    };
  }

  // React to OS changes when in 'auto'
  matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', () => { if (get() === 'auto') apply(); });

  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true });
  else render();

  window.KZ_THEME = { get, set, apply };
})();
