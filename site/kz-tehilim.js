/* ============================================================
   KZ TEHILIM — Daily Psalms (30/30 monthly cycle)
   Standard division based on the Chabad/general practice:
   day 1 = chs 1-9, day 2 = 10-17, ..., day 30 = 145-150
   Text fetched from Sefaria public API (no key required).
   ============================================================ */
(function(){
  'use strict';
  const $ = (s) => document.querySelector(s);

  // Standard 30-day Tehilim division
  const DAY_RANGES = [
    [1, 9],   [10,17],  [18,22],  [23,28],  [29,34],
    [35,38],  [39,43],  [44,48],  [49,54],  [55,59],
    [60,65],  [66,68],  [69,71],  [72,76],  [77,78],
    [79,82],  [83,87],  [88,89],  [90,96],  [97,103],
    [104,105],[106,107],[108,112],[113,118],[119,119],
    [120,134],[135,139],[140,144],[145,150],[150,150]
  ];

  const READ_KEY = 'kz_tehilim_read_v1';
  function loadRead(){ try { return JSON.parse(localStorage.getItem(READ_KEY) || '{}'); } catch { return {}; } }
  function saveRead(o){ try { localStorage.setItem(READ_KEY, JSON.stringify(o)); } catch {} }

  function todayKey(){ return new Date().toISOString().slice(0,10); }
  function monthDay(){ return new Date().getDate(); }

  let dayIndex = monthDay() - 1; // 0..29

  function rangeText([a, b]){
    return a === b ? `פרק ${toHebNum(a)}` : `פרקים ${toHebNum(a)} – ${toHebNum(b)}`;
  }
  function toHebNum(n){
    // Simplified Hebrew numerals 1..150
    const map = {1:'א',2:'ב',3:'ג',4:'ד',5:'ה',6:'ו',7:'ז',8:'ח',9:'ט',10:'י',
      20:'כ',30:'ל',40:'מ',50:'נ',60:'ס',70:'ע',80:'פ',90:'צ',100:'ק'};
    if (n <= 10) return map[n];
    if (n < 20) return 'י' + map[n - 10];
    if (n < 100){
      const tens = Math.floor(n / 10) * 10;
      const ones = n - tens;
      return map[tens] + (ones ? map[ones] : '');
    }
    if (n < 200){
      const rest = n - 100;
      if (!rest) return 'ק';
      if (rest < 11) return 'ק' + (map[rest] || '');
      return 'ק' + toHebNum(rest);
    }
    return String(n);
  }

  /* Render the 30-day strip */
  function renderStrip(){
    const strip = $('#thDayStrip');
    const read = loadRead();
    strip.innerHTML = '';
    for (let i = 0; i < 30; i++){
      const cell = document.createElement('button');
      cell.className = 'th-day-cell';
      cell.textContent = i + 1;
      cell.title = `יום ${i + 1}: ${rangeText(DAY_RANGES[i])}`;
      if (i === dayIndex) cell.classList.add('is-today');
      const key = `${i}_${todayKey()}`;
      if (read[key]) cell.classList.add('is-read');
      cell.addEventListener('click', () => { dayIndex = i; loadDay(); });
      strip.appendChild(cell);
    }
  }

  function rangeRef([a, b]){
    if (a === b) return `Psalms.${a}`;
    return Array.from({ length: b - a + 1 }, (_, i) => `Psalms.${a + i}`);
  }

  /* Sefaria API: returns Hebrew text for a chapter */
  async function fetchChapter(n){
    const url = `https://www.sefaria.org/api/v3/texts/Psalms.${n}?version=hebrew`;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('sefaria');
      const j = await r.json();
      const versions = j.versions || [];
      const heb = versions.find(v => v.language === 'he') || versions[0];
      const verses = (heb && heb.text) ? heb.text : [];
      return verses.map(v => stripTags(String(v)));
    } catch { return null; }
  }
  function stripTags(s){ return s.replace(/<[^>]+>/g, ''); }

  async function loadDay(){
    const range = DAY_RANGES[dayIndex];
    $('#thChapters').textContent = rangeText(range);
    $('#thDate').textContent = `יום ${dayIndex + 1} בחודש`;
    renderStrip();

    // Render skeleton
    $('#thText').innerHTML = '<div class="th-loading">📖 טוען טקסט…</div>';

    const chapters = [];
    for (let n = range[0]; n <= range[1]; n++){
      const verses = await fetchChapter(n);
      chapters.push({ n, verses });
    }

    if (!chapters.length || chapters.every(c => !c.verses || !c.verses.length)){
      $('#thText').innerHTML = '<div class="th-error">לא הצלחנו לטעון את הטקסט מ-Sefaria. נסי לרענן בעוד רגע.</div>';
      return;
    }

    $('#thText').innerHTML = chapters.map(({ n, verses }) => {
      if (!verses || !verses.length){
        return `<div><h3>פרק ${toHebNum(n)} (${n})</h3><div class="th-loading">לא נטען</div></div>`;
      }
      return `<div>
        <h3>פרק ${toHebNum(n)} (${n})</h3>
        ${verses.map((v, i) => `
          <div class="verse">
            <span class="verse-num">${i + 1}.</span>
            <span class="verse-text">${escapeHtml(v)}</span>
          </div>`).join('')}
      </div>`;
    }).join('');

    // Update share link
    const url = `https://my-hom.net/daily-tehilim.html`;
    $('#thShare').href = `https://wa.me/?text=${encodeURIComponent(`📿 תהילים יומי — היום: ${rangeText(range)}\n\nהצטרפו אלינו: ${url}`)}`;

    // Reset read button
    const readBtn = $('#thRead');
    const key = `${dayIndex}_${todayKey()}`;
    const read = loadRead();
    if (read[key]){
      readBtn.classList.add('is-done');
      readBtn.textContent = '✓ נקראו ' + new Date(read[key]).toLocaleTimeString('he-IL', { hour:'2-digit', minute:'2-digit' });
    } else {
      readBtn.classList.remove('is-done');
      readBtn.textContent = '📖 קראתי';
    }

    refreshStats();
  }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function refreshStats(){
    const read = loadRead();
    let streak = 0;
    const d = new Date();
    while (true){
      const idx = d.getDate() - 1;
      const k = `${idx}_${d.toISOString().slice(0,10)}`;
      if (read[k]){ streak++; d.setDate(d.getDate() - 1); }
      else break;
      if (streak > 365) break;
    }
    $('#thMyStreak').textContent = streak;

    const todayCnt = Object.keys(read).filter(k => k.endsWith('_' + todayKey())).length;
    $('#thTodayCount').textContent = todayCnt;

    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
    const wkCount = Object.entries(read).filter(([k, v]) => new Date(v) >= weekStart).length;
    $('#thAllTime').textContent = wkCount;
  }

  $('#thRead').addEventListener('click', () => {
    const key = `${dayIndex}_${todayKey()}`;
    const read = loadRead();
    read[key] = new Date().toISOString();
    saveRead(read);
    loadDay();
    // Optional: ping the counter API if it exists
    fetch('/api/counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'tehilim-read', day: dayIndex + 1, sid: 'th_' + Math.random().toString(36).slice(2,10) })
    }).catch(() => {});
  });
  $('#thPrev').addEventListener('click', () => { dayIndex = (dayIndex + 29) % 30; loadDay(); });
  $('#thNext').addEventListener('click', () => { dayIndex = (dayIndex + 1) % 30; loadDay(); });

  $('#thListen').addEventListener('click', () => {
    if (!('speechSynthesis' in window)){ alert('הדפדפן לא תומך בהקראה'); return; }
    const text = $('#thText').textContent.replace(/\s+/g, ' ').slice(0, 4000);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'he-IL';
    u.rate = 0.95;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadDay, { once: true });
  else loadDay();
})();
