/* ============================================================
   NATIONAL MEMORIAL — Logic for 7 wars + terror
   Storage: localStorage; ready to migrate to Supabase later
   ============================================================ */
(function(){
  'use strict';

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  const STORAGE_KEY = 'kz-national-memorial-v1';

  /* ─── War definitions ────────────────────────────── */
  const WARS = [
    {
      id: 'shoah',
      emblem: '🕯',
      name: 'הַשּׁוֹאָה',
      dates: '1939–1945',
      summary: 'שישה מיליון אחים ואחיות. שש מילון נשמות. חלקם לא הותירו אחריהם איש שיזכור את שמם. כאן, בקיר זה, נדליק נר עבור כל אחד שאי פעם נאסר, גורש, רומס, נרצח, או קם וברח. כל שם שאי פעם תזכור — חי לנצח.',
      stats: [
        { num: '6,000,000', label: 'נשמות' },
        { num: '1,500,000', label: 'ילדים יהודים' },
        { num: '∞', label: 'בלתי נשכחים' }
      ],
      quote: '"זָכֹר אֶת אֲשֶׁר עָשָׂה לְךָ עֲמָלֵק"',
      quoteSource: 'דברים כ"ה, י"ז',
      seedNames: [
        { name: 'אנה פרנק', relation: 'נערה מאמסטרדם, גיל 15', note: 'יומנה האיר את העולם' },
        { name: 'הרב מנחם זמבא', relation: 'מגדולי וורשה', note: 'מנהיג רוחני בגטו' },
        { name: 'יאנוש קורצ׳אק', relation: 'רופא וסופר', note: 'הלך עם הילדים לטרבלינקה' }
      ]
    },
    {
      id: '1948',
      emblem: '🇮🇱',
      name: 'מִלְחֶמֶת הָעַצְמָאוּת',
      dates: 'תש"ח · 1947–1949',
      summary: 'הם קמו מן האפר. נצחו את כל הצבאות הסובבים. הקימו מדינה. שישה אלף וחמש מאות חברים מסר את חייו כדי שיהיה לעם ישראל בית. אחד מכל מאה נפל. בכל בית בארץ — שוכר אבל ושמחה.',
      stats: [
        { num: '6,373', label: 'חללים' },
        { num: '1%', label: 'מהאוכלוסייה' },
        { num: '×64', label: 'יחס לאויב' }
      ],
      quote: '"אִם תִּרְצוּ אֵין זוֹ אַגָּדָה"',
      quoteSource: 'הרצל',
      seedNames: [
        { name: 'יוסף טרומפלדור', relation: 'מגיני תל-חי', note: 'טוב למות בעד ארצנו' },
        { name: 'מרדכי גור', relation: 'לוחמי לטרון', note: 'נפל בקרב על הדרך לירושלים' }
      ]
    },
    {
      id: '1967',
      emblem: '🕊',
      name: 'מִלְחֶמֶת שֵׁשֶׁת הַיָּמִים',
      dates: 'יוני 1967',
      summary: 'שישה ימים ששינו את ההיסטוריה. ירושלים שוחררה. הר הבית שלנו. הכותל בידינו. אבל בני אלף בנים נופלים. אלף משפחות עם כיסא ריק. הניצחון הגדול ביותר בא במחיר הכבד ביותר.',
      stats: [
        { num: '776', label: 'חללים' },
        { num: '6 ימים', label: 'ניצחון' },
        { num: 'ירושלים', label: 'שוחררה' }
      ],
      quote: '"הַר הַבַּיִת בְּיָדֵינוּ"',
      quoteSource: 'מוטה גור',
      seedNames: [
        { name: 'נורית ולוי', relation: 'אחות וטייס', note: 'נפלו אחיה ובעלה באותו שבוע' }
      ]
    },
    {
      id: '1973',
      emblem: '⛓',
      name: 'מִלְחֶמֶת יוֹם הַכִּפּוּרִים',
      dates: 'אוקטובר 1973',
      summary: 'יום הכיפורים תשל"ד. יום של תפילה הפך ליום של כדורים. אלפיים שש מאות חיילים מסרו את חייהם בהפתעה. הקרב הקשה בתולדות צה"ל. כל משפחה בארץ יודעת איזה אבא או אח לא חזר.',
      stats: [
        { num: '2,656', label: 'חללים' },
        { num: '7,251', label: 'נפצעו' },
        { num: '20 יום', label: 'בעוד הוא בא' }
      ],
      quote: '"כִּי תַעֲבֹר בַּמַּיִם אִתְּךָ אָנִי"',
      quoteSource: 'ישעיהו מ"ג, ב\'',
      seedNames: [
        { name: 'אבי לניר', relation: 'טייס פאנטום', note: 'נפל בקרב חרמון' }
      ]
    },
    {
      id: 'lebanon',
      emblem: '🪖',
      name: 'מִלְחֲמוֹת לְבָנוֹן',
      dates: '1982 · 2006',
      summary: 'שתי מלחמות. שתי גנרציות. אלף ומאתיים חיילי צה"ל לא חזרו. מלחמת שלום הגליל ומלחמת לבנון השנייה. דם ישראלי על אדמת הצפון. כל אחד שלהם — חבר, אח, בן, אבא.',
      stats: [
        { num: '675', label: 'בלבנון א\'' },
        { num: '121', label: 'בלבנון ב\'' },
        { num: '1,200+', label: 'סה"כ חללים' }
      ],
      quote: '"שִׁלְטוֹן יוֹשֵׁב בָּצוּר עָלֵיכֶם"',
      quoteSource: 'מתוך פיוט',
      seedNames: []
    },
    {
      id: 'oct7',
      emblem: '🎗',
      name: 'הַשְּׁבִיעִי בְּאוֹקְטוֹבֶּר',
      dates: '7.10.2023 ועוד',
      summary: 'שביעי באוקטובר תשפ"ד. שמחת תורה. השבת השחורה. אלף ומאתיים נשמות נכרתו ביום אחד — תינוקות, ילדים, אנשים זקנים, חיילים, מסיבת ניסיו, נשים בקיבוצי העוטף. ועוד אלפים נופלים מאז במלחמה. נצחי. בלתי נמחק. לא נשכח.',
      stats: [
        { num: '1,200+', label: 'נרצחו ביום' },
        { num: '250+', label: 'נחטפו' },
        { num: '∞', label: 'בעוד הם איתנו' }
      ],
      quote: '"לֹא תַעֲמֹד עַל דַּם רֵעֶךָ"',
      quoteSource: 'ויקרא י"ט, ט"ז',
      seedNames: [
        { name: 'שני לוק', relation: 'מנובה', note: 'אישה צעירה שחיבקה את החיים' },
        { name: 'הרב אריה ולוי כהן', relation: 'משפחה מבארי', note: 'שמרו על הילדים עד הסוף' }
      ]
    },
    {
      id: 'terror',
      emblem: '🌹',
      name: 'נִפְגְעֵי הַטֶּרוֹר',
      dates: '1948 — היום',
      summary: 'אלפיים ושמונה מאות אזרחים קמו בבוקר ולא חזרו לישון. בפיגוע באוטובוס. בקפה. בלידה. בחתונה. בבית כנסת. בלי שיהיו חיילים. רק יהודים שחיו את חייהם. הם זכרון נצחי בלב כל אחד מאיתנו.',
      stats: [
        { num: '2,800+', label: 'נרצחו בטרור' },
        { num: '∞', label: 'נפגעו במשפחותיהם' },
        { num: 'יום אחד', label: 'בכל אחד מהם' }
      ],
      quote: '"וְזָכוּר לָנוּ דָם עֲבָדֶיךָ הַשָּׁפוּךְ"',
      quoteSource: 'ספר תהלים ע"ט',
      seedNames: []
    }
  ];

  /* ─── Storage ─────────────────────────────────────── */
  function load(){
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { candles: {}, stories: {} };
    } catch(_){
      return { candles: {}, stories: {} };
    }
  }
  function save(state){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(_){}
  }

  let state = load();
  // Migrate seed names per war once
  if (!state._seeded){
    WARS.forEach(w => {
      state.candles[w.id] = state.candles[w.id] || [];
      state.stories[w.id] = state.stories[w.id] || [];
      // Inject seed names if empty
      if (state.candles[w.id].length === 0 && w.seedNames.length){
        state.candles[w.id] = w.seedNames.map(s => ({
          name: s.name,
          relation: s.relation,
          note: s.note,
          by: 'הציבור',
          at: Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30,
          seed: true
        }));
      }
    });
    state._seeded = true;
    save(state);
  }

  /* ─── Toast ───────────────────────────────────────── */
  function toast(msg){
    const old = $('.nm-toast'); if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'nm-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('is-visible'));
    setTimeout(() => {
      t.classList.remove('is-visible');
      setTimeout(() => t.remove(), 400);
    }, 2400);
  }

  /* ─── Modal helpers ──────────────────────────────── */
  let activeWarId = null;
  function openModal(id, war){
    activeWarId = war ? war.id : null;
    const modal = $(id);
    if (!modal) return;
    modal.hidden = false;
    if (id === '#nmCandleModal' && war){
      $('#nmCandleTitle').textContent = `הדלק נר זיכרון — ${war.name.replace(/[ֲֳִֵֶַָֹֻּׁׂ]/g,'')}`;
    }
    if (id === '#nmStoryModal' && war){
      $('#nmStoryTitle').textContent = `סיפור זיכרון — ${war.name.replace(/[ֲֳִֵֶַָֹֻּׁׂ]/g,'')}`;
    }
    setTimeout(() => {
      const f = modal.querySelector('input, textarea');
      if (f) f.focus();
    }, 80);
  }
  function closeModal(){
    $$('.nm-modal').forEach(m => m.hidden = true);
  }
  document.addEventListener('click', e => {
    if (e.target.matches('.nm-modal-back, [data-close]')){
      closeModal();
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  /* ─── Time helpers ───────────────────────────────── */
  function timeAgo(ts){
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 60) return 'כעת';
    const min = Math.floor(sec / 60);
    if (min < 60) return `לפני ${min} דקות`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `לפני ${hr} שעות`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `לפני ${day} ימים`;
    return new Date(ts).toLocaleDateString('he-IL');
  }

  /* ─── Escape ─────────────────────────────────────── */
  function escape(s){
    return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  /* ─── Render war card ────────────────────────────── */
  function renderWar(w){
    const candles = state.candles[w.id] || [];
    const stories = state.stories[w.id] || [];

    return `
      <article class="nm-war" data-war="${w.id}" id="war-${w.id}">
        <header class="nm-war-header">
          <div class="nm-war-emblem">${w.emblem}</div>
          <h2 class="nm-war-name">${w.name}</h2>
          <div class="nm-war-dates">${w.dates}</div>
          <p class="nm-war-summary">${w.summary}</p>
          <div class="nm-war-stats">
            ${w.stats.map(s => `<div class="nm-war-stat"><strong>${s.num}</strong>${s.label}</div>`).join('')}
          </div>
          <div class="nm-war-actions">
            <button class="nm-war-btn nm-war-btn-primary" data-light="${w.id}">🕯 הדלק נר</button>
            <button class="nm-war-btn nm-war-btn-secondary" data-story="${w.id}">📖 ספר סיפור</button>
          </div>
          <div class="nm-war-quote">${w.quote}<br><small>— ${w.quoteSource}</small></div>
        </header>

        <div class="nm-war-body">
          <h3 class="nm-war-section-title">🕯 קיר נרות (${candles.length})</h3>
          ${candles.length ? `
            <div class="nm-candles-wall">
              ${candles.slice(0, 60).map(c => `
                <div class="nm-candle" title="${escape(c.name)}">
                  <div class="nm-candle-flame"></div>
                  <div class="nm-candle-name">${escape(c.name)}</div>
                  ${c.relation ? `<div class="nm-candle-relation">${escape(c.relation)}</div>` : ''}
                  ${c.note ? `<div class="nm-candle-note">${escape(c.note)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : `<div class="nm-empty">עדיין לא הודלקו נרות. תהיה הראשון.</div>`}

          <h3 class="nm-war-section-title">📖 סיפורים (${stories.length})</h3>
          ${stories.length ? `
            <div class="nm-stories">
              ${stories.slice(0, 20).map(s => `
                <div class="nm-story">
                  <div class="nm-story-name">${escape(s.name)}</div>
                  <div class="nm-story-by">${escape(s.by || 'אנונימי')} · ${timeAgo(s.at)}</div>
                  <div class="nm-story-text">${escape(s.text)}</div>
                </div>
              `).join('')}
            </div>
          ` : `<div class="nm-empty">עדיין לא נכתבו סיפורים. שתף את שלך.</div>`}
        </div>
      </article>
    `;
  }

  function render(){
    const wrap = $('#nmWars');
    if (!wrap) return;
    wrap.innerHTML = WARS.map(renderWar).join('');
    updateStats();
  }

  function updateStats(){
    let totalCandles = 0;
    let totalStories = 0;
    let totalNames = 0;
    WARS.forEach(w => {
      const candles = state.candles[w.id] || [];
      const stories = state.stories[w.id] || [];
      totalCandles += candles.length;
      totalStories += stories.length;
      totalNames += candles.length + stories.length;
    });
    const tc = $('#nmTotalCandles'); if (tc) tc.textContent = totalCandles.toLocaleString('he-IL');
    const ts = $('#nmTotalStories'); if (ts) ts.textContent = totalStories.toLocaleString('he-IL');
    const tn = $('#nmTotalNames');   if (tn) tn.textContent = totalNames.toLocaleString('he-IL');
  }

  /* ─── Tab filtering ──────────────────────────────── */
  function bindTabs(){
    $$('.nm-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.nm-tab').forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        const target = tab.dataset.war;
        $$('.nm-war').forEach(w => {
          w.hidden = (target !== 'all' && w.dataset.war !== target);
        });
        // Scroll to tab area smoothly
        if (target !== 'all'){
          const el = $(`#war-${target}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: $('.nm-wars').offsetTop - 100, behavior: 'smooth' });
        }
      });
    });
  }

  /* ─── Action handlers ────────────────────────────── */
  function bindActions(){
    document.addEventListener('click', e => {
      const lightBtn = e.target.closest('[data-light]');
      const storyBtn = e.target.closest('[data-story]');
      if (lightBtn){
        const w = WARS.find(x => x.id === lightBtn.dataset.light);
        openModal('#nmCandleModal', w);
      }
      if (storyBtn){
        const w = WARS.find(x => x.id === storyBtn.dataset.story);
        openModal('#nmStoryModal', w);
      }
    });

    $('#nmCandConfirm')?.addEventListener('click', () => {
      const name = $('#nmCandName').value.trim();
      if (!name){ toast('הזן שם'); return; }
      const candle = {
        name,
        relation: $('#nmCandRelation').value.trim(),
        note: $('#nmCandNote').value.trim(),
        by: 'אנונימי',
        at: Date.now()
      };
      state.candles[activeWarId] = state.candles[activeWarId] || [];
      state.candles[activeWarId].unshift(candle);
      save(state);
      closeModal();
      render();
      toast(`🕯 נר הודלק לזכר ${name}`);
      // Clear form
      $('#nmCandName').value = '';
      $('#nmCandRelation').value = '';
      $('#nmCandNote').value = '';
      // Scroll to the war section
      setTimeout(() => $(`#war-${activeWarId}`)?.scrollIntoView({ behavior:'smooth', block:'start' }), 200);
    });

    $('#nmStoryConfirm')?.addEventListener('click', () => {
      const name = $('#nmStoryName').value.trim();
      const text = $('#nmStoryText').value.trim();
      if (!name || !text){ toast('הזן שם וסיפור'); return; }
      const story = {
        name,
        by: $('#nmStoryBy').value.trim() || 'אנונימי',
        text,
        at: Date.now()
      };
      state.stories[activeWarId] = state.stories[activeWarId] || [];
      state.stories[activeWarId].unshift(story);
      save(state);
      closeModal();
      render();
      toast(`📖 הסיפור נוסף לזיכרון`);
      $('#nmStoryName').value = '';
      $('#nmStoryBy').value = '';
      $('#nmStoryText').value = '';
      setTimeout(() => $(`#war-${activeWarId}`)?.scrollIntoView({ behavior:'smooth', block:'start' }), 200);
    });
  }

  /* ─── Init ──────────────────────────────────────── */
  function init(){
    render();
    bindTabs();
    bindActions();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
