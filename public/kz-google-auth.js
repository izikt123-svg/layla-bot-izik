/* ============================================================
   KZ GOOGLE AUTH — Sign in with Google (visible button)
   Works with Supabase OAuth or stand-alone localStorage demo.
   ============================================================ */
(function(){
  'use strict';

  const $ = (s, r=document) => r.querySelector(s);

  /* ─── Google Client ID — replace with your real one ──── */
  // Get yours at: https://console.cloud.google.com/apis/credentials
  // Create OAuth 2.0 Client ID, add my-hom.net to authorized origins
  const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  /* ─── Inject Google Identity Services script ────────── */
  function loadGoogleSDK(){
    if (window.google && window.google.accounts) return;
    if (document.querySelector('script[src*="accounts.google.com/gsi"]')) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  /* ─── Build the Google Sign-In button (in topbar) ───── */
  function buildGoogleButton(){
    if ($('.kz-google-signin')) return;
    const actions = $('.top-actions');
    if (!actions) return;

    // Skip if user already authenticated
    const stored = localStorage.getItem('kz-user');
    if (stored){
      try {
        const user = JSON.parse(stored);
        renderUserChip(user);
        return;
      } catch(_){}
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kz-google-signin';
    btn.title = 'התחבר עם Google';
    btn.setAttribute('aria-label', 'התחבר עם חשבון Google');
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.3-.2-2H12v3.8h5.6c-.2 1.3-1 2.4-2 3.2v2.7h3.3c2-1.8 3.1-4.5 3.1-7.7z"/>
        <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3v2.6A10 10 0 0 0 12 22z"/>
        <path fill="#FBBC04" d="M6.4 13.9A6 6 0 0 1 6 12c0-.7.1-1.3.3-1.9V7.5H3a10 10 0 0 0 0 9z"/>
        <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3 7.5l3.4 2.6C7.2 7.7 9.4 6 12 6z"/>
      </svg>
      <span>כניסה עם Google</span>`;
    btn.addEventListener('click', startGoogleSignIn);

    actions.insertBefore(btn, actions.firstChild);
  }

  /* ─── Start Google Sign-In flow ──────────────────────── */
  function startGoogleSignIn(){
    // Try Supabase if configured
    if (window.KZ_AUTH && window.KZ_AUTH.isConfigured && window.KZ_AUTH.isConfigured()){
      window.KZ_AUTH.signInGoogle();
      return;
    }
    // Try Google Identity Services
    if (window.google && window.google.accounts){
      try {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false
        });
        google.accounts.id.prompt();
        return;
      } catch(e){}
    }
    // Fallback — demo dialog
    demoSignIn();
  }

  function handleGoogleCredential(response){
    // Decode JWT to get user info (no signature validation client-side)
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const user = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        provider: 'google'
      };
      localStorage.setItem('kz-user', JSON.stringify(user));
      $('.kz-google-signin')?.remove();
      renderUserChip(user);
      showToast(`ברוך/ה הבא/ה ${user.name} 🕯`);
    } catch(e){}
  }

  /* ─── Demo sign-in (no Google account configured) ───── */
  function demoSignIn(){
    const name = prompt('הזן שם מלא להתחברות מהירה:');
    if (!name) return;
    const email = prompt('אימייל (אופציונלי):') || '';
    const user = {
      id: 'local-' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      picture: '',
      provider: 'demo'
    };
    localStorage.setItem('kz-user', JSON.stringify(user));
    $('.kz-google-signin')?.remove();
    renderUserChip(user);
    showToast(`ברוך/ה הבא/ה ${user.name} 🕯`);
  }

  /* ─── Render user chip in topbar (after sign-in) ────── */
  function renderUserChip(user){
    if ($('.kz-user-chip')) return;
    const actions = $('.top-actions');
    if (!actions) return;
    const initials = (user.name || '?').slice(0, 1);
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'kz-user-chip';
    chip.title = `${user.name} · יציאה`;
    chip.innerHTML = `
      ${user.picture
        ? `<img src="${user.picture}" alt="${user.name}" />`
        : `<span class="kz-user-chip-initials">${initials}</span>`}
      <span class="kz-user-chip-name">${user.name}</span>
    `;
    chip.addEventListener('click', () => {
      if (confirm(`לצאת מהחשבון של ${user.name}?`)){
        localStorage.removeItem('kz-user');
        chip.remove();
        buildGoogleButton();
      }
    });
    actions.insertBefore(chip, actions.firstChild);
  }

  /* ─── Toast helper ───────────────────────────────────── */
  function showToast(msg){
    const t = document.createElement('div');
    t.className = 'kz-google-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('is-visible'));
    setTimeout(() => {
      t.classList.remove('is-visible');
      setTimeout(() => t.remove(), 350);
    }, 2400);
  }

  /* ─── Init ───────────────────────────────────────────── */
  function init(){
    loadGoogleSDK();
    buildGoogleButton();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // Expose helpers
  window.KZ_GOOGLE = {
    signIn: startGoogleSignIn,
    signOut: () => {
      localStorage.removeItem('kz-user');
      $('.kz-user-chip')?.remove();
      buildGoogleButton();
    },
    getUser: () => {
      try { return JSON.parse(localStorage.getItem('kz-user') || 'null'); }
      catch(_){ return null; }
    }
  };
})();
