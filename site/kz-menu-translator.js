/* ============================================================
   KZ MENU TRANSLATOR — photograph a menu, get Hebrew + kashrut hint
   - Uses /api/menu-vision (Gemini Vision) to OCR + translate +
     flag suspicious non-kosher items.
   ============================================================ */
(function(){
  'use strict';

  function build(){
    const mount = document.querySelector('[data-kz-menu]');
    if (!mount || mount.dataset.kzReady) return;
    mount.dataset.kzReady = '1';
    mount.innerHTML = `
      <div class="mini-title"><span class="mini-ornament">📷</span><span>תרגם תפריט וזהה כשרות</span></div>
      <div class="kz-menu-row">
        <input type="file" accept="image/*" capture="environment" id="kzMenuFile" hidden/>
        <button class="kz-menu-go" id="kzMenuPick">📸 צלם תפריט</button>
        <select id="kzMenuLang">
          <option value="he">תרגם לעברית</option>
          <option value="en">English</option>
          <option value="ru">Русский</option>
          <option value="es">Español</option>
        </select>
      </div>
      <div class="kz-menu-result" id="kzMenuResult" hidden></div>`;

    const file = mount.querySelector('#kzMenuFile');
    mount.querySelector('#kzMenuPick').addEventListener('click', () => file.click());
    file.addEventListener('change', () => process(file.files[0]));

    async function process(f){
      if (!f) return;
      const lang = mount.querySelector('#kzMenuLang').value;
      const result = mount.querySelector('#kzMenuResult');
      result.hidden = false;
      result.innerHTML = '<div class="kz-menu-loading">📷 קורא וגוזרת… אל תעזוב את הדף</div>';

      try {
        // Convert to base64 (≤ ~3MB)
        const dataUrl = await readAsDataURL(f);
        const r = await fetch('/api/menu-vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl, target: lang })
        });
        if (!r.ok) throw new Error('vision ' + r.status);
        const data = await r.json();
        result.innerHTML = `
          <div class="kz-menu-translate"><b>תרגום:</b><br>${escapeHtml(data.translation || '—').replace(/\n/g, '<br>')}</div>
          ${(data.warnings && data.warnings.length) ? `<div class="kz-menu-warn"><b>⚠️ סימני אי-כשרות אפשריים:</b><ul>${data.warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul></div>` : '<div class="kz-menu-ok">✦ לא זוהו פריטים בעייתיים. עדיין מומלץ לאמת עם המקום.</div>'}`;
      } catch {
        result.innerHTML = '<div class="kz-menu-error">לא הצלחתי לעבד. נסה תמונה ברורה יותר או בודק שיש GEMINI_API_KEY מוגדר ב-Netlify.</div>';
      }
    }
  }

  function readAsDataURL(file){
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, { once: true });
  else build();
})();
