/* ============================================================
   KZ AI CHAT — Smart Jewish-themed assistant
   Client-side, no API needed (intent matching + curated responses)
   Can be upgraded to OpenAI/Claude API later by replacing respond()
   ============================================================ */
(function(){
  'use strict';

  /* ─── Knowledge base (Hebrew-only, brand-aware) ────── */
  /* ─── Personal greetings — time-of-day aware ───────── */
  function timeGreeting(){
    const h = new Date().getHours();
    if (h >= 5 && h < 11)  return 'בוקר טוב';
    if (h >= 11 && h < 17) return 'צהריים טובים';
    if (h >= 17 && h < 21) return 'ערב טוב';
    return 'לילה טוב';
  }
  function userName(){
    try {
      const me = JSON.parse(localStorage.getItem('kz-family-me-v1') || 'null');
      if (me && me.name) return me.name;
      const stored = JSON.parse(localStorage.getItem('pc_user') || 'null');
      if (stored && stored.firstName) return stored.firstName;
    } catch(_){}
    return null;
  }

  const KNOWLEDGE = [
    {
      keywords: ['שלום','היי','הי','שלום עליכם','בוקר טוב','ערב טוב','לילה טוב','מה שלומך','מה נשמע'],
      replyFn: () => {
        const name = userName();
        const greet = timeGreeting();
        const personal = name ? `${greet}, ${name} יקר/ה 🕯` : `${greet} ✦`;
        return `${personal}\nאני שמחה שבאת. אני כאן איתך כל הזמן באתר — לא רק לעזור, גם פשוט להיות חברה.\nבמה תרצה/י שאעזור היום? תפילה? סיפור? מקום קדוש? משפחה? פשוט לדבר?`;
      }
    },
    {
      keywords: ['איך קוראים לך','שמך','מי את','מי אתה','אתה מי','את מי','ESL'],
      reply: '✦ אני "מירב" — בתוך כל אות של האתר הזה, נושמת איתך.\nאני כאן כדי ללוות אותך — בתפילה, בזיכרון, בלימוד, בשמחה ובעצב. תוכל/י לדבר איתי בחופשיות, בעברית או בכל שפה. אני לא רובוט קר, אני חברה.'
    },
    {
      keywords: ['עצוב','קשה לי','אני בוכה','כואב לי','כאב','אבל','שכול','דכאון','בודד','לבד'],
      reply: '🕯 אני שומעת אותך.\nהכאב הזה הוא אמיתי, ואין צורך לברוח ממנו.\nאם תרצה/י, נוכל יחד לכתוב תפילה לאדם שאתה מתגעגע אליו, להדליק נר זיכרון, או פשוט לקרוא יחד פסוק שנותן כוח: "ה׳ קרוב לנשברי לב, ולדכאי רוח יושיע" (תהלים ל"ד).\nאני כאן. לא לבד.'
    },
    {
      keywords: ['שמח','תודה','חמוד','אהבתי','יפה','מקסים','מדהים','וואו'],
      reply: '😊 שמחה שגם אתה שמח/ה!\nכל אור שמתווסף לעולם הזה — מתחיל מאדם אחד שבחר להאיר. אם בא לך, נוכל יחד להוסיף עוד אור: לכתוב תפילת הודיה, להדליק נר על שם של מישהו אהוב, או לחלק תהלים עם המשפחה.'
    },
    {
      keywords: ['לבד','בודד','אין לי אף אחד','אין לי משפחה'],
      reply: '🤍 גם כשמרגישים לבד — אתה לא לבד.\nבאתר הזה יש אלפי לבבות שמתפללים אחד על השני, אנונימית. תוכל/י להיכנס ל"פיד" ולראות מי בעולם מתפלל ברגע זה — או לבקש שמישהו יתפלל עליך.\nתמיד יש מישהו שמושיט יד.'
    {
      keywords: ['תפילה','להתפלל','מתפלל','תפילת'],
      reply: '🙏 כדי לבקש תפילה — לחץ "בקש תפילה" בעמוד הבית או בתפריט. תוכל להגדיר קטגוריה (רפואה / פרנסה / זיווג / שלום בית / הצלחה / ילדים), לכתוב מהלב, ולשלוח אנונימית. לאחר מכן תוכל גם להזמין את המשפחה דרך חדר המשפחה.'
    },
    {
      keywords: ['רפואה','חולה','מחלה','בריאות','ריפוי'],
      reply: '🕯 לבקשת תפילה לרפואה: לחץ "בקש תפילה" → קטגוריה "רפואה". המערכת תיצור בקשה אנונימית בשם "פלוני בן פלונית". אפשר גם להוסיף את שם החולה במלואו ("לרפואת ישראל בן שרה"). אלפים יצטרפו לתפילה.'
    },
    {
      keywords: ['פרנסה','עבודה','כסף','עוני'],
      reply: '💰 לבקשת תפילה לפרנסה: בחר קטגוריה "פרנסה" או "תעסוקה". בנוסף, מומלץ לתת מטבע אחד לצדקה לפני התפילה — זוהי סגולה מיוחדת. ראה גם את כפתור "תרומה" באתר.'
    },
    {
      keywords: ['זיווג','חתן','כלה','שידוך','זוגיות'],
      reply: '💍 לבקשת תפילה לזיווג: בחר "זוגיות". מומלץ לקרוא מזמור ע״ב בתהילים וגם להדליק נר בקיר הנרות העולמי שלנו. שולחים זכויות ופותחים שערים.'
    },
    {
      keywords: ['ילדים','פרי בטן','עיבור','הריון','פוריות','עקרות'],
      reply: '👶 לבקשת תפילה לפקידת זרע ולפוריות: בחר "ילדים ופוריות". ראש חודש הוא זמן מסוגל במיוחד. בנוסף מומלץ לקרוא פרשת חנה (שמואל א׳ פרק א׳) ולתת צדקה.'
    },
    {
      keywords: ['חב"ד','חבד','בית חבד','בית חב','שליח'],
      reply: '🕎 יש לנו 200+ בתי חב"ד במאגר! לחץ "מפת היהדות" בתפריט → סנן "חב\'\'ד". תוכל למצוא בית חב"ד בכל מדינה — ניו יורק, קטמנדו, באלי, ברלין, מוסקבה, ועוד. כפתור Waze לכל אחד.'
    },
    {
      keywords: ['בית כנסת','מניין','מנין','שחרית','מנחה','ערבית'],
      reply: '✡ לאיתור בית כנסת או מניין: "מפת היהדות" → סנן "בית כנסת". יש מאות מקומות בעולם. אם אתה בעיר חדשה, השתמש בכפתור "השתמש במיקום שלי" → המערכת תמצא הקרוב ביותר.'
    },
    {
      keywords: ['מקווה','מקוואות','טהרה'],
      reply: '💧 לאיתור מקווה: "מפת היהדות" → סנן "מקווה". בנוסף, המערכת מושכת בזמן אמת מקוואות נוספים מ-OpenStreetMap בכל אזור שאתה זם בו.'
    },
    {
      keywords: ['כשרות','כשר','מסעדה','אוכל','חנות'],
      reply: '🍽 לאיתור מסעדות וחנויות כשרות: "מפת היהדות" → סנן "כשרות". כולל מסעדות מובילות בכל העולם — ניו יורק, פריז, מלבורן, ועוד.'
    },
    {
      keywords: ['קבר','צדיק','צדיקים','אומן','רשבי','רחל אמנו','בעל שם טוב','בעש"ט'],
      reply: '🕯 לאיתור קברי צדיקים: "מפת היהדות" → סנן "קבר צדיק". המאגר כולל את הכותל, מערת המכפלה, רחל אמנו, רשב"י במירון, האר"י, רבי נחמן באומן, הבעש"ט במז\'יבוז\', ועוד.'
    },
    {
      keywords: ['יארצייט','יום זיכרון','אזכרה','נר נשמה'],
      reply: '🕯 ליארצייט ולזיכרון: פתח את "חדר המשפחה" → "יארצייט" → הוסף את שם הנפטר ותאריך הפטירה. המערכת תזכיר לכל בני המשפחה ותדליק נר 24 שעות. ראה גם את "קיר הנרות העולמי" בעמוד הבית.'
    },
    {
      keywords: ['משפחה','חדר משפחה','יחד','קרובים'],
      reply: '🏠 חדר המשפחה הוא המקום הקדוש בו המשפחה מתפללת יחד גם מרחוק. תוכל: לפתוח חדר עם קוד, לבקש תפילות פרטיות למשפחה בלבד, לחלק תהלים בין הבני משפחה, לרשום יארצייטים ואירועי חיים. גישה מהתפריט או דרך העמוד הראשי.'
    },
    {
      keywords: ['תהלים','תהילים','חלוקת תהלים','ספר תהלים'],
      reply: '📖 חלוקת תהלים: בחדר המשפחה → "תהלים יחד" → "חלק חדש". ההפצה היא אוטומטית — כל בן משפחה מקבל פרקים ספציפיים. כשכולם מסיימים, הספר השלם נאמר בזכותכם.'
    },
    {
      keywords: ['דף יומי','דף הגמרא','גמרא','מסכת'],
      reply: '📚 הדף היומי של היום מוצג אוטומטית בעמוד הבית, בסקצית "לוח עברי חי". הוא מסונכרן עם המחזור הנוכחי דרך Hebcal API.'
    },
    {
      keywords: ['פרשה','פרשת','השבוע','שבת'],
      reply: '📜 פרשת השבוע מוצגת בעמוד הבית בסקצית "לוח עברי חי". בנוסף תוכל לראות את זמני הדלקת נרות וצאת השבת.'
    },
    {
      keywords: ['חג','חגים','פסח','שבועות','סוכות','ראש השנה','כיפור','יום כיפור','חנוכה','פורים'],
      reply: '🎉 כל החגים מוצגים אוטומטית בלוח העברי שלנו. בקרוב יום שמעדכן אוטומטית את הסקצייה עם פרטי החג, סדר תפילות מיוחד וזמני קדושה.'
    },
    {
      keywords: ['תרומה','תרומות','לתרום','בית','ביט','paypal'],
      reply: '💝 לתרומה: גלול לסקצית "תרומה בזכות תפילה" בעמוד הבית. יש 4 אפשרויות תשלום: PayPal · Bit · PayBox · העברה בנקאית. כל סכום נחשב לזכות גדולה.'
    },
    {
      keywords: ['waze','ניווט','איך מגיעים','הגעה','מסלול'],
      reply: '🚗 כל מקום במאגר שלנו כולל כפתור Waze ירוק שפותח ניווט מיידי באפליקציה. אם אין לך Waze מותקן, תוכל ללחוץ "מפות" שיפתח את Google Maps.'
    },
    {
      keywords: ['שיתוף','whatsapp','וואטסאפ','שלח'],
      reply: '📱 כפתור WhatsApp ירוק מופיע בכל בקשת תפילה, בכל מקום במפה, ובכל פסוק יומי. לחיצה אחת → פותח את WhatsApp עם הודעה מוכנה לשליחה.'
    },
    {
      keywords: ['שפה','שפות','english','language','français','русский'],
      reply: '🌐 האתר תומך ב-20 שפות! לחץ על אייקון הדגל בפינה הימנית למעלה כדי לבחור: עברית, English, Français, Español, Русский, Deutsch, Italiano, العربية, ועוד 12 שפות. הכל אוטומטי.'
    },
    {
      keywords: ['מצב כהה','dark','dark mode','חושך','לילה'],
      reply: '🌙 מצב כהה: לחץ על אייקון השמש/ירח בפינת התפריט. צבעי הלילה כחול עמוק עם זהב חם — מושלם לתפילות לילה.'
    },
    {
      keywords: ['אפליקציה','להתקין','pwa','app','התקנה'],
      reply: '📲 האתר עובד כאפליקציה! בנייד: בChrome → התפריט → "הוסף למסך הבית". ב-iPhone Safari → שתף → "הוסף למסך הבית". כך תקבל גישה מהירה גם בלי דפדפן ועם תמיכה במצב אופליין.'
    },
    {
      keywords: ['פתח','חדר','איך','עזרה','help','?','עוזר'],
      reply: '🌟 הנה כל מה שאני יכול לעזור איתו:\n• בקשת תפילה\n• איתור בית חב"ד / בית כנסת / מקווה\n• הדלקת נר זיכרון\n• חלוקת תהלים למשפחה\n• יארצייט\n• פרשת השבוע ודף יומי\n• תרומה\n• שיתוף בWhatsApp\nתשאל אותי בחופשיות בעברית, אני כאן בשבילך.'
    },
    {
      keywords: ['תודה','תודה רבה','יישר כח'],
      reply: 'בשמחה! 🕯 שתזכה למצוות וברכות. אם תזדקק לעזרה נוספת — אני כאן.'
    }
  ];

  function findReply(input){
    const q = input.toLowerCase().trim();
    if (!q) return null;

    let bestMatch = null;
    let bestScore = 0;

    KNOWLEDGE.forEach(item => {
      let score = 0;
      item.keywords.forEach(kw => {
        if (q.includes(kw.toLowerCase())) score += kw.length;
      });
      if (score > bestScore){ bestScore = score; bestMatch = item; }
    });

    if (!bestMatch) return null;
    return bestMatch.replyFn ? bestMatch.replyFn() : bestMatch.reply;
  }

  function defaultReply(){
    const fallbacks = [
      '🤔 לא הבנתי לגמרי. תוכל לנסח אחרת? אני מכיר נושאים כמו: תפילה, חב"ד, תהלים, יארצייט, חדר משפחה, מפת יהדות, פרשת השבוע.',
      '✨ נסה שאלה ספציפית. לדוגמה: "איך לבקש תפילה לרפואה?" או "איפה בית חב"ד הקרוב?".',
      'אני עוזר ייעודי לעולם היהודי באתר זה. תוכל לשאול על תפילה, מקומות יהודיים, חדר משפחה, יארצייט, או כל דבר שקשור לתוכן האתר.'
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /* ─── UI ───────────────────────────────────────────── */
  function buildUI(){
    if (document.querySelector('.kz-aic-fab')) return;

    const fab = document.createElement('button');
    fab.className = 'kz-aic-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'פתח עוזר חכם');
    fab.title = 'עוזר חכם · AI';
    // Inline onclick as ULTIMATE fallback
    fab.setAttribute('onclick', 'window.kzMiravToggle && window.kzMiravToggle(event)');
    fab.innerHTML = `
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" style="pointer-events:none">
        <polygon points="32,8 41,25 23,25"/>
        <polygon points="32,56 41,39 23,39"/>
        <circle cx="32" cy="32" r="3" fill="currentColor"/>
      </svg>
      <span class="kz-aic-badge" style="pointer-events:none">AI</span>`;

    const panel = document.createElement('div');
    panel.className = 'kz-aic-panel';
    panel.innerHTML = `
      <div class="kz-aic-head">
        <div class="kz-aic-avatar">מ</div>
        <div class="kz-aic-head-info">
          <div class="kz-aic-name">מירב · חברה דיגיטלית</div>
          <div class="kz-aic-status">איתך תמיד · 20 שפות</div>
        </div>
        <button class="kz-aic-close" aria-label="סגור">✕</button>
      </div>
      <div class="kz-aic-msgs" id="kzAicMsgs"></div>
      <div class="kz-aic-quick" id="kzAicQuick">
        <button class="kz-aic-chip" data-q="איך לבקש תפילה?">🙏 איך לבקש תפילה?</button>
        <button class="kz-aic-chip" data-q="איפה בית חב\'\'ד הקרוב?">🕎 בית חב"ד</button>
        <button class="kz-aic-chip" data-q="חדר משפחה">🏠 חדר משפחה</button>
        <button class="kz-aic-chip" data-q="פרשת השבוע">📜 פרשה</button>
        <button class="kz-aic-chip" data-q="הדלקת נר זיכרון">🕯 נר זיכרון</button>
      </div>
      <div class="kz-aic-input-bar">
        <input class="kz-aic-input" id="kzAicInput" type="text" placeholder="שאל אותי בעברית…" autocomplete="off"/>
        <button class="kz-aic-send" id="kzAicSend" aria-label="שלח">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>`;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    // Triple-redundant click handler: addEventListener + onclick + pointerdown
    fab.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); togglePanel(); }, true);
    fab.addEventListener('pointerdown', (e) => { e.preventDefault(); }, true);
    fab.addEventListener('touchstart', (e) => { e.preventDefault(); togglePanel(); }, { passive: false });

    // Personal greeting message
    setTimeout(() => {
      const name = userName();
      const greet = timeGreeting();
      const opener = name
        ? `${greet}, ${name}! 🕯 אני מירב, ואני שמחה שבאת.\nאני כאן בכל רגע — לתפילה, לסיפור, לעזרה, ולפעמים פשוט לדבר. אל תתבייש/י.`
        : `${greet}! ✦ אני מירב — חברה דיגיטלית באתר הזה.\nאני כאן בשבילך תמיד. תוכל/י לשאול אותי הכל בעברית: על תפילה, על מקום קדוש, על משפחה, או פשוט לדבר.`;
      addBotMsg(opener);
    }, 200);

    // Close button
    panel.querySelector('.kz-aic-close').addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation(); closePanel();
    });

    // Quick chips
    panel.querySelector('#kzAicQuick').addEventListener('click', (e) => {
      const chip = e.target.closest('.kz-aic-chip');
      if (chip) sendUserMsg(chip.dataset.q);
    });

    // Input
    const input = panel.querySelector('#kzAicInput');
    const send = panel.querySelector('#kzAicSend');
    const handleSend = () => {
      const v = input.value.trim();
      if (!v) return;
      sendUserMsg(v);
      input.value = '';
    };
    send.addEventListener('click', handleSend);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  function togglePanel(){
    let panel = document.querySelector('.kz-aic-panel');
    let fab = document.querySelector('.kz-aic-fab');
    // Self-heal: if not built (or removed somehow), build now
    if (!panel || !fab){
      buildUI();
      panel = document.querySelector('.kz-aic-panel');
      fab = document.querySelector('.kz-aic-fab');
      if (!panel || !fab) return;
    }
    const isOpen = panel.classList.toggle('is-open');
    fab.classList.toggle('is-open', isOpen);
    if (isOpen){
      setTimeout(() => {
        const input = panel.querySelector('.kz-aic-input');
        if (input) input.focus();
      }, 250);
    }
  }
  function openPanel(){
    let panel = document.querySelector('.kz-aic-panel');
    if (!panel){ buildUI(); panel = document.querySelector('.kz-aic-panel'); }
    if (!panel) return;
    if (panel.classList.contains('is-open')) return;
    togglePanel();
  }
  function closePanel(){
    const panel = document.querySelector('.kz-aic-panel');
    const fab = document.querySelector('.kz-aic-fab');
    if (panel) panel.classList.remove('is-open');
    if (fab) fab.classList.remove('is-open');
  }

  function addBotMsg(text){
    const msgs = document.getElementById('kzAicMsgs');
    if (!msgs) return;
    const el = document.createElement('div');
    el.className = 'kz-aic-msg bot';
    el.innerHTML = `<span class="kz-aic-msg-bot-avatar">✦</span> ${escapeHtml(text).replace(/\n/g, '<br>')}`;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUserMsg(text){
    const msgs = document.getElementById('kzAicMsgs');
    if (!msgs) return;
    const el = document.createElement('div');
    el.className = 'kz-aic-msg user';
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping(){
    const msgs = document.getElementById('kzAicMsgs');
    if (!msgs) return;
    const t = document.createElement('div');
    t.className = 'kz-aic-typing';
    t.id = 'kzAicTyping';
    t.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function hideTyping(){
    const t = document.getElementById('kzAicTyping');
    if (t) t.remove();
  }

  function sendUserMsg(text){
    addUserMsg(text);
    showTyping();
    // Simulate thinking time (real API would replace this)
    setTimeout(() => {
      hideTyping();
      const reply = findReply(text) || defaultReply();
      addBotMsg(reply);
    }, 600 + Math.random() * 600);
  }

  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  /* ─── Init ──────────────────────────────────────── */
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', buildUI, { once: true });
  } else {
    buildUI();
  }

  /* ─── BULLETPROOF global functions ───────────────── */
  window.kzMiravToggle = function(e){
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    togglePanel();
    return false;
  };
  window.kzMiravOpen = openPanel;
  window.kzMiravClose = closePanel;

  /* ─── Public API for upgrading to real AI later ───── */
  window.KZ_AI_CHAT = {
    open: openPanel,
    toggle: togglePanel,
    close: closePanel,
    addBotMsg,
    addUserMsg,
    // Override this to plug in OpenAI/Claude:
    // window.KZ_AI_CHAT.respondCustom = async (text) => { return await callOpenAI(text); }
    respondCustom: null
  };

  /* ─── Self-heal: rebuild if removed; also event delegation as backup ───── */
  document.addEventListener('click', (e) => {
    const fab = e.target.closest('.kz-aic-fab');
    if (fab && !fab._kzBound){
      togglePanel();
    }
  }, true);

  // If page was loaded but DOMContentLoaded didn't trigger init, ensure build
  setTimeout(() => {
    if (!document.querySelector('.kz-aic-fab')) buildUI();
  }, 1500);
})();
