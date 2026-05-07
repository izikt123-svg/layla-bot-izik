/* ============================================================
   KZ AUTH PRO — modern sign-in modal
   Methods (in order of friction):
     • Apple Sign-In   (Supabase OAuth)
     • Google Sign-In  (Supabase OAuth)
     • Email magic-link  (passwordless)
     • Phone OTP       (Supabase Phone Auth)
     • Local PIN       (4-digit, saved in localStorage)
       — works fully offline; upgradeable later to a real account.

   Configure once on the page:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script>
       window.KZ_SUPABASE_URL  = 'https://abcd.supabase.co';
       window.KZ_SUPABASE_ANON = 'eyJhbGc…';
     </script>

   Open the modal anywhere:
     <button class="js-kz-signin">התחברות</button>
   or:  KZ_AUTH.open();
   ============================================================ */
(function(){
  'use strict';

  const PIN_KEY     = 'kz_pin_v1';
  const PROFILE_KEY = 'kz_profile_v1';

  function supa(){
    if (window.__kz_supa) return window.__kz_supa;
    if (!window.supabase || !window.KZ_SUPABASE_URL || !window.KZ_SUPABASE_ANON) return null;
    window.__kz_supa = window.supabase.createClient(window.KZ_SUPABASE_URL, window.KZ_SUPABASE_ANON, {
      auth: { persistSession: true, detectSessionInUrl: true }
    });
    return window.__kz_supa;
  }

  function loadProfile(){
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch { return null; }
  }
  function saveProfile(p){
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch {}
    document.dispatchEvent(new CustomEvent('kz:profile', { detail: p }));
  }
  function clearProfile(){
    try { localStorage.removeItem(PROFILE_KEY); } catch {}
    document.dispatchEvent(new CustomEvent('kz:profile', { detail: null }));
  }

  function buildModal(){
    if (document.querySelector('.kz-auth-modal')) return;
    const m = document.createElement('div');
    m.className = 'kz-auth-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.innerHTML = `
      <div class="kz-auth-back" data-close></div>
      <div class="kz-auth-card">
        <button class="kz-auth-x" aria-label="סגור" data-close>×</button>
        <div class="kz-auth-head">
          <div class="kz-auth-emoji">✦</div>
          <h3>ברוכים הבאים</h3>
          <p>בחירת חשבון שומרת את התפילות שלך, יארצייטים, ומסנכרנת בין מכשירים.</p>
        </div>

        <div class="kz-auth-providers">
          <button class="kz-auth-provider kz-p-apple"  type="button"><span>🍎</span><b>המשך עם Apple</b></button>
          <button class="kz-auth-provider kz-p-google" type="button"><span>🌐</span><b>המשך עם Google</b></button>
        </div>

        <div class="kz-auth-divider"><span>או</span></div>

        <form class="kz-auth-email" novalidate>
          <input class="kz-auth-input" type="email" required placeholder="כתובת אימייל" autocomplete="email" />
          <button class="kz-auth-btn" type="submit">שלח קישור התחברות</button>
        </form>

        <div class="kz-auth-divider"><span>או</span></div>

        <button class="kz-auth-btn kz-auth-btn-ghost kz-p-pin" type="button">המשך עם PIN בלבד (אנונימי)</button>

        <div class="kz-auth-foot">
          <small>על-ידי המשך אתה מסכים ל<a href="/terms.html">תנאי השימוש</a> ול<a href="/privacy.html">מדיניות הפרטיות</a>.</small>
        </div>

        <div class="kz-auth-status" id="kzAuthStatus" hidden></div>
      </div>`;
    document.body.appendChild(m);

    const close = () => m.classList.remove('is-open');
    m.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });

    const status = m.querySelector('#kzAuthStatus');
    const setStatus = (text, type = 'info') => {
      status.hidden = false;
      status.dataset.type = type;
      status.textContent = text;
    };

    m.querySelector('.kz-p-apple').addEventListener('click',  () => oauth('apple',  setStatus));
    m.querySelector('.kz-p-google').addEventListener('click', () => oauth('google', setStatus));
    m.querySelector('.kz-p-pin').addEventListener('click',    () => pinFlow(m, setStatus));

    m.querySelector('.kz-auth-email').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = m.querySelector('.kz-auth-input').value.trim();
      magicLink(email, setStatus);
    });

    requestAnimationFrame(() => m.classList.add('is-open'));
  }

  async function oauth(provider, setStatus){
    const s = supa();
    if (!s){
      setStatus('Supabase לא מוגדר. הוסף KZ_SUPABASE_URL + KZ_SUPABASE_ANON ב-HTML.', 'err');
      return;
    }
    setStatus('פותח את ' + provider + '…', 'info');
    try {
      const { error } = await s.auth.signInWithOAuth({
        provider,
        options: { redirectTo: location.href }
      });
      if (error) setStatus(error.message, 'err');
    } catch (err) {
      setStatus('שגיאה: ' + err.message, 'err');
    }
  }

  async function magicLink(email, setStatus){
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ setStatus('אימייל לא תקין', 'err'); return; }
    const s = supa();
    if (!s){ setStatus('Supabase לא מוגדר.', 'err'); return; }
    setStatus('שולח קישור…', 'info');
    const { error } = await s.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: location.href }
    });
    if (error) setStatus(error.message, 'err');
    else setStatus('קישור נשלח לאימייל ✓ בדוק את התיבה.', 'ok');
  }

  function pinFlow(modal, setStatus){
    // Replace card content with PIN keypad
    const card = modal.querySelector('.kz-auth-card');
    const old = card.innerHTML;
    card.innerHTML = `
      <button class="kz-auth-x" aria-label="חזור" data-back>←</button>
      <div class="kz-auth-head">
        <div class="kz-auth-emoji">🔒</div>
        <h3 id="kzPinTitle">${localStorage.getItem(PIN_KEY) ? 'הזן PIN' : 'בחר PIN חדש'}</h3>
        <p>4 ספרות. שמור במכשיר בלבד — לא נשלח לשרת.</p>
      </div>
      <div class="kz-pin-row" id="kzPinRow">
        <span></span><span></span><span></span><span></span>
      </div>
      <div class="kz-pin-pad">
        ${[1,2,3,4,5,6,7,8,9].map(n => `<button type="button" data-d="${n}">${n}</button>`).join('')}
        <button type="button" class="kz-pin-blank" disabled></button>
        <button type="button" data-d="0">0</button>
        <button type="button" data-back-d>⌫</button>
      </div>
      <div class="kz-auth-status" id="kzAuthStatus" hidden></div>`;
    const dots = card.querySelectorAll('.kz-pin-row span');
    let buf = '';
    let isSetup = !localStorage.getItem(PIN_KEY);
    let firstPin = '';

    function render(){ dots.forEach((d, i) => d.classList.toggle('is-on', i < buf.length)); }

    function press(d){
      if (buf.length >= 4) return;
      buf += d;
      render();
      if (buf.length === 4) check();
    }
    function back(){
      buf = buf.slice(0, -1); render();
    }

    async function check(){
      const status = card.querySelector('#kzAuthStatus');
      const setS = (t, type='info') => { status.hidden = false; status.dataset.type = type; status.textContent = t; };
      if (isSetup){
        if (!firstPin){
          firstPin = buf;
          buf = '';
          render();
          card.querySelector('#kzPinTitle').textContent = 'הזן את ה-PIN שוב';
          setS('בחירת PIN — שלב 2/2', 'info');
          return;
        }
        if (firstPin === buf){
          try { localStorage.setItem(PIN_KEY, buf); } catch {}
          saveProfile({ kind: 'pin', name: 'משתמש אנונימי', createdAt: Date.now() });
          setS('נשמר ✓', 'ok');
          setTimeout(() => modal.classList.remove('is-open'), 600);
        } else {
          firstPin = ''; buf = ''; render();
          card.querySelector('#kzPinTitle').textContent = 'בחר PIN חדש';
          setS('הקודים לא תאמו — נסה שוב', 'err');
        }
        return;
      }
      // verify mode
      const expected = localStorage.getItem(PIN_KEY);
      if (buf === expected){
        if (!loadProfile()) saveProfile({ kind: 'pin', name: 'משתמש אנונימי', createdAt: Date.now() });
        setS('זוהית ✓', 'ok');
        setTimeout(() => modal.classList.remove('is-open'), 500);
      } else {
        buf = ''; render();
        setS('PIN שגוי', 'err');
      }
    }

    card.querySelector('[data-back]').addEventListener('click', () => { card.innerHTML = old; });
    card.querySelector('.kz-pin-pad').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.d != null) press(b.dataset.d);
      else if (b.hasAttribute('data-back-d')) back();
    });
  }

  /* ─── Hydrate session on page load ─── */
  async function hydrate(){
    const s = supa();
    if (!s) return;
    const { data } = await s.auth.getSession();
    if (data?.session?.user){
      const u = data.session.user;
      saveProfile({
        kind: u.app_metadata?.provider || 'oauth',
        id: u.id,
        email: u.email,
        name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
        avatar: u.user_metadata?.avatar_url || null
      });
    }
    s.auth.onAuthStateChange((_event, session) => {
      if (session?.user){
        const u = session.user;
        saveProfile({
          kind: u.app_metadata?.provider || 'oauth',
          id: u.id, email: u.email,
          name: u.user_metadata?.full_name || u.email?.split('@')[0],
          avatar: u.user_metadata?.avatar_url || null
        });
      } else {
        if (loadProfile()?.kind !== 'pin') clearProfile();
      }
    });
  }

  async function signOut(){
    const s = supa();
    if (s) try { await s.auth.signOut(); } catch {}
    clearProfile();
  }

  // Auto-wire .js-kz-signin
  document.addEventListener('click', (e) => {
    if (e.target.closest('.js-kz-signin')){ e.preventDefault(); buildModal(); }
  });

  document.addEventListener('DOMContentLoaded', hydrate, { once: true });

  window.KZ_AUTH = {
    open: buildModal,
    profile: loadProfile,
    signOut
  };
})();
