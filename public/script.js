// ====== מרכז התפילה — scripts ======

/* ---------- storage helpers ---------- */
const LS = {
  get(k, f) { try { const v = localStorage.getItem(k); return v == null ? f : JSON.parse(v); } catch { return f; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

/* ---------- anon helpers ---------- */
const ANON_FIRST = ['אברהם', 'יצחק', 'יעקב', 'משה', 'דוד', 'שלמה', 'מרדכי', 'יוסף', 'שרה', 'רבקה', 'רחל', 'לאה', 'אסתר', 'מרים', 'חנה', 'רות', 'דבורה', 'יהודית'];
function anonName(firstName, motherName, gender) {
  if (firstName && motherName) return `${firstName} ${gender === 'אישה' ? 'בת' : 'בן'} ${motherName}`;
  return 'פלוני בן פלונית';
}
function randomAnon(cat) {
  const f = ANON_FIRST[Math.floor(Math.random() * ANON_FIRST.length)];
  const m = ANON_FIRST[Math.floor(Math.random() * ANON_FIRST.length)];
  const connective = ['אברהם','יצחק','יעקב','משה','דוד','שלמה','מרדכי','יוסף'].includes(f) ? 'בן' : 'בת';
  return `${f} ${connective} ${m}`;
}

/* ---------- STATE ---------- */
const DEFAULT_USER = null;
const STATE = {
  user: LS.get('pc_user', DEFAULT_USER),
  prayers: LS.get('pc_prayers', null),
  prayedLog: LS.get('pc_prayed_log', {}),
  mine: LS.get('pc_mine', []),
  praying: LS.get('pc_praying', []),
  notifications: LS.get('pc_notifs', null),
  reported: LS.get('pc_reported', []),
  prayedBy: LS.get('pc_prayed_by', {}),
  replies: LS.get('pc_replies', {})
};

function persist() {
  LS.set('pc_user', STATE.user);
  LS.set('pc_prayers', STATE.prayers);
  LS.set('pc_prayed_log', STATE.prayedLog);
  LS.set('pc_mine', STATE.mine);
  LS.set('pc_praying', STATE.praying);
  LS.set('pc_notifs', STATE.notifications);
  LS.set('pc_reported', STATE.reported);
  LS.set('pc_prayed_by', STATE.prayedBy);
  LS.set('pc_replies', STATE.replies);
}

/* ---------- seed demo data ---------- */
if (!STATE.prayers) {
  const now = Date.now();
  const DAY = 86400000;
  STATE.prayers = [
    { id: 'p1', name: 'יצחק בן שרה', cat: 'רפואה', gender: 'גבר',
      text: 'מבקש תפילה לרפואה שלמה, לחיזוק הגוף והנפש ולישועה קרובה בעזרת ה׳.',
      created: now - 4 * 60 * 1000, count: 128, status: 'פעילה' },
    { id: 'p2', name: 'רבקה בת מרים', cat: 'פרנסה', gender: 'אישה',
      text: 'מבקשת תפילה לפתיחת שערי פרנסה טובה, שפע, יציבות וברכה בבית.',
      created: now - 12 * 60 * 1000, count: 54, status: 'פעילה' },
    { id: 'p3', name: 'דניאל בן חנה', cat: 'זוגיות', gender: 'גבר',
      text: 'מבקש תפילה לזיווג טוב, ראוי ומשמח, בדרך של חסד ורחמים.',
      created: now - 27 * 60 * 1000, count: 19, status: 'פעילה' },
    { id: 'p4', name: 'לאה בת רחל', cat: 'שלום בית', gender: 'אישה',
      text: 'מבקשת תפילה לשלום בית, לרוך, לסבלנות ולאהבה מחודשת.',
      created: now - 41 * 60 * 1000, count: 73, status: 'המצב השתפר' },
    { id: 'p5', name: 'פלוני בן פלונית', cat: 'הודיה',
      text: 'תודה על הטוב. מבקשים להתפלל בזכות על המשך שפע וברכה לכל הבית.',
      created: now - 60 * 60 * 1000, count: 212, status: 'תודה' },
    { id: 'p6', name: 'שרה בת אסתר', cat: 'רפואה', gender: 'אישה',
      text: 'תפילה לרפואת ילד חולה — שיקבל כוחות, שמחה ובריאות איתנה במהרה.',
      created: now - 2 * 60 * 60 * 1000, count: 341, status: 'פעילה' },
    { id: 'p7', name: 'מרדכי בן רבקה', cat: 'תעסוקה', gender: 'גבר',
      text: 'מבקש תפילה למצוא עבודה משמעותית שתביא פרנסה וסיפוק.',
      created: now - 3 * 60 * 60 * 1000, count: 38, status: 'פעילה' },
    { id: 'p8', name: 'חנה בת לאה', cat: 'ילדים ופוריות', gender: 'אישה',
      text: 'מבקשת תפילה לפקידת זרע של קיימא, בריא ושלם, בשמחה ובאהבה.',
      created: now - 5 * 60 * 60 * 1000, count: 167, status: 'פעילה' },
    { id: 'p9', name: 'יוסף בן רות', cat: 'הצלחה', gender: 'גבר',
      text: 'בקשה להצלחה בבחינות קריטיות בשבוע הקרוב — שזכות התפילה תעמוד לי.',
      created: now - 7 * 60 * 60 * 1000, count: 91, status: 'פעילה' },
    { id: 'p10', name: 'דבורה בת מרים', cat: 'שלום בית', gender: 'אישה',
      text: 'מבקשת תפילה על שלום בית ומרפא לפגיעות שהתרחשו בבית.',
      created: now - DAY, count: 204, status: 'פעילה' }
  ];
}

if (!STATE.notifications) {
  STATE.notifications = [
    { id: 'n1', type: 'prayed', text: '12 אנשים התפללו על הבקשה שלך לרפואה', time: 'לפני 5 דק׳', read: false, icon: '🕯' },
    { id: 'n2', type: 'remind', text: 'זכרת להתפלל היום? מחכות לך 3 בקשות', time: 'לפני שעה', read: false, icon: '🙏' },
    { id: 'n3', type: 'status', text: 'סטטוס עודכן: "המצב השתפר" בבקשה שהתפללת עליה', time: 'לפני שעתיים', read: false, icon: '✦' },
    { id: 'n4', type: 'bond', text: 'נוצר חיבור רוחני הדדי · אתם מתפללים זה על זה', time: 'אתמול', read: true, icon: '✧' }
  ];
}

/* ---------- admin overrides ---------- */
const verseTextEl = document.getElementById('dailyVerseText');
const verseSourceEl = document.getElementById('dailyVerseSource');
const aboutTitleEl = document.getElementById('aboutTitle');
const aboutTextEl = document.getElementById('aboutText');
const savedVerseText = localStorage.getItem('pc_verse_text');
const savedVerseSource = localStorage.getItem('pc_verse_source');
const savedAboutTitle = localStorage.getItem('pc_about_title');
const savedAboutText = localStorage.getItem('pc_about_text');
if (savedVerseText && verseTextEl) verseTextEl.textContent = savedVerseText;
if (savedVerseSource && verseSourceEl) verseSourceEl.textContent = savedVerseSource;
if (savedAboutTitle && aboutTitleEl) aboutTitleEl.textContent = savedAboutTitle;
if (savedAboutText && aboutTextEl) aboutTextEl.textContent = savedAboutText;

const verses = [
  { text: 'ה׳ קרוב לכל קוראיו, לכל אשר יקראוהו באמת', source: 'תהילים קמ״ה, י״ח' },
  { text: 'שפכי כמים לבך נוכח פני ה׳', source: 'איכה ב׳, י״ט' },
  { text: 'ממעמקים קראתיך ה׳', source: 'תהילים ק״ל, א׳' },
  { text: 'תפלה לעני כי יעטף ולפני ה׳ ישפך שיחו', source: 'תהילים ק״ב, א׳' },
  { text: 'הודו לה׳ כי טוב כי לעולם חסדו', source: 'תהילים קל״ו, א׳' }
];
if (!savedVerseText && verseTextEl && verseSourceEl) {
  const picked = verses[Math.floor(Math.random() * verses.length)];
  verseTextEl.textContent = picked.text;
  verseSourceEl.textContent = picked.source;
}

/* ---------- category messages ---------- */
const categoryMessages = {
  'רפואה': ['התפילה שלך עלתה. יהי רצון שתבוא רפואה שלמה במהרה.', 'אין תפילה שאובדת. האור כבר נוגע במקום שצריך ריפוי.'],
  'פרנסה': ['התפילה שלך נשלחה. שערי שפע נפתחים בדרכם.', 'האור כבר פועל. הדרך מתבהרת צעד אחר צעד.'],
  'זוגיות': ['התפילה שלך עלתה. הלב נפתח למה שמיועד לך.', 'האור כבר מקרב בין נשמות.'],
  'שלום בית': ['התפילה שלך נשלחה. יהי רצון שתשרה שלווה בביתך.', 'האור נכנס למקומות של מתח ומביא רוך.'],
  'תעסוקה': ['התפילה שלך עלתה. דלתות נפתחות בדרכן.', 'המשך לצעוד. הברכה בדרך.'],
  'ילדים ופוריות': ['התפילה שלך נמסרה. יהי רצון שתתמלא בשמחה של חיים חדשים.', 'האור פועל במקומות הנסתרים, גם אם אינך רואה עדיין.'],
  'הצלחה': ['התפילה שלך עלתה. דלתות נפתחות בדרכן.', 'אין מאמץ אמיתי שמתבזבז. האור מלווה אותך.'],
  'הודיה': ['התפילה שלך נשלחה. תודה פותחת שערים של שפע.', 'הלב שמודה כבר מחובר לאור.'],
  'כללי': ['התפילה שלך נשלחה. אין תפילה שאובדת.', 'הקול שלך נשמע, והאור ממשיך מכאן.']
};

/* ---------- utility: toast ---------- */
const toast = document.getElementById('toast');
function ping(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(ping._t);
  ping._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---------- utility: time ago ---------- */
function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'כעת';
  if (mins < 60) return `לפני ${mins} דק׳`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `לפני ${hrs === 1 ? 'שעה' : hrs === 2 ? 'שעתיים' : hrs + ' שעות'}`;
  const days = Math.floor(hrs / 24);
  return `לפני ${days === 1 ? 'יום' : days + ' ימים'}`;
}

function daysLeft(created) {
  const diff = Math.max(0, Math.ceil((created + 30 * 86400000 - Date.now()) / 86400000));
  return diff;
}

function shake(el) {
  if (!el) return;
  el.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }],
    { duration: 360, easing: 'ease-out' }
  );
  el.focus?.();
}

/* ---------- render prayer card ---------- */
function prayerCardHTML(p) {
  const left = daysLeft(p.created);
  const expiryClass = left <= 7 ? 'warn' : '';
  const status = p.status && p.status !== 'פעילה' ? `<span class="status-badge status-${p.status.split(' ')[0]}">${p.status}</span>` : '';
  const mutual = p.mutual ? `<span class="mutual-mark">✧ חיבור הדדי</span>` : '';
  const prayed = STATE.prayedLog[p.id];
  const btnLabel = prayed ? 'הצטרפת לתפילה ✓' : 'להתפלל 🙏';
  const btnDisabled = prayed ? 'disabled' : '';
  const ago = timeAgo(p.created);
  return `
    <article class="prayer-card" data-cat="${p.cat}" data-id="${p.id}">
      <div class="expiry-badge ${expiryClass}" title="תוקף הבקשה">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        ${left} ימים
      </div>
      <div class="prayer-head">
        <div class="small-candle"><div class="small-flame"></div></div>
        <div>
          <h3>${p.name}</h3>
          <div class="cat">${p.cat}</div>
          ${status}${mutual}
        </div>
        <div class="time-ago">${ago}</div>
      </div>
      <p>${p.text}</p>
      <div class="gentle-line">כל תפילה שנשלחת – מגיעה</div>
      <div class="prayer-footer">
        <span class="count"><strong>${p.count}</strong> התפללו</span>
        <div class="actions">
          <button class="btn btn-primary small pray-btn" ${btnDisabled}>${btnLabel}</button>
          <button class="btn btn-secondary small report-btn">דווח</button>
        </div>
      </div>
    </article>`;
}

/* ---------- render feed ---------- */
const feedGrid = document.getElementById('feedGrid');
const feedEmpty = document.getElementById('feedEmpty');
let feedMode = 'all', feedFilter = 'all';

function renderFeed() {
  if (!feedGrid) return;
  let list = [...STATE.prayers].filter(p => !STATE.reported.includes(p.id));
  if (feedMode === 'match' && STATE.user) {
    const userCat = STATE.user.favCat;
    const userGender = STATE.user.gender;
    list = list.filter(p => (userCat && p.cat === userCat) || (userGender && p.gender === userGender));
    if (list.length === 0) list = STATE.prayers.slice(0, 6);
  }
  if (feedFilter !== 'all') list = list.filter(p => p.cat === feedFilter);
  list.sort((a, b) => b.created - a.created);
  feedGrid.innerHTML = list.map(prayerCardHTML).join('');
  feedEmpty.classList.toggle('hidden', list.length > 0);
  wireCardActions(feedGrid);
}

/* ---------- feed tabs + chips ---------- */
document.querySelectorAll('.feed-tab[data-feed]').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.feed-tab[data-feed]').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    feedMode = t.dataset.feed;
    renderFeed();
    if (feedMode === 'match' && !STATE.user) ping('הצג פיד מותאם · נסה להירשם כדי לקבל בקשות שמדויקות עבורך');
  });
});
document.querySelectorAll('.chip[data-filter]').forEach(c => {
  c.addEventListener('click', () => {
    document.querySelectorAll('.chip[data-filter]').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    feedFilter = c.dataset.filter;
    renderFeed();
  });
});

