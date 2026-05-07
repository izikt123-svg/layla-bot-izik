/* ============================================================
   KZ WORLD BROWSER — drill-down + live Leaflet map
   Continent → Country → Place. Live map syncs to selection.
   ============================================================ */
(function(){
  'use strict';

  const CAT_META = {
    chabad:    { he:'בית חב״ד',   icon:'🕎', color:'#b45309' },
    synagogue: { he:'בית כנסת',    icon:'✡',  color:'#1e3a8a' },
    kosher:    { he:'כשר',          icon:'🍽', color:'#16a34a' },
    mikveh:    { he:'מקווה',        icon:'💧', color:'#0891b2' },
    yeshiva:   { he:'ישיבה',        icon:'📖', color:'#7c2d12' },
    tomb:      { he:'קבר צדיק',     icon:'🕯', color:'#6b21a8' },
    jcc:       { he:'מרכז קהילתי',  icon:'🏛', color:'#4338ca' },
    embassy:   { he:'שגרירות ישראל', icon:'🇮🇱', color:'#0038b8' },
    holy:      { he:'אתר קדוש',     icon:'⭐', color:'#b91c1c' }
  };

  /** State **/
  const state = {
    continent: null,        // key from KZ_CONTINENTS
    country:   null,        // cc
    cat:       'all',
    search:    '',
    verifiedOnly: false,
    selectedId: null
  };

  let map = null;
  let markersLayer = null;

  /** Render helpers **/
  function $(s){ return document.querySelector(s); }
  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function continentOf(cc){
    return window.KZ_COUNTRY_META?.[cc]?.continent || 'europe';
  }

  function getPhone(p){
    return p.phone || window.KZ_PLACE_PHONES?.[p.id]?.phone || null;
  }

  function getLocator(p){
    if (p.website) return p.website;
    if (window.KZ_PLACE_PHONES?.[p.id]?.url) return window.KZ_PLACE_PHONES[p.id].url;
    if (p.source_url) return p.source_url;
    if (p.cat === 'chabad'){
      return `https://www.chabad.org/centers/default_cdo/jewish/Centers.htm?location=${encodeURIComponent((p.city || '') + ' ' + (p.country || ''))}`;
    }
    return null;
  }

  function isVerified(p){ return p.verified === 'full' || p.status === 'ready'; }
  function isDraft(p){ return p.status === 'draft' || p.verified === 'partial' || p.verified === 'pending'; }

  /** Renderers **/
  function renderContinents(){
    const wrap = $('#kzContinents');
    wrap.innerHTML = window.KZ_CONTINENTS.map(c => `
      <button class="kz-world-continent ${state.continent === c.key ? 'is-on' : ''}" data-cont="${c.key}">
        <span class="ce">${c.emoji}</span>
        <span>${escapeHtml(c.he)}</span>
        <span class="cc">${countCountries(c.key)} מדינות</span>
      </button>`).join('');
    wrap.onclick = (e) => {
      const b = e.target.closest('.kz-world-continent');
      if (!b) return;
      state.continent = state.continent === b.dataset.cont ? null : b.dataset.cont;
      state.country = null;
      renderAll();
    };
  }

  function countCountries(continentKey){
    const set = new Set();
    (window.KZ_JEWISH_PLACES || []).forEach(p => {
      if (continentOf(p.cc) === continentKey) set.add(p.cc);
    });
    return set.size;
  }

  function placesFiltered(){
    const all = window.KZ_JEWISH_PLACES || [];
    return all.filter(p => {
      if (state.continent && continentOf(p.cc) !== state.continent) return false;
      if (state.country && p.cc !== state.country) return false;
      if (state.cat !== 'all' && p.cat !== state.cat) return false;
      if (state.search){
        const q = state.search.toLowerCase();
        const hay = (p.name + ' ' + (p.city || '') + ' ' + (p.country || '')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (state.verifiedOnly && !isVerified(p)) return false;
      return true;
    });
  }

  function renderCountries(){
    const wrap = $('#kzCountries');
    const list = placesFiltered();
    // Group by cc
    const byCC = {};
    list.forEach(p => { if (p.cc){ byCC[p.cc] = (byCC[p.cc] || 0) + 1; } });
    const ccs = Object.keys(byCC).sort((a, b) => byCC[b] - byCC[a]);
    if (!ccs.length){
      wrap.innerHTML = `<div class="kz-world-empty">אין מדינות תואמות לסינון. נסי ${state.continent ? '"כל היבשות"' : 'חיפוש אחר'}.</div>`;
      return;
    }
    wrap.innerHTML = ccs.map(cc => {
      const meta = window.KZ_COUNTRY_META?.[cc] || { he: cc, flag: '🌍' };
      return `<button class="kz-country ${state.country === cc ? 'is-on' : ''}" data-cc="${cc}">
        <span class="flag">${meta.flag}</span>
        <span>${escapeHtml(meta.he)}</span>
        <span class="count">${byCC[cc]}</span>
      </button>`;
    }).join('');
    wrap.onclick = (e) => {
      const b = e.target.closest('.kz-country');
      if (!b) return;
      state.country = state.country === b.dataset.cc ? null : b.dataset.cc;
      renderAll();
    };
  }

  function renderPlaces(){
    const wrap = $('#kzPlaces');
    const list = placesFiltered().sort((a, b) => (b.fame || 0) - (a.fame || 0));
    const stat = $('#kzWorldStat');
    stat.textContent = `${list.length} מקומות`;

    if (!list.length){
      wrap.innerHTML = `<div class="kz-world-empty">בחר/י יבשת/מדינה — או חפש/י עיר.</div>`;
      renderMarkers([]);
      return;
    }

    wrap.innerHTML = list.slice(0, 200).map(p => placeCard(p)).join('');
    wrap.onclick = (e) => {
      const id = e.target.closest('.kz-place')?.dataset.id;
      if (!id) return;
      state.selectedId = id;
      const p = list.find(x => x.id === id);
      if (p && map) map.setView([p.lat, p.lng], Math.max(map.getZoom(), 12));
    };

    renderMarkers(list);
  }

  function placeCard(p){
    const meta = CAT_META[p.cat] || { icon:'✦', he:p.cat };
    const phone = getPhone(p);
    const locator = getLocator(p);
    const waze = `https://www.waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`;
    const gmap = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(`${p.name}\n${p.city || ''} · ${p.country || ''}\n${p.phone || ''}\n${waze}`)}`;

    const badge = isVerified(p) ? '<span class="kz-badge kz-badge-ok" title="מאומת מחב״ד.org">✓ מאומת</span>'
                : isDraft(p)    ? '<span class="kz-badge kz-badge-draft" title="ממתין לאימות">טיוטה</span>'
                : '';
    const ptype = p.place_type ? `<span class="kz-place-type">${escapeHtml(p.place_type)}</span>` : '';

    /* Smart image: user-uploaded → photo_url → category illustration */
    let photoSrc = '';
    if (window.KZ_IMAGE) photoSrc = window.KZ_IMAGE.forPlace(p) || '';
    const photoHtml = photoSrc ? `
      <div class="kz-place-photo">
        <img src="${escapeHtml(photoSrc)}" alt="${escapeHtml(p.name)}" loading="lazy"/>
        <button class="kz-place-photo-edit js-kz-place-photo" data-id="${escapeHtml(p.id || '')}" title="הוסיפי תמונה משלך" type="button">📷</button>
      </div>` : '';

    return `<div class="kz-place" data-id="${escapeHtml(p.id || '')}">
      ${photoHtml}
      <div class="kz-place-head">
        <span class="kz-place-icn">${meta.icon}</span>
        <div>
          <b>${escapeHtml(p.name)} ${badge}</b>
          <small>${escapeHtml(p.city || '')}${p.country ? ' · ' + escapeHtml(p.country) : ''}${p.addr ? ' · ' + escapeHtml(p.addr) : ''}</small>
          ${ptype}
        </div>
      </div>
      <div class="kz-place-actions">
        <a class="is-primary" href="${waze}" target="_blank" rel="noopener">🚗 Waze</a>
        <a href="${gmap}" target="_blank" rel="noopener">🗺 מפה</a>
        ${phone ? `<a class="is-phone" href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ''))}">📞 ${escapeHtml(phone)}</a>` : ''}
        ${p.website ? `<a href="${escapeHtml(p.website)}" target="_blank" rel="noopener">🌐 אתר</a>` : ''}
        ${locator && locator !== p.website ? `<a href="${escapeHtml(locator)}" target="_blank" rel="noopener">🔗 Chabad.org</a>` : ''}
        <a href="${wa}" target="_blank" rel="noopener">↗ שתף</a>
      </div>
    </div>`;
  }

  /** Map **/
  function initMap(){
    if (map || !window.L) return;
    map = L.map('kzMap', { zoomControl: true, worldCopyJump: true }).setView([31.78, 35.22], 3);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
  }

  function colorFor(cat){
    return CAT_META[cat]?.color || '#d4b07a';
  }

  function divIcon(p){
    const c = colorFor(p.cat);
    const ic = CAT_META[p.cat]?.icon || '✦';
    return L.divIcon({
      className: 'kz-marker',
      html: `<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${c};color:#fff;font-size:14px;border:2px solid rgba(255,255,255,.85);box-shadow:0 4px 14px rgba(0,0,0,.4)">${ic}</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  }

  function renderMarkers(list){
    if (!map){ initMap(); }
    if (!markersLayer) return;
    markersLayer.clearLayers();
    list.forEach(p => {
      if (p.lat == null || p.lng == null) return;
      const phone = getPhone(p);
      const waze = `https://www.waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`;
      const verifiedTag = isVerified(p) ? ' <span style="color:#4ade80;font-size:10px">✓</span>' : '';
      const html = `<div class="kz-popup">
        <b>${escapeHtml(p.name)}${verifiedTag}</b>
        <small>${escapeHtml(p.city || '')}${p.country ? ' · ' + escapeHtml(p.country) : ''}${p.addr ? '<br>' + escapeHtml(p.addr) : ''}</small>
        <div class="row">
          <a class="is-primary" href="${waze}" target="_blank" rel="noopener">Waze</a>
          ${phone ? `<a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ''))}">📞</a>` : ''}
          ${p.website ? `<a href="${escapeHtml(p.website)}" target="_blank" rel="noopener">🌐</a>` : ''}
        </div>
      </div>`;
      const marker = L.marker([p.lat, p.lng], { icon: divIcon(p) })
                      .bindPopup(html);
      marker.addTo(markersLayer);
    });

    // Auto-fit bounds when a country is selected
    if (state.country && list.length){
      const bounds = L.latLngBounds(list.filter(x => x.lat != null).map(x => [x.lat, x.lng]));
      try { map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 }); } catch {}
    } else if (!state.country && state.continent && list.length){
      const bounds = L.latLngBounds(list.filter(x => x.lat != null).map(x => [x.lat, x.lng]));
      try { map.fitBounds(bounds, { padding: [60, 60], maxZoom: 5 }); } catch {}
    }
  }

  /** Wire filters + search **/
  function wire(){
    $('#kzFilters').addEventListener('click', (e) => {
      const b = e.target.closest('.kz-fil');
      if (!b) return;
      $('#kzFilters').querySelectorAll('.kz-fil').forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      state.cat = b.dataset.cat;
      renderAll();
    });

    let t = null;
    $('#kzWorldSearch').addEventListener('input', (e) => {
      clearTimeout(t);
      t = setTimeout(() => { state.search = e.target.value.trim(); renderAll(); }, 180);
    });

    const vOnly = document.getElementById('kzVerifiedOnly');
    if (vOnly){
      vOnly.addEventListener('change', () => {
        state.verifiedOnly = vOnly.checked;
        renderAll();
      });
    }

    /* Place photo upload — delegate */
    document.body.addEventListener('click', async (e) => {
      const btn = e.target.closest('.js-kz-place-photo');
      if (!btn || !window.KZ_IMAGE) return;
      e.preventDefault(); e.stopPropagation();
      const placeId = btn.dataset.id;
      // Open file picker
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.addEventListener('change', async () => {
        const f = input.files?.[0];
        if (f){
          await window.KZ_IMAGE.upload(f, placeId);
          renderAll();
        }
        input.remove();
      });
      input.click();
    });
  }

  function renderAll(){
    renderContinents();
    renderCountries();
    renderPlaces();
  }

  function start(){
    if (!window.KZ_JEWISH_PLACES || !window.KZ_CONTINENTS){
      // wait until data files load
      setTimeout(start, 80);
      return;
    }
    initMap();
    wire();
    renderAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
