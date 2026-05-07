/* ============================================================
   KZ CITY COMMUNITY — quick links to local Jewish communities
   - Curated WhatsApp/Telegram/Facebook group links per city.
   - Uses the user's detected city (from kz-near-me) when available.
   ============================================================ */
(function(){
  'use strict';

  // Curated per-city quick links (extend freely)
  const COMMUNITIES = {
    'New York':       [{ kind:'wa', label:'NYC Jewish travelers (WhatsApp)', href:'https://chat.whatsapp.com/' }, { kind:'fb', label:'Frum NYC group', href:'https://facebook.com/groups/' }],
    'Brooklyn':       [{ kind:'wa', label:'Crown Heights Frum WhatsApp', href:'https://chat.whatsapp.com/' }],
    'Miami':          [{ kind:'wa', label:'Miami Beach Jewish (WhatsApp)', href:'https://chat.whatsapp.com/' }],
    'Los Angeles':    [{ kind:'wa', label:'Pico-Robertson WhatsApp', href:'https://chat.whatsapp.com/' }],
    'London':         [{ kind:'wa', label:'Hendon/Golders Green WhatsApp', href:'https://chat.whatsapp.com/' }],
    'Paris':          [{ kind:'tg', label:'Telegram Juifs Paris', href:'https://t.me/' }],
    'Berlin':         [{ kind:'wa', label:'Berlin Jewish travelers WA', href:'https://chat.whatsapp.com/' }],
    'Bangkok':        [{ kind:'wa', label:'Bangkok Israeli backpackers', href:'https://chat.whatsapp.com/' }],
    'Tokyo':          [{ kind:'wa', label:'Tokyo Israeli travelers WA', href:'https://chat.whatsapp.com/' }],
    'Sydney':         [{ kind:'wa', label:'Sydney Jewish community', href:'https://chat.whatsapp.com/' }],
    'Buenos Aires':   [{ kind:'wa', label:'AMIA / קהילת ארגנטינה', href:'https://chat.whatsapp.com/' }],
    'Cape Town':      [{ kind:'wa', label:'Cape Town Jewish WA', href:'https://chat.whatsapp.com/' }],
    'Mexico City':    [{ kind:'wa', label:'CDMX Comunidad Judía', href:'https://chat.whatsapp.com/' }],
    'Bali':           [{ kind:'wa', label:'Israelis in Bali WA', href:'https://chat.whatsapp.com/' }]
  };

  const ICN = { wa:'💬', tg:'✈️', fb:'📘' };

  function build(){
    const mount = document.querySelector('[data-kz-community]');
    if (!mount || mount.dataset.kzReady) return;
    mount.dataset.kzReady = '1';
    mount.innerHTML = `
      <div class="mini-title"><span class="mini-ornament">📱</span><span>קהילה מקומית</span></div>
      <div class="kz-comm-pick">
        <input id="kzCommCity" placeholder="עיר (אוטומטי לפי מיקום)" />
      </div>
      <div class="kz-comm-list" id="kzCommList">
        <small>הזן/י עיר או לחץ "מיקום" למעלה</small>
      </div>`;

    const cityIn = mount.querySelector('#kzCommCity');
    document.addEventListener('kz:pos', () => {
      const v = cityIn.value;
      if (!v && window.__kz_city){
        cityIn.value = window.__kz_city;
        render(window.__kz_city);
      }
    });
    cityIn.addEventListener('input', () => render(cityIn.value));

    function render(city){
      const list = mount.querySelector('#kzCommList');
      if (!city){ list.innerHTML = '<small>הזן/י עיר או הפעל מיקום</small>'; return; }
      const key = Object.keys(COMMUNITIES).find(k => k.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(k.toLowerCase()));
      const items = key ? COMMUNITIES[key] : [];
      if (!items.length){
        list.innerHTML = `<small>אין כרגע קישורים מובנים ל-${escapeHtml(city)}. נסה לחפש "${encodeURIComponent(city + ' Jewish whatsapp')}" בגוגל.</small>
          <a class="kz-comm-search" href="https://www.google.com/search?q=${encodeURIComponent(city + ' jewish whatsapp group')}" target="_blank" rel="noopener">🔍 חפש בגוגל</a>`;
        return;
      }
      list.innerHTML = items.map(it => `
        <a class="kz-comm-link" href="${it.href}" target="_blank" rel="noopener">
          <span class="kz-comm-icn">${ICN[it.kind] || '🔗'}</span>
          <span>${escapeHtml(it.label)}</span>
        </a>`).join('');
    }
  }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once: true });
  else build();
})();
