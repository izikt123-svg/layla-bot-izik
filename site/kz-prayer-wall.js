/* ============================================================
   KZ PRAYER WALL — public year-round prayer requests
   ============================================================ */
(function(){
  'use strict';
  const $ = (s) => document.querySelector(s);
  const ICN = { 'רפואה':'🕯','פרנסה':'💰','זיווג':'💍','ילדים':'👶','שלום בית':'🏡','הצלחה':'✨','הודיה':'🙏','כללי':'✦' };
  let pickedCat = 'רפואה';
  let filter = 'all';
  let prayed = (() => { try { return JSON.parse(localStorage.getItem('kz_pw_prayed_v1') || '{}'); } catch { return {}; } })();
  function savePrayed(){ try { localStorage.setItem('kz_pw_prayed_v1', JSON.stringify(prayed)); } catch {} }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function timeAgo(iso){
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 1) return 'עכשיו';
    if (m < 60) return `לפני ${m} דק׳`;
    const h = Math.floor(m / 60);
    if (h < 24) return `לפני ${h} שע׳`;
    return `לפני ${Math.floor(h / 24)} ימים`;
  }

  function cardHtml(p){
    const isPrayed = !!prayed[p.id];
    const wa = `https://wa.me/?text=${encodeURIComponent(`🙏 ${p.cat}: ${p.for_name}\n${p.text || ''}\n\nהצטרפי לתפילה: https://my-hom.net/prayer-wall.html`)}`;
    return `<div class="pw-card" data-id="${escapeHtml(p.id)}">
      <span class="pw-card-cat">${ICN[p.cat] || '✦'} ${escapeHtml(p.cat)}</span>
      <div class="pw-card-name">${escapeHtml(p.for_name)}</div>
      ${p.text ? `<div class="pw-card-text">"${escapeHtml(p.text)}"</div>` : ''}
      <div class="pw-card-meta">${escapeHtml(p.posted_by || 'אנונימית')} · ${timeAgo(p.created_at)} · ${(p.prayers || 0)} תפילות</div>
      <div class="pw-card-bottom">
        <button class="pw-pray-btn ${isPrayed ? 'is-prayed' : ''}" data-id="${escapeHtml(p.id)}">${isPrayed ? '✓ התפללתי' : '🙏 אני מתפללת'}</button>
        <a class="pw-share-btn" href="${wa}" target="_blank" rel="noopener" aria-label="שתפי">↗</a>
      </div>
    </div>`;
  }

  async function fetchAll(){
    try {
      const r = await fetch('/api/prayer-wall?live=1', { cache: 'no-store' });
      if (!r.ok) throw new Error();
      return (await r.json()).requests || [];
    } catch { return []; }
  }

  async function publish(p){
    try { await fetch('/api/prayer-wall', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(p) }); }
    catch {}
  }
  async function pray(id){
    try { await fetch('/api/prayer-wall', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'pray', id }) }); }
    catch {}
  }

  function render(list){
    const filtered = filter === 'all' ? list : list.filter(p => p.cat === filter);
    $('#pwTotalPrayers').textContent = list.reduce((sum, p) => sum + (p.prayers || 0), 0);
    $('#pwGrid').innerHTML = filtered.map(cardHtml).join('');
  }

  async function refresh(){ render(await fetchAll()); }

  document.querySelectorAll('.pw-cat').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.pw-cat').forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      pickedCat = b.dataset.c;
    });
  });

  $('#pwFilter').addEventListener('change', () => { filter = $('#pwFilter').value; refresh(); });

  $('#pwForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const for_name = $('#pwForName').value.trim();
    const text = $('#pwText').value.trim();
    const anon = $('#pwAnon').checked;
    if (!for_name) return;
    await publish({ cat: pickedCat, for_name, text, posted_by: anon ? 'אנונימית' : undefined });
    $('#pwForm').reset();
    refresh();
  });

  document.body.addEventListener('click', async (e) => {
    const b = e.target.closest('.pw-pray-btn');
    if (!b) return;
    const id = b.dataset.id;
    if (prayed[id]) return;
    prayed[id] = Date.now();
    savePrayed();
    b.classList.add('is-prayed');
    b.textContent = '✓ התפללתי';
    pray(id);
  });

  refresh();
  setInterval(refresh, 30_000);
})();
