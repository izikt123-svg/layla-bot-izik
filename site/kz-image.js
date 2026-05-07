/* ============================================================
   KZ IMAGE — smart image loader + Jewish illustration injector
   - Auto-detects [data-kz-illustration="<key>"] and renders SVG.
   - Lazy-loads <img data-kz-src="..."> with placeholder + fade-in.
   - Image upload helper: KZ_IMAGE.upload(file, key) saves a
     downscaled JPEG to localStorage (per-place override).
   - Place card image getter: KZ_IMAGE.forPlace(place) returns:
       1) user-uploaded photo (kz_place_photo_<id>) if exists
       2) place.photo_url if set
       3) Wikipedia image based on place.wiki if set
       4) Smart illustration based on cat (chabad/synagogue/etc)
   ============================================================ */
(function(){
  'use strict';

  const PLACE_PHOTO_KEY = 'kz_place_photo_';

  /* ─── Hero photo registry ───────────────────────────────────
     Each slot tries a local real photo first; if missing → SVG. */
  const HERO_PHOTOS = {
    soldiers:    { src:'/images/heroes/soldier-kotel.jpg',       fallback:'magenDavid', alt:'חייל מתפלל בכותל' },
    barMitzvah:  { src:'/images/heroes/bar-mitzvah-kotel.jpg',   fallback:'torah',      alt:'משפחה בבר מצווה בכותל' },
    shofar:      { src:'/images/heroes/shofar-mountain.jpg',     fallback:'shofar',     alt:'תקיעת שופר במדבר' },
    jewishLife:  { src:'/images/heroes/jewish-life-collage.jpg', fallback:'jerusalem',  alt:'חיים יהודיים — קולאז\'' },
    wedding:     { src:'/images/heroes/wedding-chuppah.jpg',     fallback:'chuppah',    alt:'חופה תחת כוכבים' },
    /* Jerusalem holy sites — used by the home-page rotator */
    kotel:       { src:'/images/heroes/kotel.jpg',               fallback:'kotel',       alt:'הכותל המערבי, ירושלים', label:'הכותל המערבי' },
    templeMount: { src:'/images/heroes/temple-mount.jpg',        fallback:'jerusalem',   alt:'הר הבית, ירושלים',     label:'הר הבית' },
    machpela:    { src:'/images/heroes/machpela.jpg',            fallback:'machpela',    alt:'מערת המכפלה, חברון',    label:'מערת המכפלה' },
    rachel:      { src:'/images/heroes/rachel-tomb.jpg',         fallback:'rachel',      alt:'קבר רחל, בית לחם',     label:'קבר רחל' },
    oldCity:     { src:'/images/heroes/old-city.jpg',            fallback:'jerusalem',   alt:'העיר העתיקה, ירושלים', label:'העיר העתיקה' }
  };

  /* Hero rotator slots — order of holy sites in the rotation */
  const ROTATOR_SLOTS = ['kotel', 'templeMount', 'machpela', 'rachel', 'oldCity'];

  const photoCache = {};
  function tryHeroPhoto(name){
    return new Promise((resolve) => {
      const cfg = HERO_PHOTOS[name];
      if (!cfg) return resolve(null);
      if (photoCache[name] !== undefined) return resolve(photoCache[name]);
      const img = new Image();
      img.onload  = () => { photoCache[name] = cfg.src; resolve(cfg.src); };
      img.onerror = () => { photoCache[name] = null;     resolve(null); };
      img.src = cfg.src;
    });
  }

  /* Resolve a slot to its best image URL (photo if uploaded, else SVG) */
  async function resolveSlotUrl(name){
    const cfg = HERO_PHOTOS[name];
    if (!cfg) return null;
    const photo = await tryHeroPhoto(name);
    if (photo) return photo;
    if (cfg.fallback){
      const svgUrl = getIllustration(cfg.fallback, 1400, 700);
      if (svgUrl) return svgUrl;
    }
    return null;
  }

  /* Render single hero photo into element. */
  async function renderHero(el, name){
    if (!el) return;
    const cfg = HERO_PHOTOS[name];
    if (!cfg) return;
    el.setAttribute('aria-label', cfg.alt || '');
    const url = await resolveSlotUrl(name);
    if (url){
      el.style.backgroundImage = `url("${url}")`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.dataset.kzHeroSource = photoCache[name] ? 'photo' : 'svg';
    }
    if (!el.style.minHeight) el.style.minHeight = '260px';
  }

  /* Build a rotator: 2 layered <div>s crossfade through the 5 holy sites. */
  async function renderRotator(el){
    if (!el || el.dataset.kzRotatorBuilt === '1') return;
    el.dataset.kzRotatorBuilt = '1';
    el.classList.add('kz-hero-rotator');

    /* Two stacked layers for crossfade */
    const layerA = document.createElement('div'); layerA.className = 'kz-hero-layer is-active';
    const layerB = document.createElement('div'); layerB.className = 'kz-hero-layer';
    /* Caption chip showing current site name */
    const caption = document.createElement('div'); caption.className = 'kz-hero-caption';
    /* Dots indicator */
    const dots = document.createElement('div'); dots.className = 'kz-hero-dots';
    ROTATOR_SLOTS.forEach((_, i) => {
      const d = document.createElement('span');
      d.className = 'kz-hero-dot' + (i === 0 ? ' is-active' : '');
      d.dataset.idx = i;
      dots.appendChild(d);
    });

    el.prepend(dots);
    el.prepend(caption);
    el.prepend(layerB);
    el.prepend(layerA);

    if (!el.style.minHeight) el.style.minHeight = '320px';

    /* Resolve all slot URLs in parallel */
    const urls = await Promise.all(ROTATOR_SLOTS.map(resolveSlotUrl));

    let idx = 0;
    let useA = true;
    const apply = (i) => {
      const slot = ROTATOR_SLOTS[i];
      const cfg = HERO_PHOTOS[slot];
      const url = urls[i];
      if (!url) return;
      const target = useA ? layerB : layerA;
      const front  = useA ? layerA : layerB;
      target.style.backgroundImage = `url("${url}")`;
      front.classList.remove('is-active');
      target.classList.add('is-active');
      caption.textContent = cfg?.label || '';
      dots.querySelectorAll('.kz-hero-dot').forEach((d, di) => {
        d.classList.toggle('is-active', di === i);
      });
      useA = !useA;
    };

    apply(0); /* set first */
    /* Auto-rotate every 6s */
    let timer = setInterval(() => { idx = (idx + 1) % ROTATOR_SLOTS.length; apply(idx); }, 6000);

    /* Click a dot to jump */
    dots.addEventListener('click', (e) => {
      const dot = e.target.closest('.kz-hero-dot');
      if (!dot) return;
      idx = parseInt(dot.dataset.idx, 10);
      apply(idx);
      clearInterval(timer);
      timer = setInterval(() => { idx = (idx + 1) % ROTATOR_SLOTS.length; apply(idx); }, 6000);
    });

    /* Pause when tab hidden */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden){ clearInterval(timer); }
      else { timer = setInterval(() => { idx = (idx + 1) % ROTATOR_SLOTS.length; apply(idx); }, 6000); }
    });
  }

  /* Auto-render: data-kz-hero="<name>" → single photo
                  data-kz-hero="rotator"  → 5-photo rotator */
  function autoRenderHeroes(){
    document.querySelectorAll('[data-kz-hero]').forEach(el => {
      const name = el.dataset.kzHero;
      if (name === 'rotator'){
        renderRotator(el);
        return;
      }
      if (el.dataset.kzRendered === '1' && el.dataset.kzHeroSource) return;
      renderHero(el, name).then(() => { el.dataset.kzRendered = '1'; });
    });
  }

  function getIllustration(key, w, h){
    if (!window.KZ_ILLUSTRATIONS) return null;
    const fn = window.KZ_ILLUSTRATIONS[key];
    return fn ? fn({ w, h }) : null;
  }

  function categoryIllustration(cat){
    const map = {
      chabad: 'chabadHouse',
      synagogue: 'synagogue',
      tomb: 'rachel',
      holy: 'kotel',
      jcc: 'magenDavid',
      embassy: 'magenDavid',
      kosher: 'challah',
      mikveh: 'magenDavid',
      yeshiva: 'torah'
    };
    return map[cat] || 'magenDavid';
  }

  function loadJson(key, def){
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); }
    catch { return def; }
  }
  function saveJson(key, val){ try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

  function getUserPhoto(placeId){
    if (!placeId) return null;
    return localStorage.getItem(PLACE_PHOTO_KEY + placeId);
  }
  function setUserPhoto(placeId, dataUrl){
    if (!placeId) return;
    try { localStorage.setItem(PLACE_PHOTO_KEY + placeId, dataUrl); } catch {}
  }
  function clearUserPhoto(placeId){
    if (!placeId) return;
    try { localStorage.removeItem(PLACE_PHOTO_KEY + placeId); } catch {}
  }

  /* Read a file and downscale to maxWidth, return data URL JPEG */
  function readDownscaled(file, maxWidth=720, quality=0.78){
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const ratio = img.width > maxWidth ? maxWidth / img.width : 1;
          const w = Math.round(img.width * ratio);
          const h = Math.round(img.height * ratio);
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = r.result;
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  /* Smart picker: returns the best available image source for a place */
  function forPlace(place){
    if (!place) return null;
    const user = getUserPhoto(place.id);
    if (user) return user;
    if (place.photo_url) return place.photo_url;
    return getIllustration(categoryIllustration(place.cat), 600, 400);
  }

  /* Auto-render: any element with data-kz-illustration="<key>" gets the SVG */
  function autoRender(){
    document.querySelectorAll('[data-kz-illustration]').forEach(el => {
      if (el.dataset.kzRendered) return;
      const key = el.dataset.kzIllustration;
      const w = parseInt(el.dataset.w || el.getAttribute('width') || el.clientWidth || 600, 10);
      const h = parseInt(el.dataset.h || el.getAttribute('height') || el.clientHeight || 400, 10);
      const url = getIllustration(key, w, h);
      if (!url) return;
      if (el.tagName === 'IMG'){
        el.src = url;
      } else {
        el.style.backgroundImage = `url("${url}")`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        if (!el.style.minHeight) el.style.minHeight = h + 'px';
      }
      el.dataset.kzRendered = '1';
    });
  }

  /* Lazy load <img data-kz-src="..."> when visible */
  function lazyLoad(){
    if (!('IntersectionObserver' in window)){
      document.querySelectorAll('img[data-kz-src]').forEach(img => {
        img.src = img.dataset.kzSrc;
        img.removeAttribute('data-kz-src');
      });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const img = e.target;
        const src = img.dataset.kzSrc;
        if (src){
          img.src = src;
          img.classList.add('kz-img-loaded');
        }
        img.removeAttribute('data-kz-src');
        io.unobserve(img);
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('img[data-kz-src]').forEach(img => io.observe(img));
  }

  function init(){
    autoRender();
    autoRenderHeroes();
    lazyLoad();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  /* Re-run on DOM changes (best-effort) */
  if ('MutationObserver' in window){
    const mo = new MutationObserver(() => { autoRender(); autoRenderHeroes(); lazyLoad(); });
    mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }

  /* Public API */
  window.KZ_IMAGE = {
    illustration: getIllustration,
    categoryIllustration,
    forPlace,
    upload: async (file, placeId) => {
      const url = await readDownscaled(file, 720, 0.78);
      if (placeId) setUserPhoto(placeId, url);
      return url;
    },
    clearUserPhoto,
    getUserPhoto,
    rerender: () => { autoRender(); autoRenderHeroes(); lazyLoad(); },
    renderHero,
    renderRotator,
    HERO_PHOTOS,
    ROTATOR_SLOTS
  };
})();
