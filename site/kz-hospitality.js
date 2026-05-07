/* ============================================================
   KZ HOSPITALITY — Shabbat host/guest matchmaker
   - Two modes: I host / I need a host.
   - Saved to Supabase 'shabbat_hospitality' table; pulls nearby matches.
   - When Supabase isn't wired, posts open in WhatsApp to a public group.
   SQL:
     create table shabbat_hospitality (
       id uuid primary key default gen_random_uuid(),
       kind text not null check (kind in ('host','guest')),
       name text,
       contact text not null,
       city text,
       country text,
       lat numeric, lng numeric,
       date_start date,
       date_end date,
       notes text,
       created_at timestamptz default now()
     );
   ============================================================ */
(function(){
  'use strict';

  function build(){
    const mount = document.querySelector('[data-kz-hospitality]');
    if (!mount || mount.dataset.kzReady) return;
    mount.dataset.kzReady = '1';
    mount.innerHTML = `
      <div class="mini-title"><span class="mini-ornament">🏠</span><span>אירוח לשבת</span></div>
      <div class="kz-host-tabs">
        <button class="kz-host-tab is-on" data-kind="guest">חיפוש אירוח</button>
        <button class="kz-host-tab" data-kind="host">אני מארח/ת</button>
      </div>
      <form class="kz-host-form" id="kzHostForm">
        <input id="hospName"     placeholder="שם" required />
        <input id="hospContact"  placeholder="ווטסאפ / אימייל" required />
        <input id="hospCity"     placeholder="עיר (אוטומטי לפי מיקום)" />
        <input id="hospDate"     type="date" />
        <textarea id="hospNotes" rows="2" placeholder="פרטים: כמה אנשים, נוסח, אוכל וכו'"></textarea>
        <button type="submit" class="kz-host-submit">פרסם</button>
      </form>
      <div class="kz-host-list" id="kzHostList"></div>`;

    let kind = 'guest';
    mount.querySelector('.kz-host-tabs').addEventListener('click', (e) => {
      const b = e.target.closest('.kz-host-tab');
      if (!b) return;
      mount.querySelectorAll('.kz-host-tab').forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      kind = b.dataset.kind;
      refresh();
    });

    mount.querySelector('#kzHostForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        kind: kind === 'guest' ? 'guest' : 'host',
        name:    mount.querySelector('#hospName').value.trim(),
        contact: mount.querySelector('#hospContact').value.trim(),
        city:    mount.querySelector('#hospCity').value.trim() || (window.__kz_city || ''),
        date_start: mount.querySelector('#hospDate').value || null,
        notes:   mount.querySelector('#hospNotes').value.trim(),
        lat: window.__kz_pos?.lat || null,
        lng: window.__kz_pos?.lng || null,
        country: window.__kz_country || null
      };
      if (!await postPost(payload)){
        // Fallback: open WhatsApp share so they can post in a community group
        const text = `${payload.kind === 'host' ? 'אירוח לשבת:' : 'מחפש/ת אירוח לשבת:'} ${payload.name} · ${payload.city || ''} · ${payload.contact}\n${payload.notes || ''}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
      refresh();
    });

    refresh();

    async function postPost(p){
      try {
        const r = await fetch('/api/hospitality', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        });
        return r.ok;
      } catch { return false; }
    }
    async function refresh(){
      const list = mount.querySelector('#kzHostList');
      list.innerHTML = '<div class="kz-host-loading">…</div>';
      try {
        const params = new URLSearchParams({ kind: kind === 'guest' ? 'host' : 'guest' });
        if (window.__kz_city) params.set('city', window.__kz_city);
        const r = await fetch('/api/hospitality?' + params);
        if (!r.ok) throw new Error();
        const items = await r.json();
        if (!items.length){
          list.innerHTML = '<div class="kz-host-empty">אין כרגע — היה הראשון/ה לפרסם!</div>';
          return;
        }
        list.innerHTML = items.slice(0, 12).map(it => `
          <div class="kz-host-item">
            <span class="kz-host-icn">${it.kind === 'host' ? '🏠' : '✈️'}</span>
            <div>
              <b>${escapeHtml(it.name || 'אנונימי')}</b>
              <small>${escapeHtml(it.city || '')} · ${escapeHtml(it.notes || '')}</small>
            </div>
            <a class="kz-host-contact" href="https://wa.me/${cleanPhone(it.contact)}?text=${encodeURIComponent('שלום! ראיתי אותך באירוח שבת ב-my-hom.net')}" target="_blank" rel="noopener">צור קשר</a>
          </div>`).join('');
      } catch {
        list.innerHTML = '<div class="kz-host-empty">השרת לא מחובר עדיין — הפוסט נשמר בוואטסאפ.</div>';
      }
    }
  }

  function cleanPhone(s){ return String(s || '').replace(/[^\d+]/g, ''); }
  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once: true });
  else build();
})();
