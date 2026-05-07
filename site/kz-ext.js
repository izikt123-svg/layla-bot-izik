/* =========================================================
   Extensions layer — kz-ext.js
   Shared client helpers for 40+ new extension pages.
   ========================================================= */
(function () {
  'use strict';

  const KZX = (window.KZX = window.KZX || {});

  KZX.uid = function () {
    try {
      let v = localStorage.getItem('kzx-uid');
      if (!v) {
        v = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('kzx-uid', v);
      }
      return v;
    } catch { return 'anon'; }
  };

  KZX.fetchJSON = async function (url, opts) {
    try {
      const r = await fetch(url, opts);
      return await r.json();
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  };

  KZX.postJSON = (url, body) => KZX.fetchJSON(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });

  KZX.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  };

  KZX.toast = function (msg, ok) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:${ok===false?'#8e1c1c':'#0B1F3A'};color:#fff;padding:12px 20px;border-radius:999px;
      box-shadow:0 8px 24px rgba(0,0,0,.24);z-index:9999;font-weight:700;max-width:90%`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  };

  KZX.haversineKm = function (lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
    return 2 * R * Math.asin(Math.sqrt(a));
  };

  KZX.wazeLink = function (place) {
    if (place.lat != null && place.lon != null) {
      return `https://waze.com/ul?ll=${place.lat}%2C${place.lon}&navigate=yes`;
    }
    const q = encodeURIComponent([place.name, place.city, place.country].filter(Boolean).join(', '));
    return `https://waze.com/ul?q=${q}`;
  };

  KZX.gmapsLink = function (place) {
    if (place.lat != null && place.lon != null) {
      return `https://maps.google.com/?q=${place.lat},${place.lon}`;
    }
    const q = encodeURIComponent([place.name, place.city, place.country].filter(Boolean).join(', '));
    return `https://maps.google.com/?q=${q}`;
  };

  KZX.loadCommunities = async function () {
    const key = 'kzx-cache-communities';
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.ts && Date.now() - parsed.ts < 600000) return parsed.items;
      }
    } catch {}
    const res = await KZX.fetchJSON('/.netlify/functions/kz-communities');
    const items = (res && res.items) || [];
    try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), items })); } catch {}
    return items;
  };

  KZX.renderBoard = async function (kind, containerId, opts = {}) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '<div style="color:#8a7c61">טוען רשומות…</div>';
    const res = await KZX.fetchJSON(`/.netlify/functions/kz-board?kind=${encodeURIComponent(kind)}`);
    const items = (res && res.items) || [];
    if (!items.length) {
      el.innerHTML = '<div style="color:#8a7c61">אין רשומות עדיין — היה הראשון לפרסם!</div>';
      return;
    }
    el.innerHTML = items.slice(0, opts.limit || 50).map(it => `
      <li class="kzx-list-item">
        <div>
          <div class="t">${KZX.esc(it.title || it.name || it.body?.slice(0, 60) || 'ללא כותרת')}</div>
          ${it.body ? `<div class="m">${KZX.esc(it.body)}</div>` : ''}
          <div class="d">${KZX.esc([it.name, it.city, it.country].filter(Boolean).join(' · '))}</div>
        </div>
        <div class="d">${KZX.esc((it.ts || '').slice(0, 10))}</div>
      </li>
    `).join('');
  };

  KZX.postToBoard = async function (kind, data, statusEl) {
    if (statusEl) { statusEl.className = 'kzx-status'; statusEl.textContent = 'שולח…'; }
    const res = await KZX.postJSON('/.netlify/functions/kz-board', { ...data, kind });
    if (statusEl) {
      if (res.ok) { statusEl.className = 'kzx-status ok'; statusEl.textContent = res.message || 'נשמר'; }
      else       { statusEl.className = 'kzx-status err'; statusEl.textContent = 'שגיאה בשמירה — נסה שוב'; }
    }
    return res;
  };

  // Shabbat mode — toggled manually, remembered in localStorage
  KZX.setShabbatMode = function (on) {
    document.documentElement.classList.toggle('kzx-shabbat', !!on);
    try { localStorage.setItem('kzx-shabbat', on ? '1' : '0'); } catch {}
  };
  try {
    if (localStorage.getItem('kzx-shabbat') === '1') {
      document.documentElement.classList.add('kzx-shabbat');
    }
  } catch {}

  // Accessibility settings — remember
  try {
    const a11y = JSON.parse(localStorage.getItem('kzx-a11y') || '{}');
    if (a11y.xxl)  document.documentElement.classList.add('kzx-xxl');
    if (a11y.xxxl) document.documentElement.classList.add('kzx-xxxl');
    if (a11y.hc)   document.documentElement.classList.add('kzx-highcontrast');
  } catch {}
  KZX.setA11y = function (patch) {
    try {
      const cur = JSON.parse(localStorage.getItem('kzx-a11y') || '{}');
      const next = { ...cur, ...patch };
      localStorage.setItem('kzx-a11y', JSON.stringify(next));
      document.documentElement.classList.toggle('kzx-xxl',  !!next.xxl && !next.xxxl);
      document.documentElement.classList.toggle('kzx-xxxl', !!next.xxxl);
      document.documentElement.classList.toggle('kzx-highcontrast', !!next.hc);
    } catch {}
  };

  // Voice helpers
  KZX.speechRecognition = function () {
    const Cls = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Cls) return null;
    const r = new Cls();
    r.lang = document.documentElement.lang || 'he-IL';
    r.continuous = false;
    r.interimResults = false;
    return r;
  };
  KZX.speak = function (text, lang) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang || (document.documentElement.lang || 'he-IL');
      window.speechSynthesis.speak(u);
    } catch {}
  };

  // Log hit for stats (best-effort, fire-and-forget)
  try {
    if (!location.pathname.startsWith('/.netlify')) {
      fetch('/.netlify/functions/kz-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric: 'hit', page: location.pathname })
      }).catch(()=>{});
    }
  } catch {}

})();
