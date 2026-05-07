/* ============================================================
   KZ EMERGENCY — one-tap Jewish help when traveling
   - Shows nearest Chabad with phone (if known) + Waze.
   - Country-aware emergency numbers (Hatzalah / MDA / Police / Embassy).
   - Triggered by [data-kz-emergency] button or KZ_EMERGENCY.open()
   ============================================================ */
(function(){
  'use strict';

  // Country-coded emergency numbers (extend freely)
  const EMRG = {
    IL: { name: 'ישראל',          mda: '101', fire: '102', police: '100', hatzalah: '*1221', embassy: '' },
    US: { name: 'United States',   mda: '911', fire: '911', police: '911', hatzalah: '+1-718-387-1750', embassy: '+1-202-364-5500' },
    GB: { name: 'United Kingdom',  mda: '999', fire: '999', police: '999', hatzalah: '020-8801-2820', embassy: '+44-20-7957-9500' },
    FR: { name: 'France',          mda: '15',  fire: '18',  police: '17',  hatzalah: '01-42-56-12-12', embassy: '+33-1-40-76-55-00' },
    DE: { name: 'Germany',         mda: '112', fire: '112', police: '110', hatzalah: '',                  embassy: '+49-30-2064-3-100' },
    AU: { name: 'Australia',       mda: '000', fire: '000', police: '000', hatzalah: '1300-200-100',     embassy: '+61-2-6215-4500' },
    CA: { name: 'Canada',          mda: '911', fire: '911', police: '911', hatzalah: '',                  embassy: '+1-613-567-6450' },
    AR: { name: 'Argentina',       mda: '107', fire: '100', police: '911', hatzalah: '',                  embassy: '+54-11-4338-2500' },
    BR: { name: 'Brasil',          mda: '192', fire: '193', police: '190', hatzalah: '',                  embassy: '+55-61-2105-0500' },
    DEFAULT: { name:'—',           mda: '112', fire: '112', police: '112', hatzalah: '',                  embassy: '' }
  };

  function distKm(a, b){
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
    const x = Math.sin(dLat/2)**2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  let lastPos = null;
  let lastCountry = 'DEFAULT';
  document.addEventListener('kz:pos', async (e) => {
    lastPos = e.detail;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lastPos.lat}&lon=${lastPos.lng}`);
      const j = await r.json();
      lastCountry = (j.address?.country_code || 'default').toUpperCase();
    } catch {}
  });

  function nearestChabad(){
    if (!lastPos) return null;
    const all = (window.KZ_JEWISH_PLACES || []).filter(p => p.cat === 'chabad');
    if (!all.length) return null;
    return all.map(p => ({ p, d: distKm(lastPos, p) }))
              .sort((a, b) => a.d - b.d)[0];
  }

  function open(){
    if (document.querySelector('.kz-em-modal')) return;
    const m = document.createElement('div');
    m.className = 'kz-em-modal';
    m.innerHTML = `
      <div class="kz-em-back" data-close></div>
      <div class="kz-em-card">
        <button class="kz-em-x" data-close aria-label="סגור">×</button>
        <h3>🆘 עזרה יהודית מיידית</h3>
        <div class="kz-em-list" id="kzEmList"></div>
      </div>`;
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add('is-open'));
    m.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) m.classList.remove('is-open'), setTimeout(() => m.remove(), 300); });

    const list = m.querySelector('#kzEmList');
    const cn   = nearestChabad();
    const e    = EMRG[lastCountry] || EMRG.DEFAULT;

    const items = [];
    if (cn){
      items.push({
        icn: '🕎',
        title: 'בית חב"ד הקרוב ביותר',
        sub: `${cn.p.name} · ${cn.p.city || ''} · ${cn.d.toFixed(cn.d < 10 ? 1 : 0)} ק״מ`,
        actions: [
          { label: 'נווט (Waze)', href: `https://www.waze.com/ul?ll=${cn.p.lat},${cn.p.lng}&navigate=yes`, primary: true },
          { label: 'מפה', href: `https://maps.google.com/?q=${cn.p.lat},${cn.p.lng}` }
        ]
      });
    } else {
      items.push({ icn:'📍', title:'מיקום לא הופעל', sub:'אין לי לאן לכוון אותך עדיין. הפעל מיקום למעלה.', actions: [] });
    }
    items.push({
      icn:'🚑', title:'אמבולנס / חירום רפואי',
      sub: `${e.name} · ${e.mda || '112'}`,
      actions: [{ label: 'התקשר', href: 'tel:' + (e.mda || '112'), primary: true }]
    });
    if (e.hatzalah){
      items.push({
        icn:'🆘', title:'Hatzalah (הצלה יהודית)',
        sub: e.hatzalah,
        actions: [{ label: 'התקשר', href: 'tel:' + e.hatzalah.replace(/[^\d+]/g, ''), primary: true }]
      });
    }
    items.push({
      icn:'🚓', title:'משטרה', sub: e.police,
      actions: [{ label: 'התקשר', href: 'tel:' + (e.police || '112') }]
    });
    // Prefer the verified embassy from the new data file (kz-embassies-verified)
    const embRecord = window.KZ_EMBASSY_BY_CC?.[lastCountry];
    if (embRecord){
      const waze = `https://www.waze.com/ul?ll=${embRecord.lat},${embRecord.lng}&navigate=yes`;
      items.push({
        icn:'🇮🇱', title: embRecord.name,
        sub: `${embRecord.addr || ''} · ${embRecord.phone}`,
        actions: [
          { label: 'התקשר',  href: 'tel:' + embRecord.phone.replace(/[^\d+]/g, ''), primary: true },
          { label: 'נווט',   href: waze }
        ]
      });
    } else if (e.embassy){
      items.push({
        icn:'🇮🇱', title:'שגרירות ישראל',
        sub: e.embassy,
        actions: [{ label: 'התקשר', href: 'tel:' + e.embassy.replace(/[^\d+]/g, '') }]
      });
    }
    items.push({
      icn: '✉️', title: 'שלח את המיקום בוואטסאפ',
      sub: 'משפחה תדע איפה אתה',
      actions: [{
        label: 'שתף מיקום',
        href: lastPos
          ? `https://wa.me/?text=${encodeURIComponent('המיקום הנוכחי שלי: https://maps.google.com/?q=' + lastPos.lat + ',' + lastPos.lng)}`
          : '#',
        primary: true
      }]
    });

    list.innerHTML = items.map(it => `
      <div class="kz-em-item">
        <span class="kz-em-icn">${it.icn}</span>
        <div>
          <b>${escapeHtml(it.title)}</b>
          <small>${escapeHtml(it.sub)}</small>
        </div>
        <div class="kz-em-actions">
          ${(it.actions || []).map(a => `<a class="kz-em-a ${a.primary ? 'is-primary' : ''}" href="${escapeAttr(a.href)}" target="_blank" rel="noopener">${escapeHtml(a.label)}</a>`).join('')}
        </div>
      </div>`).join('');
  }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function escapeAttr(s){ return escapeHtml(s); }

  document.addEventListener('click', (e) => {
    if (e.target.closest('#trvEmBtn') || e.target.closest('.js-kz-emergency')){
      e.preventDefault(); open();
    }
  });

  window.KZ_EMERGENCY = { open };
})();
