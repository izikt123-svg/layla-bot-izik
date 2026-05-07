/* ============================================================
   KZ TEHILLIM SPLIT — collaborative Tehillim (Psalms) reading
   - User opens a session for "ל-עילוי נשמת X" or "לרפואת Y".
   - Each visitor gets one or two unread chapters auto-assigned.
   - When all 150 are read → "השלמנו ספר תהלים" celebration.
   - State synced via /api/tehillim (Supabase). Local-first cache.
   ============================================================ */
(function(){
  'use strict';

  const TOTAL = 150;
  const STATE_KEY = 'kz_tehillim_state_v1';

  function load(){
    try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); } catch { return {}; }
  }
  function save(s){
    try { localStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch {}
  }

  async function fetchSession(id){
    try {
      const r = await fetch(`/api/tehillim?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
      if (!r.ok) throw new Error('tehillim ' + r.status);
      return r.json();
    } catch { return null; }
  }
  async function claimChapters(id, count){
    try {
      const r = await fetch('/api/tehillim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'claim', count })
      });
      if (!r.ok) throw new Error();
      return r.json();
    } catch { return null; }
  }
  async function completeChapter(id, chapter){
    try {
      await fetch('/api/tehillim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'complete', chapter })
      });
    } catch {}
  }

  function build(){
    if (document.querySelector('.kz-tehillim-card')) return;
    const mount = document.querySelector('[data-kz-tehillim]');
    if (!mount) return; // opt-in: only renders where the page asks for it

    const card = document.createElement('section');
    card.className = 'kz-tehillim-card card';
    card.innerHTML = `
      <div class="mini-title">
        <span class="mini-ornament">📖</span>
        <span>ספר תהלים שיתופי</span>
        <span class="kz-th-progress" data-kz-th="progress">0 / ${TOTAL}</span>
      </div>
      <div class="kz-th-row">
        <input class="kz-th-input" id="kzThId" placeholder="שם או מטרה (לעילוי נשמת… / לרפואת…)" />
        <button class="kz-th-go" id="kzThGo">פתח/הצטרף</button>
      </div>
      <div class="kz-th-grid" id="kzThGrid" aria-label="פרקים"></div>
      <div class="kz-th-mine" id="kzThMine" hidden>
        <div class="kz-th-mine-title">הפרקים שלך:</div>
        <div class="kz-th-mine-list" id="kzThMineList"></div>
      </div>
      <div class="kz-th-foot">
        <small>כל מצטרף מקבל פרקים אוטומטית. כשנסיים — השלמנו ספר תהלים יחד 🌟</small>
      </div>`;
    mount.appendChild(card);

    const idInput = card.querySelector('#kzThId');
    const grid    = card.querySelector('#kzThGrid');
    const goBtn   = card.querySelector('#kzThGo');
    const mineWr  = card.querySelector('#kzThMine');
    const mineLst = card.querySelector('#kzThMineList');
    const progEl  = card.querySelector('[data-kz-th="progress"]');

    // Hydrate
    const st = load();
    idInput.value = st.id || '';

    function renderGrid(done){
      grid.innerHTML = '';
      const set = new Set(done || []);
      for (let i = 1; i <= TOTAL; i++){
        const cell = document.createElement('span');
        cell.className = 'kz-th-cell' + (set.has(i) ? ' is-done' : '');
        cell.textContent = i;
        cell.title = `פרק ${i}` + (set.has(i) ? ' · נקרא' : '');
        grid.appendChild(cell);
      }
      progEl.textContent = `${set.size} / ${TOTAL}`;
      if (set.size === TOTAL){
        celebrate();
      }
    }

    function renderMine(mine){
      mineLst.innerHTML = '';
      mineWr.hidden = !mine?.length;
      (mine || []).forEach(ch => {
        const b = document.createElement('button');
        b.className = 'kz-th-mine-chip';
        b.dataset.ch = ch;
        b.innerHTML = `פרק ${ch} <span>✓</span>`;
        b.addEventListener('click', () => {
          b.classList.add('is-done');
          completeChapter(idInput.value.trim(), ch);
          // optimistic local update
          const local = load();
          local.id = idInput.value.trim();
          local.done = Array.from(new Set([...(local.done || []), ch]));
          local.mine = (local.mine || []).filter(c => c !== ch);
          save(local);
          renderGrid(local.done);
          if (!local.mine.length) mineWr.hidden = true;
        });
        mineLst.appendChild(b);
      });
    }

    async function refresh(){
      const id = idInput.value.trim();
      if (!id) return;
      const session = await fetchSession(id);
      if (!session) return;
      renderGrid(session.done || []);
    }

    async function go(){
      const id = idInput.value.trim();
      if (!id) return;
      const local = load();
      local.id = id;
      save(local);
      // claim 2 chapters for this visitor
      const claim = await claimChapters(id, 2);
      if (claim){
        local.mine = claim.chapters || local.mine || [];
        local.done = claim.done || local.done || [];
        save(local);
        renderGrid(local.done);
        renderMine(local.mine);
      } else {
        // offline: hand out two random chapters not in local.done
        const taken = new Set(local.done || []);
        const mine = [];
        while (mine.length < 2 && taken.size + mine.length < TOTAL){
          const c = 1 + Math.floor(Math.random() * TOTAL);
          if (!taken.has(c) && !mine.includes(c)) mine.push(c);
        }
        local.mine = mine;
        save(local);
        renderGrid(local.done || []);
        renderMine(local.mine);
      }
    }

    function celebrate(){
      if (card.querySelector('.kz-th-celebrate')) return;
      const c = document.createElement('div');
      c.className = 'kz-th-celebrate';
      c.innerHTML = '🌟 השלמנו ספר תהלים יחד! 🌟';
      card.appendChild(c);
    }

    goBtn.addEventListener('click', go);
    if (st.id){ refresh(); renderMine(st.mine || []); }
    setInterval(refresh, 20_000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once: true });
  else build();
})();
