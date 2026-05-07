/* =========================================================
   כל זכות יהודי · Shared helpers
   Vanilla JS, no build step. Dark/light safe, RTL only.
   ========================================================= */

(function () {
  'use strict';

  // Pills filter behaviour
  document.addEventListener('click', function (e) {
    const pill = e.target.closest('[data-kz-pill]');
    if (!pill) return;
    const group = pill.closest('[data-kz-pill-group]');
    if (!group) return;
    const target = group.getAttribute('data-kz-target');
    const value = pill.getAttribute('data-kz-pill');
    group.querySelectorAll('.kz-pill').forEach(p => p.classList.toggle('active', p === pill));
    if (!target) return;
    const host = document.querySelector(target);
    if (!host) return;
    host.querySelectorAll('[data-kz-cat]').forEach(card => {
      const cats = (card.getAttribute('data-kz-cat') || '').split(/\s+/);
      const show = value === 'all' || cats.indexOf(value) !== -1;
      card.style.display = show ? '' : 'none';
    });
  });

  // Accordion: auto-close siblings optional
  document.querySelectorAll('[data-kz-accordion]').forEach(group => {
    const single = group.getAttribute('data-kz-accordion') === 'single';
    if (!single) return;
    group.addEventListener('toggle', function (e) {
      if (!e.target.open) return;
      group.querySelectorAll('details.kz-topic').forEach(d => {
        if (d !== e.target) d.open = false;
      });
    }, true);
  });

  // Lightweight form submit helper (used by Q&A, memorial, volunteers, hosting)
  window.kzSubmitForm = async function (form, endpoint, onSuccess) {
    const status = form.querySelector('.kz-form-status');
    if (status) { status.className = 'kz-form-status'; status.textContent = ''; }

    const data = {};
    form.querySelectorAll('input, textarea, select').forEach(el => {
      if (!el.name) return;
      data[el.name] = el.value.trim();
    });

    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.dataset.orig = btn.textContent; btn.textContent = 'שולח…'; }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.ok === false) {
        throw new Error(body.error || 'request-failed');
      }
      if (status) {
        status.classList.add('ok');
        status.textContent = body.message || 'נשלח בהצלחה · תודה רבה';
      }
      if (typeof onSuccess === 'function') onSuccess(body);
      form.reset();
    } catch (err) {
      if (status) {
        status.classList.add('err');
        status.textContent = 'לא הצלחנו לשלוח כרגע. נסו שוב בעוד רגע.';
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.orig || btn.textContent; }
    }
  };

  // Tiny loader for public feeds (Q&A and memorial listings)
  window.kzLoadFeed = async function (endpoint, host, render) {
    try {
      const res = await fetch(endpoint);
      const body = await res.json();
      const items = Array.isArray(body.items) ? body.items : [];
      host.innerHTML = items.length
        ? items.map(render).join('')
        : '<div class="kz-feed-item" style="text-align:center;color:var(--muted)">עדיין אין רשומות — הוסף את הראשונה.</div>';
    } catch {
      host.innerHTML = '<div class="kz-feed-item" style="text-align:center;color:var(--muted)">לא ניתן לטעון כרגע.</div>';
    }
  };

  // Expose an escape helper for safe text rendering
  window.kzEsc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };
})();

/* =========================================================
   "חזור לדף הבית" floating button — auto-injected on every
   page except the home page itself and the offline fallback.
   Purely additive: does not touch any existing DOM nodes.
   ========================================================= */
(function injectBackToHome() {
  function isHomePage() {
    var p = (location.pathname || '').toLowerCase();
    if (p === '/' || p === '' ) return true;
    if (p.endsWith('/index.html')) return true;
    if (p.endsWith('/offline.html')) return true;
    return false;
  }
  if (isHomePage()) return;
  if (document.getElementById('kzBackHome')) return;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else { fn(); }
  }

  ready(function () {
    if (document.getElementById('kzBackHome')) return;

    var style = document.createElement('style');
    style.id = 'kzBackHomeStyle';
    style.textContent = [
      '.kz-back-home{',
      '  position:fixed; z-index:9999;',
      '  top:auto; bottom:18px; inset-inline-start:18px;',
      '  display:inline-flex; align-items:center; gap:8px;',
      '  padding:11px 16px; border-radius:999px;',
      '  background:linear-gradient(135deg,#c6a054,#8a6a2f);',
      '  color:#fff; font-weight:700; font-size:14px;',
      '  text-decoration:none; cursor:pointer;',
      '  box-shadow:0 8px 22px rgba(138,106,47,.32);',
      '  border:1px solid rgba(255,255,255,.35);',
      '  font-family:inherit; line-height:1;',
      '  transition:transform .18s ease, box-shadow .25s ease;',
      '}',
      '.kz-back-home:hover,.kz-back-home:focus-visible{',
      '  transform:translateY(-1px);',
      '  box-shadow:0 12px 28px rgba(138,106,47,.42);',
      '  outline:none;',
      '}',
      '.kz-back-home .kz-bh-ico{font-size:15px; line-height:1}',
      'html[dir="ltr"] .kz-back-home .kz-bh-ico{transform:rotate(180deg)}',
      '@media (max-width:520px){',
      '  .kz-back-home{padding:10px 14px; font-size:13px; bottom:14px; inset-inline-start:14px}',
      '}'
    ].join('');
    document.head.appendChild(style);

    var a = document.createElement('a');
    a.id = 'kzBackHome';
    a.className = 'kz-back-home';
    a.href = 'index.html';
    a.setAttribute('aria-label', 'חזור לדף הבית');
    a.innerHTML = '<span class="kz-bh-ico" aria-hidden="true">⌂</span><span>חזור לדף הבית</span>';
    document.body.appendChild(a);
  });
})();
