/* ============================================================
   KZ MOURNERS — full 12-month milestone calendar
   - Input: name + Gregorian death date + custom + relation
   - Output: shiva (7), shloshim (30), monthly milestones,
     yahrzeit (1 year Hebrew anniversary), and ongoing Kaddish.
   - Hebrew date via Hebcal API.
   ============================================================ */
(function(){
  'use strict';
  const $ = (s) => document.querySelector(s);
  const STORE_KEY = 'kz_mourners_v1';

  function fmtDate(d){
    return d.toLocaleDateString('he-IL', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
  }
  function addDays(d, days){ const c = new Date(d); c.setDate(c.getDate() + days); return c; }
  function isToday(d){
    const t = new Date(); return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate();
  }
  function isPast(d){
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t && !isToday(d);
  }

  async function fetchHebDate(date){
    const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    const url = `https://www.hebcal.com/converter?cfg=json&gy=${y}&gm=${m}&gd=${d}&g2h=1`;
    try {
      const r = await fetch(url);
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  }
  async function fetchYahrzeitGregorian(date){
    /* Hebcal yahrzeit endpoint: returns the Gregorian dates of yearly yahrzeits */
    const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    const url = `https://www.hebcal.com/yahrzeit?cfg=json&hebdate=on&years=15&v=yahrzeit&i=on&n1=Anniversary&t1=Y&d1=${d}&m1=${m}&y1=${y}`;
    try {
      const r = await fetch(url);
      if (!r.ok) return [];
      const j = await r.json();
      return (j.items || []).map(it => ({ date: new Date(it.date), title: it.title, hebrew: it.hebrew }));
    } catch { return []; }
  }

  function relationBlessing(rel){
    if (rel === 'אבא' || rel === 'אמא') return 'מצוות כיבוד הורים נמשכת אחרי לכתם — כל מצווה ותפילה זוכים מהוריך.';
    if (rel === 'בעל' || rel === 'אישה') return 'הזיכרון שלכם הוא הברית שתמיד קיימת. תני לעצמך זמן.';
    if (rel === 'בן' || rel === 'בת') return 'אהבה שאיננה דועכת. הילד/ה שלך עכשיו במקום של אור.';
    return 'זכרו לברכה ימשיך לחיות בכל פעולה טובה שתעשי בשמו.';
  }

  function milestone(date, name, info, important){
    return { date, name, info, important: !!important };
  }

  async function buildMilestones(deathDate, name, relation, custom){
    const heb = await fetchHebDate(deathDate);
    const hebStr = heb ? `נפטר/ה ${heb.hd} ${heb.hm} ${heb.hy}` : '';
    const yahrzeits = await fetchYahrzeitGregorian(deathDate);

    const list = [];

    list.push(milestone(deathDate, 'יום הפטירה', 'תחילת תקופת השבעה. ברוך דיין האמת.', true));
    list.push(milestone(addDays(deathDate, 6), 'סיום השבעה', 'שבעה מסתיימת לאחר תפילת שחרית של היום השביעי. עליה לבית הקברות בסיום.', true));

    list.push(milestone(addDays(deathDate, 29), 'שלושים', 'לאחר שלושים יום. סיום המנהגי האבל לבן/בת זוג, אח/אחות.', true));

    if (relation === 'אבא' || relation === 'אמא'){
      list.push(milestone(addDays(deathDate, 90),  '3 חודשים', 'נהוג להמשיך באמירת קדיש 11 חודשים על אב/אם.'));
      list.push(milestone(addDays(deathDate, 180), '6 חודשים', 'אמצע תקופת אמירת הקדיש.'));
      list.push(milestone(addDays(deathDate, 330), 'סיום אמירת קדיש', 'אחרי 11 חודשים — סיום אמירת קדיש על אב/אם (יום אחד פחות מהשנה).', true));
    }

    if (yahrzeits.length){
      list.push(milestone(yahrzeits[0].date, 'יארצייט ראשון (שנה)', 'יום הזיכרון העברי הראשון. נר 24 שעות, אמירת קדיש, צדקה.', true));
      yahrzeits.slice(1).forEach((y, i) => {
        list.push(milestone(y.date, `יארצייט שנה ${i + 2}`, 'נר 24 שעות, אמירת קדיש לזכרו/ה.'));
      });
    } else {
      // Fallback: approximate +365 days
      const approx = addDays(deathDate, 365);
      list.push(milestone(approx, 'יארצייט (משוער)', 'התאריך העברי ייקבע אחרי טעינה מלאה של הלוח.', true));
    }

    return { milestones: list.sort((a,b) => a.date - b.date), hebStr, blessing: relationBlessing(relation) };
  }

  function render(data){
    $('#mrFormCard').hidden = true;
    $('#mrResult').hidden = false;
    $('#mrResultName').textContent = data.name;
    $('#mrHebDate').textContent = data.hebStr ? `${data.hebStr} · ${data.blessing}` : data.blessing;

    const ol = $('#mrMilestones');
    ol.innerHTML = data.milestones.map(m => {
      const cls = isToday(m.date) ? 'is-today' : (isPast(m.date) ? 'is-past' : '');
      return `<li class="mr-milestone ${cls}">
        <div class="mr-day-num">${m.date.getDate()}<small>${m.date.toLocaleDateString('he-IL', { month:'short' })}</small></div>
        <div>
          <div class="mr-milestone-name">${escapeHtml(m.name)}</div>
          <div class="mr-milestone-meta">${fmtDate(m.date)}</div>
          ${m.info ? `<div class="mr-milestone-info">${escapeHtml(m.info)}</div>` : ''}
        </div>
      </li>`;
    }).join('');

    /* Save to localStorage so the user can come back */
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ name: data.name, hebStr: data.hebStr, milestones: data.milestones.map(m => ({...m, date: m.date.toISOString()})) })); } catch {}
  }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  $('#mrForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#mrName').value.trim();
    const dateStr = $('#mrDate').value;
    const relation = $('#mrRelation').value;
    const custom = $('#mrCustom').value;
    if (!name || !dateStr) return;
    const death = new Date(dateStr + 'T12:00:00');
    const submitBtn = $('.mr-go');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ מייצרת לוח…';
    const data = await buildMilestones(death, name, relation, custom);
    submitBtn.disabled = false;
    submitBtn.textContent = 'צרי לי את הלוח';
    render({ ...data, name });
  });

  $('#mrReset').addEventListener('click', () => {
    $('#mrFormCard').hidden = false;
    $('#mrResult').hidden = true;
    $('#mrForm').reset();
    try { localStorage.removeItem(STORE_KEY); } catch {}
  });

  /* Restore on load */
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved && saved.milestones){
      render({
        name: saved.name,
        hebStr: saved.hebStr || '',
        blessing: '',
        milestones: saved.milestones.map(m => ({...m, date: new Date(m.date)}))
      });
    }
  } catch {}
})();
