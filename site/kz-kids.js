/* ============================================================
   KZ KIDS — bedtime stories with TTS
   ============================================================ */
(function(){
  'use strict';
  const $ = (s) => document.querySelector(s);
  const READ_KEY = 'kz_kids_read_v1';
  function loadRead(){ try { return JSON.parse(localStorage.getItem(READ_KEY) || '{}'); } catch { return {}; } }
  function saveRead(o){ try { localStorage.setItem(READ_KEY, JSON.stringify(o)); } catch {} }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function dayOfYear(){
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }

  let utt = null;

  function init(){
    if (!window.KZ_KIDS_STORIES){ setTimeout(init, 80); return; }
    const stories = window.KZ_KIDS_STORIES;
    const todays = stories[dayOfYear() % stories.length];

    /* Today */
    const todayEl = $('#kdToday');
    todayEl.innerHTML = `
      <div class="kd-today-label">⭐ סיפור היום</div>
      ${cardHtml(todays, true)}
    `;

    /* Grid */
    const grid = $('#kdGrid');
    const read = loadRead();
    grid.innerHTML = stories.map(s => `
      <div class="kd-card" data-id="${escapeHtml(s.id)}" style="background:${s.bg}">
        ${read[s.id] ? '<span class="kd-card-read">✓</span>' : ''}
        <div class="kd-card-emoji">${s.emoji}</div>
        <div class="kd-card-name">${escapeHtml(s.title)}</div>
        <span class="kd-card-time">${s.minutes} דקות</span>
      </div>`).join('');

    document.body.addEventListener('click', (e) => {
      const card = e.target.closest('.kd-card');
      if (card){ open(stories.find(s => s.id === card.dataset.id)); return; }
      if (e.target.closest('[data-close]')){ close(); return; }
    });
  }

  function cardHtml(s, todayBig){
    return `<div class="kd-card" data-id="${escapeHtml(s.id)}" style="background:${s.bg}; min-height: ${todayBig ? '180px' : '140px'}">
      <div class="kd-card-emoji" style="font-size:${todayBig ? '52px' : '38px'}">${s.emoji}</div>
      <div class="kd-card-name" style="font-size:${todayBig ? '22px' : '17px'}">${escapeHtml(s.title)}</div>
      <span class="kd-card-time">${s.minutes} דקות</span>
    </div>`;
  }

  function open(story){
    if (!story) return;
    const modal = $('#kdModal');
    const c = $('#kdStoryContent');
    c.innerHTML = `
      <button class="kd-x" data-close aria-label="סגור">×</button>
      <div class="kd-story-emoji">${story.emoji}</div>
      <h2 class="kd-story-title">${escapeHtml(story.title)}</h2>
      <div class="kd-story-controls">
        <button class="kd-story-btn" id="kdReadBtn">🎙 הקראה</button>
        <button class="kd-story-btn" id="kdStopBtn" hidden>⏹ עצור</button>
      </div>
      <div class="kd-story-text">${story.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')}</div>
      <div class="kd-lesson">
        <span class="kd-lesson-label">המסר</span>
        <div class="kd-lesson-text">"${escapeHtml(story.lesson)}"</div>
      </div>
      <div class="kd-story-actions">
        <button class="kd-action is-primary" id="kdDoneBtn">✓ סיימנו</button>
        <a class="kd-action" href="https://wa.me/?text=${encodeURIComponent('סיפור ' + story.title + ' לילדים: https://my-hom.net/kids-bedtime.html')}" target="_blank" rel="noopener">↗ שתפי</a>
      </div>`;
    modal.hidden = false;

    /* TTS */
    const readBtn = $('#kdReadBtn'), stopBtn = $('#kdStopBtn');
    readBtn?.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) return;
      const text = story.paragraphs.join(' ') + ' המסר: ' + story.lesson;
      utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'he-IL'; utt.rate = 0.85;
      speechSynthesis.cancel(); speechSynthesis.speak(utt);
      readBtn.hidden = true; stopBtn.hidden = false;
      utt.onend = () => { readBtn.hidden = false; stopBtn.hidden = true; };
    });
    stopBtn?.addEventListener('click', () => {
      speechSynthesis.cancel();
      readBtn.hidden = false; stopBtn.hidden = true;
    });

    $('#kdDoneBtn')?.addEventListener('click', () => {
      const r = loadRead();
      r[story.id] = new Date().toISOString();
      saveRead(r);
      close();
      init();
    });
  }

  function close(){
    speechSynthesis.cancel();
    $('#kdModal').hidden = true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
