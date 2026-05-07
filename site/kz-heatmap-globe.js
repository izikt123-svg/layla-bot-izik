/* ============================================================
   KZ HEATMAP GLOBE — live world prayers visualizer
   - Canvas-based world map with halos that pulse where prayers
     are happening right now.
   - Polls /api/heatmap every 12s. Falls back to a curated demo
     dataset (40 cities) when the API isn't deployed yet.
   - Auto-mounts to [data-kz-heatmap] OR creates a card under
     the hero dashboard.
   ============================================================ */
(function(){
  'use strict';

  const FALLBACK_CITIES = [
    {n:'ירושלים',lat:31.78,lng:35.22,w:9},{n:'תל אביב',lat:32.07,lng:34.78,w:7},
    {n:'New York',lat:40.71,lng:-74.00,w:8},{n:'Los Angeles',lat:34.05,lng:-118.24,w:6},
    {n:'Miami',lat:25.77,lng:-80.19,w:5},{n:'Toronto',lat:43.65,lng:-79.38,w:4},
    {n:'London',lat:51.51,lng:-0.13,w:6},{n:'Paris',lat:48.86,lng:2.35,w:5},
    {n:'Antwerp',lat:51.22,lng:4.40,w:4},{n:'Berlin',lat:52.52,lng:13.40,w:4},
    {n:'Vienna',lat:48.21,lng:16.37,w:3},{n:'Roma',lat:41.89,lng:12.48,w:3},
    {n:'Milano',lat:45.46,lng:9.19,w:3},{n:'Madrid',lat:40.42,lng:-3.70,w:2},
    {n:'Moscow',lat:55.75,lng:37.62,w:5},{n:'Istanbul',lat:41.00,lng:28.98,w:3},
    {n:'Buenos Aires',lat:-34.60,lng:-58.38,w:5},{n:'São Paulo',lat:-23.55,lng:-46.63,w:4},
    {n:'Mexico City',lat:19.43,lng:-99.13,w:3},{n:'Cape Town',lat:-33.92,lng:18.42,w:3},
    {n:'Johannesburg',lat:-26.20,lng:28.04,w:3},{n:'Sydney',lat:-33.86,lng:151.20,w:4},
    {n:'Melbourne',lat:-37.81,lng:144.96,w:4},{n:'Tokyo',lat:35.65,lng:139.75,w:2},
    {n:'Hong Kong',lat:22.31,lng:114.16,w:2},{n:'Singapore',lat:1.30,lng:103.82,w:2},
    {n:'Bangkok',lat:13.75,lng:100.50,w:2},{n:'Mumbai',lat:19.07,lng:72.87,w:1},
    {n:'Dubai',lat:25.07,lng:55.13,w:2},{n:'Kathmandu',lat:27.71,lng:85.32,w:2},
    {n:'Bali',lat:-8.65,lng:115.13,w:1},{n:'Cusco',lat:-13.53,lng:-71.96,w:1},
    {n:'Reykjavík',lat:64.14,lng:-21.94,w:1},{n:'Stockholm',lat:59.32,lng:18.06,w:2},
    {n:'Helsinki',lat:60.16,lng:24.93,w:1},{n:'Copenhagen',lat:55.67,lng:12.56,w:2},
    {n:'Amsterdam',lat:52.37,lng:4.90,w:3},{n:'Zürich',lat:47.37,lng:8.54,w:2},
    {n:'Marrakech',lat:31.62,lng:-7.98,w:1},{n:'Tbilisi',lat:41.71,lng:44.82,w:1},
    {n:'Baku',lat:40.40,lng:49.86,w:1}
  ];

  // World coastline as a low-poly path. Compact polygon list (mercator-friendly).
  // We render a simplified silhouette so the file stays small. Coords are [lng, lat].
  const CONTINENTS = [
    // North America (very simplified)
    [[-168,66],[-156,71],[-95,80],[-65,82],[-55,52],[-72,44],[-79,33],[-97,26],[-117,33],[-125,40],[-130,55],[-152,60],[-168,66]],
    // South America
    [[-82,12],[-66,8],[-55,2],[-50,-5],[-37,-8],[-43,-23],[-58,-35],[-71,-53],[-75,-44],[-80,-20],[-82,12]],
    // Europe + W Russia
    [[-10,36],[5,36],[15,38],[28,36],[40,42],[60,52],[60,72],[30,71],[10,60],[-9,52],[-10,36]],
    // Africa
    [[-17,14],[-10,28],[15,32],[35,32],[44,12],[51,11],[40,-5],[40,-28],[18,-35],[10,-15],[-5,5],[-17,14]],
    // Asia (simplified)
    [[60,30],[75,30],[88,28],[100,22],[110,18],[122,30],[140,38],[150,55],[170,68],[140,72],[100,72],[80,72],[60,68],[60,52],[60,30]],
    // SE Asia / Indonesia
    [[95,5],[110,-3],[125,-5],[140,-8],[145,-2],[130,2],[112,5],[100,8],[95,5]],
    // Australia
    [[112,-20],[130,-12],[143,-12],[152,-25],[145,-38],[120,-36],[112,-20]]
  ];

  function projeq(lng, lat, w, h){
    // Equirectangular projection (good enough for a stylized banner)
    const x = (lng + 180) / 360 * w;
    const y = (90 - lat) / 180 * h;
    return [x, y];
  }

  function build(){
    if (document.querySelector('.kz-heatmap-card')) return;
    const card = document.createElement('section');
    card.className = 'kz-heatmap-card card';
    card.setAttribute('aria-label', 'מפת תפילות חיה בעולם');
    card.innerHTML = `
      <div class="mini-title">
        <span class="mini-ornament">🌍</span>
        <span>תפילות חיות ברחבי העולם</span>
        <span class="kz-heatmap-pill"><i></i><span>חי</span></span>
      </div>
      <div class="kz-heatmap-shell">
        <canvas class="kz-heatmap-canvas" width="900" height="450" aria-hidden="true"></canvas>
        <div class="kz-heatmap-stats">
          <div><b data-kz-counter="active">—</b> מתפללים<small>עכשיו</small></div>
          <div><b data-kz-heatmap="cities">—</b> ערים<small>פעילות</small></div>
        </div>
      </div>`;

    const mount = document.querySelector('[data-kz-heatmap]');
    if (mount){ mount.appendChild(card); }
    else {
      const hero = document.querySelector('.hero');
      if (hero?.parentNode) hero.parentNode.insertBefore(card, hero.nextSibling);
      else document.body.appendChild(card);
    }

    setupRenderer(card);
  }

  function setupRenderer(card){
    const canvas = card.querySelector('.kz-heatmap-canvas');
    const ctx = canvas.getContext('2d');
    let cities = FALLBACK_CITIES.slice();
    const halos = []; // { x, y, r, alpha, w }

    function resize(){
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width  = Math.max(640, Math.floor(rect.width  * dpr));
      canvas.height = Math.max(320, Math.floor(rect.height * dpr));
    }
    resize();
    window.addEventListener('resize', resize);

    function drawMap(){
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Subtle grid
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = '#d4b07a';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30){
        const [_, y] = projeq(0, lat, W, H);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let lng = -150; lng <= 150; lng += 30){
        const [x] = projeq(lng, 0, W, H);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      ctx.restore();

      // Continents (filled silhouette)
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = 'rgba(212,176,122,0.18)';
      ctx.strokeStyle = 'rgba(241,213,151,0.55)';
      ctx.lineWidth = 1.2;
      CONTINENTS.forEach(poly => {
        ctx.beginPath();
        poly.forEach(([lng,lat], i) => {
          const [x,y] = projeq(lng, lat, W, H);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    }

    const trails = []; // { from, to, t, dur }
    function spawnTrail(){
      if (cities.length < 2) return;
      // Always anchor one end in Israel for visual symbolism
      const israelHubs = cities.filter(c => c.lat > 29 && c.lat < 34 && c.lng > 34 && c.lng < 36);
      const a = israelHubs.length ? israelHubs[Math.floor(Math.random() * israelHubs.length)]
                                  : cities[Math.floor(Math.random() * cities.length)];
      let b = a;
      while (b === a) b = cities[Math.floor(Math.random() * cities.length)];
      const dur = 1800 + Math.random() * 1500;
      trails.push({ from: a, to: b, start: performance.now(), dur });
      if (trails.length > 14) trails.shift();
    }

    function drawTrails(now){
      const W = canvas.width, H = canvas.height;
      for (let i = trails.length - 1; i >= 0; i--){
        const tr = trails[i];
        const t = (now - tr.start) / tr.dur;
        if (t >= 1){ trails.splice(i, 1); continue; }
        const [x1, y1] = projeq(tr.from.lng, tr.from.lat, W, H);
        const [x2, y2] = projeq(tr.to.lng,   tr.to.lat,   W, H);
        // Curved arc — control point above the midpoint
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.18 - 24;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineWidth = 1.6;
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0,   'rgba(241,213,151,0)');
        grad.addColorStop(.5,  `rgba(241,213,151,${0.55 * (1 - Math.abs(t - 0.5) * 2)})`);
        grad.addColorStop(1,   'rgba(212,176,122,0)');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(mx, my, x2, y2);
        ctx.stroke();

        // Travelling pulse
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const px = (1 - ease) * (1 - ease) * x1 + 2 * (1 - ease) * ease * mx + ease * ease * x2;
        const py = (1 - ease) * (1 - ease) * y1 + 2 * (1 - ease) * ease * my + ease * ease * y2;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,247,209,0.95)';
        ctx.fill();
        ctx.restore();
      }
    }

    let lastTrailAt = 0;
    function maybeSpawnTrail(now){
      if (now - lastTrailAt > 800 + Math.random() * 1400){
        spawnTrail();
        lastTrailAt = now;
      }
    }
    function spawnHalos(){
      const W = canvas.width, H = canvas.height;
      cities.forEach(c => {
        if (Math.random() < (0.05 + (c.w || 1) * 0.012)){
          const [x, y] = projeq(c.lng, c.lat, W, H);
          halos.push({ x, y, r: 2, alpha: 0.9, w: c.w || 1 });
        }
      });
    }

    function drawHalos(){
      const W = canvas.width;
      for (let i = halos.length - 1; i >= 0; i--){
        const h = halos[i];
        ctx.save();
        ctx.globalAlpha = Math.max(0, h.alpha);
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r);
        grad.addColorStop(0,   'rgba(241,213,151,0.85)');
        grad.addColorStop(0.4, 'rgba(212,176,122,0.45)');
        grad.addColorStop(1,   'rgba(212,176,122,0)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        h.r += 0.9 + h.w * 0.18;
        h.alpha -= 0.012;
        if (h.alpha <= 0 || h.r > Math.min(canvas.width, canvas.height) * 0.18){
          halos.splice(i, 1);
        }
      }
    }

    function drawCityDots(){
      const W = canvas.width, H = canvas.height;
      cities.forEach(c => {
        const [x, y] = projeq(c.lng, c.lat, W, H);
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1.5, (c.w || 1) * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = '#f1d597';
        ctx.fill();
      });
    }

    function loop(now){
      drawMap();
      maybeSpawnTrail(now || performance.now());
      drawTrails(now || performance.now());
      spawnHalos();
      drawHalos();
      drawCityDots();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Update counters
    const cityCountEl = card.querySelector('[data-kz-heatmap="cities"]');
    if (cityCountEl) cityCountEl.textContent = cities.length;

    async function refresh(){
      try {
        const r = await fetch('/api/heatmap', { cache: 'no-store' });
        if (!r.ok) return;
        const data = await r.json();
        if (Array.isArray(data.cities) && data.cities.length){
          cities = data.cities;
          if (cityCountEl) cityCountEl.textContent = cities.length;
        }
      } catch {}
    }
    refresh();
    setInterval(refresh, 12_000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once: true });
  else build();
})();
