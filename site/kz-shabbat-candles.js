/* ============================================================
   KZ SHABBAT CANDLES — virtual candle lighting + global wall
   - Hebcal Shabbat API for candle/havdala times per city
   - Live wall syncs every 20s
   - Auto-extinguish after havdala (server-side via TTL)
   ============================================================ */
(function(){
  'use strict';

  const $ = (s) => document.querySelector(s);

  /* ─── Hebcal time fetch per city (geonameid) ─── */
  async function fetchShabbatByGeonameId(id){
    const r = await fetch(`https://www.hebcal.com/shabbat?cfg=json&geonameid=${id}&m=18`);
    if (!r.ok) throw new Error('hebcal');
    return r.json();
  }
  async function fetchShabbatByLatLng(lat, lng){
    const r = await fetch(`https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lng}&m=18`);
    if (!r.ok) throw new Error('hebcal');
    return r.json();
  }

  function fmtTime(iso){
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  }
  function fmtDate(iso){
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  /* ─── State ─── */
  const state = {
    cityId: '281184',         // default Jerusalem
    cityName: 'ירושלים',
    candle: null,             // ISO
    havdala: null,            // ISO
    parsha: null,
    geo: null
  };

  /* ─── Render times card ─── */
  async function refreshTimes(){
    const timesEl = $('#scTimes');
    const tzEl = $('#scTz');
    timesEl.innerHTML = `
      <div class="sc-time-row sc-time-skel"><span>הדלקת נרות</span><span>טוען…</span></div>
      <div class="sc-time-row sc-time-skel"><span>צאת השבת</span><span>טוען…</span></div>
      <div class="sc-time-row sc-time-skel"><span>פרשת השבוע</span><span>טוען…</span></div>`;

    let data;
    try {
      data = state.geo
        ? await fetchShabbatByLatLng(state.geo.lat, state.geo.lng)
        : await fetchShabbatByGeonameId(state.cityId);
    } catch {
      timesEl.innerHTML = '<div class="sc-time-row"><span>לא הצלחנו לטעון את הזמנים</span><span>—</span></div>';
      return;
    }

    state.cityName = data.location?.title || state.cityName;
    if (tzEl) tzEl.textContent = (data.location?.tzid || '').replace(/_/g, ' ');

    const now = Date.now();
    const candleIt  = (data.items || []).find(i => i.category === 'candles'  && new Date(i.date).getTime() > now - 12 * 3600_000);
    const havdalaIt = (data.items || []).find(i => i.category === 'havdalah' && new Date(i.date).getTime() > now - 1  * 3600_000);
    const parshaIt  = (data.items || []).find(i => i.category === 'parashat');

    state.candle  = candleIt?.date || null;
    state.havdala = havdalaIt?.date || null;
    state.parsha  = parshaIt?.hebrew || parshaIt?.title || '—';

    timesEl.innerHTML = `
      <div class="sc-time-row sc-candle">
        <span>🕯 הדלקת נרות (${fmtDate(state.candle)})</span>
        <span>${fmtTime(state.candle)}</span>
      </div>
      <div class="sc-time-row sc-havdala">
        <span>✨ צאת השבת</span>
        <span>${fmtTime(state.havdala)}</span>
      </div>
      <div class="sc-time-row">
        <span>📜 פרשת השבוע</span>
        <span>${escapeHtml(state.parsha)}</span>
      </div>`;

    const untilEl = $('#scUntil');
    if (untilEl) untilEl.textContent = state.havdala ? `צאת השבת (${fmtTime(state.havdala)})` : 'צאת השבת';

    refreshCountdown();
    setInterval(refreshCountdown, 30_000);
  }

  function refreshCountdown(){
    const c = $('#scCountdown');
    if (!c) return;
    if (!state.candle){ c.hidden = true; return; }
    const now = Date.now();
    const candle  = new Date(state.candle).getTime();
    const havdala = state.havdala ? new Date(state.havdala).getTime() : 0;
    if (now < candle){
      const diff = candle - now;
      c.hidden = false;
      c.innerHTML = `⏳ הדלקת נרות בעוד <b>${formatDelta(diff)}</b>`;
    } else if (havdala && now < havdala){
      const diff = havdala - now;
      c.hidden = false;
      c.innerHTML = `🕯 השבת נכנסה. צאת השבת בעוד <b>${formatDelta(diff)}</b>`;
    } else {
      c.hidden = false;
      c.innerHTML = `שבת שלום ✦ הזמן הבא יוצג ביום שישי הקרוב`;
    }
  }

  function formatDelta(ms){
    const totalMin = Math.floor(ms / 60000);
    const days = Math.floor(totalMin / 1440);
    const hr   = Math.floor((totalMin % 1440) / 60);
    const min  = totalMin % 60;
    if (days > 0) return `${days} ימים, ${hr} שעות`;
    if (hr  > 0) return `${hr} שעות ו-${min} דקות`;
    return `${min} דקות`;
  }

  /* ─── Light a candle ─── */
  async function light(payload){
    try {
      const r = await fetch('/api/candles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!r.ok) throw new Error();
      return await r.json();
    } catch {
      // Fallback: add locally so user sees their candle
      const local = JSON.parse(localStorage.getItem('kz_local_candles_v1') || '[]');
      local.unshift({ ...payload, id: 'local_' + Date.now(), local: true });
      localStorage.setItem('kz_local_candles_v1', JSON.stringify(local.slice(0, 50)));
      return { ok: true, local: true };
    }
  }

  /* ─── Audio + Photo capture ─── */
  let recState = { rec: null, chunks: [], stream: null, dataUrl: null };
  let photoDataUrl = null;

  function wireMedia(){
    /* Photo */
    const photoInput = $('#scPhotoFile');
    const photoPrev  = $('#scPhotoPreview');
    photoInput?.addEventListener('change', async () => {
      const f = photoInput.files?.[0];
      if (!f) return;
      photoDataUrl = await readImageDownscaled(f, 720, 0.78);
      photoPrev.src = photoDataUrl;
      photoPrev.hidden = false;
    });

    /* Audio */
    const recBtn  = $('#scRecBtn');
    const stat    = $('#scRecStatus');
    const preview = $('#scRecPreview');
    recBtn?.addEventListener('click', async () => {
      if (recState.rec && recState.rec.state === 'recording'){
        recState.rec.stop();
        return;
      }
      try {
        recState.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recState.rec = new MediaRecorder(recState.stream);
        recState.chunks = [];
        recState.rec.ondataavailable = (e) => { if (e.data.size) recState.chunks.push(e.data); };
        recState.rec.onstop = () => {
          recState.stream?.getTracks().forEach(t => t.stop());
          const blob = new Blob(recState.chunks, { type: recState.chunks[0]?.type || 'audio/webm' });
          const reader = new FileReader();
          reader.onload = () => {
            recState.dataUrl = reader.result;
            preview.src = recState.dataUrl;
            preview.hidden = false;
            stat.hidden = false;
            stat.textContent = '✓ הקלטה שמורה (תוצרף לנר)';
            recBtn.textContent = '🎙 הקלטה מחדש';
          };
          reader.readAsDataURL(blob);
        };
        recState.rec.start();
        recBtn.textContent = '⏹ עצרי הקלטה';
        stat.hidden = false;
        stat.textContent = '🔴 מקליטה…';
        // Auto-stop at 30s
        setTimeout(() => { try { recState.rec?.stop(); } catch{} }, 30_000);
      } catch (err) {
        stat.hidden = false;
        stat.textContent = '⚠️ אין גישה למיקרופון';
      }
    });
  }

  function readImageDownscaled(file, maxWidth, quality){
    return new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
          const w = Math.round(img.width * ratio);
          const h = Math.round(img.height * ratio);
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL('image/jpeg', quality));
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  function wireForm(){
    const form = $('#scForm');
    const success = $('#scSuccess');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('#scName').value.trim();
      const prayer = $('#scPrayer').value.trim();
      const anon = $('#scAnon').checked;
      if (!name){ $('#scName').focus(); return; }

      $('#scLightBtn').disabled = true;
      const payload = {
        name: anon ? 'אנונימית' : name,
        prayer,
        city: state.cityName,
        cityId: state.cityId,
        candleAt: state.candle,
        havdalaAt: state.havdala,
        audio: recState.dataUrl,
        photo: photoDataUrl
      };
      await light(payload);
      // reset capture state
      recState.dataUrl = null; photoDataUrl = null;
      form.hidden = true;
      success.hidden = false;
      refreshWall();
    });

    $('#scLightAgain').addEventListener('click', () => {
      $('#scForm').reset();
      $('#scForm').hidden = false;
      $('#scSuccess').hidden = true;
      $('#scLightBtn').disabled = false;
      $('#scRecPreview').hidden = true;
      $('#scRecStatus').hidden = true;
      $('#scPhotoPreview').hidden = true;
      recState = { rec:null, chunks:[], stream:null, dataUrl:null };
      photoDataUrl = null;
    });
  }

  /* ─── Wall fetch + render ─── */
  async function fetchWall(){
    try {
      const r = await fetch('/api/candles?live=1', { cache: 'no-store' });
      if (!r.ok) throw new Error();
      return await r.json();
    } catch {
      // Fallback: local storage
      const local = JSON.parse(localStorage.getItem('kz_local_candles_v1') || '[]');
      return { candles: local };
    }
  }

  function svgCandle(){
    return `<svg class="sc-svg-candle" viewBox="0 0 56 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cWax" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff7e0"/>
          <stop offset="100%" stop-color="#d4b07a"/>
        </linearGradient>
        <radialGradient id="cFlame" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stop-color="#fff7c0"/>
          <stop offset="55%" stop-color="#ffb648"/>
          <stop offset="100%" stop-color="#ff5b1f" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- glow -->
      <circle cx="28" cy="32" r="22" fill="url(#cFlame)" opacity=".55"/>
      <!-- wax -->
      <rect x="20" y="46" width="16" height="44" rx="3" fill="url(#cWax)" stroke="#9c7a40" stroke-width="0.6"/>
      <!-- wick -->
      <rect x="27" y="40" width="2" height="6" fill="#5a3c14"/>
      <!-- flame -->
      <g class="sc-svg-flame">
        <ellipse cx="28" cy="34" rx="6.5" ry="11" fill="url(#cFlame)"/>
        <ellipse cx="28" cy="36" rx="3.5" ry="6" fill="#ffe28a"/>
        <ellipse cx="28" cy="38" rx="1.5" ry="3" fill="#fffce8"/>
      </g>
    </svg>`;
  }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function candleCardHtml(c){
    const shareText = `🕯 נר עבור ${c.name || 'אנונימית'}${c.city ? ' מ-' + c.city : ''}${c.prayer ? '\n"' + c.prayer + '"' : ''}\n\nראו את הקיר העולמי:\nhttps://my-hom.net/shabbat-candles.html`;
    const wa = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    const audio = c.audio ? `<audio class="sc-candle-audio" controls preload="metadata" src="${escapeHtml(c.audio)}"></audio>` : '';
    const photo = c.photo ? `<img class="sc-candle-photo" src="${escapeHtml(c.photo)}" alt="" loading="lazy"/>` : '';
    return `<div class="sc-candle-card" data-id="${escapeHtml(c.id)}">
      <span class="sc-candle-time">${fmtTime(c.candleAt || c.created_at) || ''}</span>
      ${photo || svgCandle()}
      <div class="sc-candle-name">${escapeHtml(c.name || 'אנונימית')}</div>
      <div class="sc-candle-city">${escapeHtml(c.city || '')}</div>
      ${c.prayer ? `<div class="sc-candle-prayer">${escapeHtml(c.prayer)}</div>` : ''}
      ${audio}
      <div class="sc-candle-actions">
        <button class="sc-like" data-id="${escapeHtml(c.id)}" aria-label="חזק/י"><span class="sc-heart">❤</span> <span class="sc-likes-n">${c.likes || 0}</span></button>
        <a class="sc-share" href="${wa}" target="_blank" rel="noopener" aria-label="שתפי"><span>↗</span></a>
      </div>
    </div>`;
  }

  function renderWall(list){
    const wall = $('#scWall');
    const count = $('#scWallCount');
    if (!wall) return;
    const arr = (list || []).slice(0, 80);
    count.textContent = arr.length;
    wall.innerHTML = arr.map(candleCardHtml).join('');
  }

  function renderTop(list){
    const top = $('#scTop');
    if (!top) return;
    if (!list.length){
      top.innerHTML = '<div class="sc-top-empty">אין עדיין תפילות עם לבבות. היי הראשונה לתת!</div>';
      return;
    }
    top.innerHTML = list.map(candleCardHtml).join('');
  }

  /* Wall delegated like-handler */
  function wireWallActions(){
    document.body.addEventListener('click', async (e) => {
      const likeBtn = e.target.closest('.sc-like');
      if (!likeBtn) return;
      e.preventDefault();
      const id = likeBtn.dataset.id;
      if (!id || likeBtn.dataset.loved) return;
      likeBtn.dataset.loved = '1';
      likeBtn.classList.add('is-loved');
      const nEl = likeBtn.querySelector('.sc-likes-n');
      nEl.textContent = (parseInt(nEl.textContent || '0', 10) || 0) + 1;
      try {
        await fetch('/api/candles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'like', id })
        });
      } catch {}
    });
  }

  /* "Light for me" requests */
  async function fetchRequests(){
    try {
      const r = await fetch('/api/candle-requests?live=1', { cache: 'no-store' });
      if (!r.ok) throw new Error();
      return (await r.json()).requests || [];
    } catch { return []; }
  }

  function renderRequests(list){
    const wrap = $('#scReqList');
    if (!wrap) return;
    if (!list.length){
      wrap.innerHTML = '<div class="sc-req-empty">אין בקשות פתוחות. היי הראשונה לבקש או לתת!</div>';
      return;
    }
    wrap.innerHTML = list.slice(0, 15).map(r => `
      <div class="sc-req-card" data-id="${escapeHtml(r.id)}">
        <div class="sc-req-name">לרפואת/לזכר/לשם <b>${escapeHtml(r.for_name)}</b></div>
        ${r.prayer ? `<div class="sc-req-prayer">"${escapeHtml(r.prayer)}"</div>` : ''}
        <button class="sc-req-claim" data-id="${escapeHtml(r.id)}" data-name="${escapeHtml(r.for_name)}">🕯 אני אדליק עליה</button>
      </div>`).join('');
  }

  function wireRequests(){
    $('#scReqForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const for_name = $('#scReqName').value.trim();
      const prayer   = $('#scReqPrayer').value.trim();
      if (!for_name) return;
      try {
        await fetch('/api/candle-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'request', for_name, prayer })
        });
      } catch {}
      $('#scReqForm').reset();
      refreshRequests();
    });

    document.body.addEventListener('click', async (e) => {
      const claimBtn = e.target.closest('.sc-req-claim');
      if (!claimBtn) return;
      e.preventDefault();
      const id  = claimBtn.dataset.id;
      const for_name = claimBtn.dataset.name;
      const lighter_name = prompt(`את מתחייבת להדליק עבור ${for_name}.\nאיך לקרוא לך?`, '');
      if (lighter_name === null) return;
      try {
        const r = await fetch('/api/candle-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'claim', id, lighter_name: lighter_name || 'אנונימית', city: state.cityName })
        });
        if (r.ok){
          claimBtn.outerHTML = '<span class="sc-req-claimed">✓ הוגשם</span>';
          refreshWall();
        }
      } catch {}
    });
  }

  async function refreshRequests(){ renderRequests(await fetchRequests()); }
  async function refreshTop(){
    try {
      const r = await fetch('/api/candles?top=1', { cache: 'no-store' });
      if (!r.ok) return;
      const data = await r.json();
      renderTop(data.candles || []);
    } catch {}
  }

  async function refreshWall(){
    const data = await fetchWall();
    renderWall(data.candles || []);
  }

  /* ─── Init ─── */
  async function init(){
    const sel = $('#scCity');
    sel.addEventListener('change', () => {
      state.cityId = sel.value;
      state.cityName = sel.options[sel.selectedIndex].textContent;
      state.geo = null;
      refreshTimes();
    });

    $('#scLocate').addEventListener('click', () => {
      if (!navigator.geolocation){ alert('הדפדפן לא תומך במיקום'); return; }
      $('#scLocate').textContent = '⏳';
      navigator.geolocation.getCurrentPosition((g) => {
        state.geo = { lat: g.coords.latitude, lng: g.coords.longitude };
        $('#scLocate').textContent = '✓';
        refreshTimes();
      }, () => {
        $('#scLocate').textContent = '🛰';
        alert('לא הצלחנו לזהות מיקום');
      }, { enableHighAccuracy: true, timeout: 10000 });
    });

    wireForm();
    wireMedia();
    wireWallActions();
    wireRequests();
    refreshTimes();
    refreshWall();
    refreshTop();
    refreshRequests();
    setInterval(() => { refreshWall(); refreshTop(); refreshRequests(); }, 20_000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
