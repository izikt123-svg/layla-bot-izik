/* ============================================================
   KZ NEAR-ME — radar of Jewish places around the user
   Features:
     - One-tap location grant
     - Walking-distance ranking (Haversine) of jewish-places.js
     - Filter chips: minyan / chabad / kosher / mikveh / tomb
     - Open-now status (heuristic for kosher; "ask" otherwise)
     - WhatsApp + Waze deep links
     - Augments with Overpass live data for the current viewport
   Mounts inside [data-kz-near-me].
   ============================================================ */
(function(){
  'use strict';

  const CATS = [
    { key:'all',       he:'הכל',          icon:'🌍' },
    { key:'chabad',    he:'בית חב"ד',    icon:'🕎' },
    { key:'synagogue', he:'בית כנסת',     icon:'✡'  },
    { key:'kosher',    he:'כשר',           icon:'🍽' },
    { key:'mikveh',    he:'מקווה',         icon:'💧' },
    { key:'tomb',      he:'קבר צדיק',      icon:'🕯' }
  ];

  function build(){
    const mount = document.querySelector('[data-kz-near-me]');
    if (!mount || mount.dataset.kzReady) return null;
    mount.dataset.kzReady = '1';
    mount.classList.add('kz-nm-card');
    mount.innerHTML = `
      <div class="mini-title">
        <span class="mini-ornament">🧭</span>
        <span>קרוב אליך</span>
        <button class="kz-nm-refresh" id="kzNmRefresh" aria-label="רענן">↻</button>
      </div>
      <div class="kz-nm-chips" id="kzNmChips">
        ${CATS.map((c, i) => `<button class="kz-nm-chip ${i === 0 ? 'is-on' : ''}" data-cat="${c.key}">${c.icon} ${c.he}</button>`).join('')}
      </div>
      <ul class="kz-nm-list" id="kzNmList">
        <li class="kz-nm-empty">לחצו על "הפעל מיקום" כדי לראות מקומות סביבך</li>
      </ul>`;
    mount.querySelector('#kzNmChips').addEventListener('click', (e) => {
      const b = e.target.closest('.kz-nm-chip');
      if (!b) return;
      mount.querySelectorAll('.kz-nm-chip').forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      render();
    });
    mount.querySelector('#kzNmRefresh').addEventListener('click', () => {
      // Re-prompt for location
      navigator.geolocation?.getCurrentPosition(setPos, () => {});
    });
    return mount;
  }

  let pos = null;
  let extras = []; // Overpass-augmented places

  function distKm(a, b){
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
    const x = Math.sin(dLat/2)**2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  function fmtDist(km){
    if (km < 1) return Math.round(km * 1000) + ' מ׳';
    return km.toFixed(km < 10 ? 1 : 0) + ' ק״מ';
  }

  function isOpenNow(place){
    // Heuristic: kosher restaurants open 11:00-22:30 weekdays; closed Friday afternoon to Saturday night.
    const now = new Date();
    const day = now.getDay(); // 0 Sun
    const hour = now.getHours();
    if (place.cat === 'kosher'){
      if (day === 5 && hour >= 14) return false;        // Friday afternoon
      if (day === 6) return false;                       // Shabbat (most kosher closed)
      return hour >= 11 && hour < 22;
    }
    if (place.cat === 'chabad' || place.cat === 'synagogue'){
      return true; // generally open for tefilla / drop-in
    }
    return null; // unknown
  }

  function render(){
    const card = document.querySelector('[data-kz-near-me]');
    if (!card) return;
    const list = card.querySelector('#kzNmList');
    const cat  = card.querySelector('.kz-nm-chip.is-on')?.dataset.cat || 'all';
    if (!pos){
      list.innerHTML = `<li class="kz-nm-empty">לחצו על "הפעל מיקום" למעלה כדי לראות מקומות סביבך</li>`;
      return;
    }
    const all = (window.KZ_JEWISH_PLACES || []).concat(extras);
    const filtered = all
      .filter(p => p.lat != null && p.lng != null)
      .filter(p => cat === 'all' ? true : p.cat === cat)
      .map(p => ({ p, d: distKm(pos, p) }))
      .filter(x => x.d <= (pos.cityMode ? 50 : 5))   // 5km walking, fallback 50km
      .sort((a, b) => a.d - b.d)
      .slice(0, 18);

    if (!filtered.length){
      list.innerHTML = `<li class="kz-nm-empty">לא נמצאו מקומות בקטגוריה הזו עד 50 ק״מ. נסו "הכל".</li>`;
      return;
    }
    list.innerHTML = filtered.map(({ p, d }) => {
      const open = isOpenNow(p);
      const openHtml = open === true  ? '<span class="kz-nm-open">פתוח עכשיו</span>'
                     : open === false ? '<span class="kz-nm-closed">סגור עכשיו</span>'
                     : '';
      const waze = `https://www.waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`;
      const wa   = `https://wa.me/?text=${encodeURIComponent(`${p.name}\nWaze: ${waze}`)}`;
      const cmeta = (CATS.find(c => c.key === p.cat) || {});
      return `<li class="kz-nm-item">
        <span class="kz-nm-icn">${cmeta.icon || '✦'}</span>
        <div class="kz-nm-meta">
          <b>${escapeHtml(p.name)}</b>
          <small>${escapeHtml(p.city || '')}${p.country ? ' · ' + escapeHtml(p.country) : ''}</small>
          ${openHtml}
        </div>
        <span class="kz-nm-dist">${fmtDist(d)}</span>
        <a class="kz-nm-go" href="${waze}" target="_blank" rel="noopener" title="Waze">🚗</a>
        <a class="kz-nm-share" href="${wa}" target="_blank" rel="noopener" title="שתף">↗</a>
      </li>`;
    }).join('');
  }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function setPos(geo){
    pos = { lat: geo.coords.latitude, lng: geo.coords.longitude, cityMode: false };
    document.dispatchEvent(new CustomEvent('kz:pos', { detail: pos }));
    render();
    fetchOverpass().then(render);
    enrichCity();
  }

  // Live augmentation from Overpass (places of worship, kosher, mikveh)
  async function fetchOverpass(){
    if (!pos) return;
    const radius = 4000; // meters
    const q = `[out:json][timeout:12];
(
  node(around:${radius},${pos.lat},${pos.lng})["religion"="jewish"];
  node(around:${radius},${pos.lat},${pos.lng})["amenity"="place_of_worship"]["religion"="jewish"];
  node(around:${radius},${pos.lat},${pos.lng})["diet:kosher"="yes"];
);
out tags center 60;`;
    try {
      const r = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(q)
      });
      if (!r.ok) return;
      const data = await r.json();
      extras = (data.elements || []).slice(0, 60).map(el => ({
        id: 'osm_' + el.id,
        name: el.tags?.name || el.tags?.['name:he'] || el.tags?.['name:en'] || 'מקום יהודי',
        cat: el.tags?.['diet:kosher'] === 'yes' ? 'kosher'
           : (el.tags?.amenity === 'place_of_worship' || el.tags?.religion === 'jewish') ? 'synagogue'
           : 'synagogue',
        lat: el.lat, lng: el.lon,
        city: el.tags?.['addr:city'] || ''
      }));
    } catch {}
  }

  // Reverse-geocode into city for display
  async function enrichCity(){
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}&accept-language=he`);
      const j = await r.json();
      const city = j.address?.city || j.address?.town || j.address?.village || j.address?.state || '';
      const country = j.address?.country || '';
      const info = document.getElementById('trvLocInfo');
      if (info){
        info.hidden = false;
        info.textContent = `📍 ${city}${country ? ', ' + country : ''}`;
      }
      // Mode pill
      const pill = document.getElementById('trvMode');
      if (pill){
        const isIsrael = country === 'ישראל' || country === 'Israel';
        pill.textContent = isIsrael ? '🇮🇱 מטייל/ת בישראל' : '✈️ יהודי/ה בעולם';
      }
    } catch {}
  }

  // Hook the global location button
  document.addEventListener('DOMContentLoaded', () => {
    build();
    const locBtn = document.getElementById('trvLocBtn');
    if (locBtn){
      locBtn.addEventListener('click', () => {
        if (!navigator.geolocation){ alert('הדפדפן לא תומך במיקום'); return; }
        locBtn.textContent = '⏳ מאתר…';
        navigator.geolocation.getCurrentPosition((g) => {
          locBtn.textContent = '✓ מיקום פעיל';
          setPos(g);
        }, () => {
          locBtn.textContent = '📍 הפעל מיקום';
          alert('לא הצלחנו לאתר את המיקום שלך');
        }, { enableHighAccuracy: true, timeout: 12000 });
      });
    }
  }, { once: true });

  window.KZ_NEAR_ME = { setPos };
})();
