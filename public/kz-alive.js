/* ============================================================
   KZ ALIVE — Living, breathing, time-aware experience
   Loads after kz-elevate.js. Does NOT replace anything — adds.
   ============================================================ */
(function(){
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = matchMedia('(pointer: coarse)').matches;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* ─────────────────────────────────────────────────────────
     1. TIME OF DAY DETECTION & APPLICATION
     ───────────────────────────────────────────────────────── */
  function detectTOD(){
    const h = new Date().getHours();
    if (h >= 4  && h < 6 ) return 'dawn';
    if (h >= 6  && h < 11) return 'morning';
    if (h >= 11 && h < 14) return 'noon';
    if (h >= 14 && h < 17) return 'afternoon';
    if (h >= 17 && h < 20) return 'evening';
    return 'night';
  }
  function applyTOD(){
    const tod = detectTOD();
    document.documentElement.dataset.tod = tod;
    // Insert a tiny badge in topbar if room
    const actions = $('.top-actions');
    if (actions && !$('.kz-tod-badge')){
      const map = { dawn:'שחר', morning:'בוקר', noon:'צהריים', afternoon:'אחה״צ', evening:'ערב', night:'לילה' };
      const badge = document.createElement('span');
      badge.className = 'kz-tod-badge';
      badge.title = 'הגוון של האתר משתנה לפי שעה ביממה';
      badge.innerHTML = `<span class="kz-tod-icon" aria-hidden="true"></span>${map[tod]}`;
      actions.insertBefore(badge, actions.firstChild);
    }
  }

  /* ─────────────────────────────────────────────────────────
     2. FLOATING HEBREW LETTERS
     ───────────────────────────────────────────────────────── */
  const HEBREW = ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','ר','ש','ת','ם','ן','ץ','ף','ך'];
  function spawnLetters(){
    if (reduceMotion) return;
    const hero = $('.hero');
    if (!hero) return;
    const field = document.createElement('div');
    field.className = 'kz-letter-field';
    field.setAttribute('aria-hidden', 'true');
    hero.appendChild(field);

    const count = isCoarse ? 8 : 16;
    for (let i = 0; i < count; i++){
      const span = document.createElement('span');
      span.className = 'kz-letter';
      span.textContent = HEBREW[Math.floor(Math.random() * HEBREW.length)];
      const size = 16 + Math.random() * 22;
      const dx = (Math.random() - 0.5) * 200;
      const dur = 14 + Math.random() * 14;
      const delay = Math.random() * 25;
      const opacity = 0.18 + Math.random() * 0.4;
      span.style.cssText = `
        left: ${Math.random() * 100}%;
        --ls: ${size}px;
        --ldx: ${dx}px;
        --ld: ${dur}s;
        --lDelay: ${delay}s;
        --lOpacity: ${opacity};
        animation-delay: ${delay}s;
      `;
      field.appendChild(span);
    }
  }

  /* ─────────────────────────────────────────────────────────
     3. FLOATING MAGEN DAVID — mouse tracking
     ───────────────────────────────────────────────────────── */
  function floatingStar(){
    if (reduceMotion || isCoarse) return;
    const hero = $('.hero');
    if (!hero) return;
    const wrap = document.createElement('div');
    wrap.className = 'kz-floating-star';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kzStarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f1d597"/>
          <stop offset="50%" stop-color="#c6a054"/>
          <stop offset="100%" stop-color="#7a5a23"/>
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#kzStarGrad)" stroke-width="2.4" stroke-linejoin="round">
        <polygon points="50,8 70,42 30,42"/>
        <polygon points="50,92 70,58 30,58"/>
      </g>
    </svg>`;
    hero.appendChild(wrap);

    let raf = null;
    hero.addEventListener('mousemove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        wrap.style.setProperty('--starY', (cx * 30) + 'deg');
        wrap.style.setProperty('--starX', (-cy * 30) + 'deg');
        raf = null;
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     4. CMD+K GLOBAL SEARCH OVERLAY
     ───────────────────────────────────────────────────────── */
  const PAGES = [
    { title:'בית', sub:'דף הבית · בקש תפילה · פיד', href:'/index.html', icon:'🏠', group:'עמודים' },
    { title:'מפת היהדות העולמית', sub:'בתי חב״ד · בתי כנסת · ניווט Waze', href:'/find-jewish.html', icon:'🌍', group:'עמודים' },
    { title:'כל זכות יהודי', sub:'בית האחדות העולמי', href:'/unity.html', icon:'✡', group:'עמודים' },
    { title:'ספר נשמות', sub:'יארצייט · זיכרון עולמי', href:'/memorial.html', icon:'🕯', group:'עמודים' },
    { title:'אירועי חיים', sub:'בריתות · בר מצווה · חתונות', href:'/life-events.html', icon:'💍', group:'עמודים' },
    { title:'מנהגים ועדות', sub:'נוסחים ומנהגי כל העדות', href:'/customs.html', icon:'📜', group:'עמודים' },
    { title:'פינת ילדים', sub:'משחקים · תפילות · סיפורים', href:'/kids.html', icon:'🎈', group:'עמודים' },
    { title:'שאל רב', sub:'שאלת רב לפי זרם ועדה', href:'/ask-rabbi.html', icon:'👨‍🏫', group:'עמודים' },
    { title:'לימוד יומי', sub:'דף יומי · משנה · הלכה · פרשה', href:'/learning.html', icon:'📖', group:'עמודים' },
    { title:'חסד והתנדבות', sub:'גמ״חים · בקשות עזרה', href:'/chesed.html', icon:'🤝', group:'עמודים' },
    { title:'עברית יהודית', sub:'מילון מונחים', href:'/dictionary.html', icon:'🔤', group:'עמודים' },
    { title:'מה אומרים כש…', sub:'נוסחי תפילה לכל מצב', href:'/what-to-say.html', icon:'💬', group:'עמודים' },
    { title:'עלייה ונסיעה', sub:'יהודים בדרכים', href:'/aliyah-traveler.html', icon:'✈️', group:'עמודים' },
    { title:'חוברת הדרכה', sub:'מדריך מלא לאתר · PDF', href:'/handbook.html', icon:'📕', group:'עמודים' },
    { title:'אדמין', sub:'ניהול האתר', href:'/admin.html', icon:'⚙️', group:'עמודים' },

    { title:'בקש תפילה', sub:'טופס בקשה אנונימי', href:'/index.html#create', icon:'✦', group:'פעולות' },
    { title:'התחל להתפלל', sub:'הפיד הכללי', href:'/index.html#feed', icon:'🕯', group:'פעולות' },
    { title:'הבקשות שלי', sub:'אזור אישי', href:'/index.html#me', icon:'👤', group:'פעולות' },
    { title:'מאגר תפילות', sub:'נוסחים לפי קטגוריה', href:'/index.html#library', icon:'📚', group:'פעולות' },
    { title:'אודות', sub:'על מרכז התפילה', href:'/index.html#about', icon:'ℹ️', group:'פעולות' },
    { title:'צור קשר', sub:'נשמח לשמוע', href:'/index.html#contact', icon:'📧', group:'פעולות' }
  ];

  function buildCmdK(){
    if ($('#kzCmdk')) return;
    const overlay = document.createElement('div');
    overlay.className = 'kz-cmdk-overlay';
    overlay.id = 'kzCmdk';
    overlay.innerHTML = `
      <div class="kz-cmdk-panel" role="dialog" aria-label="חיפוש מהיר">
        <div class="kz-cmdk-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input class="kz-cmdk-input" id="kzCmdkInput" placeholder="חפש כל מה שיש באתר…" autofocus />
          <span class="kz-cmdk-shortcut">ESC</span>
        </div>
        <div class="kz-cmdk-results" id="kzCmdkResults"></div>
        <div class="kz-cmdk-footer">
          <span class="kz-cmdk-key"><kbd>↑</kbd><kbd>↓</kbd> לנווט</span>
          <span class="kz-cmdk-key"><kbd>Enter</kbd> לפתוח</span>
          <span class="kz-cmdk-key"><kbd>Esc</kbd> לסגור</span>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const input = $('#kzCmdkInput', overlay);
    const results = $('#kzCmdkResults', overlay);
    let activeIdx = 0;
    let visibleItems = [];

    function search(q){
      q = (q || '').trim().toLowerCase();
      const places = window.KZ_JEWISH_PLACES || [];
      const cats = window.KZ_PLACE_CATEGORIES || [];

      const allEntries = [
        ...PAGES,
        ...places.map(p => {
          const cat = cats.find(c => c.key === p.cat);
          return {
            title: p.name,
            sub: `${(cat && cat.he) || ''} · ${p.city || ''} ${p.country ? '· ' + p.country : ''}`,
            href: `/find-jewish.html#${p.id}`,
            icon: (cat && cat.icon) || '✦',
            group: 'מקומות',
            color: (cat && cat.color)
          };
        })
      ];

      const filtered = q
        ? allEntries.filter(e =>
            e.title.toLowerCase().includes(q) ||
            (e.sub || '').toLowerCase().includes(q)
          )
        : allEntries.filter(e => e.group === 'עמודים' || e.group === 'פעולות');

      const limited = filtered.slice(0, 30);
      visibleItems = limited;

      if (!limited.length){
        results.innerHTML = `
          <div class="kz-cmdk-empty">
            <div class="kz-cmdk-empty-ico">✦</div>
            לא נמצאו תוצאות עבור "${escapeHtml(q)}"
          </div>`;
        return;
      }

      const groups = {};
      limited.forEach(e => {
        groups[e.group] = groups[e.group] || [];
        groups[e.group].push(e);
      });

      let html = '';
      let idx = 0;
      Object.keys(groups).forEach(g => {
        html += `<div class="kz-cmdk-group">${g}</div>`;
        groups[g].forEach(e => {
          html += `<a class="kz-cmdk-item ${idx === activeIdx ? 'kz-active' : ''}" href="${e.href}" data-idx="${idx}" style="${e.color ? `--cat-color:${e.color}33` : ''}">
            <span class="kz-cmdk-item-icon" style="${e.color ? `background:${e.color}22;color:${e.color}` : ''}">${e.icon || '✦'}</span>
            <span class="kz-cmdk-item-body">
              <div class="kz-cmdk-item-title">${escapeHtml(e.title)}</div>
              <div class="kz-cmdk-item-sub">${escapeHtml(e.sub || '')}</div>
            </span>
            <span class="kz-cmdk-item-arrow">←</span>
          </a>`;
          idx++;
        });
      });
      results.innerHTML = html;
    }

    function setActive(i){
      activeIdx = Math.max(0, Math.min(visibleItems.length - 1, i));
      $$('.kz-cmdk-item', results).forEach((el, k) => {
        el.classList.toggle('kz-active', k === activeIdx);
        if (k === activeIdx) el.scrollIntoView({ block: 'nearest' });
      });
    }

    input.addEventListener('input', () => { activeIdx = 0; search(input.value); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown'){ e.preventDefault(); setActive(activeIdx + 1); }
      else if (e.key === 'ArrowUp'){ e.preventDefault(); setActive(activeIdx - 1); }
      else if (e.key === 'Enter'){
        e.preventDefault();
        const item = visibleItems[activeIdx];
        if (item) location.href = item.href;
      }
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeCmdK();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')){
        e.preventDefault();
        closeCmdK();
      }
      // Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')){
        e.preventDefault();
        toggleCmdK();
      }
    });

    // Initial render
    search('');
  }
  function openCmdK(){
    buildCmdK();
    const overlay = $('#kzCmdk');
    if (overlay){
      overlay.classList.add('is-open');
      setTimeout(() => $('#kzCmdkInput')?.focus(), 50);
    }
  }
  function closeCmdK(){
    $('#kzCmdk')?.classList.remove('is-open');
  }
  function toggleCmdK(){
    const o = $('#kzCmdk');
    if (o && o.classList.contains('is-open')) closeCmdK();
    else openCmdK();
  }

  /* Inject visible search trigger button if room */
  function injectCmdKTrigger(){
    const actions = $('.top-actions');
    if (!actions || $('.kz-cmdk-trigger')) return;
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
    const btn = document.createElement('button');
    btn.className = 'kz-cmdk-trigger';
    btn.type = 'button';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <span class="kz-cmdk-trigger-text">חיפוש מהיר…</span>
      <span class="kz-cmdk-shortcut">${isMac ? '⌘K' : 'Ctrl K'}</span>`;
    btn.addEventListener('click', openCmdK);
    actions.insertBefore(btn, actions.firstChild);
  }

  /* ─────────────────────────────────────────────────────────
     5. LIGHT BURST (confetti) on prayer submit
     ───────────────────────────────────────────────────────── */
  function lightBurst(x, y){
    if (reduceMotion) return;
    const layer = document.createElement('div');
    layer.className = 'kz-burst';
    document.body.appendChild(layer);
    const N = 32;
    for (let i = 0; i < N; i++){
      const p = document.createElement('div');
      p.className = 'kz-burst-particle';
      const angle = (i / N) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 100 + Math.random() * 220;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 100;
      const dur = 1.2 + Math.random() * 0.8;
      p.style.cssText = `
        left: ${x}px; top: ${y}px;
        --bdx: ${dx}px;
        --bdy: ${dy}px;
        --bd: ${dur}s;
      `;
      layer.appendChild(p);
    }
    setTimeout(() => layer.remove(), 2200);
  }

  function bindPrayerBurst(){
    const btn = $('#submitPrayer');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const r = btn.getBoundingClientRect();
      lightBurst(r.left + r.width / 2, r.top + r.height / 2);
    });
  }

  /* ─────────────────────────────────────────────────────────
     6. COMPASS — device orientation toward Jerusalem
     ───────────────────────────────────────────────────────── */
  function bearingToJerusalem(lat, lng){
    const JLAT = 31.7767, JLNG = 35.2345;
    const φ1 = lat * Math.PI / 180;
    const φ2 = JLAT * Math.PI / 180;
    const Δλ = (JLNG - lng) * Math.PI / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
  }

  function setupCompass(){
    const compass = $('.compass');
    if (!compass) return;
    let bearing = 0;
    let heading = 0;

    function update(){
      const angle = bearing - heading;
      compass.style.setProperty('--cAngle', angle + 'deg');
    }

    // Add info badge
    if (!$('.compass-info', compass)){
      const info = document.createElement('div');
      info.className = 'compass-info';
      info.id = 'kzCompassInfo';
      info.textContent = 'מאתר…';
      compass.appendChild(info);
    }
    const infoEl = $('.compass-info', compass);

    // Get user location for bearing
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition((pos) => {
        bearing = bearingToJerusalem(pos.coords.latitude, pos.coords.longitude);
        const dist = haversine(pos.coords.latitude, pos.coords.longitude, 31.7767, 35.2345);
        if (infoEl) infoEl.textContent = `${dist.toLocaleString('he-IL', {maximumFractionDigits:0})} ק"מ לירושלים`;
        update();
      }, () => {
        // Default: from Tel Aviv
        bearing = bearingToJerusalem(32.0853, 34.7818);
        if (infoEl) infoEl.textContent = 'הפנה את ההתקן';
        update();
      });
    }

    // Device orientation for live heading (mobile)
    const handler = (e) => {
      if (e.alpha != null){
        heading = e.alpha;
        update();
      }
    };
    if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission){
      // iOS — needs gesture
      compass.addEventListener('click', async () => {
        try {
          const r = await DeviceOrientationEvent.requestPermission();
          if (r === 'granted'){ window.addEventListener('deviceorientation', handler); }
        } catch(_){}
      }, { once: true });
    } else {
      window.addEventListener('deviceorientation', handler);
    }
  }

  function haversine(lat1, lng1, lat2, lng2){
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  /* ─────────────────────────────────────────────────────────
     7. HOMEPAGE WORLD MAP TEASER
     ───────────────────────────────────────────────────────── */
  function buildWorldSection(){
    if ($('.kz-world-section')) return;
    if (typeof L === 'undefined') return; // Leaflet not loaded → bail

    const places = window.KZ_JEWISH_PLACES || [];
    const cats   = window.KZ_PLACE_CATEGORIES || [];

    const counts = {};
    cats.forEach(c => counts[c.key] = places.filter(p => p.cat === c.key).length);

    // Find a section to insert before — after #stories ideally, or after #about
    const anchor = $('#stories') || $('#about') || $('main');
    if (!anchor) return;

    const sec = document.createElement('section');
    sec.className = 'kz-world-section';
    sec.id = 'world-map';
    sec.innerHTML = `
      <div class="kz-world-head">
        <span class="kz-world-eyebrow">חי · מתעדכן בזמן אמת</span>
        <h2 class="kz-world-h2">כל יהודי בעולם — <span>מקום אחד</span></h2>
        <p class="kz-world-lead">
          בתי חב״ד, בתי כנסת, מקוואות, מסעדות כשרות, קברי צדיקים — בכל יבשת.
          חיפוש לפי עיר, מיקום GPS חי, וכפתור Waze לכל כתובת.
        </p>
      </div>
      <div class="kz-world-grid">
        <div class="kz-world-map">
          <div id="kzWorldMiniMap"></div>
          <div class="kz-world-map-overlay">
            <strong>${places.length}+ מקומות</strong>
            במאגר אצור · אלפי בתי כנסת ומקוואות נוספים מחיים מ־OSM
            <a class="kz-world-map-overlay-cta" href="/find-jewish.html">פתח את המפה המלאה ←</a>
          </div>
        </div>
        <div class="kz-world-stats">
          ${cats.map(c => `
            <div class="kz-world-stat" style="--cat-color:${c.color}">
              <span class="kz-world-stat-icon">${c.icon}</span>
              <div class="kz-world-stat-num">${counts[c.key].toLocaleString('he-IL')}</div>
              <div class="kz-world-stat-label">${c.he}</div>
            </div>`).join('')}
        </div>
      </div>`;
    anchor.parentNode.insertBefore(sec, anchor);

    // Init mini map (read-only, simplified)
    setTimeout(() => {
      const m = L.map('kzWorldMiniMap', {
        center: [25, 15],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: !isCoarse
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
        maxZoom: 8
      }).addTo(m);

      // Add famous places only (fame >= 8) for a clean, beautiful preview
      const featured = places.filter(p => (p.fame || 0) >= 8);
      featured.forEach(p => {
        const cat = cats.find(c => c.key === p.cat) || cats[0];
        const html = `<div style="width:14px;height:14px;border-radius:50%;background:${cat.color};border:2px solid #fff;box-shadow:0 0 8px ${cat.color},0 0 16px ${cat.color}80;"></div>`;
        L.marker([p.lat, p.lng], {
          icon: L.divIcon({ html, className:'', iconSize:[18,18], iconAnchor:[9,9] }),
          title: p.name
        }).addTo(m).bindTooltip(p.name, { direction:'top' });
      });

      // Subtle auto-rotation across continents — gives life
      const positions = [
        [25, 15], [40, -90], [-15, -55], [50, 10], [25, 80], [-25, 130]
      ];
      let i = 0;
      if (!reduceMotion){
        setInterval(() => {
          i = (i + 1) % positions.length;
          m.flyTo(positions[i], 3, { duration: 6, easeLinearity: .25 });
        }, 9000);
      }
    }, 100);
  }

  /* ─────────────────────────────────────────────────────────
     8. PWA INSTALL BANNER
     ───────────────────────────────────────────────────────── */
  function setupInstallBanner(){
    let deferredPrompt = null;
    const dismissed = localStorage.getItem('kz-install-dismissed');
    if (dismissed) return;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showBanner();
    });

    function showBanner(){
      if ($('.kz-install-banner')) return;
      const b = document.createElement('div');
      b.className = 'kz-install-banner';
      b.innerHTML = `
        <div class="kz-install-icon">✦</div>
        <div class="kz-install-text">
          <strong>התקן את מרכז התפילה</strong>
          <small>גישה מהירה גם בלי דפדפן · עובד אופליין</small>
        </div>
        <div class="kz-install-actions">
          <button class="kz-install-btn primary" id="kzInstallYes">התקן</button>
          <button class="kz-install-btn ghost" id="kzInstallNo">לא תודה</button>
        </div>`;
      document.body.appendChild(b);
      requestAnimationFrame(() => b.classList.add('is-visible'));
      $('#kzInstallYes').addEventListener('click', async () => {
        if (deferredPrompt){
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
        }
        b.remove();
      });
      $('#kzInstallNo').addEventListener('click', () => {
        localStorage.setItem('kz-install-dismissed', '1');
        b.remove();
      });
    }
  }

  /* ─────────────────────────────────────────────────────────
     9. UTILITIES
     ───────────────────────────────────────────────────────── */
  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  /* ─────────────────────────────────────────────────────────
     10. LIVE PRAYER STREAM — ticker comes alive
     ───────────────────────────────────────────────────────── */
  const STREAM_NAMES_M = ['פלוני בן פלונית','אבא של מ׳','איש מירושלים','בן משפחה רחוקה','חבר קהילה','איש מתפלל'];
  const STREAM_NAMES_F = ['פלונית בת פלונית','אמא של ר׳','אישה מצפת','בת משפחה רחוקה','חברה קהילה','אישה מתפללת'];
  const STREAM_VERBS = [
    { v: 'ביקש תפילה ל', topics: ['רפואה','פרנסה','זוגיות','שלום בית','ילדים','הצלחה','הודיה','ישועה'] },
    { v: 'הצטרף לתפילה ל', topics: ['רפואת חולה','שלום הצבא','עם ישראל','משפחה','חוזרים בתשובה'] },
    { v: 'הדליק נר ל', topics: ['עילוי נשמה','רפואה שלמה','זכות הצלחה','שמירה'] },
    { v: 'התחיל פרק תהלים ל', topics: ['רפואה','עם ישראל','החיילים','ירושלים','שמחת חתן וכלה'] },
    { v: 'סיים פרק', topics: ['א׳','י״ט','כ״ג','כ״ז','ק״ז','ק״כ','ק״נ'] }
  ];
  const STREAM_PLACES = ['ירושלים','בני ברק','תל אביב','ניו יורק','ברוקלין','פריז','לונדון','מלבורן','מוסקבה','מומבאי','קזבלנקה','בואנוס איירס','אומן'];

  function genStreamLine(){
    const female = Math.random() > 0.5;
    const name = (female ? STREAM_NAMES_F : STREAM_NAMES_M)[Math.floor(Math.random() * 6)];
    const verb = STREAM_VERBS[Math.floor(Math.random() * STREAM_VERBS.length)];
    const topic = verb.topics[Math.floor(Math.random() * verb.topics.length)];
    const place = STREAM_PLACES[Math.floor(Math.random() * STREAM_PLACES.length)];
    return { text: `${name} מ${place} ${verb.v}${topic}`, time: 'כעת' };
  }

  function liveTickerStream(){
    const ul = $('#dashTicker');
    if (!ul) return;
    setInterval(() => {
      if (reduceMotion) return;
      const line = genStreamLine();
      // Build new li
      const li = document.createElement('li');
      li.style.cssText = 'opacity:0;transform:translateX(-12px);transition:opacity .4s,transform .4s';
      li.innerHTML = `<span class="t-dot"></span><span class="t-text">${line.text}</span><span class="t-time">${line.time}</span>`;
      ul.insertBefore(li, ul.firstChild);
      requestAnimationFrame(() => {
        li.style.opacity = '1';
        li.style.transform = 'translateX(0)';
      });
      // Trim to 6 items
      while (ul.children.length > 6){
        const last = ul.lastElementChild;
        last.style.opacity = '0';
        setTimeout(() => last.remove(), 400);
        break;
      }
      // Update relative time on others
      Array.from(ul.children).forEach((el, i) => {
        const t = el.querySelector('.t-time');
        if (t && i > 0){
          if (i === 1) t.textContent = 'לפני שניות';
          else if (i === 2) t.textContent = 'לפני דקה';
          else if (i === 3) t.textContent = 'לפני 3 דק׳';
          else t.textContent = `לפני ${i * 2} דק׳`;
        }
      });
    }, 4500);
  }

  /* ─────────────────────────────────────────────────────────
     11. FAMILY ROOM CTA (homepage only)
     ───────────────────────────────────────────────────────── */
  function injectFamilyRoomCTA(){
    if ($('.kz-family-cta')) return;
    // Find anchor — after #me (personal area) or before #stories
    const anchor = $('#me') || $('#stories') || $('main');
    if (!anchor) return;

    const sec = document.createElement('section');
    sec.className = 'kz-family-cta';
    sec.id = 'family-cta';
    sec.innerHTML = `
      <div class="kz-family-cta-inner">
        <div class="kz-family-cta-text">
          <span class="kz-world-eyebrow">חדש · המקום הקדוש של המשפחה</span>
          <h2 class="kz-world-h2">חדר תפילה <span>למשפחה שלך</span></h2>
          <p class="kz-family-cta-lead">
            המקום שבו המשפחה מתפללת יחד — גם כשרחוקים אחד מהשני.
            תפילות פרטיות, יארצייט, תהלים מחולק, נרות זיכרון, רגעי חיים. דור לדור.
          </p>
          <div class="kz-family-cta-feats">
            <div><span>🕯</span> תפילות משפחתיות פרטיות</div>
            <div><span>📖</span> תהלים מחולק לכל המשפחה</div>
            <div><span>📅</span> יארצייט אוטומטי בלוח עברי</div>
            <div><span>✦</span> רגעי חיים: בריתות, חתונות, שמחות</div>
          </div>
          <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap">
            <a class="dash-cta primary" href="/family-room.html">
              <div class="dash-cta-ico">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>
              </div>
              <div class="dash-cta-text">
                <span class="dash-cta-title">פתח את חדר המשפחה</span>
                <span class="dash-cta-sub">חינם · אנונימי · עובד אופליין</span>
              </div>
              <span class="dash-cta-arrow" aria-hidden="true">←</span>
            </a>
          </div>
        </div>
        <div class="kz-family-cta-art">
          <div class="kz-family-cta-flame">
            <span class="kz-family-flame-inner"></span>
          </div>
          <div class="kz-family-cta-orbit">
            <span style="--a:0deg">✡</span>
            <span style="--a:60deg">📖</span>
            <span style="--a:120deg">🕯</span>
            <span style="--a:180deg">✦</span>
            <span style="--a:240deg">📅</span>
            <span style="--a:300deg">💍</span>
          </div>
        </div>
      </div>`;
    anchor.parentNode.insertBefore(sec, anchor);
  }

  /* ─────────────────────────────────────────────────────────
     12. SEED DEMO DATA — make the site feel alive on first visit
     ───────────────────────────────────────────────────────── */
  function seedDemoData(){
    try {
      // Already-praying list — populate "אני מתפלל על"
      const existingPraying = JSON.parse(localStorage.getItem('pc_praying') || '[]');
      if (!existingPraying.length){
        const samplePraying = [
          { id: 'p1', name: 'יצחק בן שרה',  cat: 'רפואה',     text: 'מבקש תפילה לרפואה שלמה, לחיזוק הגוף והנפש ולישועה קרובה.', startedAt: Date.now() - 1000*60*60*4 },
          { id: 'p6', name: 'שרה בת אסתר',  cat: 'רפואה',     text: 'תפילה לרפואת ילד חולה — שיקבל כוחות, שמחה ובריאות.',          startedAt: Date.now() - 1000*60*60*8 },
          { id: 'p4', name: 'לאה בת רחל',   cat: 'שלום בית',  text: 'מבקשת תפילה לשלום בית, לרוך, לסבלנות ולאהבה מחודשת.',         startedAt: Date.now() - 1000*60*60*22 }
        ];
        localStorage.setItem('pc_praying', JSON.stringify(samplePraying));
      }

      // Mine list — show user a sample request
      const existingMine = JSON.parse(localStorage.getItem('pc_mine') || '[]');
      if (!existingMine.length){
        const sampleMine = [
          { id: 'm-' + Date.now(), name: 'אלון בן רחל', cat: 'הצלחה', gender: 'גבר',
            text: 'בקשה לזכות, להצלחה ולסיעתא דשמיא בכל מעשי ידיי.',
            created: Date.now() - 1000 * 60 * 30,
            count: 7,
            status: 'פעילה' }
        ];
        localStorage.setItem('pc_mine', JSON.stringify(sampleMine));
      }

      // Prayed log — show user has already joined some
      const existingLog = JSON.parse(localStorage.getItem('pc_prayed_log') || '{}');
      if (!Object.keys(existingLog).length){
        const sampleLog = { 'p1': Date.now() - 1000*60*60*4, 'p6': Date.now() - 1000*60*60*8, 'p4': Date.now() - 1000*60*60*22 };
        localStorage.setItem('pc_prayed_log', JSON.stringify(sampleLog));
      }
    } catch(_){}
  }

  /* ─────────────────────────────────────────────────────────
     13. WHATSAPP SHARE on existing prayer cards
     ───────────────────────────────────────────────────────── */
  function addWhatsAppToCards(){
    const cards = document.querySelectorAll('.prayer-card:not([data-kz-wa])');
    cards.forEach(card => {
      card.dataset.kzWa = '1';
      const actions = card.querySelector('.actions');
      if (!actions) return;
      const name = (card.querySelector('h3')?.textContent || '').trim();
      const cat  = (card.querySelector('.cat')?.textContent || '').trim();
      const text = (card.querySelector('p')?.textContent || '').trim();
      const msg = `🕯 בקשת תפילה — ${cat}\n${name}\n\n"${text}"\n\nהצטרף ב-${location.origin}`;
      const btn = document.createElement('a');
      btn.className = 'btn btn-whatsapp small';
      btn.href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
      btn.target = '_blank';
      btn.rel = 'noopener';
      btn.title = 'שתף ב-WhatsApp';
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg> שתף`;
      actions.insertBefore(btn, actions.firstChild);
    });
  }
  function watchPrayerCards(){
    addWhatsAppToCards();
    const root = document.getElementById('feedGrid') || document.body;
    const mo = new MutationObserver(() => addWhatsAppToCards());
    mo.observe(root, { childList: true, subtree: true });
  }

  /* ─────────────────────────────────────────────────────────
     INIT
     ───────────────────────────────────────────────────────── */
  function init(){
    seedDemoData();
    // Re-render the feed and personal area in case script.js already ran
    // (script.js runs without defer; we run after seeding)
    try {
      // Sync STATE to localStorage (script.js held in-memory copy)
      if (window.STATE){
        try {
          window.STATE.praying = JSON.parse(localStorage.getItem('pc_praying') || '[]');
          window.STATE.mine    = JSON.parse(localStorage.getItem('pc_mine')    || '[]');
          window.STATE.prayedLog = JSON.parse(localStorage.getItem('pc_prayed_log') || '{}');
        } catch(_){}
      }
      if (typeof window.renderFeed === 'function') window.renderFeed();
      if (typeof window.renderMe   === 'function') window.renderMe();
    } catch(_){}
    applyTOD();
    spawnLetters();
    floatingStar();
    injectCmdKTrigger();
    bindPrayerBurst();
    setupCompass();
    buildWorldSection();
    injectFamilyRoomCTA();
    liveTickerStream();
    setupInstallBanner();
    watchPrayerCards();
    // Refresh time-of-day every 30 minutes
    setInterval(applyTOD, 30 * 60 * 1000);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
