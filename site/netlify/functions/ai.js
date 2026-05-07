/* ============================================================
   Netlify Function: /api/ai (or /.netlify/functions/ai)
   Purpose: secure proxy from Meirav (kz-ai-chat.js) to Gemini.
   The browser must NEVER hold the API key — it lives only here,
   in the Netlify env var GEMINI_API_KEY.

   To deploy:
     1. Netlify dashboard → Site settings → Environment variables
        Add: GEMINI_API_KEY = <your Google AI Studio key>
     2. (Optional) add netlify.toml redirect:
          [[redirects]]
          from = "/api/ai"
          to   = "/.netlify/functions/ai"
          status = 200
     3. Deploy.
   ============================================================ */

const SYSTEM_PROMPT = `את "מירב" — חברה דיגיטלית באתר "מרכז התפילה / הבית היהודי שלך בעולם" (my-hom.net).
את כותבת בעברית חמה, אישית, ולא רובוטית. את מכירה את האתר ויודעת להפנות:
- "בקש תפילה" → דף הבית, טופס אנונימי, קטגוריות (רפואה / פרנסה / זיווג / שלום בית / ילדים / הצלחה).
- "מפת היהדות העולמית" (find-jewish.html) — בתי חב"ד, בתי כנסת, מקוואות, מסעדות כשרות, קברי צדיקים.
- "חדר משפחה" (family-room.html) — תפילה משפחתית פרטית.
- "ספר נשמות" / "קיר נרות" (memorial.html) — יארצייט ונרות זיכרון.
- "אירועי חיים", "מנהגים ועדות", "פינת ילדים", "שאל רב", "לימוד יומי", "חסד".
- "פרשת השבוע", "זמני תפילה", "אור היום".
כללים:
1. תשובות קצרות (2-4 משפטים), חמות, עם אימוג'י עדין (✦ 🕯 🙏) — לא רובוטיות.
2. כשמתאים, להפנות בכפתור־טקסט לעמוד באתר ("היכנסי ל'מפת היהדות' ←").
3. לא להמציא הלכות. אם שאלה הלכתית — להפנות ל"שאל רב".
4. בנושאים רגישים (אבל, מחלה, בדידות) — להקשיב, לחבק, להציע פסוק קצר ופעולה קונקרטית באתר.
5. אם משתמש בשפה אחרת — לענות באותה שפה.`;

const { guarded } = require('./_security.js');

exports.handler = guarded(async (event) => {
  // CORS — allow same-site (Netlify will block cross-origin by default)
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': event.headers?.origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server missing GEMINI_API_KEY' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const userMessage = String(body.message || '').slice(0, 2000).trim();
  if (!userMessage) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Empty message' }) };

  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

  // Build Gemini-style "contents" array. Gemini doesn't have a system role per se,
  // so we prepend the system prompt as the first user/model exchange.
  const contents = [
    { role: 'user',  parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'הבנתי. אני מירב, וברוכים הבאים. במה אוכל לעזור?' }] },
    ...history
      .filter(m => m && m.role && m.text)
      .map(m => ({ role: m.role === 'bot' ? 'model' : 'user', parts: [{ text: String(m.text).slice(0, 2000) }] })),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 400,
          topP: 0.95
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream error', detail: errText.slice(0, 500) }) };
    }
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
    if (!reply) {
      return { statusCode: 200, headers, body: JSON.stringify({ reply: '🤔 לא הצלחתי לענות עכשיו. נסה לנסח שוב, או שאל אחת השאלות המהירות.' }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Network error', detail: String(err).slice(0, 300) }) };
  }
}, { limit: 10, windowMs: 60_000 });
