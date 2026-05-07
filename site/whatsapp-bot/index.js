/* ============================================================
   MEIRAV — WhatsApp Bot connected to my-hom.net
   Built on whatsapp-web.js + Gemini AI + the existing API.

   Commands the user can send:
     "מירב" / "היי" / שאלה כללית     → Gemini AI + site context
     "תפילה <שם>"                    → Posts to Prayer Wall (cat="כללי")
     "תפילה רפואה <שם>"              → Posts to Prayer Wall (cat="רפואה")
     "חבד <עיר>"                     → Returns nearest Chabad
     "שעות שבת <עיר>"                → Hebcal candle/havdala
     "תהילים"                        → Today's daily Tehilim
     "תרומה"                         → Donation links
     "עזרה" / "?"                    → Lists commands

   Required env vars:
     GEMINI_API_KEY                  ← server-side (the bot proxies, never exposed)
     SITE_URL                        ← https://my-hom.net (used for /api/* calls)

   Run:  node whatsapp-bot/index.js
   ============================================================ */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://my-hom.net';
const PORT = process.env.PORT || 10000;

/* ─── tiny health server (Render keep-alive) ─── */
const app = express();
app.get('/', (_req, res) => res.send('🕯 Meirav WhatsApp bot is alive — my-hom.net'));
app.listen(PORT, '0.0.0.0', () => console.log('Health server on ' + PORT));

/* ─── WhatsApp client ─── */
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--no-zygote']
  }
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('✦ Scan the QR above with WhatsApp → Linked devices.');
});
client.on('ready', () => console.log('🔥 Meirav is online.'));
client.on('auth_failure', m => console.error('Auth failed:', m));

/* ─── Helpers ─── */
async function api(p, opts = {}){
  const url = SITE_URL + p;
  const init = { ...opts, headers: { 'Content-Type':'application/json', ...(opts.headers || {}) } };
  if (init.body && typeof init.body !== 'string') init.body = JSON.stringify(init.body);
  const r = await fetch(url, init);
  if (!r.ok) throw new Error('api ' + p + ' ' + r.status);
  return r.json();
}

const HELP_TEXT = `🕯 *מירב במרכז התפילה*

הנה מה שאני יודעת:
• שלחי לי שאלה כללית → אני אענה (יהדות, האתר, תפילות)
• *תפילה <שם>*  → מפרסם בקיר התפילות
• *תפילה רפואה <שם>* → קטגוריית רפואה
• *חבד <עיר>* → בית חב"ד הקרוב + Waze
• *שעות שבת <עיר>* → הדלקת נרות וצאת השבת
• *תהילים* → פרק תהילים יומי
• *תרומה* → קישורי תרומה
• *עזרה* → התפריט הזה

האתר: ${SITE_URL}
שבת שלום ✦`;

const VALID_CATS = new Set(['רפואה','פרנסה','זיווג','ילדים','שלום בית','הצלחה','הודיה','כללי']);

/* ─── Command parser ─── */
async function handle(msg){
  const text = (msg.body || '').trim();
  if (!text) return;
  const lower = text.toLowerCase();

  /* Help */
  if (text === 'עזרה' || text === '?' || lower === 'help' || lower === 'menu'){
    return msg.reply(HELP_TEXT);
  }

  /* Donation */
  if (text === 'תרומה' || lower === 'donate'){
    return msg.reply(`💝 תרומה למרכז התפילה — ${SITE_URL}/#donate\nגם בית"ק / Bit / Paybox / PayPal זמינים.`);
  }

  /* Tehilim */
  if (text === 'תהילים' || lower === 'tehilim'){
    return msg.reply(`📿 תהילים יומי — ${SITE_URL}/daily-tehilim.html\n(מתעדכן לפי יום בחודש)`);
  }

  /* Chabad search: "חבד עיר" */
  const chabadMatch = text.match(/^(?:ח[בּ]"?ד|chabad)\s+(.+)$/i);
  if (chabadMatch){
    const city = chabadMatch[1].trim();
    const url = `${SITE_URL}/world.html#${encodeURIComponent(city)}`;
    return msg.reply(`🕎 חיפוש חב"ד ב-${city}\n\nפתחי במפה: ${url}\nאו ב-Chabad.org: https://www.chabad.org/centers/default_cdo/jewish/Centers.htm?location=${encodeURIComponent(city)}`);
  }

  /* Shabbat times: "שעות שבת עיר" */
  const shabbatMatch = text.match(/^(?:שעות\s+שבת|shabbat\s+times?)\s+(.+)$/i);
  if (shabbatMatch){
    const city = shabbatMatch[1].trim();
    return msg.reply(`🕯 זמני שבת ב-${city}\n\nראי במפה: ${SITE_URL}/shabbat-candles.html\nאו ישירות מ-Hebcal: https://www.hebcal.com/shabbat?city=${encodeURIComponent(city)}`);
  }

  /* Prayer post: "תפילה [קטגוריה] שם בקשה" */
  const prayerMatch = text.match(/^(?:תפילה|prayer)\s+(.+)$/i);
  if (prayerMatch){
    let rest = prayerMatch[1].trim();
    let cat = 'כללי';
    /* If first token is a known category, take it */
    const tokens = rest.split(/\s+/);
    if (VALID_CATS.has(tokens[0])){
      cat = tokens.shift();
      rest = tokens.join(' ');
    }
    if (!rest){
      return msg.reply('כדי לבקש תפילה: *תפילה <שם>*  או  *תפילה רפואה <שם>*');
    }
    try {
      await api('/api/prayer-wall', {
        method: 'POST',
        body: { cat, for_name: rest, posted_by: msg._data?.notifyName || 'WhatsApp' }
      });
      return msg.reply(`🙏 הבקשה נוספה לקיר התפילות (${cat}): "${rest}"\nראי: ${SITE_URL}/prayer-wall.html`);
    } catch (e){
      return msg.reply('לא הצלחתי לפרסם את הבקשה כרגע. נסי שוב בעוד רגע.\n\n' + (e.message || ''));
    }
  }

  /* Default: ask Gemini via the site's /api/ai */
  try {
    const data = await api('/api/ai', {
      method: 'POST',
      body: { message: text, history: [] }
    });
    const reply = data.reply || 'לא הצלחתי לענות עכשיו. שלחי "עזרה" לתפריט.';
    return msg.reply(reply);
  } catch (e){
    return msg.reply(`✦ הבוט פעיל אבל ה-API של מירב לא זמין כרגע.\nשלחי *עזרה* לתפריט המלא, או ${SITE_URL}.`);
  }
}

client.on('message', async (msg) => {
  if (msg.fromMe) return;
  if (msg.isStatus) return;
  /* Ignore group messages unless mentioned by name "מירב" */
  if (msg.from.endsWith('@g.us') && !/(?:^|\s)מירב(?:\s|[?!,.]|$)/i.test(msg.body || '')) return;
  try { await handle(msg); }
  catch (err) { console.error('handle error:', err.message); }
});

client.initialize();
