/* ============================================================
   KZ SOLDIERS — prayers for soldiers, captives & missing
   ============================================================ */
(function(){
  'use strict';
  const $ = (s) => document.querySelector(s);

  const PRAYERS = {
    soldiers: `מי שברך אבותינו אברהם יצחק ויעקב,
הוא יברך את חיילי <b>צבא הגנה לישראל</b>,
העומדים על משמר ארצנו וערי אלקינו —
מגבול הלבנון ועד מדבר מצרים, ומן הים הגדול עד לבוא הערבה.
<b>יתן ה' את אויבינו הקמים עלינו ניגפים לפניהם.</b>
ויחזירם במהרה לחיק משפחתם בריאים ושלמים.`,
    captives: `אחינו כל בית ישראל,
הנתונים בצרה ובשביה —
המקום ירחם עליהם, ויוציאם מצרה לרווחה,
ומאפלה לאורה, ומשעבוד לגאולה,
<b>השתא בעגלא ובזמן קריב.</b>`,
    injured: `מי שברך אבותינו, אברהם יצחק ויעקב,
משה ואהרן, דוד ושלמה,
הוא ירפא את <b>פלוני בן פלונית</b> ואת כל פצועי צה"ל,
רפואה שלמה — רפואת הנפש ורפואת הגוף.
ה' יחזק וישא ויעורר רפואת בריאות שלמה לכל אבריו וגידיו,
בתוך שאר חולי ישראל.`
  };

  let activeTab = 'soldiers';
  function refreshPrayer(){
    $('#sdPrayerText').innerHTML = PRAYERS[activeTab].replace(/\n/g, '<br>');
  }

  document.querySelectorAll('.sd-tab').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.sd-tab').forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      activeTab = b.dataset.t;
      refreshPrayer();
      refreshWall();
      // Reset prayer button
      $('#sdPrayGo').classList.remove('is-done');
      $('#sdPrayGo').textContent = '🙏 אני התפללתי';
    });
  });

  /* Pray button: track local count + ping prayer-wall as a "pray" anonymously */
  const PRAY_KEY = 'kz_sd_prayed_v1';
  function load(){ try { return JSON.parse(localStorage.getItem(PRAY_KEY) || '{}'); } catch { return {}; } }
  function save(o){ try { localStorage.setItem(PRAY_KEY, JSON.stringify(o)); } catch {} }
  $('#sdPrayGo').addEventListener('click', () => {
    const o = load();
    const today = new Date().toISOString().slice(0,10);
    o[`${activeTab}_${today}`] = Date.now();
    save(o);
    $('#sdPrayGo').classList.add('is-done');
    $('#sdPrayGo').textContent = '✓ תודה — תפילתך נספרה';
    refreshCount();
  });

  function refreshCount(){
    const o = load();
    const weekAgo = Date.now() - 7 * 86400_000;
    const count = Object.values(o).filter(ts => ts > weekAgo).length;
    $('#sdPrayCount').textContent = count;
  }

  /* Wall: separate API namespace per category. Reuses /api/prayer-wall with cat */
  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  const CAT_MAP = { soldiers:'חיילים', captives:'שבויים', injured:'פצועים' };

  async function fetchWall(){
    try {
      const r = await fetch('/api/prayer-wall?live=1', { cache: 'no-store' });
      if (!r.ok) throw new Error();
      const all = (await r.json()).requests || [];
      return all.filter(p => p.cat === CAT_MAP[activeTab]);
    } catch { return []; }
  }

  const PRAYED_LOCAL = (() => { try { return JSON.parse(localStorage.getItem('kz_sd_prayed_local_v1') || '{}'); } catch { return {}; } })();
  function savePrayedLocal(){ try { localStorage.setItem('kz_sd_prayed_local_v1', JSON.stringify(PRAYED_LOCAL)); } catch {} }

  function renderWall(list){
    $('#sdWallCount').innerHTML = `<b>${list.length}</b>`;
    const grid = $('#sdGrid');
    grid.innerHTML = list.slice(0, 60).map(p => `
      <div class="sd-card" data-id="${escapeHtml(p.id)}">
        <div class="sd-card-name">${escapeHtml(p.for_name)}</div>
        ${p.text ? `<div class="sd-card-details">${escapeHtml(p.text)}</div>` : ''}
        <button class="sd-card-prayed ${PRAYED_LOCAL[p.id] ? 'is-done' : ''}" data-id="${escapeHtml(p.id)}">
          ${PRAYED_LOCAL[p.id] ? '✓ התפללת' : '🙏 ' + (p.prayers || 0)}
        </button>
      </div>`).join('');
  }

  async function refreshWall(){ renderWall(await fetchWall()); }

  /* Wall click — increment counter via prayer-wall API */
  document.body.addEventListener('click', async (e) => {
    const b = e.target.closest('.sd-card-prayed');
    if (!b || PRAYED_LOCAL[b.dataset.id]) return;
    PRAYED_LOCAL[b.dataset.id] = Date.now();
    savePrayedLocal();
    b.classList.add('is-done');
    b.textContent = '✓ התפללת';
    try {
      await fetch('/api/prayer-wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pray', id: b.dataset.id })
      });
    } catch {}
  });

  /* Submit new */
  $('#sdForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const for_name = $('#sdName').value.trim();
    const text = $('#sdDetails').value.trim();
    if (!for_name) return;
    try {
      await fetch('/api/prayer-wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cat: CAT_MAP[activeTab], for_name, text })
      });
    } catch {}
    $('#sdForm').reset();
    refreshWall();
  });

  refreshPrayer();
  refreshWall();
  refreshCount();
  setInterval(refreshWall, 30_000);
})();