/* ---------- pray + report handlers ---------- */
function wireCardActions(root) {
  root.querySelectorAll('.pray-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.prayer-card');
      const id = card?.dataset.id;
      const p = STATE.prayers.find(x => x.id === id);
      if (!p || STATE.prayedLog[id]) return;
      p.count += 1;
      STATE.prayedLog[id] = Date.now();
      if (!STATE.praying.includes(id)) STATE.praying.push(id);
      // Record the blesser (who prayed) so the owner can see & reply
      if (STATE.user && STATE.user.mode !== 'guest') {
        const blesserName = anonName(STATE.user.firstName, STATE.user.motherName, STATE.user.gender);
        const community = STATE.user.community || 'אנונימי';
        STATE.prayedBy[id] = STATE.prayedBy[id] || [];
        const existing = STATE.prayedBy[id].find(b => b.name === blesserName);
        if (existing) {
          existing.times += 1;
          existing.at = Date.now();
        } else {
          STATE.prayedBy[id].push({
            key: `${id}_self_${Date.now()}`,
            name: blesserName,
            community,
            at: Date.now(),
            times: 1
          });
        }
      }
      persist();
      btn.disabled = true;
      btn.textContent = 'הצטרפת לתפילה ✓';
      btn.style.opacity = '.7';
      const strong = card.querySelector('.count strong');
      if (strong) strong.textContent = String(p.count);
      // animated spark
      const spark = document.createElement('span');
      Object.assign(spark.style, {
        position: 'absolute', right: '50%', top: '50%',
        width: '8px', height: '8px', borderRadius: '50%',
        background: 'radial-gradient(circle,#ffeca3,#f6c453)',
        boxShadow: '0 0 22px rgba(246,196,83,.8)',
        transform: 'translate(50%,-50%)', pointerEvents: 'none'
      });
      card.style.position = 'relative';
      card.appendChild(spark);
      spark.animate(
        [{ transform: 'translate(50%,-50%) scale(.5)', opacity: 1 }, { transform: 'translate(50%,-260%) scale(.3)', opacity: 0 }],
        { duration: 1200, easing: 'ease-out' }
      ).onfinish = () => spark.remove();
      pushNotif({ type: 'prayed', icon: '🕯', text: `התפללת על ${p.name} (${p.cat})`, time: 'כעת' });
      // If this is the current user's own prayer, simulate the owner-side SMS/email notification.
      if (STATE.mine.includes(p.id) && STATE.user && STATE.user.mode === 'registered') {
        const channels = [];
        if (STATE.user.notifyEmail && STATE.user.email) channels.push('מייל');
        if (STATE.user.notifySms && STATE.user.phone) channels.push('SMS');
        if (channels.length > 0) {
          pushNotif({
            type: 'inbound',
            icon: '✦',
            text: `בירכו אותך! עדכון נשלח אליך ב־${channels.join(' + ')}`,
            time: 'כעת'
          });
        }
      }
      ping('תפילתך הצטרפה · נזקפה לזכות הגדולה');
      renderMe();
    });
  });
  root.querySelectorAll('.report-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.prayer-card');
      const id = card?.dataset.id;
      if (!id) return;
      if (!STATE.reported.includes(id)) STATE.reported.push(id);
      persist();
      card.style.transition = 'opacity .4s ease, transform .4s ease';
      card.style.opacity = '0';
      card.style.transform = 'scale(.96)';
      setTimeout(() => { renderFeed(); renderMe(); }, 400);
      ping('הדיווח התקבל · הבקשה הוסרה מהפיד שלך ותיבדק ע״י צוות המערכת');
    });
  });
}

/* ---------- create prayer ---------- */
const prayerText = document.getElementById('prayerText');
const charCount = document.getElementById('charCount');
const submitPrayer = document.getElementById('submitPrayer');
const submitExperience = document.getElementById('submitExperience');
const sentMessage = document.getElementById('sentMessage');
const categorySelect = document.getElementById('category');
const agreeBox = document.getElementById('agreeBox');
const anonNameEl = document.getElementById('anonName');

if (prayerText) prayerText.addEventListener('input', () => charCount.textContent = prayerText.value.length);

if (submitPrayer) {
  submitPrayer.addEventListener('click', () => {
    if (!prayerText.value.trim()) return shake(prayerText);
    if (!agreeBox.checked) return shake(agreeBox.closest('.agree'));
    if (!STATE.user || STATE.user.mode !== 'registered') {
      openAuth('signup');
      ping('כדי לבקש תפילה יש להירשם · במצב אורח ניתן להתפלל על אחרים בלבד');
      return;
    }
    const cat = categorySelect.value;
    const name = anonName(STATE.user.firstName, STATE.user.motherName, STATE.user.gender);
    const id = 'u_' + Date.now();
    const newP = {
      id, name, cat, gender: STATE.user.gender,
      text: prayerText.value.trim(),
      created: Date.now(), count: 0, status: 'פעילה', owner: true
    };
    STATE.prayers.unshift(newP);
    if (!STATE.mine.includes(id)) STATE.mine.push(id);
    persist();
    const messages = categoryMessages[cat] || categoryMessages['כללי'];
    sentMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
    submitExperience.classList.remove('hidden');
    submitPrayer.disabled = true;
    submitPrayer.style.opacity = '.5';
    submitPrayer.textContent = 'נשלח ✦';
    submitExperience.scrollIntoView({ behavior: 'smooth', block: 'center' });
    pushNotif({ type: 'status', icon: '✦', text: `הבקשה שלך (${cat}) פורסמה · תוקף 30 יום`, time: 'כעת' });
    renderFeed(); renderMe();
    setTimeout(() => {
      submitPrayer.disabled = false;
      submitPrayer.style.opacity = '';
      submitPrayer.innerHTML = 'שלח תפילה <span class="btn-ico" aria-hidden="true">✦</span>';
      submitExperience.classList.add('hidden');
      prayerText.value = '';
      charCount.textContent = '0';
      agreeBox.checked = false;
    }, 6000);
  });
}

function refreshAnonBadge() {
  if (!anonNameEl) return;
  anonNameEl.textContent = STATE.user && STATE.user.mode === 'registered'
    ? anonName(STATE.user.firstName, STATE.user.motherName, STATE.user.gender)
    : 'פלוני בן פלונית';
}

/* ---------- live counters ---------- */
function animateNumber(el, min, max, interval) {
  if (!el) return;
  setInterval(() => {
    const current = Number(String(el.textContent).replace(/,/g, '')) || min;
    const next = Math.max(min, Math.min(max, current + (Math.random() > 0.5 ? 1 : -1)));
    el.textContent = String(next).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }, interval);
}
animateNumber(document.getElementById('liveUsers'), 118, 156, 2600);
animateNumber(document.getElementById('livePrayers'), 31, 62, 3200);
animateNumber(document.getElementById('weekPrayers'), 2100, 2300, 4800);

/* ---------- hero ticker rotation ---------- */
const tickerItems = [
  { text: 'פלוני בן פלונית ביקש תפילה לרפואה', time: 'כעת' },
  { text: '18 מתפללים הצטרפו לבקשה לפרנסה', time: 'לפני דקה' },
  { text: 'סטטוס עודכן: "הבקשה נענתה"', time: 'לפני 3 דק׳' },
  { text: 'חיבור רוחני הדדי נוצר בין שני מתפללים', time: 'לפני 6 דק׳' },
  { text: 'בקשה חדשה לשלום בית נרשמה כעת', time: 'כעת' },
  { text: 'דבורה בת מרים ביקשה תפילה לזיווג', time: 'לפני 9 דק׳' },
  { text: '42 תפילות נאמרו על בקשה לילדים ופוריות', time: 'לפני 11 דק׳' },
  { text: '"תודה לכל מי שהתפלל" — סטטוס חדש', time: 'לפני 14 דק׳' }
];
const tickerList = document.getElementById('dashTicker');
let tickerIdx = 0;
function rotateTicker() {
  if (!tickerList) return;
  const li = document.createElement('li');
  const item = tickerItems[tickerIdx % tickerItems.length];
  tickerIdx++;
  li.innerHTML = `<span class="t-dot"></span><span class="t-text">${item.text}</span><span class="t-time">${item.time}</span>`;
  li.style.opacity = '0';
  li.style.transform = 'translateY(-6px)';
  li.style.transition = 'opacity .35s ease, transform .35s ease';
  tickerList.insertBefore(li, tickerList.firstChild);
  requestAnimationFrame(() => { li.style.opacity = '1'; li.style.transform = 'none'; });
  while (tickerList.children.length > 4) tickerList.removeChild(tickerList.lastChild);
}
setInterval(rotateTicker, 4200);

/* ---------- personal area ---------- */
const mineGrid = document.getElementById('mineGrid');
const prayingGrid = document.getElementById('prayingGrid');
const bondsWrap = document.getElementById('bondsWrap');
const meGuest = document.getElementById('meGuest');
const meContent = document.getElementById('meContent');
let meMode = 'mine';

document.querySelectorAll('.feed-tab[data-me]').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.feed-tab[data-me]').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    meMode = t.dataset.me;
    renderMe();
  });
});

function minePrayerCard(p) {
  const left = daysLeft(p.created);
  const status = `<span class="status-badge status-${p.status.split(' ')[0]}">${p.status}</span>`;
  return `
    <article class="prayer-card" data-id="${p.id}">
      <div class="expiry-badge ${left <= 7 ? 'warn' : ''}">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        ${left} ימים
      </div>
      <div class="prayer-head">
        <div class="small-candle"><div class="small-flame"></div></div>
        <div>
          <h3>${p.name}</h3>
          <div class="cat">${p.cat}</div>
          ${status}
        </div>
        <div class="time-ago">${timeAgo(p.created)}</div>
      </div>
      <p>${p.text}</p>
      <div class="gentle-line">כל תפילה שנשלחת – מגיעה</div>
      <div class="prayer-footer">
        <span class="count"><strong>${p.count}</strong> התפללו</span>
        <div class="mine-card-actions">
          <button class="who-prayed-btn who-prayed-open">✦ מי התפלל (${p.count})</button>
          <button class="btn btn-primary small update-status-btn">עדכן סטטוס</button>
          <button class="btn btn-secondary small renew-btn">חדש תוקף</button>
        </div>
      </div>
    </article>`;
}

function prayingPrayerCard(p) {
  const last = STATE.prayedLog[p.id];
  const lastStr = last ? timeAgo(last) : 'טרם';
  return `
    <article class="prayer-card" data-id="${p.id}">
      <div class="prayer-head">
        <div class="small-candle"><div class="small-flame"></div></div>
        <div>
          <h3>${p.name}</h3>
          <div class="cat">${p.cat}</div>
        </div>
        <div class="time-ago">תפילה אחרונה · ${lastStr}</div>
      </div>
      <p>${p.text}</p>
      <div class="gentle-line">כל תפילה שנשלחת – מגיעה</div>
      <div class="prayer-footer">
        <span class="count"><strong>${p.count}</strong> התפללו</span>
        <div class="mine-card-actions">
          <button class="btn btn-primary small mark-prayed-btn">סמן שהתפללתי</button>
          <button class="btn btn-secondary small give-up-btn">ויתור</button>
        </div>
      </div>
    </article>`;
}

function bondHTML(b) {
  return `
    <div class="bond-card ${b.mutual ? 'mutual' : ''}">
      <h4>${b.name}</h4>
      <div class="bond-count">התפללת עבורם · ${b.count} פעמים</div>
      ${b.mutual ? '<span class="mutual-mark">✧ חיבור רוחני הדדי</span>' : '<span class="status-badge status-פעילה">חיבור חד־צדדי</span>'}
    </div>`;
}

function renderMe() {
  if (!mineGrid) return;
  const isGuest = !STATE.user || STATE.user.mode !== 'registered';
  const showGuestMine = meMode === 'mine' && isGuest;
  meGuest.classList.toggle('hidden', !showGuestMine);
  meContent.classList.toggle('hidden', showGuestMine);
  mineGrid.classList.toggle('hidden', meMode !== 'mine');
  prayingGrid.classList.toggle('hidden', meMode !== 'praying');
  bondsWrap.classList.toggle('hidden', meMode !== 'bonds');

  if (meMode === 'mine') {
    const list = STATE.prayers.filter(p => STATE.mine.includes(p.id));
    if (list.length === 0 && !isGuest) {
      mineGrid.innerHTML = `<div class="feed-empty" style="grid-column:1/-1">עדיין אין לך בקשות פעילות. <a href="#create" style="color:var(--gold-deep);font-weight:700">כתוב את בקשת הלב שלך</a></div>`;
    } else {
      mineGrid.innerHTML = list.map(minePrayerCard).join('');
      mineGrid.querySelectorAll('.update-status-btn').forEach(b =>
        b.addEventListener('click', () => openStatusModal(b.closest('.prayer-card').dataset.id))
      );
      mineGrid.querySelectorAll('.renew-btn').forEach(b =>
        b.addEventListener('click', () => {
          const id = b.closest('.prayer-card').dataset.id;
          const p = STATE.prayers.find(x => x.id === id);
          if (p) { p.created = Date.now(); persist(); renderMe(); ping('הבקשה חודשה ל־30 יום נוספים'); }
        })
      );
      mineGrid.querySelectorAll('.who-prayed-open').forEach(b =>
        b.addEventListener('click', () => openPrayedByModal(b.closest('.prayer-card').dataset.id))
      );
    }
  } else if (meMode === 'praying') {
    const list = STATE.prayers.filter(p => STATE.praying.includes(p.id));
    if (list.length === 0) {
      prayingGrid.innerHTML = `<div class="feed-empty" style="grid-column:1/-1">עדיין לא התפללת על בקשה. <a href="#feed" style="color:var(--gold-deep);font-weight:700">התחל להתפלל על אחרים</a></div>`;
    } else {
      prayingGrid.innerHTML = list.map(prayingPrayerCard).join('');
      prayingGrid.querySelectorAll('.mark-prayed-btn').forEach(b =>
        b.addEventListener('click', () => {
          const id = b.closest('.prayer-card').dataset.id;
          STATE.prayedLog[id] = Date.now();
          const p = STATE.prayers.find(x => x.id === id);
          if (p) p.count += 1;
          persist(); renderMe(); renderFeed();
          ping('סומן שהתפללת · תודה לך');
        })
      );
      prayingGrid.querySelectorAll('.give-up-btn').forEach(b =>
        b.addEventListener('click', () => {
          const id = b.closest('.prayer-card').dataset.id;
          STATE.praying = STATE.praying.filter(x => x !== id);
          persist(); renderMe();
          ping('הוסרה מרשימת "אני מתפלל על"');
        })
      );
    }
  } else if (meMode === 'bonds') {
    const bonds = [
      { name: 'פלוני בן פלונית', count: 12, mutual: true },
      { name: 'יוסף בן רחל', count: 7, mutual: true },
      { name: 'שרה בת לאה', count: 4, mutual: false },
      { name: 'דוד בן חנה', count: 3, mutual: false },
      { name: 'מרים בת דבורה', count: 2, mutual: true },
      { name: 'פלוני בן פלונית', count: 1, mutual: false }
    ];
    bondsWrap.innerHTML = bonds.map(bondHTML).join('');
  }
}

