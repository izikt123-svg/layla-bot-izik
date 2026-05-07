/* ============================================================
   KZ INSTALL — install page (QR + native install + share)
   ============================================================ */
(function(){
  'use strict';

  /* The URL that should be installed.
     If the user is on my-hom.net → use that. Otherwise fall back
     to the current origin so QR works on staging/preview too. */
  const SITE_URL = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'https://my-hom.net'
    : location.origin;

  document.querySelectorAll('#insQrUrl, #insUrlA, #insUrlB, #insUrlC').forEach(el => {
    el.textContent = SITE_URL.replace(/^https?:\/\//, '');
  });

  /* QR code */
  function drawQr(){
    if (typeof window.QRCode === 'undefined'){
      // Fallback: external image service
      const fb = document.createElement('img');
      fb.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(SITE_URL)}&color=0B1F3A`;
      fb.alt = 'QR code';
      fb.width = 200; fb.height = 200;
      document.getElementById('insQrCanvas').appendChild(fb);
      return;
    }
    window.QRCode.toCanvas(SITE_URL, {
      width: 220,
      margin: 1,
      color: { dark: '#0B1F3A', light: '#ffffff' }
    }, (err, canvas) => {
      if (err){ console.error(err); return; }
      const c = document.getElementById('insQrCanvas');
      c.innerHTML = '';
      c.appendChild(canvas);
    });
  }
  // Try once now; retry once after the script tag finishes loading.
  drawQr();
  setTimeout(drawQr, 800);

  /* Copy URL */
  document.getElementById('insCopyBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(SITE_URL); }
    catch {}
    const btn = document.getElementById('insCopyBtn');
    const old = btn.textContent;
    btn.textContent = '✓ הועתק!';
    setTimeout(() => { btn.textContent = old; }, 1800);
  });

  /* Native share */
  const shareBtn = document.getElementById('insShareBtn');
  if (navigator.share){
    shareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.share({
        title: 'מרכז התפילה',
        text: 'הצטרפי למרכז התפילה — בית יהודי בעולם',
        url: SITE_URL
      }).catch(() => {});
    });
  } else {
    shareBtn.href = `https://wa.me/?text=${encodeURIComponent('מרכז התפילה — ' + SITE_URL)}`;
  }

  /* PWA install (Chrome/Edge/Android) */
  let deferredPrompt = null;
  const installBtn = document.getElementById('insInstallBtn');
  const stateEl = document.getElementById('insInstallState');

  /* Detect already installed */
  function isStandalone(){
    return window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
  }
  if (isStandalone()){
    stateEl.textContent = '✓ האפליקציה כבר מותקנת!';
    stateEl.classList.add('is-installed');
    return;
  }

  /* Listen for install prompt */
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
    stateEl.textContent = 'המכשיר שלך מוכן להתקנה — לחצי על הכפתור ↑';
    stateEl.classList.add('is-ready');
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted'){
      stateEl.textContent = '🎉 האפליקציה הותקנה! בדקי במסך הבית.';
      stateEl.classList.remove('is-ready');
      stateEl.classList.add('is-installed');
      installBtn.hidden = true;
    }
    deferredPrompt = null;
  });

  /* If no beforeinstallprompt after 3s — show manual instructions */
  setTimeout(() => {
    if (!deferredPrompt && !isStandalone()){
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      stateEl.textContent = isIOS
        ? 'באייפון: לחצי על כפתור השיתוף ⬆️ → "הוסף למסך הבית"'
        : 'ראי הוראות בכל פלטפורמה למטה ↓';
    }
  }, 3000);
})();
