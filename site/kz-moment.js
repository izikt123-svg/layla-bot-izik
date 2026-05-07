/* ============================================================
   60 SECONDS — daily spiritual reset (4-phase guided)
   - 12s breathing
   - 18s verse
   - 18s personal blessing
   - 12s done + streak
   - Tracks daily streak in localStorage
   ============================================================ */
(function(){
  'use strict';

  /* Curated verses + blessings — pick by day-of-year for stable rotation */
  const VERSES = [
    { ref:'תהלים כ"ג, א', text:'יְהוָה רֹעִי לֹא אֶחְסָר.' },
    { ref:'משלי ג, ו', text:'בְּכָל דְּרָכֶיךָ דָעֵהוּ, וְהוּא יְיַשֵּׁר אֹרְחֹתֶיךָ.' },
    { ref:'תהלים קכ"א, א-ב', text:'אֶשָּׂא עֵינַי אֶל הֶהָרִים — מֵאַיִן יָבֹא עֶזְרִי. עֶזְרִי מֵעִם יְהוָה.' },
    { ref:'תהלים קל"ט, ט-י', text:'אֶשָּׂא כַנְפֵי שָׁחַר, אֶשְׁכְּנָה בְּאַחֲרִית יָם — גַּם שָׁם יָדְךָ תַנְחֵנִי.' },
    { ref:'ישעיהו מ, ל"א', text:'וְקֹוֵי יְהוָה יַחֲלִיפוּ כֹחַ, יַעֲלוּ אֵבֶר כַּנְּשָׁרִים.' },
    { ref:'תהלים קמ"ה, ט"ז', text:'פּוֹתֵחַ אֶת יָדֶךָ, וּמַשְׂבִּיעַ לְכָל חַי רָצוֹן.' },
    { ref:'משלי ל"א, כ"ה', text:'עֹז וְהָדָר לְבוּשָׁהּ, וַתִּשְׂחַק לְיוֹם אַחֲרוֹן.' },
    { ref:'תהלים פ"ד, י"ב', text:'כִּי שֶׁמֶשׁ וּמָגֵן יְהוָה אֱלֹהִים, חֵן וְכָבוֹד יִתֵּן יְהוָה.' },
    { ref:'ירמיהו כ"ט, י"א', text:'כִּי אָנֹכִי יָדַעְתִּי אֶת הַמַּחֲשָׁבֹת — מַחְשְׁבוֹת שָׁלוֹם וְלֹא לְרָעָה, לָתֵת לָכֶם אַחֲרִית וְתִקְוָה.' },
    { ref:'תהלים ל"ד, י"ט', text:'קָרוֹב יְהוָה לְנִשְׁבְּרֵי לֵב, וְאֶת דַּכְּאֵי רוּחַ יוֹשִׁיעַ.' },
    { ref:'שיר השירים ב, ט"ז', text:'דּוֹדִי לִי וַאֲנִי לוֹ.' },
    { ref:'תהלים נ"ה, כ"ג', text:'הַשְׁלֵךְ עַל יְהוָה יְהָבְךָ, וְהוּא יְכַלְכְּלֶךָ.' },
    { ref:'ישעיהו נ"ד, י', text:'הֶהָרִים יָמוּשׁוּ — וְחַסְדִּי מֵאִתֵּךְ לֹא יָמוּשׁ, וּבְרִית שְׁלוֹמִי לֹא תָמוּט.' },
    { ref:'תהלים פ"ד, ה', text:'אַשְׁרֵי יוֹשְׁבֵי בֵיתֶךָ, עוֹד יְהַלְלוּךָ סֶּלָה.' },
    { ref:'דברים ז, ט', text:'אֵל נֶאֱמָן, שׁוֹמֵר הַבְּרִית וְהַחֶסֶד.' }
  ];

  const BLESSINGS = [
    'תזכי שהיום הזה יתחיל ויסתיים בחסד, שהדרך תפתח בלי מכשולים, שתפגשי אנשים טובים ושפלך תיתן לך מנוחה ושלום.',
    'יהי רצון שהשם יאיר את פנייך, ישלח רפואה לכל מי שצריך מסביבך, ירבה את שמחת הבית שלך וייתן לך כוח להמשיך לאהוב.',
    'תזכי שהדמעות יהפכו לשמחה, שהחששות יתפוגגו, שהבטחון יחזור, ושכל מה שתפילתך מבקשת — יבוא אלייך באהבה.',
    'תפילתך לא תשוב ריקם. כל בקשה שלך נשמעת בשמיים. תני לשם להוביל אותך — והוא יוביל אותך אל הטוב.',
    'יהי רצון שתזכי לראות פירות לעמלך, שכל הילדים שלך (ושל אחרים) יזכו לבריאות, פרנסה וזיווג הגון, ושיתקיים בך "ולא יהיה לך עוד עצב".',
    'הקב"ה יושב איתך עכשיו. הוא רואה כל מה שאת מרגישה. הוא מחבק אותך ברגע הזה. את לא לבד.',
    'תזכי לבריאות איתנה, פרנסה ברכה, נחת מהמשפחה, וכוח לעמוד בכל אתגר. השם הוא רועך — לא תחסרי.',
    'שלום בית מתנת השמים. תני לאמונה לעבוד בלי שתעבדי. תני לרוגע למלא את החדר. הכל יסתדר ברגע הנכון.',
    'את חזקה יותר ממה שאת חושבת. השם נתן לך את הכוח הזה בכוונה. תרשי לעצמך לנשום היום.',
    'כל מצווה קטנה שתעשי היום — תוסיף אור בעולם הזה. תני לעצמך אישור להיות שמחה.'
  ];

  const STREAK_KEY = 'kz_60s_streak_v1';

  function dayOfYear(){
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d - start;
    return Math.floor(diff / 86400000);
  }
  function loadStreak(){
    try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"count":0,"lastDate":""}'); }
    catch { return { count: 0, lastDate: '' }; }
  }
  function saveStreak(s){ try { localStorage.setItem(STREAK_KEY, JSON.stringify(s)); } catch {} }
  function todayKey(){ return new Date().toISOString().slice(0,10); }
  function yesterdayKey(){
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0,10);
  }

  /* Render initial streak label */
  const streakState = loadStreak();
  document.getElementById('moStreak').innerHTML = `🔥 <b>${streakState.count}</b> ימים ברצף`;

  /* Phase navigation */
  const phases = ['welcome','breath','verse','bless','done'];
  function show(phase){
    document.querySelectorAll('.mo-phase').forEach(el => {
      el.classList.toggle('is-on', el.dataset.phase === phase);
    });
  }

  function progressTo(barEl, ms){
    barEl.style.width = '0%';
    barEl.style.transition = `width ${ms}ms linear`;
    requestAnimationFrame(() => { barEl.style.width = '100%'; });
  }

  function pickByDay(arr){ return arr[dayOfYear() % arr.length]; }

  document.getElementById('moStart').addEventListener('click', start);
  document.getElementById('moTomorrow').addEventListener('click', () => history.back());

  function start(){
    /* Phase: breathing 12s */
    show('breath');
    const bar = document.getElementById('moBreathBar');
    const txt = document.getElementById('moBreathText');
    progressTo(bar, 12000);
    let cycle = 0;
    txt.textContent = 'שאפי…';
    const breathInterval = setInterval(() => {
      cycle++;
      txt.textContent = (cycle % 2) ? 'נשפי…' : 'שאפי…';
    }, 4000);

    setTimeout(() => {
      clearInterval(breathInterval);
      /* Phase: verse 18s */
      show('verse');
      const v = pickByDay(VERSES);
      document.getElementById('moVerseRef').textContent = v.ref;
      document.getElementById('moVerseText').textContent = v.text;
      progressTo(document.getElementById('moVerseBar'), 18000);

      setTimeout(() => {
        /* Phase: blessing 18s */
        show('bless');
        document.getElementById('moBlessText').textContent = pickByDay(BLESSINGS);
      }, 18000);
    }, 12000);
  }

  document.getElementById('moAmen').addEventListener('click', () => {
    /* Update streak — once per calendar day */
    const today = todayKey();
    const s = loadStreak();
    if (s.lastDate !== today){
      s.count = (s.lastDate === yesterdayKey()) ? (s.count + 1) : 1;
      s.lastDate = today;
      saveStreak(s);
    }
    document.getElementById('moStreakGrow').innerHTML = `🔥 ימים ברצף: <b>${s.count}</b>`;
    document.getElementById('moStreak').innerHTML = `🔥 <b>${s.count}</b> ימים ברצף`;
    show('done');
  });
})();