/* ---------- status modal ---------- */
const statusModal = document.getElementById('statusModal');
let statusTarget = null;
function openStatusModal(id) { statusTarget = id; openModal(statusModal); }
statusModal.querySelectorAll('.status-opt').forEach(b =>
  b.addEventListener('click', () => {
    const p = STATE.prayers.find(x => x.id === statusTarget);
    if (!p) return;
    p.status = b.dataset.status;
    persist(); renderMe(); renderFeed(); closeModals();
    pushNotif({ type: 'status', icon: '✦', text: `הסטטוס של הבקשה שלך עודכן ל״${p.status}״`, time: 'כעת' });
    notifyBlessers(p, `עודכן סטטוס: "${p.status}"`);
    ping('הסטטוס עודכן · נשלחה התראה לכל מי שהתפלל');
  })
);

/* ---------- who-prayed modal (mock supporters for demo) ---------- */
const prayedByModal = document.getElementById('prayedByModal');
const prayedByBody = document.getElementById('prayedByBody');
const prayedByTitle = document.getElementById('prayedByTitle');
const replyPanel = document.getElementById('replyPanel');
const replyToName = document.getElementById('replyToName');
const replyCancel = document.getElementById('replyCancel');
let replyPrayerId = null;
let replyBlesserKey = null;

function generateBlessers(p) {
  if (STATE.prayedBy[p.id]) return STATE.prayedBy[p.id];
  if (!p.count) { STATE.prayedBy[p.id] = []; persist(); return []; }
  const pool = [
    { name: 'יוסף בן רחל', community: 'ירושלים' },
    { name: 'שרה בת לאה', community: 'בני ברק' },
    { name: 'דוד בן חנה', community: 'צפת' },
    { name: 'מרים בת דבורה', community: 'בית שמש' },
    { name: 'אליהו בן אסתר', community: 'פתח תקווה' },
    { name: 'רות בת נעמי', community: 'אשדוד' },
    { name: 'בנימין בן שרה', community: 'תל אביב' },
    { name: 'חנה בת רבקה', community: 'נתיבות' },
    { name: 'יהודה בן לאה', community: 'חיפה' },
    { name: 'תמר בת יהודית', community: 'מודיעין' },
    { name: 'משה בן דבורה', community: 'חולון' },
    { name: 'רחל בת שרה', community: 'ראשון לציון' },
    { name: 'פלוני בן פלונית', community: 'אנונימי' }
  ];
  const count = Math.min(Math.max(1, Math.floor((p.count || 0) / 8) + 2), pool.length);
  const picks = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  const now = Date.now();
  const list = picks.map((b, i) => ({
    key: `${p.id}_b${i}`,
    name: b.name,
    community: b.community,
    at: now - (i * 1000 * 60 * (15 + Math.floor(Math.random() * 180))),
    times: 1 + Math.floor(Math.random() * 4)
  }));
  STATE.prayedBy[p.id] = list;
  persist();
  return list;
}

function openPrayedByModal(id) {
  const p = STATE.prayers.find(x => x.id === id);
  if (!p) return;
  replyPrayerId = id;
  replyBlesserKey = null;
  replyPanel.classList.add('hidden');
  prayedByTitle.textContent = `המברכים עבור "${p.cat}" · ${p.count} התפללו`;
  const list = generateBlessers(p);
  if (list.length === 0) {
    prayedByBody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:22px;color:var(--muted)">עדיין לא התפללו על הבקשה הזו. כשמישהו יתפלל — הוא יופיע כאן.</td></tr>`;
    openModal(prayedByModal);
    return;
  }
  prayedByBody.innerHTML = list.map(b => {
    const rep = STATE.replies[b.key];
    const replyTxt = rep ? `<span class="prayed-by-last replied">✓ הושב: "${rep.text}"</span>` : `<span class="prayed-by-last">—</span>`;
    const btnClass = rep ? 'reply-row-btn done' : 'reply-row-btn';
    const btnLabel = rep ? 'שלח שוב' : 'השב';
    return `
      <tr data-key="${b.key}">
        <td>
          <div class="prayed-by-name">${b.name}</div>
          <div class="prayed-by-last">${b.community}</div>
        </td>
        <td><span class="prayed-by-count">🕯 ${b.times}× · ${timeAgo(b.at)}</span></td>
        <td>${replyTxt}</td>
        <td><button class="${btnClass} reply-row-open">${btnLabel}</button></td>
      </tr>`;
  }).join('');
  prayedByBody.querySelectorAll('.reply-row-open').forEach(btn =>
    btn.addEventListener('click', () => {
      const key = btn.closest('tr').dataset.key;
      const blesser = list.find(x => x.key === key);
      replyBlesserKey = key;
      replyToName.textContent = blesser?.name || '';
      replyPanel.classList.remove('hidden');
      replyPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    })
  );
  openModal(prayedByModal);
}

replyPanel.querySelectorAll('.reply-opt').forEach(b =>
  b.addEventListener('click', () => {
    if (!replyBlesserKey || !replyPrayerId) return;
    const text = b.dataset.reply;
    STATE.replies[replyBlesserKey] = { text, at: Date.now() };
    persist();
    const list = STATE.prayedBy[replyPrayerId] || [];
    const blesser = list.find(x => x.key === replyBlesserKey);
    pushNotif({ type: 'reply', icon: '✉', text: `השבת ל־${blesser?.name || 'מברך'}: "${text}"`, time: 'כעת' });
    ping(`התגובה נשלחה ל־${blesser?.name || 'מברך'}`);
    openPrayedByModal(replyPrayerId);
  })
);
replyCancel?.addEventListener('click', () => {
  replyPanel.classList.add('hidden');
  replyBlesserKey = null;
});

/* ---------- notify blessers (email/SMS simulation) ---------- */
function notifyBlessers(p, summary) {
  const list = STATE.prayedBy[p.id];
  if (!list || list.length === 0) return;
  if (!STATE.user) return;
  const channels = [];
  if (STATE.user.notifyEmail && STATE.user.email) channels.push('מייל');
  if (STATE.user.notifySms && STATE.user.phone) channels.push('SMS');
  if (channels.length === 0) return;
  pushNotif({
    type: 'outbound',
    icon: '✉',
    text: `נשלחה התראה (${channels.join(' + ')}) ל־${list.length} מברכים — ${summary}`,
    time: 'כעת'
  });
}

/* ---------- notifications ---------- */
const notifBtn = document.getElementById('notifBtn');
const notifBadge = document.getElementById('notifBadge');
const notifPanel = document.getElementById('notifPanel');
const notifList = document.getElementById('notifList');

function pushNotif(n) {
  STATE.notifications.unshift({ id: 'n_' + Date.now(), read: false, time: n.time || 'כעת', ...n });
  if (STATE.notifications.length > 15) STATE.notifications.pop();
  persist(); renderNotifs();
}

function renderNotifs() {
  const unread = STATE.notifications.filter(n => !n.read).length;
  notifBadge.textContent = unread ? String(unread) : '';
  notifBadge.classList.toggle('zero', unread === 0);
  notifList.innerHTML = STATE.notifications.map(n => `
    <li class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
      <span class="notif-icon">${n.icon || '✦'}</span>
      <div>
        <div class="notif-body">${n.text}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </li>
  `).join('');
  notifList.querySelectorAll('.notif-item').forEach(li =>
    li.addEventListener('click', () => {
      const n = STATE.notifications.find(x => x.id === li.dataset.id);
      if (n) { n.read = true; persist(); renderNotifs(); }
    })
  );
}

notifBtn?.addEventListener('click', e => {
  e.stopPropagation();
  const open = !notifPanel.hasAttribute('hidden');
  closeAllPanels();
  if (!open) notifPanel.removeAttribute('hidden');
});
document.getElementById('markAllRead')?.addEventListener('click', () => {
  STATE.notifications.forEach(n => n.read = true);
  persist(); renderNotifs();
});
document.addEventListener('click', e => {
  if (!notifPanel.contains(e.target) && e.target !== notifBtn) closeAllPanels();
});
function closeAllPanels() { notifPanel.setAttribute('hidden', ''); }

/* ---------- auth modal ---------- */
const authModal = document.getElementById('authModal');
const userBtn = document.getElementById('userBtn');
const userAvatar = document.getElementById('userAvatar');
const userLabel = document.getElementById('userLabel');
const authSubmit = document.getElementById('authSubmit');
const authTitle = document.getElementById('authTitle');
const authToggleBtn = document.getElementById('authToggleBtn');
const authToggleText = document.getElementById('authToggleText');
const authError = document.getElementById('authError');
const authFields = document.getElementById('authFields');
const authRegisteredOnly = document.querySelector('.auth-registered-only');
let authMode = 'signup';
let authAccountMode = 'registered';

document.querySelectorAll('.auth-mode').forEach(m => {
  m.addEventListener('click', () => {
    document.querySelectorAll('.auth-mode').forEach(x => x.classList.remove('active'));
    m.classList.add('active');
    authAccountMode = m.dataset.mode;
    updateAuthUI();
  });
});

function updateAuthUI() {
  const googleLabel = document.getElementById('googleAuthLabel');
  const googleBtn = document.getElementById('googleAuth');
  const topDivider = document.querySelector('.auth-top-divider');
  if (authAccountMode === 'guest') {
    authTitle.textContent = 'כניסה כאורח';
    authRegisteredOnly.style.display = 'none';
    authSubmit.textContent = 'המשך כאורח';
    authToggleText.textContent = 'רוצה גם לבקש תפילה?';
    authToggleBtn.textContent = 'עבור להרשמה';
    if (googleBtn) googleBtn.style.display = 'none';
    if (topDivider) topDivider.style.display = 'none';
  } else {
    authTitle.textContent = authMode === 'signup' ? 'הרשמה' : 'התחברות';
    authRegisteredOnly.style.display = '';
    authSubmit.textContent = authMode === 'signup' ? 'הירשם' : 'התחבר';
    authToggleText.textContent = authMode === 'signup' ? 'כבר יש לך חשבון?' : 'אין לך חשבון?';
    authToggleBtn.textContent = authMode === 'signup' ? 'התחבר' : 'הירשם';
    if (googleBtn) googleBtn.style.display = '';
    if (topDivider) topDivider.style.display = '';
    if (googleLabel) googleLabel.textContent = authMode === 'signup' ? 'הרשמה מהירה עם Google' : 'התחברות מהירה עם Google';
  }
  authError.textContent = '';
}

authToggleBtn?.addEventListener('click', () => {
  if (authAccountMode === 'guest') {
    authAccountMode = 'registered';
    document.querySelectorAll('.auth-mode').forEach(m => m.classList.toggle('active', m.dataset.mode === 'registered'));
  } else {
    authMode = authMode === 'signup' ? 'login' : 'signup';
  }
  updateAuthUI();
});

function openAuth(mode) {
  authMode = mode === 'login' ? 'login' : 'signup';
  authAccountMode = 'registered';
  document.querySelectorAll('.auth-mode').forEach(m => m.classList.toggle('active', m.dataset.mode === 'registered'));
  updateAuthUI();
  openModal(authModal);
}

userBtn?.addEventListener('click', () => {
  if (STATE.user) {
    if (confirm('להתנתק?')) { STATE.user = null; persist(); renderUser(); ping('התנתקת'); }
  } else openAuth('signup');
});

document.getElementById('openAuthSignup')?.addEventListener('click', () => openAuth('signup'));
document.getElementById('openAuthLogin')?.addEventListener('click', () => openAuth('login'));

authSubmit?.addEventListener('click', () => {
  const firstName = document.getElementById('authFirstName').value.trim();
  const motherName = document.getElementById('authMother').value.trim();
  const gender = document.getElementById('authGender').value;
  const community = document.getElementById('authCommunity').value;
  const identity = document.getElementById('authIdentity').value;
  if (!firstName || !motherName) {
    authError.textContent = 'יש למלא שם פרטי ושם האם';
    return;
  }
  if (authAccountMode === 'registered') {
    const email = document.getElementById('authEmail').value.trim();
    const pass = document.getElementById('authPass').value.trim();
    const phone = document.getElementById('authPhone').value.trim();
    const notifyEmail = document.getElementById('notifyEmail').checked;
    const notifySms = document.getElementById('notifySms').checked;
    if (!email || !pass) { authError.textContent = 'יש למלא אימייל וסיסמה'; return; }
    if (authMode === 'signup' && pass.length < 6) { authError.textContent = 'סיסמה קצרה מדי (לפחות 6 תווים)'; return; }
    if (notifySms && !phone) { authError.textContent = 'בחרת התראות SMS — אנא הזן מספר טלפון'; return; }
    STATE.user = {
      mode: 'registered',
      firstName, motherName, gender, community, identity,
      email, phone, notifyEmail, notifySms,
      favCat: null
    };
  } else {
    STATE.user = { mode: 'guest', firstName, motherName, gender, community, identity };
  }
  persist(); renderUser(); closeModals();
  refreshAnonBadge(); renderMe(); renderFeed();
  ping(authAccountMode === 'guest' ? 'שלום · המשכת כאורח' : 'ברוך הבא · חשבונך מוכן');
  pushNotif({ type: 'welcome', icon: '✦', text: `ברוך הבא, ${anonName(firstName, motherName, gender)}`, time: 'כעת' });
});

