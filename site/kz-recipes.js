/* ============================================================
   KZ RECIPES — Shabbat recipes by edah
   ============================================================ */
(function(){
  'use strict';
  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function init(){
    if (!window.KZ_EDOT || !window.KZ_RECIPES){ setTimeout(init, 80); return; }
    const edotEl = document.getElementById('rcEdot');
    const recipesEl = document.getElementById('rcRecipes');
    let pickedKey = null;

    edotEl.innerHTML = window.KZ_EDOT.map(e => `
      <button class="rc-edah" data-key="${e.key}">
        <span class="rc-edah-emoji">${e.emoji}</span>
        <span>${escapeHtml(e.he)}</span>
        <span class="rc-edah-region">${escapeHtml(e.region)}</span>
      </button>`).join('');

    edotEl.addEventListener('click', (e) => {
      const b = e.target.closest('.rc-edah');
      if (!b) return;
      edotEl.querySelectorAll('.rc-edah').forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      pickedKey = b.dataset.key;
      render();
    });

    function render(){
      const list = window.KZ_RECIPES[pickedKey] || [];
      recipesEl.innerHTML = list.map(cardHtml).join('');
    }

    function cardHtml(r){
      return `<article class="rc-card">
        <div class="rc-card-head">
          <h3 class="rc-card-name">${escapeHtml(r.name)}</h3>
          <div class="rc-card-meta">
            <span class="rc-meta-pill">${escapeHtml(r.course)}</span>
            <span class="rc-meta-pill">⏱ ${escapeHtml(r.time)}</span>
          </div>
        </div>
        <div class="rc-card-cols">
          <section class="rc-card-section">
            <h4>מצרכים</h4>
            <ul>${(r.ingredients || []).map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
          </section>
          <section class="rc-card-section">
            <h4>הכנה</h4>
            <ol>${(r.steps || []).map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
          </section>
        </div>
        <button class="rc-print-btn" onclick="window.print()">🖨 הדפסה</button>
      </article>`;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
