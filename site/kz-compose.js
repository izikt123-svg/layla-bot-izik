/* ============================================================
   KZ COMPOSE — "תן למירב לכתוב לי תפילה" widget
   Mounts inside a request-prayer form OR creates a button beside
   any element with class="js-kz-compose-near" (anchor element id
   reused as data-target for the textarea).

   Usage:
     <button class="js-kz-compose" data-target="#prayerText">
       ✦ עזור לי לנסח
     </button>
     <textarea id="prayerText"></textarea>
   ============================================================ */
(function(){
  'use strict';

  function buildModal(opts){
    const m = document.createElement('div');
    m.className = 'kz-compose-modal';
    m.innerHTML = `
      <div class="kz-compose-back" data-close></div>
      <div class="kz-compose-card">
        <button class="kz-compose-x" aria-label="סגור" data-close>×</button>
        <div class="kz-compose-head">
          <div class="kz-compose-emoji">✦</div>
          <h3>מירב כותבת תפילה</h3>
          <p>ספר/י לי בכמה מילים — אני אנסח עבורך תפילה אישית.</p>
        </div>
        <div class="kz-compose-grid">
          <label>
            <span>במה מדובר?</span>
            <select id="kzCompIntent">
              <option value="רפואה">רפואה</option>
              <option value="פרנסה">פרנסה</option>
              <option value="זיווג">זיווג</option>
              <option value="שלום בית">שלום בית</option>
              <option value="ילדים ופוריות">ילדים ופוריות</option>
              <option value="הצלחה">הצלחה</option>
              <option value="הודיה">הודיה</option>
              <option value="לעילוי נשמת">לעילוי נשמת</option>
              <option value="כללי">כללי</option>
            </select>
          </label>
          <label>
            <span>שם/שמות (אופציונלי)</span>
            <input id="kzCompNames" placeholder="למשל: ישראל בן שרה"/>
          </label>
          <label class="kz-compose-wide">
            <span>מה תרצה/י שיופיע בתפילה?</span>
            <textarea id="kzCompDetails" rows="3" placeholder="כל מה שעל הלב — בקצרה"></textarea>
          </label>
          <label>
            <span>אורך</span>
            <select id="kzCompLength">
              <option value="short">קצרה</option>
              <option value="medium" selected>בינונית</option>
              <option value="long">ארוכה</option>
            </select>
          </label>
          <label>
            <span>שפה</span>
            <select id="kzCompLang">
              <option value="he" selected>עברית</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="ru">Русский</option>
            </select>
          </label>
        </div>
        <div class="kz-compose-actions">
          <button class="kz-compose-btn-primary" id="kzCompGo">✨ נסחי לי</button>
        </div>
        <div class="kz-compose-result" id="kzCompResult" hidden>
          <div class="kz-compose-spinner" id="kzCompSpinner" hidden></div>
          <div class="kz-compose-text" id="kzCompText"></div>
          <div class="kz-compose-suggest" id="kzCompSuggest"></div>
          <div class="kz-compose-actions">
            <button class="kz-compose-btn-secondary" id="kzCompCopy">📋 העתק</button>
            <button class="kz-compose-btn-primary"   id="kzCompUse" data-target="${opts.target || ''}">השתמש בתפילה</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add('is-open'));

    m.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(m); });
    m.querySelector('#kzCompGo').addEventListener('click',   () => generate(m));
    m.querySelector('#kzCompCopy').addEventListener('click', () => copyText(m));
    m.querySelector('#kzCompUse').addEventListener('click',  () => useIn(m, opts));

    // pre-fill from intent if button already knows
    if (opts.intent) m.querySelector('#kzCompIntent').value = opts.intent;
  }

  async function generate(modal){
    const intent  = modal.querySelector('#kzCompIntent').value;
    const names   = modal.querySelector('#kzCompNames').value;
    const details = modal.querySelector('#kzCompDetails').value;
    const length  = modal.querySelector('#kzCompLength').value;
    const lang    = modal.querySelector('#kzCompLang').value;

    const result   = modal.querySelector('#kzCompResult');
    const textEl   = modal.querySelector('#kzCompText');
    const suggEl   = modal.querySelector('#kzCompSuggest');
    const spinner  = modal.querySelector('#kzCompSpinner');

    result.hidden = false;
    spinner.hidden = false;
    textEl.textContent = '';
    suggEl.innerHTML = '';

    try {
      const r = await fetch('/api/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, names, details, length, lang })
      });
      if (!r.ok) throw new Error('compose ' + r.status);
      const data = await r.json();
      spinner.hidden = true;
      textEl.textContent = data.prayer || '(לא הצלחתי לנסח. נסה שוב)';
      const sugs = Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : [];
      sugs.forEach(s => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'kz-compose-sug';
        b.textContent = '↻ ' + s;
        b.addEventListener('click', () => {
          // swap prayer with the alternative opening
          textEl.textContent = s + (textEl.textContent ? '\n\n' + textEl.textContent.split('\n\n').slice(1).join('\n\n') : '');
        });
        suggEl.appendChild(b);
      });
    } catch (err) {
      spinner.hidden = true;
      textEl.textContent = 'אופס — לא הצלחתי כרגע. נסה/י שוב בעוד רגע.';
    }
  }

  async function copyText(modal){
    const txt = modal.querySelector('#kzCompText').textContent;
    try { await navigator.clipboard.writeText(txt); modal.querySelector('#kzCompCopy').textContent = '✓ הועתק'; }
    catch {}
  }

  function useIn(modal, opts){
    const txt = modal.querySelector('#kzCompText').textContent;
    const sel = opts.target;
    if (sel){
      const node = document.querySelector(sel);
      if (node && 'value' in node){ node.value = txt; node.dispatchEvent(new Event('input', { bubbles: true })); }
    }
    close(modal);
  }
  function close(modal){
    modal.classList.remove('is-open');
    setTimeout(() => modal.remove(), 300);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-kz-compose');
    if (!btn) return;
    e.preventDefault();
    buildModal({
      target: btn.dataset.target || '',
      intent: btn.dataset.intent || ''
    });
  });

  window.KZ_COMPOSE = { open: (opts = {}) => buildModal(opts) };
})();