document.getElementById('googleAuth')?.addEventListener('click', () => {
  const firstName = document.getElementById('authFirstName').value.trim();
  const motherName = document.getElementById('authMother').value.trim();
  const gender = document.getElementById('authGender').value;
  if (!firstName || !motherName) {
    authError.textContent = 'לפני התחברות עם Google — יש למלא שם פרטי ושם האם (שם יהודי לתפילה)';
    return;
  }
  const existing = STATE.user && STATE.user.email?.includes('@gmail');
  STATE.user = {
    mode: 'registered',
    firstName, motherName, gender,
    email: (existing && STATE.user.email) || `${firstName.toLowerCase()}@gmail.com`,
    phone: STATE.user?.phone || '',
    notifyEmail: STATE.user?.notifyEmail ?? true,
    notifySms: STATE.user?.notifySms ?? false,
    provider: 'google',
    favCat: STATE.user?.favCat || null
  };
  persist(); renderUser(); closeModals();
  refreshAnonBadge(); renderMe(); renderFeed();
  ping('התחברת דרך Google · ברוך הבא');
  pushNotif({ type: 'welcome', icon: '✦', text: `התחברת בהצלחה דרך Google, ${anonName(firstName, motherName, gender)}`, time: 'כעת' });
});

function renderUser() {
  if (STATE.user) {
    userBtn.classList.add('logged');
    userAvatar.textContent = STATE.user.firstName.charAt(0);
    userLabel.textContent = STATE.user.firstName;
  } else {
    userBtn.classList.remove('logged');
    userAvatar.textContent = '?';
    userLabel.textContent = 'התחברות';
  }
}

/* ---------- modals ---------- */
function openModal(el) { el.removeAttribute('hidden'); document.body.style.overflow = 'hidden'; }
function closeModals() {
  document.querySelectorAll('.modal').forEach(m => m.setAttribute('hidden', ''));
  document.body.style.overflow = '';
}
document.addEventListener('click', e => {
  if (e.target.matches('[data-close]')) closeModals();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModals(); closeAllPanels(); } });

/* ---------- library ---------- */
const LIBRARY = [
  { cat: 'רפואה', title: 'מי שברך לחולים', preview: 'נוסח ברכת הרפואה לחולה — נאמר ברוב קהילות ישראל.',
    text: 'מי שברך אבותינו אברהם יצחק ויעקב, משה אהרן דוד ושלמה, הוא יברך וירפא את החולה (פלוני בן פלונית), הקדוש ברוך הוא ימלא רחמים עליו להחלימו ולרפאותו ולהחזיקו ולהחיותו, וישלח לו מהרה רפואה שלמה מן השמים, רפואת הנפש ורפואת הגוף, בתוך שאר חולי ישראל, השתא בעגלא ובזמן קריב, ונאמר אמן.' },
  { cat: 'הדרך', title: 'תפילת הדרך', preview: 'תפילה עתיקה שיוצאי הדרך אומרים לפני הנסיעה.',
    text: 'יהי רצון מלפניך ה׳ אלוקינו ואלוקי אבותינו, שתוליכנו לשלום, ותצעידנו לשלום, ותדריכנו לשלום, ותגיענו למחוז חפצנו לחיים ולשמחה ולשלום. ותצילנו מכף כל אויב ואורב וליסטים וחיות רעות בדרך, ומכל מיני פורעניות המתרגשות לבוא לעולם. ותשלח ברכה בכל מעשה ידינו, ותתננו לחן ולחסד ולרחמים בעיניך ובעיני כל רואינו. ותשמע קול תחנונינו. כי אתה שומע תפילת כל פה. ברוך אתה ה׳, שומע תפילה.' },
  { cat: 'פרנסה', title: 'תפילה לפרנסה', preview: 'בקשה לפתיחת שערי שפע וברכה בבית.',
    text: 'רבונו של עולם, פרנסני בכבוד ובנחת, ולא בצער ולא בביזוי, מידך המלאה והרחבה. תן לי פרנסתי בריווח ובכבוד כדי שאוכל לעבוד אותך באמת ולקיים מצוותיך בשמחה. ברכני במעשי ידי, ואל אצטרך לא לידי מתנת בשר ודם ולא לידי הלוואתם, אלא לידך המלאה הפתוחה הקדושה והרחבה.' },
  { cat: 'זוגיות', title: 'תפילה לזיווג', preview: 'בקשה לזיווג הגון בחסד וברחמים.',
    text: 'יהי רצון מלפניך ה׳ אלוקינו ואלוקי אבותינו, שתזמין לי זיווג הגון וראוי, מן השמים, מן המקור הקדוש, בחן ובחסד וברחמים. תקרב את שני הלבבות לבורא עולם, ותזכני לבנות בית נאמן בישראל, על יסודות של אמונה, אהבה ושלום.' },
  { cat: 'ילדים', title: 'תפילה לפקידת זרע', preview: 'בקשת זוגות לפקידת זרע של קיימא.',
    text: 'רבונו של עולם, אב הרחמים, פקוד אותנו בזרע של קיימא, בריא ושלם בגוף ובנפש. זכנו לגדל ילדים יראי שמים, אוהבי תורה ואוהבי בריות, לשמחתך ולשמחת כל הבית. זכור לנו זכות אבות ואמהות, ותפתח לנו שערים של חסד ורחמים.' },
  { cat: 'הודיה', title: 'מודה אני', preview: 'תפילה ראשונה עם היקיצה בבוקר.',
    text: 'מודה אני לפניך מלך חי וקיים, שהחזרת בי נשמתי בחמלה, רבה אמונתך.' }
];
const libraryGrid = document.getElementById('libraryGrid');
libraryGrid && (libraryGrid.innerHTML = LIBRARY.map((l, i) => `
  <article class="lib-card" data-i="${i}">
    <div class="lib-cat">${l.cat}</div>
    <h3>${l.title}</h3>
    <p>${l.preview}</p>
    <span class="lib-open">קרא את הנוסח ←</span>
  </article>
`).join(''));
const libraryModal = document.getElementById('libraryModal');
libraryGrid?.querySelectorAll('.lib-card').forEach(c =>
  c.addEventListener('click', () => {
    const l = LIBRARY[Number(c.dataset.i)];
    document.getElementById('libModalTag').textContent = l.cat;
    document.getElementById('libModalTitle').textContent = l.title;
    document.getElementById('libModalText').textContent = l.text;
    openModal(libraryModal);
  })
);

/* ---------- mobile nav ---------- */
const menuBtn = document.getElementById('menuBtn');
const nav = document.querySelector('.nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

/* ---------- contact form ---------- */
const contactSend = document.getElementById('contactSend');
const contactHelp = document.getElementById('contactHelp');
if (contactSend) {
  contactSend.addEventListener('click', () => {
    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmail');
    const msg = document.getElementById('contactMsg');
    if (!name.value.trim() || !email.value.trim() || !msg.value.trim()) {
      [name, email, msg].forEach(el => !el.value.trim() && shake(el));
      return;
    }
    contactHelp.textContent = 'תודה! ההודעה התקבלה — נחזור אליך בהקדם.';
    contactHelp.style.color = 'var(--green)';
    name.value = email.value = msg.value = '';
  });
}

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
  { threshold: 0.12 }
);
document.querySelectorAll('.card, .prayer-card, h2, .hero-dash').forEach(el => {
  el.classList.add('reveal'); io.observe(el);
});

/* ---------- init ---------- */
renderUser();
refreshAnonBadge();
renderFeed();
renderMe();
renderNotifs();
persist();

/* ================================================================
   ONBOARDING TOUR  (animated instructions for new visitors)
   ================================================================ */
(function initTour() {
  const overlay = document.getElementById('tourOverlay');
  const helpBtn = document.getElementById('helpBtn');
  if (!overlay || !helpBtn) return;

  const stage = document.getElementById('tourStage');
  const steps = Array.from(stage.querySelectorAll('.tour-step'));
  const totalSteps = steps.length;
  const dotsWrap = document.getElementById('tourDots');
  const progressBar = document.getElementById('tourProgress');
  const nextBtn = document.getElementById('tourNext');
  const prevBtn = document.getElementById('tourPrev');
  const skipBtn = document.getElementById('tourSkip');
  const closeBtn = document.getElementById('tourClose');
  const back = overlay.querySelector('.tour-back');

  let current = 0;
  const TOUR_KEY = 'pc_tour_seen_v1';

  // build dots
  for (let i = 0; i < totalSteps; i++) {
    const b = document.createElement('button');
    b.className = 'tour-dot';
    b.type = 'button';
    b.setAttribute('aria-label', `צעד ${i + 1} מתוך ${totalSteps}`);
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
  }
  const dots = Array.from(dotsWrap.children);

  function render() {
    steps.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.classList.toggle('done', i < current);
    });
    const pct = ((current + 1) / totalSteps) * 100;
    if (progressBar) progressBar.style.width = pct + '%';
    prevBtn.disabled = current === 0;
    nextBtn.textContent = current === totalSteps - 1 ? 'יאללה, מתחילים ✦' : 'הבא';
  }

  function goTo(i) {
    current = Math.max(0, Math.min(totalSteps - 1, i));
    render();
  }

  function open() {
    overlay.hidden = false;
    current = 0;
    render();
    document.body.style.overflow = 'hidden';
    // move focus into card for a11y
    setTimeout(() => closeBtn?.focus(), 100);
    helpBtn.classList.add('seen');
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    try { localStorage.setItem(TOUR_KEY, '1'); } catch {}
    helpBtn.classList.add('seen');
  }

  nextBtn.addEventListener('click', () => {
    if (current === totalSteps - 1) close();
    else goTo(current + 1);
  });
  prevBtn.addEventListener('click', () => goTo(current - 1));
  skipBtn.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  back.addEventListener('click', close);

  overlay.addEventListener('keydown', (e) => {
    if (overlay.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') goTo(current + 1); // RTL: left = next
    else if (e.key === 'ArrowRight') goTo(current - 1);
  });
  document.addEventListener('keydown', (e) => {
    if (!overlay.hidden && e.key === 'Escape') close();
  });

  helpBtn.addEventListener('click', open);

  // auto-open on first visit
  let seen = false;
  try { seen = !!localStorage.getItem(TOUR_KEY); } catch {}
  if (!seen) {
    // small delay so the page has a moment to render
    setTimeout(open, 650);
  } else {
    helpBtn.classList.add('seen');
  }
})();

/* ================================================================
   MICROPHONE DICTATION  (Web Speech API, Hebrew)
   ================================================================ */
(function initMicDictation() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function wire(micId, targetId, statusId) {
    const micBtn = document.getElementById(micId);
    const target = document.getElementById(targetId);
    const status = document.getElementById(statusId);
    if (!micBtn || !target) return;

    if (!SR) {
      micBtn.classList.add('unsupported');
      micBtn.title = 'הדפדפן שלך אינו תומך בהקראה · נסה Chrome או Edge';
      micBtn.addEventListener('click', () => {
        if (status) {
          status.textContent = 'הדפדפן הזה לא תומך בהקלטה. אפשר לנסות Chrome.';
          status.classList.add('error');
        }
      });
      return;
    }

    const recog = new SR();
    recog.lang = 'he-IL';
    recog.continuous = false;
    recog.interimResults = true;

    let listening = false;
    let baseline = '';

    function setStatus(html, cls) {
      if (!status) return;
      status.className = 'mic-status' + (cls ? ' ' + cls : '');
      status.innerHTML = html;
    }

    micBtn.addEventListener('click', () => {
      if (listening) { recog.stop(); return; }
      baseline = target.value.trim();
      try {
        recog.start();
      } catch (err) { /* already started */ }
    });

    recog.addEventListener('start', () => {
      listening = true;
      micBtn.classList.add('listening');
      micBtn.setAttribute('aria-label', 'עצירת ההקלטה');
      setStatus('מקשיב<span class="dotwave"><span></span><span></span><span></span></span>', 'active');
    });

    recog.addEventListener('result', (e) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      const joined = (baseline ? baseline + ' ' : '') + (final || interim);
      target.value = joined.trim();
      // update char counter if present (prayer textarea)
      const counter = target.form?.querySelector('.counter #charCount') || document.getElementById('charCount');
      if (target.id === 'prayerText' && counter) counter.textContent = String(target.value.length);
      if (final) baseline = target.value.trim();
    });

    recog.addEventListener('error', (e) => {
      let msg = 'לא הצלחנו להקליט. נסה שוב.';
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        msg = 'יש לאשר גישה למיקרופון בדפדפן ולנסות שוב.';
      } else if (e.error === 'no-speech') {
        msg = 'לא זוהה קול. לחץ שוב ודבר בקול רגוע.';
      } else if (e.error === 'audio-capture') {
        msg = 'לא נמצא מיקרופון במכשיר.';
      } else if (e.error === 'network') {
        msg = 'בעיית רשת — הזיהוי דורש חיבור לאינטרנט.';
      }
      setStatus(msg, 'error');
    });

    recog.addEventListener('end', () => {
      listening = false;
      micBtn.classList.remove('listening');
      micBtn.setAttribute('aria-label', 'הקלטה במיקרופון');
      // keep error status if any; otherwise clear after a beat
      if (status && !status.classList.contains('error')) {
        setStatus(target.value.trim() ? '✦ ההקראה נקלטה — אפשר לערוך או לשלוח' : '', target.value.trim() ? 'active' : '');
      }
    });
  }

  wire('micPrayer', 'prayerText', 'micPrayerStatus');
  wire('micContact', 'contactMsg', 'micContactStatus');
})();

