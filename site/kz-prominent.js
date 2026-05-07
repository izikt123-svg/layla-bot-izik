/* ============================================================
   KZ PROMINENT — Mirav intro bar + Phone QR + Tag prominent nav items
   ============================================================ */
(function(){
  'use strict';

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* Production URL — works for everyone everywhere */
  const PHONE_URL = 'https://my-hom.net/';

  /* ─────────────────────────────────────────────────────────
     1. Tag prominent nav items
     ───────────────────────────────────────────────────────── */
  function tagProminent(){
    $$('.nav .nav-item').forEach(item => {
      const link = item.querySelector('a');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const text = (link.textContent || '').trim();
      // Family Room
      if (href.includes('family-room') || text.includes('חדר המשפחה')){
        item.classList.add('is-prominent');
      }
      // Map of Jewry
      if (href.includes('find-jewish') || text.includes('מפת היהדות')){
        item.classList.add('is-prominent');
      }
      // Memorial — special dark style
      if (href.includes('national-memorial') || text.includes('הזיכרון')){
        item.classList.add('is-memorial');
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     2. Mirav intro bar — shown once, dismissible
     ───────────────────────────────────────────────────────── */
  function buildMiravBar(){
    if ($('.kz-mirav-bar')) return;
    if (localStorage.getItem('kz-mirav-bar-dismissed') === '1') return;

    const bar = document.createElement('div');
    bar.className = 'kz-mirav-bar';
    bar.innerHTML = `
      <div class="kz-mirav-avatar">מ</div>
      <div class="kz-mirav-text">
        <strong>שלום, אני מירב 🕯</strong>
        <small>חברה דיגיטלית באתר. כאן איתך תמיד — בעברית ובעוד 19 שפות.</small>
      </div>
      <button class="kz-mirav-cta" id="kzMiravIntroBtn">בואו נכיר ←</button>
      <button class="kz-mirav-bar-close" id="kzMiravBarClose" aria-label="סגור">✕</button>`;

    // Insert above topbar (after slider if exists, else first child of body)
    const slider = $('.kz-holy-strip.kz-top-banner');
    const topbar = $('.topbar');
    if (slider && slider.parentNode){
      slider.parentNode.insertBefore(bar, slider.nextSibling);
    } else if (topbar && topbar.parentNode){
      topbar.parentNode.insertBefore(bar, topbar);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }

    // Bind buttons — ONE click opens chat directly
    $('#kzMiravIntroBtn').addEventListener('click', () => {
      if (window.KZ_AI_CHAT && window.KZ_AI_CHAT.open){
        window.KZ_AI_CHAT.open();
      } else {
        // Fallback: ensure chat builds and opens
        setTimeout(() => {
          if (window.KZ_AI_CHAT && window.KZ_AI_CHAT.open) window.KZ_AI_CHAT.open();
        }, 200);
      }
    });
    $('#kzMiravBarClose').addEventListener('click', () => {
      bar.style.transition = 'opacity .35s, transform .35s';
      bar.style.opacity = '0';
      bar.style.transform = 'translateY(-100%)';
      setTimeout(() => bar.remove(), 350);
      localStorage.setItem('kz-mirav-bar-dismissed', '1');
    });
  }

  /* ─────────────────────────────────────────────────────────
     3. Mirav intro modal (full welcome)
     ───────────────────────────────────────────────────────── */
  function openMiravIntro(){
    if ($('.kz-mirav-modal')){ $('.kz-mirav-modal').classList.add('is-open'); return; }

    const modal = document.createElement('div');
    modal.className = 'kz-mirav-modal is-open';
    modal.innerHTML = `
      <div class="kz-mirav-modal-back" data-close></div>
      <div class="kz-mirav-modal-card">
        <div class="kz-mirav-avatar">מ</div>
        <h2>שלום, אני מירב</h2>
        <div class="kz-mirav-tagline">חברה דיגיטלית באתר · איתך תמיד</div>
        <p>נעים מאוד. אני כאן כדי ללוות אותך — בתפילה, בזיכרון, בשמחה ובעצב. אני מכירה כל פינה באתר ואשמח להראות לך את הדרך.</p>
        <p>אפשר לדבר איתי על תפילות, חב"ד בעולם, חדר המשפחה, יארצייט, חגים, או פשוט לדבר. אני מבינה עברית, אנגלית, צרפתית, ספרדית, רוסית, ועוד 15 שפות.</p>
        <p style="opacity:.7;font-size:13px;margin-bottom:24px">בכל רגע שתצטרך/י — לחיצה אחת על הכוכב הזהוב בפינה תפתח אותי.</p>
        <button class="kz-mirav-cta" id="kzMiravStartChat">פתחי שיחה איתי 💬</button>
      </div>`;
    document.body.appendChild(modal);

    modal.addEventListener('click', e => {
      if (e.target.matches('[data-close], .kz-mirav-modal-back')){
        modal.classList.remove('is-open');
        setTimeout(() => modal.remove(), 300);
      }
    });
    $('#kzMiravStartChat').addEventListener('click', () => {
      modal.classList.remove('is-open');
      setTimeout(() => modal.remove(), 300);
      // Open the chat
      if (window.KZ_AI_CHAT && window.KZ_AI_CHAT.open) window.KZ_AI_CHAT.open();
    });
  }

  /* ─────────────────────────────────────────────────────────
     4. Phone access FAB + QR modal
     ───────────────────────────────────────────────────────── */
  function buildPhoneFab(){
    // Show on all environments — QR points to production URL
    if ($('.kz-phone-fab')) return;

    const fab = document.createElement('button');
    fab.className = 'kz-phone-fab';
    fab.title = 'ראה באייפון / אנדרואיד';
    fab.setAttribute('aria-label', 'פתח QR לפלאפון');
    fab.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="6" y="2" width="12" height="20" rx="3"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>`;
    document.body.appendChild(fab);

    fab.addEventListener('click', openPhoneModal);
  }

  function openPhoneModal(){
    if ($('.kz-phone-modal')){ $('.kz-phone-modal').classList.add('is-open'); return; }

    // Build QR code URL
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(PHONE_URL)}`;

    const modal = document.createElement('div');
    modal.className = 'kz-phone-modal is-open';
    modal.innerHTML = `
      <div class="kz-phone-modal-back" data-close></div>
      <div class="kz-phone-modal-card">
        <button class="kz-phone-modal-close" data-close>✕</button>
        <span style="display:inline-block;padding:4px 14px;background:rgba(74,144,226,.15);color:#1a73e8;border-radius:100px;font-size:11px;letter-spacing:.12em;font-weight:700;text-transform:uppercase;margin-bottom:8px;">📱 ראה בפלאפון</span>
        <h2>סרוק את הקוד</h2>
        <p>צלם עם המצלמה של הפלאפון את הקוד למטה — האתר ייפתח אצלך.</p>
        <img src="${qrUrl}" alt="QR Code" class="kz-phone-qr" loading="lazy"/>
        <div class="kz-phone-url">
          <div class="kz-phone-url-text">${PHONE_URL}</div>
          <button class="kz-phone-url-copy" data-copy="${PHONE_URL}">📋 העתק</button>
        </div>
        <div class="kz-phone-instructions">
          <strong>חשוב לבדוק:</strong>
          <ol>
            <li>הפלאפון מחובר לאותה רשת WiFi כמו המחשב</li>
            <li>אם לא עובד — פתח חומת אש לפורט 8080</li>
            <li>או הקלד את הכתובת ידנית בדפדפן הפלאפון</li>
          </ol>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.addEventListener('click', e => {
      if (e.target.matches('[data-close], .kz-phone-modal-back')){
        modal.classList.remove('is-open');
        setTimeout(() => modal.remove(), 300);
      }
      const copy = e.target.closest('[data-copy]');
      if (copy){
        navigator.clipboard?.writeText(copy.dataset.copy);
        copy.textContent = '✓ הועתק';
        setTimeout(() => copy.textContent = '📋 העתק', 1500);
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     INIT
     ───────────────────────────────────────────────────────── */
  function init(){
    tagProminent();
    setTimeout(buildMiravBar, 800);   // gentle delay
    buildPhoneFab();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
