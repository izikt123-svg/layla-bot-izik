/* ============================================================
   KZ TZADDIK TOUR — GPS-triggered audio stories at tzaddikim graves
   - Watches geolocation; when within 200m of any cat:'tomb', shows
     a beautiful card with a short story + "play" using TTS.
   - Optional: pre-recorded audio if `audio` is set on the place.
   ============================================================ */
(function(){
  'use strict';

  // Curated stories (short, evocative). Extend in jewish-places.js by adding `story`.
  const STORIES = {
    'meron':       'הרשב"י, בעל הזוהר. נסתרה ממנו וממנו רחל אמנו 13 שנה במערה. לימוד הזוהר במקום הזה — סגולה לשמירה.',
    'rachel':      'רחל אמנו, "קול ברמה נשמע, רחל מבכה על בניה". מי שמתפלל כאן — תפילתו עולה ישירות.',
    'machpela':    'מערת המכפלה — אברהם, יצחק, יעקב, שרה, רבקה, לאה. שורש האומה.',
    'ari-tomb':    'האר"י הקדוש — מורה דרך הקבלה. 38 שנים בלבד חי, ושינה את העולם.',
    'rambam-tomb': 'הרמב"ם — "ממשה עד משה לא קם כמשה". פילוסוף, רופא, פוסק.',
    'baba-sali':   'הבבא סאלי — "אם תעלו לקברי, אקח אתכם לפני בית דין של מעלה". סגולת ישועות.',
    'ohel-rebbe':  'הרבי מליובאוויטש — אהבת ישראל ללא גבול. גם היום, רוח חב"ד מורגשת באוהל.'
  };

  function distM(a, b){
    const R = 6371000;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
    const x = Math.sin(dLat/2)**2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  function showCard(place, story){
    if (document.querySelector('.kz-tour-card')) return;
    const card = document.createElement('div');
    card.className = 'kz-tour-card';
    card.innerHTML = `
      <button class="kz-tour-x" aria-label="סגור">×</button>
      <div class="kz-tour-icn">🕯</div>
      <h3>${escapeHtml(place.name)}</h3>
      <p>${escapeHtml(story)}</p>
      <div class="kz-tour-actions">
        <button class="kz-tour-play">▶ האזן</button>
        <a class="kz-tour-pray" href="/index.html#create?for=${encodeURIComponent(place.name)}">🙏 בקש תפילה כאן</a>
      </div>`;
    document.body.appendChild(card);
    requestAnimationFrame(() => card.classList.add('is-in'));

    card.querySelector('.kz-tour-x').addEventListener('click', () => {
      window.speechSynthesis?.cancel();
      card.remove();
    });
    card.querySelector('.kz-tour-play').addEventListener('click', () => {
      if (!('speechSynthesis' in window)) return;
      const u = new SpeechSynthesisUtterance(story);
      u.lang = 'he-IL';
      u.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    });
  }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  let lastShown = null;
  function check(pos){
    const places = (window.KZ_JEWISH_PLACES || []).filter(p => p.cat === 'tomb' || p.cat === 'holy');
    const near = places
      .map(p => ({ p, d: distM(pos, p) }))
      .filter(x => x.d <= 200)
      .sort((a, b) => a.d - b.d)[0];
    if (!near) return;
    if (lastShown === near.p.id) return;
    const story = near.p.story || STORIES[near.p.id];
    if (!story) return;
    lastShown = near.p.id;
    showCard(near.p, story);
  }

  document.addEventListener('kz:pos', (e) => check(e.detail));
  // Also watch position over time (only on traveler page)
  if (location.pathname.endsWith('/traveler.html') && 'geolocation' in navigator){
    let watchId = null;
    document.addEventListener('kz:pos', () => {
      if (watchId) return;
      watchId = navigator.geolocation.watchPosition(
        (g) => check({ lat: g.coords.latitude, lng: g.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }
      );
    }, { once: true });
  }
})();
