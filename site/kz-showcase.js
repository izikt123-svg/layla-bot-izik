/* ================================================================
   KZ-SHOWCASE · Immersive "world showcase" + Handbook launcher
   (ADDITIVE — no existing code is touched)
   ----------------------------------------------------------------
   Adds two extra launcher buttons next to the AI panel:
   • "חווית מרכז התפילה" — opens a cinematic grid of EVERY feature.
   • "חוברת הדרכה · PDF" — opens handbook.html for Save-as-PDF.
   ================================================================ */
(function initKzShowcase() {
  if (document.getElementById('kzShowExtra')) return;

  const SECTIONS = [
    { icon:'🏠', title:'עמוד הבית', href:'#hero',
      desc:'לוח תפילה חי, הפסוק של היום, לוח שנה יהודי וסיפורי אמונה.',
      tags:['לוח חי','פסוק יומי','יומן יהודי'] },
    { icon:'🕯', title:'בקש תפילה', href:'#create',
      desc:'טופס אנונימי לחלוטין — רפואה, פרנסה, זוגיות, שלום בית, ילדים, הצלחה, הודיה.',
      tags:['אנונימי','הקלטה קולית','7 קטגוריות'] },
    { icon:'📜', title:'הפיד החי', href:'#feed',
      desc:'כל הבקשות ברשת. סינון לפי תחום או מצב "מותאם לך".',
      tags:['זמן אמת','סינון','חיבור הדדי'] },
    { icon:'👤', title:'אזור אישי', href:'#me',
      desc:'הבקשות שלך, על מי את/ה מתפלל/ת, וחיבורים רוחניים שנוצרו.',
      tags:['בקשות','תפילה עבור','חיבורים'] },
    { icon:'📚', title:'מאגר תפילות', href:'#library',
      desc:'אוסף נוסחים לפי קטגוריה — מי שברך, תהילים, תפילות אישיות.',
      tags:['לפי תחום','מסודר','נגיש'] },
    { icon:'📖', title:'לימוד יומי', href:'learning.html',
      desc:'פרשת שבוע, הלכה, חסידות ומוסר — לימוד אחיד למי שרוצה להתחיל.',
      tags:['פרשה','הלכה','מוסר'] },
    { icon:'🕯️', title:'מנהגים ועדות', href:'customs.html',
      desc:'הבדלים בין עדות ישראל — איך מברכים, איך מתפללים, איך חוגגים.',
      tags:['ספרדי','אשכנזי','תימני','חסידי'] },
    { icon:'🔤', title:'עברית יהודית 101', href:'dictionary.html',
      desc:'מילון מונחים — מה זה "רפואה שלמה", "לעילוי נשמה", "לחיים"…',
      tags:['מושגים','הגדרות','שפה'] },
    { icon:'💡', title:'מה אומרים כש…', href:'what-to-say.html',
      desc:'מצבי חיים — לידה, מחלה, נסיעה, שמחה — ומה נהוג לומר או לברך.',
      tags:['ברכות','סיטואציות','נימוסים'] },
    { icon:'🎓', title:'שאל רב', href:'ask-rabbi.html',
      desc:'שאלה הלכתית/רגישה ששולחים למסלול רבני מוסמך.',
      tags:['הלכה','מענה אישי','מכובד'] },
    { icon:'💙', title:'סיפורי לב', href:'#stories',
      desc:'תקומה, אמונה, מצוקה — סיפורים שמחזקים ברגעים הקשים.',
      tags:['תקומה','אמונה','מצוקה'] },
    { icon:'🕊️', title:'ספר נשמות', href:'memorial.html',
      desc:'עמוד זיכרון לאהובים — נרות וירטואליים, תאריכים, יום שנה.',
      tags:['יזכור','נר','יום שנה'] },
    { icon:'🎊', title:'אירועי חיים', href:'life-events.html',
      desc:'לידה, ברית, בת־מצווה, חתונה — מה אפשר לבקש ולברך.',
      tags:['שמחות','ברכות','ציוני דרך'] },
    { icon:'🕍', title:'כל זכות יהודי', href:'unity.html',
      desc:'רשת הזכויות המאחדת — חיבור יהודים מכל העולם.',
      tags:['אחדות','זכויות','רשת'] },
    { icon:'📍', title:'איתור קהילה', href:'find-jewish.html',
      desc:'מפה וחיפוש של קהילות, מניינים, בתי כנסת ומרכזים יהודיים.',
      tags:['מפה','מניין','קהילות'] },
    { icon:'🤝', title:'חסד והתנדבות', href:'chesed.html',
      desc:'איך נכנסים לגמילות חסדים, לוחות התנדבות ומה באמת חסר כרגע.',
      tags:['חסד','לעזור','לתת'] },
    { icon:'✈️', title:'עלייה ונסיעה', href:'aliyah-traveler.html',
      desc:'טיפים לעולה ולנוסע היהודי — כשרות, תפילה בדרך, אנשי קשר.',
      tags:['עלייה','טיול','אנשי קשר'] },
    { icon:'🧒', title:'פינת ילדים', href:'kids.html',
      desc:'סיפורים, פעילויות ואומנויות לילדים — עברית, פרשה, ערכים.',
      tags:['סיפורים','פרשה','ערכים'] },
    { icon:'🔎', title:'חיפוש חכם', href:'#megaSearch',
      desc:'סורק את כל האתר — תפילות, מנהגים, ערים, צדיקים, פרשה וסיפור.',
      tags:['מהיר','חכם','כולל'] },
    { icon:'🌐', title:'שפה · עב/EN', href:'#hero',
      desc:'מתג דגלים בראש העמוד — עברית / English.',
      tags:['RTL/LTR','נגישות','דו־לשוני'] },
    { icon:'🔔', title:'התראות', href:'#hero',
      desc:'פעמון התראות בראש — חדשות, ברכות וחיבורים חדשים.',
      tags:['חדש','חי','התראה'] },
    { icon:'🔐', title:'התחברות · Google', href:'#hero',
      desc:'רישום רגיל או התחברות מהירה עם Google. הכל מאובטח ופרטי.',
      tags:['פרטי','מהיר','מאובטח'] },
    { icon:'📄', title:'אודות ומסמכים', href:'privacy.html',
      desc:'מדיניות פרטיות, תנאי שימוש והצהרת נגישות.',
      tags:['חוקים','שקיפות','כבוד'] },
    { icon:'📘', title:'חוברת הדרכה · PDF', href:'handbook.html',
      desc:'כל מה שיש באתר — בקובץ אחד להורדה כ־PDF מלא.',
      tags:['PDF','הורדה','ללמוד לאט'] },
    { icon:'🤖', title:'מלווה חכם · AI', href:'#kzAiLauncher',
      desc:'הכפתור הזהוב־כחול בצד ימין — שואלים כל שאלה וה־AI עונה.',
      tags:['AI','בעברית','מורכב או פשוט'] },
    { icon:'▶️', title:'סיור מונפש', href:'#kzGuideLauncher',
      desc:'סיור מודרך עם כפתור השהיה ובחירת קצב — רגוע/רגיל/מהיר/ידני.',
      tags:['קצב מותאם','השהיה','מסלול מלא'] },
  ];

  const extra = document.createElement('div');
  extra.id = 'kzShowExtra';
  extra.className = 'kz-ai-extra';
  extra.innerHTML = `
    <button type="button" class="kz-ai-extra-btn kz-showcase" id="kzShowOpen" aria-label="פתח חוויית מרכז התפילה">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 14.5 9 22 9.3 16 14 18 22 12 17.8 6 22 8 14 2 9.3 9.5 9"/></svg>
      <span>חווית האתר · הצגה מלאה</span>
    </button>
    <a class="kz-ai-extra-btn kz-handbook" id="kzHandbook" href="handbook.html" target="_blank" rel="noopener" aria-label="פתח חוברת הדרכה להורדה כ־PDF">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v16a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7l-5-5H5a1 1 0 0 0-1 1z"/><path d="M14 2v5h5"/><path d="M8 12h8M8 16h6"/></svg>
      <span>חוברת הדרכה · PDF</span>
    </a>
  `;
  document.body.appendChild(extra);

  // Decorative anchoring panel behind the stack of launchers. No pointer
  // events, so it never intercepts clicks on the real buttons stacked
  // over it. Hidden on narrow viewports via CSS.
  if (!document.getElementById('kzDockPanel')) {
    const panel = document.createElement('div');
    panel.id = 'kzDockPanel';
    panel.className = 'kz-dock-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = '<div class="kz-dock-panel-inner"></div>';
    document.body.appendChild(panel);
  }

  // Build the showcase overlay lazily
  let overlay = null;
  function build() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'kzShowcase';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="kz-show-bg" aria-hidden="true"></div>
      <div class="kz-show-stars" aria-hidden="true"></div>
      <button type="button" class="kz-show-x" id="kzShowClose" aria-label="סגור">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <div class="kz-show-stage" role="dialog" aria-modal="true" aria-labelledby="kzShowTitle">
        <header>
          <div class="kz-show-eyebrow">חווית מרכז התפילה · Showcase</div>
          <h1 id="kzShowTitle" class="kz-show-title">כל מה שיש באתר — במבט אחד שהעולם יראה</h1>
          <p class="kz-show-sub">סיור ראוותני ואינטראקטיבי על כל מה שבנינו כאן: מהבקשה האנונימית הראשונה, דרך הפיד, האזור האישי, הלימוד, הסיפורים וכל זכות יהודי — ועד למלווה החכם והחוברת להורדה.</p>
        </header>
        <div class="kz-show-grid" id="kzShowGrid"></div>
        <div class="kz-show-foot">
          <span>לחיצה על כל כרטיס תקפיץ אותך ישר לאותו חלק.</span>
          <span>רוצה הכל במסמך? <a href="handbook.html" target="_blank" rel="noopener">חוברת הדרכה · PDF</a></span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const grid = overlay.querySelector('#kzShowGrid');
    SECTIONS.forEach((s, i) => {
      const tags = (s.tags || []).map(t => `<span>${t}</span>`).join('');
      const el = document.createElement('a');
      el.className = 'kz-show-card';
      el.href = s.href;
      el.style.animation = `kzAiBubbleIn .35s ${Math.min(i*40, 900)}ms both cubic-bezier(.2,.8,.2,1)`;
      el.innerHTML = `
        <div class="kz-show-ico" aria-hidden="true">${s.icon}</div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        <div class="kz-show-tags">${tags}</div>
      `;
      el.addEventListener('click', (e) => {
        // for in-page anchors: close overlay then scroll
        if (s.href.startsWith('#')) {
          e.preventDefault();
          close();
          setTimeout(() => {
            const target = document.querySelector(s.href) || document.getElementById(s.href.slice(1));
            if (target) target.scrollIntoView({ behavior:'smooth', block:'start' });
          }, 180);
        }
      });
      grid.appendChild(el);
    });

    overlay.querySelector('#kzShowClose').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    return overlay;
  }

  function open() {
    const o = build();
    o.hidden = false;
    document.body.classList.add('kz-show-open');
  }
  function close() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove('kz-show-open');
  }

  extra.querySelector('#kzShowOpen').addEventListener('click', open);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && !overlay.hidden) close();
  });

  // Wire the new top-menu "עזרה" items to their matching launcher. The
  // menu items live in index.html with data-open-guide="ai|tour|showcase".
  // Anchor fallbacks still work if JS fails.
  document.addEventListener('click', (e) => {
    const trig = e.target.closest('[data-open-guide]');
    if (!trig) return;
    const kind = trig.getAttribute('data-open-guide');
    if (!kind) return;
    e.preventDefault();
    if (kind === 'showcase') { open(); return; }
    if (kind === 'ai') {
      const btn = document.getElementById('kzAiLauncher');
      if (btn) btn.click();
      return;
    }
    if (kind === 'tour') {
      // Prefer the explicit header tour button if it's wired; else fall
      // back to clicking the floating guide launcher and its "tour" item.
      const headerTour = document.getElementById('tourBtn');
      if (headerTour) { headerTour.click(); return; }
      const guide = document.getElementById('kzGuideLauncher');
      if (guide) {
        guide.click();
        setTimeout(() => {
          const tourItem = document.querySelector('#kzGuideRoot [data-action="tour"]');
          if (tourItem) tourItem.click();
        }, 40);
      }
    }
  });
})();
