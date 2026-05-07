/* ============================================================
   KZ VOICE MEMORIAL — record an audio dedication
   - User records a short message (≤60s) on the memorial page.
   - Saved locally and (optionally) uploaded to Supabase Storage.
   - Each candle on the wall can have an audio dedication that
     plays softly when clicked.
   - Mounts to [data-kz-voice-memorial] OR appends inside .memorial-form.
   ============================================================ */
(function(){
  'use strict';

  const STORAGE_KEY = 'kz_voice_memorials_v1';
  const MAX_MS = 60_000;

  function loadAll(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  }
  function saveAll(arr){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr.slice(-50))); } catch {}
  }

  function build(){
    if (document.querySelector('.kz-voice-memorial')) return;
    const mount = document.querySelector('[data-kz-voice-memorial]')
              || document.querySelector('.memorial-form');
    if (!mount) return;

    const wrap = document.createElement('div');
    wrap.className = 'kz-voice-memorial';
    wrap.innerHTML = `
      <div class="kz-vm-head">
        <span class="kz-vm-icn">🎙</span>
        <div>
          <div class="kz-vm-title">הקדשה בקול</div>
          <div class="kz-vm-sub">עד 60 שניות. הקלטה אישית לזיכרון.</div>
        </div>
      </div>
      <div class="kz-vm-row">
        <input class="kz-vm-name" id="kzVmName" placeholder="לזכר נשמת… / בשם…" />
        <button class="kz-vm-rec" id="kzVmRec" type="button">
          <span class="kz-vm-dot"></span>
          <span class="kz-vm-label">התחל הקלטה</span>
        </button>
      </div>
      <div class="kz-vm-meter" id="kzVmMeter" hidden>
        <div class="kz-vm-bar"><i></i></div>
        <span class="kz-vm-time">0:00</span>
      </div>
      <div class="kz-vm-list" id="kzVmList"></div>`;
    mount.appendChild(wrap);

    const recBtn  = wrap.querySelector('#kzVmRec');
    const nameInp = wrap.querySelector('#kzVmName');
    const meter   = wrap.querySelector('#kzVmMeter');
    const bar     = meter.querySelector('i');
    const timeEl  = meter.querySelector('.kz-vm-time');
    const listEl  = wrap.querySelector('#kzVmList');

    let mediaRec = null, chunks = [], startedAt = 0, raf = 0, audioCtx = null, analyser = null;

    function format(ms){
      const s = Math.floor(ms / 1000), m = Math.floor(s / 60);
      return `${m}:${String(s % 60).padStart(2,'0')}`;
    }

    function renderList(){
      listEl.innerHTML = '';
      loadAll().slice().reverse().forEach((rec, i) => {
        const el = document.createElement('div');
        el.className = 'kz-vm-item';
        el.innerHTML = `
          <span class="kz-vm-item-name">${escapeHtml(rec.name || 'הקדשה')}</span>
          <audio class="kz-vm-audio" controls preload="metadata" src="${rec.url}"></audio>
          <button class="kz-vm-del" type="button" aria-label="מחק">×</button>`;
        el.querySelector('.kz-vm-del').addEventListener('click', () => {
          const all = loadAll();
          const realIdx = all.length - 1 - i;
          all.splice(realIdx, 1);
          saveAll(all);
          renderList();
        });
        listEl.appendChild(el);
      });
    }

    async function start(){
      if (!navigator.mediaDevices?.getUserMedia){
        alert('הדפדפן לא תומך בהקלטה');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        mediaRec = new MediaRecorder(stream);
        chunks = [];
        mediaRec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
        mediaRec.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          if (audioCtx){ audioCtx.close().catch(()=>{}); audioCtx = null; }
          cancelAnimationFrame(raf);
          meter.hidden = true;

          const blob = new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' });
          const reader = new FileReader();
          reader.onload = () => {
            const all = loadAll();
            all.push({
              id: 'vm_' + Date.now(),
              name: nameInp.value.trim() || 'הקדשה',
              url: reader.result,    // data: URL — local fallback
              createdAt: Date.now()
            });
            saveAll(all);
            renderList();
            uploadIfPossible(blob, nameInp.value.trim());
          };
          reader.readAsDataURL(blob);

          recBtn.classList.remove('is-recording');
          recBtn.querySelector('.kz-vm-label').textContent = 'התחל הקלטה';
        };
        mediaRec.start();
        startedAt = Date.now();
        meter.hidden = false;
        recBtn.classList.add('is-recording');
        recBtn.querySelector('.kz-vm-label').textContent = 'עצור הקלטה';

        // Live meter
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        function step(){
          analyser.getByteFrequencyData(data);
          let sum = 0; for (let i = 0; i < data.length; i++) sum += data[i];
          const avg = sum / data.length;            // 0..255
          const elapsed = Date.now() - startedAt;
          const widthPct = Math.min(100, (elapsed / MAX_MS) * 100);
          bar.style.width = widthPct + '%';
          bar.style.opacity = String(0.4 + Math.min(1, avg / 110) * 0.6);
          timeEl.textContent = format(elapsed);
          if (elapsed >= MAX_MS){ stop(); return; }
          raf = requestAnimationFrame(step);
        }
        raf = requestAnimationFrame(step);
      } catch (err) {
        alert('לא הצלחנו לפתוח מיקרופון: ' + err.message);
      }
    }
    function stop(){ if (mediaRec && mediaRec.state !== 'inactive') mediaRec.stop(); }

    async function uploadIfPossible(blob, name){
      // Optional: POST to /api/voice-memorial-upload (signed URL flow)
      try {
        const fd = new FormData();
        fd.append('file', blob, 'memorial.webm');
        fd.append('name', name || '');
        await fetch('/api/voice-memorial-upload', { method: 'POST', body: fd });
      } catch {}
    }

    recBtn.addEventListener('click', () => {
      if (recBtn.classList.contains('is-recording')) stop(); else start();
    });
    renderList();
  }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once: true });
  else build();
})();
