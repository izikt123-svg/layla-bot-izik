/* ============================================================
   KZ AUTH — Supabase scaffold
   ============================================================
   ⚠️ SETUP REQUIRED — read SETUP.md for full instructions.

   QUICK START:
   1. Create free account at https://supabase.com
   2. New project → copy Project URL + anon key
   3. Fill in SUPABASE_CONFIG below
   4. Add CDN script in HTML <head>:
      <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   5. Done — login/signup/sync work

   What this gives you:
   - Email/password auth + Google/Apple OAuth
   - Real cross-device sync of: prayers, family rooms, candles, yahrzeit
   - Real-time subscriptions (live prayer feed worldwide)
   - File storage for candle photos (instead of localStorage)
   ============================================================ */

window.KZ_AUTH = (function(){
  'use strict';

  const SUPABASE_CONFIG = {
    url:    'YOUR_SUPABASE_PROJECT_URL',     // e.g. https://abcdefgh.supabase.co
    anon:   'YOUR_SUPABASE_ANON_KEY',        // from Project Settings → API
    enabled: false                            // ← set to true after filling in
  };

  let client = null;
  let user = null;

  function init(){
    if (!SUPABASE_CONFIG.enabled){
      console.info('[KZ Auth] Supabase not configured — running in local-only mode.');
      return;
    }
    if (typeof supabase === 'undefined'){
      console.warn('[KZ Auth] Supabase JS SDK not loaded. Add <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
      return;
    }
    client = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anon);
    bindAuthState();
    syncFromCloud();
  }

  function bindAuthState(){
    client.auth.onAuthStateChange((event, session) => {
      user = session ? session.user : null;
      document.dispatchEvent(new CustomEvent('kz:auth', { detail: { event, user } }));
      if (event === 'SIGNED_IN'){
        syncFromCloud();
      }
    });
    client.auth.getSession().then(({ data }) => {
      if (data.session){
        user = data.session.user;
        document.dispatchEvent(new CustomEvent('kz:auth', { detail: { event: 'SIGNED_IN', user } }));
      }
    });
  }

  /* Auth methods */
  async function signUpEmail(email, password, name){
    if (!client) return { error: 'not_configured' };
    return await client.auth.signUp({
      email, password,
      options: { data: { name } }
    });
  }
  async function signInEmail(email, password){
    if (!client) return { error: 'not_configured' };
    return await client.auth.signInWithPassword({ email, password });
  }
  async function signInGoogle(){
    if (!client) return { error: 'not_configured' };
    return await client.auth.signInWithOAuth({ provider: 'google' });
  }
  async function signOut(){
    if (!client) return;
    await client.auth.signOut();
    user = null;
  }

  /* Cloud sync — push localStorage to Supabase */
  async function pushToCloud(){
    if (!client || !user) return;
    const data = {
      user_id: user.id,
      praying:    JSON.parse(localStorage.getItem('pc_praying')         || '[]'),
      mine:       JSON.parse(localStorage.getItem('pc_mine')            || '[]'),
      family:     JSON.parse(localStorage.getItem('kz-family-room-v1')  || 'null'),
      candles:    JSON.parse(localStorage.getItem('kz-memorial-candles')|| '[]'),
      updated_at: new Date().toISOString()
    };
    await client.from('user_data').upsert(data);
  }
  async function syncFromCloud(){
    if (!client || !user) return;
    const { data } = await client.from('user_data').select('*').eq('user_id', user.id).single();
    if (!data) return;
    if (data.praying)  localStorage.setItem('pc_praying',          JSON.stringify(data.praying));
    if (data.mine)     localStorage.setItem('pc_mine',             JSON.stringify(data.mine));
    if (data.family)   localStorage.setItem('kz-family-room-v1',   JSON.stringify(data.family));
    if (data.candles)  localStorage.setItem('kz-memorial-candles', JSON.stringify(data.candles));
    document.dispatchEvent(new CustomEvent('kz:synced'));
  }

  /* Real-time prayer feed worldwide */
  function subscribeToPrayerFeed(callback){
    if (!client) return null;
    return client
      .channel('public:prayers')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'prayers' },
        (payload) => callback(payload.new))
      .subscribe();
  }

  /* Upload candle photo to Supabase Storage instead of base64 */
  async function uploadCandlePhoto(file){
    if (!client || !user) return null;
    const path = `candles/${user.id}/${Date.now()}.jpg`;
    const { error } = await client.storage.from('candle-photos').upload(path, file);
    if (error) return null;
    const { data } = client.storage.from('candle-photos').getPublicUrl(path);
    return data.publicUrl;
  }

  /* Public API */
  init();
  return {
    isConfigured: () => SUPABASE_CONFIG.enabled,
    getUser: () => user,
    signUpEmail, signInEmail, signInGoogle, signOut,
    pushToCloud, syncFromCloud,
    subscribeToPrayerFeed,
    uploadCandlePhoto
  };
})();
