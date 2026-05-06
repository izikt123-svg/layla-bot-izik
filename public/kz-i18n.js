/* ============================================================
   KZ i18n — 20 languages with REAL flags from flagcdn.com
   Flags get a subtle wave animation via CSS.
   ============================================================ */
(function(){
  'use strict';

  // 20 languages — diaspora-friendly + global reach
  const LANGS = [
    { code:'he', name:'עברית',     flag:'il', dir:'rtl', native:'עברית' },
    { code:'en', name:'English',    flag:'us', dir:'ltr', native:'English' },
    { code:'fr', name:'Français',   flag:'fr', dir:'ltr', native:'Français' },
    { code:'es', name:'Español',    flag:'es', dir:'ltr', native:'Español' },
    { code:'ru', name:'Русский',    flag:'ru', dir:'ltr', native:'Русский' },
    { code:'de', name:'Deutsch',    flag:'de', dir:'ltr', native:'Deutsch' },
    { code:'it', name:'Italiano',   flag:'it', dir:'ltr', native:'Italiano' },
    { code:'pt', name:'Português',  flag:'pt', dir:'ltr', native:'Português' },
    { code:'nl', name:'Nederlands', flag:'nl', dir:'ltr', native:'Nederlands' },
    { code:'pl', name:'Polski',     flag:'pl', dir:'ltr', native:'Polski' },
    { code:'hu', name:'Magyar',     flag:'hu', dir:'ltr', native:'Magyar' },
    { code:'ro', name:'Română',     flag:'ro', dir:'ltr', native:'Română' },
    { code:'el', name:'Ελληνικά',   flag:'gr', dir:'ltr', native:'Ελληνικά' },
    { code:'tr', name:'Türkçe',     flag:'tr', dir:'ltr', native:'Türkçe' },
    { code:'fa', name:'فارسی',      flag:'ir', dir:'rtl', native:'فارسی' },
    { code:'ar', name:'العربية',    flag:'ae', dir:'rtl', native:'العربية' },
    { code:'uk', name:'Українська', flag:'ua', dir:'ltr', native:'Українська' },
    { code:'ja', name:'日本語',     flag:'jp', dir:'ltr', native:'日本語' },
    { code:'zh', name:'中文',       flag:'cn', dir:'ltr', native:'中文' },
    { code:'hi', name:'हिन्दी',      flag:'in', dir:'ltr', native:'हिन्दी' }
  ];

  // Compact translation dictionary - core UI strings
  // Hebrew is identity (default). Other langs map Hebrew → target.
  const TRANS = {
    en: {
      'מרכז התפילה':'Prayer Center','בית':'Home','בקש תפילה':'Request Prayer','פיד':'Feed',
      'אזור אישי':'My Space','מאגר תפילות':'Prayer Library','סיפורים':'Stories','אודות':'About',
      'עזרה':'Help','אדמין':'Admin','התחברות':'Sign In','הרשמה':'Sign Up','הרשמה חינם':'Sign Up Free',
      'חיפוש מהיר…':'Quick search…','מפת היהדות':'Jewish Map','חדר המשפחה':'Family Room',
      'שלח תפילה':'Send Prayer','בקשות פעילות':'Active Requests','הפיד הכללי':'General Feed',
      'מותאם לך':'For You','הבקשות שלי':'My Requests','אני מתפלל על':'Praying For',
      'חיבורים':'Connections','נר לכל נשמה':'A candle for every soul','תהלים יחד':'Tehillim Together',
      'WhatsApp':'WhatsApp','ניווט':'Navigate','מפות':'Maps','חייג':'Call',
      'מרחב יהודי · אישי · אנונימי':'Jewish · Personal · Anonymous',
      'שתף':'Share','המקום בו':'The place where','התפילות מתגשמות':'prayers come true'
    },
    fr: {
      'מרכז התפילה':'Centre de Prière','בית':'Accueil','בקש תפילה':'Demander une Prière',
      'פיד':'Fil','אזור אישי':'Personnel','מאגר תפילות':'Bibliothèque','סיפורים':'Histoires',
      'אודות':'À propos','עזרה':'Aide','התחברות':'Connexion','חיפוש מהיר…':'Recherche rapide…',
      'מפת היהדות':'Carte Juive','חדר המשפחה':'Salle Familiale','שלח תפילה':'Envoyer Prière',
      'בקשות פעילות':'Demandes Actives','WhatsApp':'WhatsApp','ניווט':'Naviguer','מפות':'Cartes',
      'חייג':'Appeler','שתף':'Partager','אני מתפלל על':'Je prie pour','הבקשות שלי':'Mes demandes',
      'תהלים יחד':'Tehillim ensemble'
    },
    es: {
      'מרכז התפילה':'Centro de Oración','בית':'Inicio','בקש תפילה':'Solicitar Oración',
      'פיד':'Feed','אזור אישי':'Personal','מאגר תפילות':'Biblioteca','סיפורים':'Historias',
      'אודות':'Acerca','עזרה':'Ayuda','התחברות':'Iniciar Sesión','חיפוש מהיר…':'Búsqueda rápida…',
      'מפת היהדות':'Mapa Judío','חדר המשפחה':'Sala Familiar','שלח תפילה':'Enviar Oración',
      'בקשות פעילות':'Solicitudes Activas','WhatsApp':'WhatsApp','ניווט':'Navegar','מפות':'Mapas',
      'חייג':'Llamar','שתף':'Compartir','אני מתפלל על':'Estoy orando por','הבקשות שלי':'Mis solicitudes'
    },
    ru: {
      'מרכז התפילה':'Молитвенный Центр','בית':'Главная','בקש תפילה':'Запрос Молитвы','פיד':'Лента',
      'אזור אישי':'Личное','מאגר תפילות':'Библиотека','סיפורים':'Истории','אודות':'О нас',
      'עזרה':'Помощь','התחברות':'Войти','חיפוש מהיר…':'Быстрый поиск…','מפת היהדות':'Еврейская Карта',
      'חדר המשפחה':'Семейная Комната','שלח תפילה':'Отправить','בקשות פעילות':'Активные Запросы',
      'WhatsApp':'WhatsApp','ניווט':'Навигация','מפות':'Карты','חייג':'Звонить','שתף':'Поделиться',
      'אני מתפלל על':'Молюсь за','הבקשות שלי':'Мои запросы'
    },
    de: {
      'מרכז התפילה':'Gebetszentrum','בית':'Startseite','בקש תפילה':'Gebet anfordern','פיד':'Feed',
      'אזור אישי':'Persönlich','מאגר תפילות':'Bibliothek','סיפורים':'Geschichten','אודות':'Über',
      'עזרה':'Hilfe','התחברות':'Anmelden','חיפוש מהיר…':'Schnellsuche…','מפת היהדות':'Jüdische Karte',
      'חדר המשפחה':'Familienzimmer','שלח תפילה':'Gebet senden','בקשות פעילות':'Aktive Anfragen',
      'WhatsApp':'WhatsApp','ניווט':'Navigieren','מפות':'Karten','חייג':'Anrufen','שתף':'Teilen',
      'אני מתפלל על':'Ich bete für','הבקשות שלי':'Meine Anfragen'
    },
    it: {
      'מרכז התפילה':'Centro di Preghiera','בית':'Home','בקש תפילה':'Richiedi Preghiera',
      'פיד':'Feed','אזור אישי':'Personale','אודות':'Informazioni','עזרה':'Aiuto',
      'התחברות':'Accedi','מפת היהדות':'Mappa Ebraica','חדר המשפחה':'Stanza Famiglia',
      'WhatsApp':'WhatsApp','ניווט':'Naviga','מפות':'Mappe','חייג':'Chiama','שתף':'Condividi'
    },
    pt: {
      'מרכז התפילה':'Centro de Oração','בית':'Início','בקש תפילה':'Pedir Oração',
      'פיד':'Feed','אזור אישי':'Pessoal','אודות':'Sobre','עזרה':'Ajuda',
      'התחברות':'Entrar','מפת היהדות':'Mapa Judaico','חדר המשפחה':'Sala da Família',
      'WhatsApp':'WhatsApp','ניווט':'Navegar','מפות':'Mapas','חייג':'Ligar','שתף':'Partilhar'
    },
    nl: {
      'מרכז התפילה':'Gebedscentrum','בית':'Home','בקש תפילה':'Vraag Gebed','פיד':'Feed',
      'אזור אישי':'Persoonlijk','אודות':'Over','עזרה':'Help','התחברות':'Inloggen',
      'מפת היהדות':'Joodse Kaart','חדר המשפחה':'Familiekamer','שתף':'Delen'
    },
    pl: {
      'מרכז התפילה':'Centrum Modlitwy','בית':'Strona Główna','בקש תפילה':'Poproś o Modlitwę',
      'פיד':'Feed','אזור אישי':'Osobisty','אודות':'O nas','עזרה':'Pomoc',
      'התחברות':'Zaloguj','מפת היהדות':'Mapa Żydowska','חדר המשפחה':'Pokój Rodzinny','שתף':'Udostępnij'
    },
    hu: {
      'מרכז התפילה':'Imaközpont','בית':'Főoldal','בקש תפילה':'Imát Kérni','פיד':'Hírfolyam',
      'אזור אישי':'Személyes','אודות':'Rólunk','עזרה':'Segítség','התחברות':'Bejelentkezés',
      'מפת היהדות':'Zsidó Térkép','חדר המשפחה':'Családi Szoba'
    },
    ro: {
      'מרכז התפילה':'Centru de Rugăciune','בית':'Acasă','בקש תפילה':'Cere Rugăciune',
      'פיד':'Flux','אזור אישי':'Personal','אודות':'Despre','עזרה':'Ajutor',
      'התחברות':'Autentificare','מפת היהדות':'Hartă Evreiască','חדר המשפחה':'Camera Familiei'
    },
    el: {
      'מרכז התפילה':'Κέντρο Προσευχής','בית':'Αρχική','בקש תפילה':'Ζήτηση Προσευχής',
      'פיד':'Ροή','אזור אישי':'Προσωπικό','אודות':'Σχετικά','עזרה':'Βοήθεια',
      'התחברות':'Σύνδεση','מפת היהדות':'Εβραϊκός Χάρτης','חדר המשפחה':'Οικογενειακό Δωμάτιο'
    },
    tr: {
      'מרכז התפילה':'Dua Merkezi','בית':'Ana Sayfa','בקש תפילה':'Dua İste','פיד':'Akış',
      'אזור אישי':'Kişisel','אודות':'Hakkında','עזרה':'Yardım','התחברות':'Giriş',
      'מפת היהדות':'Yahudi Haritası','חדר המשפחה':'Aile Odası'
    },
    fa: {
      'מרכז התפילה':'مرکز دعا','בית':'خانه','בקש תפילה':'درخواست دعا','פיד':'فید',
      'אזור אישי':'شخصی','אודות':'درباره','עזרה':'کمک','התחברות':'ورود',
      'מפת היהדות':'نقشه یهودی','חדר המשפחה':'اتاق خانواده'
    },
    ar: {
      'מרכז התפילה':'مركز الصلاة','בית':'الرئيسية','בקש תפילה':'طلب صلاة','פיד':'التغذية',
      'אזור אישי':'شخصي','אודות':'حول','עזרה':'مساعدة','התחברות':'تسجيل دخول',
      'מפת היהדות':'الخريطة اليهودية','חדר המשפחה':'غرفة العائلة'
    },
    uk: {
      'מרכז התפילה':'Молитовний Центр','בית':'Головна','בקש תפילה':'Запит Молитви',
      'פיד':'Стрічка','אזור אישי':'Особисте','אודות':'Про нас','עזרה':'Допомога',
      'התחברות':'Увійти','מפת היהדות':'Єврейська Карта','חדר המשפחה':'Сімейна Кімната'
    },
    ja: {
      'מרכז התפילה':'祈りのセンター','בית':'ホーム','בקש תפילה':'祈りをリクエスト','פיד':'フィード',
      'אזור אישי':'個人','אודות':'紹介','עזרה':'ヘルプ','התחברות':'サインイン',
      'מפת היהדות':'ユダヤマップ','חדר המשפחה':'ファミリールーム'
    },
    zh: {
      'מרכז התפילה':'祈祷中心','בית':'主页','בקש תפילה':'请求祈祷','פיד':'动态',
      'אזור אישי':'个人','אודות':'关于','עזרה':'帮助','התחברות':'登录',
      'מפת היהדות':'犹太地图','חדר המשפחה':'家庭房间'
    },
    hi: {
      'מרכז התפילה':'प्रार्थना केंद्र','בית':'होम','בקש תפילה':'प्रार्थना अनुरोध','פיד':'फ़ीड',
      'אזור אישי':'व्यक्तिगत','אודות':'हमारे बारे में','עזרה':'मदद','התחברות':'साइन इन',
      'מפת היהדות':'यहूदी मानचित्र','חדר המשפחה':'पारिवारिक कक्ष'
    },
    he: {} // identity
  };

  let currentLang = localStorage.getItem('kz-lang') || 'he';

  function flagUrl(code){ return `https://flagcdn.com/w40/${code}.png`; }
  function flagSet(code){
    return `https://flagcdn.com/w20/${code}.png 1x, https://flagcdn.com/w40/${code}.png 2x`;
  }

  function buildSwitcher(){
    if (document.querySelector('.kz-lang-switcher')) return;
    const actions = document.querySelector('.top-actions');
    if (!actions) return;
    document.querySelectorAll('.lang-switch').forEach(el => el.remove());

    const cur = LANGS.find(l => l.code === currentLang) || LANGS[0];
    const wrap = document.createElement('div');
    wrap.className = 'kz-lang-switcher';
    wrap.innerHTML = `
      <button type="button" class="kz-lang-current" aria-label="שפה / Language" aria-haspopup="true" aria-expanded="false">
        <span class="kz-flag-wrap"><img class="kz-flag-img" id="kzLangFlag" src="${flagUrl(cur.flag)}" srcset="${flagSet(cur.flag)}" width="22" height="16" alt="${cur.name}"/></span>
        <span class="kz-lang-arrow">▾</span>
      </button>
      <div class="kz-lang-menu" id="kzLangMenu" hidden>
        <div class="kz-lang-menu-head">בחר שפה · Choose Language</div>
        <div class="kz-lang-menu-grid">
          ${LANGS.map(l => `
            <button type="button" class="kz-lang-option ${l.code === currentLang ? 'active' : ''}" data-lang="${l.code}" dir="${l.dir}">
              <span class="kz-flag-wrap"><img class="kz-flag-img" src="${flagUrl(l.flag)}" srcset="${flagSet(l.flag)}" width="22" height="16" alt="${l.name}" loading="lazy"/></span>
              <span class="kz-lang-name">${l.native}</span>
              <span class="kz-lang-check">✓</span>
            </button>
          `).join('')}
        </div>
      </div>`;
    actions.insertBefore(wrap, actions.firstChild);

    const btn = wrap.querySelector('.kz-lang-current');
    const menu = wrap.querySelector('.kz-lang-menu');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !menu.hidden;
      menu.hidden = open;
      btn.setAttribute('aria-expanded', String(!open));
    });
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)){ menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    });
    menu.addEventListener('click', (e) => {
      const opt = e.target.closest('.kz-lang-option');
      if (!opt) return;
      setLang(opt.dataset.lang);
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function translate(node, dict){
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode(n){
        if (!n.nodeValue) return NodeFilter.FILTER_REJECT;
        const trimmed = n.nodeValue.trim();
        if (!trimmed) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
        // Don't translate the vocalized brand
        if (p.classList && p.classList.contains('kz-vocalized')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let n; while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(textNode => {
      const original = textNode.nodeValue;
      const trimmed = original.trim();
      if (!textNode._kzOriginal) textNode._kzOriginal = original;
      if (dict[trimmed]){
        textNode.nodeValue = original.replace(trimmed, dict[trimmed]);
      } else if (textNode._kzOriginal !== undefined){
        textNode.nodeValue = textNode._kzOriginal;
      }
    });
  }

  function setLang(lang){
    currentLang = lang;
    localStorage.setItem('kz-lang', lang);
    const def = LANGS.find(l => l.code === lang);
    if (!def) return;
    const flagEl = document.getElementById('kzLangFlag');
    if (flagEl){
      flagEl.src = flagUrl(def.flag);
      flagEl.srcset = flagSet(def.flag);
      flagEl.alt = def.name;
    }
    document.querySelectorAll('.kz-lang-option').forEach(o => {
      o.classList.toggle('active', o.dataset.lang === lang);
    });
    document.documentElement.lang = lang;
    document.documentElement.dir = def.dir;
    const dict = TRANS[lang] || {};
    translate(document.body, dict);
    showFlash(def);
  }

  function showFlash(def){
    const old = document.querySelector('.kz-lang-flash');
    if (old) old.remove();
    const f = document.createElement('div');
    f.className = 'kz-lang-flash';
    f.innerHTML = `<span class="kz-flag-wrap"><img class="kz-flag-img" src="${flagUrl(def.flag)}" srcset="${flagSet(def.flag)}" width="22" height="16" alt=""/></span> ${def.native}`;
    document.body.appendChild(f);
    requestAnimationFrame(() => f.classList.add('show'));
    setTimeout(() => {
      f.classList.remove('show');
      setTimeout(() => f.remove(), 300);
    }, 1400);
  }

  function init(){
    buildSwitcher();
    if (currentLang !== 'he') setLang(currentLang);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
