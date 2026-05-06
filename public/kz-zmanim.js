/* ================================================================
   KZ-ZMANIM · live prayer times card (ADDITIVE only)
   ----------------------------------------------------------------
   Fetches today's zmanim from Hebcal's public JSON API, updates the
   card under "הפסוק של היום", highlights the next upcoming zman, and
   remembers the selected city in localStorage. Falls back silently if
   the API is unreachable — the skeleton rows become "—" instead.
   ================================================================ */
(function initKzZmanim() {
  const card = document.getElementById('zmanimCard');
  if (!card) return;
  const listEl = card.querySelector('#zmanimList');
  const citySel = card.querySelector('#zmanimCity');
  const dateEl = card.querySelector('#zmanimDate');
  const noteEl = card.querySelector('#zmanimNote');
  if (!listEl || !citySel) return;

  const STORE_KEY = 'kz-zmanim-city';
  const saved = (() => {
    try { return localStorage.getItem(STORE_KEY) || ''; }
    catch { return ''; }
  })();
  if (saved) {
    const opt = Array.from(citySel.options).find(o => o.value === saved);
    if (opt) citySel.value = saved;
  }

  const MAP = [
    { key: 'alotHaShachar', label: 'עלות השחר' },
    { key: 'sunrise',       label: 'נץ החמה' },
    { key: 'sofZmanShma',   label: 'סוף זמן ק״ש' },
    { key: 'sofZmanTfilla', label: 'סוף זמן תפילה' },
    { key: 'chatzot',       label: 'חצות היום' },
    { key: 'minchaGedola',  label: 'מנחה גדולה' },
    { key: 'minchaKetana',  label: 'מנחה קטנה' },
    { key: 'sunset',        label: 'שקיעה' },
    { key: 'tzeit7083deg',  label: 'צאת הכוכבים' },
  ];

  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function toHM(iso) {
    try {
      const d = new Date(iso);
      if (isNaN(+d)) return '—';
      return pad(d.getHours()) + ':' + pad(d.getMinutes());
    } catch { return '—'; }
  }
  function formatHebrewDate(iso) {
    try {
      const d = iso ? new Date(iso) : new Date();
      return d.toLocaleDateString('he-IL', { weekday:'long', day:'numeric', month:'long' });
    } catch { return ''; }
  }

  function render(data) {
    const times = (data && data.times) || {};
    const items = MAP.map(m => ({ ...m, iso: times[m.key] || null }))
      .filter(m => m.iso);
    if (!items.length) {
      // Show a graceful fallback row
      listEl.innerHTML = '';
      const li = document.createElement('li');
      li.className = 'zmanim-row';
      li.innerHTML = '<span>זמני תפילה</span><span>—</span>';
      listEl.appendChild(li);
      if (noteEl) noteEl.textContent = 'לא התקבלו זמנים מהמקור. נסו עיר אחרת או רעננו את הדף.';
      return;
    }
    const now = Date.now();
    let nextIdx = -1;
    for (let i = 0; i < items.length; i++) {
      const t = +new Date(items[i].iso);
      if (!isNaN(t) && t >= now) { nextIdx = i; break; }
    }
    listEl.innerHTML = '';
    items.forEach((m, i) => {
      const li = document.createElement('li');
      li.className = 'zmanim-row' + (i === nextIdx ? ' is-next' : '');
      const a = document.createElement('span'); a.textContent = m.label;
      const b = document.createElement('span'); b.textContent = toHM(m.iso);
      li.appendChild(a); li.appendChild(b);
      listEl.appendChild(li);
    });
    if (dateEl) dateEl.textContent = formatHebrewDate(data && data.date);
    if (noteEl) noteEl.textContent = 'מקור: Hebcal · מחושב למיקום הנבחר.';
  }

  function showError() {
    listEl.querySelectorAll('.zmanim-row').forEach(row => {
      const v = row.querySelector('span:last-child');
      if (v && /טוען/.test(v.textContent)) v.textContent = '—';
    });
    if (noteEl) noteEl.textContent = 'לא הצלחנו להביא זמנים כרגע. נסו שוב בעוד רגע.';
  }

  async function load(geonameid) {
    try {
      const url = 'https://www.hebcal.com/zmanim?cfg=json&geonameid=' + encodeURIComponent(geonameid);
      const res = await fetch(url, { cache:'no-store' });
      if (!res.ok) throw new Error('http ' + res.status);
      const data = await res.json();
      render(data);
    } catch {
      showError();
    }
  }

  load(citySel.value);
  citySel.addEventListener('change', () => {
    try { localStorage.setItem(STORE_KEY, citySel.value); } catch {}
    // Put skeletons back while the new city loads.
    listEl.querySelectorAll('.zmanim-row span:last-child').forEach(s => {
      s.textContent = 'טוען…';
    });
    listEl.querySelectorAll('.zmanim-row').forEach(r => r.classList.add('zmanim-skeleton'));
    load(citySel.value);
  });
})();
