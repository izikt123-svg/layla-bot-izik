/* ============================================================
   KZ CINEMA WALL — full-screen Shabbat candle wall
   - Polls /api/candles every 15s
   - Animates new candles in
   - Marquee shows the prayer of the most recent candle
   - Wake Lock keeps the screen on during use
   ============================================================ */
(function(){
  'use strict';

  const grid    = document.getElementById('cinGrid');
  const empty   = document.getElementById('cinEmpty');
  const counter = document.getElementById('cinCount');
  const marquee = document.getElementById('cinMarquee');

  let known = new Map(); // id -> candle

  function svgCandle(){
    return `<svg class="cin-svg" viewBox="0 0 56 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cinWax" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff7e0"/>
          <stop offset="100%" stop-color="#d4b07a"/>
        </linearGradient>
        <radialGradient id="cinFlameG" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stop-color="#fff7c0"/>
          <stop offset="55%" stop-color="#ffb648"/>
          <stop offset="100%" stop-color="#ff5b1f" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="28" cy="32" r="22" fill="url(#cinFlameG)" opacity=".55"/>
      <rect x="20" y="46" width="16" height="44" rx="3" fill="url(#cinWax)" stroke="#9c7a40" stroke-width="0.6"/>
      <rect x="27" y="40" width="2" height="6" fill="#5a3c14"/>
      <g class="cin-flame-anim">
        <ellipse cx="28" cy="34" rx="6.5" ry="11" fill="url(#cinFlameG)"/>
        <ellipse cx="28" cy="36" rx="3.5" ry="6" fill="#ffe28a"/>
        <ellipse cx="28" cy="38" rx="1.5" ry="3" fill="#fffce8"/>
      </g>
    </svg>`;
  }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function cardHtml(c){
    return `<article class="cin-card" data-id="${escapeHtml(c.id)}">
      ${svgCandle()}
      <div class="cin-name">${escapeHtml(c.name || 'אנונימית')}</div>
      <div class="cin-city">${escapeHtml(c.city || '')}</div>
      ${c.prayer ? `<div class="cin-prayer">${escapeHtml(c.prayer)}</div>` : ''}
    </article>`;
  }

  function setMarquee(list){
    if (!marquee) return;
    const withPrayer = list.find(c => c.prayer);
    marquee.textContent = withPrayer
      ? `“${withPrayer.prayer}” — ${withPrayer.name || 'אנונימית'}, ${withPrayer.city || ''}`
      : '';
  }

  async function tick(){
    let data;
    try {
      const r = await fetch('/api/candles?live=1', { cache: 'no-store' });
      if (!r.ok) throw new Error();
      data = await r.json();
    } catch {
      // Demo mode: use 6 mock candles so the screen never looks broken
      data = { candles: demoCandles() };
    }
    render(data.candles || []);
  }

  function render(list){
    counter.textContent = list.length;
    setMarquee(list);
    if (!list.length){ grid.innerHTML = ''; empty.hidden = false; return; }
    empty.hidden = true;

    // Detect new candles to animate the appearance subtly
    const next = new Map();
    list.forEach(c => next.set(c.id, c));
    const nowKnown = new Map(known);

    // Render full grid (cheap, ≤200 cards)
    grid.innerHTML = list.map(cardHtml).join('');
    // Stagger animation only for newly-arrived ones
    let delay = 0;
    list.forEach(c => {
      if (!nowKnown.has(c.id)){
        const el = grid.querySelector(`[data-id="${CSS.escape(c.id)}"]`);
        if (el){
          el.style.animationDelay = (delay * 80) + 'ms';
          delay++;
        }
      }
    });
    known = next;
  }

  function demoCandles(){
    return [
      { id:'demo1', name:'רחל', city:'ירושלים', prayer:'לרפואת אמא — דבורה בת שרה' },
      { id:'demo2', name:'שרה', city:'New York', prayer:'For my children to find their light' },
      { id:'demo3', name:'מירל', city:'Paris', prayer:'לשלום עם ישראל' },
      { id:'demo4', name:'אנונימית', city:'Buenos Aires', prayer:'לזיווג הגון' },
      { id:'demo5', name:'אנה', city:'Berlin', prayer:'לבריאות לכל המשפחה' },
      { id:'demo6', name:'נעמי', city:'Sydney', prayer:'תודה על כל הטוב' }
    ];
  }

  /* Wake Lock so the screen doesn't sleep */
  if ('wakeLock' in navigator){
    let lock = null;
    const acquire = async () => { try { lock = await navigator.wakeLock.request('screen'); } catch{} };
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !lock) acquire();
    });
    acquire();
  }

  /* Controls */
  document.getElementById('cinFs').addEventListener('click', () => {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
  });
  document.getElementById('cinTheme').addEventListener('click', () => {
    document.body.classList.toggle('is-hc');
  });

  tick();
  setInterval(tick, 15_000);
})();
