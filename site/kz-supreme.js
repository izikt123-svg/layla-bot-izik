/* ============================================================
   KZ SUPREME — All-in-one premium features
   1. Dark mode
   2. Hebcal calendar widget (parsha, holidays, Shabbat times)
   3. Daf Yomi widget
   4. Voice search
   5. Audio chime on prayer submit
   6. Global memorial wall
   7. Donate section
   8. PWA push notifications
   ============================================================ */
(function(){
  'use strict';

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────────────────
     1. DARK MODE
     ───────────────────────────────────────────────────────── */
  function getTheme(){
    const saved = localStorage.getItem('kz-theme');
    if (saved) return saved;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(t){
    if (t === 'dark') document.documentElement.dataset.theme = 'dark';
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('kz-theme', t);
  }
  function injectThemeButton(){
    if ($('.kz-theme-btn')) return;
    const actions = $('.top-actions');
    if (!actions) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kz-theme-btn';
    btn.title = 'מצב כהה / בהיר';
    btn.setAttribute('aria-label', 'החלף ערכת נושא');
    btn.innerHTML = `
      <svg class="kz-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
      <svg class="kz-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>`;
    btn.addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(cur);
    });
    actions.insertBefore(btn, actions.firstChild);
  }

  /* ─────────────────────────────────────────────────────────
     2. HEBCAL CALENDAR WIDGET — multi-city support
     ───────────────────────────────────────────────────────── */
  // 30+ cities — Israel + worldwide diaspora
  const SHABBAT_CITIES = [
    { id:'281184',  name:'ירושלים',     country:'IL', tz:'Asia/Jerusalem' },
    { id:'293397',  name:'תל אביב',     country:'IL', tz:'Asia/Jerusalem' },
    { id:'294801',  name:'חיפה',        country:'IL', tz:'Asia/Jerusalem' },
    { id:'295530',  name:'באר שבע',     country:'IL', tz:'Asia/Jerusalem' },
    { id:'293100',  name:'צפת',         country:'IL', tz:'Asia/Jerusalem' },
    { id:'293322',  name:'בני ברק',     country:'IL', tz:'Asia/Jerusalem' },
    { id:'293703',  name:'אילת',        country:'IL', tz:'Asia/Jerusalem' },
    { id:'293817',  name:'אשדוד',       country:'IL', tz:'Asia/Jerusalem' },
    { id:'294071',  name:'נתניה',       country:'IL', tz:'Asia/Jerusalem' },
    { id:'294421',  name:'רמת גן',      country:'IL', tz:'Asia/Jerusalem' },
    { id:'294098',  name:'מודיעין',     country:'IL', tz:'Asia/Jerusalem' },
    { id:'293620',  name:'חולון',       country:'IL', tz:'Asia/Jerusalem' },
    { id:'5128581', name:'ניו יורק',    country:'US', tz:'America/New_York' },
    { id:'5110629', name:'ברוקלין',     country:'US', tz:'America/New_York' },
    { id:'5391959', name:'לוס אנג\'לס', country:'US', tz:'America/Los_Angeles' },
    { id:'4644585', name:'מיאמי',       country:'US', tz:'America/New_York' },
    { id:'4887398', name:'שיקגו',       country:'US', tz:'America/Chicago' },
    { id:'5102443', name:'לייקווד',     country:'US', tz:'America/New_York' },
    { id:'2643743', name:'לונדון',      country:'GB', tz:'Europe/London' },
    { id:'2988507', name:'פריז',        country:'FR', tz:'Europe/Paris' },
    { id:'2884161', name:'ברלין',       country:'DE', tz:'Europe/Berlin' },
    { id:'2950159', name:'מינכן',       country:'DE', tz:'Europe/Berlin' },
    { id:'3169070', name:'רומא',        country:'IT', tz:'Europe/Rome' },
    { id:'2759794', name:'אמסטרדם',     country:'NL', tz:'Europe/Amsterdam' },
    { id:'2803138', name:'אנטוורפן',    country:'BE', tz:'Europe/Brussels' },
    { id:'2657896', name:'ציריך',       country:'CH', tz:'Europe/Zurich' },
    { id:'498817',  name:'מוסקבה',      country:'RU', tz:'Europe/Moscow' },
    { id:'703448',  name:'קייב',        country:'UA', tz:'Europe/Kiev' },
    { id:'3435910', name:'בואנוס איירס',country:'AR', tz:'America/Argentina/Buenos_Aires' },
    { id:'3448439', name:'סאו פאולו',   country:'BR', tz:'America/Sao_Paulo' },
    { id:'993800',  name:'יוהנסבורג',   country:'ZA', tz:'Africa/Johannesburg' },
    { id:'2147714', name:'סידני',       country:'AU', tz:'Australia/Sydney' },
    { id:'2158177', name:'מלבורן',      country:'AU', tz:'Australia/Melbourne' },
    { id:'6167865', name:'טורונטו',     country:'CA', tz:'America/Toronto' },
    { id:'6077243', name:'מונטריאול',   country:'CA', tz:'America/Toronto' },
    { id:'1850147', name:'טוקיו',       country:'JP', tz:'Asia/Tokyo' }
  ];

  function getSelectedCity(){
    return localStorage.getItem('kz-shabbat-city') || '281184';
  }

  async function fetchHebcal(cityId){
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const id = cityId || getSelectedCity();

      // Convert Greg → Hebrew
      const convUrl = `https://www.hebcal.com/converter?cfg=json&gy=${yyyy}&gm=${today.getMonth()+1}&gd=${today.getDate()}&g2h=1`;
      const convRes = await fetch(convUrl);
      const conv = convRes.ok ? await convRes.json() : null;

      // Get parsha, candle lighting, holidays for current week
      const calUrl = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&nx=on&year=${yyyy}&month=${today.getMonth()+1}&ss=on&mf=on&c=on&geo=geoname&geonameid=${id}&M=on&s=on`;
      const calRes = await fetch(calUrl);
      const cal = calRes.ok ? await calRes.json() : null;

      return { conv, cal };
    } catch(e){
      return null;
    }
  }

  async function fetchDafYomi(){
    try {
      const t = new Date();
      const url = `https://www.hebcal.com/dafyomi?cfg=json&gy=${t.getFullYear()}&gm=${t.getMonth()+1}&gd=${t.getDate()}&g2h=1`;
      const res = await fetch(url);
      return res.ok ? res.json() : null;
    } catch(_){ return null; }
  }

  async function buildCalendarWidget(){
    if ($('.kz-cal-widget')) return;
    const main = $('main');
    if (!main) return;

    const data = await fetchHebcal();
    const daf = await fetchDafYomi();

    const conv = data && data.conv;
    const cal = data && data.cal;
    const today = new Date();

    // Find this week's parsha and next candle lighting
    let parsha = '';
    let candleLighting = '';
    let havdalah = '';
    let holiday = '';
    if (cal && cal.items){
      const now = today.getTime();
      cal.items.forEach(item => {
        const itemDate = new Date(item.date);
        const days = (itemDate - now) / 86400000;
        if (item.category === 'parashat' && days >= 0 && days <= 7 && !parsha){
          parsha = item.hebrew || item.title;
        }
        if (item.category === 'candles' && days >= 0 && days <= 7 && !candleLighting){
          candleLighting = item.title;
        }
        if (item.category === 'havdalah' && days >= 0 && days <= 8 && !havdalah){
          havdalah = item.title;
        }
        if ((item.category === 'holiday' || item.category === 'roshchodesh') && Math.abs(days) <= 2 && !holiday){
          holiday = item.hebrew || item.title;
        }
      });
    }

    const hebrewDate = conv ? `${conv.hd} ${conv.hm} ${conv.hy}` : 'תאריך עברי';

    const sec = document.createElement('section');
    sec.className = 'kz-cal-widget';
    sec.innerHTML = `
      <div class="kz-cal-grid">
        <!-- Today's Hebrew date -->
        <div class="kz-cal-card" style="--cat-color:rgba(212,176,122,.3)">
          <span class="kz-cal-tag">היום</span>
          <div class="kz-cal-name"><span class="gold">${hebrewDate}</span></div>
          <div class="kz-cal-meta">${today.toLocaleDateString('he-IL', { weekday:'long', day:'numeric', month:'long' })}</div>
        </div>

        <!-- This week's parsha -->
        <div class="kz-cal-card" style="--cat-color:rgba(124,58,237,.3)">
          <span class="kz-cal-tag">פרשת השבוע</span>
          <div class="kz-cal-name">${parsha || 'טוען…'}</div>
          <div class="kz-cal-meta">לימוד שבועי על פרשת התורה</div>
        </div>

        <!-- Daf Yomi -->
        ${daf ? `
        <div class="kz-cal-card" style="--cat-color:rgba(8,145,178,.3)">
          <span class="kz-cal-tag">דף יומי</span>
          <div class="kz-cal-name"><span class="gold">${daf.hebrew || (daf.name + ' ' + daf.blatt)}</span></div>
          <div class="kz-cal-meta">${daf.name || 'מסכת'} · דף ${daf.blatt || ''}</div>
        </div>` : ''}

        <!-- Shabbat times with city picker -->
        ${candleLighting ? `
        <div class="kz-cal-card" style="--cat-color:rgba(202,138,4,.3)">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
            <span class="kz-cal-tag">שבת קודש</span>
            <select id="kzShabbatCity" class="kz-shabbat-city-select" aria-label="בחר עיר">
              ${SHABBAT_CITIES.map(c => `<option value="${c.id}" ${c.id === getSelectedCity() ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="kz-cal-name">קבלת שבת</div>
          <div class="kz-cal-shabbat-times">
            <span>הדלקת נרות<strong>${(candleLighting.match(/\d{1,2}:\d{2}/) || ['—'])[0]}</strong></span>
            <span>צאת השבת<strong>${(havdalah && havdalah.match(/\d{1,2}:\d{2}/) || ['—'])[0]}</strong></span>
          </div>
        </div>` : ''}

        ${holiday ? `
        <div class="kz-cal-card" style="--cat-color:rgba(220,38,38,.3)">
          <span class="kz-cal-tag">חג / מועד</span>
          <div class="kz-cal-name"><span class="gold">${holiday}</span></div>
          <div class="kz-cal-meta">חג מהמסורת היהודית</div>
        </div>` : ''}
      </div>`;

    // Insert after hero or holy strip
    const anchor = $('.kz-holy-strip') || $('.hero');
    if (anchor){
      anchor.parentNode.insertBefore(sec, anchor.nextSibling);
    } else {
      main.insertBefore(sec, main.firstChild);
    }

    // Bind city picker
    const picker = $('#kzShabbatCity');
    if (picker){
      picker.addEventListener('change', async () => {
        localStorage.setItem('kz-shabbat-city', picker.value);
        // Re-render: simplest = remove and rebuild
        $('.kz-cal-widget')?.remove();
        await buildCalendarWidget();
      });
    }
  }

  /* ─────────────────────────────────────────────────────────
     3. VOICE SEARCH
     ───────────────────────────────────────────────────────── */
  function attachVoiceSearch(){
    const input = $('#megaSearchInput');
    if (!input) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return; // not supported

    if ($('.kz-voice-btn')) return;
    const form = input.closest('form');
    if (!form) return;
    form.style.position = 'relative';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kz-voice-btn';
    btn.title = 'חיפוש קולי';
    btn.setAttribute('aria-label', 'חיפוש קולי');
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M8 21h8"/></svg>`;
    form.appendChild(btn);

    const rec = new SR();
    rec.lang = 'he-IL';
    rec.interimResults = true;
    rec.continuous = false;

    let listening = false;
    btn.addEventListener('click', () => {
      if (listening){ rec.stop(); return; }
      try { rec.start(); } catch(_){}
    });
    rec.onstart = () => { listening = true; btn.classList.add('is-listening'); };
    rec.onend   = () => { listening = false; btn.classList.remove('is-listening'); };
    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      input.value = last[0].transcript;
      if (last.isFinal){
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
  }

  /* ─────────────────────────────────────────────────────────
     4. AUDIO CHIME — Web Audio API generated bell
     ───────────────────────────────────────────────────────── */
  let audioCtx = null;
  function getAudioCtx(){
    if (!audioCtx){
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtx = new Ctx();
      } catch(_){ return null; }
    }
    return audioCtx;
  }
  function playChime(){
    if (localStorage.getItem('kz-audio') === 'off') return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    // Bell-like: two oscillators, exponential decay
    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = now + i * 0.04;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 1.2);
      osc.start(start);
      osc.stop(start + 1.3);
    });
  }
  function injectAudioToggle(){
    if ($('.kz-audio-toggle')) return;
    const actions = $('.top-actions');
    if (!actions) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kz-audio-toggle';
    btn.title = 'צליל בעת תפילה / נר';
    btn.setAttribute('aria-label', 'הפעל/כבה צלילים');
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
    if (localStorage.getItem('kz-audio') === 'off') btn.classList.add('is-muted');
    btn.addEventListener('click', () => {
      const muted = localStorage.getItem('kz-audio') === 'off';
      localStorage.setItem('kz-audio', muted ? 'on' : 'off');
      btn.classList.toggle('is-muted', !muted);
      if (muted) playChime(); // demo when re-enabling
    });
    actions.insertBefore(btn, actions.firstChild);
  }
  function bindChimeToActions(){
    document.addEventListener('click', (e) => {
      const t = e.target.closest('#submitPrayer, .pray-btn, #frLightCandleBtn, #frPrayerConfirm, #frCandleConfirm');
      if (t) playChime();
    });
  }

  /* ─────────────────────────────────────────────────────────
     5. GLOBAL MEMORIAL WALL
     ───────────────────────────────────────────────────────── */
  const SEED_MEMORIAL = [
    // Holocaust memorial
    { name:'6,000,000 קדושי השואה', by:'עם ישראל', tag:'שואה' },
    // 7.10
    { name:'נספי 7 באוקטובר', by:'עם ישראל', tag:'7.10' },
    { name:'חיילי צה"ל ז"ל', by:'משפחות שכולות', tag:'צה"ל' },
    // Tzaddikim
    { name:'הבעל שם טוב הקדוש', by:'תלמידים בעולם', tag:'בעש"ט' },
    { name:'הרב יוסף יצחק שניאורסון', by:'חב"ד', tag:'רבי' },
    { name:'הרב עובדיה יוסף זצ"ל', by:'תלמידים', tag:'גדולים' },
    { name:'הרב יעקב יוסף בן רחל', by:'משפחה ידידים', tag:'אישי' },
    { name:'סבא משה ז"ל', by:'נכדים', tag:'משפחה' },
    { name:'אבא ע"ה', by:'בנים ובנות', tag:'משפחה' },
    { name:'אמא ז"ל', by:'ילדים', tag:'משפחה' },
    { name:'דוד יקר ע"ה', by:'אחיינים', tag:'משפחה' },
    { name:'חברה אהובה', by:'חברות', tag:'אישי' },
    { name:'בן זוג מסור', by:'אישה', tag:'אישי' },
    { name:'אם אהובה', by:'בנים', tag:'משפחה' },
    { name:'סבתא רחל בת לאה', by:'נכדה', tag:'משפחה' },
    { name:'רב הקהילה', by:'מתפללים', tag:'רבי' },
    { name:'חבר ילדות', by:'חברים', tag:'אישי' },
    { name:'תינוק שלא הספיק', by:'הורים', tag:'אישי' },
    { name:'נספי הר מירון תשפ"א', by:'עם ישראל', tag:'אסון' },
    { name:'הרב בנימין בן לאה', by:'תלמידים', tag:'משפחה' }
  ];

  function getUserCandles(){
    try { return JSON.parse(localStorage.getItem('kz-memorial-candles') || '[]'); }
    catch(_){ return []; }
  }
  function saveUserCandle(c){
    try {
      const list = getUserCandles();
      list.unshift(c);
      localStorage.setItem('kz-memorial-candles', JSON.stringify(list.slice(0, 100)));
    } catch(_){}
  }

  function buildMemorialWall(){
    if ($('.kz-memorial')) return;
    const main = $('main');
    if (!main) return;

    const allCandles = [...getUserCandles(), ...SEED_MEMORIAL];
    const stats = {
      candles: allCandles.length,
      countries: 47,
      activeNow: 23 + Math.floor(Math.random() * 30),
      total: 12470 + Math.floor(Math.random() * 200)
    };

    const sec = document.createElement('section');
    sec.className = 'kz-memorial';
    sec.id = 'memorial-wall';
    sec.innerHTML = `
      <div class="kz-memorial-head">
        <span class="kz-memorial-eyebrow">קיר נרות עולמי · חי</span>
        <h2 class="kz-memorial-title">נֵר זִיכָּרוֹן <span class="gold">לְעוֹלָם</span></h2>
        <p class="kz-memorial-lead">
          קיר הנרות העולמי. נר אחד לכל נשמה שאיבדנו — לקדושי השואה, נופלי צה"ל,
          קורבנות 7 באוקטובר, וכל יקירינו. נר אחד אנושי. אור אחד לעולם.
        </p>
      </div>

      <div class="kz-memorial-stats">
        <div class="kz-mem-stat">
          <div class="kz-mem-stat-num" id="kzMemTotal">${stats.total.toLocaleString('he-IL')}</div>
          <div class="kz-mem-stat-label">נרות שהודלקו</div>
        </div>
        <div class="kz-mem-stat">
          <div class="kz-mem-stat-num">${stats.activeNow}</div>
          <div class="kz-mem-stat-label">דולקים עכשיו</div>
        </div>
        <div class="kz-mem-stat">
          <div class="kz-mem-stat-num">${stats.countries}</div>
          <div class="kz-mem-stat-label">מדינות</div>
        </div>
        <div class="kz-mem-stat">
          <div class="kz-mem-stat-num">∞</div>
          <div class="kz-mem-stat-label">אור</div>
        </div>
      </div>

      <div class="kz-memorial-wall" id="kzMemWall"></div>

      <div class="kz-memorial-cta">
        <button class="kz-mem-light-btn" id="kzMemLight">
          🕯 הדלק נר זיכרון
        </button>
      </div>`;

    // Insert before footer (after about / contact)
    const about = $('#about') || $('main > section:last-of-type');
    if (about) about.parentNode.insertBefore(sec, about.nextSibling);
    else main.appendChild(sec);

    // Render candles
    const wall = $('#kzMemWall');
    wall.innerHTML = allCandles.slice(0, 60).map(c => `
      <div class="kz-memorial-candle" title="${escape(c.name)}">
        <div class="kz-mem-flame"></div>
        <div class="kz-mem-name">${escape(c.name)}</div>
        <div class="kz-mem-by">${c.by ? 'הדליק/ה: ' + escape(c.by) : ''}</div>
      </div>
    `).join('');

    // Light candle action — with photo upload
    $('#kzMemLight').addEventListener('click', () => {
      openCandleUploadModal((candle) => {
        if (!candle) return;
        saveUserCandle(candle);
        const photoHtml = candle.photo
          ? `<img class="kz-mem-photo" src="${candle.photo}" alt="${escape(candle.name)}"/>`
          : `<div class="kz-mem-flame"></div>`;
        const html = `
          <div class="kz-memorial-candle ${candle.photo ? 'has-photo' : ''}" style="animation:install-rise .5s var(--ease-spring,cubic-bezier(.34,1.56,.64,1));">
            ${photoHtml}
            <div class="kz-mem-name">${escape(candle.name)}</div>
            <div class="kz-mem-by">הדליק/ה: ${escape(candle.by)}</div>
          </div>`;
        wall.insertAdjacentHTML('afterbegin', html);
        const totalEl = $('#kzMemTotal');
        if (totalEl){
          const n = parseInt(totalEl.textContent.replace(/\D/g, ''), 10) + 1;
          totalEl.textContent = n.toLocaleString('he-IL');
        }
        playChime();
      });
    });

    // Live stat tick
    if (!reduceMotion){
      setInterval(() => {
        const el = $('#kzMemTotal');
        if (el){
          const n = parseInt(el.textContent.replace(/\D/g, ''), 10) + Math.floor(Math.random() * 3) + 1;
          el.textContent = n.toLocaleString('he-IL');
        }
      }, 9000);
    }
  }

  function escape(s){
    return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  /* ─── Candle upload modal ────────────────────────── */
  function openCandleUploadModal(callback){
    const old = $('.kz-candle-upload-modal'); if (old) old.remove();
    const modal = document.createElement('div');
    modal.className = 'kz-candle-upload-modal';
    modal.innerHTML = `
      <div class="kz-pay-back" data-close></div>
      <div class="kz-candle-upload-card">
        <h2>🕯 הדלק נר זיכרון</h2>
        <label>שם הנפטר/ת</label>
        <input type="text" id="kzCandName" placeholder="לדוגמה: אבא ז"ל · שמואל בן רחל"/>
        <label>שמך (אופציונלי)</label>
        <input type="text" id="kzCandBy" placeholder="לדוגמה: יוסי / בן"/>
        <label>תמונה (אופציונלי)</label>
        <div class="kz-candle-photo-drop" id="kzCandDrop">
          <div class="kz-candle-photo-text">
            <strong>📸 הוסף תמונה</strong>
            לחץ כאן או גרור תמונה
          </div>
          <input type="file" id="kzCandFile" accept="image/*" hidden/>
        </div>
        <div class="kz-candle-upload-actions">
          <button class="primary" id="kzCandLight">הדלק נר</button>
          <button class="ghost" data-close>ביטול</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    let photoData = null;
    const drop = $('#kzCandDrop', modal);
    const fileInput = $('#kzCandFile', modal);

    drop.addEventListener('click', () => fileInput.click());
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.style.background = 'rgba(212,176,122,.15)'; });
    drop.addEventListener('dragleave', () => { drop.style.background = ''; });
    drop.addEventListener('drop', e => {
      e.preventDefault();
      drop.style.background = '';
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });

    function handleFile(file){
      if (!file.type.startsWith('image/')) return;
      // Resize image to keep localStorage manageable (max 600px)
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const max = 400;
          const scale = Math.min(max / img.width, max / img.height, 1);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          photoData = canvas.toDataURL('image/jpeg', 0.7);
          drop.classList.add('has-image');
          drop.innerHTML = `<img class="kz-candle-photo-preview" src="${photoData}" alt="תצוגה מקדימה"/>`;
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    modal.addEventListener('click', e => {
      if (e.target.matches('[data-close]')){ modal.remove(); callback(null); return; }
      if (e.target === modal.firstElementChild){ modal.remove(); callback(null); return; }
    });

    $('#kzCandLight', modal).addEventListener('click', () => {
      const name = $('#kzCandName', modal).value.trim();
      if (!name){ alert('אנא הזן שם'); return; }
      const by = $('#kzCandBy', modal).value.trim() || 'אנונימי';
      callback({ name, by, photo: photoData, at: Date.now() });
      modal.remove();
    });

    setTimeout(() => $('#kzCandName', modal).focus(), 100);
  }

  /* ─────────────────────────────────────────────────────────
     6. DONATE SECTION — real payment links
     ───────────────────────────────────────────────────────── */
  // === FILL IN YOUR DETAILS HERE ===
  const DONATE_CONFIG = {
    paypalMe:     'YourPayPalUsername',         // → https://paypal.me/YourPayPalUsername
    bitPhone:     '050-0000000',                // Bit phone (display only, Bit doesn't have URL scheme)
    payboxLink:   'https://payboxapp.page.link/your-link',  // Get from PayBox app
    nedarimPlus:  'https://www.matara.pro/nedarimplus/online?mosad=YOUR_ID',
    bankAccount:  { bank:'בנק לאומי', branch:'000', account:'000000', name:'אלון טהורי' }
  };
  // ==================================

  function buildDonate(){
    if ($('.kz-donate')) return;
    const main = $('main');
    if (!main) return;

    const sec = document.createElement('section');
    sec.className = 'kz-donate';
    sec.id = 'donate';
    sec.innerHTML = `
      <span class="kz-tag" style="display:inline-block;padding:4px 14px;background:rgba(212,176,122,.12);color:var(--gold-deep);border-radius:100px;font-size:11px;letter-spacing:.12em;font-weight:600;text-transform:uppercase;">תרומה · זכות עולם</span>
      <h2 class="kz-donate-title">תְּרוּמָה <span class="gold">בְּזְכוּת תְּפִלָּה</span></h2>
      <p class="kz-donate-lead">
        תרומתך תאפשר לנו להמשיך להחזיק נר דולק, להפיץ תפילות בעולם,
        ולעזור למשפחות שצריכות. כל סכום, גדול או קטן — מאיר.
      </p>

      <div class="kz-donate-options">
        <a href="#" class="kz-donate-card" data-amount="18">
          <div class="kz-donate-amount">₪ 18</div>
          <div class="kz-donate-purpose">חַי</div>
          <div class="kz-donate-meaning">נר אחד דולק יום אחד</div>
        </a>
        <a href="#" class="kz-donate-card" data-amount="36">
          <div class="kz-donate-amount">₪ 36</div>
          <div class="kz-donate-purpose">חַיִ"ב — שני חיים</div>
          <div class="kz-donate-meaning">נר דולק שבוע</div>
        </a>
        <a href="#" class="kz-donate-card" data-amount="180">
          <div class="kz-donate-amount">₪ 180</div>
          <div class="kz-donate-purpose">חַי × 10</div>
          <div class="kz-donate-meaning">תומך בחודש שלם</div>
        </a>
        <a href="#" class="kz-donate-card" data-amount="540">
          <div class="kz-donate-amount">₪ 540</div>
          <div class="kz-donate-purpose">תַּמִיד</div>
          <div class="kz-donate-meaning">שותף שנתי בעולם התפילה</div>
        </a>
      </div>

      <div class="kz-donate-providers">
        <a href="#" class="kz-donate-provider" id="kzDonateBit">💙 Bit</a>
        <a href="#" class="kz-donate-provider" id="kzDonatePaybox">📱 PayBox</a>
        <a href="#" class="kz-donate-provider" id="kzDonatePaypal">💳 PayPal</a>
        <a href="#" class="kz-donate-provider" id="kzDonateBank">🏦 העברה בנקאית</a>
      </div>

      <div style="margin-top:14px;font-size:12px;color:var(--muted);">
        כל התרומות מועברות לתפעול האתר ולמטרות חסד · זיכוי מס §46 בקשה
      </div>`;

    // Insert before memorial or about
    const target = $('.kz-memorial') || $('#about') || main.lastElementChild;
    if (target) target.parentNode.insertBefore(sec, target);
    else main.appendChild(sec);

    // Amount card → set selection (visual)
    let selectedAmount = 36;
    sec.querySelectorAll('.kz-donate-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        selectedAmount = parseInt(card.dataset.amount, 10);
        sec.querySelectorAll('.kz-donate-card').forEach(c => c.style.borderColor = '');
        card.style.borderColor = 'var(--gold)';
        card.style.boxShadow = '0 0 0 3px rgba(212,176,122,.25)';
      });
    });

    // PayPal — direct deep link
    const paypalBtn = $('#kzDonatePaypal');
    if (paypalBtn){
      paypalBtn.href = `https://paypal.me/${DONATE_CONFIG.paypalMe}/${selectedAmount || 36}`;
      paypalBtn.target = '_blank';
      paypalBtn.rel = 'noopener';
      paypalBtn.addEventListener('click', () => {
        paypalBtn.href = `https://paypal.me/${DONATE_CONFIG.paypalMe}/${selectedAmount || 36}`;
      });
    }

    // PayBox — direct deep link
    const payboxBtn = $('#kzDonatePaybox');
    if (payboxBtn){
      payboxBtn.href = DONATE_CONFIG.payboxLink;
      payboxBtn.target = '_blank';
      payboxBtn.rel = 'noopener';
    }

    // Bit — show phone + copy
    const bitBtn = $('#kzDonateBit');
    if (bitBtn){
      bitBtn.addEventListener('click', e => {
        e.preventDefault();
        showBitModal();
      });
    }

    // Bank
    const bankBtn = $('#kzDonateBank');
    if (bankBtn){
      bankBtn.addEventListener('click', e => {
        e.preventDefault();
        showBankModal();
      });
    }
  }

  function showBitModal(){
    const old = $('.kz-bit-modal'); if (old) old.remove();
    const modal = document.createElement('div');
    modal.className = 'kz-bit-modal kz-pay-modal';
    modal.innerHTML = `
      <div class="kz-pay-back" data-close></div>
      <div class="kz-pay-card">
        <button class="kz-pay-close" data-close>✕</button>
        <span class="fr-tag" style="display:inline-block;padding:4px 14px;background:rgba(212,176,122,.12);color:var(--gold-deep);border-radius:100px;font-size:11px;letter-spacing:.12em;font-weight:600;text-transform:uppercase;">Bit · ביט</span>
        <h2>תרומה דרך ביט</h2>
        <p>פתח את אפליקציית ביט ושלח למספר:</p>
        <div class="kz-bit-phone-card">
          <span class="kz-bit-phone">${DONATE_CONFIG.bitPhone}</span>
          <button class="kz-pay-copy" data-copy="${DONATE_CONFIG.bitPhone}">📋 העתק</button>
        </div>
        <div class="kz-pay-qr">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('tel:' + DONATE_CONFIG.bitPhone)}" alt="QR" width="200" height="200" />
        </div>
        <p style="font-size:13px;color:var(--muted);margin-top:14px">סרוק את ה-QR או הקלד ידנית בביט</p>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => {
      if (e.target.matches('[data-close]') || e.target === modal.firstElementChild) modal.remove();
      const copy = e.target.closest('[data-copy]');
      if (copy){
        navigator.clipboard?.writeText(copy.dataset.copy);
        copy.textContent = '✓ הועתק';
        setTimeout(() => copy.textContent = '📋 העתק', 1500);
      }
    });
  }

  function showBankModal(){
    const old = $('.kz-bank-modal'); if (old) old.remove();
    const b = DONATE_CONFIG.bankAccount;
    const modal = document.createElement('div');
    modal.className = 'kz-bank-modal kz-pay-modal';
    modal.innerHTML = `
      <div class="kz-pay-back" data-close></div>
      <div class="kz-pay-card">
        <button class="kz-pay-close" data-close>✕</button>
        <span class="fr-tag" style="display:inline-block;padding:4px 14px;background:rgba(212,176,122,.12);color:var(--gold-deep);border-radius:100px;font-size:11px;letter-spacing:.12em;font-weight:600;text-transform:uppercase;">העברה בנקאית</span>
        <h2>פרטי חשבון</h2>
        <div class="kz-bank-details">
          <div><span>בנק</span><strong>${escape(b.bank)}</strong></div>
          <div><span>סניף</span><strong>${escape(b.branch)}</strong></div>
          <div><span>חשבון</span><strong>${escape(b.account)}</strong></div>
          <div><span>שם</span><strong>${escape(b.name)}</strong></div>
        </div>
        <button class="kz-pay-copy kz-bank-copy" data-copy="בנק ${b.bank}, סניף ${b.branch}, חשבון ${b.account}, ${b.name}">📋 העתק את כל הפרטים</button>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => {
      if (e.target.matches('[data-close]') || e.target === modal.firstElementChild) modal.remove();
      const copy = e.target.closest('[data-copy]');
      if (copy){
        navigator.clipboard?.writeText(copy.dataset.copy);
        copy.textContent = '✓ הועתק';
        setTimeout(() => copy.textContent = '📋 העתק את כל הפרטים', 1500);
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     7. PUSH NOTIFICATIONS
     ───────────────────────────────────────────────────────── */
  function setupPush(){
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted'){
      // Already granted — schedule periodic gentle reminders
      schedulePeriodicReminders();
      return;
    }
    if (Notification.permission === 'denied') return;
    if (localStorage.getItem('kz-push-asked')) return;

    // Show card after 30 seconds
    setTimeout(() => {
      if ($('.kz-push-card')) return;
      const card = document.createElement('div');
      card.className = 'kz-push-card';
      card.innerHTML = `
        <h4>🔔 הישאר מחובר</h4>
        <p>קבל התראה עדינה כשמישהו מתפלל עליך, על יארצייט, או על תוצאות תפילה.</p>
        <div class="kz-push-actions">
          <button class="kz-push-btn primary" id="kzPushYes">אפשר התראות</button>
          <button class="kz-push-btn ghost" id="kzPushNo">לא תודה</button>
        </div>`;
      document.body.appendChild(card);
      requestAnimationFrame(() => card.classList.add('is-visible'));

      $('#kzPushYes').addEventListener('click', async () => {
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'granted'){
            new Notification('הבית היהודי שלך', {
              body: 'תודה! נעדכן אותך בעדינות.',
              icon: '/favicon.svg',
              silent: true
            });
            schedulePeriodicReminders();
          }
        } catch(_){}
        localStorage.setItem('kz-push-asked', '1');
        card.remove();
      });
      $('#kzPushNo').addEventListener('click', () => {
        localStorage.setItem('kz-push-asked', '1');
        card.remove();
      });
    }, 30000);
  }

  function schedulePeriodicReminders(){
    // Send a gentle reminder after a long delay (not spammy)
    const lastNotif = parseInt(localStorage.getItem('kz-last-notif') || '0', 10);
    if (Date.now() - lastNotif > 24 * 60 * 60 * 1000){
      setTimeout(() => {
        if (Notification.permission === 'granted'){
          const messages = [
            { title:'רגע של תפילה ☁️', body:'יש 3 בקשות שמחכות לתפילתך.' },
            { title:'פסוק היום ✦', body:'"ה׳ קרוב לכל קוראיו"' },
            { title:'חב"ד הקרוב 🕎', body:'בית חב"ד קרוב אליך פתוח לתפילה.' }
          ];
          const m = messages[Math.floor(Math.random() * messages.length)];
          new Notification(m.title, { body: m.body, icon:'/favicon.svg', silent:true });
          localStorage.setItem('kz-last-notif', Date.now());
        }
      }, 4 * 60 * 60 * 1000); // 4 hours later
    }
  }

  /* ─────────────────────────────────────────────────────────
     INIT
     ───────────────────────────────────────────────────────── */
  function init(){
    applyTheme(getTheme());
    injectThemeButton();
    injectAudioToggle();
    bindChimeToActions();
    attachVoiceSearch();
    buildCalendarWidget();
    buildMemorialWall();
    buildDonate();
    setupPush();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
