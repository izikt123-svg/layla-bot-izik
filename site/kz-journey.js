/* ============================================================
   KZ JOURNEY — personal dashboard
   Aggregates everything stored in localStorage
   ============================================================ */
(function(){
  'use strict';
  const $ = (s) => document.querySelector(s);
  const PROFILE_KEY = 'kz_profile_v1';

  function load(key, def){
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); }
    catch { return def; }
  }
  function fmtDate(iso){
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('he-IL', { day:'numeric', month:'short' });
  }
  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  /* Profile */
  const profile = load(PROFILE_KEY, null);
  if (profile?.name) $('#jrTitle').textContent = `המסע של ${profile.name}`;

  $('#jrNameBtn').addEventListener('click', () => {
    const cur = load(PROFILE_KEY, {});
    const name = prompt('איך לקרוא לך?', cur.name || '');
    if (name === null) return;
    const updated = { ...cur, name: name.trim(), kind: cur.kind || 'local' };
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(updated)); } catch {}
    location.reload();
  });

  /* Streaks */
  const streaks = [
    { key: 'kz_morning_streak_v1',   icon:'🌅', label:'בקרים' },
    { key: 'kz_60s_streak_v1',       icon:'✦', label:'60 שניות' },
    { key: 'kz_learning_streak_v1',  icon:'📚', label:'לימוד' }
  ];
  $('#jrStreaks').innerHTML = streaks.map(s => {
    const data = load(s.key, { count: 0 });
    return `<div class="jr-streak">
      <div class="jr-streak-icon">${s.icon}</div>
      <span class="jr-streak-num">${data.count || 0}</span>
      <span class="jr-streak-label">${escapeHtml(s.label)} ברצף</span>
    </div>`;
  }).join('');

  /* Stats */
  const tehilimRead = Object.keys(load('kz_tehilim_read_v1', {})).length;
  const learningRead = Object.keys(load('kz_learning_read_v1', {})).length;
  const candlesLocal = (load('kz_local_candles_v1', [])).length;
  const prayedFor    = Object.keys(load('kz_pw_prayed_v1', {})).length;
  const storiesRead  = Object.keys(load('kz_kids_read_v1', {})).length;
  const visits = (() => {
    try { return parseInt(localStorage.getItem('kz_push_visits') || '0', 10) || 0; }
    catch { return 0; }
  })();

  $('#jrStats').innerHTML = `
    <div class="jr-stat"><b>${tehilimRead}</b><span>פרקי תהילים</span></div>
    <div class="jr-stat"><b>${learningRead}</b><span>שיעורים</span></div>
    <div class="jr-stat"><b>${candlesLocal}</b><span>נרות הדלקתי</span></div>
    <div class="jr-stat"><b>${prayedFor}</b><span>תפילות עליהם</span></div>
    <div class="jr-stat"><b>${storiesRead}</b><span>סיפורים</span></div>
    <div class="jr-stat"><b>${visits}</b><span>ביקורים</span></div>
  `;

  /* Prayed list */
  const prayedMap = load('kz_pw_prayed_v1', {});
  const prayedEntries = Object.entries(prayedMap).sort(([,a], [,b]) => b - a);
  if (prayedEntries.length){
    $('#jrPrayed').innerHTML = prayedEntries.slice(0, 12).map(([id, ts]) => {
      const date = new Date(ts).toLocaleDateString('he-IL', { day:'numeric', month:'short' });
      return `<div class="jr-item">
        <div class="jr-item-icn">🙏</div>
        <div>
          <div class="jr-item-name">תפילה על אחר</div>
          <div class="jr-item-meta">קיר התפילות · ${escapeHtml(id.slice(0, 8))}</div>
        </div>
        <span class="jr-item-time">${date}</span>
      </div>`;
    }).join('');
  } else {
    $('#jrPrayed').innerHTML = `<div class="jr-list-empty">עדיין לא התפללת על אחרים. <a href="/prayer-wall.html" style="color:#d4b07a">התחילי כאן</a></div>`;
  }

  /* Candles */
  const candles = load('kz_local_candles_v1', []);
  if (candles.length){
    $('#jrCandles').innerHTML = candles.slice(0, 10).map(c => `
      <div class="jr-item">
        <div class="jr-item-icn">🕯</div>
        <div>
          <div class="jr-item-name">${escapeHtml(c.name || 'אנונימית')}</div>
          <div class="jr-item-meta">${escapeHtml(c.city || '')} ${c.prayer ? '· "' + escapeHtml(c.prayer.slice(0, 60)) + '"' : ''}</div>
        </div>
        <span class="jr-item-time">${fmtDate(c.candleAt)}</span>
      </div>`).join('');
  } else {
    $('#jrCandles').innerHTML = `<div class="jr-list-empty">עדיין לא הדלקת נר. <a href="/shabbat-candles.html" style="color:#d4b07a">הדליקי עכשיו</a></div>`;
  }

  /* Stories read */
  const storiesMap = load('kz_kids_read_v1', {});
  const storiesArr = Object.entries(storiesMap);
  if (storiesArr.length){
    const idx = (window.KZ_KIDS_STORIES || []).reduce((a, s) => { a[s.id] = s; return a; }, {});
    $('#jrStories').innerHTML = storiesArr.sort(([,a], [,b]) => new Date(b) - new Date(a)).map(([id, ts]) => {
      const story = idx[id] || { title: id, emoji:'📖' };
      return `<div class="jr-item">
        <div class="jr-item-icn">${story.emoji || '📖'}</div>
        <div>
          <div class="jr-item-name">${escapeHtml(story.title)}</div>
          <div class="jr-item-meta">סיפור לפני השינה</div>
        </div>
        <span class="jr-item-time">${fmtDate(ts)}</span>
      </div>`;
    }).join('');
  } else {
    $('#jrStories').innerHTML = `<div class="jr-list-empty">עדיין לא קראת סיפור. <a href="/kids-bedtime.html" style="color:#d4b07a">סיפור היום</a></div>`;
  }

  /* Export */
  $('#jrExport').addEventListener('click', () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++){
      const k = localStorage.key(i);
      if (k && k.startsWith('kz_')) data[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `my-journey-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  });

  /* Reset */
  $('#jrReset').addEventListener('click', () => {
    if (!confirm('לאפס את המסע? (כל הנתונים המקומיים יימחקו, השם והפרופיל יישמרו)')) return;
    const profile = localStorage.getItem(PROFILE_KEY);
    Object.keys(localStorage).forEach(k => { if (k.startsWith('kz_') && k !== PROFILE_KEY) localStorage.removeItem(k); });
    if (profile) localStorage.setItem(PROFILE_KEY, profile);
    location.reload();
  });
})();
