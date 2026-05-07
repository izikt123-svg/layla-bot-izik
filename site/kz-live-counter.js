/* ============================================================
   KZ LIVE COUNTER — animated "praying now" pulse
   Updates the dashboard sub-text "126 לבבות נושאים תפילה יחד".
   - Heartbeat every 30s so we count the visit as active.
   - Polls /api/counter every 15s for the live total.
   - Smooth count-up animation; gracefully degrades.
   ============================================================ */
(function(){
  'use strict';

  const SID_KEY = 'kz_sid_v1';
  function sid(){
    try {
      let s = localStorage.getItem(SID_KEY);
      if (!s){
        s = 'sid_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        localStorage.setItem(SID_KEY, s);
      }
      return s;
    } catch { return 'sid_' + Math.random().toString(36).slice(2, 10); }
  }

  function findTargets(){
    return {
      sub: document.querySelector('.hero-dash-sub'),
      // optional dedicated mounts
      activeEls: document.querySelectorAll('[data-kz-counter="active"]'),
      todayEls:  document.querySelectorAll('[data-kz-counter="today"]')
    };
  }

  function animate(el, to){
    if (!el) return;
    const from = parseInt((el.dataset.kzVal || el.textContent || '0').replace(/\D/g, ''), 10) || 0;
    const start = performance.now();
    const dur = 900;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    function step(now){
      const t = Math.min(1, (now - start) / dur);
      const v = Math.round(from + (to - from) * ease(t));
      el.textContent = v.toLocaleString('he-IL');
      el.dataset.kzVal = v;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function applySub(active){
    const t = findTargets();
    if (t.sub){
      // Render once, then keep just the number animating in place.
      let numEl = t.sub.querySelector('.kz-live-num');
      if (!numEl){
        t.sub.innerHTML = '<span class="kz-live-num" data-kz-val="0">0</span> לבבות נושאים תפילה יחד, עכשיו';
        numEl = t.sub.querySelector('.kz-live-num');
      }
      animate(numEl, active);
    }
    t.activeEls.forEach(el => animate(el, active));
  }

  async function tick(){
    try {
      const res = await fetch('/api/counter', { cache: 'no-store' });
      if (!res.ok) throw new Error('counter ' + res.status);
      const data = await res.json();
      applySub(data.active || 0);
      const t = findTargets();
      if (data.todayPrayers != null) t.todayEls.forEach(el => animate(el, data.todayPrayers));
    } catch (_){
      // Offline / endpoint missing → keep current value, do nothing.
    }
  }

  async function heartbeat(){
    try {
      await fetch('/api/counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'heartbeat', sid: sid() })
      });
    } catch (_){}
  }

  function start(){
    heartbeat();
    tick();
    setInterval(tick, 15_000);
    setInterval(heartbeat, 30_000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden){ heartbeat(); tick(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
