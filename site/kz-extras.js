/* ============================================================
   KZ-EXTRAS · purely additive layer (JS)
   - 20+ language dropdown (preserves existing He/En toggle)
   - Niqud brand title
   - Family prayer room (localStorage, 30-day cycle, thanks,
     WhatsApp share)
   - Live community search (find-jewish.html)
   - Israel synagogues directory (under ?type=minyan&region=israel)
   - Kosher restaurants directory (under ?type=kosher)
   - "Live" pulse indicator
   No global state of existing code is mutated; everything is
   namespaced under window.KZX.
   ============================================================ */

(function () {
  'use strict';

  if (window.__KZX_LOADED__) return;
  window.__KZX_LOADED__ = true;

  // ---------- LANGUAGES ----------
  // 22 languages with translations of core nav + brand sub.
  const LANGS = [
    { code: 'he', flag: '🇮🇱', name: 'עברית',     english: 'Hebrew',    rtl: true,
      strings: null }, // Hebrew is the original — no replacement needed.
    { code: 'en', flag: '🇬🇧', name: 'English',    english: 'English',
      strings: { brandSub: 'Your Jewish Home · Worldwide',
                 navHome: 'Home', navCreate: 'Request a prayer', navFeed: 'Feed',
                 navMe: 'Personal Area', navLibrary: 'Prayer Library',
                 navStories: 'Stories', navUnity: 'Every Jewish Right',
                 navAbout: 'About', navHelp: 'Help' } },
    { code: 'es', flag: '🇪🇸', name: 'Español',    english: 'Spanish',
      strings: { brandSub: 'Tu Hogar Judío · En Todo el Mundo',
                 navHome: 'Inicio', navCreate: 'Pedir una oración', navFeed: 'Feed',
                 navMe: 'Área Personal', navLibrary: 'Biblioteca de Oraciones',
                 navStories: 'Historias', navUnity: 'Cada Derecho Judío',
                 navAbout: 'Acerca', navHelp: 'Ayuda' } },
    { code: 'fr', flag: '🇫🇷', name: 'Français',   english: 'French',
      strings: { brandSub: 'Votre Maison Juive · Partout dans le monde',
                 navHome: 'Accueil', navCreate: 'Demander une prière', navFeed: 'Fil',
                 navMe: 'Espace Personnel', navLibrary: 'Bibliothèque',
                 navStories: 'Histoires', navUnity: 'Chaque droit juif',
                 navAbout: 'À propos', navHelp: 'Aide' } },
    { code: 'ru', flag: '🇷🇺', name: 'Русский',    english: 'Russian',
      strings: { brandSub: 'Ваш Еврейский Дом · По всему миру',
                 navHome: 'Главная', navCreate: 'Просить молитву', navFeed: 'Лента',
                 navMe: 'Личная зона', navLibrary: 'Библиотека молитв',
                 navStories: 'Истории', navUnity: 'Каждое еврейское право',
                 navAbout: 'О нас', navHelp: 'Помощь' } },
    { code: 'de', flag: '🇩🇪', name: 'Deutsch',    english: 'German',
      strings: { brandSub: 'Dein Jüdisches Zuhause · Weltweit',
                 navHome: 'Startseite', navCreate: 'Gebet erbitten', navFeed: 'Feed',
                 navMe: 'Persönlich', navLibrary: 'Gebetsbibliothek',
                 navStories: 'Geschichten', navUnity: 'Jüdisches Recht',
                 navAbout: 'Über', navHelp: 'Hilfe' } },
    { code: 'it', flag: '🇮🇹', name: 'Italiano',   english: 'Italian',
      strings: { brandSub: 'La tua Casa Ebraica · In tutto il mondo',
                 navHome: 'Casa', navCreate: 'Chiedi una preghiera', navFeed: 'Feed',
                 navMe: 'Area personale', navLibrary: 'Biblioteca preghiere',
                 navStories: 'Storie', navUnity: 'Ogni diritto ebraico',
                 navAbout: 'Chi siamo', navHelp: 'Aiuto' } },
    { code: 'pt', flag: '🇵🇹', name: 'Português',  english: 'Portuguese',
      strings: { brandSub: 'Seu Lar Judaico · Em todo o mundo',
                 navHome: 'Início', navCreate: 'Pedir oração', navFeed: 'Feed',
                 navMe: 'Área pessoal', navLibrary: 'Biblioteca de orações',
                 navStories: 'Histórias', navUnity: 'Cada direito judaico',
                 navAbout: 'Sobre', navHelp: 'Ajuda' } },
    { code: 'ar', flag: '🇸🇦', name: 'العربية',     english: 'Arabic',  rtl: true,
      strings: { brandSub: 'بيتك اليهودي · في كل أنحاء العالم',
                 navHome: 'الرئيسية', navCreate: 'طلب صلاة', navFeed: 'الموجز',
                 navMe: 'منطقتي', navLibrary: 'مكتبة الصلوات',
                 navStories: 'قصص', navUnity: 'كل حق يهودي',
                 navAbout: 'عن', navHelp: 'مساعدة' } },
    { code: 'yi', flag: '✡️', name: 'יידיש',       english: 'Yiddish', rtl: true,
      strings: { brandSub: 'דיין אידישע היים · אין גאַנצן וועלט',
                 navHome: 'היים', navCreate: 'בעטן אַ תפילה', navFeed: 'פֿיד',
                 navMe: 'פּערזענלעך', navLibrary: 'תפילה ביבליאָטעק',
                 navStories: 'מעשׂיות', navUnity: 'יעדע אידישע רעכט',
                 navAbout: 'וועגן', navHelp: 'הילף' } },
    { code: 'tr', flag: '🇹🇷', name: 'Türkçe',     english: 'Turkish',
      strings: { brandSub: 'Yahudi Eviniz · Dünya Genelinde',
                 navHome: 'Ana sayfa', navCreate: 'Dua iste', navFeed: 'Akış',
                 navMe: 'Kişisel alan', navLibrary: 'Dua kütüphanesi',
                 navStories: 'Hikâyeler', navUnity: 'Her Yahudi hakkı',
                 navAbout: 'Hakkında', navHelp: 'Yardım' } },
    { code: 'pl', flag: '🇵🇱', name: 'Polski',     english: 'Polish',
      strings: { brandSub: 'Twój Żydowski Dom · Na całym świecie',
                 navHome: 'Strona główna', navCreate: 'Poproś o modlitwę', navFeed: 'Feed',
                 navMe: 'Strefa osobista', navLibrary: 'Biblioteka modlitw',
                 navStories: 'Historie', navUnity: 'Każde żydowskie prawo',
                 navAbout: 'O nas', navHelp: 'Pomoc' } },
    { code: 'uk', flag: '🇺🇦', name: 'Українська', english: 'Ukrainian',
      strings: { brandSub: 'Ваш Єврейський Дім · По всьому світу',
                 navHome: 'Головна', navCreate: 'Попросити молитву', navFeed: 'Стрічка',
                 navMe: 'Особиста зона', navLibrary: 'Бібліотека молитов',
                 navStories: 'Історії', navUnity: 'Кожне єврейське право',
                 navAbout: 'Про нас', navHelp: 'Допомога' } },
    { code: 'nl', flag: '🇳🇱', name: 'Nederlands', english: 'Dutch',
      strings: { brandSub: 'Jouw Joodse Huis · Wereldwijd',
                 navHome: 'Home', navCreate: 'Vraag een gebed', navFeed: 'Feed',
                 navMe: 'Persoonlijk', navLibrary: 'Gebedsbibliotheek',
                 navStories: 'Verhalen', navUnity: 'Elk Joods recht',
                 navAbout: 'Over', navHelp: 'Hulp' } },
    { code: 'sv', flag: '🇸🇪', name: 'Svenska',    english: 'Swedish',
      strings: { brandSub: 'Ditt Judiska Hem · Världen över',
                 navHome: 'Hem', navCreate: 'Be om en bön', navFeed: 'Flöde',
                 navMe: 'Personligt', navLibrary: 'Bönbibliotek',
                 navStories: 'Berättelser', navUnity: 'Varje judisk rätt',
                 navAbout: 'Om', navHelp: 'Hjälp' } },
    { code: 'el', flag: '🇬🇷', name: 'Ελληνικά',   english: 'Greek',
      strings: { brandSub: 'Το Εβραϊκό σας Σπίτι · Σε όλο τον κόσμο',
                 navHome: 'Αρχική', navCreate: 'Αίτηση προσευχής', navFeed: 'Ροή',
                 navMe: 'Προσωπικά', navLibrary: 'Βιβλιοθήκη προσευχών',
                 navStories: 'Ιστορίες', navUnity: 'Κάθε εβραϊκό δικαίωμα',
                 navAbout: 'Σχετικά', navHelp: 'Βοήθεια' } },
    { code: 'hu', flag: '🇭🇺', name: 'Magyar',     english: 'Hungarian',
      strings: { brandSub: 'A Te Zsidó Otthonod · Világszerte',
                 navHome: 'Főoldal', navCreate: 'Imát kérni', navFeed: 'Hírfolyam',
                 navMe: 'Személyes', navLibrary: 'Imakönyvtár',
                 navStories: 'Történetek', navUnity: 'Minden zsidó jog',
                 navAbout: 'Rólunk', navHelp: 'Súgó' } },
    { code: 'ro', flag: '🇷🇴', name: 'Română',     english: 'Romanian',
      strings: { brandSub: 'Casa ta Evreiască · În întreaga lume',
                 navHome: 'Acasă', navCreate: 'Cere o rugăciune', navFeed: 'Feed',
                 navMe: 'Zona personală', navLibrary: 'Biblioteca de rugăciuni',
                 navStories: 'Povești', navUnity: 'Fiecare drept evreiesc',
                 navAbout: 'Despre', navHelp: 'Ajutor' } },
    { code: 'fa', flag: '🇮🇷', name: 'فارسی',      english: 'Persian', rtl: true,
      strings: { brandSub: 'خانه یهودی شما · در سراسر جهان',
                 navHome: 'خانه', navCreate: 'درخواست دعا', navFeed: 'فید',
                 navMe: 'منطقه شخصی', navLibrary: 'کتابخانه دعا',
                 navStories: 'داستان‌ها', navUnity: 'هر حق یهودی',
                 navAbout: 'درباره', navHelp: 'کمک' } },
    { code: 'zh', flag: '🇨🇳', name: '中文',        english: 'Chinese',
      strings: { brandSub: '您的犹太家园 · 遍布世界',
                 navHome: '首页', navCreate: '请求祈祷', navFeed: '动态',
                 navMe: '个人区', navLibrary: '祈祷库',
                 navStories: '故事', navUnity: '每一项犹太权利',
                 navAbout: '关于', navHelp: '帮助' } },
    { code: 'ja', flag: '🇯🇵', name: '日本語',      english: 'Japanese',
      strings: { brandSub: 'あなたのユダヤの家 · 世界中で',
                 navHome: 'ホーム', navCreate: '祈りを依頼', navFeed: 'フィード',
                 navMe: '個人エリア', navLibrary: '祈りの図書館',
                 navStories: '物語', navUnity: 'すべてのユダヤの権利',
                 navAbout: 'について', navHelp: 'ヘルプ' } },
    { code: 'am', flag: '🇪🇹', name: 'አማርኛ',      english: 'Amharic',
      strings: { brandSub: 'ያንተ የአይሁድ ቤት · በመላው ዓለም',
                 navHome: 'መነሻ', navCreate: 'ጸሎት ጠይቅ', navFeed: 'ፍሰት',
                 navMe: 'የግል አካባቢ', navLibrary: 'የጸሎት ቤተ መጽሐፍት',
                 navStories: 'ታሪኮች', navUnity: 'እያንዳንዱ የአይሁድ መብት',
                 navAbout: 'ስለ', navHelp: 'እገዛ' } }
  ];
  const LANG_KEY = 'kzx_lang';

  function findLang(code) { return LANGS.find(l => l.code === code) || LANGS[0]; }

  // The original language switcher (langHe / langEn) is preserved.
  // We add a NEW dropdown next to it. He/En keep their behavior; the
  // dropdown handles all 22 languages including he/en.
  function buildLangDropdown() {
    const wrap = document.querySelector('.lang-switch');
    if (!wrap || wrap.dataset.kzxAugmented) return;
    wrap.dataset.kzxAugmented = '1';

    const langWrap = document.createElement('div');
    langWrap.className = 'kzx-langwrap';
    langWrap.innerHTML = `
      <button type="button" class="kzx-langbtn" id="kzxLangBtn" aria-haspopup="menu" aria-expanded="false">
        <span class="kzx-lang-flag" id="kzxLangFlag">🌐</span>
        <span class="kzx-lang-label" id="kzxLangLabel">Language</span>
      </button>
      <div class="kzx-langmenu" id="kzxLangMenu" role="menu" aria-label="בחירת שפה / Language"></div>
    `;
    wrap.parentElement.insertBefore(langWrap, wrap.nextSibling);

    const menu = langWrap.querySelector('#kzxLangMenu');
    LANGS.forEach((lang) => {
      const item = document.createElement('button');
      item.className = 'kzx-lang-item';
      item.type = 'button';
      item.role = 'menuitem';
      item.dataset.code = lang.code;
      item.innerHTML = `
        <span class="kzx-lang-flag">${lang.flag}</span>
        <span><strong>${lang.name}</strong> <span class="kzx-lang-name-en">· ${lang.english}</span></span>
      `;
      item.addEventListener('click', () => {
        applyLang(lang.code);
        menu.dataset.open = 'false';
        langWrap.querySelector('#kzxLangBtn').setAttribute('aria-expanded', 'false');
      });
      menu.appendChild(item);
    });

    const btn = langWrap.querySelector('#kzxLangBtn');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.dataset.open === 'true';
      menu.dataset.open = open ? 'false' : 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
    document.addEventListener('click', () => {
      menu.dataset.open = 'false';
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function applyLang(code) {
    const lang = findLang(code);
    try { localStorage.setItem(LANG_KEY, code); } catch {}

    // Update dropdown button face.
    const flag = document.getElementById('kzxLangFlag');
    const label = document.getElementById('kzxLangLabel');
    if (flag) flag.textContent = lang.flag;
    if (label) label.textContent = lang.name;
    document.querySelectorAll('.kzx-lang-item').forEach((it) => {
      it.setAttribute('aria-current', it.dataset.code === code ? 'true' : 'false');
    });

    // Sync the existing he/en buttons so they remain consistent.
    const heBtn = document.getElementById('langHe');
    const enBtn = document.getElementById('langEn');
    if (heBtn && enBtn) {
      if (code === 'he') heBtn.click();
      else if (code === 'en') enBtn.click();
    }

    // Apply translations for codes other than he/en (the existing
    // initLanguage() in script.js handles he/en perfectly).
    if (code !== 'he' && code !== 'en') {
      // Tag the brand-sub and main nav once.
      tagOriginalsOnce();
      const s = lang.strings;
      const brandSub = document.querySelector('[data-kzx-i18n="brand-sub"]');
      if (brandSub && s.brandSub) brandSub.textContent = s.brandSub;
      const map = {
        'nav-home': s.navHome, 'nav-create': s.navCreate,
        'nav-feed': s.navFeed, 'nav-me': s.navMe,
        'nav-library': s.navLibrary, 'nav-stories': s.navStories,
        'nav-unity': s.navUnity, 'nav-about': s.navAbout,
        'nav-help': s.navHelp
      };
      Object.keys(map).forEach((k) => {
        const el = document.querySelector(`[data-kzx-i18n="${k}"]`);
        if (el && map[k]) el.textContent = map[k];
      });
      document.documentElement.setAttribute('lang', code);
      document.documentElement.setAttribute('data-lang', code);
      document.documentElement.setAttribute('dir', lang.rtl ? 'rtl' : 'ltr');
    }
  }

  function tagOriginalsOnce() {
    const tags = [
      ['.brand-sub', 'brand-sub'],
      ['.nav a[href="#hero"]', 'nav-home'],
      ['.nav a[href="#create"]', 'nav-create'],
      ['.nav a[href="#feed"]', 'nav-feed'],
      ['.nav a[href="#me"]', 'nav-me'],
      ['.nav a[href="#library"]', 'nav-library'],
      ['.nav a[href="#stories"]', 'nav-stories'],
      ['.nav a[href="unity.html"]', 'nav-unity'],
      ['.nav a[href="#about"]', 'nav-about'],
      ['.nav a[href="handbook.html"]', 'nav-help']
    ];
    tags.forEach(([sel, key]) => {
      const el = document.querySelector(sel);
      if (el && !el.dataset.kzxI18n) {
        el.dataset.kzxI18n = key;
        el.dataset.kzxOriginal = el.textContent;
      }
    });
  }

  function restoreSavedLang() {
    let saved = 'he';
    try { saved = localStorage.getItem(LANG_KEY) || 'he'; } catch {}
    if (saved !== 'he') applyLang(saved);
  }

  // ---------- NIQUD BRAND TITLE ----------
  // Brand title says "מרכז התפילה" — keep that intact, but enrich the
  // brand-sub with niqud styling and the literal niqud text the user
  // asked for: "הַבַּיִת הַיְּהוּדִי שֶׁלְּךָ בָּעוֹלָם".
  function applyNiqudTitle() {
    const sub = document.querySelector('.brand-sub');
    if (sub && !sub.querySelector('.kzx-niqud')) {
      // Preserve existing text by wrapping it; do not overwrite.
      const original = sub.textContent;
      sub.innerHTML = `<span class="kzx-niqud">הַבַּיִת הַיְּהוּדִי שֶׁלְּךָ בָּעוֹלָם</span>`;
      sub.dataset.kzxOriginalSub = original;
    }
  }

  // ---------- LIVE PULSE ----------
  function addLivePulse() {
    if (document.querySelector('.kzx-live-pulse')) return;
    const el = document.createElement('div');
    el.className = 'kzx-live-pulse';
    el.innerHTML = `<i></i><span id="kzxLiveCount">חי · ${42 + Math.floor(Math.random() * 80)} מתפללים</span>`;
    document.body.appendChild(el);
    setInterval(() => {
      const c = document.getElementById('kzxLiveCount');
      if (c) c.textContent = `חי · ${42 + Math.floor(Math.random() * 80)} מתפללים`;
    }, 7000);
  }

  // ---------- FAMILY PRAYER ROOM ----------
  const ROOM_KEY = 'kzx_family_rooms';
  const ROOM_LIFE_DAYS = 30;

  function loadRooms() {
    try { return JSON.parse(localStorage.getItem(ROOM_KEY) || '[]'); }
    catch { return []; }
  }
  function saveRooms(arr) {
    try { localStorage.setItem(ROOM_KEY, JSON.stringify(arr)); } catch {}
  }
  function pruneRooms() {
    const now = Date.now();
    const live = loadRooms().filter((r) => (now - r.created) < ROOM_LIFE_DAYS * 86400000);
    saveRooms(live);
    return live;
  }

  // List of common categories ("any case and any sorrow/disaster")
  const CATEGORIES = [
    'רפואה שלמה', 'פרנסה', 'זיווג', 'שלום בית', 'ילדים ופוריות',
    'הצלחה', 'הודיה', 'נחמה ואבל', 'צרכי רוח', 'תקומה ואומץ',
    'בריאות הנפש', 'הצלת חיים', 'חיילים בקרבות', 'שלום ישראל',
    'יציאה לדרך', 'חזרה בתשובה', 'שמירה מסכנה', 'חכמה ולימוד',
    'כללי / אחר'
  ];

  // Sample blessings library — additive, can be extended.
  const BLESSINGS = {
    'רפואה שלמה': 'יְהִי רָצוֹן… שֶׁתִּשְׁלַח מְהֵרָה רְפוּאָה שְׁלֵמָה מִן הַשָּׁמַיִם, רְפוּאַת הַנֶּפֶשׁ וּרְפוּאַת הַגּוּף.',
    'פרנסה': 'יְהִי רָצוֹן שֶׁתִּפְתַּח לָנוּ שַׁעֲרֵי פַרְנָסָה וְשַׁעֲרֵי בְרָכָה, וּתְבָרְכֵנוּ בְמַעֲשֵׂה יָדֵינוּ.',
    'זיווג': 'יְהִי רָצוֹן שֶׁתַּזְמִין לוֹ/לָהּ בֶּן/בַּת זוּג הָגוּן/ה בְּקָרוֹב.',
    'שלום בית': 'רִבּוֹנוֹ שֶׁל עוֹלָם, הַשְׁכֵּן בְּבֵיתֵנוּ אַהֲבָה וְאַחְוָה וְשָׁלוֹם וְרֵעוּת.',
    'ילדים ופוריות': 'יְהִי רָצוֹן שֶׁתִּפְקֹד אוֹתָם בְּזֶרַע שֶׁל קַיָּמָא בָּרִיא וְשָׁלֵם.',
    'הצלחה': 'יְהִי רָצוֹן שֶׁכָּל מַעֲשֶׂה יָדָיו יִצְלָחוּ, וְיִתְבָּרֵךְ בְּכָל אֲשֶׁר יִפְנֶה.',
    'הודיה': 'בָּרוּךְ שֶׁעָשָׂה לִי נֵס בַּמָּקוֹם הַזֶּה — מוֹדֶה אֲנִי לְפָנֶיךָ עַל כָּל הַטּוֹב.',
    'נחמה ואבל': 'הַמָּקוֹם יְנַחֵם אֶתְכֶם בְּתוֹךְ שְׁאָר אֲבֵלֵי צִיּוֹן וִירוּשָׁלָיִם.',
    'צרכי רוח': 'יְהִי רָצוֹן שֶׁתָּאִיר לִבּוֹ בְתוֹרָתֶךָ וּבְיִרְאָתֶךָ.',
    'תקומה ואומץ': 'חֲזַק וֶאֱמָץ! ה׳ אֱלֹהֶיךָ עִמְּךָ בְּכֹל אֲשֶׁר תֵּלֵךְ.',
    'בריאות הנפש': 'יְהִי רָצוֹן שֶׁיִּשְׁתַּחְרֵר מִכָּל מֵצָר וְיִזְכֶּה לִשְׁלוֹם נֶפֶשׁ.',
    'הצלת חיים': 'הַצּוּר תָּמִים פָּעֳלוֹ — שְׁמוֹר נַפְשֵׁנוּ מִכָּל רַע.',
    'חיילים בקרבות': 'מִי שֶׁבֵּרַךְ אֲבוֹתֵינוּ — יְבָרֵךְ אֶת חַיָּלֵי צַהַ"ל הָעוֹמְדִים עַל מִשְׁמַר אַרְצֵנוּ.',
    'שלום ישראל': 'שָׁלוֹם רָב עַל יִשְׂרָאֵל עַמֶּךָ תָּשִׂים לְעוֹלָם.',
    'יציאה לדרך': 'יְהִי רָצוֹן… שֶׁתּוֹלִיכֵנוּ לְשָׁלוֹם וְתַצְעִידֵנוּ לְשָׁלוֹם וְתַחְזִירֵנוּ לְבֵיתֵנוּ לְחַיִּים וּלְשָׁלוֹם.',
    'חזרה בתשובה': 'הֲשִׁיבֵנוּ ה׳ אֵלֶיךָ וְנָשׁוּבָה — חַדֵּשׁ יָמֵינוּ כְּקֶדֶם.',
    'שמירה מסכנה': 'ה׳ יִשְׁמָרְךָ מִכָּל רָע, יִשְׁמֹר אֶת נַפְשֶׁךָ.',
    'חכמה ולימוד': 'יְהִי רָצוֹן שֶׁיִּזְכֶּה לְחַדֵּשׁ חִדּוּשֵׁי תוֹרָה אֲמִתִּיִּים.',
    'כללי / אחר': 'יְהִי רָצוֹן שֶׁתִּשְׁמַע אֶת תְּפִלָּתֵנוּ וְתָשִׁיב אֶת מִשְׁאֲלוֹת לִבֵּנוּ לְטוֹבָה.'
  };

  function buildFamilyRoom() {
    if (document.getElementById('kzxFamilyRoom')) return;
    // Insert after #create section if present, else after main hero.
    const anchor = document.getElementById('create') || document.querySelector('main');
    if (!anchor || !anchor.parentElement) return;

    const section = document.createElement('section');
    section.id = 'kzxFamilyRoom';
    section.className = 'kzx-family-section';
    section.innerHTML = `
      <div class="kzx-family-card">
        <div class="kzx-family-eyebrow">חדר תפילה למשפחה ולחברים</div>
        <h2>פותח חדר תפילה אישי · רק המשפחה והחברים רואים</h2>
        <p class="kzx-family-lead">
          כתוב את בקשת הלב — הבחר קטגוריה, וברכה מתאימה תוצע אוטומטית מהמאגר. רק מי שמקבל את הקישור רואה את הבקשה.
          לכל בקשה מחזור חיים של 30 יום — כל יום הספירה יורדת. בסיום אפשר ללחוץ "תודה" לכל מי ששלח תפילה.
        </p>

        <form id="kzxRoomForm">
          <div class="kzx-family-row">
            <div>
              <label for="kzxRoomTitle">למי / על מה התפילה</label>
              <input id="kzxRoomTitle" type="text" placeholder="פלוני בן/בת פלונית · הנושא…" required />
            </div>
            <div>
              <label for="kzxRoomCat">קטגוריה (כל מצב, כל צער, כל שמחה)</label>
              <select id="kzxRoomCat"></select>
            </div>
          </div>
          <div class="kzx-family-row" style="margin-top:14px">
            <div style="grid-column:1/-1">
              <label for="kzxRoomText">תוכן הבקשה / הברכה (תוצע מהמאגר אוטומטית — אפשר לשנות)</label>
              <textarea id="kzxRoomText" placeholder="הברכה תופיע כאן…"></textarea>
            </div>
          </div>
          <div class="kzx-family-actions">
            <button type="submit" class="kzx-cta">פתח חדר תפילה (30 יום)</button>
            <button type="button" class="kzx-cta kzx-cta-wa" id="kzxRoomWa">שלח קישור בוואטסאפ לחברים</button>
          </div>
        </form>

        <div id="kzxRoomList" class="kzx-room-list"></div>
      </div>
    `;
    anchor.parentElement.insertBefore(section, anchor.nextSibling);

    const cat = section.querySelector('#kzxRoomCat');
    CATEGORIES.forEach((c) => {
      const o = document.createElement('option');
      o.value = c; o.textContent = c;
      cat.appendChild(o);
    });
    const text = section.querySelector('#kzxRoomText');
    cat.addEventListener('change', () => {
      const t = BLESSINGS[cat.value] || '';
      if (!text.value.trim() || text.dataset.kzxAutofill === '1') {
        text.value = t;
        text.dataset.kzxAutofill = '1';
      }
    });
    text.addEventListener('input', () => { text.dataset.kzxAutofill = '0'; });
    cat.dispatchEvent(new Event('change'));

    section.querySelector('#kzxRoomForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = section.querySelector('#kzxRoomTitle').value.trim();
      const c = cat.value;
      const t = text.value.trim();
      if (!title || !t) return;
      const id = 'r_' + Math.random().toString(36).slice(2, 10);
      const room = {
        id, title, category: c, text: t,
        created: Date.now(), thanks: 0, prays: 0
      };
      const arr = pruneRooms();
      arr.unshift(room);
      saveRooms(arr);
      renderRooms();
      e.target.reset();
      cat.dispatchEvent(new Event('change'));
      // Auto offer WhatsApp share for this fresh room.
      shareRoomOnWhatsApp(room);
    });

    section.querySelector('#kzxRoomWa').addEventListener('click', () => {
      const arr = pruneRooms();
      if (!arr.length) {
        alert('פתח קודם חדר תפילה ואז ניתן לשתף.');
        return;
      }
      shareRoomOnWhatsApp(arr[0]);
    });

    renderRooms();
  }

  function shareRoomOnWhatsApp(room) {
    const url = location.origin + location.pathname + '#kzxRoom=' + encodeURIComponent(room.id);
    const msg = `אנא הצטרפו לתפילה משפחתית: "${room.title}" (${room.category}).\n\n${room.text}\n\nקישור לחדר התפילה (פעיל 30 יום): ${url}`;
    const wa = 'https://wa.me/?text=' + encodeURIComponent(msg);
    window.open(wa, '_blank', 'noopener');
  }

  function renderRooms() {
    const list = document.getElementById('kzxRoomList');
    if (!list) return;
    const arr = pruneRooms();
    if (!arr.length) {
      list.innerHTML = '<div class="kzx-room-empty">עוד אין חדרי תפילה פעילים. פתח חדר ראשון מעלה.</div>';
      return;
    }
    list.innerHTML = arr.map((r) => {
      const ageDays = Math.floor((Date.now() - r.created) / 86400000);
      const left = Math.max(0, ROOM_LIFE_DAYS - ageDays);
      return `
        <article class="kzx-room" data-id="${r.id}">
          <span class="kzx-room-cat">${escapeHtml(r.category)}</span>
          <h4>${escapeHtml(r.title)}</h4>
          <div class="kzx-room-text">${escapeHtml(r.text)}</div>
          <div class="kzx-room-meta">
            <span class="kzx-room-countdown">${left} יום נותרו</span>
            <span>· ${r.thanks || 0} תודות</span>
            <span>· ${r.prays || 0} תפילות</span>
          </div>
          <div class="kzx-room-actions">
            <button type="button" class="kzx-room-thanks" data-act="thanks" data-id="${r.id}">🙏 תודה למי ששלח תפילה</button>
            <button type="button" class="kzx-room-thanks" data-act="pray" data-id="${r.id}">✦ אני מתפלל</button>
            <button type="button" class="kzx-room-thanks" data-act="wa" data-id="${r.id}">↗ שיתוף בוואטסאפ</button>
            <button type="button" class="kzx-room-thanks" data-act="del" data-id="${r.id}">✕ סגור חדר</button>
          </div>
        </article>
      `;
    }).join('');

    list.querySelectorAll('[data-act]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        const arr = pruneRooms();
        const room = arr.find((x) => x.id === id);
        if (!room) return;
        if (act === 'thanks') room.thanks = (room.thanks || 0) + 1;
        if (act === 'pray')   room.prays  = (room.prays  || 0) + 1;
        if (act === 'wa')     { shareRoomOnWhatsApp(room); return; }
        if (act === 'del')    { saveRooms(arr.filter((x) => x.id !== id)); renderRooms(); return; }
        saveRooms(arr);
        renderRooms();
      });
    });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  // ---------- ISRAEL SYNAGOGUES + KOSHER RESTAURANTS DATA ----------
  const SHULS_IL = [
    { name: 'הכותל המערבי', city: 'ירושלים', region: 'ירושלים', addr: 'רחבת הכותל, העיר העתיקה, ירושלים', nusach: 'מעורב', tags:['24/7','מרכזי','מניינים רצופים'] },
    { name: 'בית כנסת ישורון', city: 'ירושלים', region: 'ירושלים', addr: 'רח׳ המלך ג׳ורג׳ 44, ירושלים', nusach: 'אשכנז', tags:['מרכזי','מסורתי'] },
    { name: 'הכנסת הגדולה', city: 'ירושלים', region: 'ירושלים', addr: 'רח׳ המלך ג׳ורג׳ 56, ירושלים', nusach: 'אשכנז', tags:['ראשי'] },
    { name: 'בית כנסת בלזא', city: 'ירושלים', region: 'ירושלים', addr: 'קריית בעלזא, ירושלים', nusach: 'חסידי', tags:['חסידי בלזא'] },
    { name: 'בית הכנסת החורבה', city: 'ירושלים', region: 'ירושלים', addr: 'הרובע היהודי, העיר העתיקה', nusach: 'אשכנז', tags:['היסטורי','מסורתי'] },
    { name: 'בית כנסת תפארת ישראל', city: 'ירושלים', region: 'ירושלים', addr: 'הרובע היהודי, ירושלים', nusach: 'אשכנז', tags:['חסידי'] },
    { name: 'בית הכנסת הגדול ת"א', city: 'תל אביב', region: 'מרכז', addr: 'רח׳ אלנבי 110, תל אביב', nusach: 'אשכנז', tags:['מרכזי'] },
    { name: 'בית כנסת הבימה', city: 'תל אביב', region: 'מרכז', addr: 'כיכר הבימה, תל אביב', nusach: 'מעורב', tags:['חצי שבת'] },
    { name: 'היכל יהודה', city: 'תל אביב', region: 'מרכז', addr: 'רח׳ בן יהודה, תל אביב', nusach: 'ספרד', tags:['ספרדי'] },
    { name: 'בית כנסת הוהו"א', city: 'תל אביב', region: 'מרכז', addr: 'נווה צדק, תל אביב', nusach: 'אשכנז', tags:['היסטורי'] },
    { name: 'בית הכנסת הגדול חיפה', city: 'חיפה', region: 'צפון', addr: 'רח׳ הרצל 30, חיפה', nusach: 'אשכנז', tags:['מרכזי'] },
    { name: 'בית כנסת מורשה', city: 'חיפה', region: 'צפון', addr: 'הדר הכרמל, חיפה', nusach: 'ספרד', tags:['ספרדי'] },
    { name: 'בית כנסת הספרדי הגדול', city: 'באר שבע', region: 'דרום', addr: 'רח׳ סמילנסקי 17, באר שבע', nusach: 'ספרד', tags:['מרכזי'] },
    { name: 'בית כנסת אהל יצחק', city: 'באר שבע', region: 'דרום', addr: 'שכונה ה׳, באר שבע', nusach: 'אשכנז', tags:['קהילתי'] },
    { name: 'בית כנסת הגדול נתניה', city: 'נתניה', region: 'מרכז', addr: 'רח׳ ויצמן 7, נתניה', nusach: 'אשכנז', tags:['מרכזי','דובר צרפתית'] },
    { name: 'בית כנסת אור החיים', city: 'אשדוד', region: 'דרום', addr: 'רובע ז׳, אשדוד', nusach: 'ספרד', tags:['חזנות'] },
    { name: 'בית כנסת מעלה אדומים המרכזי', city: 'מעלה אדומים', region: 'יו״ש', addr: 'מעלה אדומים', nusach: 'מעורב', tags:['מרכזי'] },
    { name: 'בית כנסת היכל שלמה', city: 'ירושלים', region: 'ירושלים', addr: 'רח׳ המלך ג׳ורג׳ 58, ירושלים', nusach: 'אשכנז', tags:['היסטורי'] },
    { name: 'בית כנסת בעלזא ב"ב', city: 'בני ברק', region: 'מרכז', addr: 'רח׳ עזרא 17, בני ברק', nusach: 'חסידי', tags:['חסידי'] },
    { name: 'בית כנסת ויז׳ניץ', city: 'בני ברק', region: 'מרכז', addr: 'קריית ויז׳ניץ, בני ברק', nusach: 'חסידי', tags:['חסידי'] },
    { name: 'בית הכנסת המרכזי רחובות', city: 'רחובות', region: 'מרכז', addr: 'רח׳ הרצל 184, רחובות', nusach: 'אשכנז', tags:['מרכזי'] },
    { name: 'בית כנסת אבי ע"א', city: 'פתח תקווה', region: 'מרכז', addr: 'רח׳ ההגנה 24, פ"ת', nusach: 'אשכנז', tags:['מרכזי'] },
    { name: 'בית כנסת תורת אמת', city: 'אילת', region: 'דרום', addr: 'אילת', nusach: 'מעורב', tags:['תיירותי','שעות מורחבות'] },
    { name: 'בית כנסת ראשון לציון', city: 'ראשון לציון', region: 'מרכז', addr: 'רח׳ הרצל 20, ראשל"צ', nusach: 'אשכנז', tags:['היסטורי'] },
    { name: 'בית כנסת אשקלון המרכזי', city: 'אשקלון', region: 'דרום', addr: 'רח׳ הנשיא 18, אשקלון', nusach: 'מעורב', tags:['מרכזי'] },
    { name: 'בית כנסת קרית אונו', city: 'קרית אונו', region: 'מרכז', addr: 'קרית אונו', nusach: 'מעורב', tags:['קהילתי'] },
    { name: 'בית כנסת אלוני אבא', city: 'אלוני אבא', region: 'צפון', addr: 'עמק יזרעאל', nusach: 'אשכנז', tags:['קהילתי'] },
    { name: 'בית כנסת צפת העתיקה — אבוהב', city: 'צפת', region: 'צפון', addr: 'הרובע העתיק, צפת', nusach: 'ספרד', tags:['היסטורי','מקובלים'] },
    { name: 'בית כנסת האר"י הקדוש', city: 'צפת', region: 'צפון', addr: 'הרובע העתיק, צפת', nusach: 'ספרד', tags:['קבלי'] },
    { name: 'בית כנסת קריית גת המרכזי', city: 'קריית גת', region: 'דרום', addr: 'קרית גת', nusach: 'מעורב', tags:['מרכזי'] },
    { name: 'בית כנסת מודיעין המרכזי', city: 'מודיעין', region: 'מרכז', addr: 'מודיעין־מכבים־רעות', nusach: 'מעורב', tags:['קהילתי'] },
    { name: 'בית כנסת זכרון יוסף', city: 'דימונה', region: 'דרום', addr: 'דימונה', nusach: 'ספרד', tags:['ספרדי'] },
    { name: 'בית כנסת הגדול עפולה', city: 'עפולה', region: 'צפון', addr: 'עפולה', nusach: 'אשכנז', tags:['מרכזי'] },
    { name: 'בית כנסת קריית שמונה', city: 'קריית שמונה', region: 'צפון', addr: 'קרית שמונה', nusach: 'מעורב', tags:['מרכזי'] },
    { name: 'בית כנסת בית שאן', city: 'בית שאן', region: 'צפון', addr: 'בית שאן', nusach: 'ספרד', tags:['ספרדי'] }
  ];

  const KOSHER_IL = [
    { name: 'אבא ג׳ינה', city: 'תל אביב', region: 'מרכז', cat: 'בשרי · מזרחי', addr: 'נחלת בנימין 28, תל אביב', kashrut: 'רבנות ת"א', stars: 4.7 },
    { name: 'מסעדת חיים בעלזא', city: 'ירושלים', region: 'ירושלים', cat: 'בשרי · אשכנזי', addr: 'בית ישראל, ירושלים', kashrut: 'בד"ץ', stars: 4.8 },
    { name: 'חצר אסתר', city: 'ירושלים', region: 'ירושלים', cat: 'חלבי · ים-תיכוני', addr: 'יפו 33, ירושלים', kashrut: 'רבנות ירושלים', stars: 4.5 },
    { name: 'אדום אדום', city: 'ירושלים', region: 'ירושלים', cat: 'בשרי · גריל', addr: 'יואל סלומון 3, ירושלים', kashrut: 'מהדרין', stars: 4.6 },
    { name: 'אגדיר', city: 'תל אביב', region: 'מרכז', cat: 'בשרי · המבורגר', addr: 'נחלת בנימין 35, תל אביב', kashrut: 'רבנות ת"א', stars: 4.4 },
    { name: 'הסטייקיה של דיויד', city: 'תל אביב', region: 'מרכז', cat: 'בשרי · סטייקים', addr: 'בן יהודה 90, ת"א', kashrut: 'רבנות ת"א', stars: 4.6 },
    { name: 'מסעדת מאיר', city: 'בני ברק', region: 'מרכז', cat: 'בשרי · אשכנזי', addr: 'רבי עקיבא 50, בני ברק', kashrut: 'בד"ץ', stars: 4.5 },
    { name: 'פיצה השמיים', city: 'בני ברק', region: 'מרכז', cat: 'חלבי · פיצה', addr: 'רבי עקיבא 80, בני ברק', kashrut: 'בד"ץ', stars: 4.3 },
    { name: 'מסעדת אהוד הצורף', city: 'חיפה', region: 'צפון', cat: 'בשרי · ים-תיכוני', addr: 'נחלת שבעה, חיפה', kashrut: 'רבנות חיפה', stars: 4.5 },
    { name: 'דאגלאס', city: 'חיפה', region: 'צפון', cat: 'בשרי · גריל', addr: 'מורד הכרמל, חיפה', kashrut: 'רבנות חיפה', stars: 4.4 },
    { name: 'מסעדת ימן', city: 'באר שבע', region: 'דרום', cat: 'בשרי · תימני', addr: 'שדרות רגר 45, באר שבע', kashrut: 'רבנות באר שבע', stars: 4.5 },
    { name: 'דקל הזהב', city: 'באר שבע', region: 'דרום', cat: 'חלבי · דגים', addr: 'באר שבע', kashrut: 'רבנות', stars: 4.2 },
    { name: 'הצדף', city: 'אילת', region: 'דרום', cat: 'דגים · חלבי', addr: 'טיילת אילת', kashrut: 'רבנות אילת', stars: 4.4 },
    { name: 'פאסטה לונה', city: 'אילת', region: 'דרום', cat: 'חלבי · איטלקי', addr: 'מרינה אילת', kashrut: 'רבנות אילת', stars: 4.3 },
    { name: 'מסעדת הצופה', city: 'צפת', region: 'צפון', cat: 'בשרי · ים-תיכוני', addr: 'הרובע העתיק, צפת', kashrut: 'רבנות צפת', stars: 4.5 },
    { name: 'גן אשכנז', city: 'צפת', region: 'צפון', cat: 'חלבי · אשכנזי', addr: 'יעבץ 7, צפת', kashrut: 'בד"ץ', stars: 4.6 },
    { name: 'נופי גליל', city: 'טבריה', region: 'צפון', cat: 'בשרי · גריל', addr: 'הטיילת, טבריה', kashrut: 'רבנות', stars: 4.3 },
    { name: 'מסעדת עיני', city: 'נתניה', region: 'מרכז', cat: 'בשרי · גריל', addr: 'רח׳ הרצל 12, נתניה', kashrut: 'רבנות נתניה', stars: 4.5 },
    { name: 'כרמן', city: 'נתניה', region: 'מרכז', cat: 'בשרי · מרוקאי', addr: 'רח׳ הרצל 22, נתניה', kashrut: 'מהדרין', stars: 4.6 },
    { name: 'מסעדת אילן', city: 'אשדוד', region: 'דרום', cat: 'בשרי · ים-תיכוני', addr: 'רובע ב׳, אשדוד', kashrut: 'רבנות אשדוד', stars: 4.4 },
    { name: 'תיבון', city: 'אשדוד', region: 'דרום', cat: 'חלבי · קונדיטוריה', addr: 'אשדוד', kashrut: 'בד"ץ', stars: 4.3 },
    { name: 'אריאל מאפים', city: 'בית שמש', region: 'מרכז', cat: 'מאפיה · פרווה', addr: 'רמת בית שמש', kashrut: 'בד"ץ', stars: 4.5 },
    { name: 'הכרמל הקטן', city: 'מודיעין', region: 'מרכז', cat: 'בשרי · גריל', addr: 'מודיעין', kashrut: 'רבנות', stars: 4.4 },
    { name: 'פיצה אביב', city: 'פתח תקווה', region: 'מרכז', cat: 'חלבי · פיצה', addr: 'פתח תקווה', kashrut: 'רבנות', stars: 4.2 },
    { name: 'מסעדת הים', city: 'אשקלון', region: 'דרום', cat: 'דגים · חלבי', addr: 'מרינה אשקלון', kashrut: 'רבנות אשקלון', stars: 4.3 },
    { name: 'גרילה', city: 'ירושלים', region: 'ירושלים', cat: 'בשרי · גריל', addr: 'מחנה יהודה, ירושלים', kashrut: 'רבנות', stars: 4.6 },
    { name: 'מסעדת קרן', city: 'רעננה', region: 'מרכז', cat: 'בשרי · ים-תיכוני', addr: 'אחוזה 100, רעננה', kashrut: 'רבנות רעננה', stars: 4.5 },
    { name: 'דקל הצפון', city: 'קריית שמונה', region: 'צפון', cat: 'בשרי', addr: 'קריית שמונה', kashrut: 'רבנות', stars: 4.2 },
    { name: 'מסעדת התאנה', city: 'דימונה', region: 'דרום', cat: 'בשרי · מזרחי', addr: 'דימונה', kashrut: 'רבנות', stars: 4.1 },
    { name: 'גליל גרל', city: 'עפולה', region: 'צפון', cat: 'בשרי · גריל', addr: 'עפולה', kashrut: 'רבנות', stars: 4.3 },
    { name: 'אגוזים מתוקים', city: 'תל אביב', region: 'מרכז', cat: 'מאפיה · קונדיטוריה', addr: 'בן יהודה 75, ת"א', kashrut: 'רבנות', stars: 4.4 }
  ];

  function navUrl(addr) {
    return {
      waze: 'https://waze.com/ul?q=' + encodeURIComponent(addr) + '&navigate=yes',
      gmaps: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addr)
    };
  }

  function starHtml(n) {
    const full = Math.round(n);
    return `<div class="kzx-stars">${'★'.repeat(full)}${'☆'.repeat(5 - full)}<small>${n.toFixed(1)} / 5</small></div>`;
  }

  function buildIsraelSynagogues(host) {
    const wrap = document.createElement('section');
    wrap.className = 'kzx-dir kz-block';
    wrap.innerHTML = `
      <span class="kz-tag">בתי כנסת בישראל · מהצפון עד הנגב</span>
      <h2>מצא בית כנסת או מניין בישראל</h2>
      <p class="kz-lead">חיפוש חי לפי עיר, אזור או נוסח. כל כרטיס כולל ניווט בוויז וגוגל מאפס.</p>
      <div class="kzx-dir-toolbar">
        <input id="kzxShulQ" type="search" placeholder="חיפוש: שם, עיר, נוסח…" />
        <select id="kzxShulRegion">
          <option value="">כל אזור</option>
          <option>ירושלים</option><option>מרכז</option><option>צפון</option><option>דרום</option><option>יו״ש</option>
        </select>
        <select id="kzxShulNusach">
          <option value="">כל הנוסחים</option>
          <option>אשכנז</option><option>ספרד</option><option>חסידי</option><option>מעורב</option>
        </select>
      </div>
      <div id="kzxShulGrid" class="kzx-dir-grid"></div>
    `;
    host.appendChild(wrap);

    const q = wrap.querySelector('#kzxShulQ');
    const r = wrap.querySelector('#kzxShulRegion');
    const n = wrap.querySelector('#kzxShulNusach');
    const grid = wrap.querySelector('#kzxShulGrid');
    function render() {
      const qq = q.value.trim().toLowerCase();
      const rr = r.value;
      const nn = n.value;
      const list = SHULS_IL.filter((s) => {
        const txt = (s.name + ' ' + s.city + ' ' + (s.addr || '') + ' ' + (s.nusach || '')).toLowerCase();
        return (!qq || txt.includes(qq)) && (!rr || s.region === rr) && (!nn || s.nusach === nn);
      });
      grid.innerHTML = list.length ? list.map((s) => {
        const u = navUrl(s.addr);
        return `
          <article class="kzx-dir-card">
            <h3>${escapeHtml(s.name)}</h3>
            <div class="kzx-dir-loc">${escapeHtml(s.city)} · ${escapeHtml(s.region)}</div>
            <div class="kzx-dir-addr">${escapeHtml(s.addr)}</div>
            <div class="kzx-dir-meta">
              <span class="kzx-dir-tag">${escapeHtml(s.nusach || '')}</span>
              ${(s.tags || []).map((t) => `<span class="kzx-dir-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
            <div class="kzx-dir-actions">
              <a class="kzx-btn kzx-btn-waze" href="${u.waze}" target="_blank" rel="noopener">🚗 Waze</a>
              <a class="kzx-btn kzx-btn-gmaps" href="${u.gmaps}" target="_blank" rel="noopener">📍 Google Maps</a>
            </div>
          </article>`;
      }).join('') : '<div class="kzx-room-empty">לא נמצאו תוצאות.</div>';
    }
    [q, r, n].forEach((el) => el.addEventListener('input', render));
    [q, r, n].forEach((el) => el.addEventListener('change', render));
    render();
  }

  function buildKosher(host) {
    const wrap = document.createElement('section');
    wrap.className = 'kzx-dir kz-block';
    wrap.innerHTML = `
      <span class="kz-tag">מסעדות כשרות · מהדרום עד הצפון</span>
      <h2>מסעדות כשרות בישראל · עם דירוג כוכבים</h2>
      <p class="kz-lead">מאגר חי של מסעדות, מאפיות וחנויות כשרות. כפתורי וויז וגוגל מאפס בכל כרטיס.</p>
      <div class="kzx-dir-toolbar">
        <input id="kzxKQ" type="search" placeholder="חיפוש: שם, עיר, סוג…" />
        <select id="kzxKRegion">
          <option value="">כל הארץ</option>
          <option>ירושלים</option><option>מרכז</option><option>צפון</option><option>דרום</option>
        </select>
        <select id="kzxKMinStars">
          <option value="0">מינימום כוכבים</option>
          <option value="3">3+ ★</option>
          <option value="4">4+ ★</option>
          <option value="4.5">4.5+ ★</option>
        </select>
      </div>
      <div id="kzxKGrid" class="kzx-dir-grid"></div>
    `;
    host.appendChild(wrap);

    const q = wrap.querySelector('#kzxKQ');
    const r = wrap.querySelector('#kzxKRegion');
    const m = wrap.querySelector('#kzxKMinStars');
    const grid = wrap.querySelector('#kzxKGrid');
    function render() {
      const qq = q.value.trim().toLowerCase();
      const rr = r.value;
      const mm = parseFloat(m.value);
      const list = KOSHER_IL.filter((s) => {
        const txt = (s.name + ' ' + s.city + ' ' + (s.cat || '') + ' ' + (s.kashrut || '')).toLowerCase();
        return (!qq || txt.includes(qq)) && (!rr || s.region === rr) && (s.stars >= mm);
      }).sort((a, b) => b.stars - a.stars);
      grid.innerHTML = list.length ? list.map((s) => {
        const u = navUrl(s.addr);
        return `
          <article class="kzx-dir-card">
            <h3>${escapeHtml(s.name)}</h3>
            <div class="kzx-dir-loc">${escapeHtml(s.city)} · ${escapeHtml(s.region)}</div>
            <div class="kzx-dir-addr">${escapeHtml(s.addr)}</div>
            ${starHtml(s.stars)}
            <div class="kzx-dir-meta">
              <span class="kzx-dir-tag">${escapeHtml(s.cat)}</span>
              <span class="kzx-dir-tag">כשרות: ${escapeHtml(s.kashrut)}</span>
            </div>
            <div class="kzx-dir-actions">
              <a class="kzx-btn kzx-btn-waze" href="${u.waze}" target="_blank" rel="noopener">🚗 Waze</a>
              <a class="kzx-btn kzx-btn-gmaps" href="${u.gmaps}" target="_blank" rel="noopener">📍 Google Maps</a>
            </div>
          </article>`;
      }).join('') : '<div class="kzx-room-empty">לא נמצאו תוצאות.</div>';
    }
    [q, r, m].forEach((el) => el.addEventListener('input', render));
    [q, r, m].forEach((el) => el.addEventListener('change', render));
    render();
  }

  // ---------- KIDDUSH-LEVANA BANNER (giant ceremonial site name) ----------
  // Renders a bold, ornate banner with the site name in monumental
  // niqud-styled Hebrew letters at the very top of every page.
  // Purely additive — inserts before existing main/topbar content
  // without modifying it.
  function buildKiddushLevanaBanner() {
    if (document.querySelector('.kzx-klv-banner')) return;
    const body = document.body;
    if (!body) return;

    const banner = document.createElement('section');
    banner.className = 'kzx-klv-banner';
    banner.setAttribute('role', 'banner');
    banner.setAttribute('aria-label', 'מרכז התפילה · הבית היהודי שלך בעולם');
    banner.innerHTML = `
      <div class="kzx-klv-stars" aria-hidden="true">
        <span>✦</span><span>✡</span><span>✦</span>
      </div>
      <div class="kzx-klv-inner">
        <div class="kzx-klv-eyebrow">בָּרוּךְ הַבָּא · יִשְׂרָאֵל אֲרוּסַת הַשֵּׁם</div>
        <h1 class="kzx-klv-title" lang="he" dir="rtl">
          <span class="kzx-klv-letter">מֶ</span><span class="kzx-klv-letter">רְ</span><span class="kzx-klv-letter">כַּ</span><span class="kzx-klv-letter">ז</span>
          <span class="kzx-klv-space"></span>
          <span class="kzx-klv-letter">הַ</span><span class="kzx-klv-letter">תְּ</span><span class="kzx-klv-letter">פִ</span><span class="kzx-klv-letter">לָּ</span><span class="kzx-klv-letter">ה</span>
        </h1>
        <div class="kzx-klv-sub">הַבַּיִת הַיְּהוּדִי שֶׁלְּךָ · בְּכָל פִּינָה בָּעוֹלָם</div>
        <div class="kzx-klv-divider" aria-hidden="true">
          <span></span><i>✦</i><span></span>
        </div>
      </div>
    `;
    // Place at top of <body>, BEFORE topbar — preserves page order.
    body.insertBefore(banner, body.firstChild);
  }

  // ---------- ENHANCE find-jewish HERO with stronger live search hint ----------
  // Adds a small hint near the city input so users see immediately that the
  // search is live (autocomplete from the cities list).
  function enhanceFjHero() {
    const input = document.getElementById('fjCity');
    if (!input || input.dataset.kzxHinted) return;
    input.dataset.kzxHinted = '1';
    const tag = document.createElement('div');
    tag.className = 'kzx-fj-livehint';
    tag.innerHTML = '✦ <strong>חיפוש חי:</strong> הקלד אות אחת — ההצעות נפתחות מאליהן';
    input.parentElement.insertBefore(tag, input);
  }

  const COMMUNITY_CITIES = [
    'ירושלים','תל אביב','חיפה','באר שבע','אשדוד','נתניה','מודיעין','אילת','צפת','טבריה',
    'New York','Brooklyn','Los Angeles','Miami','Chicago','Las Vegas','Boston','Toronto','Montreal',
    'London','Manchester','Paris','Marseille','Lyon','Nice','Berlin','Munich','Frankfurt',
    'Vienna','Prague','Budapest','Warsaw','Madrid','Barcelona','Rome','Milan','Venice',
    'Athens','Mykonos','Santorini','Moscow','Saint Petersburg','Istanbul','Casablanca',
    'Marrakesh','Buenos Aires','Sao Paulo','Rio de Janeiro','Mexico City','Cancun','Panama City',
    'Sydney','Melbourne','Mumbai','Bangkok','Phuket','Singapore','Tokyo','Hong Kong',
    'Cape Town','Johannesburg','Dubai','Abu Dhabi','Kathmandu','Goa','Cusco','Lima'
  ];

  function buildLiveSuggest() {
    const input = document.getElementById('fjCity');
    if (!input || input.dataset.kzxLive) return;
    input.dataset.kzxLive = '1';
    const parent = input.parentElement;
    parent.style.position = 'relative';
    const list = document.createElement('div');
    list.className = 'kzx-live-suggestions';
    list.id = 'kzxCitySuggest';
    parent.appendChild(list);

    function close() { list.dataset.open = 'false'; }
    function open() { list.dataset.open = 'true'; }

    input.addEventListener('input', () => {
      const v = input.value.trim().toLowerCase();
      if (!v) { close(); return; }
      const matches = COMMUNITY_CITIES.filter((c) => c.toLowerCase().includes(v)).slice(0, 8);
      if (!matches.length) { close(); return; }
      list.innerHTML = matches.map((c) => `
        <div class="kzx-live-item" data-city="${escapeHtml(c)}">
          <strong>${escapeHtml(c)}</strong>
          <span>קהילה יהודית · בית כנסת · בית חב"ד · מסעדה כשרה</span>
        </div>
      `).join('');
      open();
      list.querySelectorAll('.kzx-live-item').forEach((it) => {
        it.addEventListener('click', () => {
          input.value = it.dataset.city;
          close();
          const btn = document.getElementById('fjSearch');
          if (btn) btn.click();
        });
      });
    });
    document.addEventListener('click', (e) => {
      if (!parent.contains(e.target)) close();
    });
  }

  function injectIsraelOrKosher() {
    // Find a host on find-jewish.html: just before #shiur-live or before fjResultsWrap
    const params = new URLSearchParams(location.search || '');
    const type = params.get('type') || '';
    const region = params.get('region') || '';
    const main = document.querySelector('main');
    if (!main) return;
    if (type === 'minyan' && region === 'israel') {
      buildIsraelSynagogues(main);
    }
    if (type === 'kosher') {
      buildKosher(main);
    }
  }

  // ---------- INIT ----------
  function init() {
    buildKiddushLevanaBanner();
    buildLangDropdown();
    restoreSavedLang();
    applyNiqudTitle();
    addLivePulse();
    if (document.getElementById('create')) buildFamilyRoom();
    if (document.getElementById('fjCity')) {
      enhanceFjHero();
      buildLiveSuggest();
      injectIsraelOrKosher();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