/* ================================================================
   ADDITIONS — spam guard, daily Tehillim, weekly Parsha,
   stories modal, and Hebrew/English language switcher.
   These are additive and don't replace existing features.
   ================================================================ */

/* ---------- SPAM / PROFANITY GUARD ----------
   Auto-deletes inappropriate words from prayer / contact submissions
   and reports the incident to a Netlify function so the site owner's
   phone (972542233888) can be alerted. */
(function initSpamGuard() {
  const ALERT_PHONE = '972542233888';
  // Hebrew + English moderation list — covers profanity, slurs, sexual content,
  // hate-speech markers, threats and lashon-hara triggers.
  // Kept here as one source of truth — the proactive bot reads from MOD_LIST too.
  const MOD_LIST = (window.PC_MOD_LIST = window.PC_MOD_LIST || [
    /* —— Hebrew profanity / sexual / abusive —— */
    'כוסאמא','כוסאמק','כוסאמהשלך','כוסאמך','כוס אמך','כוס אמא','בן זונה','בן־זונה','בנזונה','בני זונות',
    'בת זונה','זונה','זונות','זין','זיין','זיון','להזדיין','תזדיין','מזדיין','מזדיינת',
    'חרא','חארות','שרמוטה','שרמוטות','מניאק','מניאקית','מניאקים','דפוק','דפוקה','דפוקים','דפוקות',
    'קוקסינל','הומו','לסבית','אידיוט','אידיוטית','טמבל','טמבלית','מטומטם','מטומטמת','מפגר','מפגרת',
    'בהמה','בהמות','חמור','חמורים','כלב בן כלב','כלבה','כלבות',
    'נבלה','נבלות','שמוק','שמוקים','שמאלן','ימני מסריח','ערס','ערסית','פרחה','פרחות',
    'פדופיל','אונס','לאנוס','אנס','אנסים','התעללות מינית','חזיר',
    /* —— Yiddish/Aramaic-style insults —— */
    'בלגן ארור','שייגעץ','גוי מסריח','גויים מסריחים',
    /* —— Hebrew curses / anti-religious / hate triggers —— */
    'ימח שמך','ימח שמו','ימח שמם','שתמות','שתפגר','שתחטוף','שתחטפי',
    'מוות ל','מוות לערבים','מוות ליהודים','מוות לחרדים','מוות לחילונים','מוות לרפורמים',
    'אללה ירחמו','שיתפגר','אני אהרוג','אהרוג אותך','אני שונא יהודים','אני שונא ערבים','אני שונא חרדים',
    'נאצי','נאצים','היטלר צדק','שואה לכם','שיהיה לכם שואה',
    /* —— Lashon hara / explicit gossip markers (case-by-case nudge) —— */
    'תפיץ','תפיצי','להשמיץ','השמצה','רכילות על','אל תספר לאף אחד אבל','בסוד שמעתי ש',
    /* —— Hebrew transliteration of common English curses —— */
    'פאק','פאקינג','פאקינגית','שיט','שיטי','אסשול','ביץ׳','ביצ׳',
    'יא בן','יא בת','יא חרא','יא זין','יא מניאק','יא זונה','יא שרמוטה','יא חמור','יא חתיכת',

    /* —— English profanity / sexual / abusive —— */
    'fuck','fucker','fucking','fucked','motherfucker','mf','wtf','stfu','shit','bullshit','shitty',
    'bitch','bitches','asshole','asshat','dick','dickhead','cunt','pussy','prick',
    'whore','slut','slutty','bastard','douchebag','jackass','jerkoff','wanker','twat','bollocks',
    'rape','raping','rapist','pedo','pedophile','molest','molester',
    'porn','pornhub','xxx','nude','nudes','onlyfans',
    /* —— English slurs / hate speech (auto-blocked) —— */
    'nigger','nigga','faggot','fag','tranny','dyke','chink','spic','kike','retard','retarded',
    /* —— English threats / incitement —— */
    'kill yourself','kys','kill jews','kill arabs','kill muslims','kill christians',
    'gas the','death to israel','death to jews','heil hitler','hitler was right',
    /* —— Spam markers —— */
    'http://','https://','www.','t.me/','telegram.me','bit.ly/','tinyurl.com',
    'click here to win','free crypto','viagra','cialis','casino bonus','bitcoin doubler'
  ]);
  const BAD = MOD_LIST;
  const RX = new RegExp('(' + BAD.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|') + ')', 'gi');

  function findBad(txt) {
    if (!txt) return [];
    const m = String(txt).match(RX);
    return m ? Array.from(new Set(m.map(s => s.toLowerCase()))) : [];
  }
  function bleep(txt) {
    return String(txt || '').replace(RX, m => '·'.repeat(Math.max(3, m.length)));
  }

  function showSpamToast(msg) {
    const t = document.getElementById('spamToast');
    if (!t) return;
    if (msg) {
      const span = document.getElementById('spamToastMsg');
      if (span) span.textContent = msg;
    }
    t.removeAttribute('hidden');
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(showSpamToast._t);
    showSpamToast._t = setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.setAttribute('hidden', ''), 350);
    }, 4200);
  }

  async function reportSpam(payload) {
    try {
      await fetch('/.netlify/functions/spam-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: ALERT_PHONE,
          source: payload.source || 'unknown',
          text: payload.text || '',
          flagged: payload.flagged || [],
          ts: new Date().toISOString(),
          path: location.pathname
        })
      });
    } catch (e) { /* silent — keep UX gentle */ }
    // also log locally so owner can review even without server
    try {
      const log = JSON.parse(localStorage.getItem('pc_spam_log') || '[]');
      log.unshift({ ...payload, ts: Date.now(), phone: ALERT_PHONE });
      while (log.length > 50) log.pop();
      localStorage.setItem('pc_spam_log', JSON.stringify(log));
    } catch {}
  }

  function guardField(textarea, sourceLabel) {
    if (!textarea) return;
    textarea.addEventListener('input', () => {
      const flagged = findBad(textarea.value);
      if (flagged.length) {
        textarea.value = bleep(textarea.value);
        const counter = document.getElementById('charCount');
        if (textarea.id === 'prayerText' && counter) counter.textContent = String(textarea.value.length);
        showSpamToast('זיהינו ניסוחים לא הולמים — הוסרו אוטומטית. ההודעה נשלחה לצוות.');
        reportSpam({ source: sourceLabel, text: textarea.value, flagged });
      }
    });
  }

  // wrap submission of the prayer form in capture phase so we run BEFORE the
  // existing handler — if profanity is detected the original handler is blocked.
  const submitBtn = document.getElementById('submitPrayer');
  const prayerArea = document.getElementById('prayerText');
  if (submitBtn && prayerArea) {
    submitBtn.addEventListener('click', (e) => {
      const flagged = findBad(prayerArea.value);
      if (flagged.length) {
        e.stopImmediatePropagation();
        e.preventDefault();
        prayerArea.value = bleep(prayerArea.value);
        showSpamToast('הבקשה נחסמה — נמצאו ביטויים לא הולמים. הצוות עודכן.');
        reportSpam({ source: 'prayer-submit', text: prayerArea.value, flagged });
      }
    }, true);
  }

  // contact form
  const contactBtn = document.getElementById('contactSend');
  const contactMsg = document.getElementById('contactMsg');
  if (contactBtn && contactMsg) {
    contactBtn.addEventListener('click', (e) => {
      const flagged = findBad(contactMsg.value);
      if (flagged.length) {
        e.stopImmediatePropagation();
        e.preventDefault();
        contactMsg.value = bleep(contactMsg.value);
        showSpamToast('ההודעה לא נשלחה — נמצאו ביטויים לא הולמים. הצוות עודכן.');
        reportSpam({ source: 'contact', text: contactMsg.value, flagged });
      }
    }, true);
  }

  // live filter while the user types
  guardField(prayerArea, 'prayer-input');
  guardField(contactMsg, 'contact-input');
})();

/* ---------- STORIES — full content + modal (no jump to top) ---------- */
(function initStories() {
  const STORIES = [
    {
      cat: 'תקומה',
      title: 'מן הצרה אל התקומה',
      source: 'מתוך עדויות מבית הכנסת "אור החיים", צפת',
      body:
`היה זה אדם פשוט מצפת, שאיבד את עבודתו ימים ספורים לפני חתונת בתו.
הבית התרוקן, החובות גדלו, והוא חש שהשמיים סגרו עליו. ערב אחד נכנס לבית הכנסת,
התיישב ליד עמוד התפילה, פתח תהילים והתחיל לבכות בשקט.
שכן בית הכנסת — אדם שלא הכיר אותו כלל — שם יד על כתפו ולחש: "אל תוותר. אני מתפלל איתך."

בתוך שלושה שבועות נפתחה לו דלת לעבודה חדשה, אנשים שאיש לא ידע שהקשיבו תרמו לחתונה,
והבת התחתנה במזל טוב. הוא עצמו מספר עד היום: "לא הישועה שינתה אותי — היד הזו על הכתף עשתה זאת.
מאותו רגע ידעתי שאני לא לבד. ומי שמרגיש שהוא לא לבד — אף פעם לא נשבר באמת."`
    },
    {
      cat: 'אמונה',
      title: 'בין כאב לקבלה',
      source: 'סיפורה של רחל, אם לארבעה, ירושלים',
      body:
`שנתיים נאבקה רחל במחלה קשה. היא ניסתה הכל — רופאים, מחקרים, טיפולים אלטרנטיביים.
לילה אחד, כשהבית ישן, היא ישבה בחדר האורחים ושאלה את עצמה: "אולי אני צריכה להפסיק להילחם.
אולי האמונה היא לא 'תרפא אותי' אלא 'לא משנה מה — אתה איתי'."

מאותו לילה תפילותיה השתנו. היא הפסיקה לבקש שינוי, והתחילה לבקש כוח לקבל.
ואחרי חצי שנה — בלי הסבר רפואי — הסמנים החלו להשתפר. הרופא אמר לה:
"לא הבנתי מה קרה." היא חייכה ואמרה: "גם אני לא. אבל ידעתי שלא הייתי לבד אפילו רגע אחד."`
    },
    {
      cat: 'מצוקה',
      title: 'אור בתוך ההשפלה',
      source: 'סיפור שסופר ע״י הרב יצחק מ׳, בני־ברק',
      body:
`איש עסקים נפל. כל מה שבנה — אבד. אנשים שהיו חברים הפנו את הגב, ילדים שצחקו עליו ברחוב.
הוא היה משוכנע שהחיים נגמרו. בערב יום הכיפורים, רגע לפני "כל נדרי", הוא נכנס לבית כנסת קטן בשכונה אחרת,
מקום שאף אחד לא הכיר אותו. הוא הציץ פנימה, ראה איש זקן עומד ובוכה ושמע אותו לוחש:
"ריבונו של עולם — אני לא מבקש להחזיר את מה שהיה. אני מבקש רק לזכור מי אני."

המשפט הזה חדר ללבו כברק. הוא נכנס, התפלל, ולמחרת התחיל לבנות הכל מחדש —
לא את העסק, אלא את עצמו. שבע שנים אחר כך, כשנשאל מה הציל אותו, אמר:
"לא ההתאוששות הכלכלית. ההתאוששות הפנימית. ברגע שהפסקתי לבקש לחזור — התחלתי להתחדש."`
    }
  ];

  const cards = document.querySelectorAll('.stories-card .story');
  const modal = document.getElementById('storyModal');
  const titleEl = document.getElementById('storyModalTitle');
  const tagEl = document.getElementById('storyModalTag');
  const textEl = document.getElementById('storyModalText');
  const sourceEl = document.getElementById('storyModalSource');
  if (!cards.length || !modal) return;

  function open(idx) {
    const s = STORIES[idx];
    if (!s) return;
    titleEl.textContent = s.title;
    tagEl.textContent = s.cat;
    textEl.textContent = s.body;
    sourceEl.textContent = s.source;
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  cards.forEach((card, i) => {
    // make the card itself open the story (better UX)
    card.addEventListener('click', (e) => {
      // ignore clicks on links the user may add later
      if (e.target.closest('a[href]:not(.story-link)')) return;
      e.preventDefault();
      open(i);
    });
    // and the explicit "read more" link — make sure it does NOT jump to top
    const link = card.querySelector('.story-link');
    if (link) {
      link.setAttribute('href', 'javascript:void(0)');
      link.setAttribute('role', 'button');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        open(i);
      });
    }
  });
})();

/* ---------- DAILY TEHILLIM (removed by request) ---------- */

