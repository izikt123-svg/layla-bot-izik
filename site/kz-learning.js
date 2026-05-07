/* ============================================================
   KZ DAILY LEARNING — parsha + daf + halacha + mitzva
   ============================================================ */
(function(){
  'use strict';
  const $ = (s) => document.querySelector(s);
  const STREAK_KEY = 'kz_learning_streak_v1';
  const READ_KEY = 'kz_learning_read_v1';
  function loadStreak(){ try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"count":0,"lastDate":""}'); } catch { return {count:0,lastDate:''}; } }
  function saveStreak(s){ try { localStorage.setItem(STREAK_KEY, JSON.stringify(s)); } catch {} }
  function loadRead(){ try { return JSON.parse(localStorage.getItem(READ_KEY) || '{}'); } catch { return {}; } }
  function saveRead(o){ try { localStorage.setItem(READ_KEY, JSON.stringify(o)); } catch {} }
  function todayKey(){ return new Date().toISOString().slice(0,10); }
  function dayOfYear(){
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }
  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  /* Hebcal: get this week's parsha + daf yomi */
  let parsha = null, daf = null;
  async function fetchHebcal(){
    try {
      const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&year=now&month=x&ss=on&mf=on&F=on&d=on&D=on&geonameid=281184`;
      const r = await fetch(url);
      if (!r.ok) return;
      const j = await r.json();
      parsha = (j.items || []).find(i => i.category === 'parashat');
      daf    = (j.items || []).find(i => i.category === 'dafyomi');
    } catch {}
    if (parsha) $('#dlParshaName').textContent = parsha.hebrew || parsha.title || '—';
    if (daf)    $('#dlDafName').textContent    = daf.hebrew || daf.title || '—';
  }

  /* Daily halacha + mitzva: pick by day-of-year */
  function todaysHalacha(){
    const arr = window.KZ_HALACHOT || [];
    return arr[dayOfYear() % Math.max(1, arr.length)];
  }
  function todaysMitzva(){
    const arr = window.KZ_MITZVOT || [];
    return arr[dayOfYear() % Math.max(1, arr.length)];
  }

  function showTab(tab){
    document.querySelectorAll('.dl-tile').forEach(el => el.classList.toggle('is-on', el.dataset.tab === tab));
    const c = $('#dlContent');
    c.hidden = false;
    let html = '';
    if (tab === 'parsha'){
      const name = parsha?.hebrew || parsha?.title || 'פרשת השבוע';
      const link = parsha?.link || `https://www.sefaria.org/${(parsha?.title || 'Genesis.1').replace(' ', '_')}`;
      html = `<h2>📜 ${escapeHtml(name)}</h2>
        <p>פרשת השבוע היא יחידת הקריאה השבועית בתורה. כל שבת קוראים פרשה אחת בבית כנסת, וכל ההלכות, רעיונות ושיחות סובבים סביבה.</p>
        <p>ניתן לקרוא את הפרשה בעברית עם פירוש רש"י באתר Sefaria. כל יום בשבוע נקראת אליה — מוקדש לתחום אחר.</p>
        <div class="dl-actions">
          <a class="dl-action is-primary" href="${escapeHtml(link)}" target="_blank" rel="noopener">📖 קריאת הפרשה</a>
          <a class="dl-action" href="/ask-rabbi.html">👨‍🏫 שאל רב על הפרשה</a>
          <button class="dl-action is-primary" id="dlMark" data-key="parsha-${todayKey()}">✓ למדתי</button>
        </div>`;
    } else if (tab === 'daf'){
      const name = daf?.hebrew || daf?.title || 'דף יומי';
      const dafLink = daf?.link || 'https://www.sefaria.org/daf-yomi';
      html = `<h2>📖 ${escapeHtml(name)}</h2>
        <p>הדף היומי הוא לימוד יומי של דף אחד מהתלמוד הבבלי. מי שמתחיל ולומד דף ביום — מסיים את כל הש"ס ב-7 שנים וחצי. סיום מחזור = שמחה גדולה ("סיום הש"ס").</p>
        <p>אפשר ללמוד עם פירוש בעברית, באנגלית או להאזין לשיעור באתר.</p>
        <div class="dl-actions">
          <a class="dl-action is-primary" href="${escapeHtml(dafLink)}" target="_blank" rel="noopener">📖 ללמוד את הדף</a>
          <a class="dl-action" href="https://www.dafyomi.co.il" target="_blank" rel="noopener">🎙 שיעור קולי</a>
          <button class="dl-action is-primary" id="dlMark" data-key="daf-${todayKey()}">✓ למדתי</button>
        </div>`;
    } else if (tab === 'halacha'){
      const h = todaysHalacha();
      html = `<h2>⚖ ${escapeHtml(h.title)}</h2>
        <p>${escapeHtml(h.text)}</p>
        <div class="dl-actions">
          <a class="dl-action" href="https://www.chabad.org/library" target="_blank" rel="noopener">📚 עוד הלכות</a>
          <button class="dl-action is-primary" id="dlMark" data-key="halacha-${todayKey()}">✓ למדתי</button>
        </div>`;
    } else if (tab === 'mitzva'){
      const m = todaysMitzva();
      html = `<h2>✦ ${escapeHtml(m.title)}</h2>
        <p>${escapeHtml(m.text)}</p>
        <p><b>איך לקיים היום:</b> בחרי דרך אחת קטנה לקיים את המצווה. גם פעולה קטנה — נחשבת.</p>
        <div class="dl-actions">
          <button class="dl-action is-primary" id="dlMark" data-key="mitzva-${todayKey()}">✓ קיימתי היום</button>
          <a class="dl-action" href="/prayer-wall.html">🙏 עזרי לאחר</a>
        </div>`;
    }
    c.innerHTML = html;
    const markBtn = $('#dlMark');
    if (markBtn){
      const r = loadRead();
      if (r[markBtn.dataset.key]){
        markBtn.classList.add('is-done');
        markBtn.textContent = '✓ נלמד היום';
      }
      markBtn.addEventListener('click', () => {
        const r2 = loadRead();
        r2[markBtn.dataset.key] = new Date().toISOString();
        saveRead(r2);
        markBtn.classList.add('is-done');
        markBtn.textContent = '✓ נלמד היום';
        bumpStreak();
      });
    }
  }

  function bumpStreak(){
    const today = todayKey();
    const cur = loadStreak();
    if (cur.lastDate === today) return;
    const yest = (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); })();
    cur.count = (cur.lastDate === yest) ? cur.count + 1 : 1;
    cur.lastDate = today;
    saveStreak(cur);
    $('#dlStreak').innerHTML = `🔥 <b>${cur.count}</b> ימים ברצף`;
  }

  /* Init */
  function init(){
    const s = loadStreak();
    $('#dlStreak').innerHTML = `🔥 <b>${s.count}</b> ימים ברצף`;
    fetchHebcal();
    const h = todaysHalacha(); if (h) $('#dlHalachaName').textContent = h.title;
    const m = todaysMitzva();  if (m) $('#dlMitzvaName').textContent  = m.title;
    document.querySelectorAll('.dl-tile').forEach(el => el.addEventListener('click', () => showTab(el.dataset.tab)));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
