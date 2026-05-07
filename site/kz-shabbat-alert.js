/* ============================================================
   KZ SHABBAT ALERT — geo-aware Shabbat reminder
   - Toggle stored in localStorage.
   - Computes Shabbat times for the user's current location via Hebcal Shabbat API.
   - Fires a local notification 18 minutes before sunset on Friday.
   - Uses the existing Service Worker registration for the alert,
     so it works as a real OS notification.
   ============================================================ */
(function(){
  'use strict';

  const KEY = 'kz_shabbat_alert_v1'; // 'on' | 'off'
  const TIMER_KEY = 'kz_shabbat_timer_v1';

  function get(){ try { return localStorage.getItem(KEY) || 'off'; } catch { return 'off'; } }
  function set(v){ try { localStorage.setItem(KEY, v); } catch {} }

  async function fetchShabbat(lat, lng){
    const r = await fetch(`https://www.hebcal.com/shabbat?cfg=json&latitude=${lat}&longitude=${lng}&m=18&geo=pos`);
    if (!r.ok) return null;
    return r.json();
  }

  function nextCandleTime(items){
    const now = Date.now();
    const c = (items || []).find(i => i.category === 'candles' && new Date(i.date).getTime() > now);
    return c ? new Date(c.date) : null;
  }

  async function arm(pos){
    const data = await fetchShabbat(pos.lat, pos.lng);
    if (!data) return;
    const candle = nextCandleTime(data.items);
    if (!candle) return;
    const fireAt = candle.getTime() - 18 * 60_000; // 18 minutes before
    const ms = fireAt - Date.now();
    if (ms <= 0) return;
    try { localStorage.setItem(TIMER_KEY, String(fireAt)); } catch {}

    // Use a setTimeout — works only while tab is open.
    // For real background delivery, the server-side push (push-send) should be triggered by a cron.
    setTimeout(async () => {
      // Try local notification via SW for OS-level toast
      try {
        const reg = await navigator.serviceWorker?.getRegistration();
        if (reg && Notification.permission === 'granted'){
          reg.showNotification('🕯 שבת נכנסת בקרוב', {
            body: '18 דקות להדלקת נרות. שבת שלום!',
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: 'kz-shabbat-alert',
            requireInteraction: true
          });
          return;
        }
      } catch {}
      // Fallback: in-page banner
      const b = document.createElement('div');
      b.className = 'kz-shabbat-banner';
      b.innerHTML = '🕯 שבת נכנסת בעוד 18 דקות — שבת שלום! ✦';
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 25_000);
    }, ms);
  }

  function init(){
    const toggle = document.getElementById('trvShabbatToggle');
    if (toggle){
      toggle.checked = get() === 'on';
      toggle.addEventListener('change', async () => {
        if (toggle.checked){
          // Need notification permission
          if ('Notification' in window && Notification.permission === 'default'){
            await Notification.requestPermission();
          }
          set('on');
          // Try to arm immediately if we have a position
          if (window.__kz_pos) arm(window.__kz_pos);
        } else {
          set('off');
        }
      });
    }
    document.addEventListener('kz:pos', (e) => {
      window.__kz_pos = e.detail;
      if (get() === 'on') arm(e.detail);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
