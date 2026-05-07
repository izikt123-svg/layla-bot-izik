/* ============================================================
   KZ CANDLES MAP — live world map of burning Shabbat candles
   - Uses /api/candles for the data (with lat/lng if available)
   - Falls back to city centroids via geonameid → coords map
   - Pulsing dots, markers refresh every 20s
   ============================================================ */
(function(){
  'use strict';

  // City coords by Hebcal geonameid (fallback when no lat/lng on the row)
  const CITY_COORDS = {
    '281184':[31.7683,35.2137], '293397':[32.0853,34.7818], '294801':[32.7940,34.9896],
    '295530':[31.2518,34.7913], '293100':[32.9650,35.4977], '295277':[29.5577,34.9519],
    '5128581':[40.7128,-74.0060], '5368361':[34.0522,-118.2437], '4164138':[25.7617,-80.1918],
    '6167865':[43.6532,-79.3832], '2643743':[51.5074,-0.1278], '2988507':[48.8566,2.3522],
    '2950159':[52.5200,13.4050], '3169070':[41.9028,12.4964], '3117735':[40.4168,-3.7038],
    '2759794':[52.3676,4.9041], '3435910':[-34.6037,-58.3816], '3448439':[-23.5505,-46.6333],
    '2158177':[-37.8136,144.9631], '2147714':[-33.8688,151.2093], '993800':[-26.2041,28.0473],
    '3369157':[-33.9249,18.4241], '1850147':[35.6762,139.6503], '1880252':[1.3521,103.8198],
    '1609350':[13.7563,100.5018]
  };

  function coordOf(c){
    if (Number.isFinite(c.lat) && Number.isFinite(c.lng)) return [c.lat, c.lng];
    const k = c.cityId || c.city_id;
    if (k && CITY_COORDS[k]) return CITY_COORDS[k];
    return null;
  }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  let map, layer, topIds = new Set();

  function init(){
    if (!window.L) return setTimeout(init, 100);
    map = L.map('cmMap', { worldCopyJump: true }).setView([31.78, 35.22], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains:'abcd', maxZoom: 18
    }).addTo(map);
    layer = L.layerGroup().addTo(map);
    refresh();
    setInterval(refresh, 20_000);
  }

  async function refresh(){
    const [allRes, topRes] = await Promise.all([
      fetch('/api/candles?live=1', { cache: 'no-store' }).catch(() => null),
      fetch('/api/candles?top=1',  { cache: 'no-store' }).catch(() => null)
    ]);
    let candles = [], top = [];
    try { if (allRes && allRes.ok) candles = (await allRes.json()).candles || []; } catch {}
    try { if (topRes && topRes.ok) top = (await topRes.json()).candles || []; } catch {}

    topIds = new Set(top.map(t => t.id));
    document.getElementById('cmCount').textContent = candles.length;
    layer.clearLayers();

    candles.forEach(c => {
      const coord = coordOf(c);
      if (!coord) return;
      const isTop = topIds.has(c.id);
      const ic = L.divIcon({
        className: '',
        html: `<div class="cm-marker ${isTop ? 'is-top' : ''}"></div>`,
        iconSize: [16,16], iconAnchor:[8,8]
      });
      const popup = `<div class="cm-popup">
        <b>${escapeHtml(c.name || 'אנונימית')}</b>
        <small>${escapeHtml(c.city || '')}</small>
        ${c.prayer ? `<div class="pr">"${escapeHtml(c.prayer)}"</div>` : ''}
      </div>`;
      L.marker(coord, { icon: ic }).bindPopup(popup).addTo(layer);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
