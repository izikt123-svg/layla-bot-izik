/* ============================================================
   KZ HOME — unified time-of-day-aware dashboard
   ============================================================ */
(function(){
  'use strict';
  const $ = (s) => document.querySelector(s);

  function loadJson(key, def){
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); }
    catch { return def; }
  }

  const profile = loadJson('kz_profile_v1', null);
  const moStreak = loadJson('kz_60s_streak_v1', { count:0 });
  const mnStreak = loadJson('kz_morning_streak_v1', { count:0 });
  const dlStreak = loadJson('kz_learning_streak_v1', { count:0 });

  /* Greeting + name */
  const h = new Date().getHours();
  const day = new Date().getDay();
  let greet = 'בוקר טוב', subtitle = 'הבית שלך פתוח. מה תבחרי היום?';
  if (h >= 11 && h < 17){ greet = 'צהריים טובים'; subtitle = 'אמצע היום — רגע לעצור ולהתחבר?'; }
  else if (h >= 17 && h < 21){ greet = 'ערב טוב'; subtitle = 'הערב מתקרב. ברכה לסוף יום מבורך.'; }
  else if (h >= 21 || h < 5){ greet = 'לילה טוב'; subtitle = 'לפני השינה — קריאת שמע על המיטה.'; }

  // Friday-eve / Shabbat overrides
  if (day === 5 && h >= 12){ greet = 'ערב שבת'; subtitle = 'השבת מתקרבת. בוא נתכונן יחד.'; }
  if (day === 6){ greet = 'שבת שלום ✦'; subtitle = 'שבת קודש. מנוחה ונחת.'; }

  $('#hmGreet').textContent = greet;
  $('#hmSubtitle').textContent = subtitle;
  if (profile?.name){
    $('#hmName').textContent = `שלום ${profile.name}`;
  } else {
    $('#hmName').textContent = 'ברוכה הבאה';
  }

  /* Streaks */
  const streaksEl = $('#hmStreaks');
  const streaks = [
    { count: mnStreak.count || 0, label: 'בקרים', icon:'🌅' },
    { count: moStreak.count || 0, label: '60 שניות', icon:'✦' },
    { count: dlStreak.count || 0, label: 'לימוד', icon:'📚' }
  ].filter(s => s.count > 0);
  if (streaks.length){
    streaksEl.innerHTML = streaks.map(s => `<span class="hm-streak">${s.icon} <b>${s.count}</b> ${s.label}</span>`).join('');
  }

  /* Daily smart tile */
  function dailyHtml(){
    if (day === 6){
      return `<div class="hm-daily-title">🕯 שבת שלום ✦</div>
        <div class="hm-daily-actions">
          <a class="hm-daily-btn" href="/candles-cinema.html">📺 קיר נרות (מסך מלא)</a>
          <a class="hm-daily-btn hm-daily-btn-secondary" href="/cantor.html">🎤 מצב חזן</a>
          <a class="hm-daily-btn hm-daily-btn-secondary" href="/daily-tehilim.html">📿 תהילים</a>
        </div>`;
    }
    if (day === 5 && h >= 12){
      return `<div class="hm-daily-title">⏳ השבת מתקרבת — מה כדאי לעשות עכשיו?</div>
        <div class="hm-daily-actions">
          <a class="hm-daily-btn" href="/shabbat-candles.html">🕯 הדליקי נר</a>
          <a class="hm-daily-btn hm-daily-btn-secondary" href="/shabbat-recipes.html">🍞 מתכוני שבת</a>
          <a class="hm-daily-btn hm-daily-btn-secondary" href="/prayer-wall.html">🙏 בקשות תפילה</a>
        </div>`;
    }
    if (h >= 5 && h < 11){
      return `<div class="hm-daily-title">🌅 התחילי את היום עם השם</div>
        <div class="hm-daily-actions">
          <a class="hm-daily-btn" href="/morning.html">🌅 בוקר טוב להשם</a>
          <a class="hm-daily-btn hm-daily-btn-secondary" href="/moment.html">✦ 60 שניות</a>
          <a class="hm-daily-btn hm-daily-btn-secondary" href="/daily-tehilim.html">📿 תהילים</a>
        </div>`;
    }
    if (h >= 11 && h < 17){
      return `<div class="hm-daily-title">📚 הפסקת תורה של 5 דקות</div>
        <div class="hm-daily-actions">
          <a class="hm-daily-btn" href="/daily-learning.html">📚 לימוד יומי</a>
          <a class="hm-daily-btn hm-daily-btn-secondary" href="/moment.html">✦ 60 שניות</a>
          <a class="hm-daily-btn hm-daily-btn-secondary" href="/prayer-wall.html">🙏 קיר תפילות</a>
        </div>`;
    }
    if (h >= 17 && h < 21){
      return `<div class="hm-daily-title">🌇 לפני שיוצאת מהיום — תני ברכה</div>
        <div class="hm-daily-actions">
          <a class="hm-daily-btn" href="/prayer-wall.html">🙏 התפללי על אחר</a>
          <a class="hm-daily-btn hm-daily-btn-secondary" href="/moment.html">✦ 60 שניות</a>
          <a class="hm-daily-btn hm-daily-btn-secondary" href="/index.html#donate">💝 צדקה</a>
        </div>`;
    }
    return `<div class="hm-daily-title">🌙 לילה — סיפור או מחשבה רכה</div>
      <div class="hm-daily-actions">
        <a class="hm-daily-btn" href="/kids-bedtime.html">🌙 סיפור לפני השינה</a>
        <a class="hm-daily-btn hm-daily-btn-secondary" href="/moment.html">✦ 60 שניות</a>
        <a class="hm-daily-btn hm-daily-btn-secondary" href="/daily-learning.html">📖 הלכה יומית</a>
      </div>`;
  }
  $('#hmDaily').innerHTML = dailyHtml();

  /* Hero is now the Jewish-life collage (real photo with SVG fallback).
     The 'data-kz-hero="jewishLife"' attribute is rendered automatically
     by kz-image.js. No JS needed here. */
})();
