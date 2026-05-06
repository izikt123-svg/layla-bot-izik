/* ============================================================
   FAMILY ROOM — Logic
   Local-first (localStorage). Single family per device for now.
   Designed to plug into a real backend later.
   ============================================================ */
(function(){
  'use strict';

  const STORAGE_KEY = 'kz-family-room-v1';
  const MY_KEY      = 'kz-family-me-v1';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* ─── State ──────────────────────────────────────── */
  let state = null;     // { family, prayers, candles, yahrzeits, events, tehillim, members }
  let me = null;        // { id, name }

  /* ─── Storage ────────────────────────────────────── */
  function load(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      state = raw ? JSON.parse(raw) : null;
    } catch(_){ state = null; }
    try {
      const rawMe = localStorage.getItem(MY_KEY);
      me = rawMe ? JSON.parse(rawMe) : null;
    } catch(_){ me = null; }
  }
  function save(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(_){}
    try { if (me) localStorage.setItem(MY_KEY, JSON.stringify(me)); } catch(_){}
  }

  /* ─── ID + code helpers ──────────────────────────── */
  function uid(){ return 'id-' + Math.random().toString(36).slice(2, 10); }
  function familyCode(name){
    const ascii = (name || '').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5) || 'FAM';
    const tail = Math.random().toString(36).slice(2, 5).toUpperCase();
    return `${ascii}-${tail}`;
  }

  /* ─── Hebrew date conversion (approximate) ───────── */
  // Accurate Hebrew calendar would require Hebcal library.
  // For now we'll use the gregorian date and add Hebrew month rough labels.
  function gregToHebrew(date){
    // Use Intl with hebrew calendar
    try {
      const fmt = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      return fmt.format(date);
    } catch(_){
      return date.toLocaleDateString('he-IL');
    }
  }
  function gregToHebrewShort(date){
    try {
      const fmt = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
        day: 'numeric', month: 'short'
      });
      return fmt.format(date);
    } catch(_){
      return date.toLocaleDateString('he-IL', { day:'numeric', month:'short' });
    }
  }
  function gregShortDate(date){
    return date.toLocaleDateString('he-IL', { day:'numeric', month:'short' });
  }

  function daysUntilNextHebrewAnniv(deathDate){
    // Approximate: get next gregorian anniversary near deathDate
    const today = new Date();
    const next = new Date(deathDate);
    next.setFullYear(today.getFullYear());
    if (next < today) next.setFullYear(today.getFullYear() + 1);
    return Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  }

  /* ─── Time formatting ────────────────────────────── */
  function timeAgo(ts){
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 60)    return 'כעת';
    const min = Math.floor(sec / 60);
    if (min < 60)    return `לפני ${min} דק׳`;
    const hr = Math.floor(min / 60);
    if (hr < 24)     return `לפני ${hr} שעות`;
    const day = Math.floor(hr / 24);
    if (day < 7)     return `לפני ${day} ימים`;
    return new Date(ts).toLocaleDateString('he-IL');
  }

  /* ─── Empty / Active screens ─────────────────────── */
  function showEmpty(){
    $('#frEmpty').hidden = false;
    $('#frRoom').hidden = true;
  }
  function showRoom(){
    $('#frEmpty').hidden = true;
    $('#frRoom').hidden = false;
    renderAll();
  }

  /* ─── Modal helpers ──────────────────────────────── */
  function openModal(id){
    const m = $(id);
    if (!m) return;
    m.hidden = false;
    setTimeout(() => {
      const f = m.querySelector('input, textarea, select');
      if (f) f.focus();
    }, 80);
  }
  function closeModal(id){
    if (typeof id === 'string'){ const m = $(id); if (m) m.hidden = true; }
    else $$('.fr-modal').forEach(m => m.hidden = true);
  }
  document.addEventListener('click', (e) => {
    if (e.target.matches('.fr-modal-back, [data-close]')){
      const m = e.target.closest('.fr-modal');
      if (m) m.hidden = true;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $$('.fr-modal:not([hidden])').forEach(m => m.hidden = true);
  });

  /* ─── Toast ──────────────────────────────────────── */
  function toast(msg, ico='✦'){
    const old = $('.fr-toast'); if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'fr-toast';
    t.innerHTML = `<span class="fr-toast-ico">${ico}</span>${msg}`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('is-visible'));
    setTimeout(() => {
      t.classList.remove('is-visible');
      setTimeout(() => t.remove(), 400);
    }, 2200);
  }

  /* ─── Create / Join family ───────────────────────── */
  function createFamily(){
    const name = ($('#frNewFamName').value || '').trim();
    const myName = ($('#frNewMyName').value || '').trim();
    if (!name || !myName){ toast('מלא את השדות', '⚠'); return; }
    me = { id: uid(), name: myName };
    state = {
      family: { id: uid(), name, code: familyCode(name), createdAt: Date.now() },
      members: [{ id: me.id, name: myName, online: true, joinedAt: Date.now() }],
      prayers: [],
      candles: [],
      yahrzeits: [],
      events: [],
      tehillim: null,
      activity: []
    };
    save();
    closeModal();
    showRoom();
    toast(`ברוך הבא ל${name}`, '🏠');
    pushActivity(`${myName} פתח את חדר המשפחה`);
  }
  function joinFamily(){
    const code = ($('#frJoinCode').value || '').trim().toUpperCase();
    const myName = ($('#frJoinMyName').value || '').trim();
    if (!code || !myName){ toast('מלא את השדות', '⚠'); return; }
    // Without backend we cannot truly fetch others' rooms.
    // Demo: create a stub family with that code, so user can begin.
    if (state && state.family.code === code){
      me = { id: uid(), name: myName };
      state.members.push({ id: me.id, name: myName, online: true, joinedAt: Date.now() });
      save();
      closeModal();
      showRoom();
      pushActivity(`${myName} הצטרף לחדר`);
      toast(`ברוך הבא ${myName}`, '✦');
      return;
    }
    me = { id: uid(), name: myName };
    state = {
      family: { id: uid(), name: 'משפחה', code, createdAt: Date.now() },
      members: [{ id: me.id, name: myName, online: true, joinedAt: Date.now() }],
      prayers: [], candles: [], yahrzeits: [], events: [], tehillim: null, activity: []
    };
    save();
    closeModal();
    showRoom();
    toast(`ברוך הבא ${myName}`, '✦');
    pushActivity(`${myName} הצטרף לחדר`);
  }

  /* ─── Activity ────────────────────────────────────── */
  function pushActivity(text){
    if (!state.activity) state.activity = [];
    state.activity.unshift({ id: uid(), text, ts: Date.now() });
    state.activity = state.activity.slice(0, 50);
    save();
    flashActivity(text);
  }
  function flashActivity(text){
    const wrap = $('#frActivity');
    const el = $('#frActivityText');
    if (!wrap || !el) return;
    el.textContent = text;
    wrap.classList.add('is-glow');
    setTimeout(() => wrap.classList.remove('is-glow'), 1800);
  }

  /* ─── Header rendering ───────────────────────────── */
  function renderHeader(){
    $('#frFamName').textContent = state.family.name;
    $('#frFamCode').textContent = state.family.code;
    $('#frFamSince').textContent = new Date(state.family.createdAt).toLocaleDateString('he-IL');
    const bar = $('#frMembersBar');
    bar.innerHTML = state.members.map(m => {
      const initials = (m.name || '?').slice(0, 1);
      const online = m.online ? 'online' : '';
      return `<div class="fr-avatar ${online}" title="${escapeHtml(m.name)}">${escapeHtml(initials)}</div>`;
    }).join('');
  }

  /* ─── Prayers ─────────────────────────────────────── */
  const CAT_COLORS = {
    'רפואה': '#dc2626',
    'פרנסה': '#059669',
    'זוגיות': '#db2777',
    'שלום בית': '#7c3aed',
    'ילדים ופוריות': '#0891b2',
    'הצלחה': '#ca8a04',
    'הודיה': '#d97706',
    'זיכרון': '#6b21a8',
    'כללי': '#475569'
  };
  function renderPrayers(){
    const list = $('#frPrayersList');
    if (!state.prayers.length){
      list.innerHTML = `<div class="fr-empty-mini">אין בקשות פעילות. הוסף את הראשונה.</div>`;
      return;
    }
    list.innerHTML = state.prayers.map(p => {
      const color = CAT_COLORS[p.cat] || CAT_COLORS['כללי'];
      const isPraying = p.prayingNow && p.prayingNow.includes(me.id);
      return `
        <div class="fr-prayer" data-id="${p.id}">
          <span class="fr-prayer-cat" style="background:${color}">${escapeHtml(p.cat)}</span>
          ${p.forWhom ? `<div class="fr-prayer-for">${escapeHtml(p.forWhom)}</div>` : ''}
          ${p.text ? `<div class="fr-prayer-text">${escapeHtml(p.text)}</div>` : ''}
          <div class="fr-prayer-foot">
            <span class="fr-prayer-author">${escapeHtml(p.author)}</span>
            <span class="fr-prayer-time">${timeAgo(p.createdAt)}</span>
            <span class="fr-prayer-counter">🕯 ${p.totalPrayers || 0}</span>
          </div>
          <button class="fr-pray-btn ${isPraying ? 'is-praying' : ''}" data-pray="${p.id}">
            ${isPraying ? '✓ אני מתפלל על זה' : 'אני מתפלל על זה'}
          </button>
        </div>`;
    }).join('');
  }
  function addPrayer(){
    const cat = $('#frPrayerCat').value;
    const forWhom = ($('#frPrayerFor').value || '').trim();
    const text = ($('#frPrayerText').value || '').trim();
    if (!forWhom && !text){ toast('כתוב למי או מה הבקשה', '⚠'); return; }
    const p = {
      id: uid(),
      cat, forWhom, text,
      author: me.name,
      createdAt: Date.now(),
      prayingNow: [],
      totalPrayers: 0
    };
    state.prayers.unshift(p);
    save();
    closeModal();
    renderPrayers();
    pushActivity(`${me.name} הוסיף בקשה: ${forWhom || cat}`);
    $('#frPrayerFor').value = '';
    $('#frPrayerText').value = '';
  }
  function togglePray(id){
    const p = state.prayers.find(x => x.id === id);
    if (!p) return;
    p.prayingNow = p.prayingNow || [];
    const idx = p.prayingNow.indexOf(me.id);
    if (idx >= 0){
      p.prayingNow.splice(idx, 1);
    } else {
      p.prayingNow.push(me.id);
      p.totalPrayers = (p.totalPrayers || 0) + 1;
      pushActivity(`${me.name} מתפלל על ${p.forWhom || p.cat}`);
      // Glow effect
      const card = document.querySelector(`.fr-prayer[data-id="${id}"]`);
      if (card){
        card.classList.add('fr-praying-glow');
        setTimeout(() => card.classList.remove('fr-praying-glow'), 1500);
      }
    }
    save();
    renderPrayers();
  }

  /* ─── Candles ─────────────────────────────────────── */
  function renderCandles(){
    const grid = $('#frCandlesGrid');
    const empty = $('#frCandlesEmpty');
    if (!state.candles.length){
      grid.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    grid.innerHTML = state.candles.map(c => `
      <div class="fr-candle">
        <div class="fr-candle-flame"></div>
        <div class="fr-candle-for">${escapeHtml(c.forWhom)}</div>
        ${c.note ? `<div class="fr-candle-note">${escapeHtml(c.note)}</div>` : ''}
        <div class="fr-candle-by">הדליק/ה ${escapeHtml(c.litBy)}</div>
      </div>`).join('');
  }
  function addCandle(){
    const forWhom = ($('#frCandleFor').value || '').trim();
    const note = ($('#frCandleNote').value || '').trim();
    if (!forWhom){ toast('הזן שם', '⚠'); return; }
    state.candles.unshift({
      id: uid(), forWhom, note,
      litBy: me.name,
      litAt: Date.now()
    });
    save();
    closeModal();
    renderCandles();
    pushActivity(`${me.name} הדליק נר ל${forWhom}`);
    toast(`נר הודלק ל${forWhom} 🕯`);
    $('#frCandleFor').value = '';
    $('#frCandleNote').value = '';
  }

  /* ─── Yahrzeit ────────────────────────────────────── */
  function renderYahrzeit(){
    const list = $('#frYahrzeitList');
    const empty = $('#frYahrzeitEmpty');
    if (!state.yahrzeits.length){
      list.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    // Sort by upcoming
    const sorted = [...state.yahrzeits].sort((a, b) =>
      daysUntilNextHebrewAnniv(new Date(a.date)) - daysUntilNextHebrewAnniv(new Date(b.date))
    );
    list.innerHTML = sorted.map(y => {
      const d = new Date(y.date);
      const days = daysUntilNextHebrewAnniv(d);
      const isSoon = days <= 7;
      return `
        <div class="fr-yahrzeit-item ${isSoon ? 'is-soon' : ''}">
          <div class="fr-yz-date">
            <strong>${gregShortDate(d).split(' ')[0]}</strong>
            <small>${gregToHebrewShort(d)}</small>
          </div>
          <div class="fr-yz-info">
            <div class="fr-yz-name">${escapeHtml(y.name)}</div>
            <div class="fr-yz-meta">
              ${escapeHtml(y.relation)}
              ${isSoon ? ` · בעוד ${days} ימים` : ''}
            </div>
          </div>
          <div class="fr-yz-flame" title="הדלק נר">🕯</div>
        </div>`;
    }).join('');
  }
  function addYahrzeit(){
    const name = ($('#frYzName').value || '').trim();
    const relation = ($('#frYzRelation').value || '').trim();
    const date = $('#frYzDate').value;
    if (!name || !date){ toast('שם ותאריך נדרשים', '⚠'); return; }
    state.yahrzeits.push({ id: uid(), name, relation, date });
    save();
    closeModal();
    renderYahrzeit();
    pushActivity(`${me.name} הוסיף יארצייט: ${name}`);
    $('#frYzName').value = '';
    $('#frYzRelation').value = '';
    $('#frYzDate').value = '';
  }

  /* ─── Life Events ─────────────────────────────────── */
  const EVENT_EMOJI = {
    brit: '👶', bar: '✡', bat: '✡', wedding: '💍',
    birth: '🌟', birthday: '🎂', aliyah: '✈', other: '✦'
  };
  const EVENT_LABEL = {
    brit: 'ברית', bar: 'בר מצווה', bat: 'בת מצווה', wedding: 'חתונה',
    birth: 'לידה', birthday: 'יום הולדת', aliyah: 'עלייה', other: 'אירוע'
  };
  function renderEvents(){
    const list = $('#frEventsList');
    const empty = $('#frEventsEmpty');
    if (!state.events.length){
      list.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    const sorted = [...state.events].sort((a, b) => new Date(a.date) - new Date(b.date));
    list.innerHTML = sorted.map(ev => {
      const d = new Date(ev.date);
      return `
        <div class="fr-event-item">
          <span class="fr-ev-emoji">${EVENT_EMOJI[ev.type] || '✦'}</span>
          <div class="fr-ev-date">
            <strong>${d.getDate()}</strong>
            <small>${d.toLocaleDateString('he-IL', { month:'short' })}</small>
          </div>
          <div class="fr-yz-info">
            <div class="fr-yz-name">${escapeHtml(EVENT_LABEL[ev.type] || ev.type)} · ${escapeHtml(ev.who)}</div>
            <div class="fr-yz-meta">${gregToHebrewShort(d)}</div>
          </div>
        </div>`;
    }).join('');
  }
  function addEvent(){
    const type = $('#frEvType').value;
    const who = ($('#frEvName').value || '').trim();
    const date = $('#frEvDate').value;
    if (!who || !date){ toast('מלא את השדות', '⚠'); return; }
    state.events.push({ id: uid(), type, who, date });
    save();
    closeModal();
    renderEvents();
    pushActivity(`${me.name} הוסיף אירוע: ${EVENT_LABEL[type]} ל${who}`);
    $('#frEvName').value = '';
    $('#frEvDate').value = '';
  }

  /* ─── Members ─────────────────────────────────────── */
  function addMember(){
    const name = ($('#frMemName').value || '').trim();
    const role = ($('#frMemRole').value || '').trim();
    if (!name){ toast('הזן שם', '⚠'); return; }
    state.members.push({ id: uid(), name, role, online: false, joinedAt: Date.now() });
    save();
    closeModal();
    renderHeader();
    pushActivity(`${name} נוסף לחדר`);
    $('#frMemName').value = '';
    $('#frMemRole').value = '';
  }

  /* ─── Tehillim split ─────────────────────────────── */
  function renderTehillim(){
    const body = $('#frTehBody');
    if (!state.tehillim){
      body.innerHTML = `<div class="fr-teh-empty">
        אין חלוקה פעילה. לחץ על "חלק חדש" כדי להתחיל תהלים משפחתי.
      </div>`;
      $('#frTehTitle').textContent = 'תהלים מחולק למשפחה';
      return;
    }
    const t = state.tehillim;
    const completed = Object.keys(t.completed).length;
    const pct = Math.round((completed / 150) * 100);
    const myChapters = Object.keys(t.assignments).filter(ch => t.assignments[ch] === me.id);
    $('#frTehTitle').textContent = `תהלים יחד · ${t.occasion}`;

    const chaptersHtml = Array.from({length: 150}, (_, i) => {
      const ch = i + 1;
      const assignedTo = t.assignments[ch];
      const member = state.members.find(m => m.id === assignedTo);
      const isMine = assignedTo === me.id;
      const isDone = !!t.completed[ch];
      const cls = [
        assignedTo ? 'assigned' : '',
        isDone ? 'completed' : '',
        isMine && !isDone ? 'mine' : ''
      ].filter(Boolean).join(' ');
      const title = member ? `פרק ${ch} · ${member.name}${isDone ? ' ✓' : ''}` : `פרק ${ch}`;
      return `<div class="fr-teh-chapter ${cls}" data-chapter="${ch}" title="${escapeHtml(title)}">${ch}</div>`;
    }).join('');

    body.innerHTML = `
      <div class="fr-teh-active">
        <div class="fr-teh-occasion">${escapeHtml(t.occasion)}</div>
        <div class="fr-teh-progress-wrap">
          <div class="fr-teh-progress-bar">
            <div class="fr-teh-progress-fill" style="width:${pct}%"></div>
          </div>
          <div class="fr-teh-progress-text">
            <span><strong>${completed}</strong> מתוך 150 פרקים</span>
            <span><strong>${pct}%</strong></span>
          </div>
        </div>
        <div class="fr-teh-progress-text" style="margin-bottom:10px">
          <span>הפרקים שלך: <strong>${myChapters.join(', ') || 'אין הקצאה'}</strong></span>
        </div>
      </div>
      <div class="fr-teh-chapters">${chaptersHtml}</div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="fr-mini-btn" id="frTehFinish" style="flex:1">סיום ${pct === 100 ? '✓' : '(' + pct + '%)' }</button>
        <button class="fr-mini-btn" id="frTehCancel">בטל חלוקה</button>
      </div>`;

    // Bind chapter clicks — toggle complete on my chapters
    body.querySelectorAll('.fr-teh-chapter').forEach(el => {
      el.addEventListener('click', () => {
        const ch = parseInt(el.dataset.chapter, 10);
        const assignedTo = state.tehillim.assignments[ch];
        if (assignedTo !== me.id){
          // Allow claiming unassigned chapters
          if (!assignedTo){
            state.tehillim.assignments[ch] = me.id;
            save();
            renderTehillim();
            pushActivity(`${me.name} לקח על עצמו פרק ${ch}`);
          } else {
            toast('הפרק שייך לבן משפחה אחר', '⚠');
          }
          return;
        }
        // Toggle complete
        if (state.tehillim.completed[ch]){
          delete state.tehillim.completed[ch];
        } else {
          state.tehillim.completed[ch] = { by: me.id, at: Date.now() };
          pushActivity(`${me.name} סיים פרק ${ch}`);
          // Check if all done
          if (Object.keys(state.tehillim.completed).length === 150){
            toast('🎊 ספר תהלים הושלם בזכותכם!', '🎉');
            pushActivity(`המשפחה סיימה תהלים שלם ל${state.tehillim.occasion}`);
          }
        }
        save();
        renderTehillim();
      });
    });
    $('#frTehCancel').addEventListener('click', () => {
      if (confirm('לבטל את החלוקה הנוכחית?')){
        state.tehillim = null;
        save();
        renderTehillim();
      }
    });
  }
  function startTehillim(){
    const occasion = ($('#frTehOccasion').value || '').trim();
    if (!occasion){ toast('הזן זכות / סיבה', '⚠'); return; }
    // Distribute chapters among members
    const members = state.members;
    if (!members.length) members.push({ id: me.id, name: me.name });
    const assignments = {};
    const memCount = members.length;
    const baseChunk = Math.floor(150 / memCount);
    const remainder = 150 % memCount;
    let chapter = 1;
    members.forEach((mem, idx) => {
      const count = baseChunk + (idx < remainder ? 1 : 0);
      for (let i = 0; i < count; i++){
        assignments[chapter] = mem.id;
        chapter++;
      }
    });
    state.tehillim = {
      id: uid(),
      occasion,
      startedAt: Date.now(),
      assignments,
      completed: {}
    };
    save();
    closeModal();
    renderTehillim();
    pushActivity(`${me.name} פתח חלוקת תהלים: ${occasion}`);
    toast('תהלים מחולק! לחץ על הפרקים שלך לסמן סיום', '📖');
    $('#frTehOccasion').value = '';
  }

  /* ─── Render all ─────────────────────────────────── */
  function renderAll(){
    renderHeader();
    renderPrayers();
    renderCandles();
    renderYahrzeit();
    renderEvents();
    renderTehillim();
    if (state.activity && state.activity.length){
      $('#frActivityText').textContent = state.activity[0].text + ' · ' + timeAgo(state.activity[0].ts);
    }
  }

  /* ─── Bindings ───────────────────────────────────── */
  function bindUI(){
    $('#frCreateBtn').addEventListener('click', () => openModal('#frCreateModal'));
    $('#frJoinBtn').addEventListener('click', () => openModal('#frJoinModal'));
    $('#frCreateConfirm').addEventListener('click', createFamily);
    $('#frJoinConfirm').addEventListener('click', joinFamily);

    $('#frAddPrayerBtn')?.addEventListener('click', () => openModal('#frPrayerModal'));
    $('#frPrayerConfirm')?.addEventListener('click', addPrayer);

    $('#frLightCandleBtn')?.addEventListener('click', () => openModal('#frCandleModal'));
    $('#frCandleConfirm')?.addEventListener('click', addCandle);

    $('#frAddYahrzeitBtn')?.addEventListener('click', () => openModal('#frYahrzeitModal'));
    $('#frYzConfirm')?.addEventListener('click', addYahrzeit);

    $('#frAddEventBtn')?.addEventListener('click', () => openModal('#frEventModal'));
    $('#frEvConfirm')?.addEventListener('click', addEvent);

    $('#frAddMemberBtn')?.addEventListener('click', () => openModal('#frMemberModal'));
    $('#frMemConfirm')?.addEventListener('click', addMember);

    $('#frNewTehBtn')?.addEventListener('click', () => openModal('#frTehModal'));
    $('#frTehConfirm')?.addEventListener('click', startTehillim);

    $('#frShareCodeBtn')?.addEventListener('click', () => {
      const code = state.family.code;
      const text = `הצטרף לחדר התפילות של ${state.family.name}.\nקוד: ${code}\nhttps://${location.host}/family-room.html`;
      if (navigator.share){
        navigator.share({ title: 'חדר משפחה', text }).catch(()=>{});
      } else {
        navigator.clipboard?.writeText(text);
        toast('הקוד הועתק והודעה מוכנה לשליחה');
      }
    });

    $('#frEditNameBtn')?.addEventListener('click', () => {
      const newName = prompt('שם חדש למשפחה:', state.family.name);
      if (newName && newName.trim()){
        state.family.name = newName.trim();
        save();
        renderHeader();
      }
    });

    // Delegate prayer button clicks
    $('#frPrayersList')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-pray]');
      if (btn) togglePray(btn.dataset.pray);
    });
  }

  /* ─── Helpers ────────────────────────────────────── */
  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  /* ─── Live ticker (refresh times) ────────────────── */
  function startTicker(){
    setInterval(() => {
      if (state) renderPrayers();
    }, 60000);
    // Activity stream rotation
    setInterval(() => {
      if (!state || !state.activity || !state.activity.length) return;
      const recent = state.activity[Math.floor(Math.random() * Math.min(5, state.activity.length))];
      $('#frActivityText').textContent = recent.text + ' · ' + timeAgo(recent.ts);
    }, 7000);
  }

  /* ─── Init ───────────────────────────────────────── */
  function init(){
    load();
    bindUI();
    if (state && me){
      showRoom();
    } else {
      showEmpty();
    }
    startTicker();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
