/* ============================================================
   KZ PUSH — Web Push (VAPID) subscribe UI
   Asks the user politely (NOT on first visit) and keeps the
   subscription synced with the server.

   Server:
     - /api/push-subscribe  (POST {endpoint, keys})    → save sub
     - /api/push-unsubscribe (POST {endpoint})         → remove sub
   Public VAPID key: window.KZ_VAPID_PUBLIC (hex/base64url string).
   ============================================================ */
(function(){
  'use strict';

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const STORAGE_KEY  = 'kz_push_state_v1';   // 'asked' | 'granted' | 'denied' | 'dismissed'
  const ASK_AFTER_MS = 45_000;               // Don't pester on first visit
  const ASK_AFTER_VISITS = 2;                // Only ask from second visit

  function getState(){ try { return localStorage.getItem(STORAGE_KEY); } catch{ return null; } }
  function setState(v){ try { localStorage.setItem(STORAGE_KEY, v); } catch{} }
  function bumpVisit(){
    try {
      const n = (parseInt(localStorage.getItem('kz_push_visits') || '0', 10) || 0) + 1;
      localStorage.setItem('kz_push_visits', String(n));
      return n;
    } catch { return 1; }
  }

  function urlBase64ToUint8Array(b64){
    const padding = '='.repeat((4 - b64.length % 4) % 4);
    const base = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  }

  async function getRegistration(){
    return navigator.serviceWorker.getRegistration() || navigator.serviceWorker.ready;
  }

  async function subscribe(){
    const publicKey = window.KZ_VAPID_PUBLIC;
    if (!publicKey){ console.warn('[push] missing KZ_VAPID_PUBLIC'); return null; }
    const reg = await getRegistration();
    if (!reg) return null;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
    await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON ? sub.toJSON() : sub)
    }).catch(() => {});
    setState('granted');
    return sub;
  }

  async function unsubscribe(){
    const reg = await getRegistration();
    if (!reg) return;
    const sub = await reg.pushManager.getSubscription();
    if (sub){
      await fetch('/api/push-unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint })
      }).catch(() => {});
      await sub.unsubscribe();
    }
    setState('denied');
  }

  function showOptInBubble(){
    if (document.querySelector('.kz-push-bubble')) return;
    const wrap = document.createElement('div');
    wrap.className = 'kz-push-bubble';
    wrap.innerHTML = `
      <button class="kz-push-x" aria-label="סגור">×</button>
      <div class="kz-push-icn">🔔</div>
      <div class="kz-push-body">
        <div class="kz-push-title">להישאר מחוברים?</div>
        <div class="kz-push-sub">קבל/י עדכון חם כשהתפילה שלך מקבלת מצטרפים, ביארצייט קרוב, או בזמני תפילה.</div>
      </div>
      <button class="kz-push-yes">אישור</button>`;
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('is-in'));

    wrap.querySelector('.kz-push-yes').addEventListener('click', async () => {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted'){
          await subscribe();
        } else {
          setState('denied');
        }
      } catch { setState('dismissed'); }
      wrap.remove();
    });
    wrap.querySelector('.kz-push-x').addEventListener('click', () => {
      setState('dismissed');
      wrap.remove();
    });
  }

  function maybeAsk(){
    if (Notification.permission === 'granted'){ setState('granted'); return; }
    if (Notification.permission === 'denied'){  setState('denied');  return; }
    const visits = bumpVisit();
    if (visits < ASK_AFTER_VISITS) return;
    if (getState() === 'dismissed' || getState() === 'denied') return;
    setTimeout(showOptInBubble, ASK_AFTER_MS);
  }

  // Public API
  window.KZ_PUSH = { subscribe, unsubscribe, ask: showOptInBubble };

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', maybeAsk, { once: true });
  } else {
    maybeAsk();
  }
})();