/* ---------- WEEKLY PARSHA on calendar card ---------- */
(function initParsha() {
  const calCard = document.getElementById('calendar');
  if (!calCard) return;

  // 54 weekly portions, in standard order. We rotate through using
  // a fixed Saturday anchor, so the displayed parsha advances week-over-week.
  const PARSHIYOT = [
    'בראשית','נח','לך־לך','וירא','חיי שרה','תולדות','ויצא','וישלח','וישב','מקץ','ויגש','ויחי',
    'שמות','וארא','בא','בשלח','יתרו','משפטים','תרומה','תצוה','כי תשא','ויקהל','פקודי',
    'ויקרא','צו','שמיני','תזריע','מצורע','אחרי מות','קדושים','אמור','בהר','בחקתי',
    'במדבר','נשא','בהעלתך','שלח','קרח','חקת','בלק','פינחס','מטות','מסעי',
    'דברים','ואתחנן','עקב','ראה','שופטים','כי תצא','כי תבוא','נצבים','וילך','האזינו','וזאת הברכה'
  ];
  // anchor: Saturday 2026-04-25 ≈ Parashat Acharei Mot (index 28)
  const ANCHOR_MS = new Date(2026, 3, 25).getTime();
  const ANCHOR_IDX = 28;

  function currentParsha() {
    const now = Date.now();
    const weeks = Math.floor((now - ANCHOR_MS) / (7 * 86400000));
    const idx = ((ANCHOR_IDX + weeks) % PARSHIYOT.length + PARSHIYOT.length) % PARSHIYOT.length;
    return PARSHIYOT[idx];
  }

  // append a parsha strip without touching existing content
  const strip = document.createElement('div');
  strip.className = 'parsha-strip';
  strip.innerHTML = `
    <div>
      <div class="p-label">פרשת השבוע</div>
      <div class="p-name" id="parshaName">פרשת ${currentParsha()}</div>
    </div>
    <a class="p-link" href="#library" id="parshaLink">ספריית התפילות ←</a>`;
  calCard.appendChild(strip);

  // refresh once per minute (in case the page stays open across midnight Saturday)
  setInterval(() => {
    const el = document.getElementById('parshaName');
    if (el) el.textContent = `פרשת ${currentParsha()}`;
  }, 60000);
})();

/* ---------- HEBREW / ENGLISH LANGUAGE TOGGLE ---------- */
(function initLanguage() {
  const heBtn = document.getElementById('langHe');
  const enBtn = document.getElementById('langEn');
  if (!heBtn || !enBtn) return;

  // Strings to show in English mode. Original Hebrew is kept on the elements
  // as data-original so we can restore it perfectly.
  const T = {
    '[data-i18n="brand-main"]': 'Prayer Center',
    '[data-i18n="brand-sub"]':  'A Jewish space · personal · anonymous',
    '[data-i18n="nav-home"]':   'Home',
    '[data-i18n="nav-create"]': 'Request a prayer',
    '[data-i18n="nav-feed"]':   'Feed',
    '[data-i18n="nav-me"]':     'Personal area',
    '[data-i18n="nav-library"]':'Prayer library',
    '[data-i18n="nav-stories"]':'Stories',
    '[data-i18n="nav-about"]':  'About',
    '[data-i18n="hero-h1"]':    'The place where <span>prayers come true</span>',
    '[data-i18n="tehillim-h2"]':'Would you like to read a Psalm today?',
    '[data-i18n="tehillim-lead"]':'A new Psalm every day — a quiet moment of light.'
  };

  // tag a few core elements with data-i18n on first run (non-destructive: we
  // only add the attribute, never remove existing markup)
  function tagOnce() {
    const map = [
      ['.brand-main',                'brand-main'],
      ['.brand-sub',                 'brand-sub'],
      ['.nav a[href="#hero"]',       'nav-home'],
      ['.nav a[href="#create"]',     'nav-create'],
      ['.nav a[href="#feed"]',       'nav-feed'],
      ['.nav a[href="#me"]',         'nav-me'],
      ['.nav a[href="#library"]',    'nav-library'],
      ['.nav a[href="#stories"]',    'nav-stories'],
      ['.nav a[href="#about"]',      'nav-about'],
      ['.hero-left h1',              'hero-h1'],
      ['#tehillimTitle',             'tehillim-h2'],
      ['#tehillimLead',              'tehillim-lead']
    ];
    map.forEach(([sel, key]) => {
      const el = document.querySelector(sel);
      if (el && !el.dataset.i18n) {
        el.dataset.i18n = key;
        el.dataset.original = el.innerHTML;
      }
    });
  }

  function setLang(lang) {
    tagOnce();
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const sel = `[data-i18n="${el.dataset.i18n}"]`;
      if (lang === 'en' && T[sel]) el.innerHTML = T[sel];
      else if (el.dataset.original) el.innerHTML = el.dataset.original;
    });
    heBtn.classList.toggle('active', lang === 'he');
    enBtn.classList.toggle('active', lang === 'en');
    try { localStorage.setItem('pc_lang', lang); } catch {}
  }

  heBtn.addEventListener('click', () => setLang('he'));
  enBtn.addEventListener('click', () => setLang('en'));

  // restore previous choice (default Hebrew)
  let saved = 'he';
  try { saved = localStorage.getItem('pc_lang') || 'he'; } catch {}
  setLang(saved);
})();

/* ================================================================
   ADDITIONS v2 — live Jewish calendar, side share rail,
   proactive profanity bot (prefix-aware). Purely additive:
   nothing above this line is modified.
   ================================================================ */

/* ---------- LIVE JEWISH CALENDAR ----------
   Updates the calendar card with today's real Hebrew date, day name,
   and (when possible) real zmanim / Shabbat times from the public
   Hebcal JSON API (geonameid 281184 = Jerusalem). Falls back silently
   to the existing static text if the network call cannot complete. */
(function initLiveCalendar() {
  const card = document.getElementById('calendar');
  if (!card) return;
  const heading = card.querySelector('h2');
  const intro   = card.querySelector('p');
  const timeEls = card.querySelectorAll('.times > div');
  if (!heading || !intro || timeEls.length < 4) return;

  const DAYS = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת קודש'];
  const today = new Date();

  function hebrewDateLabel(d) {
    try {
      return new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(d);
    } catch { return ''; }
  }

  function setTime(idx, label, value) {
    const el = timeEls[idx];
    if (!el || !value) return;
    el.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    el.classList.add('live-updated');
  }

  function extractTime(txt) {
    const m = String(txt || '').match(/(\d{1,2}:\d{2})/);
    return m ? m[1] : '';
  }

  function addLiveTag() {
    if (card.querySelector('.cal-live-tag')) return;
    const tag = document.createElement('div');
    tag.className = 'cal-live-tag';
    tag.textContent = 'מתעדכן חי · ירושלים';
    intro.insertAdjacentElement('afterend', tag);
  }

  // 1) Immediate, offline-safe header update
  const hebDate = hebrewDateLabel(today);
  const dayName = DAYS[today.getDay()];
  if (hebDate) heading.textContent = `${hebDate} · ${dayName}`;

  const dow = today.getDay(); // 0 = Sun, 6 = Sat
  if (dow === 6) {
    intro.textContent = 'שבת קודש — יום מנוחה, קדושה וחיבור. זמן להאיר את הנשמה ולברך את הבית.';
  } else if (dow === 5) {
    intro.textContent = 'ערב שבת — הכנה של הנפש והבית. זמן לפתוח את הלב, להודות ולכנס אל המנוחה.';
  } else {
    intro.textContent = 'יום של הודאה, תפילה וזיכרון הקדוש־ברוך־הוא. זמן לפנות שקט בלב ולהזכיר את היקרים לנו.';
  }

  // 2) Live fetch — zmanim + Shabbat (Jerusalem). Graceful fallback.
  const pad = (n) => String(n).padStart(2, '0');
  const iso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const zmanimUrl  = `https://www.hebcal.com/zmanim?cfg=json&geonameid=281184&date=${iso}`;
  const shabbatUrl = `https://www.hebcal.com/shabbat?cfg=json&geonameid=281184&b=18&M=on`;

  Promise.allSettled([
    fetch(zmanimUrl).then(r => r.ok ? r.json() : null),
    fetch(shabbatUrl).then(r => r.ok ? r.json() : null)
  ]).then(([zRes, sRes]) => {
    const z = zRes.status === 'fulfilled' ? zRes.value : null;
    const s = sRes.status === 'fulfilled' ? sRes.value : null;

    // helper: format an ISO datetime to HH:MM in local TZ from the payload
    const fmt = (val) => {
      if (!val) return '';
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return '';
        return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch { return ''; }
    };

    const times = (z && z.times) ? z.times : {};
    const sunrise  = fmt(times.sunrise);
    const sunset   = fmt(times.sunset);
    const shmaMga  = fmt(times.sofZmanShmaMGA);
    const shmaGra  = fmt(times.sofZmanShma);
    const tzeit    = fmt(times.tzeit7083deg || times.tzeit85deg || times.tzeit72min);
    const chatzot  = fmt(times.chatzot);

    // find candle / havdalah / parsha from shabbat feed
    let candles = '', havdalah = '', parshaHe = '';
    if (s && Array.isArray(s.items)) {
      const cand = s.items.find(x => x.category === 'candles');
      const hav  = s.items.find(x => x.category === 'havdalah');
      const par  = s.items.find(x => x.category === 'parashat');
      if (cand) candles  = extractTime(cand.title);
      if (hav)  havdalah = extractTime(hav.title);
      if (par)  parshaHe = par.hebrew || '';
    }

    // Decide what four times to show based on the day
    if (dow === 5 || dow === 6) {
      // Erev Shabbat / Shabbat
      setTime(0, 'הדלקת נרות', candles || '—');
      setTime(1, 'צאת שבת',    havdalah || '—');
      setTime(2, 'סוף זמן ק״ש', shmaGra || shmaMga || '—');
      setTime(3, 'שקיעה',       sunset || '—');
    } else {
      // regular weekday — weekday zmanim
      setTime(0, 'הנץ החמה',    sunrise || '—');
      setTime(1, 'סוף זמן ק״ש', shmaGra || shmaMga || '—');
      setTime(2, 'שקיעה',       sunset || '—');
      setTime(3, 'צאת הכוכבים', tzeit || '—');
    }

    // Update parsha strip name if the JS parsha strip exists
    if (parshaHe) {
      const pname = document.getElementById('parshaName');
      if (pname) pname.textContent = parshaHe;
    }

    // small visible marker so the user sees the card is actually alive
    addLiveTag();
  }).catch(() => { /* keep static fallback */ });
})();

/* ---------- CITY ZMANIM TABLE (additive) ----------
   Expandable table of Shabbat / holiday candle-lighting and havdalah
   for multiple Israeli and diaspora cities. Data pulled lazily from
   the public Hebcal Shabbat JSON API when the panel is opened, so the
   initial page load stays unaffected. */
(function initCityZmanim() {
  const calCard = document.getElementById('calendar');
  if (!calCard) return;
  if (calCard.querySelector('.city-zmanim')) return;

  const CITIES = [
    { name: 'ירושלים',        id: 281184, b: 40 },
    { name: 'תל אביב–יפו',    id: 293397, b: 18 },
    { name: 'חיפה',           id: 294801, b: 30 },
    { name: 'באר שבע',        id: 295530, b: 18 },
    { name: 'ראשון לציון',    id: 293703, b: 18 },
    { name: 'נתניה',          id: 293619, b: 18 },
    { name: 'אשדוד',          id: 295620, b: 18 },
    { name: 'פתח תקווה',      id: 293918, b: 18 },
    { name: 'טבריה',          id: 293322, b: 18 },
    { name: 'צפת',            id: 293100, b: 30 },
    { name: 'אילת',           id: 295277, b: 18 },
    { name: 'ניו יורק',       id: 5128581, b: 18 },
    { name: 'לוס אנג׳לס',     id: 5368361, b: 18 },
    { name: 'מיאמי',          id: 4164138, b: 18 },
    { name: 'טורונטו',        id: 6167865, b: 18 },
    { name: 'לונדון',         id: 2643743, b: 18 },
    { name: 'פריז',           id: 2988507, b: 18 },
    { name: 'רומא',           id: 3169070, b: 18 },
    { name: 'מוסקבה',         id: 524901,  b: 18 },
    { name: 'בואנוס איירס',   id: 3435910, b: 18 },
    { name: 'מלבורן',         id: 2158177, b: 18 },
    { name: 'סידני',          id: 2147714, b: 18 },
    { name: 'יוהנסבורג',      id: 993800,  b: 18 }
  ];

  const wrap = document.createElement('details');
  wrap.className = 'city-zmanim';
  wrap.innerHTML = `
    <summary>
      <span class="cz-icon" aria-hidden="true">🕯️</span>
      זמני כניסת ויציאת שבת / חג · ערים נוספות
      <span class="cz-chev" aria-hidden="true">▾</span>
    </summary>
    <div class="cz-body">
      <div class="cz-status">פתחו את הפאנל לטעינת נתונים חיים מהמאגר (Hebcal).</div>
      <div class="cz-tablewrap" hidden>
        <table class="cz-table" role="table">
          <thead>
            <tr>
              <th>עיר</th>
              <th>כניסת שבת/חג</th>
              <th>יציאה</th>
              <th>פרשה / חג</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
        <div class="cz-foot">הנתונים מתעדכנים לפי Shabbat API של Hebcal · זמנים מקומיים בכל עיר.</div>
      </div>
    </div>
  `;
  calCard.appendChild(wrap);

  const statusEl = wrap.querySelector('.cz-status');
  const tableWrap = wrap.querySelector('.cz-tablewrap');
  const tbody     = wrap.querySelector('tbody');

  const extractHHMM = (s) => {
    const m = String(s || '').match(/(\d{1,2}:\d{2})/);
    return m ? m[1] : '';
  };

  async function loadCity(city) {
    try {
      const url = `https://www.hebcal.com/shabbat?cfg=json&geonameid=${city.id}&b=${city.b}&M=on`;
      const r = await fetch(url);
      if (!r.ok) throw new Error('bad_response');
      const j = await r.json();
      let candles = '', havdalah = '', parshaHe = '';
      if (Array.isArray(j.items)) {
        const cand = j.items.find(x => x.category === 'candles');
        const hav  = j.items.find(x => x.category === 'havdalah');
        const par  = j.items.find(x => x.category === 'parashat') ||
                     j.items.find(x => x.category === 'holiday' && x.yomtov);
        if (cand) candles  = extractHHMM(cand.title);
        if (hav)  havdalah = extractHHMM(hav.title);
        if (par)  parshaHe = par.hebrew || par.title || '';
      }
      return { ok: true, city, candles, havdalah, parshaHe };
    } catch {
      return { ok: false, city };
    }
  }

  let loaded = false;
  async function loadAll() {
    if (loaded) return;
    loaded = true;
    statusEl.textContent = 'טוען נתונים…';
    const results = await Promise.all(CITIES.map(loadCity));
    tbody.innerHTML = results.map(r => {
      const c = r.city;
      if (!r.ok) {
        return `<tr class="cz-row cz-row-fail"><td>${c.name}</td><td colspan="3">—</td></tr>`;
      }
      return `<tr class="cz-row">
        <td class="cz-city">${c.name}</td>
        <td class="cz-in">${r.candles || '—'}</td>
        <td class="cz-out">${r.havdalah || '—'}</td>
        <td class="cz-par">${r.parshaHe || '—'}</td>
      </tr>`;
    }).join('');
    statusEl.remove();
    tableWrap.removeAttribute('hidden');
  }

  wrap.addEventListener('toggle', () => {
    if (wrap.open) loadAll();
  });
})();

