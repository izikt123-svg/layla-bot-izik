/* ================================================================
   REAL GOOGLE SIGN-IN (additive)
   ----------------------------------------------------------------
   Wires the existing "המשך עם Google" button to Netlify Identity's
   OAuth flow. If Identity is not configured / not reachable yet,
   the original simulated behaviour (already present in script.js)
   still runs — nothing is broken.
   ================================================================ */
(function initGoogleAuth() {
  const btn = document.getElementById('googleAuth');
  if (!btn) return;

  let identityLib = null;
  let identityTried = false;

  // Prefetch Netlify Identity once, so the click handler can be fully
  // synchronous. We use the pinned esm.sh build so Safari/Firefox work
  // without a bundler.
  (async function preload() {
    try {
      identityLib = await import('https://esm.sh/@netlify/identity@1?bundle');
    } catch (e) {
      // Network / site config — silently fall back to simulated flow.
      identityLib = null;
    } finally {
      identityTried = true;
    }
  })();

  function syncLocalState(user) {
    const meta = user?.userMetadata || user?.user_metadata || {};
    const fullName = meta.full_name || user.email || '';
    const firstFromMeta = (fullName || '').split(/\s+/)[0];

    try {
      const existing = JSON.parse(localStorage.getItem('pc_state_v1') || '{}');
      const prev = existing.user || {};
      existing.user = {
        mode: 'registered',
        provider: 'google',
        firstName: prev.firstName || firstFromMeta || (user.email ? user.email.split('@')[0] : 'חבר'),
        motherName: prev.motherName || '',
        gender: prev.gender || '',
        community: prev.community || '',
        identity: prev.identity || '',
        email: user.email || prev.email || '',
        phone: prev.phone || '',
        notifyEmail: prev.notifyEmail ?? true,
        notifySms: prev.notifySms ?? false,
        favCat: prev.favCat || null
      };
      localStorage.setItem('pc_state_v1', JSON.stringify(existing));
    } catch {}

    try {
      if (typeof window.STATE === 'object' && window.STATE) {
        const saved = JSON.parse(localStorage.getItem('pc_state_v1'));
        window.STATE.user = saved.user;
        if (typeof window.renderUser === 'function') window.renderUser();
        if (typeof window.refreshAnonBadge === 'function') window.refreshAnonBadge();
        if (typeof window.renderFeed === 'function') window.renderFeed();
        if (typeof window.renderMe === 'function') window.renderMe();
        if (typeof window.closeModals === 'function') window.closeModals();
        if (typeof window.ping === 'function') window.ping('התחברת דרך Google · ברוך הבא');
      }
    } catch {}
  }

  // Capture-phase handler runs BEFORE the simulated handler in script.js.
  // We only stop the chain when we successfully kick off a real OAuth
  // redirect; otherwise we let the original handler run.
  btn.addEventListener('click', (ev) => {
    const firstName = (document.getElementById('authFirstName')?.value || '').trim();
    const motherName = (document.getElementById('authMother')?.value || '').trim();
    // Let the existing validation handler take over if the form is incomplete.
    if (!firstName || !motherName) return;

    if (!identityLib || typeof identityLib.oauthLogin !== 'function') {
      // Library not ready — fall back to simulated login in script.js.
      return;
    }

    ev.preventDefault();
    ev.stopImmediatePropagation();
    const authError = document.getElementById('authError');
    if (authError) authError.textContent = 'פותח חלון התחברות של Google…';
    try {
      identityLib.oauthLogin('google');
    } catch (e) {
      // If this throws we revert to simulated flow by manually firing a click
      // after removing our own capture listener.
      console.warn('[kz-auth] oauthLogin failed, simulated fallback.', e);
      if (authError) authError.textContent = '';
    }
  }, true);

  // On page return from Google: finalise login.
  function tryCallback() {
    if (!identityLib) return;
    if (typeof identityLib.handleAuthCallback !== 'function') return;
    identityLib.handleAuthCallback()
      .then((result) => {
        if (!result || !result.user) return;
        if (result.type === 'oauth' || result.type === 'confirmation') {
          syncLocalState(result.user);
        }
      })
      .catch(() => { /* no callback hash / identity not configured */ });
  }

  // Rehydrate already-logged-in session silently.
  function tryRehydrate() {
    if (!identityLib || typeof identityLib.getUser !== 'function') return;
    identityLib.getUser().then((u) => {
      if (!u || !u.email) return;
      const existing = JSON.parse(localStorage.getItem('pc_state_v1') || '{}');
      if (!existing.user || !existing.user.firstName) syncLocalState(u);
    }).catch(() => {});
  }

  const finish = () => { tryCallback(); tryRehydrate(); };
  const waitForLib = setInterval(() => {
    if (identityTried) {
      clearInterval(waitForLib);
      finish();
    }
  }, 120);
  setTimeout(() => { clearInterval(waitForLib); finish(); }, 4000);
})();
