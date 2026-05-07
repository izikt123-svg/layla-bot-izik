/* ============================================================
   KZ FAMILY ARCHIVE — local-only family book + upcoming dates
   ============================================================ */
(function(){
  'use strict';
  const $ = (s) => document.querySelector(s);
  const KEY = 'kz_family_archive_v1';

  function load(){ try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
  function save(a){ try { localStorage.setItem(KEY, JSON.stringify(a)); } catch {} }
  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function nextOccurrence(monthDay){
    const [m, d] = monthDay.split('-').map(Number);
    const today = new Date(); today.setHours(0,0,0,0);
    const thisYear = new Date(today.getFullYear(), m - 1, d);
    if (thisYear >= today) return thisYear;
    return new Date(today.getFullYear() + 1, m - 1, d);
  }

  async function fetchHebDate(date){
    const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    const url = `https://www.hebcal.com/converter?cfg=json&gy=${y}&gm=${m}&gd=${d}&g2h=1`;
    try { const r = await fetch(url); if (r.ok) return await r.json(); } catch {}
    return null;
  }
  async function fetchYahrzeit(date){
    const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    const url = `https://www.hebcal.com/yahrzeit?cfg=json&hebdate=on&years=2&v=yahrzeit&i=on&n1=Y&t1=Y&d1=${d}&m1=${m}&y1=${y}`;
    try {
      const r = await fetch(url); if (!r.ok) return null;
      const j = await r.json();
      const future = (j.items || []).map(i => new Date(i.date)).filter(x => x >= new Date());
      return future[0] || null;
    } catch { return null; }
  }

  function fmtMonthDay(d){
    return d.toLocaleDateString('he-IL', { day:'numeric', month:'short' });
  }

  function init(){
    const list = load();
    renderList(list);
    refreshUpcoming(list);
  }

  function renderList(list){
    const wrap = $('#faList');
    if (!list.length){
      wrap.innerHTML = '<div class="fa-list-empty">המשפחה שלך תופיע כאן. <b>הוסיפי בן/ת משפחה ראשון/ה</b> ↑</div>';
      return;
    }
    wrap.innerHTML = list.map(f => `
      <div class="fa-item" data-id="${escapeHtml(f.id)}">
        <div class="fa-item-icn">${f.kind === 'passed' ? '🕯' : '🎂'}</div>
        <div>
          <div class="fa-item-name">${escapeHtml(f.name)} ${f.relation ? `<small style="opacity:.65">· ${escapeHtml(f.relation)}</small>` : ''}</div>
          <div class="fa-item-meta">${f.kind === 'passed' ? 'יארצייט' : 'יום הולדת'} · ${escapeHtml(f.notes || '')}</div>
        </div>
        <span class="fa-item-date">${escapeHtml(f.dateLabel || '')}</span>
        <button class="fa-del" data-id="${escapeHtml(f.id)}" aria-label="מחק">×</button>
      </div>`).join('');

    wrap.querySelectorAll('.fa-del').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.dataset.id;
        const arr = load().filter(x => x.id !== id);
        save(arr);
        init();
      });
    });
  }

  async function refreshUpcoming(list){
    if (!list.length){
      $('#faUpcoming').innerHTML = '<div class="fa-upcoming-empty">אין עדיין ציונים — תוסיפי בן/ת משפחה ↑</div>';
      return;
    }

    const items = [];
    for (const f of list){
      let nextDate;
      if (f.kind === 'passed'){
        // Hebrew anniversary
        const original = new Date(f.date + 'T12:00:00');
        nextDate = await fetchYahrzeit(original);
        if (!nextDate){
          // fallback: same Gregorian day next year
          const md = f.date.slice(5);
          nextDate = nextOccurrence(md);
        }
      } else {
        // Birthday — Gregorian for now
        const md = f.date.slice(5);
        nextDate = nextOccurrence(md);
      }
      items.push({ ...f, nextDate });
    }

    items.sort((a, b) => a.nextDate - b.nextDate);

    const today = new Date(); today.setHours(0,0,0,0);
    const html = items.slice(0, 12).map(it => {
      const isToday = it.nextDate.getTime() === today.getTime();
      return `<div class="fa-upcoming-item ${isToday ? 'is-today' : ''}">
        <div class="fa-upcoming-when">${it.nextDate.getDate()}<small>${it.nextDate.toLocaleDateString('he-IL',{month:'short'})}</small></div>
        <div>
          <div class="fa-upcoming-name">${escapeHtml(it.name)}</div>
          <div class="fa-upcoming-meta">${it.kind === 'passed' ? '🕯 יארצייט' : '🎂 יום הולדת'}${it.relation ? ' · ' + escapeHtml(it.relation) : ''}</div>
        </div>
        <span class="fa-upcoming-icn">${it.kind === 'passed' ? '🕯' : '🎂'}</span>
      </div>`;
    }).join('');
    $('#faUpcoming').innerHTML = html;
  }

  $('#faForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#faName').value.trim();
    const relation = $('#faRelation').value.trim();
    const kind = $('#faKind').value;
    const date = $('#faDate').value;
    const notes = $('#faNotes').value.trim();
    if (!name || !date) return;
    const heb = await fetchHebDate(new Date(date + 'T12:00:00'));
    const dateLabel = heb ? `${heb.hd} ${heb.hm}` : date;
    const arr = load();
    arr.push({
      id: 'fam_' + Math.random().toString(36).slice(2,10),
      name, relation, kind, date, notes,
      hebDate: heb ? `${heb.hd} ${heb.hm} ${heb.hy}` : null,
      dateLabel,
      created_at: new Date().toISOString()
    });
    save(arr);
    $('#faForm').reset();
    init();
  });

  init();
})();
