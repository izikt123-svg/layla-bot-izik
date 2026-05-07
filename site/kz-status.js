/* ============================================================
   KZ STATUS — system check dashboard
   ============================================================ */
(function(){
  'use strict';
  const $ = (s) => document.querySelector(s);

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function renderItem(it){
    const cls = it.status === 'ok' ? 'is-ok' : it.status === 'warn' ? 'is-warn' : it.status === 'err' ? 'is-err' : 'is-checking';
    const label = it.status === 'ok' ? '✓ עובד' : it.status === 'warn' ? '⚠ חסר' : it.status === 'err' ? '✗ שגיאה' : '⏳ בודק…';
    return `<div class="st-item ${cls}" data-key="${escapeHtml(it.key)}">
      <span class="st-item-icn">${it.icn}</span>
      <div>
        <div class="st-item-name">${escapeHtml(it.name)}</div>
        ${it.detail ? `<div class="st-item-detail">${escapeHtml(it.detail)}</div>` : ''}
      </div>
      <span class="st-item-status">${label}</span>
    </div>`;
  }

  function setStatus(key, status, detail){
    const el = document.querySelector(`[data-key="${key}"]`);
    if (!el) return;
    el.className = 'st-item ' + (status === 'ok' ? 'is-ok' : status === 'warn' ? 'is-warn' : 'is-err');
    el.querySelector('.st-item-status').textContent = status === 'ok' ? '✓ עובד' : status === 'warn' ? '⚠ חסר' : '✗ שגיאה';
    if (detail){
      let d = el.querySelector('.st-item-detail');
      if (!d){
        d = document.createElement('div'); d.className = 'st-item-detail';
        el.querySelector('.st-item-name').after(d);
      }
      d.textContent = detail;
    }
  }

  /* ─── Client-side checks ─── */
  const clientChecks = [
    { key:'pwa', icn:'📱', name:'PWA / Service Worker', detail:'נדרש לעבודה אופליין' },
    { key:'mani', icn:'⚙', name:'Manifest', detail:'הגדרות אפליקציה' },
    { key:'storage', icn:'💾', name:'אחסון מקומי', detail:'הסטריקים שלך' },
    { key:'notif', icn:'🔔', name:'הרשאת התראות' },
    { key:'geo', icn:'📍', name:'גישה למיקום' },
    { key:'mic', icn:'🎙', name:'מיקרופון', detail:'להקלטות נר ומירב' },
    { key:'install', icn:'⬇', name:'התקנה כאפליקציה' },
    { key:'connection', icn:'🌐', name:'חיבור לאינטרנט' }
  ];
  $('#stClient').innerHTML = clientChecks.map(renderItem).join('');

  function runClientChecks(){
    /* Service Worker */
    if ('serviceWorker' in navigator){
      navigator.serviceWorker.getRegistration().then(reg => {
        setStatus('pwa', reg && reg.active ? 'ok' : 'warn', reg ? 'גרסה: ' + (reg.active?.scriptURL?.split('/')?.pop() || 'sw.js') : 'נרשם בקרוב');
      });
    } else { setStatus('pwa', 'err', 'הדפדפן לא תומך'); }

    /* Manifest */
    fetch('/manifest.webmanifest').then(r => {
      setStatus('mani', r.ok ? 'ok' : 'err', r.ok ? 'נטען בהצלחה' : 'לא נמצא');
    }).catch(() => setStatus('mani', 'err', 'לא נטען'));

    /* localStorage */
    try {
      const k = '_kz_test_' + Date.now();
      localStorage.setItem(k, '1'); localStorage.removeItem(k);
      const used = Object.keys(localStorage).filter(k => k.startsWith('kz_')).length;
      setStatus('storage', 'ok', used + ' פריטים שמורים');
    } catch { setStatus('storage', 'err', 'חסום'); }

    /* Notifications */
    if ('Notification' in window){
      const p = Notification.permission;
      setStatus('notif', p === 'granted' ? 'ok' : p === 'denied' ? 'err' : 'warn',
        p === 'granted' ? 'אושר' : p === 'denied' ? 'נדחה' : 'עדיין לא ביקשת');
    } else setStatus('notif', 'err', 'לא נתמך');

    /* Geolocation */
    if ('geolocation' in navigator){
      setStatus('geo', 'ok', 'נתמך — המשתמש/ת יבחר/תבחר אם להעניק');
    } else setStatus('geo', 'err', 'לא נתמך');

    /* Microphone */
    if (navigator.mediaDevices?.getUserMedia){
      setStatus('mic', 'ok', 'נתמך — להקלטת ברכות וזיכרון');
    } else setStatus('mic', 'err', 'לא נתמך בדפדפן זה');

    /* Install / standalone */
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setStatus('install', standalone ? 'ok' : 'warn', standalone ? 'מותקן ✓' : 'עדיין לא מותקן — לך ל-/install.html');

    /* Connection */
    setStatus('connection', navigator.onLine ? 'ok' : 'err', navigator.onLine ? 'מחובר' : 'אין רשת');
  }

  /* ─── Server-side checks (best-effort, with timeout) ─── */
  const serverChecks = [
    { key:'ai',         icn:'🤖', name:'/api/ai (Gemini)',        detail:'תשובות חכמות למירב' },
    { key:'translate',  icn:'🌐', name:'/api/translate',          detail:'תרגום ל-10 שפות' },
    { key:'compose',    icn:'✦', name:'/api/compose',            detail:'מירב מנסחת תפילה' },
    { key:'menuVision', icn:'📷', name:'/api/menu-vision',         detail:'תרגום תפריטים' },
    { key:'wall',       icn:'🙏', name:'/api/prayer-wall',         detail:'קיר תפילות' },
    { key:'candles',    icn:'🕯', name:'/api/candles',             detail:'נרות שבת' },
    { key:'simchas',    icn:'🎉', name:'/api/simchas',             detail:'שמחות' },
    { key:'counter',    icn:'📊', name:'/api/counter',             detail:'ספירת מתפללים' },
    { key:'heatmap',    icn:'🗺', name:'/api/heatmap',             detail:'מפת תפילות' },
    { key:'push',       icn:'🔔', name:'/api/push-subscribe',      detail:'Push notifications' },
    { key:'donate',     icn:'💝', name:'/api/donate-stripe',       detail:'תרומות Stripe' }
  ];
  $('#stServer').innerHTML = serverChecks.map(renderItem).join('');

  async function check(path, opts = {}, timeoutMs = 6000){
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const r = await fetch(path, { ...opts, signal: ctl.signal });
      return r;
    } catch { return null; }
    finally { clearTimeout(t); }
  }

  function probeStatus(r){
    if (!r) return { status:'err', detail:'לא הגיע (timeout/network)' };
    if (r.status === 200) return { status:'ok',   detail:'תקין' };
    if (r.status === 405) return { status:'ok',   detail:'אנדפוינט פעיל (405 על GET)' };
    if (r.status === 401 || r.status === 403) return { status:'warn', detail:'דורש secret/auth' };
    if (r.status === 500) return { status:'warn', detail:'env vars חסרים' };
    if (r.status === 502) return { status:'warn', detail:'API key חסר' };
    return { status:'err',  detail:'HTTP ' + r.status };
  }

  async function runServerChecks(){
    serverChecks.forEach(c => setStatus(c.key, 'checking', ''));

    const tests = [
      ['ai',         () => check('/api/ai',           { method:'POST', headers:{'Content-Type':'application/json'}, body:'{"message":"בדיקה"}' })],
      ['translate',  () => check('/api/translate',    { method:'POST', headers:{'Content-Type':'application/json'}, body:'{"texts":["שלום"],"target":"en"}' })],
      ['compose',    () => check('/api/compose',      { method:'POST', headers:{'Content-Type':'application/json'}, body:'{"intent":"רפואה","names":"בדיקה"}' })],
      ['menuVision', () => check('/api/menu-vision',  { method:'POST', headers:{'Content-Type':'application/json'}, body:'{}' })],
      ['wall',       () => check('/api/prayer-wall?live=1')],
      ['candles',    () => check('/api/candles?live=1')],
      ['simchas',    () => check('/api/simchas?live=1')],
      ['counter',    () => check('/api/counter')],
      ['heatmap',    () => check('/api/heatmap')],
      ['push',       () => check('/api/push-subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body:'{}' })],
      ['donate',     () => check('/api/donate-stripe', { method:'POST', headers:{'Content-Type':'application/json'}, body:'{"amount":18}' })]
    ];

    /* Run sequentially (slow but predictable) */
    let ok = 0, warn = 0, err = 0;
    for (const [key, run] of tests){
      const r = await run();
      const { status, detail } = probeStatus(r);
      setStatus(key, status, detail);
      if (status === 'ok') ok++; else if (status === 'warn') warn++; else err++;
    }
    /* Summary pill */
    const overall = $('#stOverall');
    if (err === 0 && warn === 0){ overall.textContent = '✓ הכל עובד'; overall.className = 'st-overall is-ok'; }
    else if (err === 0){ overall.textContent = `⚠ ${warn} צריכים הגדרה`; overall.className = 'st-overall is-warn'; }
    else { overall.textContent = `${err} שגיאות · ${warn} חסרים`; overall.className = 'st-overall is-err'; }
  }

  /* ─── Meirav ─── */
  const meiravChecks = [
    { key:'mvLoaded', icn:'✦', name:'מירב נטענה (kz-ai-chat.js)', detail:'הקובץ של מירב' },
    { key:'mvFab',    icn:'💬', name:'הכפתור של מירב מופיע',     detail:'FAB עגול בפינה' },
    { key:'mvVoice',  icn:'🎙', name:'תמיכה בקול',                detail:'STT + TTS' },
    { key:'mvI18n',   icn:'🌐', name:'תרגום אוטומטי',              detail:'kz-i18n-auto.js' }
  ];
  $('#stMeirav').innerHTML = meiravChecks.map(renderItem).join('');

  function runMeiravChecks(){
    setTimeout(() => {
      setStatus('mvLoaded', window.KZ_AI_CHAT ? 'ok' : 'err', window.KZ_AI_CHAT ? 'מוכנה לשימוש' : 'לא נטענה');
      setStatus('mvFab',    document.querySelector('.kz-aic-fab') ? 'ok' : 'warn', document.querySelector('.kz-aic-fab') ? 'נראה בכל הדפים' : 'יופיע כשתפתחי דף עם מירב');
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const TTS = 'speechSynthesis' in window;
      setStatus('mvVoice',  (SR && TTS) ? 'ok' : 'warn', SR && TTS ? 'מיקרופון + הקראה' : (SR ? 'רק מיקרופון' : 'רק הקראה'));
      setStatus('mvI18n',   window.KZ_I18N ? 'ok' : 'warn', window.KZ_I18N ? 'מציע תרגום' : 'יטען בעמוד עם הסקריפט');
    }, 500);
  }

  /* Test Meirav */
  $('#stTestMeirav').addEventListener('click', async () => {
    const btn = $('#stTestMeirav');
    btn.disabled = true;
    btn.textContent = '⏳ שולחת בדיקה למירב…';
    try {
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'בדיקת מערכת — שלום מירב', history: [] })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      if (data.reply){
        btn.textContent = '✓ מירב ענתה: ' + data.reply.slice(0, 60) + '…';
        btn.style.background = 'rgba(74,222,128,.18)';
        btn.style.color = '#4ade80';
        btn.style.borderColor = 'rgba(74,222,128,.4)';
      } else {
        btn.textContent = '⚠ אין תשובה — בדקי env var GEMINI_API_KEY';
      }
    } catch (e){
      btn.textContent = '✗ שגיאה: ' + e.message;
      btn.style.background = 'rgba(239,68,68,.18)';
      btn.style.color = '#ff8b8b';
      btn.style.borderColor = 'rgba(239,68,68,.4)';
    }
    setTimeout(() => { btn.disabled = false; }, 2500);
  });

  /* ─── Personal stats ─── */
  function loadStats(){
    function getN(key, def){
      try { const v = JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); return v.count || 0; }
      catch { return 0; }
    }
    function getLen(key){
      try { return Object.keys(JSON.parse(localStorage.getItem(key) || '{}')).length; }
      catch { return 0; }
    }
    function getArrLen(key){
      try { return (JSON.parse(localStorage.getItem(key) || '[]')).length; }
      catch { return 0; }
    }
    const stats = [
      { b: getN('kz_morning_streak_v1'),    s:'🌅 בקרים' },
      { b: getN('kz_60s_streak_v1'),        s:'✦ 60 שניות' },
      { b: getN('kz_learning_streak_v1'),   s:'📚 לימוד' },
      { b: getLen('kz_tehilim_read_v1'),    s:'📿 פרקי תהילים' },
      { b: getLen('kz_pw_prayed_v1'),       s:'🙏 התפללת על' },
      { b: getArrLen('kz_local_candles_v1'), s:'🕯 נרות' },
      { b: getLen('kz_kids_read_v1'),       s:'📖 סיפורים' },
      { b: getArrLen('kz_family_archive_v1'), s:'👨‍👩 משפחה' }
    ];
    $('#stStats').innerHTML = stats.map(s => `<div class="st-stat"><b>${s.b}</b><span>${s.s}</span></div>`).join('');
  }

  function runAll(){
    runClientChecks();
    runServerChecks();
    runMeiravChecks();
    loadStats();
  }

  $('#stRecheck').addEventListener('click', runAll);
  runAll();
})();
