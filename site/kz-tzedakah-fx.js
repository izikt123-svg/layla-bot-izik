/* ============================================================
   KZ TZEDAKAH FX — multi-currency tzedakah quick-give
   - Pulls live FX from a free API (open.er-api.com).
   - Lets the traveler pick a local amount, see equivalents,
     and donate to the nearest Chabad (or to my-hom.net).
   ============================================================ */
(function(){
  'use strict';

  const COMMON = ['ILS','USD','EUR','GBP','CAD','AUD','JPY','BRL','ARS','MXN','CHF','RUB','THB','INR'];
  let rates = null;

  async function loadRates(base){
    base = base || 'ILS';
    try {
      const r = await fetch(`https://open.er-api.com/v6/latest/${base}`, { cache: 'force-cache' });
      const j = await r.json();
      if (j?.result === 'success'){ rates = { base, rates: j.rates }; return rates; }
    } catch {}
    return null;
  }

  function build(){
    const mount = document.querySelector('[data-kz-tzedakah-fx]');
    if (!mount || mount.dataset.kzReady) return;
    mount.dataset.kzReady = '1';
    mount.innerHTML = `
      <div class="mini-title"><span class="mini-ornament">💱</span><span>צדקה במטבע מקומי</span></div>
      <div class="kz-fx-row">
        <input id="fxAmount" type="number" min="1" placeholder="סכום" inputmode="decimal"/>
        <select id="fxCur">${COMMON.map(c => `<option ${c === guessLocal() ? 'selected' : ''}>${c}</option>`).join('')}</select>
      </div>
      <div class="kz-fx-eq" id="fxEq">— ש״ח</div>
      <div class="kz-fx-presets">
        <button data-amt="18">${guessLocal()} 18</button>
        <button data-amt="36">${guessLocal()} 36</button>
        <button data-amt="180">${guessLocal()} 180</button>
      </div>
      <button class="kz-fx-go" id="fxGo">תרום עכשיו</button>
      <small class="kz-fx-hint">התרומה הולכת למרכז התפילה. אם תרצה לבית חב"ד הקרוב — לחץ "מצא חב"ד".</small>`;

    function recompute(){
      const amount = parseFloat(mount.querySelector('#fxAmount').value || '0');
      const cur    = mount.querySelector('#fxCur').value;
      const eqEl   = mount.querySelector('#fxEq');
      if (!amount || !rates){ eqEl.textContent = '— ש״ח'; return; }
      const ils = amount / (rates.rates[cur] || 1) * (rates.rates['ILS'] || 1);
      eqEl.textContent = `≈ ${ils.toFixed(0)} ש״ח / ${(amount * (rates.rates['USD']||1) / (rates.rates[cur]||1)).toFixed(2)} USD`;
    }

    mount.querySelector('#fxAmount').addEventListener('input', recompute);
    mount.querySelector('#fxCur').addEventListener('change', recompute);
    mount.querySelector('.kz-fx-presets').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      mount.querySelector('#fxAmount').value = b.dataset.amt;
      recompute();
    });
    mount.querySelector('#fxGo').addEventListener('click', () => {
      const amount = parseFloat(mount.querySelector('#fxAmount').value || '0');
      if (!amount) return;
      // Open the regular donate modal with the converted amount
      if (window.KZ_DONATE){
        window.KZ_DONATE.open();
        // Drop converted amount into the custom field on the modal
        setTimeout(() => {
          const ils = rates ? Math.round(amount / (rates.rates[mount.querySelector('#fxCur').value] || 1) * (rates.rates['ILS'] || 1)) : amount;
          const inp = document.querySelector('.kz-amt-custom');
          if (inp){ inp.value = ils; inp.dispatchEvent(new Event('input', { bubbles: true })); }
        }, 60);
      } else {
        location.href = '/#donate';
      }
    });

    loadRates('USD').then(recompute);
  }

  function guessLocal(){
    const lang = (navigator.language || 'he').toLowerCase();
    if (lang.startsWith('he')) return 'ILS';
    if (lang.startsWith('en-gb')) return 'GBP';
    if (lang.startsWith('en')) return 'USD';
    if (lang.startsWith('fr')) return 'EUR';
    if (lang.startsWith('es-ar')) return 'ARS';
    if (lang.startsWith('es-mx')) return 'MXN';
    if (lang.startsWith('es')) return 'EUR';
    if (lang.startsWith('pt')) return 'BRL';
    if (lang.startsWith('ru')) return 'RUB';
    if (lang.startsWith('ja')) return 'JPY';
    if (lang.startsWith('th')) return 'THB';
    return 'USD';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once: true });
  else build();
})();
