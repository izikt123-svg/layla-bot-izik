/* ================================================================
   KZ-AI · Smart on-site assistant (ADDITIVE only)
   ----------------------------------------------------------------
   Adds a dedicated AI button on the right side of the page that
   opens a full conversational assistant. Uses Netlify AI Gateway
   via /api/kz-ai-chat (server-side Claude). Does NOT touch any of
   the existing widgets (kz-guide, onboarding tour, help modal).
   ================================================================ */
(function initKzAi() {
  if (document.getElementById('kzAiLauncher')) return; // idempotent

  const API_URL = '/api/kz-ai-chat';
  const MAX_HISTORY = 8;

  /* ----- Shared gibberish / profanity guard (reuse site lists) ----- */
  const BAD = (window.PC_MOD_LIST && window.PC_MOD_LIST.length) ? window.PC_MOD_LIST : [
    'כוסאמא','כוסאמק','בן זונה','זונה','זין','חרא','שרמוטה','מניאק','דפוק',
    'קוקסינל','אידיוט','טמבל','מטומטם','שיט','פאק','פאקינג','בנזונה',
    'fuck','shit','bitch','asshole','dick','cunt'
  ];
  const BAD_RX = new RegExp('(' + BAD.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|') + ')', 'i');
  function isGibberish(s) {
    const v = String(s || '').trim();
    if (v.length < 5) return false;
    if (/(.)\1{4,}/.test(v)) return true;
    if (/^[^א-תa-zA-Z0-9\s]+$/.test(v)) return true;
    if (/[בגדזחטכלמנסעפצקרשתךםןףץ]{6,}/.test(v)) return true;
    return false;
  }

  /* ----- Build launcher + panel ----- */
  const launcher = document.createElement('button');
  launcher.id = 'kzAiLauncher';
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'מלווה חכם של מרכז התפילה · AI');
  launcher.innerHTML = `
    <span class="kz-ai-launcher-aura" aria-hidden="true"></span>
    <span class="kz-ai-launcher-badge">AI</span>
    <span class="kz-ai-launcher-ico" aria-hidden="true">
      <svg viewBox="0 0 40 40" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 5 l2.8 6.4 L30 13 l-5.2 4.9 L26 26 l-6-3.4 L14 26 l1.2-8.1 L10 13 l7.2-1.6 Z"/>
      </svg>
    </span>
    <span class="kz-ai-launcher-txt">שאל את ה־AI</span>
  `;

  const panel = document.createElement('aside');
  panel.id = 'kzAiPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'kzAiTitle');
  panel.hidden = true;
  panel.innerHTML = `
    <header class="kz-ai-head">
      <div class="kz-ai-title-wrap">
        <span class="kz-ai-avatar" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 5 l2.8 6.4 L30 13 l-5.2 4.9 L26 26 l-6-3.4 L14 26 l1.2-8.1 L10 13 l7.2-1.6 Z"/>
          </svg>
        </span>
        <div class="kz-ai-title-text">
          <span id="kzAiTitle" class="kz-ai-title">מלווה מרכז התפילה · AI</span>
          <span class="kz-ai-sub">עונה על כל שאלה, פשוטה או מורכבת, בעברית</span>
        </div>
      </div>
      <div class="kz-ai-head-actions">
        <button type="button" class="kz-ai-minor" id="kzAiClear" aria-label="התחל שיחה חדשה" title="נקה שיחה">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/></svg>
        </button>
        <button type="button" class="kz-ai-minor" id="kzAiClose" aria-label="סגור">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
    </header>

    <div class="kz-ai-body" id="kzAiBody" aria-live="polite"></div>

    <div class="kz-ai-chips" id="kzAiChips"></div>

    <form class="kz-ai-form" id="kzAiForm" autocomplete="off">
      <div class="kz-ai-input-wrap">
        <textarea id="kzAiInput" rows="1" maxlength="600"
          placeholder="שאל כל דבר על האתר — למשל: 'איך אני מבקש/ת תפילה על פרנסה ומוסיף/ה לזה לימוד יומי?'"
          aria-label="שאל את המלווה החכם"></textarea>
        <div class="kz-ai-warn" id="kzAiWarn" role="status"></div>
      </div>
      <button type="submit" class="kz-ai-send" id="kzAiSend" aria-label="שלח">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
      </button>
    </form>

    <div class="kz-ai-foot">
      <span>מונע על־ידי Claude · Netlify AI Gateway · עונה רק על תכני האתר</span>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  /* ----- Elements ----- */
  const body   = panel.querySelector('#kzAiBody');
  const form   = panel.querySelector('#kzAiForm');
  const input  = panel.querySelector('#kzAiInput');
  const warn   = panel.querySelector('#kzAiWarn');
  const chips  = panel.querySelector('#kzAiChips');
  const btnX   = panel.querySelector('#kzAiClose');
  const btnClr = panel.querySelector('#kzAiClear');
  const btnSend= panel.querySelector('#kzAiSend');

  const history = [];

  /* ----- Starter chips ----- */
  const STARTERS = [
    'איך מבקשים תפילה?',
    'מה יש באזור האישי שלי?',
    'איפה ספר נשמות ואיך מדליקים נר?',
    'מה ההבדל בין הפיד הכללי ל"מותאם לך"?',
    'איך מוצאים קהילה או בית כנסת קרובים?',
    'מה זה "שאל רב"? מי עונה?',
    'איפה אפשר להוריד את חוברת ההדרכה?'
  ];
  STARTERS.forEach(q => {
    const c = document.createElement('button');
    c.type = 'button'; c.className = 'kz-ai-chip'; c.textContent = q;
    c.addEventListener('click', () => { input.value = q; sendMessage(); });
    chips.appendChild(c);
  });

  /* ----- Render helpers ----- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  }
  function autoLink(text) {
    const safe = escapeHtml(text);
    // turn plain #anchor or name.html into links
    return safe.replace(/(^|[\s(])(#[a-zA-Z][\w-]{1,40}|[a-zA-Z][\w-]{1,40}\.html)/g,
      (_, pre, token) => `${pre}<a class="kz-ai-link" href="${token}">${token}</a>`);
  }
  function addMsg(role, text) {
    const row = document.createElement('div');
    row.className = 'kz-ai-row ' + role;
    row.innerHTML = `
      <div class="kz-ai-bubble">
        <div class="kz-ai-bubble-ico" aria-hidden="true">${role === 'assistant' ? '✦' : '·'}</div>
        <div class="kz-ai-bubble-txt">${autoLink(text)}</div>
      </div>
    `;
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
    return row.querySelector('.kz-ai-bubble-txt');
  }
  function greet() {
    if (body.childElementCount) return;
    addMsg('assistant',
      'שלום · כאן המלווה החכם של מרכז התפילה. אפשר לשאול אותי על כל תפריט, קטגוריה או תכונה באתר — גם שאלות מורכבות. למשל: "איך אני משלב/ת בקשת תפילה עם לימוד יומי מתאים?"'
    );
  }

  /* ----- Open / close ----- */
  function openPanel() {
    panel.hidden = false;
    panel.classList.add('is-open');
    document.body.classList.add('kz-ai-open');
    greet();
    setTimeout(() => input.focus(), 60);
  }
  function closePanel() {
    panel.classList.remove('is-open');
    setTimeout(() => { panel.hidden = true; document.body.classList.remove('kz-ai-open'); }, 180);
  }
  launcher.addEventListener('click', () => (panel.hidden ? openPanel() : closePanel()));
  btnX.addEventListener('click', closePanel);
  btnClr.addEventListener('click', () => {
    history.length = 0;
    body.innerHTML = '';
    greet();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });

  /* ----- Input: auto-grow + live gibberish warn ----- */
  function autoGrow() {
    input.style.height = 'auto';
    input.style.height = Math.min(140, input.scrollHeight) + 'px';
  }
  let warnTimer;
  function showWarn(txt) {
    if (!txt) { warn.classList.remove('show'); return; }
    warn.textContent = txt;
    warn.classList.add('show');
    clearTimeout(warnTimer);
    warnTimer = setTimeout(() => warn.classList.remove('show'), 3500);
  }
  input.addEventListener('input', () => {
    autoGrow();
    const v = input.value;
    if (BAD_RX.test(v)) { showWarn('רגע — שים לב לניסוח. כאן מדברים בכבוד.'); return; }
    if (isGibberish(v)) { showWarn('נראה שהקלט לא ברור — נסה/י לנסח שאלה ברורה.'); return; }
    showWarn('');
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /* ----- Send + stream ----- */
  let sending = false;
  async function sendMessage() {
    if (sending) return;
    const raw = input.value.trim();
    if (!raw) return;

    if (BAD_RX.test(raw)) {
      addMsg('user', raw);
      addMsg('assistant', 'כאן מדברים בכבוד — אשמח לענות אם תנסח/י את השאלה שוב ברוח מכבדת.');
      input.value = ''; autoGrow();
      return;
    }
    if (isGibberish(raw)) {
      addMsg('user', raw);
      addMsg('assistant', 'לא הצלחתי להבין את השאלה. אפשר לנסות שוב? למשל: "איך מבקשים תפילה על רפואה?"');
      input.value = ''; autoGrow();
      return;
    }

    addMsg('user', raw);
    history.push({ role: 'user', content: raw });
    if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);

    input.value = '';
    autoGrow();
    showWarn('');

    sending = true;
    btnSend.classList.add('is-busy');
    btnSend.disabled = true;

    const outTarget = addMsg('assistant', '');
    outTarget.classList.add('is-streaming');
    outTarget.parentElement.parentElement.classList.add('is-streaming');

    let gotAny = false;
    let full = '';

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice() })
      });

      if (!res.ok && res.status !== 200) throw new Error('http ' + res.status);

      const reader = res.body && res.body.getReader ? res.body.getReader() : null;
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            gotAny = true;
            full += chunk;
            outTarget.innerHTML = autoLink(full);
            body.scrollTop = body.scrollHeight;
          }
        }
      } else {
        // Fallback for environments without streaming
        full = await res.text();
        gotAny = !!full;
        outTarget.innerHTML = autoLink(full);
      }

      if (!gotAny) outTarget.innerHTML = autoLink('לא התקבלה תשובה — אפשר לנסות שוב בעוד רגע.');
      else history.push({ role: 'assistant', content: full });
    } catch (err) {
      outTarget.innerHTML = autoLink(
        'לא הצלחתי להגיע למנוע ה־AI כרגע. אפשר לשאול את "בוט ההסבר" הרגיל (כפתור "מדריך האתר" בתחתית ימין), ובינתיים ננסה שוב בהמשך.'
      );
    } finally {
      sending = false;
      btnSend.classList.remove('is-busy');
      btnSend.disabled = false;
      outTarget.classList.remove('is-streaming');
      outTarget.parentElement.parentElement.classList.remove('is-streaming');
      if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
    }
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); sendMessage(); });
})();
