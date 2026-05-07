/* ============================================================
   KZ SIMCHAS — share Jewish lifecycle joys with the community
   GET  /api/simchas?live=1  → list active simchas
   POST /api/simchas         → publish
   POST /api/simchas {action:'bless', id}  → +1 blessing
   ============================================================ */
(function(){
  'use strict';
  const $ = (s) => document.querySelector(s);
  const ICN = {
    'חתונה':'💍','ברית':'👶','בר/בת מצווה':'🕯','הולדת':'🍼',
    'פדיון':'💰','חנוכת בית':'🏠','הצלחה':'🎓','יום הולדת':'🎂'
  };
  let pickedType = 'חתונה';

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function cardHtml(s){
    return `<div class="sm-card" data-id="${escapeHtml(s.id)}">
      <div class="sm-card-icn">${ICN[s.type] || '✨'}</div>
      <span class="sm-card-type">${escapeHtml(s.type)}</span>
      <div class="sm-card-name">${escapeHtml(s.who_name)}</div>
      <div class="sm-card-meta">${escapeHtml(s.city || '')}${s.event_date ? ' · ' + new Date(s.event_date).toLocaleDateString('he-IL', {day:'numeric', month:'short'}) : ''}</div>
      ${s.message ? `<div class="sm-card-msg">${escapeHtml(s.message)}</div>` : ''}
      <button class="sm-card-bless" data-id="${escapeHtml(s.id)}">🌟 ברכה (${s.blessings || 0})</button>
    </div>`;
  }

  async function load(){
    try {
      const r = await fetch('/api/simchas?live=1', { cache: 'no-store' });
      if (!r.ok) throw new Error();
      return (await r.json()).simchas || [];
    } catch { return []; }
  }
  async function publish(p){
    try { await fetch('/api/simchas', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(p) }); }
    catch {}
  }
  async function bless(id){
    try { await fetch('/api/simchas', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'bless', id }) }); }
    catch {}
  }

  function render(list){
    $('#smCount').textContent = list.length;
    $('#smGrid').innerHTML = list.map(cardHtml).join('');
  }
  async function refresh(){ render(await load()); }

  function init(){
    document.querySelectorAll('.sm-type').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.sm-type').forEach(x => x.classList.remove('is-on'));
        b.classList.add('is-on');
        pickedType = b.dataset.t;
        /* Swap hero photo: bar/bat mitzvah → bar-mitzvah-kotel; otherwise → wedding */
        const hero = document.getElementById('smHero');
        if (hero && window.KZ_IMAGE){
          const heroName = (pickedType === 'בר/בת מצווה') ? 'barMitzvah' : 'wedding';
          hero.dataset.kzHero = heroName;
          hero.dataset.kzRendered = '';
          window.KZ_IMAGE.rerender();
        }
      });
    });

    $('#smForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        type: pickedType,
        who_name: $('#smName').value.trim(),
        city: $('#smCity').value.trim(),
        event_date: $('#smDate').value || null,
        message: $('#smMsg').value.trim()
      };
      if (!payload.who_name) return;
      await publish(payload);
      $('#smForm').hidden = true;
      $('#smSuccess').hidden = false;
      refresh();
    });

    $('#smAgain').addEventListener('click', () => {
      $('#smForm').reset();
      $('#smForm').hidden = false;
      $('#smSuccess').hidden = true;
    });

    document.body.addEventListener('click', async (e) => {
      const b = e.target.closest('.sm-card-bless');
      if (!b || b.dataset.blessed) return;
      b.dataset.blessed = '1';
      const m = b.textContent.match(/\((\d+)\)/);
      const n = m ? parseInt(m[1], 10) + 1 : 1;
      b.innerHTML = `🌟 ברכה (${n})`;
      bless(b.dataset.id);
    });

    refresh();
    setInterval(refresh, 25_000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