/* ---------- SIDE SHARE RAIL ----------
   Wires the Facebook / Twitter(X) / WhatsApp / copy-link buttons that
   live in index.html inside #shareRail. Purely behavioral — HTML and
   CSS are already defined above. */
(function initShareRail() {
  const rail = document.getElementById('shareRail');
  if (!rail) return;

  const pageUrl = () => {
    try { return window.location.href; } catch { return ''; }
  };
  const pageTitle = () => document.title || 'מרכז התפילה';

  const links = {
    facebook: (u, t) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}&quote=${encodeURIComponent(t)}`,
    twitter:  (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
    whatsapp: (u, t) => `https://api.whatsapp.com/send?text=${encodeURIComponent(t + ' ' + u)}`
  };

  rail.querySelectorAll('[data-share]').forEach(btn => {
    const kind = btn.dataset.share;
    if (kind === 'facebook' || kind === 'twitter' || kind === 'whatsapp') {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const href = links[kind](pageUrl(), pageTitle());
        window.open(href, '_blank', 'noopener,noreferrer,width=640,height=620');
      });
    } else if (kind === 'copy') {
      btn.addEventListener('click', async () => {
        const url = pageUrl();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
          } else {
            const tmp = document.createElement('input');
            tmp.value = url;
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand('copy');
            tmp.remove();
          }
          btn.classList.add('copied');
          const prev = btn.getAttribute('title') || '';
          btn.setAttribute('title', 'הקישור הועתק ✓');
          setTimeout(() => {
            btn.classList.remove('copied');
            if (prev) btn.setAttribute('title', prev);
          }, 1800);
        } catch { /* silent */ }
      });
    }
  });

  // Collapse / expand handle
  const toggle = document.getElementById('shareToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      rail.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', rail.classList.contains('collapsed') ? 'false' : 'true');
      try { localStorage.setItem('pc_share_collapsed', rail.classList.contains('collapsed') ? '1' : '0'); } catch {}
    });
    try {
      if (localStorage.getItem('pc_share_collapsed') === '1') rail.classList.add('collapsed');
    } catch {}
  }
})();

/* ---------- PROACTIVE PROFANITY BOT ----------
   Enhances the existing spam guard with an inline, friendly warning
   bubble that reacts while the user is *starting* to type a bad word.
   The old cleanup behavior still runs; this only adds an early, visible
   nudge near the text field itself so the user sees the bot working. */
(function initProactiveBot() {
  // Reuse the same source-of-truth moderation list built by the spam guard.
  // This guarantees that updates to one list automatically propagate.
  const BAD = (window.PC_MOD_LIST && window.PC_MOD_LIST.length)
    ? window.PC_MOD_LIST
    : [
        'כוסאמא','כוסאמק','בן זונה','בן־זונה','זונה','זין','חרא','שרמוטה',
        'מניאק','דפוק','קוקסינל','אידיוט','טמבל','מטומטם','שיט','פאק','פאקינג',
        'יא בן','יא בת','יא חרא','יא זין','בנזונה',
        'fuck','shit','bitch','asshole','dick','cunt','nigger','faggot'
      ];
  // Build prefix list: first ~half of every bad word (min 2 chars)
  const PREFIXES = Array.from(new Set(
    BAD.map(w => {
      const core = w.replace(/\s+/g, '');
      const n = Math.max(2, Math.min(core.length - 1, Math.ceil(core.length / 2)));
      return core.slice(0, n).toLowerCase();
    }).filter(p => p.length >= 2)
  ));

  const FULL_RX = new RegExp('(' + BAD.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|') + ')', 'i');

  function lastToken(str) {
    if (!str) return '';
    const m = String(str).toLowerCase().match(/[^\s.,!?·]+$/);
    return m ? m[0] : '';
  }

  /* Lightweight gibberish detector — triggers only when the text looks like
     random mashing (e.g. "בללה הללה", "asdf asdf", long consonant runs).
     Tuned conservatively so real prayers with unusual names still pass. */
  function isGibberish(str) {
    const s = String(str || '').trim();
    if (s.length < 6) return false;                      // too short to judge
    // long run of the same character (e.g. "אאאאאא", "yyyyy")
    if (/(.)\1{4,}/.test(s)) return true;
    // 6+ Hebrew consonants in a row with no vowel letter (אהויע) nor whitespace
    if (/[בגדזחטכלמנסעפצקרשתךםןףץ]{6,}/.test(s)) return true;
    // tokens with only 1–2 distinct letters repeated (e.g. "בללה", "הההלל")
    const tokens = s.split(/\s+/).filter(t => t.length >= 3);
    if (tokens.length >= 2) {
      const weird = tokens.filter(t => {
        const uniq = new Set(t.replace(/[^\u0590-\u05FFa-z]/gi, '').split(''));
        return uniq.size > 0 && uniq.size <= 2 && t.length >= 4;
      });
      if (weird.length >= 2) return true;
      // the same token repeated many times: "בלה בלה בלה בלה"
      const counts = {};
      tokens.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
      if (Object.values(counts).some(n => n >= 4)) return true;
    }
    return false;
  }

  function attach(field, label) {
    if (!field || field.dataset.botAttached === '1') return;
    field.dataset.botAttached = '1';

    // wrap the field so the bubble can be absolutely positioned
    const parent = field.parentElement;
    if (parent && !parent.classList.contains('bot-field-wrap')) {
      parent.classList.add('bot-field-wrap');
    }

    const bubble = document.createElement('div');
    bubble.className = 'spam-bot-bubble';
    bubble.setAttribute('role', 'status');
    bubble.setAttribute('aria-live', 'polite');
    bubble.innerHTML = '<span class="bot-ico" aria-hidden="true">🤖</span><span class="bot-text"></span>';
    (parent || field).appendChild(bubble);

    let hideTimer;
    function show(level, text) {
      bubble.classList.remove('level-warn', 'level-block');
      if (level) bubble.classList.add(level);
      bubble.querySelector('.bot-text').textContent = text;
      bubble.classList.add('show');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => bubble.classList.remove('show'), 3600);
    }

    field.addEventListener('input', () => {
      const val = field.value || '';
      if (FULL_RX.test(val)) {
        show('level-block', 'הבוט זיהה ניסוח גס — המילה הוסרה. אנא נסח מחדש בכבוד.');
        return;
      }
      const tok = lastToken(val);
      if (tok.length >= 2) {
        const hit = PREFIXES.find(p => tok.startsWith(p));
        if (hit) {
          show('level-warn', 'רגע — שים לב לניסוח. כאן מתפללים בכבוד ובלב נקי.');
          return;
        }
      }
      // gibberish / nonsense detector (additive, conservative)
      if (isGibberish(val)) {
        show('level-warn', 'נראה שהטקסט לא מובן — נסה לנסח את הבקשה במילים ברורות.');
        return;
      }
      // nothing bad — hide any leftover bubble
      if (bubble.classList.contains('show')) {
        bubble.classList.remove('show');
      }
    });

    // Friendly onboarding hint the first time this field is focused
    let greeted = false;
    field.addEventListener('focus', () => {
      if (greeted) return;
      greeted = true;
      try {
        if (localStorage.getItem('pc_bot_greet_' + label) === '1') return;
        localStorage.setItem('pc_bot_greet_' + label, '1');
      } catch {}
      show('', 'בוט שמירה פעיל · אם תכתבו ביטוי לא הולם — נעצור ברגע.');
    });
  }

  // attach to the two fields the original guard already watches
  attach(document.getElementById('prayerText'),  'prayer');
  attach(document.getElementById('contactMsg'),  'contact');
})();

/* ---------- PWA: service worker + install chip + cookie consent ----------
   Purely additive — wraps the page with offline support, an install prompt
   chip and a GDPR-compliant cookie acknowledgement banner. */
(function initPwaAndConsent() {
  // Register the service worker once the page is idle so it doesn't block
  // initial render. Safe to call multiple times — the browser dedupes.
  if ('serviceWorker' in navigator) {
    const reg = () => navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .catch(() => { /* silent — worker is best-effort */ });
    if (document.readyState === 'complete') reg();
    else window.addEventListener('load', reg);
  }

  /* ---- Cookie consent banner ---- */
  const banner = document.getElementById('cookieBanner');
  if (banner) {
    let acked = null;
    try { acked = localStorage.getItem('pc_cookie_ack'); } catch {}
    if (!acked) {
      // show after a short pause so it doesn't fight the hero
      setTimeout(() => banner.classList.add('show'), 1400);
    }
    function ack(value) {
      try { localStorage.setItem('pc_cookie_ack', value); } catch {}
      banner.classList.remove('show');
      setTimeout(() => banner.setAttribute('hidden', ''), 400);
    }
    document.getElementById('cookieAccept')?.addEventListener('click', () => ack('all'));
    document.getElementById('cookieDecline')?.addEventListener('click', () => ack('essential'));
  }

  /* ---- PWA install chip (Chrome/Edge/Android) ---- */
  const chip = document.getElementById('pwaInstallChip');
  const dismiss = document.getElementById('pwaInstallDismiss');
  let deferred = null;

  let dismissed = false;
  try { dismissed = localStorage.getItem('pc_pwa_dismissed') === '1'; } catch {}

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    if (!chip || dismissed) return;
    // show the chip after the user has been on the page for at least 8s
    setTimeout(() => chip.classList.add('show'), 8000);
  });

  chip?.addEventListener('click', async (e) => {
    if (e.target === dismiss) return;
    if (!deferred) return;
    chip.classList.remove('show');
    deferred.prompt();
    try { await deferred.userChoice; } catch {}
    deferred = null;
  });

  dismiss?.addEventListener('click', (e) => {
    e.stopPropagation();
    chip.classList.remove('show');
    try { localStorage.setItem('pc_pwa_dismissed', '1'); } catch {}
  });

  window.addEventListener('appinstalled', () => {
    chip?.classList.remove('show');
    try { localStorage.setItem('pc_pwa_dismissed', '1'); } catch {}
  });
})();

/* ================================================================
   NAV DROPDOWNS — hover on desktop, tap on mobile, deep-link handlers
   Purely additive. Does not remove any existing anchor or behavior.
   ================================================================ */
