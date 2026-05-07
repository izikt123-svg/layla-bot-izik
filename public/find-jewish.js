/* ============================================================
   FIND-JEWISH — Map of Jewish Places worldwide
   Uses Leaflet + OpenStreetMap + Overpass API + curated dataset
   ============================================================ */
(function(){
  'use strict';

  const PLACES = window.KZ_JEWISH_PLACES || [];
  const CATS   = window.KZ_PLACE_CATEGORIES || [];

  const el = (sel, root=document) => root.querySelector(sel);
  const els = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  /* ─── State ──────────────────────────────────────── */
  let map;
  let cluster;
  let activeMarkers = new Map();      // id → marker
  let osmPlaces = [];                  // dynamically loaded from Overpass
  let activeCats = new Set(CATS.map(c => c.key)); // all on by default
  let userLatLng = null;
  let activeId = null;
  let lastBboxKey = '';
  let overpassTimer = null;

  /* ─── Init Leaflet ───────────────────────────────── */
  function initMap(){
    map = L.map('fjMap', {
      center: [25, 30],   // Show wide world view by default
      zoom: 2,             // Wider zoom — see Israel + diaspora
      zoomControl: false,
      worldCopyJump: true,
      minZoom: 2,
      maxZoom: 19
    });

    // Try multiple tile servers — fallback if one fails
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
      crossOrigin: true
    });
    tileLayer.addTo(map);
    // If tiles fail, swap to Carto
    tileLayer.on('tileerror', () => {
      console.warn('OSM tile error, trying Carto fallback');
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
        maxZoom: 19, crossOrigin: true
      }).addTo(map);
    });

    L.control.zoom({ position: 'topleft' }).addTo(map);

    cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      chunkedLoading: true
    });
    map.addLayer(cluster);

    // Hide loading shimmer when first tiles load
    map.once('tileload', () => {
      const loading = el('.fj-map-loading');
      if (loading) loading.style.display = 'none';
    });
    // Safety: hide loading after 3 seconds regardless
    setTimeout(() => {
      const loading = el('.fj-map-loading');
      if (loading) loading.style.display = 'none';
      // Force map to recalculate size in case layout shifted
      if (map && map.invalidateSize) map.invalidateSize();
    }, 3000);

    // Also invalidate size when window/layout changes
    window.addEventListener('resize', () => {
      if (map && map.invalidateSize) map.invalidateSize();
    });
    // After 1 second, force one invalidate to ensure tiles load
    setTimeout(() => { if (map && map.invalidateSize) map.invalidateSize(); }, 1000);

    // When user pans, query OSM for that area
    map.on('moveend', () => {
      if (overpassTimer) clearTimeout(overpassTimer);
      overpassTimer = setTimeout(queryOverpass, 600);
    });

    // Auto-recenter button
    el('#fjMapHome')?.addEventListener('click', () => {
      map.setView([31.7767, 35.2345], 5);
    });
    el('#fjMapMe')?.addEventListener('click', () => locateMe(true));
  }

  /* ─── Render markers from current dataset ────────── */
  function renderMarkers(){
    cluster.clearLayers();
    activeMarkers.clear();

    const all = [...PLACES, ...osmPlaces];
    const filtered = all.filter(p => activeCats.has(p.cat));
    const search = (el('#fjSearchInput')?.value || '').trim().toLowerCase();

    const visible = search
      ? filtered.filter(p =>
          (p.name || '').toLowerCase().includes(search) ||
          (p.city || '').toLowerCase().includes(search) ||
          (p.country || '').toLowerCase().includes(search)
        )
      : filtered;

    visible.forEach(p => {
      const cat = CATS.find(c => c.key === p.cat) || CATS[0];
      const fameClass = (p.fame || 0) >= 9 ? 'fame-10' : '';
      const html = `<div class="fj-pin ${fameClass}" style="--cat-color:${cat.color}"><span>${cat.icon}</span></div>`;
      const icon = L.divIcon({ html, className: 'fj-pin-wrap', iconSize: [32, 40], iconAnchor: [16, 40] });
      const marker = L.marker([p.lat, p.lng], { icon, title: p.name });
      marker.bindPopup(buildPopup(p));
      marker.on('click', () => selectPlace(p.id));
      cluster.addLayer(marker);
      activeMarkers.set(p.id, marker);
    });

    renderList(visible);
    el('#fjResultCount').textContent = visible.length.toLocaleString('he-IL');

    // First render: fit map to show all markers worldwide
    if (!window._fjFirstFit && visible.length > 0){
      window._fjFirstFit = true;
      setTimeout(() => {
        try {
          if (map && cluster && cluster.getBounds && cluster.getBounds().isValid()){
            map.fitBounds(cluster.getBounds(), { padding: [40, 40], maxZoom: 4 });
          }
          if (map && map.invalidateSize) map.invalidateSize();
        } catch(_){}
      }, 600);
    }
  }

  /* ─── List rendering ─────────────────────────────── */
  function renderList(places){
    const list = el('#fjList');
    if (!list) return;
    if (!places.length){
      list.innerHTML = `
        <div class="fj-empty">
          <div class="fj-empty-ico">✦</div>
          לא נמצאו מקומות תואמים.<br>
          נסה לשנות את החיפוש או הסינון.
        </div>`;
      return;
    }

    // Sort: famous first, then by distance (if user located), then name
    const sorted = [...places].sort((a, b) => {
      if (userLatLng){
        const da = haversine(userLatLng, [a.lat, a.lng]);
        const db = haversine(userLatLng, [b.lat, b.lng]);
        return da - db;
      }
      return (b.fame || 0) - (a.fame || 0);
    }).slice(0, 200);

    const html = sorted.map(p => {
      const cat = CATS.find(c => c.key === p.cat) || CATS[0];
      const dist = userLatLng ? formatDistance(haversine(userLatLng, [p.lat, p.lng])) : '';
      return `
        <div class="fj-card ${activeId === p.id ? 'active' : ''}" data-id="${p.id}" style="--cat-color:${cat.color};--cat-color-soft:${cat.color}22">
          ${dist ? `<div class="fj-card-distance">${dist}</div>` : ''}
          <div class="fj-card-head">
            <div class="fj-card-icon" style="background:${cat.color}">${cat.icon}</div>
            <h3 class="fj-card-title">${escapeHtml(p.name)}</h3>
          </div>
          <span class="fj-card-tag">${cat.he}</span>
          <div class="fj-card-meta">
            <strong>${escapeHtml(p.city || '')}</strong>
            ${p.country ? `· ${escapeHtml(p.country)}` : ''}
            ${p.comm ? `· ${escapeHtml(p.comm)}` : ''}
          </div>
          ${p.notes ? `<div class="fj-card-notes">${escapeHtml(p.notes)}</div>` : ''}
          <div class="fj-card-actions">
            <a class="fj-act waze" href="https://www.waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes" target="_blank" rel="noopener" data-stop>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c5 0 9 3.5 9 8 0 4-3 6.5-3 8.5 0 .5-.5 1-1.2 1-.7 0-1.3-.5-1.3-1.1 0-.7-.5-1.4-1.5-1.4H10.5c-1 0-1.5.7-1.5 1.4 0 .6-.6 1.1-1.3 1.1S6.5 19 6.5 18.5C6.5 16.5 3 14 3 10c0-4.5 4-8 9-8z"/></svg>
              ניווט
            </a>
            <a class="fj-act" href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener" data-stop>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8z"/></svg>
              מפות
            </a>
            <a class="fj-act whatsapp" href="https://wa.me/?text=${encodeURIComponent(p.name + ' · ' + (p.city || '') + '\n' + (p.notes || '') + '\nניווט: https://www.waze.com/ul?ll=' + p.lat + ',' + p.lng + '&navigate=yes\nמפה: https://www.google.com/maps?q=' + p.lat + ',' + p.lng)}" target="_blank" rel="noopener" data-stop>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>
              WhatsApp
            </a>
            ${p.phone ? `<a class="fj-act" href="tel:${p.phone}" data-stop><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg> חייג</a>` : ''}
          </div>
        </div>`;
    }).join('');
    list.innerHTML = html;
  }

  /* ─── Popup HTML ─────────────────────────────────── */
  function buildPopup(p){
    const cat = CATS.find(c => c.key === p.cat) || CATS[0];
    return `
      <span class="fj-pop-cat">${cat.he}</span>
      <h4 class="fj-pop-name">${escapeHtml(p.name)}</h4>
      <div class="fj-pop-meta">${escapeHtml(p.city || '')}${p.country ? ' · ' + escapeHtml(p.country) : ''}</div>
      ${p.notes ? `<div class="fj-pop-meta">${escapeHtml(p.notes)}</div>` : ''}
      <div class="fj-pop-actions">
        <a class="fj-act waze" href="https://www.waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes" target="_blank" rel="noopener">Waze</a>
        <a class="fj-act" href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener">Maps</a>
      </div>`;
  }

  /* ─── Selection ──────────────────────────────────── */
  function selectPlace(id){
    activeId = id;
    const place = [...PLACES, ...osmPlaces].find(p => p.id === id);
    if (!place) return;
    const marker = activeMarkers.get(id);
    if (marker){
      map.setView([place.lat, place.lng], Math.max(map.getZoom(), 13), { animate: true });
      marker.openPopup();
    }
    els('.fj-card').forEach(c => c.classList.toggle('active', c.dataset.id === id));
    const card = el(`.fj-card[data-id="${id}"]`);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ─── Filters ────────────────────────────────────── */
  function buildFilters(){
    const wrap = el('#fjFilters');
    if (!wrap) return;
    const allBtn = `<button class="fj-chip active" data-cat="__all">
      <span class="fj-chip-ico">✦</span> הכל
      <span class="fj-chip-count">${PLACES.length}</span>
    </button>`;
    const catBtns = CATS.map(c => {
      const count = PLACES.filter(p => p.cat === c.key).length;
      return `<button class="fj-chip" data-cat="${c.key}" style="--cat-color:${c.color}">
        <span class="fj-chip-ico">${c.icon}</span> ${c.he}
        <span class="fj-chip-count">${count}</span>
      </button>`;
    }).join('');
    wrap.innerHTML = allBtn + catBtns;

    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.fj-chip');
      if (!btn) return;
      const cat = btn.dataset.cat;
      if (cat === '__all'){
        activeCats = new Set(CATS.map(c => c.key));
        els('.fj-chip', wrap).forEach(c => c.classList.toggle('active', c.dataset.cat === '__all'));
      } else {
        // toggle single
        if (activeCats.has(cat) && activeCats.size === CATS.length){
          // first click off "all" → activate only this one
          activeCats = new Set([cat]);
        } else if (activeCats.has(cat)){
          activeCats.delete(cat);
          if (activeCats.size === 0) activeCats = new Set(CATS.map(c => c.key));
        } else {
          activeCats.add(cat);
        }
        els('.fj-chip', wrap).forEach(c => {
          if (c.dataset.cat === '__all'){
            c.classList.toggle('active', activeCats.size === CATS.length);
          } else {
            c.classList.toggle('active', activeCats.has(c.dataset.cat));
          }
        });
      }
      renderMarkers();
    });
  }

  /* ─── Search ─────────────────────────────────────── */
  function bindSearch(){
    const input = el('#fjSearchInput');
    if (!input) return;
    let t;
    input.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(renderMarkers, 250);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter'){
        e.preventDefault();
        const q = input.value.trim();
        if (q.length > 1){
          // Try geocoding via Nominatim
          geocode(q);
        }
      }
    });
  }

  function geocode(q){
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    fetch(url, { headers: { 'Accept-Language': 'he,en' } })
      .then(r => r.ok ? r.json() : [])
      .then(arr => {
        if (arr && arr[0]){
          const lat = parseFloat(arr[0].lat);
          const lng = parseFloat(arr[0].lon);
          map.setView([lat, lng], 12, { animate: true });
        }
      })
      .catch(() => {});
  }

  /* ─── Geolocation ────────────────────────────────── */
  function locateMe(zoom){
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLatLng = [pos.coords.latitude, pos.coords.longitude];
        if (zoom) map.setView(userLatLng, 13, { animate: true });
        // Add a "you are here" marker
        if (!window._userMarker){
          const html = `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,.3),0 0 12px rgba(59,130,246,.5);"></div>`;
          window._userMarker = L.marker(userLatLng, {
            icon: L.divIcon({ html, className: '', iconSize:[24,24], iconAnchor:[12,12] }),
            zIndexOffset: 1000
          }).addTo(map);
        } else {
          window._userMarker.setLatLng(userLatLng);
        }
        renderList([...PLACES, ...osmPlaces].filter(p => activeCats.has(p.cat)));
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  /* ─── Overpass: live OSM data ────────────────────── */
  function queryOverpass(){
    if (!map) return;
    if (map.getZoom() < 11) return; // too wide → skip
    const b = map.getBounds();
    const bboxKey = `${b.getSouth().toFixed(2)},${b.getWest().toFixed(2)},${b.getNorth().toFixed(2)},${b.getEast().toFixed(2)}`;
    if (bboxKey === lastBboxKey) return;
    lastBboxKey = bboxKey;

    const bbox = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
    const q = `[out:json][timeout:18];
(
  node["religion"="jewish"]["amenity"="place_of_worship"](${bbox});
  way["religion"="jewish"]["amenity"="place_of_worship"](${bbox});
  node["amenity"="mikveh"](${bbox});
  node["religion"="jewish"]["amenity"="mikveh"](${bbox});
);
out center;`;

    fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: 'data=' + encodeURIComponent(q)
    })
    .then(r => r.ok ? r.json() : { elements: [] })
    .then(data => {
      const found = (data.elements || []).map(e => {
        const lat = e.lat || (e.center && e.center.lat);
        const lng = e.lon || (e.center && e.center.lon);
        if (!lat || !lng) return null;
        const tags = e.tags || {};
        const isMikveh = tags.amenity === 'mikveh';
        const cat = isMikveh ? 'mikveh' : 'synagogue';
        const id = `osm-${e.type}-${e.id}`;
        return {
          id,
          cat,
          name: tags['name:he'] || tags.name || (isMikveh ? 'מקווה' : 'בית כנסת'),
          city: tags['addr:city'] || '',
          country: tags['addr:country'] || '',
          addr: tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}` : '',
          lat, lng,
          phone: tags.phone,
          fame: 4,
          src: 'osm'
        };
      }).filter(Boolean);

      // Merge — replace any existing OSM entries
      const existingIds = new Set(osmPlaces.map(p => p.id));
      const newOnes = found.filter(p => !existingIds.has(p.id));
      osmPlaces = [...osmPlaces, ...newOnes];
      renderMarkers();
    })
    .catch(() => {});
  }

  /* ─── List click delegation ──────────────────────── */
  function bindList(){
    const list = el('#fjList');
    if (!list) return;
    list.addEventListener('click', (e) => {
      // Action button — don't trigger card click
      if (e.target.closest('[data-stop]')) return;
      const shareBtn = e.target.closest('[data-share]');
      if (shareBtn){
        e.preventDefault();
        e.stopPropagation();
        sharePlace(shareBtn.dataset.share);
        return;
      }
      const card = e.target.closest('.fj-card');
      if (card) selectPlace(card.dataset.id);
    });
  }

  function sharePlace(id){
    const p = [...PLACES, ...osmPlaces].find(x => x.id === id);
    if (!p) return;
    const text = `${p.name} · ${p.city || ''}\nניווט: https://www.waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`;
    if (navigator.share){
      navigator.share({ title: p.name, text, url: `https://www.google.com/maps?q=${p.lat},${p.lng}` }).catch(()=>{});
    } else {
      navigator.clipboard?.writeText(text);
      const card = el(`.fj-card[data-id="${id}"]`);
      if (card){
        card.style.boxShadow = '0 0 0 2px var(--gold)';
        setTimeout(() => card.style.boxShadow = '', 800);
      }
    }
  }

  /* ─── Helpers ────────────────────────────────────── */
  function haversine([lat1, lng1], [lat2, lng2]){
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }
  function formatDistance(km){
    if (km < 1) return Math.round(km * 1000) + ' מ׳';
    if (km < 100) return km.toFixed(1) + ' ק"מ';
    return Math.round(km).toLocaleString('he-IL') + ' ק"מ';
  }
  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  /* ─── Mobile list toggle ─────────────────────────── */
  function bindToggle(){
    const btn = el('#fjToggleList');
    const shell = el('#fjShell');
    if (!btn || !shell) return;
    btn.addEventListener('click', () => {
      const collapsed = shell.classList.toggle('fj-list-collapsed');
      btn.textContent = collapsed ? '↑ הצג רשימה' : '↓ הסתר רשימה';
      setTimeout(() => map.invalidateSize(), 250);
    });
  }

  /* ─── Init ───────────────────────────────────────── */
  function init(){
    if (typeof L === 'undefined'){
      console.error('Leaflet not loaded');
      return;
    }
    initMap();
    buildFilters();
    bindSearch();
    bindList();
    bindToggle();
    el('#fjGpsBtn')?.addEventListener('click', () => locateMe(true));
    renderMarkers();

    // Total counter in header
    const totalEl = el('#fjTotalPlaces');
    if (totalEl) totalEl.textContent = PLACES.length.toLocaleString('he-IL');
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
