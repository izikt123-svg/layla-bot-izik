/* ================================================================
   KZ GUIDE — site-wide help bot + animated full-site tour (additive)
   ----------------------------------------------------------------
   This module is fully additive. It never overwrites existing code.
   It adds three things, all triggered from a new gold menu button:

   1) כפתור "סיור מודרך" bottom-right of the header (+ mobile floating)
      that opens an animated step-by-step walkthrough that covers
      EVERY main menu item and its sub-categories — like a short
      video that explains the whole site.
   2) A floating help bot with a chat bubble that answers free-text
      questions about the site ("איפה ספר נשמות?", "מה זה חסד?",
      "איך מבקשים תפילה?", ...).
   3) The chat input is protected by the same gibberish/profanity
      guard the rest of the site uses, so nonsense triggers an
      immediate in-line warning bubble.

   The tour content is derived from the real menu (index.html), so
   every section, category, and sub-category the user sees in the
   header is covered here, including linked pages (unity, chesed,
   memorial, aliyah-traveler, kids, customs, dictionary, learning,
   what-to-say, ask-rabbi, find-jewish).
   ================================================================ */
(function initKzGuide() {
  if (document.getElementById('kzGuideLauncher')) return; // idempotent

  /* ------------ 1. TOUR CONTENT (covers every menu + sub-menu) ------------ */
  const TOUR = [
    {
      icon: '✦',
      kicker: 'ברוך הבא · סיור מודרך',
      title: 'כל מרכז התפילה — בדקה וחצי',
      body: 'הסיור הזה הוא כמו סרטון קצר. הוא יקח אותך בעדינות דרך כל תפריט, כל קטגוריה וכל תת־קטגוריה באתר. אפשר לדלג, אפשר לחזור, וגם לשאול את הבוט שאלה חופשית בסוף.',
      bullets: []
    },
    {
      icon: '🏠',
      kicker: 'תפריט · בית',
      title: 'עמוד הבית',
      body: 'הלב של מרכז התפילה — לוח התפילה החי, הפסוק של היום, לוח השנה היהודי וסיפורי אמונה.',
      bullets: ['לוח תפילה חי', 'הפסוק של היום', 'לוח שנה יהודי', 'סיפורי אמונה']
    },
    {
      icon: '🕯',
      kicker: 'תפריט · בקש תפילה',
      title: 'בקש תפילה — אנונימי לחלוטין',
      body: 'כל התחומים שאפשר לבקש עליהם תפילה. לחיצה על תת־קטגוריה פותחת את הטופס עם הקטגוריה הנכונה כבר בפנים.',
      bullets: ['רפואה', 'פרנסה', 'זוגיות', 'שלום בית', 'ילדים ופוריות', 'הצלחה', 'הודיה']
    },
    {
      icon: '📜',
      kicker: 'תפריט · פיד',
      title: 'פיד הבקשות החי',
      body: 'ההזנה הכללית של כל הבקשות ברשת. אפשר לסנן לפי קטגוריה, או לבחור "מותאם לך" ולראות בקשות שקרובות למה שחשוב לך.',
      bullets: ['הפיד הכללי', 'מותאם לך', 'רפואה', 'פרנסה', 'זוגיות', 'שלום בית', 'הודיה']
    },
    {
      icon: '👤',
      kicker: 'תפריט · אזור אישי',
      title: 'המרחב הפרטי שלך',
      body: 'כאן ריכוז מלא של מה שאתה עושה ברשת — הבקשות שביקשת, על מי אתה מתפלל, וחיבורים רוחניים הדדיים שנוצרו.',
      bullets: ['הבקשות שלי', 'אני מתפלל על', 'חיבורים רוחניים']
    },
    {
      icon: '📚',
      kicker: 'תפריט · מאגר תפילות',
      title: 'מאגר תפילות, לימוד ומקורות',
      body: 'ארון ספרים דיגיטלי — נוסחים לפי קטגוריה, לימוד יומי, מנהגים ועדות, מילון יהודי־עברי, ו"מה אומרים כש…" למצבי חיים.',
      bullets: ['מאגר לפי קטגוריה', 'לימוד יומי', 'מנהגים ועדות', 'עברית יהודית 101', 'מה אומרים כש…', 'שאל רב']
    },
    {
      icon: '💙',
      kicker: 'תפריט · סיפורים',
      title: 'סיפורי לב ותקומה',
      body: 'מקורות שמחזקים — סיפורי תקומה, אמונה, מצוקה שהתבררה כברכה, ספר נשמות ואירועי חיים משותפים.',
      bullets: ['מקורות שמחזקים את הלב', 'תקומה', 'אמונה', 'מצוקה', 'ספר נשמות', 'אירועי חיים']
    },
    {
      icon: '🕍',
      kicker: 'תפריט · כל זכות יהודי',
      title: 'רשת הזכויות היהודית',
      body: 'המרחב שמחבר יהודים בכל העולם — רשת הזכויות, איתור קהילה קרובה, חסד והתנדבות, עלייה ונסיעה, פינת ילדים וספר נשמות.',
      bullets: ['רשת הזכויות', 'איתור קהילה', 'חסד והתנדבות', 'עלייה ונסיעה', 'פינת ילדים', 'ספר נשמות']
    },
    {
      icon: 'ℹ️',
      kicker: 'תפריט · אודות',
      title: 'אודות, יצירת קשר וחוקים',
      body: 'על מרכז התפילה, יצירת קשר, מדיניות הפרטיות, תנאי שימוש והצהרת הנגישות.',
      bullets: ['על מרכז התפילה', 'צור קשר', 'מדיניות פרטיות', 'תנאי שימוש', 'הצהרת נגישות']
    },
    {
      icon: '🔎',
      kicker: 'פעולות עליונות',
      title: 'חיפוש חכם, שפה, התראות, כניסה',
      body: 'בחלק העליון של כל עמוד: חיפוש חכם שקורא בכל האתר, מעבר עברית/English, פעמון התראות, והתחברות — כולל התחברות מהירה עם Google.',
      bullets: ['חיפוש חכם', 'עברית / English', 'פעמון התראות', 'התחברות / Google']
    },
    {
      icon: '🤖',
      kicker: 'בוט הסבר',
      title: 'יש לך שאלה? שאל אותי',
      body: 'הכפתור הזהוב הצף בצד מוביל לבוט הסבר חכם — אפשר לשאול אותו "איפה ספר נשמות?", "מה זה שאל רב?", "איך מבקשים תפילה?" והוא יענה ויקפיץ אותך לקטע הנכון. אם תתחיל לכתוב שטויות, הוא יעצור אותך בעדינות.',
      bullets: []
    }
  ];

  /* ------------ 2. HELP-BOT INTENTS (keyword → where in the site) ------------ */
  const INTENTS = [
    { keys: ['איך','בקש','בקשה','מבקש','תפילה חדשה','לבקש'], title: 'איך מבקשים תפילה',
      body: 'גלול לקטע "כתוב כאן את בקשת הלב שלך", בחר תחום (רפואה/פרנסה/זוגיות ועוד), כתוב מהלב או לחץ על המיקרופון. הבקשה מופיעה אנונימית בלבד.',
      href: '#create' },
    { keys: ['פיד','בקשות פעילות','להתפלל על'], title: 'הפיד הכללי',
      body: 'הפיד מראה את כל הבקשות החיות ברשת. אפשר לסנן לפי קטגוריה או לעבור ל"מותאם לך".',
      href: '#feed' },
    { keys: ['אזור אישי','הבקשות שלי','חיבורים','בונדס'], title: 'האזור האישי',
      body: 'כאן רואים את הבקשות שלך, על מי אתה מתפלל, וחיבורים רוחניים שנוצרו. גם שולחים מכאן תשובות ("תודה, הבעיה נפתרה" וכו׳).',
      href: '#me' },
    { keys: ['מאגר','תפילות ידועות','נוסחים','ספר'], title: 'מאגר תפילות',
      body: 'אוסף נוסחים לפי קטגוריה — מי שברך, תהילים, תפילות אישיות ועוד.',
      href: '#library' },
    { keys: ['לימוד','דף יומי','לימוד יומי'], title: 'לימוד יומי',
      body: 'לימוד יומי מסודר — פרשת שבוע, הלכה, חסידות ומוסר.',
      href: 'learning.html' },
    { keys: ['מנהג','עדות','עדה','ספרדי','אשכנז','תימני','חסידי'], title: 'מנהגים ועדות',
      body: 'מדריך למנהגים בין עדות ישראל — איך מברכים, איך מתפללים, איך חוגגים.',
      href: 'customs.html' },
    { keys: ['מילון','101','עברית','מושגים'], title: 'עברית יהודית 101',
      body: 'מילון מונחים יהודיים־עבריים לכל אחד. מה זה "לעילוי נשמה", "רפואה שלמה", "לחיים"…',
      href: 'dictionary.html' },
    { keys: ['מה אומרים','אומרים כש','ברכה מיוחדת'], title: 'מה אומרים כש…',
      body: 'מצבי חיים (לידה, מחלה, נסיעה, שמחה) — ומה נהוג לומר או לברך.',
      href: 'what-to-say.html' },
    { keys: ['שאל רב','רב','שאלה לרב','הלכתית'], title: 'שאל רב',
      body: 'שולחים שאלה הלכתית/רגישה — ומקבלים מענה ממסלול רבני מוסמך.',
      href: 'ask-rabbi.html' },
    { keys: ['סיפור','תקומה','אמונה','מצוקה','השפלה'], title: 'סיפורי לב',
      body: 'סיפורי תקומה ואמונה שמחזקים — בתקופות מורכבות גם האור הקטן עושה הרבה.',
      href: '#stories' },
    { keys: ['ספר נשמות','נשמות','יזכור','לעילוי'], title: 'ספר נשמות',
      body: 'עמוד זיכרון לאהובים — נרות וירטואליים, ציון תאריכים והתראה ביום השנה.',
      href: 'memorial.html' },
    { keys: ['אירועי חיים','ברית','בת מצווה','חתונה'], title: 'אירועי חיים',
      body: 'לידה, ברית, בת־מצווה, חתונה — וכל מה שאפשר לבקש, לברך ולשתף סביבם.',
      href: 'life-events.html' },
    { keys: ['זכות','כל זכות','רשת זכויות','אחדות','יהודי'], title: 'כל זכות יהודי',
      body: 'הרשת המאחדת — זכויות שיהודי צובר על עצמו או בשביל אחרים, איתור קהילות, חסד ועלייה.',
      href: 'unity.html' },
    { keys: ['קהילה','בית כנסת','מניין','איתור'], title: 'איתור קהילה',
      body: 'מפה וחיפוש של קהילות, מניינים, בתי כנסת ומרכזים יהודיים סביבך.',
      href: 'find-jewish.html' },
    { keys: ['חסד','התנדבות','לעזור'], title: 'חסד והתנדבות',
      body: 'איך להיכנס לגמילות חסדים, לוחות התנדבות ואיפה ממש חסר כרגע.',
      href: 'chesed.html' },
    { keys: ['עלייה','נסיעה','טיול','מטייל','טיסה'], title: 'עלייה ונסיעה',
      body: 'טיפים לעולה ולנוסע יהודי — כשרות, תפילה בדרכים, אנשי קשר בשטח.',
      href: 'aliyah-traveler.html' },
    { keys: ['ילדים','פינת ילדים','ילד'], title: 'פינת ילדים',
      body: 'פעילויות, סיפורים ואומנויות לילדים — שפה עברית, פרשת השבוע וערכים.',
      href: 'kids.html' },
    { keys: ['גוגל','google','התחבר','התחברות','הרשמה'], title: 'התחברות / Google',
      body: 'בראש הדף יש כפתור "התחברות". אפשר להירשם רגיל, או להתחבר מהר עם Google.',
      href: '#hero' },
    { keys: ['שפה','אנגלית','english','עברית','rtl'], title: 'החלפת שפה',
      body: 'בצד השמאל־עליון יש מתג דגלים — עברית / English.',
      href: '#hero' },
    { keys: ['פרטיות','מדיניות','תנאי','נגישות'], title: 'מסמכים',
      body: 'מדיניות פרטיות, תנאי שימוש והצהרת נגישות — בתפריט "אודות".',
      href: 'privacy.html' },
    { keys: ['חיפוש','חפש','mega'], title: 'חיפוש חכם',
      body: 'בראש העמוד יש חיפוש חכם שסורק את כל האתר — תפילות, מנהגים, ערים, צדיקים.',
      href: '#megaSearch' }
  ];

  const DEFAULT_REPLY = {
    title: 'אני כאן כדי לעזור לך להתמצא',
    body: 'אפשר לכתוב בקצרה את מה שמחפשים — "ספר נשמות", "שאל רב", "איך מבקשים תפילה", "חסד", "עלייה", "מנהגים" וכדומה.',
    href: null
  };

  /* ------------ 3. GIBBERISH / PROFANITY GUARD (shared) ------------ */
  const BAD = (window.PC_MOD_LIST && window.PC_MOD_LIST.length) ? window.PC_MOD_LIST : [
    'כוסאמא','כוסאמק','בן זונה','זונה','זין','חרא','שרמוטה','מניאק','דפוק',
    'קוקסינל','אידיוט','טמבל','מטומטם','שיט','פאק','פאקינג','בנזונה',
    'fuck','shit','bitch','asshole','dick','cunt'
  ];
  const FULL_RX = new RegExp('(' + BAD.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|') + ')', 'i');

  function isGibberish(str) {
    const s = String(str || '').trim();
    if (s.length < 5) return false;
    if (/(.)\1{4,}/.test(s)) return true;                    // ssssss, אאאאא
    if (/^[^א-תa-zA-Z0-9\s]+$/.test(s)) return true;         // only punctuation
    if (/[בגדזחטכלמנסעפצקרשתךםןףץ]{6,}/.test(s)) return true;
    const tokens = s.split(/\s+/).filter(t => t.length >= 3);
    if (tokens.length >= 2) {
      const weird = tokens.filter(t => {
        const clean = t.replace(/[^\u0590-\u05FFa-z]/gi, '');
        const uniq = new Set(clean.split(''));
        return uniq.size > 0 && uniq.size <= 2 && clean.length >= 4;
      });
      if (weird.length >= 2) return true;
      const counts = {};
      tokens.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
      if (Object.values(counts).some(n => n >= 4)) return true;
    }
    // heavy mix of latin+hebrew+digits in a short string — usually mashing
    if (s.length <= 20 && /[א-ת]/.test(s) && /[a-z]/i.test(s) && /\d/.test(s)) return true;
    return false;
  }

  /* ------------ 4. BUILD THE LAUNCHER + OVERLAYS ------------ */
  const launcher = document.createElement('button');
  launcher.id = 'kzGuideLauncher';
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'סיור מודרך ובוט עזרה');
  launcher.innerHTML = `
    <span class="kz-guide-ring" aria-hidden="true"></span>
    <span class="kz-guide-ico" aria-hidden="true">✦</span>
    <span class="kz-guide-text">מדריך האתר</span>
  `;

  const wrap = document.createElement('div');
  wrap.id = 'kzGuideRoot';
  wrap.innerHTML = `
    <div class="kz-guide-dock" role="group" aria-label="כלי הדרכה">
      <button type="button" class="kz-guide-dock-btn" data-action="tour">
        <span aria-hidden="true">▶</span>
        <span>סיור מודרך</span>
      </button>
      <button type="button" class="kz-guide-dock-btn" data-action="chat">
        <span aria-hidden="true">✦</span>
        <span>שאל את ה־AI (חכם)</span>
      </button>
    </div>

    <div class="kz-tour" id="kzTour" hidden>
      <div class="kz-tour-back" data-kz-close></div>
      <div class="kz-tour-card" role="dialog" aria-modal="true" aria-labelledby="kzTourTitle">
        <button class="kz-tour-x" data-kz-close aria-label="סגור">✕</button>
        <div class="kz-tour-bar"><span id="kzTourBar"></span></div>
        <div class="kz-tour-stage" id="kzTourStage"></div>
        <div class="kz-tour-foot">
          <button class="kz-tour-btn ghost" id="kzTourPrev" type="button">הקודם</button>
          <button class="kz-tour-btn pause" id="kzTourPause" type="button" aria-pressed="false" aria-label="השהה/המשך">
            <span class="kz-tour-pause-ico" aria-hidden="true">⏸</span>
            <span class="kz-tour-pause-txt">השהה</span>
          </button>
          <div class="kz-tour-dots" id="kzTourDots" aria-hidden="true"></div>
          <button class="kz-tour-btn primary" id="kzTourNext" type="button">הבא</button>
        </div>
        <div class="kz-tour-speed" role="group" aria-label="בחירת קצב">
          <span class="kz-tour-speed-label">קצב:</span>
          <button type="button" class="kz-tour-speed-btn" data-speed="12000">רגוע</button>
          <button type="button" class="kz-tour-speed-btn is-active" data-speed="8500">רגיל</button>
          <button type="button" class="kz-tour-speed-btn" data-speed="5200">מהיר</button>
          <button type="button" class="kz-tour-speed-btn" data-speed="0">ידני</button>
        </div>
      </div>
    </div>

    <div class="kz-chat" id="kzChat" hidden>
      <div class="kz-chat-head">
        <div class="kz-chat-title">
          <span class="kz-chat-dot"></span>
          <span>בוט ההסבר של מרכז התפילה</span>
        </div>
        <button type="button" class="kz-chat-x" data-kz-close aria-label="סגור">✕</button>
      </div>
      <div class="kz-chat-body" id="kzChatBody" aria-live="polite"></div>
      <form class="kz-chat-form" id="kzChatForm" autocomplete="off">
        <div class="kz-chat-wrap">
          <input id="kzChatInput" type="text" maxlength="220" placeholder="שאל על כל דבר באתר — למשל ‘איפה ספר נשמות?’" aria-label="כתוב שאלה לבוט" />
          <div class="kz-chat-bubble" id="kzChatWarn" role="status" aria-live="polite"></div>
        </div>
        <button class="kz-chat-send" type="submit" aria-label="שלח">שלח</button>
      </form>
      <div class="kz-chat-chips" id="kzChatChips"></div>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(wrap);

  /* ------------ 5. TOUR LOGIC ------------ */
  const tourEl   = wrap.querySelector('#kzTour');
  const stageEl  = wrap.querySelector('#kzTourStage');
  const dotsEl   = wrap.querySelector('#kzTourDots');
  const barEl    = wrap.querySelector('#kzTourBar');
  const nextBtn  = wrap.querySelector('#kzTourNext');
  const prevBtn  = wrap.querySelector('#kzTourPrev');
  const pauseBtn = wrap.querySelector('#kzTourPause');
  const speedWrap= wrap.querySelector('.kz-tour-speed');
  let idx = 0, autoTimer = null;
  let tourSpeed = 8500;      // default slower cadence (was 5200)
  let tourPaused = false;

  TOUR.forEach((step, i) => {
    const s = document.createElement('section');
    s.className = 'kz-tour-step' + (i === 0 ? ' is-active' : '');
    s.innerHTML = `
      <div class="kz-tour-art"><span class="kz-tour-ring"></span><span class="kz-tour-ico">${step.icon}</span></div>
      <div class="kz-tour-kicker">${step.kicker}</div>
      <h2 class="kz-tour-title" ${i===0?'id="kzTourTitle"':''}>${step.title}</h2>
      <p class="kz-tour-body">${step.body}</p>
      ${step.bullets.length ? `<ul class="kz-tour-bullets">${step.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>` : ''}
    `;
    stageEl.appendChild(s);
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'kz-tour-dot' + (i===0?' active':'');
    dot.setAttribute('aria-label', `צעד ${i+1} מתוך ${TOUR.length}`);
    dot.addEventListener('click', () => { setPaused(true); go(i); });
    dotsEl.appendChild(dot);
  });

  function render() {
    stageEl.querySelectorAll('.kz-tour-step').forEach((s, i) => s.classList.toggle('is-active', i === idx));
    dotsEl.querySelectorAll('.kz-tour-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
      d.classList.toggle('done', i < idx);
    });
    barEl.style.width = (((idx + 1) / TOUR.length) * 100) + '%';
    prevBtn.disabled = idx === 0;
    nextBtn.textContent = idx === TOUR.length - 1 ? 'סיים · תודה' : 'הבא';
  }
  function go(i) { idx = Math.max(0, Math.min(TOUR.length - 1, i)); render(); }

  function scheduleAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
    if (tourPaused || tourSpeed <= 0) return;
    autoTimer = setInterval(() => {
      if (idx < TOUR.length - 1) go(idx + 1);
      else { clearInterval(autoTimer); autoTimer = null; }
    }, tourSpeed);
  }
  function setPaused(v) {
    tourPaused = !!v;
    pauseBtn.setAttribute('aria-pressed', tourPaused ? 'true' : 'false');
    pauseBtn.classList.toggle('is-paused', tourPaused);
    pauseBtn.querySelector('.kz-tour-pause-ico').textContent = tourPaused ? '▶' : '⏸';
    pauseBtn.querySelector('.kz-tour-pause-txt').textContent = tourPaused ? 'המשך' : 'השהה';
    tourEl.classList.toggle('is-paused', tourPaused);
    if (tourPaused) { clearInterval(autoTimer); autoTimer = null; }
    else scheduleAuto();
  }

  function openTour() {
    tourEl.hidden = false;
    document.body.classList.add('kz-guide-open');
    idx = 0;
    tourPaused = false;
    setPaused(false);
    render();
    scheduleAuto();
  }
  function closeTour() {
    tourEl.hidden = true;
    document.body.classList.remove('kz-guide-open');
    clearInterval(autoTimer); autoTimer = null;
    try { localStorage.setItem('kz_guide_seen_v1', '1'); } catch {}
  }

  nextBtn.addEventListener('click', () => { setPaused(true); if (idx === TOUR.length - 1) closeTour(); else go(idx + 1); });
  prevBtn.addEventListener('click', () => { setPaused(true); go(idx - 1); });
  pauseBtn.addEventListener('click', () => setPaused(!tourPaused));
  speedWrap.addEventListener('click', (e) => {
    const b = e.target.closest('.kz-tour-speed-btn'); if (!b) return;
    speedWrap.querySelectorAll('.kz-tour-speed-btn').forEach(x => x.classList.remove('is-active'));
    b.classList.add('is-active');
    tourSpeed = parseInt(b.dataset.speed, 10) || 0;
    if (tourSpeed === 0) setPaused(true); else { tourPaused = false; setPaused(false); }
  });

  /* ------------ 6. CHAT BOT LOGIC ------------ */
  const chatEl   = wrap.querySelector('#kzChat');
  const chatBody = wrap.querySelector('#kzChatBody');
  const chatForm = wrap.querySelector('#kzChatForm');
  const chatIn   = wrap.querySelector('#kzChatInput');
  const chatWarn = wrap.querySelector('#kzChatWarn');
  const chatChips= wrap.querySelector('#kzChatChips');

  ['איך מבקשים תפילה?','ספר נשמות','שאל רב','חסד והתנדבות','עלייה','מנהגים','מה זה פיד?'].forEach(q => {
    const c = document.createElement('button');
    c.type = 'button'; c.className = 'kz-chip'; c.textContent = q;
    c.addEventListener('click', () => { chatIn.value = q; chatForm.requestSubmit(); });
    chatChips.appendChild(c);
  });

  function pushMsg(from, html) {
    const row = document.createElement('div');
    row.className = 'kz-chat-row ' + from;
    row.innerHTML = `<div class="kz-chat-msg">${html}</div>`;
    chatBody.appendChild(row);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function openChat() {
    chatEl.hidden = false;
    document.body.classList.add('kz-guide-open');
    if (!chatBody.dataset.greeted) {
      chatBody.dataset.greeted = '1';
      pushMsg('bot', 'שלום · אני בוט ההסבר של מרכז התפילה. אפשר לשאול אותי על כל תפריט, קטגוריה או דף באתר. ☺');
    }
    setTimeout(() => chatIn.focus(), 40);
  }
  function closeChat() {
    chatEl.hidden = true;
    document.body.classList.remove('kz-guide-open');
  }

  function matchIntent(q) {
    const low = q.toLowerCase();
    let best = null, bestScore = 0;
    INTENTS.forEach(intent => {
      let score = 0;
      intent.keys.forEach(k => { if (low.includes(k.toLowerCase())) score += 1 + (k.length > 4 ? 1 : 0); });
      if (score > bestScore) { bestScore = score; best = intent; }
    });
    return bestScore ? best : null;
  }

  function respond(q) {
    if (FULL_RX.test(q)) {
      showWarn('הבוט זיהה ניסוח גס — לא נמשיך בכיוון הזה. נסה לנסח בכבוד.');
      pushMsg('bot', 'רגע — במרכז התפילה מדברים בכבוד. אפשר לנסח את השאלה מחדש?');
      return;
    }
    if (isGibberish(q)) {
      showWarn('נראה שהקלט אינו טקסט אמיתי — נסה לנסח שאלה ברורה.');
      pushMsg('bot', 'לא הצלחתי להבין את השאלה — אולי הייתה שם פליטה? אפשר לנסח שוב: למשל "איך מבקשים תפילה?"');
      return;
    }
    const intent = matchIntent(q) || DEFAULT_REPLY;
    const link = intent.href
      ? `<a class="kz-chat-link" href="${intent.href}" data-kz-close>${intent.title} — פתח</a>`
      : '';
    pushMsg('bot', `<strong>${intent.title}</strong><br/>${intent.body}${link ? '<br/>'+link : ''}`);
  }

  let warnTimer;
  function showWarn(text) {
    if (!text) { chatWarn.classList.remove('show'); return; }
    chatWarn.textContent = text;
    chatWarn.classList.add('show');
    clearTimeout(warnTimer);
    warnTimer = setTimeout(() => chatWarn.classList.remove('show'), 3500);
  }

  // Live feedback while typing — pop up BEFORE submit.
  chatIn.addEventListener('input', () => {
    const v = chatIn.value;
    if (FULL_RX.test(v)) { showWarn('רגע — שים לב לניסוח. כאן מדברים בכבוד.'); return; }
    if (isGibberish(v)) { showWarn('נראה שמה שהוקלד לא ממש מובן — נסה שוב במילים ברורות.'); return; }
    showWarn('');
  });

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = chatIn.value.trim();
    if (!q) return;
    pushMsg('me', q.replace(/[<>]/g,''));
    chatIn.value = '';
    showWarn('');
    setTimeout(() => respond(q), 260);
  });

  /* ------------ 7. LAUNCHER + DOCK INTERACTIONS ------------ */
  const dock = wrap.querySelector('.kz-guide-dock');
  launcher.addEventListener('click', () => {
    wrap.classList.toggle('dock-open');
    launcher.classList.toggle('is-open');
  });
  dock.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    wrap.classList.remove('dock-open');
    launcher.classList.remove('is-open');
    if (b.dataset.action === 'tour') openTour();
    if (b.dataset.action === 'chat') {
      // Route to the smart Claude-powered AI panel. Fallback to the
      // local keyword bot only if the AI launcher is somehow unavailable.
      const aiLauncher = document.getElementById('kzAiLauncher');
      if (aiLauncher) { aiLauncher.click(); }
      else { openChat(); }
    }
  });

  // Also bind the new header button (index.html #tourBtn) directly to the tour.
  const tourBtn = document.getElementById('tourBtn');
  if (tourBtn) {
    tourBtn.addEventListener('click', () => {
      tourBtn.classList.add('seen');
      openTour();
    });
  }

  wrap.addEventListener('click', (e) => {
    if (e.target.matches('[data-kz-close]')) {
      // Closest open overlay wins.
      if (!tourEl.hidden) closeTour();
      if (!chatEl.hidden) closeChat();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!tourEl.hidden) closeTour();
      if (!chatEl.hidden) closeChat();
      return;
    }
    if (tourEl.hidden) return;
    if (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') {
      e.preventDefault();
      setPaused(!tourPaused);
    } else if (e.key === 'ArrowLeft') {
      // RTL: left = next
      setPaused(true);
      if (idx < TOUR.length - 1) go(idx + 1);
    } else if (e.key === 'ArrowRight') {
      setPaused(true);
      go(idx - 1);
    }
  });

  /* ------------ 8. EXTRA GIBBERISH GUARD FOR EXISTING INPUTS ------------ */
  // Mega search + contact already have guards, but this adds a visible bubble
  // to the mega search too — so nonsense there also gets a friendly warning.
  const mega = document.getElementById('megaSearchInput');
  if (mega && !mega.dataset.kzGuarded) {
    mega.dataset.kzGuarded = '1';
    const bubble = document.createElement('div');
    bubble.className = 'kz-search-warn';
    bubble.setAttribute('role','status');
    mega.parentElement?.appendChild(bubble);
    mega.addEventListener('input', () => {
      const v = mega.value;
      if (FULL_RX.test(v)) { bubble.textContent = 'רגע — ניסוח גס. נסה מילים בכבוד.'; bubble.classList.add('show'); return; }
      if (isGibberish(v)) { bubble.textContent = 'נראה שהטקסט לא אמיתי — נסה מילה אחת ברורה (למשל "רפואה").'; bubble.classList.add('show'); return; }
      bubble.classList.remove('show');
    });
  }

  /* ------------ 9. AUTO-OPEN TOUR ON FIRST VISIT ------------ */
  let seen = false;
  try { seen = !!localStorage.getItem('kz_guide_seen_v1'); } catch {}
  if (!seen) {
    // Respect the original onboarding tour — only open once it's done.
    setTimeout(() => {
      const existingTour = document.getElementById('tourOverlay');
      if (!tourEl.hidden) return;
      if (existingTour && !existingTour.hidden) return;
      openTour();
    }, 2600);
  }
})();
