/* ============================================================
   KZ CALENDAR — daily + weekly Jewish info widget
   - Today: Hebrew date, parsha of the week, Daf Yomi, candle
     lighting (next Shabbat / chag), holidays, next holiday.
   - Auto-detects city via geolocation; falls back to Jerusalem.
   - Source: Hebcal public API (no key needed).
   - Mounts into [data-kz-calendar].
   ============================================================ */
(function(){
  'use strict';

  const DEFAULT_CITY = { name: 'ירושלים', geonameid: 281184, tz: 'Asia/Jerusalem' };
  const STORAGE_CITY = 'kz_cal_city_v1';

  const HEBREW_MONTHS = {
    Nisan: 'ניסן', Iyyar: 'אייר', Sivan: 'סיון', Tamuz: 'תמוז',
    Av: 'אב', Elul: 'אלול', Tishrei: 'תשרי', Cheshvan: 'חשוון',
    Kislev: 'כסלו', Tevet: 'טבת', "Sh'vat": 'שבט', Adar: 'אדר',
    'Adar I': 'אדר א׳', 'Adar II': 'אדר ב׳'
  };

  function loadCity(){
    try { return JSON.parse(localStorage.getItem(STORAGE_CITY) || 'null') || DEFAULT_CITY; }
    catch { return DEFAULT_CITY; }
  }
  function saveCity(c){ try { localStorage.setItem(STORAGE_CITY, JSON.stringify(c)); } catch {} }

  function fmtDate(d){
    return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  function fmtTime(iso){
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  }

  async function fetchHebDate(){
    const t = new Date();
    const url = `https://www.hebcal.com/converter?cfg=json&gy=${t.getUTCFullYear()}&gm=${t.getUTCMonth()+1}&gd=${t.getUTCDate()}&g2h=1`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('hebcal');
    return r.json();
  }

  async function fetchEvents(city){
    // Get this week's parsha + candle lighting + holidays + daf yomi
    const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&year=now&month=x&ss=on&mf=on&c=on&geonameid=${city.geonameid}&M=on&s=on&F=on&d=on&D=on`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('hebcal events');
    return r.json();
  }

  function build(){
    const mount = document.querySelector('[data-kz-calendar]');
    if (!mount || mount.querySelector('.kz-cal-card')) return null;

    const card = document.createElement('section');
    card.className = 'kz-cal-card card';
    card.innerHTML = `
      <div class="mini-title">
        <span class="mini-ornament">📅</span>
        <span>היומן היהודי</span>
        <button class="kz-cal-city" id="kzCalCity">📍 ${loadCity().name}</button>
      </div>
      <div class="kz-cal-today">
        <div class="kz-cal-heb" id="kzCalHeb">—</div>
        <div class="kz-cal-greg" id="kzCalGreg">—</div>
      </div>
      <div class="kz-cal-rows">
        <div class="kz-cal-row" data-row="parsha"><span class="kz-cal-icn">📜</span><span class="kz-cal-label">פרשת השבוע</span><b>—</b></div>
        <div class="kz-cal-row" data-row="daf"   ><span class="kz-cal-icn">📖</span><span class="kz-cal-label">דף יומי</span><b>—</b></div>
        <div class="kz-cal-row" data-row="candle"><span class="kz-cal-icn">🕯</span><span class="kz-cal-label">הדלקת נרות</span><b>—</b></div>
        <div class="kz-cal-row" data-row="havdala"><span class="kz-cal-icn">✨</span><span class="kz-cal-label">צאת השבת</span><b>—</b></div>
        <div class="kz-cal-row" data-row="holiday"><span class="kz-cal-icn">🎉</span><span class="kz-cal-label">מועד הבא</span><b>—</b></div>
      </div>`;
    mount.appendChild(card);
    card.querySelector('#kzCalCity').addEventListener('click', () => pickCity(card));
    return card;
  }

  function setRow(card, row, value){
    const el = card.querySelector(`[data-row="${row}"] b`);
    if (el) el.textContent = value || '—';
  }

  async function refresh(card){
    const city = loadCity();
    try {
      const [heb, ev] = await Promise.all([fetchHebDate(), fetchEvents(city)]);
      const hd = heb.hd, hm = HEBREW_MONTHS[heb.hm] || heb.hm, hy = heb.hy;
      card.querySelector('#kzCalHeb').textContent  = `${hd} ${hm} ${hy}`;
      card.querySelector('#kzCalGreg').textContent = fmtDate(new Date());

      const items = (ev.items || []);

      const parsha = items.find(i => i.category === 'parashat');
      setRow(card, 'parsha', parsha?.hebrew || parsha?.title || '—');

      const daf = items.find(i => i.category === 'dafyomi');
      setRow(card, 'daf', daf?.hebrew || daf?.title || '—');

      const today = new Date(); today.setHours(0,0,0,0);
      const upcomingCandle  = items.find(i => i.category === 'candles'  && new Date(i.date) >= today);
      const upcomingHavdala = items.find(i => i.category === 'havdalah' && new Date(i.date) >= today);
      setRow(card, 'candle',  upcomingCandle  ? fmtTime(upcomingCandle.date)  : '—');
      setRow(card, 'havdala', upcomingHavdala ? fmtTime(upcomingHavdala.date) : '—');

      const upcomingHoliday = items.find(i =>
        ['holiday','roshchodesh','mevarchim','dafyomi'].indexOf(i.category) === 0
        && new Date(i.date) >= today
      ) || items.find(i => i.category === 'holiday' && new Date(i.date) >= today);
      setRow(card, 'holiday', upcomingHoliday ? `${upcomingHoliday.hebrew || upcomingHoliday.title} · ${new Date(upcomingHoliday.date).toLocaleDateString('he-IL', { day:'numeric', month:'short' })}` : '—');
    } catch {
      card.querySelector('#kzCalHeb').textContent = 'לא הצלחנו לטעון את היומן';
    }
  }

  function pickCity(card){
    const overlay = document.createElement('div');
    overlay.className = 'kz-cal-picker';
    overlay.innerHTML = `
      <div class="kz-cal-picker-card">
        <h4>בחירת עיר לזמני תפילה</h4>
        <div class="kz-cal-picker-grid">
          ${[
            { name:'ירושלים', id:281184 }, { name:'תל אביב', id:293397 },
            { name:'חיפה', id:294801 }, { name:'באר שבע', id:295530 },
            { name:'צפת', id:293100 }, { name:'אילת', id:295277 },
            { name:'ניו יורק', id:5128581 }, { name:'לוס אנג\'לס', id:5368361 },
            { name:'לונדון', id:2643743 }, { name:'פריז', id:2988507 },
            { name:'בואנוס איירס', id:3435910 }, { name:'מלבורן', id:2158177 },
            { name:'מוסקבה', id:524901 }, { name:'יוהנסבורג', id:993800 }
          ].map(c => `<button data-id="${c.id}" data-name="${c.name}">${c.name}</button>`).join('')}
        </div>
        <button class="kz-cal-picker-close">סגור</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target.classList.contains('kz-cal-picker')) overlay.remove();
      const b = e.target.closest('button[data-id]');
      if (b){
        saveCity({ name: b.dataset.name, geonameid: parseInt(b.dataset.id, 10), tz: 'Asia/Jerusalem' });
        card.querySelector('#kzCalCity').textContent = `📍 ${b.dataset.name}`;
        refresh(card);
        overlay.remove();
      }
      if (e.target.classList.contains('kz-cal-picker-close')) overlay.remove();
    });
  }

  function init(){
    const card = build();
    if (!card) return;
    refresh(card);
    // Refresh every hour
    setInterval(() => refresh(card), 3600_000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
