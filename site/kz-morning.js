/* ============================================================
   KZ MORNING — daily morning ritual
   Steps: modeh → brachot → intent → done.
   ============================================================ */
(function(){
  'use strict';
  const $ = (s) => document.querySelector(s);
  const STREAK_KEY = 'kz_morning_streak_v1';
  const INTENT_KEY = 'kz_morning_intent_v1';

  function todayKey(){ return new Date().toISOString().slice(0,10); }
  function yesterdayKey(){
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0,10);
  }
  function loadStreak(){
    try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"count":0,"lastDate":""}'); }
    catch { return { count: 0, lastDate: '' }; }
  }
  function saveStreak(s){ try { localStorage.setItem(STREAK_KEY, JSON.stringify(s)); } catch {} }

  /* Greeting tailored to time of day */
  const h = new Date().getHours();
  let greet = 'בוקר טוב', sub = 'היום הוא מתנה. מה תעשי איתו?';
  if (h >= 11 && h < 17){ greet = 'צהריים טובים'; sub = 'אם פספסת בוקר — אין סיפא. הקב״ה איתך עכשיו.'; }
  else if (h >= 17){ greet = 'אתחיל מחר?'; sub = 'אפשר גם בערב. אבל מחר נתחיל בבוקר ✦'; }
  $('#mnGreet').textContent = greet;
  $('#mnSubGreet').textContent = sub;

  /* Render streak */
  const s = loadStreak();
  $('#mnStreak').innerHTML = `🌅 <b>${s.count}</b> בקרים ברצף`;

  /* Step navigation */
  const stepOrder = ['modeh','brachot','intent','done'];
  let stepIdx = 0;
  function show(step){
    document.querySelectorAll('.mn-step').forEach(el => {
      el.classList.toggle('is-on', el.dataset.step === step);
    });
  }
  function next(){
    stepIdx++;
    if (stepIdx >= stepOrder.length) return;
    show(stepOrder[stepIdx]);
  }

  document.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', next));

  /* Intents */
  let pickedIntent = null;
  document.querySelectorAll('.mn-intent').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.mn-intent').forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      pickedIntent = b.dataset.i;
      $('#mnCustomIntent').value = '';
    });
  });
  $('#mnCustomIntent').addEventListener('input', () => {
    document.querySelectorAll('.mn-intent').forEach(x => x.classList.remove('is-on'));
    pickedIntent = $('#mnCustomIntent').value.trim();
  });

  $('#mnIntentSave').addEventListener('click', () => {
    const intent = pickedIntent || ($('#mnCustomIntent').value.trim());
    if (!intent){ $('#mnCustomIntent').focus(); return; }
    /* Save intent for the day */
    try { localStorage.setItem(INTENT_KEY, JSON.stringify({ date: todayKey(), intent })); } catch {}
    /* Update streak */
    const today = todayKey();
    const cur = loadStreak();
    if (cur.lastDate !== today){
      cur.count = (cur.lastDate === yesterdayKey()) ? (cur.count + 1) : 1;
      cur.lastDate = today;
      saveStreak(cur);
    }
    $('#mnStreak').innerHTML = `🌅 <b>${cur.count}</b> בקרים ברצף`;
    $('#mnIntentSummary').innerHTML = `הכוונה היומית שלי:<br><b>"${escapeHtml(intent)}"</b>`;
    next();
  });

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
})();