(function initNavDropdowns(){
  const navEl = document.querySelector('.nav');
  if (!navEl) return;

  // Toggle sub-menu when tapping the caret
  navEl.querySelectorAll('.nav-item .nav-caret').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const item = btn.closest('.nav-item');
      if (!item) return;
      const openNow = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', openNow ? 'true' : 'false');
      // close siblings
      navEl.querySelectorAll('.nav-item.is-open').forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          const c = other.querySelector('.nav-caret');
          if (c) c.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (navEl.contains(e.target)) return;
    navEl.querySelectorAll('.nav-item.is-open').forEach(item => {
      item.classList.remove('is-open');
      const c = item.querySelector('.nav-caret');
      if (c) c.setAttribute('aria-expanded', 'false');
    });
  });

  // Close with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    navEl.querySelectorAll('.nav-item.is-open').forEach(item => {
      item.classList.remove('is-open');
      const c = item.querySelector('.nav-caret');
      if (c) c.setAttribute('aria-expanded', 'false');
    });
  });

  // Deep-link sub-menu items: prefill category, switch feed tab / filter, switch personal tab
  navEl.addEventListener('click', (e) => {
    const a = e.target.closest('.nav-drop a');
    if (!a) return;

    // Prefill create form category
    const prefillCat = a.getAttribute('data-prefill-cat');
    if (prefillCat) {
      const sel = document.getElementById('category');
      if (sel) {
        const match = [...sel.options].find(o => o.value === prefillCat || o.text === prefillCat);
        if (match) sel.value = match.value || match.text;
      }
    }

    // Feed tab + filter
    const feedTab = a.getAttribute('data-feed-tab');
    if (feedTab) {
      const btn = document.querySelector(`.feed-tab[data-feed="${feedTab}"]`);
      if (btn) setTimeout(() => btn.click(), 30);
    }
    const feedFilter = a.getAttribute('data-feed-filter');
    if (feedFilter) {
      const chip = document.querySelector(`.chip[data-filter="${feedFilter}"]`);
      if (chip) setTimeout(() => chip.click(), 30);
    }

    // Me tab
    const meTab = a.getAttribute('data-me-tab');
    if (meTab) {
      const btn = document.querySelector(`.feed-tab[data-me="${meTab}"]`);
      if (btn) setTimeout(() => btn.click(), 30);
    }

    // Close dropdown after selection
    const item = a.closest('.nav-item');
    if (item) {
      item.classList.remove('is-open');
      const c = item.querySelector('.nav-caret');
      if (c) c.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ================================================================
   MEGA SEARCH — instant suggestions over an in-memory index of pages,
   sections, prayer categories and common terms. Click a suggestion to
   navigate. Submitting triggers the best-match jump.
   Additive: does not modify any existing markup or behavior.
   ================================================================ */
(function initMegaSearch(){
  const form  = document.getElementById('megaSearchForm');
  const input = document.getElementById('megaSearchInput');
  const clear = document.getElementById('megaSearchClear');
  const list  = document.getElementById('megaSearchSuggestions');
  if (!form || !input || !list) return;

  const index = [
    // ---- Anchors on home ----
    { title:'בית · לוח תפילה חי',     desc:'הדשבורד והחיבור החי לרשת', href:'#hero',    group:'עמודים', keys:['בית','דשבורד','hero','home','חי','רשת'] },
    { title:'בקש תפילה',              desc:'טופס בקשה אישי ואנונימי',  href:'#create',  group:'עמודים', keys:['בקשה','תפילה','כתוב','אנונימי','טופס'] },
    { title:'פיד בקשות פעילות',       desc:'לראות ולהתפלל על אחרים',   href:'#feed',    group:'עמודים', keys:['פיד','feed','פעילות'] },
    { title:'אזור אישי',              desc:'הבקשות שלי · אני מתפלל על', href:'#me',      group:'עמודים', keys:['אישי','אזור','me','פרופיל'] },
    { title:'מאגר תפילות',            desc:'נוסחי תפילה לפי קטגוריה',  href:'#library', group:'עמודים', keys:['מאגר','library','נוסחים'] },
    { title:'סיפורי צדיקים ואמונה',   desc:'מקורות שמחזקים את הלב',    href:'#stories', group:'עמודים', keys:['סיפורים','אמונה','צדיקים','תקומה'] },
    { title:'אודות מרכז התפילה',      desc:'הסיפור וההקדשה',           href:'#about',   group:'עמודים', keys:['אודות','about','הקדשה'] },
    { title:'צור קשר',                desc:'השאר לנו הודעה',           href:'#contact', group:'עמודים', keys:['צור','קשר','contact','הודעה'] },
    { title:'לוח שנה יהודי',          desc:'תאריך עברי וזמני היום',    href:'#calendar',group:'עמודים', keys:['לוח','שנה','תאריך','זמנים','הלכה'] },

    // ---- Internal pages ----
    { title:'כל זכות יהודי',          desc:'רשת זכויות עולמית',        href:'unity.html',            group:'עמודים', keys:['זכות','זכויות','unity'] },
    { title:'איתור קהילה',            desc:'בתי כנסת, מקוואות, כשרות', href:'find-jewish.html',     group:'עמודים', keys:['קהילה','בית כנסת','מקווה','כשרות','יהודי','איתור'] },
    { title:'חסד והתנדבות',           desc:'קופות צדקה וגמ״חים',       href:'chesed.html',          group:'עמודים', keys:['חסד','צדקה','התנדבות','גמ"ח','גמח'] },
    { title:'אירועי חיים',            desc:'ברית, בר מצווה, חתונה…',   href:'life-events.html',     group:'עמודים', keys:['אירועי','ברית','חתונה','בר מצווה','אירוע'] },
    { title:'מנהגים ועדות',           desc:'מסורות לפי עדות',           href:'customs.html',         group:'עמודים', keys:['מנהגים','עדות','מסורת','תימן','ספרד','אשכנז','חסידות'] },
    { title:'מה אומרים כש…',          desc:'ברכות לרגעים של חיים',     href:'what-to-say.html',     group:'עמודים', keys:['ברכות','מה אומרים','לשון','מצב'] },
    { title:'פינת ילדים',             desc:'לימוד ותפילה לילדים',      href:'kids.html',            group:'עמודים', keys:['ילדים','פינה','לימוד','סיפור'] },
    { title:'ספר נשמות',              desc:'הנצחה ולזכר נשמת',          href:'memorial.html',        group:'עמודים', keys:['נשמות','זיכרון','לזכר','הנצחה','אזכרה'] },
    { title:'שאל רב',                 desc:'שאלות ותשובות הלכתיות',    href:'ask-rabbi.html',       group:'עמודים', keys:['שאל','רב','הלכה','שאלה','תשובה'] },
    { title:'לימוד יומי',             desc:'דף יומי, משנה, הלכה',      href:'learning.html',        group:'עמודים', keys:['לימוד','יומי','דף','משנה','הלכה','תורה'] },
    { title:'עלייה ונסיעה',           desc:'מדריך לעולים ומטיילים',    href:'aliyah-traveler.html', group:'עמודים', keys:['עלייה','נסיעה','טיול','ארץ ישראל'] },
    { title:'עברית יהודית 101',       desc:'מילון מושגים יהודיים',     href:'dictionary.html',      group:'עמודים', keys:['מילון','עברית','מושגים','לקסיקון'] },
    { title:'מדיניות פרטיות',         desc:'איך אנו שומרים את פרטיותך',href:'privacy.html',         group:'משפטי', keys:['פרטיות','privacy','מידע'] },
    { title:'תנאי שימוש',             desc:'כללי השימוש במערכת',        href:'terms.html',           group:'משפטי', keys:['תנאים','שימוש','terms'] },
    { title:'הצהרת נגישות',           desc:'נגישות ודרכי יצירת קשר',    href:'accessibility.html',   group:'משפטי', keys:['נגישות','accessibility'] },

    // ---- Prayer categories (jump to create with prefill) ----
    { title:'בקשה לרפואה שלמה',       desc:'תפילה לרפואת הגוף והנפש',  href:'#create', cat:'רפואה',         group:'קטגוריות', keys:['רפואה','חולה','בריאות','רפואה שלמה'] },
    { title:'בקשה לפרנסה',            desc:'שפע, עבודה, סגירת חודש',   href:'#create', cat:'פרנסה',         group:'קטגוריות', keys:['פרנסה','עבודה','שפע','כסף','הכנסה'] },
    { title:'בקשה לזיווג',            desc:'זיווג הגון ומתאים',         href:'#create', cat:'זוגיות',        group:'קטגוריות', keys:['זיווג','זוגיות','חתונה','אהבה'] },
    { title:'שלום בית',               desc:'איחוי ושלום במשפחה',       href:'#create', cat:'שלום בית',      group:'קטגוריות', keys:['שלום בית','משפחה','ריב','איחוי'] },
    { title:'תעסוקה',                 desc:'פתיחת שערים ועבודה טובה',   href:'#create', cat:'תעסוקה',        group:'קטגוריות', keys:['תעסוקה','עבודה','ראיון'] },
    { title:'ילדים ופוריות',          desc:'פרי בטן וילדים בריאים',    href:'#create', cat:'ילדים ופוריות', group:'קטגוריות', keys:['ילדים','פוריות','היריון','הריון'] },
    { title:'בקשה להצלחה',            desc:'סייעתא דשמיא בדרך',        href:'#create', cat:'הצלחה',         group:'קטגוריות', keys:['הצלחה','סיעתא','ניצחון'] },
    { title:'הודיה',                  desc:'מכתב תודה על נס גלוי',     href:'#create', cat:'הודיה',         group:'קטגוריות', keys:['הודיה','תודה','נס'] },

    // ---- Common keywords ----
    { title:'תהילים · פסוק של היום',  desc:'פסוק יומי למנוחת הלב',     href:'#hero',    group:'תוכן',   keys:['תהילים','פסוק','מזמור'] },
    { title:'סיפורי צדיקים',          desc:'מעשה שהיה, תקומה וניסים',  href:'#stories', group:'תוכן',   keys:['צדיקים','סיפור','נס','תקומה'] },
  ];

  function normalize(s){
    return String(s || '')
      .toLowerCase()
      .replace(/["'`׳״.,!?:;()[\]{}]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function score(entry, q){
    const nTitle = normalize(entry.title);
    const nDesc  = normalize(entry.desc);
    const nKeys  = (entry.keys || []).map(normalize).join(' ');
    let s = 0;
    const tokens = q.split(' ').filter(Boolean);
    tokens.forEach(t => {
      if (nTitle === t) s += 100;
      else if (nTitle.startsWith(t)) s += 40;
      else if (nTitle.includes(' ' + t) || nTitle.includes(t + ' ')) s += 28;
      else if (nTitle.includes(t)) s += 18;
      if (nKeys.includes(t)) s += 22;
      if (nDesc.includes(t)) s += 10;
    });
    return s;
  }

  function highlight(text, q){
    if (!q) return text;
    const parts = q.split(' ').filter(Boolean).sort((a, b) => b.length - a.length);
    let out = text;
    parts.forEach(p => {
      if (!p || p.length < 2) return;
      try {
        const re = new RegExp('(' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
        out = out.replace(re, '<mark>$1</mark>');
      } catch {}
    });
    return out;
  }

  function groupSort(a, b){
    const order = {'עמודים':1, 'קטגוריות':2, 'תוכן':3, 'משפטי':4};
    return (order[a] || 9) - (order[b] || 9);
  }

  let activeIndex = -1;
  let currentResults = [];

  function render(q){
    const nq = normalize(q);
    if (!nq){
      list.hidden = true;
      list.innerHTML = '';
      currentResults = [];
      activeIndex = -1;
      return;
    }

    const ranked = index
      .map(e => ({ e, s: score(e, nq) }))
      .filter(r => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 10);

    currentResults = ranked.map(r => r.e);
    activeIndex = currentResults.length ? 0 : -1;

    if (!ranked.length){
      list.innerHTML = '<div class="ms-sugg-empty">לא מצאנו תוצאה ל־"' + q.replace(/</g, '&lt;') + '". נסה מילת חיפוש אחרת.</div>';
      list.hidden = false;
      return;
    }

    const groups = {};
    ranked.forEach(({ e }) => {
      const g = e.group || 'תוצאות';
      (groups[g] = groups[g] || []).push(e);
    });

    let globalIdx = 0;
    const html = Object.keys(groups).sort(groupSort).map(g => {
      const items = groups[g].map(e => {
        const isActive = globalIdx === activeIndex;
        const titleHtml = highlight(e.title, nq);
        const subHtml   = e.desc ? '<span class="ms-sugg-sub">' + highlight(e.desc, nq) + '</span>' : '';
        const item = '<a class="ms-sugg-item' + (isActive ? ' is-active' : '') + '" href="' + e.href + '"' +
          (e.cat ? ' data-prefill-cat="' + e.cat.replace(/"/g, '&quot;') + '"' : '') +
          ' data-idx="' + globalIdx + '" role="option">' +
          '<span class="ms-sugg-ico" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,3 14.5,9 21,9 15.8,13 17.8,20 12,16 6.2,20 8.2,13 3,9 9.5,9"/></svg>' +
          '</span>' +
          '<span class="ms-sugg-text"><span class="ms-sugg-title">' + titleHtml + '</span>' + subHtml + '</span>' +
          '</a>';
        globalIdx++;
        return item;
      }).join('');
      return '<div class="ms-sugg-group"><div class="ms-sugg-head">' + g + '</div>' + items + '</div>';
    }).join('');

    list.innerHTML = html;
    list.hidden = false;
  }

  function navigateTo(entry){
    if (!entry) return;
    if (entry.cat){
      const sel = document.getElementById('category');
      if (sel){
        const m = [...sel.options].find(o => o.value === entry.cat || o.text === entry.cat);
        if (m) sel.value = m.value || m.text;
      }
    }
    if (entry.href.startsWith('#')){
      const target = document.querySelector(entry.href);
      if (target){
        target.scrollIntoView({ behavior:'smooth', block:'start' });
      } else {
        window.location.hash = entry.href;
      }
    } else {
      window.location.href = entry.href;
    }
    list.hidden = true;
    input.blur();
  }

  input.addEventListener('input', () => {
    if (clear) clear.hidden = !input.value;
    render(input.value);
  });

  input.addEventListener('focus', () => {
    if (input.value) render(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (list.hidden && (e.key === 'ArrowDown' || e.key === 'Enter')){
      if (input.value) render(input.value);
    }
    if (e.key === 'ArrowDown'){
      e.preventDefault();
      if (!currentResults.length) return;
      activeIndex = (activeIndex + 1) % currentResults.length;
      updateActive();
    } else if (e.key === 'ArrowUp'){
      e.preventDefault();
      if (!currentResults.length) return;
      activeIndex = (activeIndex - 1 + currentResults.length) % currentResults.length;
      updateActive();
    } else if (e.key === 'Escape'){
      list.hidden = true;
    }
  });

  function updateActive(){
    list.querySelectorAll('.ms-sugg-item').forEach(el => {
      const i = parseInt(el.getAttribute('data-idx') || '-1', 10);
      el.classList.toggle('is-active', i === activeIndex);
      if (i === activeIndex) el.scrollIntoView({ block:'nearest' });
    });
  }

  list.addEventListener('click', (e) => {
    const a = e.target.closest('.ms-sugg-item');
    if (!a) return;
    e.preventDefault();
    const idx = parseInt(a.getAttribute('data-idx') || '-1', 10);
    if (idx >= 0 && currentResults[idx]) navigateTo(currentResults[idx]);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentResults[activeIndex]) navigateTo(currentResults[activeIndex]);
    else if (input.value.trim()){
      const nq = normalize(input.value);
      const best = index
        .map(en => ({ en, s: score(en, nq) }))
        .sort((a, b) => b.s - a.s)[0];
      if (best && best.s > 0) navigateTo(best.en);
    }
  });

  if (clear){
    clear.addEventListener('click', () => {
      input.value = '';
      clear.hidden = true;
      list.hidden = true;
      list.innerHTML = '';
      input.focus();
    });
  }

  document.querySelectorAll('.ms-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.getAttribute('data-q') || btn.textContent || '';
      if (clear) clear.hidden = !input.value;
      render(input.value);
      input.focus();
    });
  });

  document.addEventListener('click', (e) => {
    const ms = document.getElementById('megaSearch');
    if (!ms) return;
    if (!ms.contains(e.target)) list.hidden = true;
  });
})();
