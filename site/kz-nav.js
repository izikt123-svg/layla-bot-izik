/* ============================================================
   KZ NAV — global navigation drawer for ALL pages
   - Hamburger button injected automatically into <header.topbar>
   - Side drawer with categorized links + search + footer
   - Mobile-first (≤720px), graceful expansion to desktop
   - Auto-marks active link based on location.pathname
   ============================================================ */
(function(){
  'use strict';
  if (window.__kz_nav_installed) return;
  window.__kz_nav_installed = true;

  /* Menu structure */
  const MENU = [
    { group:'יומיומי', items: [
      { icon:'🏠', label:'הבית',                href:'/home.html' },
      { icon:'🌅', label:'בוקר טוב להשם',        href:'/morning.html' },
      { icon:'✦', label:'60 שניות עם הקב״ה',    href:'/moment.html' },
      { icon:'📿', label:'תהילים יומי',          href:'/daily-tehilim.html' },
      { icon:'📚', label:'לימוד יומי',           href:'/daily-learning.html' }
    ]},
    { group:'תפילה ושבת', items: [
      { icon:'🙏', label:'קיר בקשות התפילה',     href:'/prayer-wall.html' },
      { icon:'🎗', label:'תפילה לחיילים',         href:'/soldiers.html' },
      { icon:'🕯', label:'הדלקת נרות שבת',       href:'/shabbat-candles.html' },
      { icon:'📺', label:'קיר נרות מסך מלא',      href:'/candles-cinema.html' },
      { icon:'🗺', label:'מפת נרות חיה',          href:'/candles-map.html' },
      { icon:'🤝', label:'תפילה משותפת',          href:'/pray-along.html' },
      { icon:'🎤', label:'מצב חזן',               href:'/cantor.html' }
    ]},
    { group:'משפחה וקהילה', items: [
      { icon:'🎉', label:'שמחות',                 href:'/simchas.html' },
      { icon:'🕯', label:'לוח אבלים',             href:'/mourners.html' },
      { icon:'📖', label:'הספר שלנו (משפחה)',     href:'/family-archive.html' },
      { icon:'🌙', label:'סיפור לפני השינה',      href:'/kids-bedtime.html' }
    ]},
    { group:'בעולם הגדול', items: [
      { icon:'🌍', label:'הבית היהודי בעולם',    href:'/world.html' },
      { icon:'🧭', label:'מצב מטייל',             href:'/traveler.html' },
      { icon:'🍞', label:'מתכוני שבת',            href:'/shabbat-recipes.html' },
      { icon:'🎨', label:'גלריית איורים',         href:'/illustrations.html' }
    ]},
    { group:'אישי', items: [
      { icon:'👤', label:'המסע שלי',              href:'/my-journey.html' },
      { icon:'💝', label:'תרומה',                 href:'/index.html#donate' }
    ]}
  ];

  /* Build hamburger button */
  function buildButton(){
    const topbar = document.querySelector('header.topbar');
    if (!topbar) return null;
    if (topbar.querySelector('.kz-nav-toggle')) return topbar.querySelector('.kz-nav-toggle');
    const btn = document.createElement('button');
    btn.className = 'kz-nav-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'תפריט');
    btn.innerHTML = '<span></span><span></span><span></span>';
    topbar.appendChild(btn);
    return btn;
  }

  /* Build drawer */
  function buildDrawer(){
    if (document.querySelector('.kz-nav-drawer')) return;

    const overlay = document.createElement('div');
    overlay.className = 'kz-nav-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const drawer = document.createElement('aside');
    drawer.className = 'kz-nav-drawer';
    drawer.setAttribute('role', 'navigation');
    drawer.setAttribute('aria-label', 'תפריט ראשי');

    /* Build menu HTML */
    const groupsHtml = MENU.map(g => `
      <section class="kz-nav-group">
        <div class="kz-nav-group-title">${escapeHtml(g.group)}</div>
        <ul>
          ${g.items.map(it => `<li>
            <a class="kz-nav-link" href="${escapeAttr(it.href)}">
              <span class="kz-nav-icn">${it.icon}</span>
              <span>${escapeHtml(it.label)}</span>
            </a>
          </li>`).join('')}
        </ul>
      </section>`).join('');

    drawer.innerHTML = `
      <header class="kz-nav-head">
        <div class="kz-nav-brand">✦ מרכז התפילה</div>
        <button class="kz-nav-close" type="button" aria-label="סגור">×</button>
      </header>
      <div class="kz-nav-search">
        <input type="search" id="kzNavSearch" placeholder="חפש דף או פעולה…" aria-label="חיפוש"/>
      </div>
      <div class="kz-nav-body" id="kzNavBody">
        ${groupsHtml}
      </div>
      <footer class="kz-nav-foot">
        <a href="/">my-hom.net ·  ✦</a>
      </footer>`;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    /* Mark active link */
    const path = location.pathname.replace(/\/$/, '') || '/home.html';
    drawer.querySelectorAll('.kz-nav-link').forEach(a => {
      const href = a.getAttribute('href').split('#')[0];
      if (href === path || (path === '' && href === '/home.html')){
        a.classList.add('is-active');
      }
    });

    /* Search filter */
    const search = drawer.querySelector('#kzNavSearch');
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      drawer.querySelectorAll('.kz-nav-group').forEach(g => {
        let visible = 0;
        g.querySelectorAll('.kz-nav-link').forEach(a => {
          const txt = a.textContent.toLowerCase();
          const match = !q || txt.includes(q);
          a.style.display = match ? '' : 'none';
          if (match) visible++;
        });
        g.style.display = visible ? '' : 'none';
      });
    });

    overlay.addEventListener('click', close);
    drawer.querySelector('.kz-nav-close').addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  function open(){
    document.body.classList.add('kz-nav-open');
    document.body.style.overflow = 'hidden';
    const search = document.getElementById('kzNavSearch');
    if (search && window.innerWidth > 720) setTimeout(() => search.focus(), 150);
  }
  function close(){
    document.body.classList.remove('kz-nav-open');
    document.body.style.overflow = '';
  }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function escapeAttr(s){ return escapeHtml(s); }

  function init(){
    const btn = buildButton();
    if (!btn) return;
    buildDrawer();
    btn.addEventListener('click', () => {
      document.body.classList.contains('kz-nav-open') ? close() : open();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.KZ_NAV = { open, close };
})();
